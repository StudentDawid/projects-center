/**
 * Bard Store - Songs, Performances, Fame
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAteriaGameStore } from '../../core/model/game.store';
import { useAteriaResourcesStore } from '../../core/model/resources.store';
import {
  SONGS,
  INSTRUMENTS,
  VENUES,
  GENRES,
  PERFORMANCE_QUALITY,
  getSong,
  getInstrument,
  getVenue,
  getAvailableSongs,
  getAvailableVenues,
  calculateBardXpToLevel,
  calculatePerformanceQuality,
  type Song,
  type Instrument,
  type Venue,
  type SongBuff,
  type Performance,
  type BardProgress,
  type SongGenre,
} from '../data/bard.data';

// ============================================
// TYPES
// ============================================

export interface ActivePerformance {
  songId: string;
  venueId: string;
  startTime: number;
  ticksRemaining: number;
  totalTicks: number;
}

export interface ActiveSongBuff {
  songId: string;
  effects: SongBuff[];
  quality: string;
  expiresAt: number;
}

// ============================================
// STORE
// ============================================

export const useAteriaBardStore = defineStore('ateria-bard', () => {
  const gameStore = useAteriaGameStore();
  const resourcesStore = useAteriaResourcesStore();

  // ============================================
  // STATE
  // ============================================

  const progress = ref<BardProgress>({
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    totalXp: 0,
  });

  // Reputation (fame)
  const reputation = ref(0);

  // Instruments
  const ownedInstruments = ref<Set<string>>(new Set(['voice']));
  const equippedInstrument = ref<string>('voice');

  // Songs learned
  const learnedSongs = ref<Set<string>>(new Set(['lovers_lament', 'village_dance']));

  // Performance
  const activePerformance = ref<ActivePerformance | null>(null);
  const performanceHistory = ref<Performance[]>([]);

  // Active buffs
  const activeBuffs = ref<ActiveSongBuff[]>([]);

  // Stats
  const totalPerformances = ref(0);
  const totalTipsEarned = ref(0);
  const legendaryPerformances = ref(0);

  // ============================================
  // COMPUTED
  // ============================================

  const isPerforming = computed(() => activePerformance.value !== null);

  const performanceProgress = computed(() => {
    if (!activePerformance.value) return 0;
    const total = activePerformance.value.totalTicks;
    const remaining = activePerformance.value.ticksRemaining;
    return ((total - remaining) / total) * 100;
  });

  const currentInstrument = computed(() => {
    return getInstrument(equippedInstrument.value);
  });

  const availableSongs = computed(() => {
    return getAvailableSongs(progress.value.level, ownedInstruments.value)
      .filter(s => learnedSongs.value.has(s.id));
  });

  const availableVenues = computed(() => {
    return getAvailableVenues(progress.value.level, reputation.value);
  });

  const totalBuffEffects = computed(() => {
    const effects: Record<string, number> = {};
    for (const buff of activeBuffs.value) {
      const qualityMult = PERFORMANCE_QUALITY[buff.quality]?.multiplier || 1;
      for (const effect of buff.effects) {
        effects[effect.type] = (effects[effect.type] || 0) + Math.floor(effect.value * qualityMult);
      }
    }
    return effects;
  });

  // ============================================
  // ACTIONS - XP & LEVELING
  // ============================================

  function addXp(amount: number) {
    progress.value.xp += amount;
    progress.value.totalXp += amount;

    while (progress.value.xp >= progress.value.xpToNextLevel) {
      progress.value.xp -= progress.value.xpToNextLevel;
      progress.value.level++;
      progress.value.xpToNextLevel = calculateBardXpToLevel(progress.value.level);

      // Unlock songs at certain levels
      unlockSongsForLevel(progress.value.level);

      gameStore.addNotification({
        type: 'success',
        title: `Bard - Poziom ${progress.value.level}!`,
        message: 'Nowe pieśni dostępne!',
        icon: 'mdi-music',
        duration: 3000,
      });
    }
  }

  function unlockSongsForLevel(level: number) {
    const songsToUnlock = Object.values(SONGS).filter(s => s.requiredLevel === level);
    for (const song of songsToUnlock) {
      // Auto-learn basic songs
      if (song.tier <= 2) {
        learnedSongs.value.add(song.id);
      }
    }
  }

  function getXpProgress(): number {
    return (progress.value.xp / progress.value.xpToNextLevel) * 100;
  }

  // ============================================
  // ACTIONS - INSTRUMENTS
  // ============================================

  function buyInstrument(instrumentId: string): boolean {
    const instrument = getInstrument(instrumentId);
    if (!instrument) return false;
    if (ownedInstruments.value.has(instrumentId)) return false;
    if (instrument.requiredLevel > progress.value.level) return false;
    if (!resourcesStore.hasAmount('gold', instrument.cost)) return false;

    resourcesStore.removeResource('gold', instrument.cost);
    ownedInstruments.value.add(instrumentId);

    gameStore.addNotification({
      type: 'success',
      title: 'Kupiono instrument!',
      message: instrument.name,
      icon: instrument.icon,
      duration: 2000,
    });

    return true;
  }

  function equipInstrument(instrumentId: string): boolean {
    if (!ownedInstruments.value.has(instrumentId)) return false;
    equippedInstrument.value = instrumentId;
    return true;
  }

  // ============================================
  // ACTIONS - SONGS
  // ============================================

  function learnSong(songId: string): boolean {
    const song = getSong(songId);
    if (!song) return false;
    if (learnedSongs.value.has(songId)) return false;
    if (song.requiredLevel > progress.value.level) return false;

    // Learning cost based on tier
    const cost = song.tier * 100;
    if (!resourcesStore.hasAmount('gold', cost)) return false;

    resourcesStore.removeResource('gold', cost);
    learnedSongs.value.add(songId);

    gameStore.addNotification({
      type: 'success',
      title: 'Pieśń nauczona!',
      message: song.name,
      icon: song.icon,
      duration: 2000,
    });

    return true;
  }

  // ============================================
  // ACTIONS - PERFORMANCE
  // ============================================

  function canPerform(songId: string, venueId: string): { canPerform: boolean; reason?: string } {
    const song = getSong(songId);
    const venue = getVenue(venueId);

    if (!song || !venue) {
      return { canPerform: false, reason: 'Nieznana pieśń lub miejsce' };
    }

    if (isPerforming.value) {
      return { canPerform: false, reason: 'Już występujesz' };
    }

    if (!learnedSongs.value.has(songId)) {
      return { canPerform: false, reason: 'Pieśń nie jest nauczona' };
    }

    if (song.instrumentRequired && !ownedInstruments.value.has(song.instrumentRequired)) {
      return { canPerform: false, reason: `Wymaga: ${INSTRUMENTS[song.instrumentRequired]?.name}` };
    }

    if (venue.requiredLevel > progress.value.level) {
      return { canPerform: false, reason: `Wymaga poziomu ${venue.requiredLevel}` };
    }

    if (venue.requiredReputation > reputation.value) {
      return { canPerform: false, reason: `Wymaga ${venue.requiredReputation} reputacji` };
    }

    return { canPerform: true };
  }

  function startPerformance(songId: string, venueId: string): boolean {
    const check = canPerform(songId, venueId);
    if (!check.canPerform) {
      gameStore.addNotification({
        type: 'warning',
        title: 'Nie można występować',
        message: check.reason || 'Nieznany błąd',
        icon: 'mdi-alert',
      });
      return false;
    }

    const song = getSong(songId)!;

    activePerformance.value = {
      songId,
      venueId,
      startTime: Date.now(),
      ticksRemaining: song.duration,
      totalTicks: song.duration,
    };

    return true;
  }

  function cancelPerformance() {
    activePerformance.value = null;
  }

  function completePerformance() {
    if (!activePerformance.value) return;

    const song = getSong(activePerformance.value.songId);
    const venue = getVenue(activePerformance.value.venueId);
    if (!song || !venue) {
      activePerformance.value = null;
      return;
    }

    const instrument = currentInstrument.value;

    // Calculate performance quality
    const genreMatch = venue.preferredGenres.includes(song.genre);
    const instrumentBonus = instrument?.genreBonus === song.genre;
    const quality = calculatePerformanceQuality(
      song.difficulty,
      progress.value.level,
      instrument?.quality || 0,
      genreMatch || instrumentBonus
    );
    const qualityData = PERFORMANCE_QUALITY[quality];

    // Calculate tips
    let tips = song.baseTips * venue.tipMultiplier * qualityData.multiplier;
    tips = Math.floor(tips * (1 + venue.audienceSize / 100));
    if (genreMatch) tips = Math.floor(tips * 1.2);

    // Rewards
    resourcesStore.addResource('gold', tips);
    totalTipsEarned.value += tips;
    addXp(Math.floor(song.xpReward * qualityData.multiplier));

    // Reputation
    const repGain = Math.floor(venue.reputationGain * qualityData.multiplier);
    reputation.value += repGain;

    // Apply song buffs
    if (song.buffEffects) {
      const buff: ActiveSongBuff = {
        songId: song.id,
        effects: song.buffEffects,
        quality,
        expiresAt: Date.now() + (song.buffDuration || 600) * 100,
      };
      activeBuffs.value = activeBuffs.value.filter(b => b.songId !== song.id);
      activeBuffs.value.push(buff);
    }

    // Record performance
    const performance: Performance = {
      songId: song.id,
      venueId: venue.id,
      quality: quality as Performance['quality'],
      tipsEarned: tips,
      reputationGained: repGain,
      performedAt: Date.now(),
    };
    performanceHistory.value.unshift(performance);
    if (performanceHistory.value.length > 50) {
      performanceHistory.value = performanceHistory.value.slice(0, 50);
    }

    // Stats
    totalPerformances.value++;
    if (quality === 'legendary') {
      legendaryPerformances.value++;
    }

    gameStore.addNotification({
      type: 'success',
      title: `Występ ${qualityData.label}!`,
      message: `${song.name} w ${venue.name}: +${tips}g, +${repGain} rep`,
      icon: 'mdi-music-note',
      duration: 3000,
    });

    activePerformance.value = null;
  }

  // ============================================
  // ACTIONS - BUFFS
  // ============================================

  function processBuffs() {
    const now = Date.now();
    activeBuffs.value = activeBuffs.value.filter(b => b.expiresAt > now);
  }

  // ============================================
  // ACTIONS - GAME LOOP
  // ============================================

  function processTick() {
    // Performance progress
    if (activePerformance.value) {
      activePerformance.value.ticksRemaining--;
      if (activePerformance.value.ticksRemaining <= 0) {
        completePerformance();
      }
    }

    // Process buffs
    processBuffs();
  }

  // ============================================
  // SAVE/LOAD
  // ============================================

  function getState() {
    return {
      progress: progress.value,
      reputation: reputation.value,
      ownedInstruments: Array.from(ownedInstruments.value),
      equippedInstrument: equippedInstrument.value,
      learnedSongs: Array.from(learnedSongs.value),
      performanceHistory: performanceHistory.value,
      activeBuffs: activeBuffs.value,
      totalPerformances: totalPerformances.value,
      totalTipsEarned: totalTipsEarned.value,
      legendaryPerformances: legendaryPerformances.value,
    };
  }

  function loadState(state: ReturnType<typeof getState>) {
    if (state.progress) progress.value = state.progress;
    if (state.reputation !== undefined) reputation.value = state.reputation;
    if (state.ownedInstruments) ownedInstruments.value = new Set(state.ownedInstruments);
    if (state.equippedInstrument) equippedInstrument.value = state.equippedInstrument;
    if (state.learnedSongs) learnedSongs.value = new Set(state.learnedSongs);
    if (state.performanceHistory) performanceHistory.value = state.performanceHistory;
    if (state.activeBuffs) activeBuffs.value = state.activeBuffs;
    if (state.totalPerformances !== undefined) totalPerformances.value = state.totalPerformances;
    if (state.totalTipsEarned !== undefined) totalTipsEarned.value = state.totalTipsEarned;
    if (state.legendaryPerformances !== undefined) legendaryPerformances.value = state.legendaryPerformances;
  }

  function resetBard() {
    progress.value = { level: 1, xp: 0, xpToNextLevel: 100, totalXp: 0 };
    reputation.value = 0;
    ownedInstruments.value = new Set(['voice']);
    equippedInstrument.value = 'voice';
    learnedSongs.value = new Set(['lovers_lament', 'village_dance']);
    activePerformance.value = null;
    performanceHistory.value = [];
    activeBuffs.value = [];
    totalPerformances.value = 0;
    totalTipsEarned.value = 0;
    legendaryPerformances.value = 0;
  }

  // ============================================
  // DEV HELPERS
  // ============================================

  function devAddXp(amount: number) {
    addXp(amount);
  }

  function devAddReputation(amount: number) {
    reputation.value += amount;
  }

  function devUnlockAll() {
    for (const instrumentId of Object.keys(INSTRUMENTS)) {
      ownedInstruments.value.add(instrumentId);
    }
    for (const songId of Object.keys(SONGS)) {
      learnedSongs.value.add(songId);
    }
  }

  return {
    // State
    progress,
    reputation,
    ownedInstruments,
    equippedInstrument,
    learnedSongs,
    activePerformance,
    performanceHistory,
    activeBuffs,
    totalPerformances,
    totalTipsEarned,
    legendaryPerformances,

    // Computed
    isPerforming,
    performanceProgress,
    currentInstrument,
    availableSongs,
    availableVenues,
    totalBuffEffects,

    // XP
    addXp,
    getXpProgress,

    // Instruments
    buyInstrument,
    equipInstrument,

    // Songs
    learnSong,

    // Performance
    canPerform,
    startPerformance,
    cancelPerformance,

    // Game Loop
    processTick,

    // Save/Load
    getState,
    loadState,
    resetBard,

    // Dev
    devAddXp,
    devAddReputation,
    devUnlockAll,
  };
}, {
  persist: {
    key: 'ateria-bard',
    serializer: {
      serialize: (state) => {
        return JSON.stringify({
          ...state,
          ownedInstruments: Array.from(state.ownedInstruments || []),
          learnedSongs: Array.from(state.learnedSongs || []),
        });
      },
      deserialize: (value) => {
        const parsed = JSON.parse(value);
        return {
          ...parsed,
          ownedInstruments: new Set(parsed.ownedInstruments || []),
          learnedSongs: new Set(parsed.learnedSongs || []),
        };
      },
    },
  },
});
