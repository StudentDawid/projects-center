import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface MissionDef {
  id: string
  name: string
  description: string
  durationMs: number
  rewardGold: number
  difficultyDps: number // Wymagany DPS dla sukcesu / braku kar
}

export interface ActiveMission {
  missionId: string
  assignedMercenaries: { id: string; count: number }[]
  startTimeMs: number
}

const MISSION_TYPES: MissionDef[] = [
  { id: 'rats', name: 'Zabicie szczurów w piwnicy', description: 'Głośno tam i brudno.', durationMs: 10000, rewardGold: 50, difficultyDps: 5 },
  { id: 'goblins', name: 'Obozowisko Goblinów', description: 'Gobliny nękają podróżnych. Zrób z tym porządek.', durationMs: 60000, rewardGold: 500, difficultyDps: 100 },
  { id: 'dragon', name: 'Złote Łuski Smoka', description: 'Epicka misja dla odważnych. Zabij młodego smoka.', durationMs: 300000, rewardGold: 10000, difficultyDps: 5000 }
]

export const useMissionsStore = defineStore('missions', () => {
  const activeMissions = ref<ActiveMission[]>([])

  const startMission = (missionId: string, assignedMercenaries: { id: string; count: number }[]) => {
    // Sprawdź czy chociaż jeden najemnik
    const totalCount = assignedMercenaries.reduce((acc, curr) => acc + curr.count, 0)
    if (totalCount === 0) return false
    
    // Zapobiegaj zduplikowanym misjom
    if (activeMissions.value.find(m => m.missionId === missionId)) return false
    
    activeMissions.value.push({
      missionId,
      assignedMercenaries,
      startTimeMs: Date.now()
    })
    return true
  }

  const completeMission = (missionId: string) => {
    const idx = activeMissions.value.findIndex(m => m.missionId === missionId)
    if (idx !== -1) {
      activeMissions.value.splice(idx, 1) // Usunięcie misji z aktywnych
      // Zwracamy po to, aby kontroler mógł dać nagrodę
      return true
    }
    return false
  }

  const hardReset = () => {
    activeMissions.value = []
  }

  return {
    missionTypes: MISSION_TYPES,
    activeMissions,
    startMission,
    completeMission,
    hardReset
  }
}, {
  persist: true
})
