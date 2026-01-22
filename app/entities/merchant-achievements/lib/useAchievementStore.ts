/**
 * Achievements Store for Merchant Idle
 * Handles the achievement system - tracking progress and unlocking rewards
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useMerchantStore } from '~/entities/merchant';
import { bn } from '~/shared/lib/big-number';
import type { Achievement, UnlockedAchievement, AchievementCategory } from '../model';

export const useAchievementStore = defineStore(
  'merchant-achievements',
  () => {
    // State
    const unlockedAchievements = ref<Record<string, UnlockedAchievement>>({});
    const toastQueue = ref<Achievement[]>([]);

    // Achievement Definitions
    const achievements = computed((): Achievement[] => {
      const merchantStore = useMerchantStore();

      return [
        // ========== GOLD ACHIEVEMENTS ==========
        {
          id: 'gold_100',
          name: 'Pierwsze Złoto',
          description: 'Zdobądź 100 złota',
          icon: 'mdi-coins',
          category: 'gold',
          hidden: false,
          condition: () => bn(merchantStore.lifetimeGold).gte(100),
        },
        {
          id: 'gold_1000',
          name: 'Mały Skarb',
          description: 'Zdobądź 1,000 złota',
          icon: 'mdi-treasure-chest',
          category: 'gold',
          hidden: false,
          condition: () => bn(merchantStore.lifetimeGold).gte(1000),
        },
        {
          id: 'gold_10000',
          name: 'Zamożny Kupiec',
          description: 'Zdobądź 10,000 złota',
          icon: 'mdi-piggy-bank',
          category: 'gold',
          hidden: false,
          condition: () => bn(merchantStore.lifetimeGold).gte(10000),
        },
        {
          id: 'gold_100000',
          name: 'Bogaty Handlarz',
          description: 'Zdobądź 100,000 złota',
          icon: 'mdi-bank',
          category: 'gold',
          hidden: false,
          condition: () => bn(merchantStore.lifetimeGold).gte(100000),
        },
        {
          id: 'gold_1m',
          name: 'Magnat',
          description: 'Zdobądź 1 milion złota',
          icon: 'mdi-crown',
          category: 'gold',
          hidden: false,
          condition: () => bn(merchantStore.lifetimeGold).gte(1e6),
          reward: {
            type: 'production_bonus',
            value: 5,
            description: '+5% produkcji',
          },
        },
        {
          id: 'gold_1b',
          name: 'Miliarder',
          description: 'Zdobądź 1 miliard złota',
          icon: 'mdi-crown-circle',
          category: 'gold',
          hidden: false,
          condition: () => bn(merchantStore.lifetimeGold).gte(1e9),
          reward: {
            type: 'production_bonus',
            value: 10,
            description: '+10% produkcji',
          },
        },
        {
          id: 'gold_1t',
          name: 'Trylioner',
          description: 'Zdobądź 1 trylion złota',
          icon: 'mdi-crown-outline',
          category: 'gold',
          hidden: false,
          condition: () => bn(merchantStore.lifetimeGold).gte(1e12),
          reward: {
            type: 'production_bonus',
            value: 15,
            description: '+15% produkcji',
          },
        },

        // ========== WORKER ACHIEVEMENTS ==========
        {
          id: 'worker_first',
          name: 'Pierwszy Pracownik',
          description: 'Zatrudnij pierwszego pracownika',
          icon: 'mdi-account-plus',
          category: 'workers',
          hidden: false,
          condition: () =>
            merchantStore.workers.some((w) => w.count > 0),
        },
        {
          id: 'worker_10',
          name: 'Mała Gildia',
          description: 'Zatrudnij 10 pracowników łącznie',
          icon: 'mdi-account-group',
          category: 'workers',
          hidden: false,
          condition: () =>
            merchantStore.workers.reduce((sum, w) => sum + w.count, 0) >= 10,
        },
        {
          id: 'worker_100',
          name: 'Duża Gildia',
          description: 'Zatrudnij 100 pracowników łącznie',
          icon: 'mdi-account-multiple',
          category: 'workers',
          hidden: false,
          condition: () =>
            merchantStore.workers.reduce((sum, w) => sum + w.count, 0) >= 100,
        },
        {
          id: 'worker_1000',
          name: 'Imperium',
          description: 'Zatrudnij 1,000 pracowników łącznie',
          icon: 'mdi-account-supervisor',
          category: 'workers',
          hidden: false,
          condition: () =>
            merchantStore.workers.reduce((sum, w) => sum + w.count, 0) >= 1000,
          reward: {
            type: 'production_bonus',
            value: 5,
            description: '+5% produkcji',
          },
        },
        {
          id: 'worker_all_types',
          name: 'Różnorodność',
          description: 'Zatrudnij przynajmniej jednego pracownika każdego typu',
          icon: 'mdi-account-multiple-outline',
          category: 'workers',
          hidden: false,
          condition: () =>
            merchantStore.workers.every((w) => w.count > 0),
        },

        // ========== CITY ACHIEVEMENTS ==========
        {
          id: 'city_first',
          name: 'Odkrywca',
          description: 'Odkryj pierwsze miasto',
          icon: 'mdi-map-marker',
          category: 'cities',
          hidden: false,
          condition: () =>
            merchantStore.cities.filter((c) => c.unlocked && c.id !== 'capital')
              .length >= 1,
        },
        {
          id: 'city_5',
          name: 'Handlowiec',
          description: 'Odkryj 5 miast',
          icon: 'mdi-map-marker-multiple',
          category: 'cities',
          hidden: false,
          condition: () =>
            merchantStore.cities.filter((c) => c.unlocked && c.id !== 'capital')
              .length >= 5,
        },
        {
          id: 'city_all',
          name: 'Kartograf',
          description: 'Odkryj wszystkie miasta',
          icon: 'mdi-map',
          category: 'cities',
          hidden: false,
          condition: () =>
            merchantStore.cities.every((c) => c.unlocked),
          reward: {
            type: 'production_bonus',
            value: 10,
            description: '+10% produkcji',
          },
        },

        // ========== CARAVAN ACHIEVEMENTS ==========
        {
          id: 'caravan_first',
          name: 'Pierwsza Karawana',
          description: 'Wyślij pierwszą karawanę',
          icon: 'mdi-truck-delivery',
          category: 'caravans',
          hidden: false,
          condition: () => merchantStore.stats.totalGoldFromTrade.gt(0),
        },
        {
          id: 'caravan_100',
          name: 'Doświadczony Handlarz',
          description: 'Wygeneruj 100 złota z handlu',
          icon: 'mdi-truck-fast',
          category: 'caravans',
          hidden: false,
          condition: () => bn(merchantStore.stats.totalGoldFromTrade).gte(100),
        },
        {
          id: 'caravan_1m',
          name: 'Mistrz Handlu',
          description: 'Wygeneruj 1 milion złota z handlu',
          icon: 'mdi-truck-check',
          category: 'caravans',
          hidden: false,
          condition: () => bn(merchantStore.stats.totalGoldFromTrade).gte(1e6),
          reward: {
            type: 'production_bonus',
            value: 5,
            description: '+5% produkcji',
          },
        },

        // ========== CLICK ACHIEVEMENTS ==========
        {
          id: 'click_100',
          name: 'Pracowity',
          description: 'Kliknij 100 razy',
          icon: 'mdi-hand-pointing-up',
          category: 'clicks',
          hidden: false,
          condition: () => merchantStore.stats.totalClicks >= 100,
        },
        {
          id: 'click_1000',
          name: 'Wytrwały',
          description: 'Kliknij 1,000 razy',
          icon: 'mdi-hand-pointing-right',
          category: 'clicks',
          hidden: false,
          condition: () => merchantStore.stats.totalClicks >= 1000,
        },
        {
          id: 'click_10000',
          name: 'Niezmordowany',
          description: 'Kliknij 10,000 razy',
          icon: 'mdi-hand-wave',
          category: 'clicks',
          hidden: false,
          condition: () => merchantStore.stats.totalClicks >= 10000,
          reward: {
            type: 'click_bonus',
            value: 10,
            description: '+10% siły kliknięć',
          },
        },

        // ========== PRESTIGE ACHIEVEMENTS ==========
        {
          id: 'prestige_first',
          name: 'Wielka Pokuta',
          description: 'Wykonaj pierwszy prestiż',
          icon: 'mdi-church',
          category: 'prestige',
          hidden: false,
          condition: () => merchantStore.stats.prestigeCount >= 1,
          reward: {
            type: 'reputation_bonus',
            value: 5,
            description: '+5% reputacji',
          },
        },
        {
          id: 'prestige_5',
          name: 'Pobożny',
          description: 'Wykonaj 5 prestiży',
          icon: 'mdi-church-outline',
          category: 'prestige',
          hidden: false,
          condition: () => merchantStore.stats.prestigeCount >= 5,
          reward: {
            type: 'reputation_bonus',
            value: 10,
            description: '+10% reputacji',
          },
        },
        {
          id: 'prestige_10',
          name: 'Święty',
          description: 'Wykonaj 10 prestiży',
          icon: 'mdi-church',
          category: 'prestige',
          hidden: false,
          condition: () => merchantStore.stats.prestigeCount >= 10,
          reward: {
            type: 'reputation_bonus',
            value: 15,
            description: '+15% reputacji',
          },
        },

        // ========== FACTOR ACHIEVEMENTS ==========
        {
          id: 'factor_first',
          name: 'Pierwszy Factor',
          description: 'Zatrudnij pierwszego Faktora',
          icon: 'mdi-account-tie',
          category: 'factors',
          hidden: false,
          condition: () => merchantStore.activeFactors.length >= 1,
        },
        {
          id: 'factor_5',
          name: 'Sieć Faktorów',
          description: 'Zatrudnij 5 Faktorów',
          icon: 'mdi-account-network',
          category: 'factors',
          hidden: false,
          condition: () => merchantStore.activeFactors.length >= 5,
          reward: {
            type: 'production_bonus',
            value: 5,
            description: '+5% produkcji',
          },
        },
        {
          id: 'factor_all',
          name: 'Automatyzacja',
          description: 'Zatrudnij Faktora w każdym odkrytym mieście',
          icon: 'mdi-robot',
          category: 'factors',
          hidden: false,
          condition: () => {
            const unlockedCities = merchantStore.cities.filter(
              (c) => c.unlocked && c.id !== 'capital'
            );
            return (
              unlockedCities.length > 0 &&
              unlockedCities.every((city) =>
                merchantStore.factors.some(
                  (f) => f.cityId === city.id && f.hired
                )
              )
            );
          },
          reward: {
            type: 'production_bonus',
            value: 10,
            description: '+10% produkcji',
          },
        },

        // ========== HIDDEN ACHIEVEMENTS ==========
        {
          id: 'hidden_idle_master',
          name: 'Mistrz Idle',
          description: 'Zdobądź 1 trylion złota bez kliknięć (tylko pasywna produkcja)',
          icon: 'mdi-sleep',
          category: 'hidden',
          hidden: true,
          condition: () =>
            bn(merchantStore.lifetimeGold).gte(1e12) &&
            merchantStore.stats.totalClicks < 10,
        },
        {
          id: 'hidden_speedrunner',
          name: 'Błyskawiczny',
          description: 'Osiągnij 1 milion złota w mniej niż 5 minut',
          icon: 'mdi-lightning-bolt',
          category: 'hidden',
          hidden: true,
          condition: () => {
            const playTime = Date.now() - merchantStore.stats.startTime;
            return (
              bn(merchantStore.lifetimeGold).gte(1e6) &&
              playTime < 5 * 60 * 1000
            );
          },
        },
      ];
    });

    // Computed
    const unlockedCount = computed(() =>
      Object.keys(unlockedAchievements.value).length
    );
    const totalAchievements = computed(() => achievements.value.length);
    const unlockedPercent = computed(() =>
      totalAchievements.value > 0
        ? Math.round((unlockedCount.value / totalAchievements.value) * 100)
        : 0
    );

    const totalProductionBonus = computed(() => {
      return achievements.value
        .filter((a) => a.id in unlockedAchievements.value)
        .filter((a) => a.reward?.type === 'production_bonus')
        .reduce((sum, a) => sum + (a.reward?.value || 0), 0);
    });

    const totalClickBonus = computed(() => {
      return achievements.value
        .filter((a) => a.id in unlockedAchievements.value)
        .filter((a) => a.reward?.type === 'click_bonus')
        .reduce((sum, a) => sum + (a.reward?.value || 0), 0);
    });

    const totalReputationBonus = computed(() => {
      return achievements.value
        .filter((a) => a.id in unlockedAchievements.value)
        .filter((a) => a.reward?.type === 'reputation_bonus')
        .reduce((sum, a) => sum + (a.reward?.value || 0), 0);
    });

    // Actions
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

    function unlockAchievement(achievementId: string) {
      if (achievementId in unlockedAchievements.value) return;

      const achievement = achievements.value.find((a) => a.id === achievementId);
      if (!achievement) return;

      unlockedAchievements.value[achievementId] = {
        id: achievementId,
        unlockedAt: Date.now(),
        seen: false,
      };

      // Add to toast queue
      toastQueue.value.push(achievement);

      // Log to merchant store
      const merchantStore = useMerchantStore();
      merchantStore.addEvent(
        `🏆 Osiągnięcie odblokowane: ${achievement.name}!`,
        'success'
      );
    }

    function isUnlocked(achievementId: string): boolean {
      return achievementId in unlockedAchievements.value;
    }

    function markAsSeen(achievementId: string) {
      if (achievementId in unlockedAchievements.value) {
        unlockedAchievements.value[achievementId].seen = true;
      }
    }

    function markAllAsSeen() {
      for (const id in unlockedAchievements.value) {
        unlockedAchievements.value[id].seen = true;
      }
    }

    function popToast(): Achievement | null {
      if (toastQueue.value.length === 0) return null;
      return toastQueue.value.shift() || null;
    }

    return {
      achievements,
      unlockedAchievements,
      unlockedCount,
      totalAchievements,
      unlockedPercent,
      totalProductionBonus,
      totalClickBonus,
      totalReputationBonus,
      toastQueue,
      checkAchievements,
      unlockAchievement,
      isUnlocked,
      markAsSeen,
      markAllAsSeen,
      popToast,
    };
  },
  {
    persist: {
      key: 'merchant-achievements-save',
    },
  }
);
