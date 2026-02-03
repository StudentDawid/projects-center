<script setup lang="ts">
/**
 * Warrior Panel - main UI for the Warrior path
 */

import { computed, ref } from 'vue';
import { useAteriaWarriorStore } from '../model/warrior.store';
import { useAteriaResourcesStore } from '../../core/model/resources.store';
import { useAteriaScientistStore } from '../../scientist/model/scientist.store';
import { formatNumber } from '@libs/shared/lib/big-number';
import type { BiomeId, SlayerCategory } from '@libs/entities/ateria-idle/warrior';
import { getPotion } from '../../data/scientist.data';

const warriorStore = useAteriaWarriorStore();
const resourcesStore = useAteriaResourcesStore();
const scientistStore = useAteriaScientistStore();

// UI State
const showBiomeSelector = ref(false);
const showPotionDialog = ref(false);

// Computed
const stats = computed(() => warriorStore.effectiveStats);

// Monster icon based on slayer category
function getMonsterIcon(category?: SlayerCategory): string {
  const icons: Record<SlayerCategory, string> = {
    beast: 'mdi-paw',
    undead: 'mdi-skull',
    demon: 'mdi-fire',
    elemental: 'mdi-atom',
    dragon: 'mdi-dragon',
    aberration: 'mdi-alien',
  };
  return icons[category || 'beast'] || 'mdi-skull';
}

function getMonsterColor(category?: SlayerCategory): string {
  const colors: Record<SlayerCategory, string> = {
    beast: '#8D6E63',
    undead: '#78909C',
    demon: '#E53935',
    elemental: '#7E57C2',
    dragon: '#FF8F00',
    aberration: '#26A69A',
  };
  return colors[category || 'beast'] || '#757575';
}

const combatStatusText = computed(() => {
  switch (warriorStore.combatState) {
    case 'idle':
      return 'Bezczynny';
    case 'fighting':
      return 'W walce';
    case 'recovering':
      return `Rekonwalescencja (${warriorStore.recoveryTimeRemaining}s)`;
    case 'dead':
      return 'Poległ';
    default:
      return 'Nieznany';
  }
});

const combatStatusColor = computed(() => {
  switch (warriorStore.combatState) {
    case 'idle':
      return 'grey';
    case 'fighting':
      return 'error';
    case 'recovering':
      return 'warning';
    case 'dead':
      return 'error';
    default:
      return 'grey';
  }
});

// Available potions from Scientist
const availablePotions = computed(() => {
  return scientistStore.getAvailableCombatPotions();
});

// Combat potions (allocated to warrior)
const combatPotionsList = computed(() => {
  const result: { potionId: string; amount: number; name: string; icon: string; description: string }[] = [];
  for (const [potionId, amount] of warriorStore.combatPotions.entries()) {
    if (amount <= 0) continue;
    const potion = getPotion(potionId);
    if (!potion) continue;
    result.push({
      potionId,
      amount,
      name: potion.name,
      icon: potion.icon,
      description: potion.description,
    });
  }
  return result;
});

// Active buffs display
const activeBuffs = computed(() => {
  return warriorStore.activePotionEffects.map(effect => {
    const potion = getPotion(effect.potionId);
    return {
      ...effect,
      name: potion?.name || effect.potionId,
      icon: potion?.icon || 'mdi-flask',
      remainingSeconds: Math.ceil(effect.remainingTicks / 10),
    };
  });
});

// Environmental effect mitigation potion
const mitigationPotionId = computed(() => {
  const effect = warriorStore.currentEnvironmentalEffect;
  if (!effect?.mitigation?.potionId) return null;
  return effect.mitigation.potionId;
});

const hasMitigationPotion = computed(() => {
  const potionId = mitigationPotionId.value;
  if (!potionId) return false;
  return (warriorStore.combatPotions.get(potionId) || 0) > 0;
});

// Actions
function toggleAutoCombat() {
  warriorStore.autoCombatEnabled = !warriorStore.autoCombatEnabled;
  if (warriorStore.autoCombatEnabled && warriorStore.combatState === 'idle') {
    warriorStore.startCombat();
  }
}

function selectMonster(monsterId: string) {
  warriorStore.selectedMonster = monsterId;
  if (warriorStore.combatState === 'idle') {
    warriorStore.startCombat(monsterId);
  }
}

function allocatePotion(potionId: string, amount: number = 1) {
  const allocated = scientistStore.allocatePotionToWarrior(potionId, amount);
  if (allocated > 0) {
    warriorStore.addCombatPotion(potionId, allocated);
  }
}

function allocateAllPotions(potionId: string) {
  const available = scientistStore.getPotionCount(potionId);
  if (available > 0) {
    allocatePotion(potionId, available);
  }
}

function usePotion(potionId: string) {
  warriorStore.usePotion(potionId);
}

function useMitigationPotion() {
  const potionId = mitigationPotionId.value;
  if (potionId) {
    usePotion(potionId);
  }
}
</script>

<template>
  <div class="warrior-panel">
    <v-row>
      <!-- Left Column: Stats -->
      <v-col
        cols="12"
        md="4"
      >
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">
              mdi-sword
            </v-icon>
            Wojownik
            <v-chip
              class="ml-2"
              size="small"
              color="primary"
            >
              Lvl {{ warriorStore.stats.level }}
            </v-chip>
          </v-card-title>

          <v-card-text>
            <!-- XP Progress -->
            <div class="mb-4">
              <div class="d-flex justify-space-between text-caption mb-1">
                <span>Doświadczenie</span>
                <span>{{ formatNumber(warriorStore.stats.xp) }} / {{ formatNumber(warriorStore.stats.xpToNextLevel) }}</span>
              </div>
              <v-progress-linear
                :model-value="warriorStore.xpProgress * 100"
                color="primary"
                height="8"
                rounded
              />
            </div>

            <!-- HP Bar -->
            <div class="mb-4">
              <div class="d-flex justify-space-between text-caption mb-1">
                <span>Zdrowie</span>
                <span>{{ warriorStore.stats.currentHp }} / {{ stats.maxHp }}</span>
              </div>
              <v-progress-linear
                :model-value="warriorStore.hpPercent"
                :color="warriorStore.hpPercent > 50 ? 'success' : warriorStore.hpPercent > 25 ? 'warning' : 'error'"
                height="12"
                rounded
              >
                <template #default>
                  <span class="text-caption font-weight-bold">
                    {{ Math.floor(warriorStore.hpPercent) }}%
                  </span>
                </template>
              </v-progress-linear>
            </div>

            <!-- Stats Grid -->
            <v-divider class="mb-3" />
            <div class="text-subtitle-2 mb-2">
              Statystyki
            </div>

            <v-row
              dense
              class="text-body-2"
            >
              <v-col cols="6">
                <div class="d-flex justify-space-between">
                  <span class="text-medium-emphasis">Atak</span>
                  <span class="font-weight-medium">{{ stats.attack }}</span>
                </div>
              </v-col>
              <v-col cols="6">
                <div class="d-flex justify-space-between">
                  <span class="text-medium-emphasis">Obrona</span>
                  <span class="font-weight-medium">{{ stats.defense }}</span>
                </div>
              </v-col>
              <v-col cols="6">
                <div class="d-flex justify-space-between">
                  <span class="text-medium-emphasis">Celność</span>
                  <span class="font-weight-medium">{{ stats.accuracy }}</span>
                </div>
              </v-col>
              <v-col cols="6">
                <div class="d-flex justify-space-between">
                  <span class="text-medium-emphasis">Unik</span>
                  <span class="font-weight-medium">{{ stats.evasion }}</span>
                </div>
              </v-col>
              <v-col cols="6">
                <div class="d-flex justify-space-between">
                  <span class="text-medium-emphasis">Kryt. szansa</span>
                  <span class="font-weight-medium">{{ (stats.critChance * 100).toFixed(1) }}%</span>
                </div>
              </v-col>
              <v-col cols="6">
                <div class="d-flex justify-space-between">
                  <span class="text-medium-emphasis">Redukcja obr.</span>
                  <span class="font-weight-medium">{{ (stats.damageReduction * 100).toFixed(1) }}%</span>
                </div>
              </v-col>
            </v-row>

            <!-- Session Stats -->
            <v-divider class="my-3" />
            <div class="text-subtitle-2 mb-2">
              Sesja
            </div>
            <div class="d-flex justify-space-between text-body-2">
              <span class="text-medium-emphasis">Zabójstwa</span>
              <span class="font-weight-medium">{{ warriorStore.sessionKills }}</span>
            </div>
            <div class="d-flex justify-space-between text-body-2">
              <span class="text-medium-emphasis">Zdobyte XP</span>
              <span class="font-weight-medium">{{ formatNumber(warriorStore.sessionXpGained) }}</span>
            </div>
            <div class="d-flex justify-space-between text-body-2">
              <span class="text-medium-emphasis">Zdobyte złoto</span>
              <span class="font-weight-medium">{{ formatNumber(warriorStore.sessionGoldGained) }}</span>
            </div>

            <!-- Active Buffs Display -->
            <v-divider
              v-if="activeBuffs.length > 0"
              class="my-3"
            />
            <div
              v-if="activeBuffs.length > 0"
              class="active-buffs"
            >
              <div class="text-subtitle-2 mb-2">
                <v-icon
                  size="16"
                  class="mr-1"
                >
                  mdi-flask-round-bottom
                </v-icon>
                Aktywne efekty
              </div>
              <div class="d-flex flex-wrap gap-1">
                <v-chip
                  v-for="buff in activeBuffs"
                  :key="buff.potionId"
                  size="small"
                  color="primary"
                  variant="tonal"
                >
                  <v-icon
                    start
                    size="14"
                  >
                    {{ buff.icon }}
                  </v-icon>
                  {{ buff.name }}
                  <template #append>
                    <span class="ml-1 text-caption">({{ buff.remainingSeconds }}s)</span>
                  </template>
                </v-chip>
              </div>
            </div>

            <!-- Bonus Indicators -->
            <div
              v-if="stats.xpBonusPercent > 0 || stats.goldBonusPercent > 0"
              class="bonus-indicators mt-2"
            >
              <v-chip
                v-if="stats.xpBonusPercent > 0"
                size="x-small"
                color="amber"
                variant="tonal"
                class="mr-1"
              >
                <v-icon
                  start
                  size="12"
                >
                  mdi-star
                </v-icon>
                +{{ stats.xpBonusPercent }}% XP
              </v-chip>
              <v-chip
                v-if="stats.goldBonusPercent > 0"
                size="x-small"
                color="amber-darken-2"
                variant="tonal"
              >
                <v-icon
                  start
                  size="12"
                >
                  mdi-currency-usd
                </v-icon>
                +{{ stats.goldBonusPercent }}% Złoto
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Middle Column: Combat -->
      <v-col
        cols="12"
        md="4"
      >
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">
              mdi-sword-cross
            </v-icon>
            Walka
            <v-chip
              class="ml-2"
              size="small"
              :color="combatStatusColor"
            >
              {{ combatStatusText }}
            </v-chip>
          </v-card-title>

          <v-card-text>
            <!-- Combat View -->
            <div
              v-if="warriorStore.currentEnemy"
              class="combat-view"
            >
              <!-- Enemy -->
              <div class="enemy-section text-center mb-4">
                <v-avatar
                  size="80"
                  color="error"
                  class="mb-2"
                >
                  <v-icon size="48">
                    mdi-skull
                  </v-icon>
                </v-avatar>
                <div class="text-h6">
                  {{ warriorStore.currentEnemy.name }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  Poziom {{ warriorStore.currentEnemy.level }}
                </div>

                <!-- Enemy HP -->
                <div class="mt-2">
                  <v-progress-linear
                    :model-value="warriorStore.enemyHpPercent"
                    color="error"
                    height="16"
                    rounded
                  >
                    <template #default>
                      <span class="text-caption font-weight-bold">
                        {{ warriorStore.currentEnemy.currentHp }} / {{ warriorStore.currentEnemy.maxHp }}
                      </span>
                    </template>
                  </v-progress-linear>
                </div>
              </div>

              <!-- VS Divider -->
              <div class="text-center my-4">
                <v-icon
                  size="32"
                  color="warning"
                >
                  mdi-sword-cross
                </v-icon>
              </div>

              <!-- Player HP (compact) -->
              <div class="player-section">
                <div class="d-flex justify-space-between text-caption mb-1">
                  <span>Twoje HP</span>
                  <span>{{ warriorStore.stats.currentHp }} / {{ stats.maxHp }}</span>
                </div>
                <v-progress-linear
                  :model-value="warriorStore.hpPercent"
                  :color="warriorStore.hpPercent > 50 ? 'success' : warriorStore.hpPercent > 25 ? 'warning' : 'error'"
                  height="12"
                  rounded
                />
              </div>
            </div>

            <!-- Idle State -->
            <div
              v-else-if="warriorStore.combatState === 'idle'"
              class="text-center py-8"
            >
              <v-icon
                size="64"
                class="text-medium-emphasis mb-4"
              >
                mdi-sleep
              </v-icon>
              <div class="text-body-1 text-medium-emphasis">
                Wojownik odpoczywa
              </div>
              <div class="text-caption text-medium-emphasis mb-4">
                Wybierz potwora, aby rozpocząć walkę
              </div>
              <v-btn
                color="primary"
                :disabled="!warriorStore.availableMonsters.length"
                @click="warriorStore.startCombat()"
              >
                <v-icon start>
                  mdi-sword
                </v-icon>
                Rozpocznij walkę
              </v-btn>
            </div>

            <!-- Recovering State -->
            <div
              v-else-if="warriorStore.combatState === 'recovering'"
              class="text-center py-8"
            >
              <v-progress-circular
                indeterminate
                color="warning"
                size="64"
                class="mb-4"
              />
              <div class="text-body-1">
                Rekonwalescencja
              </div>
              <div class="text-h4 font-weight-bold text-warning">
                {{ warriorStore.recoveryTimeRemaining }}s
              </div>
            </div>

            <!-- Auto Combat Toggle -->
            <v-divider class="my-4" />
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-body-2 font-weight-medium">
                  Auto-walka
                </div>
                <div class="text-caption text-medium-emphasis">
                  Automatycznie atakuj kolejne potwory
                </div>
              </div>
              <v-switch
                :model-value="warriorStore.autoCombatEnabled"
                color="primary"
                hide-details
                @update:model-value="toggleAutoCombat"
              />
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Right Column: Biome & Monster Selection -->
      <v-col
        cols="12"
        md="4"
      >
        <!-- Biome Selector Card -->
        <v-card class="mb-4 biome-card">
          <v-card-title class="d-flex align-center py-3">
            <div
              class="biome-icon-wrapper mr-3"
              :style="{ backgroundColor: warriorStore.currentBiomeData?.color + '20' }"
            >
              <v-icon
                size="24"
                :color="warriorStore.currentBiomeData?.color"
              >
                {{ warriorStore.currentBiomeData?.icon || 'mdi-map-marker' }}
              </v-icon>
            </div>
            <div class="flex-grow-1">
              <div class="text-subtitle-1 font-weight-medium">
                {{ warriorStore.currentBiomeData?.name || 'Nieznany' }}
              </div>
              <div class="text-caption text-medium-emphasis">
                Poziom {{ warriorStore.currentBiomeData?.requiredLevel }}+
              </div>
            </div>
            <v-btn
              size="small"
              variant="text"
              icon
              @click="showBiomeSelector = !showBiomeSelector"
            >
              <v-icon>{{ showBiomeSelector ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
            </v-btn>
          </v-card-title>

          <!-- Environmental Effect Warning -->
          <v-alert
            v-if="warriorStore.currentEnvironmentalEffect && !warriorStore.isEnvironmentalEffectMitigated"
            type="warning"
            variant="tonal"
            density="compact"
            class="mx-4 mb-2"
          >
            <template #prepend>
              <v-icon size="20">
                mdi-alert-circle
              </v-icon>
            </template>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-body-2 font-weight-medium">
                  {{ warriorStore.currentEnvironmentalEffect.name }}
                </div>
                <div class="text-caption">
                  {{ warriorStore.currentEnvironmentalEffect.description }}
                </div>
              </div>
              <v-btn
                v-if="hasMitigationPotion"
                size="small"
                variant="tonal"
                color="success"
                @click="useMitigationPotion"
              >
                <v-icon start>
                  mdi-shield
                </v-icon>
                Ochrona
              </v-btn>
            </div>
          </v-alert>

          <!-- Mitigated Environmental Effect -->
          <v-alert
            v-if="warriorStore.currentEnvironmentalEffect && warriorStore.isEnvironmentalEffectMitigated"
            type="success"
            variant="tonal"
            density="compact"
            class="mx-4 mb-2"
          >
            <template #prepend>
              <v-icon size="20">
                mdi-shield-check
              </v-icon>
            </template>
            <div class="text-body-2">
              {{ warriorStore.currentEnvironmentalEffect.name }} - Chroniony!
            </div>
          </v-alert>

          <v-expand-transition>
            <v-card-text v-if="showBiomeSelector">
              <div class="text-caption text-medium-emphasis mb-2">
                {{ warriorStore.currentBiomeData?.description }}
              </div>

              <v-divider class="my-3" />

              <div class="text-subtitle-2 mb-2">
                Dostępne lokacje
              </div>

              <v-list
                density="compact"
                class="biome-list"
              >
                <v-list-item
                  v-for="biome in warriorStore.unlockedBiomes"
                  :key="biome.id"
                  :active="warriorStore.currentBiome === biome.id"
                  rounded
                  @click="warriorStore.changeBiome(biome.id); showBiomeSelector = false"
                >
                  <template #prepend>
                    <v-avatar
                      size="36"
                      :color="biome.color"
                    >
                      <v-icon
                        size="20"
                        color="white"
                      >
                        {{ biome.icon }}
                      </v-icon>
                    </v-avatar>
                  </template>

                  <v-list-item-title>
                    {{ biome.name }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    Wymagany poziom: {{ biome.requiredLevel }}
                  </v-list-item-subtitle>

                  <template #append>
                    <v-chip
                      size="x-small"
                      :color="warriorStore.stats.level >= biome.requiredLevel ? 'success' : 'error'"
                    >
                      {{ biome.monsterIds.length }} potworów
                    </v-chip>
                  </template>
                </v-list-item>
              </v-list>

              <!-- Locked Biomes Preview -->
              <div
                v-if="warriorStore.unlockedBiomes.length < 8"
                class="mt-3"
              >
                <div class="text-caption text-medium-emphasis mb-2">
                  Zablokowane lokacje
                </div>
                <v-chip
                  v-for="i in (8 - warriorStore.unlockedBiomes.length)"
                  :key="i"
                  size="small"
                  variant="outlined"
                  class="ma-1"
                  color="grey"
                >
                  <v-icon
                    start
                    size="14"
                  >
                    mdi-lock
                  </v-icon>
                  ???
                </v-chip>
              </div>
            </v-card-text>
          </v-expand-transition>
        </v-card>

        <!-- Monster Selection Card -->
        <v-card class="monster-card">
          <v-card-title class="d-flex align-center py-3">
            <v-icon
              class="mr-2"
              color="error"
            >
              mdi-sword-cross
            </v-icon>
            <span class="text-subtitle-1 font-weight-medium">Potwory</span>
            <v-chip
              class="ml-2"
              size="x-small"
              variant="flat"
              color="error"
            >
              {{ warriorStore.availableMonsters.length }}
            </v-chip>
          </v-card-title>

          <v-card-text class="pt-0">
            <div
              v-if="warriorStore.availableMonsters.length"
              class="monster-list"
            >
              <div
                v-for="monster in warriorStore.availableMonsters"
                :key="monster.id"
                class="monster-item d-flex align-center pa-2 rounded mb-2"
                :class="{
                  'monster-selected': warriorStore.selectedMonster === monster.id,
                  'monster-fighting': warriorStore.currentEnemy?.id === monster.id
                }"
                @click="selectMonster(monster.id)"
              >
                <div
                  class="monster-icon-wrapper mr-3"
                  :style="{ backgroundColor: getMonsterColor(monster.slayerCategory) + '20' }"
                >
                  <v-icon
                    size="20"
                    :color="getMonsterColor(monster.slayerCategory)"
                  >
                    {{ getMonsterIcon(monster.slayerCategory) }}
                  </v-icon>
                </div>

                <div class="flex-grow-1 overflow-hidden">
                  <div class="text-body-2 font-weight-medium text-truncate">
                    {{ monster.name }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    Lvl {{ monster.level }} • {{ monster.maxHp }} HP
                  </div>
                </div>

                <div class="text-right ml-2">
                  <div class="text-caption d-flex align-center justify-end">
                    <v-icon
                      size="12"
                      color="amber"
                      class="mr-1"
                    >
                      mdi-star
                    </v-icon>
                    <span class="text-amber">{{ monster.xpReward }}</span>
                  </div>
                  <div class="text-caption d-flex align-center justify-end">
                    <v-icon
                      size="12"
                      color="amber-darken-2"
                      class="mr-1"
                    >
                      mdi-currency-usd
                    </v-icon>
                    <span class="text-amber-darken-2">{{ monster.goldReward.min }}-{{ monster.goldReward.max }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div
              v-else
              class="text-center py-6 text-medium-emphasis"
            >
              <v-icon
                size="48"
                class="mb-2 opacity-50"
              >
                mdi-ghost-off
              </v-icon>
              <div class="text-body-2">
                Brak potworów
              </div>
              <div class="text-caption">
                Zwiększ poziom wojownika
              </div>
            </div>

            <!-- Food Section -->
            <v-divider class="my-3" />
            <div class="food-section d-flex align-center justify-space-between pa-2 rounded">
              <div class="d-flex align-center">
                <div
                  class="food-icon-wrapper mr-2"
                >
                  <v-icon
                    size="18"
                    color="brown"
                  >
                    mdi-food-drumstick
                  </v-icon>
                </div>
                <div>
                  <div class="text-body-2 font-weight-medium">
                    {{ formatNumber(resourcesStore.food.amount) }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    Jedzenie
                  </div>
                </div>
              </div>
              <v-btn
                size="small"
                variant="tonal"
                color="success"
                :disabled="!resourcesStore.hasAmount('food', 1) || warriorStore.hpPercent >= 100"
                @click="warriorStore.consumeFood()"
              >
                <v-icon
                  start
                  size="16"
                >
                  mdi-silverware-fork-knife
                </v-icon>
                Jedz
              </v-btn>
            </div>

            <!-- Combat Potions Section -->
            <v-divider class="my-3" />
            <div class="d-flex align-center justify-space-between mb-2">
              <div class="text-subtitle-2">
                <v-icon
                  size="16"
                  class="mr-1"
                >
                  mdi-flask
                </v-icon>
                Mikstury bojowe
              </div>
              <v-btn
                size="x-small"
                variant="text"
                color="primary"
                @click="showPotionDialog = true"
              >
                <v-icon start>
                  mdi-plus
                </v-icon>
                Dodaj
              </v-btn>
            </div>

            <!-- Combat Potions List -->
            <div
              v-if="combatPotionsList.length > 0"
              class="combat-potions-list"
            >
              <div
                v-for="potion in combatPotionsList"
                :key="potion.potionId"
                class="potion-item d-flex align-center pa-2 rounded mb-1"
              >
                <div class="potion-icon-wrapper mr-2">
                  <v-icon
                    size="18"
                    color="purple"
                  >
                    {{ potion.icon }}
                  </v-icon>
                </div>
                <div class="flex-grow-1 overflow-hidden">
                  <div class="text-body-2 font-weight-medium text-truncate">
                    {{ potion.name }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    x{{ potion.amount }}
                  </div>
                </div>
                <v-btn
                  size="x-small"
                  variant="tonal"
                  color="primary"
                  :disabled="potion.amount <= 0"
                  @click="usePotion(potion.potionId)"
                >
                  Użyj
                </v-btn>
              </div>
            </div>

            <div
              v-else
              class="text-center py-3 text-caption text-medium-emphasis"
            >
              Brak mikstur bojowych
            </div>

            <!-- Auto-potion settings -->
            <div class="d-flex align-center justify-space-between mt-2 pa-2 rounded auto-potion-settings">
              <div>
                <div class="text-caption font-weight-medium">
                  Auto-mikstury
                </div>
                <div class="text-caption text-medium-emphasis">
                  Automatyczne leczenie ({{ Math.floor(warriorStore.autoHealThreshold * 100) }}% HP)
                </div>
              </div>
              <v-switch
                v-model="warriorStore.autoPotionEnabled"
                color="primary"
                density="compact"
                hide-details
              />
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Potion Allocation Dialog -->
    <v-dialog
      v-model="showPotionDialog"
      max-width="500"
    >
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">
            mdi-flask
          </v-icon>
          Przydziel mikstury
        </v-card-title>
        <v-card-text>
          <div
            v-if="availablePotions.length > 0"
            class="potion-allocation-list"
          >
            <div
              v-for="potion in availablePotions"
              :key="potion.potionId"
              class="potion-allocation-item d-flex align-center pa-3 rounded mb-2"
            >
              <div class="potion-icon-wrapper mr-3">
                <v-icon
                  size="24"
                  color="purple"
                >
                  {{ potion.icon }}
                </v-icon>
              </div>
              <div class="flex-grow-1">
                <div class="text-body-1 font-weight-medium">
                  {{ potion.name }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  Dostępne: {{ potion.amount }}
                </div>
              </div>
              <div class="d-flex gap-1">
                <v-btn
                  size="small"
                  variant="tonal"
                  color="primary"
                  :disabled="potion.amount <= 0"
                  @click="allocatePotion(potion.potionId, 1)"
                >
                  +1
                </v-btn>
                <v-btn
                  size="small"
                  variant="tonal"
                  color="primary"
                  :disabled="potion.amount <= 0"
                  @click="allocateAllPotions(potion.potionId)"
                >
                  Wszystko
                </v-btn>
              </div>
            </div>
          </div>
          <div
            v-else
            class="text-center py-8 text-medium-emphasis"
          >
            <v-icon
              size="64"
              class="mb-4 opacity-50"
            >
              mdi-flask-empty
            </v-icon>
            <div class="text-body-1">
              Brak dostępnych mikstur
            </div>
            <div class="text-caption">
              Stwórz mikstury w laboratorium Naukowca
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="showPotionDialog = false"
          >
            Zamknij
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.monster-list {
  max-height: 280px;
  overflow-y: auto;
}

.biome-list {
  max-height: 200px;
  overflow-y: auto;
}

.combat-view {
  min-height: 250px;
}

/* Biome card styles */
.biome-card {
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.biome-icon-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Monster card styles */
.monster-card {
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.monster-item {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.monster-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.monster-selected {
  background: rgba(33, 150, 243, 0.1);
  border-color: rgba(33, 150, 243, 0.3);
}

.monster-fighting {
  background: rgba(244, 67, 54, 0.1);
  border-color: rgba(244, 67, 54, 0.5);
  animation: pulse-border 1.5s infinite;
}

@keyframes pulse-border {
  0%, 100% {
    border-color: rgba(244, 67, 54, 0.5);
  }
  50% {
    border-color: rgba(244, 67, 54, 0.2);
  }
}

.monster-icon-wrapper {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Food section */
.food-section {
  background: rgba(255, 255, 255, 0.02);
}

.food-icon-wrapper {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(141, 110, 99, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Combat potions */
.combat-potions-list {
  max-height: 150px;
  overflow-y: auto;
}

.potion-item {
  background: rgba(156, 39, 176, 0.08);
  border: 1px solid rgba(156, 39, 176, 0.15);
  transition: all 0.2s ease;
}

.potion-item:hover {
  background: rgba(156, 39, 176, 0.12);
  border-color: rgba(156, 39, 176, 0.25);
}

.potion-icon-wrapper {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(156, 39, 176, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.auto-potion-settings {
  background: rgba(255, 255, 255, 0.02);
}

/* Potion allocation dialog */
.potion-allocation-item {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.potion-allocation-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

/* Active buffs */
.active-buffs {
  background: rgba(33, 150, 243, 0.05);
  padding: 8px;
  border-radius: 8px;
}

.bonus-indicators {
  display: flex;
  gap: 4px;
}
</style>
