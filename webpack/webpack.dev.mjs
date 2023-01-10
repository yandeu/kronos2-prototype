import HtmlWebpackPlugin from 'html-webpack-plugin'
import { resolve } from 'node:path'

export default {
  mode: 'development',
  entry: './src/index.ts',
  stats: 'minimal',
  output: {
    filename: 'bundle.js',
    path: resolve('www')
  },
  devServer: {
    static: {
      directory: resolve('static')
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader']
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  plugins: [new HtmlWebpackPlugin()],
  ignoreWarnings: [/Failed to parse source map/]
}
