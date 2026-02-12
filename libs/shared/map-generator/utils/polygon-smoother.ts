/**
 * Wygładzacz wielokątów
 * Wygładza krawędzie wielokątów używając d3.curveBasisClosed
 */

import * as d3 from 'd3';
import { rn } from './map-utils';

/**
 * Kontekst dla d3.line, który zaokrągla współrzędne
 */
export class RoundingContext {
  private _path: string[] = [];
  private _precision: number;

  constructor(precision: number = 1) {
    this._precision = precision;
  }

  private r(val: number): number {
    return rn(val, this._precision);
  }

  moveTo(x: number, y: number) {
    this._path.push(`M${this.r(x)},${this.r(y)}`);
  }

  lineTo(x: number, y: number) {
    this._path.push(`L${this.r(x)},${this.r(y)}`);
  }

  quadraticCurveTo(x1: number, y1: number, x: number, y: number) {
    this._path.push(`Q${this.r(x1)},${this.r(y1)},${this.r(x)},${this.r(y)}`);
  }

  bezierCurveTo(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x: number,
    y: number
  ) {
    this._path.push(
      `C${this.r(x1)},${this.r(y1)},${this.r(x2)},${this.r(y2)},${this.r(x)},${this.r(y)}`
    );
  }

  closePath() {
    this._path.push('Z');
  }

  toString() {
    return this._path.join('');
  }
}

/**
 * Konwertuje punkty wielokąta na wygładzoną ścieżkę SVG używając curveBasisClosed
 */
export function smoothPolygonPath(points: Array<[number, number]>): string {
  if (points.length === 0) return '';

  const context = new RoundingContext();

  // Użyj d3.curveBasisClosed do wygładzonych zamkniętych krzywych
  const lineGen = d3
    .line<[number, number]>()
    .x((d) => d[0])
    .y((d) => d[1])
    .curve(d3.curveBasisClosed)
    .context(context);

  lineGen(points);

  // Zaokrąglij współrzędne i upewnij się, że ścieżka jest zamknięta
  // context już zaokrągla, a d3.curveBasisClosed już zamyka ścieżkę (dodaje Z?)
  // W d3 curveBasisClosed kończy się closePath(), więc context.toString() będzie miał Z na końcu.
  return context.toString();
}

/**
 * Zaokrągla współrzędne ścieżki, aby zmniejszyć rozmiar pliku
 * @deprecated Użyj RoundingContext
 */
export function roundPath(path: string): string {
  return path.replace(/(\d+\.\d+)/g, (match) => {
    return rn(parseFloat(match), 1).toString();
  });
}

