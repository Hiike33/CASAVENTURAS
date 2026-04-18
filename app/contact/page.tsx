import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import SchemaOrg from '@/components/SchemaOrg'
import Breadcrumb from '@/components/Breadcrumb'
import ContactForm from '@/components/ContactForm'
import { tours, siteConfig } from '@/lib/tours'

export function generateMetadata(): Metadata {
  return {
    title: 'Contact Casa Venturas | San Juan Puerto Rico',
    description: `Contact Casa Venturas. Email: ${siteConfig.email} · Phone/WhatsApp: ${siteConfig.phone}. Based in San Juan, Puerto Rico. ${siteConfig.hours}.`,
    alternates: { canonical: `${siteConfig.url}/contact` },
    openGraph: {
      title: 'Contact Casa Venturas',
      description: 'Talk to us, not a bot. We respond within the hour.',
      url: `${siteConfig.url}/contact`,
      type: 'website',
    },
  }
}

export default function ContactPage() {
  return (
    <>
      <SchemaOrg />
      <Breadcrumb items={[
        { name: 'Home', url: '/' },
        { name: 'Contact', url: '/contact' },
      ]} />
      <Nav />

      <section className="bg-white pt-[120px] pb-14 px-6 md:px-[52px] border-b border-[#E5E5E5]">
        <p className="text-[10px] font-medium tracking-[0.26em] uppercase text-[#248D6C] mb-4 flex items-center gap-3">
          <span className="inline-block w-7 h-px bg-[#248D6C]" />
          Get in touch
        </p>
        <h1 className="text-[#111] font-light leading-none tracking-tight mb-5 whitespace-pre-line" style={{ fontSize: 'clamp(40px, 6vw, 72px)' }}>
          {`Talk to us,\nnot a bot`}
        </h1>
        <p className="text-[#717170] text-[15px] font-light max-w-md leading-[1.75]">
          Questions about a specific tour, group customizations, or a private event? We typically respond within the hour.
        </p>
      </section>

      <section className="px-6 md:px-12 lg:px-16 xl:px-24 py-16 md:py-24">
        <div className="grid gap-20 lg:grid-cols-2">
          {/* LEFT — info */}
          <div>
            <p className="text-[10px] font-medium tracking-[0.22em] uppercase text-[#248D6C] mb-2">Reach us directly</p>
            <h2 className="text-[#111] text-[32px] font-light tracking-tight mb-5">Contact information</h2>
            <p className="text-[14px] font-light text-[#888] leading-[1.75] mb-7">
              We&apos;re a small team — when you contact us, you speak directly with someone who runs and guides the tours. No call centers, no scripts.
            </p>

            <dl className="border-t border-[#e8e8e8]">
              {[
                { k: 'Email', v: <a href={`mailto:${siteConfig.email}`} className="text-[#248D6C] hover:underline">{siteConfig.email}</a> },
                { k: 'Phone / WhatsApp', v: <a href={siteConfig.whatsapp} target="_blank" rel="noopener noreferrer" className="text-[#248D6C] hover:underline">{siteConfig.phone}</a> },
                { k: 'Based in', v: siteConfig.location },
                { k: 'Hours', v: siteConfig.hours },
                { k: 'Salsa venue', v: '1050 Calle Marianna — Casa Santurce Rooftop, 00907 San Juan' },
                { k: 'Catamaran', v: 'Plaza Mayor, Palmas del Mar, Humacao' },
              ].map(({ k, v }) => (
                <div key={k} className="flex items-start gap-5 py-4 border-b border-[#e8e8e8]">
                  <dt className="text-[9px] font-medium tracking-[0.18em] uppercase text-[#888] min-w-[110px] pt-0.5">{k}</dt>
                  <dd className="text-[14px] font-light text-[#111]">{v}</dd>
                </div>
              ))}
            </dl>

            {/* TripAdvisor proof */}
            <div className="mt-9 p-5 bg-[#E6F3EE] border border-[#B8D9CF] flex items-center gap-5">
              <div className="text-center min-w-[64px]">
                <p className="text-[32px] font-light text-[#111] leading-none">{siteConfig.tripAdvisor.rating.toFixed(1)}</p>
                <p className="text-[10px] font-medium tracking-[0.1em] uppercase text-[#248D6C] mt-1">TripAdvisor</p>
              </div>
              <div>
                <p className="text-[13px] text-[#111] font-medium mb-1">{siteConfig.tripAdvisor.ranking}</p>
                <p className="text-[12px] font-light text-[#888]">
                  {siteConfig.tripAdvisor.reviews.toLocaleString('en-US')} reviews · Likely to sell out ·{' '}
                  <a href={siteConfig.tripAdvisor.url} target="_blank" rel="noopener noreferrer" className="text-[#248D6C] hover:underline">
                    See all →
                  </a>
                </p>
              </div>
            </div>

            {/* Cavi 24/7 */}
            <div className="mt-4 p-5 bg-[#FAFAFA] border border-[#E5E5E5] flex items-start gap-4">
              <span className="w-2 h-2 rounded-full bg-[#248D6C] mt-2 flex-shrink-0 animate-pulse" aria-hidden />
              <div>
                <p className="text-[10px] font-medium tracking-[0.16em] uppercase text-[#248D6C] mb-1.5">Cavi AI — available 24/7</p>
                <p className="text-[13px] font-light text-[#717170] leading-relaxed mb-3">
                  For quick answers about availability, pricing, fitness level, or what to bring — chat with Cavi, our AI guide. Instant response any time.
                </p>
                <Link href="/#booking" className="text-[10px] font-medium tracking-[0.12em] uppercase text-[#248D6C] border-b border-[#248D6C]/40 pb-0.5 hover:border-[#248D6C]">
                  Chat with Cavi →
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT — form */}
          <ContactForm />
        </div>
      </section>

      {/* QUICK LINKS */}
      <section className="bg-[#FAFAFA] border-t border-[#E5E5E5] px-6 md:px-12 lg:px-16 xl:px-24 py-16 md:py-24">
        <p className="text-[10px] font-medium tracking-[0.22em] uppercase text-[#248D6C] mb-6">Ready to book?</p>
        <div className="grid md:grid-cols-3 gap-px bg-[#E5E5E5]">
          {tours.map(t => (
            <Link
              key={t.slug}
              href={`/tours/${t.slug}`}
              className="bg-white hover:bg-[#E6F3EE] transition-colors p-6 block"
            >
              <p className="text-[9px] font-medium tracking-[0.16em] uppercase text-[#248D6C] mb-2">
                {t.category} · ${t.price}
              </p>
              <p className="text-[#111] text-[20px] font-light mb-2.5">{t.shortName === 'Catamaran' ? 'Private Catamaran' : t.name.replace(' Vivid Day Tour', '').replace(' Rooftop', ' Rooftop')}</p>
              <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#1C6E54]">
                Book now →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </>
  )
}
