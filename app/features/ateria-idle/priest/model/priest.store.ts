/**
 * Priest Store - Faith, Prayers, Divine Powers
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAteriaGameStore } from '../../core/model/game.store';
import { useAteriaResourcesStore } from '../../core/model/resources.store';
import { DEITIES, PRAYERS, RITUALS, HOLY_RELICS, getDeity, getPrayer, getRitual, getRelic, getPrayersByDeity, calculatePriestXpToLevel, type Deity, type Prayer, type PriestProgress, type PrayerEffect } from '../data/priest.data';

export interface ActivePrayer { prayerId: string; effects: PrayerEffect[]; expiresAt: number; }
export interface ActiveRitual { ritualId: string; startTime: number; ticksRemaining: number; totalTicks: number; }
export interface PrayerCooldown { prayerId: string; expiresAt: number; }

export const useAteriaPriestStore = defineStore('ateria-priest', () => {
  const gameStore = useAteriaGameStore();
  const resourcesStore = useAteriaResourcesStore();

  const progress = ref<PriestProgress>({ level: 1, xp: 0, xpToNextLevel: 100, totalXp: 0 });
  const faith = ref(50);
  const maxFaith = ref(100);
  const faithRegen = ref(1);
  
  const devotedDeity = ref<string | null>('solaris');
  const deityFavor = ref<Map<string, number>>(new Map(Object.keys(DEITIES).map(id => [id, 0])));
  
  const ownedRelics = ref<Set<string>>(new Set(['prayer_beads']));
  const equippedRelic = ref<string>('prayer_beads');
  
  const activePrayers = ref<ActivePrayer[]>([]);
  const prayerCooldowns = ref<Map<string, number>>(new Map());
  const activeRitual = ref<ActiveRitual | null>(null);
  
  const totalPrayersCast = ref(0);
  const totalRitualsPerformed = ref(0);

  const isPerformingRitual = computed(() => activeRitual.value !== null);
  const ritualProgress = computed(() => {
    if (!activeRitual.value) return 0;
    return ((activeRitual.value.totalTicks - activeRitual.value.ticksRemaining) / activeRitual.value.totalTicks) * 100;
  });
  
  const currentRelic = computed(() => equippedRelic.value ? getRelic(equippedRelic.value) : null);
  const currentDeity = computed(() => devotedDeity.value ? getDeity(devotedDeity.value) : null);
  const currentFavor = computed(() => devotedDeity.value ? (deityFavor.value.get(devotedDeity.value) || 0) : 0);
  
  const availablePrayers = computed(() => {
    return Object.values(PRAYERS).filter(p => 
      p.requiredLevel <= progress.value.level &&
      p.requiredFavor <= (deityFavor.value.get(p.deityId) || 0)
    );
  });
  
  const totalFaithBonus = computed(() => currentRelic.value?.faithBonus || 0);
  const totalPrayerPower = computed(() => currentRelic.value?.prayerPower || 0);

  const totalBuffEffects = computed(() => {
    const effects: Record<string, number> = {};
    for (const prayer of activePrayers.value) {
      for (const effect of prayer.effects) {
        if (effect.stat) effects[effect.stat] = (effects[effect.stat] || 0) + effect.value;
      }
    }
    return effects;
  });

  function addXp(amount: number) {
    progress.value.xp += amount;
    progress.value.totalXp += amount;
    while (progress.value.xp >= progress.value.xpToNextLevel) {
      progress.value.xp -= progress.value.xpToNextLevel;
      progress.value.level++;
      progress.value.xpToNextLevel = calculatePriestXpToLevel(progress.value.level);
      maxFaith.value = 100 + progress.value.level * 10;
      faithRegen.value = 1 + Math.floor(progress.value.level / 5);
      gameStore.addNotification({ type: 'success', title: `Kapłan - Poziom ${progress.value.level}!`, message: 'Zwiększona moc boska!', icon: 'mdi-hands-pray', duration: 3000 });
    }
  }

  function getXpProgress(): number { return (progress.value.xp / progress.value.xpToNextLevel) * 100; }

  function regenerateFaith() { faith.value = Math.min(maxFaith.value, faith.value + faithRegen.value); }

  function devoteToDeity(deityId: string): boolean {
    if (!getDeity(deityId)) return false;
    devotedDeity.value = deityId;
    gameStore.addNotification({ type: 'success', title: 'Oddanie!', message: `Poświęciłeś się ${getDeity(deityId)?.name}`, icon: getDeity(deityId)?.icon, duration: 3000 });
    return true;
  }

  function buyRelic(relicId: string): boolean {
    const relic = getRelic(relicId);
    if (!relic || ownedRelics.value.has(relicId) || relic.requiredLevel > progress.value.level) return false;
    if (!resourcesStore.hasAmount('gold', relic.cost)) return false;
    resourcesStore.removeResource('gold', relic.cost);
    ownedRelics.value.add(relicId);
    gameStore.addNotification({ type: 'success', title: 'Relikwia zdobyta!', message: relic.name, icon: relic.icon, duration: 2000 });
    return true;
  }

  function equipRelic(relicId: string): boolean {
    if (!ownedRelics.value.has(relicId)) return false;
    equippedRelic.value = relicId;
    return true;
  }

  function canPray(prayerId: string): { canPray: boolean; reason?: string } {
    const prayer = getPrayer(prayerId);
    if (!prayer) return { canPray: false, reason: 'Nieznana modlitwa' };
    if (prayer.requiredLevel > progress.value.level) return { canPray: false, reason: `Wymaga poziomu ${prayer.requiredLevel}` };
    const favor = deityFavor.value.get(prayer.deityId) || 0;
    if (favor < prayer.requiredFavor) return { canPray: false, reason: `Wymaga ${prayer.requiredFavor} łaski` };
    if (faith.value < prayer.faithCost) return { canPray: false, reason: 'Brak wiary' };
    const cooldownEnd = prayerCooldowns.value.get(prayerId);
    if (cooldownEnd && cooldownEnd > Date.now()) return { canPray: false, reason: 'Odnowienie' };
    return { canPray: true };
  }

  function castPrayer(prayerId: string): boolean {
    const check = canPray(prayerId);
    if (!check.canPray) {
      gameStore.addNotification({ type: 'warning', title: 'Nie można się modlić', message: check.reason || '', icon: 'mdi-alert' });
      return false;
    }
    const prayer = getPrayer(prayerId)!;
    faith.value -= prayer.faithCost;
    prayerCooldowns.value.set(prayerId, Date.now() + prayer.cooldown * 100);
    
    if (prayer.duration > 0) {
      const active: ActivePrayer = { prayerId, effects: prayer.effects, expiresAt: Date.now() + prayer.duration * 100 };
      activePrayers.value = activePrayers.value.filter(p => p.prayerId !== prayerId);
      activePrayers.value.push(active);
    }
    
    addXp(prayer.xpReward);
    totalPrayersCast.value++;
    
    // Add favor to deity
    const currentFavorVal = deityFavor.value.get(prayer.deityId) || 0;
    deityFavor.value.set(prayer.deityId, currentFavorVal + 1);
    
    gameStore.addNotification({ type: 'success', title: prayer.name, message: prayer.effects.map(e => e.description).join(', '), icon: prayer.icon, duration: 2000 });
    return true;
  }

  function canPerformRitual(ritualId: string): { canPerform: boolean; reason?: string } {
    const ritual = getRitual(ritualId);
    if (!ritual) return { canPerform: false, reason: 'Nieznany rytuał' };
    if (isPerformingRitual.value) return { canPerform: false, reason: 'Już odprawiasz rytuał' };
    if (ritual.requiredLevel > progress.value.level) return { canPerform: false, reason: `Wymaga poziomu ${ritual.requiredLevel}` };
    if (faith.value < ritual.faithCost) return { canPerform: false, reason: 'Brak wiary' };
    if (!resourcesStore.hasAmount('gold', ritual.goldCost)) return { canPerform: false, reason: 'Brak złota' };
    return { canPerform: true };
  }

  function startRitual(ritualId: string): boolean {
    const check = canPerformRitual(ritualId);
    if (!check.canPerform) {
      gameStore.addNotification({ type: 'warning', title: 'Nie można odprawić', message: check.reason || '', icon: 'mdi-alert' });
      return false;
    }
    const ritual = getRitual(ritualId)!;
    faith.value -= ritual.faithCost;
    resourcesStore.removeResource('gold', ritual.goldCost);
    activeRitual.value = { ritualId, startTime: Date.now(), ticksRemaining: ritual.ritualTime, totalTicks: ritual.ritualTime };
    return true;
  }

  function cancelRitual() { activeRitual.value = null; }

  function completeRitual() {
    if (!activeRitual.value) return;
    const ritual = getRitual(activeRitual.value.ritualId);
    if (!ritual) { activeRitual.value = null; return; }
    
    for (const effect of ritual.effects) {
      if (effect.type === 'faith') faith.value = Math.min(maxFaith.value, faith.value + effect.value);
      if (effect.type === 'favor' && devotedDeity.value) {
        const current = deityFavor.value.get(devotedDeity.value) || 0;
        deityFavor.value.set(devotedDeity.value, current + effect.value);
      }
    }
    
    addXp(ritual.xpReward);
    totalRitualsPerformed.value++;
    gameStore.addNotification({ type: 'success', title: 'Rytuał ukończony!', message: ritual.name, icon: ritual.icon, duration: 3000 });
    activeRitual.value = null;
  }

  function processPrayers() {
    const now = Date.now();
    activePrayers.value = activePrayers.value.filter(p => p.expiresAt > now);
    for (const [prayerId, expiresAt] of prayerCooldowns.value) {
      if (expiresAt <= now) prayerCooldowns.value.delete(prayerId);
    }
  }

  function processTick() {
    regenerateFaith();
    processPrayers();
    if (activeRitual.value) {
      activeRitual.value.ticksRemaining--;
      if (activeRitual.value.ticksRemaining <= 0) completeRitual();
    }
  }

  function getState() {
    return {
      progress: progress.value, faith: faith.value, maxFaith: maxFaith.value, faithRegen: faithRegen.value,
      devotedDeity: devotedDeity.value, deityFavor: Array.from(deityFavor.value.entries()),
      ownedRelics: Array.from(ownedRelics.value), equippedRelic: equippedRelic.value,
      activePrayers: activePrayers.value, prayerCooldowns: Array.from(prayerCooldowns.value.entries()),
      totalPrayersCast: totalPrayersCast.value, totalRitualsPerformed: totalRitualsPerformed.value,
    };
  }

  function loadState(state: ReturnType<typeof getState>) {
    if (state.progress) progress.value = state.progress;
    if (state.faith !== undefined) faith.value = state.faith;
    if (state.maxFaith !== undefined) maxFaith.value = state.maxFaith;
    if (state.faithRegen !== undefined) faithRegen.value = state.faithRegen;
    if (state.devotedDeity !== undefined) devotedDeity.value = state.devotedDeity;
    if (state.deityFavor) deityFavor.value = new Map(state.deityFavor);
    if (state.ownedRelics) ownedRelics.value = new Set(state.ownedRelics);
    if (state.equippedRelic) equippedRelic.value = state.equippedRelic;
    if (state.activePrayers) activePrayers.value = state.activePrayers;
    if (state.prayerCooldowns) prayerCooldowns.value = new Map(state.prayerCooldowns);
    if (state.totalPrayersCast !== undefined) totalPrayersCast.value = state.totalPrayersCast;
    if (state.totalRitualsPerformed !== undefined) totalRitualsPerformed.value = state.totalRitualsPerformed;
  }

  function resetPriest() {
    progress.value = { level: 1, xp: 0, xpToNextLevel: 100, totalXp: 0 };
    faith.value = 50; maxFaith.value = 100; faithRegen.value = 1;
    devotedDeity.value = 'solaris';
    deityFavor.value = new Map(Object.keys(DEITIES).map(id => [id, 0]));
    ownedRelics.value = new Set(['prayer_beads']); equippedRelic.value = 'prayer_beads';
    activePrayers.value = []; prayerCooldowns.value = new Map(); activeRitual.value = null;
    totalPrayersCast.value = 0; totalRitualsPerformed.value = 0;
  }

  function devAddXp(amount: number) { addXp(amount); }
  function devMaxFaith() { faith.value = maxFaith.value; }
  function devAddFavor() { for (const id of Object.keys(DEITIES)) deityFavor.value.set(id, 1000); }
  function devUnlockAll() { for (const id of Object.keys(HOLY_RELICS)) ownedRelics.value.add(id); }

  return {
    progress, faith, maxFaith, faithRegen, devotedDeity, deityFavor, ownedRelics, equippedRelic,
    activePrayers, prayerCooldowns, activeRitual, totalPrayersCast, totalRitualsPerformed,
    isPerformingRitual, ritualProgress, currentRelic, currentDeity, currentFavor, availablePrayers,
    totalFaithBonus, totalPrayerPower, totalBuffEffects,
    addXp, getXpProgress, devoteToDeity, buyRelic, equipRelic,
    canPray, castPrayer, canPerformRitual, startRitual, cancelRitual, processTick,
    getState, loadState, resetPriest, devAddXp, devMaxFaith, devAddFavor, devUnlockAll,
  };
}, {
  persist: {
    key: 'ateria-priest',
    serializer: {
      serialize: (state) => JSON.stringify({ ...state, deityFavor: Array.from(state.deityFavor?.entries?.() || []), ownedRelics: Array.from(state.ownedRelics || []), prayerCooldowns: Array.from(state.prayerCooldowns?.entries?.() || []) }),
      deserialize: (value) => { const p = JSON.parse(value); return { ...p, deityFavor: new Map(p.deityFavor || []), ownedRelics: new Set(p.ownedRelics || []), prayerCooldowns: new Map(p.prayerCooldowns || []) }; },
    },
  },
});
