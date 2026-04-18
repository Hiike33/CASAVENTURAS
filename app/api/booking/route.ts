import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()

    const webhookUrl = process.env.N8N_BOOKING_WEBHOOK
    if (webhookUrl) {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, receivedAt: new Date().toISOString() }),
      })
      if (!res.ok) {
        const detail = await res.text().catch(() => '')
        console.error('[booking] webhook rejected:', res.status, detail)
        return NextResponse.json(
          { ok: false, error: 'Booking could not be forwarded. Please email micasaventuras@gmail.com.' },
          { status: 502 },
        )
      }
    } else {
      console.warn('[booking] N8N_BOOKING_WEBHOOK not set — request accepted but not forwarded')
    }

    return NextResponse.json({ ok: true }, { status: 202 })
  } catch (err) {
    console.error('[booking] error:', err)
    return NextResponse.json(
      { ok: false, error: 'Booking submission failed. Please email micasaventuras@gmail.com.' },
      { status: 500 },
    )
  }
}
