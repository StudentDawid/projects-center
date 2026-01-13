/**
 * Pack features markup
 * Marks features in Pack structure (similar to markupGrid but for pack)
 */

import type { Pack } from '../types/pack.types';
import type { Grid } from '../types/grid.types';
import type { Feature, FeatureGroup } from '../types/features.types';
import { CellType } from '../types/features.types';
import { createTypedArray, rn } from './map-utils';
import * as d3 from 'd3';

/**
 * Markup parameters for distance field calculation
 */
interface MarkupParams {
  distanceField: Int8Array;
  neighbors: number[][];
  start: number;
  increment: number;
  limit?: number;
}

/**
 * Calculate distance field using flood-fill algorithm
 */
function markup({
  distanceField,
  neighbors,
  start,
  increment,
  limit = 127,
}: MarkupParams): void {
  const UNMARKED = CellType.UNMARKED;

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
 * Mark Pack features (oceans, lakes, islands) and calculate distance field
 */
export function markupPack(pack: Pack, grid: Grid): void {
  const { cells } = pack;
  const { c: neighbors, b: borderCells, i, h: heights, p: points } = cells;

  if (!heights) {
    throw new Error('Pack must have heights before feature markup');
  }

  const packCellsNumber = i.length;
  const distanceField = new Int8Array(packCellsNumber);
  const featureIds = createTypedArray({
    maxValue: packCellsNumber,
    length: packCellsNumber,
  }) as Uint16Array;
  const haven = createTypedArray({
    maxValue: packCellsNumber,
    length: packCellsNumber,
  }) as Uint16Array | Uint32Array;
  const harbor = new Uint8Array(packCellsNumber);
  const features: Feature[] = [{ i: 0, land: false, border: false, type: 'ocean' }];

  const UNMARKED = CellType.UNMARKED;
  const LAND_COAST = CellType.LAND_COAST;
  const WATER_COAST = CellType.WATER_COAST;
  const LANDLOCKED = CellType.LANDLOCKED;
  const DEEPER_LAND = CellType.DEEPER_LAND;
  const DEEP_WATER = CellType.DEEP_WATER;

  function isLand(cellId: number): boolean {
    return heights[cellId]! >= 20;
  }

  function isWater(cellId: number): boolean {
    return !isLand(cellId);
  }

  function dist2(p1: [number, number], p2: [number, number]): number {
    const dx = p1[0] - p2[0];
    const dy = p1[1] - p2[1];
    return dx * dx + dy * dy;
  }

  function defineHaven(cellId: number): void {
    const waterCells = (neighbors[cellId] || []).filter(isWater);
    if (waterCells.length === 0) return;

    const distances = waterCells.map((neibCellId) =>
      dist2(points[cellId]!, points[neibCellId]!)
    );
    const closest = distances.indexOf(Math.min(...distances));
    haven[cellId] = waterCells[closest]!;
    harbor[cellId] = waterCells.length;
  }

    function addFeature({
    firstCell,
    land,
    border,
    featureId,
    totalCells,
  }: {
    firstCell: number;
    land: boolean;
    border: boolean;
    featureId: number;
    totalCells: number;
  }): Feature {
    const type = land ? 'island' : border ? 'ocean' : 'lake';
    const feature: Feature = {
      i: featureId,
      land,
      border,
      type,
      cells: totalCells,
      firstCell,
    };

      // For lakes, find shoreline cells (cells with land neighbors)
    if (type === 'lake') {
      const shoreline: number[] = [];
      for (let i = 0; i < packCellsNumber; i++) {
        if (featureIds[i] === featureId) {
          // Check if this cell has a land neighbor
          const cellNeighbors = neighbors[i] || [];
          const hasLandNeighbor = cellNeighbors.some((n) => {
            if (n >= 0 && n < packCellsNumber) {
              return heights[n]! >= 20;
            }
            return false;
          });
          if (hasLandNeighbor) {
            shoreline.push(i);
          }
        }
      }
      feature.shoreline = shoreline;
    }

    return feature;
  }

  // Flood-fill to identify features
  const queue: number[] = [0];

  for (let featureId = 1; queue[0] !== -1; featureId++) {
    const firstCell = queue[0]!;
    featureIds[firstCell] = featureId;

    const land = isLand(firstCell);
    let border = Boolean(borderCells[firstCell]);
    let totalCells = 1;

    while (queue.length > 0) {
      const cellId = queue.pop()!;
      if (borderCells[cellId]) {
        border = true;
      }

      for (const neighborId of neighbors[cellId] || []) {
        if (neighborId < 0 || neighborId >= packCellsNumber) continue;

        const isNeibLand = isLand(neighborId);

        if (land && !isNeibLand) {
          distanceField[cellId] = LAND_COAST;
          distanceField[neighborId] = WATER_COAST;
          if (!haven[cellId]) {
            defineHaven(cellId);
          }
        } else if (land && isNeibLand) {
          if (
            distanceField[neighborId] === UNMARKED &&
            distanceField[cellId] === LAND_COAST
          ) {
            distanceField[neighborId] = LANDLOCKED;
          } else if (
            distanceField[cellId] === UNMARKED &&
            distanceField[neighborId] === LAND_COAST
          ) {
            distanceField[cellId] = LANDLOCKED;
          }
        }

        if (!featureIds[neighborId] && land === isNeibLand) {
          queue.push(neighborId);
          featureIds[neighborId] = featureId;
          totalCells++;
        }
      }
    }

    features.push(addFeature({ firstCell, land, border, featureId, totalCells }));

    const nextUnmarked = featureIds.findIndex((f) => f === UNMARKED);
    queue[0] = nextUnmarked;
  }

  // Markup distance fields
  markup({
    distanceField,
    neighbors,
    start: DEEPER_LAND,
    increment: 1,
  });
  markup({
    distanceField,
    neighbors,
    start: DEEP_WATER,
    increment: -1,
    limit: -10,
  });

  // Update pack
  cells.t = distanceField;
  cells.f = featureIds;
  cells.haven = haven;
  cells.harbor = harbor;
  pack.features = features;
}

/**
 * Define feature groups (classify features into subtypes)
 * Based on size and properties
 */
export function defineFeatureGroups(pack: Pack, grid: Grid): void {
  if (!pack.features) {
    throw new Error('Pack must have features before defining groups');
  }

  const gridCellsNumber = grid.cells.i.length;
  const OCEAN_MIN_SIZE = gridCellsNumber / 25;
  const SEA_MIN_SIZE = gridCellsNumber / 1000;
  const CONTINENT_MIN_SIZE = gridCellsNumber / 10;
  const ISLAND_MIN_SIZE = gridCellsNumber / 1000;

  for (const feature of pack.features) {
    if (!feature || feature.type === 'ocean') continue;

    // Calculate lake height if needed
    if (feature.type === 'lake') {
      feature.height = getLakeHeight(pack, feature);
    }

    // Define group
    feature.group = defineGroup(feature, {
      OCEAN_MIN_SIZE,
      SEA_MIN_SIZE,
      CONTINENT_MIN_SIZE,
      ISLAND_MIN_SIZE,
      pack,
      grid,
    });
  }

  function defineGroup(
    feature: Feature,
    thresholds: {
      OCEAN_MIN_SIZE: number;
      SEA_MIN_SIZE: number;
      CONTINENT_MIN_SIZE: number;
      ISLAND_MIN_SIZE: number;
      pack: Pack;
      grid: Grid;
    }
  ): FeatureGroup {
    if (feature.type === 'island') {
      return defineIslandGroup(feature, thresholds);
    }
    if (feature.type === 'lake') {
      return defineLakeGroup(feature, thresholds.grid);
    }
    // Ocean groups are handled separately (they don't get groups in defineGroups)
    return 'ocean';
  }

  function defineIslandGroup(
    feature: Feature,
    thresholds: {
      CONTINENT_MIN_SIZE: number;
      ISLAND_MIN_SIZE: number;
      pack: Pack;
    }
  ): FeatureGroup {
    const { CONTINENT_MIN_SIZE, ISLAND_MIN_SIZE, pack } = thresholds;

    // Check if it's in a lake
    if (feature.firstCell !== undefined && feature.firstCell > 0) {
      const prevFeature = pack.features?.[feature.firstCell - 1];
      if (prevFeature && prevFeature.type === 'lake') {
        return 'lake_island';
      }
    }

    const cells = feature.cells || 0;
    if (cells > CONTINENT_MIN_SIZE) return 'continent';
    if (cells > ISLAND_MIN_SIZE) return 'island';
    return 'isle';
  }

  function defineLakeGroup(feature: Feature, grid: Grid): FeatureGroup {
    // Frozen lakes
    if (feature.temp !== undefined && feature.temp < -3) {
      return 'frozen';
    }

    // Lava lakes (high elevation, small, specific conditions)
    if (
      feature.height !== undefined &&
      feature.height > 60 &&
      (feature.cells || 0) < 10 &&
      feature.firstCell !== undefined &&
      feature.firstCell % 10 === 0
    ) {
      return 'lava';
    }

    // Dry lakes (no inlets/outlet, high evaporation)
    if (!feature.inlets && !feature.outlet) {
      if (
        feature.evaporation !== undefined &&
        feature.flux !== undefined &&
        feature.evaporation > feature.flux * 4
      ) {
        return 'dry';
      }

      // Sinkholes (very small, specific conditions)
      if (
        (feature.cells || 0) < 3 &&
        feature.firstCell !== undefined &&
        feature.firstCell % 10 === 0
      ) {
        return 'sinkhole';
      }
    }

    // Salt lakes (no outlet, evaporation > flux)
    if (
      !feature.outlet &&
      feature.evaporation !== undefined &&
      feature.flux !== undefined &&
      feature.evaporation > feature.flux
    ) {
      return 'salt';
    }

    // Default: freshwater
    return 'freshwater';
  }
}

/**
 * Get lake height (elevation of lake surface)
 * Simplified version - uses first cell and neighbors if shoreline not available
 */
function getLakeHeight(pack: Pack, feature: Feature): number {
  const { cells } = pack;
  const LAKE_ELEVATION_DELTA = 0.1;

  if (!cells.h || !cells.f || !cells.t) {
    return 19.9; // Default water height
  }

  // If shoreline is available, use it
  if (feature.shoreline && feature.shoreline.length > 0) {
    const shorelineHeights = feature.shoreline.map(
      (cellId) => cells.h?.[cellId] || 20
    );
    const minShoreHeight = Math.min(...shorelineHeights, 20);
    return rn(minShoreHeight - LAKE_ELEVATION_DELTA, 2);
  }

  // Otherwise, find cells at the border of the lake (cells with LAND_COAST neighbors)
  const lakeCells: number[] = [];
  for (let i = 0; i < cells.i.length; i++) {
    if (cells.f[i] === feature.i) {
      // Check if this cell has a land neighbor (it's on the shoreline)
      const neighbors = cells.c[i] || [];
      const hasLandNeighbor = neighbors.some(
        (n) => cells.t?.[n] === CellType.LAND_COAST
      );
      if (hasLandNeighbor) {
        lakeCells.push(i);
      }
    }
  }

  if (lakeCells.length === 0) {
    // Fallback: use first cell height
    const firstCell = feature.firstCell ?? 0;
    return rn((cells.h[firstCell] || 20) - LAKE_ELEVATION_DELTA, 2);
  }

  // Find minimum height of shoreline cells
  const shorelineHeights = lakeCells.map((cellId) => cells.h?.[cellId] || 20);
  const minShoreHeight = Math.min(...shorelineHeights, 20);

  return rn(minShoreHeight - LAKE_ELEVATION_DELTA, 2);
}

