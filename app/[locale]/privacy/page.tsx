import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import SchemaOrg from '@/components/SchemaOrg'
import { siteConfig } from '@/lib/tours'

const LAST_UPDATED = '2026-04-18'

export function generateMetadata(): Metadata {
  const description = 'How Casa Venturas collects, uses, and protects your personal information. Compliant with Puerto Rico Act 39, Act 111-2005, CalOPPA, and GDPR.'
  return {
    title: 'Privacy Policy',
    description,
    alternates: { canonical: `${siteConfig.url}/privacy` },
    robots: { index: true, follow: true },
    openGraph: {
      title: 'Privacy Policy · Casa Venturas',
      description,
      url: `${siteConfig.url}/privacy`,
      type: 'website',
    },
  }
}

export default function PrivacyPage() {
  return (
    <>
      <SchemaOrg webPage={{ path: '/privacy', name: 'Privacy Policy · Casa Venturas', dateModified: LAST_UPDATED }} />
      <Breadcrumb items={[
        { name: 'Home', url: '/' },
        { name: 'Privacy Policy', url: '/privacy' },
      ]} />
      <Nav />

      <main>
        <section className="bg-white pt-[120px] pb-14 px-6 md:px-[52px] border-b border-[#E5E5E5]">
          <p className="text-[10px] font-medium tracking-[0.26em] uppercase text-[#248D6C] mb-4 flex items-center gap-3">
            <span className="inline-block w-7 h-px bg-[#248D6C]" />
            Legal
          </p>
          <h1 className="text-[#111] font-light leading-none tracking-tight mb-5" style={{ fontSize: 'clamp(40px, 6vw, 72px)' }}>
            Privacy Policy
          </h1>
          <p className="text-[#717170] text-[14px] font-light max-w-md leading-[1.75]">
            Last updated: {LAST_UPDATED}. We keep data handling simple, minimal, and transparent.
          </p>
        </section>

        <section className="px-6 md:px-12 lg:px-16 xl:px-24 py-16 md:py-24 max-w-[860px]">
          <p className="text-[14px] font-light text-[#4F4F4E] leading-[1.85] mb-10">
            Casa Venturas (&quot;we&quot;, &quot;us&quot;) operates {siteConfig.url} and provides small-group
            tours in Puerto Rico. This policy explains what personal information we collect, why, how we protect
            it, and the rights you have. It is designed to comply with Puerto Rico Act 39 (Privacy Policy Notification)
            and Act 111-2005 (Citizen Information on Data Banks Security Act), the California Online Privacy
            Protection Act (CalOPPA), and the EU General Data Protection Regulation (GDPR) for visitors from the
            European Economic Area.
          </p>

          <Section n="1" title="Who we are">
            Casa Venturas — San Juan, Puerto Rico · {siteConfig.email} · {siteConfig.phone}.
            We are the data controller for information collected through this website.
          </Section>

          <Section n="2" title="Information we collect">
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Booking information</strong>: name, email, phone, tour date, number of guests. Submitted via our booking form and processed through Bókun (our booking engine).</li>
              <li><strong>Contact form</strong>: name, email, message.</li>
              <li><strong>Chat with Cavi (AI guide)</strong>: the content of your conversation, processed by Anthropic (Claude API) to generate responses. Transcripts are retained for up to 90 days for quality review, then deleted.</li>
              <li><strong>Technical data</strong>: IP address, browser type, pages visited. Collected automatically by our hosting provider (Cloudflare) for security and performance.</li>
            </ul>
            <p className="mt-4">We do <strong>not</strong> sell your personal information. We do not use advertising cookies or cross-site trackers.</p>
          </Section>

          <Section n="3" title="Why we collect it (legal basis)">
            <ul className="list-disc pl-5 space-y-2">
              <li>To confirm and operate your tour (performance of contract — GDPR Art. 6(1)(b)).</li>
              <li>To answer questions sent via our contact form or chat (legitimate interest).</li>
              <li>To comply with Puerto Rico tax and tourism regulations (legal obligation).</li>
              <li>To protect the site against fraud and abuse (legitimate interest).</li>
            </ul>
          </Section>

          <Section n="4" title="Who we share it with (processors)">
            We rely on a small number of trusted service providers that process data strictly on our instructions:
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li><strong>Bókun</strong> (a TripAdvisor company) — booking engine and payment processing (PCI-DSS compliant). Bókun acts as data processor under a signed Data Processing Agreement.</li>
              <li><strong>Anthropic, PBC</strong> — Claude API powering our Cavi chat assistant. Anthropic does not train on customer data.</li>
              <li><strong>Resend</strong> — transactional email delivery (booking confirmations, replies to contact messages).</li>
              <li><strong>Cloudflare</strong> — website hosting, CDN, and DDoS protection.</li>
            </ul>
            <p className="mt-4">
              If you book one of our tours through a third-party platform such as Viator, TripAdvisor Experiences,
              GetYourGuide, or Airbnb Experiences, that platform is the data controller for your booking data.
              Their own privacy policies apply to those transactions — we only receive the information we need to
              operate the tour.
            </p>
          </Section>

          <Section n="5" title="How long we keep it">
            <ul className="list-disc pl-5 space-y-2">
              <li>Booking records: 7 years (US tax retention requirement).</li>
              <li>Contact form messages: up to 2 years.</li>
              <li>Chat transcripts: up to 90 days.</li>
              <li>Server logs: up to 30 days.</li>
            </ul>
          </Section>

          <Section n="6" title="Your rights">
            You have the right to:
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>Access the personal information we hold about you.</li>
              <li>Ask us to correct or delete it.</li>
              <li>Opt out of any future marketing messages (we do not currently send any).</li>
              <li>Receive your data in a portable format (GDPR Art. 20).</li>
              <li>Lodge a complaint with a data protection authority (e.g. Puerto Rico DACO, or your local EU authority).</li>
            </ul>
            <p className="mt-4">
              To exercise any of these rights, email <a href={`mailto:${siteConfig.email}`} className="text-[#248D6C] hover:underline">{siteConfig.email}</a>.
              We respond within 30 days. California residents may request a &quot;Do Not Sell or Share&quot; opt-out;
              note that we do not sell or share personal information for advertising purposes.
            </p>
            <p className="mt-3">
              We honor &quot;Do Not Track&quot; browser signals: we do not use cross-site tracking cookies, so no
              additional action is taken beyond our baseline minimal collection.
            </p>
          </Section>

          <Section n="7" title="Data security and breach notification">
            All data is transmitted over HTTPS and stored in encrypted form by our processors. In the event of a
            security breach affecting personal information of Puerto Rico residents, we will notify affected
            individuals and the Puerto Rico Department of Consumer Affairs (DACO) within ten (10) days from the
            detection of the breach, as required by Act 111-2005. For EU residents, we will also notify the
            relevant supervisory authority within 72 hours as required by GDPR Art. 33.
          </Section>

          <Section n="8" title="International transfers">
            Some of our processors (Bókun, Anthropic, Resend, Cloudflare) are based in the United States. If you
            are located in the European Economic Area, the United Kingdom, or Switzerland, your data may be
            transferred to and processed in the US under Standard Contractual Clauses (SCCs) approved by the
            European Commission.
          </Section>

          <Section n="9" title="Children">
            Our services are not directed to children under 13. We do not knowingly collect personal information
            from children under 13 (COPPA, 15 U.S.C. §§ 6501–6506). Tours that welcome children (El Yunque,
            Catamaran) require a parent or legal guardian to book and accompany the minor.
          </Section>

          <Section n="10" title="Changes to this policy">
            We may update this policy from time to time. The &quot;Last updated&quot; date at the top reflects the
            most recent revision. For material changes, we will post a notice on this page at least 30 days before
            the change takes effect.
          </Section>

          <Section n="11" title="Contact">
            Questions about this policy or your personal information:
            <br />
            Casa Venturas · San Juan, Puerto Rico
            <br />
            <a href={`mailto:${siteConfig.email}`} className="text-[#248D6C] hover:underline">{siteConfig.email}</a> · {siteConfig.phone}
          </Section>

          <div className="mt-14 pt-8 border-t border-[#E5E5E5] flex flex-wrap gap-6 text-[11px] font-medium tracking-[0.16em] uppercase">
            <Link href="/terms" className="text-[#248D6C] hover:underline">Terms of Service →</Link>
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
