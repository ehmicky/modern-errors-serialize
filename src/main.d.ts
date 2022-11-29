import type { ErrorObject } from 'error-serializer'

import type { Info, ErrorInstance } from 'modern-errors'

export type { ErrorObject }

/**
 * Options of `modern-errors-serialize`
 */
export interface Options {
  /**
   * By default, when the argument is not an `Error` instance or an error plain
   * object, it is converted to one. If this option is `true`, it is kept as is
   * instead.
   *
   * @default false
   *
   * @example
   * ```js
   * BaseError.serialize('example') // { name: 'BaseError', message: 'example', ... }
   * BaseError.serialize('example', { loose: true }) // 'example'
   *
   * BaseError.parse('example') // BaseError
   * BaseError.parse('example', { loose: true }) // 'example'
   * ```
   */
  readonly loose?: boolean

  /**
   * Unless this option is `true`, nested errors are also serialized/parsed.
   * They can be inside other errors, plain objects or arrays.
   *
   * @default false
   *
   * @example
   * ```js
   * const inner = new ExampleError('inner')
   * const error = new ExampleError('example', { props: { inner } })
   *
   * BaseError.serialize(error).inner // { name: 'BaseError', message: 'inner', ... }
   * BaseError.serialize(error, { shallow: true }).inner // BaseError
   *
   * const errorObject = BaseError.serialize(error)
   * BaseError.parse(errorObject).inner // BaseError
   * BaseError.parse(errorObject, { shallow: true }).inner // { name: '...', ... }
   * ```
   */
  readonly shallow?: boolean
}

/**
 * `modern-errors-serialize` plugin.
 *
 * This plugin adds `BaseError.serialize()` and `BaseError.parse()` to
 * serialize/parse errors to/from plain objects.
 */
declare const plugin: {
  name: 'serialize'
  getOptions: (options: Options) => Options
  isOptions: (options: unknown) => boolean
  staticMethods: {
    /**
     * Converts `error` to an error plain object. All error properties are kept.
     * [Plugin options](https://github.com/ehmicky/modern-errors#plugin-options)
     * are also preserved.
     *
     * @example
     * ```js
     * const error = new ExampleError('message', { props: { filePath } })
     *
     * const errorObject = BaseError.serialize(error)
     * // { name: 'ExampleError', message: 'message', stack: '...', filePath: '...' }
     * const errorString = JSON.stringify(errorObject)
     * // '{"name":"ExampleError",...}'
     * ```
     */
    serialize: (info: Info['staticMethods'], error: unknown) => ErrorObject

    /**
     * Converts `errorObject` to an error instance. The original error classes
     * are preserved providing they are
     * [subclasses](https://github.com/ehmicky/modern-errors#create-error-classes)
     * of `BaseError`.
     *
     * @example
     * ```js
     * const error = new ExampleError('message', { props: { filePath } })
     *
     * const errorObject = BaseError.serialize(error)
     * // { name: 'ExampleError', message: 'message', stack: '...', filePath: '...' }
     * const errorString = JSON.stringify(errorObject)
     * // '{"name":"ExampleError",...}'
     *
     * const newErrorObject = JSON.parse(errorString)
     * const newError = BaseError.parse(newErrorObject)
     * // ExampleError: message
     * //     at ...
     * //   filePath: '...'
     * ```
     */
    parse: (info: Info['staticMethods'], errorObject: unknown) => ErrorInstance
  }
  instanceMethods: {
    /**
     * [`error.toJSON()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#tojson_behavior)
     * is defined. It is automatically called by
     * [`JSON.stringify()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify).
     *
     * @example
     * ```js
     * const error = new ExampleError('message')
     * const deepArray = [{}, { error }]
     *
     * const jsonString = JSON.stringify(deepArray)
     * const newDeepArray = JSON.parse(jsonString)
     *
     * const newError = BaseError.parse(newDeepArray, { loose: true })[1].error
     * // ExampleError: message
     * //     at ...
     * ```
     */
    toJSON: (info: Info['instanceMethods']) => ErrorObject
  }
}
export default plugin
