/**
 * Codex Store - Encyclopedia Management, Entry Discovery
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAteriaGameStore } from '../../core/model/game.store';
import {
  CODEX_ENTRIES, CODEX_CATEGORIES, RARITY_DATA,
  getCodexEntry, getEntriesByCategory, getCategoryInfo, getAllCategories,
  type CodexEntry, type CodexCategory, type EntryRarity
} from '../data/codex.data';

// ============================================
// TYPES
// ============================================

export interface DiscoveredEntry {
  entryId: string;
  discoveredAt: number;
  readAt?: number;
  isFavorite: boolean;
}

export interface CodexStats {
  totalDiscovered: number;
  byCategory: Record<CodexCategory, number>;
  byRarity: Record<EntryRarity, number>;
  lastDiscovery?: string;
  favoritesCount: number;
}

// ============================================
// STORE
// ============================================

export const useAteriaCodexStore = defineStore('ateria-codex', () => {
  const gameStore = useAteriaGameStore();

  // ============================================
  // STATE
  // ============================================

  const discoveredEntries = ref<Map<string, DiscoveredEntry>>(new Map());
  const readEntries = ref<Set<string>>(new Set());
  const favoriteEntries = ref<Set<string>>(new Set());
  const recentlyDiscovered = ref<string[]>([]);

  // ============================================
  // COMPUTED
  // ============================================

  const stats = computed((): CodexStats => {
    const byCategory: Record<CodexCategory, number> = {
      bestiary: 0, herbarium: 0, atlas: 0, chronicles: 0, biographies: 0, artifacts: 0,
    };
    const byRarity: Record<EntryRarity, number> = {
      common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0,
    };

    for (const [entryId] of discoveredEntries.value) {
      const entry = getCodexEntry(entryId);
      if (entry) {
        byCategory[entry.category]++;
        byRarity[entry.rarity]++;
      }
    }

    return {
      totalDiscovered: discoveredEntries.value.size,
      byCategory,
      byRarity,
      lastDiscovery: recentlyDiscovered.value[0],
      favoritesCount: favoriteEntries.value.size,
    };
  });

  const totalEntries = computed(() => CODEX_ENTRIES.length);

  const completionPercent = computed(() => {
    return (stats.value.totalDiscovered / totalEntries.value) * 100;
  });

  const unreadCount = computed(() => {
    let count = 0;
    for (const [entryId] of discoveredEntries.value) {
      if (!readEntries.value.has(entryId)) count++;
    }
    return count;
  });

  const discoveredEntriesList = computed(() => {
    return Array.from(discoveredEntries.value.entries())
      .map(([id, data]) => ({ ...getCodexEntry(id)!, ...data }))
      .filter(e => e.id);
  });

  const categoryCompletion = computed(() => {
    const completion: Record<CodexCategory, { discovered: number; total: number; percent: number }> = {} as any;
    
    for (const category of getAllCategories()) {
      const categoryEntries = getEntriesByCategory(category);
      const discovered = categoryEntries.filter(e => discoveredEntries.value.has(e.id)).length;
      completion[category] = {
        discovered,
        total: categoryEntries.length,
        percent: (discovered / categoryEntries.length) * 100,
      };
    }
    
    return completion;
  });

  // ============================================
  // ACTIONS
  // ============================================

  function isDiscovered(entryId: string): boolean {
    return discoveredEntries.value.has(entryId);
  }

  function discoverEntry(entryId: string): boolean {
    if (discoveredEntries.value.has(entryId)) return false;
    
    const entry = getCodexEntry(entryId);
    if (!entry) return false;
    
    discoveredEntries.value.set(entryId, {
      entryId,
      discoveredAt: Date.now(),
      isFavorite: false,
    });
    
    recentlyDiscovered.value.unshift(entryId);
    if (recentlyDiscovered.value.length > 10) {
      recentlyDiscovered.value.pop();
    }
    
    const categoryInfo = getCategoryInfo(entry.category);
    const rarityInfo = RARITY_DATA[entry.rarity];
    
    gameStore.addNotification({
      type: 'success',
      title: `Nowy wpis w Kodeksie!`,
      message: `${categoryInfo.name}: ${entry.name}`,
      icon: categoryInfo.icon,
      duration: 4000,
    });
    
    return true;
  }

  function discoverMultiple(entryIds: string[]): number {
    let count = 0;
    for (const id of entryIds) {
      if (discoverEntry(id)) count++;
    }
    return count;
  }

  function markAsRead(entryId: string) {
    if (!discoveredEntries.value.has(entryId)) return;
    
    readEntries.value.add(entryId);
    const discovered = discoveredEntries.value.get(entryId);
    if (discovered) {
      discovered.readAt = Date.now();
    }
  }

  function toggleFavorite(entryId: string) {
    if (!discoveredEntries.value.has(entryId)) return;
    
    const discovered = discoveredEntries.value.get(entryId)!;
    discovered.isFavorite = !discovered.isFavorite;
    
    if (discovered.isFavorite) {
      favoriteEntries.value.add(entryId);
    } else {
      favoriteEntries.value.delete(entryId);
    }
  }

  function getEntriesForCategory(category: CodexCategory) {
    return getEntriesByCategory(category).map(entry => ({
      ...entry,
      isDiscovered: discoveredEntries.value.has(entry.id),
      isRead: readEntries.value.has(entry.id),
      isFavorite: favoriteEntries.value.has(entry.id),
      discoveredData: discoveredEntries.value.get(entry.id),
    }));
  }

  function searchEntries(query: string): CodexEntry[] {
    const q = query.toLowerCase();
    return CODEX_ENTRIES.filter(entry => {
      if (!discoveredEntries.value.has(entry.id)) return false;
      return entry.name.toLowerCase().includes(q) || 
             entry.description.toLowerCase().includes(q) ||
             entry.lore.toLowerCase().includes(q);
    });
  }

  function getRelatedEntries(entryId: string): CodexEntry[] {
    const entry = getCodexEntry(entryId);
    if (!entry?.relatedEntries) return [];
    
    return entry.relatedEntries
      .map(id => getCodexEntry(id))
      .filter((e): e is CodexEntry => e !== undefined && discoveredEntries.value.has(e.id));
  }

  // Check for automatic discoveries based on game state
  function checkDiscoveryConditions(context: {
    kills?: Map<string, number>;
    gathers?: Map<string, number>;
    visits?: Set<string>;
    levels?: Record<string, number>;
    crafts?: Map<string, number>;
    quests?: Set<string>;
  }) {
    for (const entry of CODEX_ENTRIES) {
      if (discoveredEntries.value.has(entry.id)) continue;
      if (!entry.unlockCondition) continue;
      
      const { type, target, amount } = entry.unlockCondition;
      let shouldUnlock = false;
      
      switch (type) {
        case 'kill':
          if (context.kills && target) {
            shouldUnlock = (context.kills.get(target) || 0) >= (amount || 1);
          }
          break;
        case 'gather':
          if (context.gathers && target) {
            shouldUnlock = (context.gathers.get(target) || 0) >= (amount || 1);
          }
          break;
        case 'visit':
          if (context.visits && target) {
            shouldUnlock = context.visits.has(target);
          }
          break;
        case 'level':
          if (context.levels && target) {
            shouldUnlock = (context.levels[target] || 0) >= (amount || 1);
          }
          break;
        case 'craft':
          if (context.crafts && target) {
            shouldUnlock = (context.crafts.get(target) || 0) >= (amount || 1);
          }
          break;
        case 'quest':
          if (context.quests && target) {
            shouldUnlock = context.quests.has(target);
          }
          break;
      }
      
      if (shouldUnlock) {
        discoverEntry(entry.id);
      }
    }
  }

  // ============================================
  // DEV FUNCTIONS
  // ============================================

  function devDiscoverAll() {
    for (const entry of CODEX_ENTRIES) {
      if (!discoveredEntries.value.has(entry.id)) {
        discoveredEntries.value.set(entry.id, {
          entryId: entry.id,
          discoveredAt: Date.now(),
          isFavorite: false,
        });
      }
    }
  }

  function devDiscoverCategory(category: CodexCategory) {
    for (const entry of getEntriesByCategory(category)) {
      discoverEntry(entry.id);
    }
  }

  // ============================================
  // SAVE/LOAD
  // ============================================

  function getState() {
    return {
      discoveredEntries: Array.from(discoveredEntries.value.entries()),
      readEntries: Array.from(readEntries.value),
      favoriteEntries: Array.from(favoriteEntries.value),
      recentlyDiscovered: recentlyDiscovered.value,
    };
  }

  function loadState(state: ReturnType<typeof getState>) {
    if (state.discoveredEntries) discoveredEntries.value = new Map(state.discoveredEntries);
    if (state.readEntries) readEntries.value = new Set(state.readEntries);
    if (state.favoriteEntries) favoriteEntries.value = new Set(state.favoriteEntries);
    if (state.recentlyDiscovered) recentlyDiscovered.value = state.recentlyDiscovered;
  }

  function resetCodex() {
    discoveredEntries.value = new Map();
    readEntries.value = new Set();
    favoriteEntries.value = new Set();
    recentlyDiscovered.value = [];
  }

  return {
    // State
    discoveredEntries, readEntries, favoriteEntries, recentlyDiscovered,
    
    // Computed
    stats, totalEntries, completionPercent, unreadCount,
    discoveredEntriesList, categoryCompletion,
    
    // Actions
    isDiscovered, discoverEntry, discoverMultiple,
    markAsRead, toggleFavorite,
    getEntriesForCategory, searchEntries, getRelatedEntries,
    checkDiscoveryConditions,
    
    // Dev
    devDiscoverAll, devDiscoverCategory,
    
    // Lifecycle
    getState, loadState, resetCodex,
  };
}, {
  persist: {
    key: 'ateria-codex',
    serializer: {
      serialize: (state) => JSON.stringify({
        ...state,
        discoveredEntries: Array.from(state.discoveredEntries?.entries?.() || []),
        readEntries: Array.from(state.readEntries || []),
        favoriteEntries: Array.from(state.favoriteEntries || []),
      }),
      deserialize: (value) => {
        const p = JSON.parse(value);
        return {
          ...p,
          discoveredEntries: new Map(p.discoveredEntries || []),
          readEntries: new Set(p.readEntries || []),
          favoriteEntries: new Set(p.favoriteEntries || []),
        };
      },
    },
  },
});
