# 6.0.0

## Breaking changes

- Minimal supported Node.js version is now `18.18.0`

# 5.0.0

## Breaking changes

- Minimal supported `modern-errors` version is now `6.0.0`

# 4.0.0

## Breaking changes

- Minimal supported Node.js version is now `16.17.0`

# 3.0.0

## Breaking changes

- `BaseError.toJSON()` was renamed to
  [`BaseError.serialize()`](README.md#baseerrorserializeerror)
- `BaseError.fromJSON()` was renamed to
  [`BaseError.parse()`](README.md#baseerrorparseerrorobject)
- When serializing/parsing a value that is not an error instance or an error
  plain object, it is now automatically converted to one

## Features

- Added the [`shallow` option](README.md#shallow) to serialize/parse shallowly
- Added the [`loose` option](README.md#loose) to prevent converting the argument
  to an error instance or an error plain object if it is not one

# 2.3.0

## Features

- Added [`error.fromJSON()`](README.md#baseerrorfromjsonerrorobject) and
  [`error.serialize()`](README.md#baseerrorserializevalue)

# 2.2.0

## Features

- `error.toJSON()` has been renamed to
  [`BaseError.toJSON(error)`](README.md#baseerrortojsonerror)

# 2.1.0

## Features

- Upgrade to the latest version of `modern-errors`

# 2.0.0

## Breaking changes

- [`modern-errors@5`](https://github.com/ehmicky/modern-errors/releases/tag/5.0.0)
  is now required
- If the argument passed to
  [`BaseError.parse(value)`](README.md#baseerrorparseerrorobject) is not an
  error object, it is not converted to one anymore. Also, if it is an unknown
  error, it is not normalized anymore.
- If an error class uses
  [`custom` option](https://github.com/ehmicky/modern-errors#-custom-logic) and
  a `constructor` is defined, that constructor is not called anymore. However,
  any property previously set by that constructor is still preserved, providing
  it is serializable and enumerable.
- The serialization format has changed: instead of serializing the constructor
  arguments as `constructorArgs`, the plugins options are now serialized as
  `pluginsOpts`. Those properties are undocumented and mostly internal.

# 1.4.0

## Features

- Improve tree-shaking support

# 1.3.0

## Features

- Add browser support

# 1.2.0

## Features

- Upgrade to
  [`modern-errors@v4`](https://github.com/ehmicky/modern-errors/releases/tag/4.0.0)

# 1.1.0

## Documentation

Improve `README`.

# 1.0.0

Initial release.
