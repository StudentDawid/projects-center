<script setup lang="ts">
/**
 * Achievements Panel - UI for viewing all achievements
 */

import { computed, ref } from 'vue';
import { useAteriaAchievementsStore } from '../model/achievements.store';
import {
  ACHIEVEMENTS,
  ACHIEVEMENT_CATEGORIES,
  getRarityInfo,
  type AchievementDefinition,
} from '../../data/achievements.data';
import type { AchievementCategory } from '@ateria-idle/entities/ateria-idle/game';

const achievementsStore = useAteriaAchievementsStore();

// UI State
const selectedCategory = ref<AchievementCategory | 'all'>('all');
const showOnlyUnlocked = ref(false);
const searchQuery = ref('');

// Computed
const categories = computed(() => Object.values(ACHIEVEMENT_CATEGORIES));

const filteredAchievements = computed(() => {
  let result = [...ACHIEVEMENTS];

  // Filter by category
  if (selectedCategory.value !== 'all') {
    result = result.filter(a => a.category === selectedCategory.value);
  }

  // Filter by unlock status
  if (showOnlyUnlocked.value) {
    result = result.filter(a => achievementsStore.isUnlocked(a.id));
  }

  // Filter by search
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(a =>
      a.name.toLowerCase().includes(query) ||
      a.description.toLowerCase().includes(query)
    );
  }

  // Sort: unlocked first, then by rarity
  const rarityOrder = ['legendary', 'epic', 'rare', 'uncommon', 'common'];
  result.sort((a, b) => {
    const aUnlocked = achievementsStore.isUnlocked(a.id);
    const bUnlocked = achievementsStore.isUnlocked(b.id);

    if (aUnlocked !== bUnlocked) {
      return aUnlocked ? -1 : 1;
    }

    return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
  });

  return result;
});

const recentAchievements = computed(() => {
  return achievementsStore.recentlyUnlocked
    .map(id => ACHIEVEMENTS.find(a => a.id === id))
    .filter(Boolean)
    .slice(0, 5) as AchievementDefinition[];
});

// Helper functions
function getCategoryInfo(category: AchievementCategory) {
  return ACHIEVEMENT_CATEGORIES[category];
}

function getProgressPercent(achievement: AchievementDefinition): number {
  if (achievementsStore.isUnlocked(achievement.id)) return 100;
  return Math.round(achievementsStore.getProgress(achievement) * 100);
}

function formatUnlockTime(achievementId: string): string {
  const timestamp = achievementsStore.getUnlockTime(achievementId);
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatPlayTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}
</script>

<template>
  <div class="achievements-panel">
    <!-- Header Stats -->
    <v-card class="mb-4">
      <v-card-text>
        <v-row align="center">
          <!-- Total Progress -->
          <v-col
            cols="12"
            md="4"
          >
            <div class="d-flex align-center">
              <v-avatar
                color="amber"
                size="64"
                class="mr-4"
              >
                <v-icon
                  size="36"
                  color="white"
                >
                  mdi-trophy
                </v-icon>
              </v-avatar>
              <div>
                <div class="text-h5 font-weight-bold">
                  {{ achievementsStore.unlockedCount }} / {{ achievementsStore.totalCount }}
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  Osiągnięcia odblokowane
                </div>
              </div>
            </div>
            <v-progress-linear
              :model-value="achievementsStore.completionPercent"
              color="amber"
              height="10"
              rounded
              class="mt-3"
            >
              <template #default>
                <span class="text-caption font-weight-bold">
                  {{ achievementsStore.completionPercent }}%
                </span>
              </template>
            </v-progress-linear>
          </v-col>

          <!-- Points -->
          <v-col
            cols="6"
            md="3"
          >
            <div class="stat-box text-center pa-3 rounded">
              <v-icon
                color="primary"
                size="32"
                class="mb-1"
              >
                mdi-star
              </v-icon>
              <div class="text-h4 font-weight-bold text-primary">
                {{ achievementsStore.totalPoints }}
              </div>
              <div class="text-caption text-medium-emphasis">
                Punkty Osiągnięć
              </div>
            </div>
          </v-col>

          <!-- Play Time -->
          <v-col
            cols="6"
            md="2"
          >
            <div class="stat-box text-center pa-3 rounded">
              <v-icon
                color="blue-grey"
                size="28"
                class="mb-1"
              >
                mdi-clock-outline
              </v-icon>
              <div class="text-h6 font-weight-bold">
                {{ formatPlayTime(achievementsStore.stats.playTimeSeconds) }}
              </div>
              <div class="text-caption text-medium-emphasis">
                Czas gry
              </div>
            </div>
          </v-col>

          <!-- Total Kills -->
          <v-col
            cols="6"
            md="3"
          >
            <div class="stat-box text-center pa-3 rounded">
              <v-icon
                color="error"
                size="28"
                class="mb-1"
              >
                mdi-skull
              </v-icon>
              <div class="text-h6 font-weight-bold">
                {{ achievementsStore.stats.totalKills.toLocaleString() }}
              </div>
              <div class="text-caption text-medium-emphasis">
                Zabójstwa
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Recent Achievements -->
    <v-card
      v-if="recentAchievements.length > 0"
      class="mb-4 recent-card"
    >
      <v-card-title class="d-flex align-center">
        <v-icon
          color="success"
          class="mr-2"
        >
          mdi-bell-ring
        </v-icon>
        Ostatnio odblokowane
        <v-spacer />
        <v-btn
          size="small"
          variant="text"
          @click="achievementsStore.clearRecentlyUnlocked()"
        >
          Wyczyść
        </v-btn>
      </v-card-title>
      <v-card-text>
        <div class="d-flex flex-wrap gap-2">
          <v-chip
            v-for="achievement in recentAchievements"
            :key="achievement.id"
            :color="getRarityInfo(achievement.rarity).color"
            variant="flat"
          >
            <v-icon
              start
              size="18"
            >
              {{ achievement.icon }}
            </v-icon>
            {{ achievement.name }}
          </v-chip>
        </div>
      </v-card-text>
    </v-card>

    <!-- Category Stats -->
    <v-card class="mb-4">
      <v-card-text class="pa-3">
        <v-row dense>
          <v-col
            v-for="cat in categories"
            :key="cat.id"
            cols="6"
            sm="4"
            md="2"
          >
            <div
              class="category-stat pa-2 rounded text-center cursor-pointer"
              :class="{ 'category-stat-active': selectedCategory === cat.id }"
              @click="selectedCategory = selectedCategory === cat.id ? 'all' : cat.id"
            >
              <v-icon
                :color="cat.color"
                size="24"
                class="mb-1"
              >
                {{ cat.icon }}
              </v-icon>
              <div class="text-caption font-weight-medium">
                {{ cat.name }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ achievementsStore.unlockedByCategory[cat.id] }} / {{ achievementsStore.categoryTotals[cat.id] }}
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Filters -->
    <v-card class="mb-4">
      <v-card-text class="pa-3">
        <v-row
          align="center"
          dense
        >
          <v-col
            cols="12"
            md="6"
          >
            <v-text-field
              v-model="searchQuery"
              prepend-inner-icon="mdi-magnify"
              label="Szukaj osiągnięć..."
              density="compact"
              variant="outlined"
              hide-details
              clearable
            />
          </v-col>
          <v-col
            cols="12"
            md="3"
          >
            <v-select
              v-model="selectedCategory"
              :items="[
                { title: 'Wszystkie', value: 'all' },
                ...categories.map(c => ({ title: c.name, value: c.id }))
              ]"
              label="Kategoria"
              density="compact"
              variant="outlined"
              hide-details
            />
          </v-col>
          <v-col
            cols="12"
            md="3"
          >
            <v-switch
              v-model="showOnlyUnlocked"
              label="Tylko odblokowane"
              density="compact"
              color="success"
              hide-details
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Achievement Grid -->
    <v-row>
      <v-col
        v-for="achievement in filteredAchievements"
        :key="achievement.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card
          class="achievement-card"
          :class="{
            'achievement-unlocked': achievementsStore.isUnlocked(achievement.id),
            'achievement-locked': !achievementsStore.isUnlocked(achievement.id),
            'achievement-hidden': achievement.hidden && !achievementsStore.isUnlocked(achievement.id),
          }"
        >
          <v-card-text class="pa-3">
            <!-- Header -->
            <div class="d-flex align-center mb-2">
              <v-avatar
                :color="achievementsStore.isUnlocked(achievement.id)
                  ? getRarityInfo(achievement.rarity).color
                  : 'grey'"
                size="48"
                class="mr-3"
              >
                <v-icon
                  size="28"
                  color="white"
                >
                  {{ achievement.hidden && !achievementsStore.isUnlocked(achievement.id)
                    ? 'mdi-help'
                    : achievement.icon }}
                </v-icon>
              </v-avatar>
              <div class="flex-grow-1">
                <div class="text-body-1 font-weight-medium">
                  {{ achievement.hidden && !achievementsStore.isUnlocked(achievement.id)
                    ? '???'
                    : achievement.name }}
                </div>
                <v-chip
                  size="x-small"
                  :color="getRarityInfo(achievement.rarity).color"
                  variant="tonal"
                >
                  {{ getRarityInfo(achievement.rarity).name }}
                </v-chip>
              </div>
              <v-icon
                v-if="achievementsStore.isUnlocked(achievement.id)"
                color="success"
                size="24"
              >
                mdi-check-circle
              </v-icon>
            </div>

            <!-- Description -->
            <div class="text-body-2 text-medium-emphasis mb-2">
              {{ achievement.hidden && !achievementsStore.isUnlocked(achievement.id)
                ? 'Ukryte osiągnięcie'
                : achievement.description }}
            </div>

            <!-- Category -->
            <div class="d-flex align-center mb-2">
              <v-icon
                :color="getCategoryInfo(achievement.category).color"
                size="16"
                class="mr-1"
              >
                {{ getCategoryInfo(achievement.category).icon }}
              </v-icon>
              <span class="text-caption text-medium-emphasis">
                {{ getCategoryInfo(achievement.category).name }}
              </span>
            </div>

            <!-- Progress -->
            <div v-if="!achievementsStore.isUnlocked(achievement.id) && achievement.progressTarget">
              <v-progress-linear
                :model-value="getProgressPercent(achievement)"
                :color="getCategoryInfo(achievement.category).color"
                height="6"
                rounded
                class="mb-1"
              />
              <div class="text-caption text-medium-emphasis text-right">
                {{ getProgressPercent(achievement) }}%
              </div>
            </div>

            <!-- Unlock time -->
            <div
              v-if="achievementsStore.isUnlocked(achievement.id)"
              class="text-caption text-success"
            >
              <v-icon
                size="12"
                class="mr-1"
              >
                mdi-clock-check-outline
              </v-icon>
              {{ formatUnlockTime(achievement.id) }}
            </div>

            <!-- Reward -->
            <div
              v-if="achievement.reward"
              class="reward-badge mt-2 pa-1 rounded d-flex align-center"
            >
              <v-icon
                size="14"
                color="amber"
                class="mr-1"
              >
                mdi-gift
              </v-icon>
              <span class="text-caption">
                {{ achievement.reward.type === 'title' ? `Tytuł: ${achievement.reward.value}` :
                  achievement.reward.type === 'lp_bonus' ? `+${achievement.reward.value} LP` :
                    achievement.reward.type === 'permanent_buff' ? `+${achievement.reward.value}% bonus` :
                      'Nagroda' }}
              </span>
            </div>

            <!-- Points -->
            <div class="text-right mt-2">
              <v-chip
                size="x-small"
                color="primary"
                variant="outlined"
              >
                {{ getRarityInfo(achievement.rarity).points }} pkt
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Empty state -->
    <v-card v-if="filteredAchievements.length === 0">
      <v-card-text class="text-center pa-8">
        <v-icon
          size="64"
          color="grey"
          class="mb-4"
        >
          mdi-trophy-broken
        </v-icon>
        <div class="text-h6 text-medium-emphasis">
          Brak osiągnięć pasujących do filtrów
        </div>
        <div class="text-body-2 text-medium-emphasis">
          Spróbuj zmienić kryteria wyszukiwania
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<style scoped>
.stat-box {
  background: rgba(255, 255, 255, 0.03);
}

.recent-card {
  border: 1px solid rgba(76, 175, 80, 0.3);
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, transparent 100%);
}

.category-stat {
  background: rgba(255, 255, 255, 0.03);
  transition: all 0.2s ease;
}

.category-stat:hover,
.category-stat-active {
  background: rgba(255, 255, 255, 0.08);
  transform: scale(1.02);
}

.achievement-card {
  height: 100%;
  transition: all 0.2s ease;
}

.achievement-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.achievement-unlocked {
  border: 1px solid rgba(76, 175, 80, 0.3);
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, transparent 100%);
}

.achievement-locked {
  opacity: 0.7;
}

.achievement-hidden {
  opacity: 0.5;
  filter: grayscale(50%);
}

.reward-badge {
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.2);
}

.cursor-pointer {
  cursor: pointer;
}
</style>
