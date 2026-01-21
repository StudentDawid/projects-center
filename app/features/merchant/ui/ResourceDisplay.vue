<template>
  <v-card class="mb-4" color="#1a1a1a" elevation="4">
    <v-card-text class="d-flex justify-space-between align-center">
      <div>
        <div class="text-caption text-grey">Current Wealth</div>
        <div class="text-h4 font-weight-bold text-amber-darken-2">
          {{ store.formatNumber(store.gold) }} Gold
        </div>
      </div>
      <div class="text-right">
        <div class="text-caption text-grey">Income</div>
        <div class="text-h6 text-green-darken-1">
          +{{ store.formatNumber(store.goldPerSecond) }} / sec
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { useMerchantStore } from '~/entities/merchant/store';

const store = useMerchantStore();
</script>
