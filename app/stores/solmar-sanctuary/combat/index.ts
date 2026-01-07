/**
 * Combat Module Exports
 * Re-exports all combat-related types and constants
 */
export { ENEMY_TYPES, getEnemyType, getAllEnemyTypes } from './enemy-types';
export { DEFENSES, getDefense, DEFENSE_COST_MULTIPLIER } from './defenses';
export type { DefenseBonus } from './defenses';
export { WAVES, getWave, getWaveForThreat } from './waves';
export type { WaveEvent } from './waves';

