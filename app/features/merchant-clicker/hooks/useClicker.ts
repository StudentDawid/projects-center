import { ref } from 'vue';
import { useMerchantStore } from '~/entities/merchant';
import type { FloatingItem } from '../ui/FloatingText.vue';

export function useClicker() {
  const store = useMerchantStore();
  const floatingTexts = ref<FloatingItem[]>([]);

  const handleTrade = (e: { x: number; y: number }) => {
    store.clickResource();

    const id = crypto.randomUUID();
    // Get formatted amount nicely for float text
    const amount = store.formatNumber(store.currentClickPower);

    floatingTexts.value.push({
      id,
      x: e.x,
      y: e.y,
      text: amount,
    });

    // Cleanup after animation (1.2s)
    setTimeout(() => {
      floatingTexts.value = floatingTexts.value.filter((item) => item.id !== id);
    }, 1200);
  };

  return {
    floatingTexts,
    handleTrade,
  };
}

