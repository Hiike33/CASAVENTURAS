'use client'
import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { toursFor, siteConfigFor } from '@/lib/cms/client'
import type { Locale } from '@/i18n/routing'

export default function ContactForm() {
  const t = useTranslations('ContactForm')
  const locale = useLocale() as Locale
  const tours = toursFor(locale)
  const siteConfig = siteConfigFor(locale)
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
      <p className="text-[10px] font-medium tracking-[0.22em] uppercase text-[#248D6C] mb-2">{t('eyebrow')}</p>
      <h2 className="text-[#111] text-[32px] font-light tracking-tight mb-6">{t('headline')}</h2>

      <form onSubmit={onSubmit} className="space-y-3.5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[9px] font-medium tracking-[0.14em] uppercase text-[#888] mb-1.5">{t('firstName')}</label>
            <input
              type="text"
              required
              value={form.firstName}
              onChange={e => setForm({ ...form, firstName: e.target.value })}
              className="w-full border border-[#e8e8e8] text-[#111] text-[13.5px] font-light px-3.5 py-2.5 outline-none focus:border-[#248D6C] transition-colors"
            />
          </div>
          <div>
            <label className="block text-[9px] font-medium tracking-[0.14em] uppercase text-[#888] mb-1.5">{t('lastName')}</label>
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
          <label className="block text-[9px] font-medium tracking-[0.14em] uppercase text-[#888] mb-1.5">{t('email')}</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="w-full border border-[#e8e8e8] text-[#111] text-[13.5px] font-light px-3.5 py-2.5 outline-none focus:border-[#248D6C] transition-colors"
          />
        </div>

        <div>
          <label className="block text-[9px] font-medium tracking-[0.14em] uppercase text-[#888] mb-1.5">{t('tourInterest')}</label>
          <select
            value={form.tour}
            onChange={e => setForm({ ...form, tour: e.target.value })}
            className="w-full border border-[#e8e8e8] text-[#111] text-[13.5px] font-light px-3.5 py-2.5 outline-none focus:border-[#248D6C] transition-colors bg-white"
          >
            <option value="">{t('selectTour')}</option>
            {tours.map(tour => (
              <option key={tour.slug} value={tour.slug}>{tour.name}</option>
            ))}
            <option value="custom">{t('custom')}</option>
            <option value="private">{t('private')}</option>
            <option value="other">{t('other')}</option>
          </select>
        </div>

        <div>
          <label className="block text-[9px] font-medium tracking-[0.14em] uppercase text-[#888] mb-1.5">{t('message')}</label>
          <textarea
            required
            rows={5}
            placeholder={t('messagePlaceholder')}
            value={form.message}
            onChange={e => setForm({ ...form, message: e.target.value })}
            className="w-full border border-[#e8e8e8] text-[#111] text-[13.5px] font-light px-3.5 py-2.5 outline-none focus:border-[#248D6C] transition-colors resize-y"
          />
        </div>

        <button
          type="submit"
          disabled={status === 'sending'}
          className="cta-breathe bg-[#248D6C] text-white text-[10.5px] font-semibold tracking-[0.16em] uppercase px-9 py-3.5 hover:bg-[#1C6E54] mt-2 disabled:opacity-60"
        >
          {status === 'sending' ? t('sending') : status === 'sent' ? t('sent') : t('send')}
        </button>

        {status === 'error' && (
          <p className="text-[12px] text-red-600 font-light pt-2">
            {t('errorFallback', { email: siteConfig.email })}
          </p>
        )}
      </form>
    </div>
  )
}
