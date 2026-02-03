<script setup lang="ts">
/**
 * Dungeon Panel - UI for dungeon exploration
 */

import { computed, ref } from 'vue';
import { useAteriaWarriorStore } from '../model/warrior.store';
import { formatNumber } from '@shared/lib/big-number';
import { DUNGEONS, getDungeon, DUNGEON_KEY_ITEMS } from '../../data/dungeons.data';
import type { Dungeon } from '@ateria-idle/entities/ateria-idle/warrior';

const warriorStore = useAteriaWarriorStore();

// UI State
const selectedDungeonId = ref<string | null>(null);
const showConfirmDialog = ref(false);

// Computed
const dungeonList = computed(() => {
  return Object.values(DUNGEONS).sort((a, b) => a.tier - b.tier);
});

const selectedDungeon = computed(() => {
  if (!selectedDungeonId.value) return null;
  return getDungeon(selectedDungeonId.value);
});

const canEnterSelectedDungeon = computed(() => {
  if (!selectedDungeonId.value) return false;
  const dungeon = getDungeon(selectedDungeonId.value);
  if (!dungeon) return false;
  return warriorStore.stats.level >= dungeon.requiredLevel && warriorStore.hasDungeonKey(selectedDungeonId.value);
});

// Helper functions
function getTierColor(tier: number): string {
  const colors: Record<number, string> = {
    1: '#4CAF50', // Green
    2: '#2196F3', // Blue
    3: '#9C27B0', // Purple
    4: '#FF9800', // Orange
    5: '#F44336', // Red
  };
  return colors[tier] || '#757575';
}

function getTierName(tier: number): string {
  const names: Record<number, string> = {
    1: 'Początkujący',
    2: 'Średniozaawansowany',
    3: 'Zaawansowany',
    4: 'Ekspert',
    5: 'Legendarny',
  };
  return names[tier] || 'Nieznany';
}

function getKeyCount(dungeonId: string): number {
  const dungeon = getDungeon(dungeonId);
  if (!dungeon) return 0;
  return warriorStore.dungeonKeys.get(dungeon.keyItemId) || 0;
}

function getKeyName(keyItemId: string): string {
  const keyItem = DUNGEON_KEY_ITEMS[keyItemId as keyof typeof DUNGEON_KEY_ITEMS];
  return keyItem?.name || keyItemId;
}

function isDungeonCompleted(dungeonId: string): boolean {
  return warriorStore.completedDungeons.has(dungeonId);
}

function selectDungeon(dungeonId: string) {
  selectedDungeonId.value = dungeonId;
}

function confirmEnterDungeon() {
  if (!selectedDungeonId.value) return;
  showConfirmDialog.value = true;
}

function enterDungeon() {
  if (!selectedDungeonId.value) return;
  warriorStore.startDungeon(selectedDungeonId.value);
  showConfirmDialog.value = false;
}

function abandonDungeon() {
  warriorStore.abandonDungeon();
}
</script>

<template>
  <div class="dungeon-panel">
    <!-- Active Dungeon Run -->
    <v-card
      v-if="warriorStore.isInDungeon && warriorStore.currentDungeonData"
      class="mb-4 active-dungeon-card"
    >
      <v-card-title class="d-flex align-center">
        <v-icon
          class="mr-2"
          :color="getTierColor(warriorStore.currentDungeonData.tier)"
        >
          {{ warriorStore.currentDungeonData.icon }}
        </v-icon>
        {{ warriorStore.currentDungeonData.name }}
        <v-chip
          class="ml-2"
          size="small"
          :color="getTierColor(warriorStore.currentDungeonData.tier)"
        >
          Tier {{ warriorStore.currentDungeonData.tier }}
        </v-chip>
      </v-card-title>

      <v-card-text>
        <!-- Progress Bar -->
        <div class="mb-4">
          <div class="d-flex justify-space-between text-caption mb-1">
            <span>Postęp</span>
            <span v-if="warriorStore.isDungeonBossWave">
              BOSS
            </span>
            <span v-else>
              Fala {{ (warriorStore.activeDungeonRun?.currentWave || 0) + 1 }} / {{ warriorStore.currentDungeonData.waves.length + 1 }}
            </span>
          </div>
          <v-progress-linear
            :model-value="warriorStore.dungeonProgress"
            :color="warriorStore.isDungeonBossWave ? 'error' : getTierColor(warriorStore.currentDungeonData.tier)"
            height="12"
            rounded
          />
        </div>

        <!-- Wave Info -->
        <div
          v-if="warriorStore.currentDungeonWave && !warriorStore.isDungeonBossWave"
          class="wave-info mb-3"
        >
          <div class="text-subtitle-2 mb-1">
            Aktualna Fala
          </div>
          <div class="text-body-2 text-medium-emphasis">
            Potwory: {{ warriorStore.activeDungeonRun?.monstersKilledInWave || 0 }} / {{ warriorStore.currentDungeonWave.count }}
          </div>
        </div>

        <!-- Boss Warning -->
        <v-alert
          v-if="warriorStore.isDungeonBossWave"
          type="error"
          variant="tonal"
          class="mb-3"
        >
          <template #prepend>
            <v-icon>mdi-skull</v-icon>
          </template>
          <div class="text-body-2 font-weight-bold">
            {{ warriorStore.currentDungeonData.boss.name }}
          </div>
          <div class="text-caption">
            Poziom {{ warriorStore.currentDungeonData.boss.level }} • {{ warriorStore.currentDungeonData.boss.maxHp }} HP
          </div>
        </v-alert>

        <!-- Current Enemy -->
        <div
          v-if="warriorStore.currentEnemy"
          class="current-enemy mb-3"
        >
          <div class="d-flex align-center mb-2">
            <v-avatar
              size="48"
              :color="warriorStore.isDungeonBossWave ? 'error' : 'grey'"
            >
              <v-icon size="28">
                {{ warriorStore.isDungeonBossWave ? 'mdi-skull-crossbones' : 'mdi-skull' }}
              </v-icon>
            </v-avatar>
            <div class="ml-3">
              <div class="text-body-1 font-weight-medium">
                {{ warriorStore.currentEnemy.name }}
              </div>
              <div class="text-caption text-medium-emphasis">
                Lvl {{ warriorStore.currentEnemy.level }}
              </div>
            </div>
          </div>
          <v-progress-linear
            :model-value="warriorStore.enemyHpPercent"
            color="error"
            height="10"
            rounded
          >
            <template #default>
              <span class="text-caption">
                {{ warriorStore.currentEnemy.currentHp }} / {{ warriorStore.currentEnemy.maxHp }}
              </span>
            </template>
          </v-progress-linear>
        </div>

        <!-- Stats -->
        <div class="d-flex justify-space-between text-body-2 mb-2">
          <span class="text-medium-emphasis">Zabici wrogowie</span>
          <span class="font-weight-medium">{{ warriorStore.activeDungeonRun?.totalMonstersKilled || 0 }}</span>
        </div>
        <div class="d-flex justify-space-between text-body-2">
          <span class="text-medium-emphasis">Zebrane łupy</span>
          <span class="font-weight-medium">{{ warriorStore.activeDungeonRun?.loot.length || 0 }}</span>
        </div>

        <!-- Abandon Button -->
        <v-btn
          block
          color="error"
          variant="outlined"
          class="mt-4"
          @click="abandonDungeon"
        >
          <v-icon start>
            mdi-run
          </v-icon>
          Opuść loch (strata 50% łupów)
        </v-btn>
      </v-card-text>
    </v-card>

    <!-- Dungeon Selection (when not in dungeon) -->
    <v-row v-if="!warriorStore.isInDungeon">
      <!-- Dungeon List -->
      <v-col
        cols="12"
        md="7"
      >
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">
              mdi-castle
            </v-icon>
            Lochy
          </v-card-title>

          <v-card-text>
            <div class="dungeon-list">
              <div
                v-for="dungeon in dungeonList"
                :key="dungeon.id"
                class="dungeon-item d-flex align-center pa-3 rounded mb-2"
                :class="{
                  'dungeon-selected': selectedDungeonId === dungeon.id,
                  'dungeon-completed': isDungeonCompleted(dungeon.id),
                  'dungeon-locked': warriorStore.stats.level < dungeon.requiredLevel,
                }"
                @click="selectDungeon(dungeon.id)"
              >
                <!-- Dungeon Icon -->
                <div
                  class="dungeon-icon-wrapper mr-3"
                  :style="{ backgroundColor: getTierColor(dungeon.tier) + '20' }"
                >
                  <v-icon
                    size="24"
                    :color="getTierColor(dungeon.tier)"
                  >
                    {{ dungeon.icon }}
                  </v-icon>
                </div>

                <!-- Dungeon Info -->
                <div class="flex-grow-1 overflow-hidden">
                  <div class="d-flex align-center">
                    <span class="text-body-1 font-weight-medium text-truncate">
                      {{ dungeon.name }}
                    </span>
                    <v-icon
                      v-if="isDungeonCompleted(dungeon.id)"
                      size="16"
                      color="success"
                      class="ml-1"
                    >
                      mdi-check-circle
                    </v-icon>
                    <v-icon
                      v-if="warriorStore.stats.level < dungeon.requiredLevel"
                      size="16"
                      color="grey"
                      class="ml-1"
                    >
                      mdi-lock
                    </v-icon>
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    Tier {{ dungeon.tier }} • Lvl {{ dungeon.requiredLevel }}+
                  </div>
                </div>

                <!-- Key Count -->
                <div class="text-right">
                  <v-chip
                    size="small"
                    :color="getKeyCount(dungeon.id) > 0 ? 'success' : 'grey'"
                    variant="tonal"
                  >
                    <v-icon
                      start
                      size="14"
                    >
                      mdi-key
                    </v-icon>
                    {{ getKeyCount(dungeon.id) }}
                  </v-chip>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Dungeon Details -->
      <v-col
        cols="12"
        md="5"
      >
        <v-card v-if="selectedDungeon">
          <v-card-title class="d-flex align-center">
            <v-icon
              class="mr-2"
              :color="getTierColor(selectedDungeon.tier)"
            >
              {{ selectedDungeon.icon }}
            </v-icon>
            {{ selectedDungeon.name }}
          </v-card-title>

          <v-card-text>
            <!-- Tier Badge -->
            <v-chip
              :color="getTierColor(selectedDungeon.tier)"
              size="small"
              class="mb-3"
            >
              {{ getTierName(selectedDungeon.tier) }}
            </v-chip>

            <!-- Description -->
            <div class="text-body-2 text-medium-emphasis mb-4">
              {{ selectedDungeon.description }}
            </div>

            <!-- Requirements -->
            <div class="requirements mb-4">
              <div class="text-subtitle-2 mb-2">
                Wymagania
              </div>
              <div class="d-flex align-center mb-1">
                <v-icon
                  size="16"
                  :color="warriorStore.stats.level >= selectedDungeon.requiredLevel ? 'success' : 'error'"
                  class="mr-2"
                >
                  {{ warriorStore.stats.level >= selectedDungeon.requiredLevel ? 'mdi-check-circle' : 'mdi-close-circle' }}
                </v-icon>
                <span class="text-body-2">
                  Poziom {{ selectedDungeon.requiredLevel }}
                  <span class="text-medium-emphasis">(Twój: {{ warriorStore.stats.level }})</span>
                </span>
              </div>
              <div class="d-flex align-center">
                <v-icon
                  size="16"
                  :color="getKeyCount(selectedDungeon.id) > 0 ? 'success' : 'error'"
                  class="mr-2"
                >
                  {{ getKeyCount(selectedDungeon.id) > 0 ? 'mdi-check-circle' : 'mdi-close-circle' }}
                </v-icon>
                <span class="text-body-2">
                  {{ getKeyName(selectedDungeon.keyItemId) }}
                  <span class="text-medium-emphasis">(Masz: {{ getKeyCount(selectedDungeon.id) }})</span>
                </span>
              </div>
            </div>

            <!-- Structure -->
            <div class="structure mb-4">
              <div class="text-subtitle-2 mb-2">
                Struktura
              </div>
              <div class="text-body-2">
                <div class="d-flex justify-space-between mb-1">
                  <span class="text-medium-emphasis">Fale</span>
                  <span>{{ selectedDungeon.waves.length }}</span>
                </div>
                <div class="d-flex justify-space-between">
                  <span class="text-medium-emphasis">Boss</span>
                  <span>{{ selectedDungeon.boss.name }} (Lvl {{ selectedDungeon.boss.level }})</span>
                </div>
              </div>
            </div>

            <!-- First Clear Bonus -->
            <v-alert
              v-if="!isDungeonCompleted(selectedDungeon.id)"
              type="info"
              variant="tonal"
              density="compact"
              class="mb-4"
            >
              <template #prepend>
                <v-icon size="18">
                  mdi-gift
                </v-icon>
              </template>
              <span class="text-caption">Bonus za pierwsze ukończenie!</span>
            </v-alert>

            <!-- Enter Button -->
            <v-btn
              block
              color="primary"
              size="large"
              :disabled="!canEnterSelectedDungeon || warriorStore.combatState === 'recovering'"
              @click="confirmEnterDungeon"
            >
              <v-icon start>
                mdi-door-open
              </v-icon>
              Wejdź do lochu
            </v-btn>
          </v-card-text>
        </v-card>

        <!-- No Dungeon Selected -->
        <v-card v-else>
          <v-card-text class="text-center py-12">
            <v-icon
              size="64"
              class="text-medium-emphasis mb-4"
            >
              mdi-castle
            </v-icon>
            <div class="text-body-1 text-medium-emphasis">
              Wybierz loch z listy
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Confirm Dialog -->
    <v-dialog
      v-model="showConfirmDialog"
      max-width="400"
    >
      <v-card v-if="selectedDungeon">
        <v-card-title>
          Wejść do {{ selectedDungeon.name }}?
        </v-card-title>
        <v-card-text>
          <div class="text-body-2 mb-3">
            Zużyjesz <strong>1x {{ getKeyName(selectedDungeon.keyItemId) }}</strong>.
          </div>
          <v-alert
            type="warning"
            variant="tonal"
            density="compact"
          >
            Śmierć w lochu oznacza utratę całego postępu i zebranych łupów!
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="showConfirmDialog = false"
          >
            Anuluj
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            @click="enterDungeon"
          >
            Wchodzę
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.dungeon-list {
  max-height: 450px;
  overflow-y: auto;
}

.dungeon-item {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dungeon-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.dungeon-selected {
  background: rgba(33, 150, 243, 0.1);
  border-color: rgba(33, 150, 243, 0.3);
}

.dungeon-completed {
  border-left: 3px solid #4CAF50;
}

.dungeon-locked {
  opacity: 0.6;
}

.dungeon-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.active-dungeon-card {
  border: 2px solid rgba(156, 39, 176, 0.5);
  background: linear-gradient(135deg, rgba(156, 39, 176, 0.1) 0%, transparent 100%);
}

.wave-info {
  background: rgba(255, 255, 255, 0.03);
  padding: 12px;
  border-radius: 8px;
}

.current-enemy {
  background: rgba(244, 67, 54, 0.05);
  padding: 12px;
  border-radius: 8px;
}
</style>
