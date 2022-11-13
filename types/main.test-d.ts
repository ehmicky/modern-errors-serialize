import { expectType, expectError } from 'tsd'

import ModernError, { ErrorInstance } from 'modern-errors'
import modernErrorsSerialize, { ErrorObject } from 'modern-errors-serialize'

const BaseError = ModernError.subclass('BaseError', {
  plugins: [modernErrorsSerialize],
})
const error = new BaseError('')
const errorObject = error.toJSON()

expectError(
  ModernError.subclass('TestError', {
    plugins: [modernErrorsSerialize],
    serialize: undefined,
  }),
)
expectError(error.toJSON(undefined))
expectError(BaseError.parse(errorObject, undefined))

expectType<ErrorObject>(errorObject)
expectType<string>(errorObject.name)

expectType<ErrorInstance>(BaseError.parse(errorObject))
expectError(BaseError.parse({}))
