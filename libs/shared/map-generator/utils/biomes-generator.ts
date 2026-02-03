/**
 * Generator biomes
 * Definiuje biomy na podstawie temperatury, opadów i wysokości
 */

import type { Pack, Grid } from '../types/pack.types';
import { rn } from './map-utils';
import * as d3 from 'd3';

/**
 * Typy biomes
 */
export enum BiomeType {
  Marine = 0,
  HotDesert = 1,
  ColdDesert = 2,
  Savanna = 3,
  Grassland = 4,
  TropicalSeasonalForest = 5,
  TemperateDeciduousForest = 6,
  TropicalRainforest = 7,
  TemperateRainforest = 8,
  Taiga = 9,
  Tundra = 10,
  Glacier = 11,
  Wetland = 12,
}

/**
 * Macierz biomes do klasyfikacji temperatura/opady
 * [moistureBand][temperatureBand] = biomeId
 */
const BIOMES_MATRIX = [
  // moistureBand 0 (bardzo sucho) - 4 (bardzo wilgotno)
  new Uint8Array([1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 10]),
  new Uint8Array([3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 9, 9, 9, 9, 10, 10, 10]),
  new Uint8Array([5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 9, 9, 9, 9, 9, 10, 10, 10]),
  new Uint8Array([5, 6, 6, 6, 6, 6, 6, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 10, 10, 10]),
  new Uint8Array([7, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 9, 10, 10]),
];

const MIN_LAND_HEIGHT = 20;

/**
 * Definiuje biomy dla wszystkich komórek pack
 */
export function defineBiomes(pack: Pack, grid: Grid): void {
  const { cells } = pack;
  const { h: heights, c: neighbors, g: gridReference, r: riverIds, fl: flux } = cells;

  if (!heights || !gridReference || !grid.cells.temp || !grid.cells.prec) {
    throw new Error('Pack and Grid must have required data for biome definition');
  }

  cells.biome = new Uint8Array(cells.i.length);

  for (let cellId = 0; cellId < cells.i.length; cellId++) {
    const height = heights[cellId]!;
    const moisture = height < MIN_LAND_HEIGHT ? 0 : calculateMoisture(
      cellId,
      pack,
      grid
    );
    const gridCell = gridReference[cellId]!;
    const temperature = gridCell < (grid.cells.temp?.length || 0)
      ? grid.cells.temp[gridCell]!
      : 0;

    const hasRiver = riverIds && riverIds[cellId] ? true : false;
    cells.biome[cellId] = getBiomeId(moisture, temperature, height, hasRiver);
  }
}

/**
 * Oblicza wilgotność dla komórki
 */
function calculateMoisture(
  cellId: number,
  pack: Pack,
  grid: Grid
): number {
  const { cells } = pack;
  const { g: gridReference, r: riverIds, fl: flux, c: neighbors, h: heights } = cells;

  if (!grid.cells.prec || !gridReference) return 0;

  const gridCell = gridReference[cellId]!;
  let moisture = gridCell < grid.cells.prec.length
    ? grid.cells.prec[gridCell]!
    : 0;

  // Dodaj wilgotność z rzek
  if (riverIds && riverIds[cellId] && flux && flux[cellId]) {
    moisture += Math.max(flux[cellId]! / 10, 2);
  }

  // Średnia z sąsiadami
  const neighborMoisture = (neighbors[cellId] || [])
    .filter((neibCellId) => heights[neibCellId]! >= MIN_LAND_HEIGHT)
    .map((c) => {
      const g = gridReference[c]!;
      return g < grid.cells.prec.length ? grid.cells.prec[g]! : 0;
    });

  const allMoisture = [...neighborMoisture, moisture];
  return rn(4 + (allMoisture.reduce((a, b) => a + b, 0) / allMoisture.length), 1);
}

/**
 * Pobiera ID bioma na podstawie warunków
 */
function getBiomeId(
  moisture: number,
  temperature: number,
  height: number,
  hasRiver: boolean
): BiomeType {
  // Woda
  if (height < MIN_LAND_HEIGHT) {
    return BiomeType.Marine;
  }

  // Za zimno - wieczna zmarzlina/lodowiec
  if (temperature < -5) {
    return BiomeType.Glacier;
  }

  // Gorąca pustynia (bardzo gorąco i sucho, bez rzeki)
  if (temperature >= 25 && !hasRiver && moisture < 8) {
    return BiomeType.HotDesert;
  }

  // Moczary
  if (isWetland(moisture, temperature, height)) {
    return BiomeType.Wetland;
  }

  // Użyj macierzy biomes
  const moistureBand = Math.min(Math.floor(moisture / 5), 4); // 0-4
  const temperatureBand = Math.min(Math.max(20 - temperature, 0), 25); // 0-25

  return BIOMES_MATRIX[moistureBand]![temperatureBand]! as BiomeType;
}

/**
 * Sprawdza, czy komórka powinna być mokradłem
 */
function isWetland(
  moisture: number,
  temperature: number,
  height: number
): boolean {
  if (temperature <= -2) return false; // Za zimno
  if (moisture > 40 && height < 25) return true; // Blisko wybrzeża
  if (moisture > 24 && height > 24 && height < 60) return true; // Z dala od wybrzeża
  return false;
}

