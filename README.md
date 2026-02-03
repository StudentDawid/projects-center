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

Projekt zorganizowany jest jako monorepo Nx:

- `apps/` - Aplikacje (główna aplikacja `projects-center`).
- `libs/` - Biblioteki i reużywalne moduły.
- `app/` - Kod źródłowy aplikacji zgodnie z FSD:
  - `features/` - Logika biznesowa i komponenty specyficzne dla funkcjonalności.
  - `entities/` - Encje biznesowe (typy, modele, store'y).
  - `shared/` - Generyczne komponenty, utility, UI kit.
  - `pages/` - Tylko routing i kompozycja układów.

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
