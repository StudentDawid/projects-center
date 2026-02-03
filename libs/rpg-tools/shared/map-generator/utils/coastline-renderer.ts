/**
 * Renderer linii brzegowej
 * Generuje wygładzone ścieżki linii brzegowej dla cech terenu
 */

import type { Pack, Feature } from '../types/pack.types';
import * as d3 from 'd3';
import { rn } from './map-utils';

/**
 * Typy grup linii brzegowej
 */
export type CoastlineGroup = 'sea_island' | 'lake_island';

/**
 * Dane cechy linii brzegowej
 */
export interface CoastlineFeature {
  group: CoastlineGroup;
  path: string;
  featureId: number;
}

/**
 * Generuje ścieżki linii brzegowej dla cech terenu
 */
export function generateCoastlinePaths(pack: Pack): CoastlineFeature[] {
  if (!pack.features || !pack.vertices) {
    return [];
  }

  const coastlines: CoastlineFeature[] = [];

  for (const feature of pack.features) {
    if (!feature || feature.type === 'ocean') continue;

    // Określ grupę linii brzegowej
    const group: CoastlineGroup =
      feature.group === 'lake_island' ? 'lake_island' : 'sea_island';

    // Generuj wygładzoną ścieżkę
    const path = getFeaturePath(feature, pack);

    if (path) {
      coastlines.push({
        group,
        path,
        featureId: feature.i,
      });
    }
  }

  return coastlines;
}

/**
 * Pobiera wygładzoną ścieżkę cechy używając curveBasisClosed
 */
function getFeaturePath(feature: Feature, pack: Pack): string {
  if (!feature.vertices || !pack.vertices.p) {
    return '';
  }

  // Mapuj ID wierzchołków na współrzędne
  const points = feature.vertices
    .map((vertexId) => pack.vertices.p[vertexId])
    .filter((point): point is [number, number] => point !== undefined && point.length === 2);

  if (points.length === 0) {
    return '';
  }

  // Uprość punkty (opcjonalne - można użyć biblioteki simplify, jeśli dostępna)
  const simplifiedPoints = simplifyPoints(points, 0.3);

  // Przytnij do granic (opcjonalne - zależy od granic mapy)
  const clippedPoints = clipPolygon(simplifiedPoints);

  // Generuj wygładzoną zamkniętą krzywą używając curveBasisClosed
  const lineGen = d3
    .line<[number, number]>()
    .x((d) => d[0])
    .y((d) => d[1])
    .curve(d3.curveBasisClosed);

  const path = lineGen(clippedPoints);
  if (!path) return '';

  // Zaokrąglij współrzędne i zamknij ścieżkę
  return roundPath(path) + 'Z';
}

/**
 * Upraszcza punkty (prosta implementacja - można ulepszyć odpowiednim algorytmem upraszczania)
 */
function simplifyPoints(points: [number, number][], tolerance: number): [number, number][] {
  if (points.length < 3) return points;

  // Proste uproszczenie oparte na odległości
  const simplified: [number, number][] = [points[0]!];

  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1]!;
    const curr = points[i]!;
    const next = points[i + 1]!;

    // Oblicz odległość od aktualnego punktu do linii między poprzednim a następnym
    const dist = pointToLineDistance(curr, prev, next);

    if (dist > tolerance) {
      simplified.push(curr);
    }
  }

  simplified.push(points[points.length - 1]!);
  return simplified;
}

/**
 * Oblicza odległość od punktu do segmentu linii
 */
function pointToLineDistance(
  point: [number, number],
  lineStart: [number, number],
  lineEnd: [number, number]
): number {
  const [px, py] = point;
  const [x1, y1] = lineStart;
  const [x2, y2] = lineEnd;

  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;

  if (lenSq !== 0) param = dot / lenSq;

  let xx: number, yy: number;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = px - xx;
  const dy = py - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Przytnij wielokąt do granic (prosta implementacja - można użyć odpowiedniej biblioteki do przycinania)
 */
function clipPolygon(points: [number, number][]): [number, number][] {
  // Na razie zwróć punkty bez zmian
  // W pełnej implementacji przycięto by do granic mapy
  return points;
}

/**
 * Zaokrągla współrzędne ścieżki, aby zmniejszyć rozmiar pliku
 */
function roundPath(path: string): string {
  return path.replace(/(\d+\.\d+)/g, (match) => {
    return rn(parseFloat(match), 1).toString();
  });
}

