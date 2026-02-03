<script setup lang="ts">
/**
 * Druid Panel - Farming, Animals, Totems
 */

import { computed, ref } from 'vue';
import { useAteriaDruidStore } from '../model/druid.store';
import {
  CROPS,
  FARM_ANIMALS,
  TOTEMS,
  SEASONS,
  ANIMAL_PRODUCTS,
  getCrop,
  getAnimal,
  getTotem,
  type TotemAnimal,
} from '../data/druid.data';

const druidStore = useAteriaDruidStore();

// UI State
const activeTab = ref<'farm' | 'animals' | 'totems' | 'inventory'>('farm');
const showPlantDialog = ref(false);
const showBuyAnimalDialog = ref(false);

// Computed
const readyToHarvest = computed(() => {
  return druidStore.plantedCrops.filter(p => p.ticksRemaining <= 0);
});

const animalsWithProduct = computed(() => {
  return druidStore.ownedAnimals.filter(a => {
    const animal = getAnimal(a.animalId);
    return animal && a.productionProgress >= animal.productionTime;
  });
});

const inventoryItems = computed(() => {
  const items: Array<{ id: string; name: string; amount: number; sellPrice: number; icon: string }> = [];
  for (const [id, amount] of druidStore.farmInventory) {
    const product = ANIMAL_PRODUCTS[id];
    const crop = getCrop(id);
    items.push({
      id,
      name: product?.name || crop?.name || id,
      amount,
      sellPrice: product?.sellPrice || crop?.sellPrice || 0,
      icon: crop?.icon || 'mdi-package',
    });
  }
  return items;
});

// Actions
function plantCrop(cropId: string) {
  druidStore.plantCrop(cropId);
}

function harvestCrop(plantedId: string) {
  druidStore.harvestCrop(plantedId);
}

function harvestAll() {
  for (const planted of readyToHarvest.value) {
    druidStore.harvestCrop(planted.id);
  }
}

function buyAnimal(animalId: string) {
  druidStore.buyAnimal(animalId);
  showBuyAnimalDialog.value = false;
}

function collectProduct(ownedId: string) {
  druidStore.collectProduct(ownedId);
}

function collectAllProducts() {
  for (const animal of animalsWithProduct.value) {
    druidStore.collectProduct(animal.id);
  }
}

function sellItem(itemId: string, amount: number) {
  druidStore.sellProduct(itemId, amount);
}

function getGrowthProgress(planted: typeof druidStore.plantedCrops.value[0]): number {
  return ((planted.totalTicks - planted.ticksRemaining) / planted.totalTicks) * 100;
}

function getProductionProgress(animal: typeof druidStore.ownedAnimals.value[0]): number {
  const animalData = getAnimal(animal.animalId);
  if (!animalData) return 0;
  return Math.min(100, (animal.productionProgress / animalData.productionTime) * 100);
}
</script>

<template>
  <div class="druid-panel">
    <!-- Header -->
    <v-card class="mb-4">
      <v-card-text>
        <div class="d-flex align-center">
          <v-avatar
            color="green"
            size="56"
            class="mr-4"
          >
            <v-icon
              size="32"
              color="white"
            >
              mdi-leaf
            </v-icon>
          </v-avatar>
          <div class="flex-grow-1">
            <div class="d-flex align-center">
              <span class="text-h5 mr-2">Druid</span>
              <v-chip
                size="small"
                color="green"
              >
                Poziom {{ druidStore.progress.level }}
              </v-chip>
            </div>
            <div class="text-body-2 text-medium-emphasis">
              Rolnictwo, hodowla i harmonia z naturą
            </div>
            <v-progress-linear
              :model-value="druidStore.getXpProgress()"
              color="green"
              height="8"
              rounded
              class="mt-2"
            >
              <template #default>
                <span class="text-caption">
                  {{ druidStore.progress.xp }} / {{ druidStore.progress.xpToNextLevel }} XP
                </span>
              </template>
            </v-progress-linear>
          </div>
          <!-- Season -->
          <div class="text-center ml-4">
            <v-avatar
              :color="druidStore.seasonData.color"
              size="48"
            >
              <v-icon color="white">
                {{ druidStore.seasonData.icon }}
              </v-icon>
            </v-avatar>
            <div class="text-caption mt-1">
              {{ druidStore.seasonData.name }}
            </div>
          </div>
        </div>

        <!-- Quick Stats -->
        <v-row class="mt-3">
          <v-col
            cols="3"
            class="text-center"
          >
            <div class="text-h6">
              {{ druidStore.availablePlots }} / {{ druidStore.farmPlots }}
            </div>
            <div class="text-caption">
              Wolne Działki
            </div>
          </v-col>
          <v-col
            cols="3"
            class="text-center"
          >
            <div class="text-h6">
              {{ druidStore.ownedAnimals.length }} / {{ druidStore.maxAnimals }}
            </div>
            <div class="text-caption">
              Zwierzęta
            </div>
          </v-col>
          <v-col
            cols="3"
            class="text-center"
          >
            <div class="text-h6">
              {{ druidStore.totalCropsHarvested }}
            </div>
            <div class="text-caption">
              Zebrane Plony
            </div>
          </v-col>
          <v-col
            cols="3"
            class="text-center"
          >
            <div class="text-h6 text-amber">
              {{ druidStore.totalFarmValue }}g
            </div>
            <div class="text-caption">
              Wartość Zapasów
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Tabs -->
    <v-tabs
      v-model="activeTab"
      color="green"
      class="mb-4"
    >
      <v-tab value="farm">
        <v-icon start>
          mdi-sprout
        </v-icon>
        Farma
        <v-badge
          v-if="readyToHarvest.length > 0"
          :content="readyToHarvest.length"
          color="success"
          inline
        />
      </v-tab>
      <v-tab value="animals">
        <v-icon start>
          mdi-cow
        </v-icon>
        Zwierzęta
        <v-badge
          v-if="animalsWithProduct.length > 0"
          :content="animalsWithProduct.length"
          color="amber"
          inline
        />
      </v-tab>
      <v-tab value="totems">
        <v-icon start>
          mdi-paw
        </v-icon>
        Totemy
      </v-tab>
      <v-tab value="inventory">
        <v-icon start>
          mdi-warehouse
        </v-icon>
        Zapasy
      </v-tab>
    </v-tabs>

    <!-- Farm Tab -->
    <div v-if="activeTab === 'farm'">
      <div class="d-flex justify-space-between align-center mb-3">
        <v-btn
          color="green"
          variant="tonal"
          :disabled="druidStore.availablePlots <= 0"
          @click="showPlantDialog = true"
        >
          <v-icon start>
            mdi-seed
          </v-icon>
          Zasadź
        </v-btn>
        <v-btn
          v-if="readyToHarvest.length > 0"
          color="success"
          @click="harvestAll"
        >
          <v-icon start>
            mdi-basket
          </v-icon>
          Zbierz Wszystko ({{ readyToHarvest.length }})
        </v-btn>
      </div>

      <!-- Planted Crops Grid -->
      <v-row>
        <v-col
          v-for="planted in druidStore.plantedCrops"
          :key="planted.id"
          cols="6"
          md="4"
          lg="3"
        >
          <v-card
            :class="{ 'border-success': planted.ticksRemaining <= 0 }"
            variant="outlined"
          >
            <v-card-text class="pa-3">
              <div class="d-flex align-center mb-2">
                <v-avatar
                  color="green-lighten-4"
                  size="36"
                >
                  <v-icon color="green">
                    {{ CROPS[planted.cropId]?.icon || 'mdi-leaf' }}
                  </v-icon>
                </v-avatar>
                <div class="ml-2">
                  <div class="text-body-2 font-weight-medium">
                    {{ CROPS[planted.cropId]?.name }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    Jakość: {{ planted.quality.toFixed(0) }}%
                  </div>
                </div>
              </div>

              <v-progress-linear
                :model-value="getGrowthProgress(planted)"
                :color="planted.ticksRemaining <= 0 ? 'success' : 'light-green'"
                height="16"
                rounded
                class="mb-2"
              >
                <template #default>
                  {{ planted.ticksRemaining <= 0 ? 'Gotowe!' : `${getGrowthProgress(planted).toFixed(0)}%` }}
                </template>
              </v-progress-linear>

              <div class="d-flex gap-2">
                <v-btn
                  v-if="planted.ticksRemaining <= 0"
                  size="small"
                  color="success"
                  block
                  @click="harvestCrop(planted.id)"
                >
                  Zbierz
                </v-btn>
                <v-btn
                  v-else
                  size="small"
                  variant="tonal"
                  block
                  @click="druidStore.waterCrop(planted.id)"
                >
                  <v-icon start>
                    mdi-water
                  </v-icon>
                  Podlej
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Empty plots -->
        <v-col
          v-for="i in druidStore.availablePlots"
          :key="'empty-' + i"
          cols="6"
          md="4"
          lg="3"
        >
          <v-card
            variant="outlined"
            class="d-flex align-center justify-center"
            style="min-height: 120px; border-style: dashed;"
            @click="showPlantDialog = true"
          >
            <div class="text-center text-medium-emphasis">
              <v-icon size="32">
                mdi-plus
              </v-icon>
              <div class="text-caption">
                Pusta działka
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Animals Tab -->
    <div v-if="activeTab === 'animals'">
      <div class="d-flex justify-space-between align-center mb-3">
        <v-btn
          color="brown"
          variant="tonal"
          :disabled="!druidStore.canAddAnimal"
          @click="showBuyAnimalDialog = true"
        >
          <v-icon start>
            mdi-plus
          </v-icon>
          Kup Zwierzę
        </v-btn>
        <v-btn
          v-if="animalsWithProduct.length > 0"
          color="amber"
          @click="collectAllProducts"
        >
          <v-icon start>
            mdi-basket
          </v-icon>
          Zbierz Wszystko ({{ animalsWithProduct.length }})
        </v-btn>
      </div>

      <v-row>
        <v-col
          v-for="animal in druidStore.ownedAnimals"
          :key="animal.id"
          cols="12"
          md="6"
        >
          <v-card>
            <v-card-text>
              <div class="d-flex align-center mb-3">
                <v-avatar
                  color="brown-lighten-4"
                  size="48"
                >
                  <v-icon color="brown">
                    {{ FARM_ANIMALS[animal.animalId]?.icon || 'mdi-paw' }}
                  </v-icon>
                </v-avatar>
                <div class="ml-3 flex-grow-1">
                  <div class="text-h6">
                    {{ animal.name }}
                  </div>
                  <div class="text-caption">
                    {{ FARM_ANIMALS[animal.animalId]?.name }} •
                    Produkty: {{ animal.totalProducts }}
                  </div>
                </div>
              </div>

              <!-- Happiness -->
              <div class="d-flex align-center mb-2">
                <v-icon
                  size="18"
                  color="pink"
                  class="mr-2"
                >
                  mdi-heart
                </v-icon>
                <v-progress-linear
                  :model-value="animal.happiness"
                  color="pink"
                  height="12"
                  rounded
                  class="flex-grow-1"
                >
                  <template #default>
                    {{ animal.happiness.toFixed(0) }}%
                  </template>
                </v-progress-linear>
              </div>

              <!-- Production -->
              <div class="d-flex align-center mb-3">
                <v-icon
                  size="18"
                  color="amber"
                  class="mr-2"
                >
                  mdi-package
                </v-icon>
                <v-progress-linear
                  :model-value="getProductionProgress(animal)"
                  :color="getProductionProgress(animal) >= 100 ? 'success' : 'amber'"
                  height="12"
                  rounded
                  class="flex-grow-1"
                >
                  <template #default>
                    {{ getProductionProgress(animal).toFixed(0) }}%
                  </template>
                </v-progress-linear>
              </div>

              <div class="d-flex gap-2">
                <v-btn
                  size="small"
                  variant="tonal"
                  @click="druidStore.feedAnimal(animal.id)"
                >
                  <v-icon start>
                    mdi-food
                  </v-icon>
                  Nakarm
                </v-btn>
                <v-btn
                  size="small"
                  :color="getProductionProgress(animal) >= 100 ? 'success' : 'grey'"
                  :disabled="getProductionProgress(animal) < 100"
                  @click="collectProduct(animal.id)"
                >
                  <v-icon start>
                    mdi-basket
                  </v-icon>
                  Zbierz
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-alert
        v-if="druidStore.ownedAnimals.length === 0"
        type="info"
        variant="tonal"
        class="mt-4"
      >
        Nie posiadasz żadnych zwierząt. Kup swoje pierwsze zwierzę!
      </v-alert>
    </div>

    <!-- Totems Tab -->
    <div v-if="activeTab === 'totems'">
      <v-row>
        <v-col
          v-for="(totem, totemId) in TOTEMS"
          :key="totemId"
          cols="12"
          md="4"
        >
          <v-card
            :class="{ 'border-primary': druidStore.activeTotem === totemId }"
            :variant="druidStore.totems[totemId as TotemAnimal].unlocked ? 'elevated' : 'outlined'"
          >
            <v-card-text>
              <div class="d-flex align-center mb-3">
                <v-avatar
                  :color="druidStore.totems[totemId as TotemAnimal].unlocked ? totem.color : 'grey'"
                  size="56"
                >
                  <v-icon
                    color="white"
                    size="32"
                  >
                    {{ totem.icon }}
                  </v-icon>
                </v-avatar>
                <div class="ml-3">
                  <div class="text-h6">
                    {{ totem.name }}
                  </div>
                  <div class="text-caption">
                    <span v-if="druidStore.totems[totemId as TotemAnimal].unlocked">
                      Poziom {{ druidStore.totems[totemId as TotemAnimal].level }} / {{ totem.maxLevel }}
                    </span>
                    <span v-else>
                      Wymaga: Druid Lvl {{ totem.requiredLevel }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="text-body-2 mb-3">
                {{ totem.description }}
              </div>

              <!-- Bonuses -->
              <div
                v-for="bonus in totem.bonuses"
                :key="bonus.type"
                class="text-caption mb-1"
              >
                {{ bonus.description.replace('{value}', String(bonus.baseValue + bonus.perLevel * (druidStore.totems[totemId as TotemAnimal].level - 1))) }}
              </div>

              <div class="d-flex gap-2 mt-3">
                <v-btn
                  v-if="!druidStore.totems[totemId as TotemAnimal].unlocked"
                  size="small"
                  color="primary"
                  :disabled="druidStore.progress.level < totem.requiredLevel"
                  @click="druidStore.unlockTotem(totemId as TotemAnimal)"
                >
                  Odblokuj ({{ totem.unlockCost }}g)
                </v-btn>
                <template v-else>
                  <v-btn
                    size="small"
                    :color="druidStore.activeTotem === totemId ? 'success' : 'grey'"
                    @click="druidStore.setActiveTotem(druidStore.activeTotem === totemId ? null : totemId as TotemAnimal)"
                  >
                    {{ druidStore.activeTotem === totemId ? 'Aktywny' : 'Aktywuj' }}
                  </v-btn>
                  <v-btn
                    v-if="druidStore.totems[totemId as TotemAnimal].level < totem.maxLevel"
                    size="small"
                    variant="tonal"
                    @click="druidStore.upgradeTotem(totemId as TotemAnimal)"
                  >
                    Ulepsz
                  </v-btn>
                </template>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Inventory Tab -->
    <div v-if="activeTab === 'inventory'">
      <div class="d-flex justify-end mb-3">
        <v-btn
          v-if="inventoryItems.length > 0"
          color="success"
          @click="druidStore.sellAllProducts()"
        >
          <v-icon start>
            mdi-currency-usd
          </v-icon>
          Sprzedaj Wszystko ({{ druidStore.totalFarmValue }}g)
        </v-btn>
      </div>

      <v-card>
        <v-list v-if="inventoryItems.length > 0">
          <v-list-item
            v-for="item in inventoryItems"
            :key="item.id"
          >
            <template #prepend>
              <v-avatar size="40">
                <v-icon>{{ item.icon }}</v-icon>
              </v-avatar>
            </template>
            <v-list-item-title>{{ item.name }}</v-list-item-title>
            <v-list-item-subtitle>
              {{ item.amount }}x • {{ item.sellPrice * item.amount }}g
            </v-list-item-subtitle>
            <template #append>
              <v-btn
                size="small"
                color="success"
                variant="tonal"
                @click="sellItem(item.id, item.amount)"
              >
                Sprzedaj
              </v-btn>
            </template>
          </v-list-item>
        </v-list>
        <v-card-text
          v-else
          class="text-center py-8 text-medium-emphasis"
        >
          Brak produktów w zapasach
        </v-card-text>
      </v-card>
    </div>

    <!-- Plant Dialog -->
    <v-dialog
      v-model="showPlantDialog"
      max-width="600"
    >
      <v-card>
        <v-card-title>Wybierz Uprawę</v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item
              v-for="crop in druidStore.availableCrops"
              :key="crop.id"
              @click="plantCrop(crop.id); showPlantDialog = false"
            >
              <template #prepend>
                <v-avatar :color="crop.preferredSeason === druidStore.currentSeason ? 'success' : 'grey'">
                  <v-icon color="white">
                    {{ crop.icon }}
                  </v-icon>
                </v-avatar>
              </template>
              <v-list-item-title>{{ crop.name }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ crop.seedCost }}g • {{ (crop.growthTime / 10).toFixed(0) }}s •
                {{ crop.baseYield.min }}-{{ crop.baseYield.max }} plonów
              </v-list-item-subtitle>
              <template #append>
                <v-chip
                  v-if="crop.preferredSeason === druidStore.currentSeason"
                  size="x-small"
                  color="success"
                >
                  Sezon!
                </v-chip>
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="showPlantDialog = false"
          >
            Anuluj
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Buy Animal Dialog -->
    <v-dialog
      v-model="showBuyAnimalDialog"
      max-width="600"
    >
      <v-card>
        <v-card-title>Kup Zwierzę</v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item
              v-for="animal in druidStore.availableAnimals"
              :key="animal.id"
              @click="buyAnimal(animal.id)"
            >
              <template #prepend>
                <v-avatar color="brown">
                  <v-icon color="white">
                    {{ animal.icon }}
                  </v-icon>
                </v-avatar>
              </template>
              <v-list-item-title>{{ animal.name }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ animal.purchaseCost }}g •
                Produkuje: {{ animal.productName }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="showBuyAnimalDialog = false"
          >
            Anuluj
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.border-success {
  border-color: rgb(var(--v-theme-success)) !important;
  border-width: 2px !important;
}

.border-primary {
  border-color: rgb(var(--v-theme-primary)) !important;
  border-width: 2px !important;
}
</style>
