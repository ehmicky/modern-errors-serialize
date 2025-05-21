<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/ehmicky/design/main/modern-errors/modern-errors_dark.svg"/>
  <img alt="modern-errors logo" src="https://raw.githubusercontent.com/ehmicky/design/main/modern-errors/modern-errors.svg" width="600"/>
</picture>

[![Node](https://img.shields.io/badge/-Node.js-808080?logo=node.js&colorA=404040&logoColor=66cc33)](https://www.npmjs.com/package/modern-errors-serialize)
[![Browsers](https://img.shields.io/badge/-Browsers-808080?logo=firefox&colorA=404040)](https://unpkg.com/modern-errors-serialize?module)
[![TypeScript](https://img.shields.io/badge/-Typed-808080?logo=typescript&colorA=404040&logoColor=0096ff)](/src/main.d.ts)
[![Codecov](https://img.shields.io/badge/-Tested%20100%25-808080?logo=codecov&colorA=404040)](https://codecov.io/gh/ehmicky/modern-errors-serialize)
[![Minified size](https://img.shields.io/bundlephobia/minzip/modern-errors-serialize?label&colorA=404040&colorB=808080&logo=webpack)](https://bundlephobia.com/package/modern-errors-serialize)
[![Mastodon](https://img.shields.io/badge/-Mastodon-808080.svg?logo=mastodon&colorA=404040&logoColor=9590F9)](https://fosstodon.org/@ehmicky)
[![Medium](https://img.shields.io/badge/-Medium-808080.svg?logo=medium&colorA=404040)](https://medium.com/@ehmicky)

[`modern-errors`](https://github.com/ehmicky/modern-errors)
[plugin](https://github.com/ehmicky/modern-errors#-plugins) to serialize/parse
errors.

This adds [`BaseError.serialize()`](#baseerrorserializeerror) and
[`BaseError.parse()`](#baseerrorparseerrorobject) to serialize/parse errors
to/from plain objects.

# Features

- Ensures errors are [safe to serialize with JSON](#json-safety)
- [Deep serialization/parsing](#deep-serializationparsing)
- [Custom serialization/parsing](#custom-serializationparsing) (e.g. YAML or
  `process.send()`)
- Keeps [error classes](#baseerrorparseerrorobject)
- Preserves errors' [additional properties](#additional-error-properties)
- Works [recursively](#aggregate-errors) with
  [`AggregateError`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AggregateError)
- Safe: this never throws

# Example

[Adding the plugin](https://github.com/ehmicky/modern-errors#adding-plugins) to
[`modern-errors`](https://github.com/ehmicky/modern-errors).

```js
import ModernError from 'modern-errors'

import modernErrorsSerialize from 'modern-errors-serialize'

export const BaseError = ModernError.subclass('BaseError', {
  plugins: [modernErrorsSerialize],
})
// ...
```

[Serializing](#baseerrorserializeerror) errors to plain objects.

```js
const error = new ExampleError('message', { props: { filePath } })

const errorObject = BaseError.serialize(error)
// { name: 'ExampleError', message: 'message', stack: '...', filePath: '...' }
const errorString = JSON.stringify(errorObject)
// '{"name":"ExampleError",...}'
```

[Parsing](#baseerrorparseerrorobject) errors from plain objects.

```js
const newErrorObject = JSON.parse(errorString)
const newError = BaseError.parse(newErrorObject)
// ExampleError: message
//     at ...
//   filePath: '...'
```

# Install

```bash
npm install modern-errors-serialize
```

This package works in both Node.js >=18.18.0 and
[browsers](https://raw.githubusercontent.com/ehmicky/dev-tasks/main/src/browserslist).

This is an ES module. It must be loaded using
[an `import` or `import()` statement](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c),
not `require()`. If TypeScript is used, it must be configured to
[output ES modules](https://www.typescriptlang.org/docs/handbook/esm-node.html),
not CommonJS.

# API

## modernErrorsSerialize

_Type_: `Plugin`

Plugin object to pass to the
[`plugins` option](https://github.com/ehmicky/modern-errors#adding-plugins) of
`ErrorClass.subclass()`.

## BaseError.serialize(error)

`error`: `ErrorInstance`\
_Return value_: `ErrorObject`

Converts `error` to an error plain object. All
[error properties](https://github.com/ehmicky/error-serializer#additional-error-properties)
are kept.
[Plugin options](https://github.com/ehmicky/modern-errors#plugin-options) are
also preserved.

## BaseError.parse(errorObject)

`errorObject`: `ErrorObject`\
_Return value_: `ErrorInstance`

Converts `errorObject` to an error instance. The original error classes are
preserved providing they are
[subclasses](https://github.com/ehmicky/modern-errors#create-error-classes) of
`BaseError`.

## Options

_Type_: `object`

### shallow

_Type_: `boolean`\
_Default_: `false`

Unless this option is `true`, nested errors are also serialized/parsed. They can
be inside other errors, plain objects or arrays.

<!-- eslint-disable no-unused-expressions -->

```js
const inner = new ExampleError('inner')
const error = new ExampleError('example', { props: { inner } })

BaseError.serialize(error).inner // { name: 'BaseError', message: 'inner', ... }
BaseError.serialize(error, { shallow: true }).inner // BaseError

const errorObject = BaseError.serialize(error)
BaseError.parse(errorObject).inner // BaseError
BaseError.parse(errorObject, { shallow: true }).inner // { name: '...', ... }
```

### loose

_Type_: `boolean`\
_Default_: `false`

By default, when the argument is not an `Error` instance or an error plain
object, it is converted to one. If this option is `true`, it is kept as is
instead.

```js
BaseError.serialize('example') // { name: 'BaseError', message: 'example', ... }
BaseError.serialize('example', { loose: true }) // 'example'

BaseError.parse('example') // BaseError
BaseError.parse('example', { loose: true }) // 'example'
```

#### include

_Type_: `string[]`

During [serialization](#baseerrorserializeerror), only pick
[specific properties](#omit-additional-error-properties).

```js
BaseError.serialize(error, { include: ['message'] }) // { message: 'example' }
```

#### exclude

_Type_: `string[]`

During [serialization](#baseerrorserializeerror), omit
[specific properties](#omit-stack-traces).

```js
BaseError.serialize(error, { exclude: ['stack'] }) // { name: 'Error', message: 'example' }
```

### transformObject(errorObject, errorInstance)

_Type_: `(errorObject, errorInstance) => void`

During [serialization](#baseerrorserializeerror), [transform](#transforming)
each error plain object.

`errorObject` is the error after serialization. It must be directly mutated.

`errorInstance` is the error before serialization.

### transformArgs(constructorArgs, errorObject, ErrorClass)

_Type_: `(constructorArgs, errorObject, ErrorClass) => void`

During [parsing](#baseerrorparseerrorobject), [transform](#transforming) the
arguments passed to each `new Error()`.

`constructorArgs` is the array of arguments. Usually, `constructorArgs[0]` is
the
[error message](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/message)
and `constructorArgs[1]` is the
[constructor options object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/Error#parameters).
`constructorArgs` must be directly mutated.

`errorObject` is the error before parsing. `ErrorClass` is its class.

### transformInstance(errorInstance, errorObject)

_Type_: `(errorInstance, errorObject) => void`

During [parsing](#baseerrorparseerrorobject), [transform](#transforming) each
`Error` instance.

`errorInstance` is the error after parsing. It must be directly mutated.

`errorObject` is the error before parsing.

## Configuration

[Options](#options) can apply to (in priority order):

- Any error: second argument to
  [`ModernError.subclass()`](https://github.com/ehmicky/modern-errors#options-1)

```js
export const BaseError = ModernError.subclass('BaseError', {
  plugins: [modernErrorsSerialize],
  serialize: options,
})
```

- Any error of a specific class (and its subclasses): second argument to
  [`ErrorClass.subclass()`](https://github.com/ehmicky/modern-errors#options-1)

```js
export const ExampleError = BaseError.subclass('ExampleError', {
  serialize: options,
})
```

- A specific error: second argument to
  [`new ErrorClass()`](https://github.com/ehmicky/modern-errors#options-3)

```js
throw new ExampleError('...', { serialize: options })
```

- A specific [`BaseError.serialize(error)`](#baseerrorserializeerror) or
  [`BaseError.parse(errorObject)`](#baseerrorparseerrorobject) call

```js
BaseError.serialize(error, options)
```

```js
BaseError.parse(errorObject, options)
```

# Usage

## JSON safety

Error plain objects are always
[safe to serialize with JSON](https://github.com/ehmicky/safe-json-value).

```js
const error = new ExampleError('message')
error.cycle = error

// Cycles make `JSON.stringify()` throw, so they are removed
console.log(BaseError.serialize(error).cycle) // undefined
```

## Deep serialization/parsing

The [`loose` option](#loose) can be used to deeply serialize/parse objects and
arrays.

```js
const error = new ExampleError('message')
const deepArray = BaseError.serialize([{}, { error }], { loose: true })

const jsonString = JSON.stringify(deepArray)
const newDeepArray = JSON.parse(jsonString)

const newError = BaseError.parse(newDeepArray, { loose: true })[1].error
// ExampleError: message
//     at ...
```

## Automatic serialization

[`error.toJSON()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#tojson_behavior)
is defined. It is automatically called by
[`JSON.stringify()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify).

```js
const error = new ExampleError('message')
const deepArray = [{}, { error }]

const jsonString = JSON.stringify(deepArray)
const newDeepArray = JSON.parse(jsonString)

const newError = BaseError.parse(newDeepArray, { loose: true })[1].error
// ExampleError: message
//     at ...
```

## Omit additional error properties

```js
const ExampleError = BaseError.subclass('ExampleError', {
  serialize: { include: ['name', 'message', 'stack'] },
})
const error = new ExampleError('example')
error.prop = true

const errorObject = ExampleError.serialize(error)
console.log(errorObject.prop) // undefined
console.log(errorObject) // { name: 'Error', message: 'example', stack: '...' }
```

## Omit stack traces

```js
const ExampleError = BaseError.subclass('ExampleError', {
  serialize: { exclude: ['stack'] },
})
const error = new ExampleError('example')

const errorObject = ExampleError.serialize(error)
console.log(errorObject.stack) // undefined
console.log(errorObject) // { name: 'Error', message: 'example' }
```

## Transforming

<!-- eslint-disable fp/no-mutation, no-param-reassign -->

```js
const errors = [new ExampleError('message secret')]
errors[0].date = new Date()

const errorObjects = BaseError.serialize(errors, {
  loose: true,
  // Serialize `Date` instances as strings
  transformObject: (errorObject) => {
    errorObject.date = errorObject.date.toString()
  },
})
console.log(errorObjects[0].date) // Date string

const newErrors = BaseError.parse(errorObjects, {
  loose: true,
  // Transform error message
  transformArgs: (constructorArgs) => {
    constructorArgs[0] = constructorArgs[0].replace('secret', '***')
  },
  // Parse date strings as `Date` instances
  transformInstance: (error) => {
    error.date = new Date(error.date)
  },
})
console.log(newErrors[0].message) // 'message ***'
console.log(newErrors[0].date) // `Date` instance
```

## Custom serialization/parsing

Errors are converted to/from plain objects, not strings. This allows any
serialization/parsing logic to be performed.

```js
import { dump, load } from 'js-yaml'

const error = new ExampleError('message')
const errorObject = BaseError.serialize(error)
const errorYamlString = dump(errorObject)
// name: ExampleError
// message: message
// stack: ExampleError: message ...
const newErrorObject = load(errorYamlString)
const newError = BaseError.parse(newErrorObject) // ExampleError: message
```

## Additional error properties

```js
const error = new ExampleError('message', { props: { prop: true } })
const errorObject = BaseError.serialize(error)
console.log(errorObject.prop) // true
const newError = BaseError.parse(errorObject)
console.log(newError.prop) // true
```

## Aggregate `errors`

```js
const error = new ExampleError('message', {
  errors: [new ExampleError('one'), new ExampleError('two')],
})

const errorObject = BaseError.serialize(error)
// {
//   name: 'ExampleError',
//   message: 'message',
//   stack: '...',
//   errors: [{ name: 'ExampleError', message: 'one', stack: '...' }, ...],
// }
const newError = BaseError.parse(errorObject)
// ExampleError: message
//   [errors]: [ExampleError: one, ExampleError: two]
```

## Constructors

If an error with a
[`custom` class](https://github.com/ehmicky/modern-errors#-custom-logic) is
parsed, its custom constructor is not called. However, any property previously
set by that constructor is still preserved, providing it is serializable and
enumerable.

<!-- eslint-disable fp/no-this, fp/no-mutation -->

```js
const ExampleError = BaseError.subclass('ExampleError', {
  custom: class extends BaseError {
    constructor(message, options, prop) {
      super(message, options, prop)
      this.prop = prop
    }
  },
})

const error = new ExampleError('message', {}, true)
const errorObject = BaseError.serialize(error)
// `constructor(message, options, prop)` is not called
const newError = BaseError.parse(errorObject)
// But properties set by that `constructor(...)` are kept
console.log(newError.prop) // true
```

# Related projects

- [`error-serializer`](https://github.com/ehmicky/error-serializer): Convert
  errors to/from plain objects
- [`modern-errors`](https://github.com/ehmicky/modern-errors): Handle errors in
  a simple, stable, consistent way
- [`modern-errors-cli`](https://github.com/ehmicky/modern-errors-cli): Handle
  errors in CLI modules
- [`modern-errors-beautiful`](https://github.com/ehmicky/modern-errors-beautiful):
  Prettify errors messages and stacks
- [`modern-errors-process`](https://github.com/ehmicky/modern-errors-process):
  Handle process errors
- [`modern-errors-bugs`](https://github.com/ehmicky/modern-errors-bugs): Print
  where to report bugs
- [`modern-errors-clean`](https://github.com/ehmicky/modern-errors-clean): Clean
  stack traces
- [`modern-errors-http`](https://github.com/ehmicky/modern-errors-http): Create
  HTTP error responses
- [`modern-errors-winston`](https://github.com/ehmicky/modern-errors-winston):
  Log errors with Winston
- [`modern-errors-switch`](https://github.com/ehmicky/modern-errors-switch):
  Execute class-specific logic

# Support

For any question, _don't hesitate_ to [submit an issue on GitHub](../../issues).

Everyone is welcome regardless of personal background. We enforce a
[Code of conduct](CODE_OF_CONDUCT.md) in order to promote a positive and
inclusive environment.

# Contributing

This project was made with ❤️. The simplest way to give back is by starring and
sharing it online.

If the documentation is unclear or has a typo, please click on the page's `Edit`
button (pencil icon) and suggest a correction.

If you would like to help us fix a bug or add a new feature, please check our
[guidelines](CONTRIBUTING.md). Pull requests are welcome!

<!-- Thanks go to our wonderful contributors: -->

<!-- ALL-CONTRIBUTORS-LIST:START -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://fosstodon.org/@ehmicky"><img src="https://avatars2.githubusercontent.com/u/8136211?v=4?s=100" width="100px;" alt="ehmicky"/><br /><sub><b>ehmicky</b></sub></a><br /><a href="https://github.com/ehmicky/modern-errors-serialize/commits?author=ehmicky" title="Code">💻</a> <a href="#design-ehmicky" title="Design">🎨</a> <a href="#ideas-ehmicky" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/ehmicky/modern-errors-serialize/commits?author=ehmicky" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://vegardit.com"><img src="https://avatars.githubusercontent.com/u/7782055?v=4?s=100" width="100px;" alt="Benjamin Kroeger"/><br /><sub><b>Benjamin Kroeger</b></sub></a><br /><a href="#ideas-benkroeger" title="Ideas, Planning, & Feedback">🤔</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
