import test from 'ava'

import {
  BaseError,
  baseErrorObject,
  PluginError,
  pluginErrorObject,
} from './helpers/main.test.js'

test('Can run "transformInstance" option', (t) => {
  const { propName } = BaseError.parse(baseErrorObject, {
    transformInstance: (error, errorObject) => {
      error.propName = errorObject.name
    },
  })
  t.is(propName, baseErrorObject.name)
})

test('error.pluginsOpts is not exposed in "transformInstance"', (t) => {
  const { pluginsOptsCopy } = BaseError.parse(baseErrorObject, {
    transformInstance: (error) => {
      error.pluginsOptsCopy = error.pluginsOpts
    },
  })
  t.is(pluginsOptsCopy, undefined)
})

test('Handle unsafe "transformInstance"', (t) => {
  const error = PluginError.parse(pluginErrorObject, {
    transformInstance: () => {
      throw new Error('unsafe')
    },
  })
  t.false('pluginsOpts' in error)
  t.true(error.options)
})
