<template>
  <div class="map-generator-page">
    <!-- Header -->
    <header class="generator-header">
      <div class="header-content">
        <NuxtLink to="/" class="back-link">
          <v-icon icon="mdi-arrow-left" size="20" />
          <span>Projects Center</span>
        </NuxtLink>
        <div class="title-section">
          <v-icon icon="mdi-map-legend" size="32" class="title-icon" />
          <h1 class="page-title">Generator Map RPG</h1>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="generator-main">
      <!-- Sidebar - Settings -->
      <MapSettingsPanel @generate="handleGenerate" @export="handleExport" />

      <!-- Map Canvas -->
      <div class="map-content-wrapper">
        <MapCanvas ref="mapCanvasRef" />
        <MapLegend />
      </div>
    </main>

    <!-- Status bar -->
    <footer class="generator-footer">
      <span v-if="store.hasMap">
        Mapa wygenerowana • Seed: {{ store.mapSettings.seed }} • Rozmiar:
        {{ store.mapSettings.size }}×{{ store.mapSettings.size }}
      </span>
      <span v-else>Gotowy do generowania</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, type ComponentPublicInstance } from 'vue';
import { useMapGeneratorStore } from '~/stores/map-generator/map-generator';
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
const mapCanvasRef = ref<(ComponentPublicInstance & MapCanvasInstance) | null>(
  null
);

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
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: #e0e0e0;
}

// Header
.generator-header {
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px 24px;
}

.header-content {
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 24px;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s;

  &:hover {
    color: #4caf50;
  }
}

.title-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  color: #4caf50;
}

.page-title {
  font-family: 'Cinzel', serif;
  font-size: 1.5rem;
  color: #fff;
  margin: 0;
}

// Main Content
.generator-main {
  flex: 1;
  display: flex;
  gap: 24px;
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
}

.map-content-wrapper {
  flex: 1;
  position: relative;
}

// Footer
.generator-footer {
  background: rgba(0, 0, 0, 0.3);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 12px 24px;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
}

// Responsive
@media (max-width: 1024px) {
  .generator-main {
    flex-direction: column;
  }
}
</style>
