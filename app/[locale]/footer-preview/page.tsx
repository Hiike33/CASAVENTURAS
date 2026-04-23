import Link from 'next/link'
import { siteConfig, tours } from '@/lib/tours'

// DEV-ONLY preview page — 3 candidate footer variants rendered with real
// Casa Venturas data. NOT linked from the site nav. Remove once a variant
// is chosen and ported into `components/Footer.tsx`.

export default function FooterPreview() {
  return (
    <main className="bg-white">
      {/* TOC */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E5E5E5] px-6 py-4">
        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
          <span className="text-[10px] font-medium tracking-[0.18em] uppercase text-[#248D6C] mr-3">Footer preview</span>
          {[
            { id: 'v1', label: 'A · Editorial Minimal' },
            { id: 'v2', label: 'B · Magazine Columns' },
            { id: 'v3', label: 'C · Large Brand + Rich' },
          ].map(t => (
            <a
              key={t.id}
              href={`#${t.id}`}
              className="text-[10px] font-medium tracking-[0.14em] uppercase text-[#4F4F4E] hover:text-[#248D6C] border border-[#E5E5E5] hover:border-[#248D6C] px-3 py-1.5 transition-colors"
            >
              {t.label}
            </a>
          ))}
          <Link href="/" className="ml-auto text-[10px] font-medium tracking-[0.14em] uppercase text-[#888] hover:text-[#248D6C] transition-colors">
            ← Back to site
          </Link>
        </div>
      </nav>

      {/* INTRO */}
      <section className="px-6 md:px-12 pt-16 pb-10 max-w-[900px]">
        <p className="text-[10px] font-medium tracking-[0.26em] uppercase text-[#248D6C] mb-4">Design exploration</p>
        <h1 className="text-[clamp(36px,5vw,56px)] font-light text-[#111] tracking-tight leading-[1.05] mb-6">
          3 footer variants
        </h1>
        <p className="text-[15px] font-light text-[#4F4F4E] leading-[1.75] max-w-[620px]">
          All three keep the LIGHT-first palette, reclaim Privacy/Terms as a proper legal bottom-bar
          (not glued to the copyright), and add breathing room. Scroll to compare — each variant is
          rendered at its real width with real data.
        </p>
      </section>

      {/* ========== VARIANT A — EDITORIAL MINIMAL ========== */}
      <PreviewFrame
        id="v1"
        num="A"
        name="Editorial Minimal"
        pros="Ultra-sparse, centered, luxury refinement. Feels like Aesop, Aman. Fewest clicks, most intention."
        cons="Needs quality micro-copy to fill the space — weak if the brand tagline is flat."
      >
        <FooterA />
      </PreviewFrame>

      {/* ========== VARIANT B — MAGAZINE COLUMNS ========== */}
      <PreviewFrame
        id="v2"
        num="B"
        name="Magazine Columns"
        pros="4 columns of dense, scannable info + newsletter inline. Best for SEO (lots of deep links), best for discovery. Mr & Mrs Smith style."
        cons="Busiest of the three. Can feel corporate if typography isn't light enough."
      >
        <FooterB />
      </PreviewFrame>

      {/* ========== VARIANT C — LARGE BRAND + RICH ========== */}
      <PreviewFrame
        id="v3"
        num="C"
        name="Large Brand + Rich Nav"
        pros="Big brand statement on top, detailed experience list with prices below. Converts stragglers into bookings from the footer itself. Aman / Canopy & Stars hybrid."
        cons="Tallest footer of the three (adds ~200px scroll)."
      >
        <FooterC />
      </PreviewFrame>

      {/* FOOT */}
      <section className="px-6 md:px-12 py-16 max-w-[900px] border-t border-[#E5E5E5] mt-20">
        <p className="text-[10px] font-medium tracking-[0.22em] uppercase text-[#248D6C] mb-3">Next step</p>
        <h2 className="text-[28px] font-light text-[#111] tracking-tight mb-4">Pick one</h2>
        <p className="text-[14px] font-light text-[#4F4F4E] leading-[1.75] max-w-[620px]">
          Tell me A, B, or C. I&apos;ll port into <code className="bg-[#F5F5F5] px-1.5 py-0.5 text-[12px]">components/Footer.tsx</code>.
          Newsletter signup is scaffolded but non-functional in this preview — if picked, I&apos;ll wire it to Resend (same pattern as contact form).
        </p>
      </section>
    </main>
  )
}

function PreviewFrame({
  id, num, name, pros, cons, children,
}: {
  id: string
  num: string
  name: string
  pros: string
  cons: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-[#E5E5E5]">
      <div className="px-6 md:px-12 py-16 max-w-[900px]">
        <div className="flex items-baseline gap-5 mb-5">
          <span className="text-[64px] font-light text-[#248D6C] leading-none">{num}</span>
          <h2 className="text-[32px] font-light text-[#111] tracking-tight">{name}</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4 text-[13px] font-light text-[#4F4F4E] leading-[1.75] max-w-[720px] mb-10">
          <p><strong className="text-[#1C6E54] font-medium">Pro:</strong> {pros}</p>
          <p><strong className="text-[#888] font-medium">Con:</strong> {cons}</p>
        </div>
      </div>
      <div className="bg-[#FAFAFA]">{children}</div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────
// Variant A — Editorial Minimal (ultra-sparse, centered)
// ─────────────────────────────────────────────────────────
function FooterA() {
  return (
    <footer className="bg-white">
      <div className="px-6 md:px-12 py-24 md:py-32 text-center max-w-[900px] mx-auto">
        <div className="text-[22px] font-semibold tracking-[0.32em] uppercase text-[#111] mb-5">
          {siteConfig.name}
        </div>
        <p className="text-[13px] font-light text-[#717170] mb-12 max-w-[420px] mx-auto leading-[1.8]">
          {siteConfig.tagline}
        </p>

        <ul className="flex flex-wrap justify-center gap-x-10 gap-y-3 mb-14">
          {[
            { label: 'Experiences', href: '/#tours' },
            { label: 'Contact', href: '/contact' },
            { label: 'TripAdvisor', href: siteConfig.tripAdvisor.url, external: true },
          ].map(l => (
            <li key={l.href}>
              <Link
                href={l.href}
                {...(l.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="text-[10px] font-medium tracking-[0.22em] uppercase text-[#4F4F4E] hover:text-[#248D6C] transition-colors"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex flex-col items-center gap-2 text-[12px] font-light text-[#888] mb-12">
          <a href={`mailto:${siteConfig.email}`} className="hover:text-[#248D6C]">{siteConfig.email}</a>
          <a href={siteConfig.whatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-[#248D6C]">{siteConfig.phone}</a>
          <span>{siteConfig.location}</span>
        </div>

        {/* Newsletter — scaffold, non-functional in preview */}
        <form className="max-w-[380px] mx-auto mb-4">
          <label htmlFor="nl-a" className="block text-[9px] font-medium tracking-[0.22em] uppercase text-[#248D6C] mb-3">
            Stay in the know
          </label>
          <div className="flex border-b border-[#E5E5E5] focus-within:border-[#248D6C] transition-colors">
            <input
              id="nl-a"
              type="email"
              placeholder="your email"
              className="flex-1 bg-transparent py-2.5 px-0 text-[13px] font-light text-[#111] placeholder:text-[#aaa] border-none outline-none"
            />
            <button type="submit" className="text-[10px] font-medium tracking-[0.14em] uppercase text-[#248D6C] hover:text-[#1C6E54] px-3">
              →
            </button>
          </div>
        </form>
      </div>

      {/* Bottom legal bar — distinct from the brand area */}
      <div className="border-t border-[#E5E5E5] px-6 md:px-12 py-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 max-w-[1280px] mx-auto">
          <p className="text-[10px] tracking-[0.08em] text-[#888]">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <ul className="flex gap-5">
            {[
              { label: 'Privacy', href: '/privacy' },
              { label: 'Terms', href: '/terms' },
              { label: 'Cookies', href: '/privacy#cookies' },
            ].map(l => (
              <li key={l.href}>
                <Link href={l.href} className="text-[10px] font-medium tracking-[0.16em] uppercase text-[#4F4F4E] hover:text-[#248D6C]">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-[9.5px] tracking-[0.08em] text-[#aaa]">
            Crafted by KWS Studio
          </p>
        </div>
      </div>
    </footer>
  )
}

// ─────────────────────────────────────────────────────────
// Variant B — Magazine Columns (4-col classic)
// ─────────────────────────────────────────────────────────
function FooterB() {
  return (
    <footer className="bg-white">
      <div className="px-6 md:px-12 py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-10 mb-14 max-w-[1280px] mx-auto">
          {/* Col 1 — Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="text-[13px] font-semibold tracking-[0.26em] uppercase text-[#111] mb-4">
              {siteConfig.name}
            </div>
            <p className="text-[12px] font-light text-[#717170] leading-[1.75] max-w-[220px]">
              {siteConfig.tagline}
            </p>
            <p className="text-[11px] font-light text-[#888] mt-4">{siteConfig.location}</p>
          </div>

          {/* Col 2 — Experiences */}
          <div>
            <p className="text-[9px] font-medium tracking-[0.22em] uppercase text-[#248D6C] mb-4">
              Experiences
            </p>
            <ul className="space-y-2.5">
              {tours.map(t => (
                <li key={t.slug}>
                  <Link
                    href={`/tours/${t.slug}`}
                    className="text-[12px] font-light text-[#4F4F4E] hover:text-[#248D6C] transition-colors"
                  >
                    {t.shortName} · ${t.price}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/#tours" className="text-[11px] font-medium tracking-[0.14em] uppercase text-[#248D6C] hover:text-[#1C6E54]">
                  All →
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 — Connect */}
          <div>
            <p className="text-[9px] font-medium tracking-[0.22em] uppercase text-[#248D6C] mb-4">
              Connect
            </p>
            <ul className="space-y-2.5 text-[12px] font-light">
              <li><a href={`mailto:${siteConfig.email}`} className="text-[#4F4F4E] hover:text-[#248D6C]">{siteConfig.email}</a></li>
              <li><a href={siteConfig.whatsapp} target="_blank" rel="noopener noreferrer" className="text-[#4F4F4E] hover:text-[#248D6C]">{siteConfig.phone}</a></li>
              <li>
                <a href={siteConfig.tripAdvisor.url} target="_blank" rel="noopener noreferrer" className="text-[#4F4F4E] hover:text-[#248D6C]">
                  TripAdvisor · 5.0★
                </a>
              </li>
              <li className="text-[#888] text-[11px] pt-2">{siteConfig.hours}</li>
            </ul>
          </div>

          {/* Col 4 — Newsletter */}
          <div className="col-span-2 md:col-span-1">
            <p className="text-[9px] font-medium tracking-[0.22em] uppercase text-[#248D6C] mb-4">
              Stay in the know
            </p>
            <p className="text-[12px] font-light text-[#4F4F4E] leading-[1.7] mb-4 max-w-[240px]">
              Seasonal drops, new experiences, and Puerto Rico stories. Once a month, never more.
            </p>
            <form className="flex items-center border-b border-[#E5E5E5] focus-within:border-[#248D6C] transition-colors max-w-[260px]">
              <input
                type="email"
                placeholder="your email"
                className="flex-1 bg-transparent py-2 text-[12px] font-light text-[#111] placeholder:text-[#aaa] outline-none"
              />
              <button type="submit" className="text-[10px] font-medium tracking-[0.14em] uppercase text-[#248D6C] hover:text-[#1C6E54] px-2">
                →
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom legal bar */}
      <div className="border-t border-[#E5E5E5] px-6 md:px-12 py-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 max-w-[1280px] mx-auto">
          <p className="text-[10px] tracking-[0.08em] text-[#888]">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <ul className="flex gap-5">
            {[
              { label: 'Privacy', href: '/privacy' },
              { label: 'Terms', href: '/terms' },
              { label: 'Cookies', href: '/privacy#cookies' },
            ].map(l => (
              <li key={l.href}>
                <Link href={l.href} className="text-[10px] font-medium tracking-[0.16em] uppercase text-[#4F4F4E] hover:text-[#248D6C]">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-[9.5px] tracking-[0.08em] text-[#aaa]">
            Crafted by KWS Studio
          </p>
        </div>
      </div>
    </footer>
  )
}

// ─────────────────────────────────────────────────────────
// Variant C — Large Brand + Rich Nav (Aman-like)
// ─────────────────────────────────────────────────────────
function FooterC() {
  return (
    <footer className="bg-white">
      {/* Top — massive brand */}
      <div className="px-6 md:px-12 pt-24 pb-16 text-center border-b border-[#E5E5E5]">
        <h3 className="text-[clamp(48px,8vw,108px)] font-light tracking-[-0.02em] text-[#111] leading-[0.95] mb-4">
          {siteConfig.name}
        </h3>
        <p className="text-[13px] font-light text-[#717170] tracking-[0.12em] uppercase">
          Real Puerto Rico · Small groups · Local guides
        </p>
      </div>

      {/* Middle — 2 columns with detail */}
      <div className="px-6 md:px-12 py-16 md:py-20 max-w-[1280px] mx-auto">
        <div className="grid md:grid-cols-2 gap-14 md:gap-20">
          {/* Experiences detailed */}
          <div>
            <p className="text-[9px] font-medium tracking-[0.24em] uppercase text-[#248D6C] mb-6">Experiences</p>
            <ul className="space-y-4">
              {tours.map(t => (
                <li key={t.slug}>
                  <Link href={`/tours/${t.slug}`} className="group flex items-baseline justify-between gap-6 border-b border-[#E5E5E5] pb-3 hover:border-[#248D6C] transition-colors">
                    <div>
                      <p className="text-[16px] font-light text-[#111] group-hover:text-[#248D6C] transition-colors leading-tight">{t.name}</p>
                      <p className="text-[10px] tracking-[0.16em] uppercase text-[#888] mt-1">{t.category}</p>
                    </div>
                    <p className="text-[14px] font-medium text-[#1C6E54] whitespace-nowrap">${t.price}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Right — connect + newsletter */}
          <div className="grid gap-10">
            <div>
              <p className="text-[9px] font-medium tracking-[0.24em] uppercase text-[#248D6C] mb-6">Connect</p>
              <ul className="space-y-3 text-[13px] font-light">
                <li>
                  <span className="text-[9px] tracking-[0.18em] uppercase text-[#888] mr-3">Email</span>
                  <a href={`mailto:${siteConfig.email}`} className="text-[#111] hover:text-[#248D6C]">{siteConfig.email}</a>
                </li>
                <li>
                  <span className="text-[9px] tracking-[0.18em] uppercase text-[#888] mr-3">WhatsApp</span>
                  <a href={siteConfig.whatsapp} target="_blank" rel="noopener noreferrer" className="text-[#111] hover:text-[#248D6C]">{siteConfig.phone}</a>
                </li>
                <li>
                  <span className="text-[9px] tracking-[0.18em] uppercase text-[#888] mr-3">Based in</span>
                  <span className="text-[#111]">{siteConfig.location}</span>
                </li>
                <li>
                  <span className="text-[9px] tracking-[0.18em] uppercase text-[#888] mr-3">Hours</span>
                  <span className="text-[#111]">{siteConfig.hours}</span>
                </li>
              </ul>

              {/* TripAdvisor mini-card */}
              <a
                href={siteConfig.tripAdvisor.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-4 mt-6 p-4 bg-[#E6F3EE] border border-[#B8D9CF] hover:border-[#248D6C] transition-colors"
              >
                <div className="text-center min-w-[48px]">
                  <p className="text-[22px] font-light text-[#111] leading-none">{siteConfig.tripAdvisor.rating.toFixed(1)}</p>
                  <p className="text-[9px] tracking-[0.08em] uppercase text-[#248D6C] mt-0.5">TripAdvisor</p>
                </div>
                <div className="text-left">
                  <p className="text-[11px] text-[#111] font-medium leading-snug">{siteConfig.tripAdvisor.rankings[0]}</p>
                  <p className="text-[10px] text-[#717170] mt-0.5">{siteConfig.tripAdvisor.reviews.toLocaleString('en-US')} reviews →</p>
                </div>
              </a>
            </div>

            {/* Newsletter */}
            <div>
              <p className="text-[9px] font-medium tracking-[0.24em] uppercase text-[#248D6C] mb-4">Newsletter</p>
              <p className="text-[12px] font-light text-[#4F4F4E] leading-[1.7] mb-4 max-w-[320px]">
                Seasonal drops, new experiences, and local Puerto Rico stories. Once a month.
              </p>
              <form className="flex items-center border-b border-[#111] max-w-[380px]">
                <input
                  type="email"
                  placeholder="your email"
                  className="flex-1 bg-transparent py-2.5 text-[13px] font-light text-[#111] placeholder:text-[#aaa] outline-none"
                />
                <button type="submit" className="text-[10px] font-medium tracking-[0.14em] uppercase text-[#248D6C] hover:text-[#1C6E54] pl-3">
                  Subscribe →
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom legal bar */}
      <div className="border-t border-[#E5E5E5] px-6 md:px-12 py-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 max-w-[1280px] mx-auto">
          <p className="text-[10px] tracking-[0.08em] text-[#888]">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <ul className="flex gap-5">
            {[
              { label: 'Privacy', href: '/privacy' },
              { label: 'Terms', href: '/terms' },
              { label: 'Cookies', href: '/privacy#cookies' },
            ].map(l => (
              <li key={l.href}>
                <Link href={l.href} className="text-[10px] font-medium tracking-[0.16em] uppercase text-[#4F4F4E] hover:text-[#248D6C]">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-[9.5px] tracking-[0.08em] text-[#aaa]">
            Crafted by KWS Studio
          </p>
        </div>
      </div>
    </footer>
  )
}
