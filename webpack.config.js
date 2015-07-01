module.exports = {
  output: {
    filename: '[name].js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.coffee$/,
        exclude: /node_modules/,
        loader: 'babel-loader!coffee-loader'
      }
    ]
  }
}
