import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import {
  parseConsentValue,
  readConsent,
  writeConsent,
  STORAGE_KEY,
} from './consent.ts'

// ─── parseConsentValue (pure) ─────────────────────────────────────────────

test('parseConsentValue: returns valid states unchanged', () => {
  assert.equal(parseConsentValue('pending'), 'pending')
  assert.equal(parseConsentValue('granted'), 'granted')
  assert.equal(parseConsentValue('denied'), 'denied')
})

test('parseConsentValue: maps unknown strings to pending', () => {
  assert.equal(parseConsentValue('GRANTED'), 'pending') // case-sensitive
  assert.equal(parseConsentValue('yes'), 'pending')
  assert.equal(parseConsentValue(''), 'pending')
})

test('parseConsentValue: maps non-strings to pending', () => {
  assert.equal(parseConsentValue(null), 'pending')
  assert.equal(parseConsentValue(undefined), 'pending')
  assert.equal(parseConsentValue(1), 'pending')
  assert.equal(parseConsentValue({}), 'pending')
})

// ─── localStorage shim — install a minimal stub on globalThis so
//    readConsent/writeConsent can exercise the window.localStorage path
//    inside `node --test` (no DOM otherwise). The shim is duck-typed via
//    `as unknown` casts because the real Storage interface has more
//    surface (length, key, etc.) than this test exercises.
// ─────────────────────────────────────────────────────────────────────────

type MinimalStorage = {
  getItem(k: string): string | null
  setItem(k: string, v: string): void
  removeItem(k: string): void
  clear(): void
}

function makeMemoryStorage(): MinimalStorage {
  const store = new Map<string, string>()
  return {
    getItem: k => store.get(k) ?? null,
    setItem: (k, v) => {
      store.set(k, v)
    },
    removeItem: k => {
      store.delete(k)
    },
    clear: () => {
      store.clear()
    },
  }
}

type WindowStub = { localStorage: MinimalStorage }
const g = globalThis as unknown as { window?: WindowStub }

beforeEach(() => {
  g.window = { localStorage: makeMemoryStorage() }
})

// ─── readConsent ─────────────────────────────────────────────────────────

test('readConsent: returns pending when storage empty', () => {
  assert.equal(readConsent(), 'pending')
})

test('readConsent: returns granted after writeConsent("granted")', () => {
  writeConsent('granted')
  assert.equal(readConsent(), 'granted')
})

test('readConsent: returns denied after writeConsent("denied")', () => {
  writeConsent('denied')
  assert.equal(readConsent(), 'denied')
})

test('readConsent: ignores stored "pending" (treats as undecided)', () => {
  // Direct write bypassing writeConsent — emulate a corrupted entry
  g.window!.localStorage.setItem(STORAGE_KEY, 'pending')
  assert.equal(readConsent(), 'pending')
})

test('readConsent: ignores garbage values, returns pending', () => {
  g.window!.localStorage.setItem(STORAGE_KEY, 'maybe')
  assert.equal(readConsent(), 'pending')
})

test('readConsent: returns pending when window is undefined (SSR)', () => {
  g.window = undefined
  assert.equal(readConsent(), 'pending')
})

// ─── writeConsent ────────────────────────────────────────────────────────

test('writeConsent: writes the decision to STORAGE_KEY', () => {
  writeConsent('granted')
  assert.equal(g.window!.localStorage.getItem(STORAGE_KEY), 'granted')
})

test('writeConsent: no-op when window is undefined (SSR)', () => {
  g.window = undefined
  // Should not throw — the call site should be safe in any context
  assert.doesNotThrow(() => writeConsent('granted'))
})

test('writeConsent: silent when localStorage throws', () => {
  g.window = {
    localStorage: {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceeded')
      },
      removeItem: () => undefined,
      clear: () => undefined,
    },
  }
  // Must not throw to the caller — banner button handler needs to be safe
  assert.doesNotThrow(() => writeConsent('denied'))
})
