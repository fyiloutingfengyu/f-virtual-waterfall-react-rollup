module.exports = {
  processors: [],
  plugins: ['stylelint-order'],
  extends: [
    'stylelint-config-standard',
    'stylelint-scss',
    'stylelint-config-css-modules'
  ],
  ignoreFiles: [
    'dist/**/*',
    'demo/dist/**/*'
  ],
  rules: {
    // 禁止在具有较高优先级的选择器后出现被其覆盖的较低优先级的选择器
    'no-descending-specificity': null,
    // 允许不使用属性的简写
    "declaration-block-no-redundant-longhand-properties": null,
    // 确保CSS中不会出现空的@import、@font-face、@keyframes等声明
    'no-empty-source': true,
    // 禁用对类选择器名称格式的校验
    'selector-class-pattern': null,
    // 禁用对ID选择器名称格式的校验
    'selector-id-pattern': null,
    // 禁用对未知的@规则进行校验
    'at-rule-no-unknown': null,
    'order/properties-order': [
      // 位置属性
      'position',
      'top',
      'right',
      'bottom',
      'left',
      'z-index',
      'display',
      'flex-direction',
      'flex-wrap',
      'flex-flow', // flex-direction 和 flex-wrap 的简写
      'justify-content',
      'align-items',
      'align-self',
      'align-content',
      'flex', // flex-grow, flex-shrink, flex-basis 的简写
      'flex-grow',
      'flex-shrink',
      'flex-basis',
      'float',
      'clear',
      'vertical-align',

      // 大小
      'box-sizing',
      'width',
      'height',
      'max-width',
      'max-height',
      'min-width',
      'min-height',
      'padding',
      'padding-top',
      'padding-right',
      'padding-bottom',
      'padding-left',
      'margin',
      'margin-top',
      'margin-right',
      'margin-bottom',
      'margin-left',

      // 文字相关
      'font',
      'font-family',
      'font-size',
      'font-style',
      'font-weight',
      'line-height',
      'color',
      'text-align',
      'text-decoration',
      'text-indent',
      'text-overflow',
      'text-transform', // 指定如何将元素的文本大写
      'letter-spacing',
      'word-spacing',
      'word-break',
      'white-space',
      'list-style',
      'list-style-type',
      'list-style-position',
      'list-style-image',

      // 背景
      'background',
      'background-attachment',
      'background-clip',
      'background-origin',
      'background-color',
      'background-image',
      'background-position',
      'background-repeat',
      'background-size',
      'border',
      'border-radius',
      'outline',

      // 其他
      'transform',
      'translate',
      'scale',
      'rotate',
      'transition',
      'animation',
      'content',
      'opacity',
      'filter',
      'overflow',
      'overflow-x',
      'overflow-y',
      'visibility',
      'pointer-events',
      'cursor'
    ]
  },
};
