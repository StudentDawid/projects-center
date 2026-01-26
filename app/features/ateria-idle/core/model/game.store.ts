/**
 * Main game store for Ateria Idle
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { bn, type Decimal } from '~/shared/lib/big-number';
import type {
  GameState,
  GameSettings,
  FeatureId,
  GameNotification,
  LegacyUpgrade,
  PrestigeGate,
  PrestigeGateId,
} from '~/entities/ateria-idle/game';

const SAVE_VERSION = '0.1.0';
const DEFAULT_SETTINGS: GameSettings = {
  autoSaveInterval: 30,
  notificationsEnabled: true,
  soundEnabled: true,
  musicEnabled: true,
  showDamageNumbers: true,
  compactMode: false,
};

export const useAteriaGameStore = defineStore('ateria-game', () => {
  // ============================================
  // STATE
  // ============================================

  // Meta
  const version = ref(SAVE_VERSION);
  const lastSave = ref(Date.now());
  const lastLogout = ref(Date.now());
  const totalPlaytime = ref(0);
  const tickCount = ref(0);

  // Tutorial
  const tutorialStep = ref(0);
  const tutorialCompleted = ref(false);
  const unlockedFeatures = ref<Set<FeatureId>>(new Set(['warrior']));

  // Prestige
  const prestigeCount = ref(0);
  const legacyPoints = ref(0);
  const spentLegacyPoints = ref(0);
  const legacyUpgrades = ref<LegacyUpgrade[]>([]);

  // Settings
  const settings = ref<GameSettings>({ ...DEFAULT_SETTINGS });

  // Notifications
  const notifications = ref<GameNotification[]>([]);
  const notificationIdCounter = ref(0);

  // Game state
  const isPaused = ref(false);
  const isOfflineModalOpen = ref(false);

  // ============================================
  // COMPUTED
  // ============================================

  const availableLegacyPoints = computed(() => legacyPoints.value - spentLegacyPoints.value);

  const canPrestige = computed(() => {
    return prestigeGates.value.some(gate => gate.condition());
  });

  const prestigeGates = computed<PrestigeGate[]>(() => [
    {
      id: 'dungeon_master' as PrestigeGateId,
      name: 'Mistrz Lochów',
      description: 'Ukończ loch poziomu 3',
      condition: () => false, // TODO: Implement dungeon check
      progress: () => 0,
    },
    {
      id: 'trading_empire' as PrestigeGateId,
      name: 'Imperium Handlowe',
      description: 'Zgromadź 500,000 złota',
      condition: () => false, // TODO: Check gold
      progress: () => 0,
    },
    {
      id: 'scientific_breakthrough' as PrestigeGateId,
      name: 'Przełom Naukowy',
      description: 'Odblokuj Blue Flasks',
      condition: () => false, // TODO: Check research
      progress: () => 0,
    },
    {
      id: 'trinity_balance' as PrestigeGateId,
      name: 'Równowaga Trójcy',
      description: 'Wszystkie ścieżki na poziomie 30+',
      condition: () => false, // TODO: Check all paths
      progress: () => 0,
    },
  ]);

  const estimatedLegacyPoints = computed(() => {
    // TODO: Calculate based on current progress
    return 0;
  });

  // ============================================
  // ACTIONS
  // ============================================

  function unlockFeature(featureId: FeatureId) {
    if (!unlockedFeatures.value.has(featureId)) {
      unlockedFeatures.value.add(featureId);
      addNotification({
        type: 'success',
        title: 'Nowa funkcja odblokowana!',
        message: getFeatureName(featureId),
        icon: 'mdi-star',
      });
    }
  }

  function isFeatureUnlocked(featureId: FeatureId): boolean {
    return unlockedFeatures.value.has(featureId);
  }

  function getFeatureName(featureId: FeatureId): string {
    const names: Record<FeatureId, string> = {
      warrior: 'Wojownik',
      scientist: 'Naukowiec',
      merchant: 'Handlarz',
      alchemy: 'Alchemia',
      golems: 'Golemancja',
      tradeRoutes: 'Szlaki Handlowe',
      dungeons: 'Lochy',
      prestige: 'Dziedzictwo',
    };
    return names[featureId] || featureId;
  }

  // Notifications
  function addNotification(notification: Omit<GameNotification, 'id' | 'timestamp'>) {
    if (!settings.value.notificationsEnabled) return;

    const id = `notification-${++notificationIdCounter.value}`;
    const newNotification: GameNotification = {
      ...notification,
      id,
      timestamp: Date.now(),
      duration: notification.duration ?? 5000,
    };

    notifications.value.push(newNotification);

    // Auto-remove after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
  }

  function removeNotification(id: string) {
    const index = notifications.value.findIndex(n => n.id === id);
    if (index !== -1) {
      notifications.value.splice(index, 1);
    }
  }

  function clearAllNotifications() {
    notifications.value = [];
  }

  // Tutorial
  function advanceTutorial() {
    tutorialStep.value++;
  }

  function completeTutorial() {
    tutorialCompleted.value = true;
  }

  function skipTutorial() {
    tutorialCompleted.value = true;
    tutorialStep.value = 999;
  }

  // Settings
  function updateSettings(newSettings: Partial<GameSettings>) {
    settings.value = { ...settings.value, ...newSettings };
  }

  // Prestige
  function performPrestige() {
    if (!canPrestige.value) return;

    const earnedLP = estimatedLegacyPoints.value;
    legacyPoints.value += earnedLP;
    prestigeCount.value++;

    // Reset game state (keep legacy)
    // TODO: Reset other stores

    addNotification({
      type: 'success',
      title: 'Emerytura zakończona!',
      message: `Zdobyto ${earnedLP} Punktów Dziedzictwa`,
      icon: 'mdi-crown',
      duration: 10000,
    });
  }

  function purchaseLegacyUpgrade(upgradeId: string) {
    const upgrade = legacyUpgrades.value.find(u => u.id === upgradeId);
    if (!upgrade) return false;

    if (upgrade.currentLevel >= upgrade.maxLevel) return false;
    if (availableLegacyPoints.value < upgrade.cost) return false;

    // Check requirements
    if (upgrade.requires) {
      const hasAllRequirements = upgrade.requires.every(reqId => {
        const req = legacyUpgrades.value.find(u => u.id === reqId);
        return req && req.currentLevel > 0;
      });
      if (!hasAllRequirements) return false;
    }

    spentLegacyPoints.value += upgrade.cost;
    upgrade.currentLevel++;

    return true;
  }

  // Game loop
  function tick() {
    if (isPaused.value) return;
    tickCount.value++;
  }

  function pause() {
    isPaused.value = true;
  }

  function resume() {
    isPaused.value = false;
  }

  // Save/Load
  function getState(): GameState {
    return {
      version: version.value,
      lastSave: Date.now(),
      lastLogout: lastLogout.value,
      totalPlaytime: totalPlaytime.value,
      tickCount: tickCount.value,
      tutorialStep: tutorialStep.value,
      tutorialCompleted: tutorialCompleted.value,
      unlockedFeatures: unlockedFeatures.value,
      prestigeCount: prestigeCount.value,
      legacyPoints: legacyPoints.value,
      legacyUpgrades: legacyUpgrades.value,
      settings: settings.value,
    };
  }

  function loadState(state: Partial<GameState>) {
    if (state.version) version.value = state.version;
    if (state.lastSave) lastSave.value = state.lastSave;
    if (state.lastLogout) lastLogout.value = state.lastLogout;
    if (state.totalPlaytime) totalPlaytime.value = state.totalPlaytime;
    if (state.tickCount) tickCount.value = state.tickCount;
    if (state.tutorialStep) tutorialStep.value = state.tutorialStep;
    if (state.tutorialCompleted !== undefined) tutorialCompleted.value = state.tutorialCompleted;
    if (state.unlockedFeatures) unlockedFeatures.value = new Set(state.unlockedFeatures);
    if (state.prestigeCount) prestigeCount.value = state.prestigeCount;
    if (state.legacyPoints) legacyPoints.value = state.legacyPoints;
    if (state.legacyUpgrades) legacyUpgrades.value = state.legacyUpgrades;
    if (state.settings) settings.value = { ...DEFAULT_SETTINGS, ...state.settings };
  }

  function resetGame() {
    version.value = SAVE_VERSION;
    lastSave.value = Date.now();
    lastLogout.value = Date.now();
    totalPlaytime.value = 0;
    tickCount.value = 0;
    tutorialStep.value = 0;
    tutorialCompleted.value = false;
    unlockedFeatures.value = new Set(['warrior']);
    prestigeCount.value = 0;
    legacyPoints.value = 0;
    spentLegacyPoints.value = 0;
    legacyUpgrades.value = [];
    settings.value = { ...DEFAULT_SETTINGS };
    notifications.value = [];
  }

  return {
    // State
    version,
    lastSave,
    lastLogout,
    totalPlaytime,
    tickCount,
    tutorialStep,
    tutorialCompleted,
    unlockedFeatures,
    prestigeCount,
    legacyPoints,
    spentLegacyPoints,
    legacyUpgrades,
    settings,
    notifications,
    isPaused,
    isOfflineModalOpen,

    // Computed
    availableLegacyPoints,
    canPrestige,
    prestigeGates,
    estimatedLegacyPoints,

    // Actions
    unlockFeature,
    isFeatureUnlocked,
    addNotification,
    removeNotification,
    clearAllNotifications,
    advanceTutorial,
    completeTutorial,
    skipTutorial,
    updateSettings,
    performPrestige,
    purchaseLegacyUpgrade,
    tick,
    pause,
    resume,
    getState,
    loadState,
    resetGame,
  };
}, {
  persist: {
    key: 'ateria-game',
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    pick: [
      'version',
      'lastSave',
      'lastLogout',
      'totalPlaytime',
      'tickCount',
      'tutorialStep',
      'tutorialCompleted',
      'prestigeCount',
      'legacyPoints',
      'spentLegacyPoints',
      'settings',
    ],
    serializer: {
      serialize: (state) => {
        return JSON.stringify({
          ...state,
          unlockedFeatures: Array.from(state.unlockedFeatures || []),
        });
      },
      deserialize: (value) => {
        const parsed = JSON.parse(value);
        return {
          ...parsed,
          unlockedFeatures: new Set(parsed.unlockedFeatures || ['warrior']),
        };
      },
    },
  },
});
