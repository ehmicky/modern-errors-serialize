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
  PluginChildError,
  pluginChildErrorObject,
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

test('ErrorClass.parse() keeps plugin options when ErrorClass is a parent class', (t) => {
  const cause = PluginError.parse(pluginChildErrorObject)
  t.false('pluginsOpts' in cause)
  t.true(new PluginError('', { cause }).options)
})

test('ErrorClass.parse() does not keep plugin options when ErrorClass is a subclass', (t) => {
  const cause = PluginChildError.parse(pluginErrorObject)
  t.false('pluginsOpts' in cause)
  t.false('options' in new PluginError('', { cause }))
})

each([['test'], ['test', {}]], ({ title }, constructorArgs) => {
  test(`ErrorClass.parse() keeps plugin options with constructorArgs and no second argument | ${title}`, (t) => {
    const cause = PluginError.parse({
      ...pluginErrorObject,
      constructorArgs,
    })
    t.false('pluginsOpts' in cause)
    t.true(new PluginError('', { cause }).options)
    t.is(cause.message, 'test')
  })
})

test('ErrorClass.parse() keeps plugin options with constructorArgs and a non-empty second argument', (t) => {
  const cause = new Error('test')
  // eslint-disable-next-line fp/no-mutation
  cause.prop = true
  const error = PluginError.parse({
    ...pluginErrorObject,
    constructorArgs: ['', { cause }],
  })
  t.false('pluginsOpts' in error)
  t.true(new PluginError('', { cause: error }).options)
  t.true(error.prop)
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
