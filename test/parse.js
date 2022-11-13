import test from 'ava'
import { each } from 'test-each'

import {
  BaseError,
  baseError,
  errorObject,
  nativeError,
  nativeErrorObject,
} from './helpers/main.js'

test('ErrorClass.parse() parses error plain objects', (t) => {
  t.deepEqual(BaseError.parse(errorObject), baseError)
})

test('ErrorClass.parse() keeps error class', (t) => {
  t.is(BaseError.parse(errorObject).constructor, BaseError)
})

test('ErrorClass.parse() is deep', (t) => {
  t.deepEqual(BaseError.parse([{ prop: errorObject }])[0].prop, baseError)
})

test('ErrorClass.parse() parses native errors', (t) => {
  const [nativeErrorCopy] = BaseError.parse([nativeErrorObject])
  t.deepEqual(nativeErrorCopy, nativeError)
  t.is(nativeErrorCopy.constructor, TypeError)
})

each(
  [undefined, null, true, {}, { name: 'Error' }, baseError, nativeError],
  ({ title }, value) => {
    test(`ErrorClass.parse() does not normalize top-level non-error plain objects | ${title}`, (t) => {
      t.deepEqual(BaseError.parse(value), value)
    })

    test(`ErrorClass.parse() does not normalize deep non-error plain objects | ${title}`, (t) => {
      t.deepEqual(BaseError.parse([value])[0], value)
    })
  },
)
