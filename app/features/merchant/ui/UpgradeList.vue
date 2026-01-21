<template>
  <v-card color="#111" class="mt-4">
    <v-card-title class="text-overline text-grey-lighten-1">
      Workers / Upgrades
    </v-card-title>
    <v-list bg-color="transparent">
      <v-list-item
        v-for="worker in store.workers"
        :key="worker.id"
        class="border-b border-color-grey-darken-3"
      >
        <template #prepend>
          <v-avatar color="blue-grey-darken-4" size="48">
            <span class="text-h6">{{ worker.count }}</span>
          </v-avatar>
        </template>

        <div class="w-100 pl-4 pr-2">
          <v-list-item-title class="font-weight-bold text-amber-lighten-4">
            {{ worker.name }}
          </v-list-item-title>

          <div class="text-caption text-grey mb-1 text-wrap">
            {{ worker.description }}
          </div>
          <div class="d-flex justify-space-between align-center mt-1 w-100">
            <span class="text-green-lighten-2 text-caption font-weight-bold">
              +{{ store.formatNumber(worker.baseProduction) }} GPS/ea
            </span>
            <span
              class="text-amber-lighten-2 text-caption font-weight-bold"
              v-if="worker.count > 0"
            >
              Total: +{{ store.formatNumber(store.getWorkerTotal(worker)) }} GPS
            </span>
          </div>
        </div>

        <template #append>
          <v-btn
            :disabled="!store.canAfford(store.getWorkerCost(worker.id))"
            color="amber-darken-3"
            variant="tonal"
            size="small"
            style="min-width: 80px"
            @click="store.hireWorker(worker.id)"
          >
            {{ store.formatNumber(store.getWorkerCost(worker.id)) }} G
          </v-btn>
        </template>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script setup lang="ts">
import { useMerchantStore } from '~/entities/merchant/store';

const store = useMerchantStore();
</script>

<style scoped>
.border-b {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
