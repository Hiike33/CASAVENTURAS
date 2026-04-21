import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tours } from './tours.en.ts'

// Load the Bokun snapshot at test time via fs so this test stays agnostic
// to bundler JSON-import syntax. Snapshot may be {} on a dev machine
// without Bokun creds , in that case the assertions skip, not fail.
const here = dirname(fileURLToPath(import.meta.url))
const snapshot = JSON.parse(readFileSync(resolve(here, 'bokun-snapshot.json'), 'utf-8')) as Record<
  string,
  { startTimes?: string[]; cancellationHours?: number }
>

function hasSnapshot(slug: string): boolean {
  return Boolean(snapshot[slug]?.startTimes && snapshot[slug].startTimes!.length > 0)
}

function bokunHour(slug: string): number | null {
  const s = snapshot[slug]?.startTimes?.[0]
  if (!s) return null
  const m = s.match(/^(\d{1,2}):(\d{2})$/)
  if (!m) return null
  const n = Number(m[1])
  return Number.isFinite(n) ? n : null
}

// ─── Start-time alignment ─────────────────────────────────────────────────
// Bokun is the source-of-truth (OMS). If Bokun says the tour starts at
// HH:00, the CMS tour.time text must reference that hour. This catches the
// "CMS says 6PM, Bokun says 5PM" class of silent drift between deploys.

test('salsa tour.time matches Bokun snapshot start hour', () => {
  if (!hasSnapshot('salsa')) return // no creds on dev , skip, not fail
  const hh24 = bokunHour('salsa')
  assert.ok(hh24 !== null, 'snapshot salsa.startTimes[0] must be HH:mm')
  const hh12 = hh24 > 12 ? hh24 - 12 : hh24
  const tour = tours.find(t => t.slug === 'salsa')
  assert.ok(tour, 'salsa tour must exist in tours.en.ts')
  assert.ok(tour.time, 'salsa tour.time must be set')
  assert.match(
    tour.time,
    new RegExp(`\\b${hh12}\\s?PM\\b`, 'i'),
    `salsa tour.time ("${tour.time}") must reference ${hh12} PM per Bokun (${hh24}:00)`,
  )
})

test('el-yunque tour.time is set when Bokun snapshot has a time signal', () => {
  if (!hasSnapshot('el-yunque')) return
  const tour = tours.find(t => t.slug === 'el-yunque')
  assert.ok(tour, 'el-yunque tour must exist')
  assert.ok(
    tour.time && tour.time.trim().length > 0,
    'el-yunque should advertise a start time when Bokun has observed slots',
  )
})

test('catamaran tour.time matches Bokun snapshot start hour', () => {
  if (!hasSnapshot('catamaran')) return
  const hh24 = bokunHour('catamaran')
  assert.ok(hh24 !== null, 'snapshot catamaran.startTimes[0] must be HH:mm')
  const hh12 = hh24 > 12 ? hh24 - 12 : hh24
  const suffix = hh24 >= 12 ? 'PM' : 'AM'
  const tour = tours.find(t => t.slug === 'catamaran')
  assert.ok(tour, 'catamaran tour must exist')
  assert.ok(tour.time, 'catamaran tour.time must be set')
  assert.match(
    tour.time,
    new RegExp(`\\b${hh12}\\s?${suffix}\\b`, 'i'),
    `catamaran tour.time ("${tour.time}") must reference ${hh12} ${suffix} per Bokun (${hh24}:00)`,
  )
})
