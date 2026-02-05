/**
 * Generator mapy wysokości
 * Generuje wysokości terenu dla komórek Voronoi
 */

import type { Grid } from '../types/grid.types';
import type { HeightmapOptions, HeightmapStep } from '../types/heightmap.types';
import { rn, lim, createTypedArray } from './map-utils';
import { findGridCell, getBlobPower, getLinePower, getNumberInRange, getPointInRange } from './grid-helpers';
import { heightmapTemplates } from '../config/heightmap-templates';

/**
 * Klasa generatora mapy wysokości
 */
export class HeightmapGenerator {
  private grid: Grid | null = null;
  private heights: Uint8Array | null = null;
  private blobPower: number = 0.98;
  private linePower: number = 0.81;
  private width: number = 0;
  private height: number = 0;

  /**
   * Ustawia siatkę i inicjalizuje wysokości
   */
  setGraph(graph: Grid): void {
    const { cellsDesired, cells, points, width, height } = graph;

    this.grid = graph;
    this.width = width;
    this.height = height;
    this.heights = cells.h
      ? Uint8Array.from(cells.h)
      : createTypedArray({ maxValue: 100, length: points.length }) as Uint8Array;
    this.blobPower = getBlobPower(cellsDesired);
    this.linePower = getLinePower(cellsDesired);
  }

  /**
   * Pobiera aktualne wysokości
   */
  getHeights(): Uint8Array | null {
    return this.heights;
  }

  /**
   * Czyści dane
   */
  clearData(): void {
    this.heights = null;
    this.grid = null;
  }

  /**
   * Generuje wysokości z szablonu
   * @param graph - Struktura siatki
   * @param templateId - ID szablonu (np. "continents", "archipelago") lub string z szablonem
   */
  fromTemplate(graph: Grid, templateId: string): Uint8Array {
    this.setGraph(graph);

    // Sprawdź czy to ID template (w mapowaniu) czy string z krokami
    const templateData = heightmapTemplates[templateId];
    const templateString = templateData?.template || templateId; // Jeśli nie ma w mapowaniu, traktuj jako string

    if (!templateString || !templateString.trim()) {
      throw new Error(`Heightmap template: no template found for ID: ${templateId}`);
    }

    const steps = templateString.split('\n').filter(s => s.trim());

    if (!steps.length) {
      throw new Error(`Heightmap template: no steps. Template: ${templateId}`);
    }

    for (const step of steps) {
      const elements = step.trim().split(/\s+/);
      if (elements.length < 2) continue;
      this.addStep(elements[0]!, elements.slice(1));
    }

    return this.heights!;
  }

  /**
   * Generuje wysokości z wcześniej utworzonego obrazu
   * Uwaga: W środowisku przeglądarki musisz najpierw załadować obraz
   */
  async fromPrecreated(
    graph: Grid,
    imageData: ImageData
  ): Promise<Uint8Array> {
    this.setGraph(graph);

    // Konwertuj dane obrazu na wysokości
    const data = imageData.data;
    const heights = new Uint8Array(this.grid!.points.length);

    for (let i = 0; i < heights.length; i++) {
      const lightness = data[i * 4]! / 255;
      const powered = lightness < 0.2 ? lightness : 0.2 + Math.pow(lightness - 0.2, 0.8);
      heights[i] = Math.floor(powered * 100);
    }

    this.heights = heights;
    return heights;
  }

  /**
   * Generate heights (main entry point)
   * Sprawdza czy template jest w heightmapTemplates czy precreatedHeightmaps
   * Jeśli w templates - używa fromTemplate(), jeśli w precreated - używa fromPrecreated()
   */
  async generate(
    graph: Grid,
    options: HeightmapOptions = {}
  ): Promise<Uint8Array> {
    const { template, precreatedImage, randomFn } = options;

    // Store original Math.random if custom function provided
    const originalRandom = Math.random;
    if (randomFn) {
      (Math as any).random = randomFn;
    }

    try {
      this.setGraph(graph);

      // Jeśli podano precreatedImage, użyj go (ładowanie z obrazka)
      if (precreatedImage) {
        // TODO: Implementacja ładowania z obrazka gdy będzie potrzebna
        throw new Error('Precreated heightmap images not yet implemented');
      }

      // Jeśli podano template, sprawdź czy to ID template (w mapowaniu) czy precreated
      if (template) {
        // Sprawdź czy template jest w heightmapTemplates
        const isTemplate = template in heightmapTemplates;
        if (isTemplate) {
          return this.fromTemplate(graph, template);
        } else {
          // Jeśli nie ma w templates, może być precreated - na razie fallback do simple
          // W przyszłości można dodać obsługę precreatedHeightmaps
          this.generateSimpleHeightmap();
          return this.heights!;
        }
      }

      // Jeśli nie podano template, użyj domyślnego prostego generowania
      this.generateSimpleHeightmap();
      return this.heights!;
    } finally {
      if (randomFn) {
        (Math as any).random = originalRandom;
      }
    }
  }

  /**
   * Generate simple default heightmap
   */
  private generateSimpleHeightmap(): void {
    if (!this.grid || !this.heights) return;

    // Simple random heightmap with some structure
    const heights = this.heights;
    const { points, cellsDesired } = this.grid;

    // Initialize with random heights
    for (let i = 0; i < heights.length; i++) {
      heights[i] = Math.floor(Math.random() * 40) + 10; // 10-50
    }

    // Add some hills
    const hillCount = Math.floor(cellsDesired / 1000);
    for (let i = 0; i < hillCount; i++) {
      this.addHill(1, '30-60', '0-100', '0-100');
    }

    // Add mask (island-like)
    this.mask(1);
  }

  /**
   * Add step to heightmap generation
   */
  private addStep(tool: string, params: string[]): void {
    switch (tool) {
      case 'Hill':
        this.addHill(
          params[0] || '1',
          params[1] || '50',
          params[2] || '0-100',
          params[3] || '0-100'
        );
        break;
      case 'Pit':
        this.addPit(
          params[0] || '1',
          params[1] || '20',
          params[2] || '0-100',
          params[3] || '0-100'
        );
        break;
      case 'Range':
        this.addRange(
          params[0] || '1',
          params[1] || '40',
          params[2] || '0-100',
          params[3] || '0-100'
        );
        break;
      case 'Trough':
        this.addTrough(
          params[0] || '1',
          params[1] || '20',
          params[2] || '0-100',
          params[3] || '0-100'
        );
        break;
      case 'Strait':
        this.addStrait(params[0] || '5', params[1] || 'vertical');
        break;
      case 'Mask':
        this.mask(params[0] ? parseFloat(params[0]) : 1);
        break;
      case 'Invert':
        this.invert(params[0] || '1', params[1]);
        break;
      case 'Add':
        this.modify(params[0] || '10', params[1] || 'land', 1, 0);
        break;
      case 'Multiply':
        this.modify('0', params[1] || 'land', 0, parseFloat(params[0] || '1'));
        break;
      case 'Smooth':
        this.smooth(params[0] ? parseFloat(params[0]) : 2, params[1] ? parseFloat(params[1]) : 0);
        break;
    }
  }

  /**
   * Add hill(s) to heightmap
   */
  addHill(count: string | number, height: string, rangeX: string, rangeY: string): void {
    if (!this.grid || !this.heights) return;

    const countNum = getNumberInRange(count);
    for (let i = 0; i < countNum; i++) {
      this.addOneHill(height, rangeX, rangeY);
    }
  }

  private addOneHill(height: string, rangeX: string, rangeY: string): void {
    if (!this.grid || !this.heights) return;

    const { cells, points } = this.grid;
    const change = new Uint8Array(this.heights.length);
    let limit = 0;
    let start: number;
    let h = lim(getNumberInRange(height));

    // Find starting point
    do {
      const x = getPointInRange(rangeX, this.width);
      const y = getPointInRange(rangeY, this.height);
      start = findGridCell(x, y, this.grid);
      limit++;
    } while (this.heights[start]! + h > 90 && limit < 50);

    // Spread hill
    change[start] = h;
    const queue = [start];

    while (queue.length > 0) {
      const q = queue.shift()!;

      for (const c of cells.c[q] || []) {
        if (change[c] || c >= this.heights.length) continue;
        change[c] = Math.pow(change[q]!, this.blobPower) * (Math.random() * 0.2 + 0.9);
        if (change[c]! > 1) {
          queue.push(c);
        }
      }
    }

    // Apply changes
    for (let i = 0; i < this.heights.length; i++) {
      this.heights[i] = lim((this.heights[i] || 0) + (change[i] || 0));
    }
  }

  /**
   * Add pit(s) to heightmap
   */
  addPit(count: string | number, height: string, rangeX: string, rangeY: string): void {
    if (!this.grid || !this.heights) return;

    const countNum = getNumberInRange(count);
    for (let i = 0; i < countNum; i++) {
      this.addOnePit(height, rangeX, rangeY);
    }
  }

  private addOnePit(height: string, rangeX: string, rangeY: string): void {
    if (!this.grid || !this.heights) return;

    const { cells } = this.grid;
    const used = new Uint8Array(this.heights.length);
    let limit = 0;
    let start: number;
    let h = lim(getNumberInRange(height));

    // Find starting point (must be on land)
    do {
      const x = getPointInRange(rangeX, this.width);
      const y = getPointInRange(rangeY, this.height);
      start = findGridCell(x, y, this.grid);
      limit++;
    } while (this.heights[start]! < 20 && limit < 50);

    // Spread pit
    const queue = [start];

    while (queue.length > 0) {
      const q = queue.shift()!;
      h = Math.pow(h, this.blobPower) * (Math.random() * 0.2 + 0.9);
      if (h < 1) break;

      for (const c of cells.c[q] || []) {
        if (used[c] || c >= this.heights.length) continue;
        this.heights[c] = lim((this.heights[c] || 0) - h * (Math.random() * 0.2 + 0.9));
        used[c] = 1;
        queue.push(c);
      }
    }
  }

  /**
   * Add mountain range(s)
   */
  addRange(count: string | number, height: string, rangeX: string, rangeY: string): void {
    if (!this.grid || !this.heights) return;

    const countNum = getNumberInRange(count);
    for (let i = 0; i < countNum; i++) {
      this.addOneRange(height, rangeX, rangeY);
    }
  }

  private addOneRange(height: string, rangeX: string, rangeY: string): void {
    if (!this.grid || !this.heights) return;

    const { cells, points } = this.grid;
    const used = new Uint8Array(this.heights.length);
    let h = lim(getNumberInRange(height));

    // Find start and end points
    const startX = getPointInRange(rangeX, this.width);
    const startY = getPointInRange(rangeY, this.height);
    let dist = 0;
    let limit = 0;
    let endX: number;
    let endY: number;

    do {
      endX = Math.random() * this.width * 0.8 + this.width * 0.1;
      endY = Math.random() * this.height * 0.7 + this.height * 0.15;
      dist = Math.abs(endY - startY) + Math.abs(endX - startX);
      limit++;
    } while ((dist < this.width / 8 || dist > this.width / 3) && limit < 50);

    const startCell = findGridCell(startX, startY, this.grid);
    const endCell = findGridCell(endX, endY, this.grid);

    // Get range path
    const range = this.getRange(startCell, endCell, used);

    // Add height along range
    let queue = range.slice();
    let i = 0;

    while (queue.length > 0) {
      const frontier = queue.slice();
      queue = [];
      i++;

      for (const f of frontier) {
        if (f < this.heights.length) {
          this.heights[f] = lim(
            (this.heights[f] || 0) + h * (Math.random() * 0.3 + 0.85)
          );
        }
      }

      h = Math.pow(h, this.linePower) - 1;
      if (h < 2) break;

      for (const f of frontier) {
        for (const c of cells.c[f] || []) {
          if (!used[c] && c < this.heights.length) {
            queue.push(c);
            used[c] = 1;
          }
        }
      }
    }
  }

  /**
   * Add trough(s) (valleys)
   */
  addTrough(count: string | number, height: string, rangeX: string, rangeY: string): void {
    if (!this.grid || !this.heights) return;

    const countNum = getNumberInRange(count);
    for (let i = 0; i < countNum; i++) {
      this.addOneTrough(height, rangeX, rangeY);
    }
  }

  private addOneTrough(height: string, rangeX: string, rangeY: string): void {
    if (!this.grid || !this.heights) return;

    const { cells, points } = this.grid;
    const used = new Uint8Array(this.heights.length);
    let h = lim(getNumberInRange(height));

    // Find start and end points
    let startX: number;
    let startY: number;
    let limit = 0;

    do {
      startX = getPointInRange(rangeX, this.width);
      startY = getPointInRange(rangeY, this.height);
      limit++;
    } while (limit < 50);

    const startCell = findGridCell(startX, startY, this.grid);

    limit = 0;
    let dist = 0;
    let endX: number;
    let endY: number;

    do {
      endX = Math.random() * this.width * 0.8 + this.width * 0.1;
      endY = Math.random() * this.height * 0.7 + this.height * 0.15;
      dist = Math.abs(endY - startY) + Math.abs(endX - startX);
      limit++;
    } while ((dist < this.width / 8 || dist > this.width / 2) && limit < 50);

    const endCell = findGridCell(endX, endY, this.grid);

    // Get trough path
    const range = this.getRange(startCell, endCell, used);

    // Lower height along trough
    let queue = range.slice();
    let i = 0;

    while (queue.length > 0) {
      const frontier = queue.slice();
      queue = [];
      i++;

      for (const f of frontier) {
        if (f < this.heights.length) {
          this.heights[f] = lim(
            (this.heights[f] || 0) - h * (Math.random() * 0.3 + 0.85)
          );
        }
      }

      h = Math.pow(h, this.linePower) - 1;
      if (h < 2) break;

      for (const f of frontier) {
        for (const c of cells.c[f] || []) {
          if (!used[c] && c < this.heights.length) {
            queue.push(c);
            used[c] = 1;
          }
        }
      }
    }
  }

  /**
   * Add strait (lower terrain to create water passage)
   */
  addStrait(width: string | number, direction: string = 'vertical'): void {
    if (!this.grid || !this.heights) return;

    const widthNum = Math.min(getNumberInRange(width), this.grid.cellsX / 3);
    if (widthNum < 1 && Math.random() > widthNum) return;

    const { cells } = this.grid;
    const used = new Uint8Array(this.heights.length);
    const vert = direction === 'vertical';

    const startX = vert
      ? Math.floor(Math.random() * this.width * 0.4 + this.width * 0.3)
      : 5;
    const startY = vert
      ? 5
      : Math.floor(Math.random() * this.height * 0.4 + this.height * 0.3);

    const endX = vert
      ? Math.floor(this.width - startX - this.width * 0.1 + Math.random() * this.width * 0.2)
      : this.width - 5;
    const endY = vert
      ? this.height - 5
      : Math.floor(this.height - startY - this.height * 0.1 + Math.random() * this.height * 0.2);

    const start = findGridCell(startX, startY, this.grid);
    const end = findGridCell(endX, endY, this.grid);
    let range = this.getRange(start, end, used);
    const query: number[] = [];

    const step = 0.1 / widthNum;
    let currentWidth = widthNum;

    while (currentWidth > 0) {
      const exp = 0.9 - step * currentWidth;
      for (const r of range) {
        for (const e of cells.c[r] || []) {
          if (used[e] || e >= this.heights.length) continue;
          used[e] = 1;
          query.push(e);
          const currentHeight = this.heights[e]!;
          this.heights[e] = Math.pow(currentHeight, exp);
          if (this.heights[e]! > 100) this.heights[e] = 5;
        }
      }
      range = query.slice();
      query.length = 0;
      currentWidth--;
    }
  }

  /**
   * Get path between two cells
   */
  private getRange(start: number, end: number, used: Uint8Array): number[] {
    if (!this.grid) return [];

    const range: number[] = [start];
    const { cells, points } = this.grid;
    used[start] = 1;

    let cur = start;

    while (cur !== end) {
      let min = Infinity;
      let next = cur;

      for (const e of cells.c[cur] || []) {
        if (used[e]) continue;
        const diff =
          Math.pow(points[end]![0]! - points[e]![0]!, 2) +
          Math.pow(points[end]![1]! - points[e]![1]!, 2);
        const adjustedDiff = Math.random() > 0.85 ? diff / 2 : diff;
        if (adjustedDiff < min) {
          min = adjustedDiff;
          next = e;
        }
      }

      if (min === Infinity) break;
      range.push(next);
      used[next] = 1;
      cur = next;
    }

    return range;
  }

  /**
   * Apply mask to heightmap (island/continent shape)
   */
  mask(power: number = 1): void {
    if (!this.grid || !this.heights) return;

    const fr = Math.abs(power);

    for (let i = 0; i < this.heights.length; i++) {
      const [x, y] = this.grid.points[i]!;
      const nx = (2 * x) / this.width - 1; // [-1, 1], 0 is center
      const ny = (2 * y) / this.height - 1; // [-1, 1], 0 is center
      let distance = (1 - nx * nx) * (1 - ny * ny); // 1 is center, 0 is edge
      if (power < 0) distance = 1 - distance; // inverted
      const masked = (this.heights[i] || 0) * distance;
      this.heights[i] = lim(((this.heights[i] || 0) * (fr - 1) + masked) / fr);
    }
  }

  /**
   * Smooth heightmap
   */
  smooth(fr: number = 2, add: number = 0): void {
    if (!this.grid || !this.heights) return;

    const { cells } = this.grid;
    const newHeights = new Uint8Array(this.heights.length);

    for (let i = 0; i < this.heights.length; i++) {
      const heights: number[] = [this.heights[i] || 0];
      for (const c of cells.c[i] || []) {
        heights.push(this.heights[c] || 0);
      }

      const mean = heights.reduce((a, b) => a + b, 0) / heights.length;
      if (fr === 1) {
        newHeights[i] = Math.round(mean + add);
      } else {
        newHeights[i] = lim(
          ((this.heights[i] || 0) * (fr - 1) + mean + add) / fr
        );
      }
    }

    this.heights = newHeights;
  }

  /**
   * Modify heights (add/multiply)
   */
  modify(
    addStr: string,
    range: string,
    add: number,
    mult: number,
    power?: number
  ): void {
    if (!this.grid || !this.heights) return;

    if (addStr) add = parseFloat(addStr) || 0;

    let min = 0;
    let max = 100;

    if (range === 'land') {
      min = 20;
    } else if (range !== 'all' && range.includes('-')) {
      const [minStr, maxStr] = range.split('-');
      min = parseFloat(minStr || '0');
      max = parseFloat(maxStr || '100');
    }

    const isLand = min === 20;

    for (let i = 0; i < this.heights.length; i++) {
      let h = this.heights[i] || 0;
      if (h < min || h > max) continue;

      if (add) h = isLand ? Math.max(h + add, 20) : h + add;
      if (mult !== 1) h = isLand ? (h - 20) * mult + 20 : h * mult;
      if (power) h = isLand ? Math.pow(h - 20, power) + 20 : Math.pow(h, power);

      this.heights[i] = lim(h);
    }
  }

  /**
   * Invert heightmap
   */
  invert(count: string | number, axes?: string): void {
    if (!this.grid || !this.heights) return;

    if (Math.random() > getNumberInRange(count)) return;

    const invertX = axes !== 'y';
    const invertY = axes !== 'x';
    const { cellsX, cellsY } = this.grid;
    const inverted = new Uint8Array(this.heights.length);

    for (let i = 0; i < this.heights.length; i++) {
      const x = i % cellsX;
      const y = Math.floor(i / cellsX);
      const nx = invertX ? cellsX - x - 1 : x;
      const ny = invertY ? cellsY - y - 1 : y;
      const invertedI = nx + ny * cellsX;
      inverted[i] = this.heights[invertedI] || 0;
    }

    this.heights = inverted;
  }
}

/**
 * Create heightmap generator instance
 */
export function createHeightmapGenerator(): HeightmapGenerator {
  return new HeightmapGenerator();
}

