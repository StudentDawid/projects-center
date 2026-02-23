import { GDDB } from '@shared/lib/gddb';

// Pamiętaj, by trzymać takie identyfikatory w bezpiecznym miejscu (np. nuxt.config.ts -> runtimeConfig)
const sheetId = '1ui7LCTSGlVONMtyLdTrcgRjW0kFDmv3vCfPUzGqJWKo';

// Utworzona instancja GDDB, z domyślnie ustawioną lokalną konfiguracją dla tego projektu
export const db = new GDDB({
  sheetId: sheetId,
  cache: false, // Tymczasowo false podczas wdrożeń, żeby nie chwytać starych błędów
  cacheTTL: 5 * 60 * 1000, // Cache na 5 minut
});
