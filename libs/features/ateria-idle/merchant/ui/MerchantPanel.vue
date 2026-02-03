<script setup lang="ts">
/**
 * Merchant Panel - main UI for the Merchant path
 */

import { computed, ref } from 'vue';
import { useAteriaMerchantStore } from '../model/merchant.store';
import { useAteriaResourcesStore } from '../../core/model/resources.store';
import { formatNumber } from '@libs/shared/lib/big-number';
import {
  REPUTATION_NAMES,
  REPUTATION_COLORS,
  CUSTOMER_ICONS,
  CUSTOMER_COLORS,
} from '../../data/merchant.data';
import { getItem } from '../../data/items.data';
import type { TradeRoute, Customer, ShopDisplayItem } from '@libs/entities/ateria-idle/merchant';
import AteriaHaggleDialog from './HaggleDialog.vue';
import AteriaMarketOverview from './MarketOverview.vue';

const merchantStore = useAteriaMerchantStore();
const resourcesStore = useAteriaResourcesStore();

// UI State
const activeTab = ref<'shop' | 'routes' | 'decorations' | 'market'>('shop');
const sendCaravanDialog = ref(false);
const selectedRoute = ref<TradeRoute | null>(null);
const showHaggleDialog = ref(false);

// Computed
const stats = computed(() => merchantStore.stats);

// Helpers
function getItemName(itemId: string): string {
  return getItem(itemId)?.name || itemId;
}

function openSendCaravanDialog(route: TradeRoute) {
  selectedRoute.value = route;
  sendCaravanDialog.value = true;
}

function sendCaravan() {
  if (!selectedRoute.value) return;

  const idleCaravan = merchantStore.idleCaravans[0];
  if (!idleCaravan) return;

  // Prepare cargo from all storage items
  const cargo = merchantStore.shop.storage.map(item => ({
    itemId: item.itemId,
    quantity: item.quantity,
    buyPrice: item.averageBuyPrice,
  }));

  if (cargo.length === 0) return;

  merchantStore.startTradeRoute(idleCaravan.id, selectedRoute.value.id, cargo, false);
  sendCaravanDialog.value = false;
  selectedRoute.value = null;
}

function startHaggle(customer: Customer) {
  const displayedItem = merchantStore.shop.displayedItems[0];
  if (!displayedItem) return;
  
  if (merchantStore.startHaggle(customer, displayedItem)) {
    showHaggleDialog.value = true;
  }
}

function canHaggle(customer: Customer): boolean {
  return (customer.state === 'browsing' || customer.state === 'interested') &&
         merchantStore.shop.displayedItems.length > 0 &&
         !merchantStore.isHaggling;
}

function moveAllToDisplay(itemId: string) {
  const storageItem = merchantStore.shop.storage.find(s => s.itemId === itemId);
  if (storageItem) {
    merchantStore.moveToDisplay(itemId, storageItem.quantity, 1.5);
  }
}

const reputationProgress = computed(() => {
  const thresholds = [0, 10, 25, 50, 75, 95, 100];
  const currentTier = ['unknown', 'known', 'trusted', 'respected', 'renowned', 'legendary'].indexOf(stats.value.reputationTier);
  const nextThreshold = thresholds[currentTier + 1] || 100;
  const prevThreshold = thresholds[currentTier] || 0;
  return ((stats.value.reputation - prevThreshold) / (nextThreshold - prevThreshold)) * 100;
});
</script>

<template>
  <div class="merchant-panel">
    <v-row>
      <!-- Left Column: Stats & Quick Info -->
      <v-col
        cols="12"
        md="4"
      >
        <v-card class="stats-card mb-4">
          <v-card-title class="d-flex align-center py-3">
            <v-icon
              class="mr-2"
              color="amber"
            >
              mdi-cart
            </v-icon>
            <span>Handlarz</span>
            <v-chip
              class="ml-2"
              size="small"
              color="amber"
            >
              Lvl {{ stats.level }}
            </v-chip>
          </v-card-title>

          <v-card-text>
            <!-- XP Progress -->
            <div class="mb-4">
              <div class="d-flex justify-space-between text-caption mb-1">
                <span>Doświadczenie</span>
                <span>{{ formatNumber(stats.xp) }} / {{ formatNumber(stats.xpToNextLevel) }}</span>
              </div>
              <v-progress-linear
                :model-value="merchantStore.xpProgress * 100"
                color="amber"
                height="8"
                rounded
              />
            </div>

            <!-- Reputation -->
            <div class="mb-4">
              <div class="d-flex justify-space-between text-caption mb-1">
                <span>Reputacja</span>
                <span :style="{ color: merchantStore.reputationTierData.color }">
                  {{ merchantStore.reputationTierData.name }}
                </span>
              </div>
              <v-progress-linear
                :model-value="reputationProgress"
                :color="merchantStore.reputationTierData.color"
                height="8"
                rounded
              />
              <div class="text-caption text-medium-emphasis text-right mt-1">
                {{ stats.reputation.toFixed(1) }} / 100
              </div>
            </div>

            <!-- Stats Grid -->
            <v-divider class="mb-3" />
            <div class="text-subtitle-2 mb-2">
              Umiejętności
            </div>

            <v-row
              dense
              class="text-body-2"
            >
              <v-col cols="6">
                <div class="d-flex justify-space-between">
                  <span class="text-medium-emphasis">
                    <v-icon
                      size="14"
                      class="mr-1"
                    >
                      mdi-account-voice
                    </v-icon>
                    Charyzma
                  </span>
                  <span class="font-weight-medium">{{ stats.charisma }}</span>
                </div>
              </v-col>
              <v-col cols="6">
                <div class="d-flex justify-space-between">
                  <span class="text-medium-emphasis">
                    <v-icon
                      size="14"
                      class="mr-1"
                    >
                      mdi-handshake
                    </v-icon>
                    Negocjacje
                  </span>
                  <span class="font-weight-medium">{{ stats.negotiation }}</span>
                </div>
              </v-col>
              <v-col cols="6">
                <div class="d-flex justify-space-between">
                  <span class="text-medium-emphasis">
                    <v-icon
                      size="14"
                      class="mr-1"
                    >
                      mdi-magnify
                    </v-icon>
                    Wycena
                  </span>
                  <span class="font-weight-medium">{{ stats.appraisal }}</span>
                </div>
              </v-col>
              <v-col cols="6">
                <div class="d-flex justify-space-between">
                  <span class="text-medium-emphasis">
                    <v-icon
                      size="14"
                      class="mr-1"
                    >
                      mdi-cash-multiple
                    </v-icon>
                    Bonus złota
                  </span>
                  <span class="font-weight-medium text-amber">
                    +{{ ((stats.goldMultiplier - 1) * 100).toFixed(0) }}%
                  </span>
                </div>
              </v-col>
            </v-row>

            <!-- Session Stats -->
            <v-divider class="my-3" />
            <div class="text-subtitle-2 mb-2">
              Sesja
            </div>
            <div class="d-flex justify-space-between text-body-2">
              <span class="text-medium-emphasis">Zarobione złoto</span>
              <span class="font-weight-medium text-amber">
                {{ formatNumber(merchantStore.sessionGoldEarned) }}
              </span>
            </div>
            <div class="d-flex justify-space-between text-body-2">
              <span class="text-medium-emphasis">Sprzedane przedmioty</span>
              <span class="font-weight-medium">{{ merchantStore.sessionItemsSold }}</span>
            </div>
            <div class="d-flex justify-space-between text-body-2">
              <span class="text-medium-emphasis">Obsłużeni klienci</span>
              <span class="font-weight-medium">{{ merchantStore.sessionCustomersServed }}</span>
            </div>
            <div class="d-flex justify-space-between text-body-2">
              <span class="text-medium-emphasis">Wyprawy handlowe</span>
              <span class="font-weight-medium">{{ merchantStore.sessionTradesCompleted }}</span>
            </div>
          </v-card-text>
        </v-card>

        <!-- Caravans Quick View -->
        <v-card class="caravans-card">
          <v-card-title class="d-flex align-center py-3">
            <v-icon
              class="mr-2"
              color="brown"
            >
              mdi-truck-fast
            </v-icon>
            <span class="text-subtitle-1">Karawany</span>
            <v-chip
              class="ml-2"
              size="x-small"
              :color="merchantStore.activeCaravans.length > 0 ? 'success' : 'grey'"
            >
              {{ merchantStore.activeCaravans.length }} / {{ merchantStore.maxCaravans }}
            </v-chip>
          </v-card-title>

          <v-card-text class="pt-0">
            <div
              v-if="merchantStore.caravans.length === 0"
              class="text-center py-4 text-medium-emphasis"
            >
              <v-icon
                size="32"
                class="mb-2 opacity-50"
              >
                mdi-truck-outline
              </v-icon>
              <div class="text-body-2">
                Brak karawan
              </div>
            </div>

            <div
              v-for="caravan in merchantStore.caravans"
              :key="caravan.id"
              class="caravan-item pa-2 rounded mb-2"
              :class="{ 'caravan-active': caravan.state === 'traveling' || caravan.state === 'returning' }"
            >
              <div class="d-flex align-center mb-1">
                <v-icon
                  size="18"
                  :color="caravan.state === 'idle' ? 'grey' : 'success'"
                  class="mr-2"
                >
                  {{ caravan.state === 'idle' ? 'mdi-truck' : 'mdi-truck-fast' }}
                </v-icon>
                <span class="text-body-2 font-weight-medium">{{ caravan.name }}</span>
              </div>

              <div
                v-if="caravan.state === 'traveling' || caravan.state === 'returning'"
                class="mt-2"
              >
                <v-progress-linear
                  :model-value="caravan.progress * 100"
                  color="success"
                  height="6"
                  rounded
                />
                <div class="text-caption text-medium-emphasis mt-1">
                  {{ caravan.state === 'traveling' ? 'W drodze' : 'Powrót' }}
                  ({{ Math.floor(caravan.progress * 100) }}%)
                </div>
              </div>

              <div
                v-else
                class="text-caption text-medium-emphasis"
              >
                Gotowa do wyprawy
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Middle & Right: Main Content Area -->
      <v-col
        cols="12"
        md="8"
      >
        <!-- Tabs -->
        <v-tabs
          v-model="activeTab"
          color="amber"
          density="compact"
          class="mb-4"
        >
          <v-tab value="shop">
            <v-icon start>
              mdi-store
            </v-icon>
            Sklep
          </v-tab>
          <v-tab value="routes">
            <v-icon start>
              mdi-map-marker-path
            </v-icon>
            Szlaki Handlowe
          </v-tab>
          <v-tab value="decorations">
            <v-icon start>
              mdi-lamp
            </v-icon>
            Dekoracje
          </v-tab>
          <v-tab value="market">
            <v-icon start>
              mdi-chart-line
            </v-icon>
            Rynek
            <v-badge
              v-if="merchantStore.activeMarketModifiers.length > 0"
              :content="merchantStore.activeMarketModifiers.length"
              color="warning"
              class="ml-1"
            />
          </v-tab>
        </v-tabs>

        <!-- Shop Tab -->
        <div v-if="activeTab === 'shop'">
          <v-row>
            <!-- Displayed Items -->
            <v-col cols="12">
              <v-card>
                <v-card-title class="d-flex align-center py-3">
                  <v-icon
                    class="mr-2"
                    color="primary"
                  >
                    mdi-storefront
                  </v-icon>
                  <span class="text-subtitle-1">Wystawa</span>
                  <v-chip
                    class="ml-2"
                    size="x-small"
                    color="primary"
                  >
                    {{ merchantStore.shop.displayedItems.length }} / {{ merchantStore.shop.maxDisplaySlots }}
                  </v-chip>
                </v-card-title>

                <v-card-text>
                  <div
                    v-if="merchantStore.shop.displayedItems.length === 0"
                    class="text-center py-6 text-medium-emphasis"
                  >
                    <v-icon
                      size="48"
                      class="mb-2 opacity-50"
                    >
                      mdi-package-variant
                    </v-icon>
                    <div class="text-body-2">
                      Brak wystawionych przedmiotów
                    </div>
                    <div class="text-caption">
                      Przenieś przedmioty z magazynu na wystawę
                    </div>
                  </div>

                  <div
                    v-else
                    class="display-grid"
                  >
                    <div
                      v-for="item in merchantStore.shop.displayedItems"
                      :key="item.itemId"
                      class="display-item pa-3 rounded"
                    >
                      <div class="d-flex align-center justify-space-between mb-2">
                        <span class="text-body-2 font-weight-medium">{{ getItemName(item.itemId) }}</span>
                        <v-chip
                          size="x-small"
                          color="amber"
                        >
                          x{{ item.quantity }}
                        </v-chip>
                      </div>
                      <div class="text-h6 text-amber font-weight-bold">
                        {{ item.currentPrice }} <v-icon size="16">mdi-currency-usd</v-icon>
                      </div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Customers -->
            <v-col
              cols="12"
              md="6"
            >
              <v-card>
                <v-card-title class="d-flex align-center py-3">
                  <v-icon
                    class="mr-2"
                    color="success"
                  >
                    mdi-account-group
                  </v-icon>
                  <span class="text-subtitle-1">Klienci</span>
                  <v-chip
                    class="ml-2"
                    size="x-small"
                    :color="merchantStore.customers.length > 0 ? 'success' : 'grey'"
                  >
                    {{ merchantStore.customers.length }}
                  </v-chip>
                </v-card-title>

                <v-card-text>
                  <div
                    v-if="merchantStore.customers.length === 0"
                    class="text-center py-4 text-medium-emphasis"
                  >
                    <v-icon
                      size="32"
                      class="mb-2 opacity-50"
                    >
                      mdi-account-off
                    </v-icon>
                    <div class="text-body-2">
                      Brak klientów
                    </div>
                    <div class="text-caption">
                      Wystaw przedmioty, aby przyciągnąć klientów
                    </div>
                  </div>

                  <div
                    v-for="customer in merchantStore.customers"
                    :key="customer.id"
                    class="customer-item pa-2 rounded mb-2"
                  >
                    <div class="d-flex align-center">
                      <v-avatar
                        size="32"
                        :color="CUSTOMER_COLORS[customer.type]"
                        class="mr-2"
                      >
                        <v-icon
                          size="18"
                          color="white"
                        >
                          {{ CUSTOMER_ICONS[customer.type] }}
                        </v-icon>
                      </v-avatar>
                      <div class="flex-grow-1">
                        <div class="text-body-2 font-weight-medium">
                          {{ customer.name }}
                        </div>
                        <div class="text-caption text-medium-emphasis">
                          Budżet: {{ customer.budget }} złota
                        </div>
                      </div>
                      <v-btn
                        v-if="canHaggle(customer)"
                        size="x-small"
                        color="amber"
                        variant="tonal"
                        class="mr-2"
                        @click="startHaggle(customer)"
                      >
                        <v-icon size="14">
                          mdi-handshake
                        </v-icon>
                      </v-btn>
                      <v-progress-circular
                        :model-value="(customer.currentPatience / customer.patience) * 100"
                        :color="customer.currentPatience > customer.patience * 0.3 ? 'success' : 'warning'"
                        size="24"
                        width="3"
                      />
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Storage -->
            <v-col
              cols="12"
              md="6"
            >
              <v-card>
                <v-card-title class="d-flex align-center py-3">
                  <v-icon
                    class="mr-2"
                    color="brown"
                  >
                    mdi-warehouse
                  </v-icon>
                  <span class="text-subtitle-1">Magazyn</span>
                  <v-chip
                    class="ml-2"
                    size="x-small"
                    color="brown"
                  >
                    {{ merchantStore.shop.storage.length }} / {{ merchantStore.effectiveStorageSlots }}
                  </v-chip>
                </v-card-title>

                <v-card-text>
                  <div
                    v-if="merchantStore.shop.storage.length === 0"
                    class="text-center py-4 text-medium-emphasis"
                  >
                    <v-icon
                      size="32"
                      class="mb-2 opacity-50"
                    >
                      mdi-package-variant-closed
                    </v-icon>
                    <div class="text-body-2">
                      Magazyn pusty
                    </div>
                    <div class="text-caption">
                      Zdobywaj łupy z walki lub kupuj towary
                    </div>
                  </div>

                  <div
                    v-for="item in merchantStore.shop.storage"
                    :key="item.itemId"
                    class="storage-item d-flex align-center justify-space-between pa-2 rounded mb-1"
                  >
                    <div>
                      <span class="text-body-2">{{ getItemName(item.itemId) }}</span>
                      <span class="text-caption text-medium-emphasis ml-2">x{{ item.quantity }}</span>
                    </div>
                    <div class="d-flex ga-1">
                      <v-btn
                        size="x-small"
                        variant="tonal"
                        color="primary"
                        @click="merchantStore.moveToDisplay(item.itemId, 1, 1.5)"
                      >
                        +1
                      </v-btn>
                      <v-btn
                        v-if="item.quantity > 1"
                        size="x-small"
                        variant="tonal"
                        color="success"
                        @click="moveAllToDisplay(item.itemId)"
                      >
                        Wszystko
                      </v-btn>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- Trade Routes Tab -->
        <div v-if="activeTab === 'routes'">
          <v-card>
            <v-card-title class="d-flex align-center py-3">
              <v-icon
                class="mr-2"
                color="info"
              >
                mdi-map-marker-path
              </v-icon>
              <span class="text-subtitle-1">Dostępne Szlaki</span>
              <v-chip
                class="ml-2"
                size="x-small"
                color="info"
              >
                {{ merchantStore.unlockedRoutes.length }}
              </v-chip>
            </v-card-title>

            <v-card-text>
              <div
                v-if="merchantStore.unlockedRoutes.length === 0"
                class="text-center py-6 text-medium-emphasis"
              >
                <v-icon
                  size="48"
                  class="mb-2 opacity-50"
                >
                  mdi-map-marker-off
                </v-icon>
                <div class="text-body-2">
                  Brak dostępnych szlaków
                </div>
                <div class="text-caption">
                  Zwiększ poziom i reputację, aby odblokować szlaki
                </div>
              </div>

              <div class="routes-grid">
                <div
                  v-for="route in merchantStore.unlockedRoutes"
                  :key="route.id"
                  class="route-card pa-4 rounded"
                >
                  <div class="d-flex align-center mb-3">
                    <v-icon
                      size="24"
                      color="info"
                      class="mr-2"
                    >
                      {{ route.icon }}
                    </v-icon>
                    <div>
                      <div class="text-body-1 font-weight-medium">
                        {{ route.name }}
                      </div>
                      <div class="text-caption text-medium-emphasis">
                        {{ route.description }}
                      </div>
                    </div>
                  </div>

                  <div class="route-stats d-flex flex-wrap ga-2 mb-3">
                    <v-chip
                      size="small"
                      variant="tonal"
                    >
                      <v-icon
                        start
                        size="14"
                      >
                        mdi-clock
                      </v-icon>
                      {{ Math.floor(route.baseTravelTime / 60) }}min
                    </v-chip>
                    <v-chip
                      size="small"
                      variant="tonal"
                      :color="route.baseRisk < 0.1 ? 'success' : route.baseRisk < 0.2 ? 'warning' : 'error'"
                    >
                      <v-icon
                        start
                        size="14"
                      >
                        mdi-alert
                      </v-icon>
                      {{ Math.floor(route.baseRisk * 100) }}% ryzyka
                    </v-chip>
                    <v-chip
                      size="small"
                      variant="tonal"
                      color="success"
                    >
                      <v-icon
                        start
                        size="14"
                      >
                        mdi-trending-up
                      </v-icon>
                      x{{ route.profitMultiplier.toFixed(2) }} zysk
                    </v-chip>
                  </div>

                  <v-btn
                    block
                    color="info"
                    variant="tonal"
                    :disabled="merchantStore.idleCaravans.length === 0 || merchantStore.shop.storage.length === 0"
                    @click="openSendCaravanDialog(route)"
                  >
                    <v-icon start>
                      mdi-truck
                    </v-icon>
                    Wyślij Karawanę
                  </v-btn>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </div>

        <!-- Decorations Tab -->
        <div v-if="activeTab === 'decorations'">
          <v-card>
            <v-card-title class="d-flex align-center py-3">
              <v-icon
                class="mr-2"
                color="purple"
              >
                mdi-home-edit
              </v-icon>
              <span class="text-subtitle-1">Dekoracje Sklepu</span>
            </v-card-title>

            <v-card-text>
              <div class="text-subtitle-2 mb-2 text-medium-emphasis">
                Posiadane
              </div>

              <div
                v-if="merchantStore.ownedDecorations.length === 0"
                class="text-center py-4 text-medium-emphasis mb-4"
              >
                <div class="text-body-2">
                  Brak dekoracji
                </div>
              </div>

              <div
                v-else
                class="decorations-grid mb-4"
              >
                <div
                  v-for="deco in merchantStore.ownedDecorations"
                  :key="deco.id"
                  class="decoration-owned pa-3 rounded"
                >
                  <v-icon
                    size="24"
                    color="purple"
                    class="mb-2"
                  >
                    {{ deco.icon }}
                  </v-icon>
                  <div class="text-body-2 font-weight-medium">
                    {{ deco.name }}
                  </div>
                </div>
              </div>

              <v-divider class="my-4" />

              <div class="text-subtitle-2 mb-2 text-medium-emphasis">
                Dostępne do kupienia
              </div>

              <div class="decorations-grid">
                <div
                  v-for="deco in merchantStore.availableDecorations.slice(0, 8)"
                  :key="deco.id"
                  class="decoration-item pa-3 rounded"
                >
                  <v-icon
                    size="24"
                    class="mb-2"
                  >
                    {{ deco.icon }}
                  </v-icon>
                  <div class="text-body-2 font-weight-medium mb-1">
                    {{ deco.name }}
                  </div>
                  <div class="text-caption text-medium-emphasis mb-2">
                    {{ deco.description }}
                  </div>
                  <v-btn
                    size="small"
                    variant="tonal"
                    color="amber"
                    block
                    @click="merchantStore.buyDecoration(deco.id)"
                  >
                    {{ deco.cost }}
                    <v-icon
                      end
                      size="14"
                    >
                      mdi-currency-usd
                    </v-icon>
                  </v-btn>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </v-col>
    </v-row>

    <!-- Send Caravan Dialog -->
    <v-dialog
      v-model="sendCaravanDialog"
      max-width="500"
    >
      <v-card v-if="selectedRoute">
        <v-card-title class="d-flex align-center">
          <v-icon
            class="mr-2"
            color="info"
          >
            mdi-truck-fast
          </v-icon>
          Wyślij Karawanę
        </v-card-title>

        <v-card-text>
          <div class="mb-4">
            <div class="text-h6 mb-1">
              {{ selectedRoute.name }}
            </div>
            <div class="text-body-2 text-medium-emphasis">
              {{ selectedRoute.description }}
            </div>
          </div>

          <v-divider class="my-3" />

          <div class="text-subtitle-2 mb-2">
            Towary do wysłania:
          </div>

          <div
            v-if="merchantStore.shop.storage.length === 0"
            class="text-center py-4 text-medium-emphasis"
          >
            <div class="text-body-2">
              Brak towarów w magazynie
            </div>
          </div>

          <div
            v-for="item in merchantStore.shop.storage"
            :key="item.itemId"
            class="d-flex justify-space-between text-body-2 mb-1"
          >
            <span>{{ getItemName(item.itemId) }}</span>
            <span class="text-medium-emphasis">x{{ item.quantity }}</span>
          </div>

          <v-divider class="my-3" />

          <div class="d-flex justify-space-between text-body-2 mb-1">
            <span>Czas podróży:</span>
            <span>{{ Math.floor(selectedRoute.baseTravelTime / 60) }} min</span>
          </div>
          <div class="d-flex justify-space-between text-body-2 mb-1">
            <span>Mnożnik zysku:</span>
            <span class="text-success">x{{ selectedRoute.profitMultiplier.toFixed(2) }}</span>
          </div>
          <div class="d-flex justify-space-between text-body-2">
            <span>Ryzyko napadu:</span>
            <span :class="selectedRoute.baseRisk < 0.1 ? 'text-success' : selectedRoute.baseRisk < 0.2 ? 'text-warning' : 'text-error'">
              {{ Math.floor(selectedRoute.baseRisk * 100) }}%
            </span>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="sendCaravanDialog = false"
          >
            Anuluj
          </v-btn>
          <v-btn
            color="info"
            variant="elevated"
            :disabled="merchantStore.shop.storage.length === 0"
            @click="sendCaravan"
          >
            <v-icon start>
              mdi-truck-fast
            </v-icon>
            Wyślij
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Market Tab Content -->
    <div
      v-if="activeTab === 'market'"
      class="mt-4"
    >
      <AteriaMarketOverview />
    </div>

    <!-- Haggle Dialog -->
    <AteriaHaggleDialog @close="showHaggleDialog = false" />
  </div>
</template>

<style scoped>
.stats-card,
.caravans-card {
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.caravan-item {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.caravan-item.caravan-active {
  border-color: rgba(76, 175, 80, 0.3);
  background: rgba(76, 175, 80, 0.05);
}

.display-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

.display-item {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}

.customer-item {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.storage-item {
  background: rgba(255, 255, 255, 0.02);
}

.storage-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.routes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.route-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.decorations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}

.decoration-item,
.decoration-owned {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}

.decoration-owned {
  border-color: rgba(156, 39, 176, 0.3);
  background: rgba(156, 39, 176, 0.05);
}
</style>
