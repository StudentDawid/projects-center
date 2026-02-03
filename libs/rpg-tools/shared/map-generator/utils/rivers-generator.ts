/**
 * Generator rzek
 * Generuje sieci rzeczne z symulacją przepływu wody
 */

import type { Pack, River } from '../types/pack.types';
import type { Grid } from '../types/grid.types';
import { rn } from './map-utils';
import * as d3 from 'd3';

/**
 * Rozszerzony typ rzeki z punktami meandrowania
 */
interface RiverWithMeandering extends River {
  meanderedPoints?: Array<[number, number, number]>;
}

/**
 * Opcje generowania rzek
 */
export interface RiversOptions {
  /** Minimalny przepływ potrzebny do utworzenia rzeki */
  minFluxToFormRiver?: number;
  /** Włącz erozję (obniżanie koryta) */
  allowErosion?: boolean;
  /** Modyfikator liczby komórek do obliczania przepływu */
  cellsNumberModifier?: number;
}

/**
 * Generuje rzeki dla struktury pack
 */
export function generateRivers(
  pack: Pack,
  grid: Grid,
  options: RiversOptions = {}
): void {
  const {
    minFluxToFormRiver = 30,
    allowErosion = true,
    cellsNumberModifier = 1,
  } = options;

  const { cells, features } = pack;
  if (!cells.h || !cells.c || !grid.cells.prec) {
    throw new Error(
      'Pack and Grid must have required data for river generation'
    );
  }

  // Inicjalizuj tablice
  cells.fl = new Uint16Array(cells.i.length); // Przepływ wody
  cells.r = new Uint16Array(cells.i.length); // ID rzek
  cells.conf = new Uint8Array(cells.i.length); // Zbiegi rzek

  const riversData: Record<number, number[]> = {}; // riverId -> komórki[]
  const riverParents: Record<number, number> = {};
  let riverNext = 1;

  // Funkcja pomocnicza - dodaje komórkę do rzeki
  const addCellToRiver = (cell: number, river: number) => {
    if (!riversData[river]) {
      riversData[river] = [cell];
    } else {
      riversData[river]!.push(cell);
    }
  };

  // Modyfikacja wysokości - uproszczona wersja
  const h = Array.from(cells.h);

  // Odprowadzanie wody od wysokich do niskich komórek (posortowane według wysokości, od wysokich do niskich)
  const land = cells.i.filter((i) => h[i]! >= 20);
  const sortedLand = [...land].sort((a, b) => h[b]! - h[a]!);

  for (const i of sortedLand) {
    const gridCell = cells.g?.[i];

    // Dodaj przepływ z opadów
    if (!cells.fl) cells.fl = new Uint16Array(cells.i.length);
    const fl = cells.fl;
    if (!fl) continue;
    if (gridCell !== undefined && gridCell < (grid.cells.prec?.length || 0)) {
      fl[i] =
        (fl[i] || 0) +
        Math.floor((grid.cells.prec?.[gridCell] || 0) / cellsNumberModifier);
    }

    // Znajdź najniższego sąsiada (w dół zbocza)
    const neighbors = cells.c?.[i] || [];
    if (neighbors.length === 0) continue;

    // Filtruj sąsiadów i sortuj według wysokości
    const validNeighbors = neighbors.filter(
      (n) => n >= 0 && n < cells.h.length
    );
    if (validNeighbors.length === 0) continue;

    // Znajdź najniższego sąsiada
    const minNeighbor = validNeighbors.reduce((min, n) => {
      if (h[n]! < h[min]!) return n;
      return min;
    }, validNeighbors[0]!);

    // Jeśli komórka jest w depresji (nie spływa w dół), przekaż przepływ i pomiń
    if (h[i]! <= h[minNeighbor]!) {
      if (h[minNeighbor]! >= 20 && fl) {
        fl[minNeighbor] = (fl[minNeighbor] || 0) + (fl[i] || 0);
      }
      continue;
    }

    // Jeśli przepływ jest zbyt mały, aby utworzyć rzekę, po prostu przekaż przepływ
    if ((fl[i] || 0) < minFluxToFormRiver) {
      if (h[minNeighbor]! >= 20 && fl) {
        fl[minNeighbor] = (fl[minNeighbor] || 0) + (fl[i] || 0);
      }
      continue;
    }

    // Utwórz lub kontynuuj rzekę
    if (!cells.r) cells.r = new Uint16Array(cells.i.length);
    if (!cells.r[i]) {
      cells.r[i] = riverNext;
      addCellToRiver(i, riverNext);
      riverNext++;
    }

    // Spłyń w dół zbocza
    flowDown(
      pack,
      minNeighbor,
      cells.fl[i]!,
      cells.r[i]!,
      riversData,
      riverParents,
      h,
      features
    );
  }

  // Zdefiniuj rzeki z zebranych danych
  defineRivers(pack, riversData, riverParents);

  // Zastosuj erozję, jeśli włączona
  if (allowErosion) {
    downcutRivers(pack, cells);
  }

  // Dodaj meandrowanie i oblicz ścieżki dla rzek
  addMeanderingToRivers(pack);
}

/**
 * Spływa wodę w dół zbocza
 * Zawsze dodaje komórkę do rzeki na końcu, nawet jeśli to komórka wody
 */
function flowDown(
  pack: Pack,
  toCell: number,
  fromFlux: number,
  river: number,
  riversData: Record<number, number[]>,
  riverParents: Record<number, number>,
  h: number[],
  features: Pack['features']
): void {
  const { cells } = pack;

  // Oblicz przepływ docelowej komórki (bez zbiegu)
  const toFlux = (cells.fl?.[toCell] || 0) - (cells.conf?.[toCell] || 0);
  const toRiver = cells.r?.[toCell] || 0;

  // Obsługa zbiegu rzek
  if (toRiver) {
    // Komórka w dół już ma przypisaną rzekę
    if (fromFlux > toFlux) {
      if (!cells.conf) cells.conf = new Uint8Array(cells.i.length);
      cells.conf[toCell] =
        (cells.conf[toCell] || 0) + (cells.fl?.[toCell] || 0); // Oznacz zbieg
      if (h[toCell]! >= 20) {
        riverParents[toRiver] = river; // Mniejsza rzeka staje się dopływem obecnej
      }
      if (!cells.r) cells.r = new Uint16Array(cells.i.length);
      cells.r[toCell] = river; // Przepisz rzekę, jeśli część w dół ma mniejszy przepływ
    } else {
      if (!cells.conf) cells.conf = new Uint8Array(cells.i.length);
      cells.conf[toCell] = (cells.conf[toCell] || 0) + fromFlux; // Oznacz zbieg
      if (h[toCell]! >= 20) {
        riverParents[river] = toRiver; // Obecna rzeka staje się dopływem większej
      }
    }
  } else {
    if (!cells.r) cells.r = new Uint16Array(cells.i.length);
    cells.r[toCell] = river; // Przypisz rzekę do komórki w dół
  }

  // Obsługa zbiornika wodnego (ocean/jezioro)
  if (h[toCell]! < 20) {
    // Wylej wodę do zbiornika
    const waterBody = features?.[cells.f?.[toCell] || 0];
    if (waterBody?.type === 'lake') {
      if (!waterBody.river || fromFlux > (waterBody.enteringFlux || 0)) {
        waterBody.river = river;
        waterBody.enteringFlux = fromFlux;
      }
      waterBody.flux = (waterBody.flux || 0) + fromFlux;
      if (!waterBody.inlets) {
        waterBody.inlets = [river];
      } else {
        waterBody.inlets.push(river);
      }
    }
  } else {
    // Propaguj przepływ i dodaj następny segment rzeki
    if (!cells.fl) cells.fl = new Uint16Array(cells.i.length);
    cells.fl[toCell] = (cells.fl[toCell] || 0) + fromFlux;
  }

  // Ważne: zawsze dodaj komórkę do rzeki na końcu, nawet jeśli to komórka wody
  if (!riversData[river]) {
    riversData[river] = [toCell];
  } else {
    riversData[river]!.push(toCell);
  }
}

/**
 * Definiuje rzeki z zebranych danych
 * Filtruje tylko komórki lądu podczas przypisywania cells.r, ale river.cells zawiera wszystkie komórki
 */
function defineRivers(
  pack: Pack,
  riversData: Record<number, number[]>,
  riverParents: Record<number, number>
): void {
  const { cells } = pack;

  // Ponownie inicjalizuj tablice rzek i zbiegów
  cells.r = new Uint16Array(cells.i.length);
  cells.conf = new Uint16Array(cells.i.length);
  pack.rivers = [];

  const defaultWidthFactor = rn(1 / (pack.cells.i.length / 10000) ** 0.25, 2);
  const mainStemWidthFactor = defaultWidthFactor * 1.2;

  // Przetwarzaj wszystkie rzeki z zebranych danych
  for (const key in riversData) {
    const riverCells = riversData[key]!;
    if (riverCells.length < 3) continue; // Pomiń bardzo małe rzeki

    const riverId = parseInt(key, 10);

    // Filtruj tylko komórki lądu podczas przypisywania cells.r
    for (const cell of riverCells) {
      if (cell < 0 || cells.h[cell]! < 20) continue;

      // Oznacz rzeczywiste zbiegi i przypisz rzekę do komórek
      if (!cells.r) cells.r = new Uint16Array(cells.i.length);
      if (!cells.conf) cells.conf = new Uint8Array(cells.i.length);
      if (cells.r[cell]) {
        cells.conf[cell] = 1;
      } else {
        cells.r[cell] = riverId;
      }
    }

    // Źródło = pierwsza komórka, ujście = przedostatnia komórka
    const source = riverCells[0]!;
    const mouth = riverCells[riverCells.length - 2]!;
    const parent = riverParents[riverId] || 0;

    const widthFactor =
      !parent || parent === riverId ? mainStemWidthFactor : defaultWidthFactor;

    // Dodaj meandrowanie - używa wszystkich komórek, w tym wody
    const meanderedPoints = addMeandering(
      riverCells,
      pack.cells.p,
      pack.cells.fl || new Uint16Array(pack.cells.i.length),
      pack.cells.h || new Uint8Array(pack.cells.i.length)
    );

    const discharge = pack.cells.fl?.[mouth] || 0;
    const length = getApproximateLength(meanderedPoints);
    const sourceWidth = getSourceWidth(pack.cells.fl?.[source] || 0);
    const width = getWidth(
      getOffset({
        flux: discharge,
        pointIndex: meanderedPoints.length,
        widthFactor,
        startingWidth: sourceWidth,
      })
    );

    // river.cells zawiera wszystkie komórki, w tym wodę
    pack.rivers.push({
      i: riverId,
      source,
      mouth,
      discharge,
      length,
      width,
      widthFactor,
      sourceWidth,
      parent,
      cells: riverCells, // Zawiera wszystkie komórki, w tym wodę
    });
  }
}

/**
 * Obniża koryta rzek (erozja)
 */
function downcutRivers(pack: Pack, cells: Pack['cells']): void {
  const MAX_DOWNCUT = 5;

  for (const i of pack.cells.i) {
    if (cells.h[i]! < 35) continue; // Nie obniżaj nizin
    if (!cells.fl?.[i]) continue;

    const higherCells = cells.c[i]!.filter((c) => cells.h[c]! > cells.h[i]!);
    if (higherCells.length === 0) continue;

    const higherFlux =
      higherCells.reduce((acc, c) => acc + (cells.fl?.[c] || 0), 0) /
      higherCells.length;
    if (!higherFlux) continue;

    const downcut = Math.floor((cells.fl[i] || 0) / higherFlux);
    if (downcut) {
      cells.h[i] = Math.max(cells.h[i]! - Math.min(downcut, MAX_DOWNCUT), 0);
    }
  }
}

/**
 * Dodaje meandrowanie do rzek
 */
function addMeanderingToRivers(pack: Pack): void {
  if (!pack.rivers || !pack.cells.fl) return;

  for (const river of pack.rivers) {
    // addMeandering używa wszystkich komórek
    const meanderedPoints = addMeandering(
      river.cells,
      pack.cells.p,
      pack.cells.fl,
      pack.cells.h || new Uint8Array(pack.cells.i.length)
    );

    // Zapisz punkty meandrowania do renderowania
    (river as RiverWithMeandering).meanderedPoints = meanderedPoints;
  }
}

/**
 * Dodaje meandrowanie do komórek rzeki
 * Używa wszystkich komórek z riverCells, w tym komórek wody
 */
function addMeandering(
  riverCells: number[],
  points: Array<[number, number]>,
  flux: Uint16Array,
  heights: Uint8Array,
  meandering: number = 0.5
): Array<[number, number, number]> {
  // Pobierz punkty rzeki
  const riverPoints = getRiverPoints(riverCells, points);

  const meandered: Array<[number, number, number]> = [];
  const lastStep = riverCells.length - 1;
  let step = heights[riverCells[0]!]! < 20 ? 1 : 10;

  for (let i = 0; i <= lastStep; i++, step++) {
    const cell = riverCells[i]!;
    const isLastCell = i === lastStep;

    const [x1, y1] = riverPoints[i]!;

    meandered.push([x1, y1, flux[cell] || 0]);
    if (isLastCell) break;

    const nextCell = riverCells[i + 1]!;
    const [x2, y2] = riverPoints[i + 1]!;

    if (nextCell === -1) {
      meandered.push([x2, y2, flux[cell] || 0]);
      break;
    }

    const dist2 = (x2 - x1) ** 2 + (y2 - y1) ** 2; // Kwadrat odległości między komórkami
    if (dist2 <= 25 && riverCells.length >= 6) continue;

    const meander =
      meandering + 1 / step + Math.max(meandering - step / 100, 0);
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const sinMeander = Math.sin(angle) * meander;
    const cosMeander = Math.cos(angle) * meander;

    // Dodaj punkty meandrowania w zależności od odległości
    if (step < 20 && (dist2 > 64 || (dist2 > 36 && riverCells.length < 5))) {
      // Jeśli odległość jest duża lub rzeka jest mała, dodaj dodatkowe punkty w 1/3 i 2/3 segmentu
      const p1x = (x1 * 2 + x2) / 3 + -sinMeander;
      const p1y = (y1 * 2 + y2) / 3 + cosMeander;
      const p2x = (x1 + x2 * 2) / 3 + sinMeander / 2;
      const p2y = (y1 + y2 * 2) / 3 - cosMeander / 2;
      meandered.push([p1x, p1y, 0], [p2x, p2y, 0]);
    } else if (dist2 > 25 || riverCells.length < 6) {
      // Jeśli odległość jest średnia lub rzeka jest mała, dodaj 1 dodatkowy punkt środkowy
      const p1x = (x1 + x2) / 2 + -sinMeander;
      const p1y = (y1 + y2) / 2 + cosMeander;
      meandered.push([p1x, p1y, 0]);
    }
  }

  return meandered;
}

/**
 * Pobiera punkty rzeki
 * Obsługuje komórki wody i -1 (granica)
 */
function getRiverPoints(
  riverCells: number[],
  points: Array<[number, number]>
): Array<[number, number]> {
  return riverCells.map((cell, i) => {
    if (cell === -1) {
      // Komórka graniczna - oblicz punkt graniczny
      const prevCell = riverCells[i - 1];
      if (prevCell !== undefined && prevCell >= 0) {
        return getBorderPoint(prevCell, points);
      }
      return points[0]!;
    }
    return points[cell]!;
  });
}

/**
 * Pobiera punkt graniczny
 */
function getBorderPoint(
  cell: number,
  points: Array<[number, number]>
): [number, number] {
  const [x, y] = points[cell]!;
  // Uproszczona wersja - użyj szerokości i wysokości z pack
  // W pełnej wersji użyj graphWidth i graphHeight
  const graphWidth = 1000; // TODO: pobierz z pack
  const graphHeight = 600; // TODO: pobierz z pack

  const min = Math.min(y, graphHeight - y, x, graphWidth - x);
  if (min === y) return [x, 0];
  else if (min === graphHeight - y) return [x, graphHeight];
  else if (min === x) return [0, y];
  return [graphWidth, y];
}

/**
 * Oblicza przybliżoną długość rzeki
 */
function getApproximateLength(points: Array<[number, number, number]>): number {
  const length = points.reduce((s, v, i, p) => {
    if (i === 0) return s;
    return s + Math.hypot(v[0] - p[i - 1]![0]!, v[1] - p[i - 1]![1]!);
  }, 0);
  return rn(length, 2);
}

/**
 * Oblicza szerokość źródła rzeki
 */
function getSourceWidth(flux: number): number {
  const FLUX_FACTOR = 500;
  const MAX_FLUX_WIDTH = 1;
  return rn(Math.min(flux ** 0.9 / FLUX_FACTOR, MAX_FLUX_WIDTH), 2);
}

/**
 * Oblicza offset (szerokość) dla danego punktu rzeki
 */
function getOffset({
  flux,
  pointIndex,
  widthFactor,
  startingWidth,
}: {
  flux: number;
  pointIndex: number;
  widthFactor: number;
  startingWidth: number;
}): number {
  if (pointIndex === 0) return startingWidth;

  const FLUX_FACTOR = 500;
  const MAX_FLUX_WIDTH = 1;
  const LENGTH_FACTOR = 200;
  const LENGTH_STEP_WIDTH = 1 / LENGTH_FACTOR;
  const LENGTH_PROGRESSION = [1, 1, 2, 3, 5, 8, 13, 21, 34].map(
    (n) => n / LENGTH_FACTOR
  );

  const fluxWidth = Math.min(flux ** 0.7 / FLUX_FACTOR, MAX_FLUX_WIDTH);
  const lengthWidth =
    pointIndex * LENGTH_STEP_WIDTH +
    (LENGTH_PROGRESSION[pointIndex] ||
      LENGTH_PROGRESSION[LENGTH_PROGRESSION.length - 1]!);
  return widthFactor * (lengthWidth + fluxWidth) + startingWidth;
}

/**
 * Oblicza szerokość rzeki w kilometrach
 */
function getWidth(offset: number): number {
  return rn((offset / 1.5) ** 1.8, 2); // Szerokość ujścia w km
}

/**
 * Generuje szeroką ścieżkę polygonu dla rzeki
 * Używa curveCatmullRom.alpha(0.1) do wygładzenia krzywych
 */
export function getRiverPolygonPath(
  meanderedPoints: Array<[number, number, number]>,
  widthFactor: number,
  sourceWidth: number
): string {
  if (meanderedPoints.length < 2) return '';

  // Użyj krzywej Catmull-Rom do wygładzenia
  const lineGen = d3
    .line<[number, number]>()
    .curve(d3.curveCatmullRom.alpha(0.1));

  const riverPointsLeft: Array<[number, number]> = [];
  const riverPointsRight: Array<[number, number]> = [];
  let flux = 0;

  // Oblicz punkty po lewej i prawej stronie rzeki
  for (let pointIndex = 0; pointIndex < meanderedPoints.length; pointIndex++) {
    const [x0, y0] =
      meanderedPoints[pointIndex - 1] || meanderedPoints[pointIndex]!;
    const [x1, y1, pointFlux] = meanderedPoints[pointIndex]!;
    const [x2, y2] =
      meanderedPoints[pointIndex + 1] || meanderedPoints[pointIndex]!;
    if (pointFlux > flux) flux = pointFlux;

    const offset = getOffset({
      flux,
      pointIndex,
      widthFactor,
      startingWidth: sourceWidth,
    });
    const angle = Math.atan2(y0 - y2, x0 - x2);
    const sinOffset = Math.sin(angle) * offset;
    const cosOffset = Math.cos(angle) * offset;

    riverPointsLeft.push([x1 - sinOffset, y1 + cosOffset]);
    riverPointsRight.push([x1 + sinOffset, y1 - cosOffset]);
  }

  // Generuj ścieżki - prawa strona odwrócona, lewa strona normalna
  const right = lineGen(riverPointsRight.reverse());
  if (!right) return '';
  let left = lineGen(riverPointsLeft);
  if (!left) return '';

  // Wyciągnij komendy krzywej z lewej ścieżki (zaczyna się od "C")
  const curveStart = left.indexOf('C');
  if (curveStart >= 0) {
    left = left.substring(curveStart);
  }

  // Zaokrąglij współrzędne do 1 miejsca po przecinku
  function roundPath(path: string): string {
    return path.replace(/(\d+\.\d+)/g, (match) => {
      return rn(parseFloat(match), 1).toString();
    });
  }

  return roundPath(right + left);
}
