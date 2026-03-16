import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface AchievementDef {
  id: string
  name: string
  description: string
  rewardText: string 
}

// Predefiniowana lista osiągnięć i ich ewentyalne wizualne nagrody.
// Ich prawdziwe wzmocnienie zaimplementujemy na poziomie sklepu game/mercenaries.
const ACHIEVEMENT_TYPES: AchievementDef[] = [
  { id: 'first_blood', name: 'Pierwsza krew', description: 'Zdobądź pierwszego najemnika.', rewardText: 'Złoto x1.1' },
  { id: 'millionaire', name: 'Złoty Skarbiec', description: 'Zbierz 1,000,000 złota w skarbcu.', rewardText: 'Złoto x2' },
  { id: 'dragon_slayer', name: 'Pogromca Smoków', description: 'Ukończ pierwszą misję Złote Łuski Smoka.', rewardText: 'Rycerz DPS x2' },
]

export const useAchievementsStore = defineStore('achievements', () => {
  const unlocked = ref<string[]>([])

  const unlock = (id: string) => {
    if (!unlocked.value.includes(id)) {
      unlocked.value.push(id)
      return true
    }
    return false
  }

  const hasAchievement = (id: string) => unlocked.value.includes(id)

  return {
    achievementTypes: ACHIEVEMENT_TYPES,
    unlocked,
    unlock,
    hasAchievement
  }
}, {
  persist: true
})
