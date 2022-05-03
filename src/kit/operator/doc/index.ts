import React from "react";
import { Kit } from "../..";
import { Block } from "../../../block";
import { MouseDragger } from "../../../common/dragger";
import { onAutoScroll, onAutoScrollStop } from "../../../common/scroll";
import { Point, Rect } from "../../../common/vector/point";


/**
 * 如果点在文档的空白处，那么左右上需要找到邻近的编辑点，如果是下面，一般是尾部，需要创建一个空白的文本块，且聚焦
 * 拖动时，形成一个选区，且滚动条适配拖选
 * 拖完时，判断是否有选区，弹一个文本编辑工具栏。
 * 
 * 注意：通过kit.page.grid.findBlocksByRect查找，最好在查找前同grid同步，
 * 否在编辑中，实际改变了元素的物理坐标，但没有同步到grid中
 * 
 */
export function DocDrag(kit: Kit, block: Block, event: React.MouseEvent) {
    kit.operator.onClearSelectBlocks();
    var downPoint = Point.from(event);
    var gm = block ? block.panelGridMap : kit.page.gridMap;
    MouseDragger({
        event,
        dis: 5,
        moveStart() {
            gm.buildGridMap();
            kit.selector.setStart(Point.from(event));
        },
        move(ev, data) {
            var movePoint = Point.from(ev)
            function cacSelector(dis: number) {
                downPoint.y -= dis;
                kit.selector.setStart(downPoint);
                kit.selector.setMove(movePoint);
                /***
               * 这里怎么基于当前界面的视觉不断的收集选中block
               */
                var bs = gm.findBlocksByRect(new Rect(downPoint, movePoint));
                kit.operator.onSelectBlocks(bs);
            };
            onAutoScroll({
                el: kit.page.root,
                point: movePoint,
                callback(fir, dis) {
                    if (fir) cacSelector(0)
                    else if (fir == false && dis != 0) cacSelector(dis);
                }
            })
        },
        async moveEnd(ev, isMove, data) {
            if (isMove) {
                onAutoScrollStop();
                kit.selector.close();
            }
            else {

            }
        }
    })


}