// Checkout panel header — eyebrow + title + date/time/guests + close button.
// Pure presentational : no state, no effects, just props.
//
// Extracted from components/CheckoutPanel.tsx during Phase 3D-1.

import { useTranslations } from 'next-intl'

type T = ReturnType<typeof useTranslations<'CheckoutPanel'>>
type TCommon = ReturnType<typeof useTranslations<'Common'>>

export default function CheckoutHeader({
  title,
  date,
  startTimeLabel,
  totalGuests,
  onClose,
  t,
  tCommon,
}: {
  title: string
  date: string
  startTimeLabel: string
  totalGuests: number
  onClose?: () => void
  t: T
  tCommon: TCommon
}) {
  return (
    <header className="bg-[#FAFAFA] border-b border-[#E5E5E5] px-6 py-5 flex items-start justify-between gap-4">
      <div>
        <p className="text-[9px] font-medium tracking-[0.2em] uppercase text-[#248D6C] mb-1.5">
          {t('secureCheckout')}
        </p>
        <p className="text-[#111] text-[15px] font-normal mb-1">
          {title}
        </p>
        <p className="text-[12px] font-light text-[#717170]">
          {date} · {startTimeLabel} · {totalGuests}{' '}
          {totalGuests === 1 ? tCommon('guest') : tCommon('guests')}
        </p>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-[#717170] hover:text-[#111] transition-colors text-[18px] leading-none px-2"
          aria-label={t('closeCheckout')}
        >
          ×
        </button>
      )}
    </header>
  )
}
