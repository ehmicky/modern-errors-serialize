import { validateOptions } from 'error-serializer'
import isPlainObject from 'is-plain-obj'

// Retrieve options
export const getOptions = function (options = {}) {
  validateOptions(options)
  return options
}

export const isOptions = function (value) {
  return isPlainObject(value) && Object.keys(value).every(isOptionKey)
}

const isOptionKey = function (key) {
  return OPTIONS_KEYS.has(key)
}

const OPTIONS_KEYS = new Set(['loose', 'shallow'])
