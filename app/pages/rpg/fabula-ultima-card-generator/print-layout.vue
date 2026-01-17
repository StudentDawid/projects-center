<template>
  <div class="print-layout-page">
    <div class="page-header">
      <h1>Układ do druku</h1>
      <NuxtLink to="/rpg/fabula-ultima-card-generator" class="btn-secondary">
        ← Powrót do listy
      </NuxtLink>
    </div>

    <div class="print-layout-container">
      <div class="left-panel">
        <div class="card-selection">
          <div class="selection-header">
            <h3>Wybór kart</h3>
            <div class="selection-actions">
              <button class="btn-small" @click="selectAll">Zaznacz wszystkie</button>
              <button class="btn-small" @click="deselectAll">Odznacz wszystkie</button>
            </div>
          </div>
          <div class="cards-selection-list">
            <label
              v-for="card in allCards"
              :key="card.id"
              class="card-selection-item"
              :class="{ selected: isCardSelected(card.id) }"
            >
              <input
                type="checkbox"
                :checked="isCardSelected(card.id)"
                @change="toggleCardSelection(card.id)"
              />
              <div class="card-selection-info">
                <span class="card-selection-name">{{ card.name }}</span>
                <span class="card-selection-type" :class="`type-${card.type}`">
                  {{ getTypeLabel(card.type) }}
                </span>
              </div>
            </label>
          </div>
        </div>

        <PrintLayoutSelector
          :settings="layoutSettings"
          :selected-count="selectedCardsCount"
          @update:settings="updateLayoutSettings"
        />
      </div>

      <div class="right-panel">
        <PrintPreview
          :cards="selectedCardsArray"
          :settings="layoutSettings"
          :current-page="currentPage"
          :total-pages="totalPages"
          @prev-page="prevPage"
          @next-page="nextPage"
          @export-pdf="handleExportPDF"
          @export-png="handleExportPNG"
          @print="handlePrint"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Card, CardType, PrintLayoutSettings } from '~/shared/fabula-ultima-card-generator/types/card.types';
import { CardType as CardTypeEnum } from '~/shared/fabula-ultima-card-generator/types/card.types';
import { useCardStore } from '~/stores/fabula-ultima-card-generator/cards';
import { usePrintLayout } from '~/features/rpg-fabula-ultima-card-generator/hooks/usePrintLayout';
import PrintLayoutSelector from '~/features/rpg-fabula-ultima-card-generator/ui/PrintLayoutSelector.vue';
import PrintPreview from '~/features/rpg-fabula-ultima-card-generator/ui/PrintPreview.vue';

useHead({
  title: 'Układ do druku - Generator Kart Fabula Ultima',
});

const cardStore = useCardStore();
const {
  selectedCardIds,
  layoutSettings,
  selectedCardsCount,
  maxCardsPerPage,
  pages: totalPages,
  toggleCardSelection,
  selectAll: selectAllCards,
  deselectAll,
  isCardSelected,
  updateLayoutSettings: updateLayout,
} = usePrintLayout();

const allCards = computed(() => cardStore.allCards);

const selectedCardsArray = computed(() => {
  return allCards.value.filter((card) => selectedCardIds.value.has(card.id));
});

const currentPage = ref(1);

function selectAll(): void {
  selectAllCards(allCards.value);
}

function updateLayoutSettings(settings: PrintLayoutSettings): void {
  updateLayout(settings);
  currentPage.value = 1; // Reset to first page when settings change
}

function prevPage(): void {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
}

function nextPage(): void {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
}

function getTypeLabel(type: CardType): string {
  const labels: Record<CardType, string> = {
    [CardTypeEnum.EQUIPMENT]: 'Ekwipunek',
    [CardTypeEnum.SPELL]: 'Czar',
    [CardTypeEnum.SKILL]: 'Umiejętność',
    [CardTypeEnum.QUEST]: 'Zadanie',
    [CardTypeEnum.ITEM]: 'Przedmiot',
    [CardTypeEnum.NPC]: 'NPC',
    [CardTypeEnum.LOCATION]: 'Lokacja',
  };
  return labels[type] || type;
}

function handleExportPDF(): void {
  // TODO: Implement PDF export
  alert('Eksport do PDF - funkcja w przygotowaniu');
}

function handleExportPNG(): void {
  // TODO: Implement PNG export
  alert('Eksport do PNG - funkcja w przygotowaniu');
}

function handlePrint(): void {
  window.print();
}
</script>

<style scoped lang="scss">
.print-layout-page {
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: #e0e0e0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 3px solid rgba(184, 134, 11, 0.5);

  h1 {
    margin: 0;
    font-size: 2.5rem;
    color: #f4d03f;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.7);
    font-family: 'Cinzel', 'Georgia', serif;
    letter-spacing: 1px;
  }
}

.print-layout-container {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 2rem;
  max-width: 1600px;
  margin: 0 auto;
}

.left-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.card-selection {
  background: rgba(20, 20, 40, 0.95);
  border: 2px solid rgba(139, 69, 19, 0.6);
  border-radius: 12px;
  padding: 1.5rem;
  max-height: 600px;
  display: flex;
  flex-direction: column;
}

.selection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  h3 {
    margin: 0;
    color: #f4d03f;
    font-family: 'Cinzel', 'Georgia', serif;
    font-size: 1.2rem;
  }
}

.selection-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-small {
  padding: 0.4rem 0.8rem;
  background: rgba(139, 69, 19, 0.6);
  border: 1px solid rgba(139, 69, 19, 0.8);
  border-radius: 6px;
  color: #fff;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(139, 69, 19, 0.8);
  }
}

.cards-selection-list {
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.card-selection-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(139, 69, 19, 0.3);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.5);
    border-color: rgba(139, 69, 19, 0.5);
  }

  &.selected {
    background: rgba(139, 69, 19, 0.3);
    border-color: rgba(184, 134, 11, 0.6);
  }

  input[type='checkbox'] {
    width: 20px;
    height: 20px;
    cursor: pointer;
    accent-color: #8b4513;
  }
}

.card-selection-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.card-selection-name {
  font-weight: 600;
  color: #d0d0d0;
  font-size: 0.9rem;
}

.card-selection-type {
  font-size: 0.75rem;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  display: inline-block;
  width: fit-content;

  &.type-equipment {
    background: rgba(139, 69, 19, 0.3);
    color: #d4a574;
  }

  &.type-spell {
    background: rgba(75, 0, 130, 0.3);
    color: #ba55d3;
  }

  &.type-skill {
    background: rgba(0, 100, 0, 0.3);
    color: #90ee90;
  }

  &.type-quest {
    background: rgba(184, 134, 11, 0.3);
    color: #ffd700;
  }

  &.type-item {
    background: rgba(105, 105, 105, 0.3);
    color: #d3d3d3;
  }

  &.type-npc {
    background: rgba(139, 0, 0, 0.3);
    color: #ff6b6b;
  }

  &.type-location {
    background: rgba(0, 50, 100, 0.3);
    color: #87ceeb;
  }
}

.right-panel {
  min-width: 0;
}

.btn-secondary {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: rgba(20, 20, 40, 0.8);
  color: #d0d0d0;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
  border: 2px solid rgba(255, 255, 255, 0.2);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.4);
  }
}

@media (max-width: 1200px) {
  .print-layout-container {
    grid-template-columns: 1fr;
  }

  .left-panel {
    order: 2;
  }

  .right-panel {
    order: 1;
  }
}
</style>

