import test from 'ava'
import { each } from 'test-each'

import {
  BaseError,
  baseError,
  nativeError,
  PluginError,
  pluginError,
  getPluginErrorObject,
} from './helpers/main.js'

const convertError = function ({ name, message, stack, one }) {
  return { name, message, stack, one }
}

each(['toJSON', 'serialize'], ({ title }, methodName) => {
  test(`ErrorClass.toJSON|serialize() serialize | ${title}`, (t) => {
    t.deepEqual(BaseError[methodName](baseError), convertError(baseError))
  })

  test(`ErrorClass.toJSON|serialize() keep plugin options | ${title}`, (t) => {
    t.true(getPluginErrorObject(methodName).pluginsOpts.test)
  })

  test(`ErrorClass.toJSON|serialize() keep plugin options deeply | ${title}`, (t) => {
    const error = new PluginError('message')
    error.cause = new PluginError('causeMessage', { test: true })
    t.true(PluginError[methodName](error).cause.pluginsOpts.test)
  })

  test(`ErrorClass.toJSON|serialize() do not keep plugin options of native errors | ${title}`, (t) => {
    const error = new PluginError('message')
    error.cause = new Error('causeMessage')
    t.false('pluginsOpts' in PluginError[methodName](error).cause)
  })

  test(`ErrorClass.toJSON|serialize() do not keep empty plugin options | ${title}`, (t) => {
    const error = new PluginError('message')
    t.false('pluginsOpts' in PluginError[methodName](error))
  })

  test(`ErrorClass.toJSON|serialize() do not mutate error | ${title}`, (t) => {
    PluginError[methodName](pluginError)
    t.false('pluginsOpts' in pluginError)
  })
})

each(
  ['toJSON', 'serialize'],
  [baseError, nativeError],
  ({ title }, methodName, deepError) => {
    test(`ErrorClass.toJSON|serialize() are deep | ${title}`, (t) => {
      const error = new BaseError('test')
      error.prop = [deepError]
      t.deepEqual(BaseError[methodName](error).prop[0], convertError(deepError))
    })
  },
)

test('ErrorClass.serialize() does not normalize the top-level value', (t) => {
  t.is(BaseError.serialize(''), '')
})

test('ErrorClass.toJSON() normalizes the top-level value', (t) => {
  t.is(BaseError.toJSON('').name, BaseError.name)
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
