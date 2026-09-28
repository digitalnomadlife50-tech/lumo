import type { Metadata } from "next"
import { Inter, JetBrains_Mono, Source_Serif_4 } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { notFound } from "next/navigation"
import { LocaleProvider } from "@/lib/i18n"
import { getDictionary, resolveLocale } from "@/lib/i18n/get-dictionary"
import { homepageMetadata } from "@/lib/seo"
import { LOCALES, isLocale } from "@/lib/i18n/locales"
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
  return LOCALES.map((lang) => ({ lang }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const locale = resolveLocale(lang)
  const d = getDictionary(locale)
  const metadata = homepageMetadata(locale)

  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: d.metadata.ogAlt }],
    },
    icons: { icon: "/favicon.jpg" },
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
  if (!isLocale(lang)) {
    notFound()
  }
  const dictionary = getDictionary(lang)

  return (
    <html lang={lang} className="bg-background">
      <body className={`${inter.variable} ${jetbrainsMono.variable} ${sourceSerif.variable} antialiased`}>
        <LocaleProvider locale={lang} dictionary={dictionary}>
          {children}
        </LocaleProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
