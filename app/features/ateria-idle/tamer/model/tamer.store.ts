/**
 * Tamer Store - Creature Taming, Companions, Training
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAteriaGameStore } from '../../core/model/game.store';
import { useAteriaResourcesStore } from '../../core/model/resources.store';
import { CREATURES, TAMING_ITEMS, CREATURE_FOOD, getCreature, getTamingItem, getFood, getAvailableCreatures, calculateTamerXpToLevel, type Creature, type TamerProgress, type CreatureType } from '../data/tamer.data';

export interface TamedCreature { creatureId: string; nickname: string; level: number; xp: number; happiness: number; stats: { attack: number; defense: number; hp: number; speed: number }; tamedAt: number; }
export interface ActiveTaming { creatureId: string; startTime: number; ticksRemaining: number; totalTicks: number; }

export const useAteriaTamerStore = defineStore('ateria-tamer', () => {
  const gameStore = useAteriaGameStore();
  const resourcesStore = useAteriaResourcesStore();

  const progress = ref<TamerProgress>({ level: 1, xp: 0, xpToNextLevel: 100, totalXp: 0 });
  const tamingSkill = ref(10);
  
  const ownedItems = ref<Map<string, number>>(new Map());
  const tamedCreatures = ref<Map<string, TamedCreature>>(new Map());
  const activeCompanion = ref<string | null>(null);
  const activeTaming = ref<ActiveTaming | null>(null);
  
  const maxCompanions = ref(3);
  const totalCreaturesTamed = ref(0);
  const totalBattlesWon = ref(0);

  const isTaming = computed(() => activeTaming.value !== null);
  const tamingProgress = computed(() => {
    if (!activeTaming.value) return 0;
    return ((activeTaming.value.totalTicks - activeTaming.value.ticksRemaining) / activeTaming.value.totalTicks) * 100;
  });
  const currentCompanion = computed(() => activeCompanion.value ? tamedCreatures.value.get(activeCompanion.value) : null);
  const availableCreatures = computed(() => getAvailableCreatures(progress.value.level));
  
  const totalTamingBonus = computed(() => {
    let bonus = tamingSkill.value;
    for (const [itemId, count] of ownedItems.value) {
      const item = getTamingItem(itemId);
      if (item && count > 0) bonus += item.tamingBonus;
    }
    return bonus;
  });

  function addXp(amount: number) {
    progress.value.xp += amount;
    progress.value.totalXp += amount;
    while (progress.value.xp >= progress.value.xpToNextLevel) {
      progress.value.xp -= progress.value.xpToNextLevel;
      progress.value.level++;
      progress.value.xpToNextLevel = calculateTamerXpToLevel(progress.value.level);
      tamingSkill.value += 3;
      if (progress.value.level % 10 === 0) maxCompanions.value++;
      gameStore.addNotification({ type: 'success', title: `Zaklinacz - Poziom ${progress.value.level}!`, message: '+3 umiejętność oswajania', icon: 'mdi-paw', duration: 3000 });
    }
  }

  function getXpProgress(): number { return (progress.value.xp / progress.value.xpToNextLevel) * 100; }

  function buyItem(itemId: string, amount: number = 1): boolean {
    const item = getTamingItem(itemId);
    if (!item) return false;
    const totalCost = item.cost * amount;
    if (!resourcesStore.hasAmount('gold', totalCost)) return false;
    resourcesStore.removeResource('gold', totalCost);
    const current = ownedItems.value.get(itemId) || 0;
    ownedItems.value.set(itemId, current + amount);
    return true;
  }

  function canTame(creatureId: string): { canTame: boolean; reason?: string } {
    const creature = getCreature(creatureId);
    if (!creature) return { canTame: false, reason: 'Nieznane stworzenie' };
    if (isTaming.value) return { canTame: false, reason: 'Już oswajasz' };
    if (creature.requiredLevel > progress.value.level) return { canTame: false, reason: `Wymaga poziomu ${creature.requiredLevel}` };
    if (tamedCreatures.value.size >= maxCompanions.value) return { canTame: false, reason: `Max ${maxCompanions.value} stworzeń` };
    if (tamedCreatures.value.has(creatureId)) return { canTame: false, reason: 'Już posiadasz' };
    const successChance = Math.max(5, 100 - creature.tamingDifficulty + totalTamingBonus.value);
    if (successChance < 10) return { canTame: false, reason: 'Za trudne' };
    return { canTame: true };
  }

  function startTaming(creatureId: string): boolean {
    const check = canTame(creatureId);
    if (!check.canTame) {
      gameStore.addNotification({ type: 'warning', title: 'Nie można oswajać', message: check.reason || '', icon: 'mdi-alert' });
      return false;
    }
    const creature = getCreature(creatureId)!;
    activeTaming.value = { creatureId, startTime: Date.now(), ticksRemaining: creature.tamingTime, totalTicks: creature.tamingTime };
    return true;
  }

  function cancelTaming() { activeTaming.value = null; }

  function completeTaming() {
    if (!activeTaming.value) return;
    const creature = getCreature(activeTaming.value.creatureId);
    if (!creature) { activeTaming.value = null; return; }

    const successChance = Math.min(95, Math.max(5, 100 - creature.tamingDifficulty + totalTamingBonus.value));
    const isSuccess = Math.random() * 100 < successChance;

    if (isSuccess) {
      const tamed: TamedCreature = {
        creatureId: creature.id,
        nickname: creature.name,
        level: 1,
        xp: 0,
        happiness: 100,
        stats: { ...creature.baseStats },
        tamedAt: Date.now(),
      };
      tamedCreatures.value.set(creature.id, tamed);
      if (!activeCompanion.value) activeCompanion.value = creature.id;
      addXp(creature.xpToTame);
      totalCreaturesTamed.value++;
      
      // Consume taming item
      for (const [itemId, count] of ownedItems.value) {
        const item = getTamingItem(itemId);
        if (item && item.targetTypes.includes(creature.type) && count > 0) {
          ownedItems.value.set(itemId, count - 1);
          break;
        }
      }
      
      gameStore.addNotification({ type: 'success', title: 'Stworzenie oswojone!', message: creature.name, icon: creature.icon, duration: 3000 });
    } else {
      addXp(Math.floor(creature.xpToTame * 0.2));
      gameStore.addNotification({ type: 'warning', title: 'Oswajanie nieudane', message: `${creature.name} uciekł!`, icon: 'mdi-alert', duration: 3000 });
    }

    activeTaming.value = null;
  }

  function setActiveCompanion(creatureId: string | null): boolean {
    if (creatureId && !tamedCreatures.value.has(creatureId)) return false;
    activeCompanion.value = creatureId;
    return true;
  }

  function feedCreature(creatureId: string, foodId: string): boolean {
    const creature = tamedCreatures.value.get(creatureId);
    const food = getFood(foodId);
    if (!creature || !food) return false;
    if (!resourcesStore.hasAmount('gold', food.cost)) return false;
    
    resourcesStore.removeResource('gold', food.cost);
    creature.happiness = Math.min(100, creature.happiness + food.happinessBonus);
    creature.stats.attack += food.statBonus;
    creature.stats.defense += food.statBonus;
    creature.stats.hp += food.statBonus * 5;
    
    gameStore.addNotification({ type: 'success', title: 'Nakarmiono!', message: `${creature.nickname} jest szczęśliwy!`, icon: 'mdi-heart', duration: 2000 });
    return true;
  }

  function releaseCreature(creatureId: string): boolean {
    if (!tamedCreatures.value.has(creatureId)) return false;
    tamedCreatures.value.delete(creatureId);
    if (activeCompanion.value === creatureId) {
      activeCompanion.value = tamedCreatures.value.size > 0 ? Array.from(tamedCreatures.value.keys())[0] : null;
    }
    gameStore.addNotification({ type: 'info', title: 'Stworzenie wypuszczone', message: 'Odeszło na wolność', icon: 'mdi-bird', duration: 2000 });
    return true;
  }

  function processTick() {
    if (activeTaming.value) {
      activeTaming.value.ticksRemaining--;
      if (activeTaming.value.ticksRemaining <= 0) completeTaming();
    }
    // Decrease happiness over time
    for (const [, creature] of tamedCreatures.value) {
      creature.happiness = Math.max(0, creature.happiness - 0.01);
    }
  }

  function getState() {
    return {
      progress: progress.value, tamingSkill: tamingSkill.value,
      ownedItems: Array.from(ownedItems.value.entries()),
      tamedCreatures: Array.from(tamedCreatures.value.entries()),
      activeCompanion: activeCompanion.value, maxCompanions: maxCompanions.value,
      totalCreaturesTamed: totalCreaturesTamed.value, totalBattlesWon: totalBattlesWon.value,
    };
  }

  function loadState(state: ReturnType<typeof getState>) {
    if (state.progress) progress.value = state.progress;
    if (state.tamingSkill !== undefined) tamingSkill.value = state.tamingSkill;
    if (state.ownedItems) ownedItems.value = new Map(state.ownedItems);
    if (state.tamedCreatures) tamedCreatures.value = new Map(state.tamedCreatures);
    if (state.activeCompanion !== undefined) activeCompanion.value = state.activeCompanion;
    if (state.maxCompanions !== undefined) maxCompanions.value = state.maxCompanions;
    if (state.totalCreaturesTamed !== undefined) totalCreaturesTamed.value = state.totalCreaturesTamed;
    if (state.totalBattlesWon !== undefined) totalBattlesWon.value = state.totalBattlesWon;
  }

  function resetTamer() {
    progress.value = { level: 1, xp: 0, xpToNextLevel: 100, totalXp: 0 };
    tamingSkill.value = 10;
    ownedItems.value = new Map();
    tamedCreatures.value = new Map();
    activeCompanion.value = null;
    activeTaming.value = null;
    maxCompanions.value = 3;
    totalCreaturesTamed.value = 0;
    totalBattlesWon.value = 0;
  }

  function devAddXp(amount: number) { addXp(amount); }
  function devTameAll() {
    for (const creature of Object.values(CREATURES)) {
      if (!tamedCreatures.value.has(creature.id)) {
        tamedCreatures.value.set(creature.id, {
          creatureId: creature.id, nickname: creature.name, level: 1, xp: 0, happiness: 100,
          stats: { ...creature.baseStats }, tamedAt: Date.now(),
        });
      }
    }
    maxCompanions.value = 20;
  }

  return {
    progress, tamingSkill, ownedItems, tamedCreatures, activeCompanion, activeTaming, maxCompanions,
    totalCreaturesTamed, totalBattlesWon,
    isTaming, tamingProgress, currentCompanion, availableCreatures, totalTamingBonus,
    addXp, getXpProgress, buyItem, canTame, startTaming, cancelTaming,
    setActiveCompanion, feedCreature, releaseCreature, processTick,
    getState, loadState, resetTamer, devAddXp, devTameAll,
  };
}, {
  persist: {
    key: 'ateria-tamer',
    serializer: {
      serialize: (state) => JSON.stringify({ ...state, ownedItems: Array.from(state.ownedItems?.entries?.() || []), tamedCreatures: Array.from(state.tamedCreatures?.entries?.() || []) }),
      deserialize: (value) => { const p = JSON.parse(value); return { ...p, ownedItems: new Map(p.ownedItems || []), tamedCreatures: new Map(p.tamedCreatures || []) }; },
    },
  },
});
