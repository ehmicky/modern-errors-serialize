import { expectType, expectError } from 'tsd'

import ModernError from 'modern-errors'
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
expectError(BaseError.toJSON(error, undefined))
expectError(BaseError.parse(errorObject, undefined))

expectType<ErrorObject>(errorObject)
expectType<string>(errorObject.name)
expectType<ErrorObject>(error.toJSON())

expectType<unknown>(BaseError.parse(errorObject))
expectType<unknown>(BaseError.parse({ errorObject }))
