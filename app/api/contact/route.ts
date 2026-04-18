import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()

    if (process.env.RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
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
