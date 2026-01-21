<template>
  <v-card color="#111" class="mt-4 stats-card" elevation="8">
    <v-card-title class="text-h5 text-blue-grey-lighten-2 d-flex align-center">
      <v-icon color="blue-grey-lighten-2" class="mr-3">mdi-chart-line</v-icon>
      Empire Ledger
    </v-card-title>

    <v-card-text>
      <v-row>
        <!-- General Time Stats -->
        <v-col cols="12">
          <div class="stats-group">
            <h3 class="text-overline text-grey-darken-1 mb-2">
              Temporal Records
            </h3>
            <v-row dense>
              <v-col cols="6">
                <StatItem
                  label="Total Time"
                  :value="formatDuration(totalTime)"
                />
              </v-col>
              <v-col cols="6">
                <StatItem
                  label="Current Session"
                  :value="formatDuration(sessionTime)"
                />
              </v-col>
            </v-row>
          </div>
        </v-col>

        <!-- Wealth Sources -->
        <v-col cols="12">
          <v-divider class="my-4" />
          <div class="stats-group">
            <h3 class="text-overline text-grey-darken-1 mb-2">
              Wealth Distribution
            </h3>
            <v-list bg-color="transparent" density="compact" class="pa-0">
              <v-list-item class="px-0">
                <template #prepend>
                  <v-icon size="small" color="amber-darken-1"
                    >mdi-cursor-default-click</v-icon
                  >
                </template>
                <v-list-item-title class="text-body-2"
                  >Manual Clicks</v-list-item-title
                >
                <template #append>
                  <span class="mono-font">{{ store.stats.totalClicks }}</span>
                </template>
              </v-list-item>

              <v-list-item class="px-0">
                <template #prepend>
                  <v-icon size="small" color="amber-darken-2">mdi-gold</v-icon>
                </template>
                <v-list-item-title class="text-body-2"
                  >Gold from Clicks</v-list-item-title
                >
                <template #append>
                  <span class="mono-font">{{
                    store.formatNumber(store.stats.totalGoldFromClicks)
                  }}</span>
                </template>
              </v-list-item>

              <v-list-item class="px-0">
                <template #prepend>
                  <v-icon size="small" color="blue-darken-1"
                    >mdi-caravan</v-icon
                  >
                </template>
                <v-list-item-title class="text-body-2"
                  >Gold from Trade</v-list-item-title
                >
                <template #append>
                  <span class="mono-font">{{
                    store.formatNumber(store.stats.totalGoldFromTrade)
                  }}</span>
                </template>
              </v-list-item>

              <v-list-item class="px-0">
                <template #prepend>
                  <v-icon size="small" color="deep-purple-lighten-2"
                    >mdi-infinity</v-icon
                  >
                </template>
                <v-list-item-title class="text-body-2"
                  >Lifetime Total</v-list-item-title
                >
                <template #append>
                  <span class="mono-font text-amber">{{
                    store.formatNumber(store.lifetimeGold)
                  }}</span>
                </template>
              </v-list-item>
            </v-list>
          </div>
        </v-col>

        <!-- Prestige Stats -->
        <v-col cols="12">
          <v-divider class="my-4" />
          <div class="stats-group">
            <h3 class="text-overline text-grey-darken-1 mb-2">
              Guild Standing
            </h3>
            <v-row dense>
              <v-col cols="6">
                <StatItem
                  label="Ascensions"
                  :value="store.stats.prestigeCount.toString()"
                />
              </v-col>
              <v-col cols="6">
                <StatItem
                  label="Current Reputation"
                  :value="store.formatNumber(store.reputation)"
                />
              </v-col>
            </v-row>
          </div>
        </v-col>

        <!-- Ratios -->
        <v-col cols="12">
          <v-divider class="my-4" />
          <div class="stats-group">
            <h3 class="text-overline text-grey-darken-1 mb-2">
              Efficiency Ratios
            </h3>
            <div class="d-flex justify-space-between align-center mb-1">
              <span class="text-caption text-grey">Click Contribution</span>
              <span class="text-caption mono-font">{{ clickRatio }}%</span>
            </div>
            <v-progress-linear
              :model-value="clickRatio"
              color="amber-darken-2"
              height="8"
              rounded
            />
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useMerchantStore } from '~/entities/merchant/store';
import StatItem from './StatItem.vue';

const store = useMerchantStore();
const now = ref(Date.now());

let timer: ReturnType<typeof setInterval> | null = null;
onMounted(() => {
  timer = setInterval(() => {
    now.value = Date.now();
  }, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

const totalTime = computed(() => now.value - store.stats.startTime);
const sessionTime = computed(() => now.value - store.stats.lastPrestigeTime);

const clickRatio = computed(() => {
  if (store.lifetimeGold.eq(0)) return 0;
  return Math.min(
    100,
    store.stats.totalGoldFromClicks.div(store.lifetimeGold).mul(100).toNumber()
  ).toFixed(1);
});

const formatDuration = (ms: number) => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};
</script>

<style scoped>
.stats-card {
  border: 1px solid rgba(255, 255, 255, 0.05);
  background: linear-gradient(135deg, #111 0%, #080808 100%);
}

.mono-font {
  font-family: 'Roboto Mono', monospace !important;
}

.stats-group {
  padding: 4px 0;
}
</style>
