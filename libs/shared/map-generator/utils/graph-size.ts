/**
 * Zarządca rozmiaru grafu
 * Waliduje i normalizuje rozmiar mapy
 */

/**
 * Opcje rozmiaru grafu
 */
export interface GraphSizeOptions {
  /** Szerokość mapy w pikselach */
  width: number;
  /** Wysokość mapy w pikselach */
  height: number;
}

/**
 * Zastosowany rozmiar grafu
 */
export interface AppliedGraphSize {
  /** Zastosowana szerokość */
  width: number;
  /** Zastosowana wysokość */
  height: number;
}

/**
 * Stosuje rozmiar grafu
 * Waliduje i normalizuje rozmiary mapy, które będą używane do generowania
 *
 * Funkcja:
 * - Waliduje rozmiary (min/max wartości)
 * - Normalizuje do bezpiecznych wartości
 * - Zwraca ostateczne rozmiary do użycia
 *
 * @param options - Opcje rozmiaru grafu
 * @returns Zastosowany rozmiar grafu
 */
export function applyGraphSize(options: GraphSizeOptions): AppliedGraphSize {
  const { width, height } = options;

  // Minimalne i maksymalne rozmiary
  const MIN_WIDTH = 100;
  const MIN_HEIGHT = 100;
  const MAX_WIDTH = 10000;
  const MAX_HEIGHT = 10000;

  // Waliduj i normalizuj rozmiary
  const appliedWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, Math.floor(width)));
  const appliedHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, Math.floor(height)));

  return {
    width: appliedWidth,
    height: appliedHeight,
  };
}

