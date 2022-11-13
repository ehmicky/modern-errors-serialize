import ModernError from 'modern-errors'
import modernErrorsSerialize from 'modern-errors-serialize'

export const BaseError = ModernError.subclass('BaseError', {
  plugins: [modernErrorsSerialize],
})

export const baseError = new BaseError('message')
// eslint-disable-next-line fp/no-mutation
baseError.one = true
export const errorObject = baseError.toJSON()

export const nativeError = new TypeError('message')
// eslint-disable-next-line fp/no-mutation
nativeError.one = true

const parentNativeError = new BaseError('test')
// eslint-disable-next-line fp/no-mutation
parentNativeError.prop = nativeError
export const nativeErrorObject = parentNativeError.toJSON().prop
