
import lodash from "lodash";
import { Kit } from "../..";
import { Block } from "../../../block";
import { BlockUrlConstant } from "../../../block/constant";
import { MouseDragger } from "../../../common/dragger";
import { Matrix } from "../../../common/matrix";
import { Point } from "../../../common/vector/point";
import { Polygon } from "../../../common/vector/polygon";
import { ActionDirective } from "../../../history/declare";
import { loadPaper } from "../../../paper";
import { setBoardBlockCache } from "../../../page/common/cache";

export function CheckBoardTool(
    kit: Kit,
    block: Block,
    event: React.MouseEvent) {
    var fra: Block = block ? block.frameBlock : kit.page.getPageFrame();
    var gm = fra.globalWindowMatrix;
    var re = gm.inverseTransform(Point.from(event));
    var url = kit.boardSelector.currentSelector.url;
    if (url == BlockUrlConstant.Mind || url == BlockUrlConstant.TextSpan) {
        fra.page.onAction(ActionDirective.onBoardToolCreateBlock, async () => {
            var data = kit.boardSelector.currentSelector.data || {};
            var ma = new Matrix();
            ma.translate(re.x, re.y);
            data.matrix = ma.getValues();
            var newBlock = await kit.page.createBlock(kit.boardSelector.currentSelector.url, data, fra);
            kit.boardSelector.clearSelector();
            await setBoardBlockCache(newBlock);
            newBlock.mounted(() => {
                kit.picker.onPicker([newBlock], true);
                kit.anchorCursor.onFocusBlockAnchor(newBlock, { render: true, merge: true });
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
                await setBoardBlockCache(newBlock);
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
                    if (isMounted) newBlock.forceUpdate();
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
                    if (isMounted) newBlock.forceUpdate();
                })
                kit.picker.onPicker([newBlock], true);
                kit.boardSelector.clearSelector();
            }
        })
    }
    else if (url == BlockUrlConstant.BoardImage|| url == BlockUrlConstant.Note || url == BlockUrlConstant.BoardPageCard || url == BlockUrlConstant.Shape || url == BlockUrlConstant.Frame) {
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
                console.log(kit.boardSelector.currentSelector.url, data);
                newBlock = await kit.page.createBlock(kit.boardSelector.currentSelector.url, data, fra);
                await setBoardBlockCache(newBlock);
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
                    if (isMounted) newBlock.forceUpdate();
                })
            },
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
            async moveEnd(ev, isMove, data) {
                if (!newBlock) await createBlock();
                if (isMove) {
                    await fra.page.onAction('onBoardToolCreateBlockResize', async () => {
                        var tr = gm.inverseTransform(Point.from(ev));
                        var ma = new Matrix();
                        ma.translate(Math.min(re.x, tr.x), Math.min(re.y, tr.y));
                        await newBlock.updateMatrix(initMatrix, ma);
                        await newBlock.manualUpdateProps({ fixedWidth: fw, fixedHeight: fh }, {
                            fixedWidth: Math.abs(tr.x - re.x),
                            fixedHeight: Math.abs(tr.y - re.y)
                        })
                        if (isMounted) newBlock.forceUpdate();
                        kit.picker.onPicker([newBlock], true);
                        if (url == BlockUrlConstant.BoardPageCard) kit.anchorCursor.onFocusBlockAnchor(newBlock.childs.first(), { render: true, merge: true });
                        else if (url == BlockUrlConstant.Frame || url == BlockUrlConstant.Image) return;
                        else kit.anchorCursor.onFocusBlockAnchor(newBlock, { render: true, merge: true });
                    });
                }
                else {
                    if (isMounted) newBlock.forceUpdate();
                    kit.picker.onPicker([newBlock], true);
                    if (url == BlockUrlConstant.BoardPageCard) kit.anchorCursor.onFocusBlockAnchor(newBlock.childs.first(), { render: true, merge: true });
                    else if (url == BlockUrlConstant.Frame || url == BlockUrlConstant.Image) return;
                    else kit.anchorCursor.onFocusBlockAnchor(newBlock, { render: true, merge: true });
                }
                kit.boardSelector.clearSelector();
            }
        })
    }
    else if (url == BlockUrlConstant.Pen) {
        var newBlock: Block;
        var isMounted: boolean = false;
        var path: paper.Path;
        var points: { x: number, y: number }[] = [];
        async function createNewPenBlock() {
            await fra.page.onAction(ActionDirective.onBoardToolCreateBlock, async () => {
                var paper = await loadPaper();
                var data = kit.boardSelector.currentSelector.data || {};
                newBlock = await kit.page.createBlock(kit.boardSelector.currentSelector.url, data, fra);
                await setBoardBlockCache(newBlock);
                points.push(re);
                path = new paper.Path({ segments: [{ x: re.x, y: re.y }] });
                newBlock.fixedWidth = 0;
                newBlock.fixedHeight = 0;
                newBlock.mounted(() => {
                    isMounted = true;
                })
            });
        }
        MouseDragger({
            event,
            moveStart() {
                createNewPenBlock();
            },
            move(ev, data) {
                if (newBlock && path) {
                    var tr = gm.inverseTransform(Point.from(ev));
                    path.add([tr.x, tr.y]);
                    var ma = new Matrix();
                    points.push(tr);
                    var poly = new Polygon(...points);
                    var bound = poly.bound;
                    var s = newBlock.pattern?.getSvgStyle()?.strokeWidth || 1;
                    bound = bound.extend(fra.realPx(s));
                    ma.translate(bound.x, bound.y);
                    newBlock.matrix = ma;
                    newBlock.fixedWidth = Math.abs(bound.width);
                    newBlock.fixedHeight = Math.abs(bound.height);
                    (newBlock as any).pathString = poly.relative(bound.leftTop).pathString(false);
                    if (isMounted) newBlock.forceUpdate();
                }
            },
            async moveEnd(ev, isMove, data) {
                if (isMove && newBlock) {
                    await kit.page.onAction('onBoardToolCreateBlockResize', async () => {
                        path.simplify(100);
                        var bound = path.bounds;
                        path.translate(new paper.Point(0 - bound.left, 0 - bound.top))
                        var ma = new Matrix();
                        ma.translate(bound.left, bound.top);
                        newBlock.matrix = ma;
                        await newBlock.updateMatrix(newBlock.matrix, ma);
                        await newBlock.updateProps({
                            fixedWidth: bound.width,
                            fixedHeight: bound.height,
                            viewBox: `0 0 ${bound.width} ${bound.height}`,
                            pathString: path.pathData
                        })
                        path.remove();
                        if (isMounted) newBlock.forceUpdate();
                        kit.picker.onPicker([newBlock], true);
                    });
                }
                kit.boardSelector.clearSelector();
            }
        })
    }
}
