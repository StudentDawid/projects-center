# Pełna lista kroków generowania mapy RPG

## Kolejność kroków w funkcji `generate()`

### Inicjalizacja

1. ✅ `invokeActiveZooming()` - Włącza aktywne zoomowanie
2. ✅ `setSeed(precreatedSeed)` - Ustawia seed dla generatora pseudolosowego
3. ✅ `applyGraphSize()` - Stosuje rozmiar grafu
4. ✅ `randomizeOptions()` - Losuje opcje generacji
5. ✅ `generateGrid()` lub użycie precreatedGraph - Generuje siatkę Voronoi (jeśli potrzebna)
6. ✅ `HeightmapGenerator.generate(grid)` - Generuje heightmap (wysokości terenu)

### Podstawowa klasyfikacja terenu

7. ✅ `Features.markupGrid()` - Oznacza features w grid (ocean, lakes, islands)
8. ✅ `addLakesInDeepDepressions()` - Dodaje jeziora w głębokich depresjach
9. ✅ `openNearSeaLakes()` - Otwiera jeziora blisko morza

### Warstwy oceanu i koordynaty

10. ✅ `OceanLayers()` - Generuje warstwy głębokości oceanu
11. ✅ `defineMapSize()` - Definiuje rozmiar mapy i pozycję na globie
12. ✅ `calculateMapCoordinates()` - Oblicza współrzędne geograficzne mapy
13. ✅ `calculateTemperatures()` - Oblicza temperatury dla komórek
14. ✅ `generatePrecipitation()` - Generuje opady atmosferyczne

### Przejście do pack (szczegółowej siatki)

15. ✅ `reGraph()` - Konwertuje grid na pack (szczegółową siatkę)
16. ✅ `Features.markupPack()` - Oznacza features w pack
17. ✅ `createDefaultRuler()` - Tworzy domyślną skalę (ruler)

### Systemy wodne i biomy

18. ✅ `Rivers.generate()` - Generuje rzeki
19. ✅ `Biomes.define()` - Definiuje biomy
20. ✅ `Features.defineGroups()` - Klasyfikuje features na podtypy (ocean/sea/gulf, continent/island/isle, freshwater/salt/frozen, etc.)

### Rankowanie komórek i kultury

21. ⬜ `rankCells()` - Ocenia przydatność komórek (suitability) i oblicza populację
22. ⬜ `Cultures.generate()` - Generuje kultury
23. ⬜ `Cultures.expand()` - Rozszerza kultury na sąsiednie komórki

### Osadnictwo i państwa

24. ⬜ `Burgs.generate()` - Generuje miasta/osady (burgs)
25. ⬜ `States.generate()` - Generuje państwa/stany
26. ⬜ `Routes.generate()` - Generuje szlaki (drogowe i morskie)
27. ⬜ `Religions.generate()` - Generuje religie

### Specjalizacja osadnictwa i państw

28. ⬜ `Burgs.specify()` - Specjalizuje burgi (nadaje im szczegółowe właściwości)
29. ⬜ `States.collectStatistics()` - Zbiera statystyki dla państw
30. ⬜ `States.defineStateForms()` - Definiuje formy państw (republika, monarchia, etc.)

### Prowincje

31. ⬜ `Provinces.generate()` - Generuje prowincje
32. ⬜ `Provinces.getPoles()` - Znajduje bieguny niedostępności dla prowincji

### Finalizacja systemów wodnych

33. ⬜ `Rivers.specify()` - Specjalizuje rzeki (nadaje im szczegółowe właściwości)
34. ⬜ `Lakes.defineNames()` - Nadaje nazwy jeziorom

### Wojsko, markery i strefy

35. ⬜ `Military.generate()` - Generuje jednostki wojskowe
36. ⬜ `Markers.generate()` - Generuje markery (punkty na mapie)
37. ⬜ `Zones.generate()` - Generuje strefy (klimatyczne, polityczne, etc.)

### Finalizacja

38. ⬜ `drawScaleBar(scaleBar, scale)` - Rysuje skalę mapy (nie generuje danych, tylko renderuje)
39. ⬜ `Names.getMapName()` - Generuje nazwę mapy

### Statystyki

40. ⬜ `showStatistics()` - Wyświetla statystyki mapy (nie generuje danych)

## Status implementacji

- ✅ Zaimplementowane (kroki 1-20) - 20/39 kroków generujących dane
- ⬜ Do zaimplementowania (kroki 21-39) - 19 kroków pozostałych

## Notatki

- Niektóre kroki to renderowanie (np. `drawScaleBar`), a nie generowanie danych
- `showStatistics()` tylko wyświetla statystyki, nie generuje nowych danych
- Wszystkie kroki są wykonywane sekwencyjnie w podanej kolejności
