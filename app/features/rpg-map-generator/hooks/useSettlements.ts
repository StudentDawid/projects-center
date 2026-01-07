import { fbm } from '~/shared/lib/perlin-noise';
import { useMapGeneratorStore } from '~/stores/map-generator/map-generator';
import type { Settlement } from '~/shared/types/map-generator.types';

const CITY_NAMES = [
  'Królewski Gród',
  'Srebrna Twierdza',
  'Żelazna Cytadela',
  'Złoty Port',
  'Mroźny Bastion',
  'Bursztynowy Zamek',
  'Szmaragdowa Wieża',
  'Rubinowe Wzgórze',
  'Diamentowy Szczyt',
  'Szafirowa Dolina',
];

const VILLAGE_NAMES = [
  'Mała Wioska',
  'Stare Dęby',
  'Młyńskie Błonia',
  'Leśna Polana',
  'Rzeczny Bród',
  'Wzgórze Pastuszków',
  'Kamienny Most',
  'Sosnowy Gaj',
  'Wilcza Jama',
  'Jaskółcze Gniazdo',
  'Słoneczna Dolina',
  'Mglisty Jar',
  'Cichy Zakątek',
  'Brzozowy Lasek',
  'Podmokłe Łąki',
];

export function useSettlements() {
  const store = useMapGeneratorStore();

  /**
   * Calculate height at position for settlement placement
   */
  function getHeightAt(x: number, y: number, size: number): number {
    const scale = 4;
    const nx = (x / size) * scale;
    const ny = (y / size) * scale;
    const distFromCenter = Math.sqrt(
      Math.pow((x - size / 2) / (size / 2), 2) +
        Math.pow((y - size / 2) / (size / 2), 2)
    );
    return fbm(nx, ny, 6) * Math.max(0, 1 - distFromCenter * 1.2);
  }

  /**
   * Check if position is too close to existing settlements
   */
  function isTooClose(
    x: number,
    y: number,
    settlements: Settlement[],
    minDistance: number
  ): boolean {
    return settlements.some(s => {
      const dist = Math.sqrt(Math.pow(s.x - x, 2) + Math.pow(s.y - y, 2));
      return dist < minDistance;
    });
  }

  /**
   * Generate and place settlements on the map
   */
  function generateSettlements(
    ctx: CanvasRenderingContext2D,
    size: number,
    waterThreshold: number
  ): void {
    const settings = store.mapSettings;
    const settlements: Settlement[] = [];

    // Place cities
    let placedCities = 0;
    let attempts = 0;
    while (placedCities < settings.cityCount && attempts < 1000) {
      attempts++;
      const x = Math.floor(Math.random() * size * 0.8 + size * 0.1);
      const y = Math.floor(Math.random() * size * 0.8 + size * 0.1);

      const height = getHeightAt(x, y, size);

      // Cities on land, not on mountains
      if (height > waterThreshold + 0.05 && height < 0.6) {
        // Check distance from other settlements
        if (!isTooClose(x, y, settlements, 60)) {
          settlements.push({
            x,
            y,
            type: 'city',
            name: CITY_NAMES[placedCities % CITY_NAMES.length] ?? 'Miasto',
          });
          placedCities++;
        }
      }
    }

    // Place villages
    let placedVillages = 0;
    attempts = 0;
    while (placedVillages < settings.villageCount && attempts < 2000) {
      attempts++;
      const x = Math.floor(Math.random() * size * 0.9 + size * 0.05);
      const y = Math.floor(Math.random() * size * 0.9 + size * 0.05);

      const height = getHeightAt(x, y, size);

      // Villages on land
      if (height > waterThreshold + 0.03 && height < 0.7) {
        // Check distance from other settlements
        const tooClose = settlements.some(s => {
          const dist = Math.sqrt(Math.pow(s.x - x, 2) + Math.pow(s.y - y, 2));
          return s.type === 'city' ? dist < 40 : dist < 25;
        });

        if (!tooClose) {
          settlements.push({
            x,
            y,
            type: 'village',
            name: VILLAGE_NAMES[placedVillages % VILLAGE_NAMES.length] ?? 'Wioska',
          });
          placedVillages++;
        }
      }
    }

    // Draw settlements
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';

    for (const settlement of settlements) {
      const emoji = settlement.type === 'city' ? '🏰' : '🏠';
      const fontSize = settlement.type === 'city' ? 16 : 12;

      ctx.font = `${fontSize}px sans-serif`;
      ctx.fillText(emoji, settlement.x, settlement.y);
    }

    // Store settlements
    store.setSettlements(settlements);
  }

  return {
    generateSettlements,
  };
}

