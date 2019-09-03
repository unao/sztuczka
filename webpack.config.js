// @ts-check
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = env => {
  const base = {
    entry: {
      actor: './src/actor/index.ts',
      prep: './src/prep/index.ts',
      control: './src/control/index.ts'
    },
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
    plugins: [
      new HtmlWebpackPlugin({
        title: 'Cma - Zas',
        chunks: ['actor'],
        meta: {
          viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no'
        },
        filename: `actor/index.html`
      }),
      new HtmlWebpackPlugin({
        title: 'Cma - Zas',
        chunks: ['prep'],
        filename: `prep/index.html`
      }),
      new HtmlWebpackPlugin({
        title: 'Cma - Zas',
        chunks: ['control'],
        filename: `control/index.html`
        // template: path.resolve('./src', 'control', 'index.tmpl.html')
      })
    ]
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
      devServer: {
        port: 3355,
        host: '0.0.0.0'
        // https: true
      }
    }
  } else {
    throw new Error(`UNSUPPORTED ENV: ${env}`)
  }
}
