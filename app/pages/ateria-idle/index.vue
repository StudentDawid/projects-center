<script setup lang="ts">
/**
 * Ateria Idle - Main Game Page
 */

import { onMounted, onUnmounted, ref } from 'vue';
import { useAteriaGameStore } from '~/features/ateria-idle/core/model/game.store';
import { useAteriaResourcesStore } from '~/features/ateria-idle/core/model/resources.store';
import { useAteriaWarriorStore } from '~/features/ateria-idle/warrior/model/warrior.store';

// Components
import AteriaResourceBar from '~/features/ateria-idle/core/ui/ResourceBar.vue';
import AteriaWarriorPanel from '~/features/ateria-idle/warrior/ui/WarriorPanel.vue';
import AteriaNotifications from '~/features/ateria-idle/core/ui/Notifications.vue';

// Stores
const gameStore = useAteriaGameStore();
const resourcesStore = useAteriaResourcesStore();
const warriorStore = useAteriaWarriorStore();

// Game loop
const TICK_RATE = 100; // 10 ticks per second
let gameLoopInterval: ReturnType<typeof setInterval> | null = null;
let lastTickTime = Date.now();

// Navigation
const activeTab = ref<'warrior' | 'scientist' | 'merchant'>('warrior');

// Navigation items
const navItems = computed(() => [
  {
    id: 'warrior' as const,
    label: 'Wojownik',
    icon: 'mdi-sword',
    unlocked: gameStore.isFeatureUnlocked('warrior'),
    level: warriorStore.stats.level,
  },
  {
    id: 'scientist' as const,
    label: 'Naukowiec',
    icon: 'mdi-flask',
    unlocked: gameStore.isFeatureUnlocked('scientist'),
    level: 1,
  },
  {
    id: 'merchant' as const,
    label: 'Handlarz',
    icon: 'mdi-cart',
    unlocked: gameStore.isFeatureUnlocked('merchant'),
    level: 1,
  },
]);

function gameTick() {
  const now = Date.now();
  const deltaTime = now - lastTickTime;
  const ticksElapsed = Math.floor(deltaTime / TICK_RATE);

  if (ticksElapsed > 0) {
    lastTickTime = now - (deltaTime % TICK_RATE);

    for (let i = 0; i < ticksElapsed; i++) {
      gameStore.tick();
      resourcesStore.processTick(1);
      warriorStore.processTick();
    }
  }

  // Update playtime
  gameStore.totalPlaytime += deltaTime / 1000;
}

function startGameLoop() {
  if (gameLoopInterval) return;
  lastTickTime = Date.now();
  gameLoopInterval = setInterval(gameTick, TICK_RATE);
}

function stopGameLoop() {
  if (gameLoopInterval) {
    clearInterval(gameLoopInterval);
    gameLoopInterval = null;
  }
}

// Lifecycle
onMounted(() => {
  startGameLoop();

  // Handle offline progress
  const lastLogout = gameStore.lastLogout;
  const timeDiff = Date.now() - lastLogout;

  if (timeDiff > 60000) { // More than 1 minute
    // TODO: Show offline progress modal
    console.log(`Byłeś offline przez ${Math.floor(timeDiff / 1000)} sekund`);
  }

  // Handle visibility change (pause when hidden)
  document.addEventListener('visibilitychange', handleVisibilityChange);
});

onUnmounted(() => {
  stopGameLoop();
  gameStore.lastLogout = Date.now();
  document.removeEventListener('visibilitychange', handleVisibilityChange);
});

function handleVisibilityChange() {
  if (document.hidden) {
    gameStore.lastLogout = Date.now();
  } else {
    // Calculate offline progress when returning
    const timeDiff = Date.now() - gameStore.lastLogout;
    if (timeDiff > 1000) {
      console.log(`Powrót po ${Math.floor(timeDiff / 1000)} sekundach`);
      // TODO: Process offline progress
    }
    lastTickTime = Date.now();
  }
}

// Dev functions
function devAddGold() {
  resourcesStore.addResource('gold', 1000);
}

function devAddXp() {
  warriorStore.addXp(100);
}
</script>

<template>
  <v-app>
    <!-- Top App Bar with Resources -->
    <v-app-bar
      color="surface"
      elevation="2"
      density="compact"
    >
      <v-app-bar-nav-icon>
        <v-icon>mdi-shield-sword</v-icon>
      </v-app-bar-nav-icon>

      <v-app-bar-title class="text-h6">
        Echa Aterii
      </v-app-bar-title>

      <v-spacer />

      <!-- Resource Bar -->
      <AteriaResourceBar />

      <v-btn
        icon
        variant="text"
        size="small"
      >
        <v-icon>mdi-cog</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- Navigation Drawer -->
    <v-navigation-drawer
      permanent
      rail
      color="surface-variant"
    >
      <v-list
        nav
        density="compact"
      >
        <v-list-item
          v-for="item in navItems"
          :key="item.id"
          :value="item.id"
          :active="activeTab === item.id"
          :disabled="!item.unlocked"
          @click="activeTab = item.id"
        >
          <template #prepend>
            <v-icon :color="activeTab === item.id ? 'primary' : undefined">
              {{ item.icon }}
            </v-icon>
          </template>

          <v-tooltip
            activator="parent"
            location="end"
          >
            <div>{{ item.label }}</div>
            <div
              v-if="item.unlocked"
              class="text-caption"
            >
              Poziom {{ item.level }}
            </div>
            <div
              v-else
              class="text-caption text-warning"
            >
              Zablokowane
            </div>
          </v-tooltip>
        </v-list-item>
      </v-list>

      <template #append>
        <v-list
          nav
          density="compact"
        >
          <v-list-item value="prestige">
            <template #prepend>
              <v-icon>mdi-crown</v-icon>
            </template>
            <v-tooltip
              activator="parent"
              location="end"
            >
              Dziedzictwo
            </v-tooltip>
          </v-list-item>

          <v-list-item value="stats">
            <template #prepend>
              <v-icon>mdi-chart-bar</v-icon>
            </template>
            <v-tooltip
              activator="parent"
              location="end"
            >
              Statystyki
            </v-tooltip>
          </v-list-item>
        </v-list>
      </template>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main>
      <v-container
        fluid
        class="pa-4"
      >
        <!-- Warrior Panel -->
        <AteriaWarriorPanel v-if="activeTab === 'warrior'" />

        <!-- Scientist Panel (placeholder) -->
        <v-card
          v-else-if="activeTab === 'scientist'"
          class="pa-4"
        >
          <v-card-title>
            <v-icon class="mr-2">
              mdi-flask
            </v-icon>
            Naukowiec
          </v-card-title>
          <v-card-text class="text-center text-medium-emphasis">
            <v-icon
              size="64"
              class="mb-4"
            >
              mdi-hammer-wrench
            </v-icon>
            <div>W budowie...</div>
            <div class="text-caption">
              Ścieżka Naukowca będzie dostępna wkrótce
            </div>
          </v-card-text>
        </v-card>

        <!-- Merchant Panel (placeholder) -->
        <v-card
          v-else-if="activeTab === 'merchant'"
          class="pa-4"
        >
          <v-card-title>
            <v-icon class="mr-2">
              mdi-cart
            </v-icon>
            Handlarz
          </v-card-title>
          <v-card-text class="text-center text-medium-emphasis">
            <v-icon
              size="64"
              class="mb-4"
            >
              mdi-hammer-wrench
            </v-icon>
            <div>W budowie...</div>
            <div class="text-caption">
              Ścieżka Handlarza będzie dostępna wkrótce
            </div>
          </v-card-text>
        </v-card>

        <!-- Dev Panel (only in development) -->
        <v-card
          v-if="true"
          class="mt-4 pa-2"
          color="grey-darken-3"
        >
          <v-card-subtitle class="text-caption">
            DEV Panel
          </v-card-subtitle>
          <v-card-actions>
            <v-btn
              size="small"
              variant="outlined"
              @click="devAddGold"
            >
              +1000 Gold
            </v-btn>
            <v-btn
              size="small"
              variant="outlined"
              @click="devAddXp"
            >
              +100 XP
            </v-btn>
            <v-btn
              size="small"
              variant="outlined"
              @click="resourcesStore.addResource('food', 50)"
            >
              +50 Food
            </v-btn>
            <v-btn
              size="small"
              variant="outlined"
              color="warning"
              @click="() => { gameStore.resetGame(); resourcesStore.resetResources(); warriorStore.resetWarrior(); }"
            >
              Reset
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-container>
    </v-main>

    <!-- Notifications -->
    <AteriaNotifications />
  </v-app>
</template>

<style scoped>
.v-main {
  background-color: rgb(var(--v-theme-background));
}
</style>
