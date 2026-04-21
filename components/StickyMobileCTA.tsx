'use client'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

type Props = {
  label?: string
  /** Kept on the prop for backward compat with tour page callsites.
      Phase 5 decision: prices live in the booking engine only, so this
      sticky CTA no longer surfaces price info , just the label + button. */
  fromPrice?: number
  href: string
}

export default function StickyMobileCTA({ label, href }: Props) {
  const t = useTranslations('StickyCTA')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      aria-hidden={!visible}
      className={`sticky-mobile-cta md:hidden fixed bottom-0 left-0 right-0 z-40 px-4 py-3 bg-white border-t border-[#e8e8e8] shadow-[0_-4px_12px_rgba(0,0,0,0.08)] transition-transform duration-200 ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <Link
        href={href}
        className="block w-full bg-[#248D6C] text-white text-center text-[11px] font-semibold tracking-[0.14em] uppercase px-6 py-3.5 hover:bg-[#1C6E54] transition-colors"
      >
        {label ?? t('bookNow')}
      </Link>
    </div>
  )
}
