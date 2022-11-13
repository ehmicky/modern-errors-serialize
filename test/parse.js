import test from 'ava'
import { each } from 'test-each'

import {
  BaseError,
  baseError,
  nativeError,
  parentNativeError,
  PluginError,
  getPluginErrorObject,
} from './helpers/main.js'

test('ErrorClass.parse() parses error plain objects', (t) => {
  t.deepEqual(BaseError.parse(BaseError.toJSON(baseError)), baseError)
})

test('ErrorClass.parse() keeps error class', (t) => {
  t.is(BaseError.parse(BaseError.toJSON(baseError)).constructor, BaseError)
})

test('ErrorClass.parse() is deep', (t) => {
  t.deepEqual(
    BaseError.parse([{ prop: BaseError.toJSON(baseError) }])[0].prop,
    baseError,
  )
})

test('ErrorClass.parse() parses native errors', (t) => {
  const nativeErrorObject = BaseError.toJSON(parentNativeError).prop
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

const InvalidError = BaseError.subclass('InvalidError', {
  custom: class extends BaseError {
    constructor(message, options, prop) {
      if (typeof prop !== 'symbol') {
        throw new TypeError('unsafe')
      }

      super(message, options, prop)
    }
  },
})

test('ErrorClass.parse() handles constructors that throw', (t) => {
  const invalidError = new InvalidError('message', {}, Symbol('test'))
  t.true(
    BaseError.parse(InvalidError.toJSON(invalidError)) instanceof BaseError,
  )
})

test('ErrorClass.parse() keeps plugin options', (t) => {
  const cause = PluginError.parse(getPluginErrorObject('toJSON'))
  t.false('pluginsOpts' in cause)
  t.true(new PluginError('', { cause }).options)
})

test('ErrorClass.parse() keeps plugin options deeply', (t) => {
  const cause = PluginError.parse({
    ...getPluginErrorObject('toJSON'),
    cause: getPluginErrorObject('toJSON'),
  })
  t.true(new PluginError('', { cause }).options)
})

each([undefined, true], ({ title }, pluginsOpts) => {
  test(`ErrorClass.parse() handles missing or invalid plugin options | ${title}`, (t) => {
    const cause = PluginError.parse({
      ...getPluginErrorObject('toJSON'),
      pluginsOpts,
    })
    t.false('options' in new PluginError('', { cause }))
  })
})
