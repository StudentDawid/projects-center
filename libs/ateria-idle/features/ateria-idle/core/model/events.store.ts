/**
 * Events Store - Manages seasonal events, daily challenges, and bonuses
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAteriaGameStore } from './game.store';
import { useAteriaWarriorStore } from '../../warrior/model/warrior.store';
import { useAteriaMerchantStore } from '../../merchant/model/merchant.store';
import { useAteriaScientistStore } from '../../scientist/model/scientist.store';
import { useAteriaResourcesStore } from './resources.store';
import {
  SEASONAL_FESTIVALS,
  WEEKEND_BONUSES,
  WORLD_EVENTS,
  DAILY_CHALLENGES,
  getEventDefinition,
  getRandomDailyChallenges,
  calculateEventModifiers,
  getUpcomingEvents,
  type EventDefinition,
  type DailyChallenge,
  type ChallengeObjective,
} from '../../data/events.data';
import type { GameEvent, PathId } from '@ateria-idle/entities/ateria-idle/game';

export const useAteriaEventsStore = defineStore('ateria-events', () => {
  const gameStore = useAteriaGameStore();
  const resourcesStore = useAteriaResourcesStore();

  // ============================================
  // STATE
  // ============================================

  // Active events
  const activeEvents = ref<GameEvent[]>([]);

  // Daily challenges
  const dailyChallenges = ref<Array<{
    challenge: DailyChallenge;
    progress: number[];
    completed: boolean;
    claimed: boolean;
    expiresAt: number;
  }>>([]);

  const lastDailyChallengeReset = ref(0);
  const completedChallengesCount = ref(0);
  const totalChallengesCompleted = ref(0);

  // Event history
  const eventHistory = ref<Array<{
    eventId: string;
    startTime: number;
    endTime: number;
    participated: boolean;
  }>>([]);

  // Stats tracking for challenges
  const challengeStats = ref({
    killsToday: 0,
    goldEarnedToday: 0,
    itemsSoldToday: 0,
    potionsCraftedToday: 0,
    researchLevelsToday: 0,
    dungeonsCompletedToday: 0,
    slayerTasksToday: 0,
  });

  // ============================================
  // COMPUTED
  // ============================================

  const hasActiveEvent = computed(() => activeEvents.value.length > 0);

  const activeEventBonuses = computed(() => {
    const events = activeEvents.value.map(e => getEventDefinition(e.id)).filter(Boolean) as EventDefinition[];
    return calculateEventModifiers(events);
  });

  const pathBonuses = computed(() => {
    const events = activeEvents.value.map(e => getEventDefinition(e.id)).filter(Boolean) as EventDefinition[];
    return {
      warrior: calculateEventModifiers(events, 'warrior'),
      merchant: calculateEventModifiers(events, 'merchant'),
      scientist: calculateEventModifiers(events, 'scientist'),
    };
  });

  const activeDailyChallenges = computed(() => {
    return dailyChallenges.value.filter(c => !c.completed || !c.claimed);
  });

  const availableToClaim = computed(() => {
    return dailyChallenges.value.filter(c => c.completed && !c.claimed);
  });

  const upcomingEvents = computed(() => {
    return getUpcomingEvents(30);
  });

  const currentWeekendBonus = computed(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const hour = now.getHours();

    // Friday 18:00 to Sunday 23:59
    if ((dayOfWeek === 5 && hour >= 18) || dayOfWeek === 6 || dayOfWeek === 0) {
      // Rotate between weekend bonuses
      const weekNumber = Math.floor(now.getTime() / (7 * 24 * 60 * 60 * 1000));
      const bonusIndex = weekNumber % WEEKEND_BONUSES.length;
      return WEEKEND_BONUSES[bonusIndex];
    }
    return null;
  });

  // ============================================
  // ACTIONS - EVENT MANAGEMENT
  // ============================================

  function startEvent(eventId: string) {
    const definition = getEventDefinition(eventId);
    if (!definition) return false;

    // Check if already active
    if (activeEvents.value.some(e => e.id === eventId)) {
      return false;
    }

    const event: GameEvent = {
      id: eventId,
      type: definition.type,
      name: definition.name,
      description: definition.description,
      startTime: Date.now(),
      endTime: Date.now() + definition.duration * 60 * 60 * 1000,
      modifiers: definition.modifiers,
      rewards: definition.rewards,
    };

    activeEvents.value.push(event);

    gameStore.addNotification({
      type: 'info',
      title: 'Wydarzenie Rozpoczęte!',
      message: definition.name,
      icon: definition.icon,
      duration: 8000,
    });

    return true;
  }

  function endEvent(eventId: string) {
    const index = activeEvents.value.findIndex(e => e.id === eventId);
    if (index === -1) return false;

    const event = activeEvents.value[index];
    const definition = getEventDefinition(eventId);

    // Add to history
    eventHistory.value.push({
      eventId,
      startTime: event.startTime,
      endTime: Date.now(),
      participated: true,
    });

    // Grant rewards if any
    if (definition?.rewards) {
      for (const reward of definition.rewards) {
        if (reward.type === 'resource') {
          resourcesStore.addResource(reward.id as any, reward.amount);
        } else if (reward.type === 'legacy_points') {
          // Handle LP reward
          const prestigeStore = require('./prestige.store').useAteriaPrestigeStore();
          prestigeStore.legacyPoints += reward.amount;
        }
      }

      gameStore.addNotification({
        type: 'success',
        title: 'Wydarzenie Zakończone!',
        message: `${definition.name} - Nagrody odebrane!`,
        icon: definition.icon,
      });
    }

    activeEvents.value.splice(index, 1);
    return true;
  }

  function checkEventExpiry() {
    const now = Date.now();
    const expiredEvents = activeEvents.value.filter(e => e.endTime <= now);

    for (const event of expiredEvents) {
      endEvent(event.id);
    }
  }

  function checkSeasonalEvents() {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();

    for (const festival of SEASONAL_FESTIVALS) {
      if (
        festival.schedule?.type === 'seasonal' &&
        festival.schedule.month === currentMonth &&
        festival.schedule.dayOfMonth === currentDay
      ) {
        // Check if not already active or recently ended
        const recentlyEnded = eventHistory.value.some(h => {
          return h.eventId === festival.id &&
            Date.now() - h.endTime < 24 * 60 * 60 * 1000; // Within last 24h
        });

        if (!recentlyEnded && !activeEvents.value.some(e => e.id === festival.id)) {
          startEvent(festival.id);
        }
      }
    }
  }

  function checkRandomEvents() {
    const lastCheck = localStorage.getItem('ateria-last-random-event-check');
    const today = new Date().toDateString();

    if (lastCheck === today) return;
    localStorage.setItem('ateria-last-random-event-check', today);

    // Roll for random events
    for (const event of WORLD_EVENTS) {
      if (event.schedule?.type === 'random' && event.schedule.probability) {
        const roll = Math.random();
        if (roll < event.schedule.probability) {
          startEvent(event.id);
          break; // Only one random event per day
        }
      }
    }
  }

  // ============================================
  // ACTIONS - DAILY CHALLENGES
  // ============================================

  function initializeDailyChallenges() {
    const today = new Date().setHours(0, 0, 0, 0);

    // Check if we need to reset
    if (lastDailyChallengeReset.value < today) {
      resetDailyChallenges();
    }
  }

  function resetDailyChallenges() {
    // Reset stats
    challengeStats.value = {
      killsToday: 0,
      goldEarnedToday: 0,
      itemsSoldToday: 0,
      potionsCraftedToday: 0,
      researchLevelsToday: 0,
      dungeonsCompletedToday: 0,
      slayerTasksToday: 0,
    };

    // Generate new challenges
    const newChallenges = getRandomDailyChallenges(3);
    const expiresAt = new Date().setHours(23, 59, 59, 999);

    dailyChallenges.value = newChallenges.map(challenge => ({
      challenge,
      progress: challenge.objectives.map(() => 0),
      completed: false,
      claimed: false,
      expiresAt,
    }));

    lastDailyChallengeReset.value = new Date().setHours(0, 0, 0, 0);
    completedChallengesCount.value = 0;

    gameStore.addNotification({
      type: 'info',
      title: 'Nowe Wyzwania!',
      message: 'Dzienne wyzwania zostały odświeżone',
      icon: 'mdi-calendar-check',
      duration: 5000,
    });
  }

  function updateChallengeProgress(
    type: ChallengeObjective['type'],
    amount: number = 1,
    target?: string
  ) {
    for (const entry of dailyChallenges.value) {
      if (entry.completed) continue;

      const { challenge, progress } = entry;

      for (let i = 0; i < challenge.objectives.length; i++) {
        const objective = challenge.objectives[i];

        if (objective.type !== type) continue;
        if (objective.target && target && objective.target !== target) continue;

        progress[i] = Math.min(progress[i] + amount, objective.amount);
      }

      // Check if all objectives complete
      const allComplete = challenge.objectives.every((obj, i) => progress[i] >= obj.amount);
      if (allComplete && !entry.completed) {
        entry.completed = true;
        completedChallengesCount.value++;

        gameStore.addNotification({
          type: 'success',
          title: 'Wyzwanie Ukończone!',
          message: challenge.name,
          icon: challenge.icon,
        });
      }
    }
  }

  function claimChallengeReward(challengeId: string) {
    const entry = dailyChallenges.value.find(c => c.challenge.id === challengeId);
    if (!entry || !entry.completed || entry.claimed) return false;

    // Grant rewards
    for (const reward of entry.challenge.rewards) {
      if (reward.type === 'resource') {
        resourcesStore.addResource(reward.id as any, reward.amount);
      } else if (reward.type === 'legacy_points') {
        const prestigeStore = require('./prestige.store').useAteriaPrestigeStore();
        prestigeStore.legacyPoints += reward.amount;
      }
      // Items would need inventory handling
    }

    entry.claimed = true;
    totalChallengesCompleted.value++;

    gameStore.addNotification({
      type: 'success',
      title: 'Nagroda Odebrana!',
      message: `${entry.challenge.name}`,
      icon: 'mdi-gift',
    });

    return true;
  }

  // ============================================
  // STAT TRACKING (called from other stores)
  // ============================================

  function recordKill(isElite: boolean = false) {
    challengeStats.value.killsToday++;
    updateChallengeProgress('kill', 1);
    if (isElite) {
      updateChallengeProgress('kill', 1, 'elite');
    }
  }

  function recordGoldEarned(amount: number) {
    challengeStats.value.goldEarnedToday += amount;
    updateChallengeProgress('earn_gold', amount);
  }

  function recordItemSold() {
    challengeStats.value.itemsSoldToday++;
    updateChallengeProgress('sell', 1);
  }

  function recordPotionCrafted() {
    challengeStats.value.potionsCraftedToday++;
    updateChallengeProgress('craft', 1);
  }

  function recordResearchLevel() {
    challengeStats.value.researchLevelsToday++;
    updateChallengeProgress('research', 1);
  }

  function recordDungeonCompleted() {
    challengeStats.value.dungeonsCompletedToday++;
    updateChallengeProgress('complete_dungeon', 1);
  }

  function recordSlayerTaskCompleted() {
    challengeStats.value.slayerTasksToday++;
    updateChallengeProgress('slayer_task', 1);
  }

  // ============================================
  // GAME LOOP
  // ============================================

  function processTick() {
    // Check for expired events (every 10 seconds worth of ticks)
    if (Math.random() < 0.01) {
      checkEventExpiry();
    }

    // Check for seasonal events once per hour
    if (Math.random() < 0.0001) {
      checkSeasonalEvents();
    }
  }

  function processDaily() {
    checkRandomEvents();
    initializeDailyChallenges();
  }

  // ============================================
  // SAVE/LOAD
  // ============================================

  function getState() {
    return {
      activeEvents: activeEvents.value,
      dailyChallenges: dailyChallenges.value,
      lastDailyChallengeReset: lastDailyChallengeReset.value,
      completedChallengesCount: completedChallengesCount.value,
      totalChallengesCompleted: totalChallengesCompleted.value,
      eventHistory: eventHistory.value.slice(-50), // Keep last 50
      challengeStats: challengeStats.value,
    };
  }

  function loadState(state: ReturnType<typeof getState>) {
    if (state.activeEvents) activeEvents.value = state.activeEvents;
    if (state.dailyChallenges) dailyChallenges.value = state.dailyChallenges;
    if (state.lastDailyChallengeReset) lastDailyChallengeReset.value = state.lastDailyChallengeReset;
    if (state.completedChallengesCount !== undefined) completedChallengesCount.value = state.completedChallengesCount;
    if (state.totalChallengesCompleted !== undefined) totalChallengesCompleted.value = state.totalChallengesCompleted;
    if (state.eventHistory) eventHistory.value = state.eventHistory;
    if (state.challengeStats) challengeStats.value = state.challengeStats;

    // Initialize daily challenges on load
    initializeDailyChallenges();
  }

  function resetEvents() {
    activeEvents.value = [];
    dailyChallenges.value = [];
    lastDailyChallengeReset.value = 0;
    completedChallengesCount.value = 0;
    eventHistory.value = [];
    challengeStats.value = {
      killsToday: 0,
      goldEarnedToday: 0,
      itemsSoldToday: 0,
      potionsCraftedToday: 0,
      researchLevelsToday: 0,
      dungeonsCompletedToday: 0,
      slayerTasksToday: 0,
    };
  }

  return {
    // State
    activeEvents,
    dailyChallenges,
    lastDailyChallengeReset,
    completedChallengesCount,
    totalChallengesCompleted,
    eventHistory,
    challengeStats,

    // Computed
    hasActiveEvent,
    activeEventBonuses,
    pathBonuses,
    activeDailyChallenges,
    availableToClaim,
    upcomingEvents,
    currentWeekendBonus,

    // Actions
    startEvent,
    endEvent,
    checkEventExpiry,
    checkSeasonalEvents,
    checkRandomEvents,
    initializeDailyChallenges,
    resetDailyChallenges,
    updateChallengeProgress,
    claimChallengeReward,

    // Tracking
    recordKill,
    recordGoldEarned,
    recordItemSold,
    recordPotionCrafted,
    recordResearchLevel,
    recordDungeonCompleted,
    recordSlayerTaskCompleted,

    // Lifecycle
    processTick,
    processDaily,
    getState,
    loadState,
    resetEvents,
  };
}, {
  persist: {
    key: 'ateria-events',
  },
});
