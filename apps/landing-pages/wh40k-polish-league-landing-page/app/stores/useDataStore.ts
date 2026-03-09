import { defineStore } from 'pinia';
import { db } from '../utils/db'; // Import Twojego klienta

export const useDataStore = defineStore('dataStore', {
  state: () => ({
    translations: [] as Record<string, any>[],
    events: [] as Record<string, any>[],
    eventMaps: [] as Record<string, any>[],
    isLoading: false,
  }),

  actions: {
    async fetchAllInitialData() {
      if (this.translations.length > 0) return;

      this.isLoading = true;
      try {
        const [translationsRes, eventsRes, mapsRes] = await Promise.all([
          db.fetch('translations'),
          db.fetch('events', {
            dataColumnEnd: 10
          }),
          db.fetch('maps'),
        ]);

        console.log('translationsRes', translationsRes);
        console.log('eventsRes', eventsRes);
        console.log('mapsRes', mapsRes);

        this.translations = translationsRes;
        this.events = eventsRes;
        this.eventMaps = mapsRes;
      } catch (error) {
        console.error('Błąd podczas pobierania danych w Pinia:', error);
      } finally {
        this.isLoading = false;
      }
    },
  },

  getters: {
    // Szybkie znajdowanie eventu po ID
    getEventById: (state) => {
      return (eventId: string) => state.events.find((e) => e.id === eventId);
    },

    // Mapy na podstronie eventu
    getMapsForEvent: (state) => {
      return (eventId: string) =>
        state.eventMaps.filter((m) => m.event_id === eventId);
    },
  },
});
