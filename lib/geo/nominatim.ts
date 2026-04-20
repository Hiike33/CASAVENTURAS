// Minimal adapter for the OpenStreetMap Nominatim search API. We keep the
// surface small: one input type (raw Nominatim response) and one output
// type (DisplayPlace) the UI can render directly. All parsing is total —
// missing fields collapse into a reasonable string rather than throwing.

export type NominatimAddress = {
  name?: string
  road?: string
  house_number?: string
  neighbourhood?: string
  suburb?: string
  city?: string
  town?: string
  village?: string
  state?: string
  postcode?: string
  country_code?: string
  [k: string]: string | undefined
}

export type NominatimResult = {
  place_id: number
  lat: string | number
  lon: string | number
  display_name: string
  address?: NominatimAddress
  type?: string
  class?: string
}

export type DisplayPlace = {
  placeId: number
  lat: number
  lon: number
  displayName: string
  primary: string
  secondary: string
}

export function pickPrimaryLine(a: NominatimAddress): string {
  if (a.name) return a.name
  if (a.road) {
    return a.house_number ? `${a.house_number} ${a.road}` : a.road
  }
  return a.neighbourhood ?? a.suburb ?? a.city ?? a.town ?? a.village ?? ''
}

export function pickSecondaryLine(a: NominatimAddress): string {
  const parts: string[] = []
  const city = a.city ?? a.town ?? a.village ?? a.suburb
  if (city) parts.push(a.postcode ? `${city} ${a.postcode}` : city)
  if (a.country_code) parts.push(a.country_code.toUpperCase())
  return parts.join(' · ')
}

export function formatNominatimResult(raw: NominatimResult): DisplayPlace | null {
  const lat = typeof raw.lat === 'number' ? raw.lat : Number.parseFloat(String(raw.lat))
  const lon = typeof raw.lon === 'number' ? raw.lon : Number.parseFloat(String(raw.lon))
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null
  const address = raw.address ?? {}
  const primary = pickPrimaryLine(address) || raw.display_name.split(',')[0].trim()
  const secondary = pickSecondaryLine(address)
  return {
    placeId: raw.place_id,
    lat,
    lon,
    displayName: raw.display_name,
    primary,
    secondary,
  }
}
