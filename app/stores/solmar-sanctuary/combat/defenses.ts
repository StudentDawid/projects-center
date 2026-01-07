/**
 * Defense (Liturgy) Definitions
 * Extracted from combat.ts for better code organization
 */
import type Decimal from 'break_infinity.js';
import { bn } from '~/shared/lib/big-number';

export interface DefenseBonus {
  id: string;
  name: string;
  icon: string;
  description: string;
  moraleProtection: number; // Reduces morale damage (0-1)
  unitProtection: number; // Reduces unit losses (0-1)
  moraleRegenBonus?: number; // Temporary morale regen bonus
  faithCost: Decimal;
  cooldown: number; // Seconds
  duration: number; // How long the defense lasts
}

export const DEFENSES: DefenseBonus[] = [
  {
    id: 'blessing',
    name: 'Błogosławieństwo Solmara',
    icon: 'mdi-shield-cross',
    description: 'Przywołaj ochronę Solmara. Zmniejsza obrażenia o 50%.',
    moraleProtection: 0.5,
    unitProtection: 0.5,
    faithCost: bn(20),
    cooldown: 30,
    duration: 15,
  },
  {
    id: 'martyrdom',
    name: 'Męczeństwo',
    icon: 'mdi-fire',
    description: 'Poświęcenie. Blokuje 90% obrażeń morale.',
    moraleProtection: 0.9,
    unitProtection: 0.7,
    faithCost: bn(50),
    cooldown: 60,
    duration: 10,
  },
  {
    id: 'regeneration',
    name: 'Odnowa Ducha',
    icon: 'mdi-heart-plus',
    description: 'Przyspiesza regenerację morale o +5/s przez 20s.',
    moraleProtection: 0,
    unitProtection: 0,
    moraleRegenBonus: 5,
    faithCost: bn(30),
    cooldown: 45,
    duration: 20,
  },
  {
    id: 'fortification',
    name: 'Święta Fortyfikacja',
    icon: 'mdi-castle',
    description: 'Wzmacnia mury. Całkowita ochrona jednostek.',
    moraleProtection: 0.3,
    unitProtection: 1.0,
    faithCost: bn(40),
    cooldown: 90,
    duration: 12,
  },
];

/**
 * Get defense by ID
 */
export function getDefense(id: string): DefenseBonus | undefined {
  return DEFENSES.find(d => d.id === id);
}

/**
 * Cost multiplier per usage
 */
export const DEFENSE_COST_MULTIPLIER = 1.5;

