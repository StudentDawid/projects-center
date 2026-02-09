/**
 * Generator diagramu Voronoi
 * Konwertuje triangulację Delaunay na diagram Voronoi
 */

import type { Delaunay } from 'd3-delaunay';
import type { VoronoiDiagram } from '../types/voronoi.types';

/**
 * Klasa Voronoi - konwertuje triangulację Delaunay na diagram Voronoi
 */
export class VoronoiGenerator {
  private delaunay: Delaunay<number[]>;
  private points: number[][];
  private pointsN: number;
  public cells: VoronoiDiagram['cells'];
  public vertices: VoronoiDiagram['vertices'];

  constructor(
    delaunay: Delaunay<number[]>,
    points: number[][],
    pointsN: number
  ) {
    this.delaunay = delaunay;
    this.points = points;
    this.pointsN = pointsN;

    // Inicjalizuj struktury
    this.cells = {
      v: [],
      c: [],
      b: [],
      i: [],
    };
    this.vertices = {
      p: [],
      v: [],
      c: [],
    };

    // Przetwarzaj półkrawędzie, aby zbudować diagram Voronoi
    this.buildVoronoi();
  }

  /**
   * Buduje diagram Voronoi z triangulacji Delaunay
   */
  private buildVoronoi(): void {
    // Uzyskaj dostęp do trójkątów i półkrawędzi z d3-delaunay
    // d3-delaunay opakowuje Delaunator w właściwości _delaunator
    const delaunator = (this.delaunay as any)._delaunator;
    const triangles = delaunator?.triangles as Uint32Array;
    const halfedges = delaunator?.halfedges as Int32Array;
    const inedges = (this.delaunay as any).inedges as Int32Array;

    if (!triangles || !halfedges) {
      throw new Error('Obiekt Delaunay nie zawiera triangles lub halfedges');
    }

    // Przetwarzaj wszystkie półkrawędzie
    for (let e = 0; e < triangles.length; e++) {
      const p = triangles[this.nextHalfedge(e)];

      // Przetwarzaj komórkę dla punktu p
      if (p < this.pointsN && !this.cells.c[p]) {
        // Znajdź początkową krawędź dla tego punktu używając inedges
        const startEdge = inedges[p];
        if (startEdge === -1) continue; // Punkt nie jest w triangulacji

        // Znajdź wszystkie krawędzie wokół tego punktu
        const edges = this.edgesAroundPoint(startEdge, halfedges);
        // Wierzchołki komórki: mapuj krawędzie na trójkąty
        this.cells.v[p] = edges.map((edge) => this.triangleOfEdge(edge));
        // Sąsiedzi komórki: mapuj krawędzie na punkty, filtruj poprawne komórki
        this.cells.c[p] = edges
          .map((edge) => triangles[edge])
          .filter((c) => c < this.pointsN);
        // Flaga brzegowa: jeśli liczba krawędzi > sąsiadów, komórka jest na brzegu
        this.cells.b[p] = edges.length > this.cells.c[p].length ? 1 : 0;
      }

      // Przetwarzaj wierzchołek (środek trójkąta)
      const t = this.triangleOfEdge(e);
      if (!this.vertices.p[t]) {
        this.vertices.p[t] = this.triangleCenter(t);
        this.vertices.v[t] = this.trianglesAdjacentToTriangle(t, halfedges);
        this.vertices.c[t] = this.pointsOfTriangle(t, triangles);
      }
    }
  }

  /**
   * Pobiera ID punktów tworzących dany trójkąt
   */
  private pointsOfTriangle(t: number, triangles?: Uint32Array): number[] {
    if (!triangles) {
      const delaunator = (this.delaunay as any)._delaunator;
      triangles = delaunator?.triangles as Uint32Array;
    }
    return this.edgesOfTriangle(t).map((edge) => triangles![edge]!);
  }

  /**
   * Identyfikuje trójkąty sąsiadujące z danym trójkątem
   */
  private trianglesAdjacentToTriangle(
    t: number,
    halfedges?: Int32Array
  ): number[] {
    const he = halfedges || ((this.delaunay as any).halfedges as Int32Array);
    const triangles: number[] = [];
    for (const edge of this.edgesOfTriangle(t)) {
      const opposite = he[edge];
      if (opposite !== undefined && opposite !== -1) {
        triangles.push(this.triangleOfEdge(opposite));
      }
    }
    return triangles;
  }

  /**
   * Pobiera wszystkie półkrawędzie dotykające danego punktu
   */
  private edgesAroundPoint(start: number, halfedges: Int32Array): number[] {
    const result: number[] = [];
    let incoming = start;

    do {
      result.push(incoming);
      const outgoing = this.nextHalfedge(incoming);
      incoming = halfedges[outgoing];
    } while (
      incoming !== undefined &&
      incoming !== -1 &&
      incoming !== start &&
      result.length < 50
    );

    return result;
  }

  /**
   * Pobiera środek (środek okręgu opisanego) trójkąta
   */
  private triangleCenter(t: number): [number, number] {
    const delaunator = (this.delaunay as any)._delaunator;
    const triangles = delaunator?.triangles as Uint32Array;
    const vertices = this.pointsOfTriangle(t, triangles).map(
      (p) => this.points[p]
    );
    return this.circumcenter(vertices[0]!, vertices[1]!, vertices[2]!);
  }

  /**
   * Pobiera krawędzie trójkąta
   */
  private edgesOfTriangle(t: number): [number, number, number] {
    return [3 * t, 3 * t + 1, 3 * t + 2];
  }

  /**
   * Pobiera indeks trójkąta z indeksu krawędzi
   */
  private triangleOfEdge(e: number): number {
    return Math.floor(e / 3);
  }

  /**
   * Przechodzi do następnej półkrawędzi w trójkącie
   */
  private nextHalfedge(e: number): number {
    return e % 3 === 2 ? e - 2 : e + 1;
  }

  /**
   * Przechodzi do poprzedniej półkrawędzi w trójkącie
   */
  private prevHalfedge(e: number): number {
    return e % 3 === 0 ? e + 2 : e - 1;
  }

  /**
   * Oblicza środek okręgu opisanego trójkąta
   * Staje się to wierzchołkiem w diagramie Voronoi
   */
  private circumcenter(
    a: number[],
    b: number[],
    c: number[]
  ): [number, number] {
    const [ax, ay] = a;
    const [bx, by] = b;
    const [cx, cy] = c;

    const ad = ax * ax + ay * ay;
    const bd = bx * bx + by * by;
    const cd = cx * cx + cy * cy;
    const D = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));

    if (Math.abs(D) < 1e-10) {
      // Zdegenerowany trójkąt - zwróć centroid jako fallback
      return [Math.floor((ax + bx + cx) / 3), Math.floor((ay + by + cy) / 3)];
    }

    return [
      Math.floor((1 / D) * (ad * (by - cy) + bd * (cy - ay) + cd * (ay - by))),
      Math.floor((1 / D) * (ad * (cx - bx) + bd * (ax - cx) + cd * (bx - ax))),
    ];
  }

  /**
   * Pobiera wynik diagramu Voronoi
   */
  getDiagram(): VoronoiDiagram {
    return {
      cells: {
        ...this.cells,
        i: Array.from({ length: this.pointsN }, (_, i) => i),
      },
      vertices: this.vertices,
    };
  }
}

