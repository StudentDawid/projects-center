import { ref, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '../stores/game'
import { useMissionsStore } from '../stores/missions'
import { useRaidsStore } from '../stores/raids'

export function useGameTick(tickRateMs = 1000) {
  const isRunning = ref(false)
  const lastTickTime = ref(Date.now())
  let tickInterval: number | null = null

  const startTick = () => {
    if (isRunning.value) return
    isRunning.value = true
    lastTickTime.value = Date.now()
    
    tickInterval = window.setInterval(() => {
      const now = Date.now()
      const deltaMs = now - lastTickTime.value
      // Simulate multiple ticks if lagging behind deeply
      const ticksToProcess = Math.floor(deltaMs / tickRateMs)
      
      if (ticksToProcess > 0) {
        processTicks(ticksToProcess)
        // Store remaining time instead of blindly storing Date.now()
        // so we don't bleed floating milliseconds 
        lastTickTime.value += ticksToProcess * tickRateMs
      }
    }, tickRateMs)
  }

  const stopTick = () => {
    isRunning.value = false
    if (tickInterval !== null) {
      clearInterval(tickInterval)
      tickInterval = null
    }
  }

  const processTicks = (amountOfTicks: number) => {
    const gameStore = useGameStore()
    const missionsStore = useMissionsStore()
    const raidsStore = useRaidsStore()
    const now = Date.now()

    gameStore.addGold(gameStore.goldPerTick * amountOfTicks)
    gameStore.saveCurrentTime() // Zapisujemy tick by odzyskiwać poprawnie progres offline

    // Sprawdzanie stanu aktywnych misji
    missionsStore.activeMissions.forEach(mission => {
      const def = missionsStore.missionTypes.find(m => m.id === mission.missionId)
      if (def && now - mission.startTimeMs >= def.durationMs) {
        // Misja zakończona sukcesem
        if (missionsStore.completeMission(mission.missionId)) {
          gameStore.addGold(def.rewardGold)
          raidsStore.incrementMissions()
          console.log(`Misja ${def.name} zakończona! Zdobyto: ${def.rewardGold} złota.`)
        }
      }
    })

    // Sprawdzanie stanu atakowanego Bossa
    if (raidsStore.activeRaid) {
      const boss = raidsStore.raidBosses.find(b => b.id === raidsStore.activeRaid!.bossId)
      if (boss) {
        if (now - raidsStore.activeRaid.startTimeMs > boss.durationLimitMs) {
          raidsStore.failRaid()
          console.log(`Porażka! Boss ${boss.name} uciekł, zabrakło DPS.`)
        } else {
          // Uderz z siłą równą normalnemu przychodowi za dany tick (lub samemu dps)
          raidsStore.attackRaid(gameStore.goldPerTick * amountOfTicks)
        }
      }
    }
  }
  
  const calculateOfflineProgress = () => {
    const gameStore = useGameStore()
    const earnedOffline = gameStore.processOfflineProgress()
    if (earnedOffline > 0) {
      console.log(`Wyprodukowano ${earnedOffline} złota podczas Twojej nieobecności!`)
      // Tu w przyszłości można dodać wywołanie modal/powiadomienia w UI
    }
  }

  onMounted(() => {
    calculateOfflineProgress()
    startTick()
  })

  onUnmounted(() => {
    stopTick()
  })

  return {
    isRunning,
    startTick,
    stopTick
  }
}
