<template>
  <div v-if="hasMap" class="map-legend">
    <h4 class="legend-title">Legenda</h4>
    <div class="legend-items">
      <div
        v-for="terrain in terrainTypes"
        :key="terrain.name"
        class="legend-item"
      >
        <span
          v-if="!terrain.emoji && terrain.name !== 'Rzeka' && terrain.name !== 'Droga'"
          class="legend-color"
          :style="{ background: terrain.color }"
        ></span>
        <span
          v-else-if="terrain.name === 'Rzeka'"
          class="legend-river"
          :style="{ borderBottomColor: terrain.color }"
        ></span>
        <span
          v-else-if="terrain.name === 'Droga'"
          class="legend-road"
          :style="{ borderBottomColor: terrain.color }"
        ></span>
        <span v-else class="legend-marker">{{ terrain.emoji }}</span>
        <span>{{ terrain.name }}</span>
      </div>

      <!-- POI section separator -->
      <div v-if="samplePOI.length > 0" class="legend-separator"></div>

      <!-- Sample POI -->
      <div
        v-for="poiType in samplePOI"
        :key="poiType.type"
        class="legend-item"
      >
        <span class="legend-marker">{{ poiType.emoji }}</span>
        <span>{{ poiType.name }}</span>
      </div>

      <div v-if="samplePOI.length > 0" class="legend-hint">
        + {{ POI_TYPES.length - samplePOI.length }} więcej POI
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useMapGeneratorStore } from '~/stores/map-generator/map-generator';
import { TERRAIN_TYPES, POI_TYPES } from '~/shared/types/map-generator.types';

const store = useMapGeneratorStore();
const hasMap = computed(() => store.hasMap);

const terrainTypes = [
  ...TERRAIN_TYPES,
  { name: 'Miasto', emoji: '🏰' },
  { name: 'Wioska', emoji: '🏠' },
];

// Show sample POI in legend (first 6 types)
const samplePOI = POI_TYPES.slice(0, 6);
</script>

<style scoped lang="scss">
.map-legend {
  position: absolute;
  top: 24px;
  right: 24px;
  z-index: 10;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 8px;
  padding: 12px 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.legend-title {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0 8px 0;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  flex-shrink: 0;
}

.legend-marker {
  width: 16px;
  text-align: center;
  flex-shrink: 0;
}

.legend-river {
  width: 16px;
  height: 3px;
  border-bottom: 2px solid;
  flex-shrink: 0;
}

.legend-road {
  width: 16px;
  height: 3px;
  border-bottom: 2px solid;
  flex-shrink: 0;
}

.legend-separator {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 8px 0;
}

.legend-hint {
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
  margin-top: 4px;
}
</style>

