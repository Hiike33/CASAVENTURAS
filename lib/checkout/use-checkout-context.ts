/**
 * Hook : fetches the Bokun checkout context (pricing categories,
 * pickup places, booking questions, required customer fields, ...) for
 * a given product id and seeds the per-category quantity map with a
 * sensible default (2 adults if a defaultCategory is flagged, 0 otherwise).
 *
 * Why a hook (vs a server prop) :
 *   • Bokun's response per product is dynamic — admin tweaks (new
 *     question, pickup edit) propagate live without redeploy.
 *   • The dependent /promo/validate effect needs `ctx` to compute its
 *     payload, so we can't push the fetch into a Server Component.
 *
 * Aborts in-flight fetch on unmount or productId change so navigating
 * between tours never races two fetches into the same `setCtx`.
 *
 * Extracted from components/CheckoutPanel.tsx during Phase 2B-1
 * (audit 2026-04-26).
 */

'use client'

import { useEffect, useState } from 'react'
import type { CheckoutContext } from '@/app/api/bokun/checkout-context/route'

export type UseCheckoutContextResult = {
  ctx: CheckoutContext | null
  qty: Record<number, number>
  setQty: React.Dispatch<React.SetStateAction<Record<number, number>>>
}

export function useCheckoutContext(
  productId: number | undefined,
): UseCheckoutContextResult {
  const [ctx, setCtx] = useState<CheckoutContext | null>(null)
  const [qty, setQty] = useState<Record<number, number>>({})

  useEffect(() => {
    if (!productId) return
    const ctrl = new AbortController()
    fetch(`/api/bokun/checkout-context?productId=${productId}`, {
      signal: ctrl.signal,
    })
      .then(r => r.json())
      .then((data: { ok: boolean; context?: CheckoutContext }) => {
        if (!data.ok || !data.context) return
        setCtx(data.context)
        const seed: Record<number, number> = {}
        for (const c of data.context.pricingCategories) {
          seed[c.id] = c.defaultCategory ? 2 : 0
        }
        setQty(seed)
      })
      .catch(() => {
        // AbortError on unmount, or network blip — silent fallback.
        // The form stays usable with ctx=null (most fields render
        // conditionally on `ctx && ...`).
      })
    return () => ctrl.abort()
  }, [productId])

  return { ctx, qty, setQty }
}
