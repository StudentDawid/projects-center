<template>
  <div class="card-list">
    <div v-if="loading" class="loading">Ładowanie...</div>
    <div v-else-if="filteredCards.length === 0" class="empty-state">
      <p>Brak kart do wyświetlenia</p>
      <NuxtLink to="/rpg/fabula-ultima-card-generator/new" class="btn-primary">
        Utwórz pierwszą kartę
      </NuxtLink>
    </div>
    <div v-else class="cards-grid">
      <CardItem
        v-for="card in filteredCards"
        :key="card.id"
        :card="card"
        @click="handleCardClick(card)"
        @edit="handleEdit(card)"
        @delete="handleDelete(card)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Card, CardFilters } from '~/entities/card';
import { useCardStore } from '~/entities/card/lib/useCardStore';
import { CardItem } from '~/entities/card/ui';

const props = defineProps<{
  filters?: CardFilters;
  loading?: boolean;
}>();

const emit = defineEmits<{
  cardClick: [card: Card];
  cardEdit: [card: Card];
  cardDelete: [card: Card];
}>();

const cardStore = useCardStore();

const filteredCards = computed(() => {
  return cardStore.getFilteredCards(props.filters || {});
});

function handleCardClick(card: Card): void {
  emit('cardClick', card);
}

function handleEdit(card: Card): void {
  emit('cardEdit', card);
}

function handleDelete(card: Card): void {
  if (confirm(`Czy na pewno chcesz usunąć kartę "${card.name}"?`)) {
    cardStore.deleteCard(card.id);
    emit('cardDelete', card);
  }
}
</script>

<style scoped lang="scss">
.card-list {
  width: 100%;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #8b7d6b;
  font-size: 1.2rem;
  font-family: 'Crimson Pro', 'Georgia', serif;
  font-style: italic;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #8b7d6b;

  p {
    font-size: 1.2rem;
    margin-bottom: 1.5rem;
    font-family: 'Crimson Pro', 'Georgia', serif;
  }
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  padding: 1rem 0;
}

.btn-primary {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: #b68c4f;
  color: #fff;
  text-decoration: none;
  border-radius: 0;
  font-weight: 600;
  transition: all 0.3s ease;
  border: 2px solid #8b5a3c;
  font-family: 'Cinzel', 'Georgia', serif;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  font-size: 0.9rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    background: #8b5a3c;
    border-color: #6b4423;
  }
}

@media (max-width: 768px) {
  .cards-grid {
    grid-template-columns: 1fr;
  }
}
</style>

