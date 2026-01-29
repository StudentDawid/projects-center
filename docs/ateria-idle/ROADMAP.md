# Ateria Idle - Roadmap Rozwoju

## Legenda Statusów

- ✅ **Zaimplementowane** - w pełni działające
- 🔧 **Częściowo** - podstawowa funkcjonalność, wymaga rozbudowy
- 📋 **Planowane** - do zaimplementowania
- 💡 **Pomysł** - propozycja do rozważenia

---

## Status Implementacji Systemów

### Ścieżki Rozwoju

| Ścieżka | Status | Opis |
|---------|--------|------|
| ⚔️ Wojownik | ✅ | Walka, biomy, ekwipunek, dungeony, slayer |
| 🏪 Kupiec | ✅ | Sklep, klienci, haggling, karawany, dynamiczny rynek |
| 🔬 Naukowiec | ✅ | Badania, alchemia, mikstury, golemy |
| ⛏️ Zbieracz | ✅ | 4 umiejętności zbierania (górnictwo, drwal, wędkarstwo, zielarstwo), narzędzia |
| 🔨 Rzemieślnik | ✅ | Crafting, 4 profesje (kowalstwo, krawiectwo, jubilerstwo, stolarstwo), jakość wytworu |
| 🎭 Dyplomata | ✅ | 7 frakcji, reputacja, misje dyplomatyczne, tytuły, wpływy |
| 🌿 Druid | ✅ | Rolnictwo, hodowla zwierząt, pory roku, 6 totemów natury |
| 🔮 Mistyk | ✅ | Medytacja, transy, przepowiednie, rytuały, karty tarota |

### Systemy Podstawowe

| System | Status | Opis |
|--------|--------|------|
| Walka tickowa | ✅ | Automatyczna walka z potworami |
| Biomy | ✅ | 6 biomów z unikalnymi potworami i efektami |
| Efekty środowiskowe | ✅ | DOT, debuffs, modyfikatory walki |
| Ekwipunek | ✅ | Pełny system z jakością i statystykami |
| Dungeony | ✅ | 5 tierów, fale, bossy, klucze |
| Slayer | ✅ | Zadania łowcy, monety, sklep, giełda |
| Prestiż | ✅ | Legacy Points, drzewko ulepszeń, bramy |
| Osiągnięcia | ✅ | 50+ osiągnięć w kategoriach z nagrodami |
| Wydarzenia | ✅ | Festiwale, bonusy weekendowe, wyzwania dzienne |
| Loadouty | ✅ | Zapisywanie i przełączanie zestawów ekwipunku |
| Integracje | ✅ | Przekazywanie łupów, system jedzenia, alokacja mikstur |
| Postęp offline | ✅ | Dla wszystkich ścieżek |
| System dropów | ✅ | Procentowe szanse, ekwipunek z humanoidów, jedzenie |

### Systemy do Rozbudowy

| System | Status | Co brakuje |
|--------|--------|------------|
| Township | 📋 | Cały system budowania osady |
| Questy | 📋 | System fabularnych zadań |
| World Bosses | 📋 | Globalni bossowie z unikalnymi nagrodami |
| Eksploracja | 📋 | Mapa świata, fog of war, POI |
| Lore/Kodeks | 📋 | Encyklopedia świata Aterii |
| Zamówienia rzemieślnicze | 🔧 | Dane są, brak UI i pełnej integracji |

---

## Mapa Zależności Między Ścieżkami

### Legenda Zależności

- ✅ **Zaimplementowane** - zależność działa w grze
- 🔧 **Częściowo** - podstawowa funkcjonalność
- 📋 **Do zrobienia** - logiczne, wymaga implementacji
- 💡 **Propozycja** - do rozważenia w przyszłości

---

### Macierz Zależności (Zaimplementowane Ścieżki)

```
              │ ⚔️Woj │ 🏪Kup │ 🔬Nau │ ⛏️Zbi │ 🔨Rze │ 🎭Dyp │ 🌿Dru │ 🔮Mis │
──────────────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┤
⚔️ Wojownik   │   -   │  ✅   │  ✅   │  📋   │  ✅   │  📋   │  📋   │  📋   │
🏪 Kupiec     │  ✅   │   -   │  ✅   │  📋   │  📋   │  📋   │  📋   │  📋   │
🔬 Naukowiec  │  ✅   │  ✅   │   -   │  📋   │  📋   │  📋   │  📋   │  📋   │
⛏️ Zbieracz   │  🔧   │  📋   │  📋   │   -   │  ✅   │  📋   │  📋   │  📋   │
🔨 Rzemieślnik│  ✅   │  📋   │  📋   │  ✅   │   -   │  📋   │  📋   │  📋   │
🎭 Dyplomata  │  📋   │  📋   │  📋   │  📋   │  📋   │   -   │  📋   │  📋   │
🌿 Druid      │  📋   │  📋   │  📋   │  📋   │  📋   │  📋   │   -   │  📋   │
🔮 Mistyk     │  📋   │  📋   │  📋   │  📋   │  📋   │  📋   │  📋   │   -   │
```

---

### ✅ Zależności Zaimplementowane

#### ⚔️ Wojownik ↔ Inne Ścieżki

| Od/Do | Opis Zależności | Status |
|-------|-----------------|--------|
| Wojownik → Kupiec | Łupy z potworów trafiają do magazynu sklepu | ✅ |
| Wojownik → Naukowiec | Materiały potworów (esencje) dla alchemii | ✅ |
| Naukowiec → Wojownik | Mikstury (HP, DMG, obrona) dla walki | ✅ |
| Rzemieślnik → Wojownik | Ekwipunek (broń, zbroja) z craftingu | ✅ |
| Kupiec → Wojownik | Zakup ekwipunku w sklepie | ✅ |

#### 🏪 Kupiec ↔ Inne Ścieżki

| Od/Do | Opis Zależności | Status |
|-------|-----------------|--------|
| Wojownik → Kupiec | Przedmioty z walki na sprzedaż | ✅ |
| Naukowiec → Kupiec | Mikstury na sprzedaż w sklepie | ✅ |
| Kupiec → Naukowiec | Złoto na zakup składników | ✅ |

#### ⛏️ Zbieracz ↔ Inne Ścieżki

| Od/Do | Opis Zależności | Status |
|-------|-----------------|--------|
| Zbieracz → Rzemieślnik | Surowce (rudy, drewno, zioła) do craftingu | ✅ |
| Rzemieślnik → Zbieracz | Narzędzia (kilofy, siekiery) do zbierania | ✅ |
| Zbieracz → Wojownik | Narzędzia mają statystyki bojowe | 🔧 |

---

### 📋 Zależności Do Zaimplementowania

#### ⚔️ Wojownik - Brakujące Połączenia

| Od/Do | Proponowana Zależność | Priorytet |
|-------|----------------------|-----------|
| Druid → Wojownik | Jedzenie (buffy HP regen, +statystyki) | 🔴 Wysoki |
| Druid → Wojownik | Totemy natury dające bonusy bojowe | 🔴 Wysoki |
| Mistyk → Wojownik | Przepowiednie o słabościach bossów | 🟡 Średni |
| Mistyk → Wojownik | Rytuały (Duch Wojownika, Tarcza) | 🟡 Średni |
| Dyplomata → Wojownik | Frakcje otwierające nowe biomy | 🟡 Średni |
| Dyplomata → Wojownik | Sojusze dające bonusy bojowe | 🟢 Niski |

#### 🏪 Kupiec - Brakujące Połączenia

| Od/Do | Proponowana Zależność | Priorytet |
|-------|----------------------|-----------|
| Druid → Kupiec | Produkty farmy (jedzenie, wino, miód) na sprzedaż | 🔴 Wysoki |
| Rzemieślnik → Kupiec | Craftowane przedmioty na wystawę | 🔴 Wysoki |
| Zbieracz → Kupiec | Surowe materiały na sprzedaż | 🟡 Średni |
| Mistyk → Kupiec | Przepowiednie rynkowe (trendy cen) | 🟡 Średni |
| Dyplomata → Kupiec | Traktaty handlowe (lepsze ceny z frakcjami) | 🟡 Średni |

#### 🔬 Naukowiec - Brakujące Połączenia

| Od/Do | Proponowana Zależność | Priorytet |
|-------|----------------------|-----------|
| Zbieracz → Naukowiec | Zioła jako składniki alchemiczne | 🔴 Wysoki |
| Druid → Naukowiec | Rzadkie rośliny dla badań | 🟡 Średni |
| Mistyk → Naukowiec | Oświecenie przyspieszające badania | 🟡 Średni |
| Dyplomata → Naukowiec | Dostęp do wiedzy frakcji (Zakon Magów) | 🟢 Niski |

#### 🎭 Dyplomata - Brakujące Połączenia

| Od/Do | Proponowana Zależność | Priorytet |
|-------|----------------------|-----------|
| Kupiec → Dyplomata | Łapówki/prezenty zwiększające reputację | 🟡 Średni |
| Wojownik → Dyplomata | Demonstracja siły w negocjacjach | 🟡 Średni |
| Naukowiec → Dyplomata | Sekrety technologiczne jako karta przetargowa | 🟢 Niski |
| Rzemieślnik → Dyplomata | Prezenty craftingowe dla frakcji | 🟢 Niski |
| Druid → Dyplomata | Ochrona przyrody = reputacja u Plemienia Leśnego | 🟢 Niski |

#### 🌿 Druid - Brakujące Połączenia

| Od/Do | Proponowana Zależność | Priorytet |
|-------|----------------------|-----------|
| Mistyk → Druid | Przepowiednie pogodowe (pory roku) | 🟡 Średni |
| Zbieracz → Druid | Nasiona z zielarstwa | 🟡 Średni |
| Dyplomata → Druid | Bonusy od Plemienia Leśnego | 🟢 Niski |

#### 🔮 Mistyk - Brakujące Połączenia

| Od/Do | Proponowana Zależność | Priorytet |
|-------|----------------------|-----------|
| Naukowiec → Mistyk | Składniki alchemiczne dla rytuałów | 🟡 Średni |
| Druid → Mistyk | Rzadkie zioła dla medytacji | 🟡 Średni |
| Rzemieślnik → Mistyk | Artefakty magiczne (kryształowe kule, różdżki) | 🟢 Niski |

---

### 💡 Zależności z Proponowanymi Ścieżkami

#### 🍳 Kucharz - Proponowane Połączenia

| Od/Do | Proponowana Zależność |
|-------|----------------------|
| Zbieracz → Kucharz | Ryby z wędkarstwa jako składniki |
| Druid → Kucharz | Warzywa, owoce, mięso, jajka, mleko |
| Wojownik → Kucharz | Mięso z potworów |
| Kucharz → Wojownik | Posiłki dające buffy bojowe |
| Kucharz → Kupiec | Potrawy na sprzedaż |
| Kucharz → Dyplomata | Bankiety zwiększające reputację |

#### 🎣 Wędkarz - Proponowane Połączenia

| Od/Do | Proponowana Zależność |
|-------|----------------------|
| Wędkarz → Kucharz | Ryby jako składniki potraw |
| Wędkarz → Naukowiec | Olej rybi, perły dla alchemii |
| Wędkarz → Rzemieślnik | Perły dla jubilerstwa |
| Wędkarz → Kupiec | Eksport ryb i przetworów |
| Mistyk → Wędkarz | Przepowiednie o dobrych łowiskach |
| Druid → Wędkarz | Pory roku wpływają na połowy |

#### 🧙 Czarodziej - Proponowane Połączenia

| Od/Do | Proponowana Zależność |
|-------|----------------------|
| Czarodziej → Wojownik | Zaklęcia ofensywne jako alternatywa/wsparcie |
| Mistyk → Czarodziej | Mana jako wspólny zasób |
| Naukowiec → Czarodziej | Wspólne badania magiczne |
| Rzemieślnik → Czarodziej | Różdżki, księgi, artefakty |
| Czarodziej → Rzemieślnik | Enchanting przedmiotów |
| Dyplomata → Czarodziej | Dostęp do Zakonu Magów |

#### ⛪ Kapłan - Proponowane Połączenia

| Od/Do | Proponowana Zależność |
|-------|----------------------|
| Kapłan → Wojownik | Uzdrawianie, błogosławieństwa, wskrzeszenie |
| Kapłan → Mistyk | Wspólne rytuały duchowe |
| Kapłan → Dyplomata | Wpływy religijne we frakcjach |
| Kupiec → Kapłan | Ofiary/donacje |
| Rzemieślnik → Kapłan | Święte relikwie, ołtarze |

#### 🏴‍☠️ Odkrywca - Proponowane Połączenia

| Od/Do | Proponowana Zależność |
|-------|----------------------|
| Odkrywca → Wojownik | Odkrywanie nowych biomów |
| Odkrywca → Zbieracz | Nowe źródła surowców |
| Odkrywca → Rzemieślnik | Starożytne schematy |
| Odkrywca → Naukowiec | Artefakty do badań |
| Odkrywca → Kupiec | Mapy na sprzedaż |
| Odkrywca → Dyplomata | Kontakty z odległymi frakcjami |

#### ⚗️ Alchemik - Proponowane Połączenia

| Od/Do | Proponowana Zależność |
|-------|----------------------|
| Naukowiec ↔ Alchemik | Wspólne badania, dzielenie się recepturami |
| Zbieracz → Alchemik | Rzadkie składniki |
| Druid → Alchemik | Magiczne rośliny |
| Alchemik → Wojownik | Potężne eliksiry |
| Alchemik → Kupiec | Transmutacja (ołów → złoto) |

#### 👤 Szpieg - Proponowane Połączenia

| Od/Do | Proponowana Zależność |
|-------|----------------------|
| Dyplomata ↔ Szpieg | Rozszerzenie dyplomacji, wywiad |
| Szpieg → Wojownik | Informacje o słabościach wrogów |
| Szpieg → Kupiec | Informacje o cenach konkurencji |
| Szpieg → Naukowiec | Skradzione receptury |
| Kupiec → Szpieg | Finansowanie sieci szpiegów |

#### 🐲 Zaklinacz - Proponowane Połączenia

| Od/Do | Proponowana Zależność |
|-------|----------------------|
| Zaklinacz → Wojownik | Bestie bojowe |
| Zaklinacz → Kupiec | Egzotyczne zwierzęta na sprzedaż |
| Zaklinacz → Dyplomata | Prezenty dla frakcji |
| Druid ↔ Zaklinacz | Wspólna praca ze zwierzętami |
| Naukowiec → Zaklinacz | Badania nad bestiami |

#### 🏛️ Architekt - Proponowane Połączenia

| Od/Do | Proponowana Zależność |
|-------|----------------------|
| Rzemieślnik → Architekt | Materiały budowlane |
| Zbieracz → Architekt | Surowce (kamień, drewno) |
| Architekt → Wszystkie | Budynki Township dające bonusy |
| Kupiec → Architekt | Finansowanie budowy |
| Dyplomata → Architekt | Ambasady, sale audiencyjne |

#### 🎵 Bard - Proponowane Połączenia

| Od/Do | Proponowana Zależność |
|-------|----------------------|
| Bard → Wszystkie | Pieśni Mocy (globalne buffy) |
| Bard → Kupiec | Zarobki z występów |
| Bard → Dyplomata | Propaganda, wpływ na frakcje |
| Rzemieślnik → Bard | Instrumenty muzyczne |

---

### Diagram Przepływu Zasobów (Aktualny)

```
                     ┌─────────────┐
                     │   WALKA     │
                     │ (Wojownik)  │
                     └──────┬──────┘
                            │ łupy, materiały
                            ▼
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│    MAGAZYN    │   │   ALCHEMIA    │   │   ZBIERANIE   │
│   (Kupiec)    │   │  (Naukowiec)  │   │   (Zbieracz)  │
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘
        │                   │                   │
        │ sprzedaż          │ mikstury          │ surowce
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│     ZŁOTO     │   │   WOJOWNIK    │   │   CRAFTING    │
│   (zasób)     │◄──│   (buffs)     │◄──│ (Rzemieślnik) │
└───────────────┘   └───────────────┘   └───────┬───────┘
                                                │
                                                │ ekwipunek
                                                ▼
                                        ┌───────────────┐
                                        │   WOJOWNIK    │
                                        │   (użycie)    │
                                        └───────────────┘
```

---

### Diagram Przepływu Zasobów (Planowany)

```
                            ┌─────────────────┐
                            │     MISTYK      │
                            │  przepowiednie  │
                            └────────┬────────┘
                                     │
        ┌────────────────────────────┼────────────────────────────┐
        │                            │                            │
        ▼                            ▼                            ▼
┌───────────────┐            ┌───────────────┐            ┌───────────────┐
│   DYPLOMATA   │            │    DRUID      │            │   WOJOWNIK    │
│   polityka    │            │   farming     │            │    walka      │
└───────┬───────┘            └───────┬───────┘            └───────┬───────┘
        │                            │                            │
        │ traktaty                   │ jedzenie                   │ łupy
        │                            │ składniki                  │
        ▼                            ▼                            ▼
┌───────────────┐            ┌───────────────┐            ┌───────────────┐
│    KUPIEC     │◄───────────│   NAUKOWIEC   │◄───────────│   MAGAZYN     │
│    handel     │            │   alchemia    │            │   (sklep)     │
└───────┬───────┘            └───────┬───────┘            └───────────────┘
        │                            │
        │ złoto                      │ mikstury
        ▼                            ▼
┌───────────────┐            ┌───────────────┐
│   ZBIERACZ    │────────────│  RZEMIEŚLNIK  │
│   surowce     │  materiały │   crafting    │
└───────────────┘            └───────┬───────┘
                                     │
                                     │ ekwipunek, narzędzia
                                     ▼
                             ┌───────────────┐
                             │   WOJOWNIK    │
                             │   ZBIERACZ    │
                             └───────────────┘
```

---

### Priorytety Implementacji Zależności

| Priorytet | Zależność | Wpływ na grę |
|-----------|-----------|--------------|
| 🔴 1 | Druid → Wojownik (jedzenie) | Znaczący - buffy HP |
| 🔴 2 | Druid/Zbieracz → Kupiec (produkty) | Znaczący - nowe towary |
| 🔴 3 | Zbieracz → Naukowiec (zioła) | Znaczący - składniki |
| 🟡 4 | Mistyk → Wojownik (przepowiednie) | Umiarkowany |
| 🟡 5 | Dyplomata → frakcje (bonusy) | Umiarkowany |
| 🟡 6 | Mistyk → Kupiec (prognozy rynku) | Umiarkowany |
| 🟢 7 | Rzemieślnik → Mistyk (artefakty) | Niski |
| 🟢 8 | Dyplomata → Druid (Plemię Leśne) | Niski |

---

## Zaimplementowane Szczegóły

### ⛏️ System Zbierania (Gathering)

**Umiejętności:**
- Górnictwo (15 surowców: od kamienia po adamantyt)
- Drwalnictwo (12 surowców: od drewna po drewno pradrzewa)
- Wędkarstwo (12 surowców: od małej ryby po morskiego lewiatana)
- Zielarstwo (12 surowców: od podstawowych ziół po kosmiczne kwiaty)

**Narzędzia:**
- Kilofy, siekiery, wędki, sierpy
- 8-10 poziomów narzędzi na kategorię
- Bonusy: siła zbierania, szybkość, dodatkowe plony, szansa na rzadkie
- Statystyki bojowe (do walki o materiały)

### 🔨 System Craftingu

**Profesje:**
- Kowalstwo (miecze, zbroje, narzędzia)
- Krawiectwo (lekkie zbroje, ubrania)
- Jubilerstwo (pierścienie, amulety, cięcie kamieni)
- Stolarstwo (łuki, tarcze)

**Materiały przetworzone:** 30+ (sztabki, deski, skóry, tkaniny, kamienie)

**System jakości:** 
- 6 poziomów: Słaba → Przeciętna → Dobra → Świetna → Wybitna → Mistrzowska
- Jakość zależy od: poziomu umiejętności, tier materiałów, bonusów

### 🎭 System Dyplomaty

**7 Frakcji:**
1. Królestwo Aterii (militarni) - bonusy do walki
2. Gildia Złodziei (cienie) - drop, czarny rynek
3. Klan Górski (krasnoludy) - crafting, górnictwo
4. Zakon Magów (uczeni) - badania, receptury
5. Plemię Leśne (elfy) - farming, natura
6. Konfederacja Kupiecka (handel) - zyski, ekskluzywne towary
7. Kult Pustki (mroczni) - mroczne moce

**System reputacji:** 6 poziomów (-100 do +100)
- Wrogi → Nieprzyjazny → Neutralny → Przyjazny → Szanowany → Sojusznik

**Misje:** Negocjacje, sojusze, umowy handlowe, szpiegostwo, arbitraż

**Statystyki:** Charyzma, Perswazja, Intryga, Renoma

### 🌿 System Druida

**Rolnictwo:**
- 12 upraw (warzywa, zboża, owoce, zioła, kwiaty)
- 4-tierowy system z wymaganiami poziomu
- System podlewania i jakości

**Hodowla:**
- 8 typów zwierząt (kury, kaczki, krowy, owce, świnie, kozy, ule, jedwabniki)
- System szczęścia wpływający na produkcję

**Pory roku:** Wiosna, Lato, Jesień, Zima
- Każda z unikalnymi bonusami/karami

**6 Totemów:**
- Wilk (+obrażenia), Niedźwiedź (+HP), Orzeł (+krytyk)
- Żółw (+obrona), Wąż (+uniki), Sowa (+XP)
- 10 poziomów ulepszeń na totem

### 🔮 System Mistyka

**Medytacja:**
- 10 poziomów: Nowicjusz → Awatar
- Regeneracja many i oświecenia
- 4 typy transu: Spokoju, Wizji, Duchowy, Pustki

**8 Przepowiedni:**
- Rynkowe (dla Kupca)
- Pogodowe (dla Druida)
- Bojowe (dla Wojownika)
- Ostrzeżenia (karawany)
- Polityczne (Dyplomata)
- Odkrycia (Naukowiec)

**7 Rytuałów (4 tiery):**
- Błogosławieństwo Światła (+50% XP)
- Rytuał Fortuny (+30% złota)
- Duch Wojownika (+40% obrażeń)
- Tarcza Przodków (nietykalność)
- Awatar Mocy (+25% wszystko)

**Tarot:**
- 22 karty Wielkiej Arkany
- Codzienne losowanie z bonusem na dzień
- System kolekcjonowania

---

## Propozycje Nowych Ścieżek

### 🏴‍☠️ ŚCIEŻKA 8: ODKRYWCA (The Explorer)

*"Za każdym horyzontem czeka nowy świat"*

**Opis:** Ścieżka skupiona na eksploracji, kartografii i odkrywaniu sekretów.

**Mechaniki:**
- **Ekspedycje**: Wyprawy do nieznanych krain
  - Koszt: zasoby, czas, ryzyko
  - Nagrody: mapy, artefakty, wiedza
  - Typy: morskie, lądowe, podziemne, niebieskie

- **Kartografia**: 
  - Tworzenie map nowych regionów
  - Odkrywanie sekretnych lokacji
  - Sprzedaż map innym (bonus dla Kupca)

- **Archeologia**:
  - Wykopaliska w ruinach
  - Odkrywanie starożytnych artefaktów
  - Rozszyfrowywanie tekstów

- **Survival Skills**:
  - Przetrwanie w różnych środowiskach
  - Budowanie obozów
  - Tropienie

**Synergia:**
- Nowe biomy dla Wojownika
- Rzadkie materiały dla Rzemieślnika
- Starożytna wiedza dla Naukowca
- Kontakty z odległymi frakcjami dla Dyplomaty

**Złożoność:** ⭐⭐⭐

---

### 🎵 ŚCIEŻKA 9: BARD (The Bard)

*"Pieśń ma moc zmieniać serca i umysły"*

**Opis:** Ścieżka skupiona na muzyce, opowieściach i inspiracji.

**Mechaniki:**
- **Występy**: 
  - Granie w tawernach za złoto
  - Koncerty zwiększające morale całej gry
  - Różne instrumenty z bonusami

- **Pieśni Mocy**:
  - Buffs dla innych ścieżek
  - Pieśń Wojenna (+obrażenia)
  - Pieśń Handlowa (+zyski)
  - Pieśń Inspiracji (+XP)

- **Legendy**:
  - Odkrywanie i opowiadanie legend
  - Bonusy za poznane historie
  - Wpływ na reputację frakcji

- **Teatr**:
  - Organizowanie przedstawień
  - Propagowanie wartości (wpływ na Dyplomację)

**Synergia:**
- Buff Pieśni Wojennej dla Wojownika
- Rozrywka w sklepie dla Kupca
- Inspiracja dla badań Naukowca
- Propaganda dla Dyplomaty

**Złożoność:** ⭐⭐

---

### ⚗️ ŚCIEŻKA 10: ALCHEMIK (The Alchemist)

*"Wszystko jest możliwe, wystarczy odpowiednia formuła"*

**Opis:** Zaawansowana ścieżka alchemiczna, rozszerzenie Naukowca.

**Mechaniki:**
- **Transmutacja**:
  - Zamiana materiałów (ołów w złoto, ale drogie)
  - Ulepszanie jakości surowców
  - Tworzenie nowych materiałów

- **Eliksiry Mocy**:
  - Silniejsze mikstury niż standardowe
  - Efekty permanentne (do następnego prestiżu)
  - Eliksir Nieśmiertelności jako cel końcowy

- **Homunculus**:
  - Tworzenie sztucznych pomocników
  - Różne typy: bojowy, zbierający, craftujący
  - Ewolucja i rozwój

- **Kamień Filozoficzny**:
  - Legendarny cel długoterminowy
  - Ogromne bonusy do wszystkiego
  - Wymaga setek godzin grania

**Synergia:**
- Potężne mikstury dla Wojownika
- Transmutacja złota dla Kupca
- Wspólne badania z Naukowcem
- Składniki od Druida

**Złożoność:** ⭐⭐⭐⭐

---

### 🏛️ ŚCIEŻKA 11: ARCHITEKT (The Architect)

*"Budować znaczy tworzyć dziedzictwo"*

**Opis:** Ścieżka skupiona na budowaniu i Township.

**Mechaniki:**
- **Budynki**:
  - Projektowanie i stawianie budynków
  - Unikalne architektury (elficka, krasnoludzka, ludzka)
  - Budynki specjalne z questów

- **Infrastruktura**:
  - Drogi (szybsze karawany)
  - Mosty (nowe regiony)
  - Kanalizacja (zdrowie osady)

- **Fortyfikacje**:
  - Obrona przed najazdami
  - Wieże strażnicze
  - Mury i bramy

- **Cuda Świata**:
  - Monumentalne budowle
  - Wymagają ogromnych zasobów
  - Permanentne globalne bonusy

**Synergia:**
- Koszary dla Wojownika
- Targi dla Kupca
- Laboratoria dla Naukowca
- Sale audiencyjne dla Dyplomaty

**Złożoność:** ⭐⭐⭐

---

### 👤 ŚCIEŻKA 12: SZPIEG (The Spy)

*"Informacja to najpotężniejsza broń"*

**Opis:** Ścieżka cienia, rozszerzenie Dyplomaty.

**Mechaniki:**
- **Infiltracja**:
  - Wnikanie do wrogich frakcji
  - Zdobywanie sekretnych informacji
  - Sabotaż

- **Sieć Szpiegów**:
  - Rekrutowanie agentów
  - Rozmieszczanie w różnych lokacjach
  - Pasywne zbieranie informacji

- **Kontrwywiad**:
  - Ochrona przed szpiegami
  - Wykrywanie zdrajców
  - Dezinformacja

- **Skrytobójstwo**:
  - Eliminacja kluczowych celów
  - Wysokie ryzyko, wysokie nagrody
  - Wpływ na politykę frakcji

**Synergia:**
- Informacje o słabościach potworów dla Wojownika
- Informacje handlowe dla Kupca
- Skradzione receptury dla Naukowca
- Szantaż dla Dyplomaty

**Złożoność:** ⭐⭐⭐⭐

---

### ⛪ ŚCIEŻKA 13: KAPŁAN (The Priest)

*"Wiara czyni cuda"*

**Opis:** Ścieżka duchowa skupiona na religii, uzdrowieniu i błogosławieństwach.

**Mechaniki:**
- **Modlitwy**:
  - Codzienne modlitwy za bonusy
  - Różne bóstwa z unikalnymi błogosławieństwami
  - System pobożności

- **Uzdrawianie**:
  - Leczenie ran Wojownika
  - Oczyszczanie z trucizn i klątw
  - Wskrzeszenie (powrót bez kar)

- **Błogosławieństwa**:
  - Święcenie przedmiotów (+bonusy)
  - Ochrona przed złem
  - Aura świętości

- **Świątynia**:
  - Budowanie miejsc kultu
  - Wyznawcy generujący zasoby
  - Święte relikwie

- **Egzorcyzmy**:
  - Walka z demonami i nieumarłymi
  - Oczyszczanie przeklętych lokacji
  - Bonusy przeciwko złu

**Synergia:**
- Uzdrawianie i błogosławieństwa dla Wojownika
- Święcone towary dla Kupca (wyższa cena)
- Boska wiedza dla Naukowca
- Wpływy religijne dla Dyplomaty
- Rytuały wspólne z Mistykiem

**Złożoność:** ⭐⭐⭐

---

### 🐲 ŚCIEŻKA 14: ZAKLINACZ (The Tamer)

*"Każda bestia może zostać przyjacielem"*

**Opis:** Ścieżka oswajania i hodowli stworzeń.

**Mechaniki:**
- **Oswajanie**:
  - Łapanie dzikich stworzeń
  - Różne metody (siła, jedzenie, magia)
  - Szanse zależne od poziomu i ekwipunku

- **Hodowla**:
  - Rozmnażanie stworzeń
  - Krzyżowanie gatunków
  - Unikalne hybrydy

- **Wierzchowce**:
  - Szybsza podróż
  - Bonusy w walce
  - Unikalne zdolności

- **Arena Bestii**:
  - Walki między stworami
  - Zakłady
  - Turnieje

**Synergia:**
- Bestie bojowe dla Wojownika
- Egzotyczne towary dla Kupca
- Badania nad bestiami dla Naukowca
- Prezenty dla frakcji (Dyplomata)

**Złożoność:** ⭐⭐⭐

---

### 🍳 ŚCIEŻKA 15: KUCHARZ (The Chef)

*"Droga do serca prowadzi przez żołądek"*

**Opis:** Ścieżka kulinarna skupiona na gotowaniu, przepisach i restauracji.

**Mechaniki:**
- **Gotowanie**:
  - Przygotowywanie posiłków z surowców
  - Receptury od prostych do mistrzowskich
  - Jakość potrawy zależna od umiejętności

- **Przepisy**:
  - Odkrywanie przez eksperymentowanie
  - Przepisy regionalne (różne biomy)
  - Sekretne przepisy od NPC
  - Księga Kucharza

- **Efekty Jedzenia**:
  - Buffy czasowe (HP regen, +obrażenia, +obrona)
  - Efekty specjalne (odporności, bonusy do skill)
  - Jedzenie luksusowe = silniejsze efekty

- **Restauracja**:
  - Prowadzenie własnej tawerny
  - Klienci z różnymi gustami
  - Konkursy kulinarne
  - Gwiazdy Michelin (reputacja)

- **Catering**:
  - Bankiety dla frakcji (Dyplomata)
  - Prowiant dla karawan
  - Jedzenie dla Township

**Synergia:**
- Buffy żywieniowe dla Wojownika
- Sprzedaż potraw dla Kupca
- Składniki alchemiczne od Kucharza dla Naukowca
- Produkty od Druida jako składniki
- Bankiety dla Dyplomaty

**Złożoność:** ⭐⭐

---

### 🎣 ŚCIEŻKA 16: WĘDKARZ (The Fisherman)

*"Cierpliwość zawsze zostaje wynagrodzona"*

**Opis:** Rozbudowana ścieżka wędkarska z głęboką mechaniką łowienia.

**Mechaniki:**
- **Łowienie**:
  - Różne typy wód (rzeka, jezioro, morze, podziemne)
  - Pory dnia wpływające na połowy
  - Pogoda wpływająca na ryby
  - Mini-gra łowienia (timing, siła)

- **Sprzęt Wędkarski**:
  - Wędki różnych jakości
  - Kołowrotki (szybkość, siła)
  - Przynęty (specyficzne dla ryb)
  - Łodzie (dostęp do głębokich wód)

- **Ryby**:
  - 50+ gatunków ryb
  - Legendarne ryby (unikalne, trudne do złapania)
  - Trofea ścienne
  - Akwarium (kolekcjonowanie)

- **Przetwórstwo**:
  - Wędzenie ryb
  - Kawior z ikry
  - Olej rybi (alchemia)
  - Perły z małży

- **Turnieje**:
  - Zawody wędkarskie
  - Rekordy wielkości ryb
  - Nagrody i trofea

**Synergia:**
- Ryby jako składniki dla Kucharza
- Eksport ryb dla Kupca
- Rzadkie składniki dla Naukowca
- Perły dla Jubilera (Rzemieślnik)

**Złożoność:** ⭐⭐⭐

---

### 🧙 ŚCIEŻKA 17: CZARODZIEJ (The Wizard)

*"Magia to sztuka zginania rzeczywistości"*

**Opis:** Ścieżka arcane'owa skupiona na zaklęciach bojowych i magii żywiołów.

**Mechaniki:**
- **Szkoły Magii**:
  - Ogień (obrażenia, DOT)
  - Lód (spowolnienie, zamrożenie)
  - Błyskawica (szybkość, przebicie)
  - Arkana (czysta magia, uniwersalna)
  - Nekromancja (nieumarli, drain)
  - Iluzja (uniki, dezorientacja)

- **Zaklęcia**:
  - Aktywne zaklęcia bojowe
  - Pasywne aury
  - Zaklęcia użytkowe (teleport, widzenie)
  - Rytuały (potężne, długi cast)

- **Mana System**:
  - Regeneracja many
  - Medytacja dla szybszej regeneracji
  - Artefakty zwiększające pulę
  - Pożeranie many (od wrogów)

- **Grimuar**:
  - Księga zaklęć
  - Odkrywanie nowych zaklęć
  - Ulepszanie istniejących
  - Tworzenie własnych zaklęć

- **Wieża Maga**:
  - Osobista wieża jako baza
  - Laboratorium magiczne
  - Obserwatorium gwiazd
  - Portal do innych lokacji

**Synergia:**
- Zaklęcia ofensywne dla Wojownika (lub zamiast)
- Magiczne towary dla Kupca
- Wspólne badania z Naukowcem
- Połączenie z Mistykiem (inne podejście do magii)
- Enchanting dla Rzemieślnika

**Złożoność:** ⭐⭐⭐⭐

---

## Planowane Systemy Ogólne

### 🏰 Township (Osada) - 📋 PLANOWANE

System budowania i rozwijania bazy gildii.

**Budynki:**
| Budynek | Efekt | Wymagania |
|---------|-------|-----------|
| Kuźnia | +% do jakości ekwipunku | Wojownik Lvl 20 |
| Laboratorium | +% do prędkości badań | Naukowiec Lvl 15 |
| Targ | +% do zysków ze sprzedaży | Kupiec Lvl 15 |
| Koszary | +% do HP Wojownika | 1000 Gold |
| Biblioteka | +% do XP wszystkich ścieżek | 5000 Gold |
| Bank | Pasywne generowanie złota | Kupiec Lvl 30 |
| Świątynia | Bonusy Mistyka | Mistyk Lvl 10 |
| Ambasada | Bonusy Dyplomaty | Dyplomata Lvl 15 |
| Stajnie | Szybsze karawany | Kupiec Lvl 20 |
| Obserwatorium | Bonusy do przepowiedni | Mistyk Lvl 20 |

---

### 📜 System Questów - 📋 PLANOWANE

Fabularne zadania rozwijające historię świata.

**Typy:**
| Typ | Opis | Nagrody |
|-----|------|---------|
| Main Story | Główna fabuła Aterii | Unikalne przedmioty, LP |
| Side Quest | Poboczne historie | Złoto, XP |
| Faction Quest | Zadania frakcji | Reputacja, odblokowania |
| Repeatable | Powtarzalne zadania | Materiały |
| Hidden | Ukryte warunki | Sekrety, achievements |

---

### 🐉 World Bosses - 📋 PLANOWANE

| Boss | Spawn | Trudność | Unikalna Nagroda |
|------|-------|----------|------------------|
| Starożytny Smok | Niedziela | ⭐⭐⭐⭐⭐ | Smocza Zbroja |
| Lodowy Tytan | Co 3 dni | ⭐⭐⭐⭐ | Młot Mrozu |
| Król Goblinów | Codziennie | ⭐⭐ | Korona Goblinów |
| Avatar Pustki | Raz w miesiącu | ⭐⭐⭐⭐⭐⭐ | Fragment Pustki |
| Pramatka Lasów | Co tydzień | ⭐⭐⭐ | Łuk Natury |
| Mechaniczny Tytan | Co 5 dni | ⭐⭐⭐⭐ | Serce Golema |

---

### 🗺️ System Eksploracji - 📋 PLANOWANE

- Mapa świata z regionami do odkrycia
- Fog of War - odkrywanie przez eksplorację
- POI (Points of Interest): Ruiny, Wioski, Dungeons, Sekrety
- Random Events podczas podróży
- Fast Travel między odkrytymi lokacjami

---

### 📜 Lore/Kodeks - 📋 PLANOWANE

- Bestiariusz (potwory)
- Herbarium (rośliny)
- Atlas (lokacje)
- Kroniki (historia)
- Biografie (NPC)
- Artefakty (legendarne przedmioty)

---

## Propozycja Kolejności Implementacji

| Priorytet | Nazwa | Status | Złożoność |
|-----------|-------|--------|-----------|
| ✅ | Crafting & Gathering | Zaimplementowane | ⭐⭐⭐ |
| ✅ | Dyplomata | Zaimplementowane | ⭐⭐⭐⭐ |
| ✅ | Druid | Zaimplementowane | ⭐⭐⭐ |
| ✅ | Mistyk | Zaimplementowane | ⭐⭐⭐ |
| 1 | Township | Planowane | ⭐⭐⭐ |
| 2 | System Questów | Planowane | ⭐⭐ |
| 3 | Kucharz | Pomysł | ⭐⭐ |
| 4 | Wędkarz | Pomysł | ⭐⭐⭐ |
| 5 | Czarodziej | Pomysł | ⭐⭐⭐⭐ |
| 6 | Odkrywca | Pomysł | ⭐⭐⭐ |
| 7 | Bard | Pomysł | ⭐⭐ |
| 8 | Alchemik | Pomysł | ⭐⭐⭐⭐ |
| 9 | Architekt | Pomysł | ⭐⭐⭐ |
| 10 | Szpieg | Pomysł | ⭐⭐⭐⭐ |
| 11 | Zaklinacz | Pomysł | ⭐⭐⭐ |
| 12 | Kapłan | Pomysł | ⭐⭐⭐ |
| 13 | World Bosses | Planowane | ⭐⭐ |
| 14 | System Eksploracji | Planowane | ⭐⭐⭐ |
| 15 | Lore/Kodeks | Planowane | ⭐⭐ |
| 16 | Gildie Graczy | Pomysł | ⭐⭐⭐⭐⭐ |
| 17 | System Er/Timeline | Pomysł | ⭐⭐⭐⭐ |

---

## Notatki Techniczne

### Aktualna Struktura Ścieżek

```
app/features/ateria-idle/
├── warrior/         ✅ Zaimplementowane
├── merchant/        ✅ Zaimplementowane  
├── scientist/       ✅ Zaimplementowane
├── gathering/       ✅ Zaimplementowane
├── crafting/        ✅ Zaimplementowane
├── diplomat/        ✅ Zaimplementowane
├── druid/           ✅ Zaimplementowane
├── mystic/          ✅ Zaimplementowane
├── chef/            💡 Pomysł (Kucharz)
├── fisherman/       💡 Pomysł (Wędkarz)
├── wizard/          💡 Pomysł (Czarodziej)
├── explorer/        💡 Pomysł (Odkrywca)
├── bard/            💡 Pomysł (Bard)
├── alchemist/       💡 Pomysł (Alchemik)
├── architect/       💡 Pomysł (Architekt)
├── spy/             💡 Pomysł (Szpieg)
├── tamer/           💡 Pomysł (Zaklinacz)
└── priest/          💡 Pomysł (Kapłan)
```

### Typy Ścieżek (aktualne)

```typescript
type PathId = 
  | 'warrior' 
  | 'merchant' 
  | 'scientist' 
  | 'gathering'
  | 'crafting'
  | 'diplomat' 
  | 'druid' 
  | 'mystic';

// Planowane rozszerzenie
type FuturePathId = 
  | 'chef'       // Kucharz
  | 'fisherman'  // Wędkarz
  | 'wizard'     // Czarodziej
  | 'explorer'   // Odkrywca
  | 'bard'       // Bard
  | 'alchemist'  // Alchemik
  | 'architect'  // Architekt
  | 'spy'        // Szpieg
  | 'tamer'      // Zaklinacz
  | 'priest';    // Kapłan
```

---

## Statystyki Implementacji

- **Ścieżki zaimplementowane:** 8 (podstawowe + rozszerzenia)
- **Ścieżki w propozycjach:** 10 nowych pomysłów
- **Systemy główne:** 15+ w pełni działających
- **Frakcje:** 7 z pełnym systemem reputacji
- **Uprawy:** 12 typów roślin
- **Zwierzęta:** 8 typów hodowlanych
- **Karty Tarota:** 22 (Wielka Arkana)
- **Przepowiednie:** 8 typów
- **Rytuały:** 7 (4 tiery mocy)
- **Totemy:** 6 (każdy z 10 poziomami)
- **Surowce do zbierania:** 50+
- **Materiały przetworzone:** 30+
- **Receptury craftingowe:** 25+
- **Narzędzia:** 36+ (po ~9 na kategorię)

### Proponowane Ścieżki (10)

| Ikona | Ścieżka | Główna mechanika |
|-------|---------|------------------|
| 🍳 | Kucharz | Gotowanie, restauracja, buffy |
| 🎣 | Wędkarz | Łowienie, akwarium, turnieje |
| 🧙 | Czarodziej | Zaklęcia, szkoły magii, grimuar |
| 🏴‍☠️ | Odkrywca | Ekspedycje, kartografia, archeologia |
| 🎵 | Bard | Muzyka, pieśni mocy, legendy |
| ⚗️ | Alchemik | Transmutacja, eliksiry, homunculus |
| 🏛️ | Architekt | Budowanie, infrastruktura, cuda |
| 👤 | Szpieg | Infiltracja, sieć agentów |
| 🐲 | Zaklinacz | Oswajanie bestii, arena |
| ⛪ | Kapłan | Modlitwy, uzdrawianie, świątynia |

---

*Ostatnia aktualizacja: Styczeń 2026*
