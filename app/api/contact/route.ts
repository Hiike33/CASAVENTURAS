import { NextRequest, NextResponse } from 'next/server'
import { isHoneypotTriggered } from '@/lib/security/honeypot'

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()

    // Silent success when the honeypot field is filled — denies bots the
    // 4xx/5xx signal they would use to retry or learn. Logged so we can
    // size the spam volume from CF Worker observability.
    if (isHoneypotTriggered(payload)) {
      console.warn('[contact] honeypot triggered — silent drop')
      return NextResponse.json({ ok: true }, { status: 202 })
    }

    if (process.env.RESEND_API_KEY) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM ?? 'hello@casaventuras.com',
          to: 'micasaventuras@gmail.com',
          reply_to: payload.email,
          subject: `Contact form — ${payload.firstName ?? 'visitor'} ${payload.lastName ?? ''}`.trim(),
          text: JSON.stringify(payload, null, 2),
        }),
      })
      if (!res.ok) {
        const detail = await res.text().catch(() => '')
        console.error('[contact] Resend rejected:', res.status, detail)
        return NextResponse.json(
          { ok: false, error: 'Contact email could not be delivered. Please email micasaventuras@gmail.com.' },
          { status: 502 },
        )
      }
    } else {
      console.warn('[contact] RESEND_API_KEY not set — request accepted but not emailed')
    }

    return NextResponse.json({ ok: true }, { status: 202 })
  } catch (err) {
    console.error('[contact] error:', err)
    return NextResponse.json(
      { ok: false, error: 'Contact submission failed. Please email micasaventuras@gmail.com.' },
      { status: 500 },
    )
  }
}
