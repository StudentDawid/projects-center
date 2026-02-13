<template>
  <div class="production-inner">
    <h2 class="production-title">{{ t('production.title') }}</h2>

    <!-- Recruitment Section -->
    <div class="section-block">
      <h3 class="section-label">{{ t('production.recruitment') }}</h3>

      <div class="recruit-box">
        <v-btn
          color="blue-darken-1"
          block
          size="x-large"
          class="recruit-btn text-none justify-space-between"
          variant="flat"
        >
          <span class="text-h6 font-weight-medium">{{ t('production.recruitNovices') }} ({{ units.novices }})</span>
          <span class="text-h5 font-weight-light">&#x2335;</span>
        </v-btn>
        <div class="recruit-description">
          {{ t('production.recruitDescription') }}
          <br />
          <span class="text-blue-darken-1 font-weight-bold" style="font-style: normal">
            {{ t('production.currentBonus') }}
          </span>
        </div>
      </div>

      <div class="action-card">
        <div>
          <div class="action-title">{{ t('production.trainGuards') }}</div>
          <div class="action-cost">{{ t('production.costGoldWood') }}</div>
        </div>
        <v-btn
          variant="outlined"
          color="blue-darken-1"
          size="small"
          class="action-btn text-none font-weight-bold"
        >
          {{ t('production.train') }} ({{ units.guards }})
        </v-btn>
      </div>
    </div>

    <!-- Infrastructure Section -->
    <div class="section-block">
      <h3 class="section-label">{{ t('production.infrastructure') }}</h3>

      <div class="action-card">
        <div>
          <div class="action-title">{{ t('production.expandDormitories') }} (Lvl {{ buildings.dormLevel }})</div>
          <div class="action-cost mb-1">{{ t('production.dormitoriesDescription') }}</div>
          <div class="action-resources">
            <span class="text-red">{{ t('resources.stone') }}: {{ resources.stone }} / 1200</span>
            <span class="text-green-darken-2">{{ t('resources.wood') }}: {{ formatNumber(resources.wood) }} / 800</span>
          </div>
        </div>
        <v-btn
          variant="flat"
          color="grey-lighten-2"
          size="small"
          class="action-btn text-none font-weight-bold"
          disabled
        >
          {{ t('production.upgrade') }}
        </v-btn>
      </div>

      <div class="action-card">
        <div>
          <div class="action-title">{{ t('production.arcaneLibrary') }}</div>
          <div class="action-cost mb-1">{{ t('production.arcaneLibraryDescription') }}</div>
          <div class="action-resources">
            <span class="text-green-darken-2">{{ t('resources.gold') }}: 1.2K / 500</span>
            <span class="text-red">{{ t('resources.mana') }}: {{ resources.mana }} / 2000</span>
          </div>
        </div>
        <v-btn
          variant="flat"
          color="blue-darken-1"
          size="small"
          class="action-btn text-none font-weight-bold"
        >
          {{ t('production.build') }}
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from '~/composables/useI18n';
import { useGameStore } from '~/stores/useGameStore';

const { t } = useI18n();
const game = useGameStore();
const { resources } = storeToRefs(game);
const units = computed(() => game.units);
const buildings = computed(() => game.buildings);

function formatNumber(num: number): string {
  const n = Math.floor(num);
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}
</script>

<style lang="scss" scoped>
$transition-theme: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;

.production-inner { max-width: 768px; margin: 0 auto; }
.production-title {
  font-size: 24px; font-weight: 300; color: var(--text-heading);
  margin-bottom: 32px; padding-bottom: 16px; border-bottom: 1px solid var(--border-light);
}
.section-block { margin-bottom: 40px; }
.section-label {
  font-size: 12px; font-weight: 700; color: var(--text-faint);
  text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px;
}

.recruit-box {
  border: 1px solid var(--border-primary); background: var(--bg-surface);
  border-radius: 4px; padding: 4px; margin-bottom: 24px; transition: $transition-theme;
}
.recruit-btn { width: 100%; }
.recruit-description { padding: 16px; font-size: 14px; color: var(--text-muted); font-style: italic; }

.action-card {
  border: 1px solid var(--border-primary); background: var(--bg-surface); padding: 16px;
  border-radius: 4px; display: flex; align-items: center; justify-content: space-between;
  transition: border-color 0.15s ease, background-color 0.3s ease; margin-bottom: 16px;
  &:hover { border-color: var(--border-hover); }
}
.action-title { font-weight: 700; color: var(--text-heading); font-size: 14px; }
.action-cost { font-size: 12px; color: var(--text-faint); }
.action-resources { display: flex; align-items: center; gap: 16px; font-size: 10px; }
.action-btn { min-width: 100px; }
</style>
