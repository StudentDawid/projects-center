<template>
  <v-card class="mb-4 wealth-card" color="#1a1a1a" elevation="4">
    <v-card-text class="pa-4">
      <div class="wealth-section mb-4">
        <div class="text-caption text-grey text-uppercase letter-spacing-1">
          Current Wealth
        </div>
        <div
          class="text-h3 font-weight-bold text-amber-darken-2 mono-font mt-1 d-flex align-baseline flex-wrap"
        >
          {{ store.formatNumber(store.gold) }}
          <span class="text-subtitle-1 gold-label ml-2">Gold</span>
        </div>
      </div>

      <v-divider color="grey-darken-3" class="mb-4" />

      <div class="income-section">
        <div class="text-caption text-grey text-uppercase letter-spacing-1">
          Passive Income
        </div>
        <div
          class="text-h5 text-green-darken-1 mono-font mt-1 d-flex align-center"
        >
          <v-icon size="small" class="mr-2" color="green-darken-1"
            >mdi-trending-up</v-icon
          >
          +{{ store.formatNumber(store.goldPerSecond) }}
          <span class="text-caption ml-2 text-grey">Gold / second</span>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { useMerchantStore } from '~/entities/merchant/store';

const store = useMerchantStore();
</script>

<style scoped>
.wealth-card {
  border: 1px solid rgba(255, 179, 0, 0.1);
  min-height: 180px;
}

.mono-font {
  font-family: 'Roboto Mono', 'Courier New', monospace !important;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}

.letter-spacing-1 {
  letter-spacing: 0.1em;
}

.gold-label {
  opacity: 0.7;
  font-weight: normal;
}
</style>
