import test from 'ava'
import { each } from 'test-each'

import {
  BaseError,
  baseError,
  errorObject,
  nativeError,
  PluginError,
  pluginError,
  pluginErrorObject,
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

test('error.toJSON() keeps plugin options', (t) => {
  t.true(pluginErrorObject.pluginsOpts.test)
})

test('error.toJSON() keeps plugin options deeply', (t) => {
  const error = new PluginError('message')
  error.cause = new PluginError('causeMessage', { test: true })
  t.true(error.toJSON().cause.pluginsOpts.test)
})

test('error.toJSON() does not keep plugin options of native errors', (t) => {
  const error = new PluginError('message')
  error.cause = new Error('causeMessage')
  t.false('pluginsOpts' in error.toJSON().cause)
})

test('error.toJSON() does not keep empty plugin options', (t) => {
  const error = new PluginError('message')
  t.false('pluginsOpts' in error.toJSON())
})

test('error.toJSON() does not mutate error', (t) => {
  pluginError.toJSON()
  t.false('pluginsOpts' in pluginError)
})
