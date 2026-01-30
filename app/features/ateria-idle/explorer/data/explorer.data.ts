/**
 * Explorer Path Data - Expeditions, Discoveries, Artifacts
 */

// ============================================
// TYPES
// ============================================

export type TerrainType = 'forest' | 'mountain' | 'desert' | 'swamp' | 'tundra' | 'ruins' | 'underwater' | 'void';

export type DiscoveryType = 'location' | 'treasure' | 'artifact' | 'creature' | 'lore';

export type ExpeditionDifficulty = 'easy' | 'medium' | 'hard' | 'extreme' | 'legendary';

export interface Region {
  id: string;
  name: string;
  description: string;
  icon: string;
  terrain: TerrainType;
  
  // Requirements
  requiredLevel: number;
  requiredGear?: string[];
  
  // Exploration data
  totalDiscoveries: number;
  baseExploreTime: number;
  
  // Rewards
  xpPerExplore: number;
  goldRange: [number, number];
  possibleDiscoveries: string[];
}

export interface Discovery {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: DiscoveryType;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  regionId: string;
  
  // Rewards
  xpReward: number;
  goldReward?: number;
  itemReward?: string;
  loreUnlock?: string;
}

export interface Expedition {
  id: string;
  name: string;
  description: string;
  icon: string;
  regionId: string;
  difficulty: ExpeditionDifficulty;
  
  // Requirements
  requiredLevel: number;
  requiredDiscoveries: number; // How many region discoveries needed
  teamSize: number;
  supplyCost: number;
  
  // Duration
  duration: number; // Ticks
  
  // Rewards
  xpReward: number;
  goldReward: number;
  guaranteedDiscoveries: string[];
  possibleRewards: string[];
}

export interface ExplorerGear {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: number;
  
  // Stats
  exploreSpeedBonus: number;
  discoveryChanceBonus: number;
  survivalBonus: number;
  terrainBonus?: TerrainType; // Bonus in specific terrain
  
  // Requirements
  requiredLevel: number;
  cost: number;
}

export interface MapFragment {
  id: string;
  name: string;
  description: string;
  icon: string;
  regionId: string;
  
  // Requirements
  requiredFragments: number; // How many to complete
  
  // Rewards
  unlocksExpedition?: string;
  unlocksRegion?: string;
}

export interface ExplorerProgress {
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXp: number;
}

// ============================================
// TERRAINS
// ============================================

export const TERRAINS: Record<TerrainType, { name: string; icon: string; color: string; hazards: string }> = {
  forest: { name: 'Las', icon: 'mdi-tree', color: '#4CAF50', hazards: 'Dzikie zwierzęta, gęste zarośla' },
  mountain: { name: 'Góry', icon: 'mdi-mountain', color: '#607D8B', hazards: 'Lawiny, cienkie powietrze' },
  desert: { name: 'Pustnia', icon: 'mdi-weather-sunny', color: '#FF9800', hazards: 'Upał, burze piaskowe' },
  swamp: { name: 'Bagno', icon: 'mdi-waves', color: '#795548', hazards: 'Choroby, grząski grunt' },
  tundra: { name: 'Tundra', icon: 'mdi-snowflake', color: '#00BCD4', hazards: 'Mróz, brak schronienia' },
  ruins: { name: 'Ruiny', icon: 'mdi-castle', color: '#9E9E9E', hazards: 'Pułapki, niestabilne konstrukcje' },
  underwater: { name: 'Podwodne', icon: 'mdi-waves', color: '#2196F3', hazards: 'Brak tlenu, ciśnienie' },
  void: { name: 'Pustka', icon: 'mdi-moon-waning-crescent', color: '#673AB7', hazards: 'Anomalie, szaleństwo' },
};

// ============================================
// REGIONS
// ============================================

export const REGIONS: Record<string, Region> = {
  verdant_woods: {
    id: 'verdant_woods',
    name: 'Szmaragdowy Las',
    description: 'Gęsty, starożytny las pełen tajemnic.',
    icon: 'mdi-tree',
    terrain: 'forest',
    requiredLevel: 1,
    totalDiscoveries: 10,
    baseExploreTime: 200,
    xpPerExplore: 15,
    goldRange: [5, 20],
    possibleDiscoveries: ['hidden_grove', 'ancient_tree', 'forest_spirit', 'herb_garden'],
  },
  iron_peaks: {
    id: 'iron_peaks',
    name: 'Żelazne Szczyty',
    description: 'Wysokie góry z bogatymi złożami.',
    icon: 'mdi-mountain',
    terrain: 'mountain',
    requiredLevel: 5,
    totalDiscoveries: 12,
    baseExploreTime: 300,
    xpPerExplore: 25,
    goldRange: [15, 40],
    possibleDiscoveries: ['crystal_cave', 'dwarf_ruins', 'eagle_nest', 'ore_vein'],
  },
  golden_sands: {
    id: 'golden_sands',
    name: 'Złote Piaski',
    description: 'Rozległa pustynia z ukrytymi skarbami.',
    icon: 'mdi-weather-sunny',
    terrain: 'desert',
    requiredLevel: 10,
    totalDiscoveries: 15,
    baseExploreTime: 400,
    xpPerExplore: 35,
    goldRange: [30, 80],
    possibleDiscoveries: ['buried_temple', 'oasis', 'sphinx_riddle', 'sandworm_lair'],
  },
  murky_marshes: {
    id: 'murky_marshes',
    name: 'Mętne Bagna',
    description: 'Niebezpieczne mokradła pełne sekretów.',
    icon: 'mdi-waves',
    terrain: 'swamp',
    requiredLevel: 15,
    totalDiscoveries: 12,
    baseExploreTime: 350,
    xpPerExplore: 40,
    goldRange: [20, 60],
    possibleDiscoveries: ['witch_hut', 'sunken_village', 'will_o_wisp', 'rare_herbs'],
  },
  frozen_wastes: {
    id: 'frozen_wastes',
    name: 'Lodowe Pustkowia',
    description: 'Zamrożona kraina na północy.',
    icon: 'mdi-snowflake',
    terrain: 'tundra',
    requiredLevel: 20,
    totalDiscoveries: 14,
    baseExploreTime: 450,
    xpPerExplore: 50,
    goldRange: [40, 100],
    possibleDiscoveries: ['ice_tomb', 'mammoth_graveyard', 'aurora_shrine', 'frost_giant_camp'],
  },
  forgotten_citadel: {
    id: 'forgotten_citadel',
    name: 'Zapomniana Cytadela',
    description: 'Ruiny starożytnej cywilizacji.',
    icon: 'mdi-castle',
    terrain: 'ruins',
    requiredLevel: 25,
    totalDiscoveries: 18,
    baseExploreTime: 500,
    xpPerExplore: 60,
    goldRange: [60, 150],
    possibleDiscoveries: ['library_archives', 'throne_room', 'treasure_vault', 'magical_laboratory'],
  },
  abyssal_depths: {
    id: 'abyssal_depths',
    name: 'Otchłanie Głębin',
    description: 'Podwodne królestwo tajemnic.',
    icon: 'mdi-waves',
    terrain: 'underwater',
    requiredLevel: 30,
    requiredGear: ['diving_suit'],
    totalDiscoveries: 16,
    baseExploreTime: 600,
    xpPerExplore: 75,
    goldRange: [80, 200],
    possibleDiscoveries: ['sunken_ship', 'pearl_reef', 'leviathan_bones', 'atlantean_ruins'],
  },
  void_rift: {
    id: 'void_rift',
    name: 'Szczelina Pustki',
    description: 'Miejsce gdzie rzeczywistość się załamuje.',
    icon: 'mdi-moon-waning-crescent',
    terrain: 'void',
    requiredLevel: 40,
    requiredGear: ['void_anchor'],
    totalDiscoveries: 20,
    baseExploreTime: 800,
    xpPerExplore: 100,
    goldRange: [150, 400],
    possibleDiscoveries: ['reality_fragment', 'void_creature', 'cosmic_knowledge', 'dimensional_gateway'],
  },
};

// ============================================
// DISCOVERIES
// ============================================

export const DISCOVERIES: Record<string, Discovery> = {
  // Forest
  hidden_grove: { id: 'hidden_grove', name: 'Ukryty Gaj', description: 'Spokojne miejsce pełne magii.', icon: 'mdi-flower', type: 'location', rarity: 'common', regionId: 'verdant_woods', xpReward: 30 },
  ancient_tree: { id: 'ancient_tree', name: 'Pradawne Drzewo', description: 'Tysiącletnie drzewo z mocą druidów.', icon: 'mdi-tree', type: 'artifact', rarity: 'rare', regionId: 'verdant_woods', xpReward: 100, goldReward: 50 },
  forest_spirit: { id: 'forest_spirit', name: 'Duch Lasu', description: 'Spotkanie z duchową istotą.', icon: 'mdi-ghost', type: 'creature', rarity: 'uncommon', regionId: 'verdant_woods', xpReward: 50 },
  herb_garden: { id: 'herb_garden', name: 'Ogród Ziół', description: 'Naturalne stanowisko rzadkich ziół.', icon: 'mdi-leaf', type: 'treasure', rarity: 'common', regionId: 'verdant_woods', xpReward: 25, goldReward: 20 },

  // Mountain
  crystal_cave: { id: 'crystal_cave', name: 'Kryształowa Jaskinia', description: 'Jaskinia pełna lśniących kryształów.', icon: 'mdi-diamond-stone', type: 'treasure', rarity: 'rare', regionId: 'iron_peaks', xpReward: 80, goldReward: 100 },
  dwarf_ruins: { id: 'dwarf_ruins', name: 'Ruiny Krasnoludów', description: 'Pozostałości po górniczej osadzie.', icon: 'mdi-castle', type: 'location', rarity: 'uncommon', regionId: 'iron_peaks', xpReward: 60, loreUnlock: 'dwarf_history' },
  eagle_nest: { id: 'eagle_nest', name: 'Orlęce Gniazdo', description: 'Dom gigantycznych orłów.', icon: 'mdi-bird', type: 'creature', rarity: 'uncommon', regionId: 'iron_peaks', xpReward: 45 },
  ore_vein: { id: 'ore_vein', name: 'Żyła Rudy', description: 'Bogata żyła cennych metali.', icon: 'mdi-mine', type: 'treasure', rarity: 'common', regionId: 'iron_peaks', xpReward: 35, goldReward: 40 },

  // Desert
  buried_temple: { id: 'buried_temple', name: 'Zasypana Świątynia', description: 'Starożytna świątynia pod piaskiem.', icon: 'mdi-temple-hindu', type: 'location', rarity: 'epic', regionId: 'golden_sands', xpReward: 150, goldReward: 200 },
  oasis: { id: 'oasis', name: 'Ukryta Oaza', description: 'Źródło życia na pustyni.', icon: 'mdi-palm-tree', type: 'location', rarity: 'uncommon', regionId: 'golden_sands', xpReward: 50 },
  sphinx_riddle: { id: 'sphinx_riddle', name: 'Zagadka Sfinksa', description: 'Rozwiązanie starożytnej zagadki.', icon: 'mdi-help-circle', type: 'lore', rarity: 'rare', regionId: 'golden_sands', xpReward: 100, loreUnlock: 'sphinx_secrets' },
  sandworm_lair: { id: 'sandworm_lair', name: 'Legowisko Piaskowego Robaka', description: 'Dom przerażającego stworzenia.', icon: 'mdi-snake', type: 'creature', rarity: 'rare', regionId: 'golden_sands', xpReward: 80 },

  // Swamp
  witch_hut: { id: 'witch_hut', name: 'Chata Wiedźmy', description: 'Dom tajemniczej czarownicy.', icon: 'mdi-home', type: 'location', rarity: 'rare', regionId: 'murky_marshes', xpReward: 90 },
  sunken_village: { id: 'sunken_village', name: 'Zatopiona Wioska', description: 'Ruiny dawnej osady.', icon: 'mdi-home-flood', type: 'location', rarity: 'uncommon', regionId: 'murky_marshes', xpReward: 60, loreUnlock: 'marsh_history' },
  will_o_wisp: { id: 'will_o_wisp', name: 'Błędne Ogniki', description: 'Tajemnicze światła na bagnach.', icon: 'mdi-lightbulb', type: 'creature', rarity: 'uncommon', regionId: 'murky_marshes', xpReward: 45 },
  rare_herbs: { id: 'rare_herbs', name: 'Rzadkie Zioła', description: 'Unikalne rośliny bagienne.', icon: 'mdi-flower', type: 'treasure', rarity: 'common', regionId: 'murky_marshes', xpReward: 30, goldReward: 35 },

  // Tundra
  ice_tomb: { id: 'ice_tomb', name: 'Lodowy Grobowiec', description: 'Zamrożona krypta wojownika.', icon: 'mdi-treasure-chest', type: 'treasure', rarity: 'epic', regionId: 'frozen_wastes', xpReward: 200, goldReward: 300 },
  mammoth_graveyard: { id: 'mammoth_graveyard', name: 'Cmentarzysko Mamutów', description: 'Kości pradawnych olbrzymów.', icon: 'mdi-bone', type: 'location', rarity: 'rare', regionId: 'frozen_wastes', xpReward: 100, goldReward: 150 },
  aurora_shrine: { id: 'aurora_shrine', name: 'Świątynia Zorzy', description: 'Miejsce gdzie tańczą światła.', icon: 'mdi-star', type: 'artifact', rarity: 'epic', regionId: 'frozen_wastes', xpReward: 180 },
  frost_giant_camp: { id: 'frost_giant_camp', name: 'Obóz Mroźnego Giganta', description: 'Dom lodowego olbrzyma.', icon: 'mdi-human', type: 'creature', rarity: 'rare', regionId: 'frozen_wastes', xpReward: 120 },

  // Ruins
  library_archives: { id: 'library_archives', name: 'Archiwum Biblioteki', description: 'Zbiory starożytnej wiedzy.', icon: 'mdi-book', type: 'lore', rarity: 'epic', regionId: 'forgotten_citadel', xpReward: 200, loreUnlock: 'ancient_civilization' },
  throne_room: { id: 'throne_room', name: 'Sala Tronowa', description: 'Gdzie rządzili dawni władcy.', icon: 'mdi-crown', type: 'location', rarity: 'rare', regionId: 'forgotten_citadel', xpReward: 150 },
  treasure_vault: { id: 'treasure_vault', name: 'Skarbiec', description: 'Skarby starożytnego królestwa.', icon: 'mdi-treasure-chest', type: 'treasure', rarity: 'legendary', regionId: 'forgotten_citadel', xpReward: 300, goldReward: 500 },
  magical_laboratory: { id: 'magical_laboratory', name: 'Magiczne Laboratorium', description: 'Gdzie tworzono artefakty.', icon: 'mdi-flask', type: 'artifact', rarity: 'epic', regionId: 'forgotten_citadel', xpReward: 180 },

  // Underwater
  sunken_ship: { id: 'sunken_ship', name: 'Zatopiony Statek', description: 'Wrak pełen skarbów.', icon: 'mdi-ship-wheel', type: 'treasure', rarity: 'rare', regionId: 'abyssal_depths', xpReward: 120, goldReward: 200 },
  pearl_reef: { id: 'pearl_reef', name: 'Perłowa Rafa', description: 'Naturalne złoże pereł.', icon: 'mdi-circle', type: 'treasure', rarity: 'uncommon', regionId: 'abyssal_depths', xpReward: 80, goldReward: 100 },
  leviathan_bones: { id: 'leviathan_bones', name: 'Kości Lewiatana', description: 'Szczątki morskiego giganta.', icon: 'mdi-bone', type: 'creature', rarity: 'epic', regionId: 'abyssal_depths', xpReward: 200 },
  atlantean_ruins: { id: 'atlantean_ruins', name: 'Ruiny Atlantydy', description: 'Legendarne podwodne miasto.', icon: 'mdi-city', type: 'location', rarity: 'legendary', regionId: 'abyssal_depths', xpReward: 400, goldReward: 600, loreUnlock: 'atlantis' },

  // Void
  reality_fragment: { id: 'reality_fragment', name: 'Fragment Rzeczywistości', description: 'Kawałek innego świata.', icon: 'mdi-cube', type: 'artifact', rarity: 'legendary', regionId: 'void_rift', xpReward: 500, goldReward: 800 },
  void_creature: { id: 'void_creature', name: 'Istota z Pustki', description: 'Stworzenie z poza wymiarów.', icon: 'mdi-ghost', type: 'creature', rarity: 'epic', regionId: 'void_rift', xpReward: 300 },
  cosmic_knowledge: { id: 'cosmic_knowledge', name: 'Kosmiczna Wiedza', description: 'Tajemnice wszechświata.', icon: 'mdi-brain', type: 'lore', rarity: 'legendary', regionId: 'void_rift', xpReward: 600, loreUnlock: 'cosmic_truth' },
  dimensional_gateway: { id: 'dimensional_gateway', name: 'Brama Wymiarów', description: 'Przejście do innych światów.', icon: 'mdi-door', type: 'location', rarity: 'legendary', regionId: 'void_rift', xpReward: 700 },
};

// ============================================
// EXPLORER GEAR
// ============================================

export const EXPLORER_GEAR: Record<string, ExplorerGear> = {
  basic_pack: {
    id: 'basic_pack',
    name: 'Podstawowy Plecak',
    description: 'Prosty ekwipunek podróżnika.',
    icon: 'mdi-bag-personal',
    tier: 1,
    exploreSpeedBonus: 5,
    discoveryChanceBonus: 0,
    survivalBonus: 0,
    requiredLevel: 1,
    cost: 50,
  },
  compass: {
    id: 'compass',
    name: 'Kompas',
    description: 'Pomaga w nawigacji.',
    icon: 'mdi-compass',
    tier: 1,
    exploreSpeedBonus: 10,
    discoveryChanceBonus: 5,
    survivalBonus: 0,
    requiredLevel: 3,
    cost: 100,
  },
  survival_kit: {
    id: 'survival_kit',
    name: 'Zestaw Przetrwania',
    description: 'Niezbędny na wyprawy.',
    icon: 'mdi-medical-bag',
    tier: 2,
    exploreSpeedBonus: 5,
    discoveryChanceBonus: 0,
    survivalBonus: 15,
    requiredLevel: 8,
    cost: 300,
  },
  mountain_gear: {
    id: 'mountain_gear',
    name: 'Sprzęt Górski',
    description: 'Specjalistyczny sprzęt na góry.',
    icon: 'mdi-hiking',
    tier: 2,
    exploreSpeedBonus: 15,
    discoveryChanceBonus: 10,
    survivalBonus: 10,
    terrainBonus: 'mountain',
    requiredLevel: 10,
    cost: 500,
  },
  desert_gear: {
    id: 'desert_gear',
    name: 'Sprzęt Pustynny',
    description: 'Ochrona przed słońcem i piaskiem.',
    icon: 'mdi-sunglasses',
    tier: 2,
    exploreSpeedBonus: 15,
    discoveryChanceBonus: 10,
    survivalBonus: 10,
    terrainBonus: 'desert',
    requiredLevel: 12,
    cost: 500,
  },
  artifact_detector: {
    id: 'artifact_detector',
    name: 'Wykrywacz Artefaktów',
    description: 'Pomaga znaleźć ukryte skarby.',
    icon: 'mdi-radar',
    tier: 3,
    exploreSpeedBonus: 0,
    discoveryChanceBonus: 25,
    survivalBonus: 0,
    requiredLevel: 18,
    cost: 1000,
  },
  diving_suit: {
    id: 'diving_suit',
    name: 'Skafander Nurkowy',
    description: 'Pozwala na eksplorację podwodną.',
    icon: 'mdi-diving-helmet',
    tier: 3,
    exploreSpeedBonus: 10,
    discoveryChanceBonus: 15,
    survivalBonus: 20,
    terrainBonus: 'underwater',
    requiredLevel: 28,
    cost: 2000,
  },
  void_anchor: {
    id: 'void_anchor',
    name: 'Kotwica Pustki',
    description: 'Stabilizuje w Szczelinie Pustki.',
    icon: 'mdi-anchor',
    tier: 4,
    exploreSpeedBonus: 5,
    discoveryChanceBonus: 20,
    survivalBonus: 30,
    terrainBonus: 'void',
    requiredLevel: 38,
    cost: 5000,
  },
  legendary_atlas: {
    id: 'legendary_atlas',
    name: 'Legendarny Atlas',
    description: 'Zawiera wszystkie mapy świata.',
    icon: 'mdi-map-legend',
    tier: 5,
    exploreSpeedBonus: 30,
    discoveryChanceBonus: 30,
    survivalBonus: 20,
    requiredLevel: 45,
    cost: 10000,
  },
};

// ============================================
// EXPEDITIONS
// ============================================

export const EXPEDITIONS: Record<string, Expedition> = {
  forest_survey: {
    id: 'forest_survey',
    name: 'Zwiad Leśny',
    description: 'Dokładne zmapowanie lasu.',
    icon: 'mdi-map-search',
    regionId: 'verdant_woods',
    difficulty: 'easy',
    requiredLevel: 5,
    requiredDiscoveries: 3,
    teamSize: 1,
    supplyCost: 50,
    duration: 600,
    xpReward: 100,
    goldReward: 80,
    guaranteedDiscoveries: [],
    possibleRewards: ['herb_garden', 'hidden_grove'],
  },
  mountain_expedition: {
    id: 'mountain_expedition',
    name: 'Ekspedycja Górska',
    description: 'Wyprawa na szczyt.',
    icon: 'mdi-flag',
    regionId: 'iron_peaks',
    difficulty: 'medium',
    requiredLevel: 12,
    requiredDiscoveries: 5,
    teamSize: 2,
    supplyCost: 150,
    duration: 1200,
    xpReward: 250,
    goldReward: 200,
    guaranteedDiscoveries: ['crystal_cave'],
    possibleRewards: ['ore_vein', 'dwarf_ruins'],
  },
  desert_tomb_raid: {
    id: 'desert_tomb_raid',
    name: 'Wyprawa do Grobowca',
    description: 'Eksploracja pustynnego grobowca.',
    icon: 'mdi-pyramid',
    regionId: 'golden_sands',
    difficulty: 'hard',
    requiredLevel: 18,
    requiredDiscoveries: 7,
    teamSize: 3,
    supplyCost: 300,
    duration: 1800,
    xpReward: 500,
    goldReward: 400,
    guaranteedDiscoveries: ['buried_temple'],
    possibleRewards: ['sphinx_riddle', 'sandworm_lair'],
  },
  citadel_delve: {
    id: 'citadel_delve',
    name: 'Zgłębienie Cytadeli',
    description: 'Pełna eksploracja ruin.',
    icon: 'mdi-castle',
    regionId: 'forgotten_citadel',
    difficulty: 'extreme',
    requiredLevel: 30,
    requiredDiscoveries: 10,
    teamSize: 4,
    supplyCost: 600,
    duration: 3000,
    xpReward: 1000,
    goldReward: 800,
    guaranteedDiscoveries: ['treasure_vault'],
    possibleRewards: ['library_archives', 'magical_laboratory'],
  },
  void_incursion: {
    id: 'void_incursion',
    name: 'Wtargnięcie w Pustkę',
    description: 'Niebezpieczna wyprawa w nieznane.',
    icon: 'mdi-alert-octagon',
    regionId: 'void_rift',
    difficulty: 'legendary',
    requiredLevel: 45,
    requiredDiscoveries: 15,
    teamSize: 5,
    supplyCost: 2000,
    duration: 5000,
    xpReward: 3000,
    goldReward: 2500,
    guaranteedDiscoveries: ['reality_fragment'],
    possibleRewards: ['cosmic_knowledge', 'dimensional_gateway'],
  },
};

// ============================================
// DIFFICULTY DATA
// ============================================

export const DIFFICULTY_DATA: Record<ExpeditionDifficulty, { label: string; color: string; riskPercent: number }> = {
  easy: { label: 'Łatwa', color: '#4CAF50', riskPercent: 5 },
  medium: { label: 'Średnia', color: '#2196F3', riskPercent: 15 },
  hard: { label: 'Trudna', color: '#FF9800', riskPercent: 30 },
  extreme: { label: 'Ekstremalna', color: '#F44336', riskPercent: 50 },
  legendary: { label: 'Legendarna', color: '#9C27B0', riskPercent: 70 },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getRegion(id: string): Region | undefined {
  return REGIONS[id];
}

export function getDiscovery(id: string): Discovery | undefined {
  return DISCOVERIES[id];
}

export function getGear(id: string): ExplorerGear | undefined {
  return EXPLORER_GEAR[id];
}

export function getExpedition(id: string): Expedition | undefined {
  return EXPEDITIONS[id];
}

export function getAvailableRegions(level: number): Region[] {
  return Object.values(REGIONS).filter(r => r.requiredLevel <= level);
}

export function calculateExplorerXpToLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.15, level - 1));
}

export function getTerrainColor(terrain: TerrainType): string {
  return TERRAINS[terrain].color;
}

export function getTerrainName(terrain: TerrainType): string {
  return TERRAINS[terrain].name;
}

export function getRarityColor(rarity: string): string {
  const colors: Record<string, string> = {
    common: '#9E9E9E',
    uncommon: '#4CAF50',
    rare: '#2196F3',
    epic: '#9C27B0',
    legendary: '#FF9800',
  };
  return colors[rarity] || '#9E9E9E';
}
