/**
 * Voronoi Diagram Generator using D3 Delaunay
 * Generates Voronoi cells for irregular map regions with D3
 */
import { Delaunay } from 'd3-delaunay';
import type { VoronoiSite } from './voronoi';

/**
 * Generate Voronoi diagram using D3 Delaunay
 */
export function createVoronoiDiagram(
  sites: VoronoiSite[],
  width: number,
  height: number
): {
  polygons: { polygon: number[][]; site: VoronoiSite }[];
  delaunay: Delaunay<number[]>;
} {
  // Extract points from sites
  const points: number[][] = sites.map((site) => [site.x, site.y]);

  // Create Delaunay triangulation
  const delaunay = Delaunay.from(points);

  // Create Voronoi diagram with bounds
  const voronoi = delaunay.voronoi([0, 0, width, height]);

  // Generate polygons for each site
  const polygons: { polygon: number[][]; site: VoronoiSite }[] = [];

  for (let i = 0; i < sites.length; i++) {
    const polygon = voronoi.renderCell(i);
    if (polygon) {
      // Parse the SVG path string into coordinates
      const coords: number[][] = [];
      const commands = polygon.match(/[MmLlHhVvCcSsQqTtAaZz][^MmLlHhVvCcSsQqTtAaZz]*/g) || [];

      let currentX = 0;
      let currentY = 0;

      for (const cmd of commands) {
        const type = cmd[0];
        const numbers = cmd
          .slice(1)
          .trim()
          .split(/[\s,]+/)
          .map(Number)
          .filter((n) => !isNaN(n));

        if (type === 'M' || type === 'm') {
          // Move to
          if (numbers.length >= 2) {
            currentX = type === 'M' ? numbers[0]! : currentX + numbers[0]!;
            currentY = type === 'M' ? numbers[1]! : currentY + numbers[1]!;
            coords.push([currentX, currentY]);
          }
        } else if (type === 'L' || type === 'l') {
          // Line to
          if (numbers.length >= 2) {
            currentX = type === 'L' ? numbers[0]! : currentX + numbers[0]!;
            currentY = type === 'L' ? numbers[1]! : currentY + numbers[1]!;
            coords.push([currentX, currentY]);
          }
        } else if (type === 'Z' || type === 'z') {
          // Close path - connect to first point
          if (coords.length > 0) {
            coords.push([coords[0]![0]!, coords[0]![1]!]);
          }
        }
      }

      // Better approach: use the renderCell directly with d3-path
      polygons.push({
        polygon: coords.length > 0 ? coords : [],
        site: sites[i]!,
      });
    }
  }

  return { polygons, delaunay };
}

/**
 * Generate SVG path string from Voronoi polygon
 */
export function polygonToPath(polygon: number[][]): string {
  if (polygon.length === 0) return '';

  let path = `M ${polygon[0]![0]} ${polygon[0]![1]}`;
  for (let i = 1; i < polygon.length; i++) {
    path += ` L ${polygon[i]![0]} ${polygon[i]![1]}`;
  }
  path += ' Z';
  return path;
}

/**
 * Get Voronoi cell path directly from D3 (more efficient)
 */
export function getVoronoiCellPath(
  voronoi: ReturnType<Delaunay<number[]>['voronoi']>,
  index: number
): string | null {
  const polygon = voronoi.renderCell(index);
  return polygon || null;
}

