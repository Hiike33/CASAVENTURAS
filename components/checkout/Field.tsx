// Generic labeled-field wrapper. Used across the checkout form to put a
// small uppercase label above each input + show a `*` for required fields.
//
// Extracted from components/CheckoutPanel.tsx during Phase 2A
// (audit 2026-04-26). PromoCodeBlock.tsx had a local copy that this file
// now replaces (deduplication).

export default function Field({
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
