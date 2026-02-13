import en from '~/i18n/en';
import pl from '~/i18n/pl';
import { useSettings } from './useSettings';

export type Locale = 'en' | 'pl';

type DeepStringify<T> = {
  [K in keyof T]: T[K] extends Record<string, unknown> ? DeepStringify<T[K]> : string;
};

type Translations = DeepStringify<typeof en>;

const locales: Record<Locale, Translations> = { en, pl };

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let result: unknown = obj;
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = (result as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }
  return typeof result === 'string' ? result : path;
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    return key in params ? String(params[key]) : `{${key}}`;
  });
}

export function useI18n() {
  const { settings, updateSetting } = useSettings();

  const locale = computed(() => settings.locale);

  function t(key: string, params?: Record<string, string | number>): string {
    const translations = locales[settings.locale];
    const value = getNestedValue(translations as unknown as Record<string, unknown>, key);
    return interpolate(value, params);
  }

  function setLocale(newLocale: Locale) {
    updateSetting('locale', newLocale);
  }

  return {
    t,
    locale,
    setLocale,
  };
}
