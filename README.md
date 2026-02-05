# Projects Center

Centrum zarządzania projektami GitHub Pages, oparte na monorepo **Nx**.

Projekt wykorzystuje nowoczesny stos technologiczny oraz architekturę **Feature-Sliced Design (FSD)** dla zapewnienia skalowalności i przejrzystości kodu.

## 🚀 Tech Stack

- **Monorepo Manager**: [Nx](https://nx.dev)
- **Framework**: [Nuxt 4](https://nuxt.com) / [Vue 3](https://vuejs.org)
- **UI Library**: [Vuetify 3](https://vuetifyjs.com)
- **State Management**: [Pinia](https://pinia.vuejs.org)
- **HTTP Client**: [Axios](https://axios-http.com)
- **Architecture**: [Feature-Sliced Design (FSD)](https://feature-sliced.design)
- **Styling**: Sass/SCSS
- **Code Quality**: [ESLint](https://eslint.org), [Prettier](https://prettier.io)
- **Language**: TypeScript (wsparcie dla TSX)

## 📁 Struktura Projektu

Projekt zorganizowany jest jako monorepo **Nx** z nowoczesną strukturą **FSD (Feature-Sliced Design)** oddzielającą komponenty Vue od frameworku.

### Główne Katalogi

- **`apps/`** - Aplikacje (rpg-tools, main-page, yarn-chaos)
- **`libs/`** - Biblioteki i moduły, zorganizowane według FSD

### Struktura libs/ (FSD)

```
libs/
├── features/vue/           # Komponenty logiki biznesowej
│   ├── card-delete/
│   ├── card-edit/
│   ├── rpg-map-generator/
│   └── ...
├── entities/vue/           # Modele danych i ich komponenty
│   └── card/
├── widgets/vue/            # Reużywalne komponenty UI
│   └── card-grid/
├── stores/vue/             # Pinia stores
│   └── map-generator/
└── shared/                 # Utilities niezależne od frameworku
    ├── gddb/               # Google Sheets client library
    ├── map-generator/
    ├── world-generator/
    └── *.ts                # Utility files (voronoi, perlin-noise, logger, itd.)
```

### Koncepcja Struktury

- **Separacja Frameworków**: Vue komponenty w `/vue/`, gotowe do dodania `/react/` lub `/svelte/` w przyszłości
- **Path Mappings**: Wszystkie importy używają `@shared/*` – fizyczne lokalizacje zmapowane w `tsconfig.base.json`
- **Modułowe**: Każda biblioteka ma własny `project.json`, `index.ts` (barrel exports), i właściwe zagrody
- **FSD Standard**: Każdy scope (features/entities/widgets/stores) ma się taką samą strukturę

### Przykład Importu

```typescript
// Kod w aplikacji
import type { Card } from '@shared/entities/card';
import { useCardStore } from '@shared/entities/card/lib/useCardStore';
import CardForm from '@shared/features/card-edit/ui/CardForm.vue';

// Path mappings rozwiązują na:
// - libs/entities/vue/card/index.ts
// - libs/entities/vue/card/lib/useCardStore.ts
// - libs/features/vue/card-edit/ui/CardForm.vue
```

### Tworzenie Nowych Bibliotek

Szczegółowe instrukcje znajdują się w [`.agent/rules/library-creation-guide.md`](.agent/rules/library-creation-guide.md).

Szybki przegląd:
- **Feature**: `libs/features/vue/[name]/` - logika + komponenty
- **Entity**: `libs/entities/vue/[name]/` - typy + store + UI
- **Widget**: `libs/widgets/vue/[name]/` - komponenty uniwersalne
- **Store**: `libs/stores/vue/[name]/` - Pinia store
- **Utility**: `libs/shared/[name]/` - funkcje niezależne od Vue

## 🛠️ Setup

Zainstaluj zależności:

```bash
yarn install
```

## 💻 Development

Uruchom serwer deweloperski aplikacji głównej:

```bash
yarn dev
# lub bezpośrednio przez nx
nx serve projects-center
```

Serwer będzie dostępny pod adresem `http://localhost:3000`.

## 🏗️ Production

Zbuduj aplikację dla produkcji:

```bash
yarn build
```

Podgląd buildu lokalnie:

```bash
yarn preview
```

## 📊 Narzędzia Nx

Nx oferuje zaawansowane narzędzia do zarządzania monorepo:

```bash
# Wyświetl graf zależności projektów
yarn graph

# Uruchom build dla wszystkich projektów
yarn build:all

# Sprawdź zmiany (affected)
yarn affected
```

## 🧹 Code Quality

```bash
# Lintowanie (wszystkie projekty)
yarn lint

# Automatyczna naprawa błędów linta
yarn lint:fix

# Formatowanie kodu (Prettier)
yarn format

# Sprawdzenie formatowania
yarn format:check
```

## 📚 Dostępne Biblioteki

### GDDB - Google Sheets Data Client

Biblioteka do pobierania danych z publicznych Google Sheets bez authentication.

**Lokalizacja**: `libs/shared/gddb/`

**Podstawowe użycie**:
```typescript
import { initGddb, getSheet } from '@shared/lib/gddb';

// Inicjalizacja (jeśli config sheet istnieje)
await initGddb('https://docs.google.com/spreadsheets/d/...');

// Pobranie arkusza
const data = await getSheet('data');

// Z zaawansowanymi opcjami
const filtered = await getSheet('data', {
  where: "Age > 18",
  orderBy: "Name asc",
  limit: 10
});
```

Pełna dokumentacja: [libs/shared/gddb/README.md](libs/shared/gddb/README.md)

### RPG Generators

- **Map Generator**: Proceduralne generowanie map RPG
  - Lokalizacja: `libs/shared/map-generator/` (utilities) + `libs/features/vue/rpg-map-generator/` (komponenty)
  - Aplikacja: `apps/rpg-tools/` → Map Generator

- **World Generator**: Tworzenie kompletnych światów fantasy
  - Lokalizacja: `libs/shared/world-generator/` (utilities) + `libs/features/vue/rpg-world-generator/` (komponenty)
  - Aplikacja: `apps/rpg-tools/` → World Generator

### Fabula Ultima Card Manager

Generator i manager kart do gry Fabula Ultima.

**Komponenty**: `libs/features/vue/card-*` (edit, delete, list, preview, print)
**Model**: `libs/entities/vue/card/`
**Aplikacja**: `apps/rpg-tools/` → Card Generator

## 🤖 AI Rules & Guidelines

Projekt zawiera konfiguracje dla AI assistants:

- **`code-style-guide.md`**: Szczegółowe wytyczne architektury FSD i pattern'y kodowania
- **`library-creation-guide.md`**: Krok-po-kroku instrukcje tworzenia nowych bibliotek
- **`basic.md`**: Ogólne reguły (komunikacja, veryfikacja)

Przeczytaj `library-creation-guide.md` przed tworzeniem nowych bibliotek!
