<template>
  <div class="map-generator-page">
    <!-- Toggle Menu Button -->
    <button
      :aria-label="isMenuOpen ? 'Ukryj menu' : 'Pokaż menu'"
      class="menu-toggle-btn"
      @click="toggleMenu"
    >
      <v-icon :icon="isMenuOpen ? 'mdi-close' : 'mdi-menu'" size="24" />
    </button>

    <!-- Sidebar - Settings (Overlay) -->
    <Transition name="sidebar">
      <MapSettingsPanel
        v-if="isMenuOpen"
        class="settings-sidebar"
        @generate="handleGenerate"
        @export="handleExport"
        @close="closeMenu"
      />
    </Transition>

    <!-- Map Canvas - Full Screen -->
    <div class="map-content-wrapper">
      <MapCanvas ref="mapCanvasRef" />
      <MapLegend />
    </div>

    <!-- Status bar - Floating -->
    <div v-if="store.hasMap" class="status-bar">
      <span>
        Seed: {{ store.mapSettings.seed }} • Rozmiar: {{ screenWidth }}×{{
          screenHeight
        }}
        • Gęstość: {{ densityLabel }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, type ComponentPublicInstance } from 'vue';
import { useMapGeneratorStore } from '~/stores/map-generator/map-generator';
import { useWindowSize } from '~/shared/lib/useWindowSize';
import MapCanvas from '~/features/rpg-map-generator/ui/MapCanvas.vue';
import MapSettingsPanel from '~/features/rpg-map-generator/ui/MapSettingsPanel.vue';
import MapLegend from '~/features/rpg-map-generator/ui/MapLegend.vue';

// Define interface for exposed methods from MapCanvas
interface MapCanvasInstance {
  generateMap: () => Promise<void>;
  exportMap: () => Promise<string | null>;
}

// Page meta
useHead({
  title: 'Generator Map RPG - Projects Center',
});

const store = useMapGeneratorStore();
const { width, height } = useWindowSize();
const mapCanvasRef = ref<(ComponentPublicInstance & MapCanvasInstance) | null>(
  null
);
const isMenuOpen = ref(false);

const screenWidth = computed(() => width.value || 0);
const screenHeight = computed(() => height.value || 0);
const densityLabel = computed(() => {
  const size = store.mapSettings.size;
  if (size <= 256) return 'Niska';
  if (size <= 512) return 'Średnia';
  if (size <= 768) return 'Wysoka';
  return 'Bardzo wysoka';
});

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value;
}

function closeMenu() {
  isMenuOpen.value = false;
}

async function handleGenerate() {
  if (!mapCanvasRef.value) return;
  await mapCanvasRef.value.generateMap();
}

async function handleExport() {
  if (!mapCanvasRef.value) return;

  const dataUrl = await mapCanvasRef.value.exportMap();
  if (!dataUrl) return;

  const link = document.createElement('a');
  link.download = `rpg-map-${store.mapSettings.seed}.png`;
  link.href = dataUrl;
  link.click();
}

// Lifecycle
onMounted(() => {
  // Pre-fill seed if empty
  if (!store.mapSettings.seed) {
    store.randomizeSeed();
  }
});
</script>

<style scoped lang="scss">
.map-generator-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: #e0e0e0;
  overflow: hidden;
}

// Toggle Menu Button
.menu-toggle-btn {
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 1001;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

  &:hover {
    background: rgba(0, 0, 0, 0.9);
    border-color: #4caf50;
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(76, 175, 80, 0.3);
  }

  &:active {
    transform: scale(0.95);
  }
}

// Settings Sidebar
.settings-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 1000;
  overflow-y: auto;
  overflow-x: hidden;
}

// Sidebar Animation
.sidebar-enter-active,
.sidebar-leave-active {
  transition: transform 0.3s ease-in-out;
}

.sidebar-enter-from {
  transform: translateX(-100%);
}

.sidebar-leave-to {
  transform: translateX(-100%);
}

.sidebar-enter-to,
.sidebar-leave-from {
  transform: translateX(0);
}

// Map Content Wrapper - Full Screen
.map-content-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

// Status Bar - Floating
.status-bar {
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 999;
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

// Responsive
@media (max-width: 768px) {
  .menu-toggle-btn {
    width: 44px;
    height: 44px;
    top: 12px;
    left: 12px;
  }

  .map-content-wrapper {
    padding: 72px 16px 52px 16px;
  }

  .status-bar {
    bottom: 12px;
    padding: 6px 12px;
    font-size: 0.7rem;
  }
}
</style>
