/**
 * Architect Path Data - Buildings, Blueprints, City Development
 */

export type BuildingCategory = 'residential' | 'production' | 'military' | 'magical' | 'monument';
export type BuildingRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface Building {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: BuildingCategory;
  rarity: BuildingRarity;
  tier: number;
  requiredLevel: number;
  buildTime: number;
  materials: { materialId: string; amount: number }[];
  goldCost: number;
  effects: BuildingEffect[];
  xpReward: number;
  maxCount: number;
}

export interface BuildingEffect {
  type: 'gold_income' | 'xp_bonus' | 'production' | 'defense' | 'storage' | 'population' | 'happiness' | 'special';
  value: number;
  description: string;
}

export interface BuildingMaterial {
  id: string;
  name: string;
  icon: string;
  tier: number;
  basePrice: number;
  sources: string[];
}

export interface Blueprint {
  id: string;
  name: string;
  description: string;
  buildingId: string;
  researchCost: number;
  requiredLevel: number;
}

export interface ArchitectProgress {
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXp: number;
}

export const BUILDING_MATERIALS: Record<string, BuildingMaterial> = {
  wood: { id: 'wood', name: 'Drewno', icon: 'mdi-tree', tier: 1, basePrice: 5, sources: ['gathering'] },
  stone: { id: 'stone', name: 'Kamień', icon: 'mdi-cube', tier: 1, basePrice: 8, sources: ['gathering'] },
  iron: { id: 'iron', name: 'Żelazo', icon: 'mdi-cube-outline', tier: 2, basePrice: 15, sources: ['crafting'] },
  marble: { id: 'marble', name: 'Marmur', icon: 'mdi-cube', tier: 2, basePrice: 25, sources: ['explorer'] },
  gold_bars: { id: 'gold_bars', name: 'Sztabki Złota', icon: 'mdi-gold', tier: 3, basePrice: 100, sources: ['crafting'] },
  mithril: { id: 'mithril', name: 'Mithril', icon: 'mdi-diamond', tier: 4, basePrice: 200, sources: ['crafting', 'explorer'] },
  dragon_stone: { id: 'dragon_stone', name: 'Smocza Skała', icon: 'mdi-fire', tier: 5, basePrice: 500, sources: ['warrior'] },
};

export const BUILDINGS: Record<string, Building> = {
  cottage: { id: 'cottage', name: 'Chata', description: 'Podstawowe mieszkanie.', icon: 'mdi-home', category: 'residential', rarity: 'common', tier: 1, requiredLevel: 1, buildTime: 100, materials: [{ materialId: 'wood', amount: 10 }], goldCost: 50, effects: [{ type: 'population', value: 2, description: '+2 populacja' }], xpReward: 20, maxCount: 10 },
  house: { id: 'house', name: 'Dom', description: 'Wygodny dom.', icon: 'mdi-home-city', category: 'residential', rarity: 'uncommon', tier: 2, requiredLevel: 8, buildTime: 200, materials: [{ materialId: 'wood', amount: 20 }, { materialId: 'stone', amount: 10 }], goldCost: 150, effects: [{ type: 'population', value: 5, description: '+5 populacja' }, { type: 'happiness', value: 5, description: '+5% szczęście' }], xpReward: 50, maxCount: 8 },
  mansion: { id: 'mansion', name: 'Rezydencja', description: 'Luksusowa rezydencja.', icon: 'mdi-castle', category: 'residential', rarity: 'rare', tier: 3, requiredLevel: 20, buildTime: 500, materials: [{ materialId: 'stone', amount: 50 }, { materialId: 'marble', amount: 20 }], goldCost: 500, effects: [{ type: 'population', value: 10, description: '+10 populacja' }, { type: 'happiness', value: 15, description: '+15% szczęście' }], xpReward: 150, maxCount: 3 },
  
  sawmill: { id: 'sawmill', name: 'Tartak', description: 'Produkuje drewno.', icon: 'mdi-saw-blade', category: 'production', rarity: 'common', tier: 1, requiredLevel: 3, buildTime: 150, materials: [{ materialId: 'wood', amount: 15 }], goldCost: 80, effects: [{ type: 'production', value: 5, description: '+5 drewna/min' }], xpReward: 30, maxCount: 5 },
  quarry: { id: 'quarry', name: 'Kamieniołom', description: 'Wydobywa kamień.', icon: 'mdi-mine', category: 'production', rarity: 'common', tier: 1, requiredLevel: 5, buildTime: 180, materials: [{ materialId: 'wood', amount: 20 }, { materialId: 'stone', amount: 10 }], goldCost: 100, effects: [{ type: 'production', value: 5, description: '+5 kamienia/min' }], xpReward: 35, maxCount: 5 },
  forge: { id: 'forge', name: 'Kuźnia', description: 'Wytwarza metal.', icon: 'mdi-anvil', category: 'production', rarity: 'uncommon', tier: 2, requiredLevel: 12, buildTime: 300, materials: [{ materialId: 'stone', amount: 30 }, { materialId: 'iron', amount: 15 }], goldCost: 250, effects: [{ type: 'production', value: 3, description: '+3 żelaza/min' }], xpReward: 80, maxCount: 3 },
  
  watchtower: { id: 'watchtower', name: 'Wieża Strażnicza', description: 'Zwiększa obronę.', icon: 'mdi-tower-beach', category: 'military', rarity: 'common', tier: 1, requiredLevel: 6, buildTime: 200, materials: [{ materialId: 'wood', amount: 25 }, { materialId: 'stone', amount: 15 }], goldCost: 120, effects: [{ type: 'defense', value: 10, description: '+10% obrony' }], xpReward: 40, maxCount: 4 },
  barracks: { id: 'barracks', name: 'Koszary', description: 'Szkoli wojowników.', icon: 'mdi-shield-sword', category: 'military', rarity: 'uncommon', tier: 2, requiredLevel: 15, buildTime: 400, materials: [{ materialId: 'stone', amount: 40 }, { materialId: 'iron', amount: 20 }], goldCost: 350, effects: [{ type: 'defense', value: 20, description: '+20% obrony' }, { type: 'xp_bonus', value: 10, description: '+10% XP wojownika' }], xpReward: 100, maxCount: 2 },
  fortress: { id: 'fortress', name: 'Forteca', description: 'Potężna twierdza.', icon: 'mdi-castle', category: 'military', rarity: 'epic', tier: 4, requiredLevel: 30, buildTime: 1000, materials: [{ materialId: 'stone', amount: 100 }, { materialId: 'iron', amount: 50 }, { materialId: 'mithril', amount: 10 }], goldCost: 2000, effects: [{ type: 'defense', value: 50, description: '+50% obrony' }], xpReward: 400, maxCount: 1 },
  
  mage_tower: { id: 'mage_tower', name: 'Wieża Maga', description: 'Wzmacnia magię.', icon: 'mdi-wizard-hat', category: 'magical', rarity: 'rare', tier: 3, requiredLevel: 22, buildTime: 600, materials: [{ materialId: 'stone', amount: 50 }, { materialId: 'marble', amount: 30 }], goldCost: 800, effects: [{ type: 'xp_bonus', value: 15, description: '+15% XP magiczne' }], xpReward: 200, maxCount: 2 },
  temple: { id: 'temple', name: 'Świątynia', description: 'Miejsce kultu.', icon: 'mdi-church', category: 'magical', rarity: 'epic', tier: 4, requiredLevel: 28, buildTime: 800, materials: [{ materialId: 'marble', amount: 50 }, { materialId: 'gold_bars', amount: 20 }], goldCost: 1500, effects: [{ type: 'happiness', value: 25, description: '+25% szczęście' }, { type: 'special', value: 1, description: 'Błogosławieństwo' }], xpReward: 300, maxCount: 1 },
  
  statue: { id: 'statue', name: 'Pomnik Bohatera', description: 'Upamiętnia bohaterów.', icon: 'mdi-human', category: 'monument', rarity: 'uncommon', tier: 2, requiredLevel: 10, buildTime: 250, materials: [{ materialId: 'stone', amount: 30 }], goldCost: 200, effects: [{ type: 'happiness', value: 10, description: '+10% szczęście' }], xpReward: 60, maxCount: 3 },
  colossus: { id: 'colossus', name: 'Kolos', description: 'Gigantyczny pomnik.', icon: 'mdi-human-handsup', category: 'monument', rarity: 'legendary', tier: 5, requiredLevel: 40, buildTime: 2000, materials: [{ materialId: 'marble', amount: 100 }, { materialId: 'gold_bars', amount: 50 }, { materialId: 'dragon_stone', amount: 10 }], goldCost: 10000, effects: [{ type: 'happiness', value: 50, description: '+50% szczęście' }, { type: 'gold_income', value: 100, description: '+100 złota/min' }], xpReward: 1000, maxCount: 1 },
};

export const CATEGORY_DATA: Record<BuildingCategory, { name: string; icon: string; color: string }> = {
  residential: { name: 'Mieszkalne', icon: 'mdi-home', color: '#4CAF50' },
  production: { name: 'Produkcyjne', icon: 'mdi-factory', color: '#FF9800' },
  military: { name: 'Wojskowe', icon: 'mdi-shield', color: '#F44336' },
  magical: { name: 'Magiczne', icon: 'mdi-star', color: '#9C27B0' },
  monument: { name: 'Monumenty', icon: 'mdi-pillar', color: '#607D8B' },
};

export const RARITY_DATA: Record<BuildingRarity, { label: string; color: string }> = {
  common: { label: 'Pospolity', color: '#9E9E9E' },
  uncommon: { label: 'Niepospolity', color: '#4CAF50' },
  rare: { label: 'Rzadki', color: '#2196F3' },
  epic: { label: 'Epicki', color: '#9C27B0' },
  legendary: { label: 'Legendarny', color: '#FF9800' },
};

export function getBuilding(id: string): Building | undefined { return BUILDINGS[id]; }
export function getMaterial(id: string): BuildingMaterial | undefined { return BUILDING_MATERIALS[id]; }
export function getAvailableBuildings(level: number): Building[] { return Object.values(BUILDINGS).filter(b => b.requiredLevel <= level); }
export function calculateArchitectXpToLevel(level: number): number { return Math.floor(100 * Math.pow(1.15, level - 1)); }
