import type { ThemeMode } from './useTheme';
import type { Locale } from './useI18n';

const STORAGE_KEY = 'guild-master-settings';

export interface UserSettings {
  theme: ThemeMode;
  locale: Locale;
}

const defaults: UserSettings = {
  theme: 'light',
  locale: 'en',
};

const isReady = ref(false);
const settings = reactive<UserSettings>({ ...defaults });

function loadFromStorage(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        theme: parsed.theme === 'dark' ? 'dark' : 'light',
        locale: parsed.locale === 'pl' ? 'pl' : 'en',
      };
    }
  } catch {
    // ignore corrupted data
  }
  return { ...defaults };
}

function saveToStorage() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        theme: settings.theme,
        locale: settings.locale,
      }),
    );
  } catch {
    // localStorage full or unavailable
  }
}

/**
 * Initialize settings from localStorage.
 * Returns a promise that resolves after settings are loaded and applied.
 * The artificial delay simulates future backend loading.
 */
async function initSettings(): Promise<UserSettings> {
  const saved = loadFromStorage();

  settings.theme = saved.theme;
  settings.locale = saved.locale;

  // Simulate async load (future: fetch from backend)
  await new Promise((resolve) => setTimeout(resolve, 800));

  isReady.value = true;
  return saved;
}

function updateSetting<K extends keyof UserSettings>(key: K, value: UserSettings[K]) {
  settings[key] = value;
  saveToStorage();
}

export function useSettings() {
  return {
    settings,
    isReady: readonly(isReady),
    initSettings,
    updateSetting,
    saveToStorage,
  };
}
