# Plan Refactoryzacji FSD - Podział na Vue/React

## 📊 Analiza Bieżącej Struktury

### Biblioteki Vue (będą w `vue/`):
```
libs/shared/features/
  - card-delete (Vue)
  - card-edit (Vue)
  - card-list (Vue)
  - card-preview (Vue)
  - card-print (Vue)

libs/shared/entities/
  - card (Vue)

libs/shared/widgets/
  - card-grid (Vue)

libs/rpg-tools/features/
  - rpg-map-generator (Vue)
  - rpg-world-generator (Vue)
```

### Biblioteki TypeScript/Utility (będą w `shared/`):
```
libs/shared/lib/
  - gddb (TS/Node - brak UI)
  - voronoi-d3 (TS/Node - brak UI)
  - [inne utilities]

libs/shared/stores/
  - map-generator (Pinia - logic only)

libs/shared/types/
  - (TS types only)

libs/rpg-tools/shared/
  - map-generator (TS utilities)
  - world-generator (TS utilities)
```

## 🎯 Nowa Struktura

```
libs/
├── features/
│   └── vue/
│       ├── card-delete/
│       ├── card-edit/
│       ├── card-list/
│       ├── card-preview/
│       ├── card-print/
│       ├── rpg-map-generator/
│       └── rpg-world-generator/
├── entities/
│   └── vue/
│       └── card/
├── widgets/
│   └── vue/
│       └── card-grid/
├── stores/
│   └── vue/
│       └── map-generator/
├── shared/
│   ├── lib/
│   │   ├── gddb/
│   │   └── voronoi-d3/
│   ├── map-generator/
│   ├── world-generator/
│   ├── types/
│   └── entities/ (jeśli będą TS types)
└── types/ (ogólne typy)
```

## 📋 Kroki Migracji

### FAZA 1: Przygotowanie
- [ ] Stworzyć nową strukturę katalogów
- [ ] Skopiować pliki do nowych lokalizacji

### FAZA 2: Aktualizacja Importów
- [ ] Zaktualizować tsconfig.base.json path mappings
- [ ] Zaktualizować project.json dla każdej biblioteki
- [ ] Zaktualizować path mappings w apps/*/nuxt.config.ts

### FAZA 3: Weryfikacja
- [ ] Sprawdzić błędy TypeScript
- [ ] Testować lokalne dev serwery
- [ ] Git commit z nowymi zmianami

### FAZA 4: Sprzątanie
- [ ] Usunąć stare katalogi
- [ ] Usunąć DELETION_ANALYSIS.md i inne pliki tymczasowe

## ⚠️ Uwagi

1. **Biblioteki bez UI (TS/Utils)** zostają na poziomie `libs/`
   - `libs/shared/lib/` - utilities
   - `libs/rpg-tools/shared/` - utils dla RPG
   - `libs/shared/types/` - types

2. **Biblioteki z UI (Vue)** idą do `libs/{scope}/vue/{name}`
   - np. `libs/features/vue/card-edit/`
   - np. `libs/rpg-tools/features/vue/rpg-map-generator/`

3. **Stores Pinia** idą do `libs/stores/vue/` (bo są używane z Vue)

4. **Path mappings** przykład:
   - `@shared/features/card-edit/*` → `libs/features/vue/card-edit/*`
   - `@shared/lib/gddb` → `libs/shared/lib/gddb/index.ts`
   - `@rpg-tools/features/rpg-map-generator/*` → `libs/rpg-tools/features/vue/rpg-map-generator/*`

## 🔄 Wpływ na Importy w Aplikacjach

Aplikacje (apps/rpg-tools, apps/yarn-chaos itd) będą używać tych samych path mappings,
ale będą wskazywać na nowe lokalizacje w strukturze Vue/React.

Przykład:
```typescript
// Przed:
import CardForm from '@shared/features/card-edit/ui/CardForm.vue'

// Po (path mapping się zmienia, import pozostaje taki sam):
import CardForm from '@shared/features/card-edit/ui/CardForm.vue'
// mapuje na: libs/features/vue/card-edit/ui/CardForm.vue
```

---

**Zatwierdzić plan?** Czy chcesz, aby wprowadzić te zmiany?
