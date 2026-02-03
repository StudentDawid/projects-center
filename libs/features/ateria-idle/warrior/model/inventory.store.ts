/**
 * Inventory Store - manages player's items and equipment
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAteriaGameStore } from '../../core/model/game.store';
import { useAteriaWarriorStore } from './warrior.store';
import type { Equipment, EquipmentSlot, ItemRarity, LootDrop } from '@libs/entities/ateria-idle/warrior';
import {
  getEquipment,
  getEquipmentBySlotForLevel,
  RARITY_COLORS,
  RARITY_NAMES,
  ALL_EQUIPMENT,
} from '../../data/equipment.data';

// ============================================
// TYPES
// ============================================

export interface InventoryItem {
  id: string;
  name: string;
  amount: number;
  type: 'material' | 'consumable' | 'equipment';
  icon?: string;
  rarity?: ItemRarity;
}

export interface EquippedItems {
  weapon: Equipment | null;
  armor: Equipment | null;
  helmet: Equipment | null;
  boots: Equipment | null;
  accessory: Equipment | null;
}

// ============================================
// CONSTANTS
// ============================================

const MAX_INVENTORY_SLOTS = 100;
const MAX_STACK_SIZE = 999;

// ============================================
// STORE
// ============================================

export const useAteriaInventoryStore = defineStore('ateria-inventory', () => {
  const gameStore = useAteriaGameStore();

  // ============================================
  // STATE
  // ============================================

  // General inventory (materials, consumables)
  const inventory = ref<Map<string, InventoryItem>>(new Map());

  // Equipment inventory (owned equipment pieces)
  const ownedEquipment = ref<Equipment[]>([]);

  // Currently equipped items
  const equipped = ref<EquippedItems>({
    weapon: null,
    armor: null,
    helmet: null,
    boots: null,
    accessory: null,
  });

  // ============================================
  // COMPUTED
  // ============================================

  const inventoryItems = computed(() => {
    return Array.from(inventory.value.values());
  });

  const inventoryCount = computed(() => {
    return inventory.value.size;
  });

  const inventoryFull = computed(() => {
    return inventoryCount.value >= MAX_INVENTORY_SLOTS;
  });

  const equippedList = computed(() => {
    return Object.entries(equipped.value)
      .filter(([_, eq]) => eq !== null)
      .map(([slot, eq]) => ({ slot: slot as EquipmentSlot, equipment: eq as Equipment }));
  });

  const totalEquipmentStats = computed(() => {
    const stats = {
      attack: 0,
      defense: 0,
      accuracy: 0,
      evasion: 0,
      maxHp: 0,
      critChance: 0,
      critMultiplier: 0,
      hpRegen: 0,
    };

    for (const eq of Object.values(equipped.value)) {
      if (eq?.stats) {
        stats.attack += eq.stats.attack || 0;
        stats.defense += eq.stats.defense || 0;
        stats.accuracy += eq.stats.accuracy || 0;
        stats.evasion += eq.stats.evasion || 0;
        stats.maxHp += eq.stats.maxHp || 0;
        stats.critChance += eq.stats.critChance || 0;
        stats.critMultiplier += eq.stats.critMultiplier || 0;
        stats.hpRegen += eq.stats.hpRegen || 0;
      }
    }

    return stats;
  });

  // Sync equipment bonuses with warrior store
  function syncEquipmentBonuses() {
    const warriorStore = useAteriaWarriorStore();
    warriorStore.updateEquipmentBonuses(totalEquipmentStats.value);
  }

  // ============================================
  // ACTIONS - INVENTORY
  // ============================================

  function addItem(itemId: string, amount: number = 1, type: 'material' | 'consumable' = 'material', name?: string, icon?: string, rarity?: ItemRarity): boolean {
    const existing = inventory.value.get(itemId);

    if (existing) {
      existing.amount = Math.min(existing.amount + amount, MAX_STACK_SIZE);
      return true;
    }

    if (inventoryFull.value) {
      gameStore.addNotification({
        type: 'warning',
        title: 'Ekwipunek pełny',
        message: 'Nie można dodać przedmiotu - brak miejsca',
        icon: 'mdi-bag-personal-off',
      });
      return false;
    }

    inventory.value.set(itemId, {
      id: itemId,
      name: name || itemId,
      amount,
      type,
      icon,
      rarity,
    });

    return true;
  }

  function removeItem(itemId: string, amount: number = 1): boolean {
    const existing = inventory.value.get(itemId);
    if (!existing || existing.amount < amount) {
      return false;
    }

    existing.amount -= amount;
    if (existing.amount <= 0) {
      inventory.value.delete(itemId);
    }

    return true;
  }

  function hasItem(itemId: string, amount: number = 1): boolean {
    const existing = inventory.value.get(itemId);
    return existing !== undefined && existing.amount >= amount;
  }

  function getItemAmount(itemId: string): number {
    return inventory.value.get(itemId)?.amount || 0;
  }

  // ============================================
  // ACTIONS - EQUIPMENT
  // ============================================

  function addEquipment(equipment: Equipment): boolean {
    // Check if we already own this exact piece
    const alreadyOwned = ownedEquipment.value.find(e => e.id === equipment.id);
    if (alreadyOwned) {
      gameStore.addNotification({
        type: 'info',
        title: 'Już posiadasz',
        message: `Masz już ${equipment.name}`,
        icon: 'mdi-sword',
      });
      return false;
    }

    ownedEquipment.value.push(equipment);

    gameStore.addNotification({
      type: 'success',
      title: 'Nowy ekwipunek!',
      message: `Zdobyto: ${equipment.name}`,
      icon: 'mdi-sword-cross',
    });

    return true;
  }

  function removeEquipment(equipmentId: string): boolean {
    const index = ownedEquipment.value.findIndex(e => e.id === equipmentId);
    if (index === -1) return false;

    // Unequip if currently equipped
    const eq = ownedEquipment.value[index];
    if (equipped.value[eq.slot]?.id === equipmentId) {
      equipped.value[eq.slot] = null;
    }

    ownedEquipment.value.splice(index, 1);
    return true;
  }

  function equipItem(equipmentId: string): boolean {
    const warriorStore = useAteriaWarriorStore();

    const equipment = ownedEquipment.value.find(e => e.id === equipmentId);
    if (!equipment) {
      // Try to find in global equipment data (for dev/testing)
      const globalEquipment = getEquipment(equipmentId);
      if (!globalEquipment) {
        gameStore.addNotification({
          type: 'error',
          title: 'Błąd',
          message: 'Nie posiadasz tego przedmiotu',
          icon: 'mdi-alert',
        });
        return false;
      }
      // Add it first
      addEquipment(globalEquipment);
      return equipItem(equipmentId);
    }

    // Check level requirement
    if (equipment.requirements.level && warriorStore.stats.level < equipment.requirements.level) {
      gameStore.addNotification({
        type: 'warning',
        title: 'Wymagany poziom',
        message: `Potrzebujesz poziomu ${equipment.requirements.level} aby założyć ${equipment.name}`,
        icon: 'mdi-lock',
      });
      return false;
    }

    // Equip the item (replaces existing)
    const previousItem = equipped.value[equipment.slot];
    equipped.value[equipment.slot] = equipment;

    // Sync with warrior store
    syncEquipmentBonuses();

    gameStore.addNotification({
      type: 'success',
      title: 'Założono',
      message: equipment.name,
      icon: 'mdi-check',
      duration: 2000,
    });

    return true;
  }

  function unequipItem(slot: EquipmentSlot): boolean {
    if (!equipped.value[slot]) return false;

    const equipment = equipped.value[slot];
    equipped.value[slot] = null;

    // Sync with warrior store
    syncEquipmentBonuses();

    gameStore.addNotification({
      type: 'info',
      title: 'Zdjęto',
      message: equipment!.name,
      icon: 'mdi-minus',
      duration: 2000,
    });

    return true;
  }

  function isEquipped(equipmentId: string): boolean {
    return Object.values(equipped.value).some(eq => eq?.id === equipmentId);
  }

  function getEquippedInSlot(slot: EquipmentSlot): Equipment | null {
    return equipped.value[slot];
  }

  function getOwnedEquipmentBySlot(slot: EquipmentSlot): Equipment[] {
    return ownedEquipment.value.filter(e => e.slot === slot);
  }

  function getAvailableUpgrades(slot: EquipmentSlot): Equipment[] {
    const warriorStore = useAteriaWarriorStore();
    const currentEquipped = equipped.value[slot];
    const available = getEquipmentBySlotForLevel(slot, warriorStore.stats.level);

    // Filter to only show unowned equipment that's better
    return available.filter(eq => {
      // Don't show if already owned
      if (ownedEquipment.value.some(owned => owned.id === eq.id)) return false;

      // If nothing equipped, show all
      if (!currentEquipped) return true;

      // Show if better attack (for weapons) or defense (for armor)
      if (slot === 'weapon') {
        return (eq.stats.attack || 0) > (currentEquipped.stats.attack || 0);
      }
      return (eq.stats.defense || 0) > (currentEquipped.stats.defense || 0);
    });
  }

  // ============================================
  // ACTIONS - LOOT PROCESSING
  // ============================================

  function processLootDrops(drops: LootDrop[]) {
    for (const drop of drops) {
      // Check if it's equipment
      const equipment = getEquipment(drop.itemId);
      if (equipment) {
        addEquipment(equipment);
        continue;
      }

      // Otherwise it's a material/consumable
      addItem(drop.itemId, drop.amount, 'material', drop.itemId, undefined, drop.rarity);
    }
  }

  // ============================================
  // DEV HELPERS
  // ============================================

  function devAddRandomEquipment() {
    const warriorStore = useAteriaWarriorStore();
    const available = ALL_EQUIPMENT.filter(
      e => (e.requirements.level || 1) <= warriorStore.stats.level + 10
    );
    if (available.length === 0) return;

    const random = available[Math.floor(Math.random() * available.length)];
    addEquipment(random);
  }

  function devAddAllStarterGear() {
    // Add starter gear for testing
    const starterIds = ['wooden_sword', 'leather_vest', 'leather_cap', 'leather_boots', 'copper_ring'];
    for (const id of starterIds) {
      const eq = getEquipment(id);
      if (eq) addEquipment(eq);
    }
  }

  // ============================================
  // SAVE/LOAD
  // ============================================

  function getState() {
    return {
      inventory: Array.from(inventory.value.entries()),
      ownedEquipment: ownedEquipment.value.map(e => e.id),
      equipped: {
        weapon: equipped.value.weapon?.id || null,
        armor: equipped.value.armor?.id || null,
        helmet: equipped.value.helmet?.id || null,
        boots: equipped.value.boots?.id || null,
        accessory: equipped.value.accessory?.id || null,
      },
    };
  }

  function loadState(state: ReturnType<typeof getState>) {
    if (state.inventory) {
      inventory.value = new Map(state.inventory);
    }

    if (state.ownedEquipment) {
      ownedEquipment.value = state.ownedEquipment
        .map(id => getEquipment(id))
        .filter((e): e is Equipment => e !== undefined);
    }

    if (state.equipped) {
      for (const [slot, id] of Object.entries(state.equipped)) {
        if (id) {
          const eq = getEquipment(id);
          if (eq) {
            equipped.value[slot as EquipmentSlot] = eq;
          }
        }
      }
    }
  }

  function resetInventory() {
    inventory.value.clear();
    ownedEquipment.value = [];
    equipped.value = {
      weapon: null,
      armor: null,
      helmet: null,
      boots: null,
      accessory: null,
    };
  }

  return {
    // State
    inventory,
    ownedEquipment,
    equipped,

    // Computed
    inventoryItems,
    inventoryCount,
    inventoryFull,
    equippedList,
    totalEquipmentStats,

    // Actions - Inventory
    addItem,
    removeItem,
    hasItem,
    getItemAmount,

    // Actions - Equipment
    addEquipment,
    removeEquipment,
    equipItem,
    unequipItem,
    isEquipped,
    getEquippedInSlot,
    getOwnedEquipmentBySlot,
    getAvailableUpgrades,

    // Actions - Loot
    processLootDrops,

    // Dev
    devAddRandomEquipment,
    devAddAllStarterGear,

    // Save/Load
    getState,
    loadState,
    resetInventory,

    // Re-export helpers
    RARITY_COLORS,
    RARITY_NAMES,
  };
}, {
  persist: {
    key: 'ateria-inventory',
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    serializer: {
      serialize: (state) => {
        return JSON.stringify({
          inventory: Array.from(state.inventory?.entries() || []),
          ownedEquipment: (state.ownedEquipment || []).map((e: Equipment) => e.id),
          equipped: {
            weapon: state.equipped?.weapon?.id || null,
            armor: state.equipped?.armor?.id || null,
            helmet: state.equipped?.helmet?.id || null,
            boots: state.equipped?.boots?.id || null,
            accessory: state.equipped?.accessory?.id || null,
          },
        });
      },
      deserialize: (value) => {
        const data = JSON.parse(value);
        return {
          inventory: new Map(data.inventory || []),
          ownedEquipment: (data.ownedEquipment || [])
            .map((id: string) => getEquipment(id))
            .filter((e: Equipment | undefined): e is Equipment => e !== undefined),
          equipped: {
            weapon: data.equipped?.weapon ? getEquipment(data.equipped.weapon) : null,
            armor: data.equipped?.armor ? getEquipment(data.equipped.armor) : null,
            helmet: data.equipped?.helmet ? getEquipment(data.equipped.helmet) : null,
            boots: data.equipped?.boots ? getEquipment(data.equipped.boots) : null,
            accessory: data.equipped?.accessory ? getEquipment(data.equipped.accessory) : null,
          },
        };
      },
    },
  },
});
