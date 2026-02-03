/**
 * Types for heightmap generation
 */

/**
 * Heightmap generation options
 */
export interface HeightmapOptions {
  /** Template ID for heightmap generation */
  template?: string;
  /** Precreated heightmap image path (optional) */
  precreatedImage?: string;
  /** Custom random function for seeded generation */
  randomFn?: () => number;
}

/**
 * Heightmap step parameters
 */
export interface HeightmapStep {
  tool: 'Hill' | 'Pit' | 'Range' | 'Trough' | 'Strait' | 'Mask' | 'Invert' | 'Add' | 'Multiply' | 'Smooth';
  params: (string | number)[];
}

/**
 * Heightmap template
 */
export interface HeightmapTemplate {
  id: string;
  name: string;
  steps: string; // Steps as string separated by newlines
}

