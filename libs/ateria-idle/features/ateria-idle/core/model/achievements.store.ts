/**
 * Achievements Store - Manages achievement tracking and unlocking
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAteriaGameStore } from './game.store';
import { useAteriaWarriorStore } from '../../warrior/model/warrior.store';
import { useAteriaMerchantStore } from '../../merchant/model/merchant.store';
import { useAteriaScientistStore } from '../../scientist/model/scientist.store';
import {
  ACHIEVEMENTS,
  getAchievement,
  getRarityInfo,
  calculateTotalPoints,
  type AchievementDefinition,
  type AchievementCondition,
} from '../../data/achievements.data';
import type { AchievementCategory } from '@ateria-idle/entities/ateria-idle/game';

export const useAteriaAchievementsStore = defineStore('ateria-achievements', () => {
  // ============================================
  // STATE
  // ============================================

  // Set of unlocked achievement IDs
  const unlockedAchievements = ref<Set<string>>(new Set());

  // Timestamp when each achievement was unlocked
  const unlockTimestamps = ref<Map<string, number>>(new Map());

  // Progress tracking for progressive achievements
  const progressTracking = ref<Map<string, number>>(new Map());

  // Statistics for condition checking
  const stats = ref({
    totalKills: 0,
    categoryKills: {
      beast: 0,
      undead: 0,
      demon: 0,
      elemental: 0,
      dragon: 0,
      aberration: 0,
    } as Record<string, number>,
    goldEarned: 0,
    itemsCrafted: 0,
    potionsCrafted: 0,
    researchCompleted: 0,
    dungeonsCompleted: 0,
    slayerTasksCompleted: 0,
    biomesUnlocked: 1, // Start with forest
    monstersDiscovered: 0,
    caravansSent: 0,
    customersServed: 0,
    deaths: 0,
    playTimeSeconds: 0,
    lpEarned: 0,
    completedDungeonIds: [] as string[],
    discoveredMonsterIds: [] as string[],
    unlockedBiomeIds: ['forest'] as string[],
    highestEquipmentRarity: 'common' as string,
  });

  // Recently unlocked (for notifications)
  const recentlyUnlocked = ref<string[]>([]);

  // ============================================
  // COMPUTED
  // ============================================

  const totalPoints = computed(() => {
    return calculateTotalPoints(Array.from(unlockedAchievements.value));
  });

  const unlockedCount = computed(() => unlockedAchievements.value.size);

  const totalCount = computed(() => ACHIEVEMENTS.length);

  const completionPercent = computed(() => {
    if (totalCount.value === 0) return 0;
    return Math.round((unlockedCount.value / totalCount.value) * 100);
  });

  const unlockedByCategory = computed(() => {
    const result: Record<AchievementCategory, number> = {
      progression: 0,
      economy: 0,
      discovery: 0,
      challenge: 0,
      secret: 0,
    };

    for (const id of unlockedAchievements.value) {
      const achievement = getAchievement(id);
      if (achievement) {
        result[achievement.category]++;
      }
    }

    return result;
  });

  const categoryTotals = computed(() => {
    const result: Record<AchievementCategory, number> = {
      progression: 0,
      economy: 0,
      discovery: 0,
      challenge: 0,
      secret: 0,
    };

    for (const achievement of ACHIEVEMENTS) {
      result[achievement.category]++;
    }

    return result;
  });

  // ============================================
  // CONDITION CHECKERS
  // ============================================

  function checkCondition(condition: AchievementCondition): boolean {
    const warriorStore = useAteriaWarriorStore();
    const merchantStore = useAteriaMerchantStore();
    const scientistStore = useAteriaScientistStore();
    const gameStore = useAteriaGameStore();

    switch (condition.type) {
      case 'warrior_level':
        return warriorStore.stats.level >= condition.level;

      case 'slayer_level':
        return warriorStore.slayer.level >= condition.level;

      case 'merchant_level':
        return merchantStore.merchantLevel >= condition.level;

      case 'scientist_level':
        return scientistStore.level >= condition.level;

      case 'total_kills':
        return stats.value.totalKills >= condition.count;

      case 'category_kills':
        return (stats.value.categoryKills[condition.category] || 0) >= condition.count;

      case 'gold_earned':
        return stats.value.goldEarned >= condition.amount;

      case 'gold_total':
        return gameStore.gold >= condition.amount;

      case 'items_crafted':
        return stats.value.itemsCrafted >= condition.count;

      case 'potions_crafted':
        return stats.value.potionsCrafted >= condition.count;

      case 'research_completed':
        return stats.value.researchCompleted >= condition.count;

      case 'dungeons_completed':
        return stats.value.dungeonsCompleted >= condition.count;

      case 'specific_dungeon':
        return stats.value.completedDungeonIds.includes(condition.dungeonId);

      case 'slayer_tasks':
        return stats.value.slayerTasksCompleted >= condition.count;

      case 'biomes_unlocked':
        return stats.value.biomesUnlocked >= condition.count;

      case 'specific_biome':
        return stats.value.unlockedBiomeIds.includes(condition.biomeId);

      case 'monsters_discovered':
        return stats.value.monstersDiscovered >= condition.count;

      case 'specific_monster':
        return stats.value.discoveredMonsterIds.includes(condition.monsterId);

      case 'equipment_rarity':
        return compareRarity(stats.value.highestEquipmentRarity, condition.rarity) >= 0;

      case 'caravans_sent':
        return stats.value.caravansSent >= condition.count;

      case 'customers_served':
        return stats.value.customersServed >= condition.count;

      case 'deaths':
        return stats.value.deaths >= condition.count;

      case 'play_time':
        return stats.value.playTimeSeconds >= condition.hours * 3600;

      case 'lp_earned':
        return stats.value.lpEarned >= condition.amount;

      case 'all_paths_unlocked':
        return gameStore.unlockedFeatures.has('warrior') &&
               gameStore.unlockedFeatures.has('merchant') &&
               gameStore.unlockedFeatures.has('scientist');

      case 'custom':
        return checkCustomCondition(condition.checkId);

      default:
        return false;
    }
  }

  function compareRarity(current: string, target: string): number {
    const order = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    return order.indexOf(current) - order.indexOf(target);
  }

  function checkCustomCondition(_checkId: string): boolean {
    // Placeholder for custom conditions
    return false;
  }

  function getProgress(achievement: AchievementDefinition): number {
    if (!achievement.progressTarget) return 0;

    const condition = achievement.condition;

    switch (condition.type) {
      case 'warrior_level': {
        const warriorStore = useAteriaWarriorStore();
        return Math.min(warriorStore.stats.level / condition.level, 1);
      }
      case 'slayer_level': {
        const warriorStore = useAteriaWarriorStore();
        return Math.min(warriorStore.slayer.level / condition.level, 1);
      }
      case 'merchant_level': {
        const merchantStore = useAteriaMerchantStore();
        return Math.min(merchantStore.merchantLevel / condition.level, 1);
      }
      case 'scientist_level': {
        const scientistStore = useAteriaScientistStore();
        return Math.min(scientistStore.level / condition.level, 1);
      }
      case 'total_kills':
        return Math.min(stats.value.totalKills / condition.count, 1);
      case 'category_kills':
        return Math.min((stats.value.categoryKills[condition.category] || 0) / condition.count, 1);
      case 'gold_earned':
        return Math.min(stats.value.goldEarned / condition.amount, 1);
      case 'dungeons_completed':
        return Math.min(stats.value.dungeonsCompleted / condition.count, 1);
      case 'slayer_tasks':
        return Math.min(stats.value.slayerTasksCompleted / condition.count, 1);
      case 'biomes_unlocked':
        return Math.min(stats.value.biomesUnlocked / condition.count, 1);
      case 'monsters_discovered':
        return Math.min(stats.value.monstersDiscovered / condition.count, 1);
      case 'potions_crafted':
        return Math.min(stats.value.potionsCrafted / condition.count, 1);
      case 'research_completed':
        return Math.min(stats.value.researchCompleted / condition.count, 1);
      case 'caravans_sent':
        return Math.min(stats.value.caravansSent / condition.count, 1);
      case 'customers_served':
        return Math.min(stats.value.customersServed / condition.count, 1);
      case 'deaths':
        return Math.min(stats.value.deaths / condition.count, 1);
      case 'play_time':
        return Math.min(stats.value.playTimeSeconds / (condition.hours * 3600), 1);
      default:
        return 0;
    }
  }

  // ============================================
  // ACTIONS - STAT TRACKING
  // ============================================

  function recordKill(monsterId: string, category?: string) {
    stats.value.totalKills++;

    if (category && stats.value.categoryKills[category] !== undefined) {
      stats.value.categoryKills[category]++;
    }

    // Track monster discovery
    if (!stats.value.discoveredMonsterIds.includes(monsterId)) {
      stats.value.discoveredMonsterIds.push(monsterId);
      stats.value.monstersDiscovered++;
    }

    checkAllAchievements();
  }

  function recordGoldEarned(amount: number) {
    stats.value.goldEarned += amount;
    checkAllAchievements();
  }

  function recordPotionCrafted() {
    stats.value.potionsCrafted++;
    checkAllAchievements();
  }

  function recordItemCrafted() {
    stats.value.itemsCrafted++;
    checkAllAchievements();
  }

  function recordResearchCompleted() {
    stats.value.researchCompleted++;
    checkAllAchievements();
  }

  function recordDungeonCompleted(dungeonId: string) {
    stats.value.dungeonsCompleted++;
    if (!stats.value.completedDungeonIds.includes(dungeonId)) {
      stats.value.completedDungeonIds.push(dungeonId);
    }
    checkAllAchievements();
  }

  function recordSlayerTaskCompleted() {
    stats.value.slayerTasksCompleted++;
    checkAllAchievements();
  }

  function recordBiomeUnlocked(biomeId: string) {
    if (!stats.value.unlockedBiomeIds.includes(biomeId)) {
      stats.value.unlockedBiomeIds.push(biomeId);
      stats.value.biomesUnlocked++;
      checkAllAchievements();
    }
  }

  function recordCaravanSent() {
    stats.value.caravansSent++;
    checkAllAchievements();
  }

  function recordCustomerServed() {
    stats.value.customersServed++;
    checkAllAchievements();
  }

  function recordDeath() {
    stats.value.deaths++;
    checkAllAchievements();
  }

  function recordPlayTime(seconds: number) {
    stats.value.playTimeSeconds += seconds;
    // Check less frequently for play time
    if (stats.value.playTimeSeconds % 60 === 0) {
      checkAllAchievements();
    }
  }

  function recordLpEarned(amount: number) {
    stats.value.lpEarned += amount;
    checkAllAchievements();
  }

  // ============================================
  // ACTIONS - ACHIEVEMENT MANAGEMENT
  // ============================================

  function checkAllAchievements() {
    for (const achievement of ACHIEVEMENTS) {
      if (!unlockedAchievements.value.has(achievement.id)) {
        if (checkCondition(achievement.condition)) {
          unlockAchievement(achievement.id);
        }
      }
    }
  }

  function unlockAchievement(achievementId: string) {
    if (unlockedAchievements.value.has(achievementId)) return;

    const achievement = getAchievement(achievementId);
    if (!achievement) return;

    unlockedAchievements.value.add(achievementId);
    unlockTimestamps.value.set(achievementId, Date.now());
    recentlyUnlocked.value.push(achievementId);

    // Notify
    const gameStore = useAteriaGameStore();
    gameStore.addNotification({
      type: 'success',
      title: 'Osiągnięcie odblokowane!',
      message: achievement.name,
      icon: achievement.icon,
      duration: 5000,
    });

    // Apply reward if any
    if (achievement.reward) {
      applyReward(achievement.reward);
    }

    // Keep recent list manageable
    if (recentlyUnlocked.value.length > 10) {
      recentlyUnlocked.value.shift();
    }
  }

  function applyReward(reward: { type: string; value: string | number }) {
    const gameStore = useAteriaGameStore();

    switch (reward.type) {
      case 'title':
        // Titles stored elsewhere or just for display
        gameStore.addNotification({
          type: 'info',
          title: 'Nowy tytuł!',
          message: `Odblokowano tytuł: "${reward.value}"`,
          icon: 'mdi-tag',
        });
        break;
      case 'lp_bonus':
        // Add LP
        gameStore.addNotification({
          type: 'info',
          title: 'Bonus LP!',
          message: `+${reward.value} Punktów Legacy`,
          icon: 'mdi-star',
        });
        break;
      case 'permanent_buff':
        gameStore.addNotification({
          type: 'info',
          title: 'Stały Bonus!',
          message: `+${reward.value}% do statystyk`,
          icon: 'mdi-arrow-up-bold',
        });
        break;
    }
  }

  function isUnlocked(achievementId: string): boolean {
    return unlockedAchievements.value.has(achievementId);
  }

  function getUnlockTime(achievementId: string): number | undefined {
    return unlockTimestamps.value.get(achievementId);
  }

  function clearRecentlyUnlocked() {
    recentlyUnlocked.value = [];
  }

  // ============================================
  // TICK PROCESSING
  // ============================================

  function processTick() {
    // Update play time (called every tick = 100ms)
    stats.value.playTimeSeconds += 0.1;

    // Periodic achievement check (every 10 seconds)
    if (Math.floor(stats.value.playTimeSeconds) % 10 === 0) {
      checkAllAchievements();
    }
  }

  // ============================================
  // SAVE/LOAD
  // ============================================

  function getState() {
    return {
      unlockedAchievements: Array.from(unlockedAchievements.value),
      unlockTimestamps: Array.from(unlockTimestamps.value.entries()),
      stats: stats.value,
    };
  }

  function loadState(state: ReturnType<typeof getState>) {
    if (state.unlockedAchievements) {
      unlockedAchievements.value = new Set(state.unlockedAchievements);
    }
    if (state.unlockTimestamps) {
      unlockTimestamps.value = new Map(state.unlockTimestamps);
    }
    if (state.stats) {
      stats.value = { ...stats.value, ...state.stats };
    }
  }

  function resetAchievements() {
    unlockedAchievements.value = new Set();
    unlockTimestamps.value = new Map();
    progressTracking.value = new Map();
    recentlyUnlocked.value = [];
    stats.value = {
      totalKills: 0,
      categoryKills: {
        beast: 0,
        undead: 0,
        demon: 0,
        elemental: 0,
        dragon: 0,
        aberration: 0,
      },
      goldEarned: 0,
      itemsCrafted: 0,
      potionsCrafted: 0,
      researchCompleted: 0,
      dungeonsCompleted: 0,
      slayerTasksCompleted: 0,
      biomesUnlocked: 1,
      monstersDiscovered: 0,
      caravansSent: 0,
      customersServed: 0,
      deaths: 0,
      playTimeSeconds: 0,
      lpEarned: 0,
      completedDungeonIds: [],
      discoveredMonsterIds: [],
      unlockedBiomeIds: ['forest'],
      highestEquipmentRarity: 'common',
    };
  }

  return {
    // State
    unlockedAchievements,
    unlockTimestamps,
    stats,
    recentlyUnlocked,

    // Computed
    totalPoints,
    unlockedCount,
    totalCount,
    completionPercent,
    unlockedByCategory,
    categoryTotals,

    // Actions - Stat tracking
    recordKill,
    recordGoldEarned,
    recordPotionCrafted,
    recordItemCrafted,
    recordResearchCompleted,
    recordDungeonCompleted,
    recordSlayerTaskCompleted,
    recordBiomeUnlocked,
    recordCaravanSent,
    recordCustomerServed,
    recordDeath,
    recordPlayTime,
    recordLpEarned,

    // Actions - Achievement management
    checkAllAchievements,
    unlockAchievement,
    isUnlocked,
    getUnlockTime,
    getProgress,
    clearRecentlyUnlocked,

    // Tick
    processTick,

    // Save/Load
    getState,
    loadState,
    resetAchievements,
  };
}, {
  persist: {
    key: 'ateria-achievements',
    serializer: {
      serialize: (state) => {
        return JSON.stringify({
          unlockedAchievements: state.unlockedAchievements instanceof Set
            ? Array.from(state.unlockedAchievements)
            : state.unlockedAchievements,
          unlockTimestamps: state.unlockTimestamps instanceof Map
            ? Array.from(state.unlockTimestamps.entries())
            : state.unlockTimestamps,
          stats: state.stats,
        });
      },
      deserialize: (value) => {
        const parsed = JSON.parse(value);

        if (parsed.unlockedAchievements && Array.isArray(parsed.unlockedAchievements)) {
          parsed.unlockedAchievements = new Set(parsed.unlockedAchievements);
        } else {
          parsed.unlockedAchievements = new Set();
        }

        if (parsed.unlockTimestamps && Array.isArray(parsed.unlockTimestamps)) {
          parsed.unlockTimestamps = new Map(parsed.unlockTimestamps);
        } else {
          parsed.unlockTimestamps = new Map();
        }

        return parsed;
      },
    },
  },
});
