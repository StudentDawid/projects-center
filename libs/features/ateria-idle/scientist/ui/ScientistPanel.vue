<script setup lang="ts">
/**
 * Scientist Panel - main UI for the Scientist path
 */

import { computed, ref } from 'vue';
import { useAteriaScientistStore } from '../model/scientist.store';
import { formatNumber } from '@libs/shared/lib/big-number';
import {
  RESEARCH,
  POTIONS,
  GOLEM_BLUEPRINTS,
  FLASK_COLORS,
  FLASK_ICONS,
  RESEARCH_CATEGORY_COLORS,
  RESEARCH_CATEGORY_ICONS,
  RESEARCH_CATEGORY_NAMES,
  getIngredient,
} from '../../data/scientist.data';

const scientistStore = useAteriaScientistStore();

// UI State
const activeTab = ref<'research' | 'alchemy' | 'golems'>('research');
const selectedResearchCategory = ref<string | null>(null);

// Computed
const stats = computed(() => scientistStore.stats);

const researchCategories = computed(() => {
  return ['combat', 'efficiency', 'alchemy', 'automation', 'trading'];
});

const filteredResearch = computed(() => {
  if (!selectedResearchCategory.value) {
    return scientistStore.availableResearchList;
  }
  return scientistStore.availableResearchList.filter(
    r => r.category === selectedResearchCategory.value
  );
});

const activeResearch = computed(() => {
  if (!scientistStore.activeResearchId) return null;
  return RESEARCH[scientistStore.activeResearchId];
});

const activeResearchProgress = computed(() => {
  if (!scientistStore.activeResearchId) return null;
  return scientistStore.researchProgress.get(scientistStore.activeResearchId);
});

// Functions
function getResearchProgress(researchId: string) {
  return scientistStore.researchProgress.get(researchId);
}

function formatFlaskCost(flasks: { red?: number; green?: number; blue?: number }) {
  const parts = [];
  if (flasks.red) parts.push(`${flasks.red} czerwonych`);
  if (flasks.green) parts.push(`${flasks.green} zielonych`);
  if (flasks.blue) parts.push(`${flasks.blue} niebieskich`);
  return parts.join(', ');
}

function getIngredientName(id: string): string {
  return getIngredient(id)?.name || id;
}

function getPotionAmount(potionId: string): number {
  return scientistStore.potionInventory.get(potionId) || 0;
}

function canStartProduction(recipe: typeof POTIONS[string]): boolean {
  for (const ing of recipe.ingredients) {
    const stored = scientistStore.alchemyLab.ingredientStorage[ing.ingredientId] || 0;
    if (stored < ing.amount) return false;
  }
  return true;
}
</script>

<template>
  <div class="scientist-panel">
    <v-row>
      <!-- Left Column: Stats & Flasks -->
      <v-col
        cols="12"
        md="4"
      >
        <v-card class="stats-card mb-4">
          <v-card-title class="d-flex align-center py-3">
            <v-icon
              class="mr-2"
              color="purple"
            >
              mdi-flask
            </v-icon>
            <span>Naukowiec</span>
            <v-chip
              class="ml-2"
              size="small"
              color="purple"
            >
              Lvl {{ stats.level }}
            </v-chip>
          </v-card-title>

          <v-card-text>
            <!-- XP Progress -->
            <div class="mb-4">
              <div class="d-flex justify-space-between text-caption mb-1">
                <span>Doświadczenie</span>
                <span>{{ formatNumber(stats.xp) }} / {{ formatNumber(stats.xpToNextLevel) }}</span>
              </div>
              <v-progress-linear
                :model-value="scientistStore.xpProgress * 100"
                color="purple"
                height="8"
                rounded
              />
            </div>

            <!-- Flask Display -->
            <v-divider class="mb-3" />
            <div class="text-subtitle-2 mb-2">
              Kolby
            </div>

            <div class="flask-display mb-2">
              <div class="flask-item">
                <v-icon
                  :color="FLASK_COLORS.red"
                  size="24"
                >
                  {{ FLASK_ICONS.red }}
                </v-icon>
                <div class="flask-info">
                  <div class="text-body-2 font-weight-medium">
                    {{ Math.floor(scientistStore.flasks.red) }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    +{{ scientistStore.flasks.redPerSecond.toFixed(2) }}/s
                  </div>
                </div>
              </div>

              <div
                v-if="scientistStore.greenFlasksUnlocked"
                class="flask-item"
              >
                <v-icon
                  :color="FLASK_COLORS.green"
                  size="24"
                >
                  {{ FLASK_ICONS.green }}
                </v-icon>
                <div class="flask-info">
                  <div class="text-body-2 font-weight-medium">
                    {{ Math.floor(scientistStore.flasks.green) }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    +{{ scientistStore.flasks.greenPerSecond.toFixed(2) }}/s
                  </div>
                </div>
              </div>

              <div
                v-if="scientistStore.blueFlasksUnlocked"
                class="flask-item"
              >
                <v-icon
                  :color="FLASK_COLORS.blue"
                  size="24"
                >
                  {{ FLASK_ICONS.blue }}
                </v-icon>
                <div class="flask-info">
                  <div class="text-body-2 font-weight-medium">
                    {{ Math.floor(scientistStore.flasks.blue) }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    +{{ scientistStore.flasks.bluePerSecond.toFixed(2) }}/s
                  </div>
                </div>
              </div>
            </div>

            <!-- Stats Grid -->
            <v-divider class="my-3" />
            <div class="text-subtitle-2 mb-2">
              Umiejętności
            </div>

            <v-row
              dense
              class="text-body-2"
            >
              <v-col cols="6">
                <div class="d-flex justify-space-between">
                  <span class="text-medium-emphasis">
                    <v-icon
                      size="14"
                      class="mr-1"
                    >
                      mdi-brain
                    </v-icon>
                    Intelekt
                  </span>
                  <span class="font-weight-medium">{{ stats.intellect }}</span>
                </div>
              </v-col>
              <v-col cols="6">
                <div class="d-flex justify-space-between">
                  <span class="text-medium-emphasis">
                    <v-icon
                      size="14"
                      class="mr-1"
                    >
                      mdi-cog
                    </v-icon>
                    Wydajność
                  </span>
                  <span class="font-weight-medium">{{ stats.efficiency }}</span>
                </div>
              </v-col>
              <v-col cols="6">
                <div class="d-flex justify-space-between">
                  <span class="text-medium-emphasis">
                    <v-icon
                      size="14"
                      class="mr-1"
                    >
                      mdi-lightbulb
                    </v-icon>
                    Kreatywność
                  </span>
                  <span class="font-weight-medium">{{ stats.creativity }}</span>
                </div>
              </v-col>
              <v-col cols="6">
                <div class="d-flex justify-space-between">
                  <span class="text-medium-emphasis">
                    <v-icon
                      size="14"
                      class="mr-1"
                    >
                      mdi-speedometer
                    </v-icon>
                    Prędkość
                  </span>
                  <span class="font-weight-medium text-purple">
                    x{{ scientistStore.effectiveResearchSpeed.toFixed(2) }}
                  </span>
                </div>
              </v-col>
            </v-row>

            <!-- Active Research Quick View -->
            <v-divider class="my-3" />
            <div class="text-subtitle-2 mb-2">
              Aktywne Badanie
            </div>

            <div
              v-if="activeResearch && activeResearchProgress"
              class="active-research pa-3 rounded"
            >
              <div class="d-flex align-center mb-2">
                <v-icon
                  size="20"
                  :color="RESEARCH_CATEGORY_COLORS[activeResearch.category]"
                  class="mr-2"
                >
                  {{ activeResearch.icon }}
                </v-icon>
                <span class="text-body-2 font-weight-medium">{{ activeResearch.name }}</span>
                <v-chip
                  size="x-small"
                  class="ml-auto"
                >
                  Lvl {{ activeResearchProgress.currentLevel + 1 }}
                </v-chip>
              </div>
              <v-progress-linear
                :model-value="activeResearchProgress.currentProgress * 100"
                :color="RESEARCH_CATEGORY_COLORS[activeResearch.category]"
                height="6"
                rounded
              />
            </div>

            <div
              v-else
              class="text-center py-4 text-medium-emphasis"
            >
              <v-icon
                size="32"
                class="mb-2 opacity-50"
              >
                mdi-flask-empty-outline
              </v-icon>
              <div class="text-body-2">
                Brak aktywnego badania
              </div>
            </div>

            <!-- Session Stats -->
            <v-divider class="my-3" />
            <div class="text-subtitle-2 mb-2">
              Sesja
            </div>
            <div class="d-flex justify-space-between text-body-2">
              <span class="text-medium-emphasis">Kolby wyprodukowane</span>
              <span class="font-weight-medium">
                {{ Math.floor(scientistStore.sessionFlasksProduced.red) }}
              </span>
            </div>
            <div class="d-flex justify-space-between text-body-2">
              <span class="text-medium-emphasis">Mikstury stworzone</span>
              <span class="font-weight-medium">{{ scientistStore.sessionPotionsCrafted }}</span>
            </div>
            <div class="d-flex justify-space-between text-body-2">
              <span class="text-medium-emphasis">Badania ukończone</span>
              <span class="font-weight-medium">{{ scientistStore.sessionResearchCompleted }}</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Middle & Right: Main Content Area -->
      <v-col
        cols="12"
        md="8"
      >
        <!-- Tabs -->
        <v-tabs
          v-model="activeTab"
          color="purple"
          density="compact"
          class="mb-4"
        >
          <v-tab value="research">
            <v-icon start>
              mdi-book-open-page-variant
            </v-icon>
            Badania
          </v-tab>
          <v-tab
            value="alchemy"
            :disabled="!scientistStore.alchemyUnlocked"
          >
            <v-icon start>
              mdi-flask-round-bottom
            </v-icon>
            Alchemia
            <v-icon
              v-if="!scientistStore.alchemyUnlocked"
              end
              size="14"
            >
              mdi-lock
            </v-icon>
          </v-tab>
          <v-tab
            value="golems"
            :disabled="!scientistStore.golemsUnlocked"
          >
            <v-icon start>
              mdi-robot
            </v-icon>
            Golemy
            <v-icon
              v-if="!scientistStore.golemsUnlocked"
              end
              size="14"
            >
              mdi-lock
            </v-icon>
          </v-tab>
        </v-tabs>

        <!-- Research Tab -->
        <div v-if="activeTab === 'research'">
          <!-- Category Filter -->
          <div class="d-flex flex-wrap ga-2 mb-4">
            <v-chip
              :color="selectedResearchCategory === null ? 'purple' : undefined"
              variant="tonal"
              @click="selectedResearchCategory = null"
            >
              Wszystkie
            </v-chip>
            <v-chip
              v-for="cat in researchCategories"
              :key="cat"
              :color="selectedResearchCategory === cat ? RESEARCH_CATEGORY_COLORS[cat] : undefined"
              variant="tonal"
              @click="selectedResearchCategory = selectedResearchCategory === cat ? null : cat"
            >
              <v-icon
                start
                size="14"
              >
                {{ RESEARCH_CATEGORY_ICONS[cat] }}
              </v-icon>
              {{ RESEARCH_CATEGORY_NAMES[cat] }}
            </v-chip>
          </div>

          <!-- Research List -->
          <v-card>
            <v-card-text>
              <div
                v-if="filteredResearch.length === 0"
                class="text-center py-6 text-medium-emphasis"
              >
                <v-icon
                  size="48"
                  class="mb-2 opacity-50"
                >
                  mdi-book-off
                </v-icon>
                <div class="text-body-2">
                  Brak dostępnych badań
                </div>
                <div class="text-caption">
                  Awansuj, aby odblokować nowe badania
                </div>
              </div>

              <div class="research-grid">
                <div
                  v-for="research in filteredResearch"
                  :key="research.id"
                  class="research-card pa-3 rounded"
                  :class="{
                    'research-active': scientistStore.activeResearchId === research.id,
                    'research-completed': scientistStore.completedResearch.includes(research.id)
                  }"
                  @click="scientistStore.startResearch(research.id)"
                >
                  <div class="d-flex align-center mb-2">
                    <v-avatar
                      size="32"
                      :color="RESEARCH_CATEGORY_COLORS[research.category]"
                      class="mr-2"
                    >
                      <v-icon
                        size="18"
                        color="white"
                      >
                        {{ research.icon }}
                      </v-icon>
                    </v-avatar>
                    <div class="flex-grow-1">
                      <div class="text-body-2 font-weight-medium">
                        {{ research.name }}
                      </div>
                      <div class="text-caption text-medium-emphasis">
                        {{ RESEARCH_CATEGORY_NAMES[research.category] }}
                      </div>
                    </div>
                    <v-chip
                      v-if="getResearchProgress(research.id)"
                      size="x-small"
                      :color="RESEARCH_CATEGORY_COLORS[research.category]"
                    >
                      {{ getResearchProgress(research.id)?.currentLevel }} / {{ research.maxLevel }}
                    </v-chip>
                    <v-chip
                      v-else
                      size="x-small"
                    >
                      0 / {{ research.maxLevel }}
                    </v-chip>
                  </div>

                  <div class="text-caption text-medium-emphasis mb-2">
                    {{ research.description }}
                  </div>

                  <div class="d-flex align-center text-caption">
                    <span class="text-medium-emphasis mr-2">Koszt:</span>
                    <span
                      v-if="research.requiredFlasks.red"
                      class="mr-2"
                    >
                      <v-icon
                        size="12"
                        :color="FLASK_COLORS.red"
                      >
                        {{ FLASK_ICONS.red }}
                      </v-icon>
                      {{ research.requiredFlasks.red }}
                    </span>
                    <span
                      v-if="research.requiredFlasks.green"
                      class="mr-2"
                    >
                      <v-icon
                        size="12"
                        :color="FLASK_COLORS.green"
                      >
                        {{ FLASK_ICONS.green }}
                      </v-icon>
                      {{ research.requiredFlasks.green }}
                    </span>
                    <span v-if="research.requiredFlasks.blue">
                      <v-icon
                        size="12"
                        :color="FLASK_COLORS.blue"
                      >
                        {{ FLASK_ICONS.blue }}
                      </v-icon>
                      {{ research.requiredFlasks.blue }}
                    </span>
                  </div>

                  <!-- Progress bar if active -->
                  <v-progress-linear
                    v-if="scientistStore.activeResearchId === research.id && getResearchProgress(research.id)"
                    :model-value="(getResearchProgress(research.id)?.currentProgress || 0) * 100"
                    :color="RESEARCH_CATEGORY_COLORS[research.category]"
                    height="4"
                    rounded
                    class="mt-2"
                  />
                </div>
              </div>
            </v-card-text>
          </v-card>
        </div>

        <!-- Alchemy Tab -->
        <div v-if="activeTab === 'alchemy'">
          <v-row>
            <!-- Production Slots -->
            <v-col cols="12">
              <v-card>
                <v-card-title class="d-flex align-center py-3">
                  <v-icon
                    class="mr-2"
                    color="purple"
                  >
                    mdi-beaker
                  </v-icon>
                  <span class="text-subtitle-1">Produkcja</span>
                  <v-chip
                    class="ml-2"
                    size="x-small"
                    color="purple"
                  >
                    {{ scientistStore.alchemyLab.productionSlots.filter(s => s.isActive).length }} /
                    {{ scientistStore.alchemyLab.maxProductionSlots }}
                  </v-chip>
                </v-card-title>

                <v-card-text>
                  <div class="production-slots">
                    <div
                      v-for="slot in scientistStore.alchemyLab.productionSlots"
                      :key="slot.slotId"
                      class="production-slot pa-3 rounded"
                      :class="{ 'slot-active': slot.isActive }"
                    >
                      <div
                        v-if="slot.isActive && slot.recipeId"
                        class="slot-content"
                      >
                        <div class="d-flex align-center mb-2">
                          <v-icon
                            size="20"
                            color="purple"
                            class="mr-2"
                          >
                            {{ POTIONS[slot.recipeId]?.icon }}
                          </v-icon>
                          <span class="text-body-2 font-weight-medium">
                            {{ POTIONS[slot.recipeId]?.name }}
                          </span>
                        </div>
                        <v-progress-linear
                          :model-value="slot.progress * 100"
                          color="purple"
                          height="6"
                          rounded
                        />
                        <div class="text-caption text-medium-emphasis text-right mt-1">
                          {{ Math.floor(slot.progress * 100) }}%
                        </div>
                      </div>

                      <div
                        v-else
                        class="text-center py-4 text-medium-emphasis"
                      >
                        <v-icon
                          size="32"
                          class="mb-2 opacity-50"
                        >
                          mdi-flask-empty
                        </v-icon>
                        <div class="text-caption">
                          Slot wolny
                        </div>
                      </div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Discovered Recipes -->
            <v-col cols="12">
              <v-card>
                <v-card-title class="d-flex align-center py-3">
                  <v-icon
                    class="mr-2"
                    color="amber"
                  >
                    mdi-book-open-variant
                  </v-icon>
                  <span class="text-subtitle-1">Receptury</span>
                  <v-chip
                    class="ml-2"
                    size="x-small"
                    color="amber"
                  >
                    {{ scientistStore.discoveredPotions.length }}
                  </v-chip>
                </v-card-title>

                <v-card-text>
                  <div class="recipes-grid">
                    <div
                      v-for="potion in scientistStore.discoveredPotions"
                      :key="potion.id"
                      class="recipe-card pa-3 rounded"
                    >
                      <div class="d-flex align-center mb-2">
                        <v-icon
                          size="24"
                          color="purple"
                          class="mr-2"
                        >
                          {{ potion.icon }}
                        </v-icon>
                        <div class="flex-grow-1">
                          <div class="text-body-2 font-weight-medium">
                            {{ potion.name }}
                          </div>
                          <div class="text-caption text-medium-emphasis">
                            Tier {{ potion.tier }}
                          </div>
                        </div>
                        <v-chip
                          size="x-small"
                          color="success"
                        >
                          x{{ getPotionAmount(potion.id) }}
                        </v-chip>
                      </div>

                      <div class="text-caption text-medium-emphasis mb-2">
                        {{ potion.description }}
                      </div>

                      <div class="text-caption mb-2">
                        <span class="text-medium-emphasis">Składniki: </span>
                        <span
                          v-for="(ing, idx) in potion.ingredients"
                          :key="ing.ingredientId"
                        >
                          {{ getIngredientName(ing.ingredientId) }} x{{ ing.amount }}{{ idx < potion.ingredients.length - 1 ? ', ' : '' }}
                        </span>
                      </div>

                      <v-btn
                        size="small"
                        variant="tonal"
                        color="purple"
                        block
                        :disabled="!canStartProduction(potion)"
                        @click="scientistStore.startProduction(0, potion.id)"
                      >
                        <v-icon
                          start
                          size="14"
                        >
                          mdi-flask
                        </v-icon>
                        Produkuj
                      </v-btn>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Ingredients Storage -->
            <v-col cols="12">
              <v-card>
                <v-card-title class="d-flex align-center py-3">
                  <v-icon
                    class="mr-2"
                    color="green"
                  >
                    mdi-leaf
                  </v-icon>
                  <span class="text-subtitle-1">Składniki</span>
                </v-card-title>

                <v-card-text>
                  <div
                    v-if="Object.keys(scientistStore.alchemyLab.ingredientStorage).length === 0"
                    class="text-center py-4 text-medium-emphasis"
                  >
                    <v-icon
                      size="32"
                      class="mb-2 opacity-50"
                    >
                      mdi-package-variant
                    </v-icon>
                    <div class="text-body-2">
                      Brak składników
                    </div>
                    <div class="text-caption">
                      Zdobywaj składniki z walki lub handlu
                    </div>
                  </div>

                  <div
                    v-else
                    class="ingredients-grid"
                  >
                    <div
                      v-for="(amount, ingId) in scientistStore.alchemyLab.ingredientStorage"
                      :key="ingId"
                      class="ingredient-item pa-2 rounded"
                    >
                      <v-icon
                        size="18"
                        class="mr-2"
                      >
                        {{ getIngredient(ingId as string)?.icon || 'mdi-help' }}
                      </v-icon>
                      <span class="text-body-2">{{ getIngredientName(ingId as string) }}</span>
                      <v-chip
                        size="x-small"
                        class="ml-auto"
                      >
                        x{{ amount }}
                      </v-chip>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- Golems Tab -->
        <div v-if="activeTab === 'golems'">
          <v-row>
            <!-- Workshop -->
            <v-col cols="12">
              <v-card>
                <v-card-title class="d-flex align-center py-3">
                  <v-icon
                    class="mr-2"
                    color="blue"
                  >
                    mdi-robot
                  </v-icon>
                  <span class="text-subtitle-1">Warsztat</span>
                  <v-chip
                    class="ml-2"
                    size="x-small"
                    :color="scientistStore.activeGolems.length > 0 ? 'success' : 'grey'"
                  >
                    {{ scientistStore.workshop.golems.length }} / {{ scientistStore.workshop.maxGolemSlots }}
                  </v-chip>
                </v-card-title>

                <v-card-text>
                  <div
                    v-if="scientistStore.workshop.maxGolemSlots === 0"
                    class="text-center py-6 text-medium-emphasis"
                  >
                    <v-icon
                      size="48"
                      class="mb-2 opacity-50"
                    >
                      mdi-robot-off
                    </v-icon>
                    <div class="text-body-2">
                      Warsztat zamknięty
                    </div>
                    <div class="text-caption">
                      Zbadaj "Podstawy Golemancji" aby odblokować
                    </div>
                  </div>

                  <div
                    v-else-if="scientistStore.workshop.golems.length === 0"
                    class="text-center py-6 text-medium-emphasis"
                  >
                    <v-icon
                      size="48"
                      class="mb-2 opacity-50"
                    >
                      mdi-robot-outline
                    </v-icon>
                    <div class="text-body-2">
                      Brak golemów
                    </div>
                    <div class="text-caption">
                      Stwórz swojego pierwszego golema
                    </div>
                  </div>

                  <div
                    v-else
                    class="golems-grid"
                  >
                    <div
                      v-for="golem in scientistStore.workshop.golems"
                      :key="golem.id"
                      class="golem-card pa-3 rounded"
                      :class="{ 'golem-working': golem.state === 'working' }"
                    >
                      <div class="d-flex align-center mb-2">
                        <v-avatar
                          size="36"
                          :color="golem.state === 'working' ? 'success' : golem.state === 'disabled' ? 'error' : 'grey'"
                        >
                          <v-icon
                            size="20"
                            color="white"
                          >
                            {{ GOLEM_BLUEPRINTS[golem.type + '_golem']?.icon || 'mdi-robot' }}
                          </v-icon>
                        </v-avatar>
                        <div class="ml-2 flex-grow-1">
                          <div class="text-body-2 font-weight-medium">
                            {{ golem.name }}
                          </div>
                          <div class="text-caption text-medium-emphasis">
                            {{ golem.state === 'working' ? 'Pracuje' : golem.state === 'disabled' ? 'Wyłączony' : 'Gotowy' }}
                          </div>
                        </div>
                      </div>

                      <div class="mb-2">
                        <div class="d-flex justify-space-between text-caption mb-1">
                          <span>Integralność</span>
                          <span>{{ Math.floor(golem.integrity) }}%</span>
                        </div>
                        <v-progress-linear
                          :model-value="golem.integrity"
                          :color="golem.integrity > 50 ? 'success' : golem.integrity > 25 ? 'warning' : 'error'"
                          height="6"
                          rounded
                        />
                      </div>

                      <div class="d-flex ga-2">
                        <v-btn
                          v-if="golem.state !== 'working'"
                          size="x-small"
                          variant="tonal"
                          color="success"
                          :disabled="golem.state === 'disabled'"
                          @click="scientistStore.activateGolem(golem.id)"
                        >
                          Aktywuj
                        </v-btn>
                        <v-btn
                          v-else
                          size="x-small"
                          variant="tonal"
                          color="warning"
                          @click="scientistStore.deactivateGolem(golem.id)"
                        >
                          Stop
                        </v-btn>
                        <v-btn
                          size="x-small"
                          variant="tonal"
                          :disabled="golem.integrity >= golem.maxIntegrity"
                          @click="scientistStore.repairGolem(golem.id)"
                        >
                          Napraw
                        </v-btn>
                      </div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Available Blueprints -->
            <v-col cols="12">
              <v-card>
                <v-card-title class="d-flex align-center py-3">
                  <v-icon
                    class="mr-2"
                    color="cyan"
                  >
                    mdi-clipboard-text
                  </v-icon>
                  <span class="text-subtitle-1">Schematy</span>
                </v-card-title>

                <v-card-text>
                  <div class="blueprints-grid">
                    <div
                      v-for="blueprint in scientistStore.availableGolems"
                      :key="blueprint.id"
                      class="blueprint-card pa-3 rounded"
                    >
                      <div class="d-flex align-center mb-2">
                        <v-icon
                          size="24"
                          color="cyan"
                          class="mr-2"
                        >
                          {{ blueprint.icon }}
                        </v-icon>
                        <div class="flex-grow-1">
                          <div class="text-body-2 font-weight-medium">
                            {{ blueprint.name }}
                          </div>
                          <div class="text-caption text-medium-emphasis">
                            {{ blueprint.description }}
                          </div>
                        </div>
                      </div>

                      <div class="text-caption mb-2">
                        <div class="d-flex justify-space-between">
                          <span class="text-medium-emphasis">Koszt:</span>
                          <span>{{ blueprint.craftCost.gold }} złota</span>
                        </div>
                        <div
                          v-if="blueprint.craftCost.flasks"
                          class="d-flex justify-space-between"
                        >
                          <span class="text-medium-emphasis">Kolby:</span>
                          <span>{{ formatFlaskCost(blueprint.craftCost.flasks) }}</span>
                        </div>
                      </div>

                      <v-btn
                        size="small"
                        variant="tonal"
                        color="cyan"
                        block
                        :disabled="scientistStore.workshop.golems.length >= scientistStore.workshop.maxGolemSlots"
                        @click="scientistStore.createGolem(blueprint.id)"
                      >
                        <v-icon
                          start
                          size="14"
                        >
                          mdi-hammer
                        </v-icon>
                        Stwórz
                      </v-btn>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.stats-card {
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.flask-display {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.flask-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.active-research {
  background: rgba(156, 39, 176, 0.1);
  border: 1px solid rgba(156, 39, 176, 0.3);
}

.research-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.research-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all 0.2s ease;
}

.research-card:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.research-card.research-active {
  border-color: rgba(156, 39, 176, 0.5);
  background: rgba(156, 39, 176, 0.1);
}

.research-card.research-completed {
  opacity: 0.6;
  cursor: default;
}

.production-slots {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.production-slot {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  min-height: 100px;
}

.production-slot.slot-active {
  border-color: rgba(156, 39, 176, 0.3);
  background: rgba(156, 39, 176, 0.05);
}

.recipes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}

.recipe-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.ingredients-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 8px;
}

.ingredient-item {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.golems-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.golem-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.golem-card.golem-working {
  border-color: rgba(76, 175, 80, 0.3);
  background: rgba(76, 175, 80, 0.05);
}

.blueprints-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}

.blueprint-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
}
</style>
