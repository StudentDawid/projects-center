/**
 * Resource Store
 * Manages all game resources (Faith, Biomass, Souls, Ducats, Rage)
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import Decimal from 'break_infinity.js';
import { bn, formatNumber, formatWithCommas } from '~/shared/lib/big-number';
import type { Resource, ResourceId } from '~/shared/types/game.types';
import { useCombatStore } from './combat';

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

    // ============================================
    // Actions
    // ============================================

    /**
     * Process one game tick - update all resources
     */
    function tick(deltaTime: number) {
      // Get morale multiplier from combat store
      const combatStore = useCombatStore();
      const moraleMultiplier = combatStore.moraleProductionMultiplier;

      for (const resource of Object.values(resources.value)) {
        if (!resource.unlocked) continue;

        // Calculate production for this tick (including morale bonus)
        const production = resource.perSecond
          .mul(deltaTime)
          .mul(globalProductionMultiplier.value)
          .mul(moraleMultiplier);

        // Add production
        resource.amount = resource.amount.add(production);

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
     */
    function pray() {
      const faithGain = baseClickValue.value.mul(clickMultiplier.value);
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
    function resetForPrestige(keepUnlocks: ResourceId[] = []) {
      for (const resource of Object.values(resources.value)) {
        resource.amount = bn(0);
        resource.perSecond = bn(0);

        if (!keepUnlocks.includes(resource.id)) {
          resource.unlocked = resource.id === 'faith'; // Faith always unlocked
        }
      }
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

      // Computed
      unlockedResources,
      faithDisplay,
      faithPerSecondDisplay,

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
            const decimalFields = ['amount', 'perSecond', 'maxAmount', 'baseClickValue'];
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

