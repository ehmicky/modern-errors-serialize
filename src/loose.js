// Unless `loose` is `true`, the argument is normalized
export const applyLoose = (value, loose, ErrorClass) =>
  loose ? value : ErrorClass.normalize(value)
