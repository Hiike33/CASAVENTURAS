'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { tours } from '@/lib/tours'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 h-[62px] flex items-center justify-between px-5 md:px-12 transition-all duration-200 backdrop-blur-md"
        style={{
          background: 'rgba(255,255,255,0.97)',
          borderBottom: scrolled ? '1px solid #E5E5E5' : '1px solid rgba(229,229,229,0.5)',
        }}
      >
        <Link href="/" className="text-[#111] font-semibold tracking-[0.20em] uppercase text-[13px]" onClick={() => setMobileOpen(false)}>
          Casa Venturas
        </Link>

        {/* Desktop menu */}
        <ul className="hidden md:flex gap-9 items-center">
          <li className="relative group" data-test="nav-experiences">
            <button
              type="button"
              className="text-[9.5px] font-medium tracking-[0.14em] uppercase text-[#4F4F4E] hover:text-[#111] transition-colors flex items-center gap-1.5"
              aria-haspopup="menu"
              aria-expanded="false"
            >
              Experiences
              <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" className="opacity-60 group-hover:translate-y-0.5 transition-transform">
                <path d="M0 2L4 6L8 2Z" />
              </svg>
            </button>
            <div className="absolute top-full right-0 pt-3 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto transition-opacity" role="menu">
              <div className="w-[280px] bg-white border border-[#E5E5E5] shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
                {tours.map(t => (
                  <Link
                    key={t.slug}
                    href={`/tours/${t.slug}`}
                    className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-[#E5E5E5] last:border-b-0 hover:bg-[#E6F3EE] transition-colors group/item"
                    role="menuitem"
                    data-test={`nav-tour-${t.slug}`}
                  >
                    <div>
                      <p className="text-[10px] font-medium tracking-[0.14em] uppercase text-[#248D6C] mb-0.5">{t.category}</p>
                      <p className="text-[#111] text-[13px] font-light">{t.shortName}</p>
                    </div>
                    <span className="text-[11px] font-light text-[#888] group-hover/item:text-[#248D6C] transition-colors">
                      ${t.price} →
                    </span>
                  </Link>
                ))}
                <Link href="/#tours" className="block px-5 py-3 bg-[#248D6C] hover:bg-[#1C6E54] transition-colors text-white text-[9.5px] font-semibold tracking-[0.14em] uppercase text-center" role="menuitem">
                  View all experiences →
                </Link>
              </div>
            </div>
          </li>

          {[
            { label: 'Reviews', href: '/#reviews' },
            { label: 'About', href: '/#story' },
            { label: 'Contact', href: '/contact' },
          ].map(link => (
            <li key={link.href}>
              <Link href={link.href} className="text-[9.5px] font-medium tracking-[0.14em] uppercase text-[#4F4F4E] hover:text-[#111] transition-colors">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <Link
          href="/#booking"
          className="hidden md:inline-block text-[9.5px] font-semibold tracking-[0.14em] uppercase text-white bg-[#248D6C] px-[22px] py-[10px] hover:bg-[#1C6E54] transition-colors"
        >
          Book now
        </Link>

        {/* Mobile burger */}
        <button
          type="button"
          className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-[5px] group"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(v => !v)}
          data-test="nav-burger"
        >
          <span className={`w-5 h-px bg-[#111] transition-all ${mobileOpen ? 'translate-y-[6px] rotate-45' : ''}`} />
          <span className={`w-5 h-px bg-[#111] transition-opacity ${mobileOpen ? 'opacity-0' : ''}`} />
          <span className={`w-5 h-px bg-[#111] transition-all ${mobileOpen ? '-translate-y-[6px] -rotate-45' : ''}`} />
        </button>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`md:hidden fixed inset-0 z-40 bg-black/30 transition-opacity ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden
      />
      <aside
        className={`md:hidden fixed top-[62px] right-0 bottom-0 w-[86%] max-w-[320px] bg-white z-50 overflow-y-auto transition-transform duration-300 border-l border-[#E5E5E5] ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-label="Mobile navigation"
        aria-hidden={!mobileOpen}
      >
        <div className="py-6 px-6">
          <p className="text-[10px] font-medium tracking-[0.22em] uppercase text-[#248D6C] mb-4">Experiences</p>
          <div className="flex flex-col border border-[#E5E5E5] mb-6">
            {tours.map(t => (
              <Link
                key={t.slug}
                href={`/tours/${t.slug}`}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-[#E5E5E5] last:border-b-0 hover:bg-[#E6F3EE] transition-colors"
              >
                <div>
                  <p className="text-[9px] font-medium tracking-[0.14em] uppercase text-[#248D6C] mb-0.5">{t.category}</p>
                  <p className="text-[#111] text-[14px] font-light">{t.shortName}</p>
                </div>
                <span className="text-[12px] font-light text-[#888]">${t.price}</span>
              </Link>
            ))}
          </div>

          <ul className="flex flex-col gap-0 border-t border-[#E5E5E5]">
            {[
              { label: 'Reviews', href: '/#reviews' },
              { label: 'About', href: '/#story' },
              { label: 'Contact', href: '/contact' },
            ].map(link => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block text-[11px] font-medium tracking-[0.16em] uppercase text-[#4F4F4E] hover:text-[#111] py-3.5 border-b border-[#E5E5E5] transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <Link
            href="/#booking"
            onClick={() => setMobileOpen(false)}
            className="block mt-6 bg-[#248D6C] text-white text-[11px] font-semibold tracking-[0.16em] uppercase text-center py-4 hover:bg-[#1C6E54] transition-colors"
          >
            Book now
          </Link>
        </div>
      </aside>
    </>
  )
}
