/**
 * Quests Store - Quest Management, Progress Tracking, Rewards
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAteriaGameStore } from '../../core/model/game.store';
import { useAteriaResourcesStore } from '../../core/model/resources.store';
import { QUESTS, getQuest, type Quest, type QuestStatus, type QuestObjective, type QuestType } from '../data/quests.data';

export interface ActiveQuest {
  questId: string;
  status: QuestStatus;
  startedAt: number;
  objectives: { [objectiveId: string]: number };
}

export interface CompletedQuest {
  questId: string;
  completedAt: number;
  rewards: string[];
}

export const useAteriaQuestsStore = defineStore('ateria-quests', () => {
  const gameStore = useAteriaGameStore();
  const resourcesStore = useAteriaResourcesStore();

  const activeQuests = ref<Map<string, ActiveQuest>>(new Map());
  const completedQuests = ref<Set<string>>(new Set());
  const questCooldowns = ref<Map<string, number>>(new Map());
  
  // Tracking stats
  const totalQuestsCompleted = ref(0);
  const mainQuestsCompleted = ref(0);
  const dailyQuestsCompleted = ref(0);
  
  // Track objective progress globally
  const globalStats = ref({
    monstersKilled: 0,
    goldEarned: 0,
    itemsCrafted: 0,
    resourcesGathered: 0,
    buildingsBuilt: 0,
    discoveriesMade: 0,
  });

  const activeQuestsList = computed(() => {
    const list: (ActiveQuest & { quest: Quest })[] = [];
    for (const [questId, active] of activeQuests.value) {
      const quest = getQuest(questId);
      if (quest) list.push({ ...active, quest });
    }
    return list;
  });

  const availableQuests = computed(() => {
    return Object.values(QUESTS).filter(quest => {
      // Already active or completed (non-repeatable)
      if (activeQuests.value.has(quest.id)) return false;
      if (completedQuests.value.has(quest.id) && !quest.repeatable) return false;
      
      // Check cooldown for repeatable quests
      if (quest.repeatable && questCooldowns.value.has(quest.id)) {
        const cooldownEnd = questCooldowns.value.get(quest.id)!;
        if (Date.now() < cooldownEnd) return false;
      }
      
      // Check requirements
      for (const req of quest.requirements) {
        if (req.type === 'quest' && req.questId && !completedQuests.value.has(req.questId)) {
          return false;
        }
        // Level and reputation requirements would need integration with other stores
      }
      
      return true;
    });
  });

  const questsByType = computed(() => {
    const byType: Record<QuestType, Quest[]> = {
      main: [],
      side: [],
      faction: [],
      daily: [],
      hidden: [],
    };
    for (const quest of availableQuests.value) {
      byType[quest.type].push(quest);
    }
    return byType;
  });

  function canAcceptQuest(questId: string): { canAccept: boolean; reason?: string } {
    const quest = getQuest(questId);
    if (!quest) return { canAccept: false, reason: 'Nieznany quest' };
    if (activeQuests.value.has(questId)) return { canAccept: false, reason: 'Quest już aktywny' };
    if (completedQuests.value.has(questId) && !quest.repeatable) return { canAccept: false, reason: 'Quest już ukończony' };
    
    // Check cooldown
    if (quest.repeatable && questCooldowns.value.has(questId)) {
      const cooldownEnd = questCooldowns.value.get(questId)!;
      if (Date.now() < cooldownEnd) {
        const remaining = Math.ceil((cooldownEnd - Date.now()) / 1000 / 60);
        return { canAccept: false, reason: `Odnowienie za ${remaining} min` };
      }
    }
    
    // Check requirements
    for (const req of quest.requirements) {
      if (req.type === 'quest' && req.questId && !completedQuests.value.has(req.questId)) {
        const reqQuest = getQuest(req.questId);
        return { canAccept: false, reason: `Wymaga ukończenia: ${reqQuest?.name}` };
      }
    }
    
    return { canAccept: true };
  }

  function acceptQuest(questId: string): boolean {
    const check = canAcceptQuest(questId);
    if (!check.canAccept) {
      gameStore.addNotification({ type: 'warning', title: 'Nie można przyjąć', message: check.reason || '', icon: 'mdi-alert' });
      return false;
    }
    
    const quest = getQuest(questId)!;
    const objectives: { [id: string]: number } = {};
    for (const obj of quest.objectives) {
      objectives[obj.id] = 0;
    }
    
    activeQuests.value.set(questId, {
      questId,
      status: 'active',
      startedAt: Date.now(),
      objectives,
    });
    
    gameStore.addNotification({
      type: 'info',
      title: 'Quest przyjęty!',
      message: quest.name,
      icon: quest.icon,
      duration: 3000,
    });
    
    return true;
  }

  function abandonQuest(questId: string): boolean {
    if (!activeQuests.value.has(questId)) return false;
    activeQuests.value.delete(questId);
    gameStore.addNotification({ type: 'info', title: 'Quest porzucony', message: '', icon: 'mdi-close' });
    return true;
  }

  function updateObjective(questId: string, objectiveId: string, amount: number = 1): boolean {
    const active = activeQuests.value.get(questId);
    if (!active || active.status !== 'active') return false;
    
    const quest = getQuest(questId);
    if (!quest) return false;
    
    const objective = quest.objectives.find(o => o.id === objectiveId);
    if (!objective) return false;
    
    const current = active.objectives[objectiveId] || 0;
    active.objectives[objectiveId] = Math.min(current + amount, objective.amount);
    
    // Check if quest is complete
    checkQuestCompletion(questId);
    
    return true;
  }

  function checkQuestCompletion(questId: string) {
    const active = activeQuests.value.get(questId);
    if (!active || active.status !== 'active') return;
    
    const quest = getQuest(questId);
    if (!quest) return;
    
    let allComplete = true;
    for (const obj of quest.objectives) {
      const current = active.objectives[obj.id] || 0;
      if (current < obj.amount) {
        allComplete = false;
        break;
      }
    }
    
    if (allComplete) {
      active.status = 'completed';
      gameStore.addNotification({
        type: 'success',
        title: 'Quest gotowy do ukończenia!',
        message: quest.name,
        icon: 'mdi-check-circle',
        duration: 4000,
      });
    }
  }

  function completeQuest(questId: string): boolean {
    const active = activeQuests.value.get(questId);
    if (!active || active.status !== 'completed') {
      gameStore.addNotification({ type: 'warning', title: 'Quest nie jest ukończony', message: '', icon: 'mdi-alert' });
      return false;
    }
    
    const quest = getQuest(questId);
    if (!quest) return false;
    
    // Grant rewards
    const rewardMessages: string[] = [];
    for (const reward of quest.rewards) {
      if (reward.type === 'gold') {
        resourcesStore.addResource('gold', reward.amount);
        rewardMessages.push(`+${reward.amount} złota`);
      }
      if (reward.type === 'legacy_points') {
        // Would integrate with prestige store
        rewardMessages.push(`+${reward.amount} LP`);
      }
      // XP, items, reputation would integrate with respective stores
      if (reward.type === 'xp') {
        rewardMessages.push(reward.description);
      }
      if (reward.type === 'reputation') {
        rewardMessages.push(reward.description);
      }
      if (reward.type === 'item') {
        rewardMessages.push(reward.description);
      }
    }
    
    // Mark as completed
    activeQuests.value.delete(questId);
    completedQuests.value.add(questId);
    totalQuestsCompleted.value++;
    
    if (quest.type === 'main') mainQuestsCompleted.value++;
    if (quest.type === 'daily') dailyQuestsCompleted.value++;
    
    // Set cooldown for repeatable quests
    if (quest.repeatable && quest.cooldown) {
      questCooldowns.value.set(questId, Date.now() + quest.cooldown * 1000);
    }
    
    gameStore.addNotification({
      type: 'success',
      title: 'Quest ukończony!',
      message: `${quest.name}\n${rewardMessages.join(', ')}`,
      icon: 'mdi-trophy',
      duration: 5000,
    });
    
    return true;
  }

  // Global progress tracking - call from other stores
  function trackKill(amount: number = 1) {
    globalStats.value.monstersKilled += amount;
    updateQuestsByObjectiveType('kill', amount);
  }

  function trackGold(amount: number) {
    globalStats.value.goldEarned += amount;
    updateQuestsByObjectiveType('gold', amount);
  }

  function trackCraft(amount: number = 1) {
    globalStats.value.itemsCrafted += amount;
    updateQuestsByObjectiveType('craft', amount);
  }

  function trackGather(amount: number = 1) {
    globalStats.value.resourcesGathered += amount;
    updateQuestsByObjectiveType('collect', amount);
  }

  function trackBuild(amount: number = 1) {
    globalStats.value.buildingsBuilt += amount;
    updateQuestsByObjectiveType('build', amount);
  }

  function trackDiscovery(amount: number = 1) {
    globalStats.value.discoveriesMade += amount;
    updateQuestsByObjectiveType('explore', amount);
  }

  function updateQuestsByObjectiveType(type: string, amount: number) {
    for (const [questId, active] of activeQuests.value) {
      if (active.status !== 'active') continue;
      
      const quest = getQuest(questId);
      if (!quest) continue;
      
      for (const obj of quest.objectives) {
        if (obj.type === type) {
          updateObjective(questId, obj.id, amount);
        }
      }
    }
  }

  function getObjectiveProgress(questId: string, objectiveId: string): number {
    return activeQuests.value.get(questId)?.objectives[objectiveId] || 0;
  }

  function isQuestComplete(questId: string): boolean {
    const active = activeQuests.value.get(questId);
    return active?.status === 'completed';
  }

  function processTick() {
    // Clean up expired cooldowns
    const now = Date.now();
    for (const [questId, cooldownEnd] of questCooldowns.value) {
      if (cooldownEnd <= now) {
        questCooldowns.value.delete(questId);
      }
    }
  }

  function getState() {
    return {
      activeQuests: Array.from(activeQuests.value.entries()),
      completedQuests: Array.from(completedQuests.value),
      questCooldowns: Array.from(questCooldowns.value.entries()),
      totalQuestsCompleted: totalQuestsCompleted.value,
      mainQuestsCompleted: mainQuestsCompleted.value,
      dailyQuestsCompleted: dailyQuestsCompleted.value,
      globalStats: globalStats.value,
    };
  }

  function loadState(state: ReturnType<typeof getState>) {
    if (state.activeQuests) activeQuests.value = new Map(state.activeQuests);
    if (state.completedQuests) completedQuests.value = new Set(state.completedQuests);
    if (state.questCooldowns) questCooldowns.value = new Map(state.questCooldowns);
    if (state.totalQuestsCompleted !== undefined) totalQuestsCompleted.value = state.totalQuestsCompleted;
    if (state.mainQuestsCompleted !== undefined) mainQuestsCompleted.value = state.mainQuestsCompleted;
    if (state.dailyQuestsCompleted !== undefined) dailyQuestsCompleted.value = state.dailyQuestsCompleted;
    if (state.globalStats) globalStats.value = state.globalStats;
  }

  function resetQuests() {
    activeQuests.value = new Map();
    completedQuests.value = new Set();
    questCooldowns.value = new Map();
    totalQuestsCompleted.value = 0;
    mainQuestsCompleted.value = 0;
    dailyQuestsCompleted.value = 0;
    globalStats.value = {
      monstersKilled: 0,
      goldEarned: 0,
      itemsCrafted: 0,
      resourcesGathered: 0,
      buildingsBuilt: 0,
      discoveriesMade: 0,
    };
  }

  function devCompleteQuest(questId: string) {
    const active = activeQuests.value.get(questId);
    if (!active) return;
    const quest = getQuest(questId);
    if (!quest) return;
    for (const obj of quest.objectives) {
      active.objectives[obj.id] = obj.amount;
    }
    active.status = 'completed';
  }

  function devUnlockAll() {
    for (const quest of Object.values(QUESTS)) {
      if (!quest.repeatable) {
        completedQuests.value.add(quest.id);
      }
    }
  }

  return {
    activeQuests, completedQuests, questCooldowns,
    totalQuestsCompleted, mainQuestsCompleted, dailyQuestsCompleted, globalStats,
    activeQuestsList, availableQuests, questsByType,
    canAcceptQuest, acceptQuest, abandonQuest,
    updateObjective, checkQuestCompletion, completeQuest,
    trackKill, trackGold, trackCraft, trackGather, trackBuild, trackDiscovery,
    getObjectiveProgress, isQuestComplete, processTick,
    getState, loadState, resetQuests,
    devCompleteQuest, devUnlockAll,
  };
}, {
  persist: {
    key: 'ateria-quests',
    serializer: {
      serialize: (state) => JSON.stringify({
        ...state,
        activeQuests: Array.from(state.activeQuests?.entries?.() || []),
        completedQuests: Array.from(state.completedQuests || []),
        questCooldowns: Array.from(state.questCooldowns?.entries?.() || []),
      }),
      deserialize: (value) => {
        const p = JSON.parse(value);
        return {
          ...p,
          activeQuests: new Map(p.activeQuests || []),
          completedQuests: new Set(p.completedQuests || []),
          questCooldowns: new Map(p.questCooldowns || []),
        };
      },
    },
  },
});
