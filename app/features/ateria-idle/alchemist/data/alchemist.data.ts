/**
 * Alchemist Path Data - Potions, Transmutation, Experiments
 */

// ============================================
// TYPES
// ============================================

export type PotionType = 'healing' | 'buff' | 'damage' | 'utility' | 'transmutation';

export type PotionRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface AlchemyIngredient {
  id: string;
  name: string;
  icon: string;
  tier: number;
  basePrice: number;
  sources: string[];
  properties: string[]; // healing, explosive, calming, etc.
}

export interface Potion {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: PotionType;
  rarity: PotionRarity;
  tier: number;
  
  // Requirements
  requiredLevel: number;
  ingredients: { ingredientId: string; amount: number }[];
  brewTime: number; // Ticks
  
  // Effects
  effects: PotionEffect[];
  duration?: number; // If buff
  
  // Rewards
  xpReward: number;
  sellPrice: number;
}

export interface PotionEffect {
  type: 'heal' | 'buff' | 'damage' | 'transmute' | 'special';
  stat?: string;
  value: number;
  description: string;
}

export interface AlchemyEquipment {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: number;
  
  // Bonuses
  brewSpeedBonus: number;
  qualityBonus: number;
  doubleBrewChance: number;
  
  // Requirements
  requiredLevel: number;
  cost: number;
}

export interface Experiment {
  id: string;
  name: string;
  description: string;
  icon: string;
  
  // Requirements
  requiredLevel: number;
  ingredients: { ingredientId: string; amount: number }[];
  goldCost: number;
  experimentTime: number;
  
  // Results
  successChance: number;
  xpReward: number;
  discoversRecipe?: string;
  possibleResults: string[];
}

export interface AlchemistProgress {
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXp: number;
}

// ============================================
// INGREDIENTS
// ============================================

export const ALCHEMY_INGREDIENTS: Record<string, AlchemyIngredient> = {
  // Herbs
  moonpetal: { id: 'moonpetal', name: 'Płatek Księżyca', icon: 'mdi-flower', tier: 1, basePrice: 10, sources: ['gathering', 'druid'], properties: ['calming', 'healing'] },
  sunbloom: { id: 'sunbloom', name: 'Słonecznik', icon: 'mdi-white-balance-sunny', tier: 1, basePrice: 12, sources: ['gathering', 'druid'], properties: ['energizing', 'fire'] },
  nightshade: { id: 'nightshade', name: 'Belladonna', icon: 'mdi-flower', tier: 2, basePrice: 25, sources: ['gathering'], properties: ['toxic', 'dark'] },
  dragons_breath: { id: 'dragons_breath', name: 'Oddech Smoka', icon: 'mdi-fire', tier: 3, basePrice: 80, sources: ['warrior', 'explorer'], properties: ['fire', 'explosive'] },
  ghost_orchid: { id: 'ghost_orchid', name: 'Orchidea Duchów', icon: 'mdi-flower', tier: 3, basePrice: 100, sources: ['explorer'], properties: ['ethereal', 'light'] },
  void_moss: { id: 'void_moss', name: 'Mech Pustki', icon: 'mdi-leaf', tier: 4, basePrice: 200, sources: ['explorer'], properties: ['void', 'dark'] },
  
  // Monster parts
  slime_extract: { id: 'slime_extract', name: 'Ekstrakt Szlamu', icon: 'mdi-water', tier: 1, basePrice: 8, sources: ['warrior'], properties: ['sticky', 'healing'] },
  wolf_fang: { id: 'wolf_fang', name: 'Kieł Wilka', icon: 'mdi-tooth', tier: 1, basePrice: 15, sources: ['warrior'], properties: ['strength', 'primal'] },
  spider_venom: { id: 'spider_venom', name: 'Jad Pająka', icon: 'mdi-spider', tier: 2, basePrice: 30, sources: ['warrior'], properties: ['toxic', 'paralytic'] },
  phoenix_feather: { id: 'phoenix_feather', name: 'Pióro Feniksa', icon: 'mdi-feather', tier: 4, basePrice: 300, sources: ['warrior', 'explorer'], properties: ['fire', 'resurrection'] },
  dragon_blood: { id: 'dragon_blood', name: 'Krew Smoka', icon: 'mdi-water', tier: 5, basePrice: 500, sources: ['warrior'], properties: ['fire', 'power', 'legendary'] },
  
  // Minerals
  crystal_dust: { id: 'crystal_dust', name: 'Proszek Kryształowy', icon: 'mdi-diamond-stone', tier: 1, basePrice: 20, sources: ['gathering', 'crafting'], properties: ['amplifying', 'light'] },
  sulfur: { id: 'sulfur', name: 'Siarka', icon: 'mdi-circle', tier: 1, basePrice: 15, sources: ['gathering'], properties: ['fire', 'explosive'] },
  quicksilver: { id: 'quicksilver', name: 'Rtęć', icon: 'mdi-water', tier: 2, basePrice: 40, sources: ['crafting'], properties: ['transmutation', 'liquid'] },
  philosophers_stone_shard: { id: 'philosophers_stone_shard', name: 'Odłamek Kamienia Filozoficznego', icon: 'mdi-diamond', tier: 5, basePrice: 1000, sources: ['alchemist'], properties: ['transmutation', 'legendary', 'creation'] },
  
  // Liquids
  pure_water: { id: 'pure_water', name: 'Czysta Woda', icon: 'mdi-water', tier: 1, basePrice: 5, sources: ['gathering'], properties: ['base', 'purifying'] },
  alcohol: { id: 'alcohol', name: 'Spirytus', icon: 'mdi-glass-cocktail', tier: 1, basePrice: 10, sources: ['crafting', 'chef'], properties: ['base', 'preserving'] },
  honey: { id: 'honey', name: 'Miód', icon: 'mdi-beehive-outline', tier: 1, basePrice: 15, sources: ['druid'], properties: ['sweet', 'healing'] },
};

// ============================================
// POTIONS
// ============================================

export const POTIONS: Record<string, Potion> = {
  // Healing potions
  minor_healing: {
    id: 'minor_healing',
    name: 'Mniejsze Leczenie',
    description: 'Przywraca niewielką ilość HP.',
    icon: 'mdi-bottle-tonic',
    type: 'healing',
    rarity: 'common',
    tier: 1,
    requiredLevel: 1,
    ingredients: [
      { ingredientId: 'moonpetal', amount: 2 },
      { ingredientId: 'pure_water', amount: 1 },
    ],
    brewTime: 100,
    effects: [{ type: 'heal', value: 50, description: 'Przywraca 50 HP' }],
    xpReward: 10,
    sellPrice: 20,
  },
  healing: {
    id: 'healing',
    name: 'Mikstura Leczenia',
    description: 'Standardowa mikstura lecznicza.',
    icon: 'mdi-bottle-tonic-plus',
    type: 'healing',
    rarity: 'uncommon',
    tier: 2,
    requiredLevel: 8,
    ingredients: [
      { ingredientId: 'moonpetal', amount: 3 },
      { ingredientId: 'slime_extract', amount: 2 },
      { ingredientId: 'honey', amount: 1 },
    ],
    brewTime: 200,
    effects: [{ type: 'heal', value: 150, description: 'Przywraca 150 HP' }],
    xpReward: 25,
    sellPrice: 50,
  },
  greater_healing: {
    id: 'greater_healing',
    name: 'Większa Mikstura Leczenia',
    description: 'Potężna mikstura lecznicza.',
    icon: 'mdi-bottle-tonic-plus-outline',
    type: 'healing',
    rarity: 'rare',
    tier: 3,
    requiredLevel: 18,
    ingredients: [
      { ingredientId: 'ghost_orchid', amount: 2 },
      { ingredientId: 'phoenix_feather', amount: 1 },
      { ingredientId: 'honey', amount: 2 },
    ],
    brewTime: 400,
    effects: [{ type: 'heal', value: 500, description: 'Przywraca 500 HP' }],
    xpReward: 60,
    sellPrice: 150,
  },
  
  // Buff potions
  strength: {
    id: 'strength',
    name: 'Mikstura Siły',
    description: 'Zwiększa obrażenia.',
    icon: 'mdi-arm-flex',
    type: 'buff',
    rarity: 'common',
    tier: 1,
    requiredLevel: 3,
    ingredients: [
      { ingredientId: 'wolf_fang', amount: 2 },
      { ingredientId: 'sunbloom', amount: 1 },
    ],
    brewTime: 150,
    effects: [{ type: 'buff', stat: 'attack', value: 20, description: '+20% obrażeń' }],
    duration: 600,
    xpReward: 15,
    sellPrice: 30,
  },
  defense: {
    id: 'defense',
    name: 'Mikstura Obrony',
    description: 'Zwiększa pancerz.',
    icon: 'mdi-shield',
    type: 'buff',
    rarity: 'common',
    tier: 1,
    requiredLevel: 4,
    ingredients: [
      { ingredientId: 'slime_extract', amount: 3 },
      { ingredientId: 'crystal_dust', amount: 1 },
    ],
    brewTime: 150,
    effects: [{ type: 'buff', stat: 'defense', value: 25, description: '+25% obrony' }],
    duration: 600,
    xpReward: 15,
    sellPrice: 30,
  },
  speed: {
    id: 'speed',
    name: 'Mikstura Szybkości',
    description: 'Zwiększa prędkość.',
    icon: 'mdi-run-fast',
    type: 'buff',
    rarity: 'uncommon',
    tier: 2,
    requiredLevel: 10,
    ingredients: [
      { ingredientId: 'sunbloom', amount: 3 },
      { ingredientId: 'quicksilver', amount: 1 },
    ],
    brewTime: 200,
    effects: [{ type: 'buff', stat: 'speed', value: 30, description: '+30% szybkości' }],
    duration: 500,
    xpReward: 28,
    sellPrice: 55,
  },
  berserker: {
    id: 'berserker',
    name: 'Mikstura Berserkera',
    description: 'Potężny boost bojowy.',
    icon: 'mdi-sword',
    type: 'buff',
    rarity: 'rare',
    tier: 3,
    requiredLevel: 20,
    ingredients: [
      { ingredientId: 'dragons_breath', amount: 2 },
      { ingredientId: 'wolf_fang', amount: 3 },
      { ingredientId: 'alcohol', amount: 2 },
    ],
    brewTime: 350,
    effects: [
      { type: 'buff', stat: 'attack', value: 50, description: '+50% obrażeń' },
      { type: 'buff', stat: 'speed', value: 20, description: '+20% szybkości' },
    ],
    duration: 400,
    xpReward: 70,
    sellPrice: 120,
  },
  
  // Damage potions
  fire_bomb: {
    id: 'fire_bomb',
    name: 'Bomba Ogniowa',
    description: 'Eksploduje ogniem.',
    icon: 'mdi-fire',
    type: 'damage',
    rarity: 'uncommon',
    tier: 2,
    requiredLevel: 12,
    ingredients: [
      { ingredientId: 'sulfur', amount: 3 },
      { ingredientId: 'dragons_breath', amount: 1 },
      { ingredientId: 'alcohol', amount: 1 },
    ],
    brewTime: 250,
    effects: [{ type: 'damage', value: 100, description: '100 obrażeń ognia' }],
    xpReward: 35,
    sellPrice: 60,
  },
  poison_vial: {
    id: 'poison_vial',
    name: 'Fiolka Trucizny',
    description: 'Śmiertelna trucizna.',
    icon: 'mdi-skull',
    type: 'damage',
    rarity: 'rare',
    tier: 3,
    requiredLevel: 22,
    ingredients: [
      { ingredientId: 'nightshade', amount: 3 },
      { ingredientId: 'spider_venom', amount: 2 },
    ],
    brewTime: 300,
    effects: [{ type: 'damage', value: 200, description: '200 obrażeń trucizny (DOT)' }],
    xpReward: 55,
    sellPrice: 100,
  },
  
  // Utility potions
  invisibility: {
    id: 'invisibility',
    name: 'Mikstura Niewidzialności',
    description: 'Ukrywa przed wzrokiem.',
    icon: 'mdi-eye-off',
    type: 'utility',
    rarity: 'rare',
    tier: 3,
    requiredLevel: 25,
    ingredients: [
      { ingredientId: 'ghost_orchid', amount: 2 },
      { ingredientId: 'void_moss', amount: 1 },
      { ingredientId: 'quicksilver', amount: 1 },
    ],
    brewTime: 400,
    effects: [{ type: 'special', value: 100, description: 'Niewidzialność przez 30s' }],
    duration: 300,
    xpReward: 80,
    sellPrice: 180,
  },
  luck: {
    id: 'luck',
    name: 'Eliksir Szczęścia',
    description: 'Zwiększa szczęście.',
    icon: 'mdi-clover',
    type: 'utility',
    rarity: 'uncommon',
    tier: 2,
    requiredLevel: 15,
    ingredients: [
      { ingredientId: 'crystal_dust', amount: 3 },
      { ingredientId: 'honey', amount: 2 },
    ],
    brewTime: 250,
    effects: [{ type: 'buff', stat: 'luck', value: 25, description: '+25% szczęścia' }],
    duration: 900,
    xpReward: 40,
    sellPrice: 70,
  },
  
  // Transmutation
  gold_elixir: {
    id: 'gold_elixir',
    name: 'Eliksir Złota',
    description: 'Przemienia materiały w złoto.',
    icon: 'mdi-gold',
    type: 'transmutation',
    rarity: 'epic',
    tier: 4,
    requiredLevel: 30,
    ingredients: [
      { ingredientId: 'quicksilver', amount: 3 },
      { ingredientId: 'crystal_dust', amount: 5 },
      { ingredientId: 'dragon_blood', amount: 1 },
    ],
    brewTime: 600,
    effects: [{ type: 'transmute', value: 500, description: 'Generuje 500 złota' }],
    xpReward: 120,
    sellPrice: 300,
  },
  philosophers_elixir: {
    id: 'philosophers_elixir',
    name: 'Eliksir Filozofów',
    description: 'Legendarny eliksir nieśmiertelności.',
    icon: 'mdi-star',
    type: 'transmutation',
    rarity: 'legendary',
    tier: 5,
    requiredLevel: 40,
    ingredients: [
      { ingredientId: 'philosophers_stone_shard', amount: 1 },
      { ingredientId: 'dragon_blood', amount: 2 },
      { ingredientId: 'phoenix_feather', amount: 2 },
      { ingredientId: 'void_moss', amount: 3 },
    ],
    brewTime: 1000,
    effects: [
      { type: 'heal', value: 1000, description: 'Pełne leczenie' },
      { type: 'buff', stat: 'all', value: 50, description: '+50% wszystkie statystyki' },
    ],
    duration: 1200,
    xpReward: 300,
    sellPrice: 1000,
  },
};

// ============================================
// EQUIPMENT
// ============================================

export const ALCHEMY_EQUIPMENT: Record<string, AlchemyEquipment> = {
  basic_cauldron: {
    id: 'basic_cauldron',
    name: 'Podstawowy Kociołek',
    description: 'Prosty kociołek do warzenia.',
    icon: 'mdi-pot',
    tier: 1,
    brewSpeedBonus: 0,
    qualityBonus: 0,
    doubleBrewChance: 0,
    requiredLevel: 1,
    cost: 50,
  },
  copper_cauldron: {
    id: 'copper_cauldron',
    name: 'Miedziany Kociołek',
    description: 'Lepiej przewodzi ciepło.',
    icon: 'mdi-pot',
    tier: 2,
    brewSpeedBonus: 10,
    qualityBonus: 5,
    doubleBrewChance: 5,
    requiredLevel: 8,
    cost: 300,
  },
  silver_cauldron: {
    id: 'silver_cauldron',
    name: 'Srebrny Kociołek',
    description: 'Szlachetny metal dla alchemii.',
    icon: 'mdi-pot',
    tier: 3,
    brewSpeedBonus: 20,
    qualityBonus: 10,
    doubleBrewChance: 10,
    requiredLevel: 18,
    cost: 800,
  },
  golden_cauldron: {
    id: 'golden_cauldron',
    name: 'Złoty Kociołek',
    description: 'Mistrzowski kociołek.',
    icon: 'mdi-pot',
    tier: 4,
    brewSpeedBonus: 30,
    qualityBonus: 20,
    doubleBrewChance: 15,
    requiredLevel: 30,
    cost: 2000,
  },
  philosophers_cauldron: {
    id: 'philosophers_cauldron',
    name: 'Kociołek Filozofów',
    description: 'Legendarny kociołek arcymistrza.',
    icon: 'mdi-pot-steam',
    tier: 5,
    brewSpeedBonus: 50,
    qualityBonus: 30,
    doubleBrewChance: 25,
    requiredLevel: 40,
    cost: 10000,
  },
};

// ============================================
// EXPERIMENTS
// ============================================

export const EXPERIMENTS: Record<string, Experiment> = {
  new_combination: {
    id: 'new_combination',
    name: 'Nowa Kombinacja',
    description: 'Eksperymentuj z nowymi składnikami.',
    icon: 'mdi-flask',
    requiredLevel: 5,
    ingredients: [
      { ingredientId: 'pure_water', amount: 3 },
      { ingredientId: 'crystal_dust', amount: 2 },
    ],
    goldCost: 50,
    experimentTime: 300,
    successChance: 60,
    xpReward: 50,
    possibleResults: ['healing', 'strength'],
  },
  volatile_mixture: {
    id: 'volatile_mixture',
    name: 'Niestabilna Mieszanka',
    description: 'Ryzykowny eksperyment z wybuchowymi substancjami.',
    icon: 'mdi-bomb',
    requiredLevel: 15,
    ingredients: [
      { ingredientId: 'sulfur', amount: 5 },
      { ingredientId: 'dragons_breath', amount: 2 },
    ],
    goldCost: 200,
    experimentTime: 500,
    successChance: 40,
    xpReward: 150,
    possibleResults: ['fire_bomb', 'poison_vial'],
  },
  legendary_research: {
    id: 'legendary_research',
    name: 'Legendarne Badania',
    description: 'Próba stworzenia czegoś wyjątkowego.',
    icon: 'mdi-star',
    requiredLevel: 35,
    ingredients: [
      { ingredientId: 'dragon_blood', amount: 1 },
      { ingredientId: 'phoenix_feather', amount: 1 },
      { ingredientId: 'void_moss', amount: 2 },
    ],
    goldCost: 1000,
    experimentTime: 1000,
    successChance: 20,
    xpReward: 500,
    discoversRecipe: 'philosophers_elixir',
    possibleResults: ['gold_elixir', 'philosophers_elixir'],
  },
};

// ============================================
// RARITY DATA
// ============================================

export const POTION_RARITY: Record<PotionRarity, { label: string; color: string }> = {
  common: { label: 'Pospolita', color: '#9E9E9E' },
  uncommon: { label: 'Niepospolita', color: '#4CAF50' },
  rare: { label: 'Rzadka', color: '#2196F3' },
  epic: { label: 'Epicka', color: '#9C27B0' },
  legendary: { label: 'Legendarna', color: '#FF9800' },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getIngredient(id: string): AlchemyIngredient | undefined {
  return ALCHEMY_INGREDIENTS[id];
}

export function getPotion(id: string): Potion | undefined {
  return POTIONS[id];
}

export function getEquipment(id: string): AlchemyEquipment | undefined {
  return ALCHEMY_EQUIPMENT[id];
}

export function getExperiment(id: string): Experiment | undefined {
  return EXPERIMENTS[id];
}

export function getAvailablePotions(level: number): Potion[] {
  return Object.values(POTIONS).filter(p => p.requiredLevel <= level);
}

export function calculateAlchemistXpToLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.15, level - 1));
}

export function getPotionTypeIcon(type: PotionType): string {
  const icons: Record<PotionType, string> = {
    healing: 'mdi-heart-plus',
    buff: 'mdi-arrow-up-bold',
    damage: 'mdi-skull',
    utility: 'mdi-cog',
    transmutation: 'mdi-auto-fix',
  };
  return icons[type];
}

export function getPotionTypeName(type: PotionType): string {
  const names: Record<PotionType, string> = {
    healing: 'Lecznicze',
    buff: 'Wzmacniające',
    damage: 'Ofensywne',
    utility: 'Użytkowe',
    transmutation: 'Transmutacyjne',
  };
  return names[type];
}
