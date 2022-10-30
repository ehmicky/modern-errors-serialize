<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/ehmicky/design/main/modern-errors/modern-errors_dark.svg"/>
  <img alt="modern-errors logo" src="https://raw.githubusercontent.com/ehmicky/design/main/modern-errors/modern-errors.svg" width="600"/>
</picture>

[![Codecov](https://img.shields.io/codecov/c/github/ehmicky/modern-errors-serialize.svg?label=tested&logo=codecov)](https://codecov.io/gh/ehmicky/modern-errors-serialize)
[![TypeScript](https://img.shields.io/badge/-typed-brightgreen?logo=typescript&colorA=gray&logoColor=0096ff)](/types/main.d.ts)
[![Node](https://img.shields.io/node/v/modern-errors-serialize.svg?logo=node.js&logoColor=66cc33)](https://www.npmjs.com/package/modern-errors-serialize)
[![Twitter](https://img.shields.io/badge/%E2%80%8B-twitter-brightgreen.svg?logo=twitter)](https://twitter.com/intent/follow?screen_name=ehmicky)
[![Medium](https://img.shields.io/badge/%E2%80%8B-medium-brightgreen.svg?logo=medium)](https://medium.com/@ehmicky)

`modern-errors` plugin to serialize/parse errors.

This adds `error.toJSON()` and `AnyError.parse()` to serialize/parse errors to
plain objects.

# Features

- Ensures errors are [safe to serialize with JSON](#json-safety)
- [Deep serialization/parsing](#deepserializationparsing)
- [Custom serialization/parsing](#custom-serializationparsing) (e.g. YAML or
  `process.send()`)
- Keeps error classes
- Preserves errors' [additional properties](#additional-error-properties)
- Can keep `custom` [constructor's arguments](#constructors-arguments)
- Works [recursively](#errorcause-and-aggregateerror) with
  [`AggregateError`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AggregateError)
- Safe: this never throws

# Example

[Adding the plugin](https://github.com/ehmicky/modern-errors#adding-plugins) to
[`modern-errors`](https://github.com/ehmicky/modern-errors).

```js
// `errors.js`
import modernErrors from 'modern-errors'
import modernErrorsSerialize from 'modern-errors-serialize'

export const AnyError = modernErrors([modernErrorsSerialize])
// ...
```

...

```js
const error = new InputError('Wrong file.', { props: { filePath } })
const errorObject = error.toJSON()
// { name: 'InputError', message: 'Wrong file', stack: '...', filePath: '...' }
const errorString = JSON.stringify(error)
// '{"name":"InputError",...}'
```

...

```js
const newErrorObject = JSON.parse(errorString)
const newError = AnyError.parse(newErrorObject)
// InputError: Wrong file.
//     at ...
//   filePath: '...'
```

# Install

```bash
npm install modern-errors-serialize
```

This package is an ES module and must be loaded using
[an `import` or `import()` statement](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c),
not `require()`.

# API

## modernErrorsSerialize

_Type_: `Plugin`

Plugin object to
[pass to `modernErrors()`](https://github.com/ehmicky/modern-errors#adding-plugins).

## error.toJSON()

_Return value_: `ErrorObject`

Converts errors to plain objects that are
[serializable](https://github.com/ehmicky/error-serializer#json-safety) to JSON
([or YAML](https://github.com/ehmicky/error-serializer#custom-serializationparsing),
etc.). It is
[automatically called](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#tojson_behavior)
by `JSON.stringify()`. All error properties
[are kept](https://github.com/ehmicky/error-serializer#additional-error-properties).

## AnyError.parse(errorObject)

`errorObject`: `ErrorObject`\
_Return value_: `ErrorInstance`

Converts an error plain object back to an identical error instance. The original
error class is preserved.

# Usage

## JSON safety

Error plain objects are always
[safe to serialize with JSON](https://github.com/ehmicky/safe-json-value).

```js
const error = new InputError('example')
error.cycle = error

// Cycles make `JSON.stringify()` throw, so they are removed
console.log(error.toJSON().cycle) // undefined
```

## Deep serialization/parsing

Objects and arrays are deeply serialized and parsed.

```js
const error = new InputError('Wrong file.')
const deepArray = [{}, { error }]

const jsonString = JSON.stringify(deepArray)
const newDeepArray = JSON.parse(jsonString)

const newError = AnyError.parse(newDeepArray)[1].error
// InputError: Wrong file.
//     at ...
```

## Custom serialization/parsing

Errors are converted to/from plain objects, not strings. This allows any
serialization/parsing logic to be performed.

```js
import { dump, load } from 'js-yaml'

const error = new InputError('example')
const errorObject = error.toJSON()
const errorYamlString = dump(errorObject)
// name: InputError
// message: example
// stack: InputError: example ...
const newErrorObject = load(errorYamlString)
const newError = AnyError.parse(newErrorObject) // InputError: example
```

## Additional error properties

```js
const error = new InputError('example', { props: { prop: true } })
const errorObject = error.toJSON()
console.log(errorObject.prop) // true
const newError = AnyError.parse(errorObject)
console.log(newError.prop) // true
```

## Aggregate `errors`

```js
const error = new InputError('four', {
  errors: [new InputError('one'), new InputError('two')],
})

const errorObject = error.toJSON()
// {
//   name: 'InputError',
//   message: 'four',
//   stack: '...',
//   errors: [{ name: 'InputError', message: 'one', stack: '...' }, ...],
// }
const newError = AnyError.parse(errorObject)
// InputError: four
//   [errors]: [InputError: one, InputError: two]
```

## Constructor's arguments

Error classes with a `custom` preserve any arguments passed to their
`constructor` providing those are both:

- Forwarded as is to `super()`
- JSON-serializable

<!-- eslint-disable fp/no-this, fp/no-mutation -->

```js
const InputError = AnyError.subclass('InputError', {
  custom: class extends AnyError {
    constructor(message, options, prop) {
      super(message, options, prop)
      this.prop = prop
    }
  },
})

const error = new InputError('example', {}, true)
const errorObject = error.toJSON()

// This calls `new InputError('example', {}, true)`
const newError = AnyError.parse(errorObject)
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
- [`modern-errors-stack`](https://github.com/ehmicky/modern-errors-stack): Clean
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
