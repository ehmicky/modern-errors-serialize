import { getOptions, isOptions } from './options.js'
import { parse } from './parse.js'
import { serialize, toJSON } from './serialize.js'

export default {
  name: 'serialize',
  getOptions,
  isOptions,
  staticMethods: { serialize, parse },
  instanceMethods: { toJSON },
}
