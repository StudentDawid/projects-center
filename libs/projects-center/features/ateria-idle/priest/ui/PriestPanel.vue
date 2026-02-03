<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAteriaPriestStore } from '../model/priest.store';
import { DEITIES, PRAYERS, RITUALS, HOLY_RELICS, DOMAIN_DATA, getPrayersByDeity } from '../data/priest.data';

const priestStore = useAteriaPriestStore();
const activeTab = ref<'prayers' | 'rituals' | 'deities' | 'relics'>('prayers');

const filteredPrayers = computed(() => {
  if (!priestStore.devotedDeity) return [];
  return getPrayersByDeity(priestStore.devotedDeity).filter(p => p.requiredLevel <= priestStore.progress.level);
});
</script>

<template>
  <div class="priest-panel">
    <v-card class="mb-4">
      <v-card-text>
        <div class="d-flex align-center">
          <v-avatar color="amber" size="56" class="mr-4"><v-icon size="32" color="white">mdi-hands-pray</v-icon></v-avatar>
          <div class="flex-grow-1">
            <div class="d-flex align-center">
              <span class="text-h5 mr-2">Kapłan</span>
              <v-chip size="small" color="amber">Poziom {{ priestStore.progress.level }}</v-chip>
            </div>
            <div class="text-body-2 text-medium-emphasis">Wiara, modlitwy, błogosławieństwa</div>
            <v-progress-linear :model-value="priestStore.getXpProgress()" color="amber" height="8" rounded class="mt-2">
              <template #default><span class="text-caption">{{ priestStore.progress.xp }} / {{ priestStore.progress.xpToNextLevel }} XP</span></template>
            </v-progress-linear>
          </div>
        </div>
        
        <v-progress-linear :model-value="(priestStore.faith / priestStore.maxFaith) * 100" color="yellow" height="16" rounded class="mt-3">
          <template #default><span class="text-caption">Wiara: {{ Math.floor(priestStore.faith) }} / {{ priestStore.maxFaith }}</span></template>
        </v-progress-linear>

        <v-row class="mt-3">
          <v-col cols="3" class="text-center"><div class="text-h6">{{ priestStore.currentDeity?.name || '-' }}</div><div class="text-caption">Bóstwo</div></v-col>
          <v-col cols="3" class="text-center"><div class="text-h6">{{ priestStore.currentFavor }}</div><div class="text-caption">Łaska</div></v-col>
          <v-col cols="3" class="text-center"><div class="text-h6">{{ priestStore.totalPrayersCast }}</div><div class="text-caption">Modlitwy</div></v-col>
          <v-col cols="3" class="text-center"><div class="text-h6">{{ priestStore.activePrayers.length }}</div><div class="text-caption">Aktywne</div></v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card v-if="priestStore.isPerformingRitual && priestStore.activeRitual" class="mb-4">
      <v-card-text>
        <div class="d-flex align-center mb-2">
          <v-avatar color="amber" size="48" class="mr-3"><v-icon color="white">{{ RITUALS[priestStore.activeRitual.ritualId]?.icon }}</v-icon></v-avatar>
          <div class="flex-grow-1">
            <div class="text-h6">Rytuał: {{ RITUALS[priestStore.activeRitual.ritualId]?.name }}</div>
            <v-progress-linear :model-value="priestStore.ritualProgress" color="amber" height="20" rounded><template #default>{{ Math.floor(priestStore.ritualProgress) }}%</template></v-progress-linear>
          </div>
          <v-btn color="error" variant="tonal" class="ml-3" @click="priestStore.cancelRitual()">Anuluj</v-btn>
        </div>
      </v-card-text>
    </v-card>

    <v-tabs v-model="activeTab" color="amber" class="mb-4">
      <v-tab value="prayers"><v-icon start>mdi-hands-pray</v-icon>Modlitwy</v-tab>
      <v-tab value="rituals"><v-icon start>mdi-candle</v-icon>Rytuały</v-tab>
      <v-tab value="deities"><v-icon start>mdi-star</v-icon>Bóstwa</v-tab>
      <v-tab value="relics"><v-icon start>mdi-cross</v-icon>Relikwie</v-tab>
    </v-tabs>

    <div v-if="activeTab === 'prayers'">
      <v-row>
        <v-col v-for="prayer in filteredPrayers" :key="prayer.id" cols="12" md="6" lg="4">
          <v-card variant="outlined">
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-avatar :color="DOMAIN_DATA[DEITIES[prayer.deityId]?.domain || 'light'].color" size="48"><v-icon color="white">{{ prayer.icon }}</v-icon></v-avatar>
                <div class="ml-3">
                  <div class="text-subtitle-1 font-weight-medium">{{ prayer.name }}</div>
                  <div class="text-caption text-medium-emphasis">Tier {{ prayer.tier }} • {{ prayer.faithCost }} wiary</div>
                </div>
              </div>
              <div class="text-body-2 mb-2">{{ prayer.description }}</div>
              <div class="mb-2">
                <v-chip v-for="(effect, idx) in prayer.effects" :key="idx" size="x-small" color="primary" variant="outlined" class="mr-1">{{ effect.description }}</v-chip>
              </div>
              <v-btn block color="amber" :disabled="!priestStore.canPray(prayer.id).canPray" @click="priestStore.castPrayer(prayer.id)"><v-icon start>mdi-hands-pray</v-icon>Módl się</v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <div v-if="activeTab === 'rituals'">
      <v-row>
        <v-col v-for="ritual in Object.values(RITUALS)" :key="ritual.id" cols="12" md="6">
          <v-card variant="outlined">
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-avatar color="amber" size="48"><v-icon color="white">{{ ritual.icon }}</v-icon></v-avatar>
                <div class="ml-3">
                  <div class="text-subtitle-1 font-weight-medium">{{ ritual.name }}</div>
                  <div class="text-caption">Tier {{ ritual.tier }} • Lvl {{ ritual.requiredLevel }}</div>
                </div>
              </div>
              <div class="text-body-2 mb-2">{{ ritual.description }}</div>
              <div class="d-flex flex-wrap gap-1 mb-2">
                <v-chip size="x-small" color="yellow">{{ ritual.faithCost }} wiary</v-chip>
                <v-chip size="x-small" color="amber">{{ ritual.goldCost }}g</v-chip>
              </div>
              <div class="mb-2">
                <v-chip v-for="(effect, idx) in ritual.effects" :key="idx" size="x-small" color="success" variant="outlined" class="mr-1">{{ effect.description }}</v-chip>
              </div>
              <v-btn block color="amber" :disabled="!priestStore.canPerformRitual(ritual.id).canPerform" @click="priestStore.startRitual(ritual.id)"><v-icon start>mdi-candle</v-icon>Odpraw</v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <div v-if="activeTab === 'deities'">
      <v-row>
        <v-col v-for="deity in Object.values(DEITIES)" :key="deity.id" cols="12" md="6" lg="4">
          <v-card :variant="priestStore.devotedDeity === deity.id ? 'elevated' : 'outlined'" :class="{ 'border-primary': priestStore.devotedDeity === deity.id }">
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-avatar :color="DOMAIN_DATA[deity.domain].color" size="56"><v-icon color="white" size="32">{{ deity.icon }}</v-icon></v-avatar>
                <div class="ml-3">
                  <div class="text-h6">{{ deity.name }}</div>
                  <div class="text-caption">{{ DOMAIN_DATA[deity.domain].name }}</div>
                </div>
              </div>
              <div class="text-body-2 mb-2">{{ deity.description }}</div>
              <div class="mb-2">
                <v-chip v-for="(bonus, idx) in deity.favorBonus" :key="idx" size="x-small" color="success" class="mr-1">+{{ bonus.value }}% {{ bonus.stat }}</v-chip>
              </div>
              <div class="text-caption mb-2">Łaska: {{ priestStore.deityFavor.get(deity.id) || 0 }}</div>
              <v-btn v-if="priestStore.devotedDeity !== deity.id" block color="amber" @click="priestStore.devoteToDeity(deity.id)">Poświęć się</v-btn>
              <v-chip v-else color="success" block>Oddany</v-chip>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <div v-if="activeTab === 'relics'">
      <v-row>
        <v-col v-for="relic in Object.values(HOLY_RELICS)" :key="relic.id" cols="12" md="6" lg="4">
          <v-card :variant="priestStore.ownedRelics.has(relic.id) ? 'elevated' : 'outlined'" :class="{ 'border-primary': priestStore.equippedRelic === relic.id }">
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-icon size="36" :color="priestStore.ownedRelics.has(relic.id) ? 'amber' : 'grey'">{{ relic.icon }}</v-icon>
                <div class="ml-3">
                  <div class="font-weight-medium">{{ relic.name }}</div>
                  <div class="text-caption">Tier {{ relic.tier }} • Lvl {{ relic.requiredLevel }}</div>
                </div>
              </div>
              <div class="text-body-2 mb-2">{{ relic.description }}</div>
              <div class="text-caption mb-2">+{{ relic.faithBonus }} wiara • +{{ relic.prayerPower }}% moc modlitw</div>
              <v-btn v-if="!priestStore.ownedRelics.has(relic.id)" size="small" color="amber" block :disabled="relic.requiredLevel > priestStore.progress.level" @click="priestStore.buyRelic(relic.id)">Kup ({{ relic.cost }}g)</v-btn>
              <v-btn v-else-if="priestStore.equippedRelic !== relic.id" size="small" color="primary" block @click="priestStore.equipRelic(relic.id)">Załóż</v-btn>
              <v-chip v-else color="success" block>Założona</v-chip>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<style scoped>
.border-primary { border-color: rgb(var(--v-theme-primary)) !important; border-width: 2px !important; }
</style>
