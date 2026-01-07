/**
 * Enemy Type Definitions
 * Extracted from combat.ts for better code organization
 */
import type { EnemyType, EnemyTypeId } from '~/shared/types/game.types';

export const ENEMY_TYPES: Record<EnemyTypeId, EnemyType> = {
  cultist: {
    id: 'cultist',
    name: 'Kultyści Mięsa',
    description: 'Podstawowi wyznawcy chaosu. Liczni, ale słabi.',
    icon: '👹',
    tier: 'basic',
    damageMultiplier: 1,
    unitLossMultiplier: 1,
    durationMultiplier: 1,
    weakness: 'blessing',
    weaknessBonus: 0.3,
    spawnCondition: { type: 'every_n_waves', value: 1 },
  },
  abomination_minion: {
    id: 'abomination_minion',
    name: 'Plugastwo',
    description: 'Elitarne stwory z połączonych ciał. Silniejsze i bardziej wytrzymałe.',
    icon: '👾',
    tier: 'elite',
    damageMultiplier: 2,
    unitLossMultiplier: 2,
    durationMultiplier: 1.5,
    weakness: 'fortification',
    weaknessBonus: 0.4,
    spawnCondition: { type: 'every_n_waves', value: 5 },
  },
  apostate: {
    id: 'apostate',
    name: 'Apostata',
    description: 'Zdrajca wiary. Kradnie waszą Wiarę zamiast zadawać obrażenia.',
    icon: '🧙',
    tier: 'special',
    damageMultiplier: 0.5,
    unitLossMultiplier: 0.3,
    durationMultiplier: 1.2,
    specialEffect: {
      type: 'steal_faith',
      value: 5, // Kradnie 5% aktualnej Wiary
      description: 'Kradnie 5% waszej Wiary',
    },
    weakness: 'martyrdom',
    weaknessBonus: 0.6,
    spawnCondition: { type: 'every_n_waves', value: 7 },
  },
  abomination_boss: {
    id: 'abomination_boss',
    name: 'Abominacja',
    description: 'Przerażająca hybryda z dziesiątek ciał. Gwarantowana nagroda za pokonanie.',
    icon: '🐙',
    tier: 'boss',
    damageMultiplier: 5,
    unitLossMultiplier: 3,
    durationMultiplier: 3,
    specialEffect: {
      type: 'morale_drain',
      value: 2, // Ciągły drain morale -2/s
      description: 'Ciągły drain morale -2/s podczas walki',
    },
    weakness: 'martyrdom',
    weaknessBonus: 0.35,
    spawnCondition: { type: 'every_n_waves', value: 25 },
  },
  arch_heretic: {
    id: 'arch_heretic',
    name: 'Arcyheretyk',
    description: 'Przywódca kultu. Wymaga aktywnej obrony i strategicznych wyborów.',
    icon: '😈',
    tier: 'megaboss',
    damageMultiplier: 10,
    unitLossMultiplier: 5,
    durationMultiplier: 5,
    specialEffect: {
      type: 'disable_buildings',
      value: 30, // Wyłącza 30% budynków
      description: 'Wyłącza 30% losowych budynków podczas walki',
    },
    weaknessBonus: 0,
    spawnCondition: { type: 'every_n_waves', value: 100 },
  },
};

/**
 * Get enemy type by ID
 */
export function getEnemyType(id: EnemyTypeId): EnemyType | undefined {
  return ENEMY_TYPES[id];
}

/**
 * Get all enemy types as array
 */
export function getAllEnemyTypes(): EnemyType[] {
  return Object.values(ENEMY_TYPES);
}

