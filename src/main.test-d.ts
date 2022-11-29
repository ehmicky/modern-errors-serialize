import {
  expectType,
  expectAssignable,
  expectNotAssignable,
  expectError,
} from 'tsd'

import ModernError, { ErrorInstance } from 'modern-errors'
import modernErrorsSerialize, {
  ErrorObject,
  Options,
} from 'modern-errors-serialize'

const BaseError = ModernError.subclass('BaseError', {
  plugins: [modernErrorsSerialize],
})
const error = new BaseError('')
const errorObject = BaseError.serialize(error)

expectError(BaseError.serialize(error, undefined))
expectError(error.toJSON(undefined))
expectError(BaseError.parse(errorObject, undefined))

expectType<ErrorObject>(BaseError.serialize(error))
expectType<ErrorObject>(BaseError.serialize({ error }))
expectType<ErrorObject>(error.toJSON())

expectType<string>(errorObject.name)

expectType<ErrorInstance>(BaseError.parse(errorObject))
expectType<ErrorInstance>(BaseError.parse({ errorObject }))

BaseError.subclass('TestError', { serialize: { loose: true } })
expectError(BaseError.subclass('TestError', { serialize: true }))
new BaseError('', { serialize: { loose: true } })
expectError(new BaseError('', { serialize: { loose: 'true' } }))
BaseError.serialize(error, { loose: true })
expectError(BaseError.serialize(error, { loose: 'true' }))
error.toJSON({ loose: true })
expectError(error.toJSON({ loose: 'true' }))
BaseError.parse(errorObject, { loose: true })
expectError(BaseError.parse(errorObject, { loose: 'true' }))

expectAssignable<Options>({})
expectNotAssignable<Options>(true)
expectNotAssignable<Options>({ unknown: true })
expectAssignable<Options>({ loose: true })
expectNotAssignable<Options>({ loose: 'true' })
expectAssignable<Options>({ shallow: true })
expectNotAssignable<Options>({ shallow: 'true' })
