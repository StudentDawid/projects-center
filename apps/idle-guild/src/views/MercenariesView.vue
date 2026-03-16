<script setup lang="ts">
import { ref } from 'vue'
import { useMercenariesStore } from '../stores/mercenaries'
import { useGameStore } from '../stores/game'
import { useBuildingsStore } from '../stores/buildings'

const mercenariesStore = useMercenariesStore()
const gameStore = useGameStore()
const buildingsStore = useBuildingsStore()

const buyAmount = ref(1)

const formatNumber = (num: number) => {
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M'
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'k'
  return num.toString()
}

const buy = (id: string, amount: number) => {
  const cost = mercenariesStore.getUpdateCost(id, amount)
  if (gameStore.spendGold(cost)) {
    mercenariesStore.buyMercenary(id, amount)
  }
}
</script>

<template>
  <div class="view-container">
    <div class="header-actions">
      <h2>Rekrutacja Najemników</h2>
      <div class="buy-multipliers">
        <span>Kupuj po: </span>
        <button :class="{ active: buyAmount === 1 }" @click="buyAmount = 1">x1</button>
        <button :class="{ active: buyAmount === 10 }" @click="buyAmount = 10">x10</button>
        <button :class="{ active: buyAmount === 100 }" @click="buyAmount = 100">x100</button>
      </div>
    </div>

    <div class="mercenaries-grid">
      <div 
        v-for="merc in mercenariesStore.mercenaryTypes" 
        :key="merc.id"
        class="card mercenary-card"
      >
        <div class="merc-info">
          <h3>{{ merc.name }}</h3>
          <p class="stats">
            DPS Bazy: <span class="text-gold">{{ formatNumber(merc.baseDps) }}</span>
            <span v-if="buildingsStore.getClassDpsMultiplier(merc.id) > 1.0" class="text-success text-small">
              (x{{ buildingsStore.getClassDpsMultiplier(merc.id).toFixed(2) }})
            </span>
          </p>
          <p class="stats">
            Posiadano: <strong>{{ mercenariesStore.mercenaries.find(m => m.id === merc.id)?.owned || 0 }}</strong>
          </p>
        </div>
        
        <div class="merc-action">
          <button 
            @click="buy(merc.id, buyAmount)"
            :disabled="gameStore.gold < mercenariesStore.getUpdateCost(merc.id, buyAmount)"
            class="buy-btn"
          >
            Kup x{{ buyAmount }}<br>
            <span class="cost text-gold">💰 {{ formatNumber(mercenariesStore.getUpdateCost(merc.id, buyAmount)) }}</span>
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

.buy-multipliers {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.buy-multipliers button {
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
}

.buy-multipliers button.active {
  background-color: var(--accent-gold);
  color: var(--bg-color);
  border-color: var(--accent-gold);
}

.mercenaries-grid {
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
  justify-content: space-between;
  align-items: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.4);
  border-color: rgba(212, 175, 55, 0.3);
}

.merc-info h3 {
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.stats {
  margin: 0.2rem 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.text-small {
  font-size: 0.8rem;
  margin-left: 0.3rem;
}

.buy-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 120px;
}

.cost {
  font-size: 0.85rem;
  margin-top: 0.2rem;
}
</style>
