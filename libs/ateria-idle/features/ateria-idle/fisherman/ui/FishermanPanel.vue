<script setup lang="ts">
/**
 * Fisherman Panel - Fishing, Equipment, Collection
 */

import { computed, ref } from 'vue';
import { useAteriaFishermanStore } from '../model/fisherman.store';
import {
  FISH,
  FISHING_RODS,
  BAITS,
  FISHING_SPOTS,
  RARITY_DATA,
  getWaterTypeIcon,
  getWaterTypeName,
} from '../data/fisherman.data';

const fishermanStore = useAteriaFishermanStore();

// UI State
const activeTab = ref<'fishing' | 'equipment' | 'inventory' | 'collection'>('fishing');
const selectedSpot = ref<string | null>(null);

// Computed
const inventoryItems = computed(() => {
  const items: Array<{ id: string; name: string; icon: string; rarity: string; amount: number; sellPrice: number }> = [];
  for (const [fishId, amount] of fishermanStore.caughtFish) {
    const fish = FISH[fishId];
    if (fish) {
      items.push({
        id: fishId,
        name: fish.name,
        icon: fish.icon,
        rarity: fish.rarity,
        amount,
        sellPrice: fish.sellPrice,
      });
    }
  }
  return items.sort((a, b) => RARITY_DATA[b.rarity as keyof typeof RARITY_DATA].chance - RARITY_DATA[a.rarity as keyof typeof RARITY_DATA].chance);
});

const rodDurabilityPercent = computed(() => {
  if (!fishermanStore.equippedRod) return 0;
  const rod = FISHING_RODS[fishermanStore.equippedRod];
  if (!rod) return 0;
  const current = fishermanStore.rodDurability.get(fishermanStore.equippedRod) || 0;
  return (current / rod.durability) * 100;
});

// Actions
function selectSpot(spotId: string) {
  selectedSpot.value = spotId;
}

function startFishing() {
  if (selectedSpot.value) {
    fishermanStore.startFishing(selectedSpot.value);
  }
}

function canAccessSpot(spotId: string): boolean {
  return fishermanStore.canFish(spotId).canFish;
}
</script>

<template>
  <div class="fisherman-panel">
    <!-- Header -->
    <v-card class="mb-4">
      <v-card-text>
        <div class="d-flex align-center">
          <v-avatar
            color="blue"
            size="56"
            class="mr-4"
          >
            <v-icon
              size="32"
              color="white"
            >
              mdi-fishing
            </v-icon>
          </v-avatar>
          <div class="flex-grow-1">
            <div class="d-flex align-center">
              <span class="text-h5 mr-2">Wędkarz</span>
              <v-chip
                size="small"
                color="blue"
              >
                Poziom {{ fishermanStore.progress.level }}
              </v-chip>
            </div>
            <div class="text-body-2 text-medium-emphasis">
              Łowienie, kolekcjonowanie, akwarium
            </div>
            <v-progress-linear
              :model-value="fishermanStore.getXpProgress()"
              color="blue"
              height="8"
              rounded
              class="mt-2"
            >
              <template #default>
                <span class="text-caption">
                  {{ fishermanStore.progress.xp }} / {{ fishermanStore.progress.xpToNextLevel }} XP
                </span>
              </template>
            </v-progress-linear>
          </div>
        </div>

        <!-- Quick Stats -->
        <v-row class="mt-3">
          <v-col
            cols="3"
            class="text-center"
          >
            <div class="text-h6">
              {{ fishermanStore.totalFishCaught }}
            </div>
            <div class="text-caption">
              Złapane
            </div>
          </v-col>
          <v-col
            cols="3"
            class="text-center"
          >
            <div class="text-h6">
              {{ fishermanStore.fishCollection.size }}/{{ Object.keys(FISH).length }}
            </div>
            <div class="text-caption">
              Kolekcja
            </div>
          </v-col>
          <v-col
            cols="3"
            class="text-center"
          >
            <div class="text-h6">
              {{ fishermanStore.legendaryFishCaught }}
            </div>
            <div class="text-caption">
              Legendarne
            </div>
          </v-col>
          <v-col
            cols="3"
            class="text-center"
          >
            <div class="text-h6 text-amber">
              {{ fishermanStore.totalFishValue }}g
            </div>
            <div class="text-caption">
              Wartość
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Active Fishing -->
    <v-card
      v-if="fishermanStore.isFishing && fishermanStore.activeFishing"
      class="mb-4"
    >
      <v-card-text>
        <div class="d-flex align-center mb-2">
          <v-avatar
            color="blue"
            size="48"
            class="mr-3"
          >
            <v-icon color="white">
              mdi-fishing
            </v-icon>
          </v-avatar>
          <div class="flex-grow-1">
            <div class="text-h6">
              Łowienie w {{ FISHING_SPOTS[fishermanStore.activeFishing.spotId]?.name }}
            </div>
            <v-progress-linear
              :model-value="fishermanStore.fishingProgress"
              color="blue"
              height="20"
              rounded
            >
              <template #default>
                {{ Math.floor(fishermanStore.fishingProgress) }}%
              </template>
            </v-progress-linear>
          </div>
          <v-btn
            color="error"
            variant="tonal"
            class="ml-3"
            @click="fishermanStore.cancelFishing()"
          >
            Anuluj
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Tabs -->
    <v-tabs
      v-model="activeTab"
      color="blue"
      class="mb-4"
    >
      <v-tab value="fishing">
        <v-icon start>
          mdi-waves
        </v-icon>
        Łowiska
      </v-tab>
      <v-tab value="equipment">
        <v-icon start>
          mdi-fishing
        </v-icon>
        Sprzęt
      </v-tab>
      <v-tab value="inventory">
        <v-icon start>
          mdi-fish
        </v-icon>
        Ryby
        <v-badge
          v-if="inventoryItems.length > 0"
          :content="inventoryItems.length"
          color="success"
          inline
        />
      </v-tab>
      <v-tab value="collection">
        <v-icon start>
          mdi-star
        </v-icon>
        Kolekcja
      </v-tab>
    </v-tabs>

    <!-- Fishing Tab -->
    <div v-if="activeTab === 'fishing'">
      <!-- Current Equipment -->
      <v-card
        class="mb-4"
        variant="outlined"
      >
        <v-card-text>
          <div class="d-flex align-center">
            <div class="flex-grow-1">
              <div class="text-subtitle-2">
                Wędka: {{ fishermanStore.currentRod?.name || 'Brak' }}
              </div>
              <v-progress-linear
                v-if="fishermanStore.currentRod"
                :model-value="rodDurabilityPercent"
                :color="rodDurabilityPercent > 30 ? 'success' : 'error'"
                height="8"
                rounded
                class="mt-1"
              />
            </div>
            <div class="ml-4 text-right">
              <div class="text-subtitle-2">
                Przynęta: {{ fishermanStore.currentBait?.name || 'Brak' }}
              </div>
              <div
                v-if="fishermanStore.equippedBait"
                class="text-caption"
              >
                {{ fishermanStore.baitInventory.get(fishermanStore.equippedBait) || 0 }} szt.
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Fishing Spots -->
      <v-row>
        <v-col
          v-for="spot in fishermanStore.availableSpots"
          :key="spot.id"
          cols="12"
          md="6"
        >
          <v-card
            :class="{ 'border-primary': selectedSpot === spot.id }"
            :variant="selectedSpot === spot.id ? 'elevated' : 'outlined'"
            @click="selectSpot(spot.id)"
          >
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-avatar
                  color="blue-lighten-4"
                  size="48"
                >
                  <v-icon color="blue">
                    {{ getWaterTypeIcon(spot.waterType) }}
                  </v-icon>
                </v-avatar>
                <div class="ml-3">
                  <div class="text-subtitle-1 font-weight-medium">
                    {{ spot.name }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    {{ getWaterTypeName(spot.waterType) }} • Lvl {{ spot.requiredLevel }}
                  </div>
                </div>
              </div>

              <div class="text-body-2 mb-2">
                {{ spot.description }}
              </div>

              <!-- Available fish preview -->
              <div class="d-flex flex-wrap gap-1 mb-2">
                <v-chip
                  v-for="fishId in spot.availableFish.slice(0, 4)"
                  :key="fishId"
                  size="x-small"
                  :color="RARITY_DATA[FISH[fishId]?.rarity || 'common'].color"
                >
                  {{ FISH[fishId]?.name }}
                </v-chip>
                <v-chip
                  v-if="spot.availableFish.length > 4"
                  size="x-small"
                  color="grey"
                >
                  +{{ spot.availableFish.length - 4 }}
                </v-chip>
              </div>

              <v-btn
                v-if="selectedSpot === spot.id"
                color="blue"
                block
                :disabled="fishermanStore.isFishing"
                @click.stop="startFishing()"
              >
                <v-icon start>
                  mdi-fishing
                </v-icon>
                Rozpocznij Łowienie
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Equipment Tab -->
    <div v-if="activeTab === 'equipment'">
      <!-- Rods -->
      <v-card class="mb-4">
        <v-card-title>Wędki</v-card-title>
        <v-card-text>
          <v-row>
            <v-col
              v-for="rod in Object.values(FISHING_RODS)"
              :key="rod.id"
              cols="12"
              md="6"
              lg="4"
            >
              <v-card
                :variant="fishermanStore.ownedRods.has(rod.id) ? 'elevated' : 'outlined'"
                :class="{ 'border-primary': fishermanStore.equippedRod === rod.id }"
              >
                <v-card-text>
                  <div class="d-flex align-center mb-2">
                    <v-icon
                      size="36"
                      :color="fishermanStore.ownedRods.has(rod.id) ? 'blue' : 'grey'"
                    >
                      {{ rod.icon }}
                    </v-icon>
                    <div class="ml-3">
                      <div class="font-weight-medium">
                        {{ rod.name }}
                      </div>
                      <div class="text-caption">
                        Tier {{ rod.tier }} • Lvl {{ rod.requiredLevel }}
                      </div>
                    </div>
                  </div>

                  <div class="text-caption mb-2">
                    Moc: {{ rod.power }} • Szybkość: x{{ rod.speed }} • Szczęście: +{{ rod.luck }}%
                  </div>

                  <v-btn
                    v-if="!fishermanStore.ownedRods.has(rod.id)"
                    size="small"
                    color="amber"
                    block
                    :disabled="rod.requiredLevel > fishermanStore.progress.level"
                    @click="fishermanStore.buyRod(rod.id)"
                  >
                    Kup ({{ rod.cost }}g)
                  </v-btn>
                  <v-btn
                    v-else-if="fishermanStore.equippedRod !== rod.id"
                    size="small"
                    color="primary"
                    block
                    @click="fishermanStore.equipRod(rod.id)"
                  >
                    Załóż
                  </v-btn>
                  <v-chip
                    v-else
                    color="success"
                    block
                  >
                    Założona
                  </v-chip>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Baits -->
      <v-card>
        <v-card-title>Przynęty</v-card-title>
        <v-card-text>
          <v-row>
            <v-col
              v-for="bait in Object.values(BAITS)"
              :key="bait.id"
              cols="6"
              md="4"
              lg="3"
            >
              <v-card
                variant="outlined"
                :class="{ 'border-primary': fishermanStore.equippedBait === bait.id }"
              >
                <v-card-text class="pa-3">
                  <div class="text-center mb-2">
                    <v-icon
                      size="32"
                      color="brown"
                    >
                      {{ bait.icon }}
                    </v-icon>
                  </div>
                  <div class="text-subtitle-2 text-center">
                    {{ bait.name }}
                  </div>
                  <div class="text-caption text-center text-medium-emphasis">
                    +{{ bait.catchSpeedBonus }}% szybkość
                  </div>
                  <div class="text-caption text-center mb-2">
                    Posiadane: {{ fishermanStore.baitInventory.get(bait.id) || 0 }}
                  </div>
                  <div class="d-flex gap-1">
                    <v-btn
                      size="x-small"
                      color="amber"
                      @click="fishermanStore.buyBait(bait.id, 1)"
                    >
                      +10 ({{ bait.cost }}g)
                    </v-btn>
                    <v-btn
                      size="x-small"
                      :color="fishermanStore.equippedBait === bait.id ? 'success' : 'grey'"
                      :disabled="(fishermanStore.baitInventory.get(bait.id) || 0) <= 0"
                      @click="fishermanStore.equipBait(fishermanStore.equippedBait === bait.id ? null : bait.id)"
                    >
                      {{ fishermanStore.equippedBait === bait.id ? '✓' : 'Użyj' }}
                    </v-btn>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </div>

    <!-- Inventory Tab -->
    <div v-if="activeTab === 'inventory'">
      <div class="d-flex justify-end mb-3">
        <v-btn
          v-if="inventoryItems.length > 0"
          color="success"
          @click="fishermanStore.sellAllFish()"
        >
          <v-icon start>
            mdi-currency-usd
          </v-icon>
          Sprzedaj Wszystko ({{ fishermanStore.totalFishValue }}g)
        </v-btn>
      </div>

      <v-card>
        <v-list v-if="inventoryItems.length > 0">
          <v-list-item
            v-for="item in inventoryItems"
            :key="item.id"
          >
            <template #prepend>
              <v-avatar :color="RARITY_DATA[item.rarity as keyof typeof RARITY_DATA].color">
                <v-icon color="white">
                  {{ item.icon }}
                </v-icon>
              </v-avatar>
            </template>
            <v-list-item-title>
              {{ item.name }}
              <v-chip
                size="x-small"
                :color="RARITY_DATA[item.rarity as keyof typeof RARITY_DATA].color"
                class="ml-2"
              >
                {{ RARITY_DATA[item.rarity as keyof typeof RARITY_DATA].label }}
              </v-chip>
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ item.amount }}x • {{ item.sellPrice * item.amount }}g
            </v-list-item-subtitle>
            <template #append>
              <v-btn
                size="small"
                color="success"
                variant="tonal"
                @click="fishermanStore.sellFish(item.id, item.amount)"
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
          Brak złowionych ryb
        </v-card-text>
      </v-card>
    </div>

    <!-- Collection Tab -->
    <div v-if="activeTab === 'collection'">
      <v-card>
        <v-card-title>
          Kolekcja Ryb
          <v-chip
            class="ml-2"
            color="primary"
          >
            {{ fishermanStore.fishCollection.size }}/{{ Object.keys(FISH).length }}
          </v-chip>
        </v-card-title>
        <v-card-text>
          <v-progress-linear
            :model-value="fishermanStore.collectionProgress"
            color="primary"
            height="12"
            rounded
            class="mb-4"
          >
            <template #default>
              {{ fishermanStore.collectionProgress.toFixed(1) }}%
            </template>
          </v-progress-linear>

          <v-row>
            <v-col
              v-for="fish in Object.values(FISH)"
              :key="fish.id"
              cols="4"
              sm="3"
              md="2"
            >
              <v-tooltip :text="fishermanStore.fishCollection.has(fish.id) ? fish.name : '???'">
                <template #activator="{ props }">
                  <v-avatar
                    v-bind="props"
                    :color="fishermanStore.fishCollection.has(fish.id) ? RARITY_DATA[fish.rarity].color : 'grey-lighten-2'"
                    size="48"
                    class="ma-1"
                  >
                    <v-icon :color="fishermanStore.fishCollection.has(fish.id) ? 'white' : 'grey'">
                      {{ fishermanStore.fishCollection.has(fish.id) ? fish.icon : 'mdi-help' }}
                    </v-icon>
                  </v-avatar>
                </template>
              </v-tooltip>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<style scoped>
.border-primary {
  border-color: rgb(var(--v-theme-primary)) !important;
  border-width: 2px !important;
}
</style>
