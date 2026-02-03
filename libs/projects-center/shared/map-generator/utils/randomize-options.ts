/**
 * Randomize generation options
 * Randomizuje opcje generacji mapy
 */

import { gauss, rw, rn } from './map-utils';
import type { MapGenerationSettings } from '../../features/rpg-map-generator/hooks/useMapGenerator';
import type { TemperatureOptions, PrecipitationOptions } from './climate-generator';

/**
 * Dostępne szablony heightmap z ich prawdopodobieństwami
 * Dostępne szablony heightmap z ich prawdopodobieństwami
 */
const HEIGHTMAP_TEMPLATES: Record<string, number> = {
  volcano: 3,
  highIsland: 19,
  lowIsland: 9,
  continents: 16,
  archipelago: 18,
  atoll: 1,
  mediterranean: 5,
  peninsula: 3,
  pangea: 5,
  isthmus: 2,
  shattered: 7,
  taklamakan: 1,
  oldWorld: 8,
  fractious: 3,
};

/**
 * Zrandomizowane opcje generacji
 */
export interface RandomizedOptions {
  /** Zrandomizowany template heightmap */
  template?: string;
  /** Zrandomizowane opcje temperatury */
  temperature?: TemperatureOptions;
  /** Zrandomizowane opcje opadów */
  precipitation?: PrecipitationOptions;
}

/**
 * Randomizuje opcje generacji mapy
 * Losuje wartości dla opcji, które nie są podane w settings
 *
 * Funkcja:
 * - Losuje template heightmap
 * - Losuje opcje temperatury (equator, north pole, south pole)
 * - Losuje opcje opadów (precipitation modifier)
 * - Losuje inne opcje (cultures, states, etc.) - ale te nie są jeszcze w naszej implementacji
 *
 * @param settings - Obecne ustawienia generacji
 * @returns Zrandomizowane opcje (tylko te, które nie były podane w settings)
 */
export function randomizeOptions(settings: MapGenerationSettings): RandomizedOptions {
  const options: RandomizedOptions = {};

  // Randomizuj template jeśli nie został podany
  if (!settings.template) {
    options.template = rw(HEIGHTMAP_TEMPLATES);
  }

  // Randomizuj opcje temperatury jeśli nie zostały podane
  if (!settings.temperature) {
    options.temperature = {
      temperatureEquator: gauss(25, 7, 20, 35, 0),
      temperatureNorthPole: gauss(-25, 7, -40, 10, 0),
      temperatureSouthPole: gauss(-15, 7, -40, 10, 0),
    };
  } else {
    // Losuj tylko te opcje temperatury, które nie były podane
    const temp: TemperatureOptions = {};
    if (settings.temperature.temperatureEquator === undefined) {
      temp.temperatureEquator = gauss(25, 7, 20, 35, 0);
    }
    if (settings.temperature.temperatureNorthPole === undefined) {
      temp.temperatureNorthPole = gauss(-25, 7, -40, 10, 0);
    }
    if (settings.temperature.temperatureSouthPole === undefined) {
      temp.temperatureSouthPole = gauss(-15, 7, -40, 10, 0);
    }
    if (Object.keys(temp).length > 0) {
      options.temperature = { ...settings.temperature, ...temp };
    }
  }

  // Randomizuj opcje opadów jeśli nie zostały podane
  if (!settings.precipitation) {
    options.precipitation = {
      precipitationModifier: gauss(100, 40, 5, 500),
    };
  } else if (settings.precipitation.precipitationModifier === undefined) {
    options.precipitation = {
      ...settings.precipitation,
      precipitationModifier: gauss(100, 40, 5, 500),
    };
  }

  return options;
}

