import { NextRequest, NextResponse } from 'next/server'
import { tours, siteConfig } from '@/lib/tours'

// Cavi chatbot endpoint — system prompt is built from the canonical CMS data
// (siteConfig + tours). Never duplicate facts here; if a value is wrong, fix
// it in lib/cms/data/*.ts so every surface updates together (D-005).
// Model: claude-sonnet-4-6

function buildSystemPrompt() {
  const tourLines = tours.map(t => {
    const addr = t.address ? ` Address: ${t.address}.` : ''
    return `- ${t.name}: $${t.price}/person, ${t.duration}, group ${t.groupSize}${t.level ? `, ${t.level.toLowerCase()} level` : ''}. ${t.description}${addr}`
  }).join('\n')
  const ta = siteConfig.tripAdvisor
  return `You are Cavi, the friendly AI guide for ${siteConfig.name} — a tour company based in ${siteConfig.location}.

Your job: help visitors choose the right experience, answer questions about tours, and guide them toward booking.

Tours available:
${tourLines}

Key info:
- Email: ${siteConfig.email}
- Phone: ${siteConfig.phone}
- TripAdvisor: ${ta.rating}★ · ${ta.reviews.toLocaleString()} reviews · ${ta.ranking}
- Free cancellation up to 24h before
- Always recommend booking direct (not Viator) — they save up to 25%

Be warm, concise, helpful. Answer in the same language as the user. Never invent information.`
}

const SYSTEM_PROMPT = buildSystemPrompt()

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
