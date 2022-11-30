import test from 'ava'
import { each } from 'test-each'

import {
  BaseError,
  baseError,
  baseErrorObject,
  nativeError,
  nativeErrorObject,
  PluginError,
  pluginErrorObject,
  nonErrorObjects,
  InvalidError,
} from './helpers/main.test.js'

test('ErrorClass.parse() parses error plain objects', (t) => {
  t.deepEqual(BaseError.parse(baseErrorObject), baseError)
})

test('ErrorClass.parse() keeps error class', (t) => {
  t.is(BaseError.parse(baseErrorObject).constructor, BaseError)
})

test('ErrorClass.parse() parses deep native errors', (t) => {
  const [nativeErrorCopy] = BaseError.parse([nativeErrorObject], {
    loose: true,
  })
  t.deepEqual(nativeErrorCopy, nativeError)
  t.is(nativeErrorCopy.constructor, TypeError)
})

test('ErrorClass.parse() handles constructors that throw', (t) => {
  const invalidError = new InvalidError('message', {}, Symbol('test'))
  t.true(
    BaseError.parse(InvalidError.serialize(invalidError)) instanceof BaseError,
  )
})

test('ErrorClass.parse() keeps plugin options', (t) => {
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

const deepErrorObject = { ...pluginErrorObject, prop: [baseErrorObject] }

test('ErrorClass.parse() is deep by default', (t) => {
  t.deepEqual(BaseError.parse(deepErrorObject).prop[0], baseError)
})

test('ErrorClass.parse() is not deep with "shallow: true"', (t) => {
  t.deepEqual(
    BaseError.parse(deepErrorObject, { shallow: true }).prop[0],
    baseErrorObject,
  )
})

test('ErrorClass.parse() can be deep and loose', (t) => {
  t.deepEqual(
    BaseError.parse([deepErrorObject], { loose: true })[0].prop[0],
    baseError,
  )
})

each(nonErrorObjects, ({ title }, value) => {
  test(`ErrorClass.parse() does not normalize deep value | ${title}`, (t) => {
    t.deepEqual(
      BaseError.parse({ ...pluginErrorObject, prop: [value] }).prop[0],
      value,
    )
  })
})

each([undefined, true], ({ title }, pluginsOpts) => {
  test(`ErrorClass.parse() handles missing or invalid plugin options | ${title}`, (t) => {
    const cause = PluginError.parse({ ...pluginErrorObject, pluginsOpts })
    t.false('options' in new PluginError('', { cause }))
  })
})
