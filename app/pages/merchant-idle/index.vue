<template>
  <div class="merchant-game-container fill-height bg-black text-white pa-4">
    <FloatingText :items="floatingTexts" />

    <v-container>
      <v-row>
        <!-- Left Column: Status & Clicker -->
        <v-col cols="12" md="5" lg="4" class="d-flex flex-column">
          <h1
            class="text-h3 mb-6 font-weight-black text-amber-darken-3 merchant-font text-center"
            style="
              text-shadow: 0 4px 10px rgba(0, 0, 0, 0.8);
              letter-spacing: 0.1em;
            "
          >
            MERCHANT IDLE
          </h1>

          <ResourceDisplay />
          <ClickerArea @trade="handleTrade" />

          <EventLog />

          <v-alert
            border="start"
            border-color="amber-darken-4"
            elevation="2"
            color="#141010"
            class="mt-6 text-caption text-grey-darken-1 font-italic"
          >
            "In the shadows of the Cathedral, coins speak louder than prayers."
          </v-alert>
        </v-col>

        <!-- Right Column: Management Tabs -->
        <v-col cols="12" md="7" lg="8">
          <v-tabs v-model="rightTab" color="amber-darken-3" grow class="mb-4">
            <v-tab value="map">
              <v-icon start>mdi-map</v-icon>
              Trade Routes
            </v-tab>
            <v-tab value="guild">
              <v-icon start>mdi-office-building</v-icon>
              Guild Operations
            </v-tab>
            <v-tab value="prestige">
              <v-icon start>mdi-podium-gold</v-icon>
              Grand Hall
            </v-tab>
            <v-tab value="stats">
              <v-icon start>mdi-chart-bar</v-icon>
              Ledger
            </v-tab>
          </v-tabs>

          <v-window v-model="rightTab">
            <v-window-item value="map">
              <WorldMap />
            </v-window-item>

            <v-window-item value="guild">
              <TechTree />
              <UpgradeList />
            </v-window-item>

            <v-window-item value="prestige">
              <PrestigeMenu />
            </v-window-item>

            <v-window-item value="stats">
              <StatisticsMenu />
            </v-window-item>
          </v-window>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useClicker, useGameLoop } from '~/features/merchant-clicker/hooks';
import { ClickerArea, FloatingText } from '~/features/merchant-clicker/ui';
import { ResourceDisplay } from '~/features/merchant-resource-display/ui';
import { EventLog } from '~/features/merchant-events/ui';
import { TechTree, UpgradeList } from '~/features/merchant-upgrade/ui';
import { WorldMap } from '~/features/merchant-trade-routes/ui';
import { PrestigeMenu } from '~/features/merchant-prestige/ui';
import { StatisticsMenu } from '~/features/merchant-statistics/ui';

// Initialize game loop
useGameLoop();

// Setup clicker functionality
const { floatingTexts, handleTrade } = useClicker();

const rightTab = ref('guild');
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Lato:wght@300;400;700&display=swap');

body {
  font-family: 'Lato', sans-serif;
}

.merchant-font {
  font-family: 'Cinzel', serif !important;
}

.bg-black {
  background-color: #0a0808 !important;
  background-image: linear-gradient(to bottom right, #0a0808 0%, #1a1515 100%);
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #111;
}
::-webkit-scrollbar-thumb {
  background: #4e342e;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #6d4c41;
}
</style>
