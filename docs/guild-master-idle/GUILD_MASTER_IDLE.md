# Guild Master Idle

## Opis projektu

Guild Master Idle to gra typu idle/incremental, w której gracz zarządza gildią bohaterów w świecie fantasy. Rekrutuj wojowników, magów, łowców, kapłanów i złodziei — ulepszaj ich ekwipunek, wysyłaj na misje, zdobywaj złoto i rozwijaj swoją gildię do rangi legendarnej.

## Stack technologiczny

| Technologia | Wersja | Rola |
|---|---|---|
| Vue 3 | ^3.5 | Framework UI |
| Nuxt | ^4.1 | Framework SSR / SSG |
| Vuetify | ^3.10 | Biblioteka komponentów UI |
| Pinia | ^3.0 | State management |
| pinia-plugin-persistedstate | ^4.7 | Auto-save do localStorage |
| TypeScript | ^5.9 | Typowanie |
| SCSS | — | Stylowanie + CSS Custom Properties (motywy) |

## Struktura projektu

```
apps/guild-master-idle/
├── composables/
│   ├── useI18n.ts             # Wielojęzyczność (EN/PL)
│   ├── useSettings.ts         # Ustawienia użytkownika + loader
│   └── useTheme.ts            # System motywów (dzień/noc)
├── i18n/
│   ├── en.ts                  # Tłumaczenia angielskie
│   └── pl.ts                  # Tłumaczenia polskie
├── layouts/
│   └── default.vue            # Domyślny layout
├── pages/
│   └── index.vue              # Strona główna — cały UI gry
├── plugins/
│   ├── vuetify.ts             # Konfiguracja Vuetify
│   └── pinia-persist.ts       # Plugin persistencji Pinia
├── stores/
│   ├── useGameStore.ts        # Główny store gry (zasoby, bohaterowie, ulepszenia, osiągnięcia, ekwipunek)
│   └── useCombatStore.ts      # System walki (silnik, przeciwnicy, encounter'y)
├── app.vue                    # Root component z loading screen
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

---

## Systemy gry

### 1. Zasoby i Wydobycie

| Zasób | Opis |
|---|---|
| Gold | Główna waluta, generowana pasywnie i z handlu |
| Wood | Drewno — wydobywane w obozie drwali |
| Stone | Kamień — wydobywany w kamieniołomie |
| Metal | Metal — wydobywany w kopalni żelaza |
| Mana | Energia magiczna, regenerowana pasywnie |
| Metal Scraps | Okruchy metalu — z rozkładania przedmiotów |
| Magic Dust | Magiczny pył — z rozkładania przedmiotów |

**Wydobycie (Mining):**
- 3 kopalnie (Wood Camp, Quarry, Iron Mine) z poziomami i pracownikami
- Kliknięcie ręczne (manual mine) + pasywne wydobycie przez pracowników
- Ulepszanie kopalni zwiększa bazową produkcję i max pracowników

**Rynek (Market):**
- Sprzedaż drewna, kamienia i metalu za złoto
- Ceny rynkowe zmieniają się z czasem
- Ulepszenia Szlaków Handlowych poprawiają ceny

### 2. System Bohaterów

**5 klas bohaterów:**

| Klasa | Rola | Pozycja | Cecha specjalna |
|---|---|---|---|
| Warrior | Tank | FRONT | **Prowokacja** — 3x szansy na bycie zaatakowanym (aggro) |
| Mage | Burst DPS | BACK | **Fala Tajemna** — co 4. atak zadaje 2x obrażeń magicznych |
| Cleric | Healer | MIDDLE | **Leczenie** — co 3 tury przywraca 25% HP sojusznikowi z najniższym HP |
| Ranger | Sniper | BACK | **Precyzyjny Strzał** — ignoruje pozycję wroga, zawsze atakuje tylny rząd |
| Thief | Burst DPS | MIDDLE | **Cios z Cienia** — 30% szansy na podwójny atak w jednej turze |

**Statystyki walki (CombatStats):**
- `ATK` — atak fizyczny
- `DEF` — obrona fizyczna
- `M_ATK` — atak magiczny
- `M_DEF` — obrona magiczna
- `HP` / `currentHp` — punkty życia
- `SPD` — szybkość (wpływa na pasek akcji i szansę trafienia)
- `SPT` — preferowana pozycja (FRONT / MIDDLE / BACK)
- `STATE` — stan postaci (healthy, injured, poisoned, tired, seriously_injured)

**Statystyki gildyjne (GuildStats) — wspólne dla drużyny:**
- `CAP` — pojemność torby (sloty na przedmioty na wyprawę)
- `LCK` — szczęście (bonus do szansy na lepsze przedmioty)
- `TE` — efektywność treningu (mnożnik doświadczenia)

### 3. System Ekwipunku

**6 slotów na bohatera:** Prawa Ręka, Lewa Ręka, Pancerz, Hełm, Buty, Akcesorium

**5 poziomów rzadkości:**

| Rzadkość | Mnożnik statystyk | Bonusy losowe | Max poziom |
|---|---|---|---|
| Pospolity | 1x | 0 | 10 |
| Rzadki | 1.5x | 1 | 15 |
| Epicki | 2.5x | 2 | 25 |
| Legendarny | 5x | 3 | 50 |
| Boski | 10x | 4 | 100 |

**System Afiksów (losowe bonusy):**
- Ostrości (+ATK), Mądrości (+M_ATK), Twardości (+DEF), Odporności (+M_DEF)
- Wiatru (+SPD), Szczęścia (+LCK), Witalności (+HP)
- Przykład: *"Epicki Miecz Ostrości i Wiatru"*

**19 szablonów przedmiotów** w 6 kategoriach slotów (miecze, kostur, sztylet, tarcze, zbroje, hełmy, buty, akcesoria, itd.)

**Kowal (Blacksmith):**
- Ulepszanie poziomu przedmiotów za złoto + okruchy metalu + magiczny pył
- Koszt: `baseCost × 1.5^(level − 1)`
- Rozkładanie (Salvage) niechcianych przedmiotów na materiały

### 4. System Walki

**Mechanika Paska Akcji (Speed-based Ticks):**
- Walka w czasie rzeczywistym (ticki co 100ms)
- Każda postać ma pasek akcji napełniany wg `SPD × 0.6` na tick
- Gdy pasek osiągnie 100%, postać wykonuje akcję i pasek resetuje się
- Szybki złodziej (SPD 16) atakuje ~2.7x częściej niż wolny wojownik (SPD 6)

**System Celowania i Aggro (Threat):**
- Przeciwnicy atakują wg priorytetów pozycji: FRONT → MIDDLE → BACK
- W tej samej pozycji: atak na cel z najwyższym zagrożeniem (threat)
- Warrior z Prowokacją generuje 3x więcej threatu
- Śmierć tanka = przejście do następnego celu (zazwyczaj katastrofa)

**Matematyka obrażeń:**
```
Obrażenia fizyczne = ATK × (100 / (100 + DEF))
Obrażenia magiczne = M_ATK × (100 / (100 + M_DEF))
```

**Trafienie i unik:**
```
hitChance = 0.80 + (attackerSPD − targetSPD) × 0.02   [zakres: 0.50 – 0.95]
```

**Trafienie krytyczne:**
```
critChance = 0.05 + LCK × 0.01   [max: 0.50]
critDamage = 2.0×
```

**7 szablonów przeciwników:** Goblin, Gobliński Szaman, Ork Wojownik, Szkieletowy Mag, Mroczny Wilk, Kamienny Golem, Bandyta

**5 encounter'ów** o rosnącej trudności:
1. Obóz Goblinów (⭐1) — 30G
2. Mroczny Las (⭐2) — 60G
3. Zasadzka Bandytów (⭐3) — 100G
4. Krypta Nieumarłych (⭐4) — 150G
5. Jaskinia Golema (⭐5) — 250G + 40% szans na drop przedmiotu

### 5. Drzewo Ulepszeń

Hierarchiczny system ulepszeń z prereqami i kosztami:

```
Założenie Gildii (Row 0)
├── Kwatery Bohaterów (Row 1) ─── Plac Ćwiczeń (Row 3)
├── Licencja na Misje (Row 1) ─── Szlaki Handlowe (Row 3) ─── Skarbiec Gildii (Row 4)
├── Wieża Tajemna (Row 2) ───── Fortyfikacje (Row 4)
└── Wielka Sala Gildii (Row 5) — wymaga Skarbca + Fortyfikacji
```

Każde ulepszenie odblokowuje nowe mechaniki (nawigacja, sloty bohaterów, dochód, pojemności, itp.)

### 6. Ulepszenia Tawerny

- **Wynajmij Łóżko** — +1 slot na bohatera (5 poziomów, rosnące koszty)
- **Tablica Zleceń** — odblokowuje panel misji
- **Skrzynia Przechowywania** — +50 poj. drewna/kamienia, +25 metalu
- **Rozbudowa Magazynu** — +200 drewna/kamienia, +100 metalu, +5K złota

### 7. System Osiągnięć

15 osiągnięć w kategoriach:
- **Zasoby** — kamienie milowe wydobycia (drewno, kamień, metal, złoto)
- **Bohaterowie** — pierwszy rekrut, 3 bohaterów
- **Górnictwo** — pierwszy pracownik, ulepszenie kopalni
- **Rynek** — pierwsza sprzedaż

Każde osiągnięcie:
- Daje nagrody (złoto, pojemności, dochody, regenerację many, sloty bohaterów)
- Wyświetla popup z animacją po zdobyciu
- Może odblokować nowe elementy nawigacji (Misje, Kowal, Wielka Sala, itd.)

### 8. Persistencja i Zapis

- **Auto-save:** Pinia plugin `pinia-plugin-persistedstate` automatycznie zapisuje stan gry do `localStorage` pod kluczem `guild-master-save`
- **Auto-load:** Stan gry jest automatycznie przywracany przy ładowaniu strony
- **Ustawienia użytkownika:** Zapisywane oddzielnie w `guild-master-settings` (motyw, język)
- **Loading screen:** 800ms loading z logo gry, symulujący przyszłe ładowanie z backendu
- **Panel developerski:** W profilu — dodawanie zasobów, odblokowanie nawigacji, reset postępu

### 9. Wielojęzyczność i Motywy

- **2 języki:** angielski (EN) i polski (PL), przełączane w profilu
- **2 motywy:** dzienny i nocny, z pełnym systemem CSS Custom Properties
- Preferencje zapisywane w localStorage i odczytywane przed renderem UI

---

## Architektura stanu gry

```
useGameStore (Pinia) — persisted
├── resources         # Zasoby gracza (gold, wood, stone, metal, mana + max + income)
├── mining            # 3 kopalnie (level, workers, rates, clickAmount)
├── guildStats        # Wspólne statystyki gildii (cap, lck, te)
├── tavernHeroes[]    # Dostępni bohaterowie do rekrutacji
├── guildHeroes[]     # Zrekrutowani bohaterowie (stats, traits, equipment)
├── inventory[]       # Przedmioty w plecaku
├── metalScraps       # Okruchy metalu
├── magicDust         # Magiczny pył
├── maxHeroes         # Aktualna pojemność gildii
├── tavernUpgrades    # Łóżka + przedmioty tawerny
├── upgradeTree[]     # Drzewo ulepszeń (nodes z prereqami)
├── achievements[]    # System osiągnięć
├── unlockedNavs[]    # Odblokowane elementy nawigacji
├── rightSidebarUnlocked  # Flaga prawego sidebara
├── marketPrices      # Ceny rynkowe
├── stats             # Kumulatywne statystyki (total gathered, sales)
└── tickCount         # Licznik ticków pętli gry

useCombatStore (Pinia) — transient (nie zapisywany)
├── phase             # idle | selecting | fighting | victory | defeat
├── heroes[]          # Encje bohaterów w walce
├── enemies[]         # Encje przeciwników w walce
├── log[]             # Dziennik walki
├── speed             # Mnożnik prędkości (1x, 2x, 5x)
├── selectedHeroIds[] # Wybrani bohaterowie do drużyny
└── selectedEncounterId  # Wybrany encounter
```

## Konwencje

- **Composables:** camelCase z prefiksem `use` (`useI18n.ts`, `useTheme.ts`, `useSettings.ts`)
- **Stores:** camelCase z prefiksem `use` i sufiksem `Store` (`useGameStore.ts`, `useCombatStore.ts`)
- **Tłumaczenia:** Zagnieżdżone obiekty z kluczami w formacie `section.key` (`tavern.title`, `combat.enemies.goblin`)
- **Style:** SCSS z CSS Custom Properties dla motywów, Vuetify utility classes gdzie możliwe
- **Typy:** Eksportowane interfejsy i typy z plików store'ów
