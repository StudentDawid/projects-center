<script setup lang="ts">
/**
 * Explorer Panel - Regions, Expeditions, Discoveries
 */

import { computed, ref } from 'vue';
import { useAteriaExplorerStore } from '../model/explorer.store';
import {
  REGIONS,
  DISCOVERIES,
  EXPLORER_GEAR,
  EXPEDITIONS,
  TERRAINS,
  DIFFICULTY_DATA,
  getTerrainColor,
  getTerrainName,
  getRarityColor,
} from '../data/explorer.data';

const explorerStore = useAteriaExplorerStore();

// UI State
const activeTab = ref<'regions' | 'expeditions' | 'discoveries' | 'gear'>('regions');

// Computed
const regionDiscoveries = computed(() => {
  const result: Record<string, { found: number; total: number }> = {};
  for (const region of Object.values(REGIONS)) {
    const found = region.possibleDiscoveries.filter(d => explorerStore.discoveries.has(d)).length;
    result[region.id] = { found, total: region.possibleDiscoveries.length };
  }
  return result;
});

const discoveryList = computed(() => {
  return Object.values(DISCOVERIES).map(d => ({
    ...d,
    discovered: explorerStore.discoveries.has(d.id),
  }));
});

const availableExpeditions = computed(() => {
  return Object.values(EXPEDITIONS).filter(e => e.requiredLevel <= explorerStore.progress.level);
});
</script>

<template>
  <div class="explorer-panel">
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
              mdi-compass
            </v-icon>
          </v-avatar>
          <div class="flex-grow-1">
            <div class="d-flex align-center">
              <span class="text-h5 mr-2">Odkrywca</span>
              <v-chip
                size="small"
                color="green"
              >
                Poziom {{ explorerStore.progress.level }}
              </v-chip>
            </div>
            <div class="text-body-2 text-medium-emphasis">
              Eksploracja, wyprawy, artefakty
            </div>
            <v-progress-linear
              :model-value="explorerStore.getXpProgress()"
              color="green"
              height="8"
              rounded
              class="mt-2"
            >
              <template #default>
                <span class="text-caption">
                  {{ explorerStore.progress.xp }} / {{ explorerStore.progress.xpToNextLevel }} XP
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
              {{ explorerStore.totalExplorations }}
            </div>
            <div class="text-caption">
              Eksploracje
            </div>
          </v-col>
          <v-col
            cols="3"
            class="text-center"
          >
            <div class="text-h6">
              {{ explorerStore.totalDiscoveriesCount }}/{{ explorerStore.totalDiscoveriesAvailable }}
            </div>
            <div class="text-caption">
              Odkrycia
            </div>
          </v-col>
          <v-col
            cols="3"
            class="text-center"
          >
            <div class="text-h6">
              {{ explorerStore.totalExpeditions }}
            </div>
            <div class="text-caption">
              Wyprawy
            </div>
          </v-col>
          <v-col
            cols="3"
            class="text-center"
          >
            <div class="text-h6 text-amber">
              {{ explorerStore.totalGoldFound }}g
            </div>
            <div class="text-caption">
              Znalezione
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Active Exploration/Expedition -->
    <v-card
      v-if="explorerStore.isExploring && explorerStore.activeExploration"
      class="mb-4"
    >
      <v-card-text>
        <div class="d-flex align-center mb-2">
          <v-avatar
            color="green"
            size="48"
            class="mr-3"
          >
            <v-icon color="white">
              mdi-compass
            </v-icon>
          </v-avatar>
          <div class="flex-grow-1">
            <div class="text-h6">
              Eksploracja: {{ REGIONS[explorerStore.activeExploration.regionId]?.name }}
            </div>
            <v-progress-linear
              :model-value="explorerStore.explorationProgress"
              color="green"
              height="20"
              rounded
            >
              <template #default>
                {{ Math.floor(explorerStore.explorationProgress) }}%
              </template>
            </v-progress-linear>
          </div>
          <v-btn
            color="error"
            variant="tonal"
            class="ml-3"
            @click="explorerStore.cancelExploration()"
          >
            Anuluj
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <v-card
      v-if="explorerStore.isOnExpedition && explorerStore.activeExpedition"
      class="mb-4"
    >
      <v-card-text>
        <div class="d-flex align-center mb-2">
          <v-avatar
            color="amber"
            size="48"
            class="mr-3"
          >
            <v-icon color="white">
              mdi-flag
            </v-icon>
          </v-avatar>
          <div class="flex-grow-1">
            <div class="text-h6">
              Wyprawa: {{ EXPEDITIONS[explorerStore.activeExpedition.expeditionId]?.name }}
            </div>
            <v-progress-linear
              :model-value="explorerStore.expeditionProgress"
              color="amber"
              height="20"
              rounded
            >
              <template #default>
                {{ Math.floor(explorerStore.expeditionProgress) }}%
              </template>
            </v-progress-linear>
          </div>
          <v-btn
            color="error"
            variant="tonal"
            class="ml-3"
            @click="explorerStore.cancelExpedition()"
          >
            Przerwij
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Tabs -->
    <v-tabs
      v-model="activeTab"
      color="green"
      class="mb-4"
    >
      <v-tab value="regions">
        <v-icon start>
          mdi-map
        </v-icon>
        Regiony
      </v-tab>
      <v-tab value="expeditions">
        <v-icon start>
          mdi-flag
        </v-icon>
        Wyprawy
      </v-tab>
      <v-tab value="discoveries">
        <v-icon start>
          mdi-star
        </v-icon>
        Odkrycia
      </v-tab>
      <v-tab value="gear">
        <v-icon start>
          mdi-bag-personal
        </v-icon>
        Sprzęt
      </v-tab>
    </v-tabs>

    <!-- Regions Tab -->
    <div v-if="activeTab === 'regions'">
      <v-row>
        <v-col
          v-for="region in explorerStore.availableRegions"
          :key="region.id"
          cols="12"
          md="6"
        >
          <v-card variant="outlined">
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-avatar
                  :color="getTerrainColor(region.terrain)"
                  size="48"
                >
                  <v-icon color="white">
                    {{ region.icon }}
                  </v-icon>
                </v-avatar>
                <div class="ml-3">
                  <div class="text-subtitle-1 font-weight-medium">
                    {{ region.name }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    {{ getTerrainName(region.terrain) }} • Lvl {{ region.requiredLevel }}
                  </div>
                </div>
              </div>

              <div class="text-body-2 mb-2">
                {{ region.description }}
              </div>

              <!-- Progress -->
              <div class="mb-2">
                <v-progress-linear
                  :model-value="(regionDiscoveries[region.id]?.found / regionDiscoveries[region.id]?.total) * 100"
                  color="primary"
                  height="8"
                  rounded
                />
                <div class="text-caption text-center mt-1">
                  Odkrycia: {{ regionDiscoveries[region.id]?.found }}/{{ regionDiscoveries[region.id]?.total }}
                </div>
              </div>

              <!-- Stats -->
              <div class="d-flex flex-wrap gap-1 mb-2">
                <v-chip
                  size="x-small"
                  color="success"
                >
                  +{{ region.xpPerExplore }} XP
                </v-chip>
                <v-chip
                  size="x-small"
                  color="amber"
                >
                  {{ region.goldRange[0] }}-{{ region.goldRange[1] }}g
                </v-chip>
              </div>

              <v-btn
                color="green"
                block
                :disabled="!explorerStore.canExplore(region.id).canExplore || explorerStore.isExploring || explorerStore.isOnExpedition"
                @click="explorerStore.startExploration(region.id)"
              >
                <v-icon start>
                  mdi-compass
                </v-icon>
                Eksploruj
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Expeditions Tab -->
    <div v-if="activeTab === 'expeditions'">
      <v-card>
        <v-list v-if="availableExpeditions.length > 0">
          <v-list-item
            v-for="expedition in availableExpeditions"
            :key="expedition.id"
          >
            <template #prepend>
              <v-avatar :color="DIFFICULTY_DATA[expedition.difficulty].color">
                <v-icon color="white">
                  {{ expedition.icon }}
                </v-icon>
              </v-avatar>
            </template>
            <v-list-item-title>
              {{ expedition.name }}
              <v-chip
                size="x-small"
                :color="DIFFICULTY_DATA[expedition.difficulty].color"
                class="ml-2"
              >
                {{ DIFFICULTY_DATA[expedition.difficulty].label }}
              </v-chip>
              <v-chip
                v-if="explorerStore.completedExpeditions.has(expedition.id)"
                size="x-small"
                color="success"
                class="ml-1"
              >
                Ukończona
              </v-chip>
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ expedition.description }}
              <br>
              Region: {{ REGIONS[expedition.regionId]?.name }} • Koszt: {{ expedition.supplyCost }}g • 
              Nagroda: {{ expedition.xpReward }} XP, {{ expedition.goldReward }}g
            </v-list-item-subtitle>
            <template #append>
              <v-btn
                :disabled="!explorerStore.canStartExpedition(expedition.id).canStart || explorerStore.isOnExpedition || explorerStore.isExploring"
                color="amber"
                @click="explorerStore.startExpedition(expedition.id)"
              >
                Wyrusz
              </v-btn>
            </template>
          </v-list-item>
        </v-list>
        <v-card-text
          v-else
          class="text-center py-8 text-medium-emphasis"
        >
          Brak dostępnych wypraw
        </v-card-text>
      </v-card>
    </div>

    <!-- Discoveries Tab -->
    <div v-if="activeTab === 'discoveries'">
      <v-card>
        <v-card-title>
          Odkrycia
          <v-chip
            class="ml-2"
            color="primary"
          >
            {{ explorerStore.totalDiscoveriesCount }}/{{ explorerStore.totalDiscoveriesAvailable }}
          </v-chip>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col
              v-for="discovery in discoveryList"
              :key="discovery.id"
              cols="6"
              sm="4"
              md="3"
            >
              <v-tooltip :text="discovery.discovered ? `${discovery.name}: ${discovery.description}` : '???'">
                <template #activator="{ props }">
                  <v-avatar
                    v-bind="props"
                    :color="discovery.discovered ? getRarityColor(discovery.rarity) : 'grey-lighten-2'"
                    size="48"
                    class="ma-1"
                  >
                    <v-icon :color="discovery.discovered ? 'white' : 'grey'">
                      {{ discovery.discovered ? discovery.icon : 'mdi-help' }}
                    </v-icon>
                  </v-avatar>
                </template>
              </v-tooltip>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </div>

    <!-- Gear Tab -->
    <div v-if="activeTab === 'gear'">
      <v-card>
        <v-card-title>Sprzęt Odkrywcy</v-card-title>
        <v-card-text>
          <v-row>
            <v-col
              v-for="gear in Object.values(EXPLORER_GEAR)"
              :key="gear.id"
              cols="12"
              md="6"
              lg="4"
            >
              <v-card
                :variant="explorerStore.ownedGear.has(gear.id) ? 'elevated' : 'outlined'"
                :class="{ 'border-primary': explorerStore.equippedGear.has(gear.id) }"
              >
                <v-card-text>
                  <div class="d-flex align-center mb-2">
                    <v-icon
                      size="36"
                      :color="explorerStore.ownedGear.has(gear.id) ? 'green' : 'grey'"
                    >
                      {{ gear.icon }}
                    </v-icon>
                    <div class="ml-3">
                      <div class="font-weight-medium">
                        {{ gear.name }}
                      </div>
                      <div class="text-caption">
                        Tier {{ gear.tier }} • Lvl {{ gear.requiredLevel }}
                      </div>
                    </div>
                  </div>

                  <div class="text-body-2 mb-2">
                    {{ gear.description }}
                  </div>

                  <div class="text-caption mb-2">
                    <span v-if="gear.exploreSpeedBonus">
                      +{{ gear.exploreSpeedBonus }}% szybkość
                    </span>
                    <span v-if="gear.discoveryChanceBonus">
                      • +{{ gear.discoveryChanceBonus }}% odkrycia
                    </span>
                    <span v-if="gear.survivalBonus">
                      • +{{ gear.survivalBonus }}% przetrwanie
                    </span>
                  </div>

                  <v-btn
                    v-if="!explorerStore.ownedGear.has(gear.id)"
                    size="small"
                    color="amber"
                    block
                    :disabled="gear.requiredLevel > explorerStore.progress.level"
                    @click="explorerStore.buyGear(gear.id)"
                  >
                    Kup ({{ gear.cost }}g)
                  </v-btn>
                  <v-btn
                    v-else-if="!explorerStore.equippedGear.has(gear.id)"
                    size="small"
                    color="primary"
                    block
                    @click="explorerStore.equipGear(gear.id)"
                  >
                    Załóż
                  </v-btn>
                  <v-btn
                    v-else
                    size="small"
                    color="grey"
                    block
                    @click="explorerStore.unequipGear(gear.id)"
                  >
                    Zdejmij
                  </v-btn>
                </v-card-text>
              </v-card>
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
