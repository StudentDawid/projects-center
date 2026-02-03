/**
 * Crafting Orders System - NPC Orders, Reputation, Special Rewards
 */

import type { ItemRarity } from '@libs/entities/ateria-idle/warrior';
import type { CraftingProfession } from './crafting.data';

// ============================================
// TYPES
// ============================================

export interface CraftingOrder {
  id: string;
  clientName: string;
  clientIcon: string;
  title: string;
  description: string;
  profession: CraftingProfession;
  
  // Requirements
  requiredItems: OrderItem[];
  requiredLevel: number;
  minQuality: number; // Minimum quality required
  
  // Time limit
  timeLimit: number; // Ticks to complete, 0 = no limit
  
  // Rewards
  goldReward: number;
  xpReward: number;
  reputationReward: number;
  bonusItems?: { itemId: string; amount: number; chance: number }[];
  
  // Order type
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  repeatable: boolean;
}

export interface OrderItem {
  itemId: string;
  itemName: string;
  amount: number;
  minQuality?: number;
}

export interface CraftingOrderState {
  orderId: string;
  acceptedAt: number;
  deadline: number | null; // null = no deadline
  itemsDelivered: Map<string, { amount: number; quality: number }>;
  completed: boolean;
}

export interface CrafterReputation {
  level: number;
  xp: number;
  xpToNextLevel: number;
  title: string;
}

// ============================================
// REPUTATION TITLES
// ============================================

export const CRAFTER_TITLES: { level: number; title: string }[] = [
  { level: 1, title: 'Początkujący' },
  { level: 5, title: 'Czeladnik' },
  { level: 10, title: 'Rzemieślnik' },
  { level: 20, title: 'Mistrz' },
  { level: 35, title: 'Arcymistrz' },
  { level: 50, title: 'Legendarny Rzemieślnik' },
];

export function getCrafterTitle(level: number): string {
  for (let i = CRAFTER_TITLES.length - 1; i >= 0; i--) {
    if (level >= CRAFTER_TITLES[i].level) {
      return CRAFTER_TITLES[i].title;
    }
  }
  return 'Nowicjusz';
}

// ============================================
// CRAFTING ORDERS
// ============================================

export const CRAFTING_ORDERS: Record<string, CraftingOrder> = {
  // Easy orders
  village_tools: {
    id: 'village_tools',
    clientName: 'Starosta Wioski',
    clientIcon: 'mdi-account-tie',
    title: 'Narzędzia dla Wioski',
    description: 'Wioska potrzebuje podstawowych narzędzi do pracy.',
    profession: 'smithing',
    requiredItems: [
      { itemId: 'stone_pickaxe', itemName: 'Kamienny Kilof', amount: 2 },
      { itemId: 'stone_axe', itemName: 'Kamienna Siekiera', amount: 2 },
    ],
    requiredLevel: 1,
    minQuality: 30,
    timeLimit: 0,
    goldReward: 100,
    xpReward: 50,
    reputationReward: 5,
    difficulty: 'easy',
    repeatable: true,
  },
  farmers_request: {
    id: 'farmers_request',
    clientName: 'Rolnik Jan',
    clientIcon: 'mdi-account',
    title: 'Sierpy dla Rolników',
    description: 'Nadchodzą żniwa i potrzebujemy nowych sierpów.',
    profession: 'tailoring',
    requiredItems: [
      { itemId: 'copper_sickle', itemName: 'Miedziany Sierp', amount: 3 },
    ],
    requiredLevel: 8,
    minQuality: 40,
    timeLimit: 0,
    goldReward: 150,
    xpReward: 70,
    reputationReward: 8,
    difficulty: 'easy',
    repeatable: true,
  },
  jewelry_gift: {
    id: 'jewelry_gift',
    clientName: 'Zakochany Młodzieniec',
    clientIcon: 'mdi-heart',
    title: 'Pierścień dla Ukochanej',
    description: 'Potrzebuję pięknego pierścienia, aby oświadczyć się mojej wybrance.',
    profession: 'jewelcrafting',
    requiredItems: [
      { itemId: 'crafted_copper_ring', itemName: 'Miedziany Pierścień', amount: 1, minQuality: 70 },
    ],
    requiredLevel: 5,
    minQuality: 70,
    timeLimit: 3000, // 5 minutes
    goldReward: 200,
    xpReward: 80,
    reputationReward: 10,
    bonusItems: [
      { itemId: 'cut_quartz', amount: 2, chance: 50 },
    ],
    difficulty: 'easy',
    repeatable: true,
  },

  // Medium orders
  guard_equipment: {
    id: 'guard_equipment',
    clientName: 'Kapitan Straży',
    clientIcon: 'mdi-shield-account',
    title: 'Wyposażenie dla Straży',
    description: 'Straż miejska potrzebuje nowego wyposażenia.',
    profession: 'smithing',
    requiredItems: [
      { itemId: 'crafted_iron_sword', itemName: 'Żelazny Miecz', amount: 2 },
      { itemId: 'crafted_iron_plate', itemName: 'Żelazna Płyta', amount: 2 },
    ],
    requiredLevel: 18,
    minQuality: 50,
    timeLimit: 0,
    goldReward: 500,
    xpReward: 200,
    reputationReward: 15,
    difficulty: 'medium',
    repeatable: true,
  },
  hunting_bows: {
    id: 'hunting_bows',
    clientName: 'Gildia Łowców',
    clientIcon: 'mdi-bow-arrow',
    title: 'Łuki Myśliwskie',
    description: 'Gildia Łowców zamawia nowe łuki.',
    profession: 'woodworking',
    requiredItems: [
      { itemId: 'crafted_hunting_bow', itemName: 'Łuk Myśliwski', amount: 3, minQuality: 60 },
    ],
    requiredLevel: 10,
    minQuality: 60,
    timeLimit: 0,
    goldReward: 350,
    xpReward: 150,
    reputationReward: 12,
    difficulty: 'medium',
    repeatable: true,
  },
  noble_jewelry: {
    id: 'noble_jewelry',
    clientName: 'Lady Eleonora',
    clientIcon: 'mdi-crown',
    title: 'Biżuteria dla Szlachty',
    description: 'Szlachcianka potrzebuje eleganckiej biżuterii na bal.',
    profession: 'jewelcrafting',
    requiredItems: [
      { itemId: 'crafted_silver_ring', itemName: 'Srebrny Pierścień', amount: 1, minQuality: 70 },
      { itemId: 'crafted_silver_amulet', itemName: 'Srebrny Amulet', amount: 1, minQuality: 70 },
    ],
    requiredLevel: 20,
    minQuality: 70,
    timeLimit: 6000, // 10 minutes
    goldReward: 600,
    xpReward: 250,
    reputationReward: 18,
    bonusItems: [
      { itemId: 'cut_amethyst', amount: 1, chance: 30 },
    ],
    difficulty: 'medium',
    repeatable: true,
  },

  // Hard orders
  knight_armor: {
    id: 'knight_armor',
    clientName: 'Rycerz Królestwa',
    clientIcon: 'mdi-chess-knight',
    title: 'Zbroja Rycerska',
    description: 'Rycerz potrzebuje pełnego zestawu stalowej zbroi.',
    profession: 'smithing',
    requiredItems: [
      { itemId: 'crafted_steel_sword', itemName: 'Stalowy Miecz', amount: 1, minQuality: 75 },
      { itemId: 'steel_ingot', itemName: 'Sztabka Stali', amount: 10 },
    ],
    requiredLevel: 28,
    minQuality: 75,
    timeLimit: 0,
    goldReward: 1200,
    xpReward: 500,
    reputationReward: 25,
    bonusItems: [
      { itemId: 'mithril_ore', amount: 2, chance: 20 },
    ],
    difficulty: 'hard',
    repeatable: true,
  },
  elven_bow: {
    id: 'elven_bow',
    clientName: 'Ambasador Elfów',
    clientIcon: 'mdi-leaf',
    title: 'Elficki Łuk',
    description: 'Elfy zamawiają legendarne łuki z cisowego drewna.',
    profession: 'woodworking',
    requiredItems: [
      { itemId: 'crafted_yew_longbow', itemName: 'Długi Łuk Cisowy', amount: 1, minQuality: 80 },
    ],
    requiredLevel: 38,
    minQuality: 80,
    timeLimit: 0,
    goldReward: 1000,
    xpReward: 450,
    reputationReward: 22,
    difficulty: 'hard',
    repeatable: true,
  },
  royal_jewelry: {
    id: 'royal_jewelry',
    clientName: 'Skarbnik Królewski',
    clientIcon: 'mdi-crown',
    title: 'Królewska Biżuteria',
    description: 'Dwór królewski zamawia luksusową biżuterię.',
    profession: 'jewelcrafting',
    requiredItems: [
      { itemId: 'crafted_ruby_ring', itemName: 'Rubinowy Pierścień', amount: 1, minQuality: 85 },
      { itemId: 'gold_ingot', itemName: 'Sztabka Złota', amount: 5 },
    ],
    requiredLevel: 40,
    minQuality: 85,
    timeLimit: 9000, // 15 minutes
    goldReward: 2000,
    xpReward: 700,
    reputationReward: 30,
    bonusItems: [
      { itemId: 'cut_sapphire', amount: 2, chance: 40 },
      { itemId: 'cut_emerald', amount: 1, chance: 15 },
    ],
    difficulty: 'hard',
    repeatable: true,
  },

  // Expert orders
  legendary_blade: {
    id: 'legendary_blade',
    clientName: 'Mistrz Ostrzy',
    clientIcon: 'mdi-sword-cross',
    title: 'Legendarny Miecz',
    description: 'Wykuj miecz godny samych bogów.',
    profession: 'smithing',
    requiredItems: [
      { itemId: 'mithril_ingot', itemName: 'Sztabka Mithrilu', amount: 8 },
      { itemId: 'cut_ruby', itemName: 'Szlifowany Rubin', amount: 2 },
      { itemId: 'magic_essence', itemName: 'Magiczna Esencja', amount: 5 },
    ],
    requiredLevel: 50,
    minQuality: 90,
    timeLimit: 0,
    goldReward: 5000,
    xpReward: 1500,
    reputationReward: 50,
    bonusItems: [
      { itemId: 'adamantite_ore', amount: 3, chance: 30 },
    ],
    difficulty: 'expert',
    repeatable: false,
  },
  crown_jewels: {
    id: 'crown_jewels',
    clientName: 'Król Aldric III',
    clientIcon: 'mdi-crown',
    title: 'Korona Królewska',
    description: 'Sam król zamawia nową koronę.',
    profession: 'jewelcrafting',
    requiredItems: [
      { itemId: 'gold_ingot', itemName: 'Sztabka Złota', amount: 10 },
      { itemId: 'cut_diamond', itemName: 'Szlifowany Diament', amount: 3 },
      { itemId: 'cut_ruby', itemName: 'Szlifowany Rubin', amount: 2 },
      { itemId: 'cut_sapphire', itemName: 'Szlifowany Szafir', amount: 2 },
    ],
    requiredLevel: 60,
    minQuality: 95,
    timeLimit: 18000, // 30 minutes
    goldReward: 10000,
    xpReward: 3000,
    reputationReward: 100,
    difficulty: 'expert',
    repeatable: false,
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getOrder(id: string): CraftingOrder | undefined {
  return CRAFTING_ORDERS[id];
}

export function getOrdersByProfession(profession: CraftingProfession): CraftingOrder[] {
  return Object.values(CRAFTING_ORDERS).filter(o => o.profession === profession);
}

export function getOrdersByDifficulty(difficulty: CraftingOrder['difficulty']): CraftingOrder[] {
  return Object.values(CRAFTING_ORDERS).filter(o => o.difficulty === difficulty);
}

export function getAvailableOrders(
  profession: CraftingProfession | null,
  level: number,
  reputation: number,
  completedOrders: Set<string>
): CraftingOrder[] {
  return Object.values(CRAFTING_ORDERS).filter(order => {
    // Check profession
    if (profession && order.profession !== profession) return false;
    
    // Check level
    if (order.requiredLevel > level) return false;
    
    // Check if non-repeatable order was completed
    if (!order.repeatable && completedOrders.has(order.id)) return false;
    
    return true;
  });
}

export function getDifficultyColor(difficulty: CraftingOrder['difficulty']): string {
  const colors: Record<string, string> = {
    easy: '#4CAF50',
    medium: '#FF9800',
    hard: '#F44336',
    expert: '#9C27B0',
  };
  return colors[difficulty] || '#9E9E9E';
}

export function getDifficultyLabel(difficulty: CraftingOrder['difficulty']): string {
  const labels: Record<string, string> = {
    easy: 'Łatwe',
    medium: 'Średnie',
    hard: 'Trudne',
    expert: 'Eksperckie',
  };
  return labels[difficulty] || difficulty;
}

export function calculateReputationXpToLevel(level: number): number {
  return Math.floor(50 * Math.pow(1.3, level - 1));
}
