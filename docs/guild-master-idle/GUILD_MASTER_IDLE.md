# Guild Master Idle

## Opis projektu

Guild Master Idle to gra typu idle/incremental, w której gracz zarządza gildią bohaterów w świecie fantasy. Rekrutuj wojowników, magów, łowców i kapłanów, wysyłaj ich na misje, zdobywaj złoto i rozwijaj swoją gildię do rangi legendarnej.

## Stack technologiczny

| Technologia | Wersja | Rola |
|---|---|---|
| Vue 3 | ^3.5 | Framework UI |
| Nuxt | ^4.1 | Framework SSR / SSG |
| Vuetify | ^3.10 | Biblioteka komponentów UI |
| Pinia | ^3.0 | State management |
| TypeScript | ^5.9 | Typowanie |

## Struktura projektu

```
apps/guild-master-idle/
├── assets/
│   └── styles/
│       └── main.scss          # Globalne style
├── components/                # Komponenty Vue
├── composables/               # Composables (logika wielokrotnego użytku)
├── layouts/
│   └── default.vue            # Domyślny layout
├── pages/
│   └── index.vue              # Strona główna
├── plugins/
│   ├── vuetify.ts             # Konfiguracja Vuetify
│   └── pinia-persist.ts       # Persistencja stanu gry
├── stores/                    # Pinia stores (stan gry)
├── public/                    # Pliki statyczne
├── app.vue                    # Root component
├── nuxt.config.ts             # Konfiguracja Nuxt
├── project.json               # Konfiguracja Nx
└── tsconfig.json              # Konfiguracja TypeScript
```

## Uruchamianie

```bash
# Development (port 3006)
yarn dev:guild-master-idle

# Build
yarn build:guild-master-idle

# Via Nx
nx run guild-master-idle:dev
nx run guild-master-idle:build
```

## Deployment

Aplikacja jest deployowana automatycznie na GitHub Pages poprzez workflow CI/CD.
Base URL: `/projects-center/guild-master-idle/`

## Roadmap

### Faza 1 - Fundament

- [x] Scaffold projektu (Nuxt + Vue 3 + Vuetify)
- [ ] System złota (generowanie idle)
- [ ] Podstawowy store gry (Pinia + persistencja)
- [ ] Rekrutacja bohaterów (4 klasy: Wojownik, Mag, Łowca, Kapłan)
- [ ] System poziomów bohaterów

### Faza 2 - Mechaniki gildii

- [ ] Rozbudowa gildii (poziomy, bonusy)
- [ ] System misji (wysyłanie bohaterów, czas trwania, nagrody)
- [ ] Ekwipunek i przedmioty
- [ ] System statystyk bohaterów (siła, inteligencja, zręczność, wiara)

### Faza 3 - Zaawansowane mechaniki

- [ ] Drzewo umiejętności gildii
- [ ] Specjalne eventy i bossowie
- [ ] System prestige / reinkarnacji
- [ ] Osiągnięcia i odznaki

### Faza 4 - Polski i UX

- [ ] Animacje i efekty wizualne
- [ ] Tutorial dla nowych graczy
- [ ] Balans ekonomii gry
- [ ] Responsywność mobilna
- [ ] Optymalizacja wydajności

## Architektura stanu gry

```
GameStore (Pinia)
├── gold              # Waluta główna
├── guild             # Dane gildii (poziom, EXP, bonusy)
├── heroes[]          # Lista bohaterów
│   ├── id, name, class
│   ├── level, exp
│   ├── stats (str, int, dex, faith)
│   └── equipment[]
├── quests[]          # Aktywne misje
│   ├── id, name, difficulty
│   ├── duration, timeLeft
│   ├── assignedHeroes[]
│   └── rewards
└── inventory[]       # Przedmioty w ekwipunku
```

## Konwencje

- Komponenty: PascalCase (`HeroCard.vue`, `QuestPanel.vue`)
- Composables: camelCase z prefiksem `use` (`useGameLoop.ts`, `useHeroes.ts`)
- Stores: camelCase z prefiksem `use` i sufiksem `Store` (`useGameStore.ts`)
- Style: SCSS z BEM dla custom komponentów, Vuetify utility classes gdzie możliwe
