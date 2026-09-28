import type { Metadata } from "next"
import { notFound } from "next/navigation"
import DemoHome from "@/components/lumo/demo-home"
import { demoMetadata } from "@/lib/seo"
import { isLocale } from "@/lib/i18n/locales"

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  return demoMetadata(lang)
}

export default async function DemoPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  return <DemoHome />
}
