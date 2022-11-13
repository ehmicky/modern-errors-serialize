import { serialize, parse as parseErrorObject } from 'error-serializer'

const toJSON = function ({ error, instancesData }) {
  beforeSerialize(error, instancesData)
  const errorObject = serialize(error)
  afterSerialize(error)
  return errorObject
}

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
