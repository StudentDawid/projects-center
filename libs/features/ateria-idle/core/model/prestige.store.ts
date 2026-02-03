/**
 * Prestige Store - Manages the prestige/legacy system
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAteriaGameStore } from './game.store';
import { useAteriaWarriorStore } from '../../warrior/model/warrior.store';
import { useAteriaMerchantStore } from '../../merchant/model/merchant.store';
import { useAteriaScientistStore } from '../../scientist/model/scientist.store';
import { useAteriaAchievementsStore } from './achievements.store';
import { useAteriaResourcesStore } from './resources.store';
import {
  LEGACY_UPGRADES,
  PRESTIGE_GATES,
  PRESTIGE_REQUIREMENTS,
  PRESTIGE_MILESTONES,
  calculatePrestigeLP,
  calculateUpgradeCost,
  getLegacyUpgrade,
  areRequirementsMet,
  getNextMilestone,
  getMilestoneRewards,
  type LegacyUpgradeDefinition,
  type PrestigeGateDefinition,
  type LPCalculation,
} from '../../data/prestige.data';
import type { PrestigeGateId } from '@libs/entities/ateria-idle/game';

export const useAteriaPrestigeStore = defineStore('ateria-prestige', () => {
  // ============================================
  // STATE
  // ============================================

  // Prestige count
  const prestigeCount = ref(0);

  // Legacy Points
  const legacyPoints = ref(0);
  const totalLPEarned = ref(0);

  // Purchased upgrades: Map<upgradeId, level>
  const purchasedUpgrades = ref<Map<string, number>>(new Map());

  // Completed prestige gates
  const completedGates = ref<Set<PrestigeGateId>>(new Set());

  // Unlocked titles from prestige
  const unlockedTitles = ref<string[]>([]);
  const activeTitle = ref<string | null>(null);

  // Stats tracking
  const prestigeStats = ref({
    fastestPrestigeTime: Infinity, // In seconds
    highestLPSinglePrestige: 0,
    totalTimePlayed: 0,
    lastPrestigeTimestamp: 0,
  });

  // ============================================
  // COMPUTED
  // ============================================

  const canPrestige = computed(() => {
    const warriorStore = useAteriaWarriorStore();
    const merchantStore = useAteriaMerchantStore();
    const scientistStore = useAteriaScientistStore();
    const achievementsStore = useAteriaAchievementsStore();

    const totalLevel = warriorStore.stats.level + merchantStore.merchantLevel + scientistStore.level;

    return (
      warriorStore.stats.level >= PRESTIGE_REQUIREMENTS.minWarriorLevel &&
      totalLevel >= PRESTIGE_REQUIREMENTS.minTotalLevel &&
      achievementsStore.unlockedCount >= PRESTIGE_REQUIREMENTS.minAchievements
    );
  });

  const prestigeProgress = computed(() => {
    const warriorStore = useAteriaWarriorStore();
    const merchantStore = useAteriaMerchantStore();
    const scientistStore = useAteriaScientistStore();
    const achievementsStore = useAteriaAchievementsStore();

    const totalLevel = warriorStore.stats.level + merchantStore.merchantLevel + scientistStore.level;

    return {
      warriorLevel: {
        current: warriorStore.stats.level,
        required: PRESTIGE_REQUIREMENTS.minWarriorLevel,
        met: warriorStore.stats.level >= PRESTIGE_REQUIREMENTS.minWarriorLevel,
      },
      totalLevel: {
        current: totalLevel,
        required: PRESTIGE_REQUIREMENTS.minTotalLevel,
        met: totalLevel >= PRESTIGE_REQUIREMENTS.minTotalLevel,
      },
      achievements: {
        current: achievementsStore.unlockedCount,
        required: PRESTIGE_REQUIREMENTS.minAchievements,
        met: achievementsStore.unlockedCount >= PRESTIGE_REQUIREMENTS.minAchievements,
      },
    };
  });

  const estimatedLP = computed((): LPCalculation => {
    const warriorStore = useAteriaWarriorStore();
    const merchantStore = useAteriaMerchantStore();
    const scientistStore = useAteriaScientistStore();
    const achievementsStore = useAteriaAchievementsStore();

    return calculatePrestigeLP(
      warriorStore.stats.level,
      merchantStore.merchantLevel,
      scientistStore.level,
      warriorStore.slayer.level,
      warriorStore.completedDungeons.size,
      achievementsStore.unlockedCount,
      prestigeCount.value
    );
  });

  const totalUpgradeLevel = computed(() => {
    let total = 0;
    for (const level of purchasedUpgrades.value.values()) {
      total += level;
    }
    return total;
  });

  const availableUpgrades = computed(() => {
    return LEGACY_UPGRADES.filter(upgrade => 
      areRequirementsMet(upgrade, purchasedUpgrades.value)
    );
  });

  const nextMilestone = computed(() => {
    return getNextMilestone(prestigeCount.value);
  });

  const earnedMilestones = computed(() => {
    return getMilestoneRewards(prestigeCount.value);
  });

  // Calculate all active bonuses from purchased upgrades
  const activeBonuses = computed(() => {
    const bonuses = {
      xpMultiplier: 1,
      goldMultiplier: 1,
      startingGold: 0,
      startingWarriorLevel: 1,
      unlockRequirementReduction: 0,
      warriorDamageBonus: 0,
      warriorCritBonus: 0,
      warriorHpBonus: 0,
      warriorRecoveryBonus: 0,
      slayerXpBonus: 0,
      merchantGoldBonus: 0,
      merchantCharismaBonus: 0,
      merchantCustomerBonus: 0,
      merchantHaggleBonus: 0,
      merchantCaravanBonus: 0,
      scientistResearchBonus: 0,
      scientistCraftingBonus: 0,
      scientistYieldBonus: 0,
      scientistDiscoveryBonus: 0,
      scientistResourceBonus: 0,
      autoCombatUnlocked: false,
      offlineProgressBonus: 0,
      lpMultiplier: 1,
      achievementBonus: 0,
      startingDungeonKeys: 0,
    };

    for (const [upgradeId, level] of purchasedUpgrades.value.entries()) {
      if (level === 0) continue;

      const upgrade = getLegacyUpgrade(upgradeId);
      if (!upgrade) continue;

      const totalBonus = upgrade.effect.value * level;

      switch (upgradeId) {
        case 'xp_boost':
          bonuses.xpMultiplier += totalBonus;
          break;
        case 'gold_boost':
          bonuses.goldMultiplier += totalBonus;
          break;
        case 'starting_gold':
          bonuses.startingGold += totalBonus;
          break;
        case 'starting_level':
          bonuses.startingWarriorLevel += totalBonus;
          break;
        case 'unlock_speed':
          bonuses.unlockRequirementReduction += totalBonus;
          break;
        case 'warrior_damage':
          bonuses.warriorDamageBonus += totalBonus;
          break;
        case 'warrior_crit':
          bonuses.warriorCritBonus += totalBonus;
          break;
        case 'warrior_hp':
          bonuses.warriorHpBonus += totalBonus;
          break;
        case 'warrior_recovery':
          bonuses.warriorRecoveryBonus += totalBonus;
          break;
        case 'slayer_xp':
          bonuses.slayerXpBonus += totalBonus;
          break;
        case 'merchant_gold':
          bonuses.merchantGoldBonus += totalBonus;
          break;
        case 'merchant_charisma':
          bonuses.merchantCharismaBonus += totalBonus;
          break;
        case 'merchant_customers':
          bonuses.merchantCustomerBonus += totalBonus;
          break;
        case 'merchant_haggle':
          bonuses.merchantHaggleBonus += totalBonus;
          break;
        case 'merchant_caravan':
          bonuses.merchantCaravanBonus += totalBonus;
          break;
        case 'scientist_research':
          bonuses.scientistResearchBonus += totalBonus;
          break;
        case 'scientist_crafting':
          bonuses.scientistCraftingBonus += totalBonus;
          break;
        case 'scientist_yield':
          bonuses.scientistYieldBonus += totalBonus;
          break;
        case 'scientist_discovery':
          bonuses.scientistDiscoveryBonus += totalBonus;
          break;
        case 'scientist_resources':
          bonuses.scientistResourceBonus += totalBonus;
          break;
        case 'auto_combat':
          bonuses.autoCombatUnlocked = level > 0;
          break;
        case 'offline_progress':
          bonuses.offlineProgressBonus += totalBonus;
          break;
        case 'lp_multiplier':
          bonuses.lpMultiplier += totalBonus;
          break;
        case 'achievement_bonus':
          bonuses.achievementBonus += totalBonus;
          break;
        case 'dungeon_keys':
          bonuses.startingDungeonKeys += totalBonus;
          break;
      }
    }

    return bonuses;
  });

  // ============================================
  // PRESTIGE GATES PROGRESS
  // ============================================

  const gatesProgress = computed(() => {
    const warriorStore = useAteriaWarriorStore();
    const merchantStore = useAteriaMerchantStore();
    const scientistStore = useAteriaScientistStore();

    return PRESTIGE_GATES.map(gate => {
      let progress = 0;
      let isComplete = completedGates.value.has(gate.id);

      switch (gate.id) {
        case 'dungeon_master':
          progress = Math.min(1, warriorStore.completedDungeons.size / 5);
          isComplete = isComplete || warriorStore.completedDungeons.size >= 5;
          break;
        case 'trading_empire':
          const merchantProgress = (merchantStore.merchantLevel / 30 + 
            (merchantStore.stats.reputationTier === 'legendary' ? 1 : 0)) / 2;
          progress = Math.min(1, merchantProgress);
          isComplete = isComplete || (merchantStore.merchantLevel >= 30 && 
            merchantStore.stats.reputationTier === 'legendary');
          break;
        case 'scientific_breakthrough':
          // Assuming 20 total researches
          const researchProgress = (scientistStore.level / 30);
          progress = Math.min(1, researchProgress);
          isComplete = isComplete || scientistStore.level >= 30;
          break;
        case 'trinity_balance':
          const minLevel = Math.min(
            warriorStore.stats.level,
            merchantStore.merchantLevel,
            scientistStore.level
          );
          progress = Math.min(1, minLevel / 25);
          isComplete = isComplete || minLevel >= 25;
          break;
      }

      return {
        ...gate,
        progress,
        isComplete,
        wasCompleted: completedGates.value.has(gate.id),
      };
    });
  });

  // ============================================
  // ACTIONS - UPGRADES
  // ============================================

  function purchaseUpgrade(upgradeId: string): boolean {
    const upgrade = getLegacyUpgrade(upgradeId);
    if (!upgrade) return false;

    const currentLevel = purchasedUpgrades.value.get(upgradeId) || 0;
    if (currentLevel >= upgrade.maxLevel) return false;

    // Check requirements
    if (!areRequirementsMet(upgrade, purchasedUpgrades.value)) {
      return false;
    }

    // Check cost
    const cost = calculateUpgradeCost(upgrade, currentLevel);
    if (legacyPoints.value < cost) return false;

    // Purchase
    legacyPoints.value -= cost;
    purchasedUpgrades.value.set(upgradeId, currentLevel + 1);

    const gameStore = useAteriaGameStore();
    gameStore.addNotification({
      type: 'success',
      title: 'Ulepszenie Legacy!',
      message: `${upgrade.name} poziom ${currentLevel + 1}`,
      icon: upgrade.icon,
    });

    return true;
  }

  function getUpgradeLevel(upgradeId: string): number {
    return purchasedUpgrades.value.get(upgradeId) || 0;
  }

  function getUpgradeCost(upgradeId: string): number {
    const upgrade = getLegacyUpgrade(upgradeId);
    if (!upgrade) return Infinity;
    const currentLevel = purchasedUpgrades.value.get(upgradeId) || 0;
    return calculateUpgradeCost(upgrade, currentLevel);
  }

  // ============================================
  // ACTIONS - PRESTIGE
  // ============================================

  function performPrestige(): boolean {
    if (!canPrestige.value) return false;

    const gameStore = useAteriaGameStore();
    const warriorStore = useAteriaWarriorStore();
    const merchantStore = useAteriaMerchantStore();
    const scientistStore = useAteriaScientistStore();
    const resourcesStore = useAteriaResourcesStore();
    const achievementsStore = useAteriaAchievementsStore();

    // Calculate LP earned
    const lpCalc = estimatedLP.value;
    let lpEarned = Math.floor(lpCalc.totalLP * activeBonuses.value.lpMultiplier);

    // Check for newly completed gates
    for (const gate of gatesProgress.value) {
      if (gate.isComplete && !gate.wasCompleted) {
        completedGates.value.add(gate.id);
        lpEarned += gate.reward.lp;

        if (gate.reward.title) {
          unlockedTitles.value.push(gate.reward.title);
        }

        gameStore.addNotification({
          type: 'success',
          title: 'Brama Prestiżu!',
          message: `${gate.name}: +${gate.reward.lp} LP`,
          icon: gate.icon,
          duration: 5000,
        });
      }
    }

    // Check milestones
    const newPrestigeCount = prestigeCount.value + 1;
    for (const milestone of PRESTIGE_MILESTONES) {
      if (milestone.prestigeCount === newPrestigeCount) {
        if (milestone.reward.type === 'lp_bonus') {
          lpEarned += milestone.reward.value as number;
        }
        gameStore.addNotification({
          type: 'info',
          title: 'Kamień Milowy!',
          message: milestone.reward.description,
          icon: 'mdi-flag-checkered',
        });
      }
    }

    // Update stats
    if (lpEarned > prestigeStats.value.highestLPSinglePrestige) {
      prestigeStats.value.highestLPSinglePrestige = lpEarned;
    }

    const timeSinceLastPrestige = prestigeStats.value.lastPrestigeTimestamp > 0
      ? (Date.now() - prestigeStats.value.lastPrestigeTimestamp) / 1000
      : Infinity;

    if (timeSinceLastPrestige < prestigeStats.value.fastestPrestigeTime) {
      prestigeStats.value.fastestPrestigeTime = timeSinceLastPrestige;
    }

    prestigeStats.value.lastPrestigeTimestamp = Date.now();

    // Grant LP
    legacyPoints.value += lpEarned;
    totalLPEarned.value += lpEarned;
    prestigeCount.value++;

    // Reset all stores
    warriorStore.resetWarrior();
    merchantStore.resetMerchant();
    scientistStore.resetScientist();
    resourcesStore.resetResources();
    achievementsStore.resetAchievements();

    // Apply starting bonuses from legacy upgrades
    applyStartingBonuses();

    // Reset game state but keep unlocks
    gameStore.resetForPrestige();

    gameStore.addNotification({
      type: 'success',
      title: `Prestiż #${prestigeCount.value}!`,
      message: `Otrzymano ${lpEarned} Punktów Legacy`,
      icon: 'mdi-star-circle',
      duration: 8000,
    });

    return true;
  }

  function applyStartingBonuses() {
    const resourcesStore = useAteriaResourcesStore();
    const warriorStore = useAteriaWarriorStore();

    // Starting gold
    if (activeBonuses.value.startingGold > 0) {
      resourcesStore.addResource('gold', activeBonuses.value.startingGold);
    }

    // Starting warrior level (handled by warrior store on reset)
    // Starting dungeon keys
    if (activeBonuses.value.startingDungeonKeys > 0) {
      // Add random dungeon keys
      const keys = ['goblin_key', 'swamp_key', 'infernal_key', 'frost_key', 'void_key'];
      for (let i = 0; i < activeBonuses.value.startingDungeonKeys; i++) {
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        warriorStore.addDungeonKey(randomKey, 1);
      }
    }
  }

  // ============================================
  // TITLES
  // ============================================

  function setActiveTitle(title: string | null) {
    if (title === null || unlockedTitles.value.includes(title)) {
      activeTitle.value = title;
    }
  }

  // ============================================
  // SAVE/LOAD
  // ============================================

  function getState() {
    return {
      prestigeCount: prestigeCount.value,
      legacyPoints: legacyPoints.value,
      totalLPEarned: totalLPEarned.value,
      purchasedUpgrades: Array.from(purchasedUpgrades.value.entries()),
      completedGates: Array.from(completedGates.value),
      unlockedTitles: unlockedTitles.value,
      activeTitle: activeTitle.value,
      prestigeStats: prestigeStats.value,
    };
  }

  function loadState(state: ReturnType<typeof getState>) {
    if (state.prestigeCount !== undefined) prestigeCount.value = state.prestigeCount;
    if (state.legacyPoints !== undefined) legacyPoints.value = state.legacyPoints;
    if (state.totalLPEarned !== undefined) totalLPEarned.value = state.totalLPEarned;
    if (state.purchasedUpgrades) {
      purchasedUpgrades.value = new Map(state.purchasedUpgrades);
    }
    if (state.completedGates) {
      completedGates.value = new Set(state.completedGates);
    }
    if (state.unlockedTitles) {
      unlockedTitles.value = state.unlockedTitles;
    }
    if (state.activeTitle !== undefined) {
      activeTitle.value = state.activeTitle;
    }
    if (state.prestigeStats) {
      prestigeStats.value = { ...prestigeStats.value, ...state.prestigeStats };
    }
  }

  return {
    // State
    prestigeCount,
    legacyPoints,
    totalLPEarned,
    purchasedUpgrades,
    completedGates,
    unlockedTitles,
    activeTitle,
    prestigeStats,

    // Computed
    canPrestige,
    prestigeProgress,
    estimatedLP,
    totalUpgradeLevel,
    availableUpgrades,
    nextMilestone,
    earnedMilestones,
    activeBonuses,
    gatesProgress,

    // Actions
    purchaseUpgrade,
    getUpgradeLevel,
    getUpgradeCost,
    performPrestige,
    applyStartingBonuses,
    setActiveTitle,
    getState,
    loadState,
  };
}, {
  persist: {
    key: 'ateria-prestige',
    serializer: {
      serialize: (state) => {
        return JSON.stringify({
          prestigeCount: state.prestigeCount,
          legacyPoints: state.legacyPoints,
          totalLPEarned: state.totalLPEarned,
          purchasedUpgrades: state.purchasedUpgrades instanceof Map
            ? Array.from(state.purchasedUpgrades.entries())
            : state.purchasedUpgrades,
          completedGates: state.completedGates instanceof Set
            ? Array.from(state.completedGates)
            : state.completedGates,
          unlockedTitles: state.unlockedTitles,
          activeTitle: state.activeTitle,
          prestigeStats: state.prestigeStats,
        });
      },
      deserialize: (value) => {
        const parsed = JSON.parse(value);

        if (parsed.purchasedUpgrades && Array.isArray(parsed.purchasedUpgrades)) {
          parsed.purchasedUpgrades = new Map(parsed.purchasedUpgrades);
        } else {
          parsed.purchasedUpgrades = new Map();
        }

        if (parsed.completedGates && Array.isArray(parsed.completedGates)) {
          parsed.completedGates = new Set(parsed.completedGates);
        } else {
          parsed.completedGates = new Set();
        }

        return parsed;
      },
    },
  },
});
