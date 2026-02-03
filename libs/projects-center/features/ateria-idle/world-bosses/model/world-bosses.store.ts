/**
 * World Bosses Store - Boss Fights, Spawns, Rewards
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAteriaGameStore } from '../../core/model/game.store';
import { useAteriaResourcesStore } from '../../core/model/resources.store';
import { useAteriaWarriorStore } from '../../warrior/model/warrior.store';
import {
  WORLD_BOSSES, LEGENDARY_ITEMS, getWorldBoss, getLegendaryItem, getAvailableBosses,
  type WorldBoss, type LegendaryReward, type BossPhase
} from '../data/world-bosses.data';

export interface BossFightState {
  bossId: string;
  currentHp: number;
  maxHp: number;
  currentPhase: number;
  playerDamageDealt: number;
  playerDamageTaken: number;
  startTime: number;
  ticksElapsed: number;
  abilityCooldowns: Map<string, number>;
  isEnraged: boolean;
}

export interface BossKillRecord {
  bossId: string;
  killedAt: number;
  damageDealt: number;
  timeToKill: number;
  rewardsReceived: string[];
}

export interface BossSpawnState {
  bossId: string;
  isAvailable: boolean;
  nextSpawnTime: number;
  lastKillTime?: number;
}

export const useAteriaWorldBossesStore = defineStore('ateria-world-bosses', () => {
  const gameStore = useAteriaGameStore();
  const resourcesStore = useAteriaResourcesStore();
  const warriorStore = useAteriaWarriorStore();

  // Boss spawn states
  const bossSpawnStates = ref<Map<string, BossSpawnState>>(new Map());
  
  // Current fight
  const activeFight = ref<BossFightState | null>(null);
  const isFighting = computed(() => activeFight.value !== null);
  
  // History and stats
  const killHistory = ref<BossKillRecord[]>([]);
  const totalBossKills = ref(0);
  const legendaryItemsObtained = ref<Set<string>>(new Set());
  const bossKillCounts = ref<Map<string, number>>(new Map());
  
  // Inventory of boss-specific materials
  const bossInventory = ref<Map<string, number>>(new Map());

  // Computed
  const currentBoss = computed(() => {
    if (!activeFight.value) return null;
    return getWorldBoss(activeFight.value.bossId);
  });

  const currentPhase = computed((): BossPhase | null => {
    if (!activeFight.value || !currentBoss.value) return null;
    return currentBoss.value.phases[activeFight.value.currentPhase] || null;
  });

  const fightProgress = computed(() => {
    if (!activeFight.value) return 0;
    return ((activeFight.value.maxHp - activeFight.value.currentHp) / activeFight.value.maxHp) * 100;
  });

  const availableBosses = computed(() => {
    const playerLevel = warriorStore.stats.level;
    return getAvailableBosses(playerLevel, totalBossKills.value);
  });

  const activeBosses = computed(() => {
    const now = Date.now();
    const active: (WorldBoss & { spawnState: BossSpawnState })[] = [];
    
    for (const boss of Object.values(WORLD_BOSSES)) {
      const state = bossSpawnStates.value.get(boss.id);
      if (state && state.isAvailable && state.nextSpawnTime <= now) {
        active.push({ ...boss, spawnState: state });
      }
    }
    
    return active;
  });

  // Initialize spawn states
  function initializeSpawnStates() {
    const now = Date.now();
    
    for (const boss of Object.values(WORLD_BOSSES)) {
      if (!bossSpawnStates.value.has(boss.id)) {
        let nextSpawn = now;
        
        // Calculate next spawn based on type
        if (boss.spawnType === 'daily') {
          // Available now (daily)
          nextSpawn = now;
        } else if (boss.spawnType === 'weekly' && boss.spawnDayOfWeek !== undefined) {
          const today = new Date();
          const daysUntilSpawn = (boss.spawnDayOfWeek - today.getDay() + 7) % 7;
          nextSpawn = now + daysUntilSpawn * 24 * 60 * 60 * 1000;
        } else if (boss.spawnType === 'biweekly' && boss.spawnInterval) {
          nextSpawn = now + Math.random() * boss.spawnInterval * 60 * 60 * 1000;
        } else if (boss.spawnType === 'monthly') {
          nextSpawn = now + 7 * 24 * 60 * 60 * 1000; // First available in a week
        }
        
        bossSpawnStates.value.set(boss.id, {
          bossId: boss.id,
          isAvailable: true,
          nextSpawnTime: nextSpawn,
        });
      }
    }
  }

  function canFightBoss(bossId: string): { canFight: boolean; reason?: string } {
    const boss = getWorldBoss(bossId);
    if (!boss) return { canFight: false, reason: 'Nieznany boss' };
    if (isFighting.value) return { canFight: false, reason: 'Już walczysz z bossem' };
    
    const playerLevel = warriorStore.stats.level;
    if (playerLevel < boss.requiredLevel) return { canFight: false, reason: `Wymaga poziomu ${boss.requiredLevel}` };
    
    if (boss.requiredKills && totalBossKills.value < boss.requiredKills) {
      return { canFight: false, reason: `Pokonaj ${boss.requiredKills} innych bossów` };
    }
    
    const spawnState = bossSpawnStates.value.get(bossId);
    if (!spawnState || !spawnState.isAvailable) return { canFight: false, reason: 'Boss niedostępny' };
    if (spawnState.nextSpawnTime > Date.now()) {
      const minutes = Math.ceil((spawnState.nextSpawnTime - Date.now()) / 60000);
      return { canFight: false, reason: `Dostępny za ${minutes} min` };
    }
    
    return { canFight: true };
  }

  function startBossFight(bossId: string): boolean {
    const check = canFightBoss(bossId);
    if (!check.canFight) {
      gameStore.addNotification({ type: 'warning', title: 'Nie można walczyć', message: check.reason || '', icon: 'mdi-alert' });
      return false;
    }
    
    const boss = getWorldBoss(bossId)!;
    
    activeFight.value = {
      bossId,
      currentHp: boss.baseHp,
      maxHp: boss.baseHp,
      currentPhase: 0,
      playerDamageDealt: 0,
      playerDamageTaken: 0,
      startTime: Date.now(),
      ticksElapsed: 0,
      abilityCooldowns: new Map(),
      isEnraged: false,
    };
    
    gameStore.addNotification({
      type: 'info',
      title: `Walka z ${boss.name}!`,
      message: boss.title,
      icon: boss.icon,
      duration: 3000,
    });
    
    return true;
  }

  function processPlayerAttack(): number {
    if (!activeFight.value || !currentBoss.value) return 0;
    
    const playerStats = warriorStore.effectiveStats;
    const boss = currentBoss.value;
    const phase = currentPhase.value;
    
    // Calculate damage
    let baseDamage = playerStats.attack * (1 + Math.random() * 0.3);
    const defense = boss.defense * (phase?.damageMultiplier || 1);
    const damage = Math.max(1, Math.floor(baseDamage - defense * 0.5));
    
    // Critical hit
    const critChance = playerStats.critChance || 5;
    const critDamage = playerStats.critDamage || 150;
    const isCrit = Math.random() * 100 < critChance;
    const finalDamage = isCrit ? Math.floor(damage * (critDamage / 100)) : damage;
    
    activeFight.value.currentHp = Math.max(0, activeFight.value.currentHp - finalDamage);
    activeFight.value.playerDamageDealt += finalDamage;
    
    // Check phase transition
    checkPhaseTransition();
    
    return finalDamage;
  }

  function processBossAttack(): { ability: string; damage: number } | null {
    if (!activeFight.value || !currentBoss.value) return null;
    
    const boss = currentBoss.value;
    const phase = currentPhase.value;
    
    // Select ability
    const availableAbilities = boss.abilities.filter(ability => {
      // Check if unlocked in current phase
      const unlockedInPhase = activeFight.value!.currentPhase === 0 || 
        boss.phases.slice(0, activeFight.value!.currentPhase + 1).some(p => 
          p.newAbilities?.includes(ability.id) || activeFight.value!.currentPhase === 0
        );
      
      // Check cooldown
      const cooldown = activeFight.value!.abilityCooldowns.get(ability.id) || 0;
      return unlockedInPhase && cooldown <= 0;
    });
    
    if (availableAbilities.length === 0) return null;
    
    const ability = availableAbilities[Math.floor(Math.random() * availableAbilities.length)];
    
    // Set cooldown
    activeFight.value.abilityCooldowns.set(ability.id, ability.cooldown * 10); // ticks
    
    // Calculate damage
    const baseDamage = ability.damage || boss.attack * 0.5;
    const damageMultiplier = phase?.damageMultiplier || 1;
    const damage = Math.floor(baseDamage * damageMultiplier * (0.9 + Math.random() * 0.2));
    
    activeFight.value.playerDamageTaken += damage;
    
    return { ability: ability.name, damage };
  }

  function checkPhaseTransition() {
    if (!activeFight.value || !currentBoss.value) return;
    
    const hpPercent = (activeFight.value.currentHp / activeFight.value.maxHp) * 100;
    const phases = currentBoss.value.phases;
    
    for (let i = phases.length - 1; i >= 0; i--) {
      if (hpPercent <= phases[i].hpThreshold && activeFight.value.currentPhase < i) {
        activeFight.value.currentPhase = i;
        
        gameStore.addNotification({
          type: 'warning',
          title: phases[i].name,
          message: phases[i].description,
          icon: 'mdi-alert-circle',
          duration: 3000,
        });
        break;
      }
    }
  }

  function completeBossFight(victory: boolean) {
    if (!activeFight.value || !currentBoss.value) return;
    
    const boss = currentBoss.value;
    const fight = activeFight.value;
    
    if (victory) {
      // Grant rewards
      const rewards: string[] = [];
      
      // Gold
      const goldReward = Math.floor(boss.baseGold * (1 + Math.random() * 0.5));
      resourcesStore.addResource('gold', goldReward);
      rewards.push(`${goldReward} złota`);
      
      // XP
      warriorStore.addXp(boss.baseXp);
      rewards.push(`${boss.baseXp} XP`);
      
      // Legacy Points
      if (boss.legacyPoints > 0) {
        rewards.push(`${boss.legacyPoints} LP`);
      }
      
      // Guaranteed rewards
      for (const reward of boss.guaranteedRewards) {
        const current = bossInventory.value.get(reward.itemId) || 0;
        bossInventory.value.set(reward.itemId, current + reward.amount);
        rewards.push(`${reward.amount}x ${reward.itemId}`);
      }
      
      // Legendary drops
      for (const legendaryReward of boss.legendaryRewards) {
        if (Math.random() < legendaryReward.dropChance) {
          legendaryItemsObtained.value.add(legendaryReward.id);
          rewards.push(`🌟 ${legendaryReward.name}!`);
          
          gameStore.addNotification({
            type: 'success',
            title: 'Legendarny drop!',
            message: legendaryReward.name,
            icon: legendaryReward.icon,
            duration: 5000,
          });
        }
      }
      
      // Record kill
      const killRecord: BossKillRecord = {
        bossId: boss.id,
        killedAt: Date.now(),
        damageDealt: fight.playerDamageDealt,
        timeToKill: fight.ticksElapsed / 10,
        rewardsReceived: rewards,
      };
      killHistory.value.unshift(killRecord);
      if (killHistory.value.length > 50) killHistory.value.pop();
      
      // Update stats
      totalBossKills.value++;
      const bossKills = bossKillCounts.value.get(boss.id) || 0;
      bossKillCounts.value.set(boss.id, bossKills + 1);
      
      // Set respawn
      const spawnState = bossSpawnStates.value.get(boss.id);
      if (spawnState) {
        spawnState.lastKillTime = Date.now();
        
        if (boss.spawnType === 'daily') {
          spawnState.nextSpawnTime = Date.now() + 24 * 60 * 60 * 1000;
        } else if (boss.spawnType === 'weekly') {
          spawnState.nextSpawnTime = Date.now() + 7 * 24 * 60 * 60 * 1000;
        } else if (boss.spawnType === 'biweekly' && boss.spawnInterval) {
          spawnState.nextSpawnTime = Date.now() + boss.spawnInterval * 60 * 60 * 1000;
        } else if (boss.spawnType === 'monthly') {
          spawnState.nextSpawnTime = Date.now() + 30 * 24 * 60 * 60 * 1000;
        }
      }
      
      gameStore.addNotification({
        type: 'success',
        title: `${boss.name} pokonany!`,
        message: `Nagrody: ${rewards.slice(0, 3).join(', ')}${rewards.length > 3 ? '...' : ''}`,
        icon: 'mdi-trophy',
        duration: 5000,
      });
    } else {
      gameStore.addNotification({
        type: 'error',
        title: 'Porażka!',
        message: `${boss.name} pokonał cię...`,
        icon: 'mdi-skull',
        duration: 4000,
      });
    }
    
    activeFight.value = null;
  }

  function fleeFight() {
    if (!activeFight.value) return;
    
    gameStore.addNotification({
      type: 'info',
      title: 'Ucieczka',
      message: 'Uciekłeś z walki z bossem.',
      icon: 'mdi-run',
      duration: 2000,
    });
    
    activeFight.value = null;
  }

  function processTick() {
    if (!activeFight.value || !currentBoss.value) {
      // Check for spawns
      initializeSpawnStates();
      return;
    }
    
    const fight = activeFight.value;
    const boss = currentBoss.value;
    
    fight.ticksElapsed++;
    
    // Check time limit
    if (fight.ticksElapsed >= boss.fightDuration * 10) {
      completeBossFight(false);
      return;
    }
    
    // Reduce ability cooldowns
    for (const [abilityId, cooldown] of fight.abilityCooldowns) {
      if (cooldown > 0) {
        fight.abilityCooldowns.set(abilityId, cooldown - 1);
      }
    }
    
    // Player attack every 5 ticks (0.5s)
    if (fight.ticksElapsed % 5 === 0) {
      processPlayerAttack();
    }
    
    // Boss attack every 10-20 ticks depending on speed
    const bossAttackInterval = Math.max(5, Math.floor(200 / boss.speed));
    if (fight.ticksElapsed % bossAttackInterval === 0) {
      processBossAttack();
    }
    
    // Check victory
    if (fight.currentHp <= 0) {
      completeBossFight(true);
    }
  }

  function hasLegendaryItem(itemId: string): boolean {
    return legendaryItemsObtained.value.has(itemId);
  }

  function getBossKillCount(bossId: string): number {
    return bossKillCounts.value.get(bossId) || 0;
  }

  function getTimeUntilSpawn(bossId: string): number {
    const state = bossSpawnStates.value.get(bossId);
    if (!state) return 0;
    return Math.max(0, state.nextSpawnTime - Date.now());
  }

  function getState() {
    return {
      bossSpawnStates: Array.from(bossSpawnStates.value.entries()),
      killHistory: killHistory.value,
      totalBossKills: totalBossKills.value,
      legendaryItemsObtained: Array.from(legendaryItemsObtained.value),
      bossKillCounts: Array.from(bossKillCounts.value.entries()),
      bossInventory: Array.from(bossInventory.value.entries()),
    };
  }

  function loadState(state: ReturnType<typeof getState>) {
    if (state.bossSpawnStates) bossSpawnStates.value = new Map(state.bossSpawnStates);
    if (state.killHistory) killHistory.value = state.killHistory;
    if (state.totalBossKills !== undefined) totalBossKills.value = state.totalBossKills;
    if (state.legendaryItemsObtained) legendaryItemsObtained.value = new Set(state.legendaryItemsObtained);
    if (state.bossKillCounts) bossKillCounts.value = new Map(state.bossKillCounts);
    if (state.bossInventory) bossInventory.value = new Map(state.bossInventory);
    initializeSpawnStates();
  }

  function resetWorldBosses() {
    bossSpawnStates.value = new Map();
    activeFight.value = null;
    killHistory.value = [];
    totalBossKills.value = 0;
    legendaryItemsObtained.value = new Set();
    bossKillCounts.value = new Map();
    bossInventory.value = new Map();
    initializeSpawnStates();
  }

  function devKillBoss(bossId: string) {
    if (activeFight.value && activeFight.value.bossId === bossId) {
      activeFight.value.currentHp = 0;
    }
  }

  function devSpawnAll() {
    const now = Date.now();
    for (const boss of Object.values(WORLD_BOSSES)) {
      bossSpawnStates.value.set(boss.id, {
        bossId: boss.id,
        isAvailable: true,
        nextSpawnTime: now,
      });
    }
  }

  function devGiveLegendary(itemId: string) {
    legendaryItemsObtained.value.add(itemId);
  }

  // Initialize on store creation
  initializeSpawnStates();

  return {
    bossSpawnStates, activeFight, killHistory, totalBossKills,
    legendaryItemsObtained, bossKillCounts, bossInventory,
    isFighting, currentBoss, currentPhase, fightProgress,
    availableBosses, activeBosses,
    canFightBoss, startBossFight, fleeFight, processTick,
    hasLegendaryItem, getBossKillCount, getTimeUntilSpawn,
    getState, loadState, resetWorldBosses,
    devKillBoss, devSpawnAll, devGiveLegendary,
  };
}, {
  persist: {
    key: 'ateria-world-bosses',
    serializer: {
      serialize: (state) => JSON.stringify({
        ...state,
        bossSpawnStates: Array.from(state.bossSpawnStates?.entries?.() || []),
        legendaryItemsObtained: Array.from(state.legendaryItemsObtained || []),
        bossKillCounts: Array.from(state.bossKillCounts?.entries?.() || []),
        bossInventory: Array.from(state.bossInventory?.entries?.() || []),
        activeFight: null, // Don't persist active fights
      }),
      deserialize: (value) => {
        const p = JSON.parse(value);
        return {
          ...p,
          bossSpawnStates: new Map(p.bossSpawnStates || []),
          legendaryItemsObtained: new Set(p.legendaryItemsObtained || []),
          bossKillCounts: new Map(p.bossKillCounts || []),
          bossInventory: new Map(p.bossInventory || []),
          activeFight: null,
        };
      },
    },
  },
});
