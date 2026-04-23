import { test } from 'node:test'
import assert from 'node:assert/strict'
import { resolveCheckoutPriceMap, type RuntimeRatePrice } from './checkout-prices.ts'
import type { BokunRatePrice } from './snapshot.ts'

// Real-shape fixtures captured from Cloudflare preview on 2026-04-23.
function liveRuntime(adult = 78, child = 78): RuntimeRatePrice[] {
  return [
    {
      activityRateId: 918982,
      pricePerCategoryUnit: [
        { id: 725662, amount: { amount: adult, currency: 'USD' } },
        { id: 801219, amount: { amount: child, currency: 'USD' } },
      ],
    },
  ]
}

function snapshotFixture(adult = 75, child = 75): BokunRatePrice[] {
  return [
    {
      activityRateId: 918982,
      rateTitle: 'Vivid El Yunque',
      pricedPerPerson: true,
      pricePerCategoryUnit: [
        { categoryId: 725662, amount: adult, currency: 'USD' },
        { categoryId: 801219, amount: child, currency: 'USD' },
      ],
    },
  ]
}

// ─── Runtime source (live) ────────────────────────────────────────────────

test('runtime data is used when available (overrides snapshot)', () => {
  const map = resolveCheckoutPriceMap({
    runtime: liveRuntime(78, 78),
    snapshot: snapshotFixture(75, 75),
  })
  assert.equal(map.get(725662), 78, 'should pick runtime adult price')
  assert.equal(map.get(801219), 78, 'should pick runtime child price')
})

test('runtime matches preferredRateId when multiple rates exist', () => {
  const runtime: RuntimeRatePrice[] = [
    { activityRateId: 111, pricePerCategoryUnit: [{ id: 1, amount: { amount: 10, currency: 'USD' } }] },
    { activityRateId: 222, pricePerCategoryUnit: [{ id: 1, amount: { amount: 20, currency: 'USD' } }] },
  ]
  assert.equal(resolveCheckoutPriceMap({ runtime, preferredRateId: 222 }).get(1), 20)
  assert.equal(resolveCheckoutPriceMap({ runtime, preferredRateId: 111 }).get(1), 10)
})

test('runtime falls back to first rate when preferredRateId unknown', () => {
  const runtime: RuntimeRatePrice[] = [
    { activityRateId: 111, pricePerCategoryUnit: [{ id: 1, amount: { amount: 10, currency: 'USD' } }] },
  ]
  assert.equal(resolveCheckoutPriceMap({ runtime, preferredRateId: 999 }).get(1), 10)
})

// ─── Snapshot fallback ────────────────────────────────────────────────────

test('falls back to snapshot when runtime is undefined', () => {
  const map = resolveCheckoutPriceMap({ snapshot: snapshotFixture(75, 60) })
  assert.equal(map.get(725662), 75)
  assert.equal(map.get(801219), 60)
})

test('falls back to snapshot when runtime array is empty', () => {
  const map = resolveCheckoutPriceMap({
    runtime: [],
    snapshot: snapshotFixture(75, 75),
  })
  assert.equal(map.get(725662), 75)
})

test('falls back to snapshot when runtime rate has no pricePerCategoryUnit', () => {
  const map = resolveCheckoutPriceMap({
    runtime: [{ activityRateId: 918982 }], // no pricePerCategoryUnit
    snapshot: snapshotFixture(75, 75),
  })
  assert.equal(map.get(725662), 75, 'should fall back to snapshot')
})

test('snapshot also honors preferredRateId', () => {
  const snapshot: BokunRatePrice[] = [
    { activityRateId: 111, pricePerCategoryUnit: [{ categoryId: 1, amount: 10, currency: 'USD' }] },
    { activityRateId: 222, pricePerCategoryUnit: [{ categoryId: 1, amount: 20, currency: 'USD' }] },
  ]
  assert.equal(resolveCheckoutPriceMap({ snapshot, preferredRateId: 222 }).get(1), 20)
})

// ─── Both missing ─────────────────────────────────────────────────────────

test('returns empty map when both sources are absent', () => {
  const map = resolveCheckoutPriceMap({})
  assert.equal(map.size, 0)
})

test('returns empty map when both sources are empty', () => {
  const map = resolveCheckoutPriceMap({ runtime: [], snapshot: [] })
  assert.equal(map.size, 0)
})

// ─── Defensive parsing ────────────────────────────────────────────────────

test('ignores malformed runtime entries', () => {
  const runtime: RuntimeRatePrice[] = [
    {
      activityRateId: 918982,
      pricePerCategoryUnit: [
        { id: 725662, amount: { amount: 78, currency: 'USD' } },
        { id: NaN as number, amount: { amount: 100, currency: 'USD' } }, // bad id
        { id: 801219, amount: { amount: NaN as number, currency: 'USD' } }, // bad amount
      ],
    },
  ]
  const map = resolveCheckoutPriceMap({ runtime })
  assert.equal(map.get(725662), 78)
  assert.equal(map.size, 1, 'malformed entries must be dropped silently')
})

test('rejects negative amounts', () => {
  const runtime: RuntimeRatePrice[] = [
    {
      activityRateId: 918982,
      pricePerCategoryUnit: [{ id: 725662, amount: { amount: -10, currency: 'USD' } }],
    },
  ]
  const map = resolveCheckoutPriceMap({
    runtime,
    snapshot: snapshotFixture(75, 75),
  })
  // Runtime had a negative → skipped; with 0 valid entries, falls back to snapshot
  assert.equal(map.get(725662), 75)
})

test('accepts amount=0 as valid (edge case: free category)', () => {
  const runtime: RuntimeRatePrice[] = [
    {
      activityRateId: 918982,
      pricePerCategoryUnit: [{ id: 801219, amount: { amount: 0, currency: 'USD' } }],
    },
  ]
  const map = resolveCheckoutPriceMap({ runtime })
  assert.equal(map.get(801219), 0)
})

// ─── Determinism ──────────────────────────────────────────────────────────

test('pure function — same inputs yield same map', () => {
  const input = { runtime: liveRuntime(), snapshot: snapshotFixture() }
  const a = resolveCheckoutPriceMap(input)
  const b = resolveCheckoutPriceMap(input)
  assert.deepEqual([...a.entries()].sort(), [...b.entries()].sort())
})
