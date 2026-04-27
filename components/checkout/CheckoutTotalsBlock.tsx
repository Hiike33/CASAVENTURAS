// Checkout totals summary — subtotal/discount lines (when promo valid)
// + the prominent total amount. Pure presentational : reads only what
// the parent computes (effectiveTotal lives in CheckoutPanel because
// the submit button label depends on it too).
//
// Extracted from components/CheckoutPanel.tsx during Phase 3D-2.

import { useTranslations } from 'next-intl'
import type {
  PromoState,
  PromoBreakdown,
} from '@/lib/checkout/use-promo-validation'

type T = ReturnType<typeof useTranslations<'CheckoutPanel'>>

export default function CheckoutTotalsBlock({
  promoState,
  promoBreakdown,
  effectiveTotal,
  t,
}: {
  promoState: PromoState
  promoBreakdown: PromoBreakdown | null
  effectiveTotal: number
  t: T
}) {
  return (
    <div className="bg-[#FAFAFA] border border-[#E5E5E5] px-4 py-3 space-y-1">
      {promoState === 'valid' && promoBreakdown && (
        <>
          <div className="flex items-baseline justify-between text-[12px] font-light text-[#4F4F4E]">
            <span>{t('subtotal')}</span>
            <span>${promoBreakdown.subtotal}</span>
          </div>
          <div className="flex items-baseline justify-between text-[12px] font-light text-[#248D6C]">
            <span>
              {t('promoAppliedShort', { code: promoBreakdown.code })}
            </span>
            <span>−${promoBreakdown.discount}</span>
          </div>
        </>
      )}
      <div className="flex items-baseline justify-between">
        <span className="text-[10px] font-medium tracking-[0.14em] uppercase text-[#717170]">
          {t('total')}
        </span>
        <span className="text-[26px] font-light text-[#111] tracking-tight leading-none">
          ${effectiveTotal}
        </span>
      </div>
    </div>
  )
}
