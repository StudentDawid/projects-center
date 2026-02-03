/**
 * Voronoi Diagram Generator
 * Generates Voronoi cells for irregular map regions
 */

export interface VoronoiSite {
  x: number;
  y: number;
  id: number;
  data?: {
    height: number;
    terrain: string;
    color: { r: number; g: number; b: number };
  };
}

/**
 * Simple seeded random number generator
 */
class SeededRandom {
  private seed: number;

  constructor(seed: string) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
    }
    this.seed = hash;
  }

  next(): number {
    this.seed = (this.seed * 1103515245 + 12345) | 0;
    return (this.seed & 0x7fffffff) / 0x7fffffff;
  }
}

/**
 * Generate Voronoi sites (points) for the map
 * Uses improved distribution for more uniform cell sizes
 */
export function generateVoronoiSites(
  width: number,
  height: number,
  count: number,
  seed: string,
  islandMask: boolean = true
): VoronoiSite[] {
  const random = new SeededRandom(seed);
  const sites: VoronoiSite[] = [];

  // Estimate minimum distance between points for better distribution
  const area = width * height;
  const avgAreaPerPoint = area / count;
  const minDistance = Math.sqrt(avgAreaPerPoint) * 0.6; // Slightly less to allow more points

  // Grid-based initial placement for better uniformity
  const cols = Math.ceil(Math.sqrt(count * (width / height)));
  const rows = Math.ceil(count / cols);
  const cellWidth = width / cols;
  const cellHeight = height / rows;

  const placedPoints: Array<{ x: number; y: number }> = [];

  // Helper to check minimum distance
  function isTooClose(x: number, y: number, minDist: number): boolean {
    return placedPoints.some(
      (p) => Math.sqrt(Math.pow(p.x - x, 2) + Math.pow(p.y - y, 2)) < minDist
    );
  }

  // Use a more randomized approach - mix of grid-based and random placement
  // This creates more natural, less regular cell distribution
  for (let i = 0; i < count; i++) {
    let x: number;
    let y: number;
    let attempts = 0;
    const maxAttempts = 50;

    do {
      if (islandMask) {
        // Mix of grid-based and fully random placement (70% grid, 30% random)
        if (random.next() < 0.7) {
          // Grid-based with larger jitter for less regularity
          const gridI = i % cols;
          const gridJ = Math.floor(i / cols);

          // Base position in grid cell
          const baseX = (gridI + 0.5) * cellWidth;
          const baseY = (gridJ + 0.5) * cellHeight;

          // Larger jitter (up to 80% of cell) for more irregularity
          const jitterAmount = 0.8;
          const jitterX = (random.next() - 0.5) * cellWidth * jitterAmount;
          const jitterY = (random.next() - 0.5) * cellHeight * jitterAmount;

          x = baseX + jitterX;
          y = baseY + jitterY;
        } else {
          // Fully random placement for more natural distribution
          x = random.next() * width;
          y = random.next() * height;
        }

        // Apply island mask (weaker effect for better edge coverage)
        const centerX = width / 2;
        const centerY = height / 2;
        const distFromCenter = Math.sqrt(
          Math.pow((x - centerX) / (width / 2), 2) +
            Math.pow((y - centerY) / (height / 2), 2)
        );

        // Weaker island mask - allows more edge points
        const islandFactor = Math.max(0.3, 1 - distFromCenter * 0.8);
        if (random.next() > islandFactor) {
          // Retry placement if outside island preference
          x = width / 2 + (random.next() - 0.5) * width * 0.6;
          y = height / 2 + (random.next() - 0.5) * height * 0.6;
        }
      } else {
        // Mix of grid and random for non-island mode too
        if (random.next() < 0.7) {
          const gridI = i % cols;
          const gridJ = Math.floor(i / cols);
          const baseX = (gridI + 0.5) * cellWidth;
          const baseY = (gridJ + 0.5) * cellHeight;
          // Larger jitter for less regularity
          x = baseX + (random.next() - 0.5) * cellWidth * 0.8;
          y = baseY + (random.next() - 0.5) * cellHeight * 0.8;
        } else {
          x = random.next() * width;
          y = random.next() * height;
        }
      }

      // Clamp to bounds
      x = Math.max(0, Math.min(width - 1, x));
      y = Math.max(0, Math.min(height - 1, y));
      attempts++;
    } while (attempts < maxAttempts && isTooClose(x, y, minDistance));

    sites.push({
      x,
      y,
      id: i,
    });
    placedPoints.push({ x, y });
  }

  return sites;
}

/**
 * Find the nearest Voronoi site to a point
 */
export function findNearestSite(
  x: number,
  y: number,
  sites: VoronoiSite[]
): VoronoiSite | null {
  if (sites.length === 0) return null;

  let nearest = sites[0];
  let minDist = Math.pow(x - sites[0].x, 2) + Math.pow(y - sites[0].y, 2);

  for (let i = 1; i < sites.length; i++) {
    const dist =
      Math.pow(x - sites[i].x, 2) + Math.pow(y - sites[i].y, 2);
    if (dist < minDist) {
      minDist = dist;
      nearest = sites[i];
    }
  }

  return nearest;
}

/**
 * Calculate distance from point to site
 */
export function distanceToSite(
  x: number,
  y: number,
  site: VoronoiSite
): number {
  return Math.sqrt(Math.pow(x - site.x, 2) + Math.pow(y - site.y, 2));
}

