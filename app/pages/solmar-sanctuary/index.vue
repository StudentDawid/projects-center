<template>
  <div class="game-page">
    <!-- Achievement Toast Notifications -->
    <AchievementToast />

    <!-- Event Modal -->
    <EventModal />

    <!-- Relic Drop Modal -->
    <RelicDropModal />

    <!-- Header -->
    <GameHeader />

    <!-- Developer Panel -->
    <DevPanel />

    <v-container fluid class="game-container pa-4">
      <v-row>
        <!-- Left Panel - Resources & Combat -->
        <v-col cols="12" md="3">
          <div class="panel-section">
            <h2 class="panel-title text-h6 mb-4">
              <v-icon icon="mdi-treasure-chest" class="mr-2" />
              Zasoby
            </h2>

            <!-- OPTIMIZATION: Resources update frequently, but individual cards only need to re-render when their values change -->
            <div class="resources-list d-flex flex-column gap-3 mb-6">
              <ResourceDisplay
                v-for="resource in unlockedResources"
                :key="resource.id"
                :name="resource.name"
                :description="resource.description"
                :icon="resource.icon"
                :amount="resource.amount"
                :per-second="resource.perSecond"
                :max-amount="resource.maxAmount"
              />
            </div>

            <!-- Active Effects from Events -->
            <ActiveEffects />

            <!-- Combat Panel -->
            <CombatPanel />
          </div>
        </v-col>

        <!-- Center Panel - Main Action -->
        <v-col cols="12" md="6">
          <div class="panel-section main-panel">
            <!-- Tab Navigation -->
            <div class="main-tabs">
              <button
                class="main-tab"
                :class="{ active: activeTab === 'game' }"
                @click="activeTab = 'game'"
              >
                <v-icon icon="mdi-church" size="20" />
                Sanktuarium
              </button>
              <button
                class="main-tab achievement-tab"
                :class="{ active: activeTab === 'achievements' }"
                @click="activeTab = 'achievements'"
              >
                <v-icon icon="mdi-trophy" size="20" />
                Osiągnięcia
                <span class="achievement-badge" v-if="achievementStore.unseenCount > 0">
                  {{ achievementStore.unseenCount }}
                </span>
              </button>
              <button
                class="main-tab challenge-tab"
                :class="{ active: activeTab === 'challenges' }"
                @click="activeTab = 'challenges'"
              >
                <v-icon icon="mdi-trophy-outline" size="20" />
                Wyzwania
                <span
                  class="challenge-badge"
                  v-if="challengeStore.completedDailyCount < challengeStore.dailyChallenges.length"
                >
                  {{ challengeStore.dailyChallenges.length - challengeStore.completedDailyCount }}
                </span>
              </button>
              <button
                class="main-tab relic-tab"
                :class="{ active: activeTab === 'relics' }"
                @click="activeTab = 'relics'"
              >
                <v-icon icon="mdi-treasure-chest" size="20" />
                Relikwie
                <span class="relic-badge" v-if="relicStore.ownedRelics.length > 0">
                  {{ relicStore.ownedRelics.length }}
                </span>
              </button>
              <button
                class="main-tab prestige-tab"
                :class="{ active: activeTab === 'prestige' }"
                @click="activeTab = 'prestige'"
              >
                <v-icon icon="mdi-fire" size="20" />
                Prestiż
                <span class="ashes-badge" v-if="prestigeStore.martyrAshes.gt(0)">
                  {{ prestigeStore.formattedAshes }}
                </span>
              </button>
              <button
                class="main-tab statistics-tab"
                :class="{ active: activeTab === 'statistics' }"
                @click="activeTab = 'statistics'"
              >
                <v-icon icon="mdi-chart-line" size="20" />
                Statystyki
              </button>
            </div>

            <!-- Game Tab Content -->
            <div v-show="activeTab === 'game'" class="tab-content">
              <!-- Prayer Section -->
              <div class="prayer-wrapper">
                <h2 class="panel-title text-h5 text-center mb-2">
                  Ofiara Modlitwy
                </h2>
                <p class="text-center text-medium-emphasis mb-4">
                  Kliknij, aby złożyć modlitwę i wygenerować Wiarę
                </p>

                <PrayerButton />
              </div>

              <v-divider class="grimdark-divider my-6" />

              <!-- Narrative Log -->
              <div class="narrative-section">
                <h3 class="text-h6 mb-3">
                  <v-icon icon="mdi-book-open-page-variant" class="mr-2" />
                  Kronika
                </h3>

                <v-card class="narrative-log pa-3">
                  <div class="log-entries">
                    <div v-if="narrativeEntries.length === 0" class="text-medium-emphasis text-center py-4">
                      <em>Cisza przed burzą...</em>
                    </div>
                    <TransitionGroup name="log">
                      <div
                        v-for="entry in narrativeEntries"
                        :key="entry.id"
                        class="log-entry mb-2"
                        :class="`log-entry--${entry.type}`"
                      >
                        <span class="log-time text-caption text-disabled">
                          {{ formatLogTime(entry.timestamp) }}
                        </span>
                        <span class="log-message">{{ entry.message }}</span>
                      </div>
                    </TransitionGroup>
                  </div>
                </v-card>
              </div>
            </div>

            <!-- Achievements Tab Content - LAZY LOADED -->
            <div v-if="activeTab === 'achievements'" class="tab-content achievement-content">
              <Suspense>
                <AchievementPanel />
                <template #fallback>
                  <div class="d-flex justify-center align-center pa-8">
                    <v-progress-circular indeterminate color="primary" />
                  </div>
                </template>
              </Suspense>
            </div>

            <!-- Relics Tab Content - LAZY LOADED -->
            <div v-if="activeTab === 'relics'" class="tab-content relic-content">
              <Suspense>
                <RelicPanel />
                <template #fallback>
                  <div class="d-flex justify-center align-center pa-8">
                    <v-progress-circular indeterminate color="primary" />
                  </div>
                </template>
              </Suspense>
            </div>

            <!-- Challenges Tab Content - LAZY LOADED -->
            <div v-if="activeTab === 'challenges'" class="tab-content challenges-content">
              <Suspense>
                <ChallengesPanel />
                <template #fallback>
                  <div class="d-flex justify-center align-center pa-8">
                    <v-progress-circular indeterminate color="primary" />
                  </div>
                </template>
              </Suspense>
            </div>

            <!-- Prestige Tab Content - LAZY LOADED -->
            <div v-if="activeTab === 'prestige'" class="tab-content prestige-content">
              <Suspense>
                <PrestigePanel />
                <template #fallback>
                  <div class="d-flex justify-center align-center pa-8">
                    <v-progress-circular indeterminate color="primary" />
                  </div>
                </template>
              </Suspense>
            </div>

            <!-- Statistics Tab Content -->
            <div v-if="activeTab === 'statistics'" class="tab-content statistics-content">
              <Suspense>
                <StatisticsPanel />
                <template #fallback>
                  <div class="d-flex justify-center align-center pa-8">
                    <v-progress-circular indeterminate color="primary" />
                  </div>
                </template>
              </Suspense>
            </div>
          </div>
        </v-col>

        <!-- Right Panel - Buildings -->
        <v-col cols="12" md="3">
          <div class="panel-section">
            <h2 class="panel-title text-h6 mb-4">
              <v-icon icon="mdi-domain" class="mr-2" />
              Budynki
            </h2>

            <!-- OPTIMIZATION: v-memo prevents re-renders when only unrelated state changes -->
            <div class="buildings-list d-flex flex-column gap-3">
              <BuildingCard
                v-for="entity in unlockedEntities"
                :key="entity.id"
                v-memo="[entity.count, entity.level, entityStore.canAfford(entity.id), entityStore.canAffordUpgrade(entity.id)]"
                :id="entity.id"
                :name="entity.name"
                :description="entity.description"
                :icon="entity.icon"
                :count="entity.count"
                :level="entity.level"
                :max-level="entityStore.MAX_BUILDING_LEVEL"
                :tier="entity.tier"
                :cost-display="entityStore.getFormattedCost(entity.id)"
                :upgrade-cost-display="entityStore.getFormattedUpgradeCost(entity.id)"
                :production-display="entityStore.getProductionDisplay(entity.id)"
                :consumption-display="entityStore.getConsumptionDisplay(entity.id)"
                :max-level-effect="entity.maxLevelEffect"
                :special-effect="entity.specialEffect"
                :prerequisites-display="entityStore.getFormattedPrerequisites(entity.id)"
                :can-afford="entityStore.canAfford(entity.id)"
                :can-afford-upgrade="entityStore.canAffordUpgrade(entity.id)"
                :is-max-level="entityStore.isMaxLevel(entity.id)"
                @buy="handleBuyEntity"
                @upgrade="handleUpgradeEntity"
              />

              <v-card v-if="unlockedEntities.length === 0" class="pa-4 text-center">
                <v-icon icon="mdi-lock" size="48" color="grey" class="mb-2" />
                <p class="text-medium-emphasis">
                  Zbierz więcej Wiary, aby odblokować budynki
                </p>
              </v-card>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, defineAsyncComponent } from 'vue';
import { storeToRefs } from 'pinia';
import { useGameLoopStore } from '~/stores/gameLoop';
import { useResourceStore } from '~/stores/resources';
import { useEntityStore } from '~/stores/entities';
import type { EntityId } from '~/shared/types/game.types';

// Core Components (loaded immediately)
import GameHeader from '~/features/game/ui/GameHeader.vue';
import ResourceDisplay from '~/features/game/ui/ResourceDisplay.vue';
import BuildingCard from '~/features/game/ui/BuildingCard.vue';
import PrayerButton from '~/features/game/ui/PrayerButton.vue';
import CombatPanel from '~/features/game/ui/CombatPanel.vue';
import AchievementToast from '~/features/game/ui/AchievementToast.vue';
import ActiveEffects from '~/features/game/ui/ActiveEffects.vue';

// OPTIMIZATION: Lazy-loaded components (loaded only when tab is opened)
const DevPanel = defineAsyncComponent(() => import('~/features/game/ui/DevPanel.vue'));
const PrestigePanel = defineAsyncComponent(() => import('~/features/game/ui/PrestigePanel.vue'));
const AchievementPanel = defineAsyncComponent(() => import('~/features/game/ui/AchievementPanel.vue'));
const RelicPanel = defineAsyncComponent(() => import('~/features/game/ui/RelicPanel.vue'));
const ChallengesPanel = defineAsyncComponent(() => import('~/features/game/ui/ChallengesPanelInline.vue'));
const EventModal = defineAsyncComponent(() => import('~/features/game/ui/EventModal.vue'));
const RelicDropModal = defineAsyncComponent(() => import('~/features/game/ui/RelicDropModal.vue'));
const StatisticsPanel = defineAsyncComponent(() => import('~/features/game/ui/StatisticsPanel.vue'));

import { useNarrativeStore } from '~/stores/narrative';
import { usePrestigeStore } from '~/stores/prestige';
import { useAchievementStore } from '~/stores/achievements';
import { useEventStore } from '~/stores/events';
import { useRelicStore } from '~/stores/relics';
import { useChallengeStore } from '~/stores/challenges';

// Stores
const gameLoopStore = useGameLoopStore();
const resourceStore = useResourceStore();
const entityStore = useEntityStore();
const narrativeStore = useNarrativeStore();
const prestigeStore = usePrestigeStore();
const achievementStore = useAchievementStore();
const eventStore = useEventStore();
const relicStore = useRelicStore();
const challengeStore = useChallengeStore();

// Tab state
const activeTab = ref<'game' | 'achievements' | 'relics' | 'challenges' | 'prestige'>('game');

// Refs
const { unlockedResources } = storeToRefs(resourceStore);
const { unlockedEntities } = storeToRefs(entityStore);
const { latestEntries: narrativeEntries } = storeToRefs(narrativeStore);

function addNarrativeEntry(message: string, type: 'info' | 'warning' | 'error' | 'achievement' | 'lore' = 'info') {
  narrativeStore.addLog({ message, type });
}

function formatLogTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
}

// Entity purchase handler (supports multi-buy)
function handleBuyEntity(id: string, quantity: number = 1) {
  const entity = entityStore.entities[id as EntityId];
  if (!entity) return;

  const success = entityStore.purchase(id as EntityId, quantity);
  if (success) {
    if (quantity === 1) {
      addNarrativeEntry(`Wzniesiono: ${entity.name}`, 'info');
    } else {
      addNarrativeEntry(`Wzniesiono ${quantity}x ${entity.name}`, 'info');
    }
  }
}

// Entity upgrade handler
function handleUpgradeEntity(id: string) {
  const entity = entityStore.entities[id as EntityId];
  if (!entity) return;

  const success = entityStore.upgrade(id as EntityId);
  if (success) {
    if (entityStore.isMaxLevel(id as EntityId)) {
      addNarrativeEntry(`⭐ ${entity.name} osiągnął maksymalny poziom! Efekt specjalny aktywowany!`, 'achievement');
    } else {
      addNarrativeEntry(`✨ Ulepszono ${entity.name} do poziomu ${entity.level}`, 'info');
    }
  }
}

// Check unlocks periodically
let unlockCheckInterval: ReturnType<typeof setInterval>;

// Hotkey handler
function handleKeydown(event: KeyboardEvent) {
  // Ignore if typing in input field
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
    return;
  }

  switch (event.key) {
    case '1':
      activeTab.value = 'game';
      break;
    case '2':
      activeTab.value = 'achievements';
      break;
    case '3':
      activeTab.value = 'challenges';
      break;
    case '4':
      activeTab.value = 'relics';
      break;
    case '5':
      activeTab.value = 'prestige';
      break;
    case '6':
      activeTab.value = 'statistics';
      break;
    case ' ': // Space
      event.preventDefault(); // Prevent page scroll
      handleHotkeyPray();
      break;
  }
}

// Hotkey prayer (without animation)
function handleHotkeyPray() {
  resourceStore.pray();
  achievementStore.registerClick();
}

onMounted(() => {
  // Start game loop
  gameLoopStore.start();

  // Initialize production rates
  entityStore.updateProductionRates();

  // Apply prestige bonuses from previous runs
  prestigeStore.applyPrestigeBonuses();

  // Initialize challenges
  challengeStore.initialize();

  // Add welcome message
  addNarrativeEntry('Witaj w Sanktuarium Solmara. Wiara jest Twoją bronią.', 'lore');

  // Register hotkeys
  window.addEventListener('keydown', handleKeydown);

  // Check unlocks and achievements every second
  unlockCheckInterval = setInterval(() => {
    entityStore.checkUnlocks();
    achievementStore.checkAchievements();
  }, 1000);
});

onUnmounted(() => {
  gameLoopStore.stop();
  clearInterval(unlockCheckInterval);
  window.removeEventListener('keydown', handleKeydown);
});

// Watch for milestone achievements
watch(
  () => resourceStore.resources.faith.amount,
  (newAmount, oldAmount) => {
    const milestones = [10, 50, 100, 500, 1000, 5000, 10000];

    for (const milestone of milestones) {
      if (oldAmount && oldAmount.lt(milestone) && newAmount.gte(milestone)) {
        addNarrativeEntry(`Osiągnięto ${milestone} Wiary! Solmar uśmiecha się.`, 'achievement');
      }
    }
  }
);

// Page meta
useHead({
  title: 'Sanktuarium Solmara - Gra IDLE',
  meta: [
    { name: 'description', content: 'Gra typu Premium Idle w klimacie Religious Grimdark' },
  ],
});
</script>

<style scoped lang="scss">
.game-page {
  min-height: 100vh;
  padding-top: 64px; // Header height
}

.game-container {
  max-width: 1600px;
  margin: 0 auto;
}

.panel-section {
  height: 100%;
}

.panel-title {
  font-family: var(--font-lore-solmar) !important;
  display: flex;
  align-items: center;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(var(--v-theme-primary), 0.2);
}

.main-panel {
  display: flex;
  flex-direction: column;
}

.main-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-bottom: 1rem;

  .main-tab {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    padding: 0.5rem 0.75rem;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(var(--v-theme-primary), 0.2);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 500;
    font-size: 0.875rem;
    white-space: nowrap;

    &:hover {
      background: rgba(0, 0, 0, 0.4);
      border-color: rgba(var(--v-theme-primary), 0.4);
    }

    &.active {
      background: rgba(var(--v-theme-primary), 0.15);
      border-color: rgba(var(--v-theme-primary), 0.5);
      color: rgb(var(--v-theme-primary));
    }

    &.achievement-tab {
      &.active {
        background: rgba(255, 193, 7, 0.15);
        border-color: rgba(255, 193, 7, 0.5);
        color: #ffc107;
      }

      .achievement-badge {
        padding: 0.125rem 0.5rem;
        background: rgba(255, 193, 7, 0.3);
        border-radius: 10px;
        font-size: 0.75rem;
        color: #ffc107;
        font-weight: bold;
        animation: badge-pulse 1s ease-in-out infinite;
      }
    }

    &.challenge-tab {
      &.active {
        background: rgba(76, 175, 80, 0.15);
        border-color: rgba(76, 175, 80, 0.5);
        color: #4caf50;
      }

      .challenge-badge {
        padding: 0.125rem 0.5rem;
        background: rgba(76, 175, 80, 0.3);
        border-radius: 10px;
        font-size: 0.75rem;
        color: #4caf50;
        font-weight: bold;
      }
    }

    &.relic-tab {
      &.active {
        background: rgba(156, 39, 176, 0.15);
        border-color: rgba(156, 39, 176, 0.5);
        color: #9c27b0;
      }

      .relic-badge {
        padding: 0.125rem 0.5rem;
        background: rgba(156, 39, 176, 0.2);
        border-radius: 10px;
        font-size: 0.75rem;
        color: #9c27b0;
      }
    }

    &.prestige-tab {
      &.active {
        background: rgba(255, 140, 0, 0.15);
        border-color: rgba(255, 140, 0, 0.5);
        color: #ff8c00;
      }

      .ashes-badge {
        padding: 0.125rem 0.5rem;
        background: rgba(255, 140, 0, 0.2);
        border-radius: 10px;
        font-size: 0.75rem;
        color: #ff8c00;
      }
    }
  }
}

@keyframes badge-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.tab-content {
  flex: 1;
  min-height: 0;
}

.prestige-content,
.achievement-content,
.relic-content {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.prayer-wrapper {
  padding: 2rem;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
}

.narrative-section {
  flex-grow: 1;
}

.narrative-log {
  max-height: 300px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(var(--v-theme-primary), 0.3);

    &:hover {
      background: rgba(var(--v-theme-primary), 0.5);
    }
  }
}

.log-entries {
  font-family: var(--font-body-solmar);
  font-size: 0.875rem;
}

.log-entry {
  display: flex;
  gap: 0.75rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(var(--v-theme-primary), 0.1);

  &--info {
    .log-message {
      color: rgb(var(--v-theme-on-surface));
    }
  }

  &--achievement {
    .log-message {
      color: rgb(var(--v-theme-success));
    }
  }

  &--warning {
    .log-message {
      color: rgb(var(--v-theme-warning));
    }
  }

  &--error {
    .log-message {
      color: rgb(var(--v-theme-error));
    }
  }

  &--lore {
    .log-message {
      color: rgb(var(--v-theme-primary));
      font-style: italic;
    }
  }
}

.log-time {
  white-space: nowrap;
  min-width: 50px;
}

// Transition animations
.log-enter-active {
  animation: log-in 0.3s ease-out;
}

.log-leave-active {
  animation: log-out 0.2s ease-in;
}

@keyframes log-in {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes log-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
    transform: translateX(20px);
  }
}

// Responsive adjustments
@media (max-width: 960px) {
  .game-page {
    padding-top: 56px;
  }

  .prayer-wrapper {
    padding: 1rem;
  }
}
</style>
