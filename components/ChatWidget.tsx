'use client'
import { useEffect, useRef, useState } from 'react'
import { useLocale } from 'next-intl'
import {
  matchIntent,
  buildMailto,
  buildWhatsapp,
  getContactReply,
  CATEGORIES,
  type CaviCta,
  type CaviCategory,
  type Locale,
} from '@/lib/cavi-intents'

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
  en: { role: 'bot', text: "Hola! I'm Cavi. Pick a topic below — I'll give you the exact answer." },
  es: { role: 'bot', text: 'Hola. Soy Cavi. Elige un tema abajo — te respondo al instante.' },
  fr: { role: 'bot', text: "Hola ! Je suis Cavi. Choisis un sujet ci-dessous — je te réponds tout de suite." },
}

const HEADER_BY_LOCALE: Record<Locale, {
  badge: string
  instant: string
  pickTopic: string
  backToMenu: string
  typing: string
}> = {
  en: { badge: 'Cavi, Casa Venturas Guide', instant: 'Instant · 24/7', pickTopic: 'Pick a topic:', backToMenu: '← Back to topics', typing: 'Cavi is typing' },
  es: { badge: 'Cavi, guía de Casa Venturas', instant: 'Al instante · 24/7', pickTopic: 'Elige un tema:', backToMenu: '← Volver a los temas', typing: 'Cavi está escribiendo' },
  fr: { badge: 'Cavi, guide de Casa Venturas', instant: 'Instantané · 24/7', pickTopic: 'Choisis un sujet :', backToMenu: '← Retour aux sujets', typing: 'Cavi écrit' },
}

// Small artificial delay so replies don't flash in the same tick as the user's
// message. No LLM is being called, the delay is purely for conversational UX.
const REPLY_DELAY_MS = 380

type ViewState = 'menu' | 'category' | 'answer'

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
  const [loading, setLoading] = useState(false)
  const [viewState, setViewState] = useState<ViewState>('menu')
  const [currentCategory, setCurrentCategory] = useState<CaviCategory | null>(null)
  const [followups, setFollowups] = useState<string[]>([])
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, loading, viewState])

  const askQuestion = (text: string) => {
    if (loading) return
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
      setFollowups(reply.suggestions ?? [])
      setLoading(false)
      setViewState('answer')
    }, REPLY_DELAY_MS)
  }

  const pickCategory = (cat: CaviCategory) => {
    if (loading) return
    // "Talk to a human" — no drill-down, reply immediately with contact info.
    if (cat.id === 'contact') {
      const reply = getContactReply(locale)
      setMessages(prev => [...prev, { role: 'user', text: cat.label }])
      setLoading(true)
      window.setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            role: 'bot',
            text: reply.text,
            ctas: reply.ctas,
            originalQuestion: cat.label,
          },
        ])
        setFollowups([])
        setLoading(false)
        setViewState('answer')
      }, REPLY_DELAY_MS)
      return
    }
    // Regular category → show the prompt and the category's question buttons.
    setMessages(prev => [...prev, { role: 'user', text: cat.label }])
    setLoading(true)
    window.setTimeout(() => {
      setMessages(prev => [...prev, { role: 'bot', text: cat.prompt }])
      setCurrentCategory(cat)
      setLoading(false)
      setViewState('category')
    }, REPLY_DELAY_MS)
  }

  const backToMenu = () => {
    if (loading) return
    setViewState('menu')
    setCurrentCategory(null)
    setFollowups([])
  }

  const visibleChoices: string[] =
    viewState === 'category' && currentCategory
      ? currentCategory.questions
      : viewState === 'answer'
      ? followups
      : []

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

      {/* Messages + navigation */}
      <div className="flex-1 flex flex-col gap-3 px-7 py-5 overflow-y-auto" style={{ maxHeight: '500px' }}>
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

        {loading && (
          <div className="self-start">
            <div className="bg-[#FAFAFA] border border-[#E5E5E5] text-[#888] text-[12px] px-4 py-3">
              {ui.typing}<span className="animate-pulse">…</span>
            </div>
          </div>
        )}

        {/* Top-level category menu */}
        {!loading && viewState === 'menu' && (
          <div className="self-start flex flex-col gap-1.5 mt-1">
            <p className="text-[9px] font-medium tracking-[0.14em] uppercase text-[#888] mb-1">{ui.pickTopic}</p>
            {CATEGORIES[locale].map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => pickCategory(cat)}
                className="text-left text-[11.5px] font-light text-[#1C6E54] border border-[#248D6C]/30 bg-[#E6F3EE] px-3 py-2 max-w-[85%] hover:bg-[#248D6C]/15 hover:border-[#248D6C] transition-colors"
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* Drill-down questions (category) or follow-ups (answer) */}
        {!loading && visibleChoices.length > 0 && (
          <div className="self-start flex flex-col gap-1.5 mt-1">
            {visibleChoices.map(q => (
              <button
                key={q}
                type="button"
                onClick={() => askQuestion(q)}
                className="text-left text-[11.5px] font-light text-[#1C6E54] border border-[#248D6C]/30 bg-[#E6F3EE] px-3 py-2 max-w-[85%] hover:bg-[#248D6C]/15 hover:border-[#248D6C] transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        <div ref={endRef} aria-hidden />
      </div>

      {/* Persistent "back to topics" bar (replaces the free-text input). Shown
          whenever the user has drilled into a category or received an answer. */}
      {viewState !== 'menu' && (
        <div className="flex border-t border-[#E5E5E5] mt-auto">
          <button
            type="button"
            onClick={backToMenu}
            disabled={loading}
            className="flex-1 bg-white text-[#248D6C] text-[10px] font-semibold tracking-[0.12em] uppercase px-6 py-4 hover:bg-[#E6F3EE] transition-colors disabled:opacity-50"
          >
            {ui.backToMenu}
          </button>
        </div>
      )}
    </div>
  )
}
