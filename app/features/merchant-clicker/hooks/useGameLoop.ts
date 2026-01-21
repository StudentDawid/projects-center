import { onMounted, onUnmounted } from 'vue';
import { useMerchantStore } from '~/entities/merchant';

export function useGameLoop() {
  const store = useMerchantStore();

  let tickInterval: ReturnType<typeof setInterval> | null = null;

  onMounted(() => {
    store.syncContent();
    tickInterval = setInterval(() => {
      store.tick(100); // 100ms ticks
    }, 100);
  });

  onUnmounted(() => {
    if (tickInterval) clearInterval(tickInterval);
  });
}

