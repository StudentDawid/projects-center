/**
 * Perlin Noise Generator
 * Implementation based on Perlin's improved noise algorithm
 */

let permutation: number[] = [];

/**
 * Initialize noise generator with a seed
 */
export function initNoise(seed: string): void {
  // Simple seed-based random number generator
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }

  // Initialize permutation table
  permutation = [];
  const p: number[] = [];
  for (let i = 0; i < 256; i++) p[i] = i;

  // Shuffle based on seed
  for (let i = 255; i > 0; i--) {
    hash = (hash * 1103515245 + 12345) | 0;
    const j = Math.abs(hash) % (i + 1);
    const temp = p[i] ?? 0;
    p[i] = p[j] ?? 0;
    p[j] = temp;
  }

  for (let i = 0; i < 512; i++) {
    permutation[i] = p[i & 255] ?? 0;
  }
}

/**
 * Smooth interpolation function (5th-degree polynomial)
 */
function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/**
 * Linear interpolation
 */
function lerp(a: number, b: number, t: number): number {
  return a + t * (b - a);
}

/**
 * Calculate gradient value
 */
function grad(hash: number, x: number, y: number): number {
  const h = hash & 3;
  const u = h < 2 ? x : y;
  const v = h < 2 ? y : x;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

/**
 * 2D Perlin noise function
 * Returns value in range approximately [-1, 1]
 */
export function noise2D(x: number, y: number): number {
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  x -= Math.floor(x);
  y -= Math.floor(y);

  const u = fade(x);
  const v = fade(y);

  const A = (permutation[X] ?? 0) + Y;
  const B = (permutation[X + 1] ?? 0) + Y;

  return lerp(
    lerp(grad(permutation[A] ?? 0, x, y), grad(permutation[B] ?? 0, x - 1, y), u),
    lerp(grad(permutation[A + 1] ?? 0, x, y - 1), grad(permutation[B + 1] ?? 0, x - 1, y - 1), u),
    v
  );
}

/**
 * Fractional Brownian Motion (FBM)
 * Combines multiple octaves of noise for more natural terrain
 */
export function fbm(x: number, y: number, octaves: number = 6): number {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    value += amplitude * noise2D(x * frequency, y * frequency);
    maxValue += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }

  return value / maxValue;
}

