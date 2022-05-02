import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import scss from 'rollup-plugin-scss';
import visualizer from 'rollup-plugin-visualizer';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import del from 'rollup-plugin-delete';
import pkg from './package.json';

const extensions = ['.js', '.jsx', '.ts', '.tsx'];

export default {
  input: ['./src/index.ts'],
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: pkg.module,
      format: 'es',
      sourcemap: true,
    },
  ],
  plugins: [
    del({ targets: 'dist/*' }),
    scss({
      output: 'dist/css/react-mirt.css',
      watch: 'src/scss',
      failOnError: true,
      outputStyle: 'compressed',
      runtime: require('sass'),
      processor: () => postcss([autoprefixer()]),
    }),
    resolve({ extensions }),
    babel({
      exclude: 'node_modules/**',
      extensions,
    }),
    peerDepsExternal(),
    resolve(),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
    }),
    terser(),
    visualizer({
      filename: 'bundle-analysis.html',
      open: false,
    }),
  ],
  external: ['react', 'react-dom', 'classnames'],
};
