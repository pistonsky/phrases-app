module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        alias: {
          app: './app',
          assets: './assets',
        },
      },
    ],
    '@babel/plugin-transform-runtime',
  ],
  overrides: [
    {
      test: /\.ts$/,
      plugins: [['@babel/plugin-transform-typescript', { isTSX: false }]],
    },
    {
      test: /\.tsx$/,
      plugins: [['@babel/plugin-transform-typescript', { isTSX: true }]],
    },
  ],
}
