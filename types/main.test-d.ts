import { expectType, expectError } from 'tsd'

import modernErrors, { ErrorInstance } from 'modern-errors'
import modernErrorsSerialize, { ErrorObject } from 'modern-errors-serialize'

const BaseError = modernErrors([modernErrorsSerialize])
const error = new BaseError('', { cause: '' })
const errorObject = error.toJSON()

expectError(modernErrors([modernErrorsSerialize], { serialize: undefined }))
expectError(error.toJSON(undefined))
expectError(BaseError.parse(errorObject, undefined))

expectType<ErrorObject>(errorObject)
expectType<string>(errorObject.name)

expectType<ErrorInstance>(BaseError.parse(errorObject))
expectError(BaseError.parse({}))
