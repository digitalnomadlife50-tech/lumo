export const LOCALES = ["en", "es"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

/** Human-readable label for the switcher, in the language itself. */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  es: "Español",
};

/**
 * Pick the best locale from an Accept-Language header. Matches the primary
 * subtag so "es-MX" and "es-419" both resolve to Spanish. Defaults to English.
 */
export function detectLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;
  const tags = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { tag: tag.toLowerCase(), q: q ? parseFloat(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  for (const { tag } of tags) {
    const primary = tag.split("-")[0];
    if (isLocale(primary)) return primary;
    if (isLocale(tag)) return tag;
  }
  return DEFAULT_LOCALE;
}
