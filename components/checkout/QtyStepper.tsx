// Numeric stepper (- N +) for guest count selection. Pure
// presentational component: state is owned by the parent.
//
// Extracted from components/CheckoutPanel.tsx during Phase 2A.

export default function QtyStepper({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  const btnClass =
    'w-7 h-7 flex items-center justify-center border border-[#E5E5E5] text-[#4F4F4E] hover:border-[#248D6C] hover:text-[#248D6C] transition-colors disabled:opacity-40 disabled:hover:border-[#E5E5E5] disabled:hover:text-[#4F4F4E]'
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= 0}
        className={btnClass}
        aria-label="Decrease"
      >
        −
      </button>
      <span className="text-[13px] font-medium text-[#111] w-5 text-center tabular-nums">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className={btnClass}
        aria-label="Increase"
      >
        +
      </button>
    </div>
  )
}
