/**
 * Township Data - Settlement Buildings, Population, Resources
 */

export type BuildingCategory = 'production' | 'military' | 'economic' | 'magical' | 'social' | 'wonder';
export type BuildingRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface BuildingRequirement {
  type: 'level' | 'building' | 'gold' | 'material' | 'reputation';
  path?: string;
  buildingId?: string;
  materialId?: string;
  factionId?: string;
  value: number;
}

export interface BuildingEffect {
  type: 'bonus' | 'production' | 'unlock' | 'population' | 'happiness' | 'defense';
  target?: string;
  stat?: string;
  value: number;
  description: string;
}

export interface TownshipBuilding {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: BuildingCategory;
  rarity: BuildingRarity;
  tier: number;
  maxLevel: number;
  baseCost: number;
  costMultiplier: number;
  buildTime: number;
  requirements: BuildingRequirement[];
  effects: BuildingEffect[];
  upgradeEffects: BuildingEffect[];
}

export interface TownshipEvent {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'positive' | 'negative' | 'neutral';
  duration: number;
  effects: { stat: string; value: number }[];
  chance: number;
}

export interface TownshipProgress {
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXp: number;
}

export const TOWNSHIP_BUILDINGS: Record<string, TownshipBuilding> = {
  // Production Buildings
  sawmill: {
    id: 'sawmill', name: 'Tartak', description: 'Produkuje drewno dla osady.',
    icon: 'mdi-saw-blade', category: 'production', rarity: 'common', tier: 1, maxLevel: 10,
    baseCost: 100, costMultiplier: 1.5, buildTime: 60,
    requirements: [],
    effects: [
      { type: 'production', target: 'wood', value: 5, description: '+5 drewna/min' },
      { type: 'population', value: 2, description: '+2 miejsca pracy' },
    ],
    upgradeEffects: [{ type: 'production', target: 'wood', value: 2, description: '+2 drewna/min za poziom' }],
  },
  quarry: {
    id: 'quarry', name: 'Kamieniołom', description: 'Wydobywa kamień.',
    icon: 'mdi-pickaxe', category: 'production', rarity: 'common', tier: 1, maxLevel: 10,
    baseCost: 150, costMultiplier: 1.5, buildTime: 80,
    requirements: [{ type: 'building', buildingId: 'sawmill', value: 1 }],
    effects: [
      { type: 'production', target: 'stone', value: 4, description: '+4 kamienia/min' },
      { type: 'population', value: 3, description: '+3 miejsca pracy' },
    ],
    upgradeEffects: [{ type: 'production', target: 'stone', value: 2, description: '+2 kamienia/min za poziom' }],
  },
  mine: {
    id: 'mine', name: 'Kopalnia', description: 'Wydobywa rudy metali.',
    icon: 'mdi-gold', category: 'production', rarity: 'uncommon', tier: 2, maxLevel: 10,
    baseCost: 500, costMultiplier: 1.6, buildTime: 150,
    requirements: [{ type: 'building', buildingId: 'quarry', value: 3 }, { type: 'level', path: 'gathering', value: 10 }],
    effects: [
      { type: 'production', target: 'ore', value: 3, description: '+3 rudy/min' },
      { type: 'bonus', target: 'gathering', stat: 'mining_speed', value: 10, description: '+10% szybkość górnictwa' },
    ],
    upgradeEffects: [{ type: 'production', target: 'ore', value: 1, description: '+1 rudy/min za poziom' }],
  },
  farm: {
    id: 'farm', name: 'Farma', description: 'Produkuje żywność.',
    icon: 'mdi-barn', category: 'production', rarity: 'common', tier: 1, maxLevel: 10,
    baseCost: 200, costMultiplier: 1.4, buildTime: 100,
    requirements: [],
    effects: [
      { type: 'production', target: 'food', value: 8, description: '+8 jedzenia/min' },
      { type: 'happiness', value: 5, description: '+5 szczęścia' },
    ],
    upgradeEffects: [{ type: 'production', target: 'food', value: 3, description: '+3 jedzenia/min za poziom' }],
  },

  // Military Buildings
  barracks: {
    id: 'barracks', name: 'Koszary', description: 'Zwiększa siłę wojowników.',
    icon: 'mdi-shield-sword', category: 'military', rarity: 'common', tier: 1, maxLevel: 10,
    baseCost: 300, costMultiplier: 1.5, buildTime: 120,
    requirements: [{ type: 'level', path: 'warrior', value: 5 }],
    effects: [
      { type: 'bonus', target: 'warrior', stat: 'attack', value: 5, description: '+5% obrażeń wojownika' },
      { type: 'defense', value: 10, description: '+10 obrony osady' },
    ],
    upgradeEffects: [{ type: 'bonus', target: 'warrior', stat: 'attack', value: 2, description: '+2% obrażeń za poziom' }],
  },
  training_grounds: {
    id: 'training_grounds', name: 'Plac Ćwiczeń', description: 'Szybsze zdobywanie XP bojowego.',
    icon: 'mdi-sword-cross', category: 'military', rarity: 'uncommon', tier: 2, maxLevel: 8,
    baseCost: 800, costMultiplier: 1.6, buildTime: 200,
    requirements: [{ type: 'building', buildingId: 'barracks', value: 3 }],
    effects: [
      { type: 'bonus', target: 'warrior', stat: 'xp', value: 15, description: '+15% XP wojownika' },
      { type: 'bonus', target: 'warrior', stat: 'hp', value: 10, description: '+10% HP wojownika' },
    ],
    upgradeEffects: [{ type: 'bonus', target: 'warrior', stat: 'xp', value: 5, description: '+5% XP za poziom' }],
  },
  fortress: {
    id: 'fortress', name: 'Forteca', description: 'Potężne umocnienia obronne.',
    icon: 'mdi-castle', category: 'military', rarity: 'rare', tier: 3, maxLevel: 5,
    baseCost: 5000, costMultiplier: 2.0, buildTime: 600,
    requirements: [{ type: 'building', buildingId: 'training_grounds', value: 5 }, { type: 'level', path: 'warrior', value: 25 }],
    effects: [
      { type: 'defense', value: 100, description: '+100 obrony osady' },
      { type: 'bonus', target: 'warrior', stat: 'defense', value: 20, description: '+20% obrony wojownika' },
    ],
    upgradeEffects: [{ type: 'defense', value: 50, description: '+50 obrony za poziom' }],
  },

  // Economic Buildings
  marketplace: {
    id: 'marketplace', name: 'Targowisko', description: 'Zwiększa zyski ze sprzedaży.',
    icon: 'mdi-store', category: 'economic', rarity: 'common', tier: 1, maxLevel: 10,
    baseCost: 250, costMultiplier: 1.5, buildTime: 100,
    requirements: [{ type: 'level', path: 'merchant', value: 5 }],
    effects: [
      { type: 'bonus', target: 'merchant', stat: 'profit', value: 10, description: '+10% zysków kupca' },
      { type: 'happiness', value: 10, description: '+10 szczęścia' },
    ],
    upgradeEffects: [{ type: 'bonus', target: 'merchant', stat: 'profit', value: 3, description: '+3% zysków za poziom' }],
  },
  bank: {
    id: 'bank', name: 'Bank', description: 'Pasywnie generuje złoto.',
    icon: 'mdi-bank', category: 'economic', rarity: 'uncommon', tier: 2, maxLevel: 10,
    baseCost: 2000, costMultiplier: 1.8, buildTime: 300,
    requirements: [{ type: 'building', buildingId: 'marketplace', value: 5 }, { type: 'level', path: 'merchant', value: 15 }],
    effects: [
      { type: 'production', target: 'gold', value: 10, description: '+10 złota/min' },
      { type: 'bonus', target: 'all', stat: 'gold_find', value: 5, description: '+5% złota ze wszystkich źródeł' },
    ],
    upgradeEffects: [{ type: 'production', target: 'gold', value: 5, description: '+5 złota/min za poziom' }],
  },
  warehouse: {
    id: 'warehouse', name: 'Magazyn', description: 'Zwiększa pojemność zasobów.',
    icon: 'mdi-warehouse', category: 'economic', rarity: 'common', tier: 1, maxLevel: 15,
    baseCost: 150, costMultiplier: 1.3, buildTime: 80,
    requirements: [],
    effects: [
      { type: 'bonus', target: 'all', stat: 'storage', value: 100, description: '+100 pojemności' },
    ],
    upgradeEffects: [{ type: 'bonus', target: 'all', stat: 'storage', value: 50, description: '+50 pojemności za poziom' }],
  },
  stables: {
    id: 'stables', name: 'Stajnie', description: 'Szybsze karawany kupieckie.',
    icon: 'mdi-horse', category: 'economic', rarity: 'uncommon', tier: 2, maxLevel: 8,
    baseCost: 600, costMultiplier: 1.5, buildTime: 180,
    requirements: [{ type: 'building', buildingId: 'marketplace', value: 3 }, { type: 'level', path: 'merchant', value: 10 }],
    effects: [
      { type: 'bonus', target: 'merchant', stat: 'caravan_speed', value: 20, description: '+20% szybkość karawan' },
      { type: 'bonus', target: 'tamer', stat: 'taming', value: 10, description: '+10% oswajanie' },
    ],
    upgradeEffects: [{ type: 'bonus', target: 'merchant', stat: 'caravan_speed', value: 5, description: '+5% szybkości za poziom' }],
  },

  // Magical Buildings
  mage_tower: {
    id: 'mage_tower', name: 'Wieża Maga', description: 'Zwiększa moc magiczną.',
    icon: 'mdi-wizard-hat', category: 'magical', rarity: 'uncommon', tier: 2, maxLevel: 10,
    baseCost: 1000, costMultiplier: 1.7, buildTime: 250,
    requirements: [{ type: 'level', path: 'wizard', value: 10 }],
    effects: [
      { type: 'bonus', target: 'wizard', stat: 'spell_power', value: 15, description: '+15% mocy zaklęć' },
      { type: 'bonus', target: 'wizard', stat: 'mana_regen', value: 20, description: '+20% regeneracji many' },
    ],
    upgradeEffects: [{ type: 'bonus', target: 'wizard', stat: 'spell_power', value: 5, description: '+5% mocy za poziom' }],
  },
  library: {
    id: 'library', name: 'Biblioteka', description: 'Bonus XP dla wszystkich ścieżek.',
    icon: 'mdi-library', category: 'magical', rarity: 'rare', tier: 2, maxLevel: 10,
    baseCost: 1500, costMultiplier: 1.6, buildTime: 300,
    requirements: [{ type: 'level', path: 'scientist', value: 10 }],
    effects: [
      { type: 'bonus', target: 'all', stat: 'xp', value: 10, description: '+10% XP wszystkich ścieżek' },
      { type: 'bonus', target: 'scientist', stat: 'research', value: 15, description: '+15% szybkość badań' },
    ],
    upgradeEffects: [{ type: 'bonus', target: 'all', stat: 'xp', value: 3, description: '+3% XP za poziom' }],
  },
  observatory: {
    id: 'observatory', name: 'Obserwatorium', description: 'Wzmacnia przepowiednie mistyka.',
    icon: 'mdi-telescope', category: 'magical', rarity: 'rare', tier: 3, maxLevel: 5,
    baseCost: 3000, costMultiplier: 1.8, buildTime: 400,
    requirements: [{ type: 'building', buildingId: 'mage_tower', value: 5 }, { type: 'level', path: 'mystic', value: 15 }],
    effects: [
      { type: 'bonus', target: 'mystic', stat: 'prophecy', value: 25, description: '+25% moc przepowiedni' },
      { type: 'bonus', target: 'mystic', stat: 'meditation', value: 20, description: '+20% medytacja' },
    ],
    upgradeEffects: [{ type: 'bonus', target: 'mystic', stat: 'prophecy', value: 10, description: '+10% przepowiedni za poziom' }],
  },
  temple: {
    id: 'temple', name: 'Świątynia', description: 'Wzmacnia modlitwy kapłana.',
    icon: 'mdi-church', category: 'magical', rarity: 'uncommon', tier: 2, maxLevel: 10,
    baseCost: 800, costMultiplier: 1.5, buildTime: 200,
    requirements: [{ type: 'level', path: 'priest', value: 8 }],
    effects: [
      { type: 'bonus', target: 'priest', stat: 'faith', value: 20, description: '+20% wiary' },
      { type: 'bonus', target: 'priest', stat: 'prayer_power', value: 15, description: '+15% moc modlitw' },
      { type: 'happiness', value: 15, description: '+15 szczęścia' },
    ],
    upgradeEffects: [{ type: 'bonus', target: 'priest', stat: 'faith', value: 5, description: '+5% wiary za poziom' }],
  },
  alchemy_lab: {
    id: 'alchemy_lab', name: 'Laboratorium Alchemiczne', description: 'Wzmacnia warzenie.',
    icon: 'mdi-flask-round-bottom', category: 'magical', rarity: 'uncommon', tier: 2, maxLevel: 10,
    baseCost: 1200, costMultiplier: 1.6, buildTime: 250,
    requirements: [{ type: 'level', path: 'alchemist', value: 10 }, { type: 'level', path: 'scientist', value: 8 }],
    effects: [
      { type: 'bonus', target: 'alchemist', stat: 'brew_speed', value: 20, description: '+20% szybkość warzenia' },
      { type: 'bonus', target: 'alchemist', stat: 'potion_power', value: 15, description: '+15% moc eliksirów' },
    ],
    upgradeEffects: [{ type: 'bonus', target: 'alchemist', stat: 'brew_speed', value: 5, description: '+5% szybkości za poziom' }],
  },

  // Social Buildings
  tavern: {
    id: 'tavern', name: 'Tawerna', description: 'Miejsce spotkań, szczęście mieszkańców.',
    icon: 'mdi-glass-mug-variant', category: 'social', rarity: 'common', tier: 1, maxLevel: 10,
    baseCost: 200, costMultiplier: 1.4, buildTime: 100,
    requirements: [],
    effects: [
      { type: 'happiness', value: 20, description: '+20 szczęścia' },
      { type: 'bonus', target: 'bard', stat: 'tips', value: 15, description: '+15% napiwków barda' },
      { type: 'population', value: 5, description: '+5 mieszkańców' },
    ],
    upgradeEffects: [{ type: 'happiness', value: 5, description: '+5 szczęścia za poziom' }],
  },
  embassy: {
    id: 'embassy', name: 'Ambasada', description: 'Wzmacnia dyplomację.',
    icon: 'mdi-flag', category: 'social', rarity: 'rare', tier: 2, maxLevel: 7,
    baseCost: 2000, costMultiplier: 1.7, buildTime: 350,
    requirements: [{ type: 'level', path: 'diplomat', value: 12 }],
    effects: [
      { type: 'bonus', target: 'diplomat', stat: 'reputation', value: 20, description: '+20% zdobywanie reputacji' },
      { type: 'bonus', target: 'diplomat', stat: 'influence', value: 15, description: '+15% wpływy' },
    ],
    upgradeEffects: [{ type: 'bonus', target: 'diplomat', stat: 'reputation', value: 5, description: '+5% reputacji za poziom' }],
  },
  guild_hall: {
    id: 'guild_hall', name: 'Hala Gildii', description: 'Centrum zarządzania osadą.',
    icon: 'mdi-home-city', category: 'social', rarity: 'uncommon', tier: 1, maxLevel: 10,
    baseCost: 500, costMultiplier: 1.5, buildTime: 150,
    requirements: [{ type: 'gold', value: 500 }],
    effects: [
      { type: 'population', value: 10, description: '+10 mieszkańców' },
      { type: 'bonus', target: 'all', stat: 'efficiency', value: 5, description: '+5% efektywność wszystkiego' },
    ],
    upgradeEffects: [{ type: 'population', value: 5, description: '+5 mieszkańców za poziom' }],
  },
  hospital: {
    id: 'hospital', name: 'Szpital', description: 'Leczy i zwiększa zdrowie.',
    icon: 'mdi-hospital-building', category: 'social', rarity: 'uncommon', tier: 2, maxLevel: 8,
    baseCost: 1000, costMultiplier: 1.5, buildTime: 200,
    requirements: [{ type: 'building', buildingId: 'guild_hall', value: 3 }],
    effects: [
      { type: 'bonus', target: 'warrior', stat: 'hp_regen', value: 25, description: '+25% regeneracja HP' },
      { type: 'happiness', value: 15, description: '+15 szczęścia' },
    ],
    upgradeEffects: [{ type: 'bonus', target: 'warrior', stat: 'hp_regen', value: 5, description: '+5% regen za poziom' }],
  },
  theater: {
    id: 'theater', name: 'Teatr', description: 'Miejsce występów barda.',
    icon: 'mdi-drama-masks', category: 'social', rarity: 'rare', tier: 2, maxLevel: 5,
    baseCost: 2500, costMultiplier: 1.8, buildTime: 350,
    requirements: [{ type: 'building', buildingId: 'tavern', value: 5 }, { type: 'level', path: 'bard', value: 12 }],
    effects: [
      { type: 'bonus', target: 'bard', stat: 'performance', value: 30, description: '+30% jakość występów' },
      { type: 'bonus', target: 'bard', stat: 'fame', value: 20, description: '+20% sława' },
      { type: 'happiness', value: 25, description: '+25 szczęścia' },
    ],
    upgradeEffects: [{ type: 'bonus', target: 'bard', stat: 'performance', value: 10, description: '+10% jakości za poziom' }],
  },

  // Wonder Buildings
  great_forge: {
    id: 'great_forge', name: 'Wielka Kuźnia', description: 'Legendarna kuźnia mistrzów.',
    icon: 'mdi-anvil', category: 'wonder', rarity: 'legendary', tier: 4, maxLevel: 3,
    baseCost: 25000, costMultiplier: 3.0, buildTime: 1800,
    requirements: [
      { type: 'building', buildingId: 'barracks', value: 10 },
      { type: 'level', path: 'crafting', value: 30 },
      { type: 'level', path: 'warrior', value: 30 },
    ],
    effects: [
      { type: 'bonus', target: 'crafting', stat: 'quality', value: 50, description: '+50% jakość craftingu' },
      { type: 'bonus', target: 'warrior', stat: 'attack', value: 25, description: '+25% obrażeń' },
      { type: 'unlock', target: 'legendary_recipes', value: 1, description: 'Odblokowanie legendarnych receptur' },
    ],
    upgradeEffects: [{ type: 'bonus', target: 'crafting', stat: 'quality', value: 25, description: '+25% jakości za poziom' }],
  },
  arcane_academy: {
    id: 'arcane_academy', name: 'Akademia Tajemnej Sztuki', description: 'Centrum wiedzy magicznej.',
    icon: 'mdi-auto-fix', category: 'wonder', rarity: 'legendary', tier: 4, maxLevel: 3,
    baseCost: 30000, costMultiplier: 3.0, buildTime: 2000,
    requirements: [
      { type: 'building', buildingId: 'mage_tower', value: 10 },
      { type: 'building', buildingId: 'library', value: 10 },
      { type: 'level', path: 'wizard', value: 30 },
    ],
    effects: [
      { type: 'bonus', target: 'wizard', stat: 'spell_power', value: 50, description: '+50% moc zaklęć' },
      { type: 'bonus', target: 'all', stat: 'xp', value: 25, description: '+25% XP wszystkich ścieżek' },
      { type: 'unlock', target: 'arcane_spells', value: 1, description: 'Odblokowanie zaklęć arkanych' },
    ],
    upgradeEffects: [{ type: 'bonus', target: 'wizard', stat: 'spell_power', value: 25, description: '+25% mocy za poziom' }],
  },
  world_tree: {
    id: 'world_tree', name: 'Drzewo Świata', description: 'Mityczne drzewo łączące wszystko.',
    icon: 'mdi-tree', category: 'wonder', rarity: 'legendary', tier: 5, maxLevel: 1,
    baseCost: 100000, costMultiplier: 1.0, buildTime: 3600,
    requirements: [
      { type: 'building', buildingId: 'great_forge', value: 3 },
      { type: 'building', buildingId: 'arcane_academy', value: 3 },
      { type: 'level', path: 'druid', value: 35 },
    ],
    effects: [
      { type: 'bonus', target: 'all', stat: 'all', value: 20, description: '+20% wszystkie statystyki' },
      { type: 'production', target: 'all', value: 50, description: '+50% produkcja zasobów' },
      { type: 'happiness', value: 100, description: '+100 szczęścia' },
      { type: 'population', value: 50, description: '+50 mieszkańców' },
    ],
    upgradeEffects: [],
  },
};

export const TOWNSHIP_EVENTS: Record<string, TownshipEvent> = {
  festival: { id: 'festival', name: 'Festiwal', description: 'Mieszkańcy świętują!', icon: 'mdi-party-popper', type: 'positive', duration: 600, effects: [{ stat: 'happiness', value: 30 }, { stat: 'gold', value: 20 }], chance: 0.05 },
  merchant_caravan: { id: 'merchant_caravan', name: 'Karawana Kupiecka', description: 'Przybyła bogata karawana.', icon: 'mdi-cart', type: 'positive', duration: 300, effects: [{ stat: 'gold', value: 50 }], chance: 0.08 },
  plague: { id: 'plague', name: 'Zaraza', description: 'Choroba nawiedziła osadę.', icon: 'mdi-biohazard', type: 'negative', duration: 400, effects: [{ stat: 'happiness', value: -30 }, { stat: 'population', value: -10 }], chance: 0.03 },
  bandit_raid: { id: 'bandit_raid', name: 'Najazd Bandytów', description: 'Bandyci atakują!', icon: 'mdi-sword', type: 'negative', duration: 200, effects: [{ stat: 'gold', value: -30 }, { stat: 'defense', value: -20 }], chance: 0.04 },
  bountiful_harvest: { id: 'bountiful_harvest', name: 'Obfite Żniwa', description: 'Wyjątkowo udane zbiory.', icon: 'mdi-corn', type: 'positive', duration: 500, effects: [{ stat: 'food', value: 100 }], chance: 0.06 },
  wandering_mage: { id: 'wandering_mage', name: 'Wędrowny Mag', description: 'Mag oferuje nauki.', icon: 'mdi-wizard-hat', type: 'positive', duration: 300, effects: [{ stat: 'xp', value: 25 }], chance: 0.04 },
};

export const CATEGORY_DATA: Record<BuildingCategory, { name: string; icon: string; color: string }> = {
  production: { name: 'Produkcja', icon: 'mdi-factory', color: '#8D6E63' },
  military: { name: 'Wojskowe', icon: 'mdi-shield-sword', color: '#F44336' },
  economic: { name: 'Ekonomiczne', icon: 'mdi-cash', color: '#FFC107' },
  magical: { name: 'Magiczne', icon: 'mdi-auto-fix', color: '#9C27B0' },
  social: { name: 'Społeczne', icon: 'mdi-account-group', color: '#2196F3' },
  wonder: { name: 'Cuda', icon: 'mdi-star', color: '#FF9800' },
};

export const RARITY_DATA: Record<BuildingRarity, { label: string; color: string }> = {
  common: { label: 'Pospolity', color: '#9E9E9E' },
  uncommon: { label: 'Niepospolity', color: '#4CAF50' },
  rare: { label: 'Rzadki', color: '#2196F3' },
  epic: { label: 'Epicki', color: '#9C27B0' },
  legendary: { label: 'Legendarny', color: '#FF9800' },
};

export function getBuilding(id: string): TownshipBuilding | undefined { return TOWNSHIP_BUILDINGS[id]; }
export function getBuildingsByCategory(category: BuildingCategory): TownshipBuilding[] {
  return Object.values(TOWNSHIP_BUILDINGS).filter(b => b.category === category);
}
export function calculateBuildingCost(building: TownshipBuilding, currentLevel: number): number {
  return Math.floor(building.baseCost * Math.pow(building.costMultiplier, currentLevel));
}
export function calculateTownshipXpToLevel(level: number): number {
  return Math.floor(200 * Math.pow(1.2, level - 1));
}
