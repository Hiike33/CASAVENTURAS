import { tours } from './cms/data/tours.en.ts'
import { siteConfig } from './cms/data/site-config.en.ts'
import { faqById } from './cms/data/faqs.en.ts'

// Deterministic intent matcher for Cavi. No LLM. Intents map user keywords to
// either (a) a FAQ id in lib/cms/data/faqs.ts (the authoritative answer), or
// (b) a dynamic reply that composes facts from @/lib/tours.
//
// Edit the FAQ text in faqs.ts, never here. This file only decides WHICH FAQ
// matches a user message. Keeps Cavi, tour-page FAQPage JSON-LD, and the
// /contact FAQ section all pulling from the same source (D-005).

export type CaviCta = { type: 'email' | 'whatsapp'; label: string }

export type CaviReply = {
  text: string
  suggestions?: string[]
  ctas?: CaviCta[]
}

type Intent = {
  id: string
  match: (msg: string) => boolean
  /** Reference an authoritative FAQ answer in faqs.ts. */
  faqId?: string
  /** Dynamic reply (used for overviews that compose multiple tours). */
  reply?: () => CaviReply
}

const lc = (s: string) => s.toLowerCase()
const hasAny = (msg: string, words: string[]) => words.some(w => msg.includes(w))

const priceOverview = () =>
  tours
    .map(t => `• ${t.name}: $${t.price}/person (${t.duration}, group ${t.groupSize})`)
    .join('\n')

// Order matters: put specific matches BEFORE general ones. Tour-qualified
// intents combine two hasAny checks with && so "catamaran age" wins over
// a bare "age" match that would otherwise fire a general intent.

const INTENTS: Intent[] = [
  // ─── Conversational openers ─────────────────────────────────────────
  {
    id: 'greeting',
    match: m => hasAny(m, ['hola', 'hello', 'hi ', 'hey', 'bonjour', 'salut']) && m.length < 20,
    reply: () => ({
      text: 'Hola! I can help you pick the right experience, share prices, timing, what is included, or put you in touch with the team. What would you like to know?',
      suggestions: ['How much is El Yunque?', 'What is included?', 'Is it safe for kids?'],
    }),
  },

  // ─── Tour-qualified specificity (must come before generic intents) ──
  {
    id: 'cat-age',
    match: m => hasAny(m, ['catamaran', 'boat', 'catamar', 'vieques']) && hasAny(m, ['age', 'baby', 'infant', 'toddler', 'child', 'kid']),
    faqId: 'cat-age-min',
  },
  {
    id: 'cat-alcohol',
    match: m => hasAny(m, ['alcohol', 'drink', 'bar', 'rum', 'beer', 'wine', 'minor', 'underage', '21']) && hasAny(m, ['catamaran', 'boat', 'cata', 'vieques', 'open bar']),
    faqId: 'cat-alcohol-minors',
  },
  {
    id: 'cat-seasick',
    match: m => hasAny(m, ['seasick', 'sea sick', 'motion sick', 'nauseous', 'nausea', 'dramamine', 'ginger']),
    faqId: 'cat-seasickness',
  },
  {
    id: 'cat-bathroom',
    match: m => hasAny(m, ['bathroom', 'toilet', 'restroom', 'head', 'wc']),
    faqId: 'cat-bathroom',
  },
  {
    id: 'cat-departure',
    match: m => hasAny(m, ['marina', 'depart', 'humacao', 'palmas', 'where does the boat', 'where do we meet for the boat']),
    faqId: 'cat-departure',
  },
  {
    id: 'cat-capacity',
    match: m => hasAny(m, ['catamaran', 'boat', 'cata']) && hasAny(m, ['people', 'capacity', 'group', 'max', 'fit', 'how many']),
    faqId: 'cat-capacity',
  },
  {
    id: 'cat-weather',
    match: m => hasAny(m, ['catamaran', 'boat', 'cata', 'sea']) && hasAny(m, ['weather', 'rain', 'storm', 'cloudy']),
    faqId: 'cat-weather',
  },
  {
    id: 'cat-inclusions',
    match: m => hasAny(m, ['catamaran', 'boat', 'cata']) && hasAny(m, ['include', 'inclu', 'what is in', 'what\'s in', 'what comes']),
    faqId: 'cat-inclusions',
  },

  // ─── El Yunque specificity ──────────────────────────────────────────
  // ey-duration is checked BEFORE ey-rain so "how long is the rainforest tour"
  // doesn't collide (bare "rain" is a substring of "rainforest"). ey-rain
  // also uses more specific keywords (plural/verb forms) to avoid the clash.
  {
    id: 'ey-duration',
    match: m => hasAny(m, ['how long', 'duration', 'hours', 'what time ', 'how many hours']) && hasAny(m, ['yunque', 'rainforest', 'jungle', 'forest', 'hike']),
    faqId: 'ey-duration',
  },
  {
    id: 'ey-rain',
    match: m => hasAny(m, ['rains', 'raining', 'rain ', 'rain?', 'rain.', 'rain,', 'storm', 'pour', 'bad weather', 'flood', 'wet']) && hasAny(m, ['yunque', 'rainforest', 'forest', 'jungle', 'hike']),
    faqId: 'ey-rain',
  },
  {
    id: 'ey-cliff-age',
    match: m => hasAny(m, ['cliff', 'jump', 'ledge', 'height']),
    faqId: 'ey-cliff-age',
  },
  {
    id: 'ey-reservation-gov',
    match: m => hasAny(m, ['recreation.gov', 'reservation.gov', 'park reservation', 'permit', 'park pass', 'entry fee']),
    faqId: 'ey-reservation-gov',
  },
  // EY intents below require an explicit El Yunque keyword so that generic
  // questions ("is it safe for kids?", "is it hard?", "what should I bring?")
  // fall through to the generic multi-tour overviews further down.
  {
    id: 'ey-fitness',
    match: m => hasAny(m, ['fitness', 'difficult', 'hard', 'easy', 'level', 'physical', 'workout', 'strenuous']) && hasAny(m, ['yunque', 'rainforest', 'jungle', 'forest', 'hike']),
    faqId: 'ey-fitness',
  },
  {
    id: 'ey-what-to-bring',
    match: m => hasAny(m, ['bring', 'pack', 'wear shoes', 'water shoes', 'dry bag', 'waterproof', 'sunscreen']) && hasAny(m, ['yunque', 'rainforest', 'jungle', 'forest', 'hike']),
    faqId: 'ey-what-to-bring',
  },
  {
    id: 'ey-kids-seniors',
    match: m => hasAny(m, ['kid', 'child', 'children', 'family', 'senior', 'elder', 'grandparent']) && hasAny(m, ['yunque', 'rainforest', 'jungle', 'forest', 'hike']),
    faqId: 'ey-kids-seniors',
  },
  {
    id: 'ey-why-us',
    match: m => hasAny(m, ['special', 'unique', 'different', 'why', 'versus', 'vs', 'compared']) && hasAny(m, ['yunque', 'rainforest']),
    faqId: 'ey-why-us',
  },

  // ─── Salsa specificity ──────────────────────────────────────────────
  {
    id: 'sal-partner',
    match: m => hasAny(m, ['partner', 'alone', 'solo']) && hasAny(m, ['salsa', 'dance', 'class']),
    faqId: 'sal-partner',
  },
  {
    id: 'sal-accessibility',
    match: m => hasAny(m, ['wheelchair', 'accessible', 'mobility', 'disabled', 'disability', 'stairs']),
    faqId: 'sal-accessibility',
  },
  {
    id: 'sal-private',
    match: m => hasAny(m, ['salsa', 'dance', 'zoe']) && hasAny(m, ['private', 'other time', 'flexible', 'different time', 'cannot make', 'can\'t make']),
    faqId: 'sal-private',
  },
  {
    id: 'sal-time',
    match: m => hasAny(m, ['salsa', 'dance', 'zoe']) && hasAny(m, ['time', 'when', 'start', 'hour', 'pm', 'evening']),
    faqId: 'sal-time',
  },
  {
    id: 'sal-wear',
    match: m => hasAny(m, ['salsa', 'dance', 'class']) && hasAny(m, ['wear', 'dress', 'shoes', 'heels', 'outfit', 'clothes']),
    faqId: 'sal-wear',
  },
  {
    id: 'sal-experience',
    match: m => hasAny(m, ['salsa', 'dance', 'zoe', 'class']) && hasAny(m, ['beginner', 'experience', 'never danced', 'first time', 'level', 'skill']),
    faqId: 'sal-experience',
  },
  {
    id: 'sal-location',
    match: m => hasAny(m, ['salsa', 'dance', 'zoe']) && hasAny(m, ['where', 'location', 'address', 'rooftop', 'santurce', 'marianna']),
    faqId: 'sal-location',
  },

  // ─── General, Puerto Rico context ───────────────────────────────────
  {
    id: 'gen-passport',
    match: m => hasAny(m, ['passport', 'visa', 'id ', 'identification', 'citizen', 'international']),
    faqId: 'gen-passport',
  },
  {
    id: 'gen-best-time',
    match: m => hasAny(m, ['best time', 'when to visit', 'best month', 'season', 'hurricane season', 'dry season']),
    faqId: 'gen-best-time',
  },
  {
    id: 'gen-mosquitoes',
    match: m => hasAny(m, ['mosquito', 'mosquit', 'zika', 'repellent', 'deet', 'bugs', 'insect']),
    faqId: 'gen-mosquitoes',
  },
  {
    id: 'gen-safety',
    match: m => hasAny(m, ['safe', 'safety', 'dangerous', 'crime', 'uber', 'taxi at night', 'walk alone']) && !hasAny(m, ['yunque', 'rainforest', 'kid', 'child', 'family', 'water']),
    faqId: 'gen-safety',
  },
  {
    id: 'gen-languages',
    match: m => hasAny(m, ['language', 'english', 'spanish', 'bilingual', 'french', 'portuguese', 'speak']),
    faqId: 'gen-languages',
  },
  {
    id: 'gen-tipping',
    match: m => hasAny(m, ['tip', 'gratuity', 'gratuit', 'tipping']),
    faqId: 'gen-tipping',
  },
  {
    id: 'gen-pickup',
    match: m => hasAny(m, ['pickup', 'pick up', 'pick-up', 'hotel', 'transport', 'from san juan', 'ride']),
    faqId: 'gen-pickup',
  },
  {
    id: 'gen-group-size',
    match: m => hasAny(m, ['small group', 'group size', 'how many people', 'max guest', 'max people', 'private']),
    faqId: 'gen-group-size',
  },
  {
    id: 'gen-cancellation',
    match: m => hasAny(m, ['cancel', 'cancellation', 'refund', 'change my date', 'reschedule']),
    faqId: 'gen-cancellation',
  },
  {
    id: 'gen-how-to-book',
    match: m => hasAny(m, ['how do i book', 'how to book', 'reserve', 'reservation', 'book online']),
    faqId: 'gen-how-to-book',
  },
  {
    id: 'gen-tripadvisor',
    match: m => hasAny(m, ['review', 'rating', 'tripadvisor', 'trust', 'legit', 'legitimate', 'feedback']),
    faqId: 'gen-tripadvisor',
  },
  {
    id: 'gen-location-info',
    match: m => hasAny(m, ['where are you', 'where is casa venturas', 'located', 'based', 'office']),
    faqId: 'gen-location',
  },

  // ─── Dynamic overviews (compose from tours[]) ───────────────────────
  {
    id: 'price-overview',
    match: m => hasAny(m, ['price', 'cost', 'how much', 'rate', '$', 'rates']),
    reply: () => ({
      text: `Here are our published rates per person:\n\n${priceOverview()}\n\nFree cancellation up to 24 hours before. Booking direct saves you up to 25% versus Viator.`,
      suggestions: ['What is included in El Yunque?', 'How long is the catamaran?'],
    }),
  },
  {
    id: 'combine-tours',
    match: m => hasAny(m, ['combine', 'both', 'same day', 'two tours', 'all tours', 'multi-day']),
    reply: () => ({
      text: 'El Yunque (morning to early afternoon) pairs well with Salsa Rooftop at 6 PM the same day. Catamaran is a full-day trip, so we recommend a standalone day for it. Want to book multiple? Email us and we will sequence them cleanly.',
      ctas: [{ type: 'email', label: 'Email us' }, { type: 'whatsapp', label: 'WhatsApp' }],
    }),
  },
  {
    id: 'contact-team',
    match: m => hasAny(m, ['contact', 'email you', 'phone', 'reach you', 'call you', 'whatsapp']),
    reply: () => ({
      text: `The fastest paths are email ${siteConfig.email} or WhatsApp ${siteConfig.phone}. We reply within a few hours during daytime in Puerto Rico (AST, UTC-4).`,
      ctas: [{ type: 'email', label: 'Email us' }, { type: 'whatsapp', label: 'WhatsApp' }],
    }),
  },

  // ─── Generic multi-tour overviews ───────────────────────────────────
  // These fire only when the user asks something generic without specifying
  // a tour. Each composes a per-tour breakdown so visitors can pick the
  // right fit. They sit below tour-qualified intents so "is el yunque safe
  // for kids?" goes to ey-kids-seniors, not here.
  {
    id: 'generic-family-kids',
    match: m => hasAny(m, ['kid', 'child', 'children', 'family', 'toddler', 'baby', 'safe for']),
    reply: () => ({
      text:
        'Quick family fit by tour:\n\n' +
        '• El Yunque: families welcome. Guided groups have included 5-year-olds and seniors. Cliff jumps (5 to 20 ft) are always optional, guides adapt the pace.\n' +
        '• Catamaran: kids of any walking age are welcome, life jackets in kids\' sizes provided. Infants under 2 are not allowed for safety and insurance reasons. Open bar is 21+, minors get unlimited soft drinks.\n' +
        '• Salsa Rooftop: beginner-friendly at any age, Zoe rotates partners so kids and parents dance together.\n\n' +
        'For specific ages or mobility concerns, we are happy to help you pick the best fit.',
      ctas: [{ type: 'email', label: 'Email us' }, { type: 'whatsapp', label: 'WhatsApp' }],
      suggestions: ['Is it safe for kids on El Yunque?', 'Catamaran age minimum?'],
    }),
  },
  {
    id: 'generic-difficulty',
    match: m => hasAny(m, ['difficult', 'difficulty', 'hard', 'easy', 'level', 'physical', 'fitness', 'strenuous', 'workout']),
    reply: () => ({
      text:
        'Difficulty by tour:\n\n' +
        '• El Yunque: moderate. Muddy jungle paths, river walking, optional cliff jumps. You can skip anything you are not comfortable with.\n' +
        '• Catamaran: passive. You sail, swim, snorkel at your pace. No physical demand.\n' +
        '• Salsa Rooftop: beginner-friendly. Zoe teaches from zero, no prior dance skill required.\n\n' +
        'Not sure which fits you? Tell us about your group and we will pick.',
      ctas: [{ type: 'email', label: 'Email us' }, { type: 'whatsapp', label: 'WhatsApp' }],
    }),
  },
  {
    id: 'generic-what-to-bring',
    match: m => hasAny(m, ['what should i bring', 'what do i bring', 'what to bring', 'what to pack', 'what do i pack', 'what should i wear', 'what to wear']),
    reply: () => ({
      text:
        'What to bring, by tour:\n\n' +
        '• El Yunque: water shoes or old sneakers, dry bag, waterproof phone case, change of clothes, sunscreen, water. Life vests are provided.\n' +
        '• Catamaran: swimwear, towel, reef-safe sunscreen, a light layer for sunset return. Snorkel gear and lunch are included.\n' +
        '• Salsa Rooftop: comfortable shoes (sneakers fine, no heels needed), casual clothes, water. Arrive 10 minutes early.',
    }),
  },
  {
    id: 'generic-duration',
    match: m => hasAny(m, ['how long', 'duration', 'how many hours']) && !hasAny(m, ['yunque', 'rainforest', 'jungle', 'forest', 'hike', 'catamaran', 'boat', 'cata', 'salsa', 'dance']),
    reply: () => ({
      text:
        'Durations by tour:\n\n' +
        tours.map(t => `• ${t.name}: ${t.duration}`).join('\n'),
    }),
  },
]

const FALLBACK: CaviReply = {
  text: "I couldn't answer that one, but one of our lovely team members will, ASAP ;)",
  ctas: [
    { type: 'email', label: 'Email us' },
    { type: 'whatsapp', label: 'WhatsApp' },
  ],
}

export function matchIntent(message: string): CaviReply {
  const msg = lc(message).trim()
  if (!msg) return FALLBACK
  for (const intent of INTENTS) {
    if (intent.match(msg)) {
      if (intent.faqId) {
        const faq = faqById[intent.faqId]
        if (faq) return { text: faq.answer }
      }
      if (intent.reply) return intent.reply()
    }
  }
  return FALLBACK
}

// Exported for tests — lets us assert which intent matched without rendering.
export function matchIntentId(message: string): string | null {
  const msg = lc(message).trim()
  if (!msg) return null
  for (const intent of INTENTS) {
    if (intent.match(msg)) return intent.id
  }
  return null
}

// Exported for tests — list of all FAQ ids referenced by any intent. Used to
// assert every referenced FAQ actually exists (no broken references).
export const INTENT_FAQ_REFS: string[] = INTENTS
  .map(i => i.faqId)
  .filter((v): v is string => typeof v === 'string')

/**
 * Build a mailto: URL pre-filled with the user's message. Used by the fallback
 * CTA so the visitor can send their question without retyping it.
 */
export function buildMailto(userMessage: string, email = siteConfig.email): string {
  const subject = 'Question from casaventuras.com'
  const body = userMessage.trim() || 'Hi, I have a question about your tours.'
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

/**
 * Append a pre-filled message to siteConfig.whatsapp (wa.me URL).
 */
export function buildWhatsapp(userMessage: string, baseUrl = siteConfig.whatsapp): string {
  const text = userMessage.trim() || 'Hi! I have a question about your tours.'
  return `${baseUrl}?text=${encodeURIComponent(text)}`
}
