import {
  validateOptions,
  serialize as serializeToObject,
  parse as parseFromObject,
} from 'error-serializer'
import isErrorInstance from 'is-error-instance'
import isPlainObject from 'is-plain-obj'

// Retrieve options
const getOptions = function (options = {}) {
  validateOptions(options)
  const { loose, shallow, ...unknownOptions } = options
  validateUnknownOptions(unknownOptions)
  return { loose, shallow }
}

const validateUnknownOptions = function (unknownOptions) {
  const [unknownOption] = Object.keys(unknownOptions)

  if (unknownOption !== undefined) {
    throw new TypeError(`Option "${unknownOption}" is unknown.`)
  }
}

// `ErrorClass.serialize(value)` or `error.toJSON()`
const serialize = function (
  { ErrorClass, instancesData, options: { loose, shallow } },
  value,
) {
  const valueA = applyLoose(value, loose, ErrorClass)
  return serializeToObject(valueA, {
    loose,
    shallow,
    beforeSerialize: beforeSerialize.bind(undefined, instancesData),
    afterSerialize,
  })
}

// Plugin options are kept in some undocumented `WeakMap` called `instancesData`
// Those are kept by serializing them as a `pluginsOpts` property.
// Even though `error-serializer` allows keeping constructor arguments using
// `error.constructorArgs`, we do not use it because it is too difficult to
// implement and brittle. It would require:
//  - Serializing `cause` and aggregate `errors` which are
//    - Big
//    - Mutable
//    - Difficult not to skip since `plugin.properties()` and `custom` behavior
//      might depend on their presence
// - Storing `constructorArgs` as error property due to `error-serializer` being
//   deep and not calling `error.toJSON()`
// - Users passing initial constructor arguments down, which is complicated when
//   they also want to modify them
const beforeSerialize = function (instancesData, error) {
  if (!instancesData.has(error)) {
    return
  }

  const { pluginsOpts } = instancesData.get(error)

  if (Object.keys(pluginsOpts).length === 0) {
    return
  }

  error.pluginsOpts = pluginsOpts
}

const afterSerialize = function (error) {
  // eslint-disable-next-line fp/no-delete
  delete error.pluginsOpts
}

// `ErrorClass.parse(value)`
const parse = function (
  { ErrorClass, ErrorClasses, instancesData, options: { loose, shallow } },
  value,
) {
  const classes = getClasses(ErrorClasses)
  const valueA = parseFromObject(value, {
    loose,
    shallow,
    classes,
    afterParse: afterParse.bind(undefined, { ErrorClass, instancesData }),
  })
  return applyLoose(valueA, loose, ErrorClass)
}

const getClasses = function (ErrorClasses) {
  return Object.fromEntries(ErrorClasses.map(getClass))
}

const getClass = function (ErrorClass) {
  return [ErrorClass.name, ErrorClass]
}

const afterParse = function (
  { ErrorClass, instancesData },
  errorObject,
  error,
) {
  setPluginsOpts(ErrorClass, instancesData, error)
  // eslint-disable-next-line fp/no-delete
  delete error.pluginsOpts
}

const setPluginsOpts = function (ErrorClass, instancesData, error) {
  if (!(error instanceof ErrorClass)) {
    return
  }

  const pluginsOpts = isPlainObject(error.pluginsOpts) ? error.pluginsOpts : {}
  instancesData.set(error, { pluginsOpts })
}

const applyLoose = function (value, loose, ErrorClass) {
  return loose || isErrorInstance(value) ? value : ErrorClass.normalize(value)
}

export default {
  name: 'serialize',
  getOptions,
  staticMethods: { serialize, parse },
  instanceMethods: { toJSON: serialize },
}
