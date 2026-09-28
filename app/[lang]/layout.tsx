import type { Metadata } from "next"
import { Inter, JetBrains_Mono, Source_Serif_4 } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { NextIntlClientProvider, hasLocale } from "next-intl"
import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"
import { routing } from "@/i18n/routing"
import "../globals.css"
import "../lumo.css"

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
})

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic"],
  variable: "--font-serif",
})

export function generateStaticParams() {
  return routing.locales.map((lang) => ({ lang }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const t = await getTranslations({ locale: lang, namespace: "metadata" })
  const isEs = lang === "es"
  const canonical = isEs ? "https://www.trylumo.co/es" : "https://www.trylumo.co"

  return {
    title: t("title"),
    description: t("description"),
    metadataBase: new URL("https://www.trylumo.co"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: canonical,
      siteName: "Lumo",
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: t("ogAlt") }],
      locale: isEs ? "es_ES" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: ["/og-image.png"],
    },
    icons: { icon: "/favicon.jpg" },
    alternates: {
      canonical,
      languages: {
        en: "https://www.trylumo.co",
        es: "https://www.trylumo.co/es",
      },
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ lang: string }>
}>) {
  const { lang } = await params
  if (!hasLocale(routing.locales, lang)) {
    notFound()
  }

  return (
    <html lang={lang} className="bg-background">
      <body className={`${inter.variable} ${jetbrainsMono.variable} ${sourceSerif.variable} antialiased`}>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
