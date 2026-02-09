---
name: Global components Rule
description: Standardy dla komponentów React
applyTo: "**/*"
---
# 💻 Coding Standards (Universal)

Universal coding standards applicable to all frameworks (Vue, React, etc.).

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
| Components | PascalCase | `MyComponent.vue` / `MyComponent.tsx` |
| Composables/Hooks | useXxx pattern | `useMyComposable.ts` / `useMyHook.ts` |
| Constants | UPPER_SNAKE_CASE | `MAX_ITEMS = 100` |
| Variables | camelCase | `itemCount` |
| Functions | camelCase | `handleClick()` |
| Types/Interfaces | PascalCase | `interface UserProps {}` |
| CSS Classes | kebab-case | `.my-component` |
| Files | kebab-case | `my-component.vue` / `my-component.tsx` |
| Directories | kebab-case | `my-component/` |

### File Organization (Universal)

```
feature-name/
├── ui/                    # Framework-specific components
│   ├── MyComponent.vue    # (for Vue)
│   ├── MyComponent.tsx    # (for React)
│   └── index.ts
├── hooks/                 # Composables/Custom Hooks
│   ├── useMyFeature.ts
│   └── index.ts
├── model/                 # Types & constants
│   ├── types.ts
│   └── index.ts
├── index.ts              # Barrel export
└── project.json
```

### Imports Organization (Universal)

```typescript
// 1. Framework imports (Vue OR React - framework-specific)
import { ref, computed } from 'vue';                    // Vue
import { useState, useEffect } from 'react';            // React

// 2. Routing/Framework specific
import { useRouter } from 'vue-router';                 // Vue
import { useNavigate } from 'react-router-dom';         // React

// 3. Third-party imports
import { format } from 'date-fns';
import axios from 'axios';

// 4. Project imports (with @shared)
import type { User } from '@shared/entities/user';
import { useUserStore } from '@shared/entities/user';
import { MyWidget } from '@shared/widgets/my-widget';
import { myUtility } from '@shared/my-utility';

// 5. Local imports
import MySubComponent from './MySubComponent.vue';       // Vue
import MySubComponent from './MySubComponent';           // React (implicit .tsx)
```

## Comments & Documentation (Universal)

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

## Testing Standards (Universal)

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

## Performance Optimization (Universal)

### Debouncing & Throttling

```typescript
import { throttle } from '@shared/throttle';

// Debounce search input
const debouncedSearch = throttle(async (term: string) => {
  const results = await searchAPI(term);
}, 300);
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

## Error Handling (Universal)

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

## Code Review Checklist (Universal)

Before submitting code, verify:

- [ ] No `any` types
- [ ] TypeScript compiles: `yarn tsc --noEmit`
- [ ] No linting errors: `yarn lint`
- [ ] Components follow naming convention
- [ ] Comments explain WHY not WHAT
- [ ] Tests added for business logic
- [ ] Error handling implemented
- [ ] Proper imports organization
- [ ] Framework-specific checklist also completed (see framework-specific files)

---

## Framework-Specific Standards

For **Vue 3** specific standards, see: **[coding-standards-vue.md](coding-standards-vue.md)**

For **React** specific standards, see: **[coding-standards-react.md](coding-standards-react.md)**
