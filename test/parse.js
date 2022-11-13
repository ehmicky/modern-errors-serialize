import test from 'ava'
import { each } from 'test-each'

import {
  TestError,
  BaseError,
  UnknownError,
  testError,
  errorObject,
  nativeError,
  nativeErrorObject,
  crossRealmError,
} from './helpers/main.js'

test('BaseError.parse() parses error plain objects', (t) => {
  t.deepEqual(BaseError.parse(errorObject), testError)
})

test('BaseError.parse() keeps error class', (t) => {
  t.true(BaseError.parse(errorObject) instanceof TestError)
})

test('BaseError.parse() is deep', (t) => {
  t.deepEqual(BaseError.parse([{ prop: errorObject }])[0].prop, testError)
})

test('BaseError.parse() parses native errors', (t) => {
  const [nativeErrorCopy] = BaseError.parse([nativeErrorObject])
  t.deepEqual(nativeErrorCopy, nativeError)
  t.true(nativeErrorCopy instanceof TypeError)
})

each(
  [undefined, null, true, {}, { name: 'Error' }, testError],
  ({ title }, value) => {
    test(`BaseError.parse() does not normalize top-level non-error plain objects | ${title}`, (t) => {
      t.deepEqual(BaseError.parse(value), value)
    })
  },
)

each([nativeError, crossRealmError], ({ title }, error) => {
  test(`BaseError.parse() normalize top-level native errors | ${title}`, (t) => {
    t.true(BaseError.parse(error) instanceof UnknownError)
  })

  test(`BaseError.parse() does not normalize deep native errors | ${title}`, (t) => {
    t.false(BaseError.parse([error])[0] instanceof UnknownError)
  })
})
