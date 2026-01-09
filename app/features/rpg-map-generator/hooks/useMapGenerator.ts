import { ref, computed } from 'vue';
import { Delaunay } from 'd3-delaunay';
import { initNoise, fbm } from '~/shared/lib/perlin-noise';
import {
  generateVoronoiSites,
  type VoronoiSite,
} from '~/shared/lib/voronoi';
import { useMapGeneratorStore } from '~/stores/map-generator/map-generator';
import type { MapSettings, Settlement } from '~/shared/types/map-generator.types';

export interface VoronoiCell {
  path: string;
  color: { r: number; g: number; b: number };
  stroke: string;
  strokeWidth: number;
  site: VoronoiSite;
}

export function useMapGenerator() {
  const store = useMapGeneratorStore();
  const isGenerating = ref(false);
  const voronoiCells = ref<VoronoiCell[]>([]);
  const settlements = ref<Settlement[]>([]);

  /**
   * Calculate terrain color for a given height and noise values
   */
  function getTerrainColor(
    height: number,
    forestNoise: number,
    waterThreshold: number,
    mountainThreshold: number,
    forestChance: number
  ): { r: number; g: number; b: number } {
    if (height < waterThreshold - 0.1) {
      // Deep water
      return { r: 26, g: 95, b: 122 };
    } else if (height < waterThreshold) {
      // Shallow water
      return { r: 52, g: 152, b: 219 };
    } else if (height < waterThreshold + 0.05) {
      // Beach
      return { r: 244, g: 208, b: 63 };
    } else if (height > mountainThreshold + 0.1) {
      // Snow peak
      return { r: 236, g: 240, b: 241 };
    } else if (height > mountainThreshold) {
      // Mountain
      return { r: 127, g: 140, b: 141 };
    } else {
      // Check for forest
      if (forestNoise > (1 - forestChance) * 0.5) {
        // Forest
        return { r: 39, g: 174, b: 96 };
      } else {
        // Grassland
        return { r: 88, g: 214, b: 141 };
      }
    }
  }

  /**
   * Generate terrain using Voronoi cells with D3
   * @param settings Map settings
   * @param width Screen width
   * @param height Screen height
   */
  function generateTerrainVoronoiSVG(
    settings: MapSettings,
    width: number,
    height: number
  ): VoronoiCell[] {
    // Use screen size for map generation
    const mapWidth = width;
    const mapHeight = height;
    const scale = 4;
    const waterThreshold = (settings.waterLevel / 100) * 0.3 - 0.15;
    const mountainThreshold = 1 - (settings.mountainLevel / 100) * 0.4;
    const forestChance = settings.forestLevel / 100;

    // Use Voronoi cell count directly from settings
    // User controls this via slider (0-10000)
    const voronoiCellCount = settings.voronoiCellCount || 1000;

    // Generate Voronoi sites with improved uniform distribution
    const sites = generateVoronoiSites(
      mapWidth,
      mapHeight,
      voronoiCellCount,
      settings.seed,
      true
    );

    // Calculate terrain data for each site
    const centerX = mapWidth / 2;
    const centerY = mapHeight / 2;
    const maxDist = Math.max(centerX, centerY);

    for (const site of sites) {
      const nx = (site.x / mapWidth) * scale;
      const ny = (site.y / mapHeight) * scale;

      const distFromCenter = Math.sqrt(
        Math.pow((site.x - centerX) / maxDist, 2) +
          Math.pow((site.y - centerY) / maxDist, 2)
      );
      const islandMask = Math.max(0, 1 - distFromCenter * 1.2);

      const height = fbm(nx, ny, 6) * islandMask;
      const forestNoise = fbm(nx * 2 + 100, ny * 2 + 100, 4);

      const color = getTerrainColor(
        height,
        forestNoise,
        waterThreshold,
        mountainThreshold,
        forestChance
      );

      site.data = {
        height,
        terrain: '',
        color,
      };
    }

    // Add padding points outside the map bounds to reduce edge cell stretching
    // This creates a "halo" of points around the map to prevent large edge cells
    const area = mapWidth * mapHeight;
    const avgAreaPerPoint = area / voronoiCellCount;
    const avgDistance = Math.sqrt(avgAreaPerPoint);

    const paddingDistance = Math.min(mapWidth, mapHeight) * 0.15; // 15% of smaller dimension
    const paddingPoints: number[][] = [];
    const paddingSpacing = avgDistance * 1.5; // Space between padding points

    // Add points along top and bottom edges
    const horizontalPaddingCount = Math.ceil(mapWidth / paddingSpacing);
    for (let i = 0; i <= horizontalPaddingCount; i++) {
      const x = (i / horizontalPaddingCount) * mapWidth;
      paddingPoints.push([x, -paddingDistance]); // Top
      paddingPoints.push([x, mapHeight + paddingDistance]); // Bottom
    }

    // Add points along left and right edges
    const verticalPaddingCount = Math.ceil(mapHeight / paddingSpacing);
    for (let i = 0; i <= verticalPaddingCount; i++) {
      const y = (i / verticalPaddingCount) * mapHeight;
      paddingPoints.push([-paddingDistance, y]); // Left
      paddingPoints.push([mapWidth + paddingDistance, y]); // Right
    }

    // Add corner points
    paddingPoints.push([-paddingDistance, -paddingDistance]); // Top-left
    paddingPoints.push([mapWidth + paddingDistance, -paddingDistance]); // Top-right
    paddingPoints.push([-paddingDistance, mapHeight + paddingDistance]); // Bottom-left
    paddingPoints.push([mapWidth + paddingDistance, mapHeight + paddingDistance]); // Bottom-right

    // Combine map points with padding points
    const allPoints = [
      ...sites.map((site) => [site.x, site.y]),
      ...paddingPoints,
    ];

    const delaunay = Delaunay.from(allPoints);
    // Extend bounds to include padding area
    const voronoi = delaunay.voronoi([
      -paddingDistance,
      -paddingDistance,
      mapWidth + paddingDistance,
      mapHeight + paddingDistance,
    ]);

    // Generate SVG paths for each Voronoi cell
    // Only render cells for actual map sites (skip padding points)
    const cells: VoronoiCell[] = [];

    for (let i = 0; i < sites.length; i++) {
      const site = sites[i]!;
      const path = voronoi.renderCell(i);

      if (path && site.data) {
        // Determine stroke color based on terrain type
        let stroke = 'rgba(0, 0, 0, 0.3)';
        let strokeWidth = 0.5;

        // Darker stroke for water/beach borders
        if (site.data.height < waterThreshold + 0.05) {
          stroke = 'rgba(0, 0, 0, 0.4)';
          strokeWidth = 0.8;
        }
        // Lighter stroke for mountains
        else if (site.data.height > mountainThreshold) {
          stroke = 'rgba(255, 255, 255, 0.2)';
          strokeWidth = 0.5;
        }

        cells.push({
          path,
          color: site.data.color,
          stroke,
          strokeWidth,
          site,
        });
      }
    }

    return cells;
  }

  /**
   * Generate terrain using pixel-based approach (for canvas fallback)
   */
  function generateTerrainPixel(
    ctx: CanvasRenderingContext2D,
    settings: MapSettings
  ): void {
    const size = settings.size;
    const scale = 4; // Noise scale

    // Generate height map
    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;

    const waterThreshold = (settings.waterLevel / 100) * 0.3 - 0.15;
    const mountainThreshold = 1 - (settings.mountainLevel / 100) * 0.4;
    const forestChance = settings.forestLevel / 100;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const nx = (x / size) * scale;
        const ny = (y / size) * scale;

        // Height value with island mask
        const distFromCenter = Math.sqrt(
          Math.pow((x - size / 2) / (size / 2), 2) +
            Math.pow((y - size / 2) / (size / 2), 2)
        );
        const islandMask = Math.max(0, 1 - distFromCenter * 1.2);

        const height = fbm(nx, ny, 6) * islandMask;
        const forestNoise = fbm(nx * 2 + 100, ny * 2 + 100, 4);

        const color = getTerrainColor(
          height,
          forestNoise,
          waterThreshold,
          mountainThreshold,
          forestChance
        );

        const idx = (y * size + x) * 4;
        data[idx] = color.r;
        data[idx + 1] = color.g;
        data[idx + 2] = color.b;
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Generate complete map using SVG
   * @param svg SVG element to render to
   * @param width Screen width
   * @param height Screen height
   * OPTIMIZATION: Uses requestAnimationFrame to yield control and prevent UI blocking
   */
  async function generateMap(
    svg: SVGSVGElement | null,
    width: number,
    height: number
  ): Promise<void> {
    if (!svg) return;

    isGenerating.value = true;

    try {
      const settings = store.mapSettings;

      // Use seed or generate random
      if (!settings.seed) {
        store.randomizeSeed();
      }

      // Initialize noise with seed
      initNoise(store.mapSettings.seed);
      // Store canvas size based on screen dimensions
      store.setCanvasSize(Math.max(width, height));

      // Wait for SVG to be ready
      await new Promise(resolve => requestAnimationFrame(resolve));

      // Yield to allow UI to update
      await new Promise(resolve => requestAnimationFrame(resolve));

      // Generate Voronoi cells with screen dimensions
      // For very large maps, we could chunk this, but for now we do it in one go
      // The viewport culling in MapCanvas will handle rendering performance
      voronoiCells.value = generateTerrainVoronoiSVG(settings, width, height);

      // Yield again after generating cells
      await new Promise(resolve => requestAnimationFrame(resolve));

      // Generate settlements (we'll do this separately)
      generateSettlementsData(settings, width, height);

      // Final yield before marking as complete
      await new Promise(resolve => requestAnimationFrame(resolve));

      store.setMapGenerated(true);
    } finally {
      isGenerating.value = false;
    }
  }

  /**
   * Generate settlements data
   * @param settings Map settings
   * @param width Screen width
   * @param height Screen height
   */
  function generateSettlementsData(
    settings: MapSettings,
    width: number,
    height: number
  ): void {
    settlements.value = [];
    const scale = 4;
    const waterThreshold = (settings.waterLevel / 100) * 0.3 - 0.15;

    const centerX = width / 2;
    const centerY = height / 2;
    const maxDist = Math.max(centerX, centerY);

    const CITY_NAMES = [
      'Królewski Gród', 'Srebrna Twierdza', 'Żelazna Cytadela', 'Złoty Port', 'Mroźny Bastion',
      'Bursztynowy Zamek', 'Szmaragdowa Wieża', 'Rubinowe Wzgórze', 'Diamentowy Szczyt', 'Szafirowa Dolina',
    ];

    const VILLAGE_NAMES = [
      'Mała Wioska', 'Stare Dęby', 'Młyńskie Błonia', 'Leśna Polana', 'Rzeczny Bród',
      'Wzgórze Pastuszków', 'Kamienny Most', 'Sosnowy Gaj', 'Wilcza Jama', 'Jaskółcze Gniazdo',
      'Słoneczna Dolina', 'Mglisty Jar', 'Cichy Zakątek', 'Brzozowy Lasek', 'Podmokłe Łąki',
    ];

    // Calculate min distance based on screen size
    const minCityDistance = Math.max(60, Math.min(width, height) * 0.06);
    const minVillageDistance = Math.max(25, Math.min(width, height) * 0.025);

    // Place cities
    let placedCities = 0;
    let attempts = 0;
    while (placedCities < settings.cityCount && attempts < 1000) {
      attempts++;
      const x = Math.floor(Math.random() * width * 0.8 + width * 0.1);
      const y = Math.floor(Math.random() * height * 0.8 + height * 0.1);

      const nx = (x / width) * scale;
      const ny = (y / height) * scale;
      const distFromCenter = Math.sqrt(
        Math.pow((x - centerX) / maxDist, 2) +
          Math.pow((y - centerY) / maxDist, 2)
      );
      const terrainHeight = fbm(nx, ny, 6) * Math.max(0, 1 - distFromCenter * 1.2);

      if (terrainHeight > waterThreshold + 0.05 && terrainHeight < 0.6) {
        const tooClose = settlements.value.some(s =>
          Math.sqrt(Math.pow(s.x - x, 2) + Math.pow(s.y - y, 2)) < minCityDistance
        );

        if (!tooClose) {
          settlements.value.push({
            x,
            y,
            type: 'city',
            name: CITY_NAMES[placedCities % CITY_NAMES.length] ?? 'Miasto',
          });
          placedCities++;
        }
      }
    }

    // Place villages
    let placedVillages = 0;
    attempts = 0;
    while (placedVillages < settings.villageCount && attempts < 2000) {
      attempts++;
      const x = Math.floor(Math.random() * width * 0.9 + width * 0.05);
      const y = Math.floor(Math.random() * height * 0.9 + height * 0.05);

      const nx = (x / width) * scale;
      const ny = (y / height) * scale;
      const distFromCenter = Math.sqrt(
        Math.pow((x - centerX) / maxDist, 2) +
          Math.pow((y - centerY) / maxDist, 2)
      );
      const terrainHeight = fbm(nx, ny, 6) * Math.max(0, 1 - distFromCenter * 1.2);

      if (terrainHeight > waterThreshold + 0.03 && terrainHeight < 0.7) {
        const tooClose = settlements.value.some(s => {
          const dist = Math.sqrt(Math.pow(s.x - x, 2) + Math.pow(s.y - y, 2));
          return s.type === 'city' ? dist < minCityDistance * 0.67 : dist < minVillageDistance;
        });

        if (!tooClose) {
          settlements.value.push({
            x,
            y,
            type: 'village',
            name: VILLAGE_NAMES[placedVillages % VILLAGE_NAMES.length] ?? 'Wioska',
          });
          placedVillages++;
        }
      }
    }

    // Store settlements in store
    store.setSettlements(settlements.value);
  }

  return {
    generateMap,
    isGenerating,
    voronoiCells,
    settlements,
  };
}

