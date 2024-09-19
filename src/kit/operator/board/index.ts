import { Kit } from "../..";
import { closeBoardEditTool } from "../../../../extensions/board.edit.tool";
import { Block } from "../../../block";
import { findBlockAppear } from "../../../block/appear/visible.seek";
import { MouseDragger } from "../../../common/dragger";
import { onTimeAuto, onTimeAutoScrollStop } from "../../../common/scroll";
import { Point, Rect } from "../../../common/vector/point";
import { openBoardEditTool } from "./edit";
import { CheckBoardSelector } from "../../board.selector/selector";
import { BlockUrlConstant } from "../../../block/constant";
import { Line } from "../../../../blocks/board/line/line";
import lodash from "lodash";

export function BoardDrag(
    kit: Kit,
    block: Block,
    event: React.MouseEvent,
    options?: {
        moveEnd?(ev, isMove, data): void
    }
) {
    var outGroup = block?.outGroup;
    if (outGroup) {
        block = outGroup;
    }

    if (kit.boardSelector.visible == false || !kit.page.isBoard) {
        if (!kit.page.isBoard) {
            var bb = block.closest(x => x.isBoardBlock && !x.isFrame);
            if (bb) {
                kit.boardSelector.onShow(bb?.el, {
                    block: bb,
                    page: kit.page
                })
            }
            else {
                console.warn('not found board block...')
                return;
            }
        }
        else kit.boardSelector.onShow(kit.page.root, { page: kit.page })
    }
    /**
     * 先判断toolBoard工具栏有没有被使用，
     * 如果有使用，则根据工具栏来进行下一步操作
     */
    if (kit.boardSelector.isSelector) {
        CheckBoardSelector(kit, block, event);
        return;
    }
    var downPoint = Point.from(event);
    var gm = block?.panelGridMapNotSelf || kit.page.gridMap;
    if (block?.isLine) block = block.closest(x => x.isContentBlock);
    var beforeIsPicked = kit.picker.blocks.some(s => s == block);
    var emptyIsSelection: boolean = block ? true : false;
    if (block?.isBoardBlock) emptyIsSelection = false;
    if (block?.isFrame && kit.picker.blocks.some(s => s == block)) emptyIsSelection = true;

    if (block?.url == BlockUrlConstant.Line) {
        var ele = event.target as HTMLElement;
        /**
         * 这里主要判断是否在点在线段上，因为浏览器认为点在线段围成的区域 是点在线段上
         * 所以这里需要判断是否在线段上
         * main-line 是主线段，除了主线段外，还有两个方向的线段（箭头线段 比较小，不考虑）
         */
        if (ele.classList.contains('main-line')) {
            var line = (block as Line);
            if (!line.checkPointIn(Point.from(event))) {
                var bs = kit.page.getBlocksFromPoint(Point.from(event));
                lodash.remove(bs, b => b == line);
                if (bs.length > 0) {
                    block = bs[0]
                }
                else block = undefined;
            }
        }
    }
    var isCopy: boolean = false;

    if (window.shyConfig.isDev)
        console.log('board drag:', block, block?.isFreeBlock);
    if (kit.page.keyboardPlate.isShift() && block?.isFreeBlock) {
        //连选
        kit.picker.onShiftPicker([block]);
    }
    else if (block?.isFreeBlock) {
        if (kit.picker.blocks.includes(block)) { }
        else kit.picker.onPicker([block]);
    }
    else {
        kit.picker.onCancel();
    }
    if (kit.page.keyboardPlate.isAlt()) isCopy = true;
    async function createCopyBlocks() {
        await kit.page.onAction('createAltCopyBlocks', async () => {
            var bs = await kit.picker.blocks.asyncMap(async c => await c.clone());
            kit.page.addActionAfterEvent(async () => {
                kit.picker.onPicker(bs);
            })
        })
    }
    var rect = kit.page.bound;
    var moveSize = 50;
    var feel = 50;
    var oldBlockPickers = kit.picker.blocks.map(b => b);
    MouseDragger({
        event,
        dis: 5,
        async moveStart(ev) {
            if (isCopy) {
                await createCopyBlocks();
            }
            gm.start();
            if (!emptyIsSelection) kit.anchorCursor.selector.setStart(downPoint);
            kit.picker.onMoveStart(downPoint);
        },
        move(ev, data) {
            var ed = Point.from(ev);
            if (emptyIsSelection) {
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
                if (!(ox == 0 && oy == 0)) {
                    onTimeAuto({
                        async callback(f) {
                            if (f) {
                                kit.picker.onMove(downPoint, ed, gm);
                            }
                            else {
                                var s = kit.page.matrix.getScaling();
                                kit.page.matrix.translate(ox, oy);
                                downPoint.x += ox * s.x;
                                downPoint.y += oy * s.y;
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
                if (!(ox == 0 && oy == 0)) {
                    onTimeAuto({
                        async callback(f) {
                            if (f) {
                                kit.anchorCursor.selector.setMove(ed);
                                var bs = gm.findBlocksByRect(new Rect(downPoint, ed));
                                bs = kit.page.getAtomBlocks(bs);
                                kit.picker.viewPick(bs);
                            }
                            else {
                                var s = kit.page.matrix.getScaling();
                                kit.page.matrix.translate(ox, oy);
                                downPoint.x += ox * s.x;
                                downPoint.y += oy * s.y;
                                kit.anchorCursor.selector.setMove(ed);
                                var bs = gm.findBlocksByRect(new Rect(downPoint, ed));
                                bs = kit.page.getAtomBlocks(bs);
                                kit.picker.viewPick(bs);
                                kit.page.forceUpdate();
                            }
                        }
                    })
                }
                else {
                    onTimeAutoScrollStop()
                    kit.anchorCursor.selector.setMove(ed);
                    var bs = gm.findBlocksByRect(new Rect(downPoint, ed));
                    bs = kit.page.getAtomBlocks(bs);
                    kit.picker.viewPick(bs);
                }
            }
        },
        async moveEnd(ev, isMove, data) {
            onTimeAutoScrollStop()
            if (isMove) {
                if (emptyIsSelection) {
                    await kit.picker.onMoveEnd(downPoint, Point.from(ev), gm);
                }
                else {
                    kit.anchorCursor.selector.close();
                    kit.picker.onUpdatePicker(oldBlockPickers, kit.picker.blocks);
                }
                if (gm) gm.over();
                if (kit.picker.blocks.length > 0)
                    await openBoardEditTool(kit);
            }
            else {
                console.log('uss', beforeIsPicked, kit.picker.blocks.length, block);
                if (gm) gm.over();
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
                            if (bl.url == BlockUrlConstant.Frame) {
                                kit.anchorCursor.onClearCursor();
                                return;
                            }
                            kit.anchorCursor.onFocusBlockAnchor(bl, { last: true })
                        }
                    }
                    closeBoardEditTool()
                }
                else if (kit.picker.blocks.length > 0) {
                    if (kit.picker.blocks.length == 1 && kit.picker.blocks[0].url == BlockUrlConstant.Frame) {
                        kit.anchorCursor.onClearCursor();
                    }
                    await openBoardEditTool(kit);

                }
                else if (block) {
                    var appear = block.findReverse(g => g.appearAnchors.length > 0, true)?.appearAnchors.last();
                    if (block.url == BlockUrlConstant.CardBox || block.url == BlockUrlConstant.Frame || block.url == BlockUrlConstant.Board) {
                        kit.anchorCursor.onClearCursor()
                    }
                    else if (appear) {
                        kit.anchorCursor.onFocusAppearAnchor(appear, { last: true })
                    }
                }
                else {
                    if (kit.anchorCursor.currentSelectHandleBlocks.length > 0)
                        kit.anchorCursor.onClearSelectBlocks();
                    kit.anchorCursor.onClearCursor()
                    closeBoardEditTool()
                }
            }
            if (options?.moveEnd) options.moveEnd(ev, isMove, data);
        }
    })
}