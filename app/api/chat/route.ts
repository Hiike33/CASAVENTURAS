import { NextRequest, NextResponse } from 'next/server'

// TODO: wire Claude API
// This endpoint powers the Cavi chatbot on the booking section
// Model: claude-sonnet-4-6

const SYSTEM_PROMPT = `You are Cavi, the friendly AI guide for Casa Venturas — a tour company based in San Juan, Puerto Rico.

Your job: help visitors choose the right experience, answer questions about tours, and guide them toward booking.

Tours available:
- El Yunque Vivid Day Tour: $89/person, 6–7h, small groups ≤13, moderate fitness level. Natural waterslide, cliff jumps 5–20ft, rope swing, guided jungle hike. Transport from San Juan hotel included.
- Private Catamaran to Vieques: $249/person, full day, private charter (≤12 guests). 40-ft Bali catamaran, Punta Arena beach, open bar, lunch, sunset return. Marina: Plaza Mayor, Palmas del Mar, Humacao.
- Sunset Salsa Rooftop: $65/person, 2–3h, instructor Zoe. Casa Santurce rooftop, 6PM daily. Free Piña Colada. No experience needed. Address: 1050 Calle Marianna, San Juan.

Key info:
- Email: micasaventuras@gmail.com
- Phone: +1 929 372 4529
- TripAdvisor: 4.9★ · 1,433 reviews · #10 of 152 in San Juan
- Free cancellation up to 24h before
- Always recommend booking direct (not Viator) — they save up to 25%

Be warm, concise, helpful. Answer in the same language as the user. Never invent information.`

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json()

    // Build messages for Claude
    const messages = [
      ...(history || []).slice(-8).map((m: { role: string; text: string }) => ({
        role: m.role === 'bot' ? 'assistant' : 'user',
        content: m.text,
      })),
      { role: 'user', content: message },
    ]

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages,
      }),
    })

    const data = await response.json()
    const reply = data.content?.[0]?.text ?? 'Something went wrong. Please email us at micasaventuras@gmail.com.'

    return NextResponse.json({ reply })
  } catch (error) {
    return NextResponse.json(
      { reply: 'Something went wrong. Please email us at micasaventuras@gmail.com.' },
      { status: 500 }
    )
  }
}
