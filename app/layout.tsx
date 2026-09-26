import type { Metadata } from 'next'
import { Inter, JetBrains_Mono, Source_Serif_4 } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import './lumo.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
})

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  weight: ['400'],
  style: ['italic'],
  variable: '--font-serif',
})

export const metadata: Metadata = {
  title: 'Lumo | A decision tool for product managers',
  description: "Hard calls, with the legwork done. Make your gut call, see the evidence, send the right message, and learn from how it turned out.",
  metadataBase: new URL('https://www.trylumo.co'),
  openGraph: {
    title: 'Lumo | A decision tool for product managers',
    description: "Hard calls, with the legwork done. Make your gut call, see the evidence, send the right message, and learn from how it turned out.",
    url: 'https://www.trylumo.co',
    siteName: 'Lumo',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Lumo: hard calls, with the legwork done.',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lumo | A decision tool for product managers',
    description: "Hard calls, with the legwork done. Make your gut call, see the evidence, send the right message, and learn from how it turned out.",
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
      <body className={`${inter.variable} ${jetbrainsMono.variable} ${sourceSerif.variable} antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
