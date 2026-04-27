'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { loadStripe, type Stripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'
import type { Tour } from '@/lib/tours'
import type {
  CheckoutContext,
  PricingCategory,
} from '@/app/api/bokun/checkout-context/route'
import { CLIENT_CHECKOUT_MODE } from '@/lib/bokun/checkout-mode'
import type { RuntimeRatePrice } from '@/lib/bokun/checkout-prices'
import { formatCheckoutErrorMessage } from '@/lib/bokun/checkout-payload'
import { track } from '@/lib/analytics/events'
import PromoCodeBlock from '@/components/checkout/PromoCodeBlock'
import WhatsIncludedPanel from '@/components/checkout/WhatsIncludedPanel'
import PickupCombobox from '@/components/checkout/PickupCombobox'
import StripeCard from '@/components/checkout/StripeCard'
import MeetingPointBlock from '@/components/checkout/MeetingPointBlock'
import CustomPickupToggle from '@/components/checkout/CustomPickupToggle'
import PricingCategoryRow from '@/components/checkout/PricingCategoryRow'
import Section from '@/components/checkout/Section'
import Field from '@/components/checkout/Field'
import CancellationLine from '@/components/checkout/CancellationLine'
import DevMockBanner from '@/components/checkout/DevMockBanner'
import SuccessState from '@/components/checkout/SuccessState'
import AddressAutocomplete from '@/components/AddressAutocomplete'
import { useCheckoutContext } from '@/lib/checkout/use-checkout-context'
import { useCheckoutTotal } from '@/lib/checkout/use-checkout-total'
import { usePromoValidation } from '@/lib/checkout/use-promo-validation'
import {
  validateSubmitPreflight,
  buildSubmitBody,
  checkPriceMismatch,
} from '@/lib/checkout/submit-helpers'

// Inline checkout panel wired to Bókun + Stripe.
//
//   CHECKOUT_MODE=dev-mock — submit route returns a fake confirmed booking
//     after ~700ms. Card iframe still mounts, token is created (valid
//     Stripe call against pk_live_), but never used server-side so no
//     charge happens.
//   CHECKOUT_MODE=live     — real token is sent to Bókun /checkout.json/submit,
//     the card is actually charged via the vendor's Stripe connection.
//
// Palette strictly aligned with BookingSidebar (#248D6C / #1C6E54 /
// #E5E5E5 / #111 / #4F4F4E / #717170 / #FAFAFA / #E6F3EE).

type Step = 'form' | 'submitting' | 'success' | 'error'

const STRIPE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
// Module-scope singleton — Stripe recommends calling loadStripe once. We
// still handle the `null` case (missing key) inside the inner component
// so the form degrades gracefully instead of crashing.
const stripePromise: Promise<Stripe | null> = STRIPE_KEY
  ? loadStripe(STRIPE_KEY)
  : Promise.resolve(null)

export type CheckoutPanelProps = {
  tour: Tour
  /** yyyy-MM-dd — from the BookingSidebar date picker */
  date?: string
  /** Bókun-issued slot id (the "startTimeId" in availabilities) */
  startTimeId?: number
  /** Bókun-issued rate id (from availability response) */
  rateId?: number
  /** Free-form label surfaced in the header (e.g., "Bus 2 · 08:00") */
  startTimeLabel?: string
  /** When true, renders the preview amber banner above the header. */
  devMock?: boolean
  /** Optional handler to close/dismiss the panel (e.g., drawer cancel). */
  onClose?: () => void
  /**
   * Live per-rate prices lifted from the parent's selected availability slot.
   * When present, the checkout uses these instead of the build-time snapshot
   * — keeps displayed prices in sync with what Bokun will charge at submit.
   * Absent → UI falls back to tour.bokunSnapshot (≤ 6h stale, always safe).
   */
  pricesByRate?: RuntimeRatePrice[]
}

export default function CheckoutPanel(props: CheckoutPanelProps) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutPanelInner {...props} />
    </Elements>
  )
}

function CheckoutPanelInner({
  tour,
  date = '2026-05-15',
  startTimeId = 0,
  rateId = 0,
  startTimeLabel = 'Bus 2 · 08:00',
  devMock = CLIENT_CHECKOUT_MODE === 'dev-mock',
  onClose,
  pricesByRate,
}: CheckoutPanelProps) {
  const t = useTranslations('CheckoutPanel')
  const tCommon = useTranslations('Common')
  const stripe = useStripe()
  const elements = useElements()
  const [step, setStep] = useState<Step>('form')
  const [errorMsg, setErrorMsg] = useState('')
  const [confirmation, setConfirmation] = useState<{
    code: string
    total: number
  } | null>(null)
  const { ctx, qty, setQty } = useCheckoutContext(tour.bokunProductId)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    pickupId: null as number | null,
    pickupTitle: '',
    roomNumber: '',
    customPickup: false,
    customPickupAddress: '',
    customPickupLat: undefined as number | undefined,
    customPickupLon: undefined as number | undefined,
    answers: {} as Record<number, string>,
    requests: '',
  })

  const needs = (field: string) =>
    ctx?.requiredCustomerFields?.includes(field) ?? false
  const selectedPickup = ctx?.pickupPlaces.find(p => p.id === form.pickupId)
  const needsRoomNumber =
    !form.customPickup && selectedPickup?.askForRoomNumber === true

  // Per-category price map + booking total — see lib/checkout/use-checkout-total
  // (math) and lib/checkout/checkout-totals.test.ts (13 unit tests covering
  // per-booking, per-person, fallback, and edge cases).
  const { total, totalGuests, rateFor } = useCheckoutTotal({
    ctx,
    qty,
    tour,
    pricesByRate,
    rateId,
  })

  // Promo state machine + debounced live validation against
  // /api/bokun/promo/validate. See lib/checkout/use-promo-validation
  // for the stale-response guard, telemetry, and the full flow.
  const { promoInput, setPromoInput, promoState, promoError, promoBreakdown } =
    usePromoValidation({ ctx, startTimeId, rateId, date, total, qty })

  // The amount the UI should display as "Total" — the preview breakdown
  // when a code is validated, otherwise the raw computed total.
  const effectiveTotal =
    promoState === 'valid' && promoBreakdown ? promoBreakdown.total : total

  const meetingPoint = ctx?.startPoints?.[0]
  const showMeetingPoint =
    ctx?.meetingType === 'MEET_ON_LOCATION' && Boolean(meetingPoint)
  const showPickup = Boolean(ctx?.pickupService) && (ctx?.pickupPlaces.length ?? 0) > 0
  // Tours with a pickup service always offer "custom address" as a fallback
  // so a traveller whose hotel isn't in the list can still book — even when
  // Bokun doesn't flip customPickupAllowed (empirically unreliable: audit
  // 2026-04-22 showed the admin toggle doesn't propagate to the REST API).
  // We prefer the explicit Bokun flag when it IS true, else fall back on
  // pickupService=true as a proxy.
  const showCustomPickupToggle =
    ctx?.customPickupAllowed === true || ctx?.pickupService === true

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const card = elements?.getElement(CardElement) ?? null

    // Pre-flight guards — see lib/checkout/submit-helpers (7 unit tests
    // cover ctx-missing, stripe-missing, card-missing, promo-not-validated).
    const guard = validateSubmitPreflight({
      ctx, stripe, elements, card, promoInput, promoState,
    })
    if (!guard.ok) {
      // ctxMissing is silent (context still loading is not a user error);
      // every other key surfaces a translated message in the red banner.
      if (guard.errorKey !== 'ctxMissing') {
        setStep('error')
        setErrorMsg(t(guard.errorKey))
      }
      return
    }
    // ctx, stripe, elements and card are non-null beyond this point.
    // Type-narrowing the discriminated union doesn't carry through
    // separate refs, so we re-assert below via `!`.

    setStep('submitting')
    setErrorMsg('')
    track.bookingAttempt({ tourSlug: tour.slug, value: effectiveTotal })

    const { token, error: stripeError } = await stripe!.createToken(card!, {
      name: `${form.firstName} ${form.lastName}`.trim(),
    })
    if (stripeError || !token) {
      setStep('error')
      setErrorMsg(stripeError?.message ?? t('cardValidationError'))
      return
    }

    try {
      // The body shape is shared with the /api/bokun/checkout/submit
      // route via the CheckoutSubmitRequest type — buildSubmitBody is
      // the single source of truth for client → server payload mapping
      // (15 unit tests cover the cascade rules around customPickup).
      const body = buildSubmitBody({
        form,
        qty,
        ctx: ctx!,
        startTimeId,
        rateId,
        date,
        tokenId: token.id,
        promoState,
        promoBreakdown,
        needsTitleField: needs('title'),
      })
      const res = await fetch('/api/bokun/checkout/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = (await res.json()) as
        | { ok: true; booking: { confirmationCode: string; totalPrice?: number } }
        | { ok: false; error: string; detail?: unknown }
      if (!data.ok) {
        setStep('error')
        setErrorMsg(formatCheckoutErrorMessage(data.error, data.detail))
        return
      }

      // Telemetry guard : flag preview/Bokun price drift > 1 cent.
      // See lib/checkout/submit-helpers.checkPriceMismatch (3 unit tests).
      const mismatch = checkPriceMismatch({
        preview: effectiveTotal,
        bokunTotal: data.booking.totalPrice,
        promoCode: promoBreakdown?.code,
      })
      if (mismatch) {
        // eslint-disable-next-line no-console
        console.error('[checkout] preview/submit total mismatch', mismatch)
      }

      const finalTotal = data.booking.totalPrice ?? effectiveTotal
      setConfirmation({
        code: data.booking.confirmationCode,
        total: finalTotal,
      })
      setStep('success')
      // GA4 standard `purchase` event — feeds the built-in e-commerce
      // reports automatically (conversion rate, revenue, abandoned cart).
      track.purchase({
        tourSlug: tour.slug,
        value: finalTotal,
        confirmationCode: data.booking.confirmationCode,
      })
    } catch (err) {
      setStep('error')
      setErrorMsg(err instanceof Error ? err.message : t('networkError'))
    }
  }

  if (step === 'success' && confirmation) {
    return (
      <SuccessState
        tour={tour}
        total={confirmation.total}
        date={date}
        code={confirmation.code}
        t={t}
      />
    )
  }

  return (
    <aside className="border border-[#E5E5E5] bg-white">
      {devMock && <DevMockBanner t={t} />}

      <header className="bg-[#FAFAFA] border-b border-[#E5E5E5] px-6 py-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-[9px] font-medium tracking-[0.2em] uppercase text-[#248D6C] mb-1.5">
            {t('secureCheckout')}
          </p>
          <p className="text-[#111] text-[15px] font-normal mb-1">
            {ctx?.title ?? tour.name}
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

      {showMeetingPoint && meetingPoint && (
        <MeetingPointBlock point={meetingPoint} t={t} />
      )}

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {ctx && ctx.pricingCategories.length > 0 && (
          <Section title={t('guests')}>
            <div className="border border-[#E5E5E5]">
              {ctx.pricingCategories.map((c, idx) => (
                <PricingCategoryRow
                  key={c.id}
                  category={c}
                  quantity={qty[c.id] ?? 0}
                  unitPrice={rateFor(c.id)}
                  showUnitPrice={tour.pricedPerPerson !== false}
                  onChange={v => setQty(q => ({ ...q, [c.id]: Math.max(0, v) }))}
                  last={idx === ctx.pricingCategories.length - 1}
                />
              ))}
            </div>
          </Section>
        )}

        <Section title={t('guestDetails')}>
          <div className="grid grid-cols-2 gap-3">
            <Field id="cp-first" label={t('firstName')} required>
              <input
                id="cp-first"
                type="text"
                required
                value={form.firstName}
                onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                placeholder={t('firstNamePh')}
                className="w-full border border-[#E5E5E5] text-[#111] text-[13px] font-light px-3.5 py-2.5 outline-none focus:border-[#248D6C] transition-colors placeholder:text-[#aaa]"
              />
            </Field>
            <Field id="cp-last" label={t('lastName')} required>
              <input
                id="cp-last"
                type="text"
                required
                value={form.lastName}
                onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                placeholder={t('lastNamePh')}
                className="w-full border border-[#E5E5E5] text-[#111] text-[13px] font-light px-3.5 py-2.5 outline-none focus:border-[#248D6C] transition-colors placeholder:text-[#aaa]"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field id="cp-email" label={t('email')} required>
              <input
                id="cp-email"
                type="email"
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder={t('emailPh')}
                className="w-full border border-[#E5E5E5] text-[#111] text-[13px] font-light px-3.5 py-2.5 outline-none focus:border-[#248D6C] transition-colors placeholder:text-[#aaa]"
              />
            </Field>
            <Field id="cp-phone" label={t('phone')} required={needs('phoneNumber')}>
              <input
                id="cp-phone"
                type="tel"
                required={needs('phoneNumber')}
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder={t('phonePh')}
                className="w-full border border-[#E5E5E5] text-[#111] text-[13px] font-light px-3.5 py-2.5 outline-none focus:border-[#248D6C] transition-colors placeholder:text-[#aaa]"
              />
            </Field>
          </div>

          {showPickup && ctx && (
            <>
              {!form.customPickup && (
                <PickupCombobox
                  places={ctx.pickupPlaces}
                  value={form.pickupTitle}
                  onSelect={p =>
                    setForm(f => ({
                      ...f,
                      pickupId: p.id,
                      pickupTitle: p.title,
                      roomNumber: p.askForRoomNumber ? f.roomNumber : '',
                    }))
                  }
                  onChange={v =>
                    setForm(f => ({ ...f, pickupTitle: v, pickupId: null }))
                  }
                  t={t}
                />
              )}

              {needsRoomNumber && !form.customPickup && (
                <Field id="cp-room" label={t('roomNumber')} required>
                  <input
                    id="cp-room"
                    type="text"
                    required
                    value={form.roomNumber}
                    onChange={e => setForm(f => ({ ...f, roomNumber: e.target.value }))}
                    placeholder={t('roomNumberPh')}
                    className="w-full border border-[#E5E5E5] text-[#111] text-[13px] font-light px-3.5 py-2.5 outline-none focus:border-[#248D6C] transition-colors placeholder:text-[#aaa]"
                  />
                </Field>
              )}

              {showCustomPickupToggle && (
                <CustomPickupToggle
                  on={form.customPickup}
                  onToggle={v =>
                    setForm(f => ({
                      ...f,
                      customPickup: v,
                      pickupId: v ? null : f.pickupId,
                      pickupTitle: v ? '' : f.pickupTitle,
                      roomNumber: v ? '' : f.roomNumber,
                      customPickupAddress: v ? f.customPickupAddress : '',
                      customPickupLat: v ? f.customPickupLat : undefined,
                      customPickupLon: v ? f.customPickupLon : undefined,
                    }))
                  }
                  t={t}
                />
              )}

              {form.customPickup && showCustomPickupToggle && (
                <AddressAutocomplete
                  id="cp-custom-addr"
                  label={t('pickupAddress')}
                  required
                  value={{
                    text: form.customPickupAddress,
                    lat: form.customPickupLat,
                    lon: form.customPickupLon,
                  }}
                  onChange={v =>
                    setForm(f => ({
                      ...f,
                      customPickupAddress: v.text,
                      customPickupLat: v.lat,
                      customPickupLon: v.lon,
                    }))
                  }
                  placeholder={t('pickupAddressPh')}
                  hint={t('pickupAddressHint')}
                />
              )}
            </>
          )}
        </Section>

        {ctx && ctx.bookingQuestions.length > 0 && (
          <Section title={t('moreQuestions')}>
            {ctx.bookingQuestions.map(q => (
              <Field
                key={q.id}
                id={`cp-q-${q.id}`}
                label={q.label}
                required={q.required}
              >
                <input
                  id={`cp-q-${q.id}`}
                  type="text"
                  required={q.required}
                  value={form.answers[q.id] ?? ''}
                  onChange={e =>
                    setForm(f => ({
                      ...f,
                      answers: { ...f.answers, [q.id]: e.target.value },
                    }))
                  }
                  className="w-full border border-[#E5E5E5] text-[#111] text-[13px] font-light px-3.5 py-2.5 outline-none focus:border-[#248D6C] transition-colors"
                />
              </Field>
            ))}
          </Section>
        )}

        <Field id="cp-requests" label={t('specialRequests')}>
          <textarea
            id="cp-requests"
            rows={2}
            value={form.requests}
            onChange={e => setForm(f => ({ ...f, requests: e.target.value }))}
            placeholder={t('specialRequestsPh')}
            className="w-full border border-[#E5E5E5] text-[#111] text-[13px] font-light px-3.5 py-2.5 outline-none focus:border-[#248D6C] transition-colors placeholder:text-[#aaa] resize-none"
          />
        </Field>

        <PromoCodeBlock
          input={promoInput}
          onChange={setPromoInput}
          state={promoState}
          error={promoError}
          breakdown={promoBreakdown}
          t={t}
        />


        {ctx && (
          <WhatsIncludedPanel
            included={ctx.content.included}
            excluded={ctx.content.excluded}
            attention={ctx.content.attention}
            requirements={ctx.content.requirements}
            t={t}
          />
        )}

        <div className="h-px bg-[#E5E5E5]" />

        <Section title={t('payment')}>
          <StripeCard fallback={!STRIPE_KEY} t={t} />
          <p className="text-[10px] font-light text-[#717170] leading-relaxed mt-1">
            {t('paymentNote')}
          </p>
        </Section>

        {step === 'error' && errorMsg && (
          <div className="bg-red-50 border border-red-200 px-3.5 py-2.5 text-[12px] font-light text-red-700">
            {errorMsg}
          </div>
        )}

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

        <button
          type="submit"
          disabled={step === 'submitting' || totalGuests === 0 || !stripe}
          className="cta-smoke cta-breathe w-full text-white text-[10px] font-semibold tracking-[0.16em] uppercase py-4 disabled:opacity-60"
        >
          {step === 'submitting'
            ? t('processing')
            : t('payAndConfirm', { amount: effectiveTotal })}
        </button>

        <CancellationLine policy={ctx?.cancellationPolicy} t={t} />
      </form>
    </aside>
  )
}

// PromoCodeBlock moved to components/checkout/PromoCodeBlock.tsx
// 10 sub-components moved to components/checkout/ during Phase 2A
// (StripeCard, MeetingPointBlock, CustomPickupToggle, PricingCategoryRow,
//  QtyStepper, Section, Field, CancellationLine, DevMockBanner, SuccessState)
