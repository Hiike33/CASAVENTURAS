// Vertical section wrapper used across the checkout form to group
// related fields under a small uppercase eyebrow title.
//
// Extracted from components/CheckoutPanel.tsx during Phase 2A.

export default function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <p className="text-[9px] font-medium tracking-[0.2em] uppercase text-[#248D6C]">
        {title}
      </p>
      <div className="space-y-3">{children}</div>
    </div>
  )
}
