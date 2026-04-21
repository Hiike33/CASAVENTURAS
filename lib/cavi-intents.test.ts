import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  matchIntent,
  matchIntentId,
  buildMailto,
  buildWhatsapp,
  INTENT_FAQ_REFS,
  detectLocale,
  CATEGORIES,
  getFollowups,
  getContactReply,
} from './cavi-intents.ts'
import { faqById } from './cms/data/faqs.en.ts'
import { faqById as faqByIdEs } from './cms/data/faqs.es.ts'

// ─── Intent → FAQ id mapping ──────────────────────────────────────────
// For each probe, we assert the intent that fires AND (when faq-backed)
// that the FAQ id it references actually exists in faqs.ts. Catches a
// renamed/removed FAQ id breaking Cavi silently.

const INTENT_PROBES: Array<[string, string]> = [
  // Conversational
  ['Hola', 'greeting'],
  // General PR context
  ['do i need a passport?', 'gen-passport'],
  ['when is the best time to visit?', 'gen-best-time'],
  ['what about mosquitoes?', 'gen-mosquitoes'],
  ['is san juan safe at night?', 'gen-safety'],
  ['do you speak spanish?', 'gen-languages'],
  ['how much should i tip?', 'gen-tipping'],
  ['do you do hotel pickup?', 'gen-pickup'],
  ['small group size?', 'gen-group-size'],
  ['can i cancel?', 'gen-cancellation'],
  ['how do i book online?', 'gen-how-to-book'],
  ['tripadvisor reviews?', 'gen-tripadvisor'],
  // El Yunque specific
  ['what if it rains in the rainforest?', 'ey-rain'],
  ['minimum age for cliff jumps?', 'ey-cliff-age'],
  ['do i need a recreation.gov permit?', 'ey-reservation-gov'],
  ['how difficult is the hike on el yunque?', 'ey-fitness'],
  ['what should i bring to el yunque? waterproof phone', 'ey-what-to-bring'],
  ['is el yunque safe for kids?', 'ey-kids-seniors'],
  // Generic versions (no tour specified) → must route to multi-tour overviews
  ['is it safe for kids?', 'generic-family-kids'],
  ['is it hard?', 'generic-difficulty'],
  ['what should i bring?', 'generic-what-to-bring'],
  ['how long is it?', 'generic-duration'],
  ['how long is the rainforest tour?', 'ey-duration'],
  ['what makes el yunque special vs others?', 'ey-why-us'],
  // Catamaran specific
  ['catamaran age minimum for toddler?', 'cat-age'],
  ['can minors drink on the boat?', 'cat-alcohol'],
  ['will i be seasick?', 'cat-seasick'],
  ['is there a bathroom on board?', 'cat-bathroom'],
  ['where does the catamaran depart from?', 'cat-departure'],
  ['how many people fit on the boat?', 'cat-capacity'],
  ['catamaran weather cancellation?', 'cat-weather'],
  ['what is included on the boat?', 'cat-inclusions'],
  // Salsa specific
  ['do i need a partner for salsa?', 'sal-partner'],
  ['is the rooftop wheelchair accessible?', 'sal-accessibility'],
  ['can i do a private dance class?', 'sal-private'],
  ['what time does salsa start?', 'sal-time'],
  ['what should i wear for salsa class?', 'sal-wear'],
  ['am i too beginner for salsa?', 'sal-experience'],
  ['where is the salsa rooftop?', 'sal-location'],
  // Dynamic
  ['how much does it all cost?', 'price-overview'],
  ['can i combine both tours?', 'combine-tours'],
  ['how do i contact you?', 'contact-team'],
]

for (const [probe, expectedIntent] of INTENT_PROBES) {
  test(`"${probe}" → intent "${expectedIntent}"`, () => {
    assert.equal(matchIntentId(probe), expectedIntent)
  })
}

// Fallback when no keyword matches
test('unanswerable question triggers fallback with both CTAs', () => {
  const r = matchIntent('quantum flux capacitor schematic please')
  assert.match(r.text, /lovely team member/i)
  assert.ok(r.ctas)
  assert.equal(r.ctas?.length, 2)
  assert.equal(r.ctas?.[0].type, 'email')
  assert.equal(r.ctas?.[1].type, 'whatsapp')
})

test('empty message triggers fallback', () => {
  const r = matchIntent('')
  assert.match(r.text, /lovely team member/i)
})

// ─── FAQ id resolution ────────────────────────────────────────────────
// Every faq-backed intent must point to an id that exists. Prevents silent
// breakage if faqs.ts loses or renames an id.

test('every intent faqId referenced actually exists in faqs.ts', () => {
  for (const faqId of INTENT_FAQ_REFS) {
    assert.ok(faqById[faqId], `intent references missing FAQ id: "${faqId}"`)
  }
})

// ─── CTA URL builders ─────────────────────────────────────────────────

test('buildMailto encodes subject and body correctly', () => {
  const url = buildMailto('Do you have availability Saturday?')
  assert.match(url, /^mailto:.+@.+\?subject=/)
  assert.match(url, /body=Do%20you%20have%20availability%20Saturday%3F/)
})

test('buildMailto uses default copy when message is empty', () => {
  const url = buildMailto('')
  assert.match(url, /body=Hi%2C%20I%20have%20a%20question/)
})

test('buildWhatsapp appends text parameter to wa.me URL', () => {
  const url = buildWhatsapp('Can we book 6 people?')
  assert.match(url, /^https:\/\/wa\.me\/\d+\?text=/)
  assert.match(url, /text=Can%20we%20book%206%20people%3F/)
})

// ─── Multilingual detection + matching ────────────────────────────────

test('detectLocale recognizes Spanish via ¿ / ¡', () => {
  assert.equal(detectLocale('¿Cuánto cuesta?'), 'es')
  assert.equal(detectLocale('¡Hola, soy nuevo aquí!'), 'es')
})

test('detectLocale recognizes French via common particles', () => {
  assert.equal(detectLocale("C'est sûr pour les enfants ?"), 'fr')
  assert.equal(detectLocale('Combien de temps dure le tour ?'), 'fr')
})

test('detectLocale defaults to English when nothing matches', () => {
  assert.equal(detectLocale('How much is the tour?'), 'en')
})

test('ES probe "¿es seguro para niños?" routes to generic-family-kids (ES intents)', () => {
  assert.equal(matchIntentId('¿es seguro para niños?'), 'generic-family-kids')
})

test('ES probe "¿cuánto cuesta?" routes to price-overview', () => {
  assert.equal(matchIntentId('¿cuánto cuesta?'), 'price-overview')
})

test('ES probe "¿qué está incluido en el catamarán?" routes to cat-inclusions', () => {
  assert.equal(matchIntentId('¿qué está incluido en el catamarán?'), 'cat-inclusions')
})

test('FR probe "combien ça coûte" routes to price-overview', () => {
  assert.equal(matchIntentId('combien ça coûte ?'), 'price-overview')
})

test('FR probe "est-ce sûr pour les enfants" routes to generic-family-kids', () => {
  assert.equal(matchIntentId("est-ce sûr pour les enfants ?"), 'generic-family-kids')
})

test('ES fallback text is Spanish when locale forced', () => {
  const r = matchIntent('flux capacitor quantique', 'es')
  assert.match(r.text, /encantador|equipo|ya mismo/i)
})

test('ES matched intent returns Spanish FAQ answer', () => {
  const r = matchIntent('¿me voy a marear?')
  assert.match(r.text, /Vieques Sound|mareo|Dramamine/i)
  assert.ok(faqByIdEs['cat-seasickness'])
})

// ─── Guided navigation tree (6-category arbre) ───────────────────────
// CAVI ships without a free-text input (D-AUDIT 2026-04-21). All intents
// must be reachable via the 6-category menu, otherwise the bot becomes
// partially dead. These tests guard the tree against regressions.

test('CATEGORIES exposes 6 entries for every locale', () => {
  for (const loc of ['en', 'es', 'fr'] as const) {
    assert.equal(CATEGORIES[loc].length, 6, `${loc} must have 6 categories`)
  }
})

test('CATEGORIES: each entry has id/label/prompt/questions fields', () => {
  for (const loc of ['en', 'es', 'fr'] as const) {
    for (const cat of CATEGORIES[loc]) {
      assert.ok(cat.id, `${loc}: missing id`)
      assert.ok(cat.label, `${loc}/${cat.id}: missing label`)
      assert.equal(typeof cat.prompt, 'string', `${loc}/${cat.id}: prompt must be string`)
      assert.ok(Array.isArray(cat.questions), `${loc}/${cat.id}: questions must be array`)
    }
  }
})

test('CATEGORIES: every drill-down question resolves to a real intent (no dead-end buttons)', () => {
  for (const loc of ['en', 'es', 'fr'] as const) {
    for (const cat of CATEGORIES[loc]) {
      for (const q of cat.questions) {
        const id = matchIntentId(q, loc)
        assert.ok(id, `${loc}/${cat.id}: question "${q}" matches no intent`)
      }
    }
  }
})

test('CATEGORIES: contact category is present with empty questions (special drill)', () => {
  for (const loc of ['en', 'es', 'fr'] as const) {
    const contact = CATEGORIES[loc].find(c => c.id === 'contact')
    assert.ok(contact, `${loc}: contact category missing`)
    assert.equal(contact!.questions.length, 0, `${loc}: contact must not have drill-down questions`)
  }
})

test('getFollowups returns same-category questions excluding the asked one', () => {
  const asked = 'How long is El Yunque?'
  const f = getFollowups('ey-duration', 'en', asked)
  assert.ok(f.length >= 1, 'expected at least 1 follow-up')
  assert.ok(f.length <= 2, 'follow-ups capped at 2')
  assert.ok(!f.some(q => q.toLowerCase() === asked.toLowerCase()), 'must exclude asked question')
})

test('getFollowups returns [] for unknown intent ids', () => {
  const f = getFollowups('non-existent-intent', 'en', '')
  assert.deepEqual(f, [])
})

test('matchIntent faq-backed reply now attaches follow-ups (fixes "ends too early")', () => {
  const r = matchIntent('How long is the rainforest tour?', 'en')
  assert.ok(r.suggestions, 'faq reply must include suggestions')
  assert.ok(r.suggestions!.length > 0, 'suggestions must not be empty')
})

test('matchIntent preserves hand-picked suggestions on composed replies', () => {
  const r = matchIntent('how much does it all cost?', 'en')
  assert.ok(r.suggestions && r.suggestions.length > 0)
  // makePriceOverview hand-picks these specific follow-ups
  assert.ok(r.suggestions!.some(s => /included|catamaran/i.test(s)))
})

test('getContactReply returns the contact message with email + whatsapp CTAs', () => {
  for (const loc of ['en', 'es', 'fr'] as const) {
    const r = getContactReply(loc)
    assert.ok(r.text.length > 0, `${loc}: contact text empty`)
    assert.equal(r.ctas?.length, 2, `${loc}: expected 2 CTAs`)
    assert.equal(r.ctas?.[0].type, 'email')
    assert.equal(r.ctas?.[1].type, 'whatsapp')
  }
})
