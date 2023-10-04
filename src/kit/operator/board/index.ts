import { Kit } from "../..";
import { forceCloseBoardEditTool } from "../../../../extensions/board.edit.tool";
import { Block } from "../../../block";
import { findBlockAppear } from "../../../block/appear/visible.seek";
import { MouseDragger } from "../../../common/dragger";
import { Point, Rect } from "../../../common/vector/point";
import { openBoardEditTool } from "./edit";
import { CheckBoardTool } from "./selector";

export async function BoardDrag(
    kit: Kit,
    block: Block,
    event: React.MouseEvent) {

    /**
     * 先判断toolBoard工具栏有没有被使用，
     * 如果有使用，则根据工具栏来进行下一步操作
     */
    if (await CheckBoardTool(kit, block, event)) return;
    var downPoint = Point.from(event);
    var gm = block ? block.panelGridMap : kit.page.gridMap;

    if (block?.isLine) block = block.closest(x => !x.isLine);
    var beforeIsPicked = kit.picker.blocks.some(s => s == block);

    var hasBlock: boolean = block ? true : false;
    if (kit.page.keyboardPlate.isShift() && block?.isFreeBlock) {
        //连选
        kit.picker.onShiftPicker([block]);
    }
    else if (block?.isFreeBlock) {
        kit.picker.onPicker([block]);
    }
    else kit.picker.onCancel();
    var point = Point.from(event);
    MouseDragger({
        event,
        dis: 5,
        moveStart(ev) {
            gm.start();
            if (!hasBlock) kit.anchorCursor.selector.setStart(Point.from(ev));
            kit.picker.onMoveStart(Point.from(event));
        },
        move(ev, data) {
            if (hasBlock) {
                kit.picker.onMove(Point.from(event), Point.from(ev));
            }
            else {
                /***
                 * 这里需要基于视觉查找当前有那些块可以被选中
                 */
                var movePoint = Point.from(ev);
                kit.anchorCursor.selector.setMove(movePoint);
                var bs = gm.findBlocksByRect(new Rect(downPoint, movePoint));
                bs = kit.page.getAtomBlocks(bs);
                kit.picker.onPicker(bs);
            }
        },
        async moveEnd(ev, isMove, data) {
            gm.over();
            if (isMove) {
                if (hasBlock) {
                    kit.picker.onMoveEnd(Point.from(event), Point.from(ev));
                }
                else {
                    kit.anchorCursor.selector.close();
                }
                if (kit.picker.blocks.length > 0)
                    await openBoardEditTool(kit);
            }
            else {
                /**
                 * 这里说明是点击选择board块，那么判断是否有shift连选操作
                 * 
                 */
                if (ev.button == 2) {
                    if (kit.picker.blocks.length > 0) {
                        kit.page.onOpenMenu(kit.picker.blocks, point);
                    }
                }
                else if (beforeIsPicked) {
                    var appear = findBlockAppear(ev.target as HTMLElement);
                    if (appear) {
                        appear.collapseByPoint(Point.from(ev));
                    }
                    else if (kit.picker.blocks.length == 1) {
                        var bl = kit.picker.blocks[0];
                        if (bl.appearAnchors.length > 0) {
                            kit.anchorCursor.onFocusBlockAnchor(bl, { last: true })
                        }
                    }
                }
                else if (kit.picker.blocks.length > 0) await openBoardEditTool(kit);
                else forceCloseBoardEditTool()
            }
        }
    })
}