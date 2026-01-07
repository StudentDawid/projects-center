/**
 * Entity Store
 * Manages buildings and units (purchase, upgrades, production)
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import Decimal from 'break_infinity.js';
import { bn, calculateCost, formatNumber } from '~/shared/lib/big-number';
import { useResourceStore } from './resources';
import type { Entity, EntityId, ResourceId, EntityPrerequisite, SpecialUnlockCondition } from '~/shared/types/game.types';
import { usePrestigeStore } from './prestige';
import { useCombatStore } from './combat';
import { useChallengeStore } from './challenges';
import { logger } from '~/shared/lib/logger';

export const useEntityStore = defineStore(
  'entities',
  () => {
    // ============================================
    // Constants
    // ============================================

    const MAX_BUILDING_LEVEL = 5;
    const UPGRADE_COST_MULTIPLIER = 5; // Each level costs 5x previous
    const PRODUCTION_BONUS_PER_LEVEL = 0.5; // +50% per level
    const CONSUMPTION_REDUCTION_PER_LEVEL = 0.1; // -10% per level

    // ============================================
    // State - Entities
    // ============================================

    // Cost multiplier from prestige (set externally to avoid circular deps)
    const buildingCostMultiplier = ref(1); // Lower = cheaper (e.g., 0.9 = 10% discount)

    // Auto-buy settings per entity
    const autoBuyEnabled = ref<Record<string, boolean>>({});

    const entities = ref<Record<EntityId, Entity>>({
      // ---- Solmar Entities ----
      chapel: {
        id: 'chapel',
        name: 'Kapliczka',
        description:
          'Mała przydrożna kaplica. Wierni modlą się tu za zbawienie, generując stały przypływ Wiary.',
        icon: 'mdi-church',
        count: 0,
        level: 1,
        tier: 1,
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
        maxLevelEffect: 'Automatyczna modlitwa: +1 Wiary/s pasywnie',
      },
      tithe_collector: {
        id: 'tithe_collector',
        name: 'Poborca Dziesięcin',
        description:
          'Pobożny urzędnik zbierający daniny na chwałę Solmara. Konwertuje Wiarę na złote Dukaty.',
        icon: 'mdi-cash-register',
        count: 0,
        level: 1,
        tier: 1,
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
        maxLevelEffect: 'Złote Żniwa: Nie konsumuje Wiary',
      },
      flagellant: {
        id: 'flagellant',
        name: 'Pielgrzym Biczownik',
        description:
          'Fanatyk zadający sobie ból w imię Solmara. Generuje więcej Wiary, ale ma ograniczony czas życia.',
        icon: 'mdi-account-injury',
        count: 0,
        level: 1,
        tier: 1,
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
        maxLevelEffect: 'Święta Ofiara: +100% produkcji podczas ataków',
      },
      altar_tank: {
        id: 'altar_tank',
        name: 'Czołg-Ołtarz',
        description:
          'Mobilna świątynia wojenna. Potężna produkcja Wiary i morale, ale wymaga Dukatów na utrzymanie.',
        icon: 'mdi-tank',
        count: 0,
        level: 1,
        tier: 1,
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
        maxLevelEffect: 'Pancerna Świątynia: +50% obrony globalna',
      },

      // ---- Defense Entities ----
      walls: {
        id: 'walls',
        name: 'Mury Obronne',
        description:
          'Solidne kamienne mury. Zmniejszają obrażenia od ataków (+2% obrony, -1% wzrostu zagrożenia).',
        icon: 'mdi-wall',
        count: 0,
        level: 1,
        tier: 1,
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
        maxLevelEffect: 'Święte Mury: Immunitet na pierwszą falę po prestiżu',
      },
      guard_tower: {
        id: 'guard_tower',
        name: 'Wieża Strażnicza',
        description:
          'Wieża z łucznikami. Znacząco zwiększa obronę (+5%), opóźnia fale (+2s) i spowalnia wzrost zagrożenia (-2%).',
        icon: 'mdi-tower-fire',
        count: 0,
        level: 1,
        tier: 1,
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
        maxLevelEffect: 'Oczy Solmara: +30s ostrzegania o nadchodzącej fali',
      },
      chaplain: {
        id: 'chaplain',
        name: 'Kapelan',
        description:
          'Duchowny na linii frontu. Regeneruje morale (+0.5/s), zapewnia minimalną obronę (+1%).',
        icon: 'mdi-cross',
        count: 0,
        level: 1,
        tier: 1,
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
        maxLevelEffect: 'Święta Inspiracja: +2/s regeneracji morale globalna',
      },
      monastery: {
        id: 'monastery',
        name: 'Klasztor',
        description:
          'Miejsce medytacji i uzdrowienia. Silna regeneracja morale (+1/s), produkuje Wiarę.',
        icon: 'mdi-home-group',
        count: 0,
        level: 1,
        tier: 1,
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
        maxLevelEffect: 'Sanktuarium: Podwójna regeneracja morale',
      },

      // ---- Click Boosters ----
      prayer_beads: {
        id: 'prayer_beads',
        name: 'Różaniec Świętego',
        description:
          'Błogosławiony różaniec wzmacniający modlitwy. Każdy dodaje +0.5 Wiary za kliknięcie.',
        icon: 'mdi-egg-easter',
        count: 0,
        level: 1,
        tier: 1,
        baseCost: {
          faith: bn(25),
          biomass: bn(0),
          souls: bn(0),
          ducats: bn(0),
          rage: bn(0),
        },
        costMultiplier: 1.12,
        production: {},
        consumption: {},
        unlocked: false,
        unlockCondition: {
          type: 'resource',
          targetId: 'faith',
          threshold: 20,
        },
        specialEffect: '+0.5 Wiary za kliknięcie',
        maxLevelEffect: 'Różaniec Arcybiskupa: +5 Wiary za kliknięcie',
      },
      holy_relic: {
        id: 'holy_relic',
        name: 'Relikwia Męczennika',
        description:
          'Fragmenty kości świętych, wzmacniające moc modlitwy. +10% mocy kliknięcia za każdą.',
        icon: 'mdi-bone',
        count: 0,
        level: 1,
        tier: 1,
        baseCost: {
          faith: bn(100),
          biomass: bn(0),
          souls: bn(0),
          ducats: bn(25),
          rage: bn(0),
        },
        costMultiplier: 1.2,
        production: {},
        consumption: {},
        unlocked: false,
        unlockCondition: {
          type: 'entity',
          targetId: 'prayer_beads',
          threshold: 5,
        },
        specialEffect: '+10% mocy kliknięcia',
        maxLevelEffect: 'Relikwia Świętego: +50% mocy kliknięcia',
      },
      blessed_altar: {
        id: 'blessed_altar',
        name: 'Błogosławiony Ołtarz',
        description:
          'Święty ołtarz namaszczony olejami. Każdy dodaje +1 Wiary za kliknięcie.',
        icon: 'mdi-table-furniture',
        count: 0,
        level: 1,
        tier: 1,
        baseCost: {
          faith: bn(200),
          biomass: bn(0),
          souls: bn(0),
          ducats: bn(50),
          rage: bn(0),
        },
        costMultiplier: 1.25,
        production: {},
        consumption: {},
        unlocked: false,
        unlockCondition: {
          type: 'entity',
          targetId: 'holy_relic',
          threshold: 3,
        },
        specialEffect: '+1 Wiary za kliknięcie',
        maxLevelEffect: 'Ołtarz Wielkiego Inkwizytora: +10 Wiary za kliknięcie',
      },
      choir: {
        id: 'choir',
        name: 'Chór Świątynny',
        description:
          'Chór śpiewający hymny na chwałę Solmara. Każdy wzmacnia moc modlitw o 25%.',
        icon: 'mdi-account-group',
        count: 0,
        level: 1,
        tier: 2,
        baseCost: {
          faith: bn(1000),
          biomass: bn(0),
          souls: bn(0),
          ducats: bn(200),
          rage: bn(0),
        },
        costMultiplier: 1.35,
        production: {
          faith: bn(1), // Mała pasywna produkcja
        },
        consumption: {},
        unlocked: false,
        prerequisites: [{ entityId: 'blessed_altar', count: 3 }],
        specialEffect: '+25% mocy kliknięcia',
        maxLevelEffect: 'Chór Anielski: +100% mocy kliknięcia, automatyczna modlitwa co 5s',
      },

      // ---- Tier 2 Entities ----
      cathedral: {
        id: 'cathedral',
        name: 'Katedra',
        description:
          'Monumentalna świątynia Solmara. Potężna produkcja Wiary i bonus do wszystkich Kapliczek.',
        icon: 'mdi-bank',
        count: 0,
        level: 1,
        tier: 2,
        baseCost: {
          faith: bn(5000),
          biomass: bn(0),
          souls: bn(0),
          ducats: bn(500),
          rage: bn(0),
        },
        costMultiplier: 1.5,
        production: {
          faith: bn(25), // 25 Faith per second
        },
        consumption: {},
        unlocked: false,
        prerequisites: [{ entityId: 'chapel', count: 10 }],
        specialEffect: '+10% produkcji Wiary z każdej Kapliczki',
        maxLevelEffect: 'Święty Chór: +100% produkcji Wiary z Kapliczek',
      },
      arsenal: {
        id: 'arsenal',
        name: 'Arsenał',
        description:
          'Święta zbrojownia. Generuje Gniew podczas fal wrogów i odblokowuje umiejętność Szał.',
        icon: 'mdi-sword-cross',
        count: 0,
        level: 1,
        tier: 2,
        baseCost: {
          faith: bn(2000),
          biomass: bn(0),
          souls: bn(0),
          ducats: bn(1000),
          rage: bn(0),
        },
        costMultiplier: 1.6,
        production: {},
        consumption: {},
        unlocked: false,
        prerequisites: [{ entityId: 'guard_tower', count: 5 }],
        specialEffect: '+5 Gniewu po każdej fali wrogów',
        maxLevelEffect: 'Święty Szał: Podwójny Gniew z fal + aktywna umiejętność',
      },
      library: {
        id: 'library',
        name: 'Biblioteka Świętych Tekstów',
        description:
          'Repozytorium świętej wiedzy. Każda biblioteka zwiększa globalną produkcję.',
        icon: 'mdi-book-open-page-variant',
        count: 0,
        level: 1,
        tier: 2,
        baseCost: {
          faith: bn(10000),
          biomass: bn(0),
          souls: bn(0),
          ducats: bn(0),
          rage: bn(0),
        },
        costMultiplier: 2.0,
        production: {},
        consumption: {},
        unlocked: false,
        prerequisites: [{ entityId: 'monastery', count: 3 }],
        specialEffect: '+5% globalnej produkcji (stackuje)',
        maxLevelEffect: 'Święta Mądrość: +10% globalnej produkcji (stackuje)',
      },
      field_hospital: {
        id: 'field_hospital',
        name: 'Szpital Polowy',
        description:
          'Miejsce leczenia rannych. Znacząco zmniejsza straty jednostek podczas fal.',
        icon: 'mdi-hospital-box',
        count: 0,
        level: 1,
        tier: 2,
        baseCost: {
          faith: bn(3000),
          biomass: bn(0),
          souls: bn(0),
          ducats: bn(200),
          rage: bn(0),
        },
        costMultiplier: 1.4,
        production: {},
        consumption: {
          faith: bn(1), // 1 Faith upkeep
        },
        unlocked: false,
        prerequisites: [{ entityId: 'chaplain', count: 5 }],
        specialEffect: '-25% strat jednostek podczas fal',
        maxLevelEffect: 'Cudowne Uzdrowienie: -50% strat + szansa na 0 strat',
      },

      // ---- Tier 3 Entities ----
      reliquary: {
        id: 'reliquary',
        name: 'Relikwiarz',
        description:
          'Sanktuarium przechowujące święte relikwie. Każda relikwia daje unikalne bonusy.',
        icon: 'mdi-treasure-chest',
        count: 0,
        level: 1,
        tier: 3,
        baseCost: {
          faith: bn(100000),
          biomass: bn(0),
          souls: bn(0),
          ducats: bn(10000),
          rage: bn(0),
        },
        costMultiplier: 2.0,
        production: {
          faith: bn(50), // 50 Faith per second
        },
        consumption: {},
        unlocked: false,
        prerequisites: [{ entityId: 'cathedral', count: 1 }],
        specialConditions: [{ type: 'prestige_count', threshold: 25 }],
        specialEffect: '+1 slot na relikwie, +5% do wszystkich bonusów relikwii',
        maxLevelEffect: 'Święty Skarbiec: Podwójne bonusy z relikwii',
      },
      inquisition_fortress: {
        id: 'inquisition_fortress',
        name: 'Forteca Inkwizycji',
        description:
          'Bastion świętej sprawiedliwości. Oferuje potężne liturgie i ochronę przed herezją.',
        icon: 'mdi-castle',
        count: 0,
        level: 1,
        tier: 3,
        baseCost: {
          faith: bn(50000),
          biomass: bn(0),
          souls: bn(0),
          ducats: bn(5000),
          rage: bn(0),
        },
        costMultiplier: 1.8,
        production: {},
        consumption: {
          faith: bn(5), // 5 Faith upkeep
        },
        unlocked: false,
        prerequisites: [{ entityId: 'guard_tower', count: 10 }],
        specialConditions: [{ type: 'waves_defeated', threshold: 50 }],
        specialEffect: '-30% koszt liturgii, +20% efektywność obrony',
        maxLevelEffect: 'Święta Inkwizycja: Nowa liturgia "Oczyszczenie" - natychmiastowe zniszczenie fali',
      },
      bell_tower: {
        id: 'bell_tower',
        name: 'Wieża Dzwonnicza',
        description:
          'Monumentalna wieża z błogosławionymi dzwonami. Ostrzega o nadchodzących zagrożeniach.',
        icon: 'mdi-bell-ring',
        count: 0,
        level: 1,
        tier: 3,
        baseCost: {
          faith: bn(25000),
          biomass: bn(0),
          souls: bn(0),
          ducats: bn(0),
          rage: bn(0),
        },
        costMultiplier: 1.6,
        production: {
          faith: bn(10), // 10 Faith per second
        },
        consumption: {},
        unlocked: false,
        prerequisites: [{ entityId: 'cathedral', count: 1 }],
        specialEffect: '+30s ostrzegania o fali, +10% regeneracji morale',
        maxLevelEffect: 'Boży Głos: Każdy dzwon regeneruje +5 morale po fali',
      },

      // ---- Special Units ----
      inquisitor: {
        id: 'inquisitor',
        name: 'Inkwizytor',
        description:
          'Bezwzględny łowca heretyków. Zmniejsza koszty liturgii i zwiększa ich efektywność.',
        icon: 'mdi-account-cowboy-hat',
        count: 0,
        level: 1,
        tier: 3,
        baseCost: {
          faith: bn(1000),
          biomass: bn(0),
          souls: bn(0),
          ducats: bn(100),
          rage: bn(0),
        },
        costMultiplier: 1.25,
        production: {},
        consumption: {
          faith: bn(0.5), // 0.5 Faith upkeep
        },
        unlocked: false,
        prerequisites: [{ entityId: 'inquisition_fortress', count: 1 }],
        specialEffect: '-3% koszt liturgii, +2% efektywność (stackuje)',
        maxLevelEffect: 'Wielki Inkwizytor: -20% koszt liturgii globalnie',
      },
      holy_warrior: {
        id: 'holy_warrior',
        name: 'Święty Wojownik',
        description:
          'Elitarny rycerz Solmara. Aktywnie walczy z wrogami, zmniejszając siłę fal.',
        icon: 'mdi-sword-cross',
        count: 0,
        level: 1,
        tier: 3,
        baseCost: {
          faith: bn(2000),
          biomass: bn(0),
          souls: bn(0),
          ducats: bn(500),
          rage: bn(0),
        },
        costMultiplier: 1.35,
        production: {},
        consumption: {
          ducats: bn(0.5), // 0.5 Ducat upkeep
        },
        unlocked: false,
        prerequisites: [{ entityId: 'inquisition_fortress', count: 1 }],
        specialEffect: '-5% siły fali za każdego wojownika (max -50%)',
        maxLevelEffect: 'Święty Obrońca: Szansa na całkowite odparcie fali (5% per wojownik)',
      },

      // ---- Cult Entities ----
      flesh_puppet: {
        id: 'flesh_puppet',
        name: 'Mięsna Kukła',
        description:
          'Prymitywny konstrukt z surowej tkanki. Podstawowa jednostka produkcyjna Kultu.',
        icon: 'mdi-human-handsdown',
        count: 0,
        level: 1,
        tier: 1,
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
        maxLevelEffect: 'Samo-replikacja: Szansa na darmową kopię',
      },
      infected_stormtrooper: {
        id: 'infected_stormtrooper',
        name: 'Zarażony Szturmowiec',
        description:
          'Powstaje przez połączenie dwóch Mięsnych Kukieł. Silniejszy, szybszy, głodniejszy.',
        icon: 'mdi-biohazard',
        count: 0,
        level: 1,
        tier: 1,
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
        maxLevelEffect: 'Mutacja: Produkuje również Gniew',
      },
    });

    // ============================================
    // Computed
    // ============================================

    // Hidden cult entities (to be shown later when cult faction is implemented)
    const HIDDEN_CULT_ENTITIES = ['flesh_puppet', 'infected_stormtrooper'];

    const unlockedEntities = computed(() =>
      Object.values(entities.value).filter(
        (e) => e.unlocked && !HIDDEN_CULT_ENTITIES.includes(e.id)
      )
    );

    const solmarEntities = computed(() =>
      Object.values(entities.value).filter(
        (e) => e.unlocked && ['chapel', 'tithe_collector', 'flagellant', 'altar_tank', 'walls', 'guard_tower', 'chaplain', 'monastery', 'prayer_beads', 'holy_relic', 'blessed_altar', 'choir', 'cathedral', 'arsenal', 'library', 'field_hospital', 'reliquary', 'inquisition_fortress', 'bell_tower', 'inquisitor', 'holy_warrior'].includes(e.id)
      )
    );

    const tier1Entities = computed(() =>
      Object.values(entities.value).filter(
        (e) => e.unlocked && e.tier === 1 && !['flesh_puppet', 'infected_stormtrooper'].includes(e.id)
      )
    );

    const tier2Entities = computed(() =>
      Object.values(entities.value).filter(
        (e) => e.unlocked && e.tier === 2
      )
    );

    const tier3Entities = computed(() =>
      Object.values(entities.value).filter(
        (e) => e.unlocked && e.tier === 3
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
          // Apply prestige discount to base cost
          const discountedBaseCost = baseCost.mul(buildingCostMultiplier.value);
          costs[resourceId as ResourceId] = calculateCost(
            discountedBaseCost,
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
      let purchasedCount = 0;

      // Purchase one at a time (for accurate cost calculation)
      for (let i = 0; i < count; i++) {
        if (!canAfford(id)) break;

        const costs = getCurrentCost(id);

        // Spend resources
        for (const [resourceId, amount] of Object.entries(costs)) {
          if (amount.gt(0)) {
            resourceStore.spendResource(resourceId as ResourceId, amount);
          }
        }

        // Add entity
        entity.count++;
        purchasedCount++;

        // Update production rates
        updateProductionRates();
      }

      // Track for challenges
      if (purchasedCount > 0) {
        const challengeStore = useChallengeStore();
        challengeStore.updateProgress('buildingsBought', purchasedCount);

        // Track for statistics
        import('./statistics').then(({ useStatisticsStore }) => {
          const statisticsStore = useStatisticsStore();
          statisticsStore.trackBuildingPurchase(purchasedCount);
        });
      }

      return purchasedCount > 0;
    }

    /**
     * Calculate maximum number of entities player can afford
     * Uses iterative approach to handle scaling costs correctly
     */
    function calculateMaxAffordable(id: EntityId): number {
      const entity = entities.value[id];
      if (!entity || !entity.unlocked) return 0;

      const resourceStore = useResourceStore();
      let affordable = 0;
      const maxIterations = 1000; // Safety limit

      // Simulate purchases to calculate max affordable
      const originalCount = entity.count;
      const resourceSnapshots: Record<ResourceId, Decimal> = {
        faith: resourceStore.resources.faith.amount,
        biomass: resourceStore.resources.biomass.amount,
        souls: resourceStore.resources.souls.amount,
        ducats: resourceStore.resources.ducats.amount,
        rage: resourceStore.resources.rage.amount,
      };

      for (let i = 0; i < maxIterations; i++) {
        // Calculate cost at current count + i
        const simulatedCount = originalCount + i;
        const costs: Record<ResourceId, Decimal> = {
          faith: bn(0),
          biomass: bn(0),
          souls: bn(0),
          ducats: bn(0),
          rage: bn(0),
        };

        for (const [resourceId, baseCost] of Object.entries(entity.baseCost)) {
          if (baseCost.gt(0)) {
            const discountedBaseCost = baseCost.mul(buildingCostMultiplier.value);
            costs[resourceId as ResourceId] = calculateCost(
              discountedBaseCost,
              entity.costMultiplier,
              simulatedCount
            );
          }
        }

        // Check if can afford
        let canAffordThis = true;
        for (const [resourceId, amount] of Object.entries(costs)) {
          if (amount.gt(0) && resourceSnapshots[resourceId as ResourceId].lt(amount)) {
            canAffordThis = false;
            break;
          }
        }

        if (!canAffordThis) break;

        // Deduct from snapshot
        for (const [resourceId, amount] of Object.entries(costs)) {
          if (amount.gt(0)) {
            resourceSnapshots[resourceId as ResourceId] = resourceSnapshots[resourceId as ResourceId].sub(amount);
          }
        }

        affordable++;
      }

      return affordable;
    }

    /**
     * Get total cost for buying multiple entities
     * Used for UI display
     */
    function getTotalCostForMultiple(id: EntityId, count: number): Record<ResourceId, Decimal> {
      const entity = entities.value[id];
      const totalCosts: Record<ResourceId, Decimal> = {
        faith: bn(0),
        biomass: bn(0),
        souls: bn(0),
        ducats: bn(0),
        rage: bn(0),
      };

      if (!entity || !entity.unlocked || count <= 0) return totalCosts;

      for (let i = 0; i < count; i++) {
        const simulatedCount = entity.count + i;
        for (const [resourceId, baseCost] of Object.entries(entity.baseCost)) {
          if (baseCost.gt(0)) {
            const discountedBaseCost = baseCost.mul(buildingCostMultiplier.value);
            const cost = calculateCost(discountedBaseCost, entity.costMultiplier, simulatedCount);
            totalCosts[resourceId as ResourceId] = totalCosts[resourceId as ResourceId].add(cost);
          }
        }
      }

      return totalCosts;
    }

    /**
     * Get formatted total cost for multiple purchases
     */
    function getFormattedCostForMultiple(id: EntityId, count: number): string {
      const costs = getTotalCostForMultiple(id, count);
      const parts: string[] = [];
      const resourceStore = useResourceStore();

      for (const [resourceId, amount] of Object.entries(costs)) {
        if (amount.gt(0)) {
          const resource = resourceStore.resources[resourceId as ResourceId];
          parts.push(`${formatNumber(amount)} ${resource?.name || resourceId}`);
        }
      }

      return parts.length > 0 ? parts.join(', ') : 'Brak kosztu';
    }

    /**
     * Check if player can afford multiple entities
     */
    function canAffordMultiple(id: EntityId, count: number): boolean {
      const costs = getTotalCostForMultiple(id, count);
      const resourceStore = useResourceStore();

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
     * Get the production bonus multiplier for an entity based on level
     * Level 1 = 1x (base), Level 2 = 1.5x, Level 3 = 2x, Level 4 = 2.5x, Level 5 = 3x
     */
    function getLevelBonus(id: EntityId): number {
      const entity = entities.value[id];
      if (!entity) return 1;
      return 1 + (entity.level - 1) * PRODUCTION_BONUS_PER_LEVEL;
    }

    /**
     * Get consumption reduction based on level
     * Level 1 = 1x (base), Level 5 = 0.6x (40% reduction)
     */
    function getConsumptionMultiplier(id: EntityId): number {
      const entity = entities.value[id];
      if (!entity) return 1;
      return Math.max(0.1, 1 - (entity.level - 1) * CONSUMPTION_REDUCTION_PER_LEVEL);
    }

    /**
     * Get upgrade cost for an entity
     * Cost = sum of all baseCosts * count * (5 ^ level)
     */
    function getUpgradeCost(id: EntityId): Record<ResourceId, Decimal> {
      const entity = entities.value[id];
      const costs: Record<ResourceId, Decimal> = {
        faith: bn(0),
        biomass: bn(0),
        souls: bn(0),
        ducats: bn(0),
        rage: bn(0),
      };

      if (!entity || entity.count === 0 || entity.level >= MAX_BUILDING_LEVEL) {
        return costs;
      }

      // Upgrade cost = base cost * count * (5 ^ current level)
      const levelMultiplier = Math.pow(UPGRADE_COST_MULTIPLIER, entity.level);

      for (const [resourceId, baseCost] of Object.entries(entity.baseCost)) {
        if (baseCost.gt(0)) {
          costs[resourceId as ResourceId] = baseCost
            .mul(entity.count)
            .mul(levelMultiplier)
            .mul(buildingCostMultiplier.value);
        }
      }

      return costs;
    }

    /**
     * Get formatted upgrade cost string
     */
    function getFormattedUpgradeCost(id: EntityId): string {
      const costs = getUpgradeCost(id);
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
     * Check if player can afford to upgrade an entity
     */
    function canAffordUpgrade(id: EntityId): boolean {
      const entity = entities.value[id];
      if (!entity || entity.count === 0 || entity.level >= MAX_BUILDING_LEVEL) {
        return false;
      }

      const resourceStore = useResourceStore();
      const costs = getUpgradeCost(id);

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
     * Check if entity can be upgraded (has buildings and not at max level)
     */
    function canUpgrade(id: EntityId): boolean {
      const entity = entities.value[id];
      return entity && entity.count > 0 && entity.level < MAX_BUILDING_LEVEL;
    }

    /**
     * Upgrade an entity to the next level
     */
    function upgrade(id: EntityId): boolean {
      const entity = entities.value[id];
      if (!entity || !canUpgrade(id) || !canAffordUpgrade(id)) {
        return false;
      }

      const resourceStore = useResourceStore();
      const costs = getUpgradeCost(id);

      // Spend resources
      for (const [resourceId, amount] of Object.entries(costs)) {
        if (amount.gt(0)) {
          resourceStore.spendResource(resourceId as ResourceId, amount);
        }
      }

      // Increase level
      entity.level++;

      // Update production rates with new level bonus
      updateProductionRates();

      logger.log(`[Entities] Upgraded ${entity.name} to level ${entity.level}`);

      return true;
    }

    /**
     * Check if entity is at max level
     */
    function isMaxLevel(id: EntityId): boolean {
      const entity = entities.value[id];
      return entity ? entity.level >= MAX_BUILDING_LEVEL : false;
    }

    /**
     * Update all production rates based on entity counts and levels
     */
    function updateProductionRates() {
      const resourceStore = useResourceStore();

      // Reset production rates
      for (const resourceId of Object.keys(resourceStore.resources) as ResourceId[]) {
        resourceStore.setProductionRate(resourceId, 0);
      }

      // Calculate Tier 2 bonuses first
      // Cathedral bonus to Chapel production
      let cathedralChapelBonus = 1;
      if (entities.value.cathedral?.unlocked && entities.value.cathedral.count > 0) {
        const bonusPerCathedral = entities.value.cathedral.level >= 5 ? 1.0 : 0.1; // 100% or 10%
        cathedralChapelBonus = 1 + (entities.value.cathedral.count * bonusPerCathedral);
      }

      // Add production from each entity
      for (const entity of Object.values(entities.value)) {
        if (!entity.unlocked || entity.count === 0) continue;

        // Get level bonus for production
        const levelBonus = getLevelBonus(entity.id);
        const consumptionMultiplier = getConsumptionMultiplier(entity.id);

        // Add production (boosted by level)
        for (const [resourceId, baseProduction] of Object.entries(entity.production)) {
          if (baseProduction && baseProduction.gt(0)) {
            let totalProduction = baseProduction.mul(entity.count).mul(levelBonus);

            // Apply Cathedral bonus to Chapel faith production
            if (entity.id === 'chapel' && resourceId === 'faith') {
              totalProduction = totalProduction.mul(cathedralChapelBonus);
            }

            resourceStore.addProductionRate(resourceId as ResourceId, totalProduction);
          }
        }

        // Subtract consumption (reduced by level)
        for (const [resourceId, baseConsumption] of Object.entries(entity.consumption)) {
          if (baseConsumption && baseConsumption.gt(0)) {
            const totalConsumption = baseConsumption.mul(entity.count).mul(consumptionMultiplier).neg();
            resourceStore.addProductionRate(resourceId as ResourceId, totalConsumption);
          }
        }
      }
    }

    /**
     * Check if all prerequisites for an entity are met
     */
    function checkPrerequisites(entity: Entity): boolean {
      if (!entity.prerequisites || entity.prerequisites.length === 0) return true;

      for (const prereq of entity.prerequisites) {
        const targetEntity = entities.value[prereq.entityId];
        if (!targetEntity || targetEntity.count < prereq.count) {
          return false;
        }
      }
      return true;
    }

    /**
     * Check special unlock conditions (prestige count, waves defeated, etc.)
     */
    function checkSpecialConditions(entity: Entity): boolean {
      if (!entity.specialConditions || entity.specialConditions.length === 0) return true;

      const prestigeStore = usePrestigeStore();
      const combatStore = useCombatStore();

      for (const condition of entity.specialConditions) {
        switch (condition.type) {
          case 'prestige_count':
            if (prestigeStore.stats.totalPrestiges < condition.threshold) {
              return false;
            }
            break;
          case 'waves_defeated':
            if (combatStore.wavesDefeated < condition.threshold) {
              return false;
            }
            break;
          case 'total_faith':
            const resourceStore = useResourceStore();
            if (resourceStore.totalFaithEarned.lt(condition.threshold)) {
              return false;
            }
            break;
        }
      }
      return true;
    }

    /**
     * Get formatted special conditions string
     */
    function getFormattedSpecialConditions(id: EntityId): string {
      const entity = entities.value[id];
      if (!entity?.specialConditions || entity.specialConditions.length === 0) {
        return '';
      }

      const prestigeStore = usePrestigeStore();
      const combatStore = useCombatStore();

      return entity.specialConditions.map(condition => {
        switch (condition.type) {
          case 'prestige_count': {
            const current = prestigeStore.stats.totalPrestiges;
            const met = current >= condition.threshold;
            return `${current}/${condition.threshold} prestiży${met ? ' ✓' : ''}`;
          }
          case 'waves_defeated': {
            const current = combatStore.wavesDefeated;
            const met = current >= condition.threshold;
            return `${current}/${condition.threshold} fal${met ? ' ✓' : ''}`;
          }
          case 'total_faith': {
            const resourceStore = useResourceStore();
            const current = resourceStore.totalFaithEarned.toNumber();
            const met = current >= condition.threshold;
            return `${formatNumber(current)}/${formatNumber(condition.threshold)} Wiary${met ? ' ✓' : ''}`;
          }
          default:
            return '';
        }
      }).join(', ');
    }

    /**
     * Get formatted prerequisites string
     */
    function getFormattedPrerequisites(id: EntityId): string {
      const entity = entities.value[id];
      if (!entity) return '';

      const parts: string[] = [];

      // Add building prerequisites
      if (entity.prerequisites && entity.prerequisites.length > 0) {
        const prereqStrings = entity.prerequisites.map(prereq => {
          const targetEntity = entities.value[prereq.entityId];
          const currentCount = targetEntity?.count || 0;
          const met = currentCount >= prereq.count;
          return `${targetEntity?.name || prereq.entityId} ${currentCount}/${prereq.count}${met ? ' ✓' : ''}`;
        });
        parts.push(...prereqStrings);
      }

      // Add special conditions
      const specialConditionsStr = getFormattedSpecialConditions(id);
      if (specialConditionsStr) {
        parts.push(specialConditionsStr);
      }

      return parts.join(', ');
    }

    /**
     * Check if entity can be unlocked (prerequisites and special conditions met but not yet unlocked)
     */
    function canUnlock(id: EntityId): boolean {
      const entity = entities.value[id];
      if (!entity || entity.unlocked) return false;
      return checkPrerequisites(entity) && checkSpecialConditions(entity);
    }

    /**
     * Check and unlock entities based on conditions
     */
    function checkUnlocks() {
      const resourceStore = useResourceStore();

      for (const entity of Object.values(entities.value)) {
        if (entity.unlocked) continue;

        // Check prerequisites for Tier 2+ buildings
        if (entity.prerequisites && entity.prerequisites.length > 0) {
          // Must pass both prerequisites and special conditions (for Tier 3)
          const prerequisitesMet = checkPrerequisites(entity);
          const specialConditionsMet = checkSpecialConditions(entity);

          if (prerequisitesMet && specialConditionsMet) {
            entity.unlocked = true;
            logger.log(`[Entities] Unlocked Tier ${entity.tier}: ${entity.name}`);

            // Auto-unlock rage for Arsenal
            if (entity.id === 'arsenal') {
              resourceStore.unlockResource('rage');
              logger.log(`[Resources] Unlocked: Gniew`);
            }
          }
          continue;
        }

        // Then check standard unlock conditions
        if (!entity.unlockCondition) continue;

        const condition = entity.unlockCondition;

        switch (condition.type) {
          case 'resource': {
            const resource = resourceStore.resources[condition.targetId as ResourceId];
            if (resource && resource.amount.gte(condition.threshold)) {
              entity.unlocked = true;
              logger.log(`[Entities] Unlocked: ${entity.name}`);
            }
            break;
          }
          case 'entity': {
            const targetEntity = entities.value[condition.targetId as EntityId];
            if (targetEntity && targetEntity.count >= condition.threshold) {
              entity.unlocked = true;
              logger.log(`[Entities] Unlocked: ${entity.name}`);

              // Auto-unlock related resources
              if (entity.id === 'tithe_collector') {
                resourceStore.unlockResource('ducats');
                logger.log(`[Resources] Unlocked: Dukaty`);
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
     * Reset entities for prestige
     */
    function resetEntities() {
      for (const entity of Object.values(entities.value)) {
        entity.count = 0;
        entity.level = 1; // Reset level to 1
        // Keep only chapel unlocked by default
        if (!['chapel'].includes(entity.id)) {
          entity.unlocked = false;
        }
      }
      updateProductionRates();
    }

    /**
     * Set building cost multiplier (from prestige bonuses)
     */
    function setBuildingCostMultiplier(multiplier: number) {
      buildingCostMultiplier.value = multiplier;
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

    // ============================================
    // Auto-Buy Functions
    // ============================================

    /**
     * Toggle auto-buy for an entity
     */
    function toggleAutoBuy(id: EntityId): void {
      autoBuyEnabled.value[id] = !autoBuyEnabled.value[id];
      logger.log(`[Entities] Auto-buy ${autoBuyEnabled.value[id] ? 'enabled' : 'disabled'} for ${id}`);
    }

    /**
     * Set auto-buy for an entity
     */
    function setAutoBuy(id: EntityId, enabled: boolean): void {
      autoBuyEnabled.value[id] = enabled;
    }

    /**
     * Check if auto-buy is enabled for an entity
     */
    function isAutoBuyEnabled(id: EntityId): boolean {
      return autoBuyEnabled.value[id] ?? false;
    }

    /**
     * Process auto-buy for all enabled entities
     * Called from game loop
     */
    function processAutoBuy(): void {
      for (const entity of Object.values(entities.value)) {
        if (!entity.unlocked) continue;
        if (!autoBuyEnabled.value[entity.id]) continue;

        // Try to buy one if we can afford it
        if (canAfford(entity.id)) {
          purchase(entity.id, 1);
        }
      }
    }

    /**
     * Get cost formula display for tooltips
     */
    function getCostFormula(id: EntityId): string {
      const entity = entities.value[id];
      if (!entity) return '';

      const parts: string[] = [];
      for (const [resourceId, baseCost] of Object.entries(entity.baseCost)) {
        if (baseCost.gt(0)) {
          const resourceStore = useResourceStore();
          const resource = resourceStore.resources[resourceId as ResourceId];
          const name = resource?.name || resourceId;
          parts.push(`${formatNumber(baseCost)} × ${entity.costMultiplier}^n ${name}`);
        }
      }
      return `Koszt = ${parts.join(' + ')} (n = liczba posiadanych)`;
    }

    /**
     * Get production formula display for tooltips
     */
    function getProductionFormula(id: EntityId): string {
      const entity = entities.value[id];
      if (!entity) return '';

      const parts: string[] = [];
      for (const [resourceId, amount] of Object.entries(entity.production)) {
        if (amount && amount.gt(0)) {
          const resourceStore = useResourceStore();
          const resource = resourceStore.resources[resourceId as ResourceId];
          const name = resource?.name || resourceId;
          parts.push(`+${formatNumber(amount)}/s ${name}`);
        }
      }

      if (parts.length === 0) return 'Brak produkcji';

      const levelBonus = entity.level > 1 ? ` × ${1 + (entity.level - 1) * 0.5} (bonus Lv.${entity.level})` : '';
      return `Produkcja: ${parts.join(', ')}${levelBonus}`;
    }

    return {
      // State
      entities,
      buildingCostMultiplier,
      autoBuyEnabled,

      // Constants
      MAX_BUILDING_LEVEL,

      // Computed
      unlockedEntities,
      solmarEntities,
      tier1Entities,
      tier2Entities,
      tier3Entities,
      cultEntities,

      // Actions
      getCurrentCost,
      getFormattedCost,
      canAfford,
      purchase,
      calculateMaxAffordable,
      getTotalCostForMultiple,
      getFormattedCostForMultiple,
      canAffordMultiple,
      updateProductionRates,
      checkUnlocks,
      unlockEntity,
      resetEntities,
      setBuildingCostMultiplier,
      getProductionDisplay,
      getConsumptionDisplay,

      // Prerequisites
      checkPrerequisites,
      checkSpecialConditions,
      getFormattedPrerequisites,
      getFormattedSpecialConditions,
      canUnlock,

      // Auto-buy
      toggleAutoBuy,
      setAutoBuy,
      isAutoBuyEnabled,
      processAutoBuy,

      // Formulas (for tooltips)
      getCostFormula,
      getProductionFormula,

      // Upgrade actions
      getLevelBonus,
      getConsumptionMultiplier,
      getUpgradeCost,
      getFormattedUpgradeCost,
      canAffordUpgrade,
      canUpgrade,
      upgrade,
      isMaxLevel,

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

