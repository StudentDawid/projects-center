<script setup lang="ts">
defineProps<{
  activeTab: string
}>()

const emit = defineEmits<{
  (e: 'changeTab', tab: string): void
}>()

const TABS = [
  { id: 'mercenaries', label: 'Najemnicy', icon: '⚔️' },
  { id: 'buildings', label: 'Gildia', icon: '🏰' },
  { id: 'missions', label: 'Misje', icon: '📜' },
  { id: 'raids', label: 'Bossowie', icon: '🐲' },
  { id: 'artifacts', label: 'Artefakty', icon: '💎' },
  { id: 'prestige', label: 'Prestiż', icon: '✨' },
  { id: 'achievements', label: 'Osiągnięcia', icon: '🏆' }
]
</script>

<template>
  <aside class="app-sidebar">
    <nav class="nav-menu">
      <button 
        v-for="tab in TABS" 
        :key="tab.id"
        class="nav-item"
        :class="{ active: activeTab === tab.id }"
        @click="emit('changeTab', tab.id)"
      >
        <span class="icon">{{ tab.icon }}</span>
        <span class="label">{{ tab.label }}</span>
      </button>
    </nav>
  </aside>
</template>

<style scoped>
.app-sidebar {
  width: 250px;
  background-color: var(--panel-bg);
  border-right: 1px solid var(--panel-border);
  padding: 1.5rem 0;
  display: flex;
  flex-direction: column;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0 1rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.8rem 1rem;
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-primary);
  text-align: left;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
  border-color: var(--panel-border);
}

.nav-item.active {
  background-color: rgba(212, 175, 55, 0.1);
  border-color: var(--accent-gold);
  color: var(--accent-gold);
  box-shadow: inset 3px 0 0 var(--accent-gold);
}

.icon {
  font-size: 1.2rem;
}

.label {
  font-size: 1rem;
  font-weight: 500;
}
</style>
