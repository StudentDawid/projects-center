/**
 * Fisherman Store - Fishing mechanics, rods, catches
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAteriaGameStore } from '../../core/model/game.store';
import { useAteriaResourcesStore } from '../../core/model/resources.store';
import {
  FISH,
  FISHING_RODS,
  BAITS,
  FISHING_SPOTS,
  RARITY_DATA,
  getFish,
  getRod,
  getBait,
  getSpot,
  getAvailableSpots,
  getAvailableFish,
  calculateFishermanXpToLevel,
  selectRandomFish,
  type Fish,
  type FishingRod,
  type Bait,
  type FishingSpot,
  type FishermanProgress,
  type ActiveFishing,
} from '../data/fisherman.data';

// ============================================
// STORE
// ============================================

export const useAteriaFishermanStore = defineStore('ateria-fisherman', () => {
  const gameStore = useAteriaGameStore();
  const resourcesStore = useAteriaResourcesStore();

  // ============================================
  // STATE
  // ============================================

  const progress = ref<FishermanProgress>({
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    totalXp: 0,
  });

  // Equipment
  const equippedRod = ref<string | null>('wooden_rod');
  const ownedRods = ref<Set<string>>(new Set(['wooden_rod']));
  const rodDurability = ref<Map<string, number>>(new Map([['wooden_rod', 100]]));
  
  const equippedBait = ref<string | null>(null);
  const baitInventory = ref<Map<string, number>>(new Map());

  // Fishing state
  const activeFishing = ref<ActiveFishing | null>(null);
  const currentSpot = ref<string | null>(null);

  // Inventory
  const caughtFish = ref<Map<string, number>>(new Map());
  
  // Collection/Aquarium
  const fishCollection = ref<Set<string>>(new Set());
  const fishRecords = ref<Map<string, { size: number; caughtAt: number }>>(new Map());

  // Stats
  const totalFishCaught = ref(0);
  const totalGoldEarned = ref(0);
  const legendaryFishCaught = ref(0);

  // ============================================
  // COMPUTED
  // ============================================

  const isFishing = computed(() => activeFishing.value !== null);

  const fishingProgress = computed(() => {
    if (!activeFishing.value) return 0;
    const total = activeFishing.value.totalTicks;
    const remaining = activeFishing.value.ticksRemaining;
    return ((total - remaining) / total) * 100;
  });

  const currentRod = computed(() => {
    if (!equippedRod.value) return null;
    return getRod(equippedRod.value);
  });

  const currentBait = computed(() => {
    if (!equippedBait.value) return null;
    return getBait(equippedBait.value);
  });

  const availableSpots = computed(() => getAvailableSpots(progress.value.level));

  const totalFishValue = computed(() => {
    let value = 0;
    for (const [fishId, amount] of caughtFish.value) {
      const fish = getFish(fishId);
      if (fish) {
        value += fish.sellPrice * amount;
      }
    }
    return value;
  });

  const collectionProgress = computed(() => {
    const total = Object.keys(FISH).length;
    return (fishCollection.value.size / total) * 100;
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
      progress.value.xpToNextLevel = calculateFishermanXpToLevel(progress.value.level);

      gameStore.addNotification({
        type: 'success',
        title: `Wędkarz - Poziom ${progress.value.level}!`,
        message: 'Nowe łowiska dostępne!',
        icon: 'mdi-fishing',
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

  function buyRod(rodId: string): boolean {
    const rod = getRod(rodId);
    if (!rod) return false;
    if (ownedRods.value.has(rodId)) return false;
    if (rod.requiredLevel > progress.value.level) return false;
    if (!resourcesStore.hasAmount('gold', rod.cost)) return false;

    resourcesStore.removeResource('gold', rod.cost);
    ownedRods.value.add(rodId);
    rodDurability.value.set(rodId, rod.durability);

    gameStore.addNotification({
      type: 'success',
      title: 'Kupiono wędkę!',
      message: rod.name,
      icon: rod.icon,
      duration: 2000,
    });

    return true;
  }

  function equipRod(rodId: string): boolean {
    if (!ownedRods.value.has(rodId)) return false;
    const durability = rodDurability.value.get(rodId) || 0;
    if (durability <= 0) return false;
    
    equippedRod.value = rodId;
    return true;
  }

  function repairRod(rodId: string): boolean {
    const rod = getRod(rodId);
    if (!rod || !ownedRods.value.has(rodId)) return false;
    
    const currentDurability = rodDurability.value.get(rodId) || 0;
    if (currentDurability >= rod.durability) return false;
    
    const repairCost = Math.floor((rod.durability - currentDurability) * rod.cost * 0.01);
    if (!resourcesStore.hasAmount('gold', repairCost)) return false;

    resourcesStore.removeResource('gold', repairCost);
    rodDurability.value.set(rodId, rod.durability);

    return true;
  }

  function buyBait(baitId: string, amount: number = 1): boolean {
    const bait = getBait(baitId);
    if (!bait) return false;
    
    const totalCost = bait.cost * amount;
    if (!resourcesStore.hasAmount('gold', totalCost)) return false;

    resourcesStore.removeResource('gold', totalCost);
    const current = baitInventory.value.get(baitId) || 0;
    baitInventory.value.set(baitId, current + amount * bait.uses);

    return true;
  }

  function equipBait(baitId: string | null): boolean {
    if (baitId === null) {
      equippedBait.value = null;
      return true;
    }
    
    const amount = baitInventory.value.get(baitId) || 0;
    if (amount <= 0) return false;
    
    equippedBait.value = baitId;
    return true;
  }

  function consumeBait(): boolean {
    if (!equippedBait.value) return true; // No bait is OK
    
    const amount = baitInventory.value.get(equippedBait.value) || 0;
    if (amount <= 0) {
      equippedBait.value = null;
      return true;
    }
    
    baitInventory.value.set(equippedBait.value, amount - 1);
    if (amount - 1 <= 0) {
      equippedBait.value = null;
    }
    return true;
  }

  // ============================================
  // ACTIONS - FISHING
  // ============================================

  function canFish(spotId: string): { canFish: boolean; reason?: string } {
    const spot = getSpot(spotId);
    if (!spot) return { canFish: false, reason: 'Nieznane łowisko' };

    if (isFishing.value) {
      return { canFish: false, reason: 'Już łowisz' };
    }

    if (spot.requiredLevel > progress.value.level) {
      return { canFish: false, reason: `Wymaga poziomu ${spot.requiredLevel}` };
    }

    if (!currentRod.value) {
      return { canFish: false, reason: 'Brak wędki' };
    }

    const durability = rodDurability.value.get(equippedRod.value!) || 0;
    if (durability <= 0) {
      return { canFish: false, reason: 'Wędka zepsuta' };
    }

    return { canFish: true };
  }

  function startFishing(spotId: string): boolean {
    const check = canFish(spotId);
    if (!check.canFish) {
      gameStore.addNotification({
        type: 'warning',
        title: 'Nie można łowić',
        message: check.reason || 'Nieznany błąd',
        icon: 'mdi-alert',
      });
      return false;
    }

    const spot = getSpot(spotId)!;
    const rod = currentRod.value!;
    const bait = currentBait.value;

    // Calculate catch time
    let catchTime = spot.baseCatchTime;
    catchTime = Math.floor(catchTime / rod.speed);
    if (bait) {
      catchTime = Math.floor(catchTime * (1 - bait.catchSpeedBonus / 100));
    }

    // Select potential fish
    const availableFishList = getAvailableFish(spot, rod.power, progress.value.level);
    const potentialFish = selectRandomFish(availableFishList, rod.luck, bait);

    activeFishing.value = {
      spotId,
      startTime: Date.now(),
      ticksRemaining: catchTime,
      totalTicks: catchTime,
      potentialFish: potentialFish?.id || null,
    };

    currentSpot.value = spotId;
    return true;
  }

  function cancelFishing() {
    activeFishing.value = null;
  }

  function completeFishing() {
    if (!activeFishing.value || !activeFishing.value.potentialFish) {
      // No catch
      gameStore.addNotification({
        type: 'info',
        title: 'Nic nie złapano',
        message: 'Spróbuj ponownie!',
        icon: 'mdi-fish-off',
        duration: 2000,
      });
      activeFishing.value = null;
      return;
    }

    const fish = getFish(activeFishing.value.potentialFish);
    if (!fish) {
      activeFishing.value = null;
      return;
    }

    // Add fish to inventory
    const current = caughtFish.value.get(fish.id) || 0;
    caughtFish.value.set(fish.id, current + 1);

    // Add to collection
    if (!fishCollection.value.has(fish.id)) {
      fishCollection.value.add(fish.id);
      gameStore.addNotification({
        type: 'success',
        title: 'Nowy gatunek!',
        message: `Odkryto: ${fish.name}`,
        icon: 'mdi-star',
        duration: 3000,
      });
    }

    // XP
    addXp(fish.xpReward);

    // Stats
    totalFishCaught.value++;
    if (fish.rarity === 'legendary') {
      legendaryFishCaught.value++;
    }

    // Consume bait
    consumeBait();

    // Damage rod
    if (equippedRod.value) {
      const currentDurability = rodDurability.value.get(equippedRod.value) || 0;
      rodDurability.value.set(equippedRod.value, Math.max(0, currentDurability - 1));
    }

    const rarityData = RARITY_DATA[fish.rarity];
    gameStore.addNotification({
      type: 'success',
      title: 'Złapano rybę!',
      message: `${fish.name} (${rarityData.label})`,
      icon: fish.icon,
      duration: 2500,
    });

    activeFishing.value = null;
  }

  // ============================================
  // ACTIONS - SELLING
  // ============================================

  function sellFish(fishId: string, amount: number = 1): boolean {
    const fish = getFish(fishId);
    if (!fish) return false;

    const current = caughtFish.value.get(fishId) || 0;
    if (current < amount) return false;

    const totalGold = fish.sellPrice * amount;
    resourcesStore.addResource('gold', totalGold);
    
    caughtFish.value.set(fishId, current - amount);
    if (caughtFish.value.get(fishId) === 0) {
      caughtFish.value.delete(fishId);
    }

    totalGoldEarned.value += totalGold;

    gameStore.addNotification({
      type: 'success',
      title: 'Sprzedano!',
      message: `${amount}x ${fish.name} za ${totalGold}g`,
      icon: 'mdi-currency-usd',
      duration: 2000,
    });

    return true;
  }

  function sellAllFish(): boolean {
    if (caughtFish.value.size === 0) return false;

    let totalGold = 0;
    for (const [fishId, amount] of caughtFish.value) {
      const fish = getFish(fishId);
      if (fish) {
        totalGold += fish.sellPrice * amount;
      }
    }

    resourcesStore.addResource('gold', totalGold);
    caughtFish.value.clear();
    totalGoldEarned.value += totalGold;

    gameStore.addNotification({
      type: 'success',
      title: 'Sprzedano wszystko!',
      message: `Zarobiono ${totalGold}g`,
      icon: 'mdi-currency-usd',
    });

    return true;
  }

  // ============================================
  // ACTIONS - GAME LOOP
  // ============================================

  function processTick() {
    if (activeFishing.value) {
      activeFishing.value.ticksRemaining--;
      if (activeFishing.value.ticksRemaining <= 0) {
        completeFishing();
      }
    }
  }

  // ============================================
  // SAVE/LOAD
  // ============================================

  function getState() {
    return {
      progress: progress.value,
      equippedRod: equippedRod.value,
      ownedRods: Array.from(ownedRods.value),
      rodDurability: Array.from(rodDurability.value.entries()),
      equippedBait: equippedBait.value,
      baitInventory: Array.from(baitInventory.value.entries()),
      currentSpot: currentSpot.value,
      caughtFish: Array.from(caughtFish.value.entries()),
      fishCollection: Array.from(fishCollection.value),
      fishRecords: Array.from(fishRecords.value.entries()),
      totalFishCaught: totalFishCaught.value,
      totalGoldEarned: totalGoldEarned.value,
      legendaryFishCaught: legendaryFishCaught.value,
    };
  }

  function loadState(state: ReturnType<typeof getState>) {
    if (state.progress) progress.value = state.progress;
    if (state.equippedRod !== undefined) equippedRod.value = state.equippedRod;
    if (state.ownedRods) ownedRods.value = new Set(state.ownedRods);
    if (state.rodDurability) rodDurability.value = new Map(state.rodDurability);
    if (state.equippedBait !== undefined) equippedBait.value = state.equippedBait;
    if (state.baitInventory) baitInventory.value = new Map(state.baitInventory);
    if (state.currentSpot !== undefined) currentSpot.value = state.currentSpot;
    if (state.caughtFish) caughtFish.value = new Map(state.caughtFish);
    if (state.fishCollection) fishCollection.value = new Set(state.fishCollection);
    if (state.fishRecords) fishRecords.value = new Map(state.fishRecords);
    if (state.totalFishCaught !== undefined) totalFishCaught.value = state.totalFishCaught;
    if (state.totalGoldEarned !== undefined) totalGoldEarned.value = state.totalGoldEarned;
    if (state.legendaryFishCaught !== undefined) legendaryFishCaught.value = state.legendaryFishCaught;
  }

  function resetFisherman() {
    progress.value = { level: 1, xp: 0, xpToNextLevel: 100, totalXp: 0 };
    equippedRod.value = 'wooden_rod';
    ownedRods.value = new Set(['wooden_rod']);
    rodDurability.value = new Map([['wooden_rod', 100]]);
    equippedBait.value = null;
    baitInventory.value = new Map();
    activeFishing.value = null;
    currentSpot.value = null;
    caughtFish.value = new Map();
    fishCollection.value = new Set();
    fishRecords.value = new Map();
    totalFishCaught.value = 0;
    totalGoldEarned.value = 0;
    legendaryFishCaught.value = 0;
  }

  // ============================================
  // DEV HELPERS
  // ============================================

  function devAddXp(amount: number) {
    addXp(amount);
  }

  function devUnlockAllRods() {
    for (const rodId of Object.keys(FISHING_RODS)) {
      ownedRods.value.add(rodId);
      const rod = getRod(rodId);
      if (rod) {
        rodDurability.value.set(rodId, rod.durability);
      }
    }
  }

  function devAddAllFish() {
    for (const fishId of Object.keys(FISH)) {
      caughtFish.value.set(fishId, 10);
      fishCollection.value.add(fishId);
    }
  }

  function devAddBaits() {
    for (const baitId of Object.keys(BAITS)) {
      baitInventory.value.set(baitId, 100);
    }
  }

  return {
    // State
    progress,
    equippedRod,
    ownedRods,
    rodDurability,
    equippedBait,
    baitInventory,
    activeFishing,
    currentSpot,
    caughtFish,
    fishCollection,
    fishRecords,
    totalFishCaught,
    totalGoldEarned,
    legendaryFishCaught,

    // Computed
    isFishing,
    fishingProgress,
    currentRod,
    currentBait,
    availableSpots,
    totalFishValue,
    collectionProgress,

    // XP
    addXp,
    getXpProgress,

    // Equipment
    buyRod,
    equipRod,
    repairRod,
    buyBait,
    equipBait,

    // Fishing
    canFish,
    startFishing,
    cancelFishing,

    // Selling
    sellFish,
    sellAllFish,

    // Game Loop
    processTick,

    // Save/Load
    getState,
    loadState,
    resetFisherman,

    // Dev
    devAddXp,
    devUnlockAllRods,
    devAddAllFish,
    devAddBaits,
  };
}, {
  persist: {
    key: 'ateria-fisherman',
    serializer: {
      serialize: (state) => {
        return JSON.stringify({
          ...state,
          ownedRods: Array.from(state.ownedRods || []),
          rodDurability: Array.from(state.rodDurability?.entries?.() || []),
          baitInventory: Array.from(state.baitInventory?.entries?.() || []),
          caughtFish: Array.from(state.caughtFish?.entries?.() || []),
          fishCollection: Array.from(state.fishCollection || []),
          fishRecords: Array.from(state.fishRecords?.entries?.() || []),
        });
      },
      deserialize: (value) => {
        const parsed = JSON.parse(value);
        return {
          ...parsed,
          ownedRods: new Set(parsed.ownedRods || []),
          rodDurability: new Map(parsed.rodDurability || []),
          baitInventory: new Map(parsed.baitInventory || []),
          caughtFish: new Map(parsed.caughtFish || []),
          fishCollection: new Set(parsed.fishCollection || []),
          fishRecords: new Map(parsed.fishRecords || []),
        };
      },
    },
  },
});
