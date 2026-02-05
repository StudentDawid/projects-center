/**
 * Funkcje pomocnicze do generowania mapy
 * Funkcje pomocnicze do manipulacji liczbami, tablicami itp.
 */

/**
 * Zaokrągla wartość do d miejsc po przecinku
 */
export function rn(value: number, decimals: number = 0): number {
  const m = Math.pow(10, decimals);
  return Math.round(value * m) / m;
}

/**
 * Ogranicza wartość między min i max
 */
export function minmax(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Zwraca wartość w zakresie [0, 100]
 */
export function lim(value: number): number {
  return minmax(value, 0, 100);
}

/**
 * Funkcja normalizacji - mapuje wartość z [min, max] na [0, 1]
 */
export function normalize(val: number, min: number, max: number): number {
  return minmax((val - min) / (max - min), 0, 1);
}

/**
 * Interpolacja liniowa
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Pobiera odpowiedni konstruktor tablicy typowanej na podstawie maksymalnej wartości
 */
type TypedArrayConstructor = {
  new (length: number): Uint8Array | Uint16Array | Uint32Array;
  from(array: ArrayLike<number>): Uint8Array | Uint16Array | Uint32Array;
};

function getTypedArray(maxValue: number): TypedArrayConstructor {
  const UINT8_MAX = 255;
  const UINT16_MAX = 65535;

  if (maxValue <= UINT8_MAX) return Uint8Array as TypedArrayConstructor;
  if (maxValue <= UINT16_MAX) return Uint16Array as TypedArrayConstructor;
  return Uint32Array as TypedArrayConstructor;
}

/**
 * Tworzy tablicę typowaną z odpowiednim typem na podstawie maksymalnej wartości
 */
export function createTypedArray<T extends number>(options: {
  maxValue: number;
  length?: number;
  from?: ArrayLike<number>;
}): Uint8Array | Uint16Array | Uint32Array {
  const { maxValue, length, from } = options;
  const TypedArray = getTypedArray(maxValue);

  if (!from && length !== undefined) {
    return new TypedArray(length);
  }
  if (from) {
    return TypedArray.from(from);
  }
  throw new Error('Either length or from must be provided');
}

/**
 * Generuje losową liczbę z rozkładu Gaussa (normalnego)
 * @param expected - Wartość oczekiwana (średnia)
 * @param deviation - Odchylenie standardowe
 * @param min - Wartość minimalna
 * @param max - Wartość maksymalna
 * @param round - Liczba miejsc po przecinku do zaokrąglenia
 * @returns Losowa liczba z rozkładu Gaussa
 */
export function gauss(
  expected: number = 100,
  deviation: number = 30,
  min: number = 0,
  max: number = 300,
  round: number = 0
): number {
  // Prosta transformacja Box-Muller dla rozkładu Gaussa
  // Implementujemy własną, ponieważ nie mamy d3 w zależnościach
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random(); // Konwersja [0,1) na (0,1)
  while (v === 0) v = Math.random();

  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  const value = expected + z * deviation;

  return rn(minmax(value, min, max), round);
}

/**
 * Zwraca losową wartość z obiektu ważonego
 * @param weights - Obiekt z kluczami i ich wagami: {key1: weight1, key2: weight2}
 * @returns Losowy klucz wybrany na podstawie wag
 */
export function rw<T extends string>(weights: Record<T, number>): T {
  const array: T[] = [];
  for (const key in weights) {
    const weight = weights[key]!;
    for (let i = 0; i < weight; i++) {
      array.push(key as T);
    }
  }
  return array[Math.floor(Math.random() * array.length)]!;
}

