const webpack = require("webpack");
const path = require("path");
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");
const minimize = process.argv.indexOf("--minimize");
console.log("minimize: " + minimize);

const config = {
  entry: __dirname + "/src/cacheautocomplete.ts",
  devtool: "source-map",
  output: {
    path: __dirname + "/dist",
    filename: "cacheautocomplete.js",
    library: "cacheautocomplete",
    libraryTarget: "umd"
    // umdNamedDefine: true
  },

  //// Currently we need to add '.ts' to the resolve.extensions array.
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"]
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "awesome-typescript-loader"
      }
    ]
  },

  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        drop_console: true
      }
    }),
    // new webpack.HotModuleReplacementPlugin()
  ],

  devServer: {
    contentBase: path.join(__dirname, "demo"),
    compress: true,
    port: 9000,
    hot: true,
    overlay: true,
    publicPath: "/dist/" /* '/dist/' */
  }
};

module.exports = config;
