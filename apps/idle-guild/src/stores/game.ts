import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useMercenariesStore } from './mercenaries'
import { useBuildingsStore } from './buildings'

export const useGameStore = defineStore('game', () => {
  // Stan główny
  const gold = ref(0)
  
  // Zmienna trzymająca czas ostatniego wejścia do gry (timestamp)
  const lastSavedTime = ref<number | null>(null)
  
  // Statystyki przychodu
  const baseIncome = ref(1) // Podstawowy dochód (np. z bycia bytem - żeby od czegoś zacząć)

  const goldPerTick = computed(() => {
    const mercenariesStore = useMercenariesStore()
    const buildingsStore = useBuildingsStore()
    const base = baseIncome.value + mercenariesStore.totalDps
    return Math.floor(base * buildingsStore.globalGoldMultiplier)
  })

  // Akcje
  const addGold = (amount: number) => {
    gold.value += amount
  }

  const spendGold = (amount: number) => {
    if (gold.value >= amount) {
      gold.value -= amount
      return true
    }
    return false
  }

  // Mechanika Offline Progress
  const processOfflineProgress = () => {
    if (!lastSavedTime.value) {
      // Pierwsze uruchomienie gry
      lastSavedTime.value = Date.now()
      return 0
    }

    const now = Date.now()
    const diffMs = now - lastSavedTime.value
    
    // Uproszczenie: obliczanie ile ticków pominęliśmy (zakładając tickRate = 1000ms)
    // UWAGA: tickRate powinno być stałą definiowaną globalnie, tu używamy 1000ms dla gier idle
    const missedTicks = Math.floor(diffMs / 1000)
    
    if (missedTicks > 0) {
      const earnedGold = missedTicks * goldPerTick.value
      addGold(earnedGold)
      lastSavedTime.value = now
      return earnedGold
    }
    
    return 0
  }
  
  const saveCurrentTime = () => {
    lastSavedTime.value = Date.now()
  }

  const hardReset = () => {
    gold.value = 0
  }

  return {
    gold,
    lastSavedTime,
    goldPerTick,
    addGold,
    spendGold,
    processOfflineProgress,
    saveCurrentTime,
    hardReset
  }
}, {
  persist: true // Pinia Persisted State uruchomione dla gry
})
