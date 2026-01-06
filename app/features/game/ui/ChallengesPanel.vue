<template>
  <v-dialog v-model="modelValue" max-width="700" scrollable>
    <v-card class="challenges-panel">
      <v-card-title class="d-flex align-center justify-space-between pa-4">
        <div class="d-flex align-center gap-2">
          <v-icon icon="mdi-trophy-outline" color="warning" size="28" />
          <span class="panel-title">Wyzwania</span>
        </div>
        <v-btn icon variant="text" @click="close">
          <v-icon icon="mdi-close" />
        </v-btn>
      </v-card-title>

      <v-divider />

      <!-- Streak Banner -->
      <div v-if="challengeStore.dailyStreak > 0" class="streak-banner pa-3">
        <v-icon icon="mdi-fire" color="orange" class="mr-2" />
        <span class="streak-text">
          Seria: <strong>{{ challengeStore.dailyStreak }}</strong> dni
          <span class="streak-bonus">(+{{ challengeStore.streakBonus }}% do nagród)</span>
        </span>
      </div>

      <v-card-text class="pa-4">
        <!-- Daily Challenges -->
        <div class="challenges-section mb-6">
          <div class="section-header d-flex align-center justify-space-between mb-3">
            <div class="d-flex align-center gap-2">
              <v-icon icon="mdi-calendar-today" color="primary" />
              <h3 class="section-title">Wyzwania Dzienne</h3>
              <v-chip size="small" :color="challengeStore.allDailyCompleted ? 'success' : 'default'">
                {{ challengeStore.completedDailyCount }}/{{ challengeStore.dailyChallenges.length }}
              </v-chip>
            </div>
            <div class="reset-timer">
              <v-icon icon="mdi-clock-outline" size="14" class="mr-1" />
              Reset za: {{ formatTime(challengeStore.timeUntilDailyReset) }}
            </div>
          </div>

          <div class="challenges-grid">
            <ChallengeCard
              v-for="challenge in challengeStore.dailyChallenges"
              :key="challenge.id"
              :challenge="challenge"
              :progress="challengeStore.getProgress(challenge.id)"
            />
          </div>
        </div>

        <!-- Weekly Challenges -->
        <div class="challenges-section">
          <div class="section-header d-flex align-center justify-space-between mb-3">
            <div class="d-flex align-center gap-2">
              <v-icon icon="mdi-calendar-week" color="purple" />
              <h3 class="section-title">Wyzwania Tygodniowe</h3>
              <v-chip size="small" :color="challengeStore.allWeeklyCompleted ? 'success' : 'default'">
                {{ challengeStore.completedWeeklyCount }}/{{ challengeStore.weeklyChallenges.length }}
              </v-chip>
            </div>
            <div class="reset-timer">
              <v-icon icon="mdi-clock-outline" size="14" class="mr-1" />
              Reset za: {{ formatTime(challengeStore.timeUntilWeeklyReset) }}
            </div>
          </div>

          <div class="challenges-grid">
            <ChallengeCard
              v-for="challenge in challengeStore.weeklyChallenges"
              :key="challenge.id"
              :challenge="challenge"
              :progress="challengeStore.getProgress(challenge.id)"
            />
          </div>
        </div>

        <!-- Active Buffs -->
        <div v-if="challengeStore.activeBuffs.length > 0" class="active-buffs-section mt-6">
          <div class="section-header d-flex align-center gap-2 mb-3">
            <v-icon icon="mdi-lightning-bolt" color="warning" />
            <h3 class="section-title">Aktywne Bonusy</h3>
          </div>
          <div class="buffs-list">
            <div
              v-for="(buff, index) in challengeStore.activeBuffs"
              :key="index"
              class="buff-item"
            >
              <v-icon icon="mdi-arrow-up-bold" color="success" size="16" class="mr-2" />
              <span>{{ buff.description }}</span>
              <span class="buff-timer ml-2">
                ({{ formatBuffTime(buff.expiresAt - Date.now()) }})
              </span>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useChallengeStore } from '~/stores/challenges';
import ChallengeCard from './ChallengeCard.vue';

interface Props {
  modelValue: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const challengeStore = useChallengeStore();

const modelValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

function close() {
  modelValue.value = false;
}

function formatTime(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

function formatBuffTime(ms: number): string {
  if (ms <= 0) return 'wygasa...';
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
</script>

<style scoped lang="scss">
.challenges-panel {
  background: linear-gradient(180deg, rgba(30, 30, 30, 0.98), rgba(20, 20, 20, 0.99));
  border: 1px solid rgba(255, 193, 7, 0.3);
}

.panel-title {
  font-family: var(--font-header-solmar);
  font-size: 1.5rem;
  letter-spacing: 0.05em;
}

.streak-banner {
  background: linear-gradient(90deg, rgba(255, 152, 0, 0.2), rgba(255, 87, 34, 0.2));
  border-bottom: 1px solid rgba(255, 152, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.streak-text {
  font-family: var(--font-body-solmar);
  font-size: 0.95rem;

  .streak-bonus {
    color: rgba(255, 193, 7, 0.9);
    margin-left: 8px;
  }
}

.section-header {
  .section-title {
    font-family: var(--font-lore-solmar);
    font-size: 1.1rem;
    margin: 0;
  }
}

.reset-timer {
  font-family: var(--font-body-solmar);
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
}

.challenges-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.active-buffs-section {
  padding: 16px;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.buffs-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.buff-item {
  display: flex;
  align-items: center;
  font-family: var(--font-body-solmar);
  font-size: 0.875rem;

  .buff-timer {
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.75rem;
  }
}
</style>

