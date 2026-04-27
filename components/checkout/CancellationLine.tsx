// Discrete fine-print line at the bottom of the checkout form stating
// the cancellation policy (e.g. "Free cancellation up to 24h before").
//
// Extracted from components/CheckoutPanel.tsx during Phase 2A.

import { useTranslations } from 'next-intl'

type T = ReturnType<typeof useTranslations<'CheckoutPanel'>>

export default function CancellationLine({
  policy,
  t,
}: {
  policy?: { title: string; fullRefundBeforeHours?: number }
  t: T
}) {
  const hours = policy?.fullRefundBeforeHours
  const text =
    hours === undefined
      ? t('cancellationDefault')
      : t('cancellationWithHours', { hours })
  return <p className="text-[9.5px] text-center text-[#aaa] font-light">{text}</p>
}
