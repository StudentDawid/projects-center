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
  | 'chapel' // Kapliczka
  | 'tithe_collector' // Poborca Dziesięcin
  | 'flagellant' // Pielgrzym Biczownik
  | 'altar_tank' // Czołg-Ołtarz
  | 'walls' // Mury Obronne
  | 'guard_tower' // Wieża Strażnicza
  | 'chaplain' // Kapelan
  | 'monastery' // Klasztor
  | 'flesh_puppet' // Mięsna Kukła
  | 'infected_stormtrooper'; // Zarażony Szturmowiec

export interface Entity {
  id: EntityId;
  name: string;
  description: string;
  icon: string;
  count: number;
  baseCost: Record<ResourceId, Decimal>;
  costMultiplier: number;
  production: Partial<Record<ResourceId, Decimal>>;
  consumption: Partial<Record<ResourceId, Decimal>>;
  unlocked: boolean;
  unlockCondition?: UnlockCondition;
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

