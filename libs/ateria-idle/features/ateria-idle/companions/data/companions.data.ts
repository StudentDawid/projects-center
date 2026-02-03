/**
 * Companions/NPC System - Recruitable helpers with unique abilities
 */

export type CompanionClass = 'warrior' | 'mage' | 'healer' | 'rogue' | 'crafter' | 'merchant' | 'scholar' | 'beastmaster';
export type CompanionRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type TaskType = 'combat' | 'gathering' | 'crafting' | 'trading' | 'research' | 'exploration' | 'passive';
export type RelationshipLevel = 'stranger' | 'acquaintance' | 'friend' | 'trusted' | 'devoted' | 'soulbound';

export interface CompanionSkill {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'passive' | 'active' | 'task';
  unlockLevel: number;
  effects: { stat: string; value: number }[];
  cooldown?: number; // hours
}

export interface CompanionData {
  id: string;
  name: string;
  title: string;
  description: string;
  lore: string;
  icon: string;
  portrait: string;
  class: CompanionClass;
  rarity: CompanionRarity;
  baseStats: {
    strength: number;
    intelligence: number;
    dexterity: number;
    charisma: number;
    endurance: number;
  };
  skills: CompanionSkill[];
  preferredTasks: TaskType[];
  recruitRequirement: {
    type: 'level' | 'gold' | 'quest' | 'reputation' | 'item' | 'special';
    value: number | string;
    description: string;
  };
  dialogues: {
    greeting: string[];
    idle: string[];
    task_complete: string[];
    level_up: string[];
  };
  gift_preferences: { likes: string[]; dislikes: string[] };
}

export interface CompanionTask {
  id: string;
  name: string;
  description: string;
  type: TaskType;
  icon: string;
  duration: number; // minutes
  requiredStats?: Partial<Record<keyof CompanionData['baseStats'], number>>;
  rewards: {
    companionXp: number;
    playerRewards?: { gold?: number; xp?: number; items?: string[] };
    relationshipPoints?: number;
  };
  successRateBase: number; // 0-100
}

export interface RelationshipData {
  level: RelationshipLevel;
  minPoints: number;
  bonusMultiplier: number;
  unlocks: string[];
}

// ============================================
// CLASS INFO
// ============================================

export const COMPANION_CLASSES: Record<CompanionClass, { name: string; icon: string; color: string; description: string }> = {
  warrior: { name: 'Wojownik', icon: 'mdi-sword', color: '#F44336', description: 'Silny w walce, chroni grupę' },
  mage: { name: 'Mag', icon: 'mdi-wizard-hat', color: '#9C27B0', description: 'Władca magii żywiołów' },
  healer: { name: 'Uzdrowiciel', icon: 'mdi-heart-plus', color: '#4CAF50', description: 'Leczy rany i wspiera' },
  rogue: { name: 'Łotrzyk', icon: 'mdi-knife', color: '#607D8B', description: 'Cichy i sprytny' },
  crafter: { name: 'Rzemieślnik', icon: 'mdi-hammer', color: '#795548', description: 'Mistrz tworzenia' },
  merchant: { name: 'Handlarz', icon: 'mdi-cash', color: '#FFD700', description: 'Znajdzie okazję wszędzie' },
  scholar: { name: 'Uczony', icon: 'mdi-book-open-variant', color: '#2196F3', description: 'Wiedza to potęga' },
  beastmaster: { name: 'Zaklinacz Bestii', icon: 'mdi-paw', color: '#8BC34A', description: 'Przyjaciel zwierząt' },
};

export const RARITY_DATA: Record<CompanionRarity, { name: string; color: string; statMultiplier: number }> = {
  common: { name: 'Pospolity', color: '#9E9E9E', statMultiplier: 1.0 },
  uncommon: { name: 'Niepospolity', color: '#4CAF50', statMultiplier: 1.2 },
  rare: { name: 'Rzadki', color: '#2196F3', statMultiplier: 1.5 },
  epic: { name: 'Epicki', color: '#9C27B0', statMultiplier: 2.0 },
  legendary: { name: 'Legendarny', color: '#FF9800', statMultiplier: 3.0 },
};

export const RELATIONSHIP_LEVELS: RelationshipData[] = [
  { level: 'stranger', minPoints: 0, bonusMultiplier: 1.0, unlocks: [] },
  { level: 'acquaintance', minPoints: 100, bonusMultiplier: 1.1, unlocks: ['basic_dialogue'] },
  { level: 'friend', minPoints: 500, bonusMultiplier: 1.25, unlocks: ['personal_quest', 'gift_bonus'] },
  { level: 'trusted', minPoints: 1500, bonusMultiplier: 1.5, unlocks: ['special_ability', 'backstory'] },
  { level: 'devoted', minPoints: 5000, bonusMultiplier: 2.0, unlocks: ['ultimate_skill', 'soulbond_quest'] },
  { level: 'soulbound', minPoints: 15000, bonusMultiplier: 3.0, unlocks: ['max_potential', 'legendary_dialogue'] },
];

// ============================================
// COMPANIONS
// ============================================

export const COMPANIONS: CompanionData[] = [
  // WARRIORS
  {
    id: 'ser_aldric', name: 'Ser Aldric', title: 'Rycerz Złotej Tarczy', class: 'warrior', rarity: 'rare',
    description: 'Honorowy rycerz, który porzucił dwór by pomagać zwykłym ludziom.',
    lore: 'Aldric był kapitanem królewskiej gwardii, dopóki nie odkrył korupcji na dworze. Teraz walczy za tych, którzy nie mogą walczyć sami.',
    icon: 'mdi-shield-sword', portrait: 'warrior_aldric',
    baseStats: { strength: 18, intelligence: 10, dexterity: 12, charisma: 14, endurance: 16 },
    skills: [
      { id: 'shield_wall', name: 'Ściana Tarczy', description: '+20% obrony dla grupy', icon: 'mdi-shield', type: 'passive', unlockLevel: 1, effects: [{ stat: 'groupDefense', value: 20 }] },
      { id: 'inspiring_presence', name: 'Inspirująca Obecność', description: '+10% obrażeń dla grupy', icon: 'mdi-star', type: 'passive', unlockLevel: 10, effects: [{ stat: 'groupDamage', value: 10 }] },
      { id: 'last_stand', name: 'Ostatni Bastion', description: 'Nieśmiertelność na 30s', icon: 'mdi-shield-star', type: 'active', unlockLevel: 20, effects: [{ stat: 'invulnerable', value: 30 }], cooldown: 24 },
    ],
    preferredTasks: ['combat', 'exploration'],
    recruitRequirement: { type: 'level', value: 15, description: 'Osiągnij poziom 15' },
    dialogues: {
      greeting: ['Za honor!', 'Jak mogę służyć?', 'Mój miecz jest twój.'],
      idle: ['Pamiętaj o treningu.', 'Honor ponad wszystko.'],
      task_complete: ['Zadanie wykonane!', 'Zwycięstwo jest nasze!'],
      level_up: ['Staję się silniejszy!', 'Moja tarcza nie zawiedzie!'],
    },
    gift_preferences: { likes: ['sword', 'armor', 'medal'], dislikes: ['poison', 'dark_artifact'] },
  },
  {
    id: 'grok', name: 'Grok', title: 'Berserker z Północy', class: 'warrior', rarity: 'uncommon',
    description: 'Dziki wojownik z mroźnych ziem północy.',
    lore: 'Grok został wygnany z plemienia za odmowę zabicia niewinnych. Teraz szuka nowego celu.',
    icon: 'mdi-axe-battle', portrait: 'warrior_grok',
    baseStats: { strength: 20, intelligence: 6, dexterity: 10, charisma: 8, endurance: 18 },
    skills: [
      { id: 'berserker_rage', name: 'Szał Berserkera', description: '+50% obrażeń, -25% obrony', icon: 'mdi-fire', type: 'active', unlockLevel: 1, effects: [{ stat: 'damage', value: 50 }, { stat: 'defense', value: -25 }], cooldown: 4 },
      { id: 'thick_skin', name: 'Gruba Skóra', description: 'Redukcja obrażeń 15%', icon: 'mdi-shield', type: 'passive', unlockLevel: 8, effects: [{ stat: 'damageReduction', value: 15 }] },
    ],
    preferredTasks: ['combat', 'gathering'],
    recruitRequirement: { type: 'gold', value: 5000, description: 'Zapłać 5,000 złota' },
    dialogues: {
      greeting: ['GROK MOCNY!', 'Co robić?', 'Walka?'],
      idle: ['Grok nudzi się...', 'Gdzie wróg?'],
      task_complete: ['Grok zrobił!', 'Łatwe!'],
      level_up: ['GROK SILNIEJSZY!', 'HA HA!'],
    },
    gift_preferences: { likes: ['meat', 'axe', 'ale'], dislikes: ['book', 'flower'] },
  },

  // MAGES
  {
    id: 'lyra', name: 'Lyra', title: 'Tkaczka Gwiazd', class: 'mage', rarity: 'epic',
    description: 'Enigmatyczna czarodziejka władająca mocą konstelacji.',
    lore: 'Lyra od dziecka widziała wzory w gwiazdach, których inni nie dostrzegali. Jej magia czerpie z samego kosmosu.',
    icon: 'mdi-star-four-points', portrait: 'mage_lyra',
    baseStats: { strength: 6, intelligence: 20, dexterity: 12, charisma: 16, endurance: 10 },
    skills: [
      { id: 'starfall', name: 'Deszcz Gwiazd', description: 'Obrażenia obszarowe +100%', icon: 'mdi-star-shooting', type: 'active', unlockLevel: 1, effects: [{ stat: 'aoeDamage', value: 100 }], cooldown: 8 },
      { id: 'cosmic_insight', name: 'Kosmiczny Wgląd', description: '+25% XP z badań', icon: 'mdi-eye', type: 'passive', unlockLevel: 12, effects: [{ stat: 'researchXp', value: 25 }] },
      { id: 'constellation_power', name: 'Moc Konstelacji', description: 'Bonus zależny od fazy księżyca', icon: 'mdi-moon-full', type: 'passive', unlockLevel: 25, effects: [{ stat: 'moonBonus', value: 50 }] },
    ],
    preferredTasks: ['research', 'combat'],
    recruitRequirement: { type: 'quest', value: 'stargazer_quest', description: 'Ukończ quest "Wezwanie Gwiazd"' },
    dialogues: {
      greeting: ['Gwiazdy szeptają...', 'Widzę wielkie rzeczy w twojej przyszłości.'],
      idle: ['Konstelacje się zmieniają...', 'Czy widzisz tę gwiazdę?'],
      task_complete: ['Gwiazdy były łaskawe.', 'Jak przepowiedziałam.'],
      level_up: ['Moja więź z kosmosem rośnie!', 'Nowe konstelacje mi się objawiają!'],
    },
    gift_preferences: { likes: ['star_map', 'crystal', 'rare_book'], dislikes: ['mundane_item', 'meat'] },
  },

  // HEALERS
  {
    id: 'elena', name: 'Elena', title: 'Kapłanka Świtu', class: 'healer', rarity: 'rare',
    description: 'Oddana kapłanka bogini światła.',
    lore: 'Elena poświęciła życie służbie bogini Luxary. Jej wiara daje jej moc uzdrawiania najcięższych ran.',
    icon: 'mdi-cross', portrait: 'healer_elena',
    baseStats: { strength: 8, intelligence: 16, dexterity: 10, charisma: 18, endurance: 12 },
    skills: [
      { id: 'healing_light', name: 'Światło Uzdrowienia', description: 'Leczy 50% HP', icon: 'mdi-heart-plus', type: 'active', unlockLevel: 1, effects: [{ stat: 'healing', value: 50 }], cooldown: 2 },
      { id: 'blessing', name: 'Błogosławieństwo', description: '+15% wszystkich statystyk', icon: 'mdi-star', type: 'passive', unlockLevel: 10, effects: [{ stat: 'allStats', value: 15 }] },
      { id: 'resurrection', name: 'Wskrzeszenie', description: 'Wskrzesza poległego', icon: 'mdi-hand-heart', type: 'active', unlockLevel: 30, effects: [{ stat: 'revive', value: 1 }], cooldown: 168 },
    ],
    preferredTasks: ['combat', 'passive'],
    recruitRequirement: { type: 'reputation', value: 'church_honored', description: 'Osiągnij reputację "Szanowany" z Kościołem' },
    dialogues: {
      greeting: ['Niech światło cię prowadzi.', 'Jak mogę pomóc?'],
      idle: ['Modlę się za ciebie.', 'Światło chroni nas wszystkich.'],
      task_complete: ['Bogini jest zadowolona.', 'Służba jest nagrodą samą w sobie.'],
      level_up: ['Moja wiara rośnie!', 'Czuję moc bogini!'],
    },
    gift_preferences: { likes: ['holy_symbol', 'incense', 'prayer_book'], dislikes: ['dark_artifact', 'alcohol'] },
  },

  // ROGUES
  {
    id: 'shadow', name: 'Cień', title: 'Mistrz Cieni', class: 'rogue', rarity: 'epic',
    description: 'Nikt nie zna jego prawdziwego imienia. Nikt go nie widział.',
    lore: 'Legenda mówi, że Cień był kiedyś zwykłym chłopcem, dopóki nie został przyjęty przez Gildie Cieni.',
    icon: 'mdi-ninja', portrait: 'rogue_shadow',
    baseStats: { strength: 12, intelligence: 14, dexterity: 20, charisma: 8, endurance: 10 },
    skills: [
      { id: 'stealth', name: 'Ukrycie', description: '+50% do ukrycia', icon: 'mdi-eye-off', type: 'passive', unlockLevel: 1, effects: [{ stat: 'stealth', value: 50 }] },
      { id: 'backstab', name: 'Cios w Plecy', description: '+200% obrażeń z ukrycia', icon: 'mdi-knife', type: 'passive', unlockLevel: 15, effects: [{ stat: 'backstabDamage', value: 200 }] },
      { id: 'vanish', name: 'Zniknięcie', description: 'Natychmiastowe ukrycie', icon: 'mdi-smoke', type: 'active', unlockLevel: 25, effects: [{ stat: 'instantStealth', value: 1 }], cooldown: 1 },
    ],
    preferredTasks: ['exploration', 'trading'],
    recruitRequirement: { type: 'special', value: 'find_in_shadows', description: 'Znajdź go w Cienistych Bagnach nocą' },
    dialogues: {
      greeting: ['...', 'Nie widziałeś mnie.'],
      idle: ['*cisza*', 'Obserwuję.'],
      task_complete: ['Zrobione.', '...'],
      level_up: ['Staję się cieniem.', 'Nikt mnie nie zobaczy.'],
    },
    gift_preferences: { likes: ['dagger', 'cloak', 'poison'], dislikes: ['torch', 'bell'] },
  },

  // CRAFTERS
  {
    id: 'torbin', name: 'Torbin', title: 'Mistrz Kuźni', class: 'crafter', rarity: 'rare',
    description: 'Krasnoludzki kowal o legendarnych umiejętnościach.',
    lore: 'Torbin wykuł swoją pierwszą broń mając 10 lat. Od tego czasu stworzył tysiące arcydzieł.',
    icon: 'mdi-anvil', portrait: 'crafter_torbin',
    baseStats: { strength: 16, intelligence: 14, dexterity: 14, charisma: 10, endurance: 16 },
    skills: [
      { id: 'master_craft', name: 'Mistrzowski Wyrób', description: '+25% jakości craftingu', icon: 'mdi-star', type: 'passive', unlockLevel: 1, effects: [{ stat: 'craftQuality', value: 25 }] },
      { id: 'efficient_smith', name: 'Efektywność Kowala', description: '-20% materiałów', icon: 'mdi-recycle', type: 'passive', unlockLevel: 12, effects: [{ stat: 'materialCost', value: -20 }] },
      { id: 'legendary_forge', name: 'Legendarna Kuźnia', description: 'Szansa na legendarny przedmiot', icon: 'mdi-fire', type: 'passive', unlockLevel: 30, effects: [{ stat: 'legendaryChance', value: 5 }] },
    ],
    preferredTasks: ['crafting', 'gathering'],
    recruitRequirement: { type: 'item', value: 'mithril_ingot', description: 'Przynieś sztabkę mithrilu' },
    dialogues: {
      greeting: ['A, kolejny klient!', 'Co mogę wykuć?'],
      idle: ['Ta stal nie jest najlepsza...', 'Potrzebuję lepszego węgla.'],
      task_complete: ['Arcydzieło!', 'Moja najlepsza praca!'],
      level_up: ['Moje ręce są pewniejsze!', 'Widzę nowe możliwości!'],
    },
    gift_preferences: { likes: ['rare_ore', 'hammer', 'blueprints'], dislikes: ['cheap_metal', 'wood'] },
  },

  // MERCHANTS
  {
    id: 'zara', name: 'Zara', title: 'Królowa Targów', class: 'merchant', rarity: 'uncommon',
    description: 'Sprytna handlarka z dalekich krain wschodu.',
    lore: 'Zara przeszła długą drogę od ulicznej sprzedawczyni do jednej z najbogatszych kupcowych na kontynencie.',
    icon: 'mdi-cash-multiple', portrait: 'merchant_zara',
    baseStats: { strength: 8, intelligence: 16, dexterity: 12, charisma: 20, endurance: 10 },
    skills: [
      { id: 'keen_eye', name: 'Bystre Oko', description: '+20% wartości sprzedaży', icon: 'mdi-eye', type: 'passive', unlockLevel: 1, effects: [{ stat: 'sellPrice', value: 20 }] },
      { id: 'bargain_hunter', name: 'Łowca Okazji', description: '-15% cen zakupu', icon: 'mdi-tag', type: 'passive', unlockLevel: 10, effects: [{ stat: 'buyPrice', value: -15 }] },
      { id: 'trade_routes', name: 'Szlaki Handlowe', description: '+30% złota z karawan', icon: 'mdi-truck', type: 'passive', unlockLevel: 20, effects: [{ stat: 'caravanGold', value: 30 }] },
    ],
    preferredTasks: ['trading', 'exploration'],
    recruitRequirement: { type: 'gold', value: 25000, description: 'Zainwestuj 25,000 złota' },
    dialogues: {
      greeting: ['Witaj, przyjacielu handlu!', 'Mam dla ciebie okazję!'],
      idle: ['Ceny rosną na wschodzie...', 'Słyszałam o rzadkim towarze...'],
      task_complete: ['Zysk!', 'Interes zamknięty!'],
      level_up: ['Moje kontakty rosną!', 'Nowe możliwości!'],
    },
    gift_preferences: { likes: ['gold_coin', 'exotic_goods', 'jewel'], dislikes: ['common_item', 'weapon'] },
  },

  // SCHOLARS
  {
    id: 'professor_elm', name: 'Profesor Elm', title: 'Mistrz Wiedzy', class: 'scholar', rarity: 'rare',
    description: 'Ekscentryczny uczony z Akademii Arcanum.',
    lore: 'Elm spędził 50 lat studiując starożytne teksty. Zna odpowiedzi na pytania, których nikt jeszcze nie zadał.',
    icon: 'mdi-school', portrait: 'scholar_elm',
    baseStats: { strength: 6, intelligence: 22, dexterity: 8, charisma: 14, endurance: 8 },
    skills: [
      { id: 'research_boost', name: 'Przyśpieszenie Badań', description: '+30% szybkości badań', icon: 'mdi-flask', type: 'passive', unlockLevel: 1, effects: [{ stat: 'researchSpeed', value: 30 }] },
      { id: 'ancient_knowledge', name: 'Starożytna Wiedza', description: '+50% XP z odkryć lore', icon: 'mdi-book-open', type: 'passive', unlockLevel: 15, effects: [{ stat: 'loreXp', value: 50 }] },
      { id: 'eureka', name: 'Eureka!', description: 'Natychmiastowe ukończenie badania', icon: 'mdi-lightbulb', type: 'active', unlockLevel: 25, effects: [{ stat: 'instantResearch', value: 1 }], cooldown: 72 },
    ],
    preferredTasks: ['research', 'passive'],
    recruitRequirement: { type: 'level', value: 20, description: 'Osiągnij poziom 20 i odwiedź Akademię' },
    dialogues: {
      greeting: ['Fascynujące!', 'Czy słyszałeś o...?'],
      idle: ['Hmm, ciekawe...', 'Muszę to zbadać...'],
      task_complete: ['Eureka!', 'Moje teorie się potwierdzają!'],
      level_up: ['Wiedza jest potęgą!', 'Nowe horyzonty!'],
    },
    gift_preferences: { likes: ['rare_book', 'artifact', 'scroll'], dislikes: ['weapon', 'alcohol'] },
  },

  // BEASTMASTERS
  {
    id: 'fern', name: 'Fern', title: 'Szeptaczka Zwierząt', class: 'beastmaster', rarity: 'legendary',
    description: 'Młoda druidka z niezwykłą więzią ze zwierzętami.',
    lore: 'Fern była wychowywana przez wilki po tym, jak jej rodzice zginęli. Potrafi komunikować się z każdym stworzeniem.',
    icon: 'mdi-paw', portrait: 'beastmaster_fern',
    baseStats: { strength: 10, intelligence: 14, dexterity: 16, charisma: 18, endurance: 14 },
    skills: [
      { id: 'animal_bond', name: 'Więź ze Zwierzętami', description: '+50% efektywności towarzyszy', icon: 'mdi-heart', type: 'passive', unlockLevel: 1, effects: [{ stat: 'companionEfficiency', value: 50 }] },
      { id: 'call_wild', name: 'Zew Natury', description: 'Przyzywa dzikiego towarzysza', icon: 'mdi-wolf', type: 'active', unlockLevel: 15, effects: [{ stat: 'summonBeast', value: 1 }], cooldown: 24 },
      { id: 'pack_leader', name: 'Lider Watahy', description: 'Bonus za każdego towarzysza', icon: 'mdi-account-group', type: 'passive', unlockLevel: 30, effects: [{ stat: 'packBonus', value: 10 }] },
    ],
    preferredTasks: ['exploration', 'gathering'],
    recruitRequirement: { type: 'special', value: 'befriend_wolf', description: 'Zaprzyjaźnij się z Alfą Wilków w Szepczącym Lesie' },
    dialogues: {
      greeting: ['*świergot ptaków*', 'Natura cię wita.'],
      idle: ['Czy słyszysz las?', 'Zwierzęta są niespokojne...'],
      task_complete: ['Natura nam sprzyjała.', 'Razem ze stworzeniami.'],
      level_up: ['Moja więź z naturą rośnie!', 'Słyszę nowe głosy!'],
    },
    gift_preferences: { likes: ['animal_treat', 'herb', 'feather'], dislikes: ['cage', 'trap', 'poison'] },
  },
];

// ============================================
// COMPANION TASKS
// ============================================

export const COMPANION_TASKS: CompanionTask[] = [
  // Combat tasks
  { id: 'patrol', name: 'Patrol', description: 'Patroluj okolice w poszukiwaniu zagrożeń', type: 'combat', icon: 'mdi-shield', duration: 60,
    requiredStats: { strength: 10 }, rewards: { companionXp: 50, playerRewards: { gold: 100, xp: 50 }, relationshipPoints: 5 }, successRateBase: 80 },
  { id: 'monster_hunt', name: 'Polowanie', description: 'Poluj na potwory', type: 'combat', icon: 'mdi-sword', duration: 120,
    requiredStats: { strength: 15, endurance: 12 }, rewards: { companionXp: 100, playerRewards: { gold: 300, xp: 150 }, relationshipPoints: 10 }, successRateBase: 70 },
  { id: 'dungeon_clear', name: 'Czyszczenie Dungeonu', description: 'Wyczyść mały dungeon', type: 'combat', icon: 'mdi-castle', duration: 240,
    requiredStats: { strength: 20, endurance: 18 }, rewards: { companionXp: 250, playerRewards: { gold: 1000, xp: 500 }, relationshipPoints: 25 }, successRateBase: 60 },

  // Gathering tasks
  { id: 'gather_herbs', name: 'Zbieranie Ziół', description: 'Zbieraj zioła w okolicy', type: 'gathering', icon: 'mdi-leaf', duration: 45,
    requiredStats: { dexterity: 8 }, rewards: { companionXp: 30, playerRewards: { items: ['herb_bundle'] }, relationshipPoints: 3 }, successRateBase: 90 },
  { id: 'mining_expedition', name: 'Wyprawa Górnicza', description: 'Wydobywaj rudy', type: 'gathering', icon: 'mdi-pickaxe', duration: 90,
    requiredStats: { strength: 12, endurance: 10 }, rewards: { companionXp: 60, playerRewards: { items: ['ore_bundle'] }, relationshipPoints: 5 }, successRateBase: 85 },

  // Crafting tasks
  { id: 'assist_crafting', name: 'Pomoc w Rzemiośle', description: 'Pomóż w warsztacie', type: 'crafting', icon: 'mdi-hammer', duration: 60,
    requiredStats: { dexterity: 10, intelligence: 8 }, rewards: { companionXp: 40, relationshipPoints: 5 }, successRateBase: 85 },
  { id: 'forge_work', name: 'Praca w Kuźni', description: 'Wykuwaj przedmioty', type: 'crafting', icon: 'mdi-anvil', duration: 120,
    requiredStats: { strength: 14, dexterity: 12 }, rewards: { companionXp: 80, playerRewards: { items: ['crafted_item'] }, relationshipPoints: 8 }, successRateBase: 75 },

  // Trading tasks
  { id: 'market_trade', name: 'Handel na Targu', description: 'Handluj na lokalnym targu', type: 'trading', icon: 'mdi-store', duration: 60,
    requiredStats: { charisma: 12 }, rewards: { companionXp: 40, playerRewards: { gold: 200 }, relationshipPoints: 5 }, successRateBase: 85 },
  { id: 'caravan_escort', name: 'Eskorta Karawany', description: 'Eskortuj karawanę handlową', type: 'trading', icon: 'mdi-truck', duration: 180,
    requiredStats: { charisma: 10, strength: 12 }, rewards: { companionXp: 100, playerRewards: { gold: 500 }, relationshipPoints: 12 }, successRateBase: 70 },

  // Research tasks
  { id: 'library_study', name: 'Studia w Bibliotece', description: 'Badaj starożytne teksty', type: 'research', icon: 'mdi-book', duration: 90,
    requiredStats: { intelligence: 14 }, rewards: { companionXp: 60, playerRewards: { xp: 100 }, relationshipPoints: 5 }, successRateBase: 90 },
  { id: 'artifact_analysis', name: 'Analiza Artefaktu', description: 'Badaj tajemniczy artefakt', type: 'research', icon: 'mdi-magnify', duration: 180,
    requiredStats: { intelligence: 18 }, rewards: { companionXp: 120, playerRewards: { xp: 300 }, relationshipPoints: 15 }, successRateBase: 70 },

  // Exploration tasks
  { id: 'scout_area', name: 'Zwiady', description: 'Zwiaduj nowy obszar', type: 'exploration', icon: 'mdi-compass', duration: 60,
    requiredStats: { dexterity: 10 }, rewards: { companionXp: 50, relationshipPoints: 5 }, successRateBase: 85 },
  { id: 'map_region', name: 'Mapowanie Regionu', description: 'Stwórz mapę regionu', type: 'exploration', icon: 'mdi-map', duration: 150,
    requiredStats: { intelligence: 12, dexterity: 12 }, rewards: { companionXp: 90, relationshipPoints: 10 }, successRateBase: 75 },

  // Passive tasks
  { id: 'guard_duty', name: 'Straż', description: 'Strzeż osady', type: 'passive', icon: 'mdi-shield-account', duration: 240,
    rewards: { companionXp: 60, relationshipPoints: 8 }, successRateBase: 95 },
  { id: 'rest', name: 'Odpoczynek', description: 'Odpoczywaj i regeneruj siły', type: 'passive', icon: 'mdi-sleep', duration: 60,
    rewards: { companionXp: 10, relationshipPoints: 2 }, successRateBase: 100 },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getCompanion(id: string): CompanionData | undefined {
  return COMPANIONS.find(c => c.id === id);
}

export function getCompanionsByClass(companionClass: CompanionClass): CompanionData[] {
  return COMPANIONS.filter(c => c.class === companionClass);
}

export function getCompanionsByRarity(rarity: CompanionRarity): CompanionData[] {
  return COMPANIONS.filter(c => c.rarity === rarity);
}

export function getTask(id: string): CompanionTask | undefined {
  return COMPANION_TASKS.find(t => t.id === id);
}

export function getTasksByType(type: TaskType): CompanionTask[] {
  return COMPANION_TASKS.filter(t => t.type === type);
}

export function getRelationshipLevel(points: number): RelationshipData {
  for (let i = RELATIONSHIP_LEVELS.length - 1; i >= 0; i--) {
    if (points >= RELATIONSHIP_LEVELS[i].minPoints) {
      return RELATIONSHIP_LEVELS[i];
    }
  }
  return RELATIONSHIP_LEVELS[0];
}

export function calculateTaskSuccessRate(
  companion: CompanionData,
  task: CompanionTask,
  companionLevel: number,
  relationship: number
): number {
  let rate = task.successRateBase;
  
  // Stat bonuses
  if (task.requiredStats) {
    for (const [stat, required] of Object.entries(task.requiredStats)) {
      const companionStat = companion.baseStats[stat as keyof typeof companion.baseStats] || 0;
      const scaledStat = companionStat + companionLevel * 0.5;
      if (scaledStat >= required) {
        rate += Math.min(10, (scaledStat - required) * 2);
      } else {
        rate -= (required - scaledStat) * 5;
      }
    }
  }
  
  // Preferred task bonus
  if (companion.preferredTasks.includes(task.type)) {
    rate += 10;
  }
  
  // Relationship bonus
  const relationshipData = getRelationshipLevel(relationship);
  rate *= relationshipData.bonusMultiplier;
  
  return Math.max(10, Math.min(99, rate));
}
