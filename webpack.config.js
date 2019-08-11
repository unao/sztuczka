// @ts-check
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = env => {
  const base = {
    entry: {
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
        chunks: ['prep'],
        filename: `prep/index.html`
        //  template: path.resolve('./src', 'prep', 'index.tmpl.html')
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
      }
    }
  } else {
    throw new Error(`UNSUPPORTED ENV: ${env}`)
  }
}
