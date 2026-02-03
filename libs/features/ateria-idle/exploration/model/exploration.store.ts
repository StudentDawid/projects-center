/**
 * Exploration Store - World Map, Travel, Discoveries
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAteriaGameStore } from '../../core/model/game.store';
import { useAteriaResourcesStore } from '../../core/model/resources.store';
import { useAteriaWarriorStore } from '../../warrior/model/warrior.store';
import {
  WORLD_REGIONS, POINTS_OF_INTEREST, TRAVEL_EVENTS, EXPEDITIONS,
  getRegion, getPOI, getRegionPOIs, getUnlockedRegions, getRandomEvent, getAllRegionIds,
  type RegionId, type PointOfInterest, type TravelEvent, type Expedition, type WorldRegion
} from '../data/exploration.data';

// ============================================
// TYPES
// ============================================

export interface DiscoveredPOI {
  poiId: string;
  discoveredAt: number;
  timesVisited: number;
  lastVisit?: number;
  cooldownUntil?: number;
}

export interface ActiveTravel {
  fromRegion: RegionId;
  toRegion: RegionId;
  startTime: number;
  duration: number; // ms
  events: { event: TravelEvent; outcome?: string; resolved: boolean }[];
}

export interface ActiveExpedition {
  expeditionId: string;
  startTime: number;
  duration: number; // ms
  progress: number; // 0-100
}

export interface ExplorationStats {
  totalTravels: number;
  totalDistance: number;
  poisDiscovered: number;
  regionsExplored: number;
  eventsEncountered: number;
  treasuresFound: number;
  expeditionsCompleted: number;
}

// ============================================
// STORE
// ============================================

export const useAteriaExplorationStore = defineStore('ateria-exploration', () => {
  const gameStore = useAteriaGameStore();
  const resourcesStore = useAteriaResourcesStore();
  const warriorStore = useAteriaWarriorStore();

  // ============================================
  // STATE
  // ============================================

  // Current location
  const currentRegion = ref<RegionId>('verdant_plains');
  
  // Discovered content
  const discoveredRegions = ref<Set<RegionId>>(new Set(['verdant_plains']));
  const discoveredPOIs = ref<Map<string, DiscoveredPOI>>(new Map());
  const fogOfWar = ref<Set<string>>(new Set()); // "x,y" coordinates that are revealed
  
  // Active states
  const activeTravel = ref<ActiveTravel | null>(null);
  const activeExpedition = ref<ActiveExpedition | null>(null);
  const pendingEvent = ref<{ event: TravelEvent; outcomes: any[] } | null>(null);
  
  // Fast travel
  const unlockedFastTravel = ref<Set<RegionId>>(new Set(['verdant_plains']));
  
  // Statistics
  const stats = ref<ExplorationStats>({
    totalTravels: 0,
    totalDistance: 0,
    poisDiscovered: 0,
    regionsExplored: 1,
    eventsEncountered: 0,
    treasuresFound: 0,
    expeditionsCompleted: 0,
  });

  // ============================================
  // COMPUTED
  // ============================================

  const currentRegionData = computed(() => getRegion(currentRegion.value));

  const isTraveling = computed(() => activeTravel.value !== null);
  const isOnExpedition = computed(() => activeExpedition.value !== null);

  const travelProgress = computed(() => {
    if (!activeTravel.value) return 0;
    const elapsed = Date.now() - activeTravel.value.startTime;
    return Math.min(100, (elapsed / activeTravel.value.duration) * 100);
  });

  const expeditionProgress = computed(() => {
    if (!activeExpedition.value) return 0;
    const elapsed = Date.now() - activeExpedition.value.startTime;
    return Math.min(100, (elapsed / activeExpedition.value.duration) * 100);
  });

  const availableRegions = computed(() => {
    const level = warriorStore.stats.level;
    return getUnlockedRegions(level);
  });

  const currentRegionPOIs = computed(() => {
    return getRegionPOIs(currentRegion.value);
  });

  const discoveredPOIsInRegion = computed(() => {
    return currentRegionPOIs.value.filter(poi => discoveredPOIs.value.has(poi.id));
  });

  const connectedRegions = computed(() => {
    const current = currentRegionData.value;
    if (!current) return [];
    return current.connectedRegions
      .map(id => getRegion(id))
      .filter((r): r is WorldRegion => r !== undefined);
  });

  const canFastTravel = computed(() => {
    return !isTraveling.value && !isOnExpedition.value && unlockedFastTravel.value.size > 1;
  });

  // ============================================
  // TRAVEL ACTIONS
  // ============================================

  function canTravelTo(regionId: RegionId): { canTravel: boolean; reason?: string } {
    if (isTraveling.value) return { canTravel: false, reason: 'Już podróżujesz' };
    if (isOnExpedition.value) return { canTravel: false, reason: 'Jesteś na ekspedycji' };
    
    const region = getRegion(regionId);
    if (!region) return { canTravel: false, reason: 'Nieznany region' };
    
    // Check if connected or fast travel unlocked
    const current = currentRegionData.value;
    const isConnected = current?.connectedRegions.includes(regionId);
    const hasFastTravel = unlockedFastTravel.value.has(regionId);
    
    if (!isConnected && !hasFastTravel) {
      return { canTravel: false, reason: 'Region niedostępny' };
    }
    
    // Check level requirement
    if (region.unlockRequirement?.type === 'level') {
      const reqLevel = region.unlockRequirement.value as number;
      if (warriorStore.stats.level < reqLevel) {
        return { canTravel: false, reason: `Wymaga poziomu ${reqLevel}` };
      }
    }
    
    return { canTravel: true };
  }

  function startTravel(toRegion: RegionId): boolean {
    const check = canTravelTo(toRegion);
    if (!check.canTravel) {
      gameStore.addNotification({ type: 'warning', title: 'Nie można podróżować', message: check.reason || '', icon: 'mdi-alert' });
      return false;
    }
    
    const targetRegion = getRegion(toRegion)!;
    const isFastTravel = unlockedFastTravel.value.has(toRegion);
    const baseDuration = targetRegion.travelTime * 60 * 1000; // Convert minutes to ms
    const duration = isFastTravel ? baseDuration * 0.5 : baseDuration;
    
    activeTravel.value = {
      fromRegion: currentRegion.value,
      toRegion,
      startTime: Date.now(),
      duration,
      events: [],
    };
    
    // Generate random events based on terrain
    const terrain = targetRegion.terrain;
    const level = warriorStore.stats.level;
    const numEventRolls = Math.floor(targetRegion.dangerLevel / 2) + 1;
    
    for (let i = 0; i < numEventRolls; i++) {
      const event = getRandomEvent(terrain, level);
      if (event && event.type !== 'nothing') {
        activeTravel.value.events.push({ event, resolved: false });
      }
    }
    
    gameStore.addNotification({
      type: 'info',
      title: 'Rozpoczęto podróż',
      message: `Cel: ${targetRegion.name}`,
      icon: 'mdi-compass',
      duration: 2000,
    });
    
    return true;
  }

  function resolveEvent(eventIndex: number, outcomeId: string) {
    if (!activeTravel.value || eventIndex >= activeTravel.value.events.length) return;
    
    const eventData = activeTravel.value.events[eventIndex];
    if (eventData.resolved) return;
    
    const outcome = eventData.event.outcomes.find(o => o.id === outcomeId);
    if (!outcome) return;
    
    eventData.outcome = outcomeId;
    eventData.resolved = true;
    stats.value.eventsEncountered++;
    
    // Apply outcome
    if (outcome.rewards) {
      if (outcome.rewards.gold) {
        resourcesStore.addResource('gold', outcome.rewards.gold);
      }
      if (outcome.rewards.xp) {
        warriorStore.addXp(outcome.rewards.xp);
      }
      if (outcome.rewards.loreUnlock) {
        // Lore will be handled by codex store
      }
    }
    
    if (outcome.damage) {
      // Apply damage to warrior
      gameStore.addNotification({
        type: 'warning',
        title: 'Otrzymano obrażenia',
        message: `-${outcome.damage} HP`,
        icon: 'mdi-heart-broken',
        duration: 2000,
      });
    }
    
    pendingEvent.value = null;
    
    gameStore.addNotification({
      type: 'info',
      title: eventData.event.name,
      message: outcome.text,
      icon: eventData.event.icon,
      duration: 3000,
    });
  }

  function completeTravel() {
    if (!activeTravel.value) return;
    
    const toRegion = activeTravel.value.toRegion;
    const targetRegion = getRegion(toRegion)!;
    
    // Update current region
    currentRegion.value = toRegion;
    
    // Discover region if new
    if (!discoveredRegions.value.has(toRegion)) {
      discoveredRegions.value.add(toRegion);
      stats.value.regionsExplored++;
      
      gameStore.addNotification({
        type: 'success',
        title: 'Nowy region odkryty!',
        message: targetRegion.name,
        icon: 'mdi-map-marker-plus',
        duration: 4000,
      });
    }
    
    // Unlock fast travel
    unlockedFastTravel.value.add(toRegion);
    
    // Update stats
    stats.value.totalTravels++;
    stats.value.totalDistance += targetRegion.travelTime;
    
    // Chance to discover a POI
    const discoveryChance = 30 - targetRegion.dangerLevel * 2;
    if (Math.random() * 100 < discoveryChance) {
      const undiscoveredPOIs = getRegionPOIs(toRegion).filter(poi => !discoveredPOIs.value.has(poi.id));
      if (undiscoveredPOIs.length > 0) {
        const poi = undiscoveredPOIs[Math.floor(Math.random() * undiscoveredPOIs.length)];
        discoverPOI(poi.id);
      }
    }
    
    activeTravel.value = null;
    
    gameStore.addNotification({
      type: 'success',
      title: 'Podróż zakończona',
      message: `Dotarłeś do: ${targetRegion.name}`,
      icon: 'mdi-flag-checkered',
      duration: 3000,
    });
  }

  function cancelTravel() {
    if (!activeTravel.value) return;
    
    gameStore.addNotification({
      type: 'info',
      title: 'Podróż anulowana',
      message: 'Wracasz do poprzedniej lokacji',
      icon: 'mdi-arrow-left',
      duration: 2000,
    });
    
    activeTravel.value = null;
  }

  // ============================================
  // POI ACTIONS
  // ============================================

  function discoverPOI(poiId: string) {
    if (discoveredPOIs.value.has(poiId)) return;
    
    const poi = getPOI(poiId);
    if (!poi) return;
    
    discoveredPOIs.value.set(poiId, {
      poiId,
      discoveredAt: Date.now(),
      timesVisited: 0,
    });
    
    stats.value.poisDiscovered++;
    
    gameStore.addNotification({
      type: 'success',
      title: 'Nowe miejsce odkryte!',
      message: poi.name,
      icon: poi.icon,
      duration: 4000,
    });
  }

  function canVisitPOI(poiId: string): { canVisit: boolean; reason?: string } {
    if (isTraveling.value) return { canVisit: false, reason: 'Jesteś w podróży' };
    if (isOnExpedition.value) return { canVisit: false, reason: 'Jesteś na ekspedycji' };
    
    const poi = getPOI(poiId);
    if (!poi) return { canVisit: false, reason: 'Nieznane miejsce' };
    
    if (poi.regionId !== currentRegion.value) {
      return { canVisit: false, reason: 'Musisz być w tym regionie' };
    }
    
    if (!discoveredPOIs.value.has(poiId)) {
      return { canVisit: false, reason: 'Miejsce nieodkryte' };
    }
    
    if (warriorStore.stats.level < poi.requiredLevel) {
      return { canVisit: false, reason: `Wymaga poziomu ${poi.requiredLevel}` };
    }
    
    const discovered = discoveredPOIs.value.get(poiId)!;
    if (discovered.cooldownUntil && discovered.cooldownUntil > Date.now()) {
      const remaining = Math.ceil((discovered.cooldownUntil - Date.now()) / 60000);
      return { canVisit: false, reason: `Cooldown: ${remaining} min` };
    }
    
    if (!poi.isRepeatable && discovered.timesVisited > 0) {
      return { canVisit: false, reason: 'Już odwiedzone' };
    }
    
    return { canVisit: true };
  }

  function visitPOI(poiId: string): boolean {
    const check = canVisitPOI(poiId);
    if (!check.canVisit) {
      gameStore.addNotification({ type: 'warning', title: 'Nie można odwiedzić', message: check.reason || '', icon: 'mdi-alert' });
      return false;
    }
    
    const poi = getPOI(poiId)!;
    const discovered = discoveredPOIs.value.get(poiId)!;
    
    // Update visit data
    discovered.timesVisited++;
    discovered.lastVisit = Date.now();
    if (poi.cooldownHours) {
      discovered.cooldownUntil = Date.now() + poi.cooldownHours * 60 * 60 * 1000;
    }
    
    // Grant rewards
    if (poi.rewards.gold) {
      resourcesStore.addResource('gold', poi.rewards.gold);
    }
    if (poi.rewards.xp) {
      warriorStore.addXp(poi.rewards.xp);
    }
    
    if (poi.type === 'ruins' || poi.type === 'dungeon' || poi.type === 'cave') {
      stats.value.treasuresFound++;
    }
    
    gameStore.addNotification({
      type: 'success',
      title: `Odwiedzono: ${poi.name}`,
      message: poi.description,
      icon: poi.icon,
      duration: 4000,
    });
    
    return true;
  }

  // ============================================
  // EXPEDITION ACTIONS
  // ============================================

  function canStartExpedition(expeditionId: string): { canStart: boolean; reason?: string } {
    if (isTraveling.value) return { canStart: false, reason: 'Jesteś w podróży' };
    if (isOnExpedition.value) return { canStart: false, reason: 'Już na ekspedycji' };
    
    const expedition = EXPEDITIONS.find(e => e.id === expeditionId);
    if (!expedition) return { canStart: false, reason: 'Nieznana ekspedycja' };
    
    if (warriorStore.stats.level < expedition.requiredLevel) {
      return { canStart: false, reason: `Wymaga poziomu ${expedition.requiredLevel}` };
    }
    
    // Check required items (simplified - would need inventory check)
    
    return { canStart: true };
  }

  function startExpedition(expeditionId: string): boolean {
    const check = canStartExpedition(expeditionId);
    if (!check.canStart) {
      gameStore.addNotification({ type: 'warning', title: 'Nie można rozpocząć', message: check.reason || '', icon: 'mdi-alert' });
      return false;
    }
    
    const expedition = EXPEDITIONS.find(e => e.id === expeditionId)!;
    
    activeExpedition.value = {
      expeditionId,
      startTime: Date.now(),
      duration: expedition.duration * 60 * 1000,
      progress: 0,
    };
    
    gameStore.addNotification({
      type: 'info',
      title: 'Ekspedycja rozpoczęta',
      message: expedition.name,
      icon: 'mdi-flag',
      duration: 3000,
    });
    
    return true;
  }

  function completeExpedition() {
    if (!activeExpedition.value) return;
    
    const expedition = EXPEDITIONS.find(e => e.id === activeExpedition.value!.expeditionId);
    if (!expedition) return;
    
    // Grant rewards
    resourcesStore.addResource('gold', expedition.rewards.gold);
    warriorStore.addXp(expedition.rewards.xp);
    
    // Chance to discover something
    if (Math.random() * 100 < expedition.rewards.discoveryChance) {
      const undiscoveredPOIs = getRegionPOIs(expedition.targetRegion).filter(poi => !discoveredPOIs.value.has(poi.id));
      if (undiscoveredPOIs.length > 0) {
        const poi = undiscoveredPOIs[Math.floor(Math.random() * undiscoveredPOIs.length)];
        discoverPOI(poi.id);
      }
    }
    
    // Discover region if not discovered
    if (!discoveredRegions.value.has(expedition.targetRegion)) {
      discoveredRegions.value.add(expedition.targetRegion);
      stats.value.regionsExplored++;
    }
    
    stats.value.expeditionsCompleted++;
    
    gameStore.addNotification({
      type: 'success',
      title: 'Ekspedycja zakończona!',
      message: `${expedition.name} - Nagrody: ${expedition.rewards.gold}g, ${expedition.rewards.xp} XP`,
      icon: 'mdi-trophy',
      duration: 5000,
    });
    
    activeExpedition.value = null;
  }

  function cancelExpedition() {
    if (!activeExpedition.value) return;
    
    gameStore.addNotification({
      type: 'info',
      title: 'Ekspedycja anulowana',
      message: 'Wracasz bez nagród',
      icon: 'mdi-cancel',
      duration: 2000,
    });
    
    activeExpedition.value = null;
  }

  // ============================================
  // PROCESS TICK
  // ============================================

  function processTick() {
    // Check travel completion
    if (activeTravel.value) {
      const elapsed = Date.now() - activeTravel.value.startTime;
      if (elapsed >= activeTravel.value.duration) {
        // Check if all events are resolved
        const unresolvedEvent = activeTravel.value.events.find(e => !e.resolved);
        if (unresolvedEvent) {
          pendingEvent.value = { event: unresolvedEvent.event, outcomes: unresolvedEvent.event.outcomes };
        } else {
          completeTravel();
        }
      }
    }
    
    // Check expedition completion
    if (activeExpedition.value) {
      const elapsed = Date.now() - activeExpedition.value.startTime;
      activeExpedition.value.progress = Math.min(100, (elapsed / activeExpedition.value.duration) * 100);
      
      if (elapsed >= activeExpedition.value.duration) {
        completeExpedition();
      }
    }
  }

  // ============================================
  // SAVE/LOAD
  // ============================================

  function getState() {
    return {
      currentRegion: currentRegion.value,
      discoveredRegions: Array.from(discoveredRegions.value),
      discoveredPOIs: Array.from(discoveredPOIs.value.entries()),
      fogOfWar: Array.from(fogOfWar.value),
      unlockedFastTravel: Array.from(unlockedFastTravel.value),
      stats: stats.value,
    };
  }

  function loadState(state: ReturnType<typeof getState>) {
    if (state.currentRegion) currentRegion.value = state.currentRegion;
    if (state.discoveredRegions) discoveredRegions.value = new Set(state.discoveredRegions);
    if (state.discoveredPOIs) discoveredPOIs.value = new Map(state.discoveredPOIs);
    if (state.fogOfWar) fogOfWar.value = new Set(state.fogOfWar);
    if (state.unlockedFastTravel) unlockedFastTravel.value = new Set(state.unlockedFastTravel);
    if (state.stats) stats.value = state.stats;
  }

  function resetExploration() {
    currentRegion.value = 'verdant_plains';
    discoveredRegions.value = new Set(['verdant_plains']);
    discoveredPOIs.value = new Map();
    fogOfWar.value = new Set();
    activeTravel.value = null;
    activeExpedition.value = null;
    pendingEvent.value = null;
    unlockedFastTravel.value = new Set(['verdant_plains']);
    stats.value = {
      totalTravels: 0,
      totalDistance: 0,
      poisDiscovered: 0,
      regionsExplored: 1,
      eventsEncountered: 0,
      treasuresFound: 0,
      expeditionsCompleted: 0,
    };
  }

  return {
    // State
    currentRegion, discoveredRegions, discoveredPOIs, fogOfWar,
    activeTravel, activeExpedition, pendingEvent, unlockedFastTravel, stats,
    
    // Computed
    currentRegionData, isTraveling, isOnExpedition,
    travelProgress, expeditionProgress,
    availableRegions, currentRegionPOIs, discoveredPOIsInRegion,
    connectedRegions, canFastTravel,
    
    // Travel actions
    canTravelTo, startTravel, resolveEvent, completeTravel, cancelTravel,
    
    // POI actions
    discoverPOI, canVisitPOI, visitPOI,
    
    // Expedition actions
    canStartExpedition, startExpedition, completeExpedition, cancelExpedition,
    
    // Lifecycle
    processTick, getState, loadState, resetExploration,
  };
}, {
  persist: {
    key: 'ateria-exploration',
    serializer: {
      serialize: (state) => JSON.stringify({
        ...state,
        discoveredRegions: Array.from(state.discoveredRegions || []),
        discoveredPOIs: Array.from(state.discoveredPOIs?.entries?.() || []),
        fogOfWar: Array.from(state.fogOfWar || []),
        unlockedFastTravel: Array.from(state.unlockedFastTravel || []),
        activeTravel: null,
        activeExpedition: null,
        pendingEvent: null,
      }),
      deserialize: (value) => {
        const p = JSON.parse(value);
        return {
          ...p,
          discoveredRegions: new Set(p.discoveredRegions || ['verdant_plains']),
          discoveredPOIs: new Map(p.discoveredPOIs || []),
          fogOfWar: new Set(p.fogOfWar || []),
          unlockedFastTravel: new Set(p.unlockedFastTravel || ['verdant_plains']),
          activeTravel: null,
          activeExpedition: null,
          pendingEvent: null,
        };
      },
    },
  },
});
