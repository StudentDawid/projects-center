/**
 * World Bosses Data - Global Bosses, Legendary Rewards, Raid System
 */

export type BossDifficulty = 'easy' | 'medium' | 'hard' | 'nightmare' | 'legendary' | 'mythic';
export type BossElement = 'fire' | 'ice' | 'nature' | 'void' | 'mechanical' | 'holy' | 'shadow';
export type SpawnType = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'special';

export interface BossAbility {
  id: string;
  name: string;
  description: string;
  damage?: number;
  effect?: string;
  cooldown: number;
}

export interface BossPhase {
  hpThreshold: number;
  name: string;
  description: string;
  damageMultiplier: number;
  newAbilities?: string[];
}

export interface LegendaryReward {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'weapon' | 'armor' | 'accessory' | 'artifact' | 'material' | 'currency';
  rarity: 'legendary' | 'mythic';
  stats?: Record<string, number>;
  effects?: { name: string; description: string; value: number }[];
  dropChance: number;
}

export interface WorldBoss {
  id: string;
  name: string;
  title: string;
  description: string;
  lore: string;
  icon: string;
  element: BossElement;
  difficulty: BossDifficulty;
  tier: number;
  
  // Stats
  baseHp: number;
  attack: number;
  defense: number;
  speed: number;
  
  // Requirements
  requiredLevel: number;
  requiredKills?: number;
  
  // Spawn
  spawnType: SpawnType;
  spawnDayOfWeek?: number; // 0-6 for weekly
  spawnInterval?: number; // hours for other types
  fightDuration: number; // max seconds
  
  // Combat
  abilities: BossAbility[];
  phases: BossPhase[];
  
  // Rewards
  baseGold: number;
  baseXp: number;
  legacyPoints: number;
  legendaryRewards: LegendaryReward[];
  guaranteedRewards: { itemId: string; amount: number }[];
}

export const LEGENDARY_ITEMS: Record<string, LegendaryReward> = {
  // Dragon Set
  dragon_armor: {
    id: 'dragon_armor', name: 'Smocza Zbroja', description: 'Wykuta z łusek starożytnego smoka.',
    icon: 'mdi-shield-crown', type: 'armor', rarity: 'legendary',
    stats: { defense: 150, hp: 500, fire_resist: 50 },
    effects: [{ name: 'Smocza Odporność', description: '+50% odporności na ogień', value: 50 }],
    dropChance: 0.15,
  },
  dragon_sword: {
    id: 'dragon_sword', name: 'Smocze Ostrze', description: 'Miecz nasycony ogniem smoka.',
    icon: 'mdi-sword', type: 'weapon', rarity: 'legendary',
    stats: { attack: 200, crit_chance: 15, fire_damage: 100 },
    effects: [{ name: 'Płomień Smoka', description: 'Zadaje dodatkowe 100 obrażeń od ognia', value: 100 }],
    dropChance: 0.1,
  },
  dragon_heart: {
    id: 'dragon_heart', name: 'Serce Smoka', description: 'Pulsujące mocą serce starożytnego smoka.',
    icon: 'mdi-heart', type: 'artifact', rarity: 'mythic',
    stats: { all_stats: 25 },
    effects: [{ name: 'Dusza Smoka', description: '+25% wszystkich statystyk', value: 25 }],
    dropChance: 0.02,
  },

  // Ice Titan Set
  frost_hammer: {
    id: 'frost_hammer', name: 'Młot Mrozu', description: 'Lodowy młot Tytana.',
    icon: 'mdi-hammer', type: 'weapon', rarity: 'legendary',
    stats: { attack: 180, armor_pen: 30, ice_damage: 80 },
    effects: [{ name: 'Mroźne Uderzenie', description: 'Spowalnia wrogów o 30%', value: 30 }],
    dropChance: 0.12,
  },
  titan_gauntlets: {
    id: 'titan_gauntlets', name: 'Rękawice Tytana', description: 'Lodowe rękawice z mocy Tytana.',
    icon: 'mdi-hand-back-left', type: 'armor', rarity: 'legendary',
    stats: { attack: 50, defense: 80, ice_resist: 40 },
    effects: [{ name: 'Lodowy Dotyk', description: '+40% odporności na lód', value: 40 }],
    dropChance: 0.15,
  },
  frozen_core: {
    id: 'frozen_core', name: 'Zamrożony Rdzeń', description: 'Rdzeń mocy Lodowego Tytana.',
    icon: 'mdi-snowflake', type: 'artifact', rarity: 'mythic',
    stats: { mana: 200, spell_power: 40, ice_damage: 100 },
    effects: [{ name: 'Wieczna Zima', description: '+40% mocy zaklęć lodowych', value: 40 }],
    dropChance: 0.03,
  },

  // Goblin King Set
  goblin_crown: {
    id: 'goblin_crown', name: 'Korona Goblinów', description: 'Złota korona Króla Goblinów.',
    icon: 'mdi-crown', type: 'accessory', rarity: 'legendary',
    stats: { gold_find: 50, luck: 25, charisma: 30 },
    effects: [{ name: 'Chciwość', description: '+50% złota ze wszystkich źródeł', value: 50 }],
    dropChance: 0.2,
  },
  goblin_dagger: {
    id: 'goblin_dagger', name: 'Sztylet Podstępu', description: 'Trucicielski sztylet.',
    icon: 'mdi-knife', type: 'weapon', rarity: 'legendary',
    stats: { attack: 100, crit_chance: 25, crit_damage: 50, poison_damage: 40 },
    effects: [{ name: 'Trucizna', description: 'Zadaje 40 obrażeń od trucizny/sek', value: 40 }],
    dropChance: 0.18,
  },

  // Void Avatar Set
  void_fragment: {
    id: 'void_fragment', name: 'Fragment Pustki', description: 'Kawałek samej Pustki.',
    icon: 'mdi-blur', type: 'artifact', rarity: 'mythic',
    stats: { all_stats: 50, void_damage: 200 },
    effects: [
      { name: 'Dotyk Pustki', description: '+200 obrażeń od Pustki', value: 200 },
      { name: 'Transcendencja', description: '+50% wszystkich statystyk', value: 50 },
    ],
    dropChance: 0.01,
  },
  void_cloak: {
    id: 'void_cloak', name: 'Płaszcz Pustki', description: 'Płaszcz utkany z nicości.',
    icon: 'mdi-shield-half-full', type: 'armor', rarity: 'mythic',
    stats: { defense: 200, evasion: 40, void_resist: 75 },
    effects: [{ name: 'Faza', description: '40% szansy na uniknięcie ataku', value: 40 }],
    dropChance: 0.02,
  },
  void_blade: {
    id: 'void_blade', name: 'Ostrze Nicości', description: 'Miecz pochłaniający światło.',
    icon: 'mdi-sword', type: 'weapon', rarity: 'mythic',
    stats: { attack: 300, armor_pen: 50, void_damage: 150, lifesteal: 20 },
    effects: [{ name: 'Pochłonięcie', description: '20% obrażeń jako leczenie', value: 20 }],
    dropChance: 0.015,
  },

  // Forest Mother Set
  nature_bow: {
    id: 'nature_bow', name: 'Łuk Natury', description: 'Łuk z gałęzi Drzewa Świata.',
    icon: 'mdi-bow-arrow', type: 'weapon', rarity: 'legendary',
    stats: { attack: 160, crit_chance: 20, nature_damage: 70 },
    effects: [{ name: 'Strzały Natury', description: 'Strzały przywracają 2% HP', value: 2 }],
    dropChance: 0.12,
  },
  forest_blessing: {
    id: 'forest_blessing', name: 'Błogosławieństwo Lasu', description: 'Amulet z mocą Pramatki.',
    icon: 'mdi-leaf', type: 'accessory', rarity: 'legendary',
    stats: { hp_regen: 50, nature_resist: 40, gathering_speed: 30 },
    effects: [{ name: 'Regeneracja', description: '+50 HP/sek regeneracji', value: 50 }],
    dropChance: 0.15,
  },
  seed_of_life: {
    id: 'seed_of_life', name: 'Nasienie Życia', description: 'Nasienie z Drzewa Świata.',
    icon: 'mdi-seed', type: 'artifact', rarity: 'mythic',
    stats: { hp: 1000, hp_regen: 100, all_resist: 25 },
    effects: [{ name: 'Odrodzenie', description: 'Raz na walkę: Wskrzeszenie z 50% HP', value: 50 }],
    dropChance: 0.025,
  },

  // Mechanical Titan Set
  golem_core: {
    id: 'golem_core', name: 'Serce Golema', description: 'Rdzeń Mechanicznego Tytana.',
    icon: 'mdi-cog', type: 'artifact', rarity: 'legendary',
    stats: { defense: 100, hp: 300, golem_power: 50 },
    effects: [{ name: 'Moc Golema', description: '+50% siły golemów', value: 50 }],
    dropChance: 0.1,
  },
  clockwork_armor: {
    id: 'clockwork_armor', name: 'Zbroja Zegarmistrza', description: 'Mechaniczna zbroja.',
    icon: 'mdi-cog-box', type: 'armor', rarity: 'legendary',
    stats: { defense: 180, hp: 400, attack_speed: 20 },
    effects: [{ name: 'Automatyka', description: '+20% szybkości ataku', value: 20 }],
    dropChance: 0.12,
  },
  titan_blueprint: {
    id: 'titan_blueprint', name: 'Schemat Tytana', description: 'Sekretny schemat budowy Tytana.',
    icon: 'mdi-file-document', type: 'material', rarity: 'mythic',
    stats: {},
    effects: [{ name: 'Wiedza Twórcy', description: 'Pozwala zbudować Mechanicznego Golema', value: 1 }],
    dropChance: 0.02,
  },

  // Universal Legendary Materials
  boss_essence: {
    id: 'boss_essence', name: 'Esencja Bossa', description: 'Skoncentrowana moc World Bossa.',
    icon: 'mdi-star-four-points', type: 'material', rarity: 'legendary',
    stats: {},
    effects: [{ name: 'Materiał Craftingowy', description: 'Do tworzenia legendarnych przedmiotów', value: 1 }],
    dropChance: 0.5,
  },
  mythic_shard: {
    id: 'mythic_shard', name: 'Mityczny Odłamek', description: 'Fragment mitycznej mocy.',
    icon: 'mdi-diamond-stone', type: 'material', rarity: 'mythic',
    stats: {},
    effects: [{ name: 'Materiał Craftingowy', description: 'Do tworzenia mitycznych przedmiotów', value: 1 }],
    dropChance: 0.1,
  },
};

export const WORLD_BOSSES: Record<string, WorldBoss> = {
  ancient_dragon: {
    id: 'ancient_dragon',
    name: 'Starożytny Smok',
    title: 'Władca Niebios',
    description: 'Pradawny smok, który pamiętał narodziny świata.',
    lore: 'Legendy mówią, że Starożytny Smok był świadkiem stworzenia Aterii. Jego płomień jest tak gorący, że topi nawet adamantyt.',
    icon: 'mdi-dragon',
    element: 'fire',
    difficulty: 'legendary',
    tier: 5,
    baseHp: 1000000,
    attack: 500,
    defense: 200,
    speed: 80,
    requiredLevel: 30,
    spawnType: 'weekly',
    spawnDayOfWeek: 0, // Sunday
    fightDuration: 300,
    abilities: [
      { id: 'flame_breath', name: 'Ognisty Oddech', description: 'Smok zionie ogniem, zadając ogromne obrażenia.', damage: 150, cooldown: 15 },
      { id: 'tail_swipe', name: 'Uderzenie Ogonem', description: 'Potężne uderzenie ogonem.', damage: 100, cooldown: 8 },
      { id: 'inferno', name: 'Piekielny Ogień', description: 'Pokrywa pole walki płomieniami.', damage: 50, effect: 'burn', cooldown: 30 },
      { id: 'ancient_roar', name: 'Starożytny Ryk', description: 'Ryk osłabiający wszystkich wrogów.', effect: 'debuff', cooldown: 45 },
    ],
    phases: [
      { hpThreshold: 100, name: 'Faza 1: Przebudzenie', description: 'Smok powoli się budzi.', damageMultiplier: 1.0 },
      { hpThreshold: 75, name: 'Faza 2: Gniew', description: 'Smok jest wściekły!', damageMultiplier: 1.25, newAbilities: ['tail_swipe'] },
      { hpThreshold: 50, name: 'Faza 3: Piekło', description: 'Pole walki płonie!', damageMultiplier: 1.5, newAbilities: ['inferno'] },
      { hpThreshold: 25, name: 'Faza 4: Ostateczna Forma', description: 'Smok pokazuje swoją prawdziwą moc!', damageMultiplier: 2.0, newAbilities: ['ancient_roar'] },
    ],
    baseGold: 50000,
    baseXp: 10000,
    legacyPoints: 25,
    legendaryRewards: [
      LEGENDARY_ITEMS.dragon_armor,
      LEGENDARY_ITEMS.dragon_sword,
      LEGENDARY_ITEMS.dragon_heart,
      LEGENDARY_ITEMS.boss_essence,
      LEGENDARY_ITEMS.mythic_shard,
    ],
    guaranteedRewards: [{ itemId: 'dragon_scale', amount: 5 }],
  },

  ice_titan: {
    id: 'ice_titan',
    name: 'Lodowy Tytan',
    title: 'Strażnik Wiecznego Mrozu',
    description: 'Gigantyczny stwór z czystego lodu.',
    lore: 'Lodowy Tytan strzeże wrót do Krainy Wiecznej Zimy. Jego dotyk zamraża wszystko na wieki.',
    icon: 'mdi-snowflake',
    element: 'ice',
    difficulty: 'hard',
    tier: 4,
    baseHp: 600000,
    attack: 350,
    defense: 300,
    speed: 40,
    requiredLevel: 25,
    spawnType: 'biweekly',
    spawnInterval: 72, // every 3 days
    fightDuration: 240,
    abilities: [
      { id: 'frost_slam', name: 'Lodowe Uderzenie', description: 'Potężne uderzenie zamrażające.', damage: 120, effect: 'freeze', cooldown: 12 },
      { id: 'ice_storm', name: 'Lodowa Burza', description: 'Wzywa burzę lodową.', damage: 60, effect: 'slow', cooldown: 25 },
      { id: 'glacial_shield', name: 'Lodowa Tarcza', description: 'Tworzy tarczę z lodu.', effect: 'shield', cooldown: 40 },
    ],
    phases: [
      { hpThreshold: 100, name: 'Faza 1: Mróz', description: 'Tytan powoli się porusza.', damageMultiplier: 1.0 },
      { hpThreshold: 60, name: 'Faza 2: Zamieć', description: 'Tytan przyspiesza!', damageMultiplier: 1.3, newAbilities: ['ice_storm'] },
      { hpThreshold: 30, name: 'Faza 3: Absolutne Zero', description: 'Temperatura spada drastycznie!', damageMultiplier: 1.6, newAbilities: ['glacial_shield'] },
    ],
    baseGold: 30000,
    baseXp: 6000,
    legacyPoints: 15,
    legendaryRewards: [
      LEGENDARY_ITEMS.frost_hammer,
      LEGENDARY_ITEMS.titan_gauntlets,
      LEGENDARY_ITEMS.frozen_core,
      LEGENDARY_ITEMS.boss_essence,
    ],
    guaranteedRewards: [{ itemId: 'eternal_ice', amount: 3 }],
  },

  goblin_king: {
    id: 'goblin_king',
    name: 'Król Goblinów',
    title: 'Władca Podziemi',
    description: 'Przebiegły i chciwy władca wszystkich goblinów.',
    lore: 'Król Goblinów zgromadził największy skarb w całej Aterii. Wielu próbowało go okraść - żaden nie przeżył.',
    icon: 'mdi-crown',
    element: 'shadow',
    difficulty: 'medium',
    tier: 2,
    baseHp: 150000,
    attack: 150,
    defense: 80,
    speed: 120,
    requiredLevel: 10,
    spawnType: 'daily',
    fightDuration: 120,
    abilities: [
      { id: 'gold_throw', name: 'Złoty Grad', description: 'Ciska złotymi monetami.', damage: 40, cooldown: 6 },
      { id: 'summon_guards', name: 'Wezwanie Straży', description: 'Wzywa goblinich strażników.', effect: 'summon', cooldown: 20 },
      { id: 'poison_dagger', name: 'Trucicielski Cios', description: 'Atak zatrutym sztyletem.', damage: 80, effect: 'poison', cooldown: 15 },
    ],
    phases: [
      { hpThreshold: 100, name: 'Faza 1: Negocjacje', description: 'Król próbuje przekupić.', damageMultiplier: 0.8 },
      { hpThreshold: 50, name: 'Faza 2: Zdrada', description: 'Król wzywa strażników!', damageMultiplier: 1.2, newAbilities: ['summon_guards'] },
      { hpThreshold: 20, name: 'Faza 3: Desperacja', description: 'Król walczy o życie!', damageMultiplier: 1.5, newAbilities: ['poison_dagger'] },
    ],
    baseGold: 10000,
    baseXp: 2000,
    legacyPoints: 5,
    legendaryRewards: [
      LEGENDARY_ITEMS.goblin_crown,
      LEGENDARY_ITEMS.goblin_dagger,
      LEGENDARY_ITEMS.boss_essence,
    ],
    guaranteedRewards: [{ itemId: 'goblin_gold', amount: 500 }],
  },

  void_avatar: {
    id: 'void_avatar',
    name: 'Avatar Pustki',
    title: 'Ucieleśnienie Nicości',
    description: 'Manifestacja samej Pustki.',
    lore: 'Nikt nie wie, skąd przychodzi Avatar Pustki. Ci, którzy go widzieli i przeżyli, tracili rozum.',
    icon: 'mdi-blur',
    element: 'void',
    difficulty: 'mythic',
    tier: 6,
    baseHp: 5000000,
    attack: 800,
    defense: 400,
    speed: 100,
    requiredLevel: 40,
    requiredKills: 10, // Need to defeat 10 other world bosses first
    spawnType: 'monthly',
    fightDuration: 600,
    abilities: [
      { id: 'void_beam', name: 'Promień Pustki', description: 'Strumień czystej nicości.', damage: 300, cooldown: 10 },
      { id: 'reality_tear', name: 'Rozdarcie Rzeczywistości', description: 'Rozrywa tkankę rzeczywistości.', damage: 200, effect: 'void', cooldown: 20 },
      { id: 'consume', name: 'Pochłonięcie', description: 'Pochłania część duszy.', damage: 150, effect: 'drain', cooldown: 30 },
      { id: 'oblivion', name: 'Zapomnienie', description: 'Wymazuje z istnienia.', damage: 500, cooldown: 60 },
      { id: 'phase_shift', name: 'Przesunięcie Fazowe', description: 'Staje się nieuchwytny.', effect: 'invulnerable', cooldown: 45 },
    ],
    phases: [
      { hpThreshold: 100, name: 'Faza 1: Manifestacja', description: 'Avatar materializuje się.', damageMultiplier: 1.0 },
      { hpThreshold: 80, name: 'Faza 2: Chaos', description: 'Rzeczywistość się rozpada.', damageMultiplier: 1.3, newAbilities: ['reality_tear'] },
      { hpThreshold: 60, name: 'Faza 3: Pochłonięcie', description: 'Avatar żywi się duszami.', damageMultiplier: 1.5, newAbilities: ['consume'] },
      { hpThreshold: 40, name: 'Faza 4: Zapomnienie', description: 'Nicość się rozprzestrzenia.', damageMultiplier: 1.8, newAbilities: ['oblivion'] },
      { hpThreshold: 20, name: 'Faza 5: Ostateczna Pustka', description: 'Wszystko zostanie pochłonięte!', damageMultiplier: 2.5, newAbilities: ['phase_shift'] },
    ],
    baseGold: 200000,
    baseXp: 50000,
    legacyPoints: 100,
    legendaryRewards: [
      LEGENDARY_ITEMS.void_fragment,
      LEGENDARY_ITEMS.void_cloak,
      LEGENDARY_ITEMS.void_blade,
      LEGENDARY_ITEMS.mythic_shard,
      LEGENDARY_ITEMS.boss_essence,
    ],
    guaranteedRewards: [{ itemId: 'void_essence', amount: 10 }],
  },

  forest_mother: {
    id: 'forest_mother',
    name: 'Pramatka Lasów',
    title: 'Strażniczka Drzewa Świata',
    description: 'Starożytna istota strzegąca natury.',
    lore: 'Pramatka Lasów jest tak stara jak same lasy. Chroni równowagę natury i karze tych, którzy jej szkodzą.',
    icon: 'mdi-tree',
    element: 'nature',
    difficulty: 'hard',
    tier: 3,
    baseHp: 400000,
    attack: 200,
    defense: 250,
    speed: 60,
    requiredLevel: 20,
    spawnType: 'weekly',
    spawnDayOfWeek: 3, // Wednesday
    fightDuration: 180,
    abilities: [
      { id: 'vine_lash', name: 'Bicz z Pnączy', description: 'Uderza pnączami.', damage: 80, cooldown: 8 },
      { id: 'natures_wrath', name: 'Gniew Natury', description: 'Natura atakuje.', damage: 120, effect: 'root', cooldown: 20 },
      { id: 'healing_rain', name: 'Uzdrawiający Deszcz', description: 'Leczy się w deszczu.', effect: 'heal', cooldown: 35 },
      { id: 'summon_treants', name: 'Wezwanie Treantów', description: 'Wzywa drzewce.', effect: 'summon', cooldown: 30 },
    ],
    phases: [
      { hpThreshold: 100, name: 'Faza 1: Spokój', description: 'Las jest cichy.', damageMultiplier: 1.0 },
      { hpThreshold: 70, name: 'Faza 2: Przebudzenie', description: 'Las się budzi.', damageMultiplier: 1.2, newAbilities: ['summon_treants'] },
      { hpThreshold: 40, name: 'Faza 3: Gniew', description: 'Natura jest wściekła!', damageMultiplier: 1.5, newAbilities: ['natures_wrath'] },
    ],
    baseGold: 20000,
    baseXp: 4000,
    legacyPoints: 10,
    legendaryRewards: [
      LEGENDARY_ITEMS.nature_bow,
      LEGENDARY_ITEMS.forest_blessing,
      LEGENDARY_ITEMS.seed_of_life,
      LEGENDARY_ITEMS.boss_essence,
    ],
    guaranteedRewards: [{ itemId: 'ancient_wood', amount: 5 }],
  },

  mechanical_titan: {
    id: 'mechanical_titan',
    name: 'Mechaniczny Tytan',
    title: 'Ostatni Twór Starożytnych',
    description: 'Gigantyczna maszyna z zapomnianej ery.',
    lore: 'Mechaniczny Tytan był ostatnim dziełem Starożytnych Inżynierów. Strzeże tajemnic ich technologii.',
    icon: 'mdi-robot',
    element: 'mechanical',
    difficulty: 'hard',
    tier: 4,
    baseHp: 500000,
    attack: 300,
    defense: 400,
    speed: 50,
    requiredLevel: 25,
    spawnType: 'biweekly',
    spawnInterval: 120, // every 5 days
    fightDuration: 240,
    abilities: [
      { id: 'cannon_blast', name: 'Wystrzał z Armaty', description: 'Strzela z ogromnej armaty.', damage: 150, cooldown: 12 },
      { id: 'gear_storm', name: 'Burza Trybików', description: 'Miotający trybikami atak obszarowy.', damage: 80, cooldown: 18 },
      { id: 'repair_protocol', name: 'Protokół Naprawy', description: 'Naprawia się.', effect: 'heal', cooldown: 45 },
      { id: 'overcharge', name: 'Przeciążenie', description: 'Zwiększa moc kosztem HP.', effect: 'buff', cooldown: 60 },
    ],
    phases: [
      { hpThreshold: 100, name: 'Faza 1: Aktywacja', description: 'Systemy online.', damageMultiplier: 1.0 },
      { hpThreshold: 65, name: 'Faza 2: Tryb Bojowy', description: 'Protokoły bojowe aktywowane.', damageMultiplier: 1.3, newAbilities: ['gear_storm'] },
      { hpThreshold: 35, name: 'Faza 3: Przeciążenie', description: 'UWAGA: PRZECIĄŻENIE!', damageMultiplier: 1.8, newAbilities: ['overcharge'] },
    ],
    baseGold: 35000,
    baseXp: 7000,
    legacyPoints: 20,
    legendaryRewards: [
      LEGENDARY_ITEMS.golem_core,
      LEGENDARY_ITEMS.clockwork_armor,
      LEGENDARY_ITEMS.titan_blueprint,
      LEGENDARY_ITEMS.boss_essence,
    ],
    guaranteedRewards: [{ itemId: 'ancient_gears', amount: 10 }],
  },
};

export const ELEMENT_DATA: Record<BossElement, { name: string; color: string; icon: string }> = {
  fire: { name: 'Ogień', color: '#F44336', icon: 'mdi-fire' },
  ice: { name: 'Lód', color: '#2196F3', icon: 'mdi-snowflake' },
  nature: { name: 'Natura', color: '#4CAF50', icon: 'mdi-leaf' },
  void: { name: 'Pustka', color: '#9C27B0', icon: 'mdi-blur' },
  mechanical: { name: 'Mechanika', color: '#607D8B', icon: 'mdi-cog' },
  holy: { name: 'Światło', color: '#FFC107', icon: 'mdi-white-balance-sunny' },
  shadow: { name: 'Cień', color: '#424242', icon: 'mdi-weather-night' },
};

export const DIFFICULTY_DATA: Record<BossDifficulty, { name: string; color: string; stars: number }> = {
  easy: { name: 'Łatwy', color: '#4CAF50', stars: 1 },
  medium: { name: 'Średni', color: '#8BC34A', stars: 2 },
  hard: { name: 'Trudny', color: '#FFC107', stars: 3 },
  nightmare: { name: 'Koszmar', color: '#FF9800', stars: 4 },
  legendary: { name: 'Legendarny', color: '#F44336', stars: 5 },
  mythic: { name: 'Mityczny', color: '#9C27B0', stars: 6 },
};

export function getWorldBoss(id: string): WorldBoss | undefined { return WORLD_BOSSES[id]; }
export function getLegendaryItem(id: string): LegendaryReward | undefined { return LEGENDARY_ITEMS[id]; }
export function getAvailableBosses(level: number, bossKills: number = 0): WorldBoss[] {
  return Object.values(WORLD_BOSSES).filter(boss => {
    if (boss.requiredLevel > level) return false;
    if (boss.requiredKills && boss.requiredKills > bossKills) return false;
    return true;
  });
}
