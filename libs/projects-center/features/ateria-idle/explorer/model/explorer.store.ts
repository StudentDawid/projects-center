/**
 * Explorer Store - Expeditions, Discoveries, Map Exploration
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAteriaGameStore } from '../../core/model/game.store';
import { useAteriaResourcesStore } from '../../core/model/resources.store';
import {
  REGIONS,
  DISCOVERIES,
  EXPLORER_GEAR,
  EXPEDITIONS,
  DIFFICULTY_DATA,
  getRegion,
  getDiscovery,
  getGear,
  getExpedition,
  getAvailableRegions,
  calculateExplorerXpToLevel,
  type Region,
  type Discovery,
  type ExplorerGear,
  type Expedition,
  type ExplorerProgress,
} from '../data/explorer.data';

// ============================================
// TYPES
// ============================================

export interface ActiveExploration {
  regionId: string;
  startTime: number;
  ticksRemaining: number;
  totalTicks: number;
}

export interface ActiveExpedition {
  expeditionId: string;
  startTime: number;
  ticksRemaining: number;
  totalTicks: number;
}

// ============================================
// STORE
// ============================================

export const useAteriaExplorerStore = defineStore('ateria-explorer', () => {
  const gameStore = useAteriaGameStore();
  const resourcesStore = useAteriaResourcesStore();

  // ============================================
  // STATE
  // ============================================

  const progress = ref<ExplorerProgress>({
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    totalXp: 0,
  });

  // Equipment
  const ownedGear = ref<Set<string>>(new Set(['basic_pack']));
  const equippedGear = ref<Set<string>>(new Set(['basic_pack']));

  // Exploration
  const activeExploration = ref<ActiveExploration | null>(null);
  const regionProgress = ref<Map<string, number>>(new Map()); // Discovery count per region
  const discoveries = ref<Set<string>>(new Set());

  // Expeditions
  const activeExpedition = ref<ActiveExpedition | null>(null);
  const completedExpeditions = ref<Set<string>>(new Set());

  // Lore
  const unlockedLore = ref<Set<string>>(new Set());

  // Stats
  const totalExplorations = ref(0);
  const totalExpeditions = ref(0);
  const totalGoldFound = ref(0);

  // ============================================
  // COMPUTED
  // ============================================

  const isExploring = computed(() => activeExploration.value !== null);
  const isOnExpedition = computed(() => activeExpedition.value !== null);

  const explorationProgress = computed(() => {
    if (!activeExploration.value) return 0;
    const total = activeExploration.value.totalTicks;
    const remaining = activeExploration.value.ticksRemaining;
    return ((total - remaining) / total) * 100;
  });

  const expeditionProgress = computed(() => {
    if (!activeExpedition.value) return 0;
    const total = activeExpedition.value.totalTicks;
    const remaining = activeExpedition.value.ticksRemaining;
    return ((total - remaining) / total) * 100;
  });

  const availableRegions = computed(() => getAvailableRegions(progress.value.level));

  const totalExploreSpeedBonus = computed(() => {
    let bonus = 0;
    for (const gearId of equippedGear.value) {
      const gear = getGear(gearId);
      if (gear) bonus += gear.exploreSpeedBonus;
    }
    return bonus;
  });

  const totalDiscoveryBonus = computed(() => {
    let bonus = 0;
    for (const gearId of equippedGear.value) {
      const gear = getGear(gearId);
      if (gear) bonus += gear.discoveryChanceBonus;
    }
    return bonus;
  });

  const totalDiscoveriesCount = computed(() => discoveries.value.size);
  const totalDiscoveriesAvailable = computed(() => Object.keys(DISCOVERIES).length);

  // ============================================
  // ACTIONS - XP & LEVELING
  // ============================================

  function addXp(amount: number) {
    progress.value.xp += amount;
    progress.value.totalXp += amount;

    while (progress.value.xp >= progress.value.xpToNextLevel) {
      progress.value.xp -= progress.value.xpToNextLevel;
      progress.value.level++;
      progress.value.xpToNextLevel = calculateExplorerXpToLevel(progress.value.level);

      gameStore.addNotification({
        type: 'success',
        title: `Odkrywca - Poziom ${progress.value.level}!`,
        message: 'Nowe regiony dostępne!',
        icon: 'mdi-compass',
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

  function buyGear(gearId: string): boolean {
    const gear = getGear(gearId);
    if (!gear) return false;
    if (ownedGear.value.has(gearId)) return false;
    if (gear.requiredLevel > progress.value.level) return false;
    if (!resourcesStore.hasAmount('gold', gear.cost)) return false;

    resourcesStore.removeResource('gold', gear.cost);
    ownedGear.value.add(gearId);

    gameStore.addNotification({
      type: 'success',
      title: 'Kupiono sprzęt!',
      message: gear.name,
      icon: gear.icon,
      duration: 2000,
    });

    return true;
  }

  function equipGear(gearId: string): boolean {
    if (!ownedGear.value.has(gearId)) return false;
    equippedGear.value.add(gearId);
    return true;
  }

  function unequipGear(gearId: string): boolean {
    equippedGear.value.delete(gearId);
    return true;
  }

  function hasRequiredGear(regionId: string): boolean {
    const region = getRegion(regionId);
    if (!region || !region.requiredGear) return true;
    return region.requiredGear.every(gearId => equippedGear.value.has(gearId));
  }

  // ============================================
  // ACTIONS - EXPLORATION
  // ============================================

  function canExplore(regionId: string): { canExplore: boolean; reason?: string } {
    const region = getRegion(regionId);
    if (!region) return { canExplore: false, reason: 'Nieznany region' };

    if (isExploring.value || isOnExpedition.value) {
      return { canExplore: false, reason: 'Już eksplorujesz' };
    }

    if (region.requiredLevel > progress.value.level) {
      return { canExplore: false, reason: `Wymaga poziomu ${region.requiredLevel}` };
    }

    if (!hasRequiredGear(regionId)) {
      return { canExplore: false, reason: 'Brak wymaganego sprzętu' };
    }

    return { canExplore: true };
  }

  function startExploration(regionId: string): boolean {
    const check = canExplore(regionId);
    if (!check.canExplore) {
      gameStore.addNotification({
        type: 'warning',
        title: 'Nie można eksplorować',
        message: check.reason || 'Nieznany błąd',
        icon: 'mdi-alert',
      });
      return false;
    }

    const region = getRegion(regionId)!;
    const exploreTime = Math.floor(region.baseExploreTime * (1 - totalExploreSpeedBonus.value / 100));

    activeExploration.value = {
      regionId,
      startTime: Date.now(),
      ticksRemaining: exploreTime,
      totalTicks: exploreTime,
    };

    return true;
  }

  function cancelExploration() {
    activeExploration.value = null;
  }

  function completeExploration() {
    if (!activeExploration.value) return;

    const region = getRegion(activeExploration.value.regionId);
    if (!region) {
      activeExploration.value = null;
      return;
    }

    // XP
    addXp(region.xpPerExplore);

    // Gold
    const goldMin = region.goldRange[0];
    const goldMax = region.goldRange[1];
    const gold = Math.floor(Math.random() * (goldMax - goldMin + 1)) + goldMin;
    resourcesStore.addResource('gold', gold);
    totalGoldFound.value += gold;

    // Try to discover something
    const discoveryChance = 30 + totalDiscoveryBonus.value;
    if (Math.random() * 100 < discoveryChance) {
      const undiscoveredInRegion = region.possibleDiscoveries.filter(d => !discoveries.value.has(d));
      if (undiscoveredInRegion.length > 0) {
        const discoveryId = undiscoveredInRegion[Math.floor(Math.random() * undiscoveredInRegion.length)];
        makeDiscovery(discoveryId);
      }
    }

    // Update region progress
    const currentProgress = regionProgress.value.get(region.id) || 0;
    regionProgress.value.set(region.id, currentProgress + 1);

    totalExplorations.value++;

    gameStore.addNotification({
      type: 'success',
      title: 'Eksploracja zakończona!',
      message: `${region.name}: +${gold}g`,
      icon: 'mdi-compass',
      duration: 2000,
    });

    activeExploration.value = null;
  }

  function makeDiscovery(discoveryId: string) {
    if (discoveries.value.has(discoveryId)) return;

    const discovery = getDiscovery(discoveryId);
    if (!discovery) return;

    discoveries.value.add(discoveryId);
    addXp(discovery.xpReward);

    if (discovery.goldReward) {
      resourcesStore.addResource('gold', discovery.goldReward);
      totalGoldFound.value += discovery.goldReward;
    }

    if (discovery.loreUnlock) {
      unlockedLore.value.add(discovery.loreUnlock);
    }

    gameStore.addNotification({
      type: 'success',
      title: 'Nowe odkrycie!',
      message: discovery.name,
      icon: discovery.icon,
      duration: 3000,
    });
  }

  // ============================================
  // ACTIONS - EXPEDITIONS
  // ============================================

  function canStartExpedition(expeditionId: string): { canStart: boolean; reason?: string } {
    const expedition = getExpedition(expeditionId);
    if (!expedition) return { canStart: false, reason: 'Nieznana wyprawa' };

    if (isExploring.value || isOnExpedition.value) {
      return { canStart: false, reason: 'Już jesteś na wyprawie' };
    }

    if (expedition.requiredLevel > progress.value.level) {
      return { canStart: false, reason: `Wymaga poziomu ${expedition.requiredLevel}` };
    }

    const regionDiscoveries = regionProgress.value.get(expedition.regionId) || 0;
    if (regionDiscoveries < expedition.requiredDiscoveries) {
      return { canStart: false, reason: `Wymaga ${expedition.requiredDiscoveries} eksploracji regionu` };
    }

    if (!resourcesStore.hasAmount('gold', expedition.supplyCost)) {
      return { canStart: false, reason: `Brak złota (${expedition.supplyCost})` };
    }

    return { canStart: true };
  }

  function startExpedition(expeditionId: string): boolean {
    const check = canStartExpedition(expeditionId);
    if (!check.canStart) {
      gameStore.addNotification({
        type: 'warning',
        title: 'Nie można rozpocząć wyprawy',
        message: check.reason || 'Nieznany błąd',
        icon: 'mdi-alert',
      });
      return false;
    }

    const expedition = getExpedition(expeditionId)!;
    resourcesStore.removeResource('gold', expedition.supplyCost);

    activeExpedition.value = {
      expeditionId,
      startTime: Date.now(),
      ticksRemaining: expedition.duration,
      totalTicks: expedition.duration,
    };

    return true;
  }

  function cancelExpedition() {
    activeExpedition.value = null;
  }

  function completeExpedition() {
    if (!activeExpedition.value) return;

    const expedition = getExpedition(activeExpedition.value.expeditionId);
    if (!expedition) {
      activeExpedition.value = null;
      return;
    }

    // Check for success (based on difficulty risk)
    const difficultyData = DIFFICULTY_DATA[expedition.difficulty];
    const successChance = 100 - difficultyData.riskPercent;
    const isSuccess = Math.random() * 100 < successChance;

    if (isSuccess) {
      // XP and Gold
      addXp(expedition.xpReward);
      resourcesStore.addResource('gold', expedition.goldReward);
      totalGoldFound.value += expedition.goldReward;

      // Guaranteed discoveries
      for (const discoveryId of expedition.guaranteedDiscoveries) {
        makeDiscovery(discoveryId);
      }

      // Possible rewards
      if (expedition.possibleRewards.length > 0 && Math.random() < 0.5) {
        const bonusDiscovery = expedition.possibleRewards[Math.floor(Math.random() * expedition.possibleRewards.length)];
        makeDiscovery(bonusDiscovery);
      }

      completedExpeditions.value.add(expedition.id);

      gameStore.addNotification({
        type: 'success',
        title: 'Wyprawa zakończona sukcesem!',
        message: `${expedition.name}: +${expedition.xpReward}XP, +${expedition.goldReward}g`,
        icon: 'mdi-flag-checkered',
        duration: 4000,
      });
    } else {
      // Failed - partial rewards
      addXp(Math.floor(expedition.xpReward * 0.3));

      gameStore.addNotification({
        type: 'warning',
        title: 'Wyprawa niepowodzenie',
        message: `${expedition.name} - powrót z częściowymi łupami`,
        icon: 'mdi-alert',
        duration: 4000,
      });
    }

    totalExpeditions.value++;
    activeExpedition.value = null;
  }

  // ============================================
  // ACTIONS - GAME LOOP
  // ============================================

  function processTick() {
    // Exploration progress
    if (activeExploration.value) {
      activeExploration.value.ticksRemaining--;
      if (activeExploration.value.ticksRemaining <= 0) {
        completeExploration();
      }
    }

    // Expedition progress
    if (activeExpedition.value) {
      activeExpedition.value.ticksRemaining--;
      if (activeExpedition.value.ticksRemaining <= 0) {
        completeExpedition();
      }
    }
  }

  // ============================================
  // SAVE/LOAD
  // ============================================

  function getState() {
    return {
      progress: progress.value,
      ownedGear: Array.from(ownedGear.value),
      equippedGear: Array.from(equippedGear.value),
      regionProgress: Array.from(regionProgress.value.entries()),
      discoveries: Array.from(discoveries.value),
      completedExpeditions: Array.from(completedExpeditions.value),
      unlockedLore: Array.from(unlockedLore.value),
      totalExplorations: totalExplorations.value,
      totalExpeditions: totalExpeditions.value,
      totalGoldFound: totalGoldFound.value,
    };
  }

  function loadState(state: ReturnType<typeof getState>) {
    if (state.progress) progress.value = state.progress;
    if (state.ownedGear) ownedGear.value = new Set(state.ownedGear);
    if (state.equippedGear) equippedGear.value = new Set(state.equippedGear);
    if (state.regionProgress) regionProgress.value = new Map(state.regionProgress);
    if (state.discoveries) discoveries.value = new Set(state.discoveries);
    if (state.completedExpeditions) completedExpeditions.value = new Set(state.completedExpeditions);
    if (state.unlockedLore) unlockedLore.value = new Set(state.unlockedLore);
    if (state.totalExplorations !== undefined) totalExplorations.value = state.totalExplorations;
    if (state.totalExpeditions !== undefined) totalExpeditions.value = state.totalExpeditions;
    if (state.totalGoldFound !== undefined) totalGoldFound.value = state.totalGoldFound;
  }

  function resetExplorer() {
    progress.value = { level: 1, xp: 0, xpToNextLevel: 100, totalXp: 0 };
    ownedGear.value = new Set(['basic_pack']);
    equippedGear.value = new Set(['basic_pack']);
    activeExploration.value = null;
    regionProgress.value = new Map();
    discoveries.value = new Set();
    activeExpedition.value = null;
    completedExpeditions.value = new Set();
    unlockedLore.value = new Set();
    totalExplorations.value = 0;
    totalExpeditions.value = 0;
    totalGoldFound.value = 0;
  }

  // ============================================
  // DEV HELPERS
  // ============================================

  function devAddXp(amount: number) {
    addXp(amount);
  }

  function devUnlockAllGear() {
    for (const gearId of Object.keys(EXPLORER_GEAR)) {
      ownedGear.value.add(gearId);
    }
  }

  function devDiscoverAll() {
    for (const discoveryId of Object.keys(DISCOVERIES)) {
      discoveries.value.add(discoveryId);
    }
    for (const regionId of Object.keys(REGIONS)) {
      regionProgress.value.set(regionId, 100);
    }
  }

  return {
    // State
    progress,
    ownedGear,
    equippedGear,
    activeExploration,
    regionProgress,
    discoveries,
    activeExpedition,
    completedExpeditions,
    unlockedLore,
    totalExplorations,
    totalExpeditions,
    totalGoldFound,

    // Computed
    isExploring,
    isOnExpedition,
    explorationProgress,
    expeditionProgress,
    availableRegions,
    totalExploreSpeedBonus,
    totalDiscoveryBonus,
    totalDiscoveriesCount,
    totalDiscoveriesAvailable,

    // XP
    addXp,
    getXpProgress,

    // Equipment
    buyGear,
    equipGear,
    unequipGear,
    hasRequiredGear,

    // Exploration
    canExplore,
    startExploration,
    cancelExploration,

    // Expeditions
    canStartExpedition,
    startExpedition,
    cancelExpedition,

    // Game Loop
    processTick,

    // Save/Load
    getState,
    loadState,
    resetExplorer,

    // Dev
    devAddXp,
    devUnlockAllGear,
    devDiscoverAll,
  };
}, {
  persist: {
    key: 'ateria-explorer',
    serializer: {
      serialize: (state) => {
        return JSON.stringify({
          ...state,
          ownedGear: Array.from(state.ownedGear || []),
          equippedGear: Array.from(state.equippedGear || []),
          regionProgress: Array.from(state.regionProgress?.entries?.() || []),
          discoveries: Array.from(state.discoveries || []),
          completedExpeditions: Array.from(state.completedExpeditions || []),
          unlockedLore: Array.from(state.unlockedLore || []),
        });
      },
      deserialize: (value) => {
        const parsed = JSON.parse(value);
        return {
          ...parsed,
          ownedGear: new Set(parsed.ownedGear || []),
          equippedGear: new Set(parsed.equippedGear || []),
          regionProgress: new Map(parsed.regionProgress || []),
          discoveries: new Set(parsed.discoveries || []),
          completedExpeditions: new Set(parsed.completedExpeditions || []),
          unlockedLore: new Set(parsed.unlockedLore || []),
        };
      },
    },
  },
});
