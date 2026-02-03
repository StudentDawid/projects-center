/**
 * Settings definitions for Ateria Idle
 * QoL features and customization options
 */

// ============================================
// SETTINGS CATEGORIES
// ============================================

export interface SettingDefinition {
  id: string;
  name: string;
  description: string;
  category: SettingCategory;
  type: 'toggle' | 'slider' | 'select' | 'number';
  defaultValue: boolean | number | string;
  options?: { value: string | number; label: string }[];
  min?: number;
  max?: number;
  step?: number;
}

export type SettingCategory = 'general' | 'combat' | 'merchant' | 'scientist' | 'notifications' | 'display';

export const SETTING_CATEGORIES: Record<SettingCategory, { name: string; icon: string; color: string }> = {
  general: { name: 'Ogólne', icon: 'mdi-cog', color: 'grey' },
  combat: { name: 'Walka', icon: 'mdi-sword', color: 'red' },
  merchant: { name: 'Handel', icon: 'mdi-cart', color: 'amber' },
  scientist: { name: 'Nauka', icon: 'mdi-flask', color: 'green' },
  notifications: { name: 'Powiadomienia', icon: 'mdi-bell', color: 'blue' },
  display: { name: 'Wyświetlanie', icon: 'mdi-monitor', color: 'purple' },
};

// ============================================
// SETTINGS DEFINITIONS
// ============================================

export const SETTINGS: SettingDefinition[] = [
  // General
  {
    id: 'autoSaveInterval',
    name: 'Interwał Auto-zapisu',
    description: 'Jak często zapisywać postęp gry',
    category: 'general',
    type: 'select',
    defaultValue: 30,
    options: [
      { value: 10, label: 'Co 10 sekund' },
      { value: 30, label: 'Co 30 sekund' },
      { value: 60, label: 'Co minutę' },
      { value: 300, label: 'Co 5 minut' },
    ],
  },
  {
    id: 'offlineProgressEnabled',
    name: 'Postęp Offline',
    description: 'Kontynuuj postęp gdy gra jest zamknięta',
    category: 'general',
    type: 'toggle',
    defaultValue: true,
  },
  {
    id: 'maxOfflineHours',
    name: 'Maks. Godziny Offline',
    description: 'Maksymalny czas postępu offline',
    category: 'general',
    type: 'slider',
    defaultValue: 24,
    min: 1,
    max: 48,
    step: 1,
  },
  {
    id: 'confirmPrestige',
    name: 'Potwierdzenie Prestiżu',
    description: 'Wymagaj potwierdzenia przed prestiżem',
    category: 'general',
    type: 'toggle',
    defaultValue: true,
  },

  // Combat
  {
    id: 'autoCombatEnabled',
    name: 'Auto-walka',
    description: 'Automatycznie rozpoczynaj walkę z potworami',
    category: 'combat',
    type: 'toggle',
    defaultValue: true,
  },
  {
    id: 'autoLootEnabled',
    name: 'Auto-zbieranie',
    description: 'Automatycznie zbieraj loot po walce',
    category: 'combat',
    type: 'toggle',
    defaultValue: true,
  },
  {
    id: 'autoHealThreshold',
    name: 'Próg Auto-leczenia',
    description: 'Używaj mikstur leczących gdy HP spadnie poniżej',
    category: 'combat',
    type: 'slider',
    defaultValue: 50,
    min: 10,
    max: 90,
    step: 5,
  },
  {
    id: 'autoPotionEnabled',
    name: 'Auto-mikstury',
    description: 'Automatycznie używaj mikstur w walce',
    category: 'combat',
    type: 'toggle',
    defaultValue: true,
  },
  {
    id: 'showDamageNumbers',
    name: 'Pokaż Obrażenia',
    description: 'Wyświetlaj liczby obrażeń w walce',
    category: 'combat',
    type: 'toggle',
    defaultValue: true,
  },
  {
    id: 'combatSpeed',
    name: 'Prędkość Walki',
    description: 'Szybkość animacji walki',
    category: 'combat',
    type: 'select',
    defaultValue: 1,
    options: [
      { value: 0.5, label: 'Wolno (0.5x)' },
      { value: 1, label: 'Normalnie (1x)' },
      { value: 2, label: 'Szybko (2x)' },
      { value: 4, label: 'Bardzo szybko (4x)' },
    ],
  },

  // Merchant
  {
    id: 'autoSellEnabled',
    name: 'Auto-sprzedaż',
    description: 'Automatycznie sprzedawaj przedmioty niskiej jakości',
    category: 'merchant',
    type: 'toggle',
    defaultValue: false,
  },
  {
    id: 'autoSellRarity',
    name: 'Auto-sprzedaż Rzadkość',
    description: 'Sprzedawaj przedmioty tej rzadkości i niższej',
    category: 'merchant',
    type: 'select',
    defaultValue: 'common',
    options: [
      { value: 'common', label: 'Tylko zwykłe' },
      { value: 'uncommon', label: 'Zwykłe i niepospolite' },
    ],
  },
  {
    id: 'autoRestockEnabled',
    name: 'Auto-uzupełnianie',
    description: 'Automatycznie uzupełniaj wystawę sklepową',
    category: 'merchant',
    type: 'toggle',
    defaultValue: true,
  },
  {
    id: 'showPriceHistory',
    name: 'Historia Cen',
    description: 'Pokaż historię zmian cen na rynku',
    category: 'merchant',
    type: 'toggle',
    defaultValue: true,
  },

  // Scientist
  {
    id: 'autoCraftEnabled',
    name: 'Auto-wytwarzanie',
    description: 'Automatycznie powtarzaj receptury',
    category: 'scientist',
    type: 'toggle',
    defaultValue: true,
  },
  {
    id: 'autoRepairGolems',
    name: 'Auto-naprawa Golemów',
    description: 'Automatycznie naprawiaj golemy gdy integralność jest niska',
    category: 'scientist',
    type: 'toggle',
    defaultValue: false,
  },
  {
    id: 'golemRepairThreshold',
    name: 'Próg Naprawy Golemów',
    description: 'Naprawiaj golemy gdy integralność spadnie poniżej',
    category: 'scientist',
    type: 'slider',
    defaultValue: 50,
    min: 10,
    max: 90,
    step: 10,
  },
  {
    id: 'autoResearchEnabled',
    name: 'Auto-kolejka Badań',
    description: 'Automatycznie wybieraj następne badanie',
    category: 'scientist',
    type: 'toggle',
    defaultValue: false,
  },

  // Notifications
  {
    id: 'notificationsEnabled',
    name: 'Powiadomienia',
    description: 'Włącz powiadomienia w grze',
    category: 'notifications',
    type: 'toggle',
    defaultValue: true,
  },
  {
    id: 'levelUpNotifications',
    name: 'Powiadomienia o Awansie',
    description: 'Pokazuj powiadomienia o zdobyciu poziomu',
    category: 'notifications',
    type: 'toggle',
    defaultValue: true,
  },
  {
    id: 'lootNotifications',
    name: 'Powiadomienia o Loot',
    description: 'Pokazuj powiadomienia o rzadkim loot',
    category: 'notifications',
    type: 'toggle',
    defaultValue: true,
  },
  {
    id: 'eventNotifications',
    name: 'Powiadomienia o Wydarzeniach',
    description: 'Pokazuj powiadomienia o wydarzeniach',
    category: 'notifications',
    type: 'toggle',
    defaultValue: true,
  },
  {
    id: 'achievementNotifications',
    name: 'Powiadomienia o Osiągnięciach',
    description: 'Pokazuj powiadomienia o osiągnięciach',
    category: 'notifications',
    type: 'toggle',
    defaultValue: true,
  },
  {
    id: 'notificationDuration',
    name: 'Czas Powiadomień',
    description: 'Jak długo powiadomienia są widoczne',
    category: 'notifications',
    type: 'select',
    defaultValue: 3000,
    options: [
      { value: 2000, label: '2 sekundy' },
      { value: 3000, label: '3 sekundy' },
      { value: 5000, label: '5 sekund' },
      { value: 10000, label: '10 sekund' },
    ],
  },

  // Display
  {
    id: 'numberFormat',
    name: 'Format Liczb',
    description: 'Jak wyświetlać duże liczby',
    category: 'display',
    type: 'select',
    defaultValue: 'short',
    options: [
      { value: 'full', label: 'Pełne (1,234,567)' },
      { value: 'short', label: 'Skrócone (1.23M)' },
      { value: 'scientific', label: 'Naukowe (1.23e6)' },
    ],
  },
  {
    id: 'showResourceRates',
    name: 'Pokaż Tempo Zasobów',
    description: 'Wyświetlaj przyrost zasobów na sekundę',
    category: 'display',
    type: 'toggle',
    defaultValue: true,
  },
  {
    id: 'compactMode',
    name: 'Tryb Kompaktowy',
    description: 'Zmniejsz rozmiar UI dla więcej informacji',
    category: 'display',
    type: 'toggle',
    defaultValue: false,
  },
  {
    id: 'showTooltips',
    name: 'Pokaż Podpowiedzi',
    description: 'Wyświetlaj podpowiedzi po najechaniu',
    category: 'display',
    type: 'toggle',
    defaultValue: true,
  },
  {
    id: 'animationsEnabled',
    name: 'Animacje',
    description: 'Włącz animacje interfejsu',
    category: 'display',
    type: 'toggle',
    defaultValue: true,
  },
];

// ============================================
// AUTO-SELL SETTINGS
// ============================================

export interface AutoSellRule {
  id: string;
  name: string;
  enabled: boolean;
  conditions: {
    maxRarity?: 'common' | 'uncommon' | 'rare';
    itemCategories?: string[];
    minValue?: number;
    maxValue?: number;
    keepMinStack?: number;
  };
}

export const DEFAULT_AUTO_SELL_RULES: AutoSellRule[] = [
  {
    id: 'sell_common_loot',
    name: 'Sprzedaj zwykły loot',
    enabled: false,
    conditions: {
      maxRarity: 'common',
      itemCategories: ['monster_drop'],
    },
  },
  {
    id: 'sell_cheap_items',
    name: 'Sprzedaj tanie przedmioty',
    enabled: false,
    conditions: {
      maxValue: 10,
    },
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getSetting(id: string): SettingDefinition | undefined {
  return SETTINGS.find(s => s.id === id);
}

export function getSettingsByCategory(category: SettingCategory): SettingDefinition[] {
  return SETTINGS.filter(s => s.category === category);
}

export function getDefaultSettings(): Record<string, boolean | number | string> {
  const defaults: Record<string, boolean | number | string> = {};
  for (const setting of SETTINGS) {
    defaults[setting.id] = setting.defaultValue;
  }
  return defaults;
}

export function validateSettingValue(
  settingId: string,
  value: boolean | number | string
): boolean {
  const setting = getSetting(settingId);
  if (!setting) return false;

  switch (setting.type) {
    case 'toggle':
      return typeof value === 'boolean';
    case 'slider':
    case 'number':
      if (typeof value !== 'number') return false;
      if (setting.min !== undefined && value < setting.min) return false;
      if (setting.max !== undefined && value > setting.max) return false;
      return true;
    case 'select':
      if (!setting.options) return false;
      return setting.options.some(o => o.value === value);
    default:
      return true;
  }
}
