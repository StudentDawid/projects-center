/**
 * Synergies Store - Cross-Path Bonus Calculation
 * Manages: Synergy activation, bonus calculation, path level tracking
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAteriaGameStore } from '../../core/model/game.store';

// Import all path stores
import { useAteriaWarriorStore } from '../../warrior/model/warrior.store';
import { useAteriaMerchantStore } from '../../merchant/model/merchant.store';
import { useAteriaScientistStore } from '../../scientist/model/scientist.store';
import { useAteriaGatheringStore } from '../../gathering/model/gathering.store';
import { useAteriaCraftingStore } from '../../crafting/model/crafting.store';
import { useAteriaDiplomatStore } from '../../diplomat/model/diplomat.store';
import { useAteriaDruidStore } from '../../druid/model/druid.store';
import { useAteriaMysticStore } from '../../mystic/model/mystic.store';
import { useAteriaChefStore } from '../../chef/model/chef.store';
import { useAteriaFishermanStore } from '../../fisherman/model/fisherman.store';
import { useAteriaWizardStore } from '../../wizard/model/wizard.store';
import { useAteriaExplorerStore } from '../../explorer/model/explorer.store';
import { useAteriaBardStore } from '../../bard/model/bard.store';
import { useAteriaAlchemistStore } from '../../alchemist/model/alchemist.store';
import { useAteriaArchitectStore } from '../../architect/model/architect.store';
import { useAteriaSpyStore } from '../../spy/model/spy.store';
import { useAteriaTamerStore } from '../../tamer/model/tamer.store';
import { useAteriaPriestStore } from '../../priest/model/priest.store';

import {
  PATH_SYNERGIES, PATH_INFO, SYNERGY_TIER_DATA,
  getSynergiesFromPath, getSynergiesToPath, getSynergy, getAllPaths,
  type PathId, type BonusType, type PathSynergy, type SynergyBonus
} from '../data/synergies.data';

// ============================================
// TYPES
// ============================================

export interface ActiveSynergy {
  synergyId: string;
  fromPath: PathId;
  toPath: PathId;
  fromLevel: number;
  bonuses: { type: BonusType; value: number }[];
  isActive: boolean;
  specialEffectActive: boolean;
}

export interface PathBonusSummary {
  pathId: PathId;
  totalBonuses: Record<BonusType, number>;
  activeSynergies: number;
  specialEffectsActive: number;
}

export interface GlobalBonuses {
  attack: number;
  defense: number;
  hp: number;
  hp_regen: number;
  crit_chance: number;
  crit_damage: number;
  damage_reduction: number;
  accuracy: number;
  evasion: number;
  speed: number;
  gold_gain: number;
  xp_gain: number;
  drop_rate: number;
  resource_gain: number;
  crafting_speed: number;
  crafting_quality: number;
  research_speed: number;
  gathering_speed: number;
  gathering_yield: number;
  fishing_speed: number;
  fishing_luck: number;
  cooking_speed: number;
  cooking_quality: number;
  reputation_gain: number;
  haggling: number;
  spell_power: number;
  mana_regen: number;
  exploration_speed: number;
  discovery_chance: number;
  performance_quality: number;
  fame_gain: number;
  brewing_speed: number;
  potion_potency: number;
  building_speed: number;
  population_bonus: number;
  mission_success: number;
  intel_gain: number;
  taming_chance: number;
  companion_power: number;
  faith_gain: number;
  blessing_duration: number;
  meditation_speed: number;
  vision_clarity: number;
  totem_power: number;
  harvest_yield: number;
}

// ============================================
// STORE
// ============================================

export const useAteriaSynergiesStore = defineStore('ateria-synergies', () => {
  const gameStore = useAteriaGameStore();

  // ============================================
  // PATH LEVEL GETTERS
  // ============================================

  function getPathLevel(pathId: PathId): number {
    switch (pathId) {
      case 'warrior': return useAteriaWarriorStore().stats.level;
      case 'merchant': return useAteriaMerchantStore().merchantLevel;
      case 'scientist': return useAteriaScientistStore().scientistLevel;
      case 'gathering': return useAteriaGatheringStore().overallLevel;
      case 'crafting': return useAteriaCraftingStore().overallLevel;
      case 'diplomat': return useAteriaDiplomatStore().diplomatLevel;
      case 'druid': return useAteriaDruidStore().druidLevel;
      case 'mystic': return useAteriaMysticStore().mysticLevel;
      case 'chef': return useAteriaChefStore().chefLevel;
      case 'fisherman': return useAteriaFishermanStore().fishermanLevel;
      case 'wizard': return useAteriaWizardStore().wizardLevel;
      case 'explorer': return useAteriaExplorerStore().explorerLevel;
      case 'bard': return useAteriaBardStore().bardLevel;
      case 'alchemist': return useAteriaAlchemistStore().alchemistLevel;
      case 'architect': return useAteriaArchitectStore().architectLevel;
      case 'spy': return useAteriaSpyStore().spyLevel;
      case 'tamer': return useAteriaTamerStore().tamerLevel;
      case 'priest': return useAteriaPriestStore().priestLevel;
      default: return 0;
    }
  }

  // ============================================
  // STATE
  // ============================================

  // Track manually triggered special effects
  const activeSpecialEffects = ref<Set<string>>(new Set());
  
  // Statistics
  const totalSynergiesActivated = ref(0);
  const specialEffectsTriggered = ref(0);

  // ============================================
  // COMPUTED - All Path Levels
  // ============================================

  const allPathLevels = computed((): Record<PathId, number> => {
    const levels: Record<PathId, number> = {} as any;
    for (const pathId of getAllPaths()) {
      levels[pathId] = getPathLevel(pathId);
    }
    return levels;
  });

  const totalLevels = computed(() => {
    return Object.values(allPathLevels.value).reduce((sum, level) => sum + level, 0);
  });

  // ============================================
  // COMPUTED - Active Synergies
  // ============================================

  const activeSynergies = computed((): ActiveSynergy[] => {
    const active: ActiveSynergy[] = [];

    for (const synergy of PATH_SYNERGIES) {
      const fromLevel = allPathLevels.value[synergy.fromPath];
      const isActive = fromLevel >= synergy.unlockLevel;

      if (isActive) {
        const bonuses: { type: BonusType; value: number }[] = [];
        
        for (const bonus of synergy.bonuses) {
          // Calculate bonus based on level above unlock
          const effectiveLevel = fromLevel - synergy.unlockLevel + 1;
          const tierMultiplier = SYNERGY_TIER_DATA[synergy.tier].multiplier;
          const rawValue = bonus.value * effectiveLevel * tierMultiplier;
          const cappedValue = Math.min(rawValue, bonus.maxValue);
          
          if (cappedValue !== 0) {
            bonuses.push({ type: bonus.type, value: cappedValue });
          }
        }

        active.push({
          synergyId: synergy.id,
          fromPath: synergy.fromPath,
          toPath: synergy.toPath,
          fromLevel,
          bonuses,
          isActive,
          specialEffectActive: activeSpecialEffects.value.has(synergy.id),
        });
      }
    }

    return active;
  });

  const totalActiveSynergies = computed(() => activeSynergies.value.length);

  // ============================================
  // COMPUTED - Bonus Aggregation by Path
  // ============================================

  const bonusesByPath = computed((): Record<PathId, Record<BonusType, number>> => {
    const pathBonuses: Record<PathId, Record<BonusType, number>> = {} as any;

    for (const pathId of getAllPaths()) {
      pathBonuses[pathId] = {} as Record<BonusType, number>;
    }

    for (const synergy of activeSynergies.value) {
      for (const bonus of synergy.bonuses) {
        const current = pathBonuses[synergy.toPath][bonus.type] || 0;
        pathBonuses[synergy.toPath][bonus.type] = current + bonus.value;
      }
    }

    return pathBonuses;
  });

  // ============================================
  // COMPUTED - Global Bonuses (all paths combined)
  // ============================================

  const globalBonuses = computed((): GlobalBonuses => {
    const bonuses: GlobalBonuses = {
      attack: 0, defense: 0, hp: 0, hp_regen: 0, crit_chance: 0, crit_damage: 0,
      damage_reduction: 0, accuracy: 0, evasion: 0, speed: 0,
      gold_gain: 0, xp_gain: 0, drop_rate: 0, resource_gain: 0,
      crafting_speed: 0, crafting_quality: 0, research_speed: 0,
      gathering_speed: 0, gathering_yield: 0, fishing_speed: 0, fishing_luck: 0,
      cooking_speed: 0, cooking_quality: 0, reputation_gain: 0, haggling: 0,
      spell_power: 0, mana_regen: 0, exploration_speed: 0, discovery_chance: 0,
      performance_quality: 0, fame_gain: 0, brewing_speed: 0, potion_potency: 0,
      building_speed: 0, population_bonus: 0, mission_success: 0, intel_gain: 0,
      taming_chance: 0, companion_power: 0, faith_gain: 0, blessing_duration: 0,
      meditation_speed: 0, vision_clarity: 0, totem_power: 0, harvest_yield: 0,
    };

    for (const synergy of activeSynergies.value) {
      for (const bonus of synergy.bonuses) {
        bonuses[bonus.type] += bonus.value;
      }
    }

    return bonuses;
  });

  // ============================================
  // PATH-SPECIFIC BONUS GETTERS
  // ============================================

  function getWarriorBonuses() {
    const pathBonuses = bonusesByPath.value.warrior;
    return {
      attack: pathBonuses.attack || 0,
      defense: pathBonuses.defense || 0,
      hp: pathBonuses.hp || 0,
      hp_regen: pathBonuses.hp_regen || 0,
      crit_chance: pathBonuses.crit_chance || 0,
      crit_damage: pathBonuses.crit_damage || 0,
      damage_reduction: pathBonuses.damage_reduction || 0,
      accuracy: pathBonuses.accuracy || 0,
      evasion: pathBonuses.evasion || 0,
      speed: pathBonuses.speed || 0,
      xp_gain: pathBonuses.xp_gain || 0,
      gold_gain: pathBonuses.gold_gain || 0,
    };
  }

  function getMerchantBonuses() {
    const pathBonuses = bonusesByPath.value.merchant;
    return {
      gold_gain: pathBonuses.gold_gain || 0,
      haggling: pathBonuses.haggling || 0,
      population_bonus: pathBonuses.population_bonus || 0,
      drop_rate: pathBonuses.drop_rate || 0,
    };
  }

  function getGatheringBonuses() {
    const pathBonuses = bonusesByPath.value.gathering;
    return {
      gathering_speed: pathBonuses.gathering_speed || 0,
      gathering_yield: pathBonuses.gathering_yield || 0,
      resource_gain: pathBonuses.resource_gain || 0,
    };
  }

  function getCraftingBonuses() {
    const pathBonuses = bonusesByPath.value.crafting;
    return {
      crafting_speed: pathBonuses.crafting_speed || 0,
      crafting_quality: pathBonuses.crafting_quality || 0,
      resource_gain: pathBonuses.resource_gain || 0,
    };
  }

  function getChefBonuses() {
    const pathBonuses = bonusesByPath.value.chef;
    return {
      cooking_speed: pathBonuses.cooking_speed || 0,
      cooking_quality: pathBonuses.cooking_quality || 0,
    };
  }

  function getFishermanBonuses() {
    const pathBonuses = bonusesByPath.value.fisherman;
    return {
      fishing_speed: pathBonuses.fishing_speed || 0,
      fishing_luck: pathBonuses.fishing_luck || 0,
    };
  }

  function getWizardBonuses() {
    const pathBonuses = bonusesByPath.value.wizard;
    return {
      spell_power: pathBonuses.spell_power || 0,
      mana_regen: pathBonuses.mana_regen || 0,
      research_speed: pathBonuses.research_speed || 0,
    };
  }

  function getExplorerBonuses() {
    const pathBonuses = bonusesByPath.value.explorer;
    return {
      exploration_speed: pathBonuses.exploration_speed || 0,
      discovery_chance: pathBonuses.discovery_chance || 0,
    };
  }

  function getBardBonuses() {
    const pathBonuses = bonusesByPath.value.bard;
    return {
      performance_quality: pathBonuses.performance_quality || 0,
      fame_gain: pathBonuses.fame_gain || 0,
      gold_gain: pathBonuses.gold_gain || 0,
    };
  }

  function getAlchemistBonuses() {
    const pathBonuses = bonusesByPath.value.alchemist;
    return {
      brewing_speed: pathBonuses.brewing_speed || 0,
      potion_potency: pathBonuses.potion_potency || 0,
      resource_gain: pathBonuses.resource_gain || 0,
    };
  }

  function getArchitectBonuses() {
    const pathBonuses = bonusesByPath.value.architect;
    return {
      building_speed: pathBonuses.building_speed || 0,
      population_bonus: pathBonuses.population_bonus || 0,
    };
  }

  function getSpyBonuses() {
    const pathBonuses = bonusesByPath.value.spy;
    return {
      mission_success: pathBonuses.mission_success || 0,
      intel_gain: pathBonuses.intel_gain || 0,
    };
  }

  function getTamerBonuses() {
    const pathBonuses = bonusesByPath.value.tamer;
    return {
      taming_chance: pathBonuses.taming_chance || 0,
      companion_power: pathBonuses.companion_power || 0,
    };
  }

  function getPriestBonuses() {
    const pathBonuses = bonusesByPath.value.priest;
    return {
      faith_gain: pathBonuses.faith_gain || 0,
      blessing_duration: pathBonuses.blessing_duration || 0,
    };
  }

  function getDiplomatBonuses() {
    const pathBonuses = bonusesByPath.value.diplomat;
    return {
      reputation_gain: pathBonuses.reputation_gain || 0,
      intel_gain: pathBonuses.intel_gain || 0,
    };
  }

  function getDruidBonuses() {
    const pathBonuses = bonusesByPath.value.druid;
    return {
      harvest_yield: pathBonuses.harvest_yield || 0,
      totem_power: pathBonuses.totem_power || 0,
    };
  }

  function getMysticBonuses() {
    const pathBonuses = bonusesByPath.value.mystic;
    return {
      meditation_speed: pathBonuses.meditation_speed || 0,
      vision_clarity: pathBonuses.vision_clarity || 0,
      spell_power: pathBonuses.spell_power || 0,
    };
  }

  function getScientistBonuses() {
    const pathBonuses = bonusesByPath.value.scientist;
    return {
      research_speed: pathBonuses.research_speed || 0,
      potion_potency: pathBonuses.potion_potency || 0,
    };
  }

  // ============================================
  // GENERIC BONUS GETTER
  // ============================================

  function getBonus(bonusType: BonusType): number {
    return globalBonuses.value[bonusType] || 0;
  }

  function getPathBonus(pathId: PathId, bonusType: BonusType): number {
    return bonusesByPath.value[pathId]?.[bonusType] || 0;
  }

  // ============================================
  // SYNERGY QUERIES
  // ============================================

  function getSynergiesFrom(pathId: PathId): ActiveSynergy[] {
    return activeSynergies.value.filter(s => s.fromPath === pathId);
  }

  function getSynergiesTo(pathId: PathId): ActiveSynergy[] {
    return activeSynergies.value.filter(s => s.toPath === pathId);
  }

  function isSynergyActive(fromPath: PathId, toPath: PathId): boolean {
    return activeSynergies.value.some(s => s.fromPath === fromPath && s.toPath === toPath);
  }

  function getSynergyDetails(fromPath: PathId, toPath: PathId): ActiveSynergy | undefined {
    return activeSynergies.value.find(s => s.fromPath === fromPath && s.toPath === toPath);
  }

  // ============================================
  // SPECIAL EFFECTS
  // ============================================

  function triggerSpecialEffect(synergyId: string) {
    const synergy = PATH_SYNERGIES.find(s => s.id === synergyId);
    if (!synergy?.specialEffect) return;

    activeSpecialEffects.value.add(synergyId);
    specialEffectsTriggered.value++;

    gameStore.addNotification({
      type: 'success',
      title: synergy.specialEffect.name,
      message: synergy.specialEffect.description,
      icon: synergy.icon,
      duration: 3000,
    });

    // Auto-deactivate after 30 seconds
    setTimeout(() => {
      activeSpecialEffects.value.delete(synergyId);
    }, 30000);
  }

  function isSpecialEffectActive(synergyId: string): boolean {
    return activeSpecialEffects.value.has(synergyId);
  }

  // ============================================
  // STATISTICS
  // ============================================

  const synergyStatistics = computed(() => {
    const stats = {
      totalPossible: PATH_SYNERGIES.length,
      totalActive: totalActiveSynergies.value,
      byTier: { minor: 0, moderate: 0, major: 0, legendary: 0 },
      byPath: {} as Record<PathId, { giving: number; receiving: number }>,
      totalBonusValue: 0,
    };

    for (const pathId of getAllPaths()) {
      stats.byPath[pathId] = { giving: 0, receiving: 0 };
    }

    for (const synergy of activeSynergies.value) {
      const def = PATH_SYNERGIES.find(s => s.id === synergy.synergyId);
      if (def) {
        stats.byTier[def.tier]++;
      }
      stats.byPath[synergy.fromPath].giving++;
      stats.byPath[synergy.toPath].receiving++;
      
      for (const bonus of synergy.bonuses) {
        stats.totalBonusValue += Math.abs(bonus.value);
      }
    }

    return stats;
  });

  // ============================================
  // SAVE/LOAD
  // ============================================

  function getState() {
    return {
      activeSpecialEffects: Array.from(activeSpecialEffects.value),
      totalSynergiesActivated: totalSynergiesActivated.value,
      specialEffectsTriggered: specialEffectsTriggered.value,
    };
  }

  function loadState(state: ReturnType<typeof getState>) {
    if (state.activeSpecialEffects) activeSpecialEffects.value = new Set(state.activeSpecialEffects);
    if (state.totalSynergiesActivated !== undefined) totalSynergiesActivated.value = state.totalSynergiesActivated;
    if (state.specialEffectsTriggered !== undefined) specialEffectsTriggered.value = state.specialEffectsTriggered;
  }

  function resetSynergies() {
    activeSpecialEffects.value = new Set();
    totalSynergiesActivated.value = 0;
    specialEffectsTriggered.value = 0;
  }

  // ============================================
  // PROCESS TICK
  // ============================================

  function processTick() {
    // Update statistics based on active synergies
    const currentActive = totalActiveSynergies.value;
    if (currentActive > totalSynergiesActivated.value) {
      totalSynergiesActivated.value = currentActive;
    }
  }

  return {
    // State
    activeSpecialEffects,
    totalSynergiesActivated,
    specialEffectsTriggered,

    // Computed
    allPathLevels,
    totalLevels,
    activeSynergies,
    totalActiveSynergies,
    bonusesByPath,
    globalBonuses,
    synergyStatistics,

    // Path level getter
    getPathLevel,

    // Path-specific bonus getters
    getWarriorBonuses,
    getMerchantBonuses,
    getGatheringBonuses,
    getCraftingBonuses,
    getChefBonuses,
    getFishermanBonuses,
    getWizardBonuses,
    getExplorerBonuses,
    getBardBonuses,
    getAlchemistBonuses,
    getArchitectBonuses,
    getSpyBonuses,
    getTamerBonuses,
    getPriestBonuses,
    getDiplomatBonuses,
    getDruidBonuses,
    getMysticBonuses,
    getScientistBonuses,

    // Generic getters
    getBonus,
    getPathBonus,

    // Synergy queries
    getSynergiesFrom,
    getSynergiesTo,
    isSynergyActive,
    getSynergyDetails,

    // Special effects
    triggerSpecialEffect,
    isSpecialEffectActive,

    // Lifecycle
    processTick,
    getState,
    loadState,
    resetSynergies,
  };
}, {
  persist: {
    key: 'ateria-synergies',
    serializer: {
      serialize: (state) => JSON.stringify({
        ...state,
        activeSpecialEffects: Array.from(state.activeSpecialEffects || []),
      }),
      deserialize: (value) => {
        const p = JSON.parse(value);
        return {
          ...p,
          activeSpecialEffects: new Set(p.activeSpecialEffects || []),
        };
      },
    },
  },
});
