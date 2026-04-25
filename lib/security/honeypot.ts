// Honeypot anti-abuse for public form endpoints (/api/contact, /api/booking).
//
// Strategy : add an invisible <input name="website"> to the rendered form.
// Real users never see it (hidden via off-screen positioning + tabindex=-1
// + aria-hidden), so they never fill it. Naive bots that scrape DOM and
// fill every field will populate it, marking themselves as bots.
//
// Server-side, when this function returns true, the route should respond
// with the same `2xx ok` envelope it would emit for a real human — but
// without calling the upstream (Resend / N8N). This "silent success"
// pattern denies bots the signal they need to retry, so they treat the
// request as a successful spam delivery and move on.
//
// Lenient by design : an empty / whitespace-only / missing field returns
// false. That keeps backward compatibility with any form rendered before
// this protection was wired (e.g. cached HTML, third-party embeds).
//
// References :
//   https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/hidden
//   https://stackoverflow.com/q/12873625 (honeypot vs CAPTCHA tradeoffs)

export const HONEYPOT_FIELD = 'website' as const

export function isHoneypotTriggered(body: unknown): boolean {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return false
  const value = (body as Record<string, unknown>)[HONEYPOT_FIELD]
  if (typeof value !== 'string') return false
  return value.trim().length > 0
}
