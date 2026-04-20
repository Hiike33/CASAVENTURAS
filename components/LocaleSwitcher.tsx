'use client'
import { useLocale, useTranslations } from 'next-intl'
import { useTransition } from 'react'
import { routing } from '@/i18n/routing'
import { usePathname, useRouter } from '@/i18n/navigation'

// Locale switcher. Two variants:
//  - desktop: compact hover popover matching the Nav "Experiences" dropdown
//    pattern (Nav.tsx:49-85). Shows a globe + 2-letter locale code; opens
//    on hover + focus-within with a flat white panel of named options.
//    Sits next to the green "Book now" CTA in the Nav.
//  - mobile:  native <select>, still used inside the drawer for native
//    OS picker UX and keyboard accessibility out of the box.
//
// Routing: our [locale] routes are static (no /[slug] dynamic segments
// beyond the locale root that next-intl handles), so we pass the
// locale-stripped pathname directly to router.replace.
export default function LocaleSwitcher({
  variant = 'desktop',
}: {
  variant?: 'desktop' | 'mobile'
}) {
  const t = useTranslations('LocaleSwitcher')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  function onChange(nextLocale: string) {
    if (nextLocale === locale) return
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale })
    })
  }

  if (variant === 'mobile') {
    return (
      <div className="relative inline-flex items-center w-full">
        <label htmlFor="locale-mobile" className="sr-only">
          {t('label')}
        </label>
        <select
          id="locale-mobile"
          value={locale}
          onChange={e => onChange(e.target.value)}
          disabled={isPending}
          aria-label={t('label')}
          data-test="locale-switch"
          className="appearance-none w-full bg-white border border-[#E5E5E5] text-[#4F4F4E] text-[11px] font-medium tracking-[0.16em] uppercase px-4 py-3 pr-8 focus:outline-none focus:border-[#248D6C] cursor-pointer disabled:opacity-50"
        >
          {routing.locales.map(loc => (
            <option key={loc} value={loc}>
              {t(loc)}
            </option>
          ))}
        </select>
        <svg
          width="8"
          height="8"
          viewBox="0 0 8 8"
          fill="currentColor"
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-60 text-[#4F4F4E]"
        >
          <path d="M0 2L4 6L8 2Z" />
        </svg>
      </div>
    )
  }

  return (
    <div className="relative group">
      <button
        type="button"
        aria-haspopup="menu"
        aria-label={t('label')}
        data-test="locale-switch"
        disabled={isPending}
        className="flex items-center gap-1.5 text-[9.5px] font-medium tracking-[0.14em] uppercase text-[#4F4F4E] hover:text-[#111] transition-colors disabled:opacity-50 focus:outline-none focus-visible:text-[#111]"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-70" aria-hidden>
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span>{locale.toUpperCase()}</span>
        <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" aria-hidden className="opacity-60 group-hover:translate-y-0.5 transition-transform">
          <path d="M0 2L4 6L8 2Z" />
        </svg>
      </button>
      <div
        role="menu"
        className="absolute top-full right-0 pt-3 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto transition-opacity"
      >
        <div className="w-[140px] bg-white border border-[#E5E5E5] shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
          {routing.locales.map(loc => (
            <button
              key={loc}
              type="button"
              role="menuitem"
              onClick={() => onChange(loc)}
              disabled={isPending}
              data-active={loc === locale}
              data-test={`locale-option-${loc}`}
              className="block w-full text-left px-4 py-2.5 text-[11px] font-light text-[#4F4F4E] hover:bg-[#E6F3EE] hover:text-[#111] data-[active=true]:text-[#248D6C] data-[active=true]:font-medium transition-colors disabled:opacity-50"
            >
              {t(loc)}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
