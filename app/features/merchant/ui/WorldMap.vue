<template>
  <v-card color="#1a1a1a" class="mt-4 map-card" elevation="4">
    <v-card-title class="d-flex justify-space-between align-center">
      <span class="text-overline text-brown-lighten-2">Kingdom Map</span>
      <span class="text-caption text-grey"
        >Active Caravans: {{ store.caravans.length }}</span
      >
    </v-card-title>

    <div class="map-container relative">
      <!-- SVG Layer for Lines -->
      <svg class="map-connections">
        <line
          v-for="city in unlockedCities"
          :key="city.id"
          :x1="getX(capital)"
          :y1="getY(capital)"
          :x2="getX(city)"
          :y2="getY(city)"
          :class="{ 'animated-route': isCaravanActive(city.id) }"
          stroke="#5d4037"
          stroke-width="2"
          stroke-dasharray="5,5"
        />
      </svg>

      <!-- Cities -->
      <div
        v-for="city in store.cities"
        :key="city.id"
        class="city-node"
        :class="{ unlocked: city.unlocked, capital: city.id === 'capital' }"
        :style="{
          left: city.coordinates.x + '%',
          top: city.coordinates.y + '%',
        }"
      >
        <v-menu location="top" offset="10" open-on-hover>
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              icon
              :size="city.id === 'capital' ? 'default' : 'small'"
              :color="getNodeColor(city)"
              class="city-btn elevation-6"
              @click="handleCityClick(city)"
            >
              <v-icon>{{ getCityIcon(city) }}</v-icon>
            </v-btn>
          </template>
          <v-card width="250" color="#222">
            <v-card-title class="text-subtitle-2">{{ city.name }}</v-card-title>
            <v-card-text class="text-caption text-grey-lighten-1">
              {{ city.description }}
              <div v-if="!city.unlocked" class="mt-2 text-warning">
                Cost to discover: {{ store.formatNumber(city.discoveryCost) }} G
              </div>
              <div v-else-if="city.id !== 'capital'" class="mt-2 text-success">
                Returns: ~{{ Math.floor(100 * city.tradeRewardMultiplier) }} G
                <br />
                Travel: {{ 10 * city.distanceMultiplier }}s
              </div>
            </v-card-text>
            <v-card-actions v-if="city.id !== 'capital'">
              <v-btn
                v-if="!city.unlocked"
                variant="flat"
                color="brown"
                size="small"
                block
                :disabled="!store.canAfford(city.discoveryCost)"
                @click="store.discoverCity(city.id)"
              >
                Scout Route
              </v-btn>
              <v-btn
                v-else
                variant="flat"
                color="green-darken-3"
                size="small"
                block
                :disabled="isCaravanActive(city.id)"
                @click="store.sendCaravan(city.id)"
              >
                {{ isCaravanActive(city.id) ? 'En Travel' : 'Send Caravan' }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>

        <!-- Label -->
        <div class="city-label">{{ city.name }}</div>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useMerchantStore } from '~/entities/merchant/store';
import type { City } from '~/entities/merchant/model';

const store = useMerchantStore();

const capital = computed(() => store.cities.find((c) => c.id === 'capital'));
const unlockedCities = computed(() =>
  store.cities.filter((c) => c.unlocked && c.id !== 'capital')
);

const getX = (city?: City) => (city ? `${city.coordinates.x}%` : '50%');
const getY = (city?: City) => (city ? `${city.coordinates.y}%` : '50%');

const getNodeColor = (city: City) => {
  if (city.id === 'capital') return 'amber-darken-3';
  return city.unlocked ? 'brown-lighten-1' : 'grey-darken-3';
};

const getCityIcon = (city: City) => {
  if (city.id === 'capital') return 'mdi-castle';
  if (!city.unlocked) return 'mdi-lock';
  if (city.id === 'port') return 'mdi-anchor';
  if (city.id === 'monastery') return 'mdi-church';
  return 'mdi-home-group';
};

const handleCityClick = (_city: City) => {
  // handled by menu buttons, but could focus camera later
};

const isCaravanActive = (cityId: string) => {
  return store.caravans.some((c) => c.targetCityId === cityId);
};
</script>

<style scoped>
.map-card {
  overflow: hidden;
}
.map-container {
  width: 100%;
  aspect-ratio: 16/9;
  background: #0d0d0d;
  background-image: radial-gradient(#1a1a1a 1px, transparent 1px);
  background-size: 20px 20px;
  position: relative;
  overflow: hidden;
}
.map-connections {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.city-node {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 2;
}
.city-label {
  margin-top: 4px;
  font-size: 10px;
  color: #aaa;
  text-shadow: 0 1px 2px #000;
  pointer-events: none;
  white-space: nowrap;
}

.animated-route {
  stroke: #ffb300; /* Gold color for active route */
  stroke-width: 3;
  animation: flow 1s linear infinite;
}

@keyframes flow {
  to {
    stroke-dashoffset: -10;
  }
}
</style>
