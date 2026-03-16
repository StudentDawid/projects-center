import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface ArtifactDef {
  id: string
  name: string
  description: string
  globalMultiplier: number // Mega mnożnik (np. 200%) na zawsze
}

const ARTIFACT_TYPES: ArtifactDef[] = [
  { id: 'skull_king_crown', name: 'Korona Króla Szkieletów', description: 'Potęga po władcy nieumarłych. Mnożnik Złota x2.', globalMultiplier: 2.0 },
  { id: 'dragon_heart', name: 'Serce Pradawnego Smoka', description: 'Serce płonie wiecznym ogniem. Mnożnik Złota x5.', globalMultiplier: 5.0 },
  { id: 'time_crystal', name: 'Kryształ Czasu', description: 'Ostrze zgina czasoprzestrzeń. Mnożnik Złota x10.', globalMultiplier: 10.0 }
]

export const useArtifactsStore = defineStore('artifacts', () => {
  const ownedArtifacts = ref<string[]>([])

  const grantArtifact = (id: string) => {
    if (!ownedArtifacts.value.includes(id)) {
      ownedArtifacts.value.push(id)
    }
  }

  const artifactsMultiplier = computed(() => {
    let multiplier = 1.0
    for (const id of ownedArtifacts.value) {
      const def = ARTIFACT_TYPES.find(d => d.id === id)
      if (def) {
        multiplier *= def.globalMultiplier
      }
    }
    return multiplier
  })

  return {
    artifactTypes: ARTIFACT_TYPES,
    ownedArtifacts,
    grantArtifact,
    artifactsMultiplier
  }
}, {
  persist: true
})
