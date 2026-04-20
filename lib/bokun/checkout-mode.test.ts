import { test } from 'node:test'
import assert from 'node:assert/strict'
import { resolveCheckoutMode } from './checkout-mode.ts'

test('resolveCheckoutMode defaults to disabled when env unset', () => {
  assert.equal(resolveCheckoutMode(undefined), 'disabled')
  assert.equal(resolveCheckoutMode(''), 'disabled')
})

test('resolveCheckoutMode accepts valid values', () => {
  assert.equal(resolveCheckoutMode('disabled'), 'disabled')
  assert.equal(resolveCheckoutMode('dev-mock'), 'dev-mock')
  assert.equal(resolveCheckoutMode('live'), 'live')
})

test('resolveCheckoutMode rejects invalid values (failsafe to disabled)', () => {
  assert.equal(resolveCheckoutMode('LIVE'), 'disabled')
  assert.equal(resolveCheckoutMode('anything-else'), 'disabled')
  assert.equal(resolveCheckoutMode('mock'), 'disabled')
})
