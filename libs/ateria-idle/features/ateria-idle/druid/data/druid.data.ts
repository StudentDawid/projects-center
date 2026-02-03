/**
 * Druid Path Data - Farming, Animals, Totems, Seasons
 */

// ============================================
// TYPES
// ============================================

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export type CropType = 'vegetable' | 'herb' | 'fruit' | 'grain' | 'flower';

export type AnimalType = 'poultry' | 'livestock' | 'exotic' | 'bee';

export type TotemAnimal = 'wolf' | 'bear' | 'eagle' | 'turtle' | 'snake' | 'owl';

export interface Crop {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: CropType;
  tier: number;
  
  // Growing
  growthTime: number; // Ticks
  waterNeeded: number;
  preferredSeason: Season;
  
  // Yield
  baseYield: { min: number; max: number };
  xpReward: number;
  sellPrice: number;
  
  // Requirements
  requiredLevel: number;
  seedCost: number;
  
  // Uses
  usedFor: string[]; // Recipe IDs or uses
}

export interface FarmAnimal {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: AnimalType;
  tier: number;
  
  // Production
  productId: string;
  productName: string;
  productionTime: number; // Ticks per product
  productionAmount: { min: number; max: number };
  
  // Care
  foodNeeded: number; // Per production cycle
  happinessDecay: number; // Per tick
  
  // Requirements
  requiredLevel: number;
  purchaseCost: number;
  upkeepCost: number; // Per day
  
  // Stats
  maxHappiness: number;
  xpPerProduct: number;
}

export interface Totem {
  id: TotemAnimal;
  name: string;
  description: string;
  icon: string;
  color: string;
  
  // Unlock
  requiredLevel: number;
  unlockCost: number;
  
  // Bonuses
  bonuses: TotemBonus[];
  
  // Upgrade levels
  maxLevel: number;
  upgradeCost: (level: number) => number;
}

export interface TotemBonus {
  type: 'attack' | 'defense' | 'maxHp' | 'critChance' | 'evasion' | 'hpRegen' | 'xpBonus' | 'goldBonus';
  baseValue: number;
  perLevel: number;
  description: string;
}

export interface DruidSkillProgress {
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXp: number;
}

// ============================================
// SEASONS
// ============================================

export const SEASONS: Record<Season, { name: string; icon: string; color: string; effects: SeasonEffect[] }> = {
  spring: {
    name: 'Wiosna',
    icon: 'mdi-flower',
    color: '#4CAF50',
    effects: [
      { type: 'growth_speed', value: 20, description: '+20% szybkość wzrostu' },
      { type: 'seed_yield', value: 15, description: '+15% szansa na dodatkowe nasiona' },
    ],
  },
  summer: {
    name: 'Lato',
    icon: 'mdi-white-balance-sunny',
    color: '#FF9800',
    effects: [
      { type: 'crop_yield', value: 25, description: '+25% plony' },
      { type: 'animal_production', value: 10, description: '+10% produkcja zwierząt' },
    ],
  },
  autumn: {
    name: 'Jesień',
    icon: 'mdi-leaf',
    color: '#FF5722',
    effects: [
      { type: 'harvest_bonus', value: 30, description: '+30% bonus do zbiorów' },
      { type: 'sell_price', value: 15, description: '+15% ceny sprzedaży' },
    ],
  },
  winter: {
    name: 'Zima',
    icon: 'mdi-snowflake',
    color: '#2196F3',
    effects: [
      { type: 'animal_production', value: 20, description: '+20% produkcja zwierząt (ciepła obora)' },
      { type: 'growth_speed', value: -30, description: '-30% szybkość wzrostu roślin' },
    ],
  },
};

export interface SeasonEffect {
  type: 'growth_speed' | 'crop_yield' | 'animal_production' | 'seed_yield' | 'harvest_bonus' | 'sell_price';
  value: number;
  description: string;
}

// Day length in ticks for season cycle
export const SEASON_LENGTH = 6000; // 10 minutes = 1 season

// ============================================
// CROPS
// ============================================

export const CROPS: Record<string, Crop> = {
  // Tier 1 - Basic vegetables
  potato: {
    id: 'potato',
    name: 'Ziemniak',
    description: 'Podstawowe warzywo, łatwe w uprawie.',
    icon: 'mdi-food-variant',
    type: 'vegetable',
    tier: 1,
    growthTime: 300,
    waterNeeded: 2,
    preferredSeason: 'summer',
    baseYield: { min: 3, max: 6 },
    xpReward: 10,
    sellPrice: 5,
    requiredLevel: 1,
    seedCost: 5,
    usedFor: ['food', 'cooking'],
  },
  carrot: {
    id: 'carrot',
    name: 'Marchewka',
    description: 'Słodkie, zdrowe warzywo.',
    icon: 'mdi-carrot',
    type: 'vegetable',
    tier: 1,
    growthTime: 250,
    waterNeeded: 2,
    preferredSeason: 'spring',
    baseYield: { min: 2, max: 5 },
    xpReward: 12,
    sellPrice: 6,
    requiredLevel: 2,
    seedCost: 6,
    usedFor: ['food', 'animal_feed'],
  },
  cabbage: {
    id: 'cabbage',
    name: 'Kapusta',
    description: 'Duże, liściaste warzywo.',
    icon: 'mdi-leaf-circle',
    type: 'vegetable',
    tier: 1,
    growthTime: 350,
    waterNeeded: 3,
    preferredSeason: 'autumn',
    baseYield: { min: 2, max: 4 },
    xpReward: 15,
    sellPrice: 8,
    requiredLevel: 3,
    seedCost: 8,
    usedFor: ['food', 'cooking'],
  },

  // Tier 1 - Basic herbs
  healing_herb: {
    id: 'healing_herb_crop',
    name: 'Zioło Lecznicze',
    description: 'Podstawowe zioło o właściwościach leczniczych.',
    icon: 'mdi-leaf',
    type: 'herb',
    tier: 1,
    growthTime: 400,
    waterNeeded: 2,
    preferredSeason: 'spring',
    baseYield: { min: 2, max: 4 },
    xpReward: 18,
    sellPrice: 12,
    requiredLevel: 5,
    seedCost: 15,
    usedFor: ['alchemy', 'potions'],
  },

  // Tier 2 - Grains
  wheat: {
    id: 'wheat',
    name: 'Pszenica',
    description: 'Podstawowe zboże do produkcji mąki.',
    icon: 'mdi-barley',
    type: 'grain',
    tier: 2,
    growthTime: 500,
    waterNeeded: 3,
    preferredSeason: 'summer',
    baseYield: { min: 4, max: 8 },
    xpReward: 25,
    sellPrice: 10,
    requiredLevel: 8,
    seedCost: 12,
    usedFor: ['bread', 'animal_feed', 'beer'],
  },
  corn: {
    id: 'corn',
    name: 'Kukurydza',
    description: 'Wszechstronne zboże.',
    icon: 'mdi-corn',
    type: 'grain',
    tier: 2,
    growthTime: 550,
    waterNeeded: 4,
    preferredSeason: 'summer',
    baseYield: { min: 3, max: 7 },
    xpReward: 28,
    sellPrice: 12,
    requiredLevel: 10,
    seedCost: 15,
    usedFor: ['food', 'animal_feed'],
  },

  // Tier 2 - Fruits
  apple: {
    id: 'apple',
    name: 'Jabłko',
    description: 'Słodki owoc z jabłoni.',
    icon: 'mdi-food-apple',
    type: 'fruit',
    tier: 2,
    growthTime: 800,
    waterNeeded: 4,
    preferredSeason: 'autumn',
    baseYield: { min: 5, max: 10 },
    xpReward: 35,
    sellPrice: 15,
    requiredLevel: 12,
    seedCost: 25,
    usedFor: ['food', 'cider', 'dessert'],
  },

  // Tier 3 - Special herbs
  moonshade_crop: {
    id: 'moonshade_crop',
    name: 'Cień Księżyca',
    description: 'Rzadkie zioło rosnące tylko nocą.',
    icon: 'mdi-weather-night',
    type: 'herb',
    tier: 3,
    growthTime: 1200,
    waterNeeded: 3,
    preferredSeason: 'winter',
    baseYield: { min: 1, max: 3 },
    xpReward: 80,
    sellPrice: 85,
    requiredLevel: 25,
    seedCost: 100,
    usedFor: ['rare_potions', 'magic'],
  },

  // Tier 3 - Wine grapes
  grape: {
    id: 'grape',
    name: 'Winogrona',
    description: 'Owoce do produkcji wina.',
    icon: 'mdi-fruit-grapes',
    type: 'fruit',
    tier: 3,
    growthTime: 1000,
    waterNeeded: 5,
    preferredSeason: 'autumn',
    baseYield: { min: 4, max: 8 },
    xpReward: 60,
    sellPrice: 40,
    requiredLevel: 20,
    seedCost: 50,
    usedFor: ['wine', 'luxury'],
  },

  // Tier 4 - Exotic
  golden_apple: {
    id: 'golden_apple',
    name: 'Złote Jabłko',
    description: 'Legendarne jabłko o magicznych właściwościach.',
    icon: 'mdi-food-apple',
    type: 'fruit',
    tier: 4,
    growthTime: 2000,
    waterNeeded: 6,
    preferredSeason: 'summer',
    baseYield: { min: 1, max: 2 },
    xpReward: 200,
    sellPrice: 250,
    requiredLevel: 40,
    seedCost: 300,
    usedFor: ['legendary_food', 'immortality_serum'],
  },

  // Flowers
  rose: {
    id: 'rose',
    name: 'Róża',
    description: 'Piękny kwiat o słodkim zapachu.',
    icon: 'mdi-flower',
    type: 'flower',
    tier: 2,
    growthTime: 400,
    waterNeeded: 3,
    preferredSeason: 'spring',
    baseYield: { min: 2, max: 5 },
    xpReward: 20,
    sellPrice: 18,
    requiredLevel: 10,
    seedCost: 20,
    usedFor: ['perfume', 'decoration', 'gifts'],
  },
  sunflower: {
    id: 'sunflower',
    name: 'Słonecznik',
    description: 'Wysoki kwiat podążający za słońcem.',
    icon: 'mdi-flower',
    type: 'flower',
    tier: 2,
    growthTime: 450,
    waterNeeded: 4,
    preferredSeason: 'summer',
    baseYield: { min: 3, max: 6 },
    xpReward: 22,
    sellPrice: 15,
    requiredLevel: 8,
    seedCost: 15,
    usedFor: ['oil', 'seeds', 'decoration'],
  },
};

// ============================================
// FARM ANIMALS
// ============================================

export const FARM_ANIMALS: Record<string, FarmAnimal> = {
  // Poultry
  chicken: {
    id: 'chicken',
    name: 'Kura',
    description: 'Podstawowe zwierzę hodowlane. Daje jajka.',
    icon: 'mdi-food-drumstick',
    type: 'poultry',
    tier: 1,
    productId: 'egg',
    productName: 'Jajko',
    productionTime: 200,
    productionAmount: { min: 1, max: 2 },
    foodNeeded: 1,
    happinessDecay: 0.1,
    requiredLevel: 1,
    purchaseCost: 50,
    upkeepCost: 5,
    maxHappiness: 100,
    xpPerProduct: 5,
  },
  duck: {
    id: 'duck',
    name: 'Kaczka',
    description: 'Zwierzę dające jajka i pióra.',
    icon: 'mdi-duck',
    type: 'poultry',
    tier: 1,
    productId: 'duck_egg',
    productName: 'Jajko Kacze',
    productionTime: 250,
    productionAmount: { min: 1, max: 2 },
    foodNeeded: 1,
    happinessDecay: 0.1,
    requiredLevel: 5,
    purchaseCost: 80,
    upkeepCost: 6,
    maxHappiness: 100,
    xpPerProduct: 7,
  },

  // Livestock
  cow: {
    id: 'cow',
    name: 'Krowa',
    description: 'Duże zwierzę produkujące mleko.',
    icon: 'mdi-cow',
    type: 'livestock',
    tier: 2,
    productId: 'milk',
    productName: 'Mleko',
    productionTime: 400,
    productionAmount: { min: 2, max: 4 },
    foodNeeded: 3,
    happinessDecay: 0.15,
    requiredLevel: 10,
    purchaseCost: 300,
    upkeepCost: 15,
    maxHappiness: 100,
    xpPerProduct: 15,
  },
  sheep: {
    id: 'sheep',
    name: 'Owca',
    description: 'Zwierzę dające wełnę.',
    icon: 'mdi-sheep',
    type: 'livestock',
    tier: 2,
    productId: 'wool',
    productName: 'Wełna',
    productionTime: 600,
    productionAmount: { min: 1, max: 3 },
    foodNeeded: 2,
    happinessDecay: 0.12,
    requiredLevel: 12,
    purchaseCost: 250,
    upkeepCost: 12,
    maxHappiness: 100,
    xpPerProduct: 18,
  },
  pig: {
    id: 'pig',
    name: 'Świnia',
    description: 'Zwierzę hodowane na mięso.',
    icon: 'mdi-pig',
    type: 'livestock',
    tier: 2,
    productId: 'pork',
    productName: 'Wieprzowina',
    productionTime: 800,
    productionAmount: { min: 2, max: 5 },
    foodNeeded: 4,
    happinessDecay: 0.08,
    requiredLevel: 15,
    purchaseCost: 350,
    upkeepCost: 20,
    maxHappiness: 100,
    xpPerProduct: 25,
  },
  goat: {
    id: 'goat',
    name: 'Koza',
    description: 'Zwierzę dające mleko kozie.',
    icon: 'mdi-goat',
    type: 'livestock',
    tier: 2,
    productId: 'goat_milk',
    productName: 'Mleko Kozie',
    productionTime: 350,
    productionAmount: { min: 1, max: 3 },
    foodNeeded: 2,
    happinessDecay: 0.1,
    requiredLevel: 8,
    purchaseCost: 200,
    upkeepCost: 10,
    maxHappiness: 100,
    xpPerProduct: 12,
  },

  // Bees
  beehive: {
    id: 'beehive',
    name: 'Ul',
    description: 'Pszczoły produkujące miód i wosk.',
    icon: 'mdi-beehive-outline',
    type: 'bee',
    tier: 2,
    productId: 'honey',
    productName: 'Miód',
    productionTime: 500,
    productionAmount: { min: 2, max: 5 },
    foodNeeded: 0, // Bees feed themselves
    happinessDecay: 0.05,
    requiredLevel: 15,
    purchaseCost: 400,
    upkeepCost: 5,
    maxHappiness: 100,
    xpPerProduct: 20,
  },

  // Exotic
  silkworm: {
    id: 'silkworm',
    name: 'Jedwabnik',
    description: 'Owad produkujący jedwab.',
    icon: 'mdi-bug',
    type: 'exotic',
    tier: 3,
    productId: 'silk',
    productName: 'Jedwab',
    productionTime: 700,
    productionAmount: { min: 1, max: 2 },
    foodNeeded: 2,
    happinessDecay: 0.2,
    requiredLevel: 25,
    purchaseCost: 600,
    upkeepCost: 25,
    maxHappiness: 100,
    xpPerProduct: 35,
  },
};

// ============================================
// TOTEMS
// ============================================

export const TOTEMS: Record<TotemAnimal, Totem> = {
  wolf: {
    id: 'wolf',
    name: 'Totem Wilka',
    description: 'Duch wilka zwiększa twoją siłę ataku.',
    icon: 'mdi-paw',
    color: '#607D8B',
    requiredLevel: 5,
    unlockCost: 500,
    bonuses: [
      {
        type: 'attack',
        baseValue: 5,
        perLevel: 2,
        description: '+{value}% do obrażeń',
      },
    ],
    maxLevel: 10,
    upgradeCost: (level) => Math.floor(200 * Math.pow(1.5, level)),
  },
  bear: {
    id: 'bear',
    name: 'Totem Niedźwiedzia',
    description: 'Duch niedźwiedzia zwiększa twoje HP.',
    icon: 'mdi-paw',
    color: '#795548',
    requiredLevel: 8,
    unlockCost: 750,
    bonuses: [
      {
        type: 'maxHp',
        baseValue: 10,
        perLevel: 5,
        description: '+{value}% do maksymalnego HP',
      },
    ],
    maxLevel: 10,
    upgradeCost: (level) => Math.floor(250 * Math.pow(1.5, level)),
  },
  eagle: {
    id: 'eagle',
    name: 'Totem Orła',
    description: 'Duch orła zwiększa szansę krytyczną.',
    icon: 'mdi-bird',
    color: '#FF9800',
    requiredLevel: 12,
    unlockCost: 1000,
    bonuses: [
      {
        type: 'critChance',
        baseValue: 2,
        perLevel: 1,
        description: '+{value}% szansy na trafienie krytyczne',
      },
    ],
    maxLevel: 10,
    upgradeCost: (level) => Math.floor(300 * Math.pow(1.5, level)),
  },
  turtle: {
    id: 'turtle',
    name: 'Totem Żółwia',
    description: 'Duch żółwia zwiększa twoją obronę.',
    icon: 'mdi-turtle',
    color: '#4CAF50',
    requiredLevel: 10,
    unlockCost: 800,
    bonuses: [
      {
        type: 'defense',
        baseValue: 5,
        perLevel: 2,
        description: '+{value}% do obrony',
      },
    ],
    maxLevel: 10,
    upgradeCost: (level) => Math.floor(250 * Math.pow(1.5, level)),
  },
  snake: {
    id: 'snake',
    name: 'Totem Węża',
    description: 'Duch węża zwiększa uniki.',
    icon: 'mdi-snake',
    color: '#9C27B0',
    requiredLevel: 15,
    unlockCost: 1200,
    bonuses: [
      {
        type: 'evasion',
        baseValue: 3,
        perLevel: 1.5,
        description: '+{value}% do uników',
      },
    ],
    maxLevel: 10,
    upgradeCost: (level) => Math.floor(350 * Math.pow(1.5, level)),
  },
  owl: {
    id: 'owl',
    name: 'Totem Sowy',
    description: 'Duch sowy zwiększa zdobywane XP.',
    icon: 'mdi-owl',
    color: '#3F51B5',
    requiredLevel: 18,
    unlockCost: 1500,
    bonuses: [
      {
        type: 'xpBonus',
        baseValue: 5,
        perLevel: 2,
        description: '+{value}% do zdobywanego XP',
      },
    ],
    maxLevel: 10,
    upgradeCost: (level) => Math.floor(400 * Math.pow(1.5, level)),
  },
};

// ============================================
// ANIMAL PRODUCTS (for reference)
// ============================================

export const ANIMAL_PRODUCTS: Record<string, { name: string; sellPrice: number; usedFor: string[] }> = {
  egg: { name: 'Jajko', sellPrice: 8, usedFor: ['cooking', 'baking'] },
  duck_egg: { name: 'Jajko Kacze', sellPrice: 12, usedFor: ['cooking', 'baking'] },
  milk: { name: 'Mleko', sellPrice: 15, usedFor: ['cooking', 'cheese', 'butter'] },
  goat_milk: { name: 'Mleko Kozie', sellPrice: 18, usedFor: ['cooking', 'cheese'] },
  wool: { name: 'Wełna', sellPrice: 25, usedFor: ['tailoring', 'cloth'] },
  pork: { name: 'Wieprzowina', sellPrice: 30, usedFor: ['cooking', 'food'] },
  honey: { name: 'Miód', sellPrice: 35, usedFor: ['cooking', 'alchemy', 'luxury'] },
  silk: { name: 'Jedwab', sellPrice: 80, usedFor: ['tailoring', 'luxury'] },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getCrop(id: string): Crop | undefined {
  return CROPS[id];
}

export function getAnimal(id: string): FarmAnimal | undefined {
  return FARM_ANIMALS[id];
}

export function getTotem(id: TotemAnimal): Totem {
  return TOTEMS[id];
}

export function getCropsByTier(tier: number): Crop[] {
  return Object.values(CROPS).filter(c => c.tier === tier);
}

export function getAnimalsByTier(tier: number): FarmAnimal[] {
  return Object.values(FARM_ANIMALS).filter(a => a.tier === tier);
}

export function getAvailableCrops(level: number): Crop[] {
  return Object.values(CROPS).filter(c => c.requiredLevel <= level);
}

export function getAvailableAnimals(level: number): FarmAnimal[] {
  return Object.values(FARM_ANIMALS).filter(a => a.requiredLevel <= level);
}

export function calculateDruidXpToLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.15, level - 1));
}

export function getSeasonModifier(crop: Crop, currentSeason: Season): number {
  if (crop.preferredSeason === currentSeason) return 1.25; // 25% bonus
  if (currentSeason === 'winter' && crop.type !== 'herb') return 0.5; // 50% penalty in winter
  return 1.0;
}

export function calculateTotemBonus(totem: Totem, level: number): { type: string; value: number }[] {
  return totem.bonuses.map(bonus => ({
    type: bonus.type,
    value: bonus.baseValue + bonus.perLevel * (level - 1),
  }));
}
