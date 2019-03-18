const webpack = require('webpack');
const path = require('path');


const publicDist = path.resolve(__dirname, 'public');

module.exports = {
  entry: './src/index.js',
  mode: 'development',
  devServer: {
  	contentBase: publicDist,
  	compress: true,
  	port: 9000
  },
  output: {
    path: publicDist,
    filename: 'main.bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
  stats: {
    colors: true
  },
  devtool: 'source-map'
 };

