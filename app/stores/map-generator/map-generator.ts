import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { MapSettings, Settlement } from '~/shared/types/map-generator.types';

export const useMapGeneratorStore = defineStore(
  'map-generator',
  () => {
    // State
    const mapGenerated = ref(false);
    const settlements = ref<Settlement[]>([]);
    const canvasSize = ref(512);

    const mapSettings = ref<MapSettings>({
      size: 512,
      seed: '',
      waterLevel: 40,
      mountainLevel: 30,
      forestLevel: 50,
      cityCount: 5,
      villageCount: 15,
      useVoronoi: true,
      voronoiCellCount: 1000,
    });

    // Getters
    const hasMap = computed(() => mapGenerated.value);

    // Actions
    function setSettings(settings: Partial<MapSettings>): void {
      mapSettings.value = { ...mapSettings.value, ...settings };
    }

    function randomizeSeed(): void {
      mapSettings.value.seed = Math.random().toString(36).substring(2, 10);
    }

    function setSettlements(newSettlements: Settlement[]): void {
      settlements.value = newSettlements;
    }

    function setMapGenerated(value: boolean): void {
      mapGenerated.value = value;
    }

    function setCanvasSize(size: number): void {
      canvasSize.value = size;
    }

    function resetMap(): void {
      mapGenerated.value = false;
      settlements.value = [];
    }

    return {
      // State
      mapSettings,
      mapGenerated,
      settlements,
      canvasSize,
      // Getters
      hasMap,
      // Actions
      setSettings,
      randomizeSeed,
      setSettlements,
      setMapGenerated,
      setCanvasSize,
      resetMap,
    };
  },
  {
    persist: true,
  }
);

