<script setup lang="ts">
import { useGameStore } from '../../stores/game'

const gameStore = useGameStore()

// Pomocnicza funkcja formatowania dużych liczb
const formatNumber = (num: number) => {
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M'
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'k'
  return num.toString()
}
</script>

<template>
  <header class="app-header">
    <div class="logo">
      <h1>Mistrz Gildii</h1>
    </div>
    <div class="resources">
      <div class="resource-item gold" title="Złoto w skarbcu">
        <span class="icon">💰</span>
        <span class="value">{{ formatNumber(gameStore.gold) }}</span>
      </div>
      <div class="resource-item income" title="Przychód na sekundę (Tick)">
        <span class="icon">📈</span>
        <span class="value">+{{ formatNumber(gameStore.goldPerTick) }}/s</span>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  height: 60px;
  background-color: var(--panel-bg);
  border-bottom: 1px solid var(--panel-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.3);
  z-index: 10;
}

.logo h1 {
  font-size: 1.5rem;
  color: var(--accent-gold);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.resources {
  display: flex;
  gap: 1.5rem;
}

.resource-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: rgba(0,0,0,0.2);
  padding: 0.3rem 0.8rem;
  border-radius: 8px;
  border: 1px solid var(--panel-border);
}

.resource-item.gold .value {
  color: var(--accent-gold);
  font-weight: bold;
  font-size: 1.1rem;
}

.resource-item.income .value {
  color: var(--accent-success);
  font-weight: 500;
}
</style>
