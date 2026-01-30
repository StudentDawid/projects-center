/**
 * Priest Path Data - Faith, Blessings, Divine Powers
 */

export type DeityDomain = 'light' | 'nature' | 'war' | 'wisdom' | 'death' | 'balance';

export interface Deity {
  id: string;
  name: string;
  description: string;
  icon: string;
  domain: DeityDomain;
  favorBonus: { stat: string; value: number }[];
}

export interface Prayer {
  id: string;
  name: string;
  description: string;
  icon: string;
  deityId: string;
  tier: number;
  requiredLevel: number;
  requiredFavor: number;
  faithCost: number;
  duration: number;
  effects: PrayerEffect[];
  cooldown: number;
  xpReward: number;
}

export interface PrayerEffect {
  type: 'buff' | 'heal' | 'damage' | 'special';
  stat?: string;
  value: number;
  description: string;
}

export interface Ritual {
  id: string;
  name: string;
  description: string;
  icon: string;
  deityId?: string;
  tier: number;
  requiredLevel: number;
  faithCost: number;
  goldCost: number;
  ritualTime: number;
  effects: { type: string; value: number; description: string }[];
  xpReward: number;
}

export interface HolyRelic {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: number;
  faithBonus: number;
  domainBonus?: DeityDomain;
  prayerPower: number;
  requiredLevel: number;
  cost: number;
}

export interface PriestProgress { level: number; xp: number; xpToNextLevel: number; totalXp: number; }

export const DEITIES: Record<string, Deity> = {
  solaris: { id: 'solaris', name: 'Solaris', description: 'Bóg Światła i Sprawiedliwości.', icon: 'mdi-white-balance-sunny', domain: 'light', favorBonus: [{ stat: 'healing', value: 20 }, { stat: 'defense', value: 10 }] },
  terra: { id: 'terra', name: 'Terra', description: 'Bogini Natury i Życia.', icon: 'mdi-leaf', domain: 'nature', favorBonus: [{ stat: 'hp_regen', value: 25 }, { stat: 'gathering', value: 15 }] },
  bellum: { id: 'bellum', name: 'Bellum', description: 'Bóg Wojny i Zwycięstwa.', icon: 'mdi-sword', domain: 'war', favorBonus: [{ stat: 'attack', value: 20 }, { stat: 'crit', value: 10 }] },
  athena: { id: 'athena', name: 'Athena', description: 'Bogini Mądrości i Nauki.', icon: 'mdi-book-open-variant', domain: 'wisdom', favorBonus: [{ stat: 'xp_bonus', value: 25 }, { stat: 'research', value: 15 }] },
  mortis: { id: 'mortis', name: 'Mortis', description: 'Bóg Śmierci i Przejścia.', icon: 'mdi-skull', domain: 'death', favorBonus: [{ stat: 'lifesteal', value: 15 }, { stat: 'undead_damage', value: 25 }] },
  libra: { id: 'libra', name: 'Libra', description: 'Bogini Równowagi i Harmonii.', icon: 'mdi-scale-balance', domain: 'balance', favorBonus: [{ stat: 'all', value: 10 }] },
};

export const PRAYERS: Record<string, Prayer> = {
  // Light prayers
  blessing_light: { id: 'blessing_light', name: 'Błogosławieństwo Światła', description: 'Zwiększa obronę i leczenie.', icon: 'mdi-hand-heart', deityId: 'solaris', tier: 1, requiredLevel: 1, requiredFavor: 0, faithCost: 10, duration: 600, effects: [{ type: 'buff', stat: 'defense', value: 15, description: '+15% obrony' }, { type: 'buff', stat: 'healing', value: 10, description: '+10% leczenia' }], cooldown: 300, xpReward: 15 },
  smite: { id: 'smite', name: 'Kara Boska', description: 'Zadaje obrażenia świetlne.', icon: 'mdi-lightning-bolt', deityId: 'solaris', tier: 2, requiredLevel: 10, requiredFavor: 100, faithCost: 25, duration: 0, effects: [{ type: 'damage', value: 100, description: '100 obrażeń świetlnych' }], cooldown: 200, xpReward: 35 },
  divine_shield: { id: 'divine_shield', name: 'Boska Tarcza', description: 'Tworzy tarczę ochronną.', icon: 'mdi-shield-sun', deityId: 'solaris', tier: 3, requiredLevel: 22, requiredFavor: 500, faithCost: 50, duration: 300, effects: [{ type: 'special', value: 200, description: 'Absorpcja 200 obrażeń' }], cooldown: 600, xpReward: 80 },
  
  // Nature prayers
  natures_embrace: { id: 'natures_embrace', name: 'Objęcia Natury', description: 'Regeneracja zdrowia.', icon: 'mdi-flower', deityId: 'terra', tier: 1, requiredLevel: 3, requiredFavor: 0, faithCost: 12, duration: 500, effects: [{ type: 'buff', stat: 'hp_regen', value: 20, description: '+20 HP/tick' }], cooldown: 250, xpReward: 18 },
  wild_growth: { id: 'wild_growth', name: 'Dziki Wzrost', description: 'Zwiększa zbieranie.', icon: 'mdi-sprout', deityId: 'terra', tier: 2, requiredLevel: 12, requiredFavor: 150, faithCost: 20, duration: 900, effects: [{ type: 'buff', stat: 'gathering', value: 30, description: '+30% zbierania' }], cooldown: 400, xpReward: 40 },
  
  // War prayers
  battle_cry: { id: 'battle_cry', name: 'Okrzyk Bojowy', description: 'Zwiększa obrażenia.', icon: 'mdi-bullhorn', deityId: 'bellum', tier: 1, requiredLevel: 5, requiredFavor: 0, faithCost: 15, duration: 400, effects: [{ type: 'buff', stat: 'attack', value: 25, description: '+25% obrażeń' }], cooldown: 300, xpReward: 20 },
  divine_fury: { id: 'divine_fury', name: 'Boska Furia', description: 'Potężny atak i buff.', icon: 'mdi-sword-cross', deityId: 'bellum', tier: 3, requiredLevel: 25, requiredFavor: 600, faithCost: 60, duration: 200, effects: [{ type: 'damage', value: 150, description: '150 obrażeń' }, { type: 'buff', stat: 'crit', value: 20, description: '+20% kryt' }], cooldown: 500, xpReward: 90 },
  
  // Wisdom prayers
  enlightenment: { id: 'enlightenment', name: 'Oświecenie', description: 'Zwiększa XP.', icon: 'mdi-lightbulb', deityId: 'athena', tier: 1, requiredLevel: 4, requiredFavor: 0, faithCost: 10, duration: 600, effects: [{ type: 'buff', stat: 'xp_bonus', value: 20, description: '+20% XP' }], cooldown: 400, xpReward: 18 },
  divine_insight: { id: 'divine_insight', name: 'Boskie Zrozumienie', description: 'Odkrywa sekrety.', icon: 'mdi-eye', deityId: 'athena', tier: 2, requiredLevel: 15, requiredFavor: 200, faithCost: 30, duration: 300, effects: [{ type: 'special', value: 50, description: 'Bonus do badań' }], cooldown: 500, xpReward: 50 },
  
  // Death prayers
  drain_life: { id: 'drain_life', name: 'Wyssanie Życia', description: 'Kradnie HP.', icon: 'mdi-heart-broken', deityId: 'mortis', tier: 2, requiredLevel: 12, requiredFavor: 150, faithCost: 25, duration: 0, effects: [{ type: 'damage', value: 80, description: '80 obrażeń' }, { type: 'heal', value: 50, description: 'Przywraca 50 HP' }], cooldown: 250, xpReward: 45 },
  undead_bane: { id: 'undead_bane', name: 'Zguba Nieumarłych', description: 'Niszczy nieumarłych.', icon: 'mdi-grave-stone', deityId: 'mortis', tier: 3, requiredLevel: 28, requiredFavor: 700, faithCost: 70, duration: 400, effects: [{ type: 'buff', stat: 'undead_damage', value: 100, description: '+100% vs nieumarli' }], cooldown: 600, xpReward: 100 },
  
  // Balance prayers
  equilibrium: { id: 'equilibrium', name: 'Równowaga', description: 'Wyrównuje wszystko.', icon: 'mdi-scale-balance', deityId: 'libra', tier: 2, requiredLevel: 18, requiredFavor: 300, faithCost: 35, duration: 500, effects: [{ type: 'buff', stat: 'all', value: 15, description: '+15% wszystkie statystyki' }], cooldown: 450, xpReward: 55 },
};

export const RITUALS: Record<string, Ritual> = {
  daily_prayer: { id: 'daily_prayer', name: 'Codzienna Modlitwa', description: 'Regularna praktyka wiary.', icon: 'mdi-hands-pray', tier: 1, requiredLevel: 1, faithCost: 5, goldCost: 10, ritualTime: 100, effects: [{ type: 'faith', value: 10, description: '+10 wiary' }], xpReward: 10 },
  offering: { id: 'offering', name: 'Ofiara', description: 'Złożenie daru bóstwu.', icon: 'mdi-gift', tier: 1, requiredLevel: 5, faithCost: 0, goldCost: 50, ritualTime: 150, effects: [{ type: 'favor', value: 20, description: '+20 łaski' }], xpReward: 20 },
  pilgrimage: { id: 'pilgrimage', name: 'Pielgrzymka', description: 'Podróż do świętego miejsca.', icon: 'mdi-walk', tier: 2, requiredLevel: 12, faithCost: 20, goldCost: 100, ritualTime: 400, effects: [{ type: 'faith', value: 30, description: '+30 wiary' }, { type: 'favor', value: 50, description: '+50 łaski' }], xpReward: 50 },
  consecration: { id: 'consecration', name: 'Konsekracja', description: 'Błogosławienie przedmiotu.', icon: 'mdi-cross', tier: 3, requiredLevel: 20, faithCost: 50, goldCost: 300, ritualTime: 600, effects: [{ type: 'special', value: 1, description: 'Błogosławi przedmiot' }], xpReward: 100 },
  divine_communion: { id: 'divine_communion', name: 'Boska Komunia', description: 'Bezpośredni kontakt z bóstwem.', icon: 'mdi-star', tier: 4, requiredLevel: 35, faithCost: 100, goldCost: 1000, ritualTime: 1200, effects: [{ type: 'faith', value: 100, description: '+100 wiary' }, { type: 'favor', value: 200, description: '+200 łaski' }, { type: 'special', value: 1, description: 'Wizja boska' }], xpReward: 300 },
};

export const HOLY_RELICS: Record<string, HolyRelic> = {
  prayer_beads: { id: 'prayer_beads', name: 'Różaniec', description: 'Podstawowy przedmiot modlitewny.', icon: 'mdi-circle-multiple', tier: 1, faithBonus: 5, prayerPower: 5, requiredLevel: 1, cost: 50 },
  holy_symbol: { id: 'holy_symbol', name: 'Święty Symbol', description: 'Znak twojego bóstwa.', icon: 'mdi-cross', tier: 1, faithBonus: 10, prayerPower: 10, requiredLevel: 5, cost: 150 },
  blessed_tome: { id: 'blessed_tome', name: 'Błogosławiona Księga', description: 'Święte pisma.', icon: 'mdi-book-cross', tier: 2, faithBonus: 20, prayerPower: 15, requiredLevel: 12, cost: 400 },
  divine_staff: { id: 'divine_staff', name: 'Boski Kostur', description: 'Kanał boskiej mocy.', icon: 'mdi-wand', tier: 3, faithBonus: 35, prayerPower: 25, requiredLevel: 22, cost: 1000 },
  celestial_halo: { id: 'celestial_halo', name: 'Niebiańska Aureola', description: 'Dar od bogów.', icon: 'mdi-circle-outline', tier: 4, faithBonus: 50, prayerPower: 40, domainBonus: 'light', requiredLevel: 32, cost: 3000 },
  ark_covenant: { id: 'ark_covenant', name: 'Arka Przymierza', description: 'Legendarna relikwia.', icon: 'mdi-treasure-chest', tier: 5, faithBonus: 100, prayerPower: 75, requiredLevel: 40, cost: 10000 },
};

export const DOMAIN_DATA: Record<DeityDomain, { name: string; color: string; icon: string }> = {
  light: { name: 'Światło', color: '#FFC107', icon: 'mdi-white-balance-sunny' },
  nature: { name: 'Natura', color: '#4CAF50', icon: 'mdi-leaf' },
  war: { name: 'Wojna', color: '#F44336', icon: 'mdi-sword' },
  wisdom: { name: 'Mądrość', color: '#2196F3', icon: 'mdi-book-open-variant' },
  death: { name: 'Śmierć', color: '#607D8B', icon: 'mdi-skull' },
  balance: { name: 'Równowaga', color: '#9C27B0', icon: 'mdi-scale-balance' },
};

export function getDeity(id: string): Deity | undefined { return DEITIES[id]; }
export function getPrayer(id: string): Prayer | undefined { return PRAYERS[id]; }
export function getRitual(id: string): Ritual | undefined { return RITUALS[id]; }
export function getRelic(id: string): HolyRelic | undefined { return HOLY_RELICS[id]; }
export function getPrayersByDeity(deityId: string): Prayer[] { return Object.values(PRAYERS).filter(p => p.deityId === deityId); }
export function calculatePriestXpToLevel(level: number): number { return Math.floor(100 * Math.pow(1.15, level - 1)); }
