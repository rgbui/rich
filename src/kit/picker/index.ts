
import React from "react";
import { Kit } from "..";
import { Line } from "../../../blocks/board/line/line";
import { util } from "../../../util/util";
import { Block } from "../../block";
import { BoardBlockSelector } from "../../block/partial/board";
import { MouseDragger } from "../../common/dragger";
import { Matrix } from "../../common/matrix";
import { Point, PointArrow, Rect } from "../../common/vector/point";
import { ActionDirective } from "../../history/declare";
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
        if (this.view)
            this.view.forceUpdate();
    }
    onMove(from: Point, to: Point) {
        this.blocks.forEach((bl) => {
            var matrix = new Matrix();
            matrix.translateMove(bl.globalWindowMatrix.inverseTransform(from), bl.globalWindowMatrix.inverseTransform(to))
            bl.moveMatrix = matrix;
            if (bl.lines.length > 0) {
                bl.lines.each(line => { line.forceUpdate() })
            }
            bl.forceUpdate()
        });
        this.view.forceUpdate();
    }
    onMoveEnd(from: Point, to: Point) {
        this.blocks.forEach((bl) => {
            var matrix = new Matrix();
            matrix.translateMove(bl.globalWindowMatrix.inverseTransform(from), bl.globalWindowMatrix.inverseTransform(to))
            bl.matrix.append(matrix);
            bl.moveMatrix = new Matrix();
            bl.forceUpdate();
            if (bl.lines.length > 0) {
                bl.lines.each(line => { line.forceUpdate() })
            }
        });
        this.view.forceUpdate();
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
        async function createConnectLine() {
            await fra.onAction(ActionDirective.onBoardToolCreateBlock, async () => {
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
            });
        }
        MouseDragger({
            event,
            moveStart() {
                createConnectLine();
            },
            move(ev, data) {
                if (newBlock) {
                    var tr = gm.inverseTransform(Point.from(ev));
                    (newBlock as any).to = { x: tr.x, y: tr.y };
                    if (isMounted) newBlock.forceUpdate();
                }
            },
            moveEnd(ev, isMove, data) {
                if (newBlock) {
                    if (self.kit.boardLine.over) {
                        (newBlock as any).to = {
                            blockId: self.kit.boardLine.over.block.id,
                            x: self.kit.boardLine.over.selector.arrows[1],
                            y: self.kit.boardLine.over.selector.arrows[0]
                        };
                        self.kit.boardLine.over.block.conectLine(newBlock);
                    }
                    else {
                        var tr = gm.inverseTransform(Point.from(ev));
                        (newBlock as any).to = { x: tr.x, y: tr.y };
                    }
                    if (isMounted) newBlock.forceUpdate();
                }
                self.kit.boardLine.onEndConnectOther()
            }
        });
    }
    async onMovePortBlock(block: Line, arrows: PointArrow[], event: React.MouseEvent) {
        event.stopPropagation();
        var gm = block.globalWindowMatrix;
        var oldData = { from: util.clone(block.from), to: util.clone(block.to) };
        var self = this;
        this.kit.boardLine.onStartConnectOther();
        this.kit.boardLine.line = block;
        var key = arrows.includes(PointArrow.from) ? 'from' : 'to';
        MouseDragger({
            event,
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
                    console.log(block[key]);
                    block.onUpdateLine(block.from, block.to, oldData);
                }
            },
            moveEnd() {
                self.kit.boardLine.onEndConnectOther()
            }
        });
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
                block.lines.each(line => { line.forceUpdate() })
                block.view.forceUpdate();
                self.view.forceUpdate();
                if (isEnd) {
                    block.onAction(ActionDirective.onRotate, async () => {
                        block.updateMatrix(block.matrix, block.matrix.appended(block.moveMatrix));
                        block.moveMatrix = new Matrix();
                    })
                }
            }
        });
    }
}