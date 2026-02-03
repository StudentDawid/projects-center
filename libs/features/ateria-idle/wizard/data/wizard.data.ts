/**
 * Wizard Path Data - Spells, Elements, Magic Research
 */

// ============================================
// TYPES
// ============================================

export type MagicElement = 'fire' | 'water' | 'earth' | 'air' | 'light' | 'dark' | 'arcane';

export type SpellCategory = 'attack' | 'defense' | 'utility' | 'summoning' | 'enchantment';

export interface Spell {
  id: string;
  name: string;
  description: string;
  icon: string;
  element: MagicElement;
  category: SpellCategory;
  tier: number;
  
  // Requirements
  requiredLevel: number;
  manaCost: number;
  castTime: number; // Ticks
  cooldown: number; // Ticks
  
  // Effects
  effects: SpellEffect[];
  
  // XP
  xpReward: number;
  
  // Research cost
  researchCost: number;
}

export interface SpellEffect {
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'summon' | 'utility';
  target: 'self' | 'enemy' | 'ally' | 'area';
  value: number;
  duration?: number;
  description: string;
}

export interface MagicStaff {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: number;
  
  // Stats
  magicPower: number;
  manaEfficiency: number; // Reduces mana cost
  castSpeed: number; // Reduces cast time
  elementBonus?: MagicElement; // Bonus for specific element
  
  // Requirements
  requiredLevel: number;
  cost: number;
}

export interface SpellBook {
  id: string;
  name: string;
  description: string;
  icon: string;
  element: MagicElement;
  
  // Spells unlocked
  spells: string[];
  
  // Requirements
  requiredLevel: number;
  researchCost: number;
}

export interface MagicResearch {
  id: string;
  name: string;
  description: string;
  icon: string;
  
  // Requirements
  requiredLevel: number;
  researchTime: number; // Ticks
  goldCost: number;
  
  // Rewards
  xpReward: number;
  unlocks: string[]; // Spell or staff IDs
}

export interface WizardProgress {
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXp: number;
}

// ============================================
// ELEMENTS
// ============================================

export const ELEMENTS: Record<MagicElement, { name: string; color: string; icon: string; description: string }> = {
  fire: { name: 'Ogień', color: '#F44336', icon: 'mdi-fire', description: 'Żywioł destrukcji i pasji' },
  water: { name: 'Woda', color: '#2196F3', icon: 'mdi-water', description: 'Żywioł leczenia i adaptacji' },
  earth: { name: 'Ziemia', color: '#795548', icon: 'mdi-earth', description: 'Żywioł obrony i stabilności' },
  air: { name: 'Powietrze', color: '#00BCD4', icon: 'mdi-weather-windy', description: 'Żywioł szybkości i wolności' },
  light: { name: 'Światło', color: '#FFC107', icon: 'mdi-white-balance-sunny', description: 'Żywioł dobra i oczyszczenia' },
  dark: { name: 'Ciemność', color: '#673AB7', icon: 'mdi-moon-waning-crescent', description: 'Żywioł tajemnic i mocy' },
  arcane: { name: 'Arkana', color: '#9C27B0', icon: 'mdi-star-four-points', description: 'Czysta esencja magii' },
};

// ============================================
// SPELLS
// ============================================

export const SPELLS: Record<string, Spell> = {
  // Fire spells
  fireball: {
    id: 'fireball',
    name: 'Kula Ognia',
    description: 'Podstawowe zaklęcie ognia.',
    icon: 'mdi-fire',
    element: 'fire',
    category: 'attack',
    tier: 1,
    requiredLevel: 1,
    manaCost: 20,
    castTime: 100,
    cooldown: 50,
    effects: [{ type: 'damage', target: 'enemy', value: 25, description: '25 obrażeń ognia' }],
    xpReward: 10,
    researchCost: 0,
  },
  flame_wave: {
    id: 'flame_wave',
    name: 'Fala Płomieni',
    description: 'Fala ognia trafiająca wielu wrogów.',
    icon: 'mdi-fire',
    element: 'fire',
    category: 'attack',
    tier: 2,
    requiredLevel: 8,
    manaCost: 45,
    castTime: 150,
    cooldown: 100,
    effects: [{ type: 'damage', target: 'area', value: 40, description: '40 obrażeń ognia (AoE)' }],
    xpReward: 25,
    researchCost: 200,
  },
  inferno: {
    id: 'inferno',
    name: 'Piekielne Piekło',
    description: 'Potężna eksplozja ognia.',
    icon: 'mdi-fire',
    element: 'fire',
    category: 'attack',
    tier: 3,
    requiredLevel: 20,
    manaCost: 100,
    castTime: 250,
    cooldown: 300,
    effects: [
      { type: 'damage', target: 'area', value: 150, description: '150 obrażeń ognia (AoE)' },
      { type: 'debuff', target: 'enemy', value: 20, duration: 300, description: 'Podpalenie: 20 DMG/tick przez 30s' },
    ],
    xpReward: 80,
    researchCost: 1000,
  },

  // Water spells
  water_bolt: {
    id: 'water_bolt',
    name: 'Strumień Wody',
    description: 'Szybki atak wodny.',
    icon: 'mdi-water',
    element: 'water',
    category: 'attack',
    tier: 1,
    requiredLevel: 1,
    manaCost: 15,
    castTime: 80,
    cooldown: 40,
    effects: [{ type: 'damage', target: 'enemy', value: 18, description: '18 obrażeń wody' }],
    xpReward: 8,
    researchCost: 0,
  },
  heal: {
    id: 'heal',
    name: 'Leczenie',
    description: 'Przywraca punkty życia.',
    icon: 'mdi-heart-plus',
    element: 'water',
    category: 'defense',
    tier: 1,
    requiredLevel: 3,
    manaCost: 30,
    castTime: 120,
    cooldown: 150,
    effects: [{ type: 'heal', target: 'self', value: 50, description: 'Przywraca 50 HP' }],
    xpReward: 15,
    researchCost: 100,
  },
  ice_shield: {
    id: 'ice_shield',
    name: 'Lodowa Tarcza',
    description: 'Tworzy ochronną tarczę z lodu.',
    icon: 'mdi-shield-half-full',
    element: 'water',
    category: 'defense',
    tier: 2,
    requiredLevel: 10,
    manaCost: 40,
    castTime: 100,
    cooldown: 200,
    effects: [{ type: 'buff', target: 'self', value: 30, duration: 300, description: '+30% obrony przez 30s' }],
    xpReward: 20,
    researchCost: 300,
  },
  tsunami: {
    id: 'tsunami',
    name: 'Tsunami',
    description: 'Gigantyczna fala niszcząca wszystko.',
    icon: 'mdi-waves',
    element: 'water',
    category: 'attack',
    tier: 4,
    requiredLevel: 28,
    manaCost: 150,
    castTime: 300,
    cooldown: 500,
    effects: [
      { type: 'damage', target: 'area', value: 200, description: '200 obrażeń wody (AoE)' },
      { type: 'debuff', target: 'enemy', value: 25, duration: 200, description: 'Spowolnienie: -25% szybkości przez 20s' },
    ],
    xpReward: 100,
    researchCost: 1500,
  },

  // Earth spells
  stone_skin: {
    id: 'stone_skin',
    name: 'Kamienna Skóra',
    description: 'Zwiększa obronę.',
    icon: 'mdi-shield',
    element: 'earth',
    category: 'defense',
    tier: 1,
    requiredLevel: 2,
    manaCost: 25,
    castTime: 100,
    cooldown: 200,
    effects: [{ type: 'buff', target: 'self', value: 20, duration: 300, description: '+20% obrony przez 30s' }],
    xpReward: 12,
    researchCost: 50,
  },
  earthquake: {
    id: 'earthquake',
    name: 'Trzęsienie Ziemi',
    description: 'Wstrząsa ziemię pod wrogami.',
    icon: 'mdi-earth',
    element: 'earth',
    category: 'attack',
    tier: 2,
    requiredLevel: 12,
    manaCost: 60,
    castTime: 200,
    cooldown: 250,
    effects: [
      { type: 'damage', target: 'area', value: 60, description: '60 obrażeń ziemi (AoE)' },
      { type: 'debuff', target: 'enemy', value: 15, duration: 150, description: 'Ogłuszenie przez 15s' },
    ],
    xpReward: 35,
    researchCost: 400,
  },
  golem_summon: {
    id: 'golem_summon',
    name: 'Przyzwanie Golema',
    description: 'Przyzwij kamiennego golema.',
    icon: 'mdi-robot',
    element: 'earth',
    category: 'summoning',
    tier: 3,
    requiredLevel: 22,
    manaCost: 120,
    castTime: 300,
    cooldown: 600,
    effects: [{ type: 'summon', target: 'ally', value: 100, duration: 600, description: 'Golem walczy przez 60s' }],
    xpReward: 60,
    researchCost: 800,
  },

  // Air spells
  wind_slash: {
    id: 'wind_slash',
    name: 'Cięcie Wiatru',
    description: 'Szybki atak powietrzem.',
    icon: 'mdi-weather-windy',
    element: 'air',
    category: 'attack',
    tier: 1,
    requiredLevel: 1,
    manaCost: 12,
    castTime: 60,
    cooldown: 30,
    effects: [{ type: 'damage', target: 'enemy', value: 15, description: '15 obrażeń powietrza' }],
    xpReward: 7,
    researchCost: 0,
  },
  haste: {
    id: 'haste',
    name: 'Przyspieszenie',
    description: 'Zwiększa szybkość.',
    icon: 'mdi-run-fast',
    element: 'air',
    category: 'utility',
    tier: 1,
    requiredLevel: 5,
    manaCost: 35,
    castTime: 80,
    cooldown: 200,
    effects: [{ type: 'buff', target: 'self', value: 30, duration: 300, description: '+30% szybkości przez 30s' }],
    xpReward: 15,
    researchCost: 150,
  },
  lightning_bolt: {
    id: 'lightning_bolt',
    name: 'Błyskawica',
    description: 'Potężny cios pioruna.',
    icon: 'mdi-flash',
    element: 'air',
    category: 'attack',
    tier: 3,
    requiredLevel: 18,
    manaCost: 80,
    castTime: 150,
    cooldown: 200,
    effects: [
      { type: 'damage', target: 'enemy', value: 120, description: '120 obrażeń elektrycznych' },
      { type: 'debuff', target: 'enemy', value: 50, duration: 50, description: 'Paraliż przez 5s' },
    ],
    xpReward: 50,
    researchCost: 600,
  },

  // Light spells
  holy_light: {
    id: 'holy_light',
    name: 'Święte Światło',
    description: 'Leczy i zadaje obrażenia nieumarłym.',
    icon: 'mdi-white-balance-sunny',
    element: 'light',
    category: 'defense',
    tier: 1,
    requiredLevel: 4,
    manaCost: 35,
    castTime: 100,
    cooldown: 120,
    effects: [
      { type: 'heal', target: 'self', value: 40, description: 'Przywraca 40 HP' },
      { type: 'damage', target: 'enemy', value: 30, description: '30 obrażeń świetlnych (x2 vs nieumarli)' },
    ],
    xpReward: 18,
    researchCost: 200,
  },
  blessing: {
    id: 'blessing',
    name: 'Błogosławieństwo',
    description: 'Zwiększa wszystkie statystyki.',
    icon: 'mdi-hand-heart',
    element: 'light',
    category: 'utility',
    tier: 2,
    requiredLevel: 14,
    manaCost: 60,
    castTime: 150,
    cooldown: 400,
    effects: [
      { type: 'buff', target: 'self', value: 15, duration: 500, description: '+15% do wszystkich statystyk przez 50s' },
    ],
    xpReward: 35,
    researchCost: 500,
  },
  divine_judgment: {
    id: 'divine_judgment',
    name: 'Boski Sąd',
    description: 'Potężny atak światła.',
    icon: 'mdi-sword-cross',
    element: 'light',
    category: 'attack',
    tier: 4,
    requiredLevel: 30,
    manaCost: 180,
    castTime: 350,
    cooldown: 600,
    effects: [{ type: 'damage', target: 'area', value: 250, description: '250 obrażeń świetlnych (AoE)' }],
    xpReward: 120,
    researchCost: 2000,
  },

  // Dark spells
  shadow_bolt: {
    id: 'shadow_bolt',
    name: 'Cień Mroku',
    description: 'Atak mroczną energią.',
    icon: 'mdi-moon-waning-crescent',
    element: 'dark',
    category: 'attack',
    tier: 1,
    requiredLevel: 3,
    manaCost: 22,
    castTime: 90,
    cooldown: 60,
    effects: [{ type: 'damage', target: 'enemy', value: 28, description: '28 obrażeń mroku' }],
    xpReward: 12,
    researchCost: 100,
  },
  life_drain: {
    id: 'life_drain',
    name: 'Wyssanie Życia',
    description: 'Kradnie życie wrogowi.',
    icon: 'mdi-heart-broken',
    element: 'dark',
    category: 'attack',
    tier: 2,
    requiredLevel: 10,
    manaCost: 50,
    castTime: 120,
    cooldown: 180,
    effects: [
      { type: 'damage', target: 'enemy', value: 40, description: '40 obrażeń mroku' },
      { type: 'heal', target: 'self', value: 30, description: 'Przywraca 30 HP' },
    ],
    xpReward: 28,
    researchCost: 350,
  },
  summon_demon: {
    id: 'summon_demon',
    name: 'Przyzwanie Demona',
    description: 'Przyzwij potężnego demona.',
    icon: 'mdi-ghost',
    element: 'dark',
    category: 'summoning',
    tier: 4,
    requiredLevel: 32,
    manaCost: 200,
    castTime: 400,
    cooldown: 800,
    effects: [{ type: 'summon', target: 'ally', value: 200, duration: 500, description: 'Demon walczy przez 50s' }],
    xpReward: 100,
    researchCost: 2500,
  },

  // Arcane spells
  arcane_missile: {
    id: 'arcane_missile',
    name: 'Arkanowy Pocisk',
    description: 'Czysta magia arkanowa.',
    icon: 'mdi-star-four-points',
    element: 'arcane',
    category: 'attack',
    tier: 1,
    requiredLevel: 1,
    manaCost: 18,
    castTime: 70,
    cooldown: 45,
    effects: [{ type: 'damage', target: 'enemy', value: 22, description: '22 obrażeń arkanowych' }],
    xpReward: 9,
    researchCost: 0,
  },
  mana_shield: {
    id: 'mana_shield',
    name: 'Tarcza Many',
    description: 'Obrażenia pochłaniane przez manę.',
    icon: 'mdi-shield-star',
    element: 'arcane',
    category: 'defense',
    tier: 2,
    requiredLevel: 8,
    manaCost: 40,
    castTime: 100,
    cooldown: 250,
    effects: [{ type: 'buff', target: 'self', value: 50, duration: 300, description: 'Absorpcja 50 DMG przez 30s' }],
    xpReward: 22,
    researchCost: 300,
  },
  teleport: {
    id: 'teleport',
    name: 'Teleportacja',
    description: 'Natychmiastowa teleportacja.',
    icon: 'mdi-flash',
    element: 'arcane',
    category: 'utility',
    tier: 2,
    requiredLevel: 15,
    manaCost: 60,
    castTime: 50,
    cooldown: 400,
    effects: [{ type: 'utility', target: 'self', value: 100, description: 'Teleportacja w bezpieczne miejsce' }],
    xpReward: 25,
    researchCost: 400,
  },
  time_stop: {
    id: 'time_stop',
    name: 'Zatrzymanie Czasu',
    description: 'Zamraża czas wokół.',
    icon: 'mdi-clock-fast',
    element: 'arcane',
    category: 'utility',
    tier: 5,
    requiredLevel: 40,
    manaCost: 300,
    castTime: 200,
    cooldown: 1000,
    effects: [{ type: 'debuff', target: 'area', value: 100, duration: 100, description: 'Zamrożenie wszystkich wrogów przez 10s' }],
    xpReward: 200,
    researchCost: 5000,
  },
};

// ============================================
// STAFFS
// ============================================

export const STAFFS: Record<string, MagicStaff> = {
  wooden_staff: {
    id: 'wooden_staff',
    name: 'Drewniany Kostur',
    description: 'Podstawowy kostur początkującego maga.',
    icon: 'mdi-wizard-hat',
    tier: 1,
    magicPower: 5,
    manaEfficiency: 0,
    castSpeed: 1.0,
    requiredLevel: 1,
    cost: 50,
  },
  apprentice_staff: {
    id: 'apprentice_staff',
    name: 'Kostur Ucznia',
    description: 'Ulepszona wersja dla uczniów.',
    icon: 'mdi-wizard-hat',
    tier: 1,
    magicPower: 10,
    manaEfficiency: 5,
    castSpeed: 1.05,
    requiredLevel: 5,
    cost: 150,
  },
  crystal_staff: {
    id: 'crystal_staff',
    name: 'Kryształowy Kostur',
    description: 'Kostur z magicznym kryształem.',
    icon: 'mdi-diamond-stone',
    tier: 2,
    magicPower: 20,
    manaEfficiency: 10,
    castSpeed: 1.1,
    requiredLevel: 10,
    cost: 400,
  },
  fire_staff: {
    id: 'fire_staff',
    name: 'Kostur Ognia',
    description: 'Wzmacnia zaklęcia ognia.',
    icon: 'mdi-fire',
    tier: 2,
    magicPower: 25,
    manaEfficiency: 5,
    castSpeed: 1.1,
    elementBonus: 'fire',
    requiredLevel: 12,
    cost: 600,
  },
  frost_staff: {
    id: 'frost_staff',
    name: 'Kostur Mrozu',
    description: 'Wzmacnia zaklęcia wody.',
    icon: 'mdi-snowflake',
    tier: 2,
    magicPower: 25,
    manaEfficiency: 5,
    castSpeed: 1.1,
    elementBonus: 'water',
    requiredLevel: 12,
    cost: 600,
  },
  archmage_staff: {
    id: 'archmage_staff',
    name: 'Kostur Arcymaga',
    description: 'Potężny kostur dla mistrzów.',
    icon: 'mdi-star-four-points',
    tier: 3,
    magicPower: 40,
    manaEfficiency: 15,
    castSpeed: 1.2,
    requiredLevel: 20,
    cost: 1500,
  },
  void_staff: {
    id: 'void_staff',
    name: 'Kostur Pustki',
    description: 'Kostur z mroczną mocą.',
    icon: 'mdi-moon-waning-crescent',
    tier: 4,
    magicPower: 60,
    manaEfficiency: 20,
    castSpeed: 1.25,
    elementBonus: 'dark',
    requiredLevel: 28,
    cost: 3000,
  },
  legendary_staff: {
    id: 'legendary_staff',
    name: 'Legendarny Kostur Archontów',
    description: 'Najsilniejszy znany kostur.',
    icon: 'mdi-star',
    tier: 5,
    magicPower: 100,
    manaEfficiency: 30,
    castSpeed: 1.4,
    requiredLevel: 40,
    cost: 10000,
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getSpell(id: string): Spell | undefined {
  return SPELLS[id];
}

export function getStaff(id: string): MagicStaff | undefined {
  return STAFFS[id];
}

export function getSpellsByElement(element: MagicElement): Spell[] {
  return Object.values(SPELLS).filter(s => s.element === element);
}

export function getSpellsByCategory(category: SpellCategory): Spell[] {
  return Object.values(SPELLS).filter(s => s.category === category);
}

export function getAvailableSpells(level: number, researchedSpells: Set<string>): Spell[] {
  return Object.values(SPELLS).filter(s => 
    s.requiredLevel <= level && (s.researchCost === 0 || researchedSpells.has(s.id))
  );
}

export function calculateWizardXpToLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.15, level - 1));
}

export function calculateSpellDamage(spell: Spell, magicPower: number, elementBonus?: MagicElement): number {
  let damage = 0;
  for (const effect of spell.effects) {
    if (effect.type === 'damage') {
      damage += effect.value;
    }
  }
  
  // Apply magic power bonus
  damage = Math.floor(damage * (1 + magicPower / 100));
  
  // Apply element bonus
  if (elementBonus === spell.element) {
    damage = Math.floor(damage * 1.25);
  }
  
  return damage;
}

export function getElementColor(element: MagicElement): string {
  return ELEMENTS[element].color;
}

export function getElementName(element: MagicElement): string {
  return ELEMENTS[element].name;
}
