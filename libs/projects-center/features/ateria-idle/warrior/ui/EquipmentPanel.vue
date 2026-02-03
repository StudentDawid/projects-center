<script setup lang="ts">
/**
 * Equipment Panel - displays equipped items and inventory
 */

import { ref, computed } from 'vue';
import { useAteriaInventoryStore } from '../model/inventory.store';
import { useAteriaWarriorStore } from '../model/warrior.store';
import type { Equipment, EquipmentSlot, ItemRarity } from '@projects-center/entities/ateria-idle/warrior';
import {
  SLOT_ICONS,
  SLOT_NAMES,
  RARITY_COLORS,
  RARITY_NAMES,
  getEquipmentBySlotForLevel,
} from '../../data/equipment.data';

const inventoryStore = useAteriaInventoryStore();
const warriorStore = useAteriaWarriorStore();

// UI State
const activeTab = ref<'equipped' | 'inventory' | 'shop'>('equipped');
const selectedSlot = ref<EquipmentSlot | null>(null);
const showSlotDialog = ref(false);

// Slots
const equipmentSlots: EquipmentSlot[] = ['weapon', 'helmet', 'armor', 'boots', 'accessory'];

// Computed
const stats = computed(() => inventoryStore.totalEquipmentStats);

const availableForSlot = computed(() => {
  if (!selectedSlot.value) return [];
  return inventoryStore.getOwnedEquipmentBySlot(selectedSlot.value);
});

const shopItems = computed(() => {
  if (!selectedSlot.value) return [];
  return getEquipmentBySlotForLevel(selectedSlot.value, warriorStore.stats.level)
    .filter(eq => !inventoryStore.ownedEquipment.some(owned => owned.id === eq.id));
});

// Actions
function openSlotDialog(slot: EquipmentSlot) {
  selectedSlot.value = slot;
  showSlotDialog.value = true;
}

function equipItemFromDialog(equipmentId: string) {
  inventoryStore.equipItem(equipmentId);
  showSlotDialog.value = false;
}

function unequipSlot(slot: EquipmentSlot) {
  inventoryStore.unequipItem(slot);
}

function getRarityColor(rarity?: ItemRarity): string {
  return rarity ? RARITY_COLORS[rarity] : RARITY_COLORS.common;
}

function getRarityName(rarity?: ItemRarity): string {
  return rarity ? RARITY_NAMES[rarity] : RARITY_NAMES.common;
}

function formatStat(value: number | undefined, prefix: string = '+'): string {
  if (!value || value === 0) return '';
  return value > 0 ? `${prefix}${value}` : `${value}`;
}

function formatPercent(value: number | undefined): string {
  if (!value || value === 0) return '';
  return `+${(value * 100).toFixed(1)}%`;
}
</script>

<template>
  <div class="equipment-panel">
    <!-- Header with stats summary -->
    <v-card class="mb-4 stats-summary-card">
      <v-card-title class="d-flex align-center py-3">
        <v-icon
          class="mr-2"
          color="amber"
        >
          mdi-shield-sword
        </v-icon>
        <span class="text-subtitle-1 font-weight-medium">Ekwipunek</span>
        <v-spacer />
        <div class="d-flex ga-2">
          <v-chip
            size="small"
            variant="tonal"
            color="error"
          >
            <v-icon
              start
              size="14"
            >
              mdi-sword
            </v-icon>
            +{{ stats.attack }}
          </v-chip>
          <v-chip
            size="small"
            variant="tonal"
            color="info"
          >
            <v-icon
              start
              size="14"
            >
              mdi-shield
            </v-icon>
            +{{ stats.defense }}
          </v-chip>
          <v-chip
            size="small"
            variant="tonal"
            color="success"
          >
            <v-icon
              start
              size="14"
            >
              mdi-heart
            </v-icon>
            +{{ stats.maxHp }}
          </v-chip>
        </div>
      </v-card-title>
    </v-card>

    <!-- Equipment Slots Grid -->
    <div class="equipment-grid">
      <div
        v-for="slot in equipmentSlots"
        :key="slot"
        class="equipment-slot"
        :class="{
          'slot-filled': inventoryStore.equipped[slot],
          [`rarity-${inventoryStore.equipped[slot]?.rarity || 'empty'}`]: true
        }"
        @click="openSlotDialog(slot)"
      >
        <!-- Empty slot -->
        <div
          v-if="!inventoryStore.equipped[slot]"
          class="slot-empty"
        >
          <v-icon
            size="28"
            class="slot-icon opacity-30"
          >
            {{ SLOT_ICONS[slot] }}
          </v-icon>
          <div class="slot-label text-caption text-medium-emphasis mt-1">
            {{ SLOT_NAMES[slot] }}
          </div>
        </div>

        <!-- Filled slot -->
        <div
          v-else
          class="slot-filled-content"
        >
          <div
            class="slot-item-icon"
            :style="{ borderColor: getRarityColor(inventoryStore.equipped[slot]?.rarity) }"
          >
            <v-icon
              size="24"
              :color="getRarityColor(inventoryStore.equipped[slot]?.rarity)"
            >
              {{ SLOT_ICONS[slot] }}
            </v-icon>
          </div>
          <div class="slot-item-name text-caption font-weight-medium text-truncate">
            {{ inventoryStore.equipped[slot]?.name }}
          </div>
          <div
            class="slot-item-rarity text-caption"
            :style="{ color: getRarityColor(inventoryStore.equipped[slot]?.rarity) }"
          >
            {{ getRarityName(inventoryStore.equipped[slot]?.rarity) }}
          </div>
        </div>

        <!-- Unequip button -->
        <v-btn
          v-if="inventoryStore.equipped[slot]"
          icon
          size="x-small"
          variant="flat"
          color="error"
          class="unequip-btn"
          @click.stop="unequipSlot(slot)"
        >
          <v-icon size="14">
            mdi-close
          </v-icon>
        </v-btn>
      </div>
    </div>

    <!-- Owned Equipment List -->
    <v-card class="mt-4">
      <v-card-title class="d-flex align-center py-3">
        <v-icon
          class="mr-2"
          color="primary"
        >
          mdi-bag-personal
        </v-icon>
        <span class="text-subtitle-1 font-weight-medium">Posiadane przedmioty</span>
        <v-chip
          class="ml-2"
          size="x-small"
          variant="flat"
          color="primary"
        >
          {{ inventoryStore.ownedEquipment.length }}
        </v-chip>
      </v-card-title>

      <v-card-text class="pt-0">
        <div
          v-if="inventoryStore.ownedEquipment.length === 0"
          class="text-center py-6 text-medium-emphasis"
        >
          <v-icon
            size="48"
            class="mb-2 opacity-50"
          >
            mdi-bag-personal-off
          </v-icon>
          <div class="text-body-2">
            Brak przedmiotów
          </div>
          <div class="text-caption">
            Walcz z potworami, aby zdobyć ekwipunek
          </div>
        </div>

        <div
          v-else
          class="owned-equipment-grid"
        >
          <div
            v-for="eq in inventoryStore.ownedEquipment"
            :key="eq.id"
            class="owned-item"
            :class="{
              'item-equipped': inventoryStore.isEquipped(eq.id),
              [`rarity-${eq.rarity}`]: true
            }"
            @click="inventoryStore.equipItem(eq.id)"
          >
            <div
              class="item-icon"
              :style="{ borderColor: getRarityColor(eq.rarity) }"
            >
              <v-icon
                size="20"
                :color="getRarityColor(eq.rarity)"
              >
                {{ SLOT_ICONS[eq.slot] }}
              </v-icon>
            </div>

            <v-tooltip
              activator="parent"
              location="top"
            >
              <div class="font-weight-bold">
                {{ eq.name }}
              </div>
              <div
                class="text-caption"
                :style="{ color: getRarityColor(eq.rarity) }"
              >
                {{ getRarityName(eq.rarity) }} {{ SLOT_NAMES[eq.slot] }}
              </div>
              <v-divider class="my-1" />
              <div
                v-if="eq.stats.attack"
                class="text-caption text-error"
              >
                Atak: {{ formatStat(eq.stats.attack) }}
              </div>
              <div
                v-if="eq.stats.defense"
                class="text-caption text-info"
              >
                Obrona: {{ formatStat(eq.stats.defense) }}
              </div>
              <div
                v-if="eq.stats.maxHp"
                class="text-caption text-success"
              >
                HP: {{ formatStat(eq.stats.maxHp) }}
              </div>
              <div
                v-if="eq.stats.accuracy"
                class="text-caption"
              >
                Celność: {{ formatStat(eq.stats.accuracy) }}
              </div>
              <div
                v-if="eq.stats.evasion"
                class="text-caption"
              >
                Unik: {{ formatStat(eq.stats.evasion) }}
              </div>
              <div
                v-if="eq.stats.critChance"
                class="text-caption text-amber"
              >
                Kryt. szansa: {{ formatPercent(eq.stats.critChance) }}
              </div>
              <div
                v-if="eq.stats.critMultiplier"
                class="text-caption text-amber"
              >
                Kryt. obrażenia: {{ formatPercent(eq.stats.critMultiplier) }}
              </div>
              <v-divider
                v-if="eq.requirements.level"
                class="my-1"
              />
              <div
                v-if="eq.requirements.level"
                class="text-caption"
                :class="warriorStore.stats.level >= eq.requirements.level ? 'text-success' : 'text-error'"
              >
                Wymagany poziom: {{ eq.requirements.level }}
              </div>
              <div
                v-if="inventoryStore.isEquipped(eq.id)"
                class="text-caption text-primary mt-1"
              >
                ✓ Założone
              </div>
            </v-tooltip>

            <div
              v-if="inventoryStore.isEquipped(eq.id)"
              class="equipped-badge"
            >
              <v-icon
                size="10"
                color="white"
              >
                mdi-check
              </v-icon>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Slot Selection Dialog -->
    <v-dialog
      v-model="showSlotDialog"
      max-width="500"
    >
      <v-card v-if="selectedSlot">
        <v-card-title class="d-flex align-center">
          <v-icon
            class="mr-2"
            :color="inventoryStore.equipped[selectedSlot]?.rarity ? getRarityColor(inventoryStore.equipped[selectedSlot]?.rarity) : 'grey'"
          >
            {{ SLOT_ICONS[selectedSlot] }}
          </v-icon>
          {{ SLOT_NAMES[selectedSlot] }}
        </v-card-title>

        <v-card-text>
          <!-- Currently Equipped -->
          <div
            v-if="inventoryStore.equipped[selectedSlot]"
            class="mb-4"
          >
            <div class="text-overline text-medium-emphasis mb-2">
              Obecnie założone
            </div>
            <div class="current-equipped-item pa-3 rounded">
              <div class="d-flex align-center">
                <div
                  class="item-icon mr-3"
                  :style="{ borderColor: getRarityColor(inventoryStore.equipped[selectedSlot]?.rarity) }"
                >
                  <v-icon :color="getRarityColor(inventoryStore.equipped[selectedSlot]?.rarity)">
                    {{ SLOT_ICONS[selectedSlot] }}
                  </v-icon>
                </div>
                <div class="flex-grow-1">
                  <div class="font-weight-medium">
                    {{ inventoryStore.equipped[selectedSlot]?.name }}
                  </div>
                  <div
                    class="text-caption"
                    :style="{ color: getRarityColor(inventoryStore.equipped[selectedSlot]?.rarity) }"
                  >
                    {{ getRarityName(inventoryStore.equipped[selectedSlot]?.rarity) }}
                  </div>
                </div>
                <v-btn
                  size="small"
                  variant="tonal"
                  color="error"
                  @click="unequipSlot(selectedSlot)"
                >
                  Zdejmij
                </v-btn>
              </div>
            </div>
          </div>

          <!-- Available Items -->
          <div class="text-overline text-medium-emphasis mb-2">
            Dostępne przedmioty
          </div>

          <div
            v-if="availableForSlot.length === 0"
            class="text-center py-4 text-medium-emphasis"
          >
            <v-icon
              size="32"
              class="mb-2 opacity-50"
            >
              mdi-package-variant
            </v-icon>
            <div class="text-body-2">
              Brak przedmiotów dla tego slotu
            </div>
          </div>

          <v-list
            v-else
            density="compact"
            class="available-items-list"
          >
            <v-list-item
              v-for="eq in availableForSlot"
              :key="eq.id"
              :disabled="inventoryStore.isEquipped(eq.id)"
              class="available-item rounded mb-1"
              @click="equipItemFromDialog(eq.id)"
            >
              <template #prepend>
                <div
                  class="item-icon mr-3"
                  :style="{ borderColor: getRarityColor(eq.rarity) }"
                >
                  <v-icon
                    size="20"
                    :color="getRarityColor(eq.rarity)"
                  >
                    {{ SLOT_ICONS[eq.slot] }}
                  </v-icon>
                </div>
              </template>

              <v-list-item-title class="font-weight-medium">
                {{ eq.name }}
              </v-list-item-title>
              <v-list-item-subtitle>
                <span :style="{ color: getRarityColor(eq.rarity) }">
                  {{ getRarityName(eq.rarity) }}
                </span>
                <span
                  v-if="eq.stats.attack"
                  class="ml-2 text-error"
                >
                  +{{ eq.stats.attack }} Atak
                </span>
                <span
                  v-if="eq.stats.defense"
                  class="ml-2 text-info"
                >
                  +{{ eq.stats.defense }} Obr.
                </span>
              </v-list-item-subtitle>

              <template #append>
                <v-chip
                  v-if="inventoryStore.isEquipped(eq.id)"
                  size="x-small"
                  color="primary"
                >
                  Założone
                </v-chip>
                <v-icon
                  v-else
                  size="20"
                  color="success"
                >
                  mdi-chevron-right
                </v-icon>
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="showSlotDialog = false"
          >
            Zamknij
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.stats-summary-card {
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.equipment-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}

.equipment-slot {
  aspect-ratio: 1;
  background: rgba(255, 255, 255, 0.02);
  border: 2px dashed rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  padding: 8px;
}

.equipment-slot:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.2);
}

.equipment-slot.slot-filled {
  border-style: solid;
  background: rgba(255, 255, 255, 0.03);
}

/* Rarity border colors */
.equipment-slot.rarity-common.slot-filled { border-color: #9E9E9E40; }
.equipment-slot.rarity-uncommon.slot-filled { border-color: #4CAF5040; }
.equipment-slot.rarity-rare.slot-filled { border-color: #2196F340; }
.equipment-slot.rarity-epic.slot-filled { border-color: #9C27B040; }
.equipment-slot.rarity-legendary.slot-filled { border-color: #FF980040; }
.equipment-slot.rarity-mythic.slot-filled { border-color: #F4433640; }

.slot-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.slot-filled-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
}

.slot-item-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  border: 2px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
  margin-bottom: 4px;
}

.slot-item-name {
  max-width: 100%;
  line-height: 1.2;
}

.unequip-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.equipment-slot:hover .unequip-btn {
  opacity: 1;
}

/* Owned equipment grid */
.owned-equipment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(48px, 1fr));
  gap: 8px;
}

.owned-item {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.owned-item:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: scale(1.05);
}

.owned-item.item-equipped {
  border-color: rgba(33, 150, 243, 0.5);
  background: rgba(33, 150, 243, 0.1);
}

.owned-item .item-icon {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: 1px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
}

.equipped-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 16px;
  height: 16px;
  background: #2196F3;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Dialog styles */
.current-equipped-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.current-equipped-item .item-icon {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  border: 2px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
}

.available-items-list {
  max-height: 300px;
  overflow-y: auto;
}

.available-item {
  background: rgba(255, 255, 255, 0.02);
}

.available-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.available-item .item-icon {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: 1px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
}

/* Responsive */
@media (max-width: 600px) {
  .equipment-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
