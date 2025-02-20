import React from "react";
import { Kit } from "..";
import { closeBoardEditTool } from "../../../extensions/board.edit.tool";
import { closeShapeSelector } from "../../../extensions/board/shapes";
import { forceCloseTextTool } from "../../../extensions/text.tool";
import { Block } from "../../block";
import { onAutoScrollStop } from "../../common/scroll";
import { PageDrag } from "./drag";
import { Rect } from "../../common/vector/point";
import { closeNoteSelector } from "../../../extensions/board/note";
import { BlockUrlConstant } from "../../block/constant";

/****
 * 鼠标点击：
 * 1. 点在编辑点上，如果是文本编辑点，则文本编辑点自已处理。
 * 2. 点在块上面（通过event.target closest 查找块）对于board块，则是选择状态
 * 3. 点在文档的空白处(左，右、上)则定位至相邻的。如果是底部，则检测尾部是否有空白文本，如果没有创建，然后聚焦至空白文本
 * 鼠标拖动：
 * 形成一个选区
 * 1. 从编辑点开始，则由文本编辑点处理
 * 2. 从非编辑点开始，则记住起始位置，然后形成一个选区，这个对文本及白板都有效
 * 选的过程中，滚动条会滚动适配其选中
 * 鼠标移动：
 * 当鼠标停在块上面时，会显示一个小把手，表示对块的操作
 * 当鼠标移到把手时，该把手不能隐藏，
 * 移到块及把手之外，小把手消失
 * 
 */
export class PageOperator {
    constructor(public kit: Kit) { }
    mousedown(event: React.MouseEvent) {
        if (!this.kit.page?.isCanEdit) return
      
        PageDrag(this.kit, event);
    }
    dblclick(event: React.MouseEvent) {
        var block = this.kit.page.getBlockByMouseOrPoint(event.nativeEvent);
        if (block?.isLine) block = block.closest(x => x.isContentBlock);
        var outBlock = block?.outGroup;
        if (outBlock && block) {
            if (block.isFreeBlock) {
                this.kit.picker.onPicker([block]);
            }
        }
    }
    public moveEvent: MouseEvent;
    mousemove(event: MouseEvent) {
        this.moveEvent = event;
        if (!this.kit.page?.isCanEdit) return
        //判断当前的ele是否在bar自已本身内
        /**
         * 通过鼠标的坐标查找当前block。
         * 如果没找到，block为空
         * 如果鼠标本身处在把手上面，那么就不需要有任何处理，认为当前的把手和块是一体的
         */
        var ele = event.target as HTMLElement;
        if (this.kit.handle.containsEl(ele)) return;
        var block: Block;
        if (this.kit.page.root.contains(ele)) {
            block = this.kit.page.getBlockByMouseOrPoint(event);
        }
        if (this.kit.boardLine.line) {
            if (block && (block.url == BlockUrlConstant.Line || !block.isFreeBlock)) {
                block = undefined;
            }
        }
        if (!block && this.kit.boardLine.line) {
            var gm = this.kit.boardLine.line.panelGridMap;
            if (gm) {
                var rect = new Rect(event.clientX, event.clientY, 0, 0);
                rect = rect.extend(50);
                var bs = gm.findBlocksByRect(rect, (b) => {
                    return b.isFreeBlock && b.url !== BlockUrlConstant.Line && b.isCrossBlockVisibleArea(rect);
                });
                bs = bs.findAll(g => g.isFreeBlock);
                var b = bs.findMin(g => g.getVisibleContentBound().middleCenter.dis(rect.middleCenter));
                if (b) {
                    block = b;
                }
            }
        }
        this.kit.page.onHoverBlock(block);
    }
    mouseup(event: MouseEvent) {

    }

    /**
     * 清理页面的输入状态
     */
    onClearPage() {
        closeShapeSelector();
        closeNoteSelector();
        onAutoScrollStop();
        closeBoardEditTool();
        forceCloseTextTool();
        this.kit.writer.onClearInputPop();
    }
}