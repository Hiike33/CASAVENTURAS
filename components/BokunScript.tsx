import Script from 'next/script'

// Loads the Bókun widget loader once per page. The loader scans the DOM for
// `.bokunWidget` and `.bokunButton` elements, transforming them into
// interactive booking widgets and modal checkout triggers.
//
// Docs: https://docs.bokun.io/docs/widgets-and-online-sales
//
// Notes:
// - The loader refuses more than one `bookingChannelUUID` per page (it alerts
//   the user). We mount this component once from the root layout.
// - `afterInteractive` is the safe default: the script runs after the page is
//   interactive so it never blocks rendering.
// - If NEXT_PUBLIC_BOKUN_CHANNEL_UUID is not set at build time, we render
//   nothing so the site still works (booking CTAs will just not open a modal).
export default function BokunScript() {
  const channelUuid = process.env.NEXT_PUBLIC_BOKUN_CHANNEL_UUID
  if (!channelUuid) return null

  const src = `https://widgets.bokun.io/assets/javascripts/apps/build/BokunWidgetsLoader.js?bookingChannelUUID=${channelUuid}`
  return <Script src={src} strategy="afterInteractive" async />
}
