import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import SchemaOrg from '@/components/SchemaOrg'
import { siteConfig } from '@/lib/tours'

const LAST_UPDATED = '2026-04-18'

export function generateMetadata(): Metadata {
  const description = 'Terms and conditions for booking tours directly on casaventuras.com. Cancellation policy, liability, conduct, and governing law (Commonwealth of Puerto Rico).'
  return {
    title: 'Terms of Service',
    description,
    alternates: { canonical: `${siteConfig.url}/terms` },
    robots: { index: true, follow: true },
    openGraph: {
      title: 'Terms of Service · Casa Venturas',
      description,
      url: `${siteConfig.url}/terms`,
      type: 'website',
    },
  }
}

export default function TermsPage() {
  return (
    <>
      <SchemaOrg webPage={{ path: '/terms', name: 'Terms of Service · Casa Venturas', dateModified: LAST_UPDATED }} />
      <Breadcrumb items={[
        { name: 'Home', url: '/' },
        { name: 'Terms of Service', url: '/terms' },
      ]} />
      <Nav />

      <main>
        <section className="bg-white pt-[120px] pb-14 px-6 md:px-[52px] border-b border-[#E5E5E5]">
          <p className="text-[10px] font-medium tracking-[0.26em] uppercase text-[#248D6C] mb-4 flex items-center gap-3">
            <span className="inline-block w-7 h-px bg-[#248D6C]" />
            Legal
          </p>
          <h1 className="text-[#111] font-light leading-none tracking-tight mb-5" style={{ fontSize: 'clamp(40px, 6vw, 72px)' }}>
            Terms of Service
          </h1>
          <p className="text-[#717170] text-[14px] font-light max-w-md leading-[1.75]">
            Last updated: {LAST_UPDATED}. Please read before booking.
          </p>
        </section>

        <section className="px-6 md:px-12 lg:px-16 xl:px-24 py-16 md:py-24 max-w-[860px]">
          <p className="text-[14px] font-light text-[#4F4F4E] leading-[1.85] mb-10">
            These Terms of Service (&quot;Terms&quot;) govern your use of {siteConfig.url} and any tour you book
            directly through this website. By booking a tour or submitting a request through our site, you agree
            to be bound by these Terms. If you do not agree, please do not book.
          </p>

          <Section n="1" title="Scope and booking channels">
            These Terms apply exclusively to bookings made directly on {siteConfig.url}. Bookings made through
            third-party platforms such as Viator, TripAdvisor Experiences, GetYourGuide, or Airbnb Experiences are
            governed by the terms and conditions of those respective platforms. However, the on-site rules covering
            safety, conduct, liability, and tour execution (sections 5, 7, and 8 below) apply to <strong>all guests</strong>,
            regardless of the booking channel.
          </Section>

          <Section n="2" title="The operator">
            The tours are operated by Casa Venturas, based in San Juan, Puerto Rico. Contact:{' '}
            <a href={`mailto:${siteConfig.email}`} className="text-[#248D6C] hover:underline">{siteConfig.email}</a> · {siteConfig.phone}.
          </Section>

          <Section n="3" title="Booking and payment">
            Direct bookings on this site are processed through Bókun, our booking engine and PCI-DSS compliant
            payment processor (a TripAdvisor company). Payment is required to confirm a reservation. Prices are
            displayed in US dollars and include all taxes applicable under Puerto Rico law unless stated otherwise.
            Tour descriptions, photos, and highlights are illustrative; actual conditions (weather, water level,
            wildlife sightings) vary and do not constitute grounds for refund unless the tour itself is cancelled.
          </Section>

          <Section n="4" title="Cancellation and changes">
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Free cancellation</strong> up to 24 hours before the scheduled tour start time — full refund.</li>
              <li><strong>Within 24 hours</strong> of start time: no refund, but rescheduling may be possible subject to availability.</li>
              <li><strong>No-show</strong>: no refund.</li>
              <li><strong>We cancel</strong>: if we cancel the tour (unsafe weather, sea conditions, or force majeure), you receive a full refund or a free reschedule at your option.</li>
            </ul>
            <p className="mt-4">
              Refunds are issued to the original payment method within 10 business days.
            </p>
          </Section>

          <Section n="5" title="Assumption of risk and liability">
            Our tours involve physical activity in natural outdoor environments and carry inherent risks, including
            but not limited to:
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li><strong>El Yunque</strong>: slippery trails, river currents, cliff jumps from 5 to 20 feet, wildlife encounters, variable weather.</li>
              <li><strong>Catamaran to Vieques</strong>: open-water sailing, swimming, snorkeling, sun exposure, motion sickness.</li>
              <li><strong>Salsa Rooftop</strong>: physical exertion, dance floor conditions.</li>
            </ul>
            <p className="mt-4">
              By participating, you acknowledge and voluntarily assume these risks. You confirm that you and every
              guest in your party are in adequate physical condition to participate. To the maximum extent permitted
              by the laws of the Commonwealth of Puerto Rico, Casa Venturas, its guides, contractors, and partners
              shall not be liable for any injury, illness, loss, or damage arising from participation, except in
              cases of gross negligence or willful misconduct on our part. Activity-specific waivers may be required
              to be signed on site before the tour begins.
            </p>
          </Section>

          <Section n="6" title="Minors">
            Guests under 18 must be accompanied by a parent or legal guardian, who is responsible for the minor
            throughout the tour. The El Yunque and Catamaran tours welcome children aged 5 and up; Salsa Rooftop is
            18+ (alcohol is served). The booking guardian expressly consents on behalf of any minor in the party to
            these Terms, including the assumption of risk in section 5.
          </Section>

          <Section n="7" title="Weather and force majeure">
            Tours run rain or shine. The captain (catamaran) or lead guide (El Yunque, Salsa) has sole discretion to
            cancel, shorten, or modify any tour for safety reasons — including but not limited to tropical storms,
            hurricanes, high swell, flash flooding, wildfire, pandemic restrictions, and acts of government. Such
            cases qualify under section 4 for a full refund or a reschedule.
          </Section>

          <Section n="8" title="Conduct">
            We reserve the right to refuse service to, or remove from the tour without refund, any guest who:
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>Is visibly intoxicated or under the influence of drugs at the start of the tour.</li>
              <li>Behaves in a manner that endangers themselves, other guests, guides, or the environment.</li>
              <li>Harasses or threatens any guide, guest, or third party.</li>
              <li>Refuses to follow safety instructions from the guide or captain.</li>
            </ul>
          </Section>

          <Section n="9" title="Photos and video">
            Our guides may take photos and video during tours for marketing and social media use. If you prefer not
            to appear, tell your guide before the tour starts — we will accommodate your request. You retain all
            rights to photos and videos you take yourself; we ask that you tag <strong>@casaventuras</strong> if
            sharing publicly.
          </Section>

          <Section n="10" title="Insurance">
            Travel insurance is strongly recommended. Casa Venturas maintains the liability coverage required under
            Puerto Rico law but is not liable for personal belongings lost or damaged during the tour, nor for
            medical expenses arising from participation.
          </Section>

          <Section n="11" title="Intellectual property">
            All content on {siteConfig.url} (text, images, video, logo, tour descriptions) is the property of Casa
            Venturas or used with permission. You may not reproduce, republish, or use it commercially without our
            prior written consent.
          </Section>

          <Section n="12" title="Governing law and venue">
            These Terms are governed by the laws of the Commonwealth of Puerto Rico, without regard to conflict of
            law principles. Any dispute arising from or relating to these Terms or a tour booking shall be brought
            exclusively before the courts of San Juan, Puerto Rico. For consumers residing in the European Union,
            this choice of venue does not deprive you of the protection of mandatory consumer law in your country
            of residence.
          </Section>

          <Section n="13" title="Changes to these Terms">
            We may update these Terms from time to time. The &quot;Last updated&quot; date at the top reflects the
            most recent revision. Bookings are subject to the Terms in effect at the time of booking.
          </Section>

          <Section n="14" title="Contact">
            Questions about these Terms:
            <br />
            Casa Venturas · San Juan, Puerto Rico
            <br />
            <a href={`mailto:${siteConfig.email}`} className="text-[#248D6C] hover:underline">{siteConfig.email}</a> · {siteConfig.phone}
          </Section>

          <div className="mt-14 pt-8 border-t border-[#E5E5E5] flex flex-wrap gap-6 text-[11px] font-medium tracking-[0.16em] uppercase">
            <Link href="/privacy" className="text-[#248D6C] hover:underline">Privacy Policy →</Link>
            <Link href="/contact" className="text-[#248D6C] hover:underline">Contact →</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-[#111] text-[22px] md:text-[26px] font-light tracking-tight mb-4">
        <span className="text-[#248D6C] font-medium mr-3">{n}.</span>{title}
      </h2>
      <div className="text-[14px] font-light text-[#4F4F4E] leading-[1.85]">{children}</div>
    </section>
  )
}
