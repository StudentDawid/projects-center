<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAteriaCalendarStore } from '../model/calendar.store';
import {
  SEASONS, WEATHER_DATA, TIME_OF_DAY, MOON_PHASES, FESTIVALS, DAILY_BONUSES,
  type Season
} from '../data/calendar.data';

const calendarStore = useAteriaCalendarStore();

const activeTab = ref<'overview' | 'calendar' | 'weather' | 'bonuses'>('overview');

const allSeasons = Object.values(SEASONS);
const allMoonPhases = Object.values(MOON_PHASES);

const upcomingFestivals = computed(() => {
  const currentDay = calendarStore.dayOfSeason;
  return FESTIVALS
    .filter(f => f.season === calendarStore.currentSeason && f.dayOfSeason > currentDay)
    .sort((a, b) => a.dayOfSeason - b.dayOfSeason)
    .slice(0, 3);
});

const nextSeasonFestivals = computed(() => {
  const seasonOrder: Season[] = ['spring', 'summer', 'autumn', 'winter'];
  const currentIndex = seasonOrder.indexOf(calendarStore.currentSeason);
  const nextSeason = seasonOrder[(currentIndex + 1) % 4];
  return FESTIVALS.filter(f => f.season === nextSeason).slice(0, 2);
});
</script>

<template>
  <div class="calendar-panel">
    <!-- Header with current time/date -->
    <v-card class="mb-4">
      <v-card-text>
        <div class="d-flex align-center">
          <v-avatar :color="calendarStore.seasonData.color" size="64" class="mr-4">
            <v-icon size="36" color="white">{{ calendarStore.seasonData.icon }}</v-icon>
          </v-avatar>
          <div class="flex-grow-1">
            <div class="d-flex align-center mb-1">
              <span class="text-h5 mr-3">{{ calendarStore.formattedDate }}</span>
              <v-chip :color="calendarStore.timeOfDayData.color" size="small">
                <v-icon start size="small">{{ calendarStore.timeOfDayData.icon }}</v-icon>
                {{ calendarStore.formattedTime }}
              </v-chip>
            </div>
            <div class="d-flex align-center gap-2">
              <v-chip :color="calendarStore.seasonData.color" size="small" variant="outlined">
                {{ calendarStore.seasonData.name }}
              </v-chip>
              <v-chip :color="calendarStore.weatherData.color" size="small" variant="outlined">
                <v-icon start size="small">{{ calendarStore.weatherData.icon }}</v-icon>
                {{ calendarStore.weatherData.name }}
              </v-chip>
              <v-chip color="blue-grey" size="small" variant="outlined">
                <v-icon start size="small">{{ calendarStore.moonPhaseData.icon }}</v-icon>
                {{ calendarStore.moonPhaseData.name }}
              </v-chip>
            </div>
          </div>
          <v-btn
            :icon="calendarStore.isPaused ? 'mdi-play' : 'mdi-pause'"
            :color="calendarStore.isPaused ? 'success' : 'warning'"
            variant="tonal"
            @click="calendarStore.togglePause()"
          />
        </div>

        <v-row class="mt-4">
          <v-col cols="3" class="text-center">
            <div class="text-h6">{{ calendarStore.stats.daysPlayed }}</div>
            <div class="text-caption">Dni w grze</div>
          </v-col>
          <v-col cols="3" class="text-center">
            <div class="text-h6">{{ calendarStore.stats.seasonsExperienced }}</div>
            <div class="text-caption">Pór roku</div>
          </v-col>
          <v-col cols="3" class="text-center">
            <div class="text-h6">{{ calendarStore.stats.festivalsAttended }}</div>
            <div class="text-caption">Festiwali</div>
          </v-col>
          <v-col cols="3" class="text-center">
            <div class="text-h6">{{ Object.keys(calendarStore.allBonuses).length }}</div>
            <div class="text-caption">Aktywnych bonusów</div>
          </v-col>
        </v-row>

        <!-- Active Festival Banner -->
        <v-alert
          v-if="calendarStore.activeFestivals.length > 0"
          type="success"
          variant="tonal"
          class="mt-3"
        >
          <div class="d-flex align-center">
            <v-icon :color="calendarStore.activeFestivals[0].color" size="32" class="mr-3">
              {{ calendarStore.activeFestivals[0].icon }}
            </v-icon>
            <div>
              <div class="font-weight-bold">{{ calendarStore.activeFestivals[0].name }}</div>
              <div class="text-caption">{{ calendarStore.activeFestivals[0].description }}</div>
            </div>
          </div>
        </v-alert>
      </v-card-text>
    </v-card>

    <!-- Tabs -->
    <v-tabs v-model="activeTab" color="blue" class="mb-4">
      <v-tab value="overview">
        <v-icon start>mdi-calendar</v-icon>
        Przegląd
      </v-tab>
      <v-tab value="calendar">
        <v-icon start>mdi-calendar-month</v-icon>
        Kalendarz
      </v-tab>
      <v-tab value="weather">
        <v-icon start>mdi-weather-partly-cloudy</v-icon>
        Pogoda
      </v-tab>
      <v-tab value="bonuses">
        <v-icon start>mdi-chart-line</v-icon>
        Bonusy
      </v-tab>
    </v-tabs>

    <!-- Overview Tab -->
    <div v-if="activeTab === 'overview'">
      <v-row>
        <!-- Current Conditions -->
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>Aktualne Warunki</v-card-title>
            <v-card-text>
              <!-- Time of Day -->
              <div class="d-flex align-center mb-4">
                <v-avatar :color="calendarStore.timeOfDayData.color" size="48" class="mr-3">
                  <v-icon color="white">{{ calendarStore.timeOfDayData.icon }}</v-icon>
                </v-avatar>
                <div>
                  <div class="text-subtitle-1">{{ calendarStore.timeOfDayData.name }}</div>
                  <div class="text-caption text-medium-emphasis">
                    {{ calendarStore.timeOfDayData.hourRange[0] }}:00 - {{ calendarStore.timeOfDayData.hourRange[1] }}:00
                  </div>
                </div>
              </div>

              <!-- Weather -->
              <div class="d-flex align-center mb-4">
                <v-avatar :color="calendarStore.weatherData.color" size="48" class="mr-3">
                  <v-icon color="white">{{ calendarStore.weatherData.icon }}</v-icon>
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="text-subtitle-1">{{ calendarStore.weatherData.name }}</div>
                  <div class="text-caption text-medium-emphasis">{{ calendarStore.weatherData.description }}</div>
                </div>
                <v-chip size="small" color="info">
                  {{ calendarStore.weatherDuration }}h
                </v-chip>
              </div>

              <!-- Moon Phase -->
              <div class="d-flex align-center">
                <v-avatar color="blue-grey" size="48" class="mr-3">
                  <v-icon color="white">{{ calendarStore.moonPhaseData.icon }}</v-icon>
                </v-avatar>
                <div>
                  <div class="text-subtitle-1">{{ calendarStore.moonPhaseData.name }}</div>
                  <div class="text-caption text-medium-emphasis">
                    {{ calendarStore.moonPhaseData.effects[0]?.description || 'Brak efektów' }}
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Daily & Season Bonuses -->
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>Bonusy Czasowe</v-card-title>
            <v-card-text>
              <!-- Daily Bonus -->
              <div v-if="calendarStore.dailyBonus" class="mb-4">
                <div class="d-flex align-center mb-2">
                  <v-icon :color="calendarStore.dailyBonus.color" class="mr-2">{{ calendarStore.dailyBonus.icon }}</v-icon>
                  <span class="text-subtitle-2">{{ calendarStore.dailyBonus.name }}</span>
                </div>
                <div class="d-flex flex-wrap gap-1">
                  <v-chip
                    v-for="bonus in calendarStore.dailyBonus.bonuses"
                    :key="bonus.stat"
                    size="x-small"
                    :color="calendarStore.dailyBonus.color"
                    variant="outlined"
                  >
                    {{ bonus.description }}
                  </v-chip>
                </div>
              </div>

              <!-- Season Bonuses -->
              <div>
                <div class="d-flex align-center mb-2">
                  <v-icon :color="calendarStore.seasonData.color" class="mr-2">{{ calendarStore.seasonData.icon }}</v-icon>
                  <span class="text-subtitle-2">Bonusy {{ calendarStore.seasonData.name }}</span>
                </div>
                <div class="d-flex flex-wrap gap-1">
                  <v-chip
                    v-for="bonus in calendarStore.seasonData.bonuses"
                    :key="bonus.stat"
                    size="x-small"
                    :color="calendarStore.seasonData.color"
                    variant="outlined"
                  >
                    {{ bonus.description }}
                  </v-chip>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Upcoming Events -->
      <v-card class="mt-4">
        <v-card-title>Nadchodzące Festiwale</v-card-title>
        <v-card-text>
          <v-row v-if="upcomingFestivals.length > 0 || nextSeasonFestivals.length > 0">
            <v-col
              v-for="festival in [...upcomingFestivals, ...nextSeasonFestivals]"
              :key="festival.id"
              cols="12"
              md="4"
            >
              <v-card variant="outlined" :style="{ borderColor: festival.color }">
                <v-card-text>
                  <div class="d-flex align-center mb-2">
                    <v-avatar :color="festival.color" size="40">
                      <v-icon color="white">{{ festival.icon }}</v-icon>
                    </v-avatar>
                    <div class="ml-3">
                      <div class="text-subtitle-2">{{ festival.name }}</div>
                      <div class="text-caption">
                        {{ SEASONS[festival.season].name }}, dzień {{ festival.dayOfSeason }}
                      </div>
                    </div>
                  </div>
                  <div class="text-body-2 mb-2">{{ festival.description }}</div>
                  <div class="d-flex flex-wrap gap-1">
                    <v-chip
                      v-for="bonus in festival.bonuses.slice(0, 2)"
                      :key="bonus.stat"
                      size="x-small"
                      color="success"
                      variant="outlined"
                    >
                      {{ bonus.description }}
                    </v-chip>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
          <div v-else class="text-center py-4 text-medium-emphasis">
            Brak nadchodzących festiwali w tym sezonie
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Calendar Tab -->
    <div v-if="activeTab === 'calendar'">
      <v-row>
        <!-- Seasons -->
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>Pory Roku</v-card-title>
            <v-card-text>
              <v-list density="compact">
                <v-list-item
                  v-for="season in allSeasons"
                  :key="season.id"
                  :class="{ 'v-list-item--active': calendarStore.currentSeason === season.id }"
                >
                  <template #prepend>
                    <v-avatar :color="season.color" size="40">
                      <v-icon color="white">{{ season.icon }}</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title>{{ season.name }}</v-list-item-title>
                  <v-list-item-subtitle>{{ season.description }}</v-list-item-subtitle>
                  <template #append>
                    <v-chip v-if="calendarStore.currentSeason === season.id" size="x-small" color="success">
                      Teraz
                    </v-chip>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Moon Phases -->
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>Fazy Księżyca</v-card-title>
            <v-card-text>
              <div class="d-flex flex-wrap justify-center gap-3">
                <div
                  v-for="phase in allMoonPhases"
                  :key="phase.id"
                  class="text-center"
                  :class="{ 'font-weight-bold': calendarStore.currentMoonPhase === phase.id }"
                >
                  <v-avatar
                    :color="calendarStore.currentMoonPhase === phase.id ? 'amber' : 'grey'"
                    size="48"
                  >
                    <v-icon color="white">{{ phase.icon }}</v-icon>
                  </v-avatar>
                  <div class="text-caption mt-1">{{ phase.name }}</div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- All Festivals -->
      <v-card class="mt-4">
        <v-card-title>Wszystkie Festiwale</v-card-title>
        <v-card-text>
          <v-expansion-panels>
            <v-expansion-panel v-for="season in allSeasons" :key="season.id">
              <v-expansion-panel-title>
                <v-avatar :color="season.color" size="24" class="mr-2">
                  <v-icon size="14" color="white">{{ season.icon }}</v-icon>
                </v-avatar>
                {{ season.name }}
                <v-chip size="x-small" class="ml-2">
                  {{ FESTIVALS.filter(f => f.season === season.id).length }} festiwali
                </v-chip>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-list density="compact">
                  <v-list-item
                    v-for="festival in FESTIVALS.filter(f => f.season === season.id)"
                    :key="festival.id"
                  >
                    <template #prepend>
                      <v-icon :color="festival.color">{{ festival.icon }}</v-icon>
                    </template>
                    <v-list-item-title>{{ festival.name }}</v-list-item-title>
                    <v-list-item-subtitle>Dzień {{ festival.dayOfSeason }} ({{ festival.duration }} dni)</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>
      </v-card>
    </div>

    <!-- Weather Tab -->
    <div v-if="activeTab === 'weather'">
      <v-row>
        <v-col v-for="weather in Object.values(WEATHER_DATA)" :key="weather.id" cols="12" md="4">
          <v-card
            :variant="calendarStore.currentWeather === weather.id ? 'elevated' : 'outlined'"
            :class="{ 'border-primary': calendarStore.currentWeather === weather.id }"
          >
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-avatar :color="weather.color" size="48">
                  <v-icon color="white">{{ weather.icon }}</v-icon>
                </v-avatar>
                <div class="ml-3 flex-grow-1">
                  <div class="text-subtitle-1">{{ weather.name }}</div>
                  <div class="text-caption">{{ weather.duration.min }}-{{ weather.duration.max }}h</div>
                </div>
                <v-chip v-if="calendarStore.currentWeather === weather.id" size="small" color="success">
                  Teraz
                </v-chip>
              </div>
              <div class="text-body-2 mb-2">{{ weather.description }}</div>
              <div v-if="weather.effects.length > 0" class="d-flex flex-wrap gap-1">
                <v-chip
                  v-for="effect in weather.effects"
                  :key="effect.stat"
                  size="x-small"
                  :color="effect.value >= 0 ? 'success' : 'error'"
                  variant="outlined"
                >
                  {{ effect.description }}
                </v-chip>
              </div>
              <div v-else class="text-caption text-medium-emphasis">Brak efektów</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Bonuses Tab -->
    <div v-if="activeTab === 'bonuses'">
      <v-card>
        <v-card-title>Wszystkie Aktywne Bonusy</v-card-title>
        <v-card-text>
          <v-list v-if="Object.keys(calendarStore.allBonuses).length > 0" density="compact">
            <v-list-item v-for="(value, stat) in calendarStore.allBonuses" :key="stat">
              <v-list-item-title>{{ stat }}</v-list-item-title>
              <template #append>
                <v-chip :color="value >= 0 ? 'success' : 'error'" size="small">
                  {{ value >= 0 ? '+' : '' }}{{ value }}%
                </v-chip>
              </template>
            </v-list-item>
          </v-list>
          <div v-else class="text-center py-4 text-medium-emphasis">
            Brak aktywnych bonusów
          </div>
        </v-card-text>
      </v-card>

      <!-- Bonus Sources -->
      <v-row class="mt-4">
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>Bonusy Dzienne</v-card-title>
            <v-card-text>
              <v-list density="compact">
                <v-list-item
                  v-for="daily in DAILY_BONUSES"
                  :key="daily.id"
                  :class="{ 'v-list-item--active': calendarStore.dailyBonus?.id === daily.id }"
                >
                  <template #prepend>
                    <v-avatar :color="daily.color" size="32">
                      <v-icon size="18" color="white">{{ daily.icon }}</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title>{{ daily.name }}</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ daily.bonuses.map(b => b.description).join(', ') }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>Czas Dnia</v-card-title>
            <v-card-text>
              <v-list density="compact">
                <v-list-item
                  v-for="time in Object.values(TIME_OF_DAY)"
                  :key="time.id"
                  :class="{ 'v-list-item--active': calendarStore.currentTimeOfDay === time.id }"
                >
                  <template #prepend>
                    <v-avatar :color="time.color" size="32">
                      <v-icon size="18" color="white">{{ time.icon }}</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title>{{ time.name }}</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ time.hourRange[0] }}:00 - {{ time.hourRange[1] }}:00
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<style scoped>
.border-primary {
  border: 2px solid rgb(var(--v-theme-primary)) !important;
}
</style>
