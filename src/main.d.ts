import type {
  ErrorObject,
  SerializeOptions,
  ParseOptions,
} from 'error-serializer'
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

  /**
   * During serialization, only pick specific properties.
   *
   * @example
   * ```js
   * BaseError.serialize(error, { include: ['message'] }) // { message: 'example' }
   * ```
   *
   * @example
   * ```js
   * const ExampleError = BaseError.subclass('ExampleError', {
   *   serialize: { include: ['name', 'message', 'stack'] },
   * })
   * const error = new ExampleError('example')
   * error.prop = true
   *
   * const errorObject = ExampleError.serialize(error)
   * console.log(errorObject.prop) // undefined
   * console.log(errorObject) // { name: 'Error', message: 'example', stack: '...' }
   * ```
   */
  readonly include?: SerializeOptions['include']

  /**
   * During serialization, omit specific properties.
   *
   * @example
   * ```js
   * BaseError.serialize(error, { exclude: ['stack'] }) // { name: 'Error', message: 'example' }
   * ```
   *
   * @example
   * ```js
   * const ExampleError = BaseError.subclass('ExampleError', {
   *   serialize: { exclude: ['stack'] },
   * })
   * const error = new ExampleError('example')
   *
   * const errorObject = ExampleError.serialize(error)
   * console.log(errorObject.stack) // undefined
   * console.log(errorObject) // { name: 'Error', message: 'example' }
   * ```
   */
  readonly exclude?: SerializeOptions['exclude']

  /**
   * During serialization, transform each error plain object.
   *
   * `errorObject` is the error after serialization. It must be directly mutated.
   *
   * `errorInstance` is the error before serialization.
   *
   * @example
   * ```js
   * const errors = [new ExampleError('message secret')]
   * errors[0].date = new Date()
   *
   * const errorObjects = BaseError.serialize(errors, {
   *   loose: true,
   *   // Serialize `Date` instances as strings
   *   transformObject: (errorObject) => {
   *     errorObject.date = errorObject.date.toString()
   *   },
   * })
   * console.log(errorObjects[0].date) // Date string
   *
   * const newErrors = BaseError.parse(errorObjects, {
   *   loose: true,
   *   // Transform error message
   *   transformArgs: (constructorArgs) => {
   *     constructorArgs[0] = constructorArgs[0].replace('secret', '***')
   *   },
   *   // Parse date strings as `Date` instances
   *   transformInstance: (error) => {
   *     error.date = new Date(error.date)
   *   },
   * })
   * console.log(newErrors[0].message) // 'message ***'
   * console.log(newErrors[0].date) // `Date` instance
   * ```
   */
  readonly transformObject?: SerializeOptions['transformObject']

  /**
   * During parsing, transform the arguments passed to each `new Error()`.
   *
   * `constructorArgs` is the array of arguments. Usually, `constructorArgs[0]`
   * is the
   * [error message](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/message)
   * and `constructorArgs[1]` is the
   * [constructor options object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/Error#parameters).
   * `constructorArgs` must be directly mutated.
   *
   * `errorObject` is the error before parsing. `ErrorClass` is its class.
   *
   * @example
   * ```js
   * const errors = [new ExampleError('message secret')]
   * errors[0].date = new Date()
   *
   * const errorObjects = BaseError.serialize(errors, {
   *   loose: true,
   *   // Serialize `Date` instances as strings
   *   transformObject: (errorObject) => {
   *     errorObject.date = errorObject.date.toString()
   *   },
   * })
   * console.log(errorObjects[0].date) // Date string
   *
   * const newErrors = BaseError.parse(errorObjects, {
   *   loose: true,
   *   // Transform error message
   *   transformArgs: (constructorArgs) => {
   *     constructorArgs[0] = constructorArgs[0].replace('secret', '***')
   *   },
   *   // Parse date strings as `Date` instances
   *   transformInstance: (error) => {
   *     error.date = new Date(error.date)
   *   },
   * })
   * console.log(newErrors[0].message) // 'message ***'
   * console.log(newErrors[0].date) // `Date` instance
   * ```
   */
  readonly transformArgs?: ParseOptions['transformArgs']

  /**
   * During parsing, transform each `Error` instance.
   *
   * `errorInstance` is the error after parsing. It must be directly mutated.
   *
   * `errorObject` is the error before parsing.
   *
   * @example
   * ```js
   * const errors = [new ExampleError('message secret')]
   * errors[0].date = new Date()
   *
   * const errorObjects = BaseError.serialize(errors, {
   *   loose: true,
   *   // Serialize `Date` instances as strings
   *   transformObject: (errorObject) => {
   *     errorObject.date = errorObject.date.toString()
   *   },
   * })
   * console.log(errorObjects[0].date) // Date string
   *
   * const newErrors = BaseError.parse(errorObjects, {
   *   loose: true,
   *   // Transform error message
   *   transformArgs: (constructorArgs) => {
   *     constructorArgs[0] = constructorArgs[0].replace('secret', '***')
   *   },
   *   // Parse date strings as `Date` instances
   *   transformInstance: (error) => {
   *     error.date = new Date(error.date)
   *   },
   * })
   * console.log(newErrors[0].message) // 'message ***'
   * console.log(newErrors[0].date) // `Date` instance
   * ```
   */
  readonly transformInstance?: ParseOptions['transformInstance']
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
