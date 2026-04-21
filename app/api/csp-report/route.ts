import { NextRequest, NextResponse } from 'next/server'
import { parseCspReports } from '@/lib/csp-report'

// Receives CSP violation reports from browsers.
//
// Hardening applied (defense in depth):
//   - Content-Type allowlist: only the three types browsers use for CSP.
//   - Content-Length preflight: drops payloads > 64 KB before reading body.
//   - Post-read recheck: some edge runtimes lie about Content-Length when
//     Transfer-Encoding is chunked, so we re-measure after `req.text()`.
//   - Always replies 204: an attacker probing the endpoint gets zero
//     signal about which inputs pass or fail (anti-oracle / anti-fingerprint).
//   - Parser-side validation (see lib/csp-report.ts): URL scheme allowlist,
//     string sanitization, enum checks, caps.
//
// Design choice: never `throw`. A reporting endpoint that crashes on bad
// input turns into a DoS amplifier — the browser auto-retries and we burn
// CPU failing. Absorb everything, log what's valid, return 204.

const MAX_BODY_BYTES = 65_536 // 64 KB — real CSP reports weigh ~1 KB

const ACCEPTED_TYPES = [
  'application/csp-report',
  'application/reports+json',
  'application/json',
] as const

const noContent = () => new NextResponse(null, { status: 204 })

export async function POST(req: NextRequest) {
  const ct = (req.headers.get('content-type') ?? '').toLowerCase()
  if (!ACCEPTED_TYPES.some(t => ct.startsWith(t))) return noContent()

  const cl = Number.parseInt(req.headers.get('content-length') ?? '0', 10)
  if (Number.isFinite(cl) && cl > MAX_BODY_BYTES) return noContent()

  let payload: unknown = null
  try {
    const text = await req.text()
    if (text.length > MAX_BODY_BYTES) return noContent()
    payload = JSON.parse(text)
  } catch {
    return noContent()
  }

  for (const e of parseCspReports(payload)) {
    console.warn(
      '[csp-violation]',
      JSON.stringify({
        directive: e.violatedDirective,
        blocked: e.blockedUri,
        document: e.documentUri,
        source: e.sourceFile,
        line: e.lineNumber,
        disposition: e.disposition,
      }),
    )
  }

  return noContent()
}
