import React from "react";
import { Kit } from "../..";
import { Block } from "../../../block";
import { findBlockNearAppearByPoint } from "../../../block/appear/visible.seek";
import { MouseDragger } from "../../../common/dragger";
import { onAutoScroll, onAutoScrollStop } from "../../../common/scroll";
import { Point, Rect } from "../../../common/vector/point";
import { PageLayoutType } from "../../../page/declare";
import { BlockUrlConstant } from "../../../block/constant";
import lodash from "lodash";
import { CheckBoardSelector } from "../../board.selector/selector";

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

    console.log('doc drag...');

    /**
   * 先判断toolBoard工具栏有没有被使用，
   * 如果有使用，则根据工具栏来进行下一步操作
   */
    if (kit.boardSelector.isSelector && block) {
        CheckBoardSelector(kit, block, event);
        return;
    }
    else kit.boardSelector.close()

    kit.anchorCursor.renderSelectBlocks([]);
    var downPoint = Point.from(event);
    var gm = block ? block.panelGridMap : kit.page.gridMap;
    var currentBlocks: Block[];
    var scrollDiv = block?.panel ? block.panel.getScrollDiv() : kit.page.getScrollDiv();
    MouseDragger({
        event,
        dis: 5,
        moveStart() {
            gm.start();
            kit.anchorCursor.selector.setStart(Point.from(event));
        },
        move(ev, data) {
            var movePoint = Point.from(ev)
            function cacSelector(dis: number) {
                downPoint.y -= dis;
                gm.relativePanelPoint.y -= dis;
                kit.anchorCursor.selector.setStart(downPoint);
                kit.anchorCursor.selector.setMove(movePoint);
                /***
               * 这里怎么基于当前界面的视觉不断的收集选中block
               */
                var bs = gm.findBlocksByRect(new Rect(downPoint, movePoint));
                currentBlocks = kit.page.getAtomBlocks(bs);
                lodash.remove(currentBlocks, g => g.url == BlockUrlConstant.Title)
                kit.anchorCursor.renderSelectBlocks(currentBlocks);
            };
            if (scrollDiv)
                onAutoScroll({
                    el: scrollDiv,
                    point: movePoint,
                    feelDis: 100,
                    interval: 50,
                    dis: 30,
                    callback(fir, dis) {
                        if (fir) cacSelector(0)
                        else if (fir == false && dis != 0) cacSelector(dis);
                    }
                })
        },
        async moveEnd(ev, isMove, data) {
            gm.over();
            if (isMove) {
                onAutoScrollStop();
                kit.anchorCursor.selector.close();
                if (currentBlocks) kit.anchorCursor.onSelectBlocks(currentBlocks, { render: true });
            }
            else {
                if (block) {
                    if (!block.isLayout) {
                        var a = findBlockNearAppearByPoint(block, Point.from(ev));
                        window.shyLog('mouse up appear', a)
                        if (a) {
                            kit.anchorCursor.onFocusAppearAnchor(a.aa, { at: a.offset });
                        }
                        else {
                            if (block.isPanel) kit.page.onCreateTailTextSpan(block);
                        }
                    }
                    else {
                        var sc = block.find(c => {
                            if (c.appearAnchors.length > 0) {
                                var b = c.getVisibleBound();
                                if (b.containY(ev.clientY)) return true;
                            }
                        })
                        if (!sc)
                            sc = block.findReverse(g => g.appearAnchors.length > 0);
                        if (sc) {
                            kit.anchorCursor.onFocusBlockAnchor(sc, { last: true, render: true })
                        }
                    }
                }
                else {
                    /**这里得找页面的最末尾块 */
                    var lastBlock = kit.page.getViewLastBlock();
                    if (lastBlock && lastBlock.isContentEmpty && lastBlock.appearAnchors.some(s => s.isText)) {
                        var r = lastBlock.getVisibleBound();
                        if (r.isCross(new Rect(0, 0, window.innerWidth, window.innerHeight)))
                            kit.anchorCursor.onFocusBlockAnchor(lastBlock, { last: true, render: true });
                    }
                    else {
                        if ([PageLayoutType.doc, PageLayoutType.recordView].includes(kit.page.pageLayout.type))
                            kit.page.onCreateTailTextSpan(undefined);
                    }
                }
            }
        }
    })
}