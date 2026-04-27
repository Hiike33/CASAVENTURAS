import { test } from 'node:test'
import assert from 'node:assert/strict'
import { enrichWithLivePrices } from './live-price-enrichment.ts'
import type { Tour } from '../types/cms.ts'

// Minimal Tour fixture — only the fields enrichWithLivePrices reads
// (price, bokunProductId, slug). Full Tour shape is much wider; cast
// via `as Tour` keeps this file readable.
function tour(overrides: Partial<Tour> = {}): Tour {
  return {
    slug: 'el-yunque',
    name: 'El Yunque',
    price: 89,
    bokunProductId: 448405,
    ...overrides,
  } as Tour
}

// ─── Happy path : Bokun returns a live price ──────────────────────────────

test('Bokun OK → live price overrides snapshot price', async () => {
  const fetcher = async (id: number) => {
    assert.equal(id, 448405, 'fetcher called with productId')
    return 77
  }
  const out = await enrichWithLivePrices([tour({ price: 89 })], fetcher)
  assert.equal(out[0].price, 77, 'live price wins over snapshot')
})

test('Multiple tours each get their own live price (parallel)', async () => {
  const calls: number[] = []
  const fetcher = async (id: number) => {
    calls.push(id)
    return id === 448405 ? 80 : 250
  }
  const out = await enrichWithLivePrices(
    [
      tour({ slug: 'el-yunque', bokunProductId: 448405, price: 89 }),
      tour({ slug: 'catamaran', bokunProductId: 1134501, price: 249 }),
    ],
    fetcher,
  )
  assert.equal(out[0].price, 80)
  assert.equal(out[1].price, 250)
  assert.deepEqual(
    calls.sort((a, b) => a - b),
    [448405, 1134501],
    'both tours fetched',
  )
})

// ─── Fallback paths : Bokun absent / unreachable / no slots ───────────────

test('Bokun returns null (no bookable slots) → snapshot price kept', async () => {
  const fetcher = async () => null
  const out = await enrichWithLivePrices([tour({ price: 89 })], fetcher)
  assert.equal(out[0].price, 89, 'fallback to snapshot when no live data')
})

test('Bokun fetch throws → snapshot price kept (silent fallback)', async () => {
  const fetcher = async () => {
    throw new Error('bokun unreachable')
  }
  const out = await enrichWithLivePrices([tour({ price: 89 })], fetcher)
  assert.equal(out[0].price, 89, 'try/catch must not crash render')
})

test('Bokun fetch rejects with BokunConfigError → fallback (CI without creds)', async () => {
  const fetcher = async () => {
    // Mirrors lib/bokun/client.ts:24-29 BokunConfigError
    const err = new Error('BOKUN_ACCESS_KEY / BOKUN_SECRET_KEY not set')
    ;(err as Error & { name: string }).name = 'BokunConfigError'
    throw err
  }
  const out = await enrichWithLivePrices([tour({ price: 89 })], fetcher)
  assert.equal(out[0].price, 89)
})

// ─── Tours without Bokun integration are skipped ──────────────────────────

test('Tour with no bokunProductId → no fetch, returned as-is', async () => {
  let called = false
  const fetcher = async () => {
    called = true
    return 42
  }
  const t = tour({ bokunProductId: undefined, price: 89 })
  const out = await enrichWithLivePrices([t], fetcher)
  assert.equal(called, false, 'fetcher not called when productId missing')
  assert.equal(out[0].price, 89)
})

test('Tour with bokunProductId = 0 → treated as absent (skip fetch)', async () => {
  // 0 is falsy in JS; spec / data fixtures should never use it but be defensive
  let called = false
  const fetcher = async () => {
    called = true
    return 42
  }
  const out = await enrichWithLivePrices([tour({ bokunProductId: 0, price: 89 })], fetcher)
  assert.equal(called, false)
  assert.equal(out[0].price, 89)
})

// ─── Pure function determinism ────────────────────────────────────────────

test('Empty tours list → returns empty array (no fetch)', async () => {
  let called = false
  const fetcher = async () => {
    called = true
    return 1
  }
  const out = await enrichWithLivePrices([], fetcher)
  assert.deepEqual(out, [])
  assert.equal(called, false)
})

test('Returns a NEW array (no input mutation)', async () => {
  const input: Tour[] = [tour({ price: 89 })]
  const fetcher = async () => 77
  const out = await enrichWithLivePrices(input, fetcher)
  assert.notStrictEqual(out, input, 'must not return the input array reference')
  assert.equal(input[0].price, 89, 'input element not mutated')
  assert.equal(out[0].price, 77)
})
