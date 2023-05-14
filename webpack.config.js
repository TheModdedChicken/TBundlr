const path = require('path');

module.exports = {
  mode: "development",
  devtool: "inline-source-map",
  entry: {
    main: "./src/tbundlr.ts",
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: "tbundlr.js" // <--- Will be compiled to this single file
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    fallback: {
      "util": require.resolve("util/"),
      "path": false, // require.resolve("path-browserify")
      "fs": false, // Fixes "Module not found: Can't resolve 'fs'"
    }
  },
  module: {
    rules: [
      { 
        test: /\.tsx?$/,
        loader: "ts-loader"
      }
    ]
  }
};
