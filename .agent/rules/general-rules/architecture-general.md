---
name: Global components Rule
description: Standardy dla komponentów React
globs: "**/*"
---
# 🏗️ Architecture (Universal)

Universal architecture concepts and FSD principles applicable to all frameworks.

## Overview

The project uses a **monorepo** structure managed by **Nx** with **Feature-Sliced Design (FSD)** architecture. This enables scalability, code reusability, and clear separation of concerns.

Reference: https://feature-sliced.design/

## Feature-Sliced Design (FSD)

FSD organizes code by **business logic slices** rather than technical layers. This improves:
- **Code discoverability** - Feature logic grouped together
- **Feature independence** - Minimal cross-feature dependencies
- **Parallel development** - Teams work on separate features simultaneously
- **Easier refactoring** - Move/rename features without breaking dependencies

## Monorepo Structure

```
project-root/
├── apps/                    # Applications
│   ├── landing-pages/      # Landing pages
│   │   ├── yarn-chaos/     # React app
│   │   └── religion-community/  # Vue/Nuxt landing page
│   ├── rpg-tools/          # Nuxt app for RPG tools
│   ├── main-page/          # Vite app for homepage
│   └── projects-center/    # Landing page
│
├── libs/                    # Reusable libraries
│   ├── features/           # Feature components (framework-tiered)
│   │   ├── vue/
│   │   └── react/
│   ├── entities/           # Entity models & UI (framework-tiered)
│   │   ├── vue/
│   │   └── react/
│   ├── widgets/            # Reusable widgets (framework-tiered)
│   │   ├── vue/
│   │   └── react/
│   ├── stores/             # State management (framework-tiered)
│   │   ├── vue/
│   │   └── react/
│   └── shared/             # Framework-agnostic utilities
│
├── ai-rules/               # AI guidelines (this folder)
├── .agent/                 # Agent AI rules
├── .cursor/                # Cursor IDE rules
├── .cursorrules            # Root cursor rules
└── docs/                   # Documentation
```

## Path Mapping (tsconfig.base.json)

All imports use alias paths instead of relative paths:

```json
{
  "paths": {
    "@shared/features/[name]/*": ["libs/features/vue/[name]/*"],
    "@shared/entities/[name]/*": ["libs/entities/vue/[name]/*"],
    "@shared/widgets/[name]/*": ["libs/widgets/vue/[name]/*"],
    "@shared/stores/[name]/*": ["libs/stores/vue/[name]/*"],
    "@shared/[utility]/*": ["libs/shared/[utility]/*"],
    "@shared/[utility]": ["libs/shared/[utility].ts"]
  }
}
```

### Benefits of Path Mapping

- ✅ No relative path hell (`../../../`)
- ✅ Easy refactoring (move libraries without breaking imports)
- ✅ Clear dependency graph
- ✅ IDE auto-completion works perfectly

## Five Types of Libraries

### 1. **Features** (`libs/{framework}/features/[name]/`)

Business logic and feature-specific UI components.

**Contents:**
- `ui/` - Framework components (Vue/React)
- `hooks/` - Composables/Custom hooks for feature logic
- `model/` - Types and constants
- `project.json` - Nx configuration
- `index.ts` - Public exports

**Example:**
```typescript
import { MyFeature, useMyFeature } from '@shared/features/my-feature';
```

### 2. **Entities** (`libs/{framework}/entities/[name]/`)

Business entity models, types, and related UI components.

**Contents:**
- `ui/` - Entity display components
- `lib/` or `store.ts` - State management for the entity
- `model/` - Entity type definitions
- `project.json` - Nx configuration
- `index.ts` - Public exports

**Example:**
```typescript
import type { Card } from '@shared/entities/card';
import { useCardStore } from '@shared/entities/card';
```

### 3. **Widgets** (`libs/{framework}/widgets/[name]/`)

Reusable, generic UI components without business logic.

**Contents:**
- `ui/` - Widget components
- `model/` - Props/slot type definitions
- `project.json` - Nx configuration
- `index.ts` - Public exports

**Example:**
```typescript
import { Grid } from '@shared/widgets/grid';
```

### 4. **Stores** (`libs/{framework}/stores/[name]/`)

State management (Pinia for Vue, Redux/Zustand for React, etc.).

**Contents:**
- `store.ts` or `store/` - State management definition
- `types.ts` - Store state types
- `composables.ts` or `hooks.ts` - Related composables/hooks
- `project.json` - Nx configuration
- `index.ts` - Public exports

**Example (Vue):**
```typescript
import { useAuthStore } from '@shared/stores/auth';
```

**Example (React):**
```typescript
import { useAuthStore } from '@shared/stores/auth';
```

### 5. **Shared Utilities** (`libs/shared/`)

Framework-agnostic utilities, helpers, and types.

**Contents:**
- Simple files: `utility.ts`
- Complex utilities: `utility/` folder with `index.ts`
- Types: `types/` folder
- Helpers: `helpers/` folder

**Example:**
```typescript
import { voronoi } from '@shared/voronoi';
import { throttle } from '@shared/throttle';
import { initGddb } from '@shared/gddb';
```

## Important Architectural Rules (Universal)

### ✅ DO

- ✅ Put Vue components in `libs/features/vue/`, `libs/entities/vue/`, etc.
- ✅ Put React components in `libs/features/react/`, `libs/entities/react/`, etc.
- ✅ Put utilities in `libs/shared/`
- ✅ Use `@shared/*` imports
- ✅ Create `project.json` in each library
- ✅ Use barrel exports (`index.ts`)
- ✅ Keep features independent
- ✅ Share through entities and stores
- ✅ Document public APIs

### ❌ DON'T

- ❌ Put Vue, React, or other framework components in `libs/shared/` - only pure JS/TS
- ❌ Use relative paths (../../../)
- ❌ Create cyclic dependencies
- ❌ Import features into other features directly
- ❌ Skip `project.json` files
- ❌ Leave internal files in barrel exports
- ❌ Mix framework-specific and framework-agnostic code in same directory
- ❌ Create nested features within features

## Code Layering Example

```
App Component
    ↓
Pages (routing)
    ↓
Features (business logic)
    ↓
Entities (data models)
    ↓
Widgets (UI components)
    ↓
Shared Utilities
```

## Multi-Framework Architecture

The structure supports multiple frameworks with zero conflicts:

```
libs/
├── features/
│   ├── vue/              # Vue components
│   └── react/            # React components (same naming patterns)
├── entities/
│   ├── vue/
│   └── react/
├── widgets/
│   ├── vue/
│   └── react/
├── stores/
│   ├── vue/              # Pinia stores
│   └── react/            # Redux/Zustand stores
└── shared/               # Shared across all frameworks
```

This separation ensures Vue and React libraries can coexist without conflicts, allowing:
- Vue apps to import from `@shared/features/*` pointing to `libs/features/vue/`
- React apps to import from `@shared/features/*` pointing to `libs/features/react/`
- All apps to import shared utilities from `libs/shared/`

---

## Framework-Specific Architecture

For **Vue 3** specific architecture patterns, see: **[architecture-vue.md](architecture-vue.md)**

For **React** specific architecture patterns, see: **[architecture-react.md](architecture-react.md)**
