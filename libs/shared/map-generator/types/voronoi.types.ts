/**
 * Typy dla generowania diagramu Voronoi
 */

/**
 * Współrzędne punktu [x, y]
 */
export type Point = [number, number];

/**
 * Struktura danych komórki Voronoi
 */
export interface VoronoiCell {
  /** Tablica indeksów wierzchołków tworzących tę komórkę */
  v: number[];
  /** Tablica indeksów sąsiednich komórek */
  c: number[];
  /** Flaga brzegowa: 1 jeśli komórka jest blisko brzegu, 0 w przeciwnym razie */
  b: number;
}

/**
 * Struktura danych wierzchołka Voronoi
 */
export interface VoronoiVertex {
  /** Współrzędne wierzchołka [x, y] */
  p: [number, number];
  /** Tablica indeksów sąsiednich wierzchołków */
  v: number[];
  /** Tablica indeksów sąsiednich komórek */
  c: number[];
}

/**
 * Wynik diagramu Voronoi
 */
export interface VoronoiDiagram {
  /** Dane komórek: wierzchołki, sąsiedzi, flagi brzegowe */
  cells: {
    v: number[][]; // cells.v[i] = tablica indeksów wierzchołków dla komórki i
    c: number[][]; // cells.c[i] = tablica indeksów sąsiednich komórek dla komórki i
    b: number[]; // cells.b[i] = flaga brzegowa dla komórki i
    i: number[]; // cells.i = tablica indeksów komórek [0, 1, 2, ...]
  };
  /** Dane wierzchołków: współrzędne, sąsiedzi */
  vertices: {
    p: Array<[number, number]>; // vertices.p[i] = współrzędne wierzchołka i
    v: number[][]; // vertices.v[i] = tablica indeksów sąsiednich wierzchołków
    c: number[][]; // vertices.c[i] = tablica indeksów sąsiednich komórek
  };
}

