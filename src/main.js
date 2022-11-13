import {
  serialize as serializeToObject,
  parse as parseFromObject,
} from 'error-serializer'
import isPlainObject from 'is-plain-obj'

// `ErrorClass.serialize(error)`
const serialize = function ({ instancesData }, value) {
  return serializeValue(value, instancesData)
}

// `ErrorClass.toJSON(error)` or `error.toJSON()`
const toJSON = function ({ error, instancesData }) {
  return serializeValue(error, instancesData)
}

const serializeValue = function (value, instancesData) {
  return serializeToObject(value, {
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

// `ErrorClass.parse()`
const parse = function ({ ErrorClass, ErrorClasses, instancesData }, value) {
  const classes = getClasses(ErrorClasses)
  return parseFromObject(value, {
    classes,
    afterParse: afterParse.bind(undefined, { ErrorClass, instancesData }),
  })
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

export default {
  name: 'serialize',
  instanceMethods: { toJSON },
  staticMethods: { serialize, parse },
}
