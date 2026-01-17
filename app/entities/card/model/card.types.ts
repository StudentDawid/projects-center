/**
 * Typy danych dla kart Fabula Ultima
 */

/**
 * Typ karty
 */
export enum CardType {
  EQUIPMENT = 'equipment',
  SPELL = 'spell',
  SKILL = 'skill',
  QUEST = 'quest',
  ITEM = 'item',
  NPC = 'npc',
  LOCATION = 'location',
}

/**
 * Rzadkość przedmiotu (dla ekwipunku i przedmiotów)
 */
export enum Rarity {
  COMMON = 'common', // Powszechna
  RARE = 'rare', // Rzadka
  EPIC = 'epic', // Epicka
  LEGENDARY = 'legendary', // Legendarna
  DIVINE = 'divine', // Boska
}

/**
 * Typ obrażeń
 */
export enum DamageType {
  PHYSICAL = 'physical', // Fizyczne
  FIRE = 'fire', // Ogniste
  ICE = 'ice', // Lodowe
  ELECTRIC = 'electric', // Elektryczne
  POISON = 'poison', // Trujące
  EARTH = 'earth', // Ziemne
  LIGHT = 'light', // Świetliste
  DARK = 'dark', // Mroczne
  AIR = 'air', // Powietrzne
}

/**
 * Statystyki precyzji (dla broni)
 */
export enum AccuracyStat {
  ZR = 'zr', // Zręczność
  PO = 'po', // Postawa
  WJ = 'wj', // Wola
  SW = 'sw', // Siła Woli
}

/**
 * Typ broni
 */
export enum WeaponType {
  MELEE = 'melee', // Biała
  RANGED = 'ranged', // Dystansowa
}

/**
 * Typ chwytu broni
 */
export enum WeaponHands {
  ONE_HANDED = 'one_handed', // Jednoręczna
  TWO_HANDED = 'two_handed', // Dwuręczna
}

/**
 * Precyzja broni
 */
export interface WeaponAccuracy {
  /** Pierwsza statystyka */
  stat1: AccuracyStat;
  /** Druga statystyka */
  stat2: AccuracyStat;
  /** Modyfikator (domyślnie 0) */
  modifier: number;
}

/**
 * Obrażenia broni
 */
export interface WeaponDamage {
  /** Modyfikator do WW (domyślnie 0) */
  modifier: number;
  /** Typ obrażeń */
  type: DamageType;
}

/**
 * Pancerz (dla armor)
 * Może być stała wartość lub kość z modyfikatorem
 */
export interface ArmorDefense {
  /** Stała wartość (jeśli nie używa kości) */
  fixedValue?: number;
  /** Kość (ZR dla Pancerz, WJ dla M. Pancerz) - opcjonalna */
  die?: AccuracyStat;
  /** Modyfikator do kości (dodatni, ujemny lub 0) */
  modifier?: number;
}

/**
 * Inicjatywa (dla armor)
 * Może być dodatnia, ujemna lub null (oznacza "-")
 */
export type ArmorInitiative = number | null;

/**
 * Statystyki ekwipunku
 */
export interface EquipmentStats {
  /** Precyzja (dla broni) */
  accuracy?: WeaponAccuracy;
  /** Obrażenia (dla broni) */
  damage?: WeaponDamage;
  /** Pancerz (dla armor) */
  defense?: ArmorDefense;
  /** Magiczny Pancerz (dla armor) */
  magicDefense?: ArmorDefense;
  /** Inicjatywa (dla armor) - dodatnia, ujemna lub null (oznacza "-") */
  initiative?: ArmorInitiative;
  /** Magiczna moc */
  magic?: number;
  /** Wytrzymałość */
  durability?: number;
  /** Waga */
  weight?: number;
  /** Wymagany poziom */
  levelRequired?: number;
}

/**
 * Efekt czaru/umiejętności
 */
export interface SpellEffect {
  /** Nazwa efektu */
  name: string;
  /** Opis efektu */
  description: string;
  /** Typ efektu (obrażenia, leczenie, buff, debuff, etc.) */
  type: string;
  /** Wartość efektu */
  value?: number;
  /** Czas trwania (w rundach) */
  duration?: number;
}

/**
 * Wymagania do użycia
 */
export interface Requirements {
  /** Wymagany poziom */
  level?: number;
  /** Wymagane statystyki */
  stats?: {
    strength?: number;
    dexterity?: number;
    intelligence?: number;
    wisdom?: number;
    charisma?: number;
  };
  /** Wymagane umiejętności */
  skills?: string[];
  /** Wymagane klasy postaci */
  classes?: string[];
}

/**
 * Nagroda za zadanie
 */
export interface QuestReward {
  /** Doświadczenie */
  experience?: number;
  /** Złoto */
  gold?: number;
  /** Przedmioty */
  items?: string[];
  /** Reputacja */
  reputation?: Record<string, number>;
}

/**
 * Warunek zadania
 */
export interface QuestCondition {
  /** Opis warunku */
  description: string;
  /** Typ warunku */
  type: 'kill' | 'collect' | 'talk' | 'reach' | 'custom';
  /** Cel (np. nazwa potwora, przedmiotu, NPC) */
  target?: string;
  /** Wymagana ilość */
  amount?: number;
}

/**
 * Bazowa struktura karty
 */
export interface BaseCard {
  /** Unikalny identyfikator */
  id: string;
  /** Nazwa karty */
  name: string;
  /** Typ karty */
  type: CardType;
  /** Opis */
  description: string;
  /** Flavor text (fluffowy tekst) */
  flavorText?: string;
  /** Obrazek/ikona (URL lub base64) */
  image?: string;
  /** Tagi do kategoryzacji */
  tags: string[];
  /** Data utworzenia */
  createdAt: Date;
  /** Data ostatniej modyfikacji */
  updatedAt: Date;
}

/**
 * Karta ekwipunku
 */
export interface EquipmentCard extends BaseCard {
  type: CardType.EQUIPMENT;
  /** Slot ekwipunku */
  slot: 'weapon' | 'armor' | 'accessory' | 'shield' | 'helmet' | 'boots' | 'gloves';
  /** Rzadkość */
  rarity: Rarity;
  /** Statystyki */
  stats: EquipmentStats;
  /** Wymagania */
  requirements?: Requirements;
  /** Efekty specjalne */
  specialEffects?: string[];
  /** Wartość sprzedaży */
  sellValue?: number;
  /** Cena zakupu (dla broni) */
  buyValue?: number;
  /** Typ broni (dla broni) */
  weaponType?: WeaponType;
  /** Typ chwytu broni (dla broni) */
  weaponHands?: WeaponHands;
}

/**
 * Karta czaru
 */
export interface SpellCard extends BaseCard {
  type: CardType.SPELL;
  /** Koszt many/MP */
  mpCost: number;
  /** Koszt FP (Fabula Points) */
  fpCost?: number;
  /** Zakres */
  range: 'self' | 'single' | 'area' | 'all';
  /** Czas rzucania */
  castTime?: number;
  /** Czas odnowienia */
  cooldown?: number;
  /** Efekty czaru */
  effects: SpellEffect[];
  /** Wymagania */
  requirements?: Requirements;
  /** Szkoła magii */
  school?: string;
}

/**
 * Karta umiejętności
 */
export interface SkillCard extends BaseCard {
  type: CardType.SKILL;
  /** Koszt FP */
  fpCost: number;
  /** Koszt MP (jeśli wymaga) */
  mpCost?: number;
  /** Czas odnowienia */
  cooldown?: number;
  /** Efekty umiejętności */
  effects: SpellEffect[];
  /** Wymagania */
  requirements?: Requirements;
  /** Maksymalny poziom (1-10) */
  maxLevel?: number;
  /** Cel umiejętności */
  target?: 'self' | 'single' | 'three' | 'all' | 'special';
  /** Czas trwania */
  duration?: 'instant' | 'scene' | 'turn';
  /** Kategoria/szkoła umiejętności */
  category?: string;
  /** Kategoria umiejętności */
  category?: string;
}

/**
 * Karta zadania
 */
export interface QuestCard extends BaseCard {
  type: CardType.QUEST;
  /** Poziom zadania */
  level?: number;
  /** Warunki do ukończenia */
  conditions?: QuestCondition[];
  /** Nagrody (lista stringów) */
  rewards?: string[];
  /** Czas na ukończenie (opcjonalnie) */
  timeLimit?: number;
  /** Zadanie główne czy poboczne */
  isMainQuest?: boolean;
  /** Poprzednie zadania wymagane */
  prerequisites?: string[];
  /** Miejsce zadania */
  location?: string;
  /** Ranga zadania */
  rank?: '-' | 'D' | 'C' | 'B' | 'A' | 'S';
  /** Klient zlecający zadanie */
  client?: string;
}

/**
 * Karta przedmiotu
 */
export interface ItemCard extends BaseCard {
  type: CardType.ITEM;
  /** Rzadkość */
  rarity: Rarity;
  /** Czy można użyć */
  consumable: boolean;
  /** Efekt użycia */
  useEffect?: SpellEffect;
  /** Wartość sprzedaży */
  sellValue?: number;
  /** Wartość zakupu */
  buyValue?: number;
  /** Maksymalna ilość w ekwipunku */
  stackSize?: number;
  /** Liczba użyć (0-5) */
  uses?: number;
  /** Cel przedmiotu */
  target?: 'self' | 'single' | 'three' | 'special';
  /** Typ wykorzystania */
  usageType?: 'single_use' | 'permanent' | 'see_below';
  /** Koszt w PE (Fabula Points) */
  fpCost?: number;
}

/**
 * Karta NPC
 */
export interface NPCCard extends BaseCard {
  type: CardType.NPC;
  /** Poziom */
  level?: number;
  /** Rola */
  role: 'merchant' | 'quest_giver' | 'companion' | 'enemy' | 'neutral' | 'other';
  /** Lokalizacja */
  location?: string;
  /** Dialogi */
  dialogues?: string[];
  /** Usługi oferowane */
  services?: string[];
}

/**
 * Karta lokacji
 */
export interface LocationCard extends BaseCard {
  type: CardType.LOCATION;
  /** Typ lokacji */
  locationType: 'city' | 'dungeon' | 'wilderness' | 'landmark' | 'shop' | 'other';
  /** Poziom zagrożenia */
  dangerLevel?: number;
  /** Opis szczegółowy */
  detailedDescription?: string;
  /** Znajdujące się tam NPC */
  npcs?: string[];
  /** Znajdujące się tam przedmioty */
  items?: string[];
}

/**
 * Unia wszystkich typów kart
 */
export type Card =
  | EquipmentCard
  | SpellCard
  | SkillCard
  | QuestCard
  | ItemCard
  | NPCCard
  | LocationCard;

/**
 * Filtry do listy kart
 */
export interface CardFilters {
  /** Typy kart */
  types?: CardType[];
  /** Tagi */
  tags?: string[];
  /** Wyszukiwarka po nazwie */
  search?: string;
  /** Sortowanie */
  sortBy?: 'name' | 'type' | 'createdAt' | 'updatedAt';
  /** Kierunek sortowania */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Ustawienia układu do druku
 */
export interface PrintLayoutSettings {
  /** Liczba kolumn */
  columns: number;
  /** Liczba wierszy */
  rows: number;
  /** Marginesy (mm) */
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  /** Orientacja strony */
  orientation: 'portrait' | 'landscape';
  /** Czy pokazywać ramki */
  showBorders: boolean;
  /** Czy pokazywać linie cięcia */
  showCutLines: boolean;
  /** Rozmiar karty (mm) */
  cardSize?: {
    width: number;
    height: number;
  };
}

