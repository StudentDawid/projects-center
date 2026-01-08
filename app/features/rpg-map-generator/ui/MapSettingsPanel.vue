<template>
  <aside class="generator-sidebar">
    <!-- Header with close button -->
    <div class="sidebar-header">
      <h2 class="section-title">
        <v-icon icon="mdi-cog" size="20" class="mr-2" />
        Ustawienia mapy
      </h2>
      <button class="close-btn" @click="$emit('close')" aria-label="Zamknij menu">
        <v-icon icon="mdi-close" size="20" />
      </button>
    </div>

    <div class="sidebar-content">
      <div class="sidebar-section">
        <h2 class="section-title">
          <v-icon icon="mdi-terrain" size="20" class="mr-2" />
          Parametry terenu
        </h2>

        <div class="setting-group">
          <label class="setting-label">Gęstość mapy: {{ densityLabel }}</label>
          <input
            :value="mapSettings.size"
            type="range"
            min="256"
            max="1024"
            step="128"
            class="range-slider"
            @input="
              store.setSettings({
                size: Number(($event.target as HTMLInputElement).value),
              })
            "
          />
          <div class="setting-hint">
            Wyższa gęstość = więcej szczegółów (wolniejsze generowanie)
          </div>
        </div>

      <div class="setting-group">
        <label class="setting-label">Seed</label>
        <div class="seed-input-wrapper">
          <input
            :value="mapSettings.seed"
            type="text"
            class="seed-input"
            placeholder="Losowy..."
            @input="store.setSettings({ seed: ($event.target as HTMLInputElement).value })"
          />
          <button class="seed-random-btn" @click="store.randomizeSeed">
            <v-icon icon="mdi-dice-6" size="18" />
          </button>
        </div>
      </div>

      <div class="setting-group">
        <label class="setting-label"
          >Poziom wody: {{ mapSettings.waterLevel }}%</label
        >
        <input
          :value="mapSettings.waterLevel"
          type="range"
          min="0"
          max="100"
          class="range-slider"
          @input="
            store.setSettings({
              waterLevel: Number(($event.target as HTMLInputElement).value),
            })
          "
        />
      </div>

      <div class="setting-group">
        <label class="setting-label"
          >Górzystość: {{ mapSettings.mountainLevel }}%</label
        >
        <input
          :value="mapSettings.mountainLevel"
          type="range"
          min="0"
          max="100"
          class="range-slider"
          @input="
            store.setSettings({
              mountainLevel: Number(($event.target as HTMLInputElement).value),
            })
          "
        />
      </div>

          <div class="setting-group">
            <label class="setting-label"
              >Zalesionie: {{ mapSettings.forestLevel }}%</label
            >
            <input
              :value="mapSettings.forestLevel"
              type="range"
              min="0"
              max="100"
              class="range-slider"
              @input="
                store.setSettings({
                  forestLevel: Number(($event.target as HTMLInputElement).value),
                })
              "
            />
          </div>

          <div class="setting-group">
            <label class="setting-label">
              <input
                type="checkbox"
                :checked="mapSettings.useVoronoi"
                @change="
                  store.setSettings({
                    useVoronoi: ($event.target as HTMLInputElement).checked,
                  })
                "
                class="checkbox-input"
              />
              <span>Używaj komórek Voronoi</span>
            </label>
          </div>

          <div
            v-if="mapSettings.useVoronoi"
            class="setting-group"
          >
            <label class="setting-label"
              >Liczba komórek: {{ mapSettings.voronoiCellCount }}</label
            >
            <input
              :value="mapSettings.voronoiCellCount"
              type="range"
              min="0"
              max="10000"
              step="100"
              class="range-slider"
              @input="
                store.setSettings({
                  voronoiCellCount: Number(($event.target as HTMLInputElement).value),
                })
              "
            />
            <div class="setting-hint">
              Więcej komórek = równomierniejszy rozkład, wolniejsze generowanie
            </div>
          </div>
      </div>

      <div class="sidebar-section">
        <h2 class="section-title">
          <v-icon icon="mdi-city" size="20" class="mr-2" />
          Osady
        </h2>

        <div class="setting-group">
          <label class="setting-label">Liczba miast: {{ mapSettings.cityCount }}</label>
          <input
            :value="mapSettings.cityCount"
            type="range"
            min="0"
            max="20"
            class="range-slider"
            @input="
              store.setSettings({
                cityCount: Number(($event.target as HTMLInputElement).value),
              })
            "
          />
        </div>

        <div class="setting-group">
          <label class="setting-label"
            >Liczba wiosek: {{ mapSettings.villageCount }}</label
          >
          <input
            :value="mapSettings.villageCount"
            type="range"
            min="0"
            max="50"
            class="range-slider"
            @input="
              store.setSettings({
                villageCount: Number(($event.target as HTMLInputElement).value),
              })
            "
          />
        </div>
      </div>

        <div class="sidebar-actions">
          <button class="generate-btn" @click="$emit('generate')">
            <v-icon icon="mdi-creation" size="20" class="mr-2" />
            Generuj mapę
          </button>
          <button
            class="export-btn"
            :disabled="!store.hasMap"
            @click="$emit('export')"
          >
            <v-icon icon="mdi-download" size="20" class="mr-2" />
            Eksportuj PNG
          </button>
        </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useMapGeneratorStore } from '~/stores/map-generator/map-generator';

defineEmits<{
  generate: [];
  export: [];
  close: [];
}>();

const store = useMapGeneratorStore();
const mapSettings = computed(() => store.mapSettings);

const densityLabel = computed(() => {
  const size = mapSettings.value.size;
  if (size <= 256) return 'Niska';
  if (size <= 512) return 'Średnia';
  if (size <= 768) return 'Wysoka';
  return 'Bardzo wysoka';
});
</script>

<style scoped lang="scss">
.generator-sidebar {
  width: 360px;
  max-width: 85vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.95);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 16px 16px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.close-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    color: #fff;
  }
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  // Custom scrollbar
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
}

.sidebar-section {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.section-title {
  font-family: 'Cinzel', serif;
  font-size: 1rem;
  color: #4caf50;
  margin: 0;
  display: flex;
  align-items: center;
}

.setting-group {
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}

.setting-label {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
}

.setting-hint {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 4px;
  font-style: italic;
}

.checkbox-input {
  margin-right: 8px;
  cursor: pointer;
  width: 16px;
  height: 16px;
}

.size-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.size-btn {
  flex: 1;
  min-width: 60px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  &.active {
    background: rgba(76, 175, 80, 0.2);
    border-color: #4caf50;
    color: #4caf50;
  }
}

.seed-input-wrapper {
  display: flex;
  gap: 8px;
}

.seed-input {
  flex: 1;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #fff;
  font-family: monospace;
  font-size: 0.875rem;

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }

  &:focus {
    outline: none;
    border-color: #4caf50;
  }
}

.seed-random-btn {
  padding: 8px 12px;
  background: rgba(76, 175, 80, 0.2);
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 6px;
  color: #4caf50;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(76, 175, 80, 0.3);
  }
}

.range-slider {
  width: 100%;
  height: 6px;
  appearance: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  cursor: pointer;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    background: #4caf50;
    border-radius: 50%;
    cursor: pointer;
    transition: transform 0.2s;

    &:hover {
      transform: scale(1.2);
    }
  }

  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: #4caf50;
    border-radius: 50%;
    border: none;
    cursor: pointer;
  }
}

.sidebar-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: auto;
  padding-top: 16px;
}

.generate-btn,
.export-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.generate-btn {
  background: linear-gradient(135deg, #4caf50, #388e3c);
  border: none;
  color: #fff;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
  }
}

.export-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.8);

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>

