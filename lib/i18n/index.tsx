"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Locale } from "./locales";
import type { Dictionary } from "./dictionaries/en";

interface LocaleContextValue {
  locale: Locale;
  d: Dictionary;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale;
  dictionary: Dictionary;
  children: ReactNode;
}) {
  return <LocaleContext.Provider value={{ locale, d: dictionary }}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx.locale;
}

/** The active dictionary. Components read copy from here, never hardcoded. */
export function useDict(): Dictionary {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useDict must be used within LocaleProvider");
  return ctx.d;
}

/** Prefix an internal href with the active locale, e.g. href("/app") -> "/es/app". */
export function useLocaleHref() {
  const locale = useLocale();
  return (href: string) => {
    if (!href.startsWith("/")) return href;
    if (href.startsWith(`/${locale}/`) || href === `/${locale}`) return href;
    return `/${locale}${href}`;
  };
}
