<template>
  <div class="production-inner">
    <h2 class="production-title">{{ t('mining.title') }}</h2>
    <p class="view-subtitle">{{ t('mining.subtitle') }}</p>

    <!-- Lumber Camp -->
    <div class="section-block">
      <h3 class="section-label">&#x1FAB5; {{ t('mining.woodcamp') }} — {{ t('mining.level') }} {{ miningOps.woodcamp.level }}</h3>
      <p class="profile-description">{{ t('mining.woodcampDesc') }}</p>

      <div class="mining-card">
        <div class="mining-stats-row">
          <div class="mining-stat">
            <span class="mining-stat-label">{{ t('mining.workers') }}</span>
            <span class="mining-stat-value">{{ miningOps.woodcamp.workers }} / {{ miningOps.woodcamp.maxWorkers }}</span>
          </div>
          <div class="mining-stat">
            <span class="mining-stat-label">{{ t('mining.production') }}</span>
            <span class="mining-stat-value text-green-darken-2">+{{ getMiningRate(miningOps.woodcamp) }} {{ t('mining.perMinute') }}</span>
          </div>
        </div>
        <v-progress-linear
          :model-value="(miningOps.woodcamp.workers / miningOps.woodcamp.maxWorkers) * 100"
          color="green-darken-1" height="6" rounded bg-color="grey-lighten-3" class="my-3"
        />
        <div class="mining-click-row">
          <v-btn variant="tonal" color="green-darken-2" size="large"
            class="text-none font-weight-bold click-gather-btn" @click="game.manualMine('woodcamp')">
            <v-icon start>mdi-axe</v-icon>
            {{ t('click.gather') }} (+{{ miningOps.woodcamp.clickAmount * Math.max(miningOps.woodcamp.level, 1) }} {{ t('click.perClick') }})
          </v-btn>
        </div>
        <div class="mining-actions">
          <v-btn variant="outlined" color="blue-darken-1" size="small" class="text-none font-weight-bold"
            :disabled="miningOps.woodcamp.workers >= miningOps.woodcamp.maxWorkers || resources.gold < miningOps.woodcamp.workerCost"
            @click="game.hireWorker('woodcamp')">
            {{ t('mining.upgradeWorkers') }} ({{ t('mining.workerCost', { gold: miningOps.woodcamp.workerCost }) }})
          </v-btn>
          <v-btn variant="flat" color="blue-darken-1" size="small" class="text-none font-weight-bold"
            :disabled="resources.gold < miningOps.woodcamp.upgradeCost.gold || resources.stone < miningOps.woodcamp.upgradeCost.stone"
            @click="game.upgradeMining('woodcamp')">
            {{ t('mining.upgradeLevel') }} ({{ miningOps.woodcamp.upgradeCost.gold }}G {{ miningOps.woodcamp.upgradeCost.stone }}S)
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Stone Quarry -->
    <div class="section-block">
      <h3 class="section-label">&#x1FAA8; {{ t('mining.quarry') }} — {{ t('mining.level') }} {{ miningOps.quarry.level }}</h3>
      <p class="profile-description">{{ t('mining.quarryDesc') }}</p>

      <div class="mining-card">
        <div class="mining-stats-row">
          <div class="mining-stat">
            <span class="mining-stat-label">{{ t('mining.workers') }}</span>
            <span class="mining-stat-value">{{ miningOps.quarry.workers }} / {{ miningOps.quarry.maxWorkers }}</span>
          </div>
          <div class="mining-stat">
            <span class="mining-stat-label">{{ t('mining.production') }}</span>
            <span class="mining-stat-value text-grey-darken-1">+{{ getMiningRate(miningOps.quarry) }} {{ t('mining.perMinute') }}</span>
          </div>
        </div>
        <v-progress-linear
          :model-value="(miningOps.quarry.workers / miningOps.quarry.maxWorkers) * 100"
          color="grey" height="6" rounded bg-color="grey-lighten-3" class="my-3"
        />
        <div class="mining-click-row">
          <v-btn variant="tonal" color="grey-darken-1" size="large"
            class="text-none font-weight-bold click-gather-btn" @click="game.manualMine('quarry')">
            <v-icon start>mdi-pickaxe</v-icon>
            {{ t('click.gather') }} (+{{ miningOps.quarry.clickAmount * Math.max(miningOps.quarry.level, 1) }} {{ t('click.perClick') }})
          </v-btn>
        </div>
        <div class="mining-actions">
          <v-btn variant="outlined" color="blue-darken-1" size="small" class="text-none font-weight-bold"
            :disabled="miningOps.quarry.workers >= miningOps.quarry.maxWorkers || resources.gold < miningOps.quarry.workerCost"
            @click="game.hireWorker('quarry')">
            {{ t('mining.upgradeWorkers') }} ({{ t('mining.workerCost', { gold: miningOps.quarry.workerCost }) }})
          </v-btn>
          <v-btn variant="flat" color="blue-darken-1" size="small" class="text-none font-weight-bold"
            :disabled="resources.gold < miningOps.quarry.upgradeCost.gold"
            @click="game.upgradeMining('quarry')">
            {{ t('mining.upgradeLevel') }} ({{ miningOps.quarry.upgradeCost.gold }}G)
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Iron Mine -->
    <div class="section-block">
      <h3 class="section-label">&#x2692;&#xFE0F; {{ t('mining.forge') }} — {{ t('mining.level') }} {{ miningOps.forge.level }}</h3>
      <p class="profile-description">{{ t('mining.forgeDesc') }}</p>

      <div class="mining-card">
        <div class="mining-stats-row">
          <div class="mining-stat">
            <span class="mining-stat-label">{{ t('mining.workers') }}</span>
            <span class="mining-stat-value">{{ miningOps.forge.workers }} / {{ miningOps.forge.maxWorkers }}</span>
          </div>
          <div class="mining-stat">
            <span class="mining-stat-label">{{ t('mining.production') }}</span>
            <span class="mining-stat-value text-blue-grey-darken-1">+{{ getMiningRate(miningOps.forge) }} {{ t('mining.perMinute') }}</span>
          </div>
        </div>
        <v-progress-linear
          :model-value="(miningOps.forge.workers / miningOps.forge.maxWorkers) * 100"
          color="blue-grey" height="6" rounded bg-color="grey-lighten-3" class="my-3"
        />
        <div class="mining-click-row">
          <v-btn variant="tonal" color="blue-grey-darken-1" size="large"
            class="text-none font-weight-bold click-gather-btn" @click="game.manualMine('forge')">
            <v-icon start>mdi-anvil</v-icon>
            {{ t('click.gather') }} (+{{ miningOps.forge.clickAmount * Math.max(miningOps.forge.level, 1) }} {{ t('click.perClick') }})
          </v-btn>
        </div>
        <div class="mining-actions">
          <v-btn variant="outlined" color="blue-darken-1" size="small" class="text-none font-weight-bold"
            :disabled="miningOps.forge.workers >= miningOps.forge.maxWorkers || resources.gold < miningOps.forge.workerCost"
            @click="game.hireWorker('forge')">
            {{ t('mining.upgradeWorkers') }} ({{ t('mining.workerCost', { gold: miningOps.forge.workerCost }) }})
          </v-btn>
          <v-btn variant="flat" color="blue-darken-1" size="small" class="text-none font-weight-bold"
            :disabled="resources.gold < miningOps.forge.upgradeCost.gold || resources.stone < miningOps.forge.upgradeCost.stone"
            @click="game.upgradeMining('forge')">
            {{ t('mining.upgradeLevel') }} ({{ miningOps.forge.upgradeCost.gold }}G {{ miningOps.forge.upgradeCost.stone }}S)
          </v-btn>
        </div>
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
const miningOps = computed(() => game.mining);

function getMiningRate(op: { level: number; workers: number; baseRate: number }) {
  return op.workers * op.baseRate * op.level;
}
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
.profile-description { font-size: 13px; color: var(--text-muted); margin-bottom: 16px; }

.mining-card {
  border: 1px solid var(--border-primary); background: var(--bg-surface); padding: 16px;
  border-radius: 6px; transition: border-color 0.15s ease, background-color 0.3s ease;
}
.mining-stats-row { display: flex; justify-content: space-between; }
.mining-stat { display: flex; flex-direction: column; gap: 2px; }
.mining-stat-label {
  font-size: 10px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.05em; color: var(--text-faint);
}
.mining-stat-value { font-size: 14px; font-weight: 700; font-family: monospace; color: var(--text-heading); }
.mining-click-row { margin-bottom: 10px; }
.click-gather-btn { width: 100%; letter-spacing: 0.5px; }
.mining-actions { display: flex; gap: 8px; flex-wrap: wrap; }
</style>
