import { Kit } from "../..";
import { forceCloseBoardEditTool } from "../../../../extensions/board.edit.tool";
import { Block } from "../../../block";
import { findBlockAppear } from "../../../block/appear/visible.seek";
import { MouseDragger } from "../../../common/dragger";
import { onTimeAuto, onTimeAutoScrollStop } from "../../../common/scroll";
import { Point, Rect } from "../../../common/vector/point";
import { openBoardEditTool } from "./edit";
import { CheckBoardTool } from "./selector";

export function BoardDrag(
    kit: Kit,
    block: Block,
    event: React.MouseEvent) {
    /**
     * 先判断toolBoard工具栏有没有被使用，
     * 如果有使用，则根据工具栏来进行下一步操作
     */
    if (kit.boardSelector.isSelector) {
        CheckBoardTool(kit, block, event);
        return;
    }
    var downPoint = Point.from(event);
    var gm = block ? block.panelGridMap : kit.page.gridMap;
    if (block?.isLine) block = block.closest(x =>!x.isLine);
    var beforeIsPicked = kit.picker.blocks.some(s => s == block);

    var hasBlock: boolean = block ? true : false;
    var isCopy: boolean = false;
    if (kit.page.keyboardPlate.isShift() && block?.isFreeBlock) {
        //连选
        kit.picker.onShiftPicker([block]);
    }
    else if (block?.isFreeBlock) {
        if (kit.picker.blocks.includes(block)) { }
        else kit.picker.onPicker([block]);
    }
    else kit.picker.onCancel();
    if (kit.page.keyboardPlate.isAlt()) isCopy = true;

    async function createCopyBlocks() {
        await kit.page.onAction('createAltCopyBlocks', async () => {
            var bs = await kit.picker.blocks.asyncMap(async c => await c.clone());
            kit.page.addUpdateEvent(async () => {
                kit.picker.onPicker(bs);
            })
        })
    }
    var rect = kit.page.bound;
    var moveSize = 50;
    var feel = 50;
    MouseDragger({
        event,
        dis: 5,
        async moveStart(ev) {
            if (isCopy) {
                await createCopyBlocks();
            }
            gm.start();
            if (!hasBlock) kit.anchorCursor.selector.setStart(downPoint);
            kit.picker.onMoveStart(downPoint);
        },
        move(ev, data) {
            var ed = Point.from(ev);
            if (hasBlock) {
                var ox = 0;
                var oy = 0;
                if (Math.abs(ev.clientY - rect.top) < feel) {
                    oy = moveSize;
                }
                else if (Math.abs(ev.clientY - rect.bottom) < feel) {
                    oy = -moveSize;
                }
                else if (Math.abs(ev.clientX - rect.left) < feel) {
                    ox = moveSize;
                }
                else if (Math.abs(ev.clientX - rect.right) < feel) {
                    ox = -moveSize;
                }
                if (ox > 0 || oy > 0) {
                    onTimeAuto({
                        async callback(f) {
                            if (f) {
                                kit.picker.onMove(downPoint, ed, gm);
                            }
                            else {
                                var s = kit.page.matrix.getScaling();
                                var nox = ox * s.x;
                                var noy = oy * s.y;
                                kit.page.matrix.translate(nox, noy);
                                downPoint.x += ox;
                                downPoint.y += oy;
                                kit.picker.onMove(downPoint, ed, gm);
                                kit.page.forceUpdate();
                            }
                        }
                    })
                }
                else {
                    onTimeAutoScrollStop()
                    kit.picker.onMove(downPoint, ed, gm);
                }
            }
            else {
                /***
                 * 这里需要基于视觉查找当前有那些块可以被选中
                 */

                kit.anchorCursor.selector.setMove(ed);
                var bs = gm.findBlocksByRect(new Rect(downPoint, ed));
                bs = kit.page.getAtomBlocks(bs);
                kit.picker.onPicker(bs);
            }
        },
        async moveEnd(ev, isMove, data) {
            onTimeAutoScrollStop()
            if (isMove) {
                if (hasBlock) {
                    await kit.picker.onMoveEnd(downPoint, Point.from(ev), gm);
                }
                else {
                    kit.anchorCursor.selector.close();
                }
                gm.over();
                if (kit.picker.blocks.length > 0)
                    await openBoardEditTool(kit);
            }
            else {
                gm.over();
                /**
                 * 这里说明是点击选择board块，那么判断是否有shift连选操作
                 * 
                 */
                if (ev.button == 2) {
                    ev.preventDefault();
                    if (kit.picker.blocks.length > 0) {
                        kit.page.onOpenMenu(kit.picker.blocks, downPoint);
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