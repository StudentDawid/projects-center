---
name: React Components Rule
description: Standardy dla komponentów React
globs: "**/*.tsx"
---
# 💻 Coding Standards - React

React specific coding standards and best practices (preparing for future React development).

## React Component Standards

### Functional Components (REQUIRED)

Always use functional components with hooks:

```typescript
import React, { useState, useCallback } from 'react';

interface Props {
  value: string;
  placeholder?: string;
  onChange?: (value: string) => void;
}

export const MyInput: React.FC<Props> = ({ 
  value, 
  placeholder = 'Enter text...', 
  onChange 
}) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  }, [onChange]);

  return (
    <input 
      value={value} 
      placeholder={placeholder}
      onChange={handleChange}
    />
  );
};
```

### Component Organization

Organize component logic in this order:

1. **Imports** - React, third-party, then project imports
2. **Types/Interfaces** - Define types before component
3. **Component Definition** - Main component function
4. **State** - useState hooks
5. **Effects** - useEffect hooks
6. **Callbacks** - useCallback memoized functions
7. **Render Logic** - JSX return

```typescript
import React, { useState, useEffect, useCallback } from 'react';
import type { MyProps } from './types';

// Types
interface MyProps {
  initialValue: string;
  onSave?: (value: string) => void;
}

// Component
export const MyComponent: React.FC<MyProps> = ({ initialValue, onSave }) => {
  // State
  const [value, setValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);

  // Effects
  useEffect(() => {
    console.log('Component mounted');
    return () => {
      console.log('Component unmounted');
    };
  }, []);

  // Callbacks
  const handleSave = useCallback(async () => {
    setIsLoading(true);
    try {
      await onSave?.(value);
    } finally {
      setIsLoading(false);
    }
  }, [value, onSave]);

  // Render
  return (
    <div className="my-component">
      <input value={value} onChange={(e) => setValue(e.target.value)} />
      <button onClick={handleSave} disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
};
```

## React Hooks Standards

### State Management

```typescript
// ✅ CORRECT - useState for local state
const [count, setCount] = useState(0);
const [items, setItems] = useState<string[]>([]);

// ✅ CORRECT - Multiple related state
const [formState, setFormState] = useState({
  name: '',
  email: '',
  isValid: false,
});

// ❌ WRONG - Too many separate states
const [name, setName] = useState('');
const [email, setEmail] = useState('');
const [phone, setPhone] = useState('');
const [address, setAddress] = useState('');
```

### useEffect Rules

```typescript
// ✅ CORRECT - With dependency array
useEffect(() => {
  // Runs once on mount
}, []);

useEffect(() => {
  // Runs when dep changes
}, [dependency]);

useEffect(() => {
  // Cleanup function
  return () => {
    // Cleanup code
  };
}, []);

// ❌ WRONG - No dependency array (runs on every render)
useEffect(() => {
  console.log('This runs too often!');
});
```

### Custom Hooks

```typescript
// ✅ Create custom hooks to extract logic
function useMyFeature(initialValue: string) {
  const [state, setState] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);

  const updateState = useCallback(async (newValue: string) => {
    setIsLoading(true);
    try {
      // Async operation
      setState(newValue);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { state, isLoading, updateState };
}

// Usage in component
const { state, isLoading, updateState } = useMyFeature('initial');
```

### useCallback Memoization

```typescript
// ✅ Memoize callbacks passed to children
const handleClick = useCallback((id: string) => {
  console.log('Clicked:', id);
}, []); // No dependencies

// ✅ With dependencies
const handleSave = useCallback(async () => {
  await api.save(formData);
}, [formData]); // Recreated when formData changes
```

### useMemo Optimization

```typescript
// ✅ Memoize expensive computations
const expensiveValue = useMemo(() => {
  return items.filter(item => item.active).sort((a, b) => a.name.localeCompare(b.name));
}, [items]);

// ❌ Don't over-use - simple operations don't need useMemo
const doubled = useMemo(() => value * 2, [value]); // ❌ Bad - too simple
```

## JSX Standards

### Props & Children

```typescript
// ✅ CORRECT - Typed props
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
}

export const Button: React.FC<React.PropsWithChildren<ButtonProps>> = ({
  variant = 'primary',
  size = 'medium',
  children,
  ...htmlProps
}) => {
  return (
    <button className={`btn btn--${variant} btn--${size}`} {...htmlProps}>
      {children}
    </button>
  );
};

// Usage
<Button variant="primary" size="large">Click me</Button>
```

### Conditional Rendering

```typescript
// ✅ CORRECT - Short-circuit evaluation
{isLoading && <Spinner />}
{error && <ErrorMessage error={error} />}

// ✅ CORRECT - Ternary for if-else
{isLoading ? <Spinner /> : <Content />}

// ✅ CORRECT - Early return (at component level)
if (isLoading) return <Spinner />;
if (error) return <ErrorMessage />;
return <Content />;

// ❌ WRONG - Nested ternaries (hard to read)
{isLoading ? <Spinner /> : error ? <ErrorMessage /> : <Content />}
```

## CSS-in-JS Standards (React)

React projects should choose one CSS approach:

### Option 1: Tailwind CSS (Recommended)

```typescript
export const MyComponent = () => {
  return (
    <div className="flex gap-4 p-4 bg-white rounded-lg shadow">
      <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Click
      </button>
    </div>
  );
};
```

### Option 2: CSS Modules

```typescript
import styles from './MyComponent.module.css';

export const MyComponent = () => {
  return (
    <div className={styles.container}>
      <button className={styles.button}>Click</button>
    </div>
  );
};
```

```css
/* MyComponent.module.css */
.container {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.button {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
}

.button:hover {
  background: #2563eb;
}
```

### Option 3: Styled Components

```typescript
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const StyledButton = styled.button`
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;

  &:hover {
    background: #2563eb;
  }
`;

export const MyComponent = () => {
  return (
    <Container>
      <StyledButton>Click</StyledButton>
    </Container>
  );
};
```

## React-Specific Code Review Checklist

Before submitting React code, additionally verify:

- [ ] Uses functional components with hooks
- [ ] Props are properly typed
- [ ] useState has correct initial values
- [ ] useEffect has proper dependency arrays
- [ ] useCallback used for callbacks passed to children
- [ ] No unnecessary useMemo (only for expensive computations)
- [ ] Conditional rendering is clear and readable
- [ ] JSX is properly formatted
- [ ] CSS approach chosen (Tailwind/CSS Modules/Styled Components)
- [ ] No inline object/array literals in props (creates new reference)
- [ ] Performance optimized (memoization, lazy loading)
- [ ] Accessibility considered (aria attributes, labels)

---

## General Standards

For universal standards applicable to all frameworks, see: **[../general-rules/coding-standards-general.md](../general-rules/coding-standards-general.md)**
