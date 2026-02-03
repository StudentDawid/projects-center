/**
 * Tamer Path Data - Creature Taming, Companions, Beast Training
 */

export type CreatureType = 'beast' | 'elemental' | 'undead' | 'dragon' | 'mythical';
export type CreatureRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface Creature {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: CreatureType;
  rarity: CreatureRarity;
  tier: number;
  requiredLevel: number;
  tamingDifficulty: number;
  tamingTime: number;
  baseStats: { attack: number; defense: number; hp: number; speed: number };
  abilities: string[];
  foodPreference: string;
  xpToTame: number;
}

export interface TamingItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: number;
  tamingBonus: number;
  targetTypes: CreatureType[];
  cost: number;
}

export interface CreatureFood {
  id: string;
  name: string;
  icon: string;
  tier: number;
  happinessBonus: number;
  statBonus: number;
  cost: number;
}

export interface TamerProgress { level: number; xp: number; xpToNextLevel: number; totalXp: number; }

export const CREATURES: Record<string, Creature> = {
  wolf: { id: 'wolf', name: 'Wilk', description: 'Lojalny towarzysz polowań.', icon: 'mdi-paw', type: 'beast', rarity: 'common', tier: 1, requiredLevel: 1, tamingDifficulty: 20, tamingTime: 200, baseStats: { attack: 15, defense: 10, hp: 50, speed: 20 }, abilities: ['Ugryzienie', 'Wycie'], foodPreference: 'meat', xpToTame: 30 },
  bear: { id: 'bear', name: 'Niedźwiedź', description: 'Potężny obrońca.', icon: 'mdi-paw', type: 'beast', rarity: 'uncommon', tier: 2, requiredLevel: 8, tamingDifficulty: 40, tamingTime: 350, baseStats: { attack: 25, defense: 30, hp: 120, speed: 10 }, abilities: ['Uderzenie Łapą', 'Ryk'], foodPreference: 'honey', xpToTame: 60 },
  giant_spider: { id: 'giant_spider', name: 'Gigantyczny Pająk', description: 'Jadowity sojusznik.', icon: 'mdi-spider', type: 'beast', rarity: 'rare', tier: 3, requiredLevel: 15, tamingDifficulty: 55, tamingTime: 450, baseStats: { attack: 35, defense: 15, hp: 80, speed: 25 }, abilities: ['Trucizna', 'Sieć'], foodPreference: 'insects', xpToTame: 100 },
  
  fire_elemental: { id: 'fire_elemental', name: 'Ognisty Żywioł', description: 'Płonący duch.', icon: 'mdi-fire', type: 'elemental', rarity: 'rare', tier: 3, requiredLevel: 18, tamingDifficulty: 60, tamingTime: 500, baseStats: { attack: 50, defense: 10, hp: 60, speed: 20 }, abilities: ['Płomień', 'Eksplozja'], foodPreference: 'coal', xpToTame: 120 },
  water_spirit: { id: 'water_spirit', name: 'Duch Wody', description: 'Mistyczny lecznik.', icon: 'mdi-water', type: 'elemental', rarity: 'rare', tier: 3, requiredLevel: 20, tamingDifficulty: 55, tamingTime: 480, baseStats: { attack: 20, defense: 25, hp: 80, speed: 15 }, abilities: ['Leczenie', 'Fala'], foodPreference: 'crystals', xpToTame: 110 },
  
  skeleton_knight: { id: 'skeleton_knight', name: 'Szkieletowy Rycerz', description: 'Nieumarły wojownik.', icon: 'mdi-skull', type: 'undead', rarity: 'epic', tier: 4, requiredLevel: 25, tamingDifficulty: 70, tamingTime: 600, baseStats: { attack: 45, defense: 40, hp: 100, speed: 12 }, abilities: ['Miecz Śmierci', 'Nieśmiertelność'], foodPreference: 'bones', xpToTame: 180 },
  vampire_bat: { id: 'vampire_bat', name: 'Wampirzy Nietoperz', description: 'Nocny drapieżnik.', icon: 'mdi-bat', type: 'undead', rarity: 'rare', tier: 3, requiredLevel: 22, tamingDifficulty: 50, tamingTime: 400, baseStats: { attack: 30, defense: 15, hp: 60, speed: 35 }, abilities: ['Wyssanie Krwi', 'Echolokacja'], foodPreference: 'blood', xpToTame: 90 },
  
  wyvern: { id: 'wyvern', name: 'Wiwerna', description: 'Mniejszy kuzyn smoka.', icon: 'mdi-dragon', type: 'dragon', rarity: 'epic', tier: 4, requiredLevel: 30, tamingDifficulty: 80, tamingTime: 800, baseStats: { attack: 60, defense: 35, hp: 150, speed: 30 }, abilities: ['Lot', 'Atak z Powietrza', 'Jadowity Ogon'], foodPreference: 'meat', xpToTame: 250 },
  dragon: { id: 'dragon', name: 'Smok', description: 'Król wszystkich stworzeń.', icon: 'mdi-dragon', type: 'dragon', rarity: 'legendary', tier: 5, requiredLevel: 40, tamingDifficulty: 95, tamingTime: 1500, baseStats: { attack: 100, defense: 80, hp: 300, speed: 25 }, abilities: ['Oddech Ognia', 'Lot', 'Strach', 'Zbroja Łuski'], foodPreference: 'gold', xpToTame: 500 },
  
  phoenix: { id: 'phoenix', name: 'Feniks', description: 'Nieśmiertelny ptak ognia.', icon: 'mdi-bird', type: 'mythical', rarity: 'legendary', tier: 5, requiredLevel: 38, tamingDifficulty: 90, tamingTime: 1200, baseStats: { attack: 70, defense: 40, hp: 200, speed: 40 }, abilities: ['Odrodzenie', 'Płomienie', 'Leczenie'], foodPreference: 'ash', xpToTame: 400 },
  unicorn: { id: 'unicorn', name: 'Jednorożec', description: 'Mistyczne stworzenie.', icon: 'mdi-unicorn', type: 'mythical', rarity: 'epic', tier: 4, requiredLevel: 28, tamingDifficulty: 75, tamingTime: 700, baseStats: { attack: 35, defense: 45, hp: 180, speed: 35 }, abilities: ['Oczyszczenie', 'Błogosławieństwo', 'Teleportacja'], foodPreference: 'flowers', xpToTame: 200 },
  griffin: { id: 'griffin', name: 'Gryf', description: 'Lew z orłem.', icon: 'mdi-bird', type: 'mythical', rarity: 'epic', tier: 4, requiredLevel: 32, tamingDifficulty: 78, tamingTime: 750, baseStats: { attack: 55, defense: 50, hp: 160, speed: 45 }, abilities: ['Lot', 'Pazury', 'Dziób'], foodPreference: 'meat', xpToTame: 220 },
};

export const TAMING_ITEMS: Record<string, TamingItem> = {
  basic_leash: { id: 'basic_leash', name: 'Podstawowa Smycz', description: 'Do prostych stworzeń.', icon: 'mdi-leash', tier: 1, tamingBonus: 5, targetTypes: ['beast'], cost: 50 },
  beast_whistle: { id: 'beast_whistle', name: 'Gwizdek na Bestie', description: 'Przyciąga bestie.', icon: 'mdi-whistle', tier: 2, tamingBonus: 15, targetTypes: ['beast'], cost: 200 },
  elemental_orb: { id: 'elemental_orb', name: 'Sfera Żywiołu', description: 'Pomaga okiełznać żywioły.', icon: 'mdi-circle', tier: 3, tamingBonus: 20, targetTypes: ['elemental'], cost: 500 },
  soul_chain: { id: 'soul_chain', name: 'Łańcuch Dusz', description: 'Wiąże nieumarłych.', icon: 'mdi-link', tier: 3, tamingBonus: 20, targetTypes: ['undead'], cost: 600 },
  dragon_scales: { id: 'dragon_scales', name: 'Smocze Łuski', description: 'Budzą szacunek smoków.', icon: 'mdi-scale', tier: 4, tamingBonus: 25, targetTypes: ['dragon'], cost: 2000 },
  mythical_charm: { id: 'mythical_charm', name: 'Mityczny Urok', description: 'Dla legendarnych stworzeń.', icon: 'mdi-star', tier: 5, tamingBonus: 30, targetTypes: ['mythical', 'dragon'], cost: 5000 },
};

export const CREATURE_FOOD: Record<string, CreatureFood> = {
  raw_meat: { id: 'raw_meat', name: 'Surowe Mięso', icon: 'mdi-food-steak', tier: 1, happinessBonus: 5, statBonus: 1, cost: 10 },
  honey: { id: 'honey', name: 'Miód', icon: 'mdi-beehive-outline', tier: 1, happinessBonus: 10, statBonus: 2, cost: 20 },
  magic_treats: { id: 'magic_treats', name: 'Magiczne Smakołyki', icon: 'mdi-cookie', tier: 2, happinessBonus: 20, statBonus: 5, cost: 50 },
  dragon_food: { id: 'dragon_food', name: 'Smocze Żarcie', icon: 'mdi-fire', tier: 4, happinessBonus: 40, statBonus: 10, cost: 200 },
};

export const TYPE_DATA: Record<CreatureType, { name: string; icon: string; color: string }> = {
  beast: { name: 'Bestia', icon: 'mdi-paw', color: '#8D6E63' },
  elemental: { name: 'Żywioł', icon: 'mdi-fire', color: '#FF9800' },
  undead: { name: 'Nieumarły', icon: 'mdi-skull', color: '#607D8B' },
  dragon: { name: 'Smok', icon: 'mdi-dragon', color: '#F44336' },
  mythical: { name: 'Mityczny', icon: 'mdi-star', color: '#9C27B0' },
};

export const RARITY_DATA: Record<CreatureRarity, { label: string; color: string }> = {
  common: { label: 'Pospolity', color: '#9E9E9E' },
  uncommon: { label: 'Niepospolity', color: '#4CAF50' },
  rare: { label: 'Rzadki', color: '#2196F3' },
  epic: { label: 'Epicki', color: '#9C27B0' },
  legendary: { label: 'Legendarny', color: '#FF9800' },
};

export function getCreature(id: string): Creature | undefined { return CREATURES[id]; }
export function getTamingItem(id: string): TamingItem | undefined { return TAMING_ITEMS[id]; }
export function getFood(id: string): CreatureFood | undefined { return CREATURE_FOOD[id]; }
export function getAvailableCreatures(level: number): Creature[] { return Object.values(CREATURES).filter(c => c.requiredLevel <= level); }
export function calculateTamerXpToLevel(level: number): number { return Math.floor(100 * Math.pow(1.15, level - 1)); }
