/**
 * Challenges Store
 * Handles daily and weekly challenges with streak bonuses
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import Decimal from 'break_infinity.js';
import { bn, formatNumber } from '~/shared/lib/big-number';
import { useResourceStore } from './resources';
import { useEntityStore } from './entities';
import { useCombatStore } from './combat';
import { usePrestigeStore } from './prestige';
import { useNarrativeStore } from './narrative';
import { logger } from '~/shared/lib/logger';

// ============================================
// Types
// ============================================

export type ChallengeType = 'daily' | 'weekly';
export type ChallengeCategory = 'combat' | 'building' | 'resource' | 'click' | 'prestige';

export interface ChallengeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: ChallengeType;
  category: ChallengeCategory;
  target: number; // Target value to reach
  reward: {
    type: 'faith' | 'ducats' | 'morale' | 'production_buff' | 'relic_chance';
    value: number;
    duration?: number; // For buffs, in seconds
    description: string;
  };
}

export interface ChallengeProgress {
  id: string;
  current: number;
  completed: boolean;
  claimedAt?: number;
}

export interface ActiveBuff {
  type: string;
  value: number;
  expiresAt: number;
  description: string;
}

// ============================================
// Challenge Definitions
// ============================================

const DAILY_CHALLENGES: ChallengeDefinition[] = [
  {
    id: 'daily_waves_10',
    name: 'Obrońca Dnia',
    description: 'Odpieraj 10 fal',
    icon: 'mdi-shield-sword',
    type: 'daily',
    category: 'combat',
    target: 10,
    reward: { type: 'faith', value: 500, description: '+500 Wiary' },
  },
  {
    id: 'daily_buildings_5',
    name: 'Budowniczy',
    description: 'Zbuduj 5 budynków',
    icon: 'mdi-home-city',
    type: 'daily',
    category: 'building',
    target: 5,
    reward: { type: 'ducats', value: 100, description: '+100 Dukatów' },
  },
  {
    id: 'daily_liturgies_3',
    name: 'Liturg',
    description: 'Użyj 3 liturgii',
    icon: 'mdi-book-cross',
    type: 'daily',
    category: 'combat',
    target: 3,
    reward: { type: 'morale', value: 25, description: '+25 morale' },
  },
  {
    id: 'daily_clicks_50',
    name: 'Modlitewnik',
    description: 'Kliknij 50 razy',
    icon: 'mdi-hand-clap',
    type: 'daily',
    category: 'click',
    target: 50,
    reward: { type: 'faith', value: 200, description: '+200 Wiary' },
  },
  {
    id: 'daily_ducats_1000',
    name: 'Skarbnik',
    description: 'Zbierz 1000 Dukatów',
    icon: 'mdi-cash-multiple',
    type: 'daily',
    category: 'resource',
    target: 1000,
    reward: { type: 'production_buff', value: 10, duration: 3600, description: '+10% produkcji przez 1h' },
  },
];

const WEEKLY_CHALLENGES: ChallengeDefinition[] = [
  {
    id: 'weekly_combo_30',
    name: 'Mistrz Combo',
    description: 'Osiągnij 30 combo',
    icon: 'mdi-lightning-bolt',
    type: 'weekly',
    category: 'combat',
    target: 30,
    reward: { type: 'relic_chance', value: 1, description: 'Gwarantowana Rzadka relikwia' },
  },
  {
    id: 'weekly_waves_100',
    name: 'Niezłomny',
    description: 'Odpieraj 100 fal',
    icon: 'mdi-castle',
    type: 'weekly',
    category: 'combat',
    target: 100,
    reward: { type: 'faith', value: 5000, description: '+5000 Wiary' },
  },
  {
    id: 'weekly_buildings_50',
    name: 'Imperium',
    description: 'Posiadaj 50 budynków',
    icon: 'mdi-city',
    type: 'weekly',
    category: 'building',
    target: 50,
    reward: { type: 'production_buff', value: 25, duration: 86400, description: '+25% produkcji przez 24h' },
  },
  {
    id: 'weekly_prestige_3',
    name: 'Odrodzony',
    description: 'Wykonaj 3 prestiże',
    icon: 'mdi-fire-circle',
    type: 'weekly',
    category: 'prestige',
    target: 3,
    reward: { type: 'relic_chance', value: 2, description: 'Gwarantowana Epicka relikwia' },
  },
];

// ============================================
// Store
// ============================================

export const useChallengeStore = defineStore(
  'challenges',
  () => {
    // ============================================
    // State
    // ============================================

    // Progress tracking for current period
    const dailyProgress = ref<Record<string, ChallengeProgress>>({});
    const weeklyProgress = ref<Record<string, ChallengeProgress>>({});

    // Reset timestamps
    const lastDailyReset = ref<number>(0);
    const lastWeeklyReset = ref<number>(0);

    // Streak tracking
    const dailyStreak = ref<number>(0);
    const lastStreakDate = ref<string>(''); // YYYY-MM-DD format

    // Active buffs from challenge rewards
    const activeBuffs = ref<ActiveBuff[]>([]);

    // Session tracking (reset on page load, used for counting within session)
    const sessionStats = ref({
      wavesDefeated: 0,
      buildingsBought: 0,
      liturgiesUsed: 0,
      clicks: 0,
      ducatsCollected: 0,
      prestigesDone: 0,
      maxCombo: 0,
    });

    // Toast queue for notifications
    const toastQueue = ref<ChallengeDefinition[]>([]);

    // ============================================
    // Computed
    // ============================================

    const allChallenges = computed(() => [...DAILY_CHALLENGES, ...WEEKLY_CHALLENGES]);

    const dailyChallenges = computed(() => DAILY_CHALLENGES);
    const weeklyChallenges = computed(() => WEEKLY_CHALLENGES);

    const completedDailyCount = computed(() =>
      Object.values(dailyProgress.value).filter((p) => p.completed).length
    );

    const completedWeeklyCount = computed(() =>
      Object.values(weeklyProgress.value).filter((p) => p.completed).length
    );

    const allDailyCompleted = computed(() =>
      completedDailyCount.value === DAILY_CHALLENGES.length
    );

    const allWeeklyCompleted = computed(() =>
      completedWeeklyCount.value === WEEKLY_CHALLENGES.length
    );

    // Streak bonus: +10% per day, max 70%
    const streakBonus = computed(() => Math.min(dailyStreak.value * 10, 70));

    // Time until next reset
    const timeUntilDailyReset = computed(() => {
      const now = Date.now();
      const nextReset = getNextDailyReset();
      return Math.max(0, nextReset - now);
    });

    const timeUntilWeeklyReset = computed(() => {
      const now = Date.now();
      const nextReset = getNextWeeklyReset();
      return Math.max(0, nextReset - now);
    });

    // Active production buff from challenges
    const productionBuffPercent = computed(() => {
      const now = Date.now();
      return activeBuffs.value
        .filter((b) => b.type === 'production_buff' && b.expiresAt > now)
        .reduce((sum, b) => sum + b.value, 0);
    });

    // ============================================
    // Helper Functions
    // ============================================

    function getNextDailyReset(): number {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      return tomorrow.getTime();
    }

    function getNextWeeklyReset(): number {
      const now = new Date();
      const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
      const nextMonday = new Date(now);
      nextMonday.setDate(nextMonday.getDate() + daysUntilMonday);
      nextMonday.setHours(0, 0, 0, 0);
      return nextMonday.getTime();
    }

    function getTodayString(): string {
      return new Date().toISOString().split('T')[0] as string;
    }

    function formatTimeRemaining(ms: number): string {
      const hours = Math.floor(ms / (1000 * 60 * 60));
      const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      }
      return `${minutes}m`;
    }

    // ============================================
    // Actions
    // ============================================

    /**
     * Initialize progress for all challenges
     */
    function initializeProgress() {
      for (const challenge of DAILY_CHALLENGES) {
        if (!dailyProgress.value[challenge.id]) {
          dailyProgress.value[challenge.id] = {
            id: challenge.id,
            current: 0,
            completed: false,
          };
        }
      }
      for (const challenge of WEEKLY_CHALLENGES) {
        if (!weeklyProgress.value[challenge.id]) {
          weeklyProgress.value[challenge.id] = {
            id: challenge.id,
            current: 0,
            completed: false,
          };
        }
      }
    }

    /**
     * Check and perform daily reset if needed
     */
    function checkDailyReset() {
      const now = Date.now();
      const today = getTodayString();

      // Check if we need to reset daily challenges
      if (lastDailyReset.value === 0 || now >= getNextDailyReset() - 86400000) {
        const lastResetDate = new Date(lastDailyReset.value).toISOString().split('T')[0];

        if (lastResetDate !== today) {
          // Check streak before reset
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayString = yesterday.toISOString().split('T')[0];

          if (lastStreakDate.value === yesterdayString && allDailyCompleted.value) {
            dailyStreak.value++;
            logger.log(`[Challenges] Streak increased to ${dailyStreak.value}!`);
          } else if (lastStreakDate.value !== today) {
            // Reset streak if yesterday wasn't completed
            dailyStreak.value = 0;
            logger.log('[Challenges] Streak reset');
          }

          // Reset daily progress
          for (const key of Object.keys(dailyProgress.value)) {
            dailyProgress.value[key] = {
              id: key,
              current: 0,
              completed: false,
            };
          }

          // Reset session stats for daily tracking
          sessionStats.value.wavesDefeated = 0;
          sessionStats.value.buildingsBought = 0;
          sessionStats.value.liturgiesUsed = 0;
          sessionStats.value.clicks = 0;
          sessionStats.value.ducatsCollected = 0;

          lastDailyReset.value = now;
          logger.log('[Challenges] Daily challenges reset');
        }
      }
    }

    /**
     * Check and perform weekly reset if needed
     */
    function checkWeeklyReset() {
      const now = Date.now();

      if (lastWeeklyReset.value === 0 || now >= getNextWeeklyReset()) {
        // Reset weekly progress
        for (const key of Object.keys(weeklyProgress.value)) {
          weeklyProgress.value[key] = {
            id: key,
            current: 0,
            completed: false,
          };
        }

        // Reset weekly session stats
        sessionStats.value.prestigesDone = 0;
        sessionStats.value.maxCombo = 0;

        lastWeeklyReset.value = now;
        logger.log('[Challenges] Weekly challenges reset');
      }
    }

    /**
     * Update progress for a specific stat
     */
    function updateProgress(stat: keyof typeof sessionStats.value, value: number = 1) {
      sessionStats.value[stat] += value;

      // Update relevant challenges
      updateChallengeProgress();
    }

    /**
     * Set absolute value for a stat (e.g., combo)
     */
    function setProgress(stat: keyof typeof sessionStats.value, value: number) {
      if (stat === 'maxCombo') {
        sessionStats.value.maxCombo = Math.max(sessionStats.value.maxCombo, value);
      } else {
        sessionStats.value[stat] = value;
      }
      updateChallengeProgress();
    }

    /**
     * Update all challenge progress based on current stats
     */
    function updateChallengeProgress() {
      const entityStore = useEntityStore();
      const combatStore = useCombatStore();

      // Daily challenges
      for (const challenge of DAILY_CHALLENGES) {
        const progress = dailyProgress.value[challenge.id];
        if (!progress || progress.completed) continue;

        let current = 0;
        switch (challenge.id) {
          case 'daily_waves_10':
            current = sessionStats.value.wavesDefeated;
            break;
          case 'daily_buildings_5':
            current = sessionStats.value.buildingsBought;
            break;
          case 'daily_liturgies_3':
            current = sessionStats.value.liturgiesUsed;
            break;
          case 'daily_clicks_50':
            current = sessionStats.value.clicks;
            break;
          case 'daily_ducats_1000':
            current = sessionStats.value.ducatsCollected;
            break;
        }

        progress.current = Math.min(current, challenge.target);

        if (progress.current >= challenge.target && !progress.completed) {
          completeChallenge(challenge, 'daily');
        }
      }

      // Weekly challenges
      for (const challenge of WEEKLY_CHALLENGES) {
        const progress = weeklyProgress.value[challenge.id];
        if (!progress || progress.completed) continue;

        let current = 0;
        switch (challenge.id) {
          case 'weekly_combo_30':
            current = sessionStats.value.maxCombo;
            break;
          case 'weekly_waves_100':
            current = combatStore.wavesDefeated;
            break;
          case 'weekly_buildings_50':
            current = Object.values(entityStore.entities).reduce((sum, e) => sum + e.count, 0);
            break;
          case 'weekly_prestige_3':
            current = sessionStats.value.prestigesDone;
            break;
        }

        progress.current = Math.min(current, challenge.target);

        if (progress.current >= challenge.target && !progress.completed) {
          completeChallenge(challenge, 'weekly');
        }
      }
    }

    /**
     * Complete a challenge and grant reward
     */
    function completeChallenge(challenge: ChallengeDefinition, type: ChallengeType) {
      const progress = type === 'daily' ? dailyProgress.value[challenge.id] : weeklyProgress.value[challenge.id];
      if (!progress || progress.completed) return;

      progress.completed = true;
      progress.claimedAt = Date.now();

      // Grant reward with streak bonus
      grantReward(challenge);

      // Update streak date if daily
      if (type === 'daily') {
        lastStreakDate.value = getTodayString();
      }

      // Add to toast queue
      toastQueue.value.push(challenge);

      // Add narrative log
      const narrativeStore = useNarrativeStore();
      narrativeStore.addLog({
        message: `🏆 Wyzwanie ukończone: ${challenge.name}! ${challenge.reward.description}`,
        type: 'achievement',
      });

      logger.log(`[Challenges] Completed: ${challenge.name}`);

      // Check for all daily completed bonus
      if (type === 'daily' && allDailyCompleted.value) {
        narrativeStore.addLog({
          message: `✨ Wszystkie wyzwania dzienne ukończone! Streak: ${dailyStreak.value + 1} dni`,
          type: 'achievement',
        });
      }
    }

    /**
     * Grant reward from a challenge
     */
    function grantReward(challenge: ChallengeDefinition) {
      const resourceStore = useResourceStore();
      const combatStore = useCombatStore();
      const bonus = 1 + streakBonus.value / 100;

      switch (challenge.reward.type) {
        case 'faith':
          resourceStore.addResource('faith', bn(challenge.reward.value * bonus));
          break;
        case 'ducats':
          resourceStore.addResource('ducats', bn(challenge.reward.value * bonus));
          break;
        case 'morale':
          // Directly add to morale (capped at max)
          const moraleToAdd = bn(challenge.reward.value * bonus);
          combatStore.morale = Decimal.min(
            combatStore.morale.add(moraleToAdd),
            combatStore.maxMorale
          );
          break;
        case 'production_buff':
          if (challenge.reward.duration) {
            activeBuffs.value.push({
              type: 'production_buff',
              value: challenge.reward.value,
              expiresAt: Date.now() + challenge.reward.duration * 1000,
              description: challenge.reward.description,
            });
          }
          break;
        case 'relic_chance':
          // Will be handled by relic store when dropping relics
          // For now, add a flag that can be checked
          break;
      }
    }

    /**
     * Get progress for a specific challenge
     */
    function getProgress(challengeId: string): ChallengeProgress | undefined {
      return dailyProgress.value[challengeId] || weeklyProgress.value[challengeId];
    }

    /**
     * Get challenge definition by ID
     */
    function getChallenge(challengeId: string): ChallengeDefinition | undefined {
      return allChallenges.value.find((c) => c.id === challengeId);
    }

    /**
     * Pop toast from queue
     */
    function popToast(): ChallengeDefinition | undefined {
      return toastQueue.value.shift();
    }

    /**
     * Tick function - check for expired buffs
     */
    function tick() {
      const now = Date.now();
      activeBuffs.value = activeBuffs.value.filter((b) => b.expiresAt > now);
    }

    /**
     * Called on game start
     */
    function initialize() {
      initializeProgress();
      checkDailyReset();
      checkWeeklyReset();
    }

    /**
     * Reset on prestige (increment prestige counter)
     */
    function onPrestige() {
      sessionStats.value.prestigesDone++;
      updateChallengeProgress();
    }

    // ============================================
    // Return
    // ============================================

    return {
      // State
      dailyProgress,
      weeklyProgress,
      lastDailyReset,
      lastWeeklyReset,
      dailyStreak,
      lastStreakDate,
      activeBuffs,
      sessionStats,
      toastQueue,

      // Computed
      allChallenges,
      dailyChallenges,
      weeklyChallenges,
      completedDailyCount,
      completedWeeklyCount,
      allDailyCompleted,
      allWeeklyCompleted,
      streakBonus,
      timeUntilDailyReset,
      timeUntilWeeklyReset,
      productionBuffPercent,

      // Helpers
      formatTimeRemaining,

      // Actions
      initialize,
      checkDailyReset,
      checkWeeklyReset,
      updateProgress,
      setProgress,
      updateChallengeProgress,
      getProgress,
      getChallenge,
      popToast,
      tick,
      onPrestige,
    };
  },
  {
    persist: {
      key: 'solmar-challenges',
      storage: typeof window !== 'undefined' ? localStorage : undefined,
      serializer: {
        serialize: (state) => JSON.stringify(state),
        deserialize: (str) => JSON.parse(str),
      },
    },
  }
);

