/**
 * Funkcje pomocnicze do generowania kolorów dla mapy
 */

import { BiomeType } from './biomes-generator';

/**
 * Kolory biomes (standardowa paleta kolorów dla biomes)
 */
const BIOME_COLORS: Record<BiomeType, string> = {
  [BiomeType.Marine]: '#466eab', // Ocean blue
  [BiomeType.HotDesert]: '#fbe79f', // Desert yellow
  [BiomeType.ColdDesert]: '#b5b887', // Cold desert gray-green
  [BiomeType.Savanna]: '#d2d082', // Savanna yellow-green
  [BiomeType.Grassland]: '#c8d68f', // Grassland green
  [BiomeType.TropicalSeasonalForest]: '#b6d95d', // Tropical forest light green
  [BiomeType.TemperateDeciduousForest]: '#29bc56', // Deciduous forest green
  [BiomeType.TropicalRainforest]: '#7dcb35', // Rainforest bright green
  [BiomeType.TemperateRainforest]: '#409c43', // Temperate rainforest dark green
  [BiomeType.Taiga]: '#4b6b32', // Taiga dark green
  [BiomeType.Tundra]: '#96784b', // Tundra brown
  [BiomeType.Glacier]: '#d5e7eb', // Glacier light blue-white
  [BiomeType.Wetland]: '#0b9131', // Wetland dark green
};

/**
 * Pobiera kolor z bioma
 */
export function getColorFromBiome(biomeId: BiomeType | number | null | undefined): string {
  if (biomeId === null || biomeId === undefined) {
    return '#ccc';
  }

  const color = BIOME_COLORS[biomeId as BiomeType];
  if (!color) {
    // Nieznany biome ID - użyj szarego jako fallback
    return '#ccc';
  }

  return color;
}

/**
 * Konwertuje hex na RGB
 */
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1]!, 16),
        parseInt(result[2]!, 16),
        parseInt(result[3]!, 16),
      ]
    : [0, 0, 0];
}

/**
 * Interpoluje kolor RGB między dwoma kolorami
 */
function interpolateColor(
  color1: [number, number, number],
  color2: [number, number, number],
  t: number
): [number, number, number] {
  t = Math.max(0, Math.min(1, t));
  return [
    Math.round(color1[0] + (color2[0] - color1[0]) * t),
    Math.round(color1[1] + (color2[1] - color1[1]) * t),
    Math.round(color1[2] + (color2[2] - color1[2]) * t),
  ];
}

/**
 * Interpoluje kolor między wieloma kolorami (punkty zatrzymania)
 */
function interpolateColors(
  stops: Array<[number, number, number]>,
  t: number
): [number, number, number] {
  t = Math.max(0, Math.min(1, t));
  if (stops.length === 0) return [128, 128, 128];
  if (stops.length === 1) return stops[0]!;

  const segmentSize = 1 / (stops.length - 1);
  const segmentIndex = Math.min(Math.floor(t / segmentSize), stops.length - 2);
  const localT = (t - segmentIndex * segmentSize) / segmentSize;

  return interpolateColor(stops[segmentIndex]!, stops[segmentIndex + 1]!, localT);
}

/**
 * Pobiera kolor na podstawie wartości wysokości (0-100)
 * Używa interpolacji kolorów podobnej do Azgaar
 */
export function getColorFromHeightValue(height: number): string {
  // Woda/Ocean: < 20
  // W trybie heightmap woda ma jednolity kolor (jak w Azgaar, gdzie renderOceanCells domyślnie jest wyłączone)
  if (height < 20) {
    // Jednolity kolor dla wszystkich wartości wody
    return '#466eab';
  }

  // Ląd: >= 20
  // Używamy wzoru z Azgaar: scheme(1 - value / 100)
  // Dla value=20: 1 - 20/100 = 0.8 (niski ląd)
  // Dla value=100: 1 - 100/100 = 0.0 (wysoki szczyt)
  const t = 1 - height / 100;

  // Poprawiona paleta kolorów - bardziej kontrastowa i widoczna
  // Od wysokich (t=0, biały) do niskich (t=1, ciemny zielony)
  const landStops: Array<[number, number, number]> = [
    hexToRgb('#ffffff'), // Wysokie szczyty (t=0.0-0.2) - biały
    hexToRgb('#f5f5dc'), // Wysokie góry (t=0.2-0.4) - beżowy (beige)
    hexToRgb('#deb887'), // Średnie góry (t=0.4-0.5) - brązowy (burlywood)
    hexToRgb('#8b7355'), // Niskie góry (t=0.5-0.6) - ciemny brązowy
    hexToRgb('#6b8e23'), // Wzgórza (t=0.6-0.75) - oliwkowy zielony
    hexToRgb('#2d5016'), // Niziny (t=0.75-1.0) - ciemny zielony
  ];

  const [r, g, b] = interpolateColors(landStops, Math.max(0, Math.min(1, t)));
  return `rgb(${r}, ${g}, ${b})`;
}

