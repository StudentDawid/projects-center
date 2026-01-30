<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAteriaCodexStore } from '../model/codex.store';
import {
  CODEX_ENTRIES, CODEX_CATEGORIES, RARITY_DATA,
  getCodexEntry, getEntriesByCategory, getCategoryInfo, getAllCategories,
  type CodexCategory, type CodexEntry
} from '../data/codex.data';

const codexStore = useAteriaCodexStore();

const activeCategory = ref<CodexCategory | 'all' | 'favorites' | 'recent'>('all');
const selectedEntry = ref<string | null>(null);
const searchQuery = ref('');
const showUndiscovered = ref(false);

const filteredEntries = computed(() => {
  let entries: (CodexEntry & { isDiscovered: boolean; isRead: boolean; isFavorite: boolean })[] = [];
  
  if (activeCategory.value === 'all') {
    entries = CODEX_ENTRIES.map(e => ({
      ...e,
      isDiscovered: codexStore.isDiscovered(e.id),
      isRead: codexStore.readEntries.has(e.id),
      isFavorite: codexStore.favoriteEntries.has(e.id),
    }));
  } else if (activeCategory.value === 'favorites') {
    entries = Array.from(codexStore.favoriteEntries).map(id => {
      const entry = getCodexEntry(id);
      return entry ? {
        ...entry,
        isDiscovered: true,
        isRead: codexStore.readEntries.has(id),
        isFavorite: true,
      } : null;
    }).filter((e): e is NonNullable<typeof e> => e !== null);
  } else if (activeCategory.value === 'recent') {
    entries = codexStore.recentlyDiscovered.map(id => {
      const entry = getCodexEntry(id);
      return entry ? {
        ...entry,
        isDiscovered: true,
        isRead: codexStore.readEntries.has(id),
        isFavorite: codexStore.favoriteEntries.has(id),
      } : null;
    }).filter((e): e is NonNullable<typeof e> => e !== null);
  } else {
    entries = getEntriesByCategory(activeCategory.value).map(e => ({
      ...e,
      isDiscovered: codexStore.isDiscovered(e.id),
      isRead: codexStore.readEntries.has(e.id),
      isFavorite: codexStore.favoriteEntries.has(e.id),
    }));
  }
  
  // Filter by search
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    entries = entries.filter(e => 
      e.isDiscovered && (
        e.name.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q)
      )
    );
  }
  
  // Filter undiscovered
  if (!showUndiscovered.value) {
    entries = entries.filter(e => e.isDiscovered);
  }
  
  return entries;
});

const selectedEntryData = computed(() => {
  if (!selectedEntry.value) return null;
  const entry = getCodexEntry(selectedEntry.value);
  if (!entry) return null;
  return {
    ...entry,
    isDiscovered: codexStore.isDiscovered(entry.id),
    isRead: codexStore.readEntries.has(entry.id),
    isFavorite: codexStore.favoriteEntries.has(entry.id),
  };
});

function selectEntry(entryId: string) {
  selectedEntry.value = selectedEntry.value === entryId ? null : entryId;
  if (selectedEntry.value && codexStore.isDiscovered(entryId)) {
    codexStore.markAsRead(entryId);
  }
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString();
}
</script>

<template>
  <div class="codex-panel">
    <!-- Header Stats -->
    <v-card class="mb-4">
      <v-card-text>
        <div class="d-flex align-center">
          <v-avatar color="purple-darken-2" size="56" class="mr-4">
            <v-icon size="32" color="white">mdi-book-open-page-variant</v-icon>
          </v-avatar>
          <div class="flex-grow-1">
            <div class="d-flex align-center">
              <span class="text-h5 mr-2">Kodeks Aterii</span>
              <v-chip v-if="codexStore.unreadCount > 0" size="small" color="error">
                {{ codexStore.unreadCount }} nieprzeczytanych
              </v-chip>
            </div>
            <div class="text-body-2 text-medium-emphasis">
              Encyklopedia świata Aterii
            </div>
          </div>
        </div>

        <!-- Completion Progress -->
        <div class="mt-3">
          <div class="d-flex justify-space-between text-caption mb-1">
            <span>Postęp odkrywania</span>
            <span>{{ codexStore.stats.totalDiscovered }} / {{ codexStore.totalEntries }} ({{ codexStore.completionPercent.toFixed(1) }}%)</span>
          </div>
          <v-progress-linear
            :model-value="codexStore.completionPercent"
            color="purple"
            height="12"
            rounded
          />
        </div>

        <!-- Category Stats -->
        <v-row class="mt-3">
          <v-col v-for="category in getAllCategories()" :key="category" cols="4" md="2" class="text-center">
            <v-avatar :color="getCategoryInfo(category).color" size="32" class="mb-1">
              <v-icon size="18" color="white">{{ getCategoryInfo(category).icon }}</v-icon>
            </v-avatar>
            <div class="text-caption">{{ codexStore.categoryCompletion[category].discovered }}/{{ codexStore.categoryCompletion[category].total }}</div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Search and Filters -->
    <v-card class="mb-4">
      <v-card-text class="pb-2">
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="searchQuery"
              prepend-inner-icon="mdi-magnify"
              label="Szukaj w kodeksie..."
              density="compact"
              variant="outlined"
              hide-details
              clearable
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-switch
              v-model="showUndiscovered"
              label="Pokaż nieodkryte (zaciemnione)"
              density="compact"
              hide-details
              color="purple"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-row>
      <!-- Categories Sidebar -->
      <v-col cols="12" md="3">
        <v-card>
          <v-list density="compact" nav>
            <v-list-item
              :active="activeCategory === 'all'"
              @click="activeCategory = 'all'"
            >
              <template #prepend>
                <v-icon>mdi-book-multiple</v-icon>
              </template>
              <v-list-item-title>Wszystkie</v-list-item-title>
              <template #append>
                <v-chip size="x-small">{{ codexStore.stats.totalDiscovered }}</v-chip>
              </template>
            </v-list-item>

            <v-list-item
              :active="activeCategory === 'favorites'"
              @click="activeCategory = 'favorites'"
            >
              <template #prepend>
                <v-icon color="amber">mdi-star</v-icon>
              </template>
              <v-list-item-title>Ulubione</v-list-item-title>
              <template #append>
                <v-chip size="x-small">{{ codexStore.stats.favoritesCount }}</v-chip>
              </template>
            </v-list-item>

            <v-list-item
              :active="activeCategory === 'recent'"
              @click="activeCategory = 'recent'"
            >
              <template #prepend>
                <v-icon color="info">mdi-history</v-icon>
              </template>
              <v-list-item-title>Ostatnio odkryte</v-list-item-title>
            </v-list-item>

            <v-divider class="my-2" />

            <v-list-item
              v-for="category in getAllCategories()"
              :key="category"
              :active="activeCategory === category"
              @click="activeCategory = category"
            >
              <template #prepend>
                <v-icon :color="getCategoryInfo(category).color">{{ getCategoryInfo(category).icon }}</v-icon>
              </template>
              <v-list-item-title>{{ getCategoryInfo(category).name }}</v-list-item-title>
              <template #append>
                <v-chip size="x-small">
                  {{ codexStore.categoryCompletion[category].discovered }}
                </v-chip>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Entries List -->
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title class="text-subtitle-1">
            {{ activeCategory === 'all' ? 'Wszystkie wpisy' : 
               activeCategory === 'favorites' ? 'Ulubione' :
               activeCategory === 'recent' ? 'Ostatnio odkryte' :
               getCategoryInfo(activeCategory).name }}
            ({{ filteredEntries.length }})
          </v-card-title>
          <v-card-text class="pa-0" style="max-height: 600px; overflow-y: auto;">
            <v-list v-if="filteredEntries.length > 0" density="compact">
              <v-list-item
                v-for="entry in filteredEntries"
                :key="entry.id"
                :active="selectedEntry === entry.id"
                :class="{ 'undiscovered-entry': !entry.isDiscovered }"
                @click="entry.isDiscovered && selectEntry(entry.id)"
              >
                <template #prepend>
                  <v-avatar :color="entry.isDiscovered ? RARITY_DATA[entry.rarity].color : 'grey'" size="32">
                    <v-icon v-if="entry.isDiscovered" size="18" color="white">{{ entry.icon }}</v-icon>
                    <v-icon v-else size="18" color="white">mdi-help</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title :class="{ 'text-medium-emphasis': !entry.isDiscovered }">
                  {{ entry.isDiscovered ? entry.name : '???' }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  <v-chip size="x-small" :color="RARITY_DATA[entry.rarity].color" variant="outlined">
                    {{ RARITY_DATA[entry.rarity].name }}
                  </v-chip>
                </v-list-item-subtitle>
                <template #append>
                  <div class="d-flex align-center gap-1">
                    <v-icon v-if="entry.isFavorite" color="amber" size="small">mdi-star</v-icon>
                    <v-icon v-if="!entry.isRead && entry.isDiscovered" color="info" size="small">mdi-circle</v-icon>
                  </div>
                </template>
              </v-list-item>
            </v-list>
            <div v-else class="text-center py-8 text-medium-emphasis">
              <v-icon size="48" class="mb-2">mdi-book-search</v-icon>
              <div>Brak wpisów do wyświetlenia</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Entry Details -->
      <v-col cols="12" md="5">
        <v-card v-if="selectedEntryData && selectedEntryData.isDiscovered">
          <v-card-title class="d-flex align-center">
            <v-avatar :color="RARITY_DATA[selectedEntryData.rarity].color" size="48" class="mr-3">
              <v-icon color="white">{{ selectedEntryData.icon }}</v-icon>
            </v-avatar>
            <div class="flex-grow-1">
              <div>{{ selectedEntryData.name }}</div>
              <v-chip size="x-small" :color="RARITY_DATA[selectedEntryData.rarity].color">
                {{ RARITY_DATA[selectedEntryData.rarity].name }}
              </v-chip>
              <v-chip size="x-small" :color="getCategoryInfo(selectedEntryData.category).color" class="ml-1">
                {{ getCategoryInfo(selectedEntryData.category).name }}
              </v-chip>
            </div>
            <v-btn
              icon
              variant="text"
              :color="selectedEntryData.isFavorite ? 'amber' : 'grey'"
              @click="codexStore.toggleFavorite(selectedEntryData.id)"
            >
              <v-icon>{{ selectedEntryData.isFavorite ? 'mdi-star' : 'mdi-star-outline' }}</v-icon>
            </v-btn>
          </v-card-title>

          <v-divider />

          <v-card-text>
            <div class="text-body-1 mb-4">{{ selectedEntryData.description }}</div>
            
            <v-card variant="outlined" class="mb-4 lore-card">
              <v-card-text>
                <v-icon color="purple" class="mr-2">mdi-book-open-variant</v-icon>
                <span class="font-italic">"{{ selectedEntryData.lore }}"</span>
              </v-card-text>
            </v-card>

            <!-- Stats if available -->
            <div v-if="selectedEntryData.stats && Object.keys(selectedEntryData.stats).length > 0" class="mb-4">
              <div class="text-subtitle-2 mb-2">Statystyki</div>
              <div class="d-flex flex-wrap gap-2">
                <v-chip
                  v-for="(value, stat) in selectedEntryData.stats"
                  :key="stat"
                  size="small"
                  color="primary"
                  variant="outlined"
                >
                  {{ stat }}: {{ value }}
                </v-chip>
              </div>
            </div>

            <!-- Related entries -->
            <div v-if="selectedEntryData.relatedEntries && selectedEntryData.relatedEntries.length > 0" class="mb-4">
              <div class="text-subtitle-2 mb-2">Powiązane wpisy</div>
              <div class="d-flex flex-wrap gap-2">
                <v-chip
                  v-for="relatedId in selectedEntryData.relatedEntries"
                  :key="relatedId"
                  size="small"
                  :color="codexStore.isDiscovered(relatedId) ? 'success' : 'grey'"
                  variant="outlined"
                  @click="codexStore.isDiscovered(relatedId) && selectEntry(relatedId)"
                >
                  <v-icon start size="small">
                    {{ codexStore.isDiscovered(relatedId) ? getCodexEntry(relatedId)?.icon : 'mdi-help' }}
                  </v-icon>
                  {{ codexStore.isDiscovered(relatedId) ? getCodexEntry(relatedId)?.name : '???' }}
                </v-chip>
              </div>
            </div>

            <!-- Discovery info -->
            <div class="text-caption text-medium-emphasis">
              <v-icon size="small">mdi-calendar</v-icon>
              Odkryto: {{ formatDate(codexStore.discoveredEntries.get(selectedEntryData.id)?.discoveredAt || 0) }}
            </div>
          </v-card-text>
        </v-card>

        <v-card v-else-if="selectedEntryData && !selectedEntryData.isDiscovered">
          <v-card-text class="text-center py-8">
            <v-avatar color="grey" size="64" class="mb-3">
              <v-icon size="36" color="white">mdi-help</v-icon>
            </v-avatar>
            <div class="text-h6 mb-2">Nieodkryty wpis</div>
            <div class="text-body-2 text-medium-emphasis mb-4">
              Ten wpis nie został jeszcze odkryty.
            </div>
            <div v-if="selectedEntryData.discoveryHint" class="text-caption">
              <v-icon size="small" color="info">mdi-lightbulb</v-icon>
              Wskazówka: {{ selectedEntryData.discoveryHint }}
            </div>
          </v-card-text>
        </v-card>

        <v-card v-else>
          <v-card-text class="text-center py-8 text-medium-emphasis">
            <v-icon size="48" class="mb-2">mdi-arrow-left</v-icon>
            <div>Wybierz wpis z listy, aby zobaczyć szczegóły</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.undiscovered-entry {
  opacity: 0.5;
  cursor: default !important;
}

.lore-card {
  background: linear-gradient(135deg, rgba(156, 39, 176, 0.05), transparent);
  border-color: rgba(156, 39, 176, 0.3);
}
</style>
