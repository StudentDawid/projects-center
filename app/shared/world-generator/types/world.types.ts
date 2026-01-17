/**
 * Główne typy danych dla całego świata RPG
 */

import type { Cosmology } from './cosmology.types';

/**
 * Kompletny wygenerowany świat
 */
export interface World {
  /** ID świata (seed-based) */
  id: string;
  /** Seed użyty do generowania */
  seed: string;
  /** Nazwa świata */
  name: string;
  /** Kosmologia */
  cosmology: Cosmology;
  /** Data wygenerowania */
  generatedAt: Date;
  /** Wersja generatora */
  generatorVersion: string;
}
