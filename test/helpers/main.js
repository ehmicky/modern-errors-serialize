import { runInNewContext } from 'node:vm'

import modernErrors from 'modern-errors'
import modernErrorsSerialize from 'modern-errors-serialize'

export const AnyError = modernErrors([modernErrorsSerialize])
export const UnknownError = AnyError.subclass('UnknownError')
export const TestError = AnyError.subclass('TestError')

export const testError = new TestError('message')
// eslint-disable-next-line fp/no-mutation
testError.one = true
export const errorObject = testError.toJSON()

export const nativeError = new TypeError('message')
// eslint-disable-next-line fp/no-mutation
nativeError.one = true

export const crossRealmError = new (runInNewContext('TypeError'))('message')

const parentNativeError = new TestError('test')
// eslint-disable-next-line fp/no-mutation
parentNativeError.prop = nativeError
export const nativeErrorObject = parentNativeError.toJSON().prop
