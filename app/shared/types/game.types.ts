/**
 * Core game types for Sanktuarium Solmara
 */
import type Decimal from 'break_infinity.js';

// ============================================
// Resource Types
// ============================================

export type ResourceId = 'faith' | 'biomass' | 'souls' | 'ducats' | 'rage';

export interface Resource {
  id: ResourceId;
  name: string;
  description: string;
  icon: string;
  amount: Decimal;
  maxAmount: Decimal | null; // null = unlimited
  perSecond: Decimal;
  unlocked: boolean;
}

// ============================================
// Entity Types (Buildings & Units)
// ============================================

export type EntityId =
  // Tier 1 - Solmar
  | 'chapel' // Kapliczka
  | 'tithe_collector' // Poborca Dziesięcin
  | 'flagellant' // Pielgrzym Biczownik
  | 'altar_tank' // Czołg-Ołtarz
  | 'walls' // Mury Obronne
  | 'guard_tower' // Wieża Strażnicza
  | 'chaplain' // Kapelan
  | 'monastery' // Klasztor
  // Tier 2 - Solmar
  | 'cathedral' // Katedra
  | 'arsenal' // Arsenał
  | 'library' // Biblioteka Świętych Tekstów
  | 'field_hospital' // Szpital Polowy
  // Tier 3 - Solmar
  | 'reliquary' // Relikwiarz
  | 'inquisition_fortress' // Forteca Inkwizycji
  | 'bell_tower' // Wieża Dzwonnicza
  // Special Units
  | 'inquisitor' // Inkwizytor
  | 'holy_warrior' // Święty Wojownik
  // Cult
  | 'flesh_puppet' // Mięsna Kukła
  | 'infected_stormtrooper'; // Zarażony Szturmowiec

export type EntityTier = 1 | 2 | 3;

export interface EntityPrerequisite {
  entityId: EntityId;
  count: number;
}

// Special unlock conditions for Tier 3 buildings
export interface SpecialUnlockCondition {
  type: 'prestige_count' | 'waves_defeated' | 'total_faith';
  threshold: number;
}

export interface Entity {
  id: EntityId;
  name: string;
  description: string;
  icon: string;
  count: number;
  level: number; // Building upgrade level (1-5)
  tier: EntityTier; // Building tier (1 = basic, 2 = advanced, 3 = endgame)
  baseCost: Record<ResourceId, Decimal>;
  costMultiplier: number;
  production: Partial<Record<ResourceId, Decimal>>;
  consumption: Partial<Record<ResourceId, Decimal>>;
  unlocked: boolean;
  unlockCondition?: UnlockCondition;
  prerequisites?: EntityPrerequisite[]; // Required buildings to unlock
  specialConditions?: SpecialUnlockCondition[]; // Special unlock conditions (prestige, waves, etc.)
  maxLevelEffect?: string; // Description of max level special effect
  specialEffect?: string; // Description of passive special effect (for Tier 2+)
}

// ============================================
// Faction Types
// ============================================

export type FactionId = 'solmar' | 'cult';

export interface Faction {
  id: FactionId;
  name: string;
  description: string;
  theme: string; // Vuetify theme name
  resources: ResourceId[];
  entities: EntityId[];
}

// ============================================
// Unlock System
// ============================================

export interface UnlockCondition {
  type: 'resource' | 'entity' | 'prestige';
  targetId: string;
  threshold: number;
}

// ============================================
// Prestige System
// ============================================

export type PrestigeCurrencyId = 'martyrAshes' | 'evolutionEssence';

export interface PrestigeCurrency {
  id: PrestigeCurrencyId;
  name: string;
  description: string;
  amount: Decimal;
  faction: FactionId;
}

export interface PrestigeUpgrade {
  id: string;
  name: string;
  description: string;
  cost: Decimal;
  currencyId: PrestigeCurrencyId;
  effect: PrestigeEffect;
  purchased: boolean;
}

export interface PrestigeEffect {
  type: 'startingResource' | 'productionMultiplier' | 'costReduction' | 'unlockFeature';
  targetId?: string;
  value: number;
}

// ============================================
// Game State
// ============================================

export interface GameState {
  version: string;
  currentFaction: FactionId;
  totalPlayTime: number;
  lastSaveTime: number;
  prestigeCount: number;
}

// ============================================
// Narrative System
// ============================================

export interface NarrativeLog {
  id: string;
  timestamp: number;
  message: string;
  type: 'event' | 'discovery' | 'warning' | 'lore';
  read: boolean;
}

export interface LoreEntry {
  id: string;
  title: string;
  content: string;
  unlocked: boolean;
  unlockCondition?: UnlockCondition;
}

// ============================================
// Relic System
// ============================================

export type RelicRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface RelicEffect {
  type:
    | 'productionMultiplier' // Mnożnik produkcji zasobu
    | 'clickMultiplier' // Mnożnik kliknięcia
    | 'defenseBonus' // Bonus do obrony
    | 'moraleRegenBonus' // Bonus do regeneracji morale
    | 'moraleDamageReduction' // Redukcja obrażeń morale
    | 'prestigeBonus' // Bonus do Popiołów z prestiżu
    | 'moraleMinimum' // Morale nie spada poniżej wartości
    | 'doubleClickChance' // Szansa na podwójne kliknięcie
    | 'waveDelayBonus' // Bonus do czasu między falami
    | 'criticalClickChance' // Szansa na krytyczne kliknięcie
    | 'allProductionMultiplier'; // Mnożnik całkowitej produkcji
  targetId?: ResourceId;
  value: number;
}

export interface Relic {
  id: string;
  name: string;
  description: string;
  lore: string; // Opis fabularny
  icon: string;
  rarity: RelicRarity;
  effects: RelicEffect[];
  owned: boolean;
  equipped: boolean;
  source: 'wave' | 'boss' | 'prestige' | 'achievement' | 'event';
}

export interface RelicSlot {
  index: number;
  relicId: string | null;
  unlocked: boolean;
}

