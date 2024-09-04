import { FunctionType } from '../types/common';

/**
 * 获取数据类型
 * @param data
 */
export const getDataType = (data: any) => {
  const type = typeof data;

  if (data === null) {
    return 'null';
  } else if (type === 'object') {
    const typeStr = Object.prototype.toString.call(data);

    // '[object Number]'
    return typeStr.slice(8, -1).toLowerCase();
  }

  return type;
};

/**
 * px 转 vw
 * @param px
 */
export const pxToVW = (px: number) => {
  return `${px / (750 / 100)}vw`;
};

/**
 * @description 节流函数
 * 使用示例 throttle(test,200,true)(data),data为传递给test函数的参数，对应下面的args
 * @param callback
 * @param time
 * @param immediate
 */
export const throttle = (callback: FunctionType, time: number, immediate = false) => {
  if (immediate) {
    let prevTime = 0;

    return function (...args: any) {
      const nowTime = Date.now();

      if (nowTime - prevTime >= time) {
        callback.apply(this, args);
        prevTime = nowTime;
      }
    };
  } else {
    let timer: any = null;

    return function (...args: any) {
      if (!timer) {
        timer = setTimeout(() => {
          callback.apply(this, args);
          timer = null;
        }, time);
      }
    };
  }
};
