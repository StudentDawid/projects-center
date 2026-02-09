/**
 * Generator pack
 * Konwertuje Grid na Pack - bardziej szczegółowa siatka Voronoi z dodatkowymi punktami wzdłuż linii brzegowych
 */

import type { Grid } from '../types/grid.types';
import type { Pack } from '../types/pack.types';
import { calculateVoronoi } from './voronoi-grid-generator';
import { createTypedArray, rn } from './map-utils';
import { CellType } from '../types/features.types';
import * as d3 from 'd3';

/**
 * Przelicza graf Voronoi na komórki pack
 * Tworzy bardziej szczegółową siatkę z dodatkowymi punktami wzdłuż linii brzegowych
 */
export function reGraph(grid: Grid): Pack {
  const { cells: gridCells, points, features } = grid;

  if (!gridCells.h || !gridCells.t || !features) {
    throw new Error('Grid must have heights, types, and features before reGraph');
  }

  const newCells: { p: Array<[number, number]>; g: number[]; h: number[] } = {
    p: [],
    g: [],
    h: [],
  };
  const spacing2 = grid.spacing ** 2;

  // Process all grid cells
  for (const i of gridCells.i) {
    const height = gridCells.h[i]!;
    const type = gridCells.t[i]!;

    // Exclude all deep ocean points (except coast)
    if (height < 20 && type !== CellType.WATER_COAST && type !== CellType.DEEP_WATER) {
      continue;
    }
    // Exclude some deep water points (every 4th, or if lake)
    if (
      type === CellType.DEEP_WATER &&
      (i % 4 === 0 || features[gridCells.f![i]!]?.type === 'lake')
    ) {
      continue;
    }

    const [x, y] = points[i]!;
    addNewPoint(i, x, y, height);

    // Add additional points for cells along coast (refinement)
    if (type === CellType.LAND_COAST || type === CellType.WATER_COAST) {
      if (gridCells.b[i]) continue; // Skip near-border cells

      for (const e of gridCells.c[i] || []) {
        if (i > e) continue; // Only process each pair once
        if (gridCells.t![e] === type) {
          const [xe, ye] = points[e]!;
          const dist2 = (y - ye) ** 2 + (x - xe) ** 2;
          if (dist2 < spacing2) continue; // Too close

          // Add midpoint
          const x1 = rn((x + xe) / 2, 1);
          const y1 = rn((y + ye) / 2, 1);
          addNewPoint(i, x1, y1, height);
        }
      }
    }
  }

  function addNewPoint(gridIndex: number, x: number, y: number, height: number): void {
    newCells.p.push([x, y]);
    newCells.g.push(gridIndex);
    newCells.h.push(height);
  }

  // Calculate new Voronoi diagram for pack points
  const { cells: packCells, vertices } = calculateVoronoi(
    newCells.p,
    grid.boundary
  );

  // Create pack structure
  const pack: Pack = {
    cells: {
      ...packCells,
      p: newCells.p,
      g: createTypedArray({
        maxValue: grid.points.length,
        from: newCells.g,
      }) as Uint16Array | Uint32Array,
      h: createTypedArray({
        maxValue: 100,
        from: newCells.h,
      }) as Uint8Array,
      area: createTypedArray({
        maxValue: 65535, // UINT16_MAX
        length: packCells.i.length,
      }) as Uint16Array | Uint32Array,
    },
    vertices,
    rivers: [],
  };

  // Calculate cell areas
  for (let cellId = 0; cellId < packCells.i.length; cellId++) {
    const polygon = getPackPolygon(pack, cellId);
    const area = Math.abs(d3.polygonArea(polygon));
    pack.cells.area[cellId] = Math.min(Math.floor(area), 65535);
  }

  // Create quadtree for spatial queries (optional)
  try {
    pack.q = d3.quadtree(
      newCells.p.map(([x, y], i) => [x, y, i] as [number, number, number])
    );
  } catch (e) {
    // Quadtree creation might fail, it's optional
    // Quadtree jest opcjonalny, więc błąd nie jest krytyczny
  }

  return pack;
}

/**
 * Pobiera współrzędne polygonu dla komórki pack
 */
export function getPackPolygon(pack: Pack, cellId: number): Array<[number, number]> {
  const vertices = pack.cells.v[cellId] || [];
  return vertices.map((vertexId) => pack.vertices.p[vertexId]!);
}

