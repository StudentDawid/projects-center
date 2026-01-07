<template>
  <div class="achievement-panel">
    <!-- Header with progress -->
    <div class="achievement-header">
      <div class="progress-display">
        <v-icon icon="mdi-trophy" class="trophy-icon" />
        <div class="progress-info">
          <span class="progress-text">
            {{ achievementStore.unlockedCount }} / {{ achievementStore.totalAchievements }}
          </span>
          <span class="progress-label">Osiągnięć</span>
        </div>
        <div class="progress-percent">{{ achievementStore.unlockedPercent }}%</div>
      </div>
      <v-progress-linear
        :model-value="achievementStore.unlockedPercent"
        color="amber"
        height="8"
        rounded
        class="mt-2"
      />
    </div>

    <!-- Bonuses Summary -->
    <div class="bonuses-summary" v-if="hasBonuses">
      <h4>🎁 Aktywne bonusy</h4>
      <div class="bonus-chips">
        <span class="bonus-chip" v-if="achievementStore.totalProductionBonus > 0">
          <v-icon icon="mdi-arrow-up-bold" size="14" />
          +{{ achievementStore.totalProductionBonus }}% produkcji
        </span>
        <span class="bonus-chip" v-if="achievementStore.totalClickBonus > 0">
          <v-icon icon="mdi-hand-pointing-up" size="14" />
          +{{ achievementStore.totalClickBonus }}% kliknięć
        </span>
        <span class="bonus-chip prestige" v-if="achievementStore.totalPrestigeBonus > 0">
          <v-icon icon="mdi-fire" size="14" />
          +{{ achievementStore.totalPrestigeBonus }}% Popiołów
        </span>
      </div>
    </div>

    <!-- Category Tabs -->
    <div class="category-tabs">
      <button
        v-for="cat in categories"
        :key="cat.id"
        class="category-tab"
        :class="{ active: selectedCategory === cat.id }"
        @click="selectedCategory = cat.id"
      >
        <v-icon :icon="cat.icon" size="18" />
        <span class="tab-name">{{ cat.name }}</span>
        <span class="tab-count">
          {{ getCategoryProgress(cat.id) }}
        </span>
      </button>
    </div>

    <!-- Achievement Grid -->
    <div class="achievement-grid">
      <div
        v-for="achievement in filteredAchievements"
        :key="achievement.id"
        class="achievement-card"
        :class="{
          'unlocked': achievementStore.isUnlocked(achievement.id),
          'hidden-achievement': achievement.hidden && !achievementStore.isUnlocked(achievement.id)
        }"
      >
        <div class="achievement-icon-wrapper">
          <v-icon
            :icon="achievement.hidden && !achievementStore.isUnlocked(achievement.id) ? 'mdi-help-circle' : achievement.icon"
            class="achievement-icon"
            :class="{ 'locked': !achievementStore.isUnlocked(achievement.id) }"
          />
          <div class="unlock-glow" v-if="achievementStore.isUnlocked(achievement.id)"></div>
        </div>

        <div class="achievement-info">
          <span class="achievement-name">
            {{ achievement.hidden && !achievementStore.isUnlocked(achievement.id) ? '???' : achievement.name }}
          </span>
          <span class="achievement-description">
            {{ achievement.hidden && !achievementStore.isUnlocked(achievement.id) ? 'Ukryte osiągnięcie' : achievement.description }}
          </span>
          <span class="achievement-reward" v-if="achievement.reward && achievementStore.isUnlocked(achievement.id)">
            🎁 {{ achievement.reward.description }}
          </span>
        </div>

        <div class="achievement-status">
          <v-icon
            v-if="achievementStore.isUnlocked(achievement.id)"
            icon="mdi-check-circle"
            class="status-icon unlocked"
          />
          <v-icon
            v-else
            icon="mdi-lock"
            class="status-icon locked"
          />
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="filteredAchievements.length === 0" class="empty-state">
        <v-icon icon="mdi-trophy-outline" size="48" />
        <p>Brak osiągnięć w tej kategorii</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAchievementStore, type AchievementCategory } from '~/stores/solmar-sanctuary/achievements';

const achievementStore = useAchievementStore();

const selectedCategory = ref<AchievementCategory>('faith');

const categories = [
  { id: 'faith' as const, name: 'Wiara', icon: 'mdi-cross' },
  { id: 'buildings' as const, name: 'Budynki', icon: 'mdi-home-group' },
  { id: 'combat' as const, name: 'Walka', icon: 'mdi-sword-cross' },
  { id: 'prestige' as const, name: 'Prestiż', icon: 'mdi-fire' },
  { id: 'clicks' as const, name: 'Kliknięcia', icon: 'mdi-hand-pointing-up' },
  { id: 'hidden' as const, name: 'Ukryte', icon: 'mdi-eye-off' },
];

const filteredAchievements = computed(() => {
  return achievementStore.achievementsByCategory[selectedCategory.value];
});

const hasBonuses = computed(() => {
  return achievementStore.totalProductionBonus > 0 ||
    achievementStore.totalClickBonus > 0 ||
    achievementStore.totalPrestigeBonus > 0;
});

function getCategoryProgress(categoryId: AchievementCategory): string {
  const categoryAchievements = achievementStore.achievementsByCategory[categoryId];
  const unlocked = categoryAchievements.filter(a => achievementStore.isUnlocked(a.id)).length;
  return `${unlocked}/${categoryAchievements.length}`;
}
</script>

<style scoped lang="scss">
.achievement-panel {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 100%;
  overflow-y: auto;
}

.achievement-header {
  padding: 1rem;
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.15), rgba(255, 152, 0, 0.2));
  border-radius: 12px;
  border: 1px solid rgba(255, 193, 7, 0.3);

  .progress-display {
    display: flex;
    align-items: center;
    gap: 0.75rem;

    .trophy-icon {
      font-size: 2.5rem;
      color: #ffc107;
    }

    .progress-info {
      flex: 1;

      .progress-text {
        display: block;
        font-size: 1.5rem;
        font-weight: bold;
        color: #ffc107;
      }

      .progress-label {
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.6);
      }
    }

    .progress-percent {
      font-size: 1.25rem;
      font-weight: bold;
      color: rgba(255, 255, 255, 0.8);
    }
  }
}

.bonuses-summary {
  padding: 0.75rem;
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 8px;

  h4 {
    margin: 0 0 0.5rem 0;
    font-size: 0.9rem;
    color: #4caf50;
  }

  .bonus-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;

    .bonus-chip {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem 0.5rem;
      background: rgba(76, 175, 80, 0.2);
      border-radius: 12px;
      font-size: 0.75rem;
      color: #4caf50;

      &.prestige {
        background: rgba(255, 140, 0, 0.2);
        color: #ff8c00;
      }
    }
  }
}

.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;

  .category-tab {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.5rem 0.75rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.85rem;

    .tab-name {
      display: none;

      @media (min-width: 600px) {
        display: inline;
      }
    }

    .tab-count {
      font-size: 0.7rem;
      padding: 0.1rem 0.3rem;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
    }

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    &.active {
      background: rgba(255, 193, 7, 0.2);
      border-color: rgba(255, 193, 7, 0.4);
      color: #ffc107;

      .tab-count {
        background: rgba(255, 193, 7, 0.3);
      }
    }
  }
}

.achievement-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.achievement-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  &.unlocked {
    background: rgba(255, 193, 7, 0.05);
    border-color: rgba(255, 193, 7, 0.3);
  }

  &.hidden-achievement {
    opacity: 0.5;
  }

  .achievement-icon-wrapper {
    position: relative;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;

    .achievement-icon {
      font-size: 2rem;
      color: #ffc107;
      z-index: 1;

      &.locked {
        color: rgba(255, 255, 255, 0.3);
      }
    }

    .unlock-glow {
      position: absolute;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle, rgba(255, 193, 7, 0.3), transparent 70%);
      border-radius: 50%;
      animation: glow-pulse 2s ease-in-out infinite;
    }
  }

  .achievement-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    min-width: 0;

    .achievement-name {
      font-weight: bold;
      color: rgba(255, 255, 255, 0.9);
      font-size: 0.95rem;
    }

    .achievement-description {
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.5);
    }

    .achievement-reward {
      font-size: 0.75rem;
      color: #4caf50;
      margin-top: 0.125rem;
    }
  }

  .achievement-status {
    .status-icon {
      font-size: 1.5rem;

      &.unlocked {
        color: #4caf50;
      }

      &.locked {
        color: rgba(255, 255, 255, 0.2);
      }
    }
  }
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.4);

  .v-icon {
    margin-bottom: 0.5rem;
  }
}

@keyframes glow-pulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
}
</style>

