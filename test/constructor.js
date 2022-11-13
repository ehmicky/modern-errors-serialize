import test from 'ava'

import { BaseError } from './helpers/main.js'

test('ErrorClass.parse() handles constructors that throw', (t) => {
  const InvalidError = BaseError.subclass('InvalidError', {
    custom: class extends BaseError {
      constructor(message, options, prop) {
        if (typeof prop !== 'symbol') {
          throw new TypeError('unsafe')
        }

        super(message, options, prop)
      }
    },
  })
  const invalidError = new InvalidError('message', {}, Symbol('test'))
  t.true(BaseError.parse(invalidError.toJSON()) instanceof BaseError)
})
