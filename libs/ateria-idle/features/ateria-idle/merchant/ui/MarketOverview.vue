<script setup lang="ts">
/**
 * Market Overview - Shows dynamic market conditions and events
 */

import { computed } from 'vue';
import { useAteriaMerchantStore } from '../model/merchant.store';
import { MARKET_EVENTS, ACHIEVEMENT_CATEGORIES } from '../../data';

const merchantStore = useAteriaMerchantStore();

// Computed
const activeEvents = computed(() => merchantStore.activeMarketModifiers);

const sentiment = computed(() => {
  const s = merchantStore.currentMarketSentiment;
  return {
    value: s,
    label: s === 'bullish' ? 'Hossa' : s === 'bearish' ? 'Bessa' : 'Stabilny',
    icon: s === 'bullish' ? 'mdi-trending-up' : s === 'bearish' ? 'mdi-trending-down' : 'mdi-minus',
    color: s === 'bullish' ? 'success' : s === 'bearish' ? 'error' : 'grey',
  };
});

const volatility = computed(() => {
  const v = merchantStore.marketVolatility;
  return {
    value: v,
    label: v === 'high' ? 'Wysoka' : v === 'medium' ? 'Średnia' : 'Niska',
    color: v === 'high' ? 'error' : v === 'medium' ? 'warning' : 'success',
  };
});

const haggleStats = computed(() => ({
  successRate: merchantStore.haggleSuccessRate,
  totalHaggles: merchantStore.haggleHistory.length,
  recentSuccess: merchantStore.haggleHistory.slice(-5).filter(h => h.success).length,
}));

function getEventTimeRemaining(modifier: { startTime: number; duration: number }): string {
  const elapsed = Date.now() - modifier.startTime;
  const remaining = (modifier.duration * 100) - elapsed; // Convert ticks to ms
  
  if (remaining <= 0) return 'Kończy się...';
  
  const seconds = Math.floor(remaining / 1000);
  const minutes = Math.floor(seconds / 60);
  
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

function getPriceModifierLabel(modifier: number): string {
  const percent = Math.round((modifier - 1) * 100);
  if (percent > 0) return `+${percent}%`;
  if (percent < 0) return `${percent}%`;
  return '0%';
}
</script>

<template>
  <div class="market-overview">
    <!-- Market Status Header -->
    <v-card class="mb-4">
      <v-card-text>
        <v-row align="center">
          <!-- Market Sentiment -->
          <v-col
            cols="6"
            md="3"
          >
            <div class="stat-box text-center pa-3 rounded">
              <v-icon
                :color="sentiment.color"
                size="32"
                class="mb-1"
              >
                {{ sentiment.icon }}
              </v-icon>
              <div
                class="text-h6 font-weight-bold"
                :class="`text-${sentiment.color}`"
              >
                {{ sentiment.label }}
              </div>
              <div class="text-caption text-medium-emphasis">
                Nastrój rynku
              </div>
            </div>
          </v-col>

          <!-- Volatility -->
          <v-col
            cols="6"
            md="3"
          >
            <div class="stat-box text-center pa-3 rounded">
              <v-icon
                :color="volatility.color"
                size="32"
                class="mb-1"
              >
                mdi-chart-bell-curve
              </v-icon>
              <div
                class="text-h6 font-weight-bold"
                :class="`text-${volatility.color}`"
              >
                {{ volatility.label }}
              </div>
              <div class="text-caption text-medium-emphasis">
                Zmienność
              </div>
            </div>
          </v-col>

          <!-- Haggle Success Rate -->
          <v-col
            cols="6"
            md="3"
          >
            <div class="stat-box text-center pa-3 rounded">
              <v-icon
                color="amber"
                size="32"
                class="mb-1"
              >
                mdi-handshake
              </v-icon>
              <div class="text-h6 font-weight-bold text-amber">
                {{ haggleStats.successRate }}%
              </div>
              <div class="text-caption text-medium-emphasis">
                Skuteczność targowania
              </div>
            </div>
          </v-col>

          <!-- Total Haggles -->
          <v-col
            cols="6"
            md="3"
          >
            <div class="stat-box text-center pa-3 rounded">
              <v-icon
                color="primary"
                size="32"
                class="mb-1"
              >
                mdi-counter
              </v-icon>
              <div class="text-h6 font-weight-bold text-primary">
                {{ haggleStats.totalHaggles }}
              </div>
              <div class="text-caption text-medium-emphasis">
                Negocjacji
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Active Market Events -->
    <v-card v-if="activeEvents.length > 0">
      <v-card-title class="d-flex align-center">
        <v-icon
          color="warning"
          class="mr-2"
        >
          mdi-lightning-bolt
        </v-icon>
        Aktywne Wydarzenia Rynkowe
        <v-chip
          size="small"
          color="warning"
          class="ml-2"
        >
          {{ activeEvents.length }}
        </v-chip>
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col
            v-for="event in activeEvents"
            :key="event.id"
            cols="12"
            md="6"
          >
            <v-card
              :color="event.priceModifier > 1 ? 'success' : event.priceModifier < 1 ? 'error' : 'warning'"
              variant="tonal"
            >
              <v-card-text>
                <div class="d-flex align-center mb-2">
                  <v-icon
                    size="28"
                    class="mr-2"
                  >
                    {{ event.icon }}
                  </v-icon>
                  <div class="flex-grow-1">
                    <div class="text-body-1 font-weight-medium">
                      {{ event.name }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      {{ event.description }}
                    </div>
                  </div>
                </div>

                <div class="d-flex justify-space-between align-center mt-2">
                  <div class="d-flex gap-2">
                    <v-chip
                      size="small"
                      :color="event.priceModifier > 1 ? 'success' : 'error'"
                    >
                      Ceny: {{ getPriceModifierLabel(event.priceModifier) }}
                    </v-chip>
                    <v-chip
                      size="small"
                      :color="event.demandModifier > 1 ? 'success' : 'error'"
                    >
                      Popyt: {{ getPriceModifierLabel(event.demandModifier) }}
                    </v-chip>
                  </div>
                  <v-chip
                    size="small"
                    color="grey"
                  >
                    <v-icon
                      start
                      size="14"
                    >
                      mdi-clock
                    </v-icon>
                    {{ getEventTimeRemaining(event) }}
                  </v-chip>
                </div>

                <div
                  v-if="event.affectedCategories.length > 0"
                  class="mt-2"
                >
                  <div class="text-caption text-medium-emphasis mb-1">
                    Dotyczy:
                  </div>
                  <div class="d-flex flex-wrap gap-1">
                    <v-chip
                      v-for="cat in event.affectedCategories"
                      :key="cat"
                      size="x-small"
                      variant="outlined"
                    >
                      {{ cat === 'all' ? 'Wszystko' : cat }}
                    </v-chip>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- No Events -->
    <v-card v-else>
      <v-card-text class="text-center pa-6">
        <v-icon
          size="48"
          color="grey"
          class="mb-3"
        >
          mdi-weather-sunny
        </v-icon>
        <div class="text-h6 text-medium-emphasis">
          Rynek jest spokojny
        </div>
        <div class="text-body-2 text-medium-emphasis">
          Brak aktywnych wydarzeń rynkowych. Ceny są stabilne.
        </div>
      </v-card-text>
    </v-card>

    <!-- Market Tips -->
    <v-card class="mt-4">
      <v-card-title>
        <v-icon
          class="mr-2"
          color="info"
        >
          mdi-lightbulb
        </v-icon>
        Porady Handlowe
      </v-card-title>
      <v-card-text>
        <v-list density="compact">
          <v-list-item>
            <template #prepend>
              <v-icon color="success">
                mdi-arrow-up
              </v-icon>
            </template>
            <v-list-item-title>Hossa</v-list-item-title>
            <v-list-item-subtitle>Ceny rosną - dobry czas na sprzedaż!</v-list-item-subtitle>
          </v-list-item>
          <v-list-item>
            <template #prepend>
              <v-icon color="error">
                mdi-arrow-down
              </v-icon>
            </template>
            <v-list-item-title>Bessa</v-list-item-title>
            <v-list-item-subtitle>Ceny spadają - rozważ wstrzymanie sprzedaży</v-list-item-subtitle>
          </v-list-item>
          <v-list-item>
            <template #prepend>
              <v-icon color="warning">
                mdi-chart-bell-curve
              </v-icon>
            </template>
            <v-list-item-title>Wysoka zmienność</v-list-item-title>
            <v-list-item-subtitle>Duże ryzyko, ale i szansa na zyski</v-list-item-subtitle>
          </v-list-item>
          <v-list-item>
            <template #prepend>
              <v-icon color="amber">
                mdi-handshake
              </v-icon>
            </template>
            <v-list-item-title>Targowanie</v-list-item-title>
            <v-list-item-subtitle>Dopasuj taktykę do typu klienta</v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </div>
</template>

<style scoped>
.stat-box {
  background: rgba(255, 255, 255, 0.03);
}
</style>
