/**
 * Resources store for Ateria Idle
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { bn, Decimal, formatNumber } from '~/shared/lib/big-number';
import type { Resource, ResourceId, Resources } from '~/entities/ateria-idle/game';

const DEFAULT_RESOURCES: Resources = {
  gold: {
    id: 'gold',
    name: 'Złoto',
    icon: 'mdi-gold',
    color: '#FFD700',
    amount: bn(0),
    maxAmount: null,
    perSecond: bn(0),
  },
  food: {
    id: 'food',
    name: 'Jedzenie',
    icon: 'mdi-food-drumstick',
    color: '#8B4513',
    amount: bn(100),
    maxAmount: bn(1000),
    perSecond: bn(0),
  },
  wood: {
    id: 'wood',
    name: 'Drewno',
    icon: 'mdi-pine-tree',
    color: '#228B22',
    amount: bn(0),
    maxAmount: bn(500),
    perSecond: bn(0),
  },
  ore: {
    id: 'ore',
    name: 'Ruda',
    icon: 'mdi-diamond-stone',
    color: '#708090',
    amount: bn(0),
    maxAmount: bn(500),
    perSecond: bn(0),
  },
  essence: {
    id: 'essence',
    name: 'Esencja',
    icon: 'mdi-shimmer',
    color: '#9932CC',
    amount: bn(0),
    maxAmount: bn(100),
    perSecond: bn(0),
  },
  slayerCoins: {
    id: 'slayerCoins',
    name: 'Monety Łowcy',
    icon: 'mdi-skull',
    color: '#DC143C',
    amount: bn(0),
    maxAmount: null,
    perSecond: bn(0),
  },
};

export const useAteriaResourcesStore = defineStore('ateria-resources', () => {
  // ============================================
  // STATE
  // ============================================

  const resources = ref<Resources>(JSON.parse(JSON.stringify(DEFAULT_RESOURCES)));

  // Initialize Decimals properly (they don't survive JSON parse)
  for (const key of Object.keys(resources.value) as ResourceId[]) {
    resources.value[key].amount = bn(0);
    resources.value[key].perSecond = bn(0);
    if (resources.value[key].maxAmount) {
      resources.value[key].maxAmount = bn(DEFAULT_RESOURCES[key].maxAmount?.toString() || '0');
    }
  }
  // Set initial food
  resources.value.food.amount = bn(100);

  // ============================================
  // COMPUTED
  // ============================================

  const gold = computed(() => resources.value.gold);
  const food = computed(() => resources.value.food);
  const wood = computed(() => resources.value.wood);
  const ore = computed(() => resources.value.ore);
  const essence = computed(() => resources.value.essence);
  const slayerCoins = computed(() => resources.value.slayerCoins);

  const resourceList = computed(() => Object.values(resources.value));

  const visibleResources = computed(() => {
    // Show resources that have been discovered (amount > 0 or perSecond > 0)
    return resourceList.value.filter(r =>
      r.amount.gt(0) || r.perSecond.gt(0) || r.id === 'gold' || r.id === 'food'
    );
  });

  // ============================================
  // ACTIONS
  // ============================================

  function getResource(id: ResourceId): Resource {
    return resources.value[id];
  }

  function getAmount(id: ResourceId): Decimal {
    return resources.value[id].amount;
  }

  function hasAmount(id: ResourceId, amount: Decimal | number): boolean {
    const resource = resources.value[id];
    const amountDecimal = amount instanceof Decimal ? amount : bn(amount);
    return resource.amount.gte(amountDecimal);
  }

  function addResource(id: ResourceId, amount: Decimal | number): boolean {
    const resource = resources.value[id];
    const amountDecimal = amount instanceof Decimal ? amount : bn(amount);

    if (amountDecimal.lte(0)) return false;

    let newAmount = resource.amount.add(amountDecimal);

    // Cap at max if exists
    if (resource.maxAmount && newAmount.gt(resource.maxAmount)) {
      newAmount = resource.maxAmount;
    }

    resource.amount = newAmount;
    return true;
  }

  function removeResource(id: ResourceId, amount: Decimal | number): boolean {
    const resource = resources.value[id];
    const amountDecimal = amount instanceof Decimal ? amount : bn(amount);

    if (amountDecimal.lte(0)) return false;
    if (resource.amount.lt(amountDecimal)) return false;

    resource.amount = resource.amount.sub(amountDecimal);
    return true;
  }

  function setResource(id: ResourceId, amount: Decimal | number): void {
    const resource = resources.value[id];
    const amountDecimal = amount instanceof Decimal ? amount : bn(amount);

    let newAmount = amountDecimal;

    // Cap at max if exists
    if (resource.maxAmount && newAmount.gt(resource.maxAmount)) {
      newAmount = resource.maxAmount;
    }

    resource.amount = newAmount.lt(0) ? bn(0) : newAmount;
  }

  function setPerSecond(id: ResourceId, perSecond: Decimal | number): void {
    const resource = resources.value[id];
    resource.perSecond = perSecond instanceof Decimal ? perSecond : bn(perSecond);
  }

  function upgradeMaxAmount(id: ResourceId, newMax: Decimal | number): void {
    const resource = resources.value[id];
    const newMaxDecimal = newMax instanceof Decimal ? newMax : bn(newMax);
    resource.maxAmount = newMaxDecimal;
  }

  // Process per-second gains (called by game loop)
  function processTick(ticksElapsed: number = 1): void {
    const ticksDecimal = bn(ticksElapsed);
    const tickRate = bn(10); // 10 ticks per second

    for (const resource of Object.values(resources.value)) {
      if (resource.perSecond.gt(0)) {
        const gain = resource.perSecond.mul(ticksDecimal).div(tickRate);
        addResource(resource.id, gain);
      }
    }
  }

  // Format for display
  function formatResource(id: ResourceId): string {
    return formatNumber(resources.value[id].amount);
  }

  function formatResourceFull(id: ResourceId): string {
    const resource = resources.value[id];
    if (resource.maxAmount) {
      return `${formatNumber(resource.amount)} / ${formatNumber(resource.maxAmount)}`;
    }
    return formatNumber(resource.amount);
  }

  // Save/Load
  function getState() {
    const state: Record<string, { amount: string; maxAmount: string | null; perSecond: string }> = {};

    for (const [key, resource] of Object.entries(resources.value)) {
      state[key] = {
        amount: resource.amount.toString(),
        maxAmount: resource.maxAmount?.toString() || null,
        perSecond: resource.perSecond.toString(),
      };
    }

    return state;
  }

  function loadState(state: Record<string, { amount: string; maxAmount: string | null; perSecond: string }>) {
    for (const [key, data] of Object.entries(state)) {
      if (resources.value[key as ResourceId]) {
        resources.value[key as ResourceId].amount = bn(data.amount);
        resources.value[key as ResourceId].maxAmount = data.maxAmount ? bn(data.maxAmount) : null;
        resources.value[key as ResourceId].perSecond = bn(data.perSecond);
      }
    }
  }

  function resetResources() {
    for (const key of Object.keys(resources.value) as ResourceId[]) {
      resources.value[key].amount = bn(DEFAULT_RESOURCES[key].amount?.toString() || '0');
      resources.value[key].perSecond = bn(0);
      resources.value[key].maxAmount = DEFAULT_RESOURCES[key].maxAmount
        ? bn(DEFAULT_RESOURCES[key].maxAmount!.toString())
        : null;
    }
    // Set initial food
    resources.value.food.amount = bn(100);
  }

  return {
    // State
    resources,

    // Computed
    gold,
    food,
    wood,
    ore,
    essence,
    slayerCoins,
    resourceList,
    visibleResources,

    // Actions
    getResource,
    getAmount,
    hasAmount,
    addResource,
    removeResource,
    setResource,
    setPerSecond,
    upgradeMaxAmount,
    processTick,
    formatResource,
    formatResourceFull,
    getState,
    loadState,
    resetResources,
  };
}, {
  persist: {
    key: 'ateria-resources',
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    serializer: {
      serialize: (state) => {
        const saveData: Record<string, any> = {};
        for (const [key, resource] of Object.entries(state.resources || {})) {
          saveData[key] = {
            amount: (resource as Resource).amount?.toString() || '0',
            maxAmount: (resource as Resource).maxAmount?.toString() || null,
            perSecond: (resource as Resource).perSecond?.toString() || '0',
          };
        }
        return JSON.stringify({ resources: saveData });
      },
      deserialize: (value) => {
        const parsed = JSON.parse(value);
        // Convert strings back to Decimals
        if (parsed.resources) {
          for (const [key, data] of Object.entries(parsed.resources)) {
            const resourceData = data as { amount: string; maxAmount: string | null; perSecond: string };
            if (DEFAULT_RESOURCES[key as ResourceId]) {
              parsed.resources[key] = {
                ...DEFAULT_RESOURCES[key as ResourceId],
                amount: bn(resourceData.amount || '0'),
                maxAmount: resourceData.maxAmount ? bn(resourceData.maxAmount) : DEFAULT_RESOURCES[key as ResourceId].maxAmount,
                perSecond: bn(resourceData.perSecond || '0'),
              };
            }
          }
        }
        return parsed;
      },
    },
  },
});
