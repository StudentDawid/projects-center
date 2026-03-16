import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useArtifactsStore } from './artifacts'

export interface RaidBossDef {
  id: string
  name: string
  requiredTotalHits: number // Ilość HP do zbicia w czasie
  durationLimitMs: number
  rewardArtifactId: string
  requiredMissionsCompleted: number // Ile zwykłych misji trzeba przejść
}

const RAID_BOSSES: RaidBossDef[] = [
  { id: 'skeleton_king', name: 'Król Szkieletów', requiredTotalHits: 20000, durationLimitMs: 30000, rewardArtifactId: 'skull_king_crown', requiredMissionsCompleted: 5 },
  { id: 'ancient_dragon', name: 'Pradawny Smok', requiredTotalHits: 500000, durationLimitMs: 45000, rewardArtifactId: 'dragon_heart', requiredMissionsCompleted: 20 },
  { id: 'time_lord', name: 'Władca Czasu', requiredTotalHits: 10000000, durationLimitMs: 60000, rewardArtifactId: 'time_crystal', requiredMissionsCompleted: 50 }
]

export const useRaidsStore = defineStore('raids', () => {
  const defeatedBosses = ref<string[]>([])
  const totalMissionsCompleted = ref(0)
  
  const activeRaid = ref<{ bossId: string; currentHits: number; startTimeMs: number } | null>(null)

  const checkRaidUnlock = (bossId: string) => {
    const boss = RAID_BOSSES.find(b => b.id === bossId)
    // Czy odblokowany na podst. zadań i czy nie pokonany
    return boss && totalMissionsCompleted.value >= boss.requiredMissionsCompleted && !defeatedBosses.value.includes(bossId)
  }

  const startRaid = (bossId: string) => {
    if (!checkRaidUnlock(bossId)) return false
    if (activeRaid.value) return false // Jeden rajd na raz
    
    activeRaid.value = {
      bossId,
      currentHits: 0,
      startTimeMs: Date.now()
    }
    return true
  }

  const attackRaid = (dpsAmount: number) => {
    if (!activeRaid.value) return
    activeRaid.value.currentHits += dpsAmount
    
    const boss = RAID_BOSSES.find(b => b.id === activeRaid.value!.bossId)
    if (!boss) return
    
    // Check win condition
    if (activeRaid.value.currentHits >= boss.requiredTotalHits) {
      // Wygrana
      defeatedBosses.value.push(boss.id)
      const artifactsStore = useArtifactsStore()
      artifactsStore.grantArtifact(boss.rewardArtifactId)
      activeRaid.value = null
      console.log(`POKONANO BOSSA: ${boss.name}! Otrzymano artefakt.`)
    }
  }

  const failRaid = () => {
    activeRaid.value = null
  }
  
  const incrementMissions = () => {
    totalMissionsCompleted.value += 1
  }

  return {
    raidBosses: RAID_BOSSES,
    defeatedBosses,
    totalMissionsCompleted,
    activeRaid,
    checkRaidUnlock,
    startRaid,
    attackRaid,
    failRaid,
    incrementMissions
  }
}, {
  persist: true
})
