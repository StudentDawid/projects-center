<script setup lang="ts">
/**
 * Alchemist Panel - Potions, Experiments, Lab
 */

import { computed, ref } from 'vue';
import { useAteriaAlchemistStore } from '../model/alchemist.store';
import {
  ALCHEMY_INGREDIENTS,
  POTIONS,
  ALCHEMY_EQUIPMENT,
  EXPERIMENTS,
  POTION_RARITY,
  getPotionTypeIcon,
  getPotionTypeName,
  type PotionType,
} from '../data/alchemist.data';

const alchemistStore = useAteriaAlchemistStore();

// UI State
const activeTab = ref<'brewing' | 'potions' | 'experiments' | 'equipment'>('brewing');
const selectedType = ref<PotionType | 'all'>('all');

// Computed
const filteredPotions = computed(() => {
  if (selectedType.value === 'all') {
    return alchemistStore.availablePotions;
  }
  return alchemistStore.availablePotions.filter(p => p.type === selectedType.value);
});

const ingredientsList = computed(() => {
  const items: Array<{ id: string; name: string; icon: string; amount: number }> = [];
  for (const [id, amount] of alchemistStore.ingredients) {
    const ing = ALCHEMY_INGREDIENTS[id];
    if (ing && amount > 0) {
      items.push({ id, name: ing.name, icon: ing.icon, amount });
    }
  }
  return items;
});

const potionInventory = computed(() => {
  const items: Array<{ id: string; name: string; icon: string; rarity: string; amount: number; sellPrice: number }> = [];
  for (const [id, amount] of alchemistStore.brewedPotions) {
    const potion = POTIONS[id];
    if (potion && amount > 0) {
      items.push({ id, name: potion.name, icon: potion.icon, rarity: potion.rarity, amount, sellPrice: potion.sellPrice });
    }
  }
  return items;
});

// Actions
function canBrewPotion(potionId: string): boolean {
  return alchemistStore.canBrew(potionId).canBrew;
}
</script>

<template>
  <div class="alchemist-panel">
    <!-- Header -->
    <v-card class="mb-4">
      <v-card-text>
        <div class="d-flex align-center">
          <v-avatar
            color="teal"
            size="56"
            class="mr-4"
          >
            <v-icon
              size="32"
              color="white"
            >
              mdi-flask
            </v-icon>
          </v-avatar>
          <div class="flex-grow-1">
            <div class="d-flex align-center">
              <span class="text-h5 mr-2">Alchemik</span>
              <v-chip
                size="small"
                color="teal"
              >
                Poziom {{ alchemistStore.progress.level }}
              </v-chip>
            </div>
            <div class="text-body-2 text-medium-emphasis">
              Eliksiry, eksperymenty, transmutacja
            </div>
            <v-progress-linear
              :model-value="alchemistStore.getXpProgress()"
              color="teal"
              height="8"
              rounded
              class="mt-2"
            >
              <template #default>
                <span class="text-caption">
                  {{ alchemistStore.progress.xp }} / {{ alchemistStore.progress.xpToNextLevel }} XP
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
              {{ alchemistStore.totalPotionsBrewed }}
            </div>
            <div class="text-caption">
              Uwarzonych
            </div>
          </v-col>
          <v-col
            cols="3"
            class="text-center"
          >
            <div class="text-h6">
              {{ alchemistStore.discoveredRecipes.size }}
            </div>
            <div class="text-caption">
              Receptury
            </div>
          </v-col>
          <v-col
            cols="3"
            class="text-center"
          >
            <div class="text-h6">
              {{ alchemistStore.successfulExperiments }}/{{ alchemistStore.totalExperiments }}
            </div>
            <div class="text-caption">
              Eksperymenty
            </div>
          </v-col>
          <v-col
            cols="3"
            class="text-center"
          >
            <div class="text-h6">
              {{ alchemistStore.activeBuffs.length }}
            </div>
            <div class="text-caption">
              Aktywne Buffy
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Active Brewing/Experiment -->
    <v-card
      v-if="alchemistStore.isBrewing && alchemistStore.activeBrewing"
      class="mb-4"
    >
      <v-card-text>
        <div class="d-flex align-center mb-2">
          <v-avatar
            color="teal"
            size="48"
            class="mr-3"
          >
            <v-icon color="white">
              {{ POTIONS[alchemistStore.activeBrewing.potionId]?.icon }}
            </v-icon>
          </v-avatar>
          <div class="flex-grow-1">
            <div class="text-h6">
              Warzenie: {{ POTIONS[alchemistStore.activeBrewing.potionId]?.name }}
            </div>
            <v-progress-linear
              :model-value="alchemistStore.brewingProgress"
              color="teal"
              height="20"
              rounded
            >
              <template #default>
                {{ Math.floor(alchemistStore.brewingProgress) }}%
              </template>
            </v-progress-linear>
          </div>
          <v-btn
            color="error"
            variant="tonal"
            class="ml-3"
            @click="alchemistStore.cancelBrewing()"
          >
            Anuluj
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <v-card
      v-if="alchemistStore.isExperimenting && alchemistStore.activeExperiment"
      class="mb-4"
    >
      <v-card-text>
        <div class="d-flex align-center mb-2">
          <v-avatar
            color="warning"
            size="48"
            class="mr-3"
          >
            <v-icon color="white">
              mdi-test-tube
            </v-icon>
          </v-avatar>
          <div class="flex-grow-1">
            <div class="text-h6">
              Eksperyment: {{ EXPERIMENTS[alchemistStore.activeExperiment.experimentId]?.name }}
            </div>
            <v-progress-linear
              :model-value="alchemistStore.experimentProgress"
              color="warning"
              height="20"
              rounded
            >
              <template #default>
                {{ Math.floor(alchemistStore.experimentProgress) }}%
              </template>
            </v-progress-linear>
          </div>
          <v-btn
            color="error"
            variant="tonal"
            class="ml-3"
            @click="alchemistStore.cancelExperiment()"
          >
            Przerwij
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Tabs -->
    <v-tabs
      v-model="activeTab"
      color="teal"
      class="mb-4"
    >
      <v-tab value="brewing">
        <v-icon start>
          mdi-pot-steam
        </v-icon>
        Warzenie
      </v-tab>
      <v-tab value="potions">
        <v-icon start>
          mdi-bottle-tonic
        </v-icon>
        Eliksiry
        <v-badge
          v-if="potionInventory.length > 0"
          :content="potionInventory.length"
          color="success"
          inline
        />
      </v-tab>
      <v-tab value="experiments">
        <v-icon start>
          mdi-test-tube
        </v-icon>
        Eksperymenty
      </v-tab>
      <v-tab value="equipment">
        <v-icon start>
          mdi-pot
        </v-icon>
        Sprzęt
      </v-tab>
    </v-tabs>

    <!-- Brewing Tab -->
    <div v-if="activeTab === 'brewing'">
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

      <!-- Type Filter -->
      <v-chip-group
        v-model="selectedType"
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
          v-for="type in ['healing', 'buff', 'damage', 'utility', 'transmutation'] as PotionType[]"
          :key="type"
          :value="type"
          variant="outlined"
        >
          <v-icon
            start
            size="small"
          >
            {{ getPotionTypeIcon(type) }}
          </v-icon>
          {{ getPotionTypeName(type) }}
        </v-chip>
      </v-chip-group>

      <!-- Potions Grid -->
      <v-row>
        <v-col
          v-for="potion in filteredPotions"
          :key="potion.id"
          cols="12"
          md="6"
          lg="4"
        >
          <v-card
            :disabled="alchemistStore.isBrewing || alchemistStore.isExperimenting"
            variant="outlined"
          >
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-avatar
                  :color="POTION_RARITY[potion.rarity].color"
                  size="48"
                >
                  <v-icon color="white">
                    {{ potion.icon }}
                  </v-icon>
                </v-avatar>
                <div class="ml-3">
                  <div class="text-subtitle-1 font-weight-medium">
                    {{ potion.name }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    {{ getPotionTypeName(potion.type) }} • {{ POTION_RARITY[potion.rarity].label }}
                  </div>
                </div>
              </div>

              <div class="text-body-2 mb-2">
                {{ potion.description }}
              </div>

              <!-- Ingredients -->
              <div class="mb-2">
                <v-chip
                  v-for="ing in potion.ingredients"
                  :key="ing.ingredientId"
                  size="x-small"
                  :color="(alchemistStore.ingredients.get(ing.ingredientId) || 0) >= ing.amount ? 'success' : 'error'"
                  class="mr-1 mb-1"
                >
                  {{ ALCHEMY_INGREDIENTS[ing.ingredientId]?.name }}: {{ ing.amount }}
                </v-chip>
              </div>

              <!-- Effects -->
              <div class="mb-2">
                <v-chip
                  v-for="(effect, idx) in potion.effects"
                  :key="idx"
                  size="x-small"
                  color="primary"
                  variant="outlined"
                  class="mr-1"
                >
                  {{ effect.description }}
                </v-chip>
              </div>

              <v-btn
                block
                color="teal"
                :disabled="!canBrewPotion(potion.id)"
                @click="alchemistStore.startBrewing(potion.id)"
              >
                <v-icon start>
                  mdi-pot-steam
                </v-icon>
                Uwarz
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Potions Inventory Tab -->
    <div v-if="activeTab === 'potions'">
      <v-card>
        <v-list v-if="potionInventory.length > 0">
          <v-list-item
            v-for="item in potionInventory"
            :key="item.id"
          >
            <template #prepend>
              <v-avatar :color="POTION_RARITY[item.rarity as keyof typeof POTION_RARITY].color">
                <v-icon color="white">
                  {{ item.icon }}
                </v-icon>
              </v-avatar>
            </template>
            <v-list-item-title>
              {{ item.name }}
              <v-chip
                size="x-small"
                :color="POTION_RARITY[item.rarity as keyof typeof POTION_RARITY].color"
                class="ml-2"
              >
                {{ POTION_RARITY[item.rarity as keyof typeof POTION_RARITY].label }}
              </v-chip>
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ item.amount }}x • {{ item.sellPrice * item.amount }}g
            </v-list-item-subtitle>
            <template #append>
              <v-btn
                size="small"
                color="success"
                variant="tonal"
                class="mr-2"
                @click="alchemistStore.usePotion(item.id)"
              >
                Użyj
              </v-btn>
              <v-btn
                size="small"
                color="amber"
                variant="tonal"
                @click="alchemistStore.sellPotion(item.id, item.amount)"
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
          Brak uwarzonych eliksirów
        </v-card-text>
      </v-card>
    </div>

    <!-- Experiments Tab -->
    <div v-if="activeTab === 'experiments'">
      <v-card>
        <v-card-title>Eksperymenty Alchemiczne</v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item
              v-for="experiment in Object.values(EXPERIMENTS)"
              :key="experiment.id"
            >
              <template #prepend>
                <v-avatar color="warning">
                  <v-icon color="white">
                    {{ experiment.icon }}
                  </v-icon>
                </v-avatar>
              </template>
              <v-list-item-title>{{ experiment.name }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ experiment.description }}
                <br>
                Szansa sukcesu: {{ experiment.successChance }}% • Koszt: {{ experiment.goldCost }}g
              </v-list-item-subtitle>
              <template #append>
                <v-btn
                  :disabled="!alchemistStore.canStartExperiment(experiment.id).canStart"
                  color="warning"
                  @click="alchemistStore.startExperiment(experiment.id)"
                >
                  Eksperymentuj
                </v-btn>
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </div>

    <!-- Equipment Tab -->
    <div v-if="activeTab === 'equipment'">
      <v-card>
        <v-card-title>Kociołki Alchemiczne</v-card-title>
        <v-card-text>
          <v-row>
            <v-col
              v-for="equipment in Object.values(ALCHEMY_EQUIPMENT)"
              :key="equipment.id"
              cols="12"
              md="6"
              lg="4"
            >
              <v-card
                :variant="alchemistStore.ownedEquipment.has(equipment.id) ? 'elevated' : 'outlined'"
                :class="{ 'border-primary': alchemistStore.equippedCauldron === equipment.id }"
              >
                <v-card-text>
                  <div class="d-flex align-center mb-2">
                    <v-icon
                      size="36"
                      :color="alchemistStore.ownedEquipment.has(equipment.id) ? 'teal' : 'grey'"
                    >
                      {{ equipment.icon }}
                    </v-icon>
                    <div class="ml-3">
                      <div class="font-weight-medium">
                        {{ equipment.name }}
                      </div>
                      <div class="text-caption">
                        Tier {{ equipment.tier }} • Lvl {{ equipment.requiredLevel }}
                      </div>
                    </div>
                  </div>

                  <div class="text-body-2 mb-2">
                    {{ equipment.description }}
                  </div>

                  <div class="text-caption mb-2">
                    +{{ equipment.brewSpeedBonus }}% szybkość • +{{ equipment.qualityBonus }}% jakość • {{ equipment.doubleBrewChance }}% podwójne
                  </div>

                  <v-btn
                    v-if="!alchemistStore.ownedEquipment.has(equipment.id)"
                    size="small"
                    color="amber"
                    block
                    :disabled="equipment.requiredLevel > alchemistStore.progress.level"
                    @click="alchemistStore.buyEquipment(equipment.id)"
                  >
                    Kup ({{ equipment.cost }}g)
                  </v-btn>
                  <v-btn
                    v-else-if="alchemistStore.equippedCauldron !== equipment.id"
                    size="small"
                    color="primary"
                    block
                    @click="alchemistStore.equipCauldron(equipment.id)"
                  >
                    Załóż
                  </v-btn>
                  <v-chip
                    v-else
                    color="success"
                    block
                  >
                    Założony
                  </v-chip>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<style scoped>
.border-primary {
  border-color: rgb(var(--v-theme-primary)) !important;
  border-width: 2px !important;
}
</style>
