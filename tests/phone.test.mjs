import assert from 'node:assert/strict'
import { test } from 'node:test'
import { normalizePhone } from '../lib/phone.ts'

for (const input of ['0712345678', '712345678', '+254712345678', '712 345 678', '+254 712 345 678']) {
  test(`normalizes Kenyan input ${input}`, () => assert.equal(normalizePhone(input), '+254712345678'))
}
test('validates other countries and national trunk prefixes', () => {
  assert.equal(normalizePhone('020 7946 0018', 'GB'), '+442079460018')
  assert.equal(normalizePhone('+14155552671'), '+14155552671')
})
test('rejects empty, invalid, excessively long and embedded numbers', () => {
  for (const input of ['', '123', '0000000000', '+2547123456789999', 'call +254712345678', '+254712345678 ext 5']) {
    assert.equal(normalizePhone(input), null, input)
  }
})
