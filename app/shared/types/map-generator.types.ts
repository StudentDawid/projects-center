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
}

export interface Settlement {
  x: number;
  y: number;
  type: 'city' | 'village';
  name: string;
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

