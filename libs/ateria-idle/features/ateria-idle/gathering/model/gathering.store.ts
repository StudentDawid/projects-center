/**
 * Gathering Store - Mining, Woodcutting, Fishing, Herbalism
 * Manages skill levels, active gathering, tools, and resources
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { bn, Decimal } from '@shared/lib/big-number';
import { useAteriaGameStore } from '../../core/model/game.store';
import { useAteriaResourcesStore } from '../../core/model/resources.store';
import {
  GATHERING_SKILLS,
  ALL_GATHERING_RESOURCES,
  getGatheringResource,
  getAvailableResources,
  calculateGatherTime,
  calculateXpToLevel,
  type GatheringSkill,
  type GatheringResource,
} from '../data/gathering.data';
import {
  ALL_TOOLS,
  getTool,
  getToolsByType,
  calculateTotalPower,
  calculateGatheringBonus,
  type GatheringTool,
  type ToolType,
} from '../data/tools.data';

// ============================================
// TYPES
// ============================================

export interface SkillProgress {
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXp: number;
}

export interface ActiveGathering {
  skill: GatheringSkill;
  resourceId: string;
  startTime: number;
  gatherTime: number; // In ticks
  ticksRemaining: number;
  autoGather: boolean;
}

export interface GatheredItem {
  resourceId: string;
  amount: number;
  quality: number;
  timestamp: number;
}

// ============================================
// STORE
// ============================================

export const useAteriaGatheringStore = defineStore('ateria-gathering', () => {
  const gameStore = useAteriaGameStore();
  const resourcesStore = useAteriaResourcesStore();

  // ============================================
  // STATE
  // ============================================

  // Skill levels
  const skills = ref<Record<GatheringSkill, SkillProgress>>({
    mining: { level: 1, xp: 0, xpToNextLevel: 100, totalXp: 0 },
    woodcutting: { level: 1, xp: 0, xpToNextLevel: 100, totalXp: 0 },
    fishing: { level: 1, xp: 0, xpToNextLevel: 100, totalXp: 0 },
    herbalism: { level: 1, xp: 0, xpToNextLevel: 100, totalXp: 0 },
  });

  // Equipped tools
  const equippedTools = ref<Record<ToolType, string | null>>({
    pickaxe: null,
    axe: null,
    fishing_rod: null,
    sickle: null,
  });

  // Tool inventory (owned tools)
  const toolInventory = ref<Map<string, { tool: GatheringTool; durability: number; maxDurability: number }>>(new Map());

  // Active gathering (null if not gathering)
  const activeGathering = ref<ActiveGathering | null>(null);

  // Gathered items inventory
  const gatheredItems = ref<Map<string, number>>(new Map());

  // Stats
  const totalGathered = ref<Record<GatheringSkill, number>>({
    mining: 0,
    woodcutting: 0,
    fishing: 0,
    herbalism: 0,
  });

  const sessionGathered = ref<GatheredItem[]>([]);

  // Settings
  const autoGatherEnabled = ref(false);
  const selectedResource = ref<string | null>(null);

  // ============================================
  // COMPUTED
  // ============================================

  const isGathering = computed(() => activeGathering.value !== null);

  const gatheringProgress = computed(() => {
    if (!activeGathering.value) return 0;
    const total = activeGathering.value.gatherTime;
    const remaining = activeGathering.value.ticksRemaining;
    return ((total - remaining) / total) * 100;
  });

  const currentResource = computed(() => {
    if (!activeGathering.value) return null;
    return getGatheringResource(activeGathering.value.resourceId);
  });

  const equippedToolData = computed(() => {
    const tools: Record<ToolType, GatheringTool | null> = {
      pickaxe: null,
      axe: null,
      fishing_rod: null,
      sickle: null,
    };

    for (const [type, toolId] of Object.entries(equippedTools.value)) {
      if (toolId) {
        tools[type as ToolType] = getTool(toolId) || null;
      }
    }

    return tools;
  });

  // Get power for each skill
  const skillPowers = computed(() => {
    return {
      mining: calculateTotalPower(equippedToolData.value.pickaxe, skills.value.mining.level),
      woodcutting: calculateTotalPower(equippedToolData.value.axe, skills.value.woodcutting.level),
      fishing: calculateTotalPower(equippedToolData.value.fishing_rod, skills.value.fishing.level),
      herbalism: calculateTotalPower(equippedToolData.value.sickle, skills.value.herbalism.level),
    };
  });

  // Get available resources for each skill
  const availableResourcesBySkill = computed(() => {
    return {
      mining: getAvailableResources('mining', skills.value.mining.level, skillPowers.value.mining),
      woodcutting: getAvailableResources('woodcutting', skills.value.woodcutting.level, skillPowers.value.woodcutting),
      fishing: getAvailableResources('fishing', skills.value.fishing.level, skillPowers.value.fishing),
      herbalism: getAvailableResources('herbalism', skills.value.herbalism.level, skillPowers.value.herbalism),
    };
  });

  // ============================================
  // ACTIONS - XP & LEVELING
  // ============================================

  function addXp(skill: GatheringSkill, amount: number) {
    const skillData = skills.value[skill];
    skillData.xp += amount;
    skillData.totalXp += amount;

    // Level up check
    while (skillData.xp >= skillData.xpToNextLevel) {
      skillData.xp -= skillData.xpToNextLevel;
      skillData.level++;
      skillData.xpToNextLevel = calculateXpToLevel(skillData.level, skill);

      gameStore.addNotification({
        type: 'success',
        title: `${GATHERING_SKILLS[skill].name} - Poziom ${skillData.level}!`,
        message: 'Nowe zasoby i narzędzia dostępne!',
        icon: GATHERING_SKILLS[skill].icon,
        duration: 3000,
      });
    }
  }

  function getXpProgress(skill: GatheringSkill): number {
    const skillData = skills.value[skill];
    return (skillData.xp / skillData.xpToNextLevel) * 100;
  }

  // ============================================
  // ACTIONS - TOOLS
  // ============================================

  function addTool(toolId: string) {
    const tool = getTool(toolId);
    if (!tool) return false;

    const existing = toolInventory.value.get(toolId);
    if (existing) {
      // Refresh durability if already owned
      existing.durability = existing.maxDurability;
    } else {
      const maxDurability = 100 + tool.tier * 50;
      toolInventory.value.set(toolId, {
        tool,
        durability: maxDurability,
        maxDurability,
      });
    }

    return true;
  }

  function equipTool(toolId: string): boolean {
    const tool = getTool(toolId);
    if (!tool) return false;

    // Check if we own the tool
    if (!toolInventory.value.has(toolId)) return false;

    // Check level requirement
    const skill = tool.type === 'pickaxe' ? 'mining' :
                  tool.type === 'axe' ? 'woodcutting' :
                  tool.type === 'fishing_rod' ? 'fishing' : 'herbalism';

    if (skills.value[skill].level < tool.requiredLevel) {
      gameStore.addNotification({
        type: 'warning',
        title: 'Poziom zbyt niski',
        message: `Wymaga poziomu ${tool.requiredLevel} ${GATHERING_SKILLS[skill].name}`,
        icon: 'mdi-alert',
      });
      return false;
    }

    equippedTools.value[tool.type] = toolId;
    return true;
  }

  function unequipTool(type: ToolType) {
    equippedTools.value[type] = null;
  }

  function repairTool(toolId: string): boolean {
    const toolData = toolInventory.value.get(toolId);
    if (!toolData) return false;

    const repairCost = Math.floor((toolData.maxDurability - toolData.durability) * toolData.tool.tier * 2);
    if (!resourcesStore.hasAmount('gold', repairCost)) {
      gameStore.addNotification({
        type: 'warning',
        title: 'Brak złota',
        message: `Naprawa kosztuje ${repairCost} złota`,
        icon: 'mdi-currency-usd',
      });
      return false;
    }

    resourcesStore.removeResource('gold', repairCost);
    toolData.durability = toolData.maxDurability;
    return true;
  }

  function damageEquippedTool(skill: GatheringSkill) {
    const toolType: ToolType = skill === 'mining' ? 'pickaxe' :
                               skill === 'woodcutting' ? 'axe' :
                               skill === 'fishing' ? 'fishing_rod' : 'sickle';

    const toolId = equippedTools.value[toolType];
    if (!toolId) return;

    const toolData = toolInventory.value.get(toolId);
    if (!toolData) return;

    toolData.durability -= 1;

    if (toolData.durability <= 0) {
      unequipTool(toolType);
      gameStore.addNotification({
        type: 'warning',
        title: 'Narzędzie zniszczone!',
        message: `${toolData.tool.name} wymaga naprawy`,
        icon: 'mdi-hammer-wrench',
      });
    }
  }

  // ============================================
  // ACTIONS - GATHERING
  // ============================================

  function canGather(resourceId: string): { canGather: boolean; reason?: string } {
    const resource = getGatheringResource(resourceId);
    if (!resource) return { canGather: false, reason: 'Nieznany zasób' };

    const skill = resource.skill;
    const skillData = skills.value[skill];
    const power = skillPowers.value[skill];

    if (skillData.level < resource.requiredLevel) {
      return { canGather: false, reason: `Wymaga poziomu ${resource.requiredLevel}` };
    }

    if (power < resource.requiredPower) {
      return { canGather: false, reason: `Wymaga siły ${resource.requiredPower} (masz ${power})` };
    }

    return { canGather: true };
  }

  function startGathering(resourceId: string, autoGather: boolean = false): boolean {
    if (isGathering.value) {
      stopGathering();
    }

    const check = canGather(resourceId);
    if (!check.canGather) {
      gameStore.addNotification({
        type: 'warning',
        title: 'Nie można zbierać',
        message: check.reason || 'Nieznany błąd',
        icon: 'mdi-alert',
      });
      return false;
    }

    const resource = getGatheringResource(resourceId)!;
    const skill = resource.skill;
    const toolType: ToolType = skill === 'mining' ? 'pickaxe' :
                               skill === 'woodcutting' ? 'axe' :
                               skill === 'fishing' ? 'fishing_rod' : 'sickle';

    const tool = equippedToolData.value[toolType];
    const bonus = calculateGatheringBonus(tool);
    const gatherTime = calculateGatherTime(
      resource,
      skills.value[skill].level,
      skillPowers.value[skill],
      bonus.speedBonus
    );

    activeGathering.value = {
      skill,
      resourceId,
      startTime: Date.now(),
      gatherTime,
      ticksRemaining: gatherTime,
      autoGather,
    };

    selectedResource.value = resourceId;
    return true;
  }

  function stopGathering() {
    activeGathering.value = null;
  }

  function processGatheringTick() {
    if (!activeGathering.value) return;

    activeGathering.value.ticksRemaining--;

    if (activeGathering.value.ticksRemaining <= 0) {
      completeGathering();
    }
  }

  function completeGathering() {
    if (!activeGathering.value) return;

    const resource = getGatheringResource(activeGathering.value.resourceId);
    if (!resource) return;

    const skill = resource.skill;
    const toolType: ToolType = skill === 'mining' ? 'pickaxe' :
                               skill === 'woodcutting' ? 'axe' :
                               skill === 'fishing' ? 'fishing_rod' : 'sickle';

    const tool = equippedToolData.value[toolType];
    const bonus = calculateGatheringBonus(tool);

    // Calculate yield
    let amount = 1;
    if (Math.random() * 100 < bonus.yieldBonus) {
      amount += 1; // Bonus yield
    }

    // Check for rare find (better tier resource)
    let actualResourceId = resource.id;
    if (Math.random() * 100 < bonus.rareFindBonus) {
      // Find a higher tier resource
      const higherTierResources = Object.values(ALL_GATHERING_RESOURCES).filter(
        r => r.skill === skill && r.tier === resource.tier + 1
      );
      if (higherTierResources.length > 0) {
        const rareResource = higherTierResources[Math.floor(Math.random() * higherTierResources.length)];
        actualResourceId = rareResource.id;
        gameStore.addNotification({
          type: 'success',
          title: 'Rzadkie znalezisko!',
          message: `Znaleziono ${rareResource.name}!`,
          icon: 'mdi-diamond',
          duration: 3000,
        });
      }
    }

    // Add to inventory
    const currentAmount = gatheredItems.value.get(actualResourceId) || 0;
    gatheredItems.value.set(actualResourceId, currentAmount + amount);

    // Add XP
    addXp(skill, resource.xpReward);

    // Damage tool
    damageEquippedTool(skill);

    // Update stats
    totalGathered.value[skill] += amount;
    sessionGathered.value.push({
      resourceId: actualResourceId,
      amount,
      quality: 100,
      timestamp: Date.now(),
    });

    // Auto-gather or stop
    if (activeGathering.value.autoGather && autoGatherEnabled.value) {
      const resourceId = activeGathering.value.resourceId;
      startGathering(resourceId, true);
    } else {
      stopGathering();
    }
  }

  // ============================================
  // ACTIONS - INVENTORY
  // ============================================

  function getResourceCount(resourceId: string): number {
    return gatheredItems.value.get(resourceId) || 0;
  }

  function removeResource(resourceId: string, amount: number): boolean {
    const current = gatheredItems.value.get(resourceId) || 0;
    if (current < amount) return false;

    const newAmount = current - amount;
    if (newAmount <= 0) {
      gatheredItems.value.delete(resourceId);
    } else {
      gatheredItems.value.set(resourceId, newAmount);
    }
    return true;
  }

  function sellResource(resourceId: string, amount: number): boolean {
    const resource = getGatheringResource(resourceId);
    if (!resource) return false;

    if (!removeResource(resourceId, amount)) return false;

    const gold = resource.sellPrice * amount;
    resourcesStore.addResource('gold', gold);

    gameStore.addNotification({
      type: 'success',
      title: 'Sprzedano',
      message: `${amount}x ${resource.name} za ${gold} złota`,
      icon: 'mdi-currency-usd',
      duration: 2000,
    });

    return true;
  }

  function sellAllResources(skill?: GatheringSkill) {
    let totalGold = 0;
    let itemsSold = 0;

    for (const [resourceId, amount] of gatheredItems.value) {
      const resource = getGatheringResource(resourceId);
      if (!resource) continue;
      if (skill && resource.skill !== skill) continue;

      totalGold += resource.sellPrice * amount;
      itemsSold += amount;
      gatheredItems.value.delete(resourceId);
    }

    if (totalGold > 0) {
      resourcesStore.addResource('gold', totalGold);
      gameStore.addNotification({
        type: 'success',
        title: 'Sprzedano wszystko',
        message: `${itemsSold} przedmiotów za ${totalGold} złota`,
        icon: 'mdi-currency-usd',
      });
    }
  }

  // ============================================
  // ACTIONS - GAME LOOP
  // ============================================

  function processTick() {
    if (isGathering.value) {
      processGatheringTick();
    }
  }

  // ============================================
  // SAVE/LOAD
  // ============================================

  function getState() {
    return {
      skills: skills.value,
      equippedTools: equippedTools.value,
      toolInventory: Array.from(toolInventory.value.entries()),
      gatheredItems: Array.from(gatheredItems.value.entries()),
      totalGathered: totalGathered.value,
      autoGatherEnabled: autoGatherEnabled.value,
      selectedResource: selectedResource.value,
    };
  }

  function loadState(state: ReturnType<typeof getState>) {
    if (state.skills) skills.value = state.skills;
    if (state.equippedTools) equippedTools.value = state.equippedTools;
    if (state.toolInventory) toolInventory.value = new Map(state.toolInventory);
    if (state.gatheredItems) gatheredItems.value = new Map(state.gatheredItems);
    if (state.totalGathered) totalGathered.value = state.totalGathered;
    if (state.autoGatherEnabled !== undefined) autoGatherEnabled.value = state.autoGatherEnabled;
    if (state.selectedResource !== undefined) selectedResource.value = state.selectedResource;
  }

  function resetGathering() {
    skills.value = {
      mining: { level: 1, xp: 0, xpToNextLevel: 100, totalXp: 0 },
      woodcutting: { level: 1, xp: 0, xpToNextLevel: 100, totalXp: 0 },
      fishing: { level: 1, xp: 0, xpToNextLevel: 100, totalXp: 0 },
      herbalism: { level: 1, xp: 0, xpToNextLevel: 100, totalXp: 0 },
    };
    equippedTools.value = { pickaxe: null, axe: null, fishing_rod: null, sickle: null };
    toolInventory.value = new Map();
    gatheredItems.value = new Map();
    totalGathered.value = { mining: 0, woodcutting: 0, fishing: 0, herbalism: 0 };
    sessionGathered.value = [];
    activeGathering.value = null;
    autoGatherEnabled.value = false;
    selectedResource.value = null;
  }

  // ============================================
  // DEV HELPERS
  // ============================================

  function devAddXp(skill: GatheringSkill, amount: number) {
    addXp(skill, amount);
  }

  function devAddAllTools() {
    for (const toolId of Object.keys(ALL_TOOLS)) {
      addTool(toolId);
    }
  }

  function devAddResources() {
    for (const resourceId of Object.keys(ALL_GATHERING_RESOURCES)) {
      gatheredItems.value.set(resourceId, 100);
    }
  }

  return {
    // State
    skills,
    equippedTools,
    toolInventory,
    activeGathering,
    gatheredItems,
    totalGathered,
    sessionGathered,
    autoGatherEnabled,
    selectedResource,

    // Computed
    isGathering,
    gatheringProgress,
    currentResource,
    equippedToolData,
    skillPowers,
    availableResourcesBySkill,

    // XP & Leveling
    addXp,
    getXpProgress,

    // Tools
    addTool,
    equipTool,
    unequipTool,
    repairTool,

    // Gathering
    canGather,
    startGathering,
    stopGathering,
    processGatheringTick,

    // Inventory
    getResourceCount,
    removeResource,
    sellResource,
    sellAllResources,

    // Game Loop
    processTick,

    // Save/Load
    getState,
    loadState,
    resetGathering,

    // Dev
    devAddXp,
    devAddAllTools,
    devAddResources,
  };
}, {
  persist: {
    key: 'ateria-gathering',
    serializer: {
      serialize: (state) => {
        return JSON.stringify({
          ...state,
          toolInventory: Array.from(state.toolInventory?.entries?.() || []),
          gatheredItems: Array.from(state.gatheredItems?.entries?.() || []),
        });
      },
      deserialize: (value) => {
        const parsed = JSON.parse(value);
        return {
          ...parsed,
          toolInventory: new Map(parsed.toolInventory || []),
          gatheredItems: new Map(parsed.gatheredItems || []),
        };
      },
    },
  },
});
