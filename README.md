<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/ehmicky/design/main/modern-errors/modern-errors_dark.svg"/>
  <img alt="modern-errors logo" src="https://raw.githubusercontent.com/ehmicky/design/main/modern-errors/modern-errors.svg" width="600"/>
</picture>

[![Node](https://img.shields.io/badge/-Node.js-808080?logo=node.js&colorA=404040&logoColor=66cc33)](https://www.npmjs.com/package/modern-errors-serialize)
[![Browsers](https://img.shields.io/badge/-Browsers-808080?logo=firefox&colorA=404040)](https://unpkg.com/modern-errors-serialize?module)
[![TypeScript](https://img.shields.io/badge/-Typed-808080?logo=typescript&colorA=404040&logoColor=0096ff)](/types/main.d.ts)
[![Codecov](https://img.shields.io/badge/-Tested%20100%25-808080?logo=codecov&colorA=404040)](https://codecov.io/gh/ehmicky/modern-errors-serialize)
[![Minified size](https://img.shields.io/bundlephobia/minzip/modern-errors-serialize?label&colorA=404040&colorB=808080&logo=webpack)](https://bundlephobia.com/package/modern-errors-serialize)
[![Twitter](https://img.shields.io/badge/-Twitter-808080.svg?logo=twitter&colorA=404040)](https://twitter.com/intent/follow?screen_name=ehmicky)
[![Medium](https://img.shields.io/badge/-Medium-808080.svg?logo=medium&colorA=404040)](https://medium.com/@ehmicky)

[`modern-errors`](https://github.com/ehmicky/modern-errors)
[plugin](https://github.com/ehmicky/modern-errors#-plugins) to serialize/parse
errors.

This adds [`BaseError.toJSON()`](#baseerrortojsonerror),
[`BaseError.fromJSON()`](#baseerrorfromjsonerrorobject),
[`BaseError.serialize()`](#baseerrorserializevalue) and
[`BaseError.parse()`](#baseerrorparsevalue) to serialize/parse errors to/from
plain objects.

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

[Serializing](#baseerrortojsonerror) errors to plain objects.

```js
const error = new InputError('Wrong file.', { props: { filePath } })
const errorObject = BaseError.toJSON(error)
// { name: 'InputError', message: 'Wrong file', stack: '...', filePath: '...' }
const errorString = JSON.stringify(errorObject)
// '{"name":"InputError",...}'
```

[Parsing](#baseerrorfromjsonerrorobject) errors from plain objects.

```js
const newErrorObject = JSON.parse(errorString)
const newError = BaseError.fromJSON(newErrorObject)
// InputError: Wrong file.
//     at ...
//   filePath: '...'
```

# Install

```bash
npm install modern-errors-serialize
```

This package works in both Node.js >=14.18.0 and
[browsers](https://raw.githubusercontent.com/ehmicky/dev-tasks/main/src/tasks/build/browserslist).
It is an ES module and must be loaded using
[an `import` or `import()` statement](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c),
not `require()`.

# API

## modernErrorsSerialize

_Type_: `Plugin`

Plugin object to pass to the
[`plugins` option](https://github.com/ehmicky/modern-errors#adding-plugins) of
`ErrorClass.subclass()`.

## BaseError.toJSON(error)

`error`: `ErrorInstance`\
_Return value_: `ErrorObject`

Converts `error` to an error plain object that is
[serializable](https://github.com/ehmicky/error-serializer#json-safety) to JSON
([or YAML](https://github.com/ehmicky/error-serializer#custom-serializationparsing),
etc.). All
[error properties](https://github.com/ehmicky/error-serializer#additional-error-properties)
are kept.
[Plugin options](https://github.com/ehmicky/modern-errors#plugin-options) are
also preserved.

[Nested](#deep-serializationparsing) error instances are serialized deeply. If
`error` is not an error instance, it is first
[normalized](https://github.com/ehmicky/modern-errors#invalid-errors) to one.

This is also set as
[`error.toJSON()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#tojson_behavior).
Therefore
[`JSON.stringify()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)
automatically calls it.

## BaseError.fromJSON(errorObject)

`errorObject`: `ErrorObject`\
_Return value_: `ErrorInstance`

Converts `errorObject` to an error instance. The original error classes are
preserved.

[Nested](#deep-serializationparsing) error plain objects are parsed deeply. If
`errorObject` is not an error plain object, it is first normalized to one.

## BaseError.serialize(value)

This is like [`BaseError.toJSON(value)`](#baseerrortojsonerror) except, if
`value` is not an error instance, it is kept as is. However, any nested error
instances is still serialized.

## BaseError.parse(value)

This is like [`BaseError.fromJSON(value)`](#baseerrorfromjsonerrorobject)
except, if `value` is not an error plain object, it is kept as is. However, any
nested error plain object is still parsed.

# Usage

## JSON safety

Error plain objects are always
[safe to serialize with JSON](https://github.com/ehmicky/safe-json-value).

```js
const error = new InputError('Wrong file.')
error.cycle = error

// Cycles make `JSON.stringify()` throw, so they are removed
console.log(BaseError.toJSON(error).cycle) // undefined
```

## Deep serialization/parsing

Objects and arrays are deeply serialized and parsed.

```js
const error = new InputError('Wrong file.')
const deepArray = [{}, { error }]

const jsonString = JSON.stringify(deepArray)
const newDeepArray = JSON.parse(jsonString)

const newError = BaseError.parse(newDeepArray)[1].error
// InputError: Wrong file.
//     at ...
```

## Custom serialization/parsing

Errors are converted to/from plain objects, not strings. This allows any
serialization/parsing logic to be performed.

```js
import { dump, load } from 'js-yaml'

const error = new InputError('Wrong file.')
const errorObject = BaseError.toJSON(error)
const errorYamlString = dump(errorObject)
// name: InputError
// message: Wrong file.
// stack: InputError: Wrong file. ...
const newErrorObject = load(errorYamlString)
const newError = BaseError.fromJSON(newErrorObject) // InputError: Wrong file.
```

## Additional error properties

```js
const error = new InputError('Wrong file.', { props: { prop: true } })
const errorObject = BaseError.toJSON(error)
console.log(errorObject.prop) // true
const newError = BaseError.fromJSON(errorObject)
console.log(newError.prop) // true
```

## Aggregate `errors`

```js
const error = new InputError('Wrong file.', {
  errors: [new ExampleError('one'), new ExampleError('two')],
})

const errorObject = BaseError.toJSON(error)
// {
//   name: 'InputError',
//   message: 'Wrong file.',
//   stack: '...',
//   errors: [{ name: 'ExampleError', message: 'one', stack: '...' }, ...],
// }
const newError = BaseError.fromJSON(errorObject)
// InputError: Wrong file.
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
const InputError = BaseError.subclass('InputError', {
  custom: class extends BaseError {
    constructor(message, options, prop) {
      super(message, options, prop)
      this.prop = prop
    }
  },
})

const error = new InputError('Wrong file.', {}, true)
const errorObject = BaseError.toJSON(error)
// `constructor(message, options, prop)` is not called
const newError = BaseError.fromJSON(errorObject)
// But properties set by that `constructor(...)` are kept
console.log(newError.prop) // true
```

# Related projects

- [`error-serializer`](https://github.com/ehmicky/error-serializer): Convert
  errors to/from plain objects
- [`modern-errors`](https://github.com/ehmicky/modern-errors): Handle errors
  like it's 2022 🔮
- [`modern-errors-cli`](https://github.com/ehmicky/modern-errors-cli): Handle
  errors in CLI modules
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
<!-- prettier-ignore -->
<!--
<table><tr><td align="center"><a href="https://twitter.com/ehmicky"><img src="https://avatars2.githubusercontent.com/u/8136211?v=4" width="100px;" alt="ehmicky"/><br /><sub><b>ehmicky</b></sub></a><br /><a href="https://github.com/ehmicky/modern-errors-serialize/commits?author=ehmicky" title="Code">💻</a> <a href="#design-ehmicky" title="Design">🎨</a> <a href="#ideas-ehmicky" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/ehmicky/modern-errors-serialize/commits?author=ehmicky" title="Documentation">📖</a></td></tr></table>
 -->
<!-- ALL-CONTRIBUTORS-LIST:END -->
