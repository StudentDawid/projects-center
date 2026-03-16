<script setup lang="ts">
import { useBuildingsStore } from '../stores/buildings'
import { useGameStore } from '../stores/game'

const buildingsStore = useBuildingsStore()
const gameStore = useGameStore()

const formatNumber = (num: number) => {
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M'
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'k'
  return num.toString()
}

const upgrade = (id: string) => {
  const cost = buildingsStore.getUpgradeCost(id)
  if (gameStore.spendGold(cost)) {
    buildingsStore.upgradeBuilding(id)
  }
}
</script>

<template>
  <div class="view-container">
    <div class="header-actions">
      <h2>Rozbudowa Gildii</h2>
      <div class="global-stats">
        <span class="text-muted">Globalny Mnożnik Złota: </span>
        <strong class="text-gold">x{{ buildingsStore.globalGoldMultiplier.toFixed(2) }}</strong>
      </div>
    </div>

    <div class="buildings-list">
      <div 
        v-for="bld in buildingsStore.buildingTypes" 
        :key="bld.id"
        class="card building-card"
      >
        <div class="bld-info">
          <h3>
            {{ bld.name }} 
            <span class="level text-magic">Lvl {{ buildingsStore.buildings.find(b => b.id === bld.id)?.level || 0 }}</span>
          </h3>
          <p class="desc text-muted">{{ bld.description }}</p>
        </div>
        
        <div class="bld-action">
          <button 
            @click="upgrade(bld.id)"
            :disabled="gameStore.gold < buildingsStore.getUpgradeCost(bld.id)"
            class="upgrade-btn"
          >
            Ulepsz<br>
            <span class="cost text-gold">💰 {{ formatNumber(buildingsStore.getUpgradeCost(bld.id)) }}</span>
          </button>
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

.buildings-list {
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
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  border-color: var(--accent-magic);
  box-shadow: 0 0 15px rgba(163, 113, 247, 0.1);
}

.bld-info h3 {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.level {
  font-size: 0.9rem;
  padding: 0.2rem 0.6rem;
  background: rgba(163, 113, 247, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(163, 113, 247, 0.3);
}

.desc {
  font-size: 0.95rem;
  max-width: 600px;
}

.upgrade-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 140px;
}

.cost {
  font-size: 0.85rem;
  margin-top: 0.2rem;
}
</style>
