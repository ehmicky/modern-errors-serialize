import { validateOptions } from 'error-serializer'

// Retrieve options
export const getOptions = function (options = {}) {
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
