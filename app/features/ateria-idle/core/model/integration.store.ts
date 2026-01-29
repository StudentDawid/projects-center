/**
 * Integration Store - Cross-path synergies and resource sharing
 * Manages: Food system, Potion allocation, Loot transfer, Offline progress
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAteriaGameStore } from './game.store';
import { useAteriaResourcesStore } from './resources.store';
import { useAteriaWarriorStore } from '../../warrior/model/warrior.store';
import { useAteriaMerchantStore } from '../../merchant/model/merchant.store';
import { useAteriaScientistStore } from '../../scientist/model/scientist.store';
import {
  FOODS,
  getFood,
  calculateHealAmount,
  DEFAULT_AUTO_EAT_SETTINGS,
  type FoodItem,
  type AutoEatSettings,
} from '../../data/food.data';
import { POTIONS } from '../../data/scientist.data';

// ============================================
// TYPES
// ============================================

export interface FoodInventoryItem {
  foodId: string;
  amount: number;
}

export interface PotionAllocation {
  potionId: string;
  warriorPercent: number; // 0-100
  shopPercent: number; // 0-100
  minWarriorStock: number; // Minimum amount to keep for warrior
}

export interface LootTransferSettings {
  enabled: boolean;
  autoTransferRarity: 'common' | 'uncommon' | 'rare' | 'all';
  keepForWarrior: string[]; // Item IDs to keep
}

export interface OfflineProgressReport {
  timeAway: number;
  warrior: {
    xpGained: number;
    goldGained: number;
    killCount: number;
    foodConsumed: number;
  };
  merchant: {
    goldEarned: number;
    itemsSold: number;
    customersServed: number;
  };
  scientist: {
    flasksProduced: { red: number; green: number; blue: number };
    potionsCrafted: number;
    researchProgress: number;
  };
}

// ============================================
// STORE
// ============================================

export const useAteriaIntegrationStore = defineStore('ateria-integration', () => {
  const gameStore = useAteriaGameStore();
  const resourcesStore = useAteriaResourcesStore();

  // ============================================
  // FOOD SYSTEM STATE
  // ============================================

  const foodInventory = ref<FoodInventoryItem[]>([]);
  const autoEatSettings = ref<AutoEatSettings>({ ...DEFAULT_AUTO_EAT_SETTINGS });
  const totalFoodConsumed = ref(0);
  const lastFoodConsumeTime = ref(0);

  // ============================================
  // POTION ALLOCATION STATE
  // ============================================

  const potionAllocations = ref<Map<string, PotionAllocation>>(new Map());
  const warriorPotionStock = ref<Map<string, number>>(new Map());
  const shopPotionStock = ref<Map<string, number>>(new Map());
  const allocationMode = ref<'balanced' | 'warrior_priority' | 'shop_priority'>('balanced');

  // ============================================
  // LOOT TRANSFER STATE
  // ============================================

  const lootTransferSettings = ref<LootTransferSettings>({
    enabled: false,
    autoTransferRarity: 'common',
    keepForWarrior: [],
  });
  const pendingLootTransfer = ref<{ itemId: string; amount: number }[]>([]);

  // ============================================
  // FOOD COMPUTED
  // ============================================

  const totalFoodCount = computed(() => {
    return foodInventory.value.reduce((sum, item) => sum + item.amount, 0);
  });

  const foodByTier = computed(() => {
    const tiers: Record<number, FoodInventoryItem[]> = { 1: [], 2: [], 3: [], 4: [] };
    for (const item of foodInventory.value) {
      const food = getFood(item.foodId);
      if (food) {
        tiers[food.tier].push(item);
      }
    }
    return tiers;
  });

  const bestAvailableFood = computed(() => {
    // Get the best food that's available and allowed by auto-eat settings
    let bestFood: FoodItem | null = null;
    let bestHeal = 0;

    for (const item of foodInventory.value) {
      if (item.amount <= 0) continue;

      const food = getFood(item.foodId);
      if (!food) continue;

      // Skip high tier if preserving
      if (autoEatSettings.value.preserveHighTier && food.tier >= 3) continue;

      const heal = food.healAmount;
      if (heal > bestHeal) {
        bestHeal = heal;
        bestFood = food;
      }
    }

    return bestFood;
  });

  // ============================================
  // POTION COMPUTED
  // ============================================

  const totalWarriorPotions = computed(() => {
    let total = 0;
    for (const [_, amount] of warriorPotionStock.value) {
      total += amount;
    }
    return total;
  });

  const totalShopPotions = computed(() => {
    let total = 0;
    for (const [_, amount] of shopPotionStock.value) {
      total += amount;
    }
    return total;
  });

  // ============================================
  // FOOD ACTIONS
  // ============================================

  function addFood(foodId: string, amount: number) {
    const food = getFood(foodId);
    if (!food) return;

    const existing = foodInventory.value.find(f => f.foodId === foodId);
    if (existing) {
      existing.amount = Math.min(existing.amount + amount, food.stackSize);
    } else {
      foodInventory.value.push({ foodId, amount: Math.min(amount, food.stackSize) });
    }
  }

  function removeFood(foodId: string, amount: number): boolean {
    const existing = foodInventory.value.find(f => f.foodId === foodId);
    if (!existing || existing.amount < amount) return false;

    existing.amount -= amount;
    if (existing.amount <= 0) {
      const index = foodInventory.value.indexOf(existing);
      foodInventory.value.splice(index, 1);
    }
    return true;
  }

  function consumeFood(foodId: string): number {
    const food = getFood(foodId);
    if (!food) return 0;

    if (!removeFood(foodId, 1)) return 0;

    totalFoodConsumed.value++;
    lastFoodConsumeTime.value = Date.now();

    // Calculate heal with bonuses from research
    const scientistStore = useAteriaScientistStore();
    const foodHealBonus = scientistStore.getResearchBonus('warrior.foodHealBonus');
    const baseHeal = food.healAmount;
    const bonusHeal = Math.floor(baseHeal * foodHealBonus / 100);

    return baseHeal + bonusHeal;
  }

  function processAutoEat(currentHp: number, maxHp: number): number {
    if (!autoEatSettings.value.enabled) return 0;

    const hpPercent = (currentHp / maxHp) * 100;
    if (hpPercent > autoEatSettings.value.threshold) return 0;

    // Try to eat based on priority order
    for (const foodId of autoEatSettings.value.priorityOrder) {
      const existing = foodInventory.value.find(f => f.foodId === foodId && f.amount > 0);
      if (existing) {
        return consumeFood(foodId);
      }
    }

    // If no priority food available, try any available food
    const anyFood = bestAvailableFood.value;
    if (anyFood) {
      return consumeFood(anyFood.id);
    }

    return 0;
  }

  function updateAutoEatSettings(settings: Partial<AutoEatSettings>) {
    autoEatSettings.value = { ...autoEatSettings.value, ...settings };
  }

  // ============================================
  // POTION ALLOCATION ACTIONS
  // ============================================

  function setAllocation(potionId: string, allocation: Partial<PotionAllocation>) {
    const existing = potionAllocations.value.get(potionId) || {
      potionId,
      warriorPercent: 50,
      shopPercent: 50,
      minWarriorStock: 5,
    };

    const updated = { ...existing, ...allocation };

    // Ensure percentages add up to 100
    if (updated.warriorPercent + updated.shopPercent !== 100) {
      updated.shopPercent = 100 - updated.warriorPercent;
    }

    potionAllocations.value.set(potionId, updated);
  }

  function allocatePotion(potionId: string, amount: number) {
    const allocation = potionAllocations.value.get(potionId) || {
      potionId,
      warriorPercent: 50,
      shopPercent: 50,
      minWarriorStock: 5,
    };

    // Check allocation mode overrides
    let warriorAmount = Math.floor(amount * allocation.warriorPercent / 100);
    let shopAmount = amount - warriorAmount;

    if (allocationMode.value === 'warrior_priority') {
      // Check if warrior HP is low
      const warriorStore = useAteriaWarriorStore();
      const hpPercent = (warriorStore.stats.currentHp / warriorStore.stats.maxHp) * 100;
      if (hpPercent < 50) {
        warriorAmount = amount;
        shopAmount = 0;
      }
    } else if (allocationMode.value === 'shop_priority') {
      // Check if potion price is high
      // For now, just prioritize shop
      warriorAmount = Math.floor(amount * 0.3);
      shopAmount = amount - warriorAmount;
    }

    // Ensure minimum warrior stock
    const currentWarriorStock = warriorPotionStock.value.get(potionId) || 0;
    if (currentWarriorStock < allocation.minWarriorStock) {
      const needed = allocation.minWarriorStock - currentWarriorStock;
      const toWarrior = Math.min(needed, amount);
      warriorAmount = Math.max(warriorAmount, toWarrior);
      shopAmount = amount - warriorAmount;
    }

    // Add to stocks
    warriorPotionStock.value.set(potionId, currentWarriorStock + warriorAmount);
    shopPotionStock.value.set(potionId, (shopPotionStock.value.get(potionId) || 0) + shopAmount);

    // Transfer shop potions to merchant
    if (shopAmount > 0) {
      const merchantStore = useAteriaMerchantStore();
      merchantStore.addItemToStorage(potionId, shopAmount, 0);
    }
  }

  function useWarriorPotion(potionId: string): boolean {
    const stock = warriorPotionStock.value.get(potionId) || 0;
    if (stock <= 0) return false;

    warriorPotionStock.value.set(potionId, stock - 1);
    return true;
  }

  function getWarriorPotionCount(potionId: string): number {
    return warriorPotionStock.value.get(potionId) || 0;
  }

  // ============================================
  // LOOT TRANSFER ACTIONS
  // ============================================

  function setLootTransferSettings(settings: Partial<LootTransferSettings>) {
    lootTransferSettings.value = { ...lootTransferSettings.value, ...settings };
  }

  function queueLootTransfer(itemId: string, amount: number) {
    if (!lootTransferSettings.value.enabled) return;

    // Check if item should be kept for warrior
    if (lootTransferSettings.value.keepForWarrior.includes(itemId)) return;

    pendingLootTransfer.value.push({ itemId, amount });
  }

  function processLootTransfers() {
    if (pendingLootTransfer.value.length === 0) return;

    const merchantStore = useAteriaMerchantStore();

    for (const item of pendingLootTransfer.value) {
      merchantStore.addItemToStorage(item.itemId, item.amount, 0);
    }

    pendingLootTransfer.value = [];
  }

  function transferLootToMerchant(itemId: string, amount: number) {
    const merchantStore = useAteriaMerchantStore();
    merchantStore.addItemToStorage(itemId, amount, 0);
  }

  // ============================================
  // OFFLINE PROGRESS
  // ============================================

  function calculateOfflineProgress(deltaMs: number): OfflineProgressReport {
    const MAX_OFFLINE_MS = 24 * 60 * 60 * 1000; // 24 hours
    const effectiveMs = Math.min(deltaMs, MAX_OFFLINE_MS);
    const deltaTicks = Math.floor(effectiveMs / 100); // 10 ticks per second

    const warriorStore = useAteriaWarriorStore();
    const merchantStore = useAteriaMerchantStore();
    const scientistStore = useAteriaScientistStore();

    const report: OfflineProgressReport = {
      timeAway: effectiveMs,
      warrior: {
        xpGained: 0,
        goldGained: 0,
        killCount: 0,
        foodConsumed: 0,
      },
      merchant: {
        goldEarned: 0,
        itemsSold: 0,
        customersServed: 0,
      },
      scientist: {
        flasksProduced: { red: 0, green: 0, blue: 0 },
        potionsCrafted: 0,
        researchProgress: 0,
      },
    };

    // Simulate warrior offline progress
    if (warriorStore.combatState === 'fighting' || warriorStore.autoCombatEnabled) {
      const avgKillTime = 5; // seconds per kill (simplified)
      const offlineSeconds = effectiveMs / 1000;
      const potentialKills = Math.floor(offlineSeconds / avgKillTime);

      // Simulate kills with survival factor
      const survivalRate = Math.min(0.95, warriorStore.stats.damageReduction / 100 + 0.5);
      const actualKills = Math.floor(potentialKills * survivalRate);

      // XP and gold per kill (simplified averages)
      const avgXpPerKill = warriorStore.stats.level * 10;
      const avgGoldPerKill = warriorStore.stats.level * 5;

      report.warrior.killCount = actualKills;
      report.warrior.xpGained = actualKills * avgXpPerKill;
      report.warrior.goldGained = actualKills * avgGoldPerKill;

      // Food consumption (one food per 10 kills average)
      report.warrior.foodConsumed = Math.floor(actualKills / 10);

      // Apply gains
      warriorStore.addXp(report.warrior.xpGained);
      resourcesStore.addResource('gold', report.warrior.goldGained);

      // Remove food
      for (let i = 0; i < report.warrior.foodConsumed; i++) {
        const food = bestAvailableFood.value;
        if (food) {
          removeFood(food.id, 1);
        }
      }
    }

    // Simulate merchant offline progress
    const avgCustomerInterval = 30; // seconds between customers
    const offlineSeconds = effectiveMs / 1000;
    const potentialCustomers = Math.floor(offlineSeconds / avgCustomerInterval);

    // Simulate customer visits
    const customerRate = merchantStore.stats.customerAttraction || 1;
    const actualCustomers = Math.floor(potentialCustomers * customerRate);

    report.merchant.customersServed = actualCustomers;
    report.merchant.itemsSold = Math.floor(actualCustomers * 0.7); // 70% conversion
    report.merchant.goldEarned = report.merchant.itemsSold * (merchantStore.merchantLevel * 10);

    // Apply merchant gains
    resourcesStore.addResource('gold', report.merchant.goldEarned);

    // Simulate scientist offline progress
    const flaskProductionRate = scientistStore.flaskProductionRate || { red: 0.1, green: 0.05, blue: 0.01 };
    report.scientist.flasksProduced = {
      red: Math.floor(offlineSeconds * flaskProductionRate.red),
      green: Math.floor(offlineSeconds * flaskProductionRate.green),
      blue: Math.floor(offlineSeconds * flaskProductionRate.blue),
    };

    // Add flasks
    scientistStore.addFlasks('red', report.scientist.flasksProduced.red);
    scientistStore.addFlasks('green', report.scientist.flasksProduced.green);
    scientistStore.addFlasks('blue', report.scientist.flasksProduced.blue);

    // Continue research if in progress
    if (scientistStore.activeResearchId) {
      const researchSpeed = scientistStore.effectiveResearchSpeed || 1;
      report.scientist.researchProgress = Math.floor(offlineSeconds * researchSpeed);
      // Research progress is applied via normal tick processing
    }

    return report;
  }

  // ============================================
  // PROCESS TICK
  // ============================================

  function processTick() {
    // Process loot transfers periodically
    if (Math.random() < 0.1) { // Every ~10 ticks
      processLootTransfers();
    }
  }

  // ============================================
  // SAVE/LOAD
  // ============================================

  function getState() {
    return {
      foodInventory: foodInventory.value,
      autoEatSettings: autoEatSettings.value,
      totalFoodConsumed: totalFoodConsumed.value,
      potionAllocations: Array.from(potionAllocations.value.entries()),
      warriorPotionStock: Array.from(warriorPotionStock.value.entries()),
      shopPotionStock: Array.from(shopPotionStock.value.entries()),
      allocationMode: allocationMode.value,
      lootTransferSettings: lootTransferSettings.value,
    };
  }

  function loadState(state: ReturnType<typeof getState>) {
    if (state.foodInventory) foodInventory.value = state.foodInventory;
    if (state.autoEatSettings) autoEatSettings.value = state.autoEatSettings;
    if (state.totalFoodConsumed) totalFoodConsumed.value = state.totalFoodConsumed;
    if (state.potionAllocations) potionAllocations.value = new Map(state.potionAllocations);
    if (state.warriorPotionStock) warriorPotionStock.value = new Map(state.warriorPotionStock);
    if (state.shopPotionStock) shopPotionStock.value = new Map(state.shopPotionStock);
    if (state.allocationMode) allocationMode.value = state.allocationMode;
    if (state.lootTransferSettings) lootTransferSettings.value = state.lootTransferSettings;
  }

  function resetIntegration() {
    foodInventory.value = [];
    autoEatSettings.value = { ...DEFAULT_AUTO_EAT_SETTINGS };
    totalFoodConsumed.value = 0;
    potionAllocations.value = new Map();
    warriorPotionStock.value = new Map();
    shopPotionStock.value = new Map();
    allocationMode.value = 'balanced';
    lootTransferSettings.value = {
      enabled: false,
      autoTransferRarity: 'common',
      keepForWarrior: [],
    };
    pendingLootTransfer.value = [];
  }

  return {
    // Food State
    foodInventory,
    autoEatSettings,
    totalFoodConsumed,
    totalFoodCount,
    foodByTier,
    bestAvailableFood,

    // Potion State
    potionAllocations,
    warriorPotionStock,
    shopPotionStock,
    allocationMode,
    totalWarriorPotions,
    totalShopPotions,

    // Loot State
    lootTransferSettings,
    pendingLootTransfer,

    // Food Actions
    addFood,
    removeFood,
    consumeFood,
    processAutoEat,
    updateAutoEatSettings,

    // Potion Actions
    setAllocation,
    allocatePotion,
    useWarriorPotion,
    getWarriorPotionCount,

    // Loot Actions
    setLootTransferSettings,
    queueLootTransfer,
    processLootTransfers,
    transferLootToMerchant,

    // Offline
    calculateOfflineProgress,

    // Lifecycle
    processTick,
    getState,
    loadState,
    resetIntegration,
  };
}, {
  persist: {
    key: 'ateria-integration',
    serializer: {
      serialize: (state) => {
        return JSON.stringify({
          ...state,
          potionAllocations: Array.from(state.potionAllocations?.entries?.() || []),
          warriorPotionStock: Array.from(state.warriorPotionStock?.entries?.() || []),
          shopPotionStock: Array.from(state.shopPotionStock?.entries?.() || []),
        });
      },
      deserialize: (value) => {
        const parsed = JSON.parse(value);
        return {
          ...parsed,
          potionAllocations: new Map(parsed.potionAllocations || []),
          warriorPotionStock: new Map(parsed.warriorPotionStock || []),
          shopPotionStock: new Map(parsed.shopPotionStock || []),
        };
      },
    },
  },
});
