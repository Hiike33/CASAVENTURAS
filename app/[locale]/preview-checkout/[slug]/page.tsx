import { notFound } from 'next/navigation'
import CheckoutPanel from '@/components/CheckoutPanel'
import { tours } from '@/lib/tours'

// Ephemeral preview route — iterates the checkout UI in isolation without
// touching the production BookingSidebar. Delete once the real checkout is
// wired into the tour pages.

export const dynamic = 'force-static'

export default async function PreviewCheckoutPage({
  params,
}: {
  // Next 15: dynamic route params are a Promise
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const tour = tours.find(t => t.slug === slug)
  if (!tour) notFound()

  return (
    <main className="min-h-screen bg-[#F5F5F5] py-16 px-6 md:px-12">
      <div className="max-w-[420px] mx-auto">
        <p className="text-[10px] font-medium tracking-[0.22em] uppercase text-[#717170] mb-4">
          Checkout preview — {tour.slug}
        </p>
        <CheckoutPanel tour={tour} />
      </div>
    </main>
  )
}
