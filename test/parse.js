import test from 'ava'
import { each } from 'test-each'

import {
  BaseError,
  baseError,
  nativeError,
  parentNativeError,
  PluginError,
  getPluginErrorObject,
  nonErrorObjects,
  InvalidError,
} from './helpers/main.js'

each(['parse', 'fromJSON'], ({ title }, methodName) => {
  test(`ErrorClass.parse|fromJSON() parse error plain objects | ${title}`, (t) => {
    t.deepEqual(BaseError[methodName](BaseError.toJSON(baseError)), baseError)
  })

  test(`ErrorClass.parse|fromJSON() keep error class | ${title}`, (t) => {
    t.is(
      BaseError[methodName](BaseError.toJSON(baseError)).constructor,
      BaseError,
    )
  })

  test(`ErrorClass.parse|fromJSON() parse native errors | ${title}`, (t) => {
    const nativeErrorObject = BaseError.toJSON(parentNativeError).prop
    const [nativeErrorCopy] = BaseError.parse([nativeErrorObject])
    t.deepEqual(nativeErrorCopy, nativeError)
    t.is(nativeErrorCopy.constructor, TypeError)
  })

  test(`ErrorClass.parse|fromJSON() handle constructors that throw | ${title}`, (t) => {
    const invalidError = new InvalidError('message', {}, Symbol('test'))
    t.true(
      BaseError[methodName](InvalidError.toJSON(invalidError)) instanceof
        BaseError,
    )
  })

  test(`ErrorClass.parse|fromJSON() keep plugin options | ${title}`, (t) => {
    const cause = PluginError[methodName](getPluginErrorObject('toJSON'))
    t.false('pluginsOpts' in cause)
    t.true(new PluginError('', { cause }).options)
  })

  test(`ErrorClass.parse|fromJSON() keeps plugin options deeply | ${title}`, (t) => {
    const cause = PluginError[methodName]({
      ...getPluginErrorObject('toJSON'),
      cause: getPluginErrorObject('toJSON'),
    })
    t.true(new PluginError('', { cause }).options)
  })

  test(`ErrorClass.parse|fromJSON() is deep | ${title}`, (t) => {
    t.deepEqual(
      BaseError[methodName]({
        ...getPluginErrorObject('toJSON'),
        prop: [BaseError.toJSON(baseError)],
      }).prop[0],
      baseError,
    )
  })
})

each(nonErrorObjects, ({ title }, value) => {
  test(`ErrorClass.parse() does not normalize top-level value | ${title}`, (t) => {
    t.deepEqual(BaseError.parse(value), value)
  })

  test(`ErrorClass.fromJSON() normalizes top-level value | ${title}`, (t) => {
    t.true(BaseError.fromJSON(value) instanceof BaseError)
  })
})

each(['parse', 'fromJSON'], nonErrorObjects, ({ title }, methodName, value) => {
  test(`ErrorClass.parse|fromJSON() do not normalize deep value | ${title}`, (t) => {
    t.deepEqual(
      BaseError[methodName]({
        ...getPluginErrorObject('toJSON'),
        prop: [value],
      }).prop[0],
      value,
    )
  })
})

each(
  ['parse', 'fromJSON'],
  [undefined, true],
  ({ title }, methodName, pluginsOpts) => {
    test(`ErrorClass.parse|fromJSON() handle missing or invalid plugin options | ${title}`, (t) => {
      const cause = PluginError[methodName]({
        ...getPluginErrorObject('toJSON'),
        pluginsOpts,
      })
      t.false('options' in new PluginError('', { cause }))
    })
  },
)
