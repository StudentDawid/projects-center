/**
 * Equipment Data - Weapons, Armor, Accessories
 * Data-Driven Design for Ateria Idle
 */

import type { Equipment, EquipmentSlot, ItemRarity } from '@projects-center/entities/ateria-idle/warrior';

// ============================================
// HELPER FUNCTIONS
// ============================================

function createWeapon(
  id: string,
  name: string,
  tier: number,
  rarity: ItemRarity,
  stats: {
    attack: number;
    accuracy?: number;
    critChance?: number;
    critMultiplier?: number;
  },
  requiredLevel: number,
): Equipment {
  return {
    id,
    name,
    slot: 'weapon',
    rarity,
    stats: {
      attack: stats.attack,
      accuracy: stats.accuracy || 0,
      critChance: stats.critChance || 0,
      critMultiplier: stats.critMultiplier || 0,
    },
    requirements: { level: requiredLevel },
  };
}

function createArmor(
  id: string,
  name: string,
  slot: EquipmentSlot,
  tier: number,
  rarity: ItemRarity,
  stats: {
    defense: number;
    maxHp?: number;
    evasion?: number;
    hpRegen?: number;
  },
  requiredLevel: number,
): Equipment {
  return {
    id,
    name,
    slot,
    rarity,
    stats: {
      defense: stats.defense,
      maxHp: stats.maxHp || 0,
      evasion: stats.evasion || 0,
      hpRegen: stats.hpRegen || 0,
    },
    requirements: { level: requiredLevel },
  };
}

function createAccessory(
  id: string,
  name: string,
  rarity: ItemRarity,
  stats: Partial<Equipment['stats']>,
  requiredLevel: number,
): Equipment {
  return {
    id,
    name,
    slot: 'accessory',
    rarity,
    stats,
    requirements: { level: requiredLevel },
  };
}

// ============================================
// WEAPONS
// ============================================

export const WEAPONS: Equipment[] = [
  // Tier 1 - Forest (Level 1-10)
  createWeapon('wooden_sword', 'Drewniany Miecz', 1, 'common', { attack: 3 }, 1),
  createWeapon('rusty_dagger', 'Zardzewiały Sztylet', 1, 'common', { attack: 2, critChance: 0.02 }, 1),
  createWeapon('wooden_club', 'Drewniana Maczuga', 1, 'common', { attack: 4, accuracy: -5 }, 1),
  createWeapon('hunter_bow', 'Łuk Myśliwego', 1, 'uncommon', { attack: 5, accuracy: 5 }, 3),
  createWeapon('iron_sword', 'Żelazny Miecz', 1, 'uncommon', { attack: 7 }, 5),
  createWeapon('steel_dagger', 'Stalowy Sztylet', 1, 'uncommon', { attack: 5, critChance: 0.05, critMultiplier: 0.2 }, 5),
  createWeapon('forest_blade', 'Ostrze Lasu', 1, 'rare', { attack: 12, accuracy: 3, critChance: 0.03 }, 8),

  // Tier 2 - Plains/Swamp (Level 10-25)
  createWeapon('steel_sword', 'Stalowy Miecz', 2, 'uncommon', { attack: 15, accuracy: 2 }, 10),
  createWeapon('battle_axe', 'Topór Bojowy', 2, 'uncommon', { attack: 18, accuracy: -3, critMultiplier: 0.3 }, 12),
  createWeapon('swift_rapier', 'Szybka Rapiera', 2, 'rare', { attack: 14, accuracy: 8, critChance: 0.08 }, 15),
  createWeapon('swamp_cleaver', 'Tasak Bagien', 2, 'rare', { attack: 22, accuracy: -2 }, 18),
  createWeapon('serpent_fang', 'Kieł Węża', 2, 'rare', { attack: 16, critChance: 0.1, critMultiplier: 0.4 }, 20),
  createWeapon('knights_longsword', 'Długi Miecz Rycerza', 2, 'epic', { attack: 28, accuracy: 5, critChance: 0.05 }, 22),

  // Tier 3 - Desert/Mountains (Level 25-50)
  createWeapon('desert_scimitar', 'Scymitar Pustyni', 3, 'rare', { attack: 32, accuracy: 6, critChance: 0.06 }, 25),
  createWeapon('sandstorm_blade', 'Ostrze Burzy Piaskowej', 3, 'rare', { attack: 35, accuracy: 3 }, 28),
  createWeapon('mountain_hammer', 'Młot Gór', 3, 'epic', { attack: 45, accuracy: -5, critMultiplier: 0.6 }, 32),
  createWeapon('crystal_sword', 'Kryształowy Miecz', 3, 'epic', { attack: 42, accuracy: 8, critChance: 0.08 }, 38),
  createWeapon('giants_cleaver', 'Tasak Giganta', 3, 'epic', { attack: 55, accuracy: -8, critMultiplier: 0.5 }, 42),
  createWeapon('echoing_blade', 'Ostrze Echa', 3, 'legendary', { attack: 60, accuracy: 10, critChance: 0.1, critMultiplier: 0.3 }, 48),

  // Tier 4 - Volcano/Tundra/Abyss (Level 50+)
  createWeapon('volcanic_greatsword', 'Wielki Miecz Wulkanu', 4, 'epic', { attack: 70, accuracy: 5, critChance: 0.07 }, 50),
  createWeapon('frozen_blade', 'Zamrożone Ostrze', 4, 'epic', { attack: 65, accuracy: 12, critChance: 0.12 }, 55),
  createWeapon('inferno_axe', 'Topór Piekieł', 4, 'legendary', { attack: 85, accuracy: 0, critMultiplier: 0.8 }, 60),
  createWeapon('frostbite', 'Odmrożenie', 4, 'legendary', { attack: 78, accuracy: 15, critChance: 0.15 }, 65),
  createWeapon('abyssal_blade', 'Ostrze Otchłani', 4, 'legendary', { attack: 95, accuracy: 8, critChance: 0.1, critMultiplier: 0.5 }, 75),
  createWeapon('dragonslayer', 'Smoczy Pogromca', 4, 'mythic', { attack: 120, accuracy: 12, critChance: 0.12, critMultiplier: 0.6 }, 85),
  createWeapon('void_reaper', 'Żniwiarz Pustki', 4, 'mythic', { attack: 150, accuracy: 15, critChance: 0.15, critMultiplier: 0.8 }, 95),
];

// ============================================
// ARMOR (Body)
// ============================================

export const ARMORS: Equipment[] = [
  // Tier 1
  createArmor('leather_vest', 'Skórzana Kamizelka', 'armor', 1, 'common', { defense: 3, maxHp: 10 }, 1),
  createArmor('padded_armor', 'Pikowana Zbroja', 'armor', 1, 'common', { defense: 5, maxHp: 15 }, 3),
  createArmor('chainmail', 'Kolczuga', 'armor', 1, 'uncommon', { defense: 8, maxHp: 20 }, 5),
  createArmor('iron_plate', 'Żelazna Płyta', 'armor', 1, 'uncommon', { defense: 12, maxHp: 30 }, 8),
  createArmor('forest_mail', 'Kolczuga Lasu', 'armor', 1, 'rare', { defense: 15, maxHp: 40, evasion: 3 }, 10),

  // Tier 2
  createArmor('steel_plate', 'Stalowa Płyta', 'armor', 2, 'uncommon', { defense: 20, maxHp: 50 }, 12),
  createArmor('brigandine', 'Brigantyna', 'armor', 2, 'rare', { defense: 25, maxHp: 60, evasion: 2 }, 16),
  createArmor('swamp_leather', 'Skóra Bagien', 'armor', 2, 'rare', { defense: 18, maxHp: 45, evasion: 8 }, 18),
  createArmor('knights_plate', 'Zbroja Rycerza', 'armor', 2, 'epic', { defense: 35, maxHp: 80 }, 22),

  // Tier 3
  createArmor('desert_mail', 'Kolczuga Pustyni', 'armor', 3, 'rare', { defense: 40, maxHp: 90, evasion: 5 }, 28),
  createArmor('mountain_plate', 'Płyta Gór', 'armor', 3, 'epic', { defense: 55, maxHp: 120 }, 35),
  createArmor('crystal_armor', 'Kryształowa Zbroja', 'armor', 3, 'epic', { defense: 50, maxHp: 100, hpRegen: 0.5 }, 42),
  createArmor('titans_guard', 'Straż Tytana', 'armor', 3, 'legendary', { defense: 70, maxHp: 150 }, 48),

  // Tier 4
  createArmor('volcanic_plate', 'Wulkaniczna Płyta', 'armor', 4, 'epic', { defense: 80, maxHp: 180 }, 55),
  createArmor('frozen_mail', 'Zamrożona Kolczuga', 'armor', 4, 'legendary', { defense: 90, maxHp: 200, evasion: 8 }, 65),
  createArmor('dragonscale', 'Smocza Łuska', 'armor', 4, 'legendary', { defense: 110, maxHp: 250 }, 80),
  createArmor('abyssal_plate', 'Płyta Otchłani', 'armor', 4, 'mythic', { defense: 140, maxHp: 350, hpRegen: 2 }, 95),
];

// ============================================
// HELMETS
// ============================================

export const HELMETS: Equipment[] = [
  // Tier 1
  createArmor('leather_cap', 'Skórzana Czapka', 'helmet', 1, 'common', { defense: 1, maxHp: 5 }, 1),
  createArmor('iron_helm', 'Żelazny Hełm', 'helmet', 1, 'uncommon', { defense: 4, maxHp: 10 }, 5),
  createArmor('steel_helm', 'Stalowy Hełm', 'helmet', 1, 'rare', { defense: 6, maxHp: 15 }, 8),

  // Tier 2
  createArmor('knights_helm', 'Hełm Rycerza', 'helmet', 2, 'rare', { defense: 10, maxHp: 25 }, 15),
  createArmor('visored_helm', 'Hełm z Przyłbicą', 'helmet', 2, 'epic', { defense: 15, maxHp: 35 }, 22),

  // Tier 3
  createArmor('desert_hood', 'Kaptur Pustyni', 'helmet', 3, 'rare', { defense: 12, maxHp: 20, evasion: 5 }, 28),
  createArmor('mountain_crown', 'Korona Gór', 'helmet', 3, 'epic', { defense: 22, maxHp: 50 }, 40),
  createArmor('crystal_crown', 'Kryształowa Korona', 'helmet', 3, 'legendary', { defense: 28, maxHp: 60, hpRegen: 0.3 }, 48),

  // Tier 4
  createArmor('volcanic_visage', 'Wulkaniczna Maska', 'helmet', 4, 'epic', { defense: 35, maxHp: 80 }, 55),
  createArmor('dragon_helm', 'Smocza Maska', 'helmet', 4, 'legendary', { defense: 45, maxHp: 100 }, 75),
  createArmor('void_crown', 'Korona Pustki', 'helmet', 4, 'mythic', { defense: 55, maxHp: 130 }, 90),
];

// ============================================
// BOOTS
// ============================================

export const BOOTS: Equipment[] = [
  // Tier 1
  createArmor('leather_boots', 'Skórzane Buty', 'boots', 1, 'common', { defense: 1, evasion: 2 }, 1),
  createArmor('iron_boots', 'Żelazne Buty', 'boots', 1, 'uncommon', { defense: 3, evasion: 1 }, 5),
  createArmor('swift_boots', 'Szybkie Buty', 'boots', 1, 'rare', { defense: 2, evasion: 6 }, 8),

  // Tier 2
  createArmor('steel_boots', 'Stalowe Buty', 'boots', 2, 'rare', { defense: 6, evasion: 3 }, 15),
  createArmor('shadow_boots', 'Cieniste Buty', 'boots', 2, 'epic', { defense: 4, evasion: 10 }, 22),

  // Tier 3
  createArmor('desert_sandals', 'Sandały Pustyni', 'boots', 3, 'rare', { defense: 5, evasion: 12 }, 28),
  createArmor('mountain_treads', 'Górskie Buty', 'boots', 3, 'epic', { defense: 12, evasion: 5 }, 40),
  createArmor('wind_walkers', 'Buty Wiatru', 'boots', 3, 'legendary', { defense: 10, evasion: 18 }, 48),

  // Tier 4
  createArmor('volcanic_boots', 'Wulkaniczne Buty', 'boots', 4, 'epic', { defense: 18, evasion: 8 }, 55),
  createArmor('frost_striders', 'Mroźne Kroczki', 'boots', 4, 'legendary', { defense: 15, evasion: 22 }, 70),
  createArmor('void_walkers', 'Buty Pustki', 'boots', 4, 'mythic', { defense: 25, evasion: 30 }, 90),
];

// ============================================
// ACCESSORIES
// ============================================

export const ACCESSORIES: Equipment[] = [
  // Rings - Attack focused
  createAccessory('copper_ring', 'Miedziany Pierścień', 'common', { attack: 2 }, 1),
  createAccessory('iron_ring', 'Żelazny Pierścień', 'uncommon', { attack: 5 }, 8),
  createAccessory('ruby_ring', 'Rubinowy Pierścień', 'rare', { attack: 10, critChance: 0.02 }, 18),
  createAccessory('berserker_ring', 'Pierścień Berserkera', 'epic', { attack: 18, critMultiplier: 0.3 }, 35),
  createAccessory('dragon_ring', 'Smocza Obrączka', 'legendary', { attack: 30, critChance: 0.05, critMultiplier: 0.2 }, 60),

  // Amulets - Defense/HP focused
  createAccessory('wooden_amulet', 'Drewniany Amulet', 'common', { defense: 2, maxHp: 10 }, 1),
  createAccessory('silver_amulet', 'Srebrny Amulet', 'uncommon', { defense: 5, maxHp: 25 }, 10),
  createAccessory('guardian_amulet', 'Amulet Strażnika', 'rare', { defense: 10, maxHp: 50 }, 22),
  createAccessory('titans_pendant', 'Wisiorek Tytana', 'epic', { defense: 18, maxHp: 100 }, 42),
  createAccessory('immortal_charm', 'Urok Nieśmiertelności', 'legendary', { defense: 25, maxHp: 150, hpRegen: 1 }, 70),

  // Capes - Evasion focused
  createAccessory('travelers_cloak', 'Płaszcz Podróżnika', 'common', { evasion: 3 }, 3),
  createAccessory('shadow_cloak', 'Cienisty Płaszcz', 'uncommon', { evasion: 8 }, 12),
  createAccessory('wind_cape', 'Peleryna Wiatru', 'rare', { evasion: 15, accuracy: 5 }, 25),
  createAccessory('phantom_shroud', 'Całun Widma', 'epic', { evasion: 25 }, 45),
  createAccessory('void_cloak', 'Płaszcz Pustki', 'legendary', { evasion: 40, defense: 10 }, 80),

  // Balanced accessories
  createAccessory('warriors_badge', 'Odznaka Wojownika', 'rare', { attack: 8, defense: 8, maxHp: 30 }, 20),
  createAccessory('champions_medal', 'Medal Mistrza', 'epic', { attack: 15, defense: 15, maxHp: 60, critChance: 0.03 }, 50),
  createAccessory('legendary_insignia', 'Legendarna Insygnia', 'legendary', { attack: 25, defense: 20, maxHp: 100, critChance: 0.05, evasion: 10 }, 75),
  createAccessory('mythic_emblem', 'Mityczny Emblemat', 'mythic', { attack: 40, defense: 35, maxHp: 200, critChance: 0.08, critMultiplier: 0.4, evasion: 15 }, 95),
];

// ============================================
// ALL EQUIPMENT
// ============================================

export const ALL_EQUIPMENT: Equipment[] = [
  ...WEAPONS,
  ...ARMORS,
  ...HELMETS,
  ...BOOTS,
  ...ACCESSORIES,
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getEquipment(id: string): Equipment | undefined {
  return ALL_EQUIPMENT.find(e => e.id === id);
}

export function getEquipmentBySlot(slot: EquipmentSlot): Equipment[] {
  return ALL_EQUIPMENT.filter(e => e.slot === slot);
}

export function getEquipmentByRarity(rarity: ItemRarity): Equipment[] {
  return ALL_EQUIPMENT.filter(e => e.rarity === rarity);
}

export function getEquipmentForLevel(level: number): Equipment[] {
  return ALL_EQUIPMENT.filter(e => (e.requirements.level || 1) <= level);
}

export function getEquipmentBySlotForLevel(slot: EquipmentSlot, level: number): Equipment[] {
  return ALL_EQUIPMENT.filter(e => e.slot === slot && (e.requirements.level || 1) <= level);
}

// Rarity colors for UI
export const RARITY_COLORS: Record<ItemRarity, string> = {
  common: '#9E9E9E',
  uncommon: '#4CAF50',
  rare: '#2196F3',
  epic: '#9C27B0',
  legendary: '#FF9800',
  mythic: '#F44336',
};

export const RARITY_NAMES: Record<ItemRarity, string> = {
  common: 'Zwykły',
  uncommon: 'Niezwykły',
  rare: 'Rzadki',
  epic: 'Epicki',
  legendary: 'Legendarny',
  mythic: 'Mityczny',
};

// Slot icons for UI
export const SLOT_ICONS: Record<EquipmentSlot, string> = {
  weapon: 'mdi-sword',
  armor: 'mdi-shield',
  helmet: 'mdi-hard-hat',
  boots: 'mdi-shoe-formal',
  accessory: 'mdi-ring',
};

export const SLOT_NAMES: Record<EquipmentSlot, string> = {
  weapon: 'Broń',
  armor: 'Zbroja',
  helmet: 'Hełm',
  boots: 'Buty',
  accessory: 'Akcesoria',
};
