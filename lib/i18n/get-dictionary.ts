import { en, type Dictionary } from "./dictionaries/en";
import { es } from "./dictionaries/es";
import { DEFAULT_LOCALE, isLocale, type Locale } from "./locales";

const DICTIONARIES: Record<Locale, Dictionary> = { en, es };

export function getDictionary(locale: string | undefined): Dictionary {
  return isLocale(locale) ? DICTIONARIES[locale] : DICTIONARIES[DEFAULT_LOCALE];
}

export function resolveLocale(locale: string | undefined): Locale {
  return isLocale(locale) ? locale : DEFAULT_LOCALE;
}

/**
 * Fill {placeholders} in a template string, e.g.
 * fill("Step {current} of {total}", { current: 2, total: 6 }).
 * Unknown placeholders are left as-is so a missing variable never crashes render.
 */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in vars ? String(vars[key]) : match
  );
}
