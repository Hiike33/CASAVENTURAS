'use client'
import { useEffect, useRef, useState } from 'react'
import { useLocale } from 'next-intl'
import { matchIntent, buildMailto, buildWhatsapp, type CaviCta, type Locale } from '@/lib/cavi-intents'

type Message = {
  role: 'bot' | 'user'
  text: string
  /** Attached CTAs (e.g. mailto + WhatsApp when Cavi can't answer). */
  ctas?: CaviCta[]
  /** User's original message captured when CTAs are rendered, so the buttons
   * can pre-fill mailto and wa.me URLs with exactly what they asked. */
  originalQuestion?: string
}

const INITIAL_BY_LOCALE: Record<Locale, Message> = {
  en: { role: 'bot', text: "Hola! I'm Cavi. Ask me about prices, what's included, group sizes, safety, anything about our tours. I'll answer right away." },
  es: { role: 'bot', text: 'Hola. Soy Cavi. Pregúntame por precios, qué incluye cada tour, tamaño del grupo o seguridad. Te respondo al instante.' },
  fr: { role: 'bot', text: "Hola ! Je suis Cavi. Demande-moi les prix, ce qui est inclus, la taille des groupes, la sécurité ou n'importe quoi sur nos tours. Je te réponds tout de suite." },
}

const DEFAULT_SUGGESTIONS: Record<Locale, string[]> = {
  en: ['How much is El Yunque?', 'What is included?', 'Is it safe for kids?'],
  es: ['¿Cuánto cuesta El Yunque?', '¿Qué está incluido?', '¿Es seguro para niños?'],
  fr: ['Combien coûte El Yunque ?', "Qu'est-ce qui est inclus ?", 'Est-ce sûr pour les enfants ?'],
}

const HEADER_BY_LOCALE: Record<Locale, { badge: string; instant: string; placeholder: string; send: string; typing: string; ariaLabel: string; tryAsking: string }> = {
  en: { badge: 'Cavi, Casa Venturas Guide', instant: 'Instant · 24/7', placeholder: 'Ask anything about our experiences…', send: 'Send', typing: 'Cavi is typing', ariaLabel: 'Message Cavi', tryAsking: 'Try asking:' },
  es: { badge: 'Cavi, guía de Casa Venturas', instant: 'Al instante · 24/7', placeholder: 'Pregunta lo que quieras sobre nuestras experiencias…', send: 'Enviar', typing: 'Cavi está escribiendo', ariaLabel: 'Mensaje a Cavi', tryAsking: 'Prueba preguntando:' },
  fr: { badge: 'Cavi, guide de Casa Venturas', instant: 'Instantané · 24/7', placeholder: 'Pose-moi toutes tes questions sur nos expériences…', send: 'Envoyer', typing: 'Cavi écrit', ariaLabel: 'Message à Cavi', tryAsking: 'Essaie :' },
}

// Small artificial delay so replies don't flash in the same tick as the user's
// message. No LLM is being called, the delay is purely for conversational UX.
const REPLY_DELAY_MS = 380

function CtaButtons({ ctas, question, locale }: { ctas: CaviCta[]; question: string; locale: Locale }) {
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {ctas.map(cta => {
        const href = cta.type === 'email' ? buildMailto(question, locale) : buildWhatsapp(question, locale)
        return (
          <a
            key={cta.type}
            href={href}
            target={cta.type === 'whatsapp' ? '_blank' : undefined}
            rel={cta.type === 'whatsapp' ? 'noopener noreferrer' : undefined}
            className="text-[11px] font-medium tracking-[0.1em] uppercase text-white bg-[#248D6C] hover:bg-[#1C6E54] px-4 py-2 transition-colors"
          >
            {cta.label}
          </a>
        )
      })}
    </div>
  )
}

export default function ChatWidget() {
  const rawLocale = useLocale()
  const locale: Locale = (['en', 'es', 'fr'] as const).includes(rawLocale as Locale) ? (rawLocale as Locale) : 'en'
  const ui = HEADER_BY_LOCALE[locale]

  const [messages, setMessages] = useState<Message[]>([INITIAL_BY_LOCALE[locale]])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_SUGGESTIONS[locale])
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, loading])

  const send = (override?: string) => {
    const text = (override ?? input).trim()
    if (!text || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text }])
    setLoading(true)

    const reply = matchIntent(text, locale)
    window.setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          role: 'bot',
          text: reply.text,
          ctas: reply.ctas,
          originalQuestion: reply.ctas ? text : undefined,
        },
      ])
      setSuggestions(reply.suggestions ?? [])
      setLoading(false)
    }, REPLY_DELAY_MS)
  }

  return (
    <div className="bg-white border border-[#E5E5E5] flex flex-col" style={{ minHeight: '380px' }}>
      {/* Header */}
      <div className="flex items-center gap-2.5 px-7 py-5 border-b border-[#E5E5E5] bg-[#FAFAFA]">
        <span className="w-[7px] h-[7px] rounded-full bg-[#248D6C] animate-pulse" aria-hidden />
        <span className="text-[10px] font-medium tracking-[0.15em] uppercase text-[#248D6C]">
          {ui.badge}
        </span>
        <span className="ml-auto text-[8.5px] tracking-[0.08em] text-[#888] bg-white border border-[#E5E5E5] px-2.5 py-0.5 uppercase">
          {ui.instant}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 flex flex-col gap-3 px-7 py-5 overflow-y-auto max-h-[400px]">
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'self-end' : 'self-start'}>
            <div
              className={`text-[12.5px] font-light leading-relaxed px-4 py-3 max-w-[88%] whitespace-pre-line ${
                m.role === 'bot'
                  ? 'bg-[#FAFAFA] border border-[#E5E5E5] text-[#4F4F4E]'
                  : 'bg-[#248D6C] text-white'
              }`}
            >
              {m.text}
              {m.ctas && m.ctas.length > 0 && (
                <CtaButtons ctas={m.ctas} question={m.originalQuestion ?? ''} locale={locale} />
              )}
            </div>
          </div>
        ))}
        {!loading && suggestions.length > 0 && (
          <div className="self-start flex flex-col gap-1.5 mt-1">
            <p className="text-[9px] font-medium tracking-[0.14em] uppercase text-[#888] mb-1">{ui.tryAsking}</p>
            {suggestions.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="text-left text-[11.5px] font-light text-[#1C6E54] border border-[#248D6C]/30 bg-[#E6F3EE] px-3 py-2 max-w-[85%] hover:bg-[#248D6C]/15 hover:border-[#248D6C] transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        {loading && (
          <div className="self-start">
            <div className="bg-[#FAFAFA] border border-[#E5E5E5] text-[#888] text-[12px] px-4 py-3">
              {ui.typing}<span className="animate-pulse">…</span>
            </div>
          </div>
        )}
        <div ref={endRef} aria-hidden />
      </div>

      {/* Input */}
      <div className="flex border-t border-[#E5E5E5] mt-auto">
        <label htmlFor="cavi-input" className="sr-only">{ui.ariaLabel}</label>
        <input
          id="cavi-input"
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder={ui.placeholder}
          disabled={loading}
          className="flex-1 bg-white text-[#111] text-[13px] font-light px-4 py-3 outline-none placeholder:text-[#aaa] border-none disabled:opacity-60"
        />
        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          className="bg-[#248D6C] text-white text-[10px] font-semibold tracking-[0.12em] uppercase px-6 hover:bg-[#1C6E54] transition-colors disabled:opacity-50"
        >
          {ui.send}
        </button>
      </div>
    </div>
  )
}
