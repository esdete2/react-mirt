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

const extensions = ['.js', '.jsx', '.ts', '.tsx'];

export default {
  input: ['./src/index.ts'],
  output: {
    dir: 'dist',
    format: 'cjs',
    sourcemap: true,
  },
  plugins: [
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
      declaration: true,
      declarationDir: 'dist',
    }),
    terser(),
    visualizer({
      filename: 'bundle-analysis.html',
      open: false,
    }),
  ],
  external: ['react', 'react-dom', 'classnames'],
};
