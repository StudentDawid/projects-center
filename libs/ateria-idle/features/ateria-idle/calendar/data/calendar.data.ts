/**
 * Calendar & Seasons System - Time, Weather, Festivals, Cycles
 */

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type Weather = 'clear' | 'cloudy' | 'rain' | 'storm' | 'snow' | 'fog' | 'heatwave' | 'blizzard';
export type TimeOfDay = 'dawn' | 'morning' | 'noon' | 'afternoon' | 'evening' | 'night' | 'midnight';
export type MoonPhase = 'new' | 'waxing_crescent' | 'first_quarter' | 'waxing_gibbous' | 'full' | 'waning_gibbous' | 'last_quarter' | 'waning_crescent';

export interface SeasonData {
  id: Season;
  name: string;
  description: string;
  icon: string;
  color: string;
  months: number[]; // 1-12
  weatherProbabilities: Partial<Record<Weather, number>>;
  bonuses: { stat: string; value: number; description: string }[];
  specialResources?: string[];
  events?: string[];
}

export interface WeatherData {
  id: Weather;
  name: string;
  description: string;
  icon: string;
  color: string;
  effects: { stat: string; value: number; description: string }[];
  duration: { min: number; max: number }; // hours
}

export interface Festival {
  id: string;
  name: string;
  description: string;
  lore: string;
  icon: string;
  color: string;
  season: Season;
  dayOfSeason: number; // 1-90 (each season has 90 days)
  duration: number; // days
  bonuses: { stat: string; value: number; description: string }[];
  specialShop?: { itemId: string; price: number; limit: number }[];
  minigames?: string[];
  questline?: string;
}

export interface DailyBonus {
  id: string;
  name: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  bonuses: { stat: string; value: number; description: string }[];
  icon: string;
  color: string;
}

export interface TimeOfDayData {
  id: TimeOfDay;
  name: string;
  icon: string;
  color: string;
  hourRange: [number, number]; // [start, end)
  bonuses: { stat: string; value: number }[];
}

export interface MoonPhaseData {
  id: MoonPhase;
  name: string;
  icon: string;
  effects: { stat: string; value: number; description: string }[];
}

// ============================================
// SEASONS
// ============================================

export const SEASONS: Record<Season, SeasonData> = {
  spring: {
    id: 'spring', name: 'Wiosna', icon: 'mdi-flower', color: '#8BC34A',
    description: 'Pora odrodzenia. Natura budzi się do życia.',
    months: [3, 4, 5],
    weatherProbabilities: { clear: 40, cloudy: 25, rain: 30, fog: 5 },
    bonuses: [
      { stat: 'harvestYield', value: 20, description: '+20% plonów' },
      { stat: 'herbGathering', value: 15, description: '+15% zbierania ziół' },
      { stat: 'animalBreeding', value: 25, description: '+25% rozmnażania zwierząt' },
    ],
    specialResources: ['spring_flower', 'morning_dew', 'bird_egg'],
    events: ['festival_rebirth', 'flower_festival'],
  },
  summer: {
    id: 'summer', name: 'Lato', icon: 'mdi-white-balance-sunny', color: '#FF9800',
    description: 'Najcieplejsza pora roku. Długie dni i krótkie noce.',
    months: [6, 7, 8],
    weatherProbabilities: { clear: 50, cloudy: 20, heatwave: 20, storm: 10 },
    bonuses: [
      { stat: 'combatXp', value: 15, description: '+15% XP z walki' },
      { stat: 'travelSpeed', value: 20, description: '+20% szybkości podróży' },
      { stat: 'fishingYield', value: 25, description: '+25% połowu ryb' },
    ],
    specialResources: ['sun_crystal', 'summer_fruit', 'fire_essence'],
    events: ['summer_solstice', 'harvest_begin'],
  },
  autumn: {
    id: 'autumn', name: 'Jesień', icon: 'mdi-leaf-maple', color: '#E65100',
    description: 'Pora zbiorów. Liście zmieniają kolory.',
    months: [9, 10, 11],
    weatherProbabilities: { clear: 30, cloudy: 35, rain: 25, fog: 10 },
    bonuses: [
      { stat: 'goldBonus', value: 20, description: '+20% złota' },
      { stat: 'craftQuality', value: 15, description: '+15% jakości craftingu' },
      { stat: 'mushroomGathering', value: 30, description: '+30% zbierania grzybów' },
    ],
    specialResources: ['autumn_leaf', 'pumpkin', 'wild_mushroom'],
    events: ['harvest_festival', 'spirit_night'],
  },
  winter: {
    id: 'winter', name: 'Zima', icon: 'mdi-snowflake', color: '#2196F3',
    description: 'Mroźna pora roku. Świat spoczywa pod śniegiem.',
    months: [12, 1, 2],
    weatherProbabilities: { clear: 20, cloudy: 30, snow: 35, blizzard: 15 },
    bonuses: [
      { stat: 'defense', value: 15, description: '+15% obrony' },
      { stat: 'miningYield', value: 20, description: '+20% wydobycia' },
      { stat: 'alchemyPotency', value: 25, description: '+25% mocy mikstur' },
    ],
    specialResources: ['eternal_ice', 'winter_berry', 'frost_crystal'],
    events: ['winter_solstice', 'new_year_festival'],
  },
};

// ============================================
// WEATHER
// ============================================

export const WEATHER_DATA: Record<Weather, WeatherData> = {
  clear: {
    id: 'clear', name: 'Pogodnie', icon: 'mdi-weather-sunny', color: '#FFD54F',
    description: 'Bezchmurne niebo i przyjemna temperatura.',
    effects: [{ stat: 'travelSpeed', value: 10, description: '+10% szybkości podróży' }],
    duration: { min: 12, max: 48 },
  },
  cloudy: {
    id: 'cloudy', name: 'Pochmurno', icon: 'mdi-weather-cloudy', color: '#90A4AE',
    description: 'Niebo pokryte chmurami.',
    effects: [],
    duration: { min: 6, max: 24 },
  },
  rain: {
    id: 'rain', name: 'Deszcz', icon: 'mdi-weather-rainy', color: '#42A5F5',
    description: 'Pada deszcz. Lepiej zostać w domu.',
    effects: [
      { stat: 'travelSpeed', value: -20, description: '-20% szybkości podróży' },
      { stat: 'cropGrowth', value: 20, description: '+20% wzrostu upraw' },
    ],
    duration: { min: 4, max: 16 },
  },
  storm: {
    id: 'storm', name: 'Burza', icon: 'mdi-weather-lightning-rainy', color: '#5C6BC0',
    description: 'Groźna burza z piorunami.',
    effects: [
      { stat: 'travelSpeed', value: -50, description: '-50% szybkości podróży' },
      { stat: 'magicPower', value: 25, description: '+25% mocy magii' },
      { stat: 'lightningDamage', value: 30, description: '+30% obrażeń od piorunów' },
    ],
    duration: { min: 2, max: 8 },
  },
  snow: {
    id: 'snow', name: 'Śnieg', icon: 'mdi-weather-snowy', color: '#E3F2FD',
    description: 'Pada śnieg, tworząc biały krajobraz.',
    effects: [
      { stat: 'travelSpeed', value: -30, description: '-30% szybkości podróży' },
      { stat: 'iceResist', value: 20, description: '+20% odporności na lód' },
    ],
    duration: { min: 6, max: 24 },
  },
  fog: {
    id: 'fog', name: 'Mgła', icon: 'mdi-weather-fog', color: '#B0BEC5',
    description: 'Gęsta mgła ogranicza widoczność.',
    effects: [
      { stat: 'discoveryChance', value: -15, description: '-15% szansy odkrycia' },
      { stat: 'stealthBonus', value: 30, description: '+30% ukrycia' },
    ],
    duration: { min: 4, max: 12 },
  },
  heatwave: {
    id: 'heatwave', name: 'Upał', icon: 'mdi-weather-sunny-alert', color: '#FF7043',
    description: 'Ekstremalne upały. Zachowaj ostrożność!',
    effects: [
      { stat: 'stamina', value: -20, description: '-20% staminy' },
      { stat: 'fireDamage', value: 20, description: '+20% obrażeń od ognia' },
    ],
    duration: { min: 12, max: 72 },
  },
  blizzard: {
    id: 'blizzard', name: 'Zamieć', icon: 'mdi-weather-snowy-heavy', color: '#B3E5FC',
    description: 'Silna zamieć śnieżna. Niebezpieczne warunki!',
    effects: [
      { stat: 'travelSpeed', value: -70, description: '-70% szybkości podróży' },
      { stat: 'coldDamage', value: 10, description: '+10 obrażeń od zimna/min' },
      { stat: 'iceResist', value: 30, description: '+30% odporności na lód' },
    ],
    duration: { min: 4, max: 16 },
  },
};

// ============================================
// TIME OF DAY
// ============================================

export const TIME_OF_DAY: Record<TimeOfDay, TimeOfDayData> = {
  dawn: { id: 'dawn', name: 'Świt', icon: 'mdi-weather-sunset-up', color: '#FFCC80', hourRange: [5, 7], bonuses: [{ stat: 'xpBonus', value: 5 }] },
  morning: { id: 'morning', name: 'Ranek', icon: 'mdi-weather-sunny', color: '#FFE082', hourRange: [7, 11], bonuses: [{ stat: 'energy', value: 10 }] },
  noon: { id: 'noon', name: 'Południe', icon: 'mdi-white-balance-sunny', color: '#FFD54F', hourRange: [11, 14], bonuses: [{ stat: 'combatDamage', value: 5 }] },
  afternoon: { id: 'afternoon', name: 'Popołudnie', icon: 'mdi-weather-partly-cloudy', color: '#FFA726', hourRange: [14, 17], bonuses: [{ stat: 'craftSpeed', value: 10 }] },
  evening: { id: 'evening', name: 'Wieczór', icon: 'mdi-weather-sunset-down', color: '#FF7043', hourRange: [17, 20], bonuses: [{ stat: 'goldBonus', value: 5 }] },
  night: { id: 'night', name: 'Noc', icon: 'mdi-weather-night', color: '#5C6BC0', hourRange: [20, 24], bonuses: [{ stat: 'stealthBonus', value: 15 }] },
  midnight: { id: 'midnight', name: 'Północ', icon: 'mdi-moon-waning-crescent', color: '#3949AB', hourRange: [0, 5], bonuses: [{ stat: 'magicPower', value: 10 }, { stat: 'undeadDamage', value: 20 }] },
};

// ============================================
// MOON PHASES
// ============================================

export const MOON_PHASES: Record<MoonPhase, MoonPhaseData> = {
  new: { id: 'new', name: 'Nów', icon: 'mdi-moon-new', effects: [{ stat: 'stealthBonus', value: 25, description: '+25% ukrycia' }] },
  waxing_crescent: { id: 'waxing_crescent', name: 'Przybywający Sierp', icon: 'mdi-moon-waxing-crescent', effects: [{ stat: 'growthSpeed', value: 10, description: '+10% wzrostu' }] },
  first_quarter: { id: 'first_quarter', name: 'Pierwsza Kwadra', icon: 'mdi-moon-first-quarter', effects: [{ stat: 'craftQuality', value: 10, description: '+10% jakości' }] },
  waxing_gibbous: { id: 'waxing_gibbous', name: 'Przybywający Garb', icon: 'mdi-moon-waxing-gibbous', effects: [{ stat: 'harvestYield', value: 15, description: '+15% plonów' }] },
  full: { id: 'full', name: 'Pełnia', icon: 'mdi-moon-full', effects: [{ stat: 'magicPower', value: 25, description: '+25% mocy magii' }, { stat: 'werewolfRisk', value: 50, description: '+50% szansy na wilkołaki' }] },
  waning_gibbous: { id: 'waning_gibbous', name: 'Ubywający Garb', icon: 'mdi-moon-waning-gibbous', effects: [{ stat: 'alchemyPotency', value: 15, description: '+15% mocy mikstur' }] },
  last_quarter: { id: 'last_quarter', name: 'Ostatnia Kwadra', icon: 'mdi-moon-last-quarter', effects: [{ stat: 'defense', value: 10, description: '+10% obrony' }] },
  waning_crescent: { id: 'waning_crescent', name: 'Ubywający Sierp', icon: 'mdi-moon-waning-crescent', effects: [{ stat: 'restBonus', value: 20, description: '+20% odpoczynku' }] },
};

// ============================================
// FESTIVALS
// ============================================

export const FESTIVALS: Festival[] = [
  // Spring Festivals
  {
    id: 'festival_rebirth', name: 'Festiwal Odrodzenia', season: 'spring', dayOfSeason: 1, duration: 3,
    description: 'Świętowanie nadejścia wiosny i powrotu życia.',
    lore: 'Festiwal Odrodzenia sięga czasów pierwszych osadników, którzy celebrowali przetrwanie zimy.',
    icon: 'mdi-flower-tulip', color: '#8BC34A',
    bonuses: [
      { stat: 'xpBonus', value: 50, description: '+50% XP' },
      { stat: 'healingReceived', value: 25, description: '+25% leczenia' },
    ],
    minigames: ['egg_hunt', 'flower_picking'],
  },
  {
    id: 'flower_festival', name: 'Festyn Kwiatów', season: 'spring', dayOfSeason: 45, duration: 5,
    description: 'Celebracja piękna natury i kwitnących kwiatów.',
    lore: 'Druidzi organizują ten festyn, by uhonorować Matkę Naturę.',
    icon: 'mdi-flower', color: '#E91E63',
    bonuses: [
      { stat: 'herbGathering', value: 100, description: '+100% zbierania ziół' },
      { stat: 'charmBonus', value: 30, description: '+30% uroku' },
    ],
    specialShop: [{ itemId: 'rare_flower_seed', price: 500, limit: 5 }],
  },

  // Summer Festivals
  {
    id: 'summer_solstice', name: 'Przesilenie Letnie', season: 'summer', dayOfSeason: 21, duration: 1,
    description: 'Najdłuższy dzień roku - czas wielkiej mocy.',
    lore: 'W dniu przesilenia granica między światami jest najcieńsza.',
    icon: 'mdi-white-balance-sunny', color: '#FF9800',
    bonuses: [
      { stat: 'allStats', value: 20, description: '+20% wszystkich statystyk' },
      { stat: 'magicPower', value: 50, description: '+50% mocy magii' },
    ],
  },
  {
    id: 'harvest_begin', name: 'Początek Żniw', season: 'summer', dayOfSeason: 75, duration: 7,
    description: 'Pierwsze zbiory sezonu.',
    lore: 'Rolnicy dziękują bogom za obfite plony.',
    icon: 'mdi-barley', color: '#FFC107',
    bonuses: [
      { stat: 'harvestYield', value: 75, description: '+75% plonów' },
      { stat: 'goldBonus', value: 25, description: '+25% złota' },
    ],
    minigames: ['crop_rush'],
  },

  // Autumn Festivals
  {
    id: 'harvest_festival', name: 'Święto Żniw', season: 'autumn', dayOfSeason: 30, duration: 7,
    description: 'Wielkie święto obfitości i wdzięczności.',
    lore: 'Największe święto roku, gdy całe królestwo świętuje zakończenie zbiorów.',
    icon: 'mdi-food-turkey', color: '#E65100',
    bonuses: [
      { stat: 'goldBonus', value: 100, description: '+100% złota' },
      { stat: 'foodQuality', value: 50, description: '+50% jakości jedzenia' },
    ],
    specialShop: [
      { itemId: 'harvest_pie', price: 100, limit: 10 },
      { itemId: 'golden_wheat', price: 1000, limit: 1 },
    ],
    minigames: ['pie_eating', 'pumpkin_carving'],
  },
  {
    id: 'spirit_night', name: 'Noc Duchów', season: 'autumn', dayOfSeason: 60, duration: 1,
    description: 'Noc, gdy duchy przodków odwiedzają żywych.',
    lore: 'Według legend, w tę noc można komunikować się ze zmarłymi.',
    icon: 'mdi-ghost', color: '#9C27B0',
    bonuses: [
      { stat: 'magicPower', value: 75, description: '+75% mocy magii' },
      { stat: 'undeadDamage', value: 50, description: '+50% obrażeń nieumarłym' },
      { stat: 'spiritContact', value: 100, description: '+100% kontaktu z duchami' },
    ],
    minigames: ['ghost_hunt', 'seance'],
  },

  // Winter Festivals
  {
    id: 'winter_solstice', name: 'Przesilenie Zimowe', season: 'winter', dayOfSeason: 21, duration: 1,
    description: 'Najkrótsza noc - światło zaczyna wracać.',
    lore: 'Noc pełna magii, gdy świat czeka na powrót słońca.',
    icon: 'mdi-star-four-points', color: '#7C4DFF',
    bonuses: [
      { stat: 'allStats', value: 25, description: '+25% wszystkich statystyk' },
      { stat: 'lightDamage', value: 50, description: '+50% obrażeń od światła' },
    ],
  },
  {
    id: 'new_year_festival', name: 'Festiwal Nowego Roku', season: 'winter', dayOfSeason: 90, duration: 3,
    description: 'Pożegnanie starego roku i powitanie nowego.',
    lore: 'Czas refleksji nad minionym rokiem i planowania przyszłości.',
    icon: 'mdi-firework', color: '#FF5722',
    bonuses: [
      { stat: 'xpBonus', value: 100, description: '+100% XP' },
      { stat: 'prestigeBonus', value: 50, description: '+50% prestiżu' },
    ],
    specialShop: [
      { itemId: 'firework_box', price: 200, limit: 20 },
      { itemId: 'lucky_charm', price: 5000, limit: 1 },
    ],
    minigames: ['fireworks_show'],
  },
];

// ============================================
// DAILY BONUSES
// ============================================

export const DAILY_BONUSES: DailyBonus[] = [
  { id: 'sunday', name: 'Niedziela Odpoczynku', dayOfWeek: 0, icon: 'mdi-sleep', color: '#9C27B0',
    bonuses: [{ stat: 'restBonus', value: 50, description: '+50% odpoczynku' }, { stat: 'healingReceived', value: 25, description: '+25% leczenia' }] },
  { id: 'monday', name: 'Poniedziałek Pracy', dayOfWeek: 1, icon: 'mdi-hammer', color: '#607D8B',
    bonuses: [{ stat: 'craftSpeed', value: 25, description: '+25% szybkości craftingu' }] },
  { id: 'tuesday', name: 'Wtorek Wojny', dayOfWeek: 2, icon: 'mdi-sword', color: '#F44336',
    bonuses: [{ stat: 'combatDamage', value: 25, description: '+25% obrażeń' }] },
  { id: 'wednesday', name: 'Środa Mądrości', dayOfWeek: 3, icon: 'mdi-book-open-variant', color: '#3F51B5',
    bonuses: [{ stat: 'xpBonus', value: 25, description: '+25% XP' }] },
  { id: 'thursday', name: 'Czwartek Handlu', dayOfWeek: 4, icon: 'mdi-cash', color: '#FFD700',
    bonuses: [{ stat: 'goldBonus', value: 25, description: '+25% złota' }] },
  { id: 'friday', name: 'Piątek Fortuny', dayOfWeek: 5, icon: 'mdi-clover', color: '#4CAF50',
    bonuses: [{ stat: 'luck', value: 25, description: '+25% szczęścia' }, { stat: 'dropRate', value: 15, description: '+15% drop rate' }] },
  { id: 'saturday', name: 'Sobota Eksploracji', dayOfWeek: 6, icon: 'mdi-compass', color: '#00BCD4',
    bonuses: [{ stat: 'travelSpeed', value: 25, description: '+25% szybkości podróży' }, { stat: 'discoveryChance', value: 20, description: '+20% odkryć' }] },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getSeason(month: number): Season {
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

export function getTimeOfDay(hour: number): TimeOfDay {
  for (const [id, data] of Object.entries(TIME_OF_DAY)) {
    const [start, end] = data.hourRange;
    if (start <= end) {
      if (hour >= start && hour < end) return id as TimeOfDay;
    } else {
      if (hour >= start || hour < end) return id as TimeOfDay;
    }
  }
  return 'midnight';
}

export function getMoonPhase(dayOfYear: number): MoonPhase {
  // Lunar cycle is approximately 29.5 days
  const lunarDay = dayOfYear % 30;
  if (lunarDay < 1) return 'new';
  if (lunarDay < 4) return 'waxing_crescent';
  if (lunarDay < 8) return 'first_quarter';
  if (lunarDay < 12) return 'waxing_gibbous';
  if (lunarDay < 16) return 'full';
  if (lunarDay < 20) return 'waning_gibbous';
  if (lunarDay < 24) return 'last_quarter';
  return 'waning_crescent';
}

export function getActiveFestivals(season: Season, dayOfSeason: number): Festival[] {
  return FESTIVALS.filter(f => 
    f.season === season && 
    dayOfSeason >= f.dayOfSeason && 
    dayOfSeason < f.dayOfSeason + f.duration
  );
}

export function getDailyBonus(dayOfWeek: number): DailyBonus | undefined {
  return DAILY_BONUSES.find(d => d.dayOfWeek === dayOfWeek);
}

export function getRandomWeather(season: Season): Weather {
  const probs = SEASONS[season].weatherProbabilities;
  const total = Object.values(probs).reduce((a, b) => a + (b || 0), 0);
  let roll = Math.random() * total;
  
  for (const [weather, prob] of Object.entries(probs)) {
    roll -= prob || 0;
    if (roll <= 0) return weather as Weather;
  }
  
  return 'clear';
}
