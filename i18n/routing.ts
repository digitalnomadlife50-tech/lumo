import { defineRouting } from "next-intl/routing"

export const routing = defineRouting({
  locales: ["en", "es"],
  defaultLocale: "en",
  // English keeps clean URLs (/, /app, /app/demo); Spanish is prefixed (/es, ...).
  localePrefix: "as-needed",
})

export type Locale = (typeof routing.locales)[number]
