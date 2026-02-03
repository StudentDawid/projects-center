/**
 * Crafting System Data - Professions, Recipes, Materials
 * Smithing, Tailoring, Jewelcrafting, Woodworking
 */

import type { ItemRarity, EquipmentStats, EquipmentSlot } from '@ateria-idle/entities/ateria-idle/warrior';

// ============================================
// TYPES
// ============================================

export type CraftingProfession = 'smithing' | 'tailoring' | 'jewelcrafting' | 'woodworking';

export interface CraftingProfessionData {
  id: CraftingProfession;
  name: string;
  description: string;
  icon: string;
  color: string;
  baseXpPerLevel: number;
  xpScaling: number;
}

export interface CraftingRecipe {
  id: string;
  name: string;
  description: string;
  profession: CraftingProfession;
  category: string;
  icon: string;
  requiredLevel: number;
  craftTime: number; // Ticks (10 = 1 second)
  xpReward: number;

  // Input materials
  materials: CraftingMaterial[];

  // Output
  outputId: string;
  outputType: 'equipment' | 'tool' | 'material' | 'consumable';
  outputAmount: number;
  outputRarity: ItemRarity;

  // Quality system
  minQuality: number; // 0-100
  maxQuality: number; // Based on skill
  qualityFactors: QualityFactor[];

  // Optional equipment stats (for equipment output)
  baseStats?: Partial<EquipmentStats>;
  equipmentSlot?: EquipmentSlot;

  // Discovery
  discovered: boolean;
  discoveryHint?: string;
}

export interface CraftingMaterial {
  itemId: string;
  amount: number;
  consumed: boolean; // Some items might be catalysts
}

export interface QualityFactor {
  type: 'skill_level' | 'material_tier' | 'tool_bonus' | 'research_bonus';
  weight: number; // How much this affects quality
}

export interface ProcessedMaterial {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: ItemRarity;
  tier: number;
  sellPrice: number;
  sourceRecipeId: string;
}

// ============================================
// PROFESSION DEFINITIONS
// ============================================

export const CRAFTING_PROFESSIONS: Record<CraftingProfession, CraftingProfessionData> = {
  smithing: {
    id: 'smithing',
    name: 'Kowalstwo',
    description: 'Wykuwanie broni i zbroi metalowych',
    icon: 'mdi-anvil',
    color: '#FF5722',
    baseXpPerLevel: 150,
    xpScaling: 1.15,
  },
  tailoring: {
    id: 'tailoring',
    name: 'Krawiectwo',
    description: 'Szycie lekkich zbroi i akcesoriów',
    icon: 'mdi-needle',
    color: '#E91E63',
    baseXpPerLevel: 150,
    xpScaling: 1.15,
  },
  jewelcrafting: {
    id: 'jewelcrafting',
    name: 'Jubilerstwo',
    description: 'Tworzenie biżuterii i amuletów',
    icon: 'mdi-ring',
    color: '#9C27B0',
    baseXpPerLevel: 150,
    xpScaling: 1.15,
  },
  woodworking: {
    id: 'woodworking',
    name: 'Stolarstwo',
    description: 'Wytwarzanie tarcz, łuków i mebli',
    icon: 'mdi-saw-blade',
    color: '#795548',
    baseXpPerLevel: 150,
    xpScaling: 1.15,
  },
};

// ============================================
// PROCESSED MATERIALS (Intermediate products)
// ============================================

export const PROCESSED_MATERIALS: Record<string, ProcessedMaterial> = {
  // Ingots
  copper_ingot: {
    id: 'copper_ingot',
    name: 'Sztabka Miedzi',
    description: 'Przetopiona miedź gotowa do obróbki.',
    icon: 'mdi-gold',
    rarity: 'common',
    tier: 1,
    sellPrice: 15,
    sourceRecipeId: 'smelt_copper',
  },
  tin_ingot: {
    id: 'tin_ingot',
    name: 'Sztabka Cyny',
    description: 'Przetopiona cyna.',
    icon: 'mdi-gold',
    rarity: 'common',
    tier: 1,
    sellPrice: 18,
    sourceRecipeId: 'smelt_tin',
  },
  bronze_ingot: {
    id: 'bronze_ingot',
    name: 'Sztabka Brązu',
    description: 'Stop miedzi i cyny. Twardszy od obu składników.',
    icon: 'mdi-gold',
    rarity: 'uncommon',
    tier: 1,
    sellPrice: 35,
    sourceRecipeId: 'smelt_bronze',
  },
  iron_ingot: {
    id: 'iron_ingot',
    name: 'Sztabka Żelaza',
    description: 'Standardowy metal do wytwarzania broni.',
    icon: 'mdi-gold',
    rarity: 'uncommon',
    tier: 2,
    sellPrice: 30,
    sourceRecipeId: 'smelt_iron',
  },
  steel_ingot: {
    id: 'steel_ingot',
    name: 'Sztabka Stali',
    description: 'Hartowana stal - silniejsza od żelaza.',
    icon: 'mdi-gold',
    rarity: 'uncommon',
    tier: 2,
    sellPrice: 55,
    sourceRecipeId: 'smelt_steel',
  },
  silver_ingot: {
    id: 'silver_ingot',
    name: 'Sztabka Srebra',
    description: 'Szlachetny metal do jubilerstwa.',
    icon: 'mdi-gold',
    rarity: 'rare',
    tier: 2,
    sellPrice: 50,
    sourceRecipeId: 'smelt_silver',
  },
  gold_ingot: {
    id: 'gold_ingot',
    name: 'Sztabka Złota',
    description: 'Cenny metal wysoko ceniony.',
    icon: 'mdi-gold',
    rarity: 'rare',
    tier: 3,
    sellPrice: 100,
    sourceRecipeId: 'smelt_gold',
  },
  mithril_ingot: {
    id: 'mithril_ingot',
    name: 'Sztabka Mithrilu',
    description: 'Magiczny metal o niezwykłych właściwościach.',
    icon: 'mdi-gold',
    rarity: 'rare',
    tier: 3,
    sellPrice: 180,
    sourceRecipeId: 'smelt_mithril',
  },
  adamantite_ingot: {
    id: 'adamantite_ingot',
    name: 'Sztabka Adamantytu',
    description: 'Najtwardszy znany metal.',
    icon: 'mdi-gold',
    rarity: 'epic',
    tier: 4,
    sellPrice: 350,
    sourceRecipeId: 'smelt_adamantite',
  },
  dragonite_ingot: {
    id: 'dragonite_ingot',
    name: 'Sztabka Dragonitu',
    description: 'Metal nasycony smoczą esencją.',
    icon: 'mdi-gold',
    rarity: 'legendary',
    tier: 5,
    sellPrice: 750,
    sourceRecipeId: 'smelt_dragonite',
  },
  void_ingot: {
    id: 'void_ingot',
    name: 'Sztabka Pustki',
    description: 'Metal z innego wymiaru.',
    icon: 'mdi-gold',
    rarity: 'mythic',
    tier: 6,
    sellPrice: 1500,
    sourceRecipeId: 'smelt_void',
  },

  // Planks (processed wood)
  oak_plank: {
    id: 'oak_plank',
    name: 'Deska Dębowa',
    description: 'Obrobione drewno dębowe.',
    icon: 'mdi-view-dashboard',
    rarity: 'common',
    tier: 1,
    sellPrice: 10,
    sourceRecipeId: 'process_oak',
  },
  maple_plank: {
    id: 'maple_plank',
    name: 'Deska Klonowa',
    description: 'Obrobione drewno klonowe.',
    icon: 'mdi-view-dashboard',
    rarity: 'uncommon',
    tier: 2,
    sellPrice: 28,
    sourceRecipeId: 'process_maple',
  },
  yew_plank: {
    id: 'yew_plank',
    name: 'Deska Cisowa',
    description: 'Obrobione drewno cisowe.',
    icon: 'mdi-view-dashboard',
    rarity: 'rare',
    tier: 3,
    sellPrice: 120,
    sourceRecipeId: 'process_yew',
  },
  ironwood_plank: {
    id: 'ironwood_plank',
    name: 'Deska z Żelaznego Drewna',
    description: 'Twarde jak żelazo drewno.',
    icon: 'mdi-view-dashboard',
    rarity: 'epic',
    tier: 4,
    sellPrice: 300,
    sourceRecipeId: 'process_ironwood',
  },

  // Leather
  leather: {
    id: 'leather',
    name: 'Skóra',
    description: 'Podstawowa wyprawiona skóra.',
    icon: 'mdi-layers',
    rarity: 'common',
    tier: 1,
    sellPrice: 12,
    sourceRecipeId: 'tan_leather',
  },
  hardened_leather: {
    id: 'hardened_leather',
    name: 'Utwardzona Skóra',
    description: 'Skóra utwardzona specjalnym procesem.',
    icon: 'mdi-layers',
    rarity: 'uncommon',
    tier: 2,
    sellPrice: 35,
    sourceRecipeId: 'tan_hardened_leather',
  },
  dragonhide: {
    id: 'dragonhide',
    name: 'Smocza Skóra',
    description: 'Niezwykle wytrzymała skóra smoka.',
    icon: 'mdi-layers',
    rarity: 'legendary',
    tier: 5,
    sellPrice: 600,
    sourceRecipeId: 'process_dragonhide',
  },

  // Cloth
  linen_cloth: {
    id: 'linen_cloth',
    name: 'Tkanina Lniana',
    description: 'Podstawowa tkanina z lnu.',
    icon: 'mdi-texture-box',
    rarity: 'common',
    tier: 1,
    sellPrice: 8,
    sourceRecipeId: 'weave_linen',
  },
  silk_cloth: {
    id: 'silk_cloth',
    name: 'Jedwab',
    description: 'Luksusowa tkanina z jedwabiu.',
    icon: 'mdi-texture-box',
    rarity: 'rare',
    tier: 3,
    sellPrice: 80,
    sourceRecipeId: 'weave_silk',
  },
  moonweave: {
    id: 'moonweave',
    name: 'Tkanina Księżycowa',
    description: 'Magiczna tkanina utkana w świetle księżyca.',
    icon: 'mdi-texture-box',
    rarity: 'epic',
    tier: 4,
    sellPrice: 250,
    sourceRecipeId: 'weave_moonweave',
  },

  // Cut gems
  cut_quartz: {
    id: 'cut_quartz',
    name: 'Szlifowany Kwarc',
    description: 'Precyzyjnie oszlifowany kwarc.',
    icon: 'mdi-diamond',
    rarity: 'common',
    tier: 1,
    sellPrice: 30,
    sourceRecipeId: 'cut_quartz',
  },
  cut_amethyst: {
    id: 'cut_amethyst',
    name: 'Szlifowany Ametyst',
    description: 'Pięknie oszlifowany ametyst.',
    icon: 'mdi-diamond',
    rarity: 'uncommon',
    tier: 2,
    sellPrice: 70,
    sourceRecipeId: 'cut_amethyst',
  },
  cut_ruby: {
    id: 'cut_ruby',
    name: 'Szlifowany Rubin',
    description: 'Lśniący rubin o doskonałym szlifie.',
    icon: 'mdi-diamond',
    rarity: 'rare',
    tier: 3,
    sellPrice: 200,
    sourceRecipeId: 'cut_ruby',
  },
  cut_sapphire: {
    id: 'cut_sapphire',
    name: 'Szlifowany Szafir',
    description: 'Niebieski szafir idealnego szlifu.',
    icon: 'mdi-diamond',
    rarity: 'rare',
    tier: 3,
    sellPrice: 220,
    sourceRecipeId: 'cut_sapphire',
  },
  cut_emerald: {
    id: 'cut_emerald',
    name: 'Szlifowany Szmaragd',
    description: 'Zielony szmaragd mistrzowskiego szlifu.',
    icon: 'mdi-diamond',
    rarity: 'epic',
    tier: 4,
    sellPrice: 400,
    sourceRecipeId: 'cut_emerald',
  },
  cut_diamond: {
    id: 'cut_diamond',
    name: 'Szlifowany Diament',
    description: 'Perfekcyjnie oszlifowany diament.',
    icon: 'mdi-diamond',
    rarity: 'legendary',
    tier: 5,
    sellPrice: 1000,
    sourceRecipeId: 'cut_diamond',
  },
};

// ============================================
// SMITHING RECIPES
// ============================================

export const SMITHING_RECIPES: Record<string, CraftingRecipe> = {
  // Smelting - Ingots
  smelt_copper: {
    id: 'smelt_copper',
    name: 'Wytapianie Miedzi',
    description: 'Przetop rudę miedzi na sztabkę.',
    profession: 'smithing',
    category: 'smelting',
    icon: 'mdi-fire',
    requiredLevel: 1,
    craftTime: 50,
    xpReward: 10,
    materials: [
      { itemId: 'copper_ore', amount: 2, consumed: true },
      { itemId: 'coal', amount: 1, consumed: true },
    ],
    outputId: 'copper_ingot',
    outputType: 'material',
    outputAmount: 1,
    outputRarity: 'common',
    minQuality: 50,
    maxQuality: 100,
    qualityFactors: [
      { type: 'skill_level', weight: 0.5 },
      { type: 'material_tier', weight: 0.3 },
    ],
    discovered: true,
  },
  smelt_iron: {
    id: 'smelt_iron',
    name: 'Wytapianie Żelaza',
    description: 'Przetop rudę żelaza na sztabkę.',
    profession: 'smithing',
    category: 'smelting',
    icon: 'mdi-fire',
    requiredLevel: 10,
    craftTime: 80,
    xpReward: 25,
    materials: [
      { itemId: 'iron_ore', amount: 2, consumed: true },
      { itemId: 'coal', amount: 2, consumed: true },
    ],
    outputId: 'iron_ingot',
    outputType: 'material',
    outputAmount: 1,
    outputRarity: 'uncommon',
    minQuality: 40,
    maxQuality: 100,
    qualityFactors: [
      { type: 'skill_level', weight: 0.5 },
      { type: 'material_tier', weight: 0.3 },
    ],
    discovered: true,
  },
  smelt_steel: {
    id: 'smelt_steel',
    name: 'Wytapianie Stali',
    description: 'Wykuj stal z żelaza i węgla.',
    profession: 'smithing',
    category: 'smelting',
    icon: 'mdi-fire',
    requiredLevel: 20,
    craftTime: 120,
    xpReward: 45,
    materials: [
      { itemId: 'iron_ingot', amount: 2, consumed: true },
      { itemId: 'coal', amount: 4, consumed: true },
    ],
    outputId: 'steel_ingot',
    outputType: 'material',
    outputAmount: 1,
    outputRarity: 'uncommon',
    minQuality: 30,
    maxQuality: 100,
    qualityFactors: [
      { type: 'skill_level', weight: 0.6 },
      { type: 'material_tier', weight: 0.3 },
    ],
    discovered: true,
  },
  smelt_mithril: {
    id: 'smelt_mithril',
    name: 'Wytapianie Mithrilu',
    description: 'Przetop magiczną rudę mithrilu.',
    profession: 'smithing',
    category: 'smelting',
    icon: 'mdi-fire',
    requiredLevel: 35,
    craftTime: 200,
    xpReward: 90,
    materials: [
      { itemId: 'mithril_ore', amount: 3, consumed: true },
      { itemId: 'coal', amount: 5, consumed: true },
      { itemId: 'magic_essence', amount: 1, consumed: true },
    ],
    outputId: 'mithril_ingot',
    outputType: 'material',
    outputAmount: 1,
    outputRarity: 'rare',
    minQuality: 20,
    maxQuality: 100,
    qualityFactors: [
      { type: 'skill_level', weight: 0.7 },
      { type: 'research_bonus', weight: 0.2 },
    ],
    discovered: false,
    discoveryHint: 'Odkryj przez badania Naukowca lub znajdź recepturę w dungeonach.',
  },

  // Tools - Pickaxes
  craft_stone_pickaxe: {
    id: 'craft_stone_pickaxe',
    name: 'Kamienny Kilof',
    description: 'Wykuj prosty kamienny kilof.',
    profession: 'smithing',
    category: 'tools',
    icon: 'mdi-pickaxe',
    requiredLevel: 1,
    craftTime: 60,
    xpReward: 15,
    materials: [
      { itemId: 'stone', amount: 5, consumed: true },
      { itemId: 'oak_wood', amount: 2, consumed: true },
    ],
    outputId: 'stone_pickaxe',
    outputType: 'tool',
    outputAmount: 1,
    outputRarity: 'common',
    minQuality: 50,
    maxQuality: 100,
    qualityFactors: [
      { type: 'skill_level', weight: 0.6 },
    ],
    discovered: true,
  },
  craft_copper_pickaxe: {
    id: 'craft_copper_pickaxe',
    name: 'Miedziany Kilof',
    description: 'Wykuj miedziany kilof.',
    profession: 'smithing',
    category: 'tools',
    icon: 'mdi-pickaxe',
    requiredLevel: 5,
    craftTime: 100,
    xpReward: 25,
    materials: [
      { itemId: 'copper_ingot', amount: 3, consumed: true },
      { itemId: 'oak_wood', amount: 2, consumed: true },
    ],
    outputId: 'copper_pickaxe',
    outputType: 'tool',
    outputAmount: 1,
    outputRarity: 'common',
    minQuality: 40,
    maxQuality: 100,
    qualityFactors: [
      { type: 'skill_level', weight: 0.6 },
      { type: 'material_tier', weight: 0.2 },
    ],
    discovered: true,
  },
  craft_iron_pickaxe: {
    id: 'craft_iron_pickaxe',
    name: 'Żelazny Kilof',
    description: 'Wykuj solidny żelazny kilof.',
    profession: 'smithing',
    category: 'tools',
    icon: 'mdi-pickaxe',
    requiredLevel: 12,
    craftTime: 150,
    xpReward: 45,
    materials: [
      { itemId: 'iron_ingot', amount: 4, consumed: true },
      { itemId: 'oak_wood', amount: 2, consumed: true },
      { itemId: 'leather', amount: 1, consumed: true },
    ],
    outputId: 'iron_pickaxe',
    outputType: 'tool',
    outputAmount: 1,
    outputRarity: 'uncommon',
    minQuality: 30,
    maxQuality: 100,
    qualityFactors: [
      { type: 'skill_level', weight: 0.5 },
      { type: 'material_tier', weight: 0.3 },
    ],
    discovered: true,
  },
  craft_steel_pickaxe: {
    id: 'craft_steel_pickaxe',
    name: 'Stalowy Kilof',
    description: 'Wykuj stalowy kilof najwyższej jakości.',
    profession: 'smithing',
    category: 'tools',
    icon: 'mdi-pickaxe',
    requiredLevel: 22,
    craftTime: 200,
    xpReward: 70,
    materials: [
      { itemId: 'steel_ingot', amount: 5, consumed: true },
      { itemId: 'maple_wood', amount: 2, consumed: true },
      { itemId: 'hardened_leather', amount: 1, consumed: true },
    ],
    outputId: 'steel_pickaxe',
    outputType: 'tool',
    outputAmount: 1,
    outputRarity: 'uncommon',
    minQuality: 20,
    maxQuality: 100,
    qualityFactors: [
      { type: 'skill_level', weight: 0.5 },
      { type: 'material_tier', weight: 0.3 },
      { type: 'tool_bonus', weight: 0.1 },
    ],
    discovered: true,
  },
  craft_mithril_pickaxe: {
    id: 'craft_mithril_pickaxe',
    name: 'Mithrilowy Kilof',
    description: 'Wykuj magiczny mithrilowy kilof.',
    profession: 'smithing',
    category: 'tools',
    icon: 'mdi-pickaxe',
    requiredLevel: 38,
    craftTime: 350,
    xpReward: 120,
    materials: [
      { itemId: 'mithril_ingot', amount: 6, consumed: true },
      { itemId: 'yew_wood', amount: 2, consumed: true },
      { itemId: 'magic_essence', amount: 2, consumed: true },
    ],
    outputId: 'mithril_pickaxe',
    outputType: 'tool',
    outputAmount: 1,
    outputRarity: 'rare',
    minQuality: 10,
    maxQuality: 100,
    qualityFactors: [
      { type: 'skill_level', weight: 0.6 },
      { type: 'material_tier', weight: 0.2 },
      { type: 'research_bonus', weight: 0.1 },
    ],
    discovered: false,
    discoveryHint: 'Wymaga odkrycia receptury na mithrilowe przedmioty.',
  },

  // Weapons
  craft_iron_sword: {
    id: 'craft_iron_sword',
    name: 'Żelazny Miecz',
    description: 'Wykuj solidny żelazny miecz.',
    profession: 'smithing',
    category: 'weapons',
    icon: 'mdi-sword',
    requiredLevel: 15,
    craftTime: 180,
    xpReward: 55,
    materials: [
      { itemId: 'iron_ingot', amount: 5, consumed: true },
      { itemId: 'oak_wood', amount: 1, consumed: true },
      { itemId: 'leather', amount: 2, consumed: true },
    ],
    outputId: 'crafted_iron_sword',
    outputType: 'equipment',
    outputAmount: 1,
    outputRarity: 'uncommon',
    minQuality: 30,
    maxQuality: 100,
    qualityFactors: [
      { type: 'skill_level', weight: 0.5 },
      { type: 'material_tier', weight: 0.3 },
      { type: 'tool_bonus', weight: 0.1 },
    ],
    baseStats: { attack: 15, accuracy: 5 },
    equipmentSlot: 'weapon',
    discovered: true,
  },
  craft_steel_sword: {
    id: 'craft_steel_sword',
    name: 'Stalowy Miecz',
    description: 'Wykuj doskonały stalowy miecz.',
    profession: 'smithing',
    category: 'weapons',
    icon: 'mdi-sword',
    requiredLevel: 25,
    craftTime: 250,
    xpReward: 85,
    materials: [
      { itemId: 'steel_ingot', amount: 6, consumed: true },
      { itemId: 'maple_wood', amount: 1, consumed: true },
      { itemId: 'hardened_leather', amount: 2, consumed: true },
    ],
    outputId: 'crafted_steel_sword',
    outputType: 'equipment',
    outputAmount: 1,
    outputRarity: 'rare',
    minQuality: 20,
    maxQuality: 100,
    qualityFactors: [
      { type: 'skill_level', weight: 0.5 },
      { type: 'material_tier', weight: 0.3 },
      { type: 'tool_bonus', weight: 0.1 },
    ],
    baseStats: { attack: 25, accuracy: 8, critChance: 0.03 },
    equipmentSlot: 'weapon',
    discovered: true,
  },

  // Armor
  craft_iron_plate: {
    id: 'craft_iron_plate',
    name: 'Żelazna Płyta',
    description: 'Wykuj ciężką żelazną zbroję.',
    profession: 'smithing',
    category: 'armor',
    icon: 'mdi-shield',
    requiredLevel: 18,
    craftTime: 250,
    xpReward: 70,
    materials: [
      { itemId: 'iron_ingot', amount: 8, consumed: true },
      { itemId: 'leather', amount: 4, consumed: true },
    ],
    outputId: 'crafted_iron_plate',
    outputType: 'equipment',
    outputAmount: 1,
    outputRarity: 'uncommon',
    minQuality: 30,
    maxQuality: 100,
    qualityFactors: [
      { type: 'skill_level', weight: 0.5 },
      { type: 'material_tier', weight: 0.3 },
    ],
    baseStats: { defense: 18, maxHp: 40 },
    equipmentSlot: 'armor',
    discovered: true,
  },
};

// ============================================
// WOODWORKING RECIPES
// ============================================

export const WOODWORKING_RECIPES: Record<string, CraftingRecipe> = {
  // Processing
  process_oak: {
    id: 'process_oak',
    name: 'Obróbka Dębu',
    description: 'Przetwórz drewno dębowe na deski.',
    profession: 'woodworking',
    category: 'processing',
    icon: 'mdi-saw-blade',
    requiredLevel: 1,
    craftTime: 40,
    xpReward: 8,
    materials: [
      { itemId: 'oak_wood', amount: 2, consumed: true },
    ],
    outputId: 'oak_plank',
    outputType: 'material',
    outputAmount: 3,
    outputRarity: 'common',
    minQuality: 60,
    maxQuality: 100,
    qualityFactors: [
      { type: 'skill_level', weight: 0.6 },
    ],
    discovered: true,
  },
  process_maple: {
    id: 'process_maple',
    name: 'Obróbka Klonu',
    description: 'Przetwórz drewno klonowe na deski.',
    profession: 'woodworking',
    category: 'processing',
    icon: 'mdi-saw-blade',
    requiredLevel: 15,
    craftTime: 60,
    xpReward: 25,
    materials: [
      { itemId: 'maple_wood', amount: 2, consumed: true },
    ],
    outputId: 'maple_plank',
    outputType: 'material',
    outputAmount: 3,
    outputRarity: 'uncommon',
    minQuality: 50,
    maxQuality: 100,
    qualityFactors: [
      { type: 'skill_level', weight: 0.6 },
    ],
    discovered: true,
  },

  // Tools - Axes
  craft_stone_axe: {
    id: 'craft_stone_axe',
    name: 'Kamienna Siekiera',
    description: 'Stwórz prostą kamienną siekierę.',
    profession: 'woodworking',
    category: 'tools',
    icon: 'mdi-axe',
    requiredLevel: 1,
    craftTime: 60,
    xpReward: 15,
    materials: [
      { itemId: 'stone', amount: 4, consumed: true },
      { itemId: 'oak_wood', amount: 3, consumed: true },
    ],
    outputId: 'stone_axe',
    outputType: 'tool',
    outputAmount: 1,
    outputRarity: 'common',
    minQuality: 50,
    maxQuality: 100,
    qualityFactors: [
      { type: 'skill_level', weight: 0.6 },
    ],
    discovered: true,
  },

  // Weapons - Bows
  craft_hunting_bow: {
    id: 'craft_hunting_bow',
    name: 'Łuk Myśliwski',
    description: 'Stwórz prosty łuk myśliwski.',
    profession: 'woodworking',
    category: 'weapons',
    icon: 'mdi-bow-arrow',
    requiredLevel: 8,
    craftTime: 120,
    xpReward: 35,
    materials: [
      { itemId: 'oak_plank', amount: 4, consumed: true },
      { itemId: 'spider_silk', amount: 3, consumed: true },
    ],
    outputId: 'crafted_hunting_bow',
    outputType: 'equipment',
    outputAmount: 1,
    outputRarity: 'common',
    minQuality: 40,
    maxQuality: 100,
    qualityFactors: [
      { type: 'skill_level', weight: 0.5 },
      { type: 'material_tier', weight: 0.3 },
    ],
    baseStats: { attack: 8, accuracy: 10 },
    equipmentSlot: 'weapon',
    discovered: true,
  },
  craft_yew_longbow: {
    id: 'craft_yew_longbow',
    name: 'Długi Łuk Cisowy',
    description: 'Stwórz legendarny łuk z cisu.',
    profession: 'woodworking',
    category: 'weapons',
    icon: 'mdi-bow-arrow',
    requiredLevel: 35,
    craftTime: 280,
    xpReward: 110,
    materials: [
      { itemId: 'yew_plank', amount: 6, consumed: true },
      { itemId: 'spider_silk', amount: 10, consumed: true },
      { itemId: 'hardened_leather', amount: 2, consumed: true },
    ],
    outputId: 'crafted_yew_longbow',
    outputType: 'equipment',
    outputAmount: 1,
    outputRarity: 'rare',
    minQuality: 20,
    maxQuality: 100,
    qualityFactors: [
      { type: 'skill_level', weight: 0.5 },
      { type: 'material_tier', weight: 0.3 },
      { type: 'tool_bonus', weight: 0.1 },
    ],
    baseStats: { attack: 28, accuracy: 18, critChance: 0.06 },
    equipmentSlot: 'weapon',
    discovered: false,
    discoveryHint: 'Znajdź starożytny schemat lub zbadaj u Naukowca.',
  },
};

// ============================================
// JEWELCRAFTING RECIPES
// ============================================

export const JEWELCRAFTING_RECIPES: Record<string, CraftingRecipe> = {
  // Gem cutting
  cut_quartz_recipe: {
    id: 'cut_quartz_recipe',
    name: 'Szlifowanie Kwarcu',
    description: 'Oszlifuj surowy kwarc.',
    profession: 'jewelcrafting',
    category: 'gemcutting',
    icon: 'mdi-diamond',
    requiredLevel: 1,
    craftTime: 50,
    xpReward: 12,
    materials: [
      { itemId: 'quartz', amount: 1, consumed: true },
    ],
    outputId: 'cut_quartz',
    outputType: 'material',
    outputAmount: 1,
    outputRarity: 'common',
    minQuality: 50,
    maxQuality: 100,
    qualityFactors: [
      { type: 'skill_level', weight: 0.7 },
    ],
    discovered: true,
  },
  cut_amethyst_recipe: {
    id: 'cut_amethyst_recipe',
    name: 'Szlifowanie Ametystu',
    description: 'Oszlifuj surowy ametyst.',
    profession: 'jewelcrafting',
    category: 'gemcutting',
    icon: 'mdi-diamond',
    requiredLevel: 15,
    craftTime: 80,
    xpReward: 28,
    materials: [
      { itemId: 'amethyst', amount: 1, consumed: true },
    ],
    outputId: 'cut_amethyst',
    outputType: 'material',
    outputAmount: 1,
    outputRarity: 'uncommon',
    minQuality: 40,
    maxQuality: 100,
    qualityFactors: [
      { type: 'skill_level', weight: 0.7 },
    ],
    discovered: true,
  },
  cut_ruby_recipe: {
    id: 'cut_ruby_recipe',
    name: 'Szlifowanie Rubinu',
    description: 'Oszlifuj surowy rubin.',
    profession: 'jewelcrafting',
    category: 'gemcutting',
    icon: 'mdi-diamond',
    requiredLevel: 30,
    craftTime: 150,
    xpReward: 65,
    materials: [
      { itemId: 'ruby', amount: 1, consumed: true },
    ],
    outputId: 'cut_ruby',
    outputType: 'material',
    outputAmount: 1,
    outputRarity: 'rare',
    minQuality: 30,
    maxQuality: 100,
    qualityFactors: [
      { type: 'skill_level', weight: 0.7 },
    ],
    discovered: true,
  },

  // Jewelry
  craft_copper_ring: {
    id: 'craft_copper_ring',
    name: 'Miedziany Pierścień',
    description: 'Stwórz prosty miedziany pierścień.',
    profession: 'jewelcrafting',
    category: 'rings',
    icon: 'mdi-ring',
    requiredLevel: 5,
    craftTime: 80,
    xpReward: 20,
    materials: [
      { itemId: 'copper_ingot', amount: 2, consumed: true },
    ],
    outputId: 'crafted_copper_ring',
    outputType: 'equipment',
    outputAmount: 1,
    outputRarity: 'common',
    minQuality: 50,
    maxQuality: 100,
    qualityFactors: [
      { type: 'skill_level', weight: 0.6 },
    ],
    baseStats: { attack: 2 },
    equipmentSlot: 'accessory',
    discovered: true,
  },
  craft_silver_ring: {
    id: 'craft_silver_ring',
    name: 'Srebrny Pierścień',
    description: 'Stwórz elegancki srebrny pierścień.',
    profession: 'jewelcrafting',
    category: 'rings',
    icon: 'mdi-ring',
    requiredLevel: 18,
    craftTime: 120,
    xpReward: 45,
    materials: [
      { itemId: 'silver_ingot', amount: 2, consumed: true },
      { itemId: 'cut_quartz', amount: 1, consumed: true },
    ],
    outputId: 'crafted_silver_ring',
    outputType: 'equipment',
    outputAmount: 1,
    outputRarity: 'uncommon',
    minQuality: 40,
    maxQuality: 100,
    qualityFactors: [
      { type: 'skill_level', weight: 0.5 },
      { type: 'material_tier', weight: 0.3 },
    ],
    baseStats: { attack: 5, critChance: 0.02 },
    equipmentSlot: 'accessory',
    discovered: true,
  },
  craft_ruby_ring: {
    id: 'craft_ruby_ring',
    name: 'Rubinowy Pierścień',
    description: 'Stwórz potężny rubinowy pierścień.',
    profession: 'jewelcrafting',
    category: 'rings',
    icon: 'mdi-ring',
    requiredLevel: 35,
    craftTime: 200,
    xpReward: 95,
    materials: [
      { itemId: 'gold_ingot', amount: 2, consumed: true },
      { itemId: 'cut_ruby', amount: 1, consumed: true },
    ],
    outputId: 'crafted_ruby_ring',
    outputType: 'equipment',
    outputAmount: 1,
    outputRarity: 'rare',
    minQuality: 25,
    maxQuality: 100,
    qualityFactors: [
      { type: 'skill_level', weight: 0.5 },
      { type: 'material_tier', weight: 0.3 },
      { type: 'tool_bonus', weight: 0.1 },
    ],
    baseStats: { attack: 12, critChance: 0.04 },
    equipmentSlot: 'accessory',
    discovered: false,
    discoveryHint: 'Wymaga receptury na rubinową biżuterię.',
  },

  // Amulets
  craft_silver_amulet: {
    id: 'craft_silver_amulet',
    name: 'Srebrny Amulet',
    description: 'Stwórz ochronny srebrny amulet.',
    profession: 'jewelcrafting',
    category: 'amulets',
    icon: 'mdi-necklace',
    requiredLevel: 20,
    craftTime: 150,
    xpReward: 55,
    materials: [
      { itemId: 'silver_ingot', amount: 3, consumed: true },
      { itemId: 'spider_silk', amount: 2, consumed: true },
    ],
    outputId: 'crafted_silver_amulet',
    outputType: 'equipment',
    outputAmount: 1,
    outputRarity: 'uncommon',
    minQuality: 35,
    maxQuality: 100,
    qualityFactors: [
      { type: 'skill_level', weight: 0.5 },
      { type: 'material_tier', weight: 0.3 },
    ],
    baseStats: { defense: 5, maxHp: 25 },
    equipmentSlot: 'accessory',
    discovered: true,
  },
};

// ============================================
// TAILORING RECIPES
// ============================================

export const TAILORING_RECIPES: Record<string, CraftingRecipe> = {
  // Processing
  tan_leather: {
    id: 'tan_leather',
    name: 'Garbowanie Skóry',
    description: 'Przetwórz surową skórę na skórę.',
    profession: 'tailoring',
    category: 'processing',
    icon: 'mdi-layers',
    requiredLevel: 1,
    craftTime: 60,
    xpReward: 10,
    materials: [
      { itemId: 'wolf_pelt', amount: 2, consumed: true },
    ],
    outputId: 'leather',
    outputType: 'material',
    outputAmount: 1,
    outputRarity: 'common',
    minQuality: 60,
    maxQuality: 100,
    qualityFactors: [
      { type: 'skill_level', weight: 0.6 },
    ],
    discovered: true,
  },
  tan_hardened_leather: {
    id: 'tan_hardened_leather',
    name: 'Utwardzanie Skóry',
    description: 'Utwardź skórę specjalnym procesem.',
    profession: 'tailoring',
    category: 'processing',
    icon: 'mdi-layers',
    requiredLevel: 18,
    craftTime: 100,
    xpReward: 35,
    materials: [
      { itemId: 'leather', amount: 3, consumed: true },
      { itemId: 'salt_crystal', amount: 2, consumed: true },
    ],
    outputId: 'hardened_leather',
    outputType: 'material',
    outputAmount: 1,
    outputRarity: 'uncommon',
    minQuality: 45,
    maxQuality: 100,
    qualityFactors: [
      { type: 'skill_level', weight: 0.6 },
    ],
    discovered: true,
  },

  // Armor
  craft_leather_vest: {
    id: 'craft_leather_vest',
    name: 'Skórzana Kamizelka',
    description: 'Uszyj prostą skórzaną kamizelkę.',
    profession: 'tailoring',
    category: 'armor',
    icon: 'mdi-tshirt-crew',
    requiredLevel: 5,
    craftTime: 80,
    xpReward: 20,
    materials: [
      { itemId: 'leather', amount: 4, consumed: true },
      { itemId: 'linen_cloth', amount: 2, consumed: true },
    ],
    outputId: 'crafted_leather_vest',
    outputType: 'equipment',
    outputAmount: 1,
    outputRarity: 'common',
    minQuality: 50,
    maxQuality: 100,
    qualityFactors: [
      { type: 'skill_level', weight: 0.5 },
    ],
    baseStats: { defense: 5, maxHp: 15, evasion: 3 },
    equipmentSlot: 'armor',
    discovered: true,
  },
  craft_hardened_armor: {
    id: 'craft_hardened_armor',
    name: 'Utwardzona Zbroja',
    description: 'Uszyj solidną utwardzoną zbroję.',
    profession: 'tailoring',
    category: 'armor',
    icon: 'mdi-tshirt-crew',
    requiredLevel: 22,
    craftTime: 180,
    xpReward: 60,
    materials: [
      { itemId: 'hardened_leather', amount: 6, consumed: true },
      { itemId: 'linen_cloth', amount: 4, consumed: true },
      { itemId: 'iron_ingot', amount: 2, consumed: true },
    ],
    outputId: 'crafted_hardened_armor',
    outputType: 'equipment',
    outputAmount: 1,
    outputRarity: 'uncommon',
    minQuality: 35,
    maxQuality: 100,
    qualityFactors: [
      { type: 'skill_level', weight: 0.5 },
      { type: 'material_tier', weight: 0.3 },
    ],
    baseStats: { defense: 12, maxHp: 35, evasion: 5 },
    equipmentSlot: 'armor',
    discovered: true,
  },

  // Tools - Sickles
  craft_copper_sickle: {
    id: 'craft_copper_sickle',
    name: 'Miedziany Sierp',
    description: 'Stwórz miedziany sierp z uchwytem.',
    profession: 'tailoring',
    category: 'tools',
    icon: 'mdi-sickle',
    requiredLevel: 8,
    craftTime: 90,
    xpReward: 25,
    materials: [
      { itemId: 'copper_ingot', amount: 2, consumed: true },
      { itemId: 'leather', amount: 2, consumed: true },
      { itemId: 'oak_wood', amount: 1, consumed: true },
    ],
    outputId: 'copper_sickle',
    outputType: 'tool',
    outputAmount: 1,
    outputRarity: 'common',
    minQuality: 45,
    maxQuality: 100,
    qualityFactors: [
      { type: 'skill_level', weight: 0.5 },
    ],
    discovered: true,
  },
};

// ============================================
// ALL RECIPES COMBINED
// ============================================

export const ALL_RECIPES: Record<string, CraftingRecipe> = {
  ...SMITHING_RECIPES,
  ...WOODWORKING_RECIPES,
  ...JEWELCRAFTING_RECIPES,
  ...TAILORING_RECIPES,
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getRecipe(id: string): CraftingRecipe | undefined {
  return ALL_RECIPES[id];
}

export function getRecipesByProfession(profession: CraftingProfession): CraftingRecipe[] {
  return Object.values(ALL_RECIPES).filter(r => r.profession === profession);
}

export function getRecipesByCategory(profession: CraftingProfession, category: string): CraftingRecipe[] {
  return Object.values(ALL_RECIPES).filter(r => r.profession === profession && r.category === category);
}

export function getAvailableRecipes(profession: CraftingProfession, level: number, discoveredRecipes: Set<string>): CraftingRecipe[] {
  return Object.values(ALL_RECIPES).filter(
    r => r.profession === profession &&
         r.requiredLevel <= level &&
         (r.discovered || discoveredRecipes.has(r.id))
  );
}

export function calculateCraftingQuality(
  recipe: CraftingRecipe,
  skillLevel: number,
  materialTier: number,
  toolBonus: number,
  researchBonus: number
): number {
  let quality = recipe.minQuality;
  const qualityRange = recipe.maxQuality - recipe.minQuality;

  for (const factor of recipe.qualityFactors) {
    let contribution = 0;
    switch (factor.type) {
      case 'skill_level':
        contribution = Math.min(1, skillLevel / 100) * qualityRange * factor.weight;
        break;
      case 'material_tier':
        contribution = Math.min(1, materialTier / 6) * qualityRange * factor.weight;
        break;
      case 'tool_bonus':
        contribution = Math.min(1, toolBonus / 50) * qualityRange * factor.weight;
        break;
      case 'research_bonus':
        contribution = Math.min(1, researchBonus / 100) * qualityRange * factor.weight;
        break;
    }
    quality += contribution;
  }

  // Add some randomness (+/- 10%)
  const variance = qualityRange * 0.1;
  quality += (Math.random() - 0.5) * 2 * variance;

  return Math.max(recipe.minQuality, Math.min(recipe.maxQuality, Math.floor(quality)));
}

export function getQualityLabel(quality: number): { label: string; color: string } {
  if (quality >= 95) return { label: 'Mistrzowska', color: '#FF9800' };
  if (quality >= 85) return { label: 'Doskonała', color: '#9C27B0' };
  if (quality >= 70) return { label: 'Dobra', color: '#2196F3' };
  if (quality >= 50) return { label: 'Zwykła', color: '#4CAF50' };
  if (quality >= 30) return { label: 'Kiepska', color: '#FFC107' };
  return { label: 'Zła', color: '#F44336' };
}

export function calculateXpToLevel(level: number, profession: CraftingProfession): number {
  const profData = CRAFTING_PROFESSIONS[profession];
  return Math.floor(profData.baseXpPerLevel * Math.pow(profData.xpScaling, level - 1));
}
