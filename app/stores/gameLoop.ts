/**
 * Game Loop Store
 * Handles the main game loop, time tracking, auto-save, and offline progress
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useResourceStore } from './resources';
import { useEntityStore } from './entities';
import { useCombatStore } from './combat';

export const useGameLoopStore = defineStore('gameLoop', () => {
  // State
  const isRunning = ref(false);
  const isPaused = ref(false);
  const lastTickTime = ref(performance.now());
  const totalPlayTime = ref(0); // in seconds
  const tickCount = ref(0);
  const lastSaveTime = ref(Date.now());
  const autoSaveEnabled = ref(true);
  const lastAutoSaveDisplay = ref('');

  // Animation frame ID for cleanup
  let animationFrameId: number | null = null;
  let autoSaveIntervalId: ReturnType<typeof setInterval> | null = null;

  // Constants
  const TICK_RATE = 1000 / 60; // 60 FPS target
  const MAX_DELTA = 1; // Max 1 second per tick (prevents huge jumps)
  const OFFLINE_MAX_HOURS = 24; // Max offline progress
  const AUTO_SAVE_INTERVAL = 30000; // Auto-save every 30 seconds

  // Computed
  const formattedPlayTime = computed(() => {
    const hours = Math.floor(totalPlayTime.value / 3600);
    const minutes = Math.floor((totalPlayTime.value % 3600) / 60);
    const seconds = Math.floor(totalPlayTime.value % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  });

  /**
   * Main game loop - called every frame
   */
  function gameLoop(currentTime: number) {
    if (!isRunning.value || isPaused.value) {
      animationFrameId = requestAnimationFrame(gameLoop);
      return;
    }

    // Calculate delta time in seconds
    const rawDelta = (currentTime - lastTickTime.value) / 1000;
    const deltaTime = Math.min(rawDelta, MAX_DELTA);

    lastTickTime.value = currentTime;
    totalPlayTime.value += deltaTime;
    tickCount.value++;

    // Update all game systems
    tick(deltaTime);

    // Continue loop
    animationFrameId = requestAnimationFrame(gameLoop);
  }

  /**
   * Process one game tick
   */
  function tick(deltaTime: number) {
    const resourceStore = useResourceStore();
    const entityStore = useEntityStore();
    const combatStore = useCombatStore();

    // Update resources based on production
    resourceStore.tick(deltaTime);

    // Check for entity unlocks
    entityStore.checkUnlocks();

    // Update combat (threat, waves, morale)
    combatStore.tick(deltaTime);
  }

  /**
   * Save game state
   */
  function saveGame() {
    // Pinia persist handles the actual saving automatically
    // We just need to trigger the state update
    lastSaveTime.value = Date.now();
    lastAutoSaveDisplay.value = new Date().toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    console.log('[GameLoop] Game saved at', lastAutoSaveDisplay.value);
  }

  /**
   * Start auto-save timer
   */
  function startAutoSave() {
    if (autoSaveIntervalId !== null) return;

    autoSaveIntervalId = setInterval(() => {
      if (autoSaveEnabled.value && isRunning.value && !isPaused.value) {
        saveGame();
      }
    }, AUTO_SAVE_INTERVAL);

    // Initial save
    saveGame();

    console.log('[GameLoop] Auto-save started (every 30s)');
  }

  /**
   * Stop auto-save timer
   */
  function stopAutoSave() {
    if (autoSaveIntervalId !== null) {
      clearInterval(autoSaveIntervalId);
      autoSaveIntervalId = null;
    }
  }

  /**
   * Start the game loop
   */
  function start() {
    if (isRunning.value) return;

    isRunning.value = true;
    isPaused.value = false;
    lastTickTime.value = performance.now();

    animationFrameId = requestAnimationFrame(gameLoop);

    // Start auto-save
    startAutoSave();

    console.log('[GameLoop] Started');
  }

  /**
   * Stop the game loop
   */
  function stop() {
    isRunning.value = false;

    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }

    // Final save before stopping
    saveGame();

    // Stop auto-save
    stopAutoSave();

    console.log('[GameLoop] Stopped');
  }

  /**
   * Pause/Resume the game
   */
  function togglePause() {
    isPaused.value = !isPaused.value;

    if (!isPaused.value) {
      // Reset lastTickTime to prevent huge delta after unpause
      lastTickTime.value = performance.now();
    }

    console.log(`[GameLoop] ${isPaused.value ? 'Paused' : 'Resumed'}`);
  }

  /**
   * Calculate and apply offline progress
   */
  function processOfflineProgress(lastSaveTime: number) {
    const now = Date.now();
    const offlineSeconds = Math.min(
      (now - lastSaveTime) / 1000,
      OFFLINE_MAX_HOURS * 3600
    );

    if (offlineSeconds > 60) {
      // Only process if offline for more than 1 minute
      console.log(`[GameLoop] Processing ${offlineSeconds.toFixed(0)}s of offline progress`);

      const resourceStore = useResourceStore();

      // Apply offline progress at reduced efficiency (50%)
      const offlineEfficiency = 0.5;
      resourceStore.tick(offlineSeconds * offlineEfficiency);

      return {
        offlineTime: offlineSeconds,
        efficiency: offlineEfficiency,
      };
    }

    return null;
  }

  /**
   * Reset for prestige
   */
  function resetForPrestige() {
    totalPlayTime.value = 0;
    tickCount.value = 0;
  }

  return {
    // State
    isRunning,
    isPaused,
    totalPlayTime,
    tickCount,
    lastSaveTime,
    autoSaveEnabled,
    lastAutoSaveDisplay,

    // Computed
    formattedPlayTime,

    // Actions
    start,
    stop,
    togglePause,
    saveGame,
    processOfflineProgress,
    resetForPrestige,
  };
},
{
  persist: {
    key: 'solmar-gameloop',
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    pick: ['totalPlayTime', 'lastSaveTime', 'autoSaveEnabled'],
  },
});

