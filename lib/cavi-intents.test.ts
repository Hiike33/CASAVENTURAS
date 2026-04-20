import { test } from 'node:test'
import assert from 'node:assert/strict'
import { matchIntent, matchIntentId, buildMailto, buildWhatsapp, INTENT_FAQ_REFS } from './cavi-intents.ts'
import { faqById } from './cms/data/faqs.ts'

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
