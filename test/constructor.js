import test from 'ava'
import { each } from 'test-each'

import { PluginError, pluginError, pluginErrorObject } from './helpers/main.js'

test('Serialization keeps plugin options', (t) => {
  t.true(pluginErrorObject.pluginsOpts.test)
})

test('Serialization keeps plugin options deeply', (t) => {
  const error = new PluginError('message')
  error.cause = new PluginError('causeMessage', { test: true })
  t.true(error.toJSON().cause.pluginsOpts.test)
})

test('Serialization does not keep plugin options of native errors', (t) => {
  const error = new PluginError('message')
  error.cause = new Error('causeMessage')
  t.false('pluginsOpts' in error.toJSON().cause)
})

test('Serialization does not keep empty plugin options', (t) => {
  const error = new PluginError('message')
  t.false('pluginsOpts' in error.toJSON())
})

test('Serialization does not mutate error', (t) => {
  pluginError.toJSON()
  t.false('pluginsOpts' in pluginError)
})

test('Parsing keeps plugin options', (t) => {
  const cause = PluginError.parse(pluginErrorObject)
  t.false('pluginsOpts' in cause)
  t.true(new PluginError('', { cause }).options)
})

test('Parsing keeps plugin options deeply', (t) => {
  const cause = PluginError.parse({
    ...pluginErrorObject,
    cause: pluginErrorObject,
  })
  t.true(new PluginError('', { cause }).options)
})

each([undefined, true], ({ title }, pluginsOpts) => {
  test(`Parsing handles missing or invalid plugin options | ${title}`, (t) => {
    const cause = PluginError.parse({ ...pluginErrorObject, pluginsOpts })
    t.false('options' in new PluginError('', { cause }))
  })
})
