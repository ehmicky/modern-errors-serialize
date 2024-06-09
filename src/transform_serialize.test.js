import test from 'ava'

import {
  BaseError,
  baseError,
  baseErrorObject,
  PluginError,
  pluginError,
  pluginErrorOpts,
} from './helpers/main.test.js'

test('Can run "transformObject" option', (t) => {
  const { propName } = BaseError.serialize(baseError, {
    transformObject: (errorObject, error) => {
      // eslint-disable-next-line no-param-reassign, fp/no-mutation
      errorObject.propName = error.name
    },
  })
  t.is(propName, baseError.name)
})

test('errorObject.pluginsOpts is exposed in "transformObject"', (t) => {
  const { pluginsOptsCopy } = PluginError.serialize(pluginError, {
    transformObject: (errorObject) => {
      // eslint-disable-next-line no-param-reassign, fp/no-mutation
      errorObject.pluginsOptsCopy = errorObject.pluginsOpts
    },
  })
  t.deepEqual(pluginsOptsCopy, pluginErrorOpts)
})

test('Handle unsafe "transformObject"', (t) => {
  const { pluginsOpts } = PluginError.serialize(pluginError, {
    transformObject: () => {
      throw new Error('unsafe')
    },
  })
  t.deepEqual(pluginsOpts, pluginErrorOpts)
})

test('Can use "include" option', (t) => {
  t.deepEqual(BaseError.serialize(baseError, { include: ['message'] }), {
    message: baseErrorObject.message,
  })
})

test('Can use "exclude" option', (t) => {
  t.deepEqual(
    BaseError.serialize(baseError, { exclude: ['name', 'stack', 'one'] }),
    { message: baseErrorObject.message },
  )
})
