<template>
  <v-app-bar class="game-header" flat>
    <div class="header-content d-flex align-center justify-space-between w-100 px-4">
      <!-- Logo & Title -->
      <div class="d-flex align-center">
        <v-icon icon="mdi-shield-cross" size="32" color="primary" class="mr-3" />
        <div>
          <h1 class="game-title text-h5">Sanktuarium Solmara</h1>
          <span class="game-subtitle text-caption text-medium-emphasis">
            Czas gry: {{ formattedPlayTime }}
          </span>
        </div>
      </div>

      <!-- Actions -->
      <div class="d-flex align-center gap-2">
        <!-- Pause Button -->
        <v-btn
          :icon="isPaused ? 'mdi-play' : 'mdi-pause'"
          variant="outlined"
          size="small"
          @click="togglePause"
        />

        <!-- Settings -->
        <v-btn icon="mdi-cog" variant="outlined" size="small" @click="showSettings = true" />

        <!-- Save Indicator -->
        <v-tooltip location="bottom">
          <template #activator="{ props }">
            <v-chip
              v-bind="props"
              size="small"
              :color="autoSaveEnabled ? 'success' : 'grey'"
              variant="tonal"
              class="save-chip"
              @click="manualSave"
            >
              <v-icon icon="mdi-content-save" size="14" class="mr-1" />
              {{ lastAutoSaveDisplay || 'Auto-save' }}
            </v-chip>
          </template>
          <span>Kliknij aby zapisać ręcznie</span>
        </v-tooltip>
      </div>
    </div>

    <!-- Settings Dialog -->
    <v-dialog v-model="showSettings" max-width="400">
      <v-card>
        <v-card-title class="text-h5 pa-4">
          <v-icon icon="mdi-cog" class="mr-2" />
          Ustawienia
        </v-card-title>

        <v-card-text>
          <v-list>
            <v-list-item>
              <template #prepend>
                <v-icon icon="mdi-theme-light-dark" />
              </template>
              <v-list-item-title>Motyw</v-list-item-title>
              <template #append>
                <v-btn-toggle v-model="currentTheme" mandatory>
                  <v-btn value="solmar" size="small">Solmar</v-btn>
                  <v-btn value="cult" size="small">Kult</v-btn>
                </v-btn-toggle>
              </template>
            </v-list-item>

            <v-divider class="my-2" />

            <v-list-item @click="handleExport">
              <template #prepend>
                <v-icon icon="mdi-download" />
              </template>
              <v-list-item-title>Eksportuj zapis</v-list-item-title>
            </v-list-item>

            <v-list-item @click="handleImport">
              <template #prepend>
                <v-icon icon="mdi-upload" />
              </template>
              <v-list-item-title>Importuj zapis</v-list-item-title>
            </v-list-item>

            <v-divider class="my-2" />

            <v-list-item class="text-error" @click="handleReset">
              <template #prepend>
                <v-icon icon="mdi-delete-forever" color="error" />
              </template>
              <v-list-item-title>Resetuj grę</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="showSettings = false">Zamknij</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app-bar>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useTheme } from 'vuetify';
import { useGameLoopStore } from '~/stores/gameLoop';
import { storeToRefs } from 'pinia';

const theme = useTheme();
const gameLoopStore = useGameLoopStore();

const { formattedPlayTime, isPaused, autoSaveEnabled, lastAutoSaveDisplay } = storeToRefs(gameLoopStore);
const { togglePause, saveGame } = gameLoopStore;

function manualSave() {
  saveGame();
}

const showSettings = ref(false);
const currentTheme = ref(theme.global.name.value);

// Watch theme changes
watch(currentTheme, (newTheme) => {
  theme.global.name.value = newTheme;
});

function handleExport() {
  // Save before export
  saveGame();

  // Export save data
  const saveData = {
    resources: localStorage.getItem('solmar-resources'),
    entities: localStorage.getItem('solmar-entities'),
    gameloop: localStorage.getItem('solmar-gameloop'),
    timestamp: Date.now(),
  };

  const blob = new Blob([JSON.stringify(saveData)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `solmar-save-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function handleImport() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const text = await file.text();
    try {
      const saveData = JSON.parse(text);
      if (saveData.resources) localStorage.setItem('solmar-resources', saveData.resources);
      if (saveData.entities) localStorage.setItem('solmar-entities', saveData.entities);
      if (saveData.gameloop) localStorage.setItem('solmar-gameloop', saveData.gameloop);
      window.location.reload();
    } catch (err) {
      console.error('Failed to import save:', err);
    }
  };
  input.click();
}

function handleReset() {
  if (confirm('Czy na pewno chcesz zresetować grę? Utracisz cały postęp!')) {
    localStorage.removeItem('solmar-resources');
    localStorage.removeItem('solmar-entities');
    localStorage.removeItem('solmar-gameloop');
    window.location.reload();
  }
}
</script>

<style scoped lang="scss">
.game-header {
  background: linear-gradient(
    180deg,
    rgba(var(--v-theme-surface), 0.98) 0%,
    rgba(var(--v-theme-surface), 0.9) 100%
  ) !important;
  border-bottom: 1px solid rgba(var(--v-theme-primary), 0.3) !important;
  backdrop-filter: blur(8px);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
}

.game-title {
  font-family: var(--font-header-solmar) !important;
  letter-spacing: 0.05em;
}

.game-subtitle {
  font-family: var(--font-body-solmar);
}

.save-chip {
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
}
</style>

