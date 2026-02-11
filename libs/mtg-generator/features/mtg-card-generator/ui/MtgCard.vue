<template>
  <div class="mtg-card" :style="{ '--card-color': card.colorTheme || '#222' }">
    <div class="mtg-card__name">{{ card.name || 'Untitled Card' }}</div>
    <div class="mtg-card__description">
      {{ card.description || 'No description' }}
    </div>
    <div class="mtg-card__footer">
      <span v-for="tag in card.tags || []" :key="tag" class="mtg-card__tag">{{ tag }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RpgCard } from '../types';

defineProps<{
  card: Partial<RpgCard>;
}>();
</script>

<style scoped>
.mtg-card {
  width: 252px;
  height: 352px;
  border-radius: 12px;
  border: 2px solid #111;
  background: linear-gradient(180deg, var(--card-color, #222), #101010);
  color: #fff;
  padding: 14px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.mtg-card__name {
  font-size: 18px;
  font-weight: 700;
}

.mtg-card__description {
  font-size: 14px;
  line-height: 1.4;
  opacity: 0.95;
}

.mtg-card__footer {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.mtg-card__tag {
  font-size: 11px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  padding: 2px 8px;
}
</style>

