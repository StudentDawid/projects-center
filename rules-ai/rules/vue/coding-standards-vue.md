# 💻 Coding Standards - Vue 3

Vue 3 specific coding standards and best practices.

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

Organize component logic in this order:

1. **Imports** - Vue, third-party, then project imports
2. **Types/Interfaces** - Define types before usage
3. **Props** - Define and document props
4. **Emits** - Define emitted events
5. **Refs/State** - Reactive state
6. **Computed** - Computed properties
7. **Watchers** - Watch effects
8. **Methods** - Functions and handlers
9. **Lifecycle** - onMounted, onUnmounted, etc.
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

## Vue Lifecycle

```typescript
import { onMounted, onUnmounted, onUpdated } from 'vue';

export function useMyFeature() {
  // Initialize
  onMounted(() => {
    console.log('Component mounted');
    // Fetch data, setup listeners
  });

  // Cleanup
  onUnmounted(() => {
    console.log('Component unmounted');
    // Remove listeners, cancel requests
  });

  onUpdated(() => {
    console.log('Component updated');
  });

  return {};
}
```

## CSS/SCSS Standards (Vue)

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

## Performance Optimization (Vue)

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

### Debouncing in Vue

```typescript
import { watch } from 'vue';
import { throttle } from '@shared/throttle';

const searchTerm = ref('');
const debouncedSearch = throttle(async (term: string) => {
  const results = await searchAPI(term);
}, 300);

watch(searchTerm, debouncedSearch);
```

## Vue-Specific Code Review Checklist

Before submitting Vue code, additionally verify:

- [ ] Uses `<script setup lang="ts">`
- [ ] Props and emits are properly typed
- [ ] Complex logic extracted to composables
- [ ] Styles use `scoped lang="scss"`
- [ ] No reactive refs where computed should be used
- [ ] Proper lifecycle hooks used (onMounted, onUnmounted)
- [ ] v-if/v-show used appropriately
- [ ] Key binding on list elements (v-for)
- [ ] No direct DOM manipulation (use refs if necessary)
- [ ] Performance optimized (no N+1, proper memoization)
- [ ] Accessibility considered (a11y attributes)

---

## General Standards

For universal standards applicable to all frameworks, see: **[../general-rules/coding-standards-general.md](../general-rules/coding-standards-general.md)**
