'use client'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocale } from 'next-intl'
import type { BokunAvailability, BokunAvailabilityResponse } from '@/lib/bokun/types'
import {
  buildAvailabilityMap,
  buildMonthGrid,
  isDateAvailable,
  monthStartEnd,
  toYMD,
} from '@/lib/bokun/calendar'

/**
 * Custom date picker that mirrors the Bokun widget calendar on
 * micasaventuras.com: a green corner triangle marks every date Bokun
 * has slots for, past dates are greyed, clicking a live date closes
 * the popover and calls onSelect with a YYYY-MM-DD string.
 *
 * Single month visible at a time with < / > nav (matches Bokun widget).
 * Pre-fetch strategy: one /api/bokun/availability call per month opened.
 * The ~15 KB JSON response is cheap enough that eager prefetching on
 * mount + month nav keeps the UI instant without wasting bandwidth.
 *
 * Timezone: Bokun availability.date is ms-since-epoch at UTC midnight
 * of the tour day. We key every cell in UTC (via toYMD) so the grid
 * renders the SAME dates the vendor's widget shows, regardless of the
 * visitor's local timezone.
 */
export type AvailabilityCalendarProps = {
  productId?: number
  selected?: string
  onSelect: (ymd: string) => void
  /** Opt-in wrapper className for layout (e.g., form width). */
  className?: string
}

type FetchState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'ok'; map: Map<string, BokunAvailability[]> }
  | { kind: 'error'; message: string }

const TODAY_YMD_SSR = '' // placeholder: we compute today on mount to avoid hydration mismatch

export default function AvailabilityCalendar({
  productId,
  selected,
  onSelect,
  className,
}: AvailabilityCalendarProps) {
  const locale = useLocale()
  const [open, setOpen] = useState(false)
  const [visibleMonth, setVisibleMonth] = useState<Date>(() => {
    // Seed with the selected date's month if present, else today. Computed
    // in state initializer so it only runs once per mount (no hydration
    // mismatch because both server and client start with empty `selected`).
    const base = selected ? new Date(selected + 'T00:00:00Z') : new Date()
    return new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), 1))
  })
  const [state, setState] = useState<FetchState>({ kind: 'idle' })
  const [today, setToday] = useState<string>(TODAY_YMD_SSR)
  const [mounted, setMounted] = useState(false)
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number; width: number } | null>(null)
  const popoverRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)

  // Compute today's date only on client so SSR markup matches initial hydration.
  useEffect(() => {
    setToday(toYMD(Date.now()))
    setMounted(true)
  }, [])

  // The popover is rendered via createPortal into document.body so it
  // escapes any `overflow-hidden` ancestor (e.g. BookingSidebar's
  // glass-luxe wrapper which would otherwise clip the bottom rows of
  // the month grid). Position is computed from the trigger's bounding
  // rect and recomputed on scroll/resize so it stays anchored when the
  // page or any scroll container moves.
  useEffect(() => {
    if (!open) {
      setPopoverPos(null)
      return
    }
    function update() {
      const rect = triggerRef.current?.getBoundingClientRect()
      if (!rect) return
      setPopoverPos({
        top: rect.bottom + 4, // mirrors the original mt-1 (4px gap)
        left: rect.left,
        width: rect.width,
      })
    }
    update()
    // capture phase = catches scroll on every ancestor (sticky aside,
    // overflow scrollers, etc.), not just window.
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [open])

  // Fetch the visible month whenever product or month changes, and only
  // when the popover is open so we avoid a wasted fetch on first render.
  useEffect(() => {
    if (!open || !productId) return
    const { start, end } = monthStartEnd(visibleMonth)
    const ctrl = new AbortController()
    setState({ kind: 'loading' })
    fetch(`/api/bokun/availability?productId=${productId}&start=${start}&end=${end}`, {
      signal: ctrl.signal,
    })
      .then(async r => (await r.json()) as BokunAvailabilityResponse)
      .then(data => {
        if (!data.ok) {
          setState({ kind: 'error', message: data.error })
          return
        }
        setState({ kind: 'ok', map: buildAvailabilityMap(data.availabilities) })
      })
      .catch(err => {
        if (err?.name === 'AbortError') return
        setState({ kind: 'error', message: 'Could not load availability' })
      })
    return () => ctrl.abort()
  }, [open, productId, visibleMonth])

  // Close on outside click / Escape for a minimal popover UX. Full keyboard
  // grid navigation (arrow keys) is deliberately omitted in v1 per scope.
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    function onClick(e: MouseEvent) {
      const t = e.target as Node
      if (popoverRef.current?.contains(t) || triggerRef.current?.contains(t)) return
      setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [open])

  const grid = buildMonthGrid(visibleMonth)
  const monthLabel = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(visibleMonth)
  const weekdayLabels = buildWeekdayLabels(locale)

  function pickDate(ymd: string) {
    onSelect(ymd)
    setOpen(false)
    triggerRef.current?.focus()
  }

  function goPrevMonth() {
    setVisibleMonth(d => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - 1, 1)))
  }
  function goNextMonth() {
    setVisibleMonth(d => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1)))
  }

  const map = state.kind === 'ok' ? state.map : new Map<string, BokunAvailability[]>()

  const triggerLabel = selected
    ? new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(selected + 'T00:00:00Z'))
    : 'Pick a date'

  return (
    <div className={`relative ${className ?? ''}`}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        data-test="availability-calendar-trigger"
        className="w-full bg-white border border-[#E5E5E5] text-[#111] text-[13px] font-light px-3.5 py-2.5 outline-none focus:border-[#248D6C] transition-colors flex items-center justify-between gap-3 cursor-pointer"
      >
        <span className={selected ? '' : 'text-[#aaa]'}>{triggerLabel}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-60" aria-hidden>
          <rect x="3" y="5" width="18" height="16" rx="1" />
          <path d="M3 9h18M8 3v4M16 3v4" />
        </svg>
      </button>

      {open && mounted && popoverPos && createPortal(
        <div
          ref={popoverRef}
          role="dialog"
          aria-label="Availability calendar"
          style={{
            position: 'fixed',
            top: popoverPos.top,
            left: popoverPos.left,
            width: popoverPos.width,
          }}
          className="z-[60] bg-white border border-[#E5E5E5] shadow-[0_8px_24px_rgba(0,0,0,0.08)] p-4"
          data-test="availability-calendar-popover"
        >
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={goPrevMonth}
              aria-label="Previous month"
              className="w-7 h-7 inline-flex items-center justify-center text-[#4F4F4E] hover:text-[#111] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
                <path d="M15 6l-6 6 6 6" />
              </svg>
            </button>
            <span className="text-[12px] font-medium text-[#111] tracking-[0.02em] capitalize">{monthLabel}</span>
            <button
              type="button"
              onClick={goNextMonth}
              aria-label="Next month"
              className="w-7 h-7 inline-flex items-center justify-center text-[#4F4F4E] hover:text-[#111] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0 mb-1" aria-hidden>
            {weekdayLabels.map(w => (
              <div key={w} className="text-[9.5px] font-medium tracking-[0.08em] uppercase text-[#888] text-center py-1.5">
                {w}
              </div>
            ))}
          </div>

          <div role="grid" aria-label={monthLabel} className="grid grid-cols-7 gap-0">
            {grid.map((cell, i) => {
              if (!cell.inMonth) {
                return <div key={i} aria-hidden className="h-10" />
              }
              const isPast = today !== '' && cell.ymd < today
              const loading = state.kind === 'loading'
              const available = !isPast && !loading && isDateAvailable(map, cell.ymd)
              const isSelected = cell.ymd === selected
              const disabled = isPast || (!loading && !available)
              return (
                <button
                  key={i}
                  type="button"
                  role="gridcell"
                  disabled={disabled}
                  onClick={() => pickDate(cell.ymd)}
                  aria-label={`${cell.day} ${monthLabel}${available ? ', available' : ''}${isSelected ? ', selected' : ''}`}
                  data-test={`calendar-cell-${cell.ymd}`}
                  data-available={available}
                  data-selected={isSelected}
                  className={[
                    'relative h-10 flex items-center justify-center text-[13px] font-light border border-transparent transition-colors',
                    disabled
                      ? 'text-[#ccc] cursor-not-allowed'
                      : 'text-[#111] cursor-pointer hover:border-[#248D6C]',
                    isSelected ? 'bg-[#248D6C] text-white hover:text-white hover:border-[#248D6C]' : '',
                  ].join(' ')}
                >
                  <span>{cell.day}</span>
                  {available && !isSelected && (
                    <span
                      aria-hidden
                      className="absolute top-0 right-0 w-0 h-0 border-t-[8px] border-l-[8px] border-t-[#248D6C] border-l-transparent"
                    />
                  )}
                </button>
              )
            })}
          </div>

          {state.kind === 'loading' && (
            <p className="text-[10px] font-light text-[#888] mt-2 text-center">Loading availability…</p>
          )}
          {state.kind === 'error' && (
            <p className="text-[10px] font-light text-red-600 mt-2 text-center">{state.message}</p>
          )}
        </div>,
        document.body,
      )}
    </div>
  )
}

/**
 * Locale-aware Mon..Sun weekday short labels using Intl. Generates once
 * from a known-Monday anchor date so we avoid a translation-file change.
 */
function buildWeekdayLabels(locale: string): string[] {
  const fmt = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' })
  // 2026-04-20 is a Monday (UTC).
  const monMs = Date.UTC(2026, 3, 20)
  return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(monMs + i * 86_400_000)))
}
