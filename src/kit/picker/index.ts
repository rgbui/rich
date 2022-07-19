
import React from "react";
import { Kit } from "..";
import { Line, PortLocation } from "../../../blocks/board/line/line";
import { forceCloseBoardEditTool } from "../../../extensions/board.edit.tool";
import { useShapeSelector } from "../../../extensions/shapes/box";

import { util } from "../../../util/util";
import { Block } from "../../block";
import { BlockRenderRange } from "../../block/enum";
import { BoardBlockSelector, BoardPointType } from "../../block/partial/board";
import { MouseDragger } from "../../common/dragger";
import { Matrix } from "../../common/matrix";
import { Point, PointArrow } from "../../common/vector/point";
import { ActionDirective } from "../../history/declare";
import { openBoardEditTool } from "../operator/board/edit";
import { BlockPickerView } from "./view";

export class BlockPicker {
    kit: Kit;
    view: BlockPickerView;
    constructor(kit: Kit) {
        this.kit = kit;
    }
    visible: boolean = false;
    blocks: Block[] = [];
    onPicker(blocks: Block[]) {
        this.blocks = blocks;
        this.visible = true;
        if (this.view)
            this.view.forceUpdate();
    }
    onRePicker() {
        this.blocks.forEach(bl => {
            bl.updateRenderLines();
        });
        if (this.view)
            this.view.forceUpdate();
    }
    onShiftPicker(blocks: Block[]) {
        blocks.each(b => {
            if (!this.blocks.some(g => g == b)) this.blocks.push(b)
        })
        this.visible = true;
        this.view.forceUpdate();
    }
    onCancel() {
        this.visible = false;
        this.blocks = [];
        if (this.view)
            this.view.forceUpdate();
    }
    onMove(from: Point, to: Point) {
        this.blocks.forEach(bl => {
            var matrix = new Matrix();
            matrix.translateMove(bl.globalWindowMatrix.inverseTransform(from), bl.globalWindowMatrix.inverseTransform(to))
            bl.moveMatrix = matrix;
            bl.updateRenderLines();
            bl.forceUpdate()
        });
        this.view.forceUpdate();
    }
    async onMoveEnd(from: Point, to: Point) {
        this.kit.page.onAction(ActionDirective.onMove, async () => {
            await this.blocks.eachAsync(async (bl) => {
                var matrix = new Matrix();
                matrix.translateMove(bl.globalWindowMatrix.inverseTransform(from), bl.globalWindowMatrix.inverseTransform(to))
                var newMatrix = bl.matrix.clone();
                newMatrix.append(matrix);
                bl.updateMatrix(bl.matrix, newMatrix);
                bl.moveMatrix = new Matrix();
                if (!bl.isFrame) {
                    var rs = bl.findFramesByIntersect();
                    if (rs.length > 0 && !rs.some(s => s === bl.parent)) {
                        var fra = rs[0];
                        await fra.append(bl);
                        var r = bl.getTranslation().relative(fra.getTranslation());
                        var nm = new Matrix();
                        nm.translate(r);
                        nm.rotate(bl.matrix.getRotation(), { x: 0, y: 0 });
                        bl.updateMatrix(bl.matrix, nm);
                    }
                    else if (rs.length == 0 && bl.parent?.isFrame) {
                        var fra = bl.parent;
                        await fra.parent.append(bl);
                        var r = bl.getTranslation().base(fra.getTranslation());
                        var nm = new Matrix();
                        nm.translate(r);
                        nm.rotate(bl.matrix.getRotation(), { x: 0, y: 0 });
                        bl.updateMatrix(bl.matrix, nm);
                    }
                }
            });
        })
    }
    onResizeBlock(block: Block, arrows: PointArrow[], event: React.MouseEvent) {
        event.stopPropagation();
        block.onResizeBoardSelector(arrows, event);
    }
    async onCreateBlockConnect(block: Block, arrows: PointArrow[], event: React.MouseEvent) {
        event.stopPropagation();
        var fra: Block = block ? block.frameBlock : this.kit.page.getPageFrame();
        var newBlock: Block;
        var isMounted: boolean = false;
        var gm = fra.globalWindowMatrix;
        var re = gm.inverseTransform(Point.from(event));
        var self = this;
        fra.page.onAction(ActionDirective.onBoardToolCreateBlock, () => {
            return new Promise((resolve: () => void, reject) => {
                async function createConnectLine() {
                    var data = { url: '/line' } as Record<string, any>;
                    data.from = { x: arrows[1], y: arrows[0], blockId: block.id };
                    data.to = { x: re.x, y: re.y };
                    newBlock = await self.kit.page.createBlock(data.url, data, fra);
                    block.conectLine(newBlock);
                    newBlock.mounted(() => {
                        isMounted = true;
                    });
                    self.kit.boardLine.onStartConnectOther();
                    if (newBlock) self.kit.boardLine.line = newBlock;
                    newBlock.parent.forceUpdate();
                }
                MouseDragger({
                    event,
                    moveStart() {
                        forceCloseBoardEditTool()
                        createConnectLine();
                    },
                    move(ev, data) {
                        if (newBlock) {
                            var tr = gm.inverseTransform(Point.from(ev));
                            (newBlock as any).to = { x: tr.x, y: tr.y };
                            if (isMounted) newBlock.forceUpdate();
                        }
                    },
                    async moveEnd(ev, isMove, data) {
                        if (newBlock) {
                            if (self.kit.boardLine.over) {
                                await newBlock.updateProps({
                                    to: {
                                        blockId: self.kit.boardLine.over.block.id,
                                        x: self.kit.boardLine.over.selector.arrows[1],
                                        y: self.kit.boardLine.over.selector.arrows[0]
                                    }
                                });
                                self.kit.boardLine.over.block.conectLine(newBlock);
                            }
                            else {
                                var s = await useShapeSelector({ roundPoint: Point.from(ev) });
                                if (s) {
                                    var da: Record<string, any> = { svg: s.svg, svgName: s.name };
                                    var ma = new Matrix();
                                    re = gm.inverseTransform(Point.from(ev));
                                    ma.translate(re.x, re.y);
                                    da.matrix = ma.getValues();
                                    var shapeBlock = await fra.page.createBlock('/shape', da, fra);
                                    var pickers = shapeBlock.getBlockBoardSelector([BoardPointType.pathConnectPort]);
                                    await newBlock.updateProps({
                                        to: {
                                            blockId: shapeBlock.id,
                                            x: pickers[0].arrows[1],
                                            y: pickers[0].arrows[0]
                                        }
                                    });
                                    shapeBlock.conectLine(newBlock);
                                }
                                else {
                                    var tr = gm.inverseTransform(Point.from(ev));
                                    await newBlock.updateProps({
                                        to: { x: tr.x, y: tr.y }
                                    });
                                }
                            }
                            if (isMounted) newBlock.forceUpdate();
                        }
                        self.kit.boardLine.onEndConnectOther();
                        resolve();
                    }
                });
            })
        })
    }
    async onSplitLinePort(block: Line, selector: BoardBlockSelector, event: React.MouseEvent) {
        event.stopPropagation();
        var gm = block.globalWindowMatrix;
        var po: PortLocation;
        var self = this;
        MouseDragger({
            event,
            moveStart(ev) {
                forceCloseBoardEditTool()
                var tr = gm.inverseTransform(Point.from(ev));
                po = { x: tr.x, y: tr.y } as PortLocation;
                block.points.insertAt(selector.data.at, po);
                self.onRePicker();
                block.forceUpdate();
            },
            move(ev, data) {
                if (po) {
                    var tr = gm.inverseTransform(Point.from(ev));
                    po.x = tr.x;
                    po.y = tr.y;
                    self.onRePicker();
                    block.forceUpdate();
                }
            },
            async moveEnd(ev, isMove, data) {
                if (isMove) {
                    var ps = block.points.find(g => g != po);
                    block.onManualUpdateProps({ points: ps }, { points: block.points }, BlockRenderRange.self);
                    self.onRePicker();
                    block.forceUpdate();
                    await openBoardEditTool(self.kit);
                }
            }
        });
    }
    async onMovePortBlock(block: Line, selector: BoardBlockSelector, event: React.MouseEvent) {
        event.stopPropagation();
        var gm = block.globalWindowMatrix;
        var self = this;
        if (selector.data.at == 0 || selector.data.at == block.points.length + 1) {
            var oldData = { from: util.clone(block.from), to: util.clone(block.to) };
            this.kit.boardLine.onStartConnectOther();
            this.kit.boardLine.line = block;
            var key = selector.data.at == 0 ? "from" : "to";
            MouseDragger({
                event,
                moveStart() {
                    forceCloseBoardEditTool()
                },
                moving(ev, data, isEnd) {
                    var point = gm.inverseTransform(Point.from(ev));
                    block[key] = { x: point.x, y: point.y };
                    block.forceUpdate();
                    self.view.forceUpdate();
                    if (isEnd) {
                        if (self.kit.boardLine.over) {
                            block[key] = {
                                blockId: self.kit.boardLine.over.block.id,
                                x: self.kit.boardLine.over.selector.arrows[1],
                                y: self.kit.boardLine.over.selector.arrows[0]
                            };
                        }
                        block.onUpdateLine(block.from, block.to, oldData);
                    }
                },
                async moveEnd() {
                    self.kit.boardLine.onEndConnectOther();
                    await openBoardEditTool(self.kit);
                }
            });
        }
        else {
            var oldProps = { points: util.clone(block.points) };
            var point = block.points[selector.data.at - 1];
            var pre = block.points[selector.data.at - 2];
            var next = block.points[selector.data.at];
            MouseDragger({
                event,
                moveStart() {
                    forceCloseBoardEditTool()
                },
                async moving(ev, data, isEnd) {
                    var current = gm.inverseTransform(Point.from(ev));
                    point.x = current.x;
                    point.y = current.y;
                    if (isEnd) {
                        var r = block.realPx(5);
                        if (pre && new Point(pre.x as number, pre.y as number).nearBy(new Point(point.x as number, point.y as number), r)) {
                            block.points.remove(g => g === pre);
                        }
                        if (next && new Point(next.x as number, next.y as number).nearBy(new Point(point.x as number, point.y as number), r)) {
                            block.points.remove(g => g === next);
                        }
                        block.onManualUpdateProps(oldProps, { points: block.points });
                        await openBoardEditTool(self.kit);
                    }
                    block.forceUpdate();
                    self.view.forceUpdate();
                }
            });
        }
    }
    async onRotateBlock(block: Block, selector: BoardBlockSelector, event: React.MouseEvent) {
        event.stopPropagation();
        var center: Point = selector.data.center;
        var gm = block.globalWindowMatrix.clone();
        var re = gm.inverseTransform(Point.from(event));
        var d = 180 / Math.PI;
        var angle = Math.atan2(re.y - center.y, re.x - center.x) * d + 180;
        var ma = block.moveMatrix;
        var self = this;
        MouseDragger({
            event,
            moveStart() {
                forceCloseBoardEditTool();
            },
            moving(ev, data, isEnd) {
                var pos = gm.inverseTransform(Point.from(ev));
                var toAngle = Math.atan2(pos.y - center.y, pos.x - center.x) * d + 180;
                var r = toAngle - angle;
                if (Math.abs(r) > 180) {
                    if (toAngle < angle) r = toAngle + 360 - angle
                    else r = toAngle - 360 - angle;
                }
                var mc = ma.clone();
                mc.rotate(r, center);
                block.moveMatrix = mc;
                block.updateRenderLines();
                block.view.forceUpdate();
                self.view.forceUpdate();
                if (isEnd) {
                    block.page.onAction(ActionDirective.onRotate, async () => {
                        block.updateMatrix(block.matrix, block.matrix.appended(block.moveMatrix));
                        block.moveMatrix = new Matrix();
                    })
                }
            },
            async moveEnd() {
                await openBoardEditTool(self.kit);
            }
        });
    }
    async onPickerMousedown(block: Block, selector: BoardBlockSelector, event: React.MouseEvent) {
        event.stopPropagation();
        await block.onPickerMousedown(selector, event);
    }
}