/**
 * Fisherman Path Data - Fishing, Equipment, Fish Types
 */

// ============================================
// TYPES
// ============================================

export type WaterType = 'river' | 'lake' | 'sea' | 'underground' | 'magical';

export type FishRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night';

export type Weather = 'sunny' | 'cloudy' | 'rainy' | 'stormy';

export interface Fish {
  id: string;
  name: string;
  description: string;
  icon: string;
  waterType: WaterType;
  rarity: FishRarity;
  tier: number;
  
  // Catch requirements
  requiredLevel: number;
  minRodPower: number;
  preferredTime?: TimeOfDay[];
  preferredWeather?: Weather[];
  preferredBait?: string[];
  
  // Rewards
  xpReward: number;
  sellPrice: number;
  
  // Uses
  usedFor: string[]; // chef, alchemist, etc.
}

export interface FishingRod {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: number;
  
  // Stats
  power: number;
  speed: number; // Reduces catch time
  luck: number; // Better fish chance
  durability: number;
  
  // Requirements
  requiredLevel: number;
  cost: number;
}

export interface Bait {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: number;
  
  // Effects
  catchSpeedBonus: number;
  rarityBonus: number;
  specificFish?: string[]; // Attracts specific fish
  
  cost: number;
  uses: number;
}

export interface FishingSpot {
  id: string;
  name: string;
  description: string;
  icon: string;
  waterType: WaterType;
  
  // Requirements
  requiredLevel: number;
  
  // Available fish
  availableFish: string[];
  
  // Modifiers
  baseCatchTime: number;
  rarityModifier: number;
}

export interface FishermanProgress {
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXp: number;
}

export interface ActiveFishing {
  spotId: string;
  startTime: number;
  ticksRemaining: number;
  totalTicks: number;
  potentialFish: string | null;
}

// ============================================
// FISH
// ============================================

export const FISH: Record<string, Fish> = {
  // River - Common
  minnow: {
    id: 'minnow',
    name: 'Płotka',
    description: 'Mała, pospolita ryba rzeczna.',
    icon: 'mdi-fish',
    waterType: 'river',
    rarity: 'common',
    tier: 1,
    requiredLevel: 1,
    minRodPower: 1,
    xpReward: 5,
    sellPrice: 5,
    usedFor: ['chef', 'bait'],
  },
  perch: {
    id: 'perch',
    name: 'Okoń',
    description: 'Popularny gatunek rzeczny.',
    icon: 'mdi-fish',
    waterType: 'river',
    rarity: 'common',
    tier: 1,
    requiredLevel: 2,
    minRodPower: 2,
    xpReward: 8,
    sellPrice: 10,
    usedFor: ['chef'],
  },
  carp: {
    id: 'carp',
    name: 'Karp',
    description: 'Duża ryba słodkowodna.',
    icon: 'mdi-fish',
    waterType: 'river',
    rarity: 'uncommon',
    tier: 2,
    requiredLevel: 5,
    minRodPower: 5,
    xpReward: 20,
    sellPrice: 25,
    usedFor: ['chef'],
  },
  catfish: {
    id: 'catfish',
    name: 'Sum',
    description: 'Wielki sum rzeczny.',
    icon: 'mdi-fish',
    waterType: 'river',
    rarity: 'rare',
    tier: 3,
    requiredLevel: 12,
    minRodPower: 15,
    preferredTime: ['night'],
    xpReward: 50,
    sellPrice: 60,
    usedFor: ['chef'],
  },

  // Lake - Varied
  trout: {
    id: 'trout',
    name: 'Pstrąg',
    description: 'Smaczna ryba jeziorowa.',
    icon: 'mdi-fish',
    waterType: 'lake',
    rarity: 'common',
    tier: 1,
    requiredLevel: 3,
    minRodPower: 3,
    xpReward: 12,
    sellPrice: 15,
    usedFor: ['chef'],
  },
  pike: {
    id: 'pike',
    name: 'Szczupak',
    description: 'Drapieżnik jeziorowy.',
    icon: 'mdi-fish',
    waterType: 'lake',
    rarity: 'uncommon',
    tier: 2,
    requiredLevel: 8,
    minRodPower: 10,
    xpReward: 30,
    sellPrice: 40,
    usedFor: ['chef'],
  },
  sturgeon: {
    id: 'sturgeon',
    name: 'Jesiotr',
    description: 'Cenna ryba produkująca kawior.',
    icon: 'mdi-fish',
    waterType: 'lake',
    rarity: 'rare',
    tier: 3,
    requiredLevel: 15,
    minRodPower: 20,
    xpReward: 80,
    sellPrice: 120,
    usedFor: ['chef', 'caviar'],
  },

  // Sea - Higher tier
  salmon: {
    id: 'salmon',
    name: 'Łosoś',
    description: 'Król ryb morskich.',
    icon: 'mdi-fish',
    waterType: 'sea',
    rarity: 'uncommon',
    tier: 2,
    requiredLevel: 10,
    minRodPower: 12,
    xpReward: 35,
    sellPrice: 50,
    usedFor: ['chef'],
  },
  tuna: {
    id: 'tuna',
    name: 'Tuńczyk',
    description: 'Potężna ryba oceaniczna.',
    icon: 'mdi-fish',
    waterType: 'sea',
    rarity: 'rare',
    tier: 3,
    requiredLevel: 18,
    minRodPower: 25,
    xpReward: 70,
    sellPrice: 90,
    usedFor: ['chef'],
  },
  swordfish: {
    id: 'swordfish',
    name: 'Miecznik',
    description: 'Majestatyczna ryba z mieczem.',
    icon: 'mdi-fish',
    waterType: 'sea',
    rarity: 'epic',
    tier: 4,
    requiredLevel: 25,
    minRodPower: 40,
    xpReward: 150,
    sellPrice: 200,
    usedFor: ['chef', 'trophy'],
  },
  lobster: {
    id: 'lobster',
    name: 'Homar',
    description: 'Luksusowy owoc morza.',
    icon: 'mdi-fish',
    waterType: 'sea',
    rarity: 'rare',
    tier: 3,
    requiredLevel: 20,
    minRodPower: 20,
    xpReward: 60,
    sellPrice: 100,
    usedFor: ['chef'],
  },
  giant_squid: {
    id: 'giant_squid',
    name: 'Gigantyczna Kałamarnica',
    description: 'Legendarny potwór morski.',
    icon: 'mdi-octopus',
    waterType: 'sea',
    rarity: 'legendary',
    tier: 5,
    requiredLevel: 35,
    minRodPower: 60,
    preferredTime: ['night'],
    preferredWeather: ['stormy'],
    xpReward: 500,
    sellPrice: 800,
    usedFor: ['alchemist', 'trophy'],
  },

  // Underground - Rare
  blind_fish: {
    id: 'blind_fish',
    name: 'Ślepa Ryba',
    description: 'Ryba z podziemnych jaskiń.',
    icon: 'mdi-fish',
    waterType: 'underground',
    rarity: 'uncommon',
    tier: 2,
    requiredLevel: 12,
    minRodPower: 10,
    xpReward: 40,
    sellPrice: 55,
    usedFor: ['alchemist'],
  },
  cave_eel: {
    id: 'cave_eel',
    name: 'Jaskiniowy Węgorz',
    description: 'Elektryczny węgorz z głębin.',
    icon: 'mdi-snake',
    waterType: 'underground',
    rarity: 'rare',
    tier: 3,
    requiredLevel: 20,
    minRodPower: 25,
    xpReward: 90,
    sellPrice: 130,
    usedFor: ['alchemist', 'wizard'],
  },
  crystal_fish: {
    id: 'crystal_fish',
    name: 'Kryształowa Ryba',
    description: 'Przezroczysta ryba jak kryształ.',
    icon: 'mdi-fish',
    waterType: 'underground',
    rarity: 'epic',
    tier: 4,
    requiredLevel: 28,
    minRodPower: 45,
    xpReward: 200,
    sellPrice: 350,
    usedFor: ['alchemist', 'jeweler'],
  },

  // Magical - Highest tier
  starfish: {
    id: 'starfish_magical',
    name: 'Gwiezdna Ryba',
    description: 'Ryba z innego wymiaru.',
    icon: 'mdi-star',
    waterType: 'magical',
    rarity: 'epic',
    tier: 4,
    requiredLevel: 30,
    minRodPower: 50,
    preferredTime: ['night'],
    xpReward: 250,
    sellPrice: 400,
    usedFor: ['mystic', 'alchemist'],
  },
  void_leviathan: {
    id: 'void_leviathan',
    name: 'Lewiatan Pustki',
    description: 'Legendarny stwór z Pustki.',
    icon: 'mdi-snake',
    waterType: 'magical',
    rarity: 'legendary',
    tier: 5,
    requiredLevel: 40,
    minRodPower: 80,
    preferredTime: ['night'],
    xpReward: 1000,
    sellPrice: 2000,
    usedFor: ['mystic', 'alchemist', 'trophy'],
  },
  golden_koi: {
    id: 'golden_koi',
    name: 'Złota Koi',
    description: 'Mistyczna ryba przynosząca szczęście.',
    icon: 'mdi-fish',
    waterType: 'magical',
    rarity: 'legendary',
    tier: 5,
    requiredLevel: 35,
    minRodPower: 60,
    xpReward: 600,
    sellPrice: 1000,
    usedFor: ['merchant', 'mystic'],
  },

  // Pearl oysters
  pearl_oyster: {
    id: 'pearl_oyster',
    name: 'Ostryga Perłowa',
    description: 'Zawiera cenną perłę.',
    icon: 'mdi-diamond-stone',
    waterType: 'sea',
    rarity: 'rare',
    tier: 3,
    requiredLevel: 15,
    minRodPower: 15,
    xpReward: 45,
    sellPrice: 80,
    usedFor: ['jeweler'],
  },
};

// ============================================
// FISHING RODS
// ============================================

export const FISHING_RODS: Record<string, FishingRod> = {
  wooden_rod: {
    id: 'wooden_rod',
    name: 'Drewniana Wędka',
    description: 'Podstawowa wędka dla początkujących.',
    icon: 'mdi-fishing',
    tier: 1,
    power: 5,
    speed: 1.0,
    luck: 0,
    durability: 100,
    requiredLevel: 1,
    cost: 50,
  },
  bamboo_rod: {
    id: 'bamboo_rod',
    name: 'Bambusowa Wędka',
    description: 'Lekka i elastyczna.',
    icon: 'mdi-fishing',
    tier: 1,
    power: 8,
    speed: 1.1,
    luck: 2,
    durability: 120,
    requiredLevel: 5,
    cost: 150,
  },
  iron_rod: {
    id: 'iron_rod',
    name: 'Żelazna Wędka',
    description: 'Wytrzymała wędka metalowa.',
    icon: 'mdi-fishing',
    tier: 2,
    power: 15,
    speed: 1.0,
    luck: 5,
    durability: 200,
    requiredLevel: 10,
    cost: 400,
  },
  steel_rod: {
    id: 'steel_rod',
    name: 'Stalowa Wędka',
    description: 'Profesjonalny sprzęt wędkarski.',
    icon: 'mdi-fishing',
    tier: 2,
    power: 25,
    speed: 1.2,
    luck: 8,
    durability: 250,
    requiredLevel: 15,
    cost: 800,
  },
  carbon_rod: {
    id: 'carbon_rod',
    name: 'Węglowa Wędka',
    description: 'Zaawansowana technologia.',
    icon: 'mdi-fishing',
    tier: 3,
    power: 40,
    speed: 1.3,
    luck: 12,
    durability: 300,
    requiredLevel: 22,
    cost: 1500,
  },
  mithril_rod: {
    id: 'mithril_rod',
    name: 'Mithrilowa Wędka',
    description: 'Magiczna wędka z mithrilu.',
    icon: 'mdi-fishing',
    tier: 4,
    power: 60,
    speed: 1.4,
    luck: 18,
    durability: 400,
    requiredLevel: 30,
    cost: 3000,
  },
  legendary_rod: {
    id: 'legendary_rod',
    name: 'Legendarny Kij Rybaka',
    description: 'Artefakt starożytnych rybaków.',
    icon: 'mdi-fishing',
    tier: 5,
    power: 100,
    speed: 1.5,
    luck: 30,
    durability: 1000,
    requiredLevel: 40,
    cost: 10000,
  },
};

// ============================================
// BAITS
// ============================================

export const BAITS: Record<string, Bait> = {
  worm: {
    id: 'worm',
    name: 'Robak',
    description: 'Podstawowa przynęta.',
    icon: 'mdi-snake',
    tier: 1,
    catchSpeedBonus: 10,
    rarityBonus: 0,
    cost: 5,
    uses: 10,
  },
  cricket: {
    id: 'cricket',
    name: 'Świerszcz',
    description: 'Dobra przynęta na ryby rzeczne.',
    icon: 'mdi-bug',
    tier: 1,
    catchSpeedBonus: 15,
    rarityBonus: 5,
    specificFish: ['perch', 'trout'],
    cost: 10,
    uses: 10,
  },
  shrimp: {
    id: 'shrimp',
    name: 'Krewetka',
    description: 'Przynęta na ryby morskie.',
    icon: 'mdi-fish',
    tier: 2,
    catchSpeedBonus: 20,
    rarityBonus: 10,
    specificFish: ['salmon', 'tuna', 'lobster'],
    cost: 25,
    uses: 10,
  },
  glowing_bait: {
    id: 'glowing_bait',
    name: 'Świecąca Przynęta',
    description: 'Przyciąga ryby z podziemi.',
    icon: 'mdi-lightbulb',
    tier: 3,
    catchSpeedBonus: 25,
    rarityBonus: 15,
    specificFish: ['blind_fish', 'cave_eel', 'crystal_fish'],
    cost: 50,
    uses: 5,
  },
  magical_lure: {
    id: 'magical_lure',
    name: 'Magiczna Przynęta',
    description: 'Przyciąga magiczne stworzenia.',
    icon: 'mdi-star',
    tier: 4,
    catchSpeedBonus: 30,
    rarityBonus: 25,
    specificFish: ['starfish_magical', 'golden_koi', 'void_leviathan'],
    cost: 200,
    uses: 3,
  },
};

// ============================================
// FISHING SPOTS
// ============================================

export const FISHING_SPOTS: Record<string, FishingSpot> = {
  village_river: {
    id: 'village_river',
    name: 'Wiejska Rzeka',
    description: 'Spokojna rzeka przy wiosce.',
    icon: 'mdi-waves',
    waterType: 'river',
    requiredLevel: 1,
    availableFish: ['minnow', 'perch', 'carp', 'catfish'],
    baseCatchTime: 300,
    rarityModifier: 1.0,
  },
  forest_lake: {
    id: 'forest_lake',
    name: 'Leśne Jezioro',
    description: 'Ciche jezioro w głębi lasu.',
    icon: 'mdi-waves',
    waterType: 'lake',
    requiredLevel: 5,
    availableFish: ['trout', 'pike', 'sturgeon'],
    baseCatchTime: 400,
    rarityModifier: 1.1,
  },
  coastal_waters: {
    id: 'coastal_waters',
    name: 'Wody Przybrzeżne',
    description: 'Płytkie wody morskie.',
    icon: 'mdi-waves',
    waterType: 'sea',
    requiredLevel: 10,
    availableFish: ['salmon', 'pearl_oyster'],
    baseCatchTime: 450,
    rarityModifier: 1.2,
  },
  deep_sea: {
    id: 'deep_sea',
    name: 'Głębiny Oceanu',
    description: 'Niebezpieczne głębiny morskie.',
    icon: 'mdi-waves',
    waterType: 'sea',
    requiredLevel: 18,
    availableFish: ['tuna', 'swordfish', 'lobster', 'giant_squid'],
    baseCatchTime: 600,
    rarityModifier: 1.4,
  },
  underground_lake: {
    id: 'underground_lake',
    name: 'Podziemne Jezioro',
    description: 'Tajemnicze wody w jaskiniach.',
    icon: 'mdi-waves',
    waterType: 'underground',
    requiredLevel: 15,
    availableFish: ['blind_fish', 'cave_eel', 'crystal_fish'],
    baseCatchTime: 500,
    rarityModifier: 1.3,
  },
  enchanted_pond: {
    id: 'enchanted_pond',
    name: 'Zaczarowany Staw',
    description: 'Magiczne wody pełne tajemnic.',
    icon: 'mdi-star-circle',
    waterType: 'magical',
    requiredLevel: 28,
    availableFish: ['starfish_magical', 'golden_koi', 'void_leviathan'],
    baseCatchTime: 800,
    rarityModifier: 1.5,
  },
};

// ============================================
// RARITY SYSTEM
// ============================================

export const RARITY_DATA: Record<FishRarity, { label: string; color: string; chance: number }> = {
  common: { label: 'Pospolita', color: '#9E9E9E', chance: 50 },
  uncommon: { label: 'Niepospolita', color: '#4CAF50', chance: 30 },
  rare: { label: 'Rzadka', color: '#2196F3', chance: 15 },
  epic: { label: 'Epicka', color: '#9C27B0', chance: 4 },
  legendary: { label: 'Legendarna', color: '#FF9800', chance: 1 },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getFish(id: string): Fish | undefined {
  return FISH[id];
}

export function getRod(id: string): FishingRod | undefined {
  return FISHING_RODS[id];
}

export function getBait(id: string): Bait | undefined {
  return BAITS[id];
}

export function getSpot(id: string): FishingSpot | undefined {
  return FISHING_SPOTS[id];
}

export function getAvailableSpots(level: number): FishingSpot[] {
  return Object.values(FISHING_SPOTS).filter(s => s.requiredLevel <= level);
}

export function getAvailableFish(spot: FishingSpot, rodPower: number, level: number): Fish[] {
  return spot.availableFish
    .map(id => FISH[id])
    .filter(f => f && f.requiredLevel <= level && f.minRodPower <= rodPower);
}

export function calculateFishermanXpToLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.15, level - 1));
}

export function selectRandomFish(
  availableFish: Fish[],
  luck: number,
  bait: Bait | null
): Fish | null {
  if (availableFish.length === 0) return null;

  // Weight by rarity (inverted - common more likely)
  const weights: { fish: Fish; weight: number }[] = availableFish.map(fish => {
    let weight = RARITY_DATA[fish.rarity].chance;
    
    // Luck increases rare fish chance
    if (fish.rarity !== 'common') {
      weight += luck * 0.5;
    }
    
    // Bait bonuses
    if (bait) {
      weight += bait.rarityBonus;
      if (bait.specificFish?.includes(fish.id)) {
        weight *= 2;
      }
    }
    
    return { fish, weight };
  });

  const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
  let roll = Math.random() * totalWeight;
  
  for (const { fish, weight } of weights) {
    roll -= weight;
    if (roll <= 0) return fish;
  }
  
  return weights[0]?.fish || null;
}

export function getWaterTypeIcon(type: WaterType): string {
  const icons: Record<WaterType, string> = {
    river: 'mdi-waves',
    lake: 'mdi-waves',
    sea: 'mdi-waves',
    underground: 'mdi-cave',
    magical: 'mdi-star-circle',
  };
  return icons[type];
}

export function getWaterTypeName(type: WaterType): string {
  const names: Record<WaterType, string> = {
    river: 'Rzeka',
    lake: 'Jezioro',
    sea: 'Morze',
    underground: 'Podziemia',
    magical: 'Magiczne',
  };
  return names[type];
}
