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
    proxy: {
      '/api/**': {
        target: 'http://localhost:5000/',
        secure: false
      }
    },
    inline: true
  }
};
