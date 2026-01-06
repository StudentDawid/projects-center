<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="fade">
      <div
        v-if="showModal"
        class="event-backdrop"
        @click="handleBackdropClick"
      />
    </Transition>

    <!-- Modal -->
    <Transition name="slide-up">
      <div
        v-if="showModal && pendingEvent"
        class="event-modal"
        :class="`event-modal--${pendingEvent.event.type}`"
      >
        <!-- Header -->
        <div class="event-header">
          <div class="event-icon-wrapper" :class="`event-icon--${pendingEvent.event.type}`">
            <v-icon :icon="pendingEvent.event.icon" size="48" />
          </div>
          <div class="event-rarity" :class="`rarity--${pendingEvent.event.rarity}`">
            {{ rarityLabel }}
          </div>
        </div>

        <!-- Content -->
        <div class="event-content">
          <h2 class="event-title">{{ pendingEvent.event.name }}</h2>
          <p class="event-description">{{ pendingEvent.event.description }}</p>

          <!-- Timer for choice events -->
          <div v-if="pendingEvent.event.type === 'choice'" class="event-timer">
            <v-progress-linear
              :model-value="timerPercent"
              :color="timerPercent > 30 ? 'warning' : 'error'"
              height="6"
              rounded
            />
            <span class="timer-text">{{ timeRemaining }}s</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="event-actions">
          <!-- Choice event buttons -->
          <template v-if="pendingEvent.event.type === 'choice' && pendingEvent.event.choices">
            <button
              v-for="choice in pendingEvent.event.choices"
              :key="choice.id"
              class="choice-button"
              @click="handleChoice(choice.id)"
            >
              <v-icon v-if="choice.icon" :icon="choice.icon" size="20" class="mr-2" />
              <div class="choice-content">
                <span class="choice-label">{{ choice.label }}</span>
                <span class="choice-description">{{ choice.description }}</span>
              </div>
            </button>
          </template>

          <!-- Non-choice event button -->
          <template v-else>
            <button class="accept-button" @click="handleAccept">
              <v-icon icon="mdi-check" size="20" class="mr-2" />
              Rozumiem
            </button>
          </template>
        </div>

        <!-- Type indicator -->
        <div class="event-type-indicator" :class="`indicator--${pendingEvent.event.type}`">
          <v-icon :icon="typeIcon" size="16" />
          {{ typeLabel }}
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch, onUnmounted } from 'vue';
import { useEventStore } from '~/stores/events';

const eventStore = useEventStore();

const showModal = computed(() => eventStore.hasPendingEvent);
const pendingEvent = computed(() => eventStore.pendingEvent);

const timeRemaining = ref(30);
let timerInterval: ReturnType<typeof setInterval> | null = null;

const timerPercent = computed(() => {
  if (!pendingEvent.value) return 100;
  const total = pendingEvent.value.event.type === 'choice' ? 30 : 10;
  return (timeRemaining.value / total) * 100;
});

const rarityLabel = computed(() => {
  if (!pendingEvent.value) return '';
  switch (pendingEvent.value.event.rarity) {
    case 'common': return 'Pospolite';
    case 'uncommon': return 'Rzadkie';
    case 'rare': return 'Epicki';
    case 'legendary': return 'Legendarny';
    default: return '';
  }
});

const typeIcon = computed(() => {
  if (!pendingEvent.value) return '';
  switch (pendingEvent.value.event.type) {
    case 'positive': return 'mdi-star';
    case 'negative': return 'mdi-alert';
    case 'choice': return 'mdi-help-circle';
    default: return '';
  }
});

const typeLabel = computed(() => {
  if (!pendingEvent.value) return '';
  switch (pendingEvent.value.event.type) {
    case 'positive': return 'Pozytywne';
    case 'negative': return 'Negatywne';
    case 'choice': return 'Wybór';
    default: return '';
  }
});

// Update timer
watch(showModal, (show) => {
  if (show && pendingEvent.value) {
    const expiresAt = pendingEvent.value.expiresAt;
    timeRemaining.value = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));

    timerInterval = setInterval(() => {
      if (pendingEvent.value) {
        timeRemaining.value = Math.max(0, Math.ceil((pendingEvent.value.expiresAt - Date.now()) / 1000));
      }
    }, 100);
  } else {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }
});

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
});

function handleChoice(choiceId: string) {
  eventStore.makeChoice(choiceId);
}

function handleAccept() {
  eventStore.handleEvent();
}

function handleBackdropClick() {
  // Only dismiss on backdrop click for non-choice events
  if (pendingEvent.value?.event.type !== 'choice') {
    eventStore.handleEvent();
  }
}
</script>

<style scoped lang="scss">
.event-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 1000;
}

.event-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 480px;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border-radius: 16px;
  padding: 0;
  z-index: 1001;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);

  &--positive {
    border: 2px solid rgba(76, 175, 80, 0.5);

    .event-header {
      background: linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(139, 195, 74, 0.1));
    }
  }

  &--negative {
    border: 2px solid rgba(244, 67, 54, 0.5);

    .event-header {
      background: linear-gradient(135deg, rgba(244, 67, 54, 0.2), rgba(255, 87, 34, 0.1));
    }
  }

  &--choice {
    border: 2px solid rgba(255, 193, 7, 0.5);

    .event-header {
      background: linear-gradient(135deg, rgba(255, 193, 7, 0.2), rgba(255, 152, 0, 0.1));
    }
  }
}

.event-header {
  padding: 24px;
  text-align: center;
  position: relative;
}

.event-icon-wrapper {
  width: 80px;
  height: 80px;
  margin: 0 auto;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 2s ease-in-out infinite;

  &.event-icon--positive {
    background: linear-gradient(135deg, #4caf50, #8bc34a);
    color: white;
  }

  &.event-icon--negative {
    background: linear-gradient(135deg, #f44336, #ff5722);
    color: white;
  }

  &.event-icon--choice {
    background: linear-gradient(135deg, #ffc107, #ff9800);
    color: #1a1a1a;
  }
}

.event-rarity {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  &.rarity--common {
    background: rgba(158, 158, 158, 0.3);
    color: #9e9e9e;
  }

  &.rarity--uncommon {
    background: rgba(33, 150, 243, 0.3);
    color: #64b5f6;
  }

  &.rarity--rare {
    background: rgba(156, 39, 176, 0.3);
    color: #ce93d8;
  }

  &.rarity--legendary {
    background: rgba(255, 193, 7, 0.3);
    color: #ffd54f;
    animation: glow 2s ease-in-out infinite;
  }
}

.event-content {
  padding: 0 24px 16px;
  text-align: center;
}

.event-title {
  font-family: var(--font-lore-solmar, 'Cinzel', serif);
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 12px;
  color: #fff;
}

.event-description {
  font-size: 0.95rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 16px;
}

.event-timer {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  margin-top: 12px;

  .v-progress-linear {
    flex: 1;
  }

  .timer-text {
    font-family: var(--font-body-solmar, monospace);
    font-weight: 700;
    font-size: 1rem;
    min-width: 30px;
  }
}

.event-actions {
  padding: 16px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.choice-button {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  color: #fff;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 193, 7, 0.5);
    transform: translateX(4px);
  }

  .choice-content {
    display: flex;
    flex-direction: column;
  }

  .choice-label {
    font-weight: 600;
    font-size: 0.95rem;
  }

  .choice-description {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.6);
    margin-top: 2px;
  }
}

.accept-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px 24px;
  background: linear-gradient(135deg, #4caf50, #8bc34a);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: white;
  font-weight: 600;
  font-size: 1rem;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 16px rgba(76, 175, 80, 0.4);
  }
}

.event-type-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;

  &.indicator--positive {
    background: rgba(76, 175, 80, 0.2);
    color: #81c784;
  }

  &.indicator--negative {
    background: rgba(244, 67, 54, 0.2);
    color: #e57373;
  }

  &.indicator--choice {
    background: rgba(255, 193, 7, 0.2);
    color: #ffd54f;
  }
}

// Animations
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes glow {
  0%, 100% { box-shadow: 0 0 4px rgba(255, 193, 7, 0.4); }
  50% { box-shadow: 0 0 12px rgba(255, 193, 7, 0.8); }
}

// Transitions
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translate(-50%, -40%);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translate(-50%, -60%);
}
</style>

