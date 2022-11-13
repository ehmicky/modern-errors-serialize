import type { ErrorObject } from 'error-serializer'

import type { Info } from 'modern-errors'

export type { ErrorObject }

/**
 * `modern-errors-serialize` plugin.
 *
 * This plugin adds `error.toJSON()` and `BaseError.parse()` to serialize/parse
 * errors to plain objects.
 */
declare const plugin: {
  name: 'serialize'
  instanceMethods: {
    /**
     * Converts errors to plain objects that are
     * [serializable](https://github.com/ehmicky/error-serializer#json-safety)
     * to JSON
     * ([or YAML](https://github.com/ehmicky/error-serializer#custom-serializationparsing),
     * etc.). This is
     * [automatically called](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#tojson_behavior)
     * by `JSON.stringify()`.
     *
     * All
     * [error properties](https://github.com/ehmicky/error-serializer#additional-error-properties)
     * are kept.
     * [Plugin options](https://github.com/ehmicky/modern-errors#plugin-options)
     * are also preserved.
     *
     * @example
     * ```js
     * const error = new InputError('Wrong file.', { props: { filePath } })
     * const errorObject = error.toJSON()
     * // { name: 'InputError', message: 'Wrong file', stack: '...', filePath: '...' }
     * const errorString = JSON.stringify(error)
     * // '{"name":"InputError",...}'
     * ```
     */
    toJSON: (info: Info['instanceMethods']) => ErrorObject
  }
  staticMethods: {
    /**
     * If `value` is an error plain object, converts it to an error instance.
     * Otherwise, recurse over `value` and parse any nested error plain object.
     *
     * The original error classes are preserved.
     *
     * @example
     * ```js
     * const newErrorObject = JSON.parse(errorString)
     * const newError = BaseError.parse(newErrorObject)
     * // InputError: Wrong file.
     * //     at ...
     * //   filePath: '...'
     * ```
     */
    parse: (info: Info['staticMethods'], errorObject: unknown) => unknown
  }
}
export default plugin
