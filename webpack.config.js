const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const WasmPackPlugin = require('@wasm-tool/wasm-pack-plugin')

const dist = path.resolve(__dirname, 'dist')

module.exports = {
  // webpack will take the files from ./src/index
  entry: './www/index',

  // and output it into /dist as bundle.js
  output: {
    path: dist,
    filename: '[name].js'
  },
  devServer: {
    contentBase: dist
  },
  // adding .ts and .tsx to resolve.extensions will help babel look for .ts and .tsx files to transpile
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    rules: [
      // we use babel-loader to load our jsx and tsx files
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.(glsl|vs|fs|vert|frag)$/,
        exclude: /node_modules/,
        use: ['raw-loader']
      }
      /*,

      // css-loader to bundle all the css files into one file and style-loader to add all the styles  inside the style tag of the document
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
      */
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './www/index.html'
    }),
    new CopyPlugin([
      {
        context: __dirname + '/www',
        from: '*.css',
        to: __dirname + '/dist'
      }
    ]),
    new WasmPackPlugin({
      crateDirectory: __dirname,
      outName: 'index',
      forceMode: 'production'
    })
  ]
}
