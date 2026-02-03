/**
 * Achievements System definitions for Ateria Idle
 * Data-Driven Design - all achievements in one place
 */

import type { AchievementCategory, AchievementReward } from '@libs/entities/ateria-idle/game';

// ============================================
// ACHIEVEMENT DEFINITION TYPE
// ============================================

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  hidden: boolean;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  reward?: AchievementReward;
  // Condition type for checking
  condition: AchievementCondition;
  // For progress tracking
  progressType?: 'count' | 'level' | 'gold' | 'custom';
  progressTarget?: number;
}

export type AchievementCondition =
  | { type: 'warrior_level'; level: number }
  | { type: 'slayer_level'; level: number }
  | { type: 'merchant_level'; level: number }
  | { type: 'scientist_level'; level: number }
  | { type: 'total_kills'; count: number }
  | { type: 'category_kills'; category: string; count: number }
  | { type: 'gold_earned'; amount: number }
  | { type: 'gold_total'; amount: number }
  | { type: 'items_crafted'; count: number }
  | { type: 'potions_crafted'; count: number }
  | { type: 'research_completed'; count: number }
  | { type: 'dungeons_completed'; count: number }
  | { type: 'specific_dungeon'; dungeonId: string }
  | { type: 'slayer_tasks'; count: number }
  | { type: 'biomes_unlocked'; count: number }
  | { type: 'specific_biome'; biomeId: string }
  | { type: 'monsters_discovered'; count: number }
  | { type: 'specific_monster'; monsterId: string }
  | { type: 'equipment_rarity'; rarity: string }
  | { type: 'caravans_sent'; count: number }
  | { type: 'customers_served'; count: number }
  | { type: 'deaths'; count: number }
  | { type: 'play_time'; hours: number }
  | { type: 'lp_earned'; amount: number }
  | { type: 'all_paths_unlocked' }
  | { type: 'custom'; checkId: string };

// ============================================
// CATEGORY INFO
// ============================================

export interface AchievementCategoryInfo {
  id: AchievementCategory;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export const ACHIEVEMENT_CATEGORIES: Record<AchievementCategory, AchievementCategoryInfo> = {
  progression: {
    id: 'progression',
    name: 'Postęp',
    icon: 'mdi-trending-up',
    color: '#4CAF50',
    description: 'Osiągnięcia związane z rozwojem postaci',
  },
  economy: {
    id: 'economy',
    name: 'Ekonomia',
    icon: 'mdi-cash-multiple',
    color: '#FFC107',
    description: 'Osiągnięcia związane ze złotem i handlem',
  },
  discovery: {
    id: 'discovery',
    name: 'Odkrycia',
    icon: 'mdi-compass',
    color: '#2196F3',
    description: 'Odkrywanie nowych lokacji i potworów',
  },
  challenge: {
    id: 'challenge',
    name: 'Wyzwania',
    icon: 'mdi-trophy',
    color: '#FF5722',
    description: 'Trudne wyzwania bojowe',
  },
  secret: {
    id: 'secret',
    name: 'Sekrety',
    icon: 'mdi-lock-question',
    color: '#9C27B0',
    description: 'Ukryte osiągnięcia',
  },
};

// ============================================
// RARITY INFO
// ============================================

export interface RarityInfo {
  name: string;
  color: string;
  points: number;
}

export const RARITY_INFO: Record<string, RarityInfo> = {
  common: { name: 'Zwykłe', color: '#9E9E9E', points: 5 },
  uncommon: { name: 'Niezwykłe', color: '#4CAF50', points: 10 },
  rare: { name: 'Rzadkie', color: '#2196F3', points: 25 },
  epic: { name: 'Epickie', color: '#9C27B0', points: 50 },
  legendary: { name: 'Legendarne', color: '#FF9800', points: 100 },
};

// ============================================
// ACHIEVEMENTS DATA
// ============================================

export const ACHIEVEMENTS: AchievementDefinition[] = [
  // ============================================
  // PROGRESSION - Warrior
  // ============================================
  {
    id: 'warrior_novice',
    name: 'Nowicjusz',
    description: 'Osiągnij poziom 5 Wojownika',
    category: 'progression',
    icon: 'mdi-sword',
    hidden: false,
    rarity: 'common',
    condition: { type: 'warrior_level', level: 5 },
    progressType: 'level',
    progressTarget: 5,
  },
  {
    id: 'warrior_apprentice',
    name: 'Uczeń Wojownika',
    description: 'Osiągnij poziom 15 Wojownika',
    category: 'progression',
    icon: 'mdi-sword',
    hidden: false,
    rarity: 'uncommon',
    condition: { type: 'warrior_level', level: 15 },
    progressType: 'level',
    progressTarget: 15,
  },
  {
    id: 'warrior_veteran',
    name: 'Weteran',
    description: 'Osiągnij poziom 30 Wojownika',
    category: 'progression',
    icon: 'mdi-sword-cross',
    hidden: false,
    rarity: 'rare',
    condition: { type: 'warrior_level', level: 30 },
    progressType: 'level',
    progressTarget: 30,
    reward: { type: 'permanent_buff', value: 5 }, // +5% damage
  },
  {
    id: 'warrior_master',
    name: 'Mistrz Miecza',
    description: 'Osiągnij poziom 50 Wojownika',
    category: 'progression',
    icon: 'mdi-sword-cross',
    hidden: false,
    rarity: 'epic',
    condition: { type: 'warrior_level', level: 50 },
    progressType: 'level',
    progressTarget: 50,
    reward: { type: 'title', value: 'Mistrz Miecza' },
  },
  {
    id: 'warrior_legend',
    name: 'Legendarny Wojownik',
    description: 'Osiągnij poziom 75 Wojownika',
    category: 'progression',
    icon: 'mdi-crown',
    hidden: false,
    rarity: 'legendary',
    condition: { type: 'warrior_level', level: 75 },
    progressType: 'level',
    progressTarget: 75,
    reward: { type: 'title', value: 'Legenda' },
  },

  // ============================================
  // PROGRESSION - Slayer
  // ============================================
  {
    id: 'slayer_initiate',
    name: 'Inicjat Łowców',
    description: 'Osiągnij poziom 5 Łowcy',
    category: 'progression',
    icon: 'mdi-target-account',
    hidden: false,
    rarity: 'common',
    condition: { type: 'slayer_level', level: 5 },
    progressType: 'level',
    progressTarget: 5,
  },
  {
    id: 'slayer_hunter',
    name: 'Łowca',
    description: 'Osiągnij poziom 15 Łowcy',
    category: 'progression',
    icon: 'mdi-target-account',
    hidden: false,
    rarity: 'uncommon',
    condition: { type: 'slayer_level', level: 15 },
    progressType: 'level',
    progressTarget: 15,
  },
  {
    id: 'slayer_expert',
    name: 'Ekspert Łowców',
    description: 'Osiągnij poziom 30 Łowcy',
    category: 'progression',
    icon: 'mdi-target-account',
    hidden: false,
    rarity: 'rare',
    condition: { type: 'slayer_level', level: 30 },
    progressType: 'level',
    progressTarget: 30,
    reward: { type: 'lp_bonus', value: 10 },
  },
  {
    id: 'slayer_master',
    name: 'Mistrz Łowców',
    description: 'Osiągnij poziom 50 Łowcy',
    category: 'progression',
    icon: 'mdi-skull-crossbones',
    hidden: false,
    rarity: 'epic',
    condition: { type: 'slayer_level', level: 50 },
    progressType: 'level',
    progressTarget: 50,
    reward: { type: 'title', value: 'Mistrz Łowców' },
  },

  // ============================================
  // PROGRESSION - Merchant
  // ============================================
  {
    id: 'merchant_beginner',
    name: 'Początkujący Kupiec',
    description: 'Osiągnij poziom 5 Kupca',
    category: 'progression',
    icon: 'mdi-store',
    hidden: false,
    rarity: 'common',
    condition: { type: 'merchant_level', level: 5 },
    progressType: 'level',
    progressTarget: 5,
  },
  {
    id: 'merchant_trader',
    name: 'Handlarz',
    description: 'Osiągnij poziom 15 Kupca',
    category: 'progression',
    icon: 'mdi-store',
    hidden: false,
    rarity: 'uncommon',
    condition: { type: 'merchant_level', level: 15 },
    progressType: 'level',
    progressTarget: 15,
  },
  {
    id: 'merchant_mogul',
    name: 'Magnat Handlowy',
    description: 'Osiągnij poziom 30 Kupca',
    category: 'progression',
    icon: 'mdi-domain',
    hidden: false,
    rarity: 'rare',
    condition: { type: 'merchant_level', level: 30 },
    progressType: 'level',
    progressTarget: 30,
    reward: { type: 'permanent_buff', value: 10 }, // +10% gold
  },

  // ============================================
  // PROGRESSION - Scientist
  // ============================================
  {
    id: 'scientist_student',
    name: 'Student Nauk',
    description: 'Osiągnij poziom 5 Naukowca',
    category: 'progression',
    icon: 'mdi-flask',
    hidden: false,
    rarity: 'common',
    condition: { type: 'scientist_level', level: 5 },
    progressType: 'level',
    progressTarget: 5,
  },
  {
    id: 'scientist_researcher',
    name: 'Badacz',
    description: 'Osiągnij poziom 15 Naukowca',
    category: 'progression',
    icon: 'mdi-flask',
    hidden: false,
    rarity: 'uncommon',
    condition: { type: 'scientist_level', level: 15 },
    progressType: 'level',
    progressTarget: 15,
  },
  {
    id: 'scientist_professor',
    name: 'Profesor',
    description: 'Osiągnij poziom 30 Naukowca',
    category: 'progression',
    icon: 'mdi-school',
    hidden: false,
    rarity: 'rare',
    condition: { type: 'scientist_level', level: 30 },
    progressType: 'level',
    progressTarget: 30,
    reward: { type: 'title', value: 'Profesor' },
  },

  // ============================================
  // CHALLENGE - Kills
  // ============================================
  {
    id: 'first_blood',
    name: 'Pierwsza Krew',
    description: 'Zabij pierwszego potwora',
    category: 'challenge',
    icon: 'mdi-sword',
    hidden: false,
    rarity: 'common',
    condition: { type: 'total_kills', count: 1 },
    progressType: 'count',
    progressTarget: 1,
  },
  {
    id: 'monster_slayer_100',
    name: 'Pogromca Potworów',
    description: 'Zabij 100 potworów',
    category: 'challenge',
    icon: 'mdi-skull',
    hidden: false,
    rarity: 'common',
    condition: { type: 'total_kills', count: 100 },
    progressType: 'count',
    progressTarget: 100,
  },
  {
    id: 'monster_slayer_1000',
    name: 'Rzeźnik',
    description: 'Zabij 1000 potworów',
    category: 'challenge',
    icon: 'mdi-skull',
    hidden: false,
    rarity: 'uncommon',
    condition: { type: 'total_kills', count: 1000 },
    progressType: 'count',
    progressTarget: 1000,
  },
  {
    id: 'monster_slayer_10000',
    name: 'Masakra',
    description: 'Zabij 10,000 potworów',
    category: 'challenge',
    icon: 'mdi-skull-outline',
    hidden: false,
    rarity: 'rare',
    condition: { type: 'total_kills', count: 10000 },
    progressType: 'count',
    progressTarget: 10000,
    reward: { type: 'permanent_buff', value: 3 },
  },
  {
    id: 'monster_slayer_100000',
    name: 'Genocyda',
    description: 'Zabij 100,000 potworów',
    category: 'challenge',
    icon: 'mdi-skull-crossbones-outline',
    hidden: false,
    rarity: 'epic',
    condition: { type: 'total_kills', count: 100000 },
    progressType: 'count',
    progressTarget: 100000,
    reward: { type: 'title', value: 'Genocyda' },
  },

  // ============================================
  // CHALLENGE - Category Kills
  // ============================================
  {
    id: 'beast_hunter',
    name: 'Łowca Bestii',
    description: 'Zabij 500 Bestii',
    category: 'challenge',
    icon: 'mdi-paw',
    hidden: false,
    rarity: 'uncommon',
    condition: { type: 'category_kills', category: 'beast', count: 500 },
    progressType: 'count',
    progressTarget: 500,
  },
  {
    id: 'undead_slayer',
    name: 'Pogromca Nieumarłych',
    description: 'Zabij 500 Nieumarłych',
    category: 'challenge',
    icon: 'mdi-skull',
    hidden: false,
    rarity: 'uncommon',
    condition: { type: 'category_kills', category: 'undead', count: 500 },
    progressType: 'count',
    progressTarget: 500,
  },
  {
    id: 'demon_hunter',
    name: 'Łowca Demonów',
    description: 'Zabij 500 Demonów',
    category: 'challenge',
    icon: 'mdi-fire',
    hidden: false,
    rarity: 'rare',
    condition: { type: 'category_kills', category: 'demon', count: 500 },
    progressType: 'count',
    progressTarget: 500,
  },
  {
    id: 'dragon_slayer',
    name: 'Zabójca Smoków',
    description: 'Zabij 100 Smoków',
    category: 'challenge',
    icon: 'mdi-dragon',
    hidden: false,
    rarity: 'epic',
    condition: { type: 'category_kills', category: 'dragon', count: 100 },
    progressType: 'count',
    progressTarget: 100,
    reward: { type: 'title', value: 'Zabójca Smoków' },
  },

  // ============================================
  // CHALLENGE - Dungeons
  // ============================================
  {
    id: 'dungeon_explorer',
    name: 'Odkrywca Lochów',
    description: 'Ukończ swój pierwszy loch',
    category: 'challenge',
    icon: 'mdi-castle',
    hidden: false,
    rarity: 'common',
    condition: { type: 'dungeons_completed', count: 1 },
    progressType: 'count',
    progressTarget: 1,
  },
  {
    id: 'dungeon_delver',
    name: 'Łazik Lochowy',
    description: 'Ukończ 10 lochów',
    category: 'challenge',
    icon: 'mdi-castle',
    hidden: false,
    rarity: 'uncommon',
    condition: { type: 'dungeons_completed', count: 10 },
    progressType: 'count',
    progressTarget: 10,
  },
  {
    id: 'dungeon_master',
    name: 'Mistrz Lochów',
    description: 'Ukończ 50 lochów',
    category: 'challenge',
    icon: 'mdi-castle',
    hidden: false,
    rarity: 'rare',
    condition: { type: 'dungeons_completed', count: 50 },
    progressType: 'count',
    progressTarget: 50,
    reward: { type: 'lp_bonus', value: 15 },
  },
  {
    id: 'goblin_conqueror',
    name: 'Zdobywca Jaskiń Goblinów',
    description: 'Ukończ Jaskinie Goblinów',
    category: 'challenge',
    icon: 'mdi-cave',
    hidden: false,
    rarity: 'common',
    condition: { type: 'specific_dungeon', dungeonId: 'goblin_caves' },
  },
  {
    id: 'void_conqueror',
    name: 'Zdobywca Pustki',
    description: 'Ukończ Sanktuarium Pustki',
    category: 'challenge',
    icon: 'mdi-atom-variant',
    hidden: false,
    rarity: 'legendary',
    condition: { type: 'specific_dungeon', dungeonId: 'void_sanctum' },
    reward: { type: 'title', value: 'Pogromca Pustki' },
  },

  // ============================================
  // CHALLENGE - Slayer Tasks
  // ============================================
  {
    id: 'task_beginner',
    name: 'Zleceniobiorca',
    description: 'Ukończ 10 zadań Łowcy',
    category: 'challenge',
    icon: 'mdi-clipboard-check',
    hidden: false,
    rarity: 'common',
    condition: { type: 'slayer_tasks', count: 10 },
    progressType: 'count',
    progressTarget: 10,
  },
  {
    id: 'task_expert',
    name: 'Ekspert Zleceń',
    description: 'Ukończ 50 zadań Łowcy',
    category: 'challenge',
    icon: 'mdi-clipboard-check-multiple',
    hidden: false,
    rarity: 'uncommon',
    condition: { type: 'slayer_tasks', count: 50 },
    progressType: 'count',
    progressTarget: 50,
  },
  {
    id: 'task_master',
    name: 'Mistrz Kontraktów',
    description: 'Ukończ 200 zadań Łowcy',
    category: 'challenge',
    icon: 'mdi-clipboard-check-multiple-outline',
    hidden: false,
    rarity: 'rare',
    condition: { type: 'slayer_tasks', count: 200 },
    progressType: 'count',
    progressTarget: 200,
    reward: { type: 'permanent_buff', value: 5 },
  },

  // ============================================
  // ECONOMY - Gold
  // ============================================
  {
    id: 'first_gold',
    name: 'Pierwszy Grosz',
    description: 'Zarobień 100 złota',
    category: 'economy',
    icon: 'mdi-cash',
    hidden: false,
    rarity: 'common',
    condition: { type: 'gold_earned', amount: 100 },
    progressType: 'gold',
    progressTarget: 100,
  },
  {
    id: 'gold_collector',
    name: 'Kolekcjoner Złota',
    description: 'Zarobień 10,000 złota',
    category: 'economy',
    icon: 'mdi-cash-multiple',
    hidden: false,
    rarity: 'uncommon',
    condition: { type: 'gold_earned', amount: 10000 },
    progressType: 'gold',
    progressTarget: 10000,
  },
  {
    id: 'gold_hoarder',
    name: 'Skąpiec',
    description: 'Zarobień 100,000 złota',
    category: 'economy',
    icon: 'mdi-treasure-chest',
    hidden: false,
    rarity: 'rare',
    condition: { type: 'gold_earned', amount: 100000 },
    progressType: 'gold',
    progressTarget: 100000,
  },
  {
    id: 'gold_millionaire',
    name: 'Milioner',
    description: 'Zarobień 1,000,000 złota',
    category: 'economy',
    icon: 'mdi-diamond-stone',
    hidden: false,
    rarity: 'epic',
    condition: { type: 'gold_earned', amount: 1000000 },
    progressType: 'gold',
    progressTarget: 1000000,
    reward: { type: 'title', value: 'Milioner' },
  },

  // ============================================
  // ECONOMY - Merchant
  // ============================================
  {
    id: 'first_customer',
    name: 'Pierwszy Klient',
    description: 'Obsłuż 10 klientów',
    category: 'economy',
    icon: 'mdi-account-cash',
    hidden: false,
    rarity: 'common',
    condition: { type: 'customers_served', count: 10 },
    progressType: 'count',
    progressTarget: 10,
  },
  {
    id: 'popular_shop',
    name: 'Popularny Sklep',
    description: 'Obsłuż 100 klientów',
    category: 'economy',
    icon: 'mdi-account-group',
    hidden: false,
    rarity: 'uncommon',
    condition: { type: 'customers_served', count: 100 },
    progressType: 'count',
    progressTarget: 100,
  },
  {
    id: 'merchant_empire',
    name: 'Imperium Handlowe',
    description: 'Obsłuż 1000 klientów',
    category: 'economy',
    icon: 'mdi-store',
    hidden: false,
    rarity: 'rare',
    condition: { type: 'customers_served', count: 1000 },
    progressType: 'count',
    progressTarget: 1000,
  },
  {
    id: 'caravan_starter',
    name: 'Organizator Karawany',
    description: 'Wyślij 10 karawan',
    category: 'economy',
    icon: 'mdi-truck-delivery',
    hidden: false,
    rarity: 'common',
    condition: { type: 'caravans_sent', count: 10 },
    progressType: 'count',
    progressTarget: 10,
  },
  {
    id: 'trade_network',
    name: 'Sieć Handlowa',
    description: 'Wyślij 100 karawan',
    category: 'economy',
    icon: 'mdi-map-marker-path',
    hidden: false,
    rarity: 'rare',
    condition: { type: 'caravans_sent', count: 100 },
    progressType: 'count',
    progressTarget: 100,
    reward: { type: 'permanent_buff', value: 5 },
  },

  // ============================================
  // ECONOMY - Scientist
  // ============================================
  {
    id: 'first_potion',
    name: 'Pierwsza Mikstura',
    description: 'Uwarzyj 10 mikstur',
    category: 'economy',
    icon: 'mdi-flask-round-bottom',
    hidden: false,
    rarity: 'common',
    condition: { type: 'potions_crafted', count: 10 },
    progressType: 'count',
    progressTarget: 10,
  },
  {
    id: 'alchemist',
    name: 'Alchemik',
    description: 'Uwarzyj 100 mikstur',
    category: 'economy',
    icon: 'mdi-flask',
    hidden: false,
    rarity: 'uncommon',
    condition: { type: 'potions_crafted', count: 100 },
    progressType: 'count',
    progressTarget: 100,
  },
  {
    id: 'master_alchemist',
    name: 'Mistrz Alchemii',
    description: 'Uwarzyj 500 mikstur',
    category: 'economy',
    icon: 'mdi-flask-empty-plus',
    hidden: false,
    rarity: 'rare',
    condition: { type: 'potions_crafted', count: 500 },
    progressType: 'count',
    progressTarget: 500,
    reward: { type: 'title', value: 'Mistrz Alchemii' },
  },
  {
    id: 'first_research',
    name: 'Pierwszy Przełom',
    description: 'Ukończ 5 badań',
    category: 'economy',
    icon: 'mdi-book-open-page-variant',
    hidden: false,
    rarity: 'common',
    condition: { type: 'research_completed', count: 5 },
    progressType: 'count',
    progressTarget: 5,
  },
  {
    id: 'scientist_prodigy',
    name: 'Geniusz Nauki',
    description: 'Ukończ 25 badań',
    category: 'economy',
    icon: 'mdi-atom',
    hidden: false,
    rarity: 'rare',
    condition: { type: 'research_completed', count: 25 },
    progressType: 'count',
    progressTarget: 25,
    reward: { type: 'lp_bonus', value: 10 },
  },

  // ============================================
  // DISCOVERY - Biomes
  // ============================================
  {
    id: 'explorer',
    name: 'Odkrywca',
    description: 'Odblokuj 3 biomy',
    category: 'discovery',
    icon: 'mdi-compass',
    hidden: false,
    rarity: 'common',
    condition: { type: 'biomes_unlocked', count: 3 },
    progressType: 'count',
    progressTarget: 3,
  },
  {
    id: 'adventurer',
    name: 'Poszukiwacz Przygód',
    description: 'Odblokuj 6 biomów',
    category: 'discovery',
    icon: 'mdi-map',
    hidden: false,
    rarity: 'uncommon',
    condition: { type: 'biomes_unlocked', count: 6 },
    progressType: 'count',
    progressTarget: 6,
  },
  {
    id: 'world_traveler',
    name: 'Podróżnik Światów',
    description: 'Odblokuj wszystkie biomy (10)',
    category: 'discovery',
    icon: 'mdi-earth',
    hidden: false,
    rarity: 'epic',
    condition: { type: 'biomes_unlocked', count: 10 },
    progressType: 'count',
    progressTarget: 10,
    reward: { type: 'title', value: 'Podróżnik Światów' },
  },

  // ============================================
  // DISCOVERY - Monsters
  // ============================================
  {
    id: 'bestiary_beginner',
    name: 'Początkujący Bestiariusz',
    description: 'Odkryj 10 różnych potworów',
    category: 'discovery',
    icon: 'mdi-book-open-variant',
    hidden: false,
    rarity: 'common',
    condition: { type: 'monsters_discovered', count: 10 },
    progressType: 'count',
    progressTarget: 10,
  },
  {
    id: 'bestiary_collector',
    name: 'Kolekcjoner Bestiariusza',
    description: 'Odkryj 30 różnych potworów',
    category: 'discovery',
    icon: 'mdi-book-multiple',
    hidden: false,
    rarity: 'uncommon',
    condition: { type: 'monsters_discovered', count: 30 },
    progressType: 'count',
    progressTarget: 30,
  },
  {
    id: 'bestiary_master',
    name: 'Mistrz Bestiariusza',
    description: 'Odkryj 60 różnych potworów',
    category: 'discovery',
    icon: 'mdi-book-account',
    hidden: false,
    rarity: 'rare',
    condition: { type: 'monsters_discovered', count: 60 },
    progressType: 'count',
    progressTarget: 60,
    reward: { type: 'lp_bonus', value: 10 },
  },

  // ============================================
  // SECRET - Hidden Achievements
  // ============================================
  {
    id: 'persistent',
    name: 'Wytrwały',
    description: 'Zgiń 100 razy',
    category: 'secret',
    icon: 'mdi-coffin',
    hidden: true,
    rarity: 'uncommon',
    condition: { type: 'deaths', count: 100 },
    progressType: 'count',
    progressTarget: 100,
  },
  {
    id: 'dedicated_player',
    name: 'Oddany Gracz',
    description: 'Graj przez 24 godziny łącznie',
    category: 'secret',
    icon: 'mdi-clock',
    hidden: true,
    rarity: 'rare',
    condition: { type: 'play_time', hours: 24 },
  },
  {
    id: 'no_life',
    name: 'Bez Życia',
    description: 'Graj przez 100 godzin łącznie',
    category: 'secret',
    icon: 'mdi-ghost',
    hidden: true,
    rarity: 'epic',
    condition: { type: 'play_time', hours: 100 },
    reward: { type: 'title', value: 'Bez Życia' },
  },
  {
    id: 'jack_of_all_trades',
    name: 'Człowiek Renesansu',
    description: 'Odblokuj wszystkie trzy ścieżki',
    category: 'secret',
    icon: 'mdi-account-star',
    hidden: true,
    rarity: 'rare',
    condition: { type: 'all_paths_unlocked' },
    reward: { type: 'title', value: 'Człowiek Renesansu' },
  },

  // ============================================
  // CHALLENGE - Special Boss Kills
  // ============================================
  {
    id: 'goblin_king_slayer',
    name: 'Zabójca Króla Goblinów',
    description: 'Pokonaj Króla Goblinów',
    category: 'challenge',
    icon: 'mdi-crown',
    hidden: false,
    rarity: 'uncommon',
    condition: { type: 'specific_monster', monsterId: 'goblin_king' },
  },
  {
    id: 'ancient_dragon_slayer',
    name: 'Zabójca Pradawnego Smoka',
    description: 'Pokonaj Pradawnego Lodowego Smoka',
    category: 'challenge',
    icon: 'mdi-dragon',
    hidden: false,
    rarity: 'legendary',
    condition: { type: 'specific_monster', monsterId: 'ancient_frost_dragon' },
    reward: { type: 'title', value: 'Pogromca Smoków' },
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getAchievement(id: string): AchievementDefinition | undefined {
  return ACHIEVEMENTS.find(a => a.id === id);
}

export function getAchievementsByCategory(category: AchievementCategory): AchievementDefinition[] {
  return ACHIEVEMENTS.filter(a => a.category === category);
}

export function getAchievementsByRarity(rarity: string): AchievementDefinition[] {
  return ACHIEVEMENTS.filter(a => a.rarity === rarity);
}

export function getVisibleAchievements(): AchievementDefinition[] {
  return ACHIEVEMENTS.filter(a => !a.hidden);
}

export function getCategoryInfo(category: AchievementCategory): AchievementCategoryInfo {
  return ACHIEVEMENT_CATEGORIES[category];
}

export function getRarityInfo(rarity: string): RarityInfo {
  return RARITY_INFO[rarity] || RARITY_INFO.common;
}

export function calculateTotalPoints(unlockedIds: string[]): number {
  return unlockedIds.reduce((total, id) => {
    const achievement = getAchievement(id);
    if (achievement) {
      return total + getRarityInfo(achievement.rarity).points;
    }
    return total;
  }, 0);
}
