import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { LogEvent, Caravan, Worker, Upgrade, City, Factor, OfflineProgress } from '../model';
import { bn, Decimal, formatNumber as formatBn } from '~/shared/lib/big-number';
import { useAchievementStore } from '~/entities/merchant-achievements';

const defaultWorkers: Worker[] = [
  {
    id: 'novice',
    name: 'Novice Merchant',
    baseCost: bn(10),
    costMultiplier: 1.18, // Increased from 1.15
    baseProduction: bn(0.1), // Reduced from 0.5
    count: 0,
    description: 'A beginner seeking fortune.',
  },
  {
    id: 'journeyman',
    name: 'Journeyman',
    baseCost: bn(50),
    costMultiplier: 1.18,
    baseProduction: bn(0.5), // Reduced from 3
    count: 0,
    description: 'Experienced in the local markets.',
  },
  {
    id: 'clerk',
    name: 'Guild Clerk',
    baseCost: bn(250),
    costMultiplier: 1.18,
    baseProduction: bn(2), // Reduced from 10
    count: 0,
    description: 'Keeps the books balanced and coins flowing.',
  },
  {
    id: 'guard',
    name: 'Caravan Guard',
    baseCost: bn(1000),
    costMultiplier: 1.18,
    baseProduction: bn(8), // Reduced from 50
    count: 0,
    description: 'Protects assets and ensures steady income.',
  },
  {
    id: 'banker',
    name: 'Master Banker',
    baseCost: bn(5000),
    costMultiplier: 1.2, // Increased from 1.15
    baseProduction: bn(30), // Reduced from 200
    count: 0,
    description: 'Invests gold to generate massive wealth.',
  },
  {
    id: 'treasurer',
    name: 'Royal Treasurer',
    baseCost: bn(25000),
    costMultiplier: 1.25, // Increased from 1.2
    baseProduction: bn(100), // Reduced from 450
    count: 0,
    description: "Manages the King's coffers... and yours.",
  },
  {
    id: 'spymaster',
    name: 'Spymaster',
    baseCost: bn(100000),
    costMultiplier: 1.25,
    baseProduction: bn(400), // Reduced from 1800
    count: 0,
    description: 'Information is more valuable than gold.',
  },
  {
    id: 'alchemist',
    name: 'High Alchemist',
    baseCost: bn(500000),
    costMultiplier: 1.3, // Increased from 1.25
    baseProduction: bn(2000), // Reduced from 8500
    count: 0,
    description: 'Transmutes base metals into pure profit.',
  },
  {
    id: 'dragon_tamer',
    name: 'Dragon Tamer',
    baseCost: bn(5000000),
    costMultiplier: 1.3,
    baseProduction: bn(15000), // Reduced from 75000
    count: 0,
    description: 'Extracts wealth from ancient hoards.',
  },
  {
    id: 'void_trader',
    name: 'Void Trader',
    baseCost: bn(1e9),
    costMultiplier: 1.35, // Increased from 1.3
    baseProduction: bn(100000), // Reduced from 5e6
    count: 0,
    description: 'Deals in goods that do not exist yet.',
  },
  {
    id: 'syndicate',
    name: 'Global Syndicate',
    baseCost: bn(10e9),
    costMultiplier: 1.35,
    baseProduction: bn(1e6), // Reduced from 100e6
    count: 0,
    description: 'A network spanning every continent.',
  },
  {
    id: 'mogul',
    name: 'Monopoly Mogul',
    baseCost: bn(100e9),
    costMultiplier: 1.4, // Increased from 1.3
    baseProduction: bn(10e6), // Reduced from 1e9
    count: 0,
    description: 'Owns everything, including the air you breathe.',
  },
  {
    id: 'temporal_merchant',
    name: 'Temporal Merchant',
    baseCost: bn(1e12),
    costMultiplier: 1.4,
    baseProduction: bn(100e6), // Reduced from 50e9
    count: 0,
    description: 'Sells artifacts from the future.',
  },
  {
    id: 'shifter',
    name: 'Dimensional Shifter',
    baseCost: bn(50e12),
    costMultiplier: 1.45, // Increased from 1.35
    baseProduction: bn(1e9), // Reduced from 500e9
    count: 0,
    description: 'Trades between parallel realities.',
  },
  {
    id: 'quantum_financier',
    name: 'Quantum Financier',
    baseCost: bn(1e15),
    costMultiplier: 1.5, // Increased from 1.4
    baseProduction: bn(10e9), // Reduced from 5e12
    count: 0,
    description: 'Invests in the probability of profit.',
  },
  {
    id: 'magnet',
    name: 'Stardust Magnet',
    baseCost: bn(10e15),
    costMultiplier: 1.5,
    baseProduction: bn(100e9), // Reduced from 50e12
    count: 0,
    description: 'Attracts rare materials from deep space.',
  },
  {
    id: 'architect',
    name: 'Celestial Architect',
    baseCost: bn(100e15),
    costMultiplier: 1.5,
    baseProduction: bn(1e12), // Reduced from 500e12
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
    const factors = ref<Factor[]>([]);
    const events = ref<LogEvent[]>([]);
    const lastTick = ref(Date.now());
    const lastSaveTime = ref(Date.now());
    const lastOfflineProgress = ref<OfflineProgress | null>(null);
    const showOfflineModal = ref(false);
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
      // Base multiplier from reputation (weaker)
      let multiplier = bn(reputationMultiplier.value).toNumber();
      const hasUpgrade = (id: string) =>
        !!upgrades.value.find((u) => u.id === id && u.purchased);

      // Changed to more additive approach - each upgrade adds a smaller bonus
      // Early upgrades: small additive bonuses
      if (hasUpgrade('ledger')) multiplier += 0.1; // Changed from *1.1 to +0.1
      if (hasUpgrade('double_entry')) multiplier += 0.15; // Changed from *1.2 to +0.15
      if (hasUpgrade('guild_hall')) multiplier += 0.3; // Changed from *1.5 to +0.3
      
      // Mid-game upgrades: moderate multiplicative (but weaker)
      if (hasUpgrade('royal_charter')) multiplier *= 1.5; // Reduced from 2.0
      if (hasUpgrade('black_market')) multiplier += 0.4; // Changed from *1.5 to +0.4
      if (hasUpgrade('philosopher_stone')) multiplier *= 1.8; // Reduced from 3.0
      
      // Late-game upgrades: still strong but balanced
      if (hasUpgrade('void_contract')) multiplier *= 1.5; // Reduced from 2.0
      if (hasUpgrade('offshore')) multiplier += 0.5; // Changed from *2.0 to +0.5
      if (hasUpgrade('neural_net')) multiplier *= 2.0; // Reduced from 3.0
      if (hasUpgrade('time_dilation')) multiplier *= 2.0; // Reduced from 3.0
      if (hasUpgrade('quantum_ledger')) multiplier *= 1.5; // Reduced from 2.0
      if (hasUpgrade('stellar_forge')) multiplier *= 2.5; // Reduced from 5.0

      // Achievement bonuses (production)
      try {
        const achievementStore = useAchievementStore();
        if (achievementStore.totalProductionBonus > 0) {
          multiplier *= 1 + achievementStore.totalProductionBonus / 100;
        }
      } catch (e) {
        // Achievement store might not be available yet
      }

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

      // Achievement bonuses (click)
      try {
        const achievementStore = useAchievementStore();
        if (achievementStore.totalClickBonus > 0) {
          power = power.mul(1 + achievementStore.totalClickBonus / 100);
        }
      } catch (e) {
        // Achievement store might not be available yet
      }

      // Reduced click power scaling from 5% to 2% of GPS
      const gps = bn(goldPerSecond.value);
      const gpsScaled = gps.mul(0.02); // Reduced from 0.05
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

      // Sync factors
      if (!factors.value) factors.value = [];
      factors.value.forEach((f) => {
        f.baseCost = bn(f.baseCost);
        f.upkeepCost = bn(f.upkeepCost);
        f.totalProfit = bn(f.totalProfit);
      });

      // Initialize lastSaveTime if missing
      if (!lastSaveTime.value) lastSaveTime.value = Date.now();
    }

    function clickResource() {
      const scaledPower = currentClickPower.value;
      gold.value = bn(gold.value).add(scaledPower);
      lifetimeGold.value = bn(lifetimeGold.value).add(scaledPower);

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

    function hireWorker(workerId: string, count: number = 1) {
      const worker = workers.value.find((w) => w.id === workerId);
      if (!worker) return;

      if (count <= 0) return;

      // Calculate total cost for multiple hires
      let totalCost = bn(0);
      let affordableCount = 0;

      for (let i = 0; i < count; i++) {
        const currentCost = bn(worker.baseCost).mul(
          Decimal.pow(worker.costMultiplier, worker.count + i)
        ).floor();
        const newTotal = totalCost.add(currentCost);
        
        if (bn(gold.value).gte(newTotal)) {
          totalCost = newTotal;
          affordableCount++;
        } else {
          break;
        }
      }

      if (affordableCount === 0) {
        addEvent(`Not enough gold to hire ${worker.name}.`, 'warning');
        return;
      }

      gold.value = bn(gold.value).sub(totalCost);
      worker.count += affordableCount;

      if (affordableCount === 1) {
        addEvent(
          `Hired ${worker.name} for ${formatNumber(totalCost)} gold.`,
          'success'
        );
      } else {
        addEvent(
          `Hired ${affordableCount}x ${worker.name} for ${formatNumber(totalCost)} gold.`,
          'success'
        );
      }
    }

    function getMaxAffordableWorkers(workerId: string): number {
      const worker = workers.value.find((w) => w.id === workerId);
      if (!worker) return 0;

      let totalCost = bn(0);
      let count = 0;
      const maxCheck = 1000; // Cap at 1000 to avoid infinite loops

      for (let i = 0; i < maxCheck; i++) {
        const currentCost = bn(worker.baseCost).mul(
          Decimal.pow(worker.costMultiplier, worker.count + i)
        ).floor();
        const newTotal = totalCost.add(currentCost);
        
        if (bn(gold.value).gte(newTotal)) {
          totalCost = newTotal;
          count++;
        } else {
          break;
        }
      }

      return count;
    }

    function buyUpgrade(upgradeId: string) {
      const upgrade = upgrades.value.find((u) => u.id === upgradeId);
      if (upgrade && !upgrade.purchased && bn(gold.value).gte(upgrade.cost)) {
        gold.value = bn(gold.value).sub(upgrade.cost);
        upgrade.purchased = true;
        addEvent(`Purchased upgrade: ${upgrade.name}`, 'success');
      }
    }

    function discoverCity(cityId: string) {
      const city = cities.value.find((c) => c.id === cityId);
      if (city && !city.unlocked && bn(gold.value).gte(city.discoveryCost)) {
        gold.value = bn(gold.value).sub(city.discoveryCost);
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
      // Reduced base reward from 100 to 20
      const baseReward = bn(20).mul(city.tradeRewardMultiplier).floor();
      // Reduced multiplier from 0.5 to 0.15 (70% reduction)
      const scaledReward = goldPerSecond.value
        .mul(durationSec)
        .mul(0.15)
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

    // Factor Management Functions
    function getFactorCost(cityId: string): Decimal {
      const city = cities.value.find((c) => c.id === cityId);
      if (!city || !city.unlocked) return bn(0);
      
      // Base cost scales with city distance and reward multiplier
      const baseCost = bn(10000).mul(city.distanceMultiplier).mul(city.tradeRewardMultiplier);
      return baseCost.floor();
    }

    function getFactorUpkeep(cityId: string, level: number = 1): Decimal {
      const city = cities.value.find((c) => c.id === cityId);
      if (!city) return bn(0);
      
      // Upkeep increases with level: base * (1 + 0.2 * level)
      const baseUpkeep = bn(10).mul(city.distanceMultiplier);
      const levelMultiplier = 1 + 0.2 * (level - 1);
      return baseUpkeep.mul(levelMultiplier).floor();
    }

    function getFactorEfficiency(level: number): number {
      // Level 1: 50%, Level 5: 100%
      return 0.5 + (level - 1) * 0.125;
    }

    function hireFactor(cityId: string) {
      const city = cities.value.find((c) => c.id === cityId);
      if (!city || !city.unlocked) {
        addEvent(`City ${city?.name || cityId} is not unlocked.`, 'warning');
        return;
      }

      // Check if factor already exists
      const existing = factors.value.find((f) => f.cityId === cityId);
      if (existing && existing.hired) {
        addEvent(`A Factor is already managing ${city.name}.`, 'warning');
        return;
      }

      const cost = getFactorCost(cityId);
      if (!canAfford(cost)) {
        addEvent(`Cannot afford to hire Factor for ${city.name}.`, 'warning');
        return;
      }

      gold.value = bn(gold.value).sub(cost);

      const factor: Factor = {
        id: crypto.randomUUID(),
        cityId: cityId,
        name: `Factor of ${city.name}`,
        level: 1,
        baseCost: cost,
        upkeepCost: getFactorUpkeep(cityId, 1),
        efficiency: getFactorEfficiency(1),
        lastTradeTime: Date.now(),
        tradeInterval: 30000, // 30 seconds base
        totalTrades: 0,
        totalProfit: bn(0),
        hired: true,
      };

      if (existing) {
        // Update existing factor
        Object.assign(existing, factor);
      } else {
        factors.value.push(factor);
      }

      addEvent(`Hired Factor to manage ${city.name} for ${formatNumber(cost)} gold.`, 'success');
    }

    function upgradeFactor(cityId: string) {
      const factor = factors.value.find((f) => f.cityId === cityId && f.hired);
      if (!factor) {
        addEvent('No active Factor found for this city.', 'warning');
        return;
      }

      if (factor.level >= 5) {
        addEvent('Factor is already at maximum level.', 'warning');
        return;
      }

      const upgradeCost = getFactorCost(factor.cityId).mul(Decimal.pow(2, factor.level));
      if (!canAfford(upgradeCost)) {
        addEvent(`Cannot afford to upgrade Factor (${formatNumber(upgradeCost)} gold).`, 'warning');
        return;
      }

      gold.value = bn(gold.value).sub(upgradeCost);
      factor.level++;
      factor.efficiency = getFactorEfficiency(factor.level);
      factor.upkeepCost = getFactorUpkeep(factor.cityId, factor.level);
      factor.tradeInterval = Math.max(10000, 30000 - (factor.level - 1) * 4000); // Faster trades at higher levels

      addEvent(
        `Upgraded Factor in ${cities.value.find((c) => c.id === cityId)?.name} to level ${factor.level}.`,
        'success'
      );
    }

    function fireFactor(cityId: string) {
      const factor = factors.value.find((f) => f.cityId === cityId);
      if (!factor || !factor.hired) {
        addEvent('No active Factor to fire.', 'warning');
        return;
      }

      factor.hired = false;
      const city = cities.value.find((c) => c.id === cityId);
      addEvent(`Fired Factor from ${city?.name || cityId}.`, 'info');
    }

    function processFactorTrades(deltaTimeMs: number) {
      const now = Date.now();
      let totalUpkeep = bn(0);

      factors.value
        .filter((f) => f.hired)
        .forEach((factor) => {
          // Deduct upkeep
          const upkeep = bn(factor.upkeepCost).mul(deltaTimeMs / 1000);
          totalUpkeep = totalUpkeep.add(upkeep);
          gold.value = bn(gold.value).sub(upkeep);

          // Process automatic trades
          const timeSinceLastTrade = now - factor.lastTradeTime;
          if (timeSinceLastTrade >= factor.tradeInterval) {
            const city = cities.value.find((c) => c.id === factor.cityId);
            if (city) {
              // Calculate trade reward (similar to caravan, but scaled by efficiency)
              // Reduced base reward from 100 to 15
              const baseReward = bn(15).mul(city.tradeRewardMultiplier).floor();
              // Reduced multiplier from 0.3 to 0.1 (67% reduction)
              const scaledReward = goldPerSecond.value
                .mul(factor.tradeInterval / 1000)
                .mul(0.1) // Factors are less efficient than manual caravans
                .mul(city.tradeRewardMultiplier)
                .mul(factor.efficiency)
                .floor();

              const reward = baseReward.gt(scaledReward) ? baseReward : scaledReward;

              gold.value = bn(gold.value).add(reward);
              lifetimeGold.value = bn(lifetimeGold.value).add(reward);
              stats.value.totalGoldFromTrade = stats.value.totalGoldFromTrade.add(reward);

              factor.totalTrades++;
              factor.totalProfit = factor.totalProfit.add(reward);
              factor.lastTradeTime = now;

              // Only log every 10th trade to avoid spam
              if (factor.totalTrades % 10 === 0) {
                addEvent(
                  `Factor in ${city.name} completed trade #${factor.totalTrades} (+${formatNumber(reward)} gold).`,
                  'info'
                );
              }
            }
          }
        });

      // Warn if upkeep is too high
      if (totalUpkeep.gt(bn(gold.value).mul(0.1)) && totalUpkeep.gt(0)) {
        // Only warn once per minute to avoid spam
        const lastWarning = events.value
          .filter((e) => e.type === 'warning' && e.message.includes('upkeep'))
          .pop();
        if (!lastWarning || now - lastWarning.timestamp > 60000) {
          addEvent(
            `Factor upkeep is high: ${formatNumber(totalUpkeep)}/s. Consider firing some Factors.`,
            'warning'
          );
        }
      }
    }

    function calculateOfflineProgress() {
      const now = Date.now();
      const offlineTime = now - lastSaveTime.value;
      
      // Only calculate if offline for more than 5 seconds
      if (offlineTime < 5000) {
        lastSaveTime.value = now;
        return null;
      }

      // Cap offline progress at 24 hours
      const maxOfflineTime = 24 * 60 * 60 * 1000;
      const effectiveOfflineTime = Math.min(offlineTime, maxOfflineTime);
      
      // Calculate offline efficiency (decreases over time, but has bonuses)
      const hoursOffline = effectiveOfflineTime / (60 * 60 * 1000);
      let efficiency = 0.8; // Base 80% efficiency
      
      // Bonus for longer offline time (up to 10% bonus for 12+ hours)
      if (hoursOffline >= 12) {
        efficiency = 0.9; // 90% for 12+ hours
      } else if (hoursOffline >= 6) {
        efficiency = 0.85; // 85% for 6-12 hours
      }

      // Initialize progress tracking
      const progress: OfflineProgress = {
        offlineTime: effectiveOfflineTime,
        goldEarned: bn(0),
        goldFromProduction: bn(0),
        goldFromCaravans: bn(0),
        goldFromFactors: bn(0),
        caravansReturned: 0,
        factorTradesCompleted: 0,
        eventsOccurred: 0,
        efficiency,
      };

      // Process production (with efficiency penalty)
      const totalTime = effectiveOfflineTime / 1000; // in seconds
      const production = goldPerSecond.value.mul(totalTime).mul(efficiency);
      if (production.gt(0)) {
        gold.value = bn(gold.value).add(production);
        lifetimeGold.value = bn(lifetimeGold.value).add(production);
        progress.goldFromProduction = production;
      }

      // Process caravans (simulate each caravan individually)
      const activeCaravans = [...caravans.value];
      let caravansReturned = 0;
      let goldFromCaravans = bn(0);

      activeCaravans.forEach((caravan) => {
        if (caravan.returnTime <= now) {
          // Caravan returned
          const reward = bn(caravan.reward);
          
          // Random events during offline (bandit attacks, etc.)
          let finalReward = reward;
          const eventRoll = Math.random();
          
          if (eventRoll < 0.1) {
            // 10% chance of bandit attack - lose 20-40% of reward
            const lossPercent = 0.2 + Math.random() * 0.2;
            finalReward = reward.mul(1 - lossPercent).floor();
            progress.eventsOccurred++;
            addEvent(
              `Caravan to ${cities.value.find((c) => c.id === caravan.targetCityId)?.name || 'Unknown'} was attacked by bandits during your absence. Lost ${formatNumber(reward.sub(finalReward))} gold.`,
              'warning'
            );
          } else if (eventRoll < 0.15) {
            // 5% chance of favorable market - gain 10-20% bonus
            const bonusPercent = 0.1 + Math.random() * 0.1;
            finalReward = reward.mul(1 + bonusPercent).floor();
            progress.eventsOccurred++;
            addEvent(
              `Favorable market conditions in ${cities.value.find((c) => c.id === caravan.targetCityId)?.name || 'Unknown'} increased caravan profits by ${formatNumber(finalReward.sub(reward))} gold.`,
              'success'
            );
          }

          gold.value = bn(gold.value).add(finalReward);
          lifetimeGold.value = bn(lifetimeGold.value).add(finalReward);
          stats.value.totalGoldFromTrade = stats.value.totalGoldFromTrade.add(finalReward);
          goldFromCaravans = goldFromCaravans.add(finalReward);
          caravansReturned++;
        }
      });

      // Remove returned caravans
      caravans.value = caravans.value.filter((c) => c.returnTime > now);
      progress.caravansReturned = caravansReturned;
      progress.goldFromCaravans = goldFromCaravans;

      // Process factor trades (more detailed simulation)
      let factorTradesCompleted = 0;
      let goldFromFactors = bn(0);
      let totalFactorUpkeep = bn(0);

      factors.value
        .filter((f) => f.hired)
        .forEach((factor) => {
          const city = cities.value.find((c) => c.id === factor.cityId);
          if (!city) return;

          // Calculate how many trades happened
          const timeSinceLastTrade = now - factor.lastTradeTime;
          const trades = Math.floor(timeSinceLastTrade / factor.tradeInterval);
          
          if (trades > 0) {
            const rewardPerTrade = bn(15)
              .mul(city.tradeRewardMultiplier)
              .mul(factor.efficiency)
              .mul(efficiency) // Apply offline efficiency
              .floor();
            
            const totalReward = rewardPerTrade.mul(trades);

            gold.value = bn(gold.value).add(totalReward);
            lifetimeGold.value = bn(lifetimeGold.value).add(totalReward);
            stats.value.totalGoldFromTrade = stats.value.totalGoldFromTrade.add(totalReward);

            factor.totalTrades += trades;
            factor.totalProfit = factor.totalProfit.add(totalReward);
            factor.lastTradeTime = now;
            
            goldFromFactors = goldFromFactors.add(totalReward);
            factorTradesCompleted += trades;
          }

          // Deduct upkeep
          const upkeep = bn(factor.upkeepCost).mul(effectiveOfflineTime / 1000);
          gold.value = bn(gold.value).sub(upkeep);
          totalFactorUpkeep = totalFactorUpkeep.add(upkeep);
        });

      progress.factorTradesCompleted = factorTradesCompleted;
      progress.goldFromFactors = goldFromFactors;

      // Update last trade times for factors
      factors.value
        .filter((f) => f.hired)
        .forEach((factor) => {
          factor.lastTradeTime = now;
        });

      // Calculate total gold earned
      progress.goldEarned = progress.goldFromProduction
        .add(progress.goldFromCaravans)
        .add(progress.goldFromFactors)
        .sub(totalFactorUpkeep);

      // Store progress and show modal if significant
      lastOfflineProgress.value = progress;
      
      const offlineMinutes = Math.floor(effectiveOfflineTime / 60000);
      if (offlineMinutes > 0) {
        // Show modal if offline for more than 1 minute
        if (offlineMinutes >= 1) {
          showOfflineModal.value = true;
        }
        
        addEvent(
          `Welcome back! You were away for ${formatOfflineTime(effectiveOfflineTime)}. Earned ${formatNumber(progress.goldEarned)} gold.`,
          'success'
        );
      }

      lastSaveTime.value = now;
      return progress;
    }

    function formatOfflineTime(ms: number): string {
      const hours = Math.floor(ms / (60 * 60 * 1000));
      const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
      
      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      }
      return `${minutes}m`;
    }

    function tick(deltaTimeMs: number) {
      const production = goldPerSecond.value.mul(deltaTimeMs / 1000);
      if (production.gt(0)) {
        gold.value = bn(gold.value).add(production);
        lifetimeGold.value = bn(lifetimeGold.value).add(production);
      }

      const now = Date.now();
      const returned = caravans.value.filter((c) => c.returnTime <= now);
      if (returned.length > 0) {
        caravans.value = caravans.value.filter((c) => c.returnTime > now);
        returned.forEach((c) => {
          gold.value = bn(gold.value).add(c.reward);
          lifetimeGold.value = bn(lifetimeGold.value).add(c.reward);
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

      // Process factor trades
      processFactorTrades(deltaTimeMs);
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
      factors.value = [];

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

    // Computed for factors
    const activeFactors = computed(() => factors.value.filter((f) => f.hired));
    const totalFactorUpkeep = computed(() => {
      return activeFactors.value.reduce((total, factor) => {
        return total.add(factor.upkeepCost);
      }, bn(0));
    });

    // Dev functions
    function devAddGold(amount: Decimal | number) {
      const amountBn = bn(amount);
      gold.value = bn(gold.value).add(amountBn);
      lifetimeGold.value = bn(lifetimeGold.value).add(amountBn);
      addEvent(`[DEV] Added ${formatNumber(amountBn)} gold.`, 'success');
    }

    function devResetProgress() {
      gold.value = bn(0);
      lifetimeGold.value = bn(0);
      clickPower.value = 1;
      workers.value = JSON.parse(JSON.stringify(defaultWorkers));
      upgrades.value = JSON.parse(JSON.stringify(defaultUpgrades));
      cities.value = JSON.parse(JSON.stringify(defaultCities));
      caravans.value = [];
      factors.value = [];
      events.value = [];
      reputation.value = bn(0);
      reputationUpgrades.value = [];
      stats.value = {
        totalClicks: 0,
        totalGoldFromClicks: bn(0),
        totalGoldFromTrade: bn(0),
        prestigeCount: 0,
        startTime: Date.now(),
        lastPrestigeTime: Date.now(),
      };
      lastTick.value = Date.now();
      lastSaveTime.value = Date.now();
      syncContent();
      addEvent('[DEV] Game progress reset.', 'info');
    }

    function devUnlockAllCities() {
      cities.value.forEach((city) => {
        city.unlocked = true;
      });
      addEvent('[DEV] All cities unlocked.', 'success');
    }

    function devBuyAllUpgrades() {
      upgrades.value.forEach((upgrade) => {
        if (!upgrade.purchased) {
          upgrade.purchased = true;
        }
      });
      addEvent('[DEV] All upgrades purchased.', 'success');
    }

    function devHireAllWorkers(count: number = 10) {
      workers.value.forEach((worker) => {
        worker.count += count;
      });
      addEvent(`[DEV] Hired ${count} of each worker.`, 'success');
    }

    function devSetReputation(amount: Decimal | number) {
      reputation.value = bn(amount);
      addEvent(`[DEV] Reputation set to ${formatNumber(amount)}.`, 'success');
    }

    return {
      gold,
      lifetimeGold,
      clickPower,
      workers,
      upgrades,
      cities,
      caravans,
      factors,
      events,
      lastTick,
      lastSaveTime,
      lastOfflineProgress,
      showOfflineModal,
      reputation,
      reputationUpgrades,
      stats,
      goldPerSecond,
      currentClickPower,
      recentEvents,
      prestigeGain,
      reputationMultiplier,
      activeFactors,
      totalFactorUpkeep,
      formatNumber,
      addEvent,
      syncContent,
      clickResource,
      getWorkerCost,
      getWorkerTotal,
      hireWorker,
      getMaxAffordableWorkers,
      buyUpgrade,
      discoverCity,
      sendCaravan,
      getFactorCost,
      getFactorUpkeep,
      hireFactor,
      upgradeFactor,
      fireFactor,
      calculateOfflineProgress,
      formatOfflineTime,
      tick,
      prestige,
      canAfford,
      // Dev functions
      devAddGold,
      devResetProgress,
      devUnlockAllCities,
      devBuyAllUpgrades,
      devHireAllWorkers,
      devSetReputation,
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

