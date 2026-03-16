<script setup lang="ts">
import { ref } from 'vue'
import { useGameTick } from './composables/useGameTick'
import AppHeader from './components/layout/AppHeader.vue'
import AppSidebar from './components/layout/AppSidebar.vue'

// Import placeholders for views
import MercenariesView from './views/MercenariesView.vue'
import BuildingsView from './views/BuildingsView.vue'
import MissionsView from './views/MissionsView.vue'
import RaidsView from './views/RaidsView.vue'
import ArtifactsView from './views/ArtifactsView.vue'
import PrestigeView from './views/PrestigeView.vue'
import AchievementsView from './views/AchievementsView.vue'

// Inicjalizacja globalnej pętli czasu i postępu dla gry (uruchamiane z App.vue - zawsze działa)
useGameTick()

type ViewTab = 'mercenaries' | 'buildings' | 'missions' | 'raids' | 'artifacts' | 'prestige' | 'achievements'
const activeTab = ref<ViewTab>('mercenaries')

const tabs: Record<ViewTab, any> = {
  mercenaries: MercenariesView,
  buildings: BuildingsView,
  missions: MissionsView,
  raids: RaidsView,
  artifacts: ArtifactsView,
  prestige: PrestigeView,
  achievements: AchievementsView
}
</script>

<template>
  <div class="guild-app">
    <AppHeader />
    <div class="main-layout">
      <AppSidebar :activeTab="activeTab" @changeTab="(tab) => activeTab = tab as ViewTab" />
      <main class="content-area">
        <KeepAlive>
          <component :is="tabs[activeTab]" />
        </KeepAlive>
      </main>
    </div>
  </div>
</template>

<style scoped>
.guild-app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background-color: var(--bg-color);
  color: var(--text-primary);
  /* Dark fantasy flavor noise or texture could be added here */
}

.main-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.content-area {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  background: radial-gradient(circle at center top, rgba(30, 35, 45, 0.4) 0%, transparent 80%);
}
</style>
