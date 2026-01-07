import { ref } from 'vue';
import { initNoise, fbm } from '~/shared/lib/perlin-noise';
import { useMapGeneratorStore } from '~/stores/map-generator/map-generator';
import type { MapSettings } from '~/shared/types/map-generator.types';

export function useMapGenerator() {
  const store = useMapGeneratorStore();
  const isGenerating = ref(false);

  /**
   * Generate terrain height map and draw it to canvas
   */
  function generateTerrain(
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

        // Determine terrain type
        let r: number, g: number, b: number;

        if (height < waterThreshold - 0.1) {
          // Deep water
          r = 26;
          g = 95;
          b = 122;
        } else if (height < waterThreshold) {
          // Shallow water
          r = 52;
          g = 152;
          b = 219;
        } else if (height < waterThreshold + 0.05) {
          // Beach
          r = 244;
          g = 208;
          b = 63;
        } else if (height > mountainThreshold + 0.1) {
          // Snow peak
          r = 236;
          g = 240;
          b = 241;
        } else if (height > mountainThreshold) {
          // Mountain
          r = 127;
          g = 140;
          b = 141;
        } else {
          // Check for forest
          const forestNoise = fbm(nx * 2 + 100, ny * 2 + 100, 4);
          if (forestNoise > (1 - forestChance) * 0.5) {
            // Forest
            r = 39;
            g = 174;
            b = 96;
          } else {
            // Grassland
            r = 88;
            g = 214;
            b = 141;
          }
        }

        const idx = (y * size + x) * 4;
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Generate complete map
   */
  async function generateMap(canvas: HTMLCanvasElement | null): Promise<void> {
    if (!canvas) return;

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

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Wait for canvas to resize
      await new Promise(resolve => requestAnimationFrame(resolve));

      // Generate terrain
      generateTerrain(ctx, settings);

      store.setMapGenerated(true);
    } finally {
      isGenerating.value = false;
    }
  }

  return {
    generateMap,
    isGenerating,
  };
}

