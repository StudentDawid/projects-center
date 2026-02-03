/**
 * Merchant Store - manages the Merchant path
 * Handles shop, trade routes, customers, market
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { bn, Decimal } from '@shared/lib/big-number';
import { useAteriaResourcesStore } from '../../core/model/resources.store';
import { useAteriaGameStore } from '../../core/model/game.store';
import type {
  MerchantStats,
  Shop,
  ShopDisplayItem,
  ShopStorageItem,
  ShopDecoration,
  Customer,
  CustomerType,
  CustomerState,
  Caravan,
  CaravanState,
  CaravanCargo,
  TradeRoute,
  MarketPrice,
  MarketModifier,
  AmbushOutcome,
  ReputationTier,
  CityId,
} from '@ateria-idle/entities/ateria-idle/merchant';
import {
  CITIES,
  TRADE_ROUTES,
  SHOP_DECORATIONS,
  CUSTOMER_CONFIGS,
  CUSTOMER_NAMES,
  CUSTOMER_ICONS,
  CUSTOMER_COLORS,
  getReputationTier,
  getUnlockedRoutes,
  getAvailableCustomerTypes,
  getRandomCustomerName,
  getTradeRoute,
  getCity,
  REPUTATION_NAMES,
  REPUTATION_COLORS,
} from '../../data/merchant.data';
import {
  MARKET_EVENTS,
  HAGGLE_TACTICS,
  getRandomMarketEvent,
  createMarketModifier,
  calculateDynamicPrice,
  calculateHaggleSuccess,
  getCustomerHaggleProfile,
  getItemPriceConfig,
  type HaggleAttempt,
  type HaggleTactic,
  type HaggleTacticResult,
  type MarketEventTemplate,
} from '../../data/market.data';
import type { PriceTrend } from '@ateria-idle/entities/ateria-idle/merchant';

// ============================================
// CONSTANTS
// ============================================

const BASE_XP_PER_LEVEL = 150;
const XP_SCALING = 1.12;
const CUSTOMER_SPAWN_INTERVAL = 100; // Ticks between customer spawns
const MAX_CUSTOMERS = 5;
const BASE_CARAVAN_CAPACITY = 100;

const BASE_STATS: MerchantStats = {
  level: 1,
  xp: bn(0),
  xpToNextLevel: bn(BASE_XP_PER_LEVEL),
  reputation: 0,
  reputationTier: 'unknown',
  charisma: 10,
  negotiation: 10,
  appraisal: 10,
  goldMultiplier: 1,
  customerAttraction: 1,
};

// ============================================
// STORE
// ============================================

export const useAteriaMerchantStore = defineStore('ateria-merchant', () => {
  const resourcesStore = useAteriaResourcesStore();
  const gameStore = useAteriaGameStore();

  // ============================================
  // STATE
  // ============================================

  // Stats
  const stats = ref<MerchantStats>({ ...BASE_STATS });

  // Shop
  const shop = ref<Shop>({
    name: 'Gildiowy Sklep',
    level: 1,
    maxDisplaySlots: 6,
    maxStorageSlots: 20,
    displayedItems: [],
    storage: [],
    decorations: [],
    bonuses: {
      customerPatience: 0,
      wealthyCustomerChance: 0,
      haggleSuccessBonus: 0,
      priceMultiplier: 0,
      customerFrequency: 0,
      storageCapacity: 0,
    },
  });

  // Customers
  const customers = ref<Customer[]>([]);
  const customerSpawnCooldown = ref(0);

  // Caravans
  const caravans = ref<Caravan[]>([
    {
      id: 'caravan_1',
      name: 'Karawana Pierwsza',
      maxCapacity: BASE_CARAVAN_CAPACITY,
      currentCapacity: 0,
      baseSpeed: 1,
      protection: 0,
      cargo: [],
      state: 'idle',
      currentRoute: null,
      progress: 0,
      departureTime: 0,
      arrivalTime: 0,
      insured: false,
      insuranceCost: 0,
    },
  ]);
  const maxCaravans = ref(1);
  const caravanUpgrades = ref<Map<string, number>>(new Map());

  // Market - Dynamic Prices
  const marketPrices = ref<Map<string, MarketPrice>>(new Map());
  const marketModifiers = ref<MarketModifier[]>([]);
  const lastMarketUpdate = ref(Date.now());
  const marketEventCooldown = ref(0);
  const activeMarketEvent = ref<MarketEventTemplate | null>(null);

  // Haggle System
  const activeHaggle = ref<HaggleAttempt | null>(null);
  const haggleHistory = ref<Array<{
    customerId: string;
    itemId: string;
    originalPrice: number;
    finalPrice: number;
    success: boolean;
    rounds: number;
    timestamp: number;
  }>>([]);
  const tacticCooldowns = ref<Map<HaggleTactic, number>>(new Map());

  // Session stats
  const sessionGoldEarned = ref(bn(0));
  const sessionItemsSold = ref(0);
  const sessionCustomersServed = ref(0);
  const sessionTradesCompleted = ref(0);

  // ============================================
  // COMPUTED
  // ============================================

  const xpProgress = computed(() => {
    if (stats.value.xpToNextLevel.eq(0)) return 0;
    return stats.value.xp.div(stats.value.xpToNextLevel).toNumber();
  });

  const reputationTierData = computed(() => ({
    tier: stats.value.reputationTier,
    name: REPUTATION_NAMES[stats.value.reputationTier],
    color: REPUTATION_COLORS[stats.value.reputationTier],
  }));

  const unlockedRoutes = computed(() => {
    return getUnlockedRoutes(stats.value.level, stats.value.reputation);
  });

  const activeCaravans = computed(() => {
    return caravans.value.filter(c => c.state === 'traveling' || c.state === 'returning');
  });

  const idleCaravans = computed(() => {
    return caravans.value.filter(c => c.state === 'idle');
  });

  const totalShopBonuses = computed(() => {
    const bonuses = { ...shop.value.bonuses };

    // Add bonuses from decorations
    for (const deco of shop.value.decorations) {
      if (deco.purchased && deco.bonuses) {
        bonuses.customerPatience += deco.bonuses.customerPatience || 0;
        bonuses.wealthyCustomerChance += deco.bonuses.wealthyCustomerChance || 0;
        bonuses.haggleSuccessBonus += deco.bonuses.haggleSuccessBonus || 0;
        bonuses.priceMultiplier += deco.bonuses.priceMultiplier || 0;
        bonuses.customerFrequency += deco.bonuses.customerFrequency || 0;
        bonuses.storageCapacity += deco.bonuses.storageCapacity || 0;
      }
    }

    return bonuses;
  });

  const effectiveStorageSlots = computed(() => {
    return shop.value.maxStorageSlots + totalShopBonuses.value.storageCapacity;
  });

  const ownedDecorations = computed(() => {
    return SHOP_DECORATIONS.filter(d =>
      shop.value.decorations.some(owned => owned.id === d.id && owned.purchased)
    );
  });

  const availableDecorations = computed(() => {
    return SHOP_DECORATIONS.filter(d =>
      !shop.value.decorations.some(owned => owned.id === d.id && owned.purchased)
    );
  });

  // Dynamic Market computed
  const activeMarketModifiers = computed(() => {
    return marketModifiers.value.filter(m => m.isActive);
  });

  const currentMarketSentiment = computed(() => {
    const mods = activeMarketModifiers.value;
    if (mods.length === 0) return 'stable';
    
    const avgModifier = mods.reduce((sum, m) => sum + m.priceModifier, 0) / mods.length;
    if (avgModifier > 1.2) return 'bullish';
    if (avgModifier < 0.8) return 'bearish';
    return 'stable';
  });

  const marketVolatility = computed(() => {
    const mods = activeMarketModifiers.value;
    if (mods.length === 0) return 'low';
    if (mods.some(m => m.affectedCategories.includes('all'))) return 'high';
    if (mods.length >= 2) return 'medium';
    return 'low';
  });

  // Haggle computed
  const isHaggling = computed(() => activeHaggle.value !== null);

  const haggleSuccessRate = computed(() => {
    const recent = haggleHistory.value.slice(-20);
    if (recent.length === 0) return 0;
    const successes = recent.filter(h => h.success).length;
    return Math.round((successes / recent.length) * 100);
  });

  const availableTactics = computed(() => {
    if (!activeHaggle.value) return [];
    
    return Object.values(HAGGLE_TACTICS).filter(tactic => {
      const cooldown = tacticCooldowns.value.get(tactic.id) || 0;
      return cooldown <= 0;
    });
  });

  const merchantLevel = computed(() => stats.value.level);

  // ============================================
  // ACTIONS - XP & LEVELING
  // ============================================

  function calculateXpToLevel(level: number): Decimal {
    return bn(BASE_XP_PER_LEVEL).mul(Decimal.pow(XP_SCALING, level));
  }

  function addXp(amount: Decimal | number) {
    const amountDecimal = amount instanceof Decimal ? amount : bn(amount);
    stats.value.xp = stats.value.xp.add(amountDecimal);

    while (stats.value.xp.gte(stats.value.xpToNextLevel)) {
      levelUp();
    }
  }

  function levelUp() {
    stats.value.xp = stats.value.xp.sub(stats.value.xpToNextLevel);
    stats.value.level++;
    stats.value.xpToNextLevel = calculateXpToLevel(stats.value.level);

    // Increase stats
    stats.value.charisma += 2;
    stats.value.negotiation += 1;
    stats.value.appraisal += 1;
    stats.value.goldMultiplier += 0.02;
    stats.value.customerAttraction += 0.05;

    // Unlock new caravan slot at certain levels
    if (stats.value.level === 10 && maxCaravans.value < 2) {
      maxCaravans.value = 2;
      addNewCaravan();
    } else if (stats.value.level === 25 && maxCaravans.value < 3) {
      maxCaravans.value = 3;
      addNewCaravan();
    } else if (stats.value.level === 50 && maxCaravans.value < 4) {
      maxCaravans.value = 4;
      addNewCaravan();
    }

    gameStore.addNotification({
      type: 'success',
      title: 'Awans Handlarza!',
      message: `Handlarz osiągnął poziom ${stats.value.level}!`,
      icon: 'mdi-cart-arrow-up',
    });
  }

  function addNewCaravan() {
    const id = `caravan_${caravans.value.length + 1}`;
    caravans.value.push({
      id,
      name: `Karawana ${caravans.value.length + 1}`,
      maxCapacity: BASE_CARAVAN_CAPACITY,
      currentCapacity: 0,
      baseSpeed: 1,
      protection: 0,
      cargo: [],
      state: 'idle',
      currentRoute: null,
      progress: 0,
      departureTime: 0,
      arrivalTime: 0,
      insured: false,
      insuranceCost: 0,
    });

    gameStore.addNotification({
      type: 'success',
      title: 'Nowa Karawana!',
      message: `Odblokowano dodatkowy slot karawany`,
      icon: 'mdi-truck-plus',
    });
  }

  // ============================================
  // ACTIONS - REPUTATION
  // ============================================

  function addReputation(amount: number) {
    stats.value.reputation = Math.min(100, stats.value.reputation + amount);
    stats.value.reputationTier = getReputationTier(stats.value.reputation);
  }

  function removeReputation(amount: number) {
    stats.value.reputation = Math.max(0, stats.value.reputation - amount);
    stats.value.reputationTier = getReputationTier(stats.value.reputation);
  }

  // ============================================
  // ACTIONS - CUSTOMERS
  // ============================================

  function spawnCustomer() {
    if (customers.value.length >= MAX_CUSTOMERS) return;
    if (shop.value.displayedItems.length === 0) return;

    // Get available customer types based on reputation
    const availableTypes = getAvailableCustomerTypes(stats.value.reputation);
    if (availableTypes.length === 0) return;

    // Weighted random selection
    const totalWeight = availableTypes.reduce((sum, c) => sum + c.weight, 0);
    let random = Math.random() * totalWeight;

    let selectedType: CustomerType = 'peasant';
    for (const config of availableTypes) {
      random -= config.weight;
      if (random <= 0) {
        selectedType = config.type;
        break;
      }
    }

    // Apply wealthy customer bonus
    if (Math.random() * 100 < totalShopBonuses.value.wealthyCustomerChance) {
      const wealthyTypes: CustomerType[] = ['noble', 'collector', 'whale'];
      const available = wealthyTypes.filter(t =>
        availableTypes.some(c => c.type === t)
      );
      if (available.length > 0) {
        selectedType = available[Math.floor(Math.random() * available.length)];
      }
    }

    const config = availableTypes.find(c => c.type === selectedType);
    if (!config) return;

    const budget = Math.floor(
      config.budgetRange.min +
      Math.random() * (config.budgetRange.max - config.budgetRange.min)
    );

    const basePat = config.patienceRange.min +
      Math.random() * (config.patienceRange.max - config.patienceRange.min);
    const patience = Math.floor(basePat * (1 + totalShopBonuses.value.customerPatience / 100));

    // Select a wanted item from display
    const displayedItems = shop.value.displayedItems.filter(i => i.currentPrice <= budget * 1.2);
    const wantedItem = displayedItems.length > 0
      ? displayedItems[Math.floor(Math.random() * displayedItems.length)]
      : null;

    const customer: Customer = {
      id: `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: selectedType,
      name: getRandomCustomerName(selectedType),
      icon: CUSTOMER_ICONS[selectedType],
      budget,
      budgetFlexibility: 0.1 + Math.random() * 0.2,
      preferredCategories: [],
      patience,
      currentPatience: patience,
      wantedItemId: wantedItem?.itemId || null,
      offerPrice: wantedItem ? Math.floor(wantedItem.currentPrice * (0.8 + Math.random() * 0.3)) : 0,
      state: 'browsing',
    };

    customers.value.push(customer);
  }

  function processCustomers() {
    const toRemove: string[] = [];

    for (const customer of customers.value) {
      customer.currentPatience--;

      if (customer.currentPatience <= 0) {
        customer.state = 'leaving';
        toRemove.push(customer.id);
        continue;
      }

      // Auto-buy logic (simplified)
      if (customer.state === 'browsing' && customer.wantedItemId) {
        const item = shop.value.displayedItems.find(i => i.itemId === customer.wantedItemId);
        if (item && item.quantity > 0) {
          const maxPrice = customer.budget * (1 + customer.budgetFlexibility);
          if (item.currentPrice <= maxPrice) {
            // Customer buys the item
            sellItemToCustomer(customer, item);
            customer.state = 'satisfied';
            toRemove.push(customer.id);
          }
        }
      }
    }

    // Remove processed customers
    customers.value = customers.value.filter(c => !toRemove.includes(c.id));
  }

  function sellItemToCustomer(customer: Customer, item: ShopDisplayItem) {
    const salePrice = item.currentPrice;

    // Add gold
    resourcesStore.addResource('gold', salePrice);
    sessionGoldEarned.value = sessionGoldEarned.value.add(salePrice);
    sessionItemsSold.value++;
    sessionCustomersServed.value++;

    // Remove item from display
    item.quantity--;
    if (item.quantity <= 0) {
      shop.value.displayedItems = shop.value.displayedItems.filter(i => i.itemId !== item.itemId);
    }

    // Add XP and reputation
    const xpGain = Math.floor(salePrice * 0.1);
    addXp(xpGain);

    if (customer.type !== 'peasant') {
      addReputation(0.1);
    }

    gameStore.addNotification({
      type: 'success',
      title: 'Sprzedaż!',
      message: `${customer.name} kupił przedmiot za ${salePrice} złota`,
      icon: 'mdi-cash-register',
      duration: 2000,
    });
  }

  // ============================================
  // ACTIONS - SHOP MANAGEMENT
  // ============================================

  function addItemToStorage(itemId: string, quantity: number, buyPrice: number = 0) {
    const existing = shop.value.storage.find(s => s.itemId === itemId);
    if (existing) {
      const totalQty = existing.quantity + quantity;
      existing.averageBuyPrice = (existing.averageBuyPrice * existing.quantity + buyPrice * quantity) / totalQty;
      existing.quantity = totalQty;
    } else {
      if (shop.value.storage.length >= effectiveStorageSlots.value) {
        gameStore.addNotification({
          type: 'warning',
          title: 'Magazyn pełny',
          message: 'Nie ma miejsca na więcej towarów',
          icon: 'mdi-package-variant-closed-remove',
        });
        return false;
      }
      shop.value.storage.push({
        itemId,
        quantity,
        averageBuyPrice: buyPrice,
      });
    }
    return true;
  }

  function moveToDisplay(itemId: string, quantity: number, priceModifier: number = 1) {
    const storageItem = shop.value.storage.find(s => s.itemId === itemId);
    if (!storageItem || storageItem.quantity < quantity) return false;

    const basePrice = storageItem.averageBuyPrice || 10;
    const currentPrice = Math.floor(basePrice * priceModifier * (1 + totalShopBonuses.value.priceMultiplier));

    const existing = shop.value.displayedItems.find(d => d.itemId === itemId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      if (shop.value.displayedItems.length >= shop.value.maxDisplaySlots) {
        gameStore.addNotification({
          type: 'warning',
          title: 'Brak miejsca na wystawie',
          message: 'Ulepsz sklep, aby wystawić więcej przedmiotów',
          icon: 'mdi-store-alert',
        });
        return false;
      }
      shop.value.displayedItems.push({
        itemId,
        quantity,
        basePrice,
        currentPrice,
        priceModifier,
      });
    }

    storageItem.quantity -= quantity;
    if (storageItem.quantity <= 0) {
      shop.value.storage = shop.value.storage.filter(s => s.itemId !== itemId);
    }

    return true;
  }

  function buyDecoration(decorationId: string): boolean {
    const decoration = SHOP_DECORATIONS.find(d => d.id === decorationId);
    if (!decoration) return false;

    if (!resourcesStore.hasAmount('gold', decoration.cost)) {
      gameStore.addNotification({
        type: 'warning',
        title: 'Za mało złota',
        message: `Potrzebujesz ${decoration.cost} złota`,
        icon: 'mdi-cash-remove',
      });
      return false;
    }

    resourcesStore.removeResource('gold', decoration.cost);

    const owned = { ...decoration, purchased: true };
    shop.value.decorations.push(owned);

    gameStore.addNotification({
      type: 'success',
      title: 'Nowa Dekoracja!',
      message: `Kupiono: ${decoration.name}`,
      icon: decoration.icon,
    });

    return true;
  }

  // ============================================
  // ACTIONS - DYNAMIC MARKET
  // ============================================

  function initializeMarketPrice(itemId: string, category: string, basePrice: number) {
    if (marketPrices.value.has(itemId)) return;

    const config = getItemPriceConfig(category);
    
    const marketPrice: MarketPrice = {
      itemId,
      basePrice,
      currentPrice: basePrice,
      supplyLevel: 0.5,
      demandLevel: 0.5,
      trend: 'stable',
      lastSoldQuantity: 0,
      recoveryRate: config.recoveryRate,
    };

    marketPrices.value.set(itemId, marketPrice);
  }

  function updateMarketPrices() {
    const now = Date.now();
    const timeSinceUpdate = now - lastMarketUpdate.value;

    // Update every 10 seconds (100 ticks)
    if (timeSinceUpdate < 10000) return;

    lastMarketUpdate.value = now;

    for (const [itemId, price] of marketPrices.value.entries()) {
      // Recover towards base price
      const priceDiff = price.basePrice - price.currentPrice;
      const recovery = priceDiff * price.recoveryRate;
      price.currentPrice = Math.round(price.currentPrice + recovery);

      // Recover supply/demand to 0.5
      price.supplyLevel += (0.5 - price.supplyLevel) * 0.1;
      price.demandLevel += (0.5 - price.demandLevel) * 0.1;

      // Update trend based on recent activity
      if (price.lastSoldQuantity > 5) {
        price.trend = 'rising';
        price.lastSoldQuantity = 0;
      } else if (price.lastSoldQuantity === 0) {
        price.trend = 'falling';
      } else {
        price.trend = 'stable';
      }

      // Apply market modifiers
      const category = detectItemCategory(itemId);
      price.currentPrice = calculateDynamicPrice(
        price.basePrice,
        price.supplyLevel,
        price.demandLevel,
        price.trend,
        activeMarketModifiers.value,
        category
      );
    }
  }

  function detectItemCategory(itemId: string): string {
    // Simple category detection based on item ID patterns
    if (itemId.includes('ore') || itemId.includes('ingot')) return 'ore';
    if (itemId.includes('herb') || itemId.includes('flower')) return 'herb';
    if (itemId.includes('potion') || itemId.includes('elixir')) return 'potion';
    if (itemId.includes('sword') || itemId.includes('axe') || itemId.includes('dagger')) return 'weapon';
    if (itemId.includes('armor') || itemId.includes('shield') || itemId.includes('helm')) return 'armor';
    if (itemId.includes('food') || itemId.includes('bread') || itemId.includes('meat')) return 'food';
    if (itemId.includes('gem') || itemId.includes('jewelry') || itemId.includes('ring')) return 'luxury';
    if (itemId.includes('artifact') || itemId.includes('relic')) return 'artifact';
    return 'common_loot';
  }

  function recordSale(itemId: string, quantity: number) {
    const price = marketPrices.value.get(itemId);
    if (price) {
      price.lastSoldQuantity += quantity;
      // High sales increase demand, which increases price
      price.demandLevel = Math.min(1, price.demandLevel + quantity * 0.02);
      // High sales decrease supply
      price.supplyLevel = Math.max(0, price.supplyLevel - quantity * 0.01);
    }
  }

  function spawnMarketEvent() {
    if (marketEventCooldown.value > 0) {
      marketEventCooldown.value--;
      return;
    }

    // 1% chance per tick to spawn event (when no event active)
    if (activeMarketEvent.value) return;
    if (Math.random() > 0.001) return;

    // Spawn event based on merchant level
    const maxRarity = stats.value.level >= 30 ? 'epic' :
                      stats.value.level >= 20 ? 'rare' :
                      stats.value.level >= 10 ? 'uncommon' : 'common';

    const event = getRandomMarketEvent(maxRarity);
    const modifier = createMarketModifier(event);

    marketModifiers.value.push(modifier);
    activeMarketEvent.value = event;

    // Set cooldown (30-60 seconds after event ends)
    marketEventCooldown.value = modifier.duration + Math.floor(Math.random() * 300) + 300;

    gameStore.addNotification({
      type: event.sentiment === 'positive' ? 'success' :
            event.sentiment === 'negative' ? 'warning' : 'info',
      title: 'Wydarzenie Rynkowe!',
      message: event.name + ': ' + event.description,
      icon: event.icon,
      duration: 5000,
    });
  }

  function processMarketModifiers() {
    const now = Date.now();
    let eventEnded = false;

    for (const modifier of marketModifiers.value) {
      if (modifier.isActive) {
        const elapsed = now - modifier.startTime;
        if (elapsed >= modifier.duration * 100) { // Convert ticks to ms
          modifier.isActive = false;
          eventEnded = true;
        }
      }
    }

    // Clean up expired modifiers
    marketModifiers.value = marketModifiers.value.filter(m => m.isActive);

    if (eventEnded && activeMarketEvent.value) {
      gameStore.addNotification({
        type: 'info',
        title: 'Wydarzenie zakończone',
        message: activeMarketEvent.value.name + ' dobiegło końca',
        icon: 'mdi-clock-end',
      });
      activeMarketEvent.value = null;
    }
  }

  function getItemMarketPrice(itemId: string): number {
    const price = marketPrices.value.get(itemId);
    if (price) return price.currentPrice;
    return 10; // Default price
  }

  // ============================================
  // ACTIONS - HAGGLE SYSTEM
  // ============================================

  function startHaggle(customer: Customer, item: ShopDisplayItem): boolean {
    if (activeHaggle.value) {
      gameStore.addNotification({
        type: 'warning',
        title: 'Już się targujesz',
        message: 'Zakończ obecne targowanie',
        icon: 'mdi-alert',
      });
      return false;
    }

    if (customer.state !== 'browsing' && customer.state !== 'interested') {
      return false;
    }

    const profile = getCustomerHaggleProfile(customer.type);
    const startingOffer = Math.floor(item.currentPrice * profile.startingOfferPercent);
    const maxPrice = Math.floor(item.currentPrice * profile.maxPayPercent);

    activeHaggle.value = {
      customerId: customer.id,
      itemId: item.itemId,
      originalPrice: item.currentPrice,
      currentOffer: startingOffer,
      customerMaxPrice: maxPrice,
      round: 1,
      maxRounds: profile.patienceBase + Math.floor(totalShopBonuses.value.customerPatience / 20),
      playerLastOffer: item.currentPrice,
      customerPatience: 100,
      tactics: [],
    };

    customer.state = 'haggling';
    customer.offerPrice = startingOffer;

    // Reset tactic cooldowns
    tacticCooldowns.value.clear();

    gameStore.addNotification({
      type: 'info',
      title: 'Rozpoczęto targowanie!',
      message: `${customer.name} oferuje ${startingOffer} złota`,
      icon: 'mdi-handshake',
    });

    return true;
  }

  function useHaggleTactic(tactic: HaggleTactic): HaggleTacticResult {
    if (!activeHaggle.value) {
      return { success: false, priceChange: 0, patienceChange: 0, message: 'Brak aktywnego targowania' };
    }

    const haggle = activeHaggle.value;
    const customer = customers.value.find(c => c.id === haggle.customerId);
    if (!customer) {
      endHaggle(false);
      return { success: false, priceChange: 0, patienceChange: 0, message: 'Klient odszedł' };
    }

    const config = HAGGLE_TACTICS[tactic];
    const profile = getCustomerHaggleProfile(customer.type);

    // Check cooldown
    const cooldown = tacticCooldowns.value.get(tactic) || 0;
    if (cooldown > 0) {
      return { 
        success: false, 
        priceChange: 0, 
        patienceChange: 0, 
        message: `Taktyka niedostępna (${cooldown} rundy)` 
      };
    }

    // Calculate success
    const result = calculateHaggleSuccess(
      tactic,
      stats.value.charisma,
      stats.value.negotiation,
      profile,
      totalShopBonuses.value.haggleSuccessBonus
    );

    // Track tactic usage
    haggle.tactics.push(tactic);
    tacticCooldowns.value.set(tactic, config.cooldown);

    // Calculate price change
    const priceGap = haggle.customerMaxPrice - haggle.currentOffer;
    let priceChange: number;
    let patienceChange = 0;
    let message: string;

    if (result.success) {
      priceChange = Math.floor(priceGap * config.priceGainOnSuccess);
      message = getSuccessMessage(tactic, customer.name);
    } else {
      priceChange = Math.floor(priceGap * config.priceGainOnFail);
      patienceChange = -config.patienceCostOnFail;
      message = getFailMessage(tactic, customer.name);

      // Walk away fail = customer leaves
      if (tactic === 'walk_away') {
        endHaggle(false);
        return { success: false, priceChange: 0, patienceChange: -100, message: `${customer.name} odchodzi!` };
      }
    }

    // Apply changes
    haggle.currentOffer = Math.min(haggle.customerMaxPrice, Math.max(1, haggle.currentOffer + priceChange));
    haggle.customerPatience = Math.max(0, haggle.customerPatience + patienceChange);
    haggle.round++;

    customer.offerPrice = haggle.currentOffer;

    // Reduce tactic cooldowns
    for (const [t, cd] of tacticCooldowns.value.entries()) {
      if (cd > 0) tacticCooldowns.value.set(t, cd - 1);
    }

    // Check if haggle should end
    if (haggle.customerPatience <= 0) {
      endHaggle(false);
      return { success: false, priceChange, patienceChange, message: `${customer.name} stracił cierpliwość i odchodzi!` };
    }

    if (haggle.round > haggle.maxRounds) {
      // Force final decision
      return { success: result.success, priceChange, patienceChange, message: message + ' (Ostatnia runda!)' };
    }

    return { 
      success: result.success, 
      priceChange, 
      patienceChange, 
      message,
      bonusXp: result.success ? Math.floor(priceChange * 0.1) : 0,
    };
  }

  function acceptHaggleOffer(): boolean {
    if (!activeHaggle.value) return false;

    const haggle = activeHaggle.value;
    const customer = customers.value.find(c => c.id === haggle.customerId);
    const item = shop.value.displayedItems.find(i => i.itemId === haggle.itemId);

    if (!customer || !item) {
      endHaggle(false);
      return false;
    }

    // Complete the sale at haggled price
    const finalPrice = haggle.currentOffer;

    resourcesStore.addResource('gold', finalPrice);
    sessionGoldEarned.value = sessionGoldEarned.value.add(finalPrice);
    sessionItemsSold.value++;
    sessionCustomersServed.value++;

    // Record sale for market
    recordSale(item.itemId, 1);

    // Remove item
    item.quantity--;
    if (item.quantity <= 0) {
      shop.value.displayedItems = shop.value.displayedItems.filter(i => i.itemId !== item.itemId);
    }

    // XP bonus based on how well you haggled
    const haggleBonus = finalPrice > haggle.originalPrice ? 
      Math.floor((finalPrice - haggle.originalPrice) * 0.5) : 0;
    addXp(Math.floor(finalPrice * 0.1) + haggleBonus);

    // Reputation
    if (customer.type !== 'peasant') {
      addReputation(0.2);
    }

    // Record in history
    haggleHistory.value.push({
      customerId: customer.id,
      itemId: item.itemId,
      originalPrice: haggle.originalPrice,
      finalPrice,
      success: true,
      rounds: haggle.round,
      timestamp: Date.now(),
    });

    gameStore.addNotification({
      type: 'success',
      title: 'Targowanie udane!',
      message: `Sprzedano za ${finalPrice} złota (${Math.round((finalPrice / haggle.originalPrice) * 100)}% ceny)`,
      icon: 'mdi-handshake',
    });

    // Remove customer
    customers.value = customers.value.filter(c => c.id !== customer.id);
    activeHaggle.value = null;

    return true;
  }

  function rejectHaggleOffer(): boolean {
    if (!activeHaggle.value) return false;

    const haggle = activeHaggle.value;
    const customer = customers.value.find(c => c.id === haggle.customerId);

    if (!customer) {
      endHaggle(false);
      return false;
    }

    // Player sets their counter-offer (current item price)
    // Customer may improve offer or leave
    const profile = getCustomerHaggleProfile(customer.type);
    
    // Random chance customer improves offer
    if (Math.random() < 0.5 - profile.aggressiveness) {
      const improvement = Math.floor((haggle.customerMaxPrice - haggle.currentOffer) * 0.1);
      haggle.currentOffer = Math.min(haggle.customerMaxPrice, haggle.currentOffer + improvement);
      customer.offerPrice = haggle.currentOffer;

      gameStore.addNotification({
        type: 'info',
        title: 'Kontroferta',
        message: `${customer.name} podnosi ofertę do ${haggle.currentOffer} złota`,
        icon: 'mdi-currency-usd',
      });
    } else {
      // Customer patience decreases
      haggle.customerPatience -= 20;
      
      if (haggle.customerPatience <= 0) {
        endHaggle(false);
        return true;
      }

      gameStore.addNotification({
        type: 'warning',
        title: 'Klient niezadowolony',
        message: `${customer.name} traci cierpliwość`,
        icon: 'mdi-emoticon-angry',
      });
    }

    return true;
  }

  function cancelHaggle(): void {
    endHaggle(false);
  }

  function endHaggle(success: boolean) {
    if (!activeHaggle.value) return;

    const haggle = activeHaggle.value;
    const customer = customers.value.find(c => c.id === haggle.customerId);

    if (customer) {
      if (success) {
        customer.state = 'satisfied';
      } else {
        customer.state = 'leaving';
      }
    }

    if (!success) {
      haggleHistory.value.push({
        customerId: haggle.customerId,
        itemId: haggle.itemId,
        originalPrice: haggle.originalPrice,
        finalPrice: 0,
        success: false,
        rounds: haggle.round,
        timestamp: Date.now(),
      });
    }

    activeHaggle.value = null;
    tacticCooldowns.value.clear();
  }

  function getSuccessMessage(tactic: HaggleTactic, customerName: string): string {
    const messages: Record<HaggleTactic, string[]> = {
      aggressive: [`${customerName} ustępuje pod presją!`, `Twoja pewność siebie robi wrażenie!`],
      friendly: [`${customerName} docenia twoje podejście.`, `Budujecie dobrą relację.`],
      logical: [`${customerName} zgadza się z twoimi argumentami.`, `Logika przemawia do klienta.`],
      emotional: [`${customerName} jest poruszony!`, `Twoje słowa trafiają do serca.`],
      bluff: [`${customerName} daje się nabrać!`, `Twój blef się udał!`],
      walk_away: [`${customerName} prosi cię o powrót!`, `Zagrożenie zadziałało!`],
    };
    return messages[tactic][Math.floor(Math.random() * messages[tactic].length)];
  }

  function getFailMessage(tactic: HaggleTactic, customerName: string): string {
    const messages: Record<HaggleTactic, string[]> = {
      aggressive: [`${customerName} jest oburzony!`, `To zbyt agresywne podejście.`],
      friendly: [`${customerName} nie daje się przekonać.`, `Potrzeba czegoś więcej.`],
      logical: [`${customerName} ma inne argumenty.`, `Twoja logika nie przekonuje.`],
      emotional: [`${customerName} pozostaje niewzruszony.`, `Emocje nie działają na tego klienta.`],
      bluff: [`${customerName} przejrzał twój blef!`, `Klient ci nie wierzy!`],
      walk_away: [`${customerName} też odchodzi!`, `Klient naprawdę odchodzi!`],
    };
    return messages[tactic][Math.floor(Math.random() * messages[tactic].length)];
  }

  // ============================================
  // ACTIONS - TRADE ROUTES
  // ============================================

  function startTradeRoute(caravanId: string, routeId: string, cargo: CaravanCargo[], insured: boolean = false) {
    const caravan = caravans.value.find(c => c.id === caravanId);
    const route = getTradeRoute(routeId);

    if (!caravan || !route) return false;
    if (caravan.state !== 'idle') return false;

    // Check level and reputation requirements
    if (stats.value.level < route.requiredLevel) {
      gameStore.addNotification({
        type: 'warning',
        title: 'Wymagany poziom',
        message: `Potrzebujesz poziomu ${route.requiredLevel}`,
        icon: 'mdi-lock',
      });
      return false;
    }

    if (stats.value.reputation < route.requiredReputation) {
      gameStore.addNotification({
        type: 'warning',
        title: 'Wymagana reputacja',
        message: `Potrzebujesz ${route.requiredReputation} reputacji`,
        icon: 'mdi-account-alert',
      });
      return false;
    }

    // Calculate cargo value and insurance
    const cargoValue = cargo.reduce((sum, c) => sum + c.buyPrice * c.quantity, 0);
    const insuranceCost = Math.floor(cargoValue * 0.1);

    if (insured && !resourcesStore.hasAmount('gold', insuranceCost)) {
      gameStore.addNotification({
        type: 'warning',
        title: 'Za mało złota',
        message: `Ubezpieczenie kosztuje ${insuranceCost} złota`,
        icon: 'mdi-cash-remove',
      });
      return false;
    }

    if (insured) {
      resourcesStore.removeResource('gold', insuranceCost);
    }

    // Calculate travel time with modifiers
    const speedMultiplier = 1 + stats.value.negotiation * 0.01;
    const travelTime = Math.floor(route.baseTravelTime / speedMultiplier);

    // Update caravan
    caravan.state = 'traveling';
    caravan.currentRoute = routeId;
    caravan.cargo = cargo;
    caravan.progress = 0;
    caravan.departureTime = Date.now();
    caravan.arrivalTime = Date.now() + travelTime * 100; // Convert ticks to ms
    caravan.insured = insured;
    caravan.insuranceCost = insuranceCost;
    caravan.currentCapacity = cargo.reduce((sum, c) => sum + c.quantity, 0);

    // Remove items from storage
    for (const item of cargo) {
      const storageItem = shop.value.storage.find(s => s.itemId === item.itemId);
      if (storageItem) {
        storageItem.quantity -= item.quantity;
        if (storageItem.quantity <= 0) {
          shop.value.storage = shop.value.storage.filter(s => s.itemId !== item.itemId);
        }
      }
    }

    gameStore.addNotification({
      type: 'info',
      title: 'Karawana Wyrusza',
      message: `${caravan.name} wyrusza szlakiem: ${route.name}`,
      icon: 'mdi-truck-fast',
    });

    return true;
  }

  function processCaravans() {
    for (const caravan of caravans.value) {
      if (caravan.state !== 'traveling' && caravan.state !== 'returning') continue;

      const route = getTradeRoute(caravan.currentRoute || '');
      if (!route) continue;

      // Update progress
      const totalTime = caravan.arrivalTime - caravan.departureTime;
      const elapsed = Date.now() - caravan.departureTime;
      caravan.progress = Math.min(1, elapsed / totalTime);

      // Check if arrived
      if (caravan.progress >= 1) {
        if (caravan.state === 'traveling') {
          processCaravanArrival(caravan, route);
        } else if (caravan.state === 'returning') {
          processCaravanReturn(caravan);
        }
      }
    }
  }

  function processCaravanArrival(caravan: Caravan, route: TradeRoute) {
    // Check for ambush
    const ambushRisk = route.baseRisk * (1 - caravan.protection * 0.01);
    const wasAmbushed = Math.random() < ambushRisk;

    if (wasAmbushed) {
      const outcome = resolveAmbush(caravan, route);
      if (outcome === 'total_loss') {
        caravan.state = 'idle';
        caravan.cargo = [];
        caravan.currentRoute = null;
        caravan.progress = 0;
        return;
      }
    }

    // Calculate profit
    const destinationCity = getCity(route.toCity);
    let totalProfit = 0;

    for (const cargo of caravan.cargo) {
      // Base sell price with route multiplier
      const sellPrice = Math.floor(cargo.buyPrice * route.profitMultiplier);
      const profit = (sellPrice - cargo.buyPrice) * cargo.quantity;
      totalProfit += sellPrice * cargo.quantity;
    }

    // Add gold
    resourcesStore.addResource('gold', totalProfit);
    sessionGoldEarned.value = sessionGoldEarned.value.add(totalProfit);
    sessionTradesCompleted.value++;

    // Add XP and reputation
    const xpGain = Math.floor(totalProfit * 0.05);
    addXp(xpGain);
    addReputation(0.5);

    gameStore.addNotification({
      type: 'success',
      title: 'Handel Zakończony!',
      message: `${caravan.name} sprzedał towary za ${totalProfit} złota`,
      icon: 'mdi-cash-check',
    });

    // Start return journey
    caravan.state = 'returning';
    caravan.cargo = [];
    caravan.progress = 0;
    caravan.departureTime = Date.now();
    caravan.arrivalTime = Date.now() + route.baseTravelTime * 50; // Return is faster
  }

  function processCaravanReturn(caravan: Caravan) {
    caravan.state = 'idle';
    caravan.currentRoute = null;
    caravan.progress = 0;
    caravan.currentCapacity = 0;

    gameStore.addNotification({
      type: 'info',
      title: 'Karawana Powróciła',
      message: `${caravan.name} wróciła do miasta`,
      icon: 'mdi-truck-check',
      duration: 2000,
    });
  }

  function resolveAmbush(caravan: Caravan, route: TradeRoute): AmbushOutcome {
    const defenseChance = 0.05 + caravan.protection * 0.01;
    const roll = Math.random();

    let outcome: AmbushOutcome;
    let cargoLostPercent = 0;

    if (roll < defenseChance) {
      outcome = 'defended';
      addXp(50);
      addReputation(1);
    } else if (roll < 0.4) {
      outcome = 'escaped';
      cargoLostPercent = 0.1;
    } else if (roll < 0.75) {
      outcome = 'minor_loss';
      cargoLostPercent = 0.35;
    } else if (roll < 0.95) {
      outcome = 'major_loss';
      cargoLostPercent = 0.6;
    } else {
      outcome = 'total_loss';
      cargoLostPercent = 1;
    }

    // Apply insurance
    if (caravan.insured && cargoLostPercent > 0) {
      const cargoValue = caravan.cargo.reduce((sum, c) => sum + c.buyPrice * c.quantity, 0);
      const reimbursement = Math.floor(cargoValue * cargoLostPercent * 0.7);
      resourcesStore.addResource('gold', reimbursement);

      gameStore.addNotification({
        type: 'info',
        title: 'Odszkodowanie',
        message: `Ubezpieczenie wypłaciło ${reimbursement} złota`,
        icon: 'mdi-shield-check',
      });
    }

    // Apply cargo loss
    if (cargoLostPercent > 0 && cargoLostPercent < 1) {
      for (const cargo of caravan.cargo) {
        cargo.quantity = Math.floor(cargo.quantity * (1 - cargoLostPercent));
      }
      caravan.cargo = caravan.cargo.filter(c => c.quantity > 0);
    }

    const messages: Record<AmbushOutcome, string> = {
      defended: 'Karawana odparła atak bandytów!',
      escaped: 'Karawana uciekła z małymi stratami',
      minor_loss: 'Bandyci ukradli część towaru',
      major_loss: 'Poważna strata! Bandyci zabrali większość',
      total_loss: 'Katastrofa! Karawana została ograbiona',
    };

    gameStore.addNotification({
      type: outcome === 'defended' ? 'success' : 'warning',
      title: 'Napad na Karawanę!',
      message: messages[outcome],
      icon: outcome === 'defended' ? 'mdi-shield-sword' : 'mdi-alert',
      duration: 5000,
    });

    return outcome;
  }

  // ============================================
  // ACTIONS - CARAVAN MANAGEMENT
  // ============================================

  function addCaravan(caravan: Caravan) {
    if (caravans.value.length >= maxCaravans.value) return false;
    caravans.value.push(caravan);
    return true;
  }

  function sendCaravan(caravanId: string, routeId: string) {
    // Simplified version - just start the route with empty cargo
    return startTradeRoute(caravanId, routeId, [], false);
  }

  function purchaseCaravanUpgrade(upgradeId: string) {
    const currentLevel = caravanUpgrades.value.get(upgradeId) || 0;
    caravanUpgrades.value.set(upgradeId, currentLevel + 1);

    // Apply upgrade effects to all caravans
    const { CARAVAN_UPGRADES } = require('../../data/caravans.data');
    const upgrade = CARAVAN_UPGRADES.find((u: any) => u.id === upgradeId);
    if (!upgrade) return;

    for (const caravan of caravans.value) {
      if (upgrade.effect.type === 'capacity') {
        if (upgrade.effect.isPercent) {
          caravan.maxCapacity = Math.floor(caravan.maxCapacity * (1 + upgrade.effect.value / 100));
        } else {
          caravan.maxCapacity += upgrade.effect.value;
        }
      } else if (upgrade.effect.type === 'speed') {
        if (upgrade.effect.isPercent) {
          caravan.baseSpeed *= (1 + upgrade.effect.value / 100);
        }
      } else if (upgrade.effect.type === 'protection') {
        if (upgrade.effect.isPercent) {
          caravan.protection = Math.floor(caravan.protection * (1 + upgrade.effect.value / 100));
        } else {
          caravan.protection += upgrade.effect.value;
        }
      } else if (upgrade.effect.type === 'slots') {
        maxCaravans.value += 1;
      }
    }

    gameStore.addNotification({
      type: 'success',
      title: 'Ulepszenie Karawany!',
      message: `${upgrade.name} poziom ${currentLevel + 1}`,
      icon: upgrade.icon,
    });
  }

  // ============================================
  // ACTIONS - GAME LOOP
  // ============================================

  function processTick() {
    // Customer spawning
    customerSpawnCooldown.value--;
    const spawnInterval = Math.floor(CUSTOMER_SPAWN_INTERVAL / (1 + totalShopBonuses.value.customerFrequency / 100));

    if (customerSpawnCooldown.value <= 0) {
      spawnCustomer();
      customerSpawnCooldown.value = spawnInterval;
    }

    // Process existing customers
    processCustomers();

    // Process caravans
    processCaravans();

    // Process market
    updateMarketPrices();
    processMarketModifiers();
    spawnMarketEvent();
  }

  // ============================================
  // SAVE/LOAD
  // ============================================

  function getState() {
    return {
      stats: {
        ...stats.value,
        xp: stats.value.xp.toString(),
        xpToNextLevel: stats.value.xpToNextLevel.toString(),
      },
      shop: {
        ...shop.value,
        decorations: shop.value.decorations.map(d => d.id),
      },
      caravans: caravans.value,
      maxCaravans: maxCaravans.value,
    };
  }

  function loadState(state: any) {
    if (state.stats) {
      stats.value = {
        ...state.stats,
        xp: bn(state.stats.xp || 0),
        xpToNextLevel: bn(state.stats.xpToNextLevel || BASE_XP_PER_LEVEL),
      };
    }
    if (state.shop) {
      shop.value = {
        ...state.shop,
        decorations: (state.shop.decorations || [])
          .map((id: string) => SHOP_DECORATIONS.find(d => d.id === id))
          .filter((d: ShopDecoration | undefined): d is ShopDecoration => d !== undefined)
          .map((d: ShopDecoration) => ({ ...d, purchased: true })),
      };
    }
    if (state.caravans) caravans.value = state.caravans;
    if (state.maxCaravans) maxCaravans.value = state.maxCaravans;
  }

  function resetMerchant() {
    stats.value = { ...BASE_STATS };
    shop.value = {
      name: 'Gildiowy Sklep',
      level: 1,
      maxDisplaySlots: 6,
      maxStorageSlots: 20,
      displayedItems: [],
      storage: [],
      decorations: [],
      bonuses: {
        customerPatience: 0,
        wealthyCustomerChance: 0,
        haggleSuccessBonus: 0,
        priceMultiplier: 0,
        customerFrequency: 0,
        storageCapacity: 0,
      },
    };
    customers.value = [];
    caravans.value = [{
      id: 'caravan_1',
      name: 'Karawana Pierwsza',
      maxCapacity: BASE_CARAVAN_CAPACITY,
      currentCapacity: 0,
      baseSpeed: 1,
      protection: 0,
      cargo: [],
      state: 'idle',
      currentRoute: null,
      progress: 0,
      departureTime: 0,
      arrivalTime: 0,
      insured: false,
      insuranceCost: 0,
    }];
    maxCaravans.value = 1;
    sessionGoldEarned.value = bn(0);
    sessionItemsSold.value = 0;
    sessionCustomersServed.value = 0;
    sessionTradesCompleted.value = 0;
  }

  // ============================================
  // DEV HELPERS
  // ============================================

  function devAddTestItems() {
    addItemToStorage('wolf_pelt', 10, 15);
    addItemToStorage('goblin_ear', 20, 5);
    addItemToStorage('iron_ore', 30, 8);
    addItemToStorage('healing_herb', 15, 12);
  }

  return {
    // State
    stats,
    shop,
    customers,
    caravans,
    maxCaravans,
    caravanUpgrades,
    marketPrices,
    marketModifiers,
    activeMarketEvent,
    activeHaggle,
    haggleHistory,
    tacticCooldowns,
    sessionGoldEarned,
    sessionItemsSold,
    sessionCustomersServed,
    sessionTradesCompleted,

    // Computed
    xpProgress,
    reputationTierData,
    unlockedRoutes,
    activeCaravans,
    idleCaravans,
    totalShopBonuses,
    effectiveStorageSlots,
    ownedDecorations,
    availableDecorations,
    activeMarketModifiers,
    currentMarketSentiment,
    marketVolatility,
    isHaggling,
    haggleSuccessRate,
    availableTactics,
    merchantLevel,

    // Actions
    addXp,
    addReputation,
    removeReputation,
    addItemToStorage,
    moveToDisplay,
    buyDecoration,
    startTradeRoute,
    addCaravan,
    sendCaravan,
    purchaseCaravanUpgrade,
    processTick,
    getState,
    loadState,
    resetMerchant,

    // Market Actions
    initializeMarketPrice,
    getItemMarketPrice,
    recordSale,

    // Haggle Actions
    startHaggle,
    useHaggleTactic,
    acceptHaggleOffer,
    rejectHaggleOffer,
    cancelHaggle,

    // Dev
    devAddTestItems,
  };
}, {
  persist: {
    key: 'ateria-merchant',
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    serializer: {
      serialize: (state) => {
        return JSON.stringify({
          ...state,
          stats: state.stats ? {
            ...state.stats,
            xp: state.stats.xp?.toString() || '0',
            xpToNextLevel: state.stats.xpToNextLevel?.toString() || String(BASE_XP_PER_LEVEL),
          } : undefined,
          sessionGoldEarned: state.sessionGoldEarned?.toString() || '0',
          // Convert Map to array for serialization
          marketPrices: state.marketPrices instanceof Map 
            ? Array.from(state.marketPrices.entries()) 
            : [],
          caravanUpgrades: state.caravanUpgrades instanceof Map 
            ? Array.from(state.caravanUpgrades.entries()) 
            : [],
        });
      },
      deserialize: (value) => {
        const parsed = JSON.parse(value);

        // Fix stats Decimal values
        if (parsed.stats) {
          parsed.stats.xp = bn(parsed.stats.xp || 0);
          parsed.stats.xpToNextLevel = bn(parsed.stats.xpToNextLevel || BASE_XP_PER_LEVEL);
        }

        // Fix sessionGoldEarned
        if (parsed.sessionGoldEarned !== undefined) {
          parsed.sessionGoldEarned = bn(parsed.sessionGoldEarned || 0);
        }

        // Restore Map types
        if (parsed.marketPrices) {
          parsed.marketPrices = new Map(Array.isArray(parsed.marketPrices) ? parsed.marketPrices : []);
        } else {
          parsed.marketPrices = new Map();
        }

        if (parsed.caravanUpgrades) {
          parsed.caravanUpgrades = new Map(Array.isArray(parsed.caravanUpgrades) ? parsed.caravanUpgrades : []);
        } else {
          parsed.caravanUpgrades = new Map();
        }

        return parsed;
      },
    },
  },
});
