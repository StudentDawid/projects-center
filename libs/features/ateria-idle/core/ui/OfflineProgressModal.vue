<script setup lang="ts">
/**
 * Offline Progress Modal - shows rewards earned while away
 */

import { computed } from 'vue';
import { formatNumber } from '@libs/shared/lib/big-number';
import type { OfflineReport } from '@libs/entities/ateria-idle/game';

interface Props {
  modelValue: boolean;
  report: OfflineReport | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  claim: [];
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
  if (minutes > 0) {
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${seconds}s`;
}

function handleClaim() {
  emit('claim');
  isOpen.value = false;
}
</script>

<template>
  <v-dialog
    v-model="isOpen"
    max-width="450"
    persistent
  >
    <v-card class="offline-modal">
      <!-- Header -->
      <div class="modal-header pa-6 text-center">
        <v-icon
          size="64"
          color="primary"
          class="mb-3"
        >
          mdi-sleep
        </v-icon>
        <h2 class="text-h5 font-weight-bold mb-1">
          Witaj z powrotem!
        </h2>
        <p class="text-body-2 text-medium-emphasis mb-0">
          Twoja gildia pracowała przez
          <span class="text-primary font-weight-medium">
            {{ report ? formatTime(report.timeAway) : '0s' }}
          </span>
        </p>
      </div>

      <v-divider />

      <!-- Content -->
      <v-card-text
        v-if="report"
        class="pa-6"
      >
        <!-- Combat Report -->
        <div
          v-if="report.combat.monstersKilled > 0"
          class="report-section mb-4"
        >
          <div class="d-flex align-center mb-3">
            <v-icon
              color="error"
              class="mr-2"
            >
              mdi-sword-cross
            </v-icon>
            <span class="text-subtitle-2 font-weight-medium">Walka</span>
          </div>

          <div class="report-grid">
            <div class="report-item">
              <v-icon
                size="20"
                color="error"
                class="mb-1"
              >
                mdi-skull
              </v-icon>
              <div class="text-h6 font-weight-bold">
                {{ report.combat.monstersKilled }}
              </div>
              <div class="text-caption text-medium-emphasis">
                Zabójstwa
              </div>
            </div>

            <div class="report-item">
              <v-icon
                size="20"
                color="primary"
                class="mb-1"
              >
                mdi-star
              </v-icon>
              <div class="text-h6 font-weight-bold text-primary">
                +{{ report.combat.xpGained }}
              </div>
              <div class="text-caption text-medium-emphasis">
                Doświadczenie
              </div>
            </div>

            <div class="report-item">
              <v-icon
                size="20"
                color="amber"
                class="mb-1"
              >
                mdi-currency-usd
              </v-icon>
              <div class="text-h6 font-weight-bold text-amber">
                +{{ report.combat.loot.reduce((sum, l) => sum + l.amount, 0) }}
              </div>
              <div class="text-caption text-medium-emphasis">
                Złoto
              </div>
            </div>

            <div
              v-if="report.combat.deaths > 0"
              class="report-item"
            >
              <v-icon
                size="20"
                color="error"
                class="mb-1"
              >
                mdi-heart-broken
              </v-icon>
              <div class="text-h6 font-weight-bold text-error">
                {{ report.combat.deaths }}
              </div>
              <div class="text-caption text-medium-emphasis">
                Śmierci
              </div>
            </div>
          </div>
        </div>

        <!-- Loot Section -->
        <div
          v-if="report.combat.loot.length > 0"
          class="report-section"
        >
          <div class="d-flex align-center mb-3">
            <v-icon
              color="amber"
              class="mr-2"
            >
              mdi-treasure-chest
            </v-icon>
            <span class="text-subtitle-2 font-weight-medium">Łupy</span>
          </div>

          <div class="loot-grid">
            <v-chip
              v-for="(loot, index) in report.combat.loot.slice(0, 8)"
              :key="index"
              size="small"
              variant="tonal"
              class="ma-1"
            >
              {{ loot.amount }}x {{ loot.itemId }}
            </v-chip>
            <v-chip
              v-if="report.combat.loot.length > 8"
              size="small"
              variant="outlined"
              class="ma-1"
            >
              +{{ report.combat.loot.length - 8 }} więcej
            </v-chip>
          </div>
        </div>

        <!-- No Progress -->
        <div
          v-if="report.combat.monstersKilled === 0"
          class="text-center py-4 text-medium-emphasis"
        >
          <v-icon
            size="48"
            class="mb-2 opacity-50"
          >
            mdi-sleep
          </v-icon>
          <div class="text-body-2">
            Twój wojownik odpoczywał
          </div>
          <div class="text-caption">
            Włącz auto-walkę przed wyjściem
          </div>
        </div>
      </v-card-text>

      <v-divider />

      <!-- Actions -->
      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn
          color="primary"
          size="large"
          variant="flat"
          block
          @click="handleClaim"
        >
          <v-icon start>
            mdi-check
          </v-icon>
          Odbierz nagrody
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.offline-modal {
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.modal-header {
  background: linear-gradient(
    180deg,
    rgba(33, 150, 243, 0.1) 0%,
    transparent 100%
  );
}

.report-section {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  padding: 16px;
}

.report-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 16px;
}

.report-item {
  text-align: center;
  padding: 12px 8px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
}

.loot-grid {
  display: flex;
  flex-wrap: wrap;
}
</style>
