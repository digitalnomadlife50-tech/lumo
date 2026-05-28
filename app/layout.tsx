import type { Metadata } from 'next'
import { Inter, JetBrains_Mono, Source_Serif_4 } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-mono',
})

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  weight: ['400'],
  style: ['italic'],
  variable: '--font-serif-italic',
})

export const metadata: Metadata = {
  title: 'Lumo, an external brain for PM decisions',
  description: "The work AI doesn't do for product managers. Lumo helps you think through decisions and produces tailored messages for your team.",
  metadataBase: new URL('https://www.trylumo.co'),
  openGraph: {
    title: 'Lumo, an external brain for PM decisions',
    description: "The work AI doesn't do for product managers. Lumo helps you think through decisions and produces tailored messages for your team.",
    url: 'https://www.trylumo.co',
    siteName: 'Lumo',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Lumo - an external brain for PM decisions',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lumo, an external brain for PM decisions',
    description: "The work AI doesn't do for product managers. Lumo helps you think through decisions and produces tailored messages for your team.",
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.jpg',
  },
  alternates: {
    canonical: 'https://www.trylumo.co',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className={`${inter.variable} ${jetbrainsMono.variable} ${sourceSerif.variable} font-sans antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
