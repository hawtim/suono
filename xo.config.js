module.exports = {
  space: 2,
  semicolon: false,
  globals: ['document'],
  rules: {
    '@typescript-eslint/lines-between-class-members': ['off'],
    '@typescript-eslint/object-curly-spacing': ['off'],
    '@typescript-eslint/member-delimiter-style': ['off']
  },
  ignore: ['types/index.d.ts', 'tests/**.*']
}
