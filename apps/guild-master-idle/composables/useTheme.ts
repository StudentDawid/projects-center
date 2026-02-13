import { useSettings } from './useSettings';

export type ThemeMode = 'light' | 'dark';

const themeTokens: Record<ThemeMode, Record<string, string>> = {
  light: {
    '--bg-primary': '#ffffff',
    '--bg-secondary': 'rgba(248, 250, 252, 0.3)',
    '--bg-surface': '#ffffff',
    '--bg-hover': '#f9fafb',
    '--bg-active': '#f3f4f6',
    '--bg-active-accent': '#eff6ff',
    '--bg-log': '#f8fafc',
    '--border-primary': '#e5e7eb',
    '--border-light': '#f3f4f6',
    '--border-hover': '#93c5fd',
    '--border-dashed': '#e5e7eb',
    '--text-primary': '#1e293b',
    '--text-heading': '#374151',
    '--text-body': '#4b5563',
    '--text-muted': '#6b7280',
    '--text-faint': '#9ca3af',
    '--color-accent': '#1e88e5',
    '--color-accent-soft': '#eff6ff',
    '--scrollbar-track': '#f1f1f1',
    '--scrollbar-thumb': '#3b82f6',
  },
  dark: {
    '--bg-primary': '#0f1117',
    '--bg-secondary': 'rgba(17, 19, 28, 0.6)',
    '--bg-surface': '#171923',
    '--bg-hover': '#1e2030',
    '--bg-active': '#1e2030',
    '--bg-active-accent': '#172554',
    '--bg-log': '#11131c',
    '--border-primary': '#2d2f3e',
    '--border-light': '#232536',
    '--border-hover': '#3b5998',
    '--border-dashed': '#2d2f3e',
    '--text-primary': '#e2e8f0',
    '--text-heading': '#cbd5e1',
    '--text-body': '#94a3b8',
    '--text-muted': '#64748b',
    '--text-faint': '#475569',
    '--color-accent': '#60a5fa',
    '--color-accent-soft': '#172554',
    '--scrollbar-track': '#171923',
    '--scrollbar-thumb': '#3b5998',
  },
};

export function applyThemeTokens(mode: ThemeMode) {
  const tokens = themeTokens[mode];
  const root = document.documentElement;
  for (const [key, value] of Object.entries(tokens)) {
    root.style.setProperty(key, value);
  }
  root.setAttribute('data-theme', mode);
}

export function useTheme() {
  const { settings, updateSetting } = useSettings();

  const theme = computed(() => settings.theme);

  function setTheme(mode: ThemeMode) {
    updateSetting('theme', mode);
    applyThemeTokens(mode);
  }

  function toggleTheme() {
    setTheme(settings.theme === 'light' ? 'dark' : 'light');
  }

  return {
    theme,
    setTheme,
    toggleTheme,
  };
}
