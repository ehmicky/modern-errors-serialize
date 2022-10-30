import { expectType, expectError } from 'tsd'

import modernErrors, { ErrorInstance } from 'modern-errors'
import modernErrorsSerialize, { ErrorObject } from 'modern-errors-serialize'

const AnyError = modernErrors([modernErrorsSerialize])
const error = new AnyError('', { cause: '' })
const errorObject = error.toJSON()

expectError(modernErrors([modernErrorsSerialize], { serialize: undefined }))
expectError(error.toJSON(undefined))
expectError(AnyError.parse(errorObject, undefined))

expectType<ErrorObject>(errorObject)
expectType<string>(errorObject.name)

expectType<ErrorInstance>(AnyError.parse(errorObject))
expectError(AnyError.parse({}))
