// Shared SVG icons for the checkout sub-components. Extracted from
// components/CheckoutPanel.tsx (split phase 1, audit 2026-04-26)
// so PickupCombobox / WhatsIncludedPanel / PromoCodeBlock can each
// live in their own file without duplicating these <svg> blocks.

export function ChevronIcon() {
  return (
    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden>
      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.2" fill="none" />
    </svg>
  )
}

export function PinIcon() {
  return (
    <svg width="12" height="14" viewBox="0 0 12 14" fill="none" aria-hidden>
      <path
        d="M6 1C3.24 1 1 3.24 1 6c0 3.75 5 7 5 7s5-3.25 5-7c0-2.76-2.24-5-5-5z"
        stroke="#248D6C"
        strokeWidth="1.2"
        fill="none"
      />
      <circle cx="6" cy="6" r="1.5" fill="#248D6C" />
    </svg>
  )
}

export function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M2 7.5L5.5 11L12 3.5" stroke="#248D6C" strokeWidth="1.5" fill="none" />
    </svg>
  )
}
