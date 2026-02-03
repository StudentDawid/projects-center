<script setup lang="ts">
/**
 * Resource Bar - displays main resources in the top bar
 */

import { useAteriaResourcesStore } from '../model/resources.store';
import { formatNumber } from '@projects-center/shared/lib/big-number';

const resourcesStore = useAteriaResourcesStore();
</script>

<template>
  <div class="resource-bar d-flex align-center ga-2">
    <div
      v-for="resource in resourcesStore.visibleResources"
      :key="resource.id"
      class="resource-item d-flex align-center px-3 py-1 rounded"
    >
      <v-icon
        :icon="resource.icon"
        size="16"
        :color="resource.color"
        class="mr-2"
      />
      <span class="resource-value font-weight-medium">
        {{ formatNumber(resource.amount) }}
      </span>
      <span
        v-if="resource.perSecond.gt(0)"
        class="text-caption ml-1 resource-rate"
      >
        +{{ formatNumber(resource.perSecond) }}/s
      </span>

      <v-tooltip
        activator="parent"
        location="bottom"
      >
        <div class="font-weight-bold">
          {{ resource.name }}
        </div>
        <div v-if="resource.maxAmount">
          {{ formatNumber(resource.amount) }} / {{ formatNumber(resource.maxAmount) }}
        </div>
        <div v-else>
          {{ formatNumber(resource.amount) }}
        </div>
        <div
          v-if="resource.perSecond.gt(0)"
          class="text-caption"
        >
          +{{ formatNumber(resource.perSecond) }} na sekundę
        </div>
      </v-tooltip>
    </div>
  </div>
</template>

<style scoped>
.resource-bar {
  overflow-x: auto;
  max-width: 600px;
}

.resource-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: default;
  transition: background 0.2s;
}

.resource-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.resource-value {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.9);
}

.resource-rate {
  color: rgba(76, 175, 80, 0.8);
}
</style>
