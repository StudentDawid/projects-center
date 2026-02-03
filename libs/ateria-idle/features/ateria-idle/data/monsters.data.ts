/**
 * Monster definitions for Ateria Idle
 * Data-Driven Design - all monster data in one place
 */

import type { Monster, BiomeId, SlayerCategory } from '@ateria-idle/entities/ateria-idle/warrior';

// Helper to create monster with defaults
function createMonster(data: Partial<Monster> & Pick<Monster, 'id' | 'name' | 'biome' | 'level'>): Monster {
  const level = data.level;
  return {
    // Defaults calculated from level
    maxHp: Math.floor(20 + level * 15),
    currentHp: Math.floor(20 + level * 15),
    attack: Math.floor(3 + level * 2.5),
    defense: Math.floor(1 + level * 1.5),
    accuracy: Math.floor(35 + level * 1.5),
    evasion: Math.floor(5 + level * 1),
    attackSpeed: 20, // 2 seconds
    xpReward: Math.floor(10 + level * 5),
    goldReward: { min: level * 3, max: level * 8 },
    lootTable: [],
    // Spread provided data to override defaults
    ...data,
  };
}

export const MONSTERS: Record<string, Monster> = {
  // ============================================
  // FOREST (Level 1-15)
  // ============================================
  goblin: createMonster({
    id: 'goblin',
    name: 'Goblin',
    biome: 'forest',
    level: 1,
    maxHp: 30,
    attack: 5,
    defense: 2,
    evasion: 15,
    attackSpeed: 20,
    xpReward: 15,
    goldReward: { min: 5, max: 15 },
    lootTable: [
      { itemId: 'goblin_ear', chance: 0.3, minAmount: 1, maxAmount: 1 },
      { itemId: 'rusty_dagger', chance: 0.05, minAmount: 1, maxAmount: 1, rarity: 'common' },
      { itemId: 'raw_meat', chance: 0.2, minAmount: 1, maxAmount: 2 },
    ],
    slayerCategory: 'beast',
    slayerXpReward: 5,
  }),

  wolf: createMonster({
    id: 'wolf',
    name: 'Wilk',
    biome: 'forest',
    level: 3,
    maxHp: 50,
    attack: 12,
    defense: 3,
    evasion: 25,
    attackSpeed: 15,
    xpReward: 25,
    goldReward: { min: 8, max: 20 },
    lootTable: [
      { itemId: 'wolf_pelt', chance: 0.4, minAmount: 1, maxAmount: 1 },
      { itemId: 'wolf_fang', chance: 0.2, minAmount: 1, maxAmount: 2 },
      { itemId: 'raw_meat', chance: 0.6, minAmount: 1, maxAmount: 3 },
    ],
    slayerCategory: 'beast',
    slayerXpReward: 8,
  }),

  spider: createMonster({
    id: 'spider',
    name: 'Leśny Pająk',
    biome: 'forest',
    level: 4,
    maxHp: 40,
    attack: 15,
    defense: 2,
    evasion: 30,
    attackSpeed: 12,
    xpReward: 30,
    goldReward: { min: 5, max: 15 },
    lootTable: [
      { itemId: 'spider_silk', chance: 0.5, minAmount: 1, maxAmount: 3 },
      { itemId: 'spider_venom', chance: 0.2, minAmount: 1, maxAmount: 1 },
    ],
    slayerCategory: 'beast',
    slayerXpReward: 10,
  }),

  skeleton: createMonster({
    id: 'skeleton',
    name: 'Szkielet',
    biome: 'forest',
    level: 5,
    maxHp: 45,
    attack: 18,
    defense: 10,
    evasion: 5,
    attackSpeed: 25,
    xpReward: 40,
    goldReward: { min: 15, max: 35 },
    lootTable: [
      { itemId: 'bone', chance: 0.8, minAmount: 1, maxAmount: 3 },
      { itemId: 'old_sword', chance: 0.1, minAmount: 1, maxAmount: 1, rarity: 'uncommon' },
      { itemId: 'ancient_coin', chance: 0.05, minAmount: 1, maxAmount: 5 },
    ],
    slayerCategory: 'undead',
    slayerXpReward: 12,
  }),

  forest_troll: createMonster({
    id: 'forest_troll',
    name: 'Leśny Troll',
    biome: 'forest',
    level: 10,
    maxHp: 200,
    attack: 30,
    defense: 20,
    evasion: 5,
    attackSpeed: 35,
    xpReward: 100,
    goldReward: { min: 40, max: 80 },
    lootTable: [
      { itemId: 'troll_blood', chance: 0.5, minAmount: 1, maxAmount: 2 },
      { itemId: 'troll_club', chance: 0.08, minAmount: 1, maxAmount: 1, rarity: 'rare' },
      { itemId: 'forest_essence', chance: 0.1, minAmount: 1, maxAmount: 1 },
    ],
    slayerCategory: 'beast',
    slayerXpReward: 30,
  }),

  ancient_treant: createMonster({
    id: 'ancient_treant',
    name: 'Pradawny Treant',
    biome: 'forest',
    level: 15,
    maxHp: 500,
    attack: 45,
    defense: 40,
    evasion: 0,
    attackSpeed: 40,
    xpReward: 300,
    goldReward: { min: 100, max: 200 },
    lootTable: [
      { itemId: 'ancient_bark', chance: 1.0, minAmount: 2, maxAmount: 5 },
      { itemId: 'forest_essence', chance: 0.5, minAmount: 1, maxAmount: 3 },
      { itemId: 'treant_heart', chance: 0.2, minAmount: 1, maxAmount: 1, rarity: 'epic' },
    ],
    slayerCategory: 'elemental',
    slayerXpReward: 100,
  }),

  // ============================================
  // PLAINS (Level 8-20)
  // ============================================
  bandit: createMonster({
    id: 'bandit',
    name: 'Bandyta',
    biome: 'plains',
    level: 8,
    maxHp: 80,
    attack: 22,
    defense: 12,
    evasion: 20,
    attackSpeed: 18,
    xpReward: 55,
    goldReward: { min: 25, max: 60 },
    lootTable: [
      { itemId: 'bandit_insignia', chance: 0.3, minAmount: 1, maxAmount: 1 },
      { itemId: 'stolen_goods', chance: 0.4, minAmount: 1, maxAmount: 3 },
      { itemId: 'iron_sword', chance: 0.1, minAmount: 1, maxAmount: 1, rarity: 'uncommon' },
    ],
    slayerCategory: 'beast', // humanoid
    slayerXpReward: 18,
  }),

  wild_boar: createMonster({
    id: 'wild_boar',
    name: 'Dzik',
    biome: 'plains',
    level: 9,
    maxHp: 120,
    attack: 28,
    defense: 15,
    evasion: 10,
    attackSpeed: 22,
    xpReward: 60,
    goldReward: { min: 15, max: 35 },
    lootTable: [
      { itemId: 'boar_tusk', chance: 0.4, minAmount: 1, maxAmount: 2 },
      { itemId: 'raw_meat', chance: 0.8, minAmount: 2, maxAmount: 5 },
      { itemId: 'thick_hide', chance: 0.3, minAmount: 1, maxAmount: 1 },
    ],
    slayerCategory: 'beast',
    slayerXpReward: 20,
  }),

  prairie_wolf: createMonster({
    id: 'prairie_wolf',
    name: 'Stepowy Wilk',
    biome: 'plains',
    level: 11,
    maxHp: 90,
    attack: 32,
    defense: 10,
    evasion: 35,
    attackSpeed: 12,
    xpReward: 70,
    goldReward: { min: 20, max: 45 },
    lootTable: [
      { itemId: 'wolf_pelt', chance: 0.5, minAmount: 1, maxAmount: 1 },
      { itemId: 'raw_meat', chance: 0.7, minAmount: 1, maxAmount: 3 },
      { itemId: 'wild_mane', chance: 0.15, minAmount: 1, maxAmount: 1 },
    ],
    slayerCategory: 'beast',
    slayerXpReward: 22,
  }),

  centaur: createMonster({
    id: 'centaur',
    name: 'Centaur',
    biome: 'plains',
    level: 14,
    maxHp: 180,
    attack: 40,
    defense: 25,
    evasion: 25,
    attackSpeed: 20,
    xpReward: 110,
    goldReward: { min: 40, max: 90 },
    lootTable: [
      { itemId: 'centaur_bow', chance: 0.1, minAmount: 1, maxAmount: 1, rarity: 'rare' },
      { itemId: 'horse_hair', chance: 0.4, minAmount: 1, maxAmount: 3 },
      { itemId: 'ancient_arrow', chance: 0.3, minAmount: 2, maxAmount: 8 },
    ],
    slayerCategory: 'beast',
    slayerXpReward: 35,
  }),

  plains_giant: createMonster({
    id: 'plains_giant',
    name: 'Stepowy Olbrzym',
    biome: 'plains',
    level: 18,
    maxHp: 400,
    attack: 55,
    defense: 35,
    evasion: 5,
    attackSpeed: 40,
    xpReward: 180,
    goldReward: { min: 80, max: 150 },
    lootTable: [
      { itemId: 'giant_bone', chance: 0.6, minAmount: 1, maxAmount: 2 },
      { itemId: 'giant_club', chance: 0.08, minAmount: 1, maxAmount: 1, rarity: 'rare' },
      { itemId: 'giant_toe', chance: 0.2, minAmount: 1, maxAmount: 1 },
    ],
    slayerCategory: 'beast',
    slayerXpReward: 55,
  }),

  warlord_khan: createMonster({
    id: 'warlord_khan',
    name: 'Wódz Khan',
    biome: 'plains',
    level: 22,
    maxHp: 600,
    attack: 70,
    defense: 45,
    evasion: 20,
    attackSpeed: 25,
    xpReward: 400,
    goldReward: { min: 200, max: 400 },
    lootTable: [
      { itemId: 'khans_blade', chance: 0.15, minAmount: 1, maxAmount: 1, rarity: 'epic' },
      { itemId: 'warlord_helm', chance: 0.1, minAmount: 1, maxAmount: 1, rarity: 'epic' },
      { itemId: 'conquest_medal', chance: 0.5, minAmount: 1, maxAmount: 3 },
    ],
    slayerCategory: 'beast',
    slayerXpReward: 150,
  }),

  // ============================================
  // SWAMP (Level 15-30)
  // ============================================
  swamp_zombie: createMonster({
    id: 'swamp_zombie',
    name: 'Bagienne Zombie',
    biome: 'swamp',
    level: 15,
    maxHp: 150,
    attack: 35,
    defense: 20,
    evasion: 5,
    attackSpeed: 30,
    xpReward: 90,
    goldReward: { min: 20, max: 50 },
    lootTable: [
      { itemId: 'rotten_flesh', chance: 0.6, minAmount: 1, maxAmount: 3 },
      { itemId: 'zombie_brain', chance: 0.2, minAmount: 1, maxAmount: 1 },
    ],
    slayerCategory: 'undead',
    slayerXpReward: 28,
  }),

  poison_frog: createMonster({
    id: 'poison_frog',
    name: 'Trująca Żaba',
    biome: 'swamp',
    level: 17,
    maxHp: 80,
    attack: 45,
    defense: 10,
    evasion: 40,
    attackSpeed: 15,
    xpReward: 100,
    goldReward: { min: 15, max: 40 },
    lootTable: [
      { itemId: 'toxic_gland', chance: 0.4, minAmount: 1, maxAmount: 2 },
      { itemId: 'frog_leg', chance: 0.5, minAmount: 1, maxAmount: 4 },
    ],
    slayerCategory: 'beast',
    slayerXpReward: 32,
  }),

  bog_witch: createMonster({
    id: 'bog_witch',
    name: 'Bagienna Wiedźma',
    biome: 'swamp',
    level: 20,
    maxHp: 180,
    attack: 55,
    defense: 25,
    evasion: 20,
    attackSpeed: 25,
    xpReward: 140,
    goldReward: { min: 50, max: 100 },
    lootTable: [
      { itemId: 'witch_eye', chance: 0.3, minAmount: 1, maxAmount: 1 },
      { itemId: 'cursed_pendant', chance: 0.1, minAmount: 1, maxAmount: 1, rarity: 'rare' },
      { itemId: 'swamp_herbs', chance: 0.5, minAmount: 2, maxAmount: 5 },
    ],
    slayerCategory: 'aberration',
    slayerXpReward: 45,
  }),

  hydra_spawn: createMonster({
    id: 'hydra_spawn',
    name: 'Młoda Hydra',
    biome: 'swamp',
    level: 25,
    maxHp: 350,
    attack: 65,
    defense: 35,
    evasion: 15,
    attackSpeed: 20,
    xpReward: 200,
    goldReward: { min: 80, max: 160 },
    lootTable: [
      { itemId: 'hydra_scale', chance: 0.4, minAmount: 1, maxAmount: 3 },
      { itemId: 'hydra_blood', chance: 0.25, minAmount: 1, maxAmount: 2 },
    ],
    slayerCategory: 'dragon',
    slayerXpReward: 65,
  }),

  swamp_horror: createMonster({
    id: 'swamp_horror',
    name: 'Bagienne Paskudztwo',
    biome: 'swamp',
    level: 28,
    maxHp: 450,
    attack: 75,
    defense: 40,
    evasion: 10,
    attackSpeed: 30,
    xpReward: 250,
    goldReward: { min: 100, max: 200 },
    lootTable: [
      { itemId: 'horror_tentacle', chance: 0.5, minAmount: 1, maxAmount: 2 },
      { itemId: 'abyssal_ink', chance: 0.2, minAmount: 1, maxAmount: 1 },
    ],
    slayerCategory: 'aberration',
    slayerXpReward: 80,
  }),

  queen_of_rot: createMonster({
    id: 'queen_of_rot',
    name: 'Królowa Zgnilizny',
    biome: 'swamp',
    level: 32,
    maxHp: 800,
    attack: 90,
    defense: 50,
    evasion: 15,
    attackSpeed: 25,
    xpReward: 500,
    goldReward: { min: 250, max: 500 },
    lootTable: [
      { itemId: 'crown_of_rot', chance: 0.1, minAmount: 1, maxAmount: 1, rarity: 'epic' },
      { itemId: 'queens_blessing', chance: 0.2, minAmount: 1, maxAmount: 1, rarity: 'rare' },
      { itemId: 'toxic_gland', chance: 1.0, minAmount: 3, maxAmount: 6 },
    ],
    slayerCategory: 'undead',
    slayerXpReward: 180,
  }),

  // ============================================
  // DESERT (Level 20-40)
  // ============================================
  sand_scorpion: createMonster({
    id: 'sand_scorpion',
    name: 'Pustynny Skorpion',
    biome: 'desert',
    level: 20,
    maxHp: 160,
    attack: 50,
    defense: 30,
    evasion: 20,
    attackSpeed: 18,
    xpReward: 120,
    goldReward: { min: 30, max: 70 },
    lootTable: [
      { itemId: 'scorpion_tail', chance: 0.4, minAmount: 1, maxAmount: 1 },
      { itemId: 'chitin_plate', chance: 0.3, minAmount: 1, maxAmount: 2 },
    ],
    slayerCategory: 'beast',
    slayerXpReward: 38,
  }),

  mummy: createMonster({
    id: 'mummy',
    name: 'Mumia',
    biome: 'desert',
    level: 24,
    maxHp: 220,
    attack: 55,
    defense: 40,
    evasion: 5,
    attackSpeed: 28,
    xpReward: 160,
    goldReward: { min: 60, max: 120 },
    lootTable: [
      { itemId: 'mummy_wrapping', chance: 0.5, minAmount: 1, maxAmount: 3 },
      { itemId: 'ancient_scarab', chance: 0.15, minAmount: 1, maxAmount: 1 },
      { itemId: 'cursed_gold', chance: 0.3, minAmount: 5, maxAmount: 20 },
    ],
    slayerCategory: 'undead',
    slayerXpReward: 50,
  }),

  desert_nomad: createMonster({
    id: 'desert_nomad',
    name: 'Pustynny Nomada',
    biome: 'desert',
    level: 26,
    maxHp: 200,
    attack: 60,
    defense: 35,
    evasion: 30,
    attackSpeed: 20,
    xpReward: 180,
    goldReward: { min: 70, max: 140 },
    lootTable: [
      { itemId: 'nomad_scimitar', chance: 0.08, minAmount: 1, maxAmount: 1, rarity: 'rare' },
      { itemId: 'desert_spices', chance: 0.4, minAmount: 1, maxAmount: 3 },
      { itemId: 'water_flask', chance: 0.3, minAmount: 1, maxAmount: 2 },
    ],
    slayerCategory: 'beast',
    slayerXpReward: 55,
  }),

  sand_worm: createMonster({
    id: 'sand_worm',
    name: 'Piaskowy Robak',
    biome: 'desert',
    level: 32,
    maxHp: 500,
    attack: 80,
    defense: 50,
    evasion: 5,
    attackSpeed: 35,
    xpReward: 280,
    goldReward: { min: 100, max: 200 },
    lootTable: [
      { itemId: 'worm_hide', chance: 0.4, minAmount: 1, maxAmount: 2 },
      { itemId: 'sand_pearl', chance: 0.15, minAmount: 1, maxAmount: 1, rarity: 'rare' },
      { itemId: 'desert_crystal', chance: 0.1, minAmount: 1, maxAmount: 1 },
    ],
    slayerCategory: 'beast',
    slayerXpReward: 90,
  }),

  sphinx: createMonster({
    id: 'sphinx',
    name: 'Sfinks',
    biome: 'desert',
    level: 36,
    maxHp: 600,
    attack: 90,
    defense: 55,
    evasion: 25,
    attackSpeed: 22,
    xpReward: 350,
    goldReward: { min: 150, max: 300 },
    lootTable: [
      { itemId: 'sphinx_riddle', chance: 0.3, minAmount: 1, maxAmount: 1 },
      { itemId: 'ancient_knowledge', chance: 0.2, minAmount: 1, maxAmount: 1, rarity: 'epic' },
    ],
    slayerCategory: 'aberration',
    slayerXpReward: 120,
  }),

  pharaoh_lich: createMonster({
    id: 'pharaoh_lich',
    name: 'Lich Faraon',
    biome: 'desert',
    level: 42,
    maxHp: 1000,
    attack: 110,
    defense: 65,
    evasion: 20,
    attackSpeed: 25,
    xpReward: 600,
    goldReward: { min: 400, max: 800 },
    lootTable: [
      { itemId: 'pharaohs_crook', chance: 0.1, minAmount: 1, maxAmount: 1, rarity: 'legendary' },
      { itemId: 'death_mask', chance: 0.15, minAmount: 1, maxAmount: 1, rarity: 'epic' },
      { itemId: 'ancient_scarab', chance: 1.0, minAmount: 2, maxAmount: 5 },
    ],
    slayerCategory: 'undead',
    slayerXpReward: 220,
  }),

  // ============================================
  // MOUNTAINS (Level 35-55)
  // ============================================
  rock_golem: createMonster({
    id: 'rock_golem',
    name: 'Kamienny Golem',
    biome: 'mountains',
    level: 35,
    maxHp: 450,
    attack: 70,
    defense: 80,
    evasion: 0,
    attackSpeed: 40,
    xpReward: 260,
    goldReward: { min: 50, max: 100 },
    lootTable: [
      { itemId: 'golem_core', chance: 0.2, minAmount: 1, maxAmount: 1 },
      { itemId: 'enchanted_stone', chance: 0.4, minAmount: 1, maxAmount: 3 },
      { itemId: 'ore', chance: 0.6, minAmount: 2, maxAmount: 5 },
    ],
    slayerCategory: 'elemental',
    slayerXpReward: 85,
  }),

  harpy: createMonster({
    id: 'harpy',
    name: 'Harpia',
    biome: 'mountains',
    level: 38,
    maxHp: 300,
    attack: 85,
    defense: 40,
    evasion: 45,
    attackSpeed: 15,
    xpReward: 300,
    goldReward: { min: 80, max: 160 },
    lootTable: [
      { itemId: 'harpy_feather', chance: 0.5, minAmount: 1, maxAmount: 3 },
      { itemId: 'harpy_talon', chance: 0.3, minAmount: 1, maxAmount: 2 },
    ],
    slayerCategory: 'beast',
    slayerXpReward: 95,
  }),

  frost_giant: createMonster({
    id: 'frost_giant',
    name: 'Lodowy Gigant',
    biome: 'mountains',
    level: 42,
    maxHp: 700,
    attack: 100,
    defense: 60,
    evasion: 10,
    attackSpeed: 35,
    xpReward: 400,
    goldReward: { min: 150, max: 300 },
    lootTable: [
      { itemId: 'giant_heart', chance: 0.2, minAmount: 1, maxAmount: 1 },
      { itemId: 'frost_essence', chance: 0.3, minAmount: 1, maxAmount: 2 },
      { itemId: 'giant_bone', chance: 0.5, minAmount: 1, maxAmount: 3 },
    ],
    slayerCategory: 'elemental',
    slayerXpReward: 130,
  }),

  young_dragon: createMonster({
    id: 'young_dragon',
    name: 'Młody Smok',
    biome: 'mountains',
    level: 48,
    maxHp: 900,
    attack: 120,
    defense: 70,
    evasion: 25,
    attackSpeed: 25,
    xpReward: 550,
    goldReward: { min: 250, max: 500 },
    lootTable: [
      { itemId: 'dragon_scale', chance: 0.4, minAmount: 1, maxAmount: 3 },
      { itemId: 'dragon_claw', chance: 0.25, minAmount: 1, maxAmount: 2 },
      { itemId: 'dragon_blood', chance: 0.15, minAmount: 1, maxAmount: 1 },
    ],
    slayerCategory: 'dragon',
    slayerXpReward: 180,
  }),

  storm_elemental: createMonster({
    id: 'storm_elemental',
    name: 'Żywiołak Burzy',
    biome: 'mountains',
    level: 50,
    maxHp: 600,
    attack: 130,
    defense: 50,
    evasion: 35,
    attackSpeed: 18,
    xpReward: 500,
    goldReward: { min: 100, max: 200 },
    lootTable: [
      { itemId: 'storm_crystal', chance: 0.3, minAmount: 1, maxAmount: 2 },
      { itemId: 'lightning_essence', chance: 0.2, minAmount: 1, maxAmount: 1 },
    ],
    slayerCategory: 'elemental',
    slayerXpReward: 160,
  }),

  mountain_king: createMonster({
    id: 'mountain_king',
    name: 'Król Gór',
    biome: 'mountains',
    level: 55,
    maxHp: 1500,
    attack: 150,
    defense: 90,
    evasion: 15,
    attackSpeed: 30,
    xpReward: 800,
    goldReward: { min: 500, max: 1000 },
    lootTable: [
      { itemId: 'crown_of_peaks', chance: 0.1, minAmount: 1, maxAmount: 1, rarity: 'legendary' },
      { itemId: 'kings_greathammer', chance: 0.12, minAmount: 1, maxAmount: 1, rarity: 'epic' },
      { itemId: 'dragon_scale', chance: 1.0, minAmount: 3, maxAmount: 6 },
    ],
    slayerCategory: 'elemental',
    slayerXpReward: 280,
  }),

  // ============================================
  // VOLCANO (Level 45-65)
  // ============================================
  fire_elemental: createMonster({
    id: 'fire_elemental',
    name: 'Żywiołak Ognia',
    biome: 'volcano',
    level: 45,
    maxHp: 400,
    attack: 110,
    defense: 45,
    evasion: 30,
    attackSpeed: 18,
    xpReward: 380,
    goldReward: { min: 80, max: 160 },
    lootTable: [
      { itemId: 'infernal_ember', chance: 0.4, minAmount: 1, maxAmount: 2 },
      { itemId: 'fire_essence', chance: 0.25, minAmount: 1, maxAmount: 1 },
    ],
    slayerCategory: 'elemental',
    slayerXpReward: 120,
  }),

  lava_golem: createMonster({
    id: 'lava_golem',
    name: 'Lawowy Golem',
    biome: 'volcano',
    level: 50,
    maxHp: 800,
    attack: 100,
    defense: 100,
    evasion: 0,
    attackSpeed: 45,
    xpReward: 480,
    goldReward: { min: 100, max: 200 },
    lootTable: [
      { itemId: 'molten_core', chance: 0.2, minAmount: 1, maxAmount: 1 },
      { itemId: 'volcanic_glass', chance: 0.5, minAmount: 1, maxAmount: 3 },
    ],
    slayerCategory: 'elemental',
    slayerXpReward: 150,
  }),

  hell_hound: createMonster({
    id: 'hell_hound',
    name: 'Piekielny Ogar',
    biome: 'volcano',
    level: 52,
    maxHp: 500,
    attack: 130,
    defense: 55,
    evasion: 35,
    attackSpeed: 15,
    xpReward: 500,
    goldReward: { min: 120, max: 240 },
    lootTable: [
      { itemId: 'hellhound_fang', chance: 0.4, minAmount: 1, maxAmount: 2 },
      { itemId: 'brimstone', chance: 0.3, minAmount: 1, maxAmount: 3 },
    ],
    slayerCategory: 'demon',
    slayerXpReward: 160,
  }),

  demon_warrior: createMonster({
    id: 'demon_warrior',
    name: 'Demoniczny Wojownik',
    biome: 'volcano',
    level: 58,
    maxHp: 750,
    attack: 150,
    defense: 70,
    evasion: 25,
    attackSpeed: 22,
    xpReward: 650,
    goldReward: { min: 200, max: 400 },
    lootTable: [
      { itemId: 'demon_heart', chance: 0.2, minAmount: 1, maxAmount: 1 },
      { itemId: 'demonic_blade', chance: 0.08, minAmount: 1, maxAmount: 1, rarity: 'epic' },
      { itemId: 'hellfire_shard', chance: 0.35, minAmount: 1, maxAmount: 2 },
    ],
    slayerCategory: 'demon',
    slayerXpReward: 210,
  }),

  infernal: createMonster({
    id: 'infernal',
    name: 'Infernał',
    biome: 'volcano',
    level: 62,
    maxHp: 1000,
    attack: 170,
    defense: 80,
    evasion: 20,
    attackSpeed: 28,
    xpReward: 750,
    goldReward: { min: 300, max: 600 },
    lootTable: [
      { itemId: 'infernal_core', chance: 0.15, minAmount: 1, maxAmount: 1, rarity: 'rare' },
      { itemId: 'demon_heart', chance: 0.3, minAmount: 1, maxAmount: 1 },
      { itemId: 'infernal_ember', chance: 0.6, minAmount: 2, maxAmount: 4 },
    ],
    slayerCategory: 'demon',
    slayerXpReward: 240,
  }),

  lord_of_cinders: createMonster({
    id: 'lord_of_cinders',
    name: 'Władca Popiołów',
    biome: 'volcano',
    level: 68,
    maxHp: 2000,
    attack: 200,
    defense: 100,
    evasion: 15,
    attackSpeed: 25,
    xpReward: 1200,
    goldReward: { min: 800, max: 1500 },
    lootTable: [
      { itemId: 'cinder_lords_crown', chance: 0.08, minAmount: 1, maxAmount: 1, rarity: 'legendary' },
      { itemId: 'soul_of_cinder', chance: 0.15, minAmount: 1, maxAmount: 1, rarity: 'epic' },
      { itemId: 'demon_heart', chance: 1.0, minAmount: 2, maxAmount: 4 },
    ],
    slayerCategory: 'demon',
    slayerXpReward: 400,
  }),

  // ============================================
  // TUNDRA (Level 55-75)
  // ============================================
  frost_wraith: createMonster({
    id: 'frost_wraith',
    name: 'Mroźna Zjawa',
    biome: 'tundra',
    level: 55,
    maxHp: 450,
    attack: 140,
    defense: 50,
    evasion: 40,
    attackSpeed: 18,
    xpReward: 550,
    goldReward: { min: 100, max: 200 },
    lootTable: [
      { itemId: 'wraith_essence', chance: 0.35, minAmount: 1, maxAmount: 1 },
      { itemId: 'eternal_ice', chance: 0.2, minAmount: 1, maxAmount: 1 },
    ],
    slayerCategory: 'undead',
    slayerXpReward: 175,
  }),

  ice_troll: createMonster({
    id: 'ice_troll',
    name: 'Lodowy Troll',
    biome: 'tundra',
    level: 58,
    maxHp: 700,
    attack: 130,
    defense: 75,
    evasion: 10,
    attackSpeed: 32,
    xpReward: 600,
    goldReward: { min: 150, max: 300 },
    lootTable: [
      { itemId: 'troll_blood', chance: 0.5, minAmount: 1, maxAmount: 2 },
      { itemId: 'frozen_club', chance: 0.1, minAmount: 1, maxAmount: 1, rarity: 'rare' },
    ],
    slayerCategory: 'beast',
    slayerXpReward: 190,
  }),

  yeti: createMonster({
    id: 'yeti',
    name: 'Yeti',
    biome: 'tundra',
    level: 63,
    maxHp: 900,
    attack: 160,
    defense: 70,
    evasion: 15,
    attackSpeed: 28,
    xpReward: 720,
    goldReward: { min: 180, max: 360 },
    lootTable: [
      { itemId: 'yeti_fur', chance: 0.4, minAmount: 1, maxAmount: 2 },
      { itemId: 'yeti_claw', chance: 0.3, minAmount: 1, maxAmount: 2 },
    ],
    slayerCategory: 'beast',
    slayerXpReward: 230,
  }),

  frost_dragon: createMonster({
    id: 'frost_dragon',
    name: 'Mroźny Smok',
    biome: 'tundra',
    level: 70,
    maxHp: 1400,
    attack: 190,
    defense: 90,
    evasion: 25,
    attackSpeed: 25,
    xpReward: 950,
    goldReward: { min: 400, max: 800 },
    lootTable: [
      { itemId: 'frost_dragon_fang', chance: 0.25, minAmount: 1, maxAmount: 1 },
      { itemId: 'dragon_scale', chance: 0.5, minAmount: 2, maxAmount: 4 },
      { itemId: 'eternal_ice', chance: 0.3, minAmount: 1, maxAmount: 2 },
    ],
    slayerCategory: 'dragon',
    slayerXpReward: 310,
  }),

  ancient_ice_elemental: createMonster({
    id: 'ancient_ice_elemental',
    name: 'Pradawny Żywiołak Lodu',
    biome: 'tundra',
    level: 73,
    maxHp: 1100,
    attack: 180,
    defense: 100,
    evasion: 20,
    attackSpeed: 30,
    xpReward: 880,
    goldReward: { min: 250, max: 500 },
    lootTable: [
      { itemId: 'primordial_ice', chance: 0.2, minAmount: 1, maxAmount: 1, rarity: 'epic' },
      { itemId: 'eternal_ice', chance: 0.6, minAmount: 1, maxAmount: 3 },
    ],
    slayerCategory: 'elemental',
    slayerXpReward: 280,
  }),

  frost_emperor: createMonster({
    id: 'frost_emperor',
    name: 'Mroźny Cesarz',
    biome: 'tundra',
    level: 78,
    maxHp: 2500,
    attack: 220,
    defense: 120,
    evasion: 20,
    attackSpeed: 28,
    xpReward: 1500,
    goldReward: { min: 1000, max: 2000 },
    lootTable: [
      { itemId: 'emperors_crown_of_frost', chance: 0.08, minAmount: 1, maxAmount: 1, rarity: 'legendary' },
      { itemId: 'heart_of_winter', chance: 0.12, minAmount: 1, maxAmount: 1, rarity: 'epic' },
      { itemId: 'frost_dragon_fang', chance: 1.0, minAmount: 2, maxAmount: 4 },
    ],
    slayerCategory: 'elemental',
    slayerXpReward: 500,
  }),

  // ============================================
  // ABYSS (Level 70+)
  // ============================================
  void_stalker: createMonster({
    id: 'void_stalker',
    name: 'Łowca Pustki',
    biome: 'abyss',
    level: 70,
    maxHp: 800,
    attack: 180,
    defense: 60,
    evasion: 50,
    attackSpeed: 15,
    xpReward: 900,
    goldReward: { min: 200, max: 400 },
    lootTable: [
      { itemId: 'void_essence', chance: 0.35, minAmount: 1, maxAmount: 1 },
      { itemId: 'shadow_fang', chance: 0.25, minAmount: 1, maxAmount: 2 },
    ],
    slayerCategory: 'aberration',
    slayerXpReward: 290,
  }),

  chaos_spawn: createMonster({
    id: 'chaos_spawn',
    name: 'Pomiót Chaosu',
    biome: 'abyss',
    level: 74,
    maxHp: 1000,
    attack: 200,
    defense: 70,
    evasion: 30,
    attackSpeed: 20,
    xpReward: 1000,
    goldReward: { min: 300, max: 600 },
    lootTable: [
      { itemId: 'chaos_crystal', chance: 0.3, minAmount: 1, maxAmount: 1 },
      { itemId: 'mutated_flesh', chance: 0.5, minAmount: 1, maxAmount: 3 },
    ],
    slayerCategory: 'aberration',
    slayerXpReward: 320,
  }),

  abyssal_demon: createMonster({
    id: 'abyssal_demon',
    name: 'Demon Otchłani',
    biome: 'abyss',
    level: 78,
    maxHp: 1300,
    attack: 220,
    defense: 85,
    evasion: 25,
    attackSpeed: 22,
    xpReward: 1150,
    goldReward: { min: 400, max: 800 },
    lootTable: [
      { itemId: 'abyssal_whip', chance: 0.05, minAmount: 1, maxAmount: 1, rarity: 'legendary' },
      { itemId: 'demon_heart', chance: 0.3, minAmount: 1, maxAmount: 1 },
      { itemId: 'void_essence', chance: 0.4, minAmount: 1, maxAmount: 2 },
    ],
    slayerCategory: 'demon',
    slayerXpReward: 370,
  }),

  elder_horror: createMonster({
    id: 'elder_horror',
    name: 'Pradawna Zgroza',
    biome: 'abyss',
    level: 85,
    maxHp: 2000,
    attack: 260,
    defense: 100,
    evasion: 20,
    attackSpeed: 25,
    xpReward: 1500,
    goldReward: { min: 600, max: 1200 },
    lootTable: [
      { itemId: 'elder_rune', chance: 0.2, minAmount: 1, maxAmount: 1, rarity: 'epic' },
      { itemId: 'madness_shard', chance: 0.35, minAmount: 1, maxAmount: 2 },
      { itemId: 'void_essence', chance: 0.6, minAmount: 2, maxAmount: 4 },
    ],
    slayerCategory: 'aberration',
    slayerXpReward: 480,
  }),

  void_dragon: createMonster({
    id: 'void_dragon',
    name: 'Smok Pustki',
    biome: 'abyss',
    level: 90,
    maxHp: 2500,
    attack: 280,
    defense: 110,
    evasion: 30,
    attackSpeed: 23,
    xpReward: 1800,
    goldReward: { min: 800, max: 1500 },
    lootTable: [
      { itemId: 'void_dragon_scale', chance: 0.4, minAmount: 1, maxAmount: 3 },
      { itemId: 'dragon_blood', chance: 0.3, minAmount: 1, maxAmount: 2 },
      { itemId: 'void_essence', chance: 0.8, minAmount: 2, maxAmount: 5 },
    ],
    slayerCategory: 'dragon',
    slayerXpReward: 580,
  }),

  the_nameless_one: createMonster({
    id: 'the_nameless_one',
    name: 'Bezimienny',
    biome: 'abyss',
    level: 100,
    maxHp: 5000,
    attack: 350,
    defense: 150,
    evasion: 25,
    attackSpeed: 20,
    xpReward: 3000,
    goldReward: { min: 2000, max: 5000 },
    lootTable: [
      { itemId: 'heart_of_the_void', chance: 0.05, minAmount: 1, maxAmount: 1, rarity: 'mythic' },
      { itemId: 'nameless_blade', chance: 0.08, minAmount: 1, maxAmount: 1, rarity: 'legendary' },
      { itemId: 'chaos_crystal', chance: 1.0, minAmount: 3, maxAmount: 6 },
      { itemId: 'void_essence', chance: 1.0, minAmount: 5, maxAmount: 10 },
    ],
    slayerCategory: 'aberration',
    slayerXpReward: 1000,
  }),
};

// Helper functions
export function getMonster(id: string): Monster | undefined {
  return MONSTERS[id];
}

export function getMonstersByBiome(biomeId: BiomeId): Monster[] {
  return Object.values(MONSTERS).filter(m => m.biome === biomeId);
}

export function getMonstersForLevel(level: number, biomeId?: BiomeId): Monster[] {
  return Object.values(MONSTERS).filter(m =>
    m.level <= level + 5 &&
    m.level >= Math.max(1, level - 10) &&
    (!biomeId || m.biome === biomeId)
  );
}

export function getBossMonster(biomeId: BiomeId): Monster | undefined {
  const biome = BIOMES[biomeId];
  if (!biome?.bossId) return undefined;
  return MONSTERS[biome.bossId];
}

// Import biomes for boss lookup
import { BIOMES } from './biomes.data';
