---
trigger: always_on
---

You are an expert Vue 3 and Nuxt developer.

# Architecture & Design

## FSD Structure (Feature-Sliced Design)

The monorepo uses a framework-tiered FSD structure:

```
libs/
├── features/
│   └── vue/              # Vue-specific feature components
│       └── [feature-name]/
├── entities/
│   └── vue/              # Vue entity models & UI
│       └── [entity-name]/
├── widgets/
│   └── vue/              # Reusable Vue widgets
│       └── [widget-name]/
├── stores/
│   └── vue/              # Pinia stores (Vue-specific)
│       └── [store-name]/
└── shared/               # Framework-agnostic utilities
    ├── [utility-name]/
    └── *.ts              # Direct utility files
```

## Creating New Libraries

### 1. **Features** (`libs/features/vue/[feature-name]/`)
Business logic & feature-specific UI components

**Structure:**
```
feature-name/
├── ui/                   # Vue components
│   ├── Component1.vue
│   └── index.ts
├── hooks/                # Vue composables
│   ├── useFeature.ts
│   └── index.ts
├── model/                # Types & logic (if needed)
│   ├── types.ts
│   └── index.ts
├── project.json          # Nx configuration
└── index.ts              # Public exports
```

**Usage in apps:**
```typescript
import Component from '@shared/features/feature-name/ui/Component.vue';
import { useFeature } from '@shared/features/feature-name/hooks/useFeature';
```

### 2. **Entities** (`libs/entities/vue/[entity-name]/`)
Business entity models, types, and related UI

**Structure:**
```
entity-name/
├── ui/                   # Entity display components
│   ├── EntityItem.vue
│   └── index.ts
├── lib/                  # Pinia stores (if entity has state)
│   ├── useEntityStore.ts
│   └── index.ts
├── model/                # Types & constants
│   ├── entity.types.ts
│   └── index.ts
├── project.json
└── index.ts
```

**Usage in apps:**
```typescript
import type { Entity } from '@shared/entities/entity-name';
import { useEntityStore } from '@shared/entities/entity-name/lib/useEntityStore';
```

### 3. **Widgets** (`libs/widgets/vue/[widget-name]/`)
Reusable, generic UI components without business logic

**Structure:**
```
widget-name/
├── ui/                   # Widget components
│   ├── Widget.vue
│   └── index.ts
├── model/                # Types for widget props/slots
│   ├── widget.types.ts
│   └── index.ts
├── project.json
└── index.ts
```

**Usage in apps:**
```typescript
import { Widget } from '@shared/widgets/widget-name/ui';
```

### 4. **Stores** (`libs/stores/vue/[store-name]/`)
Pinia stores and related composables

**Structure:**
```
store-name/
├── store.ts              # Pinia store definition
├── composables.ts        # Related composables (if any)
├── types.ts              # Store types
├── project.json
└── index.ts
```

**Usage in apps:**
```typescript
import { useStore } from '@shared/stores/store-name';
```

### 5. **Shared Utilities** (`libs/shared/`)
Framework-agnostic utilities and helpers

**Structure:**
```
shared/
├── [utility-folder]/     # For complex utilities with multiple files
│   ├── index.ts
│   └── *.ts
└── utility.ts            # Direct utility files (no folder)
```

**Types of shared utilities:**
- Math/algorithm utilities (voronoi, perlin-noise)
- Type definitions (gddb/types.ts)
- General helper functions (throttle, logger)

**Usage in apps:**
```typescript
import { voronoi } from '@shared/voronoi';
import { initGddb } from '@shared/lib/gddb';
import { throttle } from '@shared/throttle';
```

## Path Mapping Rules

All imports use `@shared/*` and `@rpg-tools/*` prefixes, which are mapped in `tsconfig.base.json`:

```json
"paths": {
  "@shared/features/[feature]/*": ["libs/features/vue/[feature]/*"],
  "@shared/entities/[entity]/*": ["libs/entities/vue/[entity]/*"],
  "@shared/widgets/[widget]/*": ["libs/widgets/vue/[widget]/*"],
  "@shared/stores/[store]/*": ["libs/stores/vue/[store]/*"],
  "@shared/[utility]/*": ["libs/shared/[utility]/*"],
  "@shared/[utility]": ["libs/shared/[utility].ts"]
}
```

## Creating New Library - Step by Step

1. **Create directory structure**
   ```bash
   mkdir -p libs/features/vue/my-feature/{ui,hooks}
   ```

2. **Add project.json** (copy from existing library)
   ```json
   {
     "projectType": "library",
     "targets": {}
   }
   ```

3. **Create index.ts** for public exports
   ```typescript
   export { default as MyComponent } from './ui/MyComponent.vue';
   export { useMyFeature } from './hooks/useMyFeature';
   ```

4. **Update tsconfig.base.json** if needed
   - For features: automatic, uses `@shared/features/*` pattern
   - For new utilities: add manual path mapping

5. **Update path mapping** (only if not using standard patterns)
   ```json
   "@shared/my-utility": ["libs/shared/my-utility.ts"]
   ```

## Important Rules

- ✅ All Vue components go to `libs/{scope}/vue/` (features, entities, widgets, stores)
- ✅ Framework-agnostic code goes to `libs/shared/`
- ✅ Each library has `project.json` for Nx
- ✅ Use barrel exports (index.ts) for clean APIs
- ✅ Group related files: ui/, hooks/, model/, types/
- ❌ Never put Vue components directly in `libs/shared/`
- ❌ Don't skip the `project.json` file
- ❌ Don't import across scope boundaries (use @shared/* imports)
