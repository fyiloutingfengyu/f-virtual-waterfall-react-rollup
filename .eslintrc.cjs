module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:prettier/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'prettier'
  ],
  rules: {
    // 项目中使用了TS,无需使用prop-types来对props进行校验
    'react/prop-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'prettier/prettier': ['error'], // prettier/prettier 作为最后一个规则来运行
  },
  settings: {
    react: {
      version: 'detect', // 自动检测 React 版本
    },
  },
  ignorePatterns: [
    '**/*.scss',
    '**/dist/'
  ]
};
