/**
 * Loadout System definitions for Ateria Idle
 * Equipment presets for the Warrior path
 */

// ============================================
// LOADOUT TYPES
// ============================================

export interface Loadout {
  id: string;
  name: string;
  icon: string;
  color: string;
  slots: {
    weapon?: string; // Item ID
    armor?: string;
    helmet?: string;
    boots?: string;
    gloves?: string;
    accessory1?: string;
    accessory2?: string;
    ring1?: string;
    ring2?: string;
  };
  potionSlots: {
    slot1?: string; // Potion ID
    slot2?: string;
    slot3?: string;
    slot4?: string;
  };
  autoPotionSettings: {
    enabled: boolean;
    healThreshold: number; // HP % to trigger healing
    useBuffsOnCombatStart: boolean;
    priorityOrder: string[]; // Potion IDs in priority order
  };
  createdAt: number;
  lastUsed: number;
}

export interface LoadoutSlot {
  id: keyof Loadout['slots'];
  name: string;
  icon: string;
  allowedTypes: string[];
}

export const EQUIPMENT_SLOTS: LoadoutSlot[] = [
  { id: 'weapon', name: 'Broń', icon: 'mdi-sword', allowedTypes: ['weapon', 'sword', 'axe', 'mace', 'dagger', 'bow', 'staff'] },
  { id: 'armor', name: 'Zbroja', icon: 'mdi-shield-outline', allowedTypes: ['armor', 'chest', 'body'] },
  { id: 'helmet', name: 'Hełm', icon: 'mdi-face-mask', allowedTypes: ['helmet', 'head', 'hat'] },
  { id: 'boots', name: 'Buty', icon: 'mdi-shoe-formal', allowedTypes: ['boots', 'feet'] },
  { id: 'gloves', name: 'Rękawice', icon: 'mdi-hand-back-left', allowedTypes: ['gloves', 'hands'] },
  { id: 'accessory1', name: 'Akcesoria 1', icon: 'mdi-necklace', allowedTypes: ['accessory', 'amulet', 'necklace'] },
  { id: 'accessory2', name: 'Akcesoria 2', icon: 'mdi-necklace', allowedTypes: ['accessory', 'amulet', 'necklace'] },
  { id: 'ring1', name: 'Pierścień 1', icon: 'mdi-ring', allowedTypes: ['ring'] },
  { id: 'ring2', name: 'Pierścień 2', icon: 'mdi-ring', allowedTypes: ['ring'] },
];

export const POTION_SLOTS = [
  { id: 'slot1', name: 'Mikstura 1' },
  { id: 'slot2', name: 'Mikstura 2' },
  { id: 'slot3', name: 'Mikstura 3' },
  { id: 'slot4', name: 'Mikstura 4' },
];

// ============================================
// PRESET LOADOUTS (Templates)
// ============================================

export interface LoadoutPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  focusStats: string[];
  recommendedFor: string[];
  autoPotionSettings: Loadout['autoPotionSettings'];
}

export const LOADOUT_PRESETS: LoadoutPreset[] = [
  {
    id: 'balanced',
    name: 'Zrównoważony',
    description: 'Równowaga między atakiem a obroną',
    icon: 'mdi-scale-balance',
    color: 'blue',
    focusStats: ['attack', 'defense', 'hp'],
    recommendedFor: ['general', 'exploration'],
    autoPotionSettings: {
      enabled: true,
      healThreshold: 50,
      useBuffsOnCombatStart: false,
      priorityOrder: ['heal_potion', 'defense_potion'],
    },
  },
  {
    id: 'berserker',
    name: 'Berserker',
    description: 'Maksymalne obrażenia, minimalna obrona',
    icon: 'mdi-sword-cross',
    color: 'red',
    focusStats: ['attack', 'crit', 'critDamage'],
    recommendedFor: ['boss_rush', 'speed_runs'],
    autoPotionSettings: {
      enabled: true,
      healThreshold: 30,
      useBuffsOnCombatStart: true,
      priorityOrder: ['attack_potion', 'crit_potion', 'heal_potion'],
    },
  },
  {
    id: 'tank',
    name: 'Tank',
    description: 'Maksymalna wytrzymałość i obrona',
    icon: 'mdi-shield',
    color: 'grey',
    focusStats: ['hp', 'defense', 'regen'],
    recommendedFor: ['dungeons', 'hard_bosses'],
    autoPotionSettings: {
      enabled: true,
      healThreshold: 60,
      useBuffsOnCombatStart: true,
      priorityOrder: ['defense_potion', 'heal_potion', 'regen_potion'],
    },
  },
  {
    id: 'farmer',
    name: 'Farmer',
    description: 'Optymalizacja zdobywania zasobów',
    icon: 'mdi-grass',
    color: 'green',
    focusStats: ['gold', 'xp', 'loot'],
    recommendedFor: ['farming', 'grinding'],
    autoPotionSettings: {
      enabled: true,
      healThreshold: 40,
      useBuffsOnCombatStart: true,
      priorityOrder: ['xp_potion', 'gold_potion', 'loot_potion', 'heal_potion'],
    },
  },
  {
    id: 'speedrunner',
    name: 'Speedrunner',
    description: 'Szybkość ataku i prędkość walki',
    icon: 'mdi-lightning-bolt',
    color: 'amber',
    focusStats: ['speed', 'attack', 'crit'],
    recommendedFor: ['speed_runs', 'slayer_tasks'],
    autoPotionSettings: {
      enabled: true,
      healThreshold: 35,
      useBuffsOnCombatStart: true,
      priorityOrder: ['speed_potion', 'attack_potion', 'heal_potion'],
    },
  },
  {
    id: 'elemental_resist',
    name: 'Odporność Żywiołów',
    description: 'Ochrona przed obrażeniami żywiołowymi',
    icon: 'mdi-shield-sun',
    color: 'purple',
    focusStats: ['fireResist', 'iceResist', 'poisonResist', 'defense'],
    recommendedFor: ['elemental_dungeons', 'biome_bosses'],
    autoPotionSettings: {
      enabled: true,
      healThreshold: 50,
      useBuffsOnCombatStart: true,
      priorityOrder: ['antidote', 'fire_resistance', 'ice_resistance', 'heal_potion'],
    },
  },
];

// ============================================
// LOADOUT SLOTS UNLOCKS
// ============================================

export interface LoadoutSlotUnlock {
  slotNumber: number;
  requirement: {
    type: 'level' | 'prestige' | 'achievement' | 'purchase';
    value: number | string;
    cost?: number; // Gold cost if purchase
  };
}

export const LOADOUT_SLOT_UNLOCKS: LoadoutSlotUnlock[] = [
  { slotNumber: 1, requirement: { type: 'level', value: 1 } },
  { slotNumber: 2, requirement: { type: 'level', value: 10 } },
  { slotNumber: 3, requirement: { type: 'level', value: 20 } },
  { slotNumber: 4, requirement: { type: 'purchase', value: 'gold', cost: 1000 } },
  { slotNumber: 5, requirement: { type: 'purchase', value: 'gold', cost: 5000 } },
  { slotNumber: 6, requirement: { type: 'prestige', value: 1 } },
  { slotNumber: 7, requirement: { type: 'prestige', value: 3 } },
  { slotNumber: 8, requirement: { type: 'achievement', value: 'loadout_master' } },
];

// ============================================
// QUICK SWAP SETTINGS
// ============================================

export interface QuickSwapRule {
  id: string;
  name: string;
  description: string;
  trigger: QuickSwapTrigger;
  targetLoadoutId: string;
  enabled: boolean;
  priority: number;
}

export type QuickSwapTrigger =
  | { type: 'biome_enter'; biomeId: string }
  | { type: 'dungeon_enter'; dungeonId: string }
  | { type: 'boss_fight' }
  | { type: 'hp_below'; threshold: number }
  | { type: 'slayer_task_start'; category?: string }
  | { type: 'manual' };

export const DEFAULT_QUICK_SWAP_RULES: Omit<QuickSwapRule, 'id' | 'targetLoadoutId'>[] = [
  {
    name: 'Walka z Bossem',
    description: 'Przełącz na zestaw bossowy przed walką z bossem',
    trigger: { type: 'boss_fight' },
    enabled: false,
    priority: 1,
  },
  {
    name: 'Niskie HP',
    description: 'Przełącz na zestaw defensywny przy niskim HP',
    trigger: { type: 'hp_below', threshold: 30 },
    enabled: false,
    priority: 2,
  },
  {
    name: 'Zadanie Łowcy',
    description: 'Przełącz zestaw przy rozpoczęciu zadania łowcy',
    trigger: { type: 'slayer_task_start' },
    enabled: false,
    priority: 3,
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function createEmptyLoadout(id: string, name: string): Loadout {
  return {
    id,
    name,
    icon: 'mdi-sword',
    color: 'blue',
    slots: {},
    potionSlots: {},
    autoPotionSettings: {
      enabled: true,
      healThreshold: 50,
      useBuffsOnCombatStart: false,
      priorityOrder: [],
    },
    createdAt: Date.now(),
    lastUsed: 0,
  };
}

export function getLoadoutPreset(id: string): LoadoutPreset | undefined {
  return LOADOUT_PRESETS.find(p => p.id === id);
}

export function getEquipmentSlot(id: string): LoadoutSlot | undefined {
  return EQUIPMENT_SLOTS.find(s => s.id === id);
}

export function getMaxLoadoutSlots(level: number, prestigeCount: number, purchasedSlots: number): number {
  let slots = 1; // Base slot

  for (const unlock of LOADOUT_SLOT_UNLOCKS) {
    const req = unlock.requirement;
    
    if (req.type === 'level' && level >= (req.value as number)) {
      slots = Math.max(slots, unlock.slotNumber);
    } else if (req.type === 'prestige' && prestigeCount >= (req.value as number)) {
      slots = Math.max(slots, unlock.slotNumber);
    } else if (req.type === 'purchase' && purchasedSlots >= unlock.slotNumber - 3) {
      // Assuming slots 4+ are purchased
      slots = Math.max(slots, unlock.slotNumber);
    }
  }

  return slots;
}

export function calculateLoadoutStats(
  loadout: Loadout,
  getItemStats: (itemId: string) => Record<string, number>
): Record<string, number> {
  const stats: Record<string, number> = {
    attack: 0,
    defense: 0,
    hp: 0,
    speed: 0,
    crit: 0,
    critDamage: 0,
  };

  // Sum up all equipment stats
  for (const [_slotId, itemId] of Object.entries(loadout.slots)) {
    if (itemId) {
      const itemStats = getItemStats(itemId);
      for (const [stat, value] of Object.entries(itemStats)) {
        stats[stat] = (stats[stat] || 0) + value;
      }
    }
  }

  return stats;
}

export function compareLoadouts(
  loadout1: Loadout,
  loadout2: Loadout,
  getItemStats: (itemId: string) => Record<string, number>
): Record<string, number> {
  const stats1 = calculateLoadoutStats(loadout1, getItemStats);
  const stats2 = calculateLoadoutStats(loadout2, getItemStats);

  const diff: Record<string, number> = {};
  
  const allStats = new Set([...Object.keys(stats1), ...Object.keys(stats2)]);
  for (const stat of allStats) {
    diff[stat] = (stats2[stat] || 0) - (stats1[stat] || 0);
  }

  return diff;
}

export function isLoadoutComplete(loadout: Loadout): boolean {
  // Check if all main slots are filled
  const mainSlots: (keyof Loadout['slots'])[] = ['weapon', 'armor', 'helmet', 'boots', 'gloves'];
  return mainSlots.every(slot => loadout.slots[slot] !== undefined);
}

export function getLoadoutCompleteness(loadout: Loadout): number {
  const totalSlots = EQUIPMENT_SLOTS.length;
  const filledSlots = Object.values(loadout.slots).filter(v => v !== undefined).length;
  return filledSlots / totalSlots;
}

export function validateLoadout(
  loadout: Loadout,
  getItemType: (itemId: string) => string
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const [slotId, itemId] of Object.entries(loadout.slots)) {
    if (!itemId) continue;

    const slot = EQUIPMENT_SLOTS.find(s => s.id === slotId);
    if (!slot) {
      errors.push(`Nieznany slot: ${slotId}`);
      continue;
    }

    const itemType = getItemType(itemId);
    if (!slot.allowedTypes.includes(itemType)) {
      errors.push(`${slot.name}: nieprawidłowy typ przedmiotu (${itemType})`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
