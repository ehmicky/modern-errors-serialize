# 2.0.0

## Breaking changes

- [`modern-errors@5`](https://github.com/ehmicky/modern-errors/releases/tag/5.0.0)
  is now required
- [`BaseError.parse(value)`](README.md#baseerrorparseerrorobject) is now deep by
  default. If `value` is not an error object, it is not converted to one
  anymore.
- The serialization format has changed: instead of serializing the constructor
  arguments as `constructorArgs`, the plugins options are now serialized as
  `pluginsOpts`. Those properties are undocumented and mostly internal, so this
  should not have any impact in most cases.

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
