<script setup lang="ts">
import { useRaidsStore } from '../stores/raids'
import { useArtifactsStore } from '../stores/artifacts'

const raidsStore = useRaidsStore()
const artifactsStore = useArtifactsStore()

const formatNumber = (num: number) => {
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M'
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'k'
  return num.toString()
}

const formatTime = (ms: number) => {
  return (ms / 1000).toFixed(0) + 's'
}
</script>

<template>
  <div class="view-container">
    <h2>Leża Bossów</h2>
    <p class="text-muted">Gdy Twoja gildia będzie wystarczająco silna, rzuć wyzwanie władcom tego świata.</p>
    
    <div class="boss-list">
      <div 
        v-for="boss in raidsStore.raidBosses" 
        :key="boss.id"
        class="card boss-card"
        :class="{ 
          locked: !raidsStore.checkRaidUnlock(boss.id) && !raidsStore.defeatedBosses.includes(boss.id), 
          defeated: raidsStore.defeatedBosses.includes(boss.id), 
          active: raidsStore.activeRaid?.bossId === boss.id 
        }"
      >
        <div class="boss-info">
          <h3>{{ boss.name }}</h3>
          
          <div v-if="raidsStore.defeatedBosses.includes(boss.id)">
            <p class="text-success">Pokonany!</p>
            <p class="text-small">Zdobyto Artefakt: <strong class="text-magic">{{ artifactsStore.artifactTypes.find(a => a.id === boss.rewardArtifactId)?.name }}</strong></p>
          </div>
          <div v-else-if="!raidsStore.checkRaidUnlock(boss.id)">
            <p class="text-danger">Zablokowany</p>
            <p class="text-small text-muted">Wymaga: {{ boss.requiredMissionsCompleted }} ukończonych misji (Masz: {{ raidsStore.totalMissionsCompleted }})</p>
          </div>
          <div v-else>
            <p class="text-muted">Gotowy do ataku!</p>
            <div class="boss-stats mt-2">
              <span class="mr-3">🩸 HP: {{ formatNumber(boss.requiredTotalHits) }}</span>
              <span>⏱️ Limit: {{ formatTime(boss.durationLimitMs) }}</span>
            </div>
          </div>
        </div>
        
        <div class="boss-action" v-if="!raidsStore.defeatedBosses.includes(boss.id) && raidsStore.checkRaidUnlock(boss.id)">
          <button 
            v-if="!raidsStore.activeRaid" 
            @click="raidsStore.startRaid(boss.id)"
            class="start-raid-btn"
          >
            ATAKUJ BOSSA!
          </button>
          <div v-else-if="raidsStore.activeRaid.bossId === boss.id" class="raid-progress">
             <span class="text-danger">Walka Trwa...</span> <br>
             Zadano: {{ formatNumber(raidsStore.activeRaid.currentHits) }} / {{ formatNumber(boss.requiredTotalHits) }}
          </div>
          <div v-else class="text-muted">
            Inny rajd trwa...
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

.boss-list {
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

.card.locked {
  opacity: 0.6;
  filter: grayscale(0.8);
}

.card.defeated {
  border-color: var(--accent-success);
  background: rgba(46, 160, 67, 0.05);
}

.card.active {
  border-color: var(--accent-danger);
  box-shadow: 0 0 15px rgba(248, 81, 73, 0.2);
  animation: pulse 2s infinite;
}

.boss-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.boss-stats {
  font-size: 0.9rem;
}

.mr-3 {
  margin-right: 1.5rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.start-raid-btn {
  background: rgba(248, 81, 73, 0.1);
  color: var(--accent-danger);
  border-color: var(--accent-danger);
  font-weight: bold;
}

.start-raid-btn:hover {
  background: var(--accent-danger);
  color: #fff;
  box-shadow: 0 0 10px var(--accent-danger);
}

.raid-progress {
  text-align: right;
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
  border: 1px dashed var(--accent-danger);
  border-radius: 8px;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.01); }
  100% { transform: scale(1); }
}
</style>
