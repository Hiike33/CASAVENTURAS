'use client'
import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import type { BokunAvailability, BokunAvailabilityResponse } from '@/lib/bokun/types'
import { CLIENT_CHECKOUT_MODE } from '@/lib/bokun/checkout-mode'
import CheckoutPanel from '@/components/CheckoutPanel'
import { toursFor, siteConfigFor } from '@/lib/cms/client'
import { getDisplayTime, getDisplayDaysLabel } from '@/lib/bokun/snapshot'
import type { Locale } from '@/i18n/routing'

type AvailabilityState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | {
      kind: 'ok'
      slots: number
      soldOut: boolean
      firstSlot?: BokunAvailability
    }

const BOKUN_CHANNEL_UUID = process.env.NEXT_PUBLIC_BOKUN_CHANNEL_UUID

export default function HomeBookingForm() {
  const t = useTranslations('HomeBookingForm')
  const locale = useLocale() as Locale
  const tours = toursFor(locale)
  const siteConfig = siteConfigFor(locale)

  const [tourSlug, setTourSlug] = useState(tours[0].slug)
  const [date, setDate] = useState('')
  const [guests, setGuests] = useState('2')
  const [availability, setAvailability] = useState<AvailabilityState>({ kind: 'idle' })
  const [inCheckout, setInCheckout] = useState(false)

  const selectedTour = tours.find(tour => tour.slug === tourSlug)
  const productId = selectedTour?.bokunProductId
  const bokunConfigured = Boolean(productId && BOKUN_CHANNEL_UUID)

  useEffect(() => {
    setAvailability({ kind: 'idle' })
    setInCheckout(false)
    if (!date || !productId) return
    const ctrl = new AbortController()
    setAvailability({ kind: 'loading' })
    fetch(`/api/bokun/availability?productId=${productId}&start=${date}&end=${date}`, {
      signal: ctrl.signal,
    })
      .then(async r => (await r.json()) as BokunAvailabilityResponse)
      .then(data => {
        if (!data.ok) {
          setAvailability({ kind: 'error', message: data.error })
          return
        }
        const sumSlots = data.availabilities.reduce<number>(
          (n: number, a: BokunAvailability) => n + (a.availabilityCount ?? 0),
          0,
        )
        const soldOut =
          data.availabilities.length > 0 && data.availabilities.every(a => a.soldOut)
        const firstSlot =
          data.availabilities.find(a => !a.soldOut) ?? data.availabilities[0]
        setAvailability({ kind: 'ok', slots: sumSlots, soldOut, firstSlot })
      })
      .catch(err => {
        if (err?.name === 'AbortError') return
        setAvailability({ kind: 'error', message: t('availabilityError') })
      })
    return () => ctrl.abort()
  }, [date, productId, t])

  const guestsNum = Math.max(1, Number(guests) || 1)
  const price = selectedTour?.price ?? 0
  const total = price * guestsNum

  const bokunCheckoutUrl = bokunConfigured
    ? `https://widgets.bokun.io/online-sales/${BOKUN_CHANNEL_UUID}/experience/${productId}`
    : undefined

  const mailtoSubject = t('mailtoSubject', { tour: selectedTour?.name ?? tourSlug })
  const mailtoBody = t('mailtoBody', {
    tour: selectedTour?.name ?? tourSlug,
    date: date || t('flexible'),
    guests: guestsNum,
  })
  const mailtoFallback = `mailto:${siteConfig.email}?subject=${encodeURIComponent(
    mailtoSubject,
  )}&body=${encodeURIComponent(mailtoBody)}`

  const customCheckoutEnabled =
    CLIENT_CHECKOUT_MODE !== 'disabled' && Boolean(productId)

  if (
    customCheckoutEnabled &&
    inCheckout &&
    selectedTour &&
    availability.kind === 'ok' &&
    availability.firstSlot
  ) {
    const slot = availability.firstSlot
    const slotDate =
      typeof slot.date === 'number'
        ? new Date(slot.date).toISOString().slice(0, 10)
        : date
    const label = slot.startTimeLabel
      ? `${slot.startTimeLabel}${slot.startTime ? ` · ${slot.startTime}` : ''}`
      : slot.startTime ?? ''
    return (
      <CheckoutPanel
        tour={selectedTour}
        date={slotDate}
        startTimeId={Number((slot as unknown as { startTimeId?: number }).startTimeId ?? 0)}
        rateId={Number((slot as unknown as { defaultRateId?: number }).defaultRateId ?? 0)}
        startTimeLabel={label}
        onClose={() => setInCheckout(false)}
      />
    )
  }

  const disableSubmit =
    customCheckoutEnabled &&
    (availability.kind !== 'ok' ||
      availability.soldOut ||
      !availability.firstSlot)

  return (
    <div className="bg-white border border-[#E5E5E5] p-8 shadow-hairline rounded-sm">
      <p className="text-[9px] font-medium tracking-[0.2em] uppercase text-[#888] mb-6">{t('title')}</p>

      <label htmlFor="hb-tour" className="block text-[9px] font-medium tracking-[0.14em] uppercase text-[#888] mb-1.5">{t('selectExperience')}</label>
      <select
        id="hb-tour"
        value={tourSlug}
        onChange={e => setTourSlug(e.target.value)}
        className="w-full bg-white border border-[#E5E5E5] text-[#111] text-[13px] font-light px-3.5 py-2.5 outline-none focus:border-[#248D6C] transition-colors"
      >
        {tours.map(tour => (
          <option key={tour.slug} value={tour.slug}>
            {t('optionPerPerson', { name: tour.name, price: tour.price })}
          </option>
        ))}
      </select>

      {/* Schedule hint from live Bokun snapshot (D-020 SSOT): displays
          "5 PM · Friday" for single-day tours, "8 AM · Daily" for 7-day. */}
      {(() => {
        if (!selectedTour) return <div className="mb-4" aria-hidden />
        const t0 = getDisplayTime(selectedTour)
        const d0 = getDisplayDaysLabel(selectedTour)
        if (!t0 && !d0) return <div className="mb-4" aria-hidden />
        const label = [t0, d0].filter(Boolean).join(' · ')
        return (
          <p className="text-[10px] font-medium tracking-[0.16em] uppercase text-[#248D6C] mt-2 mb-4">
            {label}
          </p>
        )
      })()}

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label htmlFor="hb-date" className="block text-[9px] font-medium tracking-[0.14em] uppercase text-[#888] mb-1.5">{t('date')}</label>
          <input
            id="hb-date"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            min={new Date().toISOString().slice(0, 10)}
            className="w-full bg-white border border-[#E5E5E5] text-[#111] text-[13px] font-light px-3.5 py-2.5 outline-none focus:border-[#248D6C] transition-colors"
          />
        </div>
        <div>
          <label htmlFor="hb-guests" className="block text-[9px] font-medium tracking-[0.14em] uppercase text-[#888] mb-1.5">{t('guests')}</label>
          <input
            id="hb-guests"
            type="number"
            min={1}
            max={13}
            value={guests}
            onChange={e => setGuests(e.target.value)}
            className="w-full bg-white border border-[#E5E5E5] text-[#111] text-[13px] font-light px-3.5 py-2.5 outline-none focus:border-[#248D6C] transition-colors placeholder:text-[#aaa]"
          />
        </div>
      </div>

      <HomeAvailabilityLine state={availability} date={date} bokunConfigured={bokunConfigured} t={t} />

      {selectedTour && (
        <div className="flex items-baseline justify-between py-2.5 border-t border-[#f0f0f0] mb-3">
          <span className="text-[10px] font-medium tracking-[0.14em] uppercase text-[#888]">{t('total')}</span>
          <span className="text-[22px] font-light text-[#111] tracking-tight">${total}</span>
        </div>
      )}

      {customCheckoutEnabled ? (
        <button
          type="button"
          disabled={disableSubmit}
          onClick={() => setInCheckout(true)}
          className="block w-full bg-[#248D6C] text-white text-center text-[10px] font-semibold tracking-[0.16em] uppercase py-3.5 hover:bg-[#1C6E54] transition-colors disabled:opacity-60"
        >
          {availability.kind === 'ok' && availability.soldOut
            ? t('soldOut')
            : !date
              ? t('pickDate')
              : t('confirmBooking')}
        </button>
      ) : bokunCheckoutUrl ? (
        <a
          className="bokunButton block w-full bg-[#248D6C] text-white text-center text-[10px] font-semibold tracking-[0.16em] uppercase py-3.5 hover:bg-[#1C6E54] transition-colors aria-[disabled=true]:opacity-60"
          href={bokunCheckoutUrl}
          data-src={bokunCheckoutUrl}
          aria-disabled={availability.kind === 'ok' && availability.soldOut ? 'true' : undefined}
        >
          {availability.kind === 'ok' && availability.soldOut
            ? t('soldOut')
            : t('confirmBooking')}
        </a>
      ) : (
        <a
          className="block w-full bg-[#248D6C] text-white text-center text-[10px] font-semibold tracking-[0.16em] uppercase py-3.5 hover:bg-[#1C6E54] transition-colors"
          href={mailtoFallback}
        >
          {t('requestByEmail')}
        </a>
      )}

      <p className="text-[9.5px] text-center text-[#888] mt-2.5 font-light">
        {t('reassurance')}
      </p>
    </div>
  )
}

type FormT = ReturnType<typeof useTranslations<'HomeBookingForm'>>

function HomeAvailabilityLine({
  state,
  date,
  bokunConfigured,
  t,
}: {
  state: AvailabilityState
  date: string
  bokunConfigured: boolean
  t: FormT
}) {
  if (!bokunConfigured) {
    return (
      <p className="text-[11px] font-light text-[#888] min-h-[16px] mb-2">
        {t('onRequest')}
      </p>
    )
  }
  if (state.kind === 'idle' && !date) {
    return <p className="text-[11px] font-light text-[#888] min-h-[16px] mb-2">{t('pickDateSeeAvail')}</p>
  }
  if (state.kind === 'loading') {
    return <p className="text-[11px] font-light text-[#888] min-h-[16px] mb-2">{t('checking')}</p>
  }
  if (state.kind === 'error') {
    return <p className="text-[11px] font-light text-red-600 min-h-[16px] mb-2">{state.message}</p>
  }
  if (state.kind === 'ok') {
    if (state.soldOut) {
      return <p className="text-[11px] font-medium text-red-600 min-h-[16px] mb-2">{t('soldOutDate')}</p>
    }
    if (state.slots > 0) {
      return (
        <p className="text-[11px] font-medium text-[#248D6C] min-h-[16px] mb-2">
          {t('spotsAvailable', { count: state.slots })}
        </p>
      )
    }
    return <p className="text-[11px] font-light text-[#888] min-h-[16px] mb-2">{t('noAvailability')}</p>
  }
  return <p className="min-h-[16px] mb-2" />
}
