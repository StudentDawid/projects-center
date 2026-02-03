<script setup lang="ts">
/**
 * Bard Panel - Songs, Performances, Instruments
 */

import { computed, ref } from 'vue';
import { useAteriaBardStore } from '../model/bard.store';
import {
  SONGS,
  INSTRUMENTS,
  VENUES,
  GENRES,
  PERFORMANCE_QUALITY,
  getGenreColor,
  getGenreName,
  type SongGenre,
} from '../data/bard.data';

const bardStore = useAteriaBardStore();

// UI State
const activeTab = ref<'perform' | 'songs' | 'instruments' | 'history'>('perform');
const selectedSong = ref<string | null>(null);
const selectedVenue = ref<string | null>(null);
const selectedGenre = ref<SongGenre | 'all'>('all');

// Computed
const filteredSongs = computed(() => {
  if (selectedGenre.value === 'all') {
    return bardStore.availableSongs;
  }
  return bardStore.availableSongs.filter(s => s.genre === selectedGenre.value);
});

const unlearnedSongs = computed(() => {
  return Object.values(SONGS).filter(s => 
    !bardStore.learnedSongs.has(s.id) && 
    s.requiredLevel <= bardStore.progress.level
  );
});

// Actions
function startPerformance() {
  if (selectedSong.value && selectedVenue.value) {
    bardStore.startPerformance(selectedSong.value, selectedVenue.value);
  }
}

function canPerformSelected(): boolean {
  if (!selectedSong.value || !selectedVenue.value) return false;
  return bardStore.canPerform(selectedSong.value, selectedVenue.value).canPerform;
}
</script>

<template>
  <div class="bard-panel">
    <!-- Header -->
    <v-card class="mb-4">
      <v-card-text>
        <div class="d-flex align-center">
          <v-avatar
            color="pink"
            size="56"
            class="mr-4"
          >
            <v-icon
              size="32"
              color="white"
            >
              mdi-music
            </v-icon>
          </v-avatar>
          <div class="flex-grow-1">
            <div class="d-flex align-center">
              <span class="text-h5 mr-2">Bard</span>
              <v-chip
                size="small"
                color="pink"
              >
                Poziom {{ bardStore.progress.level }}
              </v-chip>
            </div>
            <div class="text-body-2 text-medium-emphasis">
              Pieśni, występy, sława
            </div>
            <v-progress-linear
              :model-value="bardStore.getXpProgress()"
              color="pink"
              height="8"
              rounded
              class="mt-2"
            >
              <template #default>
                <span class="text-caption">
                  {{ bardStore.progress.xp }} / {{ bardStore.progress.xpToNextLevel }} XP
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
              {{ bardStore.totalPerformances }}
            </div>
            <div class="text-caption">
              Występy
            </div>
          </v-col>
          <v-col
            cols="3"
            class="text-center"
          >
            <div class="text-h6">
              {{ bardStore.reputation }}
            </div>
            <div class="text-caption">
              Reputacja
            </div>
          </v-col>
          <v-col
            cols="3"
            class="text-center"
          >
            <div class="text-h6">
              {{ bardStore.learnedSongs.size }}
            </div>
            <div class="text-caption">
              Pieśni
            </div>
          </v-col>
          <v-col
            cols="3"
            class="text-center"
          >
            <div class="text-h6 text-amber">
              {{ bardStore.totalTipsEarned }}g
            </div>
            <div class="text-caption">
              Napiwki
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Active Performance -->
    <v-card
      v-if="bardStore.isPerforming && bardStore.activePerformance"
      class="mb-4"
    >
      <v-card-text>
        <div class="d-flex align-center mb-2">
          <v-avatar
            color="pink"
            size="48"
            class="mr-3"
          >
            <v-icon color="white">
              mdi-music-note
            </v-icon>
          </v-avatar>
          <div class="flex-grow-1">
            <div class="text-h6">
              Występ: {{ SONGS[bardStore.activePerformance.songId]?.name }}
              w {{ VENUES[bardStore.activePerformance.venueId]?.name }}
            </div>
            <v-progress-linear
              :model-value="bardStore.performanceProgress"
              color="pink"
              height="20"
              rounded
            >
              <template #default>
                {{ Math.floor(bardStore.performanceProgress) }}%
              </template>
            </v-progress-linear>
          </div>
          <v-btn
            color="error"
            variant="tonal"
            class="ml-3"
            @click="bardStore.cancelPerformance()"
          >
            Anuluj
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Tabs -->
    <v-tabs
      v-model="activeTab"
      color="pink"
      class="mb-4"
    >
      <v-tab value="perform">
        <v-icon start>
          mdi-music-note
        </v-icon>
        Występ
      </v-tab>
      <v-tab value="songs">
        <v-icon start>
          mdi-playlist-music
        </v-icon>
        Pieśni
      </v-tab>
      <v-tab value="instruments">
        <v-icon start>
          mdi-guitar-acoustic
        </v-icon>
        Instrumenty
      </v-tab>
      <v-tab value="history">
        <v-icon start>
          mdi-history
        </v-icon>
        Historia
      </v-tab>
    </v-tabs>

    <!-- Perform Tab -->
    <div v-if="activeTab === 'perform'">
      <v-row>
        <!-- Song Selection -->
        <v-col
          cols="12"
          md="6"
        >
          <v-card>
            <v-card-title>Wybierz Pieśń</v-card-title>
            <v-card-text>
              <v-chip-group
                v-model="selectedGenre"
                mandatory
                class="mb-3"
              >
                <v-chip
                  value="all"
                  variant="outlined"
                  size="small"
                >
                  Wszystkie
                </v-chip>
                <v-chip
                  v-for="(data, genre) in GENRES"
                  :key="genre"
                  :value="genre"
                  :color="data.color"
                  variant="outlined"
                  size="small"
                >
                  {{ data.name }}
                </v-chip>
              </v-chip-group>

              <v-list
                max-height="300"
                class="overflow-y-auto"
              >
                <v-list-item
                  v-for="song in filteredSongs"
                  :key="song.id"
                  :active="selectedSong === song.id"
                  @click="selectedSong = song.id"
                >
                  <template #prepend>
                    <v-avatar
                      :color="getGenreColor(song.genre)"
                      size="40"
                    >
                      <v-icon
                        color="white"
                        size="small"
                      >
                        {{ song.icon }}
                      </v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title>{{ song.name }}</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ getGenreName(song.genre) }} • Tier {{ song.tier }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Venue Selection -->
        <v-col
          cols="12"
          md="6"
        >
          <v-card>
            <v-card-title>Wybierz Miejsce</v-card-title>
            <v-card-text>
              <v-list
                max-height="380"
                class="overflow-y-auto"
              >
                <v-list-item
                  v-for="venue in bardStore.availableVenues"
                  :key="venue.id"
                  :active="selectedVenue === venue.id"
                  @click="selectedVenue = venue.id"
                >
                  <template #prepend>
                    <v-avatar
                      color="primary"
                      size="40"
                    >
                      <v-icon
                        color="white"
                        size="small"
                      >
                        {{ venue.icon }}
                      </v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title>{{ venue.name }}</v-list-item-title>
                  <v-list-item-subtitle>
                    x{{ venue.tipMultiplier }} napiwki • {{ venue.audienceSize }} publiczność
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Start Performance Button -->
      <v-card class="mt-4">
        <v-card-text class="text-center">
          <div
            v-if="selectedSong && selectedVenue"
            class="mb-3"
          >
            <v-chip
              :color="getGenreColor(SONGS[selectedSong]?.genre || 'folk')"
              class="mr-2"
            >
              {{ SONGS[selectedSong]?.name }}
            </v-chip>
            w
            <v-chip
              color="primary"
              class="ml-2"
            >
              {{ VENUES[selectedVenue]?.name }}
            </v-chip>
          </div>
          <v-btn
            color="pink"
            size="large"
            :disabled="!canPerformSelected() || bardStore.isPerforming"
            @click="startPerformance()"
          >
            <v-icon start>
              mdi-play
            </v-icon>
            Rozpocznij Występ
          </v-btn>
        </v-card-text>
      </v-card>
    </div>

    <!-- Songs Tab -->
    <div v-if="activeTab === 'songs'">
      <v-card
        v-if="unlearnedSongs.length > 0"
        class="mb-4"
      >
        <v-card-title>Dostępne do nauki</v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item
              v-for="song in unlearnedSongs"
              :key="song.id"
            >
              <template #prepend>
                <v-avatar :color="getGenreColor(song.genre)">
                  <v-icon color="white">
                    {{ song.icon }}
                  </v-icon>
                </v-avatar>
              </template>
              <v-list-item-title>{{ song.name }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ getGenreName(song.genre) }} • {{ song.description }}
              </v-list-item-subtitle>
              <template #append>
                <v-btn
                  color="primary"
                  @click="bardStore.learnSong(song.id)"
                >
                  Naucz ({{ song.tier * 100 }}g)
                </v-btn>
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>

      <v-card>
        <v-card-title>Twoje Pieśni ({{ bardStore.learnedSongs.size }})</v-card-title>
        <v-card-text>
          <v-row>
            <v-col
              v-for="songId in Array.from(bardStore.learnedSongs)"
              :key="songId"
              cols="6"
              md="4"
              lg="3"
            >
              <v-card
                variant="outlined"
                class="text-center pa-2"
              >
                <v-avatar
                  :color="getGenreColor(SONGS[songId]?.genre || 'folk')"
                  size="48"
                  class="mb-2"
                >
                  <v-icon color="white">
                    {{ SONGS[songId]?.icon }}
                  </v-icon>
                </v-avatar>
                <div class="text-subtitle-2">
                  {{ SONGS[songId]?.name }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  {{ getGenreName(SONGS[songId]?.genre || 'folk') }}
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </div>

    <!-- Instruments Tab -->
    <div v-if="activeTab === 'instruments'">
      <v-card>
        <v-card-title>Instrumenty</v-card-title>
        <v-card-text>
          <v-row>
            <v-col
              v-for="instrument in Object.values(INSTRUMENTS)"
              :key="instrument.id"
              cols="12"
              md="6"
              lg="4"
            >
              <v-card
                :variant="bardStore.ownedInstruments.has(instrument.id) ? 'elevated' : 'outlined'"
                :class="{ 'border-primary': bardStore.equippedInstrument === instrument.id }"
              >
                <v-card-text>
                  <div class="d-flex align-center mb-2">
                    <v-icon
                      size="36"
                      :color="bardStore.ownedInstruments.has(instrument.id) ? 'pink' : 'grey'"
                    >
                      {{ instrument.icon }}
                    </v-icon>
                    <div class="ml-3">
                      <div class="font-weight-medium">
                        {{ instrument.name }}
                      </div>
                      <div class="text-caption">
                        Tier {{ instrument.tier }} • Lvl {{ instrument.requiredLevel }}
                      </div>
                    </div>
                  </div>

                  <div class="text-body-2 mb-2">
                    {{ instrument.description }}
                  </div>

                  <div class="text-caption mb-2">
                    Jakość: {{ instrument.quality }}
                    <span v-if="instrument.genreBonus">
                      • Bonus: {{ getGenreName(instrument.genreBonus) }}
                    </span>
                  </div>

                  <v-btn
                    v-if="!bardStore.ownedInstruments.has(instrument.id)"
                    size="small"
                    color="amber"
                    block
                    :disabled="instrument.requiredLevel > bardStore.progress.level || instrument.cost === 0"
                    @click="bardStore.buyInstrument(instrument.id)"
                  >
                    {{ instrument.cost > 0 ? `Kup (${instrument.cost}g)` : 'Posiadasz' }}
                  </v-btn>
                  <v-btn
                    v-else-if="bardStore.equippedInstrument !== instrument.id"
                    size="small"
                    color="primary"
                    block
                    @click="bardStore.equipInstrument(instrument.id)"
                  >
                    Załóż
                  </v-btn>
                  <v-chip
                    v-else
                    color="success"
                    block
                  >
                    Założony
                  </v-chip>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </div>

    <!-- History Tab -->
    <div v-if="activeTab === 'history'">
      <v-card>
        <v-card-title>Historia Występów</v-card-title>
        <v-card-text>
          <v-list v-if="bardStore.performanceHistory.length > 0">
            <v-list-item
              v-for="(perf, idx) in bardStore.performanceHistory.slice(0, 20)"
              :key="idx"
            >
              <template #prepend>
                <v-avatar :color="PERFORMANCE_QUALITY[perf.quality]?.color || 'grey'">
                  <v-icon color="white">
                    {{ SONGS[perf.songId]?.icon }}
                  </v-icon>
                </v-avatar>
              </template>
              <v-list-item-title>
                {{ SONGS[perf.songId]?.name }}
                <v-chip
                  size="x-small"
                  :color="PERFORMANCE_QUALITY[perf.quality]?.color"
                  class="ml-2"
                >
                  {{ PERFORMANCE_QUALITY[perf.quality]?.label }}
                </v-chip>
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ VENUES[perf.venueId]?.name }} • +{{ perf.tipsEarned }}g • +{{ perf.reputationGained }} rep
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
          <div
            v-else
            class="text-center py-8 text-medium-emphasis"
          >
            Brak historii występów
          </div>
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
