import { defineStore } from 'pinia';
import { db } from '../utils/db'; // Import Twojego klienta

export const useDataStore = defineStore('dataStore', {
  state: () => ({
    events: [] as Record<string, any>[],
    eventMaps: [] as Record<string, any>[],
    translations: [] as Record<string, any>[],
    isLoading: false,
  }),

  actions: {
    async fetchAllInitialData() {
      // Jeśli pobraliśmy już kluczowe dane, nie musimy tego powtarzać (o ile tego nie wymusimy)
      if (this.events.length > 0) return;

      this.isLoading = true;
      try {
        const [translationsRes, eventsRes, mapsRes] = await Promise.all([
          db.getData({ tabNameOrGid: 'translations' }),
          db.getData({ tabNameOrGid: 'events' }),
          db.getData({ tabNameOrGid: 'maps' }),
        ]);

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
