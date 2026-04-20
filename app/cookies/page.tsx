import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import SchemaOrg from '@/components/SchemaOrg'
import { siteConfig } from '@/lib/tours'

const LAST_UPDATED = '2026-04-20'

export function generateMetadata(): Metadata {
  return {
    title: 'Cookie Policy',
    description: 'How Casa Venturas uses cookies and similar technologies. We do not use analytics or advertising trackers — only strictly necessary cookies and the Bókun booking widget.',
    alternates: { canonical: `${siteConfig.url}/cookies` },
    robots: { index: true, follow: true },
  }
}

export default function CookiesPage() {
  return (
    <>
      <SchemaOrg webPage={{ path: '/cookies', name: 'Cookie Policy · Casa Venturas', dateModified: LAST_UPDATED }} />
      <Breadcrumb items={[
        { name: 'Home', url: '/' },
        { name: 'Cookie Policy', url: '/cookies' },
      ]} />
      <Nav />

      <main>
        <section className="bg-white pt-[120px] pb-14 px-6 md:px-[52px] border-b border-[#E5E5E5]">
          <p className="text-[10px] font-medium tracking-[0.26em] uppercase text-[#248D6C] mb-4 flex items-center gap-3">
            <span className="inline-block w-7 h-px bg-[#248D6C]" />
            Legal
          </p>
          <h1 className="text-[#111] font-light leading-none tracking-tight mb-5" style={{ fontSize: 'clamp(40px, 6vw, 72px)' }}>
            Cookie Policy
          </h1>
          <p className="text-[#717170] text-[14px] font-light max-w-md leading-[1.75]">
            Last updated: {LAST_UPDATED}. Short version: we don&apos;t track you. No analytics, no advertising cookies.
          </p>
        </section>

        <section className="px-6 md:px-12 lg:px-16 xl:px-24 py-16 md:py-24 max-w-[860px]">
          <p className="text-[14px] font-light text-[#4F4F4E] leading-[1.85] mb-10">
            This Cookie Policy explains how Casa Venturas and its third-party service providers use cookies and
            similar technologies when you visit {siteConfig.url}. It complements our{' '}
            <Link href="/privacy" className="text-[#248D6C] hover:underline">Privacy Policy</Link>.
          </p>

          <Section n="1" title="What cookies are">
            Cookies are small text files stored on your device by your browser when you visit a website. They let a
            site remember information across pages or sessions — a login token, a language choice, a booking step.
            Similar technologies include localStorage, sessionStorage, and pixels; we treat all of them the same way
            for the purposes of this policy.
          </Section>

          <Section n="2" title="Cookies we set directly">
            <strong>None for marketing or analytics.</strong> We do not run Google Analytics, Google Ads, Meta Pixel,
            or any cross-site tracking technology on this website. The only first-party storage we use is browser
            <em> localStorage </em>to remember your in-session chat with Cavi (our AI guide) so you don&apos;t lose
            context when you scroll — cleared automatically when you close the tab.
          </Section>

          <Section n="3" title="Strictly necessary cookies (set by our hosting provider)">
            Cloudflare, which hosts and protects {siteConfig.url}, may set a small number of strictly necessary
            cookies such as <code className="bg-[#F5F5F5] px-1.5 py-0.5 text-[12px]">__cf_bm</code> (bot
            mitigation) and <code className="bg-[#F5F5F5] px-1.5 py-0.5 text-[12px]">cf_clearance</code> (anti-abuse).
            These exist purely for security and site integrity. They do not identify you personally, do not track
            you across other websites, and they cannot be disabled without breaking the site.
          </Section>

          <Section n="4" title="Third-party cookies (booking partner)">
            When you interact with a booking widget, a checkout modal, or an availability calendar on our tour pages,
            the widget is served by Bókun (a TripAdvisor company) from <code className="bg-[#F5F5F5] px-1.5 py-0.5 text-[12px]">widgets.bokun.io</code>.
            Bókun may set cookies on its own domain to remember your selected date, guest count, and checkout
            session. These cookies are governed by Bókun&apos;s own privacy and cookie policies, not ours. We
            receive no persistent identifier from Bókun beyond the booking reference itself.
          </Section>

          <Section n="5" title="What we don&apos;t use">
            <ul className="list-disc pl-5 space-y-2">
              <li>No Google Analytics, no Google Tag Manager, no Google Ads.</li>
              <li>No Meta Pixel, no Facebook tracking.</li>
              <li>No advertising networks, no retargeting cookies.</li>
              <li>No session recording (Hotjar, FullStory, etc.).</li>
              <li>No cross-site tracking of any kind.</li>
            </ul>
          </Section>

          <Section n="6" title="Your choices">
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Browser settings</strong>: every modern browser lets you block or delete cookies per site.
                Because we don&apos;t rely on first-party cookies for core functionality, blocking them does not
                break the site.
              </li>
              <li>
                <strong>Do Not Track (DNT)</strong>: we honor the DNT signal. Since we already run no cross-site
                tracking, DNT is effectively always-on for our first-party data.
              </li>
              <li>
                <strong>Global Privacy Control (GPC)</strong>: we respect GPC signals and treat them as a valid
                opt-out for California residents under CCPA / CPRA.
              </li>
              <li>
                <strong>Third-party Bókun cookies</strong>: to block these, you can either avoid interacting with
                booking widgets, or configure your browser to block third-party cookies globally.
              </li>
            </ul>
          </Section>

          <Section n="7" title="EU / EEA / UK residents">
            For visitors from the European Economic Area, the United Kingdom, or Switzerland: only{' '}
            <em>strictly necessary</em> cookies (Cloudflare security) are set without consent. Third-party Bókun
            cookies are set only when you actively interact with a booking widget — treated as consent by action
            under the ePrivacy Directive. You may withdraw consent at any time via your browser settings.
          </Section>

          <Section n="8" title="Applicable law">
            This policy is designed to comply with:
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>Puerto Rico Act 39 (Privacy Policy Notification) and Act 111-2005 (data security).</li>
              <li>California Online Privacy Protection Act (CalOPPA) and CCPA / CPRA.</li>
              <li>EU ePrivacy Directive (Article 5.3) and GDPR for EEA residents.</li>
              <li>UK Privacy and Electronic Communications Regulations (PECR).</li>
            </ul>
          </Section>

          <Section n="9" title="Changes to this policy">
            We may update this policy from time to time, typically when we add or remove a service that sets
            cookies. The &quot;Last updated&quot; date at the top reflects the most recent revision. For material
            changes that introduce new cookie categories (for example if we ever enable analytics), we will post a
            notice and, where required, ask for your consent before activation.
          </Section>

          <Section n="10" title="Contact">
            Questions about cookies or this policy:
            <br />
            Casa Venturas · San Juan, Puerto Rico
            <br />
            <a href={`mailto:${siteConfig.email}`} className="text-[#248D6C] hover:underline">{siteConfig.email}</a> · {siteConfig.phone}
          </Section>

          <div className="mt-14 pt-8 border-t border-[#E5E5E5] flex flex-wrap gap-6 text-[11px] font-medium tracking-[0.16em] uppercase">
            <Link href="/privacy" className="text-[#248D6C] hover:underline">Privacy Policy →</Link>
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
