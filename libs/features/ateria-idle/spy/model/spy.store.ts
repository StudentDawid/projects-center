/**
 * Spy Store - Espionage, Missions, Intelligence
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAteriaGameStore } from '../../core/model/game.store';
import { useAteriaResourcesStore } from '../../core/model/resources.store';
import { SPY_MISSIONS, SPY_GEAR, INFORMANTS, getMission, getGear, getInformant, getAvailableMissions, calculateSpyXpToLevel, type SpyMission, type SpyProgress } from '../data/spy.data';

export interface ActiveMission { missionId: string; startTime: number; ticksRemaining: number; totalTicks: number; }

export const useAteriaSpyStore = defineStore('ateria-spy', () => {
  const gameStore = useAteriaGameStore();
  const resourcesStore = useAteriaResourcesStore();

  const progress = ref<SpyProgress>({ level: 1, xp: 0, xpToNextLevel: 100, totalXp: 0 });
  const stealth = ref(10);
  const intel = ref(0);
  
  const ownedGear = ref<Set<string>>(new Set(['dark_cloak']));
  const equippedGear = ref<Set<string>>(new Set(['dark_cloak']));
  const recruitedInformants = ref<Set<string>>(new Set());
  
  const activeMission = ref<ActiveMission | null>(null);
  const completedMissions = ref<Map<string, number>>(new Map());
  
  const totalMissionsCompleted = ref(0);
  const successfulMissions = ref(0);
  const totalGoldStolen = ref(0);

  const isOnMission = computed(() => activeMission.value !== null);
  const missionProgress = computed(() => {
    if (!activeMission.value) return 0;
    return ((activeMission.value.totalTicks - activeMission.value.ticksRemaining) / activeMission.value.totalTicks) * 100;
  });
  
  const totalStealthBonus = computed(() => {
    let bonus = 0;
    for (const gearId of equippedGear.value) {
      const gear = getGear(gearId);
      if (gear) bonus += gear.stealthBonus;
    }
    return bonus;
  });
  
  const totalSuccessBonus = computed(() => {
    let bonus = 0;
    for (const gearId of equippedGear.value) {
      const gear = getGear(gearId);
      if (gear) bonus += gear.successBonus;
    }
    for (const informantId of recruitedInformants.value) {
      const informant = getInformant(informantId);
      if (informant) bonus += informant.missionBonus;
    }
    return bonus;
  });
  
  const effectiveStealth = computed(() => stealth.value + totalStealthBonus.value);
  const availableMissions = computed(() => getAvailableMissions(progress.value.level));

  function addXp(amount: number) {
    progress.value.xp += amount;
    progress.value.totalXp += amount;
    while (progress.value.xp >= progress.value.xpToNextLevel) {
      progress.value.xp -= progress.value.xpToNextLevel;
      progress.value.level++;
      progress.value.xpToNextLevel = calculateSpyXpToLevel(progress.value.level);
      stealth.value += 5;
      gameStore.addNotification({ type: 'success', title: `Szpieg - Poziom ${progress.value.level}!`, message: '+5 skradanie', icon: 'mdi-eye-off', duration: 3000 });
    }
  }

  function getXpProgress(): number { return (progress.value.xp / progress.value.xpToNextLevel) * 100; }

  function buyGear(gearId: string): boolean {
    const gear = getGear(gearId);
    if (!gear || ownedGear.value.has(gearId) || gear.requiredLevel > progress.value.level) return false;
    if (!resourcesStore.hasAmount('gold', gear.cost)) return false;
    resourcesStore.removeResource('gold', gear.cost);
    ownedGear.value.add(gearId);
    gameStore.addNotification({ type: 'success', title: 'Kupiono sprzęt!', message: gear.name, icon: gear.icon, duration: 2000 });
    return true;
  }

  function equipGear(gearId: string): boolean {
    if (!ownedGear.value.has(gearId)) return false;
    equippedGear.value.add(gearId);
    return true;
  }

  function unequipGear(gearId: string): boolean {
    equippedGear.value.delete(gearId);
    return true;
  }

  function recruitInformant(informantId: string): boolean {
    const informant = getInformant(informantId);
    if (!informant || recruitedInformants.value.has(informantId) || informant.requiredLevel > progress.value.level) return false;
    if (!resourcesStore.hasAmount('gold', informant.recruitCost)) return false;
    resourcesStore.removeResource('gold', informant.recruitCost);
    recruitedInformants.value.add(informantId);
    gameStore.addNotification({ type: 'success', title: 'Informator zwerbowany!', message: informant.name, icon: informant.icon, duration: 2000 });
    return true;
  }

  function canStartMission(missionId: string): { canStart: boolean; reason?: string } {
    const mission = getMission(missionId);
    if (!mission) return { canStart: false, reason: 'Nieznana misja' };
    if (isOnMission.value) return { canStart: false, reason: 'Już na misji' };
    if (mission.requiredLevel > progress.value.level) return { canStart: false, reason: `Wymaga poziomu ${mission.requiredLevel}` };
    if (effectiveStealth.value < mission.stealthRequired) return { canStart: false, reason: `Wymaga ${mission.stealthRequired} skradania` };
    if (!resourcesStore.hasAmount('gold', mission.goldCost)) return { canStart: false, reason: 'Brak złota' };
    return { canStart: true };
  }

  function startMission(missionId: string): boolean {
    const check = canStartMission(missionId);
    if (!check.canStart) {
      gameStore.addNotification({ type: 'warning', title: 'Nie można rozpocząć', message: check.reason || '', icon: 'mdi-alert' });
      return false;
    }
    const mission = getMission(missionId)!;
    resourcesStore.removeResource('gold', mission.goldCost);
    activeMission.value = { missionId, startTime: Date.now(), ticksRemaining: mission.duration, totalTicks: mission.duration };
    return true;
  }

  function cancelMission() { activeMission.value = null; }

  function completeMission() {
    if (!activeMission.value) return;
    const mission = getMission(activeMission.value.missionId);
    if (!mission) { activeMission.value = null; return; }

    totalMissionsCompleted.value++;
    const finalSuccessChance = Math.min(95, mission.successChance + totalSuccessBonus.value);
    const isSuccess = Math.random() * 100 < finalSuccessChance;

    if (isSuccess) {
      successfulMissions.value++;
      addXp(mission.xpReward);
      resourcesStore.addResource('gold', mission.goldReward);
      totalGoldStolen.value += mission.goldReward;
      const count = completedMissions.value.get(mission.id) || 0;
      completedMissions.value.set(mission.id, count + 1);
      gameStore.addNotification({ type: 'success', title: 'Misja zakończona sukcesem!', message: `+${mission.goldReward}g, +${mission.xpReward}XP`, icon: 'mdi-check', duration: 3000 });
    } else {
      addXp(Math.floor(mission.xpReward * 0.2));
      gameStore.addNotification({ type: 'warning', title: 'Misja nieudana', message: 'Ledwo uciekłeś!', icon: 'mdi-alert', duration: 3000 });
    }

    activeMission.value = null;
  }

  function processTick() {
    if (activeMission.value) {
      activeMission.value.ticksRemaining--;
      if (activeMission.value.ticksRemaining <= 0) completeMission();
    }
    // Intel from informants
    for (const informantId of recruitedInformants.value) {
      const informant = getInformant(informantId);
      if (informant) intel.value += informant.intelGain / 100; // Per tick
    }
  }

  function getState() {
    return {
      progress: progress.value, stealth: stealth.value, intel: intel.value,
      ownedGear: Array.from(ownedGear.value), equippedGear: Array.from(equippedGear.value),
      recruitedInformants: Array.from(recruitedInformants.value),
      completedMissions: Array.from(completedMissions.value.entries()),
      totalMissionsCompleted: totalMissionsCompleted.value, successfulMissions: successfulMissions.value, totalGoldStolen: totalGoldStolen.value,
    };
  }

  function loadState(state: ReturnType<typeof getState>) {
    if (state.progress) progress.value = state.progress;
    if (state.stealth !== undefined) stealth.value = state.stealth;
    if (state.intel !== undefined) intel.value = state.intel;
    if (state.ownedGear) ownedGear.value = new Set(state.ownedGear);
    if (state.equippedGear) equippedGear.value = new Set(state.equippedGear);
    if (state.recruitedInformants) recruitedInformants.value = new Set(state.recruitedInformants);
    if (state.completedMissions) completedMissions.value = new Map(state.completedMissions);
    if (state.totalMissionsCompleted !== undefined) totalMissionsCompleted.value = state.totalMissionsCompleted;
    if (state.successfulMissions !== undefined) successfulMissions.value = state.successfulMissions;
    if (state.totalGoldStolen !== undefined) totalGoldStolen.value = state.totalGoldStolen;
  }

  function resetSpy() {
    progress.value = { level: 1, xp: 0, xpToNextLevel: 100, totalXp: 0 };
    stealth.value = 10; intel.value = 0;
    ownedGear.value = new Set(['dark_cloak']); equippedGear.value = new Set(['dark_cloak']);
    recruitedInformants.value = new Set();
    activeMission.value = null; completedMissions.value = new Map();
    totalMissionsCompleted.value = 0; successfulMissions.value = 0; totalGoldStolen.value = 0;
  }

  function devAddXp(amount: number) { addXp(amount); }
  function devUnlockAll() {
    for (const id of Object.keys(SPY_GEAR)) ownedGear.value.add(id);
    for (const id of Object.keys(INFORMANTS)) recruitedInformants.value.add(id);
  }

  return {
    progress, stealth, intel, ownedGear, equippedGear, recruitedInformants, activeMission, completedMissions,
    totalMissionsCompleted, successfulMissions, totalGoldStolen,
    isOnMission, missionProgress, totalStealthBonus, totalSuccessBonus, effectiveStealth, availableMissions,
    addXp, getXpProgress, buyGear, equipGear, unequipGear, recruitInformant,
    canStartMission, startMission, cancelMission, processTick,
    getState, loadState, resetSpy, devAddXp, devUnlockAll,
  };
}, {
  persist: {
    key: 'ateria-spy',
    serializer: {
      serialize: (state) => JSON.stringify({ ...state, ownedGear: Array.from(state.ownedGear || []), equippedGear: Array.from(state.equippedGear || []), recruitedInformants: Array.from(state.recruitedInformants || []), completedMissions: Array.from(state.completedMissions?.entries?.() || []) }),
      deserialize: (value) => { const p = JSON.parse(value); return { ...p, ownedGear: new Set(p.ownedGear || []), equippedGear: new Set(p.equippedGear || []), recruitedInformants: new Set(p.recruitedInformants || []), completedMissions: new Map(p.completedMissions || []) }; },
    },
  },
});
