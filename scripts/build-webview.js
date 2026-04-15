const webpack = require('webpack');
const path = require('path');

// Change to project root directory for proper module resolution
const projectRoot = path.resolve(__dirname, '..');
const config = require(path.resolve(projectRoot, 'webpack.config.js'));

const isWatch = process.argv.includes('--watch');

const compiler = webpack(config);

if (isWatch) {
  compiler.watch({}, (err, stats) => {
    if (err) {
      console.error('Webpack error:', err);
      return;
    }
    console.log('Webview built:', stats.toString({ colors: true }));
  });
} else {
  compiler.run((err, stats) => {
    if (err) {
      console.error('Webpack error:', err);
      process.exit(1);
    }
    if (stats.hasErrors()) {
      console.error('Build errors:', stats.toString());
      process.exit(1);
    }
    console.log('Webview built successfully!');
    compiler.close(() => {});
  });
}
