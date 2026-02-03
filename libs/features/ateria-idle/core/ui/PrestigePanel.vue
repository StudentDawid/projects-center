<script setup lang="ts">
/**
 * Prestige Panel - UI for the prestige/legacy system
 */

import { computed, ref } from 'vue';
import { useAteriaPrestigeStore } from '../model/prestige.store';
import {
  LEGACY_UPGRADES,
  PRESTIGE_REQUIREMENTS,
  calculateUpgradeCost,
  getLegacyUpgrade,
  areRequirementsMet,
  type LegacyUpgradeDefinition,
} from '../../data/prestige.data';

const prestigeStore = useAteriaPrestigeStore();

// UI State
const activeTab = ref<'overview' | 'upgrades' | 'gates' | 'stats'>('overview');
const upgradeCategory = ref<'all' | 'universal' | 'warrior' | 'merchant' | 'scientist' | 'special'>('all');
const showPrestigeConfirm = ref(false);

// Computed
const filteredUpgrades = computed(() => {
  if (upgradeCategory.value === 'all') {
    return LEGACY_UPGRADES;
  }
  return LEGACY_UPGRADES.filter(u => u.category === upgradeCategory.value);
});

const categories = [
  { id: 'all', name: 'Wszystkie', icon: 'mdi-view-grid', color: 'primary' },
  { id: 'universal', name: 'Uniwersalne', icon: 'mdi-earth', color: 'blue' },
  { id: 'warrior', name: 'Wojownik', icon: 'mdi-sword', color: 'red' },
  { id: 'merchant', name: 'Kupiec', icon: 'mdi-cart', color: 'amber' },
  { id: 'scientist', name: 'Naukowiec', icon: 'mdi-flask', color: 'green' },
  { id: 'special', name: 'Specjalne', icon: 'mdi-star', color: 'purple' },
];

// Helper functions
function getUpgradeLevel(upgrade: LegacyUpgradeDefinition): number {
  return prestigeStore.getUpgradeLevel(upgrade.id);
}

function getUpgradeCost(upgrade: LegacyUpgradeDefinition): number {
  return calculateUpgradeCost(upgrade, getUpgradeLevel(upgrade));
}

function canPurchase(upgrade: LegacyUpgradeDefinition): boolean {
  const level = getUpgradeLevel(upgrade);
  if (level >= upgrade.maxLevel) return false;
  if (!areRequirementsMet(upgrade, prestigeStore.purchasedUpgrades)) return false;
  return prestigeStore.legacyPoints >= getUpgradeCost(upgrade);
}

function isMaxLevel(upgrade: LegacyUpgradeDefinition): boolean {
  return getUpgradeLevel(upgrade) >= upgrade.maxLevel;
}

function hasRequirements(upgrade: LegacyUpgradeDefinition): boolean {
  return areRequirementsMet(upgrade, prestigeStore.purchasedUpgrades);
}

function getRequirementNames(upgrade: LegacyUpgradeDefinition): string {
  if (!upgrade.requires) return '';
  return upgrade.requires
    .map(id => getLegacyUpgrade(id)?.name || id)
    .join(', ');
}

function getCategoryColor(category: string): string {
  const cat = categories.find(c => c.id === category);
  return cat?.color || 'grey';
}

// Actions
function purchaseUpgrade(upgradeId: string) {
  prestigeStore.purchaseUpgrade(upgradeId);
}

function confirmPrestige() {
  showPrestigeConfirm.value = true;
}

function executePrestige() {
  prestigeStore.performPrestige();
  showPrestigeConfirm.value = false;
}
</script>

<template>
  <div class="prestige-panel">
    <!-- Header with LP and Prestige Count -->
    <v-card class="mb-4">
      <v-card-text>
        <v-row align="center">
          <!-- Legacy Points -->
          <v-col
            cols="12"
            md="4"
          >
            <div class="d-flex align-center">
              <v-avatar
                color="purple"
                size="64"
                class="mr-4"
              >
                <v-icon
                  size="36"
                  color="white"
                >
                  mdi-star-circle
                </v-icon>
              </v-avatar>
              <div>
                <div class="text-h4 font-weight-bold text-purple">
                  {{ prestigeStore.legacyPoints }}
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  Punkty Legacy (LP)
                </div>
                <div class="text-caption text-medium-emphasis">
                  Łącznie zdobyto: {{ prestigeStore.totalLPEarned }}
                </div>
              </div>
            </div>
          </v-col>

          <!-- Prestige Count -->
          <v-col
            cols="6"
            md="3"
          >
            <div class="stat-box text-center pa-3 rounded">
              <v-icon
                color="amber"
                size="32"
                class="mb-1"
              >
                mdi-refresh
              </v-icon>
              <div class="text-h5 font-weight-bold text-amber">
                {{ prestigeStore.prestigeCount }}
              </div>
              <div class="text-caption text-medium-emphasis">
                Prestiży
              </div>
            </div>
          </v-col>

          <!-- Total Upgrade Levels -->
          <v-col
            cols="6"
            md="2"
          >
            <div class="stat-box text-center pa-3 rounded">
              <v-icon
                color="success"
                size="28"
                class="mb-1"
              >
                mdi-arrow-up-bold
              </v-icon>
              <div class="text-h6 font-weight-bold">
                {{ prestigeStore.totalUpgradeLevel }}
              </div>
              <div class="text-caption text-medium-emphasis">
                Poziomów ulepszeń
              </div>
            </div>
          </v-col>

          <!-- Prestige Button -->
          <v-col
            cols="12"
            md="3"
          >
            <v-btn
              block
              size="large"
              :color="prestigeStore.canPrestige ? 'purple' : 'grey'"
              :disabled="!prestigeStore.canPrestige"
              @click="confirmPrestige"
            >
              <v-icon start>
                mdi-star-circle
              </v-icon>
              Prestiż
              <v-chip
                v-if="prestigeStore.canPrestige"
                size="x-small"
                color="white"
                class="ml-2"
              >
                +{{ prestigeStore.estimatedLP.totalLP }} LP
              </v-chip>
            </v-btn>
            <div
              v-if="!prestigeStore.canPrestige"
              class="text-caption text-center text-medium-emphasis mt-1"
            >
              {{ PRESTIGE_REQUIREMENTS.description }}
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Prestige Progress -->
    <v-card
      v-if="!prestigeStore.canPrestige"
      class="mb-4"
    >
      <v-card-title>
        <v-icon
          class="mr-2"
          color="warning"
        >
          mdi-progress-clock
        </v-icon>
        Wymagania do Prestiżu
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col
            cols="12"
            md="4"
          >
            <div class="requirement-item pa-3 rounded">
              <div class="d-flex justify-space-between mb-1">
                <span class="text-body-2">Poziom Wojownika</span>
                <span
                  :class="prestigeStore.prestigeProgress.warriorLevel.met ? 'text-success' : 'text-warning'"
                >
                  {{ prestigeStore.prestigeProgress.warriorLevel.current }} / {{ prestigeStore.prestigeProgress.warriorLevel.required }}
                </span>
              </div>
              <v-progress-linear
                :model-value="(prestigeStore.prestigeProgress.warriorLevel.current / prestigeStore.prestigeProgress.warriorLevel.required) * 100"
                :color="prestigeStore.prestigeProgress.warriorLevel.met ? 'success' : 'warning'"
                height="8"
                rounded
              />
            </div>
          </v-col>
          <v-col
            cols="12"
            md="4"
          >
            <div class="requirement-item pa-3 rounded">
              <div class="d-flex justify-space-between mb-1">
                <span class="text-body-2">Suma poziomów</span>
                <span
                  :class="prestigeStore.prestigeProgress.totalLevel.met ? 'text-success' : 'text-warning'"
                >
                  {{ prestigeStore.prestigeProgress.totalLevel.current }} / {{ prestigeStore.prestigeProgress.totalLevel.required }}
                </span>
              </div>
              <v-progress-linear
                :model-value="(prestigeStore.prestigeProgress.totalLevel.current / prestigeStore.prestigeProgress.totalLevel.required) * 100"
                :color="prestigeStore.prestigeProgress.totalLevel.met ? 'success' : 'warning'"
                height="8"
                rounded
              />
            </div>
          </v-col>
          <v-col
            cols="12"
            md="4"
          >
            <div class="requirement-item pa-3 rounded">
              <div class="d-flex justify-space-between mb-1">
                <span class="text-body-2">Osiągnięcia</span>
                <span
                  :class="prestigeStore.prestigeProgress.achievements.met ? 'text-success' : 'text-warning'"
                >
                  {{ prestigeStore.prestigeProgress.achievements.current }} / {{ prestigeStore.prestigeProgress.achievements.required }}
                </span>
              </div>
              <v-progress-linear
                :model-value="(prestigeStore.prestigeProgress.achievements.current / prestigeStore.prestigeProgress.achievements.required) * 100"
                :color="prestigeStore.prestigeProgress.achievements.met ? 'success' : 'warning'"
                height="8"
                rounded
              />
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Tabs -->
    <v-tabs
      v-model="activeTab"
      color="purple"
      class="mb-4"
    >
      <v-tab value="overview">
        <v-icon start>
          mdi-view-dashboard
        </v-icon>
        Przegląd
      </v-tab>
      <v-tab value="upgrades">
        <v-icon start>
          mdi-arrow-up-bold-circle
        </v-icon>
        Ulepszenia
      </v-tab>
      <v-tab value="gates">
        <v-icon start>
          mdi-gate
        </v-icon>
        Bramy Prestiżu
      </v-tab>
      <v-tab value="stats">
        <v-icon start>
          mdi-chart-bar
        </v-icon>
        Statystyki
      </v-tab>
    </v-tabs>

    <!-- Overview Tab -->
    <div v-if="activeTab === 'overview'">
      <!-- LP Breakdown -->
      <v-card class="mb-4">
        <v-card-title>
          <v-icon
            class="mr-2"
            color="info"
          >
            mdi-calculator
          </v-icon>
          Szacowane LP z Prestiżu
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col
              cols="6"
              md="2"
            >
              <div class="lp-item text-center pa-2 rounded">
                <div class="text-h6 font-weight-bold text-red">
                  +{{ prestigeStore.estimatedLP.warriorBonus }}
                </div>
                <div class="text-caption">
                  Wojownik
                </div>
              </div>
            </v-col>
            <v-col
              cols="6"
              md="2"
            >
              <div class="lp-item text-center pa-2 rounded">
                <div class="text-h6 font-weight-bold text-amber">
                  +{{ prestigeStore.estimatedLP.merchantBonus }}
                </div>
                <div class="text-caption">
                  Kupiec
                </div>
              </div>
            </v-col>
            <v-col
              cols="6"
              md="2"
            >
              <div class="lp-item text-center pa-2 rounded">
                <div class="text-h6 font-weight-bold text-green">
                  +{{ prestigeStore.estimatedLP.scientistBonus }}
                </div>
                <div class="text-caption">
                  Naukowiec
                </div>
              </div>
            </v-col>
            <v-col
              cols="6"
              md="2"
            >
              <div class="lp-item text-center pa-2 rounded">
                <div class="text-h6 font-weight-bold text-purple">
                  +{{ prestigeStore.estimatedLP.slayerBonus }}
                </div>
                <div class="text-caption">
                  Łowca
                </div>
              </div>
            </v-col>
            <v-col
              cols="6"
              md="2"
            >
              <div class="lp-item text-center pa-2 rounded">
                <div class="text-h6 font-weight-bold text-orange">
                  +{{ prestigeStore.estimatedLP.dungeonBonus }}
                </div>
                <div class="text-caption">
                  Lochy
                </div>
              </div>
            </v-col>
            <v-col
              cols="6"
              md="2"
            >
              <div class="lp-item text-center pa-2 rounded">
                <div class="text-h6 font-weight-bold text-blue">
                  +{{ prestigeStore.estimatedLP.achievementBonus }}
                </div>
                <div class="text-caption">
                  Osiągnięcia
                </div>
              </div>
            </v-col>
          </v-row>
          <v-divider class="my-3" />
          <div class="text-center">
            <div class="text-h4 font-weight-bold text-purple">
              = {{ prestigeStore.estimatedLP.totalLP }} LP
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Active Bonuses Summary -->
      <v-card>
        <v-card-title>
          <v-icon
            class="mr-2"
            color="success"
          >
            mdi-check-decagram
          </v-icon>
          Aktywne Bonusy Legacy
        </v-card-title>
        <v-card-text>
          <v-row dense>
            <v-col
              v-if="prestigeStore.activeBonuses.xpMultiplier > 1"
              cols="6"
              md="4"
            >
              <v-chip
                color="blue"
                variant="tonal"
              >
                <v-icon start>
                  mdi-book
                </v-icon>
                +{{ Math.round((prestigeStore.activeBonuses.xpMultiplier - 1) * 100) }}% XP
              </v-chip>
            </v-col>
            <v-col
              v-if="prestigeStore.activeBonuses.goldMultiplier > 1"
              cols="6"
              md="4"
            >
              <v-chip
                color="amber"
                variant="tonal"
              >
                <v-icon start>
                  mdi-gold
                </v-icon>
                +{{ Math.round((prestigeStore.activeBonuses.goldMultiplier - 1) * 100) }}% Złoto
              </v-chip>
            </v-col>
            <v-col
              v-if="prestigeStore.activeBonuses.startingGold > 0"
              cols="6"
              md="4"
            >
              <v-chip
                color="amber"
                variant="tonal"
              >
                <v-icon start>
                  mdi-safe
                </v-icon>
                +{{ prestigeStore.activeBonuses.startingGold }} Startowe złoto
              </v-chip>
            </v-col>
            <v-col
              v-if="prestigeStore.activeBonuses.warriorDamageBonus > 0"
              cols="6"
              md="4"
            >
              <v-chip
                color="red"
                variant="tonal"
              >
                <v-icon start>
                  mdi-sword
                </v-icon>
                +{{ Math.round(prestigeStore.activeBonuses.warriorDamageBonus * 100) }}% Obrażenia
              </v-chip>
            </v-col>
            <v-col
              v-if="prestigeStore.activeBonuses.offlineProgressBonus > 0"
              cols="6"
              md="4"
            >
              <v-chip
                color="purple"
                variant="tonal"
              >
                <v-icon start>
                  mdi-sleep
                </v-icon>
                +{{ Math.round(prestigeStore.activeBonuses.offlineProgressBonus * 100) }}% Offline
              </v-chip>
            </v-col>
            <v-col
              v-if="prestigeStore.activeBonuses.autoCombatUnlocked"
              cols="6"
              md="4"
            >
              <v-chip
                color="success"
                variant="tonal"
              >
                <v-icon start>
                  mdi-robot
                </v-icon>
                Auto-walka od Lvl 1
              </v-chip>
            </v-col>
          </v-row>
          <div
            v-if="prestigeStore.totalUpgradeLevel === 0"
            class="text-center text-medium-emphasis py-4"
          >
            Brak aktywnych bonusów - kup ulepszenia za Punkty Legacy!
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Upgrades Tab -->
    <div v-if="activeTab === 'upgrades'">
      <!-- Category Filter -->
      <div class="d-flex flex-wrap gap-2 mb-4">
        <v-chip
          v-for="cat in categories"
          :key="cat.id"
          :color="upgradeCategory === cat.id ? cat.color : 'default'"
          :variant="upgradeCategory === cat.id ? 'flat' : 'outlined'"
          @click="upgradeCategory = cat.id as any"
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

      <!-- Upgrades Grid -->
      <v-row>
        <v-col
          v-for="upgrade in filteredUpgrades"
          :key="upgrade.id"
          cols="12"
          md="6"
          lg="4"
        >
          <v-card
            class="upgrade-card"
            :class="{
              'upgrade-maxed': isMaxLevel(upgrade),
              'upgrade-locked': !hasRequirements(upgrade),
            }"
          >
            <v-card-text class="pa-3">
              <div class="d-flex align-center mb-2">
                <v-avatar
                  size="44"
                  :color="isMaxLevel(upgrade) ? 'success' : getCategoryColor(upgrade.category)"
                  class="mr-3"
                >
                  <v-icon
                    size="24"
                    color="white"
                  >
                    {{ upgrade.icon }}
                  </v-icon>
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="text-body-1 font-weight-medium">
                    {{ upgrade.name }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    Lvl {{ getUpgradeLevel(upgrade) }} / {{ upgrade.maxLevel }}
                  </div>
                </div>
                <v-chip
                  v-if="isMaxLevel(upgrade)"
                  size="small"
                  color="success"
                >
                  MAX
                </v-chip>
              </div>

              <div class="text-body-2 text-medium-emphasis mb-2">
                {{ upgrade.description }}
              </div>

              <!-- Requirements -->
              <div
                v-if="upgrade.requires && !hasRequirements(upgrade)"
                class="text-caption text-error mb-2"
              >
                <v-icon
                  size="14"
                  class="mr-1"
                >
                  mdi-lock
                </v-icon>
                Wymaga: {{ getRequirementNames(upgrade) }}
              </div>

              <!-- Progress bar -->
              <v-progress-linear
                :model-value="(getUpgradeLevel(upgrade) / upgrade.maxLevel) * 100"
                :color="getCategoryColor(upgrade.category)"
                height="4"
                rounded
                class="mb-2"
              />

              <!-- Purchase button -->
              <v-btn
                v-if="!isMaxLevel(upgrade)"
                block
                :color="canPurchase(upgrade) ? getCategoryColor(upgrade.category) : 'grey'"
                :disabled="!canPurchase(upgrade)"
                size="small"
                @click="purchaseUpgrade(upgrade.id)"
              >
                <v-icon
                  start
                  size="16"
                >
                  mdi-star-circle
                </v-icon>
                {{ getUpgradeCost(upgrade) }} LP
              </v-btn>
              <v-btn
                v-else
                block
                color="success"
                variant="tonal"
                size="small"
                disabled
              >
                <v-icon start>
                  mdi-check
                </v-icon>
                Maksymalny poziom
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Gates Tab -->
    <div v-if="activeTab === 'gates'">
      <v-row>
        <v-col
          v-for="gate in prestigeStore.gatesProgress"
          :key="gate.id"
          cols="12"
          md="6"
        >
          <v-card
            class="gate-card"
            :class="{ 'gate-complete': gate.isComplete }"
          >
            <v-card-text class="pa-4">
              <div class="d-flex align-center mb-3">
                <v-avatar
                  size="56"
                  :color="gate.isComplete ? 'success' : gate.color"
                  class="mr-4"
                >
                  <v-icon
                    size="32"
                    color="white"
                  >
                    {{ gate.isComplete ? 'mdi-check' : gate.icon }}
                  </v-icon>
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="text-h6">
                    {{ gate.name }}
                  </div>
                  <div class="text-body-2 text-medium-emphasis">
                    {{ gate.description }}
                  </div>
                </div>
              </div>

              <div class="text-body-2 mb-2">
                {{ gate.requirements.description }}
              </div>

              <v-progress-linear
                :model-value="gate.progress * 100"
                :color="gate.isComplete ? 'success' : gate.color"
                height="12"
                rounded
              >
                <template #default>
                  <span class="text-caption font-weight-bold">
                    {{ Math.round(gate.progress * 100) }}%
                  </span>
                </template>
              </v-progress-linear>

              <div class="d-flex justify-space-between mt-3">
                <div>
                  <v-chip
                    size="small"
                    :color="gate.isComplete ? 'success' : 'purple'"
                    variant="tonal"
                  >
                    <v-icon
                      start
                      size="14"
                    >
                      mdi-star-circle
                    </v-icon>
                    +{{ gate.reward.lp }} LP
                  </v-chip>
                </div>
                <div v-if="gate.reward.title">
                  <v-chip
                    size="small"
                    color="amber"
                    variant="tonal"
                  >
                    <v-icon
                      start
                      size="14"
                    >
                      mdi-tag
                    </v-icon>
                    Tytuł: {{ gate.reward.title }}
                  </v-chip>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Stats Tab -->
    <div v-if="activeTab === 'stats'">
      <v-row>
        <v-col
          cols="12"
          md="6"
        >
          <v-card>
            <v-card-title>
              <v-icon
                class="mr-2"
                color="purple"
              >
                mdi-chart-line
              </v-icon>
              Statystyki Prestiżu
            </v-card-title>
            <v-card-text>
              <div class="stat-row d-flex justify-space-between pa-3 rounded mb-2">
                <span class="text-medium-emphasis">Liczba prestiży</span>
                <span class="text-h6 font-weight-bold">{{ prestigeStore.prestigeCount }}</span>
              </div>
              <div class="stat-row d-flex justify-space-between pa-3 rounded mb-2">
                <span class="text-medium-emphasis">Łącznie zdobyte LP</span>
                <span class="text-h6 font-weight-bold text-purple">{{ prestigeStore.totalLPEarned }}</span>
              </div>
              <div class="stat-row d-flex justify-space-between pa-3 rounded mb-2">
                <span class="text-medium-emphasis">Najwyższe LP z jednego prestiżu</span>
                <span class="text-h6 font-weight-bold">{{ prestigeStore.prestigeStats.highestLPSinglePrestige }}</span>
              </div>
              <div class="stat-row d-flex justify-space-between pa-3 rounded">
                <span class="text-medium-emphasis">Ukończone bramy</span>
                <span class="text-h6 font-weight-bold">{{ prestigeStore.completedGates.size }} / 4</span>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col
          cols="12"
          md="6"
        >
          <v-card>
            <v-card-title>
              <v-icon
                class="mr-2"
                color="amber"
              >
                mdi-tag-multiple
              </v-icon>
              Odblokowane Tytuły
            </v-card-title>
            <v-card-text>
              <div
                v-if="prestigeStore.unlockedTitles.length === 0"
                class="text-center text-medium-emphasis py-4"
              >
                Brak odblokowanych tytułów
              </div>
              <div
                v-for="title in prestigeStore.unlockedTitles"
                :key="title"
                class="title-item d-flex align-center pa-2 rounded mb-2"
                :class="{ 'title-active': prestigeStore.activeTitle === title }"
                @click="prestigeStore.setActiveTitle(prestigeStore.activeTitle === title ? null : title)"
              >
                <v-icon
                  :color="prestigeStore.activeTitle === title ? 'amber' : 'grey'"
                  class="mr-2"
                >
                  {{ prestigeStore.activeTitle === title ? 'mdi-star' : 'mdi-star-outline' }}
                </v-icon>
                <span>{{ title }}</span>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Prestige Confirmation Dialog -->
    <v-dialog
      v-model="showPrestigeConfirm"
      max-width="500"
    >
      <v-card>
        <v-card-title class="d-flex align-center bg-purple">
          <v-icon
            class="mr-2"
            color="white"
          >
            mdi-star-circle
          </v-icon>
          <span class="text-white">Potwierdzenie Prestiżu</span>
        </v-card-title>

        <v-card-text class="pt-4">
          <v-alert
            type="warning"
            variant="tonal"
            class="mb-4"
          >
            <strong>Uwaga!</strong> Prestiż zresetuje cały postęp gry (poziomy, zasoby, osiągnięcia).
            Zachowane zostaną tylko ulepszenia Legacy.
          </v-alert>

          <div class="text-h5 text-center mb-4">
            Otrzymasz:
            <span class="text-purple font-weight-bold">{{ prestigeStore.estimatedLP.totalLP }} LP</span>
          </div>

          <div class="text-body-2 text-center text-medium-emphasis">
            Użyj Punktów Legacy na ulepszenia, które przyspieszą kolejne rozgrywki!
          </div>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-btn
            variant="text"
            @click="showPrestigeConfirm = false"
          >
            Anuluj
          </v-btn>
          <v-spacer />
          <v-btn
            color="purple"
            variant="flat"
            @click="executePrestige"
          >
            <v-icon start>
              mdi-star-circle
            </v-icon>
            Wykonaj Prestiż
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

.requirement-item {
  background: rgba(255, 255, 255, 0.03);
}

.lp-item {
  background: rgba(255, 255, 255, 0.03);
}

.upgrade-card {
  transition: all 0.2s ease;
  height: 100%;
}

.upgrade-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.upgrade-maxed {
  border: 2px solid rgba(76, 175, 80, 0.3);
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, transparent 100%);
}

.upgrade-locked {
  opacity: 0.6;
}

.gate-card {
  transition: all 0.2s ease;
}

.gate-complete {
  border: 2px solid rgba(76, 175, 80, 0.3);
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, transparent 100%);
}

.stat-row {
  background: rgba(255, 255, 255, 0.03);
}

.title-item {
  background: rgba(255, 255, 255, 0.03);
  cursor: pointer;
  transition: all 0.2s ease;
}

.title-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.title-active {
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
}
</style>
