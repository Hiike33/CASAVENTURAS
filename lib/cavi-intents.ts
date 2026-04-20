import { tours as toursEn } from './cms/data/tours.en.ts'
import { tours as toursEs } from './cms/data/tours.es.ts'
import { siteConfig as siteConfigEn } from './cms/data/site-config.en.ts'
import { siteConfig as siteConfigEs } from './cms/data/site-config.es.ts'
import { faqById as faqByIdEn } from './cms/data/faqs.en.ts'
import { faqById as faqByIdEs } from './cms/data/faqs.es.ts'

// Deterministic multilingual intent matcher for Cavi. No LLM.
//
// Each locale has its own intent list with locale-native keywords (English,
// Spanish, and French). The matcher first detects the language of the
// user's message (via diacritic hints + common words), then scans the
// right intent list. Intents reference stable FAQ ids, so when faqs.es.ts
// translates "cat-seasickness", Cavi's answer in ES updates automatically.
//
// FR currently falls back to EN content (faqs.fr.ts re-exports EN) until
// Phase 8 produces proper French translations. The keyword detection still
// works in French so visitors get routed correctly; they just see EN
// answers for now. That is a better UX than silent fallback.

export type Locale = 'en' | 'es' | 'fr'

export type CaviCta = { type: 'email' | 'whatsapp'; label: string }

export type CaviReply = {
  text: string
  suggestions?: string[]
  ctas?: CaviCta[]
}

type Intent = {
  id: string
  match: (msg: string) => boolean
  /** Reference an authoritative FAQ answer in faqs.{locale}.ts. */
  faqId?: string
  /** Dynamic reply (used for overviews that compose multiple tours). */
  reply?: () => CaviReply
}

const lc = (s: string) => s.toLowerCase()
const hasAny = (msg: string, words: string[]) => words.some(w => msg.includes(w))

// ─── Language detection ─────────────────────────────────────────────
// Light heuristic: look for locale-unique graphemes and common particles.
// Falls back to 'en' when nothing strongly French or Spanish is present.
// The Spanish check runs before French because some Spanish particles
// (e.g. "¿", "¡") are unambiguous, while French tokens like "c'est" can
// appear in pidgin English.

// Only markers that are NOT substrings of common English words/names.
// "el" was removed because "El Yunque" would false-positive. Unique Spanish
// signals: inverted punctuation (¿/¡), ñ, accented question words, hola.
const ES_TOKENS = ['¿', '¡', 'ñ', ' qué', ' cómo', ' cuándo', ' dónde', ' cuánto', ' por favor', ' gracias', ' hola', 'hola ', 'hola.', 'hola!', ' estoy ', ' tengo ']
// French: apostrophe contractions and question words unique to FR.
const FR_TOKENS = ["c'est", "qu'est", 'est-ce', 'pourquoi', ' combien', ' où ', ' quelle ', ' quel ', ' merci', ' bonjour', ' salut ', ' ça ', 'à la', "à l'", ' ñ', 'français']

export function detectLocale(message: string, fallback: Locale = 'en'): Locale {
  const msg = ` ${lc(message)} `
  if (ES_TOKENS.some(t => msg.includes(t))) return 'es'
  if (FR_TOKENS.some(t => msg.includes(t))) return 'fr'
  return fallback
}

// ─── Data lookup tables per locale ──────────────────────────────────

const TOURS: Record<Locale, typeof toursEn> = { en: toursEn, es: toursEs, fr: toursEn }
const SITE: Record<Locale, typeof siteConfigEn> = { en: siteConfigEn, es: siteConfigEs, fr: siteConfigEn }
const FAQS: Record<Locale, typeof faqByIdEn> = { en: faqByIdEn, es: faqByIdEs, fr: faqByIdEn }

// ─── EN intents (unchanged baseline) ────────────────────────────────

const EN_INTENTS: Intent[] = [
  {
    id: 'greeting',
    match: m => hasAny(m, ['hola', 'hello', 'hi ', 'hey', 'bonjour', 'salut']) && m.length < 20,
    reply: () => ({
      text: 'Hola! I can help you pick the right experience, share prices, timing, what is included, or put you in touch with the team. What would you like to know?',
      suggestions: ['How much is El Yunque?', 'What is included?', 'Is it safe for kids?'],
    }),
  },
  { id: 'cat-age', match: m => hasAny(m, ['catamaran', 'boat', 'catamar', 'vieques']) && hasAny(m, ['age', 'baby', 'infant', 'toddler', 'child', 'kid']), faqId: 'cat-age-min' },
  { id: 'cat-alcohol', match: m => hasAny(m, ['alcohol', 'drink', 'bar', 'rum', 'beer', 'wine', 'minor', 'underage', '21']) && hasAny(m, ['catamaran', 'boat', 'cata', 'vieques', 'open bar']), faqId: 'cat-alcohol-minors' },
  { id: 'cat-seasick', match: m => hasAny(m, ['seasick', 'sea sick', 'motion sick', 'nauseous', 'nausea', 'dramamine', 'ginger']), faqId: 'cat-seasickness' },
  { id: 'cat-bathroom', match: m => hasAny(m, ['bathroom', 'toilet', 'restroom', 'head', 'wc']), faqId: 'cat-bathroom' },
  { id: 'cat-departure', match: m => hasAny(m, ['marina', 'depart', 'humacao', 'palmas', 'where does the boat', 'where do we meet for the boat']), faqId: 'cat-departure' },
  { id: 'cat-capacity', match: m => hasAny(m, ['catamaran', 'boat', 'cata']) && hasAny(m, ['people', 'capacity', 'group', 'max', 'fit', 'how many']), faqId: 'cat-capacity' },
  { id: 'cat-weather', match: m => hasAny(m, ['catamaran', 'boat', 'cata', 'sea']) && hasAny(m, ['weather', 'rain', 'storm', 'cloudy']), faqId: 'cat-weather' },
  { id: 'cat-inclusions', match: m => hasAny(m, ['catamaran', 'boat', 'cata']) && hasAny(m, ['include', 'inclu', 'what is in', "what's in", 'what comes']), faqId: 'cat-inclusions' },
  { id: 'ey-duration', match: m => hasAny(m, ['how long', 'duration', 'hours', 'what time ', 'how many hours']) && hasAny(m, ['yunque', 'rainforest', 'jungle', 'forest', 'hike']), faqId: 'ey-duration' },
  { id: 'ey-rain', match: m => hasAny(m, ['rains', 'raining', 'rain ', 'rain?', 'rain.', 'rain,', 'storm', 'pour', 'bad weather', 'flood', 'wet']) && hasAny(m, ['yunque', 'rainforest', 'forest', 'jungle', 'hike']), faqId: 'ey-rain' },
  { id: 'ey-cliff-age', match: m => hasAny(m, ['cliff', 'jump', 'ledge', 'height']), faqId: 'ey-cliff-age' },
  { id: 'ey-reservation-gov', match: m => hasAny(m, ['recreation.gov', 'reservation.gov', 'park reservation', 'permit', 'park pass', 'entry fee']), faqId: 'ey-reservation-gov' },
  { id: 'ey-fitness', match: m => hasAny(m, ['fitness', 'difficult', 'hard', 'easy', 'level', 'physical', 'workout', 'strenuous']) && hasAny(m, ['yunque', 'rainforest', 'jungle', 'forest', 'hike']), faqId: 'ey-fitness' },
  { id: 'ey-what-to-bring', match: m => hasAny(m, ['bring', 'pack', 'wear shoes', 'water shoes', 'dry bag', 'waterproof', 'sunscreen']) && hasAny(m, ['yunque', 'rainforest', 'jungle', 'forest', 'hike']), faqId: 'ey-what-to-bring' },
  { id: 'ey-kids-seniors', match: m => hasAny(m, ['kid', 'child', 'children', 'family', 'senior', 'elder', 'grandparent']) && hasAny(m, ['yunque', 'rainforest', 'jungle', 'forest', 'hike']), faqId: 'ey-kids-seniors' },
  { id: 'ey-why-us', match: m => hasAny(m, ['special', 'unique', 'different', 'why', 'versus', 'vs', 'compared']) && hasAny(m, ['yunque', 'rainforest']), faqId: 'ey-why-us' },
  { id: 'sal-partner', match: m => hasAny(m, ['partner', 'alone', 'solo']) && hasAny(m, ['salsa', 'dance', 'class']), faqId: 'sal-partner' },
  { id: 'sal-accessibility', match: m => hasAny(m, ['wheelchair', 'accessible', 'mobility', 'disabled', 'disability', 'stairs']), faqId: 'sal-accessibility' },
  { id: 'sal-private', match: m => hasAny(m, ['salsa', 'dance', 'zoe']) && hasAny(m, ['private', 'other time', 'flexible', 'different time', 'cannot make', "can't make"]), faqId: 'sal-private' },
  { id: 'sal-time', match: m => hasAny(m, ['salsa', 'dance', 'zoe']) && hasAny(m, ['time', 'when', 'start', 'hour', 'pm', 'evening']), faqId: 'sal-time' },
  { id: 'sal-wear', match: m => hasAny(m, ['salsa', 'dance', 'class']) && hasAny(m, ['wear', 'dress', 'shoes', 'heels', 'outfit', 'clothes']), faqId: 'sal-wear' },
  { id: 'sal-experience', match: m => hasAny(m, ['salsa', 'dance', 'zoe', 'class']) && hasAny(m, ['beginner', 'experience', 'never danced', 'first time', 'level', 'skill']), faqId: 'sal-experience' },
  { id: 'sal-location', match: m => hasAny(m, ['salsa', 'dance', 'zoe']) && hasAny(m, ['where', 'location', 'address', 'rooftop', 'santurce', 'marianna']), faqId: 'sal-location' },
  { id: 'gen-passport', match: m => hasAny(m, ['passport', 'visa', 'id ', 'identification', 'citizen', 'international']), faqId: 'gen-passport' },
  { id: 'gen-best-time', match: m => hasAny(m, ['best time', 'when to visit', 'best month', 'season', 'hurricane season', 'dry season']), faqId: 'gen-best-time' },
  { id: 'gen-mosquitoes', match: m => hasAny(m, ['mosquito', 'mosquit', 'zika', 'repellent', 'deet', 'bugs', 'insect']), faqId: 'gen-mosquitoes' },
  { id: 'gen-safety', match: m => hasAny(m, ['safe', 'safety', 'dangerous', 'crime', 'uber', 'taxi at night', 'walk alone']) && !hasAny(m, ['yunque', 'rainforest', 'kid', 'child', 'family', 'water']), faqId: 'gen-safety' },
  { id: 'gen-languages', match: m => hasAny(m, ['language', 'english', 'spanish', 'bilingual', 'french', 'portuguese', 'speak']), faqId: 'gen-languages' },
  { id: 'gen-tipping', match: m => hasAny(m, ['tip', 'gratuity', 'gratuit', 'tipping']), faqId: 'gen-tipping' },
  { id: 'gen-pickup', match: m => hasAny(m, ['pickup', 'pick up', 'pick-up', 'hotel', 'transport', 'from san juan', 'ride']), faqId: 'gen-pickup' },
  { id: 'gen-group-size', match: m => hasAny(m, ['small group', 'group size', 'how many people', 'max guest', 'max people', 'private']), faqId: 'gen-group-size' },
  { id: 'gen-cancellation', match: m => hasAny(m, ['cancel', 'cancellation', 'refund', 'change my date', 'reschedule']), faqId: 'gen-cancellation' },
  { id: 'gen-how-to-book', match: m => hasAny(m, ['how do i book', 'how to book', 'reserve', 'reservation', 'book online']), faqId: 'gen-how-to-book' },
  { id: 'gen-tripadvisor', match: m => hasAny(m, ['review', 'rating', 'tripadvisor', 'trust', 'legit', 'legitimate', 'feedback']), faqId: 'gen-tripadvisor' },
  { id: 'gen-location-info', match: m => hasAny(m, ['where are you', 'where is casa venturas', 'located', 'based', 'office']), faqId: 'gen-location' },
  { id: 'generic-family-kids', match: m => hasAny(m, ['kid', 'child', 'children', 'family', 'toddler', 'baby', 'safe for']), reply: () => makeFamilyOverview('en') },
  { id: 'generic-difficulty', match: m => hasAny(m, ['difficult', 'difficulty', 'hard', 'easy', 'level', 'physical', 'fitness', 'strenuous', 'workout']), reply: () => makeDifficultyOverview('en') },
  { id: 'generic-what-to-bring', match: m => hasAny(m, ['what should i bring', 'what do i bring', 'what to bring', 'what to pack', 'what do i pack', 'what should i wear', 'what to wear']), reply: () => makeWhatToBringOverview('en') },
  { id: 'generic-duration', match: m => hasAny(m, ['how long', 'duration', 'how many hours']) && !hasAny(m, ['yunque', 'rainforest', 'jungle', 'forest', 'hike', 'catamaran', 'boat', 'cata', 'salsa', 'dance']), reply: () => makeDurationOverview('en') },
  { id: 'price-overview', match: m => hasAny(m, ['price', 'cost', 'how much', 'rate', '$', 'rates']), reply: () => makePriceOverview('en') },
  { id: 'combine-tours', match: m => hasAny(m, ['combine', 'both', 'same day', 'two tours', 'all tours', 'multi-day']), reply: () => makeCombineReply('en') },
  { id: 'contact-team', match: m => hasAny(m, ['contact', 'email you', 'phone', 'reach you', 'call you', 'whatsapp']), reply: () => makeContactReply('en') },
]

// ─── ES intents (Spanish keyword variants) ──────────────────────────

const ES_INTENTS: Intent[] = [
  {
    id: 'greeting',
    match: m => hasAny(m, ['hola', 'buenos días', 'buenas tardes', 'buenas', 'hey', 'saludos']) && m.length < 25,
    reply: () => ({
      text: 'Hola. Puedo ayudarte a elegir la experiencia correcta, compartir precios, horarios, lo que está incluido, o ponerte en contacto con el equipo. ¿Qué te gustaría saber?',
      suggestions: ['¿Cuánto cuesta El Yunque?', '¿Qué está incluido?', '¿Es seguro para niños?'],
    }),
  },
  { id: 'cat-age', match: m => hasAny(m, ['catamarán', 'catamaran', 'barco', 'bote', 'vieques']) && hasAny(m, ['edad', 'bebé', 'bebe', 'niño', 'niña', 'infante', 'menor']), faqId: 'cat-age-min' },
  { id: 'cat-alcohol', match: m => hasAny(m, ['alcohol', 'trago', 'ron', 'cerveza', 'vino', 'barra', 'menor', '21']) && hasAny(m, ['catamarán', 'catamaran', 'barco', 'vieques', 'barra abierta']), faqId: 'cat-alcohol-minors' },
  { id: 'cat-seasick', match: m => hasAny(m, ['mareo', 'mareos', 'marea', 'mareas', 'dramamine', 'jengibre', 'náuseas', 'nauseas']), faqId: 'cat-seasickness' },
  { id: 'cat-bathroom', match: m => hasAny(m, ['baño', 'bano', 'servicio', 'inodoro']), faqId: 'cat-bathroom' },
  { id: 'cat-departure', match: m => hasAny(m, ['marina', 'zarpa', 'sale', 'sale de', 'humacao', 'palmas']) && hasAny(m, ['catamarán', 'catamaran', 'barco', 'bote', 'donde']), faqId: 'cat-departure' },
  { id: 'cat-capacity', match: m => hasAny(m, ['catamarán', 'catamaran', 'barco', 'bote']) && hasAny(m, ['gente', 'personas', 'capacidad', 'grupo', 'máximo', 'maximo', 'caben', 'cuánto', 'cuanto']), faqId: 'cat-capacity' },
  { id: 'cat-weather', match: m => hasAny(m, ['catamarán', 'catamaran', 'barco', 'bote', 'mar']) && hasAny(m, ['clima', 'lluvia', 'tormenta', 'nublado', 'tiempo']), faqId: 'cat-weather' },
  { id: 'cat-inclusions', match: m => hasAny(m, ['catamarán', 'catamaran', 'barco', 'bote']) && hasAny(m, ['incluye', 'incluido', 'qué lleva', 'que lleva', 'qué trae']), faqId: 'cat-inclusions' },
  { id: 'ey-duration', match: m => hasAny(m, ['cuánto dura', 'cuanto dura', 'duración', 'duracion', 'horas', 'cuánto tiempo', 'cuanto tiempo']) && hasAny(m, ['yunque', 'selva', 'bosque', 'caminata', 'hike']), faqId: 'ey-duration' },
  { id: 'ey-rain', match: m => hasAny(m, ['lluvia', 'llueve', 'llover', 'tormenta', 'mal tiempo', 'inundación', 'inundacion']) && hasAny(m, ['yunque', 'selva', 'bosque', 'caminata']), faqId: 'ey-rain' },
  { id: 'ey-cliff-age', match: m => hasAny(m, ['salto', 'saltos', 'acantilado', 'altura', 'clavado', 'clavados']), faqId: 'ey-cliff-age' },
  { id: 'ey-reservation-gov', match: m => hasAny(m, ['recreation.gov', 'reserva del parque', 'permiso', 'pase del parque', 'entrada al parque']), faqId: 'ey-reservation-gov' },
  { id: 'ey-fitness', match: m => hasAny(m, ['físico', 'fisico', 'difícil', 'dificil', 'fácil', 'facil', 'nivel', 'condición', 'condicion', 'esforzado']) && hasAny(m, ['yunque', 'selva', 'bosque', 'caminata', 'hike']), faqId: 'ey-fitness' },
  { id: 'ey-what-to-bring', match: m => hasAny(m, ['llevar', 'traer', 'zapatos', 'botas', 'bolsa', 'impermeable', 'protector']) && hasAny(m, ['yunque', 'selva', 'bosque', 'caminata']), faqId: 'ey-what-to-bring' },
  { id: 'ey-kids-seniors', match: m => hasAny(m, ['niño', 'niños', 'niña', 'niñas', 'familia', 'mayor', 'abuelo', 'abuela']) && hasAny(m, ['yunque', 'selva', 'bosque', 'caminata']), faqId: 'ey-kids-seniors' },
  { id: 'ey-why-us', match: m => hasAny(m, ['especial', 'único', 'unico', 'diferente', 'por qué', 'por que', 'versus', 'vs', 'comparado']) && hasAny(m, ['yunque', 'selva', 'bosque']), faqId: 'ey-why-us' },
  { id: 'sal-partner', match: m => hasAny(m, ['pareja', 'solo', 'sola', 'acompañante']) && hasAny(m, ['salsa', 'baile', 'clase']), faqId: 'sal-partner' },
  { id: 'sal-accessibility', match: m => hasAny(m, ['silla de ruedas', 'accesible', 'movilidad', 'discapacidad', 'escaleras']), faqId: 'sal-accessibility' },
  { id: 'sal-private', match: m => hasAny(m, ['salsa', 'baile', 'zoe']) && hasAny(m, ['privada', 'privado', 'otra hora', 'flexible', 'otro horario']), faqId: 'sal-private' },
  { id: 'sal-time', match: m => hasAny(m, ['salsa', 'baile', 'zoe']) && hasAny(m, ['hora', 'cuándo', 'cuando', 'empieza', 'tarde', 'noche']), faqId: 'sal-time' },
  { id: 'sal-wear', match: m => hasAny(m, ['salsa', 'baile', 'clase']) && hasAny(m, ['vestir', 'ropa', 'zapatos', 'tacones', 'vestimenta']), faqId: 'sal-wear' },
  { id: 'sal-experience', match: m => hasAny(m, ['salsa', 'baile', 'zoe', 'clase']) && hasAny(m, ['principiante', 'experiencia', 'nunca bailé', 'nunca baile', 'primera vez', 'nivel']), faqId: 'sal-experience' },
  { id: 'sal-location', match: m => hasAny(m, ['salsa', 'baile', 'zoe']) && hasAny(m, ['dónde', 'donde', 'ubicación', 'ubicacion', 'dirección', 'direccion', 'azotea', 'santurce', 'marianna']), faqId: 'sal-location' },
  { id: 'gen-passport', match: m => hasAny(m, ['pasaporte', 'visa', 'identificación', 'identificacion', 'ciudadano']), faqId: 'gen-passport' },
  { id: 'gen-best-time', match: m => hasAny(m, ['mejor época', 'mejor epoca', 'cuándo visitar', 'cuando visitar', 'mejor mes', 'temporada', 'huracán', 'huracan']), faqId: 'gen-best-time' },
  { id: 'gen-mosquitoes', match: m => hasAny(m, ['mosquito', 'mosquitos', 'zika', 'repelente', 'deet', 'insecto']), faqId: 'gen-mosquitoes' },
  { id: 'gen-safety', match: m => hasAny(m, ['seguro', 'seguridad', 'peligroso', 'crimen', 'uber', 'taxi de noche', 'noche sola']) && !hasAny(m, ['yunque', 'selva', 'niño', 'familia', 'agua']), faqId: 'gen-safety' },
  { id: 'gen-languages', match: m => hasAny(m, ['idioma', 'inglés', 'ingles', 'español', 'bilingüe', 'bilingue', 'francés', 'frances', 'hablan']), faqId: 'gen-languages' },
  { id: 'gen-tipping', match: m => hasAny(m, ['propina', 'propinas', 'gratuidad']), faqId: 'gen-tipping' },
  { id: 'gen-pickup', match: m => hasAny(m, ['recogida', 'recoger', 'recogen', 'hotel', 'transporte', 'desde san juan']), faqId: 'gen-pickup' },
  { id: 'gen-group-size', match: m => hasAny(m, ['grupo pequeño', 'grupo pequeno', 'tamaño del grupo', 'tamano del grupo', 'cuántas personas', 'cuantas personas', 'máximo', 'maximo', 'privado']), faqId: 'gen-group-size' },
  { id: 'gen-cancellation', match: m => hasAny(m, ['cancelar', 'cancelación', 'cancelacion', 'reembolso', 'cambiar fecha', 'reprogramar']), faqId: 'gen-cancellation' },
  { id: 'gen-how-to-book', match: m => hasAny(m, ['cómo reservo', 'como reservo', 'cómo reservar', 'como reservar', 'reservar en línea', 'reservar online']), faqId: 'gen-how-to-book' },
  { id: 'gen-tripadvisor', match: m => hasAny(m, ['reseña', 'reseñas', 'reseñas', 'calificación', 'calificacion', 'tripadvisor', 'confianza', 'legítimo', 'legitimo']), faqId: 'gen-tripadvisor' },
  { id: 'gen-location-info', match: m => hasAny(m, ['dónde están', 'donde estan', 'dónde es casa venturas', 'donde es casa venturas', 'ubicados', 'base', 'oficina']), faqId: 'gen-location' },
  { id: 'generic-family-kids', match: m => hasAny(m, ['niño', 'niña', 'niños', 'niñas', 'familia', 'bebé', 'bebe', 'apto para']), reply: () => makeFamilyOverview('es') },
  { id: 'generic-difficulty', match: m => hasAny(m, ['difícil', 'dificil', 'dificultad', 'fácil', 'facil', 'nivel', 'físico', 'fisico', 'condición', 'condicion']), reply: () => makeDifficultyOverview('es') },
  { id: 'generic-what-to-bring', match: m => hasAny(m, ['qué llevar', 'que llevar', 'qué traer', 'que traer', 'qué empacar', 'que empacar', 'qué ponerme', 'que ponerme']), reply: () => makeWhatToBringOverview('es') },
  { id: 'generic-duration', match: m => hasAny(m, ['cuánto dura', 'cuanto dura', 'duración', 'duracion', 'cuántas horas', 'cuantas horas']) && !hasAny(m, ['yunque', 'selva', 'bosque', 'caminata', 'catamarán', 'catamaran', 'barco', 'salsa', 'baile']), reply: () => makeDurationOverview('es') },
  { id: 'price-overview', match: m => hasAny(m, ['precio', 'precios', 'costo', 'costos', 'cuánto cuesta', 'cuanto cuesta', 'cuánto vale', 'cuanto vale', 'tarifa', '$']), reply: () => makePriceOverview('es') },
  { id: 'combine-tours', match: m => hasAny(m, ['combinar', 'ambos', 'mismo día', 'mismo dia', 'dos tours', 'todos los tours', 'varios días', 'varios dias']), reply: () => makeCombineReply('es') },
  { id: 'contact-team', match: m => hasAny(m, ['contacto', 'contactar', 'email', 'teléfono', 'telefono', 'llamar', 'whatsapp']), reply: () => makeContactReply('es') },
]

// ─── FR intents (French keyword variants) ───────────────────────────
// FR answers temporarily read from EN data (faqs.fr.ts re-exports EN)
// until Phase 8 produces proper French translations.

const FR_INTENTS: Intent[] = [
  {
    id: 'greeting',
    match: m => hasAny(m, ['bonjour', 'salut', 'hola', 'hello', 'hey', 'coucou']) && m.length < 25,
    reply: () => ({
      text: "Hola ! Je peux t'aider à choisir l'expérience, te donner les prix, les horaires, ce qui est inclus, ou te mettre en contact avec l'équipe. Qu'est-ce que tu veux savoir ?",
      suggestions: ['Combien coûte El Yunque ?', "Qu'est-ce qui est inclus ?", 'Est-ce sûr pour les enfants ?'],
    }),
  },
  { id: 'cat-age', match: m => hasAny(m, ['catamaran', 'bateau', 'vieques']) && hasAny(m, ['âge', 'age', 'bébé', 'bebe', 'enfant', 'nourrisson']), faqId: 'cat-age-min' },
  { id: 'cat-alcohol', match: m => hasAny(m, ['alcool', 'boisson', 'rhum', 'bière', 'biere', 'vin', 'bar', 'mineur', '21 ans']) && hasAny(m, ['catamaran', 'bateau', 'vieques', 'bar ouvert']), faqId: 'cat-alcohol-minors' },
  { id: 'cat-seasick', match: m => hasAny(m, ['mal de mer', 'nausée', 'nausee', 'dramamine', 'gingembre']), faqId: 'cat-seasickness' },
  { id: 'cat-bathroom', match: m => hasAny(m, ['toilettes', 'toilette', 'wc', 'salle de bain']), faqId: 'cat-bathroom' },
  { id: 'cat-departure', match: m => hasAny(m, ['marina', 'part de', 'humacao', 'palmas']) && hasAny(m, ['catamaran', 'bateau', 'où']), faqId: 'cat-departure' },
  { id: 'cat-capacity', match: m => hasAny(m, ['catamaran', 'bateau']) && hasAny(m, ['personnes', 'capacité', 'capacite', 'groupe', 'combien', 'max']), faqId: 'cat-capacity' },
  { id: 'cat-weather', match: m => hasAny(m, ['catamaran', 'bateau', 'mer']) && hasAny(m, ['météo', 'meteo', 'pluie', 'tempête', 'tempete', 'nuageux']), faqId: 'cat-weather' },
  { id: 'cat-inclusions', match: m => hasAny(m, ['catamaran', 'bateau']) && hasAny(m, ['inclus', 'comprend', 'contient']), faqId: 'cat-inclusions' },
  { id: 'ey-duration', match: m => hasAny(m, ['combien de temps', 'durée', 'duree', 'heures']) && hasAny(m, ['yunque', 'forêt', 'foret', 'jungle', 'rando']), faqId: 'ey-duration' },
  { id: 'ey-rain', match: m => hasAny(m, ['pluie', 'pleuvoir', 'pleut', 'orage', 'tempête', 'tempete', 'inondation']) && hasAny(m, ['yunque', 'forêt', 'foret', 'jungle', 'rando']), faqId: 'ey-rain' },
  { id: 'ey-cliff-age', match: m => hasAny(m, ['saut', 'sauts', 'falaise', 'hauteur', 'plongeon']), faqId: 'ey-cliff-age' },
  { id: 'ey-reservation-gov', match: m => hasAny(m, ['recreation.gov', 'réservation du parc', 'reservation du parc', 'permis', 'pass du parc']), faqId: 'ey-reservation-gov' },
  { id: 'ey-fitness', match: m => hasAny(m, ['physique', 'difficile', 'facile', 'niveau', 'condition', 'sportif']) && hasAny(m, ['yunque', 'forêt', 'foret', 'jungle', 'rando']), faqId: 'ey-fitness' },
  { id: 'ey-what-to-bring', match: m => hasAny(m, ['apporter', 'emporter', 'chaussures', 'sac sec', 'imperméable', 'impermeable', 'crème solaire', 'creme solaire']) && hasAny(m, ['yunque', 'forêt', 'foret', 'jungle', 'rando']), faqId: 'ey-what-to-bring' },
  { id: 'ey-kids-seniors', match: m => hasAny(m, ['enfant', 'enfants', 'famille', 'senior', 'aîné', 'aine', 'grand-parent']) && hasAny(m, ['yunque', 'forêt', 'foret', 'jungle', 'rando']), faqId: 'ey-kids-seniors' },
  { id: 'ey-why-us', match: m => hasAny(m, ['spécial', 'special', 'unique', 'différent', 'different', 'pourquoi', 'versus', 'vs', 'comparé', 'compare']) && hasAny(m, ['yunque', 'forêt', 'foret']), faqId: 'ey-why-us' },
  { id: 'sal-partner', match: m => hasAny(m, ['partenaire', 'seul', 'seule']) && hasAny(m, ['salsa', 'danse', 'cours']), faqId: 'sal-partner' },
  { id: 'sal-accessibility', match: m => hasAny(m, ['fauteuil roulant', 'accessible', 'mobilité', 'mobilite', 'handicap', 'escaliers']), faqId: 'sal-accessibility' },
  { id: 'sal-private', match: m => hasAny(m, ['salsa', 'danse', 'zoe']) && hasAny(m, ['privé', 'prive', 'autre heure', 'flexible', 'autre horaire']), faqId: 'sal-private' },
  { id: 'sal-time', match: m => hasAny(m, ['salsa', 'danse', 'zoe']) && hasAny(m, ['heure', 'quand', 'commence', 'soir']), faqId: 'sal-time' },
  { id: 'sal-wear', match: m => hasAny(m, ['salsa', 'danse', 'cours']) && hasAny(m, ['porter', 'habiller', 'chaussures', 'talons', 'tenue']), faqId: 'sal-wear' },
  { id: 'sal-experience', match: m => hasAny(m, ['salsa', 'danse', 'zoe', 'cours']) && hasAny(m, ['débutant', 'debutant', 'expérience', 'experience', 'jamais dansé', 'jamais danse', 'première fois', 'premiere fois', 'niveau']), faqId: 'sal-experience' },
  { id: 'sal-location', match: m => hasAny(m, ['salsa', 'danse', 'zoe']) && hasAny(m, ['où', 'adresse', 'rooftop', 'santurce', 'marianna']), faqId: 'sal-location' },
  { id: 'gen-passport', match: m => hasAny(m, ['passeport', 'visa', 'identité', 'identite', 'citoyen']), faqId: 'gen-passport' },
  { id: 'gen-best-time', match: m => hasAny(m, ['meilleure période', 'meilleure periode', 'quand visiter', 'meilleur mois', 'saison', 'ouragan']), faqId: 'gen-best-time' },
  { id: 'gen-mosquitoes', match: m => hasAny(m, ['moustique', 'moustiques', 'zika', 'répulsif', 'repulsif', 'deet', 'insecte']), faqId: 'gen-mosquitoes' },
  { id: 'gen-safety', match: m => hasAny(m, ['sûr', 'sur ', 'sécurité', 'securite', 'dangereux', 'crime', 'uber', 'taxi le soir']) && !hasAny(m, ['yunque', 'forêt', 'enfant', 'famille', 'eau']), faqId: 'gen-safety' },
  { id: 'gen-languages', match: m => hasAny(m, ['langue', 'anglais', 'espagnol', 'bilingue', 'français', 'francais', 'parlent']), faqId: 'gen-languages' },
  { id: 'gen-tipping', match: m => hasAny(m, ['pourboire', 'pourboires', 'gratification']), faqId: 'gen-tipping' },
  { id: 'gen-pickup', match: m => hasAny(m, ['ramassage', 'récupérer', 'recuperer', 'hôtel', 'hotel', 'transport', 'depuis san juan']), faqId: 'gen-pickup' },
  { id: 'gen-group-size', match: m => hasAny(m, ['petit groupe', 'taille du groupe', 'combien de personnes', 'maximum', 'privé', 'prive']), faqId: 'gen-group-size' },
  { id: 'gen-cancellation', match: m => hasAny(m, ['annuler', 'annulation', 'remboursement', 'changer la date', 'reprogrammer']), faqId: 'gen-cancellation' },
  { id: 'gen-how-to-book', match: m => hasAny(m, ['comment réserver', 'comment reserver', 'réserver en ligne', 'reserver en ligne']), faqId: 'gen-how-to-book' },
  { id: 'gen-tripadvisor', match: m => hasAny(m, ['avis', 'note', 'tripadvisor', 'confiance', 'légitime', 'legitime']), faqId: 'gen-tripadvisor' },
  { id: 'gen-location-info', match: m => hasAny(m, ['où êtes-vous', 'ou etes vous', 'où est casa venturas', 'ou est casa venturas', 'basés', 'bases', 'bureau']), faqId: 'gen-location' },
  { id: 'generic-family-kids', match: m => hasAny(m, ['enfant', 'enfants', 'famille', 'bébé', 'bebe', 'sûr pour', 'sur pour']), reply: () => makeFamilyOverview('fr') },
  { id: 'generic-difficulty', match: m => hasAny(m, ['difficile', 'difficulté', 'difficulte', 'facile', 'niveau', 'physique', 'sportif']), reply: () => makeDifficultyOverview('fr') },
  { id: 'generic-what-to-bring', match: m => hasAny(m, ['quoi apporter', "qu'apporter", 'quoi emporter', 'quoi porter', 'quoi mettre', 'tenue']), reply: () => makeWhatToBringOverview('fr') },
  { id: 'generic-duration', match: m => hasAny(m, ['combien de temps', 'durée', 'duree', 'combien heures']) && !hasAny(m, ['yunque', 'forêt', 'foret', 'jungle', 'catamaran', 'bateau', 'salsa', 'danse']), reply: () => makeDurationOverview('fr') },
  { id: 'price-overview', match: m => hasAny(m, ['prix', 'coût', 'cout', 'combien coûte', 'combien coute', 'tarif', '$']), reply: () => makePriceOverview('fr') },
  { id: 'combine-tours', match: m => hasAny(m, ['combiner', 'les deux', 'même jour', 'meme jour', 'deux tours', 'plusieurs jours']), reply: () => makeCombineReply('fr') },
  { id: 'contact-team', match: m => hasAny(m, ['contact', 'écrire', 'ecrire', 'téléphone', 'telephone', 'appeler', 'whatsapp']), reply: () => makeContactReply('fr') },
]

const INTENTS: Record<Locale, Intent[]> = { en: EN_INTENTS, es: ES_INTENTS, fr: FR_INTENTS }

// ─── Shared dynamic replies (composed from tours[locale]) ───────────

function priceLines(locale: Locale) {
  return TOURS[locale]
    .map(t => `• ${t.name}: $${t.price}/${locale === 'es' ? 'persona' : locale === 'fr' ? 'personne' : 'person'} (${t.duration}, ${t.groupSize})`)
    .join('\n')
}

function makePriceOverview(locale: Locale): CaviReply {
  const header = {
    en: 'Here are our published rates per person:',
    es: 'Estas son nuestras tarifas por persona:',
    fr: 'Voici nos tarifs par personne :',
  }[locale]
  const footer = {
    en: 'Free cancellation up to 24 hours before. Booking direct saves you up to 25% versus Viator.',
    es: 'Cancelación gratis hasta 24 horas antes. Reservar directo te ahorra hasta un 25% frente a Viator.',
    fr: "Annulation gratuite jusqu'à 24h avant. Réserver direct t'économise jusqu'à 25% par rapport à Viator.",
  }[locale]
  const suggestions = {
    en: ['What is included in El Yunque?', 'How long is the catamaran?'],
    es: ['¿Qué incluye El Yunque?', '¿Cuánto dura el catamarán?'],
    fr: ["Qu'est-ce qui est inclus pour El Yunque ?", 'Combien de temps dure le catamaran ?'],
  }[locale]
  return { text: `${header}\n\n${priceLines(locale)}\n\n${footer}`, suggestions }
}

function makeFamilyOverview(locale: Locale): CaviReply {
  const text = {
    en: 'Quick family fit by tour:\n\n• El Yunque: families welcome. Guided groups have included 5-year-olds and seniors. Cliff jumps (5 to 20 ft) are always optional.\n• Catamaran: kids of any walking age are welcome, infants under 2 not allowed for safety. Open bar is 21+, minors get unlimited soft drinks.\n• Salsa Rooftop: beginner-friendly at any age, Zoe rotates partners so kids and parents dance together.',
    es: 'Resumen familiar por tour:\n\n• El Yunque: familias bienvenidas. Hemos guiado grupos con niños de 5 años y adultos mayores. Los saltos de acantilado (5 a 20 pies) son siempre opcionales.\n• Catamarán: los niños que ya caminan son bienvenidos, los bebés menores de 2 años no pueden subir por seguridad. La barra abierta es para mayores de 21, los menores tienen refrescos ilimitados.\n• Salsa en la azotea: apta para principiantes de cualquier edad, Zoe rota las parejas para que niños y papás bailen juntos.',
    fr: "Compatibilité familiale rapide par tour :\n\n• El Yunque : familles bienvenues. On a guidé des groupes avec des enfants de 5 ans et des seniors. Les sauts de falaise (5 à 20 pieds) sont toujours optionnels.\n• Catamaran : les enfants qui marchent sont les bienvenus, les nourrissons de moins de 2 ans ne sont pas autorisés pour raisons de sécurité. Le bar ouvert est 21+, les mineurs ont des softs à volonté.\n• Salsa Rooftop : accessible à tout âge débutant, Zoe fait tourner les partenaires pour que parents et enfants dansent ensemble.",
  }[locale]
  const ctas: CaviCta[] = [
    { type: 'email', label: locale === 'es' ? 'Escríbenos' : locale === 'fr' ? 'Écris-nous' : 'Email us' },
    { type: 'whatsapp', label: 'WhatsApp' },
  ]
  const suggestions = {
    en: ['Is El Yunque safe for kids?', 'Catamaran age minimum?'],
    es: ['¿Es seguro para niños en El Yunque?', '¿Edad mínima del catamarán?'],
    fr: ['Est-ce sûr pour les enfants à El Yunque ?', 'Âge minimum catamaran ?'],
  }[locale]
  return { text, ctas, suggestions }
}

function makeDifficultyOverview(locale: Locale): CaviReply {
  const text = {
    en: 'Difficulty by tour:\n\n• El Yunque: moderate. Muddy jungle paths, river walking, optional cliff jumps.\n• Catamaran: passive. You sail, swim, snorkel at your pace.\n• Salsa Rooftop: beginner-friendly. Zoe teaches from zero.',
    es: 'Dificultad por tour:\n\n• El Yunque: moderada. Senderos embarrados, caminata por el río, saltos opcionales.\n• Catamarán: pasiva. Navegas, nadas y haces snorkel a tu ritmo.\n• Salsa en la azotea: apta para principiantes. Zoe enseña desde cero.',
    fr: "Difficulté par tour :\n\n• El Yunque : modérée. Sentiers boueux, marche dans la rivière, sauts optionnels.\n• Catamaran : passive. Tu navigues, nages et fais du snorkel à ton rythme.\n• Salsa Rooftop : accessible aux débutants. Zoe t'enseigne à partir de zéro.",
  }[locale]
  return { text }
}

function makeWhatToBringOverview(locale: Locale): CaviReply {
  const text = {
    en: 'What to bring, by tour:\n\n• El Yunque: water shoes, dry bag, waterproof phone case, change of clothes, sunscreen.\n• Catamaran: swimwear, towel, reef-safe sunscreen, light layer for sunset return. Snorkel gear and lunch included.\n• Salsa Rooftop: comfortable shoes (sneakers fine), casual clothes, water. Arrive 10 minutes early.',
    es: 'Qué llevar, por tour:\n\n• El Yunque: zapatos de agua, bolsa seca, funda impermeable para el teléfono, ropa de cambio, protector solar.\n• Catamarán: traje de baño, toalla, protector solar reef-safe, una capa ligera para el regreso al atardecer. El equipo de snorkel y el almuerzo están incluidos.\n• Salsa en la azotea: zapatos cómodos (tenis va bien), ropa casual, agua. Llega 10 minutos antes.',
    fr: "Ce qu'il faut apporter, par tour :\n\n• El Yunque : chaussures d'eau, sac sec, housse étanche pour le téléphone, change, crème solaire.\n• Catamaran : maillot, serviette, crème solaire reef-safe, une couche légère pour le retour. Le matériel de snorkel et le déjeuner sont inclus.\n• Salsa Rooftop : chaussures confortables (baskets OK), tenue casual, eau. Arrive 10 minutes en avance.",
  }[locale]
  return { text }
}

function makeDurationOverview(locale: Locale): CaviReply {
  const header = {
    en: 'Durations by tour:',
    es: 'Duraciones por tour:',
    fr: 'Durées par tour :',
  }[locale]
  const lines = TOURS[locale].map(t => `• ${t.name}: ${t.duration}`).join('\n')
  return { text: `${header}\n\n${lines}` }
}

function makeCombineReply(locale: Locale): CaviReply {
  const text = {
    en: 'El Yunque (morning to early afternoon) pairs well with Salsa Rooftop at 6 PM the same day. Catamaran is a full-day trip, so we recommend a standalone day for it. Want to book multiple? Email us and we will sequence them cleanly.',
    es: 'El Yunque (de la mañana a primera hora de la tarde) combina bien con la salsa en la azotea a las 6 PM el mismo día. El catamarán es de día completo, así que recomendamos un día dedicado. ¿Quieres reservar varios? Escríbenos y te los ordenamos.',
    fr: "El Yunque (matin jusqu'en début d'après-midi) se combine bien avec la Salsa Rooftop à 18h le même jour. Le catamaran prend la journée complète, on te recommande une journée dédiée. Tu veux réserver plusieurs tours ? Écris-nous, on te les enchaîne proprement.",
  }[locale]
  return {
    text,
    ctas: [
      { type: 'email', label: locale === 'es' ? 'Escríbenos' : locale === 'fr' ? 'Écris-nous' : 'Email us' },
      { type: 'whatsapp', label: 'WhatsApp' },
    ],
  }
}

function makeContactReply(locale: Locale): CaviReply {
  const site = SITE[locale]
  const text = {
    en: `The fastest paths are email ${site.email} or WhatsApp ${site.phone}. We reply within a few hours during daytime in Puerto Rico (AST, UTC-4).`,
    es: `Lo más rápido es por email ${site.email} o WhatsApp ${site.phone}. Respondemos en pocas horas durante el día en Puerto Rico (AST, UTC-4).`,
    fr: `Le plus rapide, c'est par email ${site.email} ou WhatsApp ${site.phone}. On répond en quelques heures pendant la journée à Porto Rico (AST, UTC-4).`,
  }[locale]
  return {
    text,
    ctas: [
      { type: 'email', label: locale === 'es' ? 'Escríbenos' : locale === 'fr' ? 'Écris-nous' : 'Email us' },
      { type: 'whatsapp', label: 'WhatsApp' },
    ],
  }
}

// ─── Fallback per locale ────────────────────────────────────────────

const FALLBACK: Record<Locale, CaviReply> = {
  en: {
    text: "I couldn't answer that one, but one of our lovely team members will, ASAP ;)",
    ctas: [{ type: 'email', label: 'Email us' }, { type: 'whatsapp', label: 'WhatsApp' }],
  },
  es: {
    text: 'No pude responder esa, pero alguien encantador de nuestro equipo lo hará, ya mismo ;)',
    ctas: [{ type: 'email', label: 'Escríbenos' }, { type: 'whatsapp', label: 'WhatsApp' }],
  },
  fr: {
    text: "Je n'ai pas pu répondre à celle-là, mais un membre adorable de l'équipe va s'en occuper tout de suite ;)",
    ctas: [{ type: 'email', label: 'Écris-nous' }, { type: 'whatsapp', label: 'WhatsApp' }],
  },
}

// ─── Public API ─────────────────────────────────────────────────────

export function matchIntent(message: string, locale?: Locale): CaviReply {
  const msg = lc(message).trim()
  const effective: Locale = locale ?? detectLocale(message)
  if (!msg) return FALLBACK[effective]
  for (const intent of INTENTS[effective]) {
    if (intent.match(msg)) {
      if (intent.faqId) {
        const faq = FAQS[effective][intent.faqId]
        if (faq) return { text: faq.answer }
      }
      if (intent.reply) return intent.reply()
    }
  }
  return FALLBACK[effective]
}

export function matchIntentId(message: string, locale?: Locale): string | null {
  const msg = lc(message).trim()
  const effective: Locale = locale ?? detectLocale(message)
  if (!msg) return null
  for (const intent of INTENTS[effective]) {
    if (intent.match(msg)) return intent.id
  }
  return null
}

export const INTENT_FAQ_REFS: string[] = EN_INTENTS
  .map(i => i.faqId)
  .filter((v): v is string => typeof v === 'string')

export function buildMailto(userMessage: string, locale: Locale = 'en'): string {
  const site = SITE[locale]
  const subject = {
    en: 'Question from casaventuras.com',
    es: 'Pregunta desde casaventuras.com',
    fr: 'Question depuis casaventuras.com',
  }[locale]
  const defaultBody = {
    en: 'Hi, I have a question about your tours.',
    es: 'Hola, tengo una pregunta sobre sus tours.',
    fr: "Bonjour, j'ai une question sur vos tours.",
  }[locale]
  const body = userMessage.trim() || defaultBody
  return `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

export function buildWhatsapp(userMessage: string, locale: Locale = 'en'): string {
  const site = SITE[locale]
  const defaultText = {
    en: 'Hi! I have a question about your tours.',
    es: '¡Hola! Tengo una pregunta sobre sus tours.',
    fr: "Bonjour ! J'ai une question sur vos tours.",
  }[locale]
  const text = userMessage.trim() || defaultText
  return `${site.whatsapp}?text=${encodeURIComponent(text)}`
}
