import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Tour } from '../../types/cms.ts'
import { tours } from './tours.en.ts'
import { enrichToursWithSnapshot, formatStartTime, getDisplayTime, getDisplayDaysLabel } from '../../bokun/snapshot.ts'
import type { BokunSnapshotMap, BokunTourSnapshot } from '../../bokun/snapshot.ts'

// Load the real Bokun snapshot committed alongside the code. If the file is
// empty ({}) on a dev laptop without creds, these integration assertions
// skip rather than fail , the pure unit tests below still run.
const here = dirname(fileURLToPath(import.meta.url))
const snapshot = JSON.parse(readFileSync(resolve(here, 'bokun-snapshot.json'), 'utf-8')) as Record<
  string,
  { startTimes?: string[] }
>

// ─── formatStartTime ─────────────────────────────────────────────────────

test('formatStartTime: morning hours render as AM', () => {
  assert.equal(formatStartTime('08:00'), '8 AM')
  assert.equal(formatStartTime('10:00'), '10 AM')
  assert.equal(formatStartTime('00:00'), '12 AM')
})

test('formatStartTime: afternoon/evening hours render as PM', () => {
  assert.equal(formatStartTime('12:00'), '12 PM')
  assert.equal(formatStartTime('13:00'), '1 PM')
  assert.equal(formatStartTime('17:00'), '5 PM')
  assert.equal(formatStartTime('23:00'), '11 PM')
})

test('formatStartTime: non-zero minutes keep HH:mm form with AM/PM', () => {
  assert.equal(formatStartTime('08:30'), '8:30 AM')
  assert.equal(formatStartTime('14:45'), '2:45 PM')
})

test('formatStartTime: invalid inputs return undefined', () => {
  assert.equal(formatStartTime(undefined), undefined)
  assert.equal(formatStartTime(''), undefined)
  assert.equal(formatStartTime('not a time'), undefined)
  assert.equal(formatStartTime('25:00'), undefined)
  assert.equal(formatStartTime('12:60'), undefined)
})

// ─── getDisplayTime ──────────────────────────────────────────────────────

function mkTour(slug: string, snap?: BokunTourSnapshot): Tour {
  return {
    slug,
    name: `${slug} tour`,
    shortName: slug,
    category: 'x',
    tagColor: '#000',
    thumbBg: '#111',
    price: 100,
    priceNote: 'per person',
    duration: '3h',
    groupSize: '10',
    description: 'd',
    highlights: [],
    heroTag: 'h',
    photos: [],
    bokunSnapshot: snap,
  }
}

test('getDisplayTime: returns formatted Bokun time when snapshot present', () => {
  const snap: BokunTourSnapshot = { productId: 0, startTimes: ['17:00'], fetchedAt: '2026-04-20T00:00:00Z' }
  assert.equal(getDisplayTime(mkTour('salsa', snap)), '5 PM')
})

test('getDisplayTime: returns undefined when tour has no snapshot', () => {
  assert.equal(getDisplayTime(mkTour('orphan')), undefined)
})

test('getDisplayTime: returns undefined when snapshot has no startTimes', () => {
  const snap: BokunTourSnapshot = { productId: 0, fetchedAt: '2026-04-20T00:00:00Z' }
  assert.equal(getDisplayTime(mkTour('no-times', snap)), undefined)
})

test('getDisplayTime: picks first startTime entry', () => {
  const snap: BokunTourSnapshot = {
    productId: 0,
    startTimes: ['08:00', '08:10', '08:20'],
    fetchedAt: '2026-04-20T00:00:00Z',
  }
  assert.equal(getDisplayTime(mkTour('el-yunque', snap)), '8 AM')
})

// ─── Live snapshot integration ──────────────────────────────────────────
// Validates the snapshot actually committed alongside the code is usable
// by the display helper. Skips cleanly when the snapshot is empty (dev
// laptops without Bokun creds).

// ─── getDisplayDaysLabel ────────────────────────────────────────────────

test('getDisplayDaysLabel: 7 days returns "Daily"', () => {
  const snap: BokunTourSnapshot = {
    productId: 0,
    daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    fetchedAt: '2026-04-20T00:00:00Z',
  }
  assert.equal(getDisplayDaysLabel(mkTour('daily', snap)), 'Daily')
})

test('getDisplayDaysLabel: single day returns full name', () => {
  const snap: BokunTourSnapshot = {
    productId: 0,
    daysOfWeek: ['Fri'],
    fetchedAt: '2026-04-20T00:00:00Z',
  }
  assert.equal(getDisplayDaysLabel(mkTour('salsa', snap)), 'Friday')
})

test('getDisplayDaysLabel: subset returns canonical Mon..Sun list', () => {
  const snap: BokunTourSnapshot = {
    productId: 0,
    daysOfWeek: ['Fri', 'Mon', 'Wed'], // deliberately out of order on input
    fetchedAt: '2026-04-20T00:00:00Z',
  }
  assert.equal(getDisplayDaysLabel(mkTour('partial', snap)), 'Mon, Wed, Fri')
})

test('getDisplayDaysLabel: empty or missing returns undefined', () => {
  assert.equal(getDisplayDaysLabel(mkTour('none')), undefined)
  const snap: BokunTourSnapshot = {
    productId: 0,
    daysOfWeek: [],
    fetchedAt: '2026-04-20T00:00:00Z',
  }
  assert.equal(getDisplayDaysLabel(mkTour('empty', snap)), undefined)
})

test('every tour with a live snapshot entry renders a display time (post-enrich)', () => {
  // Same pipeline LocalAdapter uses: raw CMS tours + snapshot JSON → enriched tours.
  // Tests that end-to-end, a tour with a snapshot entry produces a display time.
  const enriched = enrichToursWithSnapshot(tours, snapshot as BokunSnapshotMap)
  for (const t of enriched) {
    if (!snapshot[t.slug]?.startTimes?.length) continue
    const dt = getDisplayTime(t)
    assert.ok(
      dt && dt.length > 0,
      `tour "${t.slug}" has a live Bokun startTime but getDisplayTime returned falsy`,
    )
  }
})
