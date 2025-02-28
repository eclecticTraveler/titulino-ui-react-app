const { version } = require('./package.json');

module.exports = {
  // other webpack config
  plugins: [
    new webpack.DefinePlugin({
      'process.env.VERSION': JSON.stringify(version),
    }),
  ],
};
