/**
 * Drop System for Ateria Idle
 * Manages loot tables, drop chances, and tier progression
 */

import type { LootDrop, BiomeId, ItemRarity } from '~/entities/ateria-idle/warrior';
import type { FoodItem } from './food.data';
import { FOODS } from './food.data';
import { ALL_EQUIPMENT } from './equipment.data';
import type { Equipment } from '~/entities/ateria-idle/warrior';

// ============================================
// BIOME PROGRESSION ORDER
// ============================================

export const BIOME_ORDER: BiomeId[] = [
  'forest',   // Tier 1 (Level 1-15)
  'plains',   // Tier 2 (Level 8-22)
  'swamp',    // Tier 3 (Level 15-30)
  'desert',   // Tier 4 (Level 25-45)
  'mountains', // Tier 5 (Level 40-60)
  'volcano',  // Tier 6 (Level 55-75)
  'tundra',   // Tier 7 (Level 70-90)
  'abyss',    // Tier 8 (Level 85+)
];

export const BIOME_TIER: Record<BiomeId, number> = {
  forest: 1,
  plains: 2,
  swamp: 3,
  desert: 4,
  mountains: 5,
  volcano: 6,
  tundra: 7,
  abyss: 8,
};

// ============================================
// MONSTER TYPE DEFINITIONS
// ============================================

export type MonsterType = 'beast' | 'humanoid' | 'undead' | 'elemental' | 'demon' | 'dragon' | 'aberration';

// Which monsters are humanoid (can drop equipment)
export const HUMANOID_MONSTERS: string[] = [
  'goblin',
  'skeleton',
  'bandit',
  'bog_witch',
  'desert_raider',
  'sand_mage',
  'stone_golem', // humanoid-shaped
  'swamp_zombie',
  'warlord_khan',
  'frost_wraith',
  'ice_witch',
  'void_cultist',
  'shadow_assassin',
  'abyssal_knight',
];

// ============================================
// FOOD DROP TABLES BY TIER
// ============================================

export interface FoodDrop {
  foodId: string;
  chance: number;
  minAmount: number;
  maxAmount: number;
}

// Base food drops for all monsters
export const BASE_FOOD_DROPS: Record<number, FoodDrop[]> = {
  // Tier 1 - Basic foods
  1: [
    { foodId: 'raw_meat', chance: 0.15, minAmount: 1, maxAmount: 2 },
    { foodId: 'apple', chance: 0.08, minAmount: 1, maxAmount: 2 },
  ],
  // Tier 2
  2: [
    { foodId: 'raw_meat', chance: 0.18, minAmount: 1, maxAmount: 3 },
    { foodId: 'bread', chance: 0.08, minAmount: 1, maxAmount: 2 },
    { foodId: 'cheese', chance: 0.05, minAmount: 1, maxAmount: 1 },
  ],
  // Tier 3
  3: [
    { foodId: 'raw_meat', chance: 0.20, minAmount: 2, maxAmount: 4 },
    { foodId: 'cooked_meat', chance: 0.08, minAmount: 1, maxAmount: 2 },
    { foodId: 'fish_fillet', chance: 0.06, minAmount: 1, maxAmount: 2 },
  ],
  // Tier 4
  4: [
    { foodId: 'cooked_meat', chance: 0.12, minAmount: 1, maxAmount: 3 },
    { foodId: 'meat_pie', chance: 0.06, minAmount: 1, maxAmount: 1 },
    { foodId: 'vegetable_stew', chance: 0.05, minAmount: 1, maxAmount: 1 },
  ],
  // Tier 5
  5: [
    { foodId: 'cooked_meat', chance: 0.15, minAmount: 2, maxAmount: 4 },
    { foodId: 'hunters_feast', chance: 0.04, minAmount: 1, maxAmount: 1 },
    { foodId: 'honey_cake', chance: 0.05, minAmount: 1, maxAmount: 2 },
  ],
  // Tier 6
  6: [
    { foodId: 'roast_beast', chance: 0.08, minAmount: 1, maxAmount: 2 },
    { foodId: 'magic_fruit', chance: 0.05, minAmount: 1, maxAmount: 1 },
    { foodId: 'hunters_feast', chance: 0.06, minAmount: 1, maxAmount: 1 },
  ],
  // Tier 7
  7: [
    { foodId: 'roast_beast', chance: 0.10, minAmount: 1, maxAmount: 2 },
    { foodId: 'magic_fruit', chance: 0.08, minAmount: 1, maxAmount: 2 },
    { foodId: 'dragon_steak', chance: 0.02, minAmount: 1, maxAmount: 1 },
  ],
  // Tier 8
  8: [
    { foodId: 'dragon_steak', chance: 0.06, minAmount: 1, maxAmount: 1 },
    { foodId: 'ambrosia', chance: 0.01, minAmount: 1, maxAmount: 1 },
    { foodId: 'elixir_of_life', chance: 0.02, minAmount: 1, maxAmount: 1 },
  ],
};

// ============================================
// EQUIPMENT DROP TABLES (For humanoids)
// ============================================

export interface EquipmentDropConfig {
  tier: number;
  baseChance: number; // Base chance for ANY equipment drop
  rarityWeights: Record<ItemRarity, number>; // Relative weights
  slotWeights: Record<string, number>; // Relative weights for slots
}

export const EQUIPMENT_DROP_CONFIG: Record<number, EquipmentDropConfig> = {
  1: {
    tier: 1,
    baseChance: 0.05, // 5% chance for equipment
    rarityWeights: { common: 70, uncommon: 25, rare: 5, epic: 0, legendary: 0, mythic: 0 },
    slotWeights: { weapon: 40, armor: 30, helmet: 15, boots: 15, accessory: 0 },
  },
  2: {
    tier: 2,
    baseChance: 0.06,
    rarityWeights: { common: 50, uncommon: 35, rare: 12, epic: 3, legendary: 0, mythic: 0 },
    slotWeights: { weapon: 35, armor: 30, helmet: 15, boots: 15, accessory: 5 },
  },
  3: {
    tier: 3,
    baseChance: 0.07,
    rarityWeights: { common: 30, uncommon: 40, rare: 22, epic: 7, legendary: 1, mythic: 0 },
    slotWeights: { weapon: 32, armor: 28, helmet: 15, boots: 15, accessory: 10 },
  },
  4: {
    tier: 4,
    baseChance: 0.08,
    rarityWeights: { common: 15, uncommon: 35, rare: 32, epic: 15, legendary: 3, mythic: 0 },
    slotWeights: { weapon: 30, armor: 28, helmet: 15, boots: 15, accessory: 12 },
  },
  5: {
    tier: 5,
    baseChance: 0.09,
    rarityWeights: { common: 5, uncommon: 25, rare: 40, epic: 22, legendary: 7, mythic: 1 },
    slotWeights: { weapon: 28, armor: 27, helmet: 15, boots: 15, accessory: 15 },
  },
  6: {
    tier: 6,
    baseChance: 0.10,
    rarityWeights: { common: 0, uncommon: 15, rare: 40, epic: 30, legendary: 12, mythic: 3 },
    slotWeights: { weapon: 28, armor: 27, helmet: 15, boots: 15, accessory: 15 },
  },
  7: {
    tier: 7,
    baseChance: 0.11,
    rarityWeights: { common: 0, uncommon: 8, rare: 35, epic: 35, legendary: 18, mythic: 4 },
    slotWeights: { weapon: 28, armor: 27, helmet: 15, boots: 15, accessory: 15 },
  },
  8: {
    tier: 8,
    baseChance: 0.12,
    rarityWeights: { common: 0, uncommon: 0, rare: 25, epic: 40, legendary: 25, mythic: 10 },
    slotWeights: { weapon: 28, armor: 27, helmet: 15, boots: 15, accessory: 15 },
  },
};

// ============================================
// EQUIPMENT BY TIER HELPER
// ============================================

// Equipment tier is determined by required level ranges
const TIER_LEVEL_RANGES: Record<number, [number, number]> = {
  1: [1, 10],
  2: [10, 25],
  3: [25, 50],
  4: [50, 100],
};

function getEquipmentTier(equipment: Equipment): number {
  const level = equipment.requirements?.level || 1;
  for (const [tier, [min, max]] of Object.entries(TIER_LEVEL_RANGES)) {
    if (level >= min && level < max) return parseInt(tier);
  }
  return 4; // Default to highest tier
}

export function getEquipmentByTier(tier: number): Equipment[] {
  return ALL_EQUIPMENT.filter(e => getEquipmentTier(e) === tier);
}

// ============================================
// XP SCALING
// ============================================

/**
 * Calculate XP multiplier based on monster strength within biome
 * @param monsterLevel Monster's level
 * @param biomeLevelRange [minLevel, maxLevel] for the biome
 * @returns XP multiplier (1.0 to 2.0)
 */
export function calculateXpMultiplier(monsterLevel: number, biomeLevelRange: [number, number]): number {
  const [minLevel, maxLevel] = biomeLevelRange;
  const range = maxLevel - minLevel;
  
  if (range <= 0) return 1.0;
  
  // Position within biome (0 = weakest, 1 = strongest)
  const position = Math.max(0, Math.min(1, (monsterLevel - minLevel) / range));
  
  // Scale from 1.0 to 2.0 based on position
  return 1.0 + position;
}

// Biome level ranges
export const BIOME_LEVEL_RANGES: Record<BiomeId, [number, number]> = {
  forest: [1, 15],
  plains: [8, 22],
  swamp: [15, 30],
  desert: [25, 45],
  mountains: [40, 60],
  volcano: [55, 75],
  tundra: [70, 90],
  abyss: [85, 100],
};

// ============================================
// NEXT BIOME DROP CHANCE
// ============================================

/**
 * Chance for strong monsters to drop items from next biome
 * Only for top 25% strongest monsters in a biome
 */
export function getNextBiomeDropChance(monsterLevel: number, biome: BiomeId): number {
  const [minLevel, maxLevel] = BIOME_LEVEL_RANGES[biome];
  const threshold = minLevel + (maxLevel - minLevel) * 0.75;
  
  if (monsterLevel < threshold) return 0;
  
  // Linear scaling from 0% to 5% for the top 25%
  const position = (monsterLevel - threshold) / (maxLevel - threshold);
  return position * 0.05;
}

// ============================================
// DROP GENERATION FUNCTIONS
// ============================================

/**
 * Generate food drops for a monster
 */
export function generateFoodDrops(
  biome: BiomeId,
  monsterLevel: number,
  isStrongMonster: boolean,
): LootDrop[] {
  const tier = BIOME_TIER[biome];
  const foodDrops = BASE_FOOD_DROPS[tier] || BASE_FOOD_DROPS[1];
  const drops: LootDrop[] = [];
  
  for (const drop of foodDrops) {
    // Strong monsters have better drop rates
    const chanceMultiplier = isStrongMonster ? 1.5 : 1.0;
    const finalChance = Math.min(drop.chance * chanceMultiplier, 0.5);
    
    drops.push({
      itemId: drop.foodId,
      chance: finalChance,
      minAmount: drop.minAmount,
      maxAmount: isStrongMonster ? drop.maxAmount + 1 : drop.maxAmount,
    });
  }
  
  return drops;
}

/**
 * Generate equipment drops for humanoid monsters
 */
export function generateEquipmentDrops(
  biome: BiomeId,
  monsterLevel: number,
  isStrongMonster: boolean,
): LootDrop[] {
  const tier = BIOME_TIER[biome];
  const config = EQUIPMENT_DROP_CONFIG[tier] || EQUIPMENT_DROP_CONFIG[1];
  const drops: LootDrop[] = [];
  
  // Strong monsters have higher equipment drop chance
  const chanceMultiplier = isStrongMonster ? 1.8 : 1.0;
  const baseChance = config.baseChance * chanceMultiplier;
  
  // Get equipment for this tier (and one tier below for common drops)
  const currentTierEquipment = getEquipmentByTier(tier);
  const lowerTierEquipment = tier > 1 ? getEquipmentByTier(tier - 1) : [];
  
  // Combine with weighted selection
  const allEquipment = [
    ...currentTierEquipment.map(e => ({ ...e, tierBonus: 1.0 })),
    ...lowerTierEquipment.map(e => ({ ...e, tierBonus: 0.5 })),
  ];
  
  // Create drops from available equipment
  for (const equip of allEquipment) {
    const rarityWeight = config.rarityWeights[equip.rarity] || 0;
    const slotWeight = config.slotWeights[equip.slot] || 0;
    
    if (rarityWeight === 0 || slotWeight === 0) continue;
    
    // Calculate individual item drop chance
    const itemChance = baseChance * (rarityWeight / 100) * (slotWeight / 100) * (equip as any).tierBonus;
    
    if (itemChance > 0.001) { // Only add if chance > 0.1%
      drops.push({
        itemId: equip.id,
        chance: Math.min(itemChance, 0.15), // Cap at 15%
        minAmount: 1,
        maxAmount: 1,
        rarity: equip.rarity,
      });
    }
  }
  
  return drops;
}

/**
 * Generate potential next-biome drops for strong monsters
 */
export function generateNextBiomeDrops(
  biome: BiomeId,
  monsterLevel: number,
): LootDrop[] {
  const currentTier = BIOME_TIER[biome];
  const nextTier = currentTier + 1;
  
  if (nextTier > 8) return [];
  
  const chance = getNextBiomeDropChance(monsterLevel, biome);
  if (chance <= 0) return [];
  
  // Get some materials from next tier
  const nextBiomeMaterials = getNextBiomeMaterials(nextTier);
  
  return nextBiomeMaterials.map(itemId => ({
    itemId,
    chance: chance * 0.5, // Half the base chance per item
    minAmount: 1,
    maxAmount: 1,
    rarity: 'rare' as ItemRarity,
  }));
}

// Helper to get key materials from next biome
function getNextBiomeMaterials(tier: number): string[] {
  const materials: Record<number, string[]> = {
    2: ['bandit_insignia', 'horse_hair'],
    3: ['swamp_herbs', 'toxic_gland'],
    4: ['desert_glass', 'scarab_shell'],
    5: ['mountain_ore', 'crystal_shard'],
    6: ['fire_essence', 'volcanic_glass'],
    7: ['eternal_ice', 'wraith_essence'],
    8: ['void_essence', 'shadow_crystal'],
  };
  return materials[tier] || [];
}

// ============================================
// MAIN DROP GENERATION
// ============================================

export interface GeneratedDropTable {
  materialDrops: LootDrop[];
  foodDrops: LootDrop[];
  equipmentDrops: LootDrop[];
  nextBiomeDrops: LootDrop[];
  xpMultiplier: number;
}

/**
 * Generate complete drop table for a monster
 */
export function generateMonsterDropTable(
  monsterId: string,
  biome: BiomeId,
  monsterLevel: number,
  baseLootTable: LootDrop[],
): GeneratedDropTable {
  const isHumanoid = HUMANOID_MONSTERS.includes(monsterId);
  const levelRange = BIOME_LEVEL_RANGES[biome];
  const isStrongMonster = monsterLevel >= levelRange[0] + (levelRange[1] - levelRange[0]) * 0.5;
  
  return {
    materialDrops: baseLootTable, // Keep original material drops
    foodDrops: generateFoodDrops(biome, monsterLevel, isStrongMonster),
    equipmentDrops: isHumanoid ? generateEquipmentDrops(biome, monsterLevel, isStrongMonster) : [],
    nextBiomeDrops: generateNextBiomeDrops(biome, monsterLevel),
    xpMultiplier: calculateXpMultiplier(monsterLevel, levelRange),
  };
}

/**
 * Roll for drops based on loot table
 */
export function rollDrops(lootTable: LootDrop[], luckBonus: number = 0): { itemId: string; amount: number }[] {
  const drops: { itemId: string; amount: number }[] = [];
  
  for (const drop of lootTable) {
    // Apply luck bonus to chance (max +50% chance)
    const finalChance = Math.min(drop.chance * (1 + luckBonus / 100), drop.chance + 0.5);
    
    if (Math.random() < finalChance) {
      const amount = Math.floor(
        Math.random() * (drop.maxAmount - drop.minAmount + 1) + drop.minAmount
      );
      drops.push({ itemId: drop.itemId, amount });
    }
  }
  
  return drops;
}

/**
 * Calculate final XP reward
 */
export function calculateFinalXp(baseXp: number, monsterLevel: number, biome: BiomeId): number {
  const multiplier = calculateXpMultiplier(monsterLevel, BIOME_LEVEL_RANGES[biome]);
  return Math.floor(baseXp * multiplier);
}
