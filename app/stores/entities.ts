/**
 * Entity Store
 * Manages buildings and units (purchase, upgrades, production)
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import Decimal from 'break_infinity.js';
import { bn, calculateCost, formatNumber } from '~/shared/lib/big-number';
import { useResourceStore } from './resources';
import type { Entity, EntityId, ResourceId } from '~/shared/types/game.types';

export const useEntityStore = defineStore(
  'entities',
  () => {
    // ============================================
    // State - Entities
    // ============================================
    const entities = ref<Record<EntityId, Entity>>({
      // ---- Solmar Entities ----
      chapel: {
        id: 'chapel',
        name: 'Kapliczka',
        description:
          'Mała przydrożna kaplica. Wierni modlą się tu za zbawienie, generując stały przypływ Wiary.',
        icon: 'mdi-church',
        count: 0,
        baseCost: {
          faith: bn(10),
          biomass: bn(0),
          souls: bn(0),
          ducats: bn(0),
          rage: bn(0),
        },
        costMultiplier: 1.15, // 15% increase per purchase
        production: {
          faith: bn(0.5), // 0.5 Faith per second per chapel
        },
        consumption: {},
        unlocked: true,
      },
      tithe_collector: {
        id: 'tithe_collector',
        name: 'Poborca Dziesięcin',
        description:
          'Pobożny urzędnik zbierający daniny na chwałę Solmara. Konwertuje Wiarę na złote Dukaty.',
        icon: 'mdi-cash-register',
        count: 0,
        baseCost: {
          faith: bn(50),
          biomass: bn(0),
          souls: bn(0),
          ducats: bn(0),
          rage: bn(0),
        },
        costMultiplier: 1.2,
        production: {
          ducats: bn(0.2), // 0.2 Ducats per second
        },
        consumption: {
          faith: bn(0.5), // Consumes 0.5 Faith per second
        },
        unlocked: false,
        unlockCondition: {
          type: 'entity',
          targetId: 'chapel',
          threshold: 5, // Unlock after 5 chapels
        },
      },
      flagellant: {
        id: 'flagellant',
        name: 'Pielgrzym Biczownik',
        description:
          'Fanatyk zadający sobie ból w imię Solmara. Generuje więcej Wiary, ale ma ograniczony czas życia.',
        icon: 'mdi-account-injury',
        count: 0,
        baseCost: {
          faith: bn(100),
          biomass: bn(0),
          souls: bn(0),
          ducats: bn(0),
          rage: bn(0),
        },
        costMultiplier: 1.18,
        production: {
          faith: bn(3), // 3 Faith per second
        },
        consumption: {},
        unlocked: false,
        unlockCondition: {
          type: 'resource',
          targetId: 'faith',
          threshold: 50,
        },
      },
      altar_tank: {
        id: 'altar_tank',
        name: 'Czołg-Ołtarz',
        description:
          'Mobilna świątynia wojenna. Potężna produkcja Wiary i morale, ale wymaga Dukatów na utrzymanie.',
        icon: 'mdi-tank',
        count: 0,
        baseCost: {
          faith: bn(10000),
          biomass: bn(0),
          souls: bn(0),
          ducats: bn(500),
          rage: bn(0),
        },
        costMultiplier: 1.25,
        production: {
          faith: bn(100),
        },
        consumption: {
          ducats: bn(1), // 1 Ducat per second upkeep
        },
        unlocked: false,
        unlockCondition: {
          type: 'entity',
          targetId: 'flagellant',
          threshold: 10,
        },
      },

      // ---- Defense Entities ----
      walls: {
        id: 'walls',
        name: 'Mury Obronne',
        description:
          'Solidne kamienne mury. Zmniejszają obrażenia od ataków (+2% obrony, -1% wzrostu zagrożenia).',
        icon: 'mdi-wall',
        count: 0,
        baseCost: {
          faith: bn(30),
          biomass: bn(0),
          souls: bn(0),
          ducats: bn(10),
          rage: bn(0),
        },
        costMultiplier: 1.3,
        production: {},
        consumption: {},
        unlocked: false,
        unlockCondition: {
          type: 'resource',
          targetId: 'faith',
          threshold: 100,
        },
      },
      guard_tower: {
        id: 'guard_tower',
        name: 'Wieża Strażnicza',
        description:
          'Wieża z łucznikami. Znacząco zwiększa obronę (+5%), opóźnia fale (+2s) i spowalnia wzrost zagrożenia (-2%).',
        icon: 'mdi-tower-fire',
        count: 0,
        baseCost: {
          faith: bn(100),
          biomass: bn(0),
          souls: bn(0),
          ducats: bn(50),
          rage: bn(0),
        },
        costMultiplier: 1.4,
        production: {},
        consumption: {},
        unlocked: false,
        unlockCondition: {
          type: 'entity',
          targetId: 'walls',
          threshold: 3,
        },
      },
      chaplain: {
        id: 'chaplain',
        name: 'Kapelan',
        description:
          'Duchowny na linii frontu. Regeneruje morale (+0.5/s), zapewnia minimalną obronę (+1%).',
        icon: 'mdi-cross',
        count: 0,
        baseCost: {
          faith: bn(75),
          biomass: bn(0),
          souls: bn(0),
          ducats: bn(0),
          rage: bn(0),
        },
        costMultiplier: 1.25,
        production: {},
        consumption: {
          faith: bn(0.2), // Mały koszt utrzymania
        },
        unlocked: false,
        unlockCondition: {
          type: 'entity',
          targetId: 'chapel',
          threshold: 3,
        },
      },
      monastery: {
        id: 'monastery',
        name: 'Klasztor',
        description:
          'Miejsce medytacji i uzdrowienia. Silna regeneracja morale (+1/s), produkuje Wiarę.',
        icon: 'mdi-home-group',
        count: 0,
        baseCost: {
          faith: bn(500),
          biomass: bn(0),
          souls: bn(0),
          ducats: bn(100),
          rage: bn(0),
        },
        costMultiplier: 1.5,
        production: {
          faith: bn(2), // 2 Faith per second
        },
        consumption: {},
        unlocked: false,
        unlockCondition: {
          type: 'entity',
          targetId: 'chaplain',
          threshold: 2,
        },
      },

      // ---- Cult Entities ----
      flesh_puppet: {
        id: 'flesh_puppet',
        name: 'Mięsna Kukła',
        description:
          'Prymitywny konstrukt z surowej tkanki. Podstawowa jednostka produkcyjna Kultu.',
        icon: 'mdi-human-handsdown',
        count: 0,
        baseCost: {
          faith: bn(0),
          biomass: bn(15),
          souls: bn(0),
          ducats: bn(0),
          rage: bn(0),
        },
        costMultiplier: 1.12,
        production: {
          biomass: bn(0.3),
        },
        consumption: {},
        unlocked: false,
      },
      infected_stormtrooper: {
        id: 'infected_stormtrooper',
        name: 'Zarażony Szturmowiec',
        description:
          'Powstaje przez połączenie dwóch Mięsnych Kukieł. Silniejszy, szybszy, głodniejszy.',
        icon: 'mdi-biohazard',
        count: 0,
        baseCost: {
          faith: bn(0),
          biomass: bn(100),
          souls: bn(0),
          ducats: bn(0),
          rage: bn(0),
        },
        costMultiplier: 1.2,
        production: {
          biomass: bn(2),
        },
        consumption: {},
        unlocked: false,
      },
    });

    // ============================================
    // Computed
    // ============================================
    const unlockedEntities = computed(() =>
      Object.values(entities.value).filter((e) => e.unlocked)
    );

    const solmarEntities = computed(() =>
      Object.values(entities.value).filter(
        (e) => e.unlocked && ['chapel', 'tithe_collector', 'flagellant', 'altar_tank', 'walls', 'guard_tower', 'chaplain', 'monastery'].includes(e.id)
      )
    );

    const cultEntities = computed(() =>
      Object.values(entities.value).filter(
        (e) => e.unlocked && ['flesh_puppet', 'infected_stormtrooper'].includes(e.id)
      )
    );

    // ============================================
    // Actions
    // ============================================

    /**
     * Get current cost to purchase an entity
     */
    function getCurrentCost(id: EntityId): Record<ResourceId, Decimal> {
      const entity = entities.value[id];
      if (!entity) {
        return {
          faith: bn(0),
          biomass: bn(0),
          souls: bn(0),
          ducats: bn(0),
          rage: bn(0),
        };
      }

      const costs: Record<ResourceId, Decimal> = {
        faith: bn(0),
        biomass: bn(0),
        souls: bn(0),
        ducats: bn(0),
        rage: bn(0),
      };

      for (const [resourceId, baseCost] of Object.entries(entity.baseCost)) {
        if (baseCost.gt(0)) {
          costs[resourceId as ResourceId] = calculateCost(
            baseCost,
            entity.costMultiplier,
            entity.count
          );
        }
      }

      return costs;
    }

    /**
     * Get formatted cost string
     */
    function getFormattedCost(id: EntityId): string {
      const costs = getCurrentCost(id);
      const parts: string[] = [];

      for (const [resourceId, amount] of Object.entries(costs)) {
        if (amount.gt(0)) {
          const resourceStore = useResourceStore();
          const resource = resourceStore.resources[resourceId as ResourceId];
          parts.push(`${formatNumber(amount)} ${resource?.name || resourceId}`);
        }
      }

      return parts.join(', ');
    }

    /**
     * Check if player can afford entity
     */
    function canAfford(id: EntityId): boolean {
      const resourceStore = useResourceStore();
      const costs = getCurrentCost(id);

      for (const [resourceId, amount] of Object.entries(costs)) {
        if (amount.gt(0)) {
          const resource = resourceStore.resources[resourceId as ResourceId];
          if (!resource || resource.amount.lt(amount)) {
            return false;
          }
        }
      }

      return true;
    }

    /**
     * Purchase an entity
     */
    function purchase(id: EntityId, count: number = 1): boolean {
      const entity = entities.value[id];
      if (!entity || !entity.unlocked) return false;

      const resourceStore = useResourceStore();

      // Purchase one at a time (for accurate cost calculation)
      for (let i = 0; i < count; i++) {
        if (!canAfford(id)) return i > 0; // Return true if we bought at least one

        const costs = getCurrentCost(id);

        // Spend resources
        for (const [resourceId, amount] of Object.entries(costs)) {
          if (amount.gt(0)) {
            resourceStore.spendResource(resourceId as ResourceId, amount);
          }
        }

        // Add entity
        entity.count++;

        // Update production rates
        updateProductionRates();
      }

      return true;
    }

    /**
     * Update all production rates based on entity counts
     */
    function updateProductionRates() {
      const resourceStore = useResourceStore();

      // Reset production rates
      for (const resourceId of Object.keys(resourceStore.resources) as ResourceId[]) {
        resourceStore.setProductionRate(resourceId, 0);
      }

      // Add production from each entity
      for (const entity of Object.values(entities.value)) {
        if (!entity.unlocked || entity.count === 0) continue;

        // Add production
        for (const [resourceId, baseProduction] of Object.entries(entity.production)) {
          if (baseProduction && baseProduction.gt(0)) {
            const totalProduction = baseProduction.mul(entity.count);
            resourceStore.addProductionRate(resourceId as ResourceId, totalProduction);
          }
        }

        // Subtract consumption
        for (const [resourceId, baseConsumption] of Object.entries(entity.consumption)) {
          if (baseConsumption && baseConsumption.gt(0)) {
            const totalConsumption = baseConsumption.mul(entity.count).neg();
            resourceStore.addProductionRate(resourceId as ResourceId, totalConsumption);
          }
        }
      }
    }

    /**
     * Check and unlock entities based on conditions
     */
    function checkUnlocks() {
      const resourceStore = useResourceStore();

      for (const entity of Object.values(entities.value)) {
        if (entity.unlocked) continue;
        if (!entity.unlockCondition) continue;

        const condition = entity.unlockCondition;

        switch (condition.type) {
          case 'resource': {
            const resource = resourceStore.resources[condition.targetId as ResourceId];
            if (resource && resource.amount.gte(condition.threshold)) {
              entity.unlocked = true;
              console.log(`[Entities] Unlocked: ${entity.name}`);
            }
            break;
          }
          case 'entity': {
            const targetEntity = entities.value[condition.targetId as EntityId];
            if (targetEntity && targetEntity.count >= condition.threshold) {
              entity.unlocked = true;
              console.log(`[Entities] Unlocked: ${entity.name}`);

              // Auto-unlock related resources
              if (entity.id === 'tithe_collector') {
                resourceStore.unlockResource('ducats');
                console.log(`[Resources] Unlocked: Dukaty`);
              }
            }
            break;
          }
        }
      }
    }

    /**
     * DEV: Set entity count directly (for testing)
     */
    function devSetCount(id: EntityId, count: number) {
      const entity = entities.value[id];
      if (entity) {
        entity.count = count;
        updateProductionRates();
      }
    }

    /**
     * DEV: Unlock all entities
     */
    function devUnlockAll() {
      const resourceStore = useResourceStore();
      for (const entity of Object.values(entities.value)) {
        entity.unlocked = true;
      }
      // Also unlock all resources
      resourceStore.unlockResource('ducats');
      resourceStore.unlockResource('biomass');
      resourceStore.unlockResource('souls');
      resourceStore.unlockResource('rage');
    }

    /**
     * Unlock an entity manually
     */
    function unlockEntity(id: EntityId) {
      const entity = entities.value[id];
      if (entity) {
        entity.unlocked = true;
      }
    }

    /**
     * Reset for prestige
     */
    function resetForPrestige() {
      for (const entity of Object.values(entities.value)) {
        entity.count = 0;
        // Keep unlocks based on prestige upgrades (to be implemented)
        if (!['chapel'].includes(entity.id)) {
          entity.unlocked = false;
        }
      }
      updateProductionRates();
    }

    /**
     * Get entity production display
     */
    function getProductionDisplay(id: EntityId): string {
      const entity = entities.value[id];
      if (!entity) return '';

      const parts: string[] = [];

      for (const [resourceId, amount] of Object.entries(entity.production)) {
        if (amount && amount.gt(0)) {
          const resourceStore = useResourceStore();
          const resource = resourceStore.resources[resourceId as ResourceId];
          parts.push(`+${formatNumber(amount)}/s ${resource?.name || resourceId}`);
        }
      }

      return parts.join(', ');
    }

    /**
     * Get entity consumption display
     */
    function getConsumptionDisplay(id: EntityId): string {
      const entity = entities.value[id];
      if (!entity) return '';

      const parts: string[] = [];

      for (const [resourceId, amount] of Object.entries(entity.consumption)) {
        if (amount && amount.gt(0)) {
          const resourceStore = useResourceStore();
          const resource = resourceStore.resources[resourceId as ResourceId];
          parts.push(`-${formatNumber(amount)}/s ${resource?.name || resourceId}`);
        }
      }

      return parts.join(', ');
    }

    return {
      // State
      entities,

      // Computed
      unlockedEntities,
      solmarEntities,
      cultEntities,

      // Actions
      getCurrentCost,
      getFormattedCost,
      canAfford,
      purchase,
      updateProductionRates,
      checkUnlocks,
      unlockEntity,
      resetForPrestige,
      getProductionDisplay,
      getConsumptionDisplay,

      // Dev/Cheat functions
      devSetCount,
      devUnlockAll,
    };
  },
  {
    persist: {
      key: 'solmar-entities',
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

            // Handle plain string/number for known Decimal fields (entity costs)
            const decimalFields = ['faith', 'biomass', 'souls', 'ducats', 'rage'];
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

