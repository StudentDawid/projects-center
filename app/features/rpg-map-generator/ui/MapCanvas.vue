<template>
  <div class="map-canvas-wrapper">
    <div v-if="!hasMap" class="map-placeholder">
      <v-icon icon="mdi-map-marker-question" size="64" color="grey" />
      <p>Kliknij "Generuj mapę" aby stworzyć nowy świat</p>
    </div>
    <svg
      ref="svgRef"
      class="map-svg"
      :class="{ 'map-svg-hidden': !hasMap }"
      :viewBox="`0 0 ${viewBoxWidth} ${viewBoxHeight}`"
      preserveAspectRatio="xMidYMid meet"
      @mousemove="handleMouseMove"
    >
      <!-- Voronoi cells -->
      <g class="voronoi-cells">
        <path
          v-for="(cell, index) in voronoiCells"
          :key="`cell-${index}`"
          :d="cell.path"
          :fill="`rgb(${cell.color.r}, ${cell.color.g}, ${cell.color.b})`"
          :stroke="cell.stroke"
          :stroke-width="cell.strokeWidth"
          class="voronoi-cell"
          @mouseenter="hoveredCell = cell"
          @mouseleave="
            () => {
              hoveredCell = null;
              tooltipPosition = null;
            }
          "
          @click="selectedCell = cell"
        />
      </g>

      <!-- Settlements layer -->
      <g class="settlements-layer">
        <g
          v-for="(settlement, index) in settlements"
          :key="index"
          class="settlement"
          @mouseenter="hoveredSettlement = settlement"
          @mouseleave="
            () => {
              hoveredSettlement = null;
              tooltipPosition = null;
            }
          "
        >
          <text
            :x="settlement.x"
            :y="settlement.y"
            :font-size="settlement.type === 'city' ? 16 : 12"
            text-anchor="middle"
            dominant-baseline="middle"
            class="settlement-icon"
          >
            {{ settlement.type === 'city' ? '🏰' : '🏠' }}
          </text>
          <!-- Settlement name label -->
          <text
            :x="settlement.x"
            :y="settlement.y + (settlement.type === 'city' ? 20 : 16)"
            :font-size="settlement.type === 'city' ? 10 : 8"
            text-anchor="middle"
            dominant-baseline="middle"
            class="settlement-label"
            fill="rgba(255, 255, 255, 0.9)"
          >
            {{ settlement.name }}
          </text>
        </g>
      </g>
    </svg>

    <!-- Tooltip for settlements and cells -->
    <div
      v-if="tooltipContent && tooltipPosition"
      class="map-tooltip"
      :style="{
        left: `${tooltipPosition.x}px`,
        top: `${tooltipPosition.y}px`,
      }"
    >
      <div class="tooltip-title">{{ tooltipContent.title }}</div>
      <div v-if="tooltipContent.subtitle" class="tooltip-subtitle">
        {{ tooltipContent.subtitle }}
      </div>
      <div v-if="tooltipContent.terrain" class="tooltip-terrain">
        Teren: {{ tooltipContent.terrain }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useMapGeneratorStore } from '~/stores/map-generator/map-generator';
import { useMapGenerator, type VoronoiCell } from '../hooks/useMapGenerator';
import { useWindowSize } from '~/shared/lib/useWindowSize';
import type { Settlement } from '~/shared/types/map-generator.types';

const store = useMapGeneratorStore();
const { generateMap, voronoiCells, settlements } = useMapGenerator();
const { width, height } = useWindowSize();

const svgRef = ref<SVGSVGElement | null>(null);
const hoveredCell = ref<VoronoiCell | null>(null);
const hoveredSettlement = ref<Settlement | null>(null);
const selectedCell = ref<VoronoiCell | null>(null);
const tooltipPosition = ref<{ x: number; y: number } | null>(null);

const hasMap = computed(() => store.hasMap);
// Use screen size for viewBox
const viewBoxWidth = computed(() => width.value || 1920);
const viewBoxHeight = computed(() => height.value || 1080);

const tooltipContent = computed(() => {
  if (hoveredSettlement.value) {
    return {
      title: hoveredSettlement.value.name,
      subtitle: hoveredSettlement.value.type === 'city' ? 'Miasto' : 'Wioska',
    };
  }
  if (hoveredCell.value?.site.data) {
    const height = hoveredCell.value.site.data.height;
    const waterThreshold = (store.mapSettings.waterLevel / 100) * 0.3 - 0.15;
    const mountainThreshold = 1 - (store.mapSettings.mountainLevel / 100) * 0.4;

    let terrainType = 'Równina';
    if (height < waterThreshold - 0.1) terrainType = 'Głęboka woda';
    else if (height < waterThreshold) terrainType = 'Płytka woda';
    else if (height < waterThreshold + 0.05) terrainType = 'Plaża';
    else if (height > mountainThreshold + 0.1) terrainType = 'Szczyt śnieżny';
    else if (height > mountainThreshold) terrainType = 'Góry';
    else if (
      hoveredCell.value.site.data.color.r === 39 &&
      hoveredCell.value.site.data.color.g === 174
    ) {
      terrainType = 'Las';
    }

    return {
      title: 'Komórka terenu',
      terrain: terrainType,
      subtitle: `Wysokość: ${(height * 100).toFixed(1)}%`,
    };
  }
  return null;
});

/**
 * Generate complete map (terrain + settlements)
 */
async function handleGenerateMap() {
  if (!svgRef.value) return;
  const mapWidth = width.value || window.innerWidth || 1920;
  const mapHeight = height.value || window.innerHeight || 1080;
  await generateMap(svgRef.value, mapWidth, mapHeight);
}

/**
 * Handle mouse move for tooltip positioning
 */
function handleMouseMove(event: MouseEvent) {
  if (!svgRef.value || (!hoveredCell.value && !hoveredSettlement.value)) {
    tooltipPosition.value = null;
    return;
  }

  const wrapperRect = (
    svgRef.value.parentElement as HTMLElement
  )?.getBoundingClientRect();
  if (!wrapperRect) return;

  const x = event.clientX - wrapperRect.left;
  const y = event.clientY - wrapperRect.top;

  // Position tooltip to avoid going off screen
  const tooltipWidth = 200;
  const tooltipHeight = 80;
  let tooltipX = x + 15;
  let tooltipY = y - 15;

  // Adjust if tooltip would go off right edge
  if (tooltipX + tooltipWidth > wrapperRect.width) {
    tooltipX = x - tooltipWidth - 15;
  }

  // Adjust if tooltip would go off top edge
  if (tooltipY - tooltipHeight < 0) {
    tooltipY = y + 15;
  }

  tooltipPosition.value = {
    x: tooltipX,
    y: tooltipY,
  };
}

/**
 * Export map as PNG data URL (async)
 */
async function handleExportMap(): Promise<string | null> {
  if (!svgRef.value) return null;

  try {
    // Convert SVG to PNG
    const svgData = new XMLSerializer().serializeToString(svgRef.value);
    const svgBlob = new Blob([svgData], {
      type: 'image/svg+xml;charset=utf-8',
    });
    const url = URL.createObjectURL(svgBlob);

    return new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = viewBoxWidth.value;
        canvas.height = viewBoxHeight.value;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#1a1a2e'; // Background color
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL('image/png');
          URL.revokeObjectURL(url);
          resolve(dataUrl);
        } else {
          URL.revokeObjectURL(url);
          reject(new Error('Could not get canvas context'));
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load SVG image'));
      };
      img.src = url;
    });
  } catch (error) {
    console.error('Export error:', error);
    return null;
  }
}

// Track if we've tried to auto-generate (prevent multiple attempts)
const hasAttemptedAutoGenerate = ref(false);

// Auto-generate map on mount
onMounted(async () => {
  if (hasAttemptedAutoGenerate.value) return;
  hasAttemptedAutoGenerate.value = true;

  console.log('[MapCanvas] onMounted - Starting auto-generation...');

  // Wait for SVG to be ready - use multiple ticks
  await nextTick();
  await nextTick();
  await nextTick();

  // Ensure window size is available
  const mapWidth =
    width.value || (typeof window !== 'undefined' ? window.innerWidth : 1920);
  const mapHeight =
    height.value || (typeof window !== 'undefined' ? window.innerHeight : 1080);

  console.log('[MapCanvas] Window size:', {
    mapWidth,
    mapHeight,
    width: width.value,
    height: height.value,
  });

  // Wait a bit for everything to stabilize
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Ensure SVG ref is available - keep trying
  let attempts = 0;
  while (!svgRef.value && attempts < 10) {
    await nextTick();
    attempts++;
  }

  console.log('[MapCanvas] SVG ref available:', !!svgRef.value);
  console.log('[MapCanvas] Has map (store):', hasMap.value);
  console.log('[MapCanvas] Voronoi cells count:', voronoiCells.value.length);

  // Reset mapGenerated flag if we don't have cells (persisted state can be out of sync)
  if (hasMap.value && voronoiCells.value.length === 0) {
    console.log('[MapCanvas] Resetting mapGenerated flag - cells are empty');
    store.setMapGenerated(false);
  }

  // ALWAYS generate map on mount - voronoiCells are not persisted
  // The store's mapGenerated flag can be true from localStorage, but cells are always empty on refresh
  if (svgRef.value && mapWidth > 0 && mapHeight > 0) {
    console.log('[MapCanvas] Auto-generating map...', { mapWidth, mapHeight });
    try {
      await handleGenerateMap();
      console.log(
        '[MapCanvas] Map generated successfully! Cells:',
        voronoiCells.value.length
      );
    } catch (error) {
      console.error('[MapCanvas] Error generating map:', error);
      hasAttemptedAutoGenerate.value = false; // Allow retry on error
    }
  } else {
    console.warn('[MapCanvas] Cannot generate map:', {
      svgRef: !!svgRef.value,
      mapWidth,
      mapHeight,
    });
    hasAttemptedAutoGenerate.value = false; // Allow retry if conditions not met
  }
});

// Watch for window size changes and regenerate if needed (optional)
watch([width, height], async (newSize, oldSize) => {
  // Only regenerate if size changed significantly and we have a map
  if (
    hasMap.value &&
    svgRef.value &&
    oldSize[0] > 0 &&
    oldSize[1] > 0 &&
    (Math.abs(newSize[0] - oldSize[0]) > 50 ||
      Math.abs(newSize[1] - oldSize[1]) > 50)
  ) {
    await handleGenerateMap();
  }
});

// Expose methods for parent component
defineExpose({
  svg: svgRef,
  generateMap: handleGenerateMap,
  exportMap: handleExportMap,
});
</script>

<style scoped lang="scss">
.map-canvas-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
}

.map-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
}

.map-svg {
  width: 100%;
  height: 100%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  background: #1a1a2e;
  opacity: 1;
  transition: opacity 0.3s;
}

.map-svg-hidden {
  opacity: 0;
  pointer-events: none;
}

.voronoi-cells {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.voronoi-cell {
  transition:
    opacity 0.2s,
    stroke-width 0.2s;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
    stroke-width: 1.5;
  }
}

.settlements-layer {
  pointer-events: none;
}

.settlement {
  pointer-events: auto;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
}

.settlement-icon {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.8));
  pointer-events: auto;
  cursor: pointer;
}

.settlement-label {
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.9));
  pointer-events: none;
  font-weight: 600;
  font-family: 'Cinzel', serif;
}

.map-tooltip {
  position: absolute;
  background: rgba(0, 0, 0, 0.9);
  color: #fff;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  pointer-events: none;
  z-index: 1000;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  max-width: 200px;
  transform: translate(-50%, -100%);
}

.tooltip-title {
  font-weight: 600;
  color: #4caf50;
  margin-bottom: 4px;
  font-family: 'Cinzel', serif;
}

.tooltip-subtitle {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 4px;
}

.tooltip-terrain {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 4px;
  padding-top: 4px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
