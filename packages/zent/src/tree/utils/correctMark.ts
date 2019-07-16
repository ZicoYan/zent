import _union from 'lodash-es/union';

import { RootIdArray, IRootInfoMap } from './common';

/**
 * 用于向上向下查找关联节点
 */
export default function correctMark(
  markList: RootIdArray = [],
  rootInfoMap: IRootInfoMap,
  disabled: RootIdArray = [],
  isInit?: boolean
): RootIdArray {
  const nextMarkList = [];
  const markMap = {};

  // 向下查询
  markList.forEach(rootId => {
    if (!rootInfoMap[rootId]) {
      return;
    }

    // 包含所有子孙
    const rootIncludes = isInit
      ? rootInfoMap[rootId].includes
      : rootInfoMap[rootId].includes.filter(id => {
          return disabled.indexOf(id) === -1;
        });

    // 搜集所有相关的子孙节点
    nextMarkList.push(...rootIncludes);

    // 标记当前节点，用于向上查询
    markMap[rootId] = true;
  });

  // 向上查询
  markList.forEach(item => {
    if (!rootInfoMap[item]) {
      return;
    }

    let markParentId = rootInfoMap[item].parentId;

    while (markParentId) {
      //  父元素登记过, 则无需再向上查询
      if (markMap[markParentId]) {
        markParentId = null;
      } else {
        // 如果儿子被选中或则是禁用
        if (
          rootInfoMap[markParentId].son.every(
            id => markMap[id] || disabled.indexOf(id) > -1
          )
        ) {
          // 标记该节点
          markMap[markParentId] = true;
          // 继续探索
          markParentId = rootInfoMap[markParentId].parentId;
        } else {
          // 否则，止
          markParentId = null;
        }
      }
    }
  });

  // Object.keys.map for number id
  return _union(
    Object.keys(markMap).map(id => rootInfoMap[id].id),
    nextMarkList
  );
}
