import colors from './colors'

test('palette tokens stay strings', () => {
  expect(colors.primary).toEqual(expect.any(String))
  expect(colors.secondary).toEqual(expect.any(String))
})
