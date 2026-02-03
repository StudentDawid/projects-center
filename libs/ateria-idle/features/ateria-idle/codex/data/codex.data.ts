/**
 * Codex/Lore Data - Encyclopedia of Ateria
 * Categories: Bestiary, Herbarium, Atlas, Chronicles, Biographies, Artifacts
 */

export type CodexCategory = 'bestiary' | 'herbarium' | 'atlas' | 'chronicles' | 'biographies' | 'artifacts';
export type EntryRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface CodexEntry {
  id: string;
  category: CodexCategory;
  name: string;
  description: string;
  lore: string;
  icon: string;
  rarity: EntryRarity;
  discoveryHint?: string;
  unlockCondition?: {
    type: 'kill' | 'gather' | 'visit' | 'quest' | 'level' | 'craft' | 'special';
    target?: string;
    amount?: number;
  };
  relatedEntries?: string[];
  stats?: Record<string, string | number>;
  image?: string;
}

export interface CodexCategoryInfo {
  id: CodexCategory;
  name: string;
  icon: string;
  color: string;
  description: string;
}

// ============================================
// CATEGORY INFO
// ============================================

export const CODEX_CATEGORIES: Record<CodexCategory, CodexCategoryInfo> = {
  bestiary: {
    id: 'bestiary',
    name: 'Bestiariusz',
    icon: 'mdi-paw',
    color: '#F44336',
    description: 'Encyklopedia stworzeń i potworów Aterii',
  },
  herbarium: {
    id: 'herbarium',
    name: 'Herbarium',
    icon: 'mdi-flower',
    color: '#4CAF50',
    description: 'Katalog roślin, ziół i grzybów',
  },
  atlas: {
    id: 'atlas',
    name: 'Atlas',
    icon: 'mdi-map',
    color: '#2196F3',
    description: 'Mapa i opisy lokacji świata',
  },
  chronicles: {
    id: 'chronicles',
    name: 'Kroniki',
    icon: 'mdi-book-open-page-variant',
    color: '#9C27B0',
    description: 'Historia i wydarzenia świata Aterii',
  },
  biographies: {
    id: 'biographies',
    name: 'Biografie',
    icon: 'mdi-account-group',
    color: '#FF9800',
    description: 'Postacie i frakcje świata',
  },
  artifacts: {
    id: 'artifacts',
    name: 'Artefakty',
    icon: 'mdi-diamond-stone',
    color: '#E91E63',
    description: 'Legendarne przedmioty i relikwie',
  },
};

// ============================================
// BESTIARY ENTRIES
// ============================================

const BESTIARY_ENTRIES: CodexEntry[] = [
  // Common creatures
  {
    id: 'goblin', category: 'bestiary', name: 'Goblin', rarity: 'common',
    description: 'Małe, zielonoskóre stworzenia żyjące w grupach.',
    lore: 'Gobliny są jednymi z najliczniejszych stworzeń w Aterii. Choć pojedynczy goblin nie stanowi zagrożenia, ich grupy mogą być niebezpieczne dla nieostrożnych podróżnych.',
    icon: 'mdi-alien', discoveryHint: 'Pokonaj swojego pierwszego goblina',
    unlockCondition: { type: 'kill', target: 'goblin', amount: 1 },
    stats: { hp: 50, attack: 10, defense: 5, xp: 25 },
    relatedEntries: ['goblin_shaman', 'goblin_king'],
  },
  {
    id: 'wolf', category: 'bestiary', name: 'Wilk', rarity: 'common',
    description: 'Szary drapieżnik polujący w watahach.',
    lore: 'Wilki Aterii są większe i inteligentniejsze od swoich odpowiedników z innych światów. Watahy wilków kontrolują rozległe terytoria łowieckie.',
    icon: 'mdi-paw', discoveryHint: 'Spotkaj wilka w Szepczącym Lesie',
    unlockCondition: { type: 'kill', target: 'wolf', amount: 1 },
    stats: { hp: 80, attack: 15, defense: 8, xp: 40 },
    relatedEntries: ['dire_wolf', 'alpha_wolf'],
  },
  {
    id: 'skeleton', category: 'bestiary', name: 'Szkielet', rarity: 'common',
    description: 'Ożywione kości dawno zmarłych wojowników.',
    lore: 'Szkielety powstają, gdy nekromancka magia przenika miejsca wielkich bitew. Są bezrozumne, ale śmiertelnie niebezpieczne.',
    icon: 'mdi-skull', discoveryHint: 'Pokonaj nieumarłego',
    unlockCondition: { type: 'kill', target: 'skeleton', amount: 1 },
    stats: { hp: 40, attack: 12, defense: 3, xp: 30 },
    relatedEntries: ['skeleton_warrior', 'lich'],
  },

  // Uncommon creatures
  {
    id: 'orc', category: 'bestiary', name: 'Ork', rarity: 'uncommon',
    description: 'Brutalni wojownicy z północnych ziem.',
    lore: 'Orkowie to dumni wojownicy, którzy cenią siłę ponad wszystko. Ich społeczeństwo oparte jest na prawie silniejszego.',
    icon: 'mdi-axe', discoveryHint: 'Pokonaj 10 orków',
    unlockCondition: { type: 'kill', target: 'orc', amount: 10 },
    stats: { hp: 150, attack: 25, defense: 15, xp: 80 },
    relatedEntries: ['orc_warchief', 'orc_shaman'],
  },
  {
    id: 'giant_spider', category: 'bestiary', name: 'Gigantyczny Pająk', rarity: 'uncommon',
    description: 'Ogromny pajęczak tkający śmiercionośne sieci.',
    lore: 'Gigantyczne pająki Aterii są produktem magicznej mutacji. Ich jad może sparaliżować dorosłego człowieka w sekundy.',
    icon: 'mdi-spider', discoveryHint: 'Odkryj pająki w jaskiniach',
    unlockCondition: { type: 'kill', target: 'giant_spider', amount: 5 },
    stats: { hp: 100, attack: 20, defense: 10, xp: 60 },
  },
  {
    id: 'troll', category: 'bestiary', name: 'Troll', rarity: 'uncommon',
    description: 'Masywne stworzenie o niesamowitej regeneracji.',
    lore: 'Trolle są niemal nieśmiertelne dzięki swojej zdolności regeneracji. Jedynie ogień może trwale je zranić.',
    icon: 'mdi-emoticon-angry', discoveryHint: 'Pokonaj trolla w górach',
    unlockCondition: { type: 'kill', target: 'troll', amount: 3 },
    stats: { hp: 300, attack: 30, defense: 20, xp: 120, regen: 5 },
  },

  // Rare creatures
  {
    id: 'elemental', category: 'bestiary', name: 'Żywiołak', rarity: 'rare',
    description: 'Ucieleśnienie czystej mocy żywiołu.',
    lore: 'Żywiołaki to istoty stworzone z czystej energii magicznej. Każdy żywiołak jest unikalny, odzwierciedlając naturę swojego żywiołu.',
    icon: 'mdi-fire', discoveryHint: 'Spotkaj żywiołaka w dzikich regionach',
    unlockCondition: { type: 'kill', target: 'elemental', amount: 1 },
    stats: { hp: 200, attack: 40, defense: 25, xp: 200 },
    relatedEntries: ['fire_elemental', 'water_elemental', 'earth_elemental', 'air_elemental'],
  },
  {
    id: 'golem', category: 'bestiary', name: 'Golem', rarity: 'rare',
    description: 'Magiczny konstrukt ożywiony przez czary.',
    lore: 'Golemy to dzieła archaicznej magii, stworzone do ochrony ważnych miejsc. Są niezwykle wytrzymałe i posłuszne swoim twórcom.',
    icon: 'mdi-robot', discoveryHint: 'Odkryj ruiny ze strażnikami',
    unlockCondition: { type: 'kill', target: 'golem', amount: 1 },
    stats: { hp: 500, attack: 35, defense: 50, xp: 300 },
  },
  {
    id: 'vampire', category: 'bestiary', name: 'Wampir', rarity: 'rare',
    description: 'Nieśmiertelna istota żywiąca się krwią.',
    lore: 'Wampiry Aterii to starożytne istoty, które porzuciły człowieczeństwo w zamian za wieczne życie. Są mistrzami manipulacji i magii krwi.',
    icon: 'mdi-bat', discoveryHint: 'Odkryj wampirze legowisko',
    unlockCondition: { type: 'kill', target: 'vampire', amount: 1 },
    stats: { hp: 400, attack: 50, defense: 30, xp: 400, lifesteal: 20 },
  },

  // Epic creatures
  {
    id: 'dragon_wyrmling', category: 'bestiary', name: 'Smocze Pisklę', rarity: 'epic',
    description: 'Młody smok, ale już śmiertelnie niebezpieczny.',
    lore: 'Smocze pisklęta opuszczają gniazda po kilku dekadach. Nawet młode smoki są potężniejsze niż większość śmiertelników.',
    icon: 'mdi-dragon', discoveryHint: 'Odkryj smocze gniazdo',
    unlockCondition: { type: 'visit', target: 'dragon_nest' },
    stats: { hp: 1000, attack: 80, defense: 60, xp: 800 },
    relatedEntries: ['ancient_dragon'],
  },
  {
    id: 'lich', category: 'bestiary', name: 'Lisz', rarity: 'epic',
    description: 'Potężny nekromanta, który przetrwał śmierć.',
    lore: 'Lisze to czarodzieje, którzy przez mroczne rytuały osiągnęli nieśmiertelność. Ich moc rośnie z każdym wiekiem.',
    icon: 'mdi-skull-crossbones', discoveryHint: 'Pokonaj władcę nieumarłych',
    unlockCondition: { type: 'kill', target: 'lich', amount: 1 },
    stats: { hp: 600, attack: 100, defense: 40, xp: 1000 },
  },
  {
    id: 'demon', category: 'bestiary', name: 'Demon', rarity: 'epic',
    description: 'Istota z Otchłani, ucieleśnienie zła.',
    lore: 'Demony to byty z innego wymiaru, przyciągane przez mroczną magię i ludzkie grzechy. Każdy demon jest unikalny w swojej potworności.',
    icon: 'mdi-emoticon-devil', discoveryHint: 'Zamknij portal do Otchłani',
    unlockCondition: { type: 'visit', target: 'demon_gate' },
    stats: { hp: 800, attack: 90, defense: 50, xp: 1200 },
  },

  // Legendary creatures
  {
    id: 'ancient_dragon', category: 'bestiary', name: 'Starożytny Smok', rarity: 'legendary',
    description: 'Najstarsze i najpotężniejsze ze smoków.',
    lore: 'Starożytne smoki pamiętają świt czasów. Ich mądrość jest równa ich mocy, a ich gniew może zniszczyć królestwa.',
    icon: 'mdi-dragon', discoveryHint: 'Pokonaj World Bossa - Starożytnego Smoka',
    unlockCondition: { type: 'kill', target: 'ancient_dragon', amount: 1 },
    stats: { hp: 1000000, attack: 500, defense: 200, xp: 10000 },
  },
  {
    id: 'void_avatar', category: 'bestiary', name: 'Avatar Pustki', rarity: 'legendary',
    description: 'Manifestacja samej Pustki między światami.',
    lore: 'Avatar Pustki to istota poza pojmowaniem śmiertelników. Jego obecność zniekształca rzeczywistość.',
    icon: 'mdi-blur', discoveryHint: 'Pokonaj World Bossa - Avatar Pustki',
    unlockCondition: { type: 'kill', target: 'void_avatar', amount: 1 },
    stats: { hp: 5000000, attack: 800, defense: 400, xp: 50000 },
  },
  {
    id: 'world_serpent', category: 'bestiary', name: 'Wąż Świata', rarity: 'legendary',
    description: 'Kolosalny wąż oplatający fundamenty świata.',
    lore: 'Legendy mówią, że Wąż Świata trzyma Aterię w swoich splotach. Gdyby się przebudził, nastąpiłby koniec wszystkiego.',
    icon: 'mdi-snake', discoveryHint: 'Odkryj wszystkie regiony świata',
    unlockCondition: { type: 'special', target: 'all_regions' },
    stats: { hp: '∞', attack: '???', defense: '???', xp: '???' },
  },
];

// ============================================
// HERBARIUM ENTRIES
// ============================================

const HERBARIUM_ENTRIES: CodexEntry[] = [
  {
    id: 'healing_herb', category: 'herbarium', name: 'Ziele Lecznicze', rarity: 'common',
    description: 'Podstawowe zioło o właściwościach leczniczych.',
    lore: 'Ziele lecznicze rośnie niemal wszędzie w Aterii. Jest podstawą większości mikstur uzdrawiających.',
    icon: 'mdi-leaf', discoveryHint: 'Zbierz swoje pierwsze zioło',
    unlockCondition: { type: 'gather', target: 'healing_herb', amount: 1 },
    stats: { healing: 20, growthTime: '3 dni', biome: 'Równiny, Lasy' },
  },
  {
    id: 'moonflower', category: 'herbarium', name: 'Kwiat Księżyca', rarity: 'rare',
    description: 'Magiczny kwiat kwitnący tylko w pełnię.',
    lore: 'Kwiaty Księżyca są nasycone magią nocy. Alchemicy używają ich do tworzenia mikstur widzenia w ciemności i ochrony przed nieumarłymi.',
    icon: 'mdi-flower', discoveryHint: 'Zbieraj w nocy podczas pełni',
    unlockCondition: { type: 'gather', target: 'moonflower', amount: 5 },
    stats: { magicPower: 50, growthTime: '1 miesiąc', biome: 'Mistyczny Gaj' },
  },
  {
    id: 'dragons_tongue', category: 'herbarium', name: 'Smoczy Język', rarity: 'epic',
    description: 'Roślina rosnąca tylko w pobliżu smoków.',
    lore: 'Smoczy Język absorbuje żar smoczego oddechu. Jest niezastąpiony w tworzeniu mikstur odporności na ogień.',
    icon: 'mdi-fire', discoveryHint: 'Znajdź w Smoczych Górach',
    unlockCondition: { type: 'gather', target: 'dragons_tongue', amount: 1 },
    stats: { fireResist: 100, growthTime: '1 rok', biome: 'Smocze Góry' },
  },
  {
    id: 'void_moss', category: 'herbarium', name: 'Mech Pustki', rarity: 'legendary',
    description: 'Roślina z pogranicza rzeczywistości.',
    lore: 'Mech Pustki nie powinien istnieć. Rośnie tam, gdzie tkanka rzeczywistości jest cienka, absorbując energię z innych wymiarów.',
    icon: 'mdi-blur', discoveryHint: 'Odkryj w Otchłannych Głębinach',
    unlockCondition: { type: 'visit', target: 'void_tear' },
    stats: { voidPower: 200, growthTime: '???', biome: 'Otchłanne Głębiny' },
  },
  {
    id: 'frost_flower', category: 'herbarium', name: 'Mroźny Kwiat', rarity: 'rare',
    description: 'Lodowy kwiat kwitnący w wiecznym mrozie.',
    lore: 'Mroźne Kwiaty rosną tylko tam, gdzie temperatura nigdy nie przekracza zera. Ich płatki są zimne jak lód.',
    icon: 'mdi-snowflake', discoveryHint: 'Znajdź w Mroźnej Tundrze',
    unlockCondition: { type: 'gather', target: 'frost_flower', amount: 3 },
    stats: { iceResist: 75, growthTime: '6 miesięcy', biome: 'Mroźna Tundra' },
  },
];

// ============================================
// ATLAS ENTRIES
// ============================================

const ATLAS_ENTRIES: CodexEntry[] = [
  {
    id: 'lore_verdant_history', category: 'atlas', name: 'Historia Zielonych Równin', rarity: 'common',
    description: 'Dzieje kolebki cywilizacji Aterii.',
    lore: 'Zielone Równiny były pierwszym miejscem, gdzie osiedlili się ludzie po Wielkim Exodusie. Tu powstały pierwsze miasta i rozwinęła się kultura, która zdefiniowała całą Aterię.',
    icon: 'mdi-grass', discoveryHint: 'Odwiedź Wioskę Początkową',
    unlockCondition: { type: 'visit', target: 'starter_village' },
    relatedEntries: ['lore_great_exodus', 'lore_first_kingdom'],
  },
  {
    id: 'lore_whispering_secrets', category: 'atlas', name: 'Sekrety Szepczącego Lasu', rarity: 'uncommon',
    description: 'Tajemnice pradawnego lasu.',
    lore: 'Szepczący Las otrzymał swoją nazwę od dźwięków, które słychać wśród drzew nocą. Mówi się, że to głosy duchów natury, które chronią las przed intruzami.',
    icon: 'mdi-pine-tree', discoveryHint: 'Eksploruj Szepczący Las',
    unlockCondition: { type: 'visit', target: 'ancient_oak' },
  },
  {
    id: 'lore_sun_empire', category: 'atlas', name: 'Imperium Złotego Słońca', rarity: 'rare',
    description: 'Dzieje zaginionej cywilizacji pustyni.',
    lore: 'Imperium Złotego Słońca było najpotężniejszą cywilizacją w historii Aterii. Ich technologia i magia przewyższały wszystko, co znamy dziś. Zginęli w jeden dzień, a ich miasta pochłonął piasek.',
    icon: 'mdi-pyramid', discoveryHint: 'Odkryj Pogrzebaną Świątynię',
    unlockCondition: { type: 'visit', target: 'buried_temple' },
  },
  {
    id: 'lore_dragon_lords', category: 'atlas', name: 'Władcy Smoków', rarity: 'legendary',
    description: 'Historia smoczych królów.',
    lore: 'Przed nadejściem ludzi, smoki władały Aterią. Ich era trwała milenia, a ślady ich cywilizacji wciąż można znaleźć w najgłębszych jaskiniach i na najwyższych szczytach.',
    icon: 'mdi-dragon', discoveryHint: 'Pokonaj Starożytnego Smoka',
    unlockCondition: { type: 'kill', target: 'ancient_dragon', amount: 1 },
  },
];

// ============================================
// CHRONICLES ENTRIES
// ============================================

const CHRONICLES_ENTRIES: CodexEntry[] = [
  {
    id: 'lore_creation', category: 'chronicles', name: 'Stworzenie Świata', rarity: 'uncommon',
    description: 'Legenda o narodzinach Aterii.',
    lore: 'Na początku była tylko Pustka. Z Pustki narodziło się Światło i Cień, które w wiecznym tańcu stworzyły Aterię. Bogowie ukształtowali lądy, a z ich łez powstały morza.',
    icon: 'mdi-earth', discoveryHint: 'Zbadaj najstarsze ruiny',
    unlockCondition: { type: 'visit', target: 'grand_library' },
  },
  {
    id: 'lore_great_exodus', category: 'chronicles', name: 'Wielki Exodus', rarity: 'rare',
    description: 'Opowieść o przybyciu ludzi do Aterii.',
    lore: 'Ludzie przybyli do Aterii przez magiczne portale, uciekając przed zagładą swojego świata. Przynieśli ze sobą wiedzę i magię, ale też sekrety, które lepiej byłoby zapomnieć.',
    icon: 'mdi-door-open', discoveryHint: 'Odkryj starożytne kroniki',
    unlockCondition: { type: 'special', target: 'ancient_texts' },
  },
  {
    id: 'lore_god_war', category: 'chronicles', name: 'Wojna Bogów', rarity: 'epic',
    description: 'Konflikt, który zmienił świat.',
    lore: 'Tysiące lat temu bogowie Aterii stanęli do wojny o władzę nad światem. Ich bitwy ukształtowały góry i morza, a echo ich mocy wciąż rezonuje w miejscach starożytnych.',
    icon: 'mdi-sword-cross', discoveryHint: 'Odwiedź wszystkie świątynie',
    unlockCondition: { type: 'special', target: 'all_shrines' },
  },
  {
    id: 'lore_prophecy', category: 'chronicles', name: 'Wielka Przepowiednia', rarity: 'legendary',
    description: 'Proroctwo o końcu i początku.',
    lore: '"Gdy ostatni smok zaśnie, a Pustka się przebudzi, nadejdzie bohater ze światła i cienia. W jego rękach spoczywa los wszystkich światów."',
    icon: 'mdi-crystal-ball', discoveryHint: 'Osiągnij maksymalny poziom mistyka',
    unlockCondition: { type: 'level', target: 'mystic', amount: 50 },
  },
];

// ============================================
// BIOGRAPHIES ENTRIES
// ============================================

const BIOGRAPHIES_ENTRIES: CodexEntry[] = [
  {
    id: 'npc_village_elder', category: 'biographies', name: 'Starszyzna Wioski', rarity: 'common',
    description: 'Mądrzy przywódcy małych społeczności.',
    lore: 'Starszyzna to strażnicy tradycji i wiedzy pokoleń. W każdej wiosce pełnią rolę sędziów, uzdrowicieli i nauczycieli.',
    icon: 'mdi-account-supervisor', discoveryHint: 'Porozmawiaj ze starszym w wiosce',
    unlockCondition: { type: 'visit', target: 'starter_village' },
  },
  {
    id: 'npc_merchant_guild', category: 'biographies', name: 'Gildia Kupiecka', rarity: 'uncommon',
    description: 'Potężna organizacja handlowa.',
    lore: 'Gildia Kupiecka kontroluje większość handlu w Aterii. Ich karawan y przemierzają każdy region, a ich agenci są wszędzie.',
    icon: 'mdi-cart', discoveryHint: 'Osiągnij poziom 10 kupca',
    unlockCondition: { type: 'level', target: 'merchant', amount: 10 },
  },
  {
    id: 'npc_archmage', category: 'biographies', name: 'Arcymagowie', rarity: 'rare',
    description: 'Najpotężniejsi czarodzieje świata.',
    lore: 'Rada Arcymagów to ciało rządzące światem magii. Każdy z nich władzie mocą zdolną zmienić bieg historii.',
    icon: 'mdi-wizard-hat', discoveryHint: 'Osiągnij poziom 25 czarodzieja',
    unlockCondition: { type: 'level', target: 'wizard', amount: 25 },
  },
  {
    id: 'npc_dragon_king', category: 'biographies', name: 'Król Smoków', rarity: 'legendary',
    description: 'Władca wszystkich smoków.',
    lore: 'Król Smoków jest najstarszym i najpotężniejszym ze swojego gatunku. Mówi się, że jego wiek liczy się w epokachiistniał zanim powstały góry.',
    icon: 'mdi-crown', discoveryHint: 'Pokonaj wszystkich World Bossów smoczych',
    unlockCondition: { type: 'kill', target: 'ancient_dragon', amount: 10 },
  },
];

// ============================================
// ARTIFACTS ENTRIES
// ============================================

const ARTIFACTS_ENTRIES: CodexEntry[] = [
  {
    id: 'artifact_dragon_armor', category: 'artifacts', name: 'Smocza Zbroja', rarity: 'legendary',
    description: 'Zbroja wykuta z łusek Starożytnego Smoka.',
    lore: 'Smocza Zbroja to dzieło krasnoludzkiego mistrzostwa i smoczej magii. Jej noszący staje się niemal odporny na ogień i posiada siłę smoka.',
    icon: 'mdi-shield-crown', discoveryHint: 'Zdobądź jako drop z World Bossa',
    unlockCondition: { type: 'special', target: 'dragon_armor' },
    stats: { defense: 150, fireResist: 50, hp: 500 },
  },
  {
    id: 'artifact_void_fragment', category: 'artifacts', name: 'Fragment Pustki', rarity: 'legendary',
    description: 'Kawałek samej Pustki, zamknięty w krysztale.',
    lore: 'Fragment Pustki to paradoks - kawałek nicości, który istnieje. Jego moc jest niezmierzona, ale i niebezpieczna dla nieświadomych.',
    icon: 'mdi-blur', discoveryHint: 'Pokonaj Avatar Pustki',
    unlockCondition: { type: 'kill', target: 'void_avatar', amount: 1 },
    stats: { allStats: 50, voidDamage: 200 },
  },
  {
    id: 'artifact_world_tree_seed', category: 'artifacts', name: 'Nasienie Drzewa Świata', rarity: 'legendary',
    description: 'Nasienie z mitycznego Drzewa Świata.',
    lore: 'Drzewo Świata jest fundamentem całej Aterii. Jego nasienie zawiera esencję samego życia - zdolne jest wskrzesić umarłych i uzdrowić rany świata.',
    icon: 'mdi-seed', discoveryHint: 'Odkryj Drzewo Świata w Mistycznym Gaju',
    unlockCondition: { type: 'visit', target: 'spirit_tree' },
    stats: { hp: 1000, hpRegen: 100, resurrection: 1 },
  },
  {
    id: 'artifact_crown_of_ages', category: 'artifacts', name: 'Korona Wieków', rarity: 'legendary',
    description: 'Korona noszona przez pierwszych królów Aterii.',
    lore: 'Korona Wieków została wykuta przez bogów jako dar dla śmiertelników. Każdy jej noszący zyskiwał mądrość wszystkich poprzednich władców.',
    icon: 'mdi-crown', discoveryHint: 'Ukończ wszystkie questy główne',
    unlockCondition: { type: 'quest', target: 'main_story_complete' },
    stats: { wisdom: 100, allXp: 50, charisma: 50 },
  },
];

// ============================================
// COMBINED ENTRIES
// ============================================

export const CODEX_ENTRIES: CodexEntry[] = [
  ...BESTIARY_ENTRIES,
  ...HERBARIUM_ENTRIES,
  ...ATLAS_ENTRIES,
  ...CHRONICLES_ENTRIES,
  ...BIOGRAPHIES_ENTRIES,
  ...ARTIFACTS_ENTRIES,
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getCodexEntry(id: string): CodexEntry | undefined {
  return CODEX_ENTRIES.find(e => e.id === id);
}

export function getEntriesByCategory(category: CodexCategory): CodexEntry[] {
  return CODEX_ENTRIES.filter(e => e.category === category);
}

export function getEntriesByRarity(rarity: EntryRarity): CodexEntry[] {
  return CODEX_ENTRIES.filter(e => e.rarity === rarity);
}

export function getCategoryInfo(category: CodexCategory): CodexCategoryInfo {
  return CODEX_CATEGORIES[category];
}

export function getAllCategories(): CodexCategory[] {
  return Object.keys(CODEX_CATEGORIES) as CodexCategory[];
}

export const RARITY_DATA: Record<EntryRarity, { name: string; color: string }> = {
  common: { name: 'Pospolity', color: '#9E9E9E' },
  uncommon: { name: 'Niepospolity', color: '#4CAF50' },
  rare: { name: 'Rzadki', color: '#2196F3' },
  epic: { name: 'Epicki', color: '#9C27B0' },
  legendary: { name: 'Legendarny', color: '#FF9800' },
};
