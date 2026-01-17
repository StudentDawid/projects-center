<template>
  <div class="card-generator-workspace">
    <!-- 1. Slim Global Navigation (Far Left) -->
    <nav class="global-nav">
      <div class="nav-brand">
        <span class="material-symbols-outlined">diamond</span>
      </div>
      <div class="nav-items">
        <NuxtLink
          to="/rpg/fabula-ultima-card-generator"
          class="nav-item active"
          title="Dashboard"
        >
          <span class="material-symbols-outlined">dashboard</span>
        </NuxtLink>
        <button class="nav-item" title="My Decks">
          <span class="material-symbols-outlined">folder_open</span>
        </button>
        <NuxtLink
          to="/rpg/fabula-ultima-card-generator/print-layout"
          class="nav-item"
          title="Print Layout"
        >
          <span class="material-symbols-outlined">print</span>
        </NuxtLink>
        <button class="nav-item" title="Settings">
          <span class="material-symbols-outlined">settings</span>
        </button>
      </div>
      <div class="nav-footer">
        <div class="user-avatar" />
      </div>
    </nav>

    <!-- 2. Main Workspace -->
    <main class="main-workspace">
      <!-- Background Layer -->
      <div class="workspace-bg">
        <div class="grid-pattern" />
      </div>

      <!-- Top Action Bar -->
      <header class="workspace-header">
        <div class="breadcrumbs">
          <span class="breadcrumb-current">My Cards</span>
          <span class="card-count">{{ cardStore.totalCards }} cards</span>
        </div>
        <div class="toolbar">
          <NuxtLink
            to="/rpg/fabula-ultima-card-generator/new"
            class="toolbar-btn primary"
          >
            <span class="material-symbols-outlined">add</span>
            Add Card
          </NuxtLink>
          <div class="zoom-controls">
            <button class="zoom-btn">
              <span class="material-symbols-outlined">remove</span>
            </button>
            <span class="zoom-value">100%</span>
            <button class="zoom-btn">
              <span class="material-symbols-outlined">add</span>
            </button>
          </div>
          <button class="toolbar-btn">
            <span class="material-symbols-outlined">picture_as_pdf</span>
            Export PDF
          </button>
          <button class="toolbar-btn primary">
            <span class="material-symbols-outlined">print</span>
            Print
          </button>
        </div>
      </header>

      <!-- Canvas / Drafting Table -->
      <div class="workspace-canvas">
        <!-- Card Grid -->
        <div class="cards-grid">
          <CardItem
            v-for="card in displayedCards"
            :key="card.id"
            :card="card"
            @edit="handleEdit"
            @duplicate="handleDuplicate"
            @delete="handleDelete"
          />
          <!-- Add Card Slot -->
          <NuxtLink
            to="/rpg/fabula-ultima-card-generator/new"
            class="empty-slot add-slot"
          >
            <span class="material-symbols-outlined">add_circle</span>
            <span>Add Card</span>
          </NuxtLink>
          <!-- Empty Slots -->
          <div v-for="i in emptySlots" :key="`empty-${i}`" class="empty-slot">
            <span>Empty Slot</span>
          </div>
        </div>
      </div>
    </main>

    <!-- Delete Confirmation Modal -->
    <DeleteCardModal
      :is-open="deleteModalOpen"
      :card-name="cardToDelete?.name || ''"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Card } from '~/shared/fabula-ultima-card-generator/types/card.types';
import { useCardStore } from '~/stores/fabula-ultima-card-generator/cards';
import CardItem from '~/features/rpg-fabula-ultima-card-generator/ui/CardItem.vue';
import DeleteCardModal from '~/features/rpg-fabula-ultima-card-generator/ui/DeleteCardModal.vue';

useHead({
  title: 'Fabula Ultima Card Creator Workspace - Projects Center',
  link: [
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Epilogue:ital,wght@0,100..900;1,100..900&display=swap',
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap',
    },
  ],
});

const cardStore = useCardStore();
const router = useRouter();

const deleteModalOpen = ref(false);
const cardToDelete = ref<Card | null>(null);

const displayedCards = computed(() => {
  return cardStore.allCards.slice(0, 9); // Show max 9 cards in grid
});

const emptySlots = computed(() => {
  const filled = displayedCards.value.length + 1; // +1 for add button
  return Math.max(0, 9 - filled);
});

function handleEdit(card: Card): void {
  router.push(`/rpg/fabula-ultima-card-generator/${card.id}/edit`);
}

function handleDuplicate(card: Card): void {
  cardStore.duplicateCard(card.id);
}

function handleDelete(card: Card): void {
  cardToDelete.value = card;
  deleteModalOpen.value = true;
}

function confirmDelete(): void {
  if (cardToDelete.value) {
    cardStore.deleteCard(cardToDelete.value.id);
    deleteModalOpen.value = false;
    cardToDelete.value = null;
  }
}

function cancelDelete(): void {
  deleteModalOpen.value = false;
  cardToDelete.value = null;
}
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Epilogue:ital,wght@0,100..900;1,100..900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

.card-generator-workspace {
  display: flex;
  height: 100vh;
  overflow: hidden;
  font-family: 'Epilogue', sans-serif;
  background: #fdf8ed;
  color: #1e293b;
}

// Global Navigation (72px)
.global-nav {
  width: 72px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem 0;
  background: #f7f2e6;
  border-right: 1px solid #e7e5e0;
  box-shadow: 4px 0 24px -12px rgba(0, 0, 0, 0.1);
  z-index: 30;
}

.nav-brand {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #296a6a 0%, #1d4f4f 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  .material-symbols-outlined {
    font-size: 24px;
  }
}

.nav-items {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  align-items: center;
}

.nav-item {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: #a8a29e;
  text-decoration: none;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    color: #296a6a;
    background: rgba(41, 106, 106, 0.1);
  }

  &.active {
    background: rgba(41, 106, 106, 0.1);
    color: #296a6a;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
  }

  .material-symbols-outlined {
    font-size: 24px;
  }
}

.nav-footer {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e2ddd6;
  border: 1px solid #d1ccc5;
}

// Main Workspace
.main-workspace {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  height: 100%;
  overflow: hidden;
}

.workspace-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fdf8ed;
  z-index: 0;
}

.grid-pattern {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(#296a6a 1px, transparent 1px);
  background-size: 24px 24px;
  opacity: 0.08;
  pointer-events: none;
}

.workspace-header {
  position: sticky;
  top: 0;
  z-index: 10;
  height: 64px;
  min-height: 64px;
  flex-shrink: 0;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(231, 229, 224, 0.5);
  background: rgba(253, 248, 237, 0.95);
  backdrop-filter: blur(8px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;

  .breadcrumb-current {
    font-weight: 600;
    color: #1e293b;
    font-size: 1rem;
  }

  .card-count {
    color: #64748b;
    font-size: 0.875rem;
  }
}

.unsaved-badge {
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  background: #fef3c7;
  color: #92400e;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: 1px solid #fde68a;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.zoom-controls {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border: 1px solid #e7e5e0;
  padding: 0.25rem;
  margin-right: 1rem;
}

.zoom-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: #f5f5f5;
  }

  .material-symbols-outlined {
    font-size: 18px;
  }
}

.zoom-value {
  padding: 0 0.75rem;
  font-size: 0.75rem;
  font-family: monospace;
  color: #475569;
  min-width: 48px;
  text-align: center;
}

.toolbar-btn {
  height: 36px;
  padding: 0 1rem;
  border-radius: 8px;
  border: 1px solid #e7e5e0;
  background: white;
  color: #475569;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;

  &:hover {
    background: #fafafa;
  }

  &.primary {
    background: #296a6a;
    color: white;
    border-color: #296a6a;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    &:hover {
      background: #1d4f4f;
    }
  }

  .material-symbols-outlined {
    font-size: 18px;
  }
}

.workspace-canvas {
  position: relative;
  z-index: 1;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 2rem;
  min-height: 0;
  width: 100%;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  width: 100%;
  max-width: 100%;
  align-content: start;
  align-items: start;
  justify-items: stretch;
}

.empty-slot {
  aspect-ratio: 63 / 88;
  width: 100%;
  border-radius: 8px;
  border: 2px dashed #cbd5e1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #cbd5e1;
  background: transparent;
  cursor: default;
  pointer-events: none;
  font-size: 0.75rem;
  font-weight: 500;
  opacity: 0.5;
  box-sizing: border-box;
  min-height: 0;

  &.add-slot {
    border-color: #94a3b8;
    color: #94a3b8;
    cursor: pointer;
    pointer-events: all;
    opacity: 1;
    transition: all 0.2s ease;
    text-decoration: none;

    &:hover {
      color: #296a6a;
      border-color: #296a6a;
      background: rgba(41, 106, 106, 0.05);
    }

    .material-symbols-outlined {
      font-size: 32px;
      margin-bottom: 0.5rem;
      transition: transform 0.2s ease;
    }

    &:hover .material-symbols-outlined {
      transform: scale(1.1);
    }
  }
}
</style>
