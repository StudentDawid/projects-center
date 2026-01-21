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

        <!-- Right Column: Upgrades & Management -->
        <v-col cols="12" md="7" lg="8">
          <WorldMap />
          <TechTree />
          <UpgradeList />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useMerchantStore } from '~/entities/merchant/store';
import ResourceDisplay from '~/features/merchant/ui/ResourceDisplay.vue';
import ClickerArea from '~/features/merchant/ui/ClickerArea.vue';
import UpgradeList from '~/features/merchant/ui/UpgradeList.vue';
import EventLog from '~/features/merchant/ui/EventLog.vue';
import TechTree from '~/features/merchant/ui/TechTree.vue';
import WorldMap from '~/features/merchant/ui/WorldMap.vue';
import FloatingText, {
  type FloatingItem,
} from '~/features/merchant/ui/FloatingText.vue';

const store = useMerchantStore();
const floatingTexts = ref<FloatingItem[]>([]);

const handleTrade = (e: { x: number; y: number }) => {
  store.clickResource();

  const id = crypto.randomUUID();
  // Get formatted amount nicely for float text
  const amount = store.formatNumber(store.currentClickPower);

  floatingTexts.value.push({
    id,
    x: e.x,
    y: e.y,
    text: amount,
  });

  // Cleanup after animation (1s)
  setTimeout(() => {
    floatingTexts.value = floatingTexts.value.filter((item) => item.id !== id);
  }, 1200);
};

let tickInterval: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  store.syncContent();
  tickInterval = setInterval(() => {
    store.tick(100); // 100ms ticks
  }, 100);
});

onUnmounted(() => {
  if (tickInterval) clearInterval(tickInterval);
});
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
