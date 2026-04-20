'use client'
import { useLocale, useTranslations } from 'next-intl'
import { useTransition } from 'react'
import { routing } from '@/i18n/routing'
import { usePathname, useRouter } from '@/i18n/navigation'

// Compact language dropdown. Preserves the current path when switching
// locales. Our routes are static per locale (no /[slug] dynamic segments),
// so we pass the locale-stripped `pathname` directly to router.replace —
// passing { pathname, params } would re-inject the current locale from
// useParams and trap the user on that language.
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

  const base =
    variant === 'desktop'
      ? 'relative inline-flex items-center'
      : 'relative inline-flex items-center w-full'

  return (
    <div className={base}>
      <label htmlFor={`locale-${variant}`} className="sr-only">
        {t('label')}
      </label>
      <select
        id={`locale-${variant}`}
        value={locale}
        onChange={e => onChange(e.target.value)}
        disabled={isPending}
        aria-label={t('label')}
        data-test="locale-switch"
        className={
          variant === 'desktop'
            ? 'appearance-none bg-transparent text-[9.5px] font-medium tracking-[0.14em] uppercase text-[#4F4F4E] hover:text-[#111] transition-colors pr-4 py-1 focus:outline-none cursor-pointer disabled:opacity-50'
            : 'appearance-none w-full bg-white border border-[#E5E5E5] text-[#4F4F4E] text-[11px] font-medium tracking-[0.16em] uppercase px-4 py-3 pr-8 focus:outline-none focus:border-[#248D6C] cursor-pointer disabled:opacity-50'
        }
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
        className={
          variant === 'desktop'
            ? 'pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 opacity-60 text-[#4F4F4E]'
            : 'pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-60 text-[#4F4F4E]'
        }
      >
        <path d="M0 2L4 6L8 2Z" />
      </svg>
    </div>
  )
}
