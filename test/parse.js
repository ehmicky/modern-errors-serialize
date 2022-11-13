import test from 'ava'
import { each } from 'test-each'

import {
  BaseError,
  baseError,
  nativeError,
  parentNativeError,
  PluginError,
  pluginErrorObject,
  nonErrorObjects,
  InvalidError,
} from './helpers/main.js'

test('ErrorClass.parse() parse error plain objects', (t) => {
  t.deepEqual(BaseError.parse(BaseError.toJSON(baseError)), baseError)
})

test('ErrorClass.parse() keep error class', (t) => {
  t.is(BaseError.parse(BaseError.toJSON(baseError)).constructor, BaseError)
})

test('ErrorClass.parse() parse native errors', (t) => {
  const nativeErrorObject = BaseError.toJSON(parentNativeError).prop
  const [nativeErrorCopy] = BaseError.parse([nativeErrorObject])
  t.deepEqual(nativeErrorCopy, nativeError)
  t.is(nativeErrorCopy.constructor, TypeError)
})

test('ErrorClass.parse() handle constructors that throw', (t) => {
  const invalidError = new InvalidError('message', {}, Symbol('test'))
  t.true(
    BaseError.parse(InvalidError.toJSON(invalidError)) instanceof BaseError,
  )
})

test('ErrorClass.parse() keep plugin options', (t) => {
  const cause = PluginError.parse(pluginErrorObject)
  t.false('pluginsOpts' in cause)
  t.true(new PluginError('', { cause }).options)
})

test('ErrorClass.parse() keeps plugin options deeply', (t) => {
  const cause = PluginError.parse({
    ...pluginErrorObject,
    cause: pluginErrorObject,
  })
  t.true(new PluginError('', { cause }).options)
})

test('ErrorClass.parse() is deep', (t) => {
  t.deepEqual(
    BaseError.parse({
      ...pluginErrorObject(),
      prop: [BaseError.toJSON(baseError)],
    }).prop[0],
    baseError,
  )
})

each(nonErrorObjects, ({ title }, value) => {
  test(`ErrorClass.parse() normalizes top-level value by default | ${title}`, (t) => {
    t.true(BaseError.parse(value) instanceof BaseError)
  })

  test(`ErrorClass.parse() does not normalize top-level value with "loose: true" | ${title}`, (t) => {
    t.deepEqual(BaseError.parse(value, { loose: true }), value)
  })
})

each(nonErrorObjects, ({ title }, value) => {
  test(`ErrorClass.parse() do not normalize deep value | ${title}`, (t) => {
    t.deepEqual(
      BaseError.parse({ ...pluginErrorObject, prop: [value] }).prop[0],
      value,
    )
  })
})

each([undefined, true], ({ title }, pluginsOpts) => {
  test(`ErrorClass.parse() handle missing or invalid plugin options | ${title}`, (t) => {
    const cause = PluginError.parse({ ...pluginErrorObject, pluginsOpts })
    t.false('options' in new PluginError('', { cause }))
  })
})
