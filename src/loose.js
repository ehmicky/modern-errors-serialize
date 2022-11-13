// Unless `loose` is `true`, the argument is normalized
export const applyLoose = function (value, loose, ErrorClass) {
  return loose ? value : ErrorClass.normalize(value)
}
