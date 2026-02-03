/**
 * Map coordinates and size utilities
 * Defines map size and calculates geographic coordinates
 */

import type { Grid } from '../types/grid.types';
import { rn, minmax } from './map-utils';

/**
 * Konfiguracja rozmiaru i pozycji mapy
 */
export interface MapSizeConfig {
  /** Rozmiar mapy w procentach (0-100) */
  mapSize: number;
  /** Przesunięcie szerokości geograficznej w procentach (0-100) */
  latitude: number;
  /** Przesunięcie długości geograficznej w procentach (0-100) */
  longitude: number;
}

/**
 * Współrzędne geograficzne mapy
 */
export interface MapCoordinates {
  /** Całkowity zakres szerokości geograficznej */
  latT: number;
  /** Północna szerokość geograficzna */
  latN: number;
  /** Południowa szerokość geograficzna */
  latS: number;
  /** Całkowity zakres długości geograficznej */
  lonT: number;
  /** Wschodnia długość geograficzna */
  lonE: number;
  /** Zachodnia długość geograficzna */
  lonW: number;
}

/**
 * Define map size and position based on template
 */
export function defineMapSize(
  grid: Grid,
  template: string = 'continents'
): MapSizeConfig {
  const { features } = grid;
  const hasPart = features?.some((f) => f.land && f.border) || false;
  const max = hasPart ? 80 : 100;

  const lat = (): number => {
    // Przesunięcie szerokości geograficznej: 70% szans na zakres 40-60, 30% szans na zakres 60-80
    const base = Math.random() < 0.5 ? 40 : 60;
    return minmax(base + (Math.random() * 20 - 10), 25, 75);
  };

  // Rozmiary specyficzne dla szablonu
  const templateSizes: Record<string, [number, number, number]> = {
    'africa-centric': [45, 53, 38],
    'arabia': [20, 35, 35],
    'atlantics': [42, 23, 65],
    'britain': [7, 20, 51.3],
    'caribbean': [15, 40, 74.8],
    'east-asia': [11, 28, 9.4],
    'eurasia': [38, 19, 27],
    'europe': [20, 16, 44.8],
    'europe-accented': [14, 22, 44.8],
    'europe-and-central-asia': [25, 10, 39.5],
    'europe-central': [11, 22, 46.4],
    'europe-north': [7, 18, 48.9],
    'greenland': [22, 7, 55.8],
    'hellenica': [8, 27, 43.5],
    'iceland': [2, 15, 55.3],
    'indian-ocean': [45, 55, 14],
    'mediterranean-sea': [10, 29, 45.8],
    'middle-east': [8, 31, 34.4],
    'north-america': [37, 17, 87],
    'us-centric': [66, 27, 100],
    'us-mainland': [16, 30, 77.5],
    'world': [78, 27, 40],
    'world-from-pacific': [75, 32, 30],
  };

  if (templateSizes[template]) {
    const [size, latValue, lonValue] = templateSizes[template]!;
    return {
      mapSize: size,
      latitude: latValue,
      longitude: lonValue,
    };
  }

  // Szablony ogólne
  if (!hasPart) {
    if (template === 'pangea') return { mapSize: 100, latitude: 50, longitude: 50 };
    if (template === 'shattered' && Math.random() < 0.7) return { mapSize: 100, latitude: 50, longitude: 50 };
    if (template === 'continents' && Math.random() < 0.5) return { mapSize: 100, latitude: 50, longitude: 50 };
    if (template === 'archipelago' && Math.random() < 0.35) return { mapSize: 100, latitude: 50, longitude: 50 };
    if (template === 'highIsland' && Math.random() < 0.25) return { mapSize: 100, latitude: 50, longitude: 50 };
    if (template === 'lowIsland' && Math.random() < 0.1) return { mapSize: 100, latitude: 50, longitude: 50 };
  }

  // Losowe rozmiary specyficzne dla szablonu
  if (template === 'pangea') {
    return { mapSize: minmax(70 + (Math.random() * 20 - 10), 30, max), latitude: lat(), longitude: 50 };
  }
  if (template === 'volcano') {
    return { mapSize: minmax(20 + (Math.random() * 20 - 10), 10, max), latitude: lat(), longitude: 50 };
  }
  if (template === 'mediterranean') {
    return { mapSize: minmax(25 + (Math.random() * 30 - 15), 15, 80), latitude: lat(), longitude: 50 };
  }
  if (template === 'peninsula') {
    return { mapSize: minmax(15 + (Math.random() * 15 - 7.5), 5, 80), latitude: lat(), longitude: 50 };
  }
  if (template === 'isthmus') {
    return { mapSize: minmax(15 + (Math.random() * 20 - 10), 3, 80), latitude: lat(), longitude: 50 };
  }
  if (template === 'atoll') {
    return { mapSize: minmax(3 + (Math.random() * 2 - 1), 1, 5), latitude: lat(), longitude: 50 };
  }

  // Domyślne dla Continents, Archipelago, High Island, Low Island
  return { mapSize: minmax(30 + (Math.random() * 20 - 10), 15, max), latitude: lat(), longitude: 50 };
}

/**
 * Calculate map geographic coordinates on globe
 */
export function calculateMapCoordinates(
  grid: Grid,
  mapSizeConfig: MapSizeConfig
): MapCoordinates {
  const { mapSize, latitude, longitude } = mapSizeConfig;
  const { width, height } = grid;

  const sizeFraction = mapSize / 100;
  const latShift = latitude / 100;
  const lonShift = longitude / 100;

  // Oblicz zakres szerokości geograficznej i granice
  const latT = rn(sizeFraction * 180, 1); // Całkowity zakres szerokości geograficznej
  const latN = rn(90 - (180 - latT) * latShift, 1); // Północna szerokość geograficzna
  const latS = rn(latN - latT, 1); // Południowa szerokość geograficzna

  // Oblicz zakres długości geograficznej i granice
  const lonT = rn(Math.min((width / height) * latT, 360), 1); // Całkowity zakres długości geograficznej
  const lonE = rn(180 - (360 - lonT) * lonShift, 1); // Wschodnia długość geograficzna
  const lonW = rn(lonE - lonT, 1); // Zachodnia długość geograficzna

  return {
    latT,
    latN,
    latS,
    lonT,
    lonW,
    lonE,
  };
}

