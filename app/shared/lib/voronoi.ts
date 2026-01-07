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

  for (let i = 0; i < count; i++) {
    let x: number;
    let y: number;
    let attempts = 0;

    // Generate points with island mask (prefer center)
    do {
      if (islandMask) {
        // Use square distribution first, then apply island mask
        const angle = random.next() * Math.PI * 2;
        const radius = Math.sqrt(random.next()) * Math.min(width, height) * 0.4;
        x = width / 2 + Math.cos(angle) * radius;
        y = height / 2 + Math.sin(angle) * radius;

        // Clamp to bounds
        x = Math.max(0, Math.min(width - 1, x));
        y = Math.max(0, Math.min(height - 1, y));
      } else {
        x = random.next() * width;
        y = random.next() * height;
      }
      attempts++;
    } while (attempts < 100); // Safety limit

    sites.push({
      x,
      y,
      id: i,
    });
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

