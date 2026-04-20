'use client'
import { useEffect, useRef, useState } from 'react'
import type { DisplayPlace } from '@/lib/geo/nominatim'

// Free-text address autocomplete backed by OpenStreetMap (via our
// /api/geo/search proxy). Drops the dropdown when the user picks a hit;
// still lets them type & submit whatever they want if no result matches
// (graceful fallback to free-text behaviour).

export type AddressAutocompleteValue = {
  text: string
  lat?: number
  lon?: number
  placeId?: number
}

export default function AddressAutocomplete({
  id,
  label,
  required,
  value,
  onChange,
  placeholder = 'Start typing your address…',
  hint,
}: {
  id: string
  label: string
  required?: boolean
  value: AddressAutocompleteValue
  onChange: (v: AddressAutocompleteValue) => void
  placeholder?: string
  hint?: string
}) {
  const [results, setResults] = useState<DisplayPlace[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [dirty, setDirty] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inFlightRef = useRef<AbortController | null>(null)

  // Close on outside click.
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

  // Debounced search. Respects Nominatim's 1-req/s soft limit: we wait
  // 400ms after last keystroke before issuing a request, and cancel any
  // pending request when the user types again.
  useEffect(() => {
    if (!dirty) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (inFlightRef.current) inFlightRef.current.abort()
    const q = value.text.trim()
    if (q.length < 3) {
      setResults([])
      setLoading(false)
      return
    }
    debounceRef.current = setTimeout(() => {
      const ctrl = new AbortController()
      inFlightRef.current = ctrl
      setLoading(true)
      fetch(`/api/geo/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal })
        .then(r => r.json())
        .then((data: { ok: boolean; results?: DisplayPlace[] }) => {
          if (data.ok && data.results) setResults(data.results)
          else setResults([])
        })
        .catch(err => {
          if (err?.name === 'AbortError') return
          setResults([])
        })
        .finally(() => setLoading(false))
    }, 400)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [value.text, dirty])

  return (
    <div ref={wrapRef} className="relative">
      <label
        htmlFor={id}
        className="block text-[9px] font-normal tracking-[0.14em] uppercase text-[#888] mb-1.5"
      >
        {label}
        {required && <span className="text-[#248D6C] ml-1">*</span>}
      </label>
      <input
        id={id}
        type="text"
        required={required}
        value={value.text}
        onFocus={() => setOpen(true)}
        onChange={e => {
          onChange({ text: e.target.value })
          setDirty(true)
          setOpen(true)
        }}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full border border-[#E5E5E5] text-[#111] text-[13px] font-light px-3.5 py-2.5 outline-none focus:border-[#248D6C] transition-colors placeholder:text-[#aaa]"
      />

      {value.lat !== undefined && value.lon !== undefined && (
        <p className="text-[10px] font-medium text-[#248D6C] mt-1.5 flex items-center gap-1.5">
          <PinDot /> Verified address · {value.lat.toFixed(4)}, {value.lon.toFixed(4)}
        </p>
      )}

      {!value.lat && hint && (
        <p className="text-[10px] font-light text-[#717170] mt-1">{hint}</p>
      )}

      {open && (loading || results.length > 0) && (
        <ul
          role="listbox"
          className="absolute z-10 left-0 right-0 mt-1 bg-white border border-[#E5E5E5] max-h-[260px] overflow-y-auto"
        >
          {loading && results.length === 0 && (
            <li className="px-3.5 py-2.5 text-[12px] font-light text-[#717170]">
              Searching Puerto Rico addresses…
            </li>
          )}
          {results.map(r => (
            <li key={r.placeId} role="option" aria-selected={false}>
              <button
                type="button"
                onClick={() => {
                  onChange({
                    text: r.displayName,
                    lat: r.lat,
                    lon: r.lon,
                    placeId: r.placeId,
                  })
                  setOpen(false)
                  setDirty(false)
                }}
                className="w-full text-left px-3.5 py-2.5 hover:bg-[#E6F3EE] transition-colors border-b border-[#F0F0F0] last:border-b-0"
              >
                <p className="text-[13px] font-normal text-[#111] leading-tight">
                  {r.primary}
                </p>
                {r.secondary && (
                  <p className="text-[11px] font-light text-[#717170] mt-0.5">
                    {r.secondary}
                  </p>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && !loading && value.text.trim().length >= 3 && results.length === 0 && (
        <p className="absolute z-10 left-0 right-0 mt-1 bg-white border border-[#E5E5E5] px-3.5 py-3 text-[12px] font-light text-[#717170]">
          No Puerto Rico match for &quot;{value.text}&quot;. You can still type
          your address manually — our guide will contact you to confirm.
        </p>
      )}
    </div>
  )
}

function PinDot() {
  return (
    <svg width="9" height="11" viewBox="0 0 9 11" fill="none" aria-hidden>
      <path
        d="M4.5 1C2.57 1 1 2.57 1 4.5c0 2.62 3.5 5.5 3.5 5.5s3.5-2.88 3.5-5.5C8 2.57 6.43 1 4.5 1z"
        stroke="#248D6C"
        strokeWidth="1"
        fill="none"
      />
      <circle cx="4.5" cy="4.5" r="1.2" fill="#248D6C" />
    </svg>
  )
}
