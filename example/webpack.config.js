require('babel-register');
var path = require('path');
var glob = require('glob');
var webpack = require('webpack');
var BundleTracker = require('webpack-bundle-tracker');


var entry_points = {
  common: [
    'babel-polyfill',
    'jquery', 'react', 'react-dom',
    'react-cookie', 'react-redux',
    'redux', 'redux-actions', 'redux-logger',
    'ws',
  ],
};

glob.sync('**/static/**/js/apps/*.js')
.forEach(function(_path) {
  var filename = _path.split('/').slice(-1)[0];
  if (filename.endsWith('.js') || filename.endsWith('.jsx')) {
    entry_points[filename.split('.')[0]] = path.resolve(_path.split('.').slice(0, -1).join('.'));
  } });

process.stdout.write('Entry points: ' + JSON.stringify(entry_points) + '\n');

var config = {
  context: __dirname,
  entry: entry_points,
  output: {
    path: path.resolve('./staticfiles/static/webpack_bundles/'),
    filename: process.env.NODE_ENV === 'production' ? '[name]-[hash].js' : '[name].bundle.js',
  },
  resolve: {
    modulesDirectories: [
      'node_modules',
    ],
    extensions: ['', '.js', '.jsx', '.json'],
  },
  node: {
    fs: 'empty',
    tls: 'empty'
  },
  module: {
    preLoaders: [
      { test: /\.json$/, loader: 'json'},
      { test: /\.md$/, loader: 'html!markdown'},
      { test: /\.js$/, loader: 'eslint', exclude: /node_modules/},
      { test: /\.jsx$/, loader: 'eslint', exclude: /node_modules/},
    ],
    loaders: [
      {
        test: /\.js[x]?$/,
        include: [path.resolve(__dirname, 'myapp', 'static', 'myapp', 'js')],
        exclude: /(node_modules|bower_components)/,
        loader: 'babel'
      }
    ],
    noParse: [/\.min\.js/, /\.md/],
  },
  eslint: {
    emitWarning: true,
  },
}

if (process.env.NODE_ENV === 'production') {
  config.output.filename = "[name]-[hash].js";
  config.plugins = [
    new webpack.DefinePlugin({
        'process.env.NODE_ENV': '"production"'
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      minChunks: 3,
      name: 'common',
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
      },
    }),
  ];
} else {
  config.output.filename = '[name].bundle.js';
  config.devtool = 'cheap-eval-inline-source-map';
  config.plugins = [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"development"',
    }),
    new webpack.optimize.CommonsChunkPlugin({
      minChunks: 3,
      name: 'common',
    })
  ];
}

config.plugins.push(new BundleTracker({ filename: './webpack-stats.json' }))
module.exports = config;
