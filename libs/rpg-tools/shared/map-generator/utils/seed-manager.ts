/**
 * Zarządca seed dla generatora mapy
 * Zarządza seedem dla generatora pseudolosowego
 */

import seedrandom from 'seedrandom';

/**
 * Ustawia seed dla generatora pseudolosowego
 * Zwraca funkcję PRNG opartą na podanym seed
 *
 * @param precreatedSeed - Opcjonalny seed (jeśli nie podano, zostanie wygenerowany)
 * @returns Obiekt z seed i funkcją PRNG
 */
export function setSeed(precreatedSeed?: string): {
  seed: string;
  random: () => number;
} {
  let seed: string;

  if (!precreatedSeed) {
    // Generuj nowy seed (format: 9-cyfrowy numer jako string)
    seed = String(Math.floor(Math.random() * 1e9));
  } else {
    seed = precreatedSeed;
  }

  // Utwórz funkcję PRNG opartą na seed (używając seedrandom)
  const random = seedrandom(seed);

  return {
    seed,
    random,
  };
}

/**
 * Generuje losowy seed (używany gdy seed nie jest podany)
 * Format: 9-cyfrowy numer jako string
 */
export function generateSeed(): string {
  return String(Math.floor(Math.random() * 1e9));
}

