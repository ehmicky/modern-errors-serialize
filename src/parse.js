import { parse as parseFromObject } from 'error-serializer'
import isPlainObject from 'is-plain-obj'

import { applyLoose } from './loose.js'

// `ErrorClass.parse(value)`
export const parse = function (
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
