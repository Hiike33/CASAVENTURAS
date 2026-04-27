'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import type { PickupPlace } from '@/app/api/bokun/checkout-context/route'
import { ChevronIcon } from './icons'

// ─── Pickup hotel combobox ─────────────────────────────────────────────
// Type-ahead picker for the hotel pickup list (Bokun-curated). Filters
// up to 12 matches to keep the dropdown navigable. Closes on outside
// click. Shows a "no match" message when the query has no hits.
//
// Extracted from components/CheckoutPanel.tsx during the split phase 1
// (audit 2026-04-26). State (open, ref) is purely local; data flows in
// via `places` and out via `onSelect` / `onChange` callbacks.

type T = ReturnType<typeof useTranslations<'CheckoutPanel'>>

export type PickupComboboxProps = {
  places: PickupPlace[]
  value: string
  onSelect: (p: PickupPlace) => void
  onChange: (v: string) => void
  t: T
}

export default function PickupCombobox({
  places,
  value,
  onSelect,
  onChange,
  t,
}: PickupComboboxProps) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDocClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])
  const q = value.trim().toLowerCase()
  const filtered = useMemo(
    () =>
      q === ''
        ? places.slice(0, 12)
        : places.filter(p => p.title.toLowerCase().includes(q)).slice(0, 12),
    [q, places],
  )
  return (
    <div ref={wrapRef} className="relative">
      <label
        htmlFor="cp-pickup"
        className="block text-[9px] font-normal tracking-[0.14em] uppercase text-[#888] mb-1.5"
      >
        {t('hotelPickup')} <span className="text-[#248D6C]">*</span>
      </label>
      <div className="relative">
        <input
          id="cp-pickup"
          type="text"
          required
          value={value}
          onFocus={() => setOpen(true)}
          onChange={e => {
            onChange(e.target.value)
            setOpen(true)
          }}
          placeholder={t('searchHotel')}
          autoComplete="off"
          className="w-full border border-[#E5E5E5] text-[#111] text-[13px] font-light px-3.5 py-2.5 pr-9 outline-none focus:border-[#248D6C] transition-colors placeholder:text-[#aaa]"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#717170]">
          <ChevronIcon />
        </span>
      </div>
      {open && filtered.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-10 left-0 right-0 mt-1 bg-white border border-[#E5E5E5] max-h-[260px] overflow-y-auto"
        >
          {filtered.map(p => (
            <li key={p.id} role="option" aria-selected={false}>
              <button
                type="button"
                onClick={() => {
                  onSelect(p)
                  setOpen(false)
                }}
                className="w-full text-left text-[13px] font-light text-[#4F4F4E] px-3.5 py-2.5 hover:bg-[#E6F3EE] hover:text-[#111] transition-colors border-b border-[#F0F0F0] last:border-b-0"
              >
                {p.title}
                {p.askForRoomNumber && (
                  <span className="ml-2 text-[9px] tracking-[0.12em] uppercase text-[#717170]">
                    {t('roomRequired')}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && filtered.length === 0 && q !== '' && (
        <p className="absolute z-10 left-0 right-0 mt-1 bg-white border border-[#E5E5E5] px-3.5 py-3 text-[12px] font-light text-[#717170]">
          {t('noHotelMatch', { query: value })}
        </p>
      )}
      <p className="text-[10px] font-light text-[#717170] mt-1.5">
        {t('pickupLocations', { count: places.length })}
      </p>
    </div>
  )
}
