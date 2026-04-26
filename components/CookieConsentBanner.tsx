'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { readConsent, writeConsent, type ConsentState } from '@/lib/analytics/consent'

/**
 * GDPR-friendly consent banner — Accept / Decline only (no dark patterns,
 * both buttons get equal visual weight). Persists the decision in
 * localStorage and updates Google Consent Mode v2 in real time.
 *
 * Behaviour :
 *   • SSR / first paint : banner not in the DOM → no CLS impact on LCP
 *   • Hydration : reads stored decision; renders only when state==='pending'
 *   • Accept   : writeConsent('granted') + gtag('consent','update', granted)
 *   • Decline  : writeConsent('denied')  + gtag stays denied (default)
 *
 * Visual style aligned with the project palette (CLAUDE.md D-012):
 *   #FFFFFF surface, #248D6C accent, #4F4F4E text, hairline 1px border.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

export default function CookieConsentBanner() {
  const t = useTranslations('CookieBanner')
  const [state, setState] = useState<ConsentState>('pending')
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setState(readConsent())
    setHydrated(true)
  }, [])

  // Render nothing during SSR + first client paint to avoid hydration
  // mismatch and to keep the banner out of the LCP critical path.
  if (!hydrated || state !== 'pending') return null

  const accept = () => {
    writeConsent('granted')
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
      })
    }
    setState('granted')
  }

  const decline = () => {
    writeConsent('denied')
    setState('denied')
  }

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cv-consent-title"
      className="fixed bottom-4 left-4 right-4 z-[60] mx-auto max-w-[640px] border border-[#E5E5E5] bg-white p-5 shadow-frost md:bottom-6 md:left-6 md:right-auto"
    >
      <p
        id="cv-consent-title"
        className="text-[10px] font-medium tracking-[0.2em] uppercase text-[#248D6C] mb-2"
      >
        {t('title')}
      </p>
      <p className="text-[12.5px] font-light leading-[1.6] text-[#4F4F4E] mb-4">
        {t('body')}{' '}
        <a
          href="/cookies"
          className="text-[#248D6C] underline-offset-2 hover:underline"
        >
          {t('learnMore')}
        </a>
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={decline}
          className="border border-[#E5E5E5] bg-white px-4 py-2 text-[10px] font-medium tracking-[0.16em] uppercase text-[#4F4F4E] transition-colors hover:border-[#248D6C] hover:text-[#248D6C]"
        >
          {t('decline')}
        </button>
        <button
          type="button"
          onClick={accept}
          className="bg-[#248D6C] px-4 py-2 text-[10px] font-semibold tracking-[0.16em] uppercase text-white transition-colors hover:bg-[#1C6E54]"
        >
          {t('accept')}
        </button>
      </div>
    </div>
  )
}
