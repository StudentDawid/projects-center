/**
 * Mystic Path Data - Meditation, Prophecies, Rituals, Tarot
 */

// ============================================
// TYPES
// ============================================

export type MeditationState = 'idle' | 'meditating' | 'trance' | 'enlightened';

export type TranceType = 'calm' | 'vision' | 'spirit' | 'void';

export type ProphecyType = 
  | 'market' // Merchant - price predictions
  | 'weather' // Druid - season/crop effects
  | 'combat' // Warrior - boss weaknesses
  | 'danger' // Caravan - ambush warnings
  | 'political' // Diplomat - faction events
  | 'discovery'; // Scientist - research hints

export interface MeditationLevel {
  level: number;
  name: string;
  manaPerTick: number;
  enlightenmentPerTick: number;
  tranceChance: number;
  requiredXp: number;
}

export interface TranceEffect {
  id: TranceType;
  name: string;
  description: string;
  icon: string;
  color: string;
  duration: number; // Ticks
  effects: TranceBonus[];
}

export interface TranceBonus {
  type: 'mana_regen' | 'xp_bonus' | 'prophecy_accuracy' | 'ritual_power' | 'spirit_connection';
  value: number;
}

export interface Prophecy {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: ProphecyType;
  
  // Requirements
  requiredLevel: number;
  manaCost: number;
  enlightenmentCost: number;
  
  // Duration
  duration: number; // How long the prophecy lasts
  cooldown: number;
  
  // Accuracy
  baseAccuracy: number; // Base % chance of correct prediction
  
  // Effects when fulfilled
  effects: ProphecyEffect[];
}

export interface ProphecyEffect {
  type: string;
  value: number;
  description: string;
}

export interface Ritual {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: number;
  
  // Requirements
  requiredLevel: number;
  manaCost: number;
  enlightenmentCost: number;
  ingredients: RitualIngredient[];
  
  // Timing
  castTime: number; // Ticks to complete
  cooldown: number; // Ticks before can cast again (very long)
  
  // Effects
  effectDuration: number;
  effects: RitualEffect[];
}

export interface RitualIngredient {
  itemId: string;
  itemName: string;
  amount: number;
}

export interface RitualEffect {
  type: 'xp_multiplier' | 'damage_multiplier' | 'invulnerability' | 'gold_multiplier' | 
        'craft_quality' | 'prophecy_power' | 'mana_regen' | 'all_stats';
  value: number;
  description: string;
}

export interface TarotCard {
  id: string;
  name: string;
  arcana: 'major' | 'minor';
  suit?: 'wands' | 'cups' | 'swords' | 'pentacles';
  number: number;
  description: string;
  icon: string;
  
  // Effects
  dailyBonus: TarotBonus;
  reversedBonus?: TarotBonus; // If drawn reversed
}

export interface TarotBonus {
  type: 'xp' | 'gold' | 'damage' | 'defense' | 'luck' | 'mana' | 'craft' | 'trade' | 'research';
  value: number;
  description: string;
  isNegative?: boolean;
}

export interface MysticProgress {
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXp: number;
  mana: number;
  maxMana: number;
  enlightenment: number;
}

export interface ActiveProphecy {
  prophecyId: string;
  startTime: number;
  expiresAt: number;
  prediction: any; // Specific prediction data
  accuracy: number;
  fulfilled: boolean;
}

export interface ActiveRitual {
  ritualId: string;
  startTime: number;
  ticksRemaining: number;
  totalTicks: number;
}

export interface ActiveRitualEffect {
  ritualId: string;
  expiresAt: number;
  effects: RitualEffect[];
}

// ============================================
// MEDITATION LEVELS
// ============================================

export const MEDITATION_LEVELS: MeditationLevel[] = [
  { level: 1, name: 'Nowicjusz', manaPerTick: 0.1, enlightenmentPerTick: 0.01, tranceChance: 1, requiredXp: 0 },
  { level: 2, name: 'Uczeń', manaPerTick: 0.15, enlightenmentPerTick: 0.015, tranceChance: 2, requiredXp: 100 },
  { level: 3, name: 'Adept', manaPerTick: 0.2, enlightenmentPerTick: 0.02, tranceChance: 3, requiredXp: 300 },
  { level: 4, name: 'Praktyk', manaPerTick: 0.3, enlightenmentPerTick: 0.03, tranceChance: 4, requiredXp: 600 },
  { level: 5, name: 'Iluminat', manaPerTick: 0.4, enlightenmentPerTick: 0.04, tranceChance: 5, requiredXp: 1000 },
  { level: 6, name: 'Mistyk', manaPerTick: 0.5, enlightenmentPerTick: 0.05, tranceChance: 7, requiredXp: 1500 },
  { level: 7, name: 'Arcymistyk', manaPerTick: 0.7, enlightenmentPerTick: 0.07, tranceChance: 10, requiredXp: 2500 },
  { level: 8, name: 'Oświecony', manaPerTick: 1.0, enlightenmentPerTick: 0.1, tranceChance: 15, requiredXp: 4000 },
  { level: 9, name: 'Transcendent', manaPerTick: 1.5, enlightenmentPerTick: 0.15, tranceChance: 20, requiredXp: 6000 },
  { level: 10, name: 'Awatar', manaPerTick: 2.0, enlightenmentPerTick: 0.2, tranceChance: 25, requiredXp: 10000 },
];

// ============================================
// TRANCE EFFECTS
// ============================================

export const TRANCE_EFFECTS: Record<TranceType, TranceEffect> = {
  calm: {
    id: 'calm',
    name: 'Trans Spokoju',
    description: 'Głębokie uspokojenie zwiększające regenerację many.',
    icon: 'mdi-meditation',
    color: '#4FC3F7',
    duration: 600, // 1 minute
    effects: [
      { type: 'mana_regen', value: 100 },
    ],
  },
  vision: {
    id: 'vision',
    name: 'Trans Wizji',
    description: 'Jasność umysłu zwiększająca dokładność przepowiedni.',
    icon: 'mdi-eye',
    color: '#CE93D8',
    duration: 600,
    effects: [
      { type: 'prophecy_accuracy', value: 25 },
    ],
  },
  spirit: {
    id: 'spirit',
    name: 'Trans Duchowy',
    description: 'Połączenie ze światem duchów zwiększające XP.',
    icon: 'mdi-ghost',
    color: '#A5D6A7',
    duration: 600,
    effects: [
      { type: 'xp_bonus', value: 50 },
      { type: 'spirit_connection', value: 20 },
    ],
  },
  void: {
    id: 'void',
    name: 'Trans Pustki',
    description: 'Dotknięcie pustki zwiększające moc rytuałów.',
    icon: 'mdi-circle-outline',
    color: '#90A4AE',
    duration: 600,
    effects: [
      { type: 'ritual_power', value: 30 },
    ],
  },
};

// ============================================
// PROPHECIES
// ============================================

export const PROPHECIES: Record<string, Prophecy> = {
  // Market prophecies
  market_trend: {
    id: 'market_trend',
    name: 'Przepowiednia Rynku',
    description: 'Przewiduj trendy cenowe na rynku.',
    icon: 'mdi-chart-line',
    type: 'market',
    requiredLevel: 3,
    manaCost: 50,
    enlightenmentCost: 5,
    duration: 3000, // 5 minutes
    cooldown: 6000,
    baseAccuracy: 70,
    effects: [
      { type: 'trade_insight', value: 20, description: '+20% zysku ze sprzedaży przy trafnej przepowiedni' },
    ],
  },
  price_spike: {
    id: 'price_spike',
    name: 'Wizja Wzrostu Cen',
    description: 'Przepowiedz który towar znacząco wzrośnie.',
    icon: 'mdi-trending-up',
    type: 'market',
    requiredLevel: 8,
    manaCost: 100,
    enlightenmentCost: 15,
    duration: 6000,
    cooldown: 12000,
    baseAccuracy: 50,
    effects: [
      { type: 'price_knowledge', value: 50, description: 'Wskazanie towaru ze wzrostem ceny' },
    ],
  },

  // Weather prophecies
  weather_forecast: {
    id: 'weather_forecast',
    name: 'Przepowiednia Pogody',
    description: 'Przewiduj następną porę roku i jej efekty.',
    icon: 'mdi-weather-partly-cloudy',
    type: 'weather',
    requiredLevel: 5,
    manaCost: 40,
    enlightenmentCost: 8,
    duration: 3000,
    cooldown: 6000,
    baseAccuracy: 80,
    effects: [
      { type: 'season_bonus', value: 15, description: '+15% wydajności farm przy trafnej przepowiedni' },
    ],
  },
  harvest_vision: {
    id: 'harvest_vision',
    name: 'Wizja Żniw',
    description: 'Przepowiedz jakość nadchodzących zbiorów.',
    icon: 'mdi-sprout',
    type: 'weather',
    requiredLevel: 10,
    manaCost: 80,
    enlightenmentCost: 12,
    duration: 6000,
    cooldown: 9000,
    baseAccuracy: 65,
    effects: [
      { type: 'harvest_quality', value: 25, description: '+25% jakości plonów' },
    ],
  },

  // Combat prophecies
  boss_weakness: {
    id: 'boss_weakness',
    name: 'Wizja Słabości',
    description: 'Odkryj słabość następnego bossa.',
    icon: 'mdi-skull-crossbones',
    type: 'combat',
    requiredLevel: 7,
    manaCost: 80,
    enlightenmentCost: 10,
    duration: 3000,
    cooldown: 9000,
    baseAccuracy: 60,
    effects: [
      { type: 'boss_damage', value: 30, description: '+30% obrażeń przeciwko bossowi' },
    ],
  },
  combat_insight: {
    id: 'combat_insight',
    name: 'Przeczucie Bitwy',
    description: 'Wyczuj nadchodzące zagrożenia w walce.',
    icon: 'mdi-sword-cross',
    type: 'combat',
    requiredLevel: 4,
    manaCost: 30,
    enlightenmentCost: 5,
    duration: 1800,
    cooldown: 3600,
    baseAccuracy: 75,
    effects: [
      { type: 'evasion_bonus', value: 15, description: '+15% do uników' },
    ],
  },

  // Danger prophecies
  ambush_warning: {
    id: 'ambush_warning',
    name: 'Ostrzeżenie o Zasadzce',
    description: 'Wyczuj zagrożenia dla karawan.',
    icon: 'mdi-alert',
    type: 'danger',
    requiredLevel: 6,
    manaCost: 60,
    enlightenmentCost: 8,
    duration: 6000,
    cooldown: 12000,
    baseAccuracy: 70,
    effects: [
      { type: 'caravan_safety', value: 40, description: '+40% szansy na uniknięcie ataku' },
    ],
  },

  // Political prophecies
  faction_shift: {
    id: 'faction_shift',
    name: 'Wizja Polityczna',
    description: 'Przewiduj zmiany w relacjach frakcji.',
    icon: 'mdi-account-group',
    type: 'political',
    requiredLevel: 12,
    manaCost: 100,
    enlightenmentCost: 20,
    duration: 9000,
    cooldown: 18000,
    baseAccuracy: 55,
    effects: [
      { type: 'reputation_bonus', value: 25, description: '+25% do zdobywanej reputacji' },
    ],
  },

  // Discovery prophecies
  research_hint: {
    id: 'research_hint',
    name: 'Wizja Odkrycia',
    description: 'Wgląd w ukryte receptury i badania.',
    icon: 'mdi-flask',
    type: 'discovery',
    requiredLevel: 8,
    manaCost: 70,
    enlightenmentCost: 15,
    duration: 6000,
    cooldown: 12000,
    baseAccuracy: 60,
    effects: [
      { type: 'research_speed', value: 20, description: '+20% szybkości badań' },
    ],
  },
};

// ============================================
// RITUALS
// ============================================

export const RITUALS: Record<string, Ritual> = {
  // Tier 1 - Basic rituals
  blessing_of_light: {
    id: 'blessing_of_light',
    name: 'Błogosławieństwo Światła',
    description: 'Przynosi dodatkowe doświadczenie przez godzinę.',
    icon: 'mdi-weather-sunny',
    tier: 1,
    requiredLevel: 5,
    manaCost: 100,
    enlightenmentCost: 20,
    ingredients: [
      { itemId: 'moonshade', itemName: 'Cień Księżyca', amount: 3 },
    ],
    castTime: 300, // 30 seconds
    cooldown: 36000, // 1 hour
    effectDuration: 36000, // 1 hour
    effects: [
      { type: 'xp_multiplier', value: 50, description: '+50% do zdobywanego XP' },
    ],
  },
  fortune_ritual: {
    id: 'fortune_ritual',
    name: 'Rytuał Fortuny',
    description: 'Zwiększa zyski ze złota.',
    icon: 'mdi-clover',
    tier: 1,
    requiredLevel: 8,
    manaCost: 150,
    enlightenmentCost: 30,
    ingredients: [
      { itemId: 'gold_ingot', itemName: 'Sztabka Złota', amount: 5 },
    ],
    castTime: 400,
    cooldown: 36000,
    effectDuration: 36000,
    effects: [
      { type: 'gold_multiplier', value: 30, description: '+30% do zdobywanego złota' },
    ],
  },

  // Tier 2 - Intermediate rituals
  warrior_spirit: {
    id: 'warrior_spirit',
    name: 'Duch Wojownika',
    description: 'Przywołuje ducha wojownika zwiększającego obrażenia.',
    icon: 'mdi-sword',
    tier: 2,
    requiredLevel: 15,
    manaCost: 300,
    enlightenmentCost: 50,
    ingredients: [
      { itemId: 'monster_essence', itemName: 'Esencja Potwora', amount: 10 },
      { itemId: 'iron_ingot', itemName: 'Sztabka Żelaza', amount: 5 },
    ],
    castTime: 600,
    cooldown: 72000, // 2 hours
    effectDuration: 18000, // 30 minutes
    effects: [
      { type: 'damage_multiplier', value: 40, description: '+40% do obrażeń' },
    ],
  },
  craftsman_blessing: {
    id: 'craftsman_blessing',
    name: 'Błogosławieństwo Rzemieślnika',
    description: 'Znacząco zwiększa jakość wytwarzanych przedmiotów.',
    icon: 'mdi-hammer-wrench',
    tier: 2,
    requiredLevel: 18,
    manaCost: 250,
    enlightenmentCost: 40,
    ingredients: [
      { itemId: 'steel_ingot', itemName: 'Sztabka Stali', amount: 3 },
      { itemId: 'cut_ruby', itemName: 'Szlifowany Rubin', amount: 1 },
    ],
    castTime: 500,
    cooldown: 54000, // 1.5 hours
    effectDuration: 27000, // 45 minutes
    effects: [
      { type: 'craft_quality', value: 35, description: '+35% do jakości craftingu' },
    ],
  },

  // Tier 3 - Advanced rituals
  shield_of_ancients: {
    id: 'shield_of_ancients',
    name: 'Tarcza Przodków',
    description: 'Nietykalność na jedną walkę.',
    icon: 'mdi-shield-star',
    tier: 3,
    requiredLevel: 25,
    manaCost: 500,
    enlightenmentCost: 100,
    ingredients: [
      { itemId: 'mithril_ingot', itemName: 'Sztabka Mithrilu', amount: 2 },
      { itemId: 'spirit_essence', itemName: 'Esencja Ducha', amount: 5 },
    ],
    castTime: 900, // 1.5 minutes
    cooldown: 216000, // 6 hours
    effectDuration: 1, // 1 fight
    effects: [
      { type: 'invulnerability', value: 1, description: 'Nietykalność w następnej walce' },
    ],
  },
  prophecy_amplifier: {
    id: 'prophecy_amplifier',
    name: 'Wzmocnienie Przepowiedni',
    description: 'Znacząco zwiększa moc i dokładność przepowiedni.',
    icon: 'mdi-crystal-ball',
    tier: 3,
    requiredLevel: 22,
    manaCost: 400,
    enlightenmentCost: 80,
    ingredients: [
      { itemId: 'moonshade', itemName: 'Cień Księżyca', amount: 10 },
      { itemId: 'cut_sapphire', itemName: 'Szlifowany Szafir', amount: 2 },
    ],
    castTime: 600,
    cooldown: 108000, // 3 hours
    effectDuration: 36000, // 1 hour
    effects: [
      { type: 'prophecy_power', value: 50, description: '+50% do mocy i dokładności przepowiedni' },
    ],
  },

  // Tier 4 - Master rituals
  avatar_of_power: {
    id: 'avatar_of_power',
    name: 'Awatar Mocy',
    description: 'Legendarny rytuał zwiększający wszystkie statystyki.',
    icon: 'mdi-star-four-points',
    tier: 4,
    requiredLevel: 35,
    manaCost: 1000,
    enlightenmentCost: 200,
    ingredients: [
      { itemId: 'adamantite_ingot', itemName: 'Sztabka Adamantytu', amount: 3 },
      { itemId: 'cut_diamond', itemName: 'Szlifowany Diament', amount: 2 },
      { itemId: 'spirit_essence', itemName: 'Esencja Ducha', amount: 20 },
    ],
    castTime: 1200, // 2 minutes
    cooldown: 432000, // 12 hours
    effectDuration: 18000, // 30 minutes
    effects: [
      { type: 'all_stats', value: 25, description: '+25% do wszystkich statystyk' },
    ],
  },
};

// ============================================
// TAROT CARDS - Major Arcana
// ============================================

export const MAJOR_ARCANA: TarotCard[] = [
  {
    id: 'the_fool',
    name: 'Głupiec',
    arcana: 'major',
    number: 0,
    description: 'Nowe początki i niewinność.',
    icon: 'mdi-emoticon-happy',
    dailyBonus: { type: 'luck', value: 15, description: '+15% szczęścia (drop, crit)' },
    reversedBonus: { type: 'luck', value: -10, description: '-10% szczęścia', isNegative: true },
  },
  {
    id: 'the_magician',
    name: 'Mag',
    arcana: 'major',
    number: 1,
    description: 'Moc i manifestacja.',
    icon: 'mdi-wizard-hat',
    dailyBonus: { type: 'mana', value: 30, description: '+30% regeneracji many' },
    reversedBonus: { type: 'mana', value: -15, description: '-15% regeneracji many', isNegative: true },
  },
  {
    id: 'the_high_priestess',
    name: 'Arcykapłanka',
    arcana: 'major',
    number: 2,
    description: 'Intuicja i ukryta wiedza.',
    icon: 'mdi-book-cross',
    dailyBonus: { type: 'research', value: 25, description: '+25% szybkości badań' },
    reversedBonus: { type: 'research', value: -10, description: '-10% szybkości badań', isNegative: true },
  },
  {
    id: 'the_empress',
    name: 'Cesarzowa',
    arcana: 'major',
    number: 3,
    description: 'Obfitość i płodność.',
    icon: 'mdi-crown',
    dailyBonus: { type: 'gold', value: 20, description: '+20% złota' },
    reversedBonus: { type: 'gold', value: -10, description: '-10% złota', isNegative: true },
  },
  {
    id: 'the_emperor',
    name: 'Cesarz',
    arcana: 'major',
    number: 4,
    description: 'Władza i autorytet.',
    icon: 'mdi-account-star',
    dailyBonus: { type: 'damage', value: 15, description: '+15% obrażeń' },
    reversedBonus: { type: 'damage', value: -8, description: '-8% obrażeń', isNegative: true },
  },
  {
    id: 'the_hierophant',
    name: 'Hierofant',
    arcana: 'major',
    number: 5,
    description: 'Tradycja i nauki duchowe.',
    icon: 'mdi-church',
    dailyBonus: { type: 'xp', value: 20, description: '+20% XP' },
    reversedBonus: { type: 'xp', value: -10, description: '-10% XP', isNegative: true },
  },
  {
    id: 'the_lovers',
    name: 'Kochankowie',
    arcana: 'major',
    number: 6,
    description: 'Związki i wybory.',
    icon: 'mdi-heart',
    dailyBonus: { type: 'trade', value: 20, description: '+20% zysków z handlu' },
    reversedBonus: { type: 'trade', value: -10, description: '-10% zysków z handlu', isNegative: true },
  },
  {
    id: 'the_chariot',
    name: 'Rydwan',
    arcana: 'major',
    number: 7,
    description: 'Determinacja i zwycięstwo.',
    icon: 'mdi-horse-variant',
    dailyBonus: { type: 'damage', value: 20, description: '+20% obrażeń' },
    reversedBonus: { type: 'defense', value: -10, description: '-10% obrony', isNegative: true },
  },
  {
    id: 'strength',
    name: 'Siła',
    arcana: 'major',
    number: 8,
    description: 'Wewnętrzna siła i odwaga.',
    icon: 'mdi-arm-flex',
    dailyBonus: { type: 'defense', value: 20, description: '+20% obrony' },
    reversedBonus: { type: 'defense', value: -10, description: '-10% obrony', isNegative: true },
  },
  {
    id: 'the_hermit',
    name: 'Pustelnik',
    arcana: 'major',
    number: 9,
    description: 'Introspekcja i mądrość.',
    icon: 'mdi-lantern',
    dailyBonus: { type: 'xp', value: 25, description: '+25% XP' },
    reversedBonus: { type: 'xp', value: -12, description: '-12% XP', isNegative: true },
  },
  {
    id: 'wheel_of_fortune',
    name: 'Koło Fortuny',
    arcana: 'major',
    number: 10,
    description: 'Przeznaczenie i cykle.',
    icon: 'mdi-wheel',
    dailyBonus: { type: 'luck', value: 25, description: '+25% szczęścia' },
    reversedBonus: { type: 'luck', value: -15, description: '-15% szczęścia', isNegative: true },
  },
  {
    id: 'justice',
    name: 'Sprawiedliwość',
    arcana: 'major',
    number: 11,
    description: 'Równowaga i prawda.',
    icon: 'mdi-scale-balance',
    dailyBonus: { type: 'craft', value: 15, description: '+15% jakości craftingu' },
    reversedBonus: { type: 'craft', value: -8, description: '-8% jakości craftingu', isNegative: true },
  },
  {
    id: 'the_hanged_man',
    name: 'Wisielec',
    arcana: 'major',
    number: 12,
    description: 'Poświęcenie i nowa perspektywa.',
    icon: 'mdi-human-handsdown',
    dailyBonus: { type: 'mana', value: 40, description: '+40% regeneracji many' },
    reversedBonus: { type: 'damage', value: -15, description: '-15% obrażeń', isNegative: true },
  },
  {
    id: 'death',
    name: 'Śmierć',
    arcana: 'major',
    number: 13,
    description: 'Transformacja i zakończenia.',
    icon: 'mdi-skull',
    dailyBonus: { type: 'damage', value: 30, description: '+30% obrażeń' },
    reversedBonus: { type: 'defense', value: -20, description: '-20% obrony', isNegative: true },
  },
  {
    id: 'temperance',
    name: 'Umiarkowanie',
    arcana: 'major',
    number: 14,
    description: 'Równowaga i cierpliwość.',
    icon: 'mdi-cup-water',
    dailyBonus: { type: 'craft', value: 20, description: '+20% jakości craftingu' },
    reversedBonus: { type: 'gold', value: -10, description: '-10% złota', isNegative: true },
  },
  {
    id: 'the_devil',
    name: 'Diabeł',
    arcana: 'major',
    number: 15,
    description: 'Pokusa i materialność.',
    icon: 'mdi-emoticon-devil',
    dailyBonus: { type: 'gold', value: 35, description: '+35% złota' },
    reversedBonus: { type: 'xp', value: -20, description: '-20% XP', isNegative: true },
  },
  {
    id: 'the_tower',
    name: 'Wieża',
    arcana: 'major',
    number: 16,
    description: 'Nagła zmiana i objawienie.',
    icon: 'mdi-tower-fire',
    dailyBonus: { type: 'luck', value: 40, description: '+40% szczęścia (UWAGA: może być odwrócona!)' },
    reversedBonus: { type: 'luck', value: -30, description: '-30% szczęścia', isNegative: true },
  },
  {
    id: 'the_star',
    name: 'Gwiazda',
    arcana: 'major',
    number: 17,
    description: 'Nadzieja i inspiracja.',
    icon: 'mdi-star',
    dailyBonus: { type: 'xp', value: 30, description: '+30% XP' },
    reversedBonus: { type: 'xp', value: -15, description: '-15% XP', isNegative: true },
  },
  {
    id: 'the_moon',
    name: 'Księżyc',
    arcana: 'major',
    number: 18,
    description: 'Iluzja i intuicja.',
    icon: 'mdi-moon-waning-crescent',
    dailyBonus: { type: 'mana', value: 50, description: '+50% regeneracji many' },
    reversedBonus: { type: 'research', value: -20, description: '-20% szybkości badań', isNegative: true },
  },
  {
    id: 'the_sun',
    name: 'Słońce',
    arcana: 'major',
    number: 19,
    description: 'Radość i sukces.',
    icon: 'mdi-white-balance-sunny',
    dailyBonus: { type: 'xp', value: 25, description: '+25% XP, +15% złota' },
    reversedBonus: { type: 'gold', value: -10, description: '-10% złota', isNegative: true },
  },
  {
    id: 'judgement',
    name: 'Sąd',
    arcana: 'major',
    number: 20,
    description: 'Odrodzenie i powołanie.',
    icon: 'mdi-trumpet',
    dailyBonus: { type: 'damage', value: 25, description: '+25% obrażeń' },
    reversedBonus: { type: 'damage', value: -15, description: '-15% obrażeń', isNegative: true },
  },
  {
    id: 'the_world',
    name: 'Świat',
    arcana: 'major',
    number: 21,
    description: 'Spełnienie i ukończenie.',
    icon: 'mdi-earth',
    dailyBonus: { type: 'luck', value: 20, description: '+20% do wszystkiego!' },
    reversedBonus: { type: 'luck', value: 10, description: '+10% do wszystkiego (nawet odwrócona jest pozytywna)' },
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getMeditationLevel(xp: number): MeditationLevel {
  for (let i = MEDITATION_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= MEDITATION_LEVELS[i].requiredXp) {
      return MEDITATION_LEVELS[i];
    }
  }
  return MEDITATION_LEVELS[0];
}

export function getNextMeditationLevel(currentLevel: number): MeditationLevel | null {
  const nextLevel = currentLevel + 1;
  return MEDITATION_LEVELS.find(l => l.level === nextLevel) || null;
}

export function getProphecy(id: string): Prophecy | undefined {
  return PROPHECIES[id];
}

export function getRitual(id: string): Ritual | undefined {
  return RITUALS[id];
}

export function getAvailableProphecies(level: number): Prophecy[] {
  return Object.values(PROPHECIES).filter(p => p.requiredLevel <= level);
}

export function getAvailableRituals(level: number): Ritual[] {
  return Object.values(RITUALS).filter(r => r.requiredLevel <= level);
}

export function calculateMysticXpToLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.18, level - 1));
}

export function getRandomTarotCard(): { card: TarotCard; reversed: boolean } {
  const card = MAJOR_ARCANA[Math.floor(Math.random() * MAJOR_ARCANA.length)];
  const reversed = Math.random() < 0.3; // 30% chance of reversed
  return { card, reversed };
}

export function getTarotBonus(card: TarotCard, reversed: boolean): TarotBonus {
  if (reversed && card.reversedBonus) {
    return card.reversedBonus;
  }
  return card.dailyBonus;
}

export function getProphecyTypeIcon(type: ProphecyType): string {
  const icons: Record<ProphecyType, string> = {
    market: 'mdi-chart-line',
    weather: 'mdi-weather-partly-cloudy',
    combat: 'mdi-sword-cross',
    danger: 'mdi-alert',
    political: 'mdi-account-group',
    discovery: 'mdi-flask',
  };
  return icons[type];
}

export function getProphecyTypeName(type: ProphecyType): string {
  const names: Record<ProphecyType, string> = {
    market: 'Rynkowe',
    weather: 'Pogodowe',
    combat: 'Bojowe',
    danger: 'Ostrzeżenia',
    political: 'Polityczne',
    discovery: 'Odkrycia',
  };
  return names[type];
}
