/**
 * Grid generator
 * Generates jittered grid points and boundary points for Voronoi diagram
 */

import { rn } from './map-utils';
import type { Point } from '../types/voronoi.types';
import type { GridResult } from '../types/grid.types';

/**
 * Generate jittered grid points
 * Creates a regular square grid and jitters each point randomly
 */
export function getJitteredGrid(
  width: number,
  height: number,
  spacing: number
): Point[] {
  const radius = spacing / 2; // square radius
  const jittering = radius * 0.9; // max deviation (90% of radius)
  const doubleJittering = jittering * 2;

  const jitter = (): number => Math.random() * doubleJittering - jittering;

  const points: Point[] = [];

  for (let y = radius; y < height; y += spacing) {
    for (let x = radius; x < width; x += spacing) {
      const xj = Math.min(rn(x + jitter(), 2), width);
      const yj = Math.min(rn(y + jitter(), 2), height);
      points.push([xj, yj]);
    }
  }

  return points;
}

/**
 * Generate boundary points along map edges
 * These points help clip Voronoi cells to the map boundaries
 */
export function getBoundaryPoints(
  width: number,
  height: number,
  spacing: number
): Point[] {
  const offset = rn(-1 * spacing);
  const bSpacing = spacing * 2;
  const w = width - offset * 2;
  const h = height - offset * 2;
  const numberX = Math.ceil(w / bSpacing) - 1;
  const numberY = Math.ceil(h / bSpacing) - 1;
  const points: Point[] = [];

  // Punkty wzdłuż górnej i dolnej krawędzi
  for (let i = 0.5; i < numberX; i++) {
    const x = Math.ceil((w * i) / numberX + offset);
    points.push([x, offset], [x, h + offset]);
  }

  // Punkty wzdłuż lewej i prawej krawędzi
  for (let i = 0.5; i < numberY; i++) {
    const y = Math.ceil((h * i) / numberY + offset);
    points.push([offset, y], [w + offset, y]);
  }

  return points;
}

/**
 * Place points for Voronoi diagram generation
 * Creates jittered grid and boundary points
 */
export function placePoints(
  width: number,
  height: number,
  cellsDesired: number
): GridResult {
  // Oblicz odstęp na podstawie pożądanej liczby komórek
  const spacing = rn(Math.sqrt((width * height) / cellsDesired), 2);

  // Wygeneruj punkty brzegowe i główne punkty siatki
  const boundary = getBoundaryPoints(width, height, spacing);
  const points = getJitteredGrid(width, height, spacing);

  // Oblicz wymiary siatki
  const cellsX = Math.floor((width + 0.5 * spacing - 1e-10) / spacing);
  const cellsY = Math.floor((height + 0.5 * spacing - 1e-10) / spacing);

  return {
    spacing,
    cellsDesired,
    boundary,
    points,
    cellsX,
    cellsY,
  };
}

