import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface BuildingDef {
  id: string
  name: string
  description: string
  baseCost: number
  costMultiplier: number
  // Efekty (każdy poziom dodaje tę wartość w sposób addytywny do swojej puli)
  globalGoldMultiplier?: number // Przykład: 0.1 = +10% 
  classDpsMultiplier?: { classId: string; multiplier: number } // 0.5 = +50%
}

export interface BuildingState {
  id: string
  level: number
}

const BUILDING_TYPES: BuildingDef[] = [
  { 
    id: 'tavern', 
    name: 'Karczma', 
    description: 'Podnosi bazowe morale. Każdy poziom zwiększa globalny przychód o 10%.', 
    baseCost: 1000, 
    costMultiplier: 1.5,
    globalGoldMultiplier: 0.1 
  },
  { 
    id: 'armory', 
    name: 'Zbrojownia', 
    description: 'Błyszczący oręż przyciąga lepszych wojowników. Każdy poziom daje Wojownikom +50% obrażeń.', 
    baseCost: 5000, 
    costMultiplier: 1.6,
    classDpsMultiplier: { classId: 'warrior', multiplier: 0.5 }
  },
  { 
    id: 'magic_tower', 
    name: 'Wieża Magów', 
    description: 'Magowie dają wskazówki Łucznikom. Każdy poziom: Łucznik +100% obrażeń.', 
    baseCost: 50000, 
    costMultiplier: 1.8,
    classDpsMultiplier: { classId: 'archer', multiplier: 1.0 }
  }
]

export const useBuildingsStore = defineStore('buildings', () => {
  const buildings = ref<BuildingState[]>(
    BUILDING_TYPES.map(def => ({ id: def.id, level: 0 }))
  )

  const getUpgradeCost = (id: string): number => {
    const def = BUILDING_TYPES.find(d => d.id === id)
    const state = buildings.value.find(s => s.id === id)
    if (!def || !state) return 0
    return Math.floor(def.baseCost * Math.pow(def.costMultiplier, state.level))
  }

  const upgradeBuilding = (id: string) => {
    const state = buildings.value.find(s => s.id === id)
    if (state) {
      state.level += 1
    }
  }

  const globalGoldMultiplier = computed(() => {
    let multiplier = 1.0 // 1.0 = 100% (brak zmian)
    for (const state of buildings.value) {
      const def = BUILDING_TYPES.find(d => d.id === state.id)
      if (def?.globalGoldMultiplier) {
        multiplier += def.globalGoldMultiplier * state.level
      }
    }
    return multiplier
  })

  const getClassDpsMultiplier = (classId: string) => {
    let multiplier = 1.0
    for (const state of buildings.value) {
      const def = BUILDING_TYPES.find(d => d.id === state.id)
      if (def?.classDpsMultiplier?.classId === classId) {
        multiplier += def.classDpsMultiplier.multiplier * state.level
      }
    }
    return multiplier
  }

  const hardReset = () => {
    buildings.value.forEach(b => b.level = 0)
  }

  return {
    buildingTypes: BUILDING_TYPES,
    buildings,
    getUpgradeCost,
    upgradeBuilding,
    globalGoldMultiplier,
    getClassDpsMultiplier,
    hardReset
  }
}, {
  persist: true
})
