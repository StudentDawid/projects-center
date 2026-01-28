/**
 * Prestige System definitions for Ateria Idle
 * Legacy Points, Upgrades, Gates, and Milestones
 */

import type { LegacyUpgrade, LegacyEffect, PrestigeGateId, PathId } from '~/entities/ateria-idle/game';

// ============================================
// LP CALCULATION
// ============================================

export interface LPCalculation {
  baseLP: number;
  warriorBonus: number;
  merchantBonus: number;
  scientistBonus: number;
  achievementBonus: number;
  dungeonBonus: number;
  slayerBonus: number;
  totalLP: number;
}

/**
 * Calculate Legacy Points earned on prestige
 * Based on progression in all paths
 */
export function calculatePrestigeLP(
  warriorLevel: number,
  merchantLevel: number,
  scientistLevel: number,
  slayerLevel: number,
  dungeonsCompleted: number,
  achievementsUnlocked: number,
  prestigeCount: number
): LPCalculation {
  // Base LP from levels
  const warriorBonus = Math.floor(Math.pow(warriorLevel, 1.5) / 5);
  const merchantBonus = Math.floor(Math.pow(merchantLevel, 1.5) / 5);
  const scientistBonus = Math.floor(Math.pow(scientistLevel, 1.5) / 5);
  const slayerBonus = Math.floor(slayerLevel * 2);
  
  // Bonus from dungeons (10 LP per unique dungeon)
  const dungeonBonus = dungeonsCompleted * 10;
  
  // Bonus from achievements (1 LP per achievement)
  const achievementBonus = achievementsUnlocked;
  
  // Base LP sum
  const baseLP = warriorBonus + merchantBonus + scientistBonus + slayerBonus + dungeonBonus + achievementBonus;
  
  // Diminishing returns for repeated prestiges (but still worth it)
  const prestigeMultiplier = Math.max(0.5, 1 - (prestigeCount * 0.05));
  
  // Minimum LP to make prestige worthwhile
  const totalLP = Math.max(10, Math.floor(baseLP * prestigeMultiplier));
  
  return {
    baseLP,
    warriorBonus,
    merchantBonus,
    scientistBonus,
    achievementBonus,
    dungeonBonus,
    slayerBonus,
    totalLP,
  };
}

// ============================================
// PRESTIGE REQUIREMENTS
// ============================================

export interface PrestigeRequirement {
  minWarriorLevel: number;
  minTotalLevel: number;
  minAchievements: number;
  description: string;
}

export const PRESTIGE_REQUIREMENTS: PrestigeRequirement = {
  minWarriorLevel: 25,
  minTotalLevel: 50, // Sum of all path levels
  minAchievements: 10,
  description: 'Wojownik Lvl 25+, Suma poziomów 50+, 10+ osiągnięć',
};

// ============================================
// LEGACY UPGRADE DEFINITIONS
// ============================================

export interface LegacyUpgradeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  baseCost: number;
  costScaling: number; // Multiplier per level
  maxLevel: number;
  effect: LegacyEffect;
  requires?: string[];
  path?: PathId;
  category: 'universal' | 'warrior' | 'merchant' | 'scientist' | 'special';
}

export const LEGACY_UPGRADES: LegacyUpgradeDefinition[] = [
  // ============================================
  // UNIVERSAL UPGRADES
  // ============================================
  {
    id: 'xp_boost',
    name: 'Mądrość Przodków',
    description: '+10% XP dla wszystkich ścieżek na poziom',
    icon: 'mdi-book-open-page-variant',
    baseCost: 10,
    costScaling: 1.5,
    maxLevel: 10,
    effect: { type: 'xp_multiplier', value: 0.1 },
    category: 'universal',
  },
  {
    id: 'gold_boost',
    name: 'Złota Żyła',
    description: '+15% złota ze wszystkich źródeł na poziom',
    icon: 'mdi-gold',
    baseCost: 15,
    costScaling: 1.6,
    maxLevel: 10,
    effect: { type: 'resource_multiplier', target: 'gold', value: 0.15 },
    category: 'universal',
  },
  {
    id: 'starting_gold',
    name: 'Rodzinny Spadek',
    description: '+100 złota na start na poziom',
    icon: 'mdi-safe',
    baseCost: 5,
    costScaling: 1.3,
    maxLevel: 20,
    effect: { type: 'start_bonus', target: 'gold', value: 100 },
    category: 'universal',
  },
  {
    id: 'starting_level',
    name: 'Wrodzone Talenty',
    description: '+1 do poziomu startowego Wojownika na poziom',
    icon: 'mdi-arrow-up-bold',
    baseCost: 50,
    costScaling: 2,
    maxLevel: 5,
    effect: { type: 'start_bonus', target: 'warrior', value: 1 },
    requires: ['xp_boost'],
    category: 'universal',
  },
  {
    id: 'unlock_speed',
    name: 'Szybkie Odblokowania',
    description: '-10% wymagań do odblokowania ścieżek na poziom',
    icon: 'mdi-lock-open-variant',
    baseCost: 30,
    costScaling: 1.8,
    maxLevel: 5,
    effect: { type: 'unlock', value: 0.1 },
    category: 'universal',
  },

  // ============================================
  // WARRIOR PATH
  // ============================================
  {
    id: 'warrior_damage',
    name: 'Siła Poprzednich Żyć',
    description: '+5% obrażeń bazowych na poziom',
    icon: 'mdi-sword',
    baseCost: 20,
    costScaling: 1.5,
    maxLevel: 15,
    effect: { type: 'resource_multiplier', target: 'warrior', value: 0.05 },
    path: 'warrior',
    category: 'warrior',
  },
  {
    id: 'warrior_crit',
    name: 'Precyzja Mistrza',
    description: '+2% szansy na krytyk na poziom',
    icon: 'mdi-target',
    baseCost: 25,
    costScaling: 1.7,
    maxLevel: 10,
    effect: { type: 'resource_multiplier', target: 'warrior', value: 0.02 },
    path: 'warrior',
    requires: ['warrior_damage'],
    category: 'warrior',
  },
  {
    id: 'warrior_hp',
    name: 'Żywotność Wojownika',
    description: '+10% maksymalnego HP na poziom',
    icon: 'mdi-heart-plus',
    baseCost: 15,
    costScaling: 1.4,
    maxLevel: 10,
    effect: { type: 'resource_multiplier', target: 'warrior', value: 0.1 },
    path: 'warrior',
    category: 'warrior',
  },
  {
    id: 'warrior_recovery',
    name: 'Regeneracja Weterana',
    description: '-10% czasu regeneracji na poziom',
    icon: 'mdi-medical-bag',
    baseCost: 20,
    costScaling: 1.5,
    maxLevel: 5,
    effect: { type: 'resource_multiplier', target: 'warrior', value: 0.1 },
    path: 'warrior',
    requires: ['warrior_hp'],
    category: 'warrior',
  },
  {
    id: 'slayer_xp',
    name: 'Doświadczony Łowca',
    description: '+20% XP Łowcy na poziom',
    icon: 'mdi-target-account',
    baseCost: 30,
    costScaling: 1.6,
    maxLevel: 10,
    effect: { type: 'xp_multiplier', target: 'warrior', value: 0.2 },
    path: 'warrior',
    category: 'warrior',
  },

  // ============================================
  // MERCHANT PATH
  // ============================================
  {
    id: 'merchant_gold',
    name: 'Nos do Interesów',
    description: '+10% złota ze sprzedaży na poziom',
    icon: 'mdi-cash-register',
    baseCost: 20,
    costScaling: 1.5,
    maxLevel: 15,
    effect: { type: 'resource_multiplier', target: 'merchant', value: 0.1 },
    path: 'merchant',
    category: 'merchant',
  },
  {
    id: 'merchant_charisma',
    name: 'Naturalna Charyzma',
    description: '+5 do startowej charyzmy na poziom',
    icon: 'mdi-account-star',
    baseCost: 25,
    costScaling: 1.6,
    maxLevel: 10,
    effect: { type: 'start_bonus', target: 'merchant', value: 5 },
    path: 'merchant',
    category: 'merchant',
  },
  {
    id: 'merchant_customers',
    name: 'Magnes na Klientów',
    description: '+15% szybkości pojawiania się klientów na poziom',
    icon: 'mdi-account-group',
    baseCost: 30,
    costScaling: 1.7,
    maxLevel: 10,
    effect: { type: 'resource_multiplier', target: 'merchant', value: 0.15 },
    path: 'merchant',
    requires: ['merchant_gold'],
    category: 'merchant',
  },
  {
    id: 'merchant_haggle',
    name: 'Mistrz Negocjacji',
    description: '+5% sukcesu targowania na poziom',
    icon: 'mdi-handshake',
    baseCost: 35,
    costScaling: 1.8,
    maxLevel: 10,
    effect: { type: 'resource_multiplier', target: 'merchant', value: 0.05 },
    path: 'merchant',
    requires: ['merchant_charisma'],
    category: 'merchant',
  },
  {
    id: 'merchant_caravan',
    name: 'Sprawne Karawany',
    description: '+10% prędkości karawan na poziom',
    icon: 'mdi-truck-fast',
    baseCost: 25,
    costScaling: 1.5,
    maxLevel: 10,
    effect: { type: 'resource_multiplier', target: 'merchant', value: 0.1 },
    path: 'merchant',
    category: 'merchant',
  },

  // ============================================
  // SCIENTIST PATH
  // ============================================
  {
    id: 'scientist_research',
    name: 'Geniusz Naukowy',
    description: '+15% prędkości badań na poziom',
    icon: 'mdi-flask',
    baseCost: 20,
    costScaling: 1.5,
    maxLevel: 15,
    effect: { type: 'resource_multiplier', target: 'scientist', value: 0.15 },
    path: 'scientist',
    category: 'scientist',
  },
  {
    id: 'scientist_crafting',
    name: 'Zręczne Ręce',
    description: '+10% prędkości wytwarzania na poziom',
    icon: 'mdi-hammer-wrench',
    baseCost: 25,
    costScaling: 1.6,
    maxLevel: 10,
    effect: { type: 'resource_multiplier', target: 'scientist', value: 0.1 },
    path: 'scientist',
    category: 'scientist',
  },
  {
    id: 'scientist_yield',
    name: 'Efektywna Produkcja',
    description: '+5% szansy na dodatkowy produkt na poziom',
    icon: 'mdi-flask-plus',
    baseCost: 30,
    costScaling: 1.7,
    maxLevel: 10,
    effect: { type: 'resource_multiplier', target: 'scientist', value: 0.05 },
    path: 'scientist',
    requires: ['scientist_crafting'],
    category: 'scientist',
  },
  {
    id: 'scientist_discovery',
    name: 'Natchnienie',
    description: '+10% szansy na odkrycie na poziom',
    icon: 'mdi-lightbulb',
    baseCost: 40,
    costScaling: 2,
    maxLevel: 5,
    effect: { type: 'resource_multiplier', target: 'scientist', value: 0.1 },
    path: 'scientist',
    requires: ['scientist_research'],
    category: 'scientist',
  },
  {
    id: 'scientist_resources',
    name: 'Oszczędność Materiałów',
    description: '-5% kosztów wytwarzania na poziom',
    icon: 'mdi-recycle',
    baseCost: 25,
    costScaling: 1.5,
    maxLevel: 10,
    effect: { type: 'resource_multiplier', target: 'scientist', value: 0.05 },
    path: 'scientist',
    category: 'scientist',
  },

  // ============================================
  // SPECIAL UPGRADES
  // ============================================
  {
    id: 'auto_combat',
    name: 'Walka Automatyczna+',
    description: 'Rozpoczynaj walkę automatycznie od poziomu 1',
    icon: 'mdi-robot',
    baseCost: 100,
    costScaling: 1,
    maxLevel: 1,
    effect: { type: 'unlock', value: 1 },
    requires: ['xp_boost', 'warrior_damage'],
    category: 'special',
  },
  {
    id: 'offline_progress',
    name: 'Postęp Offline+',
    description: '+25% efektywności postępu offline na poziom',
    icon: 'mdi-sleep',
    baseCost: 75,
    costScaling: 2,
    maxLevel: 4,
    effect: { type: 'resource_multiplier', value: 0.25 },
    category: 'special',
  },
  {
    id: 'lp_multiplier',
    name: 'Echo Prestiżu',
    description: '+10% LP z przyszłych prestiży na poziom',
    icon: 'mdi-star-circle',
    baseCost: 150,
    costScaling: 2.5,
    maxLevel: 5,
    effect: { type: 'resource_multiplier', value: 0.1 },
    requires: ['offline_progress'],
    category: 'special',
  },
  {
    id: 'achievement_bonus',
    name: 'Łowca Trofeów',
    description: '+50% punktów z osiągnięć na poziom',
    icon: 'mdi-trophy',
    baseCost: 50,
    costScaling: 1.8,
    maxLevel: 5,
    effect: { type: 'resource_multiplier', value: 0.5 },
    category: 'special',
  },
  {
    id: 'dungeon_keys',
    name: 'Znajomy Stróż',
    description: '+1 klucz do losowego lochu na start na poziom',
    icon: 'mdi-key',
    baseCost: 40,
    costScaling: 1.5,
    maxLevel: 10,
    effect: { type: 'start_bonus', value: 1 },
    requires: ['starting_gold'],
    category: 'special',
  },
];

// ============================================
// PRESTIGE GATES (Major Milestones)
// ============================================

export interface PrestigeGateDefinition {
  id: PrestigeGateId;
  name: string;
  description: string;
  icon: string;
  color: string;
  reward: {
    lp: number;
    upgradeUnlock?: string;
    title?: string;
  };
  requirements: {
    description: string;
  };
}

export const PRESTIGE_GATES: PrestigeGateDefinition[] = [
  {
    id: 'dungeon_master',
    name: 'Mistrz Lochów',
    description: 'Ukończ wszystkie unikalne lochy',
    icon: 'mdi-castle',
    color: '#FF5722',
    reward: {
      lp: 100,
      upgradeUnlock: 'dungeon_master_bonus',
      title: 'Mistrz Lochów',
    },
    requirements: {
      description: 'Ukończ 5 unikalnych lochów',
    },
  },
  {
    id: 'trading_empire',
    name: 'Imperium Handlowe',
    description: 'Zbuduj potężne imperium handlowe',
    icon: 'mdi-store',
    color: '#FFC107',
    reward: {
      lp: 100,
      upgradeUnlock: 'trading_empire_bonus',
      title: 'Magnat',
    },
    requirements: {
      description: 'Osiągnij poziom 30 Kupca i reputację "Legendarny"',
    },
  },
  {
    id: 'scientific_breakthrough',
    name: 'Przełom Naukowy',
    description: 'Osiągnij szczyt wiedzy naukowej',
    icon: 'mdi-atom',
    color: '#2196F3',
    reward: {
      lp: 100,
      upgradeUnlock: 'scientific_breakthrough_bonus',
      title: 'Arcymistrz Nauk',
    },
    requirements: {
      description: 'Ukończ wszystkie badania i osiągnij poziom 30 Naukowca',
    },
  },
  {
    id: 'trinity_balance',
    name: 'Równowaga Trójcy',
    description: 'Opanuj wszystkie trzy ścieżki',
    icon: 'mdi-triangle',
    color: '#9C27B0',
    reward: {
      lp: 250,
      title: 'Człowiek Renesansu',
    },
    requirements: {
      description: 'Osiągnij poziom 25+ we wszystkich trzech ścieżkach',
    },
  },
];

// ============================================
// PRESTIGE MILESTONES
// ============================================

export interface PrestigeMilestone {
  prestigeCount: number;
  reward: {
    type: 'lp_bonus' | 'upgrade_unlock' | 'cosmetic';
    value: number | string;
    description: string;
  };
}

export const PRESTIGE_MILESTONES: PrestigeMilestone[] = [
  {
    prestigeCount: 1,
    reward: {
      type: 'lp_bonus',
      value: 50,
      description: 'Pierwszy Prestiż! +50 LP bonus',
    },
  },
  {
    prestigeCount: 3,
    reward: {
      type: 'upgrade_unlock',
      value: 'prestige_3_unlock',
      description: 'Odblokowano nowe ulepszenie legacy',
    },
  },
  {
    prestigeCount: 5,
    reward: {
      type: 'lp_bonus',
      value: 100,
      description: 'Weteran Prestiżu! +100 LP bonus',
    },
  },
  {
    prestigeCount: 10,
    reward: {
      type: 'cosmetic',
      value: 'prestige_aura',
      description: 'Odblokowano efekt prestiżowej aury',
    },
  },
  {
    prestigeCount: 25,
    reward: {
      type: 'lp_bonus',
      value: 500,
      description: 'Legenda Prestiżu! +500 LP bonus',
    },
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getLegacyUpgrade(id: string): LegacyUpgradeDefinition | undefined {
  return LEGACY_UPGRADES.find(u => u.id === id);
}

export function getUpgradesByCategory(category: LegacyUpgradeDefinition['category']): LegacyUpgradeDefinition[] {
  return LEGACY_UPGRADES.filter(u => u.category === category);
}

export function getUpgradesByPath(path: PathId): LegacyUpgradeDefinition[] {
  return LEGACY_UPGRADES.filter(u => u.path === path);
}

export function calculateUpgradeCost(upgrade: LegacyUpgradeDefinition, currentLevel: number): number {
  return Math.floor(upgrade.baseCost * Math.pow(upgrade.costScaling, currentLevel));
}

export function getPrestigeGate(id: PrestigeGateId): PrestigeGateDefinition | undefined {
  return PRESTIGE_GATES.find(g => g.id === id);
}

export function getNextMilestone(currentPrestigeCount: number): PrestigeMilestone | undefined {
  return PRESTIGE_MILESTONES.find(m => m.prestigeCount > currentPrestigeCount);
}

export function getMilestoneRewards(prestigeCount: number): PrestigeMilestone[] {
  return PRESTIGE_MILESTONES.filter(m => m.prestigeCount <= prestigeCount);
}

export function canAffordUpgrade(upgrade: LegacyUpgradeDefinition, currentLevel: number, availableLP: number): boolean {
  if (currentLevel >= upgrade.maxLevel) return false;
  const cost = calculateUpgradeCost(upgrade, currentLevel);
  return availableLP >= cost;
}

export function areRequirementsMet(
  upgrade: LegacyUpgradeDefinition,
  purchasedUpgrades: Map<string, number>
): boolean {
  if (!upgrade.requires) return true;
  return upgrade.requires.every(reqId => (purchasedUpgrades.get(reqId) || 0) > 0);
}
