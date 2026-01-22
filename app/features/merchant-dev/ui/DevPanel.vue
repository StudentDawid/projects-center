<template>
  <!-- Toggle Button - Only visible in dev mode -->
  <v-btn
    v-if="isDev"
    icon
    size="small"
    color="warning"
    class="dev-toggle-btn"
    style="position: fixed; top: 16px; right: 16px; z-index: 9999;"
    @click="toggle"
    title="Panel Deweloperski (`)"
  >
    <v-icon>mdi-bug</v-icon>
  </v-btn>

  <!-- Dev Panel Overlay -->
  <v-dialog v-model="isOpen" max-width="700" scrollable>
    <v-card class="dev-panel" color="#1a1a1a">
      <v-card-title class="d-flex align-center justify-space-between bg-warning-darken-1">
        <span class="d-flex align-center gap-2 text-white">
          <v-icon color="white">mdi-bug</v-icon>
          Panel Deweloperski - Merchant Idle
        </span>
        <v-btn icon variant="text" @click="toggle">
          <v-icon color="white">mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-4">
        <!-- Gold Controls -->
        <div class="section mb-4">
          <h3 class="section-title mb-2 text-amber-lighten-2">
            <v-icon size="small" class="mr-1">mdi-coins</v-icon>
            Złoto
          </h3>
          <div class="d-flex flex-wrap gap-2 mb-2">
            <v-btn
              v-for="amount in goldAmounts"
              :key="amount"
              size="small"
              color="amber-darken-3"
              variant="outlined"
              @click="addGold(amount)"
            >
              +{{ formatAmount(amount) }}
            </v-btn>
          </div>
          <v-text-field
            v-model.number="customGoldAmount"
            label="Custom Amount"
            type="number"
            density="compact"
            variant="outlined"
            class="mt-2"
            hide-details
          >
            <template #append>
              <v-btn
                size="small"
                color="amber-darken-3"
                @click="addGold(customGoldAmount || 0)"
              >
                Add
              </v-btn>
            </template>
          </v-text-field>
        </div>

        <v-divider class="my-4" />

        <!-- Workers -->
        <div class="section mb-4">
          <h3 class="section-title mb-2 text-amber-lighten-2">
            <v-icon size="small" class="mr-1">mdi-account-group</v-icon>
            Pracownicy
          </h3>
          <div class="d-flex flex-wrap gap-2">
            <v-btn
              size="small"
              color="blue-darken-2"
              variant="outlined"
              @click="hireAllWorkers(1)"
            >
              +1 Each
            </v-btn>
            <v-btn
              size="small"
              color="blue-darken-2"
              variant="outlined"
              @click="hireAllWorkers(10)"
            >
              +10 Each
            </v-btn>
            <v-btn
              size="small"
              color="blue-darken-2"
              variant="outlined"
              @click="hireAllWorkers(100)"
            >
              +100 Each
            </v-btn>
          </div>
        </div>

        <v-divider class="my-4" />

        <!-- Upgrades & Cities -->
        <div class="section mb-4">
          <h3 class="section-title mb-2 text-amber-lighten-2">
            <v-icon size="small" class="mr-1">mdi-update</v-icon>
            Odblokowania
          </h3>
          <div class="d-flex flex-wrap gap-2">
            <v-btn
              size="small"
              color="green-darken-2"
              variant="outlined"
              @click="unlockAllCities"
            >
              Odblokuj Wszystkie Miasta
            </v-btn>
            <v-btn
              size="small"
              color="green-darken-2"
              variant="outlined"
              @click="buyAllUpgrades"
            >
              Kup Wszystkie Ulepszenia
            </v-btn>
          </div>
        </div>

        <v-divider class="my-4" />

        <!-- Reputation -->
        <div class="section mb-4">
          <h3 class="section-title mb-2 text-amber-lighten-2">
            <v-icon size="small" class="mr-1">mdi-star</v-icon>
            Reputacja
          </h3>
          <div class="d-flex flex-wrap gap-2 mb-2">
            <v-btn
              v-for="amount in reputationAmounts"
              :key="amount"
              size="small"
              color="purple-darken-2"
              variant="outlined"
              @click="setReputation(amount)"
            >
              {{ formatAmount(amount) }}
            </v-btn>
          </div>
          <v-text-field
            v-model.number="customReputationAmount"
            label="Custom Reputation"
            type="number"
            density="compact"
            variant="outlined"
            class="mt-2"
            hide-details
          >
            <template #append>
              <v-btn
                size="small"
                color="purple-darken-2"
                @click="setReputation(customReputationAmount || 0)"
              >
                Set
              </v-btn>
            </template>
          </v-text-field>
        </div>

        <v-divider class="my-4" />

        <!-- Reset -->
        <div class="section mb-4">
          <h3 class="section-title mb-2 text-red-lighten-2">
            <v-icon size="small" class="mr-1">mdi-alert</v-icon>
            Reset
          </h3>
          <v-btn
            color="red-darken-2"
            variant="outlined"
            @click="resetProgress"
          >
            <v-icon start>mdi-delete</v-icon>
            Reset Całego Postępu
          </v-btn>
        </div>

        <v-divider class="my-4" />

        <!-- Stats Display -->
        <div class="section">
          <h3 class="section-title mb-2 text-amber-lighten-2">
            <v-icon size="small" class="mr-1">mdi-information</v-icon>
            Statystyki
          </h3>
          <div class="text-caption text-grey">
            <div>Złoto: {{ store.formatNumber(store.gold) }}</div>
            <div>Lifetime Gold: {{ store.formatNumber(store.lifetimeGold) }}</div>
            <div>GPS: {{ store.formatNumber(store.goldPerSecond) }}</div>
            <div>Reputacja: {{ store.formatNumber(store.reputation) }}</div>
            <div>Prestiż Gain: {{ store.formatNumber(store.prestigeGain) }}</div>
            <div>Total Clicks: {{ store.stats.totalClicks }}</div>
            <div>Prestiż Count: {{ store.stats.prestigeCount }}</div>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useMerchantStore } from '~/entities/merchant';
import { bn } from '~/shared/lib/big-number';

const store = useMerchantStore();
const isOpen = ref(false);
const customGoldAmount = ref<number>(1000000);
const customReputationAmount = ref<number>(10);

// Check if in dev mode
const isDev = import.meta.dev;

const goldAmounts = [1000, 10000, 100000, 1000000, 10000000, 1e9, 1e12];
const reputationAmounts = [1, 5, 10, 50, 100, 500];

function toggle() {
  isOpen.value = !isOpen.value;
}

function addGold(amount: number) {
  if (amount <= 0) return;
  store.devAddGold(amount);
}

function hireAllWorkers(count: number) {
  store.devHireAllWorkers(count);
}

function unlockAllCities() {
  store.devUnlockAllCities();
}

function buyAllUpgrades() {
  store.devBuyAllUpgrades();
}

function setReputation(amount: number) {
  if (amount < 0) return;
  store.devSetReputation(amount);
}

function resetProgress() {
  if (confirm('Na pewno chcesz zresetować cały postęp? Wszystkie dane zostaną utracone!')) {
    store.devResetProgress();
    isOpen.value = false;
  }
}

function formatAmount(amount: number): string {
  if (amount >= 1e12) return `${amount / 1e12}T`;
  if (amount >= 1e9) return `${amount / 1e9}B`;
  if (amount >= 1e6) return `${amount / 1e6}M`;
  if (amount >= 1e3) return `${amount / 1e3}K`;
  return amount.toString();
}

// Keyboard shortcut - backtick key
if (import.meta.client && isDev) {
  window.addEventListener('keydown', (e) => {
    if (e.key === '`' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      toggle();
    }
  });
}
</script>

<style scoped>
.dev-panel {
  background: #1a1a1a !important;
}

.section {
  padding: 8px 0;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.dev-toggle-btn {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}
</style>
