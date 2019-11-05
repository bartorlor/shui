    const path = require('path');
    const nodeExternals = require('webpack-node-externals');
    const webpack = require('webpack');
    const VueLoaderPlugin = require('vue-loader/lib/plugin')
    const HtmlPlugin           = require('html-webpack-plugin');
    const MiniCSSExtractPlugin = require('mini-css-extract-plugin');
    const isDev                = process.env.NODE_ENV === 'development';

    const browserConfig = {
      mode: 'development',
      entry: { app: ['./browser/main.js'] },
      output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'public'),
        publicPath: '/',
      },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        exclude: /node_modules/
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
            'vue-style-loader',
            'css-loader',
        ],
      },
     {
      test: /\.styl(us)?$/,
      use: [
        'vue-style-loader',
        'css-loader',
        'stylus-loader'
      ],
     },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]'
        }
      }
    ]
  },
  optimization: {
    splitChunks: {
      name: 'vendor',
      chunks: 'all',
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      __isBrowser__: 'true',
    }),
    new VueLoaderPlugin(),
    new HtmlPlugin({ template: 'index.html', chunksSortMode: 'dependency' })
  ],
  devtool: 'source-map',
};
/*
if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#source-map'
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    //new webpack.optimize.UglifyJsPlugin({
      //sourceMap: true,
      //compress: {
        //warnings: false
      //}
    //}),
    // new TerserPlugin(),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  ]);
}
*/
    const serverConfig = {
      mode: 'development',
      entry: { server: ['./server/index.js'] },
      target: 'node',
      externals: [nodeExternals()],
      output: {
        filename: 'server.js',
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
              'babel-preset-vue',
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

module.exports = [browserConfig, serverConfig];
