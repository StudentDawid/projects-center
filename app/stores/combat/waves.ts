/**
 * Wave Event Definitions
 * Extracted from combat.ts for better code organization
 */

export interface WaveEvent {
  id: string;
  name: string;
  description: string;
  threatRequired: number;
  baseDamage: number; // Base morale damage
  baseUnitLosses: number; // Base percentage of units that die (0-100)
  duration: number; // How long the attack lasts in seconds
}

export const WAVES: WaveEvent[] = [
  {
    id: 'scouts',
    name: 'Zwiadowcy',
    description: 'Mała grupa heretyków zwiaduje wasze pozycje.',
    threatRequired: 10,
    baseDamage: 5,
    baseUnitLosses: 2,
    duration: 5,
  },
  {
    id: 'raiders',
    name: 'Najeźdźcy',
    description: 'Oddział najeźdźców atakuje Sanktuarium!',
    threatRequired: 25,
    baseDamage: 10,
    baseUnitLosses: 5,
    duration: 8,
  },
  {
    id: 'warband',
    name: 'Wataha',
    description: 'Zorganizowana wataha atakuje ze wszystkich stron!',
    threatRequired: 50,
    baseDamage: 20,
    baseUnitLosses: 10,
    duration: 12,
  },
  {
    id: 'siege',
    name: 'Oblężenie',
    description: 'Hordy plugastwa oblegają Sanktuarium!',
    threatRequired: 100,
    baseDamage: 30,
    baseUnitLosses: 18,
    duration: 15,
  },
];

/**
 * Get wave by ID
 */
export function getWave(id: string): WaveEvent | undefined {
  return WAVES.find(w => w.id === id);
}

/**
 * Get wave for threat level
 */
export function getWaveForThreat(threatLevel: number): WaveEvent | undefined {
  return WAVES.find(w => w.threatRequired > threatLevel) || WAVES[WAVES.length - 1];
}

