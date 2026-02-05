/**
 * Generator kosmologii świata RPG
 * Generuje bogów, panteony, mity i płaszczyzny istnienia
 */

import type {
  Cosmology,
  God,
  GodRelation,
  GodSymbol,
  Myth,
  Pantheon,
  Plane,
} from '../../types/cosmology.types';
import {
  GodDomain,
  GodPersonality,
  GodPowerLevel,
  GodRelationship,
  PantheonHierarchy,
} from '../../types/cosmology.types';
import {
  generateGodName,
  generateGodTitle,
  generatePantheonName,
} from '../name-generators/fantasy-names';

/**
 * Losuje liczbę całkowitą z zakresu [min, max] (włącznie)
 * Używa Math.random() który jest nadpisywany przez seed w useMapGenerator
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Wszystkie dostępne domeny bogów
 */
const ALL_DOMAINS: GodDomain[] = Object.values(GodDomain) as GodDomain[];

/**
 * Wszystkie dostępne osobowości
 */
const ALL_PERSONALITIES: GodPersonality[] = Object.values(
  GodPersonality
) as GodPersonality[];

// ALL_POWER_LEVELS nie jest używane, usunięte

/**
 * Kolory dla symboli bogów (30 opcji)
 */
const SYMBOL_COLORS = [
  ['#FF0000', '#8B0000'], // Czerwony
  ['#0000FF', '#00008B'], // Niebieski
  ['#008000', '#006400'], // Zielony
  ['#FFD700', '#FFA500'], // Złoty
  ['#800080', '#4B0082'], // Fioletowy
  ['#000000', '#696969'], // Czarny
  ['#FFFFFF', '#F5F5F5'], // Biały
  ['#FF6347', '#DC143C'], // Pomarańczowy/Czerwony
  ['#00CED1', '#008B8B'], // Turkusowy
  ['#FF1493', '#C71585'], // Różowy
  ['#FF4500', '#CD3700'], // Pomarańczowy
  ['#32CD32', '#228B22'], // Limonkowy
  ['#8B008B', '#551A8B'], // Magenta
  ['#FF69B4', '#FF1493'], // Hot Pink
  ['#00FF00', '#00CD00'], // Jasny Zielony
  ['#FFD700', '#FFA500'], // Złoty
  ['#C0C0C0', '#A9A9A9'], // Srebrny
  ['#FF8C00', '#FF7F00'], // Ciemny Pomarańczowy
  ['#4B0082', '#6A0DAD'], // Indigo
  ['#DC143C', '#B22222'], // Karmazynowy
  ['#00CED1', '#48D1CC'], // Medium Turquoise
  ['#FF1493', '#FF69B4'], // Deep Pink
  ['#8B4513', '#A0522D'], // Brązowy
  ['#2E8B57', '#3CB371'], // Sea Green
  ['#FF6347', '#FF4500'], // Tomato
  ['#9370DB', '#8A2BE2'], // Medium Purple
  ['#20B2AA', '#00CED1'], // Light Sea Green
  ['#FF4500', '#FF6347'], // Orange Red
  ['#8B0000', '#A52A2A'], // Dark Red
  ['#191970', '#000080'], // Midnight Blue
];

/**
 * Zwierzęta symboliczne (60 opcji)
 */
const SYMBOL_ANIMALS = [
  'Lew',
  'Orzeł',
  'Wilk',
  'Wąż',
  'Smok',
  'Jastrząb',
  'Niedźwiedź',
  'Jeleń',
  'Koń',
  'Byk',
  'Kruk',
  'Sowa',
  'Tygrys',
  'Pantera',
  'Feniks',
  'Jednorożec',
  'Gryf',
  'Hydra',
  'Basilisk',
  'Kraken',
  'Sokół',
  'Bielik',
  'Orzeł Morski',
  'Szczupak',
  'Rekin',
  'Delfin',
  'Wieloryb',
  'Mors',
  'Foka',
  'Niedźwiedź Polarny',
  'Lis',
  'Borsuk',
  'Ryś',
  'Puma',
  'Jaguar',
  'Gepard',
  'Hiena',
  'Szakal',
  'Sęp',
  'Kondor',
  'Sokół Wędrowny',
  'Jastrząb',
  'Orzeł Złoty',
  'Sowa Śnieżna',
  'Puchacz',
  'Sowa Płomykówka',
  'Kruk',
  'Wrona',
  'Gawron',
  'Kawka',
  'Dzik',
  'Łoś',
  'Renifer',
  'Bizon',
  'Żubr',
  'Antylopa',
  'Gazela',
  'Zebra',
  'Słoń',
  'Nosorożec',
  'Hipopotam',
  'Goryl',
  'Szympans',
  'Orangutan',
];

/**
 * Rośliny symboliczne (45 opcji)
 */
const SYMBOL_PLANTS = [
  'Dąb',
  'Cyprys',
  'Róża',
  'Lilia',
  'Bluszcz',
  'Mirt',
  'Laur',
  'Wawrzyn',
  'Cis',
  'Jemioła',
  'Paproć',
  'Mięta',
  'Szałwia',
  'Rozmaryn',
  'Lawenda',
  'Brzoz',
  'Sosna',
  'Świerk',
  'Modrzew',
  'Jodła',
  'Buk',
  'Grab',
  'Klon',
  'Jesion',
  'Wiąz',
  'Lipa',
  'Kasztan',
  'Orzech',
  'Wiśnia',
  'Jabłoń',
  'Tulipan',
  'Narcyz',
  'Iris',
  'Fiołek',
  'Stokrotka',
  'Mak',
  'Słonecznik',
  'Bambus',
  'Palm',
  'Kaktus',
  'Aloes',
  'Eukaliptus',
  'Cedr',
  'Cynamon',
  'Wanilia',
  'Goździk',
];

/**
 * Elementy symboliczne (48 opcji)
 */
const SYMBOL_ELEMENTS = [
  'Płomień',
  'Woda',
  'Ziemia',
  'Powietrze',
  'Lód',
  'Piorun',
  'Mgła',
  'Światło',
  'Cień',
  'Krew',
  'Kamień',
  'Metal',
  'Las',
  'Góra',
  'Morze',
  'Niebo',
  'Ogień',
  'Burza',
  'Wichura',
  'Tornado',
  'Trzęsienie Ziemi',
  'Lawina',
  'Wulkan',
  'Lawa',
  'Popiół',
  'Dym',
  'Para',
  'Rosa',
  'Szron',
  'Śnieg',
  'Grad',
  'Deszcz',
  'Powódź',
  'Susza',
  'Błyskawica',
  'Grzmot',
  'Tęcza',
  'Gwiazda',
  'Księżyc',
  'Słońce',
  'Kometa',
  'Meteor',
  'Nebula',
  'Galaktyka',
  'Przestrzeń',
  'Czas',
  'Energia',
  'Materia',
];

/**
 * Generuje symbol boga na podstawie domeny
 */
function generateGodSymbol(domain: GodDomain): GodSymbol {
  const colorPair = SYMBOL_COLORS[randomInt(0, SYMBOL_COLORS.length - 1)]!;
  const animal = SYMBOL_ANIMALS[randomInt(0, SYMBOL_ANIMALS.length - 1)]!;
  const plant = SYMBOL_PLANTS[randomInt(0, SYMBOL_PLANTS.length - 1)]!;
  const element = SYMBOL_ELEMENTS[randomInt(0, SYMBOL_ELEMENTS.length - 1)]!;

  // Główny symbol na podstawie domeny (15 opcji dla każdej domeny)
  const primarySymbols: Partial<Record<GodDomain, string[]>> = {
    [GodDomain.War]: [
      'Młot',
      'Miecz',
      'Tarcza',
      'Topór',
      'Włócznia',
      'Sztylet',
      'Łuk',
      'Kusza',
      'Halabarda',
      'Maczuga',
      'Szabla',
      'Rapier',
      'Kopija',
      'Tarcza',
      'Zbroja',
    ],
    [GodDomain.Magic]: [
      'Gwiazda',
      'Księżyc',
      'Kryształ',
      'Runa',
      'Księga',
      'Różdżka',
      'Kadzielnica',
      'Pentagram',
      'Okrąg',
      'Amulet',
      'Talisman',
      'Zwoje',
      'Eliksir',
      'Fiolka',
      'Kula Kryształowa',
    ],
    [GodDomain.Nature]: [
      'Liść',
      'Kłos',
      'Drzewo',
      'Kwiat',
      'Nasiono',
      'Korzeń',
      'Gałąź',
      'Szyszka',
      'Żołądź',
      'Jagoda',
      'Grzyb',
      'Mech',
      'Trawa',
      'Krzew',
      'Liana',
    ],
    [GodDomain.Death]: [
      'Kosa',
      'Czaszka',
      'Kości',
      'Cień',
      'Pustka',
      'Trumna',
      'Grób',
      'Nekropolia',
      'Mumia',
      'Duch',
      'Upior',
      'Zombie',
      'Szkielet',
      'Cmentarz',
      'Krypta',
    ],
    [GodDomain.Life]: [
      'Słońce',
      'Jajko',
      'Płód',
      'Kielich',
      'Źródło',
      'Drzewo Życia',
      'Kwiat',
      'Pąk',
      'Kiełek',
      'Narodziny',
      'Wzrost',
      'Rozkwit',
      'Owoc',
      'Nasiono',
      'Zarodnik',
    ],
    [GodDomain.Light]: [
      'Słońce',
      'Gwiazda',
      'Płomień',
      'Promień',
      'Latarnia',
      'Latarnia Morska',
      'Świeca',
      'Pochodnia',
      'Blask',
      'Aureola',
      'Nimb',
      'Promienistość',
      'Jasność',
      'Świetlistość',
      'Luminancja',
    ],
    [GodDomain.Darkness]: [
      'Księżyc',
      'Cień',
      'Gwiazda',
      'Mgła',
      'Noc',
      'Mrok',
      'Ciemność',
      'Pustka',
      'Nicość',
      'Otchłań',
      'Przepaść',
      'Zaraz',
      'Zmierzch',
      'Świt',
      'Eklipsa',
    ],
    [GodDomain.Knowledge]: [
      'Księga',
      'Pióro',
      'Okulary',
      'Gwiazda',
      'Runa',
      'Zwoje',
      'Biblioteka',
      'Atlas',
      'Mapa',
      'Kompas',
      'Teleskop',
      'Mikroskop',
      'Lupa',
      'Szkło Powiększające',
      'Tablica',
    ],
    [GodDomain.Sea]: [
      'Fala',
      'Kotwica',
      'Muszla',
      'Tryton',
      'Statek',
      'Żagiel',
      'Ster',
      'Sieć',
      'Harpun',
      'Perła',
      'Koral',
      'Meduza',
      'Ośmiornica',
      'Wieloryb',
      'Delfin',
    ],
    [GodDomain.Fire]: [
      'Płomień',
      'Meteor',
      'Wulkan',
      'Żar',
      'Ogień',
      'Pochodnia',
      'Żagiew',
      'Błyskawica',
      'Lawa',
      'Popiół',
      'Dym',
      'Iskra',
      'Żarzewie',
      'Płonący Miecz',
      'Feniks',
    ],
    [GodDomain.Water]: [
      'Fala',
      'Kropla',
      'Źródło',
      'Rzeka',
      'Ocean',
      'Deszcz',
      'Burza',
      'Powódź',
      'Lód',
      'Śnieg',
      'Rosa',
      'Mgła',
      'Para',
      'Wodospad',
      'Strumień',
    ],
    [GodDomain.Earth]: [
      'Kamień',
      'Góra',
      'Ziemia',
      'Skala',
      'Jaskinia',
      'Wulkan',
      'Dolina',
      'Płaskowyż',
      'Kryształ',
      'Metal',
      'Złoto',
      'Srebro',
      'Diament',
      'Rubin',
      'Szmaragd',
    ],
    [GodDomain.Sky]: [
      'Chmura',
      'Wiatr',
      'Burza',
      'Błyskawica',
      'Tęcza',
      'Gwiazda',
      'Księżyc',
      'Słońce',
      'Niebo',
      'Przestrzeń',
      'Kometa',
      'Meteor',
      'Nebula',
      'Galaktyka',
      'Gwiazdozbiór',
    ],
    [GodDomain.Wind]: [
      'Wiatr',
      'Wichura',
      'Tornado',
      'Huragan',
      'Powiew',
      'Podmuch',
      'Wir',
      'Prąd',
      'Cyklon',
      'Burza',
      'Sztorm',
      'Wichura',
      'Wicher',
      'Powietrze',
      'Oddech',
    ],
    [GodDomain.Craft]: [
      'Młot',
      'Kowadło',
      'Kowal',
      'Rzemieślnik',
      'Artysta',
      'Twórca',
      'Budowniczy',
      'Architekt',
      'Rzeźbiarz',
      'Malarz',
      'Garncarz',
      'Tkacz',
      'Krawiec',
      'Złotnik',
      'Płatnerz',
    ],
    [GodDomain.Trade]: [
      'Moneta',
      'Złoto',
      'Handlarz',
      'Kupiec',
      'Targ',
      'Rynek',
      'Wymiana',
      'Bogactwo',
      'Skarb',
      'Fortuna',
      'Dobrobyt',
      'Zysk',
      'Handel',
      'Komercja',
      'Barter',
    ],
    [GodDomain.Travel]: [
      'Droga',
      'Szlak',
      'Podróż',
      'Wędrowiec',
      'Odkrywca',
      'Kompas',
      'Mapa',
      'Przewodnik',
      'Wędrowiec',
      'Podróżnik',
      'Odkrywca',
      'Eksplorator',
      'Wędrowiec',
      'Pielgrzym',
      'Nomada',
    ],
    [GodDomain.Protection]: [
      'Tarcza',
      'Zbroja',
      'Forteca',
      'Mury',
      'Schronienie',
      'Ochrona',
      'Obrona',
      'Straż',
      'Wartownik',
      'Opiekun',
      'Obrońca',
      'Strażnik',
      'Tarcza',
      'Puklerz',
      'Płaszcz',
    ],
    [GodDomain.Destruction]: [
      'Młot',
      'Topór',
      'Miecz',
      'Zniszczenie',
      'Ruina',
      'Katastrofa',
      'Zagłada',
      'Upadek',
      'Koniec',
      'Zniszczenie',
      'Zagłada',
      'Ruina',
      'Katastrofa',
      'Upadek',
      'Koniec',
    ],
    [GodDomain.Healing]: [
      'Kielich',
      'Lek',
      'Zioło',
      'Uzdrowiciel',
      'Lekarz',
      'Uzdrowienie',
      'Leczenie',
      'Uzdrowienie',
      'Lek',
      'Zioło',
      'Uzdrowiciel',
      'Lekarz',
      'Uzdrowienie',
      'Leczenie',
      'Uzdrowienie',
    ],
    [GodDomain.Disease]: [
      'Choroba',
      'Plaga',
      'Zaraza',
      'Epidemia',
      'Trucizna',
      'Zakażenie',
      'Choroba',
      'Plaga',
      'Zaraza',
      'Epidemia',
      'Trucizna',
      'Zakażenie',
      'Choroba',
      'Plaga',
      'Zaraza',
    ],
    [GodDomain.Madness]: [
      'Szaleństwo',
      'Obłęd',
      'Szalony',
      'Szaleństwo',
      'Obłęd',
      'Szalony',
      'Szaleństwo',
      'Obłęd',
      'Szalony',
      'Szaleństwo',
      'Obłęd',
      'Szalony',
      'Szaleństwo',
      'Obłęd',
      'Szalony',
    ],
    [GodDomain.Dreams]: [
      'Sen',
      'Marzenie',
      'Wizja',
      'Koszm',
      'Sen',
      'Marzenie',
      'Wizja',
      'Koszm',
      'Sen',
      'Marzenie',
      'Wizja',
      'Koszm',
      'Sen',
      'Marzenie',
      'Wizja',
    ],
    [GodDomain.Time]: [
      'Zegar',
      'Czas',
      'Godzina',
      'Chwila',
      'Wieczność',
      'Zegar',
      'Czas',
      'Godzina',
      'Chwila',
      'Wieczność',
      'Zegar',
      'Czas',
      'Godzina',
      'Chwila',
      'Wieczność',
    ],
    [GodDomain.Fate]: [
      'Przeznaczenie',
      'Los',
      'Fatum',
      'Przepowiednia',
      'Wróżba',
      'Przeznaczenie',
      'Los',
      'Fatum',
      'Przepowiednia',
      'Wróżba',
      'Przeznaczenie',
      'Los',
      'Fatum',
      'Przepowiednia',
      'Wróżba',
    ],
    [GodDomain.Trickery]: [
      'Maska',
      'Podstęp',
      'Zdrada',
      'Oszustwo',
      'Kłamstwo',
      'Maska',
      'Podstęp',
      'Zdrada',
      'Oszustwo',
      'Kłamstwo',
      'Maska',
      'Podstęp',
      'Zdrada',
      'Oszustwo',
      'Kłamstwo',
    ],
    [GodDomain.Justice]: [
      'Waga',
      'Miecz',
      'Sprawiedliwość',
      'Prawo',
      'Sąd',
      'Waga',
      'Miecz',
      'Sprawiedliwość',
      'Prawo',
      'Sąd',
      'Waga',
      'Miecz',
      'Sprawiedliwość',
      'Prawo',
      'Sąd',
    ],
    [GodDomain.Love]: [
      'Serce',
      'Róża',
      'Miłość',
      'Namiętność',
      'Romans',
      'Serce',
      'Róża',
      'Miłość',
      'Namiętność',
      'Romans',
      'Serce',
      'Róża',
      'Miłość',
      'Namiętność',
      'Romans',
    ],
    [GodDomain.Fertility]: [
      'Ziarno',
      'Nasiono',
      'Płodność',
      'Narodziny',
      'Wzrost',
      'Ziarno',
      'Nasiono',
      'Płodność',
      'Narodziny',
      'Wzrost',
      'Ziarno',
      'Nasiono',
      'Płodność',
      'Narodziny',
      'Wzrost',
    ],
    [GodDomain.Harvest]: [
      'Kłos',
      'Plon',
      'Żniwo',
      'Zbiór',
      'Obfitość',
      'Kłos',
      'Plon',
      'Żniwo',
      'Zbiór',
      'Obfitość',
      'Kłos',
      'Plon',
      'Żniwo',
      'Zbiór',
      'Obfitość',
    ],
  };

  const domainSymbols = primarySymbols[domain] || [
    'Symbol',
    'Znak',
    'Emblemat',
  ];
  const primary = domainSymbols[randomInt(0, domainSymbols.length - 1)]!;

  return {
    primary,
    colors: colorPair,
    animals: [animal],
    plants: [plant],
    elements: [element],
  };
}

/**
 * Generuje opis boga na podstawie domeny i osobowości
 */
function generateGodDescription(
  god: Omit<God, 'description' | 'history' | 'traits' | 'myths'>
): string {
  const domainNames: Record<GodDomain, string> = {
    [GodDomain.War]: 'Wojny',
    [GodDomain.Magic]: 'Magii',
    [GodDomain.Nature]: 'Natury',
    [GodDomain.Death]: 'Śmierci',
    [GodDomain.Life]: 'Życia',
    [GodDomain.Light]: 'Światła',
    [GodDomain.Darkness]: 'Ciemności',
    [GodDomain.Chaos]: 'Chaosu',
    [GodDomain.Order]: 'Porządku',
    [GodDomain.Knowledge]: 'Wiedzy',
    [GodDomain.Wisdom]: 'Mądrości',
    [GodDomain.Trickery]: 'Podstępu',
    [GodDomain.Justice]: 'Sprawiedliwości',
    [GodDomain.Love]: 'Miłości',
    [GodDomain.Fertility]: 'Płodności',
    [GodDomain.Harvest]: 'Plonów',
    [GodDomain.Sea]: 'Morza',
    [GodDomain.Sky]: 'Nieba',
    [GodDomain.Earth]: 'Ziemi',
    [GodDomain.Fire]: 'Ognia',
    [GodDomain.Water]: 'Wody',
    [GodDomain.Wind]: 'Wiatru',
    [GodDomain.Craft]: 'Rzemiosła',
    [GodDomain.Trade]: 'Handlu',
    [GodDomain.Travel]: 'Podróży',
    [GodDomain.Protection]: 'Ochrony',
    [GodDomain.Destruction]: 'Zniszczenia',
    [GodDomain.Healing]: 'Leczenia',
    [GodDomain.Disease]: 'Choroby',
    [GodDomain.Madness]: 'Szaleństwa',
    [GodDomain.Dreams]: 'Snów',
    [GodDomain.Time]: 'Czasu',
    [GodDomain.Fate]: 'Przeznaczenia',
  };

  const personalityNames: Record<GodPersonality, string> = {
    [GodPersonality.Benevolent]: 'dobroczynny',
    [GodPersonality.Malevolent]: 'złośliwy',
    [GodPersonality.Neutral]: 'neutralny',
    [GodPersonality.Chaotic]: 'chaotyczny',
    [GodPersonality.Lawful]: 'praworządny',
    [GodPersonality.Capricious]: 'kapryśny',
    [GodPersonality.Merciful]: 'miłosierny',
    [GodPersonality.Vengeful]: 'mściwy',
    [GodPersonality.Wise]: 'mądry',
    [GodPersonality.Foolish]: 'głupi',
    [GodPersonality.Proud]: 'dumny',
    [GodPersonality.Humble]: 'pokorny',
    [GodPersonality.Wrathful]: 'gniewny',
    [GodPersonality.Peaceful]: 'pokojowy',
    [GodPersonality.Jealous]: 'zazdrosny',
    [GodPersonality.Generous]: 'szczodry',
  };

  const powerNames: Record<GodPowerLevel, string> = {
    [GodPowerLevel.Primordial]: 'pierwotny',
    [GodPowerLevel.Major]: 'główny',
    [GodPowerLevel.Minor]: 'pomniejszy',
    [GodPowerLevel.Demigod]: 'półbóg',
    [GodPowerLevel.Spirit]: 'duch',
  };

  const domainName = god.domains.map((d) => domainNames[d]).join(', ');
  const personalityName = personalityNames[god.personality];
  const powerName = powerNames[god.powerLevel];

  return `${god.name} jest ${powerName} bogiem ${domainName}. Jest znany jako ${personalityName} i ${god.titles.join(', ')}. Jego symbolem jest ${god.symbol.primary}, a jego moc sięga do najgłębszych zakątków rzeczywistości.`;
}

/**
 * Generuje historię boga
 */
function generateGodHistory(god: God, pantheonGods: God[]): string[] {
  const history: string[] = [];

  // Pochodzenie (15 opcji)
  const otherGod =
    pantheonGods.length > 0
      ? pantheonGods[randomInt(0, pantheonGods.length - 1)]!.name
      : 'bogów';
  const origins = [
    `Narodził się z ${otherGod}`,
    `Powstał z ${god.symbol.elements[0]}`,
    `Został stworzony przez siły ${god.domains[0]}`,
    `Wyłonił się z pierwotnej pustki`,
    `Jest dzieckiem ${otherGod}`,
    `Zrodził się z pierwotnego chaosu`,
    `Powstał z połączenia ${god.symbol.elements[0]} i ${god.symbol.elements[0]}`,
    `Został wywołany przez starożytne rytuały`,
    `Narodził się z łez ${otherGod}`,
    `Powstał z krwi ${otherGod}`,
    `Został stworzony przez zjednoczenie wszystkich sił ${god.domains[0]}`,
    `Wyłonił się z głębin zapomnienia`,
    `Jest emanacją pierwotnej woli`,
    `Został powołany do istnienia przez wielką potrzebę`,
    `Narodził się z konfliktu między ${otherGod} a siłami chaosu`,
  ];
  history.push(origins[randomInt(0, origins.length - 1)]!);

  // Ważne wydarzenia (18 opcji)
  const events = [
    `Stworzył ${god.symbol.animals[0]}`,
    `Ustanowił prawo ${god.domains[0]}`,
    `Pokonał wielkiego wroga`,
    `Przywrócił równowagę w świecie`,
    `Nawiedził śmiertelników w wielkiej potrzebie`,
    `Zapoczątkował wielką zmianę`,
    `Zbudował pierwsze miasto`,
    `Nauczył śmiertelników sekretów ${god.domains[0]}`,
    `Przeprowadził wielką migrację ludów`,
    `Ustanowił pierwsze święto`,
    `Stworzył pierwszą magię`,
    `Pokonał potwora z głębin`,
    `Ocalił świat przed zagładą`,
    `Zapoczątkował nową erę`,
    `Zjednoczył rozproszone plemiona`,
    `Odkrył ukrytą wiedzę`,
    `Przywrócił życie umarłym`,
    `Zaprowadził wieczny pokój`,
  ];
  history.push(events[randomInt(0, events.length - 1)]!);

  return history;
}

/**
 * Generuje cechy charakterystyczne boga
 */
function generateGodTraits(god: God): string[] {
  const traits: string[] = [];

  // Cechy na podstawie osobowości (12 opcji dla każdej)
  const personalityTraits: Partial<Record<GodPersonality, string[]>> = {
    [GodPersonality.Benevolent]: [
      'Opiekuńczy',
      'Wspierający',
      'Miłosierny',
      'Dobroczynny',
      'Szczodry',
      'Współczujący',
      'Tolerancyjny',
      'Wyrozumiały',
      'Dobrotliwy',
      'Życzliwy',
      'Przyjazny',
      'Uprzejmy',
    ],
    [GodPersonality.Malevolent]: [
      'Okrutny',
      'Bezwzględny',
      'Mściwy',
      'Złośliwy',
      'Sadyczny',
      'Nienawistny',
      'Zazdrosny',
      'Zachłanny',
      'Destrukcyjny',
      'Złośliwy',
      'Podstępny',
      'Zdradziecki',
    ],
    [GodPersonality.Wise]: [
      'Mądry',
      'Przewidujący',
      'Rozważny',
      'Filozoficzny',
      'Uczony',
      'Inteligentny',
      'Bystry',
      'Przenikliwy',
      'Dobrze poinformowany',
      'Doświadczony',
      'Roztropny',
      'Wnikliwy',
    ],
    [GodPersonality.Wrathful]: [
      'Gniewny',
      'Gwałtowny',
      'Nieprzewidywalny',
      'Niszczycielski',
      'Szałowy',
      'Wściekły',
      'Furiatny',
      'Agresywny',
      'Nietolerancyjny',
      'Nieustępliwy',
      'Zapalczywy',
      'Porywczy',
    ],
    [GodPersonality.Capricious]: [
      'Kapryśny',
      'Zmienny',
      'Nieprzewidywalny',
      'Ekscentryczny',
      'Humorzasty',
      'Niestabilny',
      'Zmienny',
      'Niespójny',
      'Dziwaczny',
      'Ekscentryczny',
      'Niezwykły',
      'Osobliwy',
    ],
  };

  const personalityTraitList = personalityTraits[god.personality] || [
    'Tajemniczy',
  ];
  traits.push(...personalityTraitList.slice(0, 2));

  // Cechy na podstawie domeny (9 opcji dla każdej)
  const domainTraits: Partial<Record<GodDomain, string[]>> = {
    [GodDomain.War]: [
      'Wojowniczy',
      'Odważny',
      'Nieustraszony',
      'Agresywny',
      'Zdeterminowany',
      'Nieugięty',
      'Waleczny',
      'Bojowy',
      'Militarny',
    ],
    [GodDomain.Magic]: [
      'Mistyczny',
      'Tajemniczy',
      'Potężny',
      'Arkanowy',
      'Czarnoksięski',
      'Zaklęty',
      'Magiczny',
      'Nadprzyrodzony',
      'Mistyczny',
    ],
    [GodDomain.Nature]: [
      'Dziki',
      'Naturalny',
      'Organiczny',
      'Pierwotny',
      'Ziemisty',
      'Zielony',
      'Żywiołowy',
      'Dzikuski',
      'Nieokiełznany',
    ],
    [GodDomain.Death]: [
      'Ponury',
      'Nieubłagany',
      'Ostateczny',
      'Mroczny',
      'Pusty',
      'Nieskończony',
      'Końcowy',
      'Śmiertelny',
      'Zagubiony',
    ],
    [GodDomain.Life]: [
      'Żywotny',
      'Twórczy',
      'Ożywczy',
      'Witalny',
      'Energetyczny',
      'Dynamiczny',
      'Rozwijający się',
      'Kwitnący',
      'Rozkwitający',
    ],
  };

  const firstDomain = god.domains[0];
  const domainTraitList = (firstDomain && domainTraits[firstDomain]) || [
    'Potężny',
  ];
  traits.push(...domainTraitList.slice(0, 2));

  return traits;
}

/**
 * Generuje mity związane z bogiem
 */
function generateGodMyths(god: God, pantheonGods: God[]): string[] {
  const myths: string[] = [];

  const otherGodName =
    pantheonGods.length > 0
      ? pantheonGods[randomInt(0, pantheonGods.length - 1)]!.name
      : 'wrogiem';
  const mythTemplates = [
    `Wielka bitwa między ${god.name} a ${otherGodName}`,
    `${god.name} stworzył ${god.symbol.animals[0]}`,
    `Legenda o ${god.name} i ${god.symbol.elements[0]}`,
    `${god.name} pokonał wielkie zło`,
    `Przepowiednia o powrocie ${god.name}`,
    `${god.name} przemienił ${god.symbol.elements[0]} w ${god.symbol.elements[0]}`,
    `Wielka podróż ${god.name} przez wszystkie płaszczyzny`,
    `${god.name} ukrył sekret ${god.domains[0]} przed śmiertelnikami`,
    `Legenda o tym, jak ${god.name} stracił i odzyskał moc`,
    `${god.name} i ${otherGodName} wspólnie stworzyli pierwsze miasto`,
    `Opowieść o wielkiej ofierze ${god.name}`,
    `${god.name} przekazał wiedzę o ${god.domains[0]} pierwszym kapłanom`,
    `Mityczna przyjaźń między ${god.name} a ${otherGodName}`,
    `${god.name} pokonał potwora z głębin`,
    `Legenda o wielkim błogosławieństwie ${god.name}`,
  ];

  // Losowo wybierz 2-4 mity (Fisher-Yates shuffle)
  const shuffledTemplates = [...mythTemplates];
  for (let i = shuffledTemplates.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [shuffledTemplates[i], shuffledTemplates[j]] = [
      shuffledTemplates[j]!,
      shuffledTemplates[i]!,
    ];
  }
  const count = randomInt(2, 4);
  myths.push(...shuffledTemplates.slice(0, count));

  return myths;
}

/**
 * Generuje relacje między bogami
 */
function generateGodRelations(god: God, allGods: God[]): GodRelation[] {
  const relations: GodRelation[] = [];

  // Wybierz losowo 2-4 bogów do relacji
  const filteredGods = allGods.filter((g) => g.id !== god.id);
  // Losowe sortowanie (Fisher-Yates shuffle)
  const shuffledGods = [...filteredGods];
  for (let i = shuffledGods.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [shuffledGods[i], shuffledGods[j]] = [shuffledGods[j]!, shuffledGods[i]!];
  }
  const relatedGods = shuffledGods.slice(0, randomInt(2, 4));

  for (const relatedGod of relatedGods) {
    // Określ typ relacji na podstawie domen
    let relationship: GodRelationship = GodRelationship.Neutral;

    // Przeciwne domeny = wrogość
    const oppositeDomains: [GodDomain, GodDomain][] = [
      [GodDomain.Light, GodDomain.Darkness],
      [GodDomain.Life, GodDomain.Death],
      [GodDomain.Order, GodDomain.Chaos],
      [GodDomain.War, GodDomain.Protection], // Używamy Protection zamiast Peaceful
    ];

    const isOpposite = oppositeDomains.some(
      ([d1, d2]) =>
        (god.domains.includes(d1) && relatedGod.domains.includes(d2)) ||
        (god.domains.includes(d2) && relatedGod.domains.includes(d1))
    );

    if (isOpposite) {
      relationship =
        randomInt(0, 1) === 1 ? GodRelationship.Enemy : GodRelationship.Rival;
    } else if (god.domains.some((d) => relatedGod.domains.includes(d))) {
      // Podobne domeny = sojusz lub rywalizacja
      relationship =
        randomInt(0, 10) > 7 ? GodRelationship.Ally : GodRelationship.Rival;
    } else {
      // Losowa relacja
      const randomRelations = [
        GodRelationship.Ally,
        GodRelationship.Neutral,
        GodRelationship.Rival,
        GodRelationship.Sibling,
      ];
      relationship = randomRelations[randomInt(0, randomRelations.length - 1)]!;
    }

    relations.push({
      godId: relatedGod.id,
      relationship,
      description: `${god.name} i ${relatedGod.name} są ${relationship}`,
    });
  }

  return relations;
}

/**
 * Generuje pojedynczego boga
 */
function generateGod(
  pantheonId: string,
  godIndex: number,
  allGods: God[]
): God {
  const id = `${pantheonId}-god-${godIndex}`;
  const name = generateGodName();

  // Wybierz 1-3 domeny
  const domainCount = randomInt(1, 3);
  const domains = Array.from({ length: domainCount }, () => {
    return ALL_DOMAINS[randomInt(0, ALL_DOMAINS.length - 1)]!;
  }).filter((d, i, arr) => arr.indexOf(d) === i) as GodDomain[]; // Usuń duplikaty

  // Wybierz osobowość
  const personality =
    ALL_PERSONALITIES[randomInt(0, ALL_PERSONALITIES.length - 1)]!;

  // Wybierz poziom mocy (pierwszy bóg = najwyższy)
  const powerLevel =
    godIndex === 0
      ? GodPowerLevel.Primordial
      : godIndex <= 2
        ? GodPowerLevel.Major
        : godIndex <= 5
          ? GodPowerLevel.Minor
          : randomInt(0, 1) === 1
            ? GodPowerLevel.Demigod
            : GodPowerLevel.Spirit;

  // Generuj symbol
  const symbol = generateGodSymbol(domains[0]!);

  // Generuj tytuły (1-3 tytuły)
  const titleCount = randomInt(1, 3);
  const titles = domains.map((d) => generateGodTitle(d)).slice(0, titleCount);

  // Tworzymy boga bez pełnych danych (będą dodane później)
  const godBase = {
    id,
    name,
    titles,
    domains,
    personality,
    powerLevel,
    symbol,
  };

  // Generuj pełne dane (używamy tymczasowego boga)
  const tempGod = {
    ...godBase,
    description: '',
    history: [],
    traits: [],
    myths: [],
    relations: [],
  } as God;
  const description = generateGodDescription(tempGod);
  const history = generateGodHistory(tempGod, allGods);
  const traits = generateGodTraits(tempGod);
  const myths = generateGodMyths(tempGod, allGods);
  const relations = generateGodRelations(tempGod, allGods);

  return {
    ...godBase,
    description,
    history,
    traits,
    myths,
    relations,
  };
}

/**
 * Generuje panteon
 */
function generatePantheon(
  pantheonIndex: number,
  allPantheons: Pantheon[]
): Pantheon {
  const id = `pantheon-${pantheonIndex}`;
  const name = generatePantheonName();
  const description = `${name} to grupa bogów rządzących różnymi aspektami rzeczywistości.`;

  // Generuj 3-12 bogów
  const godCount = randomInt(3, 12);
  const gods: God[] = [];

  // Najpierw generuj wszystkich bogów (bez relacji)
  for (let i = 0; i < godCount; i++) {
    const god = generateGod(id, i, []);
    gods.push(god);
  }

  // Teraz dodaj relacje między bogami w panteonie
  for (const god of gods) {
    god.relations = generateGodRelations(god, gods);
  }

  // Ustaw hierarchię
  const hierarchy = new Map<string, PantheonHierarchy>();
  hierarchy.set(gods[0]!.id, PantheonHierarchy.Supreme); // Pierwszy = najwyższy
  for (let i = 1; i < Math.min(3, gods.length); i++) {
    hierarchy.set(gods[i]!.id, PantheonHierarchy.High);
  }
  for (let i = 3; i < Math.min(6, gods.length); i++) {
    hierarchy.set(gods[i]!.id, PantheonHierarchy.Middle);
  }
  for (let i = 6; i < gods.length; i++) {
    hierarchy.set(gods[i]!.id, PantheonHierarchy.Low);
  }

  const headGodId = gods[0]!.id;

  // Relacje między panteonami
  const pantheonRelations = allPantheons
    .filter((p) => p.id !== id)
    .map((p) => {
      const relationships: Array<'allied' | 'enemy' | 'neutral' | 'rival'> = [
        'allied',
        'enemy',
        'neutral',
        'rival',
      ];
      const relIndex = randomInt(0, relationships.length - 1);
      const relationship = relationships[relIndex]!;
      return {
        pantheonId: p.id,
        relationship: relationship as 'allied' | 'enemy' | 'neutral' | 'rival',
        description: `${name} i ${p.name} są ${relationship}`,
      };
    });

  // Filozofia panteonu (18 opcji)
  const philosophies = [
    'Wiara w równowagę sił',
    'Poddanie się woli bogów',
    'Walka o dominację',
    'Harmonia z naturą',
    'Dążenie do doskonałości',
    'Akceptacja chaosu',
    'Wiara w przeznaczenie',
    'Czczenie przodków',
    'Szacunek dla życia',
    'Poddanie się losowi',
    'Walka z przeznaczeniem',
    'Poszukiwanie prawdy',
    'Ochrona słabych',
    'Ekspansja i podbój',
    'Izolacja i samowystarczalność',
    'Współpraca i jedność',
    'Indywidualizm i wolność',
    'Hierarchia i porządek',
  ];
  const philosophy = philosophies[randomInt(0, philosophies.length - 1)]!;

  // Wierzenia (15 opcji)
  const beliefs = [
    'Bogowie są wszechmocni',
    'Śmiertelnicy muszą służyć bogom',
    'Każdy bóg ma swoje miejsce',
    'Wielka wojna bogów zmieniła świat',
    'Bogowie są nieśmiertelni',
    'Bogowie mogą być pokonani',
    'Śmiertelnicy mogą stać się bogami',
    'Bogowie potrzebują wiary śmiertelników',
    'Każdy czyn ma konsekwencje',
    'Świat jest testem dla dusz',
    'Reinkarnacja jest możliwa',
    'Bogowie ingerują w losy świata',
    'Magia pochodzi od bogów',
    'Święte miejsca są bramami do innych wymiarów',
    'Bogowie są odpowiedzialni za naturalne katastrofy',
  ].slice(0, randomInt(2, 5));

  return {
    id,
    name,
    description,
    gods,
    hierarchy,
    headGodId,
    pantheonRelations,
    philosophy,
    beliefs,
  };
}

/**
 * Generuje mit
 */
function generateMyth(pantheons: Pantheon[], mythIndex: number): Myth {
  const id = `myth-${mythIndex}`;
  const pantheon = pantheons[randomInt(0, pantheons.length - 1)]!;
  const gods = pantheon.gods;

  if (gods.length < 2) {
    // Fallback jeśli za mało bogów
    return {
      id,
      title: 'Mit o stworzeniu',
      description: 'Wielki mit o początku świata.',
      involvedGods: [],
      pantheons: [pantheon.id],
      type: 'creation',
      chronology: 'primordial',
      consequences: ['Stworzenie świata'],
    };
  }

  // Losowo wybierz dwóch różnych bogów
  const god1Index = randomInt(0, gods.length - 1);
  const god1 = gods[god1Index]!;
  const remainingGods = gods.filter((g) => g.id !== god1.id);
  if (remainingGods.length === 0) {
    // Fallback jeśli tylko jeden bóg
    return {
      id,
      title: 'Mit o stworzeniu',
      description: 'Wielki mit o początku świata.',
      involvedGods: [god1.id],
      pantheons: [pantheon.id],
      type: 'creation',
      chronology: 'primordial',
      consequences: ['Stworzenie świata'],
    };
  }
  const god2 = remainingGods[randomInt(0, remainingGods.length - 1)]!;

  const mythTypes: Myth['type'][] = [
    'creation',
    'war',
    'love',
    'betrayal',
    'sacrifice',
    'triumph',
    'tragedy',
    'prophecy',
  ];
  const type = mythTypes[randomInt(0, mythTypes.length - 1)]!;

  const chronologies: Myth['chronology'][] = [
    'primordial',
    'ancient',
    'historical',
    'recent',
  ];
  const chronology = chronologies[randomInt(0, chronologies.length - 1)]!;

  const titles: Record<Myth['type'], string[]> = {
    creation: [
      `Stworzenie świata przez ${god1.name}`,
      `Początek wszystkiego`,
      `Wielkie narodziny`,
      `${god1.name} i początek czasu`,
      `Pierwszy akt stworzenia`,
      `Narodziny rzeczywistości`,
      `${god1.name} kształtuje świat`,
      `Wielka eksplozja stworzenia`,
      `Początek wszystkich rzeczy`,
    ],
    war: [
      `Wielka wojna ${god1.name} i ${god2.name}`,
      `Bitwa bogów`,
      `Konflikt niebios`,
      `Wojna tysiąca lat`,
      `Ostatnia bitwa`,
      `Wielka krucjata`,
      `Wojna o dominację`,
      `Konflikt między panteonami`,
      `Bitwa o tron niebios`,
    ],
    love: [
      `Miłość ${god1.name} i ${god2.name}`,
      `Wielka namiętność`,
      `Romans bogów`,
      `Wieczna miłość`,
      `Związek niebios`,
      `Wielkie połączenie`,
      `Miłość ponad czasem`,
      `Romans, który zmienił świat`,
      `Namiętność bogów`,
    ],
    betrayal: [
      `Zdrada ${god1.name}`,
      `Wielka zdrada`,
      `Upadek ${god2.name}`,
      `Zdrada w panteonie`,
      `Wielki spisek`,
      `Zdradziecki cios`,
      `Upadek z łaski`,
      `Zdrada, która wstrząsnęła niebiosami`,
      `Wielka zdrada`,
    ],
    sacrifice: [
      `Ofiara ${god1.name}`,
      `Wielkie poświęcenie`,
      `Cena mocy`,
      `Ostatnia ofiara`,
      `Poświęcenie dla świata`,
      `Wielka ofiara`,
      `Cena zbawienia`,
      `Ostateczne poświęcenie`,
      `Ofiara, która ocaliła wszystko`,
    ],
    triumph: [
      `Triumf ${god1.name}`,
      `Wielkie zwycięstwo`,
      `Chwała ${god1.name}`,
      `Zwycięstwo nad ciemnością`,
      `Wielki triumf`,
      `Chwalebne zwycięstwo`,
      `Triumf dobra`,
      `Zwycięstwo, które zmieniło świat`,
      `Wielka chwała`,
    ],
    tragedy: [
      `Tragedia ${god1.name}`,
      `Wielki smutek`,
      `Upadek`,
      `Wielka tragedia`,
      `Upadek z niebios`,
      `Tragiczna śmierć`,
      `Wielki żal`,
      `Tragedia, która wstrząsnęła światem`,
      `Ostateczny upadek`,
    ],
    prophecy: [
      `Przepowiednia ${god1.name}`,
      `Wielka przepowiednia`,
      `Przyszłość świata`,
      `Przepowiednia o końcu`,
      `Wielka wizja`,
      `Przepowiednia o powrocie`,
      `Wizja przyszłości`,
      `Przepowiednia, która się spełnia`,
      `Wielka przepowiednia`,
    ],
    other: [
      'Wielki mit',
      'Legenda',
      'Opowieść',
      'Starożytna historia',
      'Zapomniana legenda',
      'Wielka opowieść',
      'Mityczna historia',
      'Legenda przodków',
      'Starożytna opowieść',
    ],
  };

  const title = titles[type]![randomInt(0, titles[type]!.length - 1)]!;

  const descriptions: Record<Myth['type'], string[]> = {
    creation: [
      `${god1.name} stworzył świat z niczego, kształtując rzeczywistość swoją wolą.`,
      `Wielka eksplozja stworzenia, gdy ${god1.name} powołał świat do istnienia.`,
      `${god1.name} wyłonił się z chaosu i ukształtował pierwsze elementy.`,
      `Z pierwotnej pustki ${god1.name} stworzył ziemię, niebo i morze.`,
      `Wielka magia ${god1.name} dała początek wszystkim rzeczom.`,
      `${god1.name} przemówił, a świat powstał z jego słów.`,
    ],
    war: [
      `${god1.name} i ${god2.name} stoczyli wielką bitwę, która wstrząsnęła fundamentami świata.`,
      `Wojna między ${god1.name} a ${god2.name} trwała tysiące lat.`,
      `Wielka bitwa między panteonami zmieniła kształt rzeczywistości.`,
      `${god1.name} i ${god2.name} walczyli o dominację nad światem.`,
      `Konflikt między ${god1.name} a ${god2.name} doprowadził do upadku wielu cywilizacji.`,
      `Wojna bogów pozostawiła blizny na samej strukturze świata.`,
    ],
    love: [
      `${god1.name} i ${god2.name} połączyli się w wielkiej miłości, tworząc nowe życie.`,
      `Romans ${god1.name} i ${god2.name} zmienił bieg historii.`,
      `Wielka miłość między ${god1.name} a ${god2.name} dała początek nowym bogom.`,
      `${god1.name} i ${god2.name} połączyli swoje moce w akcie miłości.`,
      `Romans ${god1.name} i ${god2.name} był najpiękniejszą historią w mitologii.`,
      `Miłość ${god1.name} i ${god2.name} przetrwała wszystkie próby czasu.`,
    ],
    betrayal: [
      `${god1.name} zdradził ${god2.name}, powodując wielki konflikt.`,
      `Wielka zdrada ${god1.name} wstrząsnęła panteonem.`,
      `${god1.name} zdradził zaufanie ${god2.name}, co doprowadziło do wojny.`,
      `Zdrada ${god1.name} była najciemniejszym momentem w historii bogów.`,
      `${god1.name} sprzedał ${god2.name} wrogom za obietnicę władzy.`,
      `Wielka zdrada ${god1.name} podzieliła panteon na zawsze.`,
    ],
    sacrifice: [
      `${god1.name} poświęcił się, aby ocalić świat.`,
      `Wielka ofiara ${god1.name} zmieniła wszystko.`,
      `${god1.name} oddał swoje życie, aby inni mogli żyć.`,
      `Ostatnia ofiara ${god1.name} była aktem najwyższej miłości.`,
      `${god1.name} poświęcił swoją nieśmiertelność dla dobra wszystkich.`,
      `Wielka ofiara ${god1.name} zapobiegła końcowi świata.`,
    ],
    triumph: [
      `${god1.name} odniósł wielkie zwycięstwo nad siłami zła.`,
      `Triumf ${god1.name} był punktem zwrotnym w historii.`,
      `${god1.name} pokonał największego wroga i przywrócił pokój.`,
      `Wielkie zwycięstwo ${god1.name} było świętowane przez wszystkie narody.`,
      `${god1.name} triumfował nad ciemnością i przyniósł światło.`,
      `Zwycięstwo ${god1.name} było początkiem nowej złotej ery.`,
    ],
    tragedy: [
      `${god1.name} upadł, powodując wielki smutek w świecie.`,
      `Tragedia ${god1.name} wstrząsnęła wszystkimi.`,
      `Upadek ${god1.name} był najtragiczniejszym wydarzeniem w historii.`,
      `${god1.name} zginął w sposób, który wstrząsnął fundamentami rzeczywistości.`,
      `Wielka tragedia ${god1.name} pozostawiła pustkę w sercach wszystkich.`,
      `Upadek ${god1.name} był końcem pewnej epoki i początkiem nowej.`,
    ],
    prophecy: [
      `${god1.name} przepowiedział wielką zmianę w świecie.`,
      `Przepowiednia ${god1.name} zaczęła się spełniać.`,
      `${god1.name} widział przyszłość i ostrzegł przed nadchodzącym niebezpieczeństwem.`,
      `Wielka przepowiednia ${god1.name} zmieniła bieg wydarzeń.`,
      `${god1.name} przepowiedział koniec i nowy początek.`,
      `Przepowiednia ${god1.name} była kluczem do zrozumienia przyszłości.`,
    ],
    other: [
      'Wielki mit o bogach i świecie.',
      'Starożytna legenda przekazywana przez pokolenia.',
      'Opowieść o czasach, gdy bogowie chodzili po ziemi.',
      'Mityczna historia o początkach cywilizacji.',
      'Legenda o wielkich czynach bogów.',
      'Zapomniana opowieść o dawnych czasach.',
    ],
  };

  const description =
    descriptions[type]![randomInt(0, descriptions[type]!.length - 1)]!;

  const consequences = [
    'Zmiana w świecie',
    'Nowa era',
    'Wielka transformacja',
    'Nowe prawo',
    'Upadek starego porządku',
    'Narodziny nowych bogów',
    'Zmiana klimatu',
    'Wielka migracja ludów',
    'Powstanie nowych cywilizacji',
    'Upadek starych imperiów',
    'Odkrycie nowej magii',
    'Zmiana struktury społeczeństwa',
    'Nowe święte miejsca',
    'Zmiana wierzeń',
    'Wielka katastrofa',
  ].slice(0, randomInt(2, 5));

  return {
    id,
    title,
    description,
    involvedGods: [god1.id, god2.id],
    pantheons: [pantheon.id],
    type,
    chronology,
    consequences,
  };
}

/**
 * Generuje płaszczyznę istnienia
 */
function generatePlane(planeIndex: number, pantheons: Pantheon[]): Plane {
  const id = `plane-${planeIndex}`;
  const planeTypes: Plane['type'][] = [
    'material',
    'divine',
    'elemental',
    'shadow',
    'astral',
    'void',
  ];

  const typeNames: Record<Plane['type'], string[]> = {
    material: [
      'Świat Materialny',
      'Płaszczyzna Fizyczna',
      'Realm Materii',
      'Świat Śmiertelników',
      'Płaszczyzna Ziemska',
      'Realm Fizyczny',
      'Świat Ciała',
      'Płaszczyzna Materii',
      'Realm Ziemski',
      'Świat Fizyczny',
      'Płaszczyzna Ciała',
      'Realm Śmiertelny',
    ],
    divine: [
      'Niebiańska Płaszczyzna',
      'Realm Bogów',
      'Świat Boski',
      'Niebiańskie Królestwo',
      'Realm Niebios',
      'Świat Boski',
      'Płaszczyzna Boska',
      'Realm Święty',
      'Świat Niebiański',
      'Królestwo Bogów',
      'Realm Boski',
      'Świat Święty',
    ],
    elemental: [
      'Płaszczyzna Żywiołów',
      'Realm Elementów',
      'Świat Żywiołów',
      'Realm Ognia i Wody',
      'Płaszczyzna Sił',
      'Świat Elementalny',
      'Realm Żywiołów',
      'Płaszczyzna Mocy',
      'Świat Sił Natury',
      'Królestwo Żywiołów',
      'Realm Natury',
      'Świat Pierwotny',
    ],
    shadow: [
      'Cienista Płaszczyzna',
      'Realm Cieni',
      'Świat Ciemności',
      'Płaszczyzna Cienia',
      'Realm Mroku',
      'Świat Ciemności',
      'Królestwo Cieni',
      'Realm Nocy',
      'Świat Mroczny',
      'Płaszczyzna Mroku',
      'Realm Ciemności',
      'Świat Cienia',
    ],
    astral: [
      'Astralna Płaszczyzna',
      'Realm Astralny',
      'Świat Duchów',
      'Płaszczyzna Duchów',
      'Realm Dusz',
      'Świat Astralny',
      'Królestwo Duchów',
      'Realm Eteryczny',
      'Świat Duchowy',
      'Płaszczyzna Eteryczna',
      'Realm Duchowy',
      'Świat Dusz',
    ],
    void: [
      'Pustka',
      'Nicość',
      'Realm Pustki',
      'Płaszczyzna Pustki',
      'Realm Nicości',
      'Świat Pusty',
      'Królestwo Pustki',
      'Realm Niczego',
      'Świat Niczego',
      'Płaszczyzna Nicości',
      'Realm Pusty',
      'Świat Pustki',
    ],
    other: [
      'Nieznana Płaszczyzna',
      'Tajemniczy Realm',
      'Obcy Świat',
      'Zagubiona Płaszczyzna',
      'Realm Zapomniany',
      'Świat Nieznany',
      'Tajemnicza Płaszczyzna',
      'Realm Ukryty',
      'Świat Tajemniczy',
      'Zapomniana Płaszczyzna',
      'Realm Obcy',
      'Świat Inny',
    ],
  };

  const type = planeTypes[randomInt(0, planeTypes.length - 1)]!;
  const name = typeNames[type]![randomInt(0, typeNames[type]!.length - 1)]!;

  const descriptions: Record<Plane['type'], string[]> = {
    material: [
      'Świat materialny, gdzie żyją śmiertelnicy.',
      'Płaszczyzna fizyczna, gdzie panują prawa natury.',
      'Realm materii, gdzie wszystko ma formę i kształt.',
      'Świat ciała, gdzie doświadcza się fizyczności.',
      'Płaszczyzna ziemska, gdzie toczy się życie.',
      'Realm fizyczny, gdzie czas płynie liniowo.',
    ],
    divine: [
      'Siedziba bogów, gdzie panuje wieczna chwała.',
      'Niebiańska płaszczyzna pełna światła i mocy.',
      'Realm bogów, gdzie panuje doskonałość.',
      'Świat boski, gdzie nie ma cierpienia.',
      'Płaszczyzna niebiańska, gdzie wszystko jest możliwe.',
      'Realm święty, gdzie przebywają nieśmiertelni.',
    ],
    elemental: [
      'Realm czystych żywiołów, gdzie panują siły natury.',
      'Płaszczyzna żywiołów, gdzie ogień, woda, ziemia i powietrze są czyste.',
      'Świat sił natury, gdzie żywioły są świadome.',
      'Realm pierwotny, gdzie wszystko jest energią.',
      'Płaszczyzna mocy, gdzie żywioły rządzą absolutnie.',
      'Świat elementalny, gdzie natura jest surowa i nieokiełznana.',
    ],
    shadow: [
      'Mroczna płaszczyzna cieni i tajemnic.',
      'Realm ciemności, gdzie światło nie dociera.',
      'Świat cienia, gdzie wszystko jest odwrócone.',
      'Płaszczyzna mroku, gdzie panuje strach.',
      'Realm ciemności, gdzie ukryte są największe sekrety.',
      'Świat cienia, gdzie rzeczywistość jest zniekształcona.',
    ],
    astral: [
      'Duchowa płaszczyzna, gdzie przebywają dusze.',
      'Realm dusz, gdzie dusze oczekują na reinkarnację.',
      'Świat duchowy, gdzie nie ma materii.',
      'Płaszczyzna eteryczna, gdzie wszystko jest energią.',
      'Realm duchów, gdzie przebywają zmarli.',
      'Świat astralny, gdzie czas i przestrzeń są inne.',
    ],
    void: [
      'Pustka poza rzeczywistością, gdzie nie ma nic.',
      'Realm nicości, gdzie nie istnieje nawet czas.',
      'Świat pusty, gdzie nie ma formy ani treści.',
      'Płaszczyzna pustki, gdzie wszystko jest nicością.',
      'Realm niczego, gdzie nie ma nawet myśli.',
      'Świat pustki, gdzie rzeczywistość przestaje istnieć.',
    ],
    other: [
      'Nieznana płaszczyzna istnienia.',
      'Tajemniczy realm, którego natura jest niepoznana.',
      'Obcy świat, gdzie panują inne prawa.',
      'Zagubiona płaszczyzna, zapomniana przez wszystkich.',
      'Realm ukryty, dostępny tylko dla wybranych.',
      'Świat inny, gdzie rzeczywistość jest całkowicie odmienna.',
    ],
  };

  const description =
    descriptions[type]![randomInt(0, descriptions[type]!.length - 1)]!;

  // Przypisz bogów związanych z płaszczyzną
  const allGods = pantheons.flatMap((p) => p.gods);
  // Losowe sortowanie (Fisher-Yates shuffle)
  const shuffledGods = [...allGods];
  for (let i = shuffledGods.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [shuffledGods[i], shuffledGods[j]] = [shuffledGods[j]!, shuffledGods[i]!];
  }
  const associatedGods = shuffledGods
    .slice(0, randomInt(1, 3))
    .map((g) => g.id);

  const properties = [
    'Nieśmiertelność',
    'Wieczna młodość',
    'Moc magii',
    'Czas płynie inaczej',
    'Nie ma śmierci',
    'Czysta energia',
    'Grawitacja jest inna',
    'Przestrzeń jest zakrzywiona',
    'Nie ma cierpienia',
    'Wszystko jest możliwe',
    'Materia jest płynna',
    'Myśli stają się rzeczywistością',
    'Nie ma granic',
    'Wszystko jest połączone',
    'Czas nie istnieje',
    'Przestrzeń jest nieskończona',
    'Energia jest nieograniczona',
    'Świadomość jest wszechobecna',
  ].slice(0, randomInt(2, 5));

  return {
    id,
    name,
    description,
    type,
    associatedGods,
    properties,
  };
}

/**
 * Generuje historię stworzenia świata
 */
function generateCreationStory(pantheons: Pantheon[]): string {
  const headGods = pantheons
    .map((p) => p.gods.find((g) => g.id === p.headGodId))
    .filter(Boolean) as God[];

  if (headGods.length === 0) {
    return 'Świat powstał z chaosu, a bogowie ukształtowali go swoją wolą.';
  }

  const god = headGods[randomInt(0, headGods.length - 1)]!;

  return `${god.name}, najpotężniejszy z bogów, stworzył świat z pierwotnej pustki. Z chaosu wyłoniły się ziemia, niebo i morze. Inni bogowie dołączyli do dzieła stworzenia, kształtując góry, rzeki i oceany. Tak narodził się świat, który znamy dzisiaj.`;
}

/**
 * Generuje eony (wielkie epoki)
 */
function generateEons(): Array<{
  name: string;
  description: string;
  duration: string;
  events: string[];
}> {
  const eons = [
    {
      name: 'Era Pierwotna',
      description: 'Czas przed stworzeniem, gdy panował chaos.',
      duration: 'Wieczność',
      events: ['Wielka pustka', 'Pierwsze iskry życia'],
    },
    {
      name: 'Era Stworzenia',
      description: 'Bogowie stworzyli świat i pierwsze istoty.',
      duration: '1000 lat',
      events: [
        'Stworzenie świata',
        'Narodziny pierwszych bogów',
        'Ukształtowanie ziemi',
      ],
    },
    {
      name: 'Era Bogów',
      description: 'Bogowie rządzili światem bezpośrednio.',
      duration: '5000 lat',
      events: ['Wielka wojna bogów', 'Upadek starych bogów', 'Nowy porządek'],
    },
    {
      name: 'Era Śmiertelników',
      description: 'Śmiertelnicy przejęli kontrolę nad światem.',
      duration: '10000 lat',
      events: [
        'Narodziny pierwszych ludzi',
        'Wielkie cywilizacje',
        'Upadki i wzloty',
      ],
    },
  ];

  return eons;
}

/**
 * Główna funkcja generująca kosmologię
 */
export function generateCosmology(_seed?: string): Cosmology {
  // Seed jest obsługiwany przez globalny Math.random override w useMapGenerator
  // Tutaj po prostu generujemy kosmologię

  // Generuj 1-5 panteonów
  const pantheonCount = randomInt(1, 5);
  const pantheons: Pantheon[] = [];

  for (let i = 0; i < pantheonCount; i++) {
    const pantheon = generatePantheon(i, pantheons);
    pantheons.push(pantheon);
  }

  // Generuj mity (5-15 mitów)
  const mythCount = randomInt(5, 15);
  const myths: Myth[] = [];
  for (let i = 0; i < mythCount; i++) {
    const myth = generateMyth(pantheons, i);
    myths.push(myth);
  }

  // Generuj płaszczyzny (3-8 płaszczyzn)
  const planeCount = randomInt(3, 8);
  const planes: Plane[] = [];
  for (let i = 0; i < planeCount; i++) {
    const plane = generatePlane(i, pantheons);
    planes.push(plane);
  }

  // Generuj historię stworzenia
  const creationStory = generateCreationStory(pantheons);

  // Generuj eony
  const eons = generateEons();

  return {
    pantheons,
    myths,
    planes,
    creationStory,
    eons,
  };
}
