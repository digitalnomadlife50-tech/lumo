import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { appMetadata } from "@/lib/seo";
import { isLocale } from "@/lib/i18n/locales";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return appMetadata(lang);
}

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
