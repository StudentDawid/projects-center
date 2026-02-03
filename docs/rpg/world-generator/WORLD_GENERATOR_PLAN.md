# Plan Systemu Generowania Świata RPG

## Wizja

System generowania całego świata RPG z wszystkimi jego aspektami:

- **Kosmologia** - bogowie, panteony, mity, stworzenie świata
- **Religia** - wyznania, sekty, święte miejsca, kapłani
- **Państwa** - królestwa, republiki, imperia, granice, stolice
- **Kultury** - języki, tradycje, zwyczaje, sztuka
- **Rody** - dynastie, szlachta, herby, genealogie
- **Historia** - wydarzenia, wojny, sojusze, upadki cywilizacji
- **Ekonomia** - handel, surowce, szlaki handlowe
- **Konflikty** - wojny, spory terytorialne, rywalizacje

Inspiracja: Dwarf Fortress, Crusader Kings, World Anvil

---

## Architektura Systemu

### Struktura Folderów (FSD)

```
app/features/rpg-world-generator/
├── hooks/
│   ├── useWorldGenerator.ts          # Główny hook generowania świata
│   ├── useCosmologyGenerator.ts      # Generator kosmologii
│   ├── useReligionGenerator.ts       # Generator religii
│   ├── useNationsGenerator.ts        # Generator państw
│   ├── useCulturesGenerator.ts       # Generator kultur
│   ├── useDynastiesGenerator.ts     # Generator rodów
│   ├── useHistoryGenerator.ts        # Generator historii
│   └── useWorldIntegrator.ts         # Integracja z mapą
├── ui/
│   ├── WorldView.vue                 # Główny widok świata
│   ├── CosmologyPanel.vue            # Panel kosmologii
│   ├── ReligionPanel.vue            # Panel religii
│   ├── NationsPanel.vue             # Panel państw
│   ├── CulturesPanel.vue            # Panel kultur
│   ├── DynastiesPanel.vue           # Panel rodów
│   └── WorldTimeline.vue            # Oś czasu historii
└── utils/
    ├── name-generator.ts             # Generator nazw
    ├── relationship-builder.ts       # Budowanie relacji
    └── conflict-simulator.ts         # Symulacja konfliktów

app/shared/world-generator/
├── types/
│   ├── cosmology.types.ts           # Typy kosmologii
│   ├── religion.types.ts            # Typy religii
│   ├── nation.types.ts              # Typy państw
│   ├── culture.types.ts             # Typy kultur
│   ├── dynasty.types.ts             # Typy rodów
│   ├── history.types.ts             # Typy historii
│   └── world.types.ts               # Główne typy świata
└── utils/
    ├── name-generators/             # Generatory nazw
    │   ├── fantasy-names.ts
    │   ├── place-names.ts
    │   └── dynasty-names.ts
    └── generators/                  # Generatory danych
        ├── cosmology-generator.ts
        ├── religion-generator.ts
        └── ...
```

---

## Moduły Systemu

### 1. Kosmologia (Cosmology)

**Dane:**

- Bogowie (imię, domena, osobowość, moc)
- Panteony (grupy bogów, hierarchia)
- Mity (historie stworzenia, legendarne wydarzenia)
- Plan istnienia (płaszczyzny, wymiary)

**Generowanie:**

- Losowy wybór liczby panteonów (1-5)
- Generowanie bogów dla każdego panteonu (3-12 bogów)
- Przypisanie domen (wojna, magia, natura, śmierć, itp.)
- Tworzenie mitów łączących bogów

### 2. Religia (Religion)

**Dane:**

- Wyznania (nazwa, panteon, doktryny)
- Sekty (odłamy, herezje)
- Święte miejsca (świątynie, sanktuaria)
- Kapłani (hierarchia, role)

**Generowanie:**

- Tworzenie wyznań na podstawie panteonów
- Generowanie sekt (odchylenia od głównego wyznania)
- Umieszczanie świętych miejsc na mapie
- Przypisanie wyznań do regionów/kultur

### 3. Państwa (Nations)

**Dane:**

- Typy państw (królestwo, republika, imperium, konfederacja)
- Stolice (miasta na mapie)
- Granice (terytoria na mapie)
- Rządy (monarchia, demokracja, oligarchia)
- Sojusze i wrogości

**Generowanie:**

- Podział mapy na regiony
- Tworzenie państw w regionach
- Wyznaczanie granic na podstawie geografii
- Przypisanie stolic (największe miasta w regionie)
- Generowanie relacji między państwami

### 4. Kultury (Cultures)

**Dane:**

- Języki (rodziny językowe, dialekty)
- Tradycje (zwyczaje, święta)
- Sztuka (style, motywy)
- Technologie (poziom rozwoju)

**Generowanie:**

- Tworzenie rodzin językowych
- Przypisanie języków do kultur
- Generowanie tradycji kulturowych
- Określenie poziomu technologicznego

### 5. Rody (Dynasties)

**Dane:**

- Dynastie (nazwa, herb, pochodzenie)
- Szlachta (tytuły, ziemie)
- Genealogie (drzewa rodzinne)
- Sojusze małżeńskie

**Generowanie:**

- Tworzenie dynastii dla każdego państwa
- Generowanie rodów szlacheckich
- Budowanie genealogii (3-5 pokoleń)
- Przypisanie herbów i tytułów

### 6. Historia (History)

**Dane:**

- Wydarzenia (wojny, sojusze, odkrycia)
- Oś czasu (chronologia)
- Upadki cywilizacji
- Wielkie migracje

**Generowanie:**

- Symulacja historii (100-1000 lat wstecz)
- Generowanie kluczowych wydarzeń
- Tworzenie przyczyn i skutków
- Budowanie narracji historycznej

---

## Integracja z Mapą

### Połączenie z Generatorem Mapy

1. **Regiony na mapie:**
   - Użyj istniejących features (oceany, kontynenty, wyspy)
   - Podziel kontynenty na regiony na podstawie geografii
   - Przypisz kultury do regionów

2. **Miasta i osady:**
   - Użyj istniejącego `useSettlements.ts`
   - Rozszerz o stolice, święte miejsca
   - Przypisz miasta do państw

3. **Granice państw:**
   - Narysuj granice na mapie na podstawie regionów
   - Użyj Voronoi cells do określenia terytoriów

---

## Plan Implementacji

### Faza 1: Fundament i Kosmologia (Priorytet) ✅ W TRAKCIE

1. ✅ Stworzyć strukturę folderów i typy danych
2. ✅ Zaimplementować podstawowy `useWorldGenerator`
3. ✅ Stworzyć generatory nazw
4. ✅ **Zaimplementować generator kosmologii** (BARDZO SZCZEGÓŁOWY)

### Faza 2: Religia (Po kosmologii)

5. ✅ Zaimplementować generator religii
6. ✅ Integracja kosmologii z religią

### Faza 3: Państwa i Kultury

7. ✅ Zaimplementować generator państw
8. ✅ Zaimplementować generator kultur
9. ✅ Budowanie relacji między państwami

### Faza 4: Rody i Historia

10. ✅ Zaimplementować generator rodów
11. ✅ Zaimplementować generator historii (200+, 500+, 1000+ lat losowo)
12. ✅ Budowanie relacji między elementami

### Faza 5: UI i Wizualizacja (Później)

13. ✅ Stworzyć panele UI dla każdego modułu
14. ✅ Wizualizacja na mapie (granice, stolice, święte miejsca)
15. ✅ Oś czasu historii

---

## Odpowiedzi Użytkownika (Wymagania)

1. **Zakres generowania:**
   - ✅ **Generować cały świat na raz** (nie region po regionie)
   - ✅ **Historia: losowo 200+, 500+, 1000+ lat** (wybór losowy z opcji)
   - ✅ **Bardzo szczegółowy poziom** (maksymalna szczegółowość danych)

2. **Priorytety:**
   - ✅ **Kosmologia na początku** (najwyższy priorytet)
   - ✅ **Skupić się na danych** (integracja z mapą później)

3. **Wizualizacja:**
   - ✅ **Warstwy, panele, tooltips** (będą zrobione później)
   - ✅ **Interaktywna oś czasu** (nie teraz, później)
   - ✅ **Granice państw: linie i kolory** (na oddzielnej warstwie, później)

4. **Dane źródłowe:**
   - ✅ **Nie używać istniejących danych z mapy** (tylko biomy są dostępne)
   - ✅ **Brak dodatkowych danych źródłowych** (wszystko generowane)

---

## Następne Kroki

1. **Odpowiedź na pytania** - określenie wymagań
2. **Stworzenie struktury** - foldery, typy danych
3. **Implementacja generatorów** - zgodnie z priorytetami
4. **Integracja z mapą** - wizualizacja na istniejącej mapie
5. **UI** - panele i widoki

---

## Inspiracje

- **Dwarf Fortress**: Proceduralna generacja historii, kultur, religii
- **Crusader Kings**: System rodów, dynastii, relacji
- **World Anvil**: Struktura danych świata fantasy
- **Azgaar Fantasy Map Generator**: Integracja z mapą
