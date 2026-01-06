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

### 4.3 System Morale

**WAŻNE**: Morale **NIE kończy gry** gdy spadnie do 0. Działa wyłącznie jako **procentowy bonus do produkcji**.

| Poziom Morale | Bonus Produkcji | Status |
|---------------|-----------------|--------|
| 100 | +100% | Maksymalna produktywność |
| 75 | +75% | Wysokie morale |
| 50 | +50% | Stabilne |
| 25 | +25% | Niskie morale |
| 0 | +0% | Minimalna produktywność |

**Mechanika**:
- Morale regeneruje się powoli (+0.1/s bazowo)
- Budynki (Kapelan, Klasztor) zwiększają regenerację
- Fale wrogów zadają obrażenia morale
- Liturgia Obronna chroni przed utratą morale

### 4.3.1 System Ulepszeń Budynków

Każdy budynek może być ulepszony od poziomu 1 do 5. Ulepszenia zwiększają efektywność wszystkich posiadanych jednostek danego typu.

#### Efekty Poziomów

| Poziom | Bonus Produkcji | Redukcja Konsumpcji | Koszt (mnożnik) |
|--------|-----------------|---------------------|-----------------|
| 1 | +0% (bazowy) | +0% | - |
| 2 | +50% | -10% | 5× kosztu bazowego × ilość |
| 3 | +100% | -20% | 25× kosztu bazowego × ilość |
| 4 | +150% | -30% | 125× kosztu bazowego × ilość |
| 5 (MAX) | +200% | -40% | 625× kosztu bazowego × ilość |

#### Efekty Specjalne Max Level (Lv.5)

| Budynek | Efekt Specjalny |
|---------|-----------------|
| Kapliczka | **Automatyczna modlitwa**: +1 Wiary/s pasywnie |
| Poborca Dziesięcin | **Złote Żniwa**: Nie konsumuje Wiary |
| Pielgrzym Biczownik | **Święta Ofiara**: +100% produkcji podczas ataków |
| Czołg-Ołtarz | **Pancerna Świątynia**: +50% obrony globalna |
| Mury Obronne | **Święte Mury**: Immunitet na pierwszą falę po prestiżu |
| Wieża Strażnicza | **Oczy Solmara**: +30s ostrzegania o fali |
| Kapelan | **Święta Inspiracja**: +2/s regeneracji morale globalna |
| Klasztor | **Sanktuarium**: Podwójna regeneracja morale |

**Wymagania do ulepszenia**:
- Budynek musi być odblokowany
- Musisz posiadać co najmniej 1 budynek danego typu
- Koszt zależy od ilości posiadanych budynków

### 4.3.2 System Wydarzeń Losowych

System wydarzeń losowych wprowadza dynamiczne elementy do rozgrywki. Wydarzenia pojawiają się co 2-5 minut i dzielą się na trzy kategorie.

#### Typy Wydarzeń

| Typ | Kolor | Opis |
|-----|-------|------|
| Pozytywne | Zielony | Bonusy do produkcji, regeneracji, zasobów |
| Negatywne | Czerwony | Kary, straty, niespodziewane ataki |
| Wybory | Złoty | Gracz podejmuje decyzję (30s na odpowiedź) |

#### Rzadkość Wydarzeń

| Rzadkość | Szansa | Przykłady |
|----------|--------|-----------|
| Common | 10x | Zaraza, Hojny Darczyńca, Wędrowny Kupiec |
| Uncommon | 5x | Pielgrzymka, Sabotaż, Dyplomata |
| Rare | 2x | Cud Solmara, Ofiara, Święta Relikwia |
| Legendary | 1x | Święta Wizja (+50% Popiołów z prestiżu) |

#### Lista Wydarzeń

**Pozytywne:**
- **Pielgrzymka** (Uncommon): +500% produkcji Wiary przez 30s
- **Cud Solmara** (Rare): ×2 Wiara z kliknięć przez 60s
- **Hojny Darczyńca** (Common): +10% aktualnej Wiary natychmiast
- **Błogosławieństwo** (Uncommon): Pełna regeneracja morale
- **Święta Wizja** (Legendary): +50% Popiołów z następnego prestiżu (10 min)
- **Żarliwość Zelotów** (Uncommon): +5/s regeneracji morale przez 45s

**Negatywne:**
- **Zaraza** (Common): -50% produkcji przez 30s
- **Herezja** (Common): -10% aktualnej Wiary
- **Sabotaż** (Uncommon): Utrata 1 losowego budynku
- **Demoralizacja** (Common): -25 morale natychmiast
- **Atak Zaskoczenia** (Uncommon): Natychmiastowa fala wrogów
- **Korupcja** (Uncommon): -20% Dukatów

**Wybory:**
- **Wędrowny Kupiec** (Common): Wymiana 500 Wiary ↔ 100 Dukatów
- **Tajemniczy Pielgrzym** (Uncommon): 50%: +2000 Wiary / 50%: -500 Wiary
- **Dyplomata** (Uncommon): Zapłać 1000 Wiary za opóźnienie fali o 60s
- **Ofiara** (Rare): Poświęć budynek za +200% produkcji przez 60s
- **Święta Relikwia** (Rare): Sprzedaj za 5000 Wiary lub +25% obrony przez 120s

#### Aktywne Efekty

Gdy wydarzenie aktywuje buff lub debuff, jest on wyświetlany w panelu "Aktywne Efekty" z:
- Ikoną i nazwą efektu
- Paskiem postępu czasu trwania
- Opisem aktualnego bonusu/kary

Efekty z wydarzeń kumulują się z innymi bonusami (prestiż, budynki, liturgie).

### 4.3.3 Budynki Tier 2 (Zaawansowane)

Budynki Tier 2 odblokowują się po spełnieniu wymagań dotyczących budynków Tier 1.

| Budynek | Wymagania | Koszt | Efekt | Max Level |
|---------|-----------|-------|-------|-----------|
| **Katedra** | 10 Kapliczek | 5,000 Wiary, 500 Dukatów | +25 Wiary/s, +10% do Kapliczek | +100% do Kapliczek |
| **Arsenał** | 5 Wież Strażniczych | 2,000 Wiary, 1,000 Dukatów | +5 Gniewu/fala | +10 Gniewu/fala |
| **Biblioteka Świętych Tekstów** | 3 Klasztory | 10,000 Wiary | +5% globalnej produkcji | +10% globalnej produkcji |
| **Szpital Polowy** | 5 Kapelanów | 3,000 Wiary, 200 Dukatów | -25% strat jednostek | -50% strat + szansa na 0 |

**Mechanika**:
- Budynki Tier 2 mają wyższe koszty bazowe i mnożniki
- Efekty specjalne działają pasywnie po zakupie
- Stackują się (np. 3 Biblioteki = 15% globalnej produkcji)
- Osiągnięcie Lv5 daje potężniejsze wersje efektów

### 4.3.4 Budynki Tier 3 (Endgame)

Budynki Tier 3 wymagają spełnienia wymagań budynkowych ORAZ specjalnych warunków (prestiże, fale).

| Budynek | Wymagania | Specjalne Warunki | Koszt | Efekt | Max Level |
|---------|-----------|-------------------|-------|-------|-----------|
| **Relikwiarz** | 1 Katedra | 25 prestiży | 100K Wiary, 10K Dukatów | +50 Wiary/s, +1 slot relikwii, +5% bonusy relikwii | Podwójne bonusy z relikwii |
| **Forteca Inkwizycji** | 10 Wież | 50 fal | 50K Wiary, 5K Dukatów | -30% koszt liturgii, +20% obrona | Nowa liturgia "Oczyszczenie" |
| **Wieża Dzwonnicza** | 1 Katedra | - | 25K Wiary | +10 Wiary/s, +30s ostrzegania, +10% regen morale | +5 morale po każdej fali per dzwon |

#### Jednostki Specjalne (Tier 3)

| Jednostka | Wymagania | Koszt | Efekt | Max Level |
|-----------|-----------|-------|-------|-----------|
| **Inkwizytor** | 1 Forteca | 1K Wiary, 100 Dukatów | -3% koszt liturgii (stackuje), +2% efektywność | -20% koszt liturgii globalnie |
| **Święty Wojownik** | 1 Forteca | 2K Wiary, 500 Dukatów | -5% siła fali (max -50%) | 5% szansa na odpurzenie fali per wojownik |

**Mechanika Tier 3**:
- Wymagają zaawansowanych budynków Tier 2
- Specjalne warunki odblokowania (prestiże, odparte fale)
- Potężne efekty końcówki gry
- Jednostki specjalne stackują swoje bonusy

### 4.3.4 System Relikwii (Artifacts)

Zbieralne przedmioty z unikalnymi efektami i fabularnym lore.

#### Rzadkości Relikwii

| Rzadkość | Kolor | Bonusy | Drop Rate (fala) | Drop Rate (boss) |
|----------|-------|--------|------------------|------------------|
| **Pospolita** | Szara | +5-10% | 70% | 20% |
| **Rzadka** | Niebieska | +15-25% | 25% | 50% |
| **Epicka** | Fioletowa | +30-50% + efekt specjalny | 4% | 25% |
| **Legendarna** | Złota | +50-100% + potężny efekt | 1% | 5% |

#### Źródła Relikwii

- **Co 10 fal**: Losowa relikwia (Pospolita/Rzadka)
- **Co 25 fal (boss)**: Gwarantowana Rzadka+
- **Prestiż**: 1 losowa relikwia za każde 10 Popiołów
- **Osiągnięcia**: Specyficzne relikwie za ukończenie zestawów

#### Typy Efektów Relikwii

| Typ Efektu | Opis | Przykład |
|------------|------|----------|
| `productionMultiplier` | Bonus produkcji zasobu | +20% produkcji Wiary |
| `clickMultiplier` | Bonus kliknięcia | +15% z modlitwy |
| `defenseBonus` | Bonus obrony | +25% obrony |
| `moraleRegenBonus` | Regeneracja morale | +50% regeneracji |
| `moraleDamageReduction` | Redukcja obrażeń | -35% obrażeń morale |
| `prestigeBonus` | Bonus Popiołów | +25% Popiołów |
| `moraleMinimum` | Minimalne morale | Morale nie spada poniżej 25 |
| `doubleClickChance` | Szansa na x2 klik | 10% szansy |
| `waveDelayBonus` | Czas między falami | +5s między falami |
| `allProductionMultiplier` | Globalna produkcja | +30% wszystkich produkcji |

#### Przykładowe Relikwie

| Nazwa | Rzadkość | Efekty | Źródło |
|-------|----------|--------|--------|
| **Łza Solmara** | 🟡 Legendarna | +50% regen morale, min morale 25 | Boss |
| **Serce Solmara** | 🟡 Legendarna | +100% prod. Wiary, +25% wszystkie | Osiągnięcie |
| **Korona Męczenników** | 🟡 Legendarna | +75% Popiołów, +30% obrony | Prestiż |
| **Kość Męczennika** | 🟣 Epicka | +25% Popiołów | Prestiż |
| **Tarcza Wiary** | 🟣 Epicka | -35% obrażeń morale, +25% obrony | Fala |
| **Święty Kielich** | 🔵 Rzadka | 10% szansy na x2 klik | Fala |
| **Medalion Ochronny** | 🔵 Rzadka | -15% obrażeń morale | Fala |
| **Kamień Płomienia** | ⚪ Pospolita | +10% produkcji Wiary | Fala |

#### System Slotów

- **Bazowe sloty**: 3 (dostępne od początku)
- **Dodatkowe sloty**: 2 (odblokowywane przez prestiż)
- **Limit maksymalny**: 5 wyposażonych relikwii jednocześnie

**Mechanika Relikwii**:
- Relikwie są permanentne - nie tracisz ich przy prestiżu
- Można wyposażyć tylko określoną liczbę relikwii naraz
- Bonusy z relikwii stackują się addytywnie
- Każda relikwia ma unikalne lore i fabułę

### 4.4 Prestiż i Reset (System "Cykli")

Gracz może **dobrowolnie** zresetować postęp w zamian za walutę prestiżową. Reset jest dostępny po osiągnięciu określonych celów.

| Frakcja | Waluta Prestiżowa | Ikona |
|---------|-------------------|-------|
| Solmar | "Popioły Męczenników" | 🔥 |
| Kultyści | "Esencja Ewolucji" | 🧬 |

#### 4.4.1 Warunki Prestiżu

Prestiż jest dostępny gdy gracz spełni **JEDEN** z warunków:
- Zebrano łącznie **10,000+ Wiary** w cyklu
- Pokonano **10+ fal** wrogów
- Posiadano **50+ budynków** jednocześnie

#### 4.4.2 Obliczanie Popiołów Męczenników

```
Popioły = floor(sqrt(totalFaith / 1000)) + floor(wavesDefeated / 5) + floor(totalBuildings / 25)
```

Przykład: 50,000 Wiary + 15 fal + 40 budynków = 7 + 3 + 1 = **11 Popiołów**

#### 4.4.3 Drzewko Rozwoju (Meta-progression)

| Tier | Ulepszenie | Koszt | Efekt |
|------|-----------|-------|-------|
| **1** | Pobożny Start | 1 🔥 | Start z +100 Wiary |
| **1** | Echo Modlitwy | 2 🔥 | +25% do kliknięć |
| **1** | Fundamenty Wiary | 2 🔥 | Kapliczki -15% tańsze |
| **2** | Hartowane Dusze | 5 🔥 | Jednostki -20% strat w falach |
| **2** | Skarb Solmara | 5 🔥 | Start z +50 Dukatów |
| **2** | Błogosławiona Stal | 8 🔥 | Liturgia -20% cooldown |
| **3** | Wieczna Wiara | 15 🔥 | +50% produkcji Wiary globalnie |
| **3** | Niezłomność | 15 🔥 | Morale regen +100% |
| **3** | Forteca Solmara | 20 🔥 | -25% wzrostu zagrożenia |
| **4** | Ascensja | 50 🔥 | Odblokuj nowy typ budynku (Katedra) |

#### 4.4.4 Co zostaje po Prestiżu

| Resetowane | Zachowane |
|------------|-----------|
| Wszystkie zasoby | Popioły Męczenników |
| Wszystkie budynki | Zakupione ulepszenia prestiżowe |
| Statystyki fal | Osiągnięcia |
| Zagrożenie/Morale | Odblokowane funkcje |

---

### 4.5 Rozszerzony System Walki

System walki został rozszerzony o nowe typy wrogów, mechanikę combo i system boss-fight.

#### 4.5.1 Typy Wrogów

| Typ | Ikona | Tier | Mnożnik DMG | Słabość | Pojawia się |
|-----|-------|------|-------------|---------|-------------|
| **Kultyści Mięsa** | 👹 | Basic | 1x | Błogosławieństwo (+30%) | Co 1 falę |
| **Plugastwo** | 👾 | Elite | 2x | Fortyfikacja (+40%) | Co 5 fal |
| **Apostata** | 🧙 | Special | 0.5x + kradnie 5% Wiary | Męczeństwo (+60%) | Co 7 fal |
| **Abominacja** | 🐙 | Boss | 5x + drain morale | Męczeństwo (+35%) | Co 25 fal |
| **Arcyheretyk** | 😈 | Megaboss | 10x + wyłącza budynki | - | Co 100 fal |

#### 4.5.2 System Słabości

Wrogowie mają słabości na konkretne liturgie. Użycie odpowiedniej liturgii podczas fali z danym wrogiem daje dodatkową redukcję obrażeń:

- **Błogosławieństwo** - Skuteczne przeciw Kultystom (+30% redukcji)
- **Fortyfikacja** - Skuteczne przeciw Plugastwom (+40% redukcji)
- **Męczeństwo** - Skuteczne przeciw Apostatom (+60%) i Abominacjom (+35%)

#### 4.5.3 System Combo

Szybkie odpieranie fal buduje serię (combo):
- **Okno combo**: 30 sekund między falami
- **Bonus za serię**: +5% redukcji obrażeń za każdą falę w serii (max 30%)
- **Rekord serii**: Zapisywany między sesjami

```
Seria x1: +5% obrony
Seria x3: +15% obrony (+ notyfikacja)
Seria x5: +25% obrony (+ specjalny efekt)
Seria x6+: +30% obrony (cap)
```

#### 4.5.4 System Boss Fight

Podczas fal bossów (Abominacja, Arcyheretyk) gracz może wykonywać strategiczne akcje:

**Dostępne Akcje:**
| Akcja | Koszt | Efekt | Opis |
|-------|-------|-------|------|
| Atak Frontalny | 100 Wiary | -20% HP Bossa | Bezpośredni atak, ryzykujesz straty |
| Osłabienie | 150 Wiary + 50 Dukatów | -30% DMG fali | Osłabia obrażenia wroga |
| Poświęcenie | 10% jednostek | -50% HP Bossa | Poświęć jednostki za ogromne obrażenia |

**Fazy Bossów:**
- **Abominacja**: 2 fazy (przejście przy 50% HP)
- **Arcyheretyk**: 3 fazy (przejście przy 66% i 33% HP)

**Specjalne Efekty Bossów:**
- **Abominacja**: Drain morale -2/s podczas walki
- **Arcyheretyk**: Wyłącza 30% losowych budynków na czas walki

**Nagrody za Bossów:**
| Boss | Relikwia | Popioły | Wiara |
|------|----------|---------|-------|
| Abominacja | Rzadka (50%) / Epicka (50%) | +3 | +500 |
| Arcyheretyk | Epicka (70%) / Legendarna (30%) | +10 | +2500 |

#### 4.5.5 UI Walki

Panel walki wyświetla:
- **Aktualną serię combo** (z animacją ognia przy serii 3+)
- **Typ wroga** podczas fali (ikona, nazwa, słabość, tier)
- **Panel bossa** podczas boss-fight:
  - Pasek HP bossa
  - Aktualna faza
  - Dostępne akcje z kosztami
  - Lista nagród

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

