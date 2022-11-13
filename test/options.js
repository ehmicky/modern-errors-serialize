import test from 'ava'
import { each } from 'test-each'

import { BaseError } from './helpers/main.js'

each([true, { loose: 'true' }, { shallow: 'true' }], ({ title }, options) => {
  test(`Options are validated | ${title}`, (t) => {
    t.throws(
      BaseError.subclass.bind(undefined, 'TestError', { serialize: options }),
    )
  })
})

each(['serialize', 'parse'], ({ title }, methodName) => {
  test(`Empty objects are not options | ${title}`, (t) => {
    t.is(BaseError[methodName]({}).message, '{}')
  })

  test(`Plain objects with non-option keys are not options | ${title}`, (t) => {
    t.is(BaseError[methodName]({ message: 'test' }).message, 'test')
  })
})
