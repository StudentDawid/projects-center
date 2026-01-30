<script setup lang="ts">
/**
 * Ateria Idle - Main Game Page
 */

import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useAteriaGameStore } from '~/features/ateria-idle/core/model/game.store';
import { useAteriaResourcesStore } from '~/features/ateria-idle/core/model/resources.store';
import { useAteriaWarriorStore } from '~/features/ateria-idle/warrior/model/warrior.store';
import { useAteriaInventoryStore } from '~/features/ateria-idle/warrior/model/inventory.store';
import { useAteriaMerchantStore } from '~/features/ateria-idle/merchant/model/merchant.store';
import { useAteriaScientistStore } from '~/features/ateria-idle/scientist/model/scientist.store';
import type { OfflineReport } from '~/entities/ateria-idle/game';

// Components
import AteriaResourceBar from '~/features/ateria-idle/core/ui/ResourceBar.vue';
import AteriaWarriorPanel from '~/features/ateria-idle/warrior/ui/WarriorPanel.vue';
import AteriaEquipmentPanel from '~/features/ateria-idle/warrior/ui/EquipmentPanel.vue';
import AteriaDungeonPanel from '~/features/ateria-idle/warrior/ui/DungeonPanel.vue';
import AteriaSlayerPanel from '~/features/ateria-idle/warrior/ui/SlayerPanel.vue';
import AteriaLoadoutPanel from '~/features/ateria-idle/warrior/ui/LoadoutPanel.vue';
import AteriaMerchantPanel from '~/features/ateria-idle/merchant/ui/MerchantPanel.vue';
import AteriaCaravanPanel from '~/features/ateria-idle/merchant/ui/CaravanPanel.vue';
import AteriaScientistPanel from '~/features/ateria-idle/scientist/ui/ScientistPanel.vue';
import AteriaGolemPanel from '~/features/ateria-idle/scientist/ui/GolemPanel.vue';
import AteriaNotifications from '~/features/ateria-idle/core/ui/Notifications.vue';
import AteriaOfflineProgressModal from '~/features/ateria-idle/core/ui/OfflineProgressModal.vue';
import AteriaAchievementsPanel from '~/features/ateria-idle/core/ui/AchievementsPanel.vue';
import AteriaPrestigePanel from '~/features/ateria-idle/core/ui/PrestigePanel.vue';
import AteriaEventsPanel from '~/features/ateria-idle/core/ui/EventsPanel.vue';
import AteriaSettingsPanel from '~/features/ateria-idle/core/ui/SettingsPanel.vue';
import AteriaStatsPanel from '~/features/ateria-idle/core/ui/StatsPanel.vue';
import AteriaIntegrationPanel from '~/features/ateria-idle/core/ui/IntegrationPanel.vue';
import AteriaGatheringPanel from '~/features/ateria-idle/gathering/ui/GatheringPanel.vue';
import AteriaCraftingPanel from '~/features/ateria-idle/crafting/ui/CraftingPanel.vue';
import AteriaDiplomatPanel from '~/features/ateria-idle/diplomat/ui/DiplomatPanel.vue';
import AteriaDruidPanel from '~/features/ateria-idle/druid/ui/DruidPanel.vue';
import AteriaMysticPanel from '~/features/ateria-idle/mystic/ui/MysticPanel.vue';
import AteriaChefPanel from '~/features/ateria-idle/chef/ui/ChefPanel.vue';
import AteriaFishermanPanel from '~/features/ateria-idle/fisherman/ui/FishermanPanel.vue';
import AteriaWizardPanel from '~/features/ateria-idle/wizard/ui/WizardPanel.vue';
import AteriaExplorerPanel from '~/features/ateria-idle/explorer/ui/ExplorerPanel.vue';
import AteriaBardPanel from '~/features/ateria-idle/bard/ui/BardPanel.vue';
import AteriaAlchemistPanel from '~/features/ateria-idle/alchemist/ui/AlchemistPanel.vue';
import AteriaArchitectPanel from '~/features/ateria-idle/architect/ui/ArchitectPanel.vue';
import AteriaSpyPanel from '~/features/ateria-idle/spy/ui/SpyPanel.vue';
import AteriaTamerPanel from '~/features/ateria-idle/tamer/ui/TamerPanel.vue';
import AteriaPriestPanel from '~/features/ateria-idle/priest/ui/PriestPanel.vue';
import AteriaTownshipPanel from '~/features/ateria-idle/township/ui/TownshipPanel.vue';
import AteriaQuestsPanel from '~/features/ateria-idle/quests/ui/QuestsPanel.vue';
import AteriaWorldBossesPanel from '~/features/ateria-idle/world-bosses/ui/WorldBossesPanel.vue';
import AteriaSynergiesPanel from '~/features/ateria-idle/synergies/ui/SynergiesPanel.vue';
import AteriaExplorationPanel from '~/features/ateria-idle/exploration/ui/ExplorationPanel.vue';
import AteriaCodexPanel from '~/features/ateria-idle/codex/ui/CodexPanel.vue';
import AteriaReputationPanel from '~/features/ateria-idle/reputation/ui/ReputationPanel.vue';
import AteriaCalendarPanel from '~/features/ateria-idle/calendar/ui/CalendarPanel.vue';
import AteriaCompanionsPanel from '~/features/ateria-idle/companions/ui/CompanionsPanel.vue';
import AteriaMinigamesPanel from '~/features/ateria-idle/minigames/ui/MinigamesPanel.vue';
import { useAteriaAchievementsStore } from '~/features/ateria-idle/core/model/achievements.store';
import { useAteriaPrestigeStore } from '~/features/ateria-idle/core/model/prestige.store';
import { useAteriaEventsStore } from '~/features/ateria-idle/core/model/events.store';
import { useAteriaIntegrationStore } from '~/features/ateria-idle/core/model/integration.store';
import { useAteriaGatheringStore } from '~/features/ateria-idle/gathering/model/gathering.store';
import { useAteriaCraftingStore } from '~/features/ateria-idle/crafting/model/crafting.store';
import { useAteriaDiplomatStore } from '~/features/ateria-idle/diplomat/model/diplomat.store';
import { useAteriaDruidStore } from '~/features/ateria-idle/druid/model/druid.store';
import { useAteriaMysticStore } from '~/features/ateria-idle/mystic/model/mystic.store';
import { useAteriaChefStore } from '~/features/ateria-idle/chef/model/chef.store';
import { useAteriaFishermanStore } from '~/features/ateria-idle/fisherman/model/fisherman.store';
import { useAteriaWizardStore } from '~/features/ateria-idle/wizard/model/wizard.store';
import { useAteriaExplorerStore } from '~/features/ateria-idle/explorer/model/explorer.store';
import { useAteriaBardStore } from '~/features/ateria-idle/bard/model/bard.store';
import { useAteriaAlchemistStore } from '~/features/ateria-idle/alchemist/model/alchemist.store';
import { useAteriaArchitectStore } from '~/features/ateria-idle/architect/model/architect.store';
import { useAteriaSpyStore } from '~/features/ateria-idle/spy/model/spy.store';
import { useAteriaTamerStore } from '~/features/ateria-idle/tamer/model/tamer.store';
import { useAteriaPriestStore } from '~/features/ateria-idle/priest/model/priest.store';
import { useAteriaTownshipStore } from '~/features/ateria-idle/township/model/township.store';
import { useAteriaQuestsStore } from '~/features/ateria-idle/quests/model/quests.store';
import { useAteriaWorldBossesStore } from '~/features/ateria-idle/world-bosses/model/world-bosses.store';
import { useAteriaSynergiesStore } from '~/features/ateria-idle/synergies/model/synergies.store';
import { useAteriaExplorationStore } from '~/features/ateria-idle/exploration/model/exploration.store';
import { useAteriaCodexStore } from '~/features/ateria-idle/codex/model/codex.store';
import { useAteriaReputationStore } from '~/features/ateria-idle/reputation/model/reputation.store';
import { useAteriaCalendarStore } from '~/features/ateria-idle/calendar/model/calendar.store';
import { useAteriaCompanionsStore } from '~/features/ateria-idle/companions/model/companions.store';
import { useAteriaMinigamesStore } from '~/features/ateria-idle/minigames/model/minigames.store';

// Stores
const gameStore = useAteriaGameStore();
const resourcesStore = useAteriaResourcesStore();
const warriorStore = useAteriaWarriorStore();
const inventoryStore = useAteriaInventoryStore();
const merchantStore = useAteriaMerchantStore();
const scientistStore = useAteriaScientistStore();
const achievementsStore = useAteriaAchievementsStore();
const prestigeStore = useAteriaPrestigeStore();
const eventsStore = useAteriaEventsStore();
const integrationStore = useAteriaIntegrationStore();
const gatheringStore = useAteriaGatheringStore();
const craftingStore = useAteriaCraftingStore();
const diplomatStore = useAteriaDiplomatStore();
const druidStore = useAteriaDruidStore();
const mysticStore = useAteriaMysticStore();
const chefStore = useAteriaChefStore();
const fishermanStore = useAteriaFishermanStore();
const wizardStore = useAteriaWizardStore();
const explorerStore = useAteriaExplorerStore();
const bardStore = useAteriaBardStore();
const alchemistStore = useAteriaAlchemistStore();
const architectStore = useAteriaArchitectStore();
const spyStore = useAteriaSpyStore();
const tamerStore = useAteriaTamerStore();
const priestStore = useAteriaPriestStore();
const townshipStore = useAteriaTownshipStore();
const questsStore = useAteriaQuestsStore();
const worldBossesStore = useAteriaWorldBossesStore();
const synergiesStore = useAteriaSynergiesStore();
const explorationStore = useAteriaExplorationStore();
const codexStore = useAteriaCodexStore();
const reputationStore = useAteriaReputationStore();
const calendarStore = useAteriaCalendarStore();
const companionsStore = useAteriaCompanionsStore();
const minigamesStore = useAteriaMinigamesStore();

// Sync equipment bonuses when equipped items change
watch(
  () => inventoryStore.totalEquipmentStats,
  (newStats) => {
    warriorStore.updateEquipmentBonuses(newStats);
  },
  { immediate: true, deep: true }
);

// Game loop
const TICK_RATE = 100; // 10 ticks per second
const MAX_OFFLINE_HOURS = 24;
let gameLoopInterval: ReturnType<typeof setInterval> | null = null;
let lastTickTime = Date.now();

// Navigation
const activeTab = ref<'warrior' | 'scientist' | 'merchant' | 'gathering' | 'crafting' | 'diplomat' | 'druid' | 'mystic' | 'chef' | 'fisherman' | 'wizard' | 'explorer' | 'bard' | 'alchemist' | 'architect' | 'spy' | 'tamer' | 'priest' | 'township' | 'quests' | 'world_bosses' | 'synergies' | 'exploration' | 'codex' | 'reputation' | 'calendar' | 'companions' | 'minigames' | 'achievements' | 'prestige' | 'events' | 'stats' | 'settings' | 'integration'>('warrior');
const warriorSubTab = ref<'combat' | 'equipment' | 'dungeon' | 'slayer' | 'loadout'>('combat');
const merchantSubTab = ref<'shop' | 'caravans'>('shop');
const scientistSubTab = ref<'main' | 'golems'>('main');

// Offline progress
const showOfflineModal = ref(false);
const offlineReport = ref<OfflineReport | null>(null);

// Unlock requirements
const UNLOCK_REQUIREMENTS = {
  scientist: { warriorLevel: 5, label: 'Wojownik Lvl 5' },
  merchant: { warriorLevel: 10, label: 'Wojownik Lvl 10' },
} as const;

// Check and unlock features based on progress
watch(
  () => warriorStore.stats.level,
  (newLevel) => {
    // Unlock scientist at warrior level 5
    if (newLevel >= UNLOCK_REQUIREMENTS.scientist.warriorLevel && !gameStore.isFeatureUnlocked('scientist')) {
      gameStore.unlockFeature('scientist');
    }
    // Unlock merchant at warrior level 10
    if (newLevel >= UNLOCK_REQUIREMENTS.merchant.warriorLevel && !gameStore.isFeatureUnlocked('merchant')) {
      gameStore.unlockFeature('merchant');
    }
  },
  { immediate: true }
);

// Navigation items with unlock progress
const navItems = computed(() => [
  {
    id: 'warrior' as const,
    label: 'Wojownik',
    icon: 'mdi-sword',
    unlocked: true, // Always unlocked
    level: warriorStore.stats.level,
    progress: null,
    requirement: null,
  },
  {
    id: 'scientist' as const,
    label: 'Naukowiec',
    icon: 'mdi-flask',
    unlocked: gameStore.isFeatureUnlocked('scientist'),
    level: scientistStore.stats.level,
    progress: gameStore.isFeatureUnlocked('scientist')
      ? null
      : Math.min(100, (warriorStore.stats.level / UNLOCK_REQUIREMENTS.scientist.warriorLevel) * 100),
    requirement: gameStore.isFeatureUnlocked('scientist')
      ? null
      : UNLOCK_REQUIREMENTS.scientist.label,
    currentProgress: warriorStore.stats.level,
    requiredProgress: UNLOCK_REQUIREMENTS.scientist.warriorLevel,
  },
  {
    id: 'merchant' as const,
    label: 'Handlarz',
    icon: 'mdi-cart',
    unlocked: gameStore.isFeatureUnlocked('merchant'),
    level: merchantStore.stats.level,
    progress: gameStore.isFeatureUnlocked('merchant')
      ? null
      : Math.min(100, (warriorStore.stats.level / UNLOCK_REQUIREMENTS.merchant.warriorLevel) * 100),
    requirement: gameStore.isFeatureUnlocked('merchant')
      ? null
      : UNLOCK_REQUIREMENTS.merchant.label,
    currentProgress: warriorStore.stats.level,
    requiredProgress: UNLOCK_REQUIREMENTS.merchant.warriorLevel,
  },
  {
    id: 'gathering' as const,
    label: 'Zbieranie',
    icon: 'mdi-pickaxe',
    unlocked: true, // Always unlocked
    level: Math.max(
      gatheringStore.skills.mining.level,
      gatheringStore.skills.woodcutting.level,
      gatheringStore.skills.fishing.level,
      gatheringStore.skills.herbalism.level
    ),
    progress: null,
    requirement: null,
  },
  {
    id: 'crafting' as const,
    label: 'Rzemiosło',
    icon: 'mdi-anvil',
    unlocked: true, // Always unlocked
    level: Math.max(
      craftingStore.professions.smithing.level,
      craftingStore.professions.tailoring.level,
      craftingStore.professions.jewelcrafting.level,
      craftingStore.professions.woodworking.level
    ),
    progress: null,
    requirement: null,
  },
  {
    id: 'diplomat' as const,
    label: 'Dyplomata',
    icon: 'mdi-account-tie',
    unlocked: true, // Always unlocked
    level: diplomatStore.progress.level,
    progress: null,
    requirement: null,
  },
  {
    id: 'druid' as const,
    label: 'Druid',
    icon: 'mdi-leaf',
    unlocked: true, // Always unlocked
    level: druidStore.progress.level,
    progress: null,
    requirement: null,
  },
  {
    id: 'mystic' as const,
    label: 'Mistyk',
    icon: 'mdi-crystal-ball',
    unlocked: true, // Always unlocked
    level: mysticStore.progress.level,
    progress: null,
    requirement: null,
  },
  {
    id: 'chef' as const,
    label: 'Kucharz',
    icon: 'mdi-chef-hat',
    unlocked: true,
    level: chefStore.progress.level,
    progress: null,
    requirement: null,
  },
  {
    id: 'fisherman' as const,
    label: 'Wędkarz',
    icon: 'mdi-fishing',
    unlocked: true,
    level: fishermanStore.progress.level,
    progress: null,
    requirement: null,
  },
  {
    id: 'wizard' as const,
    label: 'Czarodziej',
    icon: 'mdi-wizard-hat',
    unlocked: true,
    level: wizardStore.progress.level,
    progress: null,
    requirement: null,
  },
  {
    id: 'explorer' as const,
    label: 'Odkrywca',
    icon: 'mdi-compass',
    unlocked: true,
    level: explorerStore.progress.level,
    progress: null,
    requirement: null,
  },
  {
    id: 'bard' as const,
    label: 'Bard',
    icon: 'mdi-music',
    unlocked: true,
    level: bardStore.progress.level,
    progress: null,
    requirement: null,
  },
  {
    id: 'alchemist' as const,
    label: 'Alchemik',
    icon: 'mdi-flask',
    unlocked: true,
    level: alchemistStore.progress.level,
    progress: null,
    requirement: null,
  },
  {
    id: 'architect' as const,
    label: 'Architekt',
    icon: 'mdi-home-city',
    unlocked: true,
    level: architectStore.progress.level,
    progress: null,
    requirement: null,
  },
  {
    id: 'spy' as const,
    label: 'Szpieg',
    icon: 'mdi-eye-off',
    unlocked: true,
    level: spyStore.progress.level,
    progress: null,
    requirement: null,
  },
  {
    id: 'tamer' as const,
    label: 'Zaklinacz',
    icon: 'mdi-paw',
    unlocked: true,
    level: tamerStore.progress.level,
    progress: null,
    requirement: null,
  },
  {
    id: 'priest' as const,
    label: 'Kapłan',
    icon: 'mdi-hands-pray',
    unlocked: true,
    level: priestStore.progress.level,
    progress: null,
    requirement: null,
  },
  {
    id: 'township' as const,
    label: 'Osada',
    icon: 'mdi-home-city',
    unlocked: true,
    level: townshipStore.progress.level,
    progress: null,
    requirement: null,
    currentProgress: townshipStore.totalBuildingsBuilt,
    requiredProgress: null,
  },
  {
    id: 'quests' as const,
    label: 'Questy',
    icon: 'mdi-book-open-variant',
    unlocked: true,
    level: null,
    progress: null,
    requirement: null,
    currentProgress: questsStore.activeQuestsList.length,
    requiredProgress: null,
    badge: questsStore.activeQuestsList.filter(q => q.status === 'completed').length > 0 
      ? questsStore.activeQuestsList.filter(q => q.status === 'completed').length.toString() 
      : null,
  },
  {
    id: 'world_bosses' as const,
    label: 'World Bosses',
    icon: 'mdi-skull-crossbones',
    unlocked: true,
    level: null,
    progress: null,
    requirement: null,
    currentProgress: worldBossesStore.totalBossKills,
    requiredProgress: null,
    badge: worldBossesStore.activeBosses.length > 0 ? worldBossesStore.activeBosses.length.toString() : null,
  },
  {
    id: 'synergies' as const,
    label: 'Synergie',
    icon: 'mdi-link-variant',
    unlocked: true,
    level: null,
    progress: null,
    requirement: null,
    currentProgress: synergiesStore.totalActiveSynergies,
    requiredProgress: null,
    badge: null,
  },
  {
    id: 'exploration' as const,
    label: 'Eksploracja',
    icon: 'mdi-compass',
    unlocked: true,
    level: null,
    progress: null,
    requirement: null,
    currentProgress: explorationStore.stats.regionsExplored,
    requiredProgress: null,
    badge: explorationStore.isTraveling ? '!' : null,
  },
  {
    id: 'codex' as const,
    label: 'Kodeks',
    icon: 'mdi-book-open-page-variant',
    unlocked: true,
    level: null,
    progress: null,
    requirement: null,
    currentProgress: codexStore.stats.totalDiscovered,
    requiredProgress: null,
    badge: codexStore.unreadCount > 0 ? codexStore.unreadCount.toString() : null,
  },
  {
    id: 'reputation' as const,
    label: 'Reputacja',
    icon: 'mdi-account-star',
    unlocked: true,
    level: null,
    progress: null,
    requirement: null,
    currentProgress: reputationStore.fame,
    requiredProgress: null,
    badge: null,
  },
  {
    id: 'calendar' as const,
    label: 'Kalendarz',
    icon: 'mdi-calendar',
    unlocked: true,
    level: null,
    progress: null,
    requirement: null,
    currentProgress: null,
    requiredProgress: null,
    badge: calendarStore.activeFestivals.length > 0 ? '!' : null,
  },
  {
    id: 'companions' as const,
    label: 'Towarzysze',
    icon: 'mdi-account-group',
    unlocked: true,
    level: null,
    progress: null,
    requirement: null,
    currentProgress: companionsStore.recruitedCount,
    requiredProgress: companionsStore.maxCompanions,
    badge: companionsStore.idleCompanions.length > 0 ? companionsStore.idleCompanions.length.toString() : null,
  },
  {
    id: 'minigames' as const,
    label: 'Mini-gry',
    icon: 'mdi-gamepad-variant',
    unlocked: true,
    level: null,
    progress: null,
    requirement: null,
    currentProgress: minigamesStore.stats.gamesWon,
    requiredProgress: null,
    badge: null,
  },
  {
    id: 'achievements' as const,
    label: 'Osiągnięcia',
    icon: 'mdi-trophy',
    unlocked: true, // Always unlocked
    level: null,
    progress: achievementsStore.completionPercent,
    requirement: null,
    currentProgress: achievementsStore.unlockedCount,
    requiredProgress: achievementsStore.totalCount,
  },
  {
    id: 'prestige' as const,
    label: 'Prestiż',
    icon: 'mdi-star-circle',
    unlocked: true, // Always unlocked
    level: null,
    progress: null,
    requirement: null,
    currentProgress: prestigeStore.legacyPoints,
    requiredProgress: null,
    badge: prestigeStore.canPrestige ? '!' : null,
  },
  {
    id: 'events' as const,
    label: 'Wydarzenia',
    icon: 'mdi-calendar-star',
    unlocked: true,
    level: null,
    progress: null,
    requirement: null,
    currentProgress: eventsStore.activeEvents.length,
    requiredProgress: null,
    badge: eventsStore.availableToClaim.length > 0 ? eventsStore.availableToClaim.length.toString() : null,
  },
  {
    id: 'stats' as const,
    label: 'Statystyki',
    icon: 'mdi-chart-bar',
    unlocked: true,
    level: null,
    progress: null,
    requirement: null,
    currentProgress: null,
    requiredProgress: null,
    badge: null,
  },
  {
    id: 'integration' as const,
    label: 'Integracja',
    icon: 'mdi-link-variant',
    unlocked: true,
    level: null,
    progress: null,
    requirement: null,
    currentProgress: integrationStore.totalFoodCount,
    requiredProgress: null,
    badge: integrationStore.totalFoodCount > 0 ? integrationStore.totalFoodCount.toString() : null,
  },
  {
    id: 'settings' as const,
    label: 'Ustawienia',
    icon: 'mdi-cog',
    unlocked: true,
    level: null,
    progress: null,
    requirement: null,
    currentProgress: null,
    requiredProgress: null,
    badge: null,
  },
]);

function gameTick() {
  const now = Date.now();
  const deltaTime = now - lastTickTime;
  const ticksElapsed = Math.floor(deltaTime / TICK_RATE);

  if (ticksElapsed > 0) {
    lastTickTime = now - (deltaTime % TICK_RATE);

    for (let i = 0; i < ticksElapsed; i++) {
      gameStore.tick();
      resourcesStore.processTick(1);
      warriorStore.processTick();
      scientistStore.processTick();
      merchantStore.processTick();
      achievementsStore.processTick();
      eventsStore.processTick();
      integrationStore.processTick();
      gatheringStore.processTick();
      craftingStore.processTick();
      diplomatStore.processTick();
      druidStore.processTick();
      mysticStore.processTick();
      chefStore.processTick();
      fishermanStore.processTick();
      wizardStore.processTick();
      explorerStore.processTick();
      bardStore.processTick();
      alchemistStore.processTick();
      architectStore.processTick();
      spyStore.processTick();
      tamerStore.processTick();
      priestStore.processTick();
      townshipStore.processTick();
      questsStore.processTick();
      worldBossesStore.processTick();
      synergiesStore.processTick();
      explorationStore.processTick();
      calendarStore.processTick();
      companionsStore.processTick();
    }
  }

  // Update playtime
  gameStore.totalPlaytime += deltaTime / 1000;
}

function startGameLoop() {
  if (gameLoopInterval) return;
  lastTickTime = Date.now();
  gameLoopInterval = setInterval(gameTick, TICK_RATE);
}

function stopGameLoop() {
  if (gameLoopInterval) {
    clearInterval(gameLoopInterval);
    gameLoopInterval = null;
  }
}

// Offline progress calculation
function calculateOfflineProgress(timeAwayMs: number): OfflineReport {
  // Cap offline time
  const maxOfflineMs = MAX_OFFLINE_HOURS * 60 * 60 * 1000;
  const cappedTime = Math.min(timeAwayMs, maxOfflineMs);

  // Only simulate if auto-combat was enabled
  const wasAutoCombatEnabled = warriorStore.autoCombatEnabled;
  const selectedMonster = warriorStore.selectedMonster;

  // Get monster data
  const monster = selectedMonster
    ? warriorStore.availableMonsters.find(m => m.id === selectedMonster)
    : warriorStore.availableMonsters[0];

  // Calculate combat stats
  let monstersKilled = 0;
  let xpGained = 0;
  let goldGained = 0;
  let deaths = 0;
  let foodConsumed = 0;
  const loot: Array<{ itemId: string; amount: number }> = [];

  if (wasAutoCombatEnabled && monster) {
    // Simplified simulation: estimate kills per second
    const playerDps = warriorStore.effectiveStats.attack * 0.8; // rough DPS estimate
    const monsterHp = monster.maxHp;
    const secondsPerKill = Math.max(1, monsterHp / playerDps);

    // Simulate time
    const totalSeconds = cappedTime / 1000;
    const potentialKills = Math.floor(totalSeconds / secondsPerKill);

    // Calculate survival (rough estimate based on HP vs monster damage)
    const survivalRate = Math.min(0.95, warriorStore.effectiveStats.damageReduction + 0.3);
    const effectiveKills = Math.floor(potentialKills * survivalRate);

    // Check food availability
    const foodAvailable = resourcesStore.food.amount.toNumber();
    const killsPerFood = 5; // Roughly 5 kills per food
    const maxKillsWithFood = Math.floor(foodAvailable * killsPerFood);

    monstersKilled = Math.min(effectiveKills, maxKillsWithFood + 20); // +20 for HP regen
    xpGained = monstersKilled * monster.xpReward;

    // Calculate gold
    const avgGold = (monster.goldReward.min + monster.goldReward.max) / 2;
    goldGained = Math.floor(monstersKilled * avgGold);

    // Calculate deaths (if many kills, some deaths likely)
    deaths = Math.floor(monstersKilled / 50); // Roughly 1 death per 50 kills

    // Food consumed
    foodConsumed = Math.min(foodAvailable, Math.floor(monstersKilled / killsPerFood));

    // Loot
    if (goldGained > 0) {
      loot.push({ itemId: 'gold', amount: goldGained });
    }

    // Simulate some material drops
    for (const lootEntry of monster.lootTable) {
      const expectedDrops = Math.floor(monstersKilled * lootEntry.chance);
      if (expectedDrops > 0) {
        const avgAmount = (lootEntry.minAmount + lootEntry.maxAmount) / 2;
        loot.push({
          itemId: lootEntry.itemId,
          amount: Math.floor(expectedDrops * avgAmount),
        });
      }
    }
  }

  return {
    timeAway: cappedTime,
    combat: {
      monstersKilled,
      xpGained,
      loot,
      deaths,
      foodConsumed,
    },
    research: {
      researchProgress: {},
      potionsProduced: {},
      golemWork: {},
    },
    merchant: {
      goldEarned: resourcesStore.gold.amount,
      tradeRoutesCompleted: 0,
      itemsSold: 0,
    },
  };
}

function applyOfflineProgress(report: OfflineReport) {
  // Apply combat rewards
  if (report.combat.xpGained > 0) {
    warriorStore.addXp(report.combat.xpGained);
  }

  // Apply gold from loot
  const goldLoot = report.combat.loot.find(l => l.itemId === 'gold');
  if (goldLoot) {
    resourcesStore.addResource('gold', goldLoot.amount);
  }

  // Consume food
  if (report.combat.foodConsumed > 0) {
    resourcesStore.removeResource('food', report.combat.foodConsumed);
  }

  // Add notification
  gameStore.addNotification({
    type: 'success',
    title: 'Nagrody offline odebrane!',
    message: `+${report.combat.xpGained} XP, +${goldLoot?.amount || 0} złota`,
    icon: 'mdi-gift',
    duration: 5000,
  });
}

function handleClaimOffline() {
  if (offlineReport.value) {
    applyOfflineProgress(offlineReport.value);
  }
  showOfflineModal.value = false;
  offlineReport.value = null;
}

// Lifecycle
onMounted(() => {
  // Handle offline progress BEFORE starting game loop
  const lastLogout = gameStore.lastLogout;
  const timeDiff = Date.now() - lastLogout;

  if (timeDiff > 60000) { // More than 1 minute
    offlineReport.value = calculateOfflineProgress(timeDiff);
    showOfflineModal.value = true;
  }

  startGameLoop();

  // Handle visibility change (pause when hidden)
  document.addEventListener('visibilitychange', handleVisibilityChange);
});

onUnmounted(() => {
  stopGameLoop();
  gameStore.lastLogout = Date.now();
  document.removeEventListener('visibilitychange', handleVisibilityChange);
});

function handleVisibilityChange() {
  if (document.hidden) {
    gameStore.lastLogout = Date.now();
  } else {
    // Calculate offline progress when returning
    const timeDiff = Date.now() - gameStore.lastLogout;
    if (timeDiff > 60000) { // More than 1 minute
      offlineReport.value = calculateOfflineProgress(timeDiff);
      showOfflineModal.value = true;
    }
    lastTickTime = Date.now();
  }
}

// Dev functions
function devAddGold() {
  resourcesStore.addResource('gold', 1000);
}

function devAddXp() {
  warriorStore.addXp(100);
}

function devSimulateOffline() {
  // Simulate 1 hour offline
  offlineReport.value = calculateOfflineProgress(60 * 60 * 1000);
  showOfflineModal.value = true;
}
</script>

<template>
  <v-app>
    <!-- Top App Bar with Resources -->
    <v-app-bar
      color="surface"
      elevation="2"
      density="compact"
    >
      <v-app-bar-nav-icon>
        <v-icon>mdi-shield-sword</v-icon>
      </v-app-bar-nav-icon>

      <v-app-bar-title class="text-h6">
        Echa Aterii
      </v-app-bar-title>

      <v-spacer />

      <!-- Resource Bar -->
      <AteriaResourceBar />

      <v-btn
        icon
        variant="text"
        size="small"
      >
        <v-icon>mdi-cog</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- Navigation Drawer -->
    <v-navigation-drawer
      permanent
      width="220"
      class="nav-drawer"
    >
      <div class="nav-header pa-3">
        <div class="text-caption text-medium-emphasis">
          ŚCIEŻKI ROZWOJU
        </div>
      </div>

      <v-list
        nav
        density="comfortable"
        class="px-2"
      >
        <div
          v-for="item in navItems"
          :key="item.id"
          class="nav-item-wrapper mb-1"
        >
          <v-list-item
            :value="item.id"
            :active="activeTab === item.id"
            :disabled="!item.unlocked"
            rounded="lg"
            class="nav-item"
            :class="{ 'nav-item-locked': !item.unlocked }"
            @click="item.unlocked ? activeTab = item.id : null"
          >
            <template #prepend>
              <v-avatar
                size="32"
                :color="item.unlocked ? (activeTab === item.id ? 'primary' : 'surface-variant') : 'grey-darken-2'"
                class="mr-3"
              >
                <v-icon
                  :color="item.unlocked ? (activeTab === item.id ? 'white' : undefined) : 'grey'"
                  size="18"
                >
                  {{ item.unlocked ? item.icon : 'mdi-lock' }}
                </v-icon>
              </v-avatar>
            </template>

            <v-list-item-title class="text-body-2 font-weight-medium">
              {{ item.label }}
            </v-list-item-title>

            <v-list-item-subtitle v-if="item.unlocked">
              <span class="text-caption">Poziom {{ item.level }}</span>
            </v-list-item-subtitle>

            <v-list-item-subtitle
              v-else
              class="text-caption"
            >
              <span class="text-warning">{{ item.requirement }}</span>
            </v-list-item-subtitle>

            <template #append>
              <v-chip
                v-if="item.unlocked"
                size="x-small"
                :color="activeTab === item.id ? 'primary' : 'default'"
                variant="tonal"
              >
                {{ item.level }}
              </v-chip>
            </template>
          </v-list-item>

          <!-- Progress bar for locked items -->
          <div
            v-if="!item.unlocked && item.progress !== null"
            class="unlock-progress px-3 pb-2"
          >
            <v-progress-linear
              :model-value="item.progress"
              color="warning"
              height="4"
              rounded
              class="mb-1"
            />
            <div class="d-flex justify-space-between text-caption text-medium-emphasis">
              <span>Postęp</span>
              <span>{{ item.currentProgress }} / {{ item.requiredProgress }}</span>
            </div>
          </div>
        </div>
      </v-list>

      <v-divider class="my-2" />

      <v-list
        nav
        density="comfortable"
        class="px-2"
      >
        <v-list-item
          value="prestige"
          rounded="lg"
          disabled
        >
          <template #prepend>
            <v-avatar
              size="32"
              color="grey-darken-2"
              class="mr-3"
            >
              <v-icon
                size="18"
                color="grey"
              >
                mdi-crown
              </v-icon>
            </v-avatar>
          </template>
          <v-list-item-title class="text-body-2">
            Dziedzictwo
          </v-list-item-title>
          <v-list-item-subtitle class="text-caption text-medium-emphasis">
            Wkrótce...
          </v-list-item-subtitle>
        </v-list-item>

        <v-list-item
          value="stats"
          rounded="lg"
          disabled
        >
          <template #prepend>
            <v-avatar
              size="32"
              color="grey-darken-2"
              class="mr-3"
            >
              <v-icon
                size="18"
                color="grey"
              >
                mdi-chart-bar
              </v-icon>
            </v-avatar>
          </template>
          <v-list-item-title class="text-body-2">
            Statystyki
          </v-list-item-title>
          <v-list-item-subtitle class="text-caption text-medium-emphasis">
            Wkrótce...
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>

      <!-- Dev unlock all button -->
      <div class="pa-2 mt-auto">
        <v-btn
          size="small"
          variant="outlined"
          color="warning"
          block
          class="dev-unlock-btn"
          @click="() => { gameStore.unlockFeature('scientist'); gameStore.unlockFeature('merchant'); }"
        >
          <v-icon
            start
            size="14"
          >
            mdi-lock-open
          </v-icon>
          DEV: Odblokuj wszystko
        </v-btn>
      </div>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main>
      <v-container
        fluid
        class="pa-4"
      >
        <!-- Warrior Section -->
        <div v-if="activeTab === 'warrior'">
          <!-- Sub-tabs for Warrior -->
          <v-tabs
            v-model="warriorSubTab"
            color="primary"
            density="compact"
            class="mb-4"
          >
            <v-tab value="combat">
              <v-icon start>
                mdi-sword-cross
              </v-icon>
              Walka
            </v-tab>
            <v-tab value="dungeon">
              <v-icon start>
                mdi-castle
              </v-icon>
              Lochy
              <v-badge
                v-if="warriorStore.isInDungeon"
                dot
                color="error"
                class="ml-2"
              />
            </v-tab>
            <v-tab value="slayer">
              <v-icon start>
                mdi-target-account
              </v-icon>
              Łowca
              <v-badge
                v-if="warriorStore.hasActiveSlayerTask"
                dot
                color="deep-purple"
                class="ml-2"
              />
            </v-tab>
            <v-tab value="loadout">
              <v-icon start>
                mdi-bag-personal
              </v-icon>
              Zestawy
              <v-badge
                v-if="warriorStore.loadouts.length > 0"
                :content="warriorStore.loadouts.length"
                color="deep-purple"
                inline
              />
            </v-tab>
            <v-tab value="equipment">
              <v-icon start>
                mdi-shield-sword
              </v-icon>
              Ekwipunek
              <v-badge
                v-if="inventoryStore.ownedEquipment.length > 0"
                :content="inventoryStore.ownedEquipment.length"
                color="primary"
                inline
                class="ml-2"
              />
            </v-tab>
          </v-tabs>

          <!-- Warrior Combat Panel -->
          <AteriaWarriorPanel v-if="warriorSubTab === 'combat'" />

          <!-- Warrior Dungeon Panel -->
          <AteriaDungeonPanel v-else-if="warriorSubTab === 'dungeon'" />

          <!-- Warrior Slayer Panel -->
          <AteriaSlayerPanel v-else-if="warriorSubTab === 'slayer'" />

          <!-- Warrior Loadout Panel -->
          <AteriaLoadoutPanel v-else-if="warriorSubTab === 'loadout'" />

          <!-- Warrior Equipment Panel -->
          <AteriaEquipmentPanel v-else-if="warriorSubTab === 'equipment'" />
        </div>

        <!-- Scientist Panel -->
        <div v-else-if="activeTab === 'scientist'">
          <v-tabs
            v-model="scientistSubTab"
            color="green"
            class="mb-4"
          >
            <v-tab value="main">
              <v-icon start>
                mdi-flask
              </v-icon>
              Laboratorium
            </v-tab>
            <v-tab value="golems">
              <v-icon start>
                mdi-robot
              </v-icon>
              Golemy
              <v-badge
                v-if="scientistStore.golemsUnlocked && scientistStore.workshop.golems.length > 0"
                :content="scientistStore.activeGolems.length"
                color="blue-grey"
                inline
              />
            </v-tab>
          </v-tabs>

          <AteriaScientistPanel v-if="scientistSubTab === 'main'" />
          <AteriaGolemPanel v-else-if="scientistSubTab === 'golems'" />
        </div>

        <!-- Merchant Panel -->
        <div v-else-if="activeTab === 'merchant'">
          <v-tabs
            v-model="merchantSubTab"
            color="amber-darken-2"
            class="mb-4"
          >
            <v-tab value="shop">
              <v-icon start>
                mdi-store
              </v-icon>
              Sklep
            </v-tab>
            <v-tab value="caravans">
              <v-icon start>
                mdi-truck
              </v-icon>
              Karawany
              <v-badge
                v-if="merchantStore.caravans.filter(c => c.state === 'traveling').length > 0"
                :content="merchantStore.caravans.filter(c => c.state === 'traveling').length"
                color="info"
                inline
              />
            </v-tab>
          </v-tabs>

          <AteriaMerchantPanel v-if="merchantSubTab === 'shop'" />
          <AteriaCaravanPanel v-else-if="merchantSubTab === 'caravans'" />
        </div>

        <!-- Achievements Panel -->
        <AteriaAchievementsPanel v-else-if="activeTab === 'achievements'" />

        <!-- Prestige Panel -->
        <AteriaPrestigePanel v-else-if="activeTab === 'prestige'" />

        <!-- Events Panel -->
        <AteriaEventsPanel v-else-if="activeTab === 'events'" />

        <!-- Stats Panel -->
        <AteriaStatsPanel v-else-if="activeTab === 'stats'" />

        <!-- Integration Panel -->
        <AteriaIntegrationPanel v-else-if="activeTab === 'integration'" />

        <!-- Gathering Panel -->
        <AteriaGatheringPanel v-else-if="activeTab === 'gathering'" />

        <!-- Crafting Panel -->
        <AteriaCraftingPanel v-else-if="activeTab === 'crafting'" />

        <!-- Diplomat Panel -->
        <AteriaDiplomatPanel v-else-if="activeTab === 'diplomat'" />

        <!-- Druid Panel -->
        <AteriaDruidPanel v-else-if="activeTab === 'druid'" />

        <!-- Mystic Panel -->
        <AteriaMysticPanel v-else-if="activeTab === 'mystic'" />
        <AteriaChefPanel v-else-if="activeTab === 'chef'" />
        <AteriaFishermanPanel v-else-if="activeTab === 'fisherman'" />
        <AteriaWizardPanel v-else-if="activeTab === 'wizard'" />
        <AteriaExplorerPanel v-else-if="activeTab === 'explorer'" />
        <AteriaBardPanel v-else-if="activeTab === 'bard'" />
        <AteriaAlchemistPanel v-else-if="activeTab === 'alchemist'" />
        <AteriaArchitectPanel v-else-if="activeTab === 'architect'" />
        <AteriaSpyPanel v-else-if="activeTab === 'spy'" />
        <AteriaTamerPanel v-else-if="activeTab === 'tamer'" />
        <AteriaPriestPanel v-else-if="activeTab === 'priest'" />
        <AteriaTownshipPanel v-else-if="activeTab === 'township'" />
        <AteriaQuestsPanel v-else-if="activeTab === 'quests'" />
        <AteriaWorldBossesPanel v-else-if="activeTab === 'world_bosses'" />
        <AteriaSynergiesPanel v-else-if="activeTab === 'synergies'" />
        <AteriaExplorationPanel v-else-if="activeTab === 'exploration'" />
        <AteriaCodexPanel v-else-if="activeTab === 'codex'" />
        <AteriaReputationPanel v-else-if="activeTab === 'reputation'" />
        <AteriaCalendarPanel v-else-if="activeTab === 'calendar'" />
        <AteriaCompanionsPanel v-else-if="activeTab === 'companions'" />
        <AteriaMinigamesPanel v-else-if="activeTab === 'minigames'" />

        <!-- Settings Panel -->
        <AteriaSettingsPanel v-else-if="activeTab === 'settings'" />

        <!-- Dev Panel (only in development) -->
        <v-card
          v-if="true"
          class="mt-4 dev-panel"
        >
          <v-card-text class="py-2 px-3">
            <div class="d-flex align-center flex-wrap ga-2">
              <span class="text-caption text-medium-emphasis mr-2">DEV:</span>
              <v-btn
                size="x-small"
                variant="tonal"
                @click="devAddGold"
              >
                +1K Gold
              </v-btn>
              <v-btn
                size="x-small"
                variant="tonal"
                @click="devAddXp"
              >
                +100 XP
              </v-btn>
              <v-btn
                size="x-small"
                variant="tonal"
                @click="resourcesStore.addResource('food', 50)"
              >
                +50 Food
              </v-btn>
              <v-btn
                size="x-small"
                variant="tonal"
                color="info"
                @click="devSimulateOffline"
              >
                Offline 1h
              </v-btn>
              <v-btn
                size="x-small"
                variant="tonal"
                color="amber"
                @click="inventoryStore.devAddRandomEquipment()"
              >
                +Losowy Ekwipunek
              </v-btn>
              <v-btn
                size="x-small"
                variant="tonal"
                color="purple"
                @click="inventoryStore.devAddAllStarterGear()"
              >
                +Starter Gear
              </v-btn>
              <v-btn
                size="x-small"
                variant="tonal"
                color="orange"
                @click="merchantStore.devAddTestItems()"
              >
                +Towary
              </v-btn>
              <v-btn
                size="x-small"
                variant="tonal"
                color="deep-purple"
                @click="scientistStore.devAddFlasks()"
              >
                +Kolby
              </v-btn>
              <v-btn
                size="x-small"
                variant="tonal"
                color="pink"
                @click="scientistStore.devUnlockAll()"
              >
                Unlock Sci
              </v-btn>
              <v-btn
                size="x-small"
                variant="tonal"
                color="teal"
                @click="scientistStore.devAddIngredients()"
              >
                +Składniki
              </v-btn>
              <v-btn
                size="x-small"
                variant="tonal"
                color="cyan"
                @click="() => { warriorStore.addDungeonKey('goblin_key', 5); warriorStore.addDungeonKey('swamp_key', 3); warriorStore.addDungeonKey('infernal_key', 2); warriorStore.addDungeonKey('frost_key', 1); warriorStore.addDungeonKey('void_key', 1); }"
              >
                +Klucze
              </v-btn>
              <v-btn
                size="x-small"
                variant="tonal"
                color="deep-purple"
                @click="resourcesStore.addResource('slayerCoins', 500)"
              >
                +500 Monety Łowcy
              </v-btn>
              <v-btn
                size="x-small"
                variant="tonal"
                color="purple"
                @click="prestigeStore.legacyPoints += 100"
              >
                +100 LP
              </v-btn>
              <v-btn
                size="x-small"
                variant="tonal"
                color="pink"
                @click="eventsStore.startEvent('gold_rush')"
              >
                +Gold Rush
              </v-btn>
              <v-btn
                size="x-small"
                variant="tonal"
                color="red"
                @click="eventsStore.startEvent('blood_moon')"
              >
                +Blood Moon
              </v-btn>
              <v-btn
                size="x-small"
                variant="tonal"
                color="brown"
                @click="integrationStore.addFood('bread', 10)"
              >
                +10 Chleb
              </v-btn>
              <v-btn
                size="x-small"
                variant="tonal"
                color="orange"
                @click="integrationStore.addFood('cooked_meat', 5)"
              >
                +5 Mięso
              </v-btn>
              <v-btn
                size="x-small"
                variant="tonal"
                color="brown"
                @click="gatheringStore.devAddAllTools()"
              >
                +Narzędzia
              </v-btn>
              <v-btn
                size="x-small"
                variant="tonal"
                color="lime"
                @click="gatheringStore.devAddResources()"
              >
                +Surowce
              </v-btn>
              <v-btn
                size="x-small"
                variant="tonal"
                color="amber"
                @click="craftingStore.devDiscoverAll()"
              >
                +Receptury
              </v-btn>
              <v-btn
                size="x-small"
                variant="tonal"
                color="indigo"
                @click="craftingStore.devAddMaterials()"
              >
                +Materiały
              </v-btn>
              <v-btn
                size="x-small"
                variant="tonal"
                color="deep-purple"
                @click="diplomatStore.devMaxReputations()"
              >
                +Max Reputacja
              </v-btn>
              <v-btn
                size="x-small"
                variant="tonal"
                color="green"
                @click="druidStore.devUnlockAllTotems()"
              >
                +Totemy
              </v-btn>
              <v-btn
                size="x-small"
                variant="tonal"
                color="light-green"
                @click="druidStore.devFillInventory()"
              >
                +Produkty Farmy
              </v-btn>
              <v-btn
                size="x-small"
                variant="tonal"
                color="purple"
                @click="mysticStore.devFillResources()"
              >
                +Mana/Oświecenie
              </v-btn>
              <v-btn
                size="x-small"
                variant="tonal"
                color="deep-purple"
                @click="mysticStore.devCollectAllCards()"
              >
                +Karty Tarota
              </v-btn>
              <v-btn
                size="x-small"
                variant="tonal"
                color="error"
                @click="() => { gameStore.resetGame(); resourcesStore.resetResources(); warriorStore.resetWarrior(); inventoryStore.resetInventory(); scientistStore.resetScientist(); merchantStore.resetMerchant(); gatheringStore.resetGathering(); craftingStore.resetCrafting(); diplomatStore.resetDiplomat(); druidStore.resetDruid(); mysticStore.resetMystic(); chefStore.resetChef(); fishermanStore.resetFisherman(); wizardStore.resetWizard(); explorerStore.resetExplorer(); bardStore.resetBard(); alchemistStore.resetAlchemist(); architectStore.resetArchitect(); spyStore.resetSpy(); tamerStore.resetTamer(); priestStore.resetPriest(); townshipStore.resetTownship(); questsStore.resetQuests(); worldBossesStore.resetWorldBosses(); synergiesStore.resetSynergies(); explorationStore.resetExploration(); codexStore.resetCodex(); reputationStore.resetReputation(); calendarStore.resetCalendar(); companionsStore.resetCompanions(); minigamesStore.resetMinigames(); }"
              >
                Reset
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-container>
    </v-main>

    <!-- Notifications -->
    <AteriaNotifications />

    <!-- Offline Progress Modal -->
    <AteriaOfflineProgressModal
      v-model="showOfflineModal"
      :report="offlineReport"
      @claim="handleClaimOffline"
    />
  </v-app>
</template>

<style scoped>
.v-main {
  background-color: rgb(var(--v-theme-background));
}

.nav-drawer {
  background: #1a1a1a !important;
  border-right: 1px solid rgba(255, 255, 255, 0.05) !important;
  display: flex;
  flex-direction: column;
}

.nav-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.nav-item-wrapper {
  border-radius: 8px;
  overflow: hidden;
}

.nav-item {
  min-height: 48px;
}

.nav-item-locked {
  opacity: 0.7;
}

.nav-item-locked:hover {
  cursor: not-allowed;
}

.nav-drawer :deep(.v-list-item--active) {
  background: rgba(33, 150, 243, 0.15);
}

.nav-drawer :deep(.v-list-item:hover:not(.v-list-item--active):not(.v-list-item--disabled)) {
  background: rgba(255, 255, 255, 0.05);
}

.unlock-progress {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 0 0 8px 8px;
  margin-top: -4px;
}

.dev-unlock-btn {
  font-size: 10px;
  opacity: 0.6;
}

.dev-unlock-btn:hover {
  opacity: 1;
}

.dev-panel {
  background: rgba(255, 255, 255, 0.02) !important;
  border: 1px dashed rgba(255, 255, 255, 0.1);
}
</style>
