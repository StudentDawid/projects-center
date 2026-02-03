/**
 * Hook do generowania kosmologii świata RPG
 */

import { ref, type Ref } from 'vue';
import type { Cosmology } from '@libs/shared/world-generator/types/cosmology.types';
import { generateCosmology } from '@libs/shared/world-generator/utils/generators/cosmology-generator';

/**
 * Hook do generowania kosmologii
 */
export function useCosmologyGenerator() {
  const cosmology: Ref<Cosmology | null> = ref(null);
  const isGenerating: Ref<boolean> = ref(false);
  const error: Ref<string | null> = ref(null);

  /**
   * Generuje kosmologię
   */
  async function generate(seed?: string): Promise<Cosmology> {
    isGenerating.value = true;
    error.value = null;

    try {
      const generated = generateCosmology(seed);
      cosmology.value = generated;
      return generated;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd podczas generowania kosmologii';
      error.value = errorMessage;
      throw err;
    } finally {
      isGenerating.value = false;
    }
  }

  /**
   * Resetuje kosmologię
   */
  function reset(): void {
    cosmology.value = null;
    error.value = null;
  }

  return {
    cosmology,
    isGenerating,
    error,
    generate,
    reset,
  };
}

