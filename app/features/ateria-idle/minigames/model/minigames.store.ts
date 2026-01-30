/**
 * Minigames Store - Game State, Betting, Results
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAteriaGameStore } from '../../core/model/game.store';
import { useAteriaResourcesStore } from '../../core/model/resources.store';
import {
  MINIGAMES, SLOT_SYMBOLS,
  getMinigame, rollDice, spinSlots, checkSlotsResult,
  createDeck, calculateHandScore, createPuzzleGrid, isPuzzleSolved,
  createMemoryBoard, type DiceGame, type CardGame, type SlotsGame,
  type PuzzleGame, type MemoryGame, type Difficulty
} from '../data/minigames.data';

// ============================================
// TYPES
// ============================================

export interface MinigameStats {
  gamesPlayed: number;
  gamesWon: number;
  totalBet: number;
  totalWon: number;
  biggestWin: number;
  currentStreak: number;
  bestStreak: number;
  byGame: Record<string, { played: number; won: number }>;
}

// ============================================
// STORE
// ============================================

export const useAteriaMinigamesStore = defineStore('ateria-minigames', () => {
  const gameStore = useAteriaGameStore();
  const resourcesStore = useAteriaResourcesStore();

  // ============================================
  // STATE
  // ============================================

  // Active games
  const activeDiceGame = ref<DiceGame | null>(null);
  const activeCardGame = ref<CardGame | null>(null);
  const activeSlotsGame = ref<SlotsGame | null>(null);
  const activePuzzleGame = ref<PuzzleGame | null>(null);
  const activeMemoryGame = ref<MemoryGame | null>(null);

  // Cooldowns
  const cooldowns = ref<Map<string, number>>(new Map());

  // Stats
  const stats = ref<MinigameStats>({
    gamesPlayed: 0,
    gamesWon: 0,
    totalBet: 0,
    totalWon: 0,
    biggestWin: 0,
    currentStreak: 0,
    bestStreak: 0,
    byGame: {},
  });

  // ============================================
  // COMPUTED
  // ============================================

  const winRate = computed(() => {
    if (stats.value.gamesPlayed === 0) return 0;
    return (stats.value.gamesWon / stats.value.gamesPlayed) * 100;
  });

  const netProfit = computed(() => {
    return stats.value.totalWon - stats.value.totalBet;
  });

  // ============================================
  // DICE GAME
  // ============================================

  function canPlayDice(bet: number): { canPlay: boolean; reason?: string } {
    const minigame = getMinigame('dice_duel')!;
    
    if (bet < minigame.minBet) {
      return { canPlay: false, reason: `Minimalna stawka: ${minigame.minBet}` };
    }
    if (bet > minigame.maxBet) {
      return { canPlay: false, reason: `Maksymalna stawka: ${minigame.maxBet}` };
    }
    if (resourcesStore.resources.gold < bet) {
      return { canPlay: false, reason: 'Za mało złota' };
    }
    
    return { canPlay: true };
  }

  function playDice(bet: number): DiceGame | null {
    const check = canPlayDice(bet);
    if (!check.canPlay) {
      gameStore.addNotification({ type: 'warning', title: 'Nie można grać', message: check.reason || '', icon: 'mdi-alert' });
      return null;
    }

    resourcesStore.addResource('gold', -bet);
    stats.value.totalBet += bet;

    const playerDice = rollDice(2);
    const npcDice = rollDice(2);
    const playerTotal = playerDice.reduce((a, b) => a + b, 0);
    const npcTotal = npcDice.reduce((a, b) => a + b, 0);

    let result: 'win' | 'lose' | 'tie';
    let winnings = 0;

    if (playerTotal > npcTotal) {
      result = 'win';
      winnings = bet * 2;
      recordWin('dice_duel', winnings);
    } else if (playerTotal < npcTotal) {
      result = 'lose';
      recordLoss('dice_duel');
    } else {
      result = 'tie';
      winnings = bet;
      resourcesStore.addResource('gold', bet);
    }

    if (winnings > 0) {
      resourcesStore.addResource('gold', winnings);
    }

    activeDiceGame.value = { playerDice, npcDice, playerTotal, npcTotal, bet, result };

    gameStore.addNotification({
      type: result === 'win' ? 'success' : result === 'lose' ? 'error' : 'info',
      title: result === 'win' ? 'Wygrałeś!' : result === 'lose' ? 'Przegrałeś!' : 'Remis!',
      message: `Ty: ${playerTotal} vs NPC: ${npcTotal}`,
      icon: 'mdi-dice-multiple',
      duration: 3000,
    });

    return activeDiceGame.value;
  }

  // ============================================
  // BLACKJACK
  // ============================================

  function canPlayBlackjack(bet: number): { canPlay: boolean; reason?: string } {
    const minigame = getMinigame('blackjack')!;
    
    if (isOnCooldown('blackjack')) {
      return { canPlay: false, reason: 'Gra na cooldownie' };
    }
    if (bet < minigame.minBet) {
      return { canPlay: false, reason: `Minimalna stawka: ${minigame.minBet}` };
    }
    if (bet > minigame.maxBet) {
      return { canPlay: false, reason: `Maksymalna stawka: ${minigame.maxBet}` };
    }
    if (resourcesStore.resources.gold < bet) {
      return { canPlay: false, reason: 'Za mało złota' };
    }
    
    return { canPlay: true };
  }

  function startBlackjack(bet: number): boolean {
    const check = canPlayBlackjack(bet);
    if (!check.canPlay) {
      gameStore.addNotification({ type: 'warning', title: 'Nie można grać', message: check.reason || '', icon: 'mdi-alert' });
      return false;
    }

    resourcesStore.addResource('gold', -bet);
    stats.value.totalBet += bet;

    const deck = createDeck();
    const playerHand = [
      { ...deck.pop()!, faceUp: true },
      { ...deck.pop()!, faceUp: true },
    ];
    const dealerHand = [
      { ...deck.pop()!, faceUp: true },
      { ...deck.pop()!, faceUp: false },
    ];

    activeCardGame.value = {
      playerHand,
      dealerHand,
      deck,
      bet,
      playerScore: calculateHandScore(playerHand),
      dealerScore: calculateHandScore([dealerHand[0]]),
      phase: 'playing',
      result: null,
    };

    // Check for immediate blackjack
    if (activeCardGame.value.playerScore === 21) {
      finishBlackjack();
    }

    return true;
  }

  function blackjackHit() {
    if (!activeCardGame.value || activeCardGame.value.phase !== 'playing') return;

    const card = activeCardGame.value.deck.pop()!;
    card.faceUp = true;
    activeCardGame.value.playerHand.push(card);
    activeCardGame.value.playerScore = calculateHandScore(activeCardGame.value.playerHand);

    if (activeCardGame.value.playerScore > 21) {
      // Bust
      activeCardGame.value.result = 'lose';
      activeCardGame.value.phase = 'result';
      recordLoss('blackjack');
      setCooldown('blackjack');
      
      gameStore.addNotification({
        type: 'error',
        title: 'Przebicie!',
        message: `${activeCardGame.value.playerScore} punktów - przegrałeś!`,
        icon: 'mdi-cards-playing',
        duration: 3000,
      });
    } else if (activeCardGame.value.playerScore === 21) {
      blackjackStand();
    }
  }

  function blackjackStand() {
    if (!activeCardGame.value || activeCardGame.value.phase !== 'playing') return;

    activeCardGame.value.phase = 'dealer';
    
    // Reveal dealer's card
    activeCardGame.value.dealerHand[1].faceUp = true;
    activeCardGame.value.dealerScore = calculateHandScore(activeCardGame.value.dealerHand);

    // Dealer draws until 17+
    while (activeCardGame.value.dealerScore < 17) {
      const card = activeCardGame.value.deck.pop()!;
      card.faceUp = true;
      activeCardGame.value.dealerHand.push(card);
      activeCardGame.value.dealerScore = calculateHandScore(activeCardGame.value.dealerHand);
    }

    finishBlackjack();
  }

  function finishBlackjack() {
    if (!activeCardGame.value) return;

    const playerScore = activeCardGame.value.playerScore;
    const dealerScore = activeCardGame.value.dealerScore;
    const bet = activeCardGame.value.bet;
    let winnings = 0;

    // Check for blackjack (21 with 2 cards)
    const playerBlackjack = playerScore === 21 && activeCardGame.value.playerHand.length === 2;
    const dealerBlackjack = dealerScore === 21 && activeCardGame.value.dealerHand.length === 2;

    if (playerBlackjack && !dealerBlackjack) {
      activeCardGame.value.result = 'blackjack';
      winnings = Math.floor(bet * 2.5);
    } else if (dealerScore > 21) {
      activeCardGame.value.result = 'win';
      winnings = bet * 2;
    } else if (playerScore > dealerScore) {
      activeCardGame.value.result = 'win';
      winnings = bet * 2;
    } else if (playerScore < dealerScore) {
      activeCardGame.value.result = 'lose';
    } else {
      activeCardGame.value.result = 'tie';
      winnings = bet;
    }

    activeCardGame.value.phase = 'result';

    if (winnings > 0) {
      resourcesStore.addResource('gold', winnings);
      if (activeCardGame.value.result !== 'tie') {
        recordWin('blackjack', winnings);
      }
    } else {
      recordLoss('blackjack');
    }

    setCooldown('blackjack');

    const resultMessages = {
      blackjack: 'BLACKJACK! 🎉',
      win: 'Wygrałeś!',
      lose: 'Przegrałeś!',
      tie: 'Remis!',
    };

    gameStore.addNotification({
      type: activeCardGame.value.result === 'lose' ? 'error' : activeCardGame.value.result === 'tie' ? 'info' : 'success',
      title: resultMessages[activeCardGame.value.result!],
      message: `Ty: ${playerScore} vs Krupier: ${dealerScore}`,
      icon: 'mdi-cards-playing',
      duration: 4000,
    });
  }

  // ============================================
  // SLOTS
  // ============================================

  function canPlaySlots(bet: number): { canPlay: boolean; reason?: string } {
    const minigame = getMinigame('slots')!;
    
    if (bet < minigame.minBet) {
      return { canPlay: false, reason: `Minimalna stawka: ${minigame.minBet}` };
    }
    if (bet > minigame.maxBet) {
      return { canPlay: false, reason: `Maksymalna stawka: ${minigame.maxBet}` };
    }
    if (resourcesStore.resources.gold < bet) {
      return { canPlay: false, reason: 'Za mało złota' };
    }
    
    return { canPlay: true };
  }

  function playSlots(bet: number): SlotsGame | null {
    const check = canPlaySlots(bet);
    if (!check.canPlay) {
      gameStore.addNotification({ type: 'warning', title: 'Nie można grać', message: check.reason || '', icon: 'mdi-alert' });
      return null;
    }

    resourcesStore.addResource('gold', -bet);
    stats.value.totalBet += bet;

    const spin = spinSlots();
    const result = checkSlotsResult(spin);
    let winnings = 0;

    if (result.win) {
      winnings = Math.floor(bet * result.multiplier);
      resourcesStore.addResource('gold', winnings);
      recordWin('slots', winnings);
    } else {
      recordLoss('slots');
    }

    activeSlotsGame.value = {
      reels: [SLOT_SYMBOLS.map(s => s.icon), SLOT_SYMBOLS.map(s => s.icon), SLOT_SYMBOLS.map(s => s.icon)],
      currentSpin: spin,
      bet,
      result: result.win ? (result.multiplier >= 10 ? 'jackpot' : result.multiplier >= 5 ? 'bigwin' : 'win') : 'lose',
      multiplier: result.multiplier,
    };

    gameStore.addNotification({
      type: result.win ? 'success' : 'info',
      title: result.type,
      message: result.win ? `Wygrana: ${winnings}g (x${result.multiplier})` : 'Spróbuj ponownie!',
      icon: 'mdi-slot-machine',
      duration: 3000,
    });

    return activeSlotsGame.value;
  }

  // ============================================
  // PUZZLE
  // ============================================

  function startPuzzle(difficulty: Difficulty = 'normal'): boolean {
    const { grid, emptyPos } = createPuzzleGrid(difficulty);
    
    activePuzzleGame.value = {
      grid,
      emptyPos,
      moves: 0,
      solved: false,
      difficulty,
      timeLimit: difficulty === 'easy' ? 180 : difficulty === 'normal' ? 120 : 60,
    };

    return true;
  }

  function movePuzzleTile(x: number, y: number) {
    if (!activePuzzleGame.value || activePuzzleGame.value.solved) return;

    const { emptyPos, grid } = activePuzzleGame.value;
    const dx = Math.abs(x - emptyPos.x);
    const dy = Math.abs(y - emptyPos.y);

    if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
      // Valid move
      grid[emptyPos.y][emptyPos.x] = grid[y][x];
      grid[y][x] = 0;
      activePuzzleGame.value.emptyPos = { x, y };
      activePuzzleGame.value.moves++;

      if (isPuzzleSolved(grid)) {
        activePuzzleGame.value.solved = true;
        const reward = Math.max(50, 200 - activePuzzleGame.value.moves * 2);
        resourcesStore.addResource('gold', reward);
        recordWin('puzzle_15', reward);

        gameStore.addNotification({
          type: 'success',
          title: 'Puzzle ukończone!',
          message: `${activePuzzleGame.value.moves} ruchów - Nagroda: ${reward}g`,
          icon: 'mdi-puzzle',
          duration: 4000,
        });
      }
    }
  }

  // ============================================
  // MEMORY
  // ============================================

  function startMemory(difficulty: Difficulty = 'normal'): boolean {
    activeMemoryGame.value = {
      cards: createMemoryBoard(difficulty),
      flippedCards: [],
      matches: 0,
      attempts: 0,
      difficulty,
    };

    return true;
  }

  function flipMemoryCard(cardId: number) {
    if (!activeMemoryGame.value) return;
    if (activeMemoryGame.value.flippedCards.length >= 2) return;

    const card = activeMemoryGame.value.cards.find(c => c.id === cardId);
    if (!card || card.flipped || card.matched) return;

    card.flipped = true;
    activeMemoryGame.value.flippedCards.push(cardId);

    if (activeMemoryGame.value.flippedCards.length === 2) {
      activeMemoryGame.value.attempts++;
      
      const [id1, id2] = activeMemoryGame.value.flippedCards;
      const card1 = activeMemoryGame.value.cards.find(c => c.id === id1)!;
      const card2 = activeMemoryGame.value.cards.find(c => c.id === id2)!;

      if (card1.symbol === card2.symbol) {
        // Match!
        card1.matched = true;
        card2.matched = true;
        activeMemoryGame.value.matches++;
        activeMemoryGame.value.flippedCards = [];

        // Check if all matched
        const totalPairs = activeMemoryGame.value.cards.length / 2;
        if (activeMemoryGame.value.matches === totalPairs) {
          const reward = Math.max(25, 100 - activeMemoryGame.value.attempts * 2);
          resourcesStore.addResource('gold', reward);
          recordWin('memory_match', reward);

          gameStore.addNotification({
            type: 'success',
            title: 'Memory ukończone!',
            message: `${activeMemoryGame.value.attempts} prób - Nagroda: ${reward}g`,
            icon: 'mdi-cards',
            duration: 4000,
          });
        }
      } else {
        // No match - flip back after delay
        setTimeout(() => {
          if (activeMemoryGame.value) {
            card1.flipped = false;
            card2.flipped = false;
            activeMemoryGame.value.flippedCards = [];
          }
        }, 1000);
      }
    }
  }

  // ============================================
  // HELPERS
  // ============================================

  function recordWin(gameId: string, winnings: number) {
    stats.value.gamesPlayed++;
    stats.value.gamesWon++;
    stats.value.totalWon += winnings;
    stats.value.currentStreak++;
    
    if (stats.value.currentStreak > stats.value.bestStreak) {
      stats.value.bestStreak = stats.value.currentStreak;
    }
    if (winnings > stats.value.biggestWin) {
      stats.value.biggestWin = winnings;
    }

    if (!stats.value.byGame[gameId]) {
      stats.value.byGame[gameId] = { played: 0, won: 0 };
    }
    stats.value.byGame[gameId].played++;
    stats.value.byGame[gameId].won++;
  }

  function recordLoss(gameId: string) {
    stats.value.gamesPlayed++;
    stats.value.currentStreak = 0;

    if (!stats.value.byGame[gameId]) {
      stats.value.byGame[gameId] = { played: 0, won: 0 };
    }
    stats.value.byGame[gameId].played++;
  }

  function isOnCooldown(gameId: string): boolean {
    const cooldownEnd = cooldowns.value.get(gameId);
    if (!cooldownEnd) return false;
    return Date.now() < cooldownEnd;
  }

  function getCooldownRemaining(gameId: string): number {
    const cooldownEnd = cooldowns.value.get(gameId);
    if (!cooldownEnd) return 0;
    return Math.max(0, cooldownEnd - Date.now());
  }

  function setCooldown(gameId: string) {
    const minigame = getMinigame(gameId);
    if (minigame && minigame.cooldownMinutes > 0) {
      cooldowns.value.set(gameId, Date.now() + minigame.cooldownMinutes * 60 * 1000);
    }
  }

  function clearGame(type: string) {
    switch (type) {
      case 'dice': activeDiceGame.value = null; break;
      case 'cards': activeCardGame.value = null; break;
      case 'slots': activeSlotsGame.value = null; break;
      case 'puzzle': activePuzzleGame.value = null; break;
      case 'memory': activeMemoryGame.value = null; break;
    }
  }

  // ============================================
  // SAVE/LOAD
  // ============================================

  function resetMinigames() {
    activeDiceGame.value = null;
    activeCardGame.value = null;
    activeSlotsGame.value = null;
    activePuzzleGame.value = null;
    activeMemoryGame.value = null;
    cooldowns.value = new Map();
    stats.value = {
      gamesPlayed: 0,
      gamesWon: 0,
      totalBet: 0,
      totalWon: 0,
      biggestWin: 0,
      currentStreak: 0,
      bestStreak: 0,
      byGame: {},
    };
  }

  return {
    // State
    activeDiceGame, activeCardGame, activeSlotsGame, activePuzzleGame, activeMemoryGame,
    cooldowns, stats,

    // Computed
    winRate, netProfit,

    // Dice
    canPlayDice, playDice,

    // Blackjack
    canPlayBlackjack, startBlackjack, blackjackHit, blackjackStand,

    // Slots
    canPlaySlots, playSlots,

    // Puzzle
    startPuzzle, movePuzzleTile,

    // Memory
    startMemory, flipMemoryCard,

    // Helpers
    isOnCooldown, getCooldownRemaining, clearGame,
    resetMinigames,
  };
}, {
  persist: {
    key: 'ateria-minigames',
    serializer: {
      serialize: (state) => JSON.stringify({
        stats: state.stats,
        cooldowns: Array.from(state.cooldowns?.entries?.() || []),
      }),
      deserialize: (value) => {
        const p = JSON.parse(value);
        return {
          ...p,
          cooldowns: new Map(p.cooldowns || []),
          activeDiceGame: null,
          activeCardGame: null,
          activeSlotsGame: null,
          activePuzzleGame: null,
          activeMemoryGame: null,
        };
      },
    },
  },
});
