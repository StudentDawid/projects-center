/**
 * Exploration Data - World Map, Regions, POIs, Events
 */

export type RegionId = 
  | 'verdant_plains' | 'whispering_woods' | 'crystal_peaks' 
  | 'scorched_wastes' | 'frozen_tundra' | 'shadow_marshes'
  | 'ancient_ruins' | 'celestial_islands' | 'abyssal_depths'
  | 'dragon_spine' | 'mystic_grove' | 'iron_fortress';

export type POIType = 'ruins' | 'village' | 'dungeon' | 'shrine' | 'cave' | 'tower' | 'camp' | 'oasis' | 'portal' | 'secret';
export type EventType = 'combat' | 'treasure' | 'merchant' | 'npc' | 'trap' | 'blessing' | 'mystery' | 'nothing';
export type TerrainType = 'plains' | 'forest' | 'mountain' | 'desert' | 'tundra' | 'swamp' | 'volcanic' | 'ocean' | 'void';

export interface MapTile {
  x: number;
  y: number;
  terrain: TerrainType;
  regionId: RegionId;
  isDiscovered: boolean;
  hasPOI: boolean;
  poiId?: string;
}

export interface PointOfInterest {
  id: string;
  name: string;
  description: string;
  type: POIType;
  regionId: RegionId;
  x: number;
  y: number;
  icon: string;
  requiredLevel: number;
  rewards: {
    gold?: number;
    xp?: number;
    items?: string[];
    loreUnlock?: string;
  };
  isRepeatable: boolean;
  cooldownHours?: number;
  specialEvent?: string;
}

export interface WorldRegion {
  id: RegionId;
  name: string;
  description: string;
  lore: string;
  terrain: TerrainType;
  icon: string;
  color: string;
  level: number;
  unlockRequirement?: {
    type: 'level' | 'region' | 'quest' | 'item';
    value: string | number;
  };
  travelTime: number; // minutes
  dangerLevel: number; // 1-10
  pois: string[]; // POI IDs
  connectedRegions: RegionId[];
  environmentEffects?: string[];
  specialResources?: string[];
}

export interface TravelEvent {
  id: string;
  name: string;
  description: string;
  type: EventType;
  icon: string;
  chance: number; // 0-100
  regionTypes: TerrainType[];
  minLevel: number;
  outcomes: {
    id: string;
    text: string;
    chance: number;
    rewards?: { gold?: number; xp?: number; items?: string[]; loreUnlock?: string };
    damage?: number;
    effect?: string;
  }[];
}

export interface Expedition {
  id: string;
  name: string;
  description: string;
  targetRegion: RegionId;
  targetPOI?: string;
  duration: number; // minutes
  requiredLevel: number;
  requiredItems?: { itemId: string; amount: number }[];
  rewards: {
    gold: number;
    xp: number;
    items?: string[];
    discoveryChance: number;
    loreUnlock?: string;
  };
}

// ============================================
// WORLD REGIONS
// ============================================

export const WORLD_REGIONS: Record<RegionId, WorldRegion> = {
  verdant_plains: {
    id: 'verdant_plains',
    name: 'Zielone Równiny',
    description: 'Rozległe, żyzne tereny stanowiące serce królestwa.',
    lore: 'Zielone Równiny to kolebka cywilizacji Aterii. Tu powstały pierwsze osady, które z czasem rozrosły się w potężne miasta.',
    terrain: 'plains',
    icon: 'mdi-grass',
    color: '#8BC34A',
    level: 1,
    travelTime: 5,
    dangerLevel: 1,
    pois: ['starter_village', 'old_mill', 'crossroads_inn', 'farmers_market'],
    connectedRegions: ['whispering_woods', 'crystal_peaks', 'scorched_wastes'],
    specialResources: ['wheat', 'herbs', 'wool'],
  },
  whispering_woods: {
    id: 'whispering_woods',
    name: 'Szepczący Las',
    description: 'Pradawny las pełen tajemnic i magii.',
    lore: 'Drzewa Szepczącego Lasu pamiętają czasy, gdy bogowie chodzili po ziemi. Mówi się, że las sam wybiera, kogo wpuścić w swoje głębiny.',
    terrain: 'forest',
    icon: 'mdi-pine-tree',
    color: '#2E7D32',
    level: 5,
    unlockRequirement: { type: 'level', value: 5 },
    travelTime: 15,
    dangerLevel: 3,
    pois: ['druids_grove', 'ancient_oak', 'fairy_circle', 'hunters_lodge', 'wolf_den'],
    connectedRegions: ['verdant_plains', 'mystic_grove', 'shadow_marshes'],
    environmentEffects: ['nature_blessing'],
    specialResources: ['rare_herbs', 'ancient_wood', 'mushrooms'],
  },
  crystal_peaks: {
    id: 'crystal_peaks',
    name: 'Kryształowe Szczyty',
    description: 'Majestatyczne góry pełne cennych minerałów.',
    lore: 'Kryształowe Szczyty skrywają niezliczone bogactwa. Karły od wieków drążą tu swoje kopalnie, odkrywając coraz głębsze warstwy skał.',
    terrain: 'mountain',
    icon: 'mdi-mountain',
    color: '#78909C',
    level: 10,
    unlockRequirement: { type: 'level', value: 10 },
    travelTime: 30,
    dangerLevel: 5,
    pois: ['dwarven_mine', 'eagles_nest', 'crystal_cave', 'mountain_shrine', 'abandoned_fortress'],
    connectedRegions: ['verdant_plains', 'frozen_tundra', 'iron_fortress'],
    environmentEffects: ['thin_air'],
    specialResources: ['mithril', 'crystals', 'gems'],
  },
  scorched_wastes: {
    id: 'scorched_wastes',
    name: 'Spalone Pustkowia',
    description: 'Rozległe, gorące pustynie z ruinami starożytnej cywilizacji.',
    lore: 'Przed tysiącami lat ta kraina była kwitnącym imperium. Dziś pozostały tylko ruiny i wieczny piasek, świadectwo pychy starożytnych magów.',
    terrain: 'desert',
    icon: 'mdi-weather-sunny',
    color: '#FF9800',
    level: 15,
    unlockRequirement: { type: 'level', value: 15 },
    travelTime: 45,
    dangerLevel: 6,
    pois: ['lost_oasis', 'buried_temple', 'nomad_camp', 'sphinx_riddle', 'sun_altar'],
    connectedRegions: ['verdant_plains', 'ancient_ruins', 'dragon_spine'],
    environmentEffects: ['heat_exhaustion'],
    specialResources: ['gold_dust', 'cactus_water', 'ancient_relics'],
  },
  frozen_tundra: {
    id: 'frozen_tundra',
    name: 'Mroźna Tundra',
    description: 'Lodowe pustkowia na północnych krańcach świata.',
    lore: 'Mroźna Tundra to kraina wiecznego zimna, gdzie mieszkają tylko najodważniejsi. Legendy mówią o starożytnych istotach uwięzionych pod lodem.',
    terrain: 'tundra',
    icon: 'mdi-snowflake',
    color: '#B3E5FC',
    level: 20,
    unlockRequirement: { type: 'level', value: 20 },
    travelTime: 60,
    dangerLevel: 7,
    pois: ['frost_giant_hall', 'ice_cavern', 'mammoth_graveyard', 'northern_lights_shrine', 'frozen_lake'],
    connectedRegions: ['crystal_peaks', 'shadow_marshes'],
    environmentEffects: ['frostbite'],
    specialResources: ['eternal_ice', 'mammoth_ivory', 'frost_flowers'],
  },
  shadow_marshes: {
    id: 'shadow_marshes',
    name: 'Cieniste Bagna',
    description: 'Mroczne mokradła pełne niebezpieczeństw i sekretów.',
    lore: 'Cieniste Bagna to miejsce, gdzie światło i cień przeplatają się w dziwacznym tańcu. Wielu wędrowców zaginęło w tych wodach.',
    terrain: 'swamp',
    icon: 'mdi-water',
    color: '#5D4037',
    level: 18,
    unlockRequirement: { type: 'level', value: 18 },
    travelTime: 40,
    dangerLevel: 7,
    pois: ['witch_hut', 'sunken_temple', 'will_o_wisp_grove', 'dead_tree', 'lizardfolk_village'],
    connectedRegions: ['whispering_woods', 'frozen_tundra', 'abyssal_depths'],
    environmentEffects: ['poison_mist'],
    specialResources: ['swamp_gas', 'rare_poisons', 'bog_iron'],
  },
  ancient_ruins: {
    id: 'ancient_ruins',
    name: 'Starożytne Ruiny',
    description: 'Pozostałości zaginionej cywilizacji pełne skarbów i pułapek.',
    lore: 'Starożytne Ruiny to wszystko, co pozostało po Imperium Złotego Słońca. Ich technologia i magia przewyższały wszystko, co znamy dziś.',
    terrain: 'plains',
    icon: 'mdi-pillar',
    color: '#A1887F',
    level: 25,
    unlockRequirement: { type: 'level', value: 25 },
    travelTime: 50,
    dangerLevel: 8,
    pois: ['grand_library', 'throne_room', 'treasury_vault', 'golem_factory', 'observatory'],
    connectedRegions: ['scorched_wastes', 'celestial_islands'],
    environmentEffects: ['arcane_instability'],
    specialResources: ['ancient_tech', 'arcane_crystals', 'lost_knowledge'],
  },
  celestial_islands: {
    id: 'celestial_islands',
    name: 'Niebiańskie Wyspy',
    description: 'Unoszące się w powietrzu wyspy dotknięte boską mocą.',
    lore: 'Niebiańskie Wyspy to fragmenty ziemi uniesione przez bogów podczas Wielkiego Podniesienia. Tu niebo spotyka się z ziemią.',
    terrain: 'ocean',
    icon: 'mdi-island',
    color: '#E1BEE7',
    level: 30,
    unlockRequirement: { type: 'level', value: 30 },
    travelTime: 90,
    dangerLevel: 8,
    pois: ['sky_temple', 'cloud_garden', 'phoenix_nest', 'star_observatory', 'angel_sanctum'],
    connectedRegions: ['ancient_ruins', 'dragon_spine'],
    environmentEffects: ['celestial_blessing'],
    specialResources: ['star_dust', 'cloud_essence', 'phoenix_feathers'],
  },
  abyssal_depths: {
    id: 'abyssal_depths',
    name: 'Otchłanne Głębiny',
    description: 'Podziemny świat ciemności i koszmarów.',
    lore: 'Otchłanne Głębiny to królestwo pod powierzchnią, gdzie światło nigdy nie dociera. Mieszkańcy powierzchni opowiadają o tym miejscu tylko szeptem.',
    terrain: 'void',
    icon: 'mdi-blur',
    color: '#311B92',
    level: 35,
    unlockRequirement: { type: 'level', value: 35 },
    travelTime: 120,
    dangerLevel: 9,
    pois: ['dark_citadel', 'mushroom_forest', 'demon_gate', 'eternal_prison', 'void_tear'],
    connectedRegions: ['shadow_marshes', 'dragon_spine'],
    environmentEffects: ['void_corruption'],
    specialResources: ['void_crystals', 'demon_essence', 'dark_steel'],
  },
  dragon_spine: {
    id: 'dragon_spine',
    name: 'Smocze Góry',
    description: 'Wulkaniczne góry zamieszkałe przez smoki.',
    lore: 'Smocze Góry to miejsce narodzin smoków. Wulkany dostarczają ciepła, którego potrzebują jaja, a jaskinie służą za siedliska.',
    terrain: 'volcanic',
    icon: 'mdi-fire',
    color: '#D32F2F',
    level: 35,
    unlockRequirement: { type: 'level', value: 35 },
    travelTime: 100,
    dangerLevel: 10,
    pois: ['dragon_nest', 'volcano_heart', 'obsidian_forge', 'fire_temple', 'dragon_graveyard'],
    connectedRegions: ['scorched_wastes', 'celestial_islands', 'abyssal_depths'],
    environmentEffects: ['volcanic_heat'],
    specialResources: ['dragon_scales', 'obsidian', 'fire_gems'],
  },
  mystic_grove: {
    id: 'mystic_grove',
    name: 'Mistyczny Gaj',
    description: 'Święte miejsce magii i duchów natury.',
    lore: 'Mistyczny Gaj to serce magii natury w Aterii. Tu rodzą się wróżki, a duchy drzew tańczą przy świetle księżyca.',
    terrain: 'forest',
    icon: 'mdi-flower',
    color: '#7B1FA2',
    level: 25,
    unlockRequirement: { type: 'level', value: 25 },
    travelTime: 35,
    dangerLevel: 5,
    pois: ['fairy_queen_court', 'moonwell', 'spirit_tree', 'enchanted_pond', 'unicorn_meadow'],
    connectedRegions: ['whispering_woods'],
    environmentEffects: ['magic_amplification'],
    specialResources: ['fairy_dust', 'moonflowers', 'spirit_essence'],
  },
  iron_fortress: {
    id: 'iron_fortress',
    name: 'Żelazna Forteca',
    description: 'Starożytna twierdza krasnoludów.',
    lore: 'Żelazna Forteca to ostatni bastion krasnoludzkiego królestwa. Jej mury nigdy nie zostały zdobyte, a kuźnie wciąż płoną.',
    terrain: 'mountain',
    icon: 'mdi-castle',
    color: '#455A64',
    level: 30,
    unlockRequirement: { type: 'level', value: 30 },
    travelTime: 70,
    dangerLevel: 6,
    pois: ['great_forge', 'kings_hall', 'armory', 'deep_mines', 'hall_of_ancestors'],
    connectedRegions: ['crystal_peaks'],
    environmentEffects: ['dwarven_blessing'],
    specialResources: ['dwarven_steel', 'rune_stones', 'ancient_weapons'],
  },
};

// ============================================
// POINTS OF INTEREST
// ============================================

export const POINTS_OF_INTEREST: Record<string, PointOfInterest> = {
  // Verdant Plains
  starter_village: {
    id: 'starter_village', name: 'Wioska Początkowa', description: 'Mała, spokojna wioska - idealne miejsce na początek przygody.',
    type: 'village', regionId: 'verdant_plains', x: 5, y: 5, icon: 'mdi-home-group', requiredLevel: 1,
    rewards: { gold: 100, xp: 50, loreUnlock: 'lore_verdant_history' }, isRepeatable: true, cooldownHours: 24,
  },
  old_mill: {
    id: 'old_mill', name: 'Stary Młyn', description: 'Opuszczony młyn nad rzeką. Podobno straszy.',
    type: 'ruins', regionId: 'verdant_plains', x: 8, y: 3, icon: 'mdi-turbine', requiredLevel: 3,
    rewards: { gold: 200, xp: 100, items: ['wheat_bundle'], loreUnlock: 'lore_millers_ghost' }, isRepeatable: true, cooldownHours: 48,
  },
  crossroads_inn: {
    id: 'crossroads_inn', name: 'Gospoda na Rozstajach', description: 'Popularne miejsce spotkań podróżnych.',
    type: 'village', regionId: 'verdant_plains', x: 10, y: 8, icon: 'mdi-glass-mug-variant', requiredLevel: 1,
    rewards: { gold: 50, xp: 25 }, isRepeatable: true, cooldownHours: 12, specialEvent: 'merchant_encounter',
  },
  farmers_market: {
    id: 'farmers_market', name: 'Targ Rolników', description: 'Cotygodniowy targ z lokalnymi produktami.',
    type: 'village', regionId: 'verdant_plains', x: 6, y: 10, icon: 'mdi-cart', requiredLevel: 1,
    rewards: { gold: 150, items: ['fresh_vegetables'] }, isRepeatable: true, cooldownHours: 168,
  },

  // Whispering Woods
  druids_grove: {
    id: 'druids_grove', name: 'Gaj Druidów', description: 'Święte miejsce druidów, pełne naturalnej magii.',
    type: 'shrine', regionId: 'whispering_woods', x: 3, y: 7, icon: 'mdi-leaf', requiredLevel: 8,
    rewards: { xp: 300, loreUnlock: 'lore_druidic_order' }, isRepeatable: false,
  },
  ancient_oak: {
    id: 'ancient_oak', name: 'Pradawny Dąb', description: 'Tysiącletnie drzewo, świadek historii.',
    type: 'shrine', regionId: 'whispering_woods', x: 5, y: 5, icon: 'mdi-tree', requiredLevel: 10,
    rewards: { xp: 500, items: ['ancient_acorn'], loreUnlock: 'lore_world_tree' }, isRepeatable: false,
  },
  fairy_circle: {
    id: 'fairy_circle', name: 'Krąg Wróżek', description: 'Magiczny krąg grzybów, gdzie tańczą wróżki.',
    type: 'secret', regionId: 'whispering_woods', x: 7, y: 3, icon: 'mdi-mushroom', requiredLevel: 12,
    rewards: { gold: 500, xp: 400, items: ['fairy_dust'], loreUnlock: 'lore_fey_realm' }, isRepeatable: true, cooldownHours: 72,
  },
  hunters_lodge: {
    id: 'hunters_lodge', name: 'Chata Łowców', description: 'Baza miejscowych łowców.',
    type: 'camp', regionId: 'whispering_woods', x: 9, y: 6, icon: 'mdi-bow-arrow', requiredLevel: 5,
    rewards: { gold: 100, items: ['hunting_trophy'] }, isRepeatable: true, cooldownHours: 24,
  },
  wolf_den: {
    id: 'wolf_den', name: 'Wilcze Legowisko', description: 'Jaskinia zamieszkała przez watahę wilków.',
    type: 'cave', regionId: 'whispering_woods', x: 2, y: 9, icon: 'mdi-paw', requiredLevel: 7,
    rewards: { gold: 250, xp: 200, items: ['wolf_pelt'] }, isRepeatable: true, cooldownHours: 48,
  },

  // Crystal Peaks
  dwarven_mine: {
    id: 'dwarven_mine', name: 'Krasnoludzka Kopalnia', description: 'Starożytna kopalnia pełna cennych minerałów.',
    type: 'dungeon', regionId: 'crystal_peaks', x: 4, y: 3, icon: 'mdi-pickaxe', requiredLevel: 12,
    rewards: { gold: 800, xp: 600, items: ['mithril_ore'], loreUnlock: 'lore_dwarven_kingdom' }, isRepeatable: true, cooldownHours: 72,
  },
  eagles_nest: {
    id: 'eagles_nest', name: 'Gniazdo Orłów', description: 'Szczyt gdzie gniazdują gigantyczne orły.',
    type: 'secret', regionId: 'crystal_peaks', x: 8, y: 2, icon: 'mdi-bird', requiredLevel: 15,
    rewards: { xp: 400, items: ['eagle_feather'], loreUnlock: 'lore_sky_lords' }, isRepeatable: true, cooldownHours: 96,
  },
  crystal_cave: {
    id: 'crystal_cave', name: 'Kryształowa Jaskinia', description: 'Jaskinia pełna świecących kryształów.',
    type: 'cave', regionId: 'crystal_peaks', x: 6, y: 7, icon: 'mdi-diamond-stone', requiredLevel: 14,
    rewards: { gold: 600, items: ['magic_crystal'] }, isRepeatable: true, cooldownHours: 48,
  },
  mountain_shrine: {
    id: 'mountain_shrine', name: 'Świątynia Górska', description: 'Starożytna świątynia poświęcona bogom gór.',
    type: 'shrine', regionId: 'crystal_peaks', x: 5, y: 5, icon: 'mdi-church', requiredLevel: 13,
    rewards: { xp: 350, loreUnlock: 'lore_mountain_gods' }, isRepeatable: false,
  },
  abandoned_fortress: {
    id: 'abandoned_fortress', name: 'Opuszczona Forteca', description: 'Ruiny twierdzy na szczycie góry.',
    type: 'ruins', regionId: 'crystal_peaks', x: 9, y: 8, icon: 'mdi-castle', requiredLevel: 16,
    rewards: { gold: 1000, xp: 700, items: ['ancient_weapon'], loreUnlock: 'lore_mountain_war' }, isRepeatable: true, cooldownHours: 120,
  },

  // Scorched Wastes
  lost_oasis: {
    id: 'lost_oasis', name: 'Zagubiona Oaza', description: 'Ukryta oaza na środku pustyni.',
    type: 'oasis', regionId: 'scorched_wastes', x: 3, y: 5, icon: 'mdi-palm-tree', requiredLevel: 15,
    rewards: { gold: 400, items: ['desert_flower'], loreUnlock: 'lore_desert_people' }, isRepeatable: true, cooldownHours: 48,
  },
  buried_temple: {
    id: 'buried_temple', name: 'Pogrzebana Świątynia', description: 'Starożytna świątynia wyłaniająca się z piasku.',
    type: 'ruins', regionId: 'scorched_wastes', x: 7, y: 4, icon: 'mdi-pyramid', requiredLevel: 18,
    rewards: { gold: 1500, xp: 1000, items: ['ancient_artifact'], loreUnlock: 'lore_sun_empire' }, isRepeatable: true, cooldownHours: 168,
  },
  nomad_camp: {
    id: 'nomad_camp', name: 'Obóz Nomadów', description: 'Tymczasowy obóz pustynnych wędrowców.',
    type: 'camp', regionId: 'scorched_wastes', x: 5, y: 8, icon: 'mdi-tent', requiredLevel: 15,
    rewards: { gold: 200, items: ['camel_milk'] }, isRepeatable: true, cooldownHours: 24, specialEvent: 'nomad_trade',
  },
  sphinx_riddle: {
    id: 'sphinx_riddle', name: 'Zagadka Sfinksa', description: 'Gigantyczny sfinks strzegący sekretów.',
    type: 'secret', regionId: 'scorched_wastes', x: 8, y: 6, icon: 'mdi-cat', requiredLevel: 20,
    rewards: { gold: 2000, xp: 1500, loreUnlock: 'lore_sphinx_wisdom' }, isRepeatable: false,
  },
  sun_altar: {
    id: 'sun_altar', name: 'Ołtarz Słońca', description: 'Miejsce kultu starożytnego boga słońca.',
    type: 'shrine', regionId: 'scorched_wastes', x: 4, y: 2, icon: 'mdi-white-balance-sunny', requiredLevel: 17,
    rewards: { xp: 800, loreUnlock: 'lore_sun_god' }, isRepeatable: false,
  },

  // Frozen Tundra
  frost_giant_hall: {
    id: 'frost_giant_hall', name: 'Sala Lodowych Gigantów', description: 'Siedziba władcy mroźnych olbrzymów.',
    type: 'dungeon', regionId: 'frozen_tundra', x: 5, y: 3, icon: 'mdi-castle', requiredLevel: 22,
    rewards: { gold: 2000, xp: 1500, items: ['giant_ice'], loreUnlock: 'lore_frost_giants' }, isRepeatable: true, cooldownHours: 168,
  },
  ice_cavern: {
    id: 'ice_cavern', name: 'Lodowa Pieczara', description: 'Naturalna jaskinia z formacjami lodowymi.',
    type: 'cave', regionId: 'frozen_tundra', x: 8, y: 5, icon: 'mdi-snowflake', requiredLevel: 20,
    rewards: { gold: 700, items: ['eternal_ice'] }, isRepeatable: true, cooldownHours: 72,
  },
  mammoth_graveyard: {
    id: 'mammoth_graveyard', name: 'Cmentarzysko Mamutów', description: 'Miejsce, gdzie mamuty przychodzą umierać.',
    type: 'ruins', regionId: 'frozen_tundra', x: 3, y: 7, icon: 'mdi-elephant', requiredLevel: 21,
    rewards: { gold: 1200, xp: 800, items: ['mammoth_tusk'], loreUnlock: 'lore_ancient_beasts' }, isRepeatable: true, cooldownHours: 120,
  },
  northern_lights_shrine: {
    id: 'northern_lights_shrine', name: 'Świątynia Zorzy', description: 'Święte miejsce poświęcone zorzy polarnej.',
    type: 'shrine', regionId: 'frozen_tundra', x: 6, y: 2, icon: 'mdi-aurora', requiredLevel: 23,
    rewards: { xp: 1000, loreUnlock: 'lore_aurora_spirits' }, isRepeatable: false,
  },
  frozen_lake: {
    id: 'frozen_lake', name: 'Zamarzłe Jezioro', description: 'Ogromne jezioro pokryte wiecznym lodem.',
    type: 'secret', regionId: 'frozen_tundra', x: 7, y: 8, icon: 'mdi-waves', requiredLevel: 20,
    rewards: { gold: 500, items: ['frozen_fish'] }, isRepeatable: true, cooldownHours: 48,
  },

  // More POIs for other regions...
  witch_hut: {
    id: 'witch_hut', name: 'Chata Wiedźmy', description: 'Krzywa chatka na kurzych nóżkach.',
    type: 'secret', regionId: 'shadow_marshes', x: 4, y: 5, icon: 'mdi-home-variant', requiredLevel: 18,
    rewards: { gold: 800, xp: 600, items: ['witch_brew'], loreUnlock: 'lore_swamp_witch' }, isRepeatable: true, cooldownHours: 96,
  },
  grand_library: {
    id: 'grand_library', name: 'Wielka Biblioteka', description: 'Ruiny największej biblioteki starożytności.',
    type: 'ruins', regionId: 'ancient_ruins', x: 5, y: 5, icon: 'mdi-book-open-page-variant', requiredLevel: 25,
    rewards: { xp: 2000, items: ['ancient_tome'], loreUnlock: 'lore_lost_knowledge' }, isRepeatable: false,
  },
  sky_temple: {
    id: 'sky_temple', name: 'Niebiańska Świątynia', description: 'Świątynia na szczycie unoszacej się wyspy.',
    type: 'shrine', regionId: 'celestial_islands', x: 5, y: 5, icon: 'mdi-church', requiredLevel: 30,
    rewards: { xp: 3000, loreUnlock: 'lore_celestial_beings' }, isRepeatable: false,
  },
  dragon_nest: {
    id: 'dragon_nest', name: 'Smocze Gniazdo', description: 'Legowisko starożytnego smoka.',
    type: 'dungeon', regionId: 'dragon_spine', x: 5, y: 5, icon: 'mdi-dragon', requiredLevel: 35,
    rewards: { gold: 5000, xp: 4000, items: ['dragon_scale'], loreUnlock: 'lore_dragon_lords' }, isRepeatable: true, cooldownHours: 336,
  },
  dark_citadel: {
    id: 'dark_citadel', name: 'Mroczna Cytadela', description: 'Forteca władców podziemi.',
    type: 'dungeon', regionId: 'abyssal_depths', x: 5, y: 5, icon: 'mdi-castle', requiredLevel: 35,
    rewards: { gold: 4000, xp: 3500, items: ['void_essence'], loreUnlock: 'lore_void_lords' }, isRepeatable: true, cooldownHours: 336,
  },
  fairy_queen_court: {
    id: 'fairy_queen_court', name: 'Dwór Królowej Wróżek', description: 'Siedziba władczyni krainy fey.',
    type: 'shrine', regionId: 'mystic_grove', x: 5, y: 5, icon: 'mdi-crown', requiredLevel: 25,
    rewards: { xp: 2500, items: ['fairy_blessing'], loreUnlock: 'lore_fairy_queen' }, isRepeatable: false,
  },
  great_forge: {
    id: 'great_forge', name: 'Wielka Kuźnia', description: 'Legendarna kuźnia krasnoludów.',
    type: 'dungeon', regionId: 'iron_fortress', x: 5, y: 5, icon: 'mdi-anvil', requiredLevel: 30,
    rewards: { gold: 3000, xp: 2500, items: ['dwarven_masterwork'], loreUnlock: 'lore_dwarven_crafting' }, isRepeatable: true, cooldownHours: 168,
  },
};

// ============================================
// TRAVEL EVENTS
// ============================================

export const TRAVEL_EVENTS: TravelEvent[] = [
  {
    id: 'bandit_ambush', name: 'Zasadzka Bandytów', description: 'Bandyci wyskakują z ukrycia!',
    type: 'combat', icon: 'mdi-sword-cross', chance: 15, regionTypes: ['plains', 'forest', 'mountain'],
    minLevel: 1,
    outcomes: [
      { id: 'fight', text: 'Walcz z bandytami', chance: 60, rewards: { gold: 100, xp: 50 } },
      { id: 'flee', text: 'Uciekasz', chance: 30, damage: 10 },
      { id: 'bribe', text: 'Przekupujesz ich', chance: 10, rewards: { gold: -50 } },
    ],
  },
  {
    id: 'hidden_cache', name: 'Ukryty Skarb', description: 'Znajdujesz ukrytą skrzynię!',
    type: 'treasure', icon: 'mdi-treasure-chest', chance: 10, regionTypes: ['plains', 'forest', 'mountain', 'desert', 'swamp'],
    minLevel: 1,
    outcomes: [
      { id: 'open', text: 'Otwierasz skrzynię', chance: 70, rewards: { gold: 200, items: ['random_gem'] } },
      { id: 'trap', text: 'Pułapka!', chance: 20, damage: 20 },
      { id: 'empty', text: 'Skrzynia jest pusta', chance: 10 },
    ],
  },
  {
    id: 'wandering_merchant', name: 'Wędrowny Kupiec', description: 'Spotykasz handlarza z egzotycznymi towarami.',
    type: 'merchant', icon: 'mdi-cart', chance: 12, regionTypes: ['plains', 'desert', 'forest'],
    minLevel: 5,
    outcomes: [
      { id: 'trade', text: 'Handlujesz', chance: 80, rewards: { items: ['merchant_goods'] } },
      { id: 'rare', text: 'Rzadki przedmiot!', chance: 15, rewards: { items: ['rare_artifact'] } },
      { id: 'scam', text: 'To oszust', chance: 5, rewards: { gold: -100 } },
    ],
  },
  {
    id: 'mysterious_stranger', name: 'Tajemniczy Nieznajomy', description: 'Spotykasz enigmatyczną postać.',
    type: 'npc', icon: 'mdi-account-question', chance: 8, regionTypes: ['forest', 'swamp', 'void'],
    minLevel: 10,
    outcomes: [
      { id: 'help', text: 'Pomagasz', chance: 50, rewards: { xp: 100, loreUnlock: 'lore_mysterious_order' } },
      { id: 'gift', text: 'Otrzymujesz dar', chance: 30, rewards: { items: ['mysterious_gift'] } },
      { id: 'vanish', text: 'Znika bez śladu', chance: 20 },
    ],
  },
  {
    id: 'ancient_blessing', name: 'Starożytne Błogosławieństwo', description: 'Odnajdujesz święte miejsce.',
    type: 'blessing', icon: 'mdi-star-four-points', chance: 5, regionTypes: ['forest', 'mountain', 'plains'],
    minLevel: 15,
    outcomes: [
      { id: 'blessed', text: 'Otrzymujesz błogosławieństwo', chance: 80, effect: 'stat_boost', rewards: { xp: 200 } },
      { id: 'vision', text: 'Masz wizję', chance: 20, rewards: { loreUnlock: 'lore_ancient_gods' } },
    ],
  },
  {
    id: 'desert_mirage', name: 'Pustynny Miraż', description: 'Widzisz coś na horyzoncie...',
    type: 'mystery', icon: 'mdi-weather-hazy', chance: 20, regionTypes: ['desert'],
    minLevel: 15,
    outcomes: [
      { id: 'oasis', text: 'To prawdziwa oaza!', chance: 30, rewards: { gold: 300 } },
      { id: 'mirage', text: 'To tylko miraż', chance: 50, damage: 5 },
      { id: 'treasure', text: 'Ukryty skarb!', chance: 20, rewards: { gold: 500, items: ['desert_artifact'] } },
    ],
  },
  {
    id: 'void_whispers', name: 'Szepty Pustki', description: 'Słyszysz głosy z nicości...',
    type: 'mystery', icon: 'mdi-blur', chance: 25, regionTypes: ['void'],
    minLevel: 30,
    outcomes: [
      { id: 'resist', text: 'Opierasz się', chance: 40, rewards: { xp: 500 } },
      { id: 'listen', text: 'Słuchasz', chance: 35, rewards: { loreUnlock: 'lore_void_secrets' }, damage: 30 },
      { id: 'madness', text: 'Szaleństwo!', chance: 25, damage: 50, effect: 'confusion' },
    ],
  },
  {
    id: 'nothing_happens', name: 'Spokojna Podróż', description: 'Podróż przebiega bez incydentów.',
    type: 'nothing', icon: 'mdi-check', chance: 30, regionTypes: ['plains', 'forest', 'mountain', 'desert', 'tundra', 'swamp', 'volcanic', 'ocean', 'void'],
    minLevel: 1,
    outcomes: [
      { id: 'peaceful', text: 'Nic się nie dzieje', chance: 100 },
    ],
  },
];

// ============================================
// EXPEDITIONS
// ============================================

export const EXPEDITIONS: Expedition[] = [
  {
    id: 'scout_plains', name: 'Zwiad Równin', description: 'Zbadaj okolice Zielonych Równin.',
    targetRegion: 'verdant_plains', duration: 15, requiredLevel: 1,
    rewards: { gold: 100, xp: 75, discoveryChance: 30 },
  },
  {
    id: 'forest_survey', name: 'Eksploracja Lasu', description: 'Zagłęb się w Szepczący Las.',
    targetRegion: 'whispering_woods', duration: 30, requiredLevel: 5,
    rewards: { gold: 250, xp: 200, discoveryChance: 25, items: ['forest_herbs'] },
  },
  {
    id: 'mountain_climb', name: 'Wspinaczka Górska', description: 'Zdobądź Kryształowe Szczyty.',
    targetRegion: 'crystal_peaks', duration: 60, requiredLevel: 10,
    requiredItems: [{ itemId: 'climbing_gear', amount: 1 }],
    rewards: { gold: 500, xp: 400, discoveryChance: 20, items: ['raw_crystal'] },
  },
  {
    id: 'desert_trek', name: 'Wyprawa Pustynna', description: 'Przemierz Spalone Pustkowia.',
    targetRegion: 'scorched_wastes', duration: 90, requiredLevel: 15,
    requiredItems: [{ itemId: 'water_supply', amount: 3 }],
    rewards: { gold: 800, xp: 600, discoveryChance: 15, items: ['ancient_coin'] },
  },
  {
    id: 'arctic_expedition', name: 'Ekspedycja Arktyczna', description: 'Zbadaj Mroźną Tundrę.',
    targetRegion: 'frozen_tundra', duration: 120, requiredLevel: 20,
    requiredItems: [{ itemId: 'warm_clothes', amount: 1 }, { itemId: 'rations', amount: 5 }],
    rewards: { gold: 1200, xp: 1000, discoveryChance: 15, items: ['frost_crystal'], loreUnlock: 'lore_frozen_lands' },
  },
  {
    id: 'dragon_hunt', name: 'Łowy na Smoka', description: 'Wyprawa do Smoczych Gór.',
    targetRegion: 'dragon_spine', duration: 240, requiredLevel: 35,
    requiredItems: [{ itemId: 'dragon_bait', amount: 1 }, { itemId: 'fire_resistance_potion', amount: 3 }],
    rewards: { gold: 5000, xp: 4000, discoveryChance: 10, items: ['dragon_scale'], loreUnlock: 'lore_dragon_lore' },
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getRegion(id: RegionId): WorldRegion | undefined {
  return WORLD_REGIONS[id];
}

export function getPOI(id: string): PointOfInterest | undefined {
  return POINTS_OF_INTEREST[id];
}

export function getRegionPOIs(regionId: RegionId): PointOfInterest[] {
  return Object.values(POINTS_OF_INTEREST).filter(poi => poi.regionId === regionId);
}

export function getUnlockedRegions(level: number): WorldRegion[] {
  return Object.values(WORLD_REGIONS).filter(region => {
    if (!region.unlockRequirement) return true;
    if (region.unlockRequirement.type === 'level') {
      return level >= (region.unlockRequirement.value as number);
    }
    return false;
  });
}

export function getRandomEvent(terrain: TerrainType, level: number): TravelEvent | null {
  const possibleEvents = TRAVEL_EVENTS.filter(event => 
    event.regionTypes.includes(terrain) && level >= event.minLevel
  );
  
  if (possibleEvents.length === 0) return null;
  
  const totalChance = possibleEvents.reduce((sum, e) => sum + e.chance, 0);
  let roll = Math.random() * totalChance;
  
  for (const event of possibleEvents) {
    roll -= event.chance;
    if (roll <= 0) return event;
  }
  
  return possibleEvents[0];
}

export function getAllRegionIds(): RegionId[] {
  return Object.keys(WORLD_REGIONS) as RegionId[];
}
