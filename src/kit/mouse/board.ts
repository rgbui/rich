
import { Kit } from "..";
import { getBoardTool } from "../../../extensions/board.tool";
import { util } from "../../../util/util";
import { Block } from "../../block";
import { BlockUrlConstant } from "../../block/constant";
import { MouseDragger } from "../../common/dragger";
import { Matrix } from "../../common/matrix";
import { Point } from "../../common/point";
import { ActionDirective } from "../../history/declare";
import { PageLayoutType } from "../../layout/declare";

export async function SelectorBoardBlock(kit: Kit, block: Block | undefined, event: MouseEvent) {
    var isBoardSelector = false;
    if (block?.isFreeBlock) {
        isBoardSelector = true;
        var isPicker: boolean = false;
        if (kit.page.keyboardPlate.isShift()) {
            //连选
            kit.picker.onShiftPicker([block]);
        }
        else {
            //不连选
            if (kit.picker.blockRanges.some(s => s.block == block)) {
                //说明包含
                isPicker = true;
            }
            else {
                //说明不包含
                kit.picker.onPicker([block]);
            }
        }
        MouseDragger({
            event,
            move(ev, data) {
                var matrix = new Matrix();
                matrix.translate(ev.clientX - event.clientX, ev.clientY - event.clientY)
                kit.picker.onMove(matrix);
            },
            moveEnd(ev, isMove, data) {
                var matrix = new Matrix();
                matrix.translate(ev.clientX - event.clientX, ev.clientY - event.clientY)
                kit.picker.onMoveEnd(matrix);
                if (!isMove) {
                    if (isPicker && kit.picker.blockRanges.length == 1) {
                        //这里对block进入聚焦编辑
                        var block = kit.picker.blockRanges[0].block;
                        var anchor = block.visibleAnchor(Point.from(event));
                        if (!(anchor && anchor.block.isAllowMouseAnchor)) return;
                        kit.explorer.onFocusAnchor(anchor);
                    }
                }
            }
        })
    }
    else if (!block && kit.page.pageLayout.type == PageLayoutType.board) {
        if (!kit.page.keyboardPlate.isShift())
            kit.picker.onPicker([]);
        isBoardSelector = true;
        kit.explorer.onClearAnchorAndSelection();
        MouseDragger({
            event,
            moveStart() {
                kit.selector.setStart(Point.from(event));
            },
            move(ev, data) {
                kit.selector.setMove(Point.from(ev));
                /**
                 * 这里通过选区来计算之间的经过的块
                 */
                var bs = kit.page.searchBoardBetweenRect(event, ev);
                bs.removeAll(g => !g.isFreeBlock);
                kit.picker.onPicker(bs);
            },
            moveEnd(ev, isMove, data) {
                if (isMove) {
                    kit.selector.close()
                }
            }
        })
    }
    return isBoardSelector;
}

export async function CreateBoardBlock(kit: Kit, block: Block | undefined, event: MouseEvent) {
    var toolBoard = await getBoardTool();
    if (toolBoard.isSelector) {
        var fra: Block = block ? block.frameBlock : kit.page.getPageFrame();
        var re = fra.el.getBoundingClientRect();
        var url = toolBoard.currentSelector.url;
        if (url == '/note' || url == BlockUrlConstant.TextSpan || url == BlockUrlConstant.Frame) {
            await fra.onAction(ActionDirective.onBoardToolCreateBlock, async () => {
                var data = toolBoard.currentSelector.data || {};
                var ma = new Matrix();
                ma.translate(event.clientX - re.left, event.clientY - re.top);
                data.matrix = ma.getValues();
                var newBlock = await kit.page.createBlock(toolBoard.currentSelector.url, data, fra);
                toolBoard.clearSelector();
                newBlock.mounted(() => {
                    // this.mousedown(newBlock, event);
                })
            });
        }
        else if (url == '/line') {
            var newBlock: Block;
            var isMounted: boolean = false;
            await fra.onAction(ActionDirective.onBoardToolCreateBlock, async () => {
                var data = toolBoard.currentSelector.data || {};
                var ma = new Matrix();
                ma.translate(event.clientX - re.left, event.clientY - re.top);
                data.matrix = ma.getValues();
                data.from = { x: event.clientX, y: event.clientY };
                data.to = util.clone(data.from);
                newBlock = await kit.page.createBlock(toolBoard.currentSelector.url, data, fra);
                toolBoard.clearSelector();
                newBlock.mounted(() => {
                    isMounted = true;
                })
            });
            MouseDragger({
                event,
                move: (ev, data) => {
                    if (newBlock) {
                        var ma = new Matrix();
                        ma.translate(Math.min(ev.clientX, event.clientX) - re.left, Math.min(ev.clientY, event.clientY) - re.top);
                        newBlock.matrix = ma;
                        (newBlock as any).to = { x: ev.clientX, y: ev.clientY };
                        if (isMounted)
                            newBlock.forceUpdate();
                    }
                },
                moveEnd(ev, isMove, data) {
                    if (newBlock) {
                        var ma = new Matrix();
                        ma.translate(Math.min(ev.clientX, event.clientX) - re.left, Math.min(ev.clientY, event.clientY) - re.top);
                        newBlock.matrix = ma;
                        (newBlock as any).to = { x: ev.clientX, y: ev.clientY };
                        newBlock.fixedWidth = ev.clientX - event.clientX;
                        newBlock.fixedHeight = ev.clientY - event.clientY;
                        if (isMounted)
                            newBlock.forceUpdate();
                    }
                }
            })
        }
        else if (url == '/shape') {
            var newBlock: Block;
            var isMounted: boolean = false;
            await fra.onAction(ActionDirective.onBoardToolCreateBlock, async () => {
                var data = toolBoard.currentSelector.data || {};
                var ma = new Matrix();
                ma.translate(event.clientX - re.left, event.clientY - re.top);
                data.matrix = ma.getValues();
                newBlock = await kit.page.createBlock(toolBoard.currentSelector.url, data, fra);
                toolBoard.clearSelector();
                newBlock.mounted(() => {
                    isMounted = true;
                })
            });
            MouseDragger({
                event,
                move: (ev, data) => {
                    if (newBlock) {
                        newBlock.fixedWidth = Math.abs(ev.clientX - event.clientX);
                        newBlock.fixedHeight = Math.abs(ev.clientY - event.clientY);
                        if (isMounted)
                            newBlock.forceUpdate();
                    }
                },
                moveEnd(ev, isMove, data) {
                    if (newBlock) {
                        newBlock.fixedWidth = Math.abs(ev.clientX - event.clientX);
                        newBlock.fixedHeight = Math.abs(ev.clientY - event.clientY);
                        if (isMounted) newBlock.forceUpdate();
                    }
                }
            })
        }
        else if (url == '/pen') {

        }
        return true;
    }
}

export function IsBoardTextAnchorBlock(kit: Kit, block: Block | undefined, event: MouseEvent) {
    if (kit.explorer.hasAnchor && kit.explorer.activeAnchor.isText && kit.picker.blockRanges.length > 0) {
        var fb = kit.picker.blockRanges[0].block;
        if (block && fb && fb.exists(g => g == block, true) && block?.exists(g => g == kit.explorer.activeAnchor?.block, true)) {
            return true;
        }
    }
    return false;
}