/**
 * Bard Path Data - Songs, Performances, Instruments
 */

// ============================================
// TYPES
// ============================================

export type SongGenre = 'ballad' | 'epic' | 'folk' | 'comedy' | 'mystical' | 'war';

export type InstrumentType = 'string' | 'wind' | 'percussion' | 'voice';

export type VenueType = 'tavern' | 'square' | 'noble_court' | 'festival' | 'arena';

export interface Song {
  id: string;
  name: string;
  description: string;
  icon: string;
  genre: SongGenre;
  tier: number;
  
  // Requirements
  requiredLevel: number;
  instrumentRequired?: string;
  
  // Performance
  duration: number; // Ticks
  difficulty: number; // 1-100
  
  // Effects when played
  buffEffects?: SongBuff[];
  buffDuration?: number;
  
  // Rewards
  xpReward: number;
  baseTips: number;
}

export interface SongBuff {
  type: 'morale' | 'attack' | 'defense' | 'speed' | 'luck' | 'xp_bonus' | 'gold_bonus';
  value: number;
  description: string;
}

export interface Instrument {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: InstrumentType;
  tier: number;
  
  // Stats
  quality: number; // Affects performance quality
  genreBonus?: SongGenre; // Bonus for specific genre
  
  // Requirements
  requiredLevel: number;
  cost: number;
}

export interface Venue {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: VenueType;
  
  // Requirements
  requiredLevel: number;
  requiredReputation: number;
  
  // Performance modifiers
  audienceSize: number;
  tipMultiplier: number;
  reputationGain: number;
  
  // Preferred genres
  preferredGenres: SongGenre[];
}

export interface Performance {
  songId: string;
  venueId: string;
  quality: 'poor' | 'average' | 'good' | 'excellent' | 'legendary';
  tipsEarned: number;
  reputationGained: number;
  performedAt: number;
}

export interface BardProgress {
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXp: number;
}

// ============================================
// GENRES
// ============================================

export const GENRES: Record<SongGenre, { name: string; icon: string; color: string; description: string }> = {
  ballad: { name: 'Ballada', icon: 'mdi-heart', color: '#E91E63', description: 'Romantyczne pieśni o miłości' },
  epic: { name: 'Epos', icon: 'mdi-sword', color: '#FF9800', description: 'Opowieści o bohaterach' },
  folk: { name: 'Ludowa', icon: 'mdi-account-group', color: '#4CAF50', description: 'Tradycyjne pieśni' },
  comedy: { name: 'Komedia', icon: 'mdi-emoticon-happy', color: '#FFEB3B', description: 'Zabawne piosenki' },
  mystical: { name: 'Mistyczna', icon: 'mdi-star', color: '#9C27B0', description: 'Tajemnicze melodie' },
  war: { name: 'Wojenna', icon: 'mdi-shield', color: '#F44336', description: 'Pieśni bojowe' },
};

// ============================================
// SONGS
// ============================================

export const SONGS: Record<string, Song> = {
  // Ballads
  lovers_lament: {
    id: 'lovers_lament',
    name: 'Lament Kochanków',
    description: 'Smutna pieśń o rozłączonej miłości.',
    icon: 'mdi-heart-broken',
    genre: 'ballad',
    tier: 1,
    requiredLevel: 1,
    duration: 150,
    difficulty: 20,
    buffEffects: [{ type: 'morale', value: 10, description: '+10% morale' }],
    buffDuration: 600,
    xpReward: 15,
    baseTips: 10,
  },
  moonlight_serenade: {
    id: 'moonlight_serenade',
    name: 'Serenada Księżycowa',
    description: 'Romantyczna melodia pod gwiazadami.',
    icon: 'mdi-weather-night',
    genre: 'ballad',
    tier: 2,
    requiredLevel: 8,
    instrumentRequired: 'lute',
    duration: 200,
    difficulty: 40,
    buffEffects: [
      { type: 'morale', value: 20, description: '+20% morale' },
      { type: 'luck', value: 5, description: '+5% szczęścia' },
    ],
    buffDuration: 900,
    xpReward: 35,
    baseTips: 25,
  },
  eternal_love: {
    id: 'eternal_love',
    name: 'Wieczna Miłość',
    description: 'Najpiękniejsza ballada o nieśmiertelnej miłości.',
    icon: 'mdi-heart-multiple',
    genre: 'ballad',
    tier: 4,
    requiredLevel: 25,
    instrumentRequired: 'harp',
    duration: 300,
    difficulty: 75,
    buffEffects: [
      { type: 'morale', value: 35, description: '+35% morale' },
      { type: 'luck', value: 15, description: '+15% szczęścia' },
    ],
    buffDuration: 1500,
    xpReward: 100,
    baseTips: 80,
  },

  // Epic songs
  hero_ballad: {
    id: 'hero_ballad',
    name: 'Ballada o Bohaterze',
    description: 'Opowieść o wielkim wojowniku.',
    icon: 'mdi-sword',
    genre: 'epic',
    tier: 1,
    requiredLevel: 3,
    duration: 180,
    difficulty: 30,
    buffEffects: [{ type: 'attack', value: 10, description: '+10% obrażeń' }],
    buffDuration: 600,
    xpReward: 20,
    baseTips: 15,
  },
  dragon_slayer: {
    id: 'dragon_slayer',
    name: 'Pogromca Smoków',
    description: 'Epicka opowieść o walce ze smokiem.',
    icon: 'mdi-dragon',
    genre: 'epic',
    tier: 3,
    requiredLevel: 15,
    instrumentRequired: 'war_drum',
    duration: 250,
    difficulty: 60,
    buffEffects: [
      { type: 'attack', value: 25, description: '+25% obrażeń' },
      { type: 'defense', value: 15, description: '+15% obrony' },
    ],
    buffDuration: 1200,
    xpReward: 60,
    baseTips: 50,
  },
  legend_of_ages: {
    id: 'legend_of_ages',
    name: 'Legenda Wieków',
    description: 'Najwspanialsza saga wszechczasów.',
    icon: 'mdi-book-open-page-variant',
    genre: 'epic',
    tier: 5,
    requiredLevel: 35,
    instrumentRequired: 'golden_harp',
    duration: 400,
    difficulty: 90,
    buffEffects: [
      { type: 'attack', value: 40, description: '+40% obrażeń' },
      { type: 'defense', value: 30, description: '+30% obrony' },
      { type: 'morale', value: 25, description: '+25% morale' },
    ],
    buffDuration: 2000,
    xpReward: 180,
    baseTips: 150,
  },

  // Folk songs
  village_dance: {
    id: 'village_dance',
    name: 'Wiejski Taniec',
    description: 'Radosna melodia ludowa.',
    icon: 'mdi-dance-ballroom',
    genre: 'folk',
    tier: 1,
    requiredLevel: 2,
    duration: 120,
    difficulty: 15,
    buffEffects: [{ type: 'speed', value: 10, description: '+10% szybkości' }],
    buffDuration: 600,
    xpReward: 12,
    baseTips: 8,
  },
  harvest_song: {
    id: 'harvest_song',
    name: 'Pieśń Żniw',
    description: 'Tradycyjna pieśń rolników.',
    icon: 'mdi-barley',
    genre: 'folk',
    tier: 2,
    requiredLevel: 7,
    instrumentRequired: 'flute',
    duration: 160,
    difficulty: 35,
    buffEffects: [
      { type: 'gold_bonus', value: 10, description: '+10% złota' },
    ],
    buffDuration: 900,
    xpReward: 28,
    baseTips: 20,
  },
  ancient_melody: {
    id: 'ancient_melody',
    name: 'Pradawna Melodia',
    description: 'Starożytna pieśń przodków.',
    icon: 'mdi-music-clef-treble',
    genre: 'folk',
    tier: 4,
    requiredLevel: 28,
    instrumentRequired: 'ancient_pipes',
    duration: 280,
    difficulty: 70,
    buffEffects: [
      { type: 'xp_bonus', value: 25, description: '+25% XP' },
      { type: 'gold_bonus', value: 20, description: '+20% złota' },
    ],
    buffDuration: 1500,
    xpReward: 90,
    baseTips: 70,
  },

  // Comedy
  tavern_jest: {
    id: 'tavern_jest',
    name: 'Karczemiany Żart',
    description: 'Zabawna piosenka o pijanym rycerzu.',
    icon: 'mdi-glass-mug-variant',
    genre: 'comedy',
    tier: 1,
    requiredLevel: 4,
    duration: 100,
    difficulty: 20,
    buffEffects: [{ type: 'morale', value: 15, description: '+15% morale' }],
    buffDuration: 500,
    xpReward: 18,
    baseTips: 12,
  },
  goblin_song: {
    id: 'goblin_song',
    name: 'Piosenka o Goblinie',
    description: 'Komiczna opowieść o głupim goblinie.',
    icon: 'mdi-emoticon-tongue',
    genre: 'comedy',
    tier: 2,
    requiredLevel: 10,
    duration: 140,
    difficulty: 40,
    buffEffects: [
      { type: 'morale', value: 25, description: '+25% morale' },
      { type: 'luck', value: 10, description: '+10% szczęścia' },
    ],
    buffDuration: 800,
    xpReward: 40,
    baseTips: 30,
  },

  // Mystical
  starlight_hymn: {
    id: 'starlight_hymn',
    name: 'Hymn Gwiezdny',
    description: 'Mistyczna pieśń do gwiazd.',
    icon: 'mdi-star',
    genre: 'mystical',
    tier: 2,
    requiredLevel: 12,
    instrumentRequired: 'crystal_chimes',
    duration: 200,
    difficulty: 50,
    buffEffects: [
      { type: 'xp_bonus', value: 15, description: '+15% XP' },
    ],
    buffDuration: 1000,
    xpReward: 45,
    baseTips: 35,
  },
  void_whisper: {
    id: 'void_whisper',
    name: 'Szept Pustki',
    description: 'Mroczna melodia z innego wymiaru.',
    icon: 'mdi-moon-waning-crescent',
    genre: 'mystical',
    tier: 4,
    requiredLevel: 30,
    instrumentRequired: 'void_violin',
    duration: 320,
    difficulty: 85,
    buffEffects: [
      { type: 'xp_bonus', value: 30, description: '+30% XP' },
      { type: 'luck', value: 20, description: '+20% szczęścia' },
    ],
    buffDuration: 1800,
    xpReward: 120,
    baseTips: 100,
  },

  // War songs
  march_to_war: {
    id: 'march_to_war',
    name: 'Marsz na Wojnę',
    description: 'Motywująca pieśń bojowa.',
    icon: 'mdi-shield-sword',
    genre: 'war',
    tier: 1,
    requiredLevel: 5,
    instrumentRequired: 'war_drum',
    duration: 150,
    difficulty: 35,
    buffEffects: [
      { type: 'attack', value: 15, description: '+15% obrażeń' },
      { type: 'morale', value: 10, description: '+10% morale' },
    ],
    buffDuration: 700,
    xpReward: 25,
    baseTips: 18,
  },
  victory_anthem: {
    id: 'victory_anthem',
    name: 'Hymn Zwycięstwa',
    description: 'Pieśń triumfu po wielkiej bitwie.',
    icon: 'mdi-trophy',
    genre: 'war',
    tier: 3,
    requiredLevel: 20,
    instrumentRequired: 'war_horn',
    duration: 220,
    difficulty: 65,
    buffEffects: [
      { type: 'attack', value: 30, description: '+30% obrażeń' },
      { type: 'defense', value: 20, description: '+20% obrony' },
      { type: 'morale', value: 20, description: '+20% morale' },
    ],
    buffDuration: 1400,
    xpReward: 75,
    baseTips: 60,
  },
};

// ============================================
// INSTRUMENTS
// ============================================

export const INSTRUMENTS: Record<string, Instrument> = {
  voice: {
    id: 'voice',
    name: 'Głos',
    description: 'Twój naturalny instrument.',
    icon: 'mdi-microphone',
    type: 'voice',
    tier: 1,
    quality: 5,
    requiredLevel: 1,
    cost: 0,
  },
  lute: {
    id: 'lute',
    name: 'Lutnia',
    description: 'Klasyczny instrument barda.',
    icon: 'mdi-guitar-acoustic',
    type: 'string',
    tier: 1,
    quality: 10,
    genreBonus: 'ballad',
    requiredLevel: 3,
    cost: 100,
  },
  flute: {
    id: 'flute',
    name: 'Flet',
    description: 'Delikatny instrument dęty.',
    icon: 'mdi-music-note',
    type: 'wind',
    tier: 1,
    quality: 10,
    genreBonus: 'folk',
    requiredLevel: 5,
    cost: 120,
  },
  war_drum: {
    id: 'war_drum',
    name: 'Bęben Wojenny',
    description: 'Potężny instrument perkusyjny.',
    icon: 'mdi-drum',
    type: 'percussion',
    tier: 2,
    quality: 15,
    genreBonus: 'war',
    requiredLevel: 8,
    cost: 250,
  },
  harp: {
    id: 'harp',
    name: 'Harfa',
    description: 'Elegancki instrument strunowy.',
    icon: 'mdi-harp',
    type: 'string',
    tier: 2,
    quality: 20,
    genreBonus: 'ballad',
    requiredLevel: 12,
    cost: 400,
  },
  war_horn: {
    id: 'war_horn',
    name: 'Róg Bojowy',
    description: 'Głośny róg z kości.',
    icon: 'mdi-bugle',
    type: 'wind',
    tier: 2,
    quality: 18,
    genreBonus: 'war',
    requiredLevel: 15,
    cost: 350,
  },
  crystal_chimes: {
    id: 'crystal_chimes',
    name: 'Kryształowe Dzwonki',
    description: 'Magiczne dzwonki z kryształów.',
    icon: 'mdi-bell',
    type: 'percussion',
    tier: 3,
    quality: 25,
    genreBonus: 'mystical',
    requiredLevel: 18,
    cost: 600,
  },
  ancient_pipes: {
    id: 'ancient_pipes',
    name: 'Starożytne Piszczałki',
    description: 'Pradawny instrument elfów.',
    icon: 'mdi-music-clef-treble',
    type: 'wind',
    tier: 3,
    quality: 28,
    genreBonus: 'folk',
    requiredLevel: 22,
    cost: 800,
  },
  golden_harp: {
    id: 'golden_harp',
    name: 'Złota Harfa',
    description: 'Legendarna harfa ze złota.',
    icon: 'mdi-harp',
    type: 'string',
    tier: 4,
    quality: 40,
    genreBonus: 'epic',
    requiredLevel: 30,
    cost: 2000,
  },
  void_violin: {
    id: 'void_violin',
    name: 'Skrzypce Pustki',
    description: 'Instrument z innego wymiaru.',
    icon: 'mdi-violin',
    type: 'string',
    tier: 5,
    quality: 50,
    genreBonus: 'mystical',
    requiredLevel: 38,
    cost: 5000,
  },
};

// ============================================
// VENUES
// ============================================

export const VENUES: Record<string, Venue> = {
  village_tavern: {
    id: 'village_tavern',
    name: 'Wiejska Karczma',
    description: 'Przytulna karczma dla prostych ludzi.',
    icon: 'mdi-glass-mug-variant',
    type: 'tavern',
    requiredLevel: 1,
    requiredReputation: 0,
    audienceSize: 20,
    tipMultiplier: 1.0,
    reputationGain: 5,
    preferredGenres: ['folk', 'comedy'],
  },
  market_square: {
    id: 'market_square',
    name: 'Rynek Miejski',
    description: 'Tętniący życiem plac targowy.',
    icon: 'mdi-store',
    type: 'square',
    requiredLevel: 5,
    requiredReputation: 50,
    audienceSize: 50,
    tipMultiplier: 1.2,
    reputationGain: 10,
    preferredGenres: ['folk', 'ballad', 'comedy'],
  },
  grand_tavern: {
    id: 'grand_tavern',
    name: 'Wielka Karczma',
    description: 'Luksusowa gospoda dla zamożnych.',
    icon: 'mdi-glass-cocktail',
    type: 'tavern',
    requiredLevel: 10,
    requiredReputation: 150,
    audienceSize: 40,
    tipMultiplier: 1.5,
    reputationGain: 15,
    preferredGenres: ['ballad', 'epic'],
  },
  noble_court: {
    id: 'noble_court',
    name: 'Dwór Szlachecki',
    description: 'Elegancki dwór lokalnego lorda.',
    icon: 'mdi-crown',
    type: 'noble_court',
    requiredLevel: 18,
    requiredReputation: 400,
    audienceSize: 30,
    tipMultiplier: 2.0,
    reputationGain: 25,
    preferredGenres: ['ballad', 'epic', 'mystical'],
  },
  festival_stage: {
    id: 'festival_stage',
    name: 'Scena Festiwalowa',
    description: 'Wielka scena podczas festiwalu.',
    icon: 'mdi-party-popper',
    type: 'festival',
    requiredLevel: 25,
    requiredReputation: 800,
    audienceSize: 200,
    tipMultiplier: 1.8,
    reputationGain: 40,
    preferredGenres: ['folk', 'epic', 'war'],
  },
  royal_palace: {
    id: 'royal_palace',
    name: 'Pałac Królewski',
    description: 'Występ przed samym królem.',
    icon: 'mdi-castle',
    type: 'noble_court',
    requiredLevel: 35,
    requiredReputation: 2000,
    audienceSize: 100,
    tipMultiplier: 3.0,
    reputationGain: 100,
    preferredGenres: ['epic', 'mystical', 'ballad'],
  },
  colosseum: {
    id: 'colosseum',
    name: 'Koloseum',
    description: 'Wielka arena dla masowej publiczności.',
    icon: 'mdi-stadium',
    type: 'arena',
    requiredLevel: 40,
    requiredReputation: 5000,
    audienceSize: 1000,
    tipMultiplier: 2.5,
    reputationGain: 200,
    preferredGenres: ['war', 'epic'],
  },
};

// ============================================
// QUALITY SYSTEM
// ============================================

export const PERFORMANCE_QUALITY: Record<string, { label: string; color: string; multiplier: number }> = {
  poor: { label: 'Słaby', color: '#9E9E9E', multiplier: 0.5 },
  average: { label: 'Przeciętny', color: '#8D6E63', multiplier: 1.0 },
  good: { label: 'Dobry', color: '#4CAF50', multiplier: 1.3 },
  excellent: { label: 'Wybitny', color: '#2196F3', multiplier: 1.6 },
  legendary: { label: 'Legendarny', color: '#FF9800', multiplier: 2.5 },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getSong(id: string): Song | undefined {
  return SONGS[id];
}

export function getInstrument(id: string): Instrument | undefined {
  return INSTRUMENTS[id];
}

export function getVenue(id: string): Venue | undefined {
  return VENUES[id];
}

export function getSongsByGenre(genre: SongGenre): Song[] {
  return Object.values(SONGS).filter(s => s.genre === genre);
}

export function getAvailableSongs(level: number, instruments: Set<string>): Song[] {
  return Object.values(SONGS).filter(s => 
    s.requiredLevel <= level && 
    (!s.instrumentRequired || instruments.has(s.instrumentRequired))
  );
}

export function getAvailableVenues(level: number, reputation: number): Venue[] {
  return Object.values(VENUES).filter(v => 
    v.requiredLevel <= level && v.requiredReputation <= reputation
  );
}

export function calculateBardXpToLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.15, level - 1));
}

export function calculatePerformanceQuality(
  songDifficulty: number,
  playerLevel: number,
  instrumentQuality: number,
  genreMatch: boolean
): string {
  let score = (playerLevel * 2) + instrumentQuality - songDifficulty;
  if (genreMatch) score += 15;
  score += Math.random() * 30 - 15; // Random factor
  
  if (score >= 80) return 'legendary';
  if (score >= 60) return 'excellent';
  if (score >= 40) return 'good';
  if (score >= 20) return 'average';
  return 'poor';
}

export function getGenreColor(genre: SongGenre): string {
  return GENRES[genre].color;
}

export function getGenreName(genre: SongGenre): string {
  return GENRES[genre].name;
}
