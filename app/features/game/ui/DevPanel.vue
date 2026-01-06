<script setup lang="ts">
/**
 * Developer Panel - Quick testing tools
 * Toggle with ` (backtick) key or click the DEV button
 */
import { ref, computed } from 'vue';
import { useResourceStore } from '~/stores/resources';
import { useEntityStore } from '~/stores/entities';
import { useCombatStore } from '~/stores/combat';
import { useEventStore } from '~/stores/events';
import { useRelicStore, RARITY_NAMES } from '~/stores/relics';
import type { ResourceId, EntityId, RelicRarity } from '~/shared/types/game.types';

const resourceStore = useResourceStore();
const entityStore = useEntityStore();
const combatStore = useCombatStore();
const eventStore = useEventStore();
const relicStore = useRelicStore();

const isOpen = ref(false);

// Speed multiplier options
const speedOptions = [1, 2, 5, 10, 50, 100];
const currentSpeed = computed(() => resourceStore.globalProductionMultiplier);

// Resource amounts to add
const resourceAmounts: Record<ResourceId, number> = {
  faith: 1000,
  ducats: 500,
  biomass: 500,
  souls: 100,
  rage: 50,
};

// Entity amounts to add
const entityAmounts: Record<EntityId, number> = {
  chapel: 10,
  tithe_collector: 5,
  flagellant: 5,
  altar_tank: 1,
  flesh_puppet: 10,
  infected_stormtrooper: 5,
};

function toggle() {
  isOpen.value = !isOpen.value;
}

function addResource(id: ResourceId) {
  resourceStore.devAddResource(id, resourceAmounts[id]);
}

function addEntity(id: EntityId) {
  const entity = entityStore.entities[id];
  if (entity) {
    entity.unlocked = true;
    entityStore.devSetCount(id, entity.count + entityAmounts[id]);
    entityStore.updateProductionRates();
  }
}

function setSpeed(multiplier: number) {
  resourceStore.devSetSpeedMultiplier(multiplier);
}

function unlockAll() {
  entityStore.devUnlockAll();
}

function resetGame() {
  if (confirm('Na pewno chcesz zresetować grę? Wszystkie postępy zostaną utracone!')) {
    resourceStore.devResetAll();
    entityStore.resetForPrestige();
    combatStore.resetCombat();
  }
}

// Combat controls
function setThreat(value: number) {
  combatStore.devSetThreat(value);
}

function setMorale(value: number) {
  combatStore.devSetMorale(value);
}

function triggerWave() {
  combatStore.devTriggerWave();
}

// Event controls
const eventIds = eventStore.getEventIds();
const selectedEventId = ref('');

function triggerRandomEvent() {
  eventStore.triggerRandomEvent();
}

function triggerSpecificEvent() {
  if (selectedEventId.value) {
    eventStore.devTriggerEvent(selectedEventId.value);
  }
}

function toggleEvents() {
  eventStore.toggleEvents();
}

// Relic controls
const relicRarities: RelicRarity[] = ['common', 'rare', 'epic', 'legendary'];
const selectedRelicId = ref('');

function grantRandomRelic(rarity: RelicRarity) {
  const unownedOfRarity = relicStore.relics.filter(r => !r.owned && r.rarity === rarity);
  if (unownedOfRarity.length > 0) {
    const randomRelic = unownedOfRarity[Math.floor(Math.random() * unownedOfRarity.length)];
    relicStore.grantRelic(randomRelic.id);
  }
}

function grantSpecificRelic() {
  if (selectedRelicId.value) {
    relicStore.grantRelic(selectedRelicId.value);
  }
}

function unlockAllRelics() {
  for (const relic of relicStore.relics) {
    if (!relic.owned) {
      relicStore.grantRelic(relic.id);
    }
  }
}

function unlockExtraSlot() {
  const lockedSlot = relicStore.slots.find(s => !s.unlocked);
  if (lockedSlot) {
    relicStore.unlockSlot(lockedSlot.index);
  }
}

// Keyboard shortcut - backtick key
if (import.meta.client) {
  window.addEventListener('keydown', (e) => {
    if (e.key === '`') {
      toggle();
    }
  });
}
</script>

<template>
  <!-- Toggle Button -->
  <VBtn
    icon
    size="small"
    color="warning"
    class="dev-toggle-btn"
    @click="toggle"
    title="Panel Deweloperski (`)"
  >
    <VIcon>mdi-bug</VIcon>
  </VBtn>

  <!-- Dev Panel Overlay -->
  <VDialog v-model="isOpen" max-width="600" scrollable>
    <VCard class="dev-panel">
      <VCardTitle class="d-flex align-center justify-space-between">
        <span class="d-flex align-center gap-2">
          <VIcon color="warning">mdi-bug</VIcon>
          Panel Deweloperski
        </span>
        <VBtn icon variant="text" @click="toggle">
          <VIcon>mdi-close</VIcon>
        </VBtn>
      </VCardTitle>

      <VDivider />

      <VCardText class="pa-4">
        <!-- Speed Controls -->
        <div class="section mb-4">
          <h3 class="section-title mb-2">
            <VIcon size="small" class="mr-1">mdi-speedometer</VIcon>
            Szybkość Gry
          </h3>
          <div class="d-flex flex-wrap gap-2">
            <VBtn
              v-for="speed in speedOptions"
              :key="speed"
              size="small"
              :color="currentSpeed === speed ? 'primary' : 'surface-variant'"
              :variant="currentSpeed === speed ? 'flat' : 'outlined'"
              @click="setSpeed(speed)"
            >
              {{ speed }}x
            </VBtn>
          </div>
        </div>

        <VDivider class="my-4" />

        <!-- Resources -->
        <div class="section mb-4">
          <h3 class="section-title mb-2">
            <VIcon size="small" class="mr-1">mdi-treasure-chest</VIcon>
            Dodaj Zasoby
          </h3>
          <div class="d-flex flex-wrap gap-2">
            <VBtn
              v-for="(amount, id) in resourceAmounts"
              :key="id"
              size="small"
              color="success"
              variant="tonal"
              @click="addResource(id)"
            >
              <VIcon size="small" class="mr-1">{{ resourceStore.resources[id]?.icon }}</VIcon>
              +{{ amount }} {{ resourceStore.resources[id]?.name }}
            </VBtn>
          </div>
        </div>

        <VDivider class="my-4" />

        <!-- Entities -->
        <div class="section mb-4">
          <h3 class="section-title mb-2">
            <VIcon size="small" class="mr-1">mdi-city</VIcon>
            Dodaj Budynki/Jednostki
          </h3>
          <div class="d-flex flex-wrap gap-2">
            <VBtn
              v-for="(amount, id) in entityAmounts"
              :key="id"
              size="small"
              color="info"
              variant="tonal"
              @click="addEntity(id)"
            >
              <VIcon size="small" class="mr-1">{{ entityStore.entities[id]?.icon }}</VIcon>
              +{{ amount }} {{ entityStore.entities[id]?.name }}
            </VBtn>
          </div>
        </div>

        <VDivider class="my-4" />

        <!-- Combat Controls -->
        <div class="section mb-4">
          <h3 class="section-title mb-2">
            <VIcon size="small" class="mr-1">mdi-sword-cross</VIcon>
            Walka (Combat)
          </h3>
          <div class="d-flex flex-wrap gap-2 mb-2">
            <VBtn size="small" color="error" variant="tonal" @click="triggerWave">
              <VIcon size="small" class="mr-1">mdi-sword</VIcon>
              Wywołaj Falę
            </VBtn>
          </div>
          <div class="d-flex flex-wrap gap-2 mb-2">
            <span class="text-caption align-self-center mr-2">Zagrożenie:</span>
            <VBtn size="x-small" variant="outlined" @click="setThreat(0)">0</VBtn>
            <VBtn size="x-small" variant="outlined" @click="setThreat(25)">25</VBtn>
            <VBtn size="x-small" variant="outlined" @click="setThreat(50)">50</VBtn>
            <VBtn size="x-small" variant="outlined" @click="setThreat(75)">75</VBtn>
            <VBtn size="x-small" variant="outlined" @click="setThreat(100)">100</VBtn>
          </div>
          <div class="d-flex flex-wrap gap-2">
            <span class="text-caption align-self-center mr-2">Morale:</span>
            <VBtn size="x-small" variant="outlined" @click="setMorale(100)">100</VBtn>
            <VBtn size="x-small" variant="outlined" @click="setMorale(50)">50</VBtn>
            <VBtn size="x-small" variant="outlined" @click="setMorale(25)">25</VBtn>
            <VBtn size="x-small" variant="outlined" @click="setMorale(10)">10</VBtn>
            <VBtn size="x-small" color="error" variant="outlined" @click="setMorale(0)">0 (Koniec)</VBtn>
          </div>
        </div>

        <VDivider class="my-4" />

        <!-- Events -->
        <div class="section mb-4">
          <h3 class="section-title mb-2">
            <VIcon size="small" class="mr-1">mdi-calendar-star</VIcon>
            Wydarzenia Losowe
            <VChip size="x-small" :color="eventStore.eventsEnabled ? 'success' : 'error'" class="ml-2">
              {{ eventStore.eventsEnabled ? 'ON' : 'OFF' }}
            </VChip>
          </h3>
          <div class="d-flex flex-wrap gap-2 mb-2">
            <VBtn size="small" color="warning" variant="tonal" @click="triggerRandomEvent">
              <VIcon size="small" class="mr-1">mdi-dice-5</VIcon>
              Losowe Wydarzenie
            </VBtn>
            <VBtn size="small" :color="eventStore.eventsEnabled ? 'error' : 'success'" variant="tonal" @click="toggleEvents">
              <VIcon size="small" class="mr-1">{{ eventStore.eventsEnabled ? 'mdi-pause' : 'mdi-play' }}</VIcon>
              {{ eventStore.eventsEnabled ? 'Wyłącz' : 'Włącz' }}
            </VBtn>
          </div>
          <div class="d-flex align-center gap-2">
            <VSelect
              v-model="selectedEventId"
              :items="eventIds"
              label="Wybierz wydarzenie"
              density="compact"
              hide-details
              class="flex-grow-1"
            />
            <VBtn size="small" color="info" variant="tonal" @click="triggerSpecificEvent" :disabled="!selectedEventId">
              <VIcon size="small">mdi-play</VIcon>
            </VBtn>
          </div>
          <div class="text-caption text-medium-emphasis mt-2">
            Aktywne efekty: {{ eventStore.activeEffects.length }} |
            Następne wydarzenie: {{ Math.round(eventStore.nextEventTime - eventStore.timeSinceLastEvent) }}s
          </div>
        </div>

        <VDivider class="my-4" />

        <!-- Relics -->
        <div class="section mb-4">
          <h3 class="section-title mb-2">
            <VIcon size="small" class="mr-1">mdi-treasure-chest</VIcon>
            Relikwie
            <VChip size="x-small" color="purple" class="ml-2">
              {{ relicStore.ownedRelics.length }}/{{ relicStore.relics.length }}
            </VChip>
          </h3>
          <div class="d-flex flex-wrap gap-2 mb-2">
            <VBtn
              v-for="rarity in relicRarities"
              :key="rarity"
              size="small"
              :color="rarity === 'legendary' ? 'amber' : rarity === 'epic' ? 'purple' : rarity === 'rare' ? 'blue' : 'grey'"
              variant="tonal"
              @click="grantRandomRelic(rarity)"
            >
              <VIcon size="small" class="mr-1">mdi-gift</VIcon>
              {{ RARITY_NAMES[rarity] }}
            </VBtn>
          </div>
          <div class="d-flex align-center gap-2 mb-2">
            <VSelect
              v-model="selectedRelicId"
              :items="relicStore.relics.filter(r => !r.owned).map(r => ({ title: `${r.icon} ${r.name}`, value: r.id }))"
              label="Wybierz relikwię"
              density="compact"
              hide-details
              class="flex-grow-1"
            />
            <VBtn size="small" color="purple" variant="tonal" @click="grantSpecificRelic" :disabled="!selectedRelicId">
              <VIcon size="small">mdi-plus</VIcon>
            </VBtn>
          </div>
          <div class="d-flex flex-wrap gap-2">
            <VBtn size="small" color="warning" variant="tonal" @click="unlockAllRelics">
              <VIcon size="small" class="mr-1">mdi-star</VIcon>
              Wszystkie Relikwie
            </VBtn>
            <VBtn size="small" color="info" variant="tonal" @click="unlockExtraSlot" :disabled="relicStore.unlockedSlots.length >= 5">
              <VIcon size="small" class="mr-1">mdi-lock-open</VIcon>
              Dodatkowy Slot
            </VBtn>
          </div>
          <div class="text-caption text-medium-emphasis mt-2">
            Wyposażone: {{ relicStore.equippedRelics.length }}/{{ relicStore.unlockedSlots.length }} |
            Bonusy: {{ relicStore.totalBonuses.allProductionMultiplier > 0 ? `+${relicStore.totalBonuses.allProductionMultiplier}% prod` : '-' }}
          </div>
        </div>

        <VDivider class="my-4" />

        <!-- Quick Actions -->
        <div class="section">
          <h3 class="section-title mb-2">
            <VIcon size="small" class="mr-1">mdi-lightning-bolt</VIcon>
            Szybkie Akcje
          </h3>
          <div class="d-flex flex-wrap gap-2">
            <VBtn
              color="purple"
              variant="tonal"
              @click="unlockAll"
            >
              <VIcon class="mr-1">mdi-lock-open</VIcon>
              Odblokuj Wszystko
            </VBtn>
            <VBtn
              color="error"
              variant="tonal"
              @click="resetGame"
            >
              <VIcon class="mr-1">mdi-delete-forever</VIcon>
              Reset Gry
            </VBtn>
          </div>
        </div>
      </VCardText>

      <VDivider />

      <VCardActions class="pa-3">
        <span class="text-caption text-medium-emphasis">
          Skrót klawiszowy: ` (backtick)
        </span>
        <VSpacer />
        <VBtn variant="text" @click="toggle">Zamknij</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped lang="scss">
.dev-toggle-btn {
  position: fixed;
  bottom: 16px;
  left: 16px;
  z-index: 1000;
  opacity: 0.7;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
}

.dev-panel {
  background: rgba(30, 30, 30, 0.98) !important;
  border: 2px solid rgba(255, 193, 7, 0.3) !important;

  .section-title {
    font-family: 'Courier Prime', monospace;
    font-size: 0.9rem;
    color: rgba(255, 193, 7, 0.9);
    display: flex;
    align-items: center;
  }
}
</style>

