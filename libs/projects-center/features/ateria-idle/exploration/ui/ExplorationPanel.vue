<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAteriaExplorationStore } from '../model/exploration.store';
import { useAteriaWarriorStore } from '../../warrior/model/warrior.store';
import {
  WORLD_REGIONS, POINTS_OF_INTEREST, EXPEDITIONS,
  getRegion, getPOI, type RegionId, type WorldRegion
} from '../data/exploration.data';

const explorationStore = useAteriaExplorationStore();
const warriorStore = useAteriaWarriorStore();

const activeTab = ref<'map' | 'pois' | 'expeditions' | 'stats'>('map');
const selectedRegion = ref<RegionId | null>(null);

const sortedRegions = computed(() => {
  return Object.values(WORLD_REGIONS).sort((a, b) => a.level - b.level);
});

const terrainColors: Record<string, string> = {
  plains: '#8BC34A',
  forest: '#2E7D32',
  mountain: '#78909C',
  desert: '#FF9800',
  tundra: '#B3E5FC',
  swamp: '#5D4037',
  volcanic: '#D32F2F',
  ocean: '#1976D2',
  void: '#311B92',
};

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function formatCooldown(ms: number): string {
  if (ms <= 0) return 'Dostępne';
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

function selectRegion(regionId: RegionId) {
  selectedRegion.value = selectedRegion.value === regionId ? null : regionId;
}
</script>

<template>
  <div class="exploration-panel">
    <!-- Header Stats -->
    <v-card class="mb-4">
      <v-card-text>
        <div class="d-flex align-center">
          <v-avatar color="green-darken-2" size="56" class="mr-4">
            <v-icon size="32" color="white">mdi-compass</v-icon>
          </v-avatar>
          <div class="flex-grow-1">
            <div class="d-flex align-center">
              <span class="text-h5 mr-2">Eksploracja Świata</span>
              <v-chip v-if="explorationStore.isTraveling" size="small" color="warning">
                W podróży
              </v-chip>
              <v-chip v-else-if="explorationStore.isOnExpedition" size="small" color="info">
                Na ekspedycji
              </v-chip>
            </div>
            <div class="text-body-2 text-medium-emphasis">
              Obecna lokacja: <strong>{{ explorationStore.currentRegionData?.name }}</strong>
            </div>
          </div>
        </div>

        <v-row class="mt-3">
          <v-col cols="3" class="text-center">
            <div class="text-h6">{{ explorationStore.stats.regionsExplored }}</div>
            <div class="text-caption">Regiony</div>
          </v-col>
          <v-col cols="3" class="text-center">
            <div class="text-h6">{{ explorationStore.stats.poisDiscovered }}</div>
            <div class="text-caption">Odkrycia</div>
          </v-col>
          <v-col cols="3" class="text-center">
            <div class="text-h6">{{ explorationStore.stats.totalTravels }}</div>
            <div class="text-caption">Podróże</div>
          </v-col>
          <v-col cols="3" class="text-center">
            <div class="text-h6">{{ explorationStore.stats.expeditionsCompleted }}</div>
            <div class="text-caption">Ekspedycje</div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Active Travel -->
    <v-card v-if="explorationStore.isTraveling" class="mb-4 travel-card">
      <v-card-text>
        <div class="d-flex align-center mb-3">
          <v-avatar color="warning" size="48" class="mr-3">
            <v-icon>mdi-walk</v-icon>
          </v-avatar>
          <div class="flex-grow-1">
            <div class="text-h6">Podróż w toku</div>
            <div class="text-caption">
              {{ getRegion(explorationStore.activeTravel!.fromRegion)?.name }} →
              {{ getRegion(explorationStore.activeTravel!.toRegion)?.name }}
            </div>
          </div>
          <v-btn color="error" variant="tonal" size="small" @click="explorationStore.cancelTravel()">
            Anuluj
          </v-btn>
        </div>
        <v-progress-linear
          :model-value="explorationStore.travelProgress"
          color="warning"
          height="20"
          rounded
        >
          <template #default>
            {{ explorationStore.travelProgress.toFixed(0) }}%
          </template>
        </v-progress-linear>
      </v-card-text>
    </v-card>

    <!-- Pending Event -->
    <v-dialog v-model="explorationStore.pendingEvent" max-width="500" persistent>
      <v-card v-if="explorationStore.pendingEvent">
        <v-card-title class="d-flex align-center">
          <v-icon :color="explorationStore.pendingEvent.event.type === 'combat' ? 'error' : 'warning'" class="mr-2">
            {{ explorationStore.pendingEvent.event.icon }}
          </v-icon>
          {{ explorationStore.pendingEvent.event.name }}
        </v-card-title>
        <v-card-text>
          <p class="mb-4">{{ explorationStore.pendingEvent.event.description }}</p>
          <div class="d-flex flex-column gap-2">
            <v-btn
              v-for="outcome in explorationStore.pendingEvent.outcomes"
              :key="outcome.id"
              color="primary"
              variant="outlined"
              @click="explorationStore.resolveEvent(
                explorationStore.activeTravel!.events.findIndex(e => !e.resolved),
                outcome.id
              )"
            >
              {{ outcome.text }}
              <v-chip v-if="outcome.rewards?.gold" size="x-small" color="amber" class="ml-2">
                {{ outcome.rewards.gold > 0 ? '+' : '' }}{{ outcome.rewards.gold }}g
              </v-chip>
              <v-chip v-if="outcome.damage" size="x-small" color="error" class="ml-2">
                -{{ outcome.damage }} HP
              </v-chip>
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Active Expedition -->
    <v-card v-if="explorationStore.isOnExpedition" class="mb-4">
      <v-card-text>
        <div class="d-flex align-center mb-3">
          <v-avatar color="info" size="48" class="mr-3">
            <v-icon>mdi-flag</v-icon>
          </v-avatar>
          <div class="flex-grow-1">
            <div class="text-h6">Ekspedycja w toku</div>
            <div class="text-caption">
              {{ EXPEDITIONS.find(e => e.id === explorationStore.activeExpedition!.expeditionId)?.name }}
            </div>
          </div>
          <v-btn color="error" variant="tonal" size="small" @click="explorationStore.cancelExpedition()">
            Anuluj
          </v-btn>
        </div>
        <v-progress-linear
          :model-value="explorationStore.expeditionProgress"
          color="info"
          height="20"
          rounded
        >
          <template #default>
            {{ explorationStore.expeditionProgress.toFixed(0) }}%
          </template>
        </v-progress-linear>
      </v-card-text>
    </v-card>

    <!-- Tabs -->
    <v-tabs v-model="activeTab" color="green-darken-2" class="mb-4">
      <v-tab value="map">
        <v-icon start>mdi-map</v-icon>
        Mapa ({{ explorationStore.discoveredRegions.size }}/{{ Object.keys(WORLD_REGIONS).length }})
      </v-tab>
      <v-tab value="pois">
        <v-icon start>mdi-map-marker</v-icon>
        Miejsca ({{ explorationStore.discoveredPOIs.size }})
      </v-tab>
      <v-tab value="expeditions">
        <v-icon start>mdi-flag</v-icon>
        Ekspedycje
      </v-tab>
      <v-tab value="stats">
        <v-icon start>mdi-chart-bar</v-icon>
        Statystyki
      </v-tab>
    </v-tabs>

    <!-- Map Tab -->
    <div v-if="activeTab === 'map'">
      <v-row>
        <v-col cols="12" md="8">
          <v-card>
            <v-card-title>Mapa Świata</v-card-title>
            <v-card-text>
              <v-row>
                <v-col v-for="region in sortedRegions" :key="region.id" cols="6" md="4">
                  <v-card
                    :variant="explorationStore.currentRegion === region.id ? 'elevated' : 'outlined'"
                    :class="{
                      'region-current': explorationStore.currentRegion === region.id,
                      'region-discovered': explorationStore.discoveredRegions.has(region.id),
                      'region-locked': !explorationStore.discoveredRegions.has(region.id) && warriorStore.stats.level < region.level,
                    }"
                    :style="{ borderColor: region.color }"
                    @click="selectRegion(region.id)"
                    style="cursor: pointer"
                  >
                    <v-card-text class="pa-3">
                      <div class="d-flex align-center mb-2">
                        <v-avatar :color="region.color" size="40">
                          <v-icon color="white">{{ region.icon }}</v-icon>
                        </v-avatar>
                        <div class="ml-2 flex-grow-1">
                          <div class="text-subtitle-2">{{ region.name }}</div>
                          <div class="text-caption text-medium-emphasis">Lvl {{ region.level }}+</div>
                        </div>
                        <v-icon v-if="explorationStore.currentRegion === region.id" color="success">mdi-map-marker</v-icon>
                        <v-icon v-else-if="!explorationStore.discoveredRegions.has(region.id)" color="grey">mdi-lock</v-icon>
                        <v-icon v-else-if="explorationStore.unlockedFastTravel.has(region.id)" color="info">mdi-lightning-bolt</v-icon>
                      </div>

                      <div class="d-flex flex-wrap gap-1 mb-2">
                        <v-chip size="x-small" :color="terrainColors[region.terrain]" variant="flat">
                          {{ region.terrain }}
                        </v-chip>
                        <v-chip size="x-small" color="warning" variant="outlined">
                          Niebezp. {{ region.dangerLevel }}/10
                        </v-chip>
                      </div>

                      <div class="text-caption">{{ region.description }}</div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card v-if="selectedRegion">
            <v-card-title>
              <v-icon :color="getRegion(selectedRegion)?.color" class="mr-2">
                {{ getRegion(selectedRegion)?.icon }}
              </v-icon>
              {{ getRegion(selectedRegion)?.name }}
            </v-card-title>
            <v-card-text>
              <div class="text-body-2 mb-3">{{ getRegion(selectedRegion)?.description }}</div>
              <div class="text-caption font-italic mb-3">"{{ getRegion(selectedRegion)?.lore }}"</div>

              <v-divider class="my-2" />

              <div class="text-caption mb-2">
                <v-icon size="small">mdi-clock</v-icon>
                Czas podróży: {{ formatTime(getRegion(selectedRegion)?.travelTime || 0) }}
              </div>
              <div class="text-caption mb-2">
                <v-icon size="small">mdi-alert</v-icon>
                Poziom niebezpieczeństwa: {{ getRegion(selectedRegion)?.dangerLevel }}/10
              </div>
              <div class="text-caption mb-3">
                <v-icon size="small">mdi-map-marker</v-icon>
                POI: {{ getRegion(selectedRegion)?.pois.length }} miejsc
              </div>

              <v-btn
                v-if="selectedRegion !== explorationStore.currentRegion"
                block
                color="success"
                :disabled="!explorationStore.canTravelTo(selectedRegion).canTravel"
                @click="explorationStore.startTravel(selectedRegion)"
              >
                <v-icon start>mdi-walk</v-icon>
                {{ explorationStore.canTravelTo(selectedRegion).canTravel ? 'Podróżuj' : explorationStore.canTravelTo(selectedRegion).reason }}
              </v-btn>
              <v-chip v-else color="success" block class="w-100">
                <v-icon start>mdi-map-marker</v-icon>
                Jesteś tutaj
              </v-chip>
            </v-card-text>
          </v-card>

          <v-card v-else>
            <v-card-text class="text-center py-8 text-medium-emphasis">
              <v-icon size="48" class="mb-2">mdi-cursor-pointer</v-icon>
              <div>Wybierz region z mapy</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- POIs Tab -->
    <div v-if="activeTab === 'pois'">
      <v-card v-if="explorationStore.discoveredPOIs.size === 0">
        <v-card-text class="text-center py-8 text-medium-emphasis">
          <v-icon size="48" class="mb-2">mdi-map-marker-question</v-icon>
          <div>Nie odkryto jeszcze żadnych miejsc</div>
          <div class="text-caption">Podróżuj i eksploruj, aby odkrywać nowe miejsca!</div>
        </v-card-text>
      </v-card>

      <v-row v-else>
        <v-col v-for="[poiId, discovered] in explorationStore.discoveredPOIs" :key="poiId" cols="12" md="6" lg="4">
          <v-card v-if="getPOI(poiId)" variant="outlined">
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-avatar :color="getRegion(getPOI(poiId)!.regionId)?.color" size="40">
                  <v-icon color="white">{{ getPOI(poiId)?.icon }}</v-icon>
                </v-avatar>
                <div class="ml-3 flex-grow-1">
                  <div class="text-subtitle-1">{{ getPOI(poiId)?.name }}</div>
                  <div class="text-caption text-medium-emphasis">
                    {{ getRegion(getPOI(poiId)!.regionId)?.name }}
                  </div>
                </div>
                <v-chip size="x-small" :color="getPOI(poiId)?.type === 'dungeon' ? 'error' : 'info'">
                  {{ getPOI(poiId)?.type }}
                </v-chip>
              </div>

              <div class="text-body-2 mb-2">{{ getPOI(poiId)?.description }}</div>

              <div class="d-flex flex-wrap gap-1 mb-2">
                <v-chip v-if="getPOI(poiId)?.rewards.gold" size="x-small" color="amber">
                  {{ getPOI(poiId)?.rewards.gold }}g
                </v-chip>
                <v-chip v-if="getPOI(poiId)?.rewards.xp" size="x-small" color="purple">
                  {{ getPOI(poiId)?.rewards.xp }} XP
                </v-chip>
                <v-chip size="x-small" color="grey">
                  Odwiedzono: {{ discovered.timesVisited }}x
                </v-chip>
              </div>

              <v-btn
                block
                size="small"
                color="primary"
                :disabled="!explorationStore.canVisitPOI(poiId).canVisit"
                @click="explorationStore.visitPOI(poiId)"
              >
                {{ explorationStore.canVisitPOI(poiId).canVisit ? 'Odwiedź' : explorationStore.canVisitPOI(poiId).reason }}
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Expeditions Tab -->
    <div v-if="activeTab === 'expeditions'">
      <v-row>
        <v-col v-for="expedition in EXPEDITIONS" :key="expedition.id" cols="12" md="6">
          <v-card variant="outlined" :class="{ 'opacity-60': warriorStore.stats.level < expedition.requiredLevel }">
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-avatar :color="getRegion(expedition.targetRegion)?.color" size="48">
                  <v-icon color="white">{{ getRegion(expedition.targetRegion)?.icon }}</v-icon>
                </v-avatar>
                <div class="ml-3 flex-grow-1">
                  <div class="text-h6">{{ expedition.name }}</div>
                  <div class="text-caption text-medium-emphasis">
                    Cel: {{ getRegion(expedition.targetRegion)?.name }}
                  </div>
                </div>
                <v-chip size="small" :color="warriorStore.stats.level >= expedition.requiredLevel ? 'success' : 'error'">
                  Lvl {{ expedition.requiredLevel }}
                </v-chip>
              </div>

              <div class="text-body-2 mb-3">{{ expedition.description }}</div>

              <div class="d-flex flex-wrap gap-2 mb-3">
                <v-chip size="small" color="amber" variant="outlined">
                  <v-icon start size="small">mdi-gold</v-icon>
                  {{ expedition.rewards.gold }}g
                </v-chip>
                <v-chip size="small" color="purple" variant="outlined">
                  <v-icon start size="small">mdi-star</v-icon>
                  {{ expedition.rewards.xp }} XP
                </v-chip>
                <v-chip size="small" color="info" variant="outlined">
                  <v-icon start size="small">mdi-clock</v-icon>
                  {{ formatTime(expedition.duration) }}
                </v-chip>
                <v-chip size="small" color="success" variant="outlined">
                  <v-icon start size="small">mdi-magnify</v-icon>
                  {{ expedition.rewards.discoveryChance }}% odkrycia
                </v-chip>
              </div>

              <v-btn
                block
                color="primary"
                :disabled="!explorationStore.canStartExpedition(expedition.id).canStart"
                @click="explorationStore.startExpedition(expedition.id)"
              >
                <v-icon start>mdi-flag</v-icon>
                {{ explorationStore.canStartExpedition(expedition.id).canStart ? 'Rozpocznij' : explorationStore.canStartExpedition(expedition.id).reason }}
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Stats Tab -->
    <div v-if="activeTab === 'stats'">
      <v-row>
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>Statystyki Eksploracji</v-card-title>
            <v-card-text>
              <v-list density="compact">
                <v-list-item>
                  <template #prepend><v-icon color="green">mdi-map</v-icon></template>
                  <v-list-item-title>Odkryte regiony</v-list-item-title>
                  <template #append>{{ explorationStore.stats.regionsExplored }} / {{ Object.keys(WORLD_REGIONS).length }}</template>
                </v-list-item>
                <v-list-item>
                  <template #prepend><v-icon color="blue">mdi-map-marker</v-icon></template>
                  <v-list-item-title>Odkryte miejsca</v-list-item-title>
                  <template #append>{{ explorationStore.stats.poisDiscovered }} / {{ Object.keys(POINTS_OF_INTEREST).length }}</template>
                </v-list-item>
                <v-list-item>
                  <template #prepend><v-icon color="amber">mdi-walk</v-icon></template>
                  <v-list-item-title>Łączna liczba podróży</v-list-item-title>
                  <template #append>{{ explorationStore.stats.totalTravels }}</template>
                </v-list-item>
                <v-list-item>
                  <template #prepend><v-icon color="purple">mdi-flag</v-icon></template>
                  <v-list-item-title>Ukończone ekspedycje</v-list-item-title>
                  <template #append>{{ explorationStore.stats.expeditionsCompleted }}</template>
                </v-list-item>
                <v-list-item>
                  <template #prepend><v-icon color="orange">mdi-lightning-bolt</v-icon></template>
                  <v-list-item-title>Napotkane wydarzenia</v-list-item-title>
                  <template #append>{{ explorationStore.stats.eventsEncountered }}</template>
                </v-list-item>
                <v-list-item>
                  <template #prepend><v-icon color="yellow">mdi-treasure-chest</v-icon></template>
                  <v-list-item-title>Znalezione skarby</v-list-item-title>
                  <template #append>{{ explorationStore.stats.treasuresFound }}</template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>Szybka Podróż</v-card-title>
            <v-card-text>
              <div class="text-body-2 mb-3">
                Odblokowane punkty szybkiej podróży: {{ explorationStore.unlockedFastTravel.size }}
              </div>
              <div class="d-flex flex-wrap gap-2">
                <v-chip
                  v-for="regionId in explorationStore.unlockedFastTravel"
                  :key="regionId"
                  :color="getRegion(regionId)?.color"
                  variant="elevated"
                  @click="explorationStore.startTravel(regionId)"
                  :disabled="regionId === explorationStore.currentRegion || explorationStore.isTraveling"
                >
                  <v-icon start>{{ getRegion(regionId)?.icon }}</v-icon>
                  {{ getRegion(regionId)?.name }}
                </v-chip>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<style scoped>
.travel-card {
  border: 2px solid rgb(var(--v-theme-warning));
  background: linear-gradient(135deg, rgba(255, 152, 0, 0.1), transparent);
}

.region-current {
  border-width: 3px !important;
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.3);
}

.region-discovered {
  opacity: 1;
}

.region-locked {
  opacity: 0.5;
}

.opacity-60 {
  opacity: 0.6;
}
</style>
