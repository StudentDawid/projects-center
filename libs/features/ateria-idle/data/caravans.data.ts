/**
 * Caravan System definitions for Ateria Idle
 * Trade routes, caravans, and upgrades for the Merchant path
 */

import type {
  TradeRoute,
  Caravan,
  CaravanUpgrade,
  CityId,
} from '@libs/entities/ateria-idle/merchant';

// ============================================
// CITIES
// ============================================

export interface CityDefinition {
  id: CityId;
  name: string;
  description: string;
  icon: string;
  region: string;
  specialties: string[]; // Items that sell well here
  demands: string[]; // Items in high demand
  dangerLevel: number; // 1-5
  unlockRequirement?: {
    merchantLevel?: number;
    reputation?: string;
    completedRoutes?: number;
  };
}

export const CITIES: CityDefinition[] = [
  {
    id: 'stonehaven',
    name: 'Kamienna Przystań',
    description: 'Górnicze miasto słynące z wydobycia rud i kamieni',
    icon: 'mdi-pickaxe',
    region: 'Góry',
    specialties: ['ore', 'stone', 'gems'],
    demands: ['food', 'cloth', 'tools'],
    dangerLevel: 1,
  },
  {
    id: 'greenwood',
    name: 'Zielony Gaj',
    description: 'Leśna osada z dostępem do rzadkich ziół',
    icon: 'mdi-tree',
    region: 'Las',
    specialties: ['herb', 'wood', 'leather'],
    demands: ['metal', 'cloth', 'potions'],
    dangerLevel: 1,
  },
  {
    id: 'portcity',
    name: 'Port Królewski',
    description: 'Wielki port z egzotycznymi towarami',
    icon: 'mdi-sail-boat',
    region: 'Wybrzeże',
    specialties: ['exotic', 'fish', 'spices'],
    demands: ['ore', 'weapons', 'cloth'],
    dangerLevel: 2,
    unlockRequirement: { merchantLevel: 10 },
  },
  {
    id: 'ironforge',
    name: 'Żelazna Kuźnia',
    description: 'Przemysłowe miasto kowalstwa',
    icon: 'mdi-anvil',
    region: 'Góry',
    specialties: ['weapons', 'armor', 'tools'],
    demands: ['ore', 'coal', 'leather'],
    dangerLevel: 2,
    unlockRequirement: { merchantLevel: 12 },
  },
  {
    id: 'mysticspire',
    name: 'Mistyczna Iglica',
    description: 'Miasto magów z rzadkimi artefaktami',
    icon: 'mdi-wizard-hat',
    region: 'Wyżyny',
    specialties: ['magic_items', 'scrolls', 'crystals'],
    demands: ['herbs', 'potions', 'monster_parts'],
    dangerLevel: 3,
    unlockRequirement: { merchantLevel: 18, reputation: 'respected' },
  },
  {
    id: 'shadowmarket',
    name: 'Czarny Targ',
    description: 'Podziemny rynek z nielegalnymi towarami',
    icon: 'mdi-incognito',
    region: 'Podziemia',
    specialties: ['contraband', 'poisons', 'rare_items'],
    demands: ['gold', 'gems', 'artifacts'],
    dangerLevel: 4,
    unlockRequirement: { merchantLevel: 22, completedRoutes: 50 },
  },
  {
    id: 'dragonspeak',
    name: 'Smocza Szczyt',
    description: 'Legendarny szczyt z najrzadszymi skarbami',
    icon: 'mdi-fire',
    region: 'Góry Ognia',
    specialties: ['dragon_materials', 'legendary_items', 'phoenix_items'],
    demands: ['adamantine', 'void_crystals', 'ancient_relics'],
    dangerLevel: 5,
    unlockRequirement: { merchantLevel: 28, reputation: 'legendary' },
  },
];

// ============================================
// TRADE ROUTES
// ============================================

export const TRADE_ROUTES: TradeRoute[] = [
  // Tier 1 Routes
  {
    id: 'stone_green',
    name: 'Szlak Górsko-Leśny',
    description: 'Bezpieczna trasa między górami a lasem',
    icon: 'mdi-map-marker-path',
    fromCity: 'stonehaven',
    toCity: 'greenwood',
    distance: 100,
    baseTravelTime: 1200, // 2 minutes
    danger: 0.05,
    baseProfit: 1.15,
    demandMultiplier: 1.0,
    requirements: { merchantLevel: 1, reputation: 'neutral' },
    events: [],
    unlocked: true,
  },
  {
    id: 'green_stone',
    name: 'Szlak Leśno-Górski',
    description: 'Powrotna trasa z lasu do gór',
    icon: 'mdi-map-marker-path',
    fromCity: 'greenwood',
    toCity: 'stonehaven',
    distance: 100,
    baseTravelTime: 1200,
    danger: 0.05,
    baseProfit: 1.15,
    demandMultiplier: 1.0,
    requirements: { merchantLevel: 1, reputation: 'neutral' },
    events: [],
    unlocked: true,
  },

  // Tier 2 Routes
  {
    id: 'stone_port',
    name: 'Szlak do Portu',
    description: 'Długa trasa do portu morskiego',
    icon: 'mdi-sail-boat',
    fromCity: 'stonehaven',
    toCity: 'portcity',
    distance: 200,
    baseTravelTime: 2400,
    danger: 0.12,
    baseProfit: 1.35,
    demandMultiplier: 1.2,
    requirements: { merchantLevel: 10, reputation: 'friendly' },
    events: ['pirate_attack', 'storm'],
    unlocked: false,
  },
  {
    id: 'green_iron',
    name: 'Szlak Leśno-Kuźniczy',
    description: 'Trasa do miasta kowalskiego',
    icon: 'mdi-anvil',
    fromCity: 'greenwood',
    toCity: 'ironforge',
    distance: 180,
    baseTravelTime: 2100,
    danger: 0.1,
    baseProfit: 1.3,
    demandMultiplier: 1.15,
    requirements: { merchantLevel: 12, reputation: 'friendly' },
    events: ['bandit_attack'],
    unlocked: false,
  },

  // Tier 3 Routes
  {
    id: 'port_mystic',
    name: 'Szlak Magiczny',
    description: 'Niebezpieczna trasa do miasta magów',
    icon: 'mdi-wizard-hat',
    fromCity: 'portcity',
    toCity: 'mysticspire',
    distance: 300,
    baseTravelTime: 3600,
    danger: 0.2,
    baseProfit: 1.6,
    demandMultiplier: 1.4,
    requirements: { merchantLevel: 18, reputation: 'respected' },
    events: ['magical_storm', 'creature_attack'],
    unlocked: false,
  },
  {
    id: 'iron_mystic',
    name: 'Szlak Kuźniczo-Magiczny',
    description: 'Trasa handlowa między rzemieślnikami a magami',
    icon: 'mdi-star-four-points',
    fromCity: 'ironforge',
    toCity: 'mysticspire',
    distance: 250,
    baseTravelTime: 3000,
    danger: 0.18,
    baseProfit: 1.5,
    demandMultiplier: 1.35,
    requirements: { merchantLevel: 20, reputation: 'respected' },
    events: ['monster_attack', 'magical_interference'],
    unlocked: false,
  },

  // Tier 4 Routes
  {
    id: 'mystic_shadow',
    name: 'Mroczny Szlak',
    description: 'Sekretna trasa do czarnego targu',
    icon: 'mdi-incognito',
    fromCity: 'mysticspire',
    toCity: 'shadowmarket',
    distance: 200,
    baseTravelTime: 2400,
    danger: 0.35,
    baseProfit: 2.0,
    demandMultiplier: 1.8,
    requirements: { merchantLevel: 22, reputation: 'respected' },
    events: ['ambush', 'theft', 'bribe_demand'],
    unlocked: false,
  },

  // Tier 5 Routes - Legendary
  {
    id: 'shadow_dragon',
    name: 'Szlak Smoka',
    description: 'Legendarna trasa do Smoczego Szczytu',
    icon: 'mdi-dragon',
    fromCity: 'shadowmarket',
    toCity: 'dragonspeak',
    distance: 500,
    baseTravelTime: 6000,
    danger: 0.5,
    baseProfit: 3.0,
    demandMultiplier: 2.5,
    requirements: { merchantLevel: 28, reputation: 'legendary' },
    events: ['dragon_encounter', 'volcanic_activity', 'treasure_find'],
    unlocked: false,
  },
];

// ============================================
// CARAVAN TYPES
// ============================================

export interface CaravanTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: number;
  baseCapacity: number;
  baseSpeed: number;
  baseProtection: number;
  cost: number;
  unlockRequirement: {
    merchantLevel: number;
    reputation?: string;
  };
  specialAbility?: {
    type: 'speed_boost' | 'protection_boost' | 'capacity_boost' | 'profit_boost';
    value: number;
    condition?: string;
  };
}

export const CARAVAN_TEMPLATES: CaravanTemplate[] = [
  {
    id: 'donkey_cart',
    name: 'Osiołkowy Wózek',
    description: 'Prosty wózek ciągnięty przez osła',
    icon: 'mdi-cart',
    tier: 1,
    baseCapacity: 20,
    baseSpeed: 1.0,
    baseProtection: 0,
    cost: 100,
    unlockRequirement: { merchantLevel: 1 },
  },
  {
    id: 'horse_wagon',
    name: 'Konny Wóz',
    description: 'Solidny wóz z końskim zaprzęgiem',
    icon: 'mdi-truck',
    tier: 2,
    baseCapacity: 50,
    baseSpeed: 1.3,
    baseProtection: 5,
    cost: 500,
    unlockRequirement: { merchantLevel: 8 },
  },
  {
    id: 'armored_carriage',
    name: 'Opancerzony Powóz',
    description: 'Bezpieczny transport z ochroną',
    icon: 'mdi-truck-check',
    tier: 3,
    baseCapacity: 40,
    baseSpeed: 1.1,
    baseProtection: 25,
    cost: 1500,
    unlockRequirement: { merchantLevel: 15 },
    specialAbility: {
      type: 'protection_boost',
      value: 50,
      condition: 'dangerous_route',
    },
  },
  {
    id: 'merchant_convoy',
    name: 'Konwój Kupiecki',
    description: 'Duży konwój z wieloma wozami',
    icon: 'mdi-truck-trailer',
    tier: 4,
    baseCapacity: 150,
    baseSpeed: 0.9,
    baseProtection: 15,
    cost: 4000,
    unlockRequirement: { merchantLevel: 20, reputation: 'respected' },
    specialAbility: {
      type: 'capacity_boost',
      value: 30,
    },
  },
  {
    id: 'swift_runner',
    name: 'Szybki Biegacz',
    description: 'Lekka karawana maksymalizująca prędkość',
    icon: 'mdi-run-fast',
    tier: 3,
    baseCapacity: 25,
    baseSpeed: 2.0,
    baseProtection: 0,
    cost: 2000,
    unlockRequirement: { merchantLevel: 18 },
    specialAbility: {
      type: 'speed_boost',
      value: 25,
    },
  },
  {
    id: 'royal_caravan',
    name: 'Królewska Karawana',
    description: 'Luksusowa karawana z najlepszą ochroną',
    icon: 'mdi-crown',
    tier: 5,
    baseCapacity: 100,
    baseSpeed: 1.4,
    baseProtection: 40,
    cost: 10000,
    unlockRequirement: { merchantLevel: 25, reputation: 'legendary' },
    specialAbility: {
      type: 'profit_boost',
      value: 20,
    },
  },
];

// ============================================
// CARAVAN UPGRADES
// ============================================

export const CARAVAN_UPGRADES: CaravanUpgrade[] = [
  // Capacity upgrades
  {
    id: 'extra_storage',
    name: 'Dodatkowy Magazyn',
    description: '+15 pojemności',
    icon: 'mdi-package-variant-plus',
    cost: 200,
    effect: { type: 'capacity', value: 15, isPercent: false },
    maxLevel: 10,
  },
  {
    id: 'efficient_packing',
    name: 'Efektywne Pakowanie',
    description: '+10% pojemności',
    icon: 'mdi-package-variant-closed-check',
    cost: 500,
    effect: { type: 'capacity', value: 10, isPercent: true },
    maxLevel: 5,
  },

  // Speed upgrades
  {
    id: 'better_wheels',
    name: 'Lepsze Koła',
    description: '+10% prędkości',
    icon: 'mdi-tire',
    cost: 300,
    effect: { type: 'speed', value: 10, isPercent: true },
    maxLevel: 5,
  },
  {
    id: 'trained_horses',
    name: 'Wyszkolone Konie',
    description: '+15% prędkości',
    icon: 'mdi-horse',
    cost: 600,
    effect: { type: 'speed', value: 15, isPercent: true },
    maxLevel: 3,
  },
  {
    id: 'magic_propulsion',
    name: 'Magiczny Napęd',
    description: '+25% prędkości',
    icon: 'mdi-lightning-bolt',
    cost: 2000,
    effect: { type: 'speed', value: 25, isPercent: true },
    maxLevel: 2,
  },

  // Protection upgrades
  {
    id: 'reinforced_walls',
    name: 'Wzmocnione Ściany',
    description: '+10 ochrony',
    icon: 'mdi-shield',
    cost: 400,
    effect: { type: 'protection', value: 10, isPercent: false },
    maxLevel: 5,
  },
  {
    id: 'guard_post',
    name: 'Stanowisko Strażnika',
    description: '+15% ochrony',
    icon: 'mdi-shield-account',
    cost: 800,
    effect: { type: 'protection', value: 15, isPercent: true },
    maxLevel: 3,
  },
  {
    id: 'arcane_ward',
    name: 'Arkanowa Bariera',
    description: '+30% ochrony',
    icon: 'mdi-shield-star',
    cost: 2500,
    effect: { type: 'protection', value: 30, isPercent: true },
    maxLevel: 2,
  },

  // Special upgrades
  {
    id: 'caravan_slot',
    name: 'Dodatkowy Slot Karawany',
    description: '+1 aktywna karawana',
    icon: 'mdi-plus-box-multiple',
    cost: 5000,
    effect: { type: 'slots', value: 1, isPercent: false },
    maxLevel: 3,
  },
];

// ============================================
// ROUTE EVENTS
// ============================================

export interface RouteEventDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'danger' | 'opportunity' | 'neutral';
  probability: number;
  outcomes: RouteEventOutcome[];
}

export interface RouteEventOutcome {
  id: string;
  description: string;
  probability: number;
  effects: {
    cargoLoss?: number; // % of cargo lost
    goldCost?: number;
    timeLoss?: number; // Extra ticks
    goldGain?: number;
    itemGain?: { itemId: string; amount: number };
    protection?: number; // Required protection to avoid
  };
}

export const ROUTE_EVENTS: RouteEventDefinition[] = [
  {
    id: 'bandit_attack',
    name: 'Atak Bandytów',
    description: 'Bandyci atakują karawanę!',
    icon: 'mdi-knife',
    type: 'danger',
    probability: 0.15,
    outcomes: [
      {
        id: 'repelled',
        description: 'Bandyci zostali odparci',
        probability: 0.4,
        effects: { protection: 15 },
      },
      {
        id: 'minor_loss',
        description: 'Stracono część ładunku',
        probability: 0.4,
        effects: { cargoLoss: 15, protection: 5 },
      },
      {
        id: 'major_loss',
        description: 'Bandyci zagrabili większość towaru',
        probability: 0.2,
        effects: { cargoLoss: 50 },
      },
    ],
  },
  {
    id: 'pirate_attack',
    name: 'Atak Piratów',
    description: 'Piraci zaatakowali na morzu!',
    icon: 'mdi-pirate',
    type: 'danger',
    probability: 0.1,
    outcomes: [
      {
        id: 'escaped',
        description: 'Udało się uciec',
        probability: 0.3,
        effects: { timeLoss: 300 },
      },
      {
        id: 'negotiated',
        description: 'Zapłacono okup',
        probability: 0.4,
        effects: { goldCost: 200 },
      },
      {
        id: 'plundered',
        description: 'Karawana została splądrowana',
        probability: 0.3,
        effects: { cargoLoss: 40, goldCost: 100 },
      },
    ],
  },
  {
    id: 'storm',
    name: 'Burza',
    description: 'Gwałtowna burza spowalnia podróż',
    icon: 'mdi-weather-lightning-rainy',
    type: 'neutral',
    probability: 0.2,
    outcomes: [
      {
        id: 'waited_out',
        description: 'Przeczekano burzę',
        probability: 0.6,
        effects: { timeLoss: 600 },
      },
      {
        id: 'damage',
        description: 'Część towaru została uszkodzona',
        probability: 0.4,
        effects: { cargoLoss: 10, timeLoss: 300 },
      },
    ],
  },
  {
    id: 'treasure_find',
    name: 'Znaleziony Skarb',
    description: 'Karawana natrafiła na porzucony skarb!',
    icon: 'mdi-treasure-chest',
    type: 'opportunity',
    probability: 0.05,
    outcomes: [
      {
        id: 'gold_find',
        description: 'Znaleziono złoto',
        probability: 0.7,
        effects: { goldGain: 300 },
      },
      {
        id: 'rare_find',
        description: 'Znaleziono rzadki przedmiot',
        probability: 0.3,
        effects: { itemGain: { itemId: 'rare_gem', amount: 1 } },
      },
    ],
  },
  {
    id: 'friendly_trader',
    name: 'Przyjazny Handlarz',
    description: 'Spotkano innego kupca',
    icon: 'mdi-account-tie',
    type: 'opportunity',
    probability: 0.1,
    outcomes: [
      {
        id: 'trade_tips',
        description: 'Otrzymano cenne informacje',
        probability: 0.6,
        effects: { goldGain: 50 },
      },
      {
        id: 'trade_deal',
        description: 'Dokonano korzystnej wymiany',
        probability: 0.4,
        effects: { goldGain: 150 },
      },
    ],
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getCity(id: CityId): CityDefinition | undefined {
  return CITIES.find(c => c.id === id);
}

export function getTradeRoute(id: string): TradeRoute | undefined {
  return TRADE_ROUTES.find(r => r.id === id);
}

export function getCaravanTemplate(id: string): CaravanTemplate | undefined {
  return CARAVAN_TEMPLATES.find(c => c.id === id);
}

export function getCaravanUpgrade(id: string): CaravanUpgrade | undefined {
  return CARAVAN_UPGRADES.find(u => u.id === id);
}

export function getRouteEvent(id: string): RouteEventDefinition | undefined {
  return ROUTE_EVENTS.find(e => e.id === id);
}

export function getAvailableRoutes(
  merchantLevel: number,
  reputation: string,
  completedRoutes: number
): TradeRoute[] {
  return TRADE_ROUTES.filter(route => {
    const req = route.requirements;
    if (req.merchantLevel > merchantLevel) return false;
    // Simplified reputation check
    const repOrder = ['neutral', 'friendly', 'respected', 'legendary'];
    if (repOrder.indexOf(req.reputation) > repOrder.indexOf(reputation)) return false;
    return true;
  });
}

export function calculateTravelTime(
  route: TradeRoute,
  caravanSpeed: number,
  upgrades: Map<string, number>
): number {
  let speedMultiplier = caravanSpeed;

  // Apply upgrade bonuses
  for (const [upgradeId, level] of upgrades) {
    const upgrade = getCaravanUpgrade(upgradeId);
    if (upgrade && upgrade.effect.type === 'speed') {
      if (upgrade.effect.isPercent) {
        speedMultiplier *= 1 + (upgrade.effect.value * level) / 100;
      }
    }
  }

  return Math.ceil(route.baseTravelTime / speedMultiplier);
}

export function calculateCaravanCapacity(
  template: CaravanTemplate,
  upgrades: Map<string, number>
): number {
  let capacity = template.baseCapacity;

  for (const [upgradeId, level] of upgrades) {
    const upgrade = getCaravanUpgrade(upgradeId);
    if (upgrade && upgrade.effect.type === 'capacity') {
      if (upgrade.effect.isPercent) {
        capacity *= 1 + (upgrade.effect.value * level) / 100;
      } else {
        capacity += upgrade.effect.value * level;
      }
    }
  }

  return Math.floor(capacity);
}

export function calculateRouteProfit(
  route: TradeRoute,
  cargoValue: number,
  template: CaravanTemplate,
  upgrades: Map<string, number>
): number {
  let profitMultiplier = route.baseProfit;

  // Apply template special ability
  if (template.specialAbility?.type === 'profit_boost') {
    profitMultiplier *= 1 + template.specialAbility.value / 100;
  }

  return Math.floor(cargoValue * profitMultiplier);
}
