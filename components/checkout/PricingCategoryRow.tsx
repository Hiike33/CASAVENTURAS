// Row in the "Guests" section : category title + age hint + unit price
// + quantity stepper. Composes QtyStepper.
//
// Extracted from components/CheckoutPanel.tsx during Phase 2A.

import type { PricingCategory } from '@/app/api/bokun/checkout-context/route'
import QtyStepper from './QtyStepper'

export default function PricingCategoryRow({
  category,
  quantity,
  unitPrice,
  showUnitPrice,
  onChange,
  last,
}: {
  category: PricingCategory
  quantity: number
  unitPrice: number
  // Hidden for per-booking tours where the categories are manifest-only
  // and the displayed unit would mislead (each row would echo tour.price).
  showUnitPrice: boolean
  onChange: (v: number) => void
  last: boolean
}) {
  const ageHint =
    category.minAge && category.maxAge && category.maxAge > 0
      ? `${category.minAge}–${category.maxAge} yrs`
      : null
  return (
    <div
      className={`flex items-center justify-between px-4 py-3 ${last ? '' : 'border-b border-[#E5E5E5]'}`}
    >
      <div>
        <p className="text-[13px] font-normal text-[#111]">{category.title}</p>
        {ageHint && (
          <p className="text-[10px] font-light text-[#717170] mt-0.5">{ageHint}</p>
        )}
      </div>
      <div className="flex items-center gap-4">
        {showUnitPrice && (
          <span className="text-[12px] font-light text-[#4F4F4E]">${unitPrice}</span>
        )}
        <QtyStepper value={quantity} onChange={onChange} />
      </div>
    </div>
  )
}
