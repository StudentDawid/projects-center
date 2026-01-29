/**
 * Crafting Store - Smithing, Tailoring, Jewelcrafting, Woodworking
 * Manages profession levels, recipes, active crafting, quality system
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAteriaGameStore } from '../../core/model/game.store';
import { useAteriaResourcesStore } from '../../core/model/resources.store';
import { useAteriaGatheringStore } from '../../gathering/model/gathering.store';
import { useAteriaInventoryStore } from '../../warrior/model/inventory.store';
import {
  CRAFTING_PROFESSIONS,
  ALL_RECIPES,
  PROCESSED_MATERIALS,
  getRecipe,
  getRecipesByProfession,
  getAvailableRecipes,
  calculateCraftingQuality,
  calculateXpToLevel,
  getQualityLabel,
  type CraftingProfession,
  type CraftingRecipe,
} from '../data/crafting.data';

// ============================================
// TYPES
// ============================================

export interface ProfessionProgress {
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXp: number;
}

export interface ActiveCrafting {
  recipeId: string;
  startTime: number;
  craftTime: number;
  ticksRemaining: number;
  quantity: number;
  currentQuantity: number;
}

export interface CraftedItem {
  outputId: string;
  quality: number;
  timestamp: number;
  recipeId: string;
}

export interface CraftingQueueItem {
  recipeId: string;
  quantity: number;
}

// ============================================
// STORE
// ============================================

export const useAteriaCraftingStore = defineStore('ateria-crafting', () => {
  const gameStore = useAteriaGameStore();
  const resourcesStore = useAteriaResourcesStore();

  // ============================================
  // STATE
  // ============================================

  // Profession levels
  const professions = ref<Record<CraftingProfession, ProfessionProgress>>({
    smithing: { level: 1, xp: 0, xpToNextLevel: 150, totalXp: 0 },
    tailoring: { level: 1, xp: 0, xpToNextLevel: 150, totalXp: 0 },
    jewelcrafting: { level: 1, xp: 0, xpToNextLevel: 150, totalXp: 0 },
    woodworking: { level: 1, xp: 0, xpToNextLevel: 150, totalXp: 0 },
  });

  // Discovered recipes (beyond default discovered)
  const discoveredRecipes = ref<Set<string>>(new Set());

  // Active crafting
  const activeCrafting = ref<ActiveCrafting | null>(null);

  // Crafting queue
  const craftingQueue = ref<CraftingQueueItem[]>([]);

  // Crafted items inventory (processed materials)
  const craftedMaterials = ref<Map<string, number>>(new Map());

  // Recent crafts history
  const recentCrafts = ref<CraftedItem[]>([]);

  // Stats
  const totalCrafted = ref<Record<CraftingProfession, number>>({
    smithing: 0,
    tailoring: 0,
    jewelcrafting: 0,
    woodworking: 0,
  });

  // Settings
  const autoCraftEnabled = ref(false);

  // ============================================
  // COMPUTED
  // ============================================

  const isCrafting = computed(() => activeCrafting.value !== null);

  const craftingProgress = computed(() => {
    if (!activeCrafting.value) return 0;
    const total = activeCrafting.value.craftTime;
    const remaining = activeCrafting.value.ticksRemaining;
    return ((total - remaining) / total) * 100;
  });

  const currentRecipe = computed(() => {
    if (!activeCrafting.value) return null;
    return getRecipe(activeCrafting.value.recipeId);
  });

  const availableRecipesByProfession = computed(() => {
    return {
      smithing: getAvailableRecipes('smithing', professions.value.smithing.level, discoveredRecipes.value),
      tailoring: getAvailableRecipes('tailoring', professions.value.tailoring.level, discoveredRecipes.value),
      jewelcrafting: getAvailableRecipes('jewelcrafting', professions.value.jewelcrafting.level, discoveredRecipes.value),
      woodworking: getAvailableRecipes('woodworking', professions.value.woodworking.level, discoveredRecipes.value),
    };
  });

  // ============================================
  // ACTIONS - XP & LEVELING
  // ============================================

  function addXp(profession: CraftingProfession, amount: number) {
    const profData = professions.value[profession];
    profData.xp += amount;
    profData.totalXp += amount;

    while (profData.xp >= profData.xpToNextLevel) {
      profData.xp -= profData.xpToNextLevel;
      profData.level++;
      profData.xpToNextLevel = calculateXpToLevel(profData.level, profession);

      gameStore.addNotification({
        type: 'success',
        title: `${CRAFTING_PROFESSIONS[profession].name} - Poziom ${profData.level}!`,
        message: 'Nowe receptury dostępne!',
        icon: CRAFTING_PROFESSIONS[profession].icon,
        duration: 3000,
      });
    }
  }

  function getXpProgress(profession: CraftingProfession): number {
    const profData = professions.value[profession];
    return (profData.xp / profData.xpToNextLevel) * 100;
  }

  // ============================================
  // ACTIONS - RECIPES
  // ============================================

  function discoverRecipe(recipeId: string) {
    const recipe = getRecipe(recipeId);
    if (!recipe) return false;

    if (discoveredRecipes.value.has(recipeId)) return false;

    discoveredRecipes.value.add(recipeId);
    gameStore.addNotification({
      type: 'success',
      title: 'Nowa Receptura!',
      message: `Odkryto: ${recipe.name}`,
      icon: 'mdi-book-open-variant',
      duration: 3000,
    });

    return true;
  }

  function canCraft(recipeId: string): { canCraft: boolean; reason?: string } {
    const recipe = getRecipe(recipeId);
    if (!recipe) return { canCraft: false, reason: 'Nieznana receptura' };

    // Check discovery
    if (!recipe.discovered && !discoveredRecipes.value.has(recipeId)) {
      return { canCraft: false, reason: 'Receptura nie została odkryta' };
    }

    // Check level
    const profLevel = professions.value[recipe.profession].level;
    if (profLevel < recipe.requiredLevel) {
      return { canCraft: false, reason: `Wymaga poziomu ${recipe.requiredLevel} ${CRAFTING_PROFESSIONS[recipe.profession].name}` };
    }

    // Check materials
    for (const material of recipe.materials) {
      if (!hasMaterial(material.itemId, material.amount)) {
        return { canCraft: false, reason: `Brak materiału: ${material.itemId}` };
      }
    }

    return { canCraft: true };
  }

  // ============================================
  // ACTIONS - MATERIALS
  // ============================================

  function hasMaterial(itemId: string, amount: number): boolean {
    // Check crafted materials first
    const craftedAmount = craftedMaterials.value.get(itemId) || 0;
    if (craftedAmount >= amount) return true;

    // Check gathering store
    const gatheringStore = useAteriaGatheringStore();
    const gatheredAmount = gatheringStore.getResourceCount(itemId);
    if (gatheredAmount >= amount) return true;

    // Check inventory store (for items like wolf_pelt, spider_silk from combat)
    const inventoryStore = useAteriaInventoryStore();
    const inventoryAmount = inventoryStore.getItemAmount(itemId);
    if (inventoryAmount >= amount) return true;

    // Check combined
    return (craftedAmount + gatheredAmount + inventoryAmount) >= amount;
  }

  function consumeMaterial(itemId: string, amount: number): boolean {
    let remaining = amount;

    // Try crafted materials first
    const craftedAmount = craftedMaterials.value.get(itemId) || 0;
    if (craftedAmount > 0) {
      const fromCrafted = Math.min(craftedAmount, remaining);
      craftedMaterials.value.set(itemId, craftedAmount - fromCrafted);
      remaining -= fromCrafted;
    }

    if (remaining <= 0) return true;

    // Try gathering store
    const gatheringStore = useAteriaGatheringStore();
    const gatheredAmount = gatheringStore.getResourceCount(itemId);
    if (gatheredAmount > 0) {
      const fromGathered = Math.min(gatheredAmount, remaining);
      gatheringStore.removeResource(itemId, fromGathered);
      remaining -= fromGathered;
    }

    if (remaining <= 0) return true;

    // Try inventory store
    const inventoryStore = useAteriaInventoryStore();
    if (remaining > 0) {
      return inventoryStore.removeItem(itemId, remaining);
    }

    return remaining <= 0;
  }

  function addCraftedMaterial(itemId: string, amount: number) {
    const current = craftedMaterials.value.get(itemId) || 0;
    craftedMaterials.value.set(itemId, current + amount);
  }

  function getCraftedMaterialCount(itemId: string): number {
    return craftedMaterials.value.get(itemId) || 0;
  }

  // ============================================
  // ACTIONS - CRAFTING
  // ============================================

  function startCrafting(recipeId: string, quantity: number = 1): boolean {
    if (isCrafting.value) {
      // Add to queue instead
      addToQueue(recipeId, quantity);
      return true;
    }

    const check = canCraft(recipeId);
    if (!check.canCraft) {
      gameStore.addNotification({
        type: 'warning',
        title: 'Nie można wytworzyć',
        message: check.reason || 'Nieznany błąd',
        icon: 'mdi-alert',
      });
      return false;
    }

    const recipe = getRecipe(recipeId)!;

    // Consume materials for first item
    for (const material of recipe.materials) {
      if (material.consumed) {
        consumeMaterial(material.itemId, material.amount);
      }
    }

    activeCrafting.value = {
      recipeId,
      startTime: Date.now(),
      craftTime: recipe.craftTime,
      ticksRemaining: recipe.craftTime,
      quantity,
      currentQuantity: 1,
    };

    return true;
  }

  function stopCrafting() {
    // Refund materials? For now, no refund
    activeCrafting.value = null;
  }

  function addToQueue(recipeId: string, quantity: number) {
    craftingQueue.value.push({ recipeId, quantity });
  }

  function removeFromQueue(index: number) {
    craftingQueue.value.splice(index, 1);
  }

  function processCraftingTick() {
    if (!activeCrafting.value) return;

    activeCrafting.value.ticksRemaining--;

    if (activeCrafting.value.ticksRemaining <= 0) {
      completeCrafting();
    }
  }

  function completeCrafting() {
    if (!activeCrafting.value) return;

    const recipe = getRecipe(activeCrafting.value.recipeId);
    if (!recipe) return;

    // Calculate quality
    const profLevel = professions.value[recipe.profession].level;
    const quality = calculateCraftingQuality(
      recipe,
      profLevel,
      recipe.materials.reduce((max, m) => {
        const processed = PROCESSED_MATERIALS[m.itemId];
        return Math.max(max, processed?.tier || 1);
      }, 1),
      0, // TODO: tool bonus
      0  // TODO: research bonus
    );

    const qualityInfo = getQualityLabel(quality);

    // Create output
    if (recipe.outputType === 'material') {
      addCraftedMaterial(recipe.outputId, recipe.outputAmount);
    } else if (recipe.outputType === 'equipment' || recipe.outputType === 'tool') {
      // Add to inventory with quality modifier
      const inventoryStore = useAteriaInventoryStore();
      // TODO: Handle quality-modified stats
      inventoryStore.addItem(
        recipe.outputId,
        recipe.outputAmount,
        'material',
        recipe.name,
        recipe.icon,
        recipe.outputRarity
      );
    }

    // Add XP
    const xpBonus = quality >= 85 ? 1.5 : quality >= 70 ? 1.2 : 1;
    addXp(recipe.profession, Math.floor(recipe.xpReward * xpBonus));

    // Update stats
    totalCrafted.value[recipe.profession]++;
    recentCrafts.value.unshift({
      outputId: recipe.outputId,
      quality,
      timestamp: Date.now(),
      recipeId: recipe.id,
    });

    // Limit recent crafts history
    if (recentCrafts.value.length > 50) {
      recentCrafts.value = recentCrafts.value.slice(0, 50);
    }

    // Notification
    gameStore.addNotification({
      type: quality >= 85 ? 'success' : 'info',
      title: `Wytworzono: ${recipe.name}`,
      message: `Jakość: ${qualityInfo.label} (${quality}%)`,
      icon: recipe.icon,
      duration: 2000,
    });

    // Check for more in quantity or queue
    if (activeCrafting.value.currentQuantity < activeCrafting.value.quantity) {
      // More to craft in this batch
      const check = canCraft(recipe.id);
      if (check.canCraft) {
        // Consume materials for next item
        for (const material of recipe.materials) {
          if (material.consumed) {
            consumeMaterial(material.itemId, material.amount);
          }
        }
        activeCrafting.value.currentQuantity++;
        activeCrafting.value.ticksRemaining = recipe.craftTime;
        return;
      }
    }

    // Done with this craft
    activeCrafting.value = null;

    // Process queue
    if (craftingQueue.value.length > 0) {
      const next = craftingQueue.value.shift()!;
      startCrafting(next.recipeId, next.quantity);
    }
  }

  // ============================================
  // ACTIONS - DECONSTRUCTION
  // ============================================

  function deconstructItem(itemId: string): boolean {
    // TODO: Implement deconstruction system
    // Returns some materials based on the item
    return false;
  }

  // ============================================
  // ACTIONS - GAME LOOP
  // ============================================

  function processTick() {
    if (isCrafting.value) {
      processCraftingTick();
    }
  }

  // ============================================
  // SAVE/LOAD
  // ============================================

  function getState() {
    return {
      professions: professions.value,
      discoveredRecipes: Array.from(discoveredRecipes.value),
      craftedMaterials: Array.from(craftedMaterials.value.entries()),
      totalCrafted: totalCrafted.value,
      recentCrafts: recentCrafts.value,
      autoCraftEnabled: autoCraftEnabled.value,
    };
  }

  function loadState(state: ReturnType<typeof getState>) {
    if (state.professions) professions.value = state.professions;
    if (state.discoveredRecipes) discoveredRecipes.value = new Set(state.discoveredRecipes);
    if (state.craftedMaterials) craftedMaterials.value = new Map(state.craftedMaterials);
    if (state.totalCrafted) totalCrafted.value = state.totalCrafted;
    if (state.recentCrafts) recentCrafts.value = state.recentCrafts;
    if (state.autoCraftEnabled !== undefined) autoCraftEnabled.value = state.autoCraftEnabled;
  }

  function resetCrafting() {
    professions.value = {
      smithing: { level: 1, xp: 0, xpToNextLevel: 150, totalXp: 0 },
      tailoring: { level: 1, xp: 0, xpToNextLevel: 150, totalXp: 0 },
      jewelcrafting: { level: 1, xp: 0, xpToNextLevel: 150, totalXp: 0 },
      woodworking: { level: 1, xp: 0, xpToNextLevel: 150, totalXp: 0 },
    };
    discoveredRecipes.value = new Set();
    activeCrafting.value = null;
    craftingQueue.value = [];
    craftedMaterials.value = new Map();
    recentCrafts.value = [];
    totalCrafted.value = { smithing: 0, tailoring: 0, jewelcrafting: 0, woodworking: 0 };
    autoCraftEnabled.value = false;
  }

  // ============================================
  // DEV HELPERS
  // ============================================

  function devAddXp(profession: CraftingProfession, amount: number) {
    addXp(profession, amount);
  }

  function devDiscoverAll() {
    for (const recipeId of Object.keys(ALL_RECIPES)) {
      discoveredRecipes.value.add(recipeId);
    }
  }

  function devAddMaterials() {
    for (const materialId of Object.keys(PROCESSED_MATERIALS)) {
      craftedMaterials.value.set(materialId, 100);
    }
  }

  return {
    // State
    professions,
    discoveredRecipes,
    activeCrafting,
    craftingQueue,
    craftedMaterials,
    recentCrafts,
    totalCrafted,
    autoCraftEnabled,

    // Computed
    isCrafting,
    craftingProgress,
    currentRecipe,
    availableRecipesByProfession,

    // XP & Leveling
    addXp,
    getXpProgress,

    // Recipes
    discoverRecipe,
    canCraft,

    // Materials
    hasMaterial,
    consumeMaterial,
    addCraftedMaterial,
    getCraftedMaterialCount,

    // Crafting
    startCrafting,
    stopCrafting,
    addToQueue,
    removeFromQueue,

    // Deconstruction
    deconstructItem,

    // Game Loop
    processTick,

    // Save/Load
    getState,
    loadState,
    resetCrafting,

    // Dev
    devAddXp,
    devDiscoverAll,
    devAddMaterials,
  };
}, {
  persist: {
    key: 'ateria-crafting',
    serializer: {
      serialize: (state) => {
        return JSON.stringify({
          ...state,
          discoveredRecipes: Array.from(state.discoveredRecipes || []),
          craftedMaterials: Array.from(state.craftedMaterials?.entries?.() || []),
        });
      },
      deserialize: (value) => {
        const parsed = JSON.parse(value);
        return {
          ...parsed,
          discoveredRecipes: new Set(parsed.discoveredRecipes || []),
          craftedMaterials: new Map(parsed.craftedMaterials || []),
        };
      },
    },
  },
});
