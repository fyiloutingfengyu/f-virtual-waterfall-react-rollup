import React from 'react';
// 预览调试打包前的源码需要把 rollup.config.dev.js中的 postcss modules设置为true
// 使用 yarn dev 命令来构建项目
import VirtualWaterfall from '../src/index';

// 测试打包后的组件用下面的, postcss modules设置为false
// 使用 yarn dev-dist 命令来构建项目
// import VirtualWaterfall from '../dist/index';
// import '../dist/main.css';

import { testData } from './test/data';
import styles from './index.module.scss';

function App() {
  const pageSize = 20;

  // todo f 临时测试增加测试数据
  const testData1 = [...testData, ...testData, ...testData, ...testData];

  // 模拟从后台获取数据
  const getList = (start: number) => {
    // 这里是模拟数据请求，需要改成真实的从后台接口获取数据
    return new Promise((resolve) => {
      const nextList = testData1.slice(start, start + pageSize);

      // 模拟接口返回，第一页直接返回，后面页面延迟返回
      setTimeout(
        () => {
          resolve(nextList);
        },
        start === 0 ? 0 : 1000
      );
    });
  };

  return (
    <div className={styles.appBaseLayout}>
      <VirtualWaterfall
        loadingBoxHeight={100}
        getList={getList}
        loadingContent={() => (
          <div className={styles.loadingText}>加载中...</div>
        )}
      />
    </div>
  );
}

export default App;
