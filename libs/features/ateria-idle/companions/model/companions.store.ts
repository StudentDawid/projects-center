/**
 * Companions Store - NPC Management, Tasks, Relationships
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAteriaGameStore } from '../../core/model/game.store';
import { useAteriaResourcesStore } from '../../core/model/resources.store';
import {
  COMPANIONS, COMPANION_TASKS, RELATIONSHIP_LEVELS, RARITY_DATA, COMPANION_CLASSES,
  getCompanion, getTask, getRelationshipLevel, calculateTaskSuccessRate,
  type CompanionData, type CompanionTask
} from '../data/companions.data';

// ============================================
// TYPES
// ============================================

export interface RecruitedCompanion {
  companionId: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  relationshipPoints: number;
  currentTaskId: string | null;
  taskStartTime: number | null;
  totalTasksCompleted: number;
  gifts: { itemId: string; count: number }[];
}

export interface ActiveTask {
  companionId: string;
  taskId: string;
  startTime: number;
  duration: number;
  successChance: number;
}

export interface CompanionStats {
  totalRecruited: number;
  totalTasksCompleted: number;
  totalGiftsGiven: number;
  favoriteCompanion: string | null;
}

// ============================================
// STORE
// ============================================

export const useAteriaCompanionsStore = defineStore('ateria-companions', () => {
  const gameStore = useAteriaGameStore();
  const resourcesStore = useAteriaResourcesStore();

  // ============================================
  // STATE
  // ============================================

  const recruitedCompanions = ref<Map<string, RecruitedCompanion>>(new Map());
  const activeTasks = ref<Map<string, ActiveTask>>(new Map());
  const maxCompanions = ref<number>(3);
  
  const stats = ref<CompanionStats>({
    totalRecruited: 0,
    totalTasksCompleted: 0,
    totalGiftsGiven: 0,
    favoriteCompanion: null,
  });

  // ============================================
  // COMPUTED
  // ============================================

  const recruitedCount = computed(() => recruitedCompanions.value.size);

  const canRecruitMore = computed(() => recruitedCount.value < maxCompanions.value);

  const availableCompanions = computed(() => {
    return COMPANIONS.filter(c => !recruitedCompanions.value.has(c.id));
  });

  const companionList = computed(() => {
    return Array.from(recruitedCompanions.value.entries()).map(([id, data]) => ({
      ...getCompanion(id)!,
      ...data,
    }));
  });

  const idleCompanions = computed(() => {
    return companionList.value.filter(c => !activeTasks.value.has(c.companionId));
  });

  const busyCompanions = computed(() => {
    return companionList.value.filter(c => activeTasks.value.has(c.companionId));
  });

  // ============================================
  // RECRUITMENT
  // ============================================

  function canRecruit(companionId: string): { canRecruit: boolean; reason?: string } {
    if (!canRecruitMore.value) {
      return { canRecruit: false, reason: `Maksymalna liczba towarzyszy: ${maxCompanions.value}` };
    }

    if (recruitedCompanions.value.has(companionId)) {
      return { canRecruit: false, reason: 'Już zrekrutowany' };
    }

    const companion = getCompanion(companionId);
    if (!companion) {
      return { canRecruit: false, reason: 'Nieznany towarzysz' };
    }

    // Check requirement (simplified)
    const req = companion.recruitRequirement;
    if (req.type === 'gold') {
      if (resourcesStore.resources.gold < (req.value as number)) {
        return { canRecruit: false, reason: `Wymaga ${req.value} złota` };
      }
    }

    return { canRecruit: true };
  }

  function recruit(companionId: string): boolean {
    const check = canRecruit(companionId);
    if (!check.canRecruit) {
      gameStore.addNotification({ type: 'warning', title: 'Nie można zrekrutować', message: check.reason || '', icon: 'mdi-alert' });
      return false;
    }

    const companion = getCompanion(companionId)!;

    // Pay cost if gold
    if (companion.recruitRequirement.type === 'gold') {
      resourcesStore.addResource('gold', -(companion.recruitRequirement.value as number));
    }

    recruitedCompanions.value.set(companionId, {
      companionId,
      level: 1,
      xp: 0,
      xpToNextLevel: 100,
      relationshipPoints: 0,
      currentTaskId: null,
      taskStartTime: null,
      totalTasksCompleted: 0,
      gifts: [],
    });

    stats.value.totalRecruited++;

    gameStore.addNotification({
      type: 'success',
      title: 'Nowy towarzysz!',
      message: `${companion.name} dołączył do twojej drużyny!`,
      icon: companion.icon,
      duration: 4000,
    });

    return true;
  }

  function dismiss(companionId: string): boolean {
    if (!recruitedCompanions.value.has(companionId)) return false;

    // Cancel any active task
    if (activeTasks.value.has(companionId)) {
      activeTasks.value.delete(companionId);
    }

    recruitedCompanions.value.delete(companionId);

    const companion = getCompanion(companionId);
    gameStore.addNotification({
      type: 'info',
      title: 'Towarzysz odszedł',
      message: `${companion?.name || 'Towarzysz'} opuścił drużynę`,
      icon: 'mdi-account-remove',
      duration: 3000,
    });

    return true;
  }

  // ============================================
  // TASKS
  // ============================================

  function canStartTask(companionId: string, taskId: string): { canStart: boolean; reason?: string } {
    if (!recruitedCompanions.value.has(companionId)) {
      return { canStart: false, reason: 'Towarzysz nie zrekrutowany' };
    }

    if (activeTasks.value.has(companionId)) {
      return { canStart: false, reason: 'Towarzysz jest zajęty' };
    }

    const task = getTask(taskId);
    if (!task) {
      return { canStart: false, reason: 'Nieznane zadanie' };
    }

    return { canStart: true };
  }

  function startTask(companionId: string, taskId: string): boolean {
    const check = canStartTask(companionId, taskId);
    if (!check.canStart) {
      gameStore.addNotification({ type: 'warning', title: 'Nie można rozpocząć', message: check.reason || '', icon: 'mdi-alert' });
      return false;
    }

    const companion = getCompanion(companionId)!;
    const companionData = recruitedCompanions.value.get(companionId)!;
    const task = getTask(taskId)!;

    const successChance = calculateTaskSuccessRate(
      companion,
      task,
      companionData.level,
      companionData.relationshipPoints
    );

    activeTasks.value.set(companionId, {
      companionId,
      taskId,
      startTime: Date.now(),
      duration: task.duration * 60 * 1000,
      successChance,
    });

    companionData.currentTaskId = taskId;
    companionData.taskStartTime = Date.now();

    gameStore.addNotification({
      type: 'info',
      title: `${companion.name} rozpoczyna zadanie`,
      message: task.name,
      icon: task.icon,
      duration: 2000,
    });

    return true;
  }

  function completeTask(companionId: string) {
    const activeTask = activeTasks.value.get(companionId);
    if (!activeTask) return;

    const companion = getCompanion(companionId)!;
    const companionData = recruitedCompanions.value.get(companionId)!;
    const task = getTask(activeTask.taskId)!;

    // Roll for success
    const success = Math.random() * 100 < activeTask.successChance;

    if (success) {
      // Grant rewards
      addXp(companionId, task.rewards.companionXp);
      addRelationship(companionId, task.rewards.relationshipPoints || 0);

      if (task.rewards.playerRewards) {
        if (task.rewards.playerRewards.gold) {
          resourcesStore.addResource('gold', task.rewards.playerRewards.gold);
        }
        if (task.rewards.playerRewards.xp) {
          // Would add to warrior XP
        }
      }

      companionData.totalTasksCompleted++;
      stats.value.totalTasksCompleted++;

      // Random dialogue
      const dialogue = companion.dialogues.task_complete[
        Math.floor(Math.random() * companion.dialogues.task_complete.length)
      ];

      gameStore.addNotification({
        type: 'success',
        title: `${companion.name}: Zadanie ukończone!`,
        message: `"${dialogue}" - ${task.name}`,
        icon: 'mdi-check-circle',
        duration: 4000,
      });
    } else {
      // Failed task - partial rewards
      addXp(companionId, Math.floor(task.rewards.companionXp * 0.25));

      gameStore.addNotification({
        type: 'warning',
        title: `${companion.name}: Zadanie nieudane`,
        message: task.name,
        icon: 'mdi-alert-circle',
        duration: 3000,
      });
    }

    // Clear task
    activeTasks.value.delete(companionId);
    companionData.currentTaskId = null;
    companionData.taskStartTime = null;
  }

  function cancelTask(companionId: string) {
    if (!activeTasks.value.has(companionId)) return;

    const companionData = recruitedCompanions.value.get(companionId);
    if (companionData) {
      companionData.currentTaskId = null;
      companionData.taskStartTime = null;
    }

    activeTasks.value.delete(companionId);
  }

  function getTaskProgress(companionId: string): number {
    const activeTask = activeTasks.value.get(companionId);
    if (!activeTask) return 0;

    const elapsed = Date.now() - activeTask.startTime;
    return Math.min(100, (elapsed / activeTask.duration) * 100);
  }

  // ============================================
  // LEVELING & RELATIONSHIPS
  // ============================================

  function addXp(companionId: string, amount: number) {
    const companionData = recruitedCompanions.value.get(companionId);
    if (!companionData) return;

    companionData.xp += amount;

    while (companionData.xp >= companionData.xpToNextLevel) {
      companionData.xp -= companionData.xpToNextLevel;
      companionData.level++;
      companionData.xpToNextLevel = Math.floor(companionData.xpToNextLevel * 1.5);

      const companion = getCompanion(companionId);
      const dialogue = companion?.dialogues.level_up[
        Math.floor(Math.random() * (companion?.dialogues.level_up.length || 1))
      ];

      gameStore.addNotification({
        type: 'success',
        title: `${companion?.name} awansował!`,
        message: `Poziom ${companionData.level}! "${dialogue}"`,
        icon: 'mdi-arrow-up-bold',
        duration: 4000,
      });
    }
  }

  function addRelationship(companionId: string, amount: number) {
    const companionData = recruitedCompanions.value.get(companionId);
    if (!companionData) return;

    const oldLevel = getRelationshipLevel(companionData.relationshipPoints);
    companionData.relationshipPoints += amount;
    const newLevel = getRelationshipLevel(companionData.relationshipPoints);

    if (newLevel.level !== oldLevel.level) {
      const companion = getCompanion(companionId);
      const levelNames: Record<string, string> = {
        stranger: 'Nieznajomy',
        acquaintance: 'Znajomy',
        friend: 'Przyjaciel',
        trusted: 'Zaufany',
        devoted: 'Oddany',
        soulbound: 'Połączony Duszą',
      };

      gameStore.addNotification({
        type: 'success',
        title: 'Relacja się pogłębiła!',
        message: `${companion?.name} jest teraz: ${levelNames[newLevel.level]}`,
        icon: 'mdi-heart',
        duration: 4000,
      });
    }
  }

  function giveGift(companionId: string, itemId: string) {
    const companionData = recruitedCompanions.value.get(companionId);
    const companion = getCompanion(companionId);
    if (!companionData || !companion) return;

    let points = 10; // Base gift points

    if (companion.gift_preferences.likes.includes(itemId)) {
      points = 50;
      gameStore.addNotification({
        type: 'success',
        title: `${companion.name} uwielbia ten prezent!`,
        message: '+50 punktów relacji',
        icon: 'mdi-heart',
        duration: 3000,
      });
    } else if (companion.gift_preferences.dislikes.includes(itemId)) {
      points = -20;
      gameStore.addNotification({
        type: 'warning',
        title: `${companion.name} nie lubi tego prezentu...`,
        message: '-20 punktów relacji',
        icon: 'mdi-heart-broken',
        duration: 3000,
      });
    }

    addRelationship(companionId, points);
    stats.value.totalGiftsGiven++;

    // Track gift
    const existingGift = companionData.gifts.find(g => g.itemId === itemId);
    if (existingGift) {
      existingGift.count++;
    } else {
      companionData.gifts.push({ itemId, count: 1 });
    }
  }

  // ============================================
  // PROCESS TICK
  // ============================================

  function processTick() {
    // Check for completed tasks
    for (const [companionId, task] of activeTasks.value) {
      const elapsed = Date.now() - task.startTime;
      if (elapsed >= task.duration) {
        completeTask(companionId);
      }
    }
  }

  // ============================================
  // UTILITY
  // ============================================

  function getCompanionData(companionId: string) {
    return recruitedCompanions.value.get(companionId);
  }

  function getActiveTask(companionId: string) {
    return activeTasks.value.get(companionId);
  }

  function increaseMaxCompanions() {
    maxCompanions.value++;
  }

  // ============================================
  // SAVE/LOAD
  // ============================================

  function resetCompanions() {
    recruitedCompanions.value = new Map();
    activeTasks.value = new Map();
    maxCompanions.value = 3;
    stats.value = {
      totalRecruited: 0,
      totalTasksCompleted: 0,
      totalGiftsGiven: 0,
      favoriteCompanion: null,
    };
  }

  return {
    // State
    recruitedCompanions, activeTasks, maxCompanions, stats,

    // Computed
    recruitedCount, canRecruitMore, availableCompanions,
    companionList, idleCompanions, busyCompanions,

    // Recruitment
    canRecruit, recruit, dismiss,

    // Tasks
    canStartTask, startTask, completeTask, cancelTask, getTaskProgress,

    // Leveling & Relationships
    addXp, addRelationship, giveGift,

    // Utility
    getCompanionData, getActiveTask, increaseMaxCompanions,

    // Lifecycle
    processTick, resetCompanions,
  };
}, {
  persist: {
    key: 'ateria-companions',
    serializer: {
      serialize: (state) => JSON.stringify({
        ...state,
        recruitedCompanions: Array.from(state.recruitedCompanions?.entries?.() || []),
        activeTasks: [], // Don't persist active tasks
      }),
      deserialize: (value) => {
        const p = JSON.parse(value);
        return {
          ...p,
          recruitedCompanions: new Map(p.recruitedCompanions || []),
          activeTasks: new Map(),
        };
      },
    },
  },
});
