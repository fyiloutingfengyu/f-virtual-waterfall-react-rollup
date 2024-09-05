/**
 * 上图下文瀑布流组件
 */
import React, { useRef, useState, useEffect } from 'react';
// import PropTypes from 'prop-types';
import { getDataType, pxToVW, throttle } from './utils/common';
import styles from './virtual-waterfall.module.scss';

interface ColumnHeightItem {
  index: number;
  height: number;
}

interface DomeDataItem {
  index: number;
  columnIndex: number;
  width: number;
  height: number;
  imgBoxHeight: number;
  left: number;
  top: number;
  text: string;
  textBoxHeight: number;
}

interface RenderMap {
  [key: string | number]: DomeDataItem;
}

// 按750设计稿下的尺寸和字体大小
const VirtualWaterfall = (
  {
    gapX = 16, // 两列水平方向的间距
    gapY = 16, // 两列垂直方向的间距
    pageSize = 20, // 每页请求回来的数据条数
    columnNumber = 2, // 展示的列数
    containerHeight = '100vh', // 外层包裹容器的高度
    containerTop = 0, // 外层包裹容器的top属性或margin-top的值
    containerPadding = 20, // 外层包裹容器的左右padding值
    textFont = '16px sans-serif', // 文本的字体
    loadingBoxHeight = 60, // 底部加载中盒子高度
    // 传入的值需要和样式文件中的值保持一致
    textBoxParams = {
      paddingLeft: 10,
      paddingRight: 10,
      marginTop: 10,
      marginBottom: 10,
      lineHeight: 24,
      maxRows: 2
    },
    // 每一项的样式, 这里默认值如果是非空对象TS会报类型错误
    waterfallItemStyle = {},
    // 获取数据的方法
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getList = (startIndex: number) => {
      return new Promise(resolve => {
        resolve([]);
      });
    },
    // 要渲染的内容
    renderItemContent = (item: DomeDataItem) => {
      return <>
        <div
          className={styles.imgBox}
          style={
            {
              height: pxToVW(item.imgBoxHeight)
            }
          }
        >
          <span className={styles.idx}>{item.index}</span>
        </div>
        <div className={`${styles.textBox} ${styles.multiEllipsisL2}`}>{item.text}</div>
      </>;
    },
    // 加载中样式展示
    loadingContent = () => {
      return (
        <div className={styles.loadingText}>加载中...</div>
      );
    }
  }
) => {
  const designWidth = 750;
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  // 当前渲染的页码，从1开始
  const page = useRef(1);
  const hasNextPage = useRef(true);
  // 每列的宽度
  const columnWidth = useRef(0);
  // 对后台数据进行处理后的数据，增加了定位信息,存放总的数据
  const domDataList = useRef<DomeDataItem[]>([]);
  // 每列的高度列表
  const columnHeightList = useRef<ColumnHeightItem[]>([]);
  // 存放当前被渲染出来的元素
  const renderMap = useRef<RenderMap>({});
  // 更新页面视图的渲染列表,有renderMap的values组成的数组
  const [renderList, setRenderList] = useState<DomeDataItem[]>([]);
  // 当前被渲染出来的元素的开头位置的下标
  const startIndex = useRef(0);
  // 当前被渲染出来的元素的结尾位置的下标
  const endIndex = useRef(0);
  // 上下各展示半屏的余量
  const containerOffset = window.innerHeight / 2;
  // 是否正在加载下一页数据
  const isLoadingNextPage = useRef(false);
  const [isShowLoading, setIsShowLoading] = useState(false);
  // 页面滚动方向，向下为1 (页面底部追加数据 ↓，滚动条向下移动)，向上为 -1（页面顶部追加数据 ↑，滚动条向上移动）
  const scrollDirection = useRef(1);
  // 上次滚动距离Y
  const lastScrollNumY = useRef(0);
  const canvas = document.createElement('canvas');
  const getTextBoxHeightCtx = canvas.getContext('2d');

  if (getTextBoxHeightCtx) {
    getTextBoxHeightCtx.font = textFont;
  }

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    const containerDom = containerRef.current;

    if (containerDom) {
      containerDom.addEventListener('scroll', handleScroll);

      return () => {
        containerDom.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  // 初始化数据
  const init = async () => {
    // 获取列表数据
    const list: any = await getList((page.current - 1) * pageSize);

    if (getDataType(list) === 'array') {
      hasNextPage.current = !!list.length;
    }
    // 计算每列的宽度
    computedColumnWidth();
    // 重置每列高度
    resetColumnHeightList();
    // 给后台返回的数据设置位置信息
    computedDomData(list);
    // 渲染元素节点
    renderDomByDataList();
  };

  // 设置每列的宽度
  const computedColumnWidth = () => {
    const allGapWidth = gapX * (columnNumber - 1);

    columnWidth.current = (designWidth - allGapWidth - containerPadding * 2) / columnNumber;
  };

  // 重置每列高度列表
  const resetColumnHeightList = () => {
    const tempList: ColumnHeightItem[] = [];

    for (let i = 0; i < columnNumber; i++) {
      tempList.push({
        index: i + 1,
        height: 0
      });
    }

    columnHeightList.current = tempList;
  };

  // 设置瀑布流内容容器的高度
  const setContentHeight = () => {
    columnHeightList.current.sort((a, b) => a.height - b.height);

    if (contentRef.current) {
      // 瀑布流列表区域的高度为最高的列的高度
      contentRef.current.style.height = pxToVW(columnHeightList.current[columnHeightList.current.length - 1].height + loadingBoxHeight);
    }
  };

  // 对后台请求回来的数据进行处理，生成带位置信息的数据
  const computedDomData = (list: any[], startRenderIndex = 0) => {
    const tempDomDataList: DomeDataItem[] = [];

    for (let i = 0, len = list.length; i < len; i++) {
      const imgHeight = Math.ceil(columnWidth.current * list[i].h / list[i].w);

      const item = {
        // 是下标也是唯一标识，可以用作ID
        index: startRenderIndex + i,
        columnIndex: 0,
        width: columnWidth.current,
        // 后台返回的数据中需要包含图片的宽高信息（h和w）
        // 根据后台返回的图片的宽高比计算实际展示的高度
        height: imgHeight,
        imgBoxHeight: imgHeight,
        left: 0,
        top: 0,
        text: list[i].text,
        textBoxHeight: textBoxParams.lineHeight + textBoxParams.marginTop + textBoxParams.marginBottom
      };

      // 将当前数据放入高度最短的列
      columnHeightList.current.sort((a, b) => a.height - b.height);

      item.columnIndex = columnHeightList.current[0].index;
      item.left = (item.columnIndex - 1) * (gapX + columnWidth.current);
      item.top = columnHeightList.current[0].height;

      let textWidth = 0;

      if (getTextBoxHeightCtx) {
        textWidth = getTextBoxHeightCtx.measureText(item.text).width;
      }

      const rows = Math.ceil((textWidth + textBoxParams.paddingLeft + textBoxParams.paddingRight) / columnWidth.current);

      if (rows >= textBoxParams.maxRows) {
        item.textBoxHeight = item.textBoxHeight + textBoxParams.lineHeight * (textBoxParams.maxRows - 1);
      }

      item.height += item.textBoxHeight;

      columnHeightList.current[0].height += item.height + gapY;

      tempDomDataList.push(item);
    }

    domDataList.current = domDataList.current.concat(tempDomDataList);
    // 每次追加完数据后，更新瀑布流容器的高度
    setContentHeight();
  };

  // 将750设计稿对应的尺寸转为当前容器视口下的大小
  const getSizeByViewport = (size: number) => {
    let containerWidth = 375;

    if (containerRef.current) {
      containerWidth = containerRef.current.offsetWidth;
    }

    return containerWidth / (designWidth / size);
  };

  // 获取当前元素的边界信息
  const getBoundaryInfo = (item: DomeDataItem) => {
    const { top, height } = item;
    const newContainerOffset = getSizeByViewport(containerOffset);

    // 当前元素的底部的位置
    const y = getSizeByViewport(top + height + containerTop);

    let topLine = -newContainerOffset;
    let bottomLine = newContainerOffset;

    if (containerRef.current) {
      // 向上扩展半屏
      topLine = containerRef.current.scrollTop - newContainerOffset;

      // 向下扩展半屏
      bottomLine = containerRef.current.scrollTop + containerRef.current.offsetHeight + newContainerOffset;
    }

    // 是否在上线之上
    const isOverTopLine = topLine > y;

    // 是否在下线之下
    const isUnderBottomLine = getSizeByViewport(top) > bottomLine;

    return {
      isOverTopLine,
      isUnderBottomLine
    };
  };

  // 渲染每一个模块
  const renderItem = (item: DomeDataItem) => {
    return (
      <div
        className={styles.waterfallItem}
        id={`item_${item.index}`}
        key={item.index}
        style={
          {
            width: pxToVW(item.width),
            height: pxToVW(item.height),
            transform: `translate(${pxToVW(item.left)}, ${pxToVW(item.top)})`,
            ...waterfallItemStyle
          }
        }
      >
        {
          renderItemContent(item)
        }
      </div>
    );
  };

  // 根据处理后的数据渲染列表
  const renderDomByDataList = (startRenderIndex = 0) => {
    if (!domDataList.current.length) return;

    const tempRenderMap: RenderMap = {};

    // 渲染上线边界之间的元素
    // 从当前渲染出来的元素的起始位置开始遍历，直到总数据的结尾
    for (let i = startRenderIndex, len = domDataList.current.length; i < len; i++) {
      const { index } = domDataList.current[i];
      const { isOverTopLine, isUnderBottomLine } = getBoundaryInfo(domDataList.current[i]);

      // 移除渲染区域之外的元素,并跳出本次循环
      if (isOverTopLine) {
        delete renderMap.current[i];
        continue;
      }

      // 遇到第一个在渲染下线之下的元素时，停止循环
      if (isUnderBottomLine) {
        delete renderMap.current[i];
        break;
      }

      tempRenderMap[index] = domDataList.current[i];
    }

    // 初始化或追加数据的时候，将本次符合渲染条件的数据追加到渲染列表中
    Object.assign(renderMap.current, tempRenderMap);

    const keys = Object.keys(renderMap.current);

    startIndex.current = +keys[0];
    endIndex.current = +keys[keys.length - 1];

    if (renderMap.current) {
      // todo f
      setRenderList(Object.values(renderMap.current));
    }
  };

  // 处理容器滚动事件
  const handleScroll = throttle(async () => {
    let scrollTop = 0;
    let offsetHeight = 0;

    if (containerRef.current) {
      scrollTop = containerRef.current.scrollTop;
      offsetHeight = containerRef.current.offsetHeight;
    }

    scrollDirection.current = scrollTop - lastScrollNumY.current > 0 ? 1 : -1;
    lastScrollNumY.current = scrollTop;

    updateDomPosition(scrollDirection.current);

    if (isLoadingNextPage.current || !hasNextPage.current) return;

    // 当已经展示出来的内容高度大于当前数据内容总高度的85%的时候开始加载新数据
    if (scrollTop + offsetHeight >= offsetHeight * 0.85) {
      isLoadingNextPage.current = true;
      setIsShowLoading(true);

      // page 加1，获取下一页数据
      page.current += 1;

      // todo f
      let list: any = [];

      try {
        list = await getList((page.current - 1) * pageSize);
        if (getDataType(list) === 'array') {
          hasNextPage.current = !!list.length;
        }
      } catch (err) {
        console.log(err);
        isLoadingNextPage.current = false;
        setIsShowLoading(false);
      }

      isLoadingNextPage.current = false;
      setIsShowLoading(false);
      // 处理下一页数据，从下一页数据的开始位置的下标开始操作数据
      const startIdx = (page.current - 1) * pageSize;
      // 给当前请求回来的数据添加位置信息
      computedDomData(list, startIdx);
      // 渲染当次请求回来的数据
      renderDomByDataList(startIdx);
    }
  }, 150);

  // 页面滚动时，更新渲染的数据列表
  const updateDomPosition = (direction: number) => {
    const tempRenderMap: RenderMap = {};

    // 检查现有列表中的元素，不在渲染区域内的元素删除,渲染区域内的保留
    for (let i = startIndex.current; i <= endIndex.current; i++) {
      const { isOverTopLine, isUnderBottomLine } = getBoundaryInfo(domDataList.current[i]);

      if (isOverTopLine || isUnderBottomLine) {
        continue;
      }

      tempRenderMap[i] = domDataList.current[i];
    }

    // 向上 ↑（滚动条向上移动）
    if (direction < 0) {
      // 从现有渲染列表第一个元素的上一个元素依次取新元素，对符合条件的元素进行渲染
      for (let j = startIndex.current - 1; j >= 0; j--) {
        const { isOverTopLine } = getBoundaryInfo(domDataList.current[j]);

        // 遇到第一个在上线之上的元素，则停止渲染新数据
        if (isOverTopLine) break;

        tempRenderMap[j] = domDataList.current[j];
      }
    } else {
      // 向下（滚动条向下移动）
      // 从现有列表最后一个元素的下一个元素依次取新元素，对符合条件的元素进行渲染
      for (let k = endIndex.current + 1; k < domDataList.current.length; k++) {
        const { isUnderBottomLine } = getBoundaryInfo(domDataList.current[k]);
        // 遇到第一个在下线之下的元素，则停止渲染新数据
        if (isUnderBottomLine) break;

        tempRenderMap[k] = domDataList.current[k];
      }
    }

    // 使用新的渲染列表替换旧的渲染列表
    renderMap.current = tempRenderMap;

    // 数字字符串类型的key值，会按从小到大的顺序排列
    const keys = Object.keys(renderMap.current);

    startIndex.current = +keys[0];
    endIndex.current = +keys[keys.length - 1];

    if (renderMap.current) {
      setRenderList(Object.values(renderMap.current));
    }
  };

  return (
    <div
      ref={containerRef}
      className={styles.waterFallContainer}
      style={
        {
          height: containerHeight,
          padding: `0 ${pxToVW(containerPadding)}`
        }
      }
    >
      <div
        ref={contentRef}
        className={styles.contentBox}
      >
        {
          renderList.map(item => {
            return (
              renderItem(item)
            );
          })
        }
      </div>
      {
        isShowLoading ?
          loadingContent()
          :
          null
      }
    </div>
  );
};

/*VirtualWaterfall.prototype = {
  gapX: PropTypes.number,
  gapY: PropTypes.number,
  pageSize: PropTypes.number,
  columnNumber: PropTypes.number,
  containerHeight: PropTypes.string,
  containerTop: PropTypes.number,
  containerPadding: PropTypes.number,
  textFont: PropTypes.string,
  loadingBoxHeight: PropTypes.number,
  textBoxParams: PropTypes.object,
  waterfallItemStyle: PropTypes.object,
  renderContent: PropTypes.func,
  getList: PropTypes.func
};*/

export default VirtualWaterfall;


