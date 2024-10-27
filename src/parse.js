import { parse as parseFromObject } from 'error-serializer'
import isPlainObject from 'is-plain-obj'

import { applyLoose } from './loose.js'

// `ErrorClass.parse(value)`
export const parse = (
  {
    ErrorClass,
    ErrorClasses,
    instancesData,
    options: { loose, shallow, transformArgs, transformInstance },
  },
  value,
) => {
  const classes = getClasses(ErrorClasses)
  const valueA = parseFromObject(value, {
    loose,
    shallow,
    classes,
    transformArgs: applyTransformArgs.bind(undefined, {
      ErrorClass,
      instancesData,
      transformArgs,
    }),
    transformInstance: applyTransformInstance.bind(undefined, {
      ErrorClass,
      instancesData,
      transformInstance,
    }),
  })
  return applyLoose(valueA, loose, ErrorClass)
}

const getClasses = (ErrorClasses) =>
  Object.fromEntries(ErrorClasses.map(getClass))

const getClass = (ErrorClass) => [ErrorClass.name, ErrorClass]

// Apply `transformArgs` option
const applyTransformArgs = (
  { ErrorClass, transformArgs },
  constructorArgs,
  errorObject,
  ErrorClassArg,
  // eslint-disable-next-line max-params
) => {
  parsePluginsOpts({ constructorArgs, errorObject, ErrorClass, ErrorClassArg })
  transformArgs?.(constructorArgs, errorObject, ErrorClassArg)
}

// Parse `pluginsOpts`, to keep plugin options
const parsePluginsOpts = ({
  constructorArgs,
  errorObject: { pluginsOpts },
  ErrorClass,
  ErrorClassArg,
}) => {
  if (!hasPluginsOpts(pluginsOpts, ErrorClass, ErrorClassArg)) {
    return
  }

  const argsIndex = constructorArgs.findLastIndex(isPlainObject)

  if (argsIndex === -1) {
    constructorArgs.push(pluginsOpts)
  } else {
    // eslint-disable-next-line fp/no-mutation, no-param-reassign
    constructorArgs[argsIndex] = {
      ...pluginsOpts,
      ...constructorArgs[argsIndex],
    }
  }
}

const hasPluginsOpts = (pluginsOpts, ErrorClass, ErrorClassArg) =>
  isPlainObject(pluginsOpts) &&
  (ErrorClass === ErrorClassArg || isProto.call(ErrorClass, ErrorClassArg))

const { isPrototypeOf: isProto } = Object.prototype

// Apply `transformInstance` option
const applyTransformInstance = ({ transformInstance }, error, errorObject) => {
  // eslint-disable-next-line fp/no-delete
  delete error.pluginsOpts
  transformInstance?.(error, errorObject)
}
