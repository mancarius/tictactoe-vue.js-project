module.exports = {

  devServer: {
    port: 8080,
    https: true,
  },

  configureWebpack: {
    module: {
      rules: [{
          test: /\.worker\.(c|m)?js$/i,
          use: [{
              loader: "worker-loader",
              options: {
                filename: "[name].js",
                chunkFilename: "[id].js"
              },
            },
            {
              loader: "babel-loader",
              options: {
                presets: ["@babel/preset-env"],
              },
            },
          ],
        },
      ],
    },
  },

  pluginOptions: {
    quasar: {
      importStrategy: 'kebab',
      rtlSupport: false
    }
  },

  transpileDependencies: [
    'quasar'
  ]
};
