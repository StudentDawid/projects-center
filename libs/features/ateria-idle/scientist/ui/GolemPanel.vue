<script setup lang="ts">
/**
 * Golem Panel - UI for managing golems
 */

import { computed, ref } from 'vue';
import { useAteriaScientistStore } from '../model/scientist.store';
import { useAteriaResourcesStore } from '../../core/model/resources.store';
import {
  GOLEM_BLUEPRINTS,
  getGolemBlueprint,
  getAvailableGolems,
} from '../../data/scientist.data';
import { GOLEM_UPGRADES, getUpgradesForGolemType } from '../../data/golems.data';
import type { Golem, GolemState } from '@libs/entities/ateria-idle/scientist';

const scientistStore = useAteriaScientistStore();
const resourcesStore = useAteriaResourcesStore();

const showCreateDialog = ref(false);
const selectedBlueprintId = ref<string | null>(null);

// Computed
const golems = computed(() => scientistStore.workshop.golems);
const maxSlots = computed(() => scientistStore.workshop.maxGolemSlots);
const availableSlots = computed(() => maxSlots.value - golems.value.length);

const availableBlueprints = computed(() => {
  return getAvailableGolems(
    scientistStore.stats.level,
    scientistStore.completedResearch
  );
});

const selectedBlueprint = computed(() => {
  if (!selectedBlueprintId.value) return null;
  return getGolemBlueprint(selectedBlueprintId.value);
});

// Helper functions
function getStateColor(state: GolemState): string {
  switch (state) {
    case 'working': return 'success';
    case 'idle': return 'grey';
    case 'damaged': return 'warning';
    case 'repairing': return 'info';
    case 'disabled': return 'error';
    default: return 'grey';
  }
}

function getStateText(state: GolemState): string {
  switch (state) {
    case 'working': return 'Pracuje';
    case 'idle': return 'Bezczynny';
    case 'damaged': return 'Uszkodzony';
    case 'repairing': return 'Naprawa';
    case 'disabled': return 'Wyłączony';
    default: return state;
  }
}

function getTypeIcon(type: string): string {
  switch (type) {
    case 'mining': return 'mdi-pickaxe';
    case 'hauling': return 'mdi-robot';
    case 'combat': return 'mdi-shield-sword';
    case 'research': return 'mdi-book-open-page-variant';
    case 'alchemy': return 'mdi-flask';
    default: return 'mdi-robot';
  }
}

function getTypeColor(type: string): string {
  switch (type) {
    case 'mining': return 'brown';
    case 'hauling': return 'blue-grey';
    case 'combat': return 'red';
    case 'research': return 'blue';
    case 'alchemy': return 'green';
    default: return 'grey';
  }
}

function getIntegrityColor(integrity: number, max: number): string {
  const percent = (integrity / max) * 100;
  if (percent > 75) return 'success';
  if (percent > 50) return 'info';
  if (percent > 25) return 'warning';
  return 'error';
}

function canCreate(blueprintId: string): boolean {
  if (availableSlots.value <= 0) return false;
  
  const blueprint = getGolemBlueprint(blueprintId);
  if (!blueprint) return false;

  // Check gold
  if (blueprint.craftCost.gold && !resourcesStore.hasAmount('gold', blueprint.craftCost.gold)) {
    return false;
  }

  // Check flasks
  if (blueprint.craftCost.flasks) {
    if (blueprint.craftCost.flasks.red && scientistStore.flasks.red < blueprint.craftCost.flasks.red) return false;
    if (blueprint.craftCost.flasks.green && scientistStore.flasks.green < blueprint.craftCost.flasks.green) return false;
    if (blueprint.craftCost.flasks.blue && scientistStore.flasks.blue < blueprint.craftCost.flasks.blue) return false;
  }

  return true;
}

function canRepair(golem: Golem): boolean {
  if (golem.integrity >= golem.maxIntegrity) return false;

  const blueprint = getGolemBlueprint(golem.type + '_golem');
  if (!blueprint) return false;

  if (blueprint.repairCost.flasks) {
    if (blueprint.repairCost.flasks.red && scientistStore.flasks.red < blueprint.repairCost.flasks.red) return false;
    if (blueprint.repairCost.flasks.green && scientistStore.flasks.green < blueprint.repairCost.flasks.green) return false;
  }

  return true;
}

// Actions
function openCreateDialog() {
  selectedBlueprintId.value = null;
  showCreateDialog.value = true;
}

function createGolem() {
  if (!selectedBlueprintId.value) return;
  
  if (scientistStore.createGolem(selectedBlueprintId.value)) {
    showCreateDialog.value = false;
  }
}

function toggleGolem(golem: Golem) {
  if (golem.state === 'working') {
    scientistStore.deactivateGolem(golem.id);
  } else if (golem.state === 'idle') {
    scientistStore.activateGolem(golem.id);
  }
}

function repairGolem(golem: Golem) {
  scientistStore.repairGolem(golem.id);
}
</script>

<template>
  <div class="golem-panel">
    <!-- Header -->
    <v-card class="mb-4">
      <v-card-text>
        <v-row align="center">
          <v-col
            cols="12"
            md="6"
          >
            <div class="d-flex align-center">
              <v-avatar
                color="blue-grey"
                size="56"
                class="mr-4"
              >
                <v-icon
                  size="32"
                  color="white"
                >
                  mdi-robot
                </v-icon>
              </v-avatar>
              <div>
                <div class="text-h5">
                  Warsztat Golemów
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  Sloty: {{ golems.length }} / {{ maxSlots }}
                </div>
              </div>
            </div>
          </v-col>
          <v-col
            cols="12"
            md="6"
            class="text-md-right"
          >
            <v-btn
              color="primary"
              :disabled="availableSlots <= 0 || !scientistStore.golemsUnlocked"
              @click="openCreateDialog"
            >
              <v-icon start>
                mdi-plus
              </v-icon>
              Stwórz Golema
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Not Unlocked Message -->
    <v-alert
      v-if="!scientistStore.golemsUnlocked"
      type="info"
      variant="tonal"
      class="mb-4"
    >
      <v-icon start>
        mdi-lock
      </v-icon>
      Golemy nie są jeszcze odblokowane. Ukończ badanie "Podstawy Golemów" aby odblokować.
    </v-alert>

    <!-- Golems Grid -->
    <v-row v-if="golems.length > 0">
      <v-col
        v-for="golem in golems"
        :key="golem.id"
        cols="12"
        md="6"
        lg="4"
      >
        <v-card class="golem-card">
          <v-card-text>
            <div class="d-flex align-center mb-3">
              <v-avatar
                :color="getTypeColor(golem.type)"
                size="48"
                class="mr-3"
              >
                <v-icon
                  size="28"
                  color="white"
                >
                  {{ getTypeIcon(golem.type) }}
                </v-icon>
              </v-avatar>
              <div class="flex-grow-1">
                <div class="text-body-1 font-weight-medium">
                  {{ golem.name }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  Lvl {{ golem.level }} • {{ golem.type }}
                </div>
              </div>
              <v-chip
                :color="getStateColor(golem.state)"
                size="small"
              >
                {{ getStateText(golem.state) }}
              </v-chip>
            </div>

            <!-- Integrity Bar -->
            <div class="mb-3">
              <div class="d-flex justify-space-between text-caption mb-1">
                <span>Integralność</span>
                <span>{{ Math.round(golem.integrity) }} / {{ golem.maxIntegrity }}</span>
              </div>
              <v-progress-linear
                :model-value="(golem.integrity / golem.maxIntegrity) * 100"
                :color="getIntegrityColor(golem.integrity, golem.maxIntegrity)"
                height="8"
                rounded
              />
            </div>

            <!-- Stats -->
            <v-row dense>
              <v-col cols="6">
                <div class="stat-box text-center pa-2 rounded">
                  <div class="text-body-1 font-weight-bold">
                    {{ (golem.efficiency * 100).toFixed(0) }}%
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    Wydajność
                  </div>
                </div>
              </v-col>
              <v-col cols="6">
                <div class="stat-box text-center pa-2 rounded">
                  <div class="text-body-1 font-weight-bold">
                    {{ (golem.speed * 100).toFixed(0) }}%
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    Prędkość
                  </div>
                </div>
              </v-col>
            </v-row>

            <!-- Actions -->
            <div class="d-flex gap-2 mt-3">
              <v-btn
                v-if="golem.state === 'idle'"
                color="success"
                variant="tonal"
                size="small"
                @click="toggleGolem(golem)"
              >
                <v-icon start>
                  mdi-play
                </v-icon>
                Aktywuj
              </v-btn>
              <v-btn
                v-else-if="golem.state === 'working'"
                color="warning"
                variant="tonal"
                size="small"
                @click="toggleGolem(golem)"
              >
                <v-icon start>
                  mdi-pause
                </v-icon>
                Zatrzymaj
              </v-btn>
              <v-btn
                v-if="golem.integrity < golem.maxIntegrity"
                color="info"
                variant="tonal"
                size="small"
                :disabled="!canRepair(golem)"
                @click="repairGolem(golem)"
              >
                <v-icon start>
                  mdi-wrench
                </v-icon>
                Napraw
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Empty State -->
    <v-card v-else-if="scientistStore.golemsUnlocked">
      <v-card-text class="text-center py-8">
        <v-icon
          size="64"
          color="grey"
          class="mb-4"
        >
          mdi-robot-off
        </v-icon>
        <div class="text-h6 mb-2">
          Brak Golemów
        </div>
        <div class="text-body-2 text-medium-emphasis mb-4">
          Stwórz swojego pierwszego golema aby automatyzować zadania
        </div>
        <v-btn
          color="primary"
          @click="openCreateDialog"
        >
          <v-icon start>
            mdi-plus
          </v-icon>
          Stwórz Golema
        </v-btn>
      </v-card-text>
    </v-card>

    <!-- Create Golem Dialog -->
    <v-dialog
      v-model="showCreateDialog"
      max-width="600"
    >
      <v-card>
        <v-card-title class="d-flex align-center bg-primary">
          <v-icon
            class="mr-2"
            color="white"
          >
            mdi-robot
          </v-icon>
          <span class="text-white">Stwórz Golema</span>
        </v-card-title>

        <v-card-text class="pt-4">
          <div
            v-if="availableBlueprints.length === 0"
            class="text-center py-4"
          >
            <v-icon
              size="48"
              color="grey"
            >
              mdi-lock
            </v-icon>
            <div class="text-body-1 mt-2">
              Brak dostępnych schematów
            </div>
            <div class="text-body-2 text-medium-emphasis">
              Ukończ badania aby odblokować nowe schematy golemów
            </div>
          </div>

          <v-list
            v-else
            select-strategy="single-leaf"
          >
            <v-list-item
              v-for="blueprint in availableBlueprints"
              :key="blueprint.id"
              :value="blueprint.id"
              :active="selectedBlueprintId === blueprint.id"
              @click="selectedBlueprintId = blueprint.id"
            >
              <template #prepend>
                <v-avatar
                  :color="getTypeColor(blueprint.type)"
                  size="40"
                >
                  <v-icon color="white">
                    {{ blueprint.icon }}
                  </v-icon>
                </v-avatar>
              </template>

              <v-list-item-title>{{ blueprint.name }}</v-list-item-title>
              <v-list-item-subtitle>{{ blueprint.description }}</v-list-item-subtitle>

              <template #append>
                <div class="text-right">
                  <div
                    v-if="blueprint.craftCost.gold"
                    class="text-body-2"
                  >
                    {{ blueprint.craftCost.gold }} 💰
                  </div>
                  <div
                    v-if="blueprint.craftCost.flasks"
                    class="text-caption"
                  >
                    <span
                      v-if="blueprint.craftCost.flasks.red"
                      class="text-red"
                    >{{ blueprint.craftCost.flasks.red }}🔴</span>
                    <span
                      v-if="blueprint.craftCost.flasks.green"
                      class="text-green ml-1"
                    >{{ blueprint.craftCost.flasks.green }}🟢</span>
                    <span
                      v-if="blueprint.craftCost.flasks.blue"
                      class="text-blue ml-1"
                    >{{ blueprint.craftCost.flasks.blue }}🔵</span>
                  </div>
                </div>
              </template>
            </v-list-item>
          </v-list>

          <!-- Selected Blueprint Details -->
          <v-card
            v-if="selectedBlueprint"
            variant="outlined"
            class="mt-4"
          >
            <v-card-text>
              <div class="text-subtitle-2 mb-2">
                Statystyki bazowe
              </div>
              <v-row dense>
                <v-col cols="4">
                  <div class="text-center">
                    <div class="text-h6">
                      {{ selectedBlueprint.baseIntegrity }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      Integralność
                    </div>
                  </div>
                </v-col>
                <v-col cols="4">
                  <div class="text-center">
                    <div class="text-h6">
                      {{ (selectedBlueprint.baseEfficiency * 100).toFixed(0) }}%
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      Wydajność
                    </div>
                  </div>
                </v-col>
                <v-col cols="4">
                  <div class="text-center">
                    <div class="text-h6">
                      {{ (selectedBlueprint.baseSpeed * 100).toFixed(0) }}%
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      Prędkość
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-btn
            variant="text"
            @click="showCreateDialog = false"
          >
            Anuluj
          </v-btn>
          <v-spacer />
          <v-btn
            color="primary"
            :disabled="!selectedBlueprintId || !canCreate(selectedBlueprintId)"
            @click="createGolem"
          >
            <v-icon start>
              mdi-plus
            </v-icon>
            Stwórz
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.golem-card {
  transition: all 0.2s ease;
}

.golem-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.stat-box {
  background: rgba(255, 255, 255, 0.03);
}
</style>
