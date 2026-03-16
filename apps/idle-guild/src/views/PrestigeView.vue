<script setup lang="ts">
import { usePrestigeStore } from '../stores/prestige'

const prestigeStore = usePrestigeStore()
</script>

<template>
  <div class="view-container">
    <h2>Prestiż i Emigracja</h2>
    <p class="text-muted">Opuszczając te ziemie, oddajesz całe złoto, bohaterów i budynki, odzyskując Punkty Renomy za zgromadzone bogactwa.</p>
    
    <div class="card">
      <div class="prestige-info">
        <h3>Twój dorobek</h3>
        <p>Posiadasz: <strong class="text-magic">{{ prestigeStore.points }}</strong> Punktów Renomy.</p>
        <p>Mnożnik Prestiżu: <strong class="text-success">x{{ prestigeStore.prestigeMultiplier(prestigeStore.points).toFixed(2) }} do Złota</strong>.</p>
      </div>
      <button class="btn-prestige" @click="prestigeStore.doPrestige()">EMIGRUJ (Soft Reset)</button>
    </div>
  </div>
</template>

<style scoped>
.view-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.card {
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  padding: 2rem;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.btn-prestige {
  background: var(--accent-danger);
  color: white;
  border: none;
  font-size: 1.2rem;
  padding: 1rem;
}

.btn-prestige:hover {
  background: #ff7b72;
  box-shadow: 0 0 15px rgba(248, 81, 73, 0.5);
}
</style>
