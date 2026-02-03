/**
 * Diplomat Store - Factions, Reputation, Missions, Influence
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAteriaGameStore } from '../../core/model/game.store';
import { useAteriaResourcesStore } from '../../core/model/resources.store';
import {
  FACTIONS,
  DIPLOMAT_MISSIONS,
  REPUTATION_THRESHOLDS,
  getFaction,
  getMission,
  getReputationTier,
  getAvailableMissions,
  calculateMissionSuccessChance,
  calculateDiplomatXpToLevel,
  type FactionId,
  type DiplomatMission,
  type DiplomatStats,
  type DiplomatSkillProgress,
  type ReputationTier,
} from '../data/diplomat.data';

// ============================================
// TYPES
// ============================================

export interface ActiveMission {
  missionId: string;
  startTime: number;
  ticksRemaining: number;
  totalTicks: number;
}

export interface MissionResult {
  missionId: string;
  success: boolean;
  xpGained: number;
  influenceGained: number;
  reputationChanges: { factionId: FactionId; change: number }[];
  resourcesGained: { resourceId: string; amount: number }[];
  timestamp: number;
}

// ============================================
// STORE
// ============================================

export const useAteriaDiplomatStore = defineStore('ateria-diplomat', () => {
  const gameStore = useAteriaGameStore();
  const resourcesStore = useAteriaResourcesStore();

  // ============================================
  // STATE
  // ============================================

  // Diplomat progression
  const progress = ref<DiplomatSkillProgress>({
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    totalXp: 0,
  });

  // Stats
  const stats = ref<DiplomatStats>({
    charisma: 5,
    persuasion: 5,
    intrigue: 5,
    renown: 0,
  });

  // Faction reputations (-100 to +100)
  const reputations = ref<Record<FactionId, number>>({
    kingdom_of_ateria: 0,
    thieves_guild: 0,
    mountain_clan: 0,
    mages_order: 0,
    forest_tribe: 0,
    merchant_confederation: 0,
    void_cult: -20, // Start negative with void cult
  });

  // Influence points
  const influence = ref(0);
  const totalInfluenceEarned = ref(0);

  // Active mission
  const activeMission = ref<ActiveMission | null>(null);

  // Mission cooldowns
  const missionCooldowns = ref<Map<string, number>>(new Map());

  // Mission history
  const missionHistory = ref<MissionResult[]>([]);

  // Unlocked titles
  const unlockedTitles = ref<string[]>([]);

  // Active title
  const activeTitle = ref<string | null>(null);

  // ============================================
  // COMPUTED
  // ============================================

  const isOnMission = computed(() => activeMission.value !== null);

  const missionProgress = computed(() => {
    if (!activeMission.value) return 0;
    const total = activeMission.value.totalTicks;
    const remaining = activeMission.value.ticksRemaining;
    return ((total - remaining) / total) * 100;
  });

  const currentMission = computed(() => {
    if (!activeMission.value) return null;
    return getMission(activeMission.value.missionId);
  });

  const availableMissions = computed(() => {
    return getAvailableMissions(progress.value.level, stats.value, reputations.value);
  });

  const factionData = computed(() => {
    return Object.entries(FACTIONS).map(([id, faction]) => {
      const rep = reputations.value[id as FactionId];
      const tier = getReputationTier(rep);
      const tierData = REPUTATION_THRESHOLDS[tier];
      
      return {
        ...faction,
        reputation: rep,
        tier,
        tierLabel: tierData.label,
        tierColor: tierData.color,
      };
    });
  });

  const totalReputationScore = computed(() => {
    return Object.values(reputations.value).reduce((sum, rep) => sum + Math.max(0, rep), 0);
  });

  // ============================================
  // ACTIONS - XP & LEVELING
  // ============================================

  function addXp(amount: number) {
    progress.value.xp += amount;
    progress.value.totalXp += amount;

    while (progress.value.xp >= progress.value.xpToNextLevel) {
      progress.value.xp -= progress.value.xpToNextLevel;
      progress.value.level++;
      progress.value.xpToNextLevel = calculateDiplomatXpToLevel(progress.value.level);

      // Stat points on level up
      stats.value.charisma += 1;
      stats.value.persuasion += 1;
      if (progress.value.level % 3 === 0) stats.value.intrigue += 1;

      gameStore.addNotification({
        type: 'success',
        title: `Dyplomata - Poziom ${progress.value.level}!`,
        message: 'Nowe misje i umiejętności dostępne!',
        icon: 'mdi-account-tie',
        duration: 3000,
      });
    }
  }

  function getXpProgress(): number {
    return (progress.value.xp / progress.value.xpToNextLevel) * 100;
  }

  // ============================================
  // ACTIONS - REPUTATION
  // ============================================

  function addReputation(factionId: FactionId, amount: number) {
    const oldRep = reputations.value[factionId];
    const oldTier = getReputationTier(oldRep);
    
    reputations.value[factionId] = Math.max(-100, Math.min(100, oldRep + amount));
    
    const newTier = getReputationTier(reputations.value[factionId]);
    const faction = getFaction(factionId);

    // Check for tier change
    if (newTier !== oldTier) {
      const tierData = REPUTATION_THRESHOLDS[newTier];
      
      if (amount > 0) {
        gameStore.addNotification({
          type: 'success',
          title: `Reputacja: ${faction.name}`,
          message: `Osiągnięto status: ${tierData.label}`,
          icon: faction.icon,
          duration: 3000,
        });

        // Check for title unlocks
        if (newTier === 'allied') {
          const titleId = `${factionId}_allied_title`;
          if (!unlockedTitles.value.includes(titleId)) {
            unlockedTitles.value.push(titleId);
            gameStore.addNotification({
              type: 'success',
              title: 'Nowy Tytuł!',
              message: `Odblokowano tytuł sojusznika ${faction.name}`,
              icon: 'mdi-crown',
              duration: 4000,
            });
          }
        }
      } else {
        gameStore.addNotification({
          type: 'warning',
          title: `Reputacja: ${faction.name}`,
          message: `Spadek do statusu: ${tierData.label}`,
          icon: faction.icon,
          duration: 3000,
        });
      }
    }

    // Update renown based on positive reputations
    updateRenown();

    // Handle faction relationships (gaining rep with one may affect others)
    handleFactionRelationships(factionId, amount);
  }

  function handleFactionRelationships(factionId: FactionId, amount: number) {
    const faction = getFaction(factionId);
    
    // Gaining rep with a faction slightly improves rep with allies
    if (amount > 0) {
      for (const allyId of faction.allies) {
        const allyBonus = Math.floor(amount * 0.2);
        if (allyBonus > 0) {
          reputations.value[allyId] = Math.max(-100, Math.min(100, reputations.value[allyId] + allyBonus));
        }
      }
      
      // Gaining rep with a faction slightly decreases rep with enemies
      for (const enemyId of faction.enemies) {
        const enemyPenalty = Math.floor(amount * 0.1);
        if (enemyPenalty > 0) {
          reputations.value[enemyId] = Math.max(-100, Math.min(100, reputations.value[enemyId] - enemyPenalty));
        }
      }
    }
  }

  function updateRenown() {
    // Renown is based on total positive reputation
    stats.value.renown = Math.floor(totalReputationScore.value / 10);
  }

  function getReputationTierForFaction(factionId: FactionId): ReputationTier {
    return getReputationTier(reputations.value[factionId]);
  }

  // ============================================
  // ACTIONS - INFLUENCE
  // ============================================

  function addInfluence(amount: number) {
    influence.value += amount;
    totalInfluenceEarned.value += amount;
  }

  function spendInfluence(amount: number): boolean {
    if (influence.value < amount) return false;
    influence.value -= amount;
    return true;
  }

  // ============================================
  // ACTIONS - MISSIONS
  // ============================================

  function canStartMission(missionId: string): { canStart: boolean; reason?: string } {
    const mission = getMission(missionId);
    if (!mission) return { canStart: false, reason: 'Nieznana misja' };

    if (isOnMission.value) {
      return { canStart: false, reason: 'Już jesteś na misji' };
    }

    // Check cooldown
    const cooldownEnd = missionCooldowns.value.get(missionId);
    if (cooldownEnd && cooldownEnd > Date.now()) {
      const remaining = Math.ceil((cooldownEnd - Date.now()) / 1000);
      return { canStart: false, reason: `Cooldown: ${remaining}s` };
    }

    // Check level
    if (mission.requiredLevel > progress.value.level) {
      return { canStart: false, reason: `Wymaga poziomu ${mission.requiredLevel}` };
    }

    // Check reputation
    if (mission.requiredReputation) {
      const rep = reputations.value[mission.requiredReputation.factionId];
      const tier = getReputationTier(rep);
      const requiredTier = mission.requiredReputation.minTier;
      const tierOrder: ReputationTier[] = ['hostile', 'unfriendly', 'neutral', 'friendly', 'honored', 'allied'];
      if (tierOrder.indexOf(tier) < tierOrder.indexOf(requiredTier)) {
        const faction = getFaction(mission.requiredReputation.factionId);
        return { canStart: false, reason: `Wymaga ${REPUTATION_THRESHOLDS[requiredTier].label} z ${faction.name}` };
      }
    }

    // Check stats
    if (mission.requiredStats) {
      for (const [stat, required] of Object.entries(mission.requiredStats)) {
        if (stats.value[stat as keyof DiplomatStats] < required) {
          return { canStart: false, reason: `Wymaga ${required} ${stat}` };
        }
      }
    }

    return { canStart: true };
  }

  function startMission(missionId: string): boolean {
    const check = canStartMission(missionId);
    if (!check.canStart) {
      gameStore.addNotification({
        type: 'warning',
        title: 'Nie można rozpocząć misji',
        message: check.reason || 'Nieznany błąd',
        icon: 'mdi-alert',
      });
      return false;
    }

    const mission = getMission(missionId)!;

    activeMission.value = {
      missionId,
      startTime: Date.now(),
      ticksRemaining: mission.duration,
      totalTicks: mission.duration,
    };

    return true;
  }

  function cancelMission() {
    activeMission.value = null;
  }

  function processMissionTick() {
    if (!activeMission.value) return;

    activeMission.value.ticksRemaining--;

    if (activeMission.value.ticksRemaining <= 0) {
      completeMission();
    }
  }

  function completeMission() {
    if (!activeMission.value) return;

    const mission = getMission(activeMission.value.missionId);
    if (!mission) return;

    // Calculate success
    const successChance = calculateMissionSuccessChance(mission, stats.value);
    const roll = Math.random() * 100;
    const success = roll < successChance;

    const result: MissionResult = {
      missionId: mission.id,
      success,
      xpGained: 0,
      influenceGained: 0,
      reputationChanges: [],
      resourcesGained: [],
      timestamp: Date.now(),
    };

    if (success) {
      // XP
      result.xpGained = mission.xpReward;
      addXp(mission.xpReward);

      // Influence
      result.influenceGained = mission.influenceReward;
      addInfluence(mission.influenceReward);

      // Reputation
      for (const repReward of mission.reputationRewards) {
        addReputation(repReward.factionId, repReward.amount);
        result.reputationChanges.push({
          factionId: repReward.factionId,
          change: repReward.amount,
        });
      }

      // Resources
      if (mission.resourceRewards) {
        for (const resReward of mission.resourceRewards) {
          resourcesStore.addResource(resReward.resourceId as any, resReward.amount);
          result.resourcesGained.push(resReward);
        }
      }

      gameStore.addNotification({
        type: 'success',
        title: 'Misja Ukończona!',
        message: `${mission.name} - Sukces!`,
        icon: mission.icon,
        duration: 3000,
      });
    } else {
      // Partial XP on failure
      const partialXp = Math.floor(mission.xpReward * 0.25);
      result.xpGained = partialXp;
      addXp(partialXp);

      // Small reputation loss on failure
      for (const repReward of mission.reputationRewards) {
        const penalty = Math.floor(repReward.amount * -0.2);
        addReputation(repReward.factionId, penalty);
        result.reputationChanges.push({
          factionId: repReward.factionId,
          change: penalty,
        });
      }

      gameStore.addNotification({
        type: 'warning',
        title: 'Misja Nieudana',
        message: `${mission.name} - Porażka...`,
        icon: 'mdi-close-circle',
        duration: 3000,
      });
    }

    // Set cooldown
    if (mission.cooldown > 0) {
      missionCooldowns.value.set(mission.id, Date.now() + mission.cooldown * 100);
    }

    // Add to history
    missionHistory.value.unshift(result);
    if (missionHistory.value.length > 50) {
      missionHistory.value = missionHistory.value.slice(0, 50);
    }

    // Clear active mission
    activeMission.value = null;
  }

  // ============================================
  // ACTIONS - TITLES
  // ============================================

  function setActiveTitle(titleId: string | null) {
    if (titleId && !unlockedTitles.value.includes(titleId)) return;
    activeTitle.value = titleId;
  }

  function getTitleName(titleId: string): string {
    const titleNames: Record<string, string> = {
      kingdom_of_ateria_allied_title: 'Rycerz Królestwa',
      thieves_guild_allied_title: 'Mistrz Cienia',
      mountain_clan_allied_title: 'Przyjaciel Krasnoludów',
      mages_order_allied_title: 'Magiczny Adept',
      forest_tribe_allied_title: 'Strażnik Lasu',
      merchant_confederation_allied_title: 'Książę Handlu',
      void_cult_allied_title: 'Wędrowiec Pustki',
    };
    return titleNames[titleId] || titleId;
  }

  // ============================================
  // ACTIONS - FACTION BONUSES
  // ============================================

  function getActiveBonuses(): { factionId: FactionId; effects: any[] }[] {
    const bonuses: { factionId: FactionId; effects: any[] }[] = [];

    for (const [factionId, rep] of Object.entries(reputations.value)) {
      const tier = getReputationTier(rep);
      const faction = getFaction(factionId as FactionId);
      
      for (const bonus of faction.bonuses) {
        const tierOrder: ReputationTier[] = ['hostile', 'unfriendly', 'neutral', 'friendly', 'honored', 'allied'];
        if (tierOrder.indexOf(tier) >= tierOrder.indexOf(bonus.tier)) {
          bonuses.push({
            factionId: factionId as FactionId,
            effects: bonus.effects,
          });
        }
      }
    }

    return bonuses;
  }

  // ============================================
  // ACTIONS - GAME LOOP
  // ============================================

  function processTick() {
    if (isOnMission.value) {
      processMissionTick();
    }

    // Clean up expired cooldowns
    const now = Date.now();
    for (const [missionId, cooldownEnd] of missionCooldowns.value) {
      if (cooldownEnd <= now) {
        missionCooldowns.value.delete(missionId);
      }
    }
  }

  // ============================================
  // SAVE/LOAD
  // ============================================

  function getState() {
    return {
      progress: progress.value,
      stats: stats.value,
      reputations: reputations.value,
      influence: influence.value,
      totalInfluenceEarned: totalInfluenceEarned.value,
      missionCooldowns: Array.from(missionCooldowns.value.entries()),
      missionHistory: missionHistory.value,
      unlockedTitles: unlockedTitles.value,
      activeTitle: activeTitle.value,
    };
  }

  function loadState(state: ReturnType<typeof getState>) {
    if (state.progress) progress.value = state.progress;
    if (state.stats) stats.value = state.stats;
    if (state.reputations) reputations.value = state.reputations;
    if (state.influence !== undefined) influence.value = state.influence;
    if (state.totalInfluenceEarned !== undefined) totalInfluenceEarned.value = state.totalInfluenceEarned;
    if (state.missionCooldowns) missionCooldowns.value = new Map(state.missionCooldowns);
    if (state.missionHistory) missionHistory.value = state.missionHistory;
    if (state.unlockedTitles) unlockedTitles.value = state.unlockedTitles;
    if (state.activeTitle !== undefined) activeTitle.value = state.activeTitle;
  }

  function resetDiplomat() {
    progress.value = { level: 1, xp: 0, xpToNextLevel: 100, totalXp: 0 };
    stats.value = { charisma: 5, persuasion: 5, intrigue: 5, renown: 0 };
    reputations.value = {
      kingdom_of_ateria: 0,
      thieves_guild: 0,
      mountain_clan: 0,
      mages_order: 0,
      forest_tribe: 0,
      merchant_confederation: 0,
      void_cult: -20,
    };
    influence.value = 0;
    totalInfluenceEarned.value = 0;
    activeMission.value = null;
    missionCooldowns.value = new Map();
    missionHistory.value = [];
    unlockedTitles.value = [];
    activeTitle.value = null;
  }

  // ============================================
  // DEV HELPERS
  // ============================================

  function devAddXp(amount: number) {
    addXp(amount);
  }

  function devAddReputation(factionId: FactionId, amount: number) {
    addReputation(factionId, amount);
  }

  function devMaxReputations() {
    for (const factionId of Object.keys(FACTIONS) as FactionId[]) {
      reputations.value[factionId] = 100;
    }
    updateRenown();
  }

  return {
    // State
    progress,
    stats,
    reputations,
    influence,
    totalInfluenceEarned,
    activeMission,
    missionCooldowns,
    missionHistory,
    unlockedTitles,
    activeTitle,

    // Computed
    isOnMission,
    missionProgress,
    currentMission,
    availableMissions,
    factionData,
    totalReputationScore,

    // XP
    addXp,
    getXpProgress,

    // Reputation
    addReputation,
    getReputationTierForFaction,

    // Influence
    addInfluence,
    spendInfluence,

    // Missions
    canStartMission,
    startMission,
    cancelMission,

    // Titles
    setActiveTitle,
    getTitleName,

    // Bonuses
    getActiveBonuses,

    // Game Loop
    processTick,

    // Save/Load
    getState,
    loadState,
    resetDiplomat,

    // Dev
    devAddXp,
    devAddReputation,
    devMaxReputations,
  };
}, {
  persist: {
    key: 'ateria-diplomat',
    serializer: {
      serialize: (state) => {
        return JSON.stringify({
          ...state,
          missionCooldowns: Array.from(state.missionCooldowns?.entries?.() || []),
        });
      },
      deserialize: (value) => {
        const parsed = JSON.parse(value);
        return {
          ...parsed,
          missionCooldowns: new Map(parsed.missionCooldowns || []),
        };
      },
    },
  },
});
