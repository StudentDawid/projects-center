<script setup lang="ts">
/**
 * Integration Panel - Manage cross-path systems
 * Food, Potion Allocation, Loot Transfer
 */

import { computed, ref } from 'vue';
import { useAteriaIntegrationStore } from '../model/integration.store';
import { useAteriaScientistStore } from '../../scientist/model/scientist.store';
import { FOODS, getFood, type FoodItem } from '../../data/food.data';
import { POTIONS } from '../../data/scientist.data';

const integrationStore = useAteriaIntegrationStore();
const scientistStore = useAteriaScientistStore();

// UI State
const activeTab = ref<'food' | 'potions' | 'loot'>('food');
const showAllocationDialog = ref(false);
const selectedPotionId = ref<string | null>(null);
const tempAllocation = ref({ warriorPercent: 50, minWarriorStock: 5 });

// Food computed
const foodItems = computed(() => {
  return integrationStore.foodInventory.map(item => ({
    ...item,
    food: getFood(item.foodId),
  })).filter(item => item.food);
});

const sortedFoodItems = computed(() => {
  return [...foodItems.value].sort((a, b) => {
    // Sort by tier, then by amount
    if (a.food!.tier !== b.food!.tier) {
      return b.food!.tier - a.food!.tier;
    }
    return b.amount - a.amount;
  });
});

// Potion computed
const availablePotions = computed(() => {
  const potionIds = new Set<string>();
  
  // Potions that warrior has
  for (const [id] of integrationStore.warriorPotionStock) {
    potionIds.add(id);
  }
  
  // Potions that can be crafted
  for (const potionId of scientistStore.discoveredPotions) {
    potionIds.add(potionId);
  }

  return Array.from(potionIds).map(id => ({
    id,
    potion: POTIONS[id],
    warriorStock: integrationStore.getWarriorPotionCount(id),
    allocation: integrationStore.potionAllocations.get(id),
  })).filter(p => p.potion);
});

// Helper functions
function getTierColor(tier: number): string {
  switch (tier) {
    case 1: return 'grey';
    case 2: return 'green';
    case 3: return 'blue';
    case 4: return 'purple';
    default: return 'grey';
  }
}

function getFoodIcon(food: FoodItem): string {
  return food.icon;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

// Actions
function consumeFood(foodId: string) {
  const healAmount = integrationStore.consumeFood(foodId);
  if (healAmount > 0) {
    // Heal is applied via warrior store
  }
}

function openAllocationDialog(potionId: string) {
  selectedPotionId.value = potionId;
  const existing = integrationStore.potionAllocations.get(potionId);
  tempAllocation.value = {
    warriorPercent: existing?.warriorPercent ?? 50,
    minWarriorStock: existing?.minWarriorStock ?? 5,
  };
  showAllocationDialog.value = true;
}

function saveAllocation() {
  if (!selectedPotionId.value) return;
  
  integrationStore.setAllocation(selectedPotionId.value, {
    warriorPercent: tempAllocation.value.warriorPercent,
    shopPercent: 100 - tempAllocation.value.warriorPercent,
    minWarriorStock: tempAllocation.value.minWarriorStock,
  });
  
  showAllocationDialog.value = false;
  selectedPotionId.value = null;
}

function toggleAutoEat() {
  integrationStore.updateAutoEatSettings({
    enabled: !integrationStore.autoEatSettings.enabled,
  });
}

function setAutoEatThreshold(threshold: number) {
  integrationStore.updateAutoEatSettings({ threshold });
}

function toggleLootTransfer() {
  integrationStore.setLootTransferSettings({
    enabled: !integrationStore.lootTransferSettings.enabled,
  });
}
</script>

<template>
  <div class="integration-panel">
    <!-- Header -->
    <v-card class="mb-4">
      <v-card-text>
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
              mdi-link-variant
            </v-icon>
          </v-avatar>
          <div>
            <div class="text-h5">
              Integracja Ścieżek
            </div>
            <div class="text-body-2 text-medium-emphasis">
              Zarządzaj jedzeniem, miksturami i transferem łupów
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Quick Stats -->
    <v-row class="mb-4">
      <v-col
        cols="4"
      >
        <v-card class="text-center pa-3">
          <v-icon
            color="brown"
            size="32"
          >
            mdi-food
          </v-icon>
          <div class="text-h6 mt-1">
            {{ integrationStore.totalFoodCount }}
          </div>
          <div class="text-caption text-medium-emphasis">
            Jedzenie
          </div>
        </v-card>
      </v-col>
      <v-col cols="4">
        <v-card class="text-center pa-3">
          <v-icon
            color="purple"
            size="32"
          >
            mdi-flask
          </v-icon>
          <div class="text-h6 mt-1">
            {{ integrationStore.totalWarriorPotions }}
          </div>
          <div class="text-caption text-medium-emphasis">
            Mikstury (Wojownik)
          </div>
        </v-card>
      </v-col>
      <v-col cols="4">
        <v-card class="text-center pa-3">
          <v-icon
            color="amber"
            size="32"
          >
            mdi-cart
          </v-icon>
          <div class="text-h6 mt-1">
            {{ integrationStore.totalShopPotions }}
          </div>
          <div class="text-caption text-medium-emphasis">
            Mikstury (Sklep)
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Tabs -->
    <v-tabs
      v-model="activeTab"
      color="pink"
      class="mb-4"
    >
      <v-tab value="food">
        <v-icon start>
          mdi-food
        </v-icon>
        Jedzenie
      </v-tab>
      <v-tab value="potions">
        <v-icon start>
          mdi-flask
        </v-icon>
        Alokacja Mikstur
      </v-tab>
      <v-tab value="loot">
        <v-icon start>
          mdi-treasure-chest
        </v-icon>
        Transfer Łupów
      </v-tab>
    </v-tabs>

    <!-- Food Tab -->
    <div v-if="activeTab === 'food'">
      <!-- Auto-Eat Settings -->
      <v-card class="mb-4">
        <v-card-title>
          <v-icon
            class="mr-2"
            color="green"
          >
            mdi-silverware-fork-knife
          </v-icon>
          Automatyczne Jedzenie
        </v-card-title>
        <v-card-text>
          <v-row align="center">
            <v-col cols="6">
              <v-switch
                :model-value="integrationStore.autoEatSettings.enabled"
                label="Włącz auto-jedzenie"
                color="success"
                hide-details
                @update:model-value="toggleAutoEat"
              />
            </v-col>
            <v-col cols="6">
              <div class="text-caption mb-1">
                Próg HP: {{ integrationStore.autoEatSettings.threshold }}%
              </div>
              <v-slider
                :model-value="integrationStore.autoEatSettings.threshold"
                :min="10"
                :max="90"
                :step="5"
                color="red"
                thumb-label
                hide-details
                :disabled="!integrationStore.autoEatSettings.enabled"
                @update:model-value="setAutoEatThreshold"
              />
            </v-col>
          </v-row>
          <v-switch
            :model-value="integrationStore.autoEatSettings.preserveHighTier"
            label="Zachowaj jedzenie Tier 3+"
            color="warning"
            hide-details
            class="mt-2"
            @update:model-value="integrationStore.updateAutoEatSettings({ preserveHighTier: $event })"
          />
        </v-card-text>
      </v-card>

      <!-- Food Inventory -->
      <v-card>
        <v-card-title>
          <v-icon
            class="mr-2"
            color="brown"
          >
            mdi-food-variant
          </v-icon>
          Zapasy Jedzenia
        </v-card-title>
        <v-card-text>
          <v-row v-if="sortedFoodItems.length > 0">
            <v-col
              v-for="item in sortedFoodItems"
              :key="item.foodId"
              cols="6"
              md="4"
            >
              <v-card
                variant="outlined"
                class="food-card"
              >
                <v-card-text class="pa-3">
                  <div class="d-flex align-center mb-2">
                    <v-avatar
                      :color="getTierColor(item.food!.tier)"
                      size="40"
                      class="mr-3"
                    >
                      <v-icon color="white">
                        {{ item.food!.icon }}
                      </v-icon>
                    </v-avatar>
                    <div class="flex-grow-1">
                      <div class="text-body-2 font-weight-medium">
                        {{ item.food!.name }}
                      </div>
                      <div class="text-caption text-medium-emphasis">
                        Tier {{ item.food!.tier }} • x{{ item.amount }}
                      </div>
                    </div>
                  </div>

                  <div class="text-caption mb-2">
                    <v-icon
                      size="14"
                      color="red"
                      class="mr-1"
                    >
                      mdi-heart
                    </v-icon>
                    +{{ item.food!.healAmount }} HP
                    <span v-if="item.food!.healPercent">
                      ({{ item.food!.healPercent }}% max)
                    </span>
                  </div>

                  <div
                    v-if="item.food!.buffs && item.food!.buffs.length > 0"
                    class="d-flex flex-wrap gap-1 mb-2"
                  >
                    <v-chip
                      v-for="(buff, idx) in item.food!.buffs"
                      :key="idx"
                      size="x-small"
                      color="blue"
                      variant="tonal"
                    >
                      +{{ buff.value }}{{ buff.type === 'hp_regen' ? '/s' : '%' }}
                      {{ buff.type.replace('_', ' ') }}
                    </v-chip>
                  </div>

                  <v-btn
                    size="small"
                    color="success"
                    variant="tonal"
                    block
                    @click="consumeFood(item.foodId)"
                  >
                    Zjedz
                  </v-btn>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <div
            v-else
            class="text-center py-8 text-medium-emphasis"
          >
            <v-icon
              size="64"
              color="grey"
            >
              mdi-food-off
            </v-icon>
            <div class="mt-2">
              Brak jedzenia w ekwipunku
            </div>
            <div class="text-caption">
              Zdobądź jedzenie z potworów lub kup u kupca
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Potions Tab -->
    <div v-if="activeTab === 'potions'">
      <!-- Allocation Mode -->
      <v-card class="mb-4">
        <v-card-title>
          <v-icon
            class="mr-2"
            color="purple"
          >
            mdi-tune
          </v-icon>
          Tryb Alokacji
        </v-card-title>
        <v-card-text>
          <v-btn-toggle
            v-model="integrationStore.allocationMode"
            mandatory
            color="primary"
            variant="outlined"
          >
            <v-btn value="balanced">
              <v-icon start>
                mdi-scale-balance
              </v-icon>
              Zbalansowany
            </v-btn>
            <v-btn value="warrior_priority">
              <v-icon start>
                mdi-sword
              </v-icon>
              Priorytet Wojownika
            </v-btn>
            <v-btn value="shop_priority">
              <v-icon start>
                mdi-cart
              </v-icon>
              Priorytet Sklepu
            </v-btn>
          </v-btn-toggle>
          <div class="text-caption text-medium-emphasis mt-2">
            <span v-if="integrationStore.allocationMode === 'balanced'">
              Mikstury są dzielone według ustawionych proporcji
            </span>
            <span v-else-if="integrationStore.allocationMode === 'warrior_priority'">
              Przy niskim HP wojownika, wszystkie mikstury trafiają do niego
            </span>
            <span v-else>
              Większość mikstur trafia do sklepu na sprzedaż
            </span>
          </div>
        </v-card-text>
      </v-card>

      <!-- Potion List -->
      <v-card>
        <v-card-title>
          <v-icon
            class="mr-2"
            color="purple"
          >
            mdi-flask-round-bottom
          </v-icon>
          Alokacja Mikstur
        </v-card-title>
        <v-card-text>
          <v-list v-if="availablePotions.length > 0">
            <v-list-item
              v-for="item in availablePotions"
              :key="item.id"
            >
              <template #prepend>
                <v-avatar
                  color="purple"
                  size="40"
                >
                  <v-icon color="white">
                    {{ item.potion?.icon || 'mdi-flask' }}
                  </v-icon>
                </v-avatar>
              </template>

              <v-list-item-title>{{ item.potion?.name }}</v-list-item-title>
              <v-list-item-subtitle>
                Wojownik: {{ item.warriorStock }} •
                Alokacja: {{ item.allocation?.warriorPercent ?? 50 }}% / {{ item.allocation?.shopPercent ?? 50 }}%
              </v-list-item-subtitle>

              <template #append>
                <v-btn
                  size="small"
                  variant="text"
                  @click="openAllocationDialog(item.id)"
                >
                  <v-icon>mdi-cog</v-icon>
                </v-btn>
              </template>
            </v-list-item>
          </v-list>

          <div
            v-else
            class="text-center py-8 text-medium-emphasis"
          >
            <v-icon
              size="64"
              color="grey"
            >
              mdi-flask-empty-outline
            </v-icon>
            <div class="mt-2">
              Brak dostępnych mikstur
            </div>
            <div class="text-caption">
              Odkryj i produkuj mikstury w laboratorium Naukowca
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Loot Tab -->
    <div v-if="activeTab === 'loot'">
      <v-card>
        <v-card-title>
          <v-icon
            class="mr-2"
            color="amber"
          >
            mdi-transfer
          </v-icon>
          Automatyczny Transfer Łupów
        </v-card-title>
        <v-card-text>
          <v-switch
            :model-value="integrationStore.lootTransferSettings.enabled"
            label="Włącz automatyczny transfer łupów do sklepu"
            color="success"
            @update:model-value="toggleLootTransfer"
          />

          <v-select
            v-if="integrationStore.lootTransferSettings.enabled"
            :model-value="integrationStore.lootTransferSettings.autoTransferRarity"
            :items="[
              { value: 'common', title: 'Tylko zwykłe' },
              { value: 'uncommon', title: 'Zwykłe i niepospolite' },
              { value: 'rare', title: 'Do rzadkich' },
              { value: 'all', title: 'Wszystkie' },
            ]"
            label="Maksymalna rzadkość do transferu"
            variant="outlined"
            density="compact"
            class="mt-4"
            @update:model-value="integrationStore.setLootTransferSettings({ autoTransferRarity: $event })"
          />

          <v-alert
            type="info"
            variant="tonal"
            class="mt-4"
          >
            <v-icon start>
              mdi-information
            </v-icon>
            Odblokuj badanie "Automatyczny Transfer Łupów" u Naukowca, aby włączyć tę funkcję.
          </v-alert>
        </v-card-text>
      </v-card>
    </div>

    <!-- Allocation Dialog -->
    <v-dialog
      v-model="showAllocationDialog"
      max-width="400"
    >
      <v-card>
        <v-card-title>Ustaw Alokację</v-card-title>
        <v-card-text>
          <div class="mb-4">
            <div class="d-flex justify-space-between text-caption mb-1">
              <span>Wojownik: {{ tempAllocation.warriorPercent }}%</span>
              <span>Sklep: {{ 100 - tempAllocation.warriorPercent }}%</span>
            </div>
            <v-slider
              v-model="tempAllocation.warriorPercent"
              :min="0"
              :max="100"
              :step="10"
              color="red"
              track-color="amber"
              thumb-label
            />
          </div>

          <v-text-field
            v-model.number="tempAllocation.minWarriorStock"
            type="number"
            label="Minimalny zapas dla Wojownika"
            variant="outlined"
            density="compact"
            :min="0"
            :max="50"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="showAllocationDialog = false"
          >
            Anuluj
          </v-btn>
          <v-btn
            color="primary"
            @click="saveAllocation"
          >
            Zapisz
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.food-card {
  transition: all 0.2s ease;
}

.food-card:hover {
  background: rgba(255, 255, 255, 0.03);
}
</style>
