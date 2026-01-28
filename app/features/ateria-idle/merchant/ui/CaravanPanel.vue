<script setup lang="ts">
/**
 * Caravan Panel - UI for managing trade routes and caravans
 */

import { computed, ref } from 'vue';
import { useAteriaMerchantStore } from '../model/merchant.store';
import { useAteriaResourcesStore } from '../../core/model/resources.store';
import {
  CITIES,
  TRADE_ROUTES,
  CARAVAN_TEMPLATES,
  CARAVAN_UPGRADES,
  getCity,
  getTradeRoute,
  getCaravanTemplate,
  getCaravanUpgrade,
  calculateTravelTime,
  calculateCaravanCapacity,
} from '../../data/caravans.data';
import type { Caravan, CaravanState, TradeRoute } from '~/entities/ateria-idle/merchant';

const merchantStore = useAteriaMerchantStore();
const resourcesStore = useAteriaResourcesStore();

// UI State
const activeTab = ref<'routes' | 'caravans' | 'upgrades'>('routes');
const showPurchaseDialog = ref(false);
const selectedTemplateId = ref<string | null>(null);

// Computed - use store values or defaults
const caravans = computed(() => merchantStore.caravans || []);
const maxCaravans = computed(() => merchantStore.maxCaravans || 1);
const caravanUpgrades = computed(() => merchantStore.caravanUpgrades || new Map());
const unlockedRoutes = computed(() => merchantStore.unlockedRoutes || new Set());

const availableRoutes = computed(() => {
  return TRADE_ROUTES.filter(route => {
    const req = route.requirements;
    if (req.merchantLevel > merchantStore.merchantLevel) return false;
    // Simplified reputation check
    return true;
  });
});

const availableTemplates = computed(() => {
  return CARAVAN_TEMPLATES.filter(t => {
    if (t.unlockRequirement.merchantLevel > merchantStore.merchantLevel) return false;
    return true;
  });
});

const selectedTemplate = computed(() => {
  if (!selectedTemplateId.value) return null;
  return getCaravanTemplate(selectedTemplateId.value);
});

// Helper functions
function getStateColor(state: CaravanState): string {
  switch (state) {
    case 'traveling': return 'info';
    case 'returning': return 'purple';
    case 'loading': return 'warning';
    case 'arrived': return 'success';
    case 'ambushed': return 'error';
    case 'idle': return 'grey';
    default: return 'grey';
  }
}

function getStateText(state: CaravanState): string {
  switch (state) {
    case 'traveling': return 'W podróży';
    case 'returning': return 'Powrót';
    case 'loading': return 'Załadunek';
    case 'arrived': return 'Dotarła';
    case 'ambushed': return 'Zasadzka!';
    case 'idle': return 'Gotowa';
    default: return state;
  }
}

function getDangerColor(danger: number): string {
  if (danger < 0.1) return 'success';
  if (danger < 0.2) return 'info';
  if (danger < 0.35) return 'warning';
  return 'error';
}

function getDangerText(danger: number): string {
  if (danger < 0.1) return 'Bezpieczny';
  if (danger < 0.2) return 'Umiarkowany';
  if (danger < 0.35) return 'Niebezpieczny';
  return 'Bardzo ryzykowny';
}

function formatTime(ticks: number): string {
  const seconds = ticks / 10;
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
}

function canAffordTemplate(templateId: string): boolean {
  const template = getCaravanTemplate(templateId);
  if (!template) return false;
  return resourcesStore.hasAmount('gold', template.cost);
}

function canAffordUpgrade(upgradeId: string): boolean {
  const upgrade = getCaravanUpgrade(upgradeId);
  if (!upgrade) return false;
  const currentLevel = caravanUpgrades.value.get(upgradeId) || 0;
  if (currentLevel >= upgrade.maxLevel) return false;
  const cost = upgrade.cost * Math.pow(1.5, currentLevel);
  return resourcesStore.hasAmount('gold', cost);
}

function getUpgradeLevel(upgradeId: string): number {
  return caravanUpgrades.value.get(upgradeId) || 0;
}

function getUpgradeCost(upgradeId: string): number {
  const upgrade = getCaravanUpgrade(upgradeId);
  if (!upgrade) return 0;
  const currentLevel = caravanUpgrades.value.get(upgradeId) || 0;
  return Math.floor(upgrade.cost * Math.pow(1.5, currentLevel));
}

// Actions
function purchaseCaravan() {
  if (!selectedTemplateId.value) return;
  
  const template = getCaravanTemplate(selectedTemplateId.value);
  if (!template || !canAffordTemplate(selectedTemplateId.value)) return;

  resourcesStore.removeResource('gold', template.cost);
  
  const newCaravan: Caravan = {
    id: `caravan_${Date.now()}`,
    name: template.name,
    maxCapacity: template.baseCapacity,
    currentCapacity: 0,
    baseSpeed: template.baseSpeed,
    protection: template.baseProtection,
    cargo: [],
    state: 'idle',
    currentRoute: null,
    progress: 0,
    departureTime: 0,
    arrivalTime: 0,
    insured: false,
    insuranceCost: 0,
  };

  merchantStore.addCaravan(newCaravan);
  showPurchaseDialog.value = false;
}

function purchaseUpgrade(upgradeId: string) {
  if (!canAffordUpgrade(upgradeId)) return;

  const cost = getUpgradeCost(upgradeId);
  resourcesStore.removeResource('gold', cost);
  merchantStore.purchaseCaravanUpgrade(upgradeId);
}

function sendCaravan(caravan: Caravan, route: TradeRoute) {
  merchantStore.sendCaravan(caravan.id, route.id);
}
</script>

<template>
  <div class="caravan-panel">
    <!-- Header -->
    <v-card class="mb-4">
      <v-card-text>
        <v-row align="center">
          <v-col
            cols="12"
            md="6"
          >
            <div class="d-flex align-center">
              <v-avatar
                color="amber-darken-2"
                size="56"
                class="mr-4"
              >
                <v-icon
                  size="32"
                  color="white"
                >
                  mdi-truck
                </v-icon>
              </v-avatar>
              <div>
                <div class="text-h5">
                  System Karawan
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  Karawany: {{ caravans.length }} / {{ maxCaravans }}
                </div>
              </div>
            </div>
          </v-col>
          <v-col
            cols="12"
            md="6"
            class="text-md-right"
          >
            <v-btn
              color="amber-darken-2"
              :disabled="caravans.length >= maxCaravans"
              @click="showPurchaseDialog = true"
            >
              <v-icon start>
                mdi-plus
              </v-icon>
              Kup Karawanę
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Tabs -->
    <v-tabs
      v-model="activeTab"
      color="amber-darken-2"
      class="mb-4"
    >
      <v-tab value="routes">
        <v-icon start>
          mdi-map-marker-path
        </v-icon>
        Szlaki Handlowe
      </v-tab>
      <v-tab value="caravans">
        <v-icon start>
          mdi-truck
        </v-icon>
        Karawany
        <v-badge
          v-if="caravans.filter(c => c.state === 'idle').length > 0"
          :content="caravans.filter(c => c.state === 'idle').length"
          color="success"
          inline
        />
      </v-tab>
      <v-tab value="upgrades">
        <v-icon start>
          mdi-arrow-up-bold
        </v-icon>
        Ulepszenia
      </v-tab>
    </v-tabs>

    <!-- Routes Tab -->
    <div v-if="activeTab === 'routes'">
      <v-row>
        <v-col
          v-for="route in availableRoutes"
          :key="route.id"
          cols="12"
          md="6"
        >
          <v-card class="route-card">
            <v-card-text>
              <div class="d-flex align-center mb-3">
                <v-icon
                  :color="getDangerColor(route.danger)"
                  size="32"
                  class="mr-3"
                >
                  {{ route.icon }}
                </v-icon>
                <div class="flex-grow-1">
                  <div class="text-body-1 font-weight-medium">
                    {{ route.name }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    {{ getCity(route.fromCity)?.name }} → {{ getCity(route.toCity)?.name }}
                  </div>
                </div>
                <v-chip
                  :color="getDangerColor(route.danger)"
                  size="small"
                >
                  {{ getDangerText(route.danger) }}
                </v-chip>
              </div>

              <div class="text-body-2 text-medium-emphasis mb-3">
                {{ route.description }}
              </div>

              <v-row dense>
                <v-col cols="4">
                  <div class="stat-box text-center pa-2 rounded">
                    <div class="text-body-2 font-weight-bold text-success">
                      +{{ Math.round((route.baseProfit - 1) * 100) }}%
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      Zysk
                    </div>
                  </div>
                </v-col>
                <v-col cols="4">
                  <div class="stat-box text-center pa-2 rounded">
                    <div class="text-body-2 font-weight-bold">
                      {{ formatTime(route.baseTravelTime) }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      Czas
                    </div>
                  </div>
                </v-col>
                <v-col cols="4">
                  <div class="stat-box text-center pa-2 rounded">
                    <div class="text-body-2 font-weight-bold">
                      {{ route.distance }} km
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      Dystans
                    </div>
                  </div>
                </v-col>
              </v-row>

              <!-- Send idle caravan -->
              <div
                v-if="caravans.some(c => c.state === 'idle')"
                class="mt-3"
              >
                <v-select
                  :items="caravans.filter(c => c.state === 'idle')"
                  item-title="name"
                  item-value="id"
                  label="Wybierz karawanę"
                  density="compact"
                  variant="outlined"
                  hide-details
                  class="mb-2"
                >
                  <template #append>
                    <v-btn
                      size="small"
                      color="amber-darken-2"
                      @click="sendCaravan(caravans.find(c => c.state === 'idle')!, route)"
                    >
                      Wyślij
                    </v-btn>
                  </template>
                </v-select>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-card
        v-if="availableRoutes.length === 0"
        class="text-center py-8"
      >
        <v-icon
          size="64"
          color="grey"
        >
          mdi-map-marker-off
        </v-icon>
        <div class="text-h6 mt-4">
          Brak dostępnych szlaków
        </div>
        <div class="text-body-2 text-medium-emphasis">
          Zwiększ poziom Kupca aby odblokować nowe szlaki
        </div>
      </v-card>
    </div>

    <!-- Caravans Tab -->
    <div v-if="activeTab === 'caravans'">
      <v-row>
        <v-col
          v-for="caravan in caravans"
          :key="caravan.id"
          cols="12"
          md="6"
          lg="4"
        >
          <v-card class="caravan-card">
            <v-card-text>
              <div class="d-flex align-center mb-3">
                <v-avatar
                  color="amber-darken-2"
                  size="48"
                  class="mr-3"
                >
                  <v-icon
                    size="28"
                    color="white"
                  >
                    mdi-truck
                  </v-icon>
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="text-body-1 font-weight-medium">
                    {{ caravan.name }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    Pojemność: {{ caravan.currentCapacity }} / {{ caravan.maxCapacity }}
                  </div>
                </div>
                <v-chip
                  :color="getStateColor(caravan.state)"
                  size="small"
                >
                  {{ getStateText(caravan.state) }}
                </v-chip>
              </div>

              <!-- Progress bar for traveling -->
              <div
                v-if="caravan.state === 'traveling' || caravan.state === 'returning'"
                class="mb-3"
              >
                <div class="d-flex justify-space-between text-caption mb-1">
                  <span>Postęp podróży</span>
                  <span>{{ Math.round(caravan.progress * 100) }}%</span>
                </div>
                <v-progress-linear
                  :model-value="caravan.progress * 100"
                  color="amber-darken-2"
                  height="8"
                  rounded
                />
              </div>

              <!-- Stats -->
              <v-row dense>
                <v-col cols="4">
                  <div class="stat-box text-center pa-2 rounded">
                    <div class="text-body-2 font-weight-bold">
                      {{ (caravan.baseSpeed * 100).toFixed(0) }}%
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      Prędkość
                    </div>
                  </div>
                </v-col>
                <v-col cols="4">
                  <div class="stat-box text-center pa-2 rounded">
                    <div class="text-body-2 font-weight-bold">
                      {{ caravan.protection }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      Ochrona
                    </div>
                  </div>
                </v-col>
                <v-col cols="4">
                  <div class="stat-box text-center pa-2 rounded">
                    <div class="text-body-2 font-weight-bold">
                      {{ caravan.cargo.length }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      Towary
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-card
        v-if="caravans.length === 0"
        class="text-center py-8"
      >
        <v-icon
          size="64"
          color="grey"
        >
          mdi-truck-remove
        </v-icon>
        <div class="text-h6 mt-4">
          Brak karawan
        </div>
        <div class="text-body-2 text-medium-emphasis mb-4">
          Kup swoją pierwszą karawanę aby rozpocząć handel
        </div>
        <v-btn
          color="amber-darken-2"
          @click="showPurchaseDialog = true"
        >
          <v-icon start>
            mdi-plus
          </v-icon>
          Kup Karawanę
        </v-btn>
      </v-card>
    </div>

    <!-- Upgrades Tab -->
    <div v-if="activeTab === 'upgrades'">
      <v-row>
        <v-col
          v-for="upgrade in CARAVAN_UPGRADES"
          :key="upgrade.id"
          cols="12"
          md="6"
          lg="4"
        >
          <v-card class="upgrade-card">
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-avatar
                  color="amber-darken-2"
                  size="44"
                  class="mr-3"
                >
                  <v-icon color="white">
                    {{ upgrade.icon }}
                  </v-icon>
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="text-body-1 font-weight-medium">
                    {{ upgrade.name }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    Lvl {{ getUpgradeLevel(upgrade.id) }} / {{ upgrade.maxLevel }}
                  </div>
                </div>
              </div>

              <div class="text-body-2 text-medium-emphasis mb-2">
                {{ upgrade.description }}
              </div>

              <v-progress-linear
                :model-value="(getUpgradeLevel(upgrade.id) / upgrade.maxLevel) * 100"
                color="amber-darken-2"
                height="4"
                rounded
                class="mb-2"
              />

              <v-btn
                v-if="getUpgradeLevel(upgrade.id) < upgrade.maxLevel"
                block
                :color="canAffordUpgrade(upgrade.id) ? 'amber-darken-2' : 'grey'"
                :disabled="!canAffordUpgrade(upgrade.id)"
                size="small"
                @click="purchaseUpgrade(upgrade.id)"
              >
                <v-icon
                  start
                  size="16"
                >
                  mdi-gold
                </v-icon>
                {{ getUpgradeCost(upgrade.id) }}
              </v-btn>
              <v-btn
                v-else
                block
                color="success"
                variant="tonal"
                size="small"
                disabled
              >
                MAX
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Purchase Caravan Dialog -->
    <v-dialog
      v-model="showPurchaseDialog"
      max-width="600"
    >
      <v-card>
        <v-card-title class="d-flex align-center bg-amber-darken-2">
          <v-icon
            class="mr-2"
            color="white"
          >
            mdi-truck
          </v-icon>
          <span class="text-white">Kup Karawanę</span>
        </v-card-title>

        <v-card-text class="pt-4">
          <v-list select-strategy="single-leaf">
            <v-list-item
              v-for="template in availableTemplates"
              :key="template.id"
              :value="template.id"
              :active="selectedTemplateId === template.id"
              @click="selectedTemplateId = template.id"
            >
              <template #prepend>
                <v-avatar
                  color="amber-darken-2"
                  size="40"
                >
                  <v-icon color="white">
                    {{ template.icon }}
                  </v-icon>
                </v-avatar>
              </template>

              <v-list-item-title>{{ template.name }}</v-list-item-title>
              <v-list-item-subtitle>{{ template.description }}</v-list-item-subtitle>

              <template #append>
                <div class="text-right">
                  <div class="text-body-2 font-weight-bold">
                    {{ template.cost }} 💰
                  </div>
                  <div class="text-caption">
                    Poj: {{ template.baseCapacity }}
                  </div>
                </div>
              </template>
            </v-list-item>
          </v-list>

          <v-card
            v-if="selectedTemplate"
            variant="outlined"
            class="mt-4"
          >
            <v-card-text>
              <div class="text-subtitle-2 mb-2">
                Statystyki
              </div>
              <v-row dense>
                <v-col cols="4">
                  <div class="text-center">
                    <div class="text-h6">
                      {{ selectedTemplate.baseCapacity }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      Pojemność
                    </div>
                  </div>
                </v-col>
                <v-col cols="4">
                  <div class="text-center">
                    <div class="text-h6">
                      {{ (selectedTemplate.baseSpeed * 100).toFixed(0) }}%
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      Prędkość
                    </div>
                  </div>
                </v-col>
                <v-col cols="4">
                  <div class="text-center">
                    <div class="text-h6">
                      {{ selectedTemplate.baseProtection }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      Ochrona
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-btn
            variant="text"
            @click="showPurchaseDialog = false"
          >
            Anuluj
          </v-btn>
          <v-spacer />
          <v-btn
            color="amber-darken-2"
            :disabled="!selectedTemplateId || !canAffordTemplate(selectedTemplateId)"
            @click="purchaseCaravan"
          >
            <v-icon start>
              mdi-cart
            </v-icon>
            Kup
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.route-card,
.caravan-card,
.upgrade-card {
  transition: all 0.2s ease;
}

.route-card:hover,
.caravan-card:hover,
.upgrade-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.stat-box {
  background: rgba(255, 255, 255, 0.03);
}
</style>
