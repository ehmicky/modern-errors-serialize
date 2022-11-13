import test from 'ava'
import { each } from 'test-each'

import {
  BaseError,
  baseError,
  nativeError,
  PluginError,
  pluginError,
  pluginErrorObject,
} from './helpers/main.js'

const convertError = function ({ name, message, stack, one }) {
  return { name, message, stack, one }
}

test('ErrorClass.serialize() serialize', (t) => {
  t.deepEqual(BaseError.serialize(baseError), convertError(baseError))
})

test('ErrorClass.serialize() keep plugin options', (t) => {
  t.true(pluginErrorObject.pluginsOpts.test)
})

test('ErrorClass.serialize() keep plugin options deeply', (t) => {
  const error = new PluginError('message')
  error.cause = new PluginError('causeMessage', { test: true })
  t.true(PluginError.serialize(error).cause.pluginsOpts.test)
})

test('ErrorClass.serialize() do not keep plugin options of native errors', (t) => {
  const error = new PluginError('message')
  error.cause = new Error('causeMessage')
  t.false('pluginsOpts' in PluginError.serialize(error).cause)
})

test('ErrorClass.serialize() do not keep empty plugin options', (t) => {
  const error = new PluginError('message')
  t.false('pluginsOpts' in PluginError.serialize(error))
})

test('ErrorClass.serialize() do not mutate error', (t) => {
  PluginError.serialize(pluginError)
  t.false('pluginsOpts' in pluginError)
})

each([baseError, nativeError], ({ title }, deepError) => {
  test(`ErrorClass.serialize() are deep | ${title}`, (t) => {
    const error = new BaseError('test')
    error.prop = [deepError]
    t.deepEqual(BaseError.serialize(error).prop[0], convertError(deepError))
  })
})

test('ErrorClass.serialize() normalizes the top-level value by default', (t) => {
  t.is(BaseError.serialize('').name, BaseError.name)
})

test('ErrorClass.serialize() does not normalize the top-level value with "loose: true"', (t) => {
  t.is(BaseError.serialize('', { loose: true }), '')
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
