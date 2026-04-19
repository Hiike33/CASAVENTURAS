import { test } from 'node:test'
import assert from 'node:assert/strict'
import { __test } from './client.ts'

test('bokunDate formats UTC as "yyyy-MM-dd HH:mm:ss"', () => {
  const d = new Date(Date.UTC(2026, 0, 15, 12, 30, 45))
  assert.equal(__test.bokunDate(d), '2026-01-15 12:30:45')
})

test('bokunDate pads single-digit month/day/hour/min/sec', () => {
  const d = new Date(Date.UTC(2026, 2, 5, 3, 9, 7))
  assert.equal(__test.bokunDate(d), '2026-03-05 03:09:07')
})

test('signRequest matches known HMAC-SHA1 vector (openssl-computed)', () => {
  // Spec: HMAC-SHA1("TEST_SECRET", date + accessKey + method + path) base64
  // Pre-computed via:
  //   echo -n "2026-01-01 00:00:00TEST_ACCESSGET/booking.json/product/123" \
  //     | openssl dgst -sha1 -hmac "TEST_SECRET" -binary | base64
  const expected = 'aRoiRVDtAkTf/w2fAoSzSwGpHl4='
  const actual = __test.signRequest(
    'GET',
    '/booking.json/product/123',
    '2026-01-01 00:00:00',
    'TEST_ACCESS',
    'TEST_SECRET',
  )
  assert.equal(actual, expected)
})

test('signRequest is deterministic for same inputs', () => {
  const sig1 = __test.signRequest('GET', '/x', '2026-01-01 00:00:00', 'k', 's')
  const sig2 = __test.signRequest('GET', '/x', '2026-01-01 00:00:00', 'k', 's')
  assert.equal(sig1, sig2)
})

test('signRequest differs when any input differs', () => {
  const base = __test.signRequest('GET', '/x', '2026-01-01 00:00:00', 'k', 's')
  assert.notEqual(__test.signRequest('POST', '/x', '2026-01-01 00:00:00', 'k', 's'), base)
  assert.notEqual(__test.signRequest('GET', '/y', '2026-01-01 00:00:00', 'k', 's'), base)
  assert.notEqual(__test.signRequest('GET', '/x', '2026-01-01 00:00:01', 'k', 's'), base)
  assert.notEqual(__test.signRequest('GET', '/x', '2026-01-01 00:00:00', 'k2', 's'), base)
  assert.notEqual(__test.signRequest('GET', '/x', '2026-01-01 00:00:00', 'k', 's2'), base)
})

test('signRequest handles query string in path', () => {
  // Query params are part of the signed path (Bókun spec)
  const withQuery = __test.signRequest(
    'GET',
    '/booking.json/product/123/availabilities?start=2026-05-15&end=2026-05-15',
    '2026-01-01 00:00:00',
    'k',
    's',
  )
  const withoutQuery = __test.signRequest(
    'GET',
    '/booking.json/product/123/availabilities',
    '2026-01-01 00:00:00',
    'k',
    's',
  )
  assert.notEqual(withQuery, withoutQuery)
})
