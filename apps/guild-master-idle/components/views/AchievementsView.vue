<template>
  <div class="production-inner">
    <h2 class="production-title">{{ t('achievements.title') }}</h2>
    <p class="view-subtitle">{{ t('achievements.subtitle') }}</p>
    <p class="achievement-progress-text">
      {{ t('achievements.progress', { current: game.completedAchievements, total: game.totalAchievements }) }}
    </p>

    <v-progress-linear
      :model-value="(game.completedAchievements / game.totalAchievements) * 100"
      color="amber-darken-1" height="8" rounded bg-color="grey-lighten-3" class="mb-6"
    />

    <!-- Completed achievements -->
    <div v-if="completedAchievements.length > 0" class="section-block">
      <h3 class="section-label">{{ t('achievements.completed') }}</h3>
      <div class="achievements-grid">
        <div
          v-for="ach in completedAchievements"
          :key="ach.id"
          class="achievement-card achievement-done"
        >
          <div class="achievement-icon">{{ ach.icon }}</div>
          <div class="achievement-info">
            <span class="achievement-name">{{ t(ach.nameKey) }}</span>
            <span class="achievement-desc">{{ t(ach.descKey) }}</span>
            <span class="achievement-reward-line">
              <v-icon size="12" color="amber-darken-1" class="mr-1">mdi-gift</v-icon>
              {{ t(ach.rewardKey) }}
            </span>
          </div>
          <v-icon size="20" color="green-darken-1" class="achievement-check">mdi-check-circle</v-icon>
        </div>
      </div>
    </div>

    <!-- Locked achievements -->
    <div class="section-block">
      <h3 class="section-label">{{ t('achievements.locked') }}</h3>
      <div class="achievements-grid">
        <div
          v-for="ach in lockedAchievements"
          :key="ach.id"
          class="achievement-card achievement-locked"
        >
          <div class="achievement-icon achievement-icon-locked">{{ ach.icon }}</div>
          <div class="achievement-info">
            <span class="achievement-name">{{ t(ach.nameKey) }}</span>
            <span class="achievement-desc">{{ t(ach.descKey) }}</span>
            <span class="achievement-reward-line achievement-reward-locked">
              <v-icon size="12" color="grey" class="mr-1">mdi-gift</v-icon>
              {{ t(ach.rewardKey) }}
            </span>
          </div>
          <v-icon size="20" color="grey-lighten-1">mdi-lock</v-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from '~/composables/useI18n';
import { useGameStore } from '~/stores/useGameStore';

const { t } = useI18n();
const game = useGameStore();

const completedAchievements = computed(() => game.achievements.filter((a) => a.completed));
const lockedAchievements = computed(() => game.achievements.filter((a) => !a.completed));
</script>

<style lang="scss" scoped>
$transition-theme: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;

.production-inner { max-width: 768px; margin: 0 auto; }
.production-title {
  font-size: 24px; font-weight: 300; color: var(--text-heading);
  margin-bottom: 32px; padding-bottom: 16px; border-bottom: 1px solid var(--border-light);
}
.view-subtitle { font-size: 14px; color: var(--text-muted); margin: -24px 0 32px; }
.section-block { margin-bottom: 40px; }
.section-label {
  font-size: 12px; font-weight: 700; color: var(--text-faint);
  text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px;
}

.achievement-progress-text {
  font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 8px; font-weight: 600;
}
.achievements-grid { display: flex; flex-direction: column; gap: 8px; }
.achievement-card {
  display: flex; align-items: center; gap: 12px; padding: 12px 14px;
  border-radius: 10px; border: 1px solid var(--border-primary);
  background: var(--bg-card); transition: $transition-theme;
}
.achievement-done { border-color: rgba(76, 175, 80, 0.3); background: rgba(76, 175, 80, 0.05); }
.achievement-locked { opacity: 0.6; }
.achievement-icon { font-size: 1.6rem; width: 36px; text-align: center; flex-shrink: 0; }
.achievement-icon-locked { filter: grayscale(1); opacity: 0.5; }
.achievement-info { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.achievement-name { font-weight: 700; font-size: 0.9rem; color: var(--text-heading); }
.achievement-desc { font-size: 0.8rem; color: var(--text-secondary); }
.achievement-check { flex-shrink: 0; }
.achievement-reward-line {
  display: flex; align-items: center; font-size: 0.75rem;
  font-weight: 600; color: var(--text-accent, #d97706); margin-top: 2px;
}
.achievement-reward-locked { color: var(--text-secondary); opacity: 0.7; }
</style>
