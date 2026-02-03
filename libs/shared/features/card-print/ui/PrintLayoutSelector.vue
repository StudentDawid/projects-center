<template>
  <div class="print-layout-selector">
    <h3>Ustawienia układu</h3>

    <div class="settings-grid">
      <div class="setting-group">
        <label for="columns">Kolumny</label>
        <input
          id="columns"
          v-model.number="localSettings.columns"
          type="number"
          min="1"
          max="6"
          @input="updateSettings"
        />
      </div>

      <div class="setting-group">
        <label for="rows">Wiersze</label>
        <input
          id="rows"
          v-model.number="localSettings.rows"
          type="number"
          min="1"
          max="6"
          @input="updateSettings"
        />
      </div>

      <div class="setting-group">
        <label for="orientation">Orientacja</label>
        <select id="orientation" v-model="localSettings.orientation" @change="updateSettings">
          <option value="portrait">Pionowa</option>
          <option value="landscape">Pozioma</option>
        </select>
      </div>
    </div>

    <div class="margins-section">
      <h4>Marginesy (mm)</h4>
      <div class="margins-grid">
        <div class="setting-group">
          <label for="margin-top">Góra</label>
          <input
            id="margin-top"
            v-model.number="localSettings.margins.top"
            type="number"
            min="0"
            @input="updateSettings"
          />
        </div>
        <div class="setting-group">
          <label for="margin-right">Prawo</label>
          <input
            id="margin-right"
            v-model.number="localSettings.margins.right"
            type="number"
            min="0"
            @input="updateSettings"
          />
        </div>
        <div class="setting-group">
          <label for="margin-bottom">Dół</label>
          <input
            id="margin-bottom"
            v-model.number="localSettings.margins.bottom"
            type="number"
            min="0"
            @input="updateSettings"
          />
        </div>
        <div class="setting-group">
          <label for="margin-left">Lewo</label>
          <input
            id="margin-left"
            v-model.number="localSettings.margins.left"
            type="number"
            min="0"
            @input="updateSettings"
          />
        </div>
      </div>
    </div>

    <div class="options-section">
      <label class="checkbox-label">
        <input
          v-model="localSettings.showBorders"
          type="checkbox"
          @change="updateSettings"
        />
        <span>Pokaż ramki</span>
      </label>
      <label class="checkbox-label">
        <input
          v-model="localSettings.showCutLines"
          type="checkbox"
          @change="updateSettings"
        />
        <span>Pokaż linie cięcia</span>
      </label>
    </div>

    <div class="info-box">
      <p><strong>Karty na stronę:</strong> {{ maxCardsPerPage }}</p>
      <p><strong>Wybranych kart:</strong> {{ selectedCount }}</p>
      <p><strong>Stron:</strong> {{ totalPages }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { PrintLayoutSettings } from '@shared/entities/card';

const props = defineProps<{
  settings: PrintLayoutSettings;
  selectedCount: number;
}>();

const emit = defineEmits<{
  'update:settings': [settings: PrintLayoutSettings];
}>();

const localSettings = ref<PrintLayoutSettings>({ ...props.settings });

watch(
  () => props.settings,
  (newSettings) => {
    localSettings.value = { ...newSettings };
  },
  { deep: true }
);

const maxCardsPerPage = computed(
  () => localSettings.value.columns * localSettings.value.rows
);

const totalPages = computed(() => {
  if (props.selectedCount === 0) return 0;
  return Math.ceil(props.selectedCount / maxCardsPerPage.value);
});

function updateSettings(): void {
  emit('update:settings', { ...localSettings.value });
}
</script>

<style scoped lang="scss">
.print-layout-selector {
  background: rgba(20, 20, 40, 0.95);
  border: 2px solid rgba(139, 69, 19, 0.6);
  border-radius: 12px;
  padding: 1.5rem;
}

h3 {
  margin: 0 0 1.5rem 0;
  color: #f4d03f;
  font-family: 'Cinzel', 'Georgia', serif;
  font-size: 1.2rem;
}

h4 {
  margin: 0 0 1rem 0;
  color: #d4a574;
  font-size: 1rem;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.margins-section {
  margin-bottom: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.margins-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.setting-group {
  label {
    display: block;
    margin-bottom: 0.5rem;
    color: #d4a574;
    font-weight: 600;
    font-size: 0.9rem;
  }

  input,
  select {
    width: 100%;
    padding: 0.5rem;
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(139, 69, 19, 0.5);
    border-radius: 6px;
    color: #d0d0d0;
    font-size: 1rem;

    &:focus {
      outline: none;
      border-color: rgba(184, 134, 11, 0.8);
      box-shadow: 0 0 0 3px rgba(184, 134, 11, 0.2);
    }
  }
}

.options-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  color: #d0d0d0;

  input[type='checkbox'] {
    width: 20px;
    height: 20px;
    cursor: pointer;
    accent-color: #8b4513;
  }
}

.info-box {
  padding: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(139, 69, 19, 0.4);

  p {
    margin: 0.5rem 0;
    color: #d0d0d0;

    strong {
      color: #f4d03f;
    }
  }
}
</style>

