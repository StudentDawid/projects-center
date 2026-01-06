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
  // Click Boosters - Solmar
  | 'prayer_beads' // Różaniec - +0.5 base click
  | 'holy_relic' // Święta Relikwia - +10% click multiplier
  | 'blessed_altar' // Błogosławiony Ołtarz - +1 base click
  | 'choir' // Chór Świątynny - +25% click multiplier
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

// ============================================
// Combat System - Extended
// ============================================

export type EnemyTypeId =
  | 'cultist' // Kultyści Mięsa (podstawowi)
  | 'abomination_minion' // Plugastwa (elitarni)
  | 'apostate' // Apostaci (specjalni)
  | 'abomination_boss' // Abominacje (boss)
  | 'arch_heretic'; // Arcyheretyk (mega-boss)

export type LiturgyId = 'blessing' | 'martyrdom' | 'regeneration' | 'fortification';

export interface EnemyType {
  id: EnemyTypeId;
  name: string;
  description: string;
  icon: string;
  tier: 'basic' | 'elite' | 'special' | 'boss' | 'megaboss';
  damageMultiplier: number;
  unitLossMultiplier: number;
  durationMultiplier: number;
  specialEffect?: EnemySpecialEffect;
  weakness?: LiturgyId; // Liturgy this enemy is weak to
  weaknessBonus: number; // Extra damage reduction when weakness exploited (0-1)
  spawnCondition: EnemySpawnCondition;
}

export interface EnemySpecialEffect {
  type: 'steal_faith' | 'morale_drain' | 'disable_buildings' | 'summon_minions' | 'enrage';
  value: number; // Percentage or amount based on type
  description: string;
}

export interface EnemySpawnCondition {
  type: 'every_n_waves' | 'threat_threshold' | 'random_chance';
  value: number;
}

export interface BossEncounter {
  id: string;
  enemyType: EnemyTypeId;
  phase: number; // Current phase (1-3)
  maxPhases: number;
  healthPercent: number; // Boss health (0-100)
  choices: BossChoice[];
  activeChoice: string | null;
  timeRemaining: number;
  rewards: BossReward[];
}

export interface BossChoice {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: Partial<Record<ResourceId, number>>;
  effect: BossChoiceEffect;
}

export interface BossChoiceEffect {
  type: 'damage' | 'weaken' | 'heal' | 'sacrifice';
  value: number;
  targetPhase?: number;
}

export interface BossReward {
  type: 'relic' | 'faith' | 'ashes' | 'achievement';
  relicRarity?: RelicRarity;
  amount?: number;
}

export interface CombatCombo {
  currentStreak: number;
  maxStreak: number;
  lastWaveTime: number;
  comboWindow: number; // Seconds to maintain combo
  bonusPerStreak: number; // Multiplier bonus per streak
}

export interface ActiveWave {
  waveNumber: number;
  enemyType: EnemyType;
  damage: number;
  unitLosses: number;
  duration: number;
  timeRemaining: number;
  isBoss: boolean;
  specialEffectActive: boolean;
}

