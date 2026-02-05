# 🏗️ Architecture & Project Structure

This document outlines the monorepo architecture and structure following Feature-Sliced Design (FSD).

## Overview

The project uses a **monorepo** structure managed by **Nx** with **Feature-Sliced Design (FSD)** architecture. This enables scalability, code reusability, and clear separation of concerns.

## Directory Structure

```
project-root/
├── apps/                    # Applications
│   ├── rpg-tools/          # Nuxt app for RPG tools
│   ├── main-page/          # Vite app for homepage
│   ├── yarn-chaos/         # React app
│   └── projects-center/    # Landing page
│
├── libs/                    # Reusable libraries
│   ├── features/vue/       # Feature components
│   ├── entities/vue/       # Entity models & UI
│   ├── widgets/vue/        # Reusable widgets
│   ├── stores/vue/         # Pinia stores
│   └── shared/             # Utilities & helpers
│
├── ai-rules/               # AI guidelines (this folder)
├── .agent/                 # Agent AI rules
├── .cursor/                # Cursor IDE rules
├── .cursorrules            # Root cursor rules
└── docs/                   # Documentation
```

## Feature-Sliced Design (FSD)

FSD organizes code by **business logic slices** rather than technical layers. This improves:
- Code discoverability
- Feature independence
- Parallel development
- Easier refactoring

Reference: https://feature-sliced.design/

## Monorepo Libraries Structure

All libraries follow a framework-tiered structure:

```
libs/
├── features/
│   └── vue/                # Vue-specific features
│       ├── feature-1/
│       ├── feature-2/
│       └── ...
├── entities/
│   └── vue/                # Vue-specific entities
│       ├── entity-1/
│       └── ...
├── widgets/
│   └── vue/                # Vue-specific widgets
│       └── ...
├── stores/
│   └── vue/                # Vue-specific stores
│       └── ...
└── shared/                 # Framework-agnostic
    ├── utility-folder/
    └── utility.ts
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

### 1. **Features** (`libs/features/vue/[name]/`)

Business logic and feature-specific UI components.

**Contents:**
- `ui/` - Vue components
- `hooks/` - Composables for feature logic
- `model/` - Types and constants
- `project.json` - Nx configuration
- `index.ts` - Public exports

**Example:**
```typescript
import { MyFeature, useMyFeature } from '@shared/features/my-feature';
```

### 2. **Entities** (`libs/entities/vue/[name]/`)

Business entity models, types, and related UI components.

**Contents:**
- `ui/` - Entity display components
- `lib/` - Pinia stores for entity state
- `model/` - Entity type definitions
- `project.json` - Nx configuration
- `index.ts` - Public exports

**Example:**
```typescript
import type { Card } from '@shared/entities/card';
import { useCardStore } from '@shared/entities/card';
```

### 3. **Widgets** (`libs/widgets/vue/[name]/`)

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

### 4. **Stores** (`libs/stores/vue/[name]/`)

Pinia stores and related composables for state management.

**Contents:**
- `store.ts` - Pinia store definition
- `types.ts` - Store state types
- `composables.ts` - Related composables
- `project.json` - Nx configuration
- `index.ts` - Public exports

**Example:**
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

## Important Architectural Rules

### ✅ DO

- ✅ Put Vue components in `libs/{scope}/vue/`
- ✅ Put utilities in `libs/shared/`
- ✅ Use `@shared/*` imports
- ✅ Create `project.json` in each library
- ✅ Use barrel exports (`index.ts`)
- ✅ Keep features independent
- ✅ Share through entities and stores
- ✅ Document public APIs

### ❌ DON'T

- ❌ Put Vue components in `libs/shared/`
- ❌ Use relative paths (../../../)
- ❌ Create cyclic dependencies
- ❌ Import features into other features
- ❌ Skip `project.json` files
- ❌ Leave internal files in barrel exports
- ❌ Mix framework-specific and agnostic code
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

## Moving Forward

When the codebase expands to support multiple frameworks (React, Svelte, etc.), the structure is prepared:

```
libs/
├── features/
│   ├── vue/
│   └── react/         # Future
├── entities/
│   ├── vue/
│   └── react/         # Future
├── widgets/
│   ├── vue/
│   └── react/         # Future
├── stores/
│   ├── vue/
│   └── react/         # Future
└── shared/            # Unchanged
```

This separation ensures Vue and React libraries can coexist without conflicts.
