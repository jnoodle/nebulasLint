'use strict'
const fs = require("fs")
const path = require('path')
const utils = require('./utils')
const config = require('../config')
const vueLoaderConfig = require('./vue-loader.conf')

function resolve(dir) {
  return path.join(__dirname, '..', dir)
}

// Shim for `eslint/lib/load-rules.js`
const ESLINT_LOAD_RULES = `module.exports = () => ({
${
  fs.readdirSync("node_modules/eslint/lib/rules")
    .filter(filename => path.extname(filename) === ".js" && !filename.startsWith("_"))
    .map(filename => {
      const ruleId = path.basename(filename, ".js")
      return `    "${ruleId}": require("eslint/lib/rules/${filename}"),`
    })
    .join("\n")
  }
})
`

const createLintingRule = () => ({
  test: /\.(js|vue)$/,
  loader: 'eslint-loader',
  enforce: 'pre',
  include: [resolve('src'), resolve('test')],
  options: {
    formatter: require('eslint-friendly-formatter'),
    emitWarning: !config.dev.showEslintErrorsInOverlay
  }
})

module.exports = {
  context: path.resolve(__dirname, '../'),
  entry: {
    app: './src/main.js'
  },
  output: {
    path: config.build.assetsRoot,
    filename: '[name].js',
    publicPath: process.env.NODE_ENV === 'production'
      ? config.build.assetsPublicPath
      : config.dev.assetsPublicPath
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': resolve('src'),
    }
  },
  module: {
    rules: [
      ...(config.dev.useEslint ? [createLintingRule()] : []),
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueLoaderConfig
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src'), resolve('test'), resolve('node_modules/webpack-dev-server/client')]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('img/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('media/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
        }
      },
      // `eslint/lib/load-rules.js` depends on `fs` module we cannot use in browsers, so needs shimming.
      {
        test: new RegExp(`eslint\\${path.sep}lib\\${path.sep}load-rules\\.js$`),
        loader: "string-replace-loader",
        options: {
          search: "[\\s\\S]+", // whole file.
          replace: ESLINT_LOAD_RULES,
          flags: "g",
        },
      },
      // `eslint` has some dynamic `require(...)`.
      // Delete those.
      {
        test: new RegExp(`eslint\\${path.sep}lib\\${path.sep}(?:linter|rules)\\.js$`),
        loader: "string-replace-loader",
        options: {
          search: "(?:\\|\\||(\\())\\s*require\\(.+?\\)",
          replace: "$1",
          flags: "g",
        },
      },
      // Patch for `babel-eslint`
      {
        test: new RegExp(`babel-eslint\\${path.sep}lib\\${path.sep}index\\.js$`),
        loader: "string-replace-loader",
        options: {
          search: "[\\s\\S]+", // whole file.
          replace: "module.exports.parseForESLint = require(\"./parse-with-scope\")",
          flags: "g",
        },
      },
      // Patch for `babel-eslint`
      {
        test: new RegExp(`babel-eslint\\${path.sep}lib\\${path.sep}index\\.js$`),
        loader: "string-replace-loader",
        options: {
          search: "[\\s\\S]+", // whole file.
          replace: "module.exports.parseForESLint = require(\"./parse-with-scope\")",
          flags: "g",
        },
      },
      {
        test: new RegExp(`babel-eslint\\${path.sep}lib\\${path.sep}patch-eslint-scope\\.js$`),
        loader: "string-replace-loader",
        options: {
          search: "[\\s\\S]+", // whole file.
          replace: "module.exports = () => {}",
          flags: "g",
        },
      },
    ]
  },
  node: {
    // prevent webpack from injecting useless setImmediate polyfill because Vue
    // source contains it (although only uses it if it's native).
    setImmediate: false,
    // prevent webpack from injecting mocks to Node native modules
    // that does not make sense for the client
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  }
}
