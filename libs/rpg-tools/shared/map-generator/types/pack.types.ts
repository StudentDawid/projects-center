/**
 * Types for Pack structure (detailed Voronoi grid)
 */

import type { Point } from './voronoi.types';
import type { Feature } from './features.types';
import type { VoronoiDiagram } from './voronoi.types';
import type { Grid } from './grid.types';

/**
 * Pack structure - detailed version of Grid with more points for rendering
 */
export interface Pack {
  /** Pack cells data */
  cells: {
    /** Cell vertices */
    v: number[][];
    /** Cell neighbors */
    c: number[][];
    /** Border flags */
    b: number[];
    /** Cell indices */
    i: number[];
    /** Cell points (coordinates) */
    p: Point[];
    /** Map from pack cell to grid cell */
    g: Uint16Array | Uint32Array;
    /** Cell heights */
    h: Uint8Array;
    /** Cell areas */
    area: Uint16Array | Uint32Array;
    /** Distance field (CellType enum values) */
    t?: Int8Array;
    /** Feature IDs */
    f?: Uint16Array;
    /** Haven cells (closest water cell for land cells) */
    haven?: Uint16Array | Uint32Array;
    /** Harbor cells (number of adjacent water cells) */
    harbor?: Uint8Array;
    /** Biome IDs */
    biome?: Uint8Array;
    /** River IDs */
    r?: Uint16Array;
    /** Flow direction */
    fl?: Uint16Array;
    /** Confluences (river junctions) */
    conf?: Uint8Array | Uint16Array;
  };
  /** Pack vertices */
  vertices: VoronoiDiagram['vertices'];
  /** Pack features */
  features?: Feature[];
  /** Quadtree for spatial queries (optional, for d3.quadtree) */
  q?: any;
  /** Rivers array */
  rivers?: River[];
}

/**
 * Extended Pack with grid reference
 */
export interface PackWithGrid extends Pack {
  /** Reference to original grid */
  grid: Grid;
}

/**
 * River structure
 */
export interface River {
  /** River ID */
  i: number;
  /** Source cell */
  source: number;
  /** Mouth cell (where river flows to water) */
  mouth: number;
  /** Length */
  length: number;
  /** Cells through which river flows */
  cells: number[];
  /** Width (for rendering) */
  width?: number;
  /** Discharge/flow rate */
  discharge?: number;
  /** Name */
  name?: string;
  /** Meandered points (internal, for rendering) */
  meanderedPoints?: Array<[number, number, number]>;
  /** Width factor (internal, for rendering) */
  widthFactor?: number;
  /** Source width (internal, for rendering) */
  sourceWidth?: number;
  /** Parent river ID (for tributaries) */
  parent?: number;
}

/**
 * Ruler/scale structure
 */
export interface Ruler {
  /** Scale in pixels per unit */
  scale: number;
  /** Unit type: 'km' | 'miles' */
  unit: 'km' | 'miles';
  /** Length in units */
  length: number;
  /** Length in pixels */
  pixels: number;
}

