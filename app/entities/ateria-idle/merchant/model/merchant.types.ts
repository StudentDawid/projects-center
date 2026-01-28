/**
 * Merchant path types for Ateria Idle
 */

import type { Decimal } from 'break_infinity.js';
import type { ItemRarity } from '../../warrior/model/warrior.types';

// ============================================
// MERCHANT STATS
// ============================================

export interface MerchantStats {
  level: number;
  xp: Decimal;
  xpToNextLevel: Decimal;

  // Reputation with different factions
  reputation: number; // 0-100, affects prices and customers
  reputationTier: ReputationTier;

  // Skills
  charisma: number; // Affects haggling success
  negotiation: number; // Better trade route deals
  appraisal: number; // Better buy prices

  // Derived
  goldMultiplier: number;
  customerAttraction: number;
}

export type ReputationTier = 'unknown' | 'known' | 'trusted' | 'respected' | 'renowned' | 'legendary';

// ============================================
// SHOP SYSTEM
// ============================================

export interface Shop {
  name: string;
  level: number;
  maxDisplaySlots: number;
  maxStorageSlots: number;

  // Current state
  displayedItems: ShopDisplayItem[];
  storage: ShopStorageItem[];
  decorations: ShopDecoration[];

  // Stats from decorations
  bonuses: ShopBonuses;
}

export interface ShopDisplayItem {
  itemId: string;
  quantity: number;
  basePrice: number;
  currentPrice: number; // After modifiers
  priceModifier: number; // Player-set markup (0.5 - 2.0)
}

export interface ShopStorageItem {
  itemId: string;
  quantity: number;
  averageBuyPrice: number; // For profit calculation
}

export interface ShopDecoration {
  id: string;
  name: string;
  description: string;
  icon: string;
  slot: DecorationSlot;
  rarity: ItemRarity;
  cost: number;
  bonuses: Partial<ShopBonuses>;
  purchased: boolean;
}

export type DecorationSlot = 'counter' | 'lighting' | 'floor' | 'wall' | 'entrance' | 'special';

export interface ShopBonuses {
  customerPatience: number; // % increase in time before leaving
  wealthyCustomerChance: number; // % chance for rich customers
  haggleSuccessBonus: number; // % bonus to haggling
  priceMultiplier: number; // Base price multiplier
  customerFrequency: number; // % more customers per tick
  storageCapacity: number; // Extra storage slots
}

// ============================================
// CUSTOMER SYSTEM
// ============================================

export interface Customer {
  id: string;
  type: CustomerType;
  name: string;
  icon: string;

  // Budget and preferences
  budget: number;
  budgetFlexibility: number; // % willing to pay above budget
  preferredCategories: string[];
  patience: number; // Ticks before leaving

  // Current state
  currentPatience: number;
  wantedItemId: string | null;
  offerPrice: number;
  state: CustomerState;
}

export type CustomerType = 'peasant' | 'traveler' | 'merchant' | 'noble' | 'collector' | 'whale';

export type CustomerState = 'browsing' | 'interested' | 'haggling' | 'buying' | 'leaving' | 'satisfied';

export interface CustomerSpawnConfig {
  type: CustomerType;
  weight: number; // Spawn probability weight
  minReputation: number;
  budgetRange: { min: number; max: number };
  patienceRange: { min: number; max: number };
}

// ============================================
// TRADE ROUTES
// ============================================

export interface TradeRoute {
  id: string;
  name: string;
  description: string;
  icon: string;

  // Route details
  fromCity: CityId;
  toCity: CityId;
  distance: number; // Affects travel time
  baseTravelTime: number; // In ticks (base, before modifiers)

  // Requirements
  requiredLevel: number;
  requiredReputation: number;

  // Risk and reward
  baseRisk: number; // 0-1, chance of ambush
  profitMultiplier: number; // How much prices differ between cities

  // Special modifiers
  terrainType: TerrainType;
  seasonalModifiers?: SeasonalModifier[];
}

export type CityId = 'hometown' | 'riverside' | 'mountain_pass' | 'desert_oasis' | 'port_city' | 'capital' | 'frontier' | 'mystic_vale';

export type TerrainType = 'road' | 'forest' | 'mountain' | 'desert' | 'swamp' | 'coastal';

export interface SeasonalModifier {
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  riskModifier: number;
  timeModifier: number;
  profitModifier: number;
}

export interface City {
  id: CityId;
  name: string;
  description: string;
  icon: string;
  color: string;

  // What this city buys/sells well
  demandCategories: string[]; // Buys at higher prices
  supplyCategories: string[]; // Sells at lower prices

  // Special traits
  traits: CityTrait[];
}

export type CityTrait = 'wealthy' | 'poor' | 'military' | 'scholarly' | 'trading_hub' | 'frontier' | 'magical';

// ============================================
// CARAVAN SYSTEM
// ============================================

export interface Caravan {
  id: string;
  name: string;

  // Capacity
  maxCapacity: number;
  currentCapacity: number;

  // Speed and protection
  baseSpeed: number;
  protection: number; // Reduces ambush damage

  // Cargo
  cargo: CaravanCargo[];

  // Current state
  state: CaravanState;
  currentRoute: string | null;
  progress: number; // 0-1
  departureTime: number;
  arrivalTime: number;

  // Insurance
  insured: boolean;
  insuranceCost: number;
}

export type CaravanState = 'idle' | 'loading' | 'traveling' | 'returning' | 'ambushed' | 'arrived';

export interface CaravanCargo {
  itemId: string;
  quantity: number;
  buyPrice: number; // Price paid when loading
}

export interface CaravanUpgrade {
  id: string;
  name: string;
  description: string;
  icon: string;

  cost: number;
  effect: CaravanUpgradeEffect;
  maxLevel: number;
}

export interface CaravanUpgradeEffect {
  type: 'capacity' | 'speed' | 'protection' | 'slots';
  value: number;
  isPercent: boolean;
}

// ============================================
// AMBUSH SYSTEM
// ============================================

export interface AmbushEvent {
  type: AmbushOutcome;
  cargoLostPercent: number;
  goldLost: number;
  caravanDamage: number;
  xpGained: number;
}

export type AmbushOutcome = 'escaped' | 'minor_loss' | 'major_loss' | 'total_loss' | 'defended';

// ============================================
// MARKET SYSTEM
// ============================================

export interface MarketState {
  prices: Map<string, MarketPrice>;
  lastUpdate: number;
  globalModifiers: MarketModifier[];
}

export interface MarketPrice {
  itemId: string;
  basePrice: number;
  currentPrice: number;
  supplyLevel: number; // 0-1, affects price
  demandLevel: number; // 0-1, affects price
  trend: PriceTrend;
  lastSoldQuantity: number;
  recoveryRate: number; // How fast price returns to base
}

export type PriceTrend = 'rising' | 'stable' | 'falling' | 'volatile';

export interface MarketModifier {
  id: string;
  name: string;
  description: string;
  icon: string;

  // What it affects
  affectedCategories: string[];
  priceModifier: number; // Multiplier
  demandModifier: number;

  // Duration
  startTime: number;
  duration: number; // In ticks
  isActive: boolean;
}

// ============================================
// HAGGLING SYSTEM
// ============================================

export interface HaggleAttempt {
  customerId: string;
  itemId: string;
  askingPrice: number;
  customerOffer: number;
  finalPrice: number;
  success: boolean;
  charismaUsed: number;
}

export interface HaggleResult {
  success: boolean;
  finalPrice: number;
  customerSatisfaction: number; // Affects future visits
  xpGained: number;
  reputationChange: number;
}

// ============================================
// ORDERS & CONTRACTS
// ============================================

export interface TradeContract {
  id: string;
  clientName: string;
  clientType: CustomerType;

  // Requirements
  requiredItems: ContractItem[];
  deadline: number; // Ticks until expiry

  // Rewards
  goldReward: number;
  xpReward: number;
  reputationReward: number;
  bonusItems?: { itemId: string; quantity: number }[];

  // State
  state: ContractState;
  progress: Map<string, number>; // itemId -> delivered quantity
}

export interface ContractItem {
  itemId: string;
  quantity: number;
  minQuality?: ItemRarity;
}

export type ContractState = 'available' | 'accepted' | 'completed' | 'failed' | 'expired';

// ============================================
// MERCHANT UNLOCKS & UPGRADES
// ============================================

export interface MerchantUnlock {
  id: string;
  name: string;
  description: string;
  icon: string;

  // Requirements
  requiredLevel: number;
  requiredReputation?: number;
  cost: number;

  // What it unlocks
  unlockType: 'caravan_slot' | 'trade_route' | 'decoration' | 'feature' | 'upgrade';
  unlockId: string;

  // State
  purchased: boolean;
}

// ============================================
// TRANSACTION HISTORY
// ============================================

export interface Transaction {
  id: string;
  type: TransactionType;
  timestamp: number;

  itemId: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;

  // Context
  customerId?: string;
  routeId?: string;
  profit?: number;
}

export type TransactionType = 'sale' | 'purchase' | 'trade_route_buy' | 'trade_route_sell' | 'contract';
