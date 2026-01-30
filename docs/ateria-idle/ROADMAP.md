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
| 🍳 Kucharz | ✅ | Gotowanie, przepisy, restauracja, buffy z jedzenia |
| 🎣 Wędkarz | ✅ | Łowienie ryb, sprzęt wędkarski, kolekcja ryb, 6 łowisk |
| 🧙 Czarodziej | ✅ | 25+ zaklęć, 7 żywiołów, kostury, badania magiczne |
| 🏴‍☠️ Odkrywca | ✅ | 8 regionów, 40+ odkryć, ekspedycje, sprzęt podróżniczy |
| 🎵 Bard | ✅ | 15+ pieśni, 10 instrumentów, 7 miejsc występów, sława |
| ⚗️ Alchemik | ✅ | 15+ mikstur, składniki, eksperymenty, transmutacja |
| 🏛️ Architekt | ✅ | 15+ budowli, materiały, efekty pasywne, populacja |
| 👤 Szpieg | ✅ | 10+ misji szpiegowskich, sprzęt, informatorzy |
| 🐲 Zaklinacz | ✅ | 15+ stworzeń do oswojenia, przedmioty, towarzysze |
| ⛪ Kapłan | ✅ | 6 bóstw, 15+ modlitw, rytuały, relikwie |

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

### Macierz Zależności (Zaimplementowane Ścieżki) - ✅ W PEŁNI ZAIMPLEMENTOWANE

System synergii obejmuje **75+ unikalnych połączeń** między 18 ścieżkami.

```
              │ ⚔️Woj │ 🏪Kup │ 🔬Nau │ ⛏️Zbi │ 🔨Rze │ 🎭Dyp │ 🌿Dru │ 🔮Mis │ 🍳Kuc │ 🎣Węd │ 🧙Cza │ 🏴‍☠️Odk │ 🎵Bar │ ⚗️Alc │ 🏛️Arc │ 👤Szp │ 🐲Zak │ ⛪Kap │
──────────────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┤
⚔️ Wojownik   │   -   │  ✅   │  ✅   │  ·    │  ✅   │  ✅   │  ·    │  ·    │  ·    │  ·    │  ·    │  ·    │  ·    │  ·    │  ·    │  ·    │  ✅   │  ·    │
🏪 Kupiec     │  ✅   │   -   │  ✅   │  ·    │  ·    │  ·    │  ·    │  ·    │  ·    │  ·    │  ·    │  ·    │  ·    │  ·    │  ·    │  ✅   │  ·    │  ·    │
🔬 Naukowiec  │  ✅   │  ✅   │   -   │  ·    │  ·    │  ·    │  ·    │  ·    │  ·    │  ·    │  ✅   │  ·    │  ·    │  ✅   │  ·    │  ·    │  ·    │  ·    │
⛏️ Zbieracz   │  ·    │  ·    │  ·    │   -   │  ✅   │  ·    │  ·    │  ·    │  ·    │  ·    │  ·    │  ·    │  ·    │  ✅   │  ✅   │  ·    │  ·    │  ·    │
🔨 Rzemieślnik│  ✅   │  ✅   │  ·    │  ✅   │   -   │  ·    │  ·    │  ·    │  ·    │  ✅   │  ·    │  ·    │  ✅   │  ·    │  ·    │  ·    │  ·    │  ·    │
🎭 Dyplomata  │  ✅   │  ✅   │  ·    │  ·    │  ·    │   -   │  ·    │  ·    │  ·    │  ·    │  ·    │  ✅   │  ✅   │  ·    │  ✅   │  ✅   │  ·    │  ✅   │
🌿 Druid      │  ✅   │  ·    │  ·    │  ✅   │  ·    │  ·    │   -   │  ✅   │  ✅   │  ✅   │  ·    │  ·    │  ·    │  ✅   │  ·    │  ·    │  ✅   │  ·    │
🔮 Mistyk     │  ✅   │  ·    │  ✅   │  ·    │  ·    │  ·    │  ✅   │   -   │  ·    │  ✅   │  ✅   │  ·    │  ✅   │  ·    │  ·    │  ·    │  ✅   │  ✅   │
🍳 Kucharz    │  ✅   │  ·    │  ·    │  ·    │  ·    │  ·    │  ·    │  ·    │   -   │  ·    │  ·    │  ·    │  ·    │  ·    │  ·    │  ·    │  ✅   │  ·    │
🎣 Wędkarz    │  ·    │  ·    │  ·    │  ·    │  ·    │  ·    │  ·    │  ·    │  ✅   │   -   │  ·    │  ·    │  ·    │  ·    │  ·    │  ·    │  ·    │  ·    │
🧙 Czarodziej │  ✅   │  ·    │  ·    │  ·    │  ✅   │  ·    │  ·    │  ✅   │  ·    │  ·    │   -   │  ·    │  ·    │  ✅   │  ✅   │  ·    │  ·    │  ✅   │
🏴‍☠️ Odkrywca │  ·    │  ✅   │  ·    │  ✅   │  ·    │  ·    │  ·    │  ·    │  ✅   │  ✅   │  ·    │   -   │  ·    │  ·    │  ·    │  ✅   │  ·    │  ·    │
🎵 Bard       │  ✅   │  ✅   │  ·    │  ·    │  ·    │  ✅   │  ·    │  ·    │  ·    │  ·    │  ·    │  ·    │   -   │  ·    │  ·    │  ✅   │  ·    │  ✅   │
⚗️ Alchemik   │  ✅   │  ·    │  ✅   │  ·    │  ✅   │  ·    │  ✅   │  ·    │  ✅   │  ·    │  ✅   │  ·    │  ·    │   -   │  ·    │  ·    │  ·    │  ·    │
🏛️ Architekt  │  ·    │  ✅   │  ·    │  ✅   │  ✅   │  ✅   │  ·    │  ·    │  ·    │  ·    │  ·    │  ✅   │  ·    │  ·    │   -   │  ·    │  ·    │  ✅   │
👤 Szpieg     │  ·    │  ✅   │  ·    │  ·    │  ·    │  ✅   │  ·    │  ·    │  ·    │  ·    │  ·    │  ✅   │  ·    │  ·    │  ·    │   -   │  ·    │  ·    │
🐲 Zaklinacz  │  ✅   │  ·    │  ·    │  ·    │  ·    │  ·    │  ·    │  ·    │  ·    │  ·    │  ·    │  ✅   │  ·    │  ·    │  ·    │  ·    │   -   │  ·    │
⛪ Kapłan     │  ✅   │  ·    │  ·    │  ·    │  ·    │  ✅   │  ✅   │  ✅   │  ·    │  ·    │  ✅   │  ·    │  ✅   │  ·    │  ·    │  ·    │  ·    │   -   │
```

**Legenda:** ✅ Synergia zaimplementowana | · Brak synergii

---

### 🔗 System Synergii - ✅ ZAIMPLEMENTOWANY

Kompleksowy system zależności między wszystkimi 18 ścieżkami.

**Główne cechy:**
- **75+ synergii** zdefiniowanych między ścieżkami
- **4 tiery synergii**: Minor, Moderate, Major, Legendary (z mnożnikami x1, x1.5, x2, x3)
- **40+ typów bonusów**: atak, obrona, HP, złoto, XP, szybkość craftingu, jakość, itd.
- **Efekty specjalne**: unikalne zdolności odblokowywane przez synergie

**Przykłady synergii:**

| Od | Do | Nazwa | Tier | Bonusy |
|----|----|----|----|----|
| Kucharz → | Wojownik | Siła z Pożywienia | Major | +HP, +Regeneracja, +Atak |
| Alchemik → | Wojownik | Bojowe Eliksiry | Major | +Atak, +Obrona, +Redukcja |
| Kapłan → | Wojownik | Błogosławieństwo Wojny | Major | +HP, +Redukcja, +Regen |
| Bard → | Kupiec | Melodia Targów | Major | +Złoto, +Targowanie |
| Druid → | Zbieracz | Obfitość Natury | Major | +Plony, +Zasoby |
| Mistyk → | Czarodziej | Duchowa Moc | Major | +Moc Zaklęć, +Mana Regen |
| Szpieg → | Odkrywca | Ukryte Ścieżki | Major | +Szansa Odkrycia |
| Architekt → | Rzemieślnik | Warsztat Mistrzowski | Major | +Szybkość, +Jakość |

**Mechanika obliczania:**
- Bonus = (Poziom_źródła - Poziom_odblokowania + 1) × Wartość_bazowa × Mnożnik_tieru
- Każdy bonus ma maksymalną wartość (cap)
- Synergie odblokowują się po osiągnięciu wymaganego poziomu w ścieżce źródłowej

**UI Synergii:**
- **Przegląd**: Podsumowanie aktywnych synergii, top bonusów
- **Macierz**: Wizualna mapa wszystkich połączeń między ścieżkami
- **Bonusy**: Szczegółowa lista bonusów wg kategorii
- **Ścieżki**: Eksploracja synergii dla wybranej ścieżki

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

### 📋 Zależności Nowych Ścieżek (do zaimplementowania)

#### 🍳 Kucharz - Połączenia do zaimplementowania

| Od/Do | Zależność | Priorytet |
|-------|-----------|-----------|
| Zbieracz → Kucharz | Ryby z wędkarstwa jako składniki | 🔴 Wysoki |
| Druid → Kucharz | Warzywa, owoce, mięso, jajka, mleko | 🔴 Wysoki |
| Wojownik → Kucharz | Mięso z potworów | 🟡 Średni |
| Kucharz → Wojownik | Posiłki dające buffy bojowe | 🔴 Wysoki |
| Kucharz → Kupiec | Potrawy na sprzedaż | 🟡 Średni |
| Kucharz → Dyplomata | Bankiety zwiększające reputację | 🟢 Niski |

#### 🎣 Wędkarz - Połączenia do zaimplementowania

| Od/Do | Zależność | Priorytet |
|-------|-----------|-----------|
| Wędkarz → Kucharz | Ryby jako składniki potraw | 🔴 Wysoki |
| Wędkarz → Naukowiec | Olej rybi, perły dla alchemii | 🟡 Średni |
| Wędkarz → Rzemieślnik | Perły dla jubilerstwa | 🟡 Średni |
| Wędkarz → Kupiec | Eksport ryb i przetworów | 🟡 Średni |
| Mistyk → Wędkarz | Przepowiednie o dobrych łowiskach | 🟢 Niski |
| Druid → Wędkarz | Pory roku wpływają na połowy | 🟢 Niski |

#### 🧙 Czarodziej - Połączenia do zaimplementowania

| Od/Do | Zależność | Priorytet |
|-------|-----------|-----------|
| Czarodziej → Wojownik | Zaklęcia ofensywne jako alternatywa/wsparcie | 🔴 Wysoki |
| Mistyk → Czarodziej | Mana jako wspólny zasób | 🟡 Średni |
| Naukowiec → Czarodziej | Wspólne badania magiczne | 🟡 Średni |
| Rzemieślnik → Czarodziej | Różdżki, księgi, artefakty | 🟡 Średni |
| Czarodziej → Rzemieślnik | Enchanting przedmiotów | 🟢 Niski |
| Dyplomata → Czarodziej | Dostęp do Zakonu Magów | 🟢 Niski |

#### ⛪ Kapłan - Połączenia do zaimplementowania

| Od/Do | Zależność | Priorytet |
|-------|-----------|-----------|
| Kapłan → Wojownik | Uzdrawianie, błogosławieństwa, wskrzeszenie | 🔴 Wysoki |
| Kapłan → Mistyk | Wspólne rytuały duchowe | 🟡 Średni |
| Kapłan → Dyplomata | Wpływy religijne we frakcjach | 🟡 Średni |
| Kupiec → Kapłan | Ofiary/donacje | 🟢 Niski |
| Rzemieślnik → Kapłan | Święte relikwie, ołtarze | 🟢 Niski |

#### 🏴‍☠️ Odkrywca - Połączenia do zaimplementowania

| Od/Do | Zależność | Priorytet |
|-------|-----------|-----------|
| Odkrywca → Wojownik | Odkrywanie nowych biomów | 🔴 Wysoki |
| Odkrywca → Zbieracz | Nowe źródła surowców | 🟡 Średni |
| Odkrywca → Rzemieślnik | Starożytne schematy | 🟡 Średni |
| Odkrywca → Naukowiec | Artefakty do badań | 🟡 Średni |
| Odkrywca → Kupiec | Mapy na sprzedaż | 🟢 Niski |
| Odkrywca → Dyplomata | Kontakty z odległymi frakcjami | 🟢 Niski |

#### ⚗️ Alchemik - Połączenia do zaimplementowania

| Od/Do | Zależność | Priorytet |
|-------|-----------|-----------|
| Naukowiec ↔ Alchemik | Wspólne badania, dzielenie się recepturami | 🔴 Wysoki |
| Zbieracz → Alchemik | Rzadkie składniki | 🔴 Wysoki |
| Druid → Alchemik | Magiczne rośliny | 🟡 Średni |
| Alchemik → Wojownik | Potężne eliksiry | 🔴 Wysoki |
| Alchemik → Kupiec | Transmutacja (ołów → złoto) | 🟢 Niski |

#### 👤 Szpieg - Połączenia do zaimplementowania

| Od/Do | Zależność | Priorytet |
|-------|-----------|-----------|
| Dyplomata ↔ Szpieg | Rozszerzenie dyplomacji, wywiad | 🔴 Wysoki |
| Szpieg → Wojownik | Informacje o słabościach wrogów | 🟡 Średni |
| Szpieg → Kupiec | Informacje o cenach konkurencji | 🟡 Średni |
| Szpieg → Naukowiec | Skradzione receptury | 🟢 Niski |
| Kupiec → Szpieg | Finansowanie sieci szpiegów | 🟢 Niski |

#### 🐲 Zaklinacz - Połączenia do zaimplementowania

| Od/Do | Zależność | Priorytet |
|-------|-----------|-----------|
| Zaklinacz → Wojownik | Bestie bojowe | 🔴 Wysoki |
| Zaklinacz → Kupiec | Egzotyczne zwierzęta na sprzedaż | 🟡 Średni |
| Zaklinacz → Dyplomata | Prezenty dla frakcji | 🟢 Niski |
| Druid ↔ Zaklinacz | Wspólna praca ze zwierzętami | 🟡 Średni |
| Naukowiec → Zaklinacz | Badania nad bestiami | 🟢 Niski |

#### 🏛️ Architekt - Połączenia do zaimplementowania

| Od/Do | Zależność | Priorytet |
|-------|-----------|-----------|
| Rzemieślnik → Architekt | Materiały budowlane | 🔴 Wysoki |
| Zbieracz → Architekt | Surowce (kamień, drewno) | 🔴 Wysoki |
| Architekt → Wszystkie | Budynki Township dające bonusy | 🔴 Wysoki |
| Kupiec → Architekt | Finansowanie budowy | 🟡 Średni |
| Dyplomata → Architekt | Ambasady, sale audiencyjne | 🟢 Niski |

#### 🎵 Bard - Połączenia do zaimplementowania

| Od/Do | Zależność | Priorytet |
|-------|-----------|-----------|
| Bard → Wszystkie | Pieśni Mocy (globalne buffy) | 🔴 Wysoki |
| Bard → Kupiec | Zarobki z występów | 🟡 Średni |
| Bard → Dyplomata | Propaganda, wpływ na frakcje | 🟡 Średni |
| Rzemieślnik → Bard | Instrumenty muzyczne | 🟢 Niski |

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

## Szczegóły Zaimplementowanych Ścieżek (Nowe)

### 🏴‍☠️ ŚCIEŻKA 8: ODKRYWCA (The Explorer) ✅

*"Za każdym horyzontem czeka nowy świat"*

**Status:** ✅ Zaimplementowane

**Zaimplementowane mechaniki:**
- **8 Regionów eksploracji**: 
  - Verdant Woods (las), Iron Peaks (góry), Scorched Wastes (pustynia)
  - Misty Swamps (bagno), Frozen North (śnieg), Volcanic Isles (wulkaniczny)
  - Ancient Ruins (ruiny), Void Rift (pustka)
  
- **40+ Odkryć**: 
  - Hidden Grove, Crystal Cave, Desert Oasis, Buried Temple
  - Każdy region ma unikalne możliwe odkrycia
  
- **System ekspedycji**:
  - Forest Survey, Mountain Expedition, Desert Crossing
  - Void Incursion (legendarny)
  - Różne trudności i nagrody
  
- **Sprzęt odkrywcy**:
  - Basic Pack, Climbing Gear, Desert Robes, Diving Suit
  - Legendary Atlas, Void Compass
  
- **System lore**: Odblokowane fragmenty wiedzy

**Złożoność:** ⭐⭐⭐

---

### 🎵 ŚCIEŻKA 9: BARD (The Bard) ✅

*"Pieśń ma moc zmieniać serca i umysły"*

**Status:** ✅ Zaimplementowane

**Zaimplementowane mechaniki:**
- **6 Gatunków muzycznych**: Ballad, Epic, Folk, Comedy, Mystical, War

- **15+ Pieśni**:
  - Lovers Lament, Hero Ballad, Tavern Dance, Harvest Song
  - Whispers of Void, Victory Anthem, Legend of Heroes
  - Każda z buffy, XP i napiwkami

- **10 Instrumentów**:
  - Voice (podstawowy), Wooden Flute, Lute, War Drum
  - Crystal Harp, Golden Harp, Void Violin
  - Różne bonusy do występów

- **7 Miejsc występów**:
  - Village Tavern, Market Square, Noble Court
  - Royal Palace, Colosseum, Mystic Gathering, Void Temple

- **System sławy**: Reputacja rosnąca z występami

- **Historia występów**: Log z ostatnimi występami

**Złożoność:** ⭐⭐

---

### ⚗️ ŚCIEŻKA 10: ALCHEMIK (The Alchemist) ✅

*"Wszystko jest możliwe, wystarczy odpowiednia formuła"*

**Status:** ✅ Zaimplementowane

**Zaimplementowane mechaniki:**
- **15+ Składników alchemicznych**:
  - Moonpetal, Dragon Blood, Quicksilver, Phoenix Ash
  - Void Essence, Philosophers Stone Fragment, itp.

- **15+ Mikstur (5 typów)**:
  - Healing: Minor/Major/Superior Healing
  - Buff: Strength, Speed, Intelligence
  - Combat: Fire Bomb, Frost Bomb, Paralysis Poison
  - Utility: Invisibility, Gold Elixir
  - Legendary: Philosopher's Elixir (+wszystkie staty)

- **Eksperymenty**:
  - New Combination (odkrywanie receptur)
  - Volatile Mixture (ryzyko/nagroda)
  - Legendary Research (rzadkie odkrycia)

- **Sprzęt alchemiczny**:
  - Basic Cauldron → Master Cauldron → Golden Cauldron
  - Różne bonusy do warzenia

- **System buffów**: Aktywne efekty z wypitych mikstur

**Złożoność:** ⭐⭐⭐⭐

---

### 🏛️ ŚCIEŻKA 11: ARCHITEKT (The Architect) ✅

*"Budować znaczy tworzyć dziedzictwo"*

**Status:** ✅ Zaimplementowane

**Zaimplementowane mechaniki:**
- **15+ Budowli (5 kategorii)**:
  - Residential: Cottage, House, Manor, Palace
  - Production: Sawmill, Quarry, Gold Mine
  - Military: Barracks, Fortress, War Academy
  - Magical: Mage Tower, Library
  - Wonder: Colossus (legendarny)

- **Materiały budowlane**:
  - Wood, Stone, Iron, Gold Bars
  - Marble, Dragon Stone (rzadkie)

- **System efektów budynków**:
  - Populacja (+housing)
  - Obrona (+defense)
  - Produkcja zasobów
  - Bonusy globalne

- **Statystyki miasta**:
  - Całkowita populacja
  - Całkowita obrona
  - Liczba wybudowanych budynków

**Złożoność:** ⭐⭐⭐

---

### 👤 ŚCIEŻKA 12: SZPIEG (The Spy) ✅

*"Informacja to najpotężniejsza broń"*

**Status:** ✅ Zaimplementowane

**Zaimplementowane mechaniki:**
- **10+ Misji szpiegowskich (5 typów)**:
  - Recon: Gather Info, Scout Location
  - Theft: Pickpocket, Burglary, Vault Heist
  - Infiltration: Infiltrate Merchants, Palace
  - Sabotage: Sabotage Shipment
  - Assassination: Royal Assassination (legendary)

- **Sprzęt szpiegowski**:
  - Dark Cloak, Lockpicks, Smoke Bombs
  - Phantom Cloak, Master Disguise Kit
  - Void Shadow (legendary)

- **System informatorów**:
  - Street Urchin, Tavern Keeper, Corrupt Guard
  - Noble Spy, Shadow Broker
  - Pasywne zbieranie inteligencji

- **Statystyki**:
  - Stealth (skradanie)
  - Intel (zebrana informacja)
  - Completed Missions, Gold Stolen

**Złożoność:** ⭐⭐⭐⭐

---

### ⛪ ŚCIEŻKA 13: KAPŁAN (The Priest) ✅

*"Wiara czyni cuda"*

**Status:** ✅ Zaimplementowane

**Zaimplementowane mechaniki:**
- **6 Bóstw z unikalnymi domenami**:
  - Solaris (Light) - leczenie, obrona
  - Terra (Nature) - HP regen, zbieranie
  - Bellum (War) - obrażenia, krytyczne
  - Athena (Wisdom) - XP bonus, badania
  - Mortis (Death) - lifesteal, vs nieumarli
  - Libra (Balance) - wszystkie statystyki

- **15+ Modlitw**:
  - Blessing of Light, Smite, Divine Shield
  - Nature's Embrace, Wild Growth
  - Battle Cry, Divine Fury
  - Enlightenment, Divine Insight
  - Drain Life, Undead Bane, Equilibrium

- **Rytuały**:
  - Daily Prayer, Offering, Pilgrimage
  - Consecration, Divine Communion

- **Święte relikwie**:
  - Prayer Beads, Holy Symbol, Blessed Tome
  - Divine Staff, Celestial Halo, Ark of Covenant

- **System wiary i łaski**: Regeneracja wiary, favor z bóstwami

**Złożoność:** ⭐⭐⭐

---

### 🐲 ŚCIEŻKA 14: ZAKLINACZ (The Tamer) ✅

*"Każda bestia może zostać przyjacielem"*

**Status:** ✅ Zaimplementowane

**Zaimplementowane mechaniki:**
- **15+ Stworzeń (5 typów)**:
  - Beast: Wolf, Bear, Giant Spider
  - Elemental: Fire Elemental, Water Spirit
  - Undead: Skeleton Knight, Vampire Bat
  - Dragon: Wyvern, Dragon (legendary)
  - Mythical: Phoenix, Unicorn, Griffin

- **Przedmioty do oswajania**:
  - Basic Leash, Beast Whistle
  - Elemental Orb, Soul Chain
  - Dragon Scales, Mythical Charm

- **Karmienie stworzeń**:
  - Raw Meat, Honey, Magic Treats, Dragon Food
  - Wpływa na szczęście i statystyki

- **System towarzyszy**:
  - Aktywny towarzysz w walce
  - Max 3+ stworzeń (rośnie z poziomem)
  - Statystyki: ATK, DEF, HP, Speed

- **Statystyki**: Umiejętność oswajania, bonus z przedmiotów

**Złożoność:** ⭐⭐⭐

---

### 🍳 ŚCIEŻKA 15: KUCHARZ (The Chef) ✅

*"Droga do serca prowadzi przez żołądek"*

**Status:** ✅ Zaimplementowane

**Zaimplementowane mechaniki:**
- **20+ Składników**:
  - Mięso: Raw Meat, Poultry, Fish Fillet
  - Warzywa: Potato, Carrot, Tomato, Onion
  - Inne: Flour, Eggs, Milk, Butter, Sugar, Salt
  - Luksusowe: Dragon Meat, Lobster, Truffle

- **15+ Przepisów (5 kategorii)**:
  - Bread: Basic Bread, Sweet Roll
  - Meat: Fried Egg, Grilled Steak, Roast Chicken
  - Soup: Vegetable Soup, Dragon Stew
  - Dessert: Apple Pie, Chocolate Cake
  - Legendary: Lobster Thermidor, Ambrosia

- **System restauracji**:
  - Otwieranie/zamykanie restauracji
  - Klienci: Peasant, Merchant, Noble
  - Serwowanie potraw za złoto

- **Buffy z jedzenia**:
  - HP Regen, Attack Boost, Defense Boost
  - XP Bonus, Luck Boost
  - Czas trwania zależny od potrawy

- **System jakości**: Poor → Normal → Good → Excellent → Masterwork

**Złożoność:** ⭐⭐

---

### 🎣 ŚCIEŻKA 16: WĘDKARZ (The Fisherman) ✅

*"Cierpliwość zawsze zostaje wynagrodzona"*

**Status:** ✅ Zaimplementowane

**Zaimplementowane mechaniki:**
- **20+ Gatunków ryb (4 typy wód)**:
  - Freshwater: Minnow, Carp, Trout, Catfish
  - Saltwater: Mackerel, Tuna, Shark, Marlin
  - Deep Sea: Anglerfish, Giant Squid, Kraken (legendary)
  - Magical: Moonfish, Starfish, Void Leviathan (legendary)

- **6 Łowisk**:
  - Village River, Forest Lake, Ocean Shore
  - Deep Sea, Underground Cave, Enchanted Pond

- **Sprzęt wędkarski**:
  - Wędki: Wooden Rod → Steel Rod → Mithril Rod → Legendary Rod
  - Przynęty: Worm, Shrimp, Live Fish, Magical Lure

- **System kolekcji**:
  - Fish Collection (złapane gatunki)
  - Fish Records (największe okazy)
  - Selling fish for gold

- **System rzadkości**: Common → Uncommon → Rare → Epic → Legendary

- **Trwałość wędek**: Zużycie, naprawa

**Złożoność:** ⭐⭐⭐

---

### 🧙 ŚCIEŻKA 17: CZARODZIEJ (The Wizard) ✅

*"Magia to sztuka zginania rzeczywistości"*

**Status:** ✅ Zaimplementowane

**Zaimplementowane mechaniki:**
- **7 Żywiołów (Element Mastery)**:
  - Fire, Water, Earth, Air
  - Light, Dark, Arcane

- **25+ Zaklęć**:
  - Fire: Fireball, Fire Storm, Meteor (legendary)
  - Water: Ice Shard, Heal, Tsunami
  - Earth: Stone Skin, Earthquake, Petrify
  - Air: Lightning Bolt, Wind Slash, Tornado
  - Light: Holy Light, Purify, Divine Judgement
  - Dark: Shadow Bolt, Drain Life, Summon Demon
  - Arcane: Arcane Missile, Teleport, Time Stop (legendary)

- **Kostury magiczne**:
  - Wooden Staff → Crystal Staff → Elemental Staff
  - Void Staff, Legendary Staff of Ages

- **System many**:
  - Mana pool (rosnący z poziomem)
  - Mana regeneration
  - Spell costs, cooldowns

- **System badań**: Researching new spells (koszt złota + many)

- **Aktywne efekty zaklęć**: Buffs, shields, DOT

**Złożoność:** ⭐⭐⭐⭐

---

## Planowane Systemy Ogólne

### 🏰 Township (Osada) - ✅ ZAIMPLEMENTOWANE

System budowania i rozwijania osady gildii.

**Zaimplementowane mechaniki:**
- **20+ Budynków** w 6 kategoriach:
  - Produkcja: Tartak, Kamieniołom, Kopalnia, Farma
  - Wojskowe: Koszary, Plac Ćwiczeń, Forteca
  - Ekonomiczne: Targowisko, Bank, Magazyn, Stajnie
  - Magiczne: Wieża Maga, Biblioteka, Obserwatorium, Świątynia, Laboratorium Alchemiczne
  - Społeczne: Tawerna, Ambasada, Hala Gildii, Szpital, Teatr
  - Cuda: Wielka Kuźnia, Akademia Tajemnej Sztuki, Drzewo Świata

- **System populacji i szczęścia**
- **Produkcja zasobów** (drewno, kamień, ruda, jedzenie, złoto)
- **Globalne bonusy** z budynków dla wszystkich ścieżek
- **System wydarzeń** (festiwale, najazdy, karawany kupieckie)
- **System obrony osady**

---

### 📜 System Questów - ✅ ZAIMPLEMENTOWANE

Fabularne zadania rozwijające historię świata.

**Zaimplementowane mechaniki:**
- **5 typów questów**:
  - Main Story (7+ questów) - Główna fabuła z rozdziałami
  - Side Quest (5+ questów) - Poboczne historie
  - Faction Quest (3+ questów) - Zadania frakcji
  - Daily Quest (4 questy) - Codzienne powtarzalne
  - Hidden Quest (2 questy) - Ukryte z sekretami

- **System celów**: kill, collect, reach_level, build, craft, explore, reputation, gold, custom
- **System nagród**: złoto, XP, przedmioty, reputacja, Legacy Points, odblokowania
- **Śledzenie postępu** dla wszystkich aktywnych questów
- **System cooldownów** dla questów codziennych

---

### 🐉 World Bosses - ✅ ZAIMPLEMENTOWANE

Globalne bossowie z unikalnymi mechanikami i legendarnymi nagrodami.

**6 World Bossów:**
| Boss | Spawn | Trudność | Element | Unikalne Nagrody |
|------|-------|----------|---------|------------------|
| Starożytny Smok | Niedziela | ⭐⭐⭐⭐⭐ | Ogień | Smocza Zbroja, Smocze Ostrze, Serce Smoka (mythic) |
| Lodowy Tytan | Co 3 dni | ⭐⭐⭐⭐ | Lód | Młot Mrozu, Rękawice Tytana, Zamrożony Rdzeń (mythic) |
| Król Goblinów | Codziennie | ⭐⭐ | Cień | Korona Goblinów, Sztylet Podstępu |
| Avatar Pustki | Raz w miesiącu | ⭐⭐⭐⭐⭐⭐ | Pustka | Fragment Pustki (mythic), Płaszcz Pustki (mythic), Ostrze Nicości (mythic) |
| Pramatka Lasów | Środa | ⭐⭐⭐ | Natura | Łuk Natury, Błogosławieństwo Lasu, Nasienie Życia (mythic) |
| Mechaniczny Tytan | Co 5 dni | ⭐⭐⭐⭐ | Mechanika | Serce Golema, Zbroja Zegarmistrza, Schemat Tytana (mythic) |

**Zaimplementowane mechaniki:**
- **System faz**: Każdy boss ma 3-5 faz z różnymi umiejętnościami i mnożnikami obrażeń
- **Umiejętności bossów**: Unikalne ataki, efekty DOT, wezwania, tarcze
- **System spawnu**: Daily, Weekly, Biweekly, Monthly z cooldownami po pokonaniu
- **Wymagania**: Poziom wojownika, liczba pokonanych bossów
- **Nagrody**: Złoto, XP, Legacy Points, materiały z bossów, legendarne przedmioty

**20+ Legendarnych przedmiotów:**
- Bronie: Smocze Ostrze, Młot Mrozu, Łuk Natury, Ostrze Nicości
- Zbroje: Smocza Zbroja, Rękawice Tytana, Płaszcz Pustki, Zbroja Zegarmistrza
- Akcesoria: Korona Goblinów, Błogosławieństwo Lasu
- Artefakty (Mythic): Serce Smoka, Fragment Pustki, Nasienie Życia
- Materiały: Esencja Bossa, Mityczny Odłamek

---

### 🗺️ System Eksploracji - ✅ ZAIMPLEMENTOWANE

Pełny system eksploracji świata z mapą, podróżami i odkryciami.

**12 Regionów świata:**
| Region | Teren | Poziom | Niebezpieczeństwo |
|--------|-------|--------|-------------------|
| Zielone Równiny | Równiny | 1 | ⭐ |
| Szepczący Las | Las | 5 | ⭐⭐⭐ |
| Kryształowe Szczyty | Góry | 10 | ⭐⭐⭐⭐⭐ |
| Spalone Pustkowia | Pustynia | 15 | ⭐⭐⭐⭐⭐⭐ |
| Mroźna Tundra | Tundra | 20 | ⭐⭐⭐⭐⭐⭐⭐ |
| Cieniste Bagna | Bagno | 18 | ⭐⭐⭐⭐⭐⭐⭐ |
| Starożytne Ruiny | Równiny | 25 | ⭐⭐⭐⭐⭐⭐⭐⭐ |
| Niebiańskie Wyspy | Ocean | 30 | ⭐⭐⭐⭐⭐⭐⭐⭐ |
| Otchłanne Głębiny | Pustka | 35 | ⭐⭐⭐⭐⭐⭐⭐⭐⭐ |
| Smocze Góry | Wulkan | 35 | ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐ |
| Mistyczny Gaj | Las | 25 | ⭐⭐⭐⭐⭐ |
| Żelazna Forteca | Góry | 30 | ⭐⭐⭐⭐⭐⭐ |

**Zaimplementowane mechaniki:**
- **Mapa świata** z połączeniami między regionami
- **30+ POI (Points of Interest)**: Ruiny, Wioski, Jaskinie, Świątynie, Sekrety
- **System podróży** z czasem i niebezpieczeństwem
- **8 typów wydarzeń losowych**: Combat, Treasure, Merchant, NPC, Trap, Blessing, Mystery
- **Fast Travel** między odkrytymi lokacjami
- **System ekspedycji** z nagrodami i odkryciami
- **Statystyki eksploracji**

---

### 📜 Lore/Kodeks - ✅ ZAIMPLEMENTOWANE

Encyklopedia świata Aterii z 6 kategoriami wpisów.

**6 Kategorii:**
| Kategoria | Opis | Wpisy |
|-----------|------|-------|
| Bestiariusz | Potwory i stworzenia | 15+ |
| Herbarium | Rośliny i zioła | 5+ |
| Atlas | Lokacje i regiony | 10+ |
| Kroniki | Historia świata | 5+ |
| Biografie | Postacie i frakcje | 5+ |
| Artefakty | Legendarne przedmioty | 5+ |

**Zaimplementowane mechaniki:**
- **45+ wpisów** do odkrycia
- **5 poziomów rzadkości**: Common, Uncommon, Rare, Epic, Legendary
- **System odkrywania** przez zabijanie, zbieranie, odwiedzanie
- **Powiązane wpisy** między kategoriami
- **Ulubione i ostatnio odkryte**
- **Pasek postępu** odkrywania
- **Wyszukiwanie** i filtrowanie

---

## Propozycja Kolejności Implementacji

| Priorytet | Nazwa | Status | Złożoność |
|-----------|-------|--------|-----------|
| ✅ | Crafting & Gathering | Zaimplementowane | ⭐⭐⭐ |
| ✅ | Dyplomata | Zaimplementowane | ⭐⭐⭐⭐ |
| ✅ | Druid | Zaimplementowane | ⭐⭐⭐ |
| ✅ | Mistyk | Zaimplementowane | ⭐⭐⭐ |
| ✅ | Kucharz | Zaimplementowane | ⭐⭐ |
| ✅ | Wędkarz | Zaimplementowane | ⭐⭐⭐ |
| ✅ | Czarodziej | Zaimplementowane | ⭐⭐⭐⭐ |
| ✅ | Odkrywca | Zaimplementowane | ⭐⭐⭐ |
| ✅ | Bard | Zaimplementowane | ⭐⭐ |
| ✅ | Alchemik | Zaimplementowane | ⭐⭐⭐⭐ |
| ✅ | Architekt | Zaimplementowane | ⭐⭐⭐ |
| ✅ | Szpieg | Zaimplementowane | ⭐⭐⭐⭐ |
| ✅ | Zaklinacz | Zaimplementowane | ⭐⭐⭐ |
| ✅ | Kapłan | Zaimplementowane | ⭐⭐⭐ |
| ✅ | Township | Zaimplementowane | ⭐⭐⭐ |
| ✅ | System Questów | Zaimplementowane | ⭐⭐ |
| ✅ | World Bosses | Zaimplementowane | ⭐⭐⭐ |
| ✅ | Synergie Ścieżek | Zaimplementowane | ⭐⭐⭐ |
| ✅ | System Eksploracji | Zaimplementowane | ⭐⭐⭐ |
| ✅ | Lore/Kodeks | Zaimplementowane | ⭐⭐ |
| ✅ | System Reputacji | Zaimplementowane | ⭐⭐⭐ |
| ✅ | Kalendarz & Pory Roku | Zaimplementowane | ⭐⭐⭐ |
| ✅ | System Companionów | Zaimplementowane | ⭐⭐⭐⭐ |
| ✅ | Mini-gry | Zaimplementowane | ⭐⭐⭐ |
| 1 | Gildie Graczy | Pomysł | ⭐⭐⭐⭐⭐ |
| 2 | System Er/Timeline | Pomysł | ⭐⭐⭐⭐ |

---

## Notatki Techniczne

### Aktualna Struktura Ścieżek

```
app/features/ateria-idle/
├── warrior/         ✅ Zaimplementowane (Wojownik)
├── merchant/        ✅ Zaimplementowane (Kupiec)
├── scientist/       ✅ Zaimplementowane (Naukowiec)
├── gathering/       ✅ Zaimplementowane (Zbieracz)
├── crafting/        ✅ Zaimplementowane (Rzemieślnik)
├── diplomat/        ✅ Zaimplementowane (Dyplomata)
├── druid/           ✅ Zaimplementowane (Druid)
├── mystic/          ✅ Zaimplementowane (Mistyk)
├── chef/            ✅ Zaimplementowane (Kucharz)
├── fisherman/       ✅ Zaimplementowane (Wędkarz)
├── wizard/          ✅ Zaimplementowane (Czarodziej)
├── explorer/        ✅ Zaimplementowane (Odkrywca)
├── bard/            ✅ Zaimplementowane (Bard)
├── alchemist/       ✅ Zaimplementowane (Alchemik)
├── architect/       ✅ Zaimplementowane (Architekt)
├── spy/             ✅ Zaimplementowane (Szpieg)
├── tamer/           ✅ Zaimplementowane (Zaklinacz)
├── priest/          ✅ Zaimplementowane (Kapłan)
├── township/        ✅ Zaimplementowane (Osada)
├── quests/          ✅ Zaimplementowane (Questy)
├── world-bosses/    ✅ Zaimplementowane (World Bosses)
├── synergies/       ✅ Zaimplementowane (Synergie Ścieżek)
├── exploration/     ✅ Zaimplementowane (Eksploracja)
├── codex/           ✅ Zaimplementowane (Kodeks/Lore)
├── reputation/      ✅ Zaimplementowane (Reputacja Globalna)
├── calendar/        ✅ Zaimplementowane (Kalendarz & Pory Roku)
├── companions/      ✅ Zaimplementowane (Towarzysze NPC)
└── minigames/       ✅ Zaimplementowane (Mini-gry)
```

### Typy Ścieżek (aktualne)

```typescript
type PathId = 
  | 'warrior'    // Wojownik - walka, biomy, dungeony
  | 'merchant'   // Kupiec - handel, karawany
  | 'scientist'  // Naukowiec - badania, golemy
  | 'gathering'  // Zbieracz - górnictwo, drwalnictwo, wędkarstwo, zielarstwo
  | 'crafting'   // Rzemieślnik - kowalstwo, krawiectwo, jubilerstwo, stolarstwo
  | 'diplomat'   // Dyplomata - frakcje, reputacja, misje
  | 'druid'      // Druid - farma, hodowla, totemy
  | 'mystic'     // Mistyk - medytacja, przepowiednie, tarot
  | 'chef'       // Kucharz - gotowanie, restauracja, buffy
  | 'fisherman'  // Wędkarz - łowienie, sprzęt, kolekcja
  | 'wizard'     // Czarodziej - zaklęcia, żywioły, kostury
  | 'explorer'   // Odkrywca - eksploracja, ekspedycje, odkrycia
  | 'bard'       // Bard - muzyka, pieśni, występy
  | 'alchemist'  // Alchemik - eliksiry, eksperymenty, transmutacja
  | 'architect'  // Architekt - budowanie, miasto, materiały
  | 'spy'        // Szpieg - misje, infiltracja, informatorzy
  | 'tamer'      // Zaklinacz - oswajanie, bestie, towarzysze
  | 'priest';    // Kapłan - wiara, modlitwy, bóstwa
```

---

## Statystyki Implementacji

- **Ścieżki zaimplementowane:** 18 (wszystkie podstawowe + rozszerzenia)
- **Systemy globalne:** Township, Questy, World Bosses, Synergie, Eksploracja, Kodeks, Reputacja, Kalendarz, Towarzysze, Mini-gry
- **Systemy główne:** 30+ w pełni działających
- **Regiony świata:** 12 (z unikalnymi biomami i POI)
- **POI do odkrycia:** 30+
- **Wpisy w Kodeksie:** 45+ (6 kategorii)
- **Towarzysze:** 10 unikalnych NPC (8 klas)
- **Mini-gry:** 7 różnych gier (kości, karty, automaty, puzzle, memory)
- **World Bossowie:** 6 (z unikalnymi mechanikami i fazami)
- **Legendarne przedmioty:** 20+ (w tym 8 mythic)
- **Synergie między ścieżkami:** 75+ unikalnych połączeń
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

### Nowe Ścieżki (zaimplementowane)

| Ikona | Ścieżka | Główna mechanika | Status |
|-------|---------|------------------|--------|
| 🍳 | Kucharz | Gotowanie, restauracja, przepisy, buffy z jedzenia | ✅ |
| 🎣 | Wędkarz | Łowienie ryb, 20+ gatunków, wędki, przynęty, 6 łowisk | ✅ |
| 🧙 | Czarodziej | 25+ zaklęć, 7 żywiołów, kostury, badania magiczne | ✅ |
| 🏴‍☠️ | Odkrywca | 8 regionów, 40+ odkryć, ekspedycje, sprzęt | ✅ |
| 🎵 | Bard | 15+ pieśni, 10 instrumentów, 7 miejsc, sława | ✅ |
| ⚗️ | Alchemik | 15+ mikstur, eksperymenty, transmutacja | ✅ |
| 🏛️ | Architekt | 15+ budowli, materiały, populacja, obrona | ✅ |
| 👤 | Szpieg | 10+ misji, sprzęt, informatorzy, infiltracja | ✅ |
| 🐲 | Zaklinacz | 15+ stworzeń, oswajanie, towarzysze | ✅ |
| ⛪ | Kapłan | 6 bóstw, 15+ modlitw, rytuały, relikwie | ✅ |

---

*Ostatnia aktualizacja: 26 Stycznia 2026*

---

## Changelog

### 26.01.2026 (aktualizacja 6)
- ✅ Zaimplementowano **System Reputacji Globalnej**:
  - 9 alignmentów (od Praworządnego Dobrego do Chaotycznego Złego)
  - System karmy (-100 do +100) wpływający na interakcje
  - 6 poziomów sławy z nagrodami
  - 17+ tytułów do odblokowania w 8 kategoriach
  - Bonusy statystyk z alignmentu, sławy i tytułów
- ✅ Zaimplementowano **Kalendarz & Pory Roku**:
  - 4 pory roku z unikalnymi bonusami
  - 8 typów pogody wpływających na rozgrywkę
  - 8 faz księżyca z efektami
  - 8 festiwali sezonowych z nagrodami
  - 7 bonusów dziennych (różne każdego dnia)
- ✅ Zaimplementowano **System Companionów/NPC**:
  - 10 unikalnych towarzyszy w 8 klasach
  - System levelowania i relacji (6 poziomów)
  - 16 typów zadań do przydzielenia
  - Unikalne umiejętności pasywne i aktywne
  - Preferencje prezentów i dialogi
- ✅ Zaimplementowano **Mini-gry**:
  - 7 różnych gier (kości, karty, automaty, puzzle, memory)
  - System zakładów i nagród
  - Statystyki i rekordy
  - Różne poziomy trudności

### 26.01.2026 (aktualizacja 5)
- ✅ Zaimplementowano **System Eksploracji**:
  - 12 regionów świata z unikalnymi biomami
  - 30+ POI (Points of Interest) do odkrycia
  - System podróży z czasem i wydarzeniami losowymi
  - 8 typów wydarzeń podczas podróży
  - Fast Travel między odkrytymi lokacjami
  - System ekspedycji z nagrodami
- ✅ Zaimplementowano **Kodeks/Lore**:
  - 45+ wpisów w 6 kategoriach
  - Bestiariusz, Herbarium, Atlas, Kroniki, Biografie, Artefakty
  - System odkrywania przez grę
  - 5 poziomów rzadkości wpisów
  - Ulubione, ostatnio odkryte, wyszukiwanie

### 26.01.2026 (aktualizacja 4)
- ✅ Zaimplementowano pełny **System Synergii**:
  - 75+ unikalnych synergii między 18 ścieżkami
  - 4 tiery synergii (Minor, Moderate, Major, Legendary)
  - 40+ typów bonusów (bojowe, ekonomiczne, produkcyjne, magiczne)
  - Efekty specjalne dla synergii wyższych tierów
  - UI z macierzą, przeglądem bonusów i eksploracją ścieżek
  - Dynamiczne obliczanie bonusów na podstawie poziomów
- Zaktualizowano macierz zależności w dokumentacji

### 26.01.2026 (aktualizacja 3)
- ✅ Zaimplementowano system **World Bosses**:
  - 6 globalnych bossów (Starożytny Smok, Lodowy Tytan, Król Goblinów, Avatar Pustki, Pramatka Lasów, Mechaniczny Tytan)
  - System faz walki z unikalnymi umiejętnościami
  - 20+ legendarnych przedmiotów (w tym 8 mythic)
  - System spawnu (daily, weekly, biweekly, monthly)
  - Wymagania odblokowujące (poziom, liczba zabójstw bossów)

### 26.01.2026 (aktualizacja 2)
- ✅ Zaimplementowano system **Township (Osada)**:
  - 20+ budynków w 6 kategoriach
  - System populacji, szczęścia, obrony
  - Produkcja zasobów i globalne bonusy
  - System wydarzeń losowych
- ✅ Zaimplementowano system **Questów**:
  - 20+ questów w 5 typach (Main, Side, Faction, Daily, Hidden)
  - 7 rozdziałów głównej fabuły
  - System celów i nagród
  - Śledzenie postępu i cooldowny

### 26.01.2026
- ✅ Zaimplementowano 10 nowych ścieżek: Kucharz, Wędkarz, Czarodziej, Odkrywca, Bard, Alchemik, Architekt, Szpieg, Zaklinacz, Kapłan
- Zaktualizowano status wszystkich ścieżek w dokumentacji
- Rozszerzono macierz zależności o nowe ścieżki
- Zaktualizowano strukturę plików i typy ścieżek
- Łączna liczba ścieżek: 18
