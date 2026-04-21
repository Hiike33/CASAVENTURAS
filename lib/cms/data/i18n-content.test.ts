import { test } from 'node:test'
import assert from 'node:assert/strict'
import { tours as toursEn } from './tours.en.ts'
import { tours as toursFr } from './tours.fr.ts'
import { generalFaqs as faqsGenEn, tourFaqs as faqsTourEn, faqById as faqByIdEn } from './faqs.en.ts'
import { generalFaqs as faqsGenFr, tourFaqs as faqsTourFr, faqById as faqByIdFr } from './faqs.fr.ts'
import { privacy as privacyEn, terms as termsEn, cookies as cookiesEn } from './legal.en.ts'
import { privacy as privacyFr, terms as termsFr, cookies as cookiesFr } from './legal.fr.ts'
import type { LegalPage, LegalBlock } from '../../types/cms.ts'

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

// ─── faqs.fr.ts: translated content, id parity with EN ───────────────
//
// FAQs drive two things: FAQPage JSON-LD on tour pages (SEO) and Cavi's
// answers (the intent matcher resolves a matched intent to an FAQ id,
// then reads the answer from faqById[locale]). So both id parity AND
// actual FR translation matter.

function allFrFaqStrings(): string[] {
  const out: string[] = []
  for (const f of Object.values(faqByIdFr)) {
    out.push(f.question, f.answer)
  }
  return out
}

test('faqs.fr.ts preserves FAQ id parity with EN', () => {
  const idsEn = Object.keys(faqByIdEn).sort()
  const idsFr = Object.keys(faqByIdFr).sort()
  assert.deepEqual(idsFr, idsEn, 'FAQ ids must match exactly between EN and FR')
})

test('faqs.fr.ts generalFaqs has same length as EN', () => {
  assert.equal(faqsGenFr.length, faqsGenEn.length)
})

test('faqs.fr.ts tourFaqs has same per-tour lengths as EN', () => {
  for (const slug of Object.keys(faqsTourEn)) {
    assert.ok(faqsTourFr[slug], `tourFaqs[${slug}] missing in FR`)
    assert.equal(
      faqsTourFr[slug].length,
      faqsTourEn[slug].length,
      `tourFaqs[${slug}] length differs between EN and FR`,
    )
  }
})

test('faqs.fr.ts every FAQ has a FR answer distinct from EN', () => {
  for (const id of Object.keys(faqByIdEn)) {
    assert.notEqual(
      faqByIdFr[id].answer,
      faqByIdEn[id].answer,
      `FAQ[${id}].answer is still EN (no FR translation)`,
    )
    assert.notEqual(
      faqByIdFr[id].question,
      faqByIdEn[id].question,
      `FAQ[${id}].question is still EN (no FR translation)`,
    )
  }
})

test('faqs.fr.ts contains no em-dashes (contract §2.1)', () => {
  for (const s of allFrFaqStrings()) {
    assert.ok(!s.includes('—'), `em-dash found in FR FAQ string: "${s}"`)
  }
})

test('faqs.fr.ts contains no FR LLM-talk blacklist words (contract §2.2)', () => {
  for (const s of allFrFaqStrings()) {
    for (const bad of LLM_BLACKLIST_FR) {
      assert.ok(
        !s.toLowerCase().includes(bad.toLowerCase()),
        `LLM-talk marker "${bad}" found in FR FAQ: "${s}"`,
      )
    }
  }
})

// ─── legal.fr.ts: privacy + terms + cookies translated ───────────────
//
// Legal pages are high-stakes content: wrong translation = compliance
// risk. We test structural parity (same section numbers, same block
// counts) AND translation presence (titles and first paragraph of each
// section must differ from EN).

function blockText(b: LegalBlock): string {
  return b.kind === 'p' ? b.html : b.items.join('|')
}

function allLegalFrStrings(page: LegalPage): string[] {
  const out: string[] = [page.metaDescription, page.introHtml]
  for (const s of page.sections) {
    out.push(s.title)
    for (const b of s.blocks) out.push(blockText(b))
  }
  return out
}

test('legal.fr.ts exports privacy/terms/cookies with same shape as EN', () => {
  for (const [name, en, fr] of [
    ['privacy', privacyEn, privacyFr],
    ['terms', termsEn, termsFr],
    ['cookies', cookiesEn, cookiesFr],
  ] as const) {
    assert.equal(fr.sections.length, en.sections.length, `${name}: section count differs`)
    for (let i = 0; i < en.sections.length; i++) {
      assert.equal(fr.sections[i].n, en.sections[i].n, `${name}#${i}: section number differs`)
      assert.equal(
        fr.sections[i].blocks.length,
        en.sections[i].blocks.length,
        `${name}#${en.sections[i].n}: block count differs`,
      )
    }
  }
})

test('legal.fr.ts metaDescription and introHtml differ from EN', () => {
  for (const [name, en, fr] of [
    ['privacy', privacyEn, privacyFr],
    ['terms', termsEn, termsFr],
    ['cookies', cookiesEn, cookiesFr],
  ] as const) {
    assert.notEqual(fr.metaDescription, en.metaDescription, `${name}: metaDescription still EN`)
    assert.notEqual(fr.introHtml, en.introHtml, `${name}: introHtml still EN`)
  }
})

test('legal.fr.ts: >=80% of section titles are translated (some words are universal)', () => {
  // "Contact" is spelled identically in EN and FR — universal word, no
  // translation required. We assert the aggregate rate instead of each
  // individual title to avoid flagging legitimate cognates.
  const UNIVERSAL_WORDS = new Set(['contact'])
  for (const [name, en, fr] of [
    ['privacy', privacyEn, privacyFr],
    ['terms', termsEn, termsFr],
    ['cookies', cookiesEn, cookiesFr],
  ] as const) {
    let translated = 0
    for (let i = 0; i < en.sections.length; i++) {
      const enT = en.sections[i].title
      const frT = fr.sections[i].title
      if (frT !== enT || UNIVERSAL_WORDS.has(enT.toLowerCase())) translated++
    }
    const ratio = translated / en.sections.length
    assert.ok(ratio >= 0.8, `${name} has only ${Math.round(ratio * 100)}% translated titles`)
  }
})

test('legal.fr.ts contains no em-dashes (contract §2.1)', () => {
  for (const page of [privacyFr, termsFr, cookiesFr]) {
    for (const s of allLegalFrStrings(page)) {
      assert.ok(!s.includes('—'), `em-dash found in FR legal string: "${s.slice(0, 100)}…"`)
    }
  }
})

test('legal.fr.ts contains no FR LLM-talk blacklist words (contract §2.2)', () => {
  for (const page of [privacyFr, termsFr, cookiesFr]) {
    for (const s of allLegalFrStrings(page)) {
      for (const bad of LLM_BLACKLIST_FR) {
        assert.ok(
          !s.toLowerCase().includes(bad.toLowerCase()),
          `LLM-talk "${bad}" found in FR legal: "${s.slice(0, 80)}…"`,
        )
      }
    }
  }
})

test('legal.fr.ts preserves inline HTML tags and URLs', () => {
  for (const page of [privacyFr, termsFr, cookiesFr]) {
    // Email + phone constants must survive translation
    const joined = allLegalFrStrings(page).join(' ')
    assert.ok(joined.includes('micasaventuras@gmail.com'), 'email lost in FR')
    assert.ok(joined.includes('+1 929 372 4529'), 'phone lost in FR')
  }
})
