/**
 * Helper functions for grid operations
 * Used by heightmap generator and other modules
 */

import type { Grid } from '../types/grid.types';

/**
 * Find grid cell index for given coordinates
 * Returns the index of the cell containing point (x, y)
 */
export function findGridCell(x: number, y: number, grid: Grid): number {
  const { spacing, cellsX, cellsY } = grid;
  const cellX = Math.floor(Math.min(x / spacing, cellsX - 1));
  const cellY = Math.floor(Math.min(y / spacing, cellsY - 1));
  return cellY * cellsX + cellX;
}

/**
 * Get blob power based on number of cells
 * Used for hill/pit spread calculations
 */
export function getBlobPower(cellsDesired: number): number {
  const blobPowerMap: Record<number, number> = {
    1000: 0.93,
    2000: 0.95,
    5000: 0.97,
    10000: 0.98,
    20000: 0.99,
    30000: 0.991,
    40000: 0.993,
    50000: 0.994,
    60000: 0.995,
    70000: 0.9955,
    80000: 0.996,
    90000: 0.9964,
    100000: 0.9973,
  };

  // Find closest match or use default
  const keys = Object.keys(blobPowerMap).map(Number).sort((a, b) => a - b);
  for (const key of keys) {
    if (cellsDesired <= key) {
      return blobPowerMap[key]!;
    }
  }
  return 0.98; // default
}

/**
 * Get line power based on number of cells
 * Used for range/trough spread calculations
 */
export function getLinePower(cellsDesired: number): number {
  const linePowerMap: Record<number, number> = {
    1000: 0.75,
    2000: 0.77,
    5000: 0.79,
    10000: 0.81,
    20000: 0.82,
    30000: 0.83,
    40000: 0.84,
    50000: 0.86,
    60000: 0.87,
    70000: 0.88,
    80000: 0.91,
    90000: 0.92,
    100000: 0.93,
  };

  // Find closest match or use default
  const keys = Object.keys(linePowerMap).map(Number).sort((a, b) => a - b);
  for (const key of keys) {
    if (cellsDesired <= key) {
      return linePowerMap[key]!;
    }
  }
  return 0.81; // default
}

/**
 * Parse range string (e.g., "10-50") to get random number in range
 */
export function getNumberInRange(range: string | number, max?: number): number {
  if (typeof range === 'number') return range;
  if (!range.includes('-')) {
    const num = parseFloat(range);
    return isNaN(num) ? 0 : num;
  }

  const [minStr, maxStr] = range.split('-');
  const min = parseFloat(minStr || '0');
  const maxValue = maxStr ? parseFloat(maxStr) : (max || min);
  return min + Math.random() * (maxValue - min);
}

/**
 * Get point in percentage range (e.g., "20-80" means 20% to 80% of length)
 */
export function getPointInRange(range: string, length: number): number {
  const num = getNumberInRange(range);
  return (num / 100) * length;
}

