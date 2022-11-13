import { serialize, parse as parseErrorObject } from 'error-serializer'

// `error.toJSON()`
const toJSON = function ({ error, instancesData }) {
  beforeSerialize(error, instancesData)
  const errorObject = serialize(error)
  afterSerialize(error)
  return errorObject
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
const beforeSerialize = function (error, instancesData) {
  const { pluginsOpts } = instancesData.get(error)

  if (Object.keys(pluginsOpts).length !== 0) {
    error.pluginsOpts = pluginsOpts
  }
}

const afterSerialize = function (error) {
  // eslint-disable-next-line fp/no-delete
  delete error.pluginsOpts
}

// `ErrorClass.parse()`
const parse = function ({ ErrorClasses, instancesData }, value) {
  const classes = getClasses(ErrorClasses)
  return parseErrorObject(value, {
    classes,
    afterParse: (errorObject, error) => afterParse(error, instancesData),
  })
}

const getClasses = function (ErrorClasses) {
  return Object.fromEntries(ErrorClasses.map(getClass))
}

const getClass = function (ErrorClass) {
  return [ErrorClass.name, ErrorClass]
}

const afterParse = function (error, instancesData) {
  const { pluginsOpts } = error
  instancesData.set(error, { pluginsOpts })
  // eslint-disable-next-line fp/no-delete
  delete error.pluginsOpts
}

export default {
  name: 'serialize',
  instanceMethods: { toJSON },
  staticMethods: { parse },
}
