/**
 * Wizard Store - Spells, Magic Research, Mana Management
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAteriaGameStore } from '../../core/model/game.store';
import { useAteriaResourcesStore } from '../../core/model/resources.store';
import {
  SPELLS,
  STAFFS,
  ELEMENTS,
  getSpell,
  getStaff,
  getAvailableSpells,
  calculateWizardXpToLevel,
  calculateSpellDamage,
  type Spell,
  type MagicStaff,
  type MagicElement,
  type WizardProgress,
} from '../data/wizard.data';

// ============================================
// TYPES
// ============================================

export interface ActiveCasting {
  spellId: string;
  startTime: number;
  ticksRemaining: number;
  totalTicks: number;
}

export interface ActiveSpellEffect {
  spellId: string;
  effectIndex: number;
  expiresAt: number;
}

export interface SpellCooldown {
  spellId: string;
  expiresAt: number;
}

// ============================================
// STORE
// ============================================

export const useAteriaWizardStore = defineStore('ateria-wizard', () => {
  const gameStore = useAteriaGameStore();
  const resourcesStore = useAteriaResourcesStore();

  // ============================================
  // STATE
  // ============================================

  const progress = ref<WizardProgress>({
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    totalXp: 0,
  });

  // Resources
  const mana = ref(100);
  const maxMana = ref(100);
  const manaRegen = ref(1); // Per tick

  // Equipment
  const equippedStaff = ref<string | null>('wooden_staff');
  const ownedStaffs = ref<Set<string>>(new Set(['wooden_staff']));

  // Spells
  const researchedSpells = ref<Set<string>>(new Set(['fireball', 'water_bolt', 'wind_slash', 'arcane_missile']));
  const activeCasting = ref<ActiveCasting | null>(null);
  const spellCooldowns = ref<Map<string, number>>(new Map());
  const activeSpellEffects = ref<ActiveSpellEffect[]>([]);

  // Element mastery
  const elementMastery = ref<Map<MagicElement, number>>(new Map([
    ['fire', 0],
    ['water', 0],
    ['earth', 0],
    ['air', 0],
    ['light', 0],
    ['dark', 0],
    ['arcane', 0],
  ]));

  // Stats
  const totalSpellsCast = ref(0);
  const totalDamageDealt = ref(0);
  const totalManaSpent = ref(0);

  // ============================================
  // COMPUTED
  // ============================================

  const isCasting = computed(() => activeCasting.value !== null);

  const castingProgress = computed(() => {
    if (!activeCasting.value) return 0;
    const total = activeCasting.value.totalTicks;
    const remaining = activeCasting.value.ticksRemaining;
    return ((total - remaining) / total) * 100;
  });

  const currentStaff = computed(() => {
    if (!equippedStaff.value) return null;
    return getStaff(equippedStaff.value);
  });

  const availableSpells = computed(() => {
    return getAvailableSpells(progress.value.level, researchedSpells.value);
  });

  const totalMagicPower = computed(() => {
    let power = progress.value.level * 2;
    if (currentStaff.value) {
      power += currentStaff.value.magicPower;
    }
    return power;
  });

  const effectiveManaEfficiency = computed(() => {
    let efficiency = 0;
    if (currentStaff.value) {
      efficiency += currentStaff.value.manaEfficiency;
    }
    return efficiency;
  });

  const effectiveCastSpeed = computed(() => {
    let speed = 1.0;
    if (currentStaff.value) {
      speed = currentStaff.value.castSpeed;
    }
    return speed;
  });

  // ============================================
  // ACTIONS - XP & LEVELING
  // ============================================

  function addXp(amount: number) {
    progress.value.xp += amount;
    progress.value.totalXp += amount;

    while (progress.value.xp >= progress.value.xpToNextLevel) {
      progress.value.xp -= progress.value.xpToNextLevel;
      progress.value.level++;
      progress.value.xpToNextLevel = calculateWizardXpToLevel(progress.value.level);

      // Increase max mana on level up
      maxMana.value = 100 + progress.value.level * 10;
      manaRegen.value = 1 + Math.floor(progress.value.level / 5);

      gameStore.addNotification({
        type: 'success',
        title: `Czarodziej - Poziom ${progress.value.level}!`,
        message: 'Zwiększono maksymalną manę!',
        icon: 'mdi-wizard-hat',
        duration: 3000,
      });
    }
  }

  function getXpProgress(): number {
    return (progress.value.xp / progress.value.xpToNextLevel) * 100;
  }

  // ============================================
  // ACTIONS - MANA
  // ============================================

  function regenerateMana() {
    mana.value = Math.min(maxMana.value, mana.value + manaRegen.value);
  }

  function consumeMana(amount: number): boolean {
    const effectiveAmount = Math.floor(amount * (1 - effectiveManaEfficiency.value / 100));
    if (mana.value < effectiveAmount) return false;
    mana.value -= effectiveAmount;
    totalManaSpent.value += effectiveAmount;
    return true;
  }

  // ============================================
  // ACTIONS - EQUIPMENT
  // ============================================

  function buyStaff(staffId: string): boolean {
    const staff = getStaff(staffId);
    if (!staff) return false;
    if (ownedStaffs.value.has(staffId)) return false;
    if (staff.requiredLevel > progress.value.level) return false;
    if (!resourcesStore.hasAmount('gold', staff.cost)) return false;

    resourcesStore.removeResource('gold', staff.cost);
    ownedStaffs.value.add(staffId);

    gameStore.addNotification({
      type: 'success',
      title: 'Kupiono kostur!',
      message: staff.name,
      icon: staff.icon,
      duration: 2000,
    });

    return true;
  }

  function equipStaff(staffId: string): boolean {
    if (!ownedStaffs.value.has(staffId)) return false;
    equippedStaff.value = staffId;
    return true;
  }

  // ============================================
  // ACTIONS - SPELLS
  // ============================================

  function canCastSpell(spellId: string): { canCast: boolean; reason?: string } {
    const spell = getSpell(spellId);
    if (!spell) return { canCast: false, reason: 'Nieznane zaklęcie' };

    if (isCasting.value) {
      return { canCast: false, reason: 'Już rzucasz zaklęcie' };
    }

    if (!researchedSpells.value.has(spellId) && spell.researchCost > 0) {
      return { canCast: false, reason: 'Zaklęcie nie jest zbadane' };
    }

    if (spell.requiredLevel > progress.value.level) {
      return { canCast: false, reason: `Wymaga poziomu ${spell.requiredLevel}` };
    }

    const cooldownEnd = spellCooldowns.value.get(spellId);
    if (cooldownEnd && cooldownEnd > Date.now()) {
      return { canCast: false, reason: 'Zaklęcie na odnowieniu' };
    }

    const effectiveCost = Math.floor(spell.manaCost * (1 - effectiveManaEfficiency.value / 100));
    if (mana.value < effectiveCost) {
      return { canCast: false, reason: `Brak many (${effectiveCost})` };
    }

    return { canCast: true };
  }

  function startCasting(spellId: string): boolean {
    const check = canCastSpell(spellId);
    if (!check.canCast) {
      gameStore.addNotification({
        type: 'warning',
        title: 'Nie można rzucić zaklęcia',
        message: check.reason || 'Nieznany błąd',
        icon: 'mdi-alert',
      });
      return false;
    }

    const spell = getSpell(spellId)!;
    const effectiveCost = Math.floor(spell.manaCost * (1 - effectiveManaEfficiency.value / 100));
    
    if (!consumeMana(effectiveCost)) return false;

    const castTime = Math.floor(spell.castTime / effectiveCastSpeed.value);

    activeCasting.value = {
      spellId,
      startTime: Date.now(),
      ticksRemaining: castTime,
      totalTicks: castTime,
    };

    return true;
  }

  function cancelCasting() {
    activeCasting.value = null;
  }

  function completeCasting() {
    if (!activeCasting.value) return;

    const spell = getSpell(activeCasting.value.spellId);
    if (!spell) {
      activeCasting.value = null;
      return;
    }

    // Calculate damage/effects
    const damage = calculateSpellDamage(spell, totalMagicPower.value, currentStaff.value?.elementBonus);
    totalDamageDealt.value += damage;

    // Add spell effects
    for (let i = 0; i < spell.effects.length; i++) {
      const effect = spell.effects[i];
      if (effect.duration) {
        activeSpellEffects.value.push({
          spellId: spell.id,
          effectIndex: i,
          expiresAt: Date.now() + effect.duration * 100,
        });
      }
    }

    // Set cooldown
    spellCooldowns.value.set(spell.id, Date.now() + spell.cooldown * 100);

    // XP and mastery
    addXp(spell.xpReward);
    addElementMastery(spell.element, spell.tier);

    // Stats
    totalSpellsCast.value++;

    gameStore.addNotification({
      type: 'success',
      title: `${spell.name}!`,
      message: damage > 0 ? `${damage} obrażeń` : 'Zaklęcie aktywne',
      icon: spell.icon,
      duration: 2000,
    });

    activeCasting.value = null;
  }

  function addElementMastery(element: MagicElement, amount: number) {
    const current = elementMastery.value.get(element) || 0;
    elementMastery.value.set(element, current + amount);
  }

  // ============================================
  // ACTIONS - RESEARCH
  // ============================================

  function canResearchSpell(spellId: string): { canResearch: boolean; reason?: string } {
    const spell = getSpell(spellId);
    if (!spell) return { canResearch: false, reason: 'Nieznane zaklęcie' };
    if (spell.researchCost === 0) return { canResearch: false, reason: 'Zaklęcie podstawowe' };
    if (researchedSpells.value.has(spellId)) return { canResearch: false, reason: 'Już zbadane' };
    if (spell.requiredLevel > progress.value.level) return { canResearch: false, reason: `Wymaga poziomu ${spell.requiredLevel}` };
    if (!resourcesStore.hasAmount('gold', spell.researchCost)) return { canResearch: false, reason: 'Brak złota' };

    return { canResearch: true };
  }

  function researchSpell(spellId: string): boolean {
    const check = canResearchSpell(spellId);
    if (!check.canResearch) return false;

    const spell = getSpell(spellId)!;
    resourcesStore.removeResource('gold', spell.researchCost);
    researchedSpells.value.add(spellId);

    gameStore.addNotification({
      type: 'success',
      title: 'Zaklęcie zbadane!',
      message: spell.name,
      icon: spell.icon,
      duration: 3000,
    });

    return true;
  }

  // ============================================
  // ACTIONS - EFFECTS
  // ============================================

  function processSpellEffects() {
    const now = Date.now();
    activeSpellEffects.value = activeSpellEffects.value.filter(e => e.expiresAt > now);
  }

  function processCooldowns() {
    const now = Date.now();
    for (const [spellId, expiresAt] of spellCooldowns.value) {
      if (expiresAt <= now) {
        spellCooldowns.value.delete(spellId);
      }
    }
  }

  function getSpellCooldownPercent(spellId: string): number {
    const spell = getSpell(spellId);
    if (!spell) return 0;
    
    const expiresAt = spellCooldowns.value.get(spellId);
    if (!expiresAt) return 100;
    
    const now = Date.now();
    if (expiresAt <= now) return 100;
    
    const remaining = expiresAt - now;
    const total = spell.cooldown * 100;
    return Math.max(0, 100 - (remaining / total) * 100);
  }

  // ============================================
  // ACTIONS - GAME LOOP
  // ============================================

  function processTick() {
    // Mana regen
    regenerateMana();

    // Casting progress
    if (activeCasting.value) {
      activeCasting.value.ticksRemaining--;
      if (activeCasting.value.ticksRemaining <= 0) {
        completeCasting();
      }
    }

    // Process effects and cooldowns
    processSpellEffects();
    processCooldowns();
  }

  // ============================================
  // SAVE/LOAD
  // ============================================

  function getState() {
    return {
      progress: progress.value,
      mana: mana.value,
      maxMana: maxMana.value,
      manaRegen: manaRegen.value,
      equippedStaff: equippedStaff.value,
      ownedStaffs: Array.from(ownedStaffs.value),
      researchedSpells: Array.from(researchedSpells.value),
      spellCooldowns: Array.from(spellCooldowns.value.entries()),
      activeSpellEffects: activeSpellEffects.value,
      elementMastery: Array.from(elementMastery.value.entries()),
      totalSpellsCast: totalSpellsCast.value,
      totalDamageDealt: totalDamageDealt.value,
      totalManaSpent: totalManaSpent.value,
    };
  }

  function loadState(state: ReturnType<typeof getState>) {
    if (state.progress) progress.value = state.progress;
    if (state.mana !== undefined) mana.value = state.mana;
    if (state.maxMana !== undefined) maxMana.value = state.maxMana;
    if (state.manaRegen !== undefined) manaRegen.value = state.manaRegen;
    if (state.equippedStaff !== undefined) equippedStaff.value = state.equippedStaff;
    if (state.ownedStaffs) ownedStaffs.value = new Set(state.ownedStaffs);
    if (state.researchedSpells) researchedSpells.value = new Set(state.researchedSpells);
    if (state.spellCooldowns) spellCooldowns.value = new Map(state.spellCooldowns);
    if (state.activeSpellEffects) activeSpellEffects.value = state.activeSpellEffects;
    if (state.elementMastery) elementMastery.value = new Map(state.elementMastery);
    if (state.totalSpellsCast !== undefined) totalSpellsCast.value = state.totalSpellsCast;
    if (state.totalDamageDealt !== undefined) totalDamageDealt.value = state.totalDamageDealt;
    if (state.totalManaSpent !== undefined) totalManaSpent.value = state.totalManaSpent;
  }

  function resetWizard() {
    progress.value = { level: 1, xp: 0, xpToNextLevel: 100, totalXp: 0 };
    mana.value = 100;
    maxMana.value = 100;
    manaRegen.value = 1;
    equippedStaff.value = 'wooden_staff';
    ownedStaffs.value = new Set(['wooden_staff']);
    researchedSpells.value = new Set(['fireball', 'water_bolt', 'wind_slash', 'arcane_missile']);
    activeCasting.value = null;
    spellCooldowns.value = new Map();
    activeSpellEffects.value = [];
    elementMastery.value = new Map([
      ['fire', 0], ['water', 0], ['earth', 0], ['air', 0], ['light', 0], ['dark', 0], ['arcane', 0],
    ]);
    totalSpellsCast.value = 0;
    totalDamageDealt.value = 0;
    totalManaSpent.value = 0;
  }

  // ============================================
  // DEV HELPERS
  // ============================================

  function devAddXp(amount: number) {
    addXp(amount);
  }

  function devUnlockAllStaffs() {
    for (const staffId of Object.keys(STAFFS)) {
      ownedStaffs.value.add(staffId);
    }
  }

  function devResearchAllSpells() {
    for (const spellId of Object.keys(SPELLS)) {
      researchedSpells.value.add(spellId);
    }
  }

  function devMaxMana() {
    mana.value = maxMana.value;
  }

  return {
    // State
    progress,
    mana,
    maxMana,
    manaRegen,
    equippedStaff,
    ownedStaffs,
    researchedSpells,
    activeCasting,
    spellCooldowns,
    activeSpellEffects,
    elementMastery,
    totalSpellsCast,
    totalDamageDealt,
    totalManaSpent,

    // Computed
    isCasting,
    castingProgress,
    currentStaff,
    availableSpells,
    totalMagicPower,
    effectiveManaEfficiency,
    effectiveCastSpeed,

    // XP
    addXp,
    getXpProgress,

    // Equipment
    buyStaff,
    equipStaff,

    // Spells
    canCastSpell,
    startCasting,
    cancelCasting,
    getSpellCooldownPercent,

    // Research
    canResearchSpell,
    researchSpell,

    // Game Loop
    processTick,

    // Save/Load
    getState,
    loadState,
    resetWizard,

    // Dev
    devAddXp,
    devUnlockAllStaffs,
    devResearchAllSpells,
    devMaxMana,
  };
}, {
  persist: {
    key: 'ateria-wizard',
    serializer: {
      serialize: (state) => {
        return JSON.stringify({
          ...state,
          ownedStaffs: Array.from(state.ownedStaffs || []),
          researchedSpells: Array.from(state.researchedSpells || []),
          spellCooldowns: Array.from(state.spellCooldowns?.entries?.() || []),
          elementMastery: Array.from(state.elementMastery?.entries?.() || []),
        });
      },
      deserialize: (value) => {
        const parsed = JSON.parse(value);
        return {
          ...parsed,
          ownedStaffs: new Set(parsed.ownedStaffs || []),
          researchedSpells: new Set(parsed.researchedSpells || []),
          spellCooldowns: new Map(parsed.spellCooldowns || []),
          elementMastery: new Map(parsed.elementMastery || []),
        };
      },
    },
  },
});
