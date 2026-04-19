import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { generalFaqs, tourFaqs } from './faqs.ts'
import { tours } from './tours.ts'

const here = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(here, '../../..')

const priceOf = (slug: string): number => {
  const t = tours.find(x => x.slug === slug)
  if (!t) throw new Error(`tour not found: ${slug}`)
  return t.price
}

// ─── Functional (regression): rendered strings still contain current prices ───

test('generalFaqs pickup answer contains current el-yunque price from tours.ts', () => {
  const price = priceOf('el-yunque')
  const faq = generalFaqs.find(f => f.question === 'Do you include hotel pickup?')
  assert.ok(faq, 'pickup FAQ must exist')
  assert.match(faq.answer, new RegExp(`\\$${price}/person`))
})

test('tourFaqs.catamaran price question contains current catamaran price from tours.ts', () => {
  const price = priceOf('catamaran')
  const faq = tourFaqs['catamaran'].find(f => /per person price\?/.test(f.question))
  assert.ok(faq, 'catamaran price FAQ must exist')
  assert.match(faq.question, new RegExp(`\\$${price} per person`))
})

// ─── E2E (source-level regression): no hardcoded price literals ───
// These assert the refactor is in place. Fail before fix, pass after.

test('faqs.ts source has no hardcoded $89 or $249 string literal', () => {
  const src = readFileSync(resolve(here, 'faqs.ts'), 'utf-8')
  // Strip all comments to avoid false positives from doc comments
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
  assert.doesNotMatch(code, /["']\s*[^"']*\$89[^"']*\s*["']/,
    'faqs.ts must not contain a string literal with hardcoded $89 — use template literal with priceOf(el-yunque)')
  assert.doesNotMatch(code, /["']\s*[^"']*\$249[^"']*\s*["']/,
    'faqs.ts must not contain a string literal with hardcoded $249 — use template literal with priceOf(catamaran)')
})

test('catamaran/page.tsx metadata description has no hardcoded $249', () => {
  const src = readFileSync(resolve(projectRoot, 'app/tours/catamaran/page.tsx'), 'utf-8')
  const meta = src.match(/generateMetadata[\s\S]*?description:\s*([`'"])([\s\S]*?)\1/)
  assert.ok(meta, 'must find description in generateMetadata')
  const desc = meta[2]
  assert.doesNotMatch(desc, /\$249\b/,
    'description must use ${tour.price}, not hardcoded $249')
})

test('salsa/page.tsx metadata description has no hardcoded $65', () => {
  const src = readFileSync(resolve(projectRoot, 'app/tours/salsa/page.tsx'), 'utf-8')
  const meta = src.match(/generateMetadata[\s\S]*?description:\s*([`'"])([\s\S]*?)\1/)
  assert.ok(meta, 'must find description in generateMetadata')
  const desc = meta[2]
  assert.doesNotMatch(desc, /\$65\b/,
    'description must use ${tour.price}, not hardcoded $65')
})
