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
        <template v-slot:prepend>
          <v-avatar color="blue-grey-darken-4" size="48">
            <span class="text-h6">{{ worker.count }}</span>
          </v-avatar>
        </template>

        <v-list-item-title class="font-weight-bold text-amber-lighten-4">
          {{ worker.name }}
        </v-list-item-title>

        <v-list-item-subtitle class="text-grey">
          {{ worker.description }}
          <br />
          <span class="text-green-lighten-2 text-caption">
            +{{ worker.baseProduction }} GPS
          </span>
        </v-list-item-subtitle>

        <template v-slot:append>
          <v-btn
            :disabled="
              !store.gold.lt || store.gold.lt(store.getWorkerCost(worker.id))
            "
            @click="store.hireWorker(worker.id)"
            color="amber-darken-3"
            variant="tonal"
            size="small"
            style="min-width: 80px"
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
