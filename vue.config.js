const path = require('path');
const isProduction = process.env.NODE_ENV === 'production';

function resolve(dir) {
  return path.join(__dirname, '', dir);
}

module.exports = {
  publicPath: isProduction ? "./" : "/",
  assetsDir: 'assets',
  filenameHashing: true,
  chainWebpack: config => {
    config.resolve.alias
      .set("@", resolve("src"))
  }
}