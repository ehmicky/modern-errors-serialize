import { expectType, expectError } from 'tsd'

import ModernError, { ErrorInstance } from 'modern-errors'
import modernErrorsSerialize, { ErrorObject } from 'modern-errors-serialize'

const BaseError = ModernError.subclass('BaseError', {
  plugins: [modernErrorsSerialize],
})
const error = new BaseError('')
const errorObject = BaseError.toJSON(error)

expectError(
  ModernError.subclass('TestError', {
    plugins: [modernErrorsSerialize],
    serialize: undefined,
  }),
)
expectError(BaseError.serialize(error, undefined))
expectError(BaseError.toJSON(error, undefined))
expectError(BaseError.parse(errorObject, undefined))
expectError(BaseError.fromJSON(errorObject, undefined))

expectType<unknown>(BaseError.serialize(error))
expectType<unknown>(BaseError.serialize({ error }))
expectType<ErrorObject>(BaseError.toJSON(error))
expectType<ErrorObject>(BaseError.toJSON({ error }))
expectType<ErrorObject>(error.toJSON())

expectType<string>(errorObject.name)

expectType<ErrorInstance>(BaseError.fromJSON(errorObject))
expectType<ErrorInstance>(BaseError.fromJSON({ errorObject }))
expectType<unknown>(BaseError.parse(errorObject))
expectType<unknown>(BaseError.parse({ errorObject }))
