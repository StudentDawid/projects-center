/**
 * Prestige Store
 * Handles the meta-progression system "Popioły Męczenników" (Martyr Ashes)
 *
 * Core mechanic: Players can voluntarily reset their progress to gain
 * prestige currency based on their achievements. This currency provides
 * permanent upgrades that persist across resets.
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import Decimal from 'break_infinity.js';
import { bn, formatNumber } from '~/shared/lib/big-number';
import { useResourceStore } from './resources';
import { useEntityStore } from './entities';
import { useCombatStore } from './combat';
import { useNarrativeStore } from './narrative';
import { useGameLoopStore } from './gameLoop';
import { useEventStore } from './events';
import { useChallengeStore } from './challenges';
import { useStatisticsStore } from './statistics';
import { logger } from '~/shared/lib/logger';

// ============================================
// Types
// ============================================

// Local interface for prestige upgrade definitions
// Note: This is different from PrestigeUpgrade in game.types.ts
export interface PrestigeUpgradeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  baseCost: Decimal;
  costMultiplier: number; // How much cost increases per level
  maxLevel: number;
  effect: (level: number) => number; // Returns the bonus for current level
  effectDescription: (level: number) => string; // Human-readable effect
  category: 'production' | 'combat' | 'utility';
}

export interface PrestigeStats {
  totalPrestigeCount: number;
  totalAshesEarned: Decimal;
  highestWave: number;
  highestFaith: Decimal;
  fastestPrestige: number; // Seconds
}

// ============================================
// Store
// ============================================

export const usePrestigeStore = defineStore(
  'prestige',
  () => {
    const resourceStore = useResourceStore();
    const entityStore = useEntityStore();
    const combatStore = useCombatStore();
    const narrativeStore = useNarrativeStore();

    // ============================================
    // State
    // ============================================

    // Prestige currency - "Popioły Męczenników" (Martyr Ashes)
    const martyrAshes = ref(bn(0));

    // Purchased upgrades: { upgradeId: level }
    const purchasedUpgrades = ref<Record<string, number>>({});

    // Stats tracking
    const stats = ref<PrestigeStats>({
      totalPrestigeCount: 0,
      totalAshesEarned: bn(0),
      highestWave: 0,
      highestFaith: bn(0),
      fastestPrestige: Infinity,
    });

    // Current cycle start time (for fastest prestige tracking)
    const cycleStartTime = ref(Date.now());

    // Relic bonus for prestige
    const relicPrestigeBonus = ref(1);

    // ============================================
    // Prestige Upgrades Definitions
    // ============================================

    const upgrades: PrestigeUpgradeDefinition[] = [
      // === PRODUCTION UPGRADES ===
      {
        id: 'devout_start',
        name: 'Pobożny Start',
        description: 'Zacznij każdy cykl z dodatkową Wiarą.',
        icon: 'mdi-cross-outline',
        baseCost: bn(5),
        costMultiplier: 1.5,
        maxLevel: 10,
        effect: (level) => level * 500, // +500 Faith per level
        effectDescription: (level) => `+${level * 500} Wiary na start`,
        category: 'production',
      },
      {
        id: 'sacred_efficiency',
        name: 'Święta Wydajność',
        description: 'Wszystkie budynki produkują więcej.',
        icon: 'mdi-arrow-up-bold',
        baseCost: bn(10),
        costMultiplier: 2,
        maxLevel: 20,
        effect: (level) => 1 + level * 0.1, // +10% per level
        effectDescription: (level) => `+${level * 10}% produkcji budynków`,
        category: 'production',
      },
      {
        id: 'fervent_prayer',
        name: 'Żarliwa Modlitwa',
        description: 'Kliknięcia generują więcej Wiary.',
        icon: 'mdi-hand-heart',
        baseCost: bn(8),
        costMultiplier: 1.8,
        maxLevel: 15,
        effect: (level) => 1 + level * 0.25, // +25% per level
        effectDescription: (level) => `+${level * 25}% Wiary z modlitwy`,
        category: 'production',
      },
      {
        id: 'blessed_harvest',
        name: 'Błogosławione Zbiory',
        description: 'Produkuj więcej Wiary pasywnie.',
        icon: 'mdi-sprout',
        baseCost: bn(15),
        costMultiplier: 2.2,
        maxLevel: 10,
        effect: (level) => 1 + level * 0.15, // +15% per level
        effectDescription: (level) => `+${level * 15}% pasywnej produkcji Wiary`,
        category: 'production',
      },

      // === COMBAT UPGRADES ===
      {
        id: 'hardened_souls',
        name: 'Zahartowane Dusze',
        description: 'Jednostki mają więcej HP i przeżywalności.',
        icon: 'mdi-shield-account',
        baseCost: bn(12),
        costMultiplier: 1.7,
        maxLevel: 10,
        effect: (level) => 1 - level * 0.05, // -5% unit losses per level
        effectDescription: (level) => `-${level * 5}% strat jednostek`,
        category: 'combat',
      },
      {
        id: 'fortress_of_faith',
        name: 'Forteca Wiary',
        description: 'Zagrożenie rośnie wolniej.',
        icon: 'mdi-castle',
        baseCost: bn(15),
        costMultiplier: 2,
        maxLevel: 10,
        effect: (level) => 1 - level * 0.03, // -3% threat growth per level
        effectDescription: (level) => `-${level * 3}% wzrostu zagrożenia`,
        category: 'combat',
      },
      {
        id: 'indomitable_spirit',
        name: 'Nieugięty Duch',
        description: 'Morale regeneruje się szybciej.',
        icon: 'mdi-heart-pulse',
        baseCost: bn(10),
        costMultiplier: 1.6,
        maxLevel: 10,
        effect: (level) => level * 0.2, // +0.2 morale regen per level
        effectDescription: (level) => `+${(level * 0.2).toFixed(1)}/s regeneracji morale`,
        category: 'combat',
      },
      {
        id: 'divine_shield',
        name: 'Boski Tarcza',
        description: 'Obrażenia morale są zmniejszone.',
        icon: 'mdi-shield-sun',
        baseCost: bn(20),
        costMultiplier: 2.5,
        maxLevel: 8,
        effect: (level) => 1 - level * 0.05, // -5% morale damage per level
        effectDescription: (level) => `-${level * 5}% obrażeń morale`,
        category: 'combat',
      },

      // === UTILITY UPGRADES ===
      {
        id: 'echo_of_martyrs',
        name: 'Echo Męczenników',
        description: 'Zdobywaj więcej Popiołów przy prestiżu.',
        icon: 'mdi-fire',
        baseCost: bn(25),
        costMultiplier: 3,
        maxLevel: 5,
        effect: (level) => 1 + level * 0.2, // +20% ashes per level
        effectDescription: (level) => `+${level * 20}% Popiołów Męczenników`,
        category: 'utility',
      },
      {
        id: 'accelerated_growth',
        name: 'Przyspieszony Rozwój',
        description: 'Budynki są tańsze.',
        icon: 'mdi-sale',
        baseCost: bn(18),
        costMultiplier: 2,
        maxLevel: 10,
        effect: (level) => 1 - level * 0.03, // -3% building cost per level
        effectDescription: (level) => `-${level * 3}% kosztu budynków`,
        category: 'utility',
      },
      {
        id: 'blessed_liturgy',
        name: 'Błogosławiona Liturgia',
        description: 'Liturgie są tańsze.',
        icon: 'mdi-book-cross',
        baseCost: bn(15),
        costMultiplier: 1.8,
        maxLevel: 8,
        effect: (level) => 1 - level * 0.05, // -5% liturgy cost per level
        effectDescription: (level) => `-${level * 5}% kosztu liturgii`,
        category: 'utility',
      },
    ];

    // ============================================
    // Computed
    // ============================================

    /**
     * Calculate how many ashes player would get from prestiging now
     * Formula: sqrt(totalFaith / 10000) * waveBonus * upgradeBonus
     */
    const potentialAshes = computed(() => {
      const totalFaith = resourceStore.totalFaithEarned;
      const wavesDefeated = combatStore.wavesDefeated;

      // Base ashes from faith (diminishing returns via sqrt)
      const faithBonus = Math.sqrt(totalFaith.div(10000).toNumber());

      // Wave bonus (1 ash per 5 waves)
      const waveBonus = Math.floor(wavesDefeated / 5);

      // Building bonus (0.5 ash per 10 total buildings)
      const totalBuildings = Object.values(entityStore.entities)
        .reduce((sum, e) => sum + e.count, 0);
      const buildingBonus = Math.floor(totalBuildings / 10) * 0.5;

      // Base calculation
      let baseAshes = faithBonus + waveBonus + buildingBonus;

      // Apply "Echo of Martyrs" upgrade bonus
      const echoLevel = purchasedUpgrades.value['echo_of_martyrs'] || 0;
      if (echoLevel > 0) {
        const echoUpgrade = upgrades.find(u => u.id === 'echo_of_martyrs');
        if (echoUpgrade) {
          baseAshes *= echoUpgrade.effect(echoLevel);
        }
      }

      // Apply Sacred Vision event bonus (+50%)
      const eventStore = useEventStore();
      if (eventStore.hasSacredVisionBuff) {
        baseAshes *= 1.5;
      }

      // Apply relic prestige bonus
      baseAshes *= relicPrestigeBonus.value;

      return bn(Math.floor(baseAshes));
    });

    /**
     * Minimum requirements to prestige
     */
    const canPrestige = computed(() => {
      // Need at least 1000 faith OR 1 wave defeated
      const minFaith = resourceStore.totalFaithEarned.gte(1000);
      const minWaves = combatStore.wavesDefeated >= 1;

      return (minFaith || minWaves) && potentialAshes.value.gte(1);
    });

    /**
     * Get upgrade level
     */
    const getUpgradeLevel = computed(() => (upgradeId: string): number => {
      return purchasedUpgrades.value[upgradeId] || 0;
    });

    /**
     * Get upgrade cost for next level
     */
    const getUpgradeCost = computed(() => (upgradeId: string): Decimal => {
      const upgrade = upgrades.find(u => u.id === upgradeId);
      if (!upgrade) return bn(Infinity);

      const currentLevel = purchasedUpgrades.value[upgradeId] || 0;
      if (currentLevel >= upgrade.maxLevel) return bn(Infinity);

      return upgrade.baseCost.mul(Math.pow(upgrade.costMultiplier, currentLevel));
    });

    /**
     * Check if player can afford upgrade
     */
    const canAffordUpgrade = computed(() => (upgradeId: string): boolean => {
      const cost = getUpgradeCost.value(upgradeId);
      return martyrAshes.value.gte(cost);
    });

    /**
     * Check if upgrade is maxed
     */
    const isUpgradeMaxed = computed(() => (upgradeId: string): boolean => {
      const upgrade = upgrades.find(u => u.id === upgradeId);
      if (!upgrade) return true;
      return (purchasedUpgrades.value[upgradeId] || 0) >= upgrade.maxLevel;
    });

    /**
     * Get formatted ashes display
     */
    const formattedAshes = computed(() => formatNumber(martyrAshes.value));
    const formattedPotentialAshes = computed(() => formatNumber(potentialAshes.value));

    /**
     * Get all bonuses from prestige upgrades
     */
    const prestigeBonuses = computed(() => {
      const bonuses = {
        startingFaith: 0,
        productionMultiplier: 1,
        clickMultiplier: 1,
        faithProductionMultiplier: 1,
        unitLossReduction: 0,
        threatGrowthReduction: 0,
        moraleRegenBonus: 0,
        moraleDamageReduction: 0,
        ashesMultiplier: 1,
        buildingCostReduction: 0,
        liturgyCostReduction: 0,
      };

      for (const [upgradeId, level] of Object.entries(purchasedUpgrades.value)) {
        if (level <= 0) continue;

        const upgrade = upgrades.find(u => u.id === upgradeId);
        if (!upgrade) continue;

        switch (upgradeId) {
          case 'devout_start':
            bonuses.startingFaith = upgrade.effect(level);
            break;
          case 'sacred_efficiency':
            bonuses.productionMultiplier = upgrade.effect(level);
            break;
          case 'fervent_prayer':
            bonuses.clickMultiplier = upgrade.effect(level);
            break;
          case 'blessed_harvest':
            bonuses.faithProductionMultiplier = upgrade.effect(level);
            break;
          case 'hardened_souls':
            bonuses.unitLossReduction = 1 - upgrade.effect(level);
            break;
          case 'fortress_of_faith':
            bonuses.threatGrowthReduction = 1 - upgrade.effect(level);
            break;
          case 'indomitable_spirit':
            bonuses.moraleRegenBonus = upgrade.effect(level);
            break;
          case 'divine_shield':
            bonuses.moraleDamageReduction = 1 - upgrade.effect(level);
            break;
          case 'echo_of_martyrs':
            bonuses.ashesMultiplier = upgrade.effect(level);
            break;
          case 'accelerated_growth':
            bonuses.buildingCostReduction = 1 - upgrade.effect(level);
            break;
          case 'blessed_liturgy':
            bonuses.liturgyCostReduction = 1 - upgrade.effect(level);
            break;
        }
      }

      return bonuses;
    });

    // ============================================
    // Actions
    // ============================================

    /**
     * Perform prestige reset
     */
    function performPrestige(): boolean {
      if (!canPrestige.value) return false;

      const ashesGained = potentialAshes.value;

      // Update stats
      stats.value.totalPrestigeCount++;
      stats.value.totalAshesEarned = stats.value.totalAshesEarned.add(ashesGained);

      if (combatStore.wavesDefeated > stats.value.highestWave) {
        stats.value.highestWave = combatStore.wavesDefeated;
      }

      if (resourceStore.totalFaithEarned.gt(stats.value.highestFaith)) {
        stats.value.highestFaith = resourceStore.totalFaithEarned;
      }

      const cycleTime = (Date.now() - cycleStartTime.value) / 1000;
      if (cycleTime < stats.value.fastestPrestige) {
        stats.value.fastestPrestige = cycleTime;
      }

      // Add ashes
      martyrAshes.value = martyrAshes.value.add(ashesGained);

      // Track for challenges
      const challengeStore = useChallengeStore();
      challengeStore.onPrestige();

      // Track for statistics
      const statisticsStore = useStatisticsStore();
      statisticsStore.onPrestige(ashesGained.toNumber());

      // Narrative
      narrativeStore.addLog({
        message: `🔥 PRESTIŻ! Zdobyto ${formatNumber(ashesGained)} Popiołów Męczenników!`,
        type: 'info',
      });

      // Reset all stores with prestige bonuses applied
      resetAllStores();

      // Reset cycle timer
      cycleStartTime.value = Date.now();

      logger.log(`[Prestige] Reset performed. Ashes gained: ${formatNumber(ashesGained)}, Total: ${formatNumber(martyrAshes.value)}`);

      return true;
    }

    /**
     * Add ashes from boss defeat (without prestige reset)
     */
    function addAshesFromBoss(amount: number): void {
      martyrAshes.value = martyrAshes.value.add(amount);
      stats.value.totalAshesEarned = stats.value.totalAshesEarned.add(amount);

      logger.log(`[Prestige] Boss ashes added: +${amount}, Total: ${formatNumber(martyrAshes.value)}`);
    }

    /**
     * Purchase a prestige upgrade
     */
    function purchaseUpgrade(upgradeId: string): boolean {
      const upgrade = upgrades.find(u => u.id === upgradeId);
      if (!upgrade) return false;

      const currentLevel = purchasedUpgrades.value[upgradeId] || 0;
      if (currentLevel >= upgrade.maxLevel) return false;

      const cost = getUpgradeCost.value(upgradeId);
      if (martyrAshes.value.lt(cost)) return false;

      // Spend ashes
      martyrAshes.value = martyrAshes.value.sub(cost);

      // Increase level
      purchasedUpgrades.value[upgradeId] = currentLevel + 1;

      narrativeStore.addLog({
        message: `✨ Ulepszono "${upgrade.name}" do poziomu ${currentLevel + 1}!`,
        type: 'info',
      });

      logger.log(`[Prestige] Purchased ${upgradeId} level ${currentLevel + 1}`);

      return true;
    }

    /**
     * Reset all game stores (called during prestige)
     */
    function resetAllStores() {
      const bonuses = prestigeBonuses.value;

      // Reset resources with starting faith from prestige
      resourceStore.resetForPrestige([], bn(bonuses.startingFaith));

      // Apply production multipliers
      resourceStore.globalProductionMultiplier = bonuses.productionMultiplier;
      resourceStore.clickMultiplier = bonuses.clickMultiplier;

      // Reset entities and apply building cost discount
      entityStore.resetEntities();
      entityStore.setBuildingCostMultiplier(1 - bonuses.buildingCostReduction);

      // Reset combat
      combatStore.resetCombat();

      // Reset events and clear Sacred Vision buff
      const eventStore = useEventStore();
      eventStore.clearSacredVisionBuff();
      eventStore.resetForPrestige();

      // Clear narrative except for prestige message
      narrativeStore.clearLogs();
      narrativeStore.addLog({
        message: '🌅 Nowy cykl rozpoczęty. Popioły męczenników wzmacniają twoją wiarę...',
        type: 'info',
      });

      // Reset game loop timers
      const gameLoopStore = useGameLoopStore();
      gameLoopStore.totalPlayTime = 0;
    }

    /**
     * Initialize prestige bonuses on game load
     * Call this when the game starts to apply any existing prestige bonuses
     */
    function applyPrestigeBonuses() {
      const bonuses = prestigeBonuses.value;

      resourceStore.globalProductionMultiplier = bonuses.productionMultiplier;
      resourceStore.clickMultiplier = bonuses.clickMultiplier;
      entityStore.setBuildingCostMultiplier(1 - bonuses.buildingCostReduction);

      logger.log('[Prestige] Applied prestige bonuses:', bonuses);
    }

    /**
     * Get upgrade by ID
     */
    function getUpgrade(upgradeId: string): PrestigeUpgradeDefinition | undefined {
      return upgrades.find(u => u.id === upgradeId);
    }

    /**
     * DEV: Add ashes
     */
    function devAddAshes(amount: number) {
      martyrAshes.value = martyrAshes.value.add(bn(amount));
    }

    /**
     * DEV: Reset all prestige progress
     */
    function devResetPrestige() {
      martyrAshes.value = bn(0);
      purchasedUpgrades.value = {};
      stats.value = {
        totalPrestigeCount: 0,
        totalAshesEarned: bn(0),
        highestWave: 0,
        highestFaith: bn(0),
        fastestPrestige: Infinity,
      };
    }

    return {
      // State
      martyrAshes,
      purchasedUpgrades,
      stats,
      cycleStartTime,
      relicPrestigeBonus,

      // Data
      upgrades,

      // Computed
      potentialAshes,
      canPrestige,
      getUpgradeLevel,
      getUpgradeCost,
      canAffordUpgrade,
      isUpgradeMaxed,
      formattedAshes,
      formattedPotentialAshes,
      prestigeBonuses,

      // Actions
      performPrestige,
      purchaseUpgrade,
      applyPrestigeBonuses,
      getUpgrade,
      addAshesFromBoss,

      // Dev
      devAddAshes,
      devResetPrestige,
    };
  },
  {
    persist: {
      key: 'solmar-prestige',
      storage: typeof window !== 'undefined' ? localStorage : undefined,
      pick: [
        'martyrAshes',
        'purchasedUpgrades',
        'stats',
        'cycleStartTime',
      ],
      serializer: {
        serialize: (state) => {
          return JSON.stringify(state, (key, value) => {
            if (value && typeof value === 'object' && typeof value.toNumber === 'function' && typeof value.add === 'function') {
              return { __decimal: value.toString() };
            }
            return value;
          });
        },
        deserialize: (str) => {
          const parsed = JSON.parse(str);
          function convertDecimals(obj: unknown, key?: string): unknown {
            if (obj === null || obj === undefined) return obj;
            if (typeof obj === 'object' && '__decimal' in (obj as Record<string, unknown>)) {
              return bn((obj as { __decimal: string }).__decimal);
            }
            const decimalFields = ['martyrAshes', 'totalAshesEarned', 'highestFaith'];
            if ((typeof obj === 'string' || typeof obj === 'number') && key && decimalFields.includes(key)) {
              return bn(obj);
            }
            if (typeof obj !== 'object') return obj;
            if (Array.isArray(obj)) {
              return obj.map((v, i) => convertDecimals(v, String(i)));
            }
            const result: Record<string, unknown> = {};
            for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
              result[k] = convertDecimals(v, k);
            }
            return result;
          }
          return convertDecimals(parsed) as typeof parsed;
        },
      },
    },
  }
);

