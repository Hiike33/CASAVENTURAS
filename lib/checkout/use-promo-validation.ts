/**
 * Hook : debounced live preview of a promo code's discount, hitting
 * /api/bokun/promo/validate 500 ms after the user stops typing and
 * re-firing whenever any priced input changes (qty / date / startTimeId)
 * so the displayed breakdown never diverges from the basket the user
 * is about to commit to.
 *
 * State machine :
 *   idle      — empty input, banner hidden
 *   checking  — debounce expired, request in flight (spinner)
 *   valid     — Bokun confirmed discount, breakdown rendered
 *   invalid   — code rejected (with `reason`) or network error
 *
 * Stale-response guard : every fetch is tagged with an incrementing
 * ticket from `promoReqCounter`. A late response whose ticket no longer
 * matches the current counter is dropped silently. This prevents an
 * old "valid" response from clobbering a fresh "invalid" one when the
 * user types fast.
 *
 * Telemetry : fires track.promoApplied on every Bokun response (valid
 * + invalid with reason). Network errors are NOT tracked — they're not
 * a user-attributable signal.
 *
 * Extracted from components/CheckoutPanel.tsx during Phase 2B-3
 * (audit 2026-04-26).
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import { track } from '@/lib/analytics/events'
import type { CheckoutContext } from '@/app/api/bokun/checkout-context/route'

export type PromoState = 'idle' | 'checking' | 'valid' | 'invalid'

export type PromoErrorReason =
  | 'invalid_code'
  | 'expired'
  | 'min_not_met'
  | 'usage_limit'
  | 'product_not_eligible'
  | 'network'

export type PromoBreakdown = {
  subtotal: number
  discount: number
  total: number
  currency: string
  code: string
}

export type UsePromoValidationArgs = {
  ctx: CheckoutContext | null
  startTimeId: number
  rateId: number
  /** yyyy-MM-dd */
  date: string
  /** Current pre-promo subtotal — re-validates promo when this changes. */
  total: number
  qty: Record<number, number>
}

export type UsePromoValidationResult = {
  promoInput: string
  setPromoInput: (v: string) => void
  promoState: PromoState
  promoError: PromoErrorReason | null
  promoBreakdown: PromoBreakdown | null
}

const DEBOUNCE_MS = 500

export function usePromoValidation({
  ctx,
  startTimeId,
  rateId,
  date,
  total,
  qty,
}: UsePromoValidationArgs): UsePromoValidationResult {
  const [promoInput, setPromoInput] = useState('')
  const [promoState, setPromoState] = useState<PromoState>('idle')
  const [promoBreakdown, setPromoBreakdown] = useState<PromoBreakdown | null>(
    null,
  )
  const [promoError, setPromoError] = useState<PromoErrorReason | null>(null)

  const promoReqCounter = useRef(0)

  useEffect(() => {
    const code = promoInput.trim()
    if (!code) {
      setPromoState('idle')
      setPromoBreakdown(null)
      setPromoError(null)
      return
    }
    if (!ctx || !startTimeId || !rateId || total <= 0) return

    setPromoState('checking')
    setPromoError(null)
    const ticket = ++promoReqCounter.current
    const timer = window.setTimeout(async () => {
      try {
        const passengersByCategory: Record<number, number> = {}
        for (const c of ctx.pricingCategories) {
          const q = qty[c.id] ?? 0
          if (q > 0) passengersByCategory[c.id] = q
        }
        const res = await fetch('/api/bokun/promo/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: ctx.productId,
            startTimeId,
            rateId,
            date,
            passengersByCategory,
            subtotal: total,
            currency: 'USD',
            promoCode: code,
          }),
        })
        const data = (await res.json()) as
          | {
              ok: true
              valid: true
              code: string
              subtotal: number
              discount: number
              total: number
              currency: string
            }
          | {
              ok: true
              valid: false
              reason:
                | 'invalid_code'
                | 'expired'
                | 'min_not_met'
                | 'usage_limit'
                | 'product_not_eligible'
            }
          | { ok: false; error: string }

        // Stale-response guard — drop late responses superseded by a newer ticket.
        if (ticket !== promoReqCounter.current) return

        if (!data.ok) {
          setPromoState('invalid')
          setPromoError('network')
          setPromoBreakdown(null)
          return
        }
        if (!data.valid) {
          setPromoState('invalid')
          setPromoError(data.reason)
          setPromoBreakdown(null)
          track.promoApplied({ code, valid: false, reason: data.reason })
          return
        }
        setPromoState('valid')
        setPromoError(null)
        setPromoBreakdown({
          subtotal: data.subtotal,
          discount: data.discount,
          total: data.total,
          currency: data.currency,
          code: data.code,
        })
        track.promoApplied({
          code: data.code,
          valid: true,
          discount: data.discount,
        })
      } catch {
        if (ticket !== promoReqCounter.current) return
        setPromoState('invalid')
        setPromoError('network')
        setPromoBreakdown(null)
      }
    }, DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [promoInput, ctx, startTimeId, rateId, date, total, qty])

  return { promoInput, setPromoInput, promoState, promoError, promoBreakdown }
}
