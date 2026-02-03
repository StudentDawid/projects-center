/**
 * Market System definitions for Ateria Idle
 * Dynamic pricing, market events, and haggle mechanics
 */

import type { MarketModifier, PriceTrend } from '@ateria-idle/entities/ateria-idle/merchant';

// ============================================
// PRICE CATEGORIES
// ============================================

export interface ItemPriceConfig {
  category: string;
  basePrice: number;
  volatility: number; // 0-1, how much prices can fluctuate
  recoveryRate: number; // How fast price returns to base
  demandElasticity: number; // How much demand affects price
}

export const ITEM_PRICE_CONFIGS: Record<string, ItemPriceConfig> = {
  // Loot items
  common_loot: {
    category: 'common_loot',
    basePrice: 5,
    volatility: 0.3,
    recoveryRate: 0.05,
    demandElasticity: 0.5,
  },
  uncommon_loot: {
    category: 'uncommon_loot',
    basePrice: 25,
    volatility: 0.4,
    recoveryRate: 0.03,
    demandElasticity: 0.6,
  },
  rare_loot: {
    category: 'rare_loot',
    basePrice: 100,
    volatility: 0.5,
    recoveryRate: 0.02,
    demandElasticity: 0.7,
  },
  epic_loot: {
    category: 'epic_loot',
    basePrice: 500,
    volatility: 0.6,
    recoveryRate: 0.01,
    demandElasticity: 0.8,
  },
  legendary_loot: {
    category: 'legendary_loot',
    basePrice: 2000,
    volatility: 0.7,
    recoveryRate: 0.005,
    demandElasticity: 0.9,
  },
  // Crafting materials
  ore: {
    category: 'ore',
    basePrice: 15,
    volatility: 0.25,
    recoveryRate: 0.04,
    demandElasticity: 0.4,
  },
  herb: {
    category: 'herb',
    basePrice: 10,
    volatility: 0.35,
    recoveryRate: 0.06,
    demandElasticity: 0.45,
  },
  potion: {
    category: 'potion',
    basePrice: 30,
    volatility: 0.3,
    recoveryRate: 0.04,
    demandElasticity: 0.5,
  },
  weapon: {
    category: 'weapon',
    basePrice: 150,
    volatility: 0.4,
    recoveryRate: 0.02,
    demandElasticity: 0.6,
  },
  armor: {
    category: 'armor',
    basePrice: 200,
    volatility: 0.35,
    recoveryRate: 0.02,
    demandElasticity: 0.55,
  },
  food: {
    category: 'food',
    basePrice: 8,
    volatility: 0.2,
    recoveryRate: 0.08,
    demandElasticity: 0.3,
  },
  luxury: {
    category: 'luxury',
    basePrice: 300,
    volatility: 0.5,
    recoveryRate: 0.01,
    demandElasticity: 0.8,
  },
  artifact: {
    category: 'artifact',
    basePrice: 1000,
    volatility: 0.6,
    recoveryRate: 0.005,
    demandElasticity: 0.9,
  },
};

// ============================================
// MARKET EVENTS
// ============================================

export interface MarketEventTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic';
  
  // Effects
  affectedCategories: string[];
  priceModifier: number; // Multiplier (0.5 = -50%, 1.5 = +50%)
  demandModifier: number;
  
  // Duration in ticks (at 10 ticks/sec)
  minDuration: number;
  maxDuration: number;
  
  // Positive or negative?
  sentiment: 'positive' | 'negative' | 'neutral';
}

export const MARKET_EVENTS: MarketEventTemplate[] = [
  // ============================================
  // POSITIVE EVENTS
  // ============================================
  {
    id: 'merchant_festival',
    name: 'Festiwal Handlu',
    description: 'Wielki festiwal przyciąga tłumy kupujących!',
    icon: 'mdi-party-popper',
    rarity: 'uncommon',
    affectedCategories: ['all'],
    priceModifier: 1.2,
    demandModifier: 1.5,
    minDuration: 3000, // 5 min
    maxDuration: 6000, // 10 min
    sentiment: 'positive',
  },
  {
    id: 'weapon_shortage',
    name: 'Niedobór Broni',
    description: 'Wojsko potrzebuje broni - ceny rosną!',
    icon: 'mdi-sword-cross',
    rarity: 'common',
    affectedCategories: ['weapon'],
    priceModifier: 1.5,
    demandModifier: 2,
    minDuration: 2000,
    maxDuration: 5000,
    sentiment: 'positive',
  },
  {
    id: 'noble_wedding',
    name: 'Ślub Szlachecki',
    description: 'Wielkie wesele - luksusowe towary w cenie!',
    icon: 'mdi-ring',
    rarity: 'rare',
    affectedCategories: ['luxury', 'artifact'],
    priceModifier: 1.8,
    demandModifier: 2.5,
    minDuration: 2000,
    maxDuration: 4000,
    sentiment: 'positive',
  },
  {
    id: 'plague_outbreak',
    name: 'Epidemia',
    description: 'Choroba szerzy się - mikstury bardzo poszukiwane!',
    icon: 'mdi-biohazard',
    rarity: 'uncommon',
    affectedCategories: ['potion', 'herb'],
    priceModifier: 2,
    demandModifier: 3,
    minDuration: 3000,
    maxDuration: 6000,
    sentiment: 'positive',
  },
  {
    id: 'mining_boom',
    name: 'Gorączka Górnicza',
    description: 'Odkryto nowe złoża - rudy bardzo poszukiwane!',
    icon: 'mdi-pickaxe',
    rarity: 'common',
    affectedCategories: ['ore'],
    priceModifier: 1.4,
    demandModifier: 1.8,
    minDuration: 2500,
    maxDuration: 5000,
    sentiment: 'positive',
  },
  {
    id: 'collectors_convention',
    name: 'Zjazd Kolekcjonerów',
    description: 'Kolekcjonerzy płacą świetne ceny za rzadkości!',
    icon: 'mdi-diamond-stone',
    rarity: 'rare',
    affectedCategories: ['rare_loot', 'epic_loot', 'legendary_loot'],
    priceModifier: 1.6,
    demandModifier: 2,
    minDuration: 2000,
    maxDuration: 4000,
    sentiment: 'positive',
  },

  // ============================================
  // NEGATIVE EVENTS
  // ============================================
  {
    id: 'market_crash',
    name: 'Krach Rynkowy',
    description: 'Panika na rynku - ceny spadają!',
    icon: 'mdi-chart-line-variant',
    rarity: 'uncommon',
    affectedCategories: ['all'],
    priceModifier: 0.7,
    demandModifier: 0.6,
    minDuration: 2000,
    maxDuration: 4000,
    sentiment: 'negative',
  },
  {
    id: 'oversupply_weapons',
    name: 'Nadmiar Broni',
    description: 'Rynek zalany bronią z wojen - ceny spadają.',
    icon: 'mdi-sword',
    rarity: 'common',
    affectedCategories: ['weapon', 'armor'],
    priceModifier: 0.6,
    demandModifier: 0.5,
    minDuration: 2500,
    maxDuration: 5000,
    sentiment: 'negative',
  },
  {
    id: 'import_flood',
    name: 'Import Zagraniczny',
    description: 'Tanie towary z zagranicy zaniżają ceny.',
    icon: 'mdi-ship-wheel',
    rarity: 'uncommon',
    affectedCategories: ['common_loot', 'uncommon_loot', 'food'],
    priceModifier: 0.5,
    demandModifier: 0.4,
    minDuration: 3000,
    maxDuration: 6000,
    sentiment: 'negative',
  },
  {
    id: 'tax_increase',
    name: 'Podwyżka Podatków',
    description: 'Nowe podatki obniżają marże handlowe.',
    icon: 'mdi-bank',
    rarity: 'common',
    affectedCategories: ['all'],
    priceModifier: 0.85,
    demandModifier: 0.8,
    minDuration: 4000,
    maxDuration: 8000,
    sentiment: 'negative',
  },
  {
    id: 'herb_blight',
    name: 'Zaraza Roślin',
    description: 'Choroba niszczy uprawy - mniej ziół na rynku.',
    icon: 'mdi-flower-outline',
    rarity: 'uncommon',
    affectedCategories: ['herb'],
    priceModifier: 1.3, // Prices go up but demand goes down
    demandModifier: 0.5,
    minDuration: 3000,
    maxDuration: 6000,
    sentiment: 'neutral',
  },

  // ============================================
  // NEUTRAL/SPECIAL EVENTS
  // ============================================
  {
    id: 'volatile_market',
    name: 'Niestabilny Rynek',
    description: 'Ceny skaczą jak szalone - ryzyko i okazje!',
    icon: 'mdi-chart-bell-curve',
    rarity: 'rare',
    affectedCategories: ['all'],
    priceModifier: 1, // Base price unchanged, but volatility increases
    demandModifier: 1,
    minDuration: 2000,
    maxDuration: 4000,
    sentiment: 'neutral',
  },
  {
    id: 'royal_decree',
    name: 'Dekret Królewski',
    description: 'Król zakazuje eksportu luksusów - ceny lokalne spadają!',
    icon: 'mdi-crown',
    rarity: 'epic',
    affectedCategories: ['luxury', 'artifact'],
    priceModifier: 0.4,
    demandModifier: 3, // People want to buy before ban
    minDuration: 1500,
    maxDuration: 3000,
    sentiment: 'neutral',
  },
];

// ============================================
// HAGGLE SYSTEM
// ============================================

export interface HaggleAttempt {
  customerId: string;
  itemId: string;
  originalPrice: number;
  currentOffer: number;
  customerMaxPrice: number;
  round: number;
  maxRounds: number;
  playerLastOffer: number;
  customerPatience: number; // Decreases with each failed round
  tactics: HaggleTactic[];
}

export type HaggleTactic = 
  | 'aggressive' // High risk, high reward
  | 'friendly' // Build rapport, small gains
  | 'logical' // Appeal to reason
  | 'emotional' // Play on feelings
  | 'bluff' // Lie about value/other offers
  | 'walk_away'; // Threaten to end negotiation

export interface HaggleTacticResult {
  success: boolean;
  priceChange: number; // Positive = customer offers more
  patienceChange: number;
  message: string;
  bonusXp?: number;
}

export interface HaggleTacticConfig {
  id: HaggleTactic;
  name: string;
  description: string;
  icon: string;
  baseSuccessChance: number; // 0-1
  priceGainOnSuccess: number; // % of difference to max
  priceGainOnFail: number; // Usually negative
  patienceCostOnFail: number;
  charismaBonus: number; // How much charisma helps
  negotiationBonus: number;
  cooldown: number; // Rounds before can use again
}

export const HAGGLE_TACTICS: Record<HaggleTactic, HaggleTacticConfig> = {
  aggressive: {
    id: 'aggressive',
    name: 'Agresywna',
    description: 'Forsuj wysoką cenę - ryzykowne ale skuteczne',
    icon: 'mdi-fire',
    baseSuccessChance: 0.4,
    priceGainOnSuccess: 0.3, // +30% of gap
    priceGainOnFail: -0.15, // Customer lowers offer
    patienceCostOnFail: 2,
    charismaBonus: 0.05,
    negotiationBonus: 0.1,
    cooldown: 2,
  },
  friendly: {
    id: 'friendly',
    name: 'Przyjacielska',
    description: 'Buduj relację - bezpieczne ale wolniejsze',
    icon: 'mdi-emoticon-happy',
    baseSuccessChance: 0.7,
    priceGainOnSuccess: 0.1,
    priceGainOnFail: 0, // No penalty
    patienceCostOnFail: 0,
    charismaBonus: 0.15,
    negotiationBonus: 0.05,
    cooldown: 0,
  },
  logical: {
    id: 'logical',
    name: 'Logiczna',
    description: 'Podaj racjonalne argumenty za ceną',
    icon: 'mdi-head-cog',
    baseSuccessChance: 0.55,
    priceGainOnSuccess: 0.2,
    priceGainOnFail: -0.05,
    patienceCostOnFail: 1,
    charismaBonus: 0.05,
    negotiationBonus: 0.15,
    cooldown: 1,
  },
  emotional: {
    id: 'emotional',
    name: 'Emocjonalna',
    description: 'Odwołaj się do uczuć klienta',
    icon: 'mdi-heart',
    baseSuccessChance: 0.5,
    priceGainOnSuccess: 0.25,
    priceGainOnFail: -0.1,
    patienceCostOnFail: 1,
    charismaBonus: 0.2,
    negotiationBonus: 0.05,
    cooldown: 2,
  },
  bluff: {
    id: 'bluff',
    name: 'Blef',
    description: 'Kłam o wartości lub innych ofertach',
    icon: 'mdi-cards-playing',
    baseSuccessChance: 0.35,
    priceGainOnSuccess: 0.4,
    priceGainOnFail: -0.2,
    patienceCostOnFail: 3,
    charismaBonus: 0.1,
    negotiationBonus: 0.15,
    cooldown: 3,
  },
  walk_away: {
    id: 'walk_away',
    name: 'Odejdź',
    description: 'Groź zakończeniem negocjacji',
    icon: 'mdi-exit-run',
    baseSuccessChance: 0.3,
    priceGainOnSuccess: 0.5, // Big gain if works
    priceGainOnFail: 0, // They actually leave
    patienceCostOnFail: 10, // Ends negotiation
    charismaBonus: 0.1,
    negotiationBonus: 0.1,
    cooldown: 99, // Once per negotiation
  },
};

// ============================================
// CUSTOMER HAGGLE PERSONALITY
// ============================================

export interface CustomerHaggleProfile {
  type: string;
  startingOfferPercent: number; // % of item price they start at
  maxPayPercent: number; // Max % of price they'll pay
  patienceBase: number; // Base haggle rounds
  preferredTactics: HaggleTactic[]; // Tactics that work well
  weakTactics: HaggleTactic[]; // Tactics that don't work
  aggressiveness: number; // How hard they push back
}

export const CUSTOMER_HAGGLE_PROFILES: Record<string, CustomerHaggleProfile> = {
  peasant: {
    type: 'peasant',
    startingOfferPercent: 0.5,
    maxPayPercent: 0.8,
    patienceBase: 3,
    preferredTactics: ['friendly', 'emotional'],
    weakTactics: ['aggressive', 'bluff'],
    aggressiveness: 0.3,
  },
  traveler: {
    type: 'traveler',
    startingOfferPercent: 0.6,
    maxPayPercent: 0.95,
    patienceBase: 4,
    preferredTactics: ['logical', 'friendly'],
    weakTactics: ['emotional'],
    aggressiveness: 0.4,
  },
  merchant: {
    type: 'merchant',
    startingOfferPercent: 0.55,
    maxPayPercent: 0.85,
    patienceBase: 5,
    preferredTactics: ['logical'],
    weakTactics: ['emotional', 'bluff'], // They know bluffs
    aggressiveness: 0.6,
  },
  noble: {
    type: 'noble',
    startingOfferPercent: 0.7,
    maxPayPercent: 1.2, // Will overpay for status
    patienceBase: 3,
    preferredTactics: ['friendly', 'emotional'],
    weakTactics: ['aggressive'],
    aggressiveness: 0.2,
  },
  collector: {
    type: 'collector',
    startingOfferPercent: 0.75,
    maxPayPercent: 1.5, // Will pay premium for rare items
    patienceBase: 6,
    preferredTactics: ['logical', 'emotional'],
    weakTactics: ['walk_away'], // They really want it
    aggressiveness: 0.35,
  },
  whale: {
    type: 'whale',
    startingOfferPercent: 0.9,
    maxPayPercent: 2, // Money is no object
    patienceBase: 2,
    preferredTactics: ['friendly'],
    weakTactics: ['aggressive', 'bluff'],
    aggressiveness: 0.1,
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getItemPriceConfig(category: string): ItemPriceConfig {
  return ITEM_PRICE_CONFIGS[category] || ITEM_PRICE_CONFIGS.common_loot;
}

export function getRandomMarketEvent(maxRarity: 'common' | 'uncommon' | 'rare' | 'epic' = 'rare'): MarketEventTemplate {
  const rarityOrder = ['common', 'uncommon', 'rare', 'epic'];
  const maxIdx = rarityOrder.indexOf(maxRarity);
  
  const eligible = MARKET_EVENTS.filter(e => rarityOrder.indexOf(e.rarity) <= maxIdx);
  
  // Weight by rarity (common more likely)
  const weights: Record<string, number> = {
    common: 50,
    uncommon: 30,
    rare: 15,
    epic: 5,
  };
  
  const totalWeight = eligible.reduce((sum, e) => sum + weights[e.rarity], 0);
  let random = Math.random() * totalWeight;
  
  for (const event of eligible) {
    random -= weights[event.rarity];
    if (random <= 0) return event;
  }
  
  return eligible[0];
}

export function createMarketModifier(event: MarketEventTemplate): MarketModifier {
  const duration = Math.floor(
    Math.random() * (event.maxDuration - event.minDuration) + event.minDuration
  );
  
  return {
    id: `${event.id}_${Date.now()}`,
    name: event.name,
    description: event.description,
    icon: event.icon,
    affectedCategories: event.affectedCategories,
    priceModifier: event.priceModifier,
    demandModifier: event.demandModifier,
    startTime: Date.now(),
    duration,
    isActive: true,
  };
}

export function calculateDynamicPrice(
  basePrice: number,
  supplyLevel: number,
  demandLevel: number,
  trend: PriceTrend,
  modifiers: MarketModifier[],
  category: string
): number {
  const config = getItemPriceConfig(category);
  
  // Supply/demand effect
  const supplyEffect = 1 + (0.5 - supplyLevel) * config.demandElasticity;
  const demandEffect = 1 + (demandLevel - 0.5) * config.demandElasticity;
  
  // Trend effect
  let trendEffect = 1;
  switch (trend) {
    case 'rising': trendEffect = 1.1; break;
    case 'falling': trendEffect = 0.9; break;
    case 'volatile': trendEffect = 0.8 + Math.random() * 0.4; break;
    default: trendEffect = 1;
  }
  
  // Apply market modifiers
  let modifierEffect = 1;
  for (const mod of modifiers) {
    if (mod.isActive && (mod.affectedCategories.includes('all') || mod.affectedCategories.includes(category))) {
      modifierEffect *= mod.priceModifier;
    }
  }
  
  const finalPrice = basePrice * supplyEffect * demandEffect * trendEffect * modifierEffect;
  
  // Add some noise based on volatility
  const noise = 1 + (Math.random() - 0.5) * config.volatility * 0.2;
  
  return Math.max(1, Math.round(finalPrice * noise));
}

export function getHaggleTacticConfig(tactic: HaggleTactic): HaggleTacticConfig {
  return HAGGLE_TACTICS[tactic];
}

export function getCustomerHaggleProfile(customerType: string): CustomerHaggleProfile {
  return CUSTOMER_HAGGLE_PROFILES[customerType] || CUSTOMER_HAGGLE_PROFILES.traveler;
}

export function calculateHaggleSuccess(
  tactic: HaggleTactic,
  charisma: number,
  negotiation: number,
  customerProfile: CustomerHaggleProfile,
  shopBonus: number = 0
): { success: boolean; roll: number; threshold: number } {
  const config = HAGGLE_TACTICS[tactic];
  
  // Base chance
  let chance = config.baseSuccessChance;
  
  // Stat bonuses
  chance += (charisma / 100) * config.charismaBonus;
  chance += (negotiation / 100) * config.negotiationBonus;
  
  // Shop bonus
  chance += shopBonus / 100;
  
  // Customer preference bonus/penalty
  if (customerProfile.preferredTactics.includes(tactic)) {
    chance += 0.15;
  }
  if (customerProfile.weakTactics.includes(tactic)) {
    chance -= 0.2;
  }
  
  // Cap at 95%
  chance = Math.min(0.95, Math.max(0.05, chance));
  
  const roll = Math.random();
  
  return {
    success: roll < chance,
    roll,
    threshold: chance,
  };
}
