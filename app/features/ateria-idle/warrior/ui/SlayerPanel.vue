<script setup lang="ts">
/**
 * Slayer Panel - UI for Slayer Tasks and Hunter's Exchange
 */

import { computed, ref } from 'vue';
import { useAteriaWarriorStore } from '../model/warrior.store';
import { useAteriaResourcesStore } from '../../core/model/resources.store';
import { formatNumber } from '~/shared/lib/big-number';
import {
  SLAYER_CATEGORIES,
  SLAYER_SHOP_ITEMS,
  getShopItemsByCategory,
  type SlayerTaskTemplate,
  type SlayerCategoryInfo,
} from '../../data/slayer.data';
import { getMonster } from '../../data/monsters.data';
import type { SlayerCategory } from '~/entities/ateria-idle/warrior';

const warriorStore = useAteriaWarriorStore();
const resourcesStore = useAteriaResourcesStore();

// UI State
const activeTab = ref<'tasks' | 'shop' | 'stats'>('tasks');
const selectedCategory = ref<SlayerCategory | null>(null);
const shopCategory = ref<'all' | 'equipment' | 'consumable' | 'upgrade'>('all');
const showTaskConfirm = ref(false);
const selectedTaskTemplate = ref<SlayerTaskTemplate | null>(null);

// Computed
const slayerCoins = computed(() => {
  return resourcesStore.slayerCoins?.amount || 0;
});

const categories = computed(() => {
  return Object.values(SLAYER_CATEGORIES);
});

const filteredTasks = computed(() => {
  let tasks = warriorStore.availableSlayerTasks;
  if (selectedCategory.value) {
    tasks = tasks.filter(t => t.category === selectedCategory.value);
  }
  return tasks;
});

const shopItems = computed(() => {
  if (shopCategory.value === 'all') {
    return SLAYER_SHOP_ITEMS;
  }
  return getShopItemsByCategory(shopCategory.value);
});

const currentTask = computed(() => warriorStore.slayer.currentTask);

const currentTaskMonster = computed(() => {
  if (!currentTask.value) return null;
  return getMonster(currentTask.value.targetMonsterId);
});

const currentTaskCategory = computed(() => {
  if (!currentTask.value) return null;
  return SLAYER_CATEGORIES[currentTask.value.category];
});

// Helper functions
function getCategoryInfo(category: SlayerCategory): SlayerCategoryInfo {
  return SLAYER_CATEGORIES[category];
}

function getTierColor(tier: number): string {
  const colors: Record<number, string> = {
    1: '#4CAF50',
    2: '#2196F3',
    3: '#9C27B0',
    4: '#FF9800',
    5: '#F44336',
  };
  return colors[tier] || '#757575';
}

function canAffordItem(cost: number): boolean {
  return resourcesStore.hasAmount('slayerCoins', cost);
}

function isItemPurchased(itemId: string): boolean {
  return warriorStore.purchasedSlayerItems.has(itemId);
}

function isItemAvailable(item: typeof SLAYER_SHOP_ITEMS[0]): boolean {
  if (item.oneTimePurchase && isItemPurchased(item.id)) return false;
  if (warriorStore.slayer.level < item.requiredLevel) return false;
  return true;
}

// Actions
function selectTask(template: SlayerTaskTemplate) {
  selectedTaskTemplate.value = template;
  showTaskConfirm.value = true;
}

function confirmAcceptTask() {
  if (selectedTaskTemplate.value) {
    warriorStore.acceptSlayerTask(selectedTaskTemplate.value);
  }
  showTaskConfirm.value = false;
  selectedTaskTemplate.value = null;
}

function cancelCurrentTask() {
  warriorStore.cancelSlayerTask();
}

function purchaseItem(itemId: string) {
  warriorStore.purchaseSlayerItem(itemId);
}
</script>

<template>
  <div class="slayer-panel">
    <!-- Header with Slayer Stats -->
    <v-card class="mb-4">
      <v-card-text>
        <v-row align="center">
          <!-- Slayer Level & XP -->
          <v-col
            cols="12"
            md="4"
          >
            <div class="d-flex align-center">
              <v-avatar
                color="deep-purple"
                size="56"
                class="mr-4"
              >
                <v-icon
                  size="32"
                  color="white"
                >
                  mdi-target-account
                </v-icon>
              </v-avatar>
              <div>
                <div class="text-h5 font-weight-bold">
                  Łowca Lvl {{ warriorStore.slayer.level }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  {{ warriorStore.slayer.completedTasks }} ukończonych zadań
                </div>
              </div>
            </div>
            <v-progress-linear
              :model-value="warriorStore.slayerXpProgress"
              color="deep-purple"
              height="8"
              rounded
              class="mt-2"
            />
            <div class="d-flex justify-space-between text-caption mt-1">
              <span>XP</span>
              <span>{{ warriorStore.slayer.xp }} / {{ warriorStore.slayer.xpToNextLevel }}</span>
            </div>
          </v-col>

          <!-- Slayer Coins -->
          <v-col
            cols="6"
            md="3"
          >
            <div class="stat-box text-center pa-3 rounded">
              <v-icon
                color="amber"
                size="28"
                class="mb-1"
              >
                mdi-currency-usd
              </v-icon>
              <div class="text-h5 font-weight-bold text-amber">
                {{ formatNumber(slayerCoins) }}
              </div>
              <div class="text-caption text-medium-emphasis">
                Monety Łowcy
              </div>
            </div>
          </v-col>

          <!-- Active Bonuses -->
          <v-col
            cols="6"
            md="5"
          >
            <div class="text-subtitle-2 mb-2">
              Aktywne Bonusy
            </div>
            <div class="d-flex flex-wrap gap-1">
              <v-chip
                v-if="warriorStore.slayerBonuses.damageBonus > 0"
                size="small"
                color="error"
                variant="tonal"
              >
                +{{ warriorStore.slayerBonuses.damageBonus }}% Obrażenia
              </v-chip>
              <v-chip
                v-if="warriorStore.effectiveSlayerXpBonus > 0"
                size="small"
                color="primary"
                variant="tonal"
              >
                +{{ warriorStore.effectiveSlayerXpBonus }}% XP
              </v-chip>
              <v-chip
                v-if="warriorStore.effectiveSlayerCoinBonus > 0"
                size="small"
                color="amber"
                variant="tonal"
              >
                +{{ warriorStore.effectiveSlayerCoinBonus }}% Monety
              </v-chip>
              <v-chip
                v-if="warriorStore.slayerBonuses.bonusCoinChance > 0"
                size="small"
                color="success"
                variant="tonal"
              >
                +{{ warriorStore.slayerBonuses.bonusCoinChance }}% Bonus szansa
              </v-chip>
              <span
                v-if="warriorStore.slayerBonuses.damageBonus === 0 &&
                  warriorStore.effectiveSlayerXpBonus === 0 &&
                  warriorStore.effectiveSlayerCoinBonus === 0"
                class="text-caption text-medium-emphasis"
              >
                Brak aktywnych bonusów
              </span>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Current Task Card -->
    <v-card
      v-if="currentTask"
      class="mb-4 current-task-card"
    >
      <v-card-title class="d-flex align-center">
        <v-icon
          class="mr-2"
          :color="currentTaskCategory?.color"
        >
          {{ currentTaskCategory?.icon }}
        </v-icon>
        Aktualne Zadanie
      </v-card-title>
      <v-card-text>
        <v-row align="center">
          <v-col
            cols="12"
            md="6"
          >
            <div class="d-flex align-center mb-3">
              <v-avatar
                size="64"
                :color="currentTaskCategory?.color"
                class="mr-4"
              >
                <v-icon
                  size="36"
                  color="white"
                >
                  {{ currentTaskCategory?.icon }}
                </v-icon>
              </v-avatar>
              <div>
                <div class="text-h6">
                  {{ currentTaskMonster?.name || currentTask.targetMonsterId }}
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  {{ currentTaskCategory?.name }} • {{ currentTaskCategory?.description }}
                </div>
              </div>
            </div>

            <!-- Progress -->
            <v-progress-linear
              :model-value="warriorStore.slayerTaskProgress"
              :color="currentTaskCategory?.color"
              height="20"
              rounded
            >
              <template #default>
                <span class="text-caption font-weight-bold">
                  {{ currentTask.currentCount }} / {{ currentTask.targetCount }}
                </span>
              </template>
            </v-progress-linear>
          </v-col>

          <v-col
            cols="12"
            md="4"
          >
            <div class="text-subtitle-2 mb-2">
              Nagroda
            </div>
            <div class="d-flex align-center mb-1">
              <v-icon
                color="amber"
                size="20"
                class="mr-2"
              >
                mdi-currency-usd
              </v-icon>
              <span class="text-body-1">{{ currentTask.reward.slayerCoins }} Monet</span>
            </div>
            <div class="d-flex align-center">
              <v-icon
                color="primary"
                size="20"
                class="mr-2"
              >
                mdi-star
              </v-icon>
              <span class="text-body-1">{{ currentTask.reward.xp }} XP</span>
            </div>
          </v-col>

          <v-col
            cols="12"
            md="2"
            class="text-center"
          >
            <v-btn
              color="error"
              variant="outlined"
              size="small"
              @click="cancelCurrentTask"
            >
              <v-icon start>
                mdi-close
              </v-icon>
              Anuluj
            </v-btn>
            <div class="text-caption text-error mt-1">
              -10% XP kara
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Tabs -->
    <v-tabs
      v-model="activeTab"
      color="deep-purple"
      class="mb-4"
    >
      <v-tab value="tasks">
        <v-icon start>
          mdi-clipboard-list
        </v-icon>
        Zadania
      </v-tab>
      <v-tab value="shop">
        <v-icon start>
          mdi-store
        </v-icon>
        Giełda Łowców
      </v-tab>
      <v-tab value="stats">
        <v-icon start>
          mdi-chart-bar
        </v-icon>
        Statystyki
      </v-tab>
    </v-tabs>

    <!-- Tasks Tab -->
    <div v-if="activeTab === 'tasks'">
      <!-- Category Filter -->
      <div class="d-flex flex-wrap gap-2 mb-4">
        <v-chip
          :color="selectedCategory === null ? 'deep-purple' : 'default'"
          :variant="selectedCategory === null ? 'flat' : 'outlined'"
          @click="selectedCategory = null"
        >
          Wszystkie
        </v-chip>
        <v-chip
          v-for="cat in categories"
          :key="cat.id"
          :color="selectedCategory === cat.id ? cat.color : 'default'"
          :variant="selectedCategory === cat.id ? 'flat' : 'outlined'"
          @click="selectedCategory = cat.id"
        >
          <v-icon
            start
            size="16"
          >
            {{ cat.icon }}
          </v-icon>
          {{ cat.name }}
        </v-chip>
      </div>

      <!-- Task List -->
      <v-row>
        <v-col
          v-for="task in filteredTasks"
          :key="task.id"
          cols="12"
          md="6"
          lg="4"
        >
          <v-card
            class="task-card"
            :class="{ 'task-locked': warriorStore.stats.level < task.requiredLevel || task.tier > warriorStore.slayerBonuses.maxTaskTier }"
          >
            <v-card-title class="d-flex align-center py-3">
              <v-avatar
                size="40"
                :color="getCategoryInfo(task.category).color"
                class="mr-3"
              >
                <v-icon
                  size="24"
                  color="white"
                >
                  {{ getCategoryInfo(task.category).icon }}
                </v-icon>
              </v-avatar>
              <div class="flex-grow-1">
                <div class="text-body-1 font-weight-medium">
                  {{ task.name }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  Tier {{ task.tier }} • Lvl {{ task.requiredLevel }}+
                </div>
              </div>
              <v-chip
                size="x-small"
                :color="getTierColor(task.tier)"
              >
                T{{ task.tier }}
              </v-chip>
            </v-card-title>

            <v-card-text class="pt-0">
              <div class="text-body-2 text-medium-emphasis mb-3">
                {{ task.description }}
              </div>

              <div class="d-flex justify-space-between text-body-2 mb-1">
                <span class="text-medium-emphasis">Cel</span>
                <span>{{ task.minCount }}-{{ task.maxCount }} potworów</span>
              </div>
              <div class="d-flex justify-space-between text-body-2 mb-1">
                <span class="text-medium-emphasis">Monety</span>
                <span class="text-amber">~{{ task.baseCoins }}</span>
              </div>
              <div class="d-flex justify-space-between text-body-2">
                <span class="text-medium-emphasis">XP</span>
                <span class="text-primary">~{{ task.baseXp }}</span>
              </div>
            </v-card-text>

            <v-card-actions>
              <v-btn
                block
                :color="getCategoryInfo(task.category).color"
                :disabled="currentTask !== null || warriorStore.stats.level < task.requiredLevel || task.tier > warriorStore.slayerBonuses.maxTaskTier"
                @click="selectTask(task)"
              >
                <v-icon
                  v-if="task.tier > warriorStore.slayerBonuses.maxTaskTier"
                  start
                >
                  mdi-lock
                </v-icon>
                <span v-else>Przyjmij zadanie</span>
                <span v-if="task.tier > warriorStore.slayerBonuses.maxTaskTier">
                  Wymaga ulepszenia
                </span>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Shop Tab -->
    <div v-if="activeTab === 'shop'">
      <!-- Shop Category Filter -->
      <div class="d-flex flex-wrap gap-2 mb-4">
        <v-chip
          :color="shopCategory === 'all' ? 'deep-purple' : 'default'"
          :variant="shopCategory === 'all' ? 'flat' : 'outlined'"
          @click="shopCategory = 'all'"
        >
          Wszystko
        </v-chip>
        <v-chip
          :color="shopCategory === 'equipment' ? 'deep-purple' : 'default'"
          :variant="shopCategory === 'equipment' ? 'flat' : 'outlined'"
          @click="shopCategory = 'equipment'"
        >
          <v-icon
            start
            size="16"
          >
            mdi-shield-sword
          </v-icon>
          Ekwipunek
        </v-chip>
        <v-chip
          :color="shopCategory === 'consumable' ? 'deep-purple' : 'default'"
          :variant="shopCategory === 'consumable' ? 'flat' : 'outlined'"
          @click="shopCategory = 'consumable'"
        >
          <v-icon
            start
            size="16"
          >
            mdi-flask
          </v-icon>
          Zużywalne
        </v-chip>
        <v-chip
          :color="shopCategory === 'upgrade' ? 'deep-purple' : 'default'"
          :variant="shopCategory === 'upgrade' ? 'flat' : 'outlined'"
          @click="shopCategory = 'upgrade'"
        >
          <v-icon
            start
            size="16"
          >
            mdi-arrow-up-bold
          </v-icon>
          Ulepszenia
        </v-chip>
      </div>

      <!-- Shop Items -->
      <v-row>
        <v-col
          v-for="item in shopItems"
          :key="item.id"
          cols="12"
          md="6"
          lg="4"
        >
          <v-card
            class="shop-item-card"
            :class="{
              'item-purchased': isItemPurchased(item.id) && item.oneTimePurchase,
              'item-unavailable': !isItemAvailable(item),
            }"
          >
            <v-card-title class="d-flex align-center py-3">
              <v-avatar
                size="44"
                :color="isItemPurchased(item.id) && item.oneTimePurchase ? 'success' : 'deep-purple'"
                class="mr-3"
              >
                <v-icon
                  size="24"
                  color="white"
                >
                  {{ item.icon }}
                </v-icon>
              </v-avatar>
              <div class="flex-grow-1">
                <div class="text-body-1 font-weight-medium">
                  {{ item.name }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  Lvl {{ item.requiredLevel }}+ wymagany
                </div>
              </div>
              <v-chip
                v-if="isItemPurchased(item.id) && item.oneTimePurchase"
                size="small"
                color="success"
              >
                <v-icon size="14">
                  mdi-check
                </v-icon>
              </v-chip>
            </v-card-title>

            <v-card-text class="pt-0">
              <div class="text-body-2 text-medium-emphasis mb-3">
                {{ item.description }}
              </div>

              <v-chip
                size="small"
                :color="item.category === 'equipment' ? 'blue' : item.category === 'consumable' ? 'orange' : 'purple'"
                variant="tonal"
                class="mb-2"
              >
                {{ item.category === 'equipment' ? 'Ekwipunek' : item.category === 'consumable' ? 'Zużywalne' : 'Ulepszenie' }}
              </v-chip>
            </v-card-text>

            <v-card-actions class="px-4 pb-4">
              <div class="d-flex align-center">
                <v-icon
                  color="amber"
                  size="20"
                  class="mr-1"
                >
                  mdi-currency-usd
                </v-icon>
                <span
                  class="text-body-1 font-weight-bold"
                  :class="{ 'text-error': !canAffordItem(item.cost) }"
                >
                  {{ item.cost }}
                </span>
              </div>
              <v-spacer />
              <v-btn
                :color="isItemPurchased(item.id) && item.oneTimePurchase ? 'success' : 'deep-purple'"
                :disabled="!isItemAvailable(item) || !canAffordItem(item.cost)"
                :variant="isItemPurchased(item.id) && item.oneTimePurchase ? 'outlined' : 'flat'"
                @click="purchaseItem(item.id)"
              >
                {{ isItemPurchased(item.id) && item.oneTimePurchase ? 'Zakupiono' : 'Kup' }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Stats Tab -->
    <div v-if="activeTab === 'stats'">
      <v-row>
        <!-- Category Kills -->
        <v-col
          cols="12"
          md="6"
        >
          <v-card>
            <v-card-title>
              <v-icon class="mr-2">
                mdi-skull-crossbones
              </v-icon>
              Zabójstwa wg Kategorii
            </v-card-title>
            <v-card-text>
              <div
                v-for="cat in categories"
                :key="cat.id"
                class="category-stat d-flex align-center pa-3 rounded mb-2"
              >
                <v-avatar
                  size="40"
                  :color="cat.color"
                  class="mr-3"
                >
                  <v-icon
                    size="20"
                    color="white"
                  >
                    {{ cat.icon }}
                  </v-icon>
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="text-body-2 font-weight-medium">
                    {{ cat.name }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    {{ cat.description }}
                  </div>
                </div>
                <div class="text-h6 font-weight-bold">
                  {{ warriorStore.slayer.categoryKills[cat.id] }}
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Summary Stats -->
        <v-col
          cols="12"
          md="6"
        >
          <v-card>
            <v-card-title>
              <v-icon class="mr-2">
                mdi-chart-line
              </v-icon>
              Podsumowanie
            </v-card-title>
            <v-card-text>
              <div class="stat-row d-flex justify-space-between pa-3 rounded mb-2">
                <span class="text-medium-emphasis">Poziom Łowcy</span>
                <span class="text-h6 font-weight-bold">{{ warriorStore.slayer.level }}</span>
              </div>
              <div class="stat-row d-flex justify-space-between pa-3 rounded mb-2">
                <span class="text-medium-emphasis">Ukończone zadania</span>
                <span class="text-h6 font-weight-bold">{{ warriorStore.slayer.completedTasks }}</span>
              </div>
              <div class="stat-row d-flex justify-space-between pa-3 rounded mb-2">
                <span class="text-medium-emphasis">Łączne Monety (historia)</span>
                <span class="text-h6 font-weight-bold text-amber">{{ warriorStore.slayer.totalCoins }}</span>
              </div>
              <div class="stat-row d-flex justify-space-between pa-3 rounded mb-2">
                <span class="text-medium-emphasis">Maks. tier zadań</span>
                <span class="text-h6 font-weight-bold">{{ warriorStore.slayerBonuses.maxTaskTier }}</span>
              </div>
              <div class="stat-row d-flex justify-space-between pa-3 rounded">
                <span class="text-medium-emphasis">Zakupione przedmioty</span>
                <span class="text-h6 font-weight-bold">{{ warriorStore.purchasedSlayerItems.size }}</span>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Task Confirm Dialog -->
    <v-dialog
      v-model="showTaskConfirm"
      max-width="450"
    >
      <v-card v-if="selectedTaskTemplate">
        <v-card-title class="d-flex align-center">
          <v-icon
            class="mr-2"
            :color="getCategoryInfo(selectedTaskTemplate.category).color"
          >
            {{ getCategoryInfo(selectedTaskTemplate.category).icon }}
          </v-icon>
          {{ selectedTaskTemplate.name }}
        </v-card-title>
        <v-card-text>
          <div class="text-body-1 mb-4">
            {{ selectedTaskTemplate.description }}
          </div>
          <v-alert
            type="info"
            variant="tonal"
            density="compact"
            class="mb-3"
          >
            <div class="text-body-2">
              Cel: <strong>{{ selectedTaskTemplate.minCount }}-{{ selectedTaskTemplate.maxCount }}</strong> potworów
            </div>
            <div class="text-body-2">
              Nagroda: ~<strong>{{ selectedTaskTemplate.baseCoins }}</strong> Monet, ~<strong>{{ selectedTaskTemplate.baseXp }}</strong> XP
            </div>
          </v-alert>
          <div class="text-caption text-medium-emphasis">
            Nagroda skaluje się z poziomem Łowcy i liczbą potworów.
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="showTaskConfirm = false"
          >
            Anuluj
          </v-btn>
          <v-btn
            :color="getCategoryInfo(selectedTaskTemplate.category).color"
            variant="flat"
            @click="confirmAcceptTask"
          >
            Przyjmij zadanie
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.stat-box {
  background: rgba(255, 255, 255, 0.03);
}

.current-task-card {
  border: 2px solid rgba(103, 58, 183, 0.3);
  background: linear-gradient(135deg, rgba(103, 58, 183, 0.1) 0%, transparent 100%);
}

.task-card {
  transition: all 0.2s ease;
  height: 100%;
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.task-locked {
  opacity: 0.6;
}

.shop-item-card {
  transition: all 0.2s ease;
  height: 100%;
}

.shop-item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.item-purchased {
  border: 2px solid rgba(76, 175, 80, 0.3);
}

.item-unavailable {
  opacity: 0.6;
}

.category-stat {
  background: rgba(255, 255, 255, 0.03);
}

.stat-row {
  background: rgba(255, 255, 255, 0.03);
}
</style>
