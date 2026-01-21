<template>
  <v-card color="#111" class="mt-4 event-log-card" elevation="4">
    <v-card-title class="text-overline text-grey-lighten-1 pb-1">
      Journal
    </v-card-title>
    <div class="log-container pa-3" ref="logContainer">
      <div
        v-if="store.events.length === 0"
        class="text-center text-grey-darken-2 py-4 text-caption"
      >
        * The pages are yet blank *
      </div>
      <div
        v-for="event in store.recentEvents"
        :key="event.id"
        class="log-entry mb-1"
        :class="event.type"
      >
        <span class="text-grey-darken-1 text-caption mr-2">
          [{{ formatTime(event.timestamp) }}]
        </span>
        <span class="text-body-2">{{ event.message }}</span>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { useMerchantStore } from '~/entities/merchant/store';

const store = useMerchantStore();

const formatTime = (ts: number) => {
  return new Date(ts).toLocaleTimeString([], {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};
</script>

<style scoped>
.event-log-card {
  border: 1px solid #333;
}

.log-container {
  height: 150px;
  overflow-y: auto;
  font-family: 'Courier New', monospace;
  background: rgba(0, 0, 0, 0.3);
}

.log-entry.info {
  color: #aaa;
}
.log-entry.success {
  color: #81c784;
}
.log-entry.warning {
  color: #e57373;
}
.log-entry.error {
  color: #f44336;
}

/* Custom scrollbar */
.log-container::-webkit-scrollbar {
  width: 6px;
}
.log-container::-webkit-scrollbar-track {
  background: #111;
}
.log-container::-webkit-scrollbar-thumb {
  background: #333;
  border-radius: 3px;
}
</style>
