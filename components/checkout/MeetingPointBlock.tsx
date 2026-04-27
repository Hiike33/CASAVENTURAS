// Meeting-point banner displayed at the top of the checkout when the
// activity meets the customer at a fixed location (Bokun
// meetingType=MEET_ON_LOCATION). Surfaces address + a Google Maps
// deep-link.
//
// Extracted from components/CheckoutPanel.tsx during Phase 2A.

import { useTranslations } from 'next-intl'
import type { StartPoint } from '@/app/api/bokun/checkout-context/route'
import { PinIcon } from './icons'

type T = ReturnType<typeof useTranslations<'CheckoutPanel'>>

export default function MeetingPointBlock({
  point,
  t,
}: {
  point: StartPoint
  t: T
}) {
  const lines = [
    point.addressLine1,
    point.addressLine2,
    [point.city, point.state, point.postalCode].filter(Boolean).join(', '),
    point.countryCode,
  ].filter((l): l is string => Boolean(l))
  const mapsQuery = encodeURIComponent(
    [point.title, point.addressLine1, point.city, point.state, point.countryCode]
      .filter(Boolean)
      .join(', '),
  )
  return (
    <div className="bg-[#E6F3EE] border-b border-[#B8D9CF] px-6 py-4">
      <p className="text-[9px] font-medium tracking-[0.2em] uppercase text-[#248D6C] mb-1.5 flex items-center gap-2">
        <PinIcon /> {t('meetingPoint')}
      </p>
      <p className="text-[#111] text-[13px] font-medium leading-tight">{point.title}</p>
      <p className="text-[12px] font-light text-[#4F4F4E] leading-[1.6] mt-0.5">
        {lines.join(' · ')}
      </p>
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mt-2 text-[10px] font-medium tracking-[0.14em] uppercase text-[#248D6C] border-b border-[#248D6C]/30 hover:border-[#248D6C] transition-colors"
      >
        {t('viewOnMap')}
      </a>
    </div>
  )
}
