<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAteriaTownshipStore } from '../model/township.store';
import {
  TOWNSHIP_BUILDINGS, TOWNSHIP_EVENTS, CATEGORY_DATA, RARITY_DATA,
  getBuilding, calculateBuildingCost, type BuildingCategory
} from '../data/township.data';

const townshipStore = useAteriaTownshipStore();
const activeTab = ref<'buildings' | 'resources' | 'events'>('buildings');
const selectedCategory = ref<BuildingCategory | 'all'>('all');

const filteredBuildings = computed(() => {
  const buildings = Object.values(TOWNSHIP_BUILDINGS);
  if (selectedCategory.value === 'all') return buildings;
  return buildings.filter(b => b.category === selectedCategory.value);
});

const sortedBuildings = computed(() => {
  return [...filteredBuildings.value].sort((a, b) => {
    const aLevel = townshipStore.getBuildingLevel(a.id);
    const bLevel = townshipStore.getBuildingLevel(b.id);
    // Built buildings first, then by tier
    if (aLevel > 0 && bLevel === 0) return -1;
    if (bLevel > 0 && aLevel === 0) return 1;
    return a.tier - b.tier;
  });
});

function formatTime(ticks: number): string {
  const seconds = Math.ceil(ticks / 10);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs}s`;
}
</script>

<template>
  <div class="township-panel">
    <v-card class="mb-4">
      <v-card-text>
        <div class="d-flex align-center">
          <v-avatar color="teal" size="56" class="mr-4">
            <v-icon size="32" color="white">mdi-home-city</v-icon>
          </v-avatar>
          <div class="flex-grow-1">
            <div class="d-flex align-center">
              <span class="text-h5 mr-2">Osada</span>
              <v-chip size="small" color="teal">Poziom {{ townshipStore.progress.level }}</v-chip>
            </div>
            <div class="text-body-2 text-medium-emphasis">Zarządzanie osadą i budynkami</div>
            <v-progress-linear
              :model-value="townshipStore.getXpProgress()"
              color="teal"
              height="8"
              rounded
              class="mt-2"
            >
              <template #default>
                <span class="text-caption">{{ townshipStore.progress.xp }} / {{ townshipStore.progress.xpToNextLevel }} XP</span>
              </template>
            </v-progress-linear>
          </div>
        </div>

        <v-row class="mt-3">
          <v-col cols="3" class="text-center">
            <div class="text-h6">{{ townshipStore.population }}/{{ townshipStore.maxPopulation }}</div>
            <div class="text-caption">Populacja</div>
          </v-col>
          <v-col cols="3" class="text-center">
            <div class="text-h6">{{ townshipStore.happiness }}%</div>
            <div class="text-caption">Szczęście</div>
          </v-col>
          <v-col cols="3" class="text-center">
            <div class="text-h6">{{ townshipStore.defense }}</div>
            <div class="text-caption">Obrona</div>
          </v-col>
          <v-col cols="3" class="text-center">
            <div class="text-h6">{{ townshipStore.totalBuildingsBuilt }}</div>
            <div class="text-caption">Budynki</div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Active Construction -->
    <v-card v-if="townshipStore.isConstructing && townshipStore.activeConstruction" class="mb-4">
      <v-card-text>
        <div class="d-flex align-center mb-2">
          <v-avatar color="teal" size="48" class="mr-3">
            <v-icon color="white">{{ getBuilding(townshipStore.activeConstruction.buildingId)?.icon }}</v-icon>
          </v-avatar>
          <div class="flex-grow-1">
            <div class="text-h6">
              Budowa: {{ getBuilding(townshipStore.activeConstruction.buildingId)?.name }}
              Lvl {{ townshipStore.activeConstruction.targetLevel }}
            </div>
            <v-progress-linear
              :model-value="townshipStore.constructionProgress"
              color="teal"
              height="20"
              rounded
            >
              <template #default>
                {{ Math.floor(townshipStore.constructionProgress) }}% - {{ formatTime(townshipStore.activeConstruction.ticksRemaining) }}
              </template>
            </v-progress-linear>
          </div>
          <v-btn color="error" variant="tonal" class="ml-3" @click="townshipStore.cancelConstruction()">
            Anuluj
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Active Events -->
    <v-card v-if="townshipStore.activeEvents.length > 0" class="mb-4">
      <v-card-text>
        <div class="text-subtitle-2 mb-2">Aktywne wydarzenia</div>
        <div v-for="event in townshipStore.activeEvents" :key="event.eventId" class="d-flex align-center mb-2">
          <v-icon :color="TOWNSHIP_EVENTS[event.eventId]?.type === 'positive' ? 'success' : TOWNSHIP_EVENTS[event.eventId]?.type === 'negative' ? 'error' : 'info'" class="mr-2">
            {{ TOWNSHIP_EVENTS[event.eventId]?.icon }}
          </v-icon>
          <span>{{ TOWNSHIP_EVENTS[event.eventId]?.name }}</span>
          <v-spacer />
          <span class="text-caption">{{ formatTime(event.ticksRemaining) }}</span>
        </div>
      </v-card-text>
    </v-card>

    <v-tabs v-model="activeTab" color="teal" class="mb-4">
      <v-tab value="buildings"><v-icon start>mdi-home-group</v-icon>Budynki</v-tab>
      <v-tab value="resources"><v-icon start>mdi-package-variant</v-icon>Zasoby</v-tab>
      <v-tab value="events"><v-icon start>mdi-calendar</v-icon>Historia</v-tab>
    </v-tabs>

    <div v-if="activeTab === 'buildings'">
      <v-chip-group v-model="selectedCategory" mandatory class="mb-4">
        <v-chip value="all" variant="outlined">Wszystkie</v-chip>
        <v-chip
          v-for="(data, cat) in CATEGORY_DATA"
          :key="cat"
          :value="cat"
          :color="data.color"
          variant="outlined"
        >
          <v-icon start size="small">{{ data.icon }}</v-icon>
          {{ data.name }}
        </v-chip>
      </v-chip-group>

      <v-row>
        <v-col v-for="building in sortedBuildings" :key="building.id" cols="12" md="6" lg="4">
          <v-card
            :variant="townshipStore.getBuildingLevel(building.id) > 0 ? 'elevated' : 'outlined'"
            :class="{ 'border-primary': townshipStore.getBuildingLevel(building.id) > 0 }"
          >
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-avatar :color="CATEGORY_DATA[building.category].color" size="48">
                  <v-icon color="white">{{ building.icon }}</v-icon>
                </v-avatar>
                <div class="ml-3">
                  <div class="text-subtitle-1 font-weight-medium">
                    {{ building.name }}
                    <v-chip v-if="townshipStore.getBuildingLevel(building.id) > 0" size="x-small" color="success" class="ml-1">
                      Lvl {{ townshipStore.getBuildingLevel(building.id) }}
                    </v-chip>
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    {{ CATEGORY_DATA[building.category].name }} • {{ RARITY_DATA[building.rarity].label }}
                  </div>
                </div>
              </div>

              <div class="text-body-2 mb-2">{{ building.description }}</div>

              <!-- Effects -->
              <div class="mb-2">
                <v-chip
                  v-for="(effect, idx) in building.effects.slice(0, 3)"
                  :key="idx"
                  size="x-small"
                  color="primary"
                  variant="outlined"
                  class="mr-1 mb-1"
                >
                  {{ effect.description }}
                </v-chip>
              </div>

              <!-- Requirements -->
              <div v-if="building.requirements.length > 0 && townshipStore.getBuildingLevel(building.id) === 0" class="text-caption text-warning mb-2">
                <v-icon size="small">mdi-alert</v-icon>
                <span v-for="(req, idx) in building.requirements" :key="idx">
                  <template v-if="req.type === 'building'">
                    {{ getBuilding(req.buildingId!)?.name }} Lvl {{ req.value }}
                  </template>
                  <template v-else-if="req.type === 'level'">
                    {{ req.path }} Lvl {{ req.value }}
                  </template>
                  <template v-else-if="req.type === 'gold'">
                    {{ req.value }} złota
                  </template>
                  {{ idx < building.requirements.length - 1 ? ', ' : '' }}
                </span>
              </div>

              <!-- Cost and Build Button -->
              <div class="d-flex align-center">
                <v-chip size="small" color="amber" class="mr-2">
                  {{ calculateBuildingCost(building, townshipStore.getBuildingLevel(building.id)) }}g
                </v-chip>
                <v-chip size="small" color="grey" class="mr-auto">
                  ~{{ formatTime(building.buildTime * Math.pow(1.2, townshipStore.getBuildingLevel(building.id)) * 10) }}
                </v-chip>
                <v-btn
                  v-if="townshipStore.getBuildingLevel(building.id) < building.maxLevel"
                  size="small"
                  color="teal"
                  :disabled="!townshipStore.canBuild(building.id).canBuild"
                  @click="townshipStore.startConstruction(building.id)"
                >
                  {{ townshipStore.getBuildingLevel(building.id) === 0 ? 'Buduj' : 'Ulepsz' }}
                </v-btn>
                <v-chip v-else size="small" color="success">MAX</v-chip>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <div v-if="activeTab === 'resources'">
      <v-card>
        <v-card-text>
          <div class="text-h6 mb-3">Zasoby osady</div>
          <v-row>
            <v-col v-for="[resource, amount] in townshipStore.townshipResources" :key="resource" cols="6" md="3">
              <v-card variant="outlined" class="text-center pa-3">
                <v-icon size="36" :color="resource === 'gold' ? 'amber' : resource === 'food' ? 'green' : 'brown'">
                  {{ resource === 'gold' ? 'mdi-gold' : resource === 'food' ? 'mdi-food' : resource === 'wood' ? 'mdi-pine-tree' : resource === 'stone' ? 'mdi-cube' : 'mdi-diamond-stone' }}
                </v-icon>
                <div class="text-h6 mt-2">{{ Math.floor(amount) }}</div>
                <div class="text-caption text-capitalize">{{ resource }}</div>
                <div class="text-caption text-success" v-if="townshipStore.resourceProduction.get(resource)">
                  +{{ townshipStore.resourceProduction.get(resource) }}/min
                </div>
                <v-btn
                  v-if="amount >= 1"
                  size="small"
                  color="primary"
                  variant="tonal"
                  class="mt-2"
                  @click="townshipStore.collectResource(resource)"
                >
                  Zbierz
                </v-btn>
              </v-card>
            </v-col>
          </v-row>

          <v-divider class="my-4" />

          <div class="text-h6 mb-3">Globalne bonusy z budynków</div>
          <div v-if="Object.keys(townshipStore.globalBonuses).length > 0">
            <div v-for="(stats, target) in townshipStore.globalBonuses" :key="target" class="mb-2">
              <div class="text-subtitle-2 text-capitalize">{{ target }}</div>
              <v-chip
                v-for="(value, stat) in stats"
                :key="stat"
                size="small"
                color="success"
                variant="outlined"
                class="mr-1"
              >
                +{{ value }}% {{ stat }}
              </v-chip>
            </div>
          </div>
          <div v-else class="text-medium-emphasis">
            Zbuduj budynki, aby uzyskać bonusy
          </div>
        </v-card-text>
      </v-card>
    </div>

    <div v-if="activeTab === 'events'">
      <v-card>
        <v-card-text>
          <div class="text-h6 mb-3">Możliwe wydarzenia</div>
          <v-list>
            <v-list-item v-for="event in Object.values(TOWNSHIP_EVENTS)" :key="event.id">
              <template #prepend>
                <v-avatar
                  :color="event.type === 'positive' ? 'success' : event.type === 'negative' ? 'error' : 'info'"
                  size="40"
                >
                  <v-icon color="white">{{ event.icon }}</v-icon>
                </v-avatar>
              </template>
              <v-list-item-title>{{ event.name }}</v-list-item-title>
              <v-list-item-subtitle>{{ event.description }}</v-list-item-subtitle>
              <template #append>
                <div class="text-caption">
                  <div v-for="(eff, idx) in event.effects" :key="idx" :class="eff.value > 0 ? 'text-success' : 'text-error'">
                    {{ eff.value > 0 ? '+' : '' }}{{ eff.value }}% {{ eff.stat }}
                  </div>
                </div>
              </template>
            </v-list-item>
          </v-list>
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
