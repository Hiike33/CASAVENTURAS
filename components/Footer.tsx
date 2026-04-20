'use client'
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { siteConfigFor, toursFor } from '@/lib/cms/client'
import type { Locale } from '@/i18n/routing'

// Editorial Minimal layout. Brand + nav + contact stay centered with generous
// breathing room, legal lives in its own bottom bar so Terms is no longer
// glued to the copyright line.
export default function Footer() {
  const t = useTranslations('Footer')
  const tNav = useTranslations('Nav')
  const locale = useLocale() as Locale
  const siteConfig = siteConfigFor(locale)
  const tours = toursFor(locale)

  const navLinks = [
    ...tours.map(tour => ({ label: tour.shortName, href: `/tours/${tour.slug}`, external: false })),
    { label: tNav('contact'), href: '/contact', external: false },
    { label: t('tripAdvisor'), href: siteConfig.tripAdvisor.url, external: true },
  ]

  const legalLinks = [
    { label: t('privacy'), href: '/privacy' },
    { label: t('terms'), href: '/terms' },
    { label: t('cookies'), href: '/cookies' },
  ]

  return (
    <footer className="bg-white border-t border-[#E5E5E5]">
      <div className="px-6 md:px-12 py-20 md:py-24 text-center max-w-[900px] mx-auto">
        <div className="text-[22px] font-semibold tracking-[0.32em] uppercase text-[#111] mb-5">
          {siteConfig.name}
        </div>
        <p className="text-[13px] font-light text-[#717170] mb-12 max-w-[420px] mx-auto leading-[1.8]">
          {siteConfig.tagline}
        </p>

        <ul className="flex flex-wrap justify-center gap-x-8 gap-y-3 mb-12">
          {navLinks.map(link => (
            <li key={link.href}>
              {link.external ? (
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-medium tracking-[0.22em] uppercase text-[#4F4F4E] hover:text-[#248D6C] transition-colors"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  href={link.href}
                  className="text-[10px] font-medium tracking-[0.22em] uppercase text-[#4F4F4E] hover:text-[#248D6C] transition-colors"
                >
                  {link.label}
                </Link>
              )}
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

      <div className="border-t border-[#E5E5E5] px-6 md:px-12 py-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 max-w-[1280px] mx-auto">
          <p className="text-[10px] tracking-[0.08em] text-[#888]">
            © {new Date().getFullYear()} {siteConfig.name}
          </p>
          <ul className="flex gap-5">
            {legalLinks.map(link => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-[10px] font-medium tracking-[0.16em] uppercase text-[#4F4F4E] hover:text-[#248D6C] transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-[9.5px] tracking-[0.08em] text-[#aaa]">
            {t('craftedBy')}
          </p>
        </div>
      </div>
    </footer>
  )
}
