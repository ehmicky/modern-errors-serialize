import { serialize, parse as parseErrorObject } from 'error-serializer'

const toJSON = function ({ error }) {
  return serialize(error)
}

const parse = function ({ ErrorClasses }, errorObject) {
  const classes = getClasses(ErrorClasses)
  return parseErrorObject(errorObject, { classes })
}

const getClasses = function (ErrorClasses) {
  return Object.fromEntries(ErrorClasses.map(getClass))
}

const getClass = function (ErrorClass) {
  return [ErrorClass.name, ErrorClass]
}

export default {
  name: 'serialize',
  instanceMethods: { toJSON },
  staticMethods: { parse },
}
