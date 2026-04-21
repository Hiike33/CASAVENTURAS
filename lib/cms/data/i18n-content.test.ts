import { test } from 'node:test'
import assert from 'node:assert/strict'
import { tours as toursEn } from './tours.en.ts'
import { tours as toursFr } from './tours.fr.ts'

// ─── tours.fr.ts: translated content, not a re-export of EN ──────────
//
// Phase 8 of D-018: FR visitors must read French tour content. Guards
// against silent regression to re-export EN (the initial placeholder
// state documented in tours.fr.ts:1-3 before translation).

const TOUR_FIELDS_MUST_DIFFER = ['name', 'category', 'priceNote', 'description', 'heroTag'] as const
const LLM_BLACKLIST_FR = [
  'parfaitement',
  'harmonieusement',
  'sans effort',
  'Découvrez',
  'Que vous soyez',
]

function allFrStrings(): string[] {
  const out: string[] = []
  for (const t of toursFr) {
    out.push(t.name, t.shortName, t.category, t.priceNote, t.duration, t.description, t.heroTag)
    if (t.level) out.push(t.level)
    if (t.includes) out.push(t.includes)
    if (t.address) out.push(t.address)
    out.push(...t.highlights)
    if (t.whatToBring) out.push(...t.whatToBring)
  }
  return out
}

test('tours.fr has the same number of entries as tours.en', () => {
  assert.equal(toursFr.length, toursEn.length)
})

test('tours.fr preserves structural parity (slug, price, photos)', () => {
  for (let i = 0; i < toursEn.length; i++) {
    assert.equal(toursFr[i].slug, toursEn[i].slug, `slug mismatch at index ${i}`)
    assert.equal(toursFr[i].price, toursEn[i].price, `price mismatch at ${toursEn[i].slug}`)
    assert.deepEqual(toursFr[i].photos, toursEn[i].photos, `photos mismatch at ${toursEn[i].slug}`)
  }
})

test('tours.fr has visible fields translated (distinct from EN)', () => {
  for (let i = 0; i < toursEn.length; i++) {
    for (const field of TOUR_FIELDS_MUST_DIFFER) {
      assert.notEqual(
        toursFr[i][field],
        toursEn[i][field],
        `${toursEn[i].slug}.${field} is still EN (no FR translation)`,
      )
    }
  }
})

test('tours.fr highlights are translated (joined string must differ from EN)', () => {
  for (let i = 0; i < toursEn.length; i++) {
    assert.notEqual(
      toursFr[i].highlights.join('|'),
      toursEn[i].highlights.join('|'),
      `${toursEn[i].slug}.highlights still EN`,
    )
  }
})

test('tours.fr whatToBring is translated when present', () => {
  for (let i = 0; i < toursEn.length; i++) {
    const en = toursEn[i].whatToBring
    const fr = toursFr[i].whatToBring
    if (en && en.length > 0) {
      assert.ok(fr && fr.length > 0, `${toursEn[i].slug}.whatToBring missing in FR`)
      assert.notEqual(fr.join('|'), en.join('|'), `${toursEn[i].slug}.whatToBring still EN`)
    }
  }
})

test('tours.fr contains no em-dashes (contract §2.1)', () => {
  for (const s of allFrStrings()) {
    assert.ok(!s.includes('—'), `em-dash found in FR string: "${s}"`)
  }
})

test('tours.fr contains no FR LLM-talk blacklist words (contract §2.2)', () => {
  for (const s of allFrStrings()) {
    for (const bad of LLM_BLACKLIST_FR) {
      assert.ok(
        !s.toLowerCase().includes(bad.toLowerCase()),
        `LLM-talk marker "${bad}" found in FR string: "${s}"`,
      )
    }
  }
})
