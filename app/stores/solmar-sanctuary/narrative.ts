/**
 * Narrative Store
 * Handles game logs, story progression, and fog of war reveals
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { logger } from '~/shared/lib/logger';

// ============================================
// Types
// ============================================

export interface NarrativeEntry {
  id: number;
  timestamp: number;
  message: string;
  type: 'info' | 'warning' | 'error' | 'achievement' | 'lore';
}

// ============================================
// Store
// ============================================

export const useNarrativeStore = defineStore(
  'narrative',
  () => {
    // ============================================
    // State
    // ============================================

    const entries = ref<NarrativeEntry[]>([]);
    const maxEntries = ref(50);
    let nextId = 0;

    const totalGameTime = ref(0); // In seconds

    // ============================================
    // Computed
    // ============================================

    const latestEntries = computed(() => entries.value.slice(0, 10));

    const formattedGameTime = computed(() => {
      const hours = Math.floor(totalGameTime.value / 3600);
      const minutes = Math.floor((totalGameTime.value % 3600) / 60);
      const seconds = Math.floor(totalGameTime.value % 60);
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    });

    // ============================================
    // Actions
    // ============================================

    /**
     * Add a new log entry
     */
    function addLog(entry: Omit<NarrativeEntry, 'id' | 'timestamp'>) {
      const newEntry: NarrativeEntry = {
        ...entry,
        id: nextId++,
        timestamp: Date.now(),
      };

      entries.value.unshift(newEntry);

      // Trim to max entries
      if (entries.value.length > maxEntries.value) {
        entries.value = entries.value.slice(0, maxEntries.value);
      }

      logger.log(`[Narrative] ${entry.type}: ${entry.message}`);
    }

    /**
     * Update game time
     */
    function updateGameTime(deltaTime: number) {
      totalGameTime.value += deltaTime;
    }

    /**
     * Clear all entries
     */
    function clearLogs() {
      entries.value = [];
    }

    /**
     * Reset for prestige
     */
    function resetForPrestige() {
      entries.value = [];
      totalGameTime.value = 0;
      nextId = 0;
    }

    return {
      // State
      entries,
      totalGameTime,

      // Computed
      latestEntries,
      formattedGameTime,

      // Actions
      addLog,
      updateGameTime,
      clearLogs,
      resetForPrestige,
    };
  },
  {
    persist: {
      key: 'solmar-narrative',
      storage: typeof window !== 'undefined' ? localStorage : undefined,
      pick: ['totalGameTime'],
    },
  }
);

