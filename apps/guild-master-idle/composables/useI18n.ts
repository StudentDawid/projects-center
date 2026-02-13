import en from '~/i18n/en';
import pl from '~/i18n/pl';

export type Locale = 'en' | 'pl';

type DeepStringify<T> = {
  [K in keyof T]: T[K] extends Record<string, unknown> ? DeepStringify<T[K]> : string;
};

type Translations = DeepStringify<typeof en>;

const locales: Record<Locale, Translations> = { en, pl };

const currentLocale = ref<Locale>('pl');

/**
 * Get a nested value from an object by dot-separated path
 */
function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let result: unknown = obj;
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = (result as Record<string, unknown>)[key];
    } else {
      return path; // fallback: return the key itself
    }
  }
  return typeof result === 'string' ? result : path;
}

/**
 * Replace {placeholder} tokens in a string with provided values
 */
function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    return key in params ? String(params[key]) : `{${key}}`;
  });
}

export function useI18n() {
  const locale = currentLocale;

  /**
   * Translate a key, optionally with interpolation params
   * Usage: t('nav.grandHall') or t('log.novicesCompleted', { count: 5 })
   */
  function t(key: string, params?: Record<string, string | number>): string {
    const translations = locales[locale.value];
    const value = getNestedValue(translations as unknown as Record<string, unknown>, key);
    return interpolate(value, params);
  }

  function setLocale(newLocale: Locale) {
    locale.value = newLocale;
  }

  return {
    t,
    locale,
    setLocale,
  };
}
