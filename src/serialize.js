import { serialize as serializeToObject } from 'error-serializer'

import { applyLoose } from './loose.js'

// `ErrorClass.serialize(value)`
export const serialize = ({ ErrorClass, instancesData, errorInfo }, value) =>
  serializeValue({ ErrorClass, instancesData, errorInfo, value })

// `error.toJSON()`
export const toJSON = ({ ErrorClass, instancesData, errorInfo, error }) =>
  serializeValue({ ErrorClass, instancesData, errorInfo, value: error })

const serializeValue = ({ ErrorClass, instancesData, errorInfo, value }) => {
  const {
    options: { loose, shallow, transformObject },
  } = errorInfo(value)
  const valueA = applyLoose(value, loose, ErrorClass)
  return serializeToObject(valueA, {
    loose,
    shallow,
    transformObject: applyTransformObject.bind(undefined, {
      instancesData,
      transformObject,
    }),
  })
}

// Apply `transformObject` option
const applyTransformObject = (
  { instancesData, transformObject },
  errorObject,
  error,
) => {
  serializePluginsOpts(errorObject, error, instancesData)
  transformObject?.(errorObject, error)
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
const serializePluginsOpts = (errorObject, error, instancesData) => {
  if (!instancesData.has(error)) {
    return
  }

  const { pluginsOpts } = instancesData.get(error)

  if (Object.keys(pluginsOpts).length !== 0) {
    // eslint-disable-next-line no-param-reassign, fp/no-mutation
    errorObject.pluginsOpts = pluginsOpts
  }
}
