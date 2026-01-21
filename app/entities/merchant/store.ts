import { defineStore } from 'pinia';
import type { GameState, LogEvent, Caravan, Worker, Upgrade } from './model';
import {
  bn,
  Decimal,
  formatNumber as formatBn,
  calculateProduction,
} from '~/shared/lib/big-number';

const defaultWorkers: Worker[] = [
  {
    id: 'novice',
    name: 'Novice Merchant',
    baseCost: bn(10),
    costMultiplier: 1.15,
    baseProduction: bn(0.5),
    count: 0,
    description: 'A beginner seeking fortune.',
  },
  {
    id: 'journeyman',
    name: 'Journeyman',
    baseCost: bn(50),
    costMultiplier: 1.15,
    baseProduction: bn(3),
    count: 0,
    description: 'Experienced in the local markets.',
  },
  {
    id: 'clerk',
    name: 'Guild Clerk',
    baseCost: bn(250),
    costMultiplier: 1.15,
    baseProduction: bn(10),
    count: 0,
    description: 'Keeps the books balanced and coins flowing.',
  },
  {
    id: 'guard',
    name: 'Caravan Guard',
    baseCost: bn(1000),
    costMultiplier: 1.15,
    baseProduction: bn(50),
    count: 0,
    description: 'Protects assets and ensures steady income.',
  },
  {
    id: 'banker',
    name: 'Master Banker',
    baseCost: bn(5000),
    costMultiplier: 1.15,
    baseProduction: bn(200),
    count: 0,
    description: 'Invests gold to generate massive wealth.',
  },
];

const defaultUpgrades: Upgrade[] = [
  {
    id: 'iron_stylus',
    name: 'Iron Stylus',
    cost: bn(100),
    description: 'Doubles click power.',
    effect: () => {},
    purchased: false,
  },
  {
    id: 'ledger',
    name: 'Proper Ledger',
    cost: bn(500),
    description: 'Workers produce 10% more gold.',
    effect: () => {},
    purchased: false,
  },
  {
    id: 'gem_stylus',
    name: 'Gem-Encrusted Stylus',
    cost: bn(2500),
    description: ' Triples click power (Stacks).',
    effect: () => {},
    purchased: false,
  },
  {
    id: 'double_entry',
    name: 'Double Entry Bookkeeping',
    cost: bn(10000),
    description: 'Workers produce 20% more gold.',
    effect: () => {},
    purchased: false,
  },
  {
    id: 'guild_hall',
    name: 'Guild Hall',
    cost: bn(50000),
    description: 'Workers produce 50% more gold.',
    effect: () => {},
    purchased: false,
  },
];

export const useMerchantStore = defineStore('merchant-store', {
  state: (): GameState => ({
    gold: bn(0),
    lifetimeGold: bn(0),
    clickPower: 1,
    workers: JSON.parse(JSON.stringify(defaultWorkers)),
    upgrades: JSON.parse(JSON.stringify(defaultUpgrades)),
    cities: [
      {
        id: 'capital',
        name: 'Grand Capital',
        description: 'Your home and seat of the Guild.',
        coordinates: { x: 50, y: 50 },
        unlocked: true,
        discoveryCost: bn(0),
        distanceMultiplier: 0,
        tradeRewardMultiplier: 0,
      },
      {
        id: 'port',
        name: 'Salt Port',
        description: 'A bustling harbor smelling of brine and fish.',
        coordinates: { x: 30, y: 70 },
        unlocked: false,
        discoveryCost: bn(1000),
        distanceMultiplier: 1,
        tradeRewardMultiplier: 1.5,
      },
      {
        id: 'monastery',
        name: 'Silent Monastery',
        description: 'Isolated monks who brew rare ales.',
        coordinates: { x: 70, y: 30 },
        unlocked: false,
        discoveryCost: bn(2500),
        distanceMultiplier: 1.5,
        tradeRewardMultiplier: 2.2,
      },
      {
        id: 'fortress',
        name: 'Iron Fortress',
        description: 'A military stronghold always in need of steel.',
        coordinates: { x: 80, y: 80 },
        unlocked: false,
        discoveryCost: bn(5000),
        distanceMultiplier: 2.0,
        tradeRewardMultiplier: 3.5,
      },
    ],
    caravans: [],
    events: [],
    lastTick: Date.now(),
  }),
  getters: {
    goldPerSecond: (state): Decimal => {
      let multiplier = 1;
      if (state.upgrades.find((u) => u.id === 'ledger' && u.purchased)) {
        multiplier *= 1.1;
      }
      if (state.upgrades.find((u) => u.id === 'double_entry' && u.purchased)) {
        multiplier *= 1.2;
      }
      if (state.upgrades.find((u) => u.id === 'guild_hall' && u.purchased)) {
        multiplier *= 1.5;
      }

      return state.workers
        .reduce((total, worker) => {
          // worker.baseProduction is Decimal, worker.count is number
          // we can use calculateProduction or manual mul
          const prod = bn(worker.baseProduction).mul(worker.count);
          return total.add(prod);
        }, bn(0))
        .mul(multiplier);
    },
    currentClickPower: (state) => {
      let power = state.clickPower;
      if (state.upgrades.find((u) => u.id === 'iron_stylus' && u.purchased)) {
        power *= 2;
      }
      if (state.upgrades.find((u) => u.id === 'gem_stylus' && u.purchased)) {
        power *= 3;
      }
      return power;
    },
    getWorkerCost:
      (state) =>
      (workerId: string): Decimal => {
        const worker = state.workers.find((w) => w.id === workerId);
        if (!worker) return bn(0);
        // cost = baseCost * (multiplier ^ count)
        return bn(worker.baseCost)
          .mul(Decimal.pow(worker.costMultiplier, worker.count))
          .floor();
      },
    recentEvents: (state) => {
      return state.events.slice().reverse().slice(0, 50);
    },
  },
  actions: {
    syncContent() {
      // Re-hydrate BigNumbers for Gold
      this.gold = bn(this.gold);
      this.lifetimeGold = bn(this.lifetimeGold);

      // Sync and Re-hydrate Workers
      this.workers.forEach((worker) => {
        worker.baseCost = bn(worker.baseCost);
        worker.baseProduction = bn(worker.baseProduction);
      });

      // Merge missing workers from defaults
      defaultWorkers.forEach((defWorker) => {
        const existing = this.workers.find((w) => w.id === defWorker.id);
        if (!existing) {
          const newWorker = JSON.parse(JSON.stringify(defWorker));
          newWorker.baseCost = bn(newWorker.baseCost);
          newWorker.baseProduction = bn(newWorker.baseProduction);
          this.workers.push(newWorker);
        }
      });

      // Sync/Rehydrate Upgrades
      this.upgrades.forEach((u) => {
        u.cost = bn(u.cost);
      });

      defaultUpgrades.forEach((defUpgrade) => {
        const existing = this.upgrades.find((u) => u.id === defUpgrade.id);
        if (!existing) {
          const newUpgrade = JSON.parse(JSON.stringify(defUpgrade));
          newUpgrade.cost = bn(newUpgrade.cost);
          this.upgrades.push(newUpgrade);
        }
      });

      // Rehydrate Cities
      this.cities.forEach((c) => {
        c.discoveryCost = bn(c.discoveryCost);
      });

      // Rehydrate Caravans
      this.caravans.forEach((c) => {
        c.reward = bn(c.reward);
      });
    },
    addEvent(message: string, type: LogEvent['type'] = 'info') {
      this.events.push({
        id: crypto.randomUUID(),
        message,
        timestamp: Date.now(),
        type,
      });
      if (this.events.length > 100) {
        this.events.shift();
      }
    },
    clickResource() {
      const amount = bn(this.currentClickPower);
      this.gold = this.gold.add(amount);
      this.lifetimeGold = this.lifetimeGold.add(amount);
    },
    hireWorker(workerId: string) {
      const workerIndex = this.workers.findIndex((w) => w.id === workerId);
      if (workerIndex === -1) return;

      const worker = this.workers[workerIndex];
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!worker) return;

      const cost = bn(worker.baseCost)
        .mul(Decimal.pow(worker.costMultiplier, worker.count))
        .floor();

      if (this.gold.gte(cost)) {
        this.gold = this.gold.sub(cost);
        worker.count++;
        this.addEvent(
          `Hired ${worker.name} for ${this.formatNumber(cost)} gold.`,
          'success'
        );
      } else {
        this.addEvent(`Not enough gold to hire ${worker.name}.`, 'warning');
      }
    },
    buyUpgrade(upgradeId: string) {
      const upgrade = this.upgrades.find((u) => u.id === upgradeId);
      if (upgrade && !upgrade.purchased && this.gold.gte(upgrade.cost)) {
        this.gold = this.gold.sub(upgrade.cost);
        upgrade.purchased = true;
        this.addEvent(`Purchased upgrade: ${upgrade.name}`, 'success');
      }
    },
    discoverCity(cityId: string) {
      const city = this.cities.find((c) => c.id === cityId);
      if (city && !city.unlocked && this.gold.gte(city.discoveryCost)) {
        this.gold = this.gold.sub(city.discoveryCost);
        city.unlocked = true;
        this.addEvent(`Discovered trade route to ${city.name}!`, 'success');
      }
    },
    sendCaravan(cityId: string) {
      const city = this.cities.find((c) => c.id === cityId);
      if (!city || !city.unlocked) return;

      if (this.caravans.some((c) => c.targetCityId === cityId)) {
        this.addEvent(
          `A caravan is already en route to ${city.name}.`,
          'warning'
        );
        return;
      }

      const durationSec = 10 * city.distanceMultiplier; // Base 10 seconds * multiplier
      const reward = bn(100).mul(city.tradeRewardMultiplier).floor(); // Base 100 gold * multiplier

      const caravan: Caravan = {
        id: crypto.randomUUID(),
        targetCityId: cityId,
        startTime: Date.now(),
        returnTime: Date.now() + durationSec * 1000,
        reward: reward,
      };

      this.caravans.push(caravan);
      this.addEvent(
        `Caravan dispatched to ${city.name}. Returns in ${durationSec.toFixed(
          0
        )}s.`,
        'info'
      );
    },
    tick(deltaTimeMs: number) {
      // Passive Income
      const production = this.goldPerSecond.mul(deltaTimeMs / 1000);
      if (production.gt(0)) {
        this.gold = this.gold.add(production);
        this.lifetimeGold = this.lifetimeGold.add(production);
      }

      // Check Caravans
      const now = Date.now();
      const returnedCaravans = this.caravans.filter((c) => c.returnTime <= now);

      if (returnedCaravans.length > 0) {
        // Remove from list
        this.caravans = this.caravans.filter((c) => c.returnTime > now);

        returnedCaravans.forEach((c) => {
          this.gold = this.gold.add(c.reward);
          this.lifetimeGold = this.lifetimeGold.add(c.reward);
          const city = this.cities.find((city) => city.id === c.targetCityId);
          this.addEvent(
            `Caravan returned from ${city?.name || 'Unknown'} with ${this.formatNumber(c.reward)} gold.`,
            'success'
          );
        });
      }
    },
    formatNumber(num: Decimal | number): string {
      return formatBn(num);
    },
  },
  // @ts-ignore
  persist: {
    afterRestore: (ctx) => {
      ctx.store.syncContent();
    },
  },
});
