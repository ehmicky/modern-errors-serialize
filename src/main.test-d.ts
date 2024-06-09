import ModernError, { type ErrorInstance } from 'modern-errors'
import { expectType, expectAssignable, expectNotAssignable } from 'tsd'

import modernErrorsSerialize, {
  type ErrorObject,
  type Options,
} from 'modern-errors-serialize'

const BaseError = ModernError.subclass('BaseError', {
  plugins: [modernErrorsSerialize],
})
const error = new BaseError('')
const errorObject = BaseError.serialize(error)

// @ts-expect-error
BaseError.serialize(error, undefined)
// @ts-expect-error
error.toJSON(undefined)
// @ts-expect-error
BaseError.parse(errorObject, undefined)

expectType<ErrorObject>(BaseError.serialize(error))
expectType<ErrorObject>(BaseError.serialize({ error }))
expectType<ErrorObject>(error.toJSON())

expectType<string>(errorObject.name)

expectType<ErrorInstance>(BaseError.parse(errorObject))
expectType<ErrorInstance>(BaseError.parse({ errorObject }))

BaseError.subclass('TestError', { serialize: { loose: true } })
// @ts-expect-error
BaseError.subclass('TestError', { serialize: true })
new BaseError('', { serialize: { loose: true } })
// @ts-expect-error
new BaseError('', { serialize: { loose: 'true' } })
BaseError.serialize(error, { loose: true })
// @ts-expect-error
BaseError.serialize(error, { loose: 'true' })
BaseError.serialize(error, {
  transformInstance: (errorArg: Error, errorObjectArg: ErrorObject) => {},
})
// @ts-expect-error
BaseError.serialize(error, { transformInstance: true })
error.toJSON({ loose: true })
// @ts-expect-error
error.toJSON({ loose: 'true' })
BaseError.parse(errorObject, { loose: true })
// @ts-expect-error
BaseError.parse(errorObject, { loose: 'true' })
BaseError.parse(errorObject, {
  transformArgs: (
    constructorArgs: unknown[],
    errorObjectArg: ErrorObject,
    ErrorClass: new (message: string) => Error,
  ) => {},
})
// @ts-expect-error
BaseError.parse(errorObject, { transformArgs: true })
BaseError.parse(errorObject, {
  transformObject: (errorObjectArg: ErrorObject, errorArg: Error) => {},
})
// @ts-expect-error
BaseError.parse(errorObject, { transformObject: true })

BaseError.serialize(error, { include: ['prop'] })
// @ts-expect-error
BaseError.serialize(error, { include: true })
BaseError.serialize(error, { exclude: ['prop'] })
// @ts-expect-error
BaseError.serialize(error, { exclude: true })

expectAssignable<Options>({})
expectNotAssignable<Options>(true)
expectNotAssignable<Options>({ unknown: true })
expectAssignable<Options>({ loose: true })
expectNotAssignable<Options>({ loose: 'true' })
expectAssignable<Options>({ shallow: true })
expectNotAssignable<Options>({ shallow: 'true' })
