<template>
  <div class="production-inner">
    <h2 class="production-title">{{ t('market.title') }}</h2>
    <p class="view-subtitle">{{ t('market.subtitle') }}</p>

    <!-- Wood -->
    <div class="section-block">
      <h3 class="section-label">🪵 {{ t('market.sellWood') }}</h3>
      <div class="market-card">
        <div class="market-info-row">
          <div class="market-info">
            <span class="market-label">{{ t('market.price') }}</span>
            <span class="market-value text-amber-darken-2">{{ marketPrices.wood }}G {{ t('market.perUnit') }}</span>
          </div>
          <div class="market-info">
            <span class="market-label">{{ t('market.stock') }}</span>
            <span class="market-value">{{ Math.floor(resources.wood) }}</span>
          </div>
        </div>
        <div class="market-actions">
          <v-btn variant="tonal" color="green-darken-1" size="small" class="text-none font-weight-bold"
            :disabled="resources.wood < 1" @click="game.sellResource('wood', 1)">{{ t('market.sell') }} 1</v-btn>
          <v-btn variant="tonal" color="green-darken-1" size="small" class="text-none font-weight-bold"
            :disabled="resources.wood < 10" @click="game.sellResource('wood', 10)">{{ t('market.sell10') }}</v-btn>
          <v-btn variant="tonal" color="green-darken-1" size="small" class="text-none font-weight-bold"
            :disabled="resources.wood < 100" @click="game.sellResource('wood', 100)">{{ t('market.sell100') }}</v-btn>
          <v-btn variant="flat" color="green-darken-2" size="small" class="text-none font-weight-bold"
            :disabled="resources.wood < 1" @click="game.sellResource('wood', Math.floor(resources.wood))">{{ t('market.sellAll') }}</v-btn>
        </div>
        <p v-if="resources.wood < 1" class="empty-text mt-2">{{ t('market.noStock') }}</p>
      </div>
    </div>

    <!-- Stone -->
    <div class="section-block">
      <h3 class="section-label">🪨 {{ t('market.sellStone') }}</h3>
      <div class="market-card">
        <div class="market-info-row">
          <div class="market-info">
            <span class="market-label">{{ t('market.price') }}</span>
            <span class="market-value text-amber-darken-2">{{ marketPrices.stone }}G {{ t('market.perUnit') }}</span>
          </div>
          <div class="market-info">
            <span class="market-label">{{ t('market.stock') }}</span>
            <span class="market-value">{{ Math.floor(resources.stone) }}</span>
          </div>
        </div>
        <div class="market-actions">
          <v-btn variant="tonal" color="blue-grey-darken-1" size="small" class="text-none font-weight-bold"
            :disabled="resources.stone < 1" @click="game.sellResource('stone', 1)">{{ t('market.sell') }} 1</v-btn>
          <v-btn variant="tonal" color="blue-grey-darken-1" size="small" class="text-none font-weight-bold"
            :disabled="resources.stone < 10" @click="game.sellResource('stone', 10)">{{ t('market.sell10') }}</v-btn>
          <v-btn variant="tonal" color="blue-grey-darken-1" size="small" class="text-none font-weight-bold"
            :disabled="resources.stone < 100" @click="game.sellResource('stone', 100)">{{ t('market.sell100') }}</v-btn>
          <v-btn variant="flat" color="blue-grey-darken-2" size="small" class="text-none font-weight-bold"
            :disabled="resources.stone < 1" @click="game.sellResource('stone', Math.floor(resources.stone))">{{ t('market.sellAll') }}</v-btn>
        </div>
        <p v-if="resources.stone < 1" class="empty-text mt-2">{{ t('market.noStock') }}</p>
      </div>
    </div>

    <!-- Metal -->
    <div class="section-block">
      <h3 class="section-label">⚙️ {{ t('market.sellMetal') }}</h3>
      <div class="market-card">
        <div class="market-info-row">
          <div class="market-info">
            <span class="market-label">{{ t('market.price') }}</span>
            <span class="market-value text-amber-darken-2">{{ marketPrices.metal }}G {{ t('market.perUnit') }}</span>
          </div>
          <div class="market-info">
            <span class="market-label">{{ t('market.stock') }}</span>
            <span class="market-value">{{ Math.floor(resources.metal) }}</span>
          </div>
        </div>
        <div class="market-actions">
          <v-btn variant="tonal" color="deep-orange-darken-1" size="small" class="text-none font-weight-bold"
            :disabled="resources.metal < 1" @click="game.sellResource('metal', 1)">{{ t('market.sell') }} 1</v-btn>
          <v-btn variant="tonal" color="deep-orange-darken-1" size="small" class="text-none font-weight-bold"
            :disabled="resources.metal < 10" @click="game.sellResource('metal', 10)">{{ t('market.sell10') }}</v-btn>
          <v-btn variant="tonal" color="deep-orange-darken-1" size="small" class="text-none font-weight-bold"
            :disabled="resources.metal < 100" @click="game.sellResource('metal', 100)">{{ t('market.sell100') }}</v-btn>
          <v-btn variant="flat" color="deep-orange-darken-2" size="small" class="text-none font-weight-bold"
            :disabled="resources.metal < 1" @click="game.sellResource('metal', Math.floor(resources.metal))">{{ t('market.sellAll') }}</v-btn>
        </div>
        <p v-if="resources.metal < 1" class="empty-text mt-2">{{ t('market.noStock') }}</p>
      </div>
    </div>

    <div class="market-hint">
      <v-icon size="16" color="amber-darken-2" class="mr-2">mdi-information</v-icon>
      <span>{{ t('market.priceInfo') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useI18n } from '~/composables/useI18n';
import { useGameStore } from '~/stores/useGameStore';

const { t } = useI18n();
const game = useGameStore();
const { resources, marketPrices } = storeToRefs(game);
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
.empty-text { font-size: 13px; color: var(--text-faint); text-align: center; }

.market-card {
  background: var(--bg-card); border: 1px solid var(--border-primary);
  border-radius: 10px; padding: 16px; transition: $transition-theme;
}
.market-info-row { display: flex; gap: 24px; margin-bottom: 12px; }
.market-info { display: flex; flex-direction: column; gap: 2px; }
.market-label {
  font-size: 0.75rem; color: var(--text-secondary);
  text-transform: uppercase; letter-spacing: 0.5px;
}
.market-value { font-size: 1.1rem; font-weight: 700; color: var(--text-heading); }
.market-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.market-hint {
  display: flex; align-items: center; margin-top: 16px; padding: 10px 14px;
  background: var(--bg-card); border: 1px solid var(--border-primary);
  border-radius: 8px; font-size: 0.85rem; color: var(--text-secondary); transition: $transition-theme;
}
</style>
