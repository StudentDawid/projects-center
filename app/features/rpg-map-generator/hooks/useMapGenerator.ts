import { ref, computed } from 'vue';
import { Delaunay } from 'd3-delaunay';
import { initNoise, fbm } from '~/shared/lib/perlin-noise';
import {
  generateVoronoiSites,
  findNearestSite,
  type VoronoiSite,
} from '~/shared/lib/voronoi';
import { useMapGeneratorStore } from '~/stores/map-generator/map-generator';
import type { MapSettings, Settlement, River, Road, PointOfInterest, POIType } from '~/shared/types/map-generator.types';
import { POI_TYPES } from '~/shared/types/map-generator.types';

export interface VoronoiCell {
  path: string;
  color: { r: number; g: number; b: number };
  stroke: string;
  strokeWidth: number;
  site: VoronoiSite;
}

export function useMapGenerator() {
  const store = useMapGeneratorStore();
  const isGenerating = ref(false);
  const voronoiCells = ref<VoronoiCell[]>([]);
  const settlements = ref<Settlement[]>([]);
  const rivers = ref<River[]>([]);
  const roads = ref<Road[]>([]);
  const poi = ref<PointOfInterest[]>([]);
  const voronoiSites = ref<VoronoiSite[]>([]);

  /**
   * Calculate terrain color for a given height and noise values
   */
  function getTerrainColor(
    height: number,
    forestNoise: number,
    waterThreshold: number,
    mountainThreshold: number,
    forestChance: number
  ): { r: number; g: number; b: number } {
    if (height < waterThreshold - 0.1) {
      // Deep water
      return { r: 26, g: 95, b: 122 };
    } else if (height < waterThreshold) {
      // Shallow water
      return { r: 52, g: 152, b: 219 };
    } else if (height < waterThreshold + 0.05) {
      // Beach
      return { r: 244, g: 208, b: 63 };
    } else if (height > mountainThreshold + 0.1) {
      // Snow peak
      return { r: 236, g: 240, b: 241 };
    } else if (height > mountainThreshold) {
      // Mountain
      return { r: 127, g: 140, b: 141 };
    } else {
      // Check for forest
      if (forestNoise > (1 - forestChance) * 0.5) {
        // Forest
        return { r: 39, g: 174, b: 96 };
      } else {
        // Grassland
        return { r: 88, g: 214, b: 141 };
      }
    }
  }

  /**
   * Get height at a specific point by interpolating from nearest Voronoi sites
   * Uses inverse distance weighting for smooth interpolation
   */
  function getHeightAt(
    x: number,
    y: number,
    sites: VoronoiSite[]
  ): number {
    if (sites.length === 0) return 0;

    // Find nearest sites (use up to 3 nearest for interpolation)
    const distances = sites.map((site, index) => ({
      index,
      distance: Math.sqrt(
        Math.pow(site.x - x, 2) + Math.pow(site.y - y, 2)
      ),
      height: site.data?.height ?? 0,
    }));

    distances.sort((a, b) => a.distance - b.distance);

    // Use inverse distance weighting
    const nearest = distances.slice(0, 3);
    const minDistance = nearest[0]?.distance ?? 1;
    const maxDistance = nearest[nearest.length - 1]?.distance ?? 1;

    // If very close to a site, use its height directly
    if (minDistance < 2) {
      return nearest[0]?.height ?? 0;
    }

    // Inverse distance weighting
    let totalWeight = 0;
    let weightedHeight = 0;

    for (const n of nearest) {
      const weight = 1 / (n.distance + 1); // +1 to avoid division by zero
      totalWeight += weight;
      weightedHeight += n.height * weight;
    }

    return totalWeight > 0 ? weightedHeight / totalWeight : 0;
  }

  /**
   * Generate terrain using Voronoi cells with D3
   * @param settings Map settings
   * @param width Screen width
   * @param height Screen height
   */
  function generateTerrainVoronoiSVG(
    settings: MapSettings,
    width: number,
    height: number
  ): VoronoiCell[] {
    // Use screen size for map generation
    const mapWidth = width;
    const mapHeight = height;
    const scale = 4;
    const waterThreshold = (settings.waterLevel / 100) * 0.3 - 0.15;
    const mountainThreshold = 1 - (settings.mountainLevel / 100) * 0.4;
    const forestChance = settings.forestLevel / 100;

    // Use Voronoi cell count directly from settings
    // User controls this via slider (0-10000)
    const voronoiCellCount = settings.voronoiCellCount || 1000;

    // Generate Voronoi sites with improved uniform distribution
    const sites = generateVoronoiSites(
      mapWidth,
      mapHeight,
      voronoiCellCount,
      settings.seed,
      true
    );
    // Store sites for river generation
    voronoiSites.value = sites;

    // Calculate terrain data for each site
    const centerX = mapWidth / 2;
    const centerY = mapHeight / 2;
    const maxDist = Math.max(centerX, centerY);

    for (const site of sites) {
      const nx = (site.x / mapWidth) * scale;
      const ny = (site.y / mapHeight) * scale;

      const distFromCenter = Math.sqrt(
        Math.pow((site.x - centerX) / maxDist, 2) +
          Math.pow((site.y - centerY) / maxDist, 2)
      );
      const islandMask = Math.max(0, 1 - distFromCenter * 1.2);

      const height = fbm(nx, ny, 6) * islandMask;
      const forestNoise = fbm(nx * 2 + 100, ny * 2 + 100, 4);

      const color = getTerrainColor(
        height,
        forestNoise,
        waterThreshold,
        mountainThreshold,
        forestChance
      );

      site.data = {
        height,
        terrain: '',
        color,
      };
    }

    // Add padding points outside the map bounds to reduce edge cell stretching
    // This creates a "halo" of points around the map to prevent large edge cells
    const area = mapWidth * mapHeight;
    const avgAreaPerPoint = area / voronoiCellCount;
    const avgDistance = Math.sqrt(avgAreaPerPoint);

    const paddingDistance = Math.min(mapWidth, mapHeight) * 0.15; // 15% of smaller dimension
    const paddingPoints: number[][] = [];
    const paddingSpacing = avgDistance * 1.5; // Space between padding points

    // Add points along top and bottom edges
    const horizontalPaddingCount = Math.ceil(mapWidth / paddingSpacing);
    for (let i = 0; i <= horizontalPaddingCount; i++) {
      const x = (i / horizontalPaddingCount) * mapWidth;
      paddingPoints.push([x, -paddingDistance]); // Top
      paddingPoints.push([x, mapHeight + paddingDistance]); // Bottom
    }

    // Add points along left and right edges
    const verticalPaddingCount = Math.ceil(mapHeight / paddingSpacing);
    for (let i = 0; i <= verticalPaddingCount; i++) {
      const y = (i / verticalPaddingCount) * mapHeight;
      paddingPoints.push([-paddingDistance, y]); // Left
      paddingPoints.push([mapWidth + paddingDistance, y]); // Right
    }

    // Add corner points
    paddingPoints.push([-paddingDistance, -paddingDistance]); // Top-left
    paddingPoints.push([mapWidth + paddingDistance, -paddingDistance]); // Top-right
    paddingPoints.push([-paddingDistance, mapHeight + paddingDistance]); // Bottom-left
    paddingPoints.push([mapWidth + paddingDistance, mapHeight + paddingDistance]); // Bottom-right

    // Combine map points with padding points
    const allPoints = [
      ...sites.map((site) => [site.x, site.y]),
      ...paddingPoints,
    ];

    const delaunay = Delaunay.from(allPoints);
    // Extend bounds to include padding area
    const voronoi = delaunay.voronoi([
      -paddingDistance,
      -paddingDistance,
      mapWidth + paddingDistance,
      mapHeight + paddingDistance,
    ]);

    // Generate SVG paths for each Voronoi cell
    // Only render cells for actual map sites (skip padding points)
    const cells: VoronoiCell[] = [];

    for (let i = 0; i < sites.length; i++) {
      const site = sites[i]!;
      const path = voronoi.renderCell(i);

      if (path && site.data) {
        // Determine stroke color based on terrain type
        let stroke = 'rgba(0, 0, 0, 0.3)';
        let strokeWidth = 0.5;

        // Darker stroke for water/beach borders
        if (site.data.height < waterThreshold + 0.05) {
          stroke = 'rgba(0, 0, 0, 0.4)';
          strokeWidth = 0.8;
        }
        // Lighter stroke for mountains
        else if (site.data.height > mountainThreshold) {
          stroke = 'rgba(255, 255, 255, 0.2)';
          strokeWidth = 0.5;
        }

        cells.push({
          path,
          color: site.data.color,
          stroke,
          strokeWidth,
          site,
        });
      }
    }

    return cells;
  }

  /**
   * Generate terrain using pixel-based approach (for canvas fallback)
   */
  function generateTerrainPixel(
    ctx: CanvasRenderingContext2D,
    settings: MapSettings
  ): void {
    const size = settings.size;
    const scale = 4; // Noise scale

    // Generate height map
    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;

    const waterThreshold = (settings.waterLevel / 100) * 0.3 - 0.15;
    const mountainThreshold = 1 - (settings.mountainLevel / 100) * 0.4;
    const forestChance = settings.forestLevel / 100;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const nx = (x / size) * scale;
        const ny = (y / size) * scale;

        // Height value with island mask
        const distFromCenter = Math.sqrt(
          Math.pow((x - size / 2) / (size / 2), 2) +
            Math.pow((y - size / 2) / (size / 2), 2)
        );
        const islandMask = Math.max(0, 1 - distFromCenter * 1.2);

        const height = fbm(nx, ny, 6) * islandMask;
        const forestNoise = fbm(nx * 2 + 100, ny * 2 + 100, 4);

        const color = getTerrainColor(
          height,
          forestNoise,
          waterThreshold,
          mountainThreshold,
          forestChance
        );

        const idx = (y * size + x) * 4;
        data[idx] = color.r;
        data[idx + 1] = color.g;
        data[idx + 2] = color.b;
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Generate complete map using SVG
   * @param svg SVG element to render to
   * @param width Screen width
   * @param height Screen height
   * OPTIMIZATION: Uses requestAnimationFrame to yield control and prevent UI blocking
   */
  async function generateMap(
    svg: SVGSVGElement | null,
    width: number,
    height: number
  ): Promise<void> {
    if (!svg) return;

    isGenerating.value = true;

    try {
      const settings = store.mapSettings;

      // Use seed or generate random
      if (!settings.seed) {
        store.randomizeSeed();
      }

      // Initialize noise with seed
      initNoise(store.mapSettings.seed);
      // Store canvas size based on screen dimensions
      store.setCanvasSize(Math.max(width, height));

      // Wait for SVG to be ready
      await new Promise(resolve => requestAnimationFrame(resolve));

      // Yield to allow UI to update
      await new Promise(resolve => requestAnimationFrame(resolve));

      // Generate Voronoi cells with screen dimensions
      // For very large maps, we could chunk this, but for now we do it in one go
      // The viewport culling in MapCanvas will handle rendering performance
      voronoiCells.value = generateTerrainVoronoiSVG(settings, width, height);

      // Yield again after generating cells
      await new Promise(resolve => requestAnimationFrame(resolve));

      // Generate settlements (we'll do this separately)
      generateSettlementsData(settings, width, height);

      // Yield again after generating settlements
      await new Promise(resolve => requestAnimationFrame(resolve));

      // Generate rivers if enabled
      if (settings.enableRivers) {
        rivers.value = generateRivers(settings, width, height);
        // Store rivers in store
        store.setRivers(rivers.value);
      } else {
        rivers.value = [];
        store.setRivers([]);
      }

      // Yield again after generating rivers
      await new Promise(resolve => requestAnimationFrame(resolve));

      // Generate roads if enabled
      if (settings.enableRoads) {
        roads.value = generateRoads(settings, width, height);
        // Store roads in store
        store.setRoads(roads.value);
      } else {
        roads.value = [];
        store.setRoads([]);
      }

      // Yield again after generating roads
      await new Promise(resolve => requestAnimationFrame(resolve));

      // Generate POI if enabled
      if (settings.enablePOI) {
        poi.value = generatePOI(settings, width, height);
        // Store POI in store
        store.setPOI(poi.value);
      } else {
        poi.value = [];
        store.setPOI([]);
      }

      // Final yield before marking as complete
      await new Promise(resolve => requestAnimationFrame(resolve));

      store.setMapGenerated(true);
    } finally {
      isGenerating.value = false;
    }
  }

  /**
   * Generate settlements data
   * @param settings Map settings
   * @param width Screen width
   * @param height Screen height
   */
  function generateSettlementsData(
    settings: MapSettings,
    width: number,
    height: number
  ): void {
    settlements.value = [];
    const scale = 4;
    const waterThreshold = (settings.waterLevel / 100) * 0.3 - 0.15;

    const centerX = width / 2;
    const centerY = height / 2;
    const maxDist = Math.max(centerX, centerY);

    const CITY_NAMES = [
      'Królewski Gród', 'Srebrna Twierdza', 'Żelazna Cytadela', 'Złoty Port', 'Mroźny Bastion',
      'Bursztynowy Zamek', 'Szmaragdowa Wieża', 'Rubinowe Wzgórze', 'Diamentowy Szczyt', 'Szafirowa Dolina',
    ];

    const VILLAGE_NAMES = [
      'Mała Wioska', 'Stare Dęby', 'Młyńskie Błonia', 'Leśna Polana', 'Rzeczny Bród',
      'Wzgórze Pastuszków', 'Kamienny Most', 'Sosnowy Gaj', 'Wilcza Jama', 'Jaskółcze Gniazdo',
      'Słoneczna Dolina', 'Mglisty Jar', 'Cichy Zakątek', 'Brzozowy Lasek', 'Podmokłe Łąki',
    ];

    // Calculate min distance based on screen size
    const minCityDistance = Math.max(60, Math.min(width, height) * 0.06);
    const minVillageDistance = Math.max(25, Math.min(width, height) * 0.025);

    // Place cities
    let placedCities = 0;
    let attempts = 0;
    while (placedCities < settings.cityCount && attempts < 1000) {
      attempts++;
      const x = Math.floor(Math.random() * width * 0.8 + width * 0.1);
      const y = Math.floor(Math.random() * height * 0.8 + height * 0.1);

      const nx = (x / width) * scale;
      const ny = (y / height) * scale;
      const distFromCenter = Math.sqrt(
        Math.pow((x - centerX) / maxDist, 2) +
          Math.pow((y - centerY) / maxDist, 2)
      );
      const terrainHeight = fbm(nx, ny, 6) * Math.max(0, 1 - distFromCenter * 1.2);

      if (terrainHeight > waterThreshold + 0.05 && terrainHeight < 0.6) {
        const tooClose = settlements.value.some(s =>
          Math.sqrt(Math.pow(s.x - x, 2) + Math.pow(s.y - y, 2)) < minCityDistance
        );

        if (!tooClose) {
          settlements.value.push({
            x,
            y,
            type: 'city',
            name: CITY_NAMES[placedCities % CITY_NAMES.length] ?? 'Miasto',
          });
          placedCities++;
        }
      }
    }

    // Place villages
    let placedVillages = 0;
    attempts = 0;
    while (placedVillages < settings.villageCount && attempts < 2000) {
      attempts++;
      const x = Math.floor(Math.random() * width * 0.9 + width * 0.05);
      const y = Math.floor(Math.random() * height * 0.9 + height * 0.05);

      const nx = (x / width) * scale;
      const ny = (y / height) * scale;
      const distFromCenter = Math.sqrt(
        Math.pow((x - centerX) / maxDist, 2) +
          Math.pow((y - centerY) / maxDist, 2)
      );
      const terrainHeight = fbm(nx, ny, 6) * Math.max(0, 1 - distFromCenter * 1.2);

      if (terrainHeight > waterThreshold + 0.03 && terrainHeight < 0.7) {
        const tooClose = settlements.value.some(s => {
          const dist = Math.sqrt(Math.pow(s.x - x, 2) + Math.pow(s.y - y, 2));
          return s.type === 'city' ? dist < minCityDistance * 0.67 : dist < minVillageDistance;
        });

        if (!tooClose) {
          settlements.value.push({
            x,
            y,
            type: 'village',
            name: VILLAGE_NAMES[placedVillages % VILLAGE_NAMES.length] ?? 'Wioska',
          });
          placedVillages++;
        }
      }
    }

    // Store settlements in store
    store.setSettlements(settlements.value);
  }

  /**
   * Generate rivers on the map
   * Rivers flow from high points (mountains) to low points (sea)
   */
  function generateRivers(
    settings: MapSettings,
    width: number,
    height: number
  ): River[] {
    if (!settings.enableRivers || settings.riverCount === 0) {
      return [];
    }

    const waterThreshold = (settings.waterLevel / 100) * 0.3 - 0.15;
    const mountainThreshold = 1 - (settings.mountainLevel / 100) * 0.4;
    const sites = voronoiSites.value;

    if (sites.length === 0) {
      return [];
    }

    const rivers: River[] = [];
    const stepSize = Math.min(width, height) / 400; // Step size for river path
    // Lower threshold - allow rivers to start from hills as well, not just high mountains
    // Use relative height: at least 0.3 above water level, or in top 20% of terrain
    const minSourceHeight = Math.max(
      waterThreshold + 0.3,
      mountainThreshold * 0.8  // 80% of mountain height is enough
    );
    const maxRiverLength = Math.max(width, height) * 2; // Maximum river length

    // Find potential river sources (high points)
    // First, find all heights to determine distribution
    const allHeights = sites
      .map(s => s.data?.height ?? 0)
      .filter(h => h > waterThreshold)
      .sort((a, b) => b - a);

    const top20PercentIndex = Math.floor(allHeights.length * 0.2);
    const top20PercentHeight = allHeights[top20PercentIndex] ?? 0;

    // Use lower of: absolute threshold or top 20% of terrain
    const effectiveMinHeight = Math.max(minSourceHeight, top20PercentHeight);

    const potentialSources: Array<{ x: number; y: number; height: number }> = [];

    for (const site of sites) {
      if (site.data && site.data.height >= effectiveMinHeight && site.data.height > waterThreshold + 0.1) {
        potentialSources.push({
          x: site.x,
          y: site.y,
          height: site.data.height,
        });
      }
    }

    // If we have fewer sources than requested, use what we have
    if (potentialSources.length === 0) {
      // Fallback: find any points above water level
      for (const site of sites) {
        if (site.data && site.data.height > waterThreshold + 0.15) {
          potentialSources.push({
            x: site.x,
            y: site.y,
            height: site.data.height,
          });
        }
      }
    }

    // Sort by height (highest first) and take top candidates
    potentialSources.sort((a, b) => b.height - a.height);
    const selectedSources = potentialSources.slice(
      0,
      Math.min(settings.riverCount * 5, potentialSources.length)
    );

    // Shuffle and select final sources (to avoid clustering)
    const shuffled = [...selectedSources].sort(() => Math.random() - 0.5);
    const finalSources = shuffled.slice(0, Math.min(settings.riverCount, shuffled.length));

    // Generate each river
    for (let i = 0; i < finalSources.length; i++) {
      const source = finalSources[i];
      if (!source) continue;

      const segments: Array<{ x: number; y: number }> = [];
      let currentX = source.x;
      let currentY = source.y;
      let currentHeight = source.height;
      let pathLength = 0;

      segments.push({ x: currentX, y: currentY });

      // Flow down gradient until reaching water or map edge
      while (currentHeight > waterThreshold && pathLength < maxRiverLength) {
        // Find steepest descent direction (8 neighbors)
        let bestNeighbor: { x: number; y: number; height: number } | null = null;
        let steepestSlope = -Infinity;

        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue;

            const testX = currentX + dx * stepSize;
            const testY = currentY + dy * stepSize;

            // Check bounds
            if (testX < 0 || testX >= width || testY < 0 || testY >= height) {
              continue;
            }

            const testHeight = getHeightAt(testX, testY, sites);
            const slope = (currentHeight - testHeight) / stepSize;

            if (slope > steepestSlope) {
              steepestSlope = slope;
              bestNeighbor = { x: testX, y: testY, height: testHeight };
            }
          }
        }

        // If no valid neighbor found, stop
        if (!bestNeighbor || steepestSlope <= 0) {
          break;
        }

        // Move to next point
        currentX = bestNeighbor.x;
        currentY = bestNeighbor.y;
        currentHeight = bestNeighbor.height;
        pathLength += stepSize;

        segments.push({ x: currentX, y: currentY });

        // Stop if reached water
        if (currentHeight <= waterThreshold) {
          break;
        }

        // Stop if reached map edge
        if (
          currentX <= 0 ||
          currentX >= width - 1 ||
          currentY <= 0 ||
          currentY >= height - 1
        ) {
          break;
        }
      }

      // Only create river if it has minimum length
      if (segments.length >= 3) {
        const river: River = {
          id: `river-${i}`,
          segments,
          width: settings.riverWidth,
          source: { x: source.x, y: source.y },
          mouth: {
            x: segments[segments.length - 1]?.x ?? source.x,
            y: segments[segments.length - 1]?.y ?? source.y,
          },
          flow: 1, // Start with base flow, can be enhanced later
        };

        rivers.push(river);
      }
    }

    // Merge rivers that flow into each other
    // This is a simplified version - could be enhanced
    const mergedRivers: River[] = [];
    const usedRivers = new Set<number>();

    for (let i = 0; i < rivers.length; i++) {
      if (usedRivers.has(i)) continue;

      const river = rivers[i];
      if (!river) continue;

      let mergedRiver = { ...river };

      // Find rivers that flow into this one (check if mouth is close to any segment)
      for (let j = i + 1; j < rivers.length; j++) {
        if (usedRivers.has(j)) continue;

        const otherRiver = rivers[j];
        if (!otherRiver) continue;

        // Check if other river's mouth is close to this river's path
        const threshold = stepSize * 3;
        const otherMouth = otherRiver.mouth;

        for (const segment of mergedRiver.segments) {
          const dist = Math.sqrt(
            Math.pow(segment.x - otherMouth.x, 2) +
              Math.pow(segment.y - otherMouth.y, 2)
          );

          if (dist < threshold) {
            // Merge: connect other river's segments to this one
            mergedRiver.segments = [
              ...otherRiver.segments,
              ...mergedRiver.segments,
            ];
            mergedRiver.flow += otherRiver.flow;
            mergedRiver.width = Math.min(
              10,
              mergedRiver.width + otherRiver.width * 0.5
            );
            usedRivers.add(j);
            break;
          }
        }
      }

      mergedRivers.push(mergedRiver);
      usedRivers.add(i);
    }

    return mergedRivers;
  }

  /**
   * Calculate movement cost for road through terrain
   * Higher cost for water, mountains, etc.
   */
  function getTerrainCost(
    x: number,
    y: number,
    sites: VoronoiSite[],
    waterThreshold: number,
    mountainThreshold: number
  ): number {
    const height = getHeightAt(x, y, sites);

    // Base cost
    let cost = 1;

    // Very expensive to build through water
    if (height < waterThreshold) {
      return 1000;
    }

    // Expensive through mountains
    if (height > mountainThreshold) {
      cost += 5;
    } else if (height > mountainThreshold * 0.8) {
      cost += 2;
    }

    // Slightly more expensive through beaches (unstable ground)
    if (height < waterThreshold + 0.08) {
      cost += 1;
    }

    return cost;
  }

  /**
   * Smooth a path by adding slight curves and natural variations
   */
  function smoothPath(
    path: Array<{ x: number; y: number }>,
    smoothingFactor: number = 0.3
  ): Array<{ x: number; y: number }> {
    if (path.length < 3) return path;

    const smoothed: Array<{ x: number; y: number }> = [path[0]!]; // Keep first point

    for (let i = 1; i < path.length - 1; i++) {
      const prev = path[i - 1];
      const curr = path[i];
      const next = path[i + 1];

      if (!prev || !curr || !next) continue;

      // Calculate midpoints
      const mid1X = (prev.x + curr.x) / 2;
      const mid1Y = (prev.y + curr.y) / 2;
      const mid2X = (curr.x + next.x) / 2;
      const mid2Y = (curr.y + next.y) / 2;

      // Add slight perpendicular offset for natural curves
      const dx = next.x - prev.x;
      const dy = next.y - prev.y;
      const perpX = -dy;
      const perpY = dx;
      const perpLen = Math.sqrt(perpX * perpX + perpY * perpY);

      // Small random offset along perpendicular direction
      const offsetAmount = (Math.random() - 0.5) * smoothingFactor * 10;
      const offsetX = perpLen > 0 ? (perpX / perpLen) * offsetAmount : 0;
      const offsetY = perpLen > 0 ? (perpY / perpLen) * offsetAmount : 0;

      // Add intermediate points with slight curve
      smoothed.push({
        x: mid1X + offsetX * 0.5,
        y: mid1Y + offsetY * 0.5,
      });
      smoothed.push({
        x: curr.x + offsetX,
        y: curr.y + offsetY,
      });
      smoothed.push({
        x: mid2X + offsetX * 0.5,
        y: mid2Y + offsetY * 0.5,
      });
    }

    smoothed.push(path[path.length - 1]!); // Keep last point

    return smoothed;
  }

  /**
   * Simple pathfinding using A* - finds path avoiding water and expensive terrain
   * Returns a smoothed, natural-looking path
   */
  function findRoadPath(
    start: { x: number; y: number },
    end: { x: number; y: number },
    sites: VoronoiSite[],
    waterThreshold: number,
    mountainThreshold: number,
    stepSize: number
  ): Array<{ x: number; y: number }> {
    const path: Array<{ x: number; y: number }> = [];
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.max(5, Math.ceil(distance / stepSize));

    // Use simple pathfinding with terrain avoidance
    let currentX = start.x;
    let currentY = start.y;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const targetX = start.x + dx * t;
      const targetY = start.y + dy * t;

      // Try to move towards target, but avoid expensive terrain
      const dirX = targetX - currentX;
      const dirY = targetY - currentY;
      const dirLen = Math.sqrt(dirX * dirX + dirY * dirY);

      if (dirLen < stepSize) {
        path.push({ x: currentX, y: currentY });
        continue;
      }

      // Move in steps, checking terrain cost
      const stepX = (dirX / dirLen) * stepSize;
      const stepY = (dirY / dirLen) * stepSize;

      // Add slight random variation for natural look (even on good terrain)
      const randomOffset = (Math.random() - 0.5) * 2; // Small offset
      const perpX = -stepY;
      const perpY = stepX;
      const perpLen = Math.sqrt(perpX * perpX + perpY * perpY);
      const offsetX = perpLen > 0 ? (perpX / perpLen) * randomOffset : 0;
      const offsetY = perpLen > 0 ? (perpY / perpLen) * randomOffset : 0;

      // Try direct step first with slight natural variation
      const nextX = currentX + stepX + offsetX * 0.5;
      const nextY = currentY + stepY + offsetY * 0.5;
      const cost = getTerrainCost(nextX, nextY, sites, waterThreshold, mountainThreshold);

      if (cost < 100) {
        // Acceptable terrain - use with natural variation
        currentX = nextX;
        currentY = nextY;
        path.push({ x: currentX, y: currentY });
      } else {
        // Try to go around - move perpendicular to avoid bad terrain
        const perpX2 = -stepY;
        const perpY2 = stepX;

        // Try both perpendicular directions
        let found = false;
        for (const sign of [-1, 1]) {
          const altX = currentX + stepX * 0.5 + perpX2 * sign * 0.5;
          const altY = currentY + stepY * 0.5 + perpY2 * sign * 0.5;
          const altCost = getTerrainCost(altX, altY, sites, waterThreshold, mountainThreshold);

          if (altCost < 100) {
            currentX = altX;
            currentY = altY;
            path.push({ x: currentX, y: currentY });
            found = true;
            break;
          }
        }

        if (!found) {
          // Can't avoid, take the step anyway
          currentX = nextX;
          currentY = nextY;
          path.push({ x: currentX, y: currentY });
        }
      }
    }

    // Ensure we reach the end
    path.push({ x: end.x, y: end.y });

    // Smooth the path for more natural appearance
    return smoothPath(path, 0.2);
  }

  /**
   * Generate roads between settlements using Minimum Spanning Tree
   * Roads avoid water and prefer flat terrain
   */
  function generateRoads(
    settings: MapSettings,
    width: number,
    height: number
  ): Road[] {
    if (!settings.enableRoads || settlements.value.length < 2) {
      return [];
    }

    const sites = voronoiSites.value;
    if (sites.length === 0) {
      return [];
    }

    const waterThreshold = (settings.waterLevel / 100) * 0.3 - 0.15;
    const mountainThreshold = 1 - (settings.mountainLevel / 100) * 0.4;
    const stepSize = Math.min(width, height) / 200;

    const roads: Road[] = [];
    const settlementsList = settlements.value;

    // Create edges between all settlements with cost (distance + terrain penalty)
    interface Edge {
      from: number;
      to: number;
      cost: number;
      distance: number;
    }

    const edges: Edge[] = [];

    for (let i = 0; i < settlementsList.length; i++) {
      for (let j = i + 1; j < settlementsList.length; j++) {
        const s1 = settlementsList[i];
        const s2 = settlementsList[j];
        if (!s1 || !s2) continue;

        const distance = Math.sqrt(
          Math.pow(s1.x - s2.x, 2) + Math.pow(s1.y - s2.y, 2)
        );

        // Calculate terrain cost along the path (sample a few points)
        let terrainCost = 0;
        const samples = 10;
        for (let k = 0; k <= samples; k++) {
          const t = k / samples;
          const x = s1.x + (s2.x - s1.x) * t;
          const y = s1.y + (s2.y - s1.y) * t;
          terrainCost += getTerrainCost(x, y, sites, waterThreshold, mountainThreshold);
        }
        terrainCost /= (samples + 1);

        // Prefer connections between cities
        let typeBonus = 1;
        if (s1.type === 'city' && s2.type === 'city') {
          typeBonus = 0.8; // Cheaper to connect cities
        }

        const cost = distance * terrainCost * typeBonus;

        edges.push({
          from: i,
          to: j,
          cost,
          distance,
        });
      }
    }

    // Sort edges by cost
    edges.sort((a, b) => a.cost - b.cost);

    // Kruskal's algorithm for MST
    const parent: number[] = [];
    const rank: number[] = [];

    for (let i = 0; i < settlementsList.length; i++) {
      parent[i] = i;
      rank[i] = 0;
    }

    function find(x: number): number {
      if (parent[x] !== x) {
        parent[x] = find(parent[x]);
      }
      return parent[x];
    }

    function union(x: number, y: number): boolean {
      const px = find(x);
      const py = find(y);

      if (px === py) return false;

      if (rank[px] < rank[py]) {
        parent[px] = py;
      } else if (rank[px] > rank[py]) {
        parent[py] = px;
      } else {
        parent[py] = px;
        rank[px]++;
      }

      return true;
    }

    // Build MST
    const mstEdges: Edge[] = [];
    for (const edge of edges) {
      if (find(edge.from) !== find(edge.to)) {
        union(edge.from, edge.to);
        mstEdges.push(edge);

        if (mstEdges.length >= settlementsList.length - 1) {
          break;
        }
      }
    }

    // For 'full' mode, add some additional connections (especially between cities)
    if (settings.roadType === 'full') {
      // Add connections between cities that aren't directly connected
      const cityIndices = settlementsList
        .map((s, idx) => (s.type === 'city' ? idx : -1))
        .filter(idx => idx !== -1);

      for (let i = 0; i < cityIndices.length; i++) {
        for (let j = i + 1; j < cityIndices.length; j++) {
          const fromIdx = cityIndices[i];
          const toIdx = cityIndices[j];
          if (fromIdx === undefined || toIdx === undefined) continue;

          // Check if already connected in MST
          const alreadyConnected = mstEdges.some(
            e => (e.from === fromIdx && e.to === toIdx) || (e.from === toIdx && e.to === fromIdx)
          );

          if (!alreadyConnected) {
            // Find edge connecting these cities
            const edge = edges.find(
              e => (e.from === fromIdx && e.to === toIdx) || (e.from === toIdx && e.to === fromIdx)
            );
            if (edge) {
              mstEdges.push(edge);
            }
          }
        }
      }
    }

    // Generate road paths for each edge
    for (const edge of mstEdges) {
      const from = settlementsList[edge.from];
      const to = settlementsList[edge.to];
      if (!from || !to) continue;

      const segments = findRoadPath(
        { x: from.x, y: from.y },
        { x: to.x, y: to.y },
        sites,
        waterThreshold,
        mountainThreshold,
        stepSize
      );

      if (segments.length > 1) {
        const road: Road = {
          id: `road-${edge.from}-${edge.to}`,
          segments,
          width: from.type === 'city' && to.type === 'city' ? 3 : 2,
          connects: [`${edge.from}`, `${edge.to}`],
          type: from.type === 'city' && to.type === 'city' ? 'highway' : 'local',
        };

        roads.push(road);
      }
    }

    return roads;
  }

  /**
   * Check if position matches terrain preference for POI
   */
  function matchesTerrainPreference(
    x: number,
    y: number,
    preference: string,
    height: number,
    waterThreshold: number,
    mountainThreshold: number,
    sites: VoronoiSite[],
    roads: Road[],
    settlements: Settlement[]
  ): boolean {
    const site = findNearestSite(x, y, sites);
    if (!site?.data) return false;

    const h = site.data.height;

    switch (preference) {
      case 'mountain':
        return h > mountainThreshold * 0.7 && h > waterThreshold + 0.1;
      case 'forest':
        // Check if forest (green color) - more lenient
        const isForest = (
          h > waterThreshold + 0.05 &&
          h < mountainThreshold &&
          site.data.color.r === 39 &&
          site.data.color.g === 174
        );
        // Also accept if it's a plain area (more lenient)
        return isForest || (h > waterThreshold + 0.05 && h < mountainThreshold * 0.8);
      case 'water':
        return h < waterThreshold + 0.05;
      case 'plain':
        return (
          h > waterThreshold + 0.05 &&
          h < mountainThreshold * 0.7 &&
          !(site.data.color.r === 39 && site.data.color.g === 174)
        );
      case 'road':
        // Near roads
        if (roads.length === 0) return false; // No roads available
        const roadDistances = roads.map((road) => {
          let minDist = Infinity;
          for (const segment of road.segments) {
            const dist = Math.sqrt(
              Math.pow(x - segment.x, 2) + Math.pow(y - segment.y, 2)
            );
            minDist = Math.min(minDist, dist);
          }
          return minDist;
        });
        const minRoadDistance = roadDistances.length > 0 ? Math.min(...roadDistances) : Infinity;
        return minRoadDistance < 50;
      case 'any':
        return h > waterThreshold + 0.03;
      default:
        return true;
    }
  }

  /**
   * Generate Points of Interest on the map
   */
  function generatePOI(
    settings: MapSettings,
    width: number,
    height: number
  ): PointOfInterest[] {
    if (!settings.enablePOI || settings.poiCount === 0) {
      return [];
    }

    const sites = voronoiSites.value;
    if (sites.length === 0) {
      return [];
    }

    const waterThreshold = (settings.waterLevel / 100) * 0.3 - 0.15;
    const mountainThreshold = 1 - (settings.mountainLevel / 100) * 0.4;
    const generatedPOI: PointOfInterest[] = [];
    // Reduced minimum distances to make placement easier
    const minDistanceFromSettlement = Math.min(width, height) * 0.03; // Reduced from 0.05
    const minDistanceBetweenPOI = Math.min(width, height) * 0.02; // Reduced from 0.03

    // Shuffle POI types for variety
    const availableTypes = [...POI_TYPES];
    for (let i = availableTypes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availableTypes[i], availableTypes[j]] = [availableTypes[j], availableTypes[i]];
    }

    let poiGenerated = 0;
    let attempts = 0;
    const maxAttempts = settings.poiCount * 150; // Reasonable limit
    let consecutiveFailures = 0;
    const maxConsecutiveFailures = 30; // Reduced to skip problematic types faster
    const typesTried = new Set<string>(); // Track which types we've tried

    // Get roads and rivers once
    const currentRoads = roads.value.length > 0 ? roads.value : [];
    const currentRivers = rivers.value.length > 0 ? rivers.value : [];

    while (poiGenerated < settings.poiCount && attempts < maxAttempts) {
      attempts++;

      // If too many consecutive failures, try next type
      if (consecutiveFailures > maxConsecutiveFailures) {
        // Skip problematic types
        poiGenerated++;
        consecutiveFailures = 0;
        typesTried.clear(); // Reset for next round
        continue;
      }

      // Cycle through POI types, avoiding types we've already tried
      const typeIndex = poiGenerated % availableTypes.length;
      const poiType = availableTypes[typeIndex];
      if (!poiType) {
        poiGenerated++;
        continue;
      }

      // Skip types that require roads/rivers if not available
      if (poiType.type === 'bridge' && currentRivers.length === 0) {
        poiGenerated++;
        continue;
      }
      if (poiType.type === 'destroyed_caravan' && currentRoads.length === 0) {
        poiGenerated++;
        continue;
      }

      // Special handling for destroyed_caravan - must be ON a road
      if (poiType.type === 'destroyed_caravan') {
        // Find a random point on a road
        if (currentRoads.length > 0) {
          const randomRoad = currentRoads[Math.floor(Math.random() * currentRoads.length)];
          if (randomRoad.segments.length > 1) {
            // Pick a random segment (not first or last to avoid settlements)
            const segmentIndex = Math.floor(
              Math.random() * (randomRoad.segments.length - 2) + 1
            );
            const segment = randomRoad.segments[segmentIndex];
            if (segment) {
              // Check distance from settlements
              const tooCloseToSettlement = settlements.value.some((s) => {
                const dist = Math.sqrt(Math.pow(s.x - segment.x, 2) + Math.pow(s.y - segment.y, 2));
                return dist < minDistanceFromSettlement;
              });

              // Check distance from other POI
              const tooCloseToPOI = generatedPOI.some((p) => {
                const dist = Math.sqrt(Math.pow(p.x - segment.x, 2) + Math.pow(p.y - segment.y, 2));
                return dist < minDistanceBetweenPOI;
              });

              if (!tooCloseToSettlement && !tooCloseToPOI) {
                // Place directly on this road segment
                const poi: PointOfInterest = {
                  id: `poi-${poiGenerated}-${poiType.type}`,
                  type: poiType.type,
                  x: segment.x,
                  y: segment.y,
                  name: poiType.name,
                  description: poiType.description,
                };
                generatedPOI.push(poi);
                poiGenerated++;
                consecutiveFailures = 0;
                continue; // Skip normal placement for this POI
              }
            }
          }
        }
        consecutiveFailures++;
        continue;
      }

      // Generate random position for other POI types
      let x = Math.random() * width;
      let y = Math.random() * height;

      // Check distance from settlements
      const tooCloseToSettlement = settlements.value.some((s) => {
        const dist = Math.sqrt(Math.pow(s.x - x, 2) + Math.pow(s.y - y, 2));
        return dist < minDistanceFromSettlement;
      });

      if (tooCloseToSettlement) {
        consecutiveFailures++;
        continue;
      }

      // Check distance from other POI
      const tooCloseToPOI = generatedPOI.some((p) => {
        const dist = Math.sqrt(Math.pow(p.x - x, 2) + Math.pow(p.y - y, 2));
        return dist < minDistanceBetweenPOI;
      });

      if (tooCloseToPOI) {
        consecutiveFailures++;
        continue;
      }

      // Check terrain preference
      const heightAtPos = getHeightAt(x, y, sites);
      const matches = matchesTerrainPreference(
        x,
        y,
        poiType.terrainPreference,
        heightAtPos,
        waterThreshold,
        mountainThreshold,
        sites,
        currentRoads,
        settlements.value
      );

      if (!matches) {
        consecutiveFailures++;
        continue;
      }

      // Special checks for specific POI types (with relaxed conditions)
      if (poiType.type === 'bridge') {
        // Bridges should be near rivers (increased range)
        const nearRiver = currentRivers.some((river) => {
          for (const segment of river.segments) {
            const dist = Math.sqrt(
              Math.pow(x - segment.x, 2) + Math.pow(y - segment.y, 2)
            );
            if (dist < 50) return true; // Increased from 30
          }
          return false;
        });
        if (!nearRiver) {
          consecutiveFailures++;
          continue;
        }
      }

      // Success - reset failure counter
      consecutiveFailures = 0;

      // Create POI
      const poi: PointOfInterest = {
        id: `poi-${poiGenerated}-${poiType.type}`,
        type: poiType.type,
        x,
        y,
        name: poiType.name,
        description: poiType.description,
      };

      generatedPOI.push(poi);
      poiGenerated++;
      consecutiveFailures = 0; // Reset on success
    }

    // Return generated POI (may be fewer than requested if conditions too strict)
    return generatedPOI;
  }

  return {
    generateMap,
    isGenerating,
    voronoiCells,
    settlements,
    rivers,
    roads,
    poi,
  };
}

