import { util } from "echarts";
import { Kit } from "../..";
import { Pen } from "../../../../blocks/board/pen";
import { Block } from "../../../block";
import { BlockUrlConstant } from "../../../block/constant";
import { MouseDragger } from "../../../common/dragger";
import { Matrix } from "../../../common/matrix";
import { Point } from "../../../common/vector/point";
import { Polygon } from "../../../common/vector/polygon";
import { ActionDirective } from "../../../history/declare";
import { loadPaper } from "../../../paper";

export async function CheckBoardTool(kit: Kit, block: Block, event: React.MouseEvent) {
    if (kit.boardSelector.isSelector) {
        var paper = await loadPaper();
        var fra: Block = block ? block.frameBlock : kit.page.getPageFrame();
        var gm = fra.globalWindowMatrix;
        var re = gm.inverseTransform(Point.from(event));
        var url = kit.boardSelector.currentSelector.url;
        if (url == BlockUrlConstant.Pen || url == BlockUrlConstant.Mind || url == BlockUrlConstant.TextSpan || url == BlockUrlConstant.Frame) {
            await fra.page.onAction(ActionDirective.onBoardToolCreateBlock, async () => {
                var data = kit.boardSelector.currentSelector.data || {};
                var ma = new Matrix();
                ma.translate(re.x, re.y);
                data.matrix = ma.getValues();
                var newBlock = await kit.page.createBlock(kit.boardSelector.currentSelector.url, data, fra);
                kit.boardSelector.clearSelector();
                newBlock.mounted(() => {
                    if (url == BlockUrlConstant.Frame) {
                        kit.picker.onPicker([newBlock]);
                    }
                    else {
                        kit.picker.onPicker([newBlock]);
                        kit.anchorCursor.onFocusBlockAnchor(newBlock, { render: true, merge: true });
                    }
                })
            });
        }
        else if (url == BlockUrlConstant.Line) {
            var newBlock: Block;
            var isMounted: boolean = false;
            await fra.page.onAction(ActionDirective.onBoardToolCreateBlock, async () => {
                var data = kit.boardSelector.currentSelector.data || {};
                data.from = { x: re.x, y: re.y };
                data.to = util.clone(data.from);
                newBlock = await kit.page.createBlock(kit.boardSelector.currentSelector.url, data, fra);
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
                async moveEnd(ev, isMove, data) {
                    if (newBlock) {
                        if (kit.boardLine.over) {
                            (newBlock as any).to = {
                                blockId: kit.boardLine.over.block.id,
                                x: kit.boardLine.over.selector.arrows[1],
                                y: kit.boardLine.over.selector.arrows[0]
                            };
                            kit.boardLine.over.block.conectLine(newBlock);
                        }
                        else {
                            var tr = gm.inverseTransform(Point.from(ev));
                            (newBlock as any).to = { x: tr.x, y: tr.y };
                        }
                        if (isMounted) newBlock.forceUpdate();
                        kit.picker.onPicker([newBlock]);
                    }
                    kit.boardLine.onEndConnectOther();
                    kit.boardSelector.clearSelector();
                }
            })
        }
        else if (url == BlockUrlConstant.Shape) {
            var newBlock: Block;
            var isMounted: boolean = false;
            await fra.page.onAction(ActionDirective.onBoardToolCreateBlock, async () => {
                var data = kit.boardSelector.currentSelector.data || {};
                var ma = new Matrix();
                ma.translate(re.x, re.y);
                data.matrix = ma.getValues();
                newBlock = await kit.page.createBlock(kit.boardSelector.currentSelector.url, data, fra);
                newBlock.fixedWidth = 0;
                newBlock.fixedHeight = 0;
                kit.boardSelector.clearSelector();
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
                        kit.picker.onPicker([newBlock]);
                        kit.anchorCursor.onFocusBlockAnchor(newBlock, { render: true, merge: true });
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
            await fra.page.onAction(ActionDirective.onBoardToolCreateBlock, async () => {
                var data = kit.boardSelector.currentSelector.data || {};
                newBlock = await kit.page.createBlock(kit.boardSelector.currentSelector.url, data, fra);
                points.push(re);
                path = new paper.Path({ segments: [{ x: re.x, y: re.y }] });
                newBlock.fixedWidth = 0;
                newBlock.fixedHeight = 0;
                newBlock.mounted(() => {
                    isMounted = true;
                })
            });
            MouseDragger({
                event,
                move(ev, data) {
                    if (newBlock) {
                        var tr = gm.inverseTransform(Point.from(ev));
                        path.add([tr.x, tr.y]);
                        var ma = new Matrix();
                        points.push(tr);
                        var poly = new Polygon(...points);
                        var bound = poly.bound;
                        ma.translate(bound.x, bound.y);
                        newBlock.matrix = ma;
                        newBlock.fixedWidth = Math.abs(bound.width);
                        newBlock.fixedHeight = Math.abs(bound.height);
                        (newBlock as any).pathString = poly.relative(bound.leftTop).pathString(false);
                        if (isMounted) newBlock.forceUpdate();
                    }
                },
                moveEnd(ev, isMove, data) {
                    if (newBlock) {
                        path.simplify(100);
                        var bound = path.bounds;
                        path.translate(new paper.Point(0 - bound.left, 0 - bound.top))
                        var ma = new Matrix();
                        ma.translate(bound.left, bound.top);
                        newBlock.matrix = ma;
                        newBlock.fixedWidth = bound.width;
                        newBlock.fixedHeight = bound.height;
                        (newBlock as Pen).viewBox = `0 0 ${bound.width} ${bound.height}`;
                        (newBlock as any).pathString = path.pathData;
                        path.remove();
                        if (isMounted) newBlock.forceUpdate();
                        kit.picker.onPicker([newBlock]);
                    }
                    kit.boardSelector.clearSelector();
                }
            })
        }
        return true;
    }
    return false;
}