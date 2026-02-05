---
trigger: on_demand
---

# 📚 Przewodnik Tworzenia Bibliotek w FSD

Dokładny krok-po-kroku przewodnik do tworzenia nowych bibliotek zgodnie z nową strukturą FSD.

## 🎯 Szybki Przegląd

```
Nowa biblioteka Vue?
├─ Feature (logika biznesowa) → libs/features/vue/
├─ Entity (model danych) → libs/entities/vue/
├─ Widget (komponent uniwersalny) → libs/widgets/vue/
├─ Store (Pinia) → libs/stores/vue/
└─ Utility (bez Vue) → libs/shared/

ZAWSZE: Każda biblioteka potrzebuje project.json!
```

---

## 1️⃣ Tworzenie Feature

Feature to komponenty z logiką biznesową dla konkretnej funkcjonalności.

### Struktura
```
libs/features/vue/my-feature/
├── ui/
│   ├── MyFeatureComponent.vue
│   ├── MyFeaturePanel.vue
│   └── index.ts
├── hooks/
│   ├── useMyFeature.ts
│   └── index.ts
├── model/                       # Opcjonalnie
│   ├── types.ts
│   └── index.ts
├── project.json
└── index.ts
```

### Krok po Kroku

```bash
# 1. Utwórz strukturę
mkdir -p libs/features/vue/my-feature/{ui,hooks,model}

# 2. Utwórz project.json
cat > libs/features/vue/my-feature/project.json << 'EOF'
{
  "projectType": "library",
  "targets": {}
}
EOF

# 3. Utwórz index.ts w komponencie
# libs/features/vue/my-feature/ui/MyComponent.vue
<template>
  <div class="my-component">
    <!-- Component HTML -->
  </div>
</template>

<script setup lang="ts">
// Component logic
</script>

# 4. Utwórz barrel export
# libs/features/vue/my-feature/ui/index.ts
export { default as MyComponent } from './MyComponent.vue';

# 5. Utwórz composable (jeśli potrzebny)
# libs/features/vue/my-feature/hooks/useMyFeature.ts
export function useMyFeature() {
  return {
    // Feature logic
  };
}

# 6. Utwórz główny index.ts
# libs/features/vue/my-feature/index.ts
export { default as MyComponent } from './ui/MyComponent.vue';
export { useMyFeature } from './hooks/useMyFeature';
```

### Importowanie w Aplikacji

```typescript
// ✅ CORRECT
import { MyComponent, useMyFeature } from '@shared/features/my-feature';

// ✅ ALSO CORRECT (specific imports)
import MyComponent from '@shared/features/my-feature/ui/MyComponent.vue';
import { useMyFeature } from '@shared/features/my-feature/hooks/useMyFeature';

// ❌ WRONG
import MyComponent from 'libs/features/vue/my-feature/ui/MyComponent.vue';
```

---

## 2️⃣ Tworzenie Entity

Entity reprezentuje model danych w aplikacji (np. Card, User, Monster).

### Struktura
```
libs/entities/vue/my-entity/
├── ui/
│   ├── MyEntityItem.vue
│   └── index.ts
├── lib/
│   ├── useMyEntityStore.ts      # Pinia store
│   └── index.ts
├── model/
│   ├── my-entity.types.ts
│   └── index.ts
├── project.json
└── index.ts
```

### Krok po Kroku

```bash
# 1. Utwórz strukturę
mkdir -p libs/entities/vue/my-entity/{ui,lib,model}

# 2. Zdefiniuj typy
# libs/entities/vue/my-entity/model/my-entity.types.ts
export interface MyEntity {
  id: string;
  name: string;
  // ... inne pola
}

export const MY_ENTITY_DEFAULTS: MyEntity = {
  id: '',
  name: '',
};

# 3. Utwórz Pinia store
# libs/entities/vue/my-entity/lib/useMyEntityStore.ts
import { defineStore } from 'pinia';
import type { MyEntity } from '../model/my-entity.types';

export const useMyEntityStore = defineStore('my-entity', () => {
  const entities = ref<MyEntity[]>([]);

  const addEntity = (entity: MyEntity) => {
    entities.value.push(entity);
  };

  return { entities, addEntity };
}, {
  persist: true,  // Pinia persist plugin
});

# 4. Utwórz komponent wyświetlania
# libs/entities/vue/my-entity/ui/MyEntityItem.vue
<template>
  <div class="entity-item">
    <h3>{{ entity.name }}</h3>
  </div>
</template>

<script setup lang="ts">
import type { MyEntity } from '../model/my-entity.types';

defineProps<{ entity: MyEntity }>();
</script>

# 5. Utwórz barrel exports
# libs/entities/vue/my-entity/model/index.ts
export type { MyEntity };
export { MY_ENTITY_DEFAULTS } from './my-entity.types';

# libs/entities/vue/my-entity/ui/index.ts
export { default as MyEntityItem } from './MyEntityItem.vue';

# libs/entities/vue/my-entity/lib/index.ts
export { useMyEntityStore } from './useMyEntityStore';

# 6. Główny index.ts
# libs/entities/vue/my-entity/index.ts
export type { MyEntity } from './model/my-entity.types';
export { MY_ENTITY_DEFAULTS } from './model';
export { useMyEntityStore } from './lib';
export { MyEntityItem } from './ui';
```

### Importowanie w Aplikacji

```typescript
// ✅ CORRECT
import type { MyEntity } from '@shared/entities/my-entity';
import { useMyEntityStore } from '@shared/entities/my-entity';
import { MyEntityItem } from '@shared/entities/my-entity/ui';

// ❌ WRONG
import MyEntity from '@shared/entities/my-entity/model/my-entity.types';
```

---

## 3️⃣ Tworzenie Widget

Widget to uniwersalny, reużywalny komponent bez logiki biznesowej.

### Struktura
```
libs/widgets/vue/my-widget/
├── ui/
│   ├── MyWidget.vue
│   └── index.ts
├── model/
│   ├── my-widget.types.ts
│   └── index.ts
├── project.json
└── index.ts
```

### Krok po Kroku

```bash
# 1. Utwórz strukturę
mkdir -p libs/widgets/vue/my-widget/{ui,model}

# 2. Zdefiniuj typy (props/slots)
# libs/widgets/vue/my-widget/model/my-widget.types.ts
export interface MyWidgetProps {
  items: string[];
  columns?: number;
}

export interface MyWidgetSlots {
  default: (item: string) => any;
  header: () => any;
}

# 3. Utwórz komponent
# libs/widgets/vue/my-widget/ui/MyWidget.vue
<template>
  <div class="my-widget">
    <slot name="header" />
    <div :class="{ 'grid': true, 'cols-3': columns === 3 }">
      <slot v-for="item in items" :item="item" :key="item">
        {{ item }}
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MyWidgetProps } from '../model/my-widget.types';

withDefaults(defineProps<MyWidgetProps>(), {
  columns: 1,
});
</script>

# 4. Utwórz barrel exports
# libs/widgets/vue/my-widget/ui/index.ts
export { default as MyWidget } from './MyWidget.vue';

# libs/widgets/vue/my-widget/model/index.ts
export type { MyWidgetProps, MyWidgetSlots };

# 5. Główny index.ts
# libs/widgets/vue/my-widget/index.ts
export { MyWidget } from './ui';
export type { MyWidgetProps, MyWidgetSlots } from './model';
```

### Importowanie

```typescript
import { MyWidget } from '@shared/widgets/my-widget';
import type { MyWidgetProps } from '@shared/widgets/my-widget';
```

---

## 4️⃣ Tworzenie Store (Pinia)

Store to centralne zarządzanie stanem aplikacji.

### Struktura
```
libs/stores/vue/my-store/
├── my-store.ts                  # Store definition
├── types.ts                      # Store types
├── composables.ts                # Related composables (opcjonalnie)
├── project.json
└── index.ts
```

### Krok po Kroku

```bash
# 1. Utwórz strukturę
mkdir libs/stores/vue/my-store

# 2. Zdefiniuj typy
# libs/stores/vue/my-store/types.ts
export interface MyState {
  items: string[];
  loading: boolean;
}

# 3. Utwórz store
# libs/stores/vue/my-store/my-store.ts
import { defineStore } from 'pinia';
import type { MyState } from './types';

export const useMyStore = defineStore('my-store', () => {
  const state = ref<MyState>({
    items: [],
    loading: false,
  });

  const addItem = (item: string) => {
    state.value.items.push(item);
  };

  const setLoading = (loading: boolean) => {
    state.value.loading = loading;
  };

  return {
    ...toRefs(state.value),
    addItem,
    setLoading,
  };
}, {
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'my-store',
        storage: localStorage,
      },
    ],
  },
});

# 4. Utwórz index.ts
# libs/stores/vue/my-store/index.ts
export { useMyStore } from './my-store';
export type { MyState } from './types';

# 5. Dodaj project.json
cat > libs/stores/vue/my-store/project.json << 'EOF'
{
  "projectType": "library",
  "targets": {}
}
EOF
```

### Importowanie

```typescript
import { useMyStore } from '@shared/stores/my-store';

const store = useMyStore();
store.addItem('nowy element');
```

---

## 5️⃣ Tworzenie Utility (Shared)

Utilities to funkcje, klasy i typy niezależne od frameworku.

### Struktura - Prosty Utility

```
libs/shared/my-utility.ts        # Dla małych plików
```

```typescript
// libs/shared/my-utility.ts
export function myUtilityFunction() {
  // logic
}
```

### Struktura - Skomplikowany Utility

```
libs/shared/my-complex-utility/
├── index.ts
├── helper1.ts
├── helper2.ts
└── types.ts
```

```bash
# Struktura katalogu
mkdir -p libs/shared/my-complex-utility

# libs/shared/my-complex-utility/types.ts
export interface MyUtilityConfig {
  // types
}

# libs/shared/my-complex-utility/helper1.ts
export function helper1() {}

# libs/shared/my-complex-utility/index.ts
export { helper1 } from './helper1';
export { helper2 } from './helper2';
export type { MyUtilityConfig } from './types';
```

### Importowanie

```typescript
// ✅ Prosty utility
import { myUtilityFunction } from '@shared/my-utility';

// ✅ Skomplikowany utility
import { helper1, type MyUtilityConfig } from '@shared/my-complex-utility';

// ✅ Jeśli trzeba ręcznie zmapować w tsconfig (rzadko):
// tsconfig.base.json
"@shared/my-special-utility/*": ["libs/shared/my-special-utility/*"]
```

---

## ✅ Checklist Przed Publikacją

Przed commitowaniem nowej biblioteki, sprawdź:

- [ ] Folder ma `project.json`
- [ ] Folder ma główny `index.ts` z public exports
- [ ] Wszystkie componenty mają `<script setup lang="ts">`
- [ ] Importy w aplikacji używają `@shared/*` (nie bezpośrednich ścieżek)
- [ ] Path mappings w `tsconfig.base.json` są prawidłowe (jeśli custom)
- [ ] Kod jest TypeScript (`.ts` lub `.vue`)
- [ ] Testy (jeśli istnieją) znajdują się w tej samej bibliotece
- [ ] Żadne cyclic dependencies

---

## 🔄 Path Mapping Reference

W `tsconfig.base.json` automatycznie obsługiwane są:

```json
"@shared/features/[name]/*": ["libs/features/vue/[name]/*"]
"@shared/entities/[name]/*": ["libs/entities/vue/[name]/*"]
"@shared/widgets/[name]/*": ["libs/widgets/vue/[name]/*"]
"@shared/stores/[name]/*": ["libs/stores/vue/[name]/*"]
"@shared/[utility]/*": ["libs/shared/[utility]/*"]
"@shared/[utility]": ["libs/shared/[utility].ts"]
```

Jeśli potrzebujesz custom mappingu (rzadko), dodaj do paths w tsconfig.base.json.

---

## 🚀 Przykład Kompletu Nowej Biblioteki

```bash
# Feature: card-manager
mkdir -p libs/features/vue/card-manager/{ui,hooks,model}

# Zdefiniuj typy
cat > libs/features/vue/card-manager/model/types.ts << 'EOF'
export interface CardManagerOptions {
  sortBy?: 'name' | 'date';
  filter?: string;
}
EOF

# Komponenty
cat > libs/features/vue/card-manager/ui/CardManager.vue << 'EOF'
<template>
  <div class="card-manager">
    <!-- Manager UI -->
  </div>
</template>
<script setup lang="ts">
import { useCardManager } from '../hooks/useCardManager';
const { cards } = useCardManager();
</script>
EOF

# Hooks
cat > libs/features/vue/card-manager/hooks/useCardManager.ts << 'EOF'
export function useCardManager() {
  return { cards: ref([]) };
}
EOF

# Barrel exports
cat > libs/features/vue/card-manager/index.ts << 'EOF'
export { default as CardManager } from './ui/CardManager.vue';
export { useCardManager } from './hooks/useCardManager';
export type { CardManagerOptions } from './model/types';
EOF

# Project config
cat > libs/features/vue/card-manager/project.json << 'EOF'
{
  "projectType": "library",
  "targets": {}
}
EOF

# ✅ Gotowe! Importuj jako:
# import { CardManager, useCardManager } from '@shared/features/card-manager';
```
