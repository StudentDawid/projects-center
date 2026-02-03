/**
 * Quests Data - Quest System, Objectives, Rewards
 */

export type QuestType = 'main' | 'side' | 'faction' | 'daily' | 'hidden';
export type QuestStatus = 'locked' | 'available' | 'active' | 'completed' | 'failed';
export type ObjectiveType = 'kill' | 'collect' | 'reach_level' | 'build' | 'craft' | 'explore' | 'reputation' | 'gold' | 'custom';

export interface QuestObjective {
  id: string;
  type: ObjectiveType;
  description: string;
  target?: string;
  targetId?: string;
  amount: number;
  current?: number;
}

export interface QuestReward {
  type: 'gold' | 'xp' | 'item' | 'reputation' | 'unlock' | 'legacy_points';
  target?: string;
  itemId?: string;
  amount: number;
  description: string;
}

export interface QuestRequirement {
  type: 'quest' | 'level' | 'reputation' | 'building';
  questId?: string;
  path?: string;
  factionId?: string;
  buildingId?: string;
  value: number;
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  lore?: string;
  icon: string;
  type: QuestType;
  chapter?: number;
  tier: number;
  requirements: QuestRequirement[];
  objectives: QuestObjective[];
  rewards: QuestReward[];
  timeLimit?: number;
  repeatable: boolean;
  cooldown?: number;
}

export const QUESTS: Record<string, Quest> = {
  // ===== MAIN STORY QUESTS =====
  main_1_awakening: {
    id: 'main_1_awakening', name: 'Przebudzenie', description: 'Twoja przygoda w Aterii się zaczyna.',
    lore: 'Budzisz się w małej wiosce bez wspomnień. Musisz odnaleźć swoją tożsamość.',
    icon: 'mdi-star-shooting', type: 'main', chapter: 1, tier: 1,
    requirements: [],
    objectives: [
      { id: 'obj_1', type: 'reach_level', description: 'Osiągnij poziom 5 wojownika', target: 'warrior', amount: 5 },
      { id: 'obj_2', type: 'gold', description: 'Zdobądź 100 złota', amount: 100 },
    ],
    rewards: [
      { type: 'gold', amount: 200, description: '+200 złota' },
      { type: 'xp', target: 'warrior', amount: 100, description: '+100 XP wojownika' },
      { type: 'unlock', target: 'quest', amount: 1, description: 'Odblokowanie kolejnego questa' },
    ],
    repeatable: false,
  },
  main_2_first_blood: {
    id: 'main_2_first_blood', name: 'Pierwsza Krew', description: 'Udowodnij swoją wartość w walce.',
    lore: 'Bandyci terroryzują okoliczne wioski. Czas pokazać, na co cię stać.',
    icon: 'mdi-sword', type: 'main', chapter: 1, tier: 1,
    requirements: [{ type: 'quest', questId: 'main_1_awakening', value: 1 }],
    objectives: [
      { id: 'obj_1', type: 'kill', description: 'Pokonaj 50 potworów', amount: 50 },
      { id: 'obj_2', type: 'reach_level', description: 'Osiągnij poziom 10 wojownika', target: 'warrior', amount: 10 },
    ],
    rewards: [
      { type: 'gold', amount: 500, description: '+500 złota' },
      { type: 'xp', target: 'warrior', amount: 250, description: '+250 XP wojownika' },
      { type: 'item', itemId: 'iron_sword', amount: 1, description: 'Żelazny Miecz' },
    ],
    repeatable: false,
  },
  main_3_merchant_path: {
    id: 'main_3_merchant_path', name: 'Droga Kupca', description: 'Naucz się sztuki handlu.',
    lore: 'Stary kupiec oferuje ci naukę tajników handlu w zamian za pomoc.',
    icon: 'mdi-cart', type: 'main', chapter: 1, tier: 1,
    requirements: [{ type: 'quest', questId: 'main_2_first_blood', value: 1 }],
    objectives: [
      { id: 'obj_1', type: 'reach_level', description: 'Osiągnij poziom 5 kupca', target: 'merchant', amount: 5 },
      { id: 'obj_2', type: 'gold', description: 'Zarobek 1000 złota', amount: 1000 },
    ],
    rewards: [
      { type: 'gold', amount: 750, description: '+750 złota' },
      { type: 'xp', target: 'merchant', amount: 200, description: '+200 XP kupca' },
    ],
    repeatable: false,
  },
  main_4_knowledge_seeker: {
    id: 'main_4_knowledge_seeker', name: 'Poszukiwacz Wiedzy', description: 'Odkryj tajemnice nauki.',
    lore: 'W ruinach starej biblioteki mogą znajdować się odpowiedzi na twoje pytania.',
    icon: 'mdi-flask', type: 'main', chapter: 1, tier: 2,
    requirements: [{ type: 'quest', questId: 'main_3_merchant_path', value: 1 }],
    objectives: [
      { id: 'obj_1', type: 'reach_level', description: 'Osiągnij poziom 10 naukowca', target: 'scientist', amount: 10 },
      { id: 'obj_2', type: 'custom', description: 'Ukończ 5 badań', target: 'research', amount: 5 },
    ],
    rewards: [
      { type: 'gold', amount: 1000, description: '+1000 złota' },
      { type: 'xp', target: 'scientist', amount: 500, description: '+500 XP naukowca' },
      { type: 'unlock', target: 'alchemy', amount: 1, description: 'Zaawansowana alchemia' },
    ],
    repeatable: false,
  },
  main_5_the_gathering: {
    id: 'main_5_the_gathering', name: 'Zgromadzenie', description: 'Zbuduj swoją osadę.',
    lore: 'Czas osiedlić się i zbudować miejsce, które nazwiesz domem.',
    icon: 'mdi-home-city', type: 'main', chapter: 2, tier: 2,
    requirements: [{ type: 'quest', questId: 'main_4_knowledge_seeker', value: 1 }],
    objectives: [
      { id: 'obj_1', type: 'build', description: 'Zbuduj 5 budynków w osadzie', target: 'township', amount: 5 },
      { id: 'obj_2', type: 'reach_level', description: 'Osiągnij poziom 3 osady', target: 'township', amount: 3 },
    ],
    rewards: [
      { type: 'gold', amount: 2000, description: '+2000 złota' },
      { type: 'legacy_points', amount: 5, description: '+5 Legacy Points' },
    ],
    repeatable: false,
  },
  main_6_diplomatic_ties: {
    id: 'main_6_diplomatic_ties', name: 'Więzy Dyplomatyczne', description: 'Nawiąż relacje z frakcjami.',
    lore: 'Świat Aterii jest pełen frakcji. Twoje sojusze zadecydują o przyszłości.',
    icon: 'mdi-account-tie', type: 'main', chapter: 2, tier: 2,
    requirements: [{ type: 'quest', questId: 'main_5_the_gathering', value: 1 }],
    objectives: [
      { id: 'obj_1', type: 'reputation', description: 'Osiągnij Przyjazny z dowolną frakcją', target: 'any', amount: 50 },
      { id: 'obj_2', type: 'reach_level', description: 'Osiągnij poziom 10 dyplomaty', target: 'diplomat', amount: 10 },
    ],
    rewards: [
      { type: 'gold', amount: 2500, description: '+2500 złota' },
      { type: 'xp', target: 'diplomat', amount: 750, description: '+750 XP dyplomaty' },
      { type: 'reputation', target: 'all', amount: 25, description: '+25 reputacji u wszystkich' },
    ],
    repeatable: false,
  },
  main_7_ancient_mystery: {
    id: 'main_7_ancient_mystery', name: 'Starożytna Tajemnica', description: 'Odkryj prawdę o Aterii.',
    lore: 'Fragmenty twojej przeszłości zaczynają się łączyć. Prawda jest bliżej niż myślisz.',
    icon: 'mdi-eye', type: 'main', chapter: 3, tier: 3,
    requirements: [{ type: 'quest', questId: 'main_6_diplomatic_ties', value: 1 }, { type: 'level', path: 'warrior', value: 25 }],
    objectives: [
      { id: 'obj_1', type: 'explore', description: 'Odkryj 10 sekretnych lokacji', target: 'discoveries', amount: 10 },
      { id: 'obj_2', type: 'reach_level', description: 'Osiągnij poziom 15 mistyka', target: 'mystic', amount: 15 },
      { id: 'obj_3', type: 'custom', description: 'Wykonaj Rytuał Wizji', target: 'ritual_vision', amount: 1 },
    ],
    rewards: [
      { type: 'gold', amount: 5000, description: '+5000 złota' },
      { type: 'legacy_points', amount: 10, description: '+10 Legacy Points' },
      { type: 'unlock', target: 'true_ending', amount: 1, description: 'Ścieżka do prawdziwego zakończenia' },
    ],
    repeatable: false,
  },

  // ===== SIDE QUESTS =====
  side_blacksmith_apprentice: {
    id: 'side_blacksmith_apprentice', name: 'Uczeń Kowala', description: 'Pomóż kowalowi w jego pracy.',
    icon: 'mdi-anvil', type: 'side', tier: 1,
    requirements: [{ type: 'level', path: 'crafting', value: 5 }],
    objectives: [
      { id: 'obj_1', type: 'craft', description: 'Wytwórz 10 przedmiotów', target: 'any', amount: 10 },
    ],
    rewards: [
      { type: 'gold', amount: 300, description: '+300 złota' },
      { type: 'xp', target: 'crafting', amount: 150, description: '+150 XP rzemiosła' },
    ],
    repeatable: false,
  },
  side_herb_collector: {
    id: 'side_herb_collector', name: 'Zbieracz Ziół', description: 'Zioła są potrzebne do alchemii.',
    icon: 'mdi-leaf', type: 'side', tier: 1,
    requirements: [],
    objectives: [
      { id: 'obj_1', type: 'collect', description: 'Zbierz 50 ziół', target: 'herbs', amount: 50 },
    ],
    rewards: [
      { type: 'gold', amount: 200, description: '+200 złota' },
      { type: 'xp', target: 'gathering', amount: 100, description: '+100 XP zbierania' },
    ],
    repeatable: false,
  },
  side_monster_hunter: {
    id: 'side_monster_hunter', name: 'Łowca Potworów', description: 'Potwory zagrażają podróżnym.',
    icon: 'mdi-skull', type: 'side', tier: 2,
    requirements: [{ type: 'level', path: 'warrior', value: 15 }],
    objectives: [
      { id: 'obj_1', type: 'kill', description: 'Pokonaj 200 potworów', amount: 200 },
      { id: 'obj_2', type: 'kill', description: 'Pokonaj 5 bossów', target: 'boss', amount: 5 },
    ],
    rewards: [
      { type: 'gold', amount: 1500, description: '+1500 złota' },
      { type: 'xp', target: 'warrior', amount: 500, description: '+500 XP wojownika' },
    ],
    repeatable: false,
  },
  side_music_maestro: {
    id: 'side_music_maestro', name: 'Mistrz Muzyki', description: 'Zostań znanym bardem.',
    icon: 'mdi-music', type: 'side', tier: 2,
    requirements: [{ type: 'level', path: 'bard', value: 10 }],
    objectives: [
      { id: 'obj_1', type: 'custom', description: 'Wykonaj 20 występów', target: 'performances', amount: 20 },
      { id: 'obj_2', type: 'reach_level', description: 'Osiągnij 500 sławy', target: 'fame', amount: 500 },
    ],
    rewards: [
      { type: 'gold', amount: 1000, description: '+1000 złota' },
      { type: 'xp', target: 'bard', amount: 400, description: '+400 XP barda' },
      { type: 'item', itemId: 'golden_lute', amount: 1, description: 'Złota Lutnia' },
    ],
    repeatable: false,
  },
  side_beast_friend: {
    id: 'side_beast_friend', name: 'Przyjaciel Bestii', description: 'Oswój dzikie stworzenia.',
    icon: 'mdi-paw', type: 'side', tier: 2,
    requirements: [{ type: 'level', path: 'tamer', value: 8 }],
    objectives: [
      { id: 'obj_1', type: 'custom', description: 'Oswój 5 stworzeń', target: 'tamed', amount: 5 },
    ],
    rewards: [
      { type: 'gold', amount: 800, description: '+800 złota' },
      { type: 'xp', target: 'tamer', amount: 350, description: '+350 XP zaklinacza' },
    ],
    repeatable: false,
  },

  // ===== FACTION QUESTS =====
  faction_kingdom_soldier: {
    id: 'faction_kingdom_soldier', name: 'Żołnierz Królestwa', description: 'Służ Królestwu Aterii.',
    icon: 'mdi-shield', type: 'faction', tier: 2,
    requirements: [{ type: 'reputation', factionId: 'kingdom', value: 25 }],
    objectives: [
      { id: 'obj_1', type: 'kill', description: 'Pokonaj 100 wrogów królestwa', target: 'enemies', amount: 100 },
    ],
    rewards: [
      { type: 'gold', amount: 1000, description: '+1000 złota' },
      { type: 'reputation', target: 'kingdom', amount: 50, description: '+50 reputacji Królestwa' },
    ],
    repeatable: false,
  },
  faction_thieves_heist: {
    id: 'faction_thieves_heist', name: 'Wielki Skok', description: 'Wykonaj skok dla Gildii Złodziei.',
    icon: 'mdi-eye-off', type: 'faction', tier: 2,
    requirements: [{ type: 'reputation', factionId: 'thieves_guild', value: 25 }],
    objectives: [
      { id: 'obj_1', type: 'custom', description: 'Ukończ 5 misji szpiegowskich', target: 'spy_missions', amount: 5 },
      { id: 'obj_2', type: 'gold', description: 'Ukradnij 5000 złota', amount: 5000 },
    ],
    rewards: [
      { type: 'gold', amount: 2500, description: '+2500 złota' },
      { type: 'reputation', target: 'thieves_guild', amount: 75, description: '+75 reputacji Gildii' },
    ],
    repeatable: false,
  },
  faction_mages_research: {
    id: 'faction_mages_research', name: 'Badania Magiczne', description: 'Pomóż Zakonowi Magów.',
    icon: 'mdi-wizard-hat', type: 'faction', tier: 2,
    requirements: [{ type: 'reputation', factionId: 'mages_order', value: 25 }],
    objectives: [
      { id: 'obj_1', type: 'reach_level', description: 'Osiągnij poziom 15 czarodzieja', target: 'wizard', amount: 15 },
      { id: 'obj_2', type: 'custom', description: 'Zbadaj 10 zaklęć', target: 'researched_spells', amount: 10 },
    ],
    rewards: [
      { type: 'gold', amount: 1500, description: '+1500 złota' },
      { type: 'reputation', target: 'mages_order', amount: 60, description: '+60 reputacji Zakonu' },
      { type: 'xp', target: 'wizard', amount: 500, description: '+500 XP czarodzieja' },
    ],
    repeatable: false,
  },

  // ===== DAILY QUESTS =====
  daily_monster_slayer: {
    id: 'daily_monster_slayer', name: 'Dzienny Łowca', description: 'Codzienne polowanie na potwory.',
    icon: 'mdi-sword', type: 'daily', tier: 1,
    requirements: [],
    objectives: [
      { id: 'obj_1', type: 'kill', description: 'Pokonaj 25 potworów', amount: 25 },
    ],
    rewards: [
      { type: 'gold', amount: 100, description: '+100 złota' },
      { type: 'xp', target: 'warrior', amount: 50, description: '+50 XP wojownika' },
    ],
    repeatable: true,
    cooldown: 86400, // 24 hours in seconds
  },
  daily_trader: {
    id: 'daily_trader', name: 'Dzienny Handlarz', description: 'Codzienne transakcje handlowe.',
    icon: 'mdi-cart', type: 'daily', tier: 1,
    requirements: [],
    objectives: [
      { id: 'obj_1', type: 'gold', description: 'Zarób 500 złota', amount: 500 },
    ],
    rewards: [
      { type: 'gold', amount: 150, description: '+150 złota bonus' },
      { type: 'xp', target: 'merchant', amount: 50, description: '+50 XP kupca' },
    ],
    repeatable: true,
    cooldown: 86400,
  },
  daily_gatherer: {
    id: 'daily_gatherer', name: 'Dzienny Zbieracz', description: 'Codzienne zbieranie surowców.',
    icon: 'mdi-pickaxe', type: 'daily', tier: 1,
    requirements: [],
    objectives: [
      { id: 'obj_1', type: 'collect', description: 'Zbierz 30 surowców', target: 'any', amount: 30 },
    ],
    rewards: [
      { type: 'gold', amount: 75, description: '+75 złota' },
      { type: 'xp', target: 'gathering', amount: 40, description: '+40 XP zbierania' },
    ],
    repeatable: true,
    cooldown: 86400,
  },
  daily_prayer: {
    id: 'daily_prayer', name: 'Dzienna Modlitwa', description: 'Oddaj cześć bogom.',
    icon: 'mdi-hands-pray', type: 'daily', tier: 1,
    requirements: [{ type: 'level', path: 'priest', value: 3 }],
    objectives: [
      { id: 'obj_1', type: 'custom', description: 'Wykonaj 3 modlitwy', target: 'prayers', amount: 3 },
    ],
    rewards: [
      { type: 'gold', amount: 50, description: '+50 złota' },
      { type: 'xp', target: 'priest', amount: 30, description: '+30 XP kapłana' },
    ],
    repeatable: true,
    cooldown: 86400,
  },

  // ===== HIDDEN QUESTS =====
  hidden_void_whispers: {
    id: 'hidden_void_whispers', name: 'Szepty Pustki', description: '???',
    lore: 'Coś szepce z ciemności...',
    icon: 'mdi-help-circle', type: 'hidden', tier: 4,
    requirements: [
      { type: 'level', path: 'mystic', value: 25 },
      { type: 'level', path: 'wizard', value: 20 },
    ],
    objectives: [
      { id: 'obj_1', type: 'custom', description: 'Odkryj prawdę o Pustce', target: 'void_truth', amount: 1 },
    ],
    rewards: [
      { type: 'legacy_points', amount: 25, description: '+25 Legacy Points' },
      { type: 'unlock', target: 'void_path', amount: 1, description: 'Ścieżka Pustki' },
    ],
    repeatable: false,
  },
  hidden_true_name: {
    id: 'hidden_true_name', name: 'Prawdziwe Imię', description: '???',
    lore: 'Kim naprawdę jesteś?',
    icon: 'mdi-account-question', type: 'hidden', tier: 5,
    requirements: [
      { type: 'quest', questId: 'main_7_ancient_mystery', value: 1 },
      { type: 'quest', questId: 'hidden_void_whispers', value: 1 },
    ],
    objectives: [
      { id: 'obj_1', type: 'custom', description: 'Odkryj swoją przeszłość', target: 'past', amount: 1 },
      { id: 'obj_2', type: 'custom', description: 'Dokonaj ostatecznego wyboru', target: 'final_choice', amount: 1 },
    ],
    rewards: [
      { type: 'legacy_points', amount: 100, description: '+100 Legacy Points' },
      { type: 'unlock', target: 'new_game_plus', amount: 1, description: 'New Game+' },
    ],
    repeatable: false,
  },
};

export const QUEST_TYPE_DATA: Record<QuestType, { name: string; icon: string; color: string }> = {
  main: { name: 'Główna fabuła', icon: 'mdi-star', color: '#FF9800' },
  side: { name: 'Poboczne', icon: 'mdi-map-marker', color: '#4CAF50' },
  faction: { name: 'Frakcyjne', icon: 'mdi-flag', color: '#2196F3' },
  daily: { name: 'Codzienne', icon: 'mdi-calendar-today', color: '#9C27B0' },
  hidden: { name: 'Ukryte', icon: 'mdi-help-circle', color: '#607D8B' },
};

export function getQuest(id: string): Quest | undefined { return QUESTS[id]; }
export function getQuestsByType(type: QuestType): Quest[] { return Object.values(QUESTS).filter(q => q.type === type); }
export function getMainQuests(): Quest[] { return getQuestsByType('main').sort((a, b) => (a.chapter || 0) - (b.chapter || 0)); }
