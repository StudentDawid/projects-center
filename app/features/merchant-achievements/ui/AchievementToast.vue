<template>
  <transition name="toast">
    <v-snackbar
      v-model="isVisible"
      :timeout="5000"
      location="top"
      color="amber-darken-3"
      class="achievement-toast"
    >
      <div class="d-flex align-center gap-3">
        <v-icon size="32" color="amber-lighten-2">mdi-trophy</v-icon>
        <div class="flex-grow-1">
          <div class="text-h6 font-weight-bold text-white">
            Osiągnięcie odblokowane!
          </div>
          <div class="text-subtitle-1 text-amber-lighten-4">
            {{ achievement?.name }}
          </div>
          <div
            v-if="achievement?.reward"
            class="text-caption text-green-lighten-2 mt-1"
          >
            <v-icon size="small">mdi-gift</v-icon>
            {{ achievement.reward.description }}
          </div>
        </div>
        <v-btn icon variant="text" @click="isVisible = false">
          <v-icon color="white">mdi-close</v-icon>
        </v-btn>
      </div>
    </v-snackbar>
  </transition>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useAchievementStore } from '~/entities/merchant-achievements';
import type { Achievement } from '~/entities/merchant-achievements';

const achievementStore = useAchievementStore();
const isVisible = ref(false);
const achievement = ref<Achievement | null>(null);

function showToast(achievementData: Achievement) {
  achievement.value = achievementData;
  isVisible.value = true;
  
  // Mark as seen
  achievementStore.markAsSeen(achievementData.id);
}

// Check for new achievements periodically
onMounted(() => {
  const checkInterval = setInterval(() => {
    const nextToast = achievementStore.popToast();
    if (nextToast) {
      showToast(nextToast);
    }
  }, 500);

  // Cleanup on unmount
  return () => clearInterval(checkInterval);
});
</script>

<style scoped>
.achievement-toast :deep(.v-snackbar__wrapper) {
  background: linear-gradient(135deg, rgba(255, 179, 0, 0.95) 0%, rgba(255, 152, 0, 0.95) 100%);
  box-shadow: 0 4px 20px rgba(255, 179, 0, 0.4);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-100px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-100px);
}
</style>
