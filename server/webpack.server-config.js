const path = require('path');
const nodeExternals = require('webpack-node-externals');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  entry: { server: ['./src/index.js'] },
  target: 'node',
  externals: [nodeExternals()],
  output: {
    filename: 'server.bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: { node: '8' },
              }],
            ],
          },
        },
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      __isBrowser__: 'false',
    }),
  ],
  devtool: 'source-map',
};
