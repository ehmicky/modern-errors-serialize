import { getOptions } from './options.js'
import { parse } from './parse.js'
import { serialize } from './serialize.js'

export default {
  name: 'serialize',
  getOptions,
  staticMethods: { serialize, parse },
  instanceMethods: { toJSON: serialize },
}
