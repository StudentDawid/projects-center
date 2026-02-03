<script setup lang="ts">
/**
 * Crafting Panel - Smithing, Tailoring, Jewelcrafting, Woodworking
 */

import { computed, ref } from 'vue';
import { useAteriaCraftingStore } from '../model/crafting.store';
import { useAteriaGatheringStore } from '../../gathering/model/gathering.store';
import {
  CRAFTING_PROFESSIONS,
  ALL_RECIPES,
  PROCESSED_MATERIALS,
  getRecipe,
  getQualityLabel,
  type CraftingProfession,
  type CraftingRecipe,
} from '../data/crafting.data';

const craftingStore = useAteriaCraftingStore();
const gatheringStore = useAteriaGatheringStore();

// UI State
const activeProfession = ref<CraftingProfession>('smithing');
const activeCategory = ref<string>('all');
const selectedRecipe = ref<CraftingRecipe | null>(null);
const craftQuantity = ref(1);

// Computed
const currentProfession = computed(() => CRAFTING_PROFESSIONS[activeProfession.value]);
const currentProgress = computed(() => craftingStore.professions[activeProfession.value]);
const availableRecipes = computed(() => craftingStore.availableRecipesByProfession[activeProfession.value]);

const categories = computed(() => {
  const cats = new Set<string>();
  for (const recipe of availableRecipes.value) {
    cats.add(recipe.category);
  }
  return ['all', ...Array.from(cats)];
});

const filteredRecipes = computed(() => {
  if (activeCategory.value === 'all') return availableRecipes.value;
  return availableRecipes.value.filter(r => r.category === activeCategory.value);
});

const recentCraftsDisplay = computed(() => {
  return craftingStore.recentCrafts.slice(0, 10).map(craft => {
    const recipe = getRecipe(craft.recipeId);
    const quality = getQualityLabel(craft.quality);
    return {
      ...craft,
      recipe,
      qualityLabel: quality.label,
      qualityColor: quality.color,
    };
  });
});

// Actions
function selectProfession(profession: CraftingProfession) {
  activeProfession.value = profession;
  activeCategory.value = 'all';
  selectedRecipe.value = null;
}

function selectRecipe(recipe: CraftingRecipe) {
  selectedRecipe.value = recipe;
  craftQuantity.value = 1;
}

function startCraft() {
  if (!selectedRecipe.value) return;
  craftingStore.startCrafting(selectedRecipe.value.id, craftQuantity.value);
}

function stopCraft() {
  craftingStore.stopCrafting();
}

function getMaterialCount(itemId: string): number {
  // Check crafted materials
  const crafted = craftingStore.getCraftedMaterialCount(itemId);
  // Check gathered materials
  const gathered = gatheringStore.getResourceCount(itemId);
  return crafted + gathered;
}

function canCraftRecipe(recipe: CraftingRecipe): boolean {
  return craftingStore.canCraft(recipe.id).canCraft;
}

function getRarityColor(rarity: string): string {
  const colors: Record<string, string> = {
    common: 'grey',
    uncommon: 'green',
    rare: 'blue',
    epic: 'purple',
    legendary: 'orange',
    mythic: 'red',
  };
  return colors[rarity] || 'grey';
}

function getCategoryName(category: string): string {
  const names: Record<string, string> = {
    all: 'Wszystkie',
    smelting: 'Wytapianie',
    tools: 'Narzędzia',
    weapons: 'Broń',
    armor: 'Zbroja',
    processing: 'Obróbka',
    gemcutting: 'Szlifowanie',
    rings: 'Pierścienie',
    amulets: 'Amulety',
  };
  return names[category] || category;
}
</script>

<template>
  <div class="crafting-panel">
    <!-- Header -->
    <v-card class="mb-4">
      <v-card-text>
        <div class="d-flex align-center">
          <v-avatar
            :color="currentProfession.color"
            size="56"
            class="mr-4"
          >
            <v-icon
              size="32"
              color="white"
            >
              {{ currentProfession.icon }}
            </v-icon>
          </v-avatar>
          <div class="flex-grow-1">
            <div class="d-flex align-center">
              <span class="text-h5 mr-2">{{ currentProfession.name }}</span>
              <v-chip
                size="small"
                :color="currentProfession.color"
              >
                Poziom {{ currentProgress.level }}
              </v-chip>
            </div>
            <div class="text-body-2 text-medium-emphasis">
              {{ currentProfession.description }}
            </div>
            <v-progress-linear
              :model-value="craftingStore.getXpProgress(activeProfession)"
              :color="currentProfession.color"
              height="8"
              rounded
              class="mt-2"
            >
              <template #default>
                <span class="text-caption">
                  {{ currentProgress.xp }} / {{ currentProgress.xpToNextLevel }} XP
                </span>
              </template>
            </v-progress-linear>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Profession Tabs -->
    <v-tabs
      v-model="activeProfession"
      color="primary"
      class="mb-4"
    >
      <v-tab
        v-for="(prof, id) in CRAFTING_PROFESSIONS"
        :key="id"
        :value="id"
      >
        <v-icon
          start
          :color="prof.color"
        >
          {{ prof.icon }}
        </v-icon>
        {{ prof.name }}
        <v-chip
          size="x-small"
          class="ml-2"
        >
          {{ craftingStore.professions[id as CraftingProfession].level }}
        </v-chip>
      </v-tab>
    </v-tabs>

    <!-- Active Crafting -->
    <v-card
      v-if="craftingStore.isCrafting && craftingStore.currentRecipe"
      class="mb-4"
    >
      <v-card-text>
        <div class="d-flex align-center mb-2">
          <v-avatar
            :color="getRarityColor(craftingStore.currentRecipe.outputRarity)"
            size="48"
            class="mr-3"
          >
            <v-icon color="white">
              {{ craftingStore.currentRecipe.icon }}
            </v-icon>
          </v-avatar>
          <div class="flex-grow-1">
            <div class="text-h6">
              Wytwarzanie: {{ craftingStore.currentRecipe.name }}
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ craftingStore.activeCrafting?.currentQuantity }} / {{ craftingStore.activeCrafting?.quantity }}
            </div>
            <v-progress-linear
              :model-value="craftingStore.craftingProgress"
              color="success"
              height="20"
              rounded
            >
              <template #default>
                {{ Math.floor(craftingStore.craftingProgress) }}%
              </template>
            </v-progress-linear>
          </div>
          <v-btn
            color="error"
            variant="tonal"
            class="ml-3"
            @click="stopCraft"
          >
            Anuluj
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <v-row>
      <!-- Left: Recipe List -->
      <v-col
        cols="12"
        md="5"
      >
        <!-- Category Filter -->
        <v-chip-group
          v-model="activeCategory"
          mandatory
          class="mb-2"
        >
          <v-chip
            v-for="cat in categories"
            :key="cat"
            :value="cat"
            filter
            variant="outlined"
          >
            {{ getCategoryName(cat) }}
          </v-chip>
        </v-chip-group>

        <!-- Recipe Cards -->
        <v-card>
          <v-card-title>
            <v-icon
              :color="currentProfession.color"
              class="mr-2"
            >
              mdi-book-open-variant
            </v-icon>
            Receptury
          </v-card-title>
          <v-card-text class="recipe-list">
            <v-list density="compact">
              <v-list-item
                v-for="recipe in filteredRecipes"
                :key="recipe.id"
                :class="{ 'bg-primary-lighten-5': selectedRecipe?.id === recipe.id }"
                @click="selectRecipe(recipe)"
              >
                <template #prepend>
                  <v-avatar
                    :color="getRarityColor(recipe.outputRarity)"
                    size="36"
                  >
                    <v-icon
                      color="white"
                      size="20"
                    >
                      {{ recipe.icon }}
                    </v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title>{{ recipe.name }}</v-list-item-title>
                <v-list-item-subtitle>
                  Lvl {{ recipe.requiredLevel }} •
                  {{ (recipe.craftTime / 10).toFixed(1) }}s
                </v-list-item-subtitle>
                <template #append>
                  <v-icon
                    v-if="canCraftRecipe(recipe)"
                    color="success"
                    size="20"
                  >
                    mdi-check-circle
                  </v-icon>
                  <v-icon
                    v-else
                    color="error"
                    size="20"
                  >
                    mdi-close-circle
                  </v-icon>
                </template>
              </v-list-item>
            </v-list>

            <v-alert
              v-if="filteredRecipes.length === 0"
              type="info"
              variant="tonal"
            >
              Brak receptur w tej kategorii.
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Right: Selected Recipe & Materials -->
      <v-col
        cols="12"
        md="7"
      >
        <!-- Selected Recipe Details -->
        <v-card v-if="selectedRecipe">
          <v-card-title class="d-flex align-center">
            <v-avatar
              :color="getRarityColor(selectedRecipe.outputRarity)"
              size="48"
              class="mr-3"
            >
              <v-icon color="white">
                {{ selectedRecipe.icon }}
              </v-icon>
            </v-avatar>
            <div>
              <div>{{ selectedRecipe.name }}</div>
              <div class="text-caption text-medium-emphasis">
                {{ selectedRecipe.description }}
              </div>
            </div>
          </v-card-title>

          <v-card-text>
            <!-- Materials Required -->
            <div class="text-subtitle-2 mb-2">
              Wymagane Materiały:
            </div>
            <v-list density="compact">
              <v-list-item
                v-for="mat in selectedRecipe.materials"
                :key="mat.itemId"
              >
                <template #prepend>
                  <v-icon size="20">
                    mdi-cube
                  </v-icon>
                </template>
                <v-list-item-title>
                  {{ mat.itemId }}
                </v-list-item-title>
                <template #append>
                  <span
                    :class="getMaterialCount(mat.itemId) >= mat.amount ? 'text-success' : 'text-error'"
                  >
                    {{ getMaterialCount(mat.itemId) }} / {{ mat.amount }}
                  </span>
                </template>
              </v-list-item>
            </v-list>

            <!-- Output Info -->
            <v-divider class="my-3" />
            <div class="d-flex justify-space-between mb-2">
              <span class="text-medium-emphasis">Wynik:</span>
              <span>
                {{ selectedRecipe.outputAmount }}x
                <v-chip
                  size="x-small"
                  :color="getRarityColor(selectedRecipe.outputRarity)"
                >
                  {{ selectedRecipe.outputRarity }}
                </v-chip>
              </span>
            </div>
            <div class="d-flex justify-space-between mb-2">
              <span class="text-medium-emphasis">Czas:</span>
              <span>{{ (selectedRecipe.craftTime / 10).toFixed(1) }}s</span>
            </div>
            <div class="d-flex justify-space-between mb-2">
              <span class="text-medium-emphasis">XP:</span>
              <span>{{ selectedRecipe.xpReward }}</span>
            </div>

            <!-- Quantity & Craft Button -->
            <v-divider class="my-3" />
            <div class="d-flex align-center gap-3">
              <v-text-field
                v-model.number="craftQuantity"
                type="number"
                label="Ilość"
                variant="outlined"
                density="compact"
                :min="1"
                :max="99"
                style="max-width: 100px"
                hide-details
              />
              <v-btn
                :color="currentProfession.color"
                :disabled="!canCraftRecipe(selectedRecipe) || craftingStore.isCrafting"
                size="large"
                @click="startCraft"
              >
                <v-icon start>
                  mdi-hammer
                </v-icon>
                Wytwórz
              </v-btn>
            </div>
          </v-card-text>
        </v-card>

        <!-- No Recipe Selected -->
        <v-card v-else>
          <v-card-text class="text-center py-8 text-medium-emphasis">
            <v-icon
              size="64"
              color="grey"
            >
              mdi-hammer-wrench
            </v-icon>
            <div class="mt-2">
              Wybierz recepturę z listy
            </div>
          </v-card-text>
        </v-card>

        <!-- Recent Crafts -->
        <v-card class="mt-4">
          <v-card-title>
            <v-icon
              color="teal"
              class="mr-2"
            >
              mdi-history
            </v-icon>
            Ostatnio Wytworzone
          </v-card-title>
          <v-card-text>
            <v-list
              v-if="recentCraftsDisplay.length > 0"
              density="compact"
            >
              <v-list-item
                v-for="(craft, idx) in recentCraftsDisplay"
                :key="idx"
              >
                <template #prepend>
                  <v-avatar size="32">
                    <v-icon>{{ craft.recipe?.icon }}</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title>{{ craft.recipe?.name }}</v-list-item-title>
                <v-list-item-subtitle>
                  <span :style="{ color: craft.qualityColor }">
                    {{ craft.qualityLabel }} ({{ craft.quality }}%)
                  </span>
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
            <div
              v-else
              class="text-center py-4 text-medium-emphasis"
            >
              Brak ostatnich wytworzeń
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.recipe-list {
  max-height: 400px;
  overflow-y: auto;
}

.bg-primary-lighten-5 {
  background: rgba(var(--v-theme-primary), 0.08);
}
</style>
