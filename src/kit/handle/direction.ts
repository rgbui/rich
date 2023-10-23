


import { Kit } from "..";
import { Block } from "../../block";
import { BlockUrlConstant } from "../../block/constant";
import { Point, Rect } from "../../common/vector/point";

export enum DropDirection {
    top,
    left,
    right,
    bottom,
    /**
     * 内部
     */
    inner,
    /**
     * 子方位
     */
    sub,
    /**
     * 叠加
     * 例如多张图片拖在一块，可以叠加成一个图片轮播块
     */
    overlay,
    none
}
/**
 * 处理过程
 * 1. dropBlock为空的时候 分左右两边
 *  a.左右两边，水平查找 
 *  c. 最终找到dropBlock,当然也有找不到的时候（例如文档的最底部）,这里默放拖到最底部的块
 * 2. dropBlock不为空的时候
 *  a. dropBlock为Row块，需要判断放到那row中那一列（因为row块正常是被填满的）
 *  b. dropBlock为col块，正常应该是全部填满的，如果有的话，在col块通过大致坐标在重新查找。找不到放在col块尾部
 *  c. dropBlock为view块，则进行查找内部
 *  d. dropBloc为isPart块时，先判断是否为isCell块，如果是isCell块，则判断是放在上面，还是下面，还是里面
 *  e. dropBlock为isPart块时，先查找组件父块，然后依据父块，判断放在什么位置
 *  f. dropBlock为card块时，需要判断是否为左边，右边，上边，还是下边，还是里面
 *  g. dropBlock为list块时，需要判断是否为sub块，上面块，下面块，
 *  h. dropBlock为block块时，上下好判断、主要是左右两边，如果处于col中，那么需要判断是否放在col的左侧，还是右侧
 * 处理思想：
 *  如果dropBlock为Row时，需要判断落在那一列
 *  如果dropBlock为view时，则查找内部
 *  如果dropBlock为cell,card,优先满足内部，如果不满足判断外面是否有col，有的话，水平左右
 *  左右先找父的col，
 * 3. 最终的dropBlock时，还要判断dragBlocks与dropBlock的情况
 *   a. dragBlocks子块中有dropBlock，这种不允许，会导致拖到自已内部去了
 *   b. dragBlocks里是否有一些特殊的块，不能拖到dropBlock中，
 *     例如模板按钮，里面的模板总不能放数据表格吧（好像放也没问题，反正引用的是链接）
 *   c. 卡片能否套嵌卡片
 *   
 * @param dragBlocks  将要拖放的元素
 * @param dropBlock  可以为空
 * @param event 鼠标事件
 * @returns 
 * 
 */
export function cacDragDirection(kit: Kit,dragBlocks: Block[],dropBlock: Block, event: MouseEvent) {
    var fr: 'left' | 'right' | 'bottom' | 'none' = 'none';
    var ele = event.target as HTMLElement;
    var point = Point.from(event);
    var oldDropBlock = dropBlock;
    var pb = dropBlock?.getVisiblePanelBound();
    if (!dropBlock?.isCell && (dropBlock?.isPanel || dropBlock?.isComposite) && pb?.contain(point)) {
        var bound = pb;
        dropBlock = undefined;
        /**
         * 这表示从左边开始查找，如果找到，说明方位在右边
         */
        dropBlock = kit.page.findXBlock(event, g => !g.isView && g.isAllowDrop && g !== oldDropBlock, 'left', bound);
        if (dropBlock) fr = 'right';
        if (!dropBlock) {
            dropBlock = kit.page.findXBlock(event, g => !g.isView && g.isAllowDrop && g !== oldDropBlock, 'right', bound);
            if (dropBlock) fr = 'left';
        }
        var innerBlock = oldDropBlock.getInnerPanelBlock();
        //console.log('gggg', dropBlock);
        if (!dropBlock) {
            if ((innerBlock && innerBlock.childs.length > 0))
                return {
                    direction: DropDirection.none,
                    dropBlock: undefined
                }
            else
                return {
                    direction: DropDirection.inner,
                    dropBlock: oldDropBlock
                }
        }
        /**
         * 这里需要通过dropBlock来重新计算一下fr，
         * 当前的fr也只是表示从那查找的方位，并不代表真实的方位
         */
        var bound = dropBlock.getVisibleContentBound();
        if (point.x < bound.left) {
            fr = 'left'
        }
        else if (point.x > bound.right) {
            fr = 'right'
        }
        else if (point.y <= bound.top + bound.height * 0.4) {
            fr = undefined;
        }
        else if (point.y > bound.top + bound.height * 0.4) {
            fr = 'bottom'
        }
    }
    else if (!dropBlock || dropBlock?.isView) {
        dropBlock = undefined;
        /**
         * 这表示从左边开始查找，如果找到，说明方位在右边
         */
        dropBlock = kit.page.findXBlock(event, g => !g.isView, 'left');
        if (dropBlock) fr = 'right';
        if (!dropBlock) {
            dropBlock = kit.page.findXBlock(event, g => !g.isView, 'right');
            if (dropBlock) fr = 'left';
        }
        if (!dropBlock) {
            return {
                direction: DropDirection.none,
                dropBlock: undefined
            }
        }
        // if (!dropBlock) {
        //     if (oldDropBlock?.isPanel) dropBlock = oldDropBlock.findReverse(g => g.isOnlyBlock)
        //     dropBlock = kit.page.getViewLastBlock();
        //     if (dropBlock) fr = 'bottom';
        // }
        /**
         * 这里需要通过dropBlock来重新计算一下fr，
         * 当前的fr也只是表示从那查找的方位，并不代表真实的方位
         */
        var bound = dropBlock.getVisibleContentBound();
        if (point.x < bound.left) {
            fr = 'left'
        }
        else if (point.x > bound.right) {
            fr = 'right'
        }
        else if (point.y <= bound.top + bound.height * 0.4) {
            fr = undefined;
        }
        else if (point.y > bound.top + bound.height * 0.4) {
            fr = 'bottom'
        }
    }
    console.log('finally', dropBlock, fr);
    var direction = DropDirection.none;
    var drs = dropBlock.canDropDirections();
    if (dropBlock && dropBlock.isAllowDrops(dragBlocks)) {
        if (dropBlock.isLine) dropBlock = dropBlock.closest(x => x.isBlock);
        var bound = dropBlock.getVisibleContentBound();
        /**
         * 如果块是行
         * 这里判断当前的是否处于row块中的对列的分割线sy-block-row-gap上面
         */
        if (dropBlock.isRow && !dropBlock.isPart) {
            var rowGap = ele.closest('.sy-block-row-gap') as HTMLElement;
            if (rowGap) {
                var index = parseFloat(rowGap.getAttribute('data-index'));
                var rc = Rect.fromEle(rowGap);
                if (rc.left + rc.width / 2 < point.x) {
                    direction = DropDirection.left;
                    dropBlock = dropBlock.childs[index];
                }
                else {
                    direction = DropDirection.right;
                    dropBlock = dropBlock.childs[index - 1];
                }
            }
            else {
                if (point.y <= bound.top + bound.height / 2)
                    direction = DropDirection.top;
                else if (point.y >= bound.top + bound.height / 2)
                    direction = DropDirection.bottom;
            }
            if (Array.isArray(drs) && drs.length > 0 && !drs.includes(direction)) {
                direction = DropDirection.none
            }
            return { direction: direction, dropBlock };
        }
        /**
         * 如果当前的dropBlock是一个格子，
         * 那么先判断是否为空格，如果是则拖到格子内部
         * 如果不是，理论上可以直接拖到格子里面的块上面、下面
         * 所以
         * 
         */
        if (dropBlock.isCell) {
            if (dropBlock.isEmptyCell) {
                return { direction: DropDirection.inner, dropBlock };
            }
            if (dropBlock.isPart)
                return { direction: DropDirection.inner, dropBlock };
        }
        /**
         * dropBlock是容器，如tab块
         */
        if (dropBlock.isPanel && bound.contain(point)) {
            /**
             * 这里只判断左右，
             * 上下不判断，主要是好拖放dropBlock
             */
        }
        /**
         * 普通的block
         */
        if (fr == 'left') {
            //dropBlock = getOutXBlock(dropBlock);
            direction = DropDirection.left;
        }
        else if (fr == 'right') {
            //dropBlock = getOutXBlock(dropBlock);
            direction = DropDirection.right;
        }
        else if (fr == 'bottom') {
            //dropBlock = getOutXBlock(dropBlock);
            direction = DropDirection.bottom;
        }
        else {
            if (point.x < bound.left) {
                direction = DropDirection.left;
                // dropBlock = getOutXBlock(dropBlock);
            }
            else if (point.x > bound.right) {
                direction = DropDirection.right;
                // dropBlock = getOutXBlock(dropBlock);
            }
            else if (point.y <= bound.top + bound.height * 0.4) {
                direction = DropDirection.top;
            }
            else if (point.y > bound.top + bound.height * 0.4) {
                if (dropBlock.hasSubChilds) {
                    direction = DropDirection.sub;
                    if (point.x - bound.left < 30) {
                        direction = DropDirection.bottom;
                    }
                }
                else direction = DropDirection.bottom;
            }
        }
    }
    if (dropBlock && !dropBlock.isAllowDrops(dragBlocks)) return { direction: DropDirection.none, dropBlock: undefined };
    if (Array.isArray(drs) && drs.length > 0 && !drs.includes(direction)) {
        direction = DropDirection.none
    }
    if (!dragBlocks.every(s => s.isCanDropHere(dropBlock))) {
        direction = DropDirection.none;
    }
    if ([
        DropDirection.left,
        DropDirection.right,
        DropDirection.top
    ].includes(direction) && dropBlock.url == BlockUrlConstant.Title) {
        return {
            direction: DropDirection.none,
            dropBlock: undefined
        }
    }
    return { direction: direction, dropBlock };
}

