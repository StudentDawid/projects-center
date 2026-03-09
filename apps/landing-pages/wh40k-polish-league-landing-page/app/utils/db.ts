import { createGDDB } from '@shared/lib/gddb';

// Pamiętaj, by trzymać takie identyfikatory w bezpiecznym miejscu (np. nuxt.config.ts -> runtimeConfig)
const sheetId = '1ui7LCTSGlVONMtyLdTrcgRjW0kFDmv3vCfPUzGqJWKo';

// Utworzona instancja GDDB, z domyślnie ustawioną lokalną konfiguracją dla tego projektu
export const db = createGDDB({
  sheetId: sheetId,
  models: {
    translations: {
      sheetName: 'translations',
      fields: ['id', 'translation_key', 'pl', 'en']
    },
    events: {
      sheetName: 'events',
      fields: ['id', 'short_name', 'event_date', 'title', 'location_short', 'icon', 'theme_color', 'location_name', 'location_address', 'tickets_url']
    },  
    maps: {
      sheetName: 'maps',
      fields: ['id', 'map_index', 'map_title', 'map_image']
    },
  }
});
