/**
 * Diplomat Path Data - Factions, Reputation, Missions
 */

// ============================================
// TYPES
// ============================================

export type FactionId = 
  | 'kingdom_of_ateria'
  | 'thieves_guild'
  | 'mountain_clan'
  | 'mages_order'
  | 'forest_tribe'
  | 'merchant_confederation'
  | 'void_cult';

export type ReputationTier = 'hostile' | 'unfriendly' | 'neutral' | 'friendly' | 'honored' | 'allied';

export interface Faction {
  id: FactionId;
  name: string;
  description: string;
  icon: string;
  color: string;
  leader: string;
  location: string;
  
  // Relationships
  allies: FactionId[];
  enemies: FactionId[];
  
  // Bonuses at different rep levels
  bonuses: FactionBonus[];
  
  // Unlockable content
  unlocksAtHonored: string[];
  unlocksAtAllied: string[];
}

export interface FactionBonus {
  tier: ReputationTier;
  description: string;
  effects: FactionEffect[];
}

export interface FactionEffect {
  type: 'stat_bonus' | 'discount' | 'unlock' | 'resource_gain' | 'xp_bonus';
  target: string;
  value: number;
}

export interface DiplomatMission {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'negotiation' | 'alliance' | 'arbitration' | 'espionage' | 'trade_deal';
  
  // Requirements
  requiredLevel: number;
  requiredReputation?: { factionId: FactionId; minTier: ReputationTier };
  requiredStats?: Partial<DiplomatStats>;
  
  // Duration and rewards
  duration: number; // Ticks
  xpReward: number;
  reputationRewards: { factionId: FactionId; amount: number }[];
  resourceRewards?: { resourceId: string; amount: number }[];
  influenceReward: number;
  
  // Success factors
  baseSuccessChance: number;
  statBonus: { stat: keyof DiplomatStats; weight: number }[];
  
  // Cooldown
  cooldown: number;
  repeatable: boolean;
}

export interface DiplomatStats {
  charisma: number;
  persuasion: number;
  intrigue: number;
  renown: number;
}

export interface DiplomatSkillProgress {
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXp: number;
}

// ============================================
// REPUTATION THRESHOLDS
// ============================================

export const REPUTATION_THRESHOLDS: Record<ReputationTier, { min: number; max: number; label: string; color: string }> = {
  hostile: { min: -100, max: -50, label: 'Wrogi', color: '#F44336' },
  unfriendly: { min: -49, max: -10, label: 'Nieprzyjazny', color: '#FF9800' },
  neutral: { min: -9, max: 10, label: 'Neutralny', color: '#9E9E9E' },
  friendly: { min: 11, max: 40, label: 'Przyjazny', color: '#4CAF50' },
  honored: { min: 41, max: 70, label: 'Szanowany', color: '#2196F3' },
  allied: { min: 71, max: 100, label: 'Sojusznik', color: '#9C27B0' },
};

export function getReputationTier(reputation: number): ReputationTier {
  if (reputation <= -50) return 'hostile';
  if (reputation <= -10) return 'unfriendly';
  if (reputation <= 10) return 'neutral';
  if (reputation <= 40) return 'friendly';
  if (reputation <= 70) return 'honored';
  return 'allied';
}

// ============================================
// FACTIONS
// ============================================

export const FACTIONS: Record<FactionId, Faction> = {
  kingdom_of_ateria: {
    id: 'kingdom_of_ateria',
    name: 'Królestwo Aterii',
    description: 'Potężne królestwo militarne, bastion porządku i prawa.',
    icon: 'mdi-castle',
    color: '#1565C0',
    leader: 'Król Aldric III',
    location: 'Cytadela Aterii',
    allies: ['mages_order'],
    enemies: ['thieves_guild', 'void_cult'],
    bonuses: [
      {
        tier: 'friendly',
        description: '+10% XP dla Wojownika',
        effects: [{ type: 'xp_bonus', target: 'warrior', value: 10 }],
      },
      {
        tier: 'honored',
        description: '+15% obrażeń w walce, dostęp do królewskiej zbrojowni',
        effects: [
          { type: 'stat_bonus', target: 'attack', value: 15 },
          { type: 'unlock', target: 'royal_armory', value: 1 },
        ],
      },
      {
        tier: 'allied',
        description: 'Dostęp do elitarnych dungeonów, +20% złota z walki',
        effects: [
          { type: 'unlock', target: 'elite_dungeons', value: 1 },
          { type: 'resource_gain', target: 'gold', value: 20 },
        ],
      },
    ],
    unlocksAtHonored: ['royal_armory', 'kingdom_quests'],
    unlocksAtAllied: ['elite_dungeons', 'royal_title'],
  },

  thieves_guild: {
    id: 'thieves_guild',
    name: 'Gildia Złodziei',
    description: 'Sieć cieni działająca w podziemiach miast.',
    icon: 'mdi-mask',
    color: '#424242',
    leader: 'Mistrzowa Cienia',
    location: 'Kanały pod Aterią',
    allies: ['merchant_confederation'],
    enemies: ['kingdom_of_ateria', 'mages_order'],
    bonuses: [
      {
        tier: 'friendly',
        description: '+15% szansy na drop rzadkich przedmiotów',
        effects: [{ type: 'stat_bonus', target: 'loot_luck', value: 15 }],
      },
      {
        tier: 'honored',
        description: '+25% złota ze sprzedaży, dostęp do czarnego rynku',
        effects: [
          { type: 'resource_gain', target: 'sell_price', value: 25 },
          { type: 'unlock', target: 'black_market', value: 1 },
        ],
      },
      {
        tier: 'allied',
        description: 'Kontrabanda, szpiegostwo, unikalne zlecenia',
        effects: [
          { type: 'unlock', target: 'contraband', value: 1 },
          { type: 'unlock', target: 'spy_network', value: 1 },
        ],
      },
    ],
    unlocksAtHonored: ['black_market', 'thieves_tools'],
    unlocksAtAllied: ['contraband', 'spy_network', 'master_thief_title'],
  },

  mountain_clan: {
    id: 'mountain_clan',
    name: 'Klan Górski',
    description: 'Krasnoludzi mistrzowie rzemiosła i górnictwa.',
    icon: 'mdi-hammer',
    color: '#795548',
    leader: 'Starszy Thrain',
    location: 'Góry Żelaznego Szczytu',
    allies: ['kingdom_of_ateria', 'forest_tribe'],
    enemies: ['void_cult'],
    bonuses: [
      {
        tier: 'friendly',
        description: '+15% do jakości wytwarzania',
        effects: [{ type: 'stat_bonus', target: 'craft_quality', value: 15 }],
      },
      {
        tier: 'honored',
        description: '+20% szybkości górnictwa, dostęp do rzadkich rud',
        effects: [
          { type: 'stat_bonus', target: 'mining_speed', value: 20 },
          { type: 'unlock', target: 'rare_ores', value: 1 },
        ],
      },
      {
        tier: 'allied',
        description: 'Krasnoludzie schematy, mistrzowskie receptury',
        effects: [
          { type: 'unlock', target: 'dwarven_recipes', value: 1 },
          { type: 'unlock', target: 'master_crafting', value: 1 },
        ],
      },
    ],
    unlocksAtHonored: ['rare_ores', 'dwarven_tools'],
    unlocksAtAllied: ['dwarven_recipes', 'forge_master_title'],
  },

  mages_order: {
    id: 'mages_order',
    name: 'Zakon Magów',
    description: 'Stowarzyszenie uczonych i praktyków magii.',
    icon: 'mdi-wizard-hat',
    color: '#7B1FA2',
    leader: 'Arcymag Elyndra',
    location: 'Wieża Wiedzy',
    allies: ['kingdom_of_ateria'],
    enemies: ['thieves_guild', 'void_cult'],
    bonuses: [
      {
        tier: 'friendly',
        description: '+15% XP dla Naukowca',
        effects: [{ type: 'xp_bonus', target: 'scientist', value: 15 }],
      },
      {
        tier: 'honored',
        description: '+20% szybkości badań, dostęp do magicznych receptur',
        effects: [
          { type: 'stat_bonus', target: 'research_speed', value: 20 },
          { type: 'unlock', target: 'magic_recipes', value: 1 },
        ],
      },
      {
        tier: 'allied',
        description: 'Starożytna wiedza, portal do sekretnych lokacji',
        effects: [
          { type: 'unlock', target: 'ancient_knowledge', value: 1 },
          { type: 'unlock', target: 'portal_network', value: 1 },
        ],
      },
    ],
    unlocksAtHonored: ['magic_recipes', 'mage_library'],
    unlocksAtAllied: ['ancient_knowledge', 'archmage_title'],
  },

  forest_tribe: {
    id: 'forest_tribe',
    name: 'Plemię Leśne',
    description: 'Elfowie żyjący w harmonii z naturą.',
    icon: 'mdi-tree',
    color: '#2E7D32',
    leader: 'Druidka Aelindra',
    location: 'Pralas Wieczności',
    allies: ['mountain_clan'],
    enemies: ['void_cult', 'merchant_confederation'],
    bonuses: [
      {
        tier: 'friendly',
        description: '+15% do zbierania ziół i drewna',
        effects: [
          { type: 'stat_bonus', target: 'herbalism_speed', value: 15 },
          { type: 'stat_bonus', target: 'woodcutting_speed', value: 15 },
        ],
      },
      {
        tier: 'honored',
        description: '+20% efektywność farm, dostęp do elfich nasion',
        effects: [
          { type: 'stat_bonus', target: 'farm_efficiency', value: 20 },
          { type: 'unlock', target: 'elven_seeds', value: 1 },
        ],
      },
      {
        tier: 'allied',
        description: 'Totemy natury, komunikacja ze zwierzętami',
        effects: [
          { type: 'unlock', target: 'nature_totems', value: 1 },
          { type: 'unlock', target: 'animal_companion', value: 1 },
        ],
      },
    ],
    unlocksAtHonored: ['elven_seeds', 'forest_sanctuary'],
    unlocksAtAllied: ['nature_totems', 'forest_guardian_title'],
  },

  merchant_confederation: {
    id: 'merchant_confederation',
    name: 'Konfederacja Kupiecka',
    description: 'Sojusz najpotężniejszych gildii handlowych.',
    icon: 'mdi-store',
    color: '#F9A825',
    leader: 'Wielki Kupiec Marvon',
    location: 'Wielki Bazar',
    allies: ['thieves_guild'],
    enemies: ['forest_tribe'],
    bonuses: [
      {
        tier: 'friendly',
        description: '+10% zysków ze sprzedaży',
        effects: [{ type: 'resource_gain', target: 'sell_price', value: 10 }],
      },
      {
        tier: 'honored',
        description: '-15% kosztów zakupu, dostęp do ekskluzywnych towarów',
        effects: [
          { type: 'discount', target: 'buy_price', value: 15 },
          { type: 'unlock', target: 'exclusive_goods', value: 1 },
        ],
      },
      {
        tier: 'allied',
        description: 'Międzynarodowe szlaki, monopole handlowe',
        effects: [
          { type: 'unlock', target: 'trade_routes', value: 1 },
          { type: 'unlock', target: 'monopoly', value: 1 },
        ],
      },
    ],
    unlocksAtHonored: ['exclusive_goods', 'merchant_contacts'],
    unlocksAtAllied: ['trade_routes', 'trade_prince_title'],
  },

  void_cult: {
    id: 'void_cult',
    name: 'Kult Pustki',
    description: 'Tajemnicza sekta czcząca mroczne moce.',
    icon: 'mdi-eye-circle',
    color: '#311B92',
    leader: '???',
    location: 'Nieznana',
    allies: [],
    enemies: ['kingdom_of_ateria', 'mages_order', 'forest_tribe', 'mountain_clan'],
    bonuses: [
      {
        tier: 'friendly',
        description: '+20% obrażeń od mrocznej magii',
        effects: [{ type: 'stat_bonus', target: 'void_damage', value: 20 }],
      },
      {
        tier: 'honored',
        description: 'Dostęp do mrocznych rytuałów, Pustka-materiały',
        effects: [
          { type: 'unlock', target: 'dark_rituals', value: 1 },
          { type: 'unlock', target: 'void_materials', value: 1 },
        ],
      },
      {
        tier: 'allied',
        description: 'Portal do Pustki, sekretna wiedza',
        effects: [
          { type: 'unlock', target: 'void_portal', value: 1 },
          { type: 'unlock', target: 'forbidden_knowledge', value: 1 },
        ],
      },
    ],
    unlocksAtHonored: ['dark_rituals', 'void_materials'],
    unlocksAtAllied: ['void_portal', 'void_walker_title'],
  },
};

// ============================================
// DIPLOMAT MISSIONS
// ============================================

export const DIPLOMAT_MISSIONS: Record<string, DiplomatMission> = {
  // Basic missions
  basic_negotiation: {
    id: 'basic_negotiation',
    name: 'Podstawowe Negocjacje',
    description: 'Przeprowadź proste negocjacje handlowe.',
    icon: 'mdi-handshake',
    type: 'negotiation',
    requiredLevel: 1,
    duration: 300, // 30 seconds
    xpReward: 20,
    reputationRewards: [],
    influenceReward: 5,
    baseSuccessChance: 80,
    statBonus: [{ stat: 'charisma', weight: 0.5 }, { stat: 'persuasion', weight: 0.3 }],
    cooldown: 100,
    repeatable: true,
  },
  gather_intel: {
    id: 'gather_intel',
    name: 'Zbieranie Informacji',
    description: 'Zbierz informacje o aktualnej sytuacji politycznej.',
    icon: 'mdi-ear-hearing',
    type: 'espionage',
    requiredLevel: 3,
    duration: 450,
    xpReward: 35,
    reputationRewards: [],
    influenceReward: 8,
    baseSuccessChance: 75,
    statBonus: [{ stat: 'intrigue', weight: 0.6 }, { stat: 'charisma', weight: 0.2 }],
    cooldown: 200,
    repeatable: true,
  },

  // Kingdom missions
  kingdom_petition: {
    id: 'kingdom_petition',
    name: 'Petycja do Króla',
    description: 'Złóż petycję w imieniu prostego ludu.',
    icon: 'mdi-scroll-text',
    type: 'negotiation',
    requiredLevel: 5,
    requiredReputation: { factionId: 'kingdom_of_ateria', minTier: 'neutral' },
    duration: 600,
    xpReward: 50,
    reputationRewards: [{ factionId: 'kingdom_of_ateria', amount: 5 }],
    influenceReward: 15,
    baseSuccessChance: 70,
    statBonus: [{ stat: 'persuasion', weight: 0.5 }, { stat: 'renown', weight: 0.3 }],
    cooldown: 500,
    repeatable: true,
  },
  military_alliance: {
    id: 'military_alliance',
    name: 'Sojusz Militarny',
    description: 'Wynegocjuj sojusz między królestwem a inną frakcją.',
    icon: 'mdi-sword-cross',
    type: 'alliance',
    requiredLevel: 15,
    requiredReputation: { factionId: 'kingdom_of_ateria', minTier: 'friendly' },
    requiredStats: { charisma: 20, persuasion: 15 },
    duration: 1800,
    xpReward: 200,
    reputationRewards: [
      { factionId: 'kingdom_of_ateria', amount: 15 },
      { factionId: 'mages_order', amount: 10 },
    ],
    resourceRewards: [{ resourceId: 'gold', amount: 500 }],
    influenceReward: 50,
    baseSuccessChance: 50,
    statBonus: [
      { stat: 'charisma', weight: 0.3 },
      { stat: 'persuasion', weight: 0.3 },
      { stat: 'renown', weight: 0.3 },
    ],
    cooldown: 3000,
    repeatable: true,
  },

  // Thieves Guild missions
  guild_contact: {
    id: 'guild_contact',
    name: 'Kontakt z Gildią',
    description: 'Nawiąż dyskretny kontakt z Gildią Złodziei.',
    icon: 'mdi-incognito',
    type: 'espionage',
    requiredLevel: 8,
    duration: 500,
    xpReward: 60,
    reputationRewards: [{ factionId: 'thieves_guild', amount: 5 }],
    influenceReward: 12,
    baseSuccessChance: 65,
    statBonus: [{ stat: 'intrigue', weight: 0.6 }, { stat: 'charisma', weight: 0.2 }],
    cooldown: 400,
    repeatable: true,
  },
  black_market_deal: {
    id: 'black_market_deal',
    name: 'Transakcja na Czarnym Rynku',
    description: 'Wynegocjuj korzystną transakcję na czarnym rynku.',
    icon: 'mdi-cash-lock',
    type: 'trade_deal',
    requiredLevel: 12,
    requiredReputation: { factionId: 'thieves_guild', minTier: 'friendly' },
    duration: 800,
    xpReward: 90,
    reputationRewards: [{ factionId: 'thieves_guild', amount: 8 }],
    resourceRewards: [{ resourceId: 'gold', amount: 300 }],
    influenceReward: 20,
    baseSuccessChance: 55,
    statBonus: [{ stat: 'intrigue', weight: 0.4 }, { stat: 'persuasion', weight: 0.4 }],
    cooldown: 600,
    repeatable: true,
  },

  // Mountain Clan missions
  dwarven_trade: {
    id: 'dwarven_trade',
    name: 'Handel z Krasnoludami',
    description: 'Wynegocjuj umowę handlową z Klanem Górskim.',
    icon: 'mdi-cart-arrow-right',
    type: 'trade_deal',
    requiredLevel: 10,
    requiredReputation: { factionId: 'mountain_clan', minTier: 'neutral' },
    duration: 700,
    xpReward: 75,
    reputationRewards: [{ factionId: 'mountain_clan', amount: 6 }],
    influenceReward: 18,
    baseSuccessChance: 65,
    statBonus: [{ stat: 'charisma', weight: 0.4 }, { stat: 'persuasion', weight: 0.4 }],
    cooldown: 500,
    repeatable: true,
  },

  // Mages Order missions
  magical_research_pact: {
    id: 'magical_research_pact',
    name: 'Pakt Badawczy',
    description: 'Wynegocjuj współpracę naukową z Zakonem Magów.',
    icon: 'mdi-flask-round-bottom',
    type: 'alliance',
    requiredLevel: 12,
    requiredReputation: { factionId: 'mages_order', minTier: 'friendly' },
    duration: 900,
    xpReward: 100,
    reputationRewards: [{ factionId: 'mages_order', amount: 10 }],
    influenceReward: 25,
    baseSuccessChance: 60,
    statBonus: [{ stat: 'persuasion', weight: 0.5 }, { stat: 'renown', weight: 0.3 }],
    cooldown: 800,
    repeatable: true,
  },

  // Forest Tribe missions
  nature_pact: {
    id: 'nature_pact',
    name: 'Pakt z Naturą',
    description: 'Złóż przysięgę ochrony lasu Plemieniu Leśnemu.',
    icon: 'mdi-leaf',
    type: 'alliance',
    requiredLevel: 10,
    requiredReputation: { factionId: 'forest_tribe', minTier: 'neutral' },
    duration: 600,
    xpReward: 70,
    reputationRewards: [{ factionId: 'forest_tribe', amount: 8 }],
    influenceReward: 18,
    baseSuccessChance: 70,
    statBonus: [{ stat: 'charisma', weight: 0.5 }, { stat: 'renown', weight: 0.3 }],
    cooldown: 500,
    repeatable: true,
  },

  // Merchant Confederation missions
  trade_agreement: {
    id: 'trade_agreement',
    name: 'Umowa Handlowa',
    description: 'Wynegocjuj korzystną umowę z Konfederacją Kupiecką.',
    icon: 'mdi-file-document-edit',
    type: 'trade_deal',
    requiredLevel: 8,
    requiredReputation: { factionId: 'merchant_confederation', minTier: 'neutral' },
    duration: 500,
    xpReward: 55,
    reputationRewards: [{ factionId: 'merchant_confederation', amount: 5 }],
    resourceRewards: [{ resourceId: 'gold', amount: 200 }],
    influenceReward: 15,
    baseSuccessChance: 75,
    statBonus: [{ stat: 'charisma', weight: 0.4 }, { stat: 'persuasion', weight: 0.4 }],
    cooldown: 400,
    repeatable: true,
  },

  // Arbitration missions
  settle_dispute: {
    id: 'settle_dispute',
    name: 'Rozstrzygnięcie Sporu',
    description: 'Rozstrzygnij konflikt między dwoma frakcjami.',
    icon: 'mdi-scale-balance',
    type: 'arbitration',
    requiredLevel: 20,
    requiredStats: { charisma: 25, persuasion: 20, renown: 15 },
    duration: 1500,
    xpReward: 180,
    reputationRewards: [
      { factionId: 'kingdom_of_ateria', amount: 5 },
      { factionId: 'merchant_confederation', amount: 5 },
    ],
    influenceReward: 40,
    baseSuccessChance: 45,
    statBonus: [
      { stat: 'charisma', weight: 0.3 },
      { stat: 'persuasion', weight: 0.3 },
      { stat: 'renown', weight: 0.2 },
      { stat: 'intrigue', weight: 0.1 },
    ],
    cooldown: 2000,
    repeatable: true,
  },
};

// ============================================
// DIPLOMAT XP CALCULATION
// ============================================

export function calculateDiplomatXpToLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.2, level - 1));
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getFaction(id: FactionId): Faction {
  return FACTIONS[id];
}

export function getMission(id: string): DiplomatMission | undefined {
  return DIPLOMAT_MISSIONS[id];
}

export function getAvailableMissions(
  level: number,
  stats: DiplomatStats,
  reputations: Record<FactionId, number>
): DiplomatMission[] {
  return Object.values(DIPLOMAT_MISSIONS).filter(mission => {
    // Check level
    if (mission.requiredLevel > level) return false;
    
    // Check reputation
    if (mission.requiredReputation) {
      const rep = reputations[mission.requiredReputation.factionId] || 0;
      const tier = getReputationTier(rep);
      const requiredTier = mission.requiredReputation.minTier;
      const tierOrder: ReputationTier[] = ['hostile', 'unfriendly', 'neutral', 'friendly', 'honored', 'allied'];
      if (tierOrder.indexOf(tier) < tierOrder.indexOf(requiredTier)) return false;
    }
    
    // Check stats
    if (mission.requiredStats) {
      for (const [stat, required] of Object.entries(mission.requiredStats)) {
        if (stats[stat as keyof DiplomatStats] < required) return false;
      }
    }
    
    return true;
  });
}

export function calculateMissionSuccessChance(
  mission: DiplomatMission,
  stats: DiplomatStats,
  bonuses: number = 0
): number {
  let chance = mission.baseSuccessChance;
  
  for (const bonus of mission.statBonus) {
    const statValue = stats[bonus.stat];
    chance += statValue * bonus.weight;
  }
  
  chance += bonuses;
  
  return Math.min(95, Math.max(5, chance)); // Cap between 5% and 95%
}
