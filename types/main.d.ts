import type { ErrorObject } from 'error-serializer'

import type { Info, ErrorInstance } from 'modern-errors'

export type { ErrorObject }

/**
 * `modern-errors-serialize` plugin.
 *
 * This plugin adds `BaseError.toJSON()`, `BaseError.fromJSON()`,
 * `BaseError.serialize()` and `BaseError.parse()` to serialize/parse errors
 * to/from plain objects.
 */
declare const plugin: {
  name: 'serialize'
  instanceMethods: {
    /**
     * Converts `error` to an error plain object that is
     * [serializable](https://github.com/ehmicky/error-serializer#json-safety)
     * to JSON
     * ([or YAML](https://github.com/ehmicky/error-serializer#custom-serializationparsing),
     * etc.). All
     * [error properties](https://github.com/ehmicky/error-serializer#additional-error-properties)
     * are kept.
     * [Plugin options](https://github.com/ehmicky/modern-errors#plugin-options)
     * are also preserved.
     *
     * Nested error instances are serialized deeply. If `error` is not an error
     * instance, it is first
     * [normalized](https://github.com/ehmicky/modern-errors#invalid-errors) to
     * one.
     *
     * This is also set as
     * [`error.toJSON()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#tojson_behavior).
     * Therefore
     * [`JSON.stringify()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)
     * automatically calls it.
     *
     * @example
     * ```js
     * const error = new InputError('Wrong file.', { props: { filePath } })
     * const errorObject = BaseError.toJSON(error)
     * // { name: 'InputError', message: 'Wrong file', stack: '...', filePath: '...' }
     * const errorString = JSON.stringify(errorObject)
     * // '{"name":"InputError",...}'
     * ```
     */
    toJSON: (info: Info['instanceMethods']) => ErrorObject
  }
  staticMethods: {
    /**
     * This is like `BaseError.toJSON(value)` except, if `value` is not an error
     * instance, it is kept as is. However, any nested error instances is still
     * serialized.
     *
     * @example
     * ```js
     * const error = new InputError('Wrong file.')
     * const deepArray = [{}, { error }]
     *
     * const jsonString = JSON.stringify(BaseError.serialize(deepArray))
     * const newDeepArray = JSON.parse(jsonString)
     *
     * const newError = BaseError.parse(newDeepArray)[1].error
     * // InputError: Wrong file.
     * //     at ...
     * ```
     */
    serialize: (info: Info['staticMethods'], error: unknown) => unknown

    /**
     * This is like `BaseError.fromJSON(value)` except, if `value` is not an
     * error plain object, it is kept as is. However, any nested error plain
     * object is still parsed.
     *
     * @example
     * ```js
     * const error = new InputError('Wrong file.')
     * const deepArray = [{}, { error }]
     *
     * const jsonString = JSON.stringify(BaseError.serialize(deepArray))
     * const newDeepArray = JSON.parse(jsonString)
     *
     * const newError = BaseError.parse(newDeepArray)[1].error
     * // InputError: Wrong file.
     * //     at ...
     * ```
     */
    parse: (info: Info['staticMethods'], errorObject: unknown) => unknown

    /**
     * Converts `errorObject` to an error instance.
     * The original error classes are preserved.
     *
     * Nested error plain objects are parsed deeply. If `errorObject` is not an
     * error plain object, it is first normalized to one.
     *
     * @example
     * ```js
     * const newErrorObject = JSON.parse(errorString)
     * const newError = BaseError.fromJSON(newErrorObject)
     * // InputError: Wrong file.
     * //     at ...
     * //   filePath: '...'
     * ```
     */
    fromJSON: (
      info: Info['staticMethods'],
      errorObject: unknown,
    ) => ErrorInstance
  }
}
export default plugin
