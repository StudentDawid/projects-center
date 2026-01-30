/**
 * Global Reputation System - Karma, Titles, Fame, Alignment
 */

export type AlignmentType = 'lawful_good' | 'neutral_good' | 'chaotic_good' | 'lawful_neutral' | 'true_neutral' | 'chaotic_neutral' | 'lawful_evil' | 'neutral_evil' | 'chaotic_evil';
export type TitleCategory = 'combat' | 'trade' | 'exploration' | 'crafting' | 'social' | 'magic' | 'nature' | 'special';
export type ReputationTier = 'unknown' | 'known' | 'recognized' | 'famous' | 'legendary' | 'mythical';

export interface AlignmentData {
  id: AlignmentType;
  name: string;
  description: string;
  icon: string;
  color: string;
  lawChaos: number; // -100 to 100 (chaos to law)
  goodEvil: number; // -100 to 100 (evil to good)
  bonuses: { stat: string; value: number }[];
  unlockedAbilities?: string[];
}

export interface ReputationTitle {
  id: string;
  name: string;
  description: string;
  category: TitleCategory;
  icon: string;
  color: string;
  requirement: {
    type: 'karma' | 'fame' | 'kills' | 'gold' | 'level' | 'exploration' | 'crafts' | 'quests' | 'special';
    value: number;
    comparison?: 'gte' | 'lte' | 'eq';
    target?: string;
  };
  bonuses: { stat: string; value: number; description: string }[];
  isHidden?: boolean;
}

export interface FameMilestone {
  fame: number;
  tier: ReputationTier;
  name: string;
  description: string;
  rewards: { type: string; value: number }[];
}

export interface KarmaAction {
  id: string;
  name: string;
  karmaChange: number;
  description: string;
  category: 'combat' | 'social' | 'trade' | 'exploration' | 'quest';
}

// ============================================
// ALIGNMENTS
// ============================================

export const ALIGNMENTS: Record<AlignmentType, AlignmentData> = {
  lawful_good: {
    id: 'lawful_good', name: 'Praworządny Dobry', icon: 'mdi-shield-star',
    description: 'Obrońca prawa i sprawiedliwości. Walczysz ze złem, przestrzegając zasad.',
    color: '#FFD700', lawChaos: 75, goodEvil: 75,
    bonuses: [{ stat: 'defense', value: 15 }, { stat: 'healingReceived', value: 10 }],
    unlockedAbilities: ['divine_shield', 'smite_evil'],
  },
  neutral_good: {
    id: 'neutral_good', name: 'Neutralny Dobry', icon: 'mdi-heart',
    description: 'Czynisz dobro bez względu na prawo. Pomagasz tym, którzy tego potrzebują.',
    color: '#4CAF50', lawChaos: 0, goodEvil: 75,
    bonuses: [{ stat: 'healingPower', value: 20 }, { stat: 'xpBonus', value: 5 }],
    unlockedAbilities: ['blessing_of_kindness'],
  },
  chaotic_good: {
    id: 'chaotic_good', name: 'Chaotyczny Dobry', icon: 'mdi-lightning-bolt',
    description: 'Wolność i dobro ponad wszystko. Łamiesz zasady, by pomagać innym.',
    color: '#03A9F4', lawChaos: -75, goodEvil: 75,
    bonuses: [{ stat: 'critChance', value: 10 }, { stat: 'speed', value: 15 }],
    unlockedAbilities: ['rebel_strike', 'freedom_dash'],
  },
  lawful_neutral: {
    id: 'lawful_neutral', name: 'Praworządny Neutralny', icon: 'mdi-scale-balance',
    description: 'Prawo jest najważniejsze. Egzekwujesz zasady bez względu na moralność.',
    color: '#9E9E9E', lawChaos: 75, goodEvil: 0,
    bonuses: [{ stat: 'goldBonus', value: 10 }, { stat: 'orderEfficiency', value: 15 }],
    unlockedAbilities: ['judge_verdict'],
  },
  true_neutral: {
    id: 'true_neutral', name: 'Prawdziwie Neutralny', icon: 'mdi-circle-outline',
    description: 'Równowaga we wszystkim. Nie opowiadasz się po żadnej stronie.',
    color: '#795548', lawChaos: 0, goodEvil: 0,
    bonuses: [{ stat: 'allStats', value: 5 }, { stat: 'adaptability', value: 10 }],
    unlockedAbilities: ['balance_restoration'],
  },
  chaotic_neutral: {
    id: 'chaotic_neutral', name: 'Chaotyczny Neutralny', icon: 'mdi-shuffle-variant',
    description: 'Wolność osobista jest najważniejsza. Działasz według własnych zasad.',
    color: '#FF9800', lawChaos: -75, goodEvil: 0,
    bonuses: [{ stat: 'luck', value: 15 }, { stat: 'escapeChance', value: 20 }],
    unlockedAbilities: ['unpredictable_strike', 'chaos_luck'],
  },
  lawful_evil: {
    id: 'lawful_evil', name: 'Praworządny Zły', icon: 'mdi-crown',
    description: 'Wykorzystujesz prawo do własnych celów. Władza przez porządek.',
    color: '#7B1FA2', lawChaos: 75, goodEvil: -75,
    bonuses: [{ stat: 'intimidation', value: 20 }, { stat: 'goldFromNPC', value: 15 }],
    unlockedAbilities: ['iron_rule', 'demand_tribute'],
  },
  neutral_evil: {
    id: 'neutral_evil', name: 'Neutralny Zły', icon: 'mdi-skull',
    description: 'Robisz to, co przynosi korzyść. Bez skrupułów i ograniczeń.',
    color: '#424242', lawChaos: 0, goodEvil: -75,
    bonuses: [{ stat: 'backstabDamage', value: 25 }, { stat: 'poisonDamage', value: 15 }],
    unlockedAbilities: ['ruthless_efficiency', 'exploit_weakness'],
  },
  chaotic_evil: {
    id: 'chaotic_evil', name: 'Chaotyczny Zły', icon: 'mdi-fire',
    description: 'Destrukcja i chaos. Niszczysz wszystko na swojej drodze.',
    color: '#D32F2F', lawChaos: -75, goodEvil: -75,
    bonuses: [{ stat: 'damage', value: 20 }, { stat: 'fearAura', value: 15 }],
    unlockedAbilities: ['rampage', 'terror_strike'],
  },
};

// ============================================
// FAME MILESTONES
// ============================================

export const FAME_MILESTONES: FameMilestone[] = [
  { fame: 0, tier: 'unknown', name: 'Nieznany', description: 'Nikt nie wie kim jesteś.', rewards: [] },
  { fame: 100, tier: 'known', name: 'Znany', description: 'Ludzie zaczynają rozpoznawać twoje imię.', rewards: [{ type: 'goldBonus', value: 5 }] },
  { fame: 500, tier: 'recognized', name: 'Rozpoznawalny', description: 'Twoja reputacja cię wyprzedza.', rewards: [{ type: 'goldBonus', value: 10 }, { type: 'shopDiscount', value: 5 }] },
  { fame: 2000, tier: 'famous', name: 'Sławny', description: 'Bardy śpiewają o twoich czynach.', rewards: [{ type: 'goldBonus', value: 15 }, { type: 'shopDiscount', value: 10 }, { type: 'xpBonus', value: 5 }] },
  { fame: 10000, tier: 'legendary', name: 'Legendarny', description: 'Twoje imię przejdzie do historii.', rewards: [{ type: 'goldBonus', value: 25 }, { type: 'shopDiscount', value: 15 }, { type: 'xpBonus', value: 10 }] },
  { fame: 50000, tier: 'mythical', name: 'Mityczny', description: 'Stajesz się żywą legendą, porównywaną z bohaterami starożytności.', rewards: [{ type: 'goldBonus', value: 50 }, { type: 'shopDiscount', value: 25 }, { type: 'xpBonus', value: 20 }, { type: 'specialTitle', value: 1 }] },
];

// ============================================
// TITLES
// ============================================

export const REPUTATION_TITLES: ReputationTitle[] = [
  // Combat titles
  { id: 'slayer', name: 'Pogromca', description: 'Zabij 1000 potworów', category: 'combat', icon: 'mdi-sword', color: '#F44336',
    requirement: { type: 'kills', value: 1000 }, bonuses: [{ stat: 'damage', value: 5, description: '+5% obrażeń' }] },
  { id: 'champion', name: 'Mistrz', description: 'Pokonaj 10 bossów', category: 'combat', icon: 'mdi-trophy', color: '#FF9800',
    requirement: { type: 'kills', value: 10, target: 'boss' }, bonuses: [{ stat: 'bossKillXp', value: 20, description: '+20% XP z bossów' }] },
  { id: 'dragonslayer', name: 'Smokobójca', description: 'Pokonaj Starożytnego Smoka', category: 'combat', icon: 'mdi-dragon', color: '#E91E63',
    requirement: { type: 'special', value: 1, target: 'ancient_dragon' }, bonuses: [{ stat: 'fireResist', value: 25, description: '+25% odporności na ogień' }] },
  { id: 'pacifist', name: 'Pacyfista', description: 'Osiągnij 50 poziom bez zabijania 100+ potworów', category: 'combat', icon: 'mdi-peace', color: '#9C27B0',
    requirement: { type: 'special', value: 1, target: 'pacifist_run' }, bonuses: [{ stat: 'diplomacy', value: 30, description: '+30% dyplomacji' }], isHidden: true },
  
  // Trade titles
  { id: 'merchant_prince', name: 'Książę Kupców', description: 'Zarobij 1 milion złota', category: 'trade', icon: 'mdi-cash-multiple', color: '#FFD700',
    requirement: { type: 'gold', value: 1000000 }, bonuses: [{ stat: 'goldBonus', value: 15, description: '+15% złota' }] },
  { id: 'haggler', name: 'Targowicz', description: 'Wygraj 100 negocjacji', category: 'trade', icon: 'mdi-handshake', color: '#4CAF50',
    requirement: { type: 'special', value: 100, target: 'haggling_wins' }, bonuses: [{ stat: 'haggling', value: 10, description: '+10% do negocjacji' }] },
  
  // Exploration titles  
  { id: 'explorer', name: 'Odkrywca', description: 'Odkryj wszystkie regiony', category: 'exploration', icon: 'mdi-compass', color: '#2196F3',
    requirement: { type: 'exploration', value: 12 }, bonuses: [{ stat: 'travelSpeed', value: 20, description: '+20% szybkości podróży' }] },
  { id: 'cartographer', name: 'Kartograf', description: 'Odkryj 30 POI', category: 'exploration', icon: 'mdi-map', color: '#00BCD4',
    requirement: { type: 'exploration', value: 30, target: 'poi' }, bonuses: [{ stat: 'discoveryChance', value: 15, description: '+15% szansy odkrycia' }] },
  
  // Crafting titles
  { id: 'artisan', name: 'Artysta', description: 'Stwórz 500 przedmiotów', category: 'crafting', icon: 'mdi-hammer', color: '#795548',
    requirement: { type: 'crafts', value: 500 }, bonuses: [{ stat: 'craftSpeed', value: 10, description: '+10% szybkości craftingu' }] },
  { id: 'mastersmith', name: 'Mistrz Kowalstwa', description: 'Stwórz przedmiot legendarnej jakości', category: 'crafting', icon: 'mdi-anvil', color: '#607D8B',
    requirement: { type: 'special', value: 1, target: 'legendary_craft' }, bonuses: [{ stat: 'craftQuality', value: 15, description: '+15% jakości' }] },
  
  // Social titles
  { id: 'diplomat', name: 'Ambasador', description: 'Osiągnij maksymalną reputację z 3 frakcjami', category: 'social', icon: 'mdi-account-tie', color: '#3F51B5',
    requirement: { type: 'special', value: 3, target: 'max_faction_rep' }, bonuses: [{ stat: 'factionRepGain', value: 20, description: '+20% reputacji frakcji' }] },
  { id: 'benefactor', name: 'Dobroczyńca', description: 'Rozdaj 100,000 złota NPC', category: 'social', icon: 'mdi-hand-heart', color: '#E91E63',
    requirement: { type: 'special', value: 100000, target: 'gold_donated' }, bonuses: [{ stat: 'karma', value: 50, description: '+50 karmy bazowej' }] },
  
  // Magic titles
  { id: 'archmage', name: 'Arcymag', description: 'Opanuj 25 zaklęć', category: 'magic', icon: 'mdi-wizard-hat', color: '#9C27B0',
    requirement: { type: 'special', value: 25, target: 'spells_mastered' }, bonuses: [{ stat: 'spellPower', value: 15, description: '+15% mocy zaklęć' }] },
  { id: 'elementalist', name: 'Żywiołowiec', description: 'Opanuj wszystkie żywioły', category: 'magic', icon: 'mdi-atom', color: '#00BCD4',
    requirement: { type: 'special', value: 7, target: 'elements_mastered' }, bonuses: [{ stat: 'elementalDamage', value: 20, description: '+20% obrażeń żywiołowych' }] },
  
  // Nature titles
  { id: 'beast_friend', name: 'Przyjaciel Bestii', description: 'Oswój 10 stworzeń', category: 'nature', icon: 'mdi-paw', color: '#8BC34A',
    requirement: { type: 'special', value: 10, target: 'creatures_tamed' }, bonuses: [{ stat: 'companionDamage', value: 15, description: '+15% obrażeń towarzyszy' }] },
  { id: 'nature_speaker', name: 'Głos Natury', description: 'Osiągnij 30 poziom Druida', category: 'nature', icon: 'mdi-leaf', color: '#4CAF50',
    requirement: { type: 'level', value: 30, target: 'druid' }, bonuses: [{ stat: 'harvestYield', value: 20, description: '+20% plonów' }] },
  
  // Special/Hidden titles
  { id: 'hero_of_ateria', name: 'Bohater Aterii', description: 'Ukończ główną linię fabularną', category: 'special', icon: 'mdi-star', color: '#FFD700',
    requirement: { type: 'quests', value: 1, target: 'main_story' }, bonuses: [{ stat: 'allStats', value: 10, description: '+10% wszystkich statystyk' }], isHidden: true },
  { id: 'completionist', name: 'Kolekcjoner', description: 'Zdobądź wszystkie osiągnięcia', category: 'special', icon: 'mdi-medal', color: '#E91E63',
    requirement: { type: 'special', value: 1, target: 'all_achievements' }, bonuses: [{ stat: 'xpBonus', value: 25, description: '+25% XP' }], isHidden: true },
];

// ============================================
// KARMA ACTIONS
// ============================================

export const KARMA_ACTIONS: KarmaAction[] = [
  // Positive actions
  { id: 'help_npc', name: 'Pomoc NPC', karmaChange: 5, description: 'Pomogłeś potrzebującemu', category: 'social' },
  { id: 'donate_gold', name: 'Darowizna', karmaChange: 10, description: 'Przekazałeś złoto na cele dobroczynne', category: 'trade' },
  { id: 'spare_enemy', name: 'Oszczędzenie wroga', karmaChange: 15, description: 'Oszczędziłeś życie przeciwnika', category: 'combat' },
  { id: 'heal_ally', name: 'Uleczenie sojusznika', karmaChange: 3, description: 'Uleczyłeś rannego sojusznika', category: 'social' },
  { id: 'complete_good_quest', name: 'Dobry quest', karmaChange: 20, description: 'Ukończyłeś misję pomagającą innym', category: 'quest' },
  { id: 'protect_innocent', name: 'Ochrona niewinnych', karmaChange: 25, description: 'Ochroniłeś niewinnych przed niebezpieczeństwem', category: 'combat' },
  { id: 'fair_trade', name: 'Uczciwy handel', karmaChange: 2, description: 'Handlowałeś uczciwie', category: 'trade' },
  
  // Negative actions
  { id: 'steal', name: 'Kradzież', karmaChange: -10, description: 'Ukradłeś coś', category: 'social' },
  { id: 'murder_innocent', name: 'Zabójstwo niewinnego', karmaChange: -50, description: 'Zabiłeś niewinną istotę', category: 'combat' },
  { id: 'extortion', name: 'Wymuszenie', karmaChange: -15, description: 'Wymusiłeś coś siłą', category: 'trade' },
  { id: 'betray_ally', name: 'Zdrada sojusznika', karmaChange: -30, description: 'Zdradziłeś swojego sojusznika', category: 'social' },
  { id: 'complete_evil_quest', name: 'Zły quest', karmaChange: -20, description: 'Ukończyłeś mroczną misję', category: 'quest' },
  { id: 'destroy_nature', name: 'Zniszczenie natury', karmaChange: -10, description: 'Zniszczyłeś część natury', category: 'exploration' },
  { id: 'cheat_merchant', name: 'Oszukanie kupca', karmaChange: -8, description: 'Oszukałeś kupca w handlu', category: 'trade' },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getAlignment(lawChaos: number, goodEvil: number): AlignmentType {
  const law = lawChaos > 33 ? 'lawful' : lawChaos < -33 ? 'chaotic' : 'neutral';
  const good = goodEvil > 33 ? 'good' : goodEvil < -33 ? 'evil' : 'neutral';
  
  if (law === 'neutral' && good === 'neutral') return 'true_neutral';
  return `${law}_${good}` as AlignmentType;
}

export function getFameTier(fame: number): FameMilestone {
  for (let i = FAME_MILESTONES.length - 1; i >= 0; i--) {
    if (fame >= FAME_MILESTONES[i].fame) {
      return FAME_MILESTONES[i];
    }
  }
  return FAME_MILESTONES[0];
}

export function getTitle(id: string): ReputationTitle | undefined {
  return REPUTATION_TITLES.find(t => t.id === id);
}

export function getTitlesByCategory(category: TitleCategory): ReputationTitle[] {
  return REPUTATION_TITLES.filter(t => t.category === category);
}

export function getKarmaAction(id: string): KarmaAction | undefined {
  return KARMA_ACTIONS.find(a => a.id === id);
}

export const TITLE_CATEGORIES: { id: TitleCategory; name: string; icon: string; color: string }[] = [
  { id: 'combat', name: 'Bojowe', icon: 'mdi-sword', color: '#F44336' },
  { id: 'trade', name: 'Handlowe', icon: 'mdi-cash', color: '#FFD700' },
  { id: 'exploration', name: 'Eksploracja', icon: 'mdi-compass', color: '#2196F3' },
  { id: 'crafting', name: 'Rzemiosło', icon: 'mdi-hammer', color: '#795548' },
  { id: 'social', name: 'Społeczne', icon: 'mdi-account-group', color: '#E91E63' },
  { id: 'magic', name: 'Magiczne', icon: 'mdi-wizard-hat', color: '#9C27B0' },
  { id: 'nature', name: 'Natura', icon: 'mdi-leaf', color: '#4CAF50' },
  { id: 'special', name: 'Specjalne', icon: 'mdi-star', color: '#FF9800' },
];
