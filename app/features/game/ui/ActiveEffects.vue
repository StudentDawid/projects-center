<template>
  <div v-if="hasEffects" class="active-effects">
    <div class="effects-header">
      <v-icon icon="mdi-lightning-bolt" size="16" />
      Aktywne Efekty
    </div>
    <div class="effects-list">
      <TransitionGroup name="effect-list">
        <div
          v-for="effect in allEffects"
          :key="effect.id"
          class="effect-item"
          :class="`effect--${effect.type}`"
        >
          <v-icon :icon="effect.icon" size="18" />
          <div class="effect-info">
            <span class="effect-name">{{ effect.name }}</span>
            <div class="effect-timer">
              <v-progress-linear
                :model-value="(effect.remainingTime / effect.totalDuration) * 100"
                :color="effect.type === 'buff' ? 'success' : 'error'"
                height="3"
                rounded
              />
              <span class="timer-text">{{ formatTime(effect.remainingTime) }}</span>
            </div>
          </div>
          <v-tooltip :text="effect.description" location="top">
            <template #activator="{ props }">
              <v-icon v-bind="props" icon="mdi-information-outline" size="14" class="info-icon" />
            </template>
          </v-tooltip>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useEventStore } from '~/stores/solmar-sanctuary/events';

const eventStore = useEventStore();

const allEffects = computed(() => [
  ...eventStore.activeBuffs,
  ...eventStore.activeDebuffs,
]);

const hasEffects = computed(() => allEffects.value.length > 0);

function formatTime(seconds: number): string {
  if (seconds >= 60) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  return `${Math.floor(seconds)}s`;
}
</script>

<style scoped lang="scss">
.active-effects {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 8px 12px;
  margin-bottom: 12px;
}

.effects-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 8px;
}

.effects-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.effect-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  border-left: 3px solid;

  &.effect--buff {
    border-color: #4caf50;

    .v-icon:first-child {
      color: #81c784;
    }
  }

  &.effect--debuff {
    border-color: #f44336;

    .v-icon:first-child {
      color: #e57373;
    }
  }
}

.effect-info {
  flex: 1;
  min-width: 0;
}

.effect-name {
  display: block;
  font-size: 0.8rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.effect-timer {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;

  .v-progress-linear {
    flex: 1;
  }

  .timer-text {
    font-size: 0.65rem;
    font-family: monospace;
    color: rgba(255, 255, 255, 0.6);
    min-width: 28px;
    text-align: right;
  }
}

.info-icon {
  color: rgba(255, 255, 255, 0.4);
  cursor: help;

  &:hover {
    color: rgba(255, 255, 255, 0.7);
  }
}

// List transition
.effect-list-enter-active,
.effect-list-leave-active {
  transition: all 0.3s ease;
}

.effect-list-enter-from,
.effect-list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.effect-list-move {
  transition: transform 0.3s ease;
}
</style>

