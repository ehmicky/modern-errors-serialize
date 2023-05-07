import { excludeKeys } from 'filter-obj'
import ModernError from 'modern-errors'
import modernErrorsSerialize from 'modern-errors-serialize'

export const BaseError = ModernError.subclass('BaseError', {
  plugins: [modernErrorsSerialize],
})

export const baseError = new BaseError('message')
// eslint-disable-next-line fp/no-mutation
baseError.one = true
export const baseErrorObject = BaseError.serialize(baseError)

export const nativeError = new TypeError('message')
// eslint-disable-next-line fp/no-mutation
nativeError.one = true

const parentNativeError = new BaseError('test')
// eslint-disable-next-line fp/no-mutation
parentNativeError.prop = nativeError
export const nativeErrorObject = BaseError.serialize(parentNativeError).prop

const testPlugin = {
  name: 'test',
  getOptions: (options) => options,
  properties: ({ options }) => ({ options }),
}

export const PluginError = BaseError.subclass('PluginError', {
  plugins: [testPlugin],
})
export const pluginError = new PluginError('message', { test: true })
export const pluginErrorObject = excludeKeys(
  PluginError.serialize(pluginError),
  ['options'],
)

export const nonErrorObjects = [
  undefined,
  null,
  true,
  {},
  { name: 'Error' },
  baseError,
  nativeError,
]

export const InvalidError = BaseError.subclass('InvalidError', {
  custom: class extends BaseError {
    constructor(message, options, prop) {
      if (typeof prop !== 'symbol') {
        throw new TypeError('unsafe')
      }

      super(message, options, prop)
    }
  },
})
