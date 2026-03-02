# RPG Card Generator — Plan implementacji

> **Cel dokumentu:** Instrukcja krok-po-kroku dla LLMa, aby zaimplementował projekt `rpg-card-generator` wewnątrz istniejącego monorepo NX.

---

## 1. Kontekst monorepo

| Element | Wartość |
|---|---|
| Manager pakietów | `yarn@1.22` (workspace root) |
| Monorepo tool | NX (`nx.json`) |
| Framework | Nuxt 4 + Vue 3 + Vuetify 3 |
| State management | Pinia 3 + `pinia-plugin-persistedstate` |
| Język | TypeScript (strict) |
| Linter | ESLint 9 + `@nuxt/eslint` |
| Style | SCSS |
| Ikony | `@mdi/font` (Material Design Icons) |
| Build target | GitHub Pages (`nitro preset: github-pages`) |
| SSR | **Wyłączony** (`ssr: false`) |

### Istniejące porty dev-server

| Projekt | Port |
|---|---|
| mtg-generator | 3002 |
| rpg-tools | 3003 |
| **rpg-card-generator** | **3004** (nowy) |

---

## 2. Struktura katalogów do stworzenia

```
apps/rpg-card-generator/
├── app.vue
├── nuxt.config.ts
├── project.json
├── tsconfig.json
├── eslint.config.mjs
├── assets/
│   └── styles/
│       └── main.scss
├── plugins/
│   ├── vuetify.ts
│   └── pinia-persist.ts
├── layouts/
│   └── default.vue
├── pages/
│   ├── index.vue              # Strona główna — lista kart
│   ├── create/
│   │   └── index.vue          # Tworzenie / edycja karty
│   └── export/
│       └── index.vue          # Strona eksportu / druku
├── components/
│   ├── card/
│   │   ├── CardCanvas.vue     # Główny canvas karty — renderowanie przodu i tyłu
│   │   ├── CardPreview.vue    # Miniaturka podglądu karty
│   │   ├── CardElement.vue    # Element na karcie: tekst, obraz, shape
│   │   └── CardBack.vue       # Rendering tyłu karty
│   ├── editor/
│   │   ├── EditorToolbar.vue  # Toolbar z akcjami (dodaj tekst, dodaj obraz, etc.)
│   │   ├── ElementPanel.vue   # Panel właściwości zaznaczonego elementu
│   │   ├── SizeSelector.vue   # Wybór formatu karty (MTG, Tarot, custom)
│   │   ├── TemplateSelector.vue # Wybór predefiniowanego szablonu
│   │   └── BackgroundPicker.vue # Wybór tła i tyłu karty
│   ├── export/
│   │   ├── PrintLayout.vue    # Podgląd rozkładu kart na kartce
│   │   ├── PageSizeSelector.vue # Wybór rozmiaru kartki (A4, Letter, custom)
│   │   └── ExportActions.vue  # Przyciski: export PDF, drukuj
│   └── shared/
│       ├── AppNavbar.vue      # Nawigacja (górny nav-bar)
│       └── ConfirmDialog.vue  # Dialog potwierdzenia
├── composables/
│   ├── useCardEditor.ts       # Logika edytora karty
│   ├── useCardExport.ts       # Logika eksportu i druku
│   └── usePrintLayout.ts     # Obliczanie layoutu druku (ile kart na kartkę, duplex)
├── stores/
│   └── cards.ts               # Pinia store — CRUD kart
├── types/
│   ├── card.ts                # Interfejsy: Card, CardElement, CardTemplate, CardSize
│   └── export.ts              # Interfejsy: ExportSettings, PageSize
├── data/
│   ├── templates.ts           # Predefiniowane szablony kart (MTG-style, D&D spell, etc.)
│   ├── backgrounds.ts         # Predefiniowane tła i tyły kart
│   └── sizes.ts               # Predefiniowane rozmiary kart
└── public/
    ├── favicon.ico
    └── backgrounds/           # Pliki graficzne predefiniowanych teł
        ├── mtg-frame.png
        ├── dnd-spell.png
        ├── parchment.jpg
        ├── dark-leather.jpg
        └── card-back-default.png
```

---

## 3. Konfiguracja projektu (boilerplate)

### 3.1 `project.json`

```json
{
  "name": "rpg-card-generator",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "projectType": "application",
  "sourceRoot": "apps/rpg-card-generator",
  "targets": {
    "build": {
      "executor": "nx:run-commands",
      "outputs": ["{workspaceRoot}/dist/apps/rpg-card-generator"],
      "options": {
        "command": "nuxt generate && mkdir -p ../../dist/apps/rpg-card-generator && cp -R .output/public/. ../../dist/apps/rpg-card-generator/",
        "cwd": "apps/rpg-card-generator"
      }
    },
    "dev": {
      "executor": "nx:run-commands",
      "options": {
        "command": "nuxt dev --port 3004 --host 127.0.0.1",
        "cwd": "apps/rpg-card-generator"
      }
    },
    "preview": {
      "executor": "nx:run-commands",
      "options": {
        "command": "nuxt preview",
        "cwd": "apps/rpg-card-generator"
      }
    },
    "prepare": {
      "executor": "nx:run-commands",
      "options": {
        "command": "nuxi prepare",
        "cwd": "apps/rpg-card-generator"
      }
    }
  },
  "tags": ["type:app", "framework:nuxt"]
}
```

### 3.2 `nuxt.config.ts`

```ts
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineNuxtConfig({
  alias: {
    '@rpg-card-generator': join(__dirname, './'),
  },
  compatibilityDate: '2026-02-03',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', '@nuxt/eslint'],
  plugins: ['~/plugins/vuetify.ts', '~/plugins/pinia-persist.ts'],
  pinia: {
    storesDirs: ['./stores/**'],
  },
  components: {
    global: true,
    dirs: ['~/components'],
  },
  ssr: false,
  devServer: {
    host: '127.0.0.1',
    port: 3004,
  },

  nitro: {
    preset: 'github-pages',
  },

  vite: {
    server: {
      hmr: {
        protocol: 'ws',
        host: '127.0.0.1',
        port: 4204,
      },
    },
    define: {
      'process.env.DEBUG': false,
    },
    ssr: {
      noExternal: ['vuetify'],
    },
    plugins: [
      {
        name: 'app-manifest-stub',
        resolveId(id) {
          if (id === '#app-manifest') return id;
          return null;
        },
        load(id) {
          if (id === '#app-manifest') return 'export default {};';
          return null;
        },
      },
    ],
  },
  imports: {
    autoImport: true,
  },
  css: [
    'vuetify/lib/styles/main.sass',
    '@mdi/font/css/materialdesignicons.css',
    '~/assets/styles/main.scss',
  ],
  build: {
    transpile: ['vuetify'],
  },
  app: {
    baseURL: '/projects-center/rpg-card-generator/',
    head: {
      title: 'RPG Card Generator',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Generator kart RPG — twórz własne karty umiejętności, lokacji, zadań i więcej.',
        },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/projects-center/favicon.ico' },
        {
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css',
        },
      ],
    },
  },
});
```

### 3.3 Pliki wspólne (identyczne jak w `rpg-tools`)

Skopiuj 1:1 z `apps/rpg-tools/`:

| Plik | Uwagi |
|---|---|
| `plugins/vuetify.ts` | Bez zmian |
| `plugins/pinia-persist.ts` | Bez zmian |
| `app.vue` | Bez zmian (NuxtLayout + NuxtPage) |
| `eslint.config.mjs` | Bez zmian |
| `tsconfig.json` | Zmień `outDir` na `../../dist/apps/rpg-card-generator` |
| `assets/styles/main.scss` | Bazowy — można rozbudować |

### 3.4 `layouts/default.vue`

```vue
<template>
  <v-app :theme="currentTheme">
    <AppNavbar />
    <v-main>
      <v-container fluid class="pa-4">
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const currentTheme = ref('dark');
</script>
```

### 3.5 Dodaj do root `package.json` scripts

```json
"dev:rpg-card-generator": "nx run rpg-card-generator:dev",
"build:rpg-card-generator": "nx build rpg-card-generator"
```

---

## 4. Typy danych (`types/`)

### 4.1 `types/card.ts`

```ts
export interface CardSize {
  id: string;
  name: string;           // np. "MTG Standard", "Tarot"
  widthMm: number;        // szerokość w mm
  heightMm: number;       // wysokość w mm
  widthInch: number;      // szerokość w calach
  heightInch: number;     // wysokość w calach
}

export interface CardTextElement {
  id: string;
  type: 'text';
  content: string;
  x: number;              // pozycja X w % (0-100)
  y: number;              // pozycja Y w % (0-100)
  width: number;          // szerokość w % (0-100)
  height: number;         // wysokość w % (0-100)
  fontSize: number;       // w pt
  fontFamily: string;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textAlign: 'left' | 'center' | 'right';
  color: string;          // hex
  rotation: number;       // stopnie
  zIndex: number;
}

export interface CardImageElement {
  id: string;
  type: 'image';
  src: string;            // base64 lub URL
  x: number;
  y: number;
  width: number;
  height: number;
  objectFit: 'cover' | 'contain' | 'fill';
  rotation: number;
  zIndex: number;
  opacity: number;        // 0-1
}

export type CardElement = CardTextElement | CardImageElement;

export interface CardBackground {
  id: string;
  name: string;
  type: 'color' | 'gradient' | 'image';
  value: string;          // hex, CSS gradient, lub URL/base64
}

export interface CardTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;      // URL podglądu
  size: CardSize;
  background: CardBackground;
  backBackground: CardBackground;
  elements: CardElement[]; // Predefiniowane elementy szablonu
}

export interface Card {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  size: CardSize;
  background: CardBackground;
  backBackground: CardBackground;
  elements: CardElement[];
  templateId: string | null; // null jeśli karta custom
}
```

### 4.2 `types/export.ts`

```ts
export interface PageSize {
  id: string;
  name: string;           // np. "A4", "Letter", "A3"
  widthMm: number;
  heightMm: number;
}

export interface ExportSettings {
  pageSize: PageSize;
  marginMm: number;       // margines w mm
  gapMm: number;          // odstęp między kartami w mm
  duplex: boolean;        // druk dwustronny
  cutLines: boolean;      // linie cięcia
  selectedCardIds: string[]; // ID kart do exortu
}

export interface PrintLayoutResult {
  pages: PrintPage[];
  totalPages: number;
  cardsPerPage: number;
}

export interface PrintPage {
  pageNumber: number;
  side: 'front' | 'back';
  cards: PrintCardPlacement[];
}

export interface PrintCardPlacement {
  cardId: string;
  x: number;              // pozycja X w mm
  y: number;              // pozycja Y w mm
  width: number;          // szerokość w mm
  height: number;         // wysokość w mm
}
```

---

## 5. Dane predefiniowane (`data/`)

### 5.1 `data/sizes.ts`

```ts
import type { CardSize } from '~/types/card';

export const CARD_SIZES: CardSize[] = [
  {
    id: 'mtg',
    name: 'MTG Standard (63 × 88 mm)',
    widthMm: 63,
    heightMm: 88,
    widthInch: 2.5,
    heightInch: 3.5,
  },
  {
    id: 'tarot',
    name: 'Tarot (70 × 120 mm)',
    widthMm: 70,
    heightMm: 120,
    widthInch: 2.76,
    heightInch: 4.72,
  },
  {
    id: 'poker',
    name: 'Poker (63.5 × 89 mm)',
    widthMm: 63.5,
    heightMm: 89,
    widthInch: 2.5,
    heightInch: 3.5,
  },
  {
    id: 'mini',
    name: 'Mini Card (44 × 63 mm)',
    widthMm: 44,
    heightMm: 63,
    widthInch: 1.73,
    heightInch: 2.48,
  },
  {
    id: 'square',
    name: 'Square (70 × 70 mm)',
    widthMm: 70,
    heightMm: 70,
    widthInch: 2.76,
    heightInch: 2.76,
  },
];
```

### 5.2 `data/templates.ts`

Zdefiniuj minimum **4 szablony**:

1. **MTG Style** — ramka w stylu MTG, miejsca na: tytuł (góra), ilustrację (środek), typ (linia pod ilustracją), tekst opisu (dół), mana cost (prawy górny róg), power/toughness (prawy dolny róg)
2. **D&D Spell Card** — nagłówek z nazwą, poziom/szkoła poniżej, czas rzucania, zasięg, komponenty, czas trwania, pole opisu
3. **Location Card** — duża ilustracja jako tło, tytuł na dole z gradientem, krótki opis
4. **Quest Card** — tytuł, opis, nagroda, poziom trudności

Każdy szablon powinien mieć predefiniowane `CardElement[]` z pozycjami w %, ustawionymi fontami i kolorami, oraz `placeholder` teksty (np. "Nazwa karty", "Opis...").

### 5.3 `data/backgrounds.ts`

Minimum **6 teł** (front) i **4 tyły** kart:

**Fronty:**
- Parchment (jasny pergamin)
- Dark Leather (ciemna skóra)
- Stone texture
- MTG Frame (ramka w stylu MTG)
- D&D Spell border
- Solid color (domyślny)

**Tyły:**
- Classic card back (ornament)
- Minimalist (logo/symbol)
- Parchment back
- Dark back

> **WAŻNE:** Pliki graficzne powinny być generowane/dobrane i umieszczone w `public/backgrounds/`. Na start mogą to być placeholdery lub proste CSS gradienty z fallbackiem.

---

## 6. Store Pinia (`stores/cards.ts`)

```ts
import { defineStore } from 'pinia';
import type { Card } from '~/types/card';

export const useCardsStore = defineStore('rpg-cards', {
  state: () => ({
    cards: [] as Card[],
    currentEditId: null as string | null,
  }),

  getters: {
    allCards: (state) => state.cards,
    currentCard: (state) => state.cards.find(c => c.id === state.currentEditId) ?? null,
    cardById: (state) => (id: string) => state.cards.find(c => c.id === id),
  },

  actions: {
    addCard(card: Card) {
      this.cards.push(card);
    },
    updateCard(id: string, updates: Partial<Card>) {
      const idx = this.cards.findIndex(c => c.id === id);
      if (idx !== -1) {
        this.cards[idx] = { ...this.cards[idx], ...updates, updatedAt: Date.now() };
      }
    },
    deleteCard(id: string) {
      this.cards = this.cards.filter(c => c.id !== id);
    },
    duplicateCard(id: string) {
      const card = this.cards.find(c => c.id === id);
      if (card) {
        const clone: Card = {
          ...JSON.parse(JSON.stringify(card)),
          id: crypto.randomUUID(),
          name: `${card.name} (kopia)`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        this.cards.push(clone);
      }
    },
    setCurrentEdit(id: string | null) {
      this.currentEditId = id;
    },

    // Elementy na karcie
    addElement(cardId: string, element: CardElement) { /* ... */ },
    updateElement(cardId: string, elementId: string, updates: Partial<CardElement>) { /* ... */ },
    removeElement(cardId: string, elementId: string) { /* ... */ },
  },

  persist: {
    key: 'rpg-card-generator-cards',
    storage: localStorage,
  },
});
```

---

## 7. Strony — szczegółowa specyfikacja

### 7.1 Strona główna (`pages/index.vue`) — Lista kart

**Layout:**
- Górny pasek: tytuł "RPG Card Generator" + przycisk "Nowa karta"
- Filtrowanie/sortowanie (opcjonalne): po nazwie, dacie, rozmiarze
- Grid z miniaturkami kart (`v-row` / `v-col` responsive)
- Każda karta jako `CardPreview.vue` z akcjami: edytuj, duplikuj, usuń
- Przycisk FAB "Nowa karta" → nawiguje do `/create`
- Przycisk "Eksportuj zaznaczone" → nawiguje do `/export` (z zaznaczonymi kartami)

**Emptystate:** Gdy brak kart — komunikat zachęcający do stworzenia pierwszej karty + duży przycisk CTA.

**Technologia:** `v-card` w `v-col` z responsive grid. Miniaturka karty renderowana w skalowanym `<div>` z `transform: scale()`.

### 7.2 Strona tworzenia karty (`pages/create/index.vue`) — Edytor

**Layout trójkolumnowy (desktop):**

```
┌──────────────┬─────────────────────────────┬──────────────────┐
│  Panel lewy  │      Podgląd karty          │  Panel prawy     │
│  (narzędzia) │    (przód / tył toggle)      │  (właściwości)   │
│              │                             │                  │
│ - Dodaj tekst│  ┌─────────────────────┐    │ Nazwa karty      │
│ - Dodaj obraz│  │                     │    │ Rozmiar: [MTG ▾] │
│ - Szablony   │  │   CANVAS KARTY      │    │ Tło: [picker]    │
│ - Tła        │  │   (interaktywny)    │    │ Tył: [picker]    │
│ - Rozmiar    │  │                     │    │                  │
│              │  └─────────────────────┘    │ --- Zaznaczony   │
│              │   [Przód] [Tył]             │ element ---      │
│              │                             │ Pozycja X/Y      │
│              │                             │ Rozmiar W/H      │
│              │                             │ Font, kolor, etc │
└──────────────┴─────────────────────────────┴──────────────────┘
```

**Na mobile:** Panele jako wysuwalny drawer / bottom sheet.

**Funkcjonalności:**
1. **Wybór rozmiaru karty** — dropdown z predefiniowanymi (`CARD_SIZES`) + opcja "Custom" z polami width/height
2. **Wybór szablonu** — dialog/drawer z podglądami szablonów; wybranie szablonu nadpisuje tło, back i dodaje predefiniowane elementy
3. **Dodawanie tekstu** — klik "Dodaj tekst" tworzy nowy `CardTextElement` z domyślnymi wartościami. Zaznaczenie elementu na canvas otwiera panel właściwości: font, rozmiar, kolor, wyrównanie, bold/italic
4. **Dodawanie obrazu** — upload z dysku (FileReader → base64) lub wklejenie URL. Element `CardImageElement` z opcjami: object-fit, opacity
5. **Drag & drop** na canvas — elementy przesuwalne i skalowalne (implementacja przez `mousedown/mousemove/mouseup` events lub biblioteka typu `vue-draggable-resizable`)
6. **Tło karty** — wybór z predefiniowanych LUB upload własnego LUB kolor/gradient picker
7. **Tył karty** — osobny widok z oddzielnym tłem i elementami
8. **Toggle przód/tył** — przełączanie widoku canvas
9. **Zapis** — automatyczny zapis do Pinia store (debounced) + przycisk "Zapisz"
10. **Nawigacja** — query param `?id=xxx` do edycji istniejącej karty

**Canvas karty (`CardCanvas.vue`):**
- Renderowany jako `<div>` z odpowiednimi proporcjami (aspect-ratio z `CardSize`)
- Skalowany `transform: scale()` aby zmieścić się w dostępnej przestrzeni
- Elementy pozycjonowane absolutnie wewnątrz kontenera
- Tryb edycji: kliknięcie zaznacza element, ramka resize'u
- Tryb podglądu: bez interakcji

### 7.3 Strona eksportu (`pages/export/index.vue`) — Print layout

**Główne elementy UI:**
1. **Selektor kart** — lista checkboxów z miniaturkami kart do eksportu
2. **Ustawienia strony:**
   - Rozmiar kartki: A4 (domyślne), A3, Letter, Custom
   - Margines (mm)
   - Odstęp między kartami (mm)
   - Druk dwustronny (toggle)
   - Linie cięcia (toggle)
3. **Podgląd rozkładu** — wizualny podgląd jak karty będą ułożone na kartce
4. **Przyciski:** "Eksportuj PDF", "Drukuj"

**Algorytm rozkładu kart (`usePrintLayout.ts`):**

```
Input: selectedCards[], pageSize, marginMm, gapMm, duplex

1. Oblicz dostępny obszar: 
   availableW = pageSize.widthMm - 2 * marginMm
   availableH = pageSize.heightMm - 2 * marginMm

2. Dla danego rozmiaru karty oblicz:
   cols = floor((availableW + gapMm) / (cardWidth + gapMm))
   rows = floor((availableH + gapMm) / (cardHeight + gapMm))
   cardsPerPage = cols * rows

3. Wygeneruj strony frontów
4. Jeśli duplex:
   - Dla każdej strony frontów wygeneruj lustrzaną stronę tyłów
   - WAŻNE: Karty na stronie tyłów muszą być odwrócone lustrzanio w osi X,
     aby po dwustronnym drukowaniu przód odpowiadał tyłowi.
     Tzn. karta w kolumnie 0 frontu → kolumna (cols-1) na stronie tyłu.
```

**Eksport PDF:**
- Użyj `window.print()` z dedykowanym `@media print` CSS
- LUB biblioteki `html2canvas` + `jspdf` do generowania PDF client-side
- Rekomendacja: `window.print()` jako prostsze rozwiązanie, z `@media print` ukrywającym UI i pokazującym tylko karty

---

## 8. Komponenty — kluczowe wytyczne

### `AppNavbar.vue`
- `v-app-bar` z nawigacją: Home, Nowa Karta, Eksport
- Logo/tytuł po lewej
- `v-btn` z `to="/"`, `to="/create"`, `to="/export"`

### `CardPreview.vue`
- Props: `card: Card`, `scale: number`
- Renderuje miniaturkę karty w skalowanym kontenerze
- Hover: overlay z akcjami (edytuj, duplikuj, usuń)

### `CardCanvas.vue`
- Props: `card: Card`, `side: 'front' | 'back'`, `editable: boolean`
- Kontener z `aspect-ratio` karty
- Renderuje `CardElement` dla każdego elementu
- W trybie `editable`: zaznaczanie, drag, resize

### `CardElement.vue`
- Props: `element: CardElement`, `editable: boolean`
- Dynamicznie renderuje tekst lub obraz w zależności od `element.type`
- W trybie `editable`: obsługa `mousedown` dla drag

### `TemplateSelector.vue`
- Dialog z griddem szablonów
- Kliknięcie szablonu → emit eventu z `CardTemplate`
- Podgląd jak będzie wyglądać karta po zastosowaniu szablonu

### `PrintLayout.vue`
- Props: `cards: Card[]`, `settings: ExportSettings`
- Renderuje wizualny podgląd stron do druku
- Podgląd skalowany do ekranu
- `@media print` — renderuje w rzeczywistych wymiarach (mm)

---

## 9. Stylowanie

### Paleta kolorów (dark theme)
- **Primary:** `#7C4DFF` (deep purple accent)
- **Secondary:** `#FF6E40` (deep orange accent)
- **Surface:** `#1E1E2E`
- **Background:** `#121218`
- **Card surfaces:** `#2A2A3E`

### Wytyczne UI
- Vuetify 3 komponenty wszędzie (v-card, v-btn, v-dialog, v-select, v-text-field, v-color-picker, v-slider)
- Animacje: hover transitions na kartach, smooth panel open/close
- Responsive: mobile-first, drawer zamiast side-panels na małych ekranach
- Typografia: domyślna Vuetify (Roboto) dla UI; Google Fonts (np. Cinzel, MedievalSharp) dostępne w edytorze kart

---

## 10. Composables — implementacja kluczowej logiki

### `useCardEditor.ts`
```ts
// Odpowiada za:
// - getActiveCard() — pobiera kartę z store
// - addTextElement() — dodaje nowy tekst z defaults
// - addImageElement(file: File) — konwertuje na base64, dodaje
// - selectElement(id) / deselectAll()
// - moveElement(id, deltaX, deltaY)
// - resizeElement(id, newW, newH)
// - deleteElement(id)
// - applyTemplate(template: CardTemplate)
// - setBackground(bg: CardBackground)  
// - setBackBackground(bg: CardBackground)
// - saveCard() — debounced zapis do store
```

### `useCardExport.ts`
```ts
// Odpowiada za:
// - generatePrintLayout(cards, settings) → PrintLayoutResult
// - exportToPdf() — generuje PDF
// - print() — window.print() z odpowiednim stylowaniem
```

### `usePrintLayout.ts`
```ts
// Czysto obliczeniowy composable:
// - calculateLayout(cards, pageSize, margin, gap, duplex) → PrintLayoutResult
// - Algorytm z sekcji 7.3
```

---

## 11. Kolejność implementacji (fazy)

### Faza 1: Scaffold (boilerplate)
1. Utwórz katalog `apps/rpg-card-generator/` ze wszystkimi plikami konfiguracyjnymi (sekcja 3)
2. Dodaj skrypty do root `package.json`
3. Utwórz `types/`, `data/`, `stores/`
4. Zweryfikuj: `yarn run dev:rpg-card-generator` startuje bez błędów

### Faza 2: Typy i store
1. Zaimplementuj `types/card.ts` i `types/export.ts`
2. Zaimplementuj `stores/cards.ts` (pełny CRUD)
3. Zaimplementuj `data/sizes.ts`, `data/templates.ts`, `data/backgrounds.ts`

### Faza 3: Strona główna
1. `AppNavbar.vue` — nawigacja  
2. `CardPreview.vue` — miniaturka karty
3. `pages/index.vue` — grid kart z akcjami, empty state

### Faza 4: Edytor kart
1. `CardCanvas.vue` — renderowanie karty
2. `CardElement.vue` — renderowanie elementów
3. `EditorToolbar.vue` — toolbar akcji
4. `ElementPanel.vue` — panel właściwości
5. `SizeSelector.vue`, `TemplateSelector.vue`, `BackgroundPicker.vue`
6. `useCardEditor.ts` composable  
7. `pages/create/index.vue` — strona edytora

### Faza 5: Eksport i druk
1. `usePrintLayout.ts` — algorytm rozkładu
2. `PrintLayout.vue` — wizualny podgląd
3. `PageSizeSelector.vue`, `ExportActions.vue`
4. `useCardExport.ts` composable
5. `pages/export/index.vue` — strona eksportu
6. Style `@media print`

### Faza 6: Polish
1. Animacje i transitions
2. Responsywność (mobile drawers)
3. Error handling i walidacja
4. Predefiniowane grafiki (tła i tyły kart)

---

## 12. Uwagi techniczne

1. **Drag & Resize elementów:** Zaimplementuj wprost (`mousedown`/`mousemove`/`mouseup` + `touchstart`/`touchmove`/`touchend`) lub użyj jednej z lekkich bibliotek. NIE używaj `vuedraggable` — to jest do sortowania list. Szukaj `vue3-draggable-resizable` lub podobnych.

2. **Obrazy:** Przechowywane jako base64 w localStorage. Uwaga na limit ~5MB localStorage. Dla dużych projektów rozważ IndexedDB, ale na start localStorage wystarczy.

3. **Eksport PDF:** `window.print()` jest najprostsze i daje najlepszą jakość. Dodaj oddzielny CSS `@media print` który:
   - Ukrywa UI (navbar, toolbary)
   - Ustawia `@page { size: A4; margin: 0; }`
   - Renderuje karty w dokładnych wymiarach (mm)

4. **Duplex mirror:** Przy drukowaniu dwustronnym, strona z tyłami kart MUSI mieć karty w odwrotnej kolejności kolumn (lustrzane odbicie w osi X), aby po złożeniu/cięciu przód pasował do tyłu.

5. **Fonts w kartach:** Załaduj Google Fonts dynamicznie (np. przez `@import` lub `link` w `head`) gdy użytkownik wybierze font niestandardowy.

6. **Nie dodawaj nowych zależności do `package.json`** bez uzasadnionej potrzeby. Vuetify, Pinia, Vue, Nuxt i ich ekosystem powinny wystarczyć.

---

## 13. Komendy weryfikacyjne

```bash
# Uruchom dev server
yarn run dev:rpg-card-generator

# Sprawdź lint
cd apps/rpg-card-generator && npx nuxi prepare && npx eslint .

# Sprawdź TypeScript
cd apps/rpg-card-generator && npx vue-tsc --noEmit

# Build (SSG)
yarn run build:rpg-card-generator
```
