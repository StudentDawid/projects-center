/**
 * Relic System Store
 * Manages collectible artifacts with unique effects
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Relic, RelicRarity, RelicEffect, RelicSlot, ResourceId } from '~/shared/types/game.types';
import { useResourceStore } from './resources';
import { useCombatStore } from './combat';
import { usePrestigeStore } from './prestige';

// Rarity colors for UI
export const RARITY_COLORS: Record<RelicRarity, string> = {
  common: '#9e9e9e', // gray
  rare: '#2196f3', // blue
  epic: '#9c27b0', // purple
  legendary: '#ffc107', // gold
};

export const RARITY_NAMES: Record<RelicRarity, string> = {
  common: 'Pospolita',
  rare: 'Rzadka',
  epic: 'Epicka',
  legendary: 'Legendarna',
};

// Rarity drop weights
const RARITY_WEIGHTS = {
  wave: { common: 70, rare: 25, epic: 4, legendary: 1 },
  boss: { common: 20, rare: 50, epic: 25, legendary: 5 },
  prestige: { common: 30, rare: 40, epic: 25, legendary: 5 },
};

// All available relics
const RELIC_DEFINITIONS: Omit<Relic, 'owned' | 'equipped'>[] = [
  // ===== LEGENDARNE =====
  {
    id: 'tear_of_solmar',
    name: 'Łza Solmara',
    description: '+50% regeneracji morale, morale nie spada poniżej 25',
    lore: 'Legendarna łza, którą Solmar uronił widząc cierpienia wiernych. Mówi się, że zawiera jego błogosławieństwo.',
    icon: '💧',
    rarity: 'legendary',
    effects: [
      { type: 'moraleRegenBonus', value: 50 },
      { type: 'moraleMinimum', value: 25 },
    ],
    source: 'boss',
  },
  {
    id: 'solmar_heart',
    name: 'Serce Solmara',
    description: '+100% produkcji Wiary, +25% wszystkich bonusów',
    lore: 'Fragment serca samego Solmara, pulsujący wiecznym światłem wiary.',
    icon: '❤️‍🔥',
    rarity: 'legendary',
    effects: [
      { type: 'productionMultiplier', targetId: 'faith', value: 100 },
      { type: 'allProductionMultiplier', value: 25 },
    ],
    source: 'achievement',
  },
  {
    id: 'crown_of_martyrs',
    name: 'Korona Męczenników',
    description: '+75% Popiołów z prestiżu, +30% obrony',
    lore: 'Korona spleciona z cierni męczenników. Noszący ją dzieli ich chwałę.',
    icon: '👑',
    rarity: 'legendary',
    effects: [
      { type: 'prestigeBonus', value: 75 },
      { type: 'defenseBonus', value: 30 },
    ],
    source: 'prestige',
  },

  // ===== EPICKIE =====
  {
    id: 'martyr_bone',
    name: 'Kość Męczennika',
    description: '+25% Popiołów z prestiżu',
    lore: 'Kość świętego, który oddał życie za wiarę. Emanuje spokojną siłą.',
    icon: '🦴',
    rarity: 'epic',
    effects: [{ type: 'prestigeBonus', value: 25 }],
    source: 'prestige',
  },
  {
    id: 'eternal_flame',
    name: 'Wieczny Płomień',
    description: '+40% produkcji Wiary, +20% regeneracji morale',
    lore: 'Płomień, który nigdy nie gaśnie. Darem jest od świętego Ignacego.',
    icon: '🔥',
    rarity: 'epic',
    effects: [
      { type: 'productionMultiplier', targetId: 'faith', value: 40 },
      { type: 'moraleRegenBonus', value: 20 },
    ],
    source: 'boss',
  },
  {
    id: 'shield_of_faith',
    name: 'Tarcza Wiary',
    description: '-35% obrażeń morale, +25% obrony',
    lore: 'Tarcza, która odpierała ataki heretyków przez tysiąc lat.',
    icon: '🛡️',
    rarity: 'epic',
    effects: [
      { type: 'moraleDamageReduction', value: 35 },
      { type: 'defenseBonus', value: 25 },
    ],
    source: 'wave',
  },
  {
    id: 'golden_censer',
    name: 'Złota Kadzielnica',
    description: '25% szansa na podwójne kliknięcie, +20% kliknięcia',
    lore: 'Kadzielnica z czystego złota, wypełniona świętym kadzidłem.',
    icon: '✨',
    rarity: 'epic',
    effects: [
      { type: 'doubleClickChance', value: 25 },
      { type: 'clickMultiplier', value: 20 },
    ],
    source: 'achievement',
  },
  {
    id: 'book_of_prophecies',
    name: 'Księga Proroctw',
    description: '+30% wszystkich produkcji, +10s czasu między falami',
    lore: 'Święta księga przepowiadająca nadejście zbawienia.',
    icon: '📖',
    rarity: 'epic',
    effects: [
      { type: 'allProductionMultiplier', value: 30 },
      { type: 'waveDelayBonus', value: 10 },
    ],
    source: 'boss',
  },

  // ===== RZADKIE =====
  {
    id: 'holy_chalice',
    name: 'Święty Kielich',
    description: '10% szansa na podwójne kliknięcie',
    lore: 'Kielich używany podczas świętych ceremonii. Mówi się, że błogosławi pijących.',
    icon: '🏆',
    rarity: 'rare',
    effects: [{ type: 'doubleClickChance', value: 10 }],
    source: 'wave',
  },
  {
    id: 'protection_medallion',
    name: 'Medalion Ochronny',
    description: '-15% obrażeń morale',
    lore: 'Medalion z wizerunkiem Solmara. Chroni przed złem.',
    icon: '🎖️',
    rarity: 'rare',
    effects: [{ type: 'moraleDamageReduction', value: 15 }],
    source: 'wave',
  },
  {
    id: 'blessed_rosary',
    name: 'Błogosławiony Różaniec',
    description: '+20% produkcji Wiary',
    lore: 'Różaniec z drewna świętego drzewa. Każdy paciorek to modlitwa.',
    icon: '📿',
    rarity: 'rare',
    effects: [{ type: 'productionMultiplier', targetId: 'faith', value: 20 }],
    source: 'wave',
  },
  {
    id: 'bell_of_warning',
    name: 'Dzwon Ostrzegawczy',
    description: '+5s czasu między falami',
    lore: 'Dzwon, który dźwięczy przed nadejściem zagrożenia.',
    icon: '🔔',
    rarity: 'rare',
    effects: [{ type: 'waveDelayBonus', value: 5 }],
    source: 'wave',
  },
  {
    id: 'holy_water_vial',
    name: 'Fiolka Święconej Wody',
    description: '+15% obrony, +10% regeneracji morale',
    lore: 'Woda pobłogosławiona przez arcybiskupa. Oczyszcza i chroni.',
    icon: '💎',
    rarity: 'rare',
    effects: [
      { type: 'defenseBonus', value: 15 },
      { type: 'moraleRegenBonus', value: 10 },
    ],
    source: 'boss',
  },
  {
    id: 'pilgrim_staff',
    name: 'Laska Pielgrzyma',
    description: '+15% kliknięcia, +10% produkcji Dukatów',
    lore: 'Laska noszona przez pielgrzymów wędrujących do świątyni.',
    icon: '🪄',
    rarity: 'rare',
    effects: [
      { type: 'clickMultiplier', value: 15 },
      { type: 'productionMultiplier', targetId: 'ducats', value: 10 },
    ],
    source: 'wave',
  },

  // ===== POSPOLITE =====
  {
    id: 'flame_stone',
    name: 'Kamień Płomienia',
    description: '+10% produkcji Wiary',
    lore: 'Prosty kamień, który tli się wewnętrznym ciepłem wiary.',
    icon: '🪨',
    rarity: 'common',
    effects: [{ type: 'productionMultiplier', targetId: 'faith', value: 10 }],
    source: 'wave',
  },
  {
    id: 'prayer_beads',
    name: 'Korale Modlitewne',
    description: '+5% kliknięcia',
    lore: 'Proste korale używane podczas modlitw. Pomagają skupić umysł.',
    icon: '📿',
    rarity: 'common',
    effects: [{ type: 'clickMultiplier', value: 5 }],
    source: 'wave',
  },
  {
    id: 'holy_symbol',
    name: 'Święty Symbol',
    description: '+5% regeneracji morale',
    lore: 'Niewielki symbol wiary. Przynosi pocieszenie w trudnych chwilach.',
    icon: '✝️',
    rarity: 'common',
    effects: [{ type: 'moraleRegenBonus', value: 5 }],
    source: 'wave',
  },
  {
    id: 'iron_cross',
    name: 'Żelazny Krzyż',
    description: '+5% obrony',
    lore: 'Prosty żelazny krzyż. Twardy jak wiara jego nosiciela.',
    icon: '⚔️',
    rarity: 'common',
    effects: [{ type: 'defenseBonus', value: 5 }],
    source: 'wave',
  },
  {
    id: 'blessed_coin',
    name: 'Błogosławiona Moneta',
    description: '+10% produkcji Dukatów',
    lore: 'Moneta pobłogosławiona przez kapłana. Przyciąga bogactwo.',
    icon: '🪙',
    rarity: 'common',
    effects: [{ type: 'productionMultiplier', targetId: 'ducats', value: 10 }],
    source: 'wave',
  },
  {
    id: 'incense_pouch',
    name: 'Sakiewka Kadzidła',
    description: '+5% wszystkich produkcji',
    lore: 'Woreczek z aromatycznym kadzidłem. Zapach wznosi się ku niebu.',
    icon: '👝',
    rarity: 'common',
    effects: [{ type: 'allProductionMultiplier', value: 5 }],
    source: 'wave',
  },
  {
    id: 'worn_scriptures',
    name: 'Zużyte Pisma',
    description: '-5% obrażeń morale',
    lore: 'Stare, zużyte pisma święte. Słowa wciąż przynoszą otuchę.',
    icon: '📜',
    rarity: 'common',
    effects: [{ type: 'moraleDamageReduction', value: 5 }],
    source: 'wave',
  },
  {
    id: 'simple_relic',
    name: 'Prosta Relikwia',
    description: '+3% Popiołów z prestiżu',
    lore: 'Mały fragment świętości. Niewielki, ale cenny.',
    icon: '🔮',
    rarity: 'common',
    effects: [{ type: 'prestigeBonus', value: 3 }],
    source: 'prestige',
  },
];

export const useRelicStore = defineStore(
  'relics',
  () => {
    // ========== STATE ==========
    const relics = ref<Relic[]>(
      RELIC_DEFINITIONS.map((def) => ({
        ...def,
        owned: false,
        equipped: false,
      }))
    );

    const slots = ref<RelicSlot[]>([
      { index: 0, relicId: null, unlocked: true },
      { index: 1, relicId: null, unlocked: true },
      { index: 2, relicId: null, unlocked: true },
      { index: 3, relicId: null, unlocked: false }, // Unlock via prestige
      { index: 4, relicId: null, unlocked: false }, // Unlock via prestige
    ]);

    const pendingRelic = ref<Relic | null>(null); // Relic waiting to be claimed
    const lastDropWave = ref(0);

    // ========== COMPUTED ==========
    const ownedRelics = computed(() => relics.value.filter((r) => r.owned));

    const equippedRelics = computed(() =>
      relics.value.filter((r) => r.equipped)
    );

    const unlockedSlots = computed(() => slots.value.filter((s) => s.unlocked));

    const availableSlots = computed(
      () => unlockedSlots.value.filter((s) => s.relicId === null).length
    );

    // Calculate total bonuses from equipped relics
    const totalBonuses = computed(() => {
      const bonuses = {
        productionMultipliers: {} as Partial<Record<ResourceId, number>>,
        clickMultiplier: 0,
        defenseBonus: 0,
        moraleRegenBonus: 0,
        moraleDamageReduction: 0,
        prestigeBonus: 0,
        moraleMinimum: 0,
        doubleClickChance: 0,
        waveDelayBonus: 0,
        criticalClickChance: 0,
        allProductionMultiplier: 0,
      };

      for (const relic of equippedRelics.value) {
        for (const effect of relic.effects) {
          switch (effect.type) {
            case 'productionMultiplier':
              if (effect.targetId) {
                const current = bonuses.productionMultipliers[effect.targetId] || 0;
                bonuses.productionMultipliers[effect.targetId] = current + effect.value;
              }
              break;
            case 'clickMultiplier':
              bonuses.clickMultiplier += effect.value;
              break;
            case 'defenseBonus':
              bonuses.defenseBonus += effect.value;
              break;
            case 'moraleRegenBonus':
              bonuses.moraleRegenBonus += effect.value;
              break;
            case 'moraleDamageReduction':
              bonuses.moraleDamageReduction += effect.value;
              break;
            case 'prestigeBonus':
              bonuses.prestigeBonus += effect.value;
              break;
            case 'moraleMinimum':
              bonuses.moraleMinimum = Math.max(bonuses.moraleMinimum, effect.value);
              break;
            case 'doubleClickChance':
              bonuses.doubleClickChance += effect.value;
              break;
            case 'waveDelayBonus':
              bonuses.waveDelayBonus += effect.value;
              break;
            case 'criticalClickChance':
              bonuses.criticalClickChance += effect.value;
              break;
            case 'allProductionMultiplier':
              bonuses.allProductionMultiplier += effect.value;
              break;
          }
        }
      }

      return bonuses;
    });

    // ========== ACTIONS ==========

    /**
     * Roll a random rarity based on source weights
     */
    function rollRarity(source: 'wave' | 'boss' | 'prestige'): RelicRarity {
      const weights = RARITY_WEIGHTS[source];
      const total = Object.values(weights).reduce((a, b) => a + b, 0);
      let roll = Math.random() * total;

      for (const [rarity, weight] of Object.entries(weights)) {
        roll -= weight;
        if (roll <= 0) {
          return rarity as RelicRarity;
        }
      }

      return 'common';
    }

    /**
     * Get a random relic of a specific rarity that isn't already owned
     */
    function getRandomUnownedRelic(rarity: RelicRarity, source: 'wave' | 'boss' | 'prestige'): Relic | null {
      const candidates = relics.value.filter(
        (r) => !r.owned && r.rarity === rarity && r.source === source
      );

      // If no relics of this rarity/source, try any source
      if (candidates.length === 0) {
        const fallback = relics.value.filter(
          (r) => !r.owned && r.rarity === rarity
        );
        if (fallback.length === 0) return null;
        return fallback[Math.floor(Math.random() * fallback.length)];
      }

      return candidates[Math.floor(Math.random() * candidates.length)];
    }

    /**
     * Try to drop a relic after a wave
     */
    function tryDropRelic(waveNumber: number): Relic | null {
      // Boss waves every 25 waves
      const isBossWave = waveNumber % 25 === 0;
      // Regular drops every 10 waves
      const isDropWave = waveNumber % 10 === 0;

      if (!isBossWave && !isDropWave) return null;
      if (waveNumber <= lastDropWave.value) return null;

      const source = isBossWave ? 'boss' : 'wave';
      const rarity = rollRarity(source);
      const relic = getRandomUnownedRelic(rarity, source);

      if (relic) {
        lastDropWave.value = waveNumber;
        pendingRelic.value = relic;
        return relic;
      }

      return null;
    }

    /**
     * Give relics from prestige (1 per 10 ashes)
     */
    function grantPrestigeRelics(ashesGained: number): Relic[] {
      const relicsToGrant = Math.floor(ashesGained / 10);
      const granted: Relic[] = [];

      for (let i = 0; i < relicsToGrant; i++) {
        const rarity = rollRarity('prestige');
        const relic = getRandomUnownedRelic(rarity, 'prestige');
        if (relic) {
          relic.owned = true;
          granted.push(relic);
        }
      }

      return granted;
    }

    /**
     * Claim the pending relic
     */
    function claimPendingRelic(): boolean {
      if (!pendingRelic.value) return false;

      const relic = relics.value.find((r) => r.id === pendingRelic.value!.id);
      if (relic) {
        relic.owned = true;
        pendingRelic.value = null;
        return true;
      }

      return false;
    }

    /**
     * Dismiss the pending relic without claiming
     */
    function dismissPendingRelic(): void {
      pendingRelic.value = null;
    }

    /**
     * Equip a relic to a slot
     */
    function equipRelic(relicId: string): boolean {
      const relic = relics.value.find((r) => r.id === relicId);
      if (!relic || !relic.owned || relic.equipped) return false;

      const availableSlot = slots.value.find((s) => s.unlocked && s.relicId === null);
      if (!availableSlot) return false;

      relic.equipped = true;
      availableSlot.relicId = relicId;
      applyRelicEffects();
      return true;
    }

    /**
     * Unequip a relic from its slot
     */
    function unequipRelic(relicId: string): boolean {
      const relic = relics.value.find((r) => r.id === relicId);
      if (!relic || !relic.equipped) return false;

      const slot = slots.value.find((s) => s.relicId === relicId);
      if (slot) {
        slot.relicId = null;
      }

      relic.equipped = false;
      applyRelicEffects();
      return true;
    }

    /**
     * Unlock an additional slot (from prestige upgrade)
     */
    function unlockSlot(index: number): boolean {
      const slot = slots.value.find((s) => s.index === index);
      if (!slot || slot.unlocked) return false;

      slot.unlocked = true;
      return true;
    }

    /**
     * Apply relic effects to other stores
     */
    function applyRelicEffects(): void {
      const resourceStore = useResourceStore();
      const combatStore = useCombatStore();
      const prestigeStore = usePrestigeStore();

      const bonuses = totalBonuses.value;

      // Apply production multipliers
      resourceStore.relicProductionMultipliers = bonuses.productionMultipliers;
      resourceStore.relicAllProductionMultiplier = 1 + bonuses.allProductionMultiplier / 100;
      resourceStore.relicClickMultiplier = 1 + bonuses.clickMultiplier / 100;
      resourceStore.relicDoubleClickChance = bonuses.doubleClickChance / 100;

      // Apply combat bonuses
      combatStore.relicDefenseBonus = bonuses.defenseBonus;
      combatStore.relicMoraleRegenBonus = bonuses.moraleRegenBonus / 100;
      combatStore.relicMoraleDamageReduction = bonuses.moraleDamageReduction / 100;
      combatStore.relicMoraleMinimum = bonuses.moraleMinimum;
      combatStore.relicWaveDelayBonus = bonuses.waveDelayBonus;

      // Apply prestige bonus
      prestigeStore.relicPrestigeBonus = 1 + bonuses.prestigeBonus / 100;
    }

    /**
     * Grant a specific relic (for achievements)
     */
    function grantRelic(relicId: string): boolean {
      const relic = relics.value.find((r) => r.id === relicId);
      if (!relic || relic.owned) return false;

      relic.owned = true;
      return true;
    }

    /**
     * Reset for prestige (keep relics, reset equipped state based on slots)
     */
    function resetForPrestige(): void {
      // Relics stay owned, but unequip all
      for (const relic of relics.value) {
        relic.equipped = false;
      }
      for (const slot of slots.value) {
        slot.relicId = null;
      }
      pendingRelic.value = null;
      lastDropWave.value = 0;
    }

    /**
     * Get relic by ID
     */
    function getRelicById(id: string): Relic | undefined {
      return relics.value.find((r) => r.id === id);
    }

    return {
      // State
      relics,
      slots,
      pendingRelic,
      lastDropWave,

      // Computed
      ownedRelics,
      equippedRelics,
      unlockedSlots,
      availableSlots,
      totalBonuses,

      // Actions
      rollRarity,
      tryDropRelic,
      grantPrestigeRelics,
      claimPendingRelic,
      dismissPendingRelic,
      equipRelic,
      unequipRelic,
      unlockSlot,
      applyRelicEffects,
      grantRelic,
      resetForPrestige,
      getRelicById,
    };
  },
  {
    persist: {
      pick: ['relics', 'slots', 'lastDropWave'],
    },
  }
);

