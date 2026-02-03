<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAteriaWorldBossesStore } from '../model/world-bosses.store';
import { useAteriaWarriorStore } from '../../warrior/model/warrior.store';
import {
  WORLD_BOSSES, LEGENDARY_ITEMS, ELEMENT_DATA, DIFFICULTY_DATA,
  getWorldBoss, getLegendaryItem
} from '../data/world-bosses.data';

const worldBossesStore = useAteriaWorldBossesStore();
const warriorStore = useAteriaWarriorStore();

const activeTab = ref<'bosses' | 'fight' | 'rewards' | 'history'>('bosses');
const selectedBoss = ref<string | null>(null);

const sortedBosses = computed(() => {
  return Object.values(WORLD_BOSSES).sort((a, b) => a.tier - b.tier);
});

const selectedBossData = computed(() => {
  return selectedBoss.value ? getWorldBoss(selectedBoss.value) : null;
});

function formatTime(ms: number): string {
  if (ms <= 0) return 'Dostępny!';
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function selectBoss(bossId: string) {
  selectedBoss.value = selectedBoss.value === bossId ? null : bossId;
}

function startFight(bossId: string) {
  if (worldBossesStore.startBossFight(bossId)) {
    activeTab.value = 'fight';
    selectedBoss.value = null;
  }
}
</script>

<template>
  <div class="world-bosses-panel">
    <!-- Header Stats -->
    <v-card class="mb-4">
      <v-card-text>
        <div class="d-flex align-center">
          <v-avatar color="red-darken-2" size="56" class="mr-4">
            <v-icon size="32" color="white">mdi-skull-crossbones</v-icon>
          </v-avatar>
          <div class="flex-grow-1">
            <div class="d-flex align-center">
              <span class="text-h5 mr-2">World Bosses</span>
              <v-chip v-if="worldBossesStore.activeBosses.length > 0" size="small" color="success">
                {{ worldBossesStore.activeBosses.length }} dostępnych
              </v-chip>
            </div>
            <div class="text-body-2 text-medium-emphasis">Globalne bossowie i legendarne nagrody</div>
          </div>
        </div>

        <v-row class="mt-3">
          <v-col cols="3" class="text-center">
            <div class="text-h6">{{ worldBossesStore.totalBossKills }}</div>
            <div class="text-caption">Pokonanych</div>
          </v-col>
          <v-col cols="3" class="text-center">
            <div class="text-h6">{{ worldBossesStore.legendaryItemsObtained.size }}</div>
            <div class="text-caption">Legendarne</div>
          </v-col>
          <v-col cols="3" class="text-center">
            <div class="text-h6">{{ worldBossesStore.activeBosses.length }}</div>
            <div class="text-caption">Aktywne</div>
          </v-col>
          <v-col cols="3" class="text-center">
            <div class="text-h6">{{ warriorStore.stats.level }}</div>
            <div class="text-caption">Twój poziom</div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Active Fight -->
    <v-card v-if="worldBossesStore.isFighting && worldBossesStore.currentBoss" class="mb-4 fight-card">
      <v-card-text>
        <div class="d-flex align-center mb-3">
          <v-avatar :color="ELEMENT_DATA[worldBossesStore.currentBoss.element].color" size="64" class="mr-4">
            <v-icon size="36" color="white">{{ worldBossesStore.currentBoss.icon }}</v-icon>
          </v-avatar>
          <div class="flex-grow-1">
            <div class="text-h5">{{ worldBossesStore.currentBoss.name }}</div>
            <div class="text-subtitle-2 text-medium-emphasis">{{ worldBossesStore.currentBoss.title }}</div>
            <div v-if="worldBossesStore.currentPhase" class="text-caption mt-1">
              <v-chip size="x-small" :color="ELEMENT_DATA[worldBossesStore.currentBoss.element].color">
                {{ worldBossesStore.currentPhase.name }}
              </v-chip>
            </div>
          </div>
          <v-btn color="warning" variant="tonal" @click="worldBossesStore.fleeFight()">
            <v-icon>mdi-run</v-icon>
            Uciekaj
          </v-btn>
        </div>

        <!-- Boss HP Bar -->
        <div class="mb-3">
          <div class="d-flex justify-space-between text-caption mb-1">
            <span>HP Bossa</span>
            <span>{{ Math.floor(worldBossesStore.activeFight!.currentHp).toLocaleString() }} / {{ worldBossesStore.activeFight!.maxHp.toLocaleString() }}</span>
          </div>
          <v-progress-linear
            :model-value="100 - worldBossesStore.fightProgress"
            :color="ELEMENT_DATA[worldBossesStore.currentBoss.element].color"
            height="24"
            rounded
          >
            <template #default>
              {{ (100 - worldBossesStore.fightProgress).toFixed(1) }}%
            </template>
          </v-progress-linear>
        </div>

        <!-- Fight Stats -->
        <v-row>
          <v-col cols="4" class="text-center">
            <div class="text-h6 text-success">{{ worldBossesStore.activeFight!.playerDamageDealt.toLocaleString() }}</div>
            <div class="text-caption">Zadane obrażenia</div>
          </v-col>
          <v-col cols="4" class="text-center">
            <div class="text-h6 text-error">{{ worldBossesStore.activeFight!.playerDamageTaken.toLocaleString() }}</div>
            <div class="text-caption">Otrzymane</div>
          </v-col>
          <v-col cols="4" class="text-center">
            <div class="text-h6">{{ formatDuration(Math.floor(worldBossesStore.activeFight!.ticksElapsed / 10)) }}</div>
            <div class="text-caption">Czas walki</div>
          </v-col>
        </v-row>

        <!-- Phase indicator -->
        <div v-if="worldBossesStore.currentPhase" class="mt-3 pa-2 bg-grey-darken-3 rounded">
          <div class="text-caption text-warning">{{ worldBossesStore.currentPhase.description }}</div>
          <div class="text-caption">Mnożnik obrażeń: x{{ worldBossesStore.currentPhase.damageMultiplier }}</div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Tabs -->
    <v-tabs v-model="activeTab" color="red-darken-2" class="mb-4">
      <v-tab value="bosses">
        <v-icon start>mdi-skull</v-icon>
        Bossowie
      </v-tab>
      <v-tab value="fight" :disabled="!worldBossesStore.isFighting">
        <v-icon start>mdi-sword-cross</v-icon>
        Walka
      </v-tab>
      <v-tab value="rewards">
        <v-icon start>mdi-treasure-chest</v-icon>
        Nagrody ({{ worldBossesStore.legendaryItemsObtained.size }})
      </v-tab>
      <v-tab value="history">
        <v-icon start>mdi-history</v-icon>
        Historia
      </v-tab>
    </v-tabs>

    <!-- Bosses List -->
    <div v-if="activeTab === 'bosses'">
      <v-row>
        <v-col v-for="boss in sortedBosses" :key="boss.id" cols="12" md="6">
          <v-card
            :variant="selectedBoss === boss.id ? 'elevated' : 'outlined'"
            :class="{
              'border-success': worldBossesStore.getTimeUntilSpawn(boss.id) <= 0 && warriorStore.stats.level >= boss.requiredLevel,
              'opacity-60': warriorStore.stats.level < boss.requiredLevel
            }"
            @click="selectBoss(boss.id)"
            style="cursor: pointer"
          >
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-avatar :color="ELEMENT_DATA[boss.element].color" size="56">
                  <v-icon size="32" color="white">{{ boss.icon }}</v-icon>
                </v-avatar>
                <div class="ml-3 flex-grow-1">
                  <div class="text-h6">{{ boss.name }}</div>
                  <div class="text-caption text-medium-emphasis">{{ boss.title }}</div>
                  <div class="d-flex align-center gap-1 mt-1">
                    <v-chip size="x-small" :color="DIFFICULTY_DATA[boss.difficulty].color">
                      <v-icon v-for="n in DIFFICULTY_DATA[boss.difficulty].stars" :key="n" size="10">mdi-star</v-icon>
                    </v-chip>
                    <v-chip size="x-small" :color="ELEMENT_DATA[boss.element].color">
                      <v-icon size="12" start>{{ ELEMENT_DATA[boss.element].icon }}</v-icon>
                      {{ ELEMENT_DATA[boss.element].name }}
                    </v-chip>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-caption">Pokonany: {{ worldBossesStore.getBossKillCount(boss.id) }}x</div>
                  <div class="text-caption" :class="worldBossesStore.getTimeUntilSpawn(boss.id) <= 0 ? 'text-success' : 'text-warning'">
                    {{ formatTime(worldBossesStore.getTimeUntilSpawn(boss.id)) }}
                  </div>
                </div>
              </div>

              <div class="text-body-2 mb-2">{{ boss.description }}</div>

              <!-- Stats -->
              <div class="d-flex flex-wrap gap-1 mb-2">
                <v-chip size="x-small" color="red" variant="outlined">HP: {{ (boss.baseHp / 1000).toFixed(0) }}k</v-chip>
                <v-chip size="x-small" color="orange" variant="outlined">ATK: {{ boss.attack }}</v-chip>
                <v-chip size="x-small" color="blue" variant="outlined">DEF: {{ boss.defense }}</v-chip>
                <v-chip size="x-small" color="purple" variant="outlined">Lvl {{ boss.requiredLevel }}+</v-chip>
              </div>

              <!-- Requirements -->
              <div v-if="warriorStore.stats.level < boss.requiredLevel" class="text-caption text-error mb-2">
                <v-icon size="small">mdi-lock</v-icon>
                Wymaga poziomu {{ boss.requiredLevel }}
              </div>
              <div v-else-if="boss.requiredKills && worldBossesStore.totalBossKills < boss.requiredKills" class="text-caption text-warning mb-2">
                <v-icon size="small">mdi-lock</v-icon>
                Pokonaj {{ boss.requiredKills }} innych bossów ({{ worldBossesStore.totalBossKills }}/{{ boss.requiredKills }})
              </div>

              <!-- Rewards preview -->
              <div class="mb-2">
                <div class="text-caption text-medium-emphasis mb-1">Nagrody:</div>
                <div class="d-flex flex-wrap gap-1">
                  <v-chip size="x-small" color="amber">{{ boss.baseGold.toLocaleString() }}g</v-chip>
                  <v-chip size="x-small" color="green">{{ boss.baseXp.toLocaleString() }} XP</v-chip>
                  <v-chip size="x-small" color="purple">{{ boss.legacyPoints }} LP</v-chip>
                  <v-chip v-for="reward in boss.legendaryRewards.slice(0, 2)" :key="reward.id" size="x-small" :color="reward.rarity === 'mythic' ? 'purple' : 'orange'" variant="outlined">
                    {{ reward.name }}
                  </v-chip>
                </div>
              </div>

              <!-- Fight button -->
              <v-btn
                block
                color="red-darken-2"
                :disabled="!worldBossesStore.canFightBoss(boss.id).canFight"
                @click.stop="startFight(boss.id)"
              >
                <v-icon start>mdi-sword</v-icon>
                {{ worldBossesStore.canFightBoss(boss.id).canFight ? 'Walcz!' : worldBossesStore.canFightBoss(boss.id).reason }}
              </v-btn>
            </v-card-text>

            <!-- Expanded details -->
            <v-expand-transition>
              <div v-if="selectedBoss === boss.id">
                <v-divider />
                <v-card-text>
                  <div class="text-caption font-italic mb-3">"{{ boss.lore }}"</div>

                  <div class="text-subtitle-2 mb-2">Umiejętności:</div>
                  <div v-for="ability in boss.abilities" :key="ability.id" class="mb-1">
                    <v-chip size="x-small" color="error" class="mr-2">{{ ability.damage || 'Efekt' }}</v-chip>
                    <span class="text-caption">{{ ability.name }}: {{ ability.description }}</span>
                  </div>

                  <div class="text-subtitle-2 mt-3 mb-2">Fazy:</div>
                  <div v-for="phase in boss.phases" :key="phase.name" class="mb-1">
                    <v-chip size="x-small" :color="phase.damageMultiplier > 1.5 ? 'error' : phase.damageMultiplier > 1 ? 'warning' : 'success'" class="mr-2">
                      x{{ phase.damageMultiplier }}
                    </v-chip>
                    <span class="text-caption">{{ phase.name }} (≤{{ phase.hpThreshold }}% HP)</span>
                  </div>
                </v-card-text>
              </div>
            </v-expand-transition>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Fight Tab (shows when fighting) -->
    <div v-if="activeTab === 'fight'">
      <v-card v-if="!worldBossesStore.isFighting">
        <v-card-text class="text-center py-8 text-medium-emphasis">
          <v-icon size="48" class="mb-2">mdi-sword-cross</v-icon>
          <div>Nie trwa żadna walka</div>
          <div class="text-caption">Wybierz bossa z zakładki "Bossowie"</div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Rewards Tab -->
    <div v-if="activeTab === 'rewards'">
      <v-card v-if="worldBossesStore.legendaryItemsObtained.size === 0">
        <v-card-text class="text-center py-8 text-medium-emphasis">
          <v-icon size="48" class="mb-2">mdi-treasure-chest</v-icon>
          <div>Brak zdobytych legendarnych przedmiotów</div>
          <div class="text-caption">Pokonuj bossów, aby zdobyć legendarne nagrody!</div>
        </v-card-text>
      </v-card>

      <v-row v-else>
        <v-col v-for="itemId in worldBossesStore.legendaryItemsObtained" :key="itemId" cols="12" md="6" lg="4">
          <v-card v-if="getLegendaryItem(itemId)" variant="elevated" :class="getLegendaryItem(itemId)?.rarity === 'mythic' ? 'mythic-border' : 'legendary-border'">
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-avatar :color="getLegendaryItem(itemId)?.rarity === 'mythic' ? 'purple' : 'orange'" size="48">
                  <v-icon color="white">{{ getLegendaryItem(itemId)?.icon }}</v-icon>
                </v-avatar>
                <div class="ml-3">
                  <div class="text-subtitle-1 font-weight-medium">{{ getLegendaryItem(itemId)?.name }}</div>
                  <v-chip size="x-small" :color="getLegendaryItem(itemId)?.rarity === 'mythic' ? 'purple' : 'orange'">
                    {{ getLegendaryItem(itemId)?.rarity === 'mythic' ? 'Mityczny' : 'Legendarny' }}
                  </v-chip>
                </div>
              </div>
              <div class="text-body-2 mb-2">{{ getLegendaryItem(itemId)?.description }}</div>
              
              <!-- Stats -->
              <div v-if="getLegendaryItem(itemId)?.stats && Object.keys(getLegendaryItem(itemId)?.stats || {}).length > 0" class="mb-2">
                <v-chip v-for="(value, stat) in getLegendaryItem(itemId)?.stats" :key="stat" size="x-small" color="success" variant="outlined" class="mr-1 mb-1">
                  +{{ value }} {{ stat }}
                </v-chip>
              </div>
              
              <!-- Effects -->
              <div v-if="getLegendaryItem(itemId)?.effects">
                <div v-for="effect in getLegendaryItem(itemId)?.effects" :key="effect.name" class="text-caption text-warning">
                  <v-icon size="small">mdi-star</v-icon>
                  {{ effect.name }}: {{ effect.description }}
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Boss Materials -->
      <v-card v-if="worldBossesStore.bossInventory.size > 0" class="mt-4">
        <v-card-title>Materiały z bossów</v-card-title>
        <v-card-text>
          <div class="d-flex flex-wrap gap-2">
            <v-chip v-for="[materialId, amount] in worldBossesStore.bossInventory" :key="materialId" color="amber" variant="outlined">
              {{ materialId }}: {{ amount }}
            </v-chip>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- History Tab -->
    <div v-if="activeTab === 'history'">
      <v-card v-if="worldBossesStore.killHistory.length === 0">
        <v-card-text class="text-center py-8 text-medium-emphasis">
          <v-icon size="48" class="mb-2">mdi-history</v-icon>
          <div>Brak historii walk</div>
        </v-card-text>
      </v-card>

      <v-list v-else>
        <v-list-item v-for="(record, idx) in worldBossesStore.killHistory.slice(0, 20)" :key="idx">
          <template #prepend>
            <v-avatar :color="ELEMENT_DATA[getWorldBoss(record.bossId)?.element || 'fire'].color" size="40">
              <v-icon color="white">{{ getWorldBoss(record.bossId)?.icon }}</v-icon>
            </v-avatar>
          </template>
          <v-list-item-title>{{ getWorldBoss(record.bossId)?.name }}</v-list-item-title>
          <v-list-item-subtitle>
            {{ new Date(record.killedAt).toLocaleDateString() }} • 
            {{ record.damageDealt.toLocaleString() }} obrażeń • 
            {{ formatDuration(record.timeToKill) }}
          </v-list-item-subtitle>
          <template #append>
            <div class="text-caption text-success">
              {{ record.rewardsReceived.slice(0, 2).join(', ') }}
            </div>
          </template>
        </v-list-item>
      </v-list>
    </div>
  </div>
</template>

<style scoped>
.fight-card {
  background: linear-gradient(135deg, rgba(198, 40, 40, 0.1), rgba(0, 0, 0, 0.2));
  border: 2px solid rgb(var(--v-theme-error));
}

.legendary-border {
  border: 2px solid #FF9800 !important;
}

.mythic-border {
  border: 2px solid #9C27B0 !important;
  box-shadow: 0 0 10px rgba(156, 39, 176, 0.3);
}

.border-success {
  border-color: rgb(var(--v-theme-success)) !important;
  border-width: 2px !important;
}

.opacity-60 {
  opacity: 0.6;
}
</style>
