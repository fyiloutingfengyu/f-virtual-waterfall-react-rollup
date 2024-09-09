import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { babel } from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';
import postcss from 'rollup-plugin-postcss';
import eslint from '@rollup/plugin-eslint';
import modules from 'postcss-modules';
import path from 'path';
// import fRollupClear from '../plugin/f-rollup-plugin-clear.js';
import fRollupClear from 'rollup-plugin-clear-f';

export default {
  input: 'src/index.tsx',
  output: [
    {
      file: 'dist/index.js',
      format: 'es',
    },
    /* {
       file: 'dist/index.min.js',
       format: 'es',
       plugins: [terser()]
     }*/
  ],
  plugins: [
    fRollupClear({ outputDir: 'dist' }),
    postcss({
      modules: true,
      extensions: ['.scss', '.css'],
      // 将样式提取到 dist/main.css 文件中
      extract: path.resolve('dist/main.css'),
      minimize: true,
      plugins: [
        // 加了这段代码后会生成 xxx.module.scss.json文件，
        /* modules({
           generateScopedName: '[name]_[local]_[hash:base64:5]'
         })*/
      ]
    }),
    nodeResolve(),
    commonjs(),
    typescript({ tsconfig: './tsconfig.prod.json' }),
    // json(),
    eslint(),
    babel({
      include: './src/**/*',
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      babelHelpers: 'runtime'
    }),
    terser()
  ],
  external: ['react', 'react-dom']
};


