import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://casaventuras.com'),
  title: {
    default: 'Casa Venturas — Puerto Rico Experiences',
    template: '%s · Casa Venturas',
  },
  description: 'Small-group tours in Puerto Rico. El Yunque rainforest, private catamaran to Vieques, sunset salsa. #10 of 152 in San Juan · 5.0★ · 1,458 reviews.',
  keywords: 'El Yunque tour San Juan, Puerto Rico adventure tour, private catamaran Vieques, salsa lesson San Juan, small group tour Puerto Rico',
  openGraph: {
    title: 'Casa Venturas — Puerto Rico Experiences',
    description: '#10 of 152 tours in San Juan · 5.0★ · 1,458 reviews',
    url: 'https://casaventuras.com',
    siteName: 'Casa Venturas',
    locale: 'en_US',
    type: 'website',
    images: [{ url: '/images/og/og-1200.jpg', width: 1200, height: 1600, alt: 'Casa Venturas — Puerto Rico experiences' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Casa Venturas — Puerto Rico Experiences',
    description: '#10 of 152 tours in San Juan · 5.0★',
    images: ['/images/og/og-1200.jpg'],
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
