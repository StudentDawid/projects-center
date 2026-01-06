/**
 * Achievements Store
 * Handles the achievement system - tracking progress and unlocking rewards
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import Decimal from 'break_infinity.js';
import { bn } from '~/shared/lib/big-number';
import { useResourceStore } from './resources';
import { useEntityStore } from './entities';
import { useCombatStore } from './combat';
import { usePrestigeStore } from './prestige';

// ============================================
// Types
// ============================================

export type AchievementCategory = 'faith' | 'buildings' | 'combat' | 'prestige' | 'clicks' | 'hidden';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  hidden: boolean; // Hidden until unlocked
  condition: () => boolean;
  reward?: {
    type: 'production_bonus' | 'click_bonus' | 'prestige_bonus';
    value: number; // Percentage bonus
    description: string;
  };
}

export interface UnlockedAchievement {
  id: string;
  unlockedAt: number; // Timestamp
  seen: boolean; // Has player seen the notification?
}

// ============================================
// Store
// ============================================

export const useAchievementStore = defineStore(
  'achievements',
  () => {
    // ============================================
    // State
    // ============================================

    const unlockedAchievements = ref<Record<string, UnlockedAchievement>>({});
    const totalClicks = ref(0);
    const lastCheckTime = ref(0);

    // Toast queue for notifications
    const toastQueue = ref<Achievement[]>([]);

    // ============================================
    // Achievement Definitions
    // ============================================

    const achievements = computed((): Achievement[] => {
      const resourceStore = useResourceStore();
      const entityStore = useEntityStore();
      const combatStore = useCombatStore();
      const prestigeStore = usePrestigeStore();

      return [
        // ========== FAITH ACHIEVEMENTS ==========
        {
          id: 'faith_100',
          name: 'Pierwsza Iskra',
          description: 'Zdobądź 100 Wiary',
          icon: 'mdi-candle',
          category: 'faith',
          hidden: false,
          condition: () => resourceStore.totalFaithEarned.gte(100),
          reward: { type: 'production_bonus', value: 1, description: '+1% produkcji' },
        },
        {
          id: 'faith_1000',
          name: 'Płomień Wiary',
          description: 'Zdobądź 1,000 Wiary',
          icon: 'mdi-fire',
          category: 'faith',
          hidden: false,
          condition: () => resourceStore.totalFaithEarned.gte(1000),
          reward: { type: 'production_bonus', value: 2, description: '+2% produkcji' },
        },
        {
          id: 'faith_10000',
          name: 'Gorliwiec',
          description: 'Zdobądź 10,000 Wiary',
          icon: 'mdi-fire-circle',
          category: 'faith',
          hidden: false,
          condition: () => resourceStore.totalFaithEarned.gte(10000),
          reward: { type: 'production_bonus', value: 3, description: '+3% produkcji' },
        },
        {
          id: 'faith_100000',
          name: 'Święty',
          description: 'Zdobądź 100,000 Wiary',
          icon: 'mdi-star-circle',
          category: 'faith',
          hidden: false,
          condition: () => resourceStore.totalFaithEarned.gte(100000),
          reward: { type: 'production_bonus', value: 5, description: '+5% produkcji' },
        },
        {
          id: 'faith_1000000',
          name: 'Transcendencja',
          description: 'Zdobądź 1,000,000 Wiary',
          icon: 'mdi-star-shooting',
          category: 'faith',
          hidden: false,
          condition: () => resourceStore.totalFaithEarned.gte(1000000),
          reward: { type: 'production_bonus', value: 10, description: '+10% produkcji' },
        },

        // ========== BUILDING ACHIEVEMENTS ==========
        {
          id: 'buildings_5',
          name: 'Pierwsze Kroki',
          description: 'Zbuduj 5 budynków',
          icon: 'mdi-home',
          category: 'buildings',
          hidden: false,
          condition: () => {
            const total = Object.values(entityStore.entities).reduce((sum, e) => sum + e.count, 0);
            return total >= 5;
          },
          reward: { type: 'production_bonus', value: 1, description: '+1% produkcji' },
        },
        {
          id: 'buildings_10',
          name: 'Budowniczy',
          description: 'Zbuduj 10 budynków',
          icon: 'mdi-home-group',
          category: 'buildings',
          hidden: false,
          condition: () => {
            const total = Object.values(entityStore.entities).reduce((sum, e) => sum + e.count, 0);
            return total >= 10;
          },
          reward: { type: 'production_bonus', value: 2, description: '+2% produkcji' },
        },
        {
          id: 'buildings_25',
          name: 'Architekt',
          description: 'Zbuduj 25 budynków',
          icon: 'mdi-office-building',
          category: 'buildings',
          hidden: false,
          condition: () => {
            const total = Object.values(entityStore.entities).reduce((sum, e) => sum + e.count, 0);
            return total >= 25;
          },
          reward: { type: 'production_bonus', value: 3, description: '+3% produkcji' },
        },
        {
          id: 'buildings_50',
          name: 'Urbanista',
          description: 'Zbuduj 50 budynków',
          icon: 'mdi-city',
          category: 'buildings',
          hidden: false,
          condition: () => {
            const total = Object.values(entityStore.entities).reduce((sum, e) => sum + e.count, 0);
            return total >= 50;
          },
          reward: { type: 'production_bonus', value: 5, description: '+5% produkcji' },
        },
        {
          id: 'buildings_100',
          name: 'Imperator',
          description: 'Zbuduj 100 budynków',
          icon: 'mdi-city-variant',
          category: 'buildings',
          hidden: false,
          condition: () => {
            const total = Object.values(entityStore.entities).reduce((sum, e) => sum + e.count, 0);
            return total >= 100;
          },
          reward: { type: 'production_bonus', value: 10, description: '+10% produkcji' },
        },
        {
          id: 'chapels_10',
          name: 'Pełna Kaplica',
          description: 'Posiadaj 10 Kapliczek',
          icon: 'mdi-church',
          category: 'buildings',
          hidden: false,
          condition: () => entityStore.entities.chapel?.count >= 10,
          reward: { type: 'production_bonus', value: 2, description: '+2% produkcji' },
        },
        {
          id: 'chapels_25',
          name: 'Sieć Kapliczek',
          description: 'Posiadaj 25 Kapliczek',
          icon: 'mdi-church',
          category: 'buildings',
          hidden: false,
          condition: () => entityStore.entities.chapel?.count >= 25,
          reward: { type: 'production_bonus', value: 5, description: '+5% produkcji' },
        },

        // ========== COMBAT ACHIEVEMENTS ==========
        {
          id: 'waves_1',
          name: 'Pierwsza Obrona',
          description: 'Odpieraj pierwszą falę',
          icon: 'mdi-shield',
          category: 'combat',
          hidden: false,
          condition: () => combatStore.wavesDefeated >= 1,
          reward: { type: 'production_bonus', value: 1, description: '+1% produkcji' },
        },
        {
          id: 'waves_5',
          name: 'Obrońca',
          description: 'Odpieraj 5 fal',
          icon: 'mdi-shield-check',
          category: 'combat',
          hidden: false,
          condition: () => combatStore.wavesDefeated >= 5,
          reward: { type: 'production_bonus', value: 2, description: '+2% produkcji' },
        },
        {
          id: 'waves_10',
          name: 'Strażnik',
          description: 'Odpieraj 10 fal',
          icon: 'mdi-shield-star',
          category: 'combat',
          hidden: false,
          condition: () => combatStore.wavesDefeated >= 10,
          reward: { type: 'production_bonus', value: 3, description: '+3% produkcji' },
        },
        {
          id: 'waves_25',
          name: 'Weteran',
          description: 'Odpieraj 25 fal',
          icon: 'mdi-shield-sword',
          category: 'combat',
          hidden: false,
          condition: () => combatStore.wavesDefeated >= 25,
          reward: { type: 'production_bonus', value: 5, description: '+5% produkcji' },
        },
        {
          id: 'waves_50',
          name: 'Nieugięty',
          description: 'Odpieraj 50 fal',
          icon: 'mdi-shield-crown',
          category: 'combat',
          hidden: false,
          condition: () => combatStore.wavesDefeated >= 50,
          reward: { type: 'production_bonus', value: 7, description: '+7% produkcji' },
        },
        {
          id: 'waves_100',
          name: 'Legenda Frontu',
          description: 'Odpieraj 100 fal',
          icon: 'mdi-trophy',
          category: 'combat',
          hidden: false,
          condition: () => combatStore.wavesDefeated >= 100,
          reward: { type: 'production_bonus', value: 15, description: '+15% produkcji' },
        },

        // ========== PRESTIGE ACHIEVEMENTS ==========
        {
          id: 'prestige_1',
          name: 'Odrodzony',
          description: 'Wykonaj pierwszy prestiż',
          icon: 'mdi-refresh',
          category: 'prestige',
          hidden: false,
          condition: () => prestigeStore.stats.totalPrestigeCount >= 1,
          reward: { type: 'prestige_bonus', value: 5, description: '+5% Popiołów' },
        },
        {
          id: 'prestige_5',
          name: 'Feniks',
          description: 'Wykonaj 5 prestiży',
          icon: 'mdi-fire-circle',
          category: 'prestige',
          hidden: false,
          condition: () => prestigeStore.stats.totalPrestigeCount >= 5,
          reward: { type: 'prestige_bonus', value: 10, description: '+10% Popiołów' },
        },
        {
          id: 'prestige_10',
          name: 'Wieczny Cykl',
          description: 'Wykonaj 10 prestiży',
          icon: 'mdi-infinity',
          category: 'prestige',
          hidden: false,
          condition: () => prestigeStore.stats.totalPrestigeCount >= 10,
          reward: { type: 'prestige_bonus', value: 15, description: '+15% Popiołów' },
        },
        {
          id: 'prestige_25',
          name: 'Wieczny',
          description: 'Wykonaj 25 prestiży',
          icon: 'mdi-star-circle',
          category: 'prestige',
          hidden: false,
          condition: () => prestigeStore.stats.totalPrestigeCount >= 25,
          reward: { type: 'prestige_bonus', value: 25, description: '+25% Popiołów' },
        },
        {
          id: 'ashes_100',
          name: 'Popiół i Płomień',
          description: 'Zdobądź łącznie 100 Popiołów',
          icon: 'mdi-fire',
          category: 'prestige',
          hidden: false,
          condition: () => prestigeStore.stats.totalAshesEarned.gte(100),
          reward: { type: 'prestige_bonus', value: 10, description: '+10% Popiołów' },
        },
        {
          id: 'ashes_1000',
          name: 'Pył Męczenników',
          description: 'Zdobądź łącznie 1,000 Popiołów',
          icon: 'mdi-fire',
          category: 'prestige',
          hidden: false,
          condition: () => prestigeStore.stats.totalAshesEarned.gte(1000),
          reward: { type: 'prestige_bonus', value: 20, description: '+20% Popiołów' },
        },

        // ========== CLICK ACHIEVEMENTS ==========
        {
          id: 'clicks_100',
          name: 'Modlitewnik',
          description: 'Kliknij 100 razy',
          icon: 'mdi-hand-pointing-up',
          category: 'clicks',
          hidden: false,
          condition: () => totalClicks.value >= 100,
          reward: { type: 'click_bonus', value: 5, description: '+5% z kliknięć' },
        },
        {
          id: 'clicks_500',
          name: 'Wytrwały',
          description: 'Kliknij 500 razy',
          icon: 'mdi-hand-back-left',
          category: 'clicks',
          hidden: false,
          condition: () => totalClicks.value >= 500,
          reward: { type: 'click_bonus', value: 10, description: '+10% z kliknięć' },
        },
        {
          id: 'clicks_1000',
          name: 'Fanatyk',
          description: 'Kliknij 1,000 razy',
          icon: 'mdi-hand-wave',
          category: 'clicks',
          hidden: false,
          condition: () => totalClicks.value >= 1000,
          reward: { type: 'click_bonus', value: 15, description: '+15% z kliknięć' },
        },
        {
          id: 'clicks_5000',
          name: 'Święte Palce',
          description: 'Kliknij 5,000 razy',
          icon: 'mdi-hand-clap',
          category: 'clicks',
          hidden: false,
          condition: () => totalClicks.value >= 5000,
          reward: { type: 'click_bonus', value: 25, description: '+25% z kliknięć' },
        },
        {
          id: 'clicks_10000',
          name: 'Palce Boga',
          description: 'Kliknij 10,000 razy',
          icon: 'mdi-hand-peace',
          category: 'clicks',
          hidden: false,
          condition: () => totalClicks.value >= 10000,
          reward: { type: 'click_bonus', value: 50, description: '+50% z kliknięć' },
        },

        // ========== HIDDEN ACHIEVEMENTS ==========
        {
          id: 'hidden_night',
          name: 'Nocna Zmiana',
          description: 'Graj między 2:00 a 4:00 w nocy',
          icon: 'mdi-weather-night',
          category: 'hidden',
          hidden: true,
          condition: () => {
            const hour = new Date().getHours();
            return hour >= 2 && hour < 4;
          },
          reward: { type: 'production_bonus', value: 5, description: '+5% produkcji' },
        },
        {
          id: 'hidden_early_bird',
          name: 'Ranny Ptaszek',
          description: 'Graj między 5:00 a 6:00 rano',
          icon: 'mdi-weather-sunny',
          category: 'hidden',
          hidden: true,
          condition: () => {
            const hour = new Date().getHours();
            return hour >= 5 && hour < 6;
          },
          reward: { type: 'production_bonus', value: 3, description: '+3% produkcji' },
        },
        {
          id: 'hidden_full_morale',
          name: 'Nienaruszony',
          description: 'Utrzymaj 100 morale przez 5 minut',
          icon: 'mdi-emoticon-happy',
          category: 'hidden',
          hidden: true,
          condition: () => {
            // This is checked differently - via game loop
            return false; // Will be manually triggered
          },
          reward: { type: 'production_bonus', value: 5, description: '+5% produkcji' },
        },
        {
          id: 'hidden_speed_prestige',
          name: 'Szybkie Odrodzenie',
          description: 'Wykonaj prestiż w mniej niż 10 minut',
          icon: 'mdi-lightning-bolt',
          category: 'hidden',
          hidden: true,
          condition: () => {
            const fastestPrestige = prestigeStore.stats.fastestPrestige;
            return fastestPrestige < 600 && fastestPrestige !== Infinity;
          },
          reward: { type: 'prestige_bonus', value: 10, description: '+10% Popiołów' },
        },
        {
          id: 'hidden_rich',
          name: 'Skarbiec',
          description: 'Posiadaj 10,000 Wiary naraz',
          icon: 'mdi-treasure-chest',
          category: 'hidden',
          hidden: true,
          condition: () => resourceStore.resources.faith.amount.gte(10000),
          reward: { type: 'production_bonus', value: 5, description: '+5% produkcji' },
        },
      ];
    });

    // ============================================
    // Computed
    // ============================================

    const totalAchievements = computed(() => achievements.value.length);

    const unlockedCount = computed(() => Object.keys(unlockedAchievements.value).length);

    const unlockedPercent = computed(() => {
      if (totalAchievements.value === 0) return 0;
      return Math.round((unlockedCount.value / totalAchievements.value) * 100);
    });

    const unseenCount = computed(() => {
      return Object.values(unlockedAchievements.value).filter(a => !a.seen).length;
    });

    const isUnlocked = computed(() => (achievementId: string): boolean => {
      return achievementId in unlockedAchievements.value;
    });

    const getAchievement = computed(() => (achievementId: string): Achievement | undefined => {
      return achievements.value.find(a => a.id === achievementId);
    });

    const achievementsByCategory = computed(() => {
      const categories: Record<AchievementCategory, Achievement[]> = {
        faith: [],
        buildings: [],
        combat: [],
        prestige: [],
        clicks: [],
        hidden: [],
      };

      for (const achievement of achievements.value) {
        categories[achievement.category].push(achievement);
      }

      return categories;
    });

    /**
     * Calculate total bonus from achievements
     */
    const totalProductionBonus = computed(() => {
      let bonus = 0;
      for (const [id] of Object.entries(unlockedAchievements.value)) {
        const achievement = achievements.value.find(a => a.id === id);
        if (achievement?.reward?.type === 'production_bonus') {
          bonus += achievement.reward.value;
        }
      }
      return bonus;
    });

    const totalClickBonus = computed(() => {
      let bonus = 0;
      for (const [id] of Object.entries(unlockedAchievements.value)) {
        const achievement = achievements.value.find(a => a.id === id);
        if (achievement?.reward?.type === 'click_bonus') {
          bonus += achievement.reward.value;
        }
      }
      return bonus;
    });

    const totalPrestigeBonus = computed(() => {
      let bonus = 0;
      for (const [id] of Object.entries(unlockedAchievements.value)) {
        const achievement = achievements.value.find(a => a.id === id);
        if (achievement?.reward?.type === 'prestige_bonus') {
          bonus += achievement.reward.value;
        }
      }
      return bonus;
    });

    // ============================================
    // Actions
    // ============================================

    /**
     * Check all achievements and unlock any that meet conditions
     * Called periodically from game loop
     */
    function checkAchievements() {
      for (const achievement of achievements.value) {
        // Skip already unlocked
        if (achievement.id in unlockedAchievements.value) continue;

        // Check condition
        try {
          if (achievement.condition()) {
            unlockAchievement(achievement.id);
          }
        } catch (e) {
          // Condition might fail if stores not ready
          console.warn(`[Achievements] Error checking ${achievement.id}:`, e);
        }
      }
    }

    /**
     * Unlock an achievement
     */
    function unlockAchievement(achievementId: string) {
      if (achievementId in unlockedAchievements.value) return;

      const achievement = achievements.value.find(a => a.id === achievementId);
      if (!achievement) return;

      unlockedAchievements.value[achievementId] = {
        id: achievementId,
        unlockedAt: Date.now(),
        seen: false,
      };

      // Add to toast queue
      toastQueue.value.push(achievement);

      console.log(`[Achievements] Unlocked: ${achievement.name}`);
    }

    /**
     * Mark achievement as seen
     */
    function markAsSeen(achievementId: string) {
      if (achievementId in unlockedAchievements.value) {
        unlockedAchievements.value[achievementId].seen = true;
      }
    }

    /**
     * Mark all achievements as seen
     */
    function markAllAsSeen() {
      for (const id in unlockedAchievements.value) {
        unlockedAchievements.value[id].seen = true;
      }
    }

    /**
     * Get next toast from queue
     */
    function popToast(): Achievement | null {
      if (toastQueue.value.length === 0) return null;
      return toastQueue.value.shift() || null;
    }

    /**
     * Increment click counter
     */
    function registerClick() {
      totalClicks.value++;
    }

    /**
     * Manually unlock achievement (for special conditions)
     */
    function forceUnlock(achievementId: string) {
      unlockAchievement(achievementId);
    }

    /**
     * DEV: Reset all achievements
     */
    function devResetAchievements() {
      unlockedAchievements.value = {};
      totalClicks.value = 0;
      toastQueue.value = [];
    }

    /**
     * DEV: Unlock all achievements
     */
    function devUnlockAll() {
      for (const achievement of achievements.value) {
        if (!(achievement.id in unlockedAchievements.value)) {
          unlockedAchievements.value[achievement.id] = {
            id: achievement.id,
            unlockedAt: Date.now(),
            seen: true,
          };
        }
      }
    }

    return {
      // State
      unlockedAchievements,
      totalClicks,
      toastQueue,

      // Data
      achievements,

      // Computed
      totalAchievements,
      unlockedCount,
      unlockedPercent,
      unseenCount,
      isUnlocked,
      getAchievement,
      achievementsByCategory,
      totalProductionBonus,
      totalClickBonus,
      totalPrestigeBonus,

      // Actions
      checkAchievements,
      unlockAchievement,
      markAsSeen,
      markAllAsSeen,
      popToast,
      registerClick,
      forceUnlock,

      // Dev
      devResetAchievements,
      devUnlockAll,
    };
  },
  {
    persist: {
      key: 'solmar-achievements',
      storage: typeof window !== 'undefined' ? localStorage : undefined,
      pick: ['unlockedAchievements', 'totalClicks'],
    },
  }
);

