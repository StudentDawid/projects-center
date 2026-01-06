/**
 * Resource Store
 * Manages all game resources (Faith, Biomass, Souls, Ducats, Rage)
 *
 * OPTIMIZATION: Store references cached to avoid repeated useStore() in tick()
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import Decimal from 'break_infinity.js';
import { bn, formatNumber, formatWithCommas } from '~/shared/lib/big-number';
import type { Resource, ResourceId } from '~/shared/types/game.types';
import { useCombatStore } from './combat';
import { useEntityStore } from './entities';
import { useEventStore } from './events';

// ============================================
// Store Cache - Avoid repeated useStore() calls in tick()
// ============================================
let _combatStore: ReturnType<typeof useCombatStore> | null = null;
let _entityStore: ReturnType<typeof useEntityStore> | null = null;
let _eventStore: ReturnType<typeof useEventStore> | null = null;

function getCombatStore() {
  if (!_combatStore) _combatStore = useCombatStore();
  return _combatStore;
}

function getEntityStore() {
  if (!_entityStore) _entityStore = useEntityStore();
  return _entityStore;
}

function getEventStore() {
  if (!_eventStore) _eventStore = useEventStore();
  return _eventStore;
}

export const useResourceStore = defineStore(
  'resources',
  () => {
    // ============================================
    // State - Resources
    // ============================================
    const resources = ref<Record<ResourceId, Resource>>({
      faith: {
        id: 'faith',
        name: 'Wiara',
        description: 'Duchowa energia wiernych Solmara. Generowana przez modlitwę i samobiczowanie.',
        icon: 'mdi-cross',
        amount: bn(0),
        maxAmount: null,
        perSecond: bn(0),
        unlocked: true,
      },
      biomass: {
        id: 'biomass',
        name: 'Biomasa',
        description: 'Surowa materia organiczna. Podstawowy budulec Kultystów Mięsa.',
        icon: 'mdi-bacteria',
        amount: bn(0),
        maxAmount: null,
        perSecond: bn(0),
        unlocked: false,
      },
      souls: {
        id: 'souls',
        name: 'Dusze',
        description: 'Esencja poległych. Waluta paktów z siłami ciemności.',
        icon: 'mdi-ghost',
        amount: bn(0),
        maxAmount: null,
        perSecond: bn(0),
        unlocked: false,
      },
      ducats: {
        id: 'ducats',
        name: 'Dukaty',
        description: 'Złote monety Teokracji. Niezbędne do utrzymania machiny wojennej.',
        icon: 'mdi-currency-usd',
        amount: bn(0),
        maxAmount: null,
        perSecond: bn(0),
        unlocked: false,
      },
      rage: {
        id: 'rage',
        name: 'Gniew',
        description: 'Rośnie gdy jednostki giną. Pozwala na Szał - potężny boost produkcji.',
        icon: 'mdi-fire',
        amount: bn(0),
        maxAmount: bn(100),
        perSecond: bn(0),
        unlocked: false,
      },
    });

    // Global multipliers (from prestige, upgrades, etc.)
    const globalProductionMultiplier = ref(1);
    const clickMultiplier = ref(1);
    const baseClickValue = ref(bn(1)); // Base faith per click

    // Prestige tracking - total faith earned this cycle
    const totalFaithEarned = ref(bn(0));

    // Tier 2 building bonuses
    const libraryProductionBonus = ref(0); // +5% per Library (10% at Lv5)

    // Relic bonuses
    const relicProductionMultipliers = ref<Partial<Record<ResourceId, number>>>({});
    const relicAllProductionMultiplier = ref(1);
    const relicClickMultiplier = ref(1);
    const relicDoubleClickChance = ref(0);

    // ============================================
    // Computed
    // ============================================
    const unlockedResources = computed(() =>
      Object.values(resources.value).filter((r) => r.unlocked)
    );

    const faithDisplay = computed(() =>
      formatWithCommas(resources.value.faith.amount)
    );

    const faithPerSecondDisplay = computed(() =>
      formatNumber(resources.value.faith.perSecond)
    );

    /**
     * Total base click value from buildings
     * Includes: prayer_beads (+0.5 each), blessed_altar (+1 each)
     */
    const buildingClickBonus = computed(() => {
      const entityStore = getEntityStore();
      let bonus = bn(0);

      // Różaniec: +0.5 per building (Lv5: +5)
      if (entityStore.entities.prayer_beads?.unlocked) {
        const count = entityStore.entities.prayer_beads.count;
        const levelBonus = entityStore.getLevelBonus('prayer_beads');
        const baseBonus = 0.5;
        bonus = bonus.add(bn(count * baseBonus * levelBonus));
        // Max level effect
        if (entityStore.entities.prayer_beads.level >= 5) {
          bonus = bonus.add(bn(5));
        }
      }

      // Błogosławiony Ołtarz: +1 per building (Lv5: +10)
      if (entityStore.entities.blessed_altar?.unlocked) {
        const count = entityStore.entities.blessed_altar.count;
        const levelBonus = entityStore.getLevelBonus('blessed_altar');
        const baseBonus = 1;
        bonus = bonus.add(bn(count * baseBonus * levelBonus));
        // Max level effect
        if (entityStore.entities.blessed_altar.level >= 5) {
          bonus = bonus.add(bn(10));
        }
      }

      return bonus;
    });

    /**
     * Total click multiplier from buildings
     * Includes: holy_relic (+10% each), choir (+25% each)
     */
    const buildingClickMultiplier = computed(() => {
      const entityStore = getEntityStore();
      let multiplier = 1;

      // Relikwia: +10% per building (Lv5: +50%)
      if (entityStore.entities.holy_relic?.unlocked) {
        const count = entityStore.entities.holy_relic.count;
        const levelBonus = entityStore.getLevelBonus('holy_relic');
        multiplier += count * 0.1 * levelBonus;
        // Max level effect
        if (entityStore.entities.holy_relic.level >= 5) {
          multiplier += 0.5;
        }
      }

      // Chór: +25% per building (Lv5: +100%)
      if (entityStore.entities.choir?.unlocked) {
        const count = entityStore.entities.choir.count;
        const levelBonus = entityStore.getLevelBonus('choir');
        multiplier += count * 0.25 * levelBonus;
        // Max level effect
        if (entityStore.entities.choir.level >= 5) {
          multiplier += 1;
        }
      }

      return multiplier;
    });

    /**
     * Total effective click value (for display)
     */
    const totalClickValue = computed(() => {
      const eventStore = getEventStore();
      return baseClickValue.value
        .add(buildingClickBonus.value)
        .mul(clickMultiplier.value)
        .mul(buildingClickMultiplier.value)
        .mul(eventStore.clickMultiplier)
        .mul(relicClickMultiplier.value);
    });

    /**
     * Formatted click value for UI
     */
    const formattedClickValue = computed(() => formatNumber(totalClickValue.value));

    // ============================================
    // Actions
    // ============================================

    /**
     * Process one game tick - update all resources
     * OPTIMIZATION: Uses cached store references
     */
    function tick(deltaTime: number) {
      // Get morale multiplier from combat store (cached)
      const combatStore = getCombatStore();
      const moraleMultiplier = combatStore.moraleProductionMultiplier;

      // Import entity store for max level effects (cached)
      const entityStore = getEntityStore();

      // Get event multipliers (cached)
      const eventStore = getEventStore();
      const eventProductionMultiplier = eventStore.productionMultiplier;

      // Calculate Library bonus
      let libraryBonus = 1;
      if (entityStore.entities.library?.unlocked && entityStore.entities.library.count > 0) {
        const bonusPerLibrary = entityStore.entities.library.level >= 5 ? 0.1 : 0.05;
        libraryBonus = 1 + (entityStore.entities.library.count * bonusPerLibrary);
        libraryProductionBonus.value = (libraryBonus - 1) * 100; // For UI display
      } else {
        libraryProductionBonus.value = 0;
      }

      for (const resource of Object.values(resources.value)) {
        if (!resource.unlocked) continue;

        // Calculate production for this tick (including morale bonus, event effects, Library bonus, and relic bonuses)
        let production = resource.perSecond
          .mul(deltaTime)
          .mul(globalProductionMultiplier.value)
          .mul(moraleMultiplier)
          .mul(eventProductionMultiplier)
          .mul(libraryBonus)
          .mul(relicAllProductionMultiplier.value);

        // Apply relic production multiplier for specific resource
        const relicResourceMultiplier = relicProductionMultipliers.value[resource.id] || 0;
        if (relicResourceMultiplier > 0) {
          production = production.mul(1 + relicResourceMultiplier / 100);
        }

        // MAX LEVEL EFFECT: Kapliczka Lv5 - Automatyczna modlitwa +1/s
        if (resource.id === 'faith' && entityStore.entities.chapel?.level >= 5) {
          const autoFaith = bn(1).mul(deltaTime).mul(moraleMultiplier);
          production = production.add(autoFaith);
        }

        // Add production
        resource.amount = resource.amount.add(production);

        // Track total faith earned for prestige calculation
        if (resource.id === 'faith' && production.gt(0)) {
          totalFaithEarned.value = totalFaithEarned.value.add(production);
        }

        // Cap at max if defined
        if (resource.maxAmount !== null && resource.amount.gt(resource.maxAmount)) {
          resource.amount = resource.maxAmount;
        }
      }
    }

    /**
     * Add to a resource (from clicks, events, etc.)
     */
    function addResource(id: ResourceId, amount: Decimal | number) {
      const resource = resources.value[id];
      if (!resource || !resource.unlocked) return;

      const toAdd = amount instanceof Decimal ? amount : bn(amount);
      resource.amount = resource.amount.add(toAdd);

      // Track total faith earned for prestige calculation
      if (id === 'faith') {
        totalFaithEarned.value = totalFaithEarned.value.add(toAdd);
      }

      // Cap at max if defined
      if (resource.maxAmount !== null && resource.amount.gt(resource.maxAmount)) {
        resource.amount = resource.maxAmount;
      }
    }

    /**
     * Spend a resource (returns true if successful)
     */
    function spendResource(id: ResourceId, amount: Decimal | number): boolean {
      const resource = resources.value[id];
      if (!resource) return false;

      const toSpend = amount instanceof Decimal ? amount : bn(amount);

      if (resource.amount.lt(toSpend)) {
        return false;
      }

      resource.amount = resource.amount.sub(toSpend);
      return true;
    }

    /**
     * Check if player can afford a cost
     */
    function canAfford(costs: Partial<Record<ResourceId, Decimal | number>>): boolean {
      for (const [id, amount] of Object.entries(costs)) {
        const resource = resources.value[id as ResourceId];
        if (!resource) return false;

        const cost = amount instanceof Decimal ? amount : bn(amount as number);
        if (resource.amount.lt(cost)) {
          return false;
        }
      }
      return true;
    }

    /**
     * Handle prayer click - generates Faith
     * Includes bonuses from: prestige, events, relics, and click-boosting buildings
     */
    function pray() {
      const eventStore = getEventStore();

      // Calculate total click value with all bonuses
      let faithGain = baseClickValue.value
        .add(buildingClickBonus.value) // Różaniec, Ołtarz
        .mul(clickMultiplier.value) // Prestige bonus
        .mul(buildingClickMultiplier.value) // Relikwia, Chór
        .mul(eventStore.clickMultiplier) // Event bonus
        .mul(relicClickMultiplier.value); // Relic bonus

      // Relic double click chance
      if (relicDoubleClickChance.value > 0 && Math.random() < relicDoubleClickChance.value) {
        faithGain = faithGain.mul(2);
      }

      addResource('faith', faithGain);
      return faithGain;
    }

    /**
     * Update production rate for a resource
     */
    function setProductionRate(id: ResourceId, rate: Decimal | number) {
      const resource = resources.value[id];
      if (!resource) return;

      resource.perSecond = rate instanceof Decimal ? rate : bn(rate);
    }

    /**
     * Add to production rate
     */
    function addProductionRate(id: ResourceId, rate: Decimal | number) {
      const resource = resources.value[id];
      if (!resource) return;

      const toAdd = rate instanceof Decimal ? rate : bn(rate);
      resource.perSecond = resource.perSecond.add(toAdd);
    }

    /**
     * Unlock a resource
     */
    function unlockResource(id: ResourceId) {
      const resource = resources.value[id];
      if (resource) {
        resource.unlocked = true;
      }
    }

    /**
     * Reset for prestige (keep unlocks based on prestige upgrades)
     */
    function resetForPrestige(keepUnlocks: ResourceId[] = [], startingFaith: Decimal = bn(0)) {
      for (const resource of Object.values(resources.value)) {
        resource.amount = resource.id === 'faith' ? startingFaith : bn(0);
        resource.perSecond = bn(0);

        if (!keepUnlocks.includes(resource.id)) {
          resource.unlocked = resource.id === 'faith'; // Faith always unlocked
        }
      }
      // Reset total faith earned for new cycle
      totalFaithEarned.value = bn(0);
    }

    /**
     * Get formatted display value
     */
    function getFormattedAmount(id: ResourceId): string {
      const resource = resources.value[id];
      if (!resource) return '0';
      return formatWithCommas(resource.amount);
    }

    /**
     * Get formatted per second value
     */
    function getFormattedPerSecond(id: ResourceId): string {
      const resource = resources.value[id];
      if (!resource) return '0';
      return formatNumber(resource.perSecond);
    }

    /**
     * DEV: Add large amount of a resource (for testing)
     */
    function devAddResource(id: ResourceId, amount: number) {
      const resource = resources.value[id];
      if (resource) {
        resource.unlocked = true;
        resource.amount = resource.amount.add(bn(amount));
      }
    }

    /**
     * DEV: Set global production multiplier
     */
    function devSetSpeedMultiplier(multiplier: number) {
      globalProductionMultiplier.value = multiplier;
    }

    /**
     * DEV: Unlock all resources
     */
    function devUnlockAllResources() {
      for (const resource of Object.values(resources.value)) {
        resource.unlocked = true;
      }
    }

    /**
     * DEV: Reset all resources to zero
     */
    function devResetAll() {
      for (const resource of Object.values(resources.value)) {
        resource.amount = bn(0);
        resource.perSecond = bn(0);
        if (resource.id !== 'faith') {
          resource.unlocked = false;
        }
      }
      globalProductionMultiplier.value = 1;
      clickMultiplier.value = 1;
      baseClickValue.value = bn(1);
    }

    return {
      // State
      resources,
      globalProductionMultiplier,
      clickMultiplier,
      baseClickValue,
      totalFaithEarned,
      libraryProductionBonus,
      relicProductionMultipliers,
      relicAllProductionMultiplier,
      relicClickMultiplier,
      relicDoubleClickChance,

      // Computed
      unlockedResources,
      faithDisplay,
      faithPerSecondDisplay,
      buildingClickBonus,
      buildingClickMultiplier,
      totalClickValue,
      formattedClickValue,

      // Actions
      tick,
      addResource,
      spendResource,
      canAfford,
      pray,
      setProductionRate,
      addProductionRate,
      unlockResource,
      resetForPrestige,
      getFormattedAmount,
      getFormattedPerSecond,

      // Dev/Cheat functions
      devAddResource,
      devSetSpeedMultiplier,
      devUnlockAllResources,
      devResetAll,
    };
  },
  {
    persist: {
      key: 'solmar-resources',
      storage: typeof window !== 'undefined' ? localStorage : undefined,
      serializer: {
        serialize: (state) => {
          return JSON.stringify(state, (key, value) => {
            // Convert Decimal to serializable format - check for Decimal by its methods
            if (value && typeof value === 'object' && typeof value.toNumber === 'function' && typeof value.add === 'function') {
              return { __decimal: value.toString() };
            }
            return value;
          });
        },
        deserialize: (str) => {
          const parsed = JSON.parse(str);
          // Deep convert stored values back to Decimal
          // Handle both __decimal format and plain string/number values
          function convertDecimals(obj: unknown, key?: string): unknown {
            if (obj === null || obj === undefined) return obj;

            // Handle __decimal format
            if (typeof obj === 'object' && '__decimal' in (obj as Record<string, unknown>)) {
              return bn((obj as { __decimal: string }).__decimal);
            }

            // Handle plain string/number for known Decimal fields
            const decimalFields = ['amount', 'perSecond', 'maxAmount', 'baseClickValue', 'totalFaithEarned'];
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

