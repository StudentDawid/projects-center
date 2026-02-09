/**
 * Ruler/scale generator
 * Creates default scale for the map
 */

import type { Grid } from '../types/grid.types';
import type { Ruler } from '../types/pack.types';
import { rn } from './map-utils';

/**
 * Create default ruler/scale for the map
 */
export function createDefaultRuler(
  grid: Grid,
  unit: 'km' | 'miles' = 'km'
): Ruler {
  const { width, height, mapCoordinates } = grid;

  if (!mapCoordinates) {
    // Fallback, jeśli współrzędne nie są dostępne
    return {
      scale: 1,
      unit,
      length: 100,
      pixels: 100,
    };
  }

  // Oblicz przybliżoną skalę na podstawie współrzędnych mapy
  // Uproszczona wersja - zakłada promień Ziemi ~6371 km
  const EARTH_RADIUS_KM = 6371;
  const EARTH_CIRCUMFERENCE_KM = 2 * Math.PI * EARTH_RADIUS_KM;

  // Oblicz wymiary mapy w kilometrach
  const latT = mapCoordinates.latT; // Całkowity zakres szerokości geograficznej
  const lonT = mapCoordinates.lonT; // Całkowity zakres długości geograficznej

  // Średnia szerokość geograficzna do obliczenia długości geograficznej
  const avgLat = (mapCoordinates.latN + mapCoordinates.latS) / 2;
  const latRad = (avgLat * Math.PI) / 180;

  // Obliczenia odległości
  const latDistanceKm = (latT / 360) * EARTH_CIRCUMFERENCE_KM;
  const lonDistanceKm =
    (lonT / 360) * EARTH_CIRCUMFERENCE_KM * Math.cos(latRad);

  // Użyj większego wymiaru do obliczenia skali
  const maxDistanceKm = Math.max(latDistanceKm, lonDistanceKm);
  const mapSize = Math.max(width, height);

  // Utwórz ładną, zaokrągloną wartość skali
  const niceLengthKm = getNiceScaleValue(maxDistanceKm / 5); // Pasek skali ~20% szerokości mapy
  const pixelsPerKm = mapSize / maxDistanceKm;
  const scaleBarPixels = niceLengthKm * pixelsPerKm;

  return {
    scale: pixelsPerKm,
    unit: unit === 'miles' ? 'miles' : 'km',
    length: unit === 'miles' ? rn(niceLengthKm * 0.621371, 1) : niceLengthKm,
    pixels: rn(scaleBarPixels, 1),
  };
}

/**
 * Pobiera ładną, zaokrągloną liczbę do wyświetlenia skali (10, 50, 100, 500, itd.)
 */
function getNiceScaleValue(value: number): number {
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const normalized = value / magnitude;

  let nice: number;
  if (normalized <= 1) nice = 1;
  else if (normalized <= 2) nice = 2;
  else if (normalized <= 5) nice = 5;
  else nice = 10;

  return nice * magnitude;
}

