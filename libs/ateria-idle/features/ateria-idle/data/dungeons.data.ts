/**
 * Dungeon definitions for Ateria Idle
 * Data-Driven Design - all dungeon data in one place
 */

import type { Dungeon, Monster, LootDrop } from '@ateria-idle/entities/ateria-idle/warrior';
import { getMonster } from './monsters.data';

// ============================================
// DUNGEON BOSS DEFINITIONS
// ============================================

const DUNGEON_BOSSES: Record<string, Monster> = {
  goblin_king: {
    id: 'goblin_king',
    name: 'Król Goblinów',
    biome: 'forest',
    level: 15,
    maxHp: 500,
    currentHp: 500,
    attack: 25,
    defense: 15,
    accuracy: 60,
    evasion: 20,
    attackSpeed: 12,
    xpReward: 500,
    goldReward: { min: 100, max: 200 },
    lootTable: [
      { itemId: 'goblin_crown', chance: 1.0, minAmount: 1, maxAmount: 1, rarity: 'rare' },
      { itemId: 'royal_goblin_ear', chance: 0.5, minAmount: 2, maxAmount: 5 },
    ],
    slayerCategory: 'beast',
    abilities: [
      {
        id: 'summon_guards',
        name: 'Wezwij Strażników',
        type: 'active',
        cooldown: 50,
        effect: { type: 'special', value: 2, target: 'self' },
      },
    ],
  },
  swamp_queen: {
    id: 'swamp_queen',
    name: 'Królowa Bagien',
    biome: 'swamp',
    level: 25,
    maxHp: 1200,
    currentHp: 1200,
    attack: 45,
    defense: 30,
    accuracy: 70,
    evasion: 25,
    attackSpeed: 15,
    xpReward: 1500,
    goldReward: { min: 300, max: 500 },
    lootTable: [
      { itemId: 'swamp_queen_crown', chance: 1.0, minAmount: 1, maxAmount: 1, rarity: 'epic' },
      { itemId: 'toxic_gland', chance: 0.8, minAmount: 3, maxAmount: 6 },
      { itemId: 'witch_eye', chance: 0.4, minAmount: 1, maxAmount: 2 },
    ],
    slayerCategory: 'undead',
    abilities: [
      {
        id: 'poison_cloud',
        name: 'Trująca Chmura',
        type: 'active',
        cooldown: 30,
        effect: { type: 'damage', value: 20, duration: 50, target: 'enemy' },
      },
    ],
  },
  fire_lord: {
    id: 'fire_lord',
    name: 'Władca Ognia',
    biome: 'volcano',
    level: 40,
    maxHp: 3000,
    currentHp: 3000,
    attack: 80,
    defense: 50,
    accuracy: 80,
    evasion: 15,
    attackSpeed: 12,
    xpReward: 4000,
    goldReward: { min: 800, max: 1500 },
    lootTable: [
      { itemId: 'fire_lord_essence', chance: 1.0, minAmount: 1, maxAmount: 1, rarity: 'legendary' },
      { itemId: 'infernal_ember', chance: 0.6, minAmount: 2, maxAmount: 4 },
      { itemId: 'demon_heart', chance: 0.3, minAmount: 1, maxAmount: 1 },
    ],
    slayerCategory: 'demon',
    abilities: [
      {
        id: 'inferno',
        name: 'Piekielny Ogień',
        type: 'active',
        cooldown: 40,
        effect: { type: 'damage', value: 50, target: 'enemy' },
      },
      {
        id: 'flame_shield',
        name: 'Ognista Tarcza',
        type: 'passive',
        effect: { type: 'buff', value: 20, target: 'self' },
      },
    ],
  },
  frost_titan: {
    id: 'frost_titan',
    name: 'Mroźny Tytan',
    biome: 'tundra',
    level: 55,
    maxHp: 6000,
    currentHp: 6000,
    attack: 120,
    defense: 80,
    accuracy: 75,
    evasion: 10,
    attackSpeed: 18,
    xpReward: 8000,
    goldReward: { min: 1500, max: 3000 },
    lootTable: [
      { itemId: 'titan_heart', chance: 1.0, minAmount: 1, maxAmount: 1, rarity: 'legendary' },
      { itemId: 'eternal_ice', chance: 0.5, minAmount: 3, maxAmount: 6 },
      { itemId: 'frost_dragon_fang', chance: 0.2, minAmount: 1, maxAmount: 2 },
    ],
    slayerCategory: 'elemental',
    abilities: [
      {
        id: 'frozen_ground',
        name: 'Zamrożona Ziemia',
        type: 'active',
        cooldown: 35,
        effect: { type: 'debuff', value: -30, duration: 30, target: 'enemy' },
      },
    ],
  },
  void_emperor: {
    id: 'void_emperor',
    name: 'Cesarz Pustki',
    biome: 'abyss',
    level: 75,
    maxHp: 15000,
    currentHp: 15000,
    attack: 200,
    defense: 120,
    accuracy: 90,
    evasion: 25,
    attackSpeed: 10,
    xpReward: 20000,
    goldReward: { min: 5000, max: 10000 },
    lootTable: [
      { itemId: 'void_crown', chance: 1.0, minAmount: 1, maxAmount: 1, rarity: 'mythic' },
      { itemId: 'void_essence', chance: 0.8, minAmount: 5, maxAmount: 10 },
      { itemId: 'chaos_crystal', chance: 0.4, minAmount: 2, maxAmount: 4 },
      { itemId: 'elder_rune', chance: 0.1, minAmount: 1, maxAmount: 1 },
    ],
    slayerCategory: 'aberration',
    abilities: [
      {
        id: 'void_blast',
        name: 'Eksplozja Pustki',
        type: 'active',
        cooldown: 25,
        effect: { type: 'damage', value: 100, target: 'enemy' },
      },
      {
        id: 'reality_warp',
        name: 'Zakrzywienie Rzeczywistości',
        type: 'active',
        cooldown: 60,
        effect: { type: 'special', value: 50, target: 'self' },
      },
    ],
  },
};

// ============================================
// DUNGEON DEFINITIONS
// ============================================

export const DUNGEONS: Record<string, Dungeon> = {
  // ============================================
  // TIER 1 - Early Game (Level 10-20)
  // ============================================
  goblin_caves: {
    id: 'goblin_caves',
    name: 'Jaskinie Goblinów',
    description: 'Mroczne jaskinie pełne goblinów. Idealne dla początkujących poszukiwaczy przygód.',
    tier: 1,
    icon: 'mdi-cave',
    requiredLevel: 10,
    keyItemId: 'goblin_key',
    keyCost: 1,
    waves: [
      { monsters: ['goblin'], count: 5 },
      { monsters: ['goblin', 'wolf'], count: 4 },
      { monsters: ['goblin', 'spider'], count: 6 },
    ],
    boss: DUNGEON_BOSSES.goblin_king,
    completionRewards: [
      { itemId: 'gold', amount: 500, minAmount: 500, maxAmount: 500, chance: 1 },
      { itemId: 'dungeon_token_t1', amount: 3, minAmount: 3, maxAmount: 3, chance: 1 },
      { itemId: 'goblin_treasure', amount: 1, minAmount: 1, maxAmount: 1, chance: 0.3 },
    ],
    firstClearBonus: [
      { itemId: 'goblin_slayer_title', amount: 1, minAmount: 1, maxAmount: 1, chance: 1 },
      { itemId: 'gold', amount: 1000, minAmount: 1000, maxAmount: 1000, chance: 1 },
    ],
  },

  // ============================================
  // TIER 2 - Mid Game (Level 20-35)
  // ============================================
  toxic_depths: {
    id: 'toxic_depths',
    name: 'Trujące Głębiny',
    description: 'Podziemne bagna pełne trucizny i nieumarłych. Wymagana odporność na truciznę.',
    tier: 2,
    icon: 'mdi-skull-crossbones',
    requiredLevel: 20,
    keyItemId: 'swamp_key',
    keyCost: 1,
    waves: [
      { monsters: ['swamp_zombie', 'poison_frog'], count: 6 },
      { monsters: ['bog_witch', 'swamp_zombie'], count: 5 },
      { monsters: ['hydra_spawn', 'poison_frog'], count: 4 },
      { monsters: ['swamp_horror'], count: 2 },
    ],
    boss: DUNGEON_BOSSES.swamp_queen,
    completionRewards: [
      { itemId: 'gold', amount: 1500, minAmount: 1500, maxAmount: 1500, chance: 1 },
      { itemId: 'dungeon_token_t2', amount: 3, minAmount: 3, maxAmount: 3, chance: 1 },
      { itemId: 'swamp_treasure', amount: 1, minAmount: 1, maxAmount: 1, chance: 0.25 },
    ],
    firstClearBonus: [
      { itemId: 'swamp_conqueror_title', amount: 1, minAmount: 1, maxAmount: 1, chance: 1 },
      { itemId: 'gold', amount: 3000, minAmount: 3000, maxAmount: 3000, chance: 1 },
    ],
  },

  // ============================================
  // TIER 3 - Late Game (Level 35-55)
  // ============================================
  infernal_fortress: {
    id: 'infernal_fortress',
    name: 'Piekielna Forteca',
    description: 'Twierdza demonów w sercu wulkanu. Tylko najodważniejsi przetrwają.',
    tier: 3,
    icon: 'mdi-fire',
    requiredLevel: 35,
    keyItemId: 'infernal_key',
    keyCost: 1,
    waves: [
      { monsters: ['fire_elemental', 'hell_hound'], count: 6 },
      { monsters: ['demon_warrior', 'lava_golem'], count: 5 },
      { monsters: ['infernal', 'fire_elemental'], count: 4 },
      { monsters: ['demon_warrior', 'infernal'], count: 4 },
      { monsters: ['lava_golem'], count: 3 },
    ],
    boss: DUNGEON_BOSSES.fire_lord,
    completionRewards: [
      { itemId: 'gold', amount: 5000, minAmount: 5000, maxAmount: 5000, chance: 1 },
      { itemId: 'dungeon_token_t3', amount: 3, minAmount: 3, maxAmount: 3, chance: 1 },
      { itemId: 'infernal_treasure', amount: 1, minAmount: 1, maxAmount: 1, chance: 0.2 },
    ],
    firstClearBonus: [
      { itemId: 'demon_slayer_title', amount: 1, minAmount: 1, maxAmount: 1, chance: 1 },
      { itemId: 'gold', amount: 10000, minAmount: 10000, maxAmount: 10000, chance: 1 },
    ],
  },

  // ============================================
  // TIER 4 - End Game (Level 55-75)
  // ============================================
  frozen_citadel: {
    id: 'frozen_citadel',
    name: 'Zamrożona Cytadela',
    description: 'Pradawna forteca ukryta w wiecznym lodzie. Dom Mroźnego Tytana.',
    tier: 4,
    icon: 'mdi-snowflake',
    requiredLevel: 55,
    keyItemId: 'frost_key',
    keyCost: 1,
    waves: [
      { monsters: ['frost_wraith', 'ice_troll'], count: 6 },
      { monsters: ['yeti', 'frost_wraith'], count: 5 },
      { monsters: ['frost_dragon', 'ice_troll'], count: 4 },
      { monsters: ['ancient_ice_elemental', 'yeti'], count: 4 },
      { monsters: ['frost_dragon'], count: 2 },
    ],
    boss: DUNGEON_BOSSES.frost_titan,
    completionRewards: [
      { itemId: 'gold', amount: 15000, minAmount: 15000, maxAmount: 15000, chance: 1 },
      { itemId: 'dungeon_token_t4', amount: 3, minAmount: 3, maxAmount: 3, chance: 1 },
      { itemId: 'frost_treasure', amount: 1, minAmount: 1, maxAmount: 1, chance: 0.15 },
    ],
    firstClearBonus: [
      { itemId: 'titan_slayer_title', amount: 1, minAmount: 1, maxAmount: 1, chance: 1 },
      { itemId: 'gold', amount: 30000, minAmount: 30000, maxAmount: 30000, chance: 1 },
    ],
  },

  // ============================================
  // TIER 5 - Ultimate Challenge (Level 75+)
  // ============================================
  void_sanctum: {
    id: 'void_sanctum',
    name: 'Sanktuarium Pustki',
    description: 'Ostateczne wyzwanie. Wymiar chaosu, gdzie rządy sprawuje Cesarz Pustki.',
    tier: 5,
    icon: 'mdi-blur',
    requiredLevel: 75,
    keyItemId: 'void_key',
    keyCost: 1,
    waves: [
      { monsters: ['void_stalker', 'chaos_spawn'], count: 8 },
      { monsters: ['abyssal_demon', 'void_stalker'], count: 6 },
      { monsters: ['elder_horror', 'chaos_spawn'], count: 5 },
      { monsters: ['void_dragon', 'abyssal_demon'], count: 4 },
      { monsters: ['elder_horror', 'void_dragon'], count: 3 },
      { monsters: ['void_stalker', 'chaos_spawn', 'abyssal_demon'], count: 6 },
    ],
    boss: DUNGEON_BOSSES.void_emperor,
    completionRewards: [
      { itemId: 'gold', amount: 50000, minAmount: 50000, maxAmount: 50000, chance: 1 },
      { itemId: 'dungeon_token_t5', amount: 5, minAmount: 5, maxAmount: 5, chance: 1 },
      { itemId: 'void_treasure', amount: 1, minAmount: 1, maxAmount: 1, chance: 0.1 },
    ],
    firstClearBonus: [
      { itemId: 'void_conqueror_title', amount: 1, minAmount: 1, maxAmount: 1, chance: 1 },
      { itemId: 'gold', amount: 100000, minAmount: 100000, maxAmount: 100000, chance: 1 },
      { itemId: 'legendary_equipment_box', amount: 1, minAmount: 1, maxAmount: 1, chance: 1 },
    ],
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getDungeon(id: string): Dungeon | undefined {
  return DUNGEONS[id];
}

export function getDungeonsByTier(tier: number): Dungeon[] {
  return Object.values(DUNGEONS).filter(d => d.tier === tier);
}

export function getUnlockedDungeons(playerLevel: number): Dungeon[] {
  return Object.values(DUNGEONS).filter(d => d.requiredLevel <= playerLevel);
}

export function getDungeonBoss(dungeonId: string): Monster | undefined {
  const dungeon = getDungeon(dungeonId);
  return dungeon?.boss;
}

export const DUNGEON_ORDER: string[] = [
  'goblin_caves',
  'toxic_depths',
  'infernal_fortress',
  'frozen_citadel',
  'void_sanctum',
];

// Key item IDs for dungeons
export const DUNGEON_KEY_ITEMS = {
  goblin_key: {
    id: 'goblin_key',
    name: 'Klucz do Jaskiń Goblinów',
    icon: 'mdi-key',
    dungeonId: 'goblin_caves',
    tier: 1,
  },
  swamp_key: {
    id: 'swamp_key',
    name: 'Klucz do Trujących Głębin',
    icon: 'mdi-key-variant',
    dungeonId: 'toxic_depths',
    tier: 2,
  },
  infernal_key: {
    id: 'infernal_key',
    name: 'Klucz do Piekielnej Fortecy',
    icon: 'mdi-key-chain',
    dungeonId: 'infernal_fortress',
    tier: 3,
  },
  frost_key: {
    id: 'frost_key',
    name: 'Klucz do Zamrożonej Cytadeli',
    icon: 'mdi-key-star',
    dungeonId: 'frozen_citadel',
    tier: 4,
  },
  void_key: {
    id: 'void_key',
    name: 'Klucz do Sanktuarium Pustki',
    icon: 'mdi-key-wireless',
    dungeonId: 'void_sanctum',
    tier: 5,
  },
};

export function getDungeonKeyItem(keyItemId: string) {
  return DUNGEON_KEY_ITEMS[keyItemId as keyof typeof DUNGEON_KEY_ITEMS];
}
