/**
 * Typy dla generowania siatki
 */

import type { Point } from './voronoi.types';
import type { Feature, CellType } from './features.types';

/**
 * Wynik generowania siatki
 */
export interface GridResult {
  /** Odstęp między punktami */
  spacing: number;
  /** Pożądana liczba komórek */
  cellsDesired: number;
  /** Punkty brzegowe do przycinania komórek Voronoi */
  boundary: Point[];
  /** Główne punkty siatki */
  points: Point[];
  /** Liczba komórek w kierunku X */
  cellsX: number;
  /** Liczba komórek w kierunku Y */
  cellsY: number;
}

/**
 * Struktura siatki
 */
export interface Grid {
  /** Odstęp między punktami */
  spacing: number;
  /** Pożądana liczba komórek */
  cellsDesired: number;
  /** Punkty brzegowe */
  boundary: Point[];
  /** Główne punkty siatki */
  points: Point[];
  /** Liczba komórek w kierunku X */
  cellsX: number;
  /** Liczba komórek w kierunku Y */
  cellsY: number;
  /** Dane komórek Voronoi */
  cells: {
    v: number[][]; // wierzchołki komórki
    c: number[][]; // sąsiedzi komórki
    b: number[]; // flagi brzegowe
    i: number[]; // indeksy komórek
    h?: Uint8Array; // wysokości komórek (0-100, <20 = woda, >=20 = ląd)
    t?: Int8Array; // typ komórki/pole odległości (enum CellType)
    f?: Uint16Array; // ID cechy dla każdej komórki
    temp?: Int8Array; // temperatury komórek (-128 do 127, °C)
    prec?: Uint8Array; // opady komórek (0-255)
  };
  /** Tablica cech (oceany, jeziora, wyspy) */
  features?: Feature[];
  /** Dane wierzchołków Voronoi */
  vertices: {
    p: Array<[number, number]>; // współrzędne wierzchołka
    v: number[][]; // sąsiedzi wierzchołka
    c: number[][]; // komórki wierzchołka
  };
  /** Seed użyty do generowania */
  seed: string;
  /** Szerokość mapy */
  width: number;
  /** Wysokość mapy */
  height: number;
  /** Konfiguracja rozmiaru mapy */
  mapSizeConfig?: {
    mapSize: number;
    latitude: number;
    longitude: number;
  };
  /** Współrzędne geograficzne mapy */
  mapCoordinates?: {
    latT: number;
    latN: number;
    latS: number;
    lonT: number;
    lonW: number;
    lonE: number;
  };
}

