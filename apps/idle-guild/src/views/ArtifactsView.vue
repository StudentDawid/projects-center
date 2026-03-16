<script setup lang="ts">
import { useArtifactsStore } from '../stores/artifacts'

const artifactsStore = useArtifactsStore()
</script>

<template>
  <div class="view-container">
    <div class="header-actions">
      <h2>Kolekcja Artefaktów</h2>
      <div class="global-stats">
        <span class="text-muted">Potęga Artefaktów: </span>
        <strong class="text-magic">x{{ artifactsStore.artifactsMultiplier.toFixed(2) }} Złota</strong>
      </div>
    </div>
    <p class="text-muted">Potężne przedmioty z czasów starożytnych. Ich moc domnaża wszelkie dochody gildii.</p>
    
    <div class="artifacts-grid">
      <div 
        v-for="art in artifactsStore.artifactTypes" 
        :key="art.id"
        class="card artifact-card"
        :class="{ locked: !artifactsStore.ownedArtifacts.includes(art.id) }"
      >
        <div class="icon-space">
           💎
        </div>
        <div class="art-info">
          <h3 :class="{ 'text-magic': artifactsStore.ownedArtifacts.includes(art.id) }">{{ art.name }}</h3>
          <p class="desc text-muted">{{ artifactsStore.ownedArtifacts.includes(art.id) ? art.description : '???' }}</p>
          <div class="multiplier" v-if="artifactsStore.ownedArtifacts.includes(art.id)">
            Efekt: <strong class="text-success">x{{ art.globalMultiplier }} Złota</strong>
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

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.artifacts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.card {
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.card.locked {
  opacity: 0.4;
  filter: grayscale(1);
}

.icon-space {
  font-size: 3rem;
  background: rgba(163, 113, 247, 0.1);
  height: 80px;
  width: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  border: 1px solid rgba(163, 113, 247, 0.3);
}

.art-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.desc {
  font-size: 0.9rem;
}

.multiplier {
  font-size: 0.95rem;
  margin-top: 0.5rem;
}
</style>
