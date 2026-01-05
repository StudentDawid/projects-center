# GAME DESIGN DOCUMENT: SANKTUARIUM SOLMARA

| Parametr | Wartość |
|----------|---------|
| **Wersja** | 1.0 |
| **Typ Projektu** | Gra przeglądarkowa IDLE / Incremental |
| **Silnik** | Vue 3 (Composition API) + Vite |
| **UI Framework** | Vuetify 3 (Custom Theming) |
| **Stylistyka** | Religious Grimdark / Body Horror |
| **Status** | Dokumentacja Techniczna i Fabularna |

---

## 1. Wstęp i Wizja Produktu

"Sanktuarium Solmara" to gra typu **Premium Idle**, która łączy mechanikę przyrostową (incremental) z gęstą narracją i ciężkim klimatem wizualnym. Gracz nie obserwuje jedynie rosnących liczb, lecz zarządza desperacką wojną na wyniszczenie.

> **Core Pillar: "Narracyjna Atrycja"** – zasoby nie rosną w nieskończoność w próżni. Gracz musi nieustannie "karmić" machinę wojenną, poświęcając jednostki, wiarę i człowieczeństwo, aby utrzymać linię frontu przed nieuniknionym resetem (Prestiż).

### Strony Konfliktu

| Frakcja | Opis | Cechy |
|---------|------|-------|
| **Teokracja Solmara** | Fanatyczny zakon militarny | Defensywa, Kamień, Złoto, Ogień |
| **Kultyści Mięsa** | Heretycy czczący ewolucję poprzez nowotworowy rozrost | Ekspansja, Biomasa, Mutacja |
| **Demony (NPC/Trzecia Siła)** | Siła natury, z którą można paktować za cenę duszy | — |

---

## 2. Architektura Techniczna (Stack Technologiczny)

Dla Cursora i zespołu deweloperskiego przyjęto następujące zasady implementacji:

### 2.1 Struktura Aplikacji (Vue 3 + TypeScript)

- **State Management**: Pinia. Wymagane użycie `BigInt` lub biblioteki `decimal.js` / `break_infinity.js` do obsługi dużych liczb (> 10^308).
- **Reaktywność**: Wykorzystanie `requestAnimationFrame` do głównej pętli gry (Game Loop), oddzielonej od warstwy renderowania Vue.
- **Persystencja**: `pinia-plugin-persistedstate` do zapisu stanu w localStorage (z sumą kontrolną Base64, aby utrudnić proste edycje).

### 2.2 Sklepy (Pinia Stores)

Zalecany podział logiki na moduły:

| Store | Odpowiedzialność |
|-------|------------------|
| `useGameLoopStore` | Odpowiada za upływ czasu (deltaTime), obliczanie przyrostu offline i globalne ticki |
| `useResourceStore` | Przechowuje stan surowców (Wiara, Biomasa, Dusze, Dukaty) |
| `useEntityStore` | Zarządza budynkami i jednostkami (koszt, ilość, produkcja) |
| `useNarrativeStore` | Obsługuje logi, odkrywanie fabuły i odblokowywanie funkcji (Fog of War) |

### 2.3 UI & UX (Vuetify 3)

- Niestandardowe motywy (Custom Themes) definiowane w `vuetify.ts` dla każdej frakcji.
- Agresywne nadpisywanie CSS (Global CSS Overrides) w celu uzyskania efektów tekstury (papier, metal, mięso).
- Unikanie domyślnego "Material Design feel" poprzez zmianę typografii i `border-radius` (na 0 lub nieregularne kształty).

---

## 3. Stylistyka i Design System

### 3.1 Palety Kolorystyczne (Themes)

#### Motyw: Solmar (Theocracy)

**Styl**: Sakralny Brutalizm. Złoto przykryte sadzą, stary pergamin, ciężki kamień.

```scss
$solmar-theme: (
  background: #1c1a16,  // Ciemny brąz/czarny
  surface: #2b2720,     // Okopcony kamień
  primary: #c5a059,     // Zgaszone złoto
  error: #8a2be2        // Liturgiczna purpura
);
```

**Fonty**:
- Nagłówki: `UnifrakturCook`
- Lore: `IM Fell English SC`

#### Motyw: Kultyści (Flesh Cult)

**Styl**: Organiczny Horror. Tkanka, żyły, śluz.

```scss
$cult-theme: (
  background: #1a0505,  // Zakrzepła krew
  surface: #2d0a0a,     // Surowe mięso
  primary: #ff4040,     // Tętnicza krew - jaskrawa
  secondary: #a8a878    // Kość/Ropa
);
```

**Fonty**:
- Nagłówki: `Nosifer` lub `Creepster`
- Raporty: `Courier Prime`

### 3.2 Efekty Specjalne (CSS & SVG)

**Tekstury**: Użycie `mix-blend-mode: multiply` do nałożenia tekstur "grunge" (szum, rysy) na komponenty `v-card` i `v-btn`.

**Animacje**:

| Efekt | Opis | Zastosowanie |
|-------|------|--------------|
| **Pulsowanie** | Rytmiczna zmiana skali (`transform: scale(1.02)`), symulująca bicie serca | Elementy interfejsu Kultystów |
| **Glitch** | Efekt rozwarstwienia chromatycznego (RGB split) | Kontakt z Demonami, wysoki poziom szaleństwa |
| **Płynność** | Paski postępu wyglądające jak napełniające się fiolki z gęstą cieczą | Progress Bars dla Kultystów |

---

## 4. Mechanika Gry

### 4.1 Frakcja: Teokracja Solmara

Gra polega na **utrzymaniu status quo**.

**Pętla Rozgrywki**:
```
Klikanie (Modlitwa) → Generowanie Wiary → Rekrutacja Inkwizytorów → Budowa Fortyfikacji
```

**Unikalna Mechanika**: "Liturgia Obronna" - Gracz musi ręcznie aktywować tarcze/błogosławieństwa w momentach ataku fal wrogów (Active Play).

**Jednostki**:

| Jednostka | Opis |
|-----------|------|
| **Pielgrzym Biczownik** | Generuje Wiarę poprzez samookaleczenie (traci HP, daje Resource) |
| **Czołg-Ołtarz** | Jednostka late-game. Zwiększa morale, ale zużywa ogromne ilości Paliwa i Dukatów |

### 4.2 Frakcja: Kultyści Mięsa

Gra polega na **niekontrolowanym wzroście** (Cancer Growth).

**Pętla Rozgrywki**:
```
Zbieranie ciał → Przetwarzanie na Biomasę → Hodowanie nowych organów
```

**Unikalna Mechanika**: "Grafting" (Przeszczepianie) - Gracz nie kupuje ulepszeń za walutę. Gracz łączy dwie jednostki niższego rzędu w jedną wyższego rzędu (Merge mechanic).

**Przykład**: `2x Mięsna Kukła = 1x Zarażony Szturmowiec`

**Zasób Specjalny**: Gniew (Rage) - Rośnie, gdy jednostki giną. Pozwala na krótki, potężny boost produkcji (Szał).

### 4.3 Prestiż i Reset (System "Cykli")

Gra kończy się, gdy linia frontu upada. Następuje reset świata.

| Frakcja | Waluta Prestiżowa |
|---------|-------------------|
| Solmar | "Popioły Męczenników" |
| Kultyści | "Esencja Ewolucji" |

**Drzewko Rozwoju (Meta-progression)**: Pozwala odblokować stałe ulepszenia:
- "Start z 1000 Dukatów"
- "Jednostki żyją 10% dłużej"

---

## 5. Implementacja w Cursorze (Instrukcje dla AI)

Poniżej znajdują się gotowe fragmenty kodu i struktury do wykorzystania przy generowaniu projektu.

### 5.1 Przykład .cursorrules (Konfiguracja AI)

Skopiuj poniższą treść do pliku `.cursorrules` w głównym katalogu projektu:

```
You are an expert Vue 3 and TypeScript developer specializing in Game Development.

Project Context:
- Name: Sanctum of Solmar (Idle Game)
- Tech Stack: Vue 3, Vite, Pinia, Vuetify 3.
- Theme: Grimdark, Religious Horror, Trench Warfare styling.

Coding Rules:
- Always use <script setup lang="ts">.
- Use separate Pinia stores for logic (gameLoop, resources, upgrades).
- For large numbers, ALWAYS assume usage of break_infinity.js or BigInt. Do not use primitive number for resources.
- UI Components must use v-card, v-btn, etc., but heavily styled via custom classes (.grimdark-card, .flesh-btn).
- Documentation: Comment complex game logic formulas (e.g., cost scaling: Base * 1.15 ^ Count).

Style Guide:
- Avoid "clean" modern look. Prefer "rugged", "textured", "high contrast" UI suggestions.
- Colors: Solmar = Gold/Black/Stone; Cult = Red/Flesh/Bone.
```

### 5.2 Przykład Pętli Gry (Composable)

**Plik**: `src/composables/useGameLoop.ts`

```typescript
import { ref, onMounted, onUnmounted } from 'vue';
import { useResourceStore } from '@/stores/resources';

export function useGameLoop() {
  const resourceStore = useResourceStore();
  let lastTime = performance.now();
  let animationFrameId: number;
  const isRunning = ref(false);

  const loop = (currentTime: number) => {
    const deltaTime = (currentTime - lastTime) / 1000; // Czas w sekundach
    lastTime = currentTime;

    // Aktualizacja logiki gry (nie UI!)
    resourceStore.tick(deltaTime);

    if (isRunning.value) {
      animationFrameId = requestAnimationFrame(loop);
    }
  };

  const start = () => {
    if (isRunning.value) return;
    isRunning.value = true;
    lastTime = performance.now();
    animationFrameId = requestAnimationFrame(loop);
  };

  const stop = () => {
    isRunning.value = false;
    cancelAnimationFrame(animationFrameId);
  };

  onMounted(start);
  onUnmounted(stop);

  return { isRunning, start, stop };
}
```

## 6. Plan Rozwoju (Roadmap)

| Faza | Nazwa | Opis |
|------|-------|------|
| **0** | Setup | Inicjalizacja projektu Vite + Vue 3 + Vuetify. Konfiguracja Pinia i Persistence. |
| **1** | MVP Solmara | Implementacja pętli gry, jednego zasobu (Wiara) i jednego budynku (Kapliczka). Stylowanie UI na "stary pergamin". |
| **2** | Mechanika Atrycji | Dodanie wskaźnika "Zagrożenie". Jednostki zaczynają ginąć losowo. Konieczność ich odkupywania. |
| **3** | Kultyści i Mutacje | Implementacja drugiej frakcji z mechaniką łączenia jednostek (Merging). |
| **4** | Audio i Polish | Dodanie dźwięków (Web Audio API) i efektów cząsteczkowych (krew/blask) przy kliknięciach. |

---

*Dokument wygenerowany przez AI na potrzeby projektu "Sanktuarium Solmara".*

