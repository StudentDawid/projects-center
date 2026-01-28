<script setup lang="ts">
/**
 * Stats Panel - Detailed game statistics
 */

import { computed, ref } from 'vue';
import { useAteriaGameStore } from '../model/game.store';
import { useAteriaWarriorStore } from '../../warrior/model/warrior.store';
import { useAteriaMerchantStore } from '../../merchant/model/merchant.store';
import { useAteriaScientistStore } from '../../scientist/model/scientist.store';
import { useAteriaPrestigeStore } from '../model/prestige.store';
import { useAteriaAchievementsStore } from '../model/achievements.store';
import { useAteriaEventsStore } from '../model/events.store';
import { formatNumber } from '~/shared/lib/big-number';

const gameStore = useAteriaGameStore();
const warriorStore = useAteriaWarriorStore();
const merchantStore = useAteriaMerchantStore();
const scientistStore = useAteriaScientistStore();
const prestigeStore = useAteriaPrestigeStore();
const achievementsStore = useAteriaAchievementsStore();
const eventsStore = useAteriaEventsStore();

// UI State
const activeTab = ref<'overview' | 'warrior' | 'merchant' | 'scientist' | 'records'>('overview');

// Helper functions
function formatPlaytime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

function formatDate(timestamp: number): string {
  if (!timestamp) return 'Nigdy';
  return new Date(timestamp).toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Computed stats
const overviewStats = computed(() => [
  {
    label: 'Całkowity Czas Gry',
    value: formatPlaytime(achievementsStore.stats.playTimeSeconds),
    icon: 'mdi-clock',
    color: 'blue',
  },
  {
    label: 'Liczba Prestiży',
    value: prestigeStore.prestigeCount.toString(),
    icon: 'mdi-star-circle',
    color: 'purple',
  },
  {
    label: 'Całkowite LP',
    value: prestigeStore.totalLPEarned.toString(),
    icon: 'mdi-star',
    color: 'amber',
  },
  {
    label: 'Osiągnięcia',
    value: `${achievementsStore.unlockedCount} / ${achievementsStore.totalCount}`,
    icon: 'mdi-trophy',
    color: 'orange',
  },
  {
    label: 'Wyzwania Ukończone',
    value: eventsStore.totalChallengesCompleted.toString(),
    icon: 'mdi-flag-checkered',
    color: 'green',
  },
  {
    label: 'Zgony',
    value: achievementsStore.stats.deaths.toString(),
    icon: 'mdi-skull',
    color: 'red',
  },
]);

const warriorStats = computed(() => [
  {
    label: 'Poziom Wojownika',
    value: warriorStore.stats.level.toString(),
    icon: 'mdi-sword',
    color: 'red',
  },
  {
    label: 'Całkowite Zabójstwa',
    value: achievementsStore.stats.totalKills.toString(),
    icon: 'mdi-skull-crossbones',
    color: 'grey',
  },
  {
    label: 'Lochy Ukończone',
    value: warriorStore.completedDungeons.size.toString(),
    icon: 'mdi-castle',
    color: 'orange',
  },
  {
    label: 'Poziom Łowcy',
    value: warriorStore.slayer.level.toString(),
    icon: 'mdi-target-account',
    color: 'purple',
  },
  {
    label: 'Zadania Łowcy',
    value: warriorStore.slayer.completedTasks.toString(),
    icon: 'mdi-check-decagram',
    color: 'blue',
  },
  {
    label: 'Monety Łowcy',
    value: warriorStore.slayer.totalCoins.toString(),
    icon: 'mdi-coin',
    color: 'amber',
  },
]);

const merchantStats = computed(() => [
  {
    label: 'Poziom Kupca',
    value: merchantStore.merchantLevel.toString(),
    icon: 'mdi-cart',
    color: 'amber',
  },
  {
    label: 'Złoto w Sesji',
    value: formatNumber(merchantStore.sessionGoldEarned),
    icon: 'mdi-gold',
    color: 'yellow',
  },
  {
    label: 'Przedmioty Sprzedane (Sesja)',
    value: merchantStore.sessionItemsSold.toString(),
    icon: 'mdi-package-variant-closed',
    color: 'brown',
  },
  {
    label: 'Klienci Obsłużeni (Sesja)',
    value: merchantStore.sessionCustomersServed.toString(),
    icon: 'mdi-account-group',
    color: 'blue',
  },
  {
    label: 'Reputacja',
    value: merchantStore.stats.reputationTier,
    icon: 'mdi-star',
    color: 'orange',
  },
  {
    label: 'Udane Targowania',
    value: eventsStore.challengeStats.itemsSoldToday.toString(),
    icon: 'mdi-handshake',
    color: 'green',
  },
]);

const scientistStats = computed(() => [
  {
    label: 'Poziom Naukowca',
    value: scientistStore.stats.level.toString(),
    icon: 'mdi-flask',
    color: 'green',
  },
  {
    label: 'Mikstury Stworzone (Sesja)',
    value: scientistStore.sessionPotionsCrafted.toString(),
    icon: 'mdi-flask-round-bottom',
    color: 'purple',
  },
  {
    label: 'Badania Ukończone (Sesja)',
    value: scientistStore.sessionResearchCompleted.toString(),
    icon: 'mdi-book-open-page-variant',
    color: 'blue',
  },
  {
    label: 'Kolby Czerwone (Sesja)',
    value: Math.floor(scientistStore.sessionFlasksProduced.red).toString(),
    icon: 'mdi-water',
    color: 'red',
  },
  {
    label: 'Aktywne Golemy',
    value: scientistStore.activeGolems.length.toString(),
    icon: 'mdi-robot',
    color: 'grey',
  },
  {
    label: 'Receptury Odkryte',
    value: scientistStore.discoveredPotions.length.toString(),
    icon: 'mdi-lightbulb',
    color: 'amber',
  },
]);

const categoryKills = computed(() => {
  return Object.entries(warriorStore.slayer.categoryKills).map(([category, kills]) => ({
    category,
    kills,
    icon: getCategoryIcon(category),
    color: getCategoryColor(category),
  }));
});

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    undead: 'mdi-skull',
    beast: 'mdi-paw',
    demon: 'mdi-fire',
    elemental: 'mdi-atom',
    dragon: 'mdi-dragon',
    aberration: 'mdi-eye',
  };
  return icons[category] || 'mdi-help';
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    undead: 'grey',
    beast: 'brown',
    demon: 'red',
    elemental: 'blue',
    dragon: 'orange',
    aberration: 'purple',
  };
  return colors[category] || 'grey';
}
</script>

<template>
  <div class="stats-panel">
    <!-- Header -->
    <v-card class="mb-4">
      <v-card-text>
        <div class="d-flex align-center">
          <v-avatar
            color="blue-grey"
            size="56"
            class="mr-4"
          >
            <v-icon
              size="32"
              color="white"
            >
              mdi-chart-bar
            </v-icon>
          </v-avatar>
          <div>
            <div class="text-h5">
              Statystyki
            </div>
            <div class="text-body-2 text-medium-emphasis">
              Szczegółowy przegląd Twoich osiągnięć
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Tabs -->
    <v-tabs
      v-model="activeTab"
      color="blue-grey"
      class="mb-4"
    >
      <v-tab value="overview">
        <v-icon start>
          mdi-view-dashboard
        </v-icon>
        Przegląd
      </v-tab>
      <v-tab value="warrior">
        <v-icon start>
          mdi-sword
        </v-icon>
        Wojownik
      </v-tab>
      <v-tab value="merchant">
        <v-icon start>
          mdi-cart
        </v-icon>
        Kupiec
      </v-tab>
      <v-tab value="scientist">
        <v-icon start>
          mdi-flask
        </v-icon>
        Naukowiec
      </v-tab>
      <v-tab value="records">
        <v-icon start>
          mdi-medal
        </v-icon>
        Rekordy
      </v-tab>
    </v-tabs>

    <!-- Overview Tab -->
    <div v-if="activeTab === 'overview'">
      <v-row>
        <v-col
          v-for="stat in overviewStats"
          :key="stat.label"
          cols="6"
          md="4"
        >
          <v-card class="stat-card">
            <v-card-text class="text-center pa-4">
              <v-icon
                :color="stat.color"
                size="40"
                class="mb-2"
              >
                {{ stat.icon }}
              </v-icon>
              <div class="text-h5 font-weight-bold">
                {{ stat.value }}
              </div>
              <div class="text-body-2 text-medium-emphasis">
                {{ stat.label }}
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Active Bonuses -->
      <v-card class="mt-4">
        <v-card-title>
          <v-icon
            class="mr-2"
            color="success"
          >
            mdi-arrow-up-bold
          </v-icon>
          Aktywne Bonusy (Legacy)
        </v-card-title>
        <v-card-text>
          <v-row dense>
            <v-col
              v-if="prestigeStore.activeBonuses.xpMultiplier > 1"
              cols="6"
              md="3"
            >
              <v-chip
                color="blue"
                variant="tonal"
              >
                +{{ Math.round((prestigeStore.activeBonuses.xpMultiplier - 1) * 100) }}% XP
              </v-chip>
            </v-col>
            <v-col
              v-if="prestigeStore.activeBonuses.goldMultiplier > 1"
              cols="6"
              md="3"
            >
              <v-chip
                color="amber"
                variant="tonal"
              >
                +{{ Math.round((prestigeStore.activeBonuses.goldMultiplier - 1) * 100) }}% Złoto
              </v-chip>
            </v-col>
            <v-col
              v-if="prestigeStore.activeBonuses.startingGold > 0"
              cols="6"
              md="3"
            >
              <v-chip
                color="amber"
                variant="tonal"
              >
                +{{ prestigeStore.activeBonuses.startingGold }} Start. Złoto
              </v-chip>
            </v-col>
            <v-col
              v-if="prestigeStore.activeBonuses.warriorDamageBonus > 0"
              cols="6"
              md="3"
            >
              <v-chip
                color="red"
                variant="tonal"
              >
                +{{ Math.round(prestigeStore.activeBonuses.warriorDamageBonus * 100) }}% Obrażenia
              </v-chip>
            </v-col>
          </v-row>
          <div
            v-if="prestigeStore.totalUpgradeLevel === 0"
            class="text-center text-medium-emphasis py-4"
          >
            Brak aktywnych bonusów - kup ulepszenia Legacy!
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Warrior Tab -->
    <div v-if="activeTab === 'warrior'">
      <v-row>
        <v-col
          v-for="stat in warriorStats"
          :key="stat.label"
          cols="6"
          md="4"
        >
          <v-card class="stat-card">
            <v-card-text class="text-center pa-4">
              <v-icon
                :color="stat.color"
                size="40"
                class="mb-2"
              >
                {{ stat.icon }}
              </v-icon>
              <div class="text-h5 font-weight-bold">
                {{ stat.value }}
              </div>
              <div class="text-body-2 text-medium-emphasis">
                {{ stat.label }}
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Category Kills -->
      <v-card class="mt-4">
        <v-card-title>
          <v-icon
            class="mr-2"
            color="purple"
          >
            mdi-target-account
          </v-icon>
          Zabójstwa wg Kategorii
        </v-card-title>
        <v-card-text>
          <v-row dense>
            <v-col
              v-for="cat in categoryKills"
              :key="cat.category"
              cols="6"
              md="4"
            >
              <div class="category-stat d-flex align-center pa-3 rounded">
                <v-icon
                  :color="cat.color"
                  class="mr-3"
                >
                  {{ cat.icon }}
                </v-icon>
                <div class="flex-grow-1">
                  <div class="text-body-2 text-capitalize">
                    {{ cat.category }}
                  </div>
                  <div class="text-h6 font-weight-bold">
                    {{ cat.kills }}
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </div>

    <!-- Merchant Tab -->
    <div v-if="activeTab === 'merchant'">
      <v-row>
        <v-col
          v-for="stat in merchantStats"
          :key="stat.label"
          cols="6"
          md="4"
        >
          <v-card class="stat-card">
            <v-card-text class="text-center pa-4">
              <v-icon
                :color="stat.color"
                size="40"
                class="mb-2"
              >
                {{ stat.icon }}
              </v-icon>
              <div class="text-h5 font-weight-bold">
                {{ stat.value }}
              </div>
              <div class="text-body-2 text-medium-emphasis">
                {{ stat.label }}
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Scientist Tab -->
    <div v-if="activeTab === 'scientist'">
      <v-row>
        <v-col
          v-for="stat in scientistStats"
          :key="stat.label"
          cols="6"
          md="4"
        >
          <v-card class="stat-card">
            <v-card-text class="text-center pa-4">
              <v-icon
                :color="stat.color"
                size="40"
                class="mb-2"
              >
                {{ stat.icon }}
              </v-icon>
              <div class="text-h5 font-weight-bold">
                {{ stat.value }}
              </div>
              <div class="text-body-2 text-medium-emphasis">
                {{ stat.label }}
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Records Tab -->
    <div v-if="activeTab === 'records'">
      <v-card>
        <v-card-title>
          <v-icon
            class="mr-2"
            color="amber"
          >
            mdi-trophy
          </v-icon>
          Rekordy i Osiągnięcia
        </v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item>
              <template #prepend>
                <v-icon color="purple">
                  mdi-star-circle
                </v-icon>
              </template>
              <v-list-item-title>Najwyższe LP z jednego prestiżu</v-list-item-title>
              <template #append>
                <span class="text-h6">{{ prestigeStore.prestigeStats.highestLPSinglePrestige }}</span>
              </template>
            </v-list-item>

            <v-list-item>
              <template #prepend>
                <v-icon color="amber">
                  mdi-gold
                </v-icon>
              </template>
              <v-list-item-title>Całkowite złoto zdobyte</v-list-item-title>
              <template #append>
                <span class="text-h6">{{ formatNumber(achievementsStore.stats.goldEarned) }}</span>
              </template>
            </v-list-item>

            <v-list-item>
              <template #prepend>
                <v-icon color="red">
                  mdi-sword-cross
                </v-icon>
              </template>
              <v-list-item-title>Całkowite zabójstwa</v-list-item-title>
              <template #append>
                <span class="text-h6">{{ achievementsStore.stats.totalKills }}</span>
              </template>
            </v-list-item>

            <v-list-item>
              <template #prepend>
                <v-icon color="blue">
                  mdi-castle
                </v-icon>
              </template>
              <v-list-item-title>Lochy ukończone</v-list-item-title>
              <template #append>
                <span class="text-h6">{{ achievementsStore.stats.dungeonsCompleted }}</span>
              </template>
            </v-list-item>

            <v-list-item>
              <template #prepend>
                <v-icon color="green">
                  mdi-flask-round-bottom</v-icon>
              </template>
              <v-list-item-title>Mikstury stworzone</v-list-item-title>
              <template #append>
                <span class="text-h6">{{ achievementsStore.stats.potionsCrafted }}</span>
              </template>
            </v-list-item>

            <v-list-item>
              <template #prepend>
                <v-icon color="orange">
                  mdi-flag-checkered
                </v-icon>
              </template>
              <v-list-item-title>Wyzwania dzienne ukończone</v-list-item-title>
              <template #append>
                <span class="text-h6">{{ eventsStore.totalChallengesCompleted }}</span>
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<style scoped>
.stat-card {
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.category-stat {
  background: rgba(255, 255, 255, 0.03);
}
</style>
