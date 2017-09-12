const path = require('path')

const nodeExternals = require('webpack-node-externals')

const appDir = path.resolve(__dirname)

/*****
* We dont want webpack to transpile the built in node modules so we use target: 'node'
* We dont want webpack to transpile the stuff in node_modules folder, so we use the
* webpack-node-externals plugin
*/

const webpackOptions = {
  target: 'node', // in order to ignore built-in modules like path, fs, etc.
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
  externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
}

if(process.env.NODE_ENV === 'development' && process.env.nodeDebug === 'true'){
  webpackOptions.devtool = 'eval-source-map'
}

module.exports = webpackOptions