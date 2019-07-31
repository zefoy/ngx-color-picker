import sourcemaps from 'rollup-plugin-sourcemaps';

const pkg = require('../package.json');

const names = pkg.name.match(/([a-z-]+)/g);
const name = names[names.length -1];

export default {
  input: `./dist/${name}.js`,
  output: {
    file: `${pkg.module}`,
    format: 'es',
    sourcemap: true
  },
  plugins: [
    sourcemaps()
  ]
}
