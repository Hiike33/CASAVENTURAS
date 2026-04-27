// Confirmation screen shown after Bokun returns a confirmationCode.
// Replaces the entire checkout form when step === 'success'.
//
// Extracted from components/CheckoutPanel.tsx during Phase 2A.

import { useTranslations } from 'next-intl'
import type { Tour } from '@/lib/tours'
import { CheckIcon } from './icons'

type T = ReturnType<typeof useTranslations<'CheckoutPanel'>>

export default function SuccessState({
  tour,
  total,
  date,
  code,
  t,
}: {
  tour: Tour
  total: number
  date: string
  code: string
  t: T
}) {
  return (
    <aside className="border border-[#E5E5E5] bg-white">
      <div className="bg-[#E6F3EE] border-b border-[#B8D9CF] px-6 py-5">
        <p className="text-[9px] font-medium tracking-[0.2em] uppercase text-[#248D6C] mb-1.5 flex items-center gap-2">
          <CheckIcon /> {t('bookingConfirmed')}
        </p>
        <p className="text-[#111] text-[20px] font-light leading-tight">{tour.name}</p>
        <p className="text-[12px] font-light text-[#4F4F4E] mt-1">
          {date} · {t('confirmationCode')} <span className="font-medium text-[#111]">{code}</span>
        </p>
      </div>
      <div className="p-6 space-y-4 text-[13px] font-light text-[#4F4F4E] leading-[1.7]">
        <p>{t('confirmationEmail', { code })}</p>
        <div className="border-t border-[#E5E5E5] pt-4 flex items-baseline justify-between">
          <span className="text-[10px] font-medium tracking-[0.14em] uppercase text-[#717170]">
            {t('amountPaid')}
          </span>
          <span className="text-[20px] font-light text-[#111]">${total}</span>
        </div>
      </div>
    </aside>
  )
}
