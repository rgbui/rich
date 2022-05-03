import { util } from "echarts";
import { Kit } from "../..";
import { Pen } from "../../../../blocks/board/pen";
import { getBoardTool } from "../../../../extensions/board.tool";
import { Block } from "../../../block";
import { BlockUrlConstant } from "../../../block/constant";
import { MouseDragger } from "../../../common/dragger";
import { Matrix } from "../../../common/matrix";
import { Point } from "../../../common/vector/point";
import { Polygon } from "../../../common/vector/polygon";
import { ActionDirective } from "../../../history/declare";
import { loadPaper } from "../../../paper";
export async function CheckBoardTool(kit: Kit, block: Block, event: React.MouseEvent) {
    var toolBoard = await getBoardTool();
    if (toolBoard.isSelector) {
        var paper = await loadPaper();
        var fra: Block = block ? block.frameBlock : kit.page.getPageFrame();
        var gm = fra.globalWindowMatrix;
        var re = gm.inverseTransform(Point.from(event));
        var url = toolBoard.currentSelector.url;
        if (url == '/note' || url == '/flow/mind' || url == BlockUrlConstant.TextSpan || url == BlockUrlConstant.Frame) {
            await fra.onAction(ActionDirective.onBoardToolCreateBlock, async () => {
                var data = toolBoard.currentSelector.data || {};
                var ma = new Matrix();
                ma.translate(re.x, re.y);
                data.matrix = ma.getValues();
                var newBlock = await kit.page.createBlock(toolBoard.currentSelector.url, data, fra);
                toolBoard.clearSelector();
                newBlock.mounted(() => {
                    if (url == BlockUrlConstant.Frame) {
                        kit.picker.onPicker([newBlock]);
                    }
                    else {
                        kit.picker.onPicker([newBlock]);
                        kit.writer.onFocusBlockAnchor(newBlock);
                    }
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
                    toolBoard.clearSelector();
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
                        kit.picker.onPicker([newBlock]);
                        kit.writer.onFocusBlockAnchor(newBlock);
                    }
                    toolBoard.clearSelector();
                }
            })
        }
        else if (url == '/pen') {
            var newBlock: Block;
            var isMounted: boolean = false;
            var path: paper.Path;
            var points: { x: number, y: number }[] = [];
            await fra.onAction(ActionDirective.onBoardToolCreateBlock, async () => {
                var data = toolBoard.currentSelector.data || {};
                newBlock = await kit.page.createBlock(toolBoard.currentSelector.url, data, fra);
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
                    toolBoard.clearSelector();

                }
            })
        }
        return true;
    }
    return false;
}