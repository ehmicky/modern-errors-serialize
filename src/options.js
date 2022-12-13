import { validateOptions } from 'error-serializer'
import isPlainObject from 'is-plain-obj'

// Retrieve options
export const getOptions = (options = {}) => {
  validateOptions(options)
  return options
}

// Only plain objects with valid option keys are considered options
export const isOptions = (value) =>
  isPlainObject(value) && Object.keys(value).every(isOptionKey)

const isOptionKey = (key) => OPTIONS_KEYS.has(key)

const OPTIONS_KEYS = new Set(['loose', 'shallow'])
