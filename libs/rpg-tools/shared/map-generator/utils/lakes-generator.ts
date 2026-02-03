/**
 * Lakes generator
 * Adds lakes in deep depressions and opens near-sea lakes
 */

import type { Grid } from '../types/grid.types';
import { CellType } from '../types/features.types';

/**
 * Opcje generowania jezior
 */
export interface LakesGenerationOptions {
  /** Maksymalna różnica wysokości do utworzenia jeziora (0-80, domyślnie: 80 = wyłączone) */
  elevationLimit?: number;
  /** Włącz otwieranie jezior blisko morza */
  openNearSeaLakes?: boolean;
  /** Nazwa szablonu (używana do pomijania otwierania jezior dla szablonu Atoll) */
  template?: string;
}

/**
 * Add lakes in deep depressions on land
 * Finds depressions that cannot drain to water and converts them to lakes
 */
export function addLakesInDeepDepressions(
  grid: Grid,
  elevationLimit: number = 80
): void {
  if (elevationLimit >= 80) return; // Wyłączone, jeśli limit jest zbyt wysoki

  const { cells, features } = grid;
  const { c: neighbors, h: heights, b: borderCells, i: cellIndices, t: cellTypes, f: featureIds } = cells;

  if (!heights || !features || !cellTypes || !featureIds) {
    throw new Error('Grid musi mieć wysokości, cechy, typy komórek i ID cech przed dodaniem jezior');
  }

  for (const i of cellIndices) {
    // Pomiń komórki brzegowe i komórki wody
    if (borderCells[i] || heights[i]! < 20) continue;

    // Znajdź minimalną wysokość wśród sąsiadów
    const neighborHeights = (neighbors[i] || []).map((n) => heights[n] || 0);
    const minHeight = Math.min(...neighborHeights, 100);

    // Pomiń, jeśli ta komórka nie jest najniższa (nie jest depresją)
    if (heights[i]! > minHeight) continue;

    // Sprawdź, czy ta depresja może odpływać do wody
    let deep = true;
    const threshold = heights[i]! + elevationLimit;
    const queue: number[] = [i];
    const checked: boolean[] = [];
    checked[i] = true;

    // BFS do sprawdzenia, czy woda może być osiągnięta
    while (deep && queue.length > 0) {
      const q = queue.pop()!;

      for (const n of neighbors[q] || []) {
        if (checked[n]) continue;
        if (heights[n]! >= threshold) continue; // Za wysoko, woda nie może płynąć

        // Znaleziono wodę - depresja może odpływać
        if (heights[n]! < 20) {
          deep = false;
          break;
        }

        checked[n] = true;
        queue.push(n);
      }
    }

    // Jeśli depresja nie może odpływać, utwórz jezioro
    if (deep) {
      const lakeCells = [i].concat(
        (neighbors[i] || []).filter((n) => heights[n] === heights[i])
      );
      addLake(grid, lakeCells);
    }
  }
}

/**
 * Add a lake feature to the grid
 */
function addLake(grid: Grid, lakeCells: number[]): void {
  const { cells, features } = grid;
  const { c: neighbors, h: heights, t: cellTypes, f: featureIds } = cells;

  if (!features || !heights || !cellTypes || !featureIds) return;

  const featureId = features.length;

  for (const i of lakeCells) {
    // Konwertuj na wodę
    heights[i] = 19; // Wysokość wody
    cellTypes[i] = CellType.WATER_COAST; // -1
    featureIds[i] = featureId;

    // Oznacz sąsiadów lądowych jako wybrzeże
    for (const n of neighbors[i] || []) {
      if (!lakeCells.includes(n) && heights[n]! >= 20) {
        cellTypes[n] = CellType.LAND_COAST; // 1
      }
    }
  }

  // Dodaj cechę jeziora
  features.push({
    i: featureId,
    land: false,
    border: false,
    type: 'lake',
  });
}

/**
 * Otwiera jeziora blisko morza (jeziora, które mogą przebić się do oceanu)
 * Oparte na zjawisku jeziora Ancylus - jeziora blisko morza zwykle przebijają próg
 */
export function openNearSeaLakes(
  grid: Grid,
  template?: string,
  enableOpening: boolean = true
): void {
  // Pomiń dla szablonu Atoll
  if (template === 'Atoll') return;
  if (!enableOpening) return;

  const { cells, features } = grid;
  if (!features || !cells.h || !cells.f || !cells.t || !cells.c) return;

  // Sprawdź, czy są jakieś jeziora
  if (!features.find((f) => f.type === 'lake')) return;

  const LIMIT = 22; // Maksymalna wysokość, którą może przebić woda

  for (const i of cells.i) {
    const lakeFeatureId = cells.f[i]!;
    const feature = features[lakeFeatureId];
    if (!feature || feature.type !== 'lake') continue; // To nie jezioro

    // Sprawdź sąsiadów pod kątem potencjalnego przebicia
    check_neighbours: for (const c of cells.c[i] || []) {
      // Musi być na wybrzeżu i poniżej limitu przebicia
      if (cells.t[c] !== CellType.LAND_COAST || cells.h[c]! > LIMIT) continue;

      // Sprawdź, czy sąsiad sąsiada jest oceanem
      for (const n of cells.c[c] || []) {
        const oceanFeatureId = cells.f[n];
        const oceanFeature = features[oceanFeatureId];
        if (oceanFeature && oceanFeature.type === 'ocean') {
          removeLake(grid, c, lakeFeatureId, oceanFeatureId);
          break check_neighbours;
        }
      }
    }
  }
}

/**
 * Usuwa jezioro poprzez konwersję na ocean
 */
function removeLake(
  grid: Grid,
  thresholdCellId: number,
  lakeFeatureId: number,
  oceanFeatureId: number
): void {
  const { cells, features } = grid;
  if (!features || !cells.h || !cells.f || !cells.t || !cells.c) return;

  // Konwertuj komórkę progu na ocean
  cells.h[thresholdCellId] = 19;
  cells.t[thresholdCellId] = CellType.WATER_COAST; // -1
  cells.f[thresholdCellId] = oceanFeatureId;

  // Oznacz sąsiadów lądowych jako wybrzeże
  for (const c of cells.c[thresholdCellId] || []) {
    if (cells.h[c]! >= 20) {
      cells.t[c] = CellType.LAND_COAST; // 1
    }
  }

  // Konwertuj wszystkie komórki jeziora na ocean
  for (const i of cells.i) {
    if (cells.f[i] === lakeFeatureId) {
      cells.f[i] = oceanFeatureId;
    }
  }

  // Oznacz byłe jezioro jako ocean
  const lakeFeature = features[lakeFeatureId];
  if (lakeFeature) {
    lakeFeature.type = 'ocean';
  }
}

