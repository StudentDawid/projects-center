/**
 * Warrior path store for Ateria Idle
 * Uses Data-Driven Design - data loaded from /data/ files
 */

import { defineStore, storeToRefs } from 'pinia';
import { ref, computed } from 'vue';
import { bn, Decimal } from '@shared/lib/big-number';
import { useAteriaResourcesStore } from '../../core/model/resources.store';
import { useAteriaGameStore } from '../../core/model/game.store';
import { useAteriaAchievementsStore } from '../../core/model/achievements.store';
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
  EnvironmentalEffect,
  ActivePotionEffect,
  DungeonRun,
  Dungeon,
  LootDrop,
} from '@ateria-idle/entities/ateria-idle/warrior';

// Data-Driven imports
import { MONSTERS, getMonster, getMonstersByBiome } from '../../data/monsters.data';
import { BIOMES, getBiome, getUnlockedBiomes, BIOME_ORDER } from '../../data/biomes.data';
import { POTIONS, getPotion } from '../../data/scientist.data';
import { DUNGEONS, getDungeon, getUnlockedDungeons, DUNGEON_KEY_ITEMS } from '../../data/dungeons.data';
import {
  SLAYER_TASK_TEMPLATES,
  SLAYER_SHOP_ITEMS,
  getAvailableTaskTemplates,
  generateSlayerTask,
  getShopItem,
  type SlayerTaskTemplate,
} from '../../data/slayer.data';
import {
  generateMonsterDropTable,
  rollDrops,
  calculateFinalXp,
  HUMANOID_MONSTERS,
  BIOME_LEVEL_RANGES,
  BIOME_TIER,
} from '../../data/drops.data';
import { useAteriaIntegrationStore } from '../../core/model/integration.store';

// Inventory store import (lazy to avoid circular dependency)
const getInventoryStore = () => import('./inventory.store').then(m => m.useAteriaInventoryStore());

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
  const achievementsStore = useAteriaAchievementsStore();

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

  // Equipment bonuses (computed from inventory store)
  // Note: actual equipment is managed by inventory.store.ts

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

  // Dungeon System
  const activeDungeonRun = ref<DungeonRun | null>(null);
  const completedDungeons = ref<Set<string>>(new Set());
  const dungeonKeys = ref<Map<string, number>>(new Map());

  // Slayer Shop & Upgrades
  const purchasedSlayerItems = ref<Set<string>>(new Set());
  const slayerBonuses = ref({
    damageBonus: 0,       // % bonus damage vs slayer targets
    xpBonus: 0,           // % bonus slayer XP
    coinBonus: 0,         // % bonus slayer coins
    maxTaskTier: 2,       // Max tier of tasks available (starts at 2)
    taskSlots: 1,         // Number of concurrent tasks
    bonusCoinChance: 0,   // % chance for bonus coins
  });
  const activeSlayerBoosts = ref<Array<{
    type: 'xp' | 'coin';
    value: number;
    expiresAt: number;
  }>>([]);

  // Loadout System
  const loadouts = ref<Array<{
    id: string;
    name: string;
    icon: string;
    color: string;
    slots: Record<string, string | undefined>;
    potionSlots: Record<string, string | undefined>;
    autoPotionSettings: {
      enabled: boolean;
      healThreshold: number;
      useBuffsOnCombatStart: boolean;
      priorityOrder: string[];
    };
    createdAt: number;
    lastUsed: number;
  }>>([]);
  const activeLoadoutId = ref<string | null>(null);
  const equipment = ref<Record<string, string | undefined>>({});

  // Auto-combat settings
  const autoCombatEnabled = ref(true);
  const selectedMonster = ref<string | null>(null);

  // ============================================
  // ENVIRONMENTAL EFFECTS & POTIONS STATE
  // ============================================

  // Active environmental effect from current biome
  const activeEnvironmentalEffect = ref<EnvironmentalEffect | null>(null);
  const environmentalEffectMitigated = ref(false);
  const environmentalDamageTick = ref(0);

  // Active potion effects (buffs/debuffs)
  const activePotionEffects = ref<ActivePotionEffect[]>([]);

  // Combat potions inventory (allocated from Scientist)
  const combatPotions = ref<Map<string, number>>(new Map());

  // Auto-potion settings
  const autoPotionEnabled = ref(true);
  const autoHealThreshold = ref(0.3); // Use healing potion when HP < 30%
  const autoBuffEnabled = ref(true); // Auto-use buff potions at combat start

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

  // Dungeon computed properties
  const unlockedDungeonsList = computed(() => {
    return getUnlockedDungeons(stats.value.level);
  });

  const isInDungeon = computed(() => {
    return activeDungeonRun.value !== null;
  });

  const currentDungeonData = computed(() => {
    if (!activeDungeonRun.value) return null;
    return getDungeon(activeDungeonRun.value.dungeonId);
  });

  const currentDungeonWave = computed(() => {
    if (!activeDungeonRun.value || !currentDungeonData.value) return null;
    const wave = activeDungeonRun.value.currentWave;
    return currentDungeonData.value.waves[wave] || null;
  });

  const dungeonProgress = computed(() => {
    if (!activeDungeonRun.value || !currentDungeonData.value) return 0;
    const totalWaves = currentDungeonData.value.waves.length + 1; // +1 for boss
    return (activeDungeonRun.value.currentWave / totalWaves) * 100;
  });

  const isDungeonBossWave = computed(() => {
    if (!activeDungeonRun.value || !currentDungeonData.value) return false;
    return activeDungeonRun.value.currentWave >= currentDungeonData.value.waves.length;
  });

  // Slayer computed properties
  const slayerXpProgress = computed(() => {
    if (slayer.value.xpToNextLevel === 0) return 0;
    return (slayer.value.xp / slayer.value.xpToNextLevel) * 100;
  });

  const availableSlayerTasks = computed(() => {
    return getAvailableTaskTemplates(stats.value.level, slayerBonuses.value.maxTaskTier);
  });

  const hasActiveSlayerTask = computed(() => {
    return slayer.value.currentTask !== null;
  });

  const slayerTaskProgress = computed(() => {
    if (!slayer.value.currentTask) return 0;
    return (slayer.value.currentTask.currentCount / slayer.value.currentTask.targetCount) * 100;
  });

  const effectiveSlayerXpBonus = computed(() => {
    let bonus = slayerBonuses.value.xpBonus;
    // Add temporary boosts
    const now = Date.now();
    for (const boost of activeSlayerBoosts.value) {
      if (boost.type === 'xp' && boost.expiresAt > now) {
        bonus += boost.value;
      }
    }
    return bonus;
  });

  const effectiveSlayerCoinBonus = computed(() => {
    let bonus = slayerBonuses.value.coinBonus;
    // Add temporary boosts
    const now = Date.now();
    for (const boost of activeSlayerBoosts.value) {
      if (boost.type === 'coin' && boost.expiresAt > now) {
        bonus += boost.value;
      }
    }
    return bonus;
  });

  // Environmental effect from current biome
  const currentEnvironmentalEffect = computed(() => {
    const biome = getBiome(currentBiome.value);
    return biome?.environmentalEffect || null;
  });

  // Check if environmental effect is mitigated
  const isEnvironmentalEffectMitigated = computed(() => {
    if (!currentEnvironmentalEffect.value) return true;

    // Check if any resistance potion is active
    const hasResistanceActive = activePotionEffects.value.some(
      e => e.effect.type === 'special' && e.remainingTicks > 0
    );
    if (hasResistanceActive) return true;

    const mitigation = currentEnvironmentalEffect.value.mitigation;
    if (!mitigation) return false;

    // Check specific potion mitigation
    if (mitigation.potionId) {
      const hasPotionActive = activePotionEffects.value.some(
        e => e.potionId === mitigation.potionId
      );
      if (hasPotionActive) return true;
    }

    // Check item mitigation (equipped item)
    if (mitigation.itemId) {
      // TODO: Check equipped items from inventory store
      // For now, return false
    }

    // Check research mitigation
    if (mitigation.researchId) {
      // TODO: Check completed research from scientist store
      // For now, return false
    }

    return false;
  });

  // Total buff modifiers from potions
  const potionBuffs = computed(() => {
    const buffs = {
      attack: 0,
      defense: 0,
      accuracy: 0,
      evasion: 0,
      maxHp: 0,
      critChance: 0,
      speed: 0,
      xpBonus: 0,
      goldBonus: 0,
      lootBonus: 0,
    };

    for (const effect of activePotionEffects.value) {
      if (effect.effect.type === 'buff_attack') {
        buffs.attack += effect.effect.value;
      } else if (effect.effect.type === 'buff_defense') {
        buffs.defense += effect.effect.value;
      } else if (effect.effect.type === 'buff_speed') {
        buffs.speed += effect.effect.value;
      } else if (effect.effect.type === 'buff_crit') {
        buffs.critChance += effect.effect.value;
      } else if (effect.effect.type === 'buff_xp') {
        buffs.xpBonus += effect.effect.value;
      } else if (effect.effect.type === 'buff_gold') {
        buffs.goldBonus += effect.effect.value;
      } else if (effect.effect.type === 'buff_loot') {
        buffs.lootBonus += effect.effect.value;
      }
    }

    return buffs;
  });

  // Environmental debuffs
  const environmentalDebuffs = computed(() => {
    const debuffs = {
      attack: 0,
      defense: 0,
      maxHp: 0,
      evasion: 0,
      accuracy: 0,
    };

    if (!currentEnvironmentalEffect.value || isEnvironmentalEffectMitigated.value) {
      return debuffs;
    }

    const effect = currentEnvironmentalEffect.value.effect;
    if (effect.type === 'stat_debuff' && effect.stat) {
      const stat = effect.stat as keyof typeof debuffs;
      if (stat in debuffs) {
        debuffs[stat] = effect.value; // Negative value = debuff
      }
    }

    return debuffs;
  });

  // Equipment bonuses ref (updated by inventory store)
  const equipmentBonuses = ref({
    attack: 0,
    defense: 0,
    accuracy: 0,
    evasion: 0,
    maxHp: 0,
    critChance: 0,
    critMultiplier: 0,
    hpRegen: 0,
  });

  // Function to update equipment bonuses (called by inventory store)
  function updateEquipmentBonuses(bonuses: typeof equipmentBonuses.value) {
    equipmentBonuses.value = bonuses;
  }

  const effectiveStats = computed(() => {
    // Base stats + equipment bonuses
    let attack = stats.value.attack + equipmentBonuses.value.attack;
    let defense = stats.value.defense + equipmentBonuses.value.defense;
    let accuracy = stats.value.accuracy + equipmentBonuses.value.accuracy;
    let evasion = stats.value.evasion + equipmentBonuses.value.evasion;
    let maxHp = stats.value.maxHp + equipmentBonuses.value.maxHp;
    let critChance = stats.value.critChance + equipmentBonuses.value.critChance;
    let critMultiplier = stats.value.critMultiplier + equipmentBonuses.value.critMultiplier;

    // Apply potion buffs (percentage bonuses)
    const buffs = potionBuffs.value;
    attack = Math.floor(attack * (1 + buffs.attack / 100));
    defense = Math.floor(defense * (1 + buffs.defense / 100));
    critChance += buffs.critChance / 100; // Convert to decimal

    // Apply environmental debuffs (percentage penalties)
    const debuffs = environmentalDebuffs.value;
    attack = Math.floor(attack * (1 + debuffs.attack / 100));
    maxHp = Math.floor(maxHp * (1 + debuffs.maxHp / 100));
    evasion = Math.floor(evasion * (1 + debuffs.evasion / 100));

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
      // Include buff info for UI
      attackBuffPercent: buffs.attack,
      defenseBuffPercent: buffs.defense,
      xpBonusPercent: buffs.xpBonus,
      goldBonusPercent: buffs.goldBonus,
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
    let amountDecimal = amount instanceof Decimal ? amount : bn(amount);

    // Apply XP bonus from potions
    const xpBonus = potionBuffs.value.xpBonus;
    if (xpBonus > 0) {
      amountDecimal = amountDecimal.mul(1 + xpBonus / 100);
    }

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
  // ACTIONS - POTIONS
  // ============================================

  function usePotion(potionId: string): boolean {
    const amount = combatPotions.value.get(potionId) || 0;
    if (amount <= 0) return false;

    const potion = getPotion(potionId);
    if (!potion) return false;

    // Consume potion
    combatPotions.value.set(potionId, amount - 1);

    // Apply effects
    for (const effect of potion.effects) {
      if (effect.type === 'heal_hp') {
        // Instant heal
        stats.value.currentHp = Math.min(
          stats.value.currentHp + effect.value,
          effectiveStats.value.maxHp
        );
        gameStore.addNotification({
          type: 'success',
          title: 'Mikstura użyta',
          message: `Przywrócono ${effect.value} HP`,
          icon: potion.icon,
          duration: 2000,
        });
      } else if (effect.type === 'heal_percent') {
        const healAmount = Math.floor(effectiveStats.value.maxHp * effect.value / 100);
        stats.value.currentHp = Math.min(
          stats.value.currentHp + healAmount,
          effectiveStats.value.maxHp
        );
      } else if (effect.type === 'regen_hp' && effect.duration) {
        // Add regeneration effect
        activePotionEffects.value.push({
          potionId,
          effect: {
            type: 'buff',
            stat: 'hpRegen',
            value: effect.value,
          },
          remainingTicks: effect.duration,
          startTick: combatTickCounter.value,
        });
      } else if (effect.type === 'resist_element' && effect.duration) {
        // Add environmental resistance effect
        activePotionEffects.value.push({
          potionId,
          effect: {
            type: 'special',
            value: effect.value,
          },
          remainingTicks: effect.duration,
          startTick: combatTickCounter.value,
        });
        environmentalEffectMitigated.value = true;
        gameStore.addNotification({
          type: 'success',
          title: 'Ochrona aktywowana',
          message: `Chroniony przed efektami środowiskowymi przez ${Math.ceil(effect.duration / 10 / 60)} min.`,
          icon: 'mdi-shield-check',
          duration: 3000,
        });
      } else if (effect.type.startsWith('buff_') && effect.duration) {
        // Add buff effect
        activePotionEffects.value.push({
          potionId,
          effect: {
            type: 'buff',
            value: effect.value,
          },
          remainingTicks: effect.duration,
          startTick: combatTickCounter.value,
        });
        // Store the effect type for potionBuffs computed
        const lastEffect = activePotionEffects.value[activePotionEffects.value.length - 1];
        (lastEffect.effect as any).type = effect.type;

        gameStore.addNotification({
          type: 'info',
          title: 'Buff aktywowany',
          message: potion.name,
          icon: potion.icon,
          duration: 2000,
        });
      }
    }

    return true;
  }

  function addCombatPotion(potionId: string, amount: number) {
    const current = combatPotions.value.get(potionId) || 0;
    combatPotions.value.set(potionId, current + amount);
  }

  function processActivePotionEffects() {
    // Decrease remaining ticks and remove expired effects
    activePotionEffects.value = activePotionEffects.value.filter(effect => {
      effect.remainingTicks--;

      // Apply regeneration effects
      if (effect.effect.stat === 'hpRegen' && effect.remainingTicks > 0) {
        const regenPerTick = effect.effect.value / 10; // Convert per-second to per-tick
        stats.value.currentHp = Math.min(
          stats.value.currentHp + regenPerTick,
          effectiveStats.value.maxHp
        );
      }

      return effect.remainingTicks > 0;
    });
  }

  function checkAutoPotions() {
    if (!autoPotionEnabled.value) return;

    // Auto-heal when HP is low
    if (hpPercent.value <= autoHealThreshold.value * 100) {
      // Try healing potions in order: large -> medium -> small
      const healingPotions = ['health_potion_large', 'health_potion_medium', 'health_potion_small'];
      for (const potionId of healingPotions) {
        if ((combatPotions.value.get(potionId) || 0) > 0) {
          usePotion(potionId);
          break;
        }
      }
    }
  }

  function applyAutoBuffs() {
    if (!autoBuffEnabled.value) return;

    // Apply buff potions at combat start (if available and not already active)
    const buffPotions = ['strength_potion', 'defense_potion', 'speed_potion', 'critical_potion'];

    for (const potionId of buffPotions) {
      // Skip if already have this buff active
      if (activePotionEffects.value.some(e => e.potionId === potionId)) continue;

      // Use if available
      if ((combatPotions.value.get(potionId) || 0) > 0) {
        usePotion(potionId);
      }
    }
  }

  // ============================================
  // ACTIONS - ENVIRONMENTAL EFFECTS
  // ============================================

  function processEnvironmentalEffect() {
    const effect = currentEnvironmentalEffect.value;
    if (!effect || isEnvironmentalEffectMitigated.value) return;

    if (effect.effect.type === 'damage_over_time') {
      environmentalDamageTick.value++;
      const interval = effect.effect.tickInterval || 10;

      if (environmentalDamageTick.value >= interval) {
        environmentalDamageTick.value = 0;

        // Apply environmental damage
        const damage = effect.effect.value;
        stats.value.currentHp -= damage;

        // Check if player died from environmental damage
        if (stats.value.currentHp <= 0) {
          onPlayerDeath();
        }
      }
    } else if (effect.effect.type === 'resource_drain') {
      // Drain resources (e.g., essence in Abyss)
      environmentalDamageTick.value++;
      if (environmentalDamageTick.value >= 10) { // Every second
        environmentalDamageTick.value = 0;
        resourcesStore.removeResource('essence', effect.effect.value);
      }
    }
    // stat_debuff is handled in effectiveStats computed
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
    environmentalDamageTick.value = 0;

    // Apply auto-buffs at combat start
    applyAutoBuffs();

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

    // Process environmental effects (DoT, resource drain)
    processEnvironmentalEffect();

    // Process active potion effects (regeneration, buff timers)
    processActivePotionEffects();

    // Auto-heal check (potions first, then food)
    if (hpPercent.value <= autoHealThreshold.value * 100) {
      checkAutoPotions();
    }

    // Auto-eat check (if potions didn't help) - use integration store
    const integrationStore = useAteriaIntegrationStore();
    if (integrationStore.autoEatSettings.enabled &&
        hpPercent.value <= integrationStore.autoEatSettings.threshold) {
      const healAmount = integrationStore.processAutoEat(stats.value.currentHp, stats.value.maxHp);
      if (healAmount > 0) {
        stats.value.currentHp = Math.min(stats.value.currentHp + healAmount, stats.value.maxHp);
      }
    }

    // Player attack (every 10 ticks = 1 second, modified by speed buff)
    const speedBonus = potionBuffs.value.speed;
    const attackInterval = Math.max(5, Math.floor(10 / (1 + speedBonus / 100)));
    playerAttackCooldown.value++;
    if (playerAttackCooldown.value >= attackInterval) {
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

    // Handle dungeon combat separately
    if (isInDungeon.value) {
      onDungeonMonsterDefeated();
      return;
    }

    const enemy = currentEnemy.value;
    const biome = enemy.biome;

    // Generate enhanced drop table with food/equipment/next biome drops
    const dropTable = generateMonsterDropTable(
      enemy.id,
      biome,
      enemy.level,
      enemy.lootTable,
    );

    // Grant XP with scaling (stronger monsters give up to 2x XP)
    const scaledXp = calculateFinalXp(enemy.xpReward, enemy.level, biome);
    addXp(scaledXp);

    // Grant gold (with potion bonus)
    let goldAmount = Math.floor(Math.random() * (enemy.goldReward.max - enemy.goldReward.min + 1)) + enemy.goldReward.min;
    const goldBonus = potionBuffs.value.goldBonus;
    if (goldBonus > 0) {
      goldAmount = Math.floor(goldAmount * (1 + goldBonus / 100));
    }
    resourcesStore.addResource('gold', goldAmount);
    sessionGoldGained.value = sessionGoldGained.value.add(goldAmount);

    // Track gold for achievements
    achievementsStore.recordGoldEarned(goldAmount);

    // Process all drop tables with luck bonus
    const lootBonus = potionBuffs.value.lootBonus || 0;
    const allDrops: { itemId: string; amount: number }[] = [];

    // Material drops (original loot table)
    const materialDrops = rollDrops(dropTable.materialDrops, lootBonus);
    allDrops.push(...materialDrops);

    // Food drops
    const foodDrops = rollDrops(dropTable.foodDrops, lootBonus);
    allDrops.push(...foodDrops);

    // Equipment drops (only for humanoid monsters)
    if (dropTable.equipmentDrops.length > 0) {
      const equipDrops = rollDrops(dropTable.equipmentDrops, lootBonus);
      allDrops.push(...equipDrops);
    }

    // Next biome drops (for strong monsters)
    if (dropTable.nextBiomeDrops.length > 0) {
      const nextBiomeDropItems = rollDrops(dropTable.nextBiomeDrops, lootBonus);
      allDrops.push(...nextBiomeDropItems);
    }

    // Add items to inventory
    if (allDrops.length > 0) {
      const integrationStore = useAteriaIntegrationStore();

      getInventoryStore().then((inventoryStore) => {
        for (const drop of allDrops) {
          // Check if food drop - add to integration store instead
          const isFoodDrop = foodDrops.some(f => f.itemId === drop.itemId);
          const isEquipmentDrop = dropTable.equipmentDrops.some(d => d.itemId === drop.itemId);

          if (isFoodDrop) {
            // Food goes to integration store for auto-eat system
            integrationStore.addFood(drop.itemId, drop.amount);
          } else {
            // Materials and equipment go to regular inventory
            const dropRarity = isEquipmentDrop
              ? dropTable.equipmentDrops.find(d => d.itemId === drop.itemId)?.rarity
              : undefined;

            inventoryStore.addItem(drop.itemId, drop.amount, 'material', undefined, undefined, dropRarity);
          }

          // Notification for rare drops (equipment or next biome items)
          const isRareDrop = isEquipmentDrop ||
                            dropTable.nextBiomeDrops.some(d => d.itemId === drop.itemId);
          if (isRareDrop) {
            gameStore.addNotification({
              type: 'success',
              title: 'Rzadki drop!',
              message: `Zdobyto: ${drop.amount}x ${drop.itemId}`,
              icon: 'mdi-treasure-chest',
              duration: 3000,
            });
          }
        }
      });
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

    // Track kill for achievements
    achievementsStore.recordKill(enemy.id, enemy.slayerCategory);

    sessionKills.value++;

    // Continue combat if auto-combat enabled
    currentEnemy.value = null;
    combatState.value = 'idle';

    if (autoCombatEnabled.value) {
      startCombat(selectedMonster.value || undefined);
    }
  }

  function onPlayerDeath() {
    // Handle dungeon death separately
    if (isInDungeon.value) {
      onDungeonDeath();
      return;
    }

    combatState.value = 'dead';
    currentEnemy.value = null;

    // Track death for achievements
    achievementsStore.recordDeath();

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

    // Calculate rewards with bonuses
    let coins = task.reward.slayerCoins;
    let xp = task.reward.xp;

    // Apply bonuses
    coins = Math.floor(coins * (1 + effectiveSlayerCoinBonus.value / 100));
    xp = Math.floor(xp * (1 + effectiveSlayerXpBonus.value / 100));

    // Bonus coin chance
    if (Math.random() * 100 < slayerBonuses.value.bonusCoinChance) {
      const bonusCoins = Math.floor(coins * 0.5); // 50% bonus
      coins += bonusCoins;
      gameStore.addNotification({
        type: 'info',
        title: 'Bonus Łowcy!',
        message: `Dodatkowe ${bonusCoins} Monet!`,
        icon: 'mdi-star',
        duration: 2000,
      });
    }

    // Grant rewards
    slayer.value.totalCoins += coins;
    resourcesStore.addResource('slayerCoins', coins);
    slayer.value.xp += xp;

    // Check for slayer level up
    while (slayer.value.xp >= slayer.value.xpToNextLevel) {
      slayer.value.xp -= slayer.value.xpToNextLevel;
      slayer.value.level++;
      slayer.value.xpToNextLevel = Math.floor(100 * Math.pow(1.2, slayer.value.level));

      gameStore.addNotification({
        type: 'success',
        title: 'Awans Łowcy!',
        message: `Osiągnąłeś poziom ${slayer.value.level} Łowcy!`,
        icon: 'mdi-arrow-up-bold',
      });
    }

    slayer.value.completedTasks++;
    slayer.value.currentTask = null;

    // Track slayer task for achievements
    achievementsStore.recordSlayerTaskCompleted();

    gameStore.addNotification({
      type: 'success',
      title: 'Zadanie Łowcy ukończone!',
      message: `Otrzymano ${coins} Monet Łowcy i ${xp} XP`,
      icon: 'mdi-check-circle',
    });
  }

  function acceptSlayerTask(template: SlayerTaskTemplate): boolean {
    if (slayer.value.currentTask) {
      gameStore.addNotification({
        type: 'warning',
        title: 'Masz już zadanie',
        message: 'Ukończ lub anuluj aktualne zadanie',
        icon: 'mdi-alert',
      });
      return false;
    }

    // Check level requirement
    if (stats.value.level < template.requiredLevel) {
      gameStore.addNotification({
        type: 'warning',
        title: 'Poziom zbyt niski',
        message: `Wymagany poziom ${template.requiredLevel}`,
        icon: 'mdi-lock',
      });
      return false;
    }

    // Check tier unlock
    if (template.tier > slayerBonuses.value.maxTaskTier) {
      gameStore.addNotification({
        type: 'warning',
        title: 'Tier zablokowany',
        message: 'Kup ulepszenie w Giełdzie Łowców',
        icon: 'mdi-lock',
      });
      return false;
    }

    // Generate task from template
    const task = generateSlayerTask(template, slayer.value.level);
    slayer.value.currentTask = task;

    gameStore.addNotification({
      type: 'info',
      title: 'Nowe zadanie!',
      message: `${template.name}: Zabij ${task.targetCount} potworów`,
      icon: 'mdi-sword',
    });

    return true;
  }

  function cancelSlayerTask(): boolean {
    if (!slayer.value.currentTask) return false;

    // Penalty: lose some slayer XP (min 0)
    const penalty = Math.floor(slayer.value.xpToNextLevel * 0.1);
    slayer.value.xp = Math.max(0, slayer.value.xp - penalty);

    slayer.value.currentTask = null;

    gameStore.addNotification({
      type: 'warning',
      title: 'Zadanie anulowane',
      message: `Stracono ${penalty} XP Łowcy`,
      icon: 'mdi-close-circle',
    });

    return true;
  }

  function purchaseSlayerItem(itemId: string): boolean {
    const item = getShopItem(itemId);
    if (!item) return false;

    // Check if already purchased (one-time items)
    if (item.oneTimePurchase && purchasedSlayerItems.value.has(itemId)) {
      gameStore.addNotification({
        type: 'warning',
        title: 'Już posiadasz',
        message: 'Ten przedmiot można kupić tylko raz',
        icon: 'mdi-alert',
      });
      return false;
    }

    // Check level requirement
    if (slayer.value.level < item.requiredLevel) {
      gameStore.addNotification({
        type: 'warning',
        title: 'Poziom Łowcy zbyt niski',
        message: `Wymagany poziom ${item.requiredLevel}`,
        icon: 'mdi-lock',
      });
      return false;
    }

    // Check if can afford
    if (!resourcesStore.hasAmount('slayerCoins', item.cost)) {
      gameStore.addNotification({
        type: 'warning',
        title: 'Brak Monet Łowcy',
        message: `Potrzebujesz ${item.cost} Monet`,
        icon: 'mdi-cash-remove',
      });
      return false;
    }

    // Purchase
    resourcesStore.removeResource('slayerCoins', item.cost);

    // Apply effect
    if (item.effect) {
      switch (item.effect.type) {
        case 'stat_bonus':
          if (item.effect.stat === 'slayerDamage') {
            slayerBonuses.value.damageBonus += item.effect.value;
          }
          break;
        case 'xp_bonus':
          if (item.effect.duration) {
            // Temporary boost
            activeSlayerBoosts.value.push({
              type: 'xp',
              value: item.effect.value,
              expiresAt: Date.now() + item.effect.duration * 100, // ticks to ms
            });
          } else {
            // Permanent
            slayerBonuses.value.xpBonus += item.effect.value;
          }
          break;
        case 'coin_bonus':
          if (item.effect.duration) {
            activeSlayerBoosts.value.push({
              type: 'coin',
              value: item.effect.value,
              expiresAt: Date.now() + item.effect.duration * 100,
            });
          } else {
            slayerBonuses.value.coinBonus += item.effect.value;
          }
          break;
        case 'unlock':
          if (item.id === 'elite_tasks') {
            slayerBonuses.value.maxTaskTier = Math.max(slayerBonuses.value.maxTaskTier, 3);
          } else if (item.id === 'legendary_tasks') {
            slayerBonuses.value.maxTaskTier = 5;
          } else if (item.id === 'task_slot_2') {
            slayerBonuses.value.taskSlots = 2;
          } else if (item.id === 'extended_tasks') {
            // Extended tasks already handled by template scaling
          }
          break;
        case 'permanent_buff':
          if (item.effect.stat === 'bonusCoinChance') {
            slayerBonuses.value.bonusCoinChance += item.effect.value;
          }
          break;
      }
    }

    // Handle special items (dungeon keys)
    if (itemId.includes('_key_pack')) {
      const keyMapping: Record<string, string> = {
        'goblin_key_pack': 'goblin_key',
        'swamp_key_pack': 'swamp_key',
        'infernal_key_pack': 'infernal_key',
        'frost_key_pack': 'frost_key',
        'void_key_pack': 'void_key',
      };
      const keyId = keyMapping[itemId];
      if (keyId) {
        addDungeonKey(keyId, 3);
      }
    }

    // Handle instant task progress
    if (itemId === 'instant_task_progress' && slayer.value.currentTask) {
      slayer.value.currentTask.currentCount = Math.min(
        slayer.value.currentTask.currentCount + 5,
        slayer.value.currentTask.targetCount
      );
      if (slayer.value.currentTask.currentCount >= slayer.value.currentTask.targetCount) {
        completeSlayerTask();
      }
    }

    // Handle contract reroll
    if (itemId === 'slayer_contract_reroll') {
      slayer.value.currentTask = null; // No penalty
    }

    // Mark as purchased for one-time items
    if (item.oneTimePurchase) {
      purchasedSlayerItems.value.add(itemId);
    }

    gameStore.addNotification({
      type: 'success',
      title: 'Zakupiono!',
      message: item.name,
      icon: item.icon,
    });

    return true;
  }

  function cleanupExpiredBoosts() {
    const now = Date.now();
    activeSlayerBoosts.value = activeSlayerBoosts.value.filter(
      boost => boost.expiresAt > now
    );
  }

  // ============================================
  // ACTIONS - DUNGEON SYSTEM
  // ============================================

  function hasDungeonKey(dungeonId: string): boolean {
    const dungeon = getDungeon(dungeonId);
    if (!dungeon) return false;
    const keyCount = dungeonKeys.value.get(dungeon.keyItemId) || 0;
    return keyCount >= dungeon.keyCost;
  }

  function addDungeonKey(keyItemId: string, amount: number = 1) {
    const current = dungeonKeys.value.get(keyItemId) || 0;
    dungeonKeys.value.set(keyItemId, current + amount);
  }

  function startDungeon(dungeonId: string): boolean {
    const dungeon = getDungeon(dungeonId);
    if (!dungeon) return false;

    // Check level requirement
    if (stats.value.level < dungeon.requiredLevel) {
      gameStore.addNotification({
        type: 'warning',
        title: 'Poziom zbyt niski',
        message: `Wymagany poziom ${dungeon.requiredLevel} aby wejść do ${dungeon.name}`,
        icon: 'mdi-lock',
      });
      return false;
    }

    // Check if already in dungeon
    if (activeDungeonRun.value) {
      gameStore.addNotification({
        type: 'warning',
        title: 'Już w lochu',
        message: 'Musisz najpierw ukończyć lub opuścić aktualny loch',
        icon: 'mdi-alert',
      });
      return false;
    }

    // Check for key
    if (!hasDungeonKey(dungeonId)) {
      gameStore.addNotification({
        type: 'warning',
        title: 'Brak klucza',
        message: `Potrzebujesz klucza do ${dungeon.name}`,
        icon: 'mdi-key',
      });
      return false;
    }

    // Consume key
    const keyCount = dungeonKeys.value.get(dungeon.keyItemId) || 0;
    dungeonKeys.value.set(dungeon.keyItemId, keyCount - dungeon.keyCost);

    // Stop regular combat
    if (combatState.value === 'fighting') {
      stopCombat();
    }

    // Initialize dungeon run
    activeDungeonRun.value = {
      dungeonId,
      currentWave: 0,
      monstersKilledInWave: 0,
      totalMonstersKilled: 0,
      startTime: Date.now(),
      loot: [],
      deaths: 0,
    };

    // Start first wave
    spawnDungeonMonster();

    combatState.value = 'fighting';

    gameStore.addNotification({
      type: 'info',
      title: 'Wchodzisz do lochu',
      message: dungeon.name,
      icon: dungeon.icon,
    });

    return true;
  }

  function spawnDungeonMonster() {
    if (!activeDungeonRun.value || !currentDungeonData.value) return;

    const dungeon = currentDungeonData.value;
    const waveIndex = activeDungeonRun.value.currentWave;

    // Check if boss wave
    if (waveIndex >= dungeon.waves.length) {
      // Spawn boss
      currentEnemy.value = { ...dungeon.boss };
      currentEnemy.value.currentHp = currentEnemy.value.maxHp;
      return;
    }

    // Spawn regular monster from wave
    const wave = dungeon.waves[waveIndex];
    const randomMonsterIndex = Math.floor(Math.random() * wave.monsters.length);
    const monsterId = wave.monsters[randomMonsterIndex];
    const monsterData = getMonster(monsterId);

    if (monsterData) {
      currentEnemy.value = { ...monsterData };
      currentEnemy.value.currentHp = currentEnemy.value.maxHp;

      // Scale monster stats based on dungeon tier
      const tierBonus = 1 + (dungeon.tier - 1) * 0.15;
      currentEnemy.value.maxHp = Math.floor(currentEnemy.value.maxHp * tierBonus);
      currentEnemy.value.currentHp = currentEnemy.value.maxHp;
      currentEnemy.value.attack = Math.floor(currentEnemy.value.attack * tierBonus);
      currentEnemy.value.defense = Math.floor(currentEnemy.value.defense * tierBonus);
    }
  }

  function onDungeonMonsterDefeated() {
    if (!activeDungeonRun.value || !currentDungeonData.value || !currentEnemy.value) return;

    const dungeon = currentDungeonData.value;
    const enemy = currentEnemy.value;
    const biome = enemy.biome;

    // Generate enhanced drop table
    const dropTable = generateMonsterDropTable(
      enemy.id,
      biome,
      enemy.level,
      enemy.lootTable,
    );

    // Grant XP with scaling (stronger monsters and dungeon bonus)
    const scaledXp = calculateFinalXp(enemy.xpReward, enemy.level, biome);
    const dungeonXpBonus = 1 + dungeon.tier * 0.1; // +10% XP per dungeon tier
    addXp(Math.floor(scaledXp * dungeonXpBonus));

    // Add to session stats
    sessionKills.value++;
    activeDungeonRun.value.totalMonstersKilled++;

    // Collect all loot types
    const lootBonus = potionBuffs.value.lootBonus || 0;
    const dungeonLootBonus = dungeon.tier * 5; // +5% loot chance per tier
    const totalLootBonus = lootBonus + dungeonLootBonus;

    // Material drops
    for (const drop of rollDrops(dropTable.materialDrops, totalLootBonus)) {
      activeDungeonRun.value.loot.push({
        itemId: drop.itemId,
        amount: drop.amount,
        rarity: 'common',
      });
    }

    // Food drops
    for (const drop of rollDrops(dropTable.foodDrops, totalLootBonus)) {
      activeDungeonRun.value.loot.push({
        itemId: drop.itemId,
        amount: drop.amount,
        rarity: 'common',
      });
    }

    // Equipment drops (humanoids)
    for (const drop of rollDrops(dropTable.equipmentDrops, totalLootBonus)) {
      const eqDrop = dropTable.equipmentDrops.find(d => d.itemId === drop.itemId);
      activeDungeonRun.value.loot.push({
        itemId: drop.itemId,
        amount: drop.amount,
        rarity: eqDrop?.rarity || 'uncommon',
      });
    }

    // Next biome drops
    for (const drop of rollDrops(dropTable.nextBiomeDrops, totalLootBonus)) {
      activeDungeonRun.value.loot.push({
        itemId: drop.itemId,
        amount: drop.amount,
        rarity: 'rare',
      });
    }

    // Check if boss was killed
    if (isDungeonBossWave.value) {
      completeDungeon();
      return;
    }

    // Progress wave
    activeDungeonRun.value.monstersKilledInWave++;
    const currentWave = dungeon.waves[activeDungeonRun.value.currentWave];

    if (activeDungeonRun.value.monstersKilledInWave >= currentWave.count) {
      // Move to next wave
      activeDungeonRun.value.currentWave++;
      activeDungeonRun.value.monstersKilledInWave = 0;

      const isLastWave = activeDungeonRun.value.currentWave >= dungeon.waves.length;

      gameStore.addNotification({
        type: 'info',
        title: isLastWave ? 'Boss!' : `Fala ${activeDungeonRun.value.currentWave + 1}`,
        message: isLastWave ? `${dungeon.boss.name} się pojawia!` : `Następna fala potworów`,
        icon: isLastWave ? 'mdi-skull' : 'mdi-sword-cross',
        duration: 3000,
      });
    }

    // Spawn next monster
    currentEnemy.value = null;
    setTimeout(() => {
      if (activeDungeonRun.value && combatState.value === 'fighting') {
        spawnDungeonMonster();
      }
    }, 500);
  }

  function completeDungeon() {
    if (!activeDungeonRun.value || !currentDungeonData.value) return;

    const dungeon = currentDungeonData.value;
    const run = activeDungeonRun.value;
    const isFirstClear = !completedDungeons.value.has(dungeon.id);

    // Process completion rewards
    for (const reward of dungeon.completionRewards) {
      if (Math.random() < reward.chance) {
        if (reward.itemId === 'gold') {
          resourcesStore.addResource('gold', reward.amount || reward.minAmount);
          sessionGoldGained.value = sessionGoldGained.value.add(reward.amount || reward.minAmount);
        } else {
          run.loot.push({
            itemId: reward.itemId,
            amount: reward.amount || reward.minAmount,
          });
        }
      }
    }

    // First clear bonus
    if (isFirstClear && dungeon.firstClearBonus) {
      for (const reward of dungeon.firstClearBonus) {
        if (reward.itemId === 'gold') {
          resourcesStore.addResource('gold', reward.amount || reward.minAmount);
        } else {
          run.loot.push({
            itemId: reward.itemId,
            amount: reward.amount || reward.minAmount,
          });
        }
      }
      completedDungeons.value.add(dungeon.id);
    }

    // Track dungeon completion for achievements
    achievementsStore.recordDungeonCompleted(dungeon.id);

    // Calculate time taken
    const timeTaken = Math.floor((Date.now() - run.startTime) / 1000);

    gameStore.addNotification({
      type: 'success',
      title: 'Loch ukończony!',
      message: `${dungeon.name} - ${run.totalMonstersKilled} zabitych w ${timeTaken}s`,
      icon: 'mdi-trophy',
      duration: 5000,
    });

    // Reset dungeon state
    activeDungeonRun.value = null;
    currentEnemy.value = null;
    combatState.value = 'idle';

    // Auto-start regular combat if enabled
    if (autoCombatEnabled.value) {
      startCombat();
    }
  }

  function abandonDungeon() {
    if (!activeDungeonRun.value || !currentDungeonData.value) return;

    const dungeon = currentDungeonData.value;

    // Lose 50% of collected loot
    const lostLoot = activeDungeonRun.value.loot.splice(
      0,
      Math.floor(activeDungeonRun.value.loot.length / 2)
    );

    gameStore.addNotification({
      type: 'warning',
      title: 'Loch opuszczony',
      message: `Ucieczka z ${dungeon.name}. Stracono część łupów.`,
      icon: 'mdi-run',
    });

    // Reset dungeon state
    activeDungeonRun.value = null;
    currentEnemy.value = null;
    combatState.value = 'idle';
  }

  function onDungeonDeath() {
    if (!activeDungeonRun.value || !currentDungeonData.value) return;

    const dungeon = currentDungeonData.value;
    activeDungeonRun.value.deaths++;

    // Apply death penalty (same as regular death but scaled by tier)
    const lostGold = sessionGoldGained.value.mul(0.5);
    resourcesStore.removeResource('gold', lostGold);

    // Recovery time scaled by dungeon tier
    const recoveryTime = RECOVERY_BASE_TIME * dungeon.tier * 1000;
    recovery.value = {
      isRecovering: true,
      recoveryStartTime: Date.now(),
      recoveryEndTime: Date.now() + recoveryTime,
      deathLocation: currentBiome.value,
    };

    // Lose dungeon progress
    activeDungeonRun.value = null;
    currentEnemy.value = null;
    combatState.value = 'recovering';

    gameStore.addNotification({
      type: 'error',
      title: 'Poległeś w lochu!',
      message: `Rekonwalescencja: ${RECOVERY_BASE_TIME * dungeon.tier}s`,
      icon: 'mdi-skull',
      duration: 5000,
    });
  }

  // ============================================
  // ACTIONS - LOADOUTS
  // ============================================

  function addLoadout(loadout: typeof loadouts.value[0]) {
    loadouts.value.push(loadout);
    gameStore.addNotification({
      type: 'success',
      title: 'Nowy Zestaw',
      message: `Utworzono zestaw "${loadout.name}"`,
      icon: 'mdi-bag-personal',
    });
  }

  function removeLoadout(loadoutId: string) {
    const index = loadouts.value.findIndex(l => l.id === loadoutId);
    if (index === -1) return false;

    loadouts.value.splice(index, 1);
    if (activeLoadoutId.value === loadoutId) {
      activeLoadoutId.value = null;
    }
    return true;
  }

  function updateLoadout(loadout: typeof loadouts.value[0]) {
    const index = loadouts.value.findIndex(l => l.id === loadout.id);
    if (index === -1) return false;

    loadouts.value[index] = loadout;
    return true;
  }

  function activateLoadout(loadoutId: string) {
    const loadout = loadouts.value.find(l => l.id === loadoutId);
    if (!loadout) return false;

    // Copy loadout equipment to current equipment
    equipment.value = { ...loadout.slots };
    activeLoadoutId.value = loadoutId;
    loadout.lastUsed = Date.now();

    // Apply auto-potion settings
    autoPotionEnabled.value = loadout.autoPotionSettings.enabled;
    autoHealThreshold.value = loadout.autoPotionSettings.healThreshold;
    autoBuffEnabled.value = loadout.autoPotionSettings.useBuffsOnCombatStart;

    gameStore.addNotification({
      type: 'info',
      title: 'Zestaw Aktywowany',
      message: loadout.name,
      icon: loadout.icon || 'mdi-bag-personal',
      duration: 2000,
    });

    return true;
  }

  // ============================================
  // ACTIONS - GAME LOOP
  // ============================================

  function processTick() {
    checkRecovery();
    cleanupExpiredBoosts();

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

    // Load potions state
    if (state.combatPotions) {
      combatPotions.value = state.combatPotions instanceof Map
        ? state.combatPotions
        : new Map(state.combatPotions);
    }
    if (state.autoPotionEnabled !== undefined) autoPotionEnabled.value = state.autoPotionEnabled;
    if (state.autoHealThreshold !== undefined) autoHealThreshold.value = state.autoHealThreshold;
    if (state.autoBuffEnabled !== undefined) autoBuffEnabled.value = state.autoBuffEnabled;
    if (state.activePotionEffects) activePotionEffects.value = state.activePotionEffects;

    // Load dungeon state
    if (state.completedDungeons) {
      completedDungeons.value = state.completedDungeons instanceof Set
        ? state.completedDungeons
        : new Set(state.completedDungeons);
    }
    if (state.dungeonKeys) {
      dungeonKeys.value = state.dungeonKeys instanceof Map
        ? state.dungeonKeys
        : new Map(state.dungeonKeys);
    }

    // Load slayer state
    if (state.purchasedSlayerItems) {
      purchasedSlayerItems.value = state.purchasedSlayerItems instanceof Set
        ? state.purchasedSlayerItems
        : new Set(state.purchasedSlayerItems);
    }
    if (state.slayerBonuses) {
      slayerBonuses.value = { ...slayerBonuses.value, ...state.slayerBonuses };
    }
    if (state.activeSlayerBoosts) {
      activeSlayerBoosts.value = state.activeSlayerBoosts;
    }
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
    activePotionEffects.value = [];
    combatPotions.value = new Map();
    environmentalDamageTick.value = 0;
    // Reset dungeons
    activeDungeonRun.value = null;
    completedDungeons.value = new Set();
    dungeonKeys.value = new Map();
    // Reset slayer
    purchasedSlayerItems.value = new Set();
    slayerBonuses.value = {
      damageBonus: 0,
      xpBonus: 0,
      coinBonus: 0,
      maxTaskTier: 2,
      taskSlots: 1,
      bonusCoinChance: 0,
    };
    activeSlayerBoosts.value = [];
  }

  return {
    // State
    stats,
    combatState,
    currentBiome,
    currentEnemy,
    equipmentBonuses,
    loadouts,
    activeLoadoutId,
    equipment,
    foodInventory,
    recovery,
    slayer,
    autoCombatEnabled,
    selectedMonster,
    sessionKills,
    sessionXpGained,
    sessionGoldGained,

    // Environmental & Potions State
    activeEnvironmentalEffect,
    activePotionEffects,
    combatPotions,
    autoPotionEnabled,
    autoHealThreshold,
    autoBuffEnabled,

    // Dungeon State
    activeDungeonRun,
    completedDungeons,
    dungeonKeys,

    // Slayer State
    purchasedSlayerItems,
    slayerBonuses,
    activeSlayerBoosts,

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
    currentEnvironmentalEffect,
    isEnvironmentalEffectMitigated,
    potionBuffs,
    environmentalDebuffs,

    // Dungeon Computed
    unlockedDungeonsList,
    isInDungeon,
    currentDungeonData,
    currentDungeonWave,
    dungeonProgress,
    isDungeonBossWave,

    // Slayer Computed
    slayerXpProgress,
    availableSlayerTasks,
    hasActiveSlayerTask,
    slayerTaskProgress,
    effectiveSlayerXpBonus,
    effectiveSlayerCoinBonus,

    // Actions
    addXp,
    startCombat,
    stopCombat,
    changeBiome,
    processTick,
    consumeFood,
    updateEquipmentBonuses,
    usePotion,
    addCombatPotion,

    // Dungeon Actions
    hasDungeonKey,
    addDungeonKey,
    startDungeon,
    abandonDungeon,

    // Slayer Actions
    acceptSlayerTask,
    cancelSlayerTask,
    purchaseSlayerItem,

    // Loadouts
    addLoadout,
    removeLoadout,
    updateLoadout,
    activateLoadout,

    getState,
    loadState,
    resetWarrior,
  };
}, {
  persist: {
    key: 'ateria-warrior',
    storage: typeof window !== 'undefined' ? localStorage : undefined,
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
          // Potions state
          combatPotions: state.combatPotions instanceof Map
            ? Array.from(state.combatPotions.entries())
            : [],
          autoPotionEnabled: state.autoPotionEnabled,
          autoHealThreshold: state.autoHealThreshold,
          autoBuffEnabled: state.autoBuffEnabled,
          activePotionEffects: state.activePotionEffects || [],
          // Dungeon state
          completedDungeons: state.completedDungeons instanceof Set
            ? Array.from(state.completedDungeons)
            : [],
          dungeonKeys: state.dungeonKeys instanceof Map
            ? Array.from(state.dungeonKeys.entries())
            : [],
          // Slayer state
          purchasedSlayerItems: state.purchasedSlayerItems instanceof Set
            ? Array.from(state.purchasedSlayerItems)
            : [],
          slayerBonuses: state.slayerBonuses,
          activeSlayerBoosts: state.activeSlayerBoosts || [],
        });
      },
      deserialize: (value) => {
        const parsed = JSON.parse(value);

        // Convert Decimal fields back from strings
        if (parsed.stats) {
          parsed.stats.xp = bn(parsed.stats.xp || 0);
          parsed.stats.xpToNextLevel = bn(parsed.stats.xpToNextLevel || BASE_XP_PER_LEVEL);
        }

        // Convert combatPotions array back to Map
        if (parsed.combatPotions && Array.isArray(parsed.combatPotions)) {
          parsed.combatPotions = new Map(parsed.combatPotions);
        } else {
          parsed.combatPotions = new Map();
        }

        // Convert dungeon data
        if (parsed.completedDungeons && Array.isArray(parsed.completedDungeons)) {
          parsed.completedDungeons = new Set(parsed.completedDungeons);
        } else {
          parsed.completedDungeons = new Set();
        }

        if (parsed.dungeonKeys && Array.isArray(parsed.dungeonKeys)) {
          parsed.dungeonKeys = new Map(parsed.dungeonKeys);
        } else {
          parsed.dungeonKeys = new Map();
        }

        // Slayer state
        if (parsed.purchasedSlayerItems && Array.isArray(parsed.purchasedSlayerItems)) {
          parsed.purchasedSlayerItems = new Set(parsed.purchasedSlayerItems);
        } else {
          parsed.purchasedSlayerItems = new Set();
        }

        return parsed;
      },
    },
  },
});
