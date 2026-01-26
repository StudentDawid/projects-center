<script setup lang="ts">
/**
 * Resource Bar - displays main resources in the top bar
 */

import { useAteriaResourcesStore } from '../model/resources.store';
import { formatNumber } from '~/shared/lib/big-number';

const resourcesStore = useAteriaResourcesStore();
</script>

<template>
  <div class="resource-bar d-flex align-center ga-3">
    <v-chip
      v-for="resource in resourcesStore.visibleResources"
      :key="resource.id"
      size="small"
      variant="tonal"
      :color="resource.color"
    >
      <v-icon
        :icon="resource.icon"
        size="small"
        start
      />
      <span class="font-weight-medium">
        {{ formatNumber(resource.amount) }}
      </span>
      <span
        v-if="resource.perSecond.gt(0)"
        class="text-caption ml-1 text-medium-emphasis"
      >
        (+{{ formatNumber(resource.perSecond) }}/s)
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
    </v-chip>
  </div>
</template>

<style scoped>
.resource-bar {
  overflow-x: auto;
  max-width: 600px;
}
</style>
