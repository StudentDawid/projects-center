/**
 * Slayer System definitions for Ateria Idle
 * Data-Driven Design - all slayer data in one place
 */

import type { SlayerCategory, SlayerTask, SlayerReward } from '@libs/entities/ateria-idle/warrior';

// ============================================
// SLAYER CATEGORY INFO
// ============================================

export interface SlayerCategoryInfo {
  id: SlayerCategory;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export const SLAYER_CATEGORIES: Record<SlayerCategory, SlayerCategoryInfo> = {
  beast: {
    id: 'beast',
    name: 'Bestie',
    icon: 'mdi-paw',
    color: '#8D6E63',
    description: 'Dzikie zwierzęta i potwory',
  },
  undead: {
    id: 'undead',
    name: 'Nieumarli',
    icon: 'mdi-skull',
    color: '#78909C',
    description: 'Szkielety, zombie i duchy',
  },
  demon: {
    id: 'demon',
    name: 'Demony',
    icon: 'mdi-fire',
    color: '#E53935',
    description: 'Istoty z piekielnych wymiarów',
  },
  elemental: {
    id: 'elemental',
    name: 'Żywiołaki',
    icon: 'mdi-atom',
    color: '#7E57C2',
    description: 'Istoty złożone z czystych żywiołów',
  },
  dragon: {
    id: 'dragon',
    name: 'Smoki',
    icon: 'mdi-dragon',
    color: '#FF8F00',
    description: 'Legendarne gady latające',
  },
  aberration: {
    id: 'aberration',
    name: 'Aberracje',
    icon: 'mdi-alien',
    color: '#26A69A',
    description: 'Stwory z innych wymiarów',
  },
};

// ============================================
// SLAYER TASK TEMPLATES
// ============================================

export interface SlayerTaskTemplate {
  id: string;
  name: string;
  description: string;
  category: SlayerCategory;
  targetMonsterIds: string[]; // Possible monsters to hunt
  minCount: number;
  maxCount: number;
  requiredLevel: number;
  baseCoins: number;
  baseXp: number;
  tier: number; // 1-5
}

export const SLAYER_TASK_TEMPLATES: SlayerTaskTemplate[] = [
  // ============================================
  // TIER 1 - Beast (Early Game)
  // ============================================
  {
    id: 'hunt_wolves',
    name: 'Polowanie na Wilki',
    description: 'Wilki zagrażają okolicznym wioskom. Wytrop je i zlikwiduj.',
    category: 'beast',
    targetMonsterIds: ['wolf', 'prairie_wolf'],
    minCount: 5,
    maxCount: 15,
    requiredLevel: 1,
    baseCoins: 10,
    baseXp: 20,
    tier: 1,
  },
  {
    id: 'spider_extermination',
    name: 'Eksterminacja Pająków',
    description: 'Pająki opanowały stare kopalnie. Oczyść je.',
    category: 'beast',
    targetMonsterIds: ['spider'],
    minCount: 8,
    maxCount: 20,
    requiredLevel: 3,
    baseCoins: 15,
    baseXp: 30,
    tier: 1,
  },
  {
    id: 'boar_hunting',
    name: 'Polowanie na Dziki',
    description: 'Dziki niszczą uprawy rolników. Zredukuj ich populację.',
    category: 'beast',
    targetMonsterIds: ['wild_boar'],
    minCount: 6,
    maxCount: 12,
    requiredLevel: 8,
    baseCoins: 20,
    baseXp: 40,
    tier: 1,
  },

  // ============================================
  // TIER 2 - Undead (Mid-Early Game)
  // ============================================
  {
    id: 'skeleton_clearing',
    name: 'Oczyszczenie Szkieletów',
    description: 'Starożytne cmentarze ożyły. Uporządkuj zmarłych.',
    category: 'undead',
    targetMonsterIds: ['skeleton'],
    minCount: 10,
    maxCount: 25,
    requiredLevel: 5,
    baseCoins: 25,
    baseXp: 50,
    tier: 2,
  },
  {
    id: 'zombie_purge',
    name: 'Oczyszczenie Zombie',
    description: 'Zaraza ożywiła trupy. Powstrzymaj epidemię.',
    category: 'undead',
    targetMonsterIds: ['swamp_zombie'],
    minCount: 8,
    maxCount: 18,
    requiredLevel: 15,
    baseCoins: 40,
    baseXp: 80,
    tier: 2,
  },
  {
    id: 'mummy_destruction',
    name: 'Zniszczenie Mumii',
    description: 'Pradawne grobowce zostały sprofanowane. Uporządkuj mumie.',
    category: 'undead',
    targetMonsterIds: ['mummy'],
    minCount: 5,
    maxCount: 12,
    requiredLevel: 20,
    baseCoins: 50,
    baseXp: 100,
    tier: 2,
  },

  // ============================================
  // TIER 3 - Demon (Mid Game)
  // ============================================
  {
    id: 'hell_hound_hunt',
    name: 'Polowanie na Piekielne Psy',
    description: 'Psy z piekła terroryzują podróżnych. Wytrop je.',
    category: 'demon',
    targetMonsterIds: ['hell_hound'],
    minCount: 6,
    maxCount: 15,
    requiredLevel: 35,
    baseCoins: 80,
    baseXp: 160,
    tier: 3,
  },
  {
    id: 'demon_warrior_slaying',
    name: 'Zabójstwo Wojowników Demonów',
    description: 'Elitarni wojownicy demonów przygotowują inwazję. Powstrzymaj ich.',
    category: 'demon',
    targetMonsterIds: ['demon_warrior'],
    minCount: 4,
    maxCount: 10,
    requiredLevel: 40,
    baseCoins: 100,
    baseXp: 200,
    tier: 3,
  },
  {
    id: 'infernal_purge',
    name: 'Czystka Infernali',
    description: 'Najpotężniejsze demony zagrażają światu. Zlikwiduj je.',
    category: 'demon',
    targetMonsterIds: ['infernal'],
    minCount: 3,
    maxCount: 8,
    requiredLevel: 45,
    baseCoins: 120,
    baseXp: 250,
    tier: 3,
  },

  // ============================================
  // TIER 4 - Elemental (Late Game)
  // ============================================
  {
    id: 'fire_elemental_containment',
    name: 'Powstrzymanie Żywiołaków Ognia',
    description: 'Żywiołaki ognia wymknęły się spod kontroli. Opanuj sytuację.',
    category: 'elemental',
    targetMonsterIds: ['fire_elemental'],
    minCount: 5,
    maxCount: 12,
    requiredLevel: 35,
    baseCoins: 90,
    baseXp: 180,
    tier: 3,
  },
  {
    id: 'storm_elemental_hunt',
    name: 'Polowanie na Żywiołaki Burzy',
    description: 'Burze nękają krainę. Zneutralizuj ich źródło.',
    category: 'elemental',
    targetMonsterIds: ['storm_elemental'],
    minCount: 4,
    maxCount: 10,
    requiredLevel: 40,
    baseCoins: 110,
    baseXp: 220,
    tier: 4,
  },
  {
    id: 'ice_elemental_extermination',
    name: 'Eksterminacja Żywiołaków Lodu',
    description: 'Wieczna zima zbliża się. Powstrzymaj lodowe żywiołaki.',
    category: 'elemental',
    targetMonsterIds: ['ancient_ice_elemental'],
    minCount: 3,
    maxCount: 8,
    requiredLevel: 55,
    baseCoins: 150,
    baseXp: 300,
    tier: 4,
  },

  // ============================================
  // TIER 4 - Dragon (Late Game)
  // ============================================
  {
    id: 'young_dragon_hunt',
    name: 'Polowanie na Młode Smoki',
    description: 'Młode smoki terroryzują osady. Zlikwiduj zagrożenie.',
    category: 'dragon',
    targetMonsterIds: ['young_dragon'],
    minCount: 2,
    maxCount: 5,
    requiredLevel: 40,
    baseCoins: 150,
    baseXp: 300,
    tier: 4,
  },
  {
    id: 'frost_dragon_slaying',
    name: 'Zabójstwo Mroźnych Smoków',
    description: 'Mroźne smoki zagrażają północnym ziemiom.',
    category: 'dragon',
    targetMonsterIds: ['frost_dragon'],
    minCount: 2,
    maxCount: 4,
    requiredLevel: 55,
    baseCoins: 200,
    baseXp: 400,
    tier: 4,
  },
  {
    id: 'void_dragon_elimination',
    name: 'Eliminacja Smoków Pustki',
    description: 'Smoki z wymiaru pustki są najpotężniejsze ze wszystkich.',
    category: 'dragon',
    targetMonsterIds: ['void_dragon'],
    minCount: 1,
    maxCount: 3,
    requiredLevel: 70,
    baseCoins: 300,
    baseXp: 600,
    tier: 5,
  },

  // ============================================
  // TIER 5 - Aberration (End Game)
  // ============================================
  {
    id: 'void_stalker_hunt',
    name: 'Polowanie na Łowców Pustki',
    description: 'Istoty z pustki przenikają do naszego świata.',
    category: 'aberration',
    targetMonsterIds: ['void_stalker'],
    minCount: 4,
    maxCount: 10,
    requiredLevel: 60,
    baseCoins: 180,
    baseXp: 360,
    tier: 5,
  },
  {
    id: 'chaos_spawn_extermination',
    name: 'Eksterminacja Pomiotów Chaosu',
    description: 'Chaos rozlewa się po świecie. Powstrzymaj jego sługi.',
    category: 'aberration',
    targetMonsterIds: ['chaos_spawn'],
    minCount: 5,
    maxCount: 12,
    requiredLevel: 65,
    baseCoins: 200,
    baseXp: 400,
    tier: 5,
  },
  {
    id: 'elder_horror_slaying',
    name: 'Zabójstwo Starszych Potworów',
    description: 'Pradawne zło budzi się. Tylko najsilniejsi mogą stawić mu czoła.',
    category: 'aberration',
    targetMonsterIds: ['elder_horror'],
    minCount: 2,
    maxCount: 5,
    requiredLevel: 70,
    baseCoins: 250,
    baseXp: 500,
    tier: 5,
  },
];

// ============================================
// SLAYER SHOP ITEMS
// ============================================

export interface SlayerShopItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: number; // Slayer coins
  requiredLevel: number;
  category: 'equipment' | 'consumable' | 'upgrade' | 'cosmetic';
  effect?: {
    type: 'stat_bonus' | 'xp_bonus' | 'coin_bonus' | 'unlock' | 'permanent_buff';
    stat?: string;
    value: number;
    duration?: number; // ticks, if consumable
  };
  stock?: number; // Unlimited if not specified
  oneTimePurchase?: boolean;
}

export const SLAYER_SHOP_ITEMS: SlayerShopItem[] = [
  // ============================================
  // EQUIPMENT
  // ============================================
  {
    id: 'slayer_helm',
    name: 'Hełm Łowcy',
    description: '+10% obrażeń przeciwko potworom z zadań Łowcy',
    icon: 'mdi-helmet-outline',
    cost: 500,
    requiredLevel: 10,
    category: 'equipment',
    effect: { type: 'stat_bonus', stat: 'slayerDamage', value: 10 },
    oneTimePurchase: true,
  },
  {
    id: 'slayer_ring',
    name: 'Pierścień Łowcy',
    description: '+5% szansy na podwójne Monety Łowcy',
    icon: 'mdi-ring',
    cost: 750,
    requiredLevel: 15,
    category: 'equipment',
    effect: { type: 'coin_bonus', value: 5 },
    oneTimePurchase: true,
  },
  {
    id: 'slayer_cape',
    name: 'Peleryna Łowcy',
    description: '+15% XP z zadań Łowcy',
    icon: 'mdi-tshirt-crew',
    cost: 1000,
    requiredLevel: 25,
    category: 'equipment',
    effect: { type: 'xp_bonus', value: 15 },
    oneTimePurchase: true,
  },
  {
    id: 'master_slayer_helm',
    name: 'Hełm Mistrza Łowców',
    description: '+25% obrażeń przeciwko potworom z zadań Łowcy',
    icon: 'mdi-wizard-hat',
    cost: 2500,
    requiredLevel: 50,
    category: 'equipment',
    effect: { type: 'stat_bonus', stat: 'slayerDamage', value: 25 },
    oneTimePurchase: true,
  },

  // ============================================
  // CONSUMABLES
  // ============================================
  {
    id: 'slayer_contract_reroll',
    name: 'Przepisanie Kontraktu',
    description: 'Anuluj aktualne zadanie bez kary i otrzymaj nowe',
    icon: 'mdi-file-refresh',
    cost: 50,
    requiredLevel: 1,
    category: 'consumable',
  },
  {
    id: 'slayer_xp_boost',
    name: 'Eliksir Łowcy',
    description: '+50% XP z zadań Łowcy przez 30 minut',
    icon: 'mdi-flask-round-bottom',
    cost: 100,
    requiredLevel: 5,
    category: 'consumable',
    effect: { type: 'xp_bonus', value: 50, duration: 18000 }, // 30 min
  },
  {
    id: 'slayer_coin_boost',
    name: 'Talizman Łowcy',
    description: '+100% Monet Łowcy przez 30 minut',
    icon: 'mdi-necklace',
    cost: 150,
    requiredLevel: 10,
    category: 'consumable',
    effect: { type: 'coin_bonus', value: 100, duration: 18000 },
  },
  {
    id: 'instant_task_progress',
    name: 'Zlecenie Ekspresowe',
    description: 'Natychmiast zabij 5 potworów z aktualnego zadania',
    icon: 'mdi-lightning-bolt',
    cost: 75,
    requiredLevel: 5,
    category: 'consumable',
    effect: { type: 'stat_bonus', value: 5 },
  },

  // ============================================
  // UPGRADES (Permanent)
  // ============================================
  {
    id: 'extended_tasks',
    name: 'Rozszerzone Zlecenia',
    description: 'Odblokuj zadania z większą liczbą potworów i lepszymi nagrodami',
    icon: 'mdi-arrow-expand-all',
    cost: 300,
    requiredLevel: 10,
    category: 'upgrade',
    effect: { type: 'unlock', value: 1 },
    oneTimePurchase: true,
  },
  {
    id: 'elite_tasks',
    name: 'Elitarne Zlecenia',
    description: 'Odblokuj dostęp do zadań Tier 3+',
    icon: 'mdi-star-shooting',
    cost: 1000,
    requiredLevel: 25,
    category: 'upgrade',
    effect: { type: 'unlock', value: 3 },
    oneTimePurchase: true,
  },
  {
    id: 'legendary_tasks',
    name: 'Legendarne Zlecenia',
    description: 'Odblokuj dostęp do zadań Tier 5',
    icon: 'mdi-crown',
    cost: 3000,
    requiredLevel: 50,
    category: 'upgrade',
    effect: { type: 'unlock', value: 5 },
    oneTimePurchase: true,
  },
  {
    id: 'task_slot_2',
    name: 'Drugi Slot Zadania',
    description: 'Możesz wykonywać dwa zadania jednocześnie',
    icon: 'mdi-numeric-2-box',
    cost: 2000,
    requiredLevel: 30,
    category: 'upgrade',
    effect: { type: 'unlock', value: 2 },
    oneTimePurchase: true,
  },
  {
    id: 'bonus_coin_chance',
    name: 'Szczęście Łowcy',
    description: 'Permanentnie +10% szansy na dodatkowe Monety Łowcy',
    icon: 'mdi-clover',
    cost: 1500,
    requiredLevel: 20,
    category: 'upgrade',
    effect: { type: 'permanent_buff', stat: 'bonusCoinChance', value: 10 },
    oneTimePurchase: true,
  },

  // ============================================
  // DUNGEON KEYS
  // ============================================
  {
    id: 'goblin_key_pack',
    name: 'Pakiet Kluczy Goblinów',
    description: '3x Klucz do Jaskiń Goblinów',
    icon: 'mdi-key',
    cost: 100,
    requiredLevel: 5,
    category: 'consumable',
  },
  {
    id: 'swamp_key_pack',
    name: 'Pakiet Kluczy Bagiennych',
    description: '3x Klucz do Trujących Głębin',
    icon: 'mdi-key-variant',
    cost: 250,
    requiredLevel: 15,
    category: 'consumable',
  },
  {
    id: 'infernal_key_pack',
    name: 'Pakiet Kluczy Piekielnych',
    description: '3x Klucz do Piekielnej Fortecy',
    icon: 'mdi-key-chain',
    cost: 500,
    requiredLevel: 30,
    category: 'consumable',
  },
  {
    id: 'frost_key_pack',
    name: 'Pakiet Kluczy Mroźnych',
    description: '3x Klucz do Zamrożonej Cytadeli',
    icon: 'mdi-key-star',
    cost: 1000,
    requiredLevel: 45,
    category: 'consumable',
  },
  {
    id: 'void_key_pack',
    name: 'Pakiet Kluczy Pustki',
    description: '3x Klucz do Sanktuarium Pustki',
    icon: 'mdi-key-wireless',
    cost: 2500,
    requiredLevel: 60,
    category: 'consumable',
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getSlayerCategory(id: SlayerCategory): SlayerCategoryInfo {
  return SLAYER_CATEGORIES[id];
}

export function getAvailableTaskTemplates(playerLevel: number, maxTier: number = 5): SlayerTaskTemplate[] {
  return SLAYER_TASK_TEMPLATES.filter(
    t => t.requiredLevel <= playerLevel && t.tier <= maxTier
  );
}

export function getTaskTemplatesByCategory(category: SlayerCategory): SlayerTaskTemplate[] {
  return SLAYER_TASK_TEMPLATES.filter(t => t.category === category);
}

export function getShopItemsByCategory(category: SlayerShopItem['category']): SlayerShopItem[] {
  return SLAYER_SHOP_ITEMS.filter(item => item.category === category);
}

export function getShopItem(id: string): SlayerShopItem | undefined {
  return SLAYER_SHOP_ITEMS.find(item => item.id === id);
}

export function generateSlayerTask(template: SlayerTaskTemplate, slayerLevel: number): SlayerTask {
  // Select random monster from template
  const targetMonsterId = template.targetMonsterIds[
    Math.floor(Math.random() * template.targetMonsterIds.length)
  ];

  // Calculate target count (scales with slayer level)
  const levelBonus = Math.floor(slayerLevel / 10);
  const baseCount = Math.floor(
    Math.random() * (template.maxCount - template.minCount + 1) + template.minCount
  );
  const targetCount = baseCount + levelBonus;

  // Calculate rewards (scales with slayer level and count)
  const countMultiplier = targetCount / template.minCount;
  const levelMultiplier = 1 + (slayerLevel * 0.02); // +2% per level
  const slayerCoins = Math.floor(template.baseCoins * countMultiplier * levelMultiplier);
  const xp = Math.floor(template.baseXp * countMultiplier * levelMultiplier);

  return {
    id: `${template.id}_${Date.now()}`,
    category: template.category,
    targetMonsterId,
    targetCount,
    currentCount: 0,
    reward: {
      slayerCoins,
      xp,
    },
  };
}
