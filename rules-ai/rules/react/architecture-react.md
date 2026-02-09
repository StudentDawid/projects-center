# 🏗️ Architecture - React

React specific architectural patterns and conventions (preparing for future React development).

## React Library Structure

```
libs/
├── features/react/         # React feature components
│   ├── feature-1/
│   ├── feature-2/
│   └── ...
├── entities/react/         # React entity components
│   ├── entity-1/
│   └── ...
├── widgets/react/          # React reusable widgets
│   └── ...
├── stores/react/           # Redux/Zustand stores
│   └── ...
└── shared/                 # Framework-agnostic
    ├── utility-folder/
    └── utility.ts
```

## Feature Library Example (React)

Complete structure for a React feature:

```
libs/features/react/my-feature/
├── ui/
│   ├── MyFeatureComponent.tsx
│   ├── MyFeaturePanel.tsx
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
export { MyFeatureComponent } from './ui/MyFeatureComponent';
export { MyFeaturePanel } from './ui/MyFeaturePanel';
export { useMyFeature } from './hooks/useMyFeature';
export type { MyFeatureState } from './model/types';
```

## Entity Library Example (React)

Complete structure for a React entity:

```
libs/entities/react/card/
├── ui/
│   ├── CardDisplay.tsx
│   ├── CardPreview.tsx
│   └── index.ts
├── hooks/
│   ├── useCardStore.ts
│   └── index.ts
├── model/
│   ├── types.ts
│   └── index.ts
├── project.json
└── index.ts
```

**hooks/useCardStore.ts (Redux/Zustand):**
```typescript
import { create } from 'zustand';
import type { Card } from '../model/types';

interface CardStore {
  cards: Card[];
  selectedCard: Card | null;
  setCards: (cards: Card[]) => void;
  selectCard: (card: Card | null) => void;
}

export const useCardStore = create<CardStore>((set) => ({
  cards: [],
  selectedCard: null,
  setCards: (cards) => set({ cards }),
  selectCard: (selectedCard) => set({ selectedCard }),
}));
```

## Widget Library Example (React)

Complete structure for a React widget:

```
libs/widgets/react/grid/
├── ui/
│   ├── Grid.tsx
│   ├── GridCell.tsx
│   └── index.ts
├── model/
│   ├── types.ts
│   └── index.ts
├── project.json
└── index.ts
```

## Store Library Example (React)

Complete structure for a Redux/Zustand store:

```
libs/stores/react/map-generator/
├── store.ts
├── types.ts
├── hooks.ts
├── project.json
└── index.ts
```

**store.ts (Zustand):**
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MapGeneratorState } from './types';

interface MapGeneratorStore extends MapGeneratorState {
  updateTerrain: (terrain: string) => void;
  reset: () => void;
}

const initialState: MapGeneratorState = {
  selectedTerrain: 'grass',
  // other initial state
};

export const useMapGeneratorStore = create<MapGeneratorStore>()(
  persist(
    (set) => ({
      ...initialState,
      updateTerrain: (terrain) => set({ selectedTerrain: terrain }),
      reset: () => set(initialState),
    }),
    {
      name: 'map-generator-store', // localStorage key
    }
  )
);
```

## Path Mapping for React

```json
{
  "paths": {
    "@shared/features/*": ["libs/features/react/*"],
    "@shared/entities/*": ["libs/entities/react/*"],
    "@shared/widgets/*": ["libs/widgets/react/*"],
    "@shared/stores/*": ["libs/stores/react/*"],
    "@shared/*": ["libs/shared/*"]
  }
}
```

This means:
- `import { MyComponent } from '@shared/features/my-feature'` → `libs/features/react/my-feature/index.ts`
- `import { useMyStore } from '@shared/stores/my-store'` → `libs/stores/react/my-store/index.ts`
- `import { throttle } from '@shared/throttle'` → `libs/shared/throttle.ts`

## React-Specific DO's and DON'Ts

### ✅ DO (React)

- ✅ Use functional components with hooks
- ✅ Use Zustand, Redux, or Jotai for state management
- ✅ Create custom hooks in `hooks/` directory for reusable logic
- ✅ Use TypeScript with proper prop typing
- ✅ Create `index.ts` barrel exports in each directory
- ✅ Use React.FC type annotation for components
- ✅ Extract business logic to custom hooks from components
- ✅ Use `useCallback` for callbacks passed to children
- ✅ Memoize expensive computations with `useMemo`
- ✅ Proper dependency arrays in `useEffect`

### ❌ DON'T (React)

- ❌ Use class components
- ❌ Use inline styles for all styling (use Tailwind/CSS Modules/Styled Components)
- ❌ Direct DOM manipulation with `querySelector`
- ❌ Global state management without a store library
- ❌ Prop drilling for deeply nested state
- ❌ Import React components from `libs/shared/`
- ❌ Skip TypeScript prop definitions
- ❌ Create nested features within features
- ❌ Use relative paths instead of `@shared/*`
- ❌ useEffect without proper dependency array

## Creating a New React Feature (Step by Step)

```bash
# 1. Create directory structure
mkdir -p libs/features/react/my-feature/{ui,hooks,model}

# 2. Create project.json
cat > libs/features/react/my-feature/project.json << 'EOF'
{
  "projectType": "library",
  "targets": {}
}
EOF

# 3. Create types (model/types.ts)
# Interface definitions here

# 4. Create custom hook (hooks/useMyFeature.ts)
# Business logic using React hooks

# 5. Create component (ui/MyFeatureComponent.tsx)
# React component with hooks

# 6. Create barrel export (index.ts)
export { MyFeatureComponent } from './ui/MyFeatureComponent';
export { useMyFeature } from './hooks/useMyFeature';
export type { MyFeatureState } from './model/types';

# 7. Add tsconfig path (if needed - usually automatic)
# Path should already map @shared/features/* to libs/features/react/*
```

## State Management Patterns

### Zustand (Recommended - Lightweight)

```typescript
import { create } from 'zustand';

interface Store {
  count: number;
  increment: () => void;
}

export const useStore = create<Store>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));

// In component
export const Counter = () => {
  const count = useStore((state) => state.count);
  const increment = useStore((state) => state.increment);
  
  return <button onClick={increment}>Count: {count}</button>;
};
```

### Redux Toolkit (For complex apps)

```typescript
import { createSlice, configureStore } from '@reduxjs/toolkit';
import { useSelector, useDispatch } from 'react-redux';

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
  },
});

export const { increment } = counterSlice.actions;
export const useCounter = () => {
  const value = useSelector((state: RootState) => state.counter.value);
  const dispatch = useDispatch();
  return { value, increment: () => dispatch(increment()) };
};
```

## Code Layering (React)

```
React App/Page
    ↓
Features (React-specific business logic)
    ↓
Entities (Data models)
    ↓
Widgets (Reusable UI components)
    ↓
Stores (State management)
    ↓
Shared Utilities
```

## Integration with Next.js (Future)

If React apps use Next.js in the future:

```typescript
// ✅ CORRECT - Import from shared
import { MyFeature } from '@shared/features/my-feature';
import { useMyStore } from '@shared/stores/my-store';

// ✅ CORRECT - Use Next.js hooks alongside shared
import { useRouter } from 'next/router';
import { useMyFeature } from '@shared/features/my-feature';

// ❌ WRONG - Import directly from libs path
import { MyFeature } from '../../../libs/features/react/my-feature';
```

---

## General Architecture

For universal architecture concepts, see: **[../general-rules/architecture-general.md](../general-rules/architecture-general.md)**

For **Vue** specific architecture patterns, see: **[../vue/architecture-vue.md](../vue/architecture-vue.md)**
