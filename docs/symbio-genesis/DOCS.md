# Symbio-Genesis: Architekt Natury – Dokumentacja Projektowa

**Wersja:** 1.0.0
**Status:** Pre-Production / Tech Definition
**Gatunek:** Idle / Logistics / Simulation
**Platforma:** Web (Desktop/Mobile)
**Silnik:** Nuxt 3 + Vue 3 + Pixi.js

---

## 1. Wizja Projektu (High Concept)

### 1.1. Opis

Symbio-Genesis to gra typu Idle (przyrostowa), która łączy satysfakcję z rosnących liczb z mechaniką logistyczną inspirowaną naturą. Gracz wciela się w świadomość Grzybni (Mycelium), której celem jest rewitalizacja martwej planety. Rozgrywka ewoluuje od prostego klikania w zarodniki do zarządzania skomplikowaną siecią przesyłu surowców między gatunkami roślin i zwierząt.

### 1.2. Filary Designu (Core Pillars)

1. **Organic Growth:** Zamiast budować fabryki, gracz "hoduje" rozwiązania. Estetyka Solarpunk/Biopunk.
2. **Unfolding Gameplay:** Gra zmienia się w czasie. Zaczyna się jako Clicker, zmienia w grę Logistyczną (Flow), a kończy jako Symulator Ekosystemu.
3. **Wydajność Webowa:** Wykorzystanie najnowszych technologii webowych (WebGL) do renderowania tysięcy elementów bez spadków płynności.
4. **Szacunek dla Czasu:** Offline progress jest integralną częścią. Gra toczy się nawet, gdy karta przeglądarki jest zamknięta.

---

## 2. Stack Technologiczny i Architektura

Wybrano architekturę hybrydową: **Vue 3** zarządza interfejsem (UI), stanem i logiką, natomiast **Pixi.js** odpowiada za renderowanie świata gry (Canvas/WebGL).

### 2.1. Główne Technologie

| Technologia                 | Rola w projekcie       | Uzasadnienie                                                            |
| --------------------------- | ---------------------- | ----------------------------------------------------------------------- |
| **Nuxt 3**                  | Framework Aplikacji    | SSR (SEO dla landing page), auto-importy, routing, modułowość.          |
| **Vue 3 (Composition API)** | Logika Reaktywna       | Zarządzanie UI, upgrade'ami i interakcjami.                             |
| **Pinia**                   | State Management       | Centralny magazyn danych (surowce, odblokowania).                       |
| **vue3-pixi** (Pixi.js)     | Renderowanie Gry       | Wydajne renderowanie 2D (WebGL) w stylu deklaratywnym (komponenty Vue). |
| **break_infinity.js**       | Matematyka (BigNumber) | Obsługa liczb większych niż `Number.MAX_VALUE` (1.79e308).              |
| **@vueuse/core**            | Narzędzia              | Obsługa `requestAnimationFrame`, `localStorage`, resize observer.       |

### 2.2. Struktura Projektu (Nuxt)

Zalecana struktura folderów dla zachowania porządku przy rosnącej skali:

/assets
/sprites # Tekstury do Pixi.js (spore.png, node.png)
/styles # Globalne style CSS/Tailwind
/components
/Game # Komponenty renderowane w Canvas (Pixi)
NetworkNode.vue
SporeParticle.vue
/UI # Komponenty interfejsu (HTML/DOM)
ResourcePanel.vue
UpgradeCard.vue
/composables
useGameLoop.ts # Główna pętla gry (Composable)
useCurrency.ts # Helpery do formatowania walut
/stores
gameStore.ts # Główny stan zapisu
uiStore.ts # Stan widoków (niezapisywany)
/utils
math.ts # Konfiguracja break_infinity
serializer.ts # Logika zapisu/odczytu BigNumber
app.vue
nuxt.config.ts

---

## 3. Mechanika Gry (Game Mechanics)

### 3.1. Faza I: Zarodnik (The Spore)

_Typ: Clicker / Active Play_

- **Cel:** Wygenerować wystarczająco dużo **Biomasy**, aby wykiełkować pierwszą strzępkę.
- **Interakcja:** Klikanie w centralny zarodnik na ekranie.
- **Efekt Wizualny (Pixi):** Przy każdym kliknięciu zarodnik pulsuje (scale tween), a małe cząsteczki "enzymów" wylatują na boki.
- **Zasoby:**
- `Biomasa`: Podstawowa waluta.
- `DNA`: Waluta ulepszeń (rzadka).

### 3.2. Faza II: Sieć (The Web)

_Typ: Logistics / Idle_

- **Zmiana Paradygmatu:** Widok oddala się. Pojawiają się **Węzły (Nodes)**.
- **Mechanika:** Gracz łączy węzły liniami (Strzępkami).
- **Typy Węzłów:**

1. **Źródło (Source):** Produkuje surowiec (np. Woda, Minerały).
2. **Przetwornik (Converter):** Zamienia surowiec A na B (np. Woda + Minerały -> Grzybnia).
3. **Magazyn (Storage):** Zwiększa limit surowców.

- **Logika Przepływu (Game Loop Logic):**
- W każdym cyklu gry (`tick`) węzły przekazują "pakiety" zasobów do sąsiadów.
- Prędkość przesyłu zależy od poziomu ulepszenia Strzępki.

### 3.3. Matematyka Wzrostu (Core Math)

Wykorzystujemy `break_infinity.js` dla wszystkich wartości surowców.

**Wzór na koszt ulepszenia (Geometric Sequence):**
Cost_next = BaseCost \* (GrowthFactor ^ Level)

Przykład w kodzie (TypeScript):typescript
import Decimal from 'break_infinity.js';

const baseCost = new Decimal(10);
const growthFactor = 1.15;

function getCost(currentLevel: number) {
return baseCost.times(Decimal.pow(growthFactor, currentLevel));
}

````

---

## 4. Rozwiązania Techniczne (Implementation Details)

### 4.1. Główna Pętla Gry (Composable)
Zamiast `setInterval`, używamy `requestAnimationFrame` z obliczaniem `deltaTime`, aby gra działała płynnie niezależnie od klatkażu monitora (60Hz/144Hz).

**Plik: `composables/useGameLoop.ts`**
```typescript
import { onMounted, onUnmounted, ref } from 'vue';

export function useGameLoop(updateFn: (dt: number) => void) {
  let lastTime = 0;
  let animationFrameId: number;
  const isRunning = ref(false);

  const loop = (time: number) => {
    if (!lastTime) lastTime = time;
    const deltaTime = (time - lastTime) / 1000; // sekundy
    lastTime = time;

    // Cap deltaTime to avoid huge jumps if tab was inactive (handled separately by offline logic)
    const safeDelta = Math.min(deltaTime, 0.1);

    updateFn(safeDelta);

    if (isRunning.value) {
      animationFrameId = requestAnimationFrame(loop);
    }
  };

  const start = () => {
    isRunning.value = true;
    lastTime = 0;
    animationFrameId = requestAnimationFrame(loop);
  };

  const stop = () => {
    isRunning.value = false;
    cancelAnimationFrame(animationFrameId);
  };

  onMounted(start);
  onUnmounted(stop);

  return { start, stop };
}

````

### 4.2. Serializacja Stanu (Pinia + Persistence)

`break_infinity.js` tworzy obiekty typu `{ mantissa: 1.5, exponent: 2 }`. Przy zapisie do `localStorage` (JSON) metody (np. `.add()`, `.times()`) są tracone. Przy odczycie trzeba je "ożywić".

**Konfiguracja Pinia Store (`stores/gameStore.ts`):**

```typescript
import { defineStore } from 'pinia';
import Decimal from 'break_infinity.js';

// Helper do "ożywiania" liczb
const restoreDecimal = (value: any) => {
  if (typeof value === 'string') return new Decimal(value);
  if (value && value.mantissa !== undefined) return new Decimal(value);
  return new Decimal(0);
};

export const useGameStore = defineStore('game', {
  state: () => ({
    biomass: new Decimal(0),
    lastSaveTime: Date.now(),
  }),
  actions: {
    addBiomass(amount: Decimal | number) {
      this.biomass = this.biomass.add(amount);
    },
    // Wywoływane przy starcie gry
    calculateOfflineProgress() {
      const now = Date.now();
      const diffSeconds = (now - this.lastSaveTime) / 1000;

      if (diffSeconds > 10) {
        // Przykład: 10% produkcji na sekundę
        const productionPerSec = new Decimal(10); // Tu wstaw realną logikę produkcji
        const gained = productionPerSec.times(diffSeconds);
        this.addBiomass(gained);
        console.log(
          `Offline przez ${diffSeconds}s. Zyskano: ${gained.toString()}`
        );
      }
      this.lastSaveTime = now;
    },
  },
  persist: {
    // Niestandardowy serializer/deserializer
    serializer: {
      serialize: (state) => JSON.stringify(state),
      deserialize: (str) => {
        const parsed = JSON.parse(str);
        // Ręczne przywracanie typów Decimal
        parsed.biomass = restoreDecimal(parsed.biomass);
        return parsed;
      },
    },
  },
});
```

### 4.3. Renderowanie z Pixi.js (vue3-pixi)

W Vue 3 oddzielamy logikę od widoku. Store Pinia trzyma dane (pozycje X, Y), a komponenty Vue-Pixi je renderują.

**Przykład widoku gry (`components/GameView.vue`):**

```html
<script setup>
  import { Application, Container, Sprite } from 'vue3-pixi';
  import { useGameStore } from '~/stores/gameStore';

  const store = useGameStore();
  // Używamy shallowRef w store dla listy obiektów dla wydajności!
</script>

<template>
  <Application :width="800" :height="600" background-color="#1a1a2e">
    <Container>
      <Sprite
        v-for="node in store.nodes"
        :key="node.id"
        texture="/assets/node_glow.png"
        :x="node.x"
        :y="node.y"
        :anchor="0.5"
        @click="store.upgradeNode(node.id)"
      />
    </Container>
  </Application>
</template>
```

---

## 5. UI/UX i Stylistyka

### 5.1. Paleta Kolorów (Solarpunk Dark)

Gra powinna być "ciemna" (by nie męczyć oczu), ale z żywymi, neonowymi akcentami natury.

- **Tło:** Głęboki granat/fiolet (`#0f0f1b`).
- **Biomasa:** Neonowa zieleń (`#39ff14`).
- **Woda:** Cyjan (`#00f0ff`).
- **Zagrożenia:** Toksyczny fiolet (`#b026ff`).

### 5.2. Interfejs (HTML Overlays)

Warstwa UI (przyciski, liczniki) powinna być zwykłym HTML/CSS nad warstwą Canvas.

- Użyj `position: absolute` i `z-index` dla panelu zasobów.
- Użyj biblioteki ikon, np. `Lucide-vue-next` lub `Phosphor Icons`.

---

## 6. Monetyzacja (Opcjonalnie)

_Projekt hobbystyczny/portfolio, ale z potencjałem:_

1. **Skiny do Grzybni:** Zmiana koloru strzępków (pure cosmetic).
2. **Time Warp:** Przyspieszenie czasu o 4h (jednorazowe, za obejrzenie reklamy - opcjonalne).

---

## 7. Plan Działania (Roadmap MVP)

1. **Tydzień 1: Setup**

- Inicjalizacja projektu Nuxt 3.
- Instalacja `pinia`, `pinia-plugin-persistedstate`, `break_infinity.js`, `vue3-pixi`.
- Konfiguracja Loopa i Store'a.

2. **Tydzień 2: Core Loop**

- Implementacja Fazy I (Klikanie generuje zasoby).
- Wizualizacja "cyferek" w UI.

3. **Tydzień 3: Pixi & Grafika**

- Dodanie widoku Canvas.
- Wyświetlanie prostych kształtów (zamiast grafik na start).
- Animacja kliknięcia.

4. **Tydzień 4: System Zapisów & Offline**

- Implementacja `lastSaveTime` i logiki offline.
- Testowanie zapisu/odczytu na różnych przeglądarkach.

```

```
