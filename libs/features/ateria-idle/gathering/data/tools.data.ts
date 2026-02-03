/**
 * Gathering Tools Data - Pickaxes, Axes, Fishing Rods, Sickles
 * Tools have gathering bonuses AND combat stats
 */

import type { ItemRarity, EquipmentStats } from '@libs/entities/ateria-idle/warrior';
import type { GatheringSkill } from './gathering.data';

// ============================================
// TYPES
// ============================================

export type ToolType = 'pickaxe' | 'axe' | 'fishing_rod' | 'sickle';

export interface GatheringTool {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: ToolType;
  tier: number; // 1-7
  rarity: ItemRarity;
  requiredLevel: number; // Gathering skill level

  // Gathering bonuses
  gatheringPower: number; // Power for gathering checks
  gatheringSpeed: number; // % bonus to gathering speed
  bonusYield: number; // % chance for extra resources
  rareFind: number; // % bonus to rare resource chance

  // Combat stats (tools can be used as weapons)
  combatStats: Partial<EquipmentStats>;

  // Crafting
  craftable: boolean;
  craftRecipeId?: string;
  buyPrice?: number;
}

export interface ToolSet {
  pickaxe: GatheringTool | null;
  axe: GatheringTool | null;
  fishingRod: GatheringTool | null;
  sickle: GatheringTool | null;
}

// ============================================
// TOOL TYPE METADATA
// ============================================

export const TOOL_TYPES: Record<ToolType, { name: string; icon: string; skill: GatheringSkill }> = {
  pickaxe: { name: 'Kilof', icon: 'mdi-pickaxe', skill: 'mining' },
  axe: { name: 'Siekiera', icon: 'mdi-axe', skill: 'woodcutting' },
  fishing_rod: { name: 'Wędka', icon: 'mdi-hook', skill: 'fishing' },
  sickle: { name: 'Sierp', icon: 'mdi-sickle', skill: 'herbalism' },
};

// ============================================
// PICKAXES
// ============================================

export const PICKAXES: Record<string, GatheringTool> = {
  // Tier 1 - Basic
  wooden_pickaxe: {
    id: 'wooden_pickaxe',
    name: 'Drewniany Kilof',
    description: 'Prosty kilof z drewna. Ledwo nadaje się do pracy.',
    icon: 'mdi-pickaxe',
    type: 'pickaxe',
    tier: 1,
    rarity: 'common',
    requiredLevel: 1,
    gatheringPower: 10,
    gatheringSpeed: 0,
    bonusYield: 0,
    rareFind: 0,
    combatStats: { attack: 3, accuracy: -5 },
    craftable: true,
    craftRecipeId: 'craft_wooden_pickaxe',
  },
  stone_pickaxe: {
    id: 'stone_pickaxe',
    name: 'Kamienny Kilof',
    description: 'Solidny kilof z kamienia. Podstawowe narzędzie górnika.',
    icon: 'mdi-pickaxe',
    type: 'pickaxe',
    tier: 1,
    rarity: 'common',
    requiredLevel: 3,
    gatheringPower: 20,
    gatheringSpeed: 5,
    bonusYield: 2,
    rareFind: 0,
    combatStats: { attack: 5, accuracy: -3 },
    craftable: true,
    craftRecipeId: 'craft_stone_pickaxe',
  },
  copper_pickaxe: {
    id: 'copper_pickaxe',
    name: 'Miedziany Kilof',
    description: 'Pierwszy metalowy kilof. Znacznie lepszy od kamiennego.',
    icon: 'mdi-pickaxe',
    type: 'pickaxe',
    tier: 1,
    rarity: 'common',
    requiredLevel: 5,
    gatheringPower: 35,
    gatheringSpeed: 10,
    bonusYield: 5,
    rareFind: 1,
    combatStats: { attack: 8, accuracy: 0 },
    craftable: true,
    craftRecipeId: 'craft_copper_pickaxe',
  },

  // Tier 2 - Iron/Steel
  iron_pickaxe: {
    id: 'iron_pickaxe',
    name: 'Żelazny Kilof',
    description: 'Solidny kilof z żelaza. Standard wśród górników.',
    icon: 'mdi-pickaxe',
    type: 'pickaxe',
    tier: 2,
    rarity: 'uncommon',
    requiredLevel: 10,
    gatheringPower: 55,
    gatheringSpeed: 15,
    bonusYield: 8,
    rareFind: 2,
    combatStats: { attack: 12, accuracy: 2, critChance: 0.02 },
    craftable: true,
    craftRecipeId: 'craft_iron_pickaxe',
  },
  steel_pickaxe: {
    id: 'steel_pickaxe',
    name: 'Stalowy Kilof',
    description: 'Wytrzymały kilof ze stali. Świetnie radzi sobie z twardą skałą.',
    icon: 'mdi-pickaxe',
    type: 'pickaxe',
    tier: 2,
    rarity: 'uncommon',
    requiredLevel: 18,
    gatheringPower: 80,
    gatheringSpeed: 20,
    bonusYield: 12,
    rareFind: 3,
    combatStats: { attack: 18, accuracy: 5, critChance: 0.03 },
    craftable: true,
    craftRecipeId: 'craft_steel_pickaxe',
  },

  // Tier 3 - Precious metals
  silver_pickaxe: {
    id: 'silver_pickaxe',
    name: 'Srebrny Kilof',
    description: 'Elegancki kilof ze srebra. Bonus do znajdowania klejnotów.',
    icon: 'mdi-pickaxe',
    type: 'pickaxe',
    tier: 3,
    rarity: 'rare',
    requiredLevel: 25,
    gatheringPower: 100,
    gatheringSpeed: 25,
    bonusYield: 15,
    rareFind: 8,
    combatStats: { attack: 22, accuracy: 8, critChance: 0.05 },
    craftable: true,
    craftRecipeId: 'craft_silver_pickaxe',
  },
  gold_pickaxe: {
    id: 'gold_pickaxe',
    name: 'Złoty Kilof',
    description: 'Luksusowy kilof ze złota. Świetny do klejnotów, ale miękki.',
    icon: 'mdi-pickaxe',
    type: 'pickaxe',
    tier: 3,
    rarity: 'rare',
    requiredLevel: 30,
    gatheringPower: 90, // Lower power, but high rare find
    gatheringSpeed: 30,
    bonusYield: 20,
    rareFind: 15,
    combatStats: { attack: 18, accuracy: 10, critChance: 0.08 },
    craftable: true,
    craftRecipeId: 'craft_gold_pickaxe',
  },
  mithril_pickaxe: {
    id: 'mithril_pickaxe',
    name: 'Mithrilowy Kilof',
    description: 'Magiczny kilof z mithrilu. Lekki jak pióro, twardy jak skała.',
    icon: 'mdi-pickaxe',
    type: 'pickaxe',
    tier: 3,
    rarity: 'rare',
    requiredLevel: 35,
    gatheringPower: 130,
    gatheringSpeed: 30,
    bonusYield: 18,
    rareFind: 10,
    combatStats: { attack: 28, accuracy: 12, critChance: 0.06, evasion: 5 },
    craftable: true,
    craftRecipeId: 'craft_mithril_pickaxe',
  },

  // Tier 4 - Epic
  adamantite_pickaxe: {
    id: 'adamantite_pickaxe',
    name: 'Adamantytowy Kilof',
    description: 'Niezwykle twardy kilof z adamantytu. Kruszy najtwardszą skałę.',
    icon: 'mdi-pickaxe',
    type: 'pickaxe',
    tier: 4,
    rarity: 'epic',
    requiredLevel: 45,
    gatheringPower: 180,
    gatheringSpeed: 35,
    bonusYield: 22,
    rareFind: 12,
    combatStats: { attack: 38, accuracy: 10, critChance: 0.08, critMultiplier: 0.2 },
    craftable: true,
    craftRecipeId: 'craft_adamantite_pickaxe',
  },
  crystal_pickaxe: {
    id: 'crystal_pickaxe',
    name: 'Kryształowy Kilof',
    description: 'Kilof z czystego kryształu. Rezonuje z klejnotami.',
    icon: 'mdi-pickaxe',
    type: 'pickaxe',
    tier: 4,
    rarity: 'epic',
    requiredLevel: 52,
    gatheringPower: 160,
    gatheringSpeed: 40,
    bonusYield: 25,
    rareFind: 20,
    combatStats: { attack: 35, accuracy: 15, critChance: 0.1 },
    craftable: true,
    craftRecipeId: 'craft_crystal_pickaxe',
  },

  // Tier 5 - Legendary
  dragonite_pickaxe: {
    id: 'dragonite_pickaxe',
    name: 'Dragonitowy Kilof',
    description: 'Potężny kilof wykuty z dragonitu. Płonie wewnętrznym żarem.',
    icon: 'mdi-pickaxe',
    type: 'pickaxe',
    tier: 5,
    rarity: 'legendary',
    requiredLevel: 65,
    gatheringPower: 250,
    gatheringSpeed: 45,
    bonusYield: 30,
    rareFind: 18,
    combatStats: { attack: 55, accuracy: 12, critChance: 0.1, critMultiplier: 0.3 },
    craftable: true,
    craftRecipeId: 'craft_dragonite_pickaxe',
  },

  // Tier 6 - Mythic
  void_pickaxe: {
    id: 'void_pickaxe',
    name: 'Kilof Pustki',
    description: 'Kilof z innego wymiaru. Wydobywa zasoby z nicości.',
    icon: 'mdi-pickaxe',
    type: 'pickaxe',
    tier: 6,
    rarity: 'mythic',
    requiredLevel: 80,
    gatheringPower: 350,
    gatheringSpeed: 50,
    bonusYield: 40,
    rareFind: 25,
    combatStats: { attack: 75, accuracy: 18, critChance: 0.12, critMultiplier: 0.4, evasion: 8 },
    craftable: true,
    craftRecipeId: 'craft_void_pickaxe',
  },
};

// ============================================
// AXES
// ============================================

export const AXES: Record<string, GatheringTool> = {
  // Tier 1
  wooden_axe: {
    id: 'wooden_axe',
    name: 'Drewniana Siekiera',
    description: 'Prymitywna siekiera. Lepiej niż gołe ręce.',
    icon: 'mdi-axe',
    type: 'axe',
    tier: 1,
    rarity: 'common',
    requiredLevel: 1,
    gatheringPower: 10,
    gatheringSpeed: 0,
    bonusYield: 0,
    rareFind: 0,
    combatStats: { attack: 4, accuracy: -3 },
    craftable: true,
    craftRecipeId: 'craft_wooden_axe',
  },
  stone_axe: {
    id: 'stone_axe',
    name: 'Kamienna Siekiera',
    description: 'Solidna siekiera z kamienia. Podstawowe narzędzie drwala.',
    icon: 'mdi-axe',
    type: 'axe',
    tier: 1,
    rarity: 'common',
    requiredLevel: 3,
    gatheringPower: 20,
    gatheringSpeed: 5,
    bonusYield: 2,
    rareFind: 0,
    combatStats: { attack: 6, accuracy: 0 },
    craftable: true,
    craftRecipeId: 'craft_stone_axe',
  },
  copper_axe: {
    id: 'copper_axe',
    name: 'Miedziana Siekiera',
    description: 'Pierwsza metalowa siekiera. Ostra i skuteczna.',
    icon: 'mdi-axe',
    type: 'axe',
    tier: 1,
    rarity: 'common',
    requiredLevel: 5,
    gatheringPower: 35,
    gatheringSpeed: 10,
    bonusYield: 5,
    rareFind: 1,
    combatStats: { attack: 10, accuracy: 2 },
    craftable: true,
    craftRecipeId: 'craft_copper_axe',
  },

  // Tier 2
  iron_axe: {
    id: 'iron_axe',
    name: 'Żelazna Siekiera',
    description: 'Solidna siekiera z żelaza. Standard wśród drwali.',
    icon: 'mdi-axe',
    type: 'axe',
    tier: 2,
    rarity: 'uncommon',
    requiredLevel: 10,
    gatheringPower: 55,
    gatheringSpeed: 15,
    bonusYield: 8,
    rareFind: 2,
    combatStats: { attack: 15, accuracy: 3, critChance: 0.02 },
    craftable: true,
    craftRecipeId: 'craft_iron_axe',
  },
  steel_axe: {
    id: 'steel_axe',
    name: 'Stalowa Siekiera',
    description: 'Doskonała siekiera ze stali. Przecina każde drzewo.',
    icon: 'mdi-axe',
    type: 'axe',
    tier: 2,
    rarity: 'uncommon',
    requiredLevel: 18,
    gatheringPower: 80,
    gatheringSpeed: 20,
    bonusYield: 12,
    rareFind: 3,
    combatStats: { attack: 22, accuracy: 5, critChance: 0.04 },
    craftable: true,
    craftRecipeId: 'craft_steel_axe',
  },

  // Tier 3
  mithril_axe: {
    id: 'mithril_axe',
    name: 'Mithrilowa Siekiera',
    description: 'Magiczna siekiera z mithrilu. Nigdy się nie tępi.',
    icon: 'mdi-axe',
    type: 'axe',
    tier: 3,
    rarity: 'rare',
    requiredLevel: 30,
    gatheringPower: 120,
    gatheringSpeed: 28,
    bonusYield: 16,
    rareFind: 8,
    combatStats: { attack: 32, accuracy: 10, critChance: 0.06 },
    craftable: true,
    craftRecipeId: 'craft_mithril_axe',
  },

  // Tier 4
  adamantite_axe: {
    id: 'adamantite_axe',
    name: 'Adamantytowa Siekiera',
    description: 'Niezwykle ostra siekiera z adamantytu. Ścina drzewa jednym ciosem.',
    icon: 'mdi-axe',
    type: 'axe',
    tier: 4,
    rarity: 'epic',
    requiredLevel: 48,
    gatheringPower: 175,
    gatheringSpeed: 35,
    bonusYield: 22,
    rareFind: 12,
    combatStats: { attack: 45, accuracy: 8, critChance: 0.08, critMultiplier: 0.25 },
    craftable: true,
    craftRecipeId: 'craft_adamantite_axe',
  },
  ironwood_axe: {
    id: 'ironwood_axe',
    name: 'Siekiera z Żelaznego Drewna',
    description: 'Paradoksalnie, najlepsza siekiera do cięcia drewna jest z drewna.',
    icon: 'mdi-axe',
    type: 'axe',
    tier: 4,
    rarity: 'epic',
    requiredLevel: 55,
    gatheringPower: 160,
    gatheringSpeed: 40,
    bonusYield: 28,
    rareFind: 15,
    combatStats: { attack: 40, accuracy: 12, critChance: 0.1 },
    craftable: true,
    craftRecipeId: 'craft_ironwood_axe',
  },

  // Tier 5
  world_tree_axe: {
    id: 'world_tree_axe',
    name: 'Siekiera Drzewa Świata',
    description: 'Wykuta z gałęzi Drzewa Świata. Szanuje naturę, ale ją pokonuje.',
    icon: 'mdi-axe',
    type: 'axe',
    tier: 5,
    rarity: 'legendary',
    requiredLevel: 70,
    gatheringPower: 245,
    gatheringSpeed: 45,
    bonusYield: 32,
    rareFind: 18,
    combatStats: { attack: 60, accuracy: 15, critChance: 0.1, critMultiplier: 0.3 },
    craftable: true,
    craftRecipeId: 'craft_world_tree_axe',
  },

  // Tier 6
  spirit_axe: {
    id: 'spirit_axe',
    name: 'Duchowa Siekiera',
    description: 'Siekiera z duchowego drewna. Przecina zarówno materię jak i dusze.',
    icon: 'mdi-axe',
    type: 'axe',
    tier: 6,
    rarity: 'mythic',
    requiredLevel: 85,
    gatheringPower: 340,
    gatheringSpeed: 50,
    bonusYield: 42,
    rareFind: 25,
    combatStats: { attack: 82, accuracy: 18, critChance: 0.12, critMultiplier: 0.4 },
    craftable: true,
    craftRecipeId: 'craft_spirit_axe',
  },
};

// ============================================
// FISHING RODS
// ============================================

export const FISHING_RODS: Record<string, GatheringTool> = {
  // Tier 1
  basic_rod: {
    id: 'basic_rod',
    name: 'Podstawowa Wędka',
    description: 'Prosty kij z żyłką. Łowi małe ryby.',
    icon: 'mdi-hook',
    type: 'fishing_rod',
    tier: 1,
    rarity: 'common',
    requiredLevel: 1,
    gatheringPower: 10,
    gatheringSpeed: 0,
    bonusYield: 0,
    rareFind: 0,
    combatStats: { attack: 2, accuracy: 5 },
    craftable: true,
    craftRecipeId: 'craft_basic_rod',
  },
  willow_rod: {
    id: 'willow_rod',
    name: 'Wierzbowa Wędka',
    description: 'Elastyczna wędka z wierzby. Lepsza na większe ryby.',
    icon: 'mdi-hook',
    type: 'fishing_rod',
    tier: 1,
    rarity: 'common',
    requiredLevel: 5,
    gatheringPower: 25,
    gatheringSpeed: 8,
    bonusYield: 5,
    rareFind: 2,
    combatStats: { attack: 4, accuracy: 8 },
    craftable: true,
    craftRecipeId: 'craft_willow_rod',
  },

  // Tier 2
  maple_rod: {
    id: 'maple_rod',
    name: 'Klonowa Wędka',
    description: 'Solidna wędka z klonu. Wytrzyma większe zdobycze.',
    icon: 'mdi-hook',
    type: 'fishing_rod',
    tier: 2,
    rarity: 'uncommon',
    requiredLevel: 12,
    gatheringPower: 45,
    gatheringSpeed: 15,
    bonusYield: 10,
    rareFind: 5,
    combatStats: { attack: 8, accuracy: 10 },
    craftable: true,
    craftRecipeId: 'craft_maple_rod',
  },
  steel_rod: {
    id: 'steel_rod',
    name: 'Stalowa Wędka',
    description: 'Wytrzymała stalowa wędka. Nigdy się nie złamie.',
    icon: 'mdi-hook',
    type: 'fishing_rod',
    tier: 2,
    rarity: 'uncommon',
    requiredLevel: 20,
    gatheringPower: 70,
    gatheringSpeed: 20,
    bonusYield: 12,
    rareFind: 6,
    combatStats: { attack: 12, accuracy: 12, critChance: 0.02 },
    craftable: true,
    craftRecipeId: 'craft_steel_rod',
  },

  // Tier 3
  deep_sea_rod: {
    id: 'deep_sea_rod',
    name: 'Głębinowa Wędka',
    description: 'Specjalna wędka do łowienia w głębinach.',
    icon: 'mdi-hook',
    type: 'fishing_rod',
    tier: 3,
    rarity: 'rare',
    requiredLevel: 32,
    gatheringPower: 110,
    gatheringSpeed: 25,
    bonusYield: 18,
    rareFind: 12,
    combatStats: { attack: 18, accuracy: 15, critChance: 0.05 },
    craftable: true,
    craftRecipeId: 'craft_deep_sea_rod',
  },

  // Tier 4
  anglers_masterpiece: {
    id: 'anglers_masterpiece',
    name: 'Arcydzieło Wędkarza',
    description: 'Perfekcyjna wędka stworzona przez mistrza rzemiosła.',
    icon: 'mdi-hook',
    type: 'fishing_rod',
    tier: 4,
    rarity: 'epic',
    requiredLevel: 50,
    gatheringPower: 160,
    gatheringSpeed: 35,
    bonusYield: 25,
    rareFind: 18,
    combatStats: { attack: 28, accuracy: 18, critChance: 0.08 },
    craftable: true,
    craftRecipeId: 'craft_anglers_masterpiece',
  },

  // Tier 5
  neptunes_trident: {
    id: 'neptunes_trident',
    name: 'Trójząb Neptuna',
    description: 'Legendarny trójząb boga morz. Ryby same do niego płyną.',
    icon: 'mdi-trident',
    type: 'fishing_rod',
    tier: 5,
    rarity: 'legendary',
    requiredLevel: 68,
    gatheringPower: 230,
    gatheringSpeed: 45,
    bonusYield: 35,
    rareFind: 25,
    combatStats: { attack: 48, accuracy: 20, critChance: 0.1, critMultiplier: 0.3 },
    craftable: true,
    craftRecipeId: 'craft_neptunes_trident',
  },

  // Tier 6
  leviathan_hook: {
    id: 'leviathan_hook',
    name: 'Hak Lewiatana',
    description: 'Wykuty z kła morskiego potwora. Może złowić nawet bogów.',
    icon: 'mdi-hook',
    type: 'fishing_rod',
    tier: 6,
    rarity: 'mythic',
    requiredLevel: 82,
    gatheringPower: 320,
    gatheringSpeed: 50,
    bonusYield: 45,
    rareFind: 30,
    combatStats: { attack: 70, accuracy: 22, critChance: 0.12, critMultiplier: 0.4 },
    craftable: true,
    craftRecipeId: 'craft_leviathan_hook',
  },
};

// ============================================
// SICKLES (Herbalism)
// ============================================

export const SICKLES: Record<string, GatheringTool> = {
  // Tier 1
  wooden_sickle: {
    id: 'wooden_sickle',
    name: 'Drewniany Sierp',
    description: 'Prosty sierp z drewna. Do zbierania podstawowych ziół.',
    icon: 'mdi-sickle',
    type: 'sickle',
    tier: 1,
    rarity: 'common',
    requiredLevel: 1,
    gatheringPower: 10,
    gatheringSpeed: 0,
    bonusYield: 0,
    rareFind: 0,
    combatStats: { attack: 3, accuracy: 0, critChance: 0.03 },
    craftable: true,
    craftRecipeId: 'craft_wooden_sickle',
  },
  copper_sickle: {
    id: 'copper_sickle',
    name: 'Miedziany Sierp',
    description: 'Ostry sierp z miedzi. Precyzyjnie ścina rośliny.',
    icon: 'mdi-sickle',
    type: 'sickle',
    tier: 1,
    rarity: 'common',
    requiredLevel: 5,
    gatheringPower: 30,
    gatheringSpeed: 10,
    bonusYield: 5,
    rareFind: 2,
    combatStats: { attack: 6, accuracy: 3, critChance: 0.05 },
    craftable: true,
    craftRecipeId: 'craft_copper_sickle',
  },

  // Tier 2
  iron_sickle: {
    id: 'iron_sickle',
    name: 'Żelazny Sierp',
    description: 'Solidny sierp z żelaza. Standard wśród zielarzy.',
    icon: 'mdi-sickle',
    type: 'sickle',
    tier: 2,
    rarity: 'uncommon',
    requiredLevel: 12,
    gatheringPower: 50,
    gatheringSpeed: 18,
    bonusYield: 10,
    rareFind: 5,
    combatStats: { attack: 10, accuracy: 5, critChance: 0.06 },
    craftable: true,
    craftRecipeId: 'craft_iron_sickle',
  },
  silver_sickle: {
    id: 'silver_sickle',
    name: 'Srebrny Sierp',
    description: 'Błyszczący sierp ze srebra. Lepiej zbiera magiczne zioła.',
    icon: 'mdi-sickle',
    type: 'sickle',
    tier: 2,
    rarity: 'uncommon',
    requiredLevel: 20,
    gatheringPower: 75,
    gatheringSpeed: 22,
    bonusYield: 15,
    rareFind: 10,
    combatStats: { attack: 14, accuracy: 8, critChance: 0.08 },
    craftable: true,
    craftRecipeId: 'craft_silver_sickle',
  },

  // Tier 3
  mithril_sickle: {
    id: 'mithril_sickle',
    name: 'Mithrilowy Sierp',
    description: 'Magiczny sierp z mithrilu. Zioła same się do niego garną.',
    icon: 'mdi-sickle',
    type: 'sickle',
    tier: 3,
    rarity: 'rare',
    requiredLevel: 32,
    gatheringPower: 115,
    gatheringSpeed: 28,
    bonusYield: 20,
    rareFind: 15,
    combatStats: { attack: 22, accuracy: 12, critChance: 0.1 },
    craftable: true,
    craftRecipeId: 'craft_mithril_sickle',
  },

  // Tier 4
  moon_sickle: {
    id: 'moon_sickle',
    name: 'Księżycowy Sierp',
    description: 'Sierp wykuty w świetle pełni księżyca. Doskonały do nocnych ziół.',
    icon: 'mdi-sickle',
    type: 'sickle',
    tier: 4,
    rarity: 'epic',
    requiredLevel: 50,
    gatheringPower: 165,
    gatheringSpeed: 38,
    bonusYield: 28,
    rareFind: 22,
    combatStats: { attack: 32, accuracy: 15, critChance: 0.12 },
    craftable: true,
    craftRecipeId: 'craft_moon_sickle',
  },

  // Tier 5
  druids_harvest: {
    id: 'druids_harvest',
    name: 'Żniwo Druida',
    description: 'Święty sierp druidów. Rośliny dziękują mu za zbieranie.',
    icon: 'mdi-sickle',
    type: 'sickle',
    tier: 5,
    rarity: 'legendary',
    requiredLevel: 68,
    gatheringPower: 240,
    gatheringSpeed: 48,
    bonusYield: 38,
    rareFind: 28,
    combatStats: { attack: 50, accuracy: 18, critChance: 0.12, critMultiplier: 0.3 },
    craftable: true,
    craftRecipeId: 'craft_druids_harvest',
  },

  // Tier 6
  life_reaper: {
    id: 'life_reaper',
    name: 'Żniwiarz Życia',
    description: 'Sierp zbierający samą esencję życia. Potężne narzędzie natury.',
    icon: 'mdi-sickle',
    type: 'sickle',
    tier: 6,
    rarity: 'mythic',
    requiredLevel: 82,
    gatheringPower: 330,
    gatheringSpeed: 55,
    bonusYield: 50,
    rareFind: 35,
    combatStats: { attack: 72, accuracy: 20, critChance: 0.14, critMultiplier: 0.4, hpRegen: 2 },
    craftable: true,
    craftRecipeId: 'craft_life_reaper',
  },
};

// ============================================
// ALL TOOLS COMBINED
// ============================================

export const ALL_TOOLS: Record<string, GatheringTool> = {
  ...PICKAXES,
  ...AXES,
  ...FISHING_RODS,
  ...SICKLES,
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getTool(id: string): GatheringTool | undefined {
  return ALL_TOOLS[id];
}

export function getToolsByType(type: ToolType): GatheringTool[] {
  return Object.values(ALL_TOOLS).filter(t => t.type === type);
}

export function getToolsByTier(type: ToolType, tier: number): GatheringTool[] {
  return Object.values(ALL_TOOLS).filter(t => t.type === type && t.tier === tier);
}

export function getAvailableTools(type: ToolType, level: number): GatheringTool[] {
  return Object.values(ALL_TOOLS).filter(t => t.type === type && t.requiredLevel <= level);
}

export function getBestToolForLevel(type: ToolType, level: number): GatheringTool | undefined {
  const tools = getAvailableTools(type, level);
  return tools.sort((a, b) => b.gatheringPower - a.gatheringPower)[0];
}

export function calculateTotalPower(tool: GatheringTool | null, skillLevel: number): number {
  const basePower = skillLevel * 2; // 2 power per skill level
  const toolPower = tool?.gatheringPower || 0;
  return basePower + toolPower;
}

export function calculateGatheringBonus(tool: GatheringTool | null): {
  speedBonus: number;
  yieldBonus: number;
  rareFindBonus: number;
} {
  return {
    speedBonus: tool?.gatheringSpeed || 0,
    yieldBonus: tool?.bonusYield || 0,
    rareFindBonus: tool?.rareFind || 0,
  };
}
