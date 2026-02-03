/**
 * Mystic Store - Meditation, Prophecies, Rituals, Tarot
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAteriaGameStore } from '../../core/model/game.store';
import { useAteriaResourcesStore } from '../../core/model/resources.store';
import {
  MEDITATION_LEVELS,
  TRANCE_EFFECTS,
  PROPHECIES,
  RITUALS,
  MAJOR_ARCANA,
  getMeditationLevel,
  getNextMeditationLevel,
  getProphecy,
  getRitual,
  getAvailableProphecies,
  getAvailableRituals,
  calculateMysticXpToLevel,
  getRandomTarotCard,
  getTarotBonus,
  type MeditationState,
  type TranceType,
  type ProphecyType,
  type MysticProgress,
  type ActiveProphecy,
  type ActiveRitual,
  type ActiveRitualEffect,
  type TarotCard,
  type TarotBonus,
  type TranceEffect,
} from '../data/mystic.data';

// ============================================
// TYPES
// ============================================

export interface DailyTarot {
  card: TarotCard;
  reversed: boolean;
  bonus: TarotBonus;
  drawnAt: number; // Timestamp
}

export interface ActiveTrance {
  type: TranceType;
  startedAt: number;
  ticksRemaining: number;
  effects: TranceEffect;
}

// ============================================
// STORE
// ============================================

export const useAteriaMysticStore = defineStore('ateria-mystic', () => {
  const gameStore = useAteriaGameStore();
  const resourcesStore = useAteriaResourcesStore();

  // ============================================
  // STATE
  // ============================================

  // Mystic progression
  const progress = ref<MysticProgress>({
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    totalXp: 0,
    mana: 0,
    maxMana: 100,
    enlightenment: 0,
  });

  // Meditation state
  const meditationState = ref<MeditationState>('idle');
  const meditationXp = ref(0); // XP specifically for meditation
  const meditationTicks = ref(0);
  const activeTrance = ref<ActiveTrance | null>(null);

  // Prophecies
  const activeProphecies = ref<ActiveProphecy[]>([]);
  const prophecyCooldowns = ref<Map<string, number>>(new Map());
  const fulfilledProphecies = ref(0);
  const totalProphecies = ref(0);

  // Rituals
  const activeRitual = ref<ActiveRitual | null>(null);
  const activeRitualEffects = ref<ActiveRitualEffect[]>([]);
  const ritualCooldowns = ref<Map<string, number>>(new Map());
  const ritualsCompleted = ref(0);

  // Tarot
  const dailyTarot = ref<DailyTarot | null>(null);
  const collectedCards = ref<Set<string>>(new Set());
  const tarotDrawsTotal = ref(0);

  // Stats
  const totalManaGenerated = ref(0);
  const totalEnlightenmentGained = ref(0);
  const trancesEntered = ref(0);

  // ============================================
  // COMPUTED
  // ============================================

  const currentMeditationLevel = computed(() => getMeditationLevel(meditationXp.value));
  
  const nextMeditationLevel = computed(() => getNextMeditationLevel(currentMeditationLevel.value.level));

  const meditationProgress = computed(() => {
    const current = currentMeditationLevel.value;
    const next = nextMeditationLevel.value;
    if (!next) return 100;
    
    const xpInLevel = meditationXp.value - current.requiredXp;
    const xpNeeded = next.requiredXp - current.requiredXp;
    return (xpInLevel / xpNeeded) * 100;
  });

  const isMeditating = computed(() => meditationState.value === 'meditating' || meditationState.value === 'trance');

  const isInTrance = computed(() => activeTrance.value !== null);

  const isCastingRitual = computed(() => activeRitual.value !== null);

  const ritualProgress = computed(() => {
    if (!activeRitual.value) return 0;
    const total = activeRitual.value.totalTicks;
    const remaining = activeRitual.value.ticksRemaining;
    return ((total - remaining) / total) * 100;
  });

  const availablePropheciesList = computed(() => getAvailableProphecies(progress.value.level));

  const availableRitualsList = computed(() => getAvailableRituals(progress.value.level));

  const canDrawTarot = computed(() => {
    if (!dailyTarot.value) return true;
    
    // Check if drawn today
    const lastDraw = new Date(dailyTarot.value.drawnAt);
    const now = new Date();
    return lastDraw.toDateString() !== now.toDateString();
  });

  const manaPercent = computed(() => (progress.value.mana / progress.value.maxMana) * 100);

  const totalActiveBonuses = computed(() => {
    const bonuses: Record<string, number> = {};

    // Daily tarot bonus
    if (dailyTarot.value) {
      const bonus = dailyTarot.value.bonus;
      bonuses[bonus.type] = (bonuses[bonus.type] || 0) + bonus.value;
    }

    // Trance bonuses
    if (activeTrance.value) {
      for (const effect of activeTrance.value.effects.effects) {
        bonuses[effect.type] = (bonuses[effect.type] || 0) + effect.value;
      }
    }

    // Ritual effect bonuses
    for (const ritualEffect of activeRitualEffects.value) {
      for (const effect of ritualEffect.effects) {
        bonuses[effect.type] = (bonuses[effect.type] || 0) + effect.value;
      }
    }

    return bonuses;
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
      progress.value.xpToNextLevel = calculateMysticXpToLevel(progress.value.level);

      // Increase max mana
      progress.value.maxMana = 100 + progress.value.level * 20;

      gameStore.addNotification({
        type: 'success',
        title: `Mistyk - Poziom ${progress.value.level}!`,
        message: 'Nowe przepowiednie i rytuały dostępne!',
        icon: 'mdi-crystal-ball',
        duration: 3000,
      });
    }
  }

  function addMeditationXp(amount: number) {
    meditationXp.value += amount;
  }

  function getXpProgress(): number {
    return (progress.value.xp / progress.value.xpToNextLevel) * 100;
  }

  // ============================================
  // ACTIONS - MANA & ENLIGHTENMENT
  // ============================================

  function addMana(amount: number) {
    progress.value.mana = Math.min(progress.value.maxMana, progress.value.mana + amount);
    totalManaGenerated.value += amount;
  }

  function spendMana(amount: number): boolean {
    if (progress.value.mana < amount) return false;
    progress.value.mana -= amount;
    return true;
  }

  function addEnlightenment(amount: number) {
    progress.value.enlightenment += amount;
    totalEnlightenmentGained.value += amount;
  }

  function spendEnlightenment(amount: number): boolean {
    if (progress.value.enlightenment < amount) return false;
    progress.value.enlightenment -= amount;
    return true;
  }

  // ============================================
  // ACTIONS - MEDITATION
  // ============================================

  function startMeditation() {
    if (isMeditating.value) return;
    meditationState.value = 'meditating';
    meditationTicks.value = 0;
  }

  function stopMeditation() {
    meditationState.value = 'idle';
    meditationTicks.value = 0;
    activeTrance.value = null;
  }

  function processMeditationTick() {
    if (!isMeditating.value) return;

    const level = currentMeditationLevel.value;
    meditationTicks.value++;

    // Generate mana
    addMana(level.manaPerTick);

    // Generate enlightenment
    addEnlightenment(level.enlightenmentPerTick);

    // Meditation XP
    addMeditationXp(0.1);

    // Mystic XP
    if (meditationTicks.value % 10 === 0) {
      addXp(1);
    }

    // Trance check (every second)
    if (meditationTicks.value % 10 === 0 && !isInTrance.value) {
      const tranceRoll = Math.random() * 100;
      if (tranceRoll < level.tranceChance) {
        enterTrance();
      }
    }

    // Process active trance
    if (activeTrance.value) {
      activeTrance.value.ticksRemaining--;
      if (activeTrance.value.ticksRemaining <= 0) {
        exitTrance();
      }
    }
  }

  function enterTrance() {
    const tranceTypes: TranceType[] = ['calm', 'vision', 'spirit', 'void'];
    const randomType = tranceTypes[Math.floor(Math.random() * tranceTypes.length)];
    const tranceEffect = TRANCE_EFFECTS[randomType];

    activeTrance.value = {
      type: randomType,
      startedAt: Date.now(),
      ticksRemaining: tranceEffect.duration,
      effects: tranceEffect,
    };

    meditationState.value = 'trance';
    trancesEntered.value++;

    gameStore.addNotification({
      type: 'info',
      title: 'Trans!',
      message: `Wszedłeś w ${tranceEffect.name}`,
      icon: tranceEffect.icon,
      duration: 3000,
    });
  }

  function exitTrance() {
    if (activeTrance.value) {
      gameStore.addNotification({
        type: 'info',
        title: 'Koniec Transu',
        message: `${activeTrance.value.effects.name} zakończył się.`,
        icon: 'mdi-meditation',
        duration: 2000,
      });
    }
    activeTrance.value = null;
    meditationState.value = 'meditating';
  }

  // ============================================
  // ACTIONS - PROPHECIES
  // ============================================

  function canCastProphecy(prophecyId: string): { canCast: boolean; reason?: string } {
    const prophecy = getProphecy(prophecyId);
    if (!prophecy) return { canCast: false, reason: 'Nieznana przepowiednia' };

    if (prophecy.requiredLevel > progress.value.level) {
      return { canCast: false, reason: `Wymaga poziomu ${prophecy.requiredLevel}` };
    }

    if (progress.value.mana < prophecy.manaCost) {
      return { canCast: false, reason: `Brak many (${prophecy.manaCost})` };
    }

    if (progress.value.enlightenment < prophecy.enlightenmentCost) {
      return { canCast: false, reason: `Brak oświecenia (${prophecy.enlightenmentCost})` };
    }

    const cooldownEnd = prophecyCooldowns.value.get(prophecyId);
    if (cooldownEnd && cooldownEnd > Date.now()) {
      const remaining = Math.ceil((cooldownEnd - Date.now()) / 1000);
      return { canCast: false, reason: `Cooldown: ${remaining}s` };
    }

    return { canCast: true };
  }

  function castProphecy(prophecyId: string): boolean {
    const check = canCastProphecy(prophecyId);
    if (!check.canCast) {
      gameStore.addNotification({
        type: 'warning',
        title: 'Nie można rzucić przepowiedni',
        message: check.reason || 'Nieznany błąd',
        icon: 'mdi-alert',
      });
      return false;
    }

    const prophecy = getProphecy(prophecyId)!;

    // Spend resources
    spendMana(prophecy.manaCost);
    spendEnlightenment(prophecy.enlightenmentCost);

    // Calculate accuracy with bonuses
    let accuracy = prophecy.baseAccuracy;
    if (totalActiveBonuses.value.prophecy_accuracy) {
      accuracy += totalActiveBonuses.value.prophecy_accuracy;
    }
    accuracy = Math.min(95, accuracy);

    // Generate prediction
    const prediction = generatePrediction(prophecy);

    // Create active prophecy
    const activeProphecy: ActiveProphecy = {
      prophecyId,
      startTime: Date.now(),
      expiresAt: Date.now() + prophecy.duration * 100,
      prediction,
      accuracy,
      fulfilled: false,
    };

    activeProphecies.value.push(activeProphecy);
    totalProphecies.value++;

    // Set cooldown
    prophecyCooldowns.value.set(prophecyId, Date.now() + prophecy.cooldown * 100);

    // XP
    addXp(prophecy.manaCost / 5);

    gameStore.addNotification({
      type: 'success',
      title: 'Przepowiednia!',
      message: `${prophecy.name} - ${prediction.message}`,
      icon: prophecy.icon,
      duration: 4000,
    });

    return true;
  }

  function generatePrediction(prophecy: any): any {
    // Generate prediction based on prophecy type
    // This is simplified - in full implementation, would connect to other stores
    const predictions: Record<ProphecyType, () => any> = {
      market: () => ({
        type: 'price_change',
        item: 'iron_ore',
        direction: Math.random() > 0.5 ? 'up' : 'down',
        message: 'Ceny surowców zmienią się wkrótce',
      }),
      weather: () => ({
        type: 'season_hint',
        nextSeason: ['spring', 'summer', 'autumn', 'winter'][Math.floor(Math.random() * 4)],
        message: 'Widzę zmianę pór roku...',
      }),
      combat: () => ({
        type: 'weakness',
        element: ['fire', 'ice', 'lightning'][Math.floor(Math.random() * 3)],
        message: 'Następny boss będzie słaby na pewien żywioł',
      }),
      danger: () => ({
        type: 'ambush',
        route: Math.floor(Math.random() * 5),
        message: 'Wyczuwam niebezpieczeństwo na szlakach',
      }),
      political: () => ({
        type: 'faction_shift',
        faction: 'kingdom_of_ateria',
        message: 'Polityczne wiatry zmienią kierunek',
      }),
      discovery: () => ({
        type: 'research_hint',
        area: 'alchemy',
        message: 'Odkrycie czeka w dziedzinie alchemii',
      }),
    };

    return predictions[prophecy.type as ProphecyType]();
  }

  function processProphecies() {
    const now = Date.now();
    
    // Remove expired prophecies
    activeProphecies.value = activeProphecies.value.filter(p => {
      if (p.expiresAt <= now) {
        // Check if fulfilled (simplified)
        const fulfilled = Math.random() * 100 < p.accuracy;
        if (fulfilled) {
          fulfilledProphecies.value++;
          addXp(20);
        }
        return false;
      }
      return true;
    });

    // Clean up cooldowns
    for (const [id, cooldownEnd] of prophecyCooldowns.value) {
      if (cooldownEnd <= now) {
        prophecyCooldowns.value.delete(id);
      }
    }
  }

  // ============================================
  // ACTIONS - RITUALS
  // ============================================

  function canStartRitual(ritualId: string): { canStart: boolean; reason?: string } {
    const ritual = getRitual(ritualId);
    if (!ritual) return { canStart: false, reason: 'Nieznany rytuał' };

    if (isCastingRitual.value) {
      return { canStart: false, reason: 'Już odprawiasz rytuał' };
    }

    if (ritual.requiredLevel > progress.value.level) {
      return { canStart: false, reason: `Wymaga poziomu ${ritual.requiredLevel}` };
    }

    if (progress.value.mana < ritual.manaCost) {
      return { canStart: false, reason: `Brak many (${ritual.manaCost})` };
    }

    if (progress.value.enlightenment < ritual.enlightenmentCost) {
      return { canStart: false, reason: `Brak oświecenia (${ritual.enlightenmentCost})` };
    }

    const cooldownEnd = ritualCooldowns.value.get(ritualId);
    if (cooldownEnd && cooldownEnd > Date.now()) {
      const remaining = Math.ceil((cooldownEnd - Date.now()) / 60000);
      return { canStart: false, reason: `Cooldown: ${remaining} min` };
    }

    // Check ingredients (simplified - would check inventory)
    // For now, just check gold cost equivalent
    const goldCost = ritual.ingredients.reduce((sum, ing) => sum + ing.amount * 50, 0);
    if (!resourcesStore.hasAmount('gold', goldCost)) {
      return { canStart: false, reason: `Brak składników (≈${goldCost}g)` };
    }

    return { canStart: true };
  }

  function startRitual(ritualId: string): boolean {
    const check = canStartRitual(ritualId);
    if (!check.canStart) {
      gameStore.addNotification({
        type: 'warning',
        title: 'Nie można rozpocząć rytuału',
        message: check.reason || 'Nieznany błąd',
        icon: 'mdi-alert',
      });
      return false;
    }

    const ritual = getRitual(ritualId)!;

    // Spend resources
    spendMana(ritual.manaCost);
    spendEnlightenment(ritual.enlightenmentCost);

    // Spend ingredients (simplified as gold)
    const goldCost = ritual.ingredients.reduce((sum, ing) => sum + ing.amount * 50, 0);
    resourcesStore.removeResource('gold', goldCost);

    activeRitual.value = {
      ritualId,
      startTime: Date.now(),
      ticksRemaining: ritual.castTime,
      totalTicks: ritual.castTime,
    };

    return true;
  }

  function cancelRitual() {
    activeRitual.value = null;
  }

  function completeRitual() {
    if (!activeRitual.value) return;

    const ritual = getRitual(activeRitual.value.ritualId);
    if (!ritual) return;

    // Apply effects
    const ritualEffect: ActiveRitualEffect = {
      ritualId: ritual.id,
      expiresAt: Date.now() + ritual.effectDuration * 100,
      effects: ritual.effects,
    };
    activeRitualEffects.value.push(ritualEffect);

    // Set cooldown
    ritualCooldowns.value.set(ritual.id, Date.now() + ritual.cooldown * 100);

    // Stats & XP
    ritualsCompleted.value++;
    addXp(ritual.manaCost / 2);

    gameStore.addNotification({
      type: 'success',
      title: 'Rytuał Ukończony!',
      message: `${ritual.name} - efekty aktywne!`,
      icon: ritual.icon,
      duration: 4000,
    });

    activeRitual.value = null;
  }

  function processRituals() {
    // Process casting
    if (activeRitual.value) {
      activeRitual.value.ticksRemaining--;
      if (activeRitual.value.ticksRemaining <= 0) {
        completeRitual();
      }
    }

    // Process active effects
    const now = Date.now();
    activeRitualEffects.value = activeRitualEffects.value.filter(e => e.expiresAt > now);

    // Clean up cooldowns
    for (const [id, cooldownEnd] of ritualCooldowns.value) {
      if (cooldownEnd <= now) {
        ritualCooldowns.value.delete(id);
      }
    }
  }

  // ============================================
  // ACTIONS - TAROT
  // ============================================

  function drawDailyTarot(): boolean {
    if (!canDrawTarot.value) {
      gameStore.addNotification({
        type: 'warning',
        title: 'Karta już wylosowana',
        message: 'Poczekaj do jutra na nową kartę.',
        icon: 'mdi-cards',
      });
      return false;
    }

    const { card, reversed } = getRandomTarotCard();
    const bonus = getTarotBonus(card, reversed);

    dailyTarot.value = {
      card,
      reversed,
      bonus,
      drawnAt: Date.now(),
    };

    collectedCards.value.add(card.id);
    tarotDrawsTotal.value++;

    const reversedText = reversed ? ' (odwrócona)' : '';
    gameStore.addNotification({
      type: reversed && bonus.isNegative ? 'warning' : 'success',
      title: `Karta Dnia: ${card.name}${reversedText}`,
      message: bonus.description,
      icon: card.icon,
      duration: 5000,
    });

    return true;
  }

  // ============================================
  // ACTIONS - GAME LOOP
  // ============================================

  function processTick() {
    // Meditation
    if (isMeditating.value) {
      processMeditationTick();
    }

    // Prophecies
    processProphecies();

    // Rituals
    processRituals();
  }

  // ============================================
  // SAVE/LOAD
  // ============================================

  function getState() {
    return {
      progress: progress.value,
      meditationState: meditationState.value,
      meditationXp: meditationXp.value,
      meditationTicks: meditationTicks.value,
      activeTrance: activeTrance.value,
      activeProphecies: activeProphecies.value,
      prophecyCooldowns: Array.from(prophecyCooldowns.value.entries()),
      fulfilledProphecies: fulfilledProphecies.value,
      totalProphecies: totalProphecies.value,
      activeRitual: activeRitual.value,
      activeRitualEffects: activeRitualEffects.value,
      ritualCooldowns: Array.from(ritualCooldowns.value.entries()),
      ritualsCompleted: ritualsCompleted.value,
      dailyTarot: dailyTarot.value,
      collectedCards: Array.from(collectedCards.value),
      tarotDrawsTotal: tarotDrawsTotal.value,
      totalManaGenerated: totalManaGenerated.value,
      totalEnlightenmentGained: totalEnlightenmentGained.value,
      trancesEntered: trancesEntered.value,
    };
  }

  function loadState(state: ReturnType<typeof getState>) {
    if (state.progress) progress.value = state.progress;
    if (state.meditationState) meditationState.value = state.meditationState;
    if (state.meditationXp !== undefined) meditationXp.value = state.meditationXp;
    if (state.meditationTicks !== undefined) meditationTicks.value = state.meditationTicks;
    if (state.activeTrance !== undefined) activeTrance.value = state.activeTrance;
    if (state.activeProphecies) activeProphecies.value = state.activeProphecies;
    if (state.prophecyCooldowns) prophecyCooldowns.value = new Map(state.prophecyCooldowns);
    if (state.fulfilledProphecies !== undefined) fulfilledProphecies.value = state.fulfilledProphecies;
    if (state.totalProphecies !== undefined) totalProphecies.value = state.totalProphecies;
    if (state.activeRitual !== undefined) activeRitual.value = state.activeRitual;
    if (state.activeRitualEffects) activeRitualEffects.value = state.activeRitualEffects;
    if (state.ritualCooldowns) ritualCooldowns.value = new Map(state.ritualCooldowns);
    if (state.ritualsCompleted !== undefined) ritualsCompleted.value = state.ritualsCompleted;
    if (state.dailyTarot !== undefined) dailyTarot.value = state.dailyTarot;
    if (state.collectedCards) collectedCards.value = new Set(state.collectedCards);
    if (state.tarotDrawsTotal !== undefined) tarotDrawsTotal.value = state.tarotDrawsTotal;
    if (state.totalManaGenerated !== undefined) totalManaGenerated.value = state.totalManaGenerated;
    if (state.totalEnlightenmentGained !== undefined) totalEnlightenmentGained.value = state.totalEnlightenmentGained;
    if (state.trancesEntered !== undefined) trancesEntered.value = state.trancesEntered;
  }

  function resetMystic() {
    progress.value = {
      level: 1,
      xp: 0,
      xpToNextLevel: 100,
      totalXp: 0,
      mana: 0,
      maxMana: 100,
      enlightenment: 0,
    };
    meditationState.value = 'idle';
    meditationXp.value = 0;
    meditationTicks.value = 0;
    activeTrance.value = null;
    activeProphecies.value = [];
    prophecyCooldowns.value = new Map();
    fulfilledProphecies.value = 0;
    totalProphecies.value = 0;
    activeRitual.value = null;
    activeRitualEffects.value = [];
    ritualCooldowns.value = new Map();
    ritualsCompleted.value = 0;
    dailyTarot.value = null;
    collectedCards.value = new Set();
    tarotDrawsTotal.value = 0;
    totalManaGenerated.value = 0;
    totalEnlightenmentGained.value = 0;
    trancesEntered.value = 0;
  }

  // ============================================
  // DEV HELPERS
  // ============================================

  function devAddXp(amount: number) {
    addXp(amount);
  }

  function devAddMana(amount: number) {
    addMana(amount);
  }

  function devAddEnlightenment(amount: number) {
    addEnlightenment(amount);
  }

  function devFillResources() {
    progress.value.mana = progress.value.maxMana;
    progress.value.enlightenment += 500;
    meditationXp.value += 5000;
  }

  function devCollectAllCards() {
    for (const card of MAJOR_ARCANA) {
      collectedCards.value.add(card.id);
    }
  }

  return {
    // State
    progress,
    meditationState,
    meditationXp,
    meditationTicks,
    activeTrance,
    activeProphecies,
    prophecyCooldowns,
    fulfilledProphecies,
    totalProphecies,
    activeRitual,
    activeRitualEffects,
    ritualCooldowns,
    ritualsCompleted,
    dailyTarot,
    collectedCards,
    tarotDrawsTotal,
    totalManaGenerated,
    totalEnlightenmentGained,
    trancesEntered,

    // Computed
    currentMeditationLevel,
    nextMeditationLevel,
    meditationProgress,
    isMeditating,
    isInTrance,
    isCastingRitual,
    ritualProgress,
    availablePropheciesList,
    availableRitualsList,
    canDrawTarot,
    manaPercent,
    totalActiveBonuses,

    // XP
    addXp,
    addMeditationXp,
    getXpProgress,

    // Mana & Enlightenment
    addMana,
    spendMana,
    addEnlightenment,
    spendEnlightenment,

    // Meditation
    startMeditation,
    stopMeditation,

    // Prophecies
    canCastProphecy,
    castProphecy,

    // Rituals
    canStartRitual,
    startRitual,
    cancelRitual,

    // Tarot
    drawDailyTarot,

    // Game Loop
    processTick,

    // Save/Load
    getState,
    loadState,
    resetMystic,

    // Dev
    devAddXp,
    devAddMana,
    devAddEnlightenment,
    devFillResources,
    devCollectAllCards,
  };
}, {
  persist: {
    key: 'ateria-mystic',
    serializer: {
      serialize: (state) => {
        return JSON.stringify({
          ...state,
          prophecyCooldowns: Array.from(state.prophecyCooldowns?.entries?.() || []),
          ritualCooldowns: Array.from(state.ritualCooldowns?.entries?.() || []),
          collectedCards: Array.from(state.collectedCards || []),
        });
      },
      deserialize: (value) => {
        const parsed = JSON.parse(value);
        return {
          ...parsed,
          prophecyCooldowns: new Map(parsed.prophecyCooldowns || []),
          ritualCooldowns: new Map(parsed.ritualCooldowns || []),
          collectedCards: new Set(parsed.collectedCards || []),
        };
      },
    },
  },
});
