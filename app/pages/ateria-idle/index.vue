<script setup lang="ts">
/**
 * Ateria Idle - Main Game Page
 */

import { onMounted, onUnmounted, ref } from 'vue';
import { useAteriaGameStore } from '~/features/ateria-idle/core/model/game.store';
import { useAteriaResourcesStore } from '~/features/ateria-idle/core/model/resources.store';
import { useAteriaWarriorStore } from '~/features/ateria-idle/warrior/model/warrior.store';
import type { OfflineReport } from '~/entities/ateria-idle/game';

// Components
import AteriaResourceBar from '~/features/ateria-idle/core/ui/ResourceBar.vue';
import AteriaWarriorPanel from '~/features/ateria-idle/warrior/ui/WarriorPanel.vue';
import AteriaNotifications from '~/features/ateria-idle/core/ui/Notifications.vue';
import AteriaOfflineProgressModal from '~/features/ateria-idle/core/ui/OfflineProgressModal.vue';

// Stores
const gameStore = useAteriaGameStore();
const resourcesStore = useAteriaResourcesStore();
const warriorStore = useAteriaWarriorStore();

// Game loop
const TICK_RATE = 100; // 10 ticks per second
const MAX_OFFLINE_HOURS = 24;
let gameLoopInterval: ReturnType<typeof setInterval> | null = null;
let lastTickTime = Date.now();

// Navigation
const activeTab = ref<'warrior' | 'scientist' | 'merchant'>('warrior');

// Offline progress
const showOfflineModal = ref(false);
const offlineReport = ref<OfflineReport | null>(null);

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

// Offline progress calculation
function calculateOfflineProgress(timeAwayMs: number): OfflineReport {
  // Cap offline time
  const maxOfflineMs = MAX_OFFLINE_HOURS * 60 * 60 * 1000;
  const cappedTime = Math.min(timeAwayMs, maxOfflineMs);

  // Only simulate if auto-combat was enabled
  const wasAutoCombatEnabled = warriorStore.autoCombatEnabled;
  const selectedMonster = warriorStore.selectedMonster;

  // Get monster data
  const monster = selectedMonster
    ? warriorStore.availableMonsters.find(m => m.id === selectedMonster)
    : warriorStore.availableMonsters[0];

  // Calculate combat stats
  let monstersKilled = 0;
  let xpGained = 0;
  let goldGained = 0;
  let deaths = 0;
  let foodConsumed = 0;
  const loot: Array<{ itemId: string; amount: number }> = [];

  if (wasAutoCombatEnabled && monster) {
    // Simplified simulation: estimate kills per second
    const playerDps = warriorStore.effectiveStats.attack * 0.8; // rough DPS estimate
    const monsterHp = monster.maxHp;
    const secondsPerKill = Math.max(1, monsterHp / playerDps);

    // Simulate time
    const totalSeconds = cappedTime / 1000;
    const potentialKills = Math.floor(totalSeconds / secondsPerKill);

    // Calculate survival (rough estimate based on HP vs monster damage)
    const survivalRate = Math.min(0.95, warriorStore.effectiveStats.damageReduction + 0.3);
    const effectiveKills = Math.floor(potentialKills * survivalRate);

    // Check food availability
    const foodAvailable = resourcesStore.food.amount.toNumber();
    const killsPerFood = 5; // Roughly 5 kills per food
    const maxKillsWithFood = Math.floor(foodAvailable * killsPerFood);

    monstersKilled = Math.min(effectiveKills, maxKillsWithFood + 20); // +20 for HP regen
    xpGained = monstersKilled * monster.xpReward;

    // Calculate gold
    const avgGold = (monster.goldReward.min + monster.goldReward.max) / 2;
    goldGained = Math.floor(monstersKilled * avgGold);

    // Calculate deaths (if many kills, some deaths likely)
    deaths = Math.floor(monstersKilled / 50); // Roughly 1 death per 50 kills

    // Food consumed
    foodConsumed = Math.min(foodAvailable, Math.floor(monstersKilled / killsPerFood));

    // Loot
    if (goldGained > 0) {
      loot.push({ itemId: 'gold', amount: goldGained });
    }

    // Simulate some material drops
    for (const lootEntry of monster.lootTable) {
      const expectedDrops = Math.floor(monstersKilled * lootEntry.chance);
      if (expectedDrops > 0) {
        const avgAmount = (lootEntry.minAmount + lootEntry.maxAmount) / 2;
        loot.push({
          itemId: lootEntry.itemId,
          amount: Math.floor(expectedDrops * avgAmount),
        });
      }
    }
  }

  return {
    timeAway: cappedTime,
    combat: {
      monstersKilled,
      xpGained,
      loot,
      deaths,
      foodConsumed,
    },
    research: {
      researchProgress: {},
      potionsProduced: {},
      golemWork: {},
    },
    merchant: {
      goldEarned: resourcesStore.gold.amount,
      tradeRoutesCompleted: 0,
      itemsSold: 0,
    },
  };
}

function applyOfflineProgress(report: OfflineReport) {
  // Apply combat rewards
  if (report.combat.xpGained > 0) {
    warriorStore.addXp(report.combat.xpGained);
  }

  // Apply gold from loot
  const goldLoot = report.combat.loot.find(l => l.itemId === 'gold');
  if (goldLoot) {
    resourcesStore.addResource('gold', goldLoot.amount);
  }

  // Consume food
  if (report.combat.foodConsumed > 0) {
    resourcesStore.removeResource('food', report.combat.foodConsumed);
  }

  // Add notification
  gameStore.addNotification({
    type: 'success',
    title: 'Nagrody offline odebrane!',
    message: `+${report.combat.xpGained} XP, +${goldLoot?.amount || 0} złota`,
    icon: 'mdi-gift',
    duration: 5000,
  });
}

function handleClaimOffline() {
  if (offlineReport.value) {
    applyOfflineProgress(offlineReport.value);
  }
  showOfflineModal.value = false;
  offlineReport.value = null;
}

// Lifecycle
onMounted(() => {
  // Handle offline progress BEFORE starting game loop
  const lastLogout = gameStore.lastLogout;
  const timeDiff = Date.now() - lastLogout;

  if (timeDiff > 60000) { // More than 1 minute
    offlineReport.value = calculateOfflineProgress(timeDiff);
    showOfflineModal.value = true;
  }

  startGameLoop();

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
    if (timeDiff > 60000) { // More than 1 minute
      offlineReport.value = calculateOfflineProgress(timeDiff);
      showOfflineModal.value = true;
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

function devSimulateOffline() {
  // Simulate 1 hour offline
  offlineReport.value = calculateOfflineProgress(60 * 60 * 1000);
  showOfflineModal.value = true;
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
      class="nav-drawer"
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
          class="mt-4 dev-panel"
        >
          <v-card-text class="py-2 px-3">
            <div class="d-flex align-center flex-wrap ga-2">
              <span class="text-caption text-medium-emphasis mr-2">DEV:</span>
              <v-btn
                size="x-small"
                variant="tonal"
                @click="devAddGold"
              >
                +1K Gold
              </v-btn>
              <v-btn
                size="x-small"
                variant="tonal"
                @click="devAddXp"
              >
                +100 XP
              </v-btn>
              <v-btn
                size="x-small"
                variant="tonal"
                @click="resourcesStore.addResource('food', 50)"
              >
                +50 Food
              </v-btn>
              <v-btn
                size="x-small"
                variant="tonal"
                color="info"
                @click="devSimulateOffline"
              >
                Offline 1h
              </v-btn>
              <v-btn
                size="x-small"
                variant="tonal"
                color="error"
                @click="() => { gameStore.resetGame(); resourcesStore.resetResources(); warriorStore.resetWarrior(); }"
              >
                Reset
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-container>
    </v-main>

    <!-- Notifications -->
    <AteriaNotifications />

    <!-- Offline Progress Modal -->
    <AteriaOfflineProgressModal
      v-model="showOfflineModal"
      :report="offlineReport"
      @claim="handleClaimOffline"
    />
  </v-app>
</template>

<style scoped>
.v-main {
  background-color: rgb(var(--v-theme-background));
}

.nav-drawer {
  background: #1a1a1a !important;
  border-right: 1px solid rgba(255, 255, 255, 0.05) !important;
}

.nav-drawer :deep(.v-list-item--active) {
  background: rgba(33, 150, 243, 0.15);
}

.nav-drawer :deep(.v-list-item:hover:not(.v-list-item--active)) {
  background: rgba(255, 255, 255, 0.05);
}

.dev-panel {
  background: rgba(255, 255, 255, 0.02) !important;
  border: 1px dashed rgba(255, 255, 255, 0.1);
}
</style>
