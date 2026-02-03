<template>
  <div class="card-generator-workspace">
    <!-- Global Navigation -->
    <nav class="global-nav">
      <div class="nav-brand">
        <span class="material-symbols-outlined">diamond</span>
      </div>
      <div class="nav-items">
        <NuxtLink
          to="/rpg/fabula-ultima-card-generator"
          class="nav-item"
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

    <!-- Main Workspace -->
    <main class="main-workspace">
      <!-- Background Layer -->
      <div class="workspace-bg">
        <div class="grid-pattern" />
      </div>

      <!-- Top Action Bar -->
      <header class="workspace-header">
        <div class="breadcrumbs">
          <NuxtLink
            to="/rpg/fabula-ultima-card-generator"
            class="breadcrumb-link"
          >
            My Cards
          </NuxtLink>
          <span class="material-symbols-outlined breadcrumb-separator">chevron_right</span>
          <span class="breadcrumb-current">New Card</span>
        </div>
        <div class="toolbar">
          <NuxtLink
            to="/rpg/fabula-ultima-card-generator"
            class="toolbar-btn"
          >
            <span class="material-symbols-outlined">arrow_back</span>
            Back
          </NuxtLink>
        </div>
      </header>

      <!-- Content -->
      <div class="workspace-content">
        <div class="loading-container">
          <p>Tworzenie nowej karty...</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { Card } from '@shared/entities/card';
import {
  CardType as CardTypeEnum,
  Rarity as RarityEnum,
  AccuracyStat as AccuracyStatEnum,
  DamageType as DamageTypeEnum,
  WeaponType as WeaponTypeEnum,
  WeaponHands as WeaponHandsEnum,
} from '@shared/entities/card';
import { useCardStore } from '@shared/entities/card/lib/useCardStore';

useHead({
  title: 'Dodaj kartę - Generator Kart Fabula Ultima',
});

const router = useRouter();
const cardStore = useCardStore();

// Create empty card and redirect to edit
onMounted(() => {
  const emptyCard: Card = {
    id: cardStore.generateId(),
    name: '',
    type: CardTypeEnum.EQUIPMENT,
    description: '',
    tags: [],
    slot: 'weapon',
    rarity: RarityEnum.COMMON,
    buyValue: 100,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCj7YlMf8R-HRaoS0_Fxl2H3wSEOWSDM7l9vLXS3ggeDKXH62lIFUWFPqN5gN6ZaAf69q5wcwfEQIE7FDtuGCobNQ46MqiQwayhkCgu_99fAX1s9SptKPP0qSNW9RI5vvLSc1vNWBGAY0waXYPzfERe8IPsIfsKDCID20g3htbDp5lynRGFUTlGYmAEg5zBTwAUrdUpBxHIN6aq0fLj19oL-0amb1nfWhqC4HiO7Dfl_C45kiKudddOxoSML8jqzEH2Z7ga6m7SvaM',
    weaponType: WeaponTypeEnum.MELEE,
    weaponHands: WeaponHandsEnum.ONE_HANDED,
    stats: {
      accuracy: {
        stat1: AccuracyStatEnum.ZR,
        stat2: AccuracyStatEnum.PO,
        modifier: 0,
      },
      damage: {
        modifier: 0,
        type: DamageTypeEnum.PHYSICAL,
      },
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Card;

  cardStore.addCard(emptyCard);
  router.push(`/rpg/fabula-ultima-card-generator/${emptyCard.id}/edit`);
});
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
  border: none;
  background: none;
  cursor: pointer;

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
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
}

.breadcrumb-link {
  color: #5e8787;
  text-decoration: none;
  transition: color 0.2s;

  &:hover {
    color: #296a6a;
    text-decoration: underline;
  }
}

.breadcrumb-separator {
  font-size: 16px;
  color: #d5e2e2;
}

.breadcrumb-current {
  color: #111818;
  font-weight: 700;
  background: #eaf0f0;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #d5e2e2;
  background: white;
  color: #111818;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    background: #f0f4f4;
    border-color: #b0caca;
  }

  .material-symbols-outlined {
    font-size: 18px;
  }
}

.workspace-content {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  position: relative;
  z-index: 1;
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #5e8787;
  font-size: 1rem;
}
</style>

