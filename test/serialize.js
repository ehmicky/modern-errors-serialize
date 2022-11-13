import test from 'ava'
import { each } from 'test-each'

import {
  BaseError,
  baseError,
  errorObject,
  nativeError,
} from './helpers/main.js'

const convertError = function ({ name, message, stack, one }) {
  return { name, message, stack, one }
}

test('error.toJSON() serializes', (t) => {
  t.deepEqual(errorObject, convertError(baseError))
})

each([baseError, nativeError], ({ title }, deepError) => {
  test(`error.toJSON() is deep | ${title}`, (t) => {
    const error = new BaseError('test')
    error.prop = [deepError]
    t.deepEqual(error.toJSON().prop[0], convertError(deepError))
  })
})

test('error.toJSON() is not enumerable', (t) => {
  t.false(
    Object.getOwnPropertyDescriptor(Object.getPrototypeOf(baseError), 'toJSON')
      .enumerable,
  )
})
