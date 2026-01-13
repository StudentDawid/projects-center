/**
 * Types for feature detection and markup
 */

/**
 * Cell type/distance field values
 */
export enum CellType {
  /** Deeper land (inland, away from coast) */
  DEEPER_LAND = 3,
  /** Landlocked (inland but marked) */
  LANDLOCKED = 2,
  /** Land at coast */
  LAND_COAST = 1,
  /** Unmarked */
  UNMARKED = 0,
  /** Water at coast */
  WATER_COAST = -1,
  /** Deep water */
  DEEP_WATER = -2,
}

/**
 * Feature type
 */
export type FeatureType = 'ocean' | 'lake' | 'island';

/**
 * Feature group types
 */
export type OceanGroup = 'ocean' | 'sea' | 'gulf';
export type IslandGroup = 'continent' | 'island' | 'isle' | 'lake_island';
export type LakeGroup = 'freshwater' | 'salt' | 'frozen' | 'dry' | 'sinkhole' | 'lava';
export type FeatureGroup = OceanGroup | IslandGroup | LakeGroup;

/**
 * Feature structure
 */
export interface Feature {
  /** Feature ID (index in features array) */
  i: number;
  /** Is this a land feature */
  land: boolean;
  /** Does this feature touch map border */
  border: boolean;
  /** Feature type */
  type: FeatureType;
  /** Feature group (classification) */
  group?: FeatureGroup;
  /** Number of cells in feature */
  cells?: number;
  /** First cell index */
  firstCell?: number;
  /** Feature height (for lakes) */
  height?: number;
  /** Feature temperature (for lakes) */
  temp?: number;
  /** Feature evaporation (for lakes) */
  evaporation?: number;
  /** Feature flux (for lakes) */
  flux?: number;
  /** Feature inlets (river IDs flowing into lake) */
  inlets?: number[];
  /** Feature outlet (river ID flowing out of lake) */
  outlet?: number;
  /** Shoreline cells (for lakes) */
  shoreline?: number[];
  /** River ID flowing into/out of feature */
  river?: number;
  /** Entering flux (for lakes) */
  enteringFlux?: number;
}

