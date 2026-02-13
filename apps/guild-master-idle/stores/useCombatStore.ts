import { defineStore } from 'pinia';
import { useGameStore, TRAITS, type Position, type Trait, type HeroClass, type GuildHero, type EquipmentSlotType } from './useGameStore';

// ============================================
// Combat types
// ============================================

export type AttackType = 'physical' | 'magical';

export interface CombatEntity {
  id: string;
  name: string;
  isHero: boolean;
  heroId?: number;
  heroClass?: HeroClass;
  icon: string;
  color: string;
  // Effective combat stats (base + equipment)
  atk: number;
  def: number;
  mAtk: number;
  mDef: number;
  maxHp: number;
  hp: number;
  spd: number;
  lck: number;
  spt: Position;
  traits: Trait[];
  attackType: AttackType;
  // Combat runtime state
  actionBar: number;
  threat: number;
  alive: boolean;
  // Trait counters
  attackCount: number;
  turnsSinceHeal: number;
}

export interface CombatLogEntry {
  tick: number;
  type: 'attack' | 'skill' | 'miss' | 'critical' | 'heal' | 'death' | 'info' | 'double';
  sourceId: string;
  sourceName: string;
  targetId?: string;
  targetName?: string;
  damage?: number;
  healing?: number;
  messageKey: string;
  messageParams?: Record<string, string | number>;
}

export type CombatPhase = 'idle' | 'selecting' | 'fighting' | 'victory' | 'defeat';

export interface EnemyTemplate {
  id: string;
  nameKey: string;
  icon: string;
  color: string;
  atk: number;
  def: number;
  mAtk: number;
  mDef: number;
  hp: number;
  spd: number;
  spt: Position;
  attackType: AttackType;
  traits: Trait[];
}

export interface Encounter {
  id: string;
  nameKey: string;
  descKey: string;
  icon: string;
  enemies: { templateId: string; count: number }[];
  /** Minimum total hero level recommended */
  difficulty: number;
  rewards: { gold: number; xp: number };
}

// ============================================
// Enemy templates
// ============================================

export const ENEMY_TEMPLATES: Record<string, EnemyTemplate> = {
  goblin: {
    id: 'goblin', nameKey: 'combat.enemies.goblin', icon: '👺', color: 'green',
    atk: 6, def: 3, mAtk: 1, mDef: 2, hp: 35, spd: 11, spt: 'front',
    attackType: 'physical', traits: [],
  },
  goblin_shaman: {
    id: 'goblin_shaman', nameKey: 'combat.enemies.goblinShaman', icon: '🧙', color: 'green',
    atk: 2, def: 3, mAtk: 10, mDef: 6, hp: 30, spd: 8, spt: 'back',
    attackType: 'magical', traits: [],
  },
  orc_warrior: {
    id: 'orc_warrior', nameKey: 'combat.enemies.orcWarrior', icon: '👹', color: 'red',
    atk: 14, def: 10, mAtk: 0, mDef: 4, hp: 90, spd: 5, spt: 'front',
    attackType: 'physical', traits: [TRAITS.provocation],
  },
  skeleton_mage: {
    id: 'skeleton_mage', nameKey: 'combat.enemies.skeletonMage', icon: '💀', color: 'purple',
    atk: 2, def: 4, mAtk: 16, mDef: 8, hp: 45, spd: 9, spt: 'back',
    attackType: 'magical', traits: [],
  },
  dark_wolf: {
    id: 'dark_wolf', nameKey: 'combat.enemies.darkWolf', icon: '🐺', color: 'grey',
    atk: 10, def: 5, mAtk: 0, mDef: 3, hp: 50, spd: 13, spt: 'front',
    attackType: 'physical', traits: [],
  },
  stone_golem: {
    id: 'stone_golem', nameKey: 'combat.enemies.stoneGolem', icon: '🗿', color: 'brown',
    atk: 18, def: 20, mAtk: 0, mDef: 8, hp: 150, spd: 3, spt: 'front',
    attackType: 'physical', traits: [],
  },
  bandit: {
    id: 'bandit', nameKey: 'combat.enemies.bandit', icon: '🥷', color: 'grey-darken-2',
    atk: 9, def: 6, mAtk: 1, mDef: 3, hp: 55, spd: 10, spt: 'middle',
    attackType: 'physical', traits: [],
  },
};

// ============================================
// Encounters
// ============================================

export const ENCOUNTERS: Encounter[] = [
  {
    id: 'goblin_camp', nameKey: 'combat.encounters.goblinCamp', descKey: 'combat.encounters.goblinCampDesc',
    icon: '🏕️', enemies: [{ templateId: 'goblin', count: 2 }], difficulty: 1,
    rewards: { gold: 30, xp: 10 },
  },
  {
    id: 'dark_forest', nameKey: 'combat.encounters.darkForest', descKey: 'combat.encounters.darkForestDesc',
    icon: '🌲', enemies: [{ templateId: 'dark_wolf', count: 2 }, { templateId: 'goblin', count: 1 }], difficulty: 2,
    rewards: { gold: 60, xp: 25 },
  },
  {
    id: 'bandit_ambush', nameKey: 'combat.encounters.banditAmbush', descKey: 'combat.encounters.banditAmbushDesc',
    icon: '⚔️', enemies: [{ templateId: 'bandit', count: 2 }, { templateId: 'goblin_shaman', count: 1 }], difficulty: 3,
    rewards: { gold: 100, xp: 40 },
  },
  {
    id: 'undead_crypt', nameKey: 'combat.encounters.undeadCrypt', descKey: 'combat.encounters.undeadCryptDesc',
    icon: '⚰️', enemies: [{ templateId: 'skeleton_mage', count: 2 }, { templateId: 'orc_warrior', count: 1 }], difficulty: 4,
    rewards: { gold: 150, xp: 60 },
  },
  {
    id: 'golem_cave', nameKey: 'combat.encounters.golemCave', descKey: 'combat.encounters.golemCaveDesc',
    icon: '🗻', enemies: [{ templateId: 'stone_golem', count: 1 }, { templateId: 'goblin_shaman', count: 2 }], difficulty: 5,
    rewards: { gold: 250, xp: 100 },
  },
];

// ============================================
// Constants
// ============================================
const TICK_MS = 100;
const ACTION_BAR_FILL_RATE = 0.6; // actionBar += SPD * rate per tick
const BASE_HIT_CHANCE = 0.80;
const HIT_CHANCE_SPD_FACTOR = 0.02;
const MIN_HIT_CHANCE = 0.50;
const MAX_HIT_CHANCE = 0.95;
const BASE_CRIT_CHANCE = 0.05;
const CRIT_LCK_FACTOR = 0.01;
const MAX_CRIT_CHANCE = 0.50;
const CRIT_MULTIPLIER = 2.0;
const PROVOCATION_THREAT_MULT = 3.0;
const ARCANE_SURGE_EVERY = 4;
const ARCANE_SURGE_MULT = 2.0;
const HEAL_EVERY_TURNS = 3;
const HEAL_PERCENT = 0.25;
const SHADOW_STRIKE_CHANCE = 0.30;

// ============================================
// Helper: create CombatEntity from GuildHero
// ============================================
function heroToEntity(hero: GuildHero, gameStore: ReturnType<typeof useGameStore>): CombatEntity {
  const bonuses = gameStore.getHeroEquipmentBonuses(hero.id);
  const lckBonus = (bonuses['lck'] ?? 0) + gameStore.guildStats.lck;

  // Determine primary attack type by class
  let attackType: AttackType = 'physical';
  if (hero.heroClass === 'mage' || hero.heroClass === 'cleric') attackType = 'magical';

  return {
    id: `hero_${hero.id}`,
    name: hero.name,
    isHero: true,
    heroId: hero.id,
    heroClass: hero.heroClass,
    icon: hero.emoji,
    color: hero.color,
    atk: hero.stats.atk + (bonuses['atk'] ?? 0),
    def: hero.stats.def + (bonuses['def'] ?? 0),
    mAtk: hero.stats.mAtk + (bonuses['mAtk'] ?? 0),
    mDef: hero.stats.mDef + (bonuses['mDef'] ?? 0),
    maxHp: hero.stats.hp + (bonuses['hp'] ?? 0),
    hp: hero.stats.hp + (bonuses['hp'] ?? 0),
    spd: hero.stats.spd + (bonuses['spd'] ?? 0),
    lck: lckBonus,
    spt: hero.stats.spt,
    traits: [...hero.traits],
    attackType,
    actionBar: 0,
    threat: 0,
    alive: true,
    attackCount: 0,
    turnsSinceHeal: 0,
  };
}

function enemyToEntity(template: EnemyTemplate, index: number): CombatEntity {
  return {
    id: `enemy_${template.id}_${index}`,
    name: template.nameKey, // i18n key — resolved in UI
    isHero: false,
    icon: template.icon,
    color: template.color,
    atk: template.atk,
    def: template.def,
    mAtk: template.mAtk,
    mDef: template.mDef,
    maxHp: template.hp,
    hp: template.hp,
    spd: template.spd,
    lck: 0,
    spt: template.spt,
    traits: [...template.traits],
    attackType: template.attackType,
    actionBar: 0,
    threat: 0,
    alive: true,
    attackCount: 0,
    turnsSinceHeal: 0,
  };
}

// ============================================
// Combat math
// ============================================
function calcHitChance(attackerSpd: number, targetSpd: number): number {
  const raw = BASE_HIT_CHANCE + (attackerSpd - targetSpd) * HIT_CHANCE_SPD_FACTOR;
  return Math.min(MAX_HIT_CHANCE, Math.max(MIN_HIT_CHANCE, raw));
}

function calcCritChance(lck: number): number {
  return Math.min(MAX_CRIT_CHANCE, BASE_CRIT_CHANCE + lck * CRIT_LCK_FACTOR);
}

function calcPhysicalDamage(atk: number, def: number): number {
  return Math.max(1, Math.round(atk * (100 / (100 + def))));
}

function calcMagicalDamage(mAtk: number, mDef: number): number {
  return Math.max(1, Math.round(mAtk * (100 / (100 + mDef))));
}

// ============================================
// Targeting
// ============================================
const POSITION_PRIORITY: Position[] = ['front', 'middle', 'back'];

function selectTarget(attacker: CombatEntity, opponents: CombatEntity[], isHeroAttacking: boolean): CombatEntity | null {
  const alive = opponents.filter((e) => e.alive);
  if (alive.length === 0) return null;

  // Ranger with Precision Shot can target any position
  const hasPrecision = attacker.traits.some((t) => t.id === 'precision_shot');

  if (isHeroAttacking && hasPrecision) {
    // Ranger: target lowest HP enemy (surgical)
    return alive.reduce((a, b) => (a.hp < b.hp ? a : b));
  }

  // Position-based priority: FRONT > MIDDLE > BACK
  for (const pos of POSITION_PRIORITY) {
    const inPosition = alive.filter((e) => e.spt === pos);
    if (inPosition.length === 0) continue;

    // Within same position, target highest threat (for enemies targeting heroes)
    // or lowest HP (for heroes targeting enemies)
    if (!isHeroAttacking) {
      // Enemy targeting heroes: highest threat in this position
      return inPosition.reduce((a, b) => (a.threat > b.threat ? a : b));
    } else {
      // Hero targeting enemies: lowest HP in front position
      return inPosition.reduce((a, b) => (a.hp < b.hp ? a : b));
    }
  }

  return alive[0] ?? null;
}

// ============================================
// Store
// ============================================
export const useCombatStore = defineStore('combat', {
  state: () => ({
    phase: 'idle' as CombatPhase,
    tick: 0,
    heroes: [] as CombatEntity[],
    enemies: [] as CombatEntity[],
    log: [] as CombatLogEntry[],
    speed: 1 as number,
    _interval: null as ReturnType<typeof setInterval> | null,

    // Party selection
    selectedHeroIds: [] as number[],
    selectedEncounterId: null as string | null,
  }),

  getters: {
    aliveHeroes: (state) => state.heroes.filter((h) => h.alive),
    aliveEnemies: (state) => state.enemies.filter((e) => e.alive),
    allEntities: (state) => [...state.heroes, ...state.enemies],
    currentEncounter: (state) => ENCOUNTERS.find((e) => e.id === state.selectedEncounterId) ?? null,
  },

  actions: {
    // ============================
    // Party selection
    // ============================
    toggleHeroSelection(heroId: number) {
      const idx = this.selectedHeroIds.indexOf(heroId);
      if (idx !== -1) {
        this.selectedHeroIds.splice(idx, 1);
      } else if (this.selectedHeroIds.length < 4) {
        this.selectedHeroIds.push(heroId);
      }
    },

    selectEncounter(encounterId: string) {
      this.selectedEncounterId = encounterId;
    },

    // ============================
    // Combat lifecycle
    // ============================
    startCombat() {
      if (this.phase === 'fighting') return;
      const gameStore = useGameStore();

      const encounter = ENCOUNTERS.find((e) => e.id === this.selectedEncounterId);
      if (!encounter) return;
      if (this.selectedHeroIds.length === 0) return;

      // Reset state
      this.tick = 0;
      this.log = [];
      this.heroes = [];
      this.enemies = [];

      // Create hero entities
      for (const heroId of this.selectedHeroIds) {
        const hero = gameStore.guildHeroes.find((h) => h.id === heroId);
        if (hero) {
          this.heroes.push(heroToEntity(hero, gameStore));
        }
      }

      // Create enemy entities
      let enemyIdx = 0;
      for (const group of encounter.enemies) {
        const template = ENEMY_TEMPLATES[group.templateId];
        if (!template) continue;
        for (let i = 0; i < group.count; i++) {
          this.enemies.push(enemyToEntity(template, enemyIdx++));
        }
      }

      // Initial log
      this.log.push({
        tick: 0, type: 'info', sourceId: '', sourceName: '',
        messageKey: 'combat.log.battleStart', messageParams: {},
      });

      this.phase = 'fighting';
      this._startLoop();
    },

    stopCombat() {
      this._stopLoop();
      if (this.phase === 'fighting') {
        this.phase = 'idle';
      }
    },

    resetCombat() {
      this._stopLoop();
      this.phase = 'idle';
      this.tick = 0;
      this.heroes = [];
      this.enemies = [];
      this.log = [];
      this.selectedHeroIds = [];
      this.selectedEncounterId = null;
    },

    setSpeed(s: number) {
      this.speed = s;
      // Restart loop with new speed
      if (this._interval) {
        this._stopLoop();
        this._startLoop();
      }
    },

    // ============================
    // Combat loop
    // ============================
    _startLoop() {
      if (this._interval) return;
      const tickRate = Math.max(20, Math.round(TICK_MS / this.speed));
      this._interval = setInterval(() => this._tick(), tickRate);
    },

    _stopLoop() {
      if (this._interval) {
        clearInterval(this._interval);
        this._interval = null;
      }
    },

    _tick() {
      if (this.phase !== 'fighting') {
        this._stopLoop();
        return;
      }

      this.tick++;
      const allAlive = [...this.heroes, ...this.enemies].filter((e) => e.alive);

      // 1. Fill action bars
      for (const entity of allAlive) {
        entity.actionBar += entity.spd * ACTION_BAR_FILL_RATE;
      }

      // 2. Process entities whose action bar reached 100 (sorted by highest SPD for tie-breaking)
      const readyEntities = allAlive
        .filter((e) => e.actionBar >= 100)
        .sort((a, b) => b.spd - a.spd);

      for (const actor of readyEntities) {
        if (!actor.alive) continue; // might have died from a previous action this tick
        actor.actionBar = 0;
        this._performAction(actor);
      }

      // 3. Check win/lose conditions
      if (this.aliveHeroes.length === 0) {
        this.phase = 'defeat';
        this.log.push({
          tick: this.tick, type: 'info', sourceId: '', sourceName: '',
          messageKey: 'combat.log.defeat', messageParams: {},
        });
        this._stopLoop();
      } else if (this.aliveEnemies.length === 0) {
        this.phase = 'victory';
        this.log.push({
          tick: this.tick, type: 'info', sourceId: '', sourceName: '',
          messageKey: 'combat.log.victory', messageParams: {},
        });
        this._stopLoop();
        this._applyRewards();
      }
    },

    _performAction(actor: CombatEntity) {
      const isHero = actor.isHero;
      const opponents = isHero ? this.enemies : this.heroes;
      const allies = isHero ? this.heroes : this.enemies;

      // ---- Cleric Heal (instead of attacking) ----
      if (actor.traits.some((t) => t.id === 'heal')) {
        actor.turnsSinceHeal++;
        if (actor.turnsSinceHeal >= HEAL_EVERY_TURNS) {
          actor.turnsSinceHeal = 0;
          // Heal lowest HP ally
          const injured = allies.filter((a) => a.alive && a.hp < a.maxHp);
          if (injured.length > 0) {
            const target = injured.reduce((a, b) => (a.hp / a.maxHp < b.hp / b.maxHp ? a : b));
            const healAmount = Math.round(target.maxHp * HEAL_PERCENT);
            target.hp = Math.min(target.maxHp, target.hp + healAmount);
            this.log.push({
              tick: this.tick, type: 'heal',
              sourceId: actor.id, sourceName: actor.name,
              targetId: target.id, targetName: target.name,
              healing: healAmount,
              messageKey: 'combat.log.heal',
              messageParams: { source: actor.name, target: target.name, amount: healAmount },
            });
            // Cleric still does their normal attack after heal
          }
        }
      }

      // ---- Select target ----
      const target = selectTarget(actor, opponents, isHero);
      if (!target) return;

      // ---- Perform attack ----
      this._executeAttack(actor, target);

      // ---- Shadow Strike: 30% chance for a second attack ----
      if (actor.alive && actor.traits.some((t) => t.id === 'shadow_strike')) {
        if (Math.random() < SHADOW_STRIKE_CHANCE) {
          const target2 = selectTarget(actor, opponents, isHero);
          if (target2) {
            this.log.push({
              tick: this.tick, type: 'double',
              sourceId: actor.id, sourceName: actor.name,
              messageKey: 'combat.log.shadowStrike',
              messageParams: { source: actor.name },
            });
            this._executeAttack(actor, target2);
          }
        }
      }
    },

    _executeAttack(attacker: CombatEntity, target: CombatEntity) {
      attacker.attackCount++;

      // Hit check
      const hitChance = calcHitChance(attacker.spd, target.spd);
      if (Math.random() > hitChance) {
        this.log.push({
          tick: this.tick, type: 'miss',
          sourceId: attacker.id, sourceName: attacker.name,
          targetId: target.id, targetName: target.name,
          messageKey: 'combat.log.miss',
          messageParams: { source: attacker.name, target: target.name },
        });
        return;
      }

      // Damage calculation
      let damage: number;
      const isArcane = attacker.traits.some((t) => t.id === 'arcane_surge');
      const arcaneProc = isArcane && attacker.attackCount % ARCANE_SURGE_EVERY === 0;

      if (attacker.attackType === 'magical') {
        damage = calcMagicalDamage(attacker.mAtk, target.mDef);
      } else {
        damage = calcPhysicalDamage(attacker.atk, target.def);
      }

      // Arcane Surge: every Nth attack deals 2x
      if (arcaneProc) {
        damage = Math.round(damage * ARCANE_SURGE_MULT);
      }

      // Critical hit
      const critChance = calcCritChance(attacker.lck);
      let isCrit = false;
      if (Math.random() < critChance) {
        damage = Math.round(damage * CRIT_MULTIPLIER);
        isCrit = true;
      }

      // Apply damage
      target.hp = Math.max(0, target.hp - damage);

      // Generate threat
      const hasProv = attacker.traits.some((t) => t.id === 'provocation');
      attacker.threat += damage * (hasProv ? PROVOCATION_THREAT_MULT : 1);

      // Log
      const logType = isCrit ? 'critical' : (arcaneProc ? 'skill' : 'attack');
      this.log.push({
        tick: this.tick, type: logType,
        sourceId: attacker.id, sourceName: attacker.name,
        targetId: target.id, targetName: target.name,
        damage,
        messageKey: isCrit ? 'combat.log.critical' : (arcaneProc ? 'combat.log.arcaneSurge' : 'combat.log.attack'),
        messageParams: { source: attacker.name, target: target.name, damage },
      });

      // Check death
      if (target.hp <= 0) {
        target.alive = false;
        target.hp = 0;
        this.log.push({
          tick: this.tick, type: 'death',
          sourceId: target.id, sourceName: target.name,
          messageKey: 'combat.log.death',
          messageParams: { target: target.name },
        });
      }
    },

    // ============================
    // Rewards
    // ============================
    _applyRewards() {
      const gameStore = useGameStore();
      const encounter = ENCOUNTERS.find((e) => e.id === this.selectedEncounterId);
      if (!encounter) return;

      gameStore.addResource('gold', encounter.rewards.gold);

      // Chance to drop a random item
      if (Math.random() < 0.4) {
        gameStore.generateRandomItem();
      }
    },
  },
});
