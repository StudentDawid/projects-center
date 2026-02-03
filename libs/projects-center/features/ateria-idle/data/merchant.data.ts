/**
 * Merchant Data - Cities, Trade Routes, Decorations, Customers
 * Data-Driven Design for Ateria Idle
 */

import type {
  City,
  CityId,
  TradeRoute,
  ShopDecoration,
  CustomerSpawnConfig,
  CustomerType,
  DecorationSlot,
  CaravanUpgrade,
  ReputationTier,
} from '@projects-center/entities/ateria-idle/merchant';
import type { ItemRarity } from '@projects-center/entities/ateria-idle/warrior';

// ============================================
// CITIES
// ============================================

export const CITIES: Record<CityId, City> = {
  hometown: {
    id: 'hometown',
    name: 'Przystań Gildiowa',
    description: 'Twoje rodzinne miasto. Stabilne ceny, bezpieczne drogi.',
    icon: 'mdi-home-city',
    color: '#4CAF50',
    demandCategories: ['potion', 'food'],
    supplyCategories: ['material_common'],
    traits: ['trading_hub'],
  },
  riverside: {
    id: 'riverside',
    name: 'Rzeczne Skrzyżowanie',
    description: 'Portowe miasto na skrzyżowaniu rzek. Dobre na ryby i drewno.',
    icon: 'mdi-waves',
    color: '#2196F3',
    demandCategories: ['ore', 'weapon'],
    supplyCategories: ['food', 'material_wood'],
    traits: ['trading_hub', 'wealthy'],
  },
  mountain_pass: {
    id: 'mountain_pass',
    name: 'Przełęcz Górska',
    description: 'Trudno dostępna osada górników. Bogata w rudy.',
    icon: 'mdi-image-filter-hdr',
    color: '#795548',
    demandCategories: ['food', 'potion', 'tool'],
    supplyCategories: ['ore', 'gem', 'material_metal'],
    traits: ['poor', 'frontier'],
  },
  desert_oasis: {
    id: 'desert_oasis',
    name: 'Oaza Handlarzy',
    description: 'Egzotyczny bazar na pustyni. Rzadkie towary, wysokie ceny.',
    icon: 'mdi-palm-tree',
    color: '#FF9800',
    demandCategories: ['material_wood', 'food'],
    supplyCategories: ['gem', 'exotic', 'spice'],
    traits: ['wealthy', 'trading_hub'],
  },
  port_city: {
    id: 'port_city',
    name: 'Port Morski',
    description: 'Wielki port handlowy. Wszystko można kupić i sprzedać.',
    icon: 'mdi-sail-boat',
    color: '#00BCD4',
    demandCategories: ['material_metal', 'weapon'],
    supplyCategories: ['food', 'exotic', 'material_common'],
    traits: ['wealthy', 'trading_hub'],
  },
  capital: {
    id: 'capital',
    name: 'Stolica Królestwa',
    description: 'Centrum władzy. Luksusowe towary, wymagający klienci.',
    icon: 'mdi-castle',
    color: '#9C27B0',
    demandCategories: ['luxury', 'gem', 'rare_equipment'],
    supplyCategories: ['weapon', 'armor'],
    traits: ['wealthy', 'military'],
  },
  frontier: {
    id: 'frontier',
    name: 'Rubieże Dzikiej Krainy',
    description: 'Niebezpieczne tereny na granicy cywilizacji.',
    icon: 'mdi-sword-cross',
    color: '#F44336',
    demandCategories: ['weapon', 'armor', 'potion'],
    supplyCategories: ['monster_parts', 'rare_material'],
    traits: ['poor', 'military', 'frontier'],
  },
  mystic_vale: {
    id: 'mystic_vale',
    name: 'Mistyczna Dolina',
    description: 'Sekretna enklawa magów. Handel magicznymi przedmiotami.',
    icon: 'mdi-magic-staff',
    color: '#673AB7',
    demandCategories: ['monster_parts', 'gem'],
    supplyCategories: ['enchanted', 'potion', 'scroll'],
    traits: ['scholarly', 'magical'],
  },
};

// ============================================
// TRADE ROUTES
// ============================================

export const TRADE_ROUTES: TradeRoute[] = [
  // Tier 1 - Starting routes (Level 1-10)
  {
    id: 'hometown_riverside',
    name: 'Szlak Rzeczny',
    description: 'Bezpieczna trasa wzdłuż rzeki do portu rzecznego.',
    icon: 'mdi-ferry',
    fromCity: 'hometown',
    toCity: 'riverside',
    distance: 50,
    baseTravelTime: 600, // 1 minute
    requiredLevel: 1,
    requiredReputation: 0,
    baseRisk: 0.05,
    profitMultiplier: 1.15,
    terrainType: 'road',
  },
  {
    id: 'hometown_mountain',
    name: 'Szlak Górski',
    description: 'Kręta droga przez wzgórza do osady górników.',
    icon: 'mdi-hiking',
    fromCity: 'hometown',
    toCity: 'mountain_pass',
    distance: 80,
    baseTravelTime: 900, // 1.5 minutes
    requiredLevel: 5,
    requiredReputation: 10,
    baseRisk: 0.12,
    profitMultiplier: 1.25,
    terrainType: 'mountain',
  },

  // Tier 2 - Medium routes (Level 10-25)
  {
    id: 'riverside_port',
    name: 'Szlak Przybrzeżny',
    description: 'Droga wzdłuż wybrzeża do wielkiego portu.',
    icon: 'mdi-ship-wheel',
    fromCity: 'riverside',
    toCity: 'port_city',
    distance: 120,
    baseTravelTime: 1200, // 2 minutes
    requiredLevel: 10,
    requiredReputation: 20,
    baseRisk: 0.08,
    profitMultiplier: 1.3,
    terrainType: 'coastal',
  },
  {
    id: 'mountain_frontier',
    name: 'Szlak Pogranicza',
    description: 'Niebezpieczna droga przez dzikie tereny.',
    icon: 'mdi-sword',
    fromCity: 'mountain_pass',
    toCity: 'frontier',
    distance: 100,
    baseTravelTime: 1500, // 2.5 minutes
    requiredLevel: 15,
    requiredReputation: 25,
    baseRisk: 0.25,
    profitMultiplier: 1.5,
    terrainType: 'forest',
  },
  {
    id: 'hometown_desert',
    name: 'Szlak Pustynny',
    description: 'Długa podróż przez pustynię do egzotycznej oazy.',
    icon: 'mdi-weather-sunny',
    fromCity: 'hometown',
    toCity: 'desert_oasis',
    distance: 150,
    baseTravelTime: 1800, // 3 minutes
    requiredLevel: 12,
    requiredReputation: 30,
    baseRisk: 0.15,
    profitMultiplier: 1.4,
    terrainType: 'desert',
  },

  // Tier 3 - Advanced routes (Level 25-50)
  {
    id: 'port_capital',
    name: 'Szlak Królewski',
    description: 'Prestiżowa trasa do stolicy królestwa.',
    icon: 'mdi-crown',
    fromCity: 'port_city',
    toCity: 'capital',
    distance: 200,
    baseTravelTime: 2400, // 4 minutes
    requiredLevel: 25,
    requiredReputation: 50,
    baseRisk: 0.1,
    profitMultiplier: 1.6,
    terrainType: 'road',
  },
  {
    id: 'desert_mystic',
    name: 'Szlak Tajemnic',
    description: 'Sekretna ścieżka do ukrytej doliny magów.',
    icon: 'mdi-auto-fix',
    fromCity: 'desert_oasis',
    toCity: 'mystic_vale',
    distance: 180,
    baseTravelTime: 2100, // 3.5 minutes
    requiredLevel: 30,
    requiredReputation: 60,
    baseRisk: 0.2,
    profitMultiplier: 1.8,
    terrainType: 'desert',
  },
  {
    id: 'frontier_mystic',
    name: 'Szlak Łowców',
    description: 'Niebezpieczna trasa przez dzikie tereny do enklawy magów.',
    icon: 'mdi-compass',
    fromCity: 'frontier',
    toCity: 'mystic_vale',
    distance: 160,
    baseTravelTime: 2400, // 4 minutes
    requiredLevel: 35,
    requiredReputation: 70,
    baseRisk: 0.3,
    profitMultiplier: 2.0,
    terrainType: 'swamp',
  },

  // Tier 4 - Expert routes (Level 50+)
  {
    id: 'capital_mystic',
    name: 'Szlak Arkaniczny',
    description: 'Ekskluzywna trasa dla elitarnych kupców.',
    icon: 'mdi-star-circle',
    fromCity: 'capital',
    toCity: 'mystic_vale',
    distance: 250,
    baseTravelTime: 3000, // 5 minutes
    requiredLevel: 50,
    requiredReputation: 80,
    baseRisk: 0.15,
    profitMultiplier: 2.2,
    terrainType: 'road',
  },
  {
    id: 'grand_circuit',
    name: 'Wielki Okrąg',
    description: 'Legendarny szlak łączący wszystkie główne miasta.',
    icon: 'mdi-earth',
    fromCity: 'hometown',
    toCity: 'capital',
    distance: 400,
    baseTravelTime: 6000, // 10 minutes
    requiredLevel: 60,
    requiredReputation: 90,
    baseRisk: 0.2,
    profitMultiplier: 2.5,
    terrainType: 'road',
  },
];

// ============================================
// SHOP DECORATIONS
// ============================================

export const SHOP_DECORATIONS: ShopDecoration[] = [
  // Counter decorations
  {
    id: 'wooden_counter',
    name: 'Drewniana Lada',
    description: 'Prosta, solidna lada z drewna.',
    icon: 'mdi-table-furniture',
    slot: 'counter',
    rarity: 'common',
    cost: 100,
    bonuses: { customerPatience: 5 },
    purchased: false,
  },
  {
    id: 'oak_counter',
    name: 'Dębowa Lada',
    description: 'Elegancka lada z dębowego drewna.',
    icon: 'mdi-table-furniture',
    slot: 'counter',
    rarity: 'uncommon',
    cost: 500,
    bonuses: { customerPatience: 10, priceMultiplier: 0.02 },
    purchased: false,
  },
  {
    id: 'mahogany_counter',
    name: 'Mahoniowa Lada',
    description: 'Luksusowa lada z egzotycznego drewna. Imponuje klientów.',
    icon: 'mdi-table-furniture',
    slot: 'counter',
    rarity: 'rare',
    cost: 2000,
    bonuses: { customerPatience: 20, priceMultiplier: 0.05, wealthyCustomerChance: 5 },
    purchased: false,
  },
  {
    id: 'crystal_counter',
    name: 'Kryształowa Lada',
    description: 'Magiczna lada wykładana kryształami.',
    icon: 'mdi-diamond-stone',
    slot: 'counter',
    rarity: 'epic',
    cost: 10000,
    bonuses: { customerPatience: 30, priceMultiplier: 0.1, wealthyCustomerChance: 15, haggleSuccessBonus: 10 },
    purchased: false,
  },

  // Lighting decorations
  {
    id: 'candle_holder',
    name: 'Świecznik',
    description: 'Prosty świecznik oświetlający sklep.',
    icon: 'mdi-candle',
    slot: 'lighting',
    rarity: 'common',
    cost: 50,
    bonuses: { customerFrequency: 3 },
    purchased: false,
  },
  {
    id: 'oil_lamp',
    name: 'Lampa Oliwna',
    description: 'Lepsza widoczność przyciąga więcej klientów.',
    icon: 'mdi-lamp',
    slot: 'lighting',
    rarity: 'uncommon',
    cost: 300,
    bonuses: { customerFrequency: 8 },
    purchased: false,
  },
  {
    id: 'chandelier',
    name: 'Żyrandol',
    description: 'Elegancki żyrandol z wieloma świecami.',
    icon: 'mdi-chandelier',
    slot: 'lighting',
    rarity: 'rare',
    cost: 1500,
    bonuses: { customerFrequency: 15, wealthyCustomerChance: 10 },
    purchased: false,
  },
  {
    id: 'magic_chandelier',
    name: 'Magiczny Żyrandol',
    description: 'Świecący magicznym blaskiem żyrandol.',
    icon: 'mdi-creation',
    slot: 'lighting',
    rarity: 'epic',
    cost: 8000,
    bonuses: { customerFrequency: 25, wealthyCustomerChance: 20, priceMultiplier: 0.05 },
    purchased: false,
  },

  // Floor decorations
  {
    id: 'straw_floor',
    name: 'Słomiana Podłoga',
    description: 'Praktyczna, tania podłoga.',
    icon: 'mdi-grass',
    slot: 'floor',
    rarity: 'common',
    cost: 75,
    bonuses: { storageCapacity: 5 },
    purchased: false,
  },
  {
    id: 'wooden_floor',
    name: 'Drewniana Podłoga',
    description: 'Solidne deski podłogowe.',
    icon: 'mdi-texture-box',
    slot: 'floor',
    rarity: 'uncommon',
    cost: 400,
    bonuses: { storageCapacity: 10, customerPatience: 5 },
    purchased: false,
  },
  {
    id: 'carpet',
    name: 'Orientalny Dywan',
    description: 'Luksusowy dywan z dalekiego wschodu.',
    icon: 'mdi-rug',
    slot: 'floor',
    rarity: 'rare',
    cost: 2500,
    bonuses: { storageCapacity: 15, customerPatience: 10, wealthyCustomerChance: 8 },
    purchased: false,
  },

  // Wall decorations
  {
    id: 'basic_shelf',
    name: 'Prosta Półka',
    description: 'Dodatkowe miejsce na towary.',
    icon: 'mdi-bookshelf',
    slot: 'wall',
    rarity: 'common',
    cost: 100,
    bonuses: { storageCapacity: 10 },
    purchased: false,
  },
  {
    id: 'display_case',
    name: 'Gablota Wystawowa',
    description: 'Szklana gablota na cenne przedmioty.',
    icon: 'mdi-select-all',
    slot: 'wall',
    rarity: 'uncommon',
    cost: 600,
    bonuses: { storageCapacity: 5, priceMultiplier: 0.05 },
    purchased: false,
  },
  {
    id: 'trophy_wall',
    name: 'Ściana Trofeów',
    description: 'Ekspozycja trofeów buduje reputację.',
    icon: 'mdi-trophy',
    slot: 'wall',
    rarity: 'rare',
    cost: 3000,
    bonuses: { wealthyCustomerChance: 12, priceMultiplier: 0.08 },
    purchased: false,
  },

  // Entrance decorations
  {
    id: 'simple_sign',
    name: 'Prosty Szyld',
    description: 'Drewniany szyld z nazwą sklepu.',
    icon: 'mdi-sign-real-estate',
    slot: 'entrance',
    rarity: 'common',
    cost: 50,
    bonuses: { customerFrequency: 5 },
    purchased: false,
  },
  {
    id: 'carved_sign',
    name: 'Rzeźbiony Szyld',
    description: 'Ozdobny szyld przyciągający uwagę.',
    icon: 'mdi-sign-caution',
    slot: 'entrance',
    rarity: 'uncommon',
    cost: 350,
    bonuses: { customerFrequency: 12 },
    purchased: false,
  },
  {
    id: 'golden_sign',
    name: 'Złoty Szyld',
    description: 'Pozłacany szyld świadczący o prestiżu.',
    icon: 'mdi-certificate',
    slot: 'entrance',
    rarity: 'rare',
    cost: 2000,
    bonuses: { customerFrequency: 20, wealthyCustomerChance: 15 },
    purchased: false,
  },

  // Special decorations
  {
    id: 'lucky_cat',
    name: 'Szczęśliwy Kot',
    description: 'Figurka przyciągająca szczęście w interesach.',
    icon: 'mdi-cat',
    slot: 'special',
    rarity: 'rare',
    cost: 5000,
    bonuses: { haggleSuccessBonus: 15, priceMultiplier: 0.03 },
    purchased: false,
  },
  {
    id: 'guild_banner',
    name: 'Sztandar Gildii',
    description: 'Oficjalny sztandar Twojej gildii.',
    icon: 'mdi-flag-variant',
    slot: 'special',
    rarity: 'epic',
    cost: 15000,
    bonuses: { customerFrequency: 30, wealthyCustomerChance: 25, priceMultiplier: 0.1 },
    purchased: false,
  },
  {
    id: 'merchant_throne',
    name: 'Tron Kupca',
    description: 'Legendarny tron kupieckich królów.',
    icon: 'mdi-throne',
    slot: 'special',
    rarity: 'legendary',
    cost: 100000,
    bonuses: {
      customerFrequency: 50,
      wealthyCustomerChance: 40,
      priceMultiplier: 0.15,
      haggleSuccessBonus: 25,
      customerPatience: 50,
    },
    purchased: false,
  },
];

// ============================================
// CUSTOMER CONFIGS
// ============================================

export const CUSTOMER_CONFIGS: CustomerSpawnConfig[] = [
  {
    type: 'peasant',
    weight: 40,
    minReputation: 0,
    budgetRange: { min: 10, max: 100 },
    patienceRange: { min: 100, max: 200 },
  },
  {
    type: 'traveler',
    weight: 30,
    minReputation: 0,
    budgetRange: { min: 50, max: 300 },
    patienceRange: { min: 150, max: 250 },
  },
  {
    type: 'merchant',
    weight: 15,
    minReputation: 20,
    budgetRange: { min: 200, max: 1000 },
    patienceRange: { min: 200, max: 350 },
  },
  {
    type: 'noble',
    weight: 10,
    minReputation: 40,
    budgetRange: { min: 500, max: 5000 },
    patienceRange: { min: 100, max: 200 },
  },
  {
    type: 'collector',
    weight: 4,
    minReputation: 60,
    budgetRange: { min: 1000, max: 20000 },
    patienceRange: { min: 300, max: 500 },
  },
  {
    type: 'whale',
    weight: 1,
    minReputation: 80,
    budgetRange: { min: 10000, max: 100000 },
    patienceRange: { min: 400, max: 600 },
  },
];

export const CUSTOMER_NAMES: Record<CustomerType, string[]> = {
  peasant: ['Jan', 'Piotr', 'Marta', 'Anna', 'Wojciech', 'Zofia', 'Tomasz', 'Katarzyna'],
  traveler: ['Wędrowiec', 'Pielgrzym', 'Odkrywca', 'Kartograf', 'Bard', 'Posłaniec'],
  merchant: ['Kupiec Zygmunt', 'Handlarz Karol', 'Trader Erik', 'Bankier Henryk'],
  noble: ['Lord Władysław', 'Lady Elżbieta', 'Baron Kazimierz', 'Hrabina Jadwiga'],
  collector: ['Kolekcjoner Artefaktów', 'Magnat Sztuki', 'Zbieracz Rzadkości'],
  whale: ['Król Kupców', 'Cesarz Handlu', 'Wielki Magister Gildii'],
};

export const CUSTOMER_ICONS: Record<CustomerType, string> = {
  peasant: 'mdi-account',
  traveler: 'mdi-hiking',
  merchant: 'mdi-briefcase',
  noble: 'mdi-crown',
  collector: 'mdi-magnify',
  whale: 'mdi-star-face',
};

export const CUSTOMER_COLORS: Record<CustomerType, string> = {
  peasant: '#9E9E9E',
  traveler: '#4CAF50',
  merchant: '#2196F3',
  noble: '#9C27B0',
  collector: '#FF9800',
  whale: '#F44336',
};

// ============================================
// CARAVAN UPGRADES
// ============================================

export const CARAVAN_UPGRADES: CaravanUpgrade[] = [
  {
    id: 'larger_wagon',
    name: 'Większy Wóz',
    description: 'Zwiększa pojemność karawany.',
    icon: 'mdi-truck',
    cost: 500,
    effect: { type: 'capacity', value: 20, isPercent: true },
    maxLevel: 5,
  },
  {
    id: 'better_wheels',
    name: 'Lepsze Koła',
    description: 'Przyspiesza podróż.',
    icon: 'mdi-tire',
    cost: 400,
    effect: { type: 'speed', value: 10, isPercent: true },
    maxLevel: 5,
  },
  {
    id: 'armed_guards',
    name: 'Uzbrojona Straż',
    description: 'Lepiej chroni przed napadami.',
    icon: 'mdi-shield-account',
    cost: 750,
    effect: { type: 'protection', value: 15, isPercent: true },
    maxLevel: 5,
  },
  {
    id: 'extra_carts',
    name: 'Dodatkowe Wozy',
    description: 'Więcej miejsca na towary.',
    icon: 'mdi-cart-plus',
    cost: 1000,
    effect: { type: 'capacity', value: 50, isPercent: false },
    maxLevel: 3,
  },
];

// ============================================
// REPUTATION TIERS
// ============================================

export const REPUTATION_THRESHOLDS: Record<ReputationTier, number> = {
  unknown: 0,
  known: 10,
  trusted: 25,
  respected: 50,
  renowned: 75,
  legendary: 95,
};

export const REPUTATION_NAMES: Record<ReputationTier, string> = {
  unknown: 'Nieznany',
  known: 'Rozpoznawalny',
  trusted: 'Zaufany',
  respected: 'Szanowany',
  renowned: 'Sławny',
  legendary: 'Legendarny',
};

export const REPUTATION_COLORS: Record<ReputationTier, string> = {
  unknown: '#9E9E9E',
  known: '#4CAF50',
  trusted: '#2196F3',
  respected: '#9C27B0',
  renowned: '#FF9800',
  legendary: '#F44336',
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getCity(id: CityId): City | undefined {
  return CITIES[id];
}

export function getTradeRoute(id: string): TradeRoute | undefined {
  return TRADE_ROUTES.find(r => r.id === id);
}

export function getUnlockedRoutes(level: number, reputation: number): TradeRoute[] {
  return TRADE_ROUTES.filter(
    r => r.requiredLevel <= level && r.requiredReputation <= reputation
  );
}

export function getDecoration(id: string): ShopDecoration | undefined {
  return SHOP_DECORATIONS.find(d => d.id === id);
}

export function getDecorationsBySlot(slot: DecorationSlot): ShopDecoration[] {
  return SHOP_DECORATIONS.filter(d => d.slot === slot);
}

export function getReputationTier(reputation: number): ReputationTier {
  if (reputation >= REPUTATION_THRESHOLDS.legendary) return 'legendary';
  if (reputation >= REPUTATION_THRESHOLDS.renowned) return 'renowned';
  if (reputation >= REPUTATION_THRESHOLDS.respected) return 'respected';
  if (reputation >= REPUTATION_THRESHOLDS.trusted) return 'trusted';
  if (reputation >= REPUTATION_THRESHOLDS.known) return 'known';
  return 'unknown';
}

export function getCustomerConfig(type: CustomerType): CustomerSpawnConfig | undefined {
  return CUSTOMER_CONFIGS.find(c => c.type === type);
}

export function getAvailableCustomerTypes(reputation: number): CustomerSpawnConfig[] {
  return CUSTOMER_CONFIGS.filter(c => c.minReputation <= reputation);
}

export function getRandomCustomerName(type: CustomerType): string {
  const names = CUSTOMER_NAMES[type];
  return names[Math.floor(Math.random() * names.length)];
}
