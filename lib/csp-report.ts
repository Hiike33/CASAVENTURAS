// Parses a CSP violation report and returns normalized entries safe to log.
// Accepts both the legacy `application/csp-report` format and the modern
// Reporting API array-of-reports format.
//
// Security posture — defense in depth:
//   1. Type guards (every field starts as `unknown`).
//   2. String sanitization (strip control chars → anti log-injection).
//   3. Hard caps on string length and array count (anti payload-bomb).
//   4. URL scheme allowlist on blockedUri / documentUri / sourceFile
//      (refuses `javascript:`, `vbscript:`, etc.).
//   5. Enum allowlist on `disposition`.
//   6. Bounded integer on `lineNumber`.
//   7. Malformed or partial records → dropped silently (empty array).

export type CspViolationEntry = {
  blockedUri: string
  violatedDirective: string
  documentUri: string
  sourceFile?: string
  lineNumber?: number
  disposition?: 'enforce' | 'report'
}

// Caps — chosen so real reports (~1 KB, < 10 entries) pass untouched
// while attacker payloads hit the ceiling fast.
export const MAX_STR_LEN = 2048
export const MAX_ENTRIES = 50

// CSP keywords that can legitimately replace a URL in `blocked-uri`.
// Source: https://www.w3.org/TR/CSP3/#violation-events
const CSP_BLOCKED_KEYWORDS = new Set([
  'inline',
  'eval',
  'self',
  'wasm-eval',
  'trusted-types-sink',
  'trusted-types-policy',
])

// Allowed URL schemes when the blocked resource is an actual URL.
// `javascript:` / `vbscript:` / `about:` deliberately excluded — if we log
// them as-is, log readers might mis-render them as clickable links.
const BLOCKED_URI_SCHEMES = /^(https?|data|blob|ws|wss|file):$/
// document-uri and source-file are always top-level page contexts → http(s) only.
const PAGE_URL_SCHEMES = /^https?:$/

// Strip C0 + DEL control chars and truncate. JSON.stringify in the caller
// also escapes these, but sanitizing here keeps the parser's output safe
// for any sink (future structured log exports, stdout, etc.).
function sanitize(s: string): string {
  return s.replace(/[\x00-\x1F\x7F]/g, ' ').slice(0, MAX_STR_LEN)
}

function asString(v: unknown): string | undefined {
  return typeof v === 'string' && v.length > 0 ? sanitize(v) : undefined
}

function asSafeInt(v: unknown): number | undefined {
  // Reject NaN, Infinity, negatives, and absurd line numbers that would
  // only come from a malformed or crafted payload.
  return typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 1_000_000 ? v : undefined
}

function asDisposition(v: unknown): 'enforce' | 'report' | undefined {
  return v === 'enforce' || v === 'report' ? v : undefined
}

function asDirective(v: unknown): string | undefined {
  const s = asString(v)
  if (!s) return undefined
  // CSP directives are printable ASCII (tokens + quotes + hashes + URLs).
  // Reject exotic codepoints (RTL overrides, homoglyphs) that could
  // deceive log readers.
  if (!/^[\x20-\x7E]+$/.test(s)) return undefined
  // Directives are short by spec; a 512-char ceiling catches nonsense.
  if (s.length > 512) return undefined
  return s
}

function asBlockedUri(v: unknown): string | undefined {
  if (typeof v !== 'string') return undefined
  const s = sanitize(v)
  if (CSP_BLOCKED_KEYWORDS.has(s)) return s
  if (s.length === 0) return undefined
  try {
    const u = new URL(s)
    if (!BLOCKED_URI_SCHEMES.test(u.protocol)) return undefined
    return s
  } catch {
    return undefined
  }
}

function asPageUrl(v: unknown): string | undefined {
  // `document-uri` / `source-file` can also be the literal "inline" when
  // the violation came from an inline script; everything else must be a
  // real http(s) URL (our origin, in practice).
  if (typeof v !== 'string') return undefined
  const s = sanitize(v)
  if (s === 'inline') return s
  if (s.length === 0) return undefined
  try {
    const u = new URL(s)
    if (!PAGE_URL_SCHEMES.test(u.protocol)) return undefined
    return s
  } catch {
    return undefined
  }
}

type Raw = Record<string, unknown>

function normalizeOne(raw: Raw): CspViolationEntry | null {
  const blockedUri =
    asBlockedUri(raw['blocked-uri']) ?? asBlockedUri(raw.blockedURL) ?? asBlockedUri(raw.blockedUri)
  const violatedDirective =
    asDirective(raw['violated-directive']) ??
    asDirective(raw.effectiveDirective) ??
    asDirective(raw.violatedDirective)
  const documentUri =
    asPageUrl(raw['document-uri']) ?? asPageUrl(raw.documentURL) ?? asPageUrl(raw.documentUri)
  if (!blockedUri || !violatedDirective || !documentUri) return null
  return {
    blockedUri,
    violatedDirective,
    documentUri,
    sourceFile: asPageUrl(raw['source-file']) ?? asPageUrl(raw.sourceFile),
    lineNumber: asSafeInt(raw['line-number']) ?? asSafeInt(raw.lineNumber),
    disposition: asDisposition(raw.disposition),
  }
}

type LegacyPayload = { 'csp-report'?: unknown }
type ModernReport = { type?: unknown; body?: unknown }

export function parseCspReports(payload: unknown): CspViolationEntry[] {
  if (!payload || typeof payload !== 'object') return []
  // Legacy: single object under "csp-report".
  const legacy = (payload as LegacyPayload)['csp-report']
  if (legacy && typeof legacy === 'object' && !Array.isArray(legacy)) {
    const one = normalizeOne(legacy as Raw)
    return one ? [one] : []
  }
  // Reporting API: an array of heterogeneous reports — cap count first so
  // a 10k-entry payload can't make us burn CPU before we bail.
  if (Array.isArray(payload)) {
    const out: CspViolationEntry[] = []
    for (const r of (payload as ModernReport[]).slice(0, MAX_ENTRIES)) {
      if (!r || r.type !== 'csp-violation') continue
      if (!r.body || typeof r.body !== 'object' || Array.isArray(r.body)) continue
      const one = normalizeOne(r.body as Raw)
      if (one) out.push(one)
    }
    return out
  }
  return []
}
