// https://gist.github.com/mihailo-misic/60cf87ec5f173252bd5ff6bfd4bcd1c8
const path = require('path');
const glob = require('glob');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const PurifyCSSPlugin = require('purifycss-webpack');
const OfflinePlugin = require('offline-plugin');

const isProd = process.env.NODE_ENV === 'prod';
const cssDev = ['style-loader', 'css-loader', 'sass-loader'];
const cssPro = ExtractTextPlugin.extract({
  publicPath: './',
  fallback: 'style-loader',
  use: [
    'css-loader',
    'postcss-loader',
    'sass-loader',
  ],
});
const cssConfig = isProd ? cssPro : cssDev;

module.exports = {
  entry: './src/js/main.js',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].bundle.js',
  },
  module: {
    rules: [
      // JS
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          }
        }
      },
      // CSS
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader',
        ],
      },
      // SCSS
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: cssConfig,
      },
      // IMAGES
      {
        test: /\.(jpe?g|png|svg|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name]-[hash:6].[ext]',
              outputPath: './img/',
              useRelativePath: true,
            }
          },
          'image-webpack-loader',
        ],
      },
      // BrowserConfig
      {
        test: /browserconfig.xml$/,
        loader: 'file-loader?name=browserconfig.xml!web-app-browserconfig-loader'
      },
      // Manifest
      {
        test: /manifest.json$/,
        loader: 'file-loader?name=manifest.json!web-app-manifest-loader'
      }
    ]
  },
  devServer: {
    contentBase: path.join(__dirname, '/dist'),
    watchContentBase: true,
    stats: 'errors-only',
    compress: true,
    port: 8080,
    hot: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Callder',
      template: './src/index.ejs',
      hash: true,
      minify: {
        collapseWhitespace: true,
        collapseInlineTagWhitespace: true,
        conservativeCollapse: true,
        decodeEntities: true,
        minifyCSS: true,
        minifyJS: true,
        minifyURLs: true,
        removeComments: true,
        sortAttributes: true,
        sortClassName: true,
      },
    }),
    new ExtractTextPlugin({
      filename: 'css/main.bundle.css',
      disable: !isProd, // should be !isProd but it removes required css.
      allChunks: true,
    }),
    new PurifyCSSPlugin({
      paths: glob.sync(path.join(__dirname, 'src/*.ejs')),
      minimize: true,
    }),
    new webpack.ProvidePlugin({
      '$': 'jquery',
      'window.$': 'jquery',
      'jQuery': 'jquery',
      'window.jQuery': 'jquery',
      'iziToast': 'iziToast',
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new OfflinePlugin(),
  ]
};