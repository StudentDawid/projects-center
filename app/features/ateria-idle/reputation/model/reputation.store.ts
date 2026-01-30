/**
 * Reputation Store - Karma, Fame, Titles, Alignment Management
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAteriaGameStore } from '../../core/model/game.store';
import {
  ALIGNMENTS, FAME_MILESTONES, REPUTATION_TITLES, KARMA_ACTIONS,
  getAlignment, getFameTier, getTitle, type AlignmentType, type ReputationTitle
} from '../data/reputation.data';

// ============================================
// TYPES
// ============================================

export interface KarmaHistoryEntry {
  actionId: string;
  change: number;
  timestamp: number;
  description: string;
}

export interface ReputationStats {
  totalKarmaGained: number;
  totalKarmaLost: number;
  titlesEarned: number;
  fameGained: number;
  goodActionsCount: number;
  evilActionsCount: number;
}

// ============================================
// STORE
// ============================================

export const useAteriaReputationStore = defineStore('ateria-reputation', () => {
  const gameStore = useAteriaGameStore();

  // ============================================
  // STATE
  // ============================================

  // Core values (-100 to 100)
  const karma = ref<number>(0);
  const lawChaos = ref<number>(0); // -100 chaos, +100 law
  const goodEvil = ref<number>(0); // -100 evil, +100 good
  
  // Fame (always positive, accumulates)
  const fame = ref<number>(0);
  
  // Titles
  const unlockedTitles = ref<Set<string>>(new Set());
  const activeTitle = ref<string | null>(null);
  
  // History
  const karmaHistory = ref<KarmaHistoryEntry[]>([]);
  
  // Stats
  const stats = ref<ReputationStats>({
    totalKarmaGained: 0,
    totalKarmaLost: 0,
    titlesEarned: 0,
    fameGained: 0,
    goodActionsCount: 0,
    evilActionsCount: 0,
  });

  // ============================================
  // COMPUTED
  // ============================================

  const currentAlignment = computed((): AlignmentType => {
    return getAlignment(lawChaos.value, goodEvil.value);
  });

  const alignmentData = computed(() => {
    return ALIGNMENTS[currentAlignment.value];
  });

  const fameTier = computed(() => {
    return getFameTier(fame.value);
  });

  const nextFameMilestone = computed(() => {
    const currentIndex = FAME_MILESTONES.findIndex(m => m.fame > fame.value);
    return currentIndex >= 0 ? FAME_MILESTONES[currentIndex] : null;
  });

  const fameProgress = computed(() => {
    if (!nextFameMilestone.value) return 100;
    const current = fameTier.value.fame;
    const next = nextFameMilestone.value.fame;
    return ((fame.value - current) / (next - current)) * 100;
  });

  const activeTitleData = computed((): ReputationTitle | null => {
    if (!activeTitle.value) return null;
    return getTitle(activeTitle.value) || null;
  });

  const karmaDescription = computed(() => {
    if (karma.value > 75) return 'Święty';
    if (karma.value > 50) return 'Szlachetny';
    if (karma.value > 25) return 'Dobry';
    if (karma.value > -25) return 'Neutralny';
    if (karma.value > -50) return 'Podejrzany';
    if (karma.value > -75) return 'Zły';
    return 'Nikczemny';
  });

  const totalBonuses = computed(() => {
    const bonuses: Record<string, number> = {};
    
    // Alignment bonuses
    for (const bonus of alignmentData.value.bonuses) {
      bonuses[bonus.stat] = (bonuses[bonus.stat] || 0) + bonus.value;
    }
    
    // Active title bonuses
    if (activeTitleData.value) {
      for (const bonus of activeTitleData.value.bonuses) {
        bonuses[bonus.stat] = (bonuses[bonus.stat] || 0) + bonus.value;
      }
    }
    
    // Fame tier bonuses
    for (const reward of fameTier.value.rewards) {
      bonuses[reward.type] = (bonuses[reward.type] || 0) + reward.value;
    }
    
    return bonuses;
  });

  // ============================================
  // ACTIONS
  // ============================================

  function addKarma(amount: number, actionId?: string, description?: string) {
    const oldKarma = karma.value;
    karma.value = Math.max(-100, Math.min(100, karma.value + amount));
    
    // Update alignment axes
    if (amount > 0) {
      goodEvil.value = Math.min(100, goodEvil.value + amount * 0.5);
      stats.value.totalKarmaGained += amount;
      stats.value.goodActionsCount++;
    } else {
      goodEvil.value = Math.max(-100, goodEvil.value + amount * 0.5);
      stats.value.totalKarmaLost += Math.abs(amount);
      stats.value.evilActionsCount++;
    }
    
    // Add to history
    karmaHistory.value.unshift({
      actionId: actionId || 'unknown',
      change: amount,
      timestamp: Date.now(),
      description: description || (amount > 0 ? 'Dobry czyn' : 'Zły czyn'),
    });
    
    // Limit history
    if (karmaHistory.value.length > 100) {
      karmaHistory.value.pop();
    }
    
    // Notify
    if (Math.abs(amount) >= 10) {
      gameStore.addNotification({
        type: amount > 0 ? 'success' : 'warning',
        title: amount > 0 ? 'Karma wzrosła' : 'Karma spadła',
        message: `${amount > 0 ? '+' : ''}${amount} karmy`,
        icon: amount > 0 ? 'mdi-heart' : 'mdi-heart-broken',
        duration: 2000,
      });
    }
  }

  function performKarmaAction(actionId: string) {
    const action = KARMA_ACTIONS.find(a => a.id === actionId);
    if (!action) return;
    
    addKarma(action.karmaChange, actionId, action.description);
  }

  function adjustLawChaos(amount: number) {
    lawChaos.value = Math.max(-100, Math.min(100, lawChaos.value + amount));
  }

  function addFame(amount: number) {
    const oldTier = fameTier.value;
    fame.value += amount;
    stats.value.fameGained += amount;
    
    const newTier = getFameTier(fame.value);
    if (newTier.tier !== oldTier.tier) {
      gameStore.addNotification({
        type: 'success',
        title: 'Nowy poziom sławy!',
        message: `Osiągnąłeś status: ${newTier.name}`,
        icon: 'mdi-star',
        duration: 4000,
      });
    }
  }

  function unlockTitle(titleId: string) {
    if (unlockedTitles.value.has(titleId)) return false;
    
    const title = getTitle(titleId);
    if (!title) return false;
    
    unlockedTitles.value.add(titleId);
    stats.value.titlesEarned++;
    
    gameStore.addNotification({
      type: 'success',
      title: 'Nowy tytuł!',
      message: title.name,
      icon: title.icon,
      duration: 4000,
    });
    
    // Auto-equip if no title active
    if (!activeTitle.value) {
      activeTitle.value = titleId;
    }
    
    return true;
  }

  function setActiveTitle(titleId: string | null) {
    if (titleId && !unlockedTitles.value.has(titleId)) return;
    activeTitle.value = titleId;
  }

  function checkTitleRequirements(context: {
    kills?: number;
    bossKills?: number;
    gold?: number;
    regionsDiscovered?: number;
    poisDiscovered?: number;
    crafts?: number;
    maxFactionReps?: number;
    spellsMastered?: number;
    creaturesTamed?: number;
    levels?: Record<string, number>;
  }) {
    for (const title of REPUTATION_TITLES) {
      if (unlockedTitles.value.has(title.id)) continue;
      
      const { type, value, target } = title.requirement;
      let met = false;
      
      switch (type) {
        case 'kills':
          if (target === 'boss') {
            met = (context.bossKills || 0) >= value;
          } else {
            met = (context.kills || 0) >= value;
          }
          break;
        case 'gold':
          met = (context.gold || 0) >= value;
          break;
        case 'exploration':
          if (target === 'poi') {
            met = (context.poisDiscovered || 0) >= value;
          } else {
            met = (context.regionsDiscovered || 0) >= value;
          }
          break;
        case 'crafts':
          met = (context.crafts || 0) >= value;
          break;
        case 'level':
          if (target && context.levels) {
            met = (context.levels[target] || 0) >= value;
          }
          break;
        case 'karma':
          met = title.requirement.comparison === 'lte' 
            ? karma.value <= value 
            : karma.value >= value;
          break;
        case 'fame':
          met = fame.value >= value;
          break;
      }
      
      if (met) {
        unlockTitle(title.id);
      }
    }
  }

  // Get bonus value for a specific stat
  function getBonus(stat: string): number {
    return totalBonuses.value[stat] || 0;
  }

  // ============================================
  // SAVE/LOAD
  // ============================================

  function resetReputation() {
    karma.value = 0;
    lawChaos.value = 0;
    goodEvil.value = 0;
    fame.value = 0;
    unlockedTitles.value = new Set();
    activeTitle.value = null;
    karmaHistory.value = [];
    stats.value = {
      totalKarmaGained: 0,
      totalKarmaLost: 0,
      titlesEarned: 0,
      fameGained: 0,
      goodActionsCount: 0,
      evilActionsCount: 0,
    };
  }

  return {
    // State
    karma, lawChaos, goodEvil, fame,
    unlockedTitles, activeTitle, karmaHistory, stats,
    
    // Computed
    currentAlignment, alignmentData, fameTier, nextFameMilestone,
    fameProgress, activeTitleData, karmaDescription, totalBonuses,
    
    // Actions
    addKarma, performKarmaAction, adjustLawChaos, addFame,
    unlockTitle, setActiveTitle, checkTitleRequirements, getBonus,
    resetReputation,
  };
}, {
  persist: {
    key: 'ateria-reputation',
    serializer: {
      serialize: (state) => JSON.stringify({
        ...state,
        unlockedTitles: Array.from(state.unlockedTitles || []),
      }),
      deserialize: (value) => {
        const p = JSON.parse(value);
        return {
          ...p,
          unlockedTitles: new Set(p.unlockedTitles || []),
        };
      },
    },
  },
});
