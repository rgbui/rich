import { Kit } from "..";
import { forceCloseBoardEditTool } from "../../../extensions/board.edit.tool";
import { getBoardTool } from "../../../extensions/board.tool";
import { getShapeSelector } from "../../../extensions/shapes";
import { forceCloseTextTool } from "../../../extensions/text.tool";
import { Block } from "../../block";
import { onAutoScrollStop } from "../../common/scroll";
import { Point } from "../../common/vector/point";
import { PageLayoutType } from "../../page/declare";
import { BoardDrag } from "./board";
import { DocDrag } from "./doc";


/***
 * page的点击至拖动主要分两大类
 * 文档
 * 白板
 */
export async function PageDrag(kit: Kit, event: React.MouseEvent) {
    await PageDragBeforeClear(kit, event);
    if (kit.page.pageLayout.type == PageLayoutType.board) return;
    /**
     * 通过鼠标来查找block，然后判断当前文档类型或块的类型来决后续该由谁来操作
     * 注意:block不一定能找到
     * 判断块的类型来决定后续的操作分类，不一定靠谱
     */
    var block = kit.page.getBlockByMouseOrPoint(event.nativeEvent);
    if (!kit.page.isBoard) {
        (await getBoardTool()).close();
        if (block) {
            var bb = block.closest(x => x.isBoardBlock);
            if (bb) await focusBoardBlock(kit, bb, event.nativeEvent);
        }
    }
    if (block?.isLine) block = block.closest(x => !x.isLine);
    if (kit.page.isBoard || block?.isFreeBlock) {
        BoardDrag(kit, block, event);
    }
    else {
        kit.picker.onCancel();
        DocDrag(kit, block, event);
    }
}
async function focusBoardBlock(kit: Kit, block: Block, event: MouseEvent) {
    var toolBoard = await getBoardTool();
    var rect = block.getVisibleBound();
    toolBoard.open({
        roundPoint: Point.from(rect.leftTop).move(-40, 30),
        relativeEleAutoScroll: block.el
    });
}
/**
 *拖动前做一些清理，
 *由于有部分方法是async的，那么PageDragBeforeClear需要申明为async，
 *后续执行event.stopPropagation(),event.preventDefault()会失效，因为此时的mousedown实际已经结束了
 */
async function PageDragBeforeClear(kit: Kit, event: React.MouseEvent) {
    (await getShapeSelector()).close();
    onAutoScrollStop();
    forceCloseBoardEditTool();
    forceCloseTextTool();
}


