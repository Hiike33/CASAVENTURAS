// Pickup section of the checkout form : combobox of listed places,
// optional room-number field, custom-pickup toggle, address
// autocomplete. The cascade reset on toggle ON/OFF is critical —
// see the customPickup branch in CustomPickupToggle's onToggle :
// every leftover pickup field must clear when toggling, and every
// leftover custom field must clear when toggling back. Drift here
// would silently send wrong pickup data to Bokun.
//
// The parent (CheckoutPanel) is still responsible for the outer
// `showPickup && ctx` guard — keeping it there means this component
// can assume ctx is non-null and pickup-relevant.
//
// Extracted from components/CheckoutPanel.tsx during Phase 3D-3.

import type { Dispatch, SetStateAction } from 'react'
import { useTranslations } from 'next-intl'
import type { CheckoutContext } from '@/app/api/bokun/checkout-context/route'
import type { CheckoutFormState } from '@/lib/checkout/submit-helpers'
import PickupCombobox from './PickupCombobox'
import Field from './Field'
import CustomPickupToggle from './CustomPickupToggle'
import AddressAutocomplete from '@/components/AddressAutocomplete'

type T = ReturnType<typeof useTranslations<'CheckoutPanel'>>

export default function CheckoutPickupBlock({
  ctx,
  form,
  setForm,
  needsRoomNumber,
  showCustomPickupToggle,
  t,
}: {
  ctx: CheckoutContext
  form: CheckoutFormState
  setForm: Dispatch<SetStateAction<CheckoutFormState>>
  needsRoomNumber: boolean
  showCustomPickupToggle: boolean
  t: T
}) {
  return (
    <>
      {!form.customPickup && (
        <PickupCombobox
          places={ctx.pickupPlaces}
          value={form.pickupTitle}
          onSelect={p =>
            setForm(f => ({
              ...f,
              pickupId: p.id,
              pickupTitle: p.title,
              roomNumber: p.askForRoomNumber ? f.roomNumber : '',
            }))
          }
          onChange={v =>
            setForm(f => ({ ...f, pickupTitle: v, pickupId: null }))
          }
          t={t}
        />
      )}

      {needsRoomNumber && !form.customPickup && (
        <Field id="cp-room" label={t('roomNumber')} required>
          <input
            id="cp-room"
            type="text"
            required
            value={form.roomNumber}
            onChange={e => setForm(f => ({ ...f, roomNumber: e.target.value }))}
            placeholder={t('roomNumberPh')}
            className="w-full border border-[#E5E5E5] text-[#111] text-[13px] font-light px-3.5 py-2.5 outline-none focus:border-[#248D6C] transition-colors placeholder:text-[#aaa]"
          />
        </Field>
      )}

      {showCustomPickupToggle && (
        <CustomPickupToggle
          on={form.customPickup}
          onToggle={v =>
            setForm(f => ({
              ...f,
              customPickup: v,
              pickupId: v ? null : f.pickupId,
              pickupTitle: v ? '' : f.pickupTitle,
              roomNumber: v ? '' : f.roomNumber,
              customPickupAddress: v ? f.customPickupAddress : '',
              customPickupLat: v ? f.customPickupLat : undefined,
              customPickupLon: v ? f.customPickupLon : undefined,
            }))
          }
          t={t}
        />
      )}

      {form.customPickup && showCustomPickupToggle && (
        <AddressAutocomplete
          id="cp-custom-addr"
          label={t('pickupAddress')}
          required
          value={{
            text: form.customPickupAddress,
            lat: form.customPickupLat,
            lon: form.customPickupLon,
          }}
          onChange={v =>
            setForm(f => ({
              ...f,
              customPickupAddress: v.text,
              customPickupLat: v.lat,
              customPickupLon: v.lon,
            }))
          }
          placeholder={t('pickupAddressPh')}
          hint={t('pickupAddressHint')}
        />
      )}
    </>
  )
}
