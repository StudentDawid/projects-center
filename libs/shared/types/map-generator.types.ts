export interface MapSettings {
  size: number;
  seed: string;
  waterLevel: number;
  mountainLevel: number;
  forestLevel: number;
  cityCount: number;
  villageCount: number;
  useVoronoi: boolean;
  voronoiCellCount: number;
  enableRivers: boolean;
  riverCount: number;
  riverWidth: number;
  showCellBorders: boolean;
  enableRoads: boolean;
  roadType: 'minimal' | 'full'; // minimal = MST, full = additional connections
  enablePOI: boolean;
  poiCount: number;
}

export interface Settlement {
  x: number;
  y: number;
  type: 'city' | 'village';
  name: string;
}

export interface River {
  id: string;
  segments: Array<{ x: number; y: number }>;
  width: number;
  source: { x: number; y: number };
  mouth: { x: number; y: number };
  flow: number; // Accumulated flow from tributaries
}

export interface Road {
  id: string;
  segments: Array<{ x: number; y: number }>;
  width: number;
  connects: string[]; // Settlement IDs or indices
  type: 'highway' | 'local';
}

export type POIType =
  | 'ruin'
  | 'cave'
  | 'tower'
  | 'altar'
  | 'mine'
  | 'bridge'
  | 'hermitage'
  | 'oasis'
  | 'battlefield'
  | 'portal'
  | 'bandit_camp'
  | 'rock_formation'
  | 'sunken_ruin'
  | 'destroyed_village'
  | 'destroyed_caravan'
  | 'monster_lair';

export interface PointOfInterest {
  id: string;
  type: POIType;
  x: number;
  y: number;
  name: string;
  description?: string;
}

export interface TerrainType {
  name: string;
  color: string;
  emoji?: string;
}

export const TERRAIN_TYPES: TerrainType[] = [
  { name: 'Głęboka woda', color: '#1a5f7a' },
  { name: 'Płytka woda', color: '#3498db' },
  { name: 'Plaża', color: '#f4d03f' },
  { name: 'Równina', color: '#58d68d' },
  { name: 'Las', color: '#27ae60' },
  { name: 'Góry', color: '#7f8c8d' },
  { name: 'Szczyt', color: '#ecf0f1' },
  { name: 'Rzeka', color: '#2980b9' },
  { name: 'Droga', color: '#8b4513' },
];

export const POI_TYPES: Array<{
  type: POIType;
  name: string;
  emoji: string;
  description: string;
  terrainPreference: 'mountain' | 'forest' | 'plain' | 'water' | 'road' | 'any';
  dangerLevel: 'safe' | 'neutral' | 'dangerous';
}> = [
  { type: 'ruin', name: 'Ruiny', emoji: '🏛️', description: 'Starożytne ruiny zamku lub fortecy', terrainPreference: 'mountain', dangerLevel: 'dangerous' },
  { type: 'cave', name: 'Jaskinia', emoji: '🕳️', description: 'Jaskinia lub podziemny tunel', terrainPreference: 'mountain', dangerLevel: 'dangerous' },
  { type: 'tower', name: 'Wieża', emoji: '🗼', description: 'Magiczna lub strażnicza wieża', terrainPreference: 'any', dangerLevel: 'neutral' },
  { type: 'altar', name: 'Ołtarz', emoji: '⛩️', description: 'Miejsce kultu lub sanktuarium', terrainPreference: 'any', dangerLevel: 'safe' },
  { type: 'mine', name: 'Kopalnia', emoji: '⛏️', description: 'Abandonowana kopalnia', terrainPreference: 'mountain', dangerLevel: 'neutral' },
  { type: 'bridge', name: 'Most', emoji: '🌉', description: 'Starożytny most', terrainPreference: 'road', dangerLevel: 'safe' },
  { type: 'hermitage', name: 'Pustelnia', emoji: '🏚️', description: 'Opuszczona chata pustelnika', terrainPreference: 'forest', dangerLevel: 'neutral' },
  { type: 'oasis', name: 'Oaza', emoji: '🌴', description: 'Oaza lub święte źródło', terrainPreference: 'plain', dangerLevel: 'safe' },
  { type: 'battlefield', name: 'Pole bitwy', emoji: '⚔️', description: 'Starożytne miejsce bitwy', terrainPreference: 'plain', dangerLevel: 'neutral' },
  { type: 'portal', name: 'Portal', emoji: '🌀', description: 'Magiczny portal lub brama', terrainPreference: 'any', dangerLevel: 'dangerous' },
  { type: 'bandit_camp', name: 'Obóz bandytów', emoji: '⛺', description: 'Obóz wrogich bandytów', terrainPreference: 'forest', dangerLevel: 'dangerous' },
  { type: 'rock_formation', name: 'Formacja skalna', emoji: '🗿', description: 'Dziwna formacja skalna', terrainPreference: 'plain', dangerLevel: 'neutral' },
  { type: 'sunken_ruin', name: 'Zatopione ruiny', emoji: '🏺', description: 'Ruiny zatopione w wodzie', terrainPreference: 'water', dangerLevel: 'dangerous' },
  { type: 'destroyed_village', name: 'Zniszczona wioska', emoji: '🔥', description: 'Spalona lub zniszczona wioska', terrainPreference: 'plain', dangerLevel: 'dangerous' },
  { type: 'destroyed_caravan', name: 'Zniszczona karawana', emoji: '🚛', description: 'Atakowana karawana kupiecka', terrainPreference: 'road', dangerLevel: 'dangerous' },
  { type: 'monster_lair', name: 'Siedlisko potworów', emoji: '👹', description: 'Legowisko potworów', terrainPreference: 'forest', dangerLevel: 'dangerous' },
];

export interface MapSizeOption {
  value: number;
  label: string;
}

export const MAP_SIZE_OPTIONS: MapSizeOption[] = [
  { value: 256, label: 'Mała' },
  { value: 512, label: 'Średnia' },
  { value: 768, label: 'Duża' },
  { value: 1024, label: 'Ogromna' },
];

