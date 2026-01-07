<script setup lang="ts">
import { computed } from 'vue';
import { useRelicStore, RARITY_COLORS, RARITY_NAMES } from '~/stores/solmar-sanctuary/relics';

const relicStore = useRelicStore();

const pendingRelic = computed(() => relicStore.pendingRelic);

const rarityColor = computed(() => {
  if (!pendingRelic.value) return '#9e9e9e';
  return RARITY_COLORS[pendingRelic.value.rarity];
});

const rarityName = computed(() => {
  if (!pendingRelic.value) return '';
  return RARITY_NAMES[pendingRelic.value.rarity];
});

function handleClaim() {
  relicStore.claimPendingRelic();
}

function handleDismiss() {
  relicStore.dismissPendingRelic();
}
</script>

<template>
  <v-dialog
    :model-value="!!pendingRelic"
    max-width="400"
    persistent
    class="relic-drop-modal"
  >
    <v-card v-if="pendingRelic" class="relic-card" :style="{ '--rarity-color': rarityColor }">
      <div class="card-glow"></div>

      <div class="relic-header">
        <div class="relic-icon-container">
          <span class="relic-icon">{{ pendingRelic.icon }}</span>
          <div class="icon-glow"></div>
        </div>
        <div class="drop-label">NOWA RELIKWIA!</div>
      </div>

      <div class="relic-content">
        <div class="relic-rarity" :style="{ color: rarityColor }">
          {{ rarityName }}
        </div>
        <h2 class="relic-name" :style="{ color: rarityColor }">
          {{ pendingRelic.name }}
        </h2>
        <p class="relic-description">
          {{ pendingRelic.description }}
        </p>
        <p class="relic-lore">
          "{{ pendingRelic.lore }}"
        </p>

        <div class="relic-effects">
          <div class="effects-title">Efekty:</div>
          <div
            v-for="effect in pendingRelic.effects"
            :key="effect.type"
            class="effect-item"
          >
            <span class="effect-icon">✨</span>
            <span class="effect-text">{{ getEffectText(effect) }}</span>
          </div>
        </div>
      </div>

      <div class="relic-actions">
        <v-btn
          color="grey"
          variant="text"
          @click="handleDismiss"
        >
          Odrzuć
        </v-btn>
        <v-btn
          :style="{ backgroundColor: rarityColor }"
          class="claim-btn"
          @click="handleClaim"
        >
          <v-icon left>mdi-treasure-chest</v-icon>
          Zabierz
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import type { RelicEffect } from '~/shared/types/game.types';

function getEffectText(effect: RelicEffect): string {
  const texts: Record<string, string> = {
    productionMultiplier: `+${effect.value}% produkcji ${getResourceName(effect.targetId)}`,
    clickMultiplier: `+${effect.value}% z kliknięć`,
    defenseBonus: `+${effect.value}% obrony`,
    moraleRegenBonus: `+${effect.value}% regeneracji morale`,
    moraleDamageReduction: `-${effect.value}% obrażeń morale`,
    prestigeBonus: `+${effect.value}% Popiołów z prestiżu`,
    moraleMinimum: `Morale nie spada poniżej ${effect.value}`,
    doubleClickChance: `${effect.value}% szansy na podwójne kliknięcie`,
    waveDelayBonus: `+${effect.value}s między falami`,
    criticalClickChance: `${effect.value}% szansy na krytyczne kliknięcie`,
    allProductionMultiplier: `+${effect.value}% wszystkich produkcji`,
  };
  return texts[effect.type] || `${effect.type}: ${effect.value}`;
}

function getResourceName(resourceId?: string): string {
  if (!resourceId) return '';
  const names: Record<string, string> = {
    faith: 'Wiary',
    ducats: 'Dukatów',
    biomass: 'Biomasy',
    souls: 'Dusz',
    rage: 'Gniewu',
  };
  return names[resourceId] || resourceId;
}
</script>

<style scoped lang="scss">
.relic-drop-modal {
  :deep(.v-overlay__content) {
    overflow: visible !important;
  }
}

.relic-card {
  position: relative;
  background: linear-gradient(145deg, #1a1a2e 0%, #0f0f1a 100%) !important;
  border: 2px solid var(--rarity-color);
  border-radius: 16px !important;
  overflow: visible !important;
  padding: 0;
}

.card-glow {
  position: absolute;
  inset: -10px;
  border-radius: 20px;
  background: var(--rarity-color);
  opacity: 0.15;
  filter: blur(20px);
  z-index: -1;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.15; transform: scale(1); }
  50% { opacity: 0.25; transform: scale(1.02); }
}

.relic-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 24px;
}

.relic-icon-container {
  position: relative;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.relic-icon {
  font-size: 56px;
  position: relative;
  z-index: 1;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.icon-glow {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, var(--rarity-color) 0%, transparent 70%);
  opacity: 0.4;
  animation: glowPulse 2s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.2); }
}

.drop-label {
  margin-top: 8px;
  padding: 4px 16px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 3px;
  color: rgba(255, 255, 255, 0.7);
}

.relic-content {
  padding: 16px 24px 24px;
  text-align: center;
}

.relic-rarity {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.relic-name {
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 12px;
  font-family: 'Cinzel', serif;
}

.relic-description {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 12px;
}

.relic-lore {
  font-size: 12px;
  font-style: italic;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 16px;
}

.relic-effects {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 12px;
  text-align: left;
}

.effects-title {
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 8px;
}

.effect-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #4caf50;
  margin-bottom: 4px;

  &:last-child {
    margin-bottom: 0;
  }
}

.effect-icon {
  font-size: 14px;
}

.relic-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.claim-btn {
  color: #000 !important;
  font-weight: 600;
}
</style>

