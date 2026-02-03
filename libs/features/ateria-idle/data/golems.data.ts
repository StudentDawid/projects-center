/**
 * Golem System definitions for Ateria Idle
 * Automated helpers for the Scientist path
 */

import type {
  GolemType,
  GolemBlueprint,
  GolemUpgrade,
  GolemWorkType,
} from '@libs/entities/ateria-idle/scientist';

// ============================================
// GOLEM BLUEPRINTS
// ============================================

export const GOLEM_BLUEPRINTS: GolemBlueprint[] = [
  // ============================================
  // TIER 1 - BASIC GOLEMS
  // ============================================
  {
    id: 'clay_hauler',
    name: 'Gliniany Tragarz',
    description: 'Prosty golem do przenoszenia surowców między magazynami',
    type: 'hauling',
    icon: 'mdi-robot',
    requiredLevel: 5,
    craftCost: {
      gold: 100,
      materials: [
        { itemId: 'clay', amount: 20 },
        { itemId: 'magic_dust', amount: 5 },
      ],
      flasks: { red: 10 },
    },
    baseIntegrity: 100,
    baseEfficiency: 1.0,
    baseSpeed: 1.0,
    integrityDecayRate: 2, // 2% per hour
    repairCost: {
      materials: [{ itemId: 'clay', amount: 5 }],
      flasks: { red: 2 },
    },
    workEffect: {
      type: 'auto_transfer',
      baseValue: 10, // Items per tick
    },
  },
  {
    id: 'stone_miner',
    name: 'Kamienny Górnik',
    description: 'Wydobywa rudy i kamienie automatycznie',
    type: 'mining',
    icon: 'mdi-pickaxe',
    requiredLevel: 8,
    craftCost: {
      gold: 200,
      materials: [
        { itemId: 'stone', amount: 30 },
        { itemId: 'iron_ore', amount: 10 },
        { itemId: 'magic_dust', amount: 10 },
      ],
      flasks: { red: 15, green: 5 },
    },
    baseIntegrity: 150,
    baseEfficiency: 0.8,
    baseSpeed: 0.8,
    integrityDecayRate: 3,
    repairCost: {
      materials: [
        { itemId: 'stone', amount: 10 },
        { itemId: 'iron_ore', amount: 3 },
      ],
      flasks: { red: 5 },
    },
    workEffect: {
      type: 'produce_resource',
      target: 'ore',
      baseValue: 5, // Ore per minute
    },
  },

  // ============================================
  // TIER 2 - ADVANCED GOLEMS
  // ============================================
  {
    id: 'iron_forger',
    name: 'Żelazny Kowal',
    description: 'Wspomaga produkcję alchemiczną',
    type: 'alchemy',
    icon: 'mdi-anvil',
    requiredLevel: 12,
    requiredResearch: 'golem_crafting_1',
    craftCost: {
      gold: 500,
      materials: [
        { itemId: 'iron_ingot', amount: 20 },
        { itemId: 'magic_crystal', amount: 5 },
        { itemId: 'arcane_core', amount: 1 },
      ],
      flasks: { red: 20, green: 10, blue: 5 },
    },
    baseIntegrity: 120,
    baseEfficiency: 1.2,
    baseSpeed: 1.1,
    integrityDecayRate: 2.5,
    repairCost: {
      materials: [
        { itemId: 'iron_ingot', amount: 5 },
        { itemId: 'magic_dust', amount: 3 },
      ],
      flasks: { red: 8, green: 3 },
    },
    workEffect: {
      type: 'alchemy_assist',
      baseValue: 0.15, // +15% alchemy speed
    },
  },
  {
    id: 'crystal_scholar',
    name: 'Kryształowy Uczony',
    description: 'Przyspiesza badania naukowe',
    type: 'research',
    icon: 'mdi-book-open-page-variant',
    requiredLevel: 15,
    requiredResearch: 'golem_crafting_1',
    craftCost: {
      gold: 800,
      materials: [
        { itemId: 'magic_crystal', amount: 15 },
        { itemId: 'arcane_core', amount: 2 },
        { itemId: 'ancient_scroll', amount: 3 },
      ],
      flasks: { red: 15, green: 20, blue: 15 },
    },
    baseIntegrity: 80,
    baseEfficiency: 1.3,
    baseSpeed: 1.0,
    integrityDecayRate: 1.5,
    repairCost: {
      materials: [
        { itemId: 'magic_crystal', amount: 5 },
        { itemId: 'magic_dust', amount: 5 },
      ],
      flasks: { green: 10, blue: 5 },
    },
    workEffect: {
      type: 'research_assist',
      baseValue: 0.2, // +20% research speed
    },
  },

  // ============================================
  // TIER 3 - ELITE GOLEMS
  // ============================================
  {
    id: 'steel_guardian',
    name: 'Stalowy Strażnik',
    description: 'Wspomaga wojownika w walce',
    type: 'combat',
    icon: 'mdi-shield-account',
    requiredLevel: 20,
    requiredResearch: 'golem_crafting_2',
    craftCost: {
      gold: 1500,
      materials: [
        { itemId: 'steel_ingot', amount: 30 },
        { itemId: 'arcane_core', amount: 5 },
        { itemId: 'dragon_scale', amount: 3 },
      ],
      flasks: { red: 40, green: 20, blue: 20 },
    },
    baseIntegrity: 200,
    baseEfficiency: 1.0,
    baseSpeed: 1.2,
    integrityDecayRate: 4,
    repairCost: {
      materials: [
        { itemId: 'steel_ingot', amount: 10 },
        { itemId: 'arcane_core', amount: 1 },
      ],
      flasks: { red: 15, green: 5 },
    },
    workEffect: {
      type: 'combat_support',
      baseValue: 0.1, // +10% damage
    },
  },
  {
    id: 'mithril_harvester',
    name: 'Mithrilowy Zbieracz',
    description: 'Zaawansowany golem wydobywczy o wysokiej wydajności',
    type: 'mining',
    icon: 'mdi-diamond-stone',
    requiredLevel: 25,
    requiredResearch: 'golem_crafting_2',
    craftCost: {
      gold: 2500,
      materials: [
        { itemId: 'mithril_ingot', amount: 15 },
        { itemId: 'arcane_core', amount: 8 },
        { itemId: 'void_crystal', amount: 2 },
      ],
      flasks: { red: 50, green: 30, blue: 30 },
    },
    baseIntegrity: 180,
    baseEfficiency: 1.8,
    baseSpeed: 1.4,
    integrityDecayRate: 2,
    repairCost: {
      materials: [
        { itemId: 'mithril_ingot', amount: 5 },
        { itemId: 'arcane_core', amount: 2 },
      ],
      flasks: { red: 20, green: 10, blue: 10 },
    },
    workEffect: {
      type: 'produce_resource',
      target: 'rare_ore',
      baseValue: 10,
    },
  },

  // ============================================
  // TIER 4 - LEGENDARY GOLEMS
  // ============================================
  {
    id: 'arcane_overseer',
    name: 'Arkanowy Nadzorca',
    description: 'Potężny golem zwiększający wydajność wszystkich innych golemów',
    type: 'hauling',
    icon: 'mdi-robot-industrial',
    requiredLevel: 30,
    requiredResearch: 'golem_mastery',
    craftCost: {
      gold: 5000,
      materials: [
        { itemId: 'adamantine_ingot', amount: 10 },
        { itemId: 'void_crystal', amount: 5 },
        { itemId: 'phoenix_feather', amount: 1 },
      ],
      flasks: { red: 100, green: 100, blue: 100 },
    },
    baseIntegrity: 250,
    baseEfficiency: 2.0,
    baseSpeed: 1.5,
    integrityDecayRate: 1,
    repairCost: {
      materials: [
        { itemId: 'adamantine_ingot', amount: 3 },
        { itemId: 'arcane_core', amount: 5 },
      ],
      flasks: { red: 30, green: 30, blue: 30 },
    },
    workEffect: {
      type: 'boost_production',
      baseValue: 0.25, // +25% all golem efficiency
    },
  },
];

// ============================================
// GOLEM UPGRADES
// ============================================

export const GOLEM_UPGRADES: GolemUpgrade[] = [
  // Universal upgrades
  {
    id: 'reinforced_frame',
    name: 'Wzmocniona Rama',
    description: '+25% maksymalnej integralności',
    golemTypes: ['mining', 'hauling', 'combat', 'research', 'alchemy'],
    icon: 'mdi-shield-plus',
    requiredLevel: 10,
    cost: {
      gold: 200,
      materials: [{ itemId: 'iron_ingot', amount: 10 }],
    },
    effects: [{ type: 'integrity', value: 25 }],
  },
  {
    id: 'efficient_core',
    name: 'Wydajny Rdzeń',
    description: '+15% wydajności',
    golemTypes: ['mining', 'hauling', 'combat', 'research', 'alchemy'],
    icon: 'mdi-lightning-bolt',
    requiredLevel: 12,
    cost: {
      gold: 300,
      materials: [{ itemId: 'magic_crystal', amount: 5 }],
      flasks: { blue: 10 },
    },
    effects: [{ type: 'efficiency', value: 15 }],
  },
  {
    id: 'speed_gears',
    name: 'Szybkie Przekładnie',
    description: '+20% prędkości pracy',
    golemTypes: ['mining', 'hauling', 'alchemy'],
    icon: 'mdi-cog-clockwise',
    requiredLevel: 15,
    cost: {
      gold: 400,
      materials: [
        { itemId: 'steel_ingot', amount: 8 },
        { itemId: 'magic_dust', amount: 10 },
      ],
    },
    effects: [{ type: 'speed', value: 20 }],
  },
  {
    id: 'self_repair_module',
    name: 'Moduł Auto-naprawy',
    description: '-30% szybkości degradacji',
    golemTypes: ['mining', 'hauling', 'combat', 'research', 'alchemy'],
    icon: 'mdi-wrench-cog',
    requiredLevel: 18,
    requiredResearch: 'advanced_golem_maintenance',
    cost: {
      gold: 600,
      materials: [
        { itemId: 'arcane_core', amount: 2 },
        { itemId: 'magic_crystal', amount: 8 },
      ],
      flasks: { red: 15, green: 15 },
    },
    effects: [{ type: 'decay_reduction', value: 30 }],
  },
  // Combat specific
  {
    id: 'battle_plating',
    name: 'Opancerzenie Bojowe',
    description: '+40% integralności, +10% obrażeń',
    golemTypes: ['combat'],
    icon: 'mdi-shield-sword',
    requiredLevel: 22,
    cost: {
      gold: 800,
      materials: [
        { itemId: 'steel_ingot', amount: 15 },
        { itemId: 'dragon_scale', amount: 2 },
      ],
    },
    effects: [
      { type: 'integrity', value: 40 },
      { type: 'special', value: 10, description: '+10% obrażeń w walce' },
    ],
  },
  // Research specific
  {
    id: 'knowledge_matrix',
    name: 'Matryca Wiedzy',
    description: '+25% prędkości badań',
    golemTypes: ['research'],
    icon: 'mdi-brain',
    requiredLevel: 20,
    cost: {
      gold: 700,
      materials: [
        { itemId: 'ancient_scroll', amount: 5 },
        { itemId: 'magic_crystal', amount: 10 },
      ],
      flasks: { blue: 25 },
    },
    effects: [{ type: 'special', value: 25, description: '+25% prędkości badań' }],
  },
  // Alchemy specific
  {
    id: 'precision_arms',
    name: 'Precyzyjne Ramiona',
    description: '+20% jakości mikstur',
    golemTypes: ['alchemy'],
    icon: 'mdi-arm-flex',
    requiredLevel: 16,
    cost: {
      gold: 500,
      materials: [
        { itemId: 'magic_crystal', amount: 6 },
        { itemId: 'mithril_ingot', amount: 3 },
      ],
      flasks: { green: 20 },
    },
    effects: [{ type: 'special', value: 20, description: '+20% jakości mikstur' }],
  },
];

// ============================================
// GOLEM TASKS
// ============================================

export interface GolemTaskDefinition {
  id: string;
  name: string;
  description: string;
  golemType: GolemType;
  duration: number; // Ticks
  rewards: GolemTaskReward[];
  requirements?: {
    minEfficiency?: number;
    minLevel?: number;
  };
}

export interface GolemTaskReward {
  type: 'resource' | 'item' | 'xp' | 'flask';
  id?: string;
  amount: number;
}

export const GOLEM_TASKS: GolemTaskDefinition[] = [
  // Mining tasks
  {
    id: 'mine_iron',
    name: 'Wydobycie Żelaza',
    description: 'Wydobądź rudę żelaza z pobliskiej kopalni',
    golemType: 'mining',
    duration: 600, // 1 minute
    rewards: [
      { type: 'item', id: 'iron_ore', amount: 5 },
      { type: 'xp', amount: 10 },
    ],
  },
  {
    id: 'mine_gold',
    name: 'Wydobycie Złota',
    description: 'Poszukaj złotych żył',
    golemType: 'mining',
    duration: 1200,
    rewards: [
      { type: 'item', id: 'gold_ore', amount: 3 },
      { type: 'xp', amount: 25 },
    ],
    requirements: { minEfficiency: 1.2 },
  },
  {
    id: 'mine_mithril',
    name: 'Wydobycie Mithrilu',
    description: 'Wydobądź rzadki mithril',
    golemType: 'mining',
    duration: 3000,
    rewards: [
      { type: 'item', id: 'mithril_ore', amount: 2 },
      { type: 'xp', amount: 50 },
    ],
    requirements: { minEfficiency: 1.5, minLevel: 20 },
  },
  // Hauling tasks
  {
    id: 'organize_storage',
    name: 'Organizacja Magazynu',
    description: 'Uporządkuj przedmioty w magazynie',
    golemType: 'hauling',
    duration: 300,
    rewards: [
      { type: 'xp', amount: 5 },
      { type: 'flask', id: 'green', amount: 2 },
    ],
  },
  {
    id: 'transport_batch',
    name: 'Transport Partii',
    description: 'Przenieś dużą partię towarów',
    golemType: 'hauling',
    duration: 600,
    rewards: [
      { type: 'resource', id: 'gold', amount: 20 },
      { type: 'xp', amount: 15 },
    ],
  },
  // Research tasks
  {
    id: 'study_texts',
    name: 'Studiowanie Tekstów',
    description: 'Analizuj starożytne manuskrypty',
    golemType: 'research',
    duration: 1200,
    rewards: [
      { type: 'flask', id: 'blue', amount: 10 },
      { type: 'xp', amount: 30 },
    ],
  },
  // Alchemy tasks
  {
    id: 'prepare_ingredients',
    name: 'Przygotowanie Składników',
    description: 'Przygotuj składniki do alchemii',
    golemType: 'alchemy',
    duration: 450,
    rewards: [
      { type: 'flask', id: 'green', amount: 5 },
      { type: 'xp', amount: 12 },
    ],
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getGolemBlueprint(id: string): GolemBlueprint | undefined {
  return GOLEM_BLUEPRINTS.find(b => b.id === id);
}

export function getGolemUpgrade(id: string): GolemUpgrade | undefined {
  return GOLEM_UPGRADES.find(u => u.id === id);
}

export function getGolemTask(id: string): GolemTaskDefinition | undefined {
  return GOLEM_TASKS.find(t => t.id === id);
}

export function getGolemsByType(type: GolemType): GolemBlueprint[] {
  return GOLEM_BLUEPRINTS.filter(b => b.type === type);
}

export function getUpgradesForGolemType(type: GolemType): GolemUpgrade[] {
  return GOLEM_UPGRADES.filter(u => u.golemTypes.includes(type));
}

export function getTasksForGolemType(type: GolemType): GolemTaskDefinition[] {
  return GOLEM_TASKS.filter(t => t.golemType === type);
}

export function getAvailableBlueprints(playerLevel: number, completedResearch: Set<string>): GolemBlueprint[] {
  return GOLEM_BLUEPRINTS.filter(b => {
    if (b.requiredLevel > playerLevel) return false;
    if (b.requiredResearch && !completedResearch.has(b.requiredResearch)) return false;
    return true;
  });
}

export function calculateGolemProduction(
  golem: { efficiency: number; speed: number; level: number },
  blueprint: GolemBlueprint,
  workshopBonus: number = 0
): number {
  const baseValue = blueprint.workEffect.baseValue;
  const efficiencyMultiplier = golem.efficiency * (1 + workshopBonus);
  const speedMultiplier = golem.speed;
  const levelBonus = 1 + (golem.level - 1) * 0.05;

  return baseValue * efficiencyMultiplier * speedMultiplier * levelBonus;
}

export function calculateRepairTime(
  integrity: number,
  maxIntegrity: number,
  repairSpeed: number = 1
): number {
  const missingIntegrity = maxIntegrity - integrity;
  const baseTime = missingIntegrity * 10; // 10 ticks per 1% integrity
  return Math.ceil(baseTime / repairSpeed);
}
