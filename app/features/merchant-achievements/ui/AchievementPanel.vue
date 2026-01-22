<template>
  <v-card color="#111" class="mt-4">
    <v-card-title class="d-flex align-center justify-space-between">
      <span class="text-overline text-grey-lighten-1 d-flex align-center gap-2">
        <v-icon>mdi-trophy</v-icon>
        Osiągnięcia
      </span>
      <v-chip size="small" color="amber-darken-3" variant="flat">
        {{ achievementStore.unlockedCount }} / {{ achievementStore.totalAchievements }}
      </v-chip>
    </v-card-title>

    <v-progress-linear
      :model-value="achievementStore.unlockedPercent"
      color="amber-darken-3"
      height="6"
      rounded
      class="mx-4 mb-4"
    />

    <!-- Bonuses Summary -->
    <v-card-text v-if="hasBonuses" class="pb-2">
      <div class="text-caption text-grey mb-2">Aktywne bonusy:</div>
      <div class="d-flex flex-wrap gap-2">
        <v-chip
          v-if="achievementStore.totalProductionBonus > 0"
          size="x-small"
          color="green-darken-2"
          variant="flat"
        >
          <v-icon start size="small">mdi-arrow-up-bold</v-icon>
          +{{ achievementStore.totalProductionBonus }}% produkcji
        </v-chip>
        <v-chip
          v-if="achievementStore.totalClickBonus > 0"
          size="x-small"
          color="blue-darken-2"
          variant="flat"
        >
          <v-icon start size="small">mdi-hand-pointing-up</v-icon>
          +{{ achievementStore.totalClickBonus }}% kliknięć
        </v-chip>
        <v-chip
          v-if="achievementStore.totalReputationBonus > 0"
          size="x-small"
          color="purple-darken-2"
          variant="flat"
        >
          <v-icon start size="small">mdi-star</v-icon>
          +{{ achievementStore.totalReputationBonus }}% reputacji
        </v-chip>
      </div>
    </v-card-text>

    <v-divider />

    <!-- Category Tabs -->
    <v-tabs v-model="selectedCategory" color="amber-darken-3" class="px-2">
      <v-tab
        v-for="cat in categories"
        :key="cat.id"
        :value="cat.id"
        size="small"
      >
        <v-icon start size="small">{{ cat.icon }}</v-icon>
        {{ cat.name }}
        <v-chip
          size="x-small"
          class="ml-1"
          :color="getCategoryColor(cat.id)"
          variant="flat"
        >
          {{ getCategoryProgress(cat.id) }}
        </v-chip>
      </v-tab>
    </v-tabs>

    <v-divider />

    <!-- Achievement Grid -->
    <v-card-text class="pa-2">
      <div class="achievement-grid">
        <v-card
          v-for="achievement in filteredAchievements"
          :key="achievement.id"
          class="achievement-card"
          :class="{
            'unlocked': achievementStore.isUnlocked(achievement.id),
            'locked': !achievementStore.isUnlocked(achievement.id),
            'hidden-achievement': achievement.hidden && !achievementStore.isUnlocked(achievement.id)
          }"
          variant="outlined"
          :color="achievementStore.isUnlocked(achievement.id) ? 'amber-darken-3' : 'grey-darken-3'"
        >
          <div class="d-flex align-center pa-3">
            <div class="achievement-icon-wrapper mr-3">
              <v-icon
                :icon="achievement.hidden && !achievementStore.isUnlocked(achievement.id) ? 'mdi-help-circle' : achievement.icon"
                size="32"
                :color="achievementStore.isUnlocked(achievement.id) ? 'amber-lighten-2' : 'grey'"
              />
              <div
                v-if="achievementStore.isUnlocked(achievement.id)"
                class="unlock-badge"
              >
                <v-icon size="small" color="amber">mdi-check-circle</v-icon>
              </div>
            </div>

            <div class="flex-grow-1">
              <div
                class="text-subtitle-2 font-weight-bold"
                :class="achievementStore.isUnlocked(achievement.id) ? 'text-amber-lighten-2' : 'text-grey'"
              >
                {{ achievement.hidden && !achievementStore.isUnlocked(achievement.id) ? '???' : achievement.name }}
              </div>
              <div
                class="text-caption mt-1"
                :class="achievementStore.isUnlocked(achievement.id) ? 'text-grey-lighten-1' : 'text-grey-darken-1'"
              >
                {{ achievement.hidden && !achievementStore.isUnlocked(achievement.id) ? 'Ukryte osiągnięcie' : achievement.description }}
              </div>
              <div
                v-if="achievement.reward && achievementStore.isUnlocked(achievement.id)"
                class="text-caption text-green-lighten-2 mt-1"
              >
                <v-icon size="small">mdi-gift</v-icon>
                {{ achievement.reward.description }}
              </div>
            </div>
          </div>
        </v-card>
      </div>

      <div v-if="filteredAchievements.length === 0" class="text-center text-grey pa-4">
        Brak osiągnięć w tej kategorii
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAchievementStore } from '~/entities/merchant-achievements';
import type { AchievementCategory } from '~/entities/merchant-achievements';

const achievementStore = useAchievementStore();
const selectedCategory = ref<AchievementCategory>('gold');

const categories = [
  { id: 'gold' as AchievementCategory, name: 'Złoto', icon: 'mdi-coins' },
  { id: 'workers' as AchievementCategory, name: 'Pracownicy', icon: 'mdi-account-group' },
  { id: 'cities' as AchievementCategory, name: 'Miasta', icon: 'mdi-map-marker' },
  { id: 'caravans' as AchievementCategory, name: 'Karawany', icon: 'mdi-truck-delivery' },
  { id: 'clicks' as AchievementCategory, name: 'Kliknięcia', icon: 'mdi-hand-pointing-up' },
  { id: 'prestige' as AchievementCategory, name: 'Prestiż', icon: 'mdi-church' },
  { id: 'factors' as AchievementCategory, name: 'Faktory', icon: 'mdi-account-tie' },
  { id: 'hidden' as AchievementCategory, name: 'Ukryte', icon: 'mdi-help-circle' },
];

const filteredAchievements = computed(() => {
  return achievementStore.achievements.filter(
    (a) => a.category === selectedCategory.value
  );
});

const hasBonuses = computed(() => {
  return (
    achievementStore.totalProductionBonus > 0 ||
    achievementStore.totalClickBonus > 0 ||
    achievementStore.totalReputationBonus > 0
  );
});

function getCategoryProgress(categoryId: AchievementCategory): string {
  const categoryAchievements = achievementStore.achievements.filter(
    (a) => a.category === categoryId
  );
  const unlocked = categoryAchievements.filter((a) =>
    achievementStore.isUnlocked(a.id)
  ).length;
  return `${unlocked}/${categoryAchievements.length}`;
}

function getCategoryColor(categoryId: AchievementCategory): string {
  const categoryAchievements = achievementStore.achievements.filter(
    (a) => a.category === categoryId
  );
  const unlocked = categoryAchievements.filter((a) =>
    achievementStore.isUnlocked(a.id)
  ).length;
  const total = categoryAchievements.length;
  if (unlocked === total) return 'green';
  if (unlocked > 0) return 'amber';
  return 'grey';
}
</script>

<style scoped>
.achievement-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.achievement-card {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.achievement-card.unlocked {
  border-color: rgba(255, 179, 0, 0.5) !important;
  background: rgba(255, 179, 0, 0.05) !important;
}

.achievement-card.locked {
  opacity: 0.6;
}

.achievement-card.hidden-achievement {
  background: rgba(100, 100, 100, 0.1) !important;
}

.achievement-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.unlock-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 50%;
  padding: 2px;
}
</style>
