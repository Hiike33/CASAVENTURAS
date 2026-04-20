import { test } from 'node:test'
import assert from 'node:assert/strict'
import { formatNominatimResult, pickPrimaryLine, pickSecondaryLine } from './nominatim.ts'

test('formatNominatimResult returns null if lat or lon missing', () => {
  assert.equal(formatNominatimResult({ place_id: 1, display_name: 'x' } as never), null)
})

test('formatNominatimResult maps a full Nominatim hit to DisplayPlace', () => {
  const out = formatNominatimResult({
    place_id: 123456,
    lat: '18.4519',
    lon: '-66.0598',
    display_name: 'Calle Loíza, Santurce, San Juan, Puerto Rico',
    address: {
      road: 'Calle Loíza',
      neighbourhood: 'Santurce',
      city: 'San Juan',
      state: 'Puerto Rico',
      postcode: '00911',
      country_code: 'pr',
    },
  })
  assert.ok(out)
  assert.equal(out.placeId, 123456)
  assert.equal(out.lat, 18.4519)
  assert.equal(out.lon, -66.0598)
  assert.equal(out.displayName, 'Calle Loíza, Santurce, San Juan, Puerto Rico')
})

test('formatNominatimResult coerces lat/lon to numbers, rejects NaN', () => {
  const bad = formatNominatimResult({
    place_id: 1,
    lat: 'abc',
    lon: '-66.0598',
    display_name: 'x',
    address: {},
  })
  assert.equal(bad, null)
})

test('pickPrimaryLine prefers venue name, falls back to road', () => {
  assert.equal(
    pickPrimaryLine({ name: 'Condado Vanderbilt Hotel', road: 'Av Ashford' }),
    'Condado Vanderbilt Hotel',
  )
  assert.equal(
    pickPrimaryLine({ road: 'Calle Loíza', house_number: '1510' }),
    '1510 Calle Loíza',
  )
  assert.equal(pickPrimaryLine({ road: 'Calle Loíza' }), 'Calle Loíza')
})

test('pickPrimaryLine falls back to neighbourhood if road missing', () => {
  assert.equal(pickPrimaryLine({ neighbourhood: 'Ocean Park' }), 'Ocean Park')
})

test('pickSecondaryLine formats city + postcode + country', () => {
  assert.equal(
    pickSecondaryLine({ city: 'San Juan', postcode: '00911', country_code: 'pr' }),
    'San Juan 00911 · PR',
  )
  assert.equal(
    pickSecondaryLine({ city: 'San Juan', country_code: 'pr' }),
    'San Juan · PR',
  )
  assert.equal(pickSecondaryLine({}), '')
})
