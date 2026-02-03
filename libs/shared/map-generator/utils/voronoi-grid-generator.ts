/**
 * Voronoi grid generator
 * Main generator that creates Voronoi diagram from grid points
 */

import { Delaunay } from 'd3-delaunay';
import { VoronoiGenerator } from './voronoi-generator';
import { placePoints } from './grid-generator';
import type { Point } from '../types/voronoi.types';
import type { GridResult, Grid } from '../types/grid.types';
import type { VoronoiDiagram } from '../types/voronoi.types';

/**
 * Generate Voronoi grid
 */
export function generateVoronoiGrid(
  width: number,
  height: number,
  cellsDesired: number,
  seed: string,
  randomFn: () => number = Math.random
): Grid {
  // Zapisz oryginalny Math.random
  const originalRandom = Math.random;

  // Zastąp Math.random tymczasowo do generowania punktów
  // Używane w getJitteredGrid i getBoundaryPoints
  const MathAny = Math as { random: () => number };
  MathAny.random = randomFn;

  try {
    // Krok 1: Umieść punkty (jittered grid + boundary)
    const gridData: GridResult = placePoints(width, height, cellsDesired);

    // Krok 2: Oblicz diagram Voronoi
    const voronoiResult = calculateVoronoi(
      gridData.points,
      gridData.boundary
    );

    // Krok 3: Połącz wszystko w strukturę siatki
    const grid: Grid = {
      spacing: gridData.spacing,
      cellsDesired: gridData.cellsDesired,
      boundary: gridData.boundary,
      points: gridData.points,
      cellsX: gridData.cellsX,
      cellsY: gridData.cellsY,
      cells: voronoiResult.cells,
      vertices: voronoiResult.vertices,
      seed,
      width,
      height,
    };

    return grid;
  } finally {
    // Przywróć oryginalny Math.random
    const MathAny = Math as { random: () => number };
    MathAny.random = originalRandom;
  }
}

/**
 * Calculate Voronoi diagram from points and boundary
 */
export function calculateVoronoi(
  points: Point[],
  boundary: Point[]
): VoronoiDiagram {
  // Połącz wszystkie punkty (punkty główne + boundary)
  const allPoints = [...points, ...boundary];

  // Utwórz triangulację Delaunay używając d3-delaunay
  const delaunay = Delaunay.from(
    allPoints.map((p) => [p[0], p[1]])
  );

  // Konwertuj na Voronoi używając naszej własnej klasy
  // Musimy uzyskać dostęp do właściwości wewnętrznych - d3-delaunay przechowuje je inaczej
  const voronoi = new VoronoiGenerator(
    delaunay,
    allPoints,
    points.length
  );

  return voronoi.getDiagram();
}

/**
 * Get polygon coordinates for a cell
 */
export function getGridPolygon(
  grid: Grid,
  cellId: number
): Array<[number, number]> {
  if (!grid.cells.v[cellId]) {
    return [];
  }
  return grid.cells.v[cellId].map(
    (vertexId) => grid.vertices.p[vertexId] || [0, 0]
  );
}

