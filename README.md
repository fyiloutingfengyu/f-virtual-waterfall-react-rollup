# f-virtual-waterfall-react-rollup

## Installation
```
npm install f-virtual-waterfall-react-rollup --save
```
or 
```
yarn add f-virtual-waterfall-react-rollup
```

## Usage
```
import VirtualWaterfall from 'f-virtual-waterfall-react-rollup';
import 'f-virtual-waterfall-react-rollup/dist/main.css';
```

```
// 从后台获取数据
  const getList = (start: number) => {
    return new Promise(resolve => {
      // 模拟从后台接口获取的数据
      const demoData = [];
      resolve(demoData);
    });
  };
  
  <VirtualWaterfall
        loadingBoxHeight={100}
        getList={getList}
        loadingContent={() => (
          <div className={styles.loadingText}>加载中...</div>
        )}
  />
```
