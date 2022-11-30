import test from 'ava'
import { each } from 'test-each'

import { BaseError } from './helpers/main.test.js'

each([true, { loose: 'true' }, { shallow: 'true' }], ({ title }, options) => {
  test(`Options are validated | ${title}`, (t) => {
    t.throws(
      BaseError.subclass.bind(undefined, 'TestError', { serialize: options }),
    )
  })
})

test('Empty objects are options when serializing', (t) => {
  t.is(BaseError.serialize({}).message, '')
})

test('Empty objects are options when parsing', (t) => {
  t.is(BaseError.parse({}).message, 'undefined')
})

each(['serialize', 'parse'], ({ title }, methodName) => {
  test(`Plain objects with non-option keys are not options | ${title}`, (t) => {
    t.is(BaseError[methodName]({ message: 'test' }).message, 'test')
  })
})
