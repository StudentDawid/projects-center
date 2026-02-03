/**
 * Synergies Data - Cross-Path Dependencies and Bonuses
 * Defines all synergies between 18 paths in Ateria Idle
 */

export type PathId = 
  | 'warrior' | 'merchant' | 'scientist' | 'gathering' | 'crafting'
  | 'diplomat' | 'druid' | 'mystic' | 'chef' | 'fisherman'
  | 'wizard' | 'explorer' | 'bard' | 'alchemist' | 'architect'
  | 'spy' | 'tamer' | 'priest';

export type BonusType = 
  | 'attack' | 'defense' | 'hp' | 'hp_regen' | 'crit_chance' | 'crit_damage'
  | 'damage_reduction' | 'accuracy' | 'evasion' | 'speed'
  | 'gold_gain' | 'xp_gain' | 'drop_rate' | 'resource_gain'
  | 'crafting_speed' | 'crafting_quality' | 'research_speed'
  | 'gathering_speed' | 'gathering_yield' | 'fishing_speed' | 'fishing_luck'
  | 'cooking_speed' | 'cooking_quality' | 'reputation_gain' | 'haggling'
  | 'spell_power' | 'mana_regen' | 'exploration_speed' | 'discovery_chance'
  | 'performance_quality' | 'fame_gain' | 'brewing_speed' | 'potion_potency'
  | 'building_speed' | 'population_bonus' | 'mission_success' | 'intel_gain'
  | 'taming_chance' | 'companion_power' | 'faith_gain' | 'blessing_duration'
  | 'meditation_speed' | 'vision_clarity' | 'totem_power' | 'harvest_yield';

export type SynergyTier = 'minor' | 'moderate' | 'major' | 'legendary';

export interface SynergyBonus {
  type: BonusType;
  value: number; // Base value per level
  maxValue: number; // Cap
  description: string;
}

export interface PathSynergy {
  id: string;
  fromPath: PathId;
  toPath: PathId;
  name: string;
  description: string;
  tier: SynergyTier;
  icon: string;
  unlockLevel: number; // Level in fromPath required
  bonuses: SynergyBonus[];
  specialEffect?: {
    name: string;
    description: string;
    trigger: string;
  };
}

export interface PathInfo {
  id: PathId;
  name: string;
  icon: string;
  color: string;
  description: string;
}

// Path Information
export const PATH_INFO: Record<PathId, PathInfo> = {
  warrior: { id: 'warrior', name: 'Wojownik', icon: 'mdi-sword', color: '#F44336', description: 'Walka i podbój' },
  merchant: { id: 'merchant', name: 'Kupiec', icon: 'mdi-store', color: '#FFC107', description: 'Handel i bogactwo' },
  scientist: { id: 'scientist', name: 'Naukowiec', icon: 'mdi-flask', color: '#2196F3', description: 'Badania i odkrycia' },
  gathering: { id: 'gathering', name: 'Zbieracz', icon: 'mdi-pickaxe', color: '#795548', description: 'Zbieranie surowców' },
  crafting: { id: 'crafting', name: 'Rzemieślnik', icon: 'mdi-hammer', color: '#607D8B', description: 'Tworzenie przedmiotów' },
  diplomat: { id: 'diplomat', name: 'Dyplomata', icon: 'mdi-account-tie', color: '#9C27B0', description: 'Polityka i wpływy' },
  druid: { id: 'druid', name: 'Druid', icon: 'mdi-leaf', color: '#4CAF50', description: 'Natura i rolnictwo' },
  mystic: { id: 'mystic', name: 'Mistyk', icon: 'mdi-crystal-ball', color: '#673AB7', description: 'Wizje i przepowiednie' },
  chef: { id: 'chef', name: 'Kucharz', icon: 'mdi-chef-hat', color: '#FF5722', description: 'Gotowanie i posiłki' },
  fisherman: { id: 'fisherman', name: 'Wędkarz', icon: 'mdi-fish', color: '#00BCD4', description: 'Łowienie ryb' },
  wizard: { id: 'wizard', name: 'Czarodziej', icon: 'mdi-wizard-hat', color: '#3F51B5', description: 'Magia żywiołów' },
  explorer: { id: 'explorer', name: 'Odkrywca', icon: 'mdi-compass', color: '#8BC34A', description: 'Eksploracja świata' },
  bard: { id: 'bard', name: 'Bard', icon: 'mdi-music', color: '#E91E63', description: 'Muzyka i występy' },
  alchemist: { id: 'alchemist', name: 'Alchemik', icon: 'mdi-bottle-tonic', color: '#00BFA5', description: 'Mikstury i eliksiry' },
  architect: { id: 'architect', name: 'Architekt', icon: 'mdi-domain', color: '#455A64', description: 'Budowa i konstrukcje' },
  spy: { id: 'spy', name: 'Szpieg', icon: 'mdi-incognito', color: '#212121', description: 'Wywiad i infiltracja' },
  tamer: { id: 'tamer', name: 'Zaklinacz', icon: 'mdi-paw', color: '#FF9800', description: 'Oswajanie bestii' },
  priest: { id: 'priest', name: 'Kapłan', icon: 'mdi-church', color: '#FFEB3B', description: 'Wiara i błogosławieństwa' },
};

export const SYNERGY_TIER_DATA: Record<SynergyTier, { name: string; color: string; multiplier: number }> = {
  minor: { name: 'Drobna', color: '#9E9E9E', multiplier: 1 },
  moderate: { name: 'Umiarkowana', color: '#4CAF50', multiplier: 1.5 },
  major: { name: 'Znacząca', color: '#2196F3', multiplier: 2 },
  legendary: { name: 'Legendarna', color: '#FF9800', multiplier: 3 },
};

// ============================================
// ALL PATH SYNERGIES (153 possible combinations)
// ============================================

export const PATH_SYNERGIES: PathSynergy[] = [
  // ============================================
  // ⚔️ WARRIOR receives from others
  // ============================================
  {
    id: 'chef_warrior',
    fromPath: 'chef', toPath: 'warrior',
    name: 'Siła z Pożywienia',
    description: 'Smaczne posiłki wzmacniają wojownika.',
    tier: 'major', icon: 'mdi-food-steak', unlockLevel: 5,
    bonuses: [
      { type: 'hp', value: 2, maxValue: 100, description: '+2 HP za poziom kucharza' },
      { type: 'hp_regen', value: 0.5, maxValue: 25, description: '+0.5% regeneracji HP' },
      { type: 'attack', value: 0.5, maxValue: 25, description: '+0.5% ataku' },
    ],
    specialEffect: { name: 'Uczta Wojownika', description: 'Jedzenie daje podwójne buffy', trigger: 'Po zjedzeniu posiłku' },
  },
  {
    id: 'alchemist_warrior',
    fromPath: 'alchemist', toPath: 'warrior',
    name: 'Bojowe Eliksiry',
    description: 'Mikstury alchemika wzmacniają walkę.',
    tier: 'major', icon: 'mdi-bottle-tonic-plus', unlockLevel: 5,
    bonuses: [
      { type: 'attack', value: 1, maxValue: 50, description: '+1% ataku za poziom alchemika' },
      { type: 'defense', value: 0.5, maxValue: 25, description: '+0.5% obrony' },
      { type: 'damage_reduction', value: 0.3, maxValue: 15, description: '+0.3% redukcji obrażeń' },
    ],
    specialEffect: { name: 'Wzmocniona Mikstura', description: '+50% mocy mikstur bojowych', trigger: 'Użycie mikstury' },
  },
  {
    id: 'priest_warrior',
    fromPath: 'priest', toPath: 'warrior',
    name: 'Błogosławieństwo Wojny',
    description: 'Kapłan błogosławi wojownika do walki.',
    tier: 'major', icon: 'mdi-shield-cross', unlockLevel: 10,
    bonuses: [
      { type: 'hp', value: 3, maxValue: 150, description: '+3 HP za poziom kapłana' },
      { type: 'damage_reduction', value: 0.5, maxValue: 25, description: '+0.5% redukcji obrażeń' },
      { type: 'hp_regen', value: 1, maxValue: 50, description: '+1% regeneracji HP' },
    ],
    specialEffect: { name: 'Boska Ochrona', description: 'Raz na walkę: Unikaj śmierci', trigger: 'Przy 0 HP' },
  },
  {
    id: 'tamer_warrior',
    fromPath: 'tamer', toPath: 'warrior',
    name: 'Towarzysz Bojowy',
    description: 'Oswojone stworzenia walczą u boku wojownika.',
    tier: 'major', icon: 'mdi-paw', unlockLevel: 5,
    bonuses: [
      { type: 'attack', value: 1.5, maxValue: 75, description: '+1.5% ataku za poziom zaklinacza' },
      { type: 'defense', value: 0.5, maxValue: 25, description: '+0.5% obrony' },
    ],
    specialEffect: { name: 'Atak Skoordynowany', description: 'Companion zadaje dodatkowe obrażenia', trigger: 'Co 10 ataków' },
  },
  {
    id: 'bard_warrior',
    fromPath: 'bard', toPath: 'warrior',
    name: 'Pieśń Bojowa',
    description: 'Pieśni barda dodają otuchy w walce.',
    tier: 'moderate', icon: 'mdi-music', unlockLevel: 5,
    bonuses: [
      { type: 'attack', value: 0.75, maxValue: 37, description: '+0.75% ataku za poziom barda' },
      { type: 'crit_chance', value: 0.2, maxValue: 10, description: '+0.2% szansy na krytyk' },
      { type: 'speed', value: 0.5, maxValue: 25, description: '+0.5% szybkości ataku' },
    ],
  },
  {
    id: 'wizard_warrior',
    fromPath: 'wizard', toPath: 'warrior',
    name: 'Magiczne Wzmocnienie',
    description: 'Zaklęcia czarodzieja wzmacniają broń.',
    tier: 'moderate', icon: 'mdi-sword-cross', unlockLevel: 10,
    bonuses: [
      { type: 'attack', value: 1, maxValue: 50, description: '+1% ataku za poziom czarodzieja' },
      { type: 'accuracy', value: 0.5, maxValue: 25, description: '+0.5% celności' },
    ],
    specialEffect: { name: 'Ogniste Ostrze', description: 'Ataki zadają dodatkowe obrażenia magiczne', trigger: 'Każdy atak' },
  },
  {
    id: 'mystic_warrior',
    fromPath: 'mystic', toPath: 'warrior',
    name: 'Wizja Słabości',
    description: 'Mistyk ujawnia słabości wrogów.',
    tier: 'moderate', icon: 'mdi-eye', unlockLevel: 10,
    bonuses: [
      { type: 'crit_chance', value: 0.5, maxValue: 25, description: '+0.5% szansy na krytyk' },
      { type: 'crit_damage', value: 1, maxValue: 50, description: '+1% obrażeń krytycznych' },
    ],
    specialEffect: { name: 'Punkt Słaby', description: 'Ujawnienie słabości bossa: +25% obrażeń', trigger: 'Walka z bossem' },
  },
  {
    id: 'druid_warrior',
    fromPath: 'druid', toPath: 'warrior',
    name: 'Moc Natury',
    description: 'Totemy druida wzmacniają wojownika.',
    tier: 'moderate', icon: 'mdi-flower', unlockLevel: 5,
    bonuses: [
      { type: 'hp_regen', value: 1, maxValue: 50, description: '+1% regeneracji HP' },
      { type: 'hp', value: 1.5, maxValue: 75, description: '+1.5 HP za poziom druida' },
    ],
    specialEffect: { name: 'Totem Siły', description: 'Aktywny totem: +15% statystyk', trigger: 'Gdy totem aktywny' },
  },
  {
    id: 'crafting_warrior',
    fromPath: 'crafting', toPath: 'warrior',
    name: 'Mistrzowski Ekwipunek',
    description: 'Lepsze rzemiosło to lepszy ekwipunek.',
    tier: 'moderate', icon: 'mdi-hammer', unlockLevel: 5,
    bonuses: [
      { type: 'attack', value: 0.5, maxValue: 25, description: '+0.5% ataku za poziom rzemieślnika' },
      { type: 'defense', value: 0.5, maxValue: 25, description: '+0.5% obrony' },
    ],
  },
  {
    id: 'diplomat_warrior',
    fromPath: 'diplomat', toPath: 'warrior',
    name: 'Sojusze Wojenne',
    description: 'Sojusze dyplomatyczne otwierają nowe fronty.',
    tier: 'minor', icon: 'mdi-handshake', unlockLevel: 10,
    bonuses: [
      { type: 'xp_gain', value: 0.5, maxValue: 25, description: '+0.5% XP za poziom dyplomaty' },
      { type: 'gold_gain', value: 0.5, maxValue: 25, description: '+0.5% złota' },
    ],
  },

  // ============================================
  // 🏪 MERCHANT receives from others
  // ============================================
  {
    id: 'bard_merchant',
    fromPath: 'bard', toPath: 'merchant',
    name: 'Melodia Targów',
    description: 'Muzyka barda przyciąga klientów.',
    tier: 'major', icon: 'mdi-music-note', unlockLevel: 5,
    bonuses: [
      { type: 'gold_gain', value: 1.5, maxValue: 75, description: '+1.5% złota za poziom barda' },
      { type: 'haggling', value: 1, maxValue: 50, description: '+1% skuteczności targowania' },
    ],
    specialEffect: { name: 'Tłum Klientów', description: '+100% szansy na klienta premium', trigger: 'Podczas występu' },
  },
  {
    id: 'diplomat_merchant',
    fromPath: 'diplomat', toPath: 'merchant',
    name: 'Kontrakty Handlowe',
    description: 'Dyplomatyczne kontakty otwierają nowe rynki.',
    tier: 'major', icon: 'mdi-file-sign', unlockLevel: 5,
    bonuses: [
      { type: 'gold_gain', value: 1, maxValue: 50, description: '+1% złota za poziom dyplomaty' },
      { type: 'haggling', value: 0.75, maxValue: 37, description: '+0.75% skuteczności targowania' },
    ],
    specialEffect: { name: 'VIP Klient', description: 'Klienci frakcji kupują za 50% więcej', trigger: 'Klient z frakcji' },
  },
  {
    id: 'spy_merchant',
    fromPath: 'spy', toPath: 'merchant',
    name: 'Wywiad Rynkowy',
    description: 'Szpieg dostarcza informacje o cenach.',
    tier: 'moderate', icon: 'mdi-incognito', unlockLevel: 10,
    bonuses: [
      { type: 'haggling', value: 1.5, maxValue: 75, description: '+1.5% skuteczności targowania' },
      { type: 'gold_gain', value: 0.5, maxValue: 25, description: '+0.5% złota' },
    ],
    specialEffect: { name: 'Inside Trading', description: 'Podgląd cen rynkowych konkurencji', trigger: 'Przy sprzedaży' },
  },
  {
    id: 'explorer_merchant',
    fromPath: 'explorer', toPath: 'merchant',
    name: 'Egzotyczne Towary',
    description: 'Odkrywca przywozi rzadkie przedmioty.',
    tier: 'moderate', icon: 'mdi-compass', unlockLevel: 5,
    bonuses: [
      { type: 'gold_gain', value: 0.75, maxValue: 37, description: '+0.75% złota za poziom odkrywcy' },
      { type: 'drop_rate', value: 0.5, maxValue: 25, description: '+0.5% szansy na rzadki towar' },
    ],
  },
  {
    id: 'architect_merchant',
    fromPath: 'architect', toPath: 'merchant',
    name: 'Rozbudowa Sklepu',
    description: 'Architekt powiększa sklep.',
    tier: 'moderate', icon: 'mdi-store-plus', unlockLevel: 5,
    bonuses: [
      { type: 'gold_gain', value: 0.5, maxValue: 25, description: '+0.5% złota za poziom architekta' },
      { type: 'population_bonus', value: 1, maxValue: 50, description: '+1 max klientów' },
    ],
  },
  {
    id: 'crafting_merchant',
    fromPath: 'crafting', toPath: 'merchant',
    name: 'Towary Rzemieślnicze',
    description: 'Rzemieślnik dostarcza jakościowe produkty.',
    tier: 'minor', icon: 'mdi-hammer', unlockLevel: 5,
    bonuses: [
      { type: 'gold_gain', value: 0.5, maxValue: 25, description: '+0.5% złota za poziom rzemieślnika' },
    ],
  },

  // ============================================
  // 🔬 SCIENTIST receives from others
  // ============================================
  {
    id: 'alchemist_scientist',
    fromPath: 'alchemist', toPath: 'scientist',
    name: 'Alchemiczne Badania',
    description: 'Alchemik przyspiesza eksperymenty.',
    tier: 'major', icon: 'mdi-flask-round-bottom', unlockLevel: 5,
    bonuses: [
      { type: 'research_speed', value: 2, maxValue: 100, description: '+2% szybkości badań za poziom' },
    ],
    specialEffect: { name: 'Przełom Naukowy', description: '+25% szansy na bonus discovery', trigger: 'Zakończenie badań' },
  },
  {
    id: 'wizard_scientist',
    fromPath: 'wizard', toPath: 'scientist',
    name: 'Magiczne Eksperymenty',
    description: 'Czarodziej łączy magię z nauką.',
    tier: 'moderate', icon: 'mdi-wizard-hat', unlockLevel: 10,
    bonuses: [
      { type: 'research_speed', value: 1, maxValue: 50, description: '+1% szybkości badań' },
      { type: 'potion_potency', value: 0.5, maxValue: 25, description: '+0.5% mocy mikstur' },
    ],
  },
  {
    id: 'mystic_scientist',
    fromPath: 'mystic', toPath: 'scientist',
    name: 'Wizje Odkryć',
    description: 'Mistyk widzi przyszłe odkrycia.',
    tier: 'moderate', icon: 'mdi-crystal-ball', unlockLevel: 10,
    bonuses: [
      { type: 'research_speed', value: 1.5, maxValue: 75, description: '+1.5% szybkości badań' },
    ],
    specialEffect: { name: 'Przepowiednia', description: 'Podgląd wyniku badań', trigger: 'Start badań' },
  },

  // ============================================
  // ⛏️ GATHERING receives from others
  // ============================================
  {
    id: 'druid_gathering',
    fromPath: 'druid', toPath: 'gathering',
    name: 'Obfitość Natury',
    description: 'Druid zwiększa plony zbierania.',
    tier: 'major', icon: 'mdi-leaf', unlockLevel: 5,
    bonuses: [
      { type: 'gathering_yield', value: 2, maxValue: 100, description: '+2% plonów za poziom druida' },
      { type: 'resource_gain', value: 1, maxValue: 50, description: '+1% zasobów' },
    ],
    specialEffect: { name: 'Podwójne Zbiory', description: '10% szansy na podwójne surowce', trigger: 'Każde zbieranie' },
  },
  {
    id: 'explorer_gathering',
    fromPath: 'explorer', toPath: 'gathering',
    name: 'Nowe Żyły',
    description: 'Odkrywca znajduje bogate złoża.',
    tier: 'moderate', icon: 'mdi-compass', unlockLevel: 5,
    bonuses: [
      { type: 'gathering_speed', value: 1, maxValue: 50, description: '+1% szybkości zbierania' },
      { type: 'resource_gain', value: 0.75, maxValue: 37, description: '+0.75% zasobów' },
    ],
  },
  {
    id: 'architect_gathering',
    fromPath: 'architect', toPath: 'gathering',
    name: 'Infrastruktura Wydobywcza',
    description: 'Architekt buduje kopalnie i tartaki.',
    tier: 'moderate', icon: 'mdi-domain', unlockLevel: 10,
    bonuses: [
      { type: 'gathering_speed', value: 1.5, maxValue: 75, description: '+1.5% szybkości zbierania' },
    ],
  },
  {
    id: 'crafting_gathering',
    fromPath: 'crafting', toPath: 'gathering',
    name: 'Lepsze Narzędzia',
    description: 'Rzemieślnik tworzy efektywniejsze narzędzia.',
    tier: 'minor', icon: 'mdi-hammer', unlockLevel: 5,
    bonuses: [
      { type: 'gathering_speed', value: 0.5, maxValue: 25, description: '+0.5% szybkości zbierania' },
      { type: 'gathering_yield', value: 0.5, maxValue: 25, description: '+0.5% plonów' },
    ],
  },

  // ============================================
  // 🔨 CRAFTING receives from others
  // ============================================
  {
    id: 'architect_crafting',
    fromPath: 'architect', toPath: 'crafting',
    name: 'Warsztat Mistrzowski',
    description: 'Architekt buduje lepszy warsztat.',
    tier: 'major', icon: 'mdi-domain', unlockLevel: 5,
    bonuses: [
      { type: 'crafting_speed', value: 1.5, maxValue: 75, description: '+1.5% szybkości craftingu' },
      { type: 'crafting_quality', value: 1, maxValue: 50, description: '+1% jakości' },
    ],
  },
  {
    id: 'alchemist_crafting',
    fromPath: 'alchemist', toPath: 'crafting',
    name: 'Wzmocnienia Alchemiczne',
    description: 'Alchemik ulepsza proces tworzenia.',
    tier: 'moderate', icon: 'mdi-bottle-tonic', unlockLevel: 5,
    bonuses: [
      { type: 'crafting_quality', value: 1.5, maxValue: 75, description: '+1.5% jakości za poziom' },
    ],
    specialEffect: { name: 'Alchemiczna Perfekcja', description: '+10% szansy na wyższą jakość', trigger: 'Crafting' },
  },
  {
    id: 'wizard_crafting',
    fromPath: 'wizard', toPath: 'crafting',
    name: 'Enchantmenty',
    description: 'Czarodziej dodaje magiczne właściwości.',
    tier: 'moderate', icon: 'mdi-wizard-hat', unlockLevel: 10,
    bonuses: [
      { type: 'crafting_quality', value: 1, maxValue: 50, description: '+1% jakości' },
    ],
    specialEffect: { name: 'Magiczny Przedmiot', description: 'Szansa na magiczne właściwości', trigger: 'Crafting broni/zbroi' },
  },
  {
    id: 'gathering_crafting',
    fromPath: 'gathering', toPath: 'crafting',
    name: 'Jakościowe Materiały',
    description: 'Zbieracz dostarcza lepsze surowce.',
    tier: 'minor', icon: 'mdi-pickaxe', unlockLevel: 5,
    bonuses: [
      { type: 'crafting_quality', value: 0.5, maxValue: 25, description: '+0.5% jakości' },
      { type: 'resource_gain', value: 0.5, maxValue: 25, description: '+0.5% oszczędności materiałów' },
    ],
  },

  // ============================================
  // 🎭 DIPLOMAT receives from others
  // ============================================
  {
    id: 'bard_diplomat',
    fromPath: 'bard', toPath: 'diplomat',
    name: 'Kulturalna Dyplomacja',
    description: 'Bard ułatwia negocjacje poprzez muzykę.',
    tier: 'major', icon: 'mdi-music', unlockLevel: 5,
    bonuses: [
      { type: 'reputation_gain', value: 2, maxValue: 100, description: '+2% reputacji za poziom barda' },
    ],
    specialEffect: { name: 'Pieśń Pokoju', description: 'Automatyczny sukces pierwszych negocjacji', trigger: 'Nowa frakcja' },
  },
  {
    id: 'spy_diplomat',
    fromPath: 'spy', toPath: 'diplomat',
    name: 'Informacje Frakcyjne',
    description: 'Szpieg dostarcza tajne informacje.',
    tier: 'major', icon: 'mdi-incognito', unlockLevel: 10,
    bonuses: [
      { type: 'reputation_gain', value: 1.5, maxValue: 75, description: '+1.5% reputacji' },
      { type: 'intel_gain', value: 1, maxValue: 50, description: '+1% intelu o frakcjach' },
    ],
    specialEffect: { name: 'Kompromitujące Materiały', description: '+50% reputacji z wrogiej frakcji', trigger: 'Misja szpiegowska' },
  },
  {
    id: 'priest_diplomat',
    fromPath: 'priest', toPath: 'diplomat',
    name: 'Poparcie Religijne',
    description: 'Kapłan daje legitymację religijną.',
    tier: 'moderate', icon: 'mdi-church', unlockLevel: 5,
    bonuses: [
      { type: 'reputation_gain', value: 1, maxValue: 50, description: '+1% reputacji' },
    ],
    specialEffect: { name: 'Błogosławieństwo Świątyni', description: '+25% reputacji z frakcji religijnych', trigger: 'Frakcja religijna' },
  },
  {
    id: 'merchant_diplomat',
    fromPath: 'merchant', toPath: 'diplomat',
    name: 'Łapówki i Prezenty',
    description: 'Kupiec finansuje dyplomację.',
    tier: 'minor', icon: 'mdi-currency-usd', unlockLevel: 5,
    bonuses: [
      { type: 'reputation_gain', value: 0.5, maxValue: 25, description: '+0.5% reputacji' },
      { type: 'gold_gain', value: -0.25, maxValue: -12, description: '-0.25% kosztu dyplomacji' },
    ],
  },

  // ============================================
  // 🌿 DRUID receives from others
  // ============================================
  {
    id: 'priest_druid',
    fromPath: 'priest', toPath: 'druid',
    name: 'Błogosławieństwo Plonów',
    description: 'Kapłan błogosławi uprawy.',
    tier: 'major', icon: 'mdi-cross', unlockLevel: 5,
    bonuses: [
      { type: 'harvest_yield', value: 2, maxValue: 100, description: '+2% plonów za poziom kapłana' },
      { type: 'totem_power', value: 1, maxValue: 50, description: '+1% mocy totemów' },
    ],
  },
  {
    id: 'alchemist_druid',
    fromPath: 'alchemist', toPath: 'druid',
    name: 'Nawozy Alchemiczne',
    description: 'Alchemik tworzy magiczne nawozy.',
    tier: 'moderate', icon: 'mdi-bottle-tonic', unlockLevel: 5,
    bonuses: [
      { type: 'harvest_yield', value: 1.5, maxValue: 75, description: '+1.5% plonów' },
    ],
    specialEffect: { name: 'Turbo Wzrost', description: '50% szybszy wzrost roślin', trigger: 'Użycie nawozu' },
  },
  {
    id: 'mystic_druid',
    fromPath: 'mystic', toPath: 'druid',
    name: 'Przepowiednia Pogody',
    description: 'Mistyk przewiduje pogodę.',
    tier: 'moderate', icon: 'mdi-weather-sunny', unlockLevel: 10,
    bonuses: [
      { type: 'harvest_yield', value: 1, maxValue: 50, description: '+1% plonów' },
    ],
    specialEffect: { name: 'Idealna Pogoda', description: 'Zapobiega złej pogodzie', trigger: 'Zmiana sezonu' },
  },
  {
    id: 'tamer_druid',
    fromPath: 'tamer', toPath: 'druid',
    name: 'Pomoc Zwierząt',
    description: 'Oswojone zwierzęta pomagają w gospodarstwie.',
    tier: 'minor', icon: 'mdi-paw', unlockLevel: 5,
    bonuses: [
      { type: 'harvest_yield', value: 0.75, maxValue: 37, description: '+0.75% plonów' },
    ],
  },

  // ============================================
  // 🔮 MYSTIC receives from others
  // ============================================
  {
    id: 'priest_mystic',
    fromPath: 'priest', toPath: 'mystic',
    name: 'Moc Duchowa',
    description: 'Kapłan wzmacnia duchowe połączenie.',
    tier: 'major', icon: 'mdi-church', unlockLevel: 5,
    bonuses: [
      { type: 'meditation_speed', value: 2, maxValue: 100, description: '+2% szybkości medytacji' },
      { type: 'vision_clarity', value: 1.5, maxValue: 75, description: '+1.5% klarowności wizji' },
    ],
  },
  {
    id: 'wizard_mystic',
    fromPath: 'wizard', toPath: 'mystic',
    name: 'Magiczna Moc',
    description: 'Czarodziej wzmacnia wizje.',
    tier: 'moderate', icon: 'mdi-wizard-hat', unlockLevel: 10,
    bonuses: [
      { type: 'spell_power', value: 1, maxValue: 50, description: '+1% mocy' },
      { type: 'vision_clarity', value: 1, maxValue: 50, description: '+1% klarowności wizji' },
    ],
  },
  {
    id: 'druid_mystic',
    fromPath: 'druid', toPath: 'mystic',
    name: 'Energia Natury',
    description: 'Druid łączy mistyka z naturą.',
    tier: 'moderate', icon: 'mdi-leaf', unlockLevel: 5,
    bonuses: [
      { type: 'meditation_speed', value: 1, maxValue: 50, description: '+1% szybkości medytacji' },
    ],
    specialEffect: { name: 'Wizja Natury', description: 'Wizje o lokacjach zbierania', trigger: 'Medytacja' },
  },

  // ============================================
  // 🍳 CHEF receives from others
  // ============================================
  {
    id: 'fisherman_chef',
    fromPath: 'fisherman', toPath: 'chef',
    name: 'Świeże Ryby',
    description: 'Wędkarz dostarcza najświeższe ryby.',
    tier: 'major', icon: 'mdi-fish', unlockLevel: 5,
    bonuses: [
      { type: 'cooking_quality', value: 2, maxValue: 100, description: '+2% jakości za poziom wędkarza' },
      { type: 'cooking_speed', value: 1, maxValue: 50, description: '+1% szybkości gotowania' },
    ],
    specialEffect: { name: 'Specjał Rybny', description: 'Dania rybne +50% efektów', trigger: 'Gotowanie ryby' },
  },
  {
    id: 'druid_chef',
    fromPath: 'druid', toPath: 'chef',
    name: 'Świeże Składniki',
    description: 'Druid dostarcza ekologiczne składniki.',
    tier: 'major', icon: 'mdi-leaf', unlockLevel: 5,
    bonuses: [
      { type: 'cooking_quality', value: 1.5, maxValue: 75, description: '+1.5% jakości' },
    ],
    specialEffect: { name: 'Organiczne', description: '+25% efektów z dań warzywnych', trigger: 'Gotowanie warzyw' },
  },
  {
    id: 'explorer_chef',
    fromPath: 'explorer', toPath: 'chef',
    name: 'Egzotyczne Przyprawy',
    description: 'Odkrywca przywozi rzadkie przyprawy.',
    tier: 'moderate', icon: 'mdi-compass', unlockLevel: 10,
    bonuses: [
      { type: 'cooking_quality', value: 1, maxValue: 50, description: '+1% jakości' },
    ],
    specialEffect: { name: 'Egzotyka', description: 'Odblokowanie egzotycznych przepisów', trigger: 'Nowe odkrycie' },
  },
  {
    id: 'alchemist_chef',
    fromPath: 'alchemist', toPath: 'chef',
    name: 'Wzmacniacze Smaku',
    description: 'Alchemik tworzy esencje smakowe.',
    tier: 'minor', icon: 'mdi-bottle-tonic', unlockLevel: 5,
    bonuses: [
      { type: 'cooking_quality', value: 0.5, maxValue: 25, description: '+0.5% jakości' },
    ],
  },

  // ============================================
  // 🎣 FISHERMAN receives from others
  // ============================================
  {
    id: 'druid_fisherman',
    fromPath: 'druid', toPath: 'fisherman',
    name: 'Znajomość Wód',
    description: 'Druid zna sekretne łowiska.',
    tier: 'major', icon: 'mdi-leaf', unlockLevel: 5,
    bonuses: [
      { type: 'fishing_luck', value: 2, maxValue: 100, description: '+2% szczęścia za poziom druida' },
      { type: 'fishing_speed', value: 1, maxValue: 50, description: '+1% szybkości' },
    ],
  },
  {
    id: 'mystic_fisherman',
    fromPath: 'mystic', toPath: 'fisherman',
    name: 'Wizja Ryb',
    description: 'Mistyk lokalizuje ryby.',
    tier: 'moderate', icon: 'mdi-crystal-ball', unlockLevel: 10,
    bonuses: [
      { type: 'fishing_luck', value: 1.5, maxValue: 75, description: '+1.5% szczęścia' },
    ],
    specialEffect: { name: 'Wizja Łowiska', description: 'Podgląd ryb w łowisku', trigger: 'Przed łowieniem' },
  },
  {
    id: 'crafting_fisherman',
    fromPath: 'crafting', toPath: 'fisherman',
    name: 'Lepszy Sprzęt',
    description: 'Rzemieślnik tworzy lepsze wędki.',
    tier: 'moderate', icon: 'mdi-hammer', unlockLevel: 5,
    bonuses: [
      { type: 'fishing_speed', value: 1.5, maxValue: 75, description: '+1.5% szybkości' },
    ],
  },
  {
    id: 'explorer_fisherman',
    fromPath: 'explorer', toPath: 'fisherman',
    name: 'Nowe Łowiska',
    description: 'Odkrywca znajduje nowe miejsca.',
    tier: 'minor', icon: 'mdi-compass', unlockLevel: 5,
    bonuses: [
      { type: 'fishing_luck', value: 0.5, maxValue: 25, description: '+0.5% szczęścia' },
    ],
  },

  // ============================================
  // 🧙 WIZARD receives from others
  // ============================================
  {
    id: 'mystic_wizard',
    fromPath: 'mystic', toPath: 'wizard',
    name: 'Duchowa Moc',
    description: 'Mistyk wzmacnia zaklęcia.',
    tier: 'major', icon: 'mdi-crystal-ball', unlockLevel: 5,
    bonuses: [
      { type: 'spell_power', value: 2, maxValue: 100, description: '+2% mocy zaklęć za poziom' },
      { type: 'mana_regen', value: 1, maxValue: 50, description: '+1% regeneracji many' },
    ],
  },
  {
    id: 'scientist_wizard',
    fromPath: 'scientist', toPath: 'wizard',
    name: 'Badania Magiczne',
    description: 'Naukowiec bada naturę magii.',
    tier: 'major', icon: 'mdi-flask', unlockLevel: 10,
    bonuses: [
      { type: 'spell_power', value: 1.5, maxValue: 75, description: '+1.5% mocy zaklęć' },
      { type: 'research_speed', value: 1, maxValue: 50, description: '+1% szybkości badań magicznych' },
    ],
  },
  {
    id: 'priest_wizard',
    fromPath: 'priest', toPath: 'wizard',
    name: 'Boska Magia',
    description: 'Kapłan łączy boską moc z magią.',
    tier: 'moderate', icon: 'mdi-church', unlockLevel: 10,
    bonuses: [
      { type: 'spell_power', value: 1, maxValue: 50, description: '+1% mocy zaklęć' },
    ],
    specialEffect: { name: 'Święte Zaklęcie', description: '+30% mocy zaklęć świetlistych', trigger: 'Zaklęcie światła' },
  },
  {
    id: 'alchemist_wizard',
    fromPath: 'alchemist', toPath: 'wizard',
    name: 'Magiczne Eliksiry',
    description: 'Alchemik tworzy mikstury many.',
    tier: 'minor', icon: 'mdi-bottle-tonic', unlockLevel: 5,
    bonuses: [
      { type: 'mana_regen', value: 1, maxValue: 50, description: '+1% regeneracji many' },
    ],
  },

  // ============================================
  // 🏴‍☠️ EXPLORER receives from others
  // ============================================
  {
    id: 'diplomat_explorer',
    fromPath: 'diplomat', toPath: 'explorer',
    name: 'Przepustki Regionalne',
    description: 'Dyplomata otwiera zamknięte regiony.',
    tier: 'major', icon: 'mdi-passport', unlockLevel: 10,
    bonuses: [
      { type: 'exploration_speed', value: 1.5, maxValue: 75, description: '+1.5% szybkości eksploracji' },
      { type: 'discovery_chance', value: 1, maxValue: 50, description: '+1% szansy na odkrycie' },
    ],
    specialEffect: { name: 'Paszport VIP', description: 'Dostęp do zastrzeżonych regionów', trigger: 'Reputacja sojusznicza' },
  },
  {
    id: 'spy_explorer',
    fromPath: 'spy', toPath: 'explorer',
    name: 'Ukryte Ścieżki',
    description: 'Szpieg zna tajne przejścia.',
    tier: 'major', icon: 'mdi-incognito', unlockLevel: 5,
    bonuses: [
      { type: 'discovery_chance', value: 2, maxValue: 100, description: '+2% szansy na odkrycie' },
    ],
    specialEffect: { name: 'Sekretne Przejście', description: 'Natychmiastowe odkrycie ukrytych lokacji', trigger: 'Nowy region' },
  },
  {
    id: 'architect_explorer',
    fromPath: 'architect', toPath: 'explorer',
    name: 'Mapy i Plany',
    description: 'Architekt tworzy dokładne mapy.',
    tier: 'moderate', icon: 'mdi-map', unlockLevel: 5,
    bonuses: [
      { type: 'exploration_speed', value: 1, maxValue: 50, description: '+1% szybkości eksploracji' },
    ],
  },
  {
    id: 'tamer_explorer',
    fromPath: 'tamer', toPath: 'explorer',
    name: 'Wierzchowiec',
    description: 'Zaklinacz daje wierzchowca do podróży.',
    tier: 'moderate', icon: 'mdi-horse', unlockLevel: 10,
    bonuses: [
      { type: 'exploration_speed', value: 2, maxValue: 100, description: '+2% szybkości eksploracji' },
    ],
    specialEffect: { name: 'Szybki Podróżnik', description: '-50% czasu podróży', trigger: 'Ekspedycja' },
  },

  // ============================================
  // 🎵 BARD receives from others
  // ============================================
  {
    id: 'diplomat_bard',
    fromPath: 'diplomat', toPath: 'bard',
    name: 'Prestiżowe Sceny',
    description: 'Dyplomata załatwia występy w pałacach.',
    tier: 'major', icon: 'mdi-castle', unlockLevel: 10,
    bonuses: [
      { type: 'fame_gain', value: 2, maxValue: 100, description: '+2% sławy za poziom dyplomaty' },
      { type: 'gold_gain', value: 1, maxValue: 50, description: '+1% złota z występów' },
    ],
  },
  {
    id: 'mystic_bard',
    fromPath: 'mystic', toPath: 'bard',
    name: 'Muzyczna Inspiracja',
    description: 'Mistyk inspiruje transcendentną muzykę.',
    tier: 'moderate', icon: 'mdi-crystal-ball', unlockLevel: 5,
    bonuses: [
      { type: 'performance_quality', value: 1.5, maxValue: 75, description: '+1.5% jakości występów' },
    ],
    specialEffect: { name: 'Natchnienie', description: 'Spontaniczna kompozycja', trigger: 'Po medytacji' },
  },
  {
    id: 'crafting_bard',
    fromPath: 'crafting', toPath: 'bard',
    name: 'Mistrzowskie Instrumenty',
    description: 'Rzemieślnik tworzy najlepsze instrumenty.',
    tier: 'moderate', icon: 'mdi-guitar-acoustic', unlockLevel: 5,
    bonuses: [
      { type: 'performance_quality', value: 1, maxValue: 50, description: '+1% jakości występów' },
    ],
  },
  {
    id: 'priest_bard',
    fromPath: 'priest', toPath: 'bard',
    name: 'Pieśni Sakralne',
    description: 'Kapłan uczy pieśni religijnych.',
    tier: 'minor', icon: 'mdi-church', unlockLevel: 5,
    bonuses: [
      { type: 'fame_gain', value: 0.5, maxValue: 25, description: '+0.5% sławy' },
    ],
    specialEffect: { name: 'Hymn', description: 'Występy w świątyniach +100% sławy', trigger: 'Występ w świątyni' },
  },

  // ============================================
  // ⚗️ ALCHEMIST receives from others
  // ============================================
  {
    id: 'scientist_alchemist',
    fromPath: 'scientist', toPath: 'alchemist',
    name: 'Naukowa Alchemia',
    description: 'Naukowiec ulepsza procesy alchemiczne.',
    tier: 'major', icon: 'mdi-flask', unlockLevel: 5,
    bonuses: [
      { type: 'brewing_speed', value: 2, maxValue: 100, description: '+2% szybkości warzenia' },
      { type: 'potion_potency', value: 1, maxValue: 50, description: '+1% mocy mikstur' },
    ],
  },
  {
    id: 'gathering_alchemist',
    fromPath: 'gathering', toPath: 'alchemist',
    name: 'Rzadkie Składniki',
    description: 'Zbieracz dostarcza najlepsze składniki.',
    tier: 'major', icon: 'mdi-pickaxe', unlockLevel: 5,
    bonuses: [
      { type: 'potion_potency', value: 1.5, maxValue: 75, description: '+1.5% mocy mikstur' },
      { type: 'resource_gain', value: 1, maxValue: 50, description: '+1% oszczędności składników' },
    ],
  },
  {
    id: 'wizard_alchemist',
    fromPath: 'wizard', toPath: 'alchemist',
    name: 'Magiczne Wzmocnienia',
    description: 'Czarodziej dodaje magię do mikstur.',
    tier: 'moderate', icon: 'mdi-wizard-hat', unlockLevel: 10,
    bonuses: [
      { type: 'potion_potency', value: 1, maxValue: 50, description: '+1% mocy mikstur' },
    ],
    specialEffect: { name: 'Magiczna Mikstura', description: 'Szansa na dodatkowy efekt', trigger: 'Warzenie' },
  },
  {
    id: 'druid_alchemist',
    fromPath: 'druid', toPath: 'alchemist',
    name: 'Zioła z Ogrodu',
    description: 'Druid uprawia rzadkie zioła.',
    tier: 'minor', icon: 'mdi-leaf', unlockLevel: 5,
    bonuses: [
      { type: 'brewing_speed', value: 0.5, maxValue: 25, description: '+0.5% szybkości warzenia' },
    ],
  },

  // ============================================
  // 🏛️ ARCHITECT receives from others
  // ============================================
  {
    id: 'gathering_architect',
    fromPath: 'gathering', toPath: 'architect',
    name: 'Jakościowe Materiały',
    description: 'Zbieracz dostarcza najlepsze materiały.',
    tier: 'major', icon: 'mdi-pickaxe', unlockLevel: 5,
    bonuses: [
      { type: 'building_speed', value: 2, maxValue: 100, description: '+2% szybkości budowy' },
    ],
  },
  {
    id: 'crafting_architect',
    fromPath: 'crafting', toPath: 'architect',
    name: 'Precyzyjne Elementy',
    description: 'Rzemieślnik tworzy precyzyjne komponenty.',
    tier: 'major', icon: 'mdi-hammer', unlockLevel: 5,
    bonuses: [
      { type: 'building_speed', value: 1.5, maxValue: 75, description: '+1.5% szybkości budowy' },
    ],
  },
  {
    id: 'diplomat_architect',
    fromPath: 'diplomat', toPath: 'architect',
    name: 'Pozwolenia Budowlane',
    description: 'Dyplomata załatwia pozwolenia.',
    tier: 'moderate', icon: 'mdi-file-document', unlockLevel: 10,
    bonuses: [
      { type: 'building_speed', value: 1, maxValue: 50, description: '+1% szybkości budowy' },
      { type: 'population_bonus', value: 0.5, maxValue: 25, description: '+0.5 populacji' },
    ],
  },
  {
    id: 'wizard_architect',
    fromPath: 'wizard', toPath: 'architect',
    name: 'Magiczna Architektura',
    description: 'Czarodziej dodaje magiczne wzmocnienia.',
    tier: 'minor', icon: 'mdi-wizard-hat', unlockLevel: 10,
    bonuses: [
      { type: 'building_speed', value: 0.5, maxValue: 25, description: '+0.5% szybkości budowy' },
    ],
    specialEffect: { name: 'Magiczny Budynek', description: 'Szansa na bonusowy efekt budynku', trigger: 'Budowa' },
  },

  // ============================================
  // 👤 SPY receives from others
  // ============================================
  {
    id: 'diplomat_spy',
    fromPath: 'diplomat', toPath: 'spy',
    name: 'Dyplomatyczna Przykrywka',
    description: 'Dyplomata zapewnia oficjalną przykrywkę.',
    tier: 'major', icon: 'mdi-passport', unlockLevel: 10,
    bonuses: [
      { type: 'mission_success', value: 2, maxValue: 100, description: '+2% sukcesu misji' },
      { type: 'intel_gain', value: 1, maxValue: 50, description: '+1% intelu' },
    ],
  },
  {
    id: 'bard_spy',
    fromPath: 'bard', toPath: 'spy',
    name: 'Rozproszenie Uwagi',
    description: 'Bard odwraca uwagę od szpiega.',
    tier: 'moderate', icon: 'mdi-music', unlockLevel: 5,
    bonuses: [
      { type: 'mission_success', value: 1.5, maxValue: 75, description: '+1.5% sukcesu misji' },
    ],
    specialEffect: { name: 'Przedstawienie', description: 'Ucieczka podczas występu', trigger: 'Wykrycie' },
  },
  {
    id: 'explorer_spy',
    fromPath: 'explorer', toPath: 'spy',
    name: 'Znajomość Terenu',
    description: 'Odkrywca zna ukryte drogi ucieczki.',
    tier: 'moderate', icon: 'mdi-compass', unlockLevel: 5,
    bonuses: [
      { type: 'mission_success', value: 1, maxValue: 50, description: '+1% sukcesu misji' },
    ],
  },
  {
    id: 'merchant_spy',
    fromPath: 'merchant', toPath: 'spy',
    name: 'Sieć Kontaktów',
    description: 'Kupiec ma informatorów wszędzie.',
    tier: 'minor', icon: 'mdi-store', unlockLevel: 5,
    bonuses: [
      { type: 'intel_gain', value: 1, maxValue: 50, description: '+1% intelu' },
    ],
  },

  // ============================================
  // 🐲 TAMER receives from others
  // ============================================
  {
    id: 'druid_tamer',
    fromPath: 'druid', toPath: 'tamer',
    name: 'Więź z Naturą',
    description: 'Druid pomaga w komunikacji ze zwierzętami.',
    tier: 'major', icon: 'mdi-leaf', unlockLevel: 5,
    bonuses: [
      { type: 'taming_chance', value: 2, maxValue: 100, description: '+2% szansy oswojenia' },
      { type: 'companion_power', value: 1, maxValue: 50, description: '+1% mocy towarzysza' },
    ],
  },
  {
    id: 'mystic_tamer',
    fromPath: 'mystic', toPath: 'tamer',
    name: 'Telepatia ze Zwierzętami',
    description: 'Mistyk nawiązuje mentalny kontakt.',
    tier: 'major', icon: 'mdi-crystal-ball', unlockLevel: 10,
    bonuses: [
      { type: 'taming_chance', value: 1.5, maxValue: 75, description: '+1.5% szansy oswojenia' },
    ],
    specialEffect: { name: 'Telepatia', description: 'Poznanie potrzeb stworzenia', trigger: 'Przed oswajaniem' },
  },
  {
    id: 'chef_tamer',
    fromPath: 'chef', toPath: 'tamer',
    name: 'Przysmaki dla Bestii',
    description: 'Kucharz przygotowuje jedzenie dla stworzeń.',
    tier: 'moderate', icon: 'mdi-food', unlockLevel: 5,
    bonuses: [
      { type: 'taming_chance', value: 1, maxValue: 50, description: '+1% szansy oswojenia' },
      { type: 'companion_power', value: 0.5, maxValue: 25, description: '+0.5% mocy towarzysza' },
    ],
  },
  {
    id: 'warrior_tamer',
    fromPath: 'warrior', toPath: 'tamer',
    name: 'Dominacja',
    description: 'Wojownik imponuje stworzeniom siłą.',
    tier: 'minor', icon: 'mdi-sword', unlockLevel: 10,
    bonuses: [
      { type: 'taming_chance', value: 0.5, maxValue: 25, description: '+0.5% szansy oswojenia' },
    ],
  },

  // ============================================
  // ⛪ PRIEST receives from others
  // ============================================
  {
    id: 'mystic_priest',
    fromPath: 'mystic', toPath: 'priest',
    name: 'Duchowe Oświecenie',
    description: 'Mistyk wzmacnia połączenie z bóstwami.',
    tier: 'major', icon: 'mdi-crystal-ball', unlockLevel: 5,
    bonuses: [
      { type: 'faith_gain', value: 2, maxValue: 100, description: '+2% wiary za poziom mistyka' },
      { type: 'blessing_duration', value: 1, maxValue: 50, description: '+1% czasu błogosławieństw' },
    ],
  },
  {
    id: 'diplomat_priest',
    fromPath: 'diplomat', toPath: 'priest',
    name: 'Wpływy w Świątyniach',
    description: 'Dyplomata buduje pozycję w hierarchii.',
    tier: 'moderate', icon: 'mdi-account-tie', unlockLevel: 10,
    bonuses: [
      { type: 'faith_gain', value: 1, maxValue: 50, description: '+1% wiary' },
    ],
    specialEffect: { name: 'Promocja', description: 'Szybszy awans w hierarchii', trigger: 'Reputacja z frakcją' },
  },
  {
    id: 'architect_priest',
    fromPath: 'architect', toPath: 'priest',
    name: 'Budowa Świątyń',
    description: 'Architekt buduje piękne świątynie.',
    tier: 'moderate', icon: 'mdi-domain', unlockLevel: 5,
    bonuses: [
      { type: 'faith_gain', value: 1.5, maxValue: 75, description: '+1.5% wiary' },
    ],
  },
  {
    id: 'bard_priest',
    fromPath: 'bard', toPath: 'priest',
    name: 'Hymny i Pieśni',
    description: 'Bard komponuje sakralną muzykę.',
    tier: 'minor', icon: 'mdi-music', unlockLevel: 5,
    bonuses: [
      { type: 'faith_gain', value: 0.5, maxValue: 25, description: '+0.5% wiary' },
    ],
  },

  // ============================================
  // UNIVERSAL SYNERGIES (affect multiple paths)
  // ============================================
  {
    id: 'explorer_all_resources',
    fromPath: 'explorer', toPath: 'gathering',
    name: 'Nowe Ziemie',
    description: 'Odkrywca otwiera nowe tereny zbierania.',
    tier: 'moderate', icon: 'mdi-map-marker-plus', unlockLevel: 15,
    bonuses: [
      { type: 'resource_gain', value: 1, maxValue: 50, description: '+1% wszystkich zasobów' },
    ],
  },
  {
    id: 'merchant_all_gold',
    fromPath: 'merchant', toPath: 'warrior',
    name: 'Sieć Handlowa',
    description: 'Kupiec zwiększa zyski z każdej aktywności.',
    tier: 'minor', icon: 'mdi-currency-usd', unlockLevel: 10,
    bonuses: [
      { type: 'gold_gain', value: 0.5, maxValue: 25, description: '+0.5% złota' },
    ],
  },
  {
    id: 'scientist_all_xp',
    fromPath: 'scientist', toPath: 'warrior',
    name: 'Optymalizacja Uczenia',
    description: 'Naukowiec opracowuje metody nauki.',
    tier: 'minor', icon: 'mdi-school', unlockLevel: 10,
    bonuses: [
      { type: 'xp_gain', value: 0.5, maxValue: 25, description: '+0.5% XP' },
    ],
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getSynergiesFromPath(pathId: PathId): PathSynergy[] {
  return PATH_SYNERGIES.filter(s => s.fromPath === pathId);
}

export function getSynergiesToPath(pathId: PathId): PathSynergy[] {
  return PATH_SYNERGIES.filter(s => s.toPath === pathId);
}

export function getSynergy(fromPath: PathId, toPath: PathId): PathSynergy | undefined {
  return PATH_SYNERGIES.find(s => s.fromPath === fromPath && s.toPath === toPath);
}

export function getAllPaths(): PathId[] {
  return Object.keys(PATH_INFO) as PathId[];
}

export function getPathInfo(pathId: PathId): PathInfo {
  return PATH_INFO[pathId];
}

export function getSynergyTierData(tier: SynergyTier) {
  return SYNERGY_TIER_DATA[tier];
}

export function countSynergiesPerPath(): Record<PathId, { from: number; to: number }> {
  const counts: Record<PathId, { from: number; to: number }> = {} as any;
  
  for (const pathId of getAllPaths()) {
    counts[pathId] = {
      from: getSynergiesFromPath(pathId).length,
      to: getSynergiesToPath(pathId).length,
    };
  }
  
  return counts;
}
