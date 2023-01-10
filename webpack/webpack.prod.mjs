import HtmlWebpackPlugin from 'html-webpack-plugin'
import WebpackObfuscator from 'webpack-obfuscator'
import { resolve } from 'node:path'

export default {
  mode: 'production',
  entry: './src/index.ts',
  stats: 'minimal',
  output: {
    filename: '[name].[chunkhash].bundle.js',
    path: resolve('www')
  },
  module: {
    rules: [
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
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          filename: '[name].[chunkhash].vendors.js'
        }
      }
    }
  },
  plugins: [
    new HtmlWebpackPlugin(),
    new WebpackObfuscator(
      {
        stringArray: true,
        rotateStringArray: true,
        stringArrayShuffle: true,
        stringArrayThreshold: 0.75
      },
      ['**.vendors.js']
    )
  ]
}
