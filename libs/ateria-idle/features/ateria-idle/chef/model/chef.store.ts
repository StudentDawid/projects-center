/**
 * Chef Store - Cooking, Restaurant, Food Buffs
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAteriaGameStore } from '../../core/model/game.store';
import { useAteriaResourcesStore } from '../../core/model/resources.store';
import {
  INGREDIENTS,
  RECIPES,
  QUALITY_LEVELS,
  RESTAURANT_CUSTOMERS,
  getRecipe,
  getAvailableRecipes,
  calculateChefXpToLevel,
  calculateDishQuality,
  type Recipe,
  type DishQuality,
  type CookedDish,
  type DishBuff,
  type ChefProgress,
} from '../data/chef.data';

// ============================================
// TYPES
// ============================================

export interface ActiveCooking {
  recipeId: string;
  startTime: number;
  ticksRemaining: number;
  totalTicks: number;
}

export interface ActiveFoodBuff {
  recipeId: string;
  quality: DishQuality;
  effects: DishBuff[];
  expiresAt: number;
}

export interface RestaurantState {
  isOpen: boolean;
  currentCustomer: string | null;
  customerArrivedAt: number;
  customerOrder: string | null;
  goldEarned: number;
  customersServed: number;
}

// ============================================
// STORE
// ============================================

export const useAteriaChefStore = defineStore('ateria-chef', () => {
  const gameStore = useAteriaGameStore();
  const resourcesStore = useAteriaResourcesStore();

  // ============================================
  // STATE
  // ============================================

  const progress = ref<ChefProgress>({
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    totalXp: 0,
  });

  // Cooking
  const activeCooking = ref<ActiveCooking | null>(null);
  const cookedDishes = ref<Map<string, { dish: CookedDish; amount: number }>>(new Map());
  
  // Ingredients inventory
  const ingredients = ref<Map<string, number>>(new Map());

  // Active food buffs
  const activeBuffs = ref<ActiveFoodBuff[]>([]);

  // Restaurant
  const restaurant = ref<RestaurantState>({
    isOpen: false,
    currentCustomer: null,
    customerArrivedAt: 0,
    customerOrder: null,
    goldEarned: 0,
    customersServed: 0,
  });

  // Stats
  const totalDishesCooked = ref(0);
  const totalMealsServed = ref(0);
  const discoveredRecipes = ref<Set<string>>(new Set(['bread_basic', 'fried_egg']));

  // ============================================
  // COMPUTED
  // ============================================

  const isCooking = computed(() => activeCooking.value !== null);

  const cookingProgress = computed(() => {
    if (!activeCooking.value) return 0;
    const total = activeCooking.value.totalTicks;
    const remaining = activeCooking.value.ticksRemaining;
    return ((total - remaining) / total) * 100;
  });

  const currentRecipe = computed(() => {
    if (!activeCooking.value) return null;
    return getRecipe(activeCooking.value.recipeId);
  });

  const availableRecipes = computed(() => {
    return getAvailableRecipes(progress.value.level).filter(r => discoveredRecipes.value.has(r.id));
  });

  const totalBuffEffects = computed(() => {
    const effects: Record<string, number> = {};
    for (const buff of activeBuffs.value) {
      const qualityMult = QUALITY_LEVELS[buff.quality].multiplier;
      for (const effect of buff.effects) {
        effects[effect.type] = (effects[effect.type] || 0) + Math.floor(effect.value * qualityMult);
      }
    }
    return effects;
  });

  // ============================================
  // ACTIONS - XP & LEVELING
  // ============================================

  function addXp(amount: number) {
    progress.value.xp += amount;
    progress.value.totalXp += amount;

    while (progress.value.xp >= progress.value.xpToNextLevel) {
      progress.value.xp -= progress.value.xpToNextLevel;
      progress.value.level++;
      progress.value.xpToNextLevel = calculateChefXpToLevel(progress.value.level);

      // Unlock recipes at certain levels
      unlockRecipesForLevel(progress.value.level);

      gameStore.addNotification({
        type: 'success',
        title: `Kucharz - Poziom ${progress.value.level}!`,
        message: 'Nowe przepisy dostępne!',
        icon: 'mdi-chef-hat',
        duration: 3000,
      });
    }
  }

  function unlockRecipesForLevel(level: number) {
    const recipesToUnlock = Object.values(RECIPES).filter(r => r.requiredLevel === level);
    for (const recipe of recipesToUnlock) {
      discoveredRecipes.value.add(recipe.id);
    }
  }

  function getXpProgress(): number {
    return (progress.value.xp / progress.value.xpToNextLevel) * 100;
  }

  // ============================================
  // ACTIONS - INGREDIENTS
  // ============================================

  function addIngredient(ingredientId: string, amount: number) {
    const current = ingredients.value.get(ingredientId) || 0;
    ingredients.value.set(ingredientId, current + amount);
  }

  function hasIngredients(recipe: Recipe): boolean {
    for (const req of recipe.ingredients) {
      const have = ingredients.value.get(req.ingredientId) || 0;
      if (have < req.amount) return false;
    }
    return true;
  }

  function consumeIngredients(recipe: Recipe): boolean {
    if (!hasIngredients(recipe)) return false;
    
    for (const req of recipe.ingredients) {
      const current = ingredients.value.get(req.ingredientId) || 0;
      ingredients.value.set(req.ingredientId, current - req.amount);
    }
    return true;
  }

  // ============================================
  // ACTIONS - COOKING
  // ============================================

  function canCook(recipeId: string): { canCook: boolean; reason?: string } {
    const recipe = getRecipe(recipeId);
    if (!recipe) return { canCook: false, reason: 'Nieznany przepis' };

    if (isCooking.value) {
      return { canCook: false, reason: 'Już gotujesz' };
    }

    if (!discoveredRecipes.value.has(recipeId)) {
      return { canCook: false, reason: 'Przepis nieodkryty' };
    }

    if (recipe.requiredLevel > progress.value.level) {
      return { canCook: false, reason: `Wymaga poziomu ${recipe.requiredLevel}` };
    }

    if (!hasIngredients(recipe)) {
      return { canCook: false, reason: 'Brak składników' };
    }

    return { canCook: true };
  }

  function startCooking(recipeId: string): boolean {
    const check = canCook(recipeId);
    if (!check.canCook) {
      gameStore.addNotification({
        type: 'warning',
        title: 'Nie można gotować',
        message: check.reason || 'Nieznany błąd',
        icon: 'mdi-alert',
      });
      return false;
    }

    const recipe = getRecipe(recipeId)!;
    consumeIngredients(recipe);

    activeCooking.value = {
      recipeId,
      startTime: Date.now(),
      ticksRemaining: recipe.cookTime,
      totalTicks: recipe.cookTime,
    };

    return true;
  }

  function cancelCooking() {
    activeCooking.value = null;
  }

  function completeCooking() {
    if (!activeCooking.value) return;

    const recipe = getRecipe(activeCooking.value.recipeId);
    if (!recipe) return;

    // Calculate quality
    const quality = calculateDishQuality(progress.value.level, recipe.tier);
    const qualityData = QUALITY_LEVELS[quality];

    // Create cooked dish
    const dish: CookedDish = {
      recipeId: recipe.id,
      quality,
      qualityMultiplier: qualityData.multiplier,
      cookedAt: Date.now(),
    };

    // Add to inventory
    const key = `${recipe.id}_${quality}`;
    const existing = cookedDishes.value.get(key);
    if (existing) {
      existing.amount++;
    } else {
      cookedDishes.value.set(key, { dish, amount: 1 });
    }

    // XP and stats
    addXp(Math.floor(recipe.xpReward * qualityData.multiplier));
    totalDishesCooked.value++;

    gameStore.addNotification({
      type: 'success',
      title: 'Potrawa gotowa!',
      message: `${recipe.name} (${qualityData.label})`,
      icon: recipe.icon,
      duration: 2000,
    });

    activeCooking.value = null;
  }

  // ============================================
  // ACTIONS - EATING & BUFFS
  // ============================================

  function eatDish(recipeId: string, quality: DishQuality): boolean {
    const key = `${recipeId}_${quality}`;
    const stored = cookedDishes.value.get(key);
    if (!stored || stored.amount <= 0) return false;

    const recipe = getRecipe(recipeId);
    if (!recipe || !recipe.buffEffects) return false;

    // Remove from inventory
    stored.amount--;
    if (stored.amount <= 0) {
      cookedDishes.value.delete(key);
    }

    // Apply buff
    const buff: ActiveFoodBuff = {
      recipeId,
      quality,
      effects: recipe.buffEffects,
      expiresAt: Date.now() + (recipe.buffDuration || 600) * 100,
    };

    // Remove existing buff of same recipe
    activeBuffs.value = activeBuffs.value.filter(b => b.recipeId !== recipeId);
    activeBuffs.value.push(buff);

    totalMealsServed.value++;

    const qualityData = QUALITY_LEVELS[quality];
    gameStore.addNotification({
      type: 'success',
      title: 'Buff aktywny!',
      message: `${recipe.name} - ${recipe.buffEffects.map(e => e.description).join(', ')}`,
      icon: recipe.icon,
      duration: 3000,
    });

    return true;
  }

  function processBuffs() {
    const now = Date.now();
    activeBuffs.value = activeBuffs.value.filter(b => b.expiresAt > now);
  }

  // ============================================
  // ACTIONS - RESTAURANT
  // ============================================

  function openRestaurant() {
    restaurant.value.isOpen = true;
    spawnCustomer();
  }

  function closeRestaurant() {
    restaurant.value.isOpen = false;
    restaurant.value.currentCustomer = null;
    restaurant.value.customerOrder = null;
  }

  function spawnCustomer() {
    if (!restaurant.value.isOpen) return;
    
    const customer = RESTAURANT_CUSTOMERS[Math.floor(Math.random() * RESTAURANT_CUSTOMERS.length)];
    const availableForCategory = availableRecipes.value.filter(r => 
      customer.preferredCategories.includes(r.category)
    );
    
    if (availableForCategory.length === 0) return;

    const order = availableForCategory[Math.floor(Math.random() * availableForCategory.length)];
    
    restaurant.value.currentCustomer = customer.id;
    restaurant.value.customerArrivedAt = Date.now();
    restaurant.value.customerOrder = order.id;
  }

  function serveCustomer(recipeId: string, quality: DishQuality): boolean {
    if (!restaurant.value.currentCustomer || !restaurant.value.customerOrder) return false;
    
    const key = `${recipeId}_${quality}`;
    const stored = cookedDishes.value.get(key);
    if (!stored || stored.amount <= 0) return false;

    const recipe = getRecipe(recipeId);
    if (!recipe) return false;

    const customer = RESTAURANT_CUSTOMERS.find(c => c.id === restaurant.value.currentCustomer);
    if (!customer) return false;

    // Remove dish
    stored.amount--;
    if (stored.amount <= 0) {
      cookedDishes.value.delete(key);
    }

    // Calculate payment
    const qualityMult = QUALITY_LEVELS[quality].multiplier;
    const isPreferred = customer.preferredCategories.includes(recipe.category);
    const preferredMult = isPreferred ? 1.2 : 1.0;
    const payment = Math.floor(recipe.sellPrice * qualityMult * customer.tipMultiplier * preferredMult);

    resourcesStore.addResource('gold', payment);
    restaurant.value.goldEarned += payment;
    restaurant.value.customersServed++;
    addXp(Math.floor(recipe.xpReward * 0.5));

    gameStore.addNotification({
      type: 'success',
      title: 'Klient obsłużony!',
      message: `Zarobiono ${payment} złota`,
      icon: 'mdi-currency-usd',
      duration: 2000,
    });

    // Next customer
    restaurant.value.currentCustomer = null;
    restaurant.value.customerOrder = null;
    setTimeout(() => spawnCustomer(), 2000);

    return true;
  }

  function processRestaurant() {
    if (!restaurant.value.isOpen || !restaurant.value.currentCustomer) return;

    const customer = RESTAURANT_CUSTOMERS.find(c => c.id === restaurant.value.currentCustomer);
    if (!customer) return;

    const waitTime = Date.now() - restaurant.value.customerArrivedAt;
    if (waitTime > customer.patienceTicks * 100) {
      // Customer leaves
      gameStore.addNotification({
        type: 'warning',
        title: 'Klient odszedł',
        message: 'Zbyt długie oczekiwanie!',
        icon: 'mdi-emoticon-sad',
        duration: 2000,
      });
      restaurant.value.currentCustomer = null;
      restaurant.value.customerOrder = null;
      setTimeout(() => spawnCustomer(), 3000);
    }
  }

  // ============================================
  // ACTIONS - SELLING
  // ============================================

  function sellDish(recipeId: string, quality: DishQuality, amount: number = 1): boolean {
    const key = `${recipeId}_${quality}`;
    const stored = cookedDishes.value.get(key);
    if (!stored || stored.amount < amount) return false;

    const recipe = getRecipe(recipeId);
    if (!recipe) return false;

    const qualityMult = QUALITY_LEVELS[quality].multiplier;
    const totalGold = Math.floor(recipe.sellPrice * qualityMult * amount);

    stored.amount -= amount;
    if (stored.amount <= 0) {
      cookedDishes.value.delete(key);
    }

    resourcesStore.addResource('gold', totalGold);

    gameStore.addNotification({
      type: 'success',
      title: 'Sprzedano!',
      message: `${amount}x ${recipe.name} za ${totalGold}g`,
      icon: 'mdi-currency-usd',
      duration: 2000,
    });

    return true;
  }

  // ============================================
  // ACTIONS - GAME LOOP
  // ============================================

  function processTick() {
    // Cooking progress
    if (activeCooking.value) {
      activeCooking.value.ticksRemaining--;
      if (activeCooking.value.ticksRemaining <= 0) {
        completeCooking();
      }
    }

    // Process buffs
    processBuffs();

    // Restaurant
    if (restaurant.value.isOpen) {
      processRestaurant();
    }
  }

  // ============================================
  // SAVE/LOAD
  // ============================================

  function getState() {
    return {
      progress: progress.value,
      activeCooking: activeCooking.value,
      cookedDishes: Array.from(cookedDishes.value.entries()),
      ingredients: Array.from(ingredients.value.entries()),
      activeBuffs: activeBuffs.value,
      restaurant: restaurant.value,
      totalDishesCooked: totalDishesCooked.value,
      totalMealsServed: totalMealsServed.value,
      discoveredRecipes: Array.from(discoveredRecipes.value),
    };
  }

  function loadState(state: ReturnType<typeof getState>) {
    if (state.progress) progress.value = state.progress;
    if (state.activeCooking !== undefined) activeCooking.value = state.activeCooking;
    if (state.cookedDishes) cookedDishes.value = new Map(state.cookedDishes);
    if (state.ingredients) ingredients.value = new Map(state.ingredients);
    if (state.activeBuffs) activeBuffs.value = state.activeBuffs;
    if (state.restaurant) restaurant.value = state.restaurant;
    if (state.totalDishesCooked !== undefined) totalDishesCooked.value = state.totalDishesCooked;
    if (state.totalMealsServed !== undefined) totalMealsServed.value = state.totalMealsServed;
    if (state.discoveredRecipes) discoveredRecipes.value = new Set(state.discoveredRecipes);
  }

  function resetChef() {
    progress.value = { level: 1, xp: 0, xpToNextLevel: 100, totalXp: 0 };
    activeCooking.value = null;
    cookedDishes.value = new Map();
    ingredients.value = new Map();
    activeBuffs.value = [];
    restaurant.value = { isOpen: false, currentCustomer: null, customerArrivedAt: 0, customerOrder: null, goldEarned: 0, customersServed: 0 };
    totalDishesCooked.value = 0;
    totalMealsServed.value = 0;
    discoveredRecipes.value = new Set(['bread_basic', 'fried_egg']);
  }

  // ============================================
  // DEV HELPERS
  // ============================================

  function devAddXp(amount: number) {
    addXp(amount);
  }

  function devAddIngredients() {
    for (const id of Object.keys(INGREDIENTS)) {
      addIngredient(id, 50);
    }
  }

  function devUnlockAllRecipes() {
    for (const id of Object.keys(RECIPES)) {
      discoveredRecipes.value.add(id);
    }
  }

  return {
    // State
    progress,
    activeCooking,
    cookedDishes,
    ingredients,
    activeBuffs,
    restaurant,
    totalDishesCooked,
    totalMealsServed,
    discoveredRecipes,

    // Computed
    isCooking,
    cookingProgress,
    currentRecipe,
    availableRecipes,
    totalBuffEffects,

    // XP
    addXp,
    getXpProgress,

    // Ingredients
    addIngredient,
    hasIngredients,

    // Cooking
    canCook,
    startCooking,
    cancelCooking,

    // Eating
    eatDish,

    // Restaurant
    openRestaurant,
    closeRestaurant,
    serveCustomer,

    // Selling
    sellDish,

    // Game Loop
    processTick,

    // Save/Load
    getState,
    loadState,
    resetChef,

    // Dev
    devAddXp,
    devAddIngredients,
    devUnlockAllRecipes,
  };
}, {
  persist: {
    key: 'ateria-chef',
    serializer: {
      serialize: (state) => {
        return JSON.stringify({
          ...state,
          cookedDishes: Array.from(state.cookedDishes?.entries?.() || []),
          ingredients: Array.from(state.ingredients?.entries?.() || []),
          discoveredRecipes: Array.from(state.discoveredRecipes || []),
        });
      },
      deserialize: (value) => {
        const parsed = JSON.parse(value);
        return {
          ...parsed,
          cookedDishes: new Map(parsed.cookedDishes || []),
          ingredients: new Map(parsed.ingredients || []),
          discoveredRecipes: new Set(parsed.discoveredRecipes || []),
        };
      },
    },
  },
});
