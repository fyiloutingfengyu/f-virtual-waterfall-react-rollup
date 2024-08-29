export default {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false // 默认值为“auto”,babel会根据目标环境决定是否对模块进行转译
      }
    ],
    '@babel/preset-react',
    '@babel/preset-typescript'
  ],
  plugins: [
    [
      '@babel/plugin-transform-runtime',
      {
        corejs: 3,
        helpers: true, // 使用从 @babel/runtime-corejs3库中导入辅助函数包来替代内联helpers
        regenerator: true, // 将generator函数转换为使用不污染全局作用的regenerator运行时
        useESModules: false // 是否使用ES模块语法生成的帮助函数
      },
    ],
    '@babel/plugin-transform-class-properties',
    '@babel/plugin-syntax-dynamic-import',
  ]
};
