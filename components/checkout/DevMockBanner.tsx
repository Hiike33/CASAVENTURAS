// Amber banner shown above the checkout header when CHECKOUT_MODE=dev-mock.
// Tells the QA/developer that the booking will be faked, no real charge.
//
// Extracted from components/CheckoutPanel.tsx during Phase 2A.

import { useTranslations } from 'next-intl'

type T = ReturnType<typeof useTranslations<'CheckoutPanel'>>

export default function DevMockBanner({ t }: { t: T }) {
  return (
    <div className="bg-[#FFF8E1] border-b border-[#E6D89A] px-6 py-2 text-[10px] font-medium tracking-[0.14em] uppercase text-[#8A6A0F]">
      {t('devMockBanner')}
    </div>
  )
}
