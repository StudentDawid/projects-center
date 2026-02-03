/**
 * Alchemist Store - Potions, Experiments, Transmutation
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAteriaGameStore } from '../../core/model/game.store';
import { useAteriaResourcesStore } from '../../core/model/resources.store';
import {
  ALCHEMY_INGREDIENTS,
  POTIONS,
  ALCHEMY_EQUIPMENT,
  EXPERIMENTS,
  POTION_RARITY,
  getIngredient,
  getPotion,
  getEquipment,
  getExperiment,
  getAvailablePotions,
  calculateAlchemistXpToLevel,
  type Potion,
  type AlchemyEquipment,
  type AlchemistProgress,
  type PotionEffect,
} from '../data/alchemist.data';

// ============================================
// TYPES
// ============================================

export interface ActiveBrewing {
  potionId: string;
  startTime: number;
  ticksRemaining: number;
  totalTicks: number;
}

export interface ActiveExperiment {
  experimentId: string;
  startTime: number;
  ticksRemaining: number;
  totalTicks: number;
}

export interface ActivePotionBuff {
  potionId: string;
  effects: PotionEffect[];
  expiresAt: number;
}

// ============================================
// STORE
// ============================================

export const useAteriaAlchemistStore = defineStore('ateria-alchemist', () => {
  const gameStore = useAteriaGameStore();
  const resourcesStore = useAteriaResourcesStore();

  // ============================================
  // STATE
  // ============================================

  const progress = ref<AlchemistProgress>({
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    totalXp: 0,
  });

  // Equipment
  const equippedCauldron = ref<string>('basic_cauldron');
  const ownedEquipment = ref<Set<string>>(new Set(['basic_cauldron']));

  // Ingredients
  const ingredients = ref<Map<string, number>>(new Map());

  // Brewing
  const activeBrewing = ref<ActiveBrewing | null>(null);
  const brewedPotions = ref<Map<string, number>>(new Map());
  const discoveredRecipes = ref<Set<string>>(new Set(['minor_healing', 'strength', 'defense']));

  // Experiments
  const activeExperiment = ref<ActiveExperiment | null>(null);

  // Active buffs
  const activeBuffs = ref<ActivePotionBuff[]>([]);

  // Stats
  const totalPotionsBrewed = ref(0);
  const totalExperiments = ref(0);
  const successfulExperiments = ref(0);

  // ============================================
  // COMPUTED
  // ============================================

  const isBrewing = computed(() => activeBrewing.value !== null);
  const isExperimenting = computed(() => activeExperiment.value !== null);

  const brewingProgress = computed(() => {
    if (!activeBrewing.value) return 0;
    const total = activeBrewing.value.totalTicks;
    const remaining = activeBrewing.value.ticksRemaining;
    return ((total - remaining) / total) * 100;
  });

  const experimentProgress = computed(() => {
    if (!activeExperiment.value) return 0;
    const total = activeExperiment.value.totalTicks;
    const remaining = activeExperiment.value.ticksRemaining;
    return ((total - remaining) / total) * 100;
  });

  const currentCauldron = computed(() => getEquipment(equippedCauldron.value));

  const availablePotions = computed(() => {
    return getAvailablePotions(progress.value.level)
      .filter(p => discoveredRecipes.value.has(p.id));
  });

  const totalBrewSpeedBonus = computed(() => currentCauldron.value?.brewSpeedBonus || 0);
  const totalQualityBonus = computed(() => currentCauldron.value?.qualityBonus || 0);
  const doubleBrewChance = computed(() => currentCauldron.value?.doubleBrewChance || 0);

  const totalBuffEffects = computed(() => {
    const effects: Record<string, number> = {};
    for (const buff of activeBuffs.value) {
      for (const effect of buff.effects) {
        if (effect.stat) {
          effects[effect.stat] = (effects[effect.stat] || 0) + effect.value;
        }
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
      progress.value.xpToNextLevel = calculateAlchemistXpToLevel(progress.value.level);

      gameStore.addNotification({
        type: 'success',
        title: `Alchemik - Poziom ${progress.value.level}!`,
        message: 'Nowe receptury dostępne!',
        icon: 'mdi-flask',
        duration: 3000,
      });
    }
  }

  function getXpProgress(): number {
    return (progress.value.xp / progress.value.xpToNextLevel) * 100;
  }

  // ============================================
  // ACTIONS - EQUIPMENT
  // ============================================

  function buyEquipment(equipmentId: string): boolean {
    const equipment = getEquipment(equipmentId);
    if (!equipment) return false;
    if (ownedEquipment.value.has(equipmentId)) return false;
    if (equipment.requiredLevel > progress.value.level) return false;
    if (!resourcesStore.hasAmount('gold', equipment.cost)) return false;

    resourcesStore.removeResource('gold', equipment.cost);
    ownedEquipment.value.add(equipmentId);

    gameStore.addNotification({
      type: 'success',
      title: 'Kupiono sprzęt!',
      message: equipment.name,
      icon: equipment.icon,
      duration: 2000,
    });

    return true;
  }

  function equipCauldron(equipmentId: string): boolean {
    if (!ownedEquipment.value.has(equipmentId)) return false;
    equippedCauldron.value = equipmentId;
    return true;
  }

  // ============================================
  // ACTIONS - INGREDIENTS
  // ============================================

  function addIngredient(ingredientId: string, amount: number) {
    const current = ingredients.value.get(ingredientId) || 0;
    ingredients.value.set(ingredientId, current + amount);
  }

  function hasIngredients(potion: Potion): boolean {
    for (const req of potion.ingredients) {
      const have = ingredients.value.get(req.ingredientId) || 0;
      if (have < req.amount) return false;
    }
    return true;
  }

  function consumeIngredients(potion: Potion): boolean {
    if (!hasIngredients(potion)) return false;
    
    for (const req of potion.ingredients) {
      const current = ingredients.value.get(req.ingredientId) || 0;
      ingredients.value.set(req.ingredientId, current - req.amount);
    }
    return true;
  }

  // ============================================
  // ACTIONS - BREWING
  // ============================================

  function canBrew(potionId: string): { canBrew: boolean; reason?: string } {
    const potion = getPotion(potionId);
    if (!potion) return { canBrew: false, reason: 'Nieznany eliksir' };

    if (isBrewing.value || isExperimenting.value) {
      return { canBrew: false, reason: 'Kociołek zajęty' };
    }

    if (!discoveredRecipes.value.has(potionId)) {
      return { canBrew: false, reason: 'Receptura nieodkryta' };
    }

    if (potion.requiredLevel > progress.value.level) {
      return { canBrew: false, reason: `Wymaga poziomu ${potion.requiredLevel}` };
    }

    if (!hasIngredients(potion)) {
      return { canBrew: false, reason: 'Brak składników' };
    }

    return { canBrew: true };
  }

  function startBrewing(potionId: string): boolean {
    const check = canBrew(potionId);
    if (!check.canBrew) {
      gameStore.addNotification({
        type: 'warning',
        title: 'Nie można warzyć',
        message: check.reason || 'Nieznany błąd',
        icon: 'mdi-alert',
      });
      return false;
    }

    const potion = getPotion(potionId)!;
    consumeIngredients(potion);

    const brewTime = Math.floor(potion.brewTime * (1 - totalBrewSpeedBonus.value / 100));

    activeBrewing.value = {
      potionId,
      startTime: Date.now(),
      ticksRemaining: brewTime,
      totalTicks: brewTime,
    };

    return true;
  }

  function cancelBrewing() {
    activeBrewing.value = null;
  }

  function completeBrewing() {
    if (!activeBrewing.value) return;

    const potion = getPotion(activeBrewing.value.potionId);
    if (!potion) {
      activeBrewing.value = null;
      return;
    }

    // Calculate quantity (chance for double)
    let quantity = 1;
    if (Math.random() * 100 < doubleBrewChance.value) {
      quantity = 2;
    }

    // Add to inventory
    const current = brewedPotions.value.get(potion.id) || 0;
    brewedPotions.value.set(potion.id, current + quantity);

    // XP
    const xpBonus = 1 + totalQualityBonus.value / 100;
    addXp(Math.floor(potion.xpReward * xpBonus * quantity));

    // Stats
    totalPotionsBrewed.value += quantity;

    gameStore.addNotification({
      type: 'success',
      title: 'Eliksir uwarzony!',
      message: `${potion.name} x${quantity}`,
      icon: potion.icon,
      duration: 2000,
    });

    activeBrewing.value = null;
  }

  // ============================================
  // ACTIONS - USING POTIONS
  // ============================================

  function usePotion(potionId: string): boolean {
    const potion = getPotion(potionId);
    if (!potion) return false;

    const current = brewedPotions.value.get(potionId) || 0;
    if (current <= 0) return false;

    brewedPotions.value.set(potionId, current - 1);

    // Apply effects
    for (const effect of potion.effects) {
      if (effect.type === 'heal') {
        // Healing handled by warrior/game
        gameStore.addNotification({
          type: 'success',
          title: 'Leczenie!',
          message: effect.description,
          icon: 'mdi-heart-plus',
          duration: 2000,
        });
      } else if (effect.type === 'transmute') {
        resourcesStore.addResource('gold', effect.value);
        gameStore.addNotification({
          type: 'success',
          title: 'Transmutacja!',
          message: `+${effect.value} złota`,
          icon: 'mdi-gold',
          duration: 2000,
        });
      } else if (effect.type === 'buff' && potion.duration) {
        const buff: ActivePotionBuff = {
          potionId,
          effects: potion.effects.filter(e => e.type === 'buff'),
          expiresAt: Date.now() + potion.duration * 100,
        };
        activeBuffs.value = activeBuffs.value.filter(b => b.potionId !== potionId);
        activeBuffs.value.push(buff);
      }
    }

    return true;
  }

  // ============================================
  // ACTIONS - SELLING
  // ============================================

  function sellPotion(potionId: string, amount: number = 1): boolean {
    const potion = getPotion(potionId);
    if (!potion) return false;

    const current = brewedPotions.value.get(potionId) || 0;
    if (current < amount) return false;

    const totalGold = potion.sellPrice * amount;
    resourcesStore.addResource('gold', totalGold);
    brewedPotions.value.set(potionId, current - amount);

    gameStore.addNotification({
      type: 'success',
      title: 'Sprzedano!',
      message: `${amount}x ${potion.name} za ${totalGold}g`,
      icon: 'mdi-currency-usd',
      duration: 2000,
    });

    return true;
  }

  // ============================================
  // ACTIONS - EXPERIMENTS
  // ============================================

  function canStartExperiment(experimentId: string): { canStart: boolean; reason?: string } {
    const experiment = getExperiment(experimentId);
    if (!experiment) return { canStart: false, reason: 'Nieznany eksperyment' };

    if (isBrewing.value || isExperimenting.value) {
      return { canStart: false, reason: 'Kociołek zajęty' };
    }

    if (experiment.requiredLevel > progress.value.level) {
      return { canStart: false, reason: `Wymaga poziomu ${experiment.requiredLevel}` };
    }

    if (!resourcesStore.hasAmount('gold', experiment.goldCost)) {
      return { canStart: false, reason: 'Brak złota' };
    }

    for (const req of experiment.ingredients) {
      const have = ingredients.value.get(req.ingredientId) || 0;
      if (have < req.amount) {
        return { canStart: false, reason: 'Brak składników' };
      }
    }

    return { canStart: true };
  }

  function startExperiment(experimentId: string): boolean {
    const check = canStartExperiment(experimentId);
    if (!check.canStart) {
      gameStore.addNotification({
        type: 'warning',
        title: 'Nie można eksperymentować',
        message: check.reason || 'Nieznany błąd',
        icon: 'mdi-alert',
      });
      return false;
    }

    const experiment = getExperiment(experimentId)!;
    
    resourcesStore.removeResource('gold', experiment.goldCost);
    for (const req of experiment.ingredients) {
      const current = ingredients.value.get(req.ingredientId) || 0;
      ingredients.value.set(req.ingredientId, current - req.amount);
    }

    activeExperiment.value = {
      experimentId,
      startTime: Date.now(),
      ticksRemaining: experiment.experimentTime,
      totalTicks: experiment.experimentTime,
    };

    return true;
  }

  function cancelExperiment() {
    activeExperiment.value = null;
  }

  function completeExperiment() {
    if (!activeExperiment.value) return;

    const experiment = getExperiment(activeExperiment.value.experimentId);
    if (!experiment) {
      activeExperiment.value = null;
      return;
    }

    totalExperiments.value++;
    const isSuccess = Math.random() * 100 < experiment.successChance;

    if (isSuccess) {
      successfulExperiments.value++;
      addXp(experiment.xpReward);

      // Discover recipe
      if (experiment.discoversRecipe) {
        discoveredRecipes.value.add(experiment.discoversRecipe);
        gameStore.addNotification({
          type: 'success',
          title: 'Odkrycie!',
          message: `Nowa receptura: ${getPotion(experiment.discoversRecipe)?.name}`,
          icon: 'mdi-star',
          duration: 4000,
        });
      } else {
        // Random result
        const result = experiment.possibleResults[Math.floor(Math.random() * experiment.possibleResults.length)];
        discoveredRecipes.value.add(result);
        gameStore.addNotification({
          type: 'success',
          title: 'Eksperyment udany!',
          message: `Odkryto: ${getPotion(result)?.name}`,
          icon: 'mdi-flask-outline',
          duration: 3000,
        });
      }
    } else {
      addXp(Math.floor(experiment.xpReward * 0.3));
      gameStore.addNotification({
        type: 'warning',
        title: 'Eksperyment nieudany',
        message: 'Składniki zmarnowane!',
        icon: 'mdi-flask-empty',
        duration: 3000,
      });
    }

    activeExperiment.value = null;
  }

  // ============================================
  // ACTIONS - BUFFS
  // ============================================

  function processBuffs() {
    const now = Date.now();
    activeBuffs.value = activeBuffs.value.filter(b => b.expiresAt > now);
  }

  // ============================================
  // ACTIONS - GAME LOOP
  // ============================================

  function processTick() {
    // Brewing progress
    if (activeBrewing.value) {
      activeBrewing.value.ticksRemaining--;
      if (activeBrewing.value.ticksRemaining <= 0) {
        completeBrewing();
      }
    }

    // Experiment progress
    if (activeExperiment.value) {
      activeExperiment.value.ticksRemaining--;
      if (activeExperiment.value.ticksRemaining <= 0) {
        completeExperiment();
      }
    }

    // Process buffs
    processBuffs();
  }

  // ============================================
  // SAVE/LOAD
  // ============================================

  function getState() {
    return {
      progress: progress.value,
      equippedCauldron: equippedCauldron.value,
      ownedEquipment: Array.from(ownedEquipment.value),
      ingredients: Array.from(ingredients.value.entries()),
      brewedPotions: Array.from(brewedPotions.value.entries()),
      discoveredRecipes: Array.from(discoveredRecipes.value),
      activeBuffs: activeBuffs.value,
      totalPotionsBrewed: totalPotionsBrewed.value,
      totalExperiments: totalExperiments.value,
      successfulExperiments: successfulExperiments.value,
    };
  }

  function loadState(state: ReturnType<typeof getState>) {
    if (state.progress) progress.value = state.progress;
    if (state.equippedCauldron) equippedCauldron.value = state.equippedCauldron;
    if (state.ownedEquipment) ownedEquipment.value = new Set(state.ownedEquipment);
    if (state.ingredients) ingredients.value = new Map(state.ingredients);
    if (state.brewedPotions) brewedPotions.value = new Map(state.brewedPotions);
    if (state.discoveredRecipes) discoveredRecipes.value = new Set(state.discoveredRecipes);
    if (state.activeBuffs) activeBuffs.value = state.activeBuffs;
    if (state.totalPotionsBrewed !== undefined) totalPotionsBrewed.value = state.totalPotionsBrewed;
    if (state.totalExperiments !== undefined) totalExperiments.value = state.totalExperiments;
    if (state.successfulExperiments !== undefined) successfulExperiments.value = state.successfulExperiments;
  }

  function resetAlchemist() {
    progress.value = { level: 1, xp: 0, xpToNextLevel: 100, totalXp: 0 };
    equippedCauldron.value = 'basic_cauldron';
    ownedEquipment.value = new Set(['basic_cauldron']);
    ingredients.value = new Map();
    activeBrewing.value = null;
    brewedPotions.value = new Map();
    discoveredRecipes.value = new Set(['minor_healing', 'strength', 'defense']);
    activeExperiment.value = null;
    activeBuffs.value = [];
    totalPotionsBrewed.value = 0;
    totalExperiments.value = 0;
    successfulExperiments.value = 0;
  }

  // ============================================
  // DEV HELPERS
  // ============================================

  function devAddXp(amount: number) {
    addXp(amount);
  }

  function devAddIngredients() {
    for (const id of Object.keys(ALCHEMY_INGREDIENTS)) {
      addIngredient(id, 50);
    }
  }

  function devUnlockAll() {
    for (const id of Object.keys(POTIONS)) {
      discoveredRecipes.value.add(id);
    }
    for (const id of Object.keys(ALCHEMY_EQUIPMENT)) {
      ownedEquipment.value.add(id);
    }
  }

  return {
    // State
    progress,
    equippedCauldron,
    ownedEquipment,
    ingredients,
    activeBrewing,
    brewedPotions,
    discoveredRecipes,
    activeExperiment,
    activeBuffs,
    totalPotionsBrewed,
    totalExperiments,
    successfulExperiments,

    // Computed
    isBrewing,
    isExperimenting,
    brewingProgress,
    experimentProgress,
    currentCauldron,
    availablePotions,
    totalBrewSpeedBonus,
    totalQualityBonus,
    doubleBrewChance,
    totalBuffEffects,

    // XP
    addXp,
    getXpProgress,

    // Equipment
    buyEquipment,
    equipCauldron,

    // Ingredients
    addIngredient,
    hasIngredients,

    // Brewing
    canBrew,
    startBrewing,
    cancelBrewing,

    // Using
    usePotion,

    // Selling
    sellPotion,

    // Experiments
    canStartExperiment,
    startExperiment,
    cancelExperiment,

    // Game Loop
    processTick,

    // Save/Load
    getState,
    loadState,
    resetAlchemist,

    // Dev
    devAddXp,
    devAddIngredients,
    devUnlockAll,
  };
}, {
  persist: {
    key: 'ateria-alchemist',
    serializer: {
      serialize: (state) => {
        return JSON.stringify({
          ...state,
          ownedEquipment: Array.from(state.ownedEquipment || []),
          ingredients: Array.from(state.ingredients?.entries?.() || []),
          brewedPotions: Array.from(state.brewedPotions?.entries?.() || []),
          discoveredRecipes: Array.from(state.discoveredRecipes || []),
        });
      },
      deserialize: (value) => {
        const parsed = JSON.parse(value);
        return {
          ...parsed,
          ownedEquipment: new Set(parsed.ownedEquipment || []),
          ingredients: new Map(parsed.ingredients || []),
          brewedPotions: new Map(parsed.brewedPotions || []),
          discoveredRecipes: new Set(parsed.discoveredRecipes || []),
        };
      },
    },
  },
});
