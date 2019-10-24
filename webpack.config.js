    const path = require('path');
    const nodeExternals = require('webpack-node-externals');
    const webpack = require('webpack');

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
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader'
        ],
      },      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
          }
          // other vue-loader options go here
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
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
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    },
    extensions: ['*', '.js', '.vue', '.json']
  },
  devServer: {
    historyApiFallback: true,
    noInfo: true,
    overlay: true
  },
  performance: {
    hints: false
  },
  devtool: '#eval-source-map'
/*
      module: {
        rules: [
          {
            test: /\.vue?$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: [
                  ['@babel/preset-env', {
                    targets: {
                      ie: '11',
                      edge: '15',
                      safari: '10',
                      firefox: '50',
                      chrome: '49',
                    },
                  }],
                  'babel-preset-vue',
                ],
              },
            },
          },
        ],
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
      ],
      devtool: 'source-map',
        */
    };

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
    new TerserPlugin(),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  ]);
}
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
