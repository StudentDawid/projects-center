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
   */
  function generateTerrainVoronoiSVG(
    settings: MapSettings
  ): VoronoiCell[] {
    const size = settings.size;
    const scale = 4;
    const waterThreshold = (settings.waterLevel / 100) * 0.3 - 0.15;
    const mountainThreshold = 1 - (settings.mountainLevel / 100) * 0.4;
    const forestChance = settings.forestLevel / 100;

    // Generate Voronoi sites
    const sites = generateVoronoiSites(
      size,
      size,
      settings.voronoiCellCount,
      settings.seed,
      true
    );

    // Calculate terrain data for each site
    for (const site of sites) {
      const nx = (site.x / size) * scale;
      const ny = (site.y / size) * scale;

      const distFromCenter = Math.sqrt(
        Math.pow((site.x - size / 2) / (size / 2), 2) +
          Math.pow((site.y - size / 2) / (size / 2), 2)
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

    // Create Delaunay triangulation and Voronoi diagram
    const points: number[][] = sites.map((site) => [site.x, site.y]);
    const delaunay = Delaunay.from(points);
    const voronoi = delaunay.voronoi([0, 0, size, size]);

    // Generate SVG paths for each Voronoi cell
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
   */
  async function generateMap(svg: SVGSVGElement | null): Promise<void> {
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
      store.setCanvasSize(settings.size);

      // Wait for SVG to be ready
      await new Promise(resolve => requestAnimationFrame(resolve));

      // Generate Voronoi cells
      if (settings.useVoronoi) {
        voronoiCells.value = generateTerrainVoronoiSVG(settings);
      } else {
        // For pixel mode, still use Voronoi but with more cells
        const pixelSettings = { ...settings, voronoiCellCount: settings.size * 2 };
        voronoiCells.value = generateTerrainVoronoiSVG(pixelSettings);
      }

      // Generate settlements (we'll do this separately)
      generateSettlementsData(settings);

      store.setMapGenerated(true);
    } finally {
      isGenerating.value = false;
    }
  }

  /**
   * Generate settlements data
   */
  function generateSettlementsData(settings: MapSettings): void {
    settlements.value = [];
    const size = settings.size;
    const scale = 4;
    const waterThreshold = (settings.waterLevel / 100) * 0.3 - 0.15;

    const CITY_NAMES = [
      'Królewski Gród', 'Srebrna Twierdza', 'Żelazna Cytadela', 'Złoty Port', 'Mroźny Bastion',
      'Bursztynowy Zamek', 'Szmaragdowa Wieża', 'Rubinowe Wzgórze', 'Diamentowy Szczyt', 'Szafirowa Dolina',
    ];

    const VILLAGE_NAMES = [
      'Mała Wioska', 'Stare Dęby', 'Młyńskie Błonia', 'Leśna Polana', 'Rzeczny Bród',
      'Wzgórze Pastuszków', 'Kamienny Most', 'Sosnowy Gaj', 'Wilcza Jama', 'Jaskółcze Gniazdo',
      'Słoneczna Dolina', 'Mglisty Jar', 'Cichy Zakątek', 'Brzozowy Lasek', 'Podmokłe Łąki',
    ];

    // Place cities
    let placedCities = 0;
    let attempts = 0;
    while (placedCities < settings.cityCount && attempts < 1000) {
      attempts++;
      const x = Math.floor(Math.random() * size * 0.8 + size * 0.1);
      const y = Math.floor(Math.random() * size * 0.8 + size * 0.1);

      const nx = (x / size) * scale;
      const ny = (y / size) * scale;
      const distFromCenter = Math.sqrt(
        Math.pow((x - size / 2) / (size / 2), 2) +
          Math.pow((y - size / 2) / (size / 2), 2)
      );
      const height = fbm(nx, ny, 6) * Math.max(0, 1 - distFromCenter * 1.2);

      if (height > waterThreshold + 0.05 && height < 0.6) {
        const tooClose = settlements.value.some(s =>
          Math.sqrt(Math.pow(s.x - x, 2) + Math.pow(s.y - y, 2)) < 60
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
      const x = Math.floor(Math.random() * size * 0.9 + size * 0.05);
      const y = Math.floor(Math.random() * size * 0.9 + size * 0.05);

      const nx = (x / size) * scale;
      const ny = (y / size) * scale;
      const distFromCenter = Math.sqrt(
        Math.pow((x - size / 2) / (size / 2), 2) +
          Math.pow((y - size / 2) / (size / 2), 2)
      );
      const height = fbm(nx, ny, 6) * Math.max(0, 1 - distFromCenter * 1.2);

      if (height > waterThreshold + 0.03 && height < 0.7) {
        const tooClose = settlements.value.some(s => {
          const dist = Math.sqrt(Math.pow(s.x - x, 2) + Math.pow(s.y - y, 2));
          return s.type === 'city' ? dist < 40 : dist < 25;
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

