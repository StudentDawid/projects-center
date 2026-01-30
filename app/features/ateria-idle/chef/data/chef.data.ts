/**
 * Chef Path Data - Cooking, Recipes, Restaurant
 */

// ============================================
// TYPES
// ============================================

export type DishCategory = 'appetizer' | 'main_course' | 'dessert' | 'drink' | 'special';

export type DishQuality = 'poor' | 'average' | 'good' | 'excellent' | 'masterpiece';

export interface Ingredient {
  id: string;
  name: string;
  icon: string;
  category: 'meat' | 'fish' | 'vegetable' | 'fruit' | 'dairy' | 'grain' | 'spice' | 'other';
  tier: number;
  basePrice: number;
  sources: string[]; // Where to get it (druid, fisherman, warrior, etc.)
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: DishCategory;
  tier: number;
  
  // Requirements
  requiredLevel: number;
  ingredients: { ingredientId: string; amount: number }[];
  cookTime: number; // Ticks
  
  // Results
  xpReward: number;
  sellPrice: number;
  
  // Buff effects when consumed
  buffEffects?: DishBuff[];
  buffDuration?: number;
}

export interface DishBuff {
  type: 'hp_regen' | 'max_hp' | 'attack' | 'defense' | 'crit_chance' | 'xp_bonus' | 'gold_bonus' | 'gather_speed';
  value: number;
  description: string;
}

export interface CookedDish {
  recipeId: string;
  quality: DishQuality;
  qualityMultiplier: number;
  cookedAt: number;
}

export interface RestaurantCustomer {
  id: string;
  name: string;
  icon: string;
  preferredCategories: DishCategory[];
  tipMultiplier: number;
  patienceTicks: number;
}

export interface ChefProgress {
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXp: number;
}

// ============================================
// INGREDIENTS
// ============================================

export const INGREDIENTS: Record<string, Ingredient> = {
  // Meat (from Warrior/monsters)
  raw_meat: { id: 'raw_meat', name: 'Surowe Mięso', icon: 'mdi-food-steak', category: 'meat', tier: 1, basePrice: 10, sources: ['warrior'] },
  poultry: { id: 'poultry', name: 'Drób', icon: 'mdi-food-drumstick', category: 'meat', tier: 1, basePrice: 12, sources: ['druid'] },
  pork: { id: 'pork', name: 'Wieprzowina', icon: 'mdi-pig', category: 'meat', tier: 2, basePrice: 20, sources: ['druid'] },
  beef: { id: 'beef', name: 'Wołowina', icon: 'mdi-cow', category: 'meat', tier: 2, basePrice: 25, sources: ['druid'] },
  game_meat: { id: 'game_meat', name: 'Dziczyzna', icon: 'mdi-food-steak', category: 'meat', tier: 3, basePrice: 40, sources: ['warrior'] },
  dragon_meat: { id: 'dragon_meat', name: 'Mięso Smoka', icon: 'mdi-dragon', category: 'meat', tier: 5, basePrice: 500, sources: ['warrior'] },

  // Fish (from Fisherman/Gathering)
  small_fish: { id: 'small_fish', name: 'Mała Ryba', icon: 'mdi-fish', category: 'fish', tier: 1, basePrice: 8, sources: ['gathering', 'fisherman'] },
  salmon: { id: 'salmon', name: 'Łosoś', icon: 'mdi-fish', category: 'fish', tier: 2, basePrice: 25, sources: ['gathering', 'fisherman'] },
  tuna: { id: 'tuna', name: 'Tuńczyk', icon: 'mdi-fish', category: 'fish', tier: 3, basePrice: 45, sources: ['fisherman'] },
  lobster: { id: 'lobster', name: 'Homar', icon: 'mdi-fish', category: 'fish', tier: 4, basePrice: 80, sources: ['fisherman'] },
  
  // Vegetables (from Druid)
  potato: { id: 'potato', name: 'Ziemniak', icon: 'mdi-food-variant', category: 'vegetable', tier: 1, basePrice: 5, sources: ['druid'] },
  carrot: { id: 'carrot', name: 'Marchewka', icon: 'mdi-carrot', category: 'vegetable', tier: 1, basePrice: 6, sources: ['druid'] },
  cabbage: { id: 'cabbage', name: 'Kapusta', icon: 'mdi-leaf-circle', category: 'vegetable', tier: 1, basePrice: 8, sources: ['druid'] },
  tomato: { id: 'tomato', name: 'Pomidor', icon: 'mdi-food-apple', category: 'vegetable', tier: 2, basePrice: 10, sources: ['druid'] },
  onion: { id: 'onion', name: 'Cebula', icon: 'mdi-circle', category: 'vegetable', tier: 1, basePrice: 4, sources: ['druid'] },
  garlic: { id: 'garlic', name: 'Czosnek', icon: 'mdi-circle-small', category: 'spice', tier: 1, basePrice: 6, sources: ['druid'] },
  
  // Fruits (from Druid)
  apple: { id: 'apple', name: 'Jabłko', icon: 'mdi-food-apple', category: 'fruit', tier: 1, basePrice: 8, sources: ['druid'] },
  grape: { id: 'grape', name: 'Winogrona', icon: 'mdi-fruit-grapes', category: 'fruit', tier: 2, basePrice: 15, sources: ['druid'] },
  berry: { id: 'berry', name: 'Jagody', icon: 'mdi-fruit-cherries', category: 'fruit', tier: 1, basePrice: 10, sources: ['gathering'] },
  
  // Dairy (from Druid)
  milk: { id: 'milk', name: 'Mleko', icon: 'mdi-cup', category: 'dairy', tier: 1, basePrice: 8, sources: ['druid'] },
  cheese: { id: 'cheese', name: 'Ser', icon: 'mdi-cheese', category: 'dairy', tier: 2, basePrice: 20, sources: ['druid'] },
  butter: { id: 'butter', name: 'Masło', icon: 'mdi-cube', category: 'dairy', tier: 2, basePrice: 15, sources: ['druid'] },
  egg: { id: 'egg', name: 'Jajko', icon: 'mdi-egg', category: 'dairy', tier: 1, basePrice: 5, sources: ['druid'] },
  
  // Grains
  flour: { id: 'flour', name: 'Mąka', icon: 'mdi-grain', category: 'grain', tier: 1, basePrice: 6, sources: ['druid'] },
  rice: { id: 'rice', name: 'Ryż', icon: 'mdi-barley', category: 'grain', tier: 1, basePrice: 8, sources: ['druid'] },
  bread: { id: 'bread', name: 'Chleb', icon: 'mdi-bread-slice', category: 'grain', tier: 1, basePrice: 10, sources: ['chef'] },
  
  // Spices & Other
  salt: { id: 'salt', name: 'Sól', icon: 'mdi-shaker', category: 'spice', tier: 1, basePrice: 3, sources: ['merchant'] },
  pepper: { id: 'pepper', name: 'Pieprz', icon: 'mdi-shaker-outline', category: 'spice', tier: 1, basePrice: 5, sources: ['merchant'] },
  herbs: { id: 'herbs', name: 'Zioła Kulinarne', icon: 'mdi-leaf', category: 'spice', tier: 1, basePrice: 8, sources: ['gathering', 'druid'] },
  honey: { id: 'honey', name: 'Miód', icon: 'mdi-beehive-outline', category: 'other', tier: 2, basePrice: 25, sources: ['druid'] },
  wine: { id: 'wine', name: 'Wino', icon: 'mdi-glass-wine', category: 'other', tier: 3, basePrice: 40, sources: ['druid'] },
};

// ============================================
// RECIPES
// ============================================

export const RECIPES: Record<string, Recipe> = {
  // Tier 1 - Basic dishes
  bread_basic: {
    id: 'bread_basic',
    name: 'Chleb',
    description: 'Podstawowy chleb, świeżo upieczony.',
    icon: 'mdi-bread-slice',
    category: 'main_course',
    tier: 1,
    requiredLevel: 1,
    ingredients: [{ ingredientId: 'flour', amount: 2 }],
    cookTime: 200,
    xpReward: 10,
    sellPrice: 15,
    buffEffects: [{ type: 'hp_regen', value: 5, description: '+5 HP/tick przez 60s' }],
    buffDuration: 600,
  },
  fried_egg: {
    id: 'fried_egg',
    name: 'Jajecznica',
    description: 'Proste, ale pożywne śniadanie.',
    icon: 'mdi-egg-fried',
    category: 'appetizer',
    tier: 1,
    requiredLevel: 1,
    ingredients: [{ ingredientId: 'egg', amount: 2 }, { ingredientId: 'butter', amount: 1 }],
    cookTime: 100,
    xpReward: 15,
    sellPrice: 20,
    buffEffects: [{ type: 'xp_bonus', value: 5, description: '+5% XP przez 60s' }],
    buffDuration: 600,
  },
  simple_soup: {
    id: 'simple_soup',
    name: 'Prosta Zupa',
    description: 'Rozgrzewająca zupa warzywna.',
    icon: 'mdi-bowl-mix',
    category: 'appetizer',
    tier: 1,
    requiredLevel: 2,
    ingredients: [
      { ingredientId: 'potato', amount: 2 },
      { ingredientId: 'carrot', amount: 1 },
      { ingredientId: 'onion', amount: 1 },
    ],
    cookTime: 300,
    xpReward: 25,
    sellPrice: 30,
    buffEffects: [{ type: 'max_hp', value: 10, description: '+10% max HP przez 2min' }],
    buffDuration: 1200,
  },
  
  // Tier 2 - Intermediate dishes
  roast_chicken: {
    id: 'roast_chicken',
    name: 'Pieczony Kurczak',
    description: 'Złocisty kurczak z ziołami.',
    icon: 'mdi-food-drumstick',
    category: 'main_course',
    tier: 2,
    requiredLevel: 5,
    ingredients: [
      { ingredientId: 'poultry', amount: 1 },
      { ingredientId: 'herbs', amount: 2 },
      { ingredientId: 'butter', amount: 1 },
    ],
    cookTime: 500,
    xpReward: 50,
    sellPrice: 60,
    buffEffects: [
      { type: 'attack', value: 10, description: '+10% obrażeń przez 3min' },
      { type: 'hp_regen', value: 10, description: '+10 HP/tick przez 3min' },
    ],
    buffDuration: 1800,
  },
  fish_stew: {
    id: 'fish_stew',
    name: 'Rybna Zupa',
    description: 'Kremowa zupa z morskimi owocami.',
    icon: 'mdi-bowl',
    category: 'appetizer',
    tier: 2,
    requiredLevel: 6,
    ingredients: [
      { ingredientId: 'small_fish', amount: 2 },
      { ingredientId: 'potato', amount: 2 },
      { ingredientId: 'milk', amount: 1 },
    ],
    cookTime: 400,
    xpReward: 45,
    sellPrice: 55,
    buffEffects: [{ type: 'defense', value: 15, description: '+15% obrony przez 3min' }],
    buffDuration: 1800,
  },
  meat_pie: {
    id: 'meat_pie',
    name: 'Pasztet Mięsny',
    description: 'Sycący pasztet z chrupiącym ciastem.',
    icon: 'mdi-food-croissant',
    category: 'main_course',
    tier: 2,
    requiredLevel: 8,
    ingredients: [
      { ingredientId: 'raw_meat', amount: 2 },
      { ingredientId: 'flour', amount: 2 },
      { ingredientId: 'onion', amount: 1 },
      { ingredientId: 'egg', amount: 1 },
    ],
    cookTime: 600,
    xpReward: 60,
    sellPrice: 75,
    buffEffects: [
      { type: 'max_hp', value: 15, description: '+15% max HP przez 4min' },
      { type: 'attack', value: 5, description: '+5% obrażeń przez 4min' },
    ],
    buffDuration: 2400,
  },
  apple_pie: {
    id: 'apple_pie',
    name: 'Szarlotka',
    description: 'Klasyczny deser z jabłkami.',
    icon: 'mdi-pie',
    category: 'dessert',
    tier: 2,
    requiredLevel: 7,
    ingredients: [
      { ingredientId: 'apple', amount: 3 },
      { ingredientId: 'flour', amount: 2 },
      { ingredientId: 'butter', amount: 1 },
      { ingredientId: 'honey', amount: 1 },
    ],
    cookTime: 450,
    xpReward: 55,
    sellPrice: 65,
    buffEffects: [{ type: 'xp_bonus', value: 15, description: '+15% XP przez 3min' }],
    buffDuration: 1800,
  },
  
  // Tier 3 - Advanced dishes
  beef_steak: {
    id: 'beef_steak',
    name: 'Stek Wołowy',
    description: 'Perfekcyjnie wysmażony stek.',
    icon: 'mdi-food-steak',
    category: 'main_course',
    tier: 3,
    requiredLevel: 12,
    ingredients: [
      { ingredientId: 'beef', amount: 1 },
      { ingredientId: 'butter', amount: 1 },
      { ingredientId: 'herbs', amount: 2 },
      { ingredientId: 'garlic', amount: 1 },
    ],
    cookTime: 400,
    xpReward: 80,
    sellPrice: 100,
    buffEffects: [
      { type: 'attack', value: 20, description: '+20% obrażeń przez 5min' },
      { type: 'crit_chance', value: 5, description: '+5% szansy krytycznej przez 5min' },
    ],
    buffDuration: 3000,
  },
  salmon_grill: {
    id: 'salmon_grill',
    name: 'Grillowany Łosoś',
    description: 'Delikatny łosoś z cytryną.',
    icon: 'mdi-fish',
    category: 'main_course',
    tier: 3,
    requiredLevel: 14,
    ingredients: [
      { ingredientId: 'salmon', amount: 1 },
      { ingredientId: 'herbs', amount: 2 },
      { ingredientId: 'butter', amount: 1 },
    ],
    cookTime: 350,
    xpReward: 75,
    sellPrice: 90,
    buffEffects: [
      { type: 'defense', value: 20, description: '+20% obrony przez 5min' },
      { type: 'hp_regen', value: 20, description: '+20 HP/tick przez 5min' },
    ],
    buffDuration: 3000,
  },
  royal_feast: {
    id: 'royal_feast',
    name: 'Królewska Uczta',
    description: 'Wykwintne danie godne króla.',
    icon: 'mdi-silverware-fork-knife',
    category: 'special',
    tier: 3,
    requiredLevel: 18,
    ingredients: [
      { ingredientId: 'beef', amount: 2 },
      { ingredientId: 'poultry', amount: 1 },
      { ingredientId: 'wine', amount: 1 },
      { ingredientId: 'cheese', amount: 1 },
      { ingredientId: 'herbs', amount: 3 },
    ],
    cookTime: 900,
    xpReward: 150,
    sellPrice: 200,
    buffEffects: [
      { type: 'attack', value: 25, description: '+25% obrażeń przez 10min' },
      { type: 'defense', value: 25, description: '+25% obrony przez 10min' },
      { type: 'max_hp', value: 25, description: '+25% max HP przez 10min' },
    ],
    buffDuration: 6000,
  },
  
  // Tier 4 - Master dishes
  lobster_thermidor: {
    id: 'lobster_thermidor',
    name: 'Homar Thermidor',
    description: 'Luksusowe danie z homara.',
    icon: 'mdi-fish',
    category: 'special',
    tier: 4,
    requiredLevel: 25,
    ingredients: [
      { ingredientId: 'lobster', amount: 2 },
      { ingredientId: 'cheese', amount: 2 },
      { ingredientId: 'wine', amount: 1 },
      { ingredientId: 'butter', amount: 2 },
    ],
    cookTime: 800,
    xpReward: 200,
    sellPrice: 350,
    buffEffects: [
      { type: 'gold_bonus', value: 30, description: '+30% złota przez 10min' },
      { type: 'xp_bonus', value: 30, description: '+30% XP przez 10min' },
    ],
    buffDuration: 6000,
  },
  dragon_steak: {
    id: 'dragon_steak',
    name: 'Stek ze Smoka',
    description: 'Legendarny przysmak z mięsa smoka.',
    icon: 'mdi-dragon',
    category: 'special',
    tier: 5,
    requiredLevel: 35,
    ingredients: [
      { ingredientId: 'dragon_meat', amount: 1 },
      { ingredientId: 'wine', amount: 2 },
      { ingredientId: 'herbs', amount: 5 },
      { ingredientId: 'honey', amount: 2 },
    ],
    cookTime: 1200,
    xpReward: 500,
    sellPrice: 1000,
    buffEffects: [
      { type: 'attack', value: 50, description: '+50% obrażeń przez 15min' },
      { type: 'defense', value: 50, description: '+50% obrony przez 15min' },
      { type: 'max_hp', value: 50, description: '+50% max HP przez 15min' },
      { type: 'crit_chance', value: 15, description: '+15% szansy krytycznej przez 15min' },
    ],
    buffDuration: 9000,
  },
  
  // Drinks
  herbal_tea: {
    id: 'herbal_tea',
    name: 'Herbata Ziołowa',
    description: 'Relaksująca herbata z ziół.',
    icon: 'mdi-tea',
    category: 'drink',
    tier: 1,
    requiredLevel: 3,
    ingredients: [{ ingredientId: 'herbs', amount: 2 }],
    cookTime: 100,
    xpReward: 12,
    sellPrice: 18,
    buffEffects: [{ type: 'hp_regen', value: 15, description: '+15 HP/tick przez 2min' }],
    buffDuration: 1200,
  },
  fruit_juice: {
    id: 'fruit_juice',
    name: 'Sok Owocowy',
    description: 'Świeży sok z owoców.',
    icon: 'mdi-cup',
    category: 'drink',
    tier: 1,
    requiredLevel: 4,
    ingredients: [
      { ingredientId: 'apple', amount: 2 },
      { ingredientId: 'berry', amount: 1 },
    ],
    cookTime: 150,
    xpReward: 18,
    sellPrice: 25,
    buffEffects: [{ type: 'gather_speed', value: 15, description: '+15% szybkość zbierania przez 3min' }],
    buffDuration: 1800,
  },
  mulled_wine: {
    id: 'mulled_wine',
    name: 'Grzane Wino',
    description: 'Rozgrzewające wino z przyprawami.',
    icon: 'mdi-glass-wine',
    category: 'drink',
    tier: 3,
    requiredLevel: 15,
    ingredients: [
      { ingredientId: 'wine', amount: 1 },
      { ingredientId: 'honey', amount: 1 },
      { ingredientId: 'herbs', amount: 2 },
    ],
    cookTime: 200,
    xpReward: 60,
    sellPrice: 80,
    buffEffects: [
      { type: 'xp_bonus', value: 20, description: '+20% XP przez 5min' },
      { type: 'gold_bonus', value: 10, description: '+10% złota przez 5min' },
    ],
    buffDuration: 3000,
  },
};

// ============================================
// RESTAURANT CUSTOMERS
// ============================================

export const RESTAURANT_CUSTOMERS: RestaurantCustomer[] = [
  { id: 'peasant', name: 'Wieśniak', icon: 'mdi-account', preferredCategories: ['appetizer', 'main_course'], tipMultiplier: 1.0, patienceTicks: 600 },
  { id: 'merchant', name: 'Kupiec', icon: 'mdi-account-tie', preferredCategories: ['main_course', 'drink'], tipMultiplier: 1.2, patienceTicks: 500 },
  { id: 'noble', name: 'Szlachcic', icon: 'mdi-crown', preferredCategories: ['special', 'dessert'], tipMultiplier: 1.5, patienceTicks: 400 },
  { id: 'adventurer', name: 'Poszukiwacz Przygód', icon: 'mdi-sword', preferredCategories: ['main_course', 'drink'], tipMultiplier: 1.3, patienceTicks: 450 },
  { id: 'wizard', name: 'Mag', icon: 'mdi-wizard-hat', preferredCategories: ['drink', 'special'], tipMultiplier: 1.4, patienceTicks: 550 },
];

// ============================================
// QUALITY SYSTEM
// ============================================

export const QUALITY_LEVELS: Record<DishQuality, { label: string; color: string; multiplier: number; minRoll: number }> = {
  poor: { label: 'Słaba', color: '#9E9E9E', multiplier: 0.5, minRoll: 0 },
  average: { label: 'Przeciętna', color: '#8D6E63', multiplier: 1.0, minRoll: 20 },
  good: { label: 'Dobra', color: '#4CAF50', multiplier: 1.3, minRoll: 50 },
  excellent: { label: 'Wyśmienita', color: '#2196F3', multiplier: 1.6, minRoll: 75 },
  masterpiece: { label: 'Arcydzieło', color: '#FF9800', multiplier: 2.0, minRoll: 95 },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getIngredient(id: string): Ingredient | undefined {
  return INGREDIENTS[id];
}

export function getRecipe(id: string): Recipe | undefined {
  return RECIPES[id];
}

export function getAvailableRecipes(level: number): Recipe[] {
  return Object.values(RECIPES).filter(r => r.requiredLevel <= level);
}

export function getRecipesByCategory(category: DishCategory): Recipe[] {
  return Object.values(RECIPES).filter(r => r.category === category);
}

export function calculateChefXpToLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.15, level - 1));
}

export function calculateDishQuality(level: number, recipeTier: number): DishQuality {
  const skillBonus = level * 2;
  const tierPenalty = Math.max(0, (recipeTier - 1) * 10);
  const roll = Math.random() * 100 + skillBonus - tierPenalty;
  
  if (roll >= 95) return 'masterpiece';
  if (roll >= 75) return 'excellent';
  if (roll >= 50) return 'good';
  if (roll >= 20) return 'average';
  return 'poor';
}

export function getCategoryIcon(category: DishCategory): string {
  const icons: Record<DishCategory, string> = {
    appetizer: 'mdi-bowl-mix',
    main_course: 'mdi-silverware-fork-knife',
    dessert: 'mdi-cupcake',
    drink: 'mdi-cup',
    special: 'mdi-star',
  };
  return icons[category];
}

export function getCategoryName(category: DishCategory): string {
  const names: Record<DishCategory, string> = {
    appetizer: 'Przystawki',
    main_course: 'Dania Główne',
    dessert: 'Desery',
    drink: 'Napoje',
    special: 'Specjały',
  };
  return names[category];
}
