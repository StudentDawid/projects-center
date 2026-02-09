# AI Rules - Dokumentacja

## 📋 Spis treści

- [Czym są AI Rules?](#czym-są-ai-rules)
- [Struktura projektu](#struktura-projektu)
- [System headerów](#system-headerów)
- [Skrypt synchronizacji](#skrypt-synchronizacji)
- [Użycie](#użycie)
- [Mapowanie folderów](#mapowanie-folderów)
- [Backup i bezpieczeństwo](#backup-i-bezpieczeństwo)

---

## Czym są AI Rules?

**AI Rules** to zbiór markdown dokumentów definiujących standardy, konwencje i best practices dla asystentów AI (Cursor, GitHub Copilot, Google Antigravity) pracujących nad tym projektem.

### Cel

Zapewnienie, że wszystkie AI w projekcie:
- ✅ Stosują te same standardy kodowania
- ✅ Przestrzegają architektury FSD (Feature-Sliced Design)
- ✅ Znają specyfikę Vue 3, React i testów Playwright
- ✅ Komunikują się wyłącznie po polsku
- ✅ Działają zgodnie z filozofią projektu

---

## Struktura projektu

```
rules-ai/
├── README.md                          # Ten plik
│
├── backups/                           # Automatyczne backupy nadpisanych plików
│
├── rules/                             # Źródłowe pliki rules
│   ├── general.md                     # Zasady komunikacji (ZAWSZE PO POLSKU)
│   │
│   ├── general-rules/                 # Uniwersalne zasady dla wszystkich frameworków
│   │   ├── architecture-general.md    # Architektura FSD
│   │   ├── coding-standards-general.md # TypeScript strict mode, konwencje
│   │   ├── library-creation.md        # Tworzenie bibliotek w FSD
│   │   ├── technical-stack.md         # Stack technologiczny
│   │   └── validation-checklist.md    # Checklist przed commitem
│   │
│   ├── vue/                           # Vue 3 + Nuxt 4 specific
│   │   ├── architecture-vue.md        # Architektura Vue/Nuxt
│   │   └── coding-standards-vue.md    # Standardy Vue 3
│   │
│   ├── react/                         # React specific (przygotowane na przyszłość)
│   │   ├── architecture-react.md      # Architektura React
│   │   └── coding-standards-react.md  # Standardy React
│   │
│   └── tests/                         # Testing standards
│       └── playwright-testing.md      # Standardy testów E2E z Playwright
│
├── cursor-headers.md                  # Headery dla Cursor AI (format: globs)
├── github-headers.md                  # Headery dla GitHub Copilot (format: applyTo)
└── antigravity-headers.md             # Headery dla Google Antigravity (format: globs)
```

---

## System headerów

Każdy plik rule jest kopiowany do odpowiedniego narzędzia AI **z dodanym headerem** w formacie YAML front matter.

### Czym jest header?

Header to metadane na początku pliku markdown, definiujące:
- **name** - Nazwa reguły
- **description** - Krótki opis
- **globs** / **applyTo** - Wzorce plików, do których reguła ma zastosowanie

### Przykład headera (Cursor)

```markdown
---
name: Vue Components Rule
description: Standardy dla komponentów Vue 3
globs: "**/*.vue"
---

# Treść dokumentu...
```

### Dlaczego różne headery?

Każde narzędzie AI ma inną składnię:
- **Cursor** używa `globs: "pattern"`
- **GitHub Copilot** używa `applyTo: "pattern"`
- **Google Antigravity** używa `globs: "pattern"`

Skrypt automatycznie wybiera odpowiedni header podczas kopiowania.

---

## Skrypt synchronizacji

Skrypt [scripts/copy-rules.sh](../scripts/copy-rules.sh) odpowiada za:
1. Kopiowanie plików z `rules-ai/rules/` do folderów konfiguracyjnych AI
2. Automatyczne dodawanie odpowiednich headerów
3. Tworzenie backupów zmienionych plików
4. Pokazywanie statusu każdej operacji

### Lokalizacje docelowe

```bash
rules-ai/rules/ 
    ↓
    ├── .cursor/rules/              # Cursor AI
    ├── .github/instructions/       # GitHub Copilot
    └── .agent/rules/               # Google Antigravity
```

### Algorytm działania

```
1. Dla każdego pliku *.md w rules-ai/rules/:
   
   a) Określ kategorię na podstawie ścieżki:
      - general.md + general-rules/* → "Global components Rule"
      - vue/*                        → "Vue Components Rule"
      - react/*                      → "React Components Rule"
      - tests/*                      → "Tests Rule"
   
   b) Wyciągnij odpowiedni header z pliku headerów (cursor/github/antigravity)
   
   c) Utwórz tymczasowy plik z headerem + treścią źródłową
   
   d) Porównaj z istniejącym plikiem docelowym:
      
      • Jeśli plik nie istnieje → Skopiuj nową wersję
      
      • Jeśli plik istnieje i jest identyczny → Pomiń (⏭️ No changes needed)
      
      • Jeśli plik istnieje i jest różny:
        - Stwórz backup: file.md.backup-20260205-145118
        - Nadpisz nową wersją
        - Pokaż komunikat: 📦 Backup created
   
   e) Wyczyść pliki tymczasowe
```

---

## Użycie

### Przez yarn/npm

```bash
# Synchronizuj do wszystkich narzędzi (Cursor, Copilot, Antigravity)
yarn rules:sync

# Synchronizuj tylko do konkretnego narzędzia
yarn rules:sync:cursor        # Tylko Cursor
yarn rules:sync:copilot       # Tylko GitHub Copilot
yarn rules:sync:antigravity   # Tylko Google Antigravity
```

### Bezpośrednio przez skrypt

```bash
# Wszystkie narzędzia
./scripts/copy-rules.sh

# Konkretne narzędzie(a)
./scripts/copy-rules.sh cursor
./scripts/copy-rules.sh copilot
./scripts/copy-rules.sh antigravity

# Kilka naraz
./scripts/copy-rules.sh cursor copilot
```

### Aliasy

Skrypt obsługuje krótkie aliasy:
- `c` → cursor
- `gh` → copilot
- `ga`, `google` → antigravity
- `all` → wszystkie (domyślne)

---

## Mapowanie folderów

### Kategorie rules → Headery

| Ścieżka pliku w `rules-ai/rules/` | Header name | Zastosowanie |
|-----------------------------------|-------------|--------------|
| `general.md` | Global components Rule | Komunikacja (ZAWSZE PO POLSKU) |
| `general-rules/*` | Global components Rule | Uniwersalne standardy (wszystkie frameworki) |
| `vue/*` | Vue Components Rule | Zasady specyficzne dla Vue 3 / Nuxt 4 |
| `react/*` | React Components Rule | Zasady specyficzne dla React |
| `tests/*` | Tests Rule | Standardy testowania (Playwright E2E) |

### Przykład

```bash
rules-ai/rules/vue/architecture-vue.md
    ↓
    [dodaj header "Vue Components Rule"]
    ↓
.cursor/rules/vue/architecture-vue.md
.github/instructions/vue/architecture-vue.md
.agent/rules/vue/architecture-vue.md
```

Każdy z tych plików będzie miał header dostosowany do swojego narzędzia:

**Cursor (.cursor/rules/vue/architecture-vue.md):**
```markdown
---
name: Vue Components Rule
description: Standardy dla komponentów Vue 3
globs: "**/*.vue"
---
```

**GitHub Copilot (.github/instructions/vue/architecture-vue.md):**
```markdown
---
name: Vue Components Rule
description: Standardy dla komponentów Vue 3
applyTo: "**/*.vue"
---
```

---

## Backup i bezpieczeństwo

### Kiedy tworzony jest backup?

Backup jest tworzony **tylko** gdy:
1. Plik docelowy już istnieje
2. Jego treść różni się od nowej wersji (porównanie binarne przez `cmp -s`)

### Lokalizacja backupów

Wszystkie backupy trafiają do **centralnego folderu:**
```
rules-ai/backups/
```

### Format nazwy backupu

```
{tool}-{folder}-{original-filename}-{YYYYMMDD-HHMMSS}

Przykłady:
cursor-vue-architecture-vue.md-20260205-145118
copilot-tests-playwright-testing.md-20260205-150230
antigravity-general-rules-coding-standards-general.md-20260205-151045
```

**Gdzie:**
- `tool` - Nazwa narzędzia: `cursor`, `copilot`, `antigravity`
- `folder` - Ścieżka folderu (slash zamieniony na dash): `vue`, `tests`, `general-rules`
- `original-filename` - Oryginalna nazwa pliku: `architecture-vue.md`
- `timestamp` - Data i czas nadpisania: `20260205-145118`

### Co trafia do backupu?

**Cała zawartość starego pliku**, łącznie z:
- Starym headerem
- Wszystkimi manualnymi modyfikacjami
- Ewentualnymi zmianami, które mogły zostać wprowadzone lokalnie

### Odzyskiwanie z backupu

Jeśli chcesz przywrócić starą wersję:

```bash
# Lista backupów dla konkretnego narzędzia
ls -la rules-ai/backups/cursor-*
ls -la rules-ai/backups/copilot-*
ls -la rules-ai/backups/antigravity-*

# Lista backupów dla konkretnego pliku
ls -la rules-ai/backups/*playwright-testing*

# Przywróć backup
cp rules-ai/backups/cursor-tests-playwright-testing.md-20260205-145118 \
   .cursor/rules/tests/playwright-testing.md
```

### Czyszczenie starych backupów

Backupy **nie są automatycznie usuwane**. Możesz je czyścić ręcznie:

```bash
# Usuń backupy starsze niż 7 dni
find rules-ai/backups -name "*.md-*" -mtime +7 -delete

# Usuń backupy konkretnego narzędzia
rm -f rules-ai/backups/cursor-*
rm -f rules-ai/backups/copilot-*
rm -f rules-ai/backups/antigravity-*

# Usuń wszystkie backupy (ostrożnie!)
rm -rf rules-ai/backups/*
```

---

## Output skryptu

### Przykładowy output

```bash
$ yarn rules:sync:cursor

🚀 AI Rules Sync Script with Headers
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Source: /Users/user/project/rules-ai/rules

📋 Copying rules to Cursor...
  Copying: vue/architecture-vue.md
    ⏭️  No changes needed
  Copying: vue/coding-standards-vue.md
    📦 Backup: cursor-vue-coding-standards-vue.md-20260205-145118
    ✓ Updated with header: Vue Components Rule
  Copying: general.md
    ⏭️  No changes needed
  Copying: tests/playwright-testing.md
    ✓ Created
✅ Copied 11 file(s) to /Users/user/project/.cursor/rules

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ All rules successfully synced!
```

### Legenda symboli

| Symbol | Znaczenie |
|--------|-----------|
| ⏭️ | Plik nie wymaga zmian (identyczny) |
| ✓ Created | Nowy plik utworzony |
| ✓ Updated | Plik zaktualizowany |
| ✓ Updated with header | Plik zaktualizowany z headerem |
| 📦 Backup | Utworzono backup w rules-ai/backups/ |
| ⚠️ No header found | Nie znaleziono odpowiedniego headera |

---

## Workflow modyfikacji rules

### Scenariusz 1: Dodajesz nową regułę

```bash
# 1. Utwórz nowy plik w odpowiednim folderze
vim rules-ai/rules/vue/composables-standards.md

# 2. Zsynchronizuj do wszystkich narzędzi
yarn rules:sync

# 3. Zacommituj do git
git add rules-ai/rules/vue/composables-standards.md
git add .cursor/rules/vue/composables-standards.md
git add .github/instructions/vue/composables-standards.md
git add .agent/rules/vue/composables-standards.md
git commit -m "feat: add Vue composables standards"
```

### Scenariusz 2: Edytujesz istniejącą regułę

```bash
# 1. Edytuj źródłowy plik w rules-ai/
vim rules-ai/rules/general-rules/coding-standards-general.md

# 2. Zsynchronizuj - backupy zostaną utworzone automatycznie
yarn rules:sync

# 3. Sprawdź czy są backupy (opcjonalnie)
ls -la .cursor/rules/general-rules/*.backup-*

# 4. Zacommituj tylko źródłowy plik
git add rules-ai/rules/general-rules/coding-standards-general.md
git commit -m "docs: update TypeScript coding standards"

# Uwaga: Foldery .cursor/, .github/instructions/, .agent/ 
# są w .gitignore i nie powinny być commitowane
```

### Scenariusz 3: Zmieniasz header

```bash
# 1. Edytuj plik z headerami
vim rules-ai/cursor-headers.md

# 2. Zsynchronizuj - wszystkie pliki dostaną nowe headery
yarn rules:sync:cursor

# 3. Zacommituj
git add rules-ai/cursor-headers.md
git commit -m "chore: update Cursor headers format"
```

---

## FAQ

### Q: Czy powinienem commitować pliki w `.cursor/`, `.github/instructions/`, `.agent/`?

**A:** Nie. Te foldery powinny być w `.gitignore`. Są generowane automatycznie przez skrypt i każdy developer powinien je wygenerować lokalnie.

### Q: Co się stanie jeśli ręcznie edytuję plik w `.cursor/rules/`?

**A:** Przy następnej synchronizacji skrypt:
1. Wykryje różnicę
2. Stworzy backup twojej wersji
3. Nadpisze ją wersją ze źródła (`rules-ai/rules/`)

**Zawsze edytuj pliki źródłowe w `rules-ai/rules/`, nigdy docelowe.**

### Q: Jak sprawdzić co się zmieniło przed synchronizacją?

**A:** Możesz użyć `diff`:

```bash
# Porównaj źródło z celem
diff rules-ai/rules/vue/architecture-vue.md \
     .cursor/rules/vue/architecture-vue.md
```

### Q: Skrypt pokazuje "⚠️ No header found" - co to znaczy?

**A:** Oznacza, że skrypt nie znalazł odpowiedniego headera w pliku headerów. Sprawdź czy:
1. Plik headerów istnieje (`cursor-headers.md`, `github-headers.md`, `antigravity-headers.md`)
2. Header o danej nazwie jest zdefiniowany
3. Nazwa headera dokładnie pasuje (case-sensitive)

### Q: Czy mogę dodać własne kategorie rules?

**A:** Tak! Aby dodać nową kategorię:

1. Utwórz nowy folder w `rules-ai/rules/`, np. `python/`
2. Edytuj skrypt `scripts/copy-rules.sh`, funkcję `get_header_name()`:
   ```bash
   elif [[ "$rel_path" == python/* ]]; then
       echo "Python Components Rule"
   ```
3. Dodaj odpowiedni header do plików headerów:
   ```markdown
   ---
   name: Python Components Rule
   description: Standardy dla kodu Python
   globs: "**/*.py"
   ---
   ```
4. Zsynchronizuj: `yarn rules:sync`

### Q: Jak usunąć wszystkie wygenerowane pliki i zacząć od nowa?

**A:**

```bash
# Usuń wszystko
rm -rf .cursor/rules/
rm -rf .github/instructions/
rm -rf .agent/rules/

# Wygeneruj ponownie
yarn rules:sync
```

---

## Troubleshooting

### Problem: Skrypt pokazuje "Rules source not found"

**Rozwiązanie:** Sprawdź czy folder `rules-ai/rules/` istnieje i zawiera pliki.

### Problem: Brak uprawnień do wykonania skryptu

**Rozwiązanie:**
```bash
chmod +x scripts/copy-rules.sh
```

### Problem: Skrypt kopiuje pliki ale nie dodaje headerów

**Rozwiązanie:** Sprawdź czy pliki headerów istnieją:
```bash
ls -la rules-ai/*-headers.md
```

### Problem: Za dużo backupów, dysk się zapełnia

**Rozwiązanie:** Regularnie czyść stare backupy:
```bash
# Backupy starsze niż 30 dni
find rules-ai/backups -name "*.md-*" -mtime +30 -delete
```

---

## Wsparcie

W razie pytań lub problemów:
1. Sprawdź ten README
2. Przejrzyj kod skryptu: [scripts/copy-rules.sh](../scripts/copy-rules.sh)
3. Sprawdź output skryptu z flagą verbose (jeśli dostępna)
4. Stwórz issue w repozytorium projektu

---

**Ostatnia aktualizacja:** 5 lutego 2026
