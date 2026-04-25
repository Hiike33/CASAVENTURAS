import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isHoneypotTriggered } from './honeypot.ts'

test('returns false when body has no honeypot field (lenient legacy form)', () => {
  assert.equal(isHoneypotTriggered({ firstName: 'Jane' }), false)
})

test('returns false when honeypot field is empty string', () => {
  assert.equal(isHoneypotTriggered({ website: '', firstName: 'Jane' }), false)
})

test('returns false when honeypot is whitespace-only', () => {
  assert.equal(isHoneypotTriggered({ website: '   ', firstName: 'Jane' }), false)
})

test('returns true when honeypot is filled with any non-whitespace value', () => {
  assert.equal(isHoneypotTriggered({ website: 'http://spam.example' }), true)
  assert.equal(isHoneypotTriggered({ website: 'a' }), true)
})

test('returns false defensively for non-object payloads', () => {
  assert.equal(isHoneypotTriggered(null), false)
  assert.equal(isHoneypotTriggered(undefined), false)
  assert.equal(isHoneypotTriggered('string'), false)
  assert.equal(isHoneypotTriggered(42), false)
  assert.equal(isHoneypotTriggered([]), false)
})

test('returns false when honeypot is a non-string type (defensive)', () => {
  assert.equal(isHoneypotTriggered({ website: 123 }), false)
  assert.equal(isHoneypotTriggered({ website: null }), false)
  assert.equal(isHoneypotTriggered({ website: true }), false)
})
