/**
 * Typy danych dla kosmologii świata RPG
 */

/**
 * Domena boga (obszar władzy)
 */
export enum GodDomain {
  // Podstawowe domeny
  War = 'war', // Wojna
  Magic = 'magic', // Magia
  Nature = 'nature', // Natura
  Death = 'death', // Śmierć
  Life = 'life', // Życie
  Light = 'light', // Światło
  Darkness = 'darkness', // Ciemność
  Chaos = 'chaos', // Chaos
  Order = 'order', // Porządek
  Knowledge = 'knowledge', // Wiedza
  Wisdom = 'wisdom', // Mądrość
  Trickery = 'trickery', // Podstęp
  Justice = 'justice', // Sprawiedliwość
  Love = 'love', // Miłość
  Fertility = 'fertility', // Płodność
  Harvest = 'harvest', // Plony
  Sea = 'sea', // Morze
  Sky = 'sky', // Niebo
  Earth = 'earth', // Ziemia
  Fire = 'fire', // Ogień
  Water = 'water', // Woda
  Wind = 'wind', // Wiatr
  Craft = 'craft', // Rzemiosło
  Trade = 'trade', // Handel
  Travel = 'travel', // Podróże
  Protection = 'protection', // Ochrona
  Destruction = 'destruction', // Zniszczenie
  Healing = 'healing', // Leczenie
  Disease = 'disease', // Choroba
  Madness = 'madness', // Szaleństwo
  Dreams = 'dreams', // Sny
  Time = 'time', // Czas
  Fate = 'fate', // Przeznaczenie
}

/**
 * Osobowość boga
 */
export enum GodPersonality {
  Benevolent = 'benevolent', // Dobroczynny
  Malevolent = 'malevolent', // Złośliwy
  Neutral = 'neutral', // Neutralny
  Chaotic = 'chaotic', // Chaotyczny
  Lawful = 'lawful', // Praworządny
  Capricious = 'capricious', // Kapryśny
  Merciful = 'merciful', // Miłosierny
  Vengeful = 'vengeful', // Mściwy
  Wise = 'wise', // Mądry
  Foolish = 'foolish', // Głupi
  Proud = 'proud', // Dumny
  Humble = 'humble', // Pokorny
  Wrathful = 'wrathful', // Gniewny
  Peaceful = 'peaceful', // Pokojowy
  Jealous = 'jealous', // Zazdrosny
  Generous = 'generous', // Szczodry
}

/**
 * Poziom mocy boga
 */
export enum GodPowerLevel {
  Primordial = 'primordial', // Pierwotny (najwyższy)
  Major = 'major', // Główny
  Minor = 'minor', // Pomniejszy
  Demigod = 'demigod', // Półbóg
  Spirit = 'spirit', // Duch
}

/**
 * Symbol/symbolika boga
 */
export interface GodSymbol {
  /** Główny symbol (np. "Młot", "Kłos", "Gwiazda") */
  primary: string;
  /** Kolory symbolu */
  colors: string[];
  /** Zwierzęta związane z bogiem */
  animals: string[];
  /** Rośliny związane z bogiem */
  plants: string[];
  /** Elementy związane z bogiem */
  elements: string[];
}

/**
 * Relacja między bogami
 */
export enum GodRelationship {
  Ally = 'ally', // Sojusznik
  Enemy = 'enemy', // Wróg
  Rival = 'rival', // Rywal
  Lover = 'lover', // Kochanek
  Parent = 'parent', // Rodzic
  Child = 'child', // Dziecko
  Sibling = 'sibling', // Rodzeństwo
  Neutral = 'neutral', // Neutralny
}

/**
 * Relacja między bogami
 */
export interface GodRelation {
  /** ID boga z którym jest relacja */
  godId: string;
  /** Typ relacji */
  relationship: GodRelationship;
  /** Opis relacji (opcjonalny) */
  description?: string;
}

/**
 * Bóg
 */
export interface God {
  /** Unikalny ID boga */
  id: string;
  /** Imię boga */
  name: string;
  /** Tytuły boga (np. "Król Bogów", "Pani Zimy") */
  titles: string[];
  /** Domeny boga (obszary władzy) */
  domains: GodDomain[];
  /** Osobowość boga */
  personality: GodPersonality;
  /** Poziom mocy */
  powerLevel: GodPowerLevel;
  /** Symbolika boga */
  symbol: GodSymbol;
  /** Opis boga */
  description: string;
  /** Relacje z innymi bogami */
  relations: GodRelation[];
  /** Historia boga (pochodzenie, ważne wydarzenia) */
  history: string[];
  /** Cechy charakterystyczne */
  traits: string[];
  /** Mity związane z bogiem */
  myths: string[];
}

/**
 * Hierarchia w panteonie
 */
export enum PantheonHierarchy {
  Supreme = 'supreme', // Najwyższy (głowa panteonu)
  High = 'high', // Wysoki
  Middle = 'middle', // Średni
  Low = 'low', // Niski
}

/**
 * Panteon (grupa bogów)
 */
export interface Pantheon {
  /** Unikalny ID panteonu */
  id: string;
  /** Nazwa panteonu */
  name: string;
  /** Opis panteonu */
  description: string;
  /** Bogowie w panteonie */
  gods: God[];
  /** Hierarchia bogów w panteonie */
  hierarchy: Map<string, PantheonHierarchy>; // godId -> hierarchy
  /** Głowa panteonu (najwyższy bóg) */
  headGodId: string;
  /** Relacje między panteonami */
  pantheonRelations: Array<{
    pantheonId: string;
    relationship: 'allied' | 'enemy' | 'neutral' | 'rival';
    description?: string;
  }>;
  /** Filozofia panteonu */
  philosophy: string;
  /** Wierzenia panteonu */
  beliefs: string[];
}

/**
 * Mit (legendarne wydarzenie)
 */
export interface Myth {
  /** Unikalny ID mitu */
  id: string;
  /** Tytuł mitu */
  title: string;
  /** Opis mitu */
  description: string;
  /** Bogowie zaangażowani w mit */
  involvedGods: string[]; // godIds
  /** Panteony związane z mitem */
  pantheons: string[]; // pantheonIds
  /** Typ mitu */
  type:
    | 'creation'
    | 'war'
    | 'love'
    | 'betrayal'
    | 'sacrifice'
    | 'triumph'
    | 'tragedy'
    | 'prophecy'
    | 'other';
  /** Chronologia (kiedy się wydarzył) */
  chronology: 'primordial' | 'ancient' | 'historical' | 'recent';
  /** Konsekwencje mitu */
  consequences: string[];
}

/**
 * Plan istnienia (płaszczyzny, wymiary)
 */
export interface Plane {
  /** Unikalny ID płaszczyzny */
  id: string;
  /** Nazwa płaszczyzny */
  name: string;
  /** Opis płaszczyzny */
  description: string;
  /** Typ płaszczyzny */
  type:
    | 'material'
    | 'divine'
    | 'elemental'
    | 'shadow'
    | 'astral'
    | 'void'
    | 'other';
  /** Bogowie związani z płaszczyzną */
  associatedGods: string[]; // godIds
  /** Właściwości płaszczyzny */
  properties: string[];
}

/**
 * Kosmologia świata
 */
export interface Cosmology {
  /** Panteony */
  pantheons: Pantheon[];
  /** Mity (wszystkie mity świata) */
  myths: Myth[];
  /** Płaszczyzny istnienia */
  planes: Plane[];
  /** Historia stworzenia świata */
  creationStory: string;
  /** Eony (wielkie epoki) */
  eons: Array<{
    name: string;
    description: string;
    duration: string; // np. "1000 lat", "wieczność"
    events: string[];
  }>;
}
