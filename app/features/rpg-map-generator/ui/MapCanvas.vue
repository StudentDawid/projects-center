<template>
  <div class="map-canvas-wrapper">
    <div v-if="!hasMap" class="map-placeholder">
      <v-icon icon="mdi-map-marker-question" size="64" color="grey" />
      <p>Kliknij "Generuj mapę" aby stworzyć nowy świat</p>
    </div>
    <canvas
      v-show="hasMap"
      ref="canvasRef"
      class="map-canvas"
      :width="canvasSize"
      :height="canvasSize"
    ></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useMapGeneratorStore } from '~/stores/map-generator/map-generator';
import { useMapGenerator } from '../hooks/useMapGenerator';
import { useSettlements } from '../hooks/useSettlements';

const store = useMapGeneratorStore();
const { generateMap, isGenerating } = useMapGenerator();
const { generateSettlements } = useSettlements();

const canvasRef = ref<HTMLCanvasElement | null>(null);

const hasMap = computed(() => store.hasMap);
const canvasSize = computed(() => store.canvasSize);

/**
 * Generate complete map (terrain + settlements)
 */
async function handleGenerateMap() {
  if (!canvasRef.value) return;

  await generateMap(canvasRef.value);

  // Generate settlements after terrain is generated
  if (canvasRef.value) {
    const ctx = canvasRef.value.getContext('2d');
    if (ctx) {
      const size = store.mapSettings.size;
      const waterThreshold = (store.mapSettings.waterLevel / 100) * 0.3 - 0.15;
      generateSettlements(ctx, size, waterThreshold);
    }
  }
}

/**
 * Export map as PNG data URL
 */
function handleExportMap(): string | null {
  if (!canvasRef.value) return null;
  return canvasRef.value.toDataURL('image/png');
}

// Expose methods for parent component
defineExpose({
  canvas: canvasRef,
  generateMap: handleGenerateMap,
  exportMap: handleExportMap,
});
</script>

<style scoped lang="scss">
.map-canvas-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 24px;
  position: relative;
}

.map-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
}

.map-canvas {
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  max-width: 100%;
  height: auto;
}
</style>

