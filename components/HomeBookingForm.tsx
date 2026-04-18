'use client'
import { useState } from 'react'
import { tours } from '@/lib/tours'

export default function HomeBookingForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [form, setForm] = useState({
    tour: tours[0].slug,
    date: '',
    guests: '',
    name: '',
    email: '',
  })

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setStatus(res.ok ? 'sent' : 'error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={onSubmit} className="bg-white border border-[#E5E5E5] p-8">
      <p className="text-[9px] font-medium tracking-[0.2em] uppercase text-[#888] mb-6">Reservation form</p>

      <label htmlFor="hb-tour" className="block text-[9px] font-medium tracking-[0.14em] uppercase text-[#888] mb-1.5">Select experience</label>
      <select
        id="hb-tour"
        value={form.tour}
        onChange={e => setForm({ ...form, tour: e.target.value })}
        className="w-full bg-white border border-[#E5E5E5] text-[#111] text-[13px] font-light px-3.5 py-2.5 mb-4 outline-none focus:border-[#248D6C] transition-colors"
      >
        {tours.map(t => (
          <option key={t.slug} value={t.slug}>{t.name} — ${t.price}/person</option>
        ))}
        <option value="rum">Rum Distillery Tour — on request</option>
        <option value="surf">Learn to Surf — on request</option>
      </select>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label htmlFor="hb-date" className="block text-[9px] font-medium tracking-[0.14em] uppercase text-[#888] mb-1.5">Date</label>
          <input
            id="hb-date"
            type="date"
            required
            value={form.date}
            onChange={e => setForm({ ...form, date: e.target.value })}
            className="w-full bg-white border border-[#E5E5E5] text-[#111] text-[13px] font-light px-3.5 py-2.5 outline-none focus:border-[#248D6C] transition-colors"
          />
        </div>
        <div>
          <label htmlFor="hb-guests" className="block text-[9px] font-medium tracking-[0.14em] uppercase text-[#888] mb-1.5">Guests</label>
          <input
            id="hb-guests"
            type="number"
            min={1}
            max={13}
            required
            placeholder="2"
            value={form.guests}
            onChange={e => setForm({ ...form, guests: e.target.value })}
            className="w-full bg-white border border-[#E5E5E5] text-[#111] text-[13px] font-light px-3.5 py-2.5 outline-none focus:border-[#248D6C] transition-colors placeholder:text-[#aaa]"
          />
        </div>
      </div>

      <label htmlFor="hb-name" className="block text-[9px] font-medium tracking-[0.14em] uppercase text-[#888] mb-1.5">Full name</label>
      <input
        id="hb-name"
        type="text"
        required
        value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })}
        className="w-full bg-white border border-[#E5E5E5] text-[#111] text-[13px] font-light px-3.5 py-2.5 mb-4 outline-none focus:border-[#248D6C] transition-colors"
      />

      <label htmlFor="hb-email" className="block text-[9px] font-medium tracking-[0.14em] uppercase text-[#888] mb-1.5">Email</label>
      <input
        id="hb-email"
        type="email"
        required
        placeholder="your@email.com"
        value={form.email}
        onChange={e => setForm({ ...form, email: e.target.value })}
        className="w-full bg-white border border-[#E5E5E5] text-[#111] text-[13px] font-light px-3.5 py-2.5 mb-5 outline-none focus:border-[#248D6C] transition-colors placeholder:text-[#aaa]"
      />

      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full bg-[#248D6C] text-white text-[10px] font-semibold tracking-[0.16em] uppercase py-3.5 hover:bg-[#1C6E54] transition-colors disabled:opacity-60"
      >
        {status === 'sending' ? 'Sending…' : status === 'sent' ? 'Booking received ✓' : 'Confirm booking'}
      </button>

      {status === 'error' && (
        <p className="text-[10px] text-red-600 text-center mt-2 font-light">
          Something went wrong. Please email us at micasaventuras@gmail.com.
        </p>
      )}

      <p className="text-[9.5px] text-center text-[#888] mt-2.5 font-light">
        Free cancellation · Instant confirmation · No OTA fee
      </p>
    </form>
  )
}
