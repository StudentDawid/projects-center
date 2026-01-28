<script setup lang="ts">
/**
 * Settings Panel - QoL settings and customization
 */

import { computed, ref, onMounted } from 'vue';
import { useAteriaGameStore } from '../model/game.store';
import { useAteriaWarriorStore } from '../../warrior/model/warrior.store';
import {
  SETTINGS,
  SETTING_CATEGORIES,
  getSettingsByCategory,
  getDefaultSettings,
  type SettingCategory,
  type SettingDefinition,
} from '../../data/settings.data';

const gameStore = useAteriaGameStore();
const warriorStore = useAteriaWarriorStore();

// Local settings state (initialized from store/defaults)
const localSettings = ref<Record<string, boolean | number | string>>({});

// UI State
const activeCategory = ref<SettingCategory>('general');
const showResetConfirm = ref(false);
const showExportDialog = ref(false);
const showImportDialog = ref(false);
const importData = ref('');

// Initialize settings on mount
onMounted(() => {
  // Merge defaults with stored settings
  const defaults = getDefaultSettings();
  const stored = gameStore.settings || {};
  localSettings.value = { ...defaults, ...stored };
});

// Computed
const categories = computed(() => Object.entries(SETTING_CATEGORIES));
const currentSettings = computed(() => getSettingsByCategory(activeCategory.value));

// Helper functions
function getSettingValue(settingId: string): boolean | number | string {
  return localSettings.value[settingId] ?? getDefaultSettings()[settingId];
}

function updateSetting(settingId: string, value: boolean | number | string) {
  localSettings.value[settingId] = value;
  
  // Apply immediately to game store
  if (gameStore.settings) {
    (gameStore.settings as Record<string, any>)[settingId] = value;
  }

  // Apply specific settings immediately
  if (settingId === 'autoCombatEnabled') {
    warriorStore.autoCombatEnabled = value as boolean;
  }
  if (settingId === 'autoHealThreshold') {
    warriorStore.autoHealThreshold = value as number;
  }
  if (settingId === 'autoPotionEnabled') {
    warriorStore.autoPotionEnabled = value as boolean;
  }
}

function resetToDefaults() {
  localSettings.value = getDefaultSettings();
  showResetConfirm.value = false;

  gameStore.addNotification({
    type: 'info',
    title: 'Ustawienia Zresetowane',
    message: 'Przywrócono domyślne ustawienia',
    icon: 'mdi-cog-refresh',
  });
}

function exportSettings() {
  const exportData = JSON.stringify(localSettings.value, null, 2);
  navigator.clipboard.writeText(exportData);
  showExportDialog.value = false;

  gameStore.addNotification({
    type: 'success',
    title: 'Wyeksportowano',
    message: 'Ustawienia skopiowane do schowka',
    icon: 'mdi-export',
  });
}

function importSettings() {
  try {
    const imported = JSON.parse(importData.value);
    localSettings.value = { ...getDefaultSettings(), ...imported };
    showImportDialog.value = false;
    importData.value = '';

    gameStore.addNotification({
      type: 'success',
      title: 'Zaimportowano',
      message: 'Ustawienia zostały wczytane',
      icon: 'mdi-import',
    });
  } catch (e) {
    gameStore.addNotification({
      type: 'error',
      title: 'Błąd',
      message: 'Nieprawidłowy format danych',
      icon: 'mdi-alert',
    });
  }
}

function exportSaveData() {
  const saveData = {
    version: '1.0.0',
    timestamp: Date.now(),
    game: gameStore.getState(),
    warrior: warriorStore.getState(),
    // Add other stores as needed
  };

  const blob = new Blob([JSON.stringify(saveData)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ateria-idle-save-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);

  gameStore.addNotification({
    type: 'success',
    title: 'Zapis Wyeksportowany',
    message: 'Plik zapisu został pobrany',
    icon: 'mdi-content-save',
  });
}

function clearAllData() {
  if (confirm('CZY NA PEWNO chcesz usunąć WSZYSTKIE dane gry? Ta operacja jest nieodwracalna!')) {
    localStorage.clear();
    window.location.reload();
  }
}
</script>

<template>
  <div class="settings-panel">
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
                color="grey"
                size="56"
                class="mr-4"
              >
                <v-icon
                  size="32"
                  color="white"
                >
                  mdi-cog
                </v-icon>
              </v-avatar>
              <div>
                <div class="text-h5">
                  Ustawienia
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  Dostosuj grę do swoich preferencji
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
              variant="text"
              class="mr-2"
              @click="showExportDialog = true"
            >
              <v-icon start>
                mdi-export
              </v-icon>
              Eksportuj
            </v-btn>
            <v-btn
              variant="text"
              @click="showImportDialog = true"
            >
              <v-icon start>
                mdi-import
              </v-icon>
              Importuj
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-row>
      <!-- Categories Sidebar -->
      <v-col
        cols="12"
        md="3"
      >
        <v-card>
          <v-list
            nav
            density="comfortable"
          >
            <v-list-item
              v-for="[id, category] in categories"
              :key="id"
              :value="id"
              :active="activeCategory === id"
              @click="activeCategory = id as SettingCategory"
            >
              <template #prepend>
                <v-icon :color="category.color">
                  {{ category.icon }}
                </v-icon>
              </template>
              <v-list-item-title>{{ category.name }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Settings Content -->
      <v-col
        cols="12"
        md="9"
      >
        <v-card>
          <v-card-title>
            <v-icon
              class="mr-2"
              :color="SETTING_CATEGORIES[activeCategory].color"
            >
              {{ SETTING_CATEGORIES[activeCategory].icon }}
            </v-icon>
            {{ SETTING_CATEGORIES[activeCategory].name }}
          </v-card-title>
          <v-card-text>
            <div
              v-for="setting in currentSettings"
              :key="setting.id"
              class="setting-item pa-3 rounded mb-3"
            >
              <div class="d-flex justify-space-between align-center">
                <div class="flex-grow-1 mr-4">
                  <div class="text-body-1">
                    {{ setting.name }}
                  </div>
                  <div class="text-body-2 text-medium-emphasis">
                    {{ setting.description }}
                  </div>
                </div>

                <!-- Toggle -->
                <v-switch
                  v-if="setting.type === 'toggle'"
                  :model-value="getSettingValue(setting.id) as boolean"
                  color="primary"
                  hide-details
                  @update:model-value="updateSetting(setting.id, $event)"
                />

                <!-- Slider -->
                <div
                  v-else-if="setting.type === 'slider'"
                  style="width: 200px"
                >
                  <v-slider
                    :model-value="getSettingValue(setting.id) as number"
                    :min="setting.min"
                    :max="setting.max"
                    :step="setting.step"
                    color="primary"
                    thumb-label
                    hide-details
                    @update:model-value="updateSetting(setting.id, $event)"
                  />
                </div>

                <!-- Select -->
                <v-select
                  v-else-if="setting.type === 'select'"
                  :model-value="getSettingValue(setting.id)"
                  :items="setting.options"
                  item-title="label"
                  item-value="value"
                  density="compact"
                  variant="outlined"
                  hide-details
                  style="max-width: 200px"
                  @update:model-value="updateSetting(setting.id, $event)"
                />
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Data Management -->
    <v-card class="mt-4">
      <v-card-title>
        <v-icon
          class="mr-2"
          color="warning"
        >
          mdi-database
        </v-icon>
        Zarządzanie Danymi
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col
            cols="12"
            md="4"
          >
            <v-btn
              block
              color="primary"
              variant="tonal"
              @click="exportSaveData"
            >
              <v-icon start>
                mdi-content-save-outline
              </v-icon>
              Eksportuj Zapis
            </v-btn>
          </v-col>
          <v-col
            cols="12"
            md="4"
          >
            <v-btn
              block
              color="warning"
              variant="tonal"
              @click="showResetConfirm = true"
            >
              <v-icon start>
                mdi-cog-refresh
              </v-icon>
              Resetuj Ustawienia
            </v-btn>
          </v-col>
          <v-col
            cols="12"
            md="4"
          >
            <v-btn
              block
              color="error"
              variant="tonal"
              @click="clearAllData"
            >
              <v-icon start>
                mdi-delete-forever
              </v-icon>
              Usuń Wszystkie Dane
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Reset Confirm Dialog -->
    <v-dialog
      v-model="showResetConfirm"
      max-width="400"
    >
      <v-card>
        <v-card-title>Resetuj Ustawienia?</v-card-title>
        <v-card-text>
          Czy na pewno chcesz przywrócić wszystkie ustawienia do wartości domyślnych?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="showResetConfirm = false"
          >
            Anuluj
          </v-btn>
          <v-btn
            color="warning"
            @click="resetToDefaults"
          >
            Resetuj
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Export Dialog -->
    <v-dialog
      v-model="showExportDialog"
      max-width="500"
    >
      <v-card>
        <v-card-title>Eksportuj Ustawienia</v-card-title>
        <v-card-text>
          <v-textarea
            :model-value="JSON.stringify(localSettings, null, 2)"
            readonly
            auto-grow
            rows="10"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="showExportDialog = false"
          >
            Zamknij
          </v-btn>
          <v-btn
            color="primary"
            @click="exportSettings"
          >
            Kopiuj do Schowka
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Import Dialog -->
    <v-dialog
      v-model="showImportDialog"
      max-width="500"
    >
      <v-card>
        <v-card-title>Importuj Ustawienia</v-card-title>
        <v-card-text>
          <v-textarea
            v-model="importData"
            label="Wklej dane ustawień (JSON)"
            auto-grow
            rows="10"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="showImportDialog = false"
          >
            Anuluj
          </v-btn>
          <v-btn
            color="primary"
            :disabled="!importData"
            @click="importSettings"
          >
            Importuj
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.setting-item {
  background: rgba(255, 255, 255, 0.03);
  transition: background 0.2s ease;
}

.setting-item:hover {
  background: rgba(255, 255, 255, 0.05);
}
</style>
