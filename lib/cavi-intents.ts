import { tours, siteConfig } from '@/lib/tours'

// Deterministic intent matcher for Cavi. NO LLM. Keeps the FAQ loop free
// (no Anthropic API bill, no prompt-injection surface) while handling the
// ~80% of questions that are repetitive (prices, inclusions, contact, etc.).
// For anything unmatched, fallback routes the user to email/WhatsApp — the
// real human conversion path. LLM will come later, on the backend, for
// booking dispatch / email triage (not user-facing — see decisions.md D-016).

export type CaviReply = { text: string; suggestions?: string[] }

type Intent = {
  id: string
  // match returns true when the user message hits this intent
  match: (msg: string) => boolean
  reply: () => CaviReply
}

const lc = (s: string) => s.toLowerCase()
const any = (msg: string, words: string[]) => words.some(w => msg.includes(w))

const tourBySlug = (k: 'el-yunque' | 'catamaran' | 'salsa') =>
  tours.find(t => t.slug === k) ?? tours[0]

const priceLine = () =>
  tours
    .map(t => `• ${t.name}: $${t.price}/person (${t.duration}, group ${t.groupSize})`)
    .join('\n')

const CONTACT_CTA = `Email ${siteConfig.email} or WhatsApp ${siteConfig.phone}.`

const INTENTS: Intent[] = [
  {
    id: 'greeting',
    match: m => any(m, ['hola', 'hello', 'hi ', 'hey', 'bonjour', 'salut']) && m.length < 20,
    reply: () => ({
      text: `Hola! I can help you pick the right experience, share prices, timing, what's included, or put you in touch with the team. What would you like to know?`,
      suggestions: ['How much is El Yunque?', 'What is included?', 'Is it safe for kids?'],
    }),
  },
  {
    id: 'price',
    match: m => any(m, ['price', 'cost', 'how much', 'prix', 'combien', 'coût', '$', 'rate']),
    reply: () => ({
      text: `Here are our published rates per person:\n\n${priceLine()}\n\nFree cancellation up to 24h before. Booking direct saves up to 25% vs Viator.`,
      suggestions: ['What is included in El Yunque?', 'Group size for catamaran?'],
    }),
  },
  {
    id: 'duration',
    match: m => any(m, ['how long', 'duration', 'durée', 'temps', 'hours', 'time']),
    reply: () => ({
      text: tours.map(t => `• ${t.name}: ${t.duration}`).join('\n'),
    }),
  },
  {
    id: 'group',
    match: m => any(m, ['group', 'groupe', 'people', 'personnes', 'max', 'size', 'private', 'privé']),
    reply: () => ({
      text: tours
        .map(t => `• ${t.name}: group ${t.groupSize}`)
        .join('\n') + `\n\nFor private bookings or larger groups, ${CONTACT_CTA.toLowerCase()}`,
    }),
  },
  {
    id: 'safety_kids',
    match: m => any(m, ['kid', 'child', 'enfant', 'family', 'famille', 'safe', 'age', 'âge']),
    reply: () => ({
      text: `El Yunque welcomes families — the waterslide and pools are natural and our guides walk every group through the cliff jumps (5/10/15/20 ft, optional). Salsa Rooftop is beginner-friendly at any age. For specific ages or mobility concerns, ${CONTACT_CTA.toLowerCase()}`,
    }),
  },
  {
    id: 'availability',
    match: m => any(m, ['available', 'dispo', 'date', 'book', 'reserv', 'when', 'schedule', 'tomorrow', 'today']),
    reply: () => ({
      text: `Live availability is on each tour page — scroll to the booking panel and pick your date. If nothing fits, ${CONTACT_CTA.toLowerCase()}`,
      suggestions: ['How much is El Yunque?', 'What is included?'],
    }),
  },
  {
    id: 'inclusions',
    match: m => any(m, ['includ', 'inclu', 'bring', 'what do', 'what\'s in', 'gear', 'equipment']),
    reply: () => ({
      text: `El Yunque: transport from San Juan hotel + guide + safety gear.\nCatamaran Vieques: open bar + lunch + snorkel equipment + sunset return.\nSalsa Rooftop: free Piña Colada + instructor (Zoe).\n\nBring swimwear, reef-safe sunscreen, and a towel for the water tours.`,
    }),
  },
  {
    id: 'pickup',
    match: m => any(m, ['pickup', 'pick-up', 'pick up', 'hotel', 'transport', 'address', 'where from']),
    reply: () => ({
      text: `El Yunque includes hotel pickup from San Juan. Catamaran departs from Plaza Mayor marina (Palmas del Mar, Humacao). Salsa is at ${tourBySlug('salsa').address ?? '1050 Calle Marianna, San Juan'}.`,
    }),
  },
  {
    id: 'combine',
    match: m => any(m, ['combine', 'both', 'same day', 'multiple', 'two tours']),
    reply: () => ({
      text: `Yes — El Yunque (morning/early afternoon) pairs well with Salsa Rooftop (6 PM). Catamaran is a full-day trip so we recommend a standalone day for it. Book both and ${CONTACT_CTA.toLowerCase()}`,
    }),
  },
  {
    id: 'cancel',
    match: m => any(m, ['cancel', 'refund', 'weather', 'rain', 'annul', 'remboursement']),
    reply: () => ({
      text: `Free cancellation up to 24h before your tour. Weather: we reschedule or refund when conditions make the activity unsafe.`,
    }),
  },
  {
    id: 'contact',
    match: m => any(m, ['contact', 'email', 'phone', 'whatsapp', 'reach', 'call', 'téléphone', 'appeler']),
    reply: () => ({
      text: `${CONTACT_CTA} We reply within a few hours during daytime in Puerto Rico (AST / UTC-4).`,
    }),
  },
  {
    id: 'reviews',
    match: m => any(m, ['review', 'rating', 'tripadvisor', 'avis', 'note']),
    reply: () => {
      const ta = siteConfig.tripAdvisor
      return {
        text: `${ta.rating}★ on TripAdvisor · ${ta.reviews.toLocaleString()} reviews · ${ta.ranking}.`,
      }
    },
  },
]

const FALLBACK: CaviReply = {
  text: `I can share prices, timing, inclusions, group sizes, or safety info. For anything else — itineraries, custom groups, specific dates — the fastest answer is ${CONTACT_CTA.toLowerCase()}`,
  suggestions: ['How much is El Yunque?', 'What is included?', 'Is it safe for kids?'],
}

export function matchIntent(message: string): CaviReply {
  const msg = lc(message).trim()
  if (!msg) return FALLBACK
  for (const intent of INTENTS) {
    if (intent.match(msg)) return intent.reply()
  }
  return FALLBACK
}
