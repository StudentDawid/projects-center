<script setup lang="ts">
import { useAchievementsStore } from '../stores/achievements'

const achievementsStore = useAchievementsStore()
</script>

<template>
  <div class="view-container">
    <h2>Sala Osiągnięć</h2>
    <p class="text-muted">Twoje wspaniałe czyny są tutaj zapisane.</p>
    
    <div class="achievements-list">
      <div 
        v-for="ach in achievementsStore.achievementTypes" 
        :key="ach.id"
        class="card"
        :class="{ unlocked: achievementsStore.hasAchievement(ach.id) }"
      >
        <div class="ach-info">
          <h3 :class="{ 'text-gold': achievementsStore.hasAchievement(ach.id) }">{{ ach.name }}</h3>
          <p class="desc text-muted">{{ ach.description }}</p>
          <div class="reward text-success text-small" v-if="achievementsStore.hasAchievement(ach.id)">
            Nagroda z osiągnięcia: {{ ach.rewardText }} (Implementacja wkrótce)
          </div>
        </div>
        <div class="icon" v-if="achievementsStore.hasAchievement(ach.id)">🏆</div>
        <div class="icon text-muted" v-else>🔒</div>
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

.achievements-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card {
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  padding: 1.2rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card.unlocked {
  border-color: rgba(212, 175, 55, 0.4);
  background: rgba(212, 175, 55, 0.05);
}

.ach-info {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.icon {
  font-size: 2rem;
}

.text-small {
  font-size: 0.85rem;
  margin-top: 0.5rem;
}
</style>
