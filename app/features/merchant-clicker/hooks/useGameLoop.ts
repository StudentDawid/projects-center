import { onMounted, onUnmounted } from 'vue';
import { useMerchantStore } from '~/entities/merchant';
import { useAchievementStore } from '~/entities/merchant-achievements';

export function useGameLoop() {
  const store = useMerchantStore();
  const achievementStore = useAchievementStore();

  let tickInterval: ReturnType<typeof setInterval> | null = null;
  let achievementCheckInterval: ReturnType<typeof setInterval> | null = null;

  onMounted(() => {
    store.syncContent();
    // Calculate offline progress when game starts
    store.calculateOfflineProgress();
    
    // Game tick
    tickInterval = setInterval(() => {
      store.tick(100); // 100ms ticks
    }, 100);

    // Check achievements every 2 seconds
    achievementCheckInterval = setInterval(() => {
      achievementStore.checkAchievements();
    }, 2000);
  });

  onUnmounted(() => {
    if (tickInterval) clearInterval(tickInterval);
    if (achievementCheckInterval) clearInterval(achievementCheckInterval);
  });
}

