<template>
  <div class="map-canvas-wrapper" @wheel.prevent="handleWheel">
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
      @mousedown="handleMouseDown"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseLeave"
      @wheel.prevent="handleWheel"
    >
      <!-- Transform group for zoom and pan -->
      <g
        ref="transformGroupRef"
        class="transform-group"
        :transform="`translate(${panX}, ${panY}) scale(${zoom})`"
        :style="{ transformOrigin: '0 0' }"
      >
        <!-- Voronoi cells - optimized with viewport culling for large maps -->
        <g class="voronoi-cells">
          <path
            v-for="(cell, index) in visibleCells"
            :key="`cell-${index}`"
            :d="cell.path"
            :fill="`rgb(${cell.color.r}, ${cell.color.g}, ${cell.color.b})`"
            :stroke="cell.stroke"
            :stroke-width="cell.strokeWidth"
            class="voronoi-cell"
            @mouseenter="hoveredCell = cell"
            @mouseleave="handleCellMouseLeave"
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
            @mouseleave="handleSettlementMouseLeave"
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
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useMapGeneratorStore } from '~/stores/map-generator/map-generator';
import { useMapGenerator, type VoronoiCell } from '../hooks/useMapGenerator';
import { useWindowSize } from '~/shared/lib/useWindowSize';
import { throttleRAF, debounce } from '~/shared/lib/throttle';
import type { Settlement } from '~/shared/types/map-generator.types';

const store = useMapGeneratorStore();
const { generateMap, voronoiCells, settlements } = useMapGenerator();
const { width, height } = useWindowSize();

const svgRef = ref<SVGSVGElement | null>(null);
const transformGroupRef = ref<SVGGElement | null>(null);
const hoveredCell = ref<VoronoiCell | null>(null);
const hoveredSettlement = ref<Settlement | null>(null);
const selectedCell = ref<VoronoiCell | null>(null);
const tooltipPosition = ref<{ x: number; y: number } | null>(null);
const showTooltip = ref(false);
let tooltipDelayTimer: number | null = null;

// Pan and zoom state
const panX = ref(0);
const panY = ref(0);
const zoom = ref(1);
const minZoom = 1; // Cannot zoom out below initial view
const maxZoom = 4; // Can zoom in up to 4x

// Pan state
const isPanning = ref(false);
const panStart = ref({ x: 0, y: 0 });
const panStartTranslate = ref({ x: 0, y: 0 });

const hasMap = computed(() => store.hasMap);
// Use screen size for viewBox - memoized to avoid recalculation
const viewBoxWidth = computed(() => width.value || 1920);
const viewBoxHeight = computed(() => height.value || 1080);

// Viewport culling - only render visible cells for better performance
// This significantly improves performance for maps with >2000 cells
const visibleCells = computed(() => {
  const cells = voronoiCells.value;

  // If we have less than 2000 cells, render all (no culling needed)
  if (cells.length < 2000) {
    return cells;
  }

  // Calculate viewport bounds in SVG coordinates
  const viewportLeft = -panX.value / zoom.value;
  const viewportRight = (viewBoxWidth.value - panX.value) / zoom.value;
  const viewportTop = -panY.value / zoom.value;
  const viewportBottom = (viewBoxHeight.value - panY.value) / zoom.value;

  // Add padding to viewport to render cells slightly outside view
  const padding = Math.max(viewBoxWidth.value, viewBoxHeight.value) * 0.1;
  const paddedLeft = viewportLeft - padding;
  const paddedRight = viewportRight + padding;
  const paddedTop = viewportTop - padding;
  const paddedBottom = viewportBottom + padding;

  // Filter cells that intersect with viewport
  // Simple bounding box check - parse path to get approximate bounds
  return cells.filter((cell) => {
    const site = cell.site;
    // Check if cell site is within padded viewport
    if (
      site.x >= paddedLeft &&
      site.x <= paddedRight &&
      site.y >= paddedTop &&
      site.y <= paddedBottom
    ) {
      return true;
    }

    // Also check if path string contains coordinates in viewport
    // This is a simple heuristic - in production, you'd want more precise bounds checking
    const pathMatch = cell.path.match(/M\s*([-\d.]+)\s*,\s*([-\d.]+)/);
    if (pathMatch) {
      const pathX = parseFloat(pathMatch[1] || '0');
      const pathY = parseFloat(pathMatch[2] || '0');
      return (
        pathX >= paddedLeft &&
        pathX <= paddedRight &&
        pathY >= paddedTop &&
        pathY <= paddedBottom
      );
    }

    return false;
  });
});

// Memoize terrain thresholds to avoid recalculation
const terrainThresholds = computed(() => {
  const waterThreshold = (store.mapSettings.waterLevel / 100) * 0.3 - 0.15;
  const mountainThreshold = 1 - (store.mapSettings.mountainLevel / 100) * 0.4;
  return { waterThreshold, mountainThreshold };
});

const tooltipContent = computed(() => {
  if (hoveredSettlement.value) {
    return {
      title: hoveredSettlement.value.name,
      subtitle: hoveredSettlement.value.type === 'city' ? 'Miasto' : 'Wioska',
    };
  }
  if (hoveredCell.value?.site.data) {
    const height = hoveredCell.value.site.data.height;
    const { waterThreshold, mountainThreshold } = terrainThresholds.value;

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

// Store mouse position for throttled updates
const mousePosition = ref({ x: 0, y: 0 });

/**
 * Update mouse position (throttled with RAF)
 */
const updateMousePositionThrottled = throttleRAF(() => {
  if (!svgRef.value) return;

  const wrapperRect = (
    svgRef.value.parentElement as HTMLElement
  )?.getBoundingClientRect();
  if (!wrapperRect) return;

  mousePosition.value = {
    x: currentMouseEvent.clientX - wrapperRect.left,
    y: currentMouseEvent.clientY - wrapperRect.top,
  };
});

// Store current mouse event for throttled handler
let currentMouseEvent: MouseEvent;

/**
 * Handle mouse move for tooltip positioning, panning, and edge pan
 * OPTIMIZATION: Uses RAF throttling for better performance
 */
function handleMouseMove(event: MouseEvent) {
  if (!svgRef.value) return;

  const wrapperRect = (
    svgRef.value.parentElement as HTMLElement
  )?.getBoundingClientRect();
  if (!wrapperRect) return;

  const x = event.clientX - wrapperRect.left;
  const y = event.clientY - wrapperRect.top;

  // Handle panning - immediate update for smooth panning
  if (isPanning.value) {
    const deltaX = x - panStart.value.x;
    const deltaY = y - panStart.value.y;
    panX.value = panStartTranslate.value.x + deltaX;
    panY.value = panStartTranslate.value.y + deltaY;
    return;
  }

  // Throttle tooltip position updates
  currentMouseEvent = event;
  updateMousePositionThrottled();

  // Handle tooltip positioning with delay
  if (!hoveredCell.value && !hoveredSettlement.value) {
    // Clear tooltip immediately when not hovering
    if (tooltipDelayTimer) {
      window.clearTimeout(tooltipDelayTimer);
      tooltipDelayTimer = null;
    }
    showTooltip.value = false;
    tooltipPosition.value = null;
    return;
  }

  // Update tooltip position (use stored position for throttled updates)
  const tooltipWidth = 200;
  const tooltipHeight = 80;
  let tooltipX = mousePosition.value.x + 15;
  let tooltipY = mousePosition.value.y - 15;

  // Adjust if tooltip would go off right edge
  if (tooltipX + tooltipWidth > wrapperRect.width) {
    tooltipX = mousePosition.value.x - tooltipWidth - 15;
  }

  // Adjust if tooltip would go off top edge
  if (tooltipY - tooltipHeight < 0) {
    tooltipY = mousePosition.value.y + 15;
  }

  tooltipPosition.value = {
    x: tooltipX,
    y: tooltipY,
  };

  // Show tooltip after delay (only if still hovering)
  if (!showTooltip.value) {
    if (tooltipDelayTimer) {
      window.clearTimeout(tooltipDelayTimer);
    }
    tooltipDelayTimer = window.setTimeout(() => {
      if (hoveredCell.value || hoveredSettlement.value) {
        showTooltip.value = true;
      }
    }, 500); // 500ms delay before showing tooltip
  }
}

/**
 * Handle mouse down - start panning
 */
function handleMouseDown(event: MouseEvent) {
  // Only pan with middle mouse button
  if (event.button === 1) {
    event.preventDefault();
    isPanning.value = true;
    panStart.value = { x: event.clientX, y: event.clientY };
    panStartTranslate.value = { x: panX.value, y: panY.value };
  }
}

/**
 * Handle mouse up - stop panning
 */
function handleMouseUp(event: MouseEvent) {
  if (event.button === 1 || event.button === 0) {
    isPanning.value = false;
  }
}

/**
 * Handle cell mouse leave
 */
function handleCellMouseLeave() {
  hoveredCell.value = null;
  if (tooltipDelayTimer) {
    window.clearTimeout(tooltipDelayTimer);
    tooltipDelayTimer = null;
  }
  showTooltip.value = false;
  tooltipPosition.value = null;
}

/**
 * Handle settlement mouse leave
 */
function handleSettlementMouseLeave() {
  hoveredSettlement.value = null;
  if (tooltipDelayTimer) {
    window.clearTimeout(tooltipDelayTimer);
    tooltipDelayTimer = null;
  }
  showTooltip.value = false;
  tooltipPosition.value = null;
}

/**
 * Handle mouse leave - stop panning and hide tooltip
 */
function handleMouseLeave() {
  isPanning.value = false;
  if (tooltipDelayTimer) {
    window.clearTimeout(tooltipDelayTimer);
    tooltipDelayTimer = null;
  }
  showTooltip.value = false;
  tooltipPosition.value = null;
}

/**
 * Handle wheel event - zoom in/out
 * OPTIMIZATION: Can be called from both wrapper and SVG
 */
function handleWheel(event: WheelEvent) {
  if (!svgRef.value) return;

  event.preventDefault();
  event.stopPropagation();

  // Get the correct wrapper element
  const wrapperElement = svgRef.value.parentElement as HTMLElement;
  if (!wrapperElement) return;

  const wrapperRect = wrapperElement.getBoundingClientRect();
  if (!wrapperRect) return;

  // Get mouse position relative to wrapper (works for both wrapper and SVG events)
  const x = event.clientX - wrapperRect.left;
  const y = event.clientY - wrapperRect.top;

  // Zoom factor - use deltaMode to support both pixel and line scrolling
  const deltaY =
    event.deltaMode === WheelEvent.DOM_DELTA_LINE
      ? event.deltaY * 16
      : event.deltaY;
  const zoomFactor = deltaY > 0 ? 0.9 : 1.1;
  const newZoom = Math.max(minZoom, Math.min(maxZoom, zoom.value * zoomFactor));

  if (Math.abs(newZoom - zoom.value) < 0.001) return; // Already at limit (with epsilon for floating point)

  // Get point in SVG coordinates before zoom
  const svgPoint = svgRef.value.createSVGPoint();
  svgPoint.x = (x - panX.value) / zoom.value;
  svgPoint.y = (y - panY.value) / zoom.value;

  // Apply zoom
  zoom.value = newZoom;

  // Adjust pan to zoom toward mouse position
  const newX = x - svgPoint.x * newZoom;
  const newY = y - svgPoint.y * newZoom;

  panX.value = newX;
  panY.value = newY;
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
  } catch {
    return null;
  }
}

// Track if we've tried to auto-generate (prevent multiple attempts)
const hasAttemptedAutoGenerate = ref(false);

// Cleanup on unmount
onUnmounted(() => {
  if (tooltipDelayTimer) {
    window.clearTimeout(tooltipDelayTimer);
    tooltipDelayTimer = null;
  }
});

// Reset zoom and pan when map is generated
watch(hasMap, (newValue) => {
  if (newValue) {
    // Center and reset zoom
    panX.value = 0;
    panY.value = 0;
    zoom.value = 1;
  }
});

// Auto-generate map on mount
onMounted(async () => {
  if (hasAttemptedAutoGenerate.value) return;
  hasAttemptedAutoGenerate.value = true;

  // Wait for SVG to be ready - use multiple ticks
  await nextTick();
  await nextTick();
  await nextTick();

  // Ensure window size is available
  const mapWidth =
    width.value || (typeof window !== 'undefined' ? window.innerWidth : 1920);
  const mapHeight =
    height.value || (typeof window !== 'undefined' ? window.innerHeight : 1080);

  // Wait a bit for everything to stabilize
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Ensure SVG ref is available - keep trying
  let attempts = 0;
  while (!svgRef.value && attempts < 10) {
    await nextTick();
    attempts++;
  }

  // Reset mapGenerated flag if we don't have cells (persisted state can be out of sync)
  if (hasMap.value && voronoiCells.value.length === 0) {
    store.setMapGenerated(false);
  }

  // ALWAYS generate map on mount - voronoiCells are not persisted
  // The store's mapGenerated flag can be true from localStorage, but cells are always empty on refresh
  if (svgRef.value && mapWidth > 0 && mapHeight > 0) {
    try {
      await handleGenerateMap();
    } catch {
      hasAttemptedAutoGenerate.value = false; // Allow retry on error
    }
  } else {
    hasAttemptedAutoGenerate.value = false; // Allow retry if conditions not met
  }
});

// Debounced regenerate function to avoid multiple rapid regenerations
const debouncedRegenerate = debounce(async () => {
  if (hasMap.value && svgRef.value) {
    await handleGenerateMap();
  }
}, 300);

// Recalculate visible cells when viewport changes (zoom/pan)
watch(
  [panX, panY, zoom, voronoiCells],
  () => {
    // Trigger recomputation of visibleCells
    // This is handled automatically by computed, but we can force update if needed
  },
  { flush: 'post' }
);

// Watch for window size changes and regenerate if needed
// OPTIMIZATION: Debounced and only regenerates on significant size change
watch([width, height], async (newSize, oldSize) => {
  // Only regenerate if size changed significantly and we have a map
  if (
    hasMap.value &&
    svgRef.value &&
    oldSize[0] > 0 &&
    oldSize[1] > 0 &&
    (Math.abs(newSize[0] - oldSize[0]) > 100 ||
      Math.abs(newSize[1] - oldSize[1]) > 100)
  ) {
    debouncedRegenerate();
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
  cursor: grab;
  user-select: none;
  // Performance optimizations
  will-change: transform;
  transform: translateZ(0); // Force GPU acceleration
  // Note: removed 'contain' as it might interfere with event handling
  // Use paint containment only for better performance without blocking events
  contain: paint;
  // Ensure pointer events work correctly
  pointer-events: auto;
  touch-action: pan-x pan-y pinch-zoom;

  &:active {
    cursor: grabbing;
  }
}

.map-svg-hidden {
  opacity: 0;
  pointer-events: none;
}

.transform-group {
  transform-origin: 0 0;
  will-change: transform;
  // Note: SVG transform attribute is used instead of CSS transform
  // CSS transform would conflict with SVG transform attribute
}

.voronoi-cells {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  // Performance optimization - use GPU for rendering
  transform: translateZ(0);
  will-change: contents;
}

.voronoi-cell {
  transition:
    opacity 0.2s,
    stroke-width 0.2s;
  cursor: pointer;
  // Performance optimization - use GPU for rendering
  shape-rendering: geometricPrecision;
  vector-effect: non-scaling-stroke;

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
