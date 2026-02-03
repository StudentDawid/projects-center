/**
 * Wygładzacz wielokątów
 * Wygładza krawędzie wielokątów używając d3.curveBasisClosed
 */

import * as d3 from 'd3';
import { rn } from './map-utils';

/**
 * Konwertuje punkty wielokąta na wygładzoną ścieżkę SVG używając curveBasisClosed
 */
export function smoothPolygonPath(points: Array<[number, number]>): string {
  if (points.length === 0) return '';

  // Użyj d3.curveBasisClosed do wygładzonych zamkniętych krzywych
  const lineGen = d3
    .line<[number, number]>()
    .x((d) => d[0])
    .y((d) => d[1])
    .curve(d3.curveBasisClosed);

  const path = lineGen(points);
  if (!path) return '';

  // Zaokrąglij współrzędne i upewnij się, że ścieżka jest zamknięta
  return roundPath(path) + 'Z';
}

/**
 * Zaokrągla współrzędne ścieżki, aby zmniejszyć rozmiar pliku
 */
function roundPath(path: string): string {
  return path.replace(/(\d+\.\d+)/g, (match) => {
    return rn(parseFloat(match), 1).toString();
  });
}

