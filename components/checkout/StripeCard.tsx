// Stripe Elements card iframe wrapper for the checkout payment block.
// Falls back to a "Stripe key missing" notice when
// NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is unset (dev/local without
// Stripe creds). Pure presentational — Stripe context comes from the
// <Elements> provider in the parent.
//
// Extracted from components/CheckoutPanel.tsx during Phase 2A.

import { useTranslations } from 'next-intl'
import { CardElement } from '@stripe/react-stripe-js'

type T = ReturnType<typeof useTranslations<'CheckoutPanel'>>

export default function StripeCard({ fallback, t }: { fallback: boolean; t: T }) {
  if (fallback) {
    return (
      <div className="border border-[#E5E5E5] bg-white px-3.5 py-3 flex items-center gap-3">
        <span className="text-[11px] font-light text-[#717170]">
          {t('stripeMissing')}
        </span>
      </div>
    )
  }
  return (
    <div className="border border-[#E5E5E5] bg-white px-3.5 py-[11px] focus-within:border-[#248D6C] transition-colors">
      <CardElement
        options={{
          style: {
            base: {
              fontSize: '13px',
              fontWeight: '300',
              fontFamily:
                'Figtree, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
              color: '#111111',
              '::placeholder': { color: '#aaaaaa' },
              iconColor: '#717170',
            },
            invalid: { color: '#b91c1c', iconColor: '#b91c1c' },
          },
          hidePostalCode: false,
        }}
      />
    </div>
  )
}
