// https://github.com/avajs/ava/blob/HEAD/docs/06-configuration.md#avaconfigjs
export default {
  files: [
    'test/**/*',
    '!test/index.html'
  ],
  concurrency: 5,
  failFast: true,
  failWithoutAssertions: false,
  environmentVariables: {
    MY_ENVIRONMENT_VARIABLE: 'some value'
  },
  verbose: true,
  nodeArguments: [
    '--trace-deprecation',
    '--napi-modules'
  ]
}
