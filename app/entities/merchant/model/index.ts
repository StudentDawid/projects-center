import type { Decimal } from '~/shared/lib/big-number';

export interface Resource {
  name: string;
  amount: Decimal;
  perSecond: Decimal;
}

export interface Worker {
  id: string;
  name: string;
  baseCost: Decimal;
  costMultiplier: number; // usually 1.15
  baseProduction: Decimal;
  count: number;
  description: string;
}

export interface Upgrade {
  id: string;
  name: string;
  cost: Decimal;
  description: string;
  effect: (state: GameState) => void;
  purchased: boolean;
  triggerCondition?: (state: GameState) => boolean;
}

export interface LogEvent {
  id: string;
  message: string;
  timestamp: number;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface City {
  id: string;
  name: string;
  description: string;
  coordinates: { x: number; y: number }; // 0-100 range for canvas %
  unlocked: boolean;
  discoveryCost: Decimal;
  distanceMultiplier: number; // Affects caravan duration
  tradeRewardMultiplier: number;
}

export interface Caravan {
  id: string;
  targetCityId: string;
  startTime: number;
  returnTime: number; // timestamp
  reward: Decimal; // amount of gold to gain
}

export interface Factor {
  id: string;
  cityId: string;
  name: string;
  level: number; // 1-5, affects efficiency
  baseCost: Decimal; // initial hiring cost
  upkeepCost: Decimal; // per second maintenance
  efficiency: number; // 0.5-1.0, affects trade rewards
  lastTradeTime: number; // timestamp of last automatic trade
  tradeInterval: number; // milliseconds between trades
  totalTrades: number;
  totalProfit: Decimal;
  hired: boolean;
}

export interface OfflineProgress {
  offlineTime: number; // milliseconds
  goldEarned: Decimal;
  goldFromProduction: Decimal;
  goldFromCaravans: Decimal;
  goldFromFactors: Decimal;
  caravansReturned: number;
  factorTradesCompleted: number;
  eventsOccurred: number;
  efficiency: number; // 0-1, how efficient offline was compared to online
}

export interface GameState {
  gold: Decimal;
  lifetimeGold: Decimal;
  clickPower: number;
  workers: Worker[];
  upgrades: Upgrade[];
  cities: City[];
  caravans: Caravan[];
  factors: Factor[];
  events: LogEvent[];
  lastTick: number; // timestamp
  lastSaveTime: number; // timestamp for offline calculation
  reputation: Decimal;
  reputationUpgrades: string[];
  stats: {
    totalClicks: number;
    totalGoldFromClicks: Decimal;
    totalGoldFromTrade: Decimal;
    prestigeCount: number;
    startTime: number;
    lastPrestigeTime: number;
  };
}

