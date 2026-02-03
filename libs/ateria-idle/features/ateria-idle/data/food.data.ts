/**
 * Food System definitions for Ateria Idle
 * Food items, cooking recipes, and consumption mechanics
 */

// ============================================
// FOOD TYPES
// ============================================

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: 1 | 2 | 3 | 4;
  healAmount: number; // HP restored
  healPercent?: number; // % of max HP restored (optional)
  consumeTime: number; // Time in ticks to consume (100 = 1 second)
  stackSize: number; // Max stack in inventory
  source: FoodSource[];
  rarity: 'common' | 'uncommon' | 'rare' | 'epic';
  buffs?: FoodBuff[];
}

export interface FoodBuff {
  type: 'hp_regen' | 'attack' | 'defense' | 'xp_bonus' | 'gold_bonus';
  value: number;
  duration: number; // In seconds
}

export type FoodSource = 'loot' | 'merchant' | 'cooking' | 'farming' | 'caravan';

// ============================================
// FOOD DEFINITIONS
// ============================================

export const FOODS: Record<string, FoodItem> = {
  // Tier 1 - Basic Foods (from loot/merchant)
  bread: {
    id: 'bread',
    name: 'Chleb',
    description: 'Prosty bochenek chleba. Podstawowe pożywienie.',
    icon: 'mdi-bread-slice',
    tier: 1,
    healAmount: 20,
    consumeTime: 50,
    stackSize: 50,
    source: ['merchant', 'loot'],
    rarity: 'common',
  },
  apple: {
    id: 'apple',
    name: 'Jabłko',
    description: 'Świeże jabłko z sadu.',
    icon: 'mdi-food-apple',
    tier: 1,
    healAmount: 15,
    consumeTime: 30,
    stackSize: 100,
    source: ['loot', 'farming'],
    rarity: 'common',
  },
  raw_meat: {
    id: 'raw_meat',
    name: 'Surowe Mięso',
    description: 'Mięso z potwora. Można ugotować dla lepszych efektów.',
    icon: 'mdi-food-steak',
    tier: 1,
    healAmount: 10,
    consumeTime: 80,
    stackSize: 50,
    source: ['loot'],
    rarity: 'common',
  },
  cheese: {
    id: 'cheese',
    name: 'Ser',
    description: 'Kawałek żółtego sera.',
    icon: 'mdi-cheese',
    tier: 1,
    healAmount: 25,
    consumeTime: 40,
    stackSize: 30,
    source: ['merchant', 'farming'],
    rarity: 'common',
  },

  // Tier 2 - Cooked Foods
  cooked_meat: {
    id: 'cooked_meat',
    name: 'Pieczone Mięso',
    description: 'Dobrze przyrządzone mięso. Smaczne i pożywne.',
    icon: 'mdi-food-drumstick',
    tier: 2,
    healAmount: 50,
    consumeTime: 60,
    stackSize: 30,
    source: ['cooking'],
    rarity: 'uncommon',
  },
  fish_fillet: {
    id: 'fish_fillet',
    name: 'Filet z Ryby',
    description: 'Świeży filet ryby. Lekki i pożywny.',
    icon: 'mdi-fish',
    tier: 2,
    healAmount: 40,
    consumeTime: 50,
    stackSize: 40,
    source: ['cooking', 'merchant'],
    rarity: 'uncommon',
  },
  meat_pie: {
    id: 'meat_pie',
    name: 'Pasztet Mięsny',
    description: 'Ciasto wypełnione mięsem i warzywami.',
    icon: 'mdi-food-croissant',
    tier: 2,
    healAmount: 60,
    consumeTime: 70,
    stackSize: 20,
    source: ['cooking'],
    rarity: 'uncommon',
  },
  vegetable_stew: {
    id: 'vegetable_stew',
    name: 'Gulasz Warzywny',
    description: 'Ciepły gulasz z różnych warzyw.',
    icon: 'mdi-pot-steam',
    tier: 2,
    healAmount: 45,
    consumeTime: 80,
    stackSize: 20,
    source: ['cooking'],
    rarity: 'uncommon',
    buffs: [
      { type: 'hp_regen', value: 1, duration: 60 },
    ],
  },

  // Tier 3 - Advanced Foods
  roast_beast: {
    id: 'roast_beast',
    name: 'Pieczeń z Bestii',
    description: 'Wykwintna pieczeń z rzadkiego potwora.',
    icon: 'mdi-food-turkey',
    tier: 3,
    healAmount: 100,
    consumeTime: 80,
    stackSize: 15,
    source: ['cooking'],
    rarity: 'rare',
    buffs: [
      { type: 'attack', value: 10, duration: 300 },
    ],
  },
  magic_fruit: {
    id: 'magic_fruit',
    name: 'Magiczny Owoc',
    description: 'Owoc nasycony magiczną energią.',
    icon: 'mdi-fruit-grapes',
    tier: 3,
    healAmount: 80,
    healPercent: 20,
    consumeTime: 40,
    stackSize: 10,
    source: ['loot', 'farming'],
    rarity: 'rare',
    buffs: [
      { type: 'xp_bonus', value: 10, duration: 600 },
    ],
  },
  hunters_feast: {
    id: 'hunters_feast',
    name: 'Uczta Łowcy',
    description: 'Bogaty posiłek przygotowany dla wojowników.',
    icon: 'mdi-silverware-fork-knife',
    tier: 3,
    healAmount: 120,
    consumeTime: 100,
    stackSize: 10,
    source: ['cooking'],
    rarity: 'rare',
    buffs: [
      { type: 'attack', value: 15, duration: 600 },
      { type: 'defense', value: 10, duration: 600 },
    ],
  },
  honey_cake: {
    id: 'honey_cake',
    name: 'Ciasto Miodowe',
    description: 'Słodkie ciasto z miodem. Dodaje energii.',
    icon: 'mdi-cake',
    tier: 3,
    healAmount: 70,
    consumeTime: 50,
    stackSize: 15,
    source: ['cooking', 'farming'],
    rarity: 'rare',
    buffs: [
      { type: 'gold_bonus', value: 15, duration: 600 },
    ],
  },

  // Tier 4 - Legendary Foods
  dragon_steak: {
    id: 'dragon_steak',
    name: 'Stek Smoczy',
    description: 'Niezwykle rzadki stek z mięsa smoka.',
    icon: 'mdi-fire',
    tier: 4,
    healAmount: 200,
    healPercent: 50,
    consumeTime: 100,
    stackSize: 5,
    source: ['cooking', 'loot'],
    rarity: 'epic',
    buffs: [
      { type: 'attack', value: 30, duration: 900 },
      { type: 'hp_regen', value: 5, duration: 900 },
    ],
  },
  ambrosia: {
    id: 'ambrosia',
    name: 'Ambrozja',
    description: 'Pokarm bogów. Przywraca pełne HP i daje potężne bonusy.',
    icon: 'mdi-star-circle',
    tier: 4,
    healAmount: 500,
    healPercent: 100,
    consumeTime: 50,
    stackSize: 3,
    source: ['cooking'],
    rarity: 'epic',
    buffs: [
      { type: 'attack', value: 25, duration: 1200 },
      { type: 'defense', value: 25, duration: 1200 },
      { type: 'xp_bonus', value: 25, duration: 1200 },
    ],
  },
  elixir_of_life: {
    id: 'elixir_of_life',
    name: 'Eliksir Życia',
    description: 'Legendarna mikstura przywracająca siły.',
    icon: 'mdi-bottle-tonic-plus',
    tier: 4,
    healAmount: 300,
    healPercent: 75,
    consumeTime: 30,
    stackSize: 5,
    source: ['cooking'],
    rarity: 'epic',
    buffs: [
      { type: 'hp_regen', value: 10, duration: 1800 },
    ],
  },
};

// ============================================
// COOKING RECIPES
// ============================================

export interface CookingRecipe {
  id: string;
  name: string;
  description: string;
  resultFood: string;
  resultAmount: number;
  ingredients: { itemId: string; amount: number }[];
  cookTime: number; // In seconds
  requiredLevel: number; // Cooking skill level (warrior level for now)
  xpReward: number;
}

export const COOKING_RECIPES: Record<string, CookingRecipe> = {
  cook_meat: {
    id: 'cook_meat',
    name: 'Pieczeń Mięsa',
    description: 'Ugotuj surowe mięso',
    resultFood: 'cooked_meat',
    resultAmount: 1,
    ingredients: [
      { itemId: 'raw_meat', amount: 1 },
    ],
    cookTime: 10,
    requiredLevel: 1,
    xpReward: 5,
  },
  bake_bread: {
    id: 'bake_bread',
    name: 'Pieczenie Chleba',
    description: 'Upiecz świeży chleb',
    resultFood: 'bread',
    resultAmount: 2,
    ingredients: [
      { itemId: 'wheat', amount: 3 },
    ],
    cookTime: 15,
    requiredLevel: 3,
    xpReward: 8,
  },
  make_stew: {
    id: 'make_stew',
    name: 'Gulasz Warzywny',
    description: 'Przygotuj pożywny gulasz',
    resultFood: 'vegetable_stew',
    resultAmount: 1,
    ingredients: [
      { itemId: 'potato', amount: 2 },
      { itemId: 'carrot', amount: 2 },
      { itemId: 'onion', amount: 1 },
    ],
    cookTime: 30,
    requiredLevel: 5,
    xpReward: 15,
  },
  make_meat_pie: {
    id: 'make_meat_pie',
    name: 'Pasztet Mięsny',
    description: 'Przygotuj pyszny pasztet',
    resultFood: 'meat_pie',
    resultAmount: 1,
    ingredients: [
      { itemId: 'cooked_meat', amount: 2 },
      { itemId: 'wheat', amount: 2 },
      { itemId: 'cheese', amount: 1 },
    ],
    cookTime: 45,
    requiredLevel: 10,
    xpReward: 25,
  },
  prepare_roast: {
    id: 'prepare_roast',
    name: 'Pieczeń z Bestii',
    description: 'Przygotuj wykwintną pieczeń',
    resultFood: 'roast_beast',
    resultAmount: 1,
    ingredients: [
      { itemId: 'beast_meat', amount: 3 },
      { itemId: 'fire_blossom', amount: 1 },
      { itemId: 'salt_crystal', amount: 2 },
    ],
    cookTime: 90,
    requiredLevel: 20,
    xpReward: 50,
  },
  make_hunters_feast: {
    id: 'make_hunters_feast',
    name: 'Uczta Łowcy',
    description: 'Przygotuj bogaty posiłek',
    resultFood: 'hunters_feast',
    resultAmount: 1,
    ingredients: [
      { itemId: 'roast_beast', amount: 1 },
      { itemId: 'vegetable_stew', amount: 1 },
      { itemId: 'honey_cake', amount: 1 },
    ],
    cookTime: 120,
    requiredLevel: 30,
    xpReward: 100,
  },
  bake_honey_cake: {
    id: 'bake_honey_cake',
    name: 'Ciasto Miodowe',
    description: 'Upiecz słodkie ciasto',
    resultFood: 'honey_cake',
    resultAmount: 2,
    ingredients: [
      { itemId: 'wheat', amount: 3 },
      { itemId: 'honey', amount: 2 },
      { itemId: 'apple', amount: 2 },
    ],
    cookTime: 60,
    requiredLevel: 15,
    xpReward: 35,
  },
  cook_dragon_steak: {
    id: 'cook_dragon_steak',
    name: 'Stek Smoczy',
    description: 'Przygotuj legendarny stek',
    resultFood: 'dragon_steak',
    resultAmount: 1,
    ingredients: [
      { itemId: 'dragon_meat', amount: 1 },
      { itemId: 'dragons_breath', amount: 1 },
      { itemId: 'magic_essence', amount: 2 },
    ],
    cookTime: 180,
    requiredLevel: 40,
    xpReward: 200,
  },
  create_ambrosia: {
    id: 'create_ambrosia',
    name: 'Ambrozja',
    description: 'Stwórz pokarm bogów',
    resultFood: 'ambrosia',
    resultAmount: 1,
    ingredients: [
      { itemId: 'dragon_steak', amount: 1 },
      { itemId: 'magic_fruit', amount: 3 },
      { itemId: 'life_essence', amount: 2 },
      { itemId: 'philosophers_ite', amount: 1 },
    ],
    cookTime: 300,
    requiredLevel: 50,
    xpReward: 500,
  },
};

// ============================================
// AUTO-EAT SETTINGS
// ============================================

export interface AutoEatSettings {
  enabled: boolean;
  threshold: number; // HP % below which to eat
  priorityOrder: string[]; // Food IDs in order of priority
  preserveHighTier: boolean; // Don't auto-eat tier 3+ foods
}

export const DEFAULT_AUTO_EAT_SETTINGS: AutoEatSettings = {
  enabled: true,
  threshold: 50,
  priorityOrder: ['bread', 'apple', 'cheese', 'cooked_meat', 'fish_fillet'],
  preserveHighTier: true,
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getFood(id: string): FoodItem | undefined {
  return FOODS[id];
}

export function getFoodsByTier(tier: number): FoodItem[] {
  return Object.values(FOODS).filter(f => f.tier === tier);
}

export function getFoodsBySource(source: FoodSource): FoodItem[] {
  return Object.values(FOODS).filter(f => f.source.includes(source));
}

export function getCookingRecipe(id: string): CookingRecipe | undefined {
  return COOKING_RECIPES[id];
}

export function getAvailableCookingRecipes(level: number): CookingRecipe[] {
  return Object.values(COOKING_RECIPES).filter(r => r.requiredLevel <= level);
}

export function calculateHealAmount(food: FoodItem, maxHp: number): number {
  let heal = food.healAmount;
  if (food.healPercent) {
    heal = Math.max(heal, Math.floor(maxHp * food.healPercent / 100));
  }
  return heal;
}

export function getFoodEffectiveness(food: FoodItem): number {
  // Score based on heal amount, buffs, and tier
  let score = food.healAmount;
  if (food.healPercent) {
    score += food.healPercent * 5; // Percent healing is valuable
  }
  if (food.buffs) {
    for (const buff of food.buffs) {
      score += buff.value * (buff.duration / 60); // Buff value * minutes
    }
  }
  score /= food.consumeTime / 50; // Normalize by consume time
  return score;
}

// Sort foods by effectiveness (for auto-eat priority)
export function sortFoodsByEffectiveness(foods: FoodItem[]): FoodItem[] {
  return [...foods].sort((a, b) => getFoodEffectiveness(b) - getFoodEffectiveness(a));
}

// ============================================
// FOOD SOURCES FROM MONSTERS
// ============================================

export const MONSTER_FOOD_DROPS: Record<string, { foodId: string; chance: number; minAmount: number; maxAmount: number }[]> = {
  // Forest monsters
  wolf: [
    { foodId: 'raw_meat', chance: 0.5, minAmount: 1, maxAmount: 2 },
  ],
  boar: [
    { foodId: 'raw_meat', chance: 0.7, minAmount: 2, maxAmount: 3 },
  ],
  // Desert monsters
  scorpion: [
    { foodId: 'raw_meat', chance: 0.3, minAmount: 1, maxAmount: 1 },
  ],
  // Mountain monsters
  bear: [
    { foodId: 'raw_meat', chance: 0.8, minAmount: 2, maxAmount: 4 },
    { foodId: 'honey', chance: 0.2, minAmount: 1, maxAmount: 2 },
  ],
  // Boss monsters
  forest_guardian: [
    { foodId: 'magic_fruit', chance: 1.0, minAmount: 1, maxAmount: 3 },
  ],
  dragon: [
    { foodId: 'dragon_meat', chance: 0.5, minAmount: 1, maxAmount: 1 },
  ],
};

export function getMonsterFoodDrops(monsterId: string): typeof MONSTER_FOOD_DROPS[string] {
  return MONSTER_FOOD_DROPS[monsterId] || [];
}
