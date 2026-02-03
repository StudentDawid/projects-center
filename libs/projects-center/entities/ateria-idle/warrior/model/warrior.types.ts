/**
 * Warrior path types for Ateria Idle
 */

import type { Decimal } from 'break_infinity.js';

// ============================================
// WARRIOR STATS
// ============================================

export interface WarriorStats {
  // Core stats
  level: number;
  xp: Decimal;
  xpToNextLevel: Decimal;

  // Combat stats
  maxHp: number;
  currentHp: number;
  attack: number;
  defense: number;
  accuracy: number;
  evasion: number;
  critChance: number; // 0-1
  critMultiplier: number;

  // Derived stats (calculated)
  dps: number;
  damageReduction: number; // 0-1

  // Regeneration
  hpRegen: number; // per second (out of combat)
  vitalityBonus: number; // multiplier
}

// ============================================
// EQUIPMENT
// ============================================

export type EquipmentSlot = 'weapon' | 'armor' | 'helmet' | 'boots' | 'accessory';

export interface Equipment {
  id: string;
  name: string;
  slot: EquipmentSlot;
  rarity: ItemRarity;
  stats: Partial<EquipmentStats>;
  requirements: EquipmentRequirements;
  enchantment?: Enchantment;
}

export interface EquipmentStats {
  attack: number;
  defense: number;
  accuracy: number;
  evasion: number;
  critChance: number;
  critMultiplier: number;
  maxHp: number;
  hpRegen: number;
}

export interface EquipmentRequirements {
  level?: number;
  slayerLevel?: number;
  biomeCleared?: BiomeId;
}

export interface Enchantment {
  id: string;
  name: string;
  tier: number;
  effect: EnchantmentEffect;
}

export interface EnchantmentEffect {
  type: 'flat_bonus' | 'percent_bonus' | 'special';
  stat?: keyof EquipmentStats;
  value: number;
  special?: string; // e.g., "lifesteal", "poison_immunity"
}

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

// ============================================
// COMBAT
// ============================================

export type CombatState = 'idle' | 'fighting' | 'recovering' | 'dead';

export interface CombatInstance {
  state: CombatState;
  currentEnemy: Monster | null;
  currentBiome: BiomeId;
  ticksInCombat: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  killCount: number;
}

export interface CombatResult {
  victory: boolean;
  damageDealt: number;
  damageTaken: number;
  xpGained: number;
  loot: LootDrop[];
  criticalHits: number;
  dodges: number;
}

export interface LootDrop {
  itemId: string;
  amount: number;
  rarity?: ItemRarity;
}

// ============================================
// MONSTERS
// ============================================

export type BiomeId = 'forest' | 'plains' | 'swamp' | 'desert' | 'mountains' | 'volcano' | 'tundra' | 'abyss';

export interface Monster {
  id: string;
  name: string;
  biome: BiomeId;
  level: number;

  // Stats
  maxHp: number;
  currentHp: number;
  attack: number;
  defense: number;
  accuracy: number;
  evasion: number;
  attackSpeed: number; // ticks between attacks

  // Rewards
  xpReward: number;
  goldReward: { min: number; max: number };
  lootTable: LootTableEntry[];

  // Special
  abilities?: MonsterAbility[];
  immunities?: string[];
  weaknesses?: string[];

  // Slayer
  slayerCategory?: SlayerCategory;
  slayerXpReward?: number;
}

export interface LootTableEntry {
  itemId: string;
  chance: number; // 0-1
  minAmount: number;
  maxAmount: number;
  rarity?: ItemRarity;
}

export interface MonsterAbility {
  id: string;
  name: string;
  type: 'passive' | 'active';
  effect: AbilityEffect;
  cooldown?: number; // ticks
}

export interface AbilityEffect {
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'special';
  value: number;
  duration?: number; // ticks
  target: 'self' | 'enemy';
}

// ============================================
// BIOMES
// ============================================

export interface Biome {
  id: BiomeId;
  name: string;
  description: string;
  icon: string;
  color: string;

  // Requirements
  requiredLevel: number;
  requiredEquipment?: string[];

  // Debuffs
  environmentalEffect?: EnvironmentalEffect;

  // Monsters
  monsterIds: string[];
  bossId?: string;

  // Rewards
  uniqueLoot: string[];
}

export interface EnvironmentalEffect {
  id: string;
  name: string;
  description: string;
  effect: {
    type: 'damage_over_time' | 'stat_debuff' | 'resource_drain';
    stat?: keyof WarriorStats;
    value: number;
    tickInterval?: number;
  };
  mitigation?: {
    itemId?: string;
    potionId?: string;
    researchId?: string;
  };
}

// ============================================
// SLAYER SYSTEM
// ============================================

export type SlayerCategory = 'undead' | 'beast' | 'demon' | 'elemental' | 'dragon' | 'aberration';

export interface SlayerTask {
  id: string;
  category: SlayerCategory;
  targetMonsterId: string;
  targetCount: number;
  currentCount: number;
  reward: SlayerReward;
  expiresAt?: number;
}

export interface SlayerReward {
  slayerCoins: number;
  xp: number;
  bonusLoot?: LootDrop[];
}

export interface SlayerProgress {
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalCoins: number;
  currentTask: SlayerTask | null;
  completedTasks: number;
  categoryKills: Record<SlayerCategory, number>;
}

// ============================================
// DUNGEONS
// ============================================

export interface Dungeon {
  id: string;
  name: string;
  description: string;
  tier: number;
  icon: string;

  // Requirements
  requiredLevel: number;
  keyItemId: string;
  keyCost: number;

  // Structure
  waves: DungeonWave[];
  boss: Monster;

  // Rewards
  completionRewards: LootDrop[];
  firstClearBonus?: LootDrop[];
}

export interface DungeonWave {
  monsters: string[]; // monster IDs
  count: number;
}

export interface DungeonRun {
  dungeonId: string;
  currentWave: number;
  monstersKilledInWave: number;
  totalMonstersKilled: number;
  startTime: number;
  loot: LootDrop[];
  deaths: number;
}

// ============================================
// DEATH & RECOVERY
// ============================================

export interface DeathPenalty {
  lootLostPercent: number; // 0-1
  recoveryTime: number; // seconds
  foodConsumed: number;
}

export interface RecoveryState {
  isRecovering: boolean;
  recoveryStartTime: number;
  recoveryEndTime: number;
  deathLocation: BiomeId;
}

// ============================================
// FOOD SYSTEM
// ============================================

export interface FoodItem {
  id: string;
  name: string;
  icon: string;
  healAmount: number;
  healPercent?: number; // alternative: heal % of max HP
  cooldown: number; // ticks between uses
  autoUseThreshold: number; // HP% to auto-use (0-1)
}

export interface FoodInventory {
  equipped: FoodItem | null;
  autoEatEnabled: boolean;
  autoEatThreshold: number; // 0-1
  stock: Record<string, number>; // itemId -> count
}

// ============================================
// POTIONS (from Scientist)
// ============================================

export interface CombatPotion {
  id: string;
  name: string;
  icon: string;
  effect: PotionEffect;
  duration: number; // ticks
  cooldown: number; // ticks
  autoUseEnabled: boolean;
}

export interface PotionEffect {
  type: 'heal' | 'buff' | 'special';
  stat?: keyof WarriorStats;
  value: number;
  isPercent?: boolean;
}

export interface ActivePotionEffect {
  potionId: string;
  effect: PotionEffect;
  remainingTicks: number;
  startTick: number;
}
