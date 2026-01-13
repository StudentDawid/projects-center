/**
 * Generator cech terenu
 * Oznacza cechy siatki (oceany, jeziora, wyspy) i oblicza pole odległości
 */

import type { Grid } from '../types/grid.types';
import type { Feature } from '../types/features.types';
import { CellType } from '../types/features.types';
import { createTypedArray } from './map-utils';

/**
 * Parametry oznaczania do obliczania pola odległości
 */
interface MarkupParams {
  distanceField: Int8Array;
  neighbors: number[][];
  start: number;
  increment: number;
  limit?: number;
}

/**
 * Oblicza pole odległości używając algorytmu flood-fill
 */
function markup({
  distanceField,
  neighbors,
  start,
  increment,
  limit = 127,
}: MarkupParams): void {
  const UNMARKED = 0; // CellType.UNMARKED

  for (
    let distance = start, marked = Infinity;
    marked > 0 && distance !== limit;
    distance += increment
  ) {
    marked = 0;
    const prevDistance = distance - increment;

    for (let cellId = 0; cellId < neighbors.length; cellId++) {
      if (distanceField[cellId] !== prevDistance) continue;

      for (const neighborId of neighbors[cellId] || []) {
        if (
          neighborId >= 0 &&
          neighborId < distanceField.length &&
          distanceField[neighborId] === UNMARKED
        ) {
          distanceField[neighborId] = distance;
          marked++;
        }
      }
    }
  }
}

/**
 * Oznacza cechy siatki (oceany, jeziora, wyspy) i oblicza pole odległości
 * Identyfikuje połączone regiony lądu i wody oraz oblicza odległości od wybrzeża
 */
export function markupGrid(grid: Grid, randomFn?: () => number): void {
  const { cells } = grid;
  const { h: heights, c: neighbors, b: borderCells, i } = cells;

  if (!heights) {
    throw new Error('Grid must have heights before feature markup');
  }

  const cellsNumber = i.length;
  const distanceField = new Int8Array(cellsNumber); // grid.cells.t
  const featureIds = createTypedArray({
    maxValue: cellsNumber,
    length: cellsNumber,
  }) as Uint16Array; // grid.cells.f
  const features: Feature[] = [{ i: 0, land: false, border: false, type: 'ocean' }]; // index 0 is placeholder

  const UNMARKED = CellType.UNMARKED;
  const LAND_COAST = CellType.LAND_COAST;
  const WATER_COAST = CellType.WATER_COAST;
  const DEEP_WATER = CellType.DEEP_WATER;

  // Algorytm flood-fill do identyfikacji cech
  const queue: number[] = [0];

  for (let featureId = 1; queue[0] !== -1; featureId++) {
    const firstCell = queue[0]!;
    featureIds[firstCell] = featureId;

    const land = heights[firstCell]! >= 20;
    let border = false; // ustaw true, jeśli cecha dotyka krawędzi mapy

    // Przetwarzaj wszystkie komórki w tej cesze
    while (queue.length > 0) {
      const cellId = queue.pop()!;
      if (!border && borderCells[cellId]) {
        border = true;
      }

      for (const neighborId of neighbors[cellId] || []) {
        if (neighborId < 0 || neighborId >= cellsNumber) continue;

        const isNeibLand = heights[neighborId]! >= 20;

        // Ten sam typ (oba ląd lub oba woda) - dodaj do cechy
        if (land === isNeibLand && featureIds[neighborId] === UNMARKED) {
          featureIds[neighborId] = featureId;
          queue.push(neighborId);
        }
        // Różne typy - oznacz jako wybrzeże
        else if (land && !isNeibLand) {
          distanceField[cellId] = LAND_COAST;
          distanceField[neighborId] = WATER_COAST;
        }
      }
    }

    // Określ typ cechy
    let type: 'ocean' | 'lake' | 'island';
    if (land) {
      type = 'island';
    } else if (border) {
      type = 'ocean';
    } else {
      type = 'lake';
    }

    features.push({
      i: featureId,
      land,
      border,
      type,
    });

    // Znajdź następną nieoznaczoną komórkę
    const nextUnmarked = featureIds.findIndex((f) => f === UNMARKED);
    queue[0] = nextUnmarked;
  }

  // Oznacz komórki głębokiego oceanu (odległość od wybrzeża w wodzie)
  markup({
    distanceField,
    neighbors,
    start: DEEP_WATER,
    increment: -1,
    limit: -10,
  });

  // Update grid
  cells.t = distanceField;
  cells.f = featureIds;
  grid.features = features;
}

/**
 * Check if cell is land
 */
export function isLand(grid: Grid, cellId: number): boolean {
  const height = grid.cells.h?.[cellId];
  return height !== undefined && height >= 20;
}

/**
 * Check if cell is water
 */
export function isWater(grid: Grid, cellId: number): boolean {
  return !isLand(grid, cellId);
}

/**
 * Get feature for a cell
 */
export function getFeature(grid: Grid, cellId: number): Feature | null {
  if (!grid.features || !grid.cells.f) return null;
  const featureId = grid.cells.f[cellId];
  if (featureId === undefined) return null;
  return grid.features[featureId] || null;
}

