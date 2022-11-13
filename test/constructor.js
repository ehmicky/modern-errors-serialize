import test from 'ava'

import { BaseError, UnknownError } from './helpers/main.js'

test('BaseError.parse() handles constructors that throw', (t) => {
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
  t.true(BaseError.parse(invalidError.toJSON()) instanceof UnknownError)
})

test('Serialization keeps constructor arguments', (t) => {
  // eslint-disable-next-line fp/no-let
  let args = []
  const OtherTestError = BaseError.subclass('OtherTestError', {
    custom: class extends BaseError {
      constructor(...constructorArgs) {
        super(...constructorArgs)
        // eslint-disable-next-line fp/no-mutation
        args = constructorArgs
      }
    },
  })
  const cause = new OtherTestError('causeMessage', { one: true }, true)
  const error = new BaseError('message', { cause, two: true })
  BaseError.parse(error.toJSON())
  t.deepEqual(args, ['causeMessage\nmessage', { one: true, two: true }, true])
})
