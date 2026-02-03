/**
 * Ocean layers generator
 * Creates visual layers for ocean depths (currently just data structure)
 *
 * Note: Actual rendering will be done in UI layer
 */

import type { Grid } from '../types/grid.types';
import { CellType } from '../types/features.types';

/**
 * Opcje warstw oceanu
 */
export interface OceanLayersOptions {
  /** Tryb konturu warstwy: "none", "random", lub wartości głębokości oddzielone przecinkami jak "-1,-2,-3" */
  outline?: string;
}

/**
 * Dane warstwy oceanu do renderowania
 */
export interface OceanLayerData {
  /** Poziom głębokości (wartość ujemna z CellType) */
  depth: number;
  /** Tablica ścieżek polygonów dla tego poziomu głębokości */
  paths: Array<Array<[number, number]>>;
}

/**
 * Generate ocean layer data
 * Returns data structure that can be used for rendering ocean depth layers
 */
export function generateOceanLayers(
  grid: Grid,
  options: OceanLayersOptions = {}
): OceanLayerData[] {
  const { outline = 'random' } = options;

  if (outline === 'none') {
    return [];
  }

  const { cells, vertices } = grid;
  if (!cells.t || !cells.h) {
    return []; // Brak danych o wysokości lub typie
  }

  // Określ limity głębokości do przetworzenia
  const limits = outline === 'random'
    ? randomizeOutline()
    : outline.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));

  // To jest uproszczona wersja - pełna implementacja śledziłaby kontury
  // Na razie zwracamy strukturę do przyszłego renderowania
  const layers: OceanLayerData[] = [];

  // Policz komórki na każdym poziomie głębokości do przyszłego renderowania
  for (const limit of limits) {
    if (limit >= 0) continue; // Przetwarzaj tylko głębokości wody (ujemne)

    const cellsAtDepth = cells.i.filter(i => cells.t![i] === limit);
    if (cellsAtDepth.length > 0) {
      layers.push({
        depth: limit,
        paths: [], // Zostanie wypełnione podczas renderowania
      });
    }
  }

  return layers;
}

/**
 * Randomize ocean layer outline depths
 */
function randomizeOutline(): number[] {
  const limits: number[] = [];
  let odd = 0.2;

  for (let l = -9; l < 0; l++) {
    if (Math.random() < odd) {
      odd = 0.2;
      limits.push(l);
    } else {
      odd *= 2;
    }
  }

  return limits.length > 0 ? limits : [-1, -2, -3]; // Domyślne fallback
}

