<template>
  <v-dialog v-model="isOpen" max-width="600" persistent>
    <v-card color="#1a1a1a">
      <v-card-title class="d-flex align-center justify-space-between bg-amber-darken-3">
        <span class="d-flex align-center gap-2 text-white">
          <v-icon color="white">mdi-clock-outline</v-icon>
          Powrót do gry
        </span>
        <v-btn icon variant="text" @click="close">
          <v-icon color="white">mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-4">
        <div v-if="progress" class="offline-summary">
          <!-- Time Away -->
          <div class="summary-section mb-4">
            <div class="text-caption text-grey mb-2">Czas nieobecności</div>
            <div class="text-h5 text-amber-lighten-2">
              {{ formatTime(progress.offlineTime) }}
            </div>
            <div class="text-caption text-grey mt-1">
              Efektywność: {{ Math.floor(progress.efficiency * 100) }}%
            </div>
          </div>

          <v-divider class="my-4" />

          <!-- Gold Earned -->
          <div class="summary-section mb-4">
            <div class="text-caption text-grey mb-2">Zarobione złoto</div>
            <div class="text-h4 text-green-lighten-2 font-weight-bold">
              +{{ store.formatNumber(progress.goldEarned) }} G
            </div>
          </div>

          <!-- Breakdown -->
          <div class="breakdown mb-4">
            <div class="breakdown-item d-flex justify-space-between align-center mb-2">
              <div class="d-flex align-center gap-2">
                <v-icon size="small" color="blue">mdi-factory</v-icon>
                <span class="text-caption">Produkcja pasywna</span>
              </div>
              <span class="text-caption text-green-lighten-2 font-weight-bold">
                +{{ store.formatNumber(progress.goldFromProduction) }} G
              </span>
            </div>

            <div class="breakdown-item d-flex justify-space-between align-center mb-2">
              <div class="d-flex align-center gap-2">
                <v-icon size="small" color="orange">mdi-truck-delivery</v-icon>
                <span class="text-caption">Karawany ({{ progress.caravansReturned }})</span>
              </div>
              <span class="text-caption text-green-lighten-2 font-weight-bold">
                +{{ store.formatNumber(progress.goldFromCaravans) }} G
              </span>
            </div>

            <div class="breakdown-item d-flex justify-space-between align-center mb-2">
              <div class="d-flex align-center gap-2">
                <v-icon size="small" color="purple">mdi-account-tie</v-icon>
                <span class="text-caption">Faktory ({{ progress.factorTradesCompleted }} transakcji)</span>
              </div>
              <span class="text-caption text-green-lighten-2 font-weight-bold">
                +{{ store.formatNumber(progress.goldFromFactors) }} G
              </span>
            </div>

            <div v-if="progress.eventsOccurred > 0" class="breakdown-item d-flex justify-space-between align-center mt-2">
              <div class="d-flex align-center gap-2">
                <v-icon size="small" color="red">mdi-alert</v-icon>
                <span class="text-caption">Wydarzenia losowe</span>
              </div>
              <span class="text-caption text-amber-lighten-2">
                {{ progress.eventsOccurred }} wydarzeń
              </span>
            </div>
          </div>

          <v-divider class="my-4" />

          <!-- Bonus Info -->
          <div v-if="progress.efficiency >= 0.9" class="bonus-info pa-3 mb-2" style="background: rgba(76, 175, 80, 0.1); border-radius: 8px;">
            <div class="d-flex align-center gap-2 text-green-lighten-2">
              <v-icon size="small">mdi-star</v-icon>
              <span class="text-caption">Bonus za długi czas offline!</span>
            </div>
          </div>
        </div>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn color="amber-darken-3" variant="flat" @click="close">
          Kontynuuj
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useMerchantStore } from '~/entities/merchant';
import type { OfflineProgress } from '~/entities/merchant/model';

const store = useMerchantStore();

const isOpen = computed({
  get: () => store.showOfflineModal,
  set: (value) => {
    store.showOfflineModal = value;
  },
});

const progress = computed(() => store.lastOfflineProgress);

function formatTime(ms: number): string {
  const hours = Math.floor(ms / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((ms % (60 * 1000)) / 1000);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

function close() {
  store.showOfflineModal = false;
}
</script>

<style scoped>
.offline-summary {
  color: white;
}

.summary-section {
  text-align: center;
}

.breakdown {
  background: rgba(255, 255, 255, 0.05);
  padding: 12px;
  border-radius: 8px;
}
</style>
