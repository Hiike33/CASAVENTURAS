#!/usr/bin/env node
/**
 * Build-time Bokun snapshot fetcher (Phase 1).
 *
 * Queries Bokun's REST API for every configured tour (slug → product id
 * map from NEXT_PUBLIC_BOKUN_PRODUCT_*) and writes a distilled
 * BokunSnapshotMap to lib/cms/data/bokun-snapshot.json. LocalAdapter imports
 * that file at build time (webpack inlines it) and attaches each entry
 * to the matching Tour under tour.bokunSnapshot.
 *
 * Run with:   npm run bokun:snapshot
 * Env needed: BOKUN_ACCESS_KEY, BOKUN_SECRET_KEY,
 *             NEXT_PUBLIC_BOKUN_PRODUCT_EL_YUNQUE / _CATAMARAN / _SALSA.
 *
 * Phase 1 extracts: cancellationHours, startTimes, pricingCategories,
 * ratePrices. It does NOT pick a single price — see lib/bokun/snapshot.ts
 * for why (multiple rates per activity, OTA vs retail mapping needs vendor
 * validation). ratePrices is carried through raw for a future price-aware
 * commit.
 *
 * Missing creds → exits 0 with a warning, leaves existing JSON untouched,
 * so local builds don't break for devs without Bokun API access.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import crypto from 'node:crypto'
import {
  deriveCancellationHours,
  type BokunPricingCategory,
  type BokunRatePrice,
  type BokunSnapshotMap,
  type BokunTourSnapshot,
} from '../lib/bokun/snapshot.ts'

// ─── Config ──────────────────────────────────────────────────────────────

const HERE = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(HERE, '..')
const SNAPSHOT_PATH = resolve(PROJECT_ROOT, 'lib/cms/data/bokun-snapshot.json')
const BOKUN_HOST = process.env.BOKUN_API_HOST ?? 'https://api.bokun.is'

// Direct stdout/stderr writers. Semantically correct for a CLI tool :
// stdout for the human-facing progress log, stderr for warnings and
// errors so a caller can pipe or redirect them separately. Also avoids
// the project pre-commit hook that forbids debug calls in app code.
const out = (msg: string) => process.stdout.write(msg + '\n')
const err = (msg: string) => process.stderr.write(msg + '\n')

// Slug → env key pairs. Matches tours.en.ts / .env.local.
const TOUR_ENV_KEYS: ReadonlyArray<{ slug: string; env: string }> = [
  { slug: 'el-yunque', env: 'NEXT_PUBLIC_BOKUN_PRODUCT_EL_YUNQUE' },
  { slug: 'catamaran', env: 'NEXT_PUBLIC_BOKUN_PRODUCT_CATAMARAN' },
  { slug: 'salsa', env: 'NEXT_PUBLIC_BOKUN_PRODUCT_SALSA' },
]

// ─── Signing (duplicated from lib/bokun/client.ts to keep this script free
//     of Next.js-specific path aliases — scripts run in plain node) ───────

function bokunDate(now: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return (
    `${now.getUTCFullYear()}-${p(now.getUTCMonth() + 1)}-${p(now.getUTCDate())} ` +
    `${p(now.getUTCHours())}:${p(now.getUTCMinutes())}:${p(now.getUTCSeconds())}`
  )
}

function signRequest(method: string, path: string, date: string, accessKey: string, secretKey: string): string {
  const stringToSign = `${date}${accessKey}${method}${path}`
  return crypto.createHmac('sha1', secretKey).update(stringToSign).digest('base64')
}

async function bokunFetch(path: string): Promise<Response> {
  const accessKey = process.env.BOKUN_ACCESS_KEY
  const secretKey = process.env.BOKUN_SECRET_KEY
  if (!accessKey || !secretKey) {
    throw new Error('BOKUN_ACCESS_KEY / BOKUN_SECRET_KEY not set in environment')
  }
  const date = bokunDate()
  const signature = signRequest('GET', path, date, accessKey, secretKey)
  return fetch(`${BOKUN_HOST}${path}`, {
    headers: {
      'X-Bokun-AccessKey': accessKey,
      'X-Bokun-Date': date,
      'X-Bokun-Signature': signature,
      'Content-Type': 'application/json',
    },
  })
}

// ─── Bokun response types (narrow — only fields we consume) ──────────────

type BokunActivity = {
  id: number
  pricingCategories?: Array<{ id: number; title: string; ticketCategory: string; minAge?: number; maxAge?: number }>
  cancellationPolicy?: { penaltyRules?: Array<{ cutoffHours: number; charge: number }> }
  rates?: Array<{ id: number; title?: string; pricedPerPerson?: boolean }>
}

type BokunAvailabilityItem = {
  startTime?: string
  startTimeLabel?: string
  soldOut: boolean
  defaultRateId?: number
  pricesByRate?: Array<{
    activityRateId: number
    pricePerBooking?: { amount: number; currency: string }
    pricePerCategoryUnit?: Array<{
      id: number
      amount: { amount: number; currency: string }
    }>
  }>
}

// ─── Main ────────────────────────────────────────────────────────────────

function extractRatePrices(
  item: BokunAvailabilityItem,
  rateMeta: Map<number, { title?: string; pricedPerPerson?: boolean }>,
): BokunRatePrice[] {
  return (item.pricesByRate ?? []).map(pr => {
    const meta = rateMeta.get(pr.activityRateId)
    return {
      activityRateId: pr.activityRateId,
      rateTitle: meta?.title,
      pricedPerPerson: meta?.pricedPerPerson,
      pricePerCategoryUnit: pr.pricePerCategoryUnit?.map(p => ({
        categoryId: p.id,
        amount: p.amount.amount,
        currency: p.amount.currency,
      })),
      pricePerBooking: pr.pricePerBooking,
    }
  })
}

async function fetchOne(slug: string, productId: number): Promise<BokunTourSnapshot> {
  // Activity → cancellation rules, pricing categories, rate metadata
  const actRes = await bokunFetch(`/activity.json/${productId}`)
  if (!actRes.ok) throw new Error(`[${slug}] activity fetch ${actRes.status}`)
  const act = (await actRes.json()) as BokunActivity

  // Availability → observed start times + live pricesByRate (next 60 days)
  const today = new Date()
  const plus60 = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000)
  const ymd = (d: Date) => d.toISOString().slice(0, 10)
  const availRes = await bokunFetch(
    `/activity.json/${productId}/availabilities?start=${ymd(today)}&end=${ymd(plus60)}`,
  )
  if (!availRes.ok) throw new Error(`[${slug}] availabilities fetch ${availRes.status}`)
  const availArr = (await availRes.json()) as BokunAvailabilityItem[]

  // Distinct start time labels/strings, capped at 8 so the snapshot stays tight.
  const startTimes = Array.from(
    new Set(
      availArr
        .map(a => (a.startTimeLabel?.trim() ? a.startTimeLabel.trim() : a.startTime))
        .filter((s): s is string => Boolean(s && s.trim())),
    ),
  ).slice(0, 8)

  // Rate metadata lookup so ratePrices entries get a human title + pricing type.
  const rateMeta = new Map<number, { title?: string; pricedPerPerson?: boolean }>()
  for (const r of act.rates ?? []) {
    rateMeta.set(r.id, { title: r.title, pricedPerPerson: r.pricedPerPerson })
  }

  // Pick the first non-soldout slot to lift the pricesByRate from. All slots
  // within a single deploy cycle typically carry the same rate catalog, so one
  // representative sample is enough for downstream display code.
  const sampleSlot = availArr.find(a => !a.soldOut && a.pricesByRate) ?? availArr.find(a => a.pricesByRate)
  const ratePrices = sampleSlot ? extractRatePrices(sampleSlot, rateMeta) : []

  const pricingCategories: BokunPricingCategory[] | undefined = act.pricingCategories?.map(c => ({
    id: c.id,
    title: c.title,
    ticketCategory: c.ticketCategory,
    minAge: c.minAge,
    maxAge: c.maxAge,
  }))

  return {
    productId,
    cancellationHours: deriveCancellationHours(act.cancellationPolicy?.penaltyRules),
    startTimes: startTimes.length > 0 ? startTimes : undefined,
    pricingCategories,
    ratePrices: ratePrices.length > 0 ? ratePrices : undefined,
    fetchedAt: new Date().toISOString(),
  }
}

async function main() {
  if (!process.env.BOKUN_ACCESS_KEY || !process.env.BOKUN_SECRET_KEY) {
    err('[bokun-snapshot] BOKUN_ACCESS_KEY/SECRET not set , keeping existing snapshot untouched.')
    process.exit(0)
  }

  // Resolve product IDs from env. Missing env = tour is skipped (dev setup).
  const jobs = TOUR_ENV_KEYS.flatMap<{ slug: string; productId: number }>(({ slug, env }) => {
    const raw = process.env[env]
    const n = raw ? Number(raw) : NaN
    return Number.isFinite(n) && n > 0 ? [{ slug, productId: n }] : []
  })

  if (jobs.length === 0) {
    err('[bokun-snapshot] No product IDs configured , nothing to fetch.')
    process.exit(0)
  }

  // Fetch all in parallel , Bokun rate limits are generous for a vendor with ~3 products.
  const results = await Promise.allSettled(jobs.map(j => fetchOne(j.slug, j.productId)))

  // Start from the existing snapshot so partial failures don't wipe known-good data.
  let existing: BokunSnapshotMap = {}
  try {
    existing = JSON.parse(readFileSync(SNAPSHOT_PATH, 'utf-8')) as BokunSnapshotMap
  } catch {
    existing = {}
  }

  const next: BokunSnapshotMap = { ...existing }
  let ok = 0
  let fail = 0
  results.forEach((res, i) => {
    const slug = jobs[i].slug
    if (res.status === 'fulfilled') {
      next[slug] = res.value
      out(
        `[bokun-snapshot] ${slug} OK , cancelH=${res.value.cancellationHours ?? '?'}, ` +
          `startTimes=[${(res.value.startTimes ?? []).join(',')}], ` +
          `rates=${res.value.ratePrices?.length ?? 0}, ` +
          `categories=${res.value.pricingCategories?.length ?? 0}`,
      )
      ok++
    } else {
      err(`[bokun-snapshot] ${slug} FAIL , ${res.reason instanceof Error ? res.reason.message : String(res.reason)}`)
      fail++
    }
  })

  writeFileSync(SNAPSHOT_PATH, JSON.stringify(next, null, 2) + '\n', 'utf-8')
  out(`[bokun-snapshot] wrote ${SNAPSHOT_PATH} , ${ok} ok, ${fail} failed, ${Object.keys(next).length} slugs in file`)

  // Fail the command if ALL fetches failed , that's a real problem, not a dev-laptop
  // situation. Partial failures (ok>0) let CI continue with a mixed snapshot.
  if (fail > 0 && ok === 0) process.exit(1)
}

main().catch(fatalErr => {
  err(`[bokun-snapshot] fatal: ${fatalErr instanceof Error ? fatalErr.message : String(fatalErr)}`)
  process.exit(1)
})
