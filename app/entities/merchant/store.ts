import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { LogEvent, Caravan, Worker, Upgrade, City } from './model';
import { bn, Decimal, formatNumber as formatBn } from '~/shared/lib/big-number';

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
  {
    id: 'treasurer',
    name: 'Royal Treasurer',
    baseCost: bn(25000),
    costMultiplier: 1.2,
    baseProduction: bn(450),
    count: 0,
    description: "Manages the King's coffers... and yours.",
  },
  {
    id: 'spymaster',
    name: 'Spymaster',
    baseCost: bn(100000),
    costMultiplier: 1.2,
    baseProduction: bn(1800),
    count: 0,
    description: 'Information is more valuable than gold.',
  },
  {
    id: 'alchemist',
    name: 'High Alchemist',
    baseCost: bn(500000),
    costMultiplier: 1.25,
    baseProduction: bn(8500),
    count: 0,
    description: 'Transmutes base metals into pure profit.',
  },
  {
    id: 'dragon_tamer',
    name: 'Dragon Tamer',
    baseCost: bn(5000000),
    costMultiplier: 1.25,
    baseProduction: bn(75000),
    count: 0,
    description: 'Extracts wealth from ancient hoards.',
  },
  {
    id: 'void_trader',
    name: 'Void Trader',
    baseCost: bn(1e9),
    costMultiplier: 1.3,
    baseProduction: bn(5e6),
    count: 0,
    description: 'Deals in goods that do not exist yet.',
  },
  {
    id: 'syndicate',
    name: 'Global Syndicate',
    baseCost: bn(10e9),
    costMultiplier: 1.3,
    baseProduction: bn(100e6),
    count: 0,
    description: 'A network spanning every continent.',
  },
  {
    id: 'mogul',
    name: 'Monopoly Mogul',
    baseCost: bn(100e9),
    costMultiplier: 1.3,
    baseProduction: bn(1e9),
    count: 0,
    description: 'Owns everything, including the air you breathe.',
  },
  {
    id: 'temporal_merchant',
    name: 'Temporal Merchant',
    baseCost: bn(1e12),
    costMultiplier: 1.35,
    baseProduction: bn(50e9),
    count: 0,
    description: 'Sells artifacts from the future.',
  },
  {
    id: 'shifter',
    name: 'Dimensional Shifter',
    baseCost: bn(50e12),
    costMultiplier: 1.35,
    baseProduction: bn(500e9),
    count: 0,
    description: 'Trades between parallel realities.',
  },
  {
    id: 'quantum_financier',
    name: 'Quantum Financier',
    baseCost: bn(1e15),
    costMultiplier: 1.4,
    baseProduction: bn(5e12),
    count: 0,
    description: 'Invests in the probability of profit.',
  },
  {
    id: 'magnet',
    name: 'Stardust Magnet',
    baseCost: bn(10e15),
    costMultiplier: 1.4,
    baseProduction: bn(50e12),
    count: 0,
    description: 'Attracts rare materials from deep space.',
  },
  {
    id: 'architect',
    name: 'Celestial Architect',
    baseCost: bn(100e15),
    costMultiplier: 1.4,
    baseProduction: bn(500e12),
    count: 0,
    description: 'Builds dyson spheres to forge gold from stars.',
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
  {
    id: 'royal_charter',
    name: 'Royal Charter',
    cost: bn(100000),
    description: 'Doubles all worker production.',
    effect: () => {},
    purchased: false,
  },
  {
    id: 'black_market',
    name: 'Black Market Connections',
    cost: bn(250000),
    description: 'Increases production by 50%.',
    effect: () => {},
    purchased: false,
  },
  {
    id: 'philosopher_stone',
    name: "Philosopher's Stone",
    cost: bn(1000000),
    description: 'Triples all worker production.',
    effect: () => {},
    purchased: false,
  },
  {
    id: 'void_contract',
    name: 'Void Contract',
    cost: bn(10e9),
    description: 'Doubles all worker production (Again).',
    effect: () => {},
    purchased: false,
  },
  {
    id: 'offshore',
    name: 'Offshore Accounts',
    cost: bn(100e9),
    description: 'Workers produce 100% more gold.',
    effect: () => {},
    purchased: false,
  },
  {
    id: 'neural_net',
    name: 'Neural Network Trading',
    cost: bn(10e12),
    description: 'Triples all worker production.',
    effect: () => {},
    purchased: false,
  },
  {
    id: 'time_dilation',
    name: 'Time Dilation',
    cost: bn(50e12),
    description: 'Triples all worker production.',
    effect: () => {},
    purchased: false,
  },
  {
    id: 'quantum_ledger',
    name: 'Quantum Ledger',
    cost: bn(1e15),
    description: 'Doubles all worker production.',
    effect: () => {},
    purchased: false,
  },
  {
    id: 'stellar_forge',
    name: 'Stellar Forge',
    cost: bn(1e18),
    description: 'Quintuples all worker production.',
    effect: () => {},
    purchased: false,
  },
];

const defaultCities: City[] = [
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
  {
    id: 'sunken_city',
    name: 'Sunken City',
    description: 'Ancient ruins filled with damp treasure.',
    coordinates: { x: 20, y: 20 },
    unlocked: false,
    discoveryCost: bn(50000),
    distanceMultiplier: 3.0,
    tradeRewardMultiplier: 5.0,
  },
  {
    id: 'cloud_sanctuary',
    name: 'Cloud Sanctuary',
    description: 'A floating haven for the elite.',
    coordinates: { x: 50, y: 10 },
    unlocked: false,
    discoveryCost: bn(250000),
    distanceMultiplier: 5.0,
    tradeRewardMultiplier: 10.0,
  },
  {
    id: 'demon_wastes',
    name: 'Demon Wastes',
    description: 'High risk, infinite reward.',
    coordinates: { x: 90, y: 90 },
    unlocked: false,
    discoveryCost: bn(1000000),
    distanceMultiplier: 8.0,
    tradeRewardMultiplier: 25.0,
  },
  {
    id: 'abyss',
    name: 'The Abyss',
    description: 'A chasm that stares back.',
    coordinates: { x: 10, y: 90 },
    unlocked: false,
    discoveryCost: bn(5e9),
    distanceMultiplier: 15.0,
    tradeRewardMultiplier: 50.0,
  },
  {
    id: 'star_haven',
    name: 'Star Haven',
    description: 'A trading post on a comet.',
    coordinates: { x: 95, y: 5 },
    unlocked: false,
    discoveryCost: bn(100e12),
    distanceMultiplier: 25.0,
    tradeRewardMultiplier: 200.0,
  },
];

export const useMerchantStore = defineStore(
  'merchant-store',
  () => {
    // State
    const gold = ref(bn(0));
    const lifetimeGold = ref(bn(0));
    const clickPower = ref(1);
    const workers = ref<Worker[]>(JSON.parse(JSON.stringify(defaultWorkers)));
    const upgrades = ref<Upgrade[]>(
      JSON.parse(JSON.stringify(defaultUpgrades))
    );
    const cities = ref<City[]>(JSON.parse(JSON.stringify(defaultCities)));
    const caravans = ref<Caravan[]>([]);
    const events = ref<LogEvent[]>([]);
    const lastTick = ref(Date.now());
    const reputation = ref(bn(0));
    const reputationUpgrades = ref<string[]>([]);
    const stats = ref({
      totalClicks: 0,
      totalGoldFromClicks: bn(0),
      totalGoldFromTrade: bn(0),
      prestigeCount: 0,
      startTime: Date.now(),
      lastPrestigeTime: Date.now(),
    });

    // Getters
    const prestigeGain = computed((): Decimal => {
      const lg = bn(lifetimeGold.value);
      if (lg.lt(1e12)) return bn(0);
      return lg.div(1e12).sqrt().floor();
    });

    const reputationMultiplier = computed((): Decimal => {
      // 5% bonus per reputation point
      const rep = bn(reputation.value);
      return bn(1).add(rep.mul(0.05));
    });

    const goldPerSecond = computed((): Decimal => {
      let multiplier = bn(reputationMultiplier.value).toNumber();
      const hasUpgrade = (id: string) =>
        !!upgrades.value.find((u) => u.id === id && u.purchased);

      if (hasUpgrade('ledger')) multiplier *= 1.1;
      if (hasUpgrade('double_entry')) multiplier *= 1.2;
      if (hasUpgrade('guild_hall')) multiplier *= 1.5;
      if (hasUpgrade('royal_charter')) multiplier *= 2.0;
      if (hasUpgrade('black_market')) multiplier *= 1.5;
      if (hasUpgrade('philosopher_stone')) multiplier *= 3.0;
      if (hasUpgrade('void_contract')) multiplier *= 2.0;
      if (hasUpgrade('offshore')) multiplier *= 2.0;
      if (hasUpgrade('neural_net')) multiplier *= 3.0;
      if (hasUpgrade('time_dilation')) multiplier *= 3.0;
      if (hasUpgrade('quantum_ledger')) multiplier *= 2.0;
      if (hasUpgrade('stellar_forge')) multiplier *= 5.0;

      return workers.value
        .reduce((total, worker) => {
          const prod = bn(worker.baseProduction).mul(worker.count);
          return total.add(prod);
        }, bn(0))
        .mul(multiplier);
    });

    const currentClickPower = computed((): Decimal => {
      let power = bn(clickPower.value);
      const hasUpgrade = (id: string) =>
        !!upgrades.value.find((u) => u.id === id && u.purchased);

      if (hasUpgrade('iron_stylus')) power = power.mul(2);
      if (hasUpgrade('gem_stylus')) power = power.mul(3);

      const gps = bn(goldPerSecond.value);
      const gpsScaled = gps.mul(0.05);
      return power.gt(gpsScaled) ? power : gpsScaled;
    });

    const recentEvents = computed(() =>
      events.value.slice().reverse().slice(0, 50)
    );

    // Actions
    function canAfford(cost: Decimal | number): boolean {
      return bn(gold.value).gte(bn(cost));
    }

    function formatNumber(num: Decimal | number): string {
      return formatBn(bn(num));
    }

    function addEvent(message: string, type: LogEvent['type'] = 'info') {
      events.value.push({
        id: crypto.randomUUID(),
        message,
        timestamp: Date.now(),
        type,
      });
      if (events.value.length > 100) {
        events.value.shift();
      }
    }

    function syncContent() {
      gold.value = bn(gold.value);
      lifetimeGold.value = bn(lifetimeGold.value);
      reputation.value = bn(reputation.value || 0);
      if (!reputationUpgrades.value) reputationUpgrades.value = [];

      // Stats hydration
      if (!stats.value) {
        stats.value = {
          totalClicks: 0,
          totalGoldFromClicks: bn(0),
          totalGoldFromTrade: bn(0),
          prestigeCount: 0,
          startTime: Date.now(),
          lastPrestigeTime: Date.now(),
        };
      } else {
        stats.value.totalGoldFromClicks = bn(stats.value.totalGoldFromClicks);
        stats.value.totalGoldFromTrade = bn(stats.value.totalGoldFromTrade);
        // Ensure other fields are present
        if (stats.value.totalClicks === undefined) stats.value.totalClicks = 0;
        if (stats.value.prestigeCount === undefined)
          stats.value.prestigeCount = 0;
        if (!stats.value.startTime) stats.value.startTime = Date.now();
        if (!stats.value.lastPrestigeTime)
          stats.value.lastPrestigeTime = Date.now();
      }

      workers.value.forEach((worker) => {
        worker.baseCost = bn(worker.baseCost);
        worker.baseProduction = bn(worker.baseProduction);
      });

      defaultWorkers.forEach((defWorker) => {
        const existing = workers.value.find((w) => w.id === defWorker.id);
        if (!existing) {
          const newWorker = JSON.parse(JSON.stringify(defWorker));
          newWorker.baseCost = bn(newWorker.baseCost);
          newWorker.baseProduction = bn(newWorker.baseProduction);
          workers.value.push(newWorker);
        }
      });

      upgrades.value.forEach((u) => {
        u.cost = bn(u.cost);
      });

      defaultUpgrades.forEach((defUpgrade) => {
        const existing = upgrades.value.find((u) => u.id === defUpgrade.id);
        if (!existing) {
          const newUpgrade = JSON.parse(JSON.stringify(defUpgrade));
          newUpgrade.cost = bn(newUpgrade.cost);
          upgrades.value.push(newUpgrade);
        }
      });

      cities.value.forEach((c) => {
        c.discoveryCost = bn(c.discoveryCost);
      });

      defaultCities.forEach((defCity) => {
        const existing = cities.value.find((c) => c.id === defCity.id);
        if (!existing) {
          const newCity = JSON.parse(JSON.stringify(defCity));
          newCity.discoveryCost = bn(newCity.discoveryCost);
          cities.value.push(newCity);
        }
      });

      caravans.value.forEach((c) => {
        c.reward = bn(c.reward);
      });
    }

    function clickResource() {
      const scaledPower = currentClickPower.value;
      gold.value = gold.value.add(scaledPower);
      lifetimeGold.value = lifetimeGold.value.add(scaledPower);

      // Update stats
      stats.value.totalClicks++;
      stats.value.totalGoldFromClicks =
        stats.value.totalGoldFromClicks.add(scaledPower);
    }

    function getWorkerCost(workerId: string): Decimal {
      const worker = workers.value.find((w) => w.id === workerId);
      if (!worker) return bn(0);
      return bn(worker.baseCost)
        .mul(Decimal.pow(worker.costMultiplier, worker.count))
        .floor();
    }

    function getWorkerTotal(worker: Worker): Decimal {
      return bn(worker.baseProduction).mul(worker.count);
    }

    function hireWorker(workerId: string) {
      const worker = workers.value.find((w) => w.id === workerId);
      if (!worker) return;

      const cost = getWorkerCost(workerId);

      if (gold.value.gte(cost)) {
        gold.value = gold.value.sub(cost);
        worker.count++;
        addEvent(
          `Hired ${worker.name} for ${formatNumber(cost)} gold.`,
          'success'
        );
      } else {
        addEvent(`Not enough gold to hire ${worker.name}.`, 'warning');
      }
    }

    function buyUpgrade(upgradeId: string) {
      const upgrade = upgrades.value.find((u) => u.id === upgradeId);
      if (upgrade && !upgrade.purchased && gold.value.gte(upgrade.cost)) {
        gold.value = gold.value.sub(upgrade.cost);
        upgrade.purchased = true;
        addEvent(`Purchased upgrade: ${upgrade.name}`, 'success');
      }
    }

    function discoverCity(cityId: string) {
      const city = cities.value.find((c) => c.id === cityId);
      if (city && !city.unlocked && gold.value.gte(city.discoveryCost)) {
        gold.value = gold.value.sub(city.discoveryCost);
        city.unlocked = true;
        addEvent(`Discovered trade route to ${city.name}!`, 'success');
      }
    }

    function sendCaravan(cityId: string) {
      const city = cities.value.find((c) => c.id === cityId);
      if (!city || !city.unlocked) return;

      if (caravans.value.some((c) => c.targetCityId === cityId)) {
        addEvent(`A caravan is already en route to ${city.name}.`, 'warning');
        return;
      }

      const durationSec = 10 * city.distanceMultiplier;
      const baseReward = bn(100).mul(city.tradeRewardMultiplier).floor();
      const scaledReward = goldPerSecond.value
        .mul(durationSec)
        .mul(0.5)
        .mul(city.tradeRewardMultiplier)
        .floor();

      const reward = baseReward.gt(scaledReward) ? baseReward : scaledReward;

      caravans.value.push({
        id: crypto.randomUUID(),
        targetCityId: cityId,
        startTime: Date.now(),
        returnTime: Date.now() + durationSec * 1000,
        reward,
      });

      addEvent(
        `Caravan dispatched to ${city.name}. Returns in ${durationSec.toFixed(0)}s.`,
        'info'
      );
    }

    function tick(deltaTimeMs: number) {
      const production = goldPerSecond.value.mul(deltaTimeMs / 1000);
      if (production.gt(0)) {
        gold.value = gold.value.add(production);
        lifetimeGold.value = lifetimeGold.value.add(production);
      }

      const now = Date.now();
      const returned = caravans.value.filter((c) => c.returnTime <= now);
      if (returned.length > 0) {
        caravans.value = caravans.value.filter((c) => c.returnTime > now);
        returned.forEach((c) => {
          gold.value = gold.value.add(c.reward);
          lifetimeGold.value = lifetimeGold.value.add(c.reward);
          stats.value.totalGoldFromTrade = stats.value.totalGoldFromTrade.add(
            c.reward
          );
          const city = cities.value.find((city) => city.id === c.targetCityId);
          addEvent(
            `Caravan returned from ${city?.name || 'Unknown'} with ${formatNumber(c.reward)} gold.`,
            'success'
          );
        });
      }
    }

    function prestige() {
      const gain = prestigeGain.value;
      if (gain.lte(0)) return;

      reputation.value = reputation.value.add(gain);

      // Update stats
      stats.value.prestigeCount++;
      stats.value.lastPrestigeTime = Date.now();

      // Reset game state
      gold.value = bn(0);
      workers.value = JSON.parse(JSON.stringify(defaultWorkers));
      upgrades.value = JSON.parse(JSON.stringify(defaultUpgrades));
      cities.value = JSON.parse(JSON.stringify(defaultCities));
      caravans.value = [];

      syncContent();

      addEvent(
        `You have ascended! Gained ${formatNumber(
          gain
        )} Reputation. Guild production increased by ${reputationMultiplier.value
          .sub(1)
          .mul(100)
          .toFixed(0)}%.`,
        'success'
      );
    }

    return {
      gold,
      lifetimeGold,
      clickPower,
      workers,
      upgrades,
      cities,
      caravans,
      events,
      lastTick,
      reputation,
      reputationUpgrades,
      stats,
      goldPerSecond,
      currentClickPower,
      recentEvents,
      prestigeGain,
      reputationMultiplier,
      formatNumber,
      addEvent,
      syncContent,
      clickResource,
      getWorkerCost,
      getWorkerTotal,
      hireWorker,
      buyUpgrade,
      discoverCity,
      sendCaravan,
      tick,
      prestige,
      canAfford,
    };
  },
  {
    persist: {
      key: 'merchant-idle-save',
      // @ts-expect-error - Pinia types might not see afterRestore but it is used by the plugin
      afterRestore: (ctx) => {
        ctx.store.syncContent();
      },
    },
  }
);
