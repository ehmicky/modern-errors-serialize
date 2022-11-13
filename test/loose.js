import test from 'ava'
import { each } from 'test-each'

import { BaseError, nonErrorObjects } from './helpers/main.js'

test('ErrorClass.serialize() normalizes the top-level value by default', (t) => {
  t.is(BaseError.serialize('').name, BaseError.name)
})

test('ErrorClass.serialize() does not normalize the top-level value with "loose: true"', (t) => {
  t.is(BaseError.serialize('', { loose: true }), '')
})

each(nonErrorObjects, ({ title }, value) => {
  test(`ErrorClass.parse() normalizes the top-level value by default | ${title}`, (t) => {
    t.true(BaseError.parse(value) instanceof BaseError)
  })

  test(`ErrorClass.parse() does not normalize the top-level value with "loose: true" | ${title}`, (t) => {
    t.deepEqual(BaseError.parse(value, { loose: true }), value)
  })
})
