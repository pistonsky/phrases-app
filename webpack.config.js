const path = require('path')

module.exports = {
  resolve: {
    alias: {
      app: path.resolve(__dirname, 'app'),
      assets: path.resolve(__dirname, 'assets'),
    },
  },
}
