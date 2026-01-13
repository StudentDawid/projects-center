<template>
  <div class="map-canvas-wrapper">
    <svg
      ref="svgRef"
      :width="svgWidth"
      :height="svgHeight"
      class="map-svg"
      viewBox="0 0 1000 600"
      preserveAspectRatio="xMidYMid meet"
    >
      <!-- SVG Filters and Masks -->
      <defs>
        <filter id="dropShadow" x="-1" y="-1" width="100%" height="100%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
          <feOffset dx="1" dy="2" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="dropShadow05" x="-1" y="-1" width="100%" height="100%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" />
          <feOffset dx="0.3" dy="0.5" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="blur1" x="-1" y="-1" width="100%" height="100%">
          <feGaussianBlur stdDeviation="1" />
        </filter>
        <filter id="blur3" x="-1" y="-1" width="100%" height="100%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <!-- Maska lądu - ukrywa fragmenty rzek nad morzem -->
        <mask id="landMask">
          <!-- Tło czarne (ukrywa) -->
          <rect x="0" y="0" :width="grid?.width || 1000" :height="grid?.height || 600" fill="black" />
          <!-- Ląd biały (pokazuje) - tylko komórki lądu -->
          <g class="land-mask-cells">
            <path
              v-for="(polygon, index) in landCellPolygons"
              :key="`land-mask-${index}`"
              :d="polygonToPath(polygon)"
              fill="white"
            />
          </g>
        </mask>
      </defs>

      <g ref="viewboxRef" class="viewbox" :transform="viewboxTransform">
        <g class="map-content">
          <!-- Background layers -->
          <!-- Landmass background -->
          <rect
            v-if="grid && grid.width && grid.height"
            x="0"
            y="0"
            :width="grid.width"
            :height="grid.height"
            fill="#eef6fb"
            class="landmass-bg"
          />
          <!-- Ocean base background -->
          <rect
            v-if="grid && grid.width && grid.height"
            x="0"
            y="0"
            :width="grid.width"
            :height="grid.height"
            fill="#466eab"
            class="ocean-base-bg"
          />

          <!-- Render Voronoi cells from pack (if available) or grid -->
          <!-- Cells are rendered as raw polygons (no smoothing) - colors come from biomes -->
          <g class="voronoi-cells">
            <path
              v-for="(polygon, index) in cellPolygons"
              :key="`cell-${index}`"
              :d="polygonToPath(polygon)"
              :fill="getCellColor(index)"
              :stroke="showCellBorders ? '#808080' : 'none'"
              :stroke-width="0.1"
              class="voronoi-cell"
              @mouseenter="onCellHover(index)"
              @mouseleave="onCellLeave"
            />
          </g>

          <!-- Render coastline -->
          <g
            v-if="coastlineFeatures.length > 0"
            class="coastline-layer"
            shape-rendering="optimizeSpeed"
          >
            <!-- Sea islands coastline -->
            <g id="sea_island" class="coastline-group sea-island">
              <path
                v-for="coastline in seaIslandCoastlines"
                :key="`coastline-sea-${coastline.featureId}`"
                :d="coastline.path"
                stroke="#1f3846"
                stroke-width="0.7"
                fill="none"
                class="coastline-path"
                filter="url(#dropShadow)"
                opacity="0.5"
              />
            </g>
            <!-- Lake islands coastline -->
            <g id="lake_island" class="coastline-group lake-island">
              <path
                v-for="coastline in lakeIslandCoastlines"
                :key="`coastline-lake-${coastline.featureId}`"
                :d="coastline.path"
                stroke="#7c8eaf"
                stroke-width="0.35"
                fill="none"
                class="coastline-path"
              />
            </g>
          </g>

          <!-- Render rivers as wide filled polygons -->
          <!-- Maska ukrywa fragmenty rzek nad morzem -->
          <g
            v-if="props.showRivers !== false && pack && pack.rivers && pack.rivers.length > 0"
            class="rivers-layer"
            mask="url(#landMask)"
          >
            <path
              v-for="river in pack.rivers"
              :key="`river-${river.i}`"
              :d="getRiverPath(river)"
              fill="#5d97bb"
              class="river-path"
            />
          </g>
        </g>
      </g>
    </svg>

    <!-- Legenda po prawej stronie -->
    <div class="map-legend">
      <div class="legend-header">
        <h3>Legenda</h3>
      </div>
      <div class="legend-content">
        <!-- Legenda dla biomes -->
        <template v-if="props.displayMode === 'biomes'">
          <div class="legend-item" v-for="biome in biomeLegendItems" :key="biome.id">
            <div class="legend-color" :style="{ backgroundColor: biome.color }"></div>
            <span class="legend-label">{{ biome.name }}</span>
          </div>
        </template>
        <!-- Legenda dla wysokości -->
        <template v-else>
          <div class="legend-item" v-for="height in heightLegendItems" :key="height.label">
            <div class="legend-color" :style="{ backgroundColor: height.color }"></div>
            <span class="legend-label">{{ height.label }}</span>
          </div>
        </template>
      </div>
    </div>

    <!-- Loading overlay -->
    <div v-if="isGenerating" class="loading-overlay">
      <div class="loading-spinner">Generating map...</div>
    </div>

    <!-- Error message -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { zoom as d3Zoom, zoomIdentity } from 'd3-zoom';
import { select } from 'd3-selection';
import { useMapGenerator } from '../hooks/useMapGenerator';
import { useWindowSize } from '~/shared/lib/useWindowSize';
import type { Grid } from '~/shared/map-generator/types/grid.types';
import { BiomeType } from '~/shared/map-generator/utils/biomes-generator';
import { smoothPolygonPath } from '~/shared/map-generator/utils/polygon-smoother';
import { generateCoastlinePaths, type CoastlineFeature } from '~/shared/map-generator/utils/coastline-renderer';
import { getRiverPolygonPath } from '~/shared/map-generator/utils/rivers-generator';

export type DisplayMode = 'biomes' | 'height';

const props = defineProps<{
  width?: number;
  height?: number;
  cellsDesired?: number;
  seed?: string;
  showCellBorders?: boolean;
  displayMode?: DisplayMode;
  showRivers?: boolean;
}>();

interface GeneratedMap {
  grid: Grid;
  cellPolygons: Array<Array<[number, number]>>;
}

const emit = defineEmits<{
  mapGenerated: [map: GeneratedMap];
  cellHover: [cellId: number];
  cellLeave: [];
}>();

const svgRef = ref<SVGElement | null>(null);
const viewboxRef = ref<SVGGElement | null>(null);
const { width: windowWidth, height: windowHeight } = useWindowSize();

// Stan zoomowania
const zoomScale = ref(1);
const zoomX = ref(0);
const zoomY = ref(0);

// Obliczona transformacja dla viewbox (atrybut transform SVG)
const viewboxTransform = computed(() => {
  return `translate(${zoomX.value},${zoomY.value}) scale(${zoomScale.value})`;
});

const {
  grid,
  pack,
  cellPolygons,
  isGenerating,
  error,
  generateMap,
  generateSeed,
} = useMapGenerator();

// Cechy linii brzegowej (obliczone z pack)
const coastlineFeatures = computed<CoastlineFeature[]>(() => {
  if (!pack.value) return [];
  return generateCoastlinePaths(pack.value);
});

const seaIslandCoastlines = computed(() => {
  return coastlineFeatures.value.filter((c) => c.group === 'sea_island');
});

const lakeIslandCoastlines = computed(() => {
  return coastlineFeatures.value.filter((c) => c.group === 'lake_island');
});

// Legenda biomes
const biomeLegendItems = computed(() => {
  const biomeNames: Record<BiomeType, string> = {
    [BiomeType.Marine]: 'Ocean',
    [BiomeType.HotDesert]: 'Pustynia gorąca',
    [BiomeType.ColdDesert]: 'Pustynia zimna',
    [BiomeType.Savanna]: 'Sawanna',
    [BiomeType.Grassland]: 'Step',
    [BiomeType.TropicalSeasonalForest]: 'Las tropikalny sezonowy',
    [BiomeType.TemperateDeciduousForest]: 'Las liściasty umiarkowany',
    [BiomeType.TropicalRainforest]: 'Las deszczowy tropikalny',
    [BiomeType.TemperateRainforest]: 'Las deszczowy umiarkowany',
    [BiomeType.Taiga]: 'Tajga',
    [BiomeType.Tundra]: 'Tundra',
    [BiomeType.Glacier]: 'Lodowiec',
    [BiomeType.Wetland]: 'Mokradła',
  };

  const biomeColors: Record<BiomeType, string> = {
    [BiomeType.Marine]: '#466eab',
    [BiomeType.HotDesert]: '#fbe79f',
    [BiomeType.ColdDesert]: '#b5b887',
    [BiomeType.Savanna]: '#d2d082',
    [BiomeType.Grassland]: '#c8d68f',
    [BiomeType.TropicalSeasonalForest]: '#b6d95d',
    [BiomeType.TemperateDeciduousForest]: '#29bc56',
    [BiomeType.TropicalRainforest]: '#7dcb35',
    [BiomeType.TemperateRainforest]: '#409c43',
    [BiomeType.Taiga]: '#4b6b32',
    [BiomeType.Tundra]: '#96784b',
    [BiomeType.Glacier]: '#d5e7eb',
    [BiomeType.Wetland]: '#0b9131',
  };

  return Object.values(BiomeType)
    .filter((v) => typeof v === 'number')
    .map((biomeId) => ({
      id: biomeId as BiomeType,
      name: biomeNames[biomeId as BiomeType],
      color: biomeColors[biomeId as BiomeType],
    }));
});

// Legenda wysokości - używa rzeczywistych metrów n.p.m.
const heightLegendItems = computed(() => {
  // Konwertuj wartości wysokości na metry
  const waterMeters = convertHeightToMeters(10); // Przykładowa wartość wody
  const lowlandMeters = convertHeightToMeters(25); // ~49m
  const hillsMeters = convertHeightToMeters(50); // ~1024m
  const mountainsMeters = convertHeightToMeters(75); // ~3249m
  const peaksMeters = convertHeightToMeters(95); // ~5929m

  return [
    { label: `Woda (0m n.p.m.)`, color: '#466eab' },
    { label: `Niziny (0-${Math.round(hillsMeters)}m n.p.m.)`, color: getColorFromHeightValue(30) },
    { label: `Wzgórza (${Math.round(hillsMeters)}-${Math.round(mountainsMeters)}m n.p.m.)`, color: getColorFromHeightValue(50) },
    { label: `Góry (${Math.round(mountainsMeters)}-${Math.round(peaksMeters)}m n.p.m.)`, color: getColorFromHeightValue(70) },
    { label: `Szczyty (>${Math.round(peaksMeters)}m n.p.m.)`, color: getColorFromHeightValue(90) },
  ];
});

// Komórki lądu - używane w masce SVG do ukrycia fragmentów rzek nad morzem
const landCellPolygons = computed(() => {
  if (!grid.value || !grid.value.cells.h || !cellPolygons.value.length) {
    return [];
  }

  const landPolygons: Array<Array<[number, number]>> = [];
  const heights = grid.value.cells.h;

  // Sprawdź czy używamy pack czy grid
  const packData = pack.value?.cells;
  const polygonCount = cellPolygons.value.length;
  const packBiome = packData?.biome;
  const packCellCount = packBiome?.length || 0;
  const isUsingPack =
    pack.value &&
    packData &&
    packBiome &&
    packCellCount > 0 &&
    polygonCount === packCellCount;

  if (isUsingPack && packData && packData.h && packData.g) {
    // Używamy pack - sprawdź wysokości z pack
    for (let i = 0; i < cellPolygons.value.length; i++) {
      if (i < packData.h.length && packData.h[i]! >= 20) {
        landPolygons.push(cellPolygons.value[i]!);
      }
    }
  } else {
    // Używamy grid - sprawdź wysokości z grid
    for (let i = 0; i < cellPolygons.value.length; i++) {
      if (i < heights.length && heights[i]! >= 20) {
        landPolygons.push(cellPolygons.value[i]!);
      }
    }
  }

  return landPolygons;
});

// Domyślne ustawienia
const defaultSettings = {
  width: props.width || 1000,
  height: props.height || 600,
  cellsDesired: props.cellsDesired || 5000,
  seed: props.seed || generateSeed(),
};

// Wymiary SVG
const svgWidth = computed(() => props.width || windowWidth.value || 1000);
const svgHeight = computed(() => props.height || windowHeight.value || 600);

/**
 * Konwertuje współrzędne polygonu na ciąg ścieżki SVG (surowe polygony)
 * Pojedyncze komórki Voronoi nie są wygładzane - tylko coastline i obszary biomów
 */
function polygonToPath(polygon: Array<[number, number]>): string {
  if (polygon.length === 0) return '';

  // Surowe polygony - nie wygładzamy pojedynczych komórek
  let path = `M ${polygon[0]![0]} ${polygon[0]![1]}`;
  for (let i = 1; i < polygon.length; i++) {
    path += ` L ${polygon[i]![0]} ${polygon[i]![1]}`;
  }
  path += ' Z';
  return path;
}

/**
 * Pobiera kolor dla komórki - używa trybu wyświetlania (biomes/height) do określenia źródła koloru
 */
function getCellColor(cellId: number): string {
  const displayMode = props.displayMode || 'biomes';

  // Jeśli tryb to "biomes", spróbuj użyć biomes
  if (displayMode === 'biomes') {
    const polygonCount = cellPolygons.value.length;
    const packData = pack.value?.cells;
    const packBiome = packData?.biome;
    const packCellCount = packBiome?.length || 0;
    const isUsingPack =
      pack.value &&
      packData &&
      packBiome &&
      packCellCount > 0 &&
      polygonCount === packCellCount;

    // Używaj pack do renderowania biomes
    if (isUsingPack && packBiome && cellId < packBiome.length) {
      return getColorFromBiome(cellId);
    }
  }

  // Tryb "height" lub fallback - używaj wysokości
  if (!grid.value || !grid.value.cells.h) {
    // Fallback: prosty kolor oparty na indeksie komórki
    const hue = (cellId * 137.508) % 360;
    return `hsl(${hue}, 70%, 50%)`;
  }

  // Mapowanie komórki pack na komórkę grid dla wysokości
  const packData = pack.value?.cells;
  const polygonCount = cellPolygons.value.length;
  const packBiome = packData?.biome;
  const packCellCount = packBiome?.length || 0;
  const isUsingPack =
    pack.value &&
    packData &&
    packBiome &&
    packCellCount > 0 &&
    polygonCount === packCellCount;

  if (isUsingPack && packData && packData.g && cellId < packData.g.length) {
    const gridCellId = packData.g[cellId];
    if (
      gridCellId !== undefined &&
      gridCellId !== null &&
      gridCellId < grid.value.cells.h.length
    ) {
      const height = grid.value.cells.h[gridCellId];
      if (height !== undefined) {
        return getColorFromHeightValue(height);
      }
    }
  }

  return getColorFromHeight(cellId);
}

/**
 * Pobiera kolor z bioma (komórki pack)
 */
function getColorFromBiome(cellId: number): string {
  if (!pack.value || !pack.value.cells.biome) {
    return '#ccc';
  }

  // Sprawdź, czy cellId jest w zakresie
  if (cellId >= pack.value.cells.biome.length) {
    return '#ccc';
  }

  const biomeId = pack.value.cells.biome[cellId];
  if (biomeId === undefined || biomeId === null) {
    return '#ccc';
  }

  // Kolory biomes (standardowa paleta kolorów dla biomes)
  const biomeColors: Record<BiomeType, string> = {
    [BiomeType.Marine]: '#466eab', // Ocean blue
    [BiomeType.HotDesert]: '#fbe79f', // Desert yellow
    [BiomeType.ColdDesert]: '#b5b887', // Cold desert gray-green
    [BiomeType.Savanna]: '#d2d082', // Savanna yellow-green
    [BiomeType.Grassland]: '#c8d68f', // Grassland green
    [BiomeType.TropicalSeasonalForest]: '#b6d95d', // Tropical forest light green
    [BiomeType.TemperateDeciduousForest]: '#29bc56', // Deciduous forest green
    [BiomeType.TropicalRainforest]: '#7dcb35', // Rainforest bright green
    [BiomeType.TemperateRainforest]: '#409c43', // Temperate rainforest dark green
    [BiomeType.Taiga]: '#4b6b32', // Taiga dark green
    [BiomeType.Tundra]: '#96784b', // Tundra brown
    [BiomeType.Glacier]: '#d5e7eb', // Glacier light blue-white
    [BiomeType.Wetland]: '#0b9131', // Wetland dark green
  };

  const color = biomeColors[biomeId as BiomeType];
  if (!color) {
    // Nieznany biome ID - użyj szarego jako fallback
    return '#ccc';
  }

  return color;
}

/**
 * Interpoluje kolor RGB między dwoma kolorami
 */
function interpolateColor(color1: [number, number, number], color2: [number, number, number], t: number): [number, number, number] {
  t = Math.max(0, Math.min(1, t));
  return [
    Math.round(color1[0] + (color2[0] - color1[0]) * t),
    Math.round(color1[1] + (color2[1] - color1[1]) * t),
    Math.round(color1[2] + (color2[2] - color1[2]) * t),
  ];
}

/**
 * Interpoluje kolor między wieloma kolorami (punkty zatrzymania)
 */
function interpolateColors(stops: Array<[number, number, number]>, t: number): [number, number, number] {
  t = Math.max(0, Math.min(1, t));
  if (stops.length === 0) return [128, 128, 128];
  if (stops.length === 1) return stops[0]!;

  const segmentSize = 1 / (stops.length - 1);
  const segmentIndex = Math.min(Math.floor(t / segmentSize), stops.length - 2);
  const localT = (t - segmentIndex * segmentSize) / segmentSize;

  return interpolateColor(stops[segmentIndex]!, stops[segmentIndex + 1]!, localT);
}

/**
 * Konwertuje hex na RGB
 */
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1]!, 16), parseInt(result[2]!, 16), parseInt(result[3]!, 16)]
    : [0, 0, 0];
}

/**
 * Konwertuje wartość wysokości (0-100) na rzeczywiste metry n.p.m.
 * Używa wzoru podobnego do Azgaar: Math.pow(h - 18, exponent)
 * @param height - Wartość wysokości w zakresie 0-100
 * @param exponent - Wykładnik (domyślnie 2.0, jak w Azgaar)
 * @returns Wysokość w metrach n.p.m.
 */
function convertHeightToMeters(height: number, exponent: number = 2.0): number {
  if (height < 20) {
    // Woda: wartości < 20 reprezentują głębokość (ujemne wartości)
    // Dla uproszczenia, woda to 0m n.p.m. lub poniżej
    return 0;
  }
  // Ląd: Math.pow(h - 18, exponent)
  // Dla h=20: Math.pow(20-18, 2) = 4m
  // Dla h=100: Math.pow(100-18, 2) = 6724m
  return Math.pow(height - 18, exponent);
}

/**
 * Pobiera kolor na podstawie wartości wysokości (0-100)
 * Używa interpolacji kolorów podobnej do Azgaar
 * Teraz używa rzeczywistych metrów do interpolacji
 */
function getColorFromHeightValue(height: number): string {
  // Woda/Ocean: < 20
  // W trybie heightmap woda ma jednolity kolor (jak w Azgaar, gdzie renderOceanCells domyślnie jest wyłączone)
  if (height < 20) {
    // Jednolity kolor dla wszystkich wartości wody
    return '#466eab';
  }

  // Ląd: >= 20
  // Używamy wzoru z Azgaar: scheme(1 - value / 100)
  // Dla value=20: 1 - 20/100 = 0.8 (niski ląd)
  // Dla value=100: 1 - 100/100 = 0.0 (wysoki szczyt)
  const t = 1 - height / 100;

  // Poprawiona paleta kolorów - bardziej kontrastowa i widoczna
  // Od wysokich (t=0, biały) do niskich (t=1, ciemny zielony)
  const landStops: Array<[number, number, number]> = [
    hexToRgb('#ffffff'), // Wysokie szczyty (t=0.0-0.2) - biały
    hexToRgb('#f5f5dc'), // Wysokie góry (t=0.2-0.4) - beżowy (beige)
    hexToRgb('#deb887'), // Średnie góry (t=0.4-0.5) - brązowy (burlywood)
    hexToRgb('#8b7355'), // Niskie góry (t=0.5-0.6) - ciemny brązowy
    hexToRgb('#6b8e23'), // Wzgórza (t=0.6-0.75) - oliwkowy zielony
    hexToRgb('#2d5016'), // Niziny (t=0.75-1.0) - ciemny zielony
  ];

  const [r, g, b] = interpolateColors(landStops, Math.max(0, Math.min(1, t)));
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Pobiera kolor z wysokości (komórki grid) - fallback
 */
function getColorFromHeight(cellId: number): string {
  if (!grid.value || !grid.value.cells.h) {
    return '#ccc';
  }

  const height = grid.value.cells.h[cellId] || 0;
  return getColorFromHeightValue(height);
}

/**
 * Obsługuje najechanie myszką na komórkę
 */
function onCellHover(cellId: number): void {
  emit('cellHover', cellId);
}

/**
 * Obsługuje opuszczenie komórki przez myszkę
 */
function onCellLeave(): void {
  emit('cellLeave');
}

/**
 * Tworzy szeroki, wypełniony polygon dla rzeki
 * Używa meanderedPoints i szerokiego polygonu zamiast cienkiej linii
 */
function getRiverPath(river: { meanderedPoints?: Array<[number, number, number]>, widthFactor?: number, sourceWidth?: number }): string {
  if (!pack.value || !river.meanderedPoints || river.meanderedPoints.length === 0) {
    return '';
  }

  const widthFactor = river.widthFactor || 1;
  const sourceWidth = river.sourceWidth || 0.5;

  return getRiverPolygonPath(river.meanderedPoints, widthFactor, sourceWidth);
}

/**
 * Generuje mapę przy montowaniu komponentu lub gdy zmieniają się ustawienia
 */
async function initializeMap(): Promise<void> {
  const settings = {
    width: defaultSettings.width,
    height: defaultSettings.height,
    cellsDesired: defaultSettings.cellsDesired,
    seed: defaultSettings.seed,
  };

  const result = await generateMap(settings);
  if (result) {
    emit('mapGenerated', result);
  }
}

/**
 * Ponownie generuje mapę z nowym seedem
 */
async function regenerateMap(): Promise<void> {
  const settings = {
    width: defaultSettings.width,
    height: defaultSettings.height,
    cellsDesired: defaultSettings.cellsDesired,
    seed: generateSeed(), // Nowy losowy seed
  };

  const result = await generateMap(settings);
  if (result) {
    emit('mapGenerated', result);
  }
}

// Udostępnij metodę regenerateMap dla komponentu nadrzędnego
defineExpose({
  regenerateMap,
});

// Obserwuj zmiany w właściwościach
watch(
  () => [props.width, props.height, props.cellsDesired, props.seed],
  () => {
    initializeMap();
  },
  { deep: true }
);

/**
 * Konfiguruje zachowanie zoomowania
 */
function setupZoom(): void {
  if (!svgRef.value) return;

  const svg = select(svgRef.value);

  // Tworzy zachowanie zoomowania
  const zoomBehavior = d3Zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.5, 20]) // Minimalny i maksymalny poziom zoomu
    .on('zoom', (event) => {
      const { k, x, y } = event.transform;
      zoomScale.value = k;
      zoomX.value = x;
      zoomY.value = y;

      // Wywołaj dostosowania aktywnego zoomowania (wywoływane przy każdym zdarzeniu zoom)
      invokeActiveZooming(k);
    });

  // Podepnij zoom do SVG
  svg.call(zoomBehavior);

  // Zapisz zachowanie zoomowania do czyszczenia i przyszłego użycia
  (svgRef.value as any).__zoomBehavior = zoomBehavior;
}

/**
 * Wywołuje dostosowania aktywnego zoomowania
 * Dostosowuje elementy wizualne na podstawie poziomu zoomu dla lepszego renderowania w różnych skalach
 */
function invokeActiveZooming(scale: number): void {
  if (!viewboxRef.value) return;

  // Dostosuj grubość obramowań komórek na podstawie zoomu (cieńsze przy większym zoom, grubsze przy mniejszym)
  const cells = viewboxRef.value.querySelectorAll('.voronoi-cell');
  cells.forEach((cell) => {
    const baseStrokeWidth = 0.5;
    const adjustedWidth = Math.max(baseStrokeWidth / scale, 0.05);
    (cell as SVGPathElement).setAttribute('stroke-width', String(adjustedWidth));
  });

  // Dostosuj grubość linii rzek na podstawie zoomu
  const rivers = viewboxRef.value.querySelectorAll('.river-path');
  rivers.forEach((river) => {
    const currentWidth = parseFloat((river as SVGPathElement).getAttribute('stroke-width') || '1');
    const baseWidth = Math.max(currentWidth, 0.5);
    // Rzeki powinny być bardziej widoczne, więc nie zmniejszamy tak bardzo
    const adjustedWidth = Math.max(baseWidth / Math.sqrt(scale), 0.3);
    (river as SVGPathElement).setAttribute('stroke-width', String(adjustedWidth));
  });

  // TODO: Przyszłe ulepszenia mogą obejmować:
  // - Dostosowanie rozmiaru etykiet
  // - Pokazywanie/ukrywanie elementów na podstawie poziomu zoomu
  // - Dostosowanie rozmiaru markerów
  // - Zmianę efektów filtrów (rozmycie/cień) dla linii brzegowej
}

/**
 * Resetuje zoom do stanu początkowego
 */
function resetZoom(duration: number = 1000): void {
  if (!svgRef.value) return;

  const zoomBehavior = (svgRef.value as any).__zoomBehavior;
  if (!zoomBehavior) return;

  const svg = select(svgRef.value);
  svg.transition()
    .duration(duration)
    .call(zoomBehavior.transform, zoomIdentity);
}

/**
 * Powiększa do określonego punktu
 */
function zoomTo(
  x: number,
  y: number,
  targetScale: number = 4,
  duration: number = 1000
): void {
  if (!svgRef.value) return;

  const zoomBehavior = (svgRef.value as any).__zoomBehavior;
  if (!zoomBehavior) return;

  const svg = select(svgRef.value);
  const width = svgWidth.value;
  const height = svgHeight.value;

  const transform = zoomIdentity
    .translate(
      x * -targetScale + width / 2,
      y * -targetScale + height / 2
    )
    .scale(targetScale);

  svg.transition()
    .duration(duration)
    .call(zoomBehavior.transform, transform);
}

onMounted(() => {
  initializeMap();
  // Skonfiguruj zoom po renderowaniu SVG
  setTimeout(() => {
    setupZoom();
  }, 100);
});

onUnmounted(() => {
  // Wyczyść zachowanie zoomowania jeśli potrzeba
  if (svgRef.value && (svgRef.value as any).__zoomBehavior) {
    const svg = select(svgRef.value);
    svg.on('.zoom', null);
    delete (svgRef.value as any).__zoomBehavior;
  }
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
  overflow: hidden;
}

.map-svg {
  width: 100%;
  height: 100%;
  background: #1a1a2e;
}

.map-content {
  width: 100%;
  height: 100%;
}

.voronoi-cells {
  width: 100%;
  height: 100%;
}

.voronoi-cell {
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.8;
  }
}

.coastline-layer {
  pointer-events: none;
}

.coastline-path {
  pointer-events: none;
}

.river-path {
  pointer-events: none;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  z-index: 10;
}

.loading-spinner {
  color: #fff;
  font-size: 1.2rem;
  font-weight: bold;
}

.error-message {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 0, 0, 0.9);
  color: #fff;
  padding: 10px 20px;
  border-radius: 4px;
  z-index: 10;
}

.map-legend {
  position: fixed;
  right: 0;
  top: 0;
  width: 280px;
  height: 100vh;
  background: rgba(26, 26, 46, 0.95);
  backdrop-filter: blur(10px);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.3);
}

.legend-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #e0e0e0;
  }
}

.legend-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.legend-color {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
}

.legend-label {
  font-size: 14px;
  color: #e0e0e0;
  line-height: 1.4;
}

/* Scrollbar styling */
.map-legend::-webkit-scrollbar {
  width: 6px;
}

.map-legend::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.map-legend::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
}
</style>
