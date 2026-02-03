import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { MapSettings, Settlement, River, Road, PointOfInterest } from '@shared/types/map-generator.types';

export const useMapGeneratorStore = defineStore(
  'map-generator',
  () => {
    // State
    const mapGenerated = ref(false);
    const settlements = ref<Settlement[]>([]);
    const rivers = ref<River[]>([]);
    const roads = ref<Road[]>([]);
    const poi = ref<PointOfInterest[]>([]);
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
      enableRivers: true,
      riverCount: 8,
      riverWidth: 2,
      showCellBorders: false,
      enableRoads: true,
      roadType: 'minimal',
      enablePOI: true,
      poiCount: 15,
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

    function setRivers(newRivers: River[]): void {
      rivers.value = newRivers;
    }

    function setRoads(newRoads: Road[]): void {
      roads.value = newRoads;
    }

    function setPOI(newPOI: PointOfInterest[]): void {
      poi.value = newPOI;
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
      rivers.value = [];
      roads.value = [];
      poi.value = [];
    }

    return {
      // State
      mapSettings,
      mapGenerated,
      settlements,
      rivers,
      roads,
      poi,
      canvasSize,
      // Getters
      hasMap,
      // Actions
      setSettings,
      randomizeSeed,
      setSettlements,
      setRivers,
      setRoads,
      setPOI,
      setMapGenerated,
      setCanvasSize,
      resetMap,
    };
  },
  {
    persist: true,
  }
);

