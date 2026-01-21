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

export interface GameState {
  gold: Decimal;
  lifetimeGold: Decimal;
  clickPower: number;
  workers: Worker[];
  upgrades: Upgrade[];
  cities: City[];
  caravans: Caravan[];
  events: LogEvent[];
  lastTick: number; // timestamp
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

