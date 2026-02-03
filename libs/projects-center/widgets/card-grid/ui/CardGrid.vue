<template>
  <div class="cards-grid">
    <CardItem
      v-for="card in cards"
      :key="card.id"
      :card="card"
      :show-controls="showControls"
      @edit="$emit('edit', $event)"
      @duplicate="$emit('duplicate', $event)"
      @delete="$emit('delete', $event)"
    />
    <slot name="empty-slots" />
  </div>
</template>

<script setup lang="ts">
import type { Card } from '@projects-center/entities/card';
import { CardItem } from '@projects-center/entities/card/ui';

defineProps<{
  cards: Card[];
  showControls?: boolean;
}>();

defineEmits<{
  edit: [card: Card];
  duplicate: [card: Card];
  delete: [card: Card];
}>();
</script>

<style scoped lang="scss">
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  padding: 2rem;
  width: 100%;
}
</style>

