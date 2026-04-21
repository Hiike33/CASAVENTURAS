import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseCspReports, MAX_STR_LEN, MAX_ENTRIES } from './csp-report.ts'

// ─── Happy paths ─────────────────────────────────────────────────────────

test('parseCspReports: legacy csp-report format → single entry', () => {
  const payload = {
    'csp-report': {
      'blocked-uri': 'https://evil.example/inject.js',
      'violated-directive': "script-src 'self'",
      'document-uri': 'https://casaventuras.com/',
      'source-file': 'https://casaventuras.com/',
      'line-number': 42,
    },
  }
  const out = parseCspReports(payload)
  assert.equal(out.length, 1)
  assert.equal(out[0].blockedUri, 'https://evil.example/inject.js')
  assert.equal(out[0].violatedDirective, "script-src 'self'")
  assert.equal(out[0].lineNumber, 42)
})

test('parseCspReports: Reporting API array format → entry per csp-violation', () => {
  const payload = [
    {
      type: 'csp-violation',
      body: {
        blockedURL: 'inline',
        effectiveDirective: 'style-src',
        documentURL: 'https://casaventuras.com/tours/el-yunque',
        disposition: 'enforce',
      },
    },
    { type: 'network-error', body: { phase: 'dns' } },
  ]
  const out = parseCspReports(payload)
  assert.equal(out.length, 1)
  assert.equal(out[0].blockedUri, 'inline')
  assert.equal(out[0].violatedDirective, 'style-src')
  assert.equal(out[0].disposition, 'enforce')
})

test('parseCspReports: CSP keyword values (eval, self, wasm-eval) accepted as blocked-uri', () => {
  for (const kw of ['eval', 'self', 'wasm-eval', 'trusted-types-sink']) {
    const out = parseCspReports({
      'csp-report': {
        'blocked-uri': kw,
        'violated-directive': 'script-src',
        'document-uri': 'https://casaventuras.com/',
      },
    })
    assert.equal(out.length, 1, `keyword ${kw} should be accepted`)
    assert.equal(out[0].blockedUri, kw)
  }
})

// ─── Malformed input ─────────────────────────────────────────────────────

test('parseCspReports: malformed / empty payloads return []', () => {
  assert.deepEqual(parseCspReports(null), [])
  assert.deepEqual(parseCspReports(undefined), [])
  assert.deepEqual(parseCspReports('not-an-object'), [])
  assert.deepEqual(parseCspReports(42), [])
  assert.deepEqual(parseCspReports({}), [])
  assert.deepEqual(parseCspReports({ 'csp-report': { 'blocked-uri': 'https://x/' } }), []) // missing directive + doc
  assert.deepEqual(parseCspReports([{ type: 'csp-violation' }]), []) // no body
})

test('parseCspReports: ignores non-csp-violation entries in array', () => {
  const payload = [
    { type: 'deprecation', body: { id: 'foo' } },
    { type: 'intervention', body: {} },
  ]
  assert.deepEqual(parseCspReports(payload), [])
})

test('parseCspReports: csp-report as array (not object) → rejected', () => {
  assert.deepEqual(parseCspReports({ 'csp-report': [] }), [])
})

test('parseCspReports: report body as array → rejected', () => {
  assert.deepEqual(
    parseCspReports([{ type: 'csp-violation', body: [] }]),
    [],
  )
})

// ─── Security hardening ──────────────────────────────────────────────────

test('hardening: log injection via newline/ctrl chars → stripped', () => {
  const payload = {
    'csp-report': {
      'blocked-uri': 'https://evil.example/x\n[csp-violation] FAKE',
      'violated-directive': 'script-src\r\nINJECTED: true',
      'document-uri': 'https://casaventuras.com/page\x00null',
    },
  }
  const [entry] = parseCspReports(payload)
  assert.ok(entry, 'should return an entry')
  assert.ok(!entry.blockedUri.includes('\n'), 'blockedUri must not contain newline')
  assert.ok(!entry.violatedDirective.includes('\r'), 'directive must not contain CR')
  assert.ok(!entry.documentUri.includes('\x00'), 'documentUri must not contain NUL')
})

test('hardening: javascript: scheme → rejected', () => {
  // An attacker forges a violation that looks real but uses javascript:
  // as blocked-uri. Without scheme allowlisting, logs would contain a
  // clickable javascript: link in log viewers.
  const payload = {
    'csp-report': {
      'blocked-uri': 'javascript:alert(1)',
      'violated-directive': 'script-src',
      'document-uri': 'https://casaventuras.com/',
    },
  }
  assert.deepEqual(parseCspReports(payload), [])
})

test('hardening: vbscript: / about: / data-exfil URLs → rejected in document-uri', () => {
  for (const uri of ['vbscript:msgbox', 'about:blank', 'chrome://settings']) {
    const payload = {
      'csp-report': {
        'blocked-uri': 'https://ok.example/',
        'violated-directive': 'script-src',
        'document-uri': uri,
      },
    }
    assert.deepEqual(parseCspReports(payload), [], `document-uri ${uri} must be rejected`)
  }
})

test('hardening: oversized string → truncated to MAX_STR_LEN', () => {
  const bomb = 'A'.repeat(MAX_STR_LEN + 5000)
  const payload = {
    'csp-report': {
      'blocked-uri': `https://x.example/${bomb}`,
      'violated-directive': 'script-src',
      'document-uri': 'https://casaventuras.com/',
    },
  }
  const [entry] = parseCspReports(payload)
  assert.ok(entry, 'entry should be returned')
  assert.ok(entry.blockedUri.length <= MAX_STR_LEN, 'truncated at MAX_STR_LEN')
})

test('hardening: payload bomb (array with 10k entries) → capped at MAX_ENTRIES', () => {
  const body = {
    blockedURL: 'inline',
    effectiveDirective: 'script-src',
    documentURL: 'https://casaventuras.com/',
  }
  const huge = Array.from({ length: 10_000 }, () => ({ type: 'csp-violation', body }))
  const out = parseCspReports(huge)
  assert.ok(out.length <= MAX_ENTRIES, `got ${out.length}, expected <= ${MAX_ENTRIES}`)
})

test('hardening: lineNumber bounds — negative, NaN, float, Infinity → dropped', () => {
  const base = {
    'blocked-uri': 'https://x/',
    'violated-directive': 'script-src',
    'document-uri': 'https://casaventuras.com/',
  }
  for (const bad of [-1, NaN, Infinity, -Infinity, 3.14, 10_000_001]) {
    const [entry] = parseCspReports({ 'csp-report': { ...base, 'line-number': bad } })
    assert.equal(entry.lineNumber, undefined, `bad lineNumber ${bad} should be dropped`)
  }
  // Valid int passes.
  const [ok] = parseCspReports({ 'csp-report': { ...base, 'line-number': 123 } })
  assert.equal(ok.lineNumber, 123)
})

test('hardening: disposition must be enforce|report → other values dropped', () => {
  const base = {
    blockedURL: 'inline',
    effectiveDirective: 'script-src',
    documentURL: 'https://casaventuras.com/',
  }
  for (const bad of ['allow', 'block', 'enforce-on-steroids', 42, null, {}, []]) {
    const [entry] = parseCspReports([{ type: 'csp-violation', body: { ...base, disposition: bad } }])
    assert.equal(entry.disposition, undefined, `disposition ${JSON.stringify(bad)} should be dropped`)
  }
})

test('hardening: non-printable ASCII in violated-directive → rejected', () => {
  // RTL override, zero-width space, emojis — legit CSP will never send these.
  for (const weird of ['script-src \u202Eevil', 'script-src\u200B', 'script-src 🔥']) {
    const payload = {
      'csp-report': {
        'blocked-uri': 'https://x/',
        'violated-directive': weird,
        'document-uri': 'https://casaventuras.com/',
      },
    }
    assert.deepEqual(parseCspReports(payload), [], `weird directive ${JSON.stringify(weird)} must be rejected`)
  }
})

test('hardening: non-string fields coerced to undefined (anti type-confusion)', () => {
  const payload = {
    'csp-report': {
      'blocked-uri': { $ne: null },          // NoSQL-style probe
      'violated-directive': ['script-src'],   // array instead of string
      'document-uri': 42,
    },
  }
  assert.deepEqual(parseCspReports(payload), [])
})

test('hardening: prototype pollution attempt in body → ignored safely', () => {
  // JSON.parse in modern Node is prototype-safe, but we still verify the
  // parser neither reads nor propagates __proto__ / constructor keys.
  const payload = JSON.parse(
    '{"csp-report":{"__proto__":{"polluted":true},"blocked-uri":"https://x/","violated-directive":"script-src","document-uri":"https://casaventuras.com/"}}',
  )
  const [entry] = parseCspReports(payload)
  assert.ok(entry, 'valid fields still produce an entry')
  // @ts-expect-error — polluted should never leak onto Object.prototype
  assert.equal(({}).polluted, undefined, 'Object.prototype must not be polluted')
})
