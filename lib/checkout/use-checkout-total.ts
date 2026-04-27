/**
 * Hook : memoizes the per-category price map + the booking total, plus
 * exposes a `rateFor(categoryId)` helper for inline JSX usage. Wraps
 * pure helpers from ./checkout-totals.ts (which carry the business
 * logic and are unit-tested).
 *
 * Why split (hook vs pure) : useMemo needs React, but the math itself
 * is just data-in / data-out. The pure module runs under
 * `node --test` (no RTL needed); this file only adds memoization.
 *
 * Replaces the eslint-disable react-hooks/exhaustive-deps that the
 * inline version of the total useMemo carried (it omitted `rateFor`
 * by design because rateFor was an inline closure). By passing
 * priceByCategory directly into computeTotal, the deps are clean.
 *
 * Extracted from components/CheckoutPanel.tsx during Phase 2B-2.
 */

'use client'

import { useMemo } from 'react'
import {
  resolveCheckoutPriceMap,
  type RuntimeRatePrice,
} from '@/lib/bokun/checkout-prices'
import { computeTotal, computeTotalGuests } from './checkout-totals'
import type { CheckoutContext } from '@/app/api/bokun/checkout-context/route'
import type { Tour } from '@/lib/types/cms'

export type UseCheckoutTotalArgs = {
  ctx: CheckoutContext | null
  qty: Record<number, number>
  tour: Tour
  pricesByRate?: RuntimeRatePrice[]
  rateId?: number
}

export type UseCheckoutTotalResult = {
  total: number
  totalGuests: number
  /** Per-category unit price lookup, used by PricingCategoryRow. */
  rateFor: (categoryId: number) => number
}

export function useCheckoutTotal({
  ctx,
  qty,
  tour,
  pricesByRate,
  rateId,
}: UseCheckoutTotalArgs): UseCheckoutTotalResult {
  // Live (when present) overrides build-time snapshot. resolveCheckoutPriceMap
  // is already pure + unit-tested in lib/bokun/checkout-prices.test.ts.
  const priceByCategory = useMemo(
    () =>
      resolveCheckoutPriceMap({
        runtime: pricesByRate,
        snapshot: tour.bokunSnapshot?.ratePrices,
        preferredRateId: rateId || undefined,
      }),
    [pricesByRate, tour.bokunSnapshot, rateId],
  )

  const totalGuests = computeTotalGuests(qty)

  const total = useMemo(
    () => computeTotal(ctx, qty, tour, priceByCategory),
    [ctx, qty, tour, priceByCategory],
  )

  const rateFor = (categoryId: number): number =>
    priceByCategory.get(categoryId) ?? tour.price

  return { total, totalGuests, rateFor }
}
