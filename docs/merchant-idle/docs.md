# Architektura strategiczna i ramy projektowe ekonomicznego ekosystemu IDLE

## W estetyce religijnego grimdarku

Ewolucja gatunku gier przyrostowych (_incremental games_) przeszła transformację od prostych mechanizmów klikania w złożone symulacje ekonomiczne. Niniejszy plan zakłada stworzenie hybrydowego modelu handlowego osadzonego w realiach mrocznego średniowiecza i religijnego grimdarku, łączącego mechaniki progresji pasywnej z aktywnym zarządzaniem ryzykiem.

---

## 1. Fundamenty psychologiczne i mechanizmy zaangażowania

Sukces gier typu IDLE opiera się na teorii warunkowania instrumentalnego – zachowania nagradzane przyrostem liczb mają tendencję do powtarzania się.

- **Pętle Dopaminowe**: Każde kliknięcie generuje natychmiastową informację zwrotną w postaci przyrostu waluty.
- **Efekt IKEA**: Gracze wyżej cenią systemy, które sami zoptymalizowali, co buduje poczucie własności nad wirtualną firmą.
- **Odkrywanie (Unfolding)**: Stopniowe ujawnianie nowych warstw mechaniki (od klikania do zarządzania filiami) zapobiega znużeniu.

## 2. Mechanika handlu i symulacja ekonomiczna

Rdzeń gry stanowi system **„kup tanio, sprzedaj drogo”**, ewoluujący w zautomatyzowane szlaki handlowe.

### Matematyczny model progresji

Koszty ulepszeń rosną wykładniczo, aby zrównoważyć przyrost produkcji.

**Koszt ulepszenia:**

$$
Koszt_{n} = Koszt_{bazowy} \times (Stopa_{wzrostu})^{Posiadane}
$$

_Zazwyczaj stopa wzrostu wynosi od 1,07 do 1,15._

**Zysk z trasy handlowej:**

$$
Zysk = (Cena_{docelowa} - Cena_{źródłowa}) \times Ilość - Koszty_{transportu}
$$

### Dynamika rynku i ceny

Ceny towarów fluktuują w oparciu o popyt i podaż:

- **Popyt ($Qd$):**
  $$Qd = a + b \times Populacja$$
- **Cena ($P$):**
  $$P = \text{clamp}((Qd / Qs)^{1/e}, 0.5, 3.0)$$
  _Gdzie $Qs$ to dostępna podaż, a $e$ to elastyczność cenowa._

## 3. Estetyka religijnego grimdarku

Religia reguluje handel i wprowadza unikalne systemy ryzyka.

- **System Herezji**: Handel przedmiotami zakazanymi (krew męczenników, relikwie) oferuje wysokie marże, ale zwiększa „Podejrzenie Inkwizycji”, co może prowadzić do konfiskaty majątku lub egzekucji pracowników.
- **Relikwie**: Przedmioty o najwyższej wartości (np. szczątki świętych) wymagają specjalnych certyfikatów i ochrony.
- **Pokuta (Prestiż)**: Reset postępu (mechanizm prestiżu) nazywa się „Wielką Pokutą” – gracz oddaje majątek katedrze w zamian za stałe mnożniki „Łaski”, przyspieszające kolejny etap gry.

**Wzór na walutę prestiżu ($p$):**

$$
p = \sqrt{1 + \frac{8 \cdot cM}{10^{12}}} - \frac{1}{2}
$$

_(Gdzie $cM$ to current Money / majątek)_

## 4. Architektura techniczna i platformy

Zaleca się podejście multiplatformowe oparte na technologiach webowych.

- **Frontend**: **Vue 3** w ekosystemie **Nuxt**. Zapewnia to nowoczesną architekturę i doskonałą wydajność (SSR/SSG).
- **UI Framework**: **Vuetify**. Gotowy zestaw komponentów Material Design do szybkiego budowania interfejsu.
- **Zarządzanie stanem**: **Pinia**. Lekki i typowany system zarządzania stanem, idealny do gier ekonomicznych.
- **Mobile**: Użycie **Capacitor** pozwoli na opakowanie kodu webowego w natywną aplikację na iOS i Androida.
- **Symulacja Offline**: Gra powinna obliczać postęp podczas nieobecności gracza, najlepiej poprzez szybką symulację zdarzeń (_fast-forward_), aby uwzględnić np. ataki bandytów na karawany.

## 5. Strategia monetyzacji i rozwoju

Monetyzacja opiera się na modelu hybrydowym.

- **Odpusty (Rewarded Ads)**: Opcjonalne reklamy przyspieszające czas lub dające darmowe surowce.
- **Dziesięcina (Battle Pass)**: Subskrypcja zapewniająca codzienne bonusy i ochronę przed kontrolami Inkwizycji.

## 6. Harmonogram wdrożenia (Roadmap)

1.  **Faza 1: Prototyp (Miesiące 1-3)**
    - Implementacja pętli: klikanie -> złoto -> pierwsi pracownicy.
2.  **Faza 2: Szlaki Handlowe (Miesiące 4-8)**
    - Mapa świata, algorytmy A\* dla podróży i dynamiczne ceny towarów.
3.  **Faza 3: Automatyzacja i Filie (Miesiące 9-12)**
    - Mechanika „Faktora” (zarządcy), który automatyzuje handel w miastach.
4.  **Faza 4: Porting i Launch (Miesiące 13-16)**
    - Optymalizacja UI pod urządzenia mobilne i integracja z systemami reklamowymi.
