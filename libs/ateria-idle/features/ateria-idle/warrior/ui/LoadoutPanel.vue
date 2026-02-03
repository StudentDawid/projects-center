<script setup lang="ts">
/**
 * Loadout Panel - UI for managing equipment presets
 */

import { computed, ref } from 'vue';
import { useAteriaWarriorStore } from '../model/warrior.store';
import { useAteriaPrestigeStore } from '../../core/model/prestige.store';
import {
  EQUIPMENT_SLOTS,
  LOADOUT_PRESETS,
  createEmptyLoadout,
  getMaxLoadoutSlots,
  getLoadoutCompleteness,
  type Loadout,
} from '../../data/loadouts.data';
import { getItem } from '../../data/items.data';

const warriorStore = useAteriaWarriorStore();
const prestigeStore = useAteriaPrestigeStore();

// UI State
const showCreateDialog = ref(false);
const showEditDialog = ref(false);
const newLoadoutName = ref('');
const selectedPresetId = ref<string | null>(null);
const editingLoadout = ref<Loadout | null>(null);

// Computed
const loadouts = computed(() => warriorStore.loadouts || []);
const activeLoadoutId = computed(() => warriorStore.activeLoadoutId);
const maxLoadouts = computed(() => 
  getMaxLoadoutSlots(
    warriorStore.stats.level,
    prestigeStore.prestigeCount,
    0 // purchased slots
  )
);

const equippedItems = computed(() => warriorStore.equipment || {});

// Helper functions
function getSlotIcon(slotId: string): string {
  const slot = EQUIPMENT_SLOTS.find(s => s.id === slotId);
  return slot?.icon || 'mdi-help';
}

function getSlotName(slotId: string): string {
  const slot = EQUIPMENT_SLOTS.find(s => s.id === slotId);
  return slot?.name || slotId;
}

function getItemName(itemId: string | undefined): string {
  if (!itemId) return 'Pusty';
  const item = getItem(itemId);
  return item?.name || itemId;
}

function getCompletenessColor(loadout: Loadout): string {
  const percent = getLoadoutCompleteness(loadout) * 100;
  if (percent >= 80) return 'success';
  if (percent >= 50) return 'info';
  if (percent >= 25) return 'warning';
  return 'grey';
}

function isLoadoutActive(loadout: Loadout): boolean {
  return activeLoadoutId.value === loadout.id;
}

function formatDate(timestamp: number): string {
  if (!timestamp) return 'Nigdy';
  return new Date(timestamp).toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// Actions
function openCreateDialog() {
  newLoadoutName.value = '';
  selectedPresetId.value = null;
  showCreateDialog.value = true;
}

function createLoadout() {
  if (!newLoadoutName.value.trim()) return;

  const id = `loadout_${Date.now()}`;
  const loadout = createEmptyLoadout(id, newLoadoutName.value.trim());

  // Apply preset settings if selected
  if (selectedPresetId.value) {
    const preset = LOADOUT_PRESETS.find(p => p.id === selectedPresetId.value);
    if (preset) {
      loadout.icon = preset.icon;
      loadout.color = preset.color;
      loadout.autoPotionSettings = { ...preset.autoPotionSettings };
    }
  }

  // Copy current equipment to loadout
  loadout.slots = { ...equippedItems.value };

  warriorStore.addLoadout(loadout);
  showCreateDialog.value = false;
}

function activateLoadout(loadout: Loadout) {
  warriorStore.activateLoadout(loadout.id);
}

function editLoadout(loadout: Loadout) {
  editingLoadout.value = { ...loadout, slots: { ...loadout.slots } };
  showEditDialog.value = true;
}

function saveEditedLoadout() {
  if (!editingLoadout.value) return;
  warriorStore.updateLoadout(editingLoadout.value);
  showEditDialog.value = false;
  editingLoadout.value = null;
}

function deleteLoadout(loadout: Loadout) {
  if (confirm(`Czy na pewno chcesz usunąć zestaw "${loadout.name}"?`)) {
    warriorStore.removeLoadout(loadout.id);
  }
}

function saveCurrentEquipment(loadout: Loadout) {
  const updated = { ...loadout, slots: { ...equippedItems.value } };
  warriorStore.updateLoadout(updated);
}
</script>

<template>
  <div class="loadout-panel">
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
                color="deep-purple"
                size="56"
                class="mr-4"
              >
                <v-icon
                  size="32"
                  color="white"
                >
                  mdi-bag-personal
                </v-icon>
              </v-avatar>
              <div>
                <div class="text-h5">
                  Zestawy Ekwipunku
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  Zapisane zestawy: {{ loadouts.length }} / {{ maxLoadouts }}
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
              color="deep-purple"
              :disabled="loadouts.length >= maxLoadouts"
              @click="openCreateDialog"
            >
              <v-icon start>
                mdi-plus
              </v-icon>
              Nowy Zestaw
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Current Equipment Overview -->
    <v-card class="mb-4">
      <v-card-title>
        <v-icon
          class="mr-2"
          color="info"
        >
          mdi-shield-account
        </v-icon>
        Aktualny Ekwipunek
      </v-card-title>
      <v-card-text>
        <v-row dense>
          <v-col
            v-for="slot in EQUIPMENT_SLOTS"
            :key="slot.id"
            cols="6"
            md="4"
            lg="3"
          >
            <div class="slot-box pa-2 rounded d-flex align-center">
              <v-icon
                :color="equippedItems[slot.id] ? 'primary' : 'grey'"
                size="24"
                class="mr-2"
              >
                {{ slot.icon }}
              </v-icon>
              <div class="flex-grow-1">
                <div class="text-caption text-medium-emphasis">
                  {{ slot.name }}
                </div>
                <div class="text-body-2 text-truncate">
                  {{ getItemName(equippedItems[slot.id]) }}
                </div>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Loadouts Grid -->
    <v-row v-if="loadouts.length > 0">
      <v-col
        v-for="loadout in loadouts"
        :key="loadout.id"
        cols="12"
        md="6"
        lg="4"
      >
        <v-card
          class="loadout-card"
          :class="{ 'loadout-active': isLoadoutActive(loadout) }"
        >
          <v-card-text>
            <div class="d-flex align-center mb-3">
              <v-avatar
                :color="loadout.color || 'grey'"
                size="48"
                class="mr-3"
              >
                <v-icon
                  size="28"
                  color="white"
                >
                  {{ loadout.icon || 'mdi-bag-personal' }}
                </v-icon>
              </v-avatar>
              <div class="flex-grow-1">
                <div class="text-body-1 font-weight-medium">
                  {{ loadout.name }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  Ostatnio użyty: {{ formatDate(loadout.lastUsed) }}
                </div>
              </div>
              <v-chip
                v-if="isLoadoutActive(loadout)"
                color="success"
                size="small"
              >
                Aktywny
              </v-chip>
            </div>

            <!-- Completeness -->
            <div class="mb-3">
              <div class="d-flex justify-space-between text-caption mb-1">
                <span>Kompletność</span>
                <span>{{ Math.round(getLoadoutCompleteness(loadout) * 100) }}%</span>
              </div>
              <v-progress-linear
                :model-value="getLoadoutCompleteness(loadout) * 100"
                :color="getCompletenessColor(loadout)"
                height="6"
                rounded
              />
            </div>

            <!-- Quick preview of slots -->
            <div class="d-flex flex-wrap gap-1 mb-3">
              <v-tooltip
                v-for="slot in EQUIPMENT_SLOTS.slice(0, 5)"
                :key="slot.id"
                :text="loadout.slots[slot.id] ? getItemName(loadout.slots[slot.id]) : 'Pusty'"
              >
                <template #activator="{ props }">
                  <v-avatar
                    v-bind="props"
                    size="32"
                    :color="loadout.slots[slot.id] ? 'primary' : 'grey-darken-3'"
                  >
                    <v-icon
                      size="18"
                      color="white"
                    >
                      {{ slot.icon }}
                    </v-icon>
                  </v-avatar>
                </template>
              </v-tooltip>
              <v-avatar
                v-if="EQUIPMENT_SLOTS.length > 5"
                size="32"
                color="grey-darken-3"
              >
                <span class="text-caption">+{{ EQUIPMENT_SLOTS.length - 5 }}</span>
              </v-avatar>
            </div>

            <!-- Auto-potion settings -->
            <div
              v-if="loadout.autoPotionSettings?.enabled"
              class="text-caption text-medium-emphasis mb-3"
            >
              <v-icon
                size="14"
                class="mr-1"
              >
                mdi-flask
              </v-icon>
              Auto-mikstury: włączone (próg HP: {{ loadout.autoPotionSettings.healThreshold }}%)
            </div>

            <!-- Actions -->
            <div class="d-flex gap-2">
              <v-btn
                v-if="!isLoadoutActive(loadout)"
                color="success"
                variant="tonal"
                size="small"
                @click="activateLoadout(loadout)"
              >
                <v-icon start>
                  mdi-check
                </v-icon>
                Aktywuj
              </v-btn>
              <v-btn
                color="info"
                variant="tonal"
                size="small"
                @click="saveCurrentEquipment(loadout)"
              >
                <v-icon start>
                  mdi-content-save
                </v-icon>
                Zapisz
              </v-btn>
              <v-spacer />
              <v-btn
                icon
                size="small"
                variant="text"
                @click="editLoadout(loadout)"
              >
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn
                icon
                size="small"
                variant="text"
                color="error"
                @click="deleteLoadout(loadout)"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Empty State -->
    <v-card
      v-else
      class="text-center py-8"
    >
      <v-icon
        size="64"
        color="grey"
      >
        mdi-bag-personal-off
      </v-icon>
      <div class="text-h6 mt-4">
        Brak zapisanych zestawów
      </div>
      <div class="text-body-2 text-medium-emphasis mb-4">
        Stwórz zestaw aby szybko zmieniać ekwipunek
      </div>
      <v-btn
        color="deep-purple"
        @click="openCreateDialog"
      >
        <v-icon start>
          mdi-plus
        </v-icon>
        Stwórz Pierwszy Zestaw
      </v-btn>
    </v-card>

    <!-- Presets Info -->
    <v-card class="mt-4">
      <v-card-title>
        <v-icon
          class="mr-2"
          color="amber"
        >
          mdi-star
        </v-icon>
        Szablony Zestawów
      </v-card-title>
      <v-card-text>
        <v-row dense>
          <v-col
            v-for="preset in LOADOUT_PRESETS"
            :key="preset.id"
            cols="6"
            md="4"
            lg="2"
          >
            <v-card
              variant="outlined"
              class="preset-card text-center pa-3"
            >
              <v-icon
                :color="preset.color"
                size="32"
                class="mb-2"
              >
                {{ preset.icon }}
              </v-icon>
              <div class="text-body-2 font-weight-medium">
                {{ preset.name }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ preset.description }}
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Create Loadout Dialog -->
    <v-dialog
      v-model="showCreateDialog"
      max-width="500"
    >
      <v-card>
        <v-card-title class="d-flex align-center bg-deep-purple">
          <v-icon
            class="mr-2"
            color="white"
          >
            mdi-bag-personal
          </v-icon>
          <span class="text-white">Nowy Zestaw</span>
        </v-card-title>

        <v-card-text class="pt-4">
          <v-text-field
            v-model="newLoadoutName"
            label="Nazwa zestawu"
            variant="outlined"
            autofocus
            class="mb-4"
          />

          <div class="text-subtitle-2 mb-2">
            Wybierz szablon (opcjonalnie)
          </div>
          <v-chip-group
            v-model="selectedPresetId"
            column
          >
            <v-chip
              v-for="preset in LOADOUT_PRESETS"
              :key="preset.id"
              :value="preset.id"
              :color="selectedPresetId === preset.id ? preset.color : 'default'"
              variant="outlined"
            >
              <v-icon
                start
                size="16"
              >
                {{ preset.icon }}
              </v-icon>
              {{ preset.name }}
            </v-chip>
          </v-chip-group>

          <v-alert
            type="info"
            variant="tonal"
            class="mt-4"
          >
            Nowy zestaw zostanie utworzony z Twoim aktualnym ekwipunkiem.
          </v-alert>
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
            color="deep-purple"
            :disabled="!newLoadoutName.trim()"
            @click="createLoadout"
          >
            <v-icon start>
              mdi-plus
            </v-icon>
            Stwórz
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit Loadout Dialog -->
    <v-dialog
      v-model="showEditDialog"
      max-width="600"
    >
      <v-card v-if="editingLoadout">
        <v-card-title class="d-flex align-center bg-deep-purple">
          <v-icon
            class="mr-2"
            color="white"
          >
            mdi-pencil
          </v-icon>
          <span class="text-white">Edytuj Zestaw</span>
        </v-card-title>

        <v-card-text class="pt-4">
          <v-text-field
            v-model="editingLoadout.name"
            label="Nazwa zestawu"
            variant="outlined"
            class="mb-4"
          />

          <v-row>
            <v-col cols="6">
              <v-select
                v-model="editingLoadout.icon"
                :items="['mdi-sword', 'mdi-shield', 'mdi-sword-cross', 'mdi-bag-personal', 'mdi-star', 'mdi-lightning-bolt']"
                label="Ikona"
                variant="outlined"
              >
                <template #selection="{ item }">
                  <v-icon>{{ item.value }}</v-icon>
                </template>
                <template #item="{ item, props }">
                  <v-list-item v-bind="props">
                    <template #prepend>
                      <v-icon>{{ item.value }}</v-icon>
                    </template>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>
            <v-col cols="6">
              <v-select
                v-model="editingLoadout.color"
                :items="['blue', 'red', 'green', 'amber', 'purple', 'grey']"
                label="Kolor"
                variant="outlined"
              >
                <template #selection="{ item }">
                  <v-chip
                    :color="item.value"
                    size="small"
                  >
                    {{ item.value }}
                  </v-chip>
                </template>
              </v-select>
            </v-col>
          </v-row>

          <v-divider class="my-4" />

          <div class="text-subtitle-2 mb-2">
            Ustawienia Auto-Mikstur
          </div>
          <v-switch
            v-model="editingLoadout.autoPotionSettings.enabled"
            label="Włącz auto-mikstury"
            color="success"
            hide-details
          />
          <v-slider
            v-model="editingLoadout.autoPotionSettings.healThreshold"
            :disabled="!editingLoadout.autoPotionSettings.enabled"
            label="Próg HP do leczenia"
            :min="10"
            :max="90"
            :step="5"
            thumb-label
            class="mt-4"
          />
          <v-switch
            v-model="editingLoadout.autoPotionSettings.useBuffsOnCombatStart"
            :disabled="!editingLoadout.autoPotionSettings.enabled"
            label="Użyj buffów na starcie walki"
            color="info"
            hide-details
          />
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-btn
            variant="text"
            @click="showEditDialog = false"
          >
            Anuluj
          </v-btn>
          <v-spacer />
          <v-btn
            color="deep-purple"
            @click="saveEditedLoadout"
          >
            <v-icon start>
              mdi-content-save
            </v-icon>
            Zapisz
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.loadout-card {
  transition: all 0.2s ease;
}

.loadout-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.loadout-active {
  border: 2px solid rgba(76, 175, 80, 0.5);
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, transparent 100%);
}

.slot-box {
  background: rgba(255, 255, 255, 0.03);
}

.preset-card {
  transition: all 0.2s ease;
  cursor: pointer;
}

.preset-card:hover {
  background: rgba(255, 255, 255, 0.05);
}
</style>
