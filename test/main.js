import test from 'ava'
import modernErrorsSerialize from 'modern-errors-serialize'

test('Dummy test', (t) => {
  t.true(modernErrorsSerialize(true))
})
