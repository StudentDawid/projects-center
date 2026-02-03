/**
 * Główny hook do generowania całego świata RPG
 */

import { ref, type Ref } from 'vue';
import type { World } from '@libs/shared/world-generator/types/world.types';
import { useCosmologyGenerator } from './useCosmologyGenerator';
import { setSeed } from '@libs/shared/map-generator/utils/seed-manager';

const GENERATOR_VERSION = '1.0.0';

/**
 * Hook do generowania całego świata
 */
export function useWorldGenerator() {
  const world: Ref<World | null> = ref(null);
  const isGenerating: Ref<boolean> = ref(false);
  const error: Ref<string | null> = ref(null);
  const progress: Ref<number> = ref(0);

  const { generate: generateCosmology, cosmology, isGenerating: isGeneratingCosmology } = useCosmologyGenerator();

  /**
   * Generuje cały świat
   */
  async function generate(seed?: string, worldName?: string): Promise<World> {
    isGenerating.value = true;
    error.value = null;
    progress.value = 0;

    try {
      const actualSeed = seed || Math.random().toString(36).substring(2, 15);
      const actualWorldName = worldName || `Świat ${actualSeed.substring(0, 8)}`;

      // Ustaw seed dla generatora pseudolosowego
      const originalRandom = Math.random;
      const { random: seededRandom } = setSeed(actualSeed);
      Math.random = seededRandom;

      try {
        // Krok 1: Generuj kosmologię (0-30%)
        progress.value = 10;
        await generateCosmology(actualSeed);
        progress.value = 30;

      if (!cosmology.value) {
        throw new Error('Nie udało się wygenerować kosmologii');
      }

      // TODO: Krok 2: Generuj religię (30-50%)
      // TODO: Krok 3: Generuj państwa (50-70%)
      // TODO: Krok 4: Generuj kultury (70-85%)
      // TODO: Krok 5: Generuj rody (85-95%)
      // TODO: Krok 6: Generuj historię (95-100%)

      progress.value = 100;

      // Tworzymy świat
      const generatedWorld: World = {
        id: `world-${actualSeed}`,
        seed: actualSeed,
        name: actualWorldName,
        cosmology: cosmology.value,
        generatedAt: new Date(),
        generatorVersion: GENERATOR_VERSION,
      };

        world.value = generatedWorld;
        return generatedWorld;
      } finally {
        // Przywróć oryginalny Math.random
        Math.random = originalRandom;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd podczas generowania świata';
      error.value = errorMessage;
      throw err;
    } finally {
      isGenerating.value = false;
    }
  }

  /**
   * Resetuje świat
   */
  function reset(): void {
    world.value = null;
    error.value = null;
    progress.value = 0;
  }

  return {
    world,
    isGenerating,
    error,
    progress,
    generate,
    reset,
  };
}

