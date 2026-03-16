import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useGameStore } from './game'
import { useMercenariesStore } from './mercenaries'
import { useBuildingsStore } from './buildings'
import { useMissionsStore } from './missions'

export const usePrestigeStore = defineStore('prestige', () => {
  const points = ref(0) // Punkty Renomy za kolejne prestiże
  const totalResets = ref(0)
  
  const calculateGain = (totalGoldEarnedThisRun: number) => {
    // Prosta matematyka powiększonej trudności (pierwiastek)
    // 1M -> 1 RP, 4M -> 2 RP, 100M -> 10 RP.
    if (totalGoldEarnedThisRun < 1_000_000) return 0
    return Math.floor(Math.sqrt(totalGoldEarnedThisRun / 1_000_000))
  }

  // Uzywamy potęgowania, żeby oddać potężny charakter Prestiżu w Late Game (.05 daje wykładniczy wzmocnienie przychodu)
  const prestigeMultiplier = (pointsToApply: number) => {
    return Math.pow(1.05, pointsToApply) // +5% dps per point składane procentowo
  }

  // Akcja wywołująca Soft Reset gry
  const doPrestige = () => {
    const game = useGameStore()
    const gain = calculateGain(game.gold)
    
    if (gain > 0) {
      points.value += gain
      totalResets.value += 1
      
      // Kasowanie postępu (hard resety sklepów)
      game.hardReset()
      useMercenariesStore().hardReset()
      useBuildingsStore().hardReset()
      useMissionsStore().hardReset()
      
      return true
    }
    return false
  }

  return {
    points,
    totalResets,
    calculateGain,
    prestigeMultiplier,
    doPrestige
  }
}, {
  persist: true
})
