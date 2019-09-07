import * as path from 'path'
import * as HtmlWebpackPlugin from 'html-webpack-plugin'
import * as webpack from 'webpack'
import { readFileSync } from 'fs'
import * as Copy from 'copy-webpack-plugin'

const apps = ['actor', 'prep', 'control', 'grouped', 'screen']

module.exports = (env: 'PROD' | 'DEV'): webpack.Configuration => {
  const base: webpack.Configuration = {
    entry: apps.reduce(
      (acc, a) => ({
        ...acc,
        [a]: `./src/${a}/index.ts`
      }),
      {}
    ),
    output: {
      filename: '[name]/index.js',
      path: path.resolve('./build')
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          use: [{ loader: 'ts-loader' }],
          exclude: /node_modules/
        }
      ]
    },
    resolve: {
      extensions: ['.ts', '.js', '.tsx'],
      modules: [path.resolve('./src'), 'node_modules']
    },
    plugins: apps
      .map(
        a =>
          new HtmlWebpackPlugin({
            title: 'Cma - Zas',
            chunks: [a],
            meta: {
              viewport: 'width=device-width, initial-scale=1, user-scalable=no',
              'mobile-web-app-capable': 'yes'
            },
            filename: `${a}/index.html`
          })
      )
      .concat([
        new Copy([
          {
            from: path.resolve(__dirname, 'src/assets'),
            to: path.resolve(__dirname, 'build/assets')
          }
        ])
      ])
  }

  if (env === 'PROD') {
    return {
      ...base,
      mode: 'production'
    }
  } else if (env === 'DEV') {
    return {
      ...base,
      mode: 'development',
      devtool: false,
      devServer: {
        port: 3355,
        host: '0.0.0.0',
        https: {
          key: readFileSync(path.resolve(__dirname, 'cert/key.pem')),
          cert: readFileSync(path.resolve(__dirname, 'cert/cert.pem'))
        },
        writeToDisk: true
      }
    }
  } else {
    throw new Error(`UNSUPPORTED ENV: ${env}`)
  }
}
