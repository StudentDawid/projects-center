/**
 * Generator klimatu
 * Oblicza temperatury i opady dla komórek mapy
 */

import type { Grid } from '../types/grid.types';
import type { MapCoordinates } from './map-coordinates';
import { rn, minmax } from './map-utils';

/**
 * Opcje obliczania temperatury
 */
export interface TemperatureOptions {
  /** Temperatura na równiku (°C) */
  temperatureEquator?: number;
  /** Temperatura na biegunie północnym (°C) */
  temperatureNorthPole?: number;
  /** Temperatura na biegunie południowym (°C) */
  temperatureSouthPole?: number;
  /** Wykładnik wysokości do obliczania temperatury na podstawie wysokości */
  heightExponent?: number;
}

/**
 * Opcje obliczania opadów
 */
export interface PrecipitationOptions {
  /** Modyfikator opadów (0-100, domyślnie: 100) */
  precipitationModifier?: number;
  /** Kierunki wiatrów dla 6 poziomów szerokości geograficznej (stopnie) */
  winds?: [number, number, number, number, number, number];
}

/**
 * Oblicza temperatury dla wszystkich komórek
 * Oparte na szerokości geograficznej i wysokości
 */
export function calculateTemperatures(
  grid: Grid,
  mapCoordinates: MapCoordinates,
  options: TemperatureOptions = {}
): void {
  const {
    temperatureEquator = 27,
    temperatureNorthPole = -30,
    temperatureSouthPole = -15,
    heightExponent = 1.5,
  } = options;

  const { cells, cellsX, cellsY, width, height } = grid;
  if (!cells.h) {
    throw new Error('Grid musi mieć wysokości przed obliczeniem temperatur');
  }

  cells.temp = new Int8Array(cells.i.length);

  const tropics = [16, -20]; // Granice strefy tropikalnej
  const tropicalGradient = 0.15; // Gradient temperatury w tropikach

  // Oblicz gradienty temperatury
  const tempNorthTropic =
    temperatureEquator - tropics[0]! * tropicalGradient;
  const northernGradient =
    (tempNorthTropic - temperatureNorthPole) / (90 - tropics[0]!);

  const tempSouthTropic =
    temperatureEquator + tropics[1]! * tropicalGradient;
  const southernGradient =
    (tempSouthTropic - temperatureSouthPole) / (90 + Math.abs(tropics[1]!));

  // Przetwarzaj każdy rząd
  for (let rowCellId = 0; rowCellId < cells.i.length; rowCellId += cellsX) {
    const point = grid.points[rowCellId];
    if (!point) {
      continue;
    }
    const [, y] = point;
    const rowLatitude =
      mapCoordinates.latN - (y / height) * mapCoordinates.latT; // [90; -90]

    const tempSeaLevel = calculateSeaLevelTemp(
      rowLatitude,
      temperatureEquator,
      tempNorthTropic,
      tempSouthTropic,
      northernGradient,
      southernGradient,
      tropicalGradient,
      tropics
    );

    // Przetwarzaj każdą komórkę w rzędzie
    for (
      let cellId = rowCellId;
      cellId < rowCellId + cellsX && cellId < cells.i.length;
      cellId++
    ) {
      const tempAltitudeDrop = getAltitudeTemperatureDrop(
        cells.h[cellId]!,
        heightExponent
      );
      cells.temp[cellId] = minmax(
        tempSeaLevel - tempAltitudeDrop,
        -128,
        127
      );
    }
  }

  function calculateSeaLevelTemp(
    latitude: number,
    tempEquator: number,
    tempNorthTropic: number,
    tempSouthTropic: number,
    northernGrad: number,
    southernGrad: number,
    tropicalGrad: number,
    tropicsBounds: [number, number]
  ): number {
    const isTropical = latitude <= tropicsBounds[0]! && latitude >= tropicsBounds[1]!;
    if (isTropical) {
      return tempEquator - Math.abs(latitude) * tropicalGrad;
    }

    return latitude > 0
      ? tempNorthTropic - (latitude - tropicsBounds[0]!) * northernGrad
      : tempSouthTropic + (latitude - tropicsBounds[1]!) * southernGrad;
  }

  // Temperatura spada o 6.5°C na każdy 1km wysokości
  function getAltitudeTemperatureDrop(h: number, exponent: number): number {
    if (h < 20) return 0; // Woda - brak wpływu wysokości
    const height = Math.pow(h - 18, exponent);
    return rn((height / 1000) * 6.5, 1);
  }
}

/**
 * Generuje opady dla wszystkich komórek
 * Symuluje przepływ wiatrów i wzorce opadów
 */
export function generatePrecipitation(
  grid: Grid,
  mapCoordinates: MapCoordinates,
  options: PrecipitationOptions = {}
): void {
  const {
    precipitationModifier = 100,
    winds = [225, 45, 225, 315, 135, 315], // Domyślne kierunki wiatrów
  } = options;

  const { cells, cellsX, cellsY } = grid;
  if (!cells.h || !cells.temp) {
    throw new Error(
      'Grid must have heights and temperatures before generating precipitation'
    );
  }

  cells.prec = new Uint8Array(cells.i.length);

  // Modyfikatory opadów
  const cellsNumberModifier = Math.pow(grid.cellsDesired / 10000, 0.25);
  const precInputModifier = precipitationModifier / 100;
  const modifier = cellsNumberModifier * precInputModifier;

  // Modyfikator opadów na pas szerokości geograficznej (pasy 5-stopniowe)
  const latitudeModifier = [4, 2, 2, 2, 1, 1, 2, 2, 2, 2, 3, 3, 2, 2, 1, 1, 1, 0.5];
  const MAX_PASSABLE_ELEVATION = 85;

  const westerly: Array<[number, number, number]> = [];
  const easterly: Array<[number, number, number]> = [];
  let southerly = 0;
  let northerly = 0;

  // Definiuj kierunki wiatrów na podstawie szerokości geograficznej
  for (let i = 0; i < cellsY; i++) {
    const lat = mapCoordinates.latN - (i / cellsY) * mapCoordinates.latT;
    const latBand = Math.floor((Math.abs(lat) - 1) / 5);
    const latMod = latitudeModifier[Math.min(latBand, latitudeModifier.length - 1)] || 1;
    const windTier = Math.floor(Math.abs(lat - 89) / 30); // 0-5 tiers
    const windIndex = Math.min(windTier, winds.length - 1);
    const angle = winds[windIndex]!;

    const { isWest, isEast, isNorth, isSouth } = getWindDirections(angle);

    const firstCellInRow = i * cellsX;
    const lastCellInRow = firstCellInRow + cellsX - 1;

    if (isWest) westerly.push([firstCellInRow, latMod, windTier]);
    if (isEast) easterly.push([lastCellInRow, latMod, windTier]);
    if (isNorth) northerly++;
    if (isSouth) southerly++;
  }

  // Rozprowadź wiatry poziomo (zachodnie i wschodnie)
  if (westerly.length > 0) {
    passWind(
      grid,
      westerly,
      120 * modifier,
      1,
      cellsX,
      MAX_PASSABLE_ELEVATION,
      modifier
    );
  }
  if (easterly.length > 0) {
    passWind(
      grid,
      easterly,
      120 * modifier,
      -1,
      cellsX,
      MAX_PASSABLE_ELEVATION,
      modifier
    );
  }

  // Rozprowadź wiatry pionowo (północne i południowe)
  const vertT = southerly + northerly;
  if (northerly > 0) {
    const bandN = Math.floor((Math.abs(mapCoordinates.latN) - 1) / 5);
    const latModN =
      mapCoordinates.latT > 60
        ? latitudeModifier.reduce((a, b) => a + b, 0) / latitudeModifier.length
        : latitudeModifier[Math.min(bandN, latitudeModifier.length - 1)] || 1;
    const maxPrecN = (northerly / vertT) * 60 * modifier * latModN;
    const sourceCells = Array.from({ length: cellsX }, (_, i) => i);
    passWind(
      grid,
      sourceCells,
      maxPrecN,
      cellsX,
      cellsY,
      MAX_PASSABLE_ELEVATION,
      modifier
    );
  }

  if (southerly > 0) {
    const bandS = Math.floor((Math.abs(mapCoordinates.latS) - 1) / 5);
    const latModS =
      mapCoordinates.latT > 60
        ? latitudeModifier.reduce((a, b) => a + b, 0) / latitudeModifier.length
        : latitudeModifier[Math.min(bandS, latitudeModifier.length - 1)] || 1;
    const maxPrecS = (southerly / vertT) * 60 * modifier * latModS;
    const sourceCells = Array.from(
      { length: cellsX },
      (_, i) => cells.i.length - cellsX + i
    );
    passWind(
      grid,
      sourceCells,
      maxPrecS,
      -cellsX,
      cellsY,
      MAX_PASSABLE_ELEVATION,
      modifier
    );
  }

  function getWindDirections(angle: number): {
    isWest: boolean;
    isEast: boolean;
    isNorth: boolean;
    isSouth: boolean;
  } {
    const isWest = angle > 40 && angle < 140;
    const isEast = angle > 220 && angle < 320;
    const isNorth = angle > 100 && angle < 260;
    const isSouth = angle > 280 || angle < 80;

    return { isWest, isEast, isNorth, isSouth };
  }

  function passWind(
    grid: Grid,
    source: Array<number | [number, number, number]>,
    maxPrec: number,
    next: number,
    steps: number,
    maxElevation: number,
    modifier: number
  ): void {
    const { cells } = grid;
    if (!cells.h || !cells.temp || !cells.prec) return;

    const maxPrecInit = maxPrec;

    for (let sourceItem of source) {
      let maxPrecLocal = maxPrec;
      let first: number;

      // Obsługuj format tablicy [cellId, latMod, windTier]
      if (Array.isArray(sourceItem)) {
        maxPrecLocal = Math.min(maxPrecInit * sourceItem[1]!, 255);
        first = sourceItem[0] as number;
      } else {
        first = sourceItem;
      }

      let humidity = maxPrecLocal - (cells.h[first] || 0);
      if (humidity <= 0) continue; // Za wysoko, wiatr jest suchy

      let current = first;
      for (let s = 0; s < steps; s++) {
        if (current < 0 || current >= cells.i.length) break;
        if (cells.temp[current]! < -5) continue; // Brak przepływu w wiecznej zmarzlinie

        if (cells.h[current]! < 20) {
          // Komórka wody
          if (current + next >= 0 && current + next < cells.i.length) {
            if (cells.h[current + next]! >= 20) {
              // Opady przybrzeżne
              cells.prec[current + next] = Math.min(
                (cells.prec[current + next] || 0) +
                  Math.max(humidity / (10 + Math.random() * 10), 1),
                255
              );
            } else {
              // Wiatr zyskuje więcej wilgotności przechodząc nad wodą
              humidity = Math.min(humidity + 5 * modifier, maxPrecLocal);
              cells.prec[current] = Math.min(
                (cells.prec[current] || 0) + 5 * modifier,
                255
              );
            }
          }
          current += next;
          continue;
        }

        // Komórka lądu
        const isPassable =
          current + next >= 0 &&
          current + next < cells.i.length &&
          cells.h[current + next]! <= maxElevation;
        const precipitation = isPassable
          ? getPrecipitation(
              humidity,
              current,
              next,
              cells.h,
              modifier
            )
          : humidity;

        cells.prec[current] = Math.min(
          (cells.prec[current] || 0) + precipitation,
          255
        );

        const evaporation = precipitation > 1.5 ? 1 : 0;
        humidity = isPassable
          ? minmax(humidity - precipitation + evaporation, 0, maxPrecLocal)
          : 0;

        current += next;
      }
    }
  }

  function getPrecipitation(
    humidity: number,
    i: number,
    n: number,
    heights: Uint8Array,
    modifier: number
  ): number {
    const normalLoss = Math.max(humidity / (10 * modifier), 1);
    const nextHeight = i + n >= 0 && i + n < heights.length ? heights[i + n]! : heights[i]!;
    const diff = Math.max(nextHeight - heights[i]!, 0);
    const mod = Math.pow(nextHeight / 70, 2); // 70 oznacza góry
    return minmax(normalLoss + diff * mod, 1, humidity);
  }
}

