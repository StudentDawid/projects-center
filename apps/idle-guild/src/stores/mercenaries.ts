import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useBuildingsStore } from './buildings'

export interface MercenaryDef {
  id: string
  name: string
  baseCost: number
  baseDps: number
  costMultiplier: number
}

export interface MercenaryState {
  id: string
  owned: number
}

const MERCENARY_TYPES: MercenaryDef[] = [
  { id: 'drunkard', name: 'Pijak', baseCost: 10, baseDps: 1, costMultiplier: 1.07 },
  { id: 'peasant', name: 'Chłop z widłami', baseCost: 100, baseDps: 10, costMultiplier: 1.15 },
  { id: 'warrior', name: 'Wojownik', baseCost: 1100, baseDps: 80, costMultiplier: 1.14 },
  { id: 'archer', name: 'Łucznik', baseCost: 12000, baseDps: 470, costMultiplier: 1.13 },
  { id: 'knight', name: 'Rycerz', baseCost: 130000, baseDps: 2600, costMultiplier: 1.12 }
]

export const useMercenariesStore = defineStore('mercenaries', () => {
  const mercenaries = ref<MercenaryState[]>(
    MERCENARY_TYPES.map(def => ({ id: def.id, owned: 0 }))
  )

  // Otrzymanie kosztu następnego poziomu (skalowanie wykładnicze)
  const getUpdateCost = (id: string, amountToBuy: number = 1): number => {
    const def = MERCENARY_TYPES.find(d => d.id === id)
    const state = mercenaries.value.find(s => s.id === id)
    if (!def || !state) return 0

    let totalCost = 0
    let currentOwned = state.owned
    
    // Obliczenie ceny jako sumy kosztów dla N unikalnych zakupów
    for (let i = 0; i < amountToBuy; i++) {
        totalCost += def.baseCost * Math.pow(def.costMultiplier, currentOwned + i)
    }
    
    return Math.floor(totalCost)
  }

  const buyMercenary = (id: string, addAmount: number = 1) => {
    const state = mercenaries.value.find(s => s.id === id)
    if (state) {
      state.owned += addAmount
    }
  }

  // Całkowite DPS na podstawie posiadanych najemników staje się GoldPerTick
  const totalDps = computed(() => {
    const buildingsStore = useBuildingsStore()
    let dps = 0
    for (const state of mercenaries.value) {
      const def = MERCENARY_TYPES.find(d => d.id === state.id)
      if (def) {
        const classMult = buildingsStore.getClassDpsMultiplier(def.id)
        dps += state.owned * def.baseDps * classMult
      }
    }
    return dps
  })

  const getMercenaryDef = (id: string) => MERCENARY_TYPES.find(d => d.id === id)

  const hardReset = () => {
    mercenaries.value.forEach(m => m.owned = 0)
  }

  return {
    mercenaryTypes: MERCENARY_TYPES,
    mercenaries,
    getUpdateCost,
    buyMercenary,
    totalDps,
    getMercenaryDef,
    hardReset
  }
}, {
  persist: true
})
