/**
 * Statistics Store
 * Tracks global and per-cycle statistics for analytics and history
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import Decimal from 'break_infinity.js';
import { bn, formatNumber } from '~/shared/lib/big-number';
import { logger } from '~/shared/lib/logger';
import { useResourceStore } from './resources';
import { useCombatStore } from './combat';
import { useEntityStore } from './entities';
import { usePrestigeStore } from './prestige';
import { useAchievementStore } from './achievements';

// Types
interface ProductionSample {
  timestamp: number;
  faith: number;
  ducats: number;
}

interface WaveRecord {
  waveNumber: number;
  enemyType: string;
  damage: number;
  losses: number;
  timestamp: number;
}

interface LiturgyRecord {
  liturgyId: string;
  uses: number;
  effectiveness: number; // Average damage/effect
}

interface PrestigeCycle {
  cycleNumber: number;
  startTime: number;
  endTime: number;
  duration: number; // in seconds
  totalFaithEarned: string; // Decimal as string
  wavesDefeated: number;
  buildingsBuilt: number;
  clicksMade: number;
  ashesEarned: number;
  peakFaithPerSecond: number;
}

interface GlobalStats {
  // Totals across all cycles
  totalFaithEarned: string; // Decimal as string for persistence
  totalDucatsEarned: string;
  totalPrestigeCount: number;
  totalAshesEarned: number;
  totalWavesDefeated: number;
  totalLosses: number;
  totalClicksMade: number;
  totalBuildingsBuilt: number;
  totalPlayTime: number; // in seconds

  // Records
  highestCombo: number;
  highestWave: number;
  fastestPrestige: number; // seconds to first prestige with >0 ashes
  peakFaithPerSecond: number;
  longestSession: number; // seconds
}

interface CycleStats {
  startTime: number;
  faithEarned: string;
  ducatsEarned: string;
  wavesDefeated: number;
  losses: number;
  clicksMade: number;
  buildingsBuilt: number;
  peakFaithPerSecond: number;
  currentCombo: number;
  highestCombo: number;
}

// Store cache to avoid repeated useStore() calls
let _resourceStore: ReturnType<typeof useResourceStore> | null = null;
let _combatStore: ReturnType<typeof useCombatStore> | null = null;
let _entityStore: ReturnType<typeof useEntityStore> | null = null;
let _prestigeStore: ReturnType<typeof usePrestigeStore> | null = null;
let _achievementStore: ReturnType<typeof useAchievementStore> | null = null;

function getResourceStore() {
  if (!_resourceStore) {
    _resourceStore = useResourceStore();
  }
  return _resourceStore!;
}

function getCombatStore() {
  if (!_combatStore) {
    _combatStore = useCombatStore();
  }
  return _combatStore!;
}

function getEntityStore() {
  if (!_entityStore) {
    _entityStore = useEntityStore();
  }
  return _entityStore!;
}

function getPrestigeStore() {
  if (!_prestigeStore) {
    _prestigeStore = usePrestigeStore();
  }
  return _prestigeStore!;
}

function getAchievementStore() {
  if (!_achievementStore) {
    _achievementStore = useAchievementStore();
  }
  return _achievementStore!;
}

export const useStatisticsStore = defineStore(
  'statistics',
  () => {
    // ============================================
    // State - Global Statistics
    // ============================================
    const globalStats = ref<GlobalStats>({
      totalFaithEarned: '0',
      totalDucatsEarned: '0',
      totalPrestigeCount: 0,
      totalAshesEarned: 0,
      totalWavesDefeated: 0,
      totalLosses: 0,
      totalClicksMade: 0,
      totalBuildingsBuilt: 0,
      totalPlayTime: 0,
      highestCombo: 0,
      highestWave: 0,
      fastestPrestige: 0,
      peakFaithPerSecond: 0,
      longestSession: 0,
    });

    // ============================================
    // State - Current Cycle Statistics
    // ============================================
    const cycleStats = ref<CycleStats>({
      startTime: Date.now(),
      faithEarned: '0',
      ducatsEarned: '0',
      wavesDefeated: 0,
      losses: 0,
      clicksMade: 0,
      buildingsBuilt: 0,
      peakFaithPerSecond: 0,
      currentCombo: 0,
      highestCombo: 0,
    });

    // ============================================
    // State - Production History (for charts)
    // ============================================
    const productionHistory = ref<ProductionSample[]>([]);
    const HISTORY_MAX_SAMPLES = 288; // 24 hours at 5-minute intervals
    const SAMPLE_INTERVAL = 5 * 60 * 1000; // 5 minutes
    let lastSampleTime = 0;

    // ============================================
    // State - Wave History
    // ============================================
    const waveHistory = ref<WaveRecord[]>([]);
    const MAX_WAVE_HISTORY = 100;

    // ============================================
    // State - Liturgy Usage
    // ============================================
    const liturgyUsage = ref<Record<string, LiturgyRecord>>({});

    // ============================================
    // State - Prestige Cycle History
    // ============================================
    const prestigeHistory = ref<PrestigeCycle[]>([]);
    const MAX_PRESTIGE_HISTORY = 50;

    // ============================================
    // State - Session tracking
    // ============================================
    const sessionStartTime = ref(Date.now());
    const currentSessionDuration = ref(0);

    // ============================================
    // Computed - Formatted Statistics
    // ============================================
    const formattedGlobalStats = computed(() => ({
      totalFaith: formatNumber(bn(globalStats.value.totalFaithEarned)),
      totalDucats: formatNumber(bn(globalStats.value.totalDucatsEarned)),
      totalPrestige: globalStats.value.totalPrestigeCount,
      totalAshes: formatNumber(bn(globalStats.value.totalAshesEarned)),
      totalWaves: globalStats.value.totalWavesDefeated,
      totalLosses: globalStats.value.totalLosses,
      totalClicks: formatNumber(bn(globalStats.value.totalClicksMade)),
      totalBuildings: globalStats.value.totalBuildingsBuilt,
      totalPlayTime: formatDuration(globalStats.value.totalPlayTime),
      highestCombo: globalStats.value.highestCombo,
      highestWave: globalStats.value.highestWave,
      fastestPrestige: formatDuration(globalStats.value.fastestPrestige),
      peakFaithPerSecond: formatNumber(bn(globalStats.value.peakFaithPerSecond)),
      longestSession: formatDuration(globalStats.value.longestSession),
    }));

    const formattedCycleStats = computed(() => ({
      duration: formatDuration((Date.now() - cycleStats.value.startTime) / 1000),
      faithEarned: formatNumber(bn(cycleStats.value.faithEarned)),
      ducatsEarned: formatNumber(bn(cycleStats.value.ducatsEarned)),
      wavesDefeated: cycleStats.value.wavesDefeated,
      losses: cycleStats.value.losses,
      clicks: cycleStats.value.clicksMade,
      buildings: cycleStats.value.buildingsBuilt,
      peakFps: formatNumber(bn(cycleStats.value.peakFaithPerSecond)),
      currentCombo: cycleStats.value.currentCombo,
      highestCombo: cycleStats.value.highestCombo,
    }));

    // Current production rates
    const currentFaithPerSecond = computed(() => {
      const resourceStore = getResourceStore();
      return resourceStore.resources.faith.perSecond.toNumber();
    });

    const currentFaithPerMinute = computed(() => currentFaithPerSecond.value * 60);
    const currentFaithPerHour = computed(() => currentFaithPerSecond.value * 3600);

    // Building efficiency ranking
    const buildingEfficiency = computed(() => {
      const entityStore = getEntityStore();
      const buildings: Array<{
        id: string;
        name: string;
        count: number;
        production: number;
        efficiency: number; // production per building
      }> = [];

      for (const entity of Object.values(entityStore.entities)) {
        if (entity.count > 0 && entity.production.faith) {
          const production = entity.production.faith.toNumber() * entity.count;
          buildings.push({
            id: entity.id,
            name: entity.name,
            count: entity.count,
            production,
            efficiency: entity.production.faith.toNumber(),
          });
        }
      }

      return buildings.sort((a, b) => b.production - a.production);
    });

    // ============================================
    // Actions - Tracking
    // ============================================

    /**
     * Called every game tick to track statistics
     */
    function tick(deltaTime: number) {
      const resourceStore = getResourceStore();
      const combatStore = getCombatStore();

      // Update session duration
      currentSessionDuration.value = (Date.now() - sessionStartTime.value) / 1000;
      globalStats.value.totalPlayTime += deltaTime;

      // Track peak faith per second
      const currentFps = resourceStore.resources.faith.perSecond.toNumber();
      if (currentFps > cycleStats.value.peakFaithPerSecond) {
        cycleStats.value.peakFaithPerSecond = currentFps;
      }
      if (currentFps > globalStats.value.peakFaithPerSecond) {
        globalStats.value.peakFaithPerSecond = currentFps;
      }

      // Track combo
      cycleStats.value.currentCombo = combatStore.combo;
      if (combatStore.combo > cycleStats.value.highestCombo) {
        cycleStats.value.highestCombo = combatStore.combo;
      }
      if (combatStore.combo > globalStats.value.highestCombo) {
        globalStats.value.highestCombo = combatStore.combo;
      }

      // Sample production for history (every 5 minutes)
      const now = Date.now();
      if (now - lastSampleTime >= SAMPLE_INTERVAL) {
        lastSampleTime = now;
        productionHistory.value.push({
          timestamp: now,
          faith: currentFps,
          ducats: resourceStore.resources.ducats.perSecond.toNumber(),
        });

        // Trim old samples
        if (productionHistory.value.length > HISTORY_MAX_SAMPLES) {
          productionHistory.value = productionHistory.value.slice(-HISTORY_MAX_SAMPLES);
        }
      }

      // Update longest session
      if (currentSessionDuration.value > globalStats.value.longestSession) {
        globalStats.value.longestSession = currentSessionDuration.value;
      }
    }

    /**
     * Track faith earned
     */
    function trackFaithEarned(amount: Decimal) {
      const current = bn(cycleStats.value.faithEarned);
      cycleStats.value.faithEarned = current.add(amount).toString();

      const globalCurrent = bn(globalStats.value.totalFaithEarned);
      globalStats.value.totalFaithEarned = globalCurrent.add(amount).toString();
    }

    /**
     * Track ducats earned
     */
    function trackDucatsEarned(amount: Decimal) {
      const current = bn(cycleStats.value.ducatsEarned);
      cycleStats.value.ducatsEarned = current.add(amount).toString();

      const globalCurrent = bn(globalStats.value.totalDucatsEarned);
      globalStats.value.totalDucatsEarned = globalCurrent.add(amount).toString();
    }

    /**
     * Track click
     */
    function trackClick() {
      cycleStats.value.clicksMade++;
      globalStats.value.totalClicksMade++;
    }

    /**
     * Track building purchase
     */
    function trackBuildingPurchase(count: number = 1) {
      cycleStats.value.buildingsBuilt += count;
      globalStats.value.totalBuildingsBuilt += count;
    }

    /**
     * Track wave completion
     */
    function trackWaveCompleted(
      waveNumber: number,
      enemyType: string,
      damage: number,
      losses: number
    ) {
      cycleStats.value.wavesDefeated++;
      cycleStats.value.losses += losses;
      globalStats.value.totalWavesDefeated++;
      globalStats.value.totalLosses += losses;

      // Update highest wave
      if (waveNumber > globalStats.value.highestWave) {
        globalStats.value.highestWave = waveNumber;
      }

      // Add to wave history
      waveHistory.value.push({
        waveNumber,
        enemyType,
        damage,
        losses,
        timestamp: Date.now(),
      });

      // Trim old history
      if (waveHistory.value.length > MAX_WAVE_HISTORY) {
        waveHistory.value = waveHistory.value.slice(-MAX_WAVE_HISTORY);
      }
    }

    /**
     * Track liturgy usage
     */
    function trackLiturgyUsed(liturgyId: string, effectiveness: number) {
      if (!liturgyUsage.value[liturgyId]) {
        liturgyUsage.value[liturgyId] = {
          liturgyId,
          uses: 0,
          effectiveness: 0,
        };
      }

      const record = liturgyUsage.value[liturgyId];
      const totalEffectiveness = record.effectiveness * record.uses + effectiveness;
      record.uses++;
      record.effectiveness = totalEffectiveness / record.uses;
    }

    /**
     * Called when prestige is performed
     */
    function onPrestige(ashesEarned: number) {
      const cycleDuration = (Date.now() - cycleStats.value.startTime) / 1000;

      // Save cycle to history
      prestigeHistory.value.push({
        cycleNumber: globalStats.value.totalPrestigeCount + 1,
        startTime: cycleStats.value.startTime,
        endTime: Date.now(),
        duration: cycleDuration,
        totalFaithEarned: cycleStats.value.faithEarned,
        wavesDefeated: cycleStats.value.wavesDefeated,
        buildingsBuilt: cycleStats.value.buildingsBuilt,
        clicksMade: cycleStats.value.clicksMade,
        ashesEarned,
        peakFaithPerSecond: cycleStats.value.peakFaithPerSecond,
      });

      // Trim old history
      if (prestigeHistory.value.length > MAX_PRESTIGE_HISTORY) {
        prestigeHistory.value = prestigeHistory.value.slice(-MAX_PRESTIGE_HISTORY);
      }

      // Update global stats
      globalStats.value.totalPrestigeCount++;
      globalStats.value.totalAshesEarned += ashesEarned;

      // Track fastest prestige (if meaningful - at least 1 ash)
      if (
        ashesEarned > 0 &&
        (globalStats.value.fastestPrestige === 0 ||
          cycleDuration < globalStats.value.fastestPrestige)
      ) {
        globalStats.value.fastestPrestige = cycleDuration;
      }

      logger.log(`[Statistics] Prestige #${globalStats.value.totalPrestigeCount} recorded: ${ashesEarned} ashes, ${formatDuration(cycleDuration)}`);

      // Reset cycle stats
      resetCycleStats();
    }

    /**
     * Reset cycle statistics (called on prestige)
     */
    function resetCycleStats() {
      cycleStats.value = {
        startTime: Date.now(),
        faithEarned: '0',
        ducatsEarned: '0',
        wavesDefeated: 0,
        losses: 0,
        clicksMade: 0,
        buildingsBuilt: 0,
        peakFaithPerSecond: 0,
        currentCombo: 0,
        highestCombo: 0,
      };

      // Clear liturgy usage for new cycle
      liturgyUsage.value = {};
    }

    /**
     * Get production history for chart (last N hours)
     */
    function getProductionHistory(hours: number = 24) {
      const cutoff = Date.now() - hours * 60 * 60 * 1000;
      return productionHistory.value.filter((s) => s.timestamp >= cutoff);
    }

    /**
     * Get average production over time period
     */
    function getAverageProduction(hours: number = 1) {
      const samples = getProductionHistory(hours);
      if (samples.length === 0) return { faith: 0, ducats: 0 };

      const totalFaith = samples.reduce((sum, s) => sum + s.faith, 0);
      const totalDucats = samples.reduce((sum, s) => sum + s.ducats, 0);

      return {
        faith: totalFaith / samples.length,
        ducats: totalDucats / samples.length,
      };
    }

    /**
     * Export statistics as JSON string
     */
    function exportStats(): string {
      return JSON.stringify(
        {
          exportTime: new Date().toISOString(),
          global: globalStats.value,
          currentCycle: cycleStats.value,
          prestigeHistory: prestigeHistory.value,
        },
        null,
        2
      );
    }

    // ============================================
    // Utility Functions
    // ============================================

    function formatDuration(seconds: number): string {
      if (seconds === 0) return '-';

      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);

      if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`;
      } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
      } else {
        return `${secs}s`;
      }
    }

    return {
      // State
      globalStats,
      cycleStats,
      productionHistory,
      waveHistory,
      liturgyUsage,
      prestigeHistory,
      sessionStartTime,
      currentSessionDuration,

      // Computed
      formattedGlobalStats,
      formattedCycleStats,
      currentFaithPerSecond,
      currentFaithPerMinute,
      currentFaithPerHour,
      buildingEfficiency,

      // Actions
      tick,
      trackFaithEarned,
      trackDucatsEarned,
      trackClick,
      trackBuildingPurchase,
      trackWaveCompleted,
      trackLiturgyUsed,
      onPrestige,
      resetCycleStats,
      getProductionHistory,
      getAverageProduction,
      exportStats,

      // Utilities
      formatDuration,
    };
  },
  {
    persist: {
      key: 'solmar-statistics',
      pick: [
        'globalStats',
        'cycleStats',
        'productionHistory',
        'waveHistory',
        'liturgyUsage',
        'prestigeHistory',
      ],
    },
  }
);

