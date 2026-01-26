<script setup lang="ts">
/**
 * Warrior Panel - main UI for the Warrior path
 */

import { computed, ref } from 'vue';
import { useAteriaWarriorStore } from '../model/warrior.store';
import { useAteriaResourcesStore } from '../../core/model/resources.store';
import { formatNumber } from '~/shared/lib/big-number';
import type { BiomeId } from '~/entities/ateria-idle/warrior';

const warriorStore = useAteriaWarriorStore();
const resourcesStore = useAteriaResourcesStore();

// UI State
const showBiomeSelector = ref(false);

// Computed
const stats = computed(() => warriorStore.effectiveStats);

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
        <v-card class="mb-4">
          <v-card-title class="d-flex align-center">
            <v-icon
              class="mr-2"
              :color="warriorStore.currentBiomeData?.color"
            >
              {{ warriorStore.currentBiomeData?.icon || 'mdi-map-marker' }}
            </v-icon>
            {{ warriorStore.currentBiomeData?.name || 'Nieznany' }}
            <v-spacer />
            <v-btn
              size="small"
              variant="outlined"
              @click="showBiomeSelector = !showBiomeSelector"
            >
              <v-icon start>
                mdi-map
              </v-icon>
              Zmień
            </v-btn>
          </v-card-title>

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
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">
              mdi-skull
            </v-icon>
            Potwory
            <v-chip
              class="ml-2"
              size="x-small"
              color="primary"
            >
              {{ warriorStore.availableMonsters.length }}
            </v-chip>
          </v-card-title>

          <v-card-text>
            <v-list
              v-if="warriorStore.availableMonsters.length"
              density="compact"
              class="monster-list"
            >
              <v-list-item
                v-for="monster in warriorStore.availableMonsters"
                :key="monster.id"
                :active="warriorStore.selectedMonster === monster.id"
                :class="{ 'monster-active': warriorStore.currentEnemy?.id === monster.id }"
                rounded
                @click="selectMonster(monster.id)"
              >
                <template #prepend>
                  <v-avatar
                    size="40"
                    color="surface-variant"
                  >
                    <v-icon>mdi-skull</v-icon>
                  </v-avatar>
                </template>

                <v-list-item-title>
                  {{ monster.name }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  Lvl {{ monster.level }} • HP {{ monster.maxHp }}
                </v-list-item-subtitle>

                <template #append>
                  <div class="text-right">
                    <div class="text-caption">
                      <v-icon
                        size="12"
                        class="mr-1"
                      >
                        mdi-star
                      </v-icon>
                      {{ monster.xpReward }} XP
                    </div>
                    <div class="text-caption text-warning">
                      <v-icon
                        size="12"
                        class="mr-1"
                      >
                        mdi-gold
                      </v-icon>
                      {{ monster.goldReward.min }}-{{ monster.goldReward.max }}
                    </div>
                  </div>
                </template>
              </v-list-item>
            </v-list>

            <div
              v-else
              class="text-center py-4 text-medium-emphasis"
            >
              <v-icon
                size="48"
                class="mb-2"
              >
                mdi-emoticon-sad
              </v-icon>
              <div>Brak dostępnych potworów</div>
              <div class="text-caption">
                Zwiększ poziom, aby walczyć z silniejszymi wrogami
              </div>
            </div>

            <!-- Food Section -->
            <v-divider class="my-4" />
            <div class="text-subtitle-2 mb-2">
              Jedzenie
            </div>
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-icon
                  color="brown"
                  class="mr-2"
                >
                  mdi-food-drumstick
                </v-icon>
                <span>{{ formatNumber(resourcesStore.food.amount) }}</span>
              </div>
              <v-btn
                size="small"
                variant="outlined"
                :disabled="!resourcesStore.hasAmount('food', 1) || warriorStore.hpPercent >= 100"
                @click="warriorStore.consumeFood()"
              >
                Jedz (+20% HP)
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.monster-list {
  max-height: 250px;
  overflow-y: auto;
}

.biome-list {
  max-height: 200px;
  overflow-y: auto;
}

.monster-active {
  border-left: 3px solid rgb(var(--v-theme-error));
}

.combat-view {
  min-height: 250px;
}
</style>
