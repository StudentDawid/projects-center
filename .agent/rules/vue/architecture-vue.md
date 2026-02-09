---
name: Vue Components Rule
description: Standardy dla komponentów Vue 3
globs: "**/*.vue"
---
# 🏗️ Architecture - Vue 3

Vue 3 and Nuxt specific architectural patterns and conventions.

## Vue/Nuxt Library Structure

```
libs/
├── features/vue/           # Vue feature components
│   ├── feature-1/
│   ├── feature-2/
│   └── ...
├── entities/vue/           # Vue entity components
│   ├── entity-1/
│   └── ...
├── widgets/vue/            # Vue reusable widgets
│   └── ...
├── stores/vue/             # Pinia stores
│   └── ...
└── shared/                 # Framework-agnostic
    ├── utility-folder/
    └── utility.ts
```

## Feature Library Example (Vue)

Complete structure for a Vue feature:

```
libs/features/vue/my-feature/
├── ui/
│   ├── MyFeatureComponent.vue
│   ├── MyFeaturePanel.vue
│   └── index.ts
├── hooks/
│   ├── useMyFeature.ts
│   ├── useMyFeatureForm.ts
│   └── index.ts
├── model/
│   ├── types.ts
│   └── index.ts
├── project.json
└── index.ts
```

**index.ts (Barrel Export):**
```typescript
export { default as MyFeatureComponent } from './ui/MyFeatureComponent.vue';
export { default as MyFeaturePanel } from './ui/MyFeaturePanel.vue';
export { useMyFeature } from './hooks/useMyFeature';
export type { MyFeatureState } from './model/types';
```

## Entity Library Example (Vue)

Complete structure for a Vue entity:

```
libs/entities/vue/card/
├── ui/
│   ├── CardDisplay.vue
│   ├── CardPreview.vue
│   └── index.ts
├── lib/
│   ├── store.ts
│   └── index.ts
├── model/
│   ├── types.ts
│   └── index.ts
├── project.json
└── index.ts
```

**lib/store.ts (Pinia Store):**
```typescript
import { defineStore } from 'pinia';
import type { Card } from '../model/types';

export const useCardStore = defineStore('card', () => {
  const cards = ref<Card[]>([]);
  const selectedCard = ref<Card | null>(null);

  const setCards = (newCards: Card[]) => {
    cards.value = newCards;
  };

  return { cards, selectedCard, setCards };
});
```

## Widget Library Example (Vue)

Complete structure for a Vue widget:

```
libs/widgets/vue/grid/
├── ui/
│   ├── Grid.vue
│   ├── GridCell.vue
│   └── index.ts
├── model/
│   ├── types.ts
│   └── index.ts
├── project.json
└── index.ts
```

## Store Library Example (Vue)

Complete structure for a Pinia store:

```
libs/stores/vue/map-generator/
├── store.ts
├── types.ts
├── composables.ts
├── project.json
└── index.ts
```

**store.ts:**
```typescript
import { defineStore } from 'pinia';
import type { MapGeneratorState } from './types';

export const useMapGeneratorStore = defineStore('mapGenerator', () => {
  const state = ref<MapGeneratorState>({
    // initial state
  });

  // Getters
  const selectedTerrain = computed(() => state.value.selectedTerrain);

  // Actions
  const updateTerrain = (terrain: string) => {
    state.value.selectedTerrain = terrain;
  };

  return { state, selectedTerrain, updateTerrain };
}, {
  persist: true, // Enable persistence to localStorage
});
```

## Path Mapping for Vue

```json
{
  "paths": {
    "@shared/features/*": ["libs/features/vue/*"],
    "@shared/entities/*": ["libs/entities/vue/*"],
    "@shared/widgets/*": ["libs/widgets/vue/*"],
    "@shared/stores/*": ["libs/stores/vue/*"],
    "@shared/*": ["libs/shared/*"]
  }
}
```

This means:
- `import { MyComponent } from '@shared/features/my-feature'` → `libs/features/vue/my-feature/index.ts`
- `import { useMyStore } from '@shared/stores/my-store'` → `libs/stores/vue/my-store/index.ts`
- `import { throttle } from '@shared/throttle'` → `libs/shared/throttle.ts`

## Vue-Specific DO's and DON'Ts

### ✅ DO (Vue)

- ✅ Use `<script setup lang="ts">` in all components
- ✅ Use Pinia stores for shared state (define with `defineStore`)
- ✅ Create composables in `hooks/` directory for reusable logic
- ✅ Use `scoped` styles with SCSS
- ✅ Extract business logic to composables from components
- ✅ Use proper TypeScript types for props and emits
- ✅ Create `index.ts` barrel exports in each directory
- ✅ Use `#app` for Nuxt-specific imports in Nuxt apps
- ✅ Handle SSR considerations in features (use `onMounted` for client-only code)

### ❌ DON'T (Vue)

- ❌ Use Options API or class-based components
- ❌ Use inline styles instead of `<style>` block
- ❌ Direct DOM manipulation (use `ref` with `useTemplateRef`)
- ❌ Global state without Pinia
- ❌ Mix unscoped and scoped styles
- ❌ Import Vue components from `libs/shared/`
- ❌ Skip type definitions for props and emits
- ❌ Create nested features within features
- ❌ Use relative paths instead of `@shared/*`

## Creating a New Vue Feature (Step by Step)

```bash
# 1. Create directory structure
mkdir -p libs/features/vue/my-feature/{ui,hooks,model}

# 2. Create project.json
cat > libs/features/vue/my-feature/project.json << 'EOF'
{
  "projectType": "library",
  "targets": {}
}
EOF

# 3. Create types (model/types.ts)
# Interface definitions here

# 4. Create composable (hooks/useMyFeature.ts)
# Business logic using Vue 3 Composition API

# 5. Create component (ui/MyFeatureComponent.vue)
# Vue 3 component with <script setup>

# 6. Create barrel export (index.ts)
export { default as MyFeatureComponent } from './ui/MyFeatureComponent.vue';
export { useMyFeature } from './hooks/useMyFeature';
export type { MyFeatureState } from './model/types';

# 7. Add tsconfig path (if needed - usually automatic)
# Path should already map @shared/features/* to libs/features/vue/*
```

## Integration with Nuxt

When used in Nuxt apps (`apps/rpg-tools/`, etc.):

```typescript
// ✅ CORRECT - Import from shared
import { MyFeature } from '@shared/features/my-feature';
import { useMyStore } from '@shared/stores/my-store';

// ✅ CORRECT - Use Nuxt composables alongside shared
import { useRouter } from 'vue-router';
import { useMyFeature } from '@shared/features/my-feature';

// ❌ WRONG - Import directly from libs path
import { MyFeature } from '../../../libs/features/vue/my-feature';
```

## Code Layering (Vue)

```
Nuxt Page/Component
    ↓
Features (vue-specific business logic)
    ↓
Entities (Card, Player, etc.)
    ↓
Widgets (Grid, Modal, etc.)
    ↓
Pinia Stores
    ↓
Shared Utilities
```

---

## General Architecture

For universal architecture concepts, see: **[../general-rules/architecture-general.md](../general-rules/architecture-general.md)**

For **React** specific architecture patterns, see: **[../react/architecture-react.md](../react/architecture-react.md)**
