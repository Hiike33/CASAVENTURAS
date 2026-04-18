'use client'
import { useEffect, useRef, useState } from 'react'

type Message = { role: 'bot' | 'user'; text: string }

const INITIAL: Message[] = [
  { role: 'bot', text: "Hola! I'm Cavi. Tell me about your group and I'll find the perfect experience — availability, what to bring, all of it." },
]

const SUGGESTIONS = [
  'We\'re a family with 2 kids — is El Yunque safe for them?',
  'Private catamaran for 8 people — dates open this month?',
  'Can I combine El Yunque morning + salsa evening same day?',
]

export default function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>(INITIAL)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, loading])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setError(null)
    setMessages(prev => [...prev, { role: 'user', text }])
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: messages }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'bot', text: data.reply ?? 'No reply received.' }])
    } catch (err) {
      setError('Cavi could not respond. Please email micasaventuras@gmail.com.')
      setMessages(prev => [...prev, {
        role: 'bot',
        text: "Sorry — I'm having trouble connecting. You can reach us at micasaventuras@gmail.com or +1 929 372 4529.",
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border border-[#E5E5E5] flex flex-col" style={{ minHeight: '380px' }}>
      {/* Header */}
      <div className="flex items-center gap-2.5 px-7 py-5 border-b border-[#E5E5E5] bg-[#FAFAFA]">
        <span className="w-[7px] h-[7px] rounded-full bg-[#248D6C] animate-pulse" aria-hidden />
        <span className="text-[10px] font-medium tracking-[0.15em] uppercase text-[#248D6C]">
          Cavi — Casa Venturas Guide
        </span>
        <span className="ml-auto text-[8.5px] tracking-[0.08em] text-[#888] bg-white border border-[#E5E5E5] px-2.5 py-0.5 uppercase">
          Claude AI · 24/7
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 flex flex-col gap-3 px-7 py-5 overflow-y-auto max-h-[400px]">
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'self-end' : 'self-start'}>
            <div
              className={`text-[12.5px] font-light leading-relaxed px-4 py-3 max-w-[88%] ${
                m.role === 'bot'
                  ? 'bg-[#FAFAFA] border border-[#E5E5E5] text-[#4F4F4E]'
                  : 'bg-[#248D6C] text-white'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {messages.length === 1 && !loading && (
          <div className="self-start flex flex-col gap-1.5 mt-1">
            <p className="text-[9px] font-medium tracking-[0.14em] uppercase text-[#888] mb-1">Try asking:</p>
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setInput(s)}
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
              Cavi is typing<span className="animate-pulse">…</span>
            </div>
          </div>
        )}
        {error && (
          <p className="text-[11px] text-red-600 font-light text-center pt-2">{error}</p>
        )}
        <div ref={endRef} aria-hidden />
      </div>

      {/* Input */}
      <div className="flex border-t border-[#E5E5E5] mt-auto">
        <label htmlFor="cavi-input" className="sr-only">Message Cavi</label>
        <input
          id="cavi-input"
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Ask anything about our experiences…"
          disabled={loading}
          className="flex-1 bg-white text-[#111] text-[13px] font-light px-4 py-3 outline-none placeholder:text-[#aaa] border-none disabled:opacity-60"
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="bg-[#248D6C] text-white text-[10px] font-semibold tracking-[0.12em] uppercase px-6 hover:bg-[#1C6E54] transition-colors disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  )
}
