import { ref, computed, onMounted, onUnmounted } from 'vue';

export interface WindowSize {
  width: number;
  height: number;
}

/**
 * Composable for tracking window size
 */
export function useWindowSize() {
  const width = ref(typeof window !== 'undefined' ? window.innerWidth : 0);
  const height = ref(typeof window !== 'undefined' ? window.innerHeight : 0);

  function updateSize() {
    if (typeof window !== 'undefined') {
      width.value = window.innerWidth;
      height.value = window.innerHeight;
    }
  }

  // Initialize immediately (don't wait for onMounted)
  if (typeof window !== 'undefined') {
    updateSize();
  }

  onMounted(() => {
    if (typeof window !== 'undefined') {
      // Update again on mount to ensure correct values
      updateSize();
      window.addEventListener('resize', updateSize);
    }
  });

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', updateSize);
    }
  });

  return {
    width,
    height,
    size: computed(() => ({
      width: width.value,
      height: height.value,
    })),
  };
}

