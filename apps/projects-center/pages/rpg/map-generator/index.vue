<template>
  <div class="map-generator-page">
    <!-- Menu kontroli widoku -->
    <MapViewControls
      v-model:display-mode="displayMode"
      v-model:show-rivers="showRivers"
      @regenerate="handleRegenerate"
    />

    <!-- Page content -->
    <div class="page-content">
      <MapCanvas
        ref="mapCanvasRef"
        :display-mode="displayMode"
        :show-rivers="showRivers"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import MapCanvas from '@libs/features/rpg-map-generator/ui/MapCanvas.vue';
import MapViewControls from '@libs/features/rpg-map-generator/ui/MapViewControls.vue';
import type { DisplayMode } from '@libs/features/rpg-map-generator/ui/MapViewControls.vue';

// Stan trybu wyświetlania
const displayMode = ref<DisplayMode>('biomes');
// Stan pokazywania rzek
const showRivers = ref<boolean>(true);
// Referencja do komponentu MapCanvas
const mapCanvasRef = ref<InstanceType<typeof MapCanvas> | null>(null);

// Obsługa ponownego generowania mapy
function handleRegenerate(): void {
  if (mapCanvasRef.value) {
    mapCanvasRef.value.regenerateMap();
  }
}

// Page meta
useHead({
  title: 'Generator Map RPG - Projects Center',
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

.page-content {
  width: 100%;
  height: 100%;
  margin-left: 280px; /* Zostaw miejsce na menu po lewej */
  margin-right: 280px; /* Zostaw miejsce na legendę po prawej */
}
</style>
