const path = require('path')

const nodeExternals = require('webpack-node-externals')

const appDir = path.resolve(__dirname)

/*****
* We dont want webpack to transpile the built in node modules so we use target: 'node'.
* We also need to tell it not include polyfills or mocks for various node stuff, which we set with 
* the 'node' key http://webpack.github.io/docs/configuration.html#node
* We also dont want webpack to transpile the stuff in node_modules folder, so we use the
* webpack-node-externals plugin.
*/

const webpackOptions = {
  target: 'node',
  node: {
    console: false,
    global: false,
    process: false,
    Buffer: false,
    __filename: false,
    __dirname: false,
    setImmediate: false
  },
  entry: './index.lsc.js',
  output: {
    filename: 'index-compiled.js',
    path: appDir
  },
  context: appDir,
  module: {
    rules: [
      {
        test: /.(lsc|jsx?)/,
        exclude: [
          /(node_modules)/
        ],
        loader: 'babel-loader'
      },
      { 
        test: /\.json$/, 
        loader: 'json-loader' 
      }
    ]
  },
  externals: [nodeExternals()],
}

if(process.env.NODE_ENV === 'development' && process.env.nodeDebug === 'true'){
  webpackOptions.devtool = 'eval-source-map'
}

module.exports = webpackOptions