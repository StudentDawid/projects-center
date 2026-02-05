# 💻 Coding Standards & Best Practices

Standards and conventions for writing code in this project.

## Vue 3 Component Standards

### Script Setup Syntax (REQUIRED)

Always use `<script setup lang="ts">`:

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
  modelValue: string;
  placeholder?: string;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Enter text...',
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const input = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});
</script>

<template>
  <input v-model="input" :placeholder="placeholder" />
</template>

<style scoped lang="scss">
// Styles...
</style>
```

### Component Organization

Organize component logic:

1. **Imports** - Vue, third-party, then project imports
2. **Types/Interfaces** - Define types before usage
3. **Props** - Define and document props
4. **Emits** - Define emitted events
5. **Refs/State** - Reactive state
6. **Computed** - Computed properties
7. **Watchers** - Watch effects
8. **Methods** - Functions and handlers
9. **Lifecycle** - onMounted, etc.
10. **Template** - Single root element

### Props & Emits

```typescript
// ✅ CORRECT - Type-safe props
interface Props {
  items: string[];
  selectedIndex?: number;
  onSelect?: (index: number) => void;
}

const props = withDefaults(defineProps<Props>(), {
  selectedIndex: 0,
});

// ✅ CORRECT - Typed emits
const emit = defineEmits<{
  'item-selected': [index: number];
  'item-deleted': [item: string];
}>();

// Usage
emit('item-selected', 0);
```

### Composition with Composables

```typescript
// ✅ Extract logic to composables
function useMyFeature(initialValue: string) {
  const state = ref(initialValue);
  const updated = computed(() => state.value.toUpperCase());
  
  return { state, updated };
}

// ✅ Use in component
<script setup lang="ts">
const { state, updated } = useMyFeature('hello');
</script>
```

## TypeScript Standards

### Type Definitions

```typescript
// ✅ CORRECT - Explicit types
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
}

type UserRole = User['role'];

// ❌ WRONG - Using any
const getUser = (id: any) => { ... }

// ✅ CORRECT - Generic types
function getId<T extends { id: string }>(obj: T): string {
  return obj.id;
}
```

### No `any` Type

- Never use `any` - use `unknown` if type is truly unknown
- Let TypeScript infer types where safe
- When unsure about type, widen to broader type, not `any`

### Strict Mode Required

All code must compile with strict TypeScript:

```bash
yarn tsc --noEmit --strict
```

## Code Style Conventions

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `MyComponent.vue` |
| Composables | useXxx pattern | `useMyComposable.ts` |
| Constants | UPPER_SNAKE_CASE | `MAX_ITEMS = 100` |
| Variables | camelCase | `itemCount` |
| Functions | camelCase | `handleClick()` |
| Types/Interfaces | PascalCase | `interface UserProps {}` |
| CSS Classes | kebab-case | `.my-component` |

### File Organization

```
feature-name/
├── ui/                    # Vue components
│   ├── MyComponent.vue
│   ├── MyComponentItem.vue
│   └── index.ts
├── hooks/                 # Composables
│   ├── useMyFeature.ts
│   └── index.ts
├── model/                 # Types
│   ├── types.ts
│   └── index.ts
├── index.ts              # Barrel export
└── project.json
```

### Imports Organization

```typescript
// 1. Vue/Nuxt imports
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useNuxtData } from '#app';

// 2. Third-party imports
import { format } from 'date-fns';
import axios from 'axios';

// 3. Project imports (with @shared)
import type { User } from '@shared/entities/user';
import { useUserStore } from '@shared/entities/user';
import { MyWidget } from '@shared/widgets/my-widget';
import { myUtility } from '@shared/my-utility';

// 4. Local imports
import MySubComponent from './MySubComponent.vue';
```

## Comments & Documentation

### JSDoc for Functions

```typescript
/**
 * Formats a user name for display
 * @param firstName - User's first name
 * @param lastName - User's last name
 * @returns Formatted name string
 * @example
 * formatUserName('John', 'Doe') // returns 'John Doe'
 */
export function formatUserName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`;
}
```

### Complex Logic Comments

```typescript
// ✅ Explain WHY, not WHAT (code shows WHAT)
// We need to debounce search to avoid too many API calls
const debouncedSearch = throttle(searchItems, 300);

// ❌ Unnecessary comments
// Increment counter
counter++;
```

## CSS/SCSS Standards

### Component Scoping

Always use `scoped` in styles:

```vue
<style scoped lang="scss">
.my-component {
  display: flex;
  gap: 1rem;

  &__header {
    font-size: 1.5rem;
  }

  &__item {
    padding: 0.5rem;
  }
}
</style>
```

### Naming Convention (BEM)

Use BEM-like naming:
- `.component-name` - root
- `.component-name__element` - element
- `.component-name--modifier` - modifier

### Utility Classes

Use Tailwind where available, but don't mix:

```vue
<!-- ✅ Use Tailwind utility classes -->
<div class="flex gap-4 p-2">
  <button class="px-4 py-2 rounded bg-blue-500 text-white">Click</button>
</div>

<!-- ✅ Use SCSS for complex styles -->
<style scoped lang="scss">
.complex-animation {
  animation: slide 0.3s ease-in-out;
}

@keyframes slide {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}
</style>
```

## Testing Standards

### Unit Tests (Vitest)

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { myFunction } from './my-function';

describe('myFunction', () => {
  it('should return correct value', () => {
    const result = myFunction('input');
    expect(result).toBe('expected');
  });

  it('should handle edge cases', () => {
    expect(() => myFunction(null)).toThrow();
  });
});
```

### E2E Tests (Playwright)

```typescript
import { test, expect } from '@playwright/test';

test.describe('User Flow', () => {
  test('should create new item', async ({ page }) => {
    await page.goto('/my-feature');
    await page.click('text=Create New');
    await page.fill('input[placeholder="Name"]', 'Test Item');
    await page.click('button:text("Save")');
    
    const item = page.locator('text=Test Item');
    await expect(item).toBeVisible();
  });
});
```

## Performance Optimization

### Code Splitting

```typescript
// ✅ Lazy load heavy components
const HeavyComponent = defineAsyncComponent(() =>
  import('./HeavyComponent.vue')
);

// Use in template
<Suspense>
  <HeavyComponent />
  <template #fallback>
    <div>Loading...</div>
  </template>
</Suspense>
```

### Debouncing & Throttling

```typescript
import { throttle } from '@shared/throttle';

// Debounce search input
const debouncedSearch = throttle(async (term: string) => {
  const results = await searchAPI(term);
}, 300);

// Use in computed/watch
watch(searchTerm, debouncedSearch);
```

### Reactive Optimization

```typescript
// ✅ Use computed for derived state
const isValid = computed(() => {
  return name.value.length > 0 && email.value.includes('@');
});

// ❌ Don't use ref for computed values
// const isValid = ref(false); // ❌ BAD - manual updates needed
```

## Error Handling

```typescript
// ✅ Explicit error handling
async function fetchData() {
  try {
    const response = await api.get('/data');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API error:', error.message);
      throw new Error(`Failed to fetch data: ${error.message}`);
    }
    throw error;
  }
}

// ✅ Return type ensures error handling
function divide(a: number, b: number): number | null {
  if (b === 0) return null;
  return a / b;
}
```

## Code Review Checklist

Before submitting code, verify:

- [ ] Uses `<script setup lang="ts">`
- [ ] No `any` types
- [ ] TypeScript compiles: `yarn tsc --noEmit`
- [ ] No linting errors: `yarn lint`
- [ ] Components follow naming convention
- [ ] Props and emits are typed
- [ ] Complex logic extracted to composables
- [ ] Comments explain WHY not WHAT
- [ ] Tests added for business logic
- [ ] Performance optimized (no N+1, proper memoization)
- [ ] Error handling implemented
- [ ] Accessibility considered (a11y)
