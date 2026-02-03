/**
 * Scientist path types
 * Includes research, alchemy, and golem automation
 */

// ============================================
// CORE STATS
// ============================================

export interface ScientistStats {
  level: number;
  xp: import('~/shared/lib/big-number').Decimal;
  xpToNextLevel: import('~/shared/lib/big-number').Decimal;

  // Skill stats
  intellect: number;
  efficiency: number;
  creativity: number;

  // Multipliers
  researchSpeedMultiplier: number;
  potionQualityMultiplier: number;
  golemEfficiencyMultiplier: number;
}

// ============================================
// FLASK SYSTEM
// ============================================

export type FlaskType = 'red' | 'green' | 'blue';

export interface FlaskState {
  red: number;
  green: number;
  blue: number;
  redPerSecond: number;
  greenPerSecond: number;
  bluePerSecond: number;
}

export interface FlaskGenerator {
  id: string;
  name: string;
  type: FlaskType;
  level: number;
  baseProduction: number;
  upgradeCost: number;
  unlocked: boolean;
}

// ============================================
// RESEARCH SYSTEM
// ============================================

export type ResearchCategory =
  | 'combat'
  | 'alchemy'
  | 'automation'
  | 'efficiency'
  | 'trading'
  | 'magic';

export interface Research {
  id: string;
  name: string;
  description: string;
  category: ResearchCategory;
  icon: string;

  // Requirements
  requiredLevel: number;
  requiredResearch: string[]; // IDs of prerequisite research
  requiredFlasks: {
    red?: number;
    green?: number;
    blue?: number;
  };

  // Progress
  maxLevel: number;
  baseCost: number;
  costMultiplier: number;
  softCapLevel: number;

  // Effects
  effects: ResearchEffect[];
}

export interface ResearchEffect {
  type: ResearchEffectType;
  target: string;
  value: number;
  valuePerLevel: number;
}

export type ResearchEffectType =
  | 'stat_bonus' // +X% to a stat
  | 'production_bonus' // +X% production
  | 'cost_reduction' // -X% costs
  | 'unlock_feature' // Unlock something
  | 'flask_production' // +X flask/sec
  | 'golem_slot' // +1 golem slot
  | 'potion_slot' // +1 potion slot
  | 'speed_bonus'; // +X% speed

export interface ResearchProgress {
  researchId: string;
  currentLevel: number;
  currentProgress: number; // Progress to next level (0-1)
  isActive: boolean;
}

// ============================================
// ALCHEMY SYSTEM
// ============================================

export type IngredientCategory = 'herb' | 'mineral' | 'essence' | 'monster_part' | 'special';

export interface Ingredient {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: IngredientCategory;
  tier: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface PotionRecipe {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: number;

  // Requirements
  ingredients: { ingredientId: string; amount: number }[];
  requiredLevel: number;
  requiredResearch?: string;

  // Production
  craftTime: number; // Ticks to produce
  outputAmount: number;

  // Effects when consumed
  effects: PotionEffect[];

  // Discovery
  discovered: boolean;
  discoveryHint?: string;
}

export interface PotionEffect {
  type: PotionEffectType;
  value: number;
  duration?: number; // Ticks, undefined = instant
}

export type PotionEffectType =
  | 'heal_hp' // Restore X HP
  | 'heal_percent' // Restore X% HP
  | 'buff_attack' // +X% attack
  | 'buff_defense' // +X% defense
  | 'buff_speed' // +X% speed
  | 'buff_crit' // +X% crit
  | 'buff_xp' // +X% XP gain
  | 'buff_gold' // +X% gold
  | 'buff_loot' // +X% loot chance
  | 'regen_hp' // +X HP/tick
  | 'remove_debuff' // Remove negative effects
  | 'resist_element'; // Resist elemental damage

export interface PotionInventory {
  potionId: string;
  amount: number;
}

export interface PotionAllocation {
  potionId: string;
  warriorPercent: number; // % going to warrior
  shopPercent: number; // % going to shop
  minWarriorReserve: number; // Minimum to keep for warrior
}

export type AllocationMode = 'balanced' | 'war_priority' | 'profit_priority';

export interface AlchemyLab {
  level: number;
  maxProductionSlots: number;
  productionSlots: ProductionSlot[];
  discoveredRecipes: string[];
  ingredientStorage: { [ingredientId: string]: number };
}

export interface ProductionSlot {
  slotId: number;
  recipeId: string | null;
  progress: number; // 0-1
  isActive: boolean;
  autoRepeat: boolean;
}

// ============================================
// GOLEM SYSTEM
// ============================================

export type GolemType = 'mining' | 'hauling' | 'combat' | 'research' | 'alchemy';

export interface Golem {
  id: string;
  name: string;
  type: GolemType;
  level: number;

  // Stats
  integrity: number; // 0-100%
  maxIntegrity: number;
  efficiency: number; // Base efficiency multiplier
  speed: number; // Work speed

  // State
  state: GolemState;
  currentTask: string | null;
  taskProgress: number;

  // Upgrades
  upgrades: string[];
}

export type GolemState = 'idle' | 'working' | 'damaged' | 'repairing' | 'disabled';

export interface GolemBlueprint {
  id: string;
  name: string;
  description: string;
  type: GolemType;
  icon: string;

  // Requirements
  requiredLevel: number;
  requiredResearch?: string;
  craftCost: GolemCraftCost;

  // Base stats
  baseIntegrity: number;
  baseEfficiency: number;
  baseSpeed: number;

  // Work parameters
  integrityDecayRate: number; // %/hour
  repairCost: GolemRepairCost;

  // Effects
  workEffect: GolemWorkEffect;
}

export interface GolemCraftCost {
  gold?: number;
  materials: { itemId: string; amount: number }[];
  flasks?: { red?: number; green?: number; blue?: number };
}

export interface GolemRepairCost {
  materials: { itemId: string; amount: number }[];
  flasks?: { red?: number; green?: number; blue?: number };
}

export interface GolemWorkEffect {
  type: GolemWorkType;
  target?: string;
  baseValue: number;
}

export type GolemWorkType =
  | 'produce_resource' // Generate resources over time
  | 'boost_production' // +X% to production
  | 'auto_transfer' // Move items between storages
  | 'combat_support' // Help in combat
  | 'research_assist' // Speed up research
  | 'alchemy_assist'; // Speed up alchemy

export interface GolemUpgrade {
  id: string;
  name: string;
  description: string;
  golemTypes: GolemType[]; // Which golem types can use this
  icon: string;

  // Requirements
  requiredLevel: number;
  requiredResearch?: string;
  cost: GolemCraftCost;

  // Effects
  effects: GolemUpgradeEffect[];
}

export interface GolemUpgradeEffect {
  type: 'integrity' | 'efficiency' | 'speed' | 'decay_reduction' | 'special';
  value: number;
  description?: string;
}

// ============================================
// WORKSHOP
// ============================================

export interface Workshop {
  level: number;
  maxGolemSlots: number;
  golems: Golem[];
  autoRepairEnabled: boolean;
  autoRepairThreshold: number; // Repair when integrity below X%
}
