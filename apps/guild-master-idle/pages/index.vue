<template>
  <v-app class="guild-app" :theme="theme">
    <!-- Main Full-Height Layout -->
    <v-main class="main-layout">
      <div
        class="main-grid"
        :class="{
          'no-left': !showLeftSidebar,
          'no-right': !showRightSidebar || !rightSidebarUnlocked,
        }"
      >
        <!-- Left Sidebar Navigation -->
        <LayoutLeftSidebar
          :visible="showLeftSidebar"
          :active-nav="activeNav"
          :nav-items="navItems"
          @hide="showLeftSidebar = false"
          @navigate="activeNav = $event"
        />

        <!-- Main Production Area -->
        <section class="production-center">
          <!-- Floating toggle buttons -->
          <div class="toggle-buttons">
            <v-btn
              v-if="!showLeftSidebar"
              icon variant="outlined" size="x-small" color="grey-darken-1"
              :title="t('showLeftSidebar')" class="toggle-btn"
              @click="showLeftSidebar = true"
            >
              <v-icon size="16">mdi-chevron-right</v-icon>
            </v-btn>
            <v-btn
              v-if="!showRightSidebar && rightSidebarUnlocked"
              icon variant="outlined" size="x-small" color="grey-darken-1"
              :title="t('showRightSidebar')" class="toggle-btn ml-auto"
              @click="showRightSidebar = true"
            >
              <v-icon size="16">mdi-chevron-left</v-icon>
            </v-btn>
          </div>

          <!-- View Router -->
          <ViewsTavernView v-if="activeNav === 'tavern'" />
          <ViewsGrandHallView v-else-if="activeNav === 'grand-hall'" />
          <ViewsResourcesView v-else-if="activeNav === 'resources'" />
          <ViewsMarketView v-else-if="activeNav === 'market'" />
          <ViewsUpgradesView v-else-if="activeNav === 'upgrades'" />
          <ViewsAchievementsView v-else-if="activeNav === 'achievements'" />
          <ViewsBlacksmithView v-else-if="activeNav === 'blacksmith'" />
          <ViewsProfileView v-else-if="activeNav === 'profile'" />
          <ViewsCombatView v-else-if="activeNav === 'quests'" />

          <!-- Placeholder for other views -->
          <div v-else class="production-inner">
            <h2 class="production-title">{{ t(`nav.${activeNav === 'grand-hall' ? 'grandHall' : activeNav}`) }}</h2>
            <div class="placeholder-content">
              <v-icon size="64" color="grey-lighten-1">mdi-hammer-wrench</v-icon>
              <p class="text-grey text-body-2 mt-4">Coming soon...</p>
            </div>
          </div>
        </section>

        <!-- Right Sidebar (Quests & Logs) -->
        <LayoutRightSidebar
          :visible="rightSidebarUnlocked && showRightSidebar"
          @hide="showRightSidebar = false"
        />
      </div>
    </v-main>

    <!-- Achievement Popup Overlay -->
    <LayoutAchievementPopup />
  </v-app>
</template>

<script setup lang="ts">
import { useI18n } from '~/composables/useI18n';
import { useTheme } from '~/composables/useTheme';
import { useGameStore } from '~/stores/useGameStore';

const { t } = useI18n();
const { theme } = useTheme();
const game = useGameStore();

const rightSidebarUnlocked = computed(() => game.rightSidebarUnlocked);

// Sidebar visibility
const showLeftSidebar = ref(true);
const showRightSidebar = ref(false);

// When right sidebar gets unlocked, show it
watch(rightSidebarUnlocked, (val) => {
  if (val) showRightSidebar.value = true;
});

// Navigation — tavern is the first view
const activeNav = ref('tavern');

const allNavItems = [
  { id: 'tavern', emoji: '🍺', labelKey: 'nav.tavern' },
  { id: 'upgrades', emoji: '🔧', labelKey: 'nav.upgrades' },
  { id: 'grand-hall', emoji: '🏛️', labelKey: 'nav.grandHall' },
  { id: 'resources', emoji: '⛏️', labelKey: 'nav.resources' },
  { id: 'market', emoji: '⚖️', labelKey: 'nav.market' },
  { id: 'quests', emoji: '⚔️', labelKey: 'nav.quests' },
  { id: 'achievements', emoji: '🏆', labelKey: 'nav.achievements' },
  { id: 'blacksmith', emoji: '⚒️', labelKey: 'nav.blacksmith' },
  { id: 'research', emoji: '📜', labelKey: 'nav.research' },
  { id: 'profile', emoji: '👤', labelKey: 'nav.profile' },
];

const navItems = computed(() => allNavItems.filter((item) => game.isNavUnlocked(item.id)));

// Start / stop game loop
onMounted(() => game.startGameLoop());
onUnmounted(() => game.stopGameLoop());
</script>

<style lang="scss" scoped>
$transition-theme: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;

// ============================================
// Layout
// ============================================
.guild-app {
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: system-ui, -apple-system, sans-serif;
  transition: $transition-theme;
}

.main-layout {
  height: 100%;
}

.main-grid {
  display: grid;
  grid-template-columns: 240px 1fr 320px;
  height: 100vh;
  transition: grid-template-columns 0.25s ease;

  &.no-left { grid-template-columns: 0px 1fr 320px; }
  &.no-right { grid-template-columns: 240px 1fr 0px; }
  &.no-left.no-right { grid-template-columns: 0px 1fr 0px; }
}

// ============================================
// Production Center
// ============================================
.production-center {
  grid-column: 2;
  padding: 32px;
  overflow-y: auto;
  background-color: var(--bg-secondary);
  position: relative;
  transition: $transition-theme;
}

.toggle-buttons {
  display: flex;
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  z-index: 5;
  pointer-events: none;

  .toggle-btn {
    pointer-events: auto;
  }
}

// Placeholder for unbuilt views
.production-inner {
  max-width: 768px;
  margin: 0 auto;
}

.production-title {
  font-size: 24px;
  font-weight: 300;
  color: var(--text-heading);
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-light);
}

.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
}
</style>
