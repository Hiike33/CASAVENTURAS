import Link from 'next/link'
import { siteConfig } from '@/lib/tours'

export default function Footer() {
  return (
    <footer className="bg-[#FAFAFA] border-t border-[#E5E5E5] px-6 md:px-12 py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-7">
        <div>
          <div className="text-[13px] font-semibold tracking-[0.20em] uppercase text-[#111] mb-2">
            {siteConfig.name}
          </div>
          <p className="text-[11px] font-light text-[#717170] max-w-xs leading-relaxed">
            {siteConfig.tagline}
          </p>
        </div>

        <ul className="flex flex-wrap gap-x-6 gap-y-2">
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
                className="text-[9.5px] font-medium tracking-[0.14em] uppercase text-[#4F4F4E] hover:text-[#248D6C] transition-colors"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pt-6 border-t border-[#E5E5E5]">
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-[10px] font-light text-[#717170]">
          <a href={`mailto:${siteConfig.email}`} className="hover:text-[#248D6C] transition-colors">{siteConfig.email}</a>
          <a href={siteConfig.whatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-[#248D6C] transition-colors">{siteConfig.phone}</a>
          <span>{siteConfig.location}</span>
        </div>
        <p className="text-[9.5px] text-[#888] tracking-[0.04em]">
          © {new Date().getFullYear()} {siteConfig.name} · Crafted by KWS Studio
        </p>
      </div>
    </footer>
  )
}
