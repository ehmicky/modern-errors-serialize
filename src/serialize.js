import { serialize as serializeToObject } from 'error-serializer'

import { applyLoose } from './loose.js'

// `ErrorClass.serialize(value)`
export const serialize = function (
  { ErrorClass, instancesData, errorInfo },
  value,
) {
  return serializeValue({ ErrorClass, instancesData, errorInfo, value })
}

// `error.toJSON()`
export const toJSON = function ({
  ErrorClass,
  instancesData,
  errorInfo,
  error,
}) {
  return serializeValue({ ErrorClass, instancesData, errorInfo, value: error })
}

const serializeValue = function ({
  ErrorClass,
  instancesData,
  errorInfo,
  value,
}) {
  const {
    options: { loose, shallow },
  } = errorInfo(value)
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
