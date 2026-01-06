# 🚀 Roadmap - Sanktuarium Solmara

Plan rozwoju gry "Sanktuarium Solmara" - Premium IDLE w klimacie Religious Grimdark.

---

## ✅ ZREALIZOWANE

| Funkcjonalność | Data | Opis |
|----------------|------|------|
| Core Gameplay Loop | v0.1 | Modlitwa, budynki, produkcja Wiary |
| System Walki | v0.1 | Zagrożenie, fale wrogów, morale, liturgie |
| System Prestiżu | v0.2 | Popioły Męczenników, 11 ulepszeń permanentnych |
| Hub Projektów | v0.2 | Strona główna projects-center |
| GitHub Pages Deploy | v0.2 | Automatyczny deployment |
| **System Osiągnięć** | v0.3 | 34 osiągnięcia w 6 kategoriach, panel UI, powiadomienia toast |
| **Ulepszenia Budynków** | v0.4 | Poziomy 1-5, efekty specjalne max level, bonus produkcji/redukcja konsumpcji |
| **Wydarzenia Losowe** | v0.5 | 15 wydarzeń (pozytywne/negatywne/wybory), aktywne efekty, integracja z prestiżem |
| **Budynki Tier 2** | v0.6 | Katedra, Arsenał, Biblioteka, Szpital Polowy |
| **Budynki Tier 3** | v0.7 | Relikwiarz, Forteca Inkwizycji, Wieża Dzwonnicza + Inkwizytor, Święty Wojownik |
| **System Relikwii** | v0.8 | 22 relikwie (4 rzadkości), system slotów, drop z fal, panel UI |
|| **Rozszerzony System Walki** | v0.9 | 5 typów wrogów, system słabości, combo, boss encounters |

---

## 🔥 PRIORYTET WYSOKI (Core Gameplay)

### 1. System Osiągnięć (Achievements)
**Status:** ✅ ZREALIZOWANE (v0.3)

Cel krótkoterminowy dla graczy - zbieranie achievementów.

```
Kategorie osiągnięć:
├── Wiara:
│   ├── "Pierwsza iskra" - Zdobądź 100 Wiary
│   ├── "Gorliwiec" - Zdobądź 10,000 Wiary
│   ├── "Święty" - Zdobądź 1,000,000 Wiary
│   └── "Transcendencja" - Zdobądź 1e9 Wiary
│
├── Budynki:
│   ├── "Budowniczy" - Zbuduj 10 budynków
│   ├── "Architekt" - Zbuduj 50 budynków
│   ├── "Urbanista" - Zbuduj 100 budynków
│   └── "Pełna kaplica" - Posiadaj 25 kapliczek
│
├── Walka:
│   ├── "Obrońca" - Odpieraj 10 fal
│   ├── "Nieugięty" - Odpieraj 50 fal
│   ├── "Legenda Frontu" - Odpieraj 100 fal
│   └── "Bez strat" - Odpieraj falę bez strat jednostek
│
├── Prestiż:
│   ├── "Odrodzony" - Wykonaj pierwszy prestiż
│   ├── "Feniks" - Wykonaj 5 prestiży
│   ├── "Wieczny" - Wykonaj 25 prestiży
│   └── "Popiół i Płomień" - Zdobądź 1000 Popiołów łącznie
│
├── Kliknięcia:
│   ├── "Modlitewnik" - Kliknij 100 razy
│   ├── "Fanatyk" - Kliknij 1000 razy
│   └── "Święte Palce" - Kliknij 10,000 razy
│
└── Ukryte:
    ├── "Nocna Zmiana" - Graj między 2:00 a 4:00 w nocy
    ├── "Cierpliwość" - Czekaj 10 minut bez klikania
    └── "Hojny" - Wydaj 10,000 Wiary na liturgie w jednym cyklu
```

**Nagrody:**
- Bonusy do produkcji (+1-5% za każde osiągnięcie)
- Tytuły gracza
- Unikalne ikonki

**Implementacja:**
- Store `achievements.ts`
- Komponent `AchievementPanel.vue`
- Toast notifications przy odblokowaniu
- Persystencja w localStorage

---

### 2. System Wydarzeń Losowych (Random Events)
**Status:** ✅ ZREALIZOWANE (v0.5)

Urozmaicenie rozgrywki - wydarzenia pojawiające się losowo - **W PEŁNI ZAIMPLEMENTOWANY**.

```
Wydarzenia Pozytywne (6):
├── "Pielgrzymka" - +500% produkcji przez 30s
├── "Cud Solmara" - Podwójne kliknięcia przez 60s
├── "Hojny darczyńca" - Natychmiastowy bonus +10% aktualnej Wiary
├── "Błogosławieństwo" - Natychmiastowa regeneracja morale do 100
├── "Święta Wizja" - +50% Popiołów z następnego prestiżu (10 min)
└── "Żarliwość Zelotów" - +5/s regeneracji morale przez 45s

Wydarzenia Negatywne (6):
├── "Zaraza" - -50% produkcji przez 30s
├── "Herezja" - Utrata 10% aktualnej Wiary
├── "Sabotaż" - Losowy budynek zniszczony
├── "Demoralizacja" - -25 morale natychmiast
├── "Atak Zaskoczenia" - Natychmiastowa fala wrogów
└── "Korupcja" - Utrata 20% Dukatów

Wydarzenia Neutralne z wyborem (5):
├── "Wędrowny kupiec" - Wymiana: 500 Wiary ↔ 100 Dukatów (lub odrzuć)
├── "Tajemniczy pielgrzym" - 50%: +2000 Wiary / 50%: -500 Wiary (lub odrzuć)
├── "Dyplomata" - Zapłać 1000 Wiary za opóźnienie fali o 60s
├── "Ofiara" - Poświęć budynek za +200% produkcji przez 60s
└── "Święta Relikwia" - Sprzedaj za 5000 Wiary lub zatrzymaj dla +25% obrony przez 120s
```

**Implementacja:**
- Store `events.ts` z typami, stanem i akcjami
- Komponent `EventModal.vue` z animacjami i timerem
- Komponent `ActiveEffects.vue` do wyświetlania aktywnych buffów/debuffów
- Integracja z główną pętlą gry (gameLoop.ts)
- Mnożniki produkcji, kliknięć, obrony i regeneracji morale
- Sacred Vision buff integruje się z prestiżem (+50% Popiołów)
- Panel DEV do wywoływania i testowania wydarzeń
- Persystencja w localStorage

**Mechanika:**
- Częstotliwość: co 2-5 minut (losowo)
- Timeout: 30 sekund na decyzję (wydarzenia wyboru)
- Rzadkość: Common > Uncommon > Rare > Legendary
- Aktywne efekty wyświetlane w panelu z timerem

---

### 3. Ulepszenia Budynków (Building Upgrades)
**Status:** ✅ ZREALIZOWANE (v0.4)

System poziomów dla każdego budynku - **W PEŁNI ZAIMPLEMENTOWANY**.

```
Mechanika:
├── Poziomy: 1-5
├── Efekty na poziom:
│   ├── +50% produkcji na poziom
│   ├── -10% konsumpcji na poziom
│   └── Efekty specjalne na max level
│
├── Koszty:
│   ├── Poziom 2: 5x bazowy koszt × ilość budynków
│   ├── Poziom 3: 25x bazowy koszt × ilość budynków
│   ├── Poziom 4: 125x bazowy koszt × ilość budynków
│   └── Poziom 5: 625x bazowy koszt × ilość budynków
│
└── Specjalne efekty (max level) - WSZYSTKIE ZAIMPLEMENTOWANE:
    ├── Kapliczka Lv5: Automatyczna modlitwa +1/s
    ├── Poborca Dziesięcin Lv5: Nie konsumuje Wiary
    ├── Pielgrzym Biczownik Lv5: +100% produkcji podczas ataków
    ├── Czołg-Ołtarz Lv5: +50% obrony globalna
    ├── Mury Lv5: Immunitet na pierwszą falę po prestiżu
    ├── Wieża Strażnicza Lv5: +30s ostrzegania o fali
    ├── Kapelan Lv5: +2/s regeneracji morale globalna
    └── Klasztor Lv5: Podwójna regeneracja morale

UI:
├── Badge "Lv.X" przy ikonie budynku
├── Przycisk "Ulepsz" obok "Kup"
├── 5 kropek pokazujących postęp poziomów
├── Informacja o bonusie z poziomu
├── Złota ramka i efekt pulse dla MAX level
└── Komunikat w Kronice przy ulepszeniu
```

---

## 🟡 PRIORYTET ŚREDNI (Content & Polish)

### 4. Nowe Budynki i Jednostki
**Status:** 🟢 Tier 2 ZREALIZOWANE

#### Tier 2 Budynki (mid-game) ✅ ZAIMPLEMENTOWANE
```
├── "Katedra" ✅
│   ├── Wymaga: 10 Kapliczek
│   ├── Koszt: 5,000 Wiary, 500 Dukatów
│   ├── Produkcja: +25 Wiary/s
│   ├── Efekt: +10% produkcji Wiary z każdej Kapliczki
│   └── Max Level: +100% produkcji Wiary z Kapliczek
│
├── "Arsenał" ✅
│   ├── Wymaga: 5 Wież Strażniczych
│   ├── Koszt: 2,000 Wiary, 1,000 Dukatów
│   ├── Produkcja: +5 Gniewu po każdej fali
│   └── Max Level: +10 Gniewu po każdej fali
│
├── "Biblioteka Świętych Tekstów" ✅
│   ├── Wymaga: 3 Klasztory
│   ├── Koszt: 10,000 Wiary
│   ├── Efekt: +5% globalnej produkcji (stackuje)
│   └── Max Level: +10% globalnej produkcji (stackuje)
│
└── "Szpital Polowy" ✅
    ├── Wymaga: 5 Kapelanów
    ├── Koszt: 3,000 Wiary, 200 Dukatów
    ├── Efekt: -25% strat jednostek podczas fal
    └── Max Level: -50% strat + 25% szansy na 0 strat
```

#### Tier 3 Budynki (late-game) ✅ ZAIMPLEMENTOWANE
```
├── "Relikwiarz" ✅
│   ├── Wymaga: 1 Katedra + 25 prestiży
│   ├── Koszt: 100,000 Wiary, 10,000 Dukatów
│   ├── Efekt: +50 Wiary/s, +1 slot relikwii, +5% bonusy relikwii
│   └── Max Level: Podwójne bonusy z relikwii
│
├── "Forteca Inkwizycji" ✅
│   ├── Wymaga: 10 Wież Strażniczych + 50 fal odpartych
│   ├── Koszt: 50,000 Wiary, 5,000 Dukatów
│   ├── Efekt: -30% koszt liturgii, +20% obrona
│   └── Max Level: Nowa liturgia "Oczyszczenie"
│
└── "Wieża Dzwonnicza" ✅
    ├── Wymaga: 1 Katedra
    ├── Koszt: 25,000 Wiary
    ├── Efekt: +10 Wiary/s, +30s ostrzegania, +10% regen morale
    └── Max Level: +5 morale po fali per dzwon
```

#### Jednostki Specjalne ✅ ZAIMPLEMENTOWANE
```
├── "Inkwizytor" ✅
│   ├── Wymaga: 1 Forteca Inkwizycji
│   ├── Koszt: 1,000 Wiary, 100 Dukatów
│   ├── Efekt: -3% koszt liturgii (stackuje), +2% efektywność
│   └── Max Level: -20% koszt liturgii globalnie
│
└── "Święty Wojownik" ✅
    ├── Wymaga: 1 Forteca Inkwizycji
    ├── Koszt: 2,000 Wiary, 500 Dukatów
    ├── Efekt: -5% siła fali per wojownik (max -50%)
    └── Max Level: 5% szansa na odparcie fali per wojownik
```

---

### 5. System Relikwii (Artifacts)
**Status:** ✅ ZREALIZOWANE (v0.8)

Zbieralne przedmioty z unikalnymi efektami.

```
Rzadkości:
├── Pospolita (szara) - +5-10% bonusy
├── Rzadka (niebieska) - +15-25% bonusy
├── Epicka (fioletowa) - +30-50% bonusy + efekt specjalny
└── Legendarna (złota) - +50-100% bonusy + potężny efekt

Źródła:
├── Co 10 fal - losowa relikwia (Pospolita/Rzadka)
├── Co 25 fal (boss) - gwarantowana Rzadka+
├── Prestiż - 1 losowa relikwia za każde 10 Popiołów
└── Osiągnięcia - specyficzne relikwie za ukończenie zestawów

Przykładowe Relikwie:
├── "Łza Solmara" (Legendarna)
│   └── +50% regeneracji morale, morale nie spada poniżej 25
│
├── "Kość Męczennika" (Epicka)
│   └── +25% Popiołów z prestiżu
│
├── "Święty Kielich" (Rzadka)
│   └── 10% szansy na podwójne kliknięcie
│
├── "Medalion Ochronny" (Rzadka)
│   └── -15% obrażeń morale
│
└── "Kamień Płomienia" (Pospolita)
    └── +10% produkcji Wiary

Limit aktywnych: 3 sloty (rozszerzalne przez prestiż do 5)
```

---

### 6. Rozszerzony System Walki
**Status:** ✅ ZREALIZOWANE (v0.9)

System walki rozszerzony o nowe typy wrogów, mechanikę combo i boss-fight.

```
Nowe typy wrogów:
├── "Kultyści Mięsa" (podstawowi) ✅
│   └── Standardowe obrażenia, słabi na Błogosławieństwo (+30%)
│
├── "Plugastwa" (elitarni) ✅
│   ├── 2x obrażenia, co 5 fal
│   └── Słabi na Fortyfikację (+40%)
│
├── "Apostaci" (specjalni) ✅
│   ├── Kradną 5% aktualnej Wiary, co 7 fal
│   └── Słabi na Męczeństwo (+60%)
│
├── "Abominacje" (boss) ✅
│   ├── Co 25 fal, 5x DMG, drain morale
│   └── Nagroda: Rzadka/Epicka relikwia + Popioły
│
└── "Arcyheretyk" (mega-boss) ✅
    ├── Co 100 fal, wyłącza 30% budynków
    └── Nagroda: Legendarna relikwia + duże Popioły

Nowe mechaniki:
├── System słabości wrogów na liturgie ✅
├── Combo za szybkie odpieranie fal (+5%/serii, max 30%) ✅
├── Boss Encounters - strategiczne wybory ✅
│   ├── Atak Frontalny: -20% HP bossa
│   ├── Osłabienie: -30% DMG fali
│   └── Poświęcenie: -50% HP za 10% jednostek
└── Panel UI z typem wroga, combo i boss-fight ✅
```

**Implementacja:**
- Store `combat.ts` rozszerzony o typy wrogów i boss encounters
- Komponenty: `CombatPanel.vue` z wyświetlaniem wroga i combo
- System nagród za bossów (relikwie, Popioły, Wiara)
- Persystencja: bossesDefeated, megaBossesDefeated, combo

---

### 7. System Wyzwań Dziennych/Tygodniowych
**Status:** ✅ ZREALIZOWANE

Codzienny i tygodniowy cel dla graczy - dodatkowa motywacja do powrotów.

```
Wyzwania Dzienne (resetowane co 24h):
├── "Obrońca Dnia" - Odpieraj 10 fal → +500 Wiary
├── "Budowniczy" - Zbuduj 5 budynków → +100 Dukatów
├── "Liturg" - Użyj 3 liturgii → +25 morale
├── "Modlitewnik" - Kliknij 50 razy → +200 Wiary
├── "Skarbnik" - Zbierz 1000 Dukatów → +10% produkcji (1h)
└── Bonus za ukończenie wszystkich: Losowa Rzadka relikwia

Wyzwania Tygodniowe (resetowane w poniedziałek):
├── "Mistrz Combo" - Osiągnij 30 combo → Epicka relikwia
├── "Niezłomny" - Odpieraj 100 fal → +1000 Popiołów
├── "Imperium" - Posiadaj 50 budynków → +25% produkcji (24h)
└── "Odrodzony" - Wykonaj 3 prestiże → Legendarna relikwia

Mechanika:
├── Streak bonus: +10% nagrody za każdy kolejny dzień
├── Max streak: 7 dni = +70% nagrody
├── Przerwanie streaka: reset do 0%
└── Panel UI z postępem i czasem do resetu
```

**Implementacja:**
- Store `challenges.ts`
- Komponent `ChallengesPanel.vue`
- Integracja z gameLoop (tracking postępu)
- Persystencja: lastDailyReset, lastWeeklyReset, streak

---

### 8. System Statystyk i Analityki
**Status:** 🔴 DO ZROBIENIA

Panel statystyk z historią i wykresami dla entuzjastów liczb.

```
Statystyki Globalne:
├── Łączna zebrana Wiara (wszystkie cykle)
├── Łączne prestiże / Popioły
├── Łączne odparte fale / straty
├── Najwyższe combo ever
└── Czas gry łącznie

Statystyki Bieżącego Cyklu:
├── Wiara/minutę, Wiara/godzinę
├── Wykres produkcji (ostatnie 24h)
├── Wydajność budynków (ranking)
├── Historia fal (DMG received, losses)
└── Użyte liturgie (skuteczność)

Porównanie Cykli:
├── Tabela z poprzednimi prestiżami
├── Czas do X Wiary
├── Najszybszy prestiż
└── Trend postępu
```

**Implementacja:**
- Store `statistics.ts`
- Komponent `StatisticsPanel.vue`
- Wykresy: Chart.js lub ApexCharts
- Eksport/Share score

---

### 9. System Ascensji (Super-Prestiż)
**Status:** 🔴 DO ZROBIENIA

Meta-progression po 100 prestiżach - nowy endgame.

```
Wymagania:
├── 100 prestiży wykonanych
├── 10,000 Popiołów Męczenników zgromadzonych
└── Wszystkie osiągnięcia z kategorii Prestiż

Mechanika:
├── Reset: Wszystko (w tym ulepszenia prestiżu!)
├── Nowa waluta: "Esencja Świętości"
│   └── 1 Esencja = +1% bazowej produkcji (permanentne)
├── Odblokowania:
│   ├── Tier 4 budynki
│   ├── Nowe relikwie (Ascended rarity)
│   ├── Hard Mode modyfikatory
│   └── Możliwość gry jako Kult Mięsa
└── Tytuł: "Wzniesiony" + specjalna ramka

UI:
├── Złota zakładka "Ascensja" (po 50 prestiżach)
├── Progress bar do odblokowania
├── Preview nagród
└── Potwierdzenie z ostrzeżeniem
```

---

### 10. System Sojuszy/Paktów z NPC
**Status:** 🔴 DO ZROBIENIA

Fakcje NPC do zaprzyjaźnienia z unikalnymi nagrodami.

```
Fakcje:
├── "Zakon Płomienia"
│   ├── Reputacja: misje, donacje Wiary
│   ├── Bonusy: +% produkcji Wiary, unikalne liturgie
│   └── Nagroda max: "Płomień Wieczny" (Legendarna relikwia)
│
├── "Gildia Kupców"
│   ├── Reputacja: donacje Dukatów, handel
│   ├── Bonusy: -% kosztów budynków, +% Dukatów
│   └── Nagroda max: "Midas' Touch" (Legendarna relikwia)
│
└── "Bractwo Wojowników"
    ├── Reputacja: odparte fale, bossowie
    ├── Bonusy: +% obrony, -% strat
    └── Nagroda max: "Tarcza Nieśmiertelnych" (Legendarna)

Mechanika:
├── Poziomy reputacji: Nieznany → Przyjazny → Szanowany → Egzaltowany
├── Misje fakcyjne (dzienne/tygodniowe)
├── Konflikty: wybór jednej fakcji może zrazić inną
└── Eventy specjalne dla wysokiej reputacji
```

---

### 11. Ekspedycje / Idle Adventures
**Status:** 🔴 DO ZROBIENIA

Wysyłanie jednostek na misje przynoszące nagrody.

```
Ekspedycje:
├── "Pielgrzymka" (10 min)
│   ├── Koszt: 2 Kapelanów
│   ├── Nagroda: 500-2000 Wiary
│   └── Ryzyko: 5% szansy na stratę jednostki
│
├── "Krucjata" (30 min)
│   ├── Koszt: 5 jednostek wojskowych
│   ├── Nagroda: Rzadka relikwia + 1000 Wiary
│   └── Ryzyko: 15% szansy na straty
│
├── "Odkrycie Świętego Miejsca" (60 min)
│   ├── Koszt: 10 jednostek + 5000 Wiary
│   ├── Nagroda: Nowy budynek/ulepszenie
│   └── Ryzyko: 25% szansy na straty
│
└── "Wielka Krucjata" (4h) - [Wymaga Ascensji]
    ├── Koszt: 50 jednostek + 50000 Wiary
    ├── Nagroda: Legendarna relikwia + Esencja
    └── Ryzyko: 40% szansy na straty

UI:
├── Mapa z dostępnymi lokacjami
├── Slot na aktywne ekspedycje (max 3)
├── Timer i progress bar
└── Log z wynikami
```

---

### 12. Drzewko Talentów
**Status:** 🔴 DO ZROBIENIA

System specjalizacji z punktami za prestiż i osiągnięcia.

```
Gałęzie:
├── "Wiara" (produkcja)
│   ├── +5% produkcji Wiary per punkt
│   ├── +10% efektywność Kapliczek
│   └── Ultimate: Automatyczna modlitwa +10/s
│
├── "Wojna" (obrona)
│   ├── +5% obrony per punkt
│   ├── -5% obrażeń morale
│   └── Ultimate: Immunitet na 1 falę/prestiż
│
├── "Handel" (ekonomia)
│   ├── -5% kosztów budynków
│   ├── +10% produkcji Dukatów
│   └── Ultimate: Darmowe ulepszenie/prestiż
│
└── "Cuda" (eventy/liturgie)
    ├── +10% efektywność liturgii
    ├── +20% szansa na pozytywne eventy
    └── Ultimate: 1 dodatkowa relikwia slot

Punkty:
├── +1 za prestiż
├── +1 za każde 5 osiągnięć
├── +3 za ascensję
└── Reset: 1000 Popiołów
```

---

## 🔵 PRIORYTET NISKI (Long-term)

### 13. System Fabularny (Story Mode)
**Status:** 🔴 DO ZROBIENIA

- Rozdziały narracyjne odblokowywane przez postęp
- Dialogi z NPC (Wielki Kapłan, Inkwizytorka, Heretyk)
- Wybory moralne wpływające na rozgrywkę
- Zakończenia (dobre/złe/neutralne)

---

### 14. Tryb Kultu Mięsa (Second Faction)
**Status:** 🔴 DO ZROBIENIA

Zgodnie z oryginalnym GDD - druga grywalana frakcja.

- Nowe zasoby: Biomasa, Esencja Ewolucji
- Nowe budynki: Spawalnia, Inkubator, Żerdziel
- Inna mechanika prestiżu
- Wspólny świat z konfliktem frakcji

---

### 15. Multiplayer / Leaderboardy
**Status:** 🔴 DO ZROBIENIA

- Globalne rankingi (najwyższa fala, najwięcej prestiży)
- Tygodniowe wyzwania
- Gildie/klany
- PvP: Atakowanie sanktuariów innych graczy

---

### 16. Offline Progress Enhancement
**Status:** 🔴 DO ZROBIENIA

- Rozszerzone obliczenia offline (>24h)
- "Kapłani nocni" - specjalne bonusy za nieobecność
- Powiadomienia push o ważnych wydarzeniach

---

## 📊 Harmonogram

| Faza | Funkcjonalność | Szacowany czas | Priorytet | Status |
|------|----------------|----------------|-----------|--------|
| **v0.3** | System Osiągnięć | 2-3h | 🔥 Wysoki | ✅ |
| **v0.4** | Ulepszenia budynków | 2-3h | 🔥 Wysoki | ✅ |
| **v0.5** | Wydarzenia losowe | 3-4h | 🔥 Wysoki | ✅ |
| **v0.6** | Budynki Tier 2 | 2-3h | 🟡 Średni | ✅ |
| **v0.7** | Budynki Tier 3 + jednostki specjalne | 3-4h | 🟡 Średni | ✅ |
| **v0.8** | System Relikwii | 4-5h | 🟡 Średni | ✅ |
| **v0.9** | Rozszerzony system walki | 4-5h | 🟡 Średni | ✅ |
| **v0.10** | Budynki Click + Multi-buy | 2h | 🔥 Wysoki | ✅ |
| **v1.0** | System Wyzwań Dziennych/Tygodniowych | 3-4h | 🔥 Wysoki | ✅ |
| **v1.1** | System Statystyk | 3-4h | 🟡 Średni | 🔴 |
| **v1.2** | System Ascensji | 4-5h | 🟡 Średni | 🔴 |
| **v1.3** | Sojusze/Pakty NPC | 4-5h | 🟡 Średni | 🔴 |
| **v1.4** | Ekspedycje | 4-5h | 🟡 Średni | 🔴 |
| **v1.5** | Drzewko Talentów | 4-5h | 🟡 Średni | 🔴 |
| **v2.0+** | Story Mode, Fakcja Kultu, Multiplayer | Długoterminowe | 🔵 Niski | 🔴 |

---

## 📝 Notatki

- Każda nowa funkcjonalność powinna być testowana przed merge'em
- Utrzymywać kompatybilność wsteczną z zapisami graczy
- Dokumentować zmiany w tym pliku
- Aktualizować GDD.md przy większych zmianach designu

---

*Ostatnia aktualizacja: Styczeń 2026*

