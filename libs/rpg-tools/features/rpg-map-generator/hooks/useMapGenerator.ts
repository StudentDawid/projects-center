/**
 * Hook for map generation functionality
 */

import { ref, computed, shallowRef, type Ref } from 'vue';
import { getColorFromBiome, getColorFromHeightValue } from '@rpg-tools/shared/map-generator/utils/color-utils';
import { BiomeType } from '@rpg-tools/shared/map-generator/utils/biomes-generator';
import { generateVoronoiGrid, getGridPolygon } from '@rpg-tools/shared/map-generator/utils/voronoi-grid-generator';
import { createHeightmapGenerator } from '@rpg-tools/shared/map-generator/utils/heightmap-generator';
import { markupGrid } from '@rpg-tools/shared/map-generator/utils/features-generator';
import {
  addLakesInDeepDepressions,
  openNearSeaLakes,
} from '@rpg-tools/shared/map-generator/utils/lakes-generator';
import { generateOceanLayers } from '@rpg-tools/shared/map-generator/utils/ocean-layers';
import { defineMapSize, calculateMapCoordinates } from '@rpg-tools/shared/map-generator/utils/map-coordinates';
import {
  calculateTemperatures,
  generatePrecipitation,
  type TemperatureOptions,
  type PrecipitationOptions,
} from '@rpg-tools/shared/map-generator/utils/climate-generator';
import { reGraph, getPackPolygon } from '@rpg-tools/shared/map-generator/utils/pack-generator';
import { markupPack, defineFeatureGroups } from '@rpg-tools/shared/map-generator/utils/pack-features';
import { createDefaultRuler } from '@rpg-tools/shared/map-generator/utils/ruler-generator';
import { generateRivers, type RiversOptions } from '@rpg-tools/shared/map-generator/utils/rivers-generator';
import { defineBiomes } from '@rpg-tools/shared/map-generator/utils/biomes-generator';
import type { Grid } from '@rpg-tools/shared/map-generator/types/grid.types';
import type { Pack, Ruler } from '@rpg-tools/shared/map-generator/types/pack.types';
import type { HeightmapOptions } from '@rpg-tools/shared/map-generator/types/heightmap.types';
import type { LakesGenerationOptions } from '@rpg-tools/shared/map-generator/utils/lakes-generator';
import type { OceanLayersOptions } from '@rpg-tools/shared/map-generator/utils/ocean-layers';

// Import funkcji zarządzania seed
import { setSeed } from '@rpg-tools/shared/map-generator/utils/seed-manager';
// Import funkcji zarządzania rozmiarem grafu
import { applyGraphSize } from '@rpg-tools/shared/map-generator/utils/graph-size';
// Import funkcji randomizacji opcji
import { randomizeOptions } from '@rpg-tools/shared/map-generator/utils/randomize-options';
// Import funkcji regeneracji gridu
import { shouldRegenerateGrid } from '@rpg-tools/shared/map-generator/utils/grid-regeneration';

/**
 * Ustawienia generowania mapy
 */
export interface MapGenerationSettings {
  /** Szerokość mapy w pikselach */
  width: number;
  /** Wysokość mapy w pikselach */
  height: number;
  /** Pożądana liczba komórek Voronoi */
  cellsDesired: number;
  /** Seed do generowania liczb pseudolosowych */
  seed: string;
  /** Precreated grid (jeśli podany, będzie używany zamiast generowania nowego) */
  precreatedGrid?: Grid | null;
  /** Nazwa szablonu heightmap */
  template?: string;
  /** Opcje generowania heightmap */
  heightmap?: HeightmapOptions;
  /** Opcje generowania jezior */
  lakes?: LakesGenerationOptions;
  /** Opcje warstw oceanu */
  oceanLayers?: OceanLayersOptions;
  /** Opcje obliczania temperatury */
  temperature?: TemperatureOptions;
  /** Opcje generowania opadów */
  precipitation?: PrecipitationOptions;
  /** Opcje generowania rzek */
  rivers?: RiversOptions;
  /** Jednostka skali */
  scaleUnit?: 'km' | 'miles';
}

/**
 * Wygenerowane dane mapy
 */
export interface GeneratedMap {
  /** Struktura siatki Voronoi */
  grid: Grid;
  /** Struktura pack (szczegółowa siatka) */
  pack: Pack | null;
  /** Linijka/skala */
  ruler: Ruler | null;
  /** Tablica współrzędnych polygonów dla komórek pack (szczegółowe) */
  packPolygons: Array<Array<[number, number]>>;
  /** Tablica współrzędnych polygonów dla komórek grid (fallback) */
  gridPolygons: Array<Array<[number, number]>>;
  /** @deprecated Użyj packPolygons lub gridPolygons */
  cellPolygons: Array<Array<[number, number]>>;
}

/**
 * Hook do generowania mapy
 */
export function useMapGenerator() {
  const grid: Ref<Grid | null> = ref(null);
  const pack: Ref<Pack | null> = ref(null);
  const ruler: Ref<Ruler | null> = ref(null);
  const cellPolygons: Ref<Array<Array<[number, number]>>> = shallowRef([]);
  const isGenerating: Ref<boolean> = ref(false);
  const error: Ref<string | null> = ref(null);

  // Cache kolorów komórek - memoizacja dla wydajności
  const cellColorsBiomes: Ref<string[]> = shallowRef([]);
  const cellColorsHeight: Ref<string[]> = shallowRef([]);

  // Cache ścieżek polygonów - memoizacja dla wydajności
  const cellPaths: Ref<string[]> = shallowRef([]);

  /**
   * Generuje mapę Voronoi
   */
  const generateMap = async (settings: MapGenerationSettings): Promise<GeneratedMap | null> => {
    isGenerating.value = true;
    error.value = null;

    // Zapisz oryginalny Math.random, żeby móc go przywrócić
    const originalMathRandom = Math.random;

    try {
      // Krok 2: Ustaw seed dla generatora pseudolosowego
      const { seed: finalSeed, random: rng } = setSeed(settings.seed);

      // Zastąp globalny Math.random funkcją seeded PRNG
      // To zapewnia, że wszystkie miejsca używające Math.random() będą używać seeded PRNG
      const MathAny = Math as { random: () => number };
      MathAny.random = rng;

      // Krok 3: Zastosuj rozmiar grafu (walidacja i normalizacja rozmiarów)
      const graphSize = applyGraphSize({
        width: settings.width,
        height: settings.height,
      });

      // Krok 4: Randomizuj opcje generacji (tylko te, które nie były podane)
      const randomizedOptions = randomizeOptions(settings);

      // Połącz ustawienia z zrandomizowanymi opcjami
      const finalSettings: MapGenerationSettings = {
        ...settings,
        template: settings.template || randomizedOptions.template,
        temperature: settings.temperature || randomizedOptions.temperature,
        precipitation: settings.precipitation || randomizedOptions.precipitation,
      };

      // Krok 5: Sprawdź czy grid powinien być regenerowany i wygeneruj/uzyskaj grid
      let generatedGrid: Grid;

      if (
        shouldRegenerateGrid(
          grid.value,
          finalSeed,
          settings.cellsDesired,
          graphSize.width,
          graphSize.height
        )
      ) {
        // Użyj precreatedGrid jeśli jest podany, w przeciwnym razie wygeneruj nowy
        if (settings.precreatedGrid) {
          generatedGrid = settings.precreatedGrid;
          // Upewnij się, że seed jest zgodny
          generatedGrid.seed = finalSeed;
        } else {
          // Generuj nowy grid
          generatedGrid = generateVoronoiGrid(
            graphSize.width,
            graphSize.height,
            settings.cellsDesired,
            finalSeed,
            rng
          );
        }
      } else {
        // Użyj istniejący grid, ale usuń wysokości (zostaną wygenerowane ponownie)
        generatedGrid = grid.value!;
        delete generatedGrid.cells.h;
      }

      // Krok 6: Generuj heightmap (mapę wysokości) - używa zrandomizowanego template
      const heightmapGenerator = createHeightmapGenerator();
      const heights = await heightmapGenerator.generate(generatedGrid, {
        ...finalSettings.heightmap,
        template: finalSettings.template, // Przekaż template z randomizacji
        randomFn: rng,
      });

      // Dodaj wysokości do grid
      generatedGrid.cells.h = heights;

      // Krok 3: Oznacz features w grid (oceany, jeziora, wyspy)
      markupGrid(generatedGrid, rng);

      // Krok 4: Dodaj jeziora w głębokich depresjach
      const elevationLimit = finalSettings.lakes?.elevationLimit ?? 60; // Domyślnie: 60 (niższe = więcej jezior)
      addLakesInDeepDepressions(generatedGrid, elevationLimit);

      // Krok 5: Otwórz jeziora blisko morza
      openNearSeaLakes(
        generatedGrid,
        finalSettings.template || finalSettings.lakes?.template,
        finalSettings.lakes?.openNearSeaLakes ?? true
      );

      // Krok 6: Generuj warstwy oceanu (struktura danych)
      generateOceanLayers(generatedGrid, finalSettings.oceanLayers);

      // Krok 7: Definiuj rozmiar i pozycję mapy - używa zrandomizowanego template
      const mapSizeConfig = defineMapSize(generatedGrid, finalSettings.template || 'continents');
      generatedGrid.mapSizeConfig = mapSizeConfig;

      // Krok 8: Oblicz współrzędne geograficzne mapy
      const mapCoordinates = calculateMapCoordinates(generatedGrid, mapSizeConfig);
      generatedGrid.mapCoordinates = mapCoordinates;

      // Krok 9: Oblicz temperatury - używa zrandomizowanych opcji
      calculateTemperatures(generatedGrid, mapCoordinates, {
        ...finalSettings.temperature,
      });

      // Krok 10: Generuj opady - używa zrandomizowanych opcji
      generatePrecipitation(generatedGrid, mapCoordinates, {
        ...finalSettings.precipitation,
      });

      // Krok 11: ReGraph - konwertuj grid na pack (szczegółowa siatka)
      const generatedPack = reGraph(generatedGrid);

      // Krok 12: Oznacz features w pack
      markupPack(generatedPack, generatedGrid);

      // Krok 13: Utwórz domyślną linijkę
      const generatedRuler = createDefaultRuler(
        generatedGrid,
        finalSettings.scaleUnit || 'km'
      );

      // Krok 14: Generuj rzeki
      const cellsNumberModifier = Math.pow(generatedGrid.cellsDesired / 10000, 0.25);
      generateRivers(generatedPack, generatedGrid, {
        ...finalSettings.rivers,
        cellsNumberModifier,
      });

      // Krok 15: Definiuj biomy
      defineBiomes(generatedPack, generatedGrid);

      // Krok 16: Definiuj grupy features (klasyfikuj features)
      defineFeatureGroups(generatedPack, generatedGrid);

      // Generuj cache kolorów komórek - memoizacja dla wydajności
      // Kolory biomes (dla komórek pack)
      if (generatedPack && generatedPack.cells.biome) {
        const biomeColors: string[] = [];
        for (let i = 0; i < generatedPack.cells.biome.length; i++) {
          const biomeId = generatedPack.cells.biome[i];
          biomeColors[i] = getColorFromBiome(biomeId);
        }
        cellColorsBiomes.value = biomeColors;
      } else {
        cellColorsBiomes.value = [];
      }

      // Kolory wysokości (dla komórek grid)
      if (generatedGrid && generatedGrid.cells.h) {
        const heightColors: string[] = [];
        for (let i = 0; i < generatedGrid.cells.h.length; i++) {
          const height = generatedGrid.cells.h[i];
          if (height !== undefined) {
            heightColors[i] = getColorFromHeightValue(height);
          } else {
            heightColors[i] = '#ccc';
          }
        }
        cellColorsHeight.value = heightColors;
      } else {
        cellColorsHeight.value = [];
      }

      // Generuj polygony dla komórek pack (bardziej szczegółowe niż grid)
      const packPolygons: Array<Array<[number, number]>> = [];
      if (generatedPack && generatedPack.cells.i && generatedPack.cells.i.length > 0) {
        for (let i = 0; i < generatedPack.cells.i.length; i++) {
          try {
            const polygon = getPackPolygon(generatedPack, i);
            if (polygon && polygon.length > 0) {
              packPolygons.push(polygon);
            }
          } catch (error) {
            // Pomijaj komórki z błędami - będą użyte polygony grid jako fallback
          }
        }
      }

      // Również generuj polygony grid jako fallback
      const gridPolygons: Array<Array<[number, number]>> = [];
      for (let i = 0; i < generatedGrid.cells.i.length; i++) {
        const polygon = getGridPolygon(generatedGrid, i);
        gridPolygons.push(polygon);
      }

      grid.value = generatedGrid;
      pack.value = generatedPack;
      ruler.value = generatedRuler;

      // Użyj polygonów pack, jeśli dostępne i mamy biomy, w przeciwnym razie polygony grid
      const finalPolygons = packPolygons.length > 0 && generatedPack.cells.biome && packPolygons.length === generatedPack.cells.biome.length
        ? packPolygons
        : gridPolygons;

      cellPolygons.value = finalPolygons;

      // Generuj cache ścieżek polygonów - memoizacja dla wydajności
      // Konwertuj polygony na SVG path strings
      const paths: string[] = [];
      for (let i = 0; i < finalPolygons.length; i++) {
        const polygon = finalPolygons[i];
        if (!polygon || polygon.length === 0) {
          paths[i] = '';
          continue;
        }

        // Surowe polygony - nie wygładzamy pojedynczych komórek
        let path = `M ${polygon[0]![0]} ${polygon[0]![1]}`;
        for (let j = 1; j < polygon.length; j++) {
          path += ` L ${polygon[j]![0]} ${polygon[j]![1]}`;
        }
        path += ' Z';
        paths[i] = path;
      }
      cellPaths.value = paths;

      return {
        grid: generatedGrid,
        pack: generatedPack,
        ruler: generatedRuler,
        packPolygons,
        gridPolygons,
        cellPolygons: packPolygons.length > 0 ? packPolygons : gridPolygons,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd podczas generowania mapy';
      error.value = errorMessage;
      return null;
    } finally {
      // Przywróć oryginalny Math.random po zakończeniu generowania
      const MathAny = Math as { random: () => number };
      MathAny.random = originalMathRandom;

      isGenerating.value = false;
    }
  };

  /**
   * Pobiera polygon dla określonej komórki
   */
  const getCellPolygon = (cellId: number): Array<[number, number]> => {
    if (!grid.value) return [];
    return getGridPolygon(grid.value, cellId);
  };

  /**
   * Czyści wygenerowaną mapę
   */
  const clearMap = (): void => {
    grid.value = null;
    pack.value = null;
    ruler.value = null;
    cellPolygons.value = [];
    cellColorsBiomes.value = [];
    cellColorsHeight.value = [];
    cellPaths.value = [];
    error.value = null;
  };

  /**
   * Generuje losowy seed (format 9-cyfrowy)
   */
  const generateSeed = (): string => {
    // Format: 9-cyfrowy numer jako string
    return String(Math.floor(Math.random() * 1e9));
  };

  // Właściwości obliczane
  const hasMap = computed(() => grid.value !== null);
  const cellCount = computed(() => grid.value?.cells.i.length || 0);
  const pointCount = computed(() => grid.value?.points.length || 0);

  return {
    // Stan
    grid,
    pack,
    ruler,
    cellPolygons,
    cellColorsBiomes,
    cellColorsHeight,
    cellPaths,
    isGenerating,
    error,
    hasMap,
    cellCount,
    pointCount,

    // Metody
    generateMap,
    getCellPolygon,
    clearMap,
    generateSeed,
  };
}


