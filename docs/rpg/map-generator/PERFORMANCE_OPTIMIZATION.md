# Analiza wydajności i optymalizacje generatora mapy RPG

## Data analizy

Analiza przeprowadzona po implementacji kroków 1-6 generowania mapy.

## Priorytetyzacja optymalizacji

### 🔴 Najwyższy priorytet (Największy wpływ na wydajność)

1. **Memoizacja kolorów komórek (`getCellColor`)** - 80-90% mniej wywołań funkcji
2. **Cache ścieżek polygonów (`polygonToPath`)** - Eliminacja tysięcy operacji string concatenation
3. **Throttling `invokeActiveZooming`** - 70-80% mniej operacji DOM przy zoomowaniu
4. **Chunking generowania polygonów** - 50-70% szybsze generowanie, UI pozostaje responsywne
5. **Viewport culling - renderuj tylko widoczne komórki** - 80-90% mniej elementów DOM w viewport

### 🟡 Wysoki priorytet (Znaczący wpływ)

6. **Cache ścieżek rzek (`getRiverPath`)** - Eliminacja powtarzających się obliczeń path
7. **Cache ścieżek coastline** - Mniej obliczeń przy renderze
8. **Użycie `shallowRef` dla dużych struktur danych** - Mniej niepotrzebnych re-renderów
9. **Optymalizacja `landCellPolygons` computed** - Eliminacja przetwarzania przy każdym renderze
10. **Duplikacja logiki w `getCellColor`** - Mniej obliczeń, czytelniejszy kod

### 🟢 Średni priorytet (Umiarkowany wpływ)

11. **Cache referencji do elementów DOM w `invokeActiveZooming`** - Eliminacja `querySelectorAll`
12. **Optymalizacja `coastlineFeatures` computed** - Mniej obliczeń przy renderze
13. **Lazy loading szczegółów mapy** - Szybsze pierwsze renderowanie
14. **Progress indicator podczas generowania** - Lepsze UX
15. **Optymalizacja `watch` w `MapCanvas.vue`** - Mniej niepotrzebnych regeneracji

### 🔵 Niski priorytet (Opcjonalne, mniejszy wpływ)

16. **Web Workers dla ciężkich obliczeń** - UI pozostaje responsywne podczas generowania
17. **Virtualizacja listy komórek** - 60-70% mniej elementów do śledzenia przez Vue
18. **Typed arrays dla polygonów** - 10-20% mniej pamięci, szybszy dostęp
19. **Grupowanie elementów SVG** - Mniej elementów DOM
20. **Optymalizacja `getColorFromHeightValue`** - Mniej obliczeń przy renderze

---

## Szczegółowa analiza optymalizacji

### 1. 🔴 Chunking generowania polygonów

**Problem:**

- Synchroniczna pętla generuje wszystkie polygony (4000-5000) w jednym bloku, blokując główny wątek
- `try-catch` w każdej iteracji dla `packPolygons` jest kosztowne
- UI zamraża się podczas generowania

**Lokalizacja:**

- `app/features/rpg-map-generator/hooks/useMapGenerator.ts:243-262`

**Rozwiązanie:**

- **Chunking z `requestIdleCallback` lub `setTimeout`** (np. 100-200 komórek na batch)
- Usuń `try-catch` z pętli - sprawdź wcześniej czy dane są poprawne
- Pokazuj progress indicator podczas generowania

**Szacowany zysk:** 50-70% szybsze generowanie, UI pozostaje responsywne

**Przykładowa implementacja:**

```typescript
// Zamiast synchronicznej pętli:
for (let i = 0; i < generatedPack.cells.i.length; i++) {
  try {
    const polygon = getPackPolygon(generatedPack, i);
    if (polygon && polygon.length > 0) {
      packPolygons.push(polygon);
    }
  } catch (error) {
    // ...
  }
}

// Użyj chunkingu:
async function generatePolygonsChunked(
  pack: Pack,
  totalCells: number,
  chunkSize = 200,
  onProgress?: (progress: number) => void
): Promise<Array<Array<[number, number]>>> {
  const polygons: Array<Array<[number, number]>> = [];

  for (let i = 0; i < totalCells; i += chunkSize) {
    const end = Math.min(i + chunkSize, totalCells);
    const chunk = [];

    for (let j = i; j < end; j++) {
      const polygon = getPackPolygon(pack, j);
      if (polygon && polygon.length > 0) {
        chunk.push(polygon);
      }
    }

    polygons.push(...chunk);

    if (onProgress) {
      onProgress((end / totalCells) * 100);
    }

    // Pozwól przeglądarce zaktualizować UI
    await new Promise((resolve) => {
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(resolve);
      } else {
        setTimeout(resolve, 0);
      }
    });
  }

  return polygons;
}
```

---

### 2. 🔴 Viewport culling - renderuj tylko widoczne komórki

**Problem:**

- Renderowane są wszystkie komórki (4000-5000 `<path>`), nawet poza viewportem
- Każdy element to osobny węzeł DOM
- Vue musi zarządzać reaktywnością dla każdego elementu

**Lokalizacja:**

- `app/features/rpg-map-generator/ui/MapCanvas.vue:78-89`

**Rozwiązanie:**

- **Oblicz widoczne komórki** na podstawie viewport + transform
- Renderuj tylko widoczne komórki w `v-for`
- Użyj bounding box dla każdego polygonu do sprawdzenia widoczności

**Szacowany zysk:** 80-90% mniej elementów DOM w viewport

**Przykładowa implementacja viewport culling:**

```typescript
// Oblicz bounding box dla polygonu
function getPolygonBounds(polygon: Array<[number, number]>): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const [x, y] of polygon) {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }

  return { minX, minY, maxX, maxY };
}

// Sprawdź czy polygon jest widoczny w viewport
function isPolygonVisible(
  bounds: { minX: number; minY: number; maxX: number; maxY: number },
  viewBox: { x: number; y: number; width: number; height: number },
  transform: { x: number; y: number; scale: number }
): boolean {
  // Przekształć bounds przez transform
  const transformedMinX = bounds.minX * transform.scale + transform.x;
  const transformedMinY = bounds.minY * transform.scale + transform.y;
  const transformedMaxX = bounds.maxX * transform.scale + transform.x;
  const transformedMaxY = bounds.maxY * transform.scale + transform.y;

  // Sprawdź przecięcie z viewport
  return !(
    transformedMaxX < 0 ||
    transformedMinX > viewBox.width ||
    transformedMaxY < 0 ||
    transformedMinY > viewBox.height
  );
}

// W MapCanvas.vue
const visibleCellIndices = computed(() => {
  if (!cellPolygons.value.length) return [];

  const viewBox = {
    x: 0,
    y: 0,
    width: svgWidth.value,
    height: svgHeight.value,
  };

  const transform = {
    x: zoomX.value,
    y: zoomY.value,
    scale: zoomScale.value,
  };

  const visible: number[] = [];
  const boundsCache = new Map<number, ReturnType<typeof getPolygonBounds>>();

  for (let i = 0; i < cellPolygons.value.length; i++) {
    if (!boundsCache.has(i)) {
      boundsCache.set(i, getPolygonBounds(cellPolygons.value[i]!));
    }

    const bounds = boundsCache.get(i)!;
    if (isPolygonVisible(bounds, viewBox, transform)) {
      visible.push(i);
    }
  }

  return visible;
});

// W template
<path
  v-for="index in visibleCellIndices"
  :key="`cell-${index}`"
  :d="cellPaths[index] || ''"
  :fill="getCellColor(index)"
/>
```

---

### 3. 🔴 Memoizacja kolorów komórek (`getCellColor`)

**Problem:**

- `getCellColor` wywoływana dla każdej komórki przy każdym renderze (4000-5000 wywołań)
- Zawiera złożoną logikę sprawdzania pack/grid, powtarzane obliczenia `isUsingPack`
- Brak memoizacji - te same kolory są obliczane wielokrotnie

**Lokalizacja:**

- `app/features/rpg-map-generator/ui/MapCanvas.vue:384-440`

**Rozwiązanie:**

- **Wygeneruj tablicę kolorów** podczas generowania mapy w `useMapGenerator.ts` i cache'uj
- Użyj `computed` z memoizacją lub przygotuj kolory podczas generowania
- Dla trybu "biomes" i "height" osobne tablice kolorów

**Szacowany zysk:** 80-90% mniej wywołań funkcji przy renderze

**Przykładowa implementacja:**

```typescript
// W useMapGenerator.ts - po wygenerowaniu pack
const cellColorsBiomes = ref<string[]>([]);
const cellColorsHeight = ref<string[]>([]);

// Po wygenerowaniu pack i biomes:
if (generatedPack && generatedPack.cells.biome) {
  cellColorsBiomes.value = Array.from({ length: generatedPack.cells.biome.length }, (_, i) => {
    return getColorFromBiome(i, generatedPack);
  });
}

// Po wygenerowaniu heightmap:
if (generatedGrid && generatedGrid.cells.h) {
  cellColorsHeight.value = Array.from({ length: generatedGrid.cells.h.length }, (_, i) => {
    return getColorFromHeightValue(generatedGrid.cells.h[i]!);
  });
}

// W MapCanvas.vue
function getCellColor(cellId: number): string {
  const displayMode = props.displayMode || 'biomes';
  if (displayMode === 'biomes' && cellColorsBiomes.value.length > cellId) {
    return cellColorsBiomes.value[cellId] || '#ccc';
  }
  if (displayMode === 'height' && cellColorsHeight.value.length > cellId) {
    return cellColorsHeight.value[cellId] || '#ccc';
  }
  return '#ccc';
}
```

---

### 4. 🔴 Cache ścieżek polygonów (`polygonToPath`)

**Problem:**

- `polygonToPath` generuje string path dla każdej komórki przy każdym renderze (4000-5000 operacji string concatenation)
- Te same path strings są generowane wielokrotnie

**Lokalizacja:**

- `app/features/rpg-map-generator/ui/MapCanvas.vue:369-379`

**Rozwiązanie:**

- **Generuj paths podczas tworzenia polygonów** w `useMapGenerator.ts` i przechowuj jako `cellPaths: string[]`
- Użyj cached paths w template zamiast wywoływać funkcję

**Szacowany zysk:** Eliminacja tysięcy operacji string concatenation

**Przykładowa implementacja:**

```typescript
// W useMapGenerator.ts - podczas generowania polygonów
const cellPaths = ref<string[]>([]);

// Po wygenerowaniu polygonów:
cellPaths.value = packPolygons.map((polygon) => {
  if (polygon.length === 0) return '';
  let path = `M ${polygon[0]![0]} ${polygon[0]![1]}`;
  for (let i = 1; i < polygon.length; i++) {
    path += ` L ${polygon[i]![0]} ${polygon[i]![1]}`;
  }
  return path + ' Z';
});

// W MapCanvas.vue - użyj cached path w template
<path
  v-for="(polygon, index) in cellPolygons"
  :key="`cell-${index}`"
  :d="cellPaths[index] || ''"
  :fill="getCellColor(index)"
/>
```

---

### 5. 🔴 Throttling `invokeActiveZooming`

**Problem:**

- Wywoływane przy każdym zdarzeniu zoom bez throttling
- Używa `querySelectorAll` (kosztowne) przy każdym wywołaniu
- Modyfikuje atrybuty DOM dla wszystkich komórek i rzek (4000-5000+ elementów)

**Lokalizacja:**

- `app/features/rpg-map-generator/ui/MapCanvas.vue:697-723`

**Rozwiązanie:**

- **Throttle z `requestAnimationFrame`** - wywołuj tylko raz na frame
- **Cache referencje** do elementów (Vue refs zamiast `querySelectorAll`)
- Użyj refs Vue do przechowywania referencji do elementów

**Szacowany zysk:** 70-80% mniej operacji DOM przy zoomowaniu

**Przykładowa implementacja:**

```typescript
const cellsRefs = ref<SVGPathElement[]>([]);
const riversRefs = ref<SVGPathElement[]>([]);

let rafId: number | null = null;

function invokeActiveZooming(scale: number): void {
  if (rafId !== null) return; // Skip jeśli już zaplanowane

  rafId = requestAnimationFrame(() => {
    // Użyj cached refs zamiast querySelectorAll
    cellsRefs.value.forEach((cell) => {
      const baseStrokeWidth = 0.5;
      const adjustedWidth = Math.max(baseStrokeWidth / scale, 0.05);
      cell.setAttribute('stroke-width', String(adjustedWidth));
    });

    riversRefs.value.forEach((river) => {
      const currentWidth = parseFloat(
        river.getAttribute('stroke-width') || '1'
      );
      const baseWidth = Math.max(currentWidth, 0.5);
      const adjustedWidth = Math.max(baseWidth / Math.sqrt(scale), 0.3);
      river.setAttribute('stroke-width', String(adjustedWidth));
    });

    rafId = null;
  });
}
```

---

### 11. 🟢 Cache referencji do elementów DOM w `invokeActiveZooming`

**Problem:**

- `querySelectorAll` wywoływane przy każdym zoom, co jest kosztowne
- Brak cache referencji do elementów

**Lokalizacja:**

- `app/features/rpg-map-generator/ui/MapCanvas.vue:701, 709`

**Rozwiązanie:**

- Użyj Vue refs (`ref<SVGPathElement[]>()`) i cache referencje podczas renderowania
- Przechowuj referencje w tablicy refs zamiast używać `querySelectorAll`

**Szacowany zysk:** Eliminacja `querySelectorAll` przy zoomowaniu

**Przykładowa implementacja:**

```typescript
const cellsRefs = ref<SVGPathElement[]>([]);
const riversRefs = ref<SVGPathElement[]>([]);

// W template - dodaj ref do każdego elementu
<path
  v-for="(polygon, index) in cellPolygons"
  :ref="(el) => { if (el) cellsRefs[index] = el as SVGPathElement }"
  :key="`cell-${index}`"
  :d="cellPaths[index] || ''"
/>

// W invokeActiveZooming - użyj cached refs
function invokeActiveZooming(scale: number): void {
  if (rafId !== null) return;

  rafId = requestAnimationFrame(() => {
    cellsRefs.value.forEach((cell) => {
      if (cell) {
        const baseStrokeWidth = 0.5;
        const adjustedWidth = Math.max(baseStrokeWidth / scale, 0.05);
        cell.setAttribute('stroke-width', String(adjustedWidth));
      }
    });

    rafId = null;
  });
}
```

---

### 12. 🟢 Optymalizacja `coastlineFeatures` computed

**Problem:**

- `generateCoastlinePaths` może być kosztowne, wywoływane w computed (choć z memoizacją Vue)
- Obliczenia są powtarzane przy każdej zmianie pack

**Lokalizacja:**

- `app/features/rpg-map-generator/ui/MapCanvas.vue:239-242`

**Rozwiązanie:**

- Cache paths podczas generowania pack w `useMapGenerator.ts`
- Przechowuj jako część `pack.features` lub osobna struktura
- Użyj cached paths zamiast obliczać w computed

**Szacowany zysk:** Mniej obliczeń przy renderze

**Przykładowa implementacja:**

```typescript
// W useMapGenerator.ts - już opisane w optymalizacji #7
const coastlinePaths = ref<CoastlineFeature[]>([]);
```

---

### 13. 🟢 Lazy loading szczegółów mapy

**Problem:**

- Wszystko renderuje się od razu (grid, pack, rzeki, coastline)
- Pierwsze renderowanie może być wolne

**Rozwiązanie:**

- Najpierw renderuj grid (szybszy), potem pack (szczegółowy) w tle
- Użyj `v-show` zamiast `v-if` dla warstw które mogą się pojawiać
- Progressive enhancement - najpierw podstawowa mapa, potem szczegóły

**Szacowany zysk:** Szybsze pierwsze renderowanie

**Przykładowa implementacja:**

```typescript
// W useMapGenerator.ts
const gridReady = ref(false);
const packReady = ref(false);

// Najpierw generuj grid
grid.value = generatedGrid;
gridReady.value = true;

// Potem generuj pack w tle
setTimeout(async () => {
  const generatedPack = reGraph(generatedGrid);
  pack.value = generatedPack;
  packReady.value = true;
}, 0);

// W MapCanvas.vue
<g v-if="gridReady" class="grid-layer">
  <!-- Render grid -->
</g>
<g v-if="packReady" class="pack-layer">
  <!-- Render pack -->
</g>
```

---

### 14. 🟢 Progress indicator podczas generowania

**Problem:**

- Brak wskaźnika postępu podczas długotrwałego generowania (może zamrozić UI)
- Użytkownik nie wie ile czasu zajmie generowanie

**Lokalizacja:**

- `app/features/rpg-map-generator/hooks/useMapGenerator.ts:105-294`

**Rozwiązanie:**

- Dodać progress callback do `generateMap`
- Pokazywać progress bar w UI
- Aktualizować progress podczas chunkingu polygonów i innych długotrwałych operacji

**Szacowany zysk:** Lepsze UX, użytkownik widzi postęp

**Przykładowa implementacja:**

```typescript
interface MapGenerationSettings {
  // ...
  onProgress?: (progress: number, message: string) => void;
}

const generateMap = async (
  settings: MapGenerationSettings
): Promise<GeneratedMap | null> => {
  settings.onProgress?.(0, 'Inicjalizacja...');

  // Krok 1: Grid
  settings.onProgress?.(10, 'Generowanie siatki Voronoi...');
  const generatedGrid = generateVoronoiGrid(...);

  // Krok 2: Heightmap
  settings.onProgress?.(30, 'Generowanie heightmap...');
  const heights = await heightmapGenerator.generate(...);

  // Krok 3: Pack
  settings.onProgress?.(50, 'Konwertowanie na pack...');
  const generatedPack = reGraph(generatedGrid);

  // Krok 4: Polygony (z progress)
  settings.onProgress?.(70, 'Generowanie polygonów...');
  const packPolygons = await generatePolygonsChunked(
    generatedPack,
    generatedPack.cells.i.length,
    200,
    (progress) => {
      settings.onProgress?.(70 + (progress * 0.2), 'Generowanie polygonów...');
    }
  );

  settings.onProgress?.(100, 'Gotowe!');
  // ...
};
```

---

### 15. 🟢 Optymalizacja `watch` w `MapCanvas.vue`

**Problem:**

- `watch` na `[props.width, props.height, props.cellsDesired, props.seed]` może powodować niepotrzebne regeneracje
- Regeneruje mapę nawet gdy zmienia się tylko jeden prop

**Lokalizacja:**

- `app/features/rpg-map-generator/ui/MapCanvas.vue:657-663`

**Rozwiązanie:**

- Dodać warunki, aby regenerować tylko gdy rzeczywiście się zmieniło
- Użyć osobnych watcherów dla różnych props
- Dla `seed` - zawsze regeneruj, dla innych - tylko gdy rzeczywiście się zmieniło

**Szacowany zysk:** Mniej niepotrzebnych regeneracji

**Przykładowa implementacja:**

```typescript
// Zamiast:
watch(
  () => [props.width, props.height, props.cellsDesired, props.seed],
  () => {
    initializeMap();
  },
  { deep: true }
);

// Użyj:
const lastSeed = ref(props.seed);
const lastWidth = ref(props.width);
const lastHeight = ref(props.height);
const lastCellsDesired = ref(props.cellsDesired);

watch(() => props.seed, (newSeed) => {
  if (newSeed !== lastSeed.value) {
    lastSeed.value = newSeed;
    initializeMap();
  }
});

watch([() => props.width, () => props.height, () => props.cellsDesired],
  ([newWidth, newHeight, newCellsDesired]) => {
    if (
      newWidth !== lastWidth.value ||
      newHeight !== lastHeight.value ||
      newCellsDesired !== lastCellsDesired.value
    ) {
      lastWidth.value = newWidth;
      lastHeight.value = newHeight;
      lastCellsDesired.value = newCellsDesired;
      initializeMap();
    }
  }
);
```

---

### 16. 🔵 Web Workers dla ciężkich obliczeń

**Problem:**

- Generowanie Voronoi, heightmap, rzek blokuje główny wątek
- UI może zamarznąć podczas generowania

**Rozwiązanie:**

- Przenieś ciężkie obliczenia do Web Workers (Voronoi, heightmap, rivers)
- Użyj `postMessage` do komunikacji między workerem a głównym wątkiem
- Renderuj wyniki w głównym wątku

**Szacowany zysk:** UI pozostaje responsywne podczas generowania

**Przykładowa implementacja:**

```typescript
// worker.ts
self.onmessage = (e) => {
  const { type, data } = e.data;

  if (type === 'generateVoronoi') {
    const result = generateVoronoiGrid(data.width, data.height, ...);
    self.postMessage({ type: 'voronoiComplete', result });
  }

  if (type === 'generateHeightmap') {
    const result = generateHeightmap(data.grid, data.options);
    self.postMessage({ type: 'heightmapComplete', result });
  }
};

// W useMapGenerator.ts
const worker = new Worker(new URL('./worker.ts', import.meta.url));

worker.onmessage = (e) => {
  const { type, result } = e.data;
  if (type === 'voronoiComplete') {
    grid.value = result;
  }
};
```

---

### 17. 🔵 Virtualizacja listy komórek

**Problem:**

- Vue śledzi tysiące elementów w `v-for`
- Reaktywność dla każdego elementu jest kosztowna

**Lokalizacja:**

- `app/features/rpg-map-generator/ui/MapCanvas.vue:78-89`

**Rozwiązanie:**

- Użyj `v-memo` dla stabilnych komórek
- Rozważ bibliotekę virtual scrolling (jeśli potrzebna)
- Renderuj tylko widoczne komórki (viewport culling - już opisane w #2)

**Szacowany zysk:** 60-70% mniej elementów do śledzenia przez Vue

**Przykładowa implementacja:**

```vue
<path
  v-for="(polygon, index) in visibleCellIndices"
  v-memo="[polygon, cellPaths[index], cellColors[index]]"
  :key="`cell-${index}`"
  :d="cellPaths[index] || ''"
  :fill="cellColors[index] || '#ccc'"
/>
```

---

### 18. 🔵 Typed arrays dla polygonów

**Problem:**

- `Array<Array<[number, number]>>` - podwójne tablice
- Typed arrays byłyby bardziej efektywne

**Lokalizacja:**

- `app/features/rpg-map-generator/hooks/useMapGenerator.ts:244-263`

**Rozwiązanie:**

- Użyj `Float32Array` lub `Float64Array` (płaska struktura z offsetami)
- Rozważ format zoptymalizowany pod renderowanie (np. gotowe path strings)

**Szacowany zysk:** 10-20% mniej pamięci, szybszy dostęp

**Przykładowa implementacja:**

```typescript
// Zamiast:
const polygons: Array<Array<[number, number]>> = [];

// Użyj:
interface PolygonData {
  points: Float32Array; // Płaska tablica [x1, y1, x2, y2, ...]
  offsets: Uint16Array; // Indeksy początku każdego polygonu
  lengths: Uint8Array; // Liczba punktów w każdym polygonie
}
```

---

### 19. 🔵 Grupowanie elementów SVG

**Problem:**

- Tysiące osobnych `<path>` elementów
- Każdy element to osobny węzeł DOM

**Rozwiązanie:**

- Grupuj komórki w jeden `<path>` z wieloma komendami (jeśli możliwe)
- Użyj `<g>` z transform zamiast wielu `<path>`
- Rozważ renderowanie jako jeden `<path>` z wieloma segmentami

**Szacowany zysk:** Mniej elementów DOM

**Przykładowa implementacja:**

```vue
<!-- Zamiast tysięcy osobnych path -->
<path
  v-for="(polygon, index) in cellPolygons"
  :d="cellPaths[index]"
/>

<!-- Użyj jednego path z wieloma komendami -->
<path
  :d="allCellPaths"
  fill="none"
  stroke="currentColor"
/>
```

---

### 20. 🔵 Optymalizacja `getColorFromHeightValue`

**Problem:**

- Interpolacja kolorów przy każdym wywołaniu
- `hexToRgb` wywoływane przy każdym wywołaniu
- Obliczenia powtarzane dla tych samych wartości wysokości

**Lokalizacja:**

- `app/features/rpg-map-generator/ui/MapCanvas.vue:540-574`

**Rozwiązanie:**

- Pre-konwertuj hex na RGB (jako stałe)
- Cache interpolowane kolory dla często używanych wartości wysokości
- Użyj lookup table dla wartości 0-100

**Szacowany zysk:** Mniej obliczeń przy renderze

**Przykładowa implementacja:**

```typescript
// Pre-konwertuj hex na RGB jako stałe
const landStops: Array<[number, number, number]> = [
  [255, 255, 255], // #ffffff
  [245, 245, 220], // #f5f5dc
  [222, 184, 135], // #deb887
  // ...
];

// Cache interpolowane kolory
const heightColorCache = new Map<number, string>();

function getColorFromHeightValue(height: number): string {
  if (heightColorCache.has(height)) {
    return heightColorCache.get(height)!;
  }

  const t = 1 - height / 100;
  const [r, g, b] = interpolateColors(landStops, Math.max(0, Math.min(1, t)));
  const color = `rgb(${r}, ${g}, ${b})`;

  heightColorCache.set(height, color);
  return color;
}
```

---

### 6. 🟡 Pętle `v-for` (ŚREDNIE)

**Problem:**

- Vue musi śledzić tysiące elementów
- Reaktywność dla każdego elementu jest kosztowna

**Lokalizacja:**

- `app/features/rpg-map-generator/ui/MapCanvas.vue:15-26, 33-43`

**Rozwiązanie:**

- **Virtualizacja** - użyj biblioteki `vue-virtual-scroll-list`
- Renderuj tylko widoczne komórki (viewport culling)
- Użyj `v-memo` dla stabilnych komórek
- Rozważ renderowanie jako jeden `<path>` zamiast wielu `<path>`

**Szacowany zysk:** 60-70% mniej elementów do śledzenia przez Vue

**Przykładowa implementacja:**

```vue
<path
  v-for="(polygon, index) in visibleCells"
  v-memo="[polygon, getCellColor(index)]"
  :key="`cell-${index}`"
  :d="polygonToPath(polygon)"
  :fill="getCellColor(index)"
  class="voronoi-cell"
/>
```

---

### 6. 🟡 Cache ścieżek rzek (`getRiverPath`)

**Problem:**

- `getRiverPath` wywoływane dla każdej rzeki przy każdym renderze
- Generuje złożone polygon paths z meanderedPoints

**Lokalizacja:**

- `app/features/rpg-map-generator/ui/MapCanvas.vue:606-615`

**Rozwiązanie:**

- **Cache paths podczas generowania rzek** w `useMapGenerator.ts`
- Przechowuj jako `riverPaths: string[]` w hooku
- Użyj cached paths w template

**Szacowany zysk:** Eliminacja powtarzających się obliczeń path

**Przykładowa implementacja:**

```typescript
// W useMapGenerator.ts
const riverPaths = ref<string[]>([]);

// Po wygenerowaniu rzek w generateMap:
if (generatedPack && generatedPack.rivers) {
  riverPaths.value = generatedPack.rivers.map((river) => {
    return getRiverPolygonPath(
      river.meanderedPoints || [],
      river.widthFactor || 1,
      river.sourceWidth || 0.5
    );
  });
}

// W MapCanvas.vue - użyj cached path
<path
  v-for="(river, index) in pack.rivers"
  :key="`river-${river.i}`"
  :d="riverPaths[index] || ''"
  fill="#5d97bb"
  class="river-path"
/>
```

---

### 7. 🟡 Cache ścieżek coastline

**Problem:**

- `generateCoastlinePaths` wywoływane w `computed` przy każdym renderze (choć z memoizacją Vue, ale może być kosztowne)
- Obliczenia są powtarzane

**Lokalizacja:**

- `app/features/rpg-map-generator/ui/MapCanvas.vue:239-242`

**Rozwiązanie:**

- **Cache paths podczas generowania pack** w `useMapGenerator.ts`
- Przechowuj jako część `pack.features` lub osobna struktura
- Użyj cached paths zamiast obliczać w computed

**Szacowany zysk:** Mniej obliczeń przy renderze

**Przykładowa implementacja:**

```typescript
// W useMapGenerator.ts
const coastlinePaths = ref<CoastlineFeature[]>([]);

// Po wygenerowaniu pack w generateMap:
if (generatedPack) {
  coastlinePaths.value = generateCoastlinePaths(generatedPack);
}

// W MapCanvas.vue - użyj cached paths
const coastlineFeatures = computed(() => coastlinePaths.value);
```

---

### 8. 🟡 Użycie `shallowRef` dla dużych struktur danych

**Problem:**

- `cellPolygons` używa zwykłego `ref`, co powoduje głęboką reaktywność dla tysięcy polygonów
- Może powodować niepotrzebne re-rendery

**Lokalizacja:**

- `app/features/rpg-map-generator/hooks/useMapGenerator.ts:98`

**Rozwiązanie:**

- Zmień na `shallowRef` dla `cellPolygons`, `packPolygons`, `gridPolygons`
- Użyj `shallowRef` dla wszystkich dużych struktur danych

**Szacowany zysk:** Mniej niepotrzebnych re-renderów

**Przykładowa implementacja:**

```typescript
import { shallowRef } from 'vue';

const cellPolygons = shallowRef<Array<Array<[number, number]>>>([]);
const packPolygons = shallowRef<Array<Array<[number, number]>>>([]);
const gridPolygons = shallowRef<Array<Array<[number, number]>>>([]);
```

---

### 9. 🟡 Optymalizacja `landCellPolygons` computed

**Problem:**

- `landCellPolygons` przetwarza wszystkie komórki przy każdym renderze, sprawdzając wysokości
- Pętla przez wszystkie komórki (4000-5000 iteracji)

**Lokalizacja:**

- `app/features/rpg-map-generator/ui/MapCanvas.vue:314-351`

**Rozwiązanie:**

- **Cache podczas generowania mapy** w `useMapGenerator.ts`
- Przechowuj jako część danych mapy
- Użyj cached `landCellPolygons` zamiast obliczać w computed

**Szacowany zysk:** Eliminacja przetwarzania przy każdym renderze

**Przykładowa implementacja:**

```typescript
// W useMapGenerator.ts
const landCellPolygons = shallowRef<Array<Array<[number, number]>>>([]);

// Po wygenerowaniu polygonów w generateMap:
const landPolygons: Array<Array<[number, number]>> = [];
const heights = generatedGrid.cells.h;

// Sprawdź czy używamy pack czy grid
const isUsingPack = /* ... */;

if (isUsingPack && packData && packData.h && packData.g) {
  for (let i = 0; i < packPolygons.length; i++) {
    if (i < packData.h.length && packData.h[i]! >= 20) {
      landPolygons.push(packPolygons[i]!);
    }
  }
} else {
  for (let i = 0; i < gridPolygons.length; i++) {
    if (i < heights.length && heights[i]! >= 20) {
      landPolygons.push(gridPolygons[i]!);
    }
  }
}

landCellPolygons.value = landPolygons;

// W MapCanvas.vue - użyj cached
const landCellPolygons = computed(() => useMapGenerator().landCellPolygons.value);
```

---

### 10. 🟡 Duplikacja logiki w `getCellColor`

**Problem:**

- Sprawdzanie `isUsingPack` powtarzane 2 razy w tej samej funkcji (linie 393-398 i 418-423)
- Ta sama logika obliczana wielokrotnie

**Lokalizacja:**

- `app/features/rpg-map-generator/ui/MapCanvas.vue:384-440`

**Rozwiązanie:**

- Wyciągnij do zmiennej lokalnej lub computed property na początku funkcji
- Użyj raz zamiast powtarzać

**Szacowany zysk:** Mniej obliczeń, czytelniejszy kod

**Przykładowa implementacja:**

```typescript
function getCellColor(cellId: number): string {
  const displayMode = props.displayMode || 'biomes';

  // Oblicz raz na początku
  const polygonCount = cellPolygons.value.length;
  const packData = pack.value?.cells;
  const packBiome = packData?.biome;
  const packCellCount = packBiome?.length || 0;
  const isUsingPack =
    pack.value &&
    packData &&
    packBiome &&
    packCellCount > 0 &&
    polygonCount === packCellCount;

  if (displayMode === 'biomes') {
    if (isUsingPack && packBiome && cellId < packBiome.length) {
      return getColorFromBiome(cellId);
    }
  }

  // Użyj już obliczonego isUsingPack zamiast obliczać ponownie
  if (!grid.value || !grid.value.cells.h) {
    return '#ccc';
  }

  if (isUsingPack && packData && packData.g && cellId < packData.g.length) {
    const gridCellId = packData.g[cellId];
    if (
      gridCellId !== undefined &&
      gridCellId !== null &&
      gridCellId < grid.value.cells.h.length
    ) {
      const height = grid.value.cells.h[gridCellId];
      if (height !== undefined) {
        return getColorFromHeightValue(height);
      }
    }
  }

  return getColorFromHeight(cellId);
}
```

---

### 8. 🟢 Struktura danych polygonów (ŚREDNIE)

**Problem:**

- `Array<Array<[number, number]>>` - podwójne tablice
- Typed arrays byłyby bardziej efektywne

**Lokalizacja:**

- `app/features/rpg-map-generator/hooks/useMapGenerator.ts:244-263`

**Rozwiązanie:**

- Użyj `Float32Array` lub `Float64Array` (płaska struktura z offsetami)
- Rozważ format zoptymalizowany pod renderowanie (np. gotowe path strings)

**Szacowany zysk:** 10-20% mniej pamięci + szybszy dostęp

---

### 9. 🟡 Vue Reactivity (ŚREDNIE)

**Problem:**

- Wszystkie `cellPolygons` są reactive
- Może powodować niepotrzebne re-rendery

**Lokalizacja:**

- `app/features/rpg-map-generator/hooks/useMapGenerator.ts:99`

**Rozwiązanie:**

- Użyj `shallowRef` dla `cellPolygons`
- Rozdziel dane generowania od danych renderowania
- `markRaw` dla dużych struktur danych

**Szacowany zysk:** Mniej niepotrzebnych re-renderów

**Przykładowa implementacja:**

```typescript
const cellPolygons = shallowRef<Array<Array<[number, number]>>>([]);
```

---

### 10. 🟢 Asynchroniczność generowania (NISKIE)

**Problem:**

- Całe generowanie mapy jest synchroniczne
- Może zamrozić UI podczas generowania

**Lokalizacja:**

- `app/features/rpg-map-generator/hooks/useMapGenerator.ts:106-295`

**Rozwiązanie:**

- Użyj `requestIdleCallback` lub `setTimeout` do podziału na kroki
- Pokazuj progress bar dla długotrwałych operacji
- Rozważ Web Worker dla ciężkich obliczeń (Voronoi)

**Szacowany zysk:** UI pozostaje responsywne podczas generowania

---

### 11. 🟢 D3 Zoom (NISKIE)

**Problem:**

- D3 zoom może być ciężki przy wielu elementach
- Transform jest stosowany do każdego elementu

**Lokalizacja:**

- `app/features/rpg-map-generator/ui/MapCanvas.vue:367-380`

**Rozwiązanie:**

- Zastosuj `transform` przez CSS zamiast zmieniać atrybuty SVG
- Użyj `use:transform` directive dla lepszej wydajności
- Rozważ zastąpienie D3 zoom prostszą implementacją (jeśli nie używasz D3 do innych rzeczy)

**Szacowany zysk:** 20-30% szybsze zoomowanie

---

### 12. 🟢 Brak lazy loading (NISKIE)

**Problem:**

- Wszystko renderuje się od razu

**Rozwiązanie:**

- Renderuj najpierw tylko grid (szybszy), potem pack (szczegółowy)
- Użyj `v-show` zamiast `v-if` dla warstw które mogą się pojawiać
- Progressive enhancement - najpierw podstawowa mapa, potem szczegóły

**Szacowany zysk:** Szybsze pierwsze renderowanie

---

### 13. 🟢 CSS transitions (NISKIE)

**Problem:**

- `transition: opacity 0.2s ease` na każdej komórce może być kosztowne

**Lokalizacja:**

- `app/features/rpg-map-generator/ui/MapCanvas.vue:514-518`

**Rozwiązanie:**

- Użyj tylko `transform` i `opacity` (są GPU-accelerated)
- Zastosuj `will-change` tylko dla komórek pod hoverem
- Rozważ `pointer-events: none` na nieaktywnych warstwach

**Szacowany zysk:** Płynniejsze animacje hover

---

## Metryki wydajności do monitorowania

### Przed optymalizacją (do zmierzenia):

- Czas generowania mapy: `performance.now()` w `generateMap`
- Liczba elementów DOM: `document.querySelectorAll('.voronoi-cell').length`
- Czas pierwszego renderu: Chrome DevTools Performance
- FPS podczas zoomowania: Chrome DevTools FPS counter
- Zużycie pamięci: Chrome DevTools Memory profiler

### Metryki docelowe:

- Generowanie mapy < 2s dla 5000 komórek
- Pierwszy render < 500ms
- 60 FPS podczas zoomowania
- < 1000 elementów DOM w viewport
- Zużycie pamięci < 100MB dla mapy 5000 komórek

---

## Plan wdrożenia optymalizacji

### Faza 1 - Quick Wins (1-2 dni) - 🔴 Najwyższy priorytet:

1. ✅ **Memoizacja kolorów komórek (`getCellColor`)** - #3
2. ✅ **Cache ścieżek polygonów (`polygonToPath`)** - #4
3. ✅ **Throttling `invokeActiveZooming`** - #5
4. ✅ **Użycie `shallowRef` dla `cellPolygons`** - #8
5. ✅ **Duplikacja logiki w `getCellColor`** - #10

### Faza 2 - Renderowanie (3-5 dni) - 🔴 Najwyższy priorytet:

6. ✅ **Viewport culling** - #2
7. ✅ **Chunking generowania polygonów** - #1
8. ✅ **Cache ścieżek rzek (`getRiverPath`)** - #6
9. ✅ **Cache ścieżek coastline** - #7
10. ✅ **Optymalizacja `landCellPolygons` computed** - #9

### Faza 3 - Generowanie (5-7 dni) - 🟡 Wysoki priorytet:

11. ✅ **Cache referencji do elementów DOM** - #11
12. ✅ **Optymalizacja `coastlineFeatures` computed** - #12
13. ✅ **Lazy loading szczegółów mapy** - #13
14. ✅ **Progress indicator podczas generowania** - #14
15. ✅ **Optymalizacja `watch` w `MapCanvas.vue`** - #15

### Faza 4 - Zaawansowane (opcjonalne) - 🔵 Niski priorytet:

16. ✅ **Web Workers dla ciężkich obliczeń** - #16
17. ✅ **Virtualizacja listy komórek** - #17
18. ✅ **Typed arrays dla polygonów** - #18
19. ✅ **Grupowanie elementów SVG** - #19
20. ✅ **Optymalizacja `getColorFromHeightValue`** - #20

---

## Narzędzia do profilowania

### Chrome DevTools:

- **Performance Tab**: Analiza czasu wykonania
- **Memory Tab**: Analiza użycia pamięci
- **Rendering Tab**: FPS, paint flashing
- **Lighthouse**: Audyt wydajności

### Vue DevTools:

- **Performance Tab**: Analiza komponentów Vue
- **Inspector**: Sprawdzanie reaktywności

### Narzędzia kodowe:

```typescript
// Dodaj do kluczowych funkcji:
const startTime = performance.now();
// ... kod ...
console.log(`Function X took ${performance.now() - startTime}ms`);
```

---

## Przypadki testowe

### Test 1: Mała mapa

- 1000 komórek
- Cel: < 500ms generowanie, < 100ms renderowanie

### Test 2: Średnia mapa

- 5000 komórek (obecna domyślna)
- Cel: < 2s generowanie, < 300ms renderowanie

### Test 3: Duża mapa

- 10000 komórek
- Cel: < 5s generowanie, < 500ms renderowanie

### Test 4: Zoom performance

- Zoom od 0.5x do 20x
- Cel: 60 FPS przez cały czas

---

## Dodatkowe sugestie

### Canvas jako alternatywa:

- Dla bardzo dużych map (10000+ komórek) rozważ renderowanie na Canvas zamiast SVG
- Mniej elementów DOM = szybsze renderowanie
- Mniejsza interaktywność (trudniejszy hover, click)

### Service Workers:

- Cache wygenerowanych map dla tego samego seed
- Offline access do ostatnio wygenerowanych map

### WebAssembly:

- Przenieś obliczenia Voronoi do WebAssembly (dla przyszłości)
- Potencjalnie 2-3x szybsze obliczenia

---

## Notatki

- Użycie `shape-rendering="optimizeSpeed"` dla szybkiego renderowania
- Opcja `setRendering("optimizeSpeed")` może wyłączać niektóre efekty wizualne
- D3 do zarządzania zoomem, z optymalizacją renderowania przez viewport clipping

---

## Źródła

- Analiza kodu: `app/features/rpg-map-generator/`
- Wzorce z: `docs/rpg/map-generator/Azgaar-Fantasy-Map-Generator-master/`
- Data: [Data analizy]
