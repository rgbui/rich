
import lodash from "lodash";
import { Kit } from "..";
import { Block } from "../../block";
import { BlockUrlConstant } from "../../block/constant";
import { MouseDragger } from "../../common/dragger";
import { Matrix } from "../../common/matrix";
import { Point } from "../../common/vector/point";
import { ActionDirective } from "../../history/declare";

import { setBoardBlockCache } from "../../page/common/cache";
import { PenDraw } from "./pen";

export function CheckBoardSelector(
    kit: Kit,
    block: Block,
    event: React.MouseEvent) {
    var fra: Block = block ? block.frameBlock : kit.page.getPageFrame();
    var gm = fra.globalWindowMatrix;
    var re = gm.inverseTransform(Point.from(event));
    var url = kit.boardSelector.currentSelector.url;
    if (url == BlockUrlConstant.Mind || url == BlockUrlConstant.TextSpan || url == BlockUrlConstant.Table) {
        fra.page.onAction(ActionDirective.onBoardToolCreateBlock, async () => {
            var data = kit.boardSelector.currentSelector.data || {};
            var ma = new Matrix();
            ma.translate(re.x, re.y);
            data.matrix = ma.getValues();
            var newBlock = await kit.page.createBlock(kit.boardSelector.currentSelector.url, data, fra);
            kit.boardSelector.clearSelector();
            await setBoardBlockCache(newBlock);
            newBlock.mounted(async () => {
                await kit.picker.onPicker([newBlock], { merge: true });
                await kit.anchorCursor.onFocusBlockAnchor(newBlock, { render: true, merge: true });
            })
        });
    }
    else if (url == BlockUrlConstant.Line) {
        var newBlock: Block;
        var isMounted: boolean = false;
        var oldTo;
        async function createNewLineBlock() {
            await fra.page.onAction(ActionDirective.onBoardToolCreateBlock, async () => {
                var data = kit.boardSelector.currentSelector.data || {};
                data.from = { x: re.x, y: re.y };
                data.to = lodash.cloneDeep(data.from);
                oldTo = lodash.cloneDeep(data.to);
                newBlock = await kit.page.createBlock(kit.boardSelector.currentSelector.url, data, fra);
                await setBoardBlockCache(newBlock, data);
                newBlock.mounted(() => {
                    isMounted = true;
                })
            });
        }

        MouseDragger({
            event,
            moveStart() {
                createNewLineBlock().then(() => {
                    kit.boardLine.onStartConnectOther(newBlock);
                })
            },
            move(ev, data) {
                if (newBlock) {
                    kit.boardLine.line = newBlock;
                    var tr = gm.inverseTransform(Point.from(ev));
                    (newBlock as any).to = { x: tr.x, y: tr.y };
                    if (isMounted) newBlock.forceManualUpdate();
                }
            },
            async moveEnd(ev, isMove, data) {
                if (!newBlock) await createNewLineBlock();
                await kit.page.onAction('onBoardToolCreateBlockResize', async () => {
                    if (isMove) {
                        if (kit.boardLine.over) {
                            await newBlock.manualUpdateProps({ to: oldTo }, {
                                to: {
                                    blockId: kit.boardLine.over.block.id,
                                    x: kit.boardLine.over.selector.arrows[1],
                                    y: kit.boardLine.over.selector.arrows[0]
                                }
                            })
                            kit.boardLine.over.block.conectLine(newBlock);
                        }
                        else {
                            var pe = Point.from(ev)
                            if (!isMove) pe = pe.move(100, 100);
                            var tr = gm.inverseTransform(pe);
                            await newBlock.manualUpdateProps({ to: oldTo }, {
                                to: {
                                    x: tr.x, y: tr.y
                                }
                            })
                        }
                        kit.boardLine.onEndConnectOther();
                    }
                    else {
                        var pe = Point.from(ev);
                        pe = pe.move(100, 100);
                        var tr = gm.inverseTransform(pe);
                        await newBlock.manualUpdateProps({ to: oldTo }, {
                            to: {
                                x: tr.x, y: tr.y
                            }
                        })
                    }
                    if (isMounted) newBlock.forceManualUpdate();
                })
                await kit.picker.onPicker([newBlock], { merge: true });
                kit.boardSelector.clearSelector();
            }
        })
    }
    else if (url == BlockUrlConstant.BoardImage || url == BlockUrlConstant.Note || url == BlockUrlConstant.BoardPageCard || url == BlockUrlConstant.Shape || url == BlockUrlConstant.Frame) {
        var newBlock: Block;
        var isMounted: boolean = false;
        var initMatrix: Matrix;
        var fw, fh;
        async function createBlock() {
            await fra.page.onAction(ActionDirective.onBoardToolCreateBlock, async () => {
                var data = kit.boardSelector.currentSelector.data || {};
                initMatrix = new Matrix();
                initMatrix.translate(re.x, re.y);
                data.matrix = initMatrix.getValues();
                if (url == BlockUrlConstant.BoardPageCard) {
                    data.blocks = {
                        childs: [{ url: BlockUrlConstant.TextSpan }]
                    }
                }
                newBlock = await kit.page.createBlock(kit.boardSelector.currentSelector.url, data, fra);
                await setBoardBlockCache(newBlock, undefined, data);
                fw = newBlock.fixedWidth;
                fh = newBlock.fixedHeight;
                kit.boardSelector.clearSelector();
                newBlock.mounted(() => {
                    isMounted = true;
                })
            });
        }
        MouseDragger({
            event,
            moveStart() {
                createBlock().then(() => {
                    newBlock.fixedWidth = 0;
                    newBlock.fixedHeight = 0;
                    if (isMounted) newBlock.forceManualUpdate();
                })
            },
            move: (ev, data) => {
                if (newBlock) {
                    var tr = gm.inverseTransform(Point.from(ev));
                    var ma = new Matrix();
                    ma.translate(Math.min(re.x, tr.x), Math.min(re.y, tr.y));
                    newBlock.matrix = ma;
                    var dx = Math.abs(tr.x - re.x);
                    var dy = Math.abs(tr.y - re.y);
                    if (kit.page.keyboardPlate.isShift()) {
                        if (dx > dy) dy = dx;
                        else dx = dy;
                    }
                    newBlock.fixedWidth = dx;
                    newBlock.fixedHeight = dy;
                    if (isMounted) newBlock.forceManualUpdate();
                }
            },
            async moveEnd(ev, isMove, data) {
                if (!newBlock) await createBlock();
                if (isMove) {
                    await fra.page.onAction('onBoardToolCreateBlockResize', async () => {
                        var tr = gm.inverseTransform(Point.from(ev));
                        var ma = new Matrix();
                        ma.translate(Math.min(re.x, tr.x), Math.min(re.y, tr.y));
                        await newBlock.updateMatrix(initMatrix, ma);
                        var dx = Math.abs(tr.x - re.x);
                        var dy = Math.abs(tr.y - re.y);
                        if (kit.page.keyboardPlate.isShift()) {
                            if (dx > dy) dy = dx;
                            else dx = dy;
                        }
                        await newBlock.manualUpdateProps({ fixedWidth: fw, fixedHeight: fh }, {
                            fixedWidth: dx,
                            fixedHeight: dy
                        })
                        if (isMounted) newBlock.forceManualUpdate();
                        kit.page.addActionAfterEvent(async () => {
                            kit.picker.onPicker([newBlock], { merge: true });
                            if (url == BlockUrlConstant.BoardPageCard) kit.anchorCursor.onFocusBlockAnchor(newBlock.childs.first(), { render: true, merge: true });
                            else if (url == BlockUrlConstant.Frame || url == BlockUrlConstant.Image) return;
                            else kit.anchorCursor.onFocusBlockAnchor(newBlock, { render: true, merge: true });
                        })
                    });
                }
                else {
                    if (isMounted) newBlock.forceManualUpdate();
                    await kit.picker.onPicker([newBlock], { merge: true });
                    if (url == BlockUrlConstant.BoardPageCard) kit.anchorCursor.onFocusBlockAnchor(newBlock.childs.first(), { render: true, merge: true });
                    else if (url == BlockUrlConstant.Frame || url == BlockUrlConstant.Image) return;
                    else await kit.anchorCursor.onFocusBlockAnchor(newBlock, { render: true, merge: true });
                }
                kit.boardSelector.clearSelector();
            }
        })
    }
    else if (url == BlockUrlConstant.Pen) {
        PenDraw(kit, fra, event);
    }
    else {
        if (kit.boardSelector.currentSelector.url) {
            fra.page.onAction(ActionDirective.onBoardToolCreateBlock, async () => {
                var data = kit.boardSelector.currentSelector.data || {};
                var ma = new Matrix();
                ma.translate(re.x, re.y);
                data.matrix = ma.getValues();
                var newBlock = await kit.page.createBlock(kit.boardSelector.currentSelector.url, data, fra);
                kit.boardSelector.clearSelector();
                await setBoardBlockCache(newBlock);
                newBlock.mounted(async () => {
                    await kit.picker.onPicker([newBlock], { merge: true });
                    //await kit.anchorCursor.onFocusBlockAnchor(newBlock, { render: true, merge: true });
                })
            });
            return;
        }
        kit.boardSelector.clearSelector();
    }
}
