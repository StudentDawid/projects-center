/**
 * Spy Path Data - Espionage, Infiltration, Intelligence
 */

export type MissionType = 'reconnaissance' | 'infiltration' | 'assassination' | 'sabotage' | 'theft';
export type MissionDifficulty = 'easy' | 'medium' | 'hard' | 'extreme' | 'legendary';

export interface SpyMission {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: MissionType;
  difficulty: MissionDifficulty;
  tier: number;
  requiredLevel: number;
  duration: number;
  stealthRequired: number;
  successChance: number;
  goldCost: number;
  xpReward: number;
  goldReward: number;
  specialReward?: string;
}

export interface SpyGear {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: number;
  stealthBonus: number;
  successBonus: number;
  requiredLevel: number;
  cost: number;
}

export interface Informant {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: number;
  intelGain: number;
  missionBonus: number;
  weeklyCost: number;
  requiredLevel: number;
  recruitCost: number;
}

export interface SpyProgress { level: number; xp: number; xpToNextLevel: number; totalXp: number; }

export const SPY_MISSIONS: Record<string, SpyMission> = {
  gather_info: { id: 'gather_info', name: 'Zbieranie Informacji', description: 'Podstawowe zwiadowanie.', icon: 'mdi-eye', type: 'reconnaissance', difficulty: 'easy', tier: 1, requiredLevel: 1, duration: 150, stealthRequired: 10, successChance: 80, goldCost: 20, xpReward: 15, goldReward: 40 },
  shadow_noble: { id: 'shadow_noble', name: 'Śledzenie Szlachcica', description: 'Obserwacja wpływowej osoby.', icon: 'mdi-account-search', type: 'reconnaissance', difficulty: 'medium', tier: 2, requiredLevel: 8, duration: 300, stealthRequired: 30, successChance: 65, goldCost: 80, xpReward: 40, goldReward: 120 },
  
  pickpocket: { id: 'pickpocket', name: 'Kradzież Kieszonkowa', description: 'Okradanie bogatych.', icon: 'mdi-hand-coin', type: 'theft', difficulty: 'easy', tier: 1, requiredLevel: 3, duration: 100, stealthRequired: 15, successChance: 70, goldCost: 10, xpReward: 20, goldReward: 60 },
  rob_merchant: { id: 'rob_merchant', name: 'Obrabowanie Kupca', description: 'Kradzież z karawany.', icon: 'mdi-treasure-chest', type: 'theft', difficulty: 'medium', tier: 2, requiredLevel: 12, duration: 400, stealthRequired: 40, successChance: 55, goldCost: 100, xpReward: 60, goldReward: 250 },
  vault_heist: { id: 'vault_heist', name: 'Włamanie do Skarbca', description: 'Ryzykowny napad.', icon: 'mdi-safe', type: 'theft', difficulty: 'hard', tier: 3, requiredLevel: 22, duration: 600, stealthRequired: 60, successChance: 40, goldCost: 300, xpReward: 120, goldReward: 600 },
  
  infiltrate_guild: { id: 'infiltrate_guild', name: 'Infiltracja Gildii', description: 'Wtargnięcie do organizacji.', icon: 'mdi-account-multiple', type: 'infiltration', difficulty: 'medium', tier: 2, requiredLevel: 10, duration: 350, stealthRequired: 35, successChance: 60, goldCost: 120, xpReward: 50, goldReward: 180 },
  infiltrate_palace: { id: 'infiltrate_palace', name: 'Infiltracja Pałacu', description: 'Wdarcie się do pałacu.', icon: 'mdi-castle', type: 'infiltration', difficulty: 'extreme', tier: 4, requiredLevel: 30, duration: 800, stealthRequired: 80, successChance: 30, goldCost: 500, xpReward: 200, goldReward: 1000, specialReward: 'palace_secrets' },
  
  sabotage_supply: { id: 'sabotage_supply', name: 'Sabotaż Zaopatrzenia', description: 'Niszczenie dostaw.', icon: 'mdi-barrel', type: 'sabotage', difficulty: 'medium', tier: 2, requiredLevel: 15, duration: 400, stealthRequired: 45, successChance: 55, goldCost: 150, xpReward: 70, goldReward: 200 },
  
  eliminate_target: { id: 'eliminate_target', name: 'Eliminacja Celu', description: 'Usunięcie zagrożenia.', icon: 'mdi-skull', type: 'assassination', difficulty: 'hard', tier: 3, requiredLevel: 25, duration: 500, stealthRequired: 70, successChance: 35, goldCost: 400, xpReward: 150, goldReward: 500 },
  royal_assassination: { id: 'royal_assassination', name: 'Królobójstwo', description: 'Legendarny zamach.', icon: 'mdi-crown', type: 'assassination', difficulty: 'legendary', tier: 5, requiredLevel: 40, duration: 1200, stealthRequired: 100, successChance: 15, goldCost: 2000, xpReward: 500, goldReward: 3000, specialReward: 'royal_signet' },
};

export const SPY_GEAR: Record<string, SpyGear> = {
  dark_cloak: { id: 'dark_cloak', name: 'Ciemny Płaszcz', description: 'Ukrywa w cieniu.', icon: 'mdi-tshirt-crew', tier: 1, stealthBonus: 10, successBonus: 5, requiredLevel: 1, cost: 50 },
  lockpicks: { id: 'lockpicks', name: 'Wytrychy', description: 'Otwierają zamki.', icon: 'mdi-key', tier: 1, stealthBonus: 5, successBonus: 10, requiredLevel: 5, cost: 100 },
  smoke_bombs: { id: 'smoke_bombs', name: 'Bomby Dymne', description: 'Ułatwiają ucieczkę.', icon: 'mdi-weather-fog', tier: 2, stealthBonus: 15, successBonus: 10, requiredLevel: 10, cost: 200 },
  shadow_boots: { id: 'shadow_boots', name: 'Buty Cienia', description: 'Wyciszają kroki.', icon: 'mdi-shoe-sneaker', tier: 2, stealthBonus: 20, successBonus: 5, requiredLevel: 15, cost: 350 },
  assassin_blade: { id: 'assassin_blade', name: 'Ostrze Skrytobójcy', description: 'Śmiertelna broń.', icon: 'mdi-knife', tier: 3, stealthBonus: 10, successBonus: 25, requiredLevel: 22, cost: 600 },
  phantom_cloak: { id: 'phantom_cloak', name: 'Płaszcz Widma', description: 'Prawie niewidzialny.', icon: 'mdi-ghost', tier: 4, stealthBonus: 35, successBonus: 15, requiredLevel: 30, cost: 1500 },
  master_kit: { id: 'master_kit', name: 'Zestaw Mistrza', description: 'Najlepszy sprzęt.', icon: 'mdi-toolbox', tier: 5, stealthBonus: 50, successBonus: 30, requiredLevel: 40, cost: 5000 },
};

export const INFORMANTS: Record<string, Informant> = {
  street_urchin: { id: 'street_urchin', name: 'Uliczny Urwis', description: 'Zna plotki z ulicy.', icon: 'mdi-account', tier: 1, intelGain: 5, missionBonus: 5, weeklyCost: 10, requiredLevel: 3, recruitCost: 50 },
  tavern_keeper: { id: 'tavern_keeper', name: 'Karczmarz', description: 'Słyszy wszystko.', icon: 'mdi-glass-mug', tier: 2, intelGain: 10, missionBonus: 10, weeklyCost: 25, requiredLevel: 10, recruitCost: 150 },
  corrupt_guard: { id: 'corrupt_guard', name: 'Skorumpowany Strażnik', description: 'Ma dostęp do informacji.', icon: 'mdi-shield-account', tier: 3, intelGain: 20, missionBonus: 15, weeklyCost: 50, requiredLevel: 20, recruitCost: 400 },
  noble_spy: { id: 'noble_spy', name: 'Szlachecki Szpieg', description: 'Dworzanin na usługach.', icon: 'mdi-crown', tier: 4, intelGain: 40, missionBonus: 25, weeklyCost: 150, requiredLevel: 32, recruitCost: 1500 },
};

export const DIFFICULTY_DATA: Record<MissionDifficulty, { label: string; color: string }> = {
  easy: { label: 'Łatwa', color: '#4CAF50' },
  medium: { label: 'Średnia', color: '#2196F3' },
  hard: { label: 'Trudna', color: '#FF9800' },
  extreme: { label: 'Ekstremalna', color: '#F44336' },
  legendary: { label: 'Legendarna', color: '#9C27B0' },
};

export const MISSION_TYPE_DATA: Record<MissionType, { name: string; icon: string; color: string }> = {
  reconnaissance: { name: 'Zwiad', icon: 'mdi-eye', color: '#2196F3' },
  infiltration: { name: 'Infiltracja', icon: 'mdi-account-key', color: '#9C27B0' },
  assassination: { name: 'Zamach', icon: 'mdi-skull', color: '#F44336' },
  sabotage: { name: 'Sabotaż', icon: 'mdi-bomb', color: '#FF9800' },
  theft: { name: 'Kradzież', icon: 'mdi-hand-coin', color: '#4CAF50' },
};

export function getMission(id: string): SpyMission | undefined { return SPY_MISSIONS[id]; }
export function getGear(id: string): SpyGear | undefined { return SPY_GEAR[id]; }
export function getInformant(id: string): Informant | undefined { return INFORMANTS[id]; }
export function getAvailableMissions(level: number): SpyMission[] { return Object.values(SPY_MISSIONS).filter(m => m.requiredLevel <= level); }
export function calculateSpyXpToLevel(level: number): number { return Math.floor(100 * Math.pow(1.15, level - 1)); }
