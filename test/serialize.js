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

test('ErrorClass.toJSON() serializes', (t) => {
  t.deepEqual(errorObject, convertError(baseError))
})

each([baseError, nativeError], ({ title }, deepError) => {
  test(`ErrorClass.toJSON() is deep | ${title}`, (t) => {
    const error = new BaseError('test')
    error.prop = [deepError]
    t.deepEqual(BaseError.toJSON(error).prop[0], convertError(deepError))
  })
})

test('ErrorClass.toJSON() keeps plugin options', (t) => {
  t.true(pluginErrorObject.pluginsOpts.test)
})

test('ErrorClass.toJSON() keeps plugin options deeply', (t) => {
  const error = new PluginError('message')
  error.cause = new PluginError('causeMessage', { test: true })
  t.true(PluginError.toJSON(error).cause.pluginsOpts.test)
})

test('ErrorClass.toJSON() does not keep plugin options of native errors', (t) => {
  const error = new PluginError('message')
  error.cause = new Error('causeMessage')
  t.false('pluginsOpts' in PluginError.toJSON(error).cause)
})

test('ErrorClass.toJSON() does not keep empty plugin options', (t) => {
  const error = new PluginError('message')
  t.false('pluginsOpts' in PluginError.toJSON(error))
})

test('ErrorClass.toJSON() does not mutate error', (t) => {
  PluginError.toJSON(pluginError)
  t.false('pluginsOpts' in pluginError)
})

test('error.toJSON() serializes', (t) => {
  t.deepEqual(baseError.toJSON(), convertError(baseError))
})

test('error.toJSON() is not enumerable', (t) => {
  t.false(
    Object.getOwnPropertyDescriptor(Object.getPrototypeOf(baseError), 'toJSON')
      .enumerable,
  )
})
