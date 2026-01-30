/**
 * Architect Store - Building, City Development
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAteriaGameStore } from '../../core/model/game.store';
import { useAteriaResourcesStore } from '../../core/model/resources.store';
import { BUILDINGS, BUILDING_MATERIALS, getBuilding, getMaterial, getAvailableBuildings, calculateArchitectXpToLevel, type Building, type ArchitectProgress } from '../data/architect.data';

export interface ActiveConstruction { buildingId: string; startTime: number; ticksRemaining: number; totalTicks: number; }

export const useAteriaArchitectStore = defineStore('ateria-architect', () => {
  const gameStore = useAteriaGameStore();
  const resourcesStore = useAteriaResourcesStore();

  const progress = ref<ArchitectProgress>({ level: 1, xp: 0, xpToNextLevel: 100, totalXp: 0 });
  const materials = ref<Map<string, number>>(new Map());
  const builtBuildings = ref<Map<string, number>>(new Map());
  const activeConstruction = ref<ActiveConstruction | null>(null);
  const discoveredBlueprints = ref<Set<string>>(new Set(['cottage', 'sawmill']));
  
  const totalBuildingsBuilt = ref(0);
  const totalPopulation = ref(0);
  const totalDefense = ref(0);

  const isConstructing = computed(() => activeConstruction.value !== null);
  const constructionProgress = computed(() => {
    if (!activeConstruction.value) return 0;
    return ((activeConstruction.value.totalTicks - activeConstruction.value.ticksRemaining) / activeConstruction.value.totalTicks) * 100;
  });
  const availableBuildings = computed(() => getAvailableBuildings(progress.value.level).filter(b => discoveredBlueprints.value.has(b.id)));

  const totalEffects = computed(() => {
    const effects: Record<string, number> = {};
    for (const [buildingId, count] of builtBuildings.value) {
      const building = getBuilding(buildingId);
      if (building) {
        for (const effect of building.effects) {
          effects[effect.type] = (effects[effect.type] || 0) + effect.value * count;
        }
      }
    }
    return effects;
  });

  function addXp(amount: number) {
    progress.value.xp += amount;
    progress.value.totalXp += amount;
    while (progress.value.xp >= progress.value.xpToNextLevel) {
      progress.value.xp -= progress.value.xpToNextLevel;
      progress.value.level++;
      progress.value.xpToNextLevel = calculateArchitectXpToLevel(progress.value.level);
      gameStore.addNotification({ type: 'success', title: `Architekt - Poziom ${progress.value.level}!`, message: 'Nowe budowle dostępne!', icon: 'mdi-home-city', duration: 3000 });
    }
  }

  function getXpProgress(): number { return (progress.value.xp / progress.value.xpToNextLevel) * 100; }

  function addMaterial(materialId: string, amount: number) {
    const current = materials.value.get(materialId) || 0;
    materials.value.set(materialId, current + amount);
  }

  function hasMaterials(building: Building): boolean {
    for (const req of building.materials) {
      if ((materials.value.get(req.materialId) || 0) < req.amount) return false;
    }
    return true;
  }

  function canBuild(buildingId: string): { canBuild: boolean; reason?: string } {
    const building = getBuilding(buildingId);
    if (!building) return { canBuild: false, reason: 'Nieznana budowla' };
    if (isConstructing.value) return { canBuild: false, reason: 'Już budujesz' };
    if (!discoveredBlueprints.value.has(buildingId)) return { canBuild: false, reason: 'Plan nieodkryty' };
    if (building.requiredLevel > progress.value.level) return { canBuild: false, reason: `Wymaga poziomu ${building.requiredLevel}` };
    const currentCount = builtBuildings.value.get(buildingId) || 0;
    if (currentCount >= building.maxCount) return { canBuild: false, reason: `Max ${building.maxCount}` };
    if (!hasMaterials(building)) return { canBuild: false, reason: 'Brak materiałów' };
    if (!resourcesStore.hasAmount('gold', building.goldCost)) return { canBuild: false, reason: 'Brak złota' };
    return { canBuild: true };
  }

  function startConstruction(buildingId: string): boolean {
    const check = canBuild(buildingId);
    if (!check.canBuild) {
      gameStore.addNotification({ type: 'warning', title: 'Nie można budować', message: check.reason || '', icon: 'mdi-alert' });
      return false;
    }
    const building = getBuilding(buildingId)!;
    for (const req of building.materials) {
      materials.value.set(req.materialId, (materials.value.get(req.materialId) || 0) - req.amount);
    }
    resourcesStore.removeResource('gold', building.goldCost);
    activeConstruction.value = { buildingId, startTime: Date.now(), ticksRemaining: building.buildTime, totalTicks: building.buildTime };
    return true;
  }

  function cancelConstruction() { activeConstruction.value = null; }

  function completeConstruction() {
    if (!activeConstruction.value) return;
    const building = getBuilding(activeConstruction.value.buildingId);
    if (!building) { activeConstruction.value = null; return; }
    const current = builtBuildings.value.get(building.id) || 0;
    builtBuildings.value.set(building.id, current + 1);
    addXp(building.xpReward);
    totalBuildingsBuilt.value++;
    recalculateTotals();
    gameStore.addNotification({ type: 'success', title: 'Budowa ukończona!', message: building.name, icon: building.icon, duration: 2000 });
    activeConstruction.value = null;
  }

  function recalculateTotals() {
    let pop = 0, def = 0;
    for (const [buildingId, count] of builtBuildings.value) {
      const building = getBuilding(buildingId);
      if (building) {
        for (const effect of building.effects) {
          if (effect.type === 'population') pop += effect.value * count;
          if (effect.type === 'defense') def += effect.value * count;
        }
      }
    }
    totalPopulation.value = pop;
    totalDefense.value = def;
  }

  function processTick() {
    if (activeConstruction.value) {
      activeConstruction.value.ticksRemaining--;
      if (activeConstruction.value.ticksRemaining <= 0) completeConstruction();
    }
  }

  function getState() {
    return {
      progress: progress.value,
      materials: Array.from(materials.value.entries()),
      builtBuildings: Array.from(builtBuildings.value.entries()),
      discoveredBlueprints: Array.from(discoveredBlueprints.value),
      totalBuildingsBuilt: totalBuildingsBuilt.value,
    };
  }

  function loadState(state: ReturnType<typeof getState>) {
    if (state.progress) progress.value = state.progress;
    if (state.materials) materials.value = new Map(state.materials);
    if (state.builtBuildings) builtBuildings.value = new Map(state.builtBuildings);
    if (state.discoveredBlueprints) discoveredBlueprints.value = new Set(state.discoveredBlueprints);
    if (state.totalBuildingsBuilt !== undefined) totalBuildingsBuilt.value = state.totalBuildingsBuilt;
    recalculateTotals();
  }

  function resetArchitect() {
    progress.value = { level: 1, xp: 0, xpToNextLevel: 100, totalXp: 0 };
    materials.value = new Map();
    builtBuildings.value = new Map();
    activeConstruction.value = null;
    discoveredBlueprints.value = new Set(['cottage', 'sawmill']);
    totalBuildingsBuilt.value = 0;
    totalPopulation.value = 0;
    totalDefense.value = 0;
  }

  function devAddXp(amount: number) { addXp(amount); }
  function devAddMaterials() { for (const id of Object.keys(BUILDING_MATERIALS)) addMaterial(id, 100); }
  function devUnlockAll() { for (const id of Object.keys(BUILDINGS)) discoveredBlueprints.value.add(id); }

  return {
    progress, materials, builtBuildings, activeConstruction, discoveredBlueprints, totalBuildingsBuilt, totalPopulation, totalDefense,
    isConstructing, constructionProgress, availableBuildings, totalEffects,
    addXp, getXpProgress, addMaterial, canBuild, startConstruction, cancelConstruction, processTick,
    getState, loadState, resetArchitect, devAddXp, devAddMaterials, devUnlockAll,
  };
}, {
  persist: {
    key: 'ateria-architect',
    serializer: {
      serialize: (state) => JSON.stringify({ ...state, materials: Array.from(state.materials?.entries?.() || []), builtBuildings: Array.from(state.builtBuildings?.entries?.() || []), discoveredBlueprints: Array.from(state.discoveredBlueprints || []) }),
      deserialize: (value) => { const p = JSON.parse(value); return { ...p, materials: new Map(p.materials || []), builtBuildings: new Map(p.builtBuildings || []), discoveredBlueprints: new Set(p.discoveredBlueprints || []) }; },
    },
  },
});
