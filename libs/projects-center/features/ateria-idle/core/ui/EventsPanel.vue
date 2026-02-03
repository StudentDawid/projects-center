<script setup lang="ts">
/**
 * Events Panel - UI for seasonal events and daily challenges
 */

import { computed, ref, onMounted } from 'vue';
import { useAteriaEventsStore } from '../model/events.store';
import {
  SEASONAL_FESTIVALS,
  WORLD_EVENTS,
  getUpcomingEvents,
  type EventDefinition,
} from '../../data/events.data';

const eventsStore = useAteriaEventsStore();

// UI State
const activeTab = ref<'active' | 'challenges' | 'calendar'>('challenges');

// Initialize daily challenges on mount
onMounted(() => {
  eventsStore.initializeDailyChallenges();
});

// Computed
const activeEvents = computed(() => eventsStore.activeEvents);
const dailyChallenges = computed(() => eventsStore.dailyChallenges);
const weekendBonus = computed(() => eventsStore.currentWeekendBonus);
const upcomingEvents = computed(() => getUpcomingEvents(60));

// Helper functions
function getProgressPercent(progress: number[], objectives: { amount: number }[]): number {
  let total = 0;
  let current = 0;
  for (let i = 0; i < objectives.length; i++) {
    total += objectives[i].amount;
    current += Math.min(progress[i], objectives[i].amount);
  }
  return total > 0 ? (current / total) * 100 : 0;
}

function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'easy': return 'success';
    case 'medium': return 'warning';
    case 'hard': return 'error';
    default: return 'grey';
  }
}

function getCategoryIcon(category: string): string {
  switch (category) {
    case 'combat': return 'mdi-sword';
    case 'merchant': return 'mdi-cart';
    case 'scientist': return 'mdi-flask';
    case 'general': return 'mdi-star';
    default: return 'mdi-help';
  }
}

function formatTimeRemaining(expiresAt: number): string {
  const remaining = expiresAt - Date.now();
  if (remaining <= 0) return 'Wygasło';

  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatEventDate(event: EventDefinition): string {
  if (event.schedule?.type === 'seasonal' && event.schedule.month && event.schedule.dayOfMonth) {
    const months = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];
    return `${event.schedule.dayOfMonth} ${months[event.schedule.month - 1]}`;
  }
  return '';
}

function getDaysUntil(event: EventDefinition): number {
  if (event.schedule?.type === 'seasonal' && event.schedule.month && event.schedule.dayOfMonth) {
    const now = new Date();
    const eventDate = new Date(now.getFullYear(), event.schedule.month - 1, event.schedule.dayOfMonth);
    if (eventDate < now) {
      eventDate.setFullYear(eventDate.getFullYear() + 1);
    }
    return Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }
  return 0;
}

// Actions
function claimReward(challengeId: string) {
  eventsStore.claimChallengeReward(challengeId);
}
</script>

<template>
  <div class="events-panel">
    <!-- Header with Active Bonuses -->
    <v-card class="mb-4">
      <v-card-text>
        <v-row align="center">
          <v-col
            cols="12"
            md="6"
          >
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
                  mdi-calendar-star
                </v-icon>
              </v-avatar>
              <div>
                <div class="text-h5">
                  Wydarzenia
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  Aktywne wydarzenia: {{ activeEvents.length }}
                </div>
              </div>
            </div>
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <div
              v-if="eventsStore.hasActiveEvent"
              class="d-flex flex-wrap gap-2 justify-md-end"
            >
              <v-chip
                v-if="eventsStore.activeEventBonuses.xp > 1"
                color="blue"
                variant="tonal"
              >
                <v-icon
                  start
                  size="16"
                >
                  mdi-book
                </v-icon>
                +{{ Math.round((eventsStore.activeEventBonuses.xp - 1) * 100) }}% XP
              </v-chip>
              <v-chip
                v-if="eventsStore.activeEventBonuses.gold > 1"
                color="amber"
                variant="tonal"
              >
                <v-icon
                  start
                  size="16"
                >
                  mdi-gold
                </v-icon>
                +{{ Math.round((eventsStore.activeEventBonuses.gold - 1) * 100) }}% Złoto
              </v-chip>
              <v-chip
                v-if="eventsStore.activeEventBonuses.loot > 1"
                color="purple"
                variant="tonal"
              >
                <v-icon
                  start
                  size="16"
                >
                  mdi-treasure-chest
                </v-icon>
                +{{ Math.round((eventsStore.activeEventBonuses.loot - 1) * 100) }}% Loot
              </v-chip>
            </div>
            <div
              v-else
              class="text-medium-emphasis text-md-right"
            >
              Brak aktywnych bonusów
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Weekend Bonus Banner -->
    <v-card
      v-if="weekendBonus"
      class="mb-4 weekend-banner"
      :style="{ borderColor: weekendBonus.color }"
    >
      <v-card-text class="d-flex align-center">
        <v-icon
          :color="weekendBonus.color"
          size="32"
          class="mr-3"
        >
          {{ weekendBonus.icon }}
        </v-icon>
        <div class="flex-grow-1">
          <div class="text-body-1 font-weight-medium">
            {{ weekendBonus.name }}
          </div>
          <div class="text-body-2 text-medium-emphasis">
            {{ weekendBonus.description }}
          </div>
        </div>
        <v-chip
          color="success"
          variant="flat"
        >
          AKTYWNE
        </v-chip>
      </v-card-text>
    </v-card>

    <!-- Tabs -->
    <v-tabs
      v-model="activeTab"
      color="pink"
      class="mb-4"
    >
      <v-tab value="challenges">
        <v-icon start>
          mdi-flag-checkered
        </v-icon>
        Wyzwania Dzienne
        <v-badge
          v-if="eventsStore.availableToClaim.length > 0"
          :content="eventsStore.availableToClaim.length"
          color="success"
          inline
        />
      </v-tab>
      <v-tab value="active">
        <v-icon start>
          mdi-party-popper
        </v-icon>
        Aktywne
        <v-badge
          v-if="activeEvents.length > 0"
          :content="activeEvents.length"
          color="pink"
          inline
        />
      </v-tab>
      <v-tab value="calendar">
        <v-icon start>
          mdi-calendar
        </v-icon>
        Kalendarz
      </v-tab>
    </v-tabs>

    <!-- Daily Challenges Tab -->
    <div v-if="activeTab === 'challenges'">
      <v-row v-if="dailyChallenges.length > 0">
        <v-col
          v-for="entry in dailyChallenges"
          :key="entry.challenge.id"
          cols="12"
          md="4"
        >
          <v-card
            class="challenge-card"
            :class="{ 'challenge-complete': entry.completed }"
          >
            <v-card-text>
              <div class="d-flex align-center mb-3">
                <v-avatar
                  :color="entry.completed ? 'success' : getDifficultyColor(entry.challenge.difficulty)"
                  size="44"
                  class="mr-3"
                >
                  <v-icon
                    size="24"
                    color="white"
                  >
                    {{ entry.completed ? 'mdi-check' : entry.challenge.icon }}
                  </v-icon>
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="text-body-1 font-weight-medium">
                    {{ entry.challenge.name }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    <v-icon
                      size="12"
                      class="mr-1"
                    >
                      {{ getCategoryIcon(entry.challenge.category) }}
                    </v-icon>
                    {{ entry.challenge.category }} •
                    <v-icon
                      size="12"
                      class="mr-1"
                    >
                      mdi-clock-outline
                    </v-icon>
                    {{ formatTimeRemaining(entry.expiresAt) }}
                  </div>
                </div>
              </div>

              <div class="text-body-2 text-medium-emphasis mb-3">
                {{ entry.challenge.description }}
              </div>

              <!-- Progress -->
              <div
                v-for="(objective, idx) in entry.challenge.objectives"
                :key="idx"
                class="mb-2"
              >
                <div class="d-flex justify-space-between text-caption mb-1">
                  <span>Postęp</span>
                  <span>{{ entry.progress[idx] }} / {{ objective.amount }}</span>
                </div>
                <v-progress-linear
                  :model-value="(entry.progress[idx] / objective.amount) * 100"
                  :color="entry.completed ? 'success' : getDifficultyColor(entry.challenge.difficulty)"
                  height="8"
                  rounded
                />
              </div>

              <!-- Rewards -->
              <div class="d-flex flex-wrap gap-1 mt-3 mb-3">
                <v-chip
                  v-for="reward in entry.challenge.rewards"
                  :key="reward.id"
                  size="x-small"
                  color="amber"
                  variant="tonal"
                >
                  {{ reward.amount }}x {{ reward.id }}
                </v-chip>
              </div>

              <!-- Claim Button -->
              <v-btn
                v-if="entry.completed && !entry.claimed"
                block
                color="success"
                @click="claimReward(entry.challenge.id)"
              >
                <v-icon start>
                  mdi-gift
                </v-icon>
                Odbierz Nagrodę
              </v-btn>
              <v-btn
                v-else-if="entry.claimed"
                block
                color="grey"
                variant="tonal"
                disabled
              >
                <v-icon start>
                  mdi-check
                </v-icon>
                Odebrano
              </v-btn>
              <v-btn
                v-else
                block
                :color="getDifficultyColor(entry.challenge.difficulty)"
                variant="tonal"
                disabled
              >
                W trakcie...
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-card
        v-else
        class="text-center py-8"
      >
        <v-icon
          size="64"
          color="grey"
        >
          mdi-flag-outline
        </v-icon>
        <div class="text-h6 mt-4">
          Ładowanie wyzwań...
        </div>
      </v-card>

      <!-- Challenge Stats -->
      <v-card class="mt-4">
        <v-card-title>
          <v-icon
            class="mr-2"
            color="info"
          >
            mdi-chart-bar
          </v-icon>
          Dzisiejsze Statystyki
        </v-card-title>
        <v-card-text>
          <v-row dense>
            <v-col
              cols="6"
              md="3"
            >
              <div class="stat-box text-center pa-2 rounded">
                <div class="text-h6 font-weight-bold">
                  {{ eventsStore.challengeStats.killsToday }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  Zabójstwa
                </div>
              </div>
            </v-col>
            <v-col
              cols="6"
              md="3"
            >
              <div class="stat-box text-center pa-2 rounded">
                <div class="text-h6 font-weight-bold text-amber">
                  {{ eventsStore.challengeStats.goldEarnedToday }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  Złoto Zdobyte
                </div>
              </div>
            </v-col>
            <v-col
              cols="6"
              md="3"
            >
              <div class="stat-box text-center pa-2 rounded">
                <div class="text-h6 font-weight-bold">
                  {{ eventsStore.challengeStats.potionsCraftedToday }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  Mikstury
                </div>
              </div>
            </v-col>
            <v-col
              cols="6"
              md="3"
            >
              <div class="stat-box text-center pa-2 rounded">
                <div class="text-h6 font-weight-bold">
                  {{ eventsStore.totalChallengesCompleted }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  Wyzwań Ukończonych
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </div>

    <!-- Active Events Tab -->
    <div v-if="activeTab === 'active'">
      <v-row v-if="activeEvents.length > 0">
        <v-col
          v-for="event in activeEvents"
          :key="event.id"
          cols="12"
          md="6"
        >
          <v-card class="event-card">
            <v-card-text>
              <div class="d-flex align-center mb-3">
                <v-icon
                  size="40"
                  class="mr-3"
                >
                  mdi-party-popper
                </v-icon>
                <div class="flex-grow-1">
                  <div class="text-h6">
                    {{ event.name }}
                  </div>
                  <div class="text-body-2 text-medium-emphasis">
                    {{ event.description }}
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <div class="d-flex justify-space-between text-caption mb-1">
                  <span>Czas pozostały</span>
                  <span>{{ formatTimeRemaining(event.endTime) }}</span>
                </div>
                <v-progress-linear
                  :model-value="((Date.now() - event.startTime) / (event.endTime - event.startTime)) * 100"
                  color="pink"
                  height="8"
                  rounded
                />
              </div>

              <div class="d-flex flex-wrap gap-1">
                <v-chip
                  v-for="(mod, idx) in event.modifiers"
                  :key="idx"
                  size="small"
                  color="pink"
                  variant="tonal"
                >
                  {{ mod.type === 'xp_multiplier' ? `+${Math.round((mod.value - 1) * 100)}% XP` :
                    mod.type === 'gold_multiplier' ? `+${Math.round((mod.value - 1) * 100)}% Złoto` :
                    mod.type === 'loot_multiplier' ? `+${Math.round((mod.value - 1) * 100)}% Loot` :
                    `-${Math.round(mod.value * 100)}% Koszty` }}
                </v-chip>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-card
        v-else
        class="text-center py-8"
      >
        <v-icon
          size="64"
          color="grey"
        >
          mdi-calendar-blank
        </v-icon>
        <div class="text-h6 mt-4">
          Brak aktywnych wydarzeń
        </div>
        <div class="text-body-2 text-medium-emphasis">
          Sprawdź kalendarz nadchodzących wydarzeń
        </div>
      </v-card>
    </div>

    <!-- Calendar Tab -->
    <div v-if="activeTab === 'calendar'">
      <v-card class="mb-4">
        <v-card-title>
          <v-icon
            class="mr-2"
            color="pink"
          >
            mdi-calendar-month
          </v-icon>
          Nadchodzące Festiwale
        </v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item
              v-for="event in upcomingEvents"
              :key="event.id"
            >
              <template #prepend>
                <v-avatar
                  :color="event.color"
                  size="40"
                >
                  <v-icon color="white">
                    {{ event.icon }}
                  </v-icon>
                </v-avatar>
              </template>

              <v-list-item-title>{{ event.name }}</v-list-item-title>
              <v-list-item-subtitle>{{ event.description }}</v-list-item-subtitle>

              <template #append>
                <div class="text-right">
                  <div class="text-body-2 font-weight-bold">
                    {{ formatEventDate(event) }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    za {{ getDaysUntil(event) }} dni
                  </div>
                </div>
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>

      <!-- World Events Info -->
      <v-card>
        <v-card-title>
          <v-icon
            class="mr-2"
            color="warning"
          >
            mdi-earth
          </v-icon>
          Losowe Wydarzenia Świata
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col
              v-for="event in WORLD_EVENTS"
              :key="event.id"
              cols="12"
              md="6"
            >
              <v-card
                variant="outlined"
                class="world-event-card"
              >
                <v-card-text class="d-flex align-center">
                  <v-icon
                    :color="event.color"
                    size="32"
                    class="mr-3"
                  >
                    {{ event.icon }}
                  </v-icon>
                  <div>
                    <div class="text-body-2 font-weight-medium">
                      {{ event.name }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      {{ event.description }}
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
          <v-alert
            type="info"
            variant="tonal"
            class="mt-4"
          >
            <v-icon start>
              mdi-information
            </v-icon>
            Wydarzenia światowe pojawiają się losowo każdego dnia. Bądź gotowy!
          </v-alert>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<style scoped>
.challenge-card {
  transition: all 0.2s ease;
  height: 100%;
}

.challenge-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.challenge-complete {
  border: 2px solid rgba(76, 175, 80, 0.5);
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, transparent 100%);
}

.weekend-banner {
  border-left: 4px solid;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.03) 0%, transparent 100%);
}

.event-card {
  transition: all 0.2s ease;
}

.world-event-card {
  transition: all 0.2s ease;
}

.world-event-card:hover {
  background: rgba(255, 255, 255, 0.03);
}

.stat-box {
  background: rgba(255, 255, 255, 0.03);
}
</style>
