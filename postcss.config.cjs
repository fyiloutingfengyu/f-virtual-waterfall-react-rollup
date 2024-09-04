module.exports = {
  plugins: {
    'postcss-px-to-viewport-8-plugin': {
      unitToConvert: 'px', // 需要转换的单位
      viewportWidth: file => {
        let width = 750;

        if (file.indexOf('antd-mobile') !== -1) {
          width = 375;
        }

        return width;
      },
      unitPrecision: 5, // 单位转换后保留的精度
      viewportUnit: 'vw', // 视口单位
      selectorBlackList: [], // 不会被转换的选择器列表
      minPixelValue: 1, // 大于1px的值才会被转换
      mediaQuery: true // 设置媒体查询里面的单位是否被转换
    },
    autoprefixer: {}
  }
};
