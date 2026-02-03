/**
 * Scientist path data definitions
 * Research, Potions, Golems
 */

import type {
  Research,
  PotionRecipe,
  GolemBlueprint,
  GolemUpgrade,
  Ingredient,
} from '@projects-center/entities/ateria-idle/scientist';

// ============================================
// INGREDIENTS
// ============================================

export const INGREDIENTS: Record<string, Ingredient> = {
  // Herbs (Tier 1)
  healing_herb: {
    id: 'healing_herb',
    name: 'Zioło Lecznicze',
    description: 'Podstawowy składnik mikstur leczących',
    icon: 'mdi-leaf',
    category: 'herb',
    tier: 1,
    rarity: 'common',
  },
  fire_blossom: {
    id: 'fire_blossom',
    name: 'Ognisty Kwiat',
    description: 'Płonący kwiat z wulkanicznych terenów',
    icon: 'mdi-flower',
    category: 'herb',
    tier: 2,
    rarity: 'uncommon',
  },
  moonshade: {
    id: 'moonshade',
    name: 'Cień Księżyca',
    description: 'Rzadkie zioło rosnące tylko w świetle księżyca',
    icon: 'mdi-weather-night',
    category: 'herb',
    tier: 3,
    rarity: 'rare',
  },
  dragons_breath: {
    id: 'dragons_breath',
    name: 'Oddech Smoka',
    description: 'Legendarny kwiat z gór smoczych',
    icon: 'mdi-fire',
    category: 'herb',
    tier: 4,
    rarity: 'epic',
  },

  // Minerals (Tier 1-4)
  salt_crystal: {
    id: 'salt_crystal',
    name: 'Kryształ Soli',
    description: 'Oczyszczający minerał',
    icon: 'mdi-diamond-stone',
    category: 'mineral',
    tier: 1,
    rarity: 'common',
  },
  sulfur: {
    id: 'sulfur',
    name: 'Siarka',
    description: 'Żółty minerał o ostrym zapachu',
    icon: 'mdi-molecule',
    category: 'mineral',
    tier: 1,
    rarity: 'common',
  },
  quicksilver: {
    id: 'quicksilver',
    name: 'Rtęć',
    description: 'Płynny metal o magicznych właściwościach',
    icon: 'mdi-water',
    category: 'mineral',
    tier: 2,
    rarity: 'uncommon',
  },
  philosophers_ite: {
    id: 'philosophers_ite',
    name: 'Kamień Filozofów',
    description: 'Legendarny minerał alchemików',
    icon: 'mdi-diamond',
    category: 'mineral',
    tier: 4,
    rarity: 'legendary',
  },

  // Essences (Tier 2-4)
  magic_essence: {
    id: 'magic_essence',
    name: 'Esencja Magii',
    description: 'Skoncentrowana energia magiczna',
    icon: 'mdi-shimmer',
    category: 'essence',
    tier: 2,
    rarity: 'uncommon',
  },
  life_essence: {
    id: 'life_essence',
    name: 'Esencja Życia',
    description: 'Czysta energia życiowa',
    icon: 'mdi-heart-pulse',
    category: 'essence',
    tier: 3,
    rarity: 'rare',
  },
  chaos_essence: {
    id: 'chaos_essence',
    name: 'Esencja Chaosu',
    description: 'Niestabilna energia z otchłani',
    icon: 'mdi-atom-variant',
    category: 'essence',
    tier: 4,
    rarity: 'epic',
  },

  // Monster Parts
  slime_gel: {
    id: 'slime_gel',
    name: 'Żel Szlamu',
    description: 'Lepka substancja ze szlamów',
    icon: 'mdi-water-opacity',
    category: 'monster_part',
    tier: 1,
    rarity: 'common',
  },
  wolf_fang: {
    id: 'wolf_fang',
    name: 'Kieł Wilka',
    description: 'Ostry kieł drapieżnika',
    icon: 'mdi-tooth',
    category: 'monster_part',
    tier: 1,
    rarity: 'common',
  },
  troll_blood: {
    id: 'troll_blood',
    name: 'Krew Trolla',
    description: 'Regenerująca krew trolla',
    icon: 'mdi-water',
    category: 'monster_part',
    tier: 2,
    rarity: 'uncommon',
  },
  dragon_scale: {
    id: 'dragon_scale',
    name: 'Łuska Smoka',
    description: 'Pancerna łuska starożytnego smoka',
    icon: 'mdi-shield',
    category: 'monster_part',
    tier: 4,
    rarity: 'epic',
  },
};

// ============================================
// RESEARCH
// ============================================

export const RESEARCH: Record<string, Research> = {
  // COMBAT RESEARCH
  weapon_enhancement: {
    id: 'weapon_enhancement',
    name: 'Wzmocnienie Broni',
    description: 'Zwiększa obrażenia zadawane przez Wojownika',
    category: 'combat',
    icon: 'mdi-sword',
    requiredLevel: 1,
    requiredResearch: [],
    requiredFlasks: { red: 10 },
    maxLevel: 25,
    baseCost: 10,
    costMultiplier: 1.15,
    softCapLevel: 15,
    effects: [
      { type: 'stat_bonus', target: 'warrior.attack', value: 5, valuePerLevel: 2 },
    ],
  },
  armor_reinforcement: {
    id: 'armor_reinforcement',
    name: 'Wzmocnienie Pancerza',
    description: 'Zwiększa obronę Wojownika',
    category: 'combat',
    icon: 'mdi-shield',
    requiredLevel: 3,
    requiredResearch: ['weapon_enhancement'],
    requiredFlasks: { red: 15 },
    maxLevel: 25,
    baseCost: 15,
    costMultiplier: 1.15,
    softCapLevel: 15,
    effects: [
      { type: 'stat_bonus', target: 'warrior.defense', value: 5, valuePerLevel: 2 },
    ],
  },
  critical_strikes: {
    id: 'critical_strikes',
    name: 'Krytyczne Ciosy',
    description: 'Zwiększa szansę na trafienie krytyczne',
    category: 'combat',
    icon: 'mdi-bullseye-arrow',
    requiredLevel: 5,
    requiredResearch: ['weapon_enhancement'],
    requiredFlasks: { red: 25, green: 5 },
    maxLevel: 15,
    baseCost: 25,
    costMultiplier: 1.2,
    softCapLevel: 10,
    effects: [
      { type: 'stat_bonus', target: 'warrior.critChance', value: 2, valuePerLevel: 1 },
    ],
  },
  vitality_boost: {
    id: 'vitality_boost',
    name: 'Wzmocnienie Witalności',
    description: 'Zwiększa maksymalne HP Wojownika',
    category: 'combat',
    icon: 'mdi-heart-plus',
    requiredLevel: 4,
    requiredResearch: ['armor_reinforcement'],
    requiredFlasks: { red: 20, green: 10 },
    maxLevel: 20,
    baseCost: 20,
    costMultiplier: 1.15,
    softCapLevel: 12,
    effects: [
      { type: 'stat_bonus', target: 'warrior.maxHp', value: 10, valuePerLevel: 5 },
    ],
  },

  // ALCHEMY RESEARCH
  basic_alchemy: {
    id: 'basic_alchemy',
    name: 'Podstawy Alchemii',
    description: 'Odblokuj produkcję mikstur',
    category: 'alchemy',
    icon: 'mdi-flask',
    requiredLevel: 2,
    requiredResearch: [],
    requiredFlasks: { red: 20 },
    maxLevel: 1,
    baseCost: 20,
    costMultiplier: 1,
    softCapLevel: 1,
    effects: [
      { type: 'unlock_feature', target: 'alchemy', value: 1, valuePerLevel: 0 },
    ],
  },
  potion_efficiency: {
    id: 'potion_efficiency',
    name: 'Wydajność Mikstur',
    description: 'Zwiększa ilość produkowanych mikstur',
    category: 'alchemy',
    icon: 'mdi-beaker-plus',
    requiredLevel: 4,
    requiredResearch: ['basic_alchemy'],
    requiredFlasks: { red: 15, green: 10 },
    maxLevel: 20,
    baseCost: 25,
    costMultiplier: 1.18,
    softCapLevel: 12,
    effects: [
      { type: 'production_bonus', target: 'potion', value: 10, valuePerLevel: 5 },
    ],
  },
  advanced_alchemy: {
    id: 'advanced_alchemy',
    name: 'Zaawansowana Alchemia',
    description: 'Odblokuj mikstury Tier 2',
    category: 'alchemy',
    icon: 'mdi-flask-round-bottom',
    requiredLevel: 8,
    requiredResearch: ['potion_efficiency'],
    requiredFlasks: { red: 50, green: 30 },
    maxLevel: 1,
    baseCost: 100,
    costMultiplier: 1,
    softCapLevel: 1,
    effects: [
      { type: 'unlock_feature', target: 'alchemy_t2', value: 1, valuePerLevel: 0 },
    ],
  },
  master_alchemy: {
    id: 'master_alchemy',
    name: 'Mistrzowska Alchemia',
    description: 'Odblokuj mikstury Tier 3 i Blue Flasks',
    category: 'alchemy',
    icon: 'mdi-star-circle',
    requiredLevel: 15,
    requiredResearch: ['advanced_alchemy'],
    requiredFlasks: { red: 100, green: 75, blue: 25 },
    maxLevel: 1,
    baseCost: 500,
    costMultiplier: 1,
    softCapLevel: 1,
    effects: [
      { type: 'unlock_feature', target: 'alchemy_t3', value: 1, valuePerLevel: 0 },
      { type: 'unlock_feature', target: 'blue_flasks', value: 1, valuePerLevel: 0 },
    ],
  },

  // AUTOMATION RESEARCH
  basic_golemancy: {
    id: 'basic_golemancy',
    name: 'Podstawy Golemancji',
    description: 'Odblokuj tworzenie golemów',
    category: 'automation',
    icon: 'mdi-robot',
    requiredLevel: 5,
    requiredResearch: [],
    requiredFlasks: { red: 30, green: 15 },
    maxLevel: 1,
    baseCost: 50,
    costMultiplier: 1,
    softCapLevel: 1,
    effects: [
      { type: 'unlock_feature', target: 'golems', value: 1, valuePerLevel: 0 },
      { type: 'golem_slot', target: 'workshop', value: 1, valuePerLevel: 0 },
    ],
  },
  golem_durability: {
    id: 'golem_durability',
    name: 'Trwałość Golemów',
    description: 'Zmniejsza zużycie integralności golemów',
    category: 'automation',
    icon: 'mdi-shield-check',
    requiredLevel: 7,
    requiredResearch: ['basic_golemancy'],
    requiredFlasks: { red: 25, green: 20 },
    maxLevel: 15,
    baseCost: 40,
    costMultiplier: 1.2,
    softCapLevel: 10,
    effects: [
      { type: 'stat_bonus', target: 'golem.decay_reduction', value: 5, valuePerLevel: 3 },
    ],
  },
  golem_efficiency: {
    id: 'golem_efficiency',
    name: 'Wydajność Golemów',
    description: 'Zwiększa efektywność pracy golemów',
    category: 'automation',
    icon: 'mdi-cog',
    requiredLevel: 8,
    requiredResearch: ['basic_golemancy'],
    requiredFlasks: { red: 30, green: 25 },
    maxLevel: 20,
    baseCost: 45,
    costMultiplier: 1.18,
    softCapLevel: 12,
    effects: [
      { type: 'stat_bonus', target: 'golem.efficiency', value: 5, valuePerLevel: 3 },
    ],
  },
  advanced_golemancy: {
    id: 'advanced_golemancy',
    name: 'Zaawansowana Golemancja',
    description: 'Odblokuj dodatkowy slot golema i nowe typy',
    category: 'automation',
    icon: 'mdi-robot-industrial',
    requiredLevel: 12,
    requiredResearch: ['golem_durability', 'golem_efficiency'],
    requiredFlasks: { red: 75, green: 50, blue: 10 },
    maxLevel: 1,
    baseCost: 200,
    costMultiplier: 1,
    softCapLevel: 1,
    effects: [
      { type: 'golem_slot', target: 'workshop', value: 1, valuePerLevel: 0 },
      { type: 'unlock_feature', target: 'combat_golem', value: 1, valuePerLevel: 0 },
    ],
  },
  auto_repair: {
    id: 'auto_repair',
    name: 'Automatyczna Naprawa',
    description: 'Golemy naprawiają się automatycznie gdy ich integralność > 50%',
    category: 'automation',
    icon: 'mdi-wrench',
    requiredLevel: 15,
    requiredResearch: ['advanced_golemancy'],
    requiredFlasks: { red: 100, green: 75, blue: 25 },
    maxLevel: 1,
    baseCost: 300,
    costMultiplier: 1,
    softCapLevel: 1,
    effects: [
      { type: 'unlock_feature', target: 'auto_repair', value: 1, valuePerLevel: 0 },
    ],
  },

  // EFFICIENCY RESEARCH
  flask_production: {
    id: 'flask_production',
    name: 'Produkcja Kolb',
    description: 'Zwiększa produkcję Red Flasks',
    category: 'efficiency',
    icon: 'mdi-test-tube',
    requiredLevel: 1,
    requiredResearch: [],
    requiredFlasks: { red: 5 },
    maxLevel: 30,
    baseCost: 5,
    costMultiplier: 1.12,
    softCapLevel: 20,
    effects: [
      { type: 'flask_production', target: 'red', value: 0.1, valuePerLevel: 0.05 },
    ],
  },
  green_flask_production: {
    id: 'green_flask_production',
    name: 'Zielone Kolby',
    description: 'Odblokuj i zwiększ produkcję Green Flasks',
    category: 'efficiency',
    icon: 'mdi-flask-outline',
    requiredLevel: 5,
    requiredResearch: ['flask_production'],
    requiredFlasks: { red: 40 },
    maxLevel: 25,
    baseCost: 30,
    costMultiplier: 1.15,
    softCapLevel: 15,
    effects: [
      { type: 'unlock_feature', target: 'green_flasks', value: 1, valuePerLevel: 0 },
      { type: 'flask_production', target: 'green', value: 0.05, valuePerLevel: 0.03 },
    ],
  },
  research_speed: {
    id: 'research_speed',
    name: 'Prędkość Badań',
    description: 'Zwiększa szybkość prowadzenia badań',
    category: 'efficiency',
    icon: 'mdi-speedometer',
    requiredLevel: 3,
    requiredResearch: [],
    requiredFlasks: { red: 15 },
    maxLevel: 20,
    baseCost: 20,
    costMultiplier: 1.18,
    softCapLevel: 12,
    effects: [
      { type: 'speed_bonus', target: 'research', value: 5, valuePerLevel: 3 },
    ],
  },

  // TRADING RESEARCH
  market_analysis: {
    id: 'market_analysis',
    name: 'Analiza Rynku',
    description: 'Zwiększa zyski ze sprzedaży',
    category: 'trading',
    icon: 'mdi-chart-line',
    requiredLevel: 6,
    requiredResearch: [],
    requiredFlasks: { red: 25, green: 10 },
    maxLevel: 15,
    baseCost: 35,
    costMultiplier: 1.2,
    softCapLevel: 10,
    effects: [
      { type: 'stat_bonus', target: 'merchant.goldMultiplier', value: 5, valuePerLevel: 2 },
    ],
  },
  logistics_optimization: {
    id: 'logistics_optimization',
    name: 'Optymalizacja Logistyki',
    description: 'Zwiększa pojemność karawan',
    category: 'trading',
    icon: 'mdi-truck-fast',
    requiredLevel: 10,
    requiredResearch: ['market_analysis'],
    requiredFlasks: { red: 50, green: 30 },
    maxLevel: 10,
    baseCost: 60,
    costMultiplier: 1.25,
    softCapLevel: 6,
    effects: [
      { type: 'stat_bonus', target: 'caravan.capacity', value: 10, valuePerLevel: 5 },
    ],
  },
  haggle_mastery: {
    id: 'haggle_mastery',
    name: 'Mistrzostwo Targowania',
    description: 'Zwiększa szansę sukcesu podczas targowania',
    category: 'trading',
    icon: 'mdi-handshake',
    requiredLevel: 12,
    requiredResearch: ['market_analysis'],
    requiredFlasks: { red: 40, green: 25 },
    maxLevel: 15,
    baseCost: 50,
    costMultiplier: 1.18,
    softCapLevel: 10,
    effects: [
      { type: 'stat_bonus', target: 'merchant.haggleBonus', value: 5, valuePerLevel: 3 },
    ],
  },
  customer_attraction: {
    id: 'customer_attraction',
    name: 'Przyciąganie Klientów',
    description: 'Zwiększa częstotliwość pojawiania się klientów',
    category: 'trading',
    icon: 'mdi-account-group',
    requiredLevel: 8,
    requiredResearch: [],
    requiredFlasks: { red: 30, green: 15 },
    maxLevel: 20,
    baseCost: 40,
    costMultiplier: 1.15,
    softCapLevel: 12,
    effects: [
      { type: 'stat_bonus', target: 'merchant.customerRate', value: 5, valuePerLevel: 3 },
    ],
  },

  // SURVIVAL RESEARCH (New Category)
  food_preservation: {
    id: 'food_preservation',
    name: 'Konserwacja Żywności',
    description: 'Zmniejsza zużycie jedzenia',
    category: 'survival',
    icon: 'mdi-food-variant',
    requiredLevel: 3,
    requiredResearch: [],
    requiredFlasks: { red: 15 },
    maxLevel: 20,
    baseCost: 15,
    costMultiplier: 1.12,
    softCapLevel: 12,
    effects: [
      { type: 'stat_bonus', target: 'warrior.foodEfficiency', value: 5, valuePerLevel: 3 },
    ],
  },
  cooking_mastery: {
    id: 'cooking_mastery',
    name: 'Mistrzostwo Gotowania',
    description: 'Zwiększa efektywność leczenia z jedzenia',
    category: 'survival',
    icon: 'mdi-chef-hat',
    requiredLevel: 5,
    requiredResearch: ['food_preservation'],
    requiredFlasks: { red: 25, green: 10 },
    maxLevel: 15,
    baseCost: 30,
    costMultiplier: 1.15,
    softCapLevel: 10,
    effects: [
      { type: 'stat_bonus', target: 'warrior.foodHealBonus', value: 10, valuePerLevel: 5 },
    ],
  },
  auto_eat_optimization: {
    id: 'auto_eat_optimization',
    name: 'Optymalizacja Auto-jedzenia',
    description: 'Zmniejsza próg auto-jedzenia o 5% na poziom',
    category: 'survival',
    icon: 'mdi-silverware-fork-knife',
    requiredLevel: 7,
    requiredResearch: ['food_preservation'],
    requiredFlasks: { red: 30, green: 15 },
    maxLevel: 10,
    baseCost: 35,
    costMultiplier: 1.2,
    softCapLevel: 6,
    effects: [
      { type: 'stat_bonus', target: 'warrior.autoEatThreshold', value: -5, valuePerLevel: -2 },
    ],
  },
  biome_adaptation: {
    id: 'biome_adaptation',
    name: 'Adaptacja do Biomów',
    description: 'Zmniejsza negatywne efekty środowiskowe',
    category: 'survival',
    icon: 'mdi-weather-partly-cloudy',
    requiredLevel: 10,
    requiredResearch: ['cooking_mastery'],
    requiredFlasks: { red: 50, green: 30 },
    maxLevel: 10,
    baseCost: 60,
    costMultiplier: 1.25,
    softCapLevel: 6,
    effects: [
      { type: 'stat_bonus', target: 'warrior.environmentResist', value: 10, valuePerLevel: 5 },
    ],
  },

  // EXPLORATION RESEARCH (New Category)
  dungeon_mapping: {
    id: 'dungeon_mapping',
    name: 'Mapowanie Lochów',
    description: 'Zwiększa nagrody z lochów',
    category: 'exploration',
    icon: 'mdi-map',
    requiredLevel: 8,
    requiredResearch: [],
    requiredFlasks: { red: 35, green: 15 },
    maxLevel: 15,
    baseCost: 45,
    costMultiplier: 1.18,
    softCapLevel: 10,
    effects: [
      { type: 'stat_bonus', target: 'dungeon.rewardBonus', value: 5, valuePerLevel: 3 },
    ],
  },
  key_crafting: {
    id: 'key_crafting',
    name: 'Wytwarzanie Kluczy',
    description: 'Zmniejsza koszt tworzenia kluczy do lochów',
    category: 'exploration',
    icon: 'mdi-key-variant',
    requiredLevel: 10,
    requiredResearch: ['dungeon_mapping'],
    requiredFlasks: { red: 45, green: 25 },
    maxLevel: 10,
    baseCost: 55,
    costMultiplier: 1.2,
    softCapLevel: 6,
    effects: [
      { type: 'stat_bonus', target: 'dungeon.keyCostReduction', value: 5, valuePerLevel: 3 },
    ],
  },
  slayer_expertise: {
    id: 'slayer_expertise',
    name: 'Ekspertyza Łowcy',
    description: 'Zwiększa XP i monety z zadań łowcy',
    category: 'exploration',
    icon: 'mdi-target-account',
    requiredLevel: 12,
    requiredResearch: ['dungeon_mapping'],
    requiredFlasks: { red: 55, green: 35 },
    maxLevel: 15,
    baseCost: 65,
    costMultiplier: 1.18,
    softCapLevel: 10,
    effects: [
      { type: 'stat_bonus', target: 'slayer.xpBonus', value: 5, valuePerLevel: 3 },
      { type: 'stat_bonus', target: 'slayer.coinBonus', value: 5, valuePerLevel: 3 },
    ],
  },
  loot_analysis: {
    id: 'loot_analysis',
    name: 'Analiza Łupów',
    description: 'Zwiększa szansę na rzadki loot',
    category: 'exploration',
    icon: 'mdi-treasure-chest',
    requiredLevel: 15,
    requiredResearch: ['slayer_expertise'],
    requiredFlasks: { red: 75, green: 50, blue: 10 },
    maxLevel: 10,
    baseCost: 100,
    costMultiplier: 1.25,
    softCapLevel: 6,
    effects: [
      { type: 'stat_bonus', target: 'warrior.rareLootChance', value: 5, valuePerLevel: 3 },
    ],
  },

  // INTEGRATION RESEARCH (New Category - Cross-path synergies)
  warrior_scientist_link: {
    id: 'warrior_scientist_link',
    name: 'Więź Wojownika i Naukowca',
    description: 'Mikstury mają 10% większy efekt na Wojownika',
    category: 'integration',
    icon: 'mdi-link-variant',
    requiredLevel: 10,
    requiredResearch: ['basic_alchemy'],
    requiredFlasks: { red: 50, green: 30 },
    maxLevel: 5,
    baseCost: 75,
    costMultiplier: 1.3,
    softCapLevel: 3,
    effects: [
      { type: 'stat_bonus', target: 'integration.potionEffectBonus', value: 10, valuePerLevel: 5 },
    ],
  },
  merchant_scientist_link: {
    id: 'merchant_scientist_link',
    name: 'Więź Kupca i Naukowca',
    description: 'Mikstury sprzedają się za 10% więcej',
    category: 'integration',
    icon: 'mdi-flask-plus',
    requiredLevel: 12,
    requiredResearch: ['basic_alchemy', 'market_analysis'],
    requiredFlasks: { red: 60, green: 40 },
    maxLevel: 5,
    baseCost: 85,
    costMultiplier: 1.3,
    softCapLevel: 3,
    effects: [
      { type: 'stat_bonus', target: 'integration.potionSaleBonus', value: 10, valuePerLevel: 5 },
    ],
  },
  warrior_merchant_link: {
    id: 'warrior_merchant_link',
    name: 'Więź Wojownika i Kupca',
    description: 'Łupy z walki są warte 10% więcej przy sprzedaży',
    category: 'integration',
    icon: 'mdi-sword',
    requiredLevel: 10,
    requiredResearch: ['market_analysis'],
    requiredFlasks: { red: 50, green: 25 },
    maxLevel: 5,
    baseCost: 70,
    costMultiplier: 1.3,
    softCapLevel: 3,
    effects: [
      { type: 'stat_bonus', target: 'integration.lootValueBonus', value: 10, valuePerLevel: 5 },
    ],
  },
  auto_loot_transfer: {
    id: 'auto_loot_transfer',
    name: 'Automatyczny Transfer Łupów',
    description: 'Łupy są automatycznie przenoszone do sklepu',
    category: 'integration',
    icon: 'mdi-transfer',
    requiredLevel: 15,
    requiredResearch: ['warrior_merchant_link'],
    requiredFlasks: { red: 80, green: 50, blue: 15 },
    maxLevel: 1,
    baseCost: 200,
    costMultiplier: 1,
    softCapLevel: 1,
    effects: [
      { type: 'unlock_feature', target: 'auto_loot_transfer', value: 1, valuePerLevel: 0 },
    ],
  },
  potion_allocation_system: {
    id: 'potion_allocation_system',
    name: 'System Alokacji Mikstur',
    description: 'Odblokuj automatyczną dystrybucję mikstur',
    category: 'integration',
    icon: 'mdi-flask-outline',
    requiredLevel: 8,
    requiredResearch: ['basic_alchemy'],
    requiredFlasks: { red: 40, green: 25 },
    maxLevel: 1,
    baseCost: 60,
    costMultiplier: 1,
    softCapLevel: 1,
    effects: [
      { type: 'unlock_feature', target: 'potion_allocation', value: 1, valuePerLevel: 0 },
    ],
  },
};

// ============================================
// POTIONS
// ============================================

export const POTIONS: Record<string, PotionRecipe> = {
  // TIER 1 - Basic Potions
  health_potion_small: {
    id: 'health_potion_small',
    name: 'Mała Mikstura Życia',
    description: 'Przywraca 50 HP',
    icon: 'mdi-bottle-tonic-plus',
    tier: 1,
    ingredients: [
      { ingredientId: 'healing_herb', amount: 2 },
      { ingredientId: 'slime_gel', amount: 1 },
    ],
    requiredLevel: 2,
    craftTime: 100,
    outputAmount: 3,
    effects: [{ type: 'heal_hp', value: 50 }],
    discovered: true,
  },
  strength_potion: {
    id: 'strength_potion',
    name: 'Mikstura Siły',
    description: '+15% Ataku przez 60 sekund',
    icon: 'mdi-arm-flex',
    tier: 1,
    ingredients: [
      { ingredientId: 'wolf_fang', amount: 2 },
      { ingredientId: 'salt_crystal', amount: 1 },
    ],
    requiredLevel: 3,
    craftTime: 150,
    outputAmount: 2,
    effects: [{ type: 'buff_attack', value: 15, duration: 600 }],
    discovered: false,
    discoveryHint: 'Połącz siłę drapieżnika z oczyszczającym minerałem',
  },
  speed_potion: {
    id: 'speed_potion',
    name: 'Mikstura Prędkości',
    description: '+20% Prędkości Ataku przez 45 sekund',
    icon: 'mdi-lightning-bolt',
    tier: 1,
    ingredients: [
      { ingredientId: 'healing_herb', amount: 1 },
      { ingredientId: 'sulfur', amount: 2 },
    ],
    requiredLevel: 3,
    craftTime: 120,
    outputAmount: 2,
    effects: [{ type: 'buff_speed', value: 20, duration: 450 }],
    discovered: false,
    discoveryHint: 'Szybkość wymaga energii i ciepła',
  },

  // TIER 2 - Advanced Potions
  health_potion_medium: {
    id: 'health_potion_medium',
    name: 'Średnia Mikstura Życia',
    description: 'Przywraca 150 HP',
    icon: 'mdi-bottle-tonic-plus',
    tier: 2,
    ingredients: [
      { ingredientId: 'healing_herb', amount: 3 },
      { ingredientId: 'troll_blood', amount: 1 },
      { ingredientId: 'magic_essence', amount: 1 },
    ],
    requiredLevel: 8,
    requiredResearch: 'advanced_alchemy',
    craftTime: 200,
    outputAmount: 2,
    effects: [{ type: 'heal_hp', value: 150 }],
    discovered: false,
    discoveryHint: 'Wzmocnij podstawową miksturę regenerującą krwią i magią',
  },
  defense_potion: {
    id: 'defense_potion',
    name: 'Mikstura Ochrony',
    description: '+20% Obrony przez 90 sekund',
    icon: 'mdi-shield-plus',
    tier: 2,
    ingredients: [
      { ingredientId: 'salt_crystal', amount: 2 },
      { ingredientId: 'troll_blood', amount: 1 },
      { ingredientId: 'quicksilver', amount: 1 },
    ],
    requiredLevel: 9,
    requiredResearch: 'advanced_alchemy',
    craftTime: 180,
    outputAmount: 2,
    effects: [{ type: 'buff_defense', value: 20, duration: 900 }],
    discovered: false,
    discoveryHint: 'Ochrona wymaga twardości minerałów i płynności metalu',
  },
  critical_potion: {
    id: 'critical_potion',
    name: 'Mikstura Precyzji',
    description: '+10% Szansy na Krytyk przez 2 minuty',
    icon: 'mdi-bullseye',
    tier: 2,
    ingredients: [
      { ingredientId: 'fire_blossom', amount: 2 },
      { ingredientId: 'magic_essence', amount: 2 },
    ],
    requiredLevel: 10,
    requiredResearch: 'advanced_alchemy',
    craftTime: 220,
    outputAmount: 2,
    effects: [{ type: 'buff_crit', value: 10, duration: 1200 }],
    discovered: false,
    discoveryHint: 'Precyzja wymaga ognia i skupienia magii',
  },
  xp_potion: {
    id: 'xp_potion',
    name: 'Mikstura Mądrości',
    description: '+25% Zdobywanego XP przez 5 minut',
    icon: 'mdi-star-plus',
    tier: 2,
    ingredients: [
      { ingredientId: 'moonshade', amount: 1 },
      { ingredientId: 'magic_essence', amount: 2 },
      { ingredientId: 'slime_gel', amount: 2 },
    ],
    requiredLevel: 10,
    requiredResearch: 'advanced_alchemy',
    craftTime: 300,
    outputAmount: 1,
    effects: [{ type: 'buff_xp', value: 25, duration: 3000 }],
    discovered: false,
    discoveryHint: 'Mądrość przychodzi w świetle księżyca z pomocą magii',
  },

  // TIER 3 - Master Potions
  health_potion_large: {
    id: 'health_potion_large',
    name: 'Duża Mikstura Życia',
    description: 'Przywraca 400 HP',
    icon: 'mdi-bottle-tonic-plus',
    tier: 3,
    ingredients: [
      { ingredientId: 'moonshade', amount: 2 },
      { ingredientId: 'life_essence', amount: 2 },
      { ingredientId: 'troll_blood', amount: 2 },
    ],
    requiredLevel: 15,
    requiredResearch: 'master_alchemy',
    craftTime: 400,
    outputAmount: 2,
    effects: [{ type: 'heal_hp', value: 400 }],
    discovered: false,
    discoveryHint: 'Połącz esencję życia z regeneracją i mocą nocy',
  },
  berserker_potion: {
    id: 'berserker_potion',
    name: 'Mikstura Berserkera',
    description: '+40% Ataku, -15% Obrony przez 2 minuty',
    icon: 'mdi-sword-cross',
    tier: 3,
    ingredients: [
      { ingredientId: 'dragons_breath', amount: 1 },
      { ingredientId: 'chaos_essence', amount: 1 },
      { ingredientId: 'wolf_fang', amount: 3 },
    ],
    requiredLevel: 18,
    requiredResearch: 'master_alchemy',
    craftTime: 500,
    outputAmount: 1,
    effects: [
      { type: 'buff_attack', value: 40, duration: 1200 },
      { type: 'buff_defense', value: -15, duration: 1200 },
    ],
    discovered: false,
    discoveryHint: 'Siła wymaga chaosu i ognia - ale za cenę obrony',
  },
  regeneration_potion: {
    id: 'regeneration_potion',
    name: 'Mikstura Regeneracji',
    description: 'Regeneruje 5 HP/sekundę przez 2 minuty',
    icon: 'mdi-heart-flash',
    tier: 3,
    ingredients: [
      { ingredientId: 'life_essence', amount: 3 },
      { ingredientId: 'troll_blood', amount: 2 },
      { ingredientId: 'healing_herb', amount: 5 },
    ],
    requiredLevel: 16,
    requiredResearch: 'master_alchemy',
    craftTime: 450,
    outputAmount: 1,
    effects: [{ type: 'regen_hp', value: 5, duration: 1200 }],
    discovered: false,
    discoveryHint: 'Ciągła regeneracja wymaga czystej esencji życia',
  },
  gold_potion: {
    id: 'gold_potion',
    name: 'Mikstura Fortuny',
    description: '+50% Złota z potworów przez 10 minut',
    icon: 'mdi-gold',
    tier: 3,
    ingredients: [
      { ingredientId: 'philosophers_ite', amount: 1 },
      { ingredientId: 'quicksilver', amount: 3 },
      { ingredientId: 'magic_essence', amount: 3 },
    ],
    requiredLevel: 20,
    requiredResearch: 'master_alchemy',
    craftTime: 600,
    outputAmount: 1,
    effects: [{ type: 'buff_gold', value: 50, duration: 6000 }],
    discovered: false,
    discoveryHint: 'Prawdziwe złoto rodzi się z legendarnego kamienia',
  },

  // ============================================
  // ENVIRONMENTAL RESISTANCE POTIONS
  // ============================================

  antidote: {
    id: 'antidote',
    name: 'Antidotum',
    description: 'Chroni przed trucizną przez 5 minut (Trujące Bagna)',
    icon: 'mdi-bottle-tonic-skull',
    tier: 2,
    ingredients: [
      { ingredientId: 'healing_herb', amount: 3 },
      { ingredientId: 'slime_gel', amount: 2 },
      { ingredientId: 'salt_crystal', amount: 1 },
    ],
    requiredLevel: 10,
    requiredResearch: 'advanced_alchemy',
    craftTime: 180,
    outputAmount: 2,
    effects: [{ type: 'resist_element', value: 100, duration: 3000 }],
    discovered: false,
    discoveryHint: 'Neutralizuj truciznę przez oczyszczenie i leczenie',
  },
  cooling_elixir: {
    id: 'cooling_elixir',
    name: 'Eliksir Chłodu',
    description: 'Chroni przed upałem przez 5 minut (Płonące Piaski)',
    icon: 'mdi-snowflake',
    tier: 2,
    ingredients: [
      { ingredientId: 'moonshade', amount: 1 },
      { ingredientId: 'salt_crystal', amount: 2 },
      { ingredientId: 'slime_gel', amount: 2 },
    ],
    requiredLevel: 12,
    requiredResearch: 'advanced_alchemy',
    craftTime: 200,
    outputAmount: 2,
    effects: [{ type: 'resist_element', value: 100, duration: 3000 }],
    discovered: false,
    discoveryHint: 'Chłód nocy i sól morza chronią przed upałem',
  },
  fire_resistance: {
    id: 'fire_resistance',
    name: 'Mikstura Ognioodporności',
    description: 'Chroni przed ogniem przez 5 minut (Ognista Otchłań)',
    icon: 'mdi-fire-off',
    tier: 3,
    ingredients: [
      { ingredientId: 'fire_blossom', amount: 2 },
      { ingredientId: 'dragon_scale', amount: 1 },
      { ingredientId: 'magic_essence', amount: 2 },
    ],
    requiredLevel: 18,
    requiredResearch: 'master_alchemy',
    craftTime: 350,
    outputAmount: 1,
    effects: [{ type: 'resist_element', value: 100, duration: 3000 }],
    discovered: false,
    discoveryHint: 'Smocza łuska i ognisty kwiat dają odporność na płomienie',
  },
  warming_elixir: {
    id: 'warming_elixir',
    name: 'Eliksir Ciepła',
    description: 'Chroni przed zimnem przez 5 minut (Wieczna Zmarzlina)',
    icon: 'mdi-thermometer-high',
    tier: 2,
    ingredients: [
      { ingredientId: 'fire_blossom', amount: 2 },
      { ingredientId: 'troll_blood', amount: 1 },
      { ingredientId: 'sulfur', amount: 2 },
    ],
    requiredLevel: 14,
    requiredResearch: 'advanced_alchemy',
    craftTime: 220,
    outputAmount: 2,
    effects: [{ type: 'resist_element', value: 100, duration: 3000 }],
    discovered: false,
    discoveryHint: 'Ogień i siarka rozgrzeją nawet w najzimniejsze noce',
  },
  void_ward: {
    id: 'void_ward',
    name: 'Ochrona Pustki',
    description: 'Chroni przed korupcją przez 5 minut (Otchłań)',
    icon: 'mdi-shield-star',
    tier: 3,
    ingredients: [
      { ingredientId: 'chaos_essence', amount: 2 },
      { ingredientId: 'life_essence', amount: 2 },
      { ingredientId: 'philosophers_ite', amount: 1 },
    ],
    requiredLevel: 25,
    requiredResearch: 'master_alchemy',
    craftTime: 500,
    outputAmount: 1,
    effects: [{ type: 'resist_element', value: 100, duration: 3000 }],
    discovered: false,
    discoveryHint: 'Równowaga chaosu i życia chroni przed pustką',
  },
};

// ============================================
// GOLEMS
// ============================================

export const GOLEM_BLUEPRINTS: Record<string, GolemBlueprint> = {
  mining_golem: {
    id: 'mining_golem',
    name: 'Golem Górniczy',
    description: 'Wydobywa rudę automatycznie',
    type: 'mining',
    icon: 'mdi-pickaxe',
    requiredLevel: 5,
    requiredResearch: 'basic_golemancy',
    craftCost: {
      gold: 500,
      materials: [
        { itemId: 'iron_ore', amount: 20 },
        { itemId: 'stone', amount: 30 },
      ],
      flasks: { red: 20, green: 10 },
    },
    baseIntegrity: 100,
    baseEfficiency: 1.0,
    baseSpeed: 1.0,
    integrityDecayRate: 0.1,
    repairCost: {
      materials: [
        { itemId: 'iron_ore', amount: 10 },
      ],
      flasks: { red: 5 },
    },
    workEffect: {
      type: 'produce_resource',
      target: 'iron_ore',
      baseValue: 1,
    },
  },
  hauling_golem: {
    id: 'hauling_golem',
    name: 'Golem Transportowy',
    description: 'Automatycznie przenosi towary do sklepu',
    type: 'hauling',
    icon: 'mdi-dolly',
    requiredLevel: 6,
    requiredResearch: 'basic_golemancy',
    craftCost: {
      gold: 400,
      materials: [
        { itemId: 'wood', amount: 25 },
        { itemId: 'iron_ore', amount: 10 },
      ],
      flasks: { red: 15, green: 10 },
    },
    baseIntegrity: 100,
    baseEfficiency: 1.0,
    baseSpeed: 1.2,
    integrityDecayRate: 0.05,
    repairCost: {
      materials: [
        { itemId: 'wood', amount: 5 },
      ],
      flasks: { red: 3 },
    },
    workEffect: {
      type: 'auto_transfer',
      target: 'scientist_to_merchant',
      baseValue: 5,
    },
  },
  research_golem: {
    id: 'research_golem',
    name: 'Golem Badawczy',
    description: 'Przyspiesza prowadzenie badań',
    type: 'research',
    icon: 'mdi-flask',
    requiredLevel: 8,
    requiredResearch: 'basic_golemancy',
    craftCost: {
      gold: 800,
      materials: [
        { itemId: 'magic_essence', amount: 5 },
        { itemId: 'quicksilver', amount: 3 },
      ],
      flasks: { red: 30, green: 20 },
    },
    baseIntegrity: 100,
    baseEfficiency: 1.0,
    baseSpeed: 1.0,
    integrityDecayRate: 0.08,
    repairCost: {
      materials: [
        { itemId: 'magic_essence', amount: 2 },
      ],
      flasks: { red: 10, green: 5 },
    },
    workEffect: {
      type: 'research_assist',
      baseValue: 0.15,
    },
  },
  alchemy_golem: {
    id: 'alchemy_golem',
    name: 'Golem Alchemiczny',
    description: 'Przyspiesza produkcję mikstur',
    type: 'alchemy',
    icon: 'mdi-beaker',
    requiredLevel: 10,
    requiredResearch: 'basic_golemancy',
    craftCost: {
      gold: 700,
      materials: [
        { itemId: 'magic_essence', amount: 3 },
        { itemId: 'slime_gel', amount: 10 },
      ],
      flasks: { red: 25, green: 15 },
    },
    baseIntegrity: 100,
    baseEfficiency: 1.0,
    baseSpeed: 1.0,
    integrityDecayRate: 0.07,
    repairCost: {
      materials: [
        { itemId: 'slime_gel', amount: 5 },
      ],
      flasks: { red: 8, green: 3 },
    },
    workEffect: {
      type: 'alchemy_assist',
      baseValue: 0.2,
    },
  },
  combat_golem: {
    id: 'combat_golem',
    name: 'Golem Bojowy',
    description: 'Walczy u boku Wojownika jako wsparcie',
    type: 'combat',
    icon: 'mdi-robot-angry',
    requiredLevel: 12,
    requiredResearch: 'advanced_golemancy',
    craftCost: {
      gold: 1500,
      materials: [
        { itemId: 'iron_ore', amount: 50 },
        { itemId: 'magic_essence', amount: 10 },
        { itemId: 'dragon_scale', amount: 1 },
      ],
      flasks: { red: 50, green: 30, blue: 10 },
    },
    baseIntegrity: 100,
    baseEfficiency: 1.0,
    baseSpeed: 0.8,
    integrityDecayRate: 1.0,
    repairCost: {
      materials: [
        { itemId: 'iron_ore', amount: 20 },
        { itemId: 'magic_essence', amount: 5 },
      ],
      flasks: { red: 15, green: 10 },
    },
    workEffect: {
      type: 'combat_support',
      baseValue: 0.1,
    },
  },
};

// ============================================
// GOLEM UPGRADES
// ============================================

export const GOLEM_UPGRADES: Record<string, GolemUpgrade> = {
  reinforced_frame: {
    id: 'reinforced_frame',
    name: 'Wzmocniona Rama',
    description: '+25% Integralności',
    golemTypes: ['mining', 'hauling', 'combat', 'research', 'alchemy'],
    icon: 'mdi-shield-plus',
    requiredLevel: 7,
    cost: {
      gold: 200,
      materials: [{ itemId: 'iron_ore', amount: 15 }],
      flasks: { red: 10 },
    },
    effects: [{ type: 'integrity', value: 25 }],
  },
  efficient_core: {
    id: 'efficient_core',
    name: 'Wydajny Rdzeń',
    description: '+15% Wydajności',
    golemTypes: ['mining', 'hauling', 'combat', 'research', 'alchemy'],
    icon: 'mdi-cog',
    requiredLevel: 9,
    cost: {
      gold: 300,
      materials: [{ itemId: 'magic_essence', amount: 3 }],
      flasks: { red: 15, green: 5 },
    },
    effects: [{ type: 'efficiency', value: 15 }],
  },
  speed_enhancement: {
    id: 'speed_enhancement',
    name: 'Ulepszenie Prędkości',
    description: '+20% Prędkości Pracy',
    golemTypes: ['mining', 'hauling', 'research', 'alchemy'],
    icon: 'mdi-lightning-bolt',
    requiredLevel: 10,
    cost: {
      gold: 350,
      materials: [{ itemId: 'quicksilver', amount: 2 }],
      flasks: { red: 20, green: 10 },
    },
    effects: [{ type: 'speed', value: 20 }],
  },
  self_repair: {
    id: 'self_repair',
    name: 'Samonaprawa',
    description: '-30% Spadku Integralności',
    golemTypes: ['mining', 'hauling', 'combat', 'research', 'alchemy'],
    icon: 'mdi-wrench',
    requiredLevel: 14,
    requiredResearch: 'auto_repair',
    cost: {
      gold: 500,
      materials: [
        { itemId: 'magic_essence', amount: 5 },
        { itemId: 'troll_blood', amount: 2 },
      ],
      flasks: { red: 30, green: 20, blue: 5 },
    },
    effects: [{ type: 'decay_reduction', value: 30 }],
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getResearch(id: string): Research | undefined {
  return RESEARCH[id];
}

export function getResearchByCategory(category: string): Research[] {
  return Object.values(RESEARCH).filter(r => r.category === category);
}

export function getAvailableResearch(
  level: number,
  completedResearch: string[]
): Research[] {
  return Object.values(RESEARCH).filter(r => {
    if (r.requiredLevel > level) return false;
    if (r.requiredResearch.some(req => !completedResearch.includes(req))) return false;
    return true;
  });
}

export function getPotion(id: string): PotionRecipe | undefined {
  return POTIONS[id];
}

export function getPotionsByTier(tier: number): PotionRecipe[] {
  return Object.values(POTIONS).filter(p => p.tier === tier);
}

export function getGolemBlueprint(id: string): GolemBlueprint | undefined {
  return GOLEM_BLUEPRINTS[id];
}

export function getAvailableGolems(
  level: number,
  completedResearch: string[]
): GolemBlueprint[] {
  return Object.values(GOLEM_BLUEPRINTS).filter(g => {
    if (g.requiredLevel > level) return false;
    if (g.requiredResearch && !completedResearch.includes(g.requiredResearch)) return false;
    return true;
  });
}

export function getIngredient(id: string): Ingredient | undefined {
  return INGREDIENTS[id];
}

export function getGolemUpgrade(id: string): GolemUpgrade | undefined {
  return GOLEM_UPGRADES[id];
}

// Flask colors for UI
export const FLASK_COLORS: Record<string, string> = {
  red: '#ef5350',
  green: '#66bb6a',
  blue: '#42a5f5',
};

export const FLASK_ICONS: Record<string, string> = {
  red: 'mdi-test-tube',
  green: 'mdi-flask',
  blue: 'mdi-flask-round-bottom',
};

// Research category colors
export const RESEARCH_CATEGORY_COLORS: Record<string, string> = {
  combat: '#ef5350',
  alchemy: '#ab47bc',
  automation: '#42a5f5',
  efficiency: '#66bb6a',
  trading: '#ffa726',
  magic: '#7e57c2',
  survival: '#8d6e63',
  exploration: '#26a69a',
  integration: '#ec407a',
};

export const RESEARCH_CATEGORY_ICONS: Record<string, string> = {
  combat: 'mdi-sword',
  alchemy: 'mdi-flask',
  automation: 'mdi-robot',
  efficiency: 'mdi-speedometer',
  trading: 'mdi-chart-line',
  magic: 'mdi-shimmer',
  survival: 'mdi-campfire',
  exploration: 'mdi-compass',
  integration: 'mdi-link-variant',
};

export const RESEARCH_CATEGORY_NAMES: Record<string, string> = {
  combat: 'Walka',
  alchemy: 'Alchemia',
  automation: 'Automatyzacja',
  efficiency: 'Wydajność',
  trading: 'Handel',
  magic: 'Magia',
  survival: 'Przetrwanie',
  exploration: 'Eksploracja',
  integration: 'Integracja',
};
