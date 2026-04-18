'use client'
import { useState } from 'react'
import type { Tour } from '@/lib/tours'

export default function BookingSidebar({ tour }: { tour: Tour }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [form, setForm] = useState({
    date: '',
    guests: '',
    level: tour.level ?? '',
    name: '',
    email: '',
    request: '',
  })

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tour: tour.slug, ...form }),
      })
      setStatus(res.ok ? 'sent' : 'error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <aside className="sticky top-[80px] border border-[#E5E5E5] bg-white">
      <header className="bg-[#FAFAFA] border-b border-[#E5E5E5] px-6 py-5">
        <p className="text-[9px] font-medium tracking-[0.2em] uppercase text-[#248D6C] mb-1.5">Starting from</p>
        <p className="text-[36px] font-light text-[#111] leading-none tracking-tight">${tour.price}</p>
        <p className="text-[11px] text-[#888] mt-1 font-light">{tour.priceNote}</p>
      </header>

      <form onSubmit={onSubmit} className="p-6 space-y-3">
        <div>
          <label className="block text-[9px] font-normal tracking-[0.14em] uppercase text-[#888] mb-1.5">Preferred date</label>
          <input
            type="date"
            required
            value={form.date}
            onChange={e => setForm({ ...form, date: e.target.value })}
            className="w-full border border-[#e8e8e8] text-[#111] text-[13px] font-light px-3.5 py-2.5 outline-none focus:border-[#248D6C] transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[9px] font-normal tracking-[0.14em] uppercase text-[#888] mb-1.5">Guests</label>
            <input
              type="number"
              min={1}
              max={13}
              required
              placeholder="2"
              value={form.guests}
              onChange={e => setForm({ ...form, guests: e.target.value })}
              className="w-full border border-[#e8e8e8] text-[#111] text-[13px] font-light px-3.5 py-2.5 outline-none focus:border-[#248D6C] transition-colors"
            />
          </div>
          {tour.level && (
            <div>
              <label className="block text-[9px] font-normal tracking-[0.14em] uppercase text-[#888] mb-1.5">Fitness level</label>
              <select
                value={form.level}
                onChange={e => setForm({ ...form, level: e.target.value })}
                className="w-full border border-[#e8e8e8] text-[#111] text-[13px] font-light px-3.5 py-2.5 outline-none focus:border-[#248D6C] transition-colors bg-white"
              >
                <option>Easy</option>
                <option>Moderate</option>
                <option>Active</option>
              </select>
            </div>
          )}
        </div>

        <div>
          <label className="block text-[9px] font-normal tracking-[0.14em] uppercase text-[#888] mb-1.5">Full name</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full border border-[#e8e8e8] text-[#111] text-[13px] font-light px-3.5 py-2.5 outline-none focus:border-[#248D6C] transition-colors"
          />
        </div>
        <div>
          <label className="block text-[9px] font-normal tracking-[0.14em] uppercase text-[#888] mb-1.5">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="w-full border border-[#e8e8e8] text-[#111] text-[13px] font-light px-3.5 py-2.5 outline-none focus:border-[#248D6C] transition-colors"
          />
        </div>

        {tour.slug === 'catamaran' && (
          <div>
            <label className="block text-[9px] font-normal tracking-[0.14em] uppercase text-[#888] mb-1.5">Special requests</label>
            <textarea
              rows={2}
              placeholder="Dietary needs, occasion, SJ transport..."
              value={form.request}
              onChange={e => setForm({ ...form, request: e.target.value })}
              className="w-full border border-[#e8e8e8] text-[#111] text-[13px] font-light px-3.5 py-2.5 outline-none focus:border-[#248D6C] transition-colors resize-none"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'sending'}
          className="w-full bg-[#248D6C] text-white text-[10px] font-semibold tracking-[0.16em] uppercase py-3.5 hover:bg-[#1C6E54] transition-colors mt-3 disabled:opacity-60"
        >
          {status === 'sending' ? 'Sending…' : status === 'sent' ? 'Received ✓' : `Confirm booking — $${tour.price}/person`}
        </button>

        {status === 'error' && (
          <p className="text-[11px] text-red-600 text-center font-light">Something went wrong. Email us at {`micasaventuras@gmail.com`}.</p>
        )}

        <p className="text-[9.5px] text-center text-[#aaa] font-light">
          Free cancellation up to 24h · Instant confirmation
        </p>
      </form>
    </aside>
  )
}
