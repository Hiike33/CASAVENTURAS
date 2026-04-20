'use client'
import { useState } from 'react'
import AddressAutocomplete, {
  type AddressAutocompleteValue,
} from '@/components/AddressAutocomplete'

// Isolated preview for the AddressAutocomplete component — useful while
// Bokun's customPickupAllowed flag is still off on the El Yunque product.
// Delete along with the rest of the preview routes once the flag flips.

export default function AddressPreviewPage() {
  const [val, setVal] = useState<AddressAutocompleteValue>({ text: '' })
  return (
    <main className="min-h-screen bg-[#F5F5F5] py-16 px-6 md:px-12">
      <div className="max-w-[420px] mx-auto space-y-6">
        <p className="text-[10px] font-medium tracking-[0.22em] uppercase text-[#717170]">
          AddressAutocomplete preview
        </p>
        <div className="bg-white border border-[#E5E5E5] p-6">
          <AddressAutocomplete
            id="addr-preview"
            label="Pickup address"
            required
            value={val}
            onChange={setVal}
            placeholder="Start typing your Puerto Rico address…"
            hint="Our guide will contact you to confirm the exact pickup time."
          />
        </div>
        <div className="bg-white border border-[#E5E5E5] p-4 text-[11px] font-light text-[#4F4F4E] leading-[1.5]">
          <p className="font-medium text-[#111] mb-1">Selected value (dev only)</p>
          <pre className="text-[10px] text-[#4F4F4E] overflow-auto whitespace-pre-wrap">
            {JSON.stringify(val, null, 2)}
          </pre>
        </div>
      </div>
    </main>
  )
}
