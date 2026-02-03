/**
 * Logika regeneracji gridu
 * Sprawdza czy grid powinien być regenerowany
 */

import type { Grid } from '../types/grid.types';
import { rn } from './map-utils';

/**
 * Sprawdza, czy grid powinien być wygenerowany ponownie
 * Grid musi być regenerowany jeśli:
 * - Seed się zmienił
 * - Liczba pożądanych komórek się zmieniła
 * - Rozmiar mapy (spacing, cellsX, cellsY) się zmienił
 *
 * @param currentGrid - Obecny grid (może być null)
 * @param expectedSeed - Oczekiwany seed
 * @param cellsDesired - Pożądana liczba komórek
 * @param width - Szerokość mapy
 * @param height - Wysokość mapy
 * @returns true jeśli grid powinien być regenerowany
 */
export function shouldRegenerateGrid(
  currentGrid: Grid | null,
  expectedSeed: string,
  cellsDesired: number,
  width: number,
  height: number
): boolean {
  // Jeśli nie ma obecnego gridu, musi być wygenerowany
  if (!currentGrid) return true;

  // Sprawdź seed
  if (expectedSeed && expectedSeed !== currentGrid.seed) return true;

  // Sprawdź liczbę pożądanych komórek
  if (cellsDesired !== currentGrid.cellsDesired) return true;

  // Oblicz nowy spacing i cellsX/cellsY
  const newSpacing = rn(Math.sqrt((width * height) / cellsDesired), 2);
  const newCellsX = Math.floor((width + 0.5 * newSpacing - 1e-10) / newSpacing);
  const newCellsY = Math.floor((height + 0.5 * newSpacing - 1e-10) / newSpacing);

  // Sprawdź czy spacing lub rozmiary się zmieniły
  if (currentGrid.spacing !== newSpacing) return true;
  if (currentGrid.cellsX !== newCellsX) return true;
  if (currentGrid.cellsY !== newCellsY) return true;

  // Grid nie musi być regenerowany
  return false;
}

