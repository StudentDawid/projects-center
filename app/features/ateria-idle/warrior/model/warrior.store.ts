/**
 * Warrior path store for Ateria Idle
 * Uses Data-Driven Design - data loaded from /data/ files
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { bn, Decimal } from '~/shared/lib/big-number';
import { useAteriaResourcesStore } from '../../core/model/resources.store';
import { useAteriaGameStore } from '../../core/model/game.store';
import type {
  WarriorStats,
  CombatState,
  Monster,
  BiomeId,
  Equipment,
  EquipmentSlot,
  FoodInventory,
  RecoveryState,
  SlayerProgress,
} from '~/entities/ateria-idle/warrior';

// Data-Driven imports
import { MONSTERS, getMonster, getMonstersByBiome } from '../../data/monsters.data';
import { BIOMES, getBiome, getUnlockedBiomes, BIOME_ORDER } from '../../data/biomes.data';

// ============================================
// CONSTANTS
// ============================================

const BASE_XP_PER_LEVEL = 100;
const XP_SCALING = 1.15;
const SOFT_CAP_LEVEL = 50;

const BASE_STATS: WarriorStats = {
  level: 1,
  xp: bn(0),
  xpToNextLevel: bn(BASE_XP_PER_LEVEL),
  maxHp: 100,
  currentHp: 100,
  attack: 10,
  defense: 5,
  accuracy: 50,
  evasion: 10,
  critChance: 0.05,
  critMultiplier: 1.5,
  dps: 0,
  damageReduction: 0,
  hpRegen: 0.1, // 0.1 HP per second out of combat
  vitalityBonus: 0,
};

const RECOVERY_BASE_TIME = 60; // seconds

// ============================================
// STORE
// ============================================

export const useAteriaWarriorStore = defineStore('ateria-warrior', () => {
  const resourcesStore = useAteriaResourcesStore();
  const gameStore = useAteriaGameStore();

  // ============================================
  // STATE
  // ============================================

  // Stats
  const stats = ref<WarriorStats>({ ...BASE_STATS });

  // Combat
  const combatState = ref<CombatState>('idle');
  const currentBiome = ref<BiomeId>('forest');
  const currentEnemy = ref<Monster | null>(null);
  const combatTickCounter = ref(0);
  const playerAttackCooldown = ref(0);
  const enemyAttackCooldown = ref(0);

  // Combat stats for current session
  const sessionKills = ref(0);
  const sessionXpGained = ref(bn(0));
  const sessionGoldGained = ref(bn(0));

  // Equipment
  const equipment = ref<Record<EquipmentSlot, Equipment | null>>({
    weapon: null,
    armor: null,
    helmet: null,
    boots: null,
    accessory: null,
  });

  // Food
  const foodInventory = ref<FoodInventory>({
    equipped: null,
    autoEatEnabled: true,
    autoEatThreshold: 0.3,
    stock: {},
  });

  // Recovery
  const recovery = ref<RecoveryState>({
    isRecovering: false,
    recoveryStartTime: 0,
    recoveryEndTime: 0,
    deathLocation: 'forest',
  });

  // Slayer
  const slayer = ref<SlayerProgress>({
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    totalCoins: 0,
    currentTask: null,
    completedTasks: 0,
    categoryKills: {
      undead: 0,
      beast: 0,
      demon: 0,
      elemental: 0,
      dragon: 0,
      aberration: 0,
    },
  });

  // Auto-combat settings
  const autoCombatEnabled = ref(true);
  const selectedMonster = ref<string | null>(null);

  // ============================================
  // COMPUTED
  // ============================================

  const xpProgress = computed(() => {
    if (stats.value.xpToNextLevel.eq(0)) return 0;
    return stats.value.xp.div(stats.value.xpToNextLevel).toNumber();
  });

  const hpPercent = computed(() => {
    return (stats.value.currentHp / stats.value.maxHp) * 100;
  });

  const enemyHpPercent = computed(() => {
    if (!currentEnemy.value) return 0;
    return (currentEnemy.value.currentHp / currentEnemy.value.maxHp) * 100;
  });

  const isInCombat = computed(() => combatState.value === 'fighting');
  const isRecovering = computed(() => combatState.value === 'recovering');
  const isDead = computed(() => combatState.value === 'dead');

  const recoveryTimeRemaining = computed(() => {
    if (!recovery.value.isRecovering) return 0;
    const remaining = recovery.value.recoveryEndTime - Date.now();
    return Math.max(0, Math.ceil(remaining / 1000));
  });

  const availableMonsters = computed(() => {
    const biome = getBiome(currentBiome.value);
    if (!biome) return [];

    return biome.monsterIds
      .map(id => getMonster(id))
      .filter((m): m is Monster => m !== undefined && m.level <= stats.value.level + 5);
  });

  const unlockedBiomes = computed(() => {
    return getUnlockedBiomes(stats.value.level);
  });

  const currentBiomeData = computed(() => {
    return getBiome(currentBiome.value);
  });

  const effectiveStats = computed(() => {
    // Calculate stats with equipment bonuses
    let attack = stats.value.attack;
    let defense = stats.value.defense;
    let accuracy = stats.value.accuracy;
    let evasion = stats.value.evasion;
    let maxHp = stats.value.maxHp;
    let critChance = stats.value.critChance;
    let critMultiplier = stats.value.critMultiplier;

    // Add equipment bonuses
    for (const eq of Object.values(equipment.value)) {
      if (eq?.stats) {
        attack += eq.stats.attack || 0;
        defense += eq.stats.defense || 0;
        accuracy += eq.stats.accuracy || 0;
        evasion += eq.stats.evasion || 0;
        maxHp += eq.stats.maxHp || 0;
        critChance += eq.stats.critChance || 0;
        critMultiplier += eq.stats.critMultiplier || 0;
      }
    }

    // Calculate damage reduction (soft cap at 80%, hard cap at 95%)
    const rawDR = defense / (defense + 100);
    const softCapDR = 0.8;
    const hardCapDR = 0.95;
    let damageReduction = rawDR;
    if (rawDR > softCapDR) {
      damageReduction = softCapDR + (rawDR - softCapDR) * 0.5;
    }
    damageReduction = Math.min(damageReduction, hardCapDR);

    // Soft cap crit chance at 50%, hard cap at 75%
    if (critChance > 0.5) {
      critChance = 0.5 + (critChance - 0.5) * 0.25;
    }
    critChance = Math.min(critChance, 0.75);

    return {
      attack,
      defense,
      accuracy,
      evasion,
      maxHp,
      critChance,
      critMultiplier,
      damageReduction,
    };
  });

  // ============================================
  // ACTIONS - XP & LEVELING
  // ============================================

  function calculateXpToLevel(level: number): Decimal {
    // Soft cap formula from docs
    let effectiveLevel = level;
    if (level > SOFT_CAP_LEVEL) {
      effectiveLevel = SOFT_CAP_LEVEL + Math.sqrt(level - SOFT_CAP_LEVEL);
    }
    return bn(BASE_XP_PER_LEVEL).mul(Decimal.pow(XP_SCALING, effectiveLevel));
  }

  function addXp(amount: Decimal | number) {
    const amountDecimal = amount instanceof Decimal ? amount : bn(amount);
    stats.value.xp = stats.value.xp.add(amountDecimal);
    sessionXpGained.value = sessionXpGained.value.add(amountDecimal);

    // Check for level up
    while (stats.value.xp.gte(stats.value.xpToNextLevel)) {
      levelUp();
    }
  }

  function levelUp() {
    stats.value.xp = stats.value.xp.sub(stats.value.xpToNextLevel);
    stats.value.level++;
    stats.value.xpToNextLevel = calculateXpToLevel(stats.value.level);

    // Increase base stats
    stats.value.maxHp += 10;
    stats.value.attack += 2;
    stats.value.defense += 1;
    stats.value.accuracy += 1;

    // Heal to full on level up
    stats.value.currentHp = stats.value.maxHp;

    gameStore.addNotification({
      type: 'success',
      title: 'Awans!',
      message: `Wojownik osiągnął poziom ${stats.value.level}!`,
      icon: 'mdi-arrow-up-bold',
    });

    // Check for feature unlocks
    if (stats.value.level >= 5 && !gameStore.isFeatureUnlocked('scientist')) {
      gameStore.unlockFeature('scientist');
    }
    if (stats.value.level >= 10 && !gameStore.isFeatureUnlocked('merchant')) {
      gameStore.unlockFeature('merchant');
    }
  }

  // ============================================
  // ACTIONS - COMBAT
  // ============================================

  function startCombat(monsterId?: string) {
    if (combatState.value !== 'idle') return;
    if (recovery.value.isRecovering) return;

    const targetId = monsterId || selectedMonster.value || availableMonsters.value[0]?.id;
    if (!targetId) return;

    const monsterData = getMonster(targetId);
    if (!monsterData) return;

    // Clone monster for combat instance
    currentEnemy.value = { ...monsterData };
    currentEnemy.value.currentHp = currentEnemy.value.maxHp;

    combatState.value = 'fighting';
    combatTickCounter.value = 0;
    playerAttackCooldown.value = 0;
    enemyAttackCooldown.value = 0;

    if (!monsterId) {
      selectedMonster.value = targetId;
    }
  }

  function changeBiome(biomeId: BiomeId) {
    const biome = getBiome(biomeId);
    if (!biome) return;

    // Check if player meets level requirement
    if (stats.value.level < biome.requiredLevel) {
      gameStore.addNotification({
        type: 'warning',
        title: 'Zablokowane',
        message: `Wymagany poziom ${biome.requiredLevel} aby wejść do ${biome.name}`,
        icon: 'mdi-lock',
      });
      return;
    }

    // Stop combat if fighting
    if (combatState.value === 'fighting') {
      stopCombat();
    }

    currentBiome.value = biomeId;
    selectedMonster.value = null;

    gameStore.addNotification({
      type: 'info',
      title: 'Zmiana lokacji',
      message: `Przeniesiono do: ${biome.name}`,
      icon: biome.icon,
    });
  }

  function stopCombat() {
    combatState.value = 'idle';
    currentEnemy.value = null;
    combatTickCounter.value = 0;
  }

  function processCombatTick() {
    if (combatState.value !== 'fighting' || !currentEnemy.value) return;

    combatTickCounter.value++;

    // Auto-eat check
    if (foodInventory.value.autoEatEnabled && hpPercent.value <= foodInventory.value.autoEatThreshold * 100) {
      consumeFood();
    }

    // Player attack (every 10 ticks = 1 second)
    playerAttackCooldown.value++;
    if (playerAttackCooldown.value >= 10) {
      playerAttackCooldown.value = 0;
      performPlayerAttack();
    }

    // Enemy attack
    enemyAttackCooldown.value++;
    if (enemyAttackCooldown.value >= currentEnemy.value.attackSpeed) {
      enemyAttackCooldown.value = 0;
      performEnemyAttack();
    }
  }

  function performPlayerAttack() {
    if (!currentEnemy.value) return;

    // Hit chance calculation
    const hitChance = effectiveStats.value.accuracy / (effectiveStats.value.accuracy + currentEnemy.value.evasion * 1.25);
    const roll = Math.random();

    if (roll > hitChance) {
      // Miss
      return;
    }

    // Calculate damage
    let damage = effectiveStats.value.attack;

    // Critical hit
    const isCrit = Math.random() < effectiveStats.value.critChance;
    if (isCrit) {
      damage *= effectiveStats.value.critMultiplier;
    }

    // Enemy defense
    const enemyDR = currentEnemy.value.defense / (currentEnemy.value.defense + 100);
    damage *= (1 - enemyDR);
    damage = Math.max(1, Math.floor(damage));

    // Apply damage
    currentEnemy.value.currentHp -= damage;

    // Check if enemy died
    if (currentEnemy.value.currentHp <= 0) {
      onEnemyDefeated();
    }
  }

  function performEnemyAttack() {
    if (!currentEnemy.value) return;

    // Hit chance
    const hitChance = currentEnemy.value.accuracy / (currentEnemy.value.accuracy + effectiveStats.value.evasion * 1.25);
    const roll = Math.random();

    if (roll > hitChance) {
      // Dodged
      return;
    }

    // Calculate damage
    let damage = currentEnemy.value.attack;
    damage *= (1 - effectiveStats.value.damageReduction);
    damage = Math.max(1, Math.floor(damage));

    // Apply damage
    stats.value.currentHp -= damage;

    // Check if player died
    if (stats.value.currentHp <= 0) {
      onPlayerDeath();
    }
  }

  function onEnemyDefeated() {
    if (!currentEnemy.value) return;

    const enemy = currentEnemy.value;

    // Grant XP
    addXp(enemy.xpReward);

    // Grant gold
    const goldAmount = Math.floor(Math.random() * (enemy.goldReward.max - enemy.goldReward.min + 1)) + enemy.goldReward.min;
    resourcesStore.addResource('gold', goldAmount);
    sessionGoldGained.value = sessionGoldGained.value.add(goldAmount);

    // Process loot table
    for (const loot of enemy.lootTable) {
      if (Math.random() < loot.chance) {
        const amount = Math.floor(Math.random() * (loot.maxAmount - loot.minAmount + 1)) + loot.minAmount;
        // TODO: Add to inventory
        console.log(`Loot: ${amount}x ${loot.itemId}`);
      }
    }

    // Slayer progress
    if (enemy.slayerCategory) {
      slayer.value.categoryKills[enemy.slayerCategory]++;
      if (slayer.value.currentTask && enemy.slayerCategory === slayer.value.currentTask.category) {
        slayer.value.currentTask.currentCount++;
        if (slayer.value.currentTask.currentCount >= slayer.value.currentTask.targetCount) {
          completeSlayerTask();
        }
      }
    }

    sessionKills.value++;

    // Continue combat if auto-combat enabled
    currentEnemy.value = null;
    combatState.value = 'idle';

    if (autoCombatEnabled.value) {
      startCombat(selectedMonster.value || undefined);
    }
  }

  function onPlayerDeath() {
    combatState.value = 'dead';
    currentEnemy.value = null;

    // Apply death penalty
    const lostGold = sessionGoldGained.value.mul(0.5); // Lose 50% of session gold
    resourcesStore.removeResource('gold', lostGold);

    // Start recovery
    const recoveryTime = RECOVERY_BASE_TIME * 1000; // Convert to ms
    recovery.value = {
      isRecovering: true,
      recoveryStartTime: Date.now(),
      recoveryEndTime: Date.now() + recoveryTime,
      deathLocation: currentBiome.value,
    };

    gameStore.addNotification({
      type: 'warning',
      title: 'Wojownik poległ!',
      message: `Odwrót... Rekonwalescencja potrwa ${RECOVERY_BASE_TIME} sekund.`,
      icon: 'mdi-skull',
      duration: 10000,
    });

    combatState.value = 'recovering';
  }

  function checkRecovery() {
    if (recovery.value.isRecovering && Date.now() >= recovery.value.recoveryEndTime) {
      recovery.value.isRecovering = false;
      stats.value.currentHp = Math.floor(stats.value.maxHp * 0.5); // Recover to 50% HP
      combatState.value = 'idle';

      gameStore.addNotification({
        type: 'success',
        title: 'Rekonwalescencja zakończona',
        message: 'Wojownik jest gotowy do walki.',
        icon: 'mdi-heart-pulse',
      });

      if (autoCombatEnabled.value) {
        startCombat();
      }
    }
  }

  // ============================================
  // ACTIONS - FOOD & HEALING
  // ============================================

  function consumeFood(): boolean {
    // TODO: Implement proper food consumption
    // For now, simple heal if food available
    if (resourcesStore.hasAmount('food', 1)) {
      resourcesStore.removeResource('food', 1);
      const healAmount = Math.floor(stats.value.maxHp * 0.2); // Heal 20% max HP
      stats.value.currentHp = Math.min(stats.value.currentHp + healAmount, stats.value.maxHp);
      return true;
    }
    return false;
  }

  function processPassiveRegen() {
    // Only regen out of combat
    if (combatState.value !== 'idle') return;
    if (stats.value.currentHp >= stats.value.maxHp) return;

    const regenAmount = stats.value.hpRegen * (1 + stats.value.vitalityBonus);
    stats.value.currentHp = Math.min(stats.value.currentHp + regenAmount, stats.value.maxHp);
  }

  // ============================================
  // ACTIONS - SLAYER
  // ============================================

  function completeSlayerTask() {
    if (!slayer.value.currentTask) return;

    const task = slayer.value.currentTask;

    // Grant rewards
    slayer.value.totalCoins += task.reward.slayerCoins;
    resourcesStore.addResource('slayerCoins', task.reward.slayerCoins);
    slayer.value.xp += task.reward.xp;

    // Check for slayer level up
    while (slayer.value.xp >= slayer.value.xpToNextLevel) {
      slayer.value.xp -= slayer.value.xpToNextLevel;
      slayer.value.level++;
      slayer.value.xpToNextLevel = Math.floor(100 * Math.pow(1.2, slayer.value.level));
    }

    slayer.value.completedTasks++;
    slayer.value.currentTask = null;

    gameStore.addNotification({
      type: 'success',
      title: 'Zadanie Łowcy ukończone!',
      message: `Otrzymano ${task.reward.slayerCoins} Monet Łowcy`,
      icon: 'mdi-check-circle',
    });
  }

  // ============================================
  // ACTIONS - GAME LOOP
  // ============================================

  function processTick() {
    checkRecovery();

    if (combatState.value === 'fighting') {
      processCombatTick();
    } else if (combatState.value === 'idle') {
      processPassiveRegen();
    }
  }

  // ============================================
  // ACTIONS - SAVE/LOAD
  // ============================================

  function getState() {
    return {
      stats: {
        ...stats.value,
        xp: stats.value.xp.toString(),
        xpToNextLevel: stats.value.xpToNextLevel.toString(),
      },
      currentBiome: currentBiome.value,
      selectedMonster: selectedMonster.value,
      autoCombatEnabled: autoCombatEnabled.value,
      slayer: slayer.value,
      sessionKills: sessionKills.value,
    };
  }

  function loadState(state: any) {
    if (state.stats) {
      stats.value = {
        ...state.stats,
        xp: bn(state.stats.xp || 0),
        xpToNextLevel: bn(state.stats.xpToNextLevel || BASE_XP_PER_LEVEL),
      };
    }
    if (state.currentBiome) currentBiome.value = state.currentBiome;
    if (state.selectedMonster) selectedMonster.value = state.selectedMonster;
    if (state.autoCombatEnabled !== undefined) autoCombatEnabled.value = state.autoCombatEnabled;
    if (state.slayer) slayer.value = state.slayer;
    if (state.sessionKills) sessionKills.value = state.sessionKills;
  }

  function resetWarrior() {
    stats.value = { ...BASE_STATS };
    combatState.value = 'idle';
    currentEnemy.value = null;
    currentBiome.value = 'forest';
    selectedMonster.value = null;
    sessionKills.value = 0;
    sessionXpGained.value = bn(0);
    sessionGoldGained.value = bn(0);
    recovery.value = {
      isRecovering: false,
      recoveryStartTime: 0,
      recoveryEndTime: 0,
      deathLocation: 'forest',
    };
  }

  return {
    // State
    stats,
    combatState,
    currentBiome,
    currentEnemy,
    equipment,
    foodInventory,
    recovery,
    slayer,
    autoCombatEnabled,
    selectedMonster,
    sessionKills,
    sessionXpGained,
    sessionGoldGained,

    // Computed
    xpProgress,
    hpPercent,
    enemyHpPercent,
    isInCombat,
    isRecovering,
    isDead,
    recoveryTimeRemaining,
    availableMonsters,
    unlockedBiomes,
    currentBiomeData,
    effectiveStats,

    // Actions
    addXp,
    startCombat,
    stopCombat,
    changeBiome,
    processTick,
    consumeFood,
    getState,
    loadState,
    resetWarrior,
  };
}, {
  persist: {
    key: 'ateria-warrior',
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    pick: ['currentBiome', 'selectedMonster', 'autoCombatEnabled', 'sessionKills'],
    serializer: {
      serialize: (state) => {
        return JSON.stringify({
          stats: {
            ...state.stats,
            xp: state.stats?.xp?.toString() || '0',
            xpToNextLevel: state.stats?.xpToNextLevel?.toString() || '100',
          },
          currentBiome: state.currentBiome,
          selectedMonster: state.selectedMonster,
          autoCombatEnabled: state.autoCombatEnabled,
          slayer: state.slayer,
          sessionKills: state.sessionKills,
        });
      },
      deserialize: (value) => {
        return JSON.parse(value);
      },
    },
  },
});
