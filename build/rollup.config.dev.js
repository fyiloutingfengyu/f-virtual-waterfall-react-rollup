import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import babel from '@rollup/plugin-babel';
import postcss from 'rollup-plugin-postcss';
import serve from 'rollup-plugin-serve';
import html from '@rollup/plugin-html';
import replace from '@rollup/plugin-replace';
import { readFileSync } from 'fs';
import path from 'path';
import fRollupClear from '../plugin/f-rollup-plugin-clear.js';

const templateHtml = readFileSync('./demo/template.html', 'utf8');

const config = {
  input: './demo/index.tsx',
  output: {
    name: 'demoBundle',
    file: './demo/dist/bundle.js',
    format: 'iife'
  },
  plugins: [
    fRollupClear({ outputDir: 'demo/dist' }),
    nodeResolve(),
    commonjs(),
    typescript({ tsconfig: './tsconfig.dev.json' }),
    babel({
      exclude: 'node_modules/**',
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      babelHelpers: 'runtime'
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify('development')
    }),
    html({
      fileName: 'index.html',
      template: () => templateHtml,
    }),
    postcss({
      // todo f 动态切换
      // modules: true,
      extract: path.resolve('demo/dist/common.css'),
    }),
    // todo f
    serve({
      open: false,
      openPage: 'index.html',
      contentBase: 'demo/dist/',
      port: 3008
    })
  ],
  watch: {
    include: [
      'src/**',
      'demo/**'
    ],
    exclude: 'node_modules/**'
  }
};

export default config;
