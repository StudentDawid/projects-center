<script setup lang="ts">
/**
 * Chef Panel - Cooking, Restaurant, Food Buffs
 */

import { computed, ref } from 'vue';
import { useAteriaChefStore } from '../model/chef.store';
import {
  INGREDIENTS,
  RECIPES,
  QUALITY_LEVELS,
  RESTAURANT_CUSTOMERS,
  getCategoryIcon,
  getCategoryName,
  type DishCategory,
  type DishQuality,
} from '../data/chef.data';

const chefStore = useAteriaChefStore();

// UI State
const activeTab = ref<'cooking' | 'inventory' | 'restaurant' | 'buffs'>('cooking');
const selectedCategory = ref<DishCategory | 'all'>('all');

// Computed
const filteredRecipes = computed(() => {
  if (selectedCategory.value === 'all') {
    return chefStore.availableRecipes;
  }
  return chefStore.availableRecipes.filter(r => r.category === selectedCategory.value);
});

const inventoryItems = computed(() => {
  const items: Array<{ key: string; recipeId: string; quality: DishQuality; amount: number; recipe: any }> = [];
  for (const [key, data] of chefStore.cookedDishes) {
    const recipe = RECIPES[data.dish.recipeId];
    if (recipe) {
      items.push({
        key,
        recipeId: data.dish.recipeId,
        quality: data.dish.quality,
        amount: data.amount,
        recipe,
      });
    }
  }
  return items;
});

const ingredientsList = computed(() => {
  const items: Array<{ id: string; name: string; icon: string; amount: number }> = [];
  for (const [id, amount] of chefStore.ingredients) {
    const ing = INGREDIENTS[id];
    if (ing && amount > 0) {
      items.push({ id, name: ing.name, icon: ing.icon, amount });
    }
  }
  return items;
});

// Actions
function startCooking(recipeId: string) {
  chefStore.startCooking(recipeId);
}

function canCookRecipe(recipeId: string): boolean {
  return chefStore.canCook(recipeId).canCook;
}

function getIngredientStatus(recipe: any): string {
  const missing: string[] = [];
  for (const req of recipe.ingredients) {
    const have = chefStore.ingredients.get(req.ingredientId) || 0;
    if (have < req.amount) {
      const ing = INGREDIENTS[req.ingredientId];
      missing.push(`${ing?.name || req.ingredientId} (${have}/${req.amount})`);
    }
  }
  return missing.length > 0 ? `Brak: ${missing.join(', ')}` : 'Gotowe do przygotowania';
}
</script>

<template>
  <div class="chef-panel">
    <!-- Header -->
    <v-card class="mb-4">
      <v-card-text>
        <div class="d-flex align-center">
          <v-avatar
            color="orange"
            size="56"
            class="mr-4"
          >
            <v-icon
              size="32"
              color="white"
            >
              mdi-chef-hat
            </v-icon>
          </v-avatar>
          <div class="flex-grow-1">
            <div class="d-flex align-center">
              <span class="text-h5 mr-2">Kucharz</span>
              <v-chip
                size="small"
                color="orange"
              >
                Poziom {{ chefStore.progress.level }}
              </v-chip>
            </div>
            <div class="text-body-2 text-medium-emphasis">
              Gotowanie, restauracja, buffy z jedzenia
            </div>
            <v-progress-linear
              :model-value="chefStore.getXpProgress()"
              color="orange"
              height="8"
              rounded
              class="mt-2"
            >
              <template #default>
                <span class="text-caption">
                  {{ chefStore.progress.xp }} / {{ chefStore.progress.xpToNextLevel }} XP
                </span>
              </template>
            </v-progress-linear>
          </div>
        </div>

        <!-- Quick Stats -->
        <v-row class="mt-3">
          <v-col
            cols="3"
            class="text-center"
          >
            <div class="text-h6">
              {{ chefStore.totalDishesCooked }}
            </div>
            <div class="text-caption">
              Ugotowane
            </div>
          </v-col>
          <v-col
            cols="3"
            class="text-center"
          >
            <div class="text-h6">
              {{ chefStore.discoveredRecipes.size }}
            </div>
            <div class="text-caption">
              Przepisy
            </div>
          </v-col>
          <v-col
            cols="3"
            class="text-center"
          >
            <div class="text-h6">
              {{ chefStore.activeBuffs.length }}
            </div>
            <div class="text-caption">
              Aktywne Buffy
            </div>
          </v-col>
          <v-col
            cols="3"
            class="text-center"
          >
            <div class="text-h6 text-amber">
              {{ chefStore.restaurant.goldEarned }}g
            </div>
            <div class="text-caption">
              Z Restauracji
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Active Cooking -->
    <v-card
      v-if="chefStore.isCooking && chefStore.currentRecipe"
      class="mb-4"
    >
      <v-card-text>
        <div class="d-flex align-center mb-2">
          <v-avatar
            color="orange"
            size="48"
            class="mr-3"
          >
            <v-icon color="white">
              {{ chefStore.currentRecipe.icon }}
            </v-icon>
          </v-avatar>
          <div class="flex-grow-1">
            <div class="text-h6">
              {{ chefStore.currentRecipe.name }}
            </div>
            <v-progress-linear
              :model-value="chefStore.cookingProgress"
              color="orange"
              height="20"
              rounded
            >
              <template #default>
                {{ Math.floor(chefStore.cookingProgress) }}%
              </template>
            </v-progress-linear>
          </div>
          <v-btn
            color="error"
            variant="tonal"
            class="ml-3"
            @click="chefStore.cancelCooking()"
          >
            Anuluj
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Tabs -->
    <v-tabs
      v-model="activeTab"
      color="orange"
      class="mb-4"
    >
      <v-tab value="cooking">
        <v-icon start>
          mdi-pot-steam
        </v-icon>
        Gotowanie
      </v-tab>
      <v-tab value="inventory">
        <v-icon start>
          mdi-food
        </v-icon>
        Potrawy
        <v-badge
          v-if="inventoryItems.length > 0"
          :content="inventoryItems.length"
          color="success"
          inline
        />
      </v-tab>
      <v-tab value="restaurant">
        <v-icon start>
          mdi-store
        </v-icon>
        Restauracja
      </v-tab>
      <v-tab value="buffs">
        <v-icon start>
          mdi-lightning-bolt
        </v-icon>
        Buffy
        <v-badge
          v-if="chefStore.activeBuffs.length > 0"
          :content="chefStore.activeBuffs.length"
          color="success"
          inline
        />
      </v-tab>
    </v-tabs>

    <!-- Cooking Tab -->
    <div v-if="activeTab === 'cooking'">
      <!-- Category Filter -->
      <v-chip-group
        v-model="selectedCategory"
        mandatory
        class="mb-4"
      >
        <v-chip
          value="all"
          variant="outlined"
        >
          Wszystkie
        </v-chip>
        <v-chip
          v-for="cat in ['appetizer', 'main_course', 'dessert', 'drink', 'special'] as DishCategory[]"
          :key="cat"
          :value="cat"
          variant="outlined"
        >
          <v-icon
            start
            size="small"
          >
            {{ getCategoryIcon(cat) }}
          </v-icon>
          {{ getCategoryName(cat) }}
        </v-chip>
      </v-chip-group>

      <!-- Ingredients Summary -->
      <v-card
        v-if="ingredientsList.length > 0"
        class="mb-4"
        variant="outlined"
      >
        <v-card-text class="py-2">
          <div class="d-flex flex-wrap gap-2">
            <v-chip
              v-for="ing in ingredientsList.slice(0, 10)"
              :key="ing.id"
              size="small"
            >
              <v-icon
                start
                size="small"
              >
                {{ ing.icon }}
              </v-icon>
              {{ ing.name }}: {{ ing.amount }}
            </v-chip>
            <v-chip
              v-if="ingredientsList.length > 10"
              size="small"
              color="grey"
            >
              +{{ ingredientsList.length - 10 }} więcej
            </v-chip>
          </div>
        </v-card-text>
      </v-card>

      <!-- Recipes Grid -->
      <v-row>
        <v-col
          v-for="recipe in filteredRecipes"
          :key="recipe.id"
          cols="12"
          md="6"
          lg="4"
        >
          <v-card
            :disabled="chefStore.isCooking"
            variant="outlined"
          >
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-avatar
                  color="orange-lighten-4"
                  size="48"
                >
                  <v-icon color="orange">
                    {{ recipe.icon }}
                  </v-icon>
                </v-avatar>
                <div class="ml-3">
                  <div class="text-subtitle-1 font-weight-medium">
                    {{ recipe.name }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    Tier {{ recipe.tier }} • {{ (recipe.cookTime / 10).toFixed(0) }}s
                  </div>
                </div>
              </div>

              <div class="text-body-2 mb-2">
                {{ recipe.description }}
              </div>

              <!-- Ingredients -->
              <div class="mb-2">
                <v-chip
                  v-for="ing in recipe.ingredients"
                  :key="ing.ingredientId"
                  size="x-small"
                  :color="(chefStore.ingredients.get(ing.ingredientId) || 0) >= ing.amount ? 'success' : 'error'"
                  class="mr-1 mb-1"
                >
                  {{ INGREDIENTS[ing.ingredientId]?.name }}: {{ ing.amount }}
                </v-chip>
              </div>

              <!-- Buffs -->
              <div
                v-if="recipe.buffEffects"
                class="mb-2"
              >
                <v-chip
                  v-for="(buff, idx) in recipe.buffEffects"
                  :key="idx"
                  size="x-small"
                  color="primary"
                  variant="outlined"
                  class="mr-1"
                >
                  {{ buff.description }}
                </v-chip>
              </div>

              <v-btn
                block
                color="orange"
                :disabled="!canCookRecipe(recipe.id) || chefStore.isCooking"
                @click="startCooking(recipe.id)"
              >
                <v-icon start>
                  mdi-pot-steam
                </v-icon>
                Gotuj
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Inventory Tab -->
    <div v-if="activeTab === 'inventory'">
      <v-card>
        <v-list v-if="inventoryItems.length > 0">
          <v-list-item
            v-for="item in inventoryItems"
            :key="item.key"
          >
            <template #prepend>
              <v-avatar :color="QUALITY_LEVELS[item.quality].color">
                <v-icon color="white">
                  {{ item.recipe.icon }}
                </v-icon>
              </v-avatar>
            </template>
            <v-list-item-title>
              {{ item.recipe.name }}
              <v-chip
                size="x-small"
                :color="QUALITY_LEVELS[item.quality].color"
                class="ml-2"
              >
                {{ QUALITY_LEVELS[item.quality].label }}
              </v-chip>
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ item.amount }}x • {{ Math.floor(item.recipe.sellPrice * QUALITY_LEVELS[item.quality].multiplier) }}g/szt
            </v-list-item-subtitle>
            <template #append>
              <v-btn
                size="small"
                color="success"
                variant="tonal"
                class="mr-2"
                @click="chefStore.eatDish(item.recipeId, item.quality)"
              >
                Zjedz
              </v-btn>
              <v-btn
                size="small"
                color="amber"
                variant="tonal"
                @click="chefStore.sellDish(item.recipeId, item.quality, item.amount)"
              >
                Sprzedaj
              </v-btn>
            </template>
          </v-list-item>
        </v-list>
        <v-card-text
          v-else
          class="text-center py-8 text-medium-emphasis"
        >
          Brak ugotowanych potraw
        </v-card-text>
      </v-card>
    </div>

    <!-- Restaurant Tab -->
    <div v-if="activeTab === 'restaurant'">
      <v-card>
        <v-card-text class="text-center py-6">
          <v-avatar
            :color="chefStore.restaurant.isOpen ? 'success' : 'grey'"
            size="80"
            class="mb-4"
          >
            <v-icon
              size="48"
              color="white"
            >
              mdi-store
            </v-icon>
          </v-avatar>

          <div class="text-h5 mb-2">
            Restauracja
          </div>
          <div class="text-body-2 text-medium-emphasis mb-4">
            Obsługuj klientów i zarabiaj złoto
          </div>

          <v-btn
            v-if="!chefStore.restaurant.isOpen"
            color="success"
            size="large"
            @click="chefStore.openRestaurant()"
          >
            <v-icon start>
              mdi-door-open
            </v-icon>
            Otwórz Restaurację
          </v-btn>
          <v-btn
            v-else
            color="error"
            size="large"
            @click="chefStore.closeRestaurant()"
          >
            <v-icon start>
              mdi-door-closed
            </v-icon>
            Zamknij Restaurację
          </v-btn>

          <!-- Current Customer -->
          <v-card
            v-if="chefStore.restaurant.isOpen && chefStore.restaurant.currentCustomer"
            class="mt-4"
            variant="outlined"
          >
            <v-card-text>
              <div class="text-h6 mb-2">
                Aktualny Klient
              </div>
              <div class="d-flex align-center justify-center mb-3">
                <v-avatar
                  color="primary"
                  size="48"
                >
                  <v-icon color="white">
                    {{ RESTAURANT_CUSTOMERS.find(c => c.id === chefStore.restaurant.currentCustomer)?.icon }}
                  </v-icon>
                </v-avatar>
                <div class="ml-3 text-left">
                  <div class="font-weight-medium">
                    {{ RESTAURANT_CUSTOMERS.find(c => c.id === chefStore.restaurant.currentCustomer)?.name }}
                  </div>
                  <div class="text-caption">
                    Zamówienie: {{ RECIPES[chefStore.restaurant.customerOrder || '']?.name || 'Nieznane' }}
                  </div>
                </div>
              </div>

              <!-- Serve buttons -->
              <div class="d-flex flex-wrap gap-2 justify-center">
                <v-btn
                  v-for="item in inventoryItems.filter(i => i.recipeId === chefStore.restaurant.customerOrder)"
                  :key="item.key"
                  size="small"
                  color="success"
                  @click="chefStore.serveCustomer(item.recipeId, item.quality)"
                >
                  Podaj ({{ QUALITY_LEVELS[item.quality].label }})
                </v-btn>
              </div>
            </v-card-text>
          </v-card>

          <div class="mt-4 text-caption">
            Obsłużonych klientów: {{ chefStore.restaurant.customersServed }}
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Buffs Tab -->
    <div v-if="activeTab === 'buffs'">
      <v-card>
        <v-card-title>Aktywne Buffy z Jedzenia</v-card-title>
        <v-card-text>
          <v-list v-if="chefStore.activeBuffs.length > 0">
            <v-list-item
              v-for="(buff, idx) in chefStore.activeBuffs"
              :key="idx"
            >
              <template #prepend>
                <v-avatar :color="QUALITY_LEVELS[buff.quality].color">
                  <v-icon color="white">
                    {{ RECIPES[buff.recipeId]?.icon }}
                  </v-icon>
                </v-avatar>
              </template>
              <v-list-item-title>{{ RECIPES[buff.recipeId]?.name }}</v-list-item-title>
              <v-list-item-subtitle>
                <span
                  v-for="(effect, i) in buff.effects"
                  :key="i"
                >
                  {{ effect.description }}{{ i < buff.effects.length - 1 ? ', ' : '' }}
                </span>
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
          <div
            v-else
            class="text-center py-4 text-medium-emphasis"
          >
            Brak aktywnych buffów. Zjedz coś!
          </div>
        </v-card-text>
      </v-card>

      <!-- Total Buff Summary -->
      <v-card
        v-if="Object.keys(chefStore.totalBuffEffects).length > 0"
        class="mt-4"
      >
        <v-card-title>Suma Bonusów</v-card-title>
        <v-card-text>
          <v-chip
            v-for="(value, type) in chefStore.totalBuffEffects"
            :key="type"
            color="success"
            class="ma-1"
          >
            {{ type }}: +{{ value }}%
          </v-chip>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>
