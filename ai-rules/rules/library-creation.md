# 📚 Library Creation Guide

Complete step-by-step instructions for creating new libraries in the FSD structure.

## Quick Decision Tree

```
Creating a new library?
│
├─ Has Vue components? → YES
│  ├─ Business logic for feature? → libs/features/vue/
│  ├─ Data model/entity? → libs/entities/vue/
│  ├─ Reusable UI component? → libs/widgets/vue/
│  └─ State management? → libs/stores/vue/
│
└─ No Vue components? → libs/shared/
```

## 1️⃣ Feature Libraries

**Purpose:** Business logic + feature-specific Vue components

### Structure

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

### Implementation Steps

```bash
# 1. Create directories
mkdir -p libs/features/vue/my-feature/{ui,hooks,model}

# 2. Create project.json
cat > libs/features/vue/my-feature/project.json << 'EOF'
{
  "projectType": "library",
  "targets": {}
}
EOF

# 3. Create types
# libs/features/vue/my-feature/model/types.ts
export interface MyFeatureState {
  isOpen: boolean;
  selectedItem?: string;
}

export interface MyFeatureOptions {
  enableFiltering?: boolean;
}

# 4. Create composable
# libs/features/vue/my-feature/hooks/useMyFeature.ts
import { ref, computed } from 'vue';
import type { MyFeatureState } from '../model/types';

export function useMyFeature(initialState?: Partial<MyFeatureState>) {
  const state = ref<MyFeatureState>({
    isOpen: false,
    selectedItem: undefined,
    ...initialState,
  });

  const toggle = () => {
    state.value.isOpen = !state.value.isOpen;
  };

  return { state, toggle };
}

# 5. Create component
# libs/features/vue/my-feature/ui/MyFeatureComponent.vue
<template>
  <div class="my-feature">
    <button @click="toggle">Toggle</button>
    <div v-if="state.isOpen" class="panel">
      <!-- Content -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMyFeature } from '../hooks/useMyFeature';

const { state, toggle } = useMyFeature();
</script>

<style scoped lang="scss">
.my-feature {
  // Styles
}
</style>

# 6. Create barrel exports
# libs/features/vue/my-feature/model/index.ts
export type { MyFeatureState, MyFeatureOptions };

# libs/features/vue/my-feature/hooks/index.ts
export { useMyFeature } from './useMyFeature';

# libs/features/vue/my-feature/ui/index.ts
export { default as MyFeatureComponent } from './MyFeatureComponent.vue';

# 7. Main index.ts
# libs/features/vue/my-feature/index.ts
export { MyFeatureComponent } from './ui';
export { useMyFeature } from './hooks';
export type { MyFeatureState, MyFeatureOptions } from './model';
```

### Usage in Apps

```typescript
import { MyFeatureComponent, useMyFeature } from '@shared/features/my-feature';
import type { MyFeatureState } from '@shared/features/my-feature';
```

## 2️⃣ Entity Libraries

**Purpose:** Data models + related stores + display components

### Structure

```
libs/entities/vue/my-entity/
├── ui/
│   ├── MyEntityItem.vue
│   └── index.ts
├── lib/
│   ├── useMyEntityStore.ts
│   └── index.ts
├── model/
│   ├── my-entity.types.ts
│   ├── my-entity.constants.ts
│   └── index.ts
├── project.json
└── index.ts
```

### Implementation Steps

```bash
# 1. Create directories
mkdir -p libs/entities/vue/my-entity/{ui,lib,model}

# 2. Define types
# libs/entities/vue/my-entity/model/my-entity.types.ts
export interface MyEntity {
  id: string;
  name: string;
  createdAt: Date;
  status: 'active' | 'inactive' | 'archived';
}

export type MyEntityCreateInput = Omit<MyEntity, 'id' | 'createdAt'>;

# 3. Define constants
# libs/entities/vue/my-entity/model/my-entity.constants.ts
export const MY_ENTITY_DEFAULTS: MyEntity = {
  id: '',
  name: '',
  createdAt: new Date(),
  status: 'active',
};

# 4. Create Pinia store
# libs/entities/vue/my-entity/lib/useMyEntityStore.ts
import { defineStore } from 'pinia';
import type { MyEntity, MyEntityCreateInput } from '../model/my-entity.types';

export const useMyEntityStore = defineStore('my-entity', () => {
  const entities = ref<MyEntity[]>([]);
  const selectedId = ref<string | null>(null);

  const selected = computed(() =>
    entities.value.find(e => e.id === selectedId.value)
  );

  const add = (input: MyEntityCreateInput) => {
    const entity: MyEntity = {
      ...input,
      id: generateId(),
      createdAt: new Date(),
    };
    entities.value.push(entity);
    return entity;
  };

  const remove = (id: string) => {
    entities.value = entities.value.filter(e => e.id !== id);
  };

  const select = (id: string) => {
    selectedId.value = id;
  };

  return { entities, selected, add, remove, select };
}, {
  persist: {
    enabled: true,
    strategies: [{ key: 'my-entity', storage: localStorage }],
  },
});

# 5. Create display component
# libs/entities/vue/my-entity/ui/MyEntityItem.vue
<template>
  <div class="entity-item">
    <h3>{{ entity.name }}</h3>
    <span class="badge" :class="entity.status">{{ entity.status }}</span>
  </div>
</template>

<script setup lang="ts">
import type { MyEntity } from '../model/my-entity.types';

defineProps<{ entity: MyEntity }>();
</script>

<style scoped lang="scss">
.entity-item {
  // Styles
}
</style>

# 6. Create barrel exports
# libs/entities/vue/my-entity/model/index.ts
export type { MyEntity, MyEntityCreateInput };
export { MY_ENTITY_DEFAULTS } from './my-entity.constants';

# libs/entities/vue/my-entity/lib/index.ts
export { useMyEntityStore } from './useMyEntityStore';

# libs/entities/vue/my-entity/ui/index.ts
export { default as MyEntityItem } from './MyEntityItem.vue';

# 7. Main index.ts
# libs/entities/vue/my-entity/index.ts
export type { MyEntity, MyEntityCreateInput } from './model';
export { MY_ENTITY_DEFAULTS } from './model';
export { useMyEntityStore } from './lib';
export { MyEntityItem } from './ui';
```

### Usage in Apps

```typescript
import type { MyEntity } from '@shared/entities/my-entity';
import { useMyEntityStore, MyEntityItem } from '@shared/entities/my-entity';

const store = useMyEntityStore();
const newEntity = store.add({ name: 'Item', status: 'active' });
```

## 3️⃣ Widget Libraries

**Purpose:** Reusable, generic UI components without business logic

### Structure

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

### Implementation Steps

```bash
# 1. Create directories
mkdir -p libs/widgets/vue/my-widget/{ui,model}

# 2. Define prop/slot types
# libs/widgets/vue/my-widget/model/my-widget.types.ts
export interface MyWidgetProps {
  items: string[];
  columns?: number;
  selectable?: boolean;
}

export interface MyWidgetEmits {
  'item-click': (item: string, index: number) => void;
  'item-select': (items: string[]) => void;
}

# 3. Create widget component
# libs/widgets/vue/my-widget/ui/MyWidget.vue
<template>
  <div class="my-widget" :class="{ 'cols-3': columns === 3 }">
    <button
      v-for="(item, index) in items"
      :key="index"
      @click="handleClick(item, index)"
    >
      {{ item }}
    </button>
  </div>
</template>

<script setup lang="ts">
import type { MyWidgetProps, MyWidgetEmits } from '../model/my-widget.types';

const props = withDefaults(defineProps<MyWidgetProps>(), {
  columns: 1,
  selectable: false,
});

const emit = defineEmits<MyWidgetEmits>();

const handleClick = (item: string, index: number) => {
  emit('item-click', item, index);
};
</script>

<style scoped lang="scss">
.my-widget {
  display: grid;
  grid-auto-columns: 1fr;
  gap: 1rem;

  &.cols-3 {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>

# 4. Create barrel exports
# libs/widgets/vue/my-widget/model/index.ts
export type { MyWidgetProps, MyWidgetEmits };

# libs/widgets/vue/my-widget/ui/index.ts
export { default as MyWidget } from './MyWidget.vue';

# 5. Main index.ts
# libs/widgets/vue/my-widget/index.ts
export { MyWidget } from './ui';
export type { MyWidgetProps, MyWidgetEmits } from './model';
```

### Usage in Apps

```typescript
import { MyWidget } from '@shared/widgets/my-widget';
import type { MyWidgetProps } from '@shared/widgets/my-widget';

const handleClick = (item: string) => {
  console.log('Clicked:', item);
};
```

## 4️⃣ Store Libraries

**Purpose:** Pinia stores for complex state management

### Structure

```
libs/stores/vue/my-store/
├── my-store.ts
├── types.ts
├── composables.ts (optional)
├── project.json
└── index.ts
```

### Implementation Steps

```bash
# 1. Create directory
mkdir libs/stores/vue/my-store

# 2. Define types
# libs/stores/vue/my-store/types.ts
export interface MyStoreState {
  loading: boolean;
  error: Error | null;
  data: Record<string, unknown>;
}

# 3. Create store
# libs/stores/vue/my-store/my-store.ts
import { defineStore } from 'pinia';
import type { MyStoreState } from './types';

export const useMyStore = defineStore('my-store', () => {
  const state = ref<MyStoreState>({
    loading: false,
    error: null,
    data: {},
  });

  const setLoading = (value: boolean) => {
    state.value.loading = value;
  };

  const setError = (error: Error | null) => {
    state.value.error = error;
  };

  return { ...toRefs(state.value), setLoading, setError };
}, {
  persist: true,
});

# 4. Create project.json
cat > libs/stores/vue/my-store/project.json << 'EOF'
{
  "projectType": "library",
  "targets": {}
}
EOF

# 5. Create index.ts
# libs/stores/vue/my-store/index.ts
export { useMyStore } from './my-store';
export type { MyStoreState } from './types';
```

### Usage in Apps

```typescript
import { useMyStore } from '@shared/stores/my-store';

const store = useMyStore();
store.setLoading(true);
```

## 5️⃣ Shared Utilities

**Purpose:** Framework-agnostic helpers and utilities

### Simple Utility

```bash
# For small single-function utilities
# libs/shared/my-utility.ts
export function myUtilityFunction(input: string): string {
  return input.toUpperCase();
}

# Usage
import { myUtilityFunction } from '@shared/my-utility';
```

### Complex Utility

```bash
# For utilities with multiple files
mkdir -p libs/shared/my-complex-utility

# libs/shared/my-complex-utility/types.ts
export interface Config {
  option1: string;
}

# libs/shared/my-complex-utility/helper1.ts
export function helper1(config: Config): void { ... }

# libs/shared/my-complex-utility/helper2.ts
export function helper2(): string { ... }

# libs/shared/my-complex-utility/index.ts
export { helper1 } from './helper1';
export { helper2 } from './helper2';
export type { Config } from './types';

# Usage
import { helper1, helper2, type Config } from '@shared/my-complex-utility';
```

## ✅ Pre-Commit Checklist

Before committing your new library:

- [ ] Folder has `project.json`
- [ ] Main folder has `index.ts` with barrel exports
- [ ] All Vue components use `<script setup lang="ts">`
- [ ] All imports in app code use `@shared/*` paths
- [ ] TypeScript compiles: `yarn tsc --noEmit`
- [ ] Linting passes: `yarn lint`
- [ ] All components in ui/ folder exported from index.ts
- [ ] Types properly typed (no `any`)
- [ ] Development server runs: `yarn dev`
- [ ] No cyclic dependencies
- [ ] README updated (if adding major library)

## 🚨 Common Mistakes

| ❌ WRONG | ✅ CORRECT |
|---------|-----------|
| `import x from 'libs/features/vue/...'` | `import x from '@shared/features/...'` |
| No `project.json` in library | Create `project.json` in root |
| Vue components in `libs/shared/` | Put in `libs/{scope}/vue/` |
| Default exports | Use named exports + barrel |
| `<script>` not `<script setup>` | Always use `<script setup lang="ts">` |
| Types in same file as component | Create model/types.ts file |
| No barrel exports | Create index.ts with all exports |
| Cyclic: Feature imports Feature | Use Entity to share state |

## 📂 Full Example: Card Manager Feature

```bash
# Directory structure
libs/features/vue/card-manager/
├── ui/
│   ├── CardManager.vue
│   ├── CardManagerForm.vue
│   └── index.ts
├── hooks/
│   ├── useCardManager.ts
│   └── index.ts
├── model/
│   ├── types.ts
│   └── index.ts
├── project.json
└── index.ts

# Import in app
import { CardManager, useCardManager } from '@shared/features/card-manager';
```

See `.agent/rules/library-creation-guide.md` for even more detailed examples with full code samples.
