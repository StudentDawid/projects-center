<template>
  <div class="prayer-section">
    <v-btn
      class="prayer-button click-ripple"
      size="x-large"
      color="primary"
      @click="handlePray"
    >
      <div class="prayer-content">
        <v-icon icon="mdi-hands-pray" size="48" class="prayer-icon" />
        <div class="prayer-text">
          <span class="prayer-label">MÓDL SIĘ</span>
          <span class="prayer-value">+{{ faithGainDisplay }} Wiary</span>
        </div>
      </div>
    </v-btn>

    <!-- Click feedback animations -->
    <TransitionGroup name="faith-popup">
      <div
        v-for="popup in popups"
        :key="popup.id"
        class="faith-popup"
        :style="{ left: popup.x + 'px', top: popup.y + 'px' }"
      >
        +{{ popup.value }}
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useResourceStore } from '~/stores/solmar-sanctuary/resources';
import { useAchievementStore } from '~/stores/solmar-sanctuary/achievements';
import { formatNumber } from '~/shared/lib/big-number';

interface FaithPopup {
  id: number;
  value: string;
  x: number;
  y: number;
}

const resourceStore = useResourceStore();
const achievementStore = useAchievementStore();

const popups = ref<FaithPopup[]>([]);
let popupId = 0;

// Use totalClickValue which includes all bonuses (buildings, prestige, relics, events)
const faithGainDisplay = computed(() => resourceStore.formattedClickValue);

function handlePray(event: MouseEvent) {
  const gain = resourceStore.pray();

  // Register click for achievements
  achievementStore.registerClick();

  // Create popup animation
  const rect = (event.target as HTMLElement).getBoundingClientRect();
  const popup: FaithPopup = {
    id: popupId++,
    value: formatNumber(gain),
    x: event.clientX - rect.left + (Math.random() - 0.5) * 40,
    y: event.clientY - rect.top - 20,
  };

  popups.value.push(popup);

  // Remove popup after animation
  setTimeout(() => {
    popups.value = popups.value.filter((p) => p.id !== popup.id);
  }, 1000);
}
</script>

<style scoped lang="scss">
.prayer-section {
  position: relative;
  display: flex;
  justify-content: center;
  padding: 2rem 0;
}

.prayer-button {
  width: 200px;
  height: 200px;
  border-radius: 50% !important;
  border: 3px solid rgba(var(--v-theme-primary), 0.6) !important;
  box-shadow:
    0 0 30px rgba(var(--v-theme-primary), 0.3),
    inset 0 0 20px rgba(0, 0, 0, 0.3) !important;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow:
      0 0 50px rgba(var(--v-theme-primary), 0.5),
      inset 0 0 30px rgba(0, 0, 0, 0.2) !important;
  }

  &:active {
    transform: scale(0.95);
  }
}

.prayer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.prayer-icon {
  filter: drop-shadow(0 0 8px currentColor);
  animation: prayer-glow 2s ease-in-out infinite;
}

@keyframes prayer-glow {
  0%,
  100% {
    filter: drop-shadow(0 0 8px currentColor);
  }
  50% {
    filter: drop-shadow(0 0 16px currentColor);
  }
}

.prayer-text {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.prayer-label {
  font-family: var(--font-header-solmar);
  font-size: 1.25rem;
  letter-spacing: 0.1em;
}

.prayer-value {
  font-family: var(--font-body-solmar);
  font-size: 0.875rem;
  opacity: 0.8;
}

// Faith popup animation
.faith-popup {
  position: absolute;
  font-family: var(--font-body-solmar);
  font-size: 1.25rem;
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
  text-shadow:
    0 0 8px rgb(var(--v-theme-primary)),
    2px 2px 4px rgba(0, 0, 0, 0.8);
  pointer-events: none;
  z-index: 100;
}

.faith-popup-enter-active {
  animation: faith-rise 1s ease-out forwards;
}

.faith-popup-leave-active {
  animation: faith-fade 0.3s ease-out forwards;
}

@keyframes faith-rise {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-60px) scale(1.2);
  }
}

@keyframes faith-fade {
  to {
    opacity: 0;
  }
}
</style>

