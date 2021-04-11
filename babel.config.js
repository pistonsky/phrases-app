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
}
