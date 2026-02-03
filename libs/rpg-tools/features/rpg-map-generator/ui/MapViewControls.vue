<template>
  <div class="map-view-controls">
    <div class="controls-header">
      <h3>Opcje widoku</h3>
    </div>

    <!-- Przycisk do ponownego generowania mapy -->
    <div class="controls-section">
      <button class="regenerate-button" @click="handleRegenerate">
        <span class="button-icon">🔄</span>
        <span>Generuj nową mapę</span>
      </button>
    </div>

    <div class="controls-section">
      <label class="control-label">Tryb wyświetlania</label>
      <div class="button-group">
        <button
          :class="['control-button', { active: localDisplayMode === 'biomes' }]"
          @click="setDisplayMode('biomes')"
        >
          Biomy
        </button>
        <button
          :class="['control-button', { active: localDisplayMode === 'height' }]"
          @click="setDisplayMode('height')"
        >
          Wysokość
        </button>
      </div>
    </div>

    <div class="controls-section">
      <label class="control-checkbox">
        <input
          type="checkbox"
          :checked="localShowRivers"
          @change="setShowRivers($event.target.checked)"
        />
        <span class="checkbox-label">Pokaż rzeki</span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

export type DisplayMode = 'biomes' | 'height';

const props = defineProps<{
  displayMode?: DisplayMode;
  showRivers?: boolean;
}>();

const emit = defineEmits<{
  'update:displayMode': [value: DisplayMode];
  'update:showRivers': [value: boolean];
  regenerate: [];
}>();

const localDisplayMode = ref<DisplayMode>(props.displayMode || 'biomes');
const localShowRivers = ref<boolean>(props.showRivers !== undefined ? props.showRivers : true);

watch(
  () => props.displayMode,
  (newValue) => {
    if (newValue) {
      localDisplayMode.value = newValue;
    }
  }
);

watch(
  () => props.showRivers,
  (newValue) => {
    if (newValue !== undefined) {
      localShowRivers.value = newValue;
    }
  }
);

function setDisplayMode(mode: DisplayMode): void {
  localDisplayMode.value = mode;
  emit('update:displayMode', mode);
}

function setShowRivers(value: boolean): void {
  localShowRivers.value = value;
  emit('update:showRivers', value);
}

function handleRegenerate(): void {
  emit('regenerate');
}
</script>

<style scoped lang="scss">
.map-view-controls {
  position: fixed;
  left: 0;
  top: 0;
  width: 280px;
  height: 100vh;
  background: rgba(26, 26, 46, 0.95);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.3);
}

.controls-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #e0e0e0;
  }
}

.controls-section {
  margin-bottom: 20px;
}

.control-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #b0b0b0;
  font-weight: 500;
}

.button-group {
  display: flex;
  gap: 8px;
  width: 100%;
}

.control-button {
  flex: 1;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #e0e0e0;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &.active {
    background: #4a90e2;
    border-color: #4a90e2;
    color: #ffffff;
    box-shadow: 0 2px 8px rgba(74, 144, 226, 0.3);

    &:hover {
      background: #5ba0f2;
      border-color: #5ba0f2;
    }
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.2);
  }

  &:focus:not(.active) {
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
  }
}

.regenerate-button {
  width: 100%;
  padding: 12px 16px;
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  border: none;
  border-radius: 6px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(74, 144, 226, 0.3);

  &:hover {
    background: linear-gradient(135deg, #5ba0f2 0%, #4a90e2 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(74, 144, 226, 0.4);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(74, 144, 226, 0.3);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.3);
  }

  .button-icon {
    font-size: 16px;
    display: inline-block;
    animation: none;
  }

  &:hover .button-icon {
    animation: spin 0.6s ease-in-out;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.control-checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 8px 0;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.8;
  }

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: #4a90e2;
  }

  .checkbox-label {
    font-size: 14px;
    color: #e0e0e0;
    user-select: none;
  }
}

/* Scrollbar styling */
.map-view-controls::-webkit-scrollbar {
  width: 6px;
}

.map-view-controls::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.map-view-controls::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
}
</style>

