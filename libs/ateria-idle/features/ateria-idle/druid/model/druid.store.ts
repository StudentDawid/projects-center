/**
 * Druid Store - Farming, Animals, Totems, Seasons
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAteriaGameStore } from '../../core/model/game.store';
import { useAteriaResourcesStore } from '../../core/model/resources.store';
import {
  CROPS,
  FARM_ANIMALS,
  TOTEMS,
  SEASONS,
  SEASON_LENGTH,
  ANIMAL_PRODUCTS,
  getCrop,
  getAnimal,
  getTotem,
  getAvailableCrops,
  getAvailableAnimals,
  calculateDruidXpToLevel,
  getSeasonModifier,
  calculateTotemBonus,
  type Season,
  type Crop,
  type FarmAnimal,
  type TotemAnimal,
  type DruidSkillProgress,
} from '../data/druid.data';

// ============================================
// TYPES
// ============================================

export interface PlantedCrop {
  id: string;
  cropId: string;
  plantedAt: number;
  ticksRemaining: number;
  totalTicks: number;
  waterLevel: number;
  quality: number;
  plotIndex: number;
}

export interface OwnedAnimal {
  id: string;
  animalId: string;
  name: string;
  happiness: number;
  productionProgress: number;
  totalProducts: number;
  purchasedAt: number;
}

export interface TotemState {
  unlocked: boolean;
  level: number;
  active: boolean;
}

// ============================================
// STORE
// ============================================

export const useAteriaDruidStore = defineStore('ateria-druid', () => {
  const gameStore = useAteriaGameStore();
  const resourcesStore = useAteriaResourcesStore();

  // ============================================
  // STATE
  // ============================================

  // Druid progression
  const progress = ref<DruidSkillProgress>({
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    totalXp: 0,
  });

  // Season system
  const currentSeason = ref<Season>('spring');
  const seasonTicks = ref(0);

  // Farm plots (expandable)
  const farmPlots = ref(6); // Starting plots
  const maxFarmPlots = ref(24);
  const plantedCrops = ref<PlantedCrop[]>([]);

  // Animals
  const ownedAnimals = ref<OwnedAnimal[]>([]);
  const maxAnimals = ref(5);

  // Totems
  const totems = ref<Record<TotemAnimal, TotemState>>({
    wolf: { unlocked: false, level: 0, active: false },
    bear: { unlocked: false, level: 0, active: false },
    eagle: { unlocked: false, level: 0, active: false },
    turtle: { unlocked: false, level: 0, active: false },
    snake: { unlocked: false, level: 0, active: false },
    owl: { unlocked: false, level: 0, active: false },
  });
  const activeTotem = ref<TotemAnimal | null>(null);

  // Inventory (farm products)
  const farmInventory = ref<Map<string, number>>(new Map());

  // Stats
  const totalCropsHarvested = ref(0);
  const totalProductsCollected = ref(0);

  // ============================================
  // COMPUTED
  // ============================================

  const seasonData = computed(() => SEASONS[currentSeason.value]);

  const availablePlots = computed(() => farmPlots.value - plantedCrops.value.length);

  const availableCrops = computed(() => getAvailableCrops(progress.value.level));

  const availableAnimals = computed(() => getAvailableAnimals(progress.value.level));

  const canAddAnimal = computed(() => ownedAnimals.value.length < maxAnimals.value);

  const activeTotemBonuses = computed(() => {
    if (!activeTotem.value) return [];
    const totemState = totems.value[activeTotem.value];
    if (!totemState.unlocked || totemState.level === 0) return [];
    
    const totem = getTotem(activeTotem.value);
    return calculateTotemBonus(totem, totemState.level);
  });

  const totalFarmValue = computed(() => {
    let value = 0;
    for (const [productId, amount] of farmInventory.value) {
      const product = ANIMAL_PRODUCTS[productId];
      const crop = getCrop(productId);
      if (product) {
        value += product.sellPrice * amount;
      } else if (crop) {
        value += crop.sellPrice * amount;
      }
    }
    return value;
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
      progress.value.xpToNextLevel = calculateDruidXpToLevel(progress.value.level);

      // Unlock farm slots
      if (progress.value.level % 5 === 0 && farmPlots.value < maxFarmPlots.value) {
        farmPlots.value += 2;
      }

      // Unlock animal slots
      if (progress.value.level % 8 === 0) {
        maxAnimals.value += 1;
      }

      gameStore.addNotification({
        type: 'success',
        title: `Druid - Poziom ${progress.value.level}!`,
        message: 'Nowe uprawy i zwierzęta dostępne!',
        icon: 'mdi-leaf',
        duration: 3000,
      });
    }
  }

  function getXpProgress(): number {
    return (progress.value.xp / progress.value.xpToNextLevel) * 100;
  }

  // ============================================
  // ACTIONS - SEASONS
  // ============================================

  function advanceSeason() {
    const seasons: Season[] = ['spring', 'summer', 'autumn', 'winter'];
    const currentIndex = seasons.indexOf(currentSeason.value);
    const nextIndex = (currentIndex + 1) % seasons.length;
    currentSeason.value = seasons[nextIndex];

    gameStore.addNotification({
      type: 'info',
      title: 'Zmiana Pory Roku',
      message: `Nadeszła ${SEASONS[currentSeason.value].name}!`,
      icon: SEASONS[currentSeason.value].icon,
      duration: 3000,
    });
  }

  // ============================================
  // ACTIONS - FARMING
  // ============================================

  function canPlant(cropId: string): { canPlant: boolean; reason?: string } {
    const crop = getCrop(cropId);
    if (!crop) return { canPlant: false, reason: 'Nieznana uprawa' };

    if (availablePlots.value <= 0) {
      return { canPlant: false, reason: 'Brak wolnych działek' };
    }

    if (crop.requiredLevel > progress.value.level) {
      return { canPlant: false, reason: `Wymaga poziomu ${crop.requiredLevel}` };
    }

    if (!resourcesStore.hasAmount('gold', crop.seedCost)) {
      return { canPlant: false, reason: `Brak złota (${crop.seedCost}g)` };
    }

    return { canPlant: true };
  }

  function plantCrop(cropId: string): boolean {
    const check = canPlant(cropId);
    if (!check.canPlant) {
      gameStore.addNotification({
        type: 'warning',
        title: 'Nie można zasadzić',
        message: check.reason || 'Nieznany błąd',
        icon: 'mdi-alert',
      });
      return false;
    }

    const crop = getCrop(cropId)!;
    resourcesStore.removeResource('gold', crop.seedCost);

    // Calculate growth time with season modifier
    const seasonMod = getSeasonModifier(crop, currentSeason.value);
    const growthTime = Math.floor(crop.growthTime / seasonMod);

    // Find first available plot
    const usedPlots = new Set(plantedCrops.value.map(p => p.plotIndex));
    let plotIndex = 0;
    for (let i = 0; i < farmPlots.value; i++) {
      if (!usedPlots.has(i)) {
        plotIndex = i;
        break;
      }
    }

    const planted: PlantedCrop = {
      id: `crop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      cropId,
      plantedAt: Date.now(),
      ticksRemaining: growthTime,
      totalTicks: growthTime,
      waterLevel: crop.waterNeeded,
      quality: 50 + Math.floor(Math.random() * 30), // Base quality 50-80
      plotIndex,
    };

    plantedCrops.value.push(planted);
    return true;
  }

  function waterCrop(cropId: string) {
    const planted = plantedCrops.value.find(p => p.id === cropId);
    if (!planted) return;

    const crop = getCrop(planted.cropId);
    if (!crop) return;

    planted.waterLevel = Math.min(crop.waterNeeded * 2, planted.waterLevel + 1);
    planted.quality = Math.min(100, planted.quality + 2);
  }

  function harvestCrop(plantedId: string): boolean {
    const plantedIndex = plantedCrops.value.findIndex(p => p.id === plantedId);
    if (plantedIndex === -1) return false;

    const planted = plantedCrops.value[plantedIndex];
    if (planted.ticksRemaining > 0) {
      gameStore.addNotification({
        type: 'warning',
        title: 'Uprawa nie gotowa',
        message: 'Poczekaj aż uprawa dojrzeje.',
        icon: 'mdi-clock',
      });
      return false;
    }

    const crop = getCrop(planted.cropId);
    if (!crop) return false;

    // Calculate yield
    const qualityMod = planted.quality / 100;
    const baseYield = crop.baseYield.min + Math.floor(Math.random() * (crop.baseYield.max - crop.baseYield.min + 1));
    const finalYield = Math.floor(baseYield * qualityMod * (1 + progress.value.level * 0.02));

    // Add to inventory
    const current = farmInventory.value.get(crop.id) || 0;
    farmInventory.value.set(crop.id, current + finalYield);

    // Add XP
    addXp(crop.xpReward);

    // Stats
    totalCropsHarvested.value++;

    // Remove planted crop
    plantedCrops.value.splice(plantedIndex, 1);

    gameStore.addNotification({
      type: 'success',
      title: 'Zebrano plony!',
      message: `${finalYield}x ${crop.name}`,
      icon: crop.icon,
      duration: 2000,
    });

    return true;
  }

  function processFarmingTick() {
    for (const planted of plantedCrops.value) {
      if (planted.ticksRemaining > 0) {
        planted.ticksRemaining--;

        // Water level decreases
        if (planted.waterLevel > 0) {
          planted.waterLevel -= 0.01;
        } else {
          // Quality decreases without water
          planted.quality = Math.max(10, planted.quality - 0.1);
        }
      }
    }
  }

  // ============================================
  // ACTIONS - ANIMALS
  // ============================================

  function canBuyAnimal(animalId: string): { canBuy: boolean; reason?: string } {
    const animal = getAnimal(animalId);
    if (!animal) return { canBuy: false, reason: 'Nieznane zwierzę' };

    if (!canAddAnimal.value) {
      return { canBuy: false, reason: 'Brak miejsca dla zwierząt' };
    }

    if (animal.requiredLevel > progress.value.level) {
      return { canBuy: false, reason: `Wymaga poziomu ${animal.requiredLevel}` };
    }

    if (!resourcesStore.hasAmount('gold', animal.purchaseCost)) {
      return { canBuy: false, reason: `Brak złota (${animal.purchaseCost}g)` };
    }

    return { canBuy: true };
  }

  function buyAnimal(animalId: string, name?: string): boolean {
    const check = canBuyAnimal(animalId);
    if (!check.canBuy) {
      gameStore.addNotification({
        type: 'warning',
        title: 'Nie można kupić',
        message: check.reason || 'Nieznany błąd',
        icon: 'mdi-alert',
      });
      return false;
    }

    const animal = getAnimal(animalId)!;
    resourcesStore.removeResource('gold', animal.purchaseCost);

    const owned: OwnedAnimal = {
      id: `animal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      animalId,
      name: name || animal.name,
      happiness: animal.maxHappiness,
      productionProgress: 0,
      totalProducts: 0,
      purchasedAt: Date.now(),
    };

    ownedAnimals.value.push(owned);

    gameStore.addNotification({
      type: 'success',
      title: 'Kupiono zwierzę!',
      message: `${owned.name} dołączył do farmy!`,
      icon: animal.icon,
      duration: 3000,
    });

    return true;
  }

  function feedAnimal(ownedId: string) {
    const owned = ownedAnimals.value.find(a => a.id === ownedId);
    if (!owned) return;

    const animal = getAnimal(owned.animalId);
    if (!animal) return;

    owned.happiness = Math.min(animal.maxHappiness, owned.happiness + 20);
  }

  function collectProduct(ownedId: string): boolean {
    const owned = ownedAnimals.value.find(a => a.id === ownedId);
    if (!owned) return false;

    const animal = getAnimal(owned.animalId);
    if (!animal) return false;

    if (owned.productionProgress < animal.productionTime) {
      gameStore.addNotification({
        type: 'warning',
        title: 'Produkt nie gotowy',
        message: 'Poczekaj na produkcję.',
        icon: 'mdi-clock',
      });
      return false;
    }

    // Calculate yield based on happiness
    const happinessMod = owned.happiness / animal.maxHappiness;
    const baseYield = animal.productionAmount.min + 
      Math.floor(Math.random() * (animal.productionAmount.max - animal.productionAmount.min + 1));
    const finalYield = Math.max(1, Math.floor(baseYield * happinessMod));

    // Add to inventory
    const current = farmInventory.value.get(animal.productId) || 0;
    farmInventory.value.set(animal.productId, current + finalYield);

    // Add XP
    addXp(animal.xpPerProduct);

    // Reset production and stats
    owned.productionProgress = 0;
    owned.totalProducts += finalYield;
    totalProductsCollected.value += finalYield;

    gameStore.addNotification({
      type: 'success',
      title: 'Zebrano produkt!',
      message: `${finalYield}x ${animal.productName}`,
      icon: animal.icon,
      duration: 2000,
    });

    return true;
  }

  function processAnimalTick() {
    for (const owned of ownedAnimals.value) {
      const animal = getAnimal(owned.animalId);
      if (!animal) continue;

      // Happiness decay
      owned.happiness = Math.max(0, owned.happiness - animal.happinessDecay);

      // Production progress (only if happy enough)
      if (owned.happiness > 20) {
        const seasonBonus = currentSeason.value === 'winter' ? 1.2 : 1.0;
        owned.productionProgress += 1 * seasonBonus;
      }
    }
  }

  // ============================================
  // ACTIONS - TOTEMS
  // ============================================

  function canUnlockTotem(totemId: TotemAnimal): { canUnlock: boolean; reason?: string } {
    const totem = getTotem(totemId);
    const state = totems.value[totemId];

    if (state.unlocked) {
      return { canUnlock: false, reason: 'Totem już odblokowany' };
    }

    if (totem.requiredLevel > progress.value.level) {
      return { canUnlock: false, reason: `Wymaga poziomu ${totem.requiredLevel}` };
    }

    if (!resourcesStore.hasAmount('gold', totem.unlockCost)) {
      return { canUnlock: false, reason: `Brak złota (${totem.unlockCost}g)` };
    }

    return { canUnlock: true };
  }

  function unlockTotem(totemId: TotemAnimal): boolean {
    const check = canUnlockTotem(totemId);
    if (!check.canUnlock) {
      gameStore.addNotification({
        type: 'warning',
        title: 'Nie można odblokować',
        message: check.reason || 'Nieznany błąd',
        icon: 'mdi-alert',
      });
      return false;
    }

    const totem = getTotem(totemId);
    resourcesStore.removeResource('gold', totem.unlockCost);

    totems.value[totemId].unlocked = true;
    totems.value[totemId].level = 1;

    gameStore.addNotification({
      type: 'success',
      title: 'Totem Odblokowany!',
      message: `${totem.name} jest teraz dostępny!`,
      icon: totem.icon,
      duration: 3000,
    });

    return true;
  }

  function upgradeTotem(totemId: TotemAnimal): boolean {
    const totem = getTotem(totemId);
    const state = totems.value[totemId];

    if (!state.unlocked) return false;
    if (state.level >= totem.maxLevel) {
      gameStore.addNotification({
        type: 'info',
        title: 'Maksymalny poziom',
        message: 'Ten totem osiągnął maksymalny poziom.',
        icon: 'mdi-check',
      });
      return false;
    }

    const cost = totem.upgradeCost(state.level);
    if (!resourcesStore.hasAmount('gold', cost)) {
      gameStore.addNotification({
        type: 'warning',
        title: 'Brak złota',
        message: `Ulepszenie kosztuje ${cost}g`,
        icon: 'mdi-currency-usd',
      });
      return false;
    }

    resourcesStore.removeResource('gold', cost);
    state.level++;

    gameStore.addNotification({
      type: 'success',
      title: 'Totem Ulepszony!',
      message: `${totem.name} - Poziom ${state.level}!`,
      icon: totem.icon,
      duration: 2000,
    });

    return true;
  }

  function setActiveTotem(totemId: TotemAnimal | null) {
    if (totemId && !totems.value[totemId].unlocked) return;
    
    // Deactivate current
    if (activeTotem.value) {
      totems.value[activeTotem.value].active = false;
    }

    // Activate new
    if (totemId) {
      totems.value[totemId].active = true;
    }
    activeTotem.value = totemId;
  }

  // ============================================
  // ACTIONS - INVENTORY
  // ============================================

  function sellProduct(productId: string, amount: number): boolean {
    const current = farmInventory.value.get(productId) || 0;
    if (current < amount) return false;

    const product = ANIMAL_PRODUCTS[productId];
    const crop = getCrop(productId);
    const sellPrice = product?.sellPrice || crop?.sellPrice || 0;

    if (sellPrice === 0) return false;

    const totalGold = sellPrice * amount;
    resourcesStore.addResource('gold', totalGold);
    
    farmInventory.value.set(productId, current - amount);
    if (farmInventory.value.get(productId) === 0) {
      farmInventory.value.delete(productId);
    }

    gameStore.addNotification({
      type: 'success',
      title: 'Sprzedano!',
      message: `${amount}x za ${totalGold}g`,
      icon: 'mdi-currency-usd',
      duration: 2000,
    });

    return true;
  }

  function sellAllProducts() {
    let totalGold = 0;
    
    for (const [productId, amount] of farmInventory.value) {
      const product = ANIMAL_PRODUCTS[productId];
      const crop = getCrop(productId);
      const sellPrice = product?.sellPrice || crop?.sellPrice || 0;
      totalGold += sellPrice * amount;
    }

    if (totalGold > 0) {
      resourcesStore.addResource('gold', totalGold);
      farmInventory.value.clear();

      gameStore.addNotification({
        type: 'success',
        title: 'Sprzedano wszystko!',
        message: `Zarobiono ${totalGold}g`,
        icon: 'mdi-currency-usd',
      });
    }
  }

  // ============================================
  // ACTIONS - GAME LOOP
  // ============================================

  function processTick() {
    // Season cycle
    seasonTicks.value++;
    if (seasonTicks.value >= SEASON_LENGTH) {
      seasonTicks.value = 0;
      advanceSeason();
    }

    // Process farming
    processFarmingTick();

    // Process animals
    processAnimalTick();
  }

  // ============================================
  // SAVE/LOAD
  // ============================================

  function getState() {
    return {
      progress: progress.value,
      currentSeason: currentSeason.value,
      seasonTicks: seasonTicks.value,
      farmPlots: farmPlots.value,
      maxFarmPlots: maxFarmPlots.value,
      plantedCrops: plantedCrops.value,
      ownedAnimals: ownedAnimals.value,
      maxAnimals: maxAnimals.value,
      totems: totems.value,
      activeTotem: activeTotem.value,
      farmInventory: Array.from(farmInventory.value.entries()),
      totalCropsHarvested: totalCropsHarvested.value,
      totalProductsCollected: totalProductsCollected.value,
    };
  }

  function loadState(state: ReturnType<typeof getState>) {
    if (state.progress) progress.value = state.progress;
    if (state.currentSeason) currentSeason.value = state.currentSeason;
    if (state.seasonTicks !== undefined) seasonTicks.value = state.seasonTicks;
    if (state.farmPlots !== undefined) farmPlots.value = state.farmPlots;
    if (state.maxFarmPlots !== undefined) maxFarmPlots.value = state.maxFarmPlots;
    if (state.plantedCrops) plantedCrops.value = state.plantedCrops;
    if (state.ownedAnimals) ownedAnimals.value = state.ownedAnimals;
    if (state.maxAnimals !== undefined) maxAnimals.value = state.maxAnimals;
    if (state.totems) totems.value = state.totems;
    if (state.activeTotem !== undefined) activeTotem.value = state.activeTotem;
    if (state.farmInventory) farmInventory.value = new Map(state.farmInventory);
    if (state.totalCropsHarvested !== undefined) totalCropsHarvested.value = state.totalCropsHarvested;
    if (state.totalProductsCollected !== undefined) totalProductsCollected.value = state.totalProductsCollected;
  }

  function resetDruid() {
    progress.value = { level: 1, xp: 0, xpToNextLevel: 100, totalXp: 0 };
    currentSeason.value = 'spring';
    seasonTicks.value = 0;
    farmPlots.value = 6;
    maxFarmPlots.value = 24;
    plantedCrops.value = [];
    ownedAnimals.value = [];
    maxAnimals.value = 5;
    totems.value = {
      wolf: { unlocked: false, level: 0, active: false },
      bear: { unlocked: false, level: 0, active: false },
      eagle: { unlocked: false, level: 0, active: false },
      turtle: { unlocked: false, level: 0, active: false },
      snake: { unlocked: false, level: 0, active: false },
      owl: { unlocked: false, level: 0, active: false },
    };
    activeTotem.value = null;
    farmInventory.value = new Map();
    totalCropsHarvested.value = 0;
    totalProductsCollected.value = 0;
  }

  // ============================================
  // DEV HELPERS
  // ============================================

  function devAddXp(amount: number) {
    addXp(amount);
  }

  function devAddGold(amount: number) {
    resourcesStore.addResource('gold', amount);
  }

  function devUnlockAllTotems() {
    for (const totemId of Object.keys(TOTEMS) as TotemAnimal[]) {
      totems.value[totemId].unlocked = true;
      totems.value[totemId].level = 5;
    }
  }

  function devFillInventory() {
    for (const cropId of Object.keys(CROPS)) {
      farmInventory.value.set(cropId, 50);
    }
    for (const productId of Object.keys(ANIMAL_PRODUCTS)) {
      farmInventory.value.set(productId, 50);
    }
  }

  return {
    // State
    progress,
    currentSeason,
    seasonTicks,
    farmPlots,
    maxFarmPlots,
    plantedCrops,
    ownedAnimals,
    maxAnimals,
    totems,
    activeTotem,
    farmInventory,
    totalCropsHarvested,
    totalProductsCollected,

    // Computed
    seasonData,
    availablePlots,
    availableCrops,
    availableAnimals,
    canAddAnimal,
    activeTotemBonuses,
    totalFarmValue,

    // XP
    addXp,
    getXpProgress,

    // Farming
    canPlant,
    plantCrop,
    waterCrop,
    harvestCrop,

    // Animals
    canBuyAnimal,
    buyAnimal,
    feedAnimal,
    collectProduct,

    // Totems
    canUnlockTotem,
    unlockTotem,
    upgradeTotem,
    setActiveTotem,

    // Inventory
    sellProduct,
    sellAllProducts,

    // Game Loop
    processTick,

    // Save/Load
    getState,
    loadState,
    resetDruid,

    // Dev
    devAddXp,
    devAddGold,
    devUnlockAllTotems,
    devFillInventory,
  };
}, {
  persist: {
    key: 'ateria-druid',
    serializer: {
      serialize: (state) => {
        return JSON.stringify({
          ...state,
          farmInventory: Array.from(state.farmInventory?.entries?.() || []),
        });
      },
      deserialize: (value) => {
        const parsed = JSON.parse(value);
        return {
          ...parsed,
          farmInventory: new Map(parsed.farmInventory || []),
        };
      },
    },
  },
});
