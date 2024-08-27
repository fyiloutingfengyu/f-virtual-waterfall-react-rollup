import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import eslint from '@rollup/plugin-eslint';
import { babel } from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';
import postcss from 'rollup-plugin-postcss';
import modules from 'postcss-modules';
import path from 'path';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

const isDev = process.env.NODE_ENV === 'development';

function setPlugins() {
  if (isDev) {
    return [
      serve({
        port: 8002
      }),
      livereload({
        watch: 'dist'
      })
    ];
  } else {
    return [
      terser()
    ];
  }
}

export default {
  input: 'src/index.tsx',
  output: [
    {
      file: 'dist/index.js',
      format: 'es'
    },
    {
      file: 'dist/index.min.js',
      format: 'es',
      plugins: [terser()]
    }
  ],
  plugins: [
    postcss({
      modules: true,
      extensions: ['.scss', '.css'],
      plugins: [
        modules({
          generateScopedName: '[name]_[local]_[hash:base64:5]'
        })
      ],
      // 将样式提取到 dist/main.css 文件中
      extract: path.resolve('dist/main.css'),
      minimize: true
    }),
    nodeResolve(),
    commonjs(),
    typescript(),
    json(),
    // eslint(),
    babel({
      babelHelpers: 'runtime'
    }),
    ...setPlugins()
  ],
  external: ['react', 'react-dom']
};


