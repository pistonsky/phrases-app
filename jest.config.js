module.exports = {
  preset: '@react-native/jest-preset',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFiles: ['<rootDir>/jest/setup.js'],
  // the first test also pays for transforming the app and its dependencies
  testTimeout: 30000,
  moduleNameMapper: {
    // app/utils/config.js holds the private endpoints and keys and isn't checked in
    'utils/config$': '<rootDir>/jest/config.js',
    // icon fonts are bundled as assets
    '\\.ttf$': '<rootDir>/jest/asset.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|@rneui|@react-native-vector-icons|@sbaiahmed1|@dr\\.pogodin|react-native-.*|react-redux|redux|redux-.*|@redux-saga|reselect|immer)/)',
  ],
}
