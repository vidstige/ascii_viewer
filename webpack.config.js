const path = require("path");

module.exports = {
  entry: {
    bundle: ["./index.js"]
  },
  output: {
    path: path.resolve(__dirname, "build"),
    publicPath: "/build/",
    filename: "[name].js"
  },
  devServer: {
    watchOptions: {
      ignored: "/node_modules/"
    },
    inline: true
  }
};
