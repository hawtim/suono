module.exports = {
  space: 2,
  semicolon: false,
  globals: ['document'],
  rules: {
    '@typescript-eslint/lines-between-class-members': ['off'],
    '@typescript-eslint/object-curly-spacing': ['off'],
    '@typescript-eslint/member-delimiter-style': ['off'],
    'object-curly-spacing': ['off'],
    'padding-line-between-statements': ['off']
  },
  ignore: ['types/index.d.ts', 'test/**.*']
}
