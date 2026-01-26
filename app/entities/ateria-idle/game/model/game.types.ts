/**
 * Core game types for Ateria Idle
 */

import type { Decimal } from 'break_infinity.js';

// ============================================
// RESOURCE TYPES
// ============================================

export type ResourceId = 'gold' | 'food' | 'wood' | 'ore' | 'essence' | 'slayerCoins';

export interface Resource {
  id: ResourceId;
  name: string;
  icon: string;
  color: string;
  amount: Decimal;
  maxAmount: Decimal | null; // null = unlimited
  perSecond: Decimal;
}

export type Resources = Record<ResourceId, Resource>;

// ============================================
// PATH TYPES (Trinity System)
// ============================================

export type PathId = 'warrior' | 'scientist' | 'merchant';

export interface PathProgress {
  id: PathId;
  level: number;
  xp: Decimal;
  xpToNextLevel: Decimal;
}

// ============================================
// GAME STATE
// ============================================

export interface GameState {
  // Meta
  version: string;
  lastSave: number;
  lastLogout: number;
  totalPlaytime: number; // seconds
  tickCount: number;

  // Tutorial & Progression
  tutorialStep: number;
  tutorialCompleted: boolean;
  unlockedFeatures: Set<FeatureId>;

  // Prestige
  prestigeCount: number;
  legacyPoints: number;
  legacyUpgrades: LegacyUpgrade[];

  // Settings
  settings: GameSettings;
}

export type FeatureId =
  | 'warrior'
  | 'scientist'
  | 'merchant'
  | 'alchemy'
  | 'golems'
  | 'tradeRoutes'
  | 'dungeons'
  | 'prestige';

export interface GameSettings {
  autoSaveInterval: number; // seconds
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  musicEnabled: boolean;
  showDamageNumbers: boolean;
  compactMode: boolean;
}

// ============================================
// PRESTIGE / LEGACY SYSTEM
// ============================================

export interface LegacyUpgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  maxLevel: number;
  currentLevel: number;
  effect: LegacyEffect;
  requires?: string[]; // IDs of required upgrades
  path?: PathId; // null = universal
}

export interface LegacyEffect {
  type: 'xp_multiplier' | 'resource_multiplier' | 'start_bonus' | 'unlock';
  target?: PathId | ResourceId;
  value: number; // multiplier or flat bonus
}

// ============================================
// PRESTIGE GATES
// ============================================

export type PrestigeGateId = 'dungeon_master' | 'trading_empire' | 'scientific_breakthrough' | 'trinity_balance';

export interface PrestigeGate {
  id: PrestigeGateId;
  name: string;
  description: string;
  condition: () => boolean;
  progress: () => number; // 0-1
}

// ============================================
// EVENTS
// ============================================

export type GameEventType = 'festival' | 'world_event' | 'weekend_bonus' | 'daily_challenge';

export interface GameEvent {
  id: string;
  type: GameEventType;
  name: string;
  description: string;
  startTime: number;
  endTime: number;
  modifiers: EventModifier[];
  rewards?: EventReward[];
}

export interface EventModifier {
  type: 'xp_multiplier' | 'gold_multiplier' | 'loot_multiplier' | 'cost_reduction';
  value: number;
  target?: PathId | ResourceId;
}

export interface EventReward {
  type: 'resource' | 'item' | 'legacy_points';
  id: string;
  amount: number;
}

// ============================================
// ACHIEVEMENTS
// ============================================

export type AchievementCategory = 'progression' | 'economy' | 'discovery' | 'challenge' | 'secret';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  condition: () => boolean;
  progress?: () => number; // 0-1 for trackable achievements
  reward?: AchievementReward;
  hidden: boolean;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: number; // timestamp
}

export interface AchievementReward {
  type: 'title' | 'lp_bonus' | 'cosmetic' | 'item' | 'permanent_buff';
  value: string | number;
}

// ============================================
// HINTS / TUTORIAL
// ============================================

export interface Hint {
  id: string;
  trigger: HintTrigger;
  message: string;
  priority: 'low' | 'medium' | 'high';
  dismissable: boolean;
  shown: boolean;
}

export type HintTrigger =
  | { type: 'resource_below'; resource: ResourceId; threshold: number }
  | { type: 'resource_above'; resource: ResourceId; threshold: number }
  | { type: 'level_reached'; path: PathId; level: number }
  | { type: 'feature_unlocked'; feature: FeatureId }
  | { type: 'first_death' }
  | { type: 'idle_time'; seconds: number };

// ============================================
// NOTIFICATIONS
// ============================================

export interface GameNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'achievement';
  title: string;
  message: string;
  icon?: string;
  duration?: number; // ms, null = permanent
  timestamp: number;
}

// ============================================
// OFFLINE PROGRESS
// ============================================

export interface OfflineReport {
  timeAway: number; // ms
  combat: OfflineCombatReport;
  research: OfflineResearchReport;
  merchant: OfflineMerchantReport;
}

export interface OfflineCombatReport {
  monstersKilled: number;
  xpGained: number;
  loot: Array<{ itemId: string; amount: number }>;
  deaths: number;
  foodConsumed: number;
}

export interface OfflineResearchReport {
  researchProgress: Record<string, number>;
  potionsProduced: Record<string, number>;
  golemWork: Record<string, number>;
}

export interface OfflineMerchantReport {
  goldEarned: Decimal;
  tradeRoutesCompleted: number;
  itemsSold: number;
}
