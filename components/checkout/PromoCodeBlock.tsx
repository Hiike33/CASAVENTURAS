'use client'

import { useTranslations } from 'next-intl'
import { CheckIcon } from './icons'

// ─── Promo code block ──────────────────────────────────────────────────
// Field + inline status badge + discount breakdown. All state is driven
// by the parent's debounced useEffect — this component is purely visual.
//
// Extracted from components/CheckoutPanel.tsx during the split phase 1
// (audit 2026-04-26). The component is fully Presentational : it
// receives its state via props and never reads from a closure scope of
// CheckoutPanelInner.

type T = ReturnType<typeof useTranslations<'CheckoutPanel'>>

export type PromoCodeBlockProps = {
  input: string
  onChange: (v: string) => void
  state: 'idle' | 'checking' | 'valid' | 'invalid'
  error:
    | 'invalid_code'
    | 'expired'
    | 'min_not_met'
    | 'usage_limit'
    | 'product_not_eligible'
    | 'network'
    | null
  breakdown: {
    subtotal: number
    discount: number
    total: number
    currency: string
    code: string
  } | null
  t: T
}

export default function PromoCodeBlock({
  input,
  onChange,
  state,
  error,
  breakdown,
  t,
}: PromoCodeBlockProps) {
  const borderColor =
    state === 'valid'
      ? 'border-[#248D6C]'
      : state === 'invalid'
        ? 'border-red-300'
        : 'border-[#E5E5E5] focus-within:border-[#248D6C]'
  return (
    <Field id="cp-promo" label={t('promoLabel')}>
      <div className="relative">
        <input
          id="cp-promo"
          type="text"
          value={input}
          onChange={e => onChange(e.target.value)}
          placeholder={t('promoPlaceholder')}
          autoComplete="off"
          spellCheck={false}
          className={`w-full border ${borderColor} text-[#111] text-[13px] font-light px-3.5 py-2.5 pr-10 outline-none transition-colors placeholder:text-[#aaa] uppercase tracking-wide`}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {state === 'checking' && (
            <span
              aria-label={t('promoChecking')}
              className="inline-block w-3.5 h-3.5 border-2 border-[#E5E5E5] border-t-[#248D6C] rounded-full animate-spin"
            />
          )}
          {state === 'valid' && <CheckIcon />}
          {state === 'invalid' && (
            <span aria-hidden className="text-red-500 text-[14px]">
              ×
            </span>
          )}
        </span>
      </div>
      {state === 'valid' && breakdown && (
        <p className="text-[11px] font-light text-[#248D6C] mt-1.5">
          {t('promoApplied', {
            code: breakdown.code,
            amount: breakdown.discount,
          })}
        </p>
      )}
      {state === 'invalid' && error && (
        <p className="text-[11px] font-light text-red-600 mt-1.5">
          {t(`promoError.${error}`)}
        </p>
      )}
    </Field>
  )
}

// Local copy of the Field UI helper — kept private to this component so
// the file stays self-contained. The original Field still lives in
// CheckoutPanel.tsx for the rest of the form.
function Field({
  id,
  label,
  required,
  children,
}: {
  id: string
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[9px] font-normal tracking-[0.14em] uppercase text-[#888] mb-1.5"
      >
        {label}
        {required && <span className="text-[#248D6C] ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}
