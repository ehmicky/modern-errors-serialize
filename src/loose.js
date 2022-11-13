import isErrorInstance from 'is-error-instance'

// Unless `loose` is `true`, the argument is normalized
export const applyLoose = function (value, loose, ErrorClass) {
  return loose || isErrorInstance(value) ? value : ErrorClass.normalize(value)
}
