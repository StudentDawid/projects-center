<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAteriaReputationStore } from '../model/reputation.store';
import {
  ALIGNMENTS, FAME_MILESTONES, REPUTATION_TITLES, TITLE_CATEGORIES,
  getTitle, getTitlesByCategory, type TitleCategory
} from '../data/reputation.data';

const reputationStore = useAteriaReputationStore();

const activeTab = ref<'overview' | 'titles' | 'karma' | 'bonuses'>('overview');
const selectedCategory = ref<TitleCategory | 'all'>('all');

const filteredTitles = computed(() => {
  if (selectedCategory.value === 'all') {
    return REPUTATION_TITLES;
  }
  return getTitlesByCategory(selectedCategory.value);
});

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}
</script>

<template>
  <div class="reputation-panel">
    <!-- Header -->
    <v-card class="mb-4">
      <v-card-text>
        <div class="d-flex align-center">
          <v-avatar :color="reputationStore.alignmentData.color" size="64" class="mr-4">
            <v-icon size="36" color="white">{{ reputationStore.alignmentData.icon }}</v-icon>
          </v-avatar>
          <div class="flex-grow-1">
            <div class="d-flex align-center mb-1">
              <span class="text-h5 mr-2">{{ reputationStore.alignmentData.name }}</span>
              <v-chip v-if="reputationStore.activeTitleData" :color="reputationStore.activeTitleData.color" size="small">
                {{ reputationStore.activeTitleData.name }}
              </v-chip>
            </div>
            <div class="text-body-2 text-medium-emphasis">
              {{ reputationStore.alignmentData.description }}
            </div>
          </div>
        </div>

        <v-row class="mt-4">
          <v-col cols="3" class="text-center">
            <div class="text-h5" :class="reputationStore.karma >= 0 ? 'text-success' : 'text-error'">
              {{ reputationStore.karma }}
            </div>
            <div class="text-caption">Karma ({{ reputationStore.karmaDescription }})</div>
          </v-col>
          <v-col cols="3" class="text-center">
            <div class="text-h5 text-amber">{{ reputationStore.fame.toLocaleString() }}</div>
            <div class="text-caption">Sława ({{ reputationStore.fameTier.name }})</div>
          </v-col>
          <v-col cols="3" class="text-center">
            <div class="text-h5 text-info">{{ reputationStore.unlockedTitles.size }}</div>
            <div class="text-caption">Tytuły</div>
          </v-col>
          <v-col cols="3" class="text-center">
            <div class="text-h5 text-purple">{{ Object.keys(reputationStore.totalBonuses).length }}</div>
            <div class="text-caption">Aktywne bonusy</div>
          </v-col>
        </v-row>

        <!-- Fame Progress -->
        <div class="mt-3">
          <div class="d-flex justify-space-between text-caption mb-1">
            <span>{{ reputationStore.fameTier.name }}</span>
            <span v-if="reputationStore.nextFameMilestone">
              Następny: {{ reputationStore.nextFameMilestone.name }} ({{ reputationStore.nextFameMilestone.fame.toLocaleString() }})
            </span>
            <span v-else>Maksymalny poziom!</span>
          </div>
          <v-progress-linear
            :model-value="reputationStore.fameProgress"
            color="amber"
            height="12"
            rounded
          />
        </div>
      </v-card-text>
    </v-card>

    <!-- Tabs -->
    <v-tabs v-model="activeTab" color="purple" class="mb-4">
      <v-tab value="overview">
        <v-icon start>mdi-account-star</v-icon>
        Przegląd
      </v-tab>
      <v-tab value="titles">
        <v-icon start>mdi-crown</v-icon>
        Tytuły ({{ reputationStore.unlockedTitles.size }}/{{ REPUTATION_TITLES.length }})
      </v-tab>
      <v-tab value="karma">
        <v-icon start>mdi-yin-yang</v-icon>
        Historia Karmy
      </v-tab>
      <v-tab value="bonuses">
        <v-icon start>mdi-chart-line</v-icon>
        Bonusy
      </v-tab>
    </v-tabs>

    <!-- Overview Tab -->
    <div v-if="activeTab === 'overview'">
      <v-row>
        <!-- Alignment Grid -->
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>Kompas Moralny</v-card-title>
            <v-card-text>
              <div class="alignment-grid">
                <div
                  v-for="(alignment, key) in ALIGNMENTS"
                  :key="key"
                  class="alignment-cell"
                  :class="{ 'alignment-active': reputationStore.currentAlignment === key }"
                  :style="{ borderColor: alignment.color }"
                >
                  <v-avatar :color="alignment.color" size="32">
                    <v-icon size="18" color="white">{{ alignment.icon }}</v-icon>
                  </v-avatar>
                  <div class="text-caption mt-1">{{ alignment.name.split(' ')[0] }}</div>
                </div>
              </div>

              <div class="mt-4">
                <div class="d-flex justify-space-between text-caption mb-1">
                  <span>Chaos</span>
                  <span>{{ reputationStore.lawChaos }}</span>
                  <span>Prawo</span>
                </div>
                <v-progress-linear
                  :model-value="(reputationStore.lawChaos + 100) / 2"
                  color="blue-grey"
                  height="8"
                  rounded
                />

                <div class="d-flex justify-space-between text-caption mb-1 mt-3">
                  <span>Zło</span>
                  <span>{{ reputationStore.goodEvil }}</span>
                  <span>Dobro</span>
                </div>
                <v-progress-linear
                  :model-value="(reputationStore.goodEvil + 100) / 2"
                  :color="reputationStore.goodEvil >= 0 ? 'green' : 'red'"
                  height="8"
                  rounded
                />
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Fame Milestones -->
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>Kamienie Milowe Sławy</v-card-title>
            <v-card-text>
              <v-timeline density="compact" side="end">
                <v-timeline-item
                  v-for="milestone in FAME_MILESTONES"
                  :key="milestone.fame"
                  :dot-color="reputationStore.fame >= milestone.fame ? 'amber' : 'grey'"
                  size="small"
                >
                  <div class="d-flex align-center">
                    <span :class="{ 'font-weight-bold': reputationStore.fame >= milestone.fame }">
                      {{ milestone.name }}
                    </span>
                    <v-chip size="x-small" class="ml-2">{{ milestone.fame.toLocaleString() }}</v-chip>
                  </div>
                  <div v-if="milestone.rewards.length > 0" class="text-caption text-medium-emphasis">
                    {{ milestone.rewards.map(r => `+${r.value}% ${r.type}`).join(', ') }}
                  </div>
                </v-timeline-item>
              </v-timeline>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Titles Tab -->
    <div v-if="activeTab === 'titles'">
      <v-card class="mb-4">
        <v-card-text>
          <v-chip-group v-model="selectedCategory" mandatory>
            <v-chip value="all" filter>Wszystkie</v-chip>
            <v-chip
              v-for="cat in TITLE_CATEGORIES"
              :key="cat.id"
              :value="cat.id"
              :color="cat.color"
              filter
            >
              <v-icon start size="small">{{ cat.icon }}</v-icon>
              {{ cat.name }}
            </v-chip>
          </v-chip-group>
        </v-card-text>
      </v-card>

      <v-row>
        <v-col v-for="title in filteredTitles" :key="title.id" cols="12" md="6" lg="4">
          <v-card
            :variant="reputationStore.unlockedTitles.has(title.id) ? 'elevated' : 'outlined'"
            :class="{ 'opacity-50': !reputationStore.unlockedTitles.has(title.id) }"
          >
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-avatar :color="title.color" size="40">
                  <v-icon color="white">{{ title.icon }}</v-icon>
                </v-avatar>
                <div class="ml-3 flex-grow-1">
                  <div class="text-subtitle-1">
                    {{ reputationStore.unlockedTitles.has(title.id) || !title.isHidden ? title.name : '???' }}
                  </div>
                  <v-chip size="x-small" :color="TITLE_CATEGORIES.find(c => c.id === title.category)?.color">
                    {{ TITLE_CATEGORIES.find(c => c.id === title.category)?.name }}
                  </v-chip>
                </div>
                <v-icon
                  v-if="reputationStore.activeTitle === title.id"
                  color="success"
                >
                  mdi-check-circle
                </v-icon>
              </div>

              <div class="text-body-2 mb-2">
                {{ reputationStore.unlockedTitles.has(title.id) || !title.isHidden ? title.description : 'Ukryty tytuł' }}
              </div>

              <div v-if="reputationStore.unlockedTitles.has(title.id)" class="d-flex flex-wrap gap-1 mb-2">
                <v-chip
                  v-for="bonus in title.bonuses"
                  :key="bonus.stat"
                  size="x-small"
                  color="success"
                  variant="outlined"
                >
                  {{ bonus.description }}
                </v-chip>
              </div>

              <v-btn
                v-if="reputationStore.unlockedTitles.has(title.id)"
                block
                size="small"
                :color="reputationStore.activeTitle === title.id ? 'success' : 'primary'"
                :variant="reputationStore.activeTitle === title.id ? 'tonal' : 'outlined'"
                @click="reputationStore.setActiveTitle(reputationStore.activeTitle === title.id ? null : title.id)"
              >
                {{ reputationStore.activeTitle === title.id ? 'Aktywny' : 'Wybierz' }}
              </v-btn>
              <v-chip v-else color="grey" size="small" class="w-100">
                <v-icon start size="small">mdi-lock</v-icon>
                Zablokowany
              </v-chip>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Karma History Tab -->
    <div v-if="activeTab === 'karma'">
      <v-card>
        <v-card-title>Historia Karmy</v-card-title>
        <v-card-text>
          <v-list v-if="reputationStore.karmaHistory.length > 0" density="compact">
            <v-list-item
              v-for="(entry, index) in reputationStore.karmaHistory.slice(0, 50)"
              :key="index"
            >
              <template #prepend>
                <v-avatar :color="entry.change >= 0 ? 'success' : 'error'" size="32">
                  <v-icon size="18">{{ entry.change >= 0 ? 'mdi-arrow-up' : 'mdi-arrow-down' }}</v-icon>
                </v-avatar>
              </template>
              <v-list-item-title>{{ entry.description }}</v-list-item-title>
              <v-list-item-subtitle>{{ formatDate(entry.timestamp) }}</v-list-item-subtitle>
              <template #append>
                <v-chip :color="entry.change >= 0 ? 'success' : 'error'" size="small">
                  {{ entry.change >= 0 ? '+' : '' }}{{ entry.change }}
                </v-chip>
              </template>
            </v-list-item>
          </v-list>
          <div v-else class="text-center py-8 text-medium-emphasis">
            <v-icon size="48" class="mb-2">mdi-history</v-icon>
            <div>Brak historii karmy</div>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Bonuses Tab -->
    <div v-if="activeTab === 'bonuses'">
      <v-row>
        <v-col cols="12" md="4">
          <v-card>
            <v-card-title>
              <v-icon :color="reputationStore.alignmentData.color" class="mr-2">{{ reputationStore.alignmentData.icon }}</v-icon>
              Bonusy Charakteru
            </v-card-title>
            <v-card-text>
              <v-list density="compact">
                <v-list-item v-for="bonus in reputationStore.alignmentData.bonuses" :key="bonus.stat">
                  <v-list-item-title>{{ bonus.stat }}</v-list-item-title>
                  <template #append>
                    <v-chip color="success" size="small">+{{ bonus.value }}%</v-chip>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card>
            <v-card-title>
              <v-icon color="amber" class="mr-2">mdi-star</v-icon>
              Bonusy Sławy
            </v-card-title>
            <v-card-text>
              <v-list density="compact">
                <v-list-item v-for="reward in reputationStore.fameTier.rewards" :key="reward.type">
                  <v-list-item-title>{{ reward.type }}</v-list-item-title>
                  <template #append>
                    <v-chip color="amber" size="small">+{{ reward.value }}%</v-chip>
                  </template>
                </v-list-item>
                <v-list-item v-if="reputationStore.fameTier.rewards.length === 0">
                  <v-list-item-title class="text-medium-emphasis">Brak bonusów</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card>
            <v-card-title>
              <v-icon color="purple" class="mr-2">mdi-crown</v-icon>
              Bonusy Tytułu
            </v-card-title>
            <v-card-text>
              <v-list v-if="reputationStore.activeTitleData" density="compact">
                <v-list-item v-for="bonus in reputationStore.activeTitleData.bonuses" :key="bonus.stat">
                  <v-list-item-title>{{ bonus.stat }}</v-list-item-title>
                  <template #append>
                    <v-chip color="purple" size="small">+{{ bonus.value }}%</v-chip>
                  </template>
                </v-list-item>
              </v-list>
              <div v-else class="text-center py-4 text-medium-emphasis">
                Wybierz tytuł, aby aktywować bonusy
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<style scoped>
.alignment-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.alignment-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border: 2px solid transparent;
  border-radius: 8px;
  transition: all 0.2s;
}

.alignment-active {
  background: rgba(var(--v-theme-primary), 0.1);
  border-width: 3px;
}

.opacity-50 {
  opacity: 0.5;
}
</style>
