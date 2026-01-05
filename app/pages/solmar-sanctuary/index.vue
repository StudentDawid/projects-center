<template>
  <div class="game-page">
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

            <!-- Combat Panel -->
            <CombatPanel />
          </div>
        </v-col>

        <!-- Center Panel - Main Action -->
        <v-col cols="12" md="6">
          <div class="panel-section main-panel">
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
        </v-col>

        <!-- Right Panel - Buildings -->
        <v-col cols="12" md="3">
          <div class="panel-section">
            <h2 class="panel-title text-h6 mb-4">
              <v-icon icon="mdi-domain" class="mr-2" />
              Budynki
            </h2>

            <div class="buildings-list d-flex flex-column gap-3">
              <BuildingCard
                v-for="entity in unlockedEntities"
                :key="entity.id"
                :id="entity.id"
                :name="entity.name"
                :description="entity.description"
                :icon="entity.icon"
                :count="entity.count"
                :cost-display="entityStore.getFormattedCost(entity.id)"
                :production-display="entityStore.getProductionDisplay(entity.id)"
                :consumption-display="entityStore.getConsumptionDisplay(entity.id)"
                :can-afford="entityStore.canAfford(entity.id)"
                @buy="handleBuyEntity"
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useGameLoopStore } from '~/stores/gameLoop';
import { useResourceStore } from '~/stores/resources';
import { useEntityStore } from '~/stores/entities';
import type { EntityId } from '~/shared/types/game.types';

// Components
import GameHeader from '~/features/game/ui/GameHeader.vue';
import ResourceDisplay from '~/features/game/ui/ResourceDisplay.vue';
import BuildingCard from '~/features/game/ui/BuildingCard.vue';
import PrayerButton from '~/features/game/ui/PrayerButton.vue';
import DevPanel from '~/features/game/ui/DevPanel.vue';
import CombatPanel from '~/features/game/ui/CombatPanel.vue';

import { useNarrativeStore } from '~/stores/narrative';

// Stores
const gameLoopStore = useGameLoopStore();
const resourceStore = useResourceStore();
const entityStore = useEntityStore();
const narrativeStore = useNarrativeStore();

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

// Entity purchase handler
function handleBuyEntity(id: string) {
  const entity = entityStore.entities[id as EntityId];
  if (!entity) return;

  const success = entityStore.purchase(id as EntityId);
  if (success) {
    addNarrativeEntry(`Wzniesiono: ${entity.name}`, 'info');
  }
}

// Check unlocks periodically
let unlockCheckInterval: ReturnType<typeof setInterval>;

onMounted(() => {
  // Start game loop
  gameLoopStore.start();

  // Initialize production rates
  entityStore.updateProductionRates();

  // Add welcome message
  addNarrativeEntry('Witaj w Sanktuarium Solmara. Wiara jest Twoją bronią.', 'lore');

  // Check unlocks every second
  unlockCheckInterval = setInterval(() => {
    entityStore.checkUnlocks();
  }, 1000);
});

onUnmounted(() => {
  gameLoopStore.stop();
  clearInterval(unlockCheckInterval);
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
