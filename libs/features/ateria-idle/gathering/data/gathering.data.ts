/**
 * Gathering System Data - Resources, Nodes, Requirements
 * Mining, Woodcutting, Fishing, Herbalism
 */

import type { ItemRarity } from '@libs/entities/ateria-idle/warrior';

// ============================================
// TYPES
// ============================================

export type GatheringSkill = 'mining' | 'woodcutting' | 'fishing' | 'herbalism';

export interface GatheringResource {
  id: string;
  name: string;
  description: string;
  icon: string;
  skill: GatheringSkill;
  tier: number; // 1-7
  rarity: ItemRarity;
  requiredLevel: number;
  requiredPower: number; // Mining power, woodcutting power, etc.
  baseGatherTime: number; // Ticks (10 = 1 second)
  xpReward: number;
  sellPrice: number;
  usedInCrafting: string[]; // Crafting recipe IDs
}

export interface GatheringNode {
  id: string;
  name: string;
  description: string;
  icon: string;
  skill: GatheringSkill;
  biome: string;
  resources: GatheringNodeResource[];
  respawnTime: number; // Ticks
  maxUses: number; // Before depletion
}

export interface GatheringNodeResource {
  resourceId: string;
  weight: number; // Relative chance
  bonusAmount?: { min: number; max: number };
}

export interface GatheringSkillData {
  id: GatheringSkill;
  name: string;
  description: string;
  icon: string;
  color: string;
  powerStat: string; // What tool stat affects this
  baseXpPerLevel: number;
  xpScaling: number;
}

// ============================================
// SKILL DEFINITIONS
// ============================================

export const GATHERING_SKILLS: Record<GatheringSkill, GatheringSkillData> = {
  mining: {
    id: 'mining',
    name: 'Górnictwo',
    description: 'Wydobywanie rud, kamieni i klejnotów',
    icon: 'mdi-pickaxe',
    color: '#8D6E63',
    powerStat: 'miningPower',
    baseXpPerLevel: 100,
    xpScaling: 1.15,
  },
  woodcutting: {
    id: 'woodcutting',
    name: 'Drwalostwo',
    description: 'Ścinanie drzew i zbieranie drewna',
    icon: 'mdi-axe',
    color: '#4CAF50',
    powerStat: 'woodcuttingPower',
    baseXpPerLevel: 100,
    xpScaling: 1.15,
  },
  fishing: {
    id: 'fishing',
    name: 'Wędkarstwo',
    description: 'Łowienie ryb i zbieranie skarbów morskich',
    icon: 'mdi-fish',
    color: '#2196F3',
    powerStat: 'fishingPower',
    baseXpPerLevel: 100,
    xpScaling: 1.15,
  },
  herbalism: {
    id: 'herbalism',
    name: 'Zielarstwo',
    description: 'Zbieranie ziół i roślin',
    icon: 'mdi-flower',
    color: '#8BC34A',
    powerStat: 'herbalismPower',
    baseXpPerLevel: 100,
    xpScaling: 1.15,
  },
};

// ============================================
// MINING RESOURCES (7 tiers)
// ============================================

export const MINING_RESOURCES: Record<string, GatheringResource> = {
  // Tier 1 - Common Stones & Ores
  stone: {
    id: 'stone',
    name: 'Kamień',
    description: 'Zwykły kamień. Podstawowy materiał budowlany.',
    icon: 'mdi-cube',
    skill: 'mining',
    tier: 1,
    rarity: 'common',
    requiredLevel: 1,
    requiredPower: 0,
    baseGatherTime: 30,
    xpReward: 5,
    sellPrice: 2,
    usedInCrafting: ['stone_pickaxe', 'stone_axe', 'furnace'],
  },
  copper_ore: {
    id: 'copper_ore',
    name: 'Ruda Miedzi',
    description: 'Miękki metal, łatwy w obróbce.',
    icon: 'mdi-diamond-stone',
    skill: 'mining',
    tier: 1,
    rarity: 'common',
    requiredLevel: 1,
    requiredPower: 5,
    baseGatherTime: 50,
    xpReward: 10,
    sellPrice: 8,
    usedInCrafting: ['copper_ingot', 'copper_tools'],
  },
  tin_ore: {
    id: 'tin_ore',
    name: 'Ruda Cyny',
    description: 'Kruchy metal używany do tworzenia brązu.',
    icon: 'mdi-diamond-stone',
    skill: 'mining',
    tier: 1,
    rarity: 'common',
    requiredLevel: 3,
    requiredPower: 8,
    baseGatherTime: 55,
    xpReward: 12,
    sellPrice: 10,
    usedInCrafting: ['bronze_ingot'],
  },

  // Tier 2 - Uncommon Ores
  iron_ore: {
    id: 'iron_ore',
    name: 'Ruda Żelaza',
    description: 'Podstawowy metal do wytwarzania broni i narzędzi.',
    icon: 'mdi-diamond-stone',
    skill: 'mining',
    tier: 2,
    rarity: 'uncommon',
    requiredLevel: 10,
    requiredPower: 20,
    baseGatherTime: 80,
    xpReward: 25,
    sellPrice: 15,
    usedInCrafting: ['iron_ingot', 'iron_tools', 'steel_ingot'],
  },
  coal: {
    id: 'coal',
    name: 'Węgiel',
    description: 'Paliwo niezbędne do wytapiania metali.',
    icon: 'mdi-rhombus',
    skill: 'mining',
    tier: 2,
    rarity: 'uncommon',
    requiredLevel: 8,
    requiredPower: 15,
    baseGatherTime: 60,
    xpReward: 18,
    sellPrice: 12,
    usedInCrafting: ['steel_ingot', 'torch'],
  },
  silver_ore: {
    id: 'silver_ore',
    name: 'Ruda Srebra',
    description: 'Szlachetny metal używany w jubilerstwie.',
    icon: 'mdi-diamond-stone',
    skill: 'mining',
    tier: 2,
    rarity: 'uncommon',
    requiredLevel: 15,
    requiredPower: 30,
    baseGatherTime: 100,
    xpReward: 35,
    sellPrice: 25,
    usedInCrafting: ['silver_ingot', 'silver_jewelry'],
  },

  // Tier 3 - Rare Ores
  gold_ore: {
    id: 'gold_ore',
    name: 'Ruda Złota',
    description: 'Cenny metal wysoko ceniony przez kupców.',
    icon: 'mdi-gold',
    skill: 'mining',
    tier: 3,
    rarity: 'rare',
    requiredLevel: 25,
    requiredPower: 50,
    baseGatherTime: 150,
    xpReward: 60,
    sellPrice: 50,
    usedInCrafting: ['gold_ingot', 'gold_jewelry'],
  },
  mithril_ore: {
    id: 'mithril_ore',
    name: 'Ruda Mithrilu',
    description: 'Magiczny metal, lekki jak pióro, twardy jak diament.',
    icon: 'mdi-diamond-stone',
    skill: 'mining',
    tier: 3,
    rarity: 'rare',
    requiredLevel: 30,
    requiredPower: 70,
    baseGatherTime: 200,
    xpReward: 85,
    sellPrice: 80,
    usedInCrafting: ['mithril_ingot', 'mithril_equipment'],
  },

  // Tier 4 - Epic Ores
  adamantite_ore: {
    id: 'adamantite_ore',
    name: 'Ruda Adamantytu',
    description: 'Niezwykle twardy metal z głębin ziemi.',
    icon: 'mdi-diamond-stone',
    skill: 'mining',
    tier: 4,
    rarity: 'epic',
    requiredLevel: 45,
    requiredPower: 100,
    baseGatherTime: 300,
    xpReward: 150,
    sellPrice: 150,
    usedInCrafting: ['adamantite_ingot'],
  },
  orichalcum_ore: {
    id: 'orichalcum_ore',
    name: 'Ruda Orichalcum',
    description: 'Legendarny metal z zaginionego kontynentu.',
    icon: 'mdi-diamond-stone',
    skill: 'mining',
    tier: 4,
    rarity: 'epic',
    requiredLevel: 50,
    requiredPower: 120,
    baseGatherTime: 350,
    xpReward: 180,
    sellPrice: 180,
    usedInCrafting: ['orichalcum_ingot'],
  },

  // Tier 5 - Legendary Ores
  dragonite_ore: {
    id: 'dragonite_ore',
    name: 'Ruda Dragonitu',
    description: 'Krystalizowana esencja smoków.',
    icon: 'mdi-diamond-stone',
    skill: 'mining',
    tier: 5,
    rarity: 'legendary',
    requiredLevel: 65,
    requiredPower: 180,
    baseGatherTime: 500,
    xpReward: 300,
    sellPrice: 350,
    usedInCrafting: ['dragonite_ingot'],
  },

  // Tier 6 - Mythic Ores
  void_ore: {
    id: 'void_ore',
    name: 'Ruda Pustki',
    description: 'Metal z innego wymiaru, pochłaniający światło.',
    icon: 'mdi-diamond-stone',
    skill: 'mining',
    tier: 6,
    rarity: 'mythic',
    requiredLevel: 80,
    requiredPower: 250,
    baseGatherTime: 700,
    xpReward: 500,
    sellPrice: 600,
    usedInCrafting: ['void_ingot'],
  },

  // Gemstones (all tiers)
  quartz: {
    id: 'quartz',
    name: 'Kwarc',
    description: 'Pospolity kryształ o wielu zastosowaniach.',
    icon: 'mdi-diamond',
    skill: 'mining',
    tier: 1,
    rarity: 'common',
    requiredLevel: 5,
    requiredPower: 10,
    baseGatherTime: 60,
    xpReward: 15,
    sellPrice: 15,
    usedInCrafting: ['quartz_jewelry', 'lens'],
  },
  amethyst: {
    id: 'amethyst',
    name: 'Ametyst',
    description: 'Fioletowy kamień szlachetny o magicznych właściwościach.',
    icon: 'mdi-diamond',
    skill: 'mining',
    tier: 2,
    rarity: 'uncommon',
    requiredLevel: 15,
    requiredPower: 25,
    baseGatherTime: 90,
    xpReward: 30,
    sellPrice: 35,
    usedInCrafting: ['amethyst_ring', 'magic_focus'],
  },
  ruby: {
    id: 'ruby',
    name: 'Rubin',
    description: 'Ognisty kamień wzmacniający siłę.',
    icon: 'mdi-diamond',
    skill: 'mining',
    tier: 3,
    rarity: 'rare',
    requiredLevel: 30,
    requiredPower: 60,
    baseGatherTime: 180,
    xpReward: 75,
    sellPrice: 100,
    usedInCrafting: ['ruby_amulet', 'fire_enchant'],
  },
  sapphire: {
    id: 'sapphire',
    name: 'Szafir',
    description: 'Niebieski kamień wzmacniający magię.',
    icon: 'mdi-diamond',
    skill: 'mining',
    tier: 3,
    rarity: 'rare',
    requiredLevel: 32,
    requiredPower: 65,
    baseGatherTime: 190,
    xpReward: 80,
    sellPrice: 110,
    usedInCrafting: ['sapphire_ring', 'frost_enchant'],
  },
  emerald: {
    id: 'emerald',
    name: 'Szmaragd',
    description: 'Zielony kamień życia i natury.',
    icon: 'mdi-diamond',
    skill: 'mining',
    tier: 4,
    rarity: 'epic',
    requiredLevel: 48,
    requiredPower: 110,
    baseGatherTime: 280,
    xpReward: 140,
    sellPrice: 200,
    usedInCrafting: ['emerald_amulet', 'nature_enchant'],
  },
  diamond: {
    id: 'diamond',
    name: 'Diament',
    description: 'Najtwardszy i najcenniejszy kamień.',
    icon: 'mdi-diamond',
    skill: 'mining',
    tier: 5,
    rarity: 'legendary',
    requiredLevel: 60,
    requiredPower: 160,
    baseGatherTime: 450,
    xpReward: 280,
    sellPrice: 500,
    usedInCrafting: ['diamond_tools', 'diamond_jewelry'],
  },
  void_crystal: {
    id: 'void_crystal',
    name: 'Kryształ Pustki',
    description: 'Kryształ z innego wymiaru, pulsujący mroczną energią.',
    icon: 'mdi-diamond',
    skill: 'mining',
    tier: 6,
    rarity: 'mythic',
    requiredLevel: 85,
    requiredPower: 280,
    baseGatherTime: 800,
    xpReward: 600,
    sellPrice: 1000,
    usedInCrafting: ['void_equipment', 'dimensional_portal'],
  },
};

// ============================================
// WOODCUTTING RESOURCES (7 tiers)
// ============================================

export const WOODCUTTING_RESOURCES: Record<string, GatheringResource> = {
  // Tier 1 - Common Woods
  oak_wood: {
    id: 'oak_wood',
    name: 'Drewno Dębowe',
    description: 'Solidne drewno z dębu. Podstawowy materiał.',
    icon: 'mdi-tree',
    skill: 'woodcutting',
    tier: 1,
    rarity: 'common',
    requiredLevel: 1,
    requiredPower: 0,
    baseGatherTime: 40,
    xpReward: 8,
    sellPrice: 5,
    usedInCrafting: ['wooden_tools', 'basic_furniture'],
  },
  birch_wood: {
    id: 'birch_wood',
    name: 'Drewno Brzozowe',
    description: 'Jasne, elastyczne drewno brzozowe.',
    icon: 'mdi-tree',
    skill: 'woodcutting',
    tier: 1,
    rarity: 'common',
    requiredLevel: 3,
    requiredPower: 5,
    baseGatherTime: 45,
    xpReward: 10,
    sellPrice: 7,
    usedInCrafting: ['bow_stave', 'paper'],
  },
  pine_wood: {
    id: 'pine_wood',
    name: 'Drewno Sosnowe',
    description: 'Miękkie drewno iglaste, pachnące żywicą.',
    icon: 'mdi-pine-tree',
    skill: 'woodcutting',
    tier: 1,
    rarity: 'common',
    requiredLevel: 5,
    requiredPower: 8,
    baseGatherTime: 50,
    xpReward: 12,
    sellPrice: 8,
    usedInCrafting: ['torch', 'resin'],
  },

  // Tier 2 - Uncommon Woods
  maple_wood: {
    id: 'maple_wood',
    name: 'Drewno Klonowe',
    description: 'Twarde drewno klonu, idealne na instrumenty.',
    icon: 'mdi-tree',
    skill: 'woodcutting',
    tier: 2,
    rarity: 'uncommon',
    requiredLevel: 12,
    requiredPower: 20,
    baseGatherTime: 70,
    xpReward: 22,
    sellPrice: 15,
    usedInCrafting: ['maple_bow', 'instrument'],
  },
  willow_wood: {
    id: 'willow_wood',
    name: 'Drewno Wierzbowe',
    description: 'Elastyczne drewno o magicznych właściwościach.',
    icon: 'mdi-tree',
    skill: 'woodcutting',
    tier: 2,
    rarity: 'uncommon',
    requiredLevel: 15,
    requiredPower: 28,
    baseGatherTime: 85,
    xpReward: 30,
    sellPrice: 20,
    usedInCrafting: ['magic_staff', 'wand'],
  },

  // Tier 3 - Rare Woods
  yew_wood: {
    id: 'yew_wood',
    name: 'Drewno Cisowe',
    description: 'Legendarne drewno najlepszych łuków.',
    icon: 'mdi-tree',
    skill: 'woodcutting',
    tier: 3,
    rarity: 'rare',
    requiredLevel: 28,
    requiredPower: 55,
    baseGatherTime: 140,
    xpReward: 65,
    sellPrice: 60,
    usedInCrafting: ['yew_longbow', 'elite_furniture'],
  },
  mahogany_wood: {
    id: 'mahogany_wood',
    name: 'Drewno Mahoniowe',
    description: 'Ciemne, szlachetne drewno egzotyczne.',
    icon: 'mdi-tree',
    skill: 'woodcutting',
    tier: 3,
    rarity: 'rare',
    requiredLevel: 32,
    requiredPower: 65,
    baseGatherTime: 160,
    xpReward: 75,
    sellPrice: 75,
    usedInCrafting: ['luxury_furniture', 'ship_parts'],
  },

  // Tier 4 - Epic Woods
  ironwood: {
    id: 'ironwood',
    name: 'Żelazne Drewno',
    description: 'Drewno twarde jak metal, niemal niezniszczalne.',
    icon: 'mdi-tree',
    skill: 'woodcutting',
    tier: 4,
    rarity: 'epic',
    requiredLevel: 48,
    requiredPower: 105,
    baseGatherTime: 280,
    xpReward: 140,
    sellPrice: 140,
    usedInCrafting: ['ironwood_shield', 'fortress_gate'],
  },
  bloodwood: {
    id: 'bloodwood',
    name: 'Krwawe Drewno',
    description: 'Czerwone drewno z drzew rosnących na polach bitew.',
    icon: 'mdi-tree',
    skill: 'woodcutting',
    tier: 4,
    rarity: 'epic',
    requiredLevel: 52,
    requiredPower: 115,
    baseGatherTime: 320,
    xpReward: 160,
    sellPrice: 160,
    usedInCrafting: ['blood_staff', 'vampiric_weapon'],
  },

  // Tier 5 - Legendary Woods
  world_tree_branch: {
    id: 'world_tree_branch',
    name: 'Gałąź Drzewa Świata',
    description: 'Fragment mitycznego Drzewa Świata.',
    icon: 'mdi-tree',
    skill: 'woodcutting',
    tier: 5,
    rarity: 'legendary',
    requiredLevel: 68,
    requiredPower: 175,
    baseGatherTime: 480,
    xpReward: 280,
    sellPrice: 350,
    usedInCrafting: ['legendary_staff', 'world_tree_bow'],
  },

  // Tier 6 - Mythic Woods
  spirit_wood: {
    id: 'spirit_wood',
    name: 'Duchowe Drewno',
    description: 'Drewno z drzew rosnących w świecie duchów.',
    icon: 'mdi-tree',
    skill: 'woodcutting',
    tier: 6,
    rarity: 'mythic',
    requiredLevel: 82,
    requiredPower: 260,
    baseGatherTime: 700,
    xpReward: 480,
    sellPrice: 700,
    usedInCrafting: ['spirit_weapon', 'ghost_ship'],
  },
};

// ============================================
// FISHING RESOURCES (7 tiers)
// ============================================

export const FISHING_RESOURCES: Record<string, GatheringResource> = {
  // Tier 1
  carp: {
    id: 'carp',
    name: 'Karp',
    description: 'Pospolita ryba słodkowodna.',
    icon: 'mdi-fish',
    skill: 'fishing',
    tier: 1,
    rarity: 'common',
    requiredLevel: 1,
    requiredPower: 0,
    baseGatherTime: 40,
    xpReward: 8,
    sellPrice: 5,
    usedInCrafting: ['fish_fillet', 'fish_oil'],
  },
  trout: {
    id: 'trout',
    name: 'Pstrąg',
    description: 'Smaczna ryba rzeczna.',
    icon: 'mdi-fish',
    skill: 'fishing',
    tier: 1,
    rarity: 'common',
    requiredLevel: 5,
    requiredPower: 8,
    baseGatherTime: 50,
    xpReward: 12,
    sellPrice: 8,
    usedInCrafting: ['grilled_trout'],
  },

  // Tier 2
  salmon: {
    id: 'salmon',
    name: 'Łosoś',
    description: 'Wartościowa ryba migrująca.',
    icon: 'mdi-fish',
    skill: 'fishing',
    tier: 2,
    rarity: 'uncommon',
    requiredLevel: 15,
    requiredPower: 25,
    baseGatherTime: 80,
    xpReward: 28,
    sellPrice: 20,
    usedInCrafting: ['sushi', 'omega_oil'],
  },
  lobster: {
    id: 'lobster',
    name: 'Homar',
    description: 'Luksusowy skorupiak.',
    icon: 'mdi-ladybug',
    skill: 'fishing',
    tier: 2,
    rarity: 'uncommon',
    requiredLevel: 18,
    requiredPower: 32,
    baseGatherTime: 100,
    xpReward: 35,
    sellPrice: 30,
    usedInCrafting: ['lobster_feast'],
  },

  // Tier 3
  swordfish: {
    id: 'swordfish',
    name: 'Miecznik',
    description: 'Szybka i niebezpieczna ryba morska.',
    icon: 'mdi-fish',
    skill: 'fishing',
    tier: 3,
    rarity: 'rare',
    requiredLevel: 30,
    requiredPower: 55,
    baseGatherTime: 160,
    xpReward: 70,
    sellPrice: 65,
    usedInCrafting: ['swordfish_steak', 'fish_blade'],
  },
  giant_squid: {
    id: 'giant_squid',
    name: 'Gigantyczna Kałamarnica',
    description: 'Rzadki potwór głębin.',
    icon: 'mdi-octopus',
    skill: 'fishing',
    tier: 3,
    rarity: 'rare',
    requiredLevel: 35,
    requiredPower: 68,
    baseGatherTime: 200,
    xpReward: 90,
    sellPrice: 85,
    usedInCrafting: ['squid_ink', 'tentacle_armor'],
  },

  // Tier 4
  anglerfish: {
    id: 'anglerfish',
    name: 'Żabnica',
    description: 'Przerażająca ryba głębinowa.',
    icon: 'mdi-fish',
    skill: 'fishing',
    tier: 4,
    rarity: 'epic',
    requiredLevel: 50,
    requiredPower: 110,
    baseGatherTime: 300,
    xpReward: 150,
    sellPrice: 150,
    usedInCrafting: ['deep_sea_lantern', 'angler_bait'],
  },

  // Tier 5
  golden_fish: {
    id: 'golden_fish',
    name: 'Złota Ryba',
    description: 'Legendarna ryba spełniająca życzenia.',
    icon: 'mdi-fish',
    skill: 'fishing',
    tier: 5,
    rarity: 'legendary',
    requiredLevel: 65,
    requiredPower: 170,
    baseGatherTime: 500,
    xpReward: 300,
    sellPrice: 400,
    usedInCrafting: ['wish_scale', 'golden_bait'],
  },

  // Tier 6
  leviathan_scale: {
    id: 'leviathan_scale',
    name: 'Łuska Lewiatana',
    description: 'Fragment morskiego potwora.',
    icon: 'mdi-shield',
    skill: 'fishing',
    tier: 6,
    rarity: 'mythic',
    requiredLevel: 80,
    requiredPower: 250,
    baseGatherTime: 750,
    xpReward: 550,
    sellPrice: 800,
    usedInCrafting: ['leviathan_armor', 'sea_god_weapon'],
  },

  // Special
  pearl: {
    id: 'pearl',
    name: 'Perła',
    description: 'Rzadka perła z muszli.',
    icon: 'mdi-circle',
    skill: 'fishing',
    tier: 3,
    rarity: 'rare',
    requiredLevel: 25,
    requiredPower: 45,
    baseGatherTime: 180,
    xpReward: 65,
    sellPrice: 80,
    usedInCrafting: ['pearl_necklace', 'pearl_dust'],
  },
  black_pearl: {
    id: 'black_pearl',
    name: 'Czarna Perła',
    description: 'Niezwykle rzadka perła o mrocznym blasku.',
    icon: 'mdi-circle',
    skill: 'fishing',
    tier: 5,
    rarity: 'legendary',
    requiredLevel: 60,
    requiredPower: 160,
    baseGatherTime: 480,
    xpReward: 280,
    sellPrice: 450,
    usedInCrafting: ['black_pearl_ring', 'pirate_curse'],
  },
};

// ============================================
// HERBALISM RESOURCES (7 tiers)
// ============================================

export const HERBALISM_RESOURCES: Record<string, GatheringResource> = {
  // Tier 1
  healing_herb: {
    id: 'healing_herb',
    name: 'Zioło Lecznicze',
    description: 'Podstawowe zioło o właściwościach leczniczych.',
    icon: 'mdi-leaf',
    skill: 'herbalism',
    tier: 1,
    rarity: 'common',
    requiredLevel: 1,
    requiredPower: 0,
    baseGatherTime: 30,
    xpReward: 6,
    sellPrice: 4,
    usedInCrafting: ['health_potion_small', 'bandage'],
  },
  lavender: {
    id: 'lavender',
    name: 'Lawenda',
    description: 'Pachnące zioło o uspokajających właściwościach.',
    icon: 'mdi-flower',
    skill: 'herbalism',
    tier: 1,
    rarity: 'common',
    requiredLevel: 3,
    requiredPower: 5,
    baseGatherTime: 35,
    xpReward: 8,
    sellPrice: 5,
    usedInCrafting: ['calming_potion', 'perfume'],
  },
  mint: {
    id: 'mint',
    name: 'Mięta',
    description: 'Orzeźwiające zioło do mikstur.',
    icon: 'mdi-leaf',
    skill: 'herbalism',
    tier: 1,
    rarity: 'common',
    requiredLevel: 5,
    requiredPower: 8,
    baseGatherTime: 40,
    xpReward: 10,
    sellPrice: 6,
    usedInCrafting: ['stamina_potion', 'tea'],
  },

  // Tier 2
  bloodroot: {
    id: 'bloodroot',
    name: 'Krwawnik',
    description: 'Czerwone zioło wzmacniające krew.',
    icon: 'mdi-flower',
    skill: 'herbalism',
    tier: 2,
    rarity: 'uncommon',
    requiredLevel: 12,
    requiredPower: 22,
    baseGatherTime: 70,
    xpReward: 25,
    sellPrice: 18,
    usedInCrafting: ['strength_potion', 'blood_elixir'],
  },
  ghostcap_mushroom: {
    id: 'ghostcap_mushroom',
    name: 'Grzyb Duchów',
    description: 'Blady grzyb rosnący w ciemnych miejscach.',
    icon: 'mdi-mushroom',
    skill: 'herbalism',
    tier: 2,
    rarity: 'uncommon',
    requiredLevel: 15,
    requiredPower: 28,
    baseGatherTime: 85,
    xpReward: 32,
    sellPrice: 25,
    usedInCrafting: ['invisibility_potion', 'ghost_oil'],
  },

  // Tier 3
  fire_blossom: {
    id: 'fire_blossom',
    name: 'Ognisty Kwiat',
    description: 'Płonący kwiat z wulkanicznych terenów.',
    icon: 'mdi-flower',
    skill: 'herbalism',
    tier: 3,
    rarity: 'rare',
    requiredLevel: 28,
    requiredPower: 58,
    baseGatherTime: 150,
    xpReward: 70,
    sellPrice: 70,
    usedInCrafting: ['fire_resistance', 'flame_elixir'],
  },
  moonshade: {
    id: 'moonshade',
    name: 'Cień Księżyca',
    description: 'Rzadkie zioło rosnące tylko w świetle księżyca.',
    icon: 'mdi-weather-night',
    skill: 'herbalism',
    tier: 3,
    rarity: 'rare',
    requiredLevel: 32,
    requiredPower: 65,
    baseGatherTime: 170,
    xpReward: 80,
    sellPrice: 85,
    usedInCrafting: ['wisdom_potion', 'moon_elixir'],
  },

  // Tier 4
  dragons_breath: {
    id: 'dragons_breath_herb',
    name: 'Oddech Smoka',
    description: 'Legendarny kwiat z gór smoczych.',
    icon: 'mdi-fire',
    skill: 'herbalism',
    tier: 4,
    rarity: 'epic',
    requiredLevel: 50,
    requiredPower: 115,
    baseGatherTime: 320,
    xpReward: 165,
    sellPrice: 180,
    usedInCrafting: ['dragon_elixir', 'fire_breath_potion'],
  },

  // Tier 5
  life_blossom: {
    id: 'life_blossom',
    name: 'Kwiat Życia',
    description: 'Święty kwiat przywracający życie.',
    icon: 'mdi-flower',
    skill: 'herbalism',
    tier: 5,
    rarity: 'legendary',
    requiredLevel: 65,
    requiredPower: 175,
    baseGatherTime: 500,
    xpReward: 300,
    sellPrice: 380,
    usedInCrafting: ['resurrection_elixir', 'immortality_serum'],
  },

  // Tier 6
  void_lotus: {
    id: 'void_lotus',
    name: 'Lotos Pustki',
    description: 'Kwiat rosnący między wymiarami.',
    icon: 'mdi-flower',
    skill: 'herbalism',
    tier: 6,
    rarity: 'mythic',
    requiredLevel: 80,
    requiredPower: 255,
    baseGatherTime: 720,
    xpReward: 520,
    sellPrice: 750,
    usedInCrafting: ['dimension_potion', 'void_elixir'],
  },
};

// ============================================
// ALL RESOURCES COMBINED
// ============================================

export const ALL_GATHERING_RESOURCES: Record<string, GatheringResource> = {
  ...MINING_RESOURCES,
  ...WOODCUTTING_RESOURCES,
  ...FISHING_RESOURCES,
  ...HERBALISM_RESOURCES,
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getGatheringResource(id: string): GatheringResource | undefined {
  return ALL_GATHERING_RESOURCES[id];
}

export function getResourcesBySkill(skill: GatheringSkill): GatheringResource[] {
  return Object.values(ALL_GATHERING_RESOURCES).filter(r => r.skill === skill);
}

export function getResourcesByTier(skill: GatheringSkill, tier: number): GatheringResource[] {
  return Object.values(ALL_GATHERING_RESOURCES).filter(r => r.skill === skill && r.tier === tier);
}

export function getAvailableResources(skill: GatheringSkill, level: number, power: number): GatheringResource[] {
  return Object.values(ALL_GATHERING_RESOURCES).filter(
    r => r.skill === skill && r.requiredLevel <= level && r.requiredPower <= power
  );
}

export function calculateGatherTime(
  resource: GatheringResource,
  skillLevel: number,
  power: number,
  toolBonus: number = 0
): number {
  // Base time reduced by skill level and power
  const levelReduction = 1 - Math.min(0.5, skillLevel * 0.01); // Up to 50% reduction
  const powerReduction = power > resource.requiredPower
    ? 1 - Math.min(0.3, (power - resource.requiredPower) * 0.005) // Up to 30% reduction
    : 1;
  const toolReduction = 1 - Math.min(0.4, toolBonus * 0.01); // Up to 40% from tools

  return Math.max(10, Math.floor(resource.baseGatherTime * levelReduction * powerReduction * toolReduction));
}

export function calculateXpToLevel(level: number, skill: GatheringSkill): number {
  const skillData = GATHERING_SKILLS[skill];
  return Math.floor(skillData.baseXpPerLevel * Math.pow(skillData.xpScaling, level - 1));
}
