/**
 * Scientist Store - manages the Scientist path
 * Handles research, alchemy, and golem automation
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { bn, Decimal } from '~/shared/lib/big-number';
import { useAteriaResourcesStore } from '../../core/model/resources.store';
import { useAteriaGameStore } from '../../core/model/game.store';
import type {
  ScientistStats,
  FlaskState,
  ResearchProgress,
  AlchemyLab,
  ProductionSlot,
  Workshop,
  Golem,
  GolemState,
  PotionAllocation,
  AllocationMode,
} from '~/entities/ateria-idle/scientist';
import {
  RESEARCH,
  POTIONS,
  GOLEM_BLUEPRINTS,
  getResearch,
  getPotion,
  getGolemBlueprint,
} from '../../data/scientist.data';

// ============================================
// CONSTANTS
// ============================================

const BASE_XP_PER_LEVEL = 120;
const XP_SCALING = 1.12;
const BASE_RED_FLASK_PRODUCTION = 0.1; // Per tick
const GREEN_FLASK_COST = 5; // Red flasks per green
const BLUE_FLASK_COST = 5; // Green flasks per blue

const BASE_STATS: ScientistStats = {
  level: 1,
  xp: bn(0),
  xpToNextLevel: bn(BASE_XP_PER_LEVEL),
  intellect: 10,
  efficiency: 10,
  creativity: 10,
  researchSpeedMultiplier: 1,
  potionQualityMultiplier: 1,
  golemEfficiencyMultiplier: 1,
};

// ============================================
// STORE
// ============================================

export const useAteriaScientistStore = defineStore('ateria-scientist', () => {
  const resourcesStore = useAteriaResourcesStore();
  const gameStore = useAteriaGameStore();

  // ============================================
  // STATE
  // ============================================

  // Stats
  const stats = ref<ScientistStats>({ ...BASE_STATS });

  // Flasks
  const flasks = ref<FlaskState>({
    red: 10,
    green: 0,
    blue: 0,
    redPerSecond: BASE_RED_FLASK_PRODUCTION,
    greenPerSecond: 0,
    bluePerSecond: 0,
  });

  // Unlocks
  const greenFlasksUnlocked = ref(false);
  const blueFlasksUnlocked = ref(false);
  const alchemyUnlocked = ref(false);
  const golemsUnlocked = ref(false);

  // Research
  const researchProgress = ref<Map<string, ResearchProgress>>(new Map());
  const activeResearchId = ref<string | null>(null);
  const completedResearch = ref<string[]>([]);

  // Alchemy Lab
  const alchemyLab = ref<AlchemyLab>({
    level: 1,
    maxProductionSlots: 1,
    productionSlots: [
      { slotId: 0, recipeId: null, progress: 0, isActive: false, autoRepeat: true },
    ],
    discoveredRecipes: ['health_potion_small'],
    ingredientStorage: {},
  });

  // Potion Inventory & Allocation
  const potionInventory = ref<Map<string, number>>(new Map());
  const potionAllocations = ref<Map<string, PotionAllocation>>(new Map());
  const allocationMode = ref<AllocationMode>('balanced');

  // Workshop & Golems
  const workshop = ref<Workshop>({
    level: 1,
    maxGolemSlots: 0,
    golems: [],
    autoRepairEnabled: false,
    autoRepairThreshold: 50,
  });

  // Session stats
  const sessionFlasksProduced = ref({ red: 0, green: 0, blue: 0 });
  const sessionPotionsCrafted = ref(0);
  const sessionResearchCompleted = ref(0);

  // ============================================
  // COMPUTED
  // ============================================

  const xpProgress = computed(() => {
    if (stats.value.xpToNextLevel.eq(0)) return 0;
    return stats.value.xp.div(stats.value.xpToNextLevel).toNumber();
  });

  const effectiveResearchSpeed = computed(() => {
    let speed = stats.value.researchSpeedMultiplier;

    // Add bonuses from research
    const researchSpeedBonus = getResearchBonus('research', 'speed_bonus');
    speed *= 1 + researchSpeedBonus / 100;

    // Add golem bonus
    const researchGolem = workshop.value.golems.find(
      g => g.type === 'research' && g.state === 'working'
    );
    if (researchGolem) {
      const blueprint = getGolemBlueprint(researchGolem.type + '_golem');
      if (blueprint) {
        speed *= 1 + blueprint.workEffect.baseValue * researchGolem.efficiency;
      }
    }

    return speed;
  });

  const effectiveAlchemySpeed = computed(() => {
    let speed = 1;

    // Add potion efficiency research bonus
    const potionBonus = getResearchBonus('potion', 'production_bonus');
    speed *= 1 + potionBonus / 100;

    // Add golem bonus
    const alchemyGolem = workshop.value.golems.find(
      g => g.type === 'alchemy' && g.state === 'working'
    );
    if (alchemyGolem) {
      const blueprint = getGolemBlueprint('alchemy_golem');
      if (blueprint) {
        speed *= 1 + blueprint.workEffect.baseValue * alchemyGolem.efficiency;
      }
    }

    return speed;
  });

  const availableResearchList = computed(() => {
    return Object.values(RESEARCH).filter(r => {
      if (r.requiredLevel > stats.value.level) return false;
      if (r.requiredResearch.some(req => !completedResearch.value.includes(req))) return false;
      // Check if already at max level
      const progress = researchProgress.value.get(r.id);
      if (progress && progress.currentLevel >= r.maxLevel) return false;
      return true;
    });
  });

  const discoveredPotions = computed(() => {
    return Object.values(POTIONS).filter(p =>
      alchemyLab.value.discoveredRecipes.includes(p.id)
    );
  });

  const availableGolems = computed(() => {
    return Object.values(GOLEM_BLUEPRINTS).filter(g => {
      if (g.requiredLevel > stats.value.level) return false;
      if (g.requiredResearch && !completedResearch.value.includes(g.requiredResearch)) return false;
      return true;
    });
  });

  const activeGolems = computed(() => {
    return workshop.value.golems.filter(g => g.state === 'working');
  });

  // ============================================
  // ACTIONS - XP & LEVELING
  // ============================================

  function calculateXpToLevel(level: number): Decimal {
    return bn(BASE_XP_PER_LEVEL).mul(Decimal.pow(XP_SCALING, level));
  }

  function addXp(amount: Decimal | number) {
    const amountDecimal = amount instanceof Decimal ? amount : bn(amount);
    stats.value.xp = stats.value.xp.add(amountDecimal);

    while (stats.value.xp.gte(stats.value.xpToNextLevel)) {
      levelUp();
    }
  }

  function levelUp() {
    stats.value.xp = stats.value.xp.sub(stats.value.xpToNextLevel);
    stats.value.level++;
    stats.value.xpToNextLevel = calculateXpToLevel(stats.value.level);

    // Increase stats
    stats.value.intellect += 2;
    stats.value.efficiency += 1;
    stats.value.creativity += 1;
    stats.value.researchSpeedMultiplier += 0.02;
    stats.value.potionQualityMultiplier += 0.01;

    // Add production slot at level 5, 10, 15
    if (stats.value.level === 5 || stats.value.level === 10 || stats.value.level === 15) {
      addProductionSlot();
    }

    gameStore.addNotification({
      type: 'success',
      title: 'Awans Naukowca!',
      message: `Naukowiec osiągnął poziom ${stats.value.level}!`,
      icon: 'mdi-flask',
    });
  }

  // ============================================
  // ACTIONS - FLASKS
  // ============================================

  function produceFlasks() {
    // Red flasks (always produced)
    const redProduction = flasks.value.redPerSecond / 10; // Per tick (10 ticks/sec)
    flasks.value.red += redProduction;
    sessionFlasksProduced.value.red += redProduction;

    // Green flasks (if unlocked and have red)
    if (greenFlasksUnlocked.value && flasks.value.greenPerSecond > 0) {
      const greenProduction = flasks.value.greenPerSecond / 10;
      const redCost = greenProduction * GREEN_FLASK_COST;
      if (flasks.value.red >= redCost) {
        flasks.value.red -= redCost;
        flasks.value.green += greenProduction;
        sessionFlasksProduced.value.green += greenProduction;
      }
    }

    // Blue flasks (if unlocked and have green)
    if (blueFlasksUnlocked.value && flasks.value.bluePerSecond > 0) {
      const blueProduction = flasks.value.bluePerSecond / 10;
      const greenCost = blueProduction * BLUE_FLASK_COST;
      if (flasks.value.green >= greenCost) {
        flasks.value.green -= greenCost;
        flasks.value.blue += blueProduction;
        sessionFlasksProduced.value.blue += blueProduction;
      }
    }
  }

  function convertFlasks(from: 'red' | 'green', amount: number): boolean {
    if (from === 'red') {
      if (!greenFlasksUnlocked.value) return false;
      const cost = amount * GREEN_FLASK_COST;
      if (flasks.value.red < cost) return false;
      flasks.value.red -= cost;
      flasks.value.green += amount;
      return true;
    } else if (from === 'green') {
      if (!blueFlasksUnlocked.value) return false;
      const cost = amount * BLUE_FLASK_COST;
      if (flasks.value.green < cost) return false;
      flasks.value.green -= cost;
      flasks.value.blue += amount;
      return true;
    }
    return false;
  }

  // ============================================
  // ACTIONS - RESEARCH
  // ============================================

  function startResearch(researchId: string): boolean {
    const research = getResearch(researchId);
    if (!research) return false;

    // Check level
    if (research.requiredLevel > stats.value.level) return false;

    // Check prerequisites
    if (research.requiredResearch.some(req => !completedResearch.value.includes(req))) {
      return false;
    }

    // Check if already at max
    let progress = researchProgress.value.get(researchId);
    if (progress && progress.currentLevel >= research.maxLevel) return false;

    // Initialize progress if needed
    if (!progress) {
      progress = {
        researchId,
        currentLevel: 0,
        currentProgress: 0,
        isActive: false,
      };
      researchProgress.value.set(researchId, progress);
    }

    // Deactivate previous research
    if (activeResearchId.value) {
      const oldProgress = researchProgress.value.get(activeResearchId.value);
      if (oldProgress) oldProgress.isActive = false;
    }

    // Activate new research
    progress.isActive = true;
    activeResearchId.value = researchId;

    return true;
  }

  function processResearch() {
    if (!activeResearchId.value) return;

    const progress = researchProgress.value.get(activeResearchId.value);
    if (!progress || !progress.isActive) return;

    const research = getResearch(activeResearchId.value);
    if (!research) return;

    // Calculate cost for current level
    const effectiveLevel = progress.currentLevel < research.softCapLevel
      ? progress.currentLevel
      : research.softCapLevel + Math.sqrt(progress.currentLevel - research.softCapLevel);

    const cost = research.baseCost * Math.pow(research.costMultiplier, effectiveLevel);

    // Check flask requirements
    const hasFlasks =
      (!research.requiredFlasks.red || flasks.value.red >= research.requiredFlasks.red * 0.01) &&
      (!research.requiredFlasks.green || flasks.value.green >= research.requiredFlasks.green * 0.01) &&
      (!research.requiredFlasks.blue || flasks.value.blue >= research.requiredFlasks.blue * 0.01);

    if (!hasFlasks) return;

    // Consume flasks and add progress
    const progressRate = (effectiveResearchSpeed.value / cost) * 0.01; // Per tick

    if (research.requiredFlasks.red) {
      flasks.value.red -= research.requiredFlasks.red * progressRate * 0.1;
    }
    if (research.requiredFlasks.green) {
      flasks.value.green -= research.requiredFlasks.green * progressRate * 0.1;
    }
    if (research.requiredFlasks.blue) {
      flasks.value.blue -= research.requiredFlasks.blue * progressRate * 0.1;
    }

    progress.currentProgress += progressRate;

    // Check for level completion
    if (progress.currentProgress >= 1) {
      progress.currentProgress = 0;
      progress.currentLevel++;
      sessionResearchCompleted.value++;

      // Add XP
      addXp(research.baseCost * 0.5);

      // Apply effects
      applyResearchEffects(research, progress.currentLevel);

      // Check if completed
      if (progress.currentLevel >= research.maxLevel) {
        completedResearch.value.push(research.id);
        progress.isActive = false;
        activeResearchId.value = null;

        gameStore.addNotification({
          type: 'success',
          title: 'Badanie Ukończone!',
          message: `${research.name} osiągnęło maksymalny poziom`,
          icon: research.icon,
        });
      } else {
        gameStore.addNotification({
          type: 'info',
          title: 'Poziom Badania!',
          message: `${research.name} → Poziom ${progress.currentLevel}`,
          icon: research.icon,
          duration: 2000,
        });
      }
    }
  }

  function applyResearchEffects(research: typeof RESEARCH[string], level: number) {
    for (const effect of research.effects) {
      if (effect.type === 'unlock_feature') {
        switch (effect.target) {
          case 'green_flasks':
            greenFlasksUnlocked.value = true;
            flasks.value.greenPerSecond = 0.05;
            break;
          case 'blue_flasks':
            blueFlasksUnlocked.value = true;
            flasks.value.bluePerSecond = 0.02;
            break;
          case 'alchemy':
            alchemyUnlocked.value = true;
            break;
          case 'golems':
            golemsUnlocked.value = true;
            workshop.value.maxGolemSlots = 1;
            break;
          case 'combat_golem':
            // Unlock is handled by research prereqs
            break;
          case 'auto_repair':
            workshop.value.autoRepairEnabled = true;
            break;
        }
      } else if (effect.type === 'flask_production') {
        if (effect.target === 'red') {
          flasks.value.redPerSecond += effect.valuePerLevel;
        } else if (effect.target === 'green') {
          flasks.value.greenPerSecond += effect.valuePerLevel;
        } else if (effect.target === 'blue') {
          flasks.value.bluePerSecond += effect.valuePerLevel;
        }
      } else if (effect.type === 'golem_slot') {
        workshop.value.maxGolemSlots++;
      }
    }
  }

  function getResearchBonus(target: string, effectType: string): number {
    let bonus = 0;

    for (const [researchId, progress] of researchProgress.value) {
      if (progress.currentLevel === 0) continue;

      const research = getResearch(researchId);
      if (!research) continue;

      for (const effect of research.effects) {
        if (effect.type === effectType && effect.target.includes(target)) {
          bonus += effect.value + effect.valuePerLevel * (progress.currentLevel - 1);
        }
      }
    }

    return bonus;
  }

  // ============================================
  // ACTIONS - ALCHEMY
  // ============================================

  function addProductionSlot() {
    alchemyLab.value.maxProductionSlots++;
    alchemyLab.value.productionSlots.push({
      slotId: alchemyLab.value.productionSlots.length,
      recipeId: null,
      progress: 0,
      isActive: false,
      autoRepeat: true,
    });
  }

  function startProduction(slotId: number, recipeId: string): boolean {
    if (!alchemyUnlocked.value) return false;

    const slot = alchemyLab.value.productionSlots.find(s => s.slotId === slotId);
    if (!slot) return false;

    const recipe = getPotion(recipeId);
    if (!recipe) return false;

    // Check if discovered
    if (!alchemyLab.value.discoveredRecipes.includes(recipeId)) return false;

    // Check ingredients
    for (const ing of recipe.ingredients) {
      const stored = alchemyLab.value.ingredientStorage[ing.ingredientId] || 0;
      if (stored < ing.amount) return false;
    }

    // Consume ingredients
    for (const ing of recipe.ingredients) {
      alchemyLab.value.ingredientStorage[ing.ingredientId] -= ing.amount;
    }

    slot.recipeId = recipeId;
    slot.progress = 0;
    slot.isActive = true;

    return true;
  }

  function processAlchemy() {
    if (!alchemyUnlocked.value) return;

    for (const slot of alchemyLab.value.productionSlots) {
      if (!slot.isActive || !slot.recipeId) continue;

      const recipe = getPotion(slot.recipeId);
      if (!recipe) continue;

      // Add progress
      const progressRate = (effectiveAlchemySpeed.value / recipe.craftTime);
      slot.progress += progressRate;

      // Check completion
      if (slot.progress >= 1) {
        // Add potions to inventory
        const current = potionInventory.value.get(recipe.id) || 0;
        const amount = Math.floor(recipe.outputAmount * stats.value.potionQualityMultiplier);
        potionInventory.value.set(recipe.id, current + amount);
        sessionPotionsCrafted.value += amount;

        // Add XP
        addXp(recipe.tier * 5);

        gameStore.addNotification({
          type: 'success',
          title: 'Mikstura Ukończona!',
          message: `Wyprodukowano ${amount}x ${recipe.name}`,
          icon: recipe.icon,
          duration: 2000,
        });

        // Auto-repeat or stop
        if (slot.autoRepeat) {
          // Check if can restart
          let canRestart = true;
          for (const ing of recipe.ingredients) {
            const stored = alchemyLab.value.ingredientStorage[ing.ingredientId] || 0;
            if (stored < ing.amount) {
              canRestart = false;
              break;
            }
          }

          if (canRestart) {
            // Consume ingredients
            for (const ing of recipe.ingredients) {
              alchemyLab.value.ingredientStorage[ing.ingredientId] -= ing.amount;
            }
            slot.progress = 0;
          } else {
            slot.isActive = false;
            slot.progress = 0;
          }
        } else {
          slot.isActive = false;
          slot.progress = 0;
        }
      }
    }
  }

  function addIngredient(ingredientId: string, amount: number) {
    const current = alchemyLab.value.ingredientStorage[ingredientId] || 0;
    alchemyLab.value.ingredientStorage[ingredientId] = current + amount;
  }

  function discoverRecipe(recipeId: string): boolean {
    if (alchemyLab.value.discoveredRecipes.includes(recipeId)) return false;

    const recipe = getPotion(recipeId);
    if (!recipe) return false;

    alchemyLab.value.discoveredRecipes.push(recipeId);

    gameStore.addNotification({
      type: 'achievement',
      title: 'Nowa Receptura!',
      message: `Odkryto: ${recipe.name}`,
      icon: 'mdi-lightbulb',
    });

    return true;
  }

  // ============================================
  // ACTIONS - GOLEMS
  // ============================================

  function createGolem(blueprintId: string): boolean {
    if (!golemsUnlocked.value) return false;

    const blueprint = getGolemBlueprint(blueprintId);
    if (!blueprint) return false;

    // Check slot
    if (workshop.value.golems.length >= workshop.value.maxGolemSlots) {
      gameStore.addNotification({
        type: 'warning',
        title: 'Brak miejsca',
        message: 'Wszystkie sloty golemów są zajęte',
        icon: 'mdi-robot-off',
      });
      return false;
    }

    // Check gold
    if (blueprint.craftCost.gold && !resourcesStore.hasAmount('gold', blueprint.craftCost.gold)) {
      return false;
    }

    // Check flasks
    if (blueprint.craftCost.flasks) {
      if (blueprint.craftCost.flasks.red && flasks.value.red < blueprint.craftCost.flasks.red) return false;
      if (blueprint.craftCost.flasks.green && flasks.value.green < blueprint.craftCost.flasks.green) return false;
      if (blueprint.craftCost.flasks.blue && flasks.value.blue < blueprint.craftCost.flasks.blue) return false;
    }

    // Pay costs
    if (blueprint.craftCost.gold) {
      resourcesStore.removeResource('gold', blueprint.craftCost.gold);
    }
    if (blueprint.craftCost.flasks) {
      if (blueprint.craftCost.flasks.red) flasks.value.red -= blueprint.craftCost.flasks.red;
      if (blueprint.craftCost.flasks.green) flasks.value.green -= blueprint.craftCost.flasks.green;
      if (blueprint.craftCost.flasks.blue) flasks.value.blue -= blueprint.craftCost.flasks.blue;
    }

    // Create golem
    const golem: Golem = {
      id: `golem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: blueprint.name,
      type: blueprint.type,
      level: 1,
      integrity: blueprint.baseIntegrity,
      maxIntegrity: blueprint.baseIntegrity,
      efficiency: blueprint.baseEfficiency * stats.value.golemEfficiencyMultiplier,
      speed: blueprint.baseSpeed,
      state: 'idle',
      currentTask: null,
      taskProgress: 0,
      upgrades: [],
    };

    workshop.value.golems.push(golem);

    gameStore.addNotification({
      type: 'success',
      title: 'Golem Stworzony!',
      message: blueprint.name,
      icon: blueprint.icon,
    });

    return true;
  }

  function activateGolem(golemId: string): boolean {
    const golem = workshop.value.golems.find(g => g.id === golemId);
    if (!golem) return false;

    if (golem.state === 'disabled' || golem.state === 'repairing') return false;

    golem.state = 'working';
    return true;
  }

  function deactivateGolem(golemId: string): boolean {
    const golem = workshop.value.golems.find(g => g.id === golemId);
    if (!golem) return false;

    golem.state = 'idle';
    return true;
  }

  function repairGolem(golemId: string): boolean {
    const golem = workshop.value.golems.find(g => g.id === golemId);
    if (!golem) return false;

    const blueprint = getGolemBlueprint(golem.type + '_golem');
    if (!blueprint) return false;

    // Check repair cost
    if (blueprint.repairCost.flasks) {
      if (blueprint.repairCost.flasks.red && flasks.value.red < blueprint.repairCost.flasks.red) return false;
      if (blueprint.repairCost.flasks.green && flasks.value.green < blueprint.repairCost.flasks.green) return false;
    }

    // Pay cost
    if (blueprint.repairCost.flasks) {
      if (blueprint.repairCost.flasks.red) flasks.value.red -= blueprint.repairCost.flasks.red;
      if (blueprint.repairCost.flasks.green) flasks.value.green -= blueprint.repairCost.flasks.green;
    }

    golem.integrity = golem.maxIntegrity;
    if (golem.state === 'disabled' || golem.state === 'damaged') {
      golem.state = 'idle';
    }

    return true;
  }

  function processGolems() {
    if (!golemsUnlocked.value) return;

    for (const golem of workshop.value.golems) {
      if (golem.state !== 'working') continue;

      const blueprint = getGolemBlueprint(golem.type + '_golem');
      if (!blueprint) continue;

      // Decay integrity
      const decayReduction = getResearchBonus('golem', 'decay_reduction');
      const decay = blueprint.integrityDecayRate * (1 - decayReduction / 100) / 36000; // Per tick (hourly rate / 10 ticks * 3600)
      golem.integrity = Math.max(0, golem.integrity - decay);

      // Check state based on integrity
      if (golem.integrity <= 0) {
        golem.state = 'disabled';
      } else if (golem.integrity <= 25) {
        golem.efficiency = blueprint.baseEfficiency * 0.5;
      } else if (golem.integrity <= 50) {
        golem.efficiency = blueprint.baseEfficiency * 0.75;
      } else {
        golem.efficiency = blueprint.baseEfficiency * stats.value.golemEfficiencyMultiplier;
      }

      // Auto-repair if enabled and above threshold
      if (
        workshop.value.autoRepairEnabled &&
        golem.integrity > workshop.value.autoRepairThreshold &&
        golem.integrity < golem.maxIntegrity
      ) {
        // Slow passive repair
        golem.integrity = Math.min(golem.maxIntegrity, golem.integrity + 0.01);
      }
    }
  }

  // ============================================
  // ACTIONS - GAME LOOP
  // ============================================

  function processTick() {
    produceFlasks();
    processResearch();
    processAlchemy();
    processGolems();
  }

  // ============================================
  // SAVE/LOAD
  // ============================================

  function getState() {
    return {
      stats: {
        ...stats.value,
        xp: stats.value.xp.toString(),
        xpToNextLevel: stats.value.xpToNextLevel.toString(),
      },
      flasks: flasks.value,
      greenFlasksUnlocked: greenFlasksUnlocked.value,
      blueFlasksUnlocked: blueFlasksUnlocked.value,
      alchemyUnlocked: alchemyUnlocked.value,
      golemsUnlocked: golemsUnlocked.value,
      researchProgress: Array.from(researchProgress.value.entries()),
      activeResearchId: activeResearchId.value,
      completedResearch: completedResearch.value,
      alchemyLab: alchemyLab.value,
      potionInventory: Array.from(potionInventory.value.entries()),
      workshop: workshop.value,
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
    if (state.flasks) flasks.value = state.flasks;
    if (state.greenFlasksUnlocked !== undefined) greenFlasksUnlocked.value = state.greenFlasksUnlocked;
    if (state.blueFlasksUnlocked !== undefined) blueFlasksUnlocked.value = state.blueFlasksUnlocked;
    if (state.alchemyUnlocked !== undefined) alchemyUnlocked.value = state.alchemyUnlocked;
    if (state.golemsUnlocked !== undefined) golemsUnlocked.value = state.golemsUnlocked;
    if (state.researchProgress) researchProgress.value = new Map(state.researchProgress);
    if (state.activeResearchId !== undefined) activeResearchId.value = state.activeResearchId;
    if (state.completedResearch) completedResearch.value = state.completedResearch;
    if (state.alchemyLab) alchemyLab.value = state.alchemyLab;
    if (state.potionInventory) potionInventory.value = new Map(state.potionInventory);
    if (state.workshop) workshop.value = state.workshop;
  }

  function resetScientist() {
    stats.value = { ...BASE_STATS };
    flasks.value = {
      red: 10,
      green: 0,
      blue: 0,
      redPerSecond: BASE_RED_FLASK_PRODUCTION,
      greenPerSecond: 0,
      bluePerSecond: 0,
    };
    greenFlasksUnlocked.value = false;
    blueFlasksUnlocked.value = false;
    alchemyUnlocked.value = false;
    golemsUnlocked.value = false;
    researchProgress.value = new Map();
    activeResearchId.value = null;
    completedResearch.value = [];
    alchemyLab.value = {
      level: 1,
      maxProductionSlots: 1,
      productionSlots: [
        { slotId: 0, recipeId: null, progress: 0, isActive: false, autoRepeat: true },
      ],
      discoveredRecipes: ['health_potion_small'],
      ingredientStorage: {},
    };
    potionInventory.value = new Map();
    workshop.value = {
      level: 1,
      maxGolemSlots: 0,
      golems: [],
      autoRepairEnabled: false,
      autoRepairThreshold: 50,
    };
    sessionFlasksProduced.value = { red: 0, green: 0, blue: 0 };
    sessionPotionsCrafted.value = 0;
    sessionResearchCompleted.value = 0;
  }

  // ============================================
  // DEV HELPERS
  // ============================================

  function devAddFlasks() {
    flasks.value.red += 100;
    flasks.value.green += 50;
    flasks.value.blue += 20;
  }

  // Public function to add flasks (used by integration store for offline progress)
  function addFlasks(type: 'red' | 'green' | 'blue', amount: number) {
    flasks.value[type] += amount;
  }

  // Flask production rate computed (for offline progress calculations)
  const flaskProductionRate = computed(() => ({
    red: flasks.value.redPerSecond,
    green: flasks.value.greenPerSecond,
    blue: flasks.value.bluePerSecond,
  }));

  function devUnlockAll() {
    greenFlasksUnlocked.value = true;
    blueFlasksUnlocked.value = true;
    alchemyUnlocked.value = true;
    golemsUnlocked.value = true;
    workshop.value.maxGolemSlots = 3;
    flasks.value.greenPerSecond = 0.1;
    flasks.value.bluePerSecond = 0.05;

    // Discover all potions
    for (const potionId of Object.keys(POTIONS)) {
      if (!alchemyLab.value.discoveredRecipes.includes(potionId)) {
        alchemyLab.value.discoveredRecipes.push(potionId);
      }
    }
  }

  function devAddIngredients() {
    const ingredients = [
      'healing_herb', 'fire_blossom', 'moonshade', 'salt_crystal',
      'sulfur', 'quicksilver', 'magic_essence', 'slime_gel',
      'wolf_fang', 'troll_blood',
    ];
    for (const ing of ingredients) {
      addIngredient(ing, 20);
    }
  }

  // ============================================
  // POTION ALLOCATION TO WARRIOR
  // ============================================

  function allocatePotionToWarrior(potionId: string, amount: number): number {
    const available = potionInventory.value.get(potionId) || 0;
    const toAllocate = Math.min(amount, available);

    if (toAllocate <= 0) return 0;

    // Remove from scientist inventory
    potionInventory.value.set(potionId, available - toAllocate);

    return toAllocate;
  }

  function getPotionCount(potionId: string): number {
    return potionInventory.value.get(potionId) || 0;
  }

  function getAvailableCombatPotions(): { potionId: string; amount: number; name: string; icon: string }[] {
    const result: { potionId: string; amount: number; name: string; icon: string }[] = [];

    for (const [potionId, amount] of potionInventory.value.entries()) {
      if (amount <= 0) continue;

      const potion = getPotion(potionId);
      if (!potion) continue;

      result.push({
        potionId,
        amount,
        name: potion.name,
        icon: potion.icon,
      });
    }

    return result;
  }

  return {
    // State
    stats,
    flasks,
    greenFlasksUnlocked,
    blueFlasksUnlocked,
    alchemyUnlocked,
    golemsUnlocked,
    researchProgress,
    activeResearchId,
    completedResearch,
    alchemyLab,
    potionInventory,
    potionAllocations,
    allocationMode,
    workshop,
    sessionFlasksProduced,
    sessionPotionsCrafted,
    sessionResearchCompleted,

    // Computed
    xpProgress,
    effectiveResearchSpeed,
    effectiveAlchemySpeed,
    availableResearchList,
    discoveredPotions,
    availableGolems,
    activeGolems,

    // Actions
    addXp,
    produceFlasks,
    convertFlasks,
    startResearch,
    getResearchBonus,
    startProduction,
    addIngredient,
    discoverRecipe,
    createGolem,
    activateGolem,
    deactivateGolem,
    repairGolem,
    processTick,
    getState,
    loadState,
    resetScientist,

    // Warrior Integration
    allocatePotionToWarrior,
    getPotionCount,
    getAvailableCombatPotions,

    // Integration (offline progress)
    addFlasks,
    flaskProductionRate,

    // Dev
    devAddFlasks,
    devUnlockAll,
    devAddIngredients,
  };
}, {
  persist: {
    key: 'ateria-scientist',
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    serializer: {
      serialize: (state) => {
        return JSON.stringify({
          ...state,
          stats: state.stats ? {
            ...state.stats,
            xp: state.stats.xp?.toString() || '0',
            xpToNextLevel: state.stats.xpToNextLevel?.toString() || String(BASE_XP_PER_LEVEL),
          } : undefined,
          researchProgress: state.researchProgress ? Array.from(state.researchProgress.entries()) : [],
          potionInventory: state.potionInventory ? Array.from(state.potionInventory.entries()) : [],
        });
      },
      deserialize: (value) => {
        const parsed = JSON.parse(value);

        // Fix stats Decimal values
        if (parsed.stats) {
          parsed.stats.xp = bn(parsed.stats.xp || 0);
          parsed.stats.xpToNextLevel = bn(parsed.stats.xpToNextLevel || BASE_XP_PER_LEVEL);
        }

        // Fix Maps
        if (parsed.researchProgress) {
          parsed.researchProgress = new Map(parsed.researchProgress);
        }
        if (parsed.potionInventory) {
          parsed.potionInventory = new Map(parsed.potionInventory);
        }

        return parsed;
      },
    },
  },
});
