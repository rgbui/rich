
import { Kit } from "..";
import { getBoardTool } from "../../../extensions/board.tool";
import { util } from "../../../util/util";
import { Block } from "../../block";
import { BlockUrlConstant } from "../../block/constant";
import { MouseDragger } from "../../common/dragger";
import { Matrix } from "../../common/matrix";
import { Point } from "../../common/vector/point";
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
            if (kit.picker.blocks.some(s => s === block)) {
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
                kit.picker.onMove(Point.from(event), Point.from(ev));
            },
            moveEnd(ev, isMove, data) {
                var matrix = new Matrix();
                matrix.translate(ev.clientX - event.clientX, ev.clientY - event.clientY)
                kit.picker.onMoveEnd(Point.from(event), Point.from(ev));
                if (!isMove) {
                    if (isPicker && kit.picker.blocks.length == 1) {
                        //这里对block进入聚焦编辑
                        var block = kit.picker.blocks[0];
                        var anchor = block.visibleAnchor(Point.from(event));
                        if (!(anchor && anchor.block.isAllowMouseAnchor)) return;
                        kit.explorer.onFocusAnchor(anchor);
                    }
                }
            }
        })
    }
    else if (!block && kit.page.pageLayout.type == PageLayoutType.board) {
        if (!kit.page.keyboardPlate.isShift()) kit.picker.onPicker([]);
        isBoardSelector = true;
        kit.explorer.onClearAnchorAndSelection();
        var isShift = kit.explorer.page.keyboardPlate.isShift();
        var ma = kit.page.matrix.clone();
        var gm = kit.page.globalMatrix.clone();
        var fromP = gm.inverseTransform(Point.from(event));
        MouseDragger({
            event,
            moveStart() {
                if (isShift)
                    kit.selector.setStart(Point.from(event));
            },
            move(ev, data) {
                if (isShift) {
                    kit.selector.setMove(Point.from(ev));
                    /**
                     * 这里通过选区来计算之间的经过的块
                     */
                    var bs = kit.page.searchBoardBetweenRect(event, ev);
                    bs.removeAll(g => !g.isFreeBlock);
                    kit.picker.onPicker(bs);
                }
                else {
                    var na = ma.clone();
                    var toP = gm.inverseTransform(Point.from(ev));
                    na.translateMove(fromP, toP);
                    kit.page.onSetMatrix(na);
                }
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
        var gm = fra.globalWindowMatrix;
        var re = gm.inverseTransform(Point.from(event));
        var url = toolBoard.currentSelector.url;
        if (url == '/note' || url == BlockUrlConstant.TextSpan || url == BlockUrlConstant.Frame) {
            await fra.onAction(ActionDirective.onBoardToolCreateBlock, async () => {
                var data = toolBoard.currentSelector.data || {};
                var ma = new Matrix();
                ma.translate(re.x, re.y);
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
                data.from = { x: re.x, y: re.y };
                data.to = util.clone(data.from);
                newBlock = await kit.page.createBlock(toolBoard.currentSelector.url, data, fra);
                toolBoard.clearSelector();
                newBlock.mounted(() => {
                    isMounted = true;
                })
            });
            MouseDragger({
                event,
                moveStart() {
                    kit.boardLine.onStartConnectOther();
                    if (newBlock) kit.boardLine.line = newBlock;
                },
                move(ev, data) {
                    if (newBlock) {
                        kit.boardLine.line = newBlock;
                        var tr = gm.inverseTransform(Point.from(ev));
                        (newBlock as any).to = { x: tr.x, y: tr.y };
                        if (isMounted) newBlock.forceUpdate();
                    }
                },
                moveEnd(ev, isMove, data) {
                    if (newBlock) {
                        var ma = new Matrix();
                        var tr = gm.inverseTransform(Point.from(ev));
                        (newBlock as any).to = { x: tr.x, y: tr.y };
                        if (isMounted) newBlock.forceUpdate();
                    }
                    kit.boardLine.onEndConnectOther()
                }
            })
        }
        else if (url == '/shape') {
            var newBlock: Block;
            var isMounted: boolean = false;
            await fra.onAction(ActionDirective.onBoardToolCreateBlock, async () => {
                var data = toolBoard.currentSelector.data || {};
                var ma = new Matrix();
                ma.translate(re.x, re.y);
                data.matrix = ma.getValues();
                newBlock = await kit.page.createBlock(toolBoard.currentSelector.url, data, fra);
                newBlock.fixedWidth = 0;
                newBlock.fixedHeight = 0;
                toolBoard.clearSelector();
                newBlock.mounted(() => {
                    isMounted = true;
                })
            });
            MouseDragger({
                event,
                move: (ev, data) => {
                    if (newBlock) {
                        var tr = gm.inverseTransform(Point.from(ev));
                        var ma = new Matrix();
                        ma.translate(Math.min(re.x, tr.x), Math.min(re.y, tr.y));
                        newBlock.matrix = ma;
                        newBlock.fixedWidth = Math.abs(tr.x - re.x);
                        newBlock.fixedHeight = Math.abs(tr.y - re.y);
                        if (isMounted) newBlock.forceUpdate();
                    }
                },
                moveEnd(ev, isMove, data) {
                    if (newBlock) {
                        var tr = gm.inverseTransform(Point.from(ev));
                        var ma = new Matrix();
                        ma.translate(Math.min(re.x, tr.x), Math.min(re.y, tr.y));
                        newBlock.matrix = ma;
                        newBlock.fixedWidth = Math.abs(tr.x - re.x) || 200;
                        newBlock.fixedHeight = Math.abs(tr.y - re.y) || 200;
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
    if (kit.explorer.hasAnchor && kit.explorer.activeAnchor.isText && kit.picker.blocks.length > 0) {
        var fb = kit.picker.blocks[0];
        if (block && fb && fb.exists(g => g == block, true) && block?.exists(g => g == kit.explorer.activeAnchor?.block, true)) {
            return true;
        }
    }
    return false;
}