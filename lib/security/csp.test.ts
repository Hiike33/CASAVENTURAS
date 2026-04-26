import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { CSP_DIRECTIVES, CSP_VALUE } from './csp.ts'

describe('CSP_DIRECTIVES — script-src', () => {
  it("authorizes 'self' + 'unsafe-inline' (required by Next.js runtime scripts)", () => {
    assert.ok(CSP_DIRECTIVES['script-src']?.includes("'self'"))
    assert.ok(CSP_DIRECTIVES['script-src']?.includes("'unsafe-inline'"))
  })

  it('authorizes Stripe.js + Bokun widget (payment + booking dependencies)', () => {
    assert.ok(CSP_DIRECTIVES['script-src']?.includes('https://js.stripe.com'))
    assert.ok(CSP_DIRECTIVES['script-src']?.includes('https://widgets.bokun.io'))
    assert.ok(CSP_DIRECTIVES['script-src']?.includes('https://static.bokun.io'))
  })

  it('authorizes Cloudflare Web Analytics beacon (static.cloudflareinsights.com)', () => {
    // Regression test for W1: without this, beacon.min.js is blocked and
    // zero analytics reaches the Cloudflare dashboard. Evidence:
    // Playwright console 2026-04-24 captured the violation.
    assert.ok(
      CSP_DIRECTIVES['script-src']?.includes('https://static.cloudflareinsights.com'),
      'script-src must allow https://static.cloudflareinsights.com for CF Web Analytics beacon',
    )
  })

  it('authorizes Google Analytics 4 (gtag.js loader + analytics.js)', () => {
    // Without these, gtag.js fails to load → 0 GA hits and a console
    // error per page. Consent Mode v2 (default analytics_storage=denied)
    // still requires the script to load to send cookieless pings.
    assert.ok(
      CSP_DIRECTIVES['script-src']?.includes('https://www.googletagmanager.com'),
      'script-src must allow https://www.googletagmanager.com for gtag.js',
    )
    assert.ok(
      CSP_DIRECTIVES['script-src']?.includes('https://www.google-analytics.com'),
      'script-src must allow https://www.google-analytics.com for analytics.js',
    )
  })
})

describe('CSP_DIRECTIVES — connect-src', () => {
  it('authorizes Google Analytics event hits', () => {
    // gtag sends measurement hits to www.google-analytics.com (legacy
    // /collect) and analytics.google.com (GA4 measurement). Without
    // them, hits are blocked → empty reports despite the script loading.
    assert.ok(
      CSP_DIRECTIVES['connect-src']?.includes('https://www.google-analytics.com'),
      'connect-src must allow https://www.google-analytics.com for hit collection',
    )
    assert.ok(
      CSP_DIRECTIVES['connect-src']?.includes('https://analytics.google.com'),
      'connect-src must allow https://analytics.google.com for GA4 measurement endpoint',
    )
  })
})

describe('CSP_DIRECTIVES — locked-down directives (security invariants)', () => {
  it("object-src 'none' (blocks Flash/plugins/PDFs)", () => {
    assert.deepEqual(CSP_DIRECTIVES['object-src'], ["'none'"])
  })

  it("frame-ancestors 'none' (blocks all click-jacking)", () => {
    assert.deepEqual(CSP_DIRECTIVES['frame-ancestors'], ["'none'"])
  })

  it("base-uri 'self' (blocks <base> injection)", () => {
    assert.deepEqual(CSP_DIRECTIVES['base-uri'], ["'self'"])
  })

  it("form-action 'self' (blocks form hijacking)", () => {
    assert.deepEqual(CSP_DIRECTIVES['form-action'], ["'self'"])
  })
})

describe('CSP_DIRECTIVES — reporting pipeline (D-020bis)', () => {
  it('declares report-uri pointing to /api/csp-report', () => {
    assert.deepEqual(CSP_DIRECTIVES['report-uri'], ['/api/csp-report'])
  })

  it('declares report-to group csp-endpoint (Reporting API)', () => {
    assert.deepEqual(CSP_DIRECTIVES['report-to'], ['csp-endpoint'])
  })
})

describe('CSP_VALUE — serialized header', () => {
  it('is a single string with directives joined by "; "', () => {
    assert.equal(typeof CSP_VALUE, 'string')
    assert.ok(CSP_VALUE.includes('; '))
  })

  it('starts with default-src (conventional ordering)', () => {
    assert.ok(CSP_VALUE.startsWith("default-src 'self'"))
  })

  it('contains the script-src directive with all authorized origins', () => {
    assert.match(CSP_VALUE, /script-src [^;]*'self'/)
    assert.match(CSP_VALUE, /script-src [^;]*https:\/\/static\.cloudflareinsights\.com/)
  })

  it('renders value-less directives (upgrade-insecure-requests) as bare tokens', () => {
    assert.match(CSP_VALUE, /(^|; )upgrade-insecure-requests(;|$)/)
  })

  it('does not accidentally trail a lonely "; "', () => {
    assert.ok(!CSP_VALUE.endsWith('; '))
  })
})
