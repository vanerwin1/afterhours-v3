import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AfterHours.AI — AI Phone Answering & Booking for Small Businesses',
  description:
    'Never miss a call. AfterHours.AI answers every call, books appointments, and captures leads 24/7 — sounding exactly like your team. Dental, legal, home services, and more.',
  keywords: [
    'AI phone answering',
    'AI receptionist',
    'after hours answering service',
    'appointment booking AI',
    'missed call solution',
    'dental answering service',
    'law firm answering service',
    'small business AI phone',
    'voicemail alternative',
    'automated phone answering',
  ],
  metadataBase: new URL('https://afterhours.ai'),
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    title: 'AfterHours.AI — Never Miss Another Call',
    description: 'AI voice agent that answers calls, books appointments, and captures leads 24/7. Setup in 24 hours. No credit card required.',
    siteName: 'AfterHours.AI',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AfterHours.AI — AI Phone Answering',
    description: 'AI voice agent that answers calls, books appointments, and captures leads 24/7.',
    site: '@afterhoursai',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://afterhours.ai',
  },
}

export const viewport: Viewport = {
  themeColor: '#000507',
  width: 'device-width',
  initialScale: 1,
}

// JSON-LD structured data for FAQ schema (improves Google rich results)
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Does AfterHours.AI actually sound like a real person?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Yes. We use the latest AI voice models — callers consistently can't tell the difference. Voice cloning is available on the Professional plan.",
      },
    },
    {
      '@type': 'Question',
      name: 'How long does setup take?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most businesses are live in 24 hours. You fill out a short onboarding form, we configure the agent, and you forward your after-hours number.',
      },
    },
    {
      '@type': 'Question',
      name: 'What happens if a caller has a real emergency?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You define escalation rules. AfterHours.AI can detect urgency keywords, offer a callback, send you an SMS alert, or connect to an emergency contact line.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I cancel AfterHours.AI anytime?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Absolutely. No long-term contracts. Cancel before your next billing date with no fees. All plans include a 30-day money-back guarantee.',
      },
    },
  ],
}

// JSON-LD for Software Application / SaaS product
const productJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'AfterHours.AI',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description: 'AI phone answering and appointment booking for small businesses. Answers calls 24/7, books appointments, and captures leads.',
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'USD',
    lowPrice: '297',
    highPrice: '1497',
    offerCount: '4',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    ratingCount: '4200',
    bestRating: '5',
    worstRating: '1',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#000507] text-[#ddeeff] antialiased font-sans">
        {children}
      </body>
    </html>
  )
}
