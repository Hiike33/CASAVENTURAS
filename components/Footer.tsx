import Link from 'next/link'
import { siteConfig } from '@/lib/tours'

// Editorial Minimal layout. All previous content preserved (brand, tagline,
// 5 nav links, contact triad, Privacy + Terms, © + KWS Studio credit) —
// only the arrangement + breathing room changed. Legal moved to a distinct
// bottom bar so Terms is no longer glued to the copyright line.
export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#E5E5E5]">
      {/* Brand + nav + contact — centered, generous space */}
      <div className="px-6 md:px-12 py-20 md:py-24 text-center max-w-[900px] mx-auto">
        <div className="text-[22px] font-semibold tracking-[0.32em] uppercase text-[#111] mb-5">
          {siteConfig.name}
        </div>
        <p className="text-[13px] font-light text-[#717170] mb-12 max-w-[420px] mx-auto leading-[1.8]">
          {siteConfig.tagline}
        </p>

        <ul className="flex flex-wrap justify-center gap-x-8 gap-y-3 mb-12">
          {[
            { label: 'El Yunque', href: '/tours/el-yunque' },
            { label: 'Catamaran', href: '/tours/catamaran' },
            { label: 'Salsa', href: '/tours/salsa' },
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

        <div className="flex flex-col items-center gap-2 text-[12px] font-light text-[#888]">
          <a href={`mailto:${siteConfig.email}`} className="hover:text-[#248D6C] transition-colors">
            {siteConfig.email}
          </a>
          <a href={siteConfig.whatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-[#248D6C] transition-colors">
            {siteConfig.phone}
          </a>
          <span>{siteConfig.location}</span>
        </div>
      </div>

      {/* Legal bottom bar — distinct from the brand area */}
      <div className="border-t border-[#E5E5E5] px-6 md:px-12 py-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 max-w-[1280px] mx-auto">
          <p className="text-[10px] tracking-[0.08em] text-[#888]">
            © {new Date().getFullYear()} {siteConfig.name}
          </p>
          <ul className="flex gap-5">
            {[
              { label: 'Privacy', href: '/privacy' },
              { label: 'Terms', href: '/terms' },
              { label: 'Cookies', href: '/cookies' },
            ].map(l => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-[10px] font-medium tracking-[0.16em] uppercase text-[#4F4F4E] hover:text-[#248D6C] transition-colors"
                >
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
