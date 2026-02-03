<template>
  <div class="mtg-card" :style="{ backgroundColor: card.colorTheme || '#222' }">
    <div class="card-border">
      <div class="card-background">
        <!-- Header -->
        <div class="card-header">
          <span class="card-name">{{ card.name || 'Card Name' }}</span>
          <span class="card-cost">{{ card.cost }}</span>
        </div>

        <!-- Image -->
        <div class="card-art">
          <img v-if="card.imageUrl" :src="card.imageUrl" alt="Card Art" />
          <div
            v-else
            class="art-placeholder d-flex align-center justify-center text-grey"
          >
            <v-icon size="40">mdi-image</v-icon>
          </div>
        </div>

        <!-- Type Line -->
        <div class="card-type-line">
          <span
            >{{ card.type
            }}<span v-if="card.subType"> — {{ card.subType }}</span></span
          >
        </div>

        <!-- Text Box -->
        <div class="card-text-box">
          <!-- Stats Grid -->
          <div v-if="card.stats && card.stats.length > 0" class="stats-grid">
            <div v-for="(stat, i) in card.stats" :key="i" class="stat-item">
              <span class="stat-label">{{ stat.label }}:</span>
              <span class="stat-value">{{ stat.value }}</span>
            </div>
          </div>

          <v-divider
            v-if="card.stats && card.stats.length > 0 && card.description"
            class="my-1"
          ></v-divider>

          <div class="card-text" v-html="formattedText"></div>
          <div v-if="card.flavorText" class="flavor-text">
            {{ card.flavorText }}
          </div>
        </div>

        <!-- Footer / Tags -->
        <div class="card-footer" v-if="card.tags && card.tags.length > 0">
          <span v-for="tag in card.tags" :key="tag" class="tag-chip">{{
            tag
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { RpgCard } from '../types';

const props = defineProps<{
  card: Partial<RpgCard>;
}>();

const formattedText = computed(() => {
  if (!props.card.description) return '';
  return props.card.description.replace(/\n/g, '<br>');
});
</script>

<style scoped lang="scss">
.mtg-card {
  width: 63mm;
  height: 88mm;
  border-radius: 4mm;
  padding: 3mm;
  box-sizing: border-box;
  font-family: 'Times New Roman', serif;
  color: black;
  position: relative;
  overflow: hidden;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.5);
  transition: all 0.2s ease;

  .card-border {
    background: inherit;
    filter: brightness(0.9);
    height: 100%;
    border-radius: 2mm;
    display: flex;
    flex-direction: column;
    padding: 1mm;
  }

  .card-background {
    background-color: rgba(255, 255, 255, 0.95);
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 2mm;
    gap: 1mm;
    border-radius: 1mm;
  }

  .card-header,
  .card-type-line {
    background: white;
    border: 1px solid #ccc;
    border-bottom: 2px solid #aaa;
    border-radius: 2px;
    padding: 1px 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: bold;
    font-size: 9pt;
    height: 6mm;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .card-art {
    flex-grow: 1;
    border: 1px solid #777;
    margin: 1px 0;
    overflow: hidden;
    position: relative;
    max-height: 40%;
    background: #eee;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .card-text-box {
    border: 1px solid #ccc;
    flex-grow: 1;
    padding: 2mm;
    font-size: 8pt;
    display: flex;
    flex-direction: column;
    gap: 1mm;
    overflow: hidden;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2px;
    font-size: 0.9em;
  }

  .stat-item {
    display: flex;
    gap: 4px;
  }

  .stat-label {
    font-weight: bold;
  }

  .flavor-text {
    font-style: italic;
    font-size: 0.9em;
    margin-top: auto;
    color: #555;
  }

  .card-footer {
    position: absolute;
    bottom: 3.5mm;
    left: 5mm;
    right: 5mm;
    display: flex;
    gap: 2px;
    flex-wrap: wrap;
    justify-content: center;
    pointer-events: none;

    .tag-chip {
      background: rgba(0, 0, 0, 0.7);
      color: white;
      font-size: 6pt;
      padding: 0 4px;
      border-radius: 4px;
    }
  }
}
</style>
