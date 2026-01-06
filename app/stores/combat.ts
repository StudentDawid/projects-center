/**
 * Combat Store
 * Handles threat level, enemy waves, morale, and attrition mechanics
 *
 * Core mechanic: "Narrative Attrition" - resources don't grow in a vacuum.
 * The player must constantly "feed" the war machine.
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { bn, formatNumber } from '~/shared/lib/big-number';
import { useResourceStore } from './resources';
import { useEntityStore } from './entities';
import { useNarrativeStore } from './narrative';
import { useEventStore } from './events';
import { useRelicStore } from './relics';
import { usePrestigeStore } from './prestige';
import Decimal from 'break_infinity.js';
import type {
  EnemyType,
  EnemyTypeId,
  LiturgyId,
  BossEncounter,
  BossChoice,
  CombatCombo,
  ActiveWave,
  RelicRarity,
} from '~/shared/types/game.types';

// ============================================
// Types
// ============================================

export interface WaveEvent {
  id: string;
  name: string;
  description: string;
  threatRequired: number;
  baseDamage: number; // Base morale damage
  baseUnitLosses: number; // Base percentage of units that die (0-100)
  duration: number; // How long the attack lasts in seconds
}

// ============================================
// Enemy Definitions
// ============================================

const ENEMY_TYPES: Record<EnemyTypeId, EnemyType> = {
  cultist: {
    id: 'cultist',
    name: 'Kultyści Mięsa',
    description: 'Podstawowi wyznawcy chaosu. Liczni, ale słabi.',
    icon: '👹',
    tier: 'basic',
    damageMultiplier: 1,
    unitLossMultiplier: 1,
    durationMultiplier: 1,
    weakness: 'blessing',
    weaknessBonus: 0.3,
    spawnCondition: { type: 'every_n_waves', value: 1 },
  },
  abomination_minion: {
    id: 'abomination_minion',
    name: 'Plugastwo',
    description: 'Elitarne stwory z połączonych ciał. Silniejsze i bardziej wytrzymałe.',
    icon: '👾',
    tier: 'elite',
    damageMultiplier: 2,
    unitLossMultiplier: 2,
    durationMultiplier: 1.5,
    weakness: 'fortification',
    weaknessBonus: 0.4,
    spawnCondition: { type: 'every_n_waves', value: 5 },
  },
  apostate: {
    id: 'apostate',
    name: 'Apostata',
    description: 'Zdrajca wiary. Kradnie waszą Wiarę zamiast zadawać obrażenia.',
    icon: '🧙',
    tier: 'special',
    damageMultiplier: 0.5,
    unitLossMultiplier: 0.3,
    durationMultiplier: 1.2,
    specialEffect: {
      type: 'steal_faith',
      value: 5, // Kradnie 5% aktualnej Wiary
      description: 'Kradnie 5% waszej Wiary',
    },
    weakness: 'martyrdom',
    weaknessBonus: 0.6,
    spawnCondition: { type: 'every_n_waves', value: 7 },
  },
  abomination_boss: {
    id: 'abomination_boss',
    name: 'Abominacja',
    description: 'Przerażająca hybryda z dziesiątek ciał. Gwarantowana nagroda za pokonanie.',
    icon: '🐙',
    tier: 'boss',
    damageMultiplier: 5,
    unitLossMultiplier: 3,
    durationMultiplier: 3,
    specialEffect: {
      type: 'morale_drain',
      value: 2, // Ciągły drain morale -2/s
      description: 'Ciągły drain morale -2/s podczas walki',
    },
    weakness: 'martyrdom',
    weaknessBonus: 0.35,
    spawnCondition: { type: 'every_n_waves', value: 25 },
  },
  arch_heretic: {
    id: 'arch_heretic',
    name: 'Arcyheretyk',
    description: 'Przywódca kultu. Wymaga aktywnej obrony i strategicznych wyborów.',
    icon: '😈',
    tier: 'megaboss',
    damageMultiplier: 10,
    unitLossMultiplier: 5,
    durationMultiplier: 5,
    specialEffect: {
      type: 'disable_buildings',
      value: 30, // Wyłącza 30% budynków
      description: 'Wyłącza 30% losowych budynków podczas walki',
    },
    weaknessBonus: 0,
    spawnCondition: { type: 'every_n_waves', value: 100 },
  },
};

export interface DefenseBonus {
  id: string;
  name: string;
  icon: string;
  description: string;
  moraleProtection: number; // Reduces morale damage (0-1)
  unitProtection: number; // Reduces unit losses (0-1)
  moraleRegenBonus?: number; // Temporary morale regen bonus
  faithCost: Decimal;
  cooldown: number; // Seconds
  duration: number; // How long the defense lasts
}

// ============================================
// Store
// ============================================

export const useCombatStore = defineStore(
  'combat',
  () => {
    const resourceStore = useResourceStore();
    const entityStore = useEntityStore();
    const narrativeStore = useNarrativeStore();

    // ============================================
    // State
    // ============================================

    // Threat system - increases over time, triggers waves
    const threat = ref(bn(0));
    const maxThreat = ref(bn(100));
    const baseThreatPerSecond = ref(bn(0.5)); // Base threat increase per second
    const threatMultiplier = ref(bn(1));

    // Morale system - affects production multiplier (does NOT end game at 0)
    const morale = ref(bn(100));
    const maxMorale = ref(bn(100));
    const baseMoraleRegen = ref(bn(0.1)); // Very slow natural regen
    const moraleRegenBonus = ref(bn(0)); // Bonus from buildings/abilities

    // Wave system
    const currentWave = ref(0);
    const isWaveActive = ref(false);
    const waveTimeRemaining = ref(0);
    const timeSinceLastWave = ref(0);
    const baseWaveInterval = ref(60); // Base seconds between waves

    // Defense system
    const isDefenseActive = ref(false);
    const defenseTimeRemaining = ref(0);
    const defenseCooldown = ref(0);
    const activeDefenseId = ref<string | null>(null);

    // Liturgy cost scaling system
    const defenseUsageCounts = ref<Record<string, number>>({
      blessing: 0,
      martyrdom: 0,
      regeneration: 0,
      fortification: 0,
    });
    const DEFENSE_COST_MULTIPLIER = 1.5; // Cost increases by 50% per use
    const DEFENSE_COST_DECAY_INTERVAL = 120; // Seconds between cost decay
    const timeSinceLastCostDecay = ref(0);

    // Scaling factors (increase difficulty over time)
    const waveStrengthMultiplier = ref(1); // Increases with waves defeated
    const difficultyLevel = ref(1); // Overall difficulty scaling

    // Stats
    const totalUnitsLost = ref(0);
    const wavesDefeated = ref(0);
    const cycleEnded = ref(false);

    // Max level effect tracking
    const firstWaveImmunityUsed = ref(false); // For Walls Lv5

    // Relic bonuses
    const relicDefenseBonus = ref(0);
    const relicMoraleRegenBonus = ref(0);
    const relicMoraleDamageReduction = ref(0);
    const relicMoraleMinimum = ref(0);
    const relicWaveDelayBonus = ref(0);

    // ============================================
    // Extended Combat State
    // ============================================

    // Current enemy type for the active wave
    const currentEnemyType = ref<EnemyTypeId>('cultist');

    // Combat combo system
    const combo = ref<CombatCombo>({
      currentStreak: 0,
      maxStreak: 0,
      lastWaveTime: 0,
      comboWindow: 30, // 30 seconds to maintain combo
      bonusPerStreak: 0.05, // +5% bonus per streak
    });

    // Boss encounter state
    const activeBossEncounter = ref<BossEncounter | null>(null);
    const bossesDefeated = ref(0);
    const megaBossesDefeated = ref(0);

    // Active wave details
    const activeWave = ref<ActiveWave | null>(null);

    // Disabled buildings during megaboss
    const disabledBuildingIds = ref<string[]>([]);

    // ============================================
    // Wave definitions
    // ============================================

    const waves: WaveEvent[] = [
      {
        id: 'skirmish',
        name: 'Potyczka',
        description: 'Mała grupa heretyków testuje wasze obrony.',
        threatRequired: 25,
        baseDamage: 5,
        baseUnitLosses: 5,
        duration: 5,
      },
      {
        id: 'raid',
        name: 'Najazd',
        description: 'Kultyści Mięsa atakują z zaskoczenia!',
        threatRequired: 50,
        baseDamage: 12,
        baseUnitLosses: 8,
        duration: 8,
      },
      {
        id: 'assault',
        name: 'Szturm',
        description: 'Zmasowany atak na wasze fortyfikacje.',
        threatRequired: 75,
        baseDamage: 20,
        baseUnitLosses: 12,
        duration: 10,
      },
      {
        id: 'siege',
        name: 'Oblężenie',
        description: 'Hordy plugastwa oblegają Sanktuarium!',
        threatRequired: 100,
        baseDamage: 30,
        baseUnitLosses: 18,
        duration: 15,
      },
    ];

    // ============================================
    // Defense definitions (blessings/abilities)
    // ============================================

    const defenses: DefenseBonus[] = [
      {
        id: 'blessing',
        name: 'Błogosławieństwo Solmara',
        icon: 'mdi-shield-cross',
        description: 'Przywołaj ochronę Solmara. Zmniejsza obrażenia o 50%.',
        moraleProtection: 0.5,
        unitProtection: 0.5,
        faithCost: bn(20),
        cooldown: 30,
        duration: 15,
      },
      {
        id: 'martyrdom',
        name: 'Męczeństwo',
        icon: 'mdi-fire',
        description: 'Poświęcenie. Blokuje 90% obrażeń morale.',
        moraleProtection: 0.9,
        unitProtection: 0.7,
        faithCost: bn(50),
        cooldown: 60,
        duration: 10,
      },
      {
        id: 'regeneration',
        name: 'Odnowa Ducha',
        icon: 'mdi-heart-plus',
        description: 'Przyspiesza regenerację morale o +5/s przez 20s.',
        moraleProtection: 0,
        unitProtection: 0,
        moraleRegenBonus: 5,
        faithCost: bn(30),
        cooldown: 45,
        duration: 20,
      },
      {
        id: 'fortification',
        name: 'Święta Fortyfikacja',
        icon: 'mdi-castle',
        description: 'Wzmacnia mury. Całkowita ochrona jednostek.',
        moraleProtection: 0.3,
        unitProtection: 1.0,
        faithCost: bn(40),
        cooldown: 90,
        duration: 12,
      },
    ];

    // ============================================
    // Computed - Defense Stats from Buildings
    // ============================================

    /**
     * Total defense rating from buildings/units (scaled by level)
     * Reduces damage taken during waves
     */
    const defenseRating = computed(() => {
      let defense = 0;
      const entities = entityStore.entities;

      // Walls provide flat defense (scaled by level)
      if (entities.walls?.unlocked && entities.walls.count > 0) {
        const levelBonus = entityStore.getLevelBonus('walls');
        defense += entities.walls.count * 2 * levelBonus; // +2 defense per wall section
      }

      // Guard towers provide defense (scaled by level)
      if (entities.guard_tower?.unlocked && entities.guard_tower.count > 0) {
        const levelBonus = entityStore.getLevelBonus('guard_tower');
        defense += entities.guard_tower.count * 5 * levelBonus; // +5 defense per tower
      }

      // Chaplains provide small defense bonus (scaled by level)
      if (entities.chaplain?.unlocked && entities.chaplain.count > 0) {
        const levelBonus = entityStore.getLevelBonus('chaplain');
        defense += entities.chaplain.count * 1 * levelBonus; // +1 defense per chaplain
      }

      // MAX LEVEL EFFECT: Czołg-Ołtarz Lv5 - +50% obrony globalna
      if (entities.altar_tank?.unlocked && entities.altar_tank.count > 0 && entities.altar_tank.level >= 5) {
        defense *= 1.5;
      }

      // TIER 3: Forteca Inkwizycji - +20% efektywność obrony
      if (entities.inquisition_fortress?.unlocked && entities.inquisition_fortress.count > 0) {
        const levelBonus = entityStore.getLevelBonus('inquisition_fortress');
        defense *= 1 + (0.2 * entities.inquisition_fortress.count * levelBonus);
      }

      // TIER 3: Święci Wojownicy - zmniejszają siłę fal (efekt na obronę)
      if (entities.holy_warrior?.unlocked && entities.holy_warrior.count > 0) {
        const levelBonus = entityStore.getLevelBonus('holy_warrior');
        const warriorBonus = Math.min(entities.holy_warrior.count * 5 * levelBonus, 50); // Max +50% defense
        defense *= 1 + (warriorBonus / 100);
      }

      // Relic defense bonus
      defense += relicDefenseBonus.value;

      return defense;
    });

    /**
     * Defense multiplier (0-1 range, reduces damage)
     * Formula: damage_taken = base_damage * (1 - defenseMultiplier)
     */
    const defenseMultiplier = computed(() => {
      // Each point of defense reduces damage by 1%, capped at 80%
      let reduction = Math.min(defenseRating.value * 0.01, 0.8);

      // Add bonus from active events
      const eventStore = useEventStore();
      reduction += eventStore.defenseBonus;

      return Math.min(reduction, 0.9); // Cap at 90% total reduction
    });

    /**
     * Total morale regeneration per second
     */
    const totalMoraleRegen = computed(() => {
      let regen = baseMoraleRegen.value.toNumber();

      // Add bonus from active abilities
      regen += moraleRegenBonus.value.toNumber();

      // Add bonus from Chaplains
      const entities = entityStore.entities;
      if (entities.chaplain?.unlocked && entities.chaplain.count > 0) {
        const levelBonus = entityStore.getLevelBonus('chaplain');
        regen += entities.chaplain.count * 0.5 * levelBonus; // +0.5/s per chaplain (scaled by level)

        // MAX LEVEL EFFECT: Kapelan Lv5 - +2/s global morale regen
        if (entities.chaplain.level >= 5) {
          regen += 2;
        }
      }

      // Add bonus from Monastery
      if (entities.monastery?.unlocked && entities.monastery.count > 0) {
        let monasteryRegen = entities.monastery.count * 1; // +1/s per monastery

        // MAX LEVEL EFFECT: Klasztor Lv5 - Podwójna regeneracja morale
        if (entities.monastery.level >= 5) {
          monasteryRegen *= 2;
        }

        regen += monasteryRegen * entityStore.getLevelBonus('monastery');
      }

      // TIER 3: Wieża Dzwonnicza - +10% regeneracji morale
      if (entities.bell_tower?.unlocked && entities.bell_tower.count > 0) {
        const levelBonus = entityStore.getLevelBonus('bell_tower');
        regen *= 1 + (0.1 * entities.bell_tower.count * levelBonus);
      }

      // Add bonus from active events
      const eventStore = useEventStore();
      regen += eventStore.moraleRegenBonus;

      // Add relic bonus
      regen *= (1 + relicMoraleRegenBonus.value);

      return bn(regen);
    });

    /**
     * Threat reduction from defensive buildings
     * Makes threat grow slower
     */
    const threatReduction = computed(() => {
      let reduction = 0;

      const entities = entityStore.entities;

      // Guard towers reduce threat growth
      if (entities.guard_tower?.unlocked && entities.guard_tower.count > 0) {
        reduction += entities.guard_tower.count * 0.02; // -2% per tower
      }

      // Walls slightly reduce threat
      if (entities.walls?.unlocked && entities.walls.count > 0) {
        reduction += entities.walls.count * 0.01; // -1% per wall
      }

      return Math.min(reduction, 0.5); // Cap at 50% reduction
    });

    /**
     * Effective wave interval (can be modified by buildings)
     */
    const effectiveWaveInterval = computed(() => {
      let interval = baseWaveInterval.value;

      // Guard towers can delay waves slightly
      const entities = entityStore.entities;
      if (entities.guard_tower?.unlocked && entities.guard_tower.count > 0) {
        interval += entities.guard_tower.count * 2; // +2s per tower

        // MAX LEVEL EFFECT: Wieża Strażnicza Lv5 - +30s ostrzegania
        if (entities.guard_tower.level >= 5) {
          interval += 30;
        }
      }

      // TIER 3: Wieża Dzwonnicza - +30s ostrzegania o fali
      if (entities.bell_tower?.unlocked && entities.bell_tower.count > 0) {
        const levelBonus = entityStore.getLevelBonus('bell_tower');
        interval += entities.bell_tower.count * 30 * levelBonus;
      }

      // Add relic wave delay bonus
      interval += relicWaveDelayBonus.value;

      return Math.min(interval, 300); // Cap at 5 minutes
    });

    // ============================================
    // Computed - UI Values
    // ============================================

    const threatPercent = computed(() => {
      if (maxThreat.value.eq(0)) return 0;
      return threat.value.div(maxThreat.value).mul(100).toNumber();
    });

    const moralePercent = computed(() => {
      if (maxMorale.value.eq(0)) return 0;
      return morale.value.div(maxMorale.value).mul(100).toNumber();
    });

    const formattedThreat = computed(() => formatNumber(threat.value));
    const formattedMorale = computed(() => formatNumber(morale.value));
    const formattedMoraleRegen = computed(() => `+${formatNumber(totalMoraleRegen.value)}/s`);
    const formattedDefenseRating = computed(() => `${defenseRating.value} (${Math.round(defenseMultiplier.value * 100)}% redukcji)`);

    /**
     * Morale-based production multiplier
     * Each point of morale = +1% production (100 morale = 2x, 50 morale = 1.5x, 0 morale = 1x)
     */
    const moraleProductionMultiplier = computed(() => {
      const moraleValue = morale.value.toNumber();
      // 1 + (morale / 100), so at 100 morale = 2x, at 50 = 1.5x, at 0 = 1x
      return 1 + (moraleValue / 100);
    });

    const formattedMoraleBonus = computed(() => {
      const bonus = Math.round((moraleProductionMultiplier.value - 1) * 100);
      if (bonus >= 0) {
        return `+${bonus}% produkcji`;
      }
      return `${bonus}% produkcji`;
    });

    const nextWave = computed(() => {
      const threatVal = threat.value.toNumber();
      return waves.find(w => w.threatRequired > threatVal) || waves[waves.length - 1];
    });

    // ============================================
    // Extended Combat Computed
    // ============================================

    /**
     * Current enemy type details
     */
    const currentEnemy = computed(() => ENEMY_TYPES[currentEnemyType.value]);

    /**
     * Combo multiplier based on current streak
     */
    const comboMultiplier = computed(() => {
      return 1 + (combo.value.currentStreak * combo.value.bonusPerStreak);
    });

    /**
     * Formatted combo display
     */
    const formattedCombo = computed(() => {
      if (combo.value.currentStreak === 0) return null;
      const bonus = Math.round((comboMultiplier.value - 1) * 100);
      return `x${combo.value.currentStreak} (+${bonus}% bonusu)`;
    });

    /**
     * Check if current wave is a boss wave
     */
    const isBossWave = computed(() => {
      return currentWave.value > 0 && currentWave.value % 25 === 0;
    });

    /**
     * Check if current wave is a mega boss wave
     */
    const isMegaBossWave = computed(() => {
      return currentWave.value > 0 && currentWave.value % 100 === 0;
    });

    /**
     * Determine which enemy type should spawn for current wave
     */
    const getEnemyTypeForWave = computed(() => (waveNum: number): EnemyTypeId => {
      // Priority: megaboss > boss > elite > special > basic
      if (waveNum % 100 === 0) return 'arch_heretic';
      if (waveNum % 25 === 0) return 'abomination_boss';
      if (waveNum % 7 === 0) return 'apostate';
      if (waveNum % 5 === 0) return 'abomination_minion';
      return 'cultist';
    });

    /**
     * Get current scaled cost for a defense ability
     */
    /**
     * Calculate liturgy cost discount from Tier 3 buildings
     */
    const liturgyCostDiscount = computed(() => {
      let discount = 0;
      const entities = entityStore.entities;

      // TIER 3: Forteca Inkwizycji - -30% koszt liturgii
      if (entities.inquisition_fortress?.unlocked && entities.inquisition_fortress.count > 0) {
        const levelBonus = entityStore.getLevelBonus('inquisition_fortress');
        discount += 0.3 * entities.inquisition_fortress.count * levelBonus;
      }

      // TIER 3: Inkwizytorzy - -3% koszt liturgii each (stackuje)
      if (entities.inquisitor?.unlocked && entities.inquisitor.count > 0) {
        const levelBonus = entityStore.getLevelBonus('inquisitor');
        discount += 0.03 * entities.inquisitor.count * levelBonus;

        // MAX LEVEL EFFECT: Wielki Inkwizytor - -20% koszt liturgii globalnie
        if (entities.inquisitor.level >= 5) {
          discount += 0.2;
        }
      }

      return Math.min(discount, 0.8); // Cap at 80% discount
    });

    const getDefenseCost = computed(() => (defenseId: string): Decimal => {
      const defense = defenses.find(d => d.id === defenseId);
      if (!defense) return bn(Infinity);

      const usageCount = defenseUsageCounts.value[defenseId] || 0;
      // Cost = baseCost * (multiplier ^ usageCount) * (1 - discount)
      const scaledCost = defense.faithCost
        .mul(Math.pow(DEFENSE_COST_MULTIPLIER, usageCount))
        .mul(1 - liturgyCostDiscount.value);
      return scaledCost;
    });

    /**
     * Get formatted cost for display
     */
    const getFormattedDefenseCost = computed(() => (defenseId: string): string => {
      const cost = getDefenseCost.value(defenseId);
      const usageCount = defenseUsageCounts.value[defenseId] || 0;
      if (usageCount > 0) {
        return `${formatNumber(cost)} (x${usageCount + 1})`;
      }
      return formatNumber(cost);
    });

    const canActivateDefense = computed(() => (defenseId: string) => {
      const defense = defenses.find(d => d.id === defenseId);
      if (!defense) return false;
      if (defenseCooldown.value > 0) return false;
      if (isDefenseActive.value) return false;

      // Use scaled cost
      const currentCost = getDefenseCost.value(defenseId);
      return resourceStore.resources.faith.amount.gte(currentCost);
    });

    const timeUntilNextWave = computed(() => {
      return Math.max(0, effectiveWaveInterval.value - timeSinceLastWave.value);
    });

    const isUnderAttack = computed(() => isWaveActive.value);

    /**
     * Calculate scaled wave damage based on waves defeated
     */
    const scaledWaveDamage = computed(() => (baseDamage: number) => {
      // Every 5 waves, damage increases by 10%
      const waveScaling = 1 + Math.floor(wavesDefeated.value / 5) * 0.1;
      // Difficulty level adds more scaling
      const difficultyScaling = 1 + (difficultyLevel.value - 1) * 0.2;
      return baseDamage * waveScaling * difficultyScaling * waveStrengthMultiplier.value;
    });

    /**
     * Calculate scaled unit losses based on waves defeated
     */
    const scaledUnitLosses = computed(() => (baseLosses: number) => {
      // Every 10 waves, unit losses increase by 5%
      const waveScaling = 1 + Math.floor(wavesDefeated.value / 10) * 0.05;
      return Math.min(baseLosses * waveScaling, 50); // Cap at 50%
    });

    // ============================================
    // Actions
    // ============================================

    /**
     * Main tick function - called every frame
     */
    function tick(deltaTime: number) {
      if (cycleEnded.value) return;

      // Update threat
      updateThreat(deltaTime);

      // Update wave timing
      updateWaveTimer(deltaTime);

      // Update active wave
      if (isWaveActive.value) {
        updateActiveWave(deltaTime);
      }

      // Update defense cooldown
      if (defenseCooldown.value > 0) {
        defenseCooldown.value = Math.max(0, defenseCooldown.value - deltaTime);
      }

      // Update active defense
      if (isDefenseActive.value && defenseTimeRemaining.value > 0) {
        defenseTimeRemaining.value = Math.max(0, defenseTimeRemaining.value - deltaTime);
        if (defenseTimeRemaining.value === 0) {
          deactivateDefense();
        }
      }

      // Morale regeneration (always active, faster when not under attack)
      if (morale.value.lt(maxMorale.value)) {
        const regenMultiplier = isWaveActive.value ? 0.2 : 1; // 80% slower during attack
        const regen = totalMoraleRegen.value.mul(deltaTime).mul(regenMultiplier);
        morale.value = Decimal.min(morale.value.add(regen), maxMorale.value);
      }

      // Liturgy cost decay over time (slowly reduces usage counts)
      timeSinceLastCostDecay.value += deltaTime;
      if (timeSinceLastCostDecay.value >= DEFENSE_COST_DECAY_INTERVAL) {
        timeSinceLastCostDecay.value = 0;
        decayDefenseCosts();
      }

      // Morale can't go below 0
      if (morale.value.lt(0)) {
        morale.value = bn(0);
      }

      // Update combo timer
      if (combo.value.currentStreak > 0) {
        const timeSinceLastKill = Date.now() - combo.value.lastWaveTime;
        if (timeSinceLastKill > combo.value.comboWindow * 1000) {
          // Combo expired
          combo.value.currentStreak = 0;
        }
      }

      // Boss special effect: morale drain
      if (isWaveActive.value && activeWave.value?.isBoss) {
        const enemy = ENEMY_TYPES[currentEnemyType.value];
        if (enemy.specialEffect?.type === 'morale_drain') {
          const drain = bn(enemy.specialEffect.value).mul(deltaTime);
          morale.value = Decimal.max(morale.value.sub(drain), bn(relicMoraleMinimum.value));
        }
      }
    }

    /**
     * Update threat level
     */
    function updateThreat(deltaTime: number) {
      // Base threat increase
      let threatIncrease = baseThreatPerSecond.value.mul(deltaTime).mul(threatMultiplier.value);

      // More buildings = more threat (enemies notice your growth)
      const totalBuildings = Object.values(entityStore.entities)
        .reduce((sum, e) => sum + e.count, 0);
      const buildingThreatBonus = 1 + (totalBuildings * 0.03); // 3% per building
      threatIncrease = threatIncrease.mul(buildingThreatBonus);

      // Wave counter increases threat generation
      const waveBonus = 1 + (wavesDefeated.value * 0.05); // 5% per wave
      threatIncrease = threatIncrease.mul(waveBonus);

      // Apply threat reduction from defensive buildings
      threatIncrease = threatIncrease.mul(1 - threatReduction.value);

      threat.value = Decimal.min(threat.value.add(threatIncrease), maxThreat.value);
    }

    /**
     * Update wave timer and trigger waves
     */
    function updateWaveTimer(deltaTime: number) {
      if (isWaveActive.value) return;

      timeSinceLastWave.value += deltaTime;

      // Check if it's time for a new wave
      if (timeSinceLastWave.value >= effectiveWaveInterval.value) {
        startWave();
      }
    }

    /**
     * Start a new enemy wave
     */
    function startWave() {
      if (isWaveActive.value) return;

      const wave = getWaveForThreat(threat.value.toNumber());
      if (!wave) return;

      currentWave.value++;
      isWaveActive.value = true;
      timeSinceLastWave.value = 0;

      // Determine enemy type for this wave
      const enemyTypeId = getEnemyTypeForWave.value(currentWave.value);
      currentEnemyType.value = enemyTypeId;
      const enemy = ENEMY_TYPES[enemyTypeId];

      // Calculate wave duration with enemy multiplier
      const duration = wave.duration * enemy.durationMultiplier;
      waveTimeRemaining.value = duration;

      // Calculate scaled damage with enemy multiplier
      const baseDamage = wave.baseDamage * enemy.damageMultiplier;
      const baseUnitLosses = wave.baseUnitLosses * enemy.unitLossMultiplier;
      const scaledDmg = Math.round(scaledWaveDamage.value(baseDamage) * (1 - defenseMultiplier.value));

      // Create active wave record
      activeWave.value = {
        waveNumber: currentWave.value,
        enemyType: enemy,
        damage: baseDamage,
        unitLosses: baseUnitLosses,
        duration,
        timeRemaining: duration,
        isBoss: enemy.tier === 'boss' || enemy.tier === 'megaboss',
        specialEffectActive: !!enemy.specialEffect,
      };

      // Handle megaboss special effect: disable buildings
      if (enemy.tier === 'megaboss' && enemy.specialEffect?.type === 'disable_buildings') {
        disableRandomBuildings(enemy.specialEffect.value);
      }

      // Narrative log
      const tierEmoji: Record<string, string> = {
        basic: '⚔️',
        elite: '💀',
        special: '🧙',
        boss: '👑',
        megaboss: '😈',
      };

      const emoji = tierEmoji[enemy.tier];
      let message = `${emoji} ${enemy.name}: ${enemy.description}`;
      if (enemy.specialEffect) {
        message += ` (${enemy.specialEffect.description})`;
      }
      message += ` [Obrażenia: ~${scaledDmg}]`;

      narrativeStore.addLog({
        message,
        type: enemy.tier === 'boss' || enemy.tier === 'megaboss' ? 'error' : 'warning',
      });

      // Boss encounter setup
      if (enemy.tier === 'boss' || enemy.tier === 'megaboss') {
        setupBossEncounter(enemy);
      }

      console.log(`[Combat] Wave ${currentWave.value} started: ${enemy.name} (${enemy.tier})`);
    }

    /**
     * Setup boss encounter with choices
     */
    function setupBossEncounter(enemy: EnemyType) {
      const choices: BossChoice[] = [
        {
          id: 'attack',
          name: 'Atak Frontalny',
          description: 'Bezpośredni atak. Zadaje obrażenia, ale ryzykujesz straty.',
          icon: '⚔️',
          cost: { faith: 100 },
          effect: { type: 'damage', value: 20 },
        },
        {
          id: 'weaken',
          name: 'Osłabienie',
          description: 'Osłabia wroga, zmniejszając jego obrażenia.',
          icon: '🔮',
          cost: { faith: 150, ducats: 50 },
          effect: { type: 'weaken', value: 30 },
        },
        {
          id: 'sacrifice',
          name: 'Poświęcenie',
          description: 'Poświęć jednostki, aby zadać ogromne obrażenia.',
          icon: '💀',
          cost: {},
          effect: { type: 'sacrifice', value: 50 },
        },
      ];

      activeBossEncounter.value = {
        id: `boss_${currentWave.value}`,
        enemyType: enemy.id,
        phase: 1,
        maxPhases: enemy.tier === 'megaboss' ? 3 : 2,
        healthPercent: 100,
        choices,
        activeChoice: null,
        timeRemaining: waveTimeRemaining.value,
        rewards: getBossRewards(enemy),
      };
    }

    /**
     * Get rewards for defeating a boss
     */
    function getBossRewards(enemy: EnemyType): { type: string; relicRarity?: RelicRarity; amount?: number }[] {
      const rewards: { type: string; relicRarity?: RelicRarity; amount?: number }[] = [];

      if (enemy.tier === 'megaboss') {
        rewards.push({ type: 'relic', relicRarity: 'legendary' });
        rewards.push({ type: 'ashes', amount: 10 });
      } else if (enemy.tier === 'boss') {
        // 50% chance for epic, 50% for rare
        const rarity: RelicRarity = Math.random() > 0.5 ? 'epic' : 'rare';
        rewards.push({ type: 'relic', relicRarity: rarity });
        rewards.push({ type: 'ashes', amount: 3 });
      }

      return rewards;
    }

    /**
     * Execute boss choice
     */
    function executeBossChoice(choiceId: string): boolean {
      if (!activeBossEncounter.value) return false;

      const choice = activeBossEncounter.value.choices.find(c => c.id === choiceId);
      if (!choice) return false;

      // Check if player can afford the cost
      const resourceStore = useResourceStore();
      for (const [resourceId, amount] of Object.entries(choice.cost)) {
        if (!resourceStore.resources[resourceId as keyof typeof resourceStore.resources]?.amount.gte(amount || 0)) {
          return false;
        }
      }

      // Spend resources
      for (const [resourceId, amount] of Object.entries(choice.cost)) {
        resourceStore.spendResource(resourceId as any, amount || 0);
      }

      // Apply effect
      switch (choice.effect.type) {
        case 'damage':
          activeBossEncounter.value.healthPercent -= choice.effect.value;
          break;
        case 'weaken':
          // Reduce incoming damage for this wave
          if (activeWave.value) {
            activeWave.value.damage *= (1 - choice.effect.value / 100);
            activeWave.value.unitLosses *= (1 - choice.effect.value / 100);
          }
          break;
        case 'sacrifice':
          // Kill some units but deal massive damage
          killUnits(10); // Kill 10% of units
          activeBossEncounter.value.healthPercent -= choice.effect.value;
          break;
      }

      activeBossEncounter.value.activeChoice = choiceId;

      // Check if boss is defeated
      if (activeBossEncounter.value.healthPercent <= 0) {
        defeatBoss();
      } else if (activeBossEncounter.value.healthPercent <= 50 && activeBossEncounter.value.phase < activeBossEncounter.value.maxPhases) {
        // Next phase
        activeBossEncounter.value.phase++;
        narrativeStore.addLog({
          message: `⚠️ ${ENEMY_TYPES[activeBossEncounter.value.enemyType].name} wchodzi w fazę ${activeBossEncounter.value.phase}!`,
        type: 'warning',
      });
      }

      return true;
    }

    /**
     * Defeat boss and grant rewards
     */
    function defeatBoss() {
      if (!activeBossEncounter.value) return;

      const enemy = ENEMY_TYPES[activeBossEncounter.value.enemyType];
      const relicStore = useRelicStore();

      // Grant rewards
      for (const reward of activeBossEncounter.value.rewards) {
        if (reward.type === 'relic' && reward.relicRarity) {
          // Grant a relic of the specified rarity
          const unowned = relicStore.relics.filter(r => !r.owned && r.rarity === reward.relicRarity);
          if (unowned.length > 0) {
            const relic = unowned[Math.floor(Math.random() * unowned.length)];
            relicStore.grantRelic(relic.id);
            narrativeStore.addLog({
              message: `🏺 Zdobyto relikwię: ${relic.name}!`,
              type: 'achievement',
            });
          }
        } else if (reward.type === 'ashes' && reward.amount) {
          // Add bonus ashes (will be applied at next prestige)
          narrativeStore.addLog({
            message: `🔥 Bonus +${reward.amount} Popiołów przy następnym prestiżu!`,
            type: 'achievement',
          });
        }
      }

      // Update stats
      if (enemy.tier === 'megaboss') {
        megaBossesDefeated.value++;
        narrativeStore.addLog({
          message: `👑 ARCYHERETYK POKONANY! Chwała Solmarowi!`,
          type: 'achievement',
        });
      } else {
        bossesDefeated.value++;
        narrativeStore.addLog({
          message: `💀 BOSS POKONANY: ${enemy.name}!`,
          type: 'achievement',
        });
      }

      // Clear boss encounter
      activeBossEncounter.value = null;
    }

    /**
     * Disable random buildings (megaboss effect)
     */
    function disableRandomBuildings(percent: number) {
      const allBuildings = Object.keys(entityStore.entities).filter(
        id => entityStore.entities[id as any]?.count > 0
      );

      const numToDisable = Math.ceil(allBuildings.length * (percent / 100));
      const shuffled = allBuildings.sort(() => Math.random() - 0.5);
      disabledBuildingIds.value = shuffled.slice(0, numToDisable);

      narrativeStore.addLog({
        message: `⚡ ${numToDisable} budynków zostało wyłączonych przez moc Arcyheretyka!`,
        type: 'error',
      });
    }

    /**
     * Re-enable buildings after megaboss
     */
    function enableAllBuildings() {
      if (disabledBuildingIds.value.length > 0) {
        narrativeStore.addLog({
          message: `✨ Wszystkie budynki wracają do działania!`,
          type: 'info',
        });
        disabledBuildingIds.value = [];
      }
    }

    /**
     * Get wave type based on current threat level
     */
    function getWaveForThreat(threatLevel: number): WaveEvent | null {
      // Find the highest tier wave we qualify for
      const qualifying = waves.filter(w => threatLevel >= w.threatRequired);
      if (qualifying.length === 0) return waves[0]; // Default to skirmish
      return qualifying[qualifying.length - 1];
    }

    /**
     * Update active wave (deal damage over time)
     */
    function updateActiveWave(deltaTime: number) {
      waveTimeRemaining.value = Math.max(0, waveTimeRemaining.value - deltaTime);

      if (waveTimeRemaining.value === 0) {
        resolveWave();
      }
    }

    /**
     * Resolve wave - apply damage and losses
     */
    function resolveWave() {
      const wave = getWaveForThreat(threat.value.toNumber());
      if (!wave) return;

      const entities = entityStore.entities;
      const enemy = ENEMY_TYPES[currentEnemyType.value];

      // MAX LEVEL EFFECT: Mury Lv5 - Immunitet na pierwszą falę po prestiżu
      if (
        !firstWaveImmunityUsed.value &&
        entities.walls?.unlocked &&
        entities.walls.count > 0 &&
        entities.walls.level >= 5
      ) {
        firstWaveImmunityUsed.value = true;
        finishWave(true, 0, enemy);
        narrativeStore.addLog({
          message: `🛡️ ŚWIĘTE MURY! Pierwsza fala została całkowicie odparta bez strat!`,
          type: 'achievement',
        });
        console.log('[Combat] First wave immunity used (Walls Lv5)');
        return;
      }

      // TIER 3 MAX LEVEL: Święci Wojownicy Lv5 - Szansa na całkowite odparcie fali
      if (
        entities.holy_warrior?.unlocked &&
        entities.holy_warrior.count > 0 &&
        entities.holy_warrior.level >= 5
      ) {
        const repelChance = Math.min(entities.holy_warrior.count * 0.05, 0.5);
        if (Math.random() < repelChance) {
          finishWave(true, 0, enemy);
          narrativeStore.addLog({
            message: `⚔️ ŚWIĘCI WOJOWNICY! Elitarni rycerze Solmara całkowicie rozgromili wrogów!`,
            type: 'achievement',
          });
          console.log('[Combat] Holy Warriors repelled the wave completely');
          return;
        }
      }

      // Get base values from active wave or calculate
      let baseDamage = activeWave.value?.damage || wave.baseDamage * enemy.damageMultiplier;
      let baseUnitLoss = activeWave.value?.unitLosses || wave.baseUnitLosses * enemy.unitLossMultiplier;

      // Calculate scaled damage
      let moraleDamage = scaledWaveDamage.value(baseDamage);
      let unitLossPercent = scaledUnitLosses.value(baseUnitLoss);

      // TIER 3: Święci Wojownicy - zmniejszają siłę fali
      if (entities.holy_warrior?.unlocked && entities.holy_warrior.count > 0) {
        const levelBonus = entityStore.getLevelBonus('holy_warrior');
        const damageReduction = Math.min(entities.holy_warrior.count * 0.05 * levelBonus, 0.5);
        moraleDamage *= (1 - damageReduction);
        unitLossPercent *= (1 - damageReduction);
      }

      // Apply defense rating reduction (from buildings)
      moraleDamage *= (1 - defenseMultiplier.value);
      unitLossPercent *= (1 - defenseMultiplier.value * 0.5);

      // Apply active defense bonuses (from abilities)
      let usedWeakness = false;
      if (isDefenseActive.value && activeDefenseId.value) {
        const defense = defenses.find(d => d.id === activeDefenseId.value);
        if (defense) {
          moraleDamage *= (1 - defense.moraleProtection);
          unitLossPercent *= (1 - defense.unitProtection);

          // Check for weakness exploitation
          if (enemy.weakness === activeDefenseId.value) {
            moraleDamage *= (1 - enemy.weaknessBonus);
            unitLossPercent *= (1 - enemy.weaknessBonus);
            usedWeakness = true;
            narrativeStore.addLog({
              message: `⚡ SŁABOŚĆ WYKORZYSTANA! ${defense.name} jest super skuteczne przeciw ${enemy.name}!`,
              type: 'achievement',
            });
          } else {
          narrativeStore.addLog({
            message: `🛡️ ${defense.name} zmniejszyło obrażenia!`,
            type: 'info',
          });
          }
        }
      }

      // Apply relic morale damage reduction
      moraleDamage *= (1 - relicMoraleDamageReduction.value);

      // Apply combo bonus (reduces damage)
      if (combo.value.currentStreak > 0) {
        const comboReduction = Math.min(combo.value.currentStreak * 0.02, 0.3); // Max 30% reduction
        moraleDamage *= (1 - comboReduction);
      }

      // Handle special enemy effects
      if (enemy.specialEffect) {
        switch (enemy.specialEffect.type) {
          case 'steal_faith':
            const faithToSteal = resourceStore.resources.faith.amount.mul(enemy.specialEffect.value / 100);
            resourceStore.spendResource('faith', faithToSteal);
            narrativeStore.addLog({
              message: `🧙 ${enemy.name} ukradł ${formatNumber(faithToSteal)} Wiary!`,
              type: 'warning',
            });
            break;
        }
      }

      // Apply morale damage (respecting relic morale minimum)
      morale.value = Decimal.max(morale.value.sub(moraleDamage), bn(relicMoraleMinimum.value));

      // Kill units
      const unitsLost = killUnits(unitLossPercent);

      // Reduce threat after wave
      const threatReductionAmount = wave.threatRequired * (0.3 + defenseMultiplier.value * 0.2);
      threat.value = Decimal.max(threat.value.sub(threatReductionAmount), bn(0));

      // Finish wave and update combo
      finishWave(false, unitsLost, enemy);

      // Update difficulty every 10 waves
      if (wavesDefeated.value % 10 === 0) {
        difficultyLevel.value++;
        narrativeStore.addLog({
          message: `⚠️ Wrogowie stają się silniejsi! Poziom trudności: ${difficultyLevel.value}`,
          type: 'warning',
        });
      }

      // TIER 2 EFFECT: Arsenal - gain Rage after wave
      if (entities.arsenal?.unlocked && entities.arsenal.count > 0) {
        const ragePerArsenal = entities.arsenal.level >= 5 ? 10 : 5;
        const totalRage = entities.arsenal.count * ragePerArsenal;
        resourceStore.addResource('rage', bn(totalRage));

        narrativeStore.addLog({
          message: `⚔️ Arsenał generuje +${totalRage} Gniewu!`,
          type: 'info',
        });
      }

      // TIER 3 MAX LEVEL: Wieża Dzwonnicza Lv5 - +5 morale per dzwon po fali
      if (entities.bell_tower?.unlocked && entities.bell_tower.count > 0 && entities.bell_tower.level >= 5) {
        const moraleBonus = entities.bell_tower.count * 5;
        morale.value = Decimal.min(morale.value.add(moraleBonus), maxMorale.value);

        narrativeStore.addLog({
          message: `🔔 Boży Głos! Dzwony regenerują +${moraleBonus} morale!`,
          type: 'info',
        });
      }

      // Narrative
      const moraleLeft = Math.round(morale.value.toNumber());
      if (unitsLost > 0) {
        narrativeStore.addLog({
          message: `💀 Fala odparta! Stracono ${unitsLost} jednostek. Morale: ${moraleLeft}`,
          type: 'warning',
        });
      } else {
        narrativeStore.addLog({
          message: `✅ Fala odparta bez strat! Morale: ${moraleLeft}`,
          type: 'info',
        });
      }

      // Try to drop a relic
      const relicStore = useRelicStore();
      const droppedRelic = relicStore.tryDropRelic(wavesDefeated.value);
      if (droppedRelic) {
        narrativeStore.addLog({
          message: `🏺 Znaleziono relikwię: ${droppedRelic.name}!`,
          type: 'achievement',
        });
      }

      console.log(`[Combat] Wave resolved. Morale: ${moraleLeft}, Units lost: ${unitsLost}, Difficulty: ${difficultyLevel.value}`);
    }

    /**
     * Kill a percentage of units
     */
    function killUnits(percent: number): number {
      let totalLost = 0;
      let lossRate = percent / 100;

      // TIER 2 EFFECT: Field Hospital - reduces unit losses
      const entities = entityStore.entities;
      if (entities.field_hospital?.unlocked && entities.field_hospital.count > 0) {
        const reductionPerHospital = entities.field_hospital.level >= 5 ? 0.5 : 0.25;
        const totalReduction = Math.min(entities.field_hospital.count * reductionPerHospital, 0.9);
        lossRate *= (1 - totalReduction);

        // MAX LEVEL EFFECT: Cudowne Uzdrowienie - szansa na 0 strat
        if (entities.field_hospital.level >= 5 && Math.random() < 0.25) {
          // 25% chance for zero losses
          narrativeStore.addLog({
            message: `✨ Cudowne Uzdrowienie! Szpital Polowy uratował wszystkie jednostki!`,
            type: 'achievement',
          });
          return 0;
        }
      }

      for (const entity of Object.values(entityStore.entities)) {
        if (entity.count <= 0) continue;

        // Calculate losses (at least 0, random factor)
        const baseLoss = Math.floor(entity.count * lossRate);
        const randomFactor = Math.random() * 0.5 + 0.75; // 0.75 - 1.25
        const actualLoss = Math.min(
          Math.ceil(baseLoss * randomFactor),
          entity.count
        );

        if (actualLoss > 0) {
          entity.count -= actualLoss;
          totalLost += actualLoss;
        }
      }

      totalUnitsLost.value += totalLost;

      // Update production rates after unit loss
      entityStore.updateProductionRates();

      return totalLost;
    }

    /**
     * Activate a defensive ability
     */
    function activateDefense(defenseId: string): boolean {
      const defense = defenses.find(d => d.id === defenseId);
      if (!defense) return false;

      if (!canActivateDefense.value(defenseId)) return false;

      // Calculate and spend scaled cost
      const currentCost = getDefenseCost.value(defenseId);
      resourceStore.spendResource('faith', currentCost);

      // Increment usage count (increases future cost)
      defenseUsageCounts.value[defenseId] = (defenseUsageCounts.value[defenseId] || 0) + 1;

      // Activate defense
      isDefenseActive.value = true;
      activeDefenseId.value = defenseId;
      defenseTimeRemaining.value = defense.duration;
      defenseCooldown.value = defense.cooldown;

      // Apply morale regen bonus if present
      if (defense.moraleRegenBonus) {
        moraleRegenBonus.value = bn(defense.moraleRegenBonus);
      }

      const usageCount = defenseUsageCounts.value[defenseId];
      narrativeStore.addLog({
        message: `🛡️ ${defense.name} aktywowane! (Użycie #${usageCount}, następny koszt: ${formatNumber(getDefenseCost.value(defenseId))} Wiary)`,
        type: 'info',
      });

      console.log(`[Combat] Defense activated: ${defense.name}, usage: ${usageCount}`);
      return true;
    }

    /**
     * Deactivate defense
     */
    function deactivateDefense() {
      // Remove morale regen bonus
      moraleRegenBonus.value = bn(0);

      isDefenseActive.value = false;
      activeDefenseId.value = null;
      defenseTimeRemaining.value = 0;
    }

    /**
     * Finish wave and update stats
     */
    function finishWave(wasImmune: boolean, unitsLost: number, enemy: EnemyType) {
      // Update wave stats
      wavesDefeated.value++;

      // Update combo
      const now = Date.now();
      if (now - combo.value.lastWaveTime < combo.value.comboWindow * 1000) {
        combo.value.currentStreak++;
        if (combo.value.currentStreak > combo.value.maxStreak) {
          combo.value.maxStreak = combo.value.currentStreak;
        }

        if (combo.value.currentStreak >= 3) {
          narrativeStore.addLog({
            message: `🔥 Seria x${combo.value.currentStreak}! Bonus do obrony +${Math.round(combo.value.currentStreak * combo.value.bonusPerStreak * 100)}%`,
            type: 'achievement',
          });
        }
      } else {
        combo.value.currentStreak = 1;
      }
      combo.value.lastWaveTime = now;

      // Handle boss rewards
      if (enemy.tier === 'boss' && activeBossEncounter.value) {
        const rewards = getBossRewards(enemy);
        applyBossRewards(rewards);
        bossesDefeated.value++;
        activeBossEncounter.value = null;
      } else if (enemy.tier === 'megaboss' && activeBossEncounter.value) {
        const rewards = getBossRewards(enemy);
        applyBossRewards(rewards);
        megaBossesDefeated.value++;
        activeBossEncounter.value = null;

        // Re-enable disabled buildings
        disabledBuildingIds.value = [];
      }

      // Clear active wave
      activeWave.value = null;
      isWaveActive.value = false;
      waveTimeRemaining.value = 0;
      timeSinceLastWave.value = 0;
    }

    /**
     * Get rewards for defeating a boss
     */
    function getBossRewards(enemy: EnemyType): { relicRarity?: RelicRarity; ashes?: number; faith?: number } {
      if (enemy.tier === 'boss') {
        return {
          relicRarity: Math.random() < 0.5 ? 'rare' : 'common',
          ashes: 5,
          faith: 500,
        };
      } else if (enemy.tier === 'megaboss') {
        return {
          relicRarity: Math.random() < 0.3 ? 'legendary' : 'epic',
          ashes: 25,
          faith: 2500,
        };
      }
      return {};
    }

    /**
     * Apply boss rewards
     */
    function applyBossRewards(rewards: { relicRarity?: RelicRarity; ashes?: number; faith?: number }) {
      const prestigeStore = usePrestigeStore();
      const relicStore = useRelicStore();

      if (rewards.faith) {
        resourceStore.addResource('faith', bn(rewards.faith));
        narrativeStore.addLog({
          message: `💰 Nagroda za bossa: +${rewards.faith} Wiary!`,
          type: 'achievement',
        });
      }

      if (rewards.ashes) {
        prestigeStore.addAshesFromBoss(rewards.ashes);
        narrativeStore.addLog({
          message: `🔥 Nagroda za bossa: +${rewards.ashes} Popiołów Męczennika!`,
          type: 'achievement',
        });
      }

      if (rewards.relicRarity) {
        const droppedRelic = relicStore.grantRelicByRarity(rewards.relicRarity);
        if (droppedRelic) {
          narrativeStore.addLog({
            message: `🏺 Boss upuścił relikwię: ${droppedRelic.name}!`,
            type: 'achievement',
          });
        }
      }
    }

    /**
     * Decay defense usage counts over time
     * Called periodically to reduce spamming penalty
     */
    function decayDefenseCosts() {
      let decayed = false;

      for (const defenseId in defenseUsageCounts.value) {
        if (defenseUsageCounts.value[defenseId] > 0) {
          defenseUsageCounts.value[defenseId]--;
          decayed = true;
        }
      }

      if (decayed) {
        console.log('[Combat] Defense costs decayed');
      }
    }

    /**
     * End the current cycle (morale reached 0)
     */
    function endCycle() {
      cycleEnded.value = true;
      isWaveActive.value = false;

      narrativeStore.addLog({
        message: `☠️ LINIA FRONTU UPADŁA! Sanktuarium zostało przejęte przez wrogów...`,
        type: 'error',
      });

      console.log('[Combat] Cycle ended - morale reached 0');
    }

    /**
     * Reset combat state (for prestige/new game)
     */
    function resetCombat() {
      threat.value = bn(0);
      morale.value = bn(100);
      currentWave.value = 0;
      isWaveActive.value = false;
      waveTimeRemaining.value = 0;
      timeSinceLastWave.value = 0;
      isDefenseActive.value = false;
      defenseTimeRemaining.value = 0;
      defenseCooldown.value = 0;
      activeDefenseId.value = null;
      moraleRegenBonus.value = bn(0);
      waveStrengthMultiplier.value = 1;
      difficultyLevel.value = 1;
      cycleEnded.value = false;
      totalUnitsLost.value = 0;
      wavesDefeated.value = 0;
      // Reset liturgy costs
      defenseUsageCounts.value = {
        blessing: 0,
        martyrdom: 0,
        regeneration: 0,
        fortification: 0,
      };
      timeSinceLastCostDecay.value = 0;
      // Reset max level effect tracking
      firstWaveImmunityUsed.value = false;

      // Reset extended combat state
      currentEnemyType.value = 'cultist';
      combo.value = {
        currentStreak: 0,
        maxStreak: combo.value.maxStreak, // Keep max streak as achievement
        lastWaveTime: 0,
        comboWindow: 30,
        bonusPerStreak: 0.05,
      };
      activeBossEncounter.value = null;
      activeWave.value = null;
      disabledBuildingIds.value = [];
      // Boss defeats are persistent - not reset
    }

    /**
     * DEV: Set threat level
     */
    function devSetThreat(value: number) {
      threat.value = bn(value);
    }

    /**
     * DEV: Set morale level
     */
    function devSetMorale(value: number) {
      morale.value = bn(value);
    }

    /**
     * DEV: Trigger wave immediately
     */
    function devTriggerWave() {
      timeSinceLastWave.value = effectiveWaveInterval.value;
    }

    return {
      // State
      threat,
      maxThreat,
      baseThreatPerSecond,
      morale,
      maxMorale,
      baseMoraleRegen,
      moraleRegenBonus,
      currentWave,
      isWaveActive,
      waveTimeRemaining,
      timeSinceLastWave,
      baseWaveInterval,
      isDefenseActive,
      defenseTimeRemaining,
      defenseCooldown,
      activeDefenseId,
      waveStrengthMultiplier,
      difficultyLevel,
      totalUnitsLost,
      wavesDefeated,
      cycleEnded,
      defenseUsageCounts,

      // Extended combat state
      currentEnemyType,
      combo,
      activeBossEncounter,
      bossesDefeated,
      megaBossesDefeated,
      activeWave,
      disabledBuildingIds,

      // Relic bonuses
      relicDefenseBonus,
      relicMoraleRegenBonus,
      relicMoraleDamageReduction,
      relicMoraleMinimum,
      relicWaveDelayBonus,

      // Data
      waves,
      defenses,
      ENEMY_TYPES,

      // Computed - Defense stats
      defenseRating,
      defenseMultiplier,
      totalMoraleRegen,
      threatReduction,
      effectiveWaveInterval,
      liturgyCostDiscount,

      // Computed - UI
      threatPercent,
      moralePercent,
      formattedThreat,
      formattedMorale,
      formattedMoraleRegen,
      formattedDefenseRating,
      nextWave,
      canActivateDefense,
      timeUntilNextWave,
      isUnderAttack,
      scaledWaveDamage,
      scaledUnitLosses,
      getDefenseCost,
      getFormattedDefenseCost,
      moraleProductionMultiplier,
      formattedMoraleBonus,

      // Actions
      tick,
      startWave,
      activateDefense,
      resetCombat,
      executeBossChoice,
      defeatBoss,

      // Dev
      devSetThreat,
      devSetMorale,
      devTriggerWave,
    };
  },
  {
    persist: {
      key: 'solmar-combat',
      storage: typeof window !== 'undefined' ? localStorage : undefined,
      pick: [
        'threat',
        'morale',
        'currentWave',
        'timeSinceLastWave',
        'defenseCooldown',
        'waveStrengthMultiplier',
        'difficultyLevel',
        'totalUnitsLost',
        'wavesDefeated',
        'cycleEnded',
        'defenseUsageCounts',
        'bossesDefeated',
        'megaBossesDefeated',
        'combo',
      ],
      serializer: {
        serialize: (state) => {
          return JSON.stringify(state, (key, value) => {
            if (value && typeof value === 'object' && typeof value.toNumber === 'function' && typeof value.add === 'function') {
              return { __decimal: value.toString() };
            }
            return value;
          });
        },
        deserialize: (str) => {
          const parsed = JSON.parse(str);
          function convertDecimals(obj: unknown, key?: string): unknown {
            if (obj === null || obj === undefined) return obj;
            if (typeof obj === 'object' && '__decimal' in (obj as Record<string, unknown>)) {
              return bn((obj as { __decimal: string }).__decimal);
            }
            const decimalFields = ['threat', 'morale', 'maxThreat', 'maxMorale', 'moraleRegenBonus'];
            if ((typeof obj === 'string' || typeof obj === 'number') && key && decimalFields.includes(key)) {
              return bn(obj);
            }
            if (typeof obj !== 'object') return obj;
            if (Array.isArray(obj)) {
              return obj.map((v, i) => convertDecimals(v, String(i)));
            }
            const result: Record<string, unknown> = {};
            for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
              result[k] = convertDecimals(v, k);
            }
            return result;
          }
          return convertDecimals(parsed) as typeof parsed;
        },
      },
    },
  }
);
