/**
 * Events System definitions for Ateria Idle
 * Seasonal events, daily challenges, weekend bonuses
 */

import type { GameEventType, EventModifier, EventReward, PathId } from '~/entities/ateria-idle/game';

// ============================================
// EVENT DEFINITIONS
// ============================================

export interface EventDefinition {
  id: string;
  type: GameEventType;
  name: string;
  description: string;
  icon: string;
  color: string;
  duration: number; // In hours
  modifiers: EventModifier[];
  rewards?: EventReward[];
  requirements?: {
    minLevel?: number;
    path?: PathId;
  };
  schedule?: EventSchedule;
}

export interface EventSchedule {
  type: 'recurring' | 'seasonal' | 'random' | 'manual';
  // For recurring
  dayOfWeek?: number[]; // 0 = Sunday, 6 = Saturday
  hourStart?: number;
  // For seasonal
  month?: number;
  dayOfMonth?: number;
  // For random
  probability?: number; // Per day
}

// ============================================
// SEASONAL FESTIVALS
// ============================================

export const SEASONAL_FESTIVALS: EventDefinition[] = [
  {
    id: 'spring_festival',
    type: 'festival',
    name: 'Festiwal Wiosny',
    description: 'Obudź się z zimowego snu! Zwiększone zdobywanie XP i nowe przepisy alchemiczne.',
    icon: 'mdi-flower',
    color: '#4CAF50',
    duration: 168, // 7 days
    modifiers: [
      { type: 'xp_multiplier', value: 1.5 },
      { type: 'loot_multiplier', value: 1.25, target: 'scientist' },
    ],
    rewards: [
      { type: 'item', id: 'spring_blossom', amount: 10 },
      { type: 'legacy_points', id: 'lp', amount: 25 },
    ],
    schedule: {
      type: 'seasonal',
      month: 3, // March
      dayOfMonth: 20,
    },
  },
  {
    id: 'summer_carnival',
    type: 'festival',
    name: 'Letni Karnawał',
    description: 'Gorące dni przynoszą gorące oferty! Bonus do handlu i podwójne złoto.',
    icon: 'mdi-white-balance-sunny',
    color: '#FF9800',
    duration: 168,
    modifiers: [
      { type: 'gold_multiplier', value: 2.0 },
      { type: 'cost_reduction', value: 0.2, target: 'merchant' },
    ],
    rewards: [
      { type: 'resource', id: 'gold', amount: 5000 },
      { type: 'item', id: 'sun_crystal', amount: 5 },
    ],
    schedule: {
      type: 'seasonal',
      month: 6, // June
      dayOfMonth: 21,
    },
  },
  {
    id: 'harvest_festival',
    type: 'festival',
    name: 'Święto Zbiorów',
    description: 'Czas zbiorów! Zwiększone szanse na rzadki loot i podwójna produkcja.',
    icon: 'mdi-barley',
    color: '#FFC107',
    duration: 168,
    modifiers: [
      { type: 'loot_multiplier', value: 2.0 },
      { type: 'xp_multiplier', value: 1.25, target: 'scientist' },
    ],
    rewards: [
      { type: 'item', id: 'golden_wheat', amount: 20 },
      { type: 'item', id: 'harvest_potion', amount: 5 },
    ],
    schedule: {
      type: 'seasonal',
      month: 9, // September
      dayOfMonth: 22,
    },
  },
  {
    id: 'winter_solstice',
    type: 'festival',
    name: 'Przesilenie Zimowe',
    description: 'Najdłuższa noc w roku. Potwory są silniejsze, ale nagrody większe!',
    icon: 'mdi-snowflake',
    color: '#2196F3',
    duration: 168,
    modifiers: [
      { type: 'xp_multiplier', value: 1.75, target: 'warrior' },
      { type: 'loot_multiplier', value: 1.5, target: 'warrior' },
    ],
    rewards: [
      { type: 'item', id: 'frost_crystal', amount: 10 },
      { type: 'legacy_points', id: 'lp', amount: 50 },
    ],
    schedule: {
      type: 'seasonal',
      month: 12, // December
      dayOfMonth: 21,
    },
  },
  {
    id: 'lunar_new_year',
    type: 'festival',
    name: 'Nowy Rok Księżycowy',
    description: 'Rozpocznij rok z szczęściem! Wszystkie bonusy zwiększone.',
    icon: 'mdi-firework',
    color: '#E91E63',
    duration: 72, // 3 days
    modifiers: [
      { type: 'xp_multiplier', value: 1.5 },
      { type: 'gold_multiplier', value: 1.5 },
      { type: 'loot_multiplier', value: 1.5 },
    ],
    rewards: [
      { type: 'resource', id: 'gold', amount: 8888 },
      { type: 'item', id: 'lucky_envelope', amount: 8 },
    ],
    schedule: {
      type: 'seasonal',
      month: 1, // January/February (variable)
      dayOfMonth: 25,
    },
  },
  {
    id: 'halloween',
    type: 'festival',
    name: 'Noc Duchów',
    description: 'Duchy wychodzą z cieni! Specjalne potwory i unikalne nagrody.',
    icon: 'mdi-ghost',
    color: '#9C27B0',
    duration: 168,
    modifiers: [
      { type: 'xp_multiplier', value: 1.5, target: 'warrior' },
      { type: 'loot_multiplier', value: 2.0 },
    ],
    rewards: [
      { type: 'item', id: 'ghost_essence', amount: 15 },
      { type: 'item', id: 'pumpkin_helm', amount: 1 },
    ],
    schedule: {
      type: 'seasonal',
      month: 10, // October
      dayOfMonth: 25,
    },
  },
];

// ============================================
// WEEKEND BONUSES
// ============================================

export const WEEKEND_BONUSES: EventDefinition[] = [
  {
    id: 'weekend_warrior',
    type: 'weekend_bonus',
    name: 'Weekend Wojownika',
    description: 'Zwiększone XP z walki przez cały weekend!',
    icon: 'mdi-sword-cross',
    color: '#F44336',
    duration: 48, // Fri-Sun
    modifiers: [
      { type: 'xp_multiplier', value: 1.5, target: 'warrior' },
    ],
    schedule: {
      type: 'recurring',
      dayOfWeek: [5, 6, 0], // Fri, Sat, Sun
      hourStart: 18,
    },
  },
  {
    id: 'weekend_merchant',
    type: 'weekend_bonus',
    name: 'Targ Weekendowy',
    description: 'Więcej klientów i lepsze ceny w sklepie!',
    icon: 'mdi-cart',
    color: '#FFC107',
    duration: 48,
    modifiers: [
      { type: 'gold_multiplier', value: 1.5, target: 'merchant' },
    ],
    schedule: {
      type: 'recurring',
      dayOfWeek: [5, 6, 0],
      hourStart: 18,
    },
  },
  {
    id: 'weekend_scientist',
    type: 'weekend_bonus',
    name: 'Weekend Nauki',
    description: 'Szybsze badania i lepsza jakość mikstur!',
    icon: 'mdi-flask',
    color: '#4CAF50',
    duration: 48,
    modifiers: [
      { type: 'xp_multiplier', value: 1.5, target: 'scientist' },
    ],
    schedule: {
      type: 'recurring',
      dayOfWeek: [5, 6, 0],
      hourStart: 18,
    },
  },
];

// ============================================
// DAILY CHALLENGES
// ============================================

export interface DailyChallenge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'combat' | 'merchant' | 'scientist' | 'general';
  difficulty: 'easy' | 'medium' | 'hard';
  objectives: ChallengeObjective[];
  rewards: EventReward[];
  timeLimit: number; // Hours
}

export interface ChallengeObjective {
  type: 'kill' | 'earn_gold' | 'craft' | 'research' | 'sell' | 'complete_dungeon' | 'slayer_task';
  target?: string;
  amount: number;
  current?: number;
}

export const DAILY_CHALLENGES: DailyChallenge[] = [
  // Combat challenges
  {
    id: 'daily_hunter',
    name: 'Łowca Dnia',
    description: 'Pokonaj 50 potworów',
    icon: 'mdi-sword',
    category: 'combat',
    difficulty: 'easy',
    objectives: [{ type: 'kill', amount: 50 }],
    rewards: [
      { type: 'resource', id: 'gold', amount: 200 },
      { type: 'resource', id: 'slayerCoins', amount: 10 },
    ],
    timeLimit: 24,
  },
  {
    id: 'daily_elite_hunter',
    name: 'Pogromca',
    description: 'Pokonaj 10 elitarnych potworów',
    icon: 'mdi-skull',
    category: 'combat',
    difficulty: 'medium',
    objectives: [{ type: 'kill', target: 'elite', amount: 10 }],
    rewards: [
      { type: 'resource', id: 'gold', amount: 500 },
      { type: 'item', id: 'rare_gem', amount: 2 },
    ],
    timeLimit: 24,
  },
  {
    id: 'daily_dungeon',
    name: 'Odkrywca Lochów',
    description: 'Ukończ dowolny loch',
    icon: 'mdi-castle',
    category: 'combat',
    difficulty: 'hard',
    objectives: [{ type: 'complete_dungeon', amount: 1 }],
    rewards: [
      { type: 'resource', id: 'gold', amount: 1000 },
      { type: 'legacy_points', id: 'lp', amount: 5 },
    ],
    timeLimit: 24,
  },
  {
    id: 'daily_slayer',
    name: 'Łowca Kontraktów',
    description: 'Ukończ 2 zadania łowcy',
    icon: 'mdi-target-account',
    category: 'combat',
    difficulty: 'medium',
    objectives: [{ type: 'slayer_task', amount: 2 }],
    rewards: [
      { type: 'resource', id: 'slayerCoins', amount: 50 },
      { type: 'item', id: 'slayer_potion', amount: 2 },
    ],
    timeLimit: 24,
  },
  // Merchant challenges
  {
    id: 'daily_trader',
    name: 'Kupiec Dnia',
    description: 'Zarób 1000 złota ze sprzedaży',
    icon: 'mdi-gold',
    category: 'merchant',
    difficulty: 'easy',
    objectives: [{ type: 'earn_gold', amount: 1000 }],
    rewards: [
      { type: 'resource', id: 'gold', amount: 300 },
    ],
    timeLimit: 24,
  },
  {
    id: 'daily_big_sales',
    name: 'Wielka Sprzedaż',
    description: 'Sprzedaj 20 przedmiotów',
    icon: 'mdi-cash-register',
    category: 'merchant',
    difficulty: 'medium',
    objectives: [{ type: 'sell', amount: 20 }],
    rewards: [
      { type: 'resource', id: 'gold', amount: 500 },
      { type: 'item', id: 'merchant_voucher', amount: 1 },
    ],
    timeLimit: 24,
  },
  // Scientist challenges
  {
    id: 'daily_alchemist',
    name: 'Alchemik Dnia',
    description: 'Stwórz 5 mikstur',
    icon: 'mdi-flask-round-bottom',
    category: 'scientist',
    difficulty: 'easy',
    objectives: [{ type: 'craft', amount: 5 }],
    rewards: [
      { type: 'item', id: 'magic_dust', amount: 10 },
    ],
    timeLimit: 24,
  },
  {
    id: 'daily_researcher',
    name: 'Badacz',
    description: 'Zdobądź poziom badań',
    icon: 'mdi-book-open-page-variant',
    category: 'scientist',
    difficulty: 'medium',
    objectives: [{ type: 'research', amount: 1 }],
    rewards: [
      { type: 'item', id: 'ancient_scroll', amount: 1 },
      { type: 'resource', id: 'gold', amount: 400 },
    ],
    timeLimit: 24,
  },
  // General challenges
  {
    id: 'daily_active',
    name: 'Aktywny Gracz',
    description: 'Graj przez 30 minut',
    icon: 'mdi-clock',
    category: 'general',
    difficulty: 'easy',
    objectives: [{ type: 'kill', amount: 100 }], // Proxy for playtime
    rewards: [
      { type: 'resource', id: 'gold', amount: 250 },
      { type: 'legacy_points', id: 'lp', amount: 2 },
    ],
    timeLimit: 24,
  },
];

// ============================================
// WORLD EVENTS (Random)
// ============================================

export const WORLD_EVENTS: EventDefinition[] = [
  {
    id: 'gold_rush',
    type: 'world_event',
    name: 'Gorączka Złota',
    description: 'Odkryto nowe złoża złota! Podwójne złoto z wszystkich źródeł.',
    icon: 'mdi-gold',
    color: '#FFD700',
    duration: 4,
    modifiers: [
      { type: 'gold_multiplier', value: 2.0 },
    ],
    schedule: {
      type: 'random',
      probability: 0.05, // 5% per day
    },
  },
  {
    id: 'blood_moon',
    type: 'world_event',
    name: 'Krwawa Księżyc',
    description: 'Potwory są silniejsze, ale dają więcej XP i lepszy loot!',
    icon: 'mdi-moon-full',
    color: '#B71C1C',
    duration: 2,
    modifiers: [
      { type: 'xp_multiplier', value: 2.0, target: 'warrior' },
      { type: 'loot_multiplier', value: 1.75 },
    ],
    schedule: {
      type: 'random',
      probability: 0.03,
    },
  },
  {
    id: 'merchant_caravan',
    type: 'world_event',
    name: 'Karawana Kupiecka',
    description: 'Przybyła bogata karawana z egzotycznymi towarami!',
    icon: 'mdi-truck',
    color: '#795548',
    duration: 6,
    modifiers: [
      { type: 'cost_reduction', value: 0.3, target: 'merchant' },
      { type: 'gold_multiplier', value: 1.5, target: 'merchant' },
    ],
    schedule: {
      type: 'random',
      probability: 0.04,
    },
  },
  {
    id: 'arcane_surge',
    type: 'world_event',
    name: 'Fala Magii',
    description: 'Magiczna energia przepływa przez świat. Szybsze badania i alchemia!',
    icon: 'mdi-auto-fix',
    color: '#9C27B0',
    duration: 3,
    modifiers: [
      { type: 'xp_multiplier', value: 1.75, target: 'scientist' },
      { type: 'cost_reduction', value: 0.25, target: 'scientist' },
    ],
    schedule: {
      type: 'random',
      probability: 0.04,
    },
  },
  {
    id: 'monster_invasion',
    type: 'world_event',
    name: 'Inwazja Potworów',
    description: 'Fala potworów atakuje! Pokonuj je dla dodatkowych nagród.',
    icon: 'mdi-skull-crossbones',
    color: '#212121',
    duration: 4,
    modifiers: [
      { type: 'xp_multiplier', value: 1.5, target: 'warrior' },
      { type: 'loot_multiplier', value: 2.5, target: 'warrior' },
    ],
    rewards: [
      { type: 'item', id: 'invasion_trophy', amount: 1 },
    ],
    schedule: {
      type: 'random',
      probability: 0.02,
    },
  },
];

// ============================================
// SPECIAL ONE-TIME EVENTS
// ============================================

export const SPECIAL_EVENTS: EventDefinition[] = [
  {
    id: 'anniversary',
    type: 'festival',
    name: 'Rocznica Gry',
    description: 'Świętuj rocznicę Ateria Idle! Wszystkie bonusy podwojone.',
    icon: 'mdi-cake-variant',
    color: '#E91E63',
    duration: 72,
    modifiers: [
      { type: 'xp_multiplier', value: 2.0 },
      { type: 'gold_multiplier', value: 2.0 },
      { type: 'loot_multiplier', value: 2.0 },
    ],
    rewards: [
      { type: 'legacy_points', id: 'lp', amount: 100 },
      { type: 'item', id: 'anniversary_crown', amount: 1 },
    ],
    schedule: {
      type: 'manual',
    },
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getEventDefinition(id: string): EventDefinition | undefined {
  return [
    ...SEASONAL_FESTIVALS,
    ...WEEKEND_BONUSES,
    ...WORLD_EVENTS,
    ...SPECIAL_EVENTS,
  ].find(e => e.id === id);
}

export function getEventsByType(type: GameEventType): EventDefinition[] {
  switch (type) {
    case 'festival':
      return [...SEASONAL_FESTIVALS, ...SPECIAL_EVENTS.filter(e => e.type === 'festival')];
    case 'weekend_bonus':
      return WEEKEND_BONUSES;
    case 'world_event':
      return WORLD_EVENTS;
    case 'daily_challenge':
      return []; // Challenges are separate
    default:
      return [];
  }
}

export function getDailyChallenge(id: string): DailyChallenge | undefined {
  return DAILY_CHALLENGES.find(c => c.id === id);
}

export function getRandomDailyChallenges(count: number = 3): DailyChallenge[] {
  const shuffled = [...DAILY_CHALLENGES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getSeasonalEvent(month: number): EventDefinition | undefined {
  return SEASONAL_FESTIVALS.find(e => e.schedule?.month === month);
}

export function isEventActive(event: EventDefinition, currentTime: number = Date.now()): boolean {
  // This would need actual event instance tracking
  // Here just a placeholder
  return false;
}

export function calculateEventModifiers(
  activeEvents: EventDefinition[],
  path?: PathId
): { xp: number; gold: number; loot: number; cost: number } {
  const result = { xp: 1, gold: 1, loot: 1, cost: 1 };

  for (const event of activeEvents) {
    for (const mod of event.modifiers) {
      // Check if modifier applies to this path
      if (mod.target && path && mod.target !== path) continue;

      switch (mod.type) {
        case 'xp_multiplier':
          result.xp *= mod.value;
          break;
        case 'gold_multiplier':
          result.gold *= mod.value;
          break;
        case 'loot_multiplier':
          result.loot *= mod.value;
          break;
        case 'cost_reduction':
          result.cost *= (1 - mod.value);
          break;
      }
    }
  }

  return result;
}

export function getUpcomingEvents(days: number = 30): EventDefinition[] {
  const now = new Date();
  const upcoming: EventDefinition[] = [];

  for (const event of SEASONAL_FESTIVALS) {
    if (event.schedule?.type === 'seasonal' && event.schedule.month && event.schedule.dayOfMonth) {
      const eventDate = new Date(now.getFullYear(), event.schedule.month - 1, event.schedule.dayOfMonth);
      
      // If event already passed this year, check next year
      if (eventDate < now) {
        eventDate.setFullYear(eventDate.getFullYear() + 1);
      }

      const daysUntil = Math.floor((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntil <= days) {
        upcoming.push(event);
      }
    }
  }

  return upcoming.sort((a, b) => {
    const dateA = new Date(now.getFullYear(), (a.schedule?.month || 1) - 1, a.schedule?.dayOfMonth || 1);
    const dateB = new Date(now.getFullYear(), (b.schedule?.month || 1) - 1, b.schedule?.dayOfMonth || 1);
    return dateA.getTime() - dateB.getTime();
  });
}
