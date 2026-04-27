// Toggle button under the hotel pickup combobox that lets the user
// switch between picking from the listed hotels and entering a custom
// address. Stateless — controlled by the parent.
//
// Extracted from components/CheckoutPanel.tsx during Phase 2A.

import { useTranslations } from 'next-intl'

type T = ReturnType<typeof useTranslations<'CheckoutPanel'>>

export default function CustomPickupToggle({
  on,
  onToggle,
  t,
}: {
  on: boolean
  onToggle: (v: boolean) => void
  t: T
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(!on)}
      className="w-full text-left text-[11px] font-medium tracking-[0.08em] text-[#248D6C] border-t border-[#E5E5E5] pt-3 hover:text-[#1C6E54] transition-colors"
    >
      {on ? t('chooseListedHotel') : t('customPickupToggle')}
    </button>
  )
}
