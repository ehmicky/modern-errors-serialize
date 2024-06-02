import test from 'ava'

import {
  BaseError,
  baseErrorObject,
  PluginError,
  pluginErrorObject,
} from './helpers/main.test.js'

test('Can run "transformArgs" option', (t) => {
  const { message } = BaseError.parse(baseErrorObject, {
    transformArgs: (constructorArgs) => {
      // eslint-disable-next-line fp/no-mutation, no-param-reassign
      constructorArgs[0] = constructorArgs[0].toUpperCase()
    },
  })
  t.is(message, baseErrorObject.message.toUpperCase())
})

test('errorObject.pluginsOpts is exposed in "transformArgs"', (t) => {
  const { options } = PluginError.parse(pluginErrorObject, {
    transformArgs: (constructorArgs) => {
      // eslint-disable-next-line fp/no-mutation, no-param-reassign
      constructorArgs[1].test = !constructorArgs[1].test
    },
  })
  t.false(options)
})

test('Handle unsafe "transformArgs"', (t) => {
  const { options } = PluginError.parse(pluginErrorObject, {
    transformArgs: () => {
      throw new Error('unsafe')
    },
  })
  t.true(options)
})

test('Pass errorObject to "transformArgs"', (t) => {
  const { message } = BaseError.parse(baseErrorObject, {
    transformArgs: (constructorArgs, errorObject) => {
      // eslint-disable-next-line fp/no-mutation, no-param-reassign
      constructorArgs[0] = errorObject.name
    },
  })
  t.is(message, baseErrorObject.name)
})

test('Pass ErrorClass to "transformArgs"', (t) => {
  const { message } = BaseError.parse(baseErrorObject, {
    transformArgs: (constructorArgs, errorObject, ErrorClass) => {
      // eslint-disable-next-line fp/no-mutation, no-param-reassign
      constructorArgs[0] = ErrorClass.name
    },
  })
  t.is(message, BaseError.name)
})
