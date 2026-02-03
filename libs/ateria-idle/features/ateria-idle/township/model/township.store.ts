/**
 * Township Store - Settlement Management, Buildings, Population
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAteriaGameStore } from '../../core/model/game.store';
import { useAteriaResourcesStore } from '../../core/model/resources.store';
import {
  TOWNSHIP_BUILDINGS, TOWNSHIP_EVENTS, getBuilding, calculateBuildingCost, calculateTownshipXpToLevel,
  type TownshipBuilding, type TownshipProgress, type BuildingCategory, type TownshipEvent
} from '../data/township.data';

export interface BuiltBuilding {
  buildingId: string;
  level: number;
  builtAt: number;
}

export interface ActiveConstruction {
  buildingId: string;
  targetLevel: number;
  startTime: number;
  ticksRemaining: number;
  totalTicks: number;
}

export interface ActiveEvent {
  eventId: string;
  startTime: number;
  ticksRemaining: number;
}

export const useAteriaTownshipStore = defineStore('ateria-township', () => {
  const gameStore = useAteriaGameStore();
  const resourcesStore = useAteriaResourcesStore();

  const progress = ref<TownshipProgress>({ level: 1, xp: 0, xpToNextLevel: 200, totalXp: 0 });
  
  const builtBuildings = ref<Map<string, BuiltBuilding>>(new Map());
  const activeConstruction = ref<ActiveConstruction | null>(null);
  const activeEvents = ref<ActiveEvent[]>([]);
  
  // Township stats
  const population = ref(10);
  const maxPopulation = ref(20);
  const happiness = ref(50);
  const defense = ref(0);
  
  // Resources production (per tick)
  const resourceProduction = ref<Map<string, number>>(new Map());
  
  // Accumulated resources
  const townshipResources = ref<Map<string, number>>(new Map([
    ['wood', 100],
    ['stone', 50],
    ['food', 200],
    ['ore', 0],
  ]));

  const isConstructing = computed(() => activeConstruction.value !== null);
  const constructionProgress = computed(() => {
    if (!activeConstruction.value) return 0;
    return ((activeConstruction.value.totalTicks - activeConstruction.value.ticksRemaining) / activeConstruction.value.totalTicks) * 100;
  });
  
  const totalBuildingsBuilt = computed(() => builtBuildings.value.size);
  const totalBuildingLevels = computed(() => {
    let total = 0;
    for (const [, built] of builtBuildings.value) {
      total += built.level;
    }
    return total;
  });

  // Calculate all bonuses from buildings
  const globalBonuses = computed(() => {
    const bonuses: Record<string, Record<string, number>> = {};
    
    for (const [buildingId, built] of builtBuildings.value) {
      const building = getBuilding(buildingId);
      if (!building) continue;
      
      // Base effects
      for (const effect of building.effects) {
        if (effect.type === 'bonus' && effect.target && effect.stat) {
          if (!bonuses[effect.target]) bonuses[effect.target] = {};
          bonuses[effect.target][effect.stat] = (bonuses[effect.target][effect.stat] || 0) + effect.value;
        }
      }
      
      // Upgrade effects (per level above 1)
      if (built.level > 1) {
        for (const effect of building.upgradeEffects) {
          if (effect.type === 'bonus' && effect.target && effect.stat) {
            if (!bonuses[effect.target]) bonuses[effect.target] = {};
            bonuses[effect.target][effect.stat] = (bonuses[effect.target][effect.stat] || 0) + (effect.value * (built.level - 1));
          }
        }
      }
    }
    
    return bonuses;
  });

  function addXp(amount: number) {
    progress.value.xp += amount;
    progress.value.totalXp += amount;
    while (progress.value.xp >= progress.value.xpToNextLevel) {
      progress.value.xp -= progress.value.xpToNextLevel;
      progress.value.level++;
      progress.value.xpToNextLevel = calculateTownshipXpToLevel(progress.value.level);
      maxPopulation.value += 10;
      gameStore.addNotification({ type: 'success', title: `Osada - Poziom ${progress.value.level}!`, message: '+10 max populacji', icon: 'mdi-home-city', duration: 3000 });
    }
  }

  function getXpProgress(): number { return (progress.value.xp / progress.value.xpToNextLevel) * 100; }

  function getBuildingLevel(buildingId: string): number {
    return builtBuildings.value.get(buildingId)?.level || 0;
  }

  function canBuild(buildingId: string): { canBuild: boolean; reason?: string } {
    const building = getBuilding(buildingId);
    if (!building) return { canBuild: false, reason: 'Nieznany budynek' };
    if (isConstructing.value) return { canBuild: false, reason: 'Trwa budowa' };
    
    const currentLevel = getBuildingLevel(buildingId);
    if (currentLevel >= building.maxLevel) return { canBuild: false, reason: 'Maksymalny poziom' };
    
    const cost = calculateBuildingCost(building, currentLevel);
    if (!resourcesStore.hasAmount('gold', cost)) return { canBuild: false, reason: `Potrzeba ${cost} złota` };
    
    // Check requirements
    for (const req of building.requirements) {
      if (req.type === 'building' && req.buildingId) {
        const reqLevel = getBuildingLevel(req.buildingId);
        if (reqLevel < req.value) {
          const reqBuilding = getBuilding(req.buildingId);
          return { canBuild: false, reason: `Wymaga ${reqBuilding?.name} Lvl ${req.value}` };
        }
      }
      if (req.type === 'gold' && !resourcesStore.hasAmount('gold', req.value)) {
        return { canBuild: false, reason: `Wymaga ${req.value} złota` };
      }
      // Level requirements would need integration with other stores
    }
    
    return { canBuild: true };
  }

  function startConstruction(buildingId: string): boolean {
    const check = canBuild(buildingId);
    if (!check.canBuild) {
      gameStore.addNotification({ type: 'warning', title: 'Nie można budować', message: check.reason || '', icon: 'mdi-alert' });
      return false;
    }
    
    const building = getBuilding(buildingId)!;
    const currentLevel = getBuildingLevel(buildingId);
    const cost = calculateBuildingCost(building, currentLevel);
    
    resourcesStore.removeResource('gold', cost);
    
    const buildTime = Math.floor(building.buildTime * Math.pow(1.2, currentLevel));
    activeConstruction.value = {
      buildingId,
      targetLevel: currentLevel + 1,
      startTime: Date.now(),
      ticksRemaining: buildTime,
      totalTicks: buildTime,
    };
    
    return true;
  }

  function cancelConstruction() {
    if (!activeConstruction.value) return;
    // Refund 50% of cost
    const building = getBuilding(activeConstruction.value.buildingId);
    if (building) {
      const cost = calculateBuildingCost(building, activeConstruction.value.targetLevel - 1);
      resourcesStore.addResource('gold', Math.floor(cost * 0.5));
    }
    activeConstruction.value = null;
  }

  function completeConstruction() {
    if (!activeConstruction.value) return;
    
    const building = getBuilding(activeConstruction.value.buildingId);
    if (!building) {
      activeConstruction.value = null;
      return;
    }
    
    const existing = builtBuildings.value.get(building.id);
    if (existing) {
      existing.level = activeConstruction.value.targetLevel;
    } else {
      builtBuildings.value.set(building.id, {
        buildingId: building.id,
        level: 1,
        builtAt: Date.now(),
      });
    }
    
    // Apply immediate effects
    recalculateStats();
    
    const xpGain = building.tier * 20 * activeConstruction.value.targetLevel;
    addXp(xpGain);
    
    gameStore.addNotification({
      type: 'success',
      title: activeConstruction.value.targetLevel === 1 ? 'Budynek ukończony!' : 'Ulepszenie ukończone!',
      message: `${building.name} Lvl ${activeConstruction.value.targetLevel}`,
      icon: building.icon,
      duration: 3000,
    });
    
    activeConstruction.value = null;
  }

  function recalculateStats() {
    let totalPop = 10;
    let totalMaxPop = 20 + progress.value.level * 10;
    let totalHappiness = 50;
    let totalDefense = 0;
    const production = new Map<string, number>();
    
    for (const [buildingId, built] of builtBuildings.value) {
      const building = getBuilding(buildingId);
      if (!building) continue;
      
      for (const effect of building.effects) {
        if (effect.type === 'population') totalMaxPop += effect.value;
        if (effect.type === 'happiness') totalHappiness += effect.value;
        if (effect.type === 'defense') totalDefense += effect.value;
        if (effect.type === 'production' && effect.target) {
          production.set(effect.target, (production.get(effect.target) || 0) + effect.value);
        }
      }
      
      // Upgrade effects
      if (built.level > 1) {
        for (const effect of building.upgradeEffects) {
          if (effect.type === 'population') totalMaxPop += effect.value * (built.level - 1);
          if (effect.type === 'happiness') totalHappiness += effect.value * (built.level - 1);
          if (effect.type === 'defense') totalDefense += effect.value * (built.level - 1);
          if (effect.type === 'production' && effect.target) {
            production.set(effect.target, (production.get(effect.target) || 0) + (effect.value * (built.level - 1)));
          }
        }
      }
    }
    
    maxPopulation.value = totalMaxPop;
    population.value = Math.min(population.value, maxPopulation.value);
    happiness.value = Math.max(0, Math.min(100, totalHappiness));
    defense.value = totalDefense;
    resourceProduction.value = production;
  }

  function processProduction() {
    // Process resource production every 60 ticks (6 seconds = 1 game minute)
    for (const [resource, amount] of resourceProduction.value) {
      if (resource === 'gold') {
        resourcesStore.addResource('gold', amount / 60);
      } else {
        const current = townshipResources.value.get(resource) || 0;
        townshipResources.value.set(resource, current + amount / 60);
      }
    }
  }

  function processEvents() {
    // Update active events
    activeEvents.value = activeEvents.value.filter(e => {
      e.ticksRemaining--;
      return e.ticksRemaining > 0;
    });
    
    // Random event chance (very low per tick)
    if (Math.random() < 0.0001) {
      const events = Object.values(TOWNSHIP_EVENTS);
      for (const event of events) {
        if (Math.random() < event.chance && !activeEvents.value.find(e => e.eventId === event.id)) {
          activeEvents.value.push({
            eventId: event.id,
            startTime: Date.now(),
            ticksRemaining: event.duration,
          });
          gameStore.addNotification({
            type: event.type === 'positive' ? 'success' : event.type === 'negative' ? 'warning' : 'info',
            title: event.name,
            message: event.description,
            icon: event.icon,
            duration: 4000,
          });
          break;
        }
      }
    }
  }

  function processTick() {
    if (activeConstruction.value) {
      activeConstruction.value.ticksRemaining--;
      if (activeConstruction.value.ticksRemaining <= 0) {
        completeConstruction();
      }
    }
    
    processProduction();
    processEvents();
    
    // Population growth (very slow)
    if (population.value < maxPopulation.value && happiness.value > 60 && Math.random() < 0.001) {
      population.value++;
    }
  }

  function collectResource(resource: string): boolean {
    const amount = townshipResources.value.get(resource) || 0;
    if (amount < 1) return false;
    
    const collected = Math.floor(amount);
    townshipResources.value.set(resource, amount - collected);
    
    // Convert to game resources or store
    if (resource === 'gold') {
      resourcesStore.addResource('gold', collected);
    }
    
    gameStore.addNotification({
      type: 'success',
      title: 'Zebrano zasoby',
      message: `+${collected} ${resource}`,
      icon: 'mdi-package-variant',
      duration: 2000,
    });
    
    return true;
  }

  function getBonus(target: string, stat: string): number {
    return globalBonuses.value[target]?.[stat] || 0;
  }

  function getState() {
    return {
      progress: progress.value,
      builtBuildings: Array.from(builtBuildings.value.entries()),
      population: population.value,
      maxPopulation: maxPopulation.value,
      happiness: happiness.value,
      defense: defense.value,
      townshipResources: Array.from(townshipResources.value.entries()),
    };
  }

  function loadState(state: ReturnType<typeof getState>) {
    if (state.progress) progress.value = state.progress;
    if (state.builtBuildings) {
      builtBuildings.value = new Map(state.builtBuildings);
      recalculateStats();
    }
    if (state.population !== undefined) population.value = state.population;
    if (state.maxPopulation !== undefined) maxPopulation.value = state.maxPopulation;
    if (state.happiness !== undefined) happiness.value = state.happiness;
    if (state.defense !== undefined) defense.value = state.defense;
    if (state.townshipResources) townshipResources.value = new Map(state.townshipResources);
  }

  function resetTownship() {
    progress.value = { level: 1, xp: 0, xpToNextLevel: 200, totalXp: 0 };
    builtBuildings.value = new Map();
    activeConstruction.value = null;
    activeEvents.value = [];
    population.value = 10;
    maxPopulation.value = 20;
    happiness.value = 50;
    defense.value = 0;
    resourceProduction.value = new Map();
    townshipResources.value = new Map([['wood', 100], ['stone', 50], ['food', 200], ['ore', 0]]);
  }

  function devAddGold(amount: number) { resourcesStore.addResource('gold', amount); }
  function devCompleteConstruction() { if (activeConstruction.value) activeConstruction.value.ticksRemaining = 0; }
  function devBuildAll() {
    for (const building of Object.values(TOWNSHIP_BUILDINGS)) {
      if (!builtBuildings.value.has(building.id)) {
        builtBuildings.value.set(building.id, { buildingId: building.id, level: 1, builtAt: Date.now() });
      }
    }
    recalculateStats();
  }

  return {
    progress, builtBuildings, activeConstruction, activeEvents,
    population, maxPopulation, happiness, defense,
    resourceProduction, townshipResources,
    isConstructing, constructionProgress, totalBuildingsBuilt, totalBuildingLevels, globalBonuses,
    addXp, getXpProgress, getBuildingLevel, canBuild, startConstruction, cancelConstruction,
    recalculateStats, collectResource, getBonus, processTick,
    getState, loadState, resetTownship,
    devAddGold, devCompleteConstruction, devBuildAll,
  };
}, {
  persist: {
    key: 'ateria-township',
    serializer: {
      serialize: (state) => JSON.stringify({
        ...state,
        builtBuildings: Array.from(state.builtBuildings?.entries?.() || []),
        resourceProduction: Array.from(state.resourceProduction?.entries?.() || []),
        townshipResources: Array.from(state.townshipResources?.entries?.() || []),
      }),
      deserialize: (value) => {
        const p = JSON.parse(value);
        return {
          ...p,
          builtBuildings: new Map(p.builtBuildings || []),
          resourceProduction: new Map(p.resourceProduction || []),
          townshipResources: new Map(p.townshipResources || []),
        };
      },
    },
  },
});
