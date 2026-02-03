/**
 * Minigames System - Dice, Cards, Puzzles, Races
 */

export type MinigameType = 'dice' | 'cards' | 'slots' | 'puzzle' | 'memory' | 'reaction';
export type Difficulty = 'easy' | 'normal' | 'hard' | 'extreme';

export interface MinigameData {
  id: string;
  name: string;
  description: string;
  type: MinigameType;
  icon: string;
  color: string;
  unlockLevel: number;
  minBet: number;
  maxBet: number;
  cooldownMinutes: number;
  rewards: {
    baseGold: number;
    xp: number;
    multiplierOnWin: number;
  };
  rules: string[];
}

export interface DiceGame {
  playerDice: number[];
  npcDice: number[];
  playerTotal: number;
  npcTotal: number;
  bet: number;
  result: 'win' | 'lose' | 'tie' | null;
}

export interface CardGame {
  playerHand: PlayingCard[];
  dealerHand: PlayingCard[];
  deck: PlayingCard[];
  bet: number;
  playerScore: number;
  dealerScore: number;
  phase: 'betting' | 'playing' | 'dealer' | 'result';
  result: 'win' | 'lose' | 'tie' | 'blackjack' | null;
}

export interface PlayingCard {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  value: number; // 1-13 (A=1, J=11, Q=12, K=13)
  faceUp: boolean;
}

export interface SlotsGame {
  reels: string[][];
  currentSpin: string[];
  bet: number;
  result: 'jackpot' | 'bigwin' | 'win' | 'lose' | null;
  multiplier: number;
}

export interface PuzzleGame {
  grid: number[][];
  emptyPos: { x: number; y: number };
  moves: number;
  solved: boolean;
  difficulty: Difficulty;
  timeLimit: number; // seconds
}

export interface MemoryGame {
  cards: { id: number; symbol: string; flipped: boolean; matched: boolean }[];
  flippedCards: number[];
  matches: number;
  attempts: number;
  difficulty: Difficulty;
}

export interface ReactionGame {
  targets: { x: number; y: number; hit: boolean; spawnTime: number }[];
  score: number;
  misses: number;
  timeRemaining: number;
  difficulty: Difficulty;
}

// ============================================
// MINIGAMES
// ============================================

export const MINIGAMES: MinigameData[] = [
  {
    id: 'dice_duel', name: 'Pojedynek Kości', type: 'dice', icon: 'mdi-dice-multiple', color: '#F44336',
    description: 'Klasyczna gra w kości przeciwko NPC. Wyższa suma wygrywa!',
    unlockLevel: 1, minBet: 10, maxBet: 10000, cooldownMinutes: 0,
    rewards: { baseGold: 0, xp: 10, multiplierOnWin: 2 },
    rules: [
      'Rzuć 2 kośćmi',
      'NPC też rzuca 2 kośćmi',
      'Wyższa suma wygrywa',
      'Remis = zwrot stawki',
    ],
  },
  {
    id: 'high_low', name: 'Wyżej-Niżej', type: 'dice', icon: 'mdi-dice-6', color: '#E91E63',
    description: 'Zgadnij czy następny rzut będzie wyższy czy niższy!',
    unlockLevel: 5, minBet: 50, maxBet: 25000, cooldownMinutes: 0,
    rewards: { baseGold: 0, xp: 15, multiplierOnWin: 1.8 },
    rules: [
      'Pierwsza kość jest pokazana',
      'Zgadnij czy następna będzie wyższa lub niższa',
      'Wygraj z serii zwiększa mnożnik',
    ],
  },
  {
    id: 'blackjack', name: 'Oczko', type: 'cards', icon: 'mdi-cards-playing', color: '#9C27B0',
    description: 'Klasyczne Oczko (Blackjack) - zbierz 21 punktów!',
    unlockLevel: 10, minBet: 100, maxBet: 50000, cooldownMinutes: 5,
    rewards: { baseGold: 0, xp: 25, multiplierOnWin: 2 },
    rules: [
      'Zbierz karty jak najbliżej 21',
      'As = 1 lub 11, Figury = 10',
      'Przebicie 21 = przegrana',
      'Blackjack (As + 10) = 2.5x stawki',
    ],
  },
  {
    id: 'slots', name: 'Jednoręki Bandyta', type: 'slots', icon: 'mdi-slot-machine', color: '#FF9800',
    description: 'Zakręć i wygraj! Trzy takie same = jackpot!',
    unlockLevel: 15, minBet: 25, maxBet: 5000, cooldownMinutes: 1,
    rewards: { baseGold: 0, xp: 5, multiplierOnWin: 5 },
    rules: [
      '3 bębny z symbolami',
      '3 takie same = wygrana',
      '3x Siedem = JACKPOT (x10)',
      '3x Wiśnia = x2, 3x Bar = x5',
    ],
  },
  {
    id: 'puzzle_15', name: 'Puzzle 15', type: 'puzzle', icon: 'mdi-puzzle', color: '#4CAF50',
    description: 'Ułóż liczby 1-15 w odpowiedniej kolejności!',
    unlockLevel: 5, minBet: 0, maxBet: 0, cooldownMinutes: 10,
    rewards: { baseGold: 100, xp: 50, multiplierOnWin: 1 },
    rules: [
      'Przesuwaj kafelki, aby ułożyć kolejność',
      'Mniej ruchów = lepszy wynik',
      'Limit czasowy zależny od trudności',
    ],
  },
  {
    id: 'memory_match', name: 'Memory', type: 'memory', icon: 'mdi-cards', color: '#2196F3',
    description: 'Znajdź wszystkie pary kart!',
    unlockLevel: 3, minBet: 0, maxBet: 0, cooldownMinutes: 5,
    rewards: { baseGold: 75, xp: 30, multiplierOnWin: 1 },
    rules: [
      'Odkryj 2 karty naraz',
      'Dopasowane pary zostają odkryte',
      'Znajdź wszystkie pary',
    ],
  },
  {
    id: 'reaction_test', name: 'Test Refleksu', type: 'reaction', icon: 'mdi-target', color: '#00BCD4',
    description: 'Klikaj pojawiające się cele jak najszybciej!',
    unlockLevel: 1, minBet: 0, maxBet: 0, cooldownMinutes: 2,
    rewards: { baseGold: 50, xp: 20, multiplierOnWin: 1 },
    rules: [
      'Klikaj cele gdy się pojawią',
      'Im szybciej, tym więcej punktów',
      'Spudłowanie = utrata punktów',
    ],
  },
];

// ============================================
// SLOT SYMBOLS
// ============================================

export const SLOT_SYMBOLS = [
  { id: 'cherry', icon: '🍒', multiplier: 2 },
  { id: 'lemon', icon: '🍋', multiplier: 2 },
  { id: 'orange', icon: '🍊', multiplier: 3 },
  { id: 'grape', icon: '🍇', multiplier: 3 },
  { id: 'bar', icon: '🎰', multiplier: 5 },
  { id: 'bell', icon: '🔔', multiplier: 5 },
  { id: 'diamond', icon: '💎', multiplier: 7 },
  { id: 'seven', icon: '7️⃣', multiplier: 10 },
];

// ============================================
// CARD HELPERS
// ============================================

export function createDeck(): PlayingCard[] {
  const suits: PlayingCard['suit'][] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const deck: PlayingCard[] = [];
  
  for (const suit of suits) {
    for (let value = 1; value <= 13; value++) {
      deck.push({ suit, value, faceUp: false });
    }
  }
  
  return shuffleArray(deck);
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getCardValue(card: PlayingCard): number {
  if (card.value === 1) return 11; // Ace (can be 1 or 11)
  if (card.value >= 10) return 10; // Face cards
  return card.value;
}

export function calculateHandScore(hand: PlayingCard[]): number {
  let score = 0;
  let aces = 0;
  
  for (const card of hand) {
    if (card.value === 1) {
      aces++;
      score += 11;
    } else {
      score += getCardValue(card);
    }
  }
  
  while (score > 21 && aces > 0) {
    score -= 10;
    aces--;
  }
  
  return score;
}

export function getCardDisplay(card: PlayingCard): string {
  const suitSymbols = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' };
  const valueSymbols = { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' };
  const value = valueSymbols[card.value as keyof typeof valueSymbols] || card.value.toString();
  return `${value}${suitSymbols[card.suit]}`;
}

// ============================================
// PUZZLE HELPERS
// ============================================

export function createPuzzleGrid(difficulty: Difficulty): { grid: number[][]; emptyPos: { x: number; y: number } } {
  const size = difficulty === 'easy' ? 3 : difficulty === 'normal' ? 4 : 5;
  const grid: number[][] = [];
  let num = 1;
  
  for (let y = 0; y < size; y++) {
    const row: number[] = [];
    for (let x = 0; x < size; x++) {
      row.push(num === size * size ? 0 : num);
      num++;
    }
    grid.push(row);
  }
  
  // Shuffle
  const emptyPos = { x: size - 1, y: size - 1 };
  for (let i = 0; i < 100; i++) {
    const moves = [
      { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
      { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
    ];
    const validMoves = moves.filter(m => {
      const nx = emptyPos.x + m.dx;
      const ny = emptyPos.y + m.dy;
      return nx >= 0 && nx < size && ny >= 0 && ny < size;
    });
    const move = validMoves[Math.floor(Math.random() * validMoves.length)];
    const nx = emptyPos.x + move.dx;
    const ny = emptyPos.y + move.dy;
    grid[emptyPos.y][emptyPos.x] = grid[ny][nx];
    grid[ny][nx] = 0;
    emptyPos.x = nx;
    emptyPos.y = ny;
  }
  
  return { grid, emptyPos };
}

export function isPuzzleSolved(grid: number[][]): boolean {
  const size = grid.length;
  let expected = 1;
  
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (y === size - 1 && x === size - 1) {
        if (grid[y][x] !== 0) return false;
      } else {
        if (grid[y][x] !== expected) return false;
        expected++;
      }
    }
  }
  
  return true;
}

// ============================================
// MEMORY HELPERS
// ============================================

export const MEMORY_SYMBOLS = ['🌟', '🌙', '🔥', '💧', '🌿', '⚡', '🎵', '💎', '🦋', '🌸', '🍀', '🎯'];

export function createMemoryBoard(difficulty: Difficulty): { id: number; symbol: string; flipped: boolean; matched: boolean }[] {
  const pairCount = difficulty === 'easy' ? 6 : difficulty === 'normal' ? 8 : 12;
  const symbols = MEMORY_SYMBOLS.slice(0, pairCount);
  const cards: { id: number; symbol: string; flipped: boolean; matched: boolean }[] = [];
  
  let id = 0;
  for (const symbol of symbols) {
    cards.push({ id: id++, symbol, flipped: false, matched: false });
    cards.push({ id: id++, symbol, flipped: false, matched: false });
  }
  
  return shuffleArray(cards);
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getMinigame(id: string): MinigameData | undefined {
  return MINIGAMES.find(g => g.id === id);
}

export function getMinigamesByType(type: MinigameType): MinigameData[] {
  return MINIGAMES.filter(g => g.type === type);
}

export function rollDice(count: number = 1): number[] {
  const results: number[] = [];
  for (let i = 0; i < count; i++) {
    results.push(Math.floor(Math.random() * 6) + 1);
  }
  return results;
}

export function spinSlots(): string[] {
  const result: string[] = [];
  for (let i = 0; i < 3; i++) {
    const symbol = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];
    result.push(symbol.icon);
  }
  return result;
}

export function checkSlotsResult(spin: string[]): { win: boolean; multiplier: number; type: string } {
  if (spin[0] === spin[1] && spin[1] === spin[2]) {
    const symbol = SLOT_SYMBOLS.find(s => s.icon === spin[0]);
    if (spin[0] === '7️⃣') {
      return { win: true, multiplier: 10, type: 'JACKPOT!' };
    }
    return { win: true, multiplier: symbol?.multiplier || 2, type: 'Wygrana!' };
  }
  if (spin[0] === spin[1] || spin[1] === spin[2]) {
    return { win: true, multiplier: 1.5, type: 'Mała wygrana' };
  }
  return { win: false, multiplier: 0, type: 'Przegrana' };
}

export const DIFFICULTY_SETTINGS = {
  easy: { timeMultiplier: 1.5, scoreMultiplier: 0.5 },
  normal: { timeMultiplier: 1.0, scoreMultiplier: 1.0 },
  hard: { timeMultiplier: 0.75, scoreMultiplier: 1.5 },
  extreme: { timeMultiplier: 0.5, scoreMultiplier: 2.0 },
};
