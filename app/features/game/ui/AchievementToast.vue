<template>
  <Teleport to="body">
    <Transition name="toast">
      <div v-if="currentToast" class="achievement-toast" @click="dismissToast">
        <div class="toast-glow"></div>
        <div class="toast-content">
          <div class="toast-icon-wrapper">
            <v-icon :icon="currentToast.icon" class="toast-icon" />
          </div>
          <div class="toast-info">
            <span class="toast-label">🏆 Osiągnięcie odblokowane!</span>
            <span class="toast-name">{{ currentToast.name }}</span>
            <span class="toast-description">{{ currentToast.description }}</span>
            <span class="toast-reward" v-if="currentToast.reward">
              🎁 {{ currentToast.reward.description }}
            </span>
          </div>
        </div>
        <div class="toast-progress">
          <div class="toast-progress-bar" :style="{ width: progressPercent + '%' }"></div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useAchievementStore, type Achievement } from '~/stores/achievements';

const achievementStore = useAchievementStore();

const currentToast = ref<Achievement | null>(null);
const progressPercent = ref(100);
const toastDuration = 5000; // 5 seconds
let toastTimer: ReturnType<typeof setTimeout> | null = null;
let progressInterval: ReturnType<typeof setInterval> | null = null;

function showNextToast() {
  const next = achievementStore.popToast();
  if (next) {
    currentToast.value = next;
    progressPercent.value = 100;

    // Start progress bar
    const startTime = Date.now();
    progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      progressPercent.value = Math.max(0, 100 - (elapsed / toastDuration) * 100);
    }, 50);

    // Auto-dismiss after duration
    toastTimer = setTimeout(() => {
      dismissToast();
    }, toastDuration);
  }
}

function dismissToast() {
  if (toastTimer) {
    clearTimeout(toastTimer);
    toastTimer = null;
  }
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }

  currentToast.value = null;

  // Check for next toast after animation
  setTimeout(() => {
    showNextToast();
  }, 300);
}

// Watch for new toasts
watch(
  () => achievementStore.toastQueue.length,
  (newLength) => {
    if (newLength > 0 && !currentToast.value) {
      showNextToast();
    }
  }
);

onMounted(() => {
  // Check if there are pending toasts on mount
  if (achievementStore.toastQueue.length > 0) {
    showNextToast();
  }
});

onUnmounted(() => {
  if (toastTimer) clearTimeout(toastTimer);
  if (progressInterval) clearInterval(progressInterval);
});
</script>

<style scoped lang="scss">
.achievement-toast {
  position: fixed;
  top: 80px;
  right: 20px;
  width: 320px;
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  border: 2px solid #ffc107;
  border-radius: 12px;
  overflow: hidden;
  z-index: 9999;
  cursor: pointer;
  box-shadow:
    0 4px 20px rgba(255, 193, 7, 0.3),
    0 0 40px rgba(255, 193, 7, 0.1);

  &:hover {
    transform: scale(1.02);
  }

  .toast-glow {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      circle at center,
      rgba(255, 193, 7, 0.15),
      transparent 50%
    );
    animation: rotate-glow 4s linear infinite;
    pointer-events: none;
  }

  .toast-content {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    position: relative;
    z-index: 1;

    .toast-icon-wrapper {
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 193, 7, 0.2);
      border-radius: 50%;
      animation: icon-pulse 1s ease-in-out infinite;

      .toast-icon {
        font-size: 2rem;
        color: #ffc107;
      }
    }

    .toast-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.125rem;

      .toast-label {
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: #ffc107;
      }

      .toast-name {
        font-size: 1.1rem;
        font-weight: bold;
        color: white;
      }

      .toast-description {
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.7);
      }

      .toast-reward {
        font-size: 0.75rem;
        color: #4caf50;
        margin-top: 0.25rem;
      }
    }
  }

  .toast-progress {
    height: 4px;
    background: rgba(255, 255, 255, 0.1);

    .toast-progress-bar {
      height: 100%;
      background: linear-gradient(90deg, #ffc107, #ff9800);
      transition: width 0.05s linear;
    }
  }
}

// Transition animations
.toast-enter-active {
  animation: toast-in 0.4s ease-out;
}

.toast-leave-active {
  animation: toast-out 0.3s ease-in;
}

@keyframes toast-in {
  0% {
    opacity: 0;
    transform: translateX(100%) scale(0.8);
  }
  100% {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes toast-out {
  0% {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateX(100%) scale(0.8);
  }
}

@keyframes rotate-glow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes icon-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

// Mobile adjustments
@media (max-width: 480px) {
  .achievement-toast {
    top: auto;
    bottom: 20px;
    left: 10px;
    right: 10px;
    width: auto;
  }
}
</style>

