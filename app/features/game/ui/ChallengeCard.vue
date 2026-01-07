<template>
  <div
    class="challenge-card"
    :class="{
      'challenge-card--completed': progress?.completed,
      'challenge-card--daily': challenge.type === 'daily',
      'challenge-card--weekly': challenge.type === 'weekly',
    }"
  >
    <div class="challenge-icon">
      <v-icon :icon="challenge.icon" :color="iconColor" size="28" />
      <v-icon
        v-if="progress?.completed"
        icon="mdi-check-circle"
        color="success"
        size="16"
        class="completed-badge"
      />
    </div>

    <div class="challenge-content">
      <div class="challenge-header">
        <h4 class="challenge-name">{{ challenge.name }}</h4>
        <v-chip
          size="x-small"
          :color="challenge.type === 'daily' ? 'primary' : 'purple'"
          label
        >
          {{ challenge.type === 'daily' ? 'Dzienne' : 'Tygodniowe' }}
        </v-chip>
      </div>

      <p class="challenge-description">{{ challenge.description }}</p>

      <div class="challenge-progress">
        <v-progress-linear
          :model-value="progressPercent"
          :color="progress?.completed ? 'success' : progressColor"
          height="6"
          rounded
          class="mb-1"
        />
        <div class="progress-text">
          <span :class="{ 'text-success': progress?.completed }">
            {{ progress?.current || 0 }} / {{ challenge.target }}
          </span>
          <span v-if="progress?.completed" class="completed-text">
            ✓ Ukończone
          </span>
        </div>
      </div>

      <div class="challenge-reward">
        <v-icon icon="mdi-gift" size="14" class="mr-1" />
        <span>{{ challenge.reward.description }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ChallengeDefinition, ChallengeProgress } from '~/stores/solmar-sanctuary/challenges';

interface Props {
  challenge: ChallengeDefinition;
  progress?: ChallengeProgress;
}

const props = defineProps<Props>();

const progressPercent = computed(() => {
  if (!props.progress) return 0;
  return Math.min((props.progress.current / props.challenge.target) * 100, 100);
});

const progressColor = computed(() => {
  if (progressPercent.value >= 75) return 'warning';
  if (progressPercent.value >= 50) return 'info';
  return 'primary';
});

const iconColor = computed(() => {
  if (props.progress?.completed) return 'success';
  if (props.challenge.type === 'weekly') return 'purple';
  return 'primary';
});
</script>

<style scoped lang="scss">
.challenge-card {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  &--completed {
    background: rgba(76, 175, 80, 0.1);
    border-color: rgba(76, 175, 80, 0.3);
  }

  &--daily {
    border-left: 3px solid rgba(var(--v-theme-primary), 0.5);
  }

  &--weekly {
    border-left: 3px solid rgba(156, 39, 176, 0.5);
  }
}

.challenge-icon {
  position: relative;
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.completed-badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  background: rgba(30, 30, 30, 1);
  border-radius: 50%;
}

.challenge-content {
  flex: 1;
  min-width: 0;
}

.challenge-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.challenge-name {
  font-family: var(--font-lore-solmar);
  font-size: 0.95rem;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.challenge-description {
  font-family: var(--font-body-solmar);
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 8px 0;
}

.challenge-progress {
  margin-bottom: 8px;
}

.progress-text {
  display: flex;
  justify-content: space-between;
  font-family: var(--font-body-solmar);
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.5);
}

.completed-text {
  color: rgb(var(--v-theme-success));
  font-weight: 600;
}

.challenge-reward {
  display: flex;
  align-items: center;
  font-family: var(--font-body-solmar);
  font-size: 0.75rem;
  color: rgba(255, 193, 7, 0.9);
  padding: 4px 8px;
  background: rgba(255, 193, 7, 0.1);
  border-radius: 4px;
  width: fit-content;
}
</style>

