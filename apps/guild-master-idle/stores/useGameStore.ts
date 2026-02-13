import { defineStore } from 'pinia';

// ============================================
// Types
// ============================================
export interface ResourceState {
  gold: number;
  goldMax: number;
  wood: number;
  woodMax: number;
  stone: number;
  stoneMax: number;
  metal: number;
  metalMax: number;
  mana: number;
  manaMax: number;
  manaRegen: number;
  goldIncome: number;
}

export interface MiningOperation {
  level: number;
  workers: number;
  maxWorkers: number;
  baseRate: number;
  workerCost: number;
  upgradeCost: { gold: number; stone: number };
  /** Amount gained per manual click */
  clickAmount: number;
}

// ============================================
// Combat system types
// ============================================
export type Position = 'front' | 'middle' | 'back';
export type EntityState = 'healthy' | 'injured' | 'poisoned' | 'tired' | 'seriously_injured';
export type HeroClass = 'warrior' | 'mage' | 'ranger' | 'cleric' | 'thief';

export interface CombatStats {
  atk: number;
  def: number;
  mAtk: number;
  mDef: number;
  hp: number;
  currentHp: number;
  spd: number;
  spt: Position;
  state: EntityState;
}

export interface Trait {
  id: string;
  nameKey: string;
  descKey: string;
  icon: string;
}

export interface GuildStats {
  /** Bag capacity — item slots per expedition */
  cap: number;
  /** Luck bonus — better drop chances */
  lck: number;
  /** Training efficiency multiplier (1.0 = base) */
  te: number;
}

// ============================================
// Trait definitions
// ============================================
export const TRAITS: Record<string, Trait> = {
  provocation: { id: 'provocation', nameKey: 'traits.provocation', descKey: 'traits.provocationDesc', icon: '🛡️' },
  arcane_surge: { id: 'arcane_surge', nameKey: 'traits.arcaneSurge', descKey: 'traits.arcaneSurgeDesc', icon: '✨' },
  heal: { id: 'heal', nameKey: 'traits.heal', descKey: 'traits.healDesc', icon: '💚' },
  precision_shot: { id: 'precision_shot', nameKey: 'traits.precisionShot', descKey: 'traits.precisionShotDesc', icon: '🎯' },
  shadow_strike: { id: 'shadow_strike', nameKey: 'traits.shadowStrike', descKey: 'traits.shadowStrikeDesc', icon: '🌑' },
};

// ============================================
// Equipment system types
// ============================================
export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'divine';
export type EquipmentSlotType = 'rightHand' | 'leftHand' | 'armor' | 'helmet' | 'boots' | 'accessory';

export interface RarityConfig {
  multiplier: number;
  affixCount: number;
  maxLevel: number;
  color: string;
  nameKey: string;
}

export const RARITY_CONFIG: Record<ItemRarity, RarityConfig> = {
  common:    { multiplier: 1,   affixCount: 0, maxLevel: 10,  color: '#9e9e9e', nameKey: 'equipment.rarityCommon' },
  rare:      { multiplier: 1.5, affixCount: 1, maxLevel: 15,  color: '#42a5f5', nameKey: 'equipment.rarityRare' },
  epic:      { multiplier: 2.5, affixCount: 2, maxLevel: 25,  color: '#ab47bc', nameKey: 'equipment.rarityEpic' },
  legendary: { multiplier: 5,   affixCount: 3, maxLevel: 50,  color: '#ffa726', nameKey: 'equipment.rarityLegendary' },
  divine:    { multiplier: 10,  affixCount: 4, maxLevel: 100, color: '#ef5350', nameKey: 'equipment.rarityDivine' },
};

export interface ItemAffix {
  id: string;
  nameKey: string;
  stat: string;
  baseValue: number;
}

export const ITEM_AFFIXES: ItemAffix[] = [
  { id: 'sharpness',  nameKey: 'equipment.affixSharpness',  stat: 'atk',  baseValue: 3 },
  { id: 'wisdom',     nameKey: 'equipment.affixWisdom',     stat: 'mAtk', baseValue: 3 },
  { id: 'hardness',   nameKey: 'equipment.affixHardness',   stat: 'def',  baseValue: 3 },
  { id: 'resistance', nameKey: 'equipment.affixResistance', stat: 'mDef', baseValue: 3 },
  { id: 'wind',       nameKey: 'equipment.affixWind',       stat: 'spd',  baseValue: 2 },
  { id: 'luck',       nameKey: 'equipment.affixLuck',       stat: 'lck',  baseValue: 2 },
  { id: 'vitality',   nameKey: 'equipment.affixVitality',   stat: 'hp',   baseValue: 10 },
];

export interface ItemBaseTemplate {
  id: string;
  nameKey: string;
  slot: EquipmentSlotType;
  icon: string;
  baseStats: Record<string, number>;
  baseCost: number;
}

export const ITEM_TEMPLATES: ItemBaseTemplate[] = [
  // Right hand
  { id: 'sword',  nameKey: 'equipment.sword',  slot: 'rightHand', icon: '🗡️', baseStats: { atk: 5, spd: 1 }, baseCost: 20 },
  { id: 'staff',  nameKey: 'equipment.staff',  slot: 'rightHand', icon: '🪄',  baseStats: { mAtk: 6 }, baseCost: 25 },
  { id: 'dagger', nameKey: 'equipment.dagger', slot: 'rightHand', icon: '🔪', baseStats: { atk: 3, spd: 3 }, baseCost: 18 },
  { id: 'mace',   nameKey: 'equipment.mace',   slot: 'rightHand', icon: '🔨', baseStats: { atk: 7 }, baseCost: 22 },
  { id: 'bow',    nameKey: 'equipment.bow',    slot: 'rightHand', icon: '🏹', baseStats: { atk: 4, spd: 2 }, baseCost: 20 },
  // Left hand
  { id: 'shield',  nameKey: 'equipment.shield',  slot: 'leftHand', icon: '🛡️', baseStats: { def: 5, mDef: 2 }, baseCost: 20 },
  { id: 'tome',    nameKey: 'equipment.tome',    slot: 'leftHand', icon: '📖', baseStats: { mAtk: 3, mDef: 3 }, baseCost: 22 },
  { id: 'buckler', nameKey: 'equipment.buckler', slot: 'leftHand', icon: '🔰', baseStats: { def: 3, spd: 1 }, baseCost: 16 },
  // Armor
  { id: 'plate_armor',  nameKey: 'equipment.plateArmor',  slot: 'armor', icon: '🦺', baseStats: { def: 8, mDef: 2 }, baseCost: 30 },
  { id: 'leather_armor', nameKey: 'equipment.leatherArmor', slot: 'armor', icon: '🧥', baseStats: { def: 4, spd: 2 }, baseCost: 22 },
  { id: 'robe',          nameKey: 'equipment.robe',         slot: 'armor', icon: '👘', baseStats: { mDef: 5, mAtk: 2 }, baseCost: 24 },
  // Helmet
  { id: 'iron_helm',   nameKey: 'equipment.ironHelm',   slot: 'helmet', icon: '⛑️', baseStats: { def: 4, hp: 10 }, baseCost: 18 },
  { id: 'wizard_hat',  nameKey: 'equipment.wizardHat',  slot: 'helmet', icon: '🎩', baseStats: { mAtk: 3, mDef: 2 }, baseCost: 20 },
  // Boots
  { id: 'iron_boots',   nameKey: 'equipment.ironBoots',   slot: 'boots', icon: '🥾', baseStats: { def: 2, spd: 2 }, baseCost: 15 },
  { id: 'swift_boots',  nameKey: 'equipment.swiftBoots',  slot: 'boots', icon: '👟', baseStats: { spd: 5 }, baseCost: 18 },
  // Accessory
  { id: 'ring',    nameKey: 'equipment.ring',    slot: 'accessory', icon: '💍', baseStats: { mAtk: 2, mDef: 2 }, baseCost: 20 },
  { id: 'amulet',  nameKey: 'equipment.amulet',  slot: 'accessory', icon: '📿', baseStats: { hp: 15, def: 1 }, baseCost: 22 },
  { id: 'cloak',   nameKey: 'equipment.cloak',   slot: 'accessory', icon: '🧣', baseStats: { spd: 2, mDef: 2 }, baseCost: 18 },
];

/** Salvage yield per rarity: [metalScrapsMin, metalScrapsMax, magicDustMin, magicDustMax] */
export const SALVAGE_YIELDS: Record<ItemRarity, [number, number, number, number]> = {
  common:    [1, 2, 0, 1],
  rare:      [3, 5, 2, 3],
  epic:      [8, 12, 5, 8],
  legendary: [20, 30, 15, 20],
  divine:    [50, 80, 40, 60],
};

export interface EquipmentItem {
  uid: string;
  templateId: string;
  nameKey: string;
  slot: EquipmentSlotType;
  rarity: ItemRarity;
  level: number;
  maxLevel: number;
  baseStats: Record<string, number>;
  statMultiplier: number;
  affixes: ItemAffix[];
  baseCost: number;
  icon: string;
}

export interface HeroEquipment {
  rightHand: EquipmentItem | null;
  leftHand: EquipmentItem | null;
  armor: EquipmentItem | null;
  helmet: EquipmentItem | null;
  boots: EquipmentItem | null;
  accessory: EquipmentItem | null;
}

// ============================================
// Hero types
// ============================================
export interface GuildHero {
  id: number;
  name: string;
  heroClass: HeroClass;
  classKey: string;
  emoji: string;
  color: string;
  stats: CombatStats;
  traits: Trait[];
  equipment: HeroEquipment;
}

export interface TavernHero extends GuildHero {
  cost: number;
}

export type MiningKey = 'woodcamp' | 'quarry' | 'forge';

export interface MiningState {
  woodcamp: MiningOperation;
  quarry: MiningOperation;
  forge: MiningOperation;
}

export interface MarketPrices {
  wood: number;
  stone: number;
  metal: number;
}

export type NavId = 'tavern' | 'grand-hall' | 'resources' | 'quests' | 'market' | 'research' | 'achievements' | 'upgrades' | 'blacksmith' | 'profile';

export interface UpgradeNode {
  id: string;
  nameKey: string;
  descKey: string;
  icon: string;
  cost: { gold: number; wood: number; stone: number; metal: number };
  requires: string[];
  purchased: boolean;
  /** Row in the tree (0-indexed) */
  row: number;
  /** Column in the tree (0-indexed) */
  col: number;
}

export interface TavernUpgradeItem {
  id: string;
  nameKey: string;
  descKey: string;
  icon: string;
  cost: { gold: number; wood: number; stone: number };
  purchased: boolean;
  /** Effect applied on purchase */
  effectKey: string;
}

export interface AchievementReward {
  type: 'gold' | 'wood' | 'stone' | 'metal' | 'mana' | 'woodMax' | 'stoneMax' | 'metalMax' | 'manaMax' | 'goldIncome' | 'manaRegen' | 'maxHeroes';
  amount: number;
}

export interface Achievement {
  id: string;
  /** i18n key for name */
  nameKey: string;
  /** i18n key for description */
  descKey: string;
  /** i18n key for reward text */
  rewardKey: string;
  icon: string;
  completed: boolean;
  /** Timestamp when completed */
  completedAt: number | null;
  /** Check function name (mapped internally) */
  checkId: string;
  /** Rewards granted on completion */
  rewards: AchievementReward[];
}

// ============================================
// Store
// ============================================
export const useGameStore = defineStore('game', {
  state: () => ({
    // --- Nav unlock system ---
    unlockedNavs: ['tavern', 'resources', 'market', 'upgrades', 'profile'] as NavId[],

    // --- Right sidebar lock ---
    rightSidebarUnlocked: false,
    // --- Player resources ---
    resources: {
      gold: 0,
      goldMax: 50000,
      wood: 0,
      woodMax: 100,
      stone: 0,
      stoneMax: 100,
      metal: 0,
      metalMax: 50,
      mana: 0,
      manaMax: 100,
      manaRegen: 0,
      goldIncome: 0,
    } as ResourceState,

    // --- Mining ---
    mining: {
      woodcamp: {
        level: 1,
        workers: 0,
        maxWorkers: 3,
        baseRate: 4,
        workerCost: 50,
        upgradeCost: { gold: 200, stone: 100 },
        clickAmount: 1,
      },
      quarry: {
        level: 1,
        workers: 0,
        maxWorkers: 3,
        baseRate: 3,
        workerCost: 80,
        upgradeCost: { gold: 350, stone: 0 },
        clickAmount: 1,
      },
      forge: {
        level: 0,
        workers: 0,
        maxWorkers: 2,
        baseRate: 2,
        workerCost: 120,
        upgradeCost: { gold: 500, stone: 200 },
        clickAmount: 1,
      },
    } as MiningState,

    // --- Units ---
    units: {
      novices: 0,
      guards: 0,
    },

    // --- Buildings ---
    buildings: {
      dormLevel: 1,
    },

    // --- Guild stats (shared across all expeditions) ---
    guildStats: {
      cap: 5,
      lck: 0,
      te: 1.0,
    } as GuildStats,

    // --- Heroes ---
    tavernHeroes: [
      {
        id: 1, name: 'Brom the Bold', heroClass: 'warrior' as HeroClass, classKey: 'tavern.classWarrior', emoji: '🗡️', color: 'red', cost: 200,
        stats: { atk: 14, def: 12, mAtk: 3, mDef: 6, hp: 120, currentHp: 120, spd: 6, spt: 'front' as Position, state: 'healthy' as EntityState },
        traits: [TRAITS.provocation],
        equipment: { rightHand: null, leftHand: null, armor: null, helmet: null, boots: null, accessory: null } as HeroEquipment,
      },
      {
        id: 2, name: 'Elara Moonwhisper', heroClass: 'mage' as HeroClass, classKey: 'tavern.classMage', emoji: '🔮', color: 'purple', cost: 350,
        stats: { atk: 4, def: 5, mAtk: 18, mDef: 10, hp: 70, currentHp: 70, spd: 8, spt: 'back' as Position, state: 'healthy' as EntityState },
        traits: [TRAITS.arcane_surge],
        equipment: { rightHand: null, leftHand: null, armor: null, helmet: null, boots: null, accessory: null } as HeroEquipment,
      },
      {
        id: 3, name: 'Fenris Shadowstep', heroClass: 'ranger' as HeroClass, classKey: 'tavern.classRanger', emoji: '🏹', color: 'green', cost: 280,
        stats: { atk: 13, def: 6, mAtk: 4, mDef: 5, hp: 80, currentHp: 80, spd: 14, spt: 'back' as Position, state: 'healthy' as EntityState },
        traits: [TRAITS.precision_shot],
        equipment: { rightHand: null, leftHand: null, armor: null, helmet: null, boots: null, accessory: null } as HeroEquipment,
      },
      {
        id: 4, name: 'Sister Miriel', heroClass: 'cleric' as HeroClass, classKey: 'tavern.classCleric', emoji: '✝️', color: 'amber', cost: 300,
        stats: { atk: 6, def: 8, mAtk: 12, mDef: 14, hp: 90, currentHp: 90, spd: 7, spt: 'middle' as Position, state: 'healthy' as EntityState },
        traits: [TRAITS.heal],
        equipment: { rightHand: null, leftHand: null, armor: null, helmet: null, boots: null, accessory: null } as HeroEquipment,
      },
      {
        id: 5, name: 'Kael Nightblade', heroClass: 'thief' as HeroClass, classKey: 'tavern.classThief', emoji: '🔪', color: 'grey-darken-2', cost: 260,
        stats: { atk: 12, def: 5, mAtk: 3, mDef: 4, hp: 75, currentHp: 75, spd: 16, spt: 'middle' as Position, state: 'healthy' as EntityState },
        traits: [TRAITS.shadow_strike],
        equipment: { rightHand: null, leftHand: null, armor: null, helmet: null, boots: null, accessory: null } as HeroEquipment,
      },
    ] as TavernHero[],
    guildHeroes: [] as GuildHero[],
    maxHeroes: 0,

    // --- Inventory & crafting materials ---
    inventory: [] as EquipmentItem[],
    metalScraps: 0,
    magicDust: 0,
    /** Auto-incrementing UID for items */
    _nextItemUid: 1,

    // --- Tavern upgrades ---
    tavernUpgrades: {
      beds: 0,
      bedCosts: [20, 50, 120, 300, 750] as number[],
      items: [
        { id: 'quest_board', nameKey: 'tavern.questBoard', descKey: 'tavern.questBoardDesc', icon: '📋', cost: { gold: 100, wood: 30, stone: 0 }, purchased: false, effectKey: 'quest_board' },
        { id: 'storage_chest', nameKey: 'tavern.storageChest', descKey: 'tavern.storageChestDesc', icon: '📦', cost: { gold: 80, wood: 20, stone: 10 }, purchased: false, effectKey: 'storage_chest' },
        { id: 'warehouse', nameKey: 'tavern.warehouse', descKey: 'tavern.warehouseDesc', icon: '🏗️', cost: { gold: 250, wood: 100, stone: 80 }, purchased: false, effectKey: 'warehouse' },
      ] as TavernUpgradeItem[],
    },

    // --- Upgrade tree ---
    upgradeTree: [
      // Row 0 — root
      { id: 'found_guild', nameKey: 'upgrades.foundGuild', descKey: 'upgrades.foundGuildDesc', icon: '🏛️', cost: { gold: 0, wood: 0, stone: 0, metal: 0 }, requires: [], purchased: false, row: 0, col: 1 },
      // Row 1 — branches from root
      { id: 'hero_quarters', nameKey: 'upgrades.heroQuarters', descKey: 'upgrades.heroQuartersDesc', icon: '🛏️', cost: { gold: 100, wood: 50, stone: 0, metal: 0 }, requires: ['found_guild'], purchased: false, row: 1, col: 0 },
      { id: 'quest_license', nameKey: 'upgrades.questLicense', descKey: 'upgrades.questLicenseDesc', icon: '📜', cost: { gold: 150, wood: 0, stone: 0, metal: 0 }, requires: ['found_guild'], purchased: false, row: 1, col: 2 },
      // Row 2
      { id: 'training_grounds', nameKey: 'upgrades.trainingGrounds', descKey: 'upgrades.trainingGroundsDesc', icon: '⚔️', cost: { gold: 300, wood: 80, stone: 60, metal: 0 }, requires: ['hero_quarters'], purchased: false, row: 2, col: 0 },
      { id: 'trade_routes', nameKey: 'upgrades.tradeRoutes', descKey: 'upgrades.tradeRoutesDesc', icon: '🛤️', cost: { gold: 200, wood: 0, stone: 30, metal: 0 }, requires: ['quest_license'], purchased: false, row: 2, col: 2 },
      // Row 3 — merges
      { id: 'guild_vault', nameKey: 'upgrades.guildVault', descKey: 'upgrades.guildVaultDesc', icon: '💎', cost: { gold: 500, wood: 0, stone: 200, metal: 50 }, requires: ['training_grounds', 'trade_routes'], purchased: false, row: 3, col: 1 },
      // Row 4
      { id: 'arcane_tower', nameKey: 'upgrades.arcaneTower', descKey: 'upgrades.arcaneTowerDesc', icon: '🔮', cost: { gold: 800, wood: 100, stone: 150, metal: 80 }, requires: ['guild_vault'], purchased: false, row: 4, col: 0 },
      { id: 'fortifications', nameKey: 'upgrades.fortifications', descKey: 'upgrades.fortificationsDesc', icon: '🏰', cost: { gold: 600, wood: 150, stone: 300, metal: 100 }, requires: ['guild_vault'], purchased: false, row: 4, col: 2 },
      // Row 5
      { id: 'grand_guild_hall', nameKey: 'upgrades.grandGuildHall', descKey: 'upgrades.grandGuildHallDesc', icon: '👑', cost: { gold: 2000, wood: 500, stone: 500, metal: 200 }, requires: ['arcane_tower', 'fortifications'], purchased: false, row: 5, col: 1 },
    ] as UpgradeNode[],

    // --- Market ---
    marketPrices: {
      wood: 1,
      stone: 2,
      metal: 3,
    } as MarketPrices,

    // --- Achievements ---
    achievements: [
      // Resource milestones
      { id: 'wood_100', nameKey: 'achievements.wood100', descKey: 'achievements.wood100Desc', rewardKey: 'achievements.wood100Reward', icon: '🪵', completed: false, completedAt: null, checkId: 'wood_100', rewards: [{ type: 'gold', amount: 50 }] },
      { id: 'wood_500', nameKey: 'achievements.wood500', descKey: 'achievements.wood500Desc', rewardKey: 'achievements.wood500Reward', icon: '🪵', completed: false, completedAt: null, checkId: 'wood_500', rewards: [{ type: 'gold', amount: 200 }, { type: 'woodMax', amount: 200 }] },
      { id: 'wood_2000', nameKey: 'achievements.wood2000', descKey: 'achievements.wood2000Desc', rewardKey: 'achievements.wood2000Reward', icon: '🌲', completed: false, completedAt: null, checkId: 'wood_2000', rewards: [{ type: 'gold', amount: 500 }, { type: 'woodMax', amount: 500 }] },
      { id: 'stone_100', nameKey: 'achievements.stone100', descKey: 'achievements.stone100Desc', rewardKey: 'achievements.stone100Reward', icon: '🪨', completed: false, completedAt: null, checkId: 'stone_100', rewards: [{ type: 'gold', amount: 80 }] },
      { id: 'stone_500', nameKey: 'achievements.stone500', descKey: 'achievements.stone500Desc', rewardKey: 'achievements.stone500Reward', icon: '🪨', completed: false, completedAt: null, checkId: 'stone_500', rewards: [{ type: 'gold', amount: 300 }, { type: 'stoneMax', amount: 200 }] },
      { id: 'metal_50', nameKey: 'achievements.metal50', descKey: 'achievements.metal50Desc', rewardKey: 'achievements.metal50Reward', icon: '⚙️', completed: false, completedAt: null, checkId: 'metal_50', rewards: [{ type: 'gold', amount: 150 }] },
      { id: 'metal_200', nameKey: 'achievements.metal200', descKey: 'achievements.metal200Desc', rewardKey: 'achievements.metal200Reward', icon: '⚙️', completed: false, completedAt: null, checkId: 'metal_200', rewards: [{ type: 'gold', amount: 400 }, { type: 'metalMax', amount: 200 }] },
      { id: 'gold_1000', nameKey: 'achievements.gold1000', descKey: 'achievements.gold1000Desc', rewardKey: 'achievements.gold1000Reward', icon: '🪙', completed: false, completedAt: null, checkId: 'gold_1000', rewards: [{ type: 'goldIncome', amount: 2 }] },
      { id: 'gold_5000', nameKey: 'achievements.gold5000', descKey: 'achievements.gold5000Desc', rewardKey: 'achievements.gold5000Reward', icon: '💰', completed: false, completedAt: null, checkId: 'gold_5000', rewards: [{ type: 'goldIncome', amount: 5 }, { type: 'mana', amount: 50 }] },
      // Hero milestones
      { id: 'first_hero', nameKey: 'achievements.firstHero', descKey: 'achievements.firstHeroDesc', rewardKey: 'achievements.firstHeroReward', icon: '🗡️', completed: false, completedAt: null, checkId: 'first_hero', rewards: [{ type: 'gold', amount: 100 }, { type: 'manaRegen', amount: 1 }] },
      { id: 'three_heroes', nameKey: 'achievements.threeHeroes', descKey: 'achievements.threeHeroesDesc', rewardKey: 'achievements.threeHeroesReward', icon: '⚔️', completed: false, completedAt: null, checkId: 'three_heroes', rewards: [{ type: 'gold', amount: 300 }, { type: 'maxHeroes', amount: 2 }] },
      // Mining milestones
      { id: 'first_worker', nameKey: 'achievements.firstWorker', descKey: 'achievements.firstWorkerDesc', rewardKey: 'achievements.firstWorkerReward', icon: '👷', completed: false, completedAt: null, checkId: 'first_worker', rewards: [{ type: 'gold', amount: 30 }] },
      { id: 'upgrade_mine', nameKey: 'achievements.upgradeMine', descKey: 'achievements.upgradeMineDesc', rewardKey: 'achievements.upgradeMineReward', icon: '⬆️', completed: false, completedAt: null, checkId: 'upgrade_mine', rewards: [{ type: 'gold', amount: 150 }, { type: 'stoneMax', amount: 100 }] },
      // Market milestones
      { id: 'first_sale', nameKey: 'achievements.firstSale', descKey: 'achievements.firstSaleDesc', rewardKey: 'achievements.firstSaleReward', icon: '🤝', completed: false, completedAt: null, checkId: 'first_sale', rewards: [{ type: 'gold', amount: 50 }] },
    ] as Achievement[],

    // --- Achievement notification queue ---
    achievementPopup: null as Achievement | null,

    /** Tracks total resources ever gathered (not current, cumulative) */
    stats: {
      totalWoodGathered: 0,
      totalStoneGathered: 0,
      totalMetalGathered: 0,
      totalGoldEarned: 0,
      totalSales: 0,
    },

    // --- Game tick ---
    _tickInterval: null as ReturnType<typeof setInterval> | null,
    tickCount: 0,
  }),

  getters: {
    /** Resources produced per minute by workers for a given operation */
    miningRate:
      (state) =>
      (key: MiningKey): number => {
        const op = state.mining[key];
        return op.workers * op.baseRate * op.level;
      },

    /** Total passive gold income per minute (base + heroes etc.) */
    totalGoldIncome(state): number {
      return state.resources.goldIncome;
    },

    /** Check if a nav item is unlocked */
    isNavUnlocked:
      (state) =>
      (id: string): boolean =>
        state.unlockedNavs.includes(id as NavId),

    /** Number of completed achievements */
    completedAchievements(state): number {
      return state.achievements.filter((a) => a.completed).length;
    },

    /** Total achievements */
    totalAchievements(state): number {
      return state.achievements.length;
    },

    /** Next bed cost, or null if max reached */
    nextBedCost(state): number | null {
      const idx = state.tavernUpgrades.beds;
      if (idx >= state.tavernUpgrades.bedCosts.length) return null;
      return state.tavernUpgrades.bedCosts[idx]!;
    },

    /** Check if an upgrade node's prerequisites are met */
    isUpgradeAvailable:
      (state) =>
      (id: string): boolean => {
        const node = state.upgradeTree.find((n) => n.id === id);
        if (!node || node.purchased) return false;
        return node.requires.every((reqId) => {
          const req = state.upgradeTree.find((n) => n.id === reqId);
          return req?.purchased === true;
        });
      },

    /** Check if an upgrade has been purchased */
    isUpgradePurchased:
      (state) =>
      (id: string): boolean => {
        return state.upgradeTree.find((n) => n.id === id)?.purchased === true;
      },

    /** Max row in the upgrade tree */
    upgradeTreeMaxRow(state): number {
      return Math.max(...state.upgradeTree.map((n) => n.row));
    },
  },

  actions: {
    // ==========================================
    // Resource helpers
    // ==========================================
    addResource(key: 'gold' | 'wood' | 'stone' | 'metal' | 'mana', amount: number) {
      const maxKey = `${key}Max` as keyof ResourceState;
      const max = this.resources[maxKey] as number;
      const actual = Math.min(amount, max - this.resources[key]);
      if (actual <= 0) return;
      this.resources[key] += actual;

      // Track cumulative stats
      if (key === 'wood') this.stats.totalWoodGathered += actual;
      else if (key === 'stone') this.stats.totalStoneGathered += actual;
      else if (key === 'metal') this.stats.totalMetalGathered += actual;
      else if (key === 'gold') this.stats.totalGoldEarned += actual;
    },

    removeResource(key: 'gold' | 'wood' | 'stone' | 'metal' | 'mana', amount: number): boolean {
      if (this.resources[key] < amount) return false;
      this.resources[key] -= amount;
      return true;
    },

    // ==========================================
    // Manual click mining
    // ==========================================
    manualMine(key: MiningKey) {
      const op = this.mining[key];
      const resKey = key === 'woodcamp' ? 'wood' : key === 'quarry' ? 'stone' : 'metal';
      // Click amount scales with level
      const amount = op.clickAmount * Math.max(op.level, 1);
      this.addResource(resKey, amount);
    },

    // ==========================================
    // Mining management
    // ==========================================
    hireWorker(key: MiningKey) {
      const op = this.mining[key];
      if (op.workers >= op.maxWorkers) return;
      if (!this.removeResource('gold', op.workerCost)) return;
      op.workers++;
      op.workerCost = Math.round(op.workerCost * 1.4);
    },

    upgradeMining(key: MiningKey) {
      const op = this.mining[key];
      const { gold, stone } = op.upgradeCost;
      if (this.resources.gold < gold || this.resources.stone < stone) return;
      this.removeResource('gold', gold);
      this.removeResource('stone', stone);
      op.level++;
      op.maxWorkers += 1;
      op.clickAmount = Math.ceil(op.clickAmount * 1.3);
      op.upgradeCost = {
        gold: Math.round(gold * 1.8),
        stone: Math.round(stone * 1.8),
      };
    },

    // ==========================================
    // Tavern upgrades
    // ==========================================
    buyTavernBed() {
      const idx = this.tavernUpgrades.beds;
      if (idx >= this.tavernUpgrades.bedCosts.length) return;
      const cost = this.tavernUpgrades.bedCosts[idx]!;
      if (!this.removeResource('gold', cost)) return;
      this.tavernUpgrades.beds++;
      this.maxHeroes++;
    },

    buyTavernItem(itemId: string) {
      const item = this.tavernUpgrades.items.find((i) => i.id === itemId);
      if (!item || item.purchased) return;
      const { gold, wood, stone } = item.cost;
      if (this.resources.gold < gold || this.resources.wood < wood || this.resources.stone < stone) return;
      this.removeResource('gold', gold);
      if (wood > 0) this.removeResource('wood', wood);
      if (stone > 0) this.removeResource('stone', stone);
      item.purchased = true;
      this.applyTavernItemEffect(item.effectKey);
    },

    applyTavernItemEffect(effectKey: string) {
      switch (effectKey) {
        case 'quest_board':
          // Generates quests — unlocks quests nav
          this.unlockNav('quests');
          this.unlockRightSidebar();
          break;
        case 'storage_chest':
          // +50 to all resource caps
          this.resources.woodMax += 50;
          this.resources.stoneMax += 50;
          this.resources.metalMax += 25;
          break;
        case 'warehouse':
          // +200 to all resource caps
          this.resources.woodMax += 200;
          this.resources.stoneMax += 200;
          this.resources.metalMax += 100;
          this.resources.goldMax += 5000;
          break;
      }
    },

    // ==========================================
    // Upgrade tree
    // ==========================================
    buyUpgrade(upgradeId: string) {
      const node = this.upgradeTree.find((n) => n.id === upgradeId);
      if (!node || node.purchased) return;
      // Check prerequisites
      const prereqsMet = node.requires.every((reqId) => {
        const req = this.upgradeTree.find((n) => n.id === reqId);
        return req?.purchased === true;
      });
      if (!prereqsMet) return;
      // Check cost
      const { gold, wood, stone, metal } = node.cost;
      if (this.resources.gold < gold || this.resources.wood < wood || this.resources.stone < stone || this.resources.metal < metal) return;
      // Pay
      if (gold > 0) this.removeResource('gold', gold);
      if (wood > 0) this.removeResource('wood', wood);
      if (stone > 0) this.removeResource('stone', stone);
      if (metal > 0) this.removeResource('metal', metal);
      node.purchased = true;
      this.applyUpgradeEffect(node.id);
    },

    applyUpgradeEffect(upgradeId: string) {
      switch (upgradeId) {
        case 'found_guild':
          // Core unlock — upgrades tab itself proves the guild exists
          this.unlockNav('tavern');
          this.unlockRightSidebar();
          break;
        case 'hero_quarters':
          // Unlocks recruiting heroes at tavern (+2 bed slots)
          this.maxHeroes += 2;
          break;
        case 'quest_license':
          // Unlocks quests + right sidebar
          this.unlockNav('quests');
          this.unlockRightSidebar();
          break;
        case 'training_grounds':
          // Heroes gain stats faster, +1 gold income
          this.resources.goldIncome += 3;
          break;
        case 'trade_routes':
          // Better market prices, +2 gold income
          this.resources.goldIncome += 2;
          this.marketPrices.wood += 1;
          this.marketPrices.stone += 1;
          this.marketPrices.metal += 2;
          break;
        case 'guild_vault':
          // Massive resource cap increase
          this.resources.goldMax += 20000;
          this.resources.woodMax += 500;
          this.resources.stoneMax += 500;
          this.resources.metalMax += 200;
          break;
        case 'arcane_tower':
          // Unlocks research, mana boost
          this.unlockNav('research');
          this.resources.manaMax += 500;
          this.resources.manaRegen += 5;
          break;
        case 'fortifications':
          // Unlocks grand hall, defense
          this.unlockNav('grand-hall');
          this.resources.goldIncome += 5;
          break;
        case 'grand_guild_hall':
          // End-game: massive bonuses
          this.maxHeroes += 5;
          this.resources.goldIncome += 15;
          this.resources.manaRegen += 10;
          break;
      }
    },

    // ==========================================
    // Tavern / Heroes
    // ==========================================
    recruitHero(heroId: number) {
      if (this.guildHeroes.length >= this.maxHeroes) return;
      const idx = this.tavernHeroes.findIndex((h) => h.id === heroId);
      if (idx === -1) return;
      const hero = this.tavernHeroes[idx]!;
      if (!this.removeResource('gold', hero.cost)) return;
      this.guildHeroes.push({
        id: hero.id,
        name: hero.name,
        heroClass: hero.heroClass,
        classKey: hero.classKey,
        emoji: hero.emoji,
        color: hero.color,
        stats: { ...hero.stats },
        traits: [...hero.traits],
        equipment: { rightHand: null, leftHand: null, armor: null, helmet: null, boots: null, accessory: null },
      });
      this.tavernHeroes.splice(idx, 1);
    },

    // ==========================================
    // Market
    // ==========================================
    sellResource(key: 'wood' | 'stone' | 'metal', amount: number) {
      const price = this.marketPrices[key];
      const actualAmount = Math.min(amount, Math.floor(this.resources[key]));
      if (actualAmount <= 0) return;
      this.removeResource(key, actualAmount);
      this.addResource('gold', actualAmount * price);
      this.stats.totalSales++;
    },

    // ==========================================
    // Nav unlocking
    // ==========================================
    unlockNav(id: NavId) {
      if (!this.unlockedNavs.includes(id)) {
        this.unlockedNavs.push(id);
      }
    },

    unlockRightSidebar() {
      this.rightSidebarUnlocked = true;
    },

    // ==========================================
    // Achievement checks
    // ==========================================
    checkAchievements() {
      for (const ach of this.achievements) {
        if (ach.completed) continue;

        let done = false;
        switch (ach.checkId) {
          // Resource milestones (cumulative)
          case 'wood_100':
            done = this.stats.totalWoodGathered >= 100;
            break;
          case 'wood_500':
            done = this.stats.totalWoodGathered >= 500;
            break;
          case 'wood_2000':
            done = this.stats.totalWoodGathered >= 2000;
            break;
          case 'stone_100':
            done = this.stats.totalStoneGathered >= 100;
            break;
          case 'stone_500':
            done = this.stats.totalStoneGathered >= 500;
            break;
          case 'metal_50':
            done = this.stats.totalMetalGathered >= 50;
            break;
          case 'metal_200':
            done = this.stats.totalMetalGathered >= 200;
            break;
          case 'gold_1000':
            done = this.stats.totalGoldEarned >= 1000;
            break;
          case 'gold_5000':
            done = this.stats.totalGoldEarned >= 5000;
            break;
          // Hero milestones
          case 'first_hero':
            done = this.guildHeroes.length >= 1;
            break;
          case 'three_heroes':
            done = this.guildHeroes.length >= 3;
            break;
          // Mining milestones
          case 'first_worker': {
            const keys: MiningKey[] = ['woodcamp', 'quarry', 'forge'];
            done = keys.some((k) => this.mining[k].workers > 0);
            break;
          }
          case 'upgrade_mine': {
            const keys2: MiningKey[] = ['woodcamp', 'quarry', 'forge'];
            done = keys2.some((k) => this.mining[k].level >= 2);
            break;
          }
          // Market
          case 'first_sale':
            done = this.stats.totalSales > 0;
            break;
        }

        if (done) {
          ach.completed = true;
          ach.completedAt = Date.now();
          this.onAchievementUnlocked(ach);
        }
      }
    },

    /** Apply rewards for an achievement */
    applyRewards(rewards: AchievementReward[]) {
      for (const r of rewards) {
        switch (r.type) {
          case 'gold':
          case 'wood':
          case 'stone':
          case 'metal':
          case 'mana':
            this.addResource(r.type, r.amount);
            break;
          case 'woodMax':
            this.resources.woodMax += r.amount;
            break;
          case 'stoneMax':
            this.resources.stoneMax += r.amount;
            break;
          case 'metalMax':
            this.resources.metalMax += r.amount;
            break;
          case 'manaMax':
            this.resources.manaMax += r.amount;
            break;
          case 'goldIncome':
            this.resources.goldIncome += r.amount;
            break;
          case 'manaRegen':
            this.resources.manaRegen += r.amount;
            break;
          case 'maxHeroes':
            this.maxHeroes += r.amount;
            break;
        }
      }
    },

    /** Dismiss the current achievement popup */
    dismissAchievementPopup() {
      this.achievementPopup = null;
    },

    /** Called when an achievement is completed — may unlock new content */
    onAchievementUnlocked(ach: Achievement) {
      // Apply rewards
      this.applyRewards(ach.rewards);

      // Show popup notification
      this.achievementPopup = { ...ach };

      // Unlock nav items based on progression
      const completed = this.achievements.filter((a) => a.completed).length;

      // After first hero -> unlock Quests + right sidebar
      if (ach.checkId === 'first_hero') {
        this.unlockNav('quests');
        this.unlockNav('blacksmith');
        this.unlockRightSidebar();
      }

      // After 3 heroes -> unlock Grand Hall
      if (ach.checkId === 'three_heroes') {
        this.unlockNav('grand-hall');
      }

      // After 5 achievements -> unlock Research
      if (completed >= 5) {
        this.unlockNav('research');
      }

      // Achievements tab is always visible once you have any achievement
      if (completed >= 1) {
        this.unlockNav('achievements');
      }
    },

    // ==========================================
    // Equipment system
    // ==========================================

    /** Generate a unique item ID */
    _genItemUid(): string {
      return `item_${this._nextItemUid++}`;
    },

    /**
     * Create a new equipment item.
     * Used by loot drops, quest rewards, shops, etc.
     */
    generateItem(templateId: string, rarity: ItemRarity): EquipmentItem | null {
      const template = ITEM_TEMPLATES.find((t) => t.id === templateId);
      if (!template) return null;

      const rarityConf = RARITY_CONFIG[rarity];
      // Pick random affixes (no duplicates)
      const affixPool = [...ITEM_AFFIXES];
      const affixes: ItemAffix[] = [];
      for (let i = 0; i < rarityConf.affixCount && affixPool.length > 0; i++) {
        const idx = Math.floor(Math.random() * affixPool.length);
        affixes.push(affixPool.splice(idx, 1)[0]!);
      }

      const item: EquipmentItem = {
        uid: this._genItemUid(),
        templateId: template.id,
        nameKey: template.nameKey,
        slot: template.slot,
        rarity,
        level: 1,
        maxLevel: rarityConf.maxLevel,
        baseStats: { ...template.baseStats },
        statMultiplier: rarityConf.multiplier,
        affixes,
        baseCost: template.baseCost,
        icon: template.icon,
      };
      return item;
    },

    /** Add an item to the player's inventory */
    addItemToInventory(item: EquipmentItem) {
      this.inventory.push(item);
    },

    /** Generate a random item and add it to the inventory */
    generateRandomItem(rarity?: ItemRarity) {
      const r = rarity ?? (['common', 'common', 'common', 'rare', 'rare', 'epic'] as ItemRarity[])[Math.floor(Math.random() * 6)]!;
      const template = ITEM_TEMPLATES[Math.floor(Math.random() * ITEM_TEMPLATES.length)]!;
      const item = this.generateItem(template.id, r);
      if (item) this.addItemToInventory(item);
    },

    /**
     * Equip an item from inventory onto a hero.
     * If the slot is occupied, the old item is moved back to inventory.
     */
    equipItem(heroId: number, itemUid: string) {
      const hero = this.guildHeroes.find((h) => h.id === heroId);
      if (!hero) return;
      const itemIdx = this.inventory.findIndex((i) => i.uid === itemUid);
      if (itemIdx === -1) return;
      const item = this.inventory[itemIdx]!;
      const slot = item.slot;

      // Unequip current item in that slot (if any)
      const current = hero.equipment[slot];
      if (current) {
        this.inventory.push(current);
      }

      // Place item
      hero.equipment[slot] = item;
      this.inventory.splice(itemIdx, 1);
    },

    /** Unequip an item from a hero, returning it to inventory */
    unequipItem(heroId: number, slot: EquipmentSlotType) {
      const hero = this.guildHeroes.find((h) => h.id === heroId);
      if (!hero) return;
      const item = hero.equipment[slot];
      if (!item) return;
      hero.equipment[slot] = null;
      this.inventory.push(item);
    },

    /** Calculate the effective stat bonus an item provides (base * multiplier * level + affix bonuses) */
    getItemStatBonuses(item: EquipmentItem): Record<string, number> {
      const bonuses: Record<string, number> = {};
      // Base stats scaled by multiplier and level
      for (const [stat, val] of Object.entries(item.baseStats)) {
        bonuses[stat] = (bonuses[stat] ?? 0) + Math.floor(val * item.statMultiplier * item.level);
      }
      // Affix bonuses scaled by level
      for (const affix of item.affixes) {
        bonuses[affix.stat] = (bonuses[affix.stat] ?? 0) + Math.floor(affix.baseValue * item.statMultiplier * item.level);
      }
      return bonuses;
    },

    /** Calculate total equipment bonuses for a hero */
    getHeroEquipmentBonuses(heroId: number): Record<string, number> {
      const hero = this.guildHeroes.find((h) => h.id === heroId);
      if (!hero) return {};
      const total: Record<string, number> = {};
      const slots: EquipmentSlotType[] = ['rightHand', 'leftHand', 'armor', 'helmet', 'boots', 'accessory'];
      for (const slot of slots) {
        const item = hero.equipment[slot];
        if (!item) continue;
        const bonuses = this.getItemStatBonuses(item);
        for (const [stat, val] of Object.entries(bonuses)) {
          total[stat] = (total[stat] ?? 0) + val;
        }
      }
      return total;
    },

    /**
     * Salvage an item from inventory for Metal Scraps and Magic Dust.
     * Higher rarity + higher level = more materials.
     */
    salvageItem(itemUid: string) {
      const idx = this.inventory.findIndex((i) => i.uid === itemUid);
      if (idx === -1) return;
      const item = this.inventory[idx]!;
      const [scrapsMin, scrapsMax, dustMin, dustMax] = SALVAGE_YIELDS[item.rarity];
      const levelBonus = Math.floor(item.level * 0.5);
      const scraps = Math.floor(Math.random() * (scrapsMax - scrapsMin + 1)) + scrapsMin + levelBonus;
      const dust = Math.floor(Math.random() * (dustMax - dustMin + 1)) + dustMin + Math.floor(levelBonus * 0.5);
      this.metalScraps += scraps;
      this.magicDust += dust;
      this.inventory.splice(idx, 1);
    },

    /**
     * Blacksmith: Upgrade an item's level.
     * Cost: baseCost * 1.5^(currentLevel - 1) gold, plus scaling scraps & dust.
     * Item can be in inventory or equipped on a hero.
     */
    upgradeItem(itemUid: string) {
      // Find item in inventory or on a hero
      let item: EquipmentItem | null = this.inventory.find((i) => i.uid === itemUid) ?? null;
      if (!item) {
        for (const hero of this.guildHeroes) {
          const slots: EquipmentSlotType[] = ['rightHand', 'leftHand', 'armor', 'helmet', 'boots', 'accessory'];
          for (const slot of slots) {
            if (hero.equipment[slot]?.uid === itemUid) {
              item = hero.equipment[slot];
              break;
            }
          }
          if (item) break;
        }
      }
      if (!item || item.level >= item.maxLevel) return;

      const goldCost = Math.ceil(item.baseCost * Math.pow(1.5, item.level - 1));
      const scrapsCost = Math.max(1, Math.floor(goldCost * 0.15));
      const dustCost = Math.max(0, Math.floor(goldCost * 0.08));

      if (this.resources.gold < goldCost) return;
      if (this.metalScraps < scrapsCost) return;
      if (this.magicDust < dustCost) return;

      this.removeResource('gold', goldCost);
      this.metalScraps -= scrapsCost;
      this.magicDust -= dustCost;
      item.level++;
    },

    /** Get upgrade cost for display */
    getUpgradeCost(item: EquipmentItem): { gold: number; scraps: number; dust: number } {
      const goldCost = Math.ceil(item.baseCost * Math.pow(1.5, item.level - 1));
      const scrapsCost = Math.max(1, Math.floor(goldCost * 0.15));
      const dustCost = Math.max(0, Math.floor(goldCost * 0.08));
      return { gold: goldCost, scraps: scrapsCost, dust: dustCost };
    },

    // ==========================================
    // Game loop (called every second)
    // ==========================================
    gameTick() {
      this.tickCount++;

      // Passive mining (rates are per minute, tick is per second)
      const miningKeys: MiningKey[] = ['woodcamp', 'quarry', 'forge'];
      for (const key of miningKeys) {
        const op = this.mining[key];
        if (op.workers <= 0 || op.level <= 0) continue;
        const perSecond = (op.workers * op.baseRate * op.level) / 60;
        const resKey = key === 'woodcamp' ? 'wood' : key === 'quarry' ? 'stone' : 'metal';
        this.addResource(resKey, perSecond);
      }

      // Passive mana regen
      this.addResource('mana', this.resources.manaRegen / 60);

      // Passive gold income
      this.addResource('gold', this.resources.goldIncome / 60);

      // Check achievements every 2 seconds
      if (this.tickCount % 2 === 0) {
        this.checkAchievements();
      }
    },

    startGameLoop() {
      if (this._tickInterval) return;
      this._tickInterval = setInterval(() => this.gameTick(), 1000);
    },

    stopGameLoop() {
      if (this._tickInterval) {
        clearInterval(this._tickInterval);
        this._tickInterval = null;
      }
    },
  },

  persist: {
    key: 'guild-master-save',
    pick: [
      'unlockedNavs',
      'rightSidebarUnlocked',
      'resources',
      'mining',
      'units',
      'buildings',
      'guildStats',
      'tavernHeroes',
      'guildHeroes',
      'maxHeroes',
      'inventory',
      'metalScraps',
      'magicDust',
      '_nextItemUid',
      'tavernUpgrades',
      'upgradeTree',
      'achievements',
      'stats',
      'marketPrices',
      'tickCount',
    ],
  },
});
