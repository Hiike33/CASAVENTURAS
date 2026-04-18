'use client'
import { useState } from 'react'
import { tours } from '@/lib/tours'

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    tour: '',
    message: '',
  })

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
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
    <div>
      <p className="text-[10px] font-medium tracking-[0.22em] uppercase text-[#248D6C] mb-2">Send a message</p>
      <h2 className="text-[#111] text-[32px] font-light tracking-tight mb-6">We&apos;ll respond within the hour</h2>

      <form onSubmit={onSubmit} className="space-y-3.5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[9px] font-medium tracking-[0.14em] uppercase text-[#888] mb-1.5">First name</label>
            <input
              type="text"
              required
              value={form.firstName}
              onChange={e => setForm({ ...form, firstName: e.target.value })}
              className="w-full border border-[#e8e8e8] text-[#111] text-[13.5px] font-light px-3.5 py-2.5 outline-none focus:border-[#248D6C] transition-colors"
            />
          </div>
          <div>
            <label className="block text-[9px] font-medium tracking-[0.14em] uppercase text-[#888] mb-1.5">Last name</label>
            <input
              type="text"
              required
              value={form.lastName}
              onChange={e => setForm({ ...form, lastName: e.target.value })}
              className="w-full border border-[#e8e8e8] text-[#111] text-[13.5px] font-light px-3.5 py-2.5 outline-none focus:border-[#248D6C] transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-[9px] font-medium tracking-[0.14em] uppercase text-[#888] mb-1.5">Email address</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="w-full border border-[#e8e8e8] text-[#111] text-[13.5px] font-light px-3.5 py-2.5 outline-none focus:border-[#248D6C] transition-colors"
          />
        </div>

        <div>
          <label className="block text-[9px] font-medium tracking-[0.14em] uppercase text-[#888] mb-1.5">Tour of interest</label>
          <select
            value={form.tour}
            onChange={e => setForm({ ...form, tour: e.target.value })}
            className="w-full border border-[#e8e8e8] text-[#111] text-[13.5px] font-light px-3.5 py-2.5 outline-none focus:border-[#248D6C] transition-colors bg-white"
          >
            <option value="">Select a tour</option>
            {tours.map(t => (
              <option key={t.slug} value={t.slug}>{t.name}</option>
            ))}
            <option value="custom">Multiple tours / custom itinerary</option>
            <option value="private">Private group / corporate event</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-[9px] font-medium tracking-[0.14em] uppercase text-[#888] mb-1.5">Message</label>
          <textarea
            required
            rows={5}
            placeholder="Tell us about your group, travel dates, any questions or special requests…"
            value={form.message}
            onChange={e => setForm({ ...form, message: e.target.value })}
            className="w-full border border-[#e8e8e8] text-[#111] text-[13.5px] font-light px-3.5 py-2.5 outline-none focus:border-[#248D6C] transition-colors resize-y"
          />
        </div>

        <button
          type="submit"
          disabled={status === 'sending'}
          className="bg-[#248D6C] text-white text-[10.5px] font-semibold tracking-[0.16em] uppercase px-9 py-3.5 hover:bg-[#1C6E54] transition-colors mt-2 disabled:opacity-60"
        >
          {status === 'sending' ? 'Sending…' : status === 'sent' ? 'Message sent ✓' : 'Send message →'}
        </button>

        {status === 'error' && (
          <p className="text-[12px] text-red-600 font-light pt-2">
            Something went wrong. Please email us directly at micasaventuras@gmail.com.
          </p>
        )}
      </form>
    </div>
  )
}
