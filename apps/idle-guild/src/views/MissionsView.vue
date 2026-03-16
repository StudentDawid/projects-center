<script setup lang="ts">
import { useMissionsStore } from '../stores/missions'
import { useMercenariesStore } from '../stores/mercenaries'

const missionsStore = useMissionsStore()
const mercenariesStore = useMercenariesStore()

const formatTime = (ms: number) => {
  const totalSec = Math.floor(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}m ${sec}s`
}

const sendOnMission = (missionId: string) => {
  // Prosty mock: wysyłamy 1 typ najpopularniejszego bohatera, jakiego gracz ma używając 1 sztuki.
  // W pełnej grze tu powinien być złożony modal wyboru drużyny.
  // Upraszczamy do kliknięcia akceptowanego w ciemno przez gracza.
  const mercs = mercenariesStore.mercenaries.filter(m => m.owned > 0)
  if (mercs.length > 0) {
    missionsStore.startMission(missionId, [{ id: mercs[0].id, count: 1 }])
  } else {
    alert("Nie masz żadnych najemników do wysłania!")
  }
}
</script>

<template>
  <div class="view-container">
    <h2>Tablica Ogłoszeń</h2>
    <p class="text-muted">Wysyłaj swoich najemników na ryzykowne misje by zdobywać szybkie zastrzyki gotówki.</p>
    
    <div class="missions-list">
      <div 
        v-for="mission in missionsStore.missionTypes" 
        :key="mission.id"
        class="card mission-card"
      >
        <div class="mission-info">
          <h3>{{ mission.name }}</h3>
          <p class="desc text-muted">{{ mission.description }}</p>
          <div class="mission-stats">
            <span>⏱️ Czas: {{ formatTime(mission.durationMs) }}</span>
            <span class="text-gold">💰 Nagroda: {{ mission.rewardGold }}</span>
          </div>
        </div>
        
        <div class="mission-action">
          <button 
            v-if="!missionsStore.activeMissions.find(m => m.missionId === mission.id)"
            @click="sendOnMission(mission.id)"
            class="start-btn"
          >
            Wyślij Drużynę
          </button>
          <div v-else class="progress-info">
            <span class="text-magic">W trakcie...</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.view-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.missions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card {
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mission-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mission-stats {
  display: flex;
  gap: 1.5rem;
  font-size: 0.9rem;
}

.start-btn {
  background: var(--panel-border);
}

.start-btn:hover {
  border-color: var(--accent-magic);
  color: var(--accent-magic);
}

.progress-info {
  padding: 0.6em 1.2em;
  border: 1px dashed var(--accent-magic);
  border-radius: 6px;
  background: rgba(163, 113, 247, 0.1);
}
</style>
