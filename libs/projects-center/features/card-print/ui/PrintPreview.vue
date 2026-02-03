<template>
  <div class="print-preview">
    <div class="preview-controls">
      <button class="btn-secondary" @click="$emit('prev-page')" :disabled="currentPage === 1">
        ← Poprzednia
      </button>
      <span class="page-info">Strona {{ currentPage }} z {{ totalPages }}</span>
      <button
        class="btn-secondary"
        @click="$emit('next-page')"
        :disabled="currentPage >= totalPages"
      >
        Następna →
      </button>
    </div>

    <div
      class="a4-preview"
      :class="`orientation-${settings.orientation}`"
      :style="previewStyle"
    >
      <div
        v-for="(card, index) in cardsForPage"
        :key="card.id"
        class="print-card"
        :style="getCardStyle(index)"
      >
        <div class="print-card-inner" :class="{ 'show-border': settings.showBorders }">
          <div class="print-card-header">
            <h3 class="print-card-name">{{ card.name }}</h3>
            <span class="print-card-type" :class="`type-${card.type}`">
              {{ getTypeLabel(card.type) }}
            </span>
          </div>
          <p class="print-card-description">{{ card.description }}</p>
          <div v-if="card.tags.length > 0" class="print-card-tags">
            <span v-for="tag in card.tags.slice(0, 3)" :key="tag" class="print-tag">
              {{ tag }}
            </span>
          </div>
        </div>
        <div v-if="settings.showCutLines" class="cut-line"></div>
      </div>
    </div>

    <div class="preview-actions">
      <button class="btn-primary" @click="$emit('export-pdf')">Eksportuj do PDF</button>
      <button class="btn-primary" @click="$emit('export-png')">Eksportuj do PNG</button>
      <button class="btn-secondary" @click="$emit('print')">Drukuj</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Card, CardType, PrintLayoutSettings } from '@projects-center/entities/card';
import { CardType as CardTypeEnum } from '@projects-center/entities/card';

const props = defineProps<{
  cards: Card[];
  settings: PrintLayoutSettings;
  currentPage: number;
  totalPages: number;
}>();

const emit = defineEmits<{
  'prev-page': [];
  'next-page': [];
  'export-pdf': [];
  'export-png': [];
  'print': [];
}>();

const cardsForPage = computed(() => {
  const startIndex = (props.currentPage - 1) * (props.settings.columns * props.settings.rows);
  const endIndex = startIndex + props.settings.columns * props.settings.rows;
  return props.cards.slice(startIndex, endIndex);
});

const cardSize = computed(() => {
  const a4Width = props.settings.orientation === 'portrait' ? 210 : 297; // mm
  const a4Height = props.settings.orientation === 'portrait' ? 297 : 210; // mm

  const usableWidth =
    a4Width - props.settings.margins.left - props.settings.margins.right;
  const usableHeight =
    a4Height - props.settings.margins.top - props.settings.margins.bottom;

  return {
    width: usableWidth / props.settings.columns,
    height: usableHeight / props.settings.rows,
  };
});

const previewStyle = computed(() => {
  const a4Width = props.settings.orientation === 'portrait' ? 210 : 297;
  const a4Height = props.settings.orientation === 'portrait' ? 297 : 210;
  const scale = 0.5; // Scale down for preview

  return {
    width: `${a4Width * scale}mm`,
    height: `${a4Height * scale}mm`,
    padding: `${props.settings.margins.top * scale}mm ${props.settings.margins.right * scale}mm ${props.settings.margins.bottom * scale}mm ${props.settings.margins.left * scale}mm`,
  };
});

function getCardStyle(index: number) {
  const row = Math.floor(index / props.settings.columns);
  const col = index % props.settings.columns;

  return {
    width: `${cardSize.value.width * 0.5}mm`,
    height: `${cardSize.value.height * 0.5}mm`,
    position: 'absolute',
    left: `${col * cardSize.value.width * 0.5}mm`,
    top: `${row * cardSize.value.height * 0.5}mm`,
  };
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
</script>

<style scoped lang="scss">
.print-preview {
  width: 100%;
}

.preview-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.page-info {
  color: #d0d0d0;
  font-weight: 600;
  min-width: 120px;
  text-align: center;
}

.a4-preview {
  position: relative;
  background: white;
  margin: 0 auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  border: 1px solid #ccc;

  &.orientation-portrait {
    aspect-ratio: 210 / 297;
  }

  &.orientation-landscape {
    aspect-ratio: 297 / 210;
  }
}

.print-card {
  position: absolute;
  padding: 2px;
  box-sizing: border-box;
}

.print-card-inner {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(30, 30, 50, 0.98) 0%, rgba(20, 20, 40, 0.98) 100%);
  border-radius: 4px;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &.show-border {
    border: 1px solid rgba(139, 69, 19, 0.6);
  }
}

.print-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.print-card-name {
  margin: 0;
  font-size: 0.7rem;
  font-weight: bold;
  color: #f4d03f;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.print-card-type {
  font-size: 0.5rem;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
  text-transform: uppercase;
  font-weight: 600;
  flex-shrink: 0;

  &.type-equipment {
    background: rgba(139, 69, 19, 0.4);
    color: #d4a574;
  }

  &.type-spell {
    background: rgba(75, 0, 130, 0.4);
    color: #ba55d3;
  }

  &.type-skill {
    background: rgba(0, 100, 0, 0.4);
    color: #90ee90;
  }

  &.type-quest {
    background: rgba(184, 134, 11, 0.4);
    color: #ffd700;
  }

  &.type-item {
    background: rgba(105, 105, 105, 0.4);
    color: #d3d3d3;
  }

  &.type-npc {
    background: rgba(139, 0, 0, 0.4);
    color: #ff6b6b;
  }

  &.type-location {
    background: rgba(0, 50, 100, 0.4);
    color: #87ceeb;
  }
}

.print-card-description {
  margin: 0.25rem 0;
  font-size: 0.5rem;
  color: #d0d0d0;
  line-height: 1.3;
  flex: 1;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.print-card-tags {
  display: flex;
  gap: 0.2rem;
  flex-wrap: wrap;
  margin-top: 0.25rem;
}

.print-tag {
  font-size: 0.4rem;
  padding: 0.1rem 0.3rem;
  background: rgba(139, 69, 19, 0.3);
  border: 1px solid rgba(139, 69, 19, 0.5);
  border-radius: 3px;
  color: #d4a574;
}

.cut-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 1px dashed rgba(255, 0, 0, 0.3);
  pointer-events: none;
}

.preview-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.btn-primary {
  background: linear-gradient(135deg, #8b4513 0%, #a0522d 100%);
  color: #fff;
  border-color: rgba(184, 134, 11, 0.5);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(139, 69, 19, 0.4);
    border-color: rgba(184, 134, 11, 0.8);
  }
}

.btn-secondary {
  background: transparent;
  color: #d0d0d0;
  border-color: rgba(255, 255, 255, 0.2);

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.4);
  }
}
</style>

